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

    /// Goes to Cuidados; answers the eligibility flags "não" and confirms.
    @MainActor
    private func reachCare(_ app: XCUIApplication) {
        XCTAssertTrue(el(app, "screen-onboarding").waitForExistence(timeout: 10))
        attach(app, "10 — boas-vindas")
        for _ in 0..<7 { app.buttons["ob-next"].tap() }
        XCTAssertTrue(app.staticTexts["Cuidados"].waitForExistence(timeout: 5))
        XCTAssertFalse(app.buttons["ob-next"].isEnabled, "no choice: cannot continue")
        attach(app, "10 — Cuidados sem escolha (836:3299)")
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
        app.buttons["ob-next"].tap()
        for p in ["COACHING", "HEALTH_SIGNALS", "LEARNING"] { tapScrolling(app, app.buttons["consent-\(p)-yes"]) }
        app.buttons["ob-next"].tap()
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
