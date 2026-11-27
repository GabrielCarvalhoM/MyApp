import XCTest

/// Execution (40/41), unplanned workouts and the safety flows (72) on the dedicated simulator. Location is scripted (`-simulatedLocation`):
/// no permission prompt; the run counts by time.
final class ExecutionAndSafetyTests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func launch(_ scenario: String) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", scenario, "-simulatedLocation", "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
        app.launch()
        return app
    }
    @MainActor private func el(_ app: XCUIApplication, _ id: String) -> XCUIElement { app.descendants(matching: .any)[id] }
    @MainActor
    private func attach(_ app: XCUIApplication, _ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }

    @MainActor
    func testPlannedRunRecordReportAndSave() {
        let app = launch("today")
        app.buttons["today-start"].tap()
        XCTAssertTrue(el(app, "run-timer").waitForExistence(timeout: 10))
        XCTAssertTrue(el(app, "run-step").exists)
        XCTAssertTrue(el(app, "run-location-NO_SIGNAL").exists, "location state visible, the run continues by time")
        attach(app, "Execução — corrida sem FC ao vivo (40)")
        app.buttons["run-pause"].tap()
        XCTAssertTrue(app.staticTexts["Pausado"].waitForExistence(timeout: 3))
        app.buttons["run-pause"].tap()
        app.buttons["run-finish"].tap()
        app.buttons["run-finish-confirm"].firstMatch.tap()
        XCTAssertTrue(el(app, "screen-report").waitForExistence(timeout: 5))
        app.buttons["report-rpe-4"].tap()
        attach(app, "Relato — corrida planejada")
        answerReportScreen(app)
        let save = app.buttons["report-save"]
        while !save.isHittable { app.swipeUp() }
        save.tap()
        XCTAssertTrue(el(app, "report-saved").waitForExistence(timeout: 5))
    }

    /// Verification of increment 09, N1: a stop for a symptom always shows the warning-sign screen, also when the report is not kept
    /// (fixture `actions-C1-run-stop-symptom`: REQUIRED, recorded id not in the logged entries), and the report stays resendable.
    @MainActor
    func testSymptomStopAlwaysOffersTheWarningSignScreen() {
        let app = launch("today")
        app.buttons["today-start"].tap()
        XCTAssertTrue(el(app, "run-timer").waitForExistence(timeout: 10))
        app.buttons["run-finish"].tap()
        app.buttons["run-finish-confirm"].firstMatch.tap()
        XCTAssertTrue(el(app, "screen-report").waitForExistence(timeout: 5))
        let stopped = app.switches["report-stopped"]
        for _ in 0..<6 where !stopped.isHittable { app.swipeUp() }
        stopped.switches.firstMatch.tap()
        let reason = el(app, "report-stop-reason")
        XCTAssertTrue(reason.waitForExistence(timeout: 3))
        reason.tap()
        app.buttons["Senti um sintoma"].firstMatch.tap()
        answerReportScreen(app)
        let save = app.buttons["report-save"]
        for _ in 0..<6 where !save.isHittable { app.swipeUp() }
        save.tap()
        XCTAssertTrue(el(app, "report-not-kept").waitForExistence(timeout: 5), "this capture's recorded id is not in the logged entries")
        let banner = el(app, "report-screen-required")
        XCTAssertTrue(banner.waitForExistence(timeout: 5), "REQUIRED shows the screen whether or not the report was kept")
        XCTAssertFalse(app.buttons["report-done"].exists, "a report that was not kept is not closed by 'Concluir'")
        XCTAssertTrue(app.buttons["report-save"].exists, "and stays resendable")
        attach(app, "Relato — parada por sintoma, triagem exigida")
    }

    @MainActor
    func testUnplannedRunAsksTheSymptomQuestionAndOpensNotFeeling100() {
        let app = launch("today")
        app.buttons["tab-add"].tap()
        XCTAssertTrue(app.buttons["add-run-now"].waitForExistence(timeout: 5))
        app.buttons["add-run-now"].tap()
        XCTAssertTrue(el(app, "run-timer").waitForExistence(timeout: 10))
        app.buttons["run-finish"].tap()
        app.buttons["run-finish-confirm"].firstMatch.tap()
        XCTAssertTrue(el(app, "screen-report").waitForExistence(timeout: 5))
        XCTAssertTrue(app.staticTexts["Parou ou sentiu algo fora do normal?"].exists)
        XCTAssertFalse(app.buttons["report-save"].isEnabled, "no answer is not 'no': the report waits for one")
        attach(app, "Avulsa — pergunta obrigatória (661:1215)")
        app.buttons["report-unusual-yes"].tap()
        XCTAssertTrue(el(app, "flow-not-feeling-100").waitForExistence(timeout: 5), "'yes' opens Não estou 100% at once")
        app.buttons["Fechar"].firstMatch.tap()
        XCTAssertTrue(el(app, "screen-report").waitForExistence(timeout: 5), "closing the flow returns to the report, still to save")
        let save = app.buttons["report-save"]
        XCTAssertFalse(save.isEnabled, "the report asks its own eligibility screen (#68)")
        answerReportScreen(app)
        XCTAssertTrue(save.isEnabled)
        while !save.isHittable { app.swipeUp() }
        save.tap()
        XCTAssertTrue(el(app, "report-saved").waitForExistence(timeout: 5))
        app.buttons["report-done"].tap()
        XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 5), "the report has a way out")
    }

    // "Não estou 100%" from the shell and the readiness declaration: EligibilityRestUITests (#72).

    @MainActor
    func testUnplannedRunIsNotStartedUnderAHold() {
        let app = launch("blocked")
        app.buttons["tab-add"].tap()
        XCTAssertTrue(app.buttons["add-run-now"].waitForExistence(timeout: 5))
        XCTAssertFalse(app.buttons["add-run-now"].isEnabled)
        XCTAssertTrue(el(app, "add-run-blocked").exists)
    }

    /// Founder provisional decision (26/11): no unplanned run outside V1 scope or with a symptom screen pending (QRE/SSCTR recheck N8/N11).
    @MainActor
    func testUnplannedRunIsNotStartedOutsideScopeOrWithAScreenPending() {
        for scenario in ["restart-outside-scope", "screen-required"] {
            let app = launch(scenario)
            app.buttons["tab-add"].tap()
            XCTAssertTrue(app.buttons["add-run-now"].waitForExistence(timeout: 5), scenario)
            XCTAssertFalse(app.buttons["add-run-now"].isEnabled, scenario)
            XCTAssertTrue(el(app, "add-run-blocked").exists, scenario)
            XCTAssertTrue(app.buttons["add-log-strength"].isEnabled, "logging what was done stays possible: \(scenario)")
            app.terminate()
        }
    }

    @MainActor
    func testReportCanBeLeftWithoutSaving() {
        let app = launch("today")
        app.buttons["today-start"].tap()
        XCTAssertTrue(el(app, "run-timer").waitForExistence(timeout: 10))
        app.buttons["run-finish"].tap()
        app.buttons["run-finish-confirm"].firstMatch.tap()
        XCTAssertTrue(el(app, "screen-report").waitForExistence(timeout: 5))
        let leave = app.buttons["report-leave"]
        while !leave.isHittable { app.swipeUp() }
        leave.tap()
        app.buttons["Sair sem salvar"].firstMatch.tap()
        XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 5))
    }

    /// A recording survives a killed process and comes back on screen (handoff C §5).
    @MainActor
    func testRecordingResumesAfterTheProcessIsKilled() {
        let store = UUID().uuidString
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", "today", "-simulatedLocation", "-recordingStore", store, "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
        app.launch()
        app.buttons["today-start"].tap()
        XCTAssertTrue(el(app, "run-timer").waitForExistence(timeout: 10))
        app.buttons["run-pause"].tap()  // persists the state
        app.terminate()
        app.launch()
        XCTAssertTrue(el(app, "run-timer").waitForExistence(timeout: 10), "the recording in progress is back")
        XCTAssertTrue(app.staticTexts["Pausado"].exists)
        attach(app, "Execução — retomada depois de matar o processo")
        app.buttons["run-finish"].tap()
        app.buttons["Descartar sem salvar"].firstMatch.tap()
    }

    /// #38: a recording resumed after a killed process, when a safety block arrived meanwhile, keeps recording but shows no step,
    /// target or countdown, and can still be finished and reported (SSCTR rule).
    @MainActor
    func testResumedRunUnderABlockShowsNoPrescriptionAndCanBeReported() {
        let store = UUID().uuidString
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", "today", "-simulatedLocation", "-recordingStore", store, "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
        app.launch()
        app.buttons["today-start"].tap()
        XCTAssertTrue(el(app, "run-step").waitForExistence(timeout: 10), "a planned run shows its steps before the block")
        app.buttons["run-pause"].tap()  // persists the state
        app.terminate()
        app.launchArguments = ["-scenario", "blocked", "-simulatedLocation", "-recordingStore", store, "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
        app.launch()
        XCTAssertTrue(el(app, "run-safety-gate").waitForExistence(timeout: 10), "the block that arrived meanwhile is shown")
        XCTAssertFalse(el(app, "run-step").exists, "no prescribed step under a block")
        XCTAssertTrue(el(app, "run-timer").exists, "the recording continues")
        XCTAssertTrue(el(app, "run-timer-elapsed").exists, "the main number is the elapsed time, not a countdown")
        XCTAssertFalse(app.staticTexts["restantes"].exists, "no countdown under a block")
        XCTAssertTrue(app.staticTexts["Pausado"].exists, "the recording itself is untouched")
        attach(app, "Execução — retomada sob bloqueio (#38)")
        app.buttons["run-finish"].tap()
        app.buttons["run-finish-confirm"].firstMatch.tap()
        XCTAssertTrue(el(app, "screen-report").waitForExistence(timeout: 5), "finishing still leads to the report")
    }

    @MainActor
    func testUnplannedStrengthSavedOnlyWhenKept() {
        let app = launch("today")
        app.buttons["tab-add"].tap()
        XCTAssertTrue(app.buttons["add-log-strength"].waitForExistence(timeout: 5))
        app.buttons["add-log-strength"].tap()
        XCTAssertTrue(el(app, "screen-strength-log").waitForExistence(timeout: 5))
        XCTAssertFalse(app.buttons["strength-save"].isEnabled, "minutes are the athlete's, never defaulted")
        let inc = app.steppers["strength-minutes"].buttons.element(boundBy: 1)
        for _ in 0..<6 { inc.tap() }
        answerReportScreen(app)
        app.buttons["strength-save"].tap()
        XCTAssertTrue(el(app, "strength-saved").waitForExistence(timeout: 5))
    }

    /// #37: a planned strength session records only what the athlete confirmed. Untouched (minutes alone) it cannot be saved; "Fiz como
    /// prescrito" states every prescribed set.
    @MainActor
    func testPlannedStrengthConfirmedAsPrescribed() {
        let app = openPlannedStrength()
        XCTAssertEqual(app.buttons["set-goblet-squat-0"].value as? String, "não registrada", "no set is pre-filled as done")
        XCTAssertEqual(app.buttons["set-goblet-squat-0"].label, "Agachamento goblet, série 1", "VoiceOver hears which exercise and set")
        addStrengthMinutes(app)
        let save = app.buttons["strength-save"]
        XCTAssertFalse(save.isEnabled, "minutes alone never report the prescribed sets as done")
        XCTAssertTrue(el(app, "strength-needs-set").exists)
        for _ in 0..<8 where !app.buttons["strength-as-prescribed"].isHittable { app.swipeDown() }
        app.buttons["strength-as-prescribed"].tap()
        XCTAssertEqual(app.buttons["set-goblet-squat-0"].value as? String, "registrada, 8 repetições")
        XCTAssertEqual(app.buttons["set-goblet-squat-1"].value as? String, "registrada, 8 repetições")
        XCTAssertEqual(app.steppers["reps-goblet-squat-1"].value as? String, "8", "VoiceOver hears the stated count")
        XCTAssertFalse(app.buttons["strength-as-prescribed"].exists, "offered only while nothing is stated")
        attach(app, "Execução de força — fiz como prescrito (41)")
        answerReportScreen(app)
        for _ in 0..<8 where !save.isHittable { app.swipeUp() }
        XCTAssertTrue(save.isEnabled)
        XCTAssertEqual(app.buttons["set-dead-bug-0"].value as? String, "registrada, 10 repetições")
        save.tap()
        XCTAssertTrue(el(app, "strength-saved").waitForExistence(timeout: 5))
    }

    /// #37: a partial log. One set checked as prescribed, another stated by its repetitions; every other set stays unrecorded.
    @MainActor
    func testPlannedStrengthPartialLog() {
        let app = openPlannedStrength()
        app.buttons["set-goblet-squat-0"].tap()
        let reps = app.steppers["reps-goblet-squat-1"].buttons.element(boundBy: 1)
        for _ in 0..<5 { reps.tap() }
        XCTAssertEqual(app.buttons["set-goblet-squat-0"].value as? String, "registrada, 8 repetições")
        XCTAssertEqual(app.buttons["set-goblet-squat-1"].value as? String, "registrada, 5 repetições")
        XCTAssertEqual(app.steppers["reps-goblet-squat-1"].value as? String, "5", "VoiceOver hears the stated count")
        XCTAssertEqual(app.buttons["set-db-bench-press-0"].value as? String, "não registrada")
        XCTAssertEqual(app.steppers["reps-db-bench-press-0"].value as? String, "não registrada")
        XCTAssertTrue(app.textFields["load-goblet-squat-1"].isEnabled)
        XCTAssertFalse(app.textFields["load-db-bench-press-0"].isEnabled, "no load before the set is stated")
        app.steppers["reps-db-bench-press-0"].buttons.element(boundBy: 1).tap()
        XCTAssertEqual(app.buttons["set-db-bench-press-0"].value as? String, "registrada, 1 repetição", "singular for one")
        XCTAssertEqual(app.buttons["set-db-bench-press-1"].value as? String, "não registrada")
        attach(app, "Execução de força — registro parcial (41)")
        addStrengthMinutes(app)
        answerReportScreen(app)
        let save = app.buttons["strength-save"]
        for _ in 0..<8 where !save.isHittable { app.swipeUp() }
        XCTAssertTrue(save.isEnabled, "a partial log can be saved")
        save.tap()
        XCTAssertTrue(el(app, "strength-saved").waitForExistence(timeout: 5))
    }

    @MainActor
    private func openPlannedStrength() -> XCUIApplication {
        let app = launch("first-week")
        app.buttons["tab-plan"].tap()
        let row = app.buttons["plan-session-w0-str-d2"]
        XCTAssertTrue(row.waitForExistence(timeout: 10))
        row.tap()
        let start = app.buttons["session-start"]
        XCTAssertTrue(start.waitForExistence(timeout: 5))
        start.tap()
        XCTAssertTrue(el(app, "screen-strength-log").waitForExistence(timeout: 5))
        return app
    }

    @MainActor
    private func addStrengthMinutes(_ app: XCUIApplication) {
        let minutes = app.steppers["strength-minutes"]
        for _ in 0..<8 where !minutes.isHittable { app.swipeUp() }
        let inc = minutes.buttons.element(boundBy: 1)
        for _ in 0..<6 { inc.tap() }
    }
}
