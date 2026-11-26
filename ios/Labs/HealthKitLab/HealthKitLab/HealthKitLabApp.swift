import SwiftUI
import HealthKit

/// Front B's lab host (handoff original §6): a minimal app process with the HealthKit and background-delivery entitlements, so the
/// HealthKitIngest tests can run hosted in the Simulator and on the iPhone. One empty scene, no product screen, no logic beyond asking
/// for authorization when launched with `-labAuthorize` (the athlete, or the Founder on the device, answers the system sheet), and the
/// device probes of `DeviceProbe.swift` (counts and codes only).
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
                    guard HKHealthStore.isHealthDataAvailable() else { return }
                    let args = ProcessInfo.processInfo.arguments
                    if args.contains("-labAuthorize") {
                        do {
                            try await HKHealthStore().requestAuthorization(toShare: LabTypes.share, read: LabTypes.read)
                            state = "lab.authorizationRequested"
                        } catch {
                            state = "lab.authorizationFailed"
                        }
                    }
                    // Whether the sheet was answered (never what was allowed: iOS does not tell), written to the lab's own container so the
                    // check needs no reinstall. A status code only, no Health data.
                    if args.contains("-labStatus") || args.contains("-labAuthorize") { await LabTypes.writeStatus() }
                    #if !targetEnvironment(simulator)
                    if args.contains("-labDeviceProbe") { await DeviceProbe.read(); state = "lab.probeDone" }
                    if args.contains("-labLockProbe") { await DeviceProbe.lock(); state = "lab.lockProbeDone" }
                    #endif
                }
        }
    }
}

enum LabTypes {
    static func writeStatus() async {
        let st: HKAuthorizationRequestStatus = await withCheckedContinuation { c in
            HKHealthStore().getRequestStatusForAuthorization(toShare: share, read: read) { s, _ in c.resume(returning: s) }
        }
        let text = st == .unnecessary ? "ANSWERED" : st == .shouldRequest ? "NOT_YET_ASKED" : "UNKNOWN"
        let url = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("lab-status.txt")
        try? Data((text + "\n").utf8).write(to: url, options: .atomic)
    }
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
