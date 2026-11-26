#if targetEnvironment(simulator)
import XCTest
import HealthKit
@testable import HealthKitIngest
import IntegrationContracts

/// Handoff original §7 item 8 and item 17, SIMULATOR ONLY: authorization, anchored query, observer, deletion and the heart-rate series
/// mapping over synthetic samples written by this lab into the Simulator's own Health store (never the iPhone's).
/// Precondition: `AuthorizationUITests.testGrantSimulatorAuthorization` ran first on this Simulator.
final class SimulatorHealthKitTests: XCTestCase {
    let hk = HKHealthStore()
    let lab = Bundle.main.bundleIdentifier!
    static let marker = "fit.vilumo.repmile.lab.synthetic"

    override func setUp() async throws {
        let st = await Lab.requestStatus(hk, share: [HKObjectType.workoutType(), HKQuantityType(.distanceWalkingRunning), HKQuantityType(.heartRate)],
                                         read: [HKObjectType.workoutType(), HKQuantityType(.distanceWalkingRunning), HKSeriesType.workoutRoute(), HKQuantityType(.heartRate)])
        guard st == .unnecessary else { throw XCTSkip("SIMULATOR_AUTHORIZATION_NOT_GRANTED (status \(st.rawValue)): run AuthorizationUITests first") }
        // Start from a clean synthetic store: remove what earlier runs of this lab wrote.
        for t in [HKObjectType.workoutType(), HKQuantityType(.distanceWalkingRunning), HKQuantityType(.heartRate)] as [HKSampleType] {
            _ = try? await hk.deleteObjects(of: t, predicate: HKQuery.predicateForObjects(from: HKSource.default()))
        }
    }

    /// A synthetic workout saved through HKWorkoutBuilder, with distance samples and the given metadata.
    @discardableResult
    func save(_ type: HKWorkoutActivityType, start: Date, minutes: Double, meters: Double?, metadata: [String: Any] = [:]) async throws -> HKWorkout {
        let cfg = HKWorkoutConfiguration(); cfg.activityType = type
        if metadata[HKMetadataKeyIndoorWorkout] as? Bool == true { cfg.locationType = .indoor }
        let b = HKWorkoutBuilder(healthStore: hk, configuration: cfg, device: nil)
        let end = start.addingTimeInterval(minutes * 60)
        try await b.beginCollection(at: start)
        if let m = meters {
            try await b.addSamples([HKQuantitySample(type: HKQuantityType(.distanceWalkingRunning), quantity: HKQuantity(unit: .meter(), doubleValue: m), start: start, end: end)])
        }
        try await b.addMetadata(metadata.merging([Self.marker: true]) { a, _ in a })
        try await b.endCollection(at: end)
        return try await b.finishWorkout()!
    }

