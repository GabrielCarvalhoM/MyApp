import XCTest

/// Histórico (50) and Progresso (60) on the dedicated simulator.
final class HistoryProgressTests: XCTestCase {
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
    func testHistoryKeepsMeasuredDeclaredAndContestedApart() {
        let app = launch("history-unplanned")
        app.buttons["tab-history"].tap()
        XCTAssertTrue(el(app, "screen-history").waitForExistence(timeout: 10))
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'medidos'")).firstMatch.exists)
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'você corrigiu para'")).firstMatch.exists)
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'Não foi salvo como sessão separada'")).firstMatch.exists)
        XCTAssertTrue(el(app, "health-status").exists)
        attach(app, "Histórico — avulsas, medida × corrigida, mescla")
    }

    @MainActor
    func testConflictedRowShowsEveryVoice() {
        let app = launch("history-conflict")
        app.buttons["tab-history"].tap()
        let row = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'history-row-'")).firstMatch
        XCTAssertTrue(row.waitForExistence(timeout: 10))
        row.tap()
        XCTAssertTrue(el(app, "history-voice-ATHLETE").waitForExistence(timeout: 5))
        XCTAssertTrue(el(app, "history-voice-DEVICE").exists)
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label BEGINSWITH 'Parou'")).firstMatch.exists, "the athlete's stop is visible in its voice")
        attach(app, "Histórico — vozes do atleta e do relógio")
    }

    @MainActor
    func testEmptyHistory() {
        let app = launch("first-week")
        app.buttons["tab-history"].tap()
        XCTAssertTrue(el(app, "screen-history").waitForExistence(timeout: 10))
    }

    @MainActor
    func testProgressRangeFirstAndPlanScenario() {
        let app = launch("week-done")
        app.buttons["tab-progress"].tap()
        XCTAssertTrue(el(app, "progress-estimates").waitForExistence(timeout: 10))
        XCTAssertTrue(el(app, "progress-forecast").exists)
        XCTAssertTrue(app.staticTexts["Precisa de um resultado de meia maratona ou mais longo."].exists, "an unavailable estimate shows its reason, never a number")
        attach(app, "Progresso — estimativas e cenário do plano")
        app.swipeUp()
        XCTAssertTrue(el(app, "progress-volume").exists)
        attach(app, "Progresso — volume e consistência")
    }
}
