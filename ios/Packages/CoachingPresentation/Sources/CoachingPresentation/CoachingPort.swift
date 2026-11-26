import Foundation

/// The version of this shared contract (types, ports, facade projections, fixtures). A change is a coordinated change by the integration mission
/// (PARALLEL_IMPLEMENTATION_CONTRACT §11); a front that needs one writes a proposal and keeps a local adapter meanwhile.
public enum CoachingContract {
    public static let version = "RM-ABC-CONTRACT-1"
    /// The app-facade projections this contract decodes (`Facade/app-projections.mjs PROJECTIONS_VERSION`).
    public static let projections = "RM-APP-PROJECTIONS-1"
    /// The engine the fixtures were captured from: REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2, bundle d087ad51.
    public static let engineRecord = "REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2"
}

/// Whether a session may be started now, decided by the host (front A): the view's `executable` plus the native rules the engine cannot see
/// (SEC-FPV-01 after an erasure, an outstanding warning-sign screen, the trusted clock, R7-B0 expiry). The UI never computes this.
public enum Startability: Equatable, Sendable {
    case startable
    case notStartable(reason: NotStartableReason)
}
public enum NotStartableReason: String, Equatable, Sendable, CaseIterable {
    case notExecutable = "NOT_EXECUTABLE"
    case projected = "PROJECTED"
    case blocked = "BLOCKED"
    case screenRequired = "SCREEN_REQUIRED"
    case clockUntrusted = "CLOCK_UNTRUSTED"
    case recordUnavailable = "RECORD_UNAVAILABLE"
    case repertoireExpired = "REPERTOIRE_EXPIRED"
    /// FND-ABC-04 (safety, fail closed): the athlete's latest intake (a restart) declared a special population or another out-of-scope fact and
    /// was answered UNSUPPORTED, while the earlier plan stays in force in the record. A keeps a persistent native signal (as SEC-FPV-01) and
    /// starts nothing until an intake the engine accepts, or the account is erased. Pending SSCTR + Security confirmation; never relaxed by a front.
    case outsideV1Scope = "OUTSIDE_V1_SCOPE"
}

/// The app's queue of athlete reports not yet on record (NOT_SYNCED is the app's own state, never the engine's).
public struct PendingReports: Equatable, Sendable {
    public let count: Int
    public let oldestQueuedAt: Date?
    public init(count: Int, oldestQueuedAt: Date?) { self.count = count; self.oldestQueuedAt = oldestQueuedAt }
}

/// Implemented by front A (CoachingHost) and, during the parallel phase, by front C's fixture provider (which only replays the committed
/// fixtures); consumed by front C. Reads return the frozen views and the shared projections decoded. Every call is async on A's engine queue;
/// none blocks the main thread. The UI sets no id, version or actor: A does.
public protocol CoachingReading: AnyObject, Sendable {
    func plan(week: Int?) async -> Result<PlanView, BoundaryError>
    func allWeeks() async -> Result<[Week], BoundaryError>
    func presentation() async -> Result<PresentationSnapshot, BoundaryError>
    func history() async -> Result<HistoryView, BoundaryError>
    func decision(id: String) async -> Result<DecisionDetail, BoundaryError>
    /// CHG-UI-2 2.1 (GAP-06): the athlete's sessions as the record keeps them.
    func loggedEntries() async -> Result<LoggedEntries, BoundaryError>
    /// CHG-UI-2 2.2 (GAP-07): phases and planned volume.
    func weekPlan() async -> Result<WeekPlanProjection, BoundaryError>
    /// CHG-UI-2 2.4 (GAP-03): the signs to ask for `condition` (a `WellbeingCondition` raw value, or READINESS). Never a Swift table.
    func warningSignSet(condition: String) async -> Result<WarningSignQuestionSet, BoundaryError>
    func startability(sessionId: String) async -> Startability
    func pendingReports() async -> PendingReports
}

/// The answer of a write, with what the record now keeps of the reports it named (A computes `kept` with the facade's `keepsReport` right after
/// the write, on the same queue). C shows "salvo" only for `kept` ids (GAP-12).
public struct WriteOutcome: Equatable, Sendable {
    public let answer: BoundaryAnswer
    public let kept: [String]
    public let notKept: [String]
    public init(answer: BoundaryAnswer, kept: [String], notKept: [String]) { self.answer = answer; self.kept = kept; self.notKept = notKept }
}

public enum ConsentPurpose: String, Sendable, CaseIterable { case coaching = "COACHING", healthSignals = "HEALTH_SIGNALS", learning = "LEARNING" }

/// Implemented by front A; consumed by front C (forms). The UI builds the closed request types; A adds actor, request id and expected version,
/// runs the call on its serial queue, maps `CONFLICT_STALE_VERSION` / `BUSY` per handoff §7, and signals B (`DeviceQueueControl`) after a commit.
public protocol CoachingWriting: AnyObject, Sendable {
    func onboard(_ answers: OnboardingAnswers, consents: Consents) async -> WriteOutcome
    func restart(_ answers: OnboardingAnswers) async -> WriteOutcome
    /// Every athlete review, through `integration.submit` (never the api.mjs form helpers: FND-ABC-03).
    func submit(_ review: ReviewRequest) async -> WriteOutcome
    func accept(decisionId: String) async -> WriteOutcome
    func decline(decisionId: String) async -> WriteOutcome
    /// V1HR5R `setHeartRateProfile` (COACHING consent required; no plan changes).
    func setHeartRateProfile(_ profile: HeartRateProfileRequest) async -> Result<HeartRateProfileAnswer, BoundaryError>
    /// V1HR5R `eraseHeartRateProfile` (never held back by consent or clock).
    func eraseHeartRateProfile() async -> Result<HeartRateProfileAnswer, BoundaryError>
    func setConsent(_ purpose: ConsentPurpose, granted: Bool) async -> WriteOutcome
    func eraseHealthFacts(eventIds: [String]) async -> WriteOutcome
    func eraseAccount() async -> WriteOutcome
    /// Reachable only from the RECORD_LOST / RECORD_ROLLED_BACK screen.
    func acknowledgeRecordLoss() async -> WriteOutcome
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