    func testAuthorizationAnchoredReadObserverAndDeletion() async throws {
        let now = Date()
        let start = now.addingTimeInterval(-36 * 3600)
        let sink = LabSink(recordStartDay: Lab.day(now.addingTimeInterval(-3 * 86_400)))
        var cfg = HealthKitIngestor.Configuration(); let lab = self.lab
        cfg.isDeviceSource = { $0 == lab } // the Simulator's only writer is the lab itself (production: Apple sources only, OPEN-1)
        let log = LabLog()
        let ing = HealthKitIngestor(reader: HealthKitReader(store: hk), sink: sink, recordings: nil, store: Lab.tmpStore(), log: log, configuration: cfg)

        let r1 = try await save(.running, start: start, minutes: 30, meters: 5000, metadata: [HKMetadataKeyTimeZone: "America/Sao_Paulo"])
        let r2 = try await save(.running, start: start.addingTimeInterval(3 * 3600), minutes: 25, meters: 4000, metadata: [HKMetadataKeyIndoorWorkout: true])
        let s1 = try await save(.traditionalStrengthTraining, start: start.addingTimeInterval(6 * 3600), minutes: 45, meters: nil)
        try await save(.running, start: start.addingTimeInterval(9 * 3600), minutes: 20, meters: 3000, metadata: [HKMetadataKeyWasUserEntered: true])

        try await ing.requestAuthorization()     // already answered: returns without a sheet; then reads
        let delivered = await Lab.wait(20) { sink.sent.count >= 2 }
        XCTAssertTrue(delivered, "anchored read delivered the runs: \(log.lines)")
        let byId = Dictionary(uniqueKeysWithValues: sink.sent.map { ($0.activityId, $0) })
        let a1 = try XCTUnwrap(byId[r1.uuid.uuidString]), a2 = try XCTUnwrap(byId[r2.uuid.uuidString])
        XCTAssertEqual(a1.actual.distanceKm, 5); XCTAssertEqual(a1.actual.minutes, 30)
        XCTAssertNil(a1.actual.measurement, "no route written in the Simulator: no GPS claim"); XCTAssertEqual(a1.sourceQuality, .wearablePartial)
        XCTAssertEqual(a1.observedAt, BoundaryInstant.string(r1.endDate, offsetSeconds: TimeZone(identifier: "America/Sao_Paulo")!.secondsFromGMT(for: r1.endDate)))
        XCTAssertEqual(a2.actual.measurement, .treadmill); XCTAssertEqual(a2.sourceQuality, .wearableFull)
        XCTAssertEqual(sink.sent.count, 2, "strength and user-entered never reach the DEVICE channel")
        var c = await ing.counts()
        XCTAssertEqual(c.excluded, ["STRENGTH_NOT_DEVICE_CHANNEL": 1, "USER_ENTERED": 1]); XCTAssertEqual(c.delivered, 2)
        let summaries = await ing.importedNonRunWorkouts(since: .distantPast)
        XCTAssertEqual(summaries.map(\.id), [s1.uuid.uuidString]); XCTAssertEqual(summaries.first?.durationSeconds, 2700)
        let st = await ing.status()
        XCTAssertEqual(st.authorization, .requested); XCTAssertNil(st.lastReadError, "observer and background delivery registered: \(log.lines)")
        XCTAssertTrue(st.receivedTypes.contains("RUN_WORKOUT") && st.receivedTypes.contains("DISTANCE"))

        // Observer: a new workout reaches the queue without any call from the test.
        let r3 = try await save(.running, start: now.addingTimeInterval(-2 * 3600), minutes: 15, meters: 2500)
        let observed = await Lab.wait(30) { sink.sent.contains { $0.activityId == r3.uuid.uuidString } }
        XCTAssertTrue(observed, "HKObserverQuery fired and the anchored read queued and delivered it: \(log.lines)")
        XCTAssertTrue(log.lines.contains { $0.hasPrefix("hki.observerFired") })

        // Deletions through the anchored query: a delivered run is only counted (G-5); a summary leaves the history.
        try await hk.delete(r3); try await hk.delete(s1)
        let deleted = await Lab.wait(30) { await ing.counts().counters["DELETED_AFTER_DELIVERY"] == 1 }
        XCTAssertTrue(deleted, "\(log.lines)")
        let left = await ing.importedNonRunWorkouts(since: .distantPast); XCTAssertTrue(left.isEmpty)
        c = await ing.counts(); XCTAssertEqual(sink.sent.count, 3, "a deletion is never sent")

        // The anchor holds: reading again brings nothing new.
        await ing.readNow(); XCTAssertEqual(sink.sent.count, 3)
        try await ing.purge(.accountErased)
        try await ing.setEnabled(false)
        for l in log.lines { XCTAssertFalse(l.contains("5000") || l.contains("Sao_Paulo") || l.contains(r1.uuid.uuidString), l) }
    }

    func testHeartRateSeriesMappingFromSimulatorSamples() async throws {
        let start = Date().addingTimeInterval(-4 * 3600)
        let w = try await save(.running, start: start, minutes: 20, meters: 3000)
        let unit = HKUnit.count().unitDivided(by: .minute())
        let offsets: [(TimeInterval, Double)] = [(600, 160), (-120, 80), (0, 118), (1300, 90), (300, 150.5), (1200, 171)]
        let samples = offsets.map { HKQuantitySample(type: HKQuantityType(.heartRate), quantity: HKQuantity(unit: unit, doubleValue: $0.1),
                                                     start: start.addingTimeInterval($0.0), end: start.addingTimeInterval($0.0)) }
        try await hk.save(samples)
        let reader = HealthKitReader(store: hk)
        let raw = try await reader.simulatorHeartRateSamples(start: w.startDate.addingTimeInterval(-300), end: w.endDate.addingTimeInterval(300))
        XCTAssertEqual(raw.count, 6)
        let s = try HeartRateSeriesMapping.series(activityId: w.uuid.uuidString, workoutStart: w.startDate, workoutEnd: w.endDate, samples: raw.reversed()).get()
        XCTAssertEqual(s.samples.map(\.t), [0, 300, 600, 1200], "inside the workout, in time order")
        XCTAssertEqual(s.samples.map(\.bpm), [118, 150.5, 160, 171], "bpm as HealthKit gives it")
        XCTAssertEqual(s.sensor, .unknown, "a synthetic sample has no device: UNKNOWN, never a guess")
        XCTAssertEqual(s.durationSeconds, 1200)
        XCTAssertNoThrow(try JSONEncoder().encode(s))
        // V1 answers NOT_IN_V1 whatever HealthKit holds (G-1 / GAP-17).
        let v1 = await HeartRateSeriesNotInV1().heartRateSeries(activityId: w.uuid.uuidString)
        XCTAssertEqual(v1, .unavailable(reason: "NOT_IN_V1"))
    }
}
#endif
