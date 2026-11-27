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

    /// #58: the proposal is the one re-read after the write. "pending" reads the engine's captured proposal (its run sessions are on screen),
    /// so it can be confirmed. (Before #58 this ran on "today", whose re-read has no proposal rows: it confirmed a change nobody could see.)
    @MainActor
    func testCantThisDayProposesAndConfirms() {
        let app = launch("pending")
        app.buttons["tab-plan"].tap()
        let row = app.buttons["plan-session-w0-run-d3"]
        XCTAssertTrue(row.waitForExistence(timeout: 10))
        row.tap()
        let cant = app.buttons["session-cant-this-day"]
        XCTAssertTrue(cant.waitForExistence(timeout: 10))
        cant.tap()
        let send = app.buttons["move-send"]
        XCTAssertTrue(send.waitForExistence(timeout: 5))
        XCTAssertFalse(send.isEnabled, "the day carries the eligibility screen (#72): unanswered, nothing is sent")
        answerReportScreen(app)
        scrollToReach(app, send)
        send.tap()
        let accept = app.buttons["move-accept"]
        XCTAssertTrue(accept.waitForExistence(timeout: 5))
        XCTAssertFalse(app.descendants(matching: .any)["move-proposal-unavailable"].exists, "the proposal's rows are on screen")
        attach(app, "Mover — proposta aguardando confirmação")
        accept.tap()
        XCTAssertTrue(app.staticTexts["Plano atualizado."].waitForExistence(timeout: 5))
    }

    /// #58: "today" re-reads a presentation with no proposal rows: "Confirmar a mudança" stays off and the fallback says why.
    @MainActor
    func testCantThisDayWithNoVisibleProposalCannotBeConfirmed() {
        let app = launch("today")
        app.buttons["today-view-session"].tap()
        let cant = app.buttons["session-cant-this-day"]
        XCTAssertTrue(cant.waitForExistence(timeout: 10))
        cant.tap()
        answerReportScreen(app)
        let send = app.buttons["move-send"]
        scrollToReach(app, send)
        send.tap()
        XCTAssertTrue(app.descendants(matching: .any)["move-proposal-unavailable"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.staticTexts["A mudança ainda não está disponível para revisar."].exists)
        let accept = app.buttons["move-accept"]
        XCTAssertTrue(accept.exists)
        XCTAssertFalse(accept.isEnabled, "never an invisible change confirmed")
        attach(app, "Mover — proposta sem linhas para revisar")
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
