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
        XCTAssertTrue(save.isEnabled)
        while !save.isHittable { app.swipeUp() }
        save.tap()
        XCTAssertTrue(el(app, "report-saved").waitForExistence(timeout: 5))
        app.buttons["report-done"].tap()
        XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 5), "the report has a way out")
    }

    @MainActor
    func testNotFeeling100AsksTheEngineSignsForTheCondition() {
        let app = launch("today")
        el(app, "today-changed").tap()
        XCTAssertTrue(app.buttons["changes-not-feeling"].waitForExistence(timeout: 5))
        app.buttons["changes-not-feeling"].tap()
        XCTAssertTrue(el(app, "flow-not-feeling-100").waitForExistence(timeout: 5))
        app.buttons["condition-MINOR_DISCOMFORT"].tap()
        XCTAssertTrue(el(app, "signs-9").waitForExistence(timeout: 5), "MINOR_DISCOMFORT asks 9 signs")
        attach(app, "72 — 9 sinais (843:1751)")
        for sign in ["feverOrChills", "chestPainPressureOrTightness", "breathlessAtRest", "palpitationsAtRest", "faintingOrDizziness",
                     "painThatChangesMovement", "swelling", "injuryFromFallOrImpact", "gettingWorse"] {
            let b = app.buttons["sign-\(sign)-no"]
            while !b.isHittable { app.swipeUp() }
            b.tap()
        }
        let intent = app.buttons["intent-REDUCE_LIGHT"]
        while !intent.isHittable { app.swipeUp() }
        intent.tap()
        app.buttons["nf-send"].tap()
        XCTAssertTrue(el(app, "nf-kept").waitForExistence(timeout: 5))
    }

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

    @MainActor
    func testBlockedReadinessAsksFifteenSignsAndReturns() {
        let app = launch("blocked")
        app.buttons["Estou pronto para voltar"].tap()
        XCTAssertTrue(el(app, "signs-15").waitForExistence(timeout: 5))
        app.buttons["readiness-recovered-yes"].tap()
        attach(app, "72 — prontidão, 15 sinais (843:1980)")
        let send = app.buttons["readiness-send"]
        while !send.isHittable { app.swipeUp() }
        send.tap()
        XCTAssertTrue(el(app, "readiness-returning").waitForExistence(timeout: 5))
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
        app.buttons["strength-save"].tap()
        XCTAssertTrue(el(app, "strength-saved").waitForExistence(timeout: 5))
    }
}
