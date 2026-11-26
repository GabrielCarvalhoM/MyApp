import SwiftUI

/// CoachingHostLab (front A): the empty host process the CoachingHost tests run in on the iPhone. Xcode cannot run tool-hosted package tests on
/// a device ("Tool-hosted testing is unavailable on device destinations"), so the package's tests are compiled into a test bundle hosted by this
/// app (the HR5R/P0 "plan B"). One empty scene (the iOS 27 SDK refuses to launch an app without the UIScene life cycle). No content, no product
/// screen, no logic; the only SwiftUI in front A (contract §2 exception for the lab's empty App).
@main
struct CoachingHostLabApp: App {
    var body: some Scene { WindowGroup { Color.clear } }
}
