#if DEBUG
import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #98: the Debug-only `-route <destination>` launch argument. The parse and the landing are pure; what a destination opens in the app is
/// pinned by `RouteUITests` (one XCUITest per destination). A Release build has no `DebugRoute` at all (the file is `#if DEBUG`; the
/// strings check of the Release app binary is in the #98 evidence).
final class DebugRouteTests: XCTestCase {
    func testNoArgumentNoValueOrAnUnknownNameOpensNothing() {
        XCTAssertNil(DebugRoute.parse([]))
        XCTAssertNil(DebugRoute.parse(["-scenario", "today"]))
        XCTAssertNil(DebugRoute.parse(["-scenario", "today", "-route"]), "no value")
        for unknown in ["", "Plan", "plan/", "plan/year", "session", "session/", "session/a/b", "settings", "run/now"] {
            XCTAssertNil(DebugRoute.parse(["-route", unknown]), unknown)
        }
    }

    func testEveryDestinationParses() {
        let expected: [(String, DebugRoute)] = [
            ("today", .today), ("today/week", .todayWeek), ("plan", .plan(.week)), ("plan/week", .plan(.week)), ("plan/month", .plan(.month)), ("plan/phases", .plan(.phases)),
            ("session/w0-run-d6", .session(id: "w0-run-d6")), ("history", .history), ("progress", .progress), ("profile", .profile),
            ("profile/zones", .zones), ("run", .run), ("add", .sheet(.add)), ("changes", .sheet(.changes)), ("not-feeling", .sheet(.notFeeling)),
            ("readiness", .sheet(.readiness)),
        ]
        for (value, route) in expected {
            XCTAssertEqual(DebugRoute.parse(["-scenario", "today", "-route", value, "-AppleLanguages", "(pt-BR)"]), route, value)
        }
    }

    /// QRE P2-1: a sheet route opens only where a tap could open it (`ChangesSheet`): "Não estou 100%" outside a block, the readiness
    /// declaration under one; "+" and the changes sheet always.
    func testSheetRoutesFollowTheTapConditions() {
        for blocked in [false, true] {
            XCTAssertTrue(DebugRoute.opens(.add, planBlocked: blocked))
            XCTAssertTrue(DebugRoute.opens(.changes, planBlocked: blocked))
        }
        XCTAssertTrue(DebugRoute.opens(.notFeeling, planBlocked: false))
        XCTAssertFalse(DebugRoute.opens(.notFeeling, planBlocked: true))
        XCTAssertTrue(DebugRoute.opens(.readiness, planBlocked: true))
        XCTAssertFalse(DebugRoute.opens(.readiness, planBlocked: false))
    }

    /// QRE P3: the route is applied at most once per process (the tabs may be rebuilt by a reload).
    @MainActor
    func testTheRouteIsClaimedOnce() {
        XCTAssertTrue(DebugRoute.claim())
        XCTAssertFalse(DebugRoute.claim())
        XCTAssertFalse(DebugRoute.claim())
    }

    /// The tab, stacks and plan segment each destination lands on. Starting and sheets land on Hoje: `AppTabs` opens them by its own paths.
    func testLandings() throws {
        let plan = try Repo.store.decode(PlanView.self, "13-plan-w1", at: "view")
        let weeks = try Repo.store.decode([Week].self, "03-sessions", at: "weeks")
        let current = plan.week?.sessions ?? []
        func land(_ r: DebugRoute) -> DebugRoute.Landing { r.landing(current: current, weeks: weeks) }

        XCTAssertEqual(land(.today), .init())
        XCTAssertEqual(land(.todayWeek), .init(todayScrollToWeek: true))
        XCTAssertEqual(land(.run), .init())
        for s in DebugRoute.Sheet.allCases { XCTAssertEqual(land(.sheet(s)), .init(), s.rawValue) }
        XCTAssertEqual(land(.plan(.week)), .init(tab: .plan, planSegment: .week))
        XCTAssertEqual(land(.plan(.month)), .init(tab: .plan, planSegment: .month))
        XCTAssertEqual(land(.plan(.phases)), .init(tab: .plan, planSegment: .phases))
        XCTAssertEqual(land(.history), .init(tab: .history))
        XCTAssertEqual(land(.progress), .init(tab: .progress))
        XCTAssertEqual(land(.profile), .init(todayPath: [.profile]))
        XCTAssertEqual(land(.zones), .init(todayPath: [.profile, .hrZones]))
        // A session of the current week, one of a later week (from `allWeeks`), and an id the fixture does not hold (nothing pushed).
        XCTAssertEqual(land(.session(id: "w0-run-d6")), .init(tab: .plan, planPath: [.session("w0-run-d6", "2026-11-22")]))
        XCTAssertEqual(land(.session(id: "w1-str-d2")), .init(tab: .plan, planPath: [.session("w1-str-d2", "2026-11-25")]))
        XCTAssertEqual(land(.session(id: "no-such-session")), .init(tab: .plan))
    }
}
#endif
