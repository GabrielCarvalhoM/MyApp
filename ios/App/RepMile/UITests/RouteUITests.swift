import XCTest

/// #98: the Debug-only `-route <destination>` opens one screen of the fixture composition at launch (for `sim.sh run` captures). One test
/// per destination; without the argument (or with a name the build does not know) the app opens on Hoje as before; a start still goes
/// through the host's gate.
final class RouteUITests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func launch(_ route: String?, scenario: String = "today") -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", scenario, "-simulatedLocation", "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
            + (route.map { ["-route", $0] } ?? [])
        app.launch()
        return app
    }

    @MainActor
    private func element(_ app: XCUIApplication, _ id: String) -> XCUIElement { app.descendants(matching: .any)[id] }

    @MainActor
    private func attach(_ app: XCUIApplication, _ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }

    @MainActor
    private func assertTab(_ route: String, tab: String, screen: String) {
        let app = launch(route)
        XCTAssertTrue(element(app, screen).waitForExistence(timeout: 10), route)
        XCTAssertTrue(app.buttons["tab-\(tab)"].isSelected, route)
        attach(app, "-route \(route)")
    }

    // MARK: no argument, unknown name

    @MainActor
    func testWithoutTheArgumentTheAppOpensOnToday() {
        let app = launch(nil)
        XCTAssertTrue(element(app, "screen-today").waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["tab-today"].isSelected)
        XCTAssertFalse(element(app, "screen-plan").exists)
    }

    @MainActor
    func testAnUnknownDestinationOpensNothing() {
        let app = launch("settings")
        XCTAssertTrue(element(app, "screen-today").waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["tab-today"].isSelected)
    }

    // MARK: one test per destination

    @MainActor func testToday() { assertTab("today", tab: "today", screen: "screen-today") }

    /// Hoje opened scrolled to the week strip (captures below the fold, #99): the strip is at the top of the screen.
    @MainActor
    func testTodayWeekScrollsToTheStrip() {
        let app = launch("today/week", scenario: "blocked")
        let strip = element(app, "week-panels")
        XCTAssertTrue(strip.waitForExistence(timeout: 10))
        let deadline = Date().addingTimeInterval(5)
        while strip.frame.minY > 200 && Date() < deadline { usleep(200_000) }
        XCTAssertLessThan(strip.frame.minY, 200, "the strip is at the top of the screen")
        attach(app, "-route today/week (blocked)")
        // Once only (QRE P3): back on Hoje from another tab, it opens at the top.
        app.buttons["tab-plan"].tap()
        XCTAssertTrue(element(app, "screen-plan").waitForExistence(timeout: 5))
        app.buttons["tab-today"].tap()
        XCTAssertTrue(app.buttons["open-profile"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["open-profile"].isHittable, "Hoje opens at the top again")
    }

    @MainActor
    func testPlanOpensTheWeek() {
        assertTab("plan", tab: "plan", screen: "screen-plan")
    }

    @MainActor
    func testPlanWeek() {
        let app = launch("plan/week")
        XCTAssertTrue(app.buttons["plan-segment-week"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["plan-segment-week"].isSelected)
        XCTAssertTrue(element(app, "plan-week-title").exists)
    }

    @MainActor
    func testPlanMonth() {
        let app = launch("plan/month")
        XCTAssertTrue(app.buttons["plan-segment-month"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["plan-segment-month"].isSelected)
        XCTAssertFalse(element(app, "plan-week-title").exists)
        attach(app, "-route plan/month")
    }

    @MainActor
    func testPlanPhases() {
        let app = launch("plan/phases")
        XCTAssertTrue(app.buttons["plan-segment-phases"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["plan-segment-phases"].isSelected)
        XCTAssertFalse(element(app, "plan-week-title").exists)
        attach(app, "-route plan/phases")
    }

    @MainActor
    func testSessionOpensTheSessionPushedOnPlan() {
        let app = launch("session/w0-run-d6")
        XCTAssertTrue(element(app, "screen-session").waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["tab-today"].exists, "a pushed screen has no tab bar")
        app.navigationBars.buttons.firstMatch.tap()
        XCTAssertTrue(element(app, "screen-plan").waitForExistence(timeout: 5), "back goes to Plano")
        XCTAssertTrue(app.buttons["tab-plan"].isSelected)
    }

    @MainActor
    func testAnUnknownSessionPushesNothing() {
        let app = launch("session/no-such-session")
        XCTAssertTrue(element(app, "screen-plan").waitForExistence(timeout: 10))
        XCTAssertFalse(element(app, "screen-session").exists)
    }

    @MainActor func testHistory() { assertTab("history", tab: "history", screen: "screen-history") }
    @MainActor func testProgress() { assertTab("progress", tab: "progress", screen: "screen-progress") }

    @MainActor
    func testProfile() {
        let app = launch("profile")
        XCTAssertTrue(element(app, "screen-profile").waitForExistence(timeout: 10))
        app.navigationBars.buttons.firstMatch.tap()
        XCTAssertTrue(app.buttons["open-profile"].waitForExistence(timeout: 5), "back goes to Hoje")
    }

    @MainActor
    func testProfileZones() {
        let app = launch("profile/zones")
        XCTAssertTrue(element(app, "screen-hr-zones").waitForExistence(timeout: 10))
        app.navigationBars.buttons.firstMatch.tap()
        XCTAssertTrue(element(app, "screen-profile").waitForExistence(timeout: 5), "back goes to Perfil")
    }

    @MainActor
    func testRunStartsTodaysSessionThroughTheGate() {
        let app = launch("run")
        XCTAssertTrue(element(app, "run-timer").waitForExistence(timeout: 10))
        attach(app, "-route run")
    }

    /// The route is a tap, not a bypass: under a clinical hold nothing starts.
    @MainActor
    func testRunUnderAHoldStartsNothing() {
        let app = launch("run", scenario: "blocked")
        XCTAssertTrue(element(app, "screen-today").waitForExistence(timeout: 10))
        XCTAssertFalse(element(app, "run-timer").waitForExistence(timeout: 3))
        XCTAssertFalse(element(app, "screen-run").exists)
    }

    /// QRE P2-2: a valid plan with a next session, but the host's clock gate (`.clockUntrusted`): `run` reaches `start(_:)` and `canStart`
    /// refuses it.
    @MainActor
    func testRunUnderTheClockGateStartsNothing() {
        let app = launch("run", scenario: "clock")
        XCTAssertTrue(element(app, "screen-today").waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["today-start"].exists, "a next session is offered")
        XCTAssertFalse(app.buttons["today-start"].isEnabled, "and disabled by the host gate")
        XCTAssertFalse(element(app, "run-timer").waitForExistence(timeout: 3))
        XCTAssertFalse(element(app, "screen-run").exists)
    }

    @MainActor
    func testAddSheet() {
        let app = launch("add")
        XCTAssertTrue(element(app, "sheet-add").waitForExistence(timeout: 10))
    }

    @MainActor
    func testChangesSheet() {
        let app = launch("changes")
        XCTAssertTrue(element(app, "sheet-changes").waitForExistence(timeout: 10))
    }

    /// Opens on its first question, nothing answered (QRE P3): no condition chosen, nothing to send yet.
    @MainActor
    func testNotFeeling100Flow() {
        let app = launch("not-feeling")
        XCTAssertTrue(element(app, "flow-not-feeling-100").waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["condition-MILD_ILLNESS"].exists, "the condition question, unanswered")
        XCTAssertFalse(app.buttons["nf-send"].exists, "nothing to send before an answer")
    }

    /// Opens with nothing answered (QRE P3): send off, no "sim"/"não" selected.
    @MainActor
    func testReadinessFlow() {
        let app = launch("readiness", scenario: "blocked")
        XCTAssertTrue(element(app, "flow-readiness").waitForExistence(timeout: 10))
        let send = app.buttons["readiness-send"]
        XCTAssertTrue(send.waitForExistence(timeout: 5))
        XCTAssertFalse(send.isEnabled)
        for id in ["readiness-recovered-yes", "readiness-recovered-no", "eligibility-pain-yes", "eligibility-pain-no"] where app.buttons[id].exists {
            XCTAssertFalse(app.buttons[id].isSelected, id)
        }
        attach(app, "-route readiness (blocked)")
    }

    /// QRE P2-1: refused as a tap would be. Under a block the changes sheet offers no "Não estou 100%"; outside one, no readiness.
    @MainActor
    func testNotFeeling100UnderABlockOpensNothing() {
        let app = launch("not-feeling", scenario: "blocked")
        XCTAssertTrue(element(app, "screen-today").waitForExistence(timeout: 10))
        XCTAssertFalse(element(app, "flow-not-feeling-100").waitForExistence(timeout: 3))
    }

    @MainActor
    func testReadinessOutsideABlockOpensNothing() {
        let app = launch("readiness")
        XCTAssertTrue(element(app, "screen-today").waitForExistence(timeout: 10))
        XCTAssertFalse(element(app, "flow-readiness").waitForExistence(timeout: 3))
    }
}
