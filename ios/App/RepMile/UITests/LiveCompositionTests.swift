import XCTest

/// The live composition (#16): launched WITHOUT `-scenario`, the app opens the real CoachingHost (A) and HealthKitIngestor (B) and the
/// RunRecorder (C). Synthetic data only (the engine runs in its synthetic shadow mode). Needs a simulator where the app holds no record:
/// `xcrun simctl uninstall <simulator> fit.vilumo.repmile.dev.app.simulator` before the run. The journey test leaves it that way again
/// (it erases the account it created, and the next launch is a new account).
final class LiveCompositionTests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func launch() -> XCUIApplication {
        let app = XCUIApplication()
        // `-simulatedLocation` (Debug): scripted location in the live composition, so a run records with no permission prompt (#63 P3-6).
        app.launchArguments = ["-simulatedLocation", "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
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

    /// Real onboarding with synthetic answers until the real engine built the plan and Hoje reads it from the same host.
    @MainActor
    private func enroll(_ app: XCUIApplication, _ label: String) {
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

        XCTAssertTrue(el(app, "ob-created").waitForExistence(timeout: 60), "the real engine created the plan (\(label))")
        XCTAssertFalse(el(app, "state-operational-error").exists)
        attach(app, "live — plano criado pelo motor real (\(label))")
        app.buttons["ob-open"].tap()
        XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 30))
        XCTAssertTrue(el(app, "screen-today").waitForExistence(timeout: 10))
        XCTAssertFalse(el(app, "state-operational-error").exists)
        attach(app, "live — Hoje depois do cadastro real (\(label))")
    }

    /// An unplanned run recorded by the live composition's recorder into the REAL `RecordingStore` (scripted location, `-simulatedLocation`),
    /// finished and reported to the real host. Before week 1 the real engine answers that it was not kept as a separate session, so the report
    /// stays open (resendable); the process is killed there and the finished recording comes back from the real store at the next launch.
    /// Leaving without saving then discards it (C's own discard). Returns the relaunched app.
    @MainActor
    private func recordARun(_ app: XCUIApplication) -> XCUIApplication {
        app.buttons["tab-add"].tap()
        XCTAssertTrue(app.buttons["add-run-now"].waitForExistence(timeout: 10))
        app.buttons["add-run-now"].tap()
        XCTAssertTrue(el(app, "run-timer").waitForExistence(timeout: 10), "a recording started")
        app.buttons["run-pause"].tap()
        XCTAssertTrue(app.staticTexts["Pausado"].waitForExistence(timeout: 5))
        app.buttons["run-finish"].tap()
        app.buttons["run-finish-confirm"].firstMatch.tap()
        XCTAssertTrue(el(app, "screen-report").waitForExistence(timeout: 10))
        tapScrolling(app, app.buttons["report-unusual-no"])
        tapScrolling(app, app.buttons["report-save"])
        let saved = el(app, "report-saved"), notKept = el(app, "report-not-kept")
        var waited = 0
        while !saved.exists && !notKept.exists && waited < 30 { _ = notKept.waitForExistence(timeout: 1); waited += 1 }
        XCTAssertTrue(saved.exists || notKept.exists, "the real host answered the report")
        attach(app, "live — corrida gravada e relatada")
        if saved.exists {
            tapScrolling(app, app.buttons["report-done"])
            XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 10))
            return app
        }
        app.terminate()
        let again = launch()
        XCTAssertTrue(el(again, "screen-report").waitForExistence(timeout: 60), "the finished recording came back from the real store")
        XCTAssertFalse(el(again, "state-operational-error").exists)
        attach(again, "live — gravação de volta depois de matar o processo")
        tapScrolling(again, again.buttons["report-leave"])
        // The dialog's own button (the report's button has the same label).
        let leave = again.buttons.matching(NSPredicate(format: "label == %@ AND identifier != %@", "Sair sem salvar", "report-leave")).firstMatch
        XCTAssertTrue(leave.waitForExistence(timeout: 10))
        leave.tap()
        XCTAssertTrue(el(again, "screen-report").waitForNonExistence(timeout: 10), "the report closed")
        XCTAssertTrue(again.buttons["tab-today"].waitForExistence(timeout: 10))
        return again
    }

    /// Profile → erase the account (G07 through A, B purged by A, C's recordings by the shell) → the erased state.
    @MainActor
    private func eraseAccount(_ app: XCUIApplication, _ label: String) {
        app.buttons["open-profile"].tap()
        let erase = app.buttons["profile-erase-account"]
        XCTAssertTrue(erase.waitForExistence(timeout: 10))
        var tries = 0
        while !erase.isHittable && tries < 8 { app.swipeUp(); tries += 1 }
        erase.tap()
        app.buttons["profile-erase-confirm"].firstMatch.tap()
        XCTAssertTrue(el(app, "state-gone").waitForExistence(timeout: 30))
        attach(app, "live — conta apagada (\(label))")
    }

    /// The first real journey (#17) and the erasure end to end (#63 P3-6), synthetic answers: the real engine builds the plan, a run is
    /// recorded into the real recordings store and reported (see `recordARun`), the account is erased. The next launch is a new athlete id (CCP-A-05) and
    /// starts at onboarding; it opens only after the erased account's recordings are known gone (the composition's pending erasure checks
    /// C's index, #63 P3-1), and nothing of the old run comes back. Then the athlete enrols AGAIN on the same install: the real host accepts
    /// the new id (A's purge of the erased account is done; no ANOTHER_ATHLETE_ON_THIS_INSTALL), and Hoje opens. The second account is
    /// erased too, so the simulator ends as it started (no record).
    @MainActor
    func testRealOnboardingCreatesAPlanThenEraseMakesTheNextLaunchANewAccount() {
        let app = launch()
        assertOnboarding(app, "live — boas-vindas")
        enroll(app, "primeira conta")
        let afterRun = recordARun(app)
        eraseAccount(afterRun, "primeira conta")
        afterRun.terminate()

        let again = launch()
        assertOnboarding(again, "live — nova conta depois da exclusão")
        XCTAssertFalse(el(again, "run-timer").exists, "no recording of the erased account comes back")
        XCTAssertFalse(el(again, "screen-report").exists)
        enroll(again, "nova conta no mesmo aparelho")
        XCTAssertFalse(el(again, "run-timer").exists)
        XCTAssertFalse(el(again, "screen-report").exists)
        eraseAccount(again, "nova conta")
        again.terminate()

        let last = launch()
        assertOnboarding(last, "live — terceira abertura, sem registro")
    }
}
