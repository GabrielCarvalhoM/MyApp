import Foundation

/// `integration.presentation()`: the run sessions as prescribed (plan in force and pending proposal) and the last answer's readings.
/// Keyed by an opaque session key; `sessionId` repeats across plans, so a screen matches by `(sessionId, date)` of the plan in force.
public struct PresentationSnapshot: Decodable, Equatable, Sendable {
    public let version: Int
    public let inForce: [String: RunSessionPresentation]?
    public let pending: [String: RunSessionPresentation]?
    /// Null after an erasure took them, and before the first answer: the screens hide every reading then (never a zero).
    public let readings: Readings?

    /// The ONLY way a screen gets the steps of a run session (FND-ABC-05): the presentation is a projection, never canonical, and under a hold it
    /// still lists the future sessions' steps with `prescribed: false`. The steps are returned only when the PLAN VIEW prescribes `session`
    /// (non-null prescription, the plan in force, matched by session id and date); otherwise nil, and the screen shows no step.
    public func runSession(for session: PlannedSession) -> RunSessionPresentation? {
        guard session.prescription != nil, session.sport == "RUN" else { return nil }
        return inForce?.values.first { $0.sessionId == session.id && $0.date == session.date && $0.prescribed != false }
    }
    /// The execution recorded against a session, whatever the plan state (a past session under a hold keeps it).
    public func execution(sessionId: String, date: String) -> RunExecution? {
        inForce?.values.first { $0.sessionId == sessionId && $0.date == date }?.execution
    }
}

public struct RunSessionPresentation: Decodable, Equatable, Sendable {
    public let sessionId: String
    public let date: String
    public let week: Int
    public let role: Code?
    public let family: Code?
    /// TIME or DISTANCE: the form the engine prescribes. The app never converts one into the other.
    public let expression: Code
    public let pattern: Code?
    public let formatId: String?
    /// The prescribed steps. NIL under a hold (the engine withholds the prescription: only the identity, the role and any execution remain),
    /// so a blocked presentation decodes and shows nothing to run (mission 5.1, found by BlockedAndDescriptiveTests).
    public let blocks: [RunBlock]?
    /// A session of the past, kept for its execution only (under a hold).
    public let past: Bool?
    public let estimate: SessionEstimate?
    /// Why a native (distance) format is not used, e.g. PHASE_NOT_ELIGIBLE, CONTINUOUS_PACE_UNOBSERVED.
    public let unavailable: [String: String]?
    public let provisional: Bool?
    public let prescribed: Bool?
    public let instructions: [EngineText]?
    /// What was executed against this session (null until a report).
    public let execution: RunExecution?
}
public struct RunBlock: Decodable, Equatable, Sendable {
    public let repeat_: Int
    public let steps: [RunStep]
    enum CodingKeys: String, CodingKey { case repeat_ = "repeat", steps }
}
public struct RunStep: Decodable, Equatable, Sendable {
    /// WARMUP, STEADY, WORK, RECOVERY, STRIDES, STRIDES_RELAXED_FAST, COOLDOWN.
    public let kind: Code
    public let target: StepTarget
    public let intensity: StepIntensity?
    /// When true, effort rules over pace: the pace band is a ceiling/aid, never a target to chase.
    public let effortGoverns: Bool?
    /// An estimate for context (e.g. metres of a timed step), never a target.
    public let estimate: StepEstimate?
}
public struct StepTarget: Decodable, Equatable, Sendable {
    /// TIME (seconds) or DISTANCE (metres).
    public let type: Code
    public let seconds: Double?
    public let metres: Double?
}
public struct StepIntensity: Decodable, Equatable, Sendable {
    public let effortDomain: Code?
    /// RPE range on 0–10.
    public let rpe: [Double]?
    public let talk: EngineText?
    public let pace: PaceBand?
}
public struct PaceBand: Decodable, Equatable, Sendable {
    public let fastSecondsPerKm: Double
    public let slowSecondsPerKm: Double
    public let domain: Code?
}
public struct StepEstimate: Decodable, Equatable, Sendable {
    public let metres: ClosedRangeValue?
    public let seconds: ClosedRangeValue?
}
public struct ClosedRangeValue: Decodable, Equatable, Sendable {
    public let low: Double
    public let high: Double
}
public struct SessionEstimate: Decodable, Equatable, Sendable {
    public let durationMinutes: ClosedRangeValue?
    public let basis: Code?
}
/// What the boundary read of the execution. Distances keep their kind: measured (device), declared (athlete) and the extent used.
public struct RunExecution: Decodable, Equatable, Sendable {
    public let eventId: String?
    public let completed: Bool
    public let actualMinutes: Double?
    public let measuredKm: Double?
    public let declaredKm: Double?
    public let extentKm: Double?
    public let reliability: Code?
    /// Non-null when the pace is withheld (e.g. treadmill, poor GPS): show no pace then.
    public let paceWithheld: Code?
    /// DISTANCE, TIME, PARTIAL, STOPPED, UNKNOWN.
    public let status: Code
    public let expression: Code?
}
