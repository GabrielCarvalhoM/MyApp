import XCTest

/// Perfil (70) and Zonas de FC (71) on the dedicated simulator. Every bpm on screen is the fixture's (handoff addendum §5).
final class ProfileZonesTests: XCTestCase {
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
    private func openZones(_ scenario: String) -> XCUIApplication {
        let app = launch(scenario)
        XCTAssertTrue(app.buttons["open-profile"].waitForExistence(timeout: 10))
        app.buttons["open-profile"].tap()
        XCTAssertTrue(app.buttons["profile-hr-zones"].waitForExistence(timeout: 5))
        app.buttons["profile-hr-zones"].tap()
        XCTAssertTrue(el(app, "screen-hr-zones").waitForExistence(timeout: 5))
        return app
    }

    @MainActor
    func testAgeEstimateZonesMatchTheFixture() {
        let app = openZones("zones-age30")
        XCTAssertTrue(app.staticTexts["Estimada pela sua idade: 30 anos → 190 bpm"].exists)
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'Você pode informar a sua'")).firstMatch.exists, "C3")
        for (z, label) in [("Z1", "até 123"), ("Z2", "124–153"), ("Z3", "154–169"), ("Z4", "170–184"), ("Z5", "acima de 184")] {
            XCTAssertTrue(el(app, "hr-zone-\(z)").label.contains(label), z)
        }
        XCTAssertFalse(app.staticTexts.containing(NSPredicate(format: "label CONTAINS[c] 'limiar' OR label CONTAINS[c] 'anaeróbico'")).firstMatch.exists, "C8")
        attach(app, "71 — estimada pela idade (1102:4302)")
    }

    @MainActor
    func testCustomLimitsHaveNoPercentages() {
        let app = openZones("zones-custom")
        for (z, label) in [("Z1", "até 130"), ("Z2", "131–150"), ("Z3", "151–165"), ("Z4", "166–180"), ("Z5", "acima de 180")] {
            XCTAssertTrue(el(app, "hr-zone-\(z)").label.contains(label), z)
            XCTAssertFalse(el(app, "hr-zone-\(z)").label.contains("%"), z)
        }
        attach(app, "71 — limites personalizados (1102:4428)")
    }

    @MainActor
    func testConflictShowsBothValuesAndNoAgeShowsReason() {
        var app = openZones("zones-conflict")
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS '180 e 192'")).firstMatch.exists, "C2: both values")
        attach(app, "71 — conflito de referências")
        app.terminate()
        app = openZones("zones-noage")
        XCTAssertTrue(el(app, "hr-unavailable").exists)
        attach(app, "71 — sem zonas (845:4225)")
    }

    @MainActor
    func testDeclaredMaximumSavedAndInvalidLimitsRefusedByTheEngine() {
        let app = openZones("zones-age30")
        app.buttons["hr-enter-max"].tap()
        let f = app.textFields["hr-max-field"]
        XCTAssertTrue(f.waitForExistence(timeout: 5))
        f.tap(); f.typeText("195")
        app.buttons["hr-save"].tap()
        XCTAssertTrue(app.staticTexts["Salvo. As zonas passam a usar o que você informou."].waitForExistence(timeout: 5))
        app.buttons["Fechar"].firstMatch.tap()
        let customize = app.buttons["hr-customize"]
        XCTAssertTrue(customize.waitForExistence(timeout: 5))
        customize.tap()
        for (i, v) in ["150", "140", "160", "170"].enumerated() {
            let t = app.textFields["hr-limit-\(i + 1)"]; XCTAssertTrue(t.waitForExistence(timeout: 5)); t.tap(); t.typeText(v)
        }
        app.buttons["hr-save"].tap()
        XCTAssertTrue(app.staticTexts["Os limites precisam subir de Z1 a Z4."].waitForExistence(timeout: 5))
    }

    @MainActor
    func testEraseAccountReachesTheErasedState() {
        let app = launch("today")
        XCTAssertTrue(app.buttons["open-profile"].waitForExistence(timeout: 10))
        app.buttons["open-profile"].tap()
        XCTAssertTrue(el(app, "profile-synthetic").waitForExistence(timeout: 5))
        attach(app, "70 — perfil e ajustes")
        let erase = app.buttons["profile-erase-account"]
        while !erase.isHittable { app.swipeUp() }
        erase.tap()
        app.buttons["profile-erase-confirm"].firstMatch.tap()
        XCTAssertTrue(el(app, "state-gone").waitForExistence(timeout: 5))
    }
}
