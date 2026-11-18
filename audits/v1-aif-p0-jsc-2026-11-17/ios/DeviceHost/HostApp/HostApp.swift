import SwiftUI

/// Plan B of RUN.md §2.2: Xcode cannot run tool-hosted package tests on a device ("Tool-hosted testing is unavailable on device
/// destinations"), so the unchanged P0 tests run hosted in this empty process. One empty scene, because the iOS 27 SDK refuses to launch an
/// app without the UIScene life cycle. No content, no product screen, no logic.
@main
struct P0DeviceHostApp: App {
    var body: some Scene { WindowGroup { Color.clear } }
}
