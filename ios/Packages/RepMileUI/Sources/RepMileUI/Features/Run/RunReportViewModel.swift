import CoachingPresentation
import Foundation
import Observation
import RunRecorder

/// The athlete's report after a recording: what the athlete states and its one write (`CoachingWriting.submit`). It carries only completed,
/// minutes, RPE, a stop (planned runs only) and the response; a distance the iPhone measured never enters it (GAP-16). "Salvo" only after
/// `WriteOutcome.kept` (GAP-12). It carries the eligibility screen the athlete answers in the report (#68: the engine records no athlete
/// report without a current one; see `EligibilityScreen.unanswered`).
@Observable @MainActor
final class RunReportViewModel {
    enum Result: Equatable { case saved, notKept, failed(String), screenRequired }

    // The athlete's statements.
    var completed = true
    var minutes: Double
    var rpe: Double?
    var stopped = false
    var stopReason: StopReason?
    var effort: EffortResponse = .unknown
    /// "Parou ou sentiu algo fora do normal?" (unplanned runs, SSCTR-ABC-S1): no answer is not "no".
    var unusual: Bool?
    /// Answered here, for this report only (#68): nothing pre-answered, never an earlier report's screen.
    var eligibility = EligibilityScreen.unanswered

    private(set) var sending = false
    private(set) var result: Result?
    /// The engine asked for the warning-sign screen (`warningSignScreen.status == REQUIRED`). Apart from `result` and sticky for the life of
    /// this report: the instruction stands whether or not the report was kept, and after a later resend without it (increments 10, 10b).
    private(set) var screenRequired = false
    /// The answer routed to a qualified human (a flag answered yes, or a clinical dependency on record), with the engine's guidance level
    /// (#73). Sticky like `screenRequired`, and the level only rises over resends.
    private(set) var clinicalGuidance: ClinicalGuidance?
    var clinical: Bool { clinicalGuidance != nil }

    let recording: FinishedRecording
    private let writer: CoachingWriting
    private let planToday: () -> String?
    private let markReported: (String) -> Void
    private let now: () -> Date

    /// Planned or not comes from the recording itself, never from the loaded week (QRE R1 P1-7).
    var planned: Bool { recording.ref.sessionId != nil }

    init(recording: FinishedRecording, writer: CoachingWriting, planToday: @escaping () -> String?, markReported: @escaping (String) -> Void,
         now: @escaping () -> Date = Date.init) {
        self.recording = recording; self.writer = writer; self.planToday = planToday; self.markReported = markReported; self.now = now
        minutes = max(1, recording.movingMinutes.rounded())
        // A recording restored after a killed process may already be reported: never offer to send it a second time (QRE recheck N2).
        if recording.ref.reportedEventId != nil { result = .saved }
    }

    /// "Concluir" closes the report only once it is kept; a report that was not kept stays resendable (QRE recheck N7).
    var canClose: Bool { result == .saved || result == .screenRequired }

    var canSend: Bool { !sending && !canClose && (planned || unusual != nil) && (!stopped || stopReason != nil) && eligibility.answered
        && planToday() != nil }

    func send() async {
        guard canSend, let request = request() else { return }
        sending = true; defer { sending = false }
        let outcome = await writer.submit(request)
        let next = Self.result(for: outcome, screenRequiredBefore: screenRequired, clinicalBefore: clinicalGuidance)
        if case .kept(let id) = next.kept { markReported(id) }
        screenRequired = next.screenRequired
        clinicalGuidance = next.clinical
        result = next.result
    }

    /// The request exactly as sent: the athlete's report and the screen answered here, dated the plan's today (never the device's, as #59:
    /// the engine reads the screen against the plan's local day, and a device day ahead of it is a future screen, ASK). Nil until it is
    /// answered, and while no plan gives the day (the draft waits).
    func request() -> ReviewRequest? {
        guard let today = planToday(), let screen = eligibility.dated(today) else { return nil }
        return ReviewRequest(.sessionReports([observation()]), eligibility: screen)
    }

    /// `WriteOutcome` → what the report shows. Pure: tested without UI.
    enum Kept: Equatable { case kept(String), notKept }
    static func result(for outcome: WriteOutcome, screenRequiredBefore: Bool, clinicalBefore: ClinicalGuidance? = nil)
        -> (result: Result, screenRequired: Bool, clinical: ClinicalGuidance?, kept: Kept) {
        guard outcome.answer.ok else { return (.failed(outcome.answer.error?.code.raw ?? "UNKNOWN"), screenRequiredBefore, clinicalBefore, .notKept) }
        let id = outcome.answer.recorded?.first
        let kept = id.flatMap { outcome.kept.contains($0) ? Kept.kept($0) : nil } ?? .notKept
        let required = screenRequiredBefore || outcome.answer.warningSignScreen?.status.raw == "REQUIRED"
        let clinical = clinicalBefore.raised(to: outcome.answer.clinicalGuidance)
        switch (kept, required) {
        case (.kept, true): return (.screenRequired, true, clinical, kept)
        case (.kept, false): return (.saved, false, clinical, kept)
        case (.notKept, _): return (.notKept, required, clinical, kept)
        }
    }

    func observation() -> AthleteObservation {
        Self.makeObservation(planned: recording.ref.sessionId.flatMap { id in recording.sessionDate.map { (id, $0) } },
                             today: Self.occurrenceDay(end: recording.ref.end, planToday: planToday(), now: now()), end: recording.ref.end,
                             completed: completed, minutes: minutes, rpe: rpe, stop: stopped ? stopReason : nil, effort: effort)
    }

    /// The end of the recording with its offset (BoundaryInstant format).
    static func instant(_ d: Date) -> String {
        let f = ISO8601DateFormatter(); f.timeZone = .current; f.formatOptions = [.withInternetDateTime]
        return f.string(from: d)
    }

    /// The day an unplanned run happened: the device-local day of the recording's end, not the day it is reported (QRE recheck N5). The
    /// plan's own "today" is used only when it is that same day.
    static func occurrenceDay(end: Date, planToday: String?, now: Date = Date()) -> String {
        let endDay = Fmt.deviceDay(end)
        if let planToday, endDay == Fmt.deviceDay(now) { return planToday }
        return endDay
    }

    /// The report the form produces: only the athlete's statements. There is no parameter for a distance: the iPhone's measurement cannot
    /// reach a report by construction (GAP-16).
    static func makeObservation(planned: (sessionId: String, date: String)?, today: String, end: Date, completed: Bool, minutes: Double, rpe: Double?,
                                stop: StopReason?, effort: EffortResponse) -> AthleteObservation {
        let at = instant(end)
        let response = SessionResponse(performance: .unknown, recovery: .unknown, effort: planned == nil ? .unknown : effort, nextDayFunction: .unknown)
        if let s = planned {
            return .plannedRun(sessionId: s.sessionId, occurrenceDate: s.date, observedAt: at,
                               actual: PlannedRunActual(completed: completed && stop == nil, minutes: minutes, rpe: rpe, stop: stop.map(RunStop.init(reason:))),
                               response: response)
        }
        return .unplannedRun(occurrenceDate: today, observedAt: at, actual: UnplannedRunActual(completed: true, minutes: minutes, rpe: rpe), response: response)
    }
}
