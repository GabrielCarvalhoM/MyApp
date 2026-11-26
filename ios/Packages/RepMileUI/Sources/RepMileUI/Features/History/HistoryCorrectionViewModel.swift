import CoachingPresentation
import Foundation
import Observation

/// The distance correction of one history row (NATIVE 7.5, `actual.declared`): a planned run the device measured, contested by the athlete.
/// Its one write (`CoachingWriting.submit`) is the athlete's own report again, built from the row's ATHLETE voice, with the declared
/// distance added. "Salvo" only when the record keeps what the answer recorded (GAP-12).
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

    init(entry: LoggedEntry, writer: CoachingWriting) { self.entry = entry; self.writer = writer }

    var canContest: Bool { Self.canContest(entry) }
    var canSend: Bool { phase == .editing && Self.distance(km) != nil }

    func startContesting() { if phase == .idle { phase = .editing } }

    /// Sends the correction once. `apply` wraps the change to the result (the view's animation; plain in tests).
    func send(applying apply: (_ change: () -> Void) -> Void = { $0() }) async {
        guard canSend, let d = Self.distance(km), let obs = Self.observation(entry: entry, distanceKm: d, reason: reason) else { return }
        phase = .submitting
        let out = await writer.submit(ReviewRequest(.sessionReports([obs]), eligibility: nil))
        apply { phase = Self.saved(out) ? .saved : .notKept }
    }

    /// A planned run the device measured and nobody contested yet.
    static func canContest(_ e: LoggedEntry) -> Bool { e.sessionId != nil && e.measuredKm != nil && e.contested == nil && e.sport?.raw == "RUN" }

    /// The typed distance, with a comma or a point as the decimal separator.
    static func distance(_ text: String) -> Double? { Double(text.replacingOccurrences(of: ",", with: ".")) }

    /// The athlete's own report of the row (their voice: completed, minutes, RPE, stop, responses), with the declared distance. Nothing the
    /// athlete did not state: a response the voice lacks is `.unknown`; with no athlete voice, the row's completed and minutes.
    static func observation(entry: LoggedEntry, distanceKm: Double, reason: DeclaredDistanceReason) -> AthleteObservation? {
        guard let id = entry.sessionId else { return nil }
        let mine = entry.voices.first { $0.channel.raw == "ATHLETE" }
        let response = SessionResponse(performance: PerformanceResponse(rawValue: mine?.response?.performance?.raw ?? "") ?? .unknown,
                                       recovery: RecoveryResponse(rawValue: mine?.response?.recovery?.raw ?? "") ?? .unknown,
                                       effort: EffortResponse(rawValue: mine?.response?.effort?.raw ?? "") ?? .unknown,
                                       nextDayFunction: NextDayFunctionResponse(rawValue: mine?.response?.nextDayFunction?.raw ?? "") ?? .unknown)
        return AthleteObservation.plannedRun(sessionId: id, occurrenceDate: entry.date, observedAt: entry.observedAt,
                                             actual: PlannedRunActual(completed: mine?.completed ?? entry.completed, minutes: mine?.minutes ?? entry.minutes, rpe: mine?.rpe,
                                                                      stop: mine?.stopReason.flatMap { StopReason(rawValue: $0.raw) }.map(RunStop.init(reason:)),
                                                                      declared: ContestedDistance(distanceKm: distanceKm, reason: reason)),
                                             response: response)
    }

    /// Saved only when the answer is ok and the record keeps one of the events it recorded.
    static func saved(_ out: WriteOutcome) -> Bool { out.answer.ok && !(out.answer.recorded ?? []).filter(out.kept.contains).isEmpty }
}
