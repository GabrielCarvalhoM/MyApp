import XCTest

/// #99, the visual review of the #14 pilot: Hoje under a clinical hold has the Figma's action hierarchy (`805:492` urgent, `805:410`
/// professional): the instruction is the headline, "Entendi" is the primary and comes first, "Declarar que estou pronto" a neutral secondary,
/// both 52 pt; nothing starts. At large Dynamic Type (`accessibility-large`) the week strip grows as the Figma's large-text frame
/// (`889:515`, × 1.3), the actions stay reachable and the tab bar (`880:4403`) never covers them.
final class HoldHierarchyUITests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func launch(_ scenario: String, extra: [String] = []) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", scenario, "-simulatedLocation", "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"] + extra
        app.launch()
        return app
    }
    private static let accessibilityLarge = ["-UIPreferredContentSizeCategoryName", "UICTContentSizeCategoryAccessibilityL"]
    @MainActor private func el(_ app: XCUIApplication, _ id: String) -> XCUIElement { app.descendants(matching: .any)[id] }
    @MainActor
    private func attach(_ app: XCUIApplication, _ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }
    @MainActor
    private func reach(_ app: XCUIApplication, _ e: XCUIElement, file: StaticString = #filePath, line: UInt = #line) {
        XCTAssertTrue(scrollClearOfTabBar(app, e), "\(e) reachable above the tab bar", file: file, line: line)
    }

    @MainActor
    private func assertHierarchy(_ app: XCUIApplication) {
        let understood = app.buttons["hold-understood"], declare = app.buttons["hold-declare"]
        XCTAssertTrue(understood.waitForExistence(timeout: 10))
        XCTAssertTrue(declare.exists)
        XCTAssertLessThan(understood.frame.minY, declare.frame.minY, "\"Entendi\" first, the declaration after it")
        XCTAssertGreaterThanOrEqual(understood.frame.height, 52)
        XCTAssertGreaterThanOrEqual(declare.frame.height, 52)
        XCTAssertFalse(app.buttons["Estou pronto para voltar"].exists, "no prominent readiness action left in the banner")
        XCTAssertFalse(app.buttons["today-start"].exists, "nothing starts under a hold")
    }

    // MARK: urgent (805:492)

    @MainActor
    func testUrgentHoldHeadlineCardAndActions() {
        let app = launch("blocked-urgent")
        let headline = el(app, "today-headline")
        XCTAssertTrue(headline.waitForExistence(timeout: 10))
        XCTAssertEqual(headline.label, "Pare agora e procure atendimento médico urgente")
        let card = el(app, "guidance-urgent")
        XCTAssertTrue(card.exists)
        XCTAssertTrue(card.label.localizedCaseInsensitiveContains("urgente"), card.label)
        XCTAssertTrue(card.label.contains("O app não faz diagnóstico"), card.label)
        XCTAssertLessThan(headline.frame.minY, card.frame.minY, "the instruction heads the screen, above the card")
        XCTAssertTrue(el(app, "today-signal").exists, "the reported sign's date and time")
        XCTAssertTrue(el(app, "held-sport-RUN").exists && el(app, "held-sport-STRENGTH").exists)
        assertHierarchy(app)
        attach(app, "99 — Hoje urgente: manchete, URGENTE, Entendi + Declarar")
    }

    /// "Entendi" acknowledges: its button goes; the headline, the urgent card and the declaration stay.
    @MainActor
    func testEntendiKeepsTheUrgentLevelAndTheDeclaration() {
        let app = launch("blocked-urgent")
        let understood = app.buttons["hold-understood"]
        XCTAssertTrue(understood.waitForExistence(timeout: 10))
        understood.tap()
        XCTAssertFalse(understood.waitForExistence(timeout: 2))
        XCTAssertTrue(el(app, "guidance-urgent").exists)
        XCTAssertTrue(el(app, "today-headline").exists)
        XCTAssertTrue(app.buttons["hold-declare"].exists)
        app.buttons["hold-declare"].tap()
        XCTAssertTrue(el(app, "flow-readiness").waitForExistence(timeout: 5), "the declaration opens the readiness flow")
    }

    // MARK: professional (805:410)

    @MainActor
    func testProfessionalHoldHeadlineCardAndActions() {
        let app = launch("blocked")
        let headline = el(app, "today-headline")
        XCTAssertTrue(headline.waitForExistence(timeout: 10))
        XCTAssertEqual(headline.label, "Sem treino prescrito por enquanto")
        let card = el(app, "guidance-professional")
        XCTAssertTrue(card.exists)
        XCTAssertTrue(card.label.contains("Pare de treinar e procure uma avaliação profissional"), card.label)
        XCTAssertTrue(card.label.contains("O app não faz diagnóstico"), card.label)
        XCTAssertFalse(el(app, "guidance-urgent").exists, "red and URGENTE are the urgent level's only")
        XCTAssertTrue(el(app, "today-signal").exists)
        assertHierarchy(app)
        attach(app, "99 — Hoje bloqueado: diretiva, Entendi + Declarar")
    }

    // MARK: accessibility-large

    @MainActor
    func testAccessibilityLargeTodayScalesTheWeekAndKeepsTheActionsClearOfTheTabBar() {
        let app = launch("today", extra: Self.accessibilityLarge)
        XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 10))
        XCTAssertTrue(el(app, "week-panels").exists)
        let card = app.buttons["today-card-w0-run-d6"]
        XCTAssertTrue(card.exists)
        XCTAssertEqual(card.frame.width, 174 * 1.3, accuracy: 2, "today's card at the large-text frame's 226 pt (889:544)")
        reach(app, app.buttons["today-start"])
        reach(app, app.buttons["today-view-session"])
        attach(app, "99 — Hoje, accessibility-large")
        app.buttons["today-view-session"].tap()
        XCTAssertTrue(el(app, "screen-session").waitForExistence(timeout: 5))
    }

    @MainActor
    func testAccessibilityLargeUrgentHoldKeepsItsHierarchyReachable() {
        let app = launch("blocked-urgent", extra: Self.accessibilityLarge)
        XCTAssertTrue(el(app, "today-headline").waitForExistence(timeout: 10))
        XCTAssertTrue(el(app, "today-headline").isHittable, "the instruction is on screen at launch")
        reach(app, app.buttons["hold-understood"])
        reach(app, app.buttons["hold-declare"])
        XCTAssertLessThan(app.buttons["hold-understood"].frame.minY, app.buttons["hold-declare"].frame.minY)
        attach(app, "99 — Hoje urgente, accessibility-large")
    }
}

extension XCTestCase {
    /// #99: scrolls (short drags; a fling could carry the element past the top) until `e` is hittable and above the tab bar area
    /// (Figma `880:4403`: it starts 20 pt above the bar's capsule, which is 10 pt above its tab buttons; 2 pt of tolerance for the last row,
    /// which ends exactly there). True when it got there.
    @MainActor @discardableResult
    func scrollClearOfTabBar(_ app: XCUIApplication, _ e: XCUIElement) -> Bool {
        let bar = app.buttons["tab-today"]
        func clear() -> Bool { e.exists && e.isHittable && (!bar.exists || e.frame.maxY <= bar.frame.minY - 28) }
        var tries = 0
        while !clear() && tries < 16 {
            let window = app.windows.firstMatch
            window.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.62)).press(forDuration: 0.05, thenDragTo: window.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.42)))
            tries += 1
        }
        return clear()
    }
}
