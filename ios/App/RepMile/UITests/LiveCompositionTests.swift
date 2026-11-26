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

    /// Waits for `ob-next` to exist and be enabled, taps it, then waits for the next step's own element (as OnboardingTests).
    @MainActor
    private func tapNext(_ app: XCUIApplication, expecting next: XCUIElement?, _ step: String) {
        let button = app.buttons["ob-next"]
        let ready = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == true AND isEnabled == true"), object: button)
        XCTAssertEqual(XCTWaiter.wait(for: [ready], timeout: 10), .completed, "ob-next enabled before \(step)")
        button.tap()
        if let next { XCTAssertTrue(next.waitForExistence(timeout: 10), "reached \(step)") }
    }

    /// Picks next month's 15th in the race-date calendar and confirms (as OnboardingTests).
    @MainActor
    private func chooseRaceDate(_ app: XCUIApplication) {
        tapScrolling(app, app.buttons["ob-event-date"])
        let picker = app.datePickers.firstMatch
        XCTAssertTrue(picker.waitForExistence(timeout: 10))
        let header = picker.buttons["DatePicker.Show"].staticTexts.firstMatch
        XCTAssertTrue(header.waitForExistence(timeout: 10))
        let shown = header.label
        picker.buttons["DatePicker.NextMonth"].tap()
        let moved = XCTNSPredicateExpectation(predicate: NSPredicate(format: "label != %@", shown), object: header)
        XCTAssertEqual(XCTWaiter.wait(for: [moved], timeout: 10), .completed, "the calendar shows the next month")
        let day = picker.buttons.matching(NSPredicate(format: "label CONTAINS ', 15 de ' AND enabled == true")).firstMatch
        XCTAssertTrue(day.waitForExistence(timeout: 10))
        day.tap()
        let confirm = app.buttons["ob-event-date-confirm"]
        let enabled = XCTNSPredicateExpectation(predicate: NSPredicate(format: "isEnabled == true"), object: confirm)
        XCTAssertEqual(XCTWaiter.wait(for: [enabled], timeout: 10), .completed)
        confirm.tap()
        XCTAssertTrue(confirm.waitForNonExistence(timeout: 10), "the calendar closed")
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
        let age = app.textFields["ob-age"]
        tapNext(app, expecting: age, "age")
        age.tap(); age.typeText("32")
        // #61: the race date and the plan length are the athlete's choices (no default). A 10K on next month's 15th inside a 12-week plan.
        tapNext(app, expecting: app.buttons["ob-event-date"], "goals")
        chooseRaceDate(app)
        tapNext(app, expecting: app.staticTexts["Sua experiência"], "experience")
        tapNext(app, expecting: app.staticTexts["Sua semana"], "schedule")
        tapScrolling(app, app.buttons["chip-12"])
        tapNext(app, expecting: app.staticTexts["O que você tem para treinar força?"], "equipment")
        tapNext(app, expecting: el(app, "ob-anchor-toggle"), "anchor")
        tapNext(app, expecting: app.staticTexts["Cuidados"], "care")
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
