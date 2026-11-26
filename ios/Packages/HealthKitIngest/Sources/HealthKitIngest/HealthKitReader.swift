#if os(iOS)
import Foundation
import HealthKit

/// The real HealthKit side of B (iOS only). READ only: no method writes to Apple Health (DR-121) and, on a device, heart rate is never
/// requested (G-1). Reads workouts with an anchored query from the enrolment day, the `distanceWalkingRunning` sum of each workout, and
/// whether a workout route exists (presence only, no coordinate is read).
public final class HealthKitReader: HealthReading, @unchecked Sendable {
    private let store: HKHealthStore
    private let lock = NSLock()
    private var observer: HKObserverQuery?
    private var protectedObserver: NSObjectProtocol?

    public init(store: HKHealthStore = HKHealthStore()) { self.store = store }

    /// What B reads in V1 (handoff §4 item 1): workouts, running distance, workout route (presence).
    public static var readTypes: Set<HKObjectType> {
        [HKObjectType.workoutType(), HKQuantityType(.distanceWalkingRunning), HKSeriesType.workoutRoute()]
    }

    public func requestReadAuthorization() async throws {
        guard HKHealthStore.isHealthDataAvailable() else { throw HealthReadError.healthDataUnavailable }
        do { try await store.requestAuthorization(toShare: [], read: Self.readTypes) } catch { throw Self.map(error) }
    }

    public func readWorkouts(anchor: Data?, startingAt: Date) async throws -> WorkoutReadBatch {
        guard HKHealthStore.isHealthDataAvailable() else { throw HealthReadError.healthDataUnavailable }
        let hkAnchor = anchor.flatMap { try? NSKeyedUnarchiver.unarchivedObject(ofClass: HKQueryAnchor.self, from: $0) }
        // Workouts whose interval reaches the enrolment day or later (the anchor starts at the enrolment day, handoff §11).
        let predicate = HKQuery.predicateForSamples(withStart: startingAt, end: nil, options: [])
        let (samples, deleted, newAnchor): ([HKSample], [HKDeletedObject], HKQueryAnchor?) = try await withCheckedThrowingContinuation { cont in
            let q = HKAnchoredObjectQuery(type: HKObjectType.workoutType(), predicate: predicate, anchor: hkAnchor, limit: HKObjectQueryNoLimit) { _, s, d, a, e in
                if let e { cont.resume(throwing: Self.map(e)); return }
                cont.resume(returning: (s ?? [], d ?? [], a))
            }
            store.execute(q)
        }
        var added: [WorkoutSnapshot] = []
        for case let w as HKWorkout in samples { added.append(try await snapshot(w)) }
        let archived = try newAnchor.map { try NSKeyedArchiver.archivedData(withRootObject: $0, requiringSecureCoding: true) } ?? (anchor ?? Data())
        return WorkoutReadBatch(added: added, deletedIds: deleted.map { $0.uuid.uuidString }, anchor: archived)
    }

    private func snapshot(_ w: HKWorkout) async throws -> WorkoutSnapshot {
        let meters = w.statistics(for: HKQuantityType(.distanceWalkingRunning))?.sumQuantity()?.doubleValue(for: .meter())
        let indoor = (w.metadata?[HKMetadataKeyIndoorWorkout] as? NSNumber)?.boolValue
        let userEntered = (w.metadata?[HKMetadataKeyWasUserEntered] as? NSNumber)?.boolValue ?? false
        let tz = w.metadata?[HKMetadataKeyTimeZone] as? String
        return WorkoutSnapshot(id: w.uuid.uuidString, activityTypeRaw: w.workoutActivityType.rawValue, start: w.startDate, end: w.endDate,
                               durationSeconds: w.duration, distanceMeters: meters, hasRoute: try await hasRoute(w), indoor: indoor,
                               wasUserEntered: userEntered, sourceBundleId: w.sourceRevision.source.bundleIdentifier,
                               sourceName: w.sourceRevision.source.name, timeZoneIdentifier: tz)
    }

