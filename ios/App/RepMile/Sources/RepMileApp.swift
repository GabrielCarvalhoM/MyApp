import RepMileUI
import SwiftUI

@main
struct RepMileApp: App {
    /// Opens the live composition at launch, also a background launch with no scene (#63 P2-1).
    @UIApplicationDelegateAdaptor(RepMileAppDelegate.self) private var delegate

    var body: some Scene {
        WindowGroup {
            // `-scenario <id>` (Debug builds only, #63 P3-3): the fixture composition (replayed CoachingCore captures), as every XCUITest
            // launches it. Otherwise: the live composition (`ios/App/Composition`, #16).
            #if DEBUG
            if LaunchMode.current == .fixture { RepMileShell() } else { LiveRoot() }
            #else
            LiveRoot()
            #endif
        }
    }
}
