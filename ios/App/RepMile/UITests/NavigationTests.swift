import XCTest

/// Critical journeys on the dedicated simulator, driven by the parallel-phase scenarios (launch argument `-scenario <id>`).
final class NavigationTests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func launch(_ scenario: String, language: String = "pt-BR") -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", scenario, "-simulatedLocation", "-AppleLanguages", "(\(language))", "-AppleLocale", language == "pt-BR" ? "pt_BR" : language]
        app.launch()
        return app
    }

    @MainActor
    private func attach(_ app: XCUIApplication, _ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }

    @MainActor
    func testTabsAndProfileRoundTrip() {
        let app = launch("today")
        XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 10))
        attach(app, "Hoje — today scenario")

        for tab in ["plan", "history", "progress", "today"] {
            app.buttons["tab-\(tab)"].tap()
            XCTAssertTrue(app.buttons["tab-\(tab)"].isSelected, tab)
        }
        app.buttons["open-profile"].tap()
        XCTAssertTrue(app.navigationBars["Perfil"].waitForExistence(timeout: 5))
        app.navigationBars["Perfil"].buttons.firstMatch.tap()
        XCTAssertTrue(app.buttons["open-profile"].waitForExistence(timeout: 5))
    }

    @MainActor
    func testTodayStartsOnlyWhenStartable() {
        let app = launch("today")
        let start = app.buttons["today-start"]
        XCTAssertTrue(start.waitForExistence(timeout: 10))
        XCTAssertTrue(start.isEnabled)
        start.tap()
        XCTAssertTrue(app.descendants(matching: .any)["run-timer"].waitForExistence(timeout: 5))
    }

    @MainActor
    func testOutsideScopeRestartStartsNothing() {
        let app = launch("restart-outside-scope")
        XCTAssertTrue(app.otherElements["banner-outside-scope"].waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["today-start"].exists)
        XCTAssertTrue(app.staticTexts["Plano indisponível"].exists)
        attach(app, "Hoje — restart outside V1 scope (1103:2299)")
    }

    @MainActor
    func testBlockedShowsSafetyStateAndNoStart() {
        let app = launch("blocked")
        // #99 (Figma 72 `805:410`): the hold's headline is "Sem treino prescrito por enquanto" (was the banner title "Treino pausado…").
        XCTAssertTrue(app.staticTexts["Sem treino prescrito por enquanto"].waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["today-start"].exists)
        attach(app, "Hoje — blocked (17-plan-blocked)")
    }

    @MainActor
    func testScreenRequiredDisablesStartWithReason() {
        let app = launch("screen-required")
        XCTAssertTrue(app.staticTexts["Antes do próximo treino"].waitForExistence(timeout: 10))
        if app.buttons["today-start"].exists { XCTAssertFalse(app.buttons["today-start"].isEnabled) }
        attach(app, "Hoje — screen required after a symptom stop")
    }

    @MainActor
    func testRootStates() {
        for (scenario, id) in [("no-data", "screen-onboarding"), ("gone", "state-gone"), ("integrity", "state-integrity"),
                               ("record-lost", "state-record-lost"), ("stale", "state-operational-error")] {
            let app = launch(scenario)
            XCTAssertTrue(app.descendants(matching: .any)[id].waitForExistence(timeout: 10), scenario)
            XCTAssertFalse(app.buttons["tab-today"].exists, scenario)
            attach(app, "State — \(scenario)")
            app.terminate()
        }
    }

    /// Handoff C §8.8 / §9.4: large text keeps the decision and the main action reachable (no crash, start still present).
    @MainActor
    func testLargeDynamicType() {
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", "today", "-simulatedLocation", "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR",
                               "-UIPreferredContentSizeCategoryName", "UICTContentSizeCategoryAccessibilityL"]
        app.launch()
        XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 10))
        attach(app, "Hoje — texto grande (Accessibility L)")
        let start = app.buttons["today-start"]
        var tries = 0
        while !start.isHittable && tries < 6 { app.swipeUp(); tries += 1 }
        XCTAssertTrue(start.isHittable, "the main action stays reachable with large text")
        app.buttons["today-view-session"].tap()
        XCTAssertTrue(app.descendants(matching: .any)["screen-session"].waitForExistence(timeout: 5))
        attach(app, "Treino planejado — texto grande")
    }

    @MainActor
    func testLanguages() {
        for (lang, title) in [("en", "Today"), ("es", "Hoy")] {
            let app = launch("today", language: lang)
            XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 10))
            XCTAssertEqual(app.buttons["tab-today"].label, title, lang)
            attach(app, "Hoje — \(lang)")
            app.terminate()
        }
    }
}
