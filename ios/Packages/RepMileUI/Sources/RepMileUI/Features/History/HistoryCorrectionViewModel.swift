import CoachingPresentation
import Foundation
import Observation

/// The distance correction of one history row (NATIVE 7.5, `actual.declared`): a planned run the device measured and the athlete reported,
/// contested by the athlete. Its one write (`CoachingWriting.submit`) is the athlete's own report again, built from the row's ATHLETE voice,
/// with the declared distance added. "Salvo" only when the record keeps what the answer recorded (GAP-12). After an `ok` answer the record is
/// read again (`reload`, CODE_AND_ARCHITECTURE §2): the row shows the correction and is not offered again. A row with no ATHLETE voice is
/// never offered (#59, fail closed): its completed and minutes are the device's, and would be sent as the athlete's statement.
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

    let entry: LoggedEntry
    private let writer: CoachingWriting
    private let reload: @MainActor () async -> Void

    /// `reload` is `AppModel.load`.
    init(entry: LoggedEntry, writer: CoachingWriting, reload: @escaping @MainActor () async -> Void) {
        self.entry = entry; self.writer = writer; self.reload = reload
    }

    var canContest: Bool { Self.canContest(entry) }
    var canSend: Bool { phase == .editing && Self.distance(km) != nil }

    /// Opens the form, only on a row that can be contested.
    func startContesting() { if phase == .idle, canContest { phase = .editing } }

    /// Sends the correction once. `apply` wraps the change to the result (the view's animation; plain in tests).
    func send(applying apply: (_ change: () -> Void) -> Void = { $0() }) async {
        guard canSend, let d = Self.distance(km), let obs = Self.observation(entry: entry, distanceKm: d, reason: reason) else { return }
        phase = .submitting
        let out = await writer.submit(ReviewRequest(.sessionReports([obs]), eligibility: nil))
        apply { phase = Self.saved(out) ? .saved : .notKept }
        if out.answer.ok { await reload() }
    }

    /// A planned run the device measured, that the athlete reported (an ATHLETE voice, #59) and nobody contested yet.
    static func canContest(_ e: LoggedEntry) -> Bool {
        e.sessionId != nil && e.measuredKm != nil && e.contested == nil && e.sport?.raw == "RUN" && athleteVoice(e) != nil
    }

    /// The athlete's own voice of the row, if any.
    static func athleteVoice(_ e: LoggedEntry) -> LoggedVoice? { e.voices.first { $0.channel.raw == "ATHLETE" } }

    /// The typed distance, with a comma or a point as the decimal separator.
    static func distance(_ text: String) -> Double? { Double(text.replacingOccurrences(of: ",", with: ".")) }

    /// The athlete's own report of the row (their voice: completed, minutes, RPE, stop, responses), with the declared distance. Nothing the
    /// athlete did not state: a response the voice lacks is `.unknown`. No athlete voice, no observation (#59): the device's numbers are
    /// never sent as the athlete's statement.
    static func observation(entry: LoggedEntry, distanceKm: Double, reason: DeclaredDistanceReason) -> AthleteObservation? {
        guard let id = entry.sessionId, let mine = athleteVoice(entry) else { return nil }
        let response = SessionResponse(performance: PerformanceResponse(rawValue: mine.response?.performance?.raw ?? "") ?? .unknown,
                                       recovery: RecoveryResponse(rawValue: mine.response?.recovery?.raw ?? "") ?? .unknown,
                                       effort: EffortResponse(rawValue: mine.response?.effort?.raw ?? "") ?? .unknown,
                                       nextDayFunction: NextDayFunctionResponse(rawValue: mine.response?.nextDayFunction?.raw ?? "") ?? .unknown)
        return AthleteObservation.plannedRun(sessionId: id, occurrenceDate: entry.date, observedAt: entry.observedAt,
                                             actual: PlannedRunActual(completed: mine.completed, minutes: mine.minutes ?? entry.minutes, rpe: mine.rpe,
                                                                      stop: mine.stopReason.flatMap { StopReason(rawValue: $0.raw) }.map(RunStop.init(reason:)),
                                                                      declared: ContestedDistance(distanceKm: distanceKm, reason: reason)),
                                             response: response)
    }

    /// Saved only when the answer is ok and the record keeps one of the events it recorded.
    static func saved(_ out: WriteOutcome) -> Bool { out.answer.ok && !(out.answer.recorded ?? []).filter(out.kept.contains).isEmpty }
}
