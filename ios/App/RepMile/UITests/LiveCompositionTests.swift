import XCTest

/// The live composition (#16): launched WITHOUT `-scenario`, the app opens the real CoachingHost (A) and HealthKitIngestor (B) and the
/// RunRecorder (C). Synthetic data only (the engine runs in its synthetic shadow mode).
///
/// #83: every test is its own install. `-isolatedLiveStores <token>` (Debug) puts the identity, A's store, B's queue and C's recordings in a
/// folder of that token and A's Keychain items under a service of their own, so a test never depends on what an earlier test or run left
/// (an athlete enrolled by a run that failed half way) and never reads or touches the app's standard stores or Keychain items. The token is
/// new in `setUp`, kept across the relaunches of one test (the same install), and changed on purpose to stand for a reinstall.
final class LiveCompositionTests: XCTestCase {
    /// The install this test runs in (`-isolatedLiveStores`).
    private var install = ""

    override func setUp() {
        continueAfterFailure = false
        install = UUID().uuidString
    }

    @MainActor
    private func launch(_ extra: [String] = []) -> XCUIApplication {
        let app = XCUIApplication()
        // `-simulatedLocation` (Debug): scripted location in the live composition, so a run records with no permission prompt (#63 P3-6).
        app.launchArguments = extra + ["-isolatedLiveStores", install, "-simulatedLocation", "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
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
        // #68: the report carries a current eligibility screen (the real engine records no athlete report without one).
        answerReportScreen(app)
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

    /// #76: a damaged identity file shows its own state, with no "try again", through the live composition's real failure path
    /// (`AthleteIdentityStore.Failure.malformed` → `ACCOUNT_IDENTITY_DAMAGED`). `-simulateDamagedIdentity` (Debug) points the composition at a
    /// damaged file written for this launch in the temporary folder; the real identity file is neither read nor touched, so nothing of this
    /// test stays on the simulator.
    @MainActor
    func testADamagedIdentityShowsItsOwnStateWithNoRetry() {
        let app = launch(["-simulateDamagedIdentity"])
        XCTAssertTrue(el(app, "state-identity-damaged").waitForExistence(timeout: 30), "the damaged-identity state")
        XCTAssertTrue(app.staticTexts["Não conseguimos abrir sua conta neste aparelho"].exists)
        XCTAssertFalse(el(app, "state-retry").exists, "no try again: opening again reads the same file")
        XCTAssertFalse(el(app, "state-operational-error").exists)
        XCTAssertFalse(app.buttons["tab-today"].exists)
        attach(app, "live — identidade danificada, sem tentar de novo")
        // Still that state a moment later (nothing re-opens it into another state).
        XCTAssertFalse(el(app, "state-retry").waitForExistence(timeout: 3))
        XCTAssertTrue(el(app, "state-identity-damaged").exists)
        app.terminate()
    }

    /// A's first-launch reconciliation for this launch, from the Debug marker an isolated launch shows (`debug-host-reconciliation`):
    /// `<outcome> leftovers=<A's items in the Keychain before it opened> remaining=<of those, still there with the same bytes after>`.
    @MainActor
    private func reconciliation(_ app: XCUIApplication) -> (outcome: String, leftovers: Int, remaining: Int) {
        let probe = app.staticTexts["debug-host-reconciliation"]
        XCTAssertTrue(probe.waitForExistence(timeout: 30), "the Debug reconciliation marker")
        let parts = probe.label.split(separator: " ").map(String.init)
        func value(_ key: String) -> Int { parts.first { $0.hasPrefix(key + "=") }.flatMap { Int($0.dropFirst(key.count + 1)) } ?? -1 }
        return (parts.first ?? "", value("leftovers"), value("remaining"))
    }

    /// #49 through the live composition, as after a reinstall: the app's container goes, its Keychain items stay. The first install enrols
    /// (A's record, and its integrity key and the athlete's anchor in the Keychain); a relaunch of that install reconciles nothing and opens
    /// on Hoje. The next launch is a new install (a new token: no identity, no record, no install marker) over the same Keychain service:
    /// A's first-launch reconciliation reports `FRESH_INSTALL_PURGED`, found the first install's items (leftovers > 0) and none of them is
    /// still there once A has opened (remaining = 0). The athlete meets onboarding, never an error, and the real engine accepts a new
    /// enrolment. What it does not prove: that a leftover would have harmed the new account (its anchors are per athlete, never read by a
    /// new id); it proves the cleanup itself, which a broken removal fails.
    @MainActor
    func testAReinstallRemovesThePreviousInstallsKeychainItemsAndStartsANewAccount() {
        let first = launch()
        assertOnboarding(first, "live — primeira instalação")
        XCTAssertEqual(reconciliation(first).outcome, "FRESH_INSTALL_PURGED", "a new install reconciles")
        enroll(first, "primeira instalação")
        first.terminate()

        let relaunched = launch()
        XCTAssertTrue(relaunched.buttons["tab-today"].waitForExistence(timeout: 60), "the same install keeps its athlete")
        XCTAssertFalse(el(relaunched, "state-operational-error").exists)
        let same = reconciliation(relaunched)
        XCTAssertEqual(same.outcome, "NOT_NEEDED", "a relaunch of the same install reconciles nothing")
        XCTAssertGreaterThan(same.leftovers, 0, "the enrolled install has its items in the Keychain")
        relaunched.terminate()

        install = UUID().uuidString
        let reinstalled = launch()
        assertOnboarding(reinstalled, "live — reinstalação, Keychain mantido")
        let r = reconciliation(reinstalled)
        XCTAssertEqual(r.outcome, "FRESH_INSTALL_PURGED", "the reinstall reconciles")
        XCTAssertGreaterThan(r.leftovers, 0, "the first install's Keychain items were still there before A opened")
        XCTAssertEqual(r.remaining, 0, "none of them is left once A has opened")
        attach(reinstalled, "live — reinstalação: \(r.outcome) leftovers=\(r.leftovers) remaining=\(r.remaining)")
        enroll(reinstalled, "depois da reinstalação")
        reinstalled.terminate()
    }

    /// The first real journey (#17) and the erasure end to end (#63 P3-6), synthetic answers: the real engine builds the plan, a run is
    /// recorded by the live recorder into the real recordings store (see `recordARun`: before week 1 the report is not kept, so the recording
    /// ends discarded by C itself; the G07 erasure of C's store with a recording still in it is proven by `PendingErasureTests`, not here),
    /// the account is erased. The next launch is a new athlete id (CCP-A-05) and starts at onboarding; the composition's pending erasure
    /// runs and checks C's index before it opens (#63 P3-1). Then the athlete enrols AGAIN on the same install: the real host accepts the
    /// new id (A's purge of the erased account is done; no ANOTHER_ATHLETE_ON_THIS_INSTALL), and Hoje opens with nothing of a recording.
    /// The second account is erased too, so the install ends as it started (no record).
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
        enroll(again, "nova conta no mesmo aparelho")
        // Nothing of a recording comes back on Hoje (the shell restores one on appear): absent for a while, not just at one instant.
        XCTAssertFalse(el(again, "screen-report").waitForExistence(timeout: 5), "no report of a recording comes back")
        XCTAssertFalse(el(again, "run-timer").exists, "no recording comes back")
        eraseAccount(again, "nova conta")
        again.terminate()

        let last = launch()
        assertOnboarding(last, "live — terceira abertura, sem registro")
    }
}
