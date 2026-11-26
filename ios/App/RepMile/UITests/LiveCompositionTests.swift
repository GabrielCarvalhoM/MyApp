import XCTest

/// The live composition (#16): launched WITHOUT `-scenario`, the app opens the real CoachingHost (A) and HealthKitIngestor (B) and the
/// RunRecorder (C). Synthetic data only (the engine runs in its synthetic shadow mode). Needs a simulator where the app holds no record:
/// `xcrun simctl uninstall RepMile-C-2 fit.vilumo.repmile.dev.app.simulator` before the run. The journey test leaves it that way again
/// (it erases the account it created, and the next launch is a new account).
final class LiveCompositionTests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func launch() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
        app.launch()
        return app
    }
    @MainActor private func el(_ app: XCUIApplication, _ id: String) -> XCUIElement { app.descendants(matching: .any)[id] }
    @MainActor
    private func attach(_ app: XCUIApplication, _ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }
    @MainActor
    private func tapScrolling(_ app: XCUIApplication, _ e: XCUIElement) {
        var tries = 0
        while !e.isHittable && tries < 8 { app.swipeUp(); tries += 1 }
        e.tap()
    }

    /// NOT_ENROLLED from the real host: onboarding, never the fixture "Hoje", never the operational error, no crash.
    @MainActor
    private func assertOnboarding(_ app: XCUIApplication, _ name: String) {
        XCTAssertTrue(el(app, "screen-onboarding").waitForExistence(timeout: 60), "the real host answers NOT_ENROLLED → onboarding")
        XCTAssertFalse(el(app, "state-operational-error").exists)
        XCTAssertFalse(app.buttons["tab-today"].exists)
        XCTAssertEqual(app.state, .runningForeground)
        attach(app, name)
    }

    @MainActor
    func testAFreshLaunchShowsOnboardingFromTheRealHost() {
        let app = launch()
        assertOnboarding(app, "live — primeira abertura (NOT_ENROLLED)")
    }

    /// The first real journey (#17), synthetic answers: the real engine builds the plan ("ob-created"), then Hoje reads the new record from
    /// the same host. Then the account is erased; the next launch is a new athlete id (CCP-A-05) and starts at onboarding again.
    @MainActor
    func testRealOnboardingCreatesAPlanThenEraseMakesTheNextLaunchANewAccount() {
        let app = launch()
        assertOnboarding(app, "live — boas-vindas")
        app.buttons["ob-next"].tap()
        let age = app.textFields["ob-age"]
        XCTAssertTrue(age.waitForExistence(timeout: 5))
        age.tap(); age.typeText("32")
        for _ in 0..<3 { app.buttons["ob-next"].tap() }
        // Schedule: a 12-week plan, so the default 10K date (today + 84 days) falls inside it. The form's defaults (8 weeks with that same
        // date) are contradictory, and the real engine answers INVALID_INPUT for them (the fixture writer never checks): an issue for C.
        tapScrolling(app, app.buttons["chip-12"])
        for _ in 0..<3 { app.buttons["ob-next"].tap() }
        XCTAssertTrue(app.staticTexts["Cuidados"].waitForExistence(timeout: 5))
        app.buttons["ob-care.none"].tap()
        for k in ["pain", "persistentPain", "injury", "illness", "functionalLimitation", "clinicalConcern"] { tapScrolling(app, app.buttons["eligibility-\(k)-no"]) }
        let confirm = app.switches["eligibility-confirm"]
        var tries = 0
        while !confirm.isHittable && tries < 8 { app.swipeUp(); tries += 1 }
        confirm.switches.firstMatch.exists ? confirm.switches.firstMatch.tap() : confirm.tap()
        XCTAssertTrue(app.buttons["ob-next"].isEnabled)
        app.buttons["ob-next"].tap()
        for p in ["COACHING", "HEALTH_SIGNALS", "LEARNING"] { tapScrolling(app, app.buttons["consent-\(p)-yes"]) }
        app.buttons["ob-next"].tap()

        XCTAssertTrue(el(app, "ob-created").waitForExistence(timeout: 60), "the real engine created the plan")
        attach(app, "live — plano criado pelo motor real")
        app.buttons["ob-open"].tap()
        XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 30))
        XCTAssertTrue(el(app, "screen-today").waitForExistence(timeout: 10))
        XCTAssertFalse(el(app, "state-operational-error").exists)
        attach(app, "live — Hoje depois do cadastro real")

        // Erase the account it created (G07 through A, B purged by A): the erased state, then a new account at the next launch.
        app.buttons["open-profile"].tap()
        let erase = app.buttons["profile-erase-account"]
        XCTAssertTrue(erase.waitForExistence(timeout: 10))
        tries = 0
        while !erase.isHittable && tries < 8 { app.swipeUp(); tries += 1 }
        erase.tap()
        app.buttons["profile-erase-confirm"].firstMatch.tap()
        XCTAssertTrue(el(app, "state-gone").waitForExistence(timeout: 30))
        attach(app, "live — conta apagada")
        app.terminate()

        let again = launch()
        assertOnboarding(again, "live — nova conta depois da exclusão")
    }
}
