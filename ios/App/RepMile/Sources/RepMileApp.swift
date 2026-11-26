import RepMileUI
import SwiftUI

@main
struct RepMileApp: App {
    /// `-scenario <id>`: the fixture composition (replayed CoachingCore captures), as every XCUITest launches it. Without it: the live
    /// composition (`ios/App/Composition`, #16).
    private let fixtureMode = ProcessInfo.processInfo.arguments.contains("-scenario")

    var body: some Scene {
        WindowGroup {
            if fixtureMode { RepMileShell() } else { LiveRoot() }
        }
    }
}
