import CoachingPresentation
import Foundation
import Observation

/// The distance correction of one history row (NATIVE 7.5, `actual.declared`): a planned run the device measured and the athlete reported,
/// contested by the athlete. Its one write (`CoachingWriting.submit`) is a correction of the athlete's own report (`correctionOf` = their
/// voice's event id: without it the engine refuses it as ALREADY_REPORTED, `integration.mjs` admit), rebuilt from that voice with the
/// declared distance added, and sent with the eligibility screen the athlete answers here (the engine records a report only under a current
/// screen, `r6-adaptation.mjs` eligibility.currentAssessment; it is never assumed). "Salvo" only when the record keeps what the answer
/// recorded (GAP-12). After an `ok` answer the record is read again (`reload`, CODE_AND_ARCHITECTURE §2).
///
/// Never offered (#59, fail closed): a row with no ATHLETE voice (its numbers are the device's), with several (which one is the athlete's is
/// not ours to pick), with a statement of the athlete that cannot be re-sent as stated (a stop or a response outside the shared enumerations:
/// a correction replaces the report, so dropping it would erase a safety signal), or whose day is not the day the plan in force holds for
/// its session (the report's day is the athlete's, and the row's may be the device's).
///
/// Known limits (shared projection, not ours to change): `LoggedVoice` carries no `seconds`, `conditions` or `walkBreaks`, so a report that
/// stated them would lose them on correction and this cannot detect it (no V1 athlete form sends them; a unit test fails if the run form
/// starts to). The corrected report has the day's precision only (no `observedAt`): the athlete part's own instant is not projected (a
/// contract change).
@Observable @MainActor
final class HistoryCorrectionViewModel {
    enum Phase: Equatable {
        case idle
        case editing
        /// The correction is in flight: a second tap does nothing.
        case submitting
        case saved
        case notKept
    }

    private(set) var phase: Phase = .idle
    /// What the athlete types, as typed ("12,4" or "12.4").
    var km = ""
    var reason: DeclaredDistanceReason = .signalLoss
    /// Six flags, nil until answered (never false by default), and the athlete's nonclinical confirmation; dated when sent.
    var eligibility = EligibilityScreen(status: nil, assessedAt: "", pain: nil, persistentPain: nil, injury: nil, illness: nil, functionalLimitation: nil, clinicalConcern: nil)
    /// The engine asked for the warning-sign screen (a stop for a symptom, re-sent with the correction, raises it again). Sticky.
    private(set) var screenRequired = false
    /// The answer routes to a qualified human (a flag answered yes here, or a clinical dependency on record).
    private(set) var clinical = false

    let entry: LoggedEntry
    /// The date the plan in force holds for the row's session (nil when it holds none).
    let sessionDate: String?
    private let writer: CoachingWriting
    private let planToday: () -> String?
    private let reload: @MainActor () async -> Void

    /// `reload` is `AppModel.load`; `planToday` the plan's own today (the screen's date; no plan, no correction).
    init(entry: LoggedEntry, sessionDate: String?, writer: CoachingWriting, planToday: @escaping () -> String?, reload: @escaping @MainActor () async -> Void) {
        self.entry = entry; self.sessionDate = sessionDate; self.writer = writer; self.planToday = planToday; self.reload = reload
    }

    var canContest: Bool { Self.canContest(entry) && sessionDate == entry.date }
    var canSend: Bool { phase == .editing && Self.usable(Self.distance(km)) && Self.answered(eligibility) }

    /// The date the plan in force holds for a row's session (the day the athlete's report of it stated): nil when it holds no such session,
    /// or more than one date for it.
    static func sessionDate(of e: LoggedEntry, in weeks: [Week]) -> String? {
        guard let id = e.sessionId else { return nil }
        let dates = Set(weeks.flatMap(\.sessions).filter { $0.id == id }.map(\.date))
        return dates.count == 1 ? dates.first : nil
    }

    /// A distance the engine will read (SSCTR #59 P2-1): within the bounds it reads a declared distance in (0.01–300 km, `RUN_FORMATS_V1.json`
    /// `runDistanceKmMax`, `v1-run-history.mjs` distanceFacts). Outside them "Salvo" would show a correction the engine ignores, and the row
    /// could not be contested again. No pace check: the engine applies its pace window to measured distances only, and the athlete's minutes
    /// may cover less than the recording (a conflicted row).
    static func usable(_ km: Double?) -> Bool { km.map { $0 >= 0.01 && $0 <= 300 } ?? false }

    /// Opens the form, only on a row that can be contested.
    func startContesting() { if phase == .idle, canContest { phase = .editing } }

    /// Sends the correction once. `apply` wraps the change to the result (the view's animation; plain in tests).
    func send(applying apply: (_ change: () -> Void) -> Void = { $0() }) async {
        guard canSend, canContest, let request = request() else { return }
        phase = .submitting
        let out = await writer.submit(request)
        apply {
            phase = Self.saved(out) ? .saved : .notKept
            screenRequired = screenRequired || (out.answer.ok && out.answer.warningSignScreen?.status.raw == "REQUIRED")
            clinical = out.answer.routesToHuman
        }
        if out.answer.ok { await reload() }
    }

