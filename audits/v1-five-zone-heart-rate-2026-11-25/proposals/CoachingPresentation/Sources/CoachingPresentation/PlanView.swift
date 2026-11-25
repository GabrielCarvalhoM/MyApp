import Foundation

/// `api.plan().view` (`views.mjs planView`). The only source of what a session is and whether it may start.
public struct PlanView: Decodable, Equatable, Sendable {
    public let state: ClientState
    public let version: Int
    public let programHash: String
    /// The plan-local day (`YYYY-MM-DD`, the plan's fixed offset), not the device's.
    public let today: String
    public let weekIndex: Int
    public let weeks: Int
    public let sports: [String: SportState]
    public let hold: Hold?
    public let pending: Pending?
    public let question: Question?
    public let week: Week?
    public let lastDecision: DecisionSummary?
}

public struct SportState: Decodable, Equatable, Sendable {
    public let programmed: Bool
    /// ACTIVE, RETURNING, HELD, BLOCKED, NOT_PROGRAMMED (REDUCED never in V1).
    public let state: Code
    public let exit: Code?
    /// Strength regions restricted by the athlete's own readiness declaration.
    public let restricted: [String]?
}

/// A clinical hold. While it stands every prescription is null; the only exit is the readiness declaration.
public struct Hold: Decodable, Equatable, Sendable {
    public let clinical: Bool
    public let since: String?
    public let guidance: Guidance
    public let exit: Code
}
public struct Guidance: Decodable, Equatable, Sendable {
    /// e.g. PROFESSIONAL_ASSESSMENT.
    public let level: Code
    /// INTERIM_PENDING_G04: the wording is interim until G04 (C-BC-3 / SSCTR-BC-05).
    public let wordingStatus: Code
}
/// A change waiting for the athlete (`accept`/`decline`). The view names no diff: the reason is in `decision(decisionId)` and the run sessions of
/// the proposal in `presentation().pending` (strength rows of a proposal are not exposed: UI_CONTRACT_GAPS GAP-CORE-03).
public struct Pending: Decodable, Equatable, Sendable {
    public let decisionId: String
    public let kind: Code
    public let change: Code
}
/// An open question: ask exactly `missingInputs` (e.g. `eligibility.currentAssessment`); later weeks are projections.
public struct Question: Decodable, Equatable, Sendable {
    public let missingInputs: [String]
    public let eventKind: Code?
    public let reason: EngineText?
}
public struct DecisionSummary: Decodable, Equatable, Sendable {
    public let decisionId: String
    public let at: String
    /// KEEP, MODIFY, ASK, CLINICAL_HUMAN_REQUIRED, ...
    public let status: Code
    public let action: Code?
    public let reason: EngineText?
    public let missingInputs: [String]?
    public let guidance: Guidance?
}

public struct Week: Decodable, Equatable, Sendable {
    public let index: Int
    public let startDate: String
    public let sessions: [PlannedSession]
}

public struct PlannedSession: Decodable, Equatable, Sendable, Identifiable {
    public let id: String
    public let date: String
    /// RUN or STRENGTH.
    public let sport: Code
    public let role: Code
    public let turn: Code?
    public let optional: Bool
    /// PLANNED, REST, SKIPPED, ...
    public let status: Code
    /// The engine's permission to start. Necessary, not sufficient: the host's `startability` adds the native rules (SEC-FPV-01).
    public let executable: Bool
    /// Shown for context only (after a question): never startable, never "the plan".
    public let projected: Bool
    public let prescription: Prescription?
    public let explanation: EngineText?
    public let ownEvent: Bool?
}

/// The session as prescribed. Run and strength share one JSON object keyed by `modality`; only the fields the screens use are typed.
public struct Prescription: Decodable, Equatable, Sendable {
    public let modality: Code?
    public let family: Code?
    public let durationMinutes: Double?
    public let warmupMinutes: Double?
    public let cooldownMinutes: Double?
    public let effortDomain: Code?
    public let work: RunWork?
    public let strides: Strides?
    public let event: RaceEvent?
    public let optionalByDesign: Bool?
    public let goalMode: Code?
    public let establishment: Bool?
    public let exercises: [PrescribedExercise]?
}
public struct RunWork: Decodable, Equatable, Sendable {
    public let repetitions: Int
    public let workMinutes: Double?
    public let recoveryMinutes: Double?
}
public struct Strides: Decodable, Equatable, Sendable {
    public let repetitions: Int
    public let workSeconds: Double
    public let recoverySeconds: Double
}
public struct RaceEvent: Decodable, Equatable, Sendable {
    /// 5K, 10K, HALF_MARATHON, MARATHON.
    public let kind: Code
    public let date: String
}
public struct PrescribedExercise: Decodable, Equatable, Sendable {
    public let id: String
    public let pattern: Code?
    public let region: Code?
    public let role: Code?
    public let laterality: Code?
    public let sets: Int
    public let reps: Int?
    public let rir: Double?
    public let restSeconds: Double?
    public let preparationMinutes: Double?
    public let load: PrescribedLoad?
    public let establishment: Bool?
    public let equipment: [String]?
}
/// The prescribed load. Three different things, never merged on screen:
/// - `value` with mode KNOWN: the load the engine prescribes (carga prescrita);
/// - `rule` / `nextSetting` with mode FROM_LOG: the engine's own next-step recommendation from the athlete's log (recomendação do motor);
/// - mode ESTABLISH / BODYWEIGHT / RETURN: no number; effort-guided establishment, bodyweight or the return ramp.
/// What the athlete logged is a third source (the athlete's report), never this struct.
public struct PrescribedLoad: Decodable, Equatable, Sendable {
    public let mode: Code
    public let unit: Code?
    public let convention: Code?
    public let value: Double?
    public let rule: EngineText?
    public let nextSetting: NextSetting?
}
public struct NextSetting: Decodable, Equatable, Sendable {
    public let aboveKg: Double?
    public let fallbackReps: Int?
}
