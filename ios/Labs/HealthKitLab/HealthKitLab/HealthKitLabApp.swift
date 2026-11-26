import SwiftUI
import HealthKit

/// Front B's lab host (handoff original §6): a minimal app process with the HealthKit and background-delivery entitlements, so the
/// HealthKitIngest tests can run hosted in the Simulator and on the iPhone. One empty scene, no product screen, no logic beyond asking
/// for authorization when launched with `-labAuthorize` (the athlete, or the Founder on the device, answers the system sheet).
///
/// Device: READ only, workouts + running distance + workout route (presence); no heart rate, no write (G-1, DR-121).
/// Simulator only: also WRITE of synthetic workouts, distance and heart rate, and READ of heart rate, to prepare the series mapping with
/// synthetic data (handoff item 17). Never compiled for a device.
@main
struct HealthKitLabApp: App {
    @State private var state = "lab.idle"
    var body: some Scene {
        WindowGroup {
            Color.clear
                .accessibilityIdentifier(state)
                .task {
                    guard ProcessInfo.processInfo.arguments.contains("-labAuthorize"), HKHealthStore.isHealthDataAvailable() else { return }
                    do {
                        try await HKHealthStore().requestAuthorization(toShare: LabTypes.share, read: LabTypes.read)
                        state = "lab.authorizationRequested"
                    } catch {
                        state = "lab.authorizationFailed"
                    }
                }
        }
    }
}

enum LabTypes {
    static var read: Set<HKObjectType> {
        var s: Set<HKObjectType> = [HKObjectType.workoutType(), HKQuantityType(.distanceWalkingRunning), HKSeriesType.workoutRoute()]
        #if targetEnvironment(simulator)
        s.insert(HKQuantityType(.heartRate))
        #endif
        return s
    }
    static var share: Set<HKSampleType> {
        #if targetEnvironment(simulator)
        return [HKObjectType.workoutType(), HKQuantityType(.distanceWalkingRunning), HKQuantityType(.heartRate)]
        #else
        return []
        #endif
    }
}
