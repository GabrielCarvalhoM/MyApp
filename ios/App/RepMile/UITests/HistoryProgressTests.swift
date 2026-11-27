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

    /// Scrolls until `e` lies whole in the band the athlete sees: below the sheet's navigation bar and above the keyboard. "Hittable" alone
    /// is not enough: a swipe can leave a row under the inline bar, which then takes the tap (the answer is never given).
    @MainActor
    private func reveal(_ app: XCUIApplication, _ e: XCUIElement) {
        func band() -> (top: CGFloat, bottom: CGFloat) {
            let bar = app.navigationBars.firstMatch, keys = app.keyboards.firstMatch
            return (bar.exists ? bar.frame.maxY : app.frame.minY, keys.exists ? keys.frame.minY : app.frame.maxY)
        }
        var tries = 0
        while tries < 10 {
            let (top, bottom) = band()
            if e.isHittable && e.frame.minY >= top && e.frame.maxY <= bottom { break }
            if e.exists && e.frame.minY < top { app.swipeDown(velocity: .slow) } else { app.swipeUp(velocity: .slow) }
            tries += 1
        }
    }
    @MainActor private func tapVisible(_ app: XCUIApplication, _ e: XCUIElement) { reveal(app, e); e.tap() }

    /// #58, #59: a kept correction says "salvo" and the history is read again. The correction asks the eligibility screen with it (the engine
    /// records no report without one): "Enviar correção" stays off until the six flags are answered "não" and confirmed. The fixture reader is
    /// static per scenario, so the re-read returns the same capture (the uncontested row): that the re-read row carries the correction and is
    /// offered again (#70) is covered by unit tests and by `testACorrectedRowIsOfferedAgain`.
    @MainActor
    func testKeptCorrectionIsSaved() {
        let app = launch("today")
        app.buttons["tab-history"].tap()
        let row = app.buttons["history-row-ob_0e0b22854e702dd5da6c7bca67"]
        XCTAssertTrue(row.waitForExistence(timeout: 10))
        row.tap()
        let contest = app.buttons["history-contest"]
        XCTAssertTrue(contest.waitForExistence(timeout: 5))
        contest.tap()
        let km = app.textFields["contest-km"]
        XCTAssertTrue(km.waitForExistence(timeout: 5))
        km.tap(); km.typeText("7")
        let send = app.buttons["contest-send"]
        XCTAssertFalse(send.isEnabled, "no screen answered: nil is not \"não\"")
        for k in ["pain", "persistentPain", "injury", "illness", "functionalLimitation", "clinicalConcern"] {
            let no = app.buttons["eligibility-\(k)-no"]
            tapVisible(app, no)
            XCTAssertTrue(no.isSelected, "\(k) answered \"não\"")
        }
        XCTAssertFalse(send.isEnabled, "all \"não\" but not confirmed")
        let confirm = app.switches["eligibility-confirm"]
        reveal(app, confirm)
        confirm.switches.firstMatch.tap()   // the switch itself, not the label beside it
        XCTAssertEqual(confirm.value as? String, "1", "the athlete confirmed none applies")
        XCTAssertTrue(send.isEnabled, "answered and confirmed")
        tapVisible(app, send)
        XCTAssertTrue(app.staticTexts["Salvo no seu histórico."].waitForExistence(timeout: 5))
        XCTAssertFalse(app.buttons["history-contest"].exists, "not offered again on this screen")
        attach(app, "Histórico — correção salva")
    }

    /// #70 (a): a row already corrected is offered the correction again (the engine admits a correction of the correction in force, replay
    /// i70 §1), with the copy that says what the engine reads (SSCTR #59 P2-4): the measured value kept, the smaller of the two counted.
    @MainActor
    func testACorrectedRowIsOfferedAgain() {
        let app = launch("history-unplanned")
        app.buttons["tab-history"].tap()
        let row = app.buttons["history-row-ob_0e0b22854e702dd5da6c7bca67"]
        XCTAssertTrue(row.waitForExistence(timeout: 10))
        row.tap()
        XCTAssertTrue(el(app, "history-detail").waitForExistence(timeout: 5))
        let contest = app.buttons["history-contest"]
        XCTAssertTrue(contest.waitForExistence(timeout: 5), "a corrected row is offered again")
        contest.tap()
        XCTAssertTrue(app.textFields["contest-km"].waitForExistence(timeout: 5))
        XCTAssertEqual(app.textFields["contest-km"].value as? String, "Distância (km)", "nothing pre-filled from the earlier correction")
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'conta pela menor das duas'")).firstMatch.exists)
        XCTAssertFalse(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'como sua'")).firstMatch.exists, "the old promise is gone")
        attach(app, "Histórico — correção de uma linha já corrigida")
    }

    /// #70 (b): a lone "sim" is sent at once (the engine routes it before the other flags, replay i70 §3): "Enviar correção" turns on with
    /// the five others unanswered, and the answer is the clinical route, never "salvo" nor "envie de novo".
    @MainActor
    func testALoneSimIsSentAndRoutesToAHuman() {
        let app = launch("today")
        app.buttons["tab-history"].tap()
        let row = app.buttons["history-row-ob_0e0b22854e702dd5da6c7bca67"]
        XCTAssertTrue(row.waitForExistence(timeout: 10))
        row.tap()
        let contest = app.buttons["history-contest"]
        XCTAssertTrue(contest.waitForExistence(timeout: 5))
        contest.tap()
        let km = app.textFields["contest-km"]
        XCTAssertTrue(km.waitForExistence(timeout: 5))
        km.tap(); km.typeText("7")
        let send = app.buttons["contest-send"]
        XCTAssertFalse(send.isEnabled, "no screen answered")
        let yes = app.buttons["eligibility-pain-yes"]
        tapVisible(app, yes)
        XCTAssertTrue(yes.isSelected)
        XCTAssertFalse(app.buttons["eligibility-illness-no"].isSelected, "the others stay unanswered")
        XCTAssertTrue(send.isEnabled, "a \"sim\" waits for no other flag")
        tapVisible(app, send)
        XCTAssertTrue(el(app, "contest-blocked").waitForExistence(timeout: 5), "the clinical route")
        XCTAssertFalse(app.staticTexts["Salvo no seu histórico."].exists)
        attach(app, "Histórico — um \"sim\" sozinho vai para a rota clínica")
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
