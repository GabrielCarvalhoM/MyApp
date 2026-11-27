import UIKit

/// The app delegate (#63 P2-1). HealthKit relaunches the app in the background to deliver a new workout; then no SwiftUI scene connects and
/// no `.task` runs, so the composition is opened here, at every launch: B registers its observer and background delivery before the launch
/// returns its work to the system. The SwiftUI root then gets this same instance (`LiveComposition.open()`, one `SingleOpen`).
///
/// The fixture composition (`-scenario`, Debug only) opens nothing here: no host, no HealthKit.
final class RepMileAppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        LiveComposition.launch(LaunchMode.current)
        return true
    }
}
