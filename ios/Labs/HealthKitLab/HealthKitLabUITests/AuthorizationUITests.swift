import XCTest

/// SIMULATOR ONLY: grants the lab's HealthKit authorization sheet in the Simulator, so the hosted tests can read the synthetic data they
/// write. It is never run on the iPhone: there the Founder answers the sheet themself (contract §9: the device's Health data is theirs).
/// The sheet is located by its accessibility identifiers, so the Simulator's language does not matter.
final class AuthorizationUITests: XCTestCase {
    func testGrantSimulatorAuthorization() throws {
        #if !targetEnvironment(simulator)
        throw XCTSkip("the device's authorization is the Founder's to give")
        #else
        let app = XCUIApplication()
        app.launchArguments = ["-labAuthorize"]
        app.launch()
        let done = app.otherElements["lab.authorizationRequested"]
        let all = app.cells["UIA.Health.AuthSheet.AllCategoryButton"]
        if !all.waitForExistence(timeout: 20) {
            XCTAssertTrue(done.waitForExistence(timeout: 5), "no sheet and no answer: \(app.debugDescription)") // answered in an earlier run
            return
        }
        all.tap()
        // The answer row is the sheet's last cell: [deny, allow]. Scroll to it and take its second label (no locale-specific text).
        let table = app.tables.firstMatch
        for _ in 0..<6 { table.swipeUp() }
        let last = table.cells.element(boundBy: max(0, table.cells.count - 1))
        let allow = last.staticTexts.element(boundBy: 1)
        XCTAssertTrue(allow.waitForExistence(timeout: 10), app.debugDescription)
        allow.tap()
        // iOS 27 second page (HealthUI.HKAuthorizationTimeBoundedView): the history window. The first option (recent data and future)
        // covers the synthetic data, written minutes earlier; then the first button under the options (allow) is enabled.
        let window = app.navigationBars["HealthUI.HKAuthorizationTimeBoundedView"]
        if window.waitForExistence(timeout: 10) {
            app.cells.element(boundBy: 0).tap()
            // [back, allow, deny]: the allow button is the first one after the navigation's back button, enabled once an option is chosen.
            let confirm = app.buttons.element(boundBy: 1)
            let enabled = NSPredicate(format: "isEnabled == true")
            if XCTWaiter.wait(for: [expectation(for: enabled, evaluatedWith: confirm)], timeout: 5) != .completed {
                app.cells.element(boundBy: 0).coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.3)).tap()
                print("PAGE2 after=\(app.buttons.allElementsBoundByIndex.map { "\($0.label)|\($0.isEnabled)" })")
                wait(for: [expectation(for: enabled, evaluatedWith: confirm)], timeout: 10)
            }
            confirm.tap()
        }
        // The sheet is gone once answered (the hosted tests then check the real request status with HealthKit itself).
        let gone = NSPredicate(format: "exists == false")
        wait(for: [expectation(for: gone, evaluatedWith: all)], timeout: 20)
        #endif
    }
}
