import XCTest

/// Plano (30), Treino planejado (31) and "não posso neste dia" (GAP-09) on the dedicated simulator.
final class PlanAndSessionTests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func launch(_ scenario: String) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", scenario, "-simulatedLocation", "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
        app.launch()
        return app
    }

    @MainActor
    private func attach(_ app: XCUIApplication, _ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }

    @MainActor
    func testPlanWeekNavigationAndSegments() {
        let app = launch("today")
        app.buttons["tab-plan"].tap()
        XCTAssertTrue(app.descendants(matching: .any)["plan-summary"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label BEGINSWITH 'Semana 1 de 12'")).firstMatch.exists)
        attach(app, "Plano — semana (today)")
        app.buttons["Próxima semana"].tap()
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label BEGINSWITH 'Semana 2 de 12'")).firstMatch.waitForExistence(timeout: 5))
        app.buttons["plan-segment-phases"].tap()
        XCTAssertTrue(app.descendants(matching: .any)["plan-phases"].waitForExistence(timeout: 5))
        attach(app, "Plano — fases")
        app.buttons["plan-segment-month"].tap()
        XCTAssertTrue(app.descendants(matching: .any)["plan-month"].waitForExistence(timeout: 5))
        attach(app, "Plano — mês")
    }

    @MainActor
    func testRunSessionDetailShowsEngineStepsAndStarts() {
        let app = launch("today")
        app.buttons["today-view-session"].tap()
        XCTAssertTrue(app.descendants(matching: .any)["session-steps"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.staticTexts["80 min"].exists)
        attach(app, "Treino planejado — longão (643:317)")
        XCTAssertTrue(app.buttons["session-start"].isEnabled)
    }

    @MainActor
    func testStrengthSessionDetailShowsPrescribedLoadsOnly() {
        let app = launch("first-week")
        app.buttons["tab-plan"].tap()
        let row = app.buttons["plan-session-w0-str-d2"]
        XCTAssertTrue(row.waitForExistence(timeout: 10))
        row.tap()
        XCTAssertTrue(app.descendants(matching: .any)["session-exercises"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'carga a estabelecer'")).firstMatch.exists)
        attach(app, "Treino planejado — força, carga a estabelecer (730:…)")
    }

    @MainActor
    func testCantThisDayProposesAndConfirms() {
        let app = launch("today")
        app.buttons["today-view-session"].tap()
        let cant = app.buttons["session-cant-this-day"]
        XCTAssertTrue(cant.waitForExistence(timeout: 10))
        cant.tap()
        app.buttons["move-send"].tap()
        let accept = app.buttons["move-accept"]
        XCTAssertTrue(accept.waitForExistence(timeout: 5))
        attach(app, "Mover — proposta aguardando confirmação")
        accept.tap()
        XCTAssertTrue(app.staticTexts["Plano atualizado."].waitForExistence(timeout: 5))
    }

    @MainActor
    func testBlockedSessionDetailShowsNoStepsOrStart() {
        let app = launch("blocked")
        app.buttons["tab-plan"].tap()
        let row = app.buttons["plan-session-w1-run-d1"]
        XCTAssertTrue(row.waitForExistence(timeout: 10))
        row.tap()
        XCTAssertTrue(app.descendants(matching: .any)["screen-session"].waitForExistence(timeout: 5))
        XCTAssertFalse(app.descendants(matching: .any)["session-steps"].exists)
        XCTAssertFalse(app.buttons["session-start"].exists)
        attach(app, "Treino planejado — bloqueado")
    }
}
