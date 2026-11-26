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
    /// True while a read is in flight. Every start (planned or unplanned) fails closed while it is set: the gates shown are the previous
    /// read's, kept on screen so a safety banner never disappears during a reload, but they are not trusted to start anything.
    public private(set) var isLoading = false
    /// Overlapping loads (a sheet's dismissal plus a write's own reload): only the newest one publishes.
    private var loadGeneration = 0

    public init(reader: CoachingReading, writer: CoachingWriting, health: HealthIngestStatusSource, athleteName: String) {
        self.reader = reader; self.writer = writer; self.health = health; self.athleteName = athleteName
    }

    /// Reads every port, then publishes everything at once: a new plan is never shown with the previous plan's gates. During the read
    /// `isLoading` makes every start fail closed (QRE R1 P1-9) while the previous gates stay visible (QRE recheck N1: clearing them made
    /// `globalGate` nil, which opened the unplanned run and dropped the outside-scope / clinical banners for the length of the read).
    public func load() async {
        loadGeneration += 1
        let generation = loadGeneration
        isLoading = true
        let planResult = await reader.plan(week: nil)
        let newPlan = try? planResult.get()
        async let w = reader.allWeeks()
        async let p = reader.presentation()
        async let l = reader.loggedEntries()
        async let wp = reader.weekPlan()
        async let h = reader.history()
        let (nw, np, nl, nwp, nh) = (await w, await p, await l, await wp, await h)
        var gates: [String: Startability] = [:]
        for s in newPlan?.week?.sessions ?? [] { gates[s.id] = await reader.startability(sessionId: s.id) }
        let pending = await reader.pendingReports()
        let hs = await health.status()
        guard generation == loadGeneration else { return }   // a newer load is running; it publishes
        plan = newPlan; weeks = (try? nw.get()) ?? []; presentation = try? np.get(); logged = try? nl.get(); weekPlan = try? nwp.get()
        history = try? nh.get(); startability = gates; pendingReports = pending; healthStatus = hs
        route = RootRoute.from(plan: planResult)
        isLoading = false
    }

    /// Parallel phase only: after an enrolment the composition root hands the reader of the state the engine captured next (A's reader
    /// simply reads the new record at integration).
    public func replaceReader(_ r: CoachingReading) async { reader = r; route = .loading; await load() }

    /// After a successful `eraseAccount`: nothing of the record stays in memory and the root shows the erased state.
    public func accountErased() async {
        loadGeneration += 1   // a read still in flight must not bring the erased record back on screen
        plan = nil; weeks = []; presentation = nil; logged = nil; weekPlan = nil; history = nil; startability = [:]
        isLoading = false
        route = .accountErased
    }

    public func startability(of session: PlannedSession) -> Startability { startability[session.id] ?? .notStartable(reason: .notExecutable) }

    /// Whether `session` may start now: the host said `.startable` and no read is in flight.
    public func canStart(_ session: PlannedSession) -> Bool { !isLoading && startability(of: session) == .startable }

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
