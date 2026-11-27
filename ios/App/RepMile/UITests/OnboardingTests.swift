import XCTest

/// Onboarding (Figma 10 `551:5`, #101) on the dedicated simulator, from the NOT_ENROLLED state. The answers of a Figma persona are seeded
/// with the Debug-only `-onboardingSeed` (fixture composition); the journeys then tap through the real screens.
final class OnboardingUITests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func launch(_ extra: [String] = []) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", "no-data", "-simulatedLocation", "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"] + extra
        app.launch()
        XCTAssertTrue(app.descendants(matching: .any)["screen-onboarding"].waitForExistence(timeout: 15))
        return app
    }
    @MainActor private func el(_ app: XCUIApplication, _ id: String) -> XCUIElement { app.descendants(matching: .any)[id] }
    @MainActor
    private func attach(_ app: XCUIApplication, _ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }
    @MainActor
    private func waitEnabled(_ e: XCUIElement, _ enabled: Bool = true, _ what: String) {
        let p = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == true AND isEnabled == %@", NSNumber(value: enabled)), object: e)
        XCTAssertEqual(XCTWaiter.wait(for: [p], timeout: 10), .completed, what)
    }

    /// 01 → 02 → 03 → 04: nothing is pre-answered; Continuar opens only with an answer; "Já tenho conta" is held (no account in V1, D18).
    @MainActor
    func testTheFirstQuestionsWaitForAnAnswer() {
        let app = launch()
        XCTAssertTrue(app.staticTexts["Corrida e força na mesma semana"].exists)
        XCTAssertFalse(app.buttons["ob-have-account"].isEnabled, "no account exists yet")
        attach(app, "10 · 01 Abertura (835:2069)")
        app.buttons["ob-start"].tap()
        XCTAssertTrue(app.staticTexts["O que você quer treinar?"].waitForExistence(timeout: 10))
        waitEnabled(app.buttons["ob-next"], false, "02: no choice, no Continuar")
        el(app, "ob-train-both").tap()
        waitEnabled(app.buttons["ob-next"], true, "02 answered")
        app.buttons["ob-next"].tap()
        XCTAssertTrue(app.staticTexts["O que você busca na corrida?"].waitForExistence(timeout: 10))
        waitEnabled(app.buttons["ob-next"], false, "03: no choice")
        app.buttons["ob-pill-10K"].tap()
        waitEnabled(app.buttons["ob-next"], true, "03 answered")
        app.buttons["ob-next"].tap()
        XCTAssertTrue(app.staticTexts["Quando é a prova?"].waitForExistence(timeout: 10))
        waitEnabled(app.buttons["ob-next"], false, "04: the wheel starts at —, no date chosen")
        XCTAssertFalse(app.staticTexts["O que você tem para treinar força?"].exists, "the invented screen is gone")
    }

    /// Lucas (`837:1144`): from the unsent answers on this iPhone (`838:3918`) to Hoje, through 29 → 30 → 31 → 32 → 34.
    @MainActor
    func testLucasBuildsThePlanAndReachesToday() {
        let app = launch(["-onboardingSeed", "lucas", "-onboardingStep", "dataUse"])
        XCTAssertTrue(app.buttons["ob-resume-continue"].waitForExistence(timeout: 10), "838:3918 Retomar")
        attach(app, "10 · Retomar o cadastro (838:3918)")
        app.buttons["ob-resume-continue"].tap()
        XCTAssertTrue(app.staticTexts["Como seus dados são usados"].waitForExistence(timeout: 10))
        app.buttons["ob-build"].tap()
        XCTAssertTrue(app.buttons["ob-save"].waitForExistence(timeout: 20), "31 Plano pronto")
        attach(app, "10 · 31 Plano pronto (837:1144)")
        app.buttons["ob-save"].tap()
        XCTAssertTrue(app.buttons["ob-account-apple"].waitForExistence(timeout: 10), "32 folha de conta")
        XCTAssertFalse(app.buttons["ob-account-apple"].isEnabled, "no account behind it (#28, D18)")
        attach(app, "10 · 32 Salvar o plano (837:1323)")
        app.swipeDown(velocity: .fast)
        XCTAssertTrue(app.buttons["ob-go-today"].waitForExistence(timeout: 10), "34 Primeira semana")
        app.buttons["ob-go-today"].tap()
        XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 15))
        attach(app, "Hoje — depois do cadastro")
    }

    /// 27 → 27b: a marked sign is confirmed or reviewed; the real engine's answer (`Captures/onboard-clinical`) is "Retido por segurança".
    @MainActor
    func testAMarkedSignIsConfirmedThenHeld() {
        let app = launch(["-onboardingSeed", "lucas", "-onboardingStep", "care", "-onboardingPhase", "form"])
        XCTAssertTrue(app.staticTexts["Algum destes vale para você hoje?"].waitForExistence(timeout: 10))
        el(app, "ob-care-persistentPain").tap()
        app.buttons["ob-next"].tap()
        XCTAssertTrue(app.buttons["ob-care-confirm"].waitForExistence(timeout: 10), "27b")
        attach(app, "10 · 27b Confirmar a resposta (838:4148)")
        app.buttons["ob-care-review"].tap()
        XCTAssertTrue(app.buttons["ob-care-confirm"].waitForNonExistence(timeout: 10))
        XCTAssertTrue(app.staticTexts["Algum destes vale para você hoje?"].exists, "review stays on Cuidados")
        app.buttons["ob-next"].tap()
        XCTAssertTrue(app.buttons["ob-care-confirm"].waitForExistence(timeout: 10))
        app.buttons["ob-care-confirm"].tap()
        XCTAssertTrue(app.staticTexts["O plano parte do que você já faz"].waitForExistence(timeout: 10), "28 respiro")
        app.buttons["ob-next"].tap()
        XCTAssertTrue(app.buttons["ob-build"].waitForExistence(timeout: 10))
        app.buttons["ob-build"].tap()
        XCTAssertTrue(app.staticTexts["Por enquanto, sem treinos prescritos"].waitForExistence(timeout: 20), "838:3689")
        XCTAssertFalse(app.buttons["ob-held-declare"].isEnabled, "no record to declare on (D24)")
        XCTAssertFalse(app.buttons["tab-today"].exists)
        attach(app, "10 · Retido por segurança (838:3689)")
    }

    /// An open decision holds the send (Rafa: no race, so no plan length, D03): "Montar meu plano" stays disabled, nothing is sent.
    @MainActor
    func testAHeldPersonaCannotBuild() {
        let app = launch(["-onboardingSeed", "rafa", "-onboardingStep", "dataUse", "-onboardingPhase", "form"])
        XCTAssertTrue(app.buttons["ob-build"].waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["ob-build"].isEnabled)
        attach(app, "10 · 29 Seus dados · envio retido (D03)")
    }

    /// VoiceOver labels and reading order of the safety and data screens (visual review evidence): 27, 27b, 29, Retido, 32. The tree of
    /// each screen is attached (`VoiceOver — …`); the labels a person hears must name every choice and keep the Figma's order.
    @MainActor
    func testVoiceOverLabelsOfTheSafetyAndDataScreens() {
        func tree(_ app: XCUIApplication, _ name: String) -> String {
            let t = app.debugDescription
            let a = XCTAttachment(string: t); a.name = "VoiceOver — " + name; a.lifetime = .keepAlways; add(a)
            return t
        }
        func ordered(_ t: String, _ labels: [String], _ what: String) {
            var from = t.startIndex
            for l in labels {
                guard let r = t.range(of: "'" + l, range: from..<t.endIndex) else { return XCTFail("\(what): \"\(l)\" missing or out of order") }
                from = r.upperBound
            }
        }
        var app = launch(["-onboardingSeed", "clinical", "-onboardingStep", "care", "-onboardingPhase", "form"])
        XCTAssertTrue(app.staticTexts["Algum destes vale para você hoje?"].waitForExistence(timeout: 10))
        ordered(tree(app, "27 Cuidados"), ["Etapa 3 de 4 · Você", "Algum destes vale para você hoje?", "Dor hoje ao se movimentar ou treinar",
                                          "Dor que dura semanas ou piora com o esforço", "Gestação atual ou parto nos últimos 12 meses", "Nenhum destes",
                                          "Não é avaliação médica", "Continuar"], "27")
        XCTAssertTrue(app.buttons["ob-care-persistentPain"].isSelected, "the marked sign is announced as selected")
        app.buttons["ob-next"].tap()
        XCTAssertTrue(app.buttons["ob-care-confirm"].waitForExistence(timeout: 10))
        ordered(tree(app, "27b Confirmar"), ["Confirma esta resposta?", "Você marcou dor que dura semanas", "Confirmar resposta", "Revisar respostas"], "27b")
        app.terminate()
        app = launch(["-onboardingSeed", "lucas", "-onboardingStep", "dataUse", "-onboardingPhase", "form"])
        XCTAssertTrue(app.staticTexts["Como seus dados são usados"].waitForExistence(timeout: 10))
        ordered(tree(app, "29 Seus dados"), ["Como seus dados são usados", "Treino", "Necessário", "Sinais de saúde", "Aprendizado", "Montar meu plano"], "29")
        XCTAssertEqual(app.switches["ob-consent-LEARNING"].label, "Aprendizado")
        app.terminate()
        app = launch(["-onboardingSeed", "clinical", "-onboardingStep", "dataUse", "-onboardingPhase", "held"])
        XCTAssertTrue(app.staticTexts["Por enquanto, sem treinos prescritos"].waitForExistence(timeout: 10))
        ordered(tree(app, "Retido por segurança"), ["Retido por segurança", "Por enquanto, sem treinos prescritos", "Procure um profissional de saúde.",
                                                    "Entendi", "Já posso treinar · declarar"], "Retido")
        app.terminate()
        app = launch(["-onboardingSeed", "lucas", "-onboardingStep", "dataUse", "-onboardingPhase", "account", "-afterOnboarding", "lucas-onboarded"])
        XCTAssertTrue(app.buttons["ob-account-apple"].waitForExistence(timeout: 15))
        ordered(tree(app, "32 Salvar o plano"), ["Salve o seu plano", "Continuar com a Apple", "Continuar com o Google", "Continuar com e-mail",
                                                 "Ao continuar", "Já tenho conta · Entrar"], "32")
        XCTAssertFalse(app.buttons["ob-account-apple"].isEnabled, "announced as dimmed: no account in V1")
    }
}