    /// The request exactly as sent: the correction and the screen, dated the plan's today (never the device's: no plan, no request).
    func request() -> ReviewRequest? {
        guard let d = Self.distance(km), let today = planToday(), let obs = Self.observation(entry: entry, distanceKm: d, reason: reason) else { return nil }
        return Self.request(obs, eligibility: eligibility, today: today)
    }

    static func request(_ obs: AthleteObservation, eligibility: EligibilityScreen, today: String) -> ReviewRequest? {
        guard answered(eligibility) else { return nil }
        var e = eligibility; e.assessedAt = today
        return ReviewRequest(.sessionReports([obs]), eligibility: e)
    }

    /// Every flag answered, and either one answered yes (the engine routes it to a human) or the athlete confirmed none applies: the one rule
    /// every athlete screen uses (`EligibilityScreen.answered`, #68).
    static func answered(_ e: EligibilityScreen) -> Bool { e.answered }

    /// A planned run the device measured, that the athlete reported (exactly one ATHLETE voice, #59, re-sendable as stated) and nobody contested yet.
    static func canContest(_ e: LoggedEntry) -> Bool {
        e.sessionId != nil && e.measuredKm != nil && e.contested == nil && e.sport?.raw == "RUN" && athleteVoice(e).flatMap(statement) != nil
    }

    /// The athlete's own voice of the row: the one ATHLETE voice, else none (no voice, or several that the UI must not choose between).
    static func athleteVoice(_ e: LoggedEntry) -> LoggedVoice? {
        let mine = e.voices.filter { $0.channel.raw == "ATHLETE" }
        return mine.count == 1 ? mine.first : nil
    }

    /// The typed distance, with a comma or a point as the decimal separator.
    static func distance(_ text: String) -> Double? { Double(text.replacingOccurrences(of: ",", with: ".")) }

    /// What the voice states that the shared types can carry again unchanged: its stop and its responses. Nil when one of them is a value the
    /// enumerations do not hold (e.g. a stop `UNSTATED`): re-sent without it, the correction would erase it (fail closed).
    static func statement(_ v: LoggedVoice) -> (stop: RunStop?, response: SessionResponse)? {
        guard let stop = resend(v.stopReason, as: StopReason.self), let p = resend(v.response?.performance, as: PerformanceResponse.self),
              let r = resend(v.response?.recovery, as: RecoveryResponse.self), let e = resend(v.response?.effort, as: EffortResponse.self),
              let n = resend(v.response?.nextDayFunction, as: NextDayFunctionResponse.self) else { return nil }
        return (stop.map(RunStop.init(reason:)), SessionResponse(performance: p ?? .unknown, recovery: r ?? .unknown, effort: e ?? .unknown, nextDayFunction: n ?? .unknown))
    }

    /// Not stated → `.some(nil)`; stated and held by the enumeration → `.some(value)`; stated and not held → nil (cannot be re-sent).
    private static func resend<T: RawRepresentable>(_ c: Code?, as _: T.Type) -> T?? where T.RawValue == String {
        guard let c else { return .some(nil) }
        guard let v = T(rawValue: c.raw) else { return nil }
        return .some(v)
    }

    /// The correction of the athlete's own report: their voice (completed, minutes, their own declared distance, RPE, stop, responses) with
    /// the contested distance added, naming that voice's event id. A correction replaces the report in force, so what the voice stated is
    /// re-sent as stated (QRE #59 P1: their declared distance stays theirs; the engine reads the contest first). Nothing the athlete did not state: a response the voice lacks is `.unknown`, minutes it lacks stay absent (never
    /// the row's, which may be the device's). The day is the row's, which `canContest` holds to the plan's day for the session (what the
    /// athlete's report stated); no `observedAt` is sent, because the voice does not carry the athlete's own instant and the row's may be the
    /// device's (the engine then reads the report at the end of that day). No single, re-sendable athlete voice, no observation (#59).
    static func observation(entry: LoggedEntry, distanceKm: Double, reason: DeclaredDistanceReason) -> AthleteObservation? {
        guard let id = entry.sessionId, let mine = athleteVoice(entry), let said = statement(mine) else { return nil }
        return AthleteObservation.plannedRun(sessionId: id, occurrenceDate: entry.date, observedAt: nil,
                                             actual: PlannedRunActual(completed: mine.completed, minutes: mine.minutes, declaredDistanceKm: mine.declaredKm, rpe: mine.rpe, stop: said.stop,
                                                                      declared: ContestedDistance(distanceKm: distanceKm, reason: reason)),
                                             response: said.response)
            .correcting(eventId: mine.eventId)
    }

    /// Saved only when the answer is ok and the record keeps one of the events it recorded.
    static func saved(_ out: WriteOutcome) -> Bool { out.answer.ok && !(out.answer.recorded ?? []).filter(out.kept.contains).isEmpty }
}
