import Foundation

/// `api.history().history` (`views.mjs historyView`). Frozen and minimal: per linked session only date, completed and minutes. Unlinked device
/// runs, distances, paces, sets and loads are not in it (UI_CONTRACT_GAPS GAP-CORE-01: `LoggedEntry` below is the proposed projection).
public struct HistoryView: Decodable, Equatable, Sendable {
    public let version: Int
    public let sessions: [HistorySession]
    public let facts: [HistoryFact]
    public let erasedSlots: Int
    public let decisions: [HistoryDecision]
}
public struct HistorySession: Decodable, Equatable, Sendable {
    public let eventId: String
    public let sessionId: String
    public let date: String
    public let completed: Bool
    public let minutes: Double?
}
public struct HistoryFact: Decodable, Equatable, Sendable {
    /// CLINICAL_HOLD, READINESS_DECLARED, ... (F08 rows summarised by type only).
    public let fact: Code
    public let eventId: String
    public let at: String?
}
public struct HistoryDecision: Decodable, Equatable, Sendable {
    public let decisionId: String
    public let kind: Code
    public let at: String
    public let status: Code
    public let action: Code?
    public let reason: EngineText?
    public let guidance: Guidance?
}

/// Every mutating answer: `{ok:true, ...}` or `{ok:false, error, state}`.
public struct BoundaryAnswer: Decodable, Equatable, Sendable {
    public let ok: Bool
    public let version: Int?
    public let status: Code?
    public let action: Code?
    public let decisionId: String?
    public let recorded: [String]?
    public let notRecorded: [NotRecorded]?
    public let duplicate: Bool?
    public let warningSignScreen: WarningSignScreen?
    public let view: PlanView?
    public let error: BoundaryError?
    public let state: ClientState?
}
public struct NotRecorded: Decodable, Equatable, Sendable {
    public let eventId: String?
    public let reason: Code
}
public struct BoundaryError: Decodable, Equatable, Sendable, Error {
    /// handoff §7 table: CONFLICT_STALE_VERSION, BUSY, PERSISTENCE_FAILURE, CLOCK_BEHIND_RECORD, BEFORE_RECORD_START, SCREEN_REQUIRED,
    /// RECORD_LOST, RECORD_ROLLED_BACK, INTEGRITY_FAILURE, CONSENT_REQUIRED, GONE, NOT_ENROLLED, SYNTHETIC_ONLY, ...
    public let code: Code
    public let message: EngineText?
    public let index: Int?
    public let field: String?
}

/// PROPOSED (GAP-CORE-01): the athlete's own logged sessions as kept in the record, projected by A's facade (app code over `custody.read`, no
/// engine change): what history, comparison and progress screens need. The record stays the single source; the UI keeps no second copy
/// (G07: an erasure reaches every layer).
public struct LoggedEntry: Decodable, Equatable, Sendable, Identifiable {
    public var id: String { eventId }
    public let eventId: String
    /// Nil for an unlinked device run.
    public let sessionId: String?
    public let date: String
    /// ATHLETE (the athlete's form) or DEVICE (HealthKit).
    public let channel: Code
    public let sport: Code?
    public let completed: Bool
    public let minutes: Double?
    public let distanceKm: Double?
    /// GPS, TRACK, TREADMILL, ... (device) or nil.
    public let measurement: Code?
    public let rpe: Double?
    public let stopReason: Code?
    public let exercises: [LoggedExercise]?
    /// A corrected report stays as history; the screens show the report in force.
    public let superseded: Bool
}
public struct LoggedExercise: Decodable, Equatable, Sendable {
    public let id: String
    public let sets: [LoggedSet]
}
public struct LoggedSet: Decodable, Equatable, Sendable {
    public let reps: Int?
    public let load: LoggedLoad?
    public let rir: Double?
}
public struct LoggedLoad: Decodable, Equatable, Sendable {
    public let value: Double
    /// KG or LB, as logged: never converted silently.
    public let unit: Code
    public let convention: Code?
}