    /// Whether a route is associated with the workout (limit 1; the route's locations are never queried).
    private func hasRoute(_ w: HKWorkout) async throws -> Bool {
        try await withCheckedThrowingContinuation { cont in
            let q = HKSampleQuery(sampleType: HKSeriesType.workoutRoute(), predicate: HKQuery.predicateForObjects(from: w), limit: 1, sortDescriptors: nil) { _, s, e in
                if let e = e as? HKError, e.code == .errorDatabaseInaccessible { cont.resume(throwing: HealthReadError.protectedDataUnavailable); return }
                // No route, or no route authorization (iOS never says which): no route. Missing stays missing (no GPS claim).
                cont.resume(returning: !(s ?? []).isEmpty)
            }
            store.execute(q)
        }
    }

    public func startObserving(_ onChange: @escaping @Sendable () async -> Void) async throws {
        let q = HKObserverQuery(sampleType: HKObjectType.workoutType(), predicate: nil) { _, completion, error in
            // The completion handler is ALWAYS called, and only after the read and the durable enqueue (background delivery contract).
            if error != nil { completion(); return }
            Task { await onChange(); completion() }
        }
        lock.lock(); let old = observer; observer = q; lock.unlock()
        if let old { store.stop(old) }
        store.execute(q)
    }

    public func stopObserving() async {
        lock.lock(); let q = observer; observer = nil; lock.unlock()
        if let q { store.stop(q) }
    }

    public func setBackgroundDelivery(_ enabled: Bool) async throws {
        do {
            if enabled { try await store.enableBackgroundDelivery(for: HKObjectType.workoutType(), frequency: .immediate) }
            else { try await store.disableBackgroundDelivery(for: HKObjectType.workoutType()) }
        } catch { throw Self.map(error) }
    }

    /// Wires `UIApplication.protectedDataDidBecomeAvailableNotification` (by name: B imports no UI framework) to the ingestor.
    public func onProtectedDataAvailable(_ work: @escaping @Sendable () async -> Void) {
        let name = Notification.Name("UIApplicationProtectedDataDidBecomeAvailable")
        let token = NotificationCenter.default.addObserver(forName: name, object: nil, queue: nil) { _ in Task { await work() } }
        lock.lock(); protectedObserver = token; lock.unlock()
    }

    #if targetEnvironment(simulator)
    /// SIMULATOR ONLY (handoff item 17): the heart-rate samples of a workout's interval, to prepare and test the mapping with synthetic data.
    /// Never compiled for a device; the device build never requests heart rate.
    public func simulatorHeartRateSamples(start: Date, end: Date) async throws -> [RawHeartRateSample] {
        try await withCheckedThrowingContinuation { cont in
            let q = HKSampleQuery(sampleType: HKQuantityType(.heartRate), predicate: HKQuery.predicateForSamples(withStart: start, end: end, options: []),
                                  limit: HKObjectQueryNoLimit, sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]) { _, s, e in
                if let e { cont.resume(throwing: Self.map(e)); return }
                let unit = HKUnit.count().unitDivided(by: .minute())
                cont.resume(returning: (s ?? []).compactMap { $0 as? HKQuantitySample }.map {
                    RawHeartRateSample(start: $0.startDate, end: $0.endDate, bpm: $0.quantity.doubleValue(for: unit),
                                       sourceBundleId: $0.sourceRevision.source.bundleIdentifier, deviceModel: $0.device?.model, artifact: nil)
                })
            }
            store.execute(q)
        }
    }
    #endif

    static func map(_ error: Error) -> HealthReadError {
        if let e = error as? HealthReadError { return e }
        if let e = error as? HKError {
            switch e.code {
            case .errorDatabaseInaccessible: return .protectedDataUnavailable
            case .errorHealthDataUnavailable: return .healthDataUnavailable
            default: return .failed(code: "HK_ERROR_\(e.code.rawValue)")
            }
        }
        return .failed(code: "READ_FAILED")
    }
}
#endif
