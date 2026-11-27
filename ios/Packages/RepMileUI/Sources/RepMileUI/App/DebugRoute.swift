#if DEBUG
import CoachingPresentation
import Foundation

/// `-route <destination>` (#98, Debug builds only): the fixture composition opens one screen at launch, so `sim.sh run` can capture a screen
/// that needs a tab change, a push or a sheet (the #14 visual records). It only replays what a tap would do, through the same paths: a
/// session starts only through `AppTabs.start(_:)` (the host's gate), a sheet opens its own flow, and nothing is answered or written.
/// Without the argument nothing changes; the live composition never reads it; a Release build has none of this file (strings check, #98).
///
/// Destinations (Figma screen map): `today`, `plan` (`plan/week`), `plan/month`, `plan/phases`, `session/<fixture session id>`, `history`,
/// `progress`, `profile`, `profile/zones`, `run` (starts today's next session, as "Começar"), `add`, `changes`, `not-feeling`, `readiness`.
enum DebugRoute: Equatable {
    enum Sheet: String, CaseIterable { case add, changes, notFeeling = "not-feeling", readiness }

    case today
    case plan(PlanScreen.Segment)
    case session(id: String)
    case history
    case progress
    case profile
    case zones
    case run
    case sheet(Sheet)

    static let argument = "-route"

    /// The destination named after `-route`, or nil: no argument, no value, or a name this build does not know (then nothing is opened).
    static func parse(_ arguments: [String]) -> DebugRoute? {
        guard let i = arguments.firstIndex(of: argument), arguments.indices.contains(i + 1) else { return nil }
        let value = arguments[i + 1]
        switch value {
        case "today": return .today
        case "plan", "plan/week": return .plan(.week)
        case "plan/month": return .plan(.month)
        case "plan/phases": return .plan(.phases)
        case "history": return .history
        case "progress": return .progress
        case "profile": return .profile
        case "profile/zones": return .zones
        case "run": return .run
        default:
            if value.hasPrefix("session/") {
                let id = String(value.dropFirst("session/".count))
                return id.isEmpty || id.contains("/") ? nil : .session(id: id)
            }
            return Sheet(rawValue: value).map(DebugRoute.sheet)
        }
    }

    /// This process's destination (read once).
    static let launch: DebugRoute? = parse(ProcessInfo.processInfo.arguments)

    /// Applied at most once per process (QRE P3): the tabs can be rebuilt (a reload, a root route change) and must not open it again.
    @MainActor private static var applied = false
    @MainActor static func claim() -> Bool {
        guard !applied else { return false }
        applied = true
        return true
    }

    /// Whether a sheet route opens, under the same condition a tap has (QRE P2-1): "Algo mudou na sua semana?" (`ChangesSheet`) offers
    /// "Não estou 100%" only when the plan is not blocked and the readiness declaration only when it is; "+" and the changes sheet are
    /// always there. A refused route stays inert (Hoje, nothing opened).
    static func opens(_ sheet: Sheet, planBlocked: Bool) -> Bool {
        switch sheet {
        case .add, .changes: true
        case .notFeeling: !planBlocked
        case .readiness: planBlocked
        }
    }

    /// Where the tabs land: the tab, the navigation stacks and the plan segment. Pure: what to push is read from the loaded plan and weeks
    /// only (a session id the fixture does not hold pushes nothing). Starting and sheets are not here: `AppTabs` does them through its own
    /// gated paths.
    struct Landing: Equatable {
        var tab: AppTab = .today
        var todayPath: [Route] = []
        var planPath: [Route] = []
        var planSegment: PlanScreen.Segment = .week
    }

    func landing(current: [PlannedSession], weeks: [Week]) -> Landing {
        switch self {
        case .today, .run, .sheet: return Landing()
        case .plan(let segment): return Landing(tab: .plan, planSegment: segment)
        case .history: return Landing(tab: .history)
        case .progress: return Landing(tab: .progress)
        case .profile: return Landing(todayPath: [.profile])
        case .zones: return Landing(todayPath: [.profile, .hrZones])
        case .session(let id):
            // The current week first (as `AppTabs.destination` resolves a session), then every week.
            guard let s = current.first(where: { $0.id == id }) ?? weeks.flatMap(\.sessions).first(where: { $0.id == id }) else {
                return Landing(tab: .plan)
            }
            return Landing(tab: .plan, planPath: [.session(s.id, s.date)])
        }
    }
}
#endif
