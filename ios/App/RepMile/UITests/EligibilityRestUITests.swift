import XCTest

/// #72: "Não estou 100%" from the shell, the readiness declaration and "não posso neste dia" ask the eligibility screen themselves (the
/// engine reads it before anything else: without it a red-flag sign gets no clinical route). The signs come first; the screen is the only
/// gate on the send; a red flag alone with the screen reaches the safety pause (fixture mode answers as the engine).
final class EligibilityRestUITests: XCTestCase {
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
    private func openNotFeeling(_ app: XCUIApplication, _ condition: String) {
        el(app, "today-changed").tap()
        XCTAssertTrue(app.buttons["changes-not-feeling"].waitForExistence(timeout: 5))
        app.buttons["changes-not-feeling"].tap()
        XCTAssertTrue(el(app, "flow-not-feeling-100").waitForExistence(timeout: 5))
        app.buttons["condition-\(condition)"].tap()
    }

    @MainActor
    func testNotFeeling100AsksTheEngineSignsAndTheScreen() {
        let app = launch("today")
        openNotFeeling(app, "MINOR_DISCOMFORT")
        XCTAssertTrue(el(app, "signs-9").waitForExistence(timeout: 5), "MINOR_DISCOMFORT asks 9 signs")
        attach(app, "72 — 9 sinais (843:1751)")
        for sign in ["feverOrChills", "chestPainPressureOrTightness", "breathlessAtRest", "palpitationsAtRest", "faintingOrDizziness",
                     "painThatChangesMovement", "swelling", "injuryFromFallOrImpact", "gettingWorse"] {
            let b = app.buttons["sign-\(sign)-no"]
            scrollToReach(app, b); b.tap()
        }
        let send = app.buttons["nf-send"]
        XCTAssertFalse(send.isEnabled, "every sign answered, the screen not: nothing is sent")
        answerReportScreen(app)
        let intent = app.buttons["intent-REDUCE_LIGHT"]
        scrollToReach(app, intent); intent.tap()
        scrollToReach(app, send)
        XCTAssertTrue(send.isEnabled)
        send.tap()
        XCTAssertTrue(el(app, "nf-kept").waitForExistence(timeout: 5))
    }

    /// A red flag waits for nothing but the screen: no other sign, no intent.
    @MainActor
    func testARedFlagAloneWithTheScreenReachesTheSafetyPause() {
        let app = launch("today")
        openNotFeeling(app, "MILD_ILLNESS")
        let chest = app.buttons["sign-chestPainPressureOrTightness-yes"]
        XCTAssertTrue(chest.waitForExistence(timeout: 5))
        chest.tap()
        let send = app.buttons["nf-send"]
        XCTAssertFalse(send.isEnabled, "the engine routes no sign without the screen")
        answerReportScreen(app)
        scrollToReach(app, send)
        XCTAssertTrue(send.isEnabled, "the other signs and the intent are left unanswered")
        send.tap()
        XCTAssertTrue(el(app, "nf-blocked").waitForExistence(timeout: 5))
        attach(app, "72 — sinal de alerta + triagem: pausa por segurança (#72)")
    }

    @MainActor
    func testBlockedReadinessAsksFifteenSignsAndTheScreenAndReturns() {
        let app = launch("blocked")
        app.buttons["hold-declare"].tap()   // #99: "Declarar que estou pronto", the hold's neutral secondary
        XCTAssertTrue(el(app, "signs-15").waitForExistence(timeout: 5))
        app.buttons["readiness-recovered-yes"].tap()
        attach(app, "72 — prontidão, 15 sinais (843:1980)")
        let send = app.buttons["readiness-send"]
        XCTAssertFalse(send.isEnabled)
        // In on-screen order: the 15 signs (every one answered, none "sim"), then the screen.
        for sign in ["feverOrChills", "chestPainPressureOrTightness", "breathlessAtRest", "palpitationsAtRest", "faintingOrDizziness",
                     "painThatChangesMovement", "swelling", "injuryFromFallOrImpact", "gettingWorse", "bodyWideAches", "exhaustionAtRest",
                     "vomitingDiarrhoeaNauseaOrAbdominalPain", "moderateOrSevereCough", "severeHeadache", "severeNoseOrThroat"] {
            let b = app.buttons["sign-\(sign)-no"]
            scrollToReach(app, b); b.tap()
        }
        XCTAssertFalse(send.isEnabled, "without the screen the engine cannot release the hold")
        answerReportScreen(app)
        scrollToReach(app, send)
        XCTAssertTrue(send.isEnabled)
        send.tap()
        XCTAssertTrue(el(app, "readiness-returning").waitForExistence(timeout: 5))
    }

    @MainActor
    func testCantThisDayWithAYesShowsTheSafetyPauseAndNoProposal() {
        let app = launch("pending")
        app.buttons["tab-plan"].tap()
        let row = app.buttons["plan-session-w0-run-d3"]
        XCTAssertTrue(row.waitForExistence(timeout: 10))
        row.tap()
        let cant = app.buttons["session-cant-this-day"]
        XCTAssertTrue(cant.waitForExistence(timeout: 10))
        cant.tap()
        answerReportScreen(app, yes: "injury")
        let send = app.buttons["move-send"]
        scrollToReach(app, send)
        send.tap()
        XCTAssertTrue(el(app, "move-blocked").waitForExistence(timeout: 5))
        XCTAssertFalse(app.buttons["move-accept"].exists, "a clinical route is never a proposal")
        attach(app, "Mover — triagem com \"sim\": pausa por segurança (#72)")
    }
}
