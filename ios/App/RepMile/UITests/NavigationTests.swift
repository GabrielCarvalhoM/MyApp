import XCTest

final class NavigationTests: XCTestCase {
    @MainActor
    func testTabsAndProfileRoundTrip() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.navigationBars["Hoje"].waitForExistence(timeout: 5))

        for title in ["Plano", "Histórico", "Progresso", "Hoje"] {
            app.tabBars.buttons[title].tap()
            XCTAssertTrue(app.navigationBars[title].exists)
        }

        app.buttons["open-profile"].tap()
        XCTAssertTrue(app.navigationBars["Perfil"].exists)
        app.navigationBars["Perfil"].buttons.firstMatch.tap()
        XCTAssertTrue(app.navigationBars["Hoje"].exists)

        let screenshot = XCTAttachment(screenshot: app.screenshot())
        screenshot.name = "Hoje — navigation shell"
        screenshot.lifetime = .keepAlways
        add(screenshot)
    }
}
