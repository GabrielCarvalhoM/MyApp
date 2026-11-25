import Foundation

/// Whether a session may be started now, decided by the host (front A): the view's `executable` plus the native rules the engine cannot see
/// (SEC-FPV-01 after an erasure, an outstanding warning-sign screen, the trusted clock, R7-B0 expiry). The UI never computes this.
public enum Startability: Equatable, Sendable {
    case startable
    case notStartable(reason: NotStartableReason)
}
public enum NotStartableReason: String, Equatable, Sendable {
    case notExecutable = "NOT_EXECUTABLE"
    case projected = "PROJECTED"
    case blocked = "BLOCKED"
    case screenRequired = "SCREEN_REQUIRED"
    case clockUntrusted = "CLOCK_UNTRUSTED"
    case recordUnavailable = "RECORD_UNAVAILABLE"
    case repertoireExpired = "REPERTOIRE_EXPIRED"
}

/// The app's queue of athlete reports not yet on record (NOT_SYNCED is the app's own state, never the engine's).
public struct PendingReports: Equatable, Sendable {
    public let count: Int
    public let oldestQueuedAt: Date?
    public init(count: Int, oldestQueuedAt: Date?) { self.count = count; self.oldestQueuedAt = oldestQueuedAt }
}

/// PROPOSED port, implemented by front A (CoachingHost) and by front C's fixture provider; consumed by front C. Reads return the frozen views
/// decoded; writes take the forms of SWIFTUI_BACKEND_HANDOFF §5 (A's typed requests) and return the answer envelope. Every call is async on
/// A's engine queue; none blocks the main thread. The UI sets no id, version or actor: A does.
public protocol CoachingReading: AnyObject, Sendable {
    func plan(week: Int?) async -> Result<PlanView, BoundaryError>
    func allWeeks() async -> Result<[Week], BoundaryError>
    func presentation() async -> Result<PresentationSnapshot, BoundaryError>
    func history() async -> Result<HistoryView, BoundaryError>
    func decision(id: String) async -> Result<DecisionDetail, BoundaryError>
    /// GAP-CORE-01 (proposed facade projection).
    func loggedEntries() async -> Result<[LoggedEntry], BoundaryError>
    func startability(sessionId: String) async -> Startability
    func pendingReports() async -> PendingReports
}

/// `api.decision(decisionId).decision`.
public struct DecisionDetail: Decodable, Equatable, Sendable {
    public let decisionId: String
    public let kind: Code
    public let at: String
    public let status: Code
    public let action: Code?
    public let reason: EngineText?
    public let missingInputs: [String]?
    public let planValidity: Code?
    public let adoption: Code?
}
