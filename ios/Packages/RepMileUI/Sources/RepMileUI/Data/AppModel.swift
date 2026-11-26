import CoachingPresentation
import Foundation
import IntegrationContracts
import Observation

/// What the root shows, decided only from the engine's client state and the host's error code (handoff HO §7). Unknown is fail-closed.
public enum RootRoute: Equatable, Sendable {
    case loading
    case app
    case onboarding
    case accountErased
    case integrityFailure
    case recordLost
    case operationalError(code: String)
    case unrecognized(String)

    static func from(plan: Result<PlanView, BoundaryError>) -> RootRoute {
        switch plan {
        case .failure(let e):
            switch e.code.raw {
            case "NOT_ENROLLED": return .onboarding
            case "GONE": return .accountErased
            case "INTEGRITY_FAILURE": return .integrityFailure
            case "RECORD_LOST", "RECORD_ROLLED_BACK": return .recordLost
            default: return .operationalError(code: e.code.raw)
            }
        case .success(let v):
            switch v.state {
            case .validPlan, .pendingConfirmation, .needsInput, .returning, .blocked, .notSynced: return .app
            case .noData: return .onboarding
            case .integrityFailure: return .integrityFailure
            case .operationalError: return .operationalError(code: "OPERATIONAL_ERROR")
            case .unrecognized(let s): return .unrecognized(s)
            }
        }
    }
}

/// The app's single read model: everything the tabs show, read through the shared ports and never copied into a second store (G07).
@Observable @MainActor
public final class AppModel {
    public private(set) var reader: CoachingReading
    public let writer: CoachingWriting
    public let health: HealthIngestStatusSource
    public let athleteName: String

    public private(set) var route: RootRoute = .loading
    public private(set) var plan: PlanView?
    public private(set) var weeks: [Week] = []
    public private(set) var presentation: PresentationSnapshot?
    public private(set) var logged: LoggedEntries?
    public private(set) var weekPlan: WeekPlanProjection?
    public private(set) var history: HistoryView?
    public private(set) var startability: [String: Startability] = [:]
    public private(set) var pendingReports = PendingReports(count: 0, oldestQueuedAt: nil)
    public private(set) var healthStatus: HealthIngestStatus?

    public init(reader: CoachingReading, writer: CoachingWriting, health: HealthIngestStatusSource, athleteName: String) {
        self.reader = reader; self.writer = writer; self.health = health; self.athleteName = athleteName
    }

    public func load() async {
        let planResult = await reader.plan(week: nil)
        plan = try? planResult.get()
        async let w = reader.allWeeks()
        async let p = reader.presentation()
        async let l = reader.loggedEntries()
        async let wp = reader.weekPlan()
        async let h = reader.history()
        weeks = (try? await w.get()) ?? []
        presentation = try? await p.get()
        logged = try? await l.get()
        weekPlan = try? await wp.get()
        history = try? await h.get()
        var gates: [String: Startability] = [:]
        for s in plan?.week?.sessions ?? [] { gates[s.id] = await reader.startability(sessionId: s.id) }
        startability = gates
        pendingReports = await reader.pendingReports()
        healthStatus = await health.status()
        route = RootRoute.from(plan: planResult)
    }

    /// Parallel phase only: after an enrolment the composition root hands the reader of the state the engine captured next (A's reader
    /// simply reads the new record at integration).
    public func replaceReader(_ r: CoachingReading) async { reader = r; route = .loading; await load() }

    /// After a successful `eraseAccount`: nothing of the record stays in memory and the root shows the erased state.
    public func accountErased() async {
        plan = nil; weeks = []; presentation = nil; logged = nil; weekPlan = nil; history = nil; startability = [:]
        route = .accountErased
    }

    public func startability(of session: PlannedSession) -> Startability { startability[session.id] ?? .notStartable(reason: .notExecutable) }

    /// The persistent host gate that applies to every session (FND-ABC-04 outside scope, clock, screen required), if any.
    public var globalGate: NotStartableReason? {
        let reasons = startability.values.compactMap { s -> NotStartableReason? in if case .notStartable(let r) = s { return r }; return nil }
        for r in [NotStartableReason.outsideV1Scope, .clinicalHumanRequired, .blocked, .screenRequired, .clockUntrusted, .recordUnavailable, .repertoireExpired] where reasons.contains(r) { return r }
        return nil
    }

    public var initials: String {
        athleteName.split(separator: " ").prefix(2).compactMap { $0.first }.map(String.init).joined().uppercased()
    }
}
