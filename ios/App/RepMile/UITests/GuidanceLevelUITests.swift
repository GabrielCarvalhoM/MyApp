import XCTest

/// #73: the engine's guidance level on the clinical surfaces. An urgent sign answered with the screen reaches URGENT_CARE_ADVISED in the
/// engine, and the app shows it distinctly from the professional-assessment banner (fixture mode replays the real engine's captures,
/// `RepMileUI/Captures`). The urgent copy is INTERIM (G04).
final class GuidanceLevelUITests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    private static let urgentTitle = "Procure atendimento médico urgente"
    private static let professional = "Procure uma avaliação profissional"

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
    private func sendNotFeeling(_ app: XCUIApplication, sign: String) {
        el(app, "today-changed").tap()
        XCTAssertTrue(app.buttons["changes-not-feeling"].waitForExistence(timeout: 5))
        app.buttons["changes-not-feeling"].tap()
        XCTAssertTrue(el(app, "flow-not-feeling-100").waitForExistence(timeout: 5))
        app.buttons["condition-MILD_ILLNESS"].tap()
        let yes = app.buttons["sign-\(sign)-yes"]
        XCTAssertTrue(yes.waitForExistence(timeout: 5))
        yes.tap()
        answerReportScreen(app)
        let send = app.buttons["nf-send"]
        scrollToReach(app, send)
        XCTAssertTrue(send.isEnabled)
        send.tap()
        XCTAssertTrue(el(app, "nf-blocked").waitForExistence(timeout: 5))
    }

    @MainActor
    func testAnUrgentSignShowsUrgentCare() {
        let app = launch("today")
        sendNotFeeling(app, sign: "chestPainPressureOrTightness")
        let urgent = el(app, "guidance-urgent")
        XCTAssertTrue(urgent.waitForExistence(timeout: 5), "URGENT_CARE_ADVISED is shown as urgent")
        XCTAssertTrue(urgent.label.contains(Self.urgentTitle), urgent.label)
        XCTAssertTrue(urgent.label.contains("número de emergência local"), "the engine's interim instruction, one VoiceOver element")
        XCTAssertFalse(app.staticTexts.containing(NSPredicate(format: "label CONTAINS %@", Self.professional)).firstMatch.exists,
                       "never the professional-assessment copy for an urgent route")
        attach(app, "73 — sinal urgente + triagem: atendimento médico urgente (INTERIM)")
    }

    @MainActor
    func testANonUrgentSignShowsProfessionalAssessment() {
        let app = launch("today")
        sendNotFeeling(app, sign: "feverOrChills")
        XCTAssertFalse(el(app, "guidance-urgent").exists)
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS %@", Self.professional)).firstMatch.exists)
        attach(app, "73 — sinal não urgente: avaliação profissional")
    }

    /// #99 (Figma 72 `805:492`): on Hoje the urgent instruction is the screen's headline, and the URGENTE card names the emergency line.
    @MainActor
    func testTodayUnderAnUrgentHoldShowsUrgentCare() {
        let app = launch("blocked-urgent")
        let urgent = el(app, "guidance-urgent")
        XCTAssertTrue(urgent.waitForExistence(timeout: 10))
        XCTAssertTrue(el(app, "today-headline").label.contains("procure atendimento médico urgente"), el(app, "today-headline").label)
        XCTAssertTrue(urgent.label.contains("número de emergência local"), urgent.label)
        XCTAssertTrue(app.buttons["hold-declare"].exists, "the readiness declaration stays the only exit")
        attach(app, "73 — Hoje sob retenção urgente")
    }

    /// QRE P3-4: the session detail under an urgent hold shows the urgent level, never only "nothing to start".
    @MainActor
    func testSessionDetailUnderAnUrgentHoldShowsUrgentCare() {
        let app = launch("blocked-urgent")
        app.buttons["tab-plan"].tap()
        let row = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'plan-session-'")).firstMatch
        XCTAssertTrue(row.waitForExistence(timeout: 10))
        row.tap()
        XCTAssertTrue(el(app, "screen-session").waitForExistence(timeout: 5))
        XCTAssertTrue(el(app, "session-urgent").waitForExistence(timeout: 5))
        XCTAssertTrue(el(app, "guidance-urgent").label.contains(Self.urgentTitle))
        XCTAssertFalse(app.buttons["session-start"].exists)
        attach(app, "73 — detalhe da sessão sob retenção urgente")
    }

    @MainActor
    func testReadinessWithAnUrgentSignKeepsTheHoldAtUrgentCare() {
        let app = launch("blocked")
        XCTAssertFalse(el(app, "guidance-urgent").exists, "this hold is at the professional-assessment level")
        app.buttons["hold-declare"].tap()
        XCTAssertTrue(el(app, "signs-15").waitForExistence(timeout: 5))
        app.buttons["readiness-recovered-yes"].tap()
        let yes = app.buttons["sign-breathlessAtRest-yes"]
        scrollToReach(app, yes); yes.tap()
        answerReportScreen(app)
        let send = app.buttons["readiness-send"]
        scrollToReach(app, send)
        XCTAssertTrue(send.isEnabled, "a sign \"sim\" waits for no other sign")
        send.tap()
        XCTAssertTrue(el(app, "readiness-still-blocked").waitForExistence(timeout: 5))
        XCTAssertTrue(el(app, "guidance-urgent").exists)
        XCTAssertFalse(el(app, "readiness-returning").exists)
        attach(app, "73 — prontidão com sinal urgente: a retenção fica, atendimento urgente")
    }
}
