import UIKit

/// The app delegate (#63 P2-1). HealthKit relaunches the app in the background to deliver a new workout; then no SwiftUI scene connects and
/// no `.task` runs, so the opening of the composition starts here, at every launch. It is asynchronous: B registers its observer and background
/// delivery once A has opened (`LiveComposition.make`); if A cannot open yet (before the first unlock), the next unlock tries again. Whether
/// the observer is registered in time for a background wake-up is a hardware check (#63, BACKGROUND_DELIVERY_ON_DEVICE), not inferred here.
/// The SwiftUI root then gets this same instance (`LiveComposition.open()`, one `SingleOpen`).
///
/// The fixture composition (`-scenario`, Debug only) opens nothing here: no host, no HealthKit.
final class RepMileAppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        LiveComposition.launch(LaunchMode.current)
        return true
    }
}
