import XCTest

/// Onboarding (10) on the dedicated simulator, from the NOT_ENROLLED state.
final class OnboardingUITests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func launch() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", "no-data", "-simulatedLocation", "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
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

    /// Waits (generously: the host may be loaded) for `ob-next` to exist and be enabled, taps it, then waits for the next step's own element.
    @MainActor
    private func tapNext(_ app: XCUIApplication, expecting next: XCUIElement?, _ step: String) {
        let button = app.buttons["ob-next"]
        let ready = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == true AND isEnabled == true"), object: button)
        XCTAssertEqual(XCTWaiter.wait(for: [ready], timeout: 10), .completed, "ob-next enabled before \(step)")
        button.tap()
        if let next { XCTAssertTrue(next.waitForExistence(timeout: 10), "reached \(step)") }
    }

    /// Goes to Cuidados; answers the eligibility flags "não" and confirms.
    @MainActor
    private func reachCare(_ app: XCUIApplication) {
        XCTAssertTrue(el(app, "screen-onboarding").waitForExistence(timeout: 10))
        attach(app, "10 — boas-vindas")
        let age = app.textFields["ob-age"]
        tapNext(app, expecting: age, "age")
        XCTAssertFalse(app.buttons["ob-next"].isEnabled, "no age typed: cannot continue (never defaulted)")
        age.tap(); age.typeText("32")
        // #61: the race date and the plan length are chosen, never defaulted.
        tapNext(app, expecting: app.buttons["ob-event-date"], "goals")
        chooseRaceDate(app)
        tapNext(app, expecting: app.staticTexts["Sua experiência"], "experience")
        tapNext(app, expecting: app.staticTexts["Sua semana"], "schedule")
        tapScrolling(app, app.buttons["chip-12"])
        tapNext(app, expecting: app.staticTexts["O que você tem para treinar força?"], "equipment")
        tapNext(app, expecting: el(app, "ob-anchor-toggle"), "anchor")
        tapNext(app, expecting: app.staticTexts["Cuidados"], "care")
        XCTAssertFalse(app.buttons["ob-next"].isEnabled, "no choice: cannot continue")
        attach(app, "10 — Cuidados sem escolha (836:3299)")
    }

    /// Opens the race-date calendar, moves to next month and picks the 15th (within a 12-week plan from the next Monday), then confirms.
    @MainActor
    private func chooseRaceDate(_ app: XCUIApplication) {
        tapScrolling(app, app.buttons["ob-event-date"])
        let picker = app.datePickers.firstMatch
        XCTAssertTrue(picker.waitForExistence(timeout: 10))
        // The system calendar's own identifiers (its labels are localised); wait until the header shows the next month.
        let header = picker.buttons["DatePicker.Show"].staticTexts.firstMatch  // the month shown, e.g. "novembro de 2026"
        XCTAssertTrue(header.waitForExistence(timeout: 10))
        let shown = header.label
        XCTAssertFalse(shown.isEmpty, "the calendar names the month it shows")
        picker.buttons["DatePicker.NextMonth"].tap()
        let moved = XCTNSPredicateExpectation(predicate: NSPredicate(format: "label != %@", shown), object: header)
        XCTAssertEqual(XCTWaiter.wait(for: [moved], timeout: 10), .completed, "the calendar shows the next month")
        let day = picker.buttons.matching(NSPredicate(format: "label CONTAINS ', 15 de ' AND enabled == true")).firstMatch
        XCTAssertTrue(day.waitForExistence(timeout: 10))
        let confirm = app.buttons["ob-event-date-confirm"]
        XCTAssertFalse(confirm.isEnabled, "the day the calendar opens on is not a choice")
        day.tap()
        let enabled = XCTNSPredicateExpectation(predicate: NSPredicate(format: "isEnabled == true"), object: confirm)
        XCTAssertEqual(XCTWaiter.wait(for: [enabled], timeout: 10), .completed, "a tapped day can be confirmed")
        confirm.tap()
        XCTAssertTrue(app.buttons["ob-event-date-confirm"].waitForNonExistence(timeout: 10), "the calendar closed")
    }

    @MainActor
    private func answerEligibility(_ app: XCUIApplication) {
        for k in ["pain", "persistentPain", "injury", "illness", "functionalLimitation", "clinicalConcern"] { tapScrolling(app, app.buttons["eligibility-\(k)-no"]) }
        let confirm = app.switches["eligibility-confirm"]
        var tries = 0
        while !confirm.isHittable && tries < 8 { app.swipeUp(); tries += 1 }
        confirm.switches.firstMatch.exists ? confirm.switches.firstMatch.tap() : confirm.tap()
    }

    @MainActor
    private func consentAndBuild(_ app: XCUIApplication) {
        tapNext(app, expecting: app.buttons["consent-COACHING-yes"], "consents")
        for p in ["COACHING", "HEALTH_SIGNALS", "LEARNING"] { tapScrolling(app, app.buttons["consent-\(p)-yes"]) }
        tapNext(app, expecting: nil, "build")
    }

    @MainActor
    func testNoneOfTheseBuildsAPlan() {
        let app = launch()
        reachCare(app)
        app.buttons["ob-care.none"].tap()
        answerEligibility(app)
        XCTAssertTrue(app.buttons["ob-next"].isEnabled)
        consentAndBuild(app)
        XCTAssertTrue(el(app, "ob-created").waitForExistence(timeout: 10))
        app.buttons["ob-open"].tap()
        XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 10))
        attach(app, "Hoje — depois do cadastro (véspera da semana 1)")
    }

    @MainActor
    func testPregnancyShowsPlanUnavailable() {
        let app = launch()
        reachCare(app)
        app.buttons["ob-care.PREGNANCY"].tap()
        answerEligibility(app)
        consentAndBuild(app)
        XCTAssertTrue(app.staticTexts["Plano indisponível"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.staticTexts["Sinal informado no cadastro"].exists || app.staticTexts["SINAL INFORMADO NO CADASTRO"].exists)
        XCTAssertFalse(app.buttons["tab-today"].exists)
        attach(app, "81 — plano indisponível · sinal informado no cadastro (838:4053)")
    }
}
