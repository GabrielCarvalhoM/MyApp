import UIKit
import XCTest

/// #94: the app follows the system appearance (no in-app choice; the Figma has none). Each journey runs once in light and once in dark,
/// whatever the simulator was set to (`sim.sh --appearance`), and checks the page itself: the background at the screen's edge is fundo/app
/// of that mode (light #F3F4F6, dark #0C0D10), so a screen pinned to one appearance fails. The appearance is restored afterwards.
final class AppearanceUITests: XCTestCase {
    override func setUp() { continueAfterFailure = false }

    @MainActor
    private func inEachAppearance(_ body: (XCUIDevice.Appearance, String) -> Void) {
        // Restored also when an assertion stops the test (continueAfterFailure is false), so the next suites keep sim.sh's appearance.
        let original = XCUIDevice.shared.appearance
        addTeardownBlock { @MainActor in XCUIDevice.shared.appearance = original }
        for (appearance, name) in [(XCUIDevice.Appearance.light, "claro"), (.dark, "escuro")] {
            XCUIDevice.shared.appearance = appearance
            _ = XCTWaiter.wait(for: [XCTestExpectation(description: "appearance")], timeout: 1.5)
            body(appearance, name)
        }
    }

    @MainActor
    private func launch(_ scenario: String) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-scenario", scenario, "-simulatedLocation", "-AppleLanguages", "(pt-BR)", "-AppleLocale", "pt_BR"]
        app.launch()
        return app
    }

    @MainActor private func el(_ app: XCUIApplication, _ id: String) -> XCUIElement { app.descendants(matching: .any)[id] }

    /// The page colour at the left edge (inside the 20 pt gutter, clear of cards and the floating tab bar), as 0…255 luminance.
    @MainActor
    private func edgeLuminance(_ app: XCUIApplication) -> Double {
        guard let cg = app.screenshot().image.cgImage else { XCTFail("no screenshot"); return -1 }
        var samples: [Double] = []
        for fraction in [0.35, 0.5, 0.65] {
            let x = 6, y = Int(Double(cg.height) * fraction)
            guard let crop = cg.cropping(to: CGRect(x: x, y: y, width: 1, height: 1)) else { continue }
            var px = [UInt8](repeating: 0, count: 4)
            let ctx = CGContext(data: &px, width: 1, height: 1, bitsPerComponent: 8, bytesPerRow: 4, space: CGColorSpaceCreateDeviceRGB(),
                                bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
            ctx?.draw(crop, in: CGRect(x: 0, y: 0, width: 1, height: 1))
            samples.append(0.2126 * Double(px[0]) + 0.7152 * Double(px[1]) + 0.0722 * Double(px[2]))
        }
        return samples.sorted()[samples.count / 2]
    }

    @MainActor
    private func assertPage(_ app: XCUIApplication, _ appearance: XCUIDevice.Appearance, _ what: String) {
        // Let the appearance transition settle before sampling.
        _ = XCTWaiter.wait(for: [XCTestExpectation(description: "settle")], timeout: 0.6)
        let l = edgeLuminance(app)
        if appearance == .light { XCTAssertGreaterThan(l, 200, "\(what): light page expected (fundo/app #F3F4F6), luminance \(l)") }
        else { XCTAssertLessThan(l, 50, "\(what): dark page expected (fundo/app #0C0D10), luminance \(l)") }
    }

    @MainActor
    private func attach(_ app: XCUIApplication, _ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }

    /// Hoje, the tab bar, Plano, Histórico, Progresso and Perfil in both appearances.
    @MainActor
    func testMainScreensFollowTheSystemAppearance() {
        inEachAppearance { appearance, name in
            let app = launch("today")
            XCTAssertTrue(app.buttons["tab-today"].waitForExistence(timeout: 10))
            XCTAssertTrue(app.buttons["tab-add"].exists, "the tab bar's + action")
            assertPage(app, appearance, "Hoje \(name)")
            attach(app, "Hoje — \(name)")
            for (tab, title) in [("plan", "Plano"), ("history", "Histórico"), ("progress", "Progresso")] {
                app.buttons["tab-\(tab)"].tap()
                XCTAssertTrue(app.buttons["tab-\(tab)"].isSelected, tab)
                assertPage(app, appearance, "\(title) \(name)")
                attach(app, "\(title) — \(name)")
            }
            app.buttons["tab-today"].tap()
            app.buttons["open-profile"].tap()
            XCTAssertTrue(app.navigationBars["Perfil"].waitForExistence(timeout: 5))
            assertPage(app, appearance, "Perfil \(name)")
            attach(app, "Perfil — \(name)")
            app.terminate()
        }
    }

    /// The run screen of a planned run, in both appearances.
    @MainActor
    func testRunScreenFollowsTheSystemAppearance() {
        inEachAppearance { appearance, name in
            let app = launch("today")
            let start = app.buttons["today-start"]
            XCTAssertTrue(start.waitForExistence(timeout: 10))
            start.tap()
            XCTAssertTrue(el(app, "run-timer").waitForExistence(timeout: 5))
            attach(app, "Corrida em andamento — \(name)")
            assertPage(app, appearance, "corrida \(name)")
            app.terminate()
        }
    }

    /// The clinical states: the urgent banner stays distinct from the safety pause in light as in dark, and neither offers a start.
    @MainActor
    func testClinicalBannersInBothAppearances() {
        inEachAppearance { appearance, name in
            let urgent = launch("blocked-urgent")
            XCTAssertTrue(el(urgent, "guidance-urgent").waitForExistence(timeout: 10), "urgent care \(name)")
            XCTAssertFalse(urgent.buttons["today-start"].exists)
            assertPage(urgent, appearance, "urgente \(name)")
            attach(urgent, "Hoje — atendimento urgente — \(name)")
            urgent.terminate()

            let blocked = launch("blocked")
            XCTAssertTrue(blocked.staticTexts["Treino pausado por segurança"].waitForExistence(timeout: 10))
            XCTAssertFalse(el(blocked, "guidance-urgent").exists, "the safety pause is not the urgent banner")
            XCTAssertFalse(blocked.buttons["today-start"].exists)
            assertPage(blocked, appearance, "bloqueado \(name)")
            attach(blocked, "Hoje — bloqueado — \(name)")
            blocked.terminate()
        }
    }

    /// The root states (onboarding entry, erased, integrity, record lost, operational error) in both appearances.
    @MainActor
    func testStateScreensInBothAppearances() {
        inEachAppearance { appearance, name in
            for (scenario, id) in [("no-data", "screen-onboarding"), ("gone", "state-gone"), ("integrity", "state-integrity"),
                                   ("record-lost", "state-record-lost"), ("stale", "state-operational-error")] {
                let app = launch(scenario)
                XCTAssertTrue(el(app, id).waitForExistence(timeout: 10), "\(scenario) \(name)")
                assertPage(app, appearance, "\(scenario) \(name)")
                attach(app, "Estado \(scenario) — \(name)")
                app.terminate()
            }
        }
    }
}
