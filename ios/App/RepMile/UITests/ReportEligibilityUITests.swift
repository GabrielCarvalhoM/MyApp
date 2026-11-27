import XCTest

extension XCTestCase {
    /// #68: answers the eligibility screen a report asks: every flag "não" and the confirmation, or "sim" on `yes` (never confirmed then).
    @MainActor
    func answerReportScreen(_ app: XCUIApplication, yes: String? = nil) {
        for k in ["pain", "persistentPain", "injury", "illness", "functionalLimitation", "clinicalConcern"] {
            let b = app.buttons["eligibility-\(k)-\(k == yes ? "yes" : "no")"]
            scrollToReach(app, b); b.tap()
        }
        guard yes == nil else { return }
        let confirm = app.switches["eligibility-confirm"]
        scrollToReach(app, confirm)
        confirm.switches.firstMatch.exists ? confirm.switches.firstMatch.tap() : confirm.tap()
    }

    @MainActor
    func scrollToReach(_ app: XCUIApplication, _ e: XCUIElement) {
        var tries = 0
        while !e.isHittable && tries < 8 { app.swipeUp(); tries += 1 }
    }
}

/// #68: the run report and the strength log ask the eligibility screen themselves (the engine records no athlete report without a current
/// one). Unanswered, nothing can be saved; a "sim" reaches the engine and its clinical route shows the existing safety state (fixture mode
/// answers as the engine: the captured clinical route, nothing recorded).
final class ReportEligibilityUITests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func launch() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", "today", "-simulatedLocation", "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
        app.launch()
        return app
    }
    @MainActor private func el(_ app: XCUIApplication, _ id: String) -> XCUIElement { app.descendants(matching: .any)[id] }
    @MainActor
    private func attach(_ app: XCUIApplication, _ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }

    @MainActor
    func testRunReportWaitsForTheScreenAndAYesShowsTheSafetyPause() {
        let app = launch()
        app.buttons["today-start"].tap()
        XCTAssertTrue(el(app, "run-timer").waitForExistence(timeout: 10))
        app.buttons["run-finish"].tap()
        app.buttons["run-finish-confirm"].firstMatch.tap()
        XCTAssertTrue(el(app, "screen-report").waitForExistence(timeout: 5))
        app.buttons["report-rpe-4"].tap()
        let save = app.buttons["report-save"]
        XCTAssertFalse(save.isEnabled, "no screen answered: nil is not \"não\"")
        answerReportScreen(app, yes: "injury")
        scrollToReach(app, save)
        XCTAssertTrue(save.isEnabled, "a \"sim\" is an answer; the engine routes it")
        save.tap()
        XCTAssertTrue(el(app, "report-blocked").waitForExistence(timeout: 5), "the clinical route uses the existing safety state")
        XCTAssertTrue(app.staticTexts["Este relato da sessão não foi salvo; o que já estava no seu histórico continua guardado. Seu rascunho continua aqui."].exists)
        XCTAssertFalse(app.buttons["report-done"].exists, "'Concluir' would drop the draft")
        attach(app, "Relato — triagem com \"sim\": pausa por segurança (#68)")
    }

    @MainActor
    func testStrengthLogWaitsForTheScreenAndAYesShowsTheSafetyPause() {
        let app = launch()
        app.buttons["tab-add"].tap()
        XCTAssertTrue(app.buttons["add-log-strength"].waitForExistence(timeout: 5))
        app.buttons["add-log-strength"].tap()
        XCTAssertTrue(el(app, "screen-strength-log").waitForExistence(timeout: 5))
        let inc = app.steppers["strength-minutes"].buttons.element(boundBy: 1)
        for _ in 0..<6 { inc.tap() }
        let save = app.buttons["strength-save"]
        XCTAssertFalse(save.isEnabled, "minutes stated, screen unanswered")
        answerReportScreen(app, yes: "pain")
        scrollToReach(app, save)
        save.tap()
        XCTAssertTrue(el(app, "strength-blocked").waitForExistence(timeout: 5))
        XCTAssertFalse(el(app, "strength-saved").exists)
        attach(app, "Força — triagem com \"sim\": pausa por segurança (#68)")
    }
}
