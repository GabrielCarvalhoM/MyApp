import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// #85 through the real frozen boundary (NodeDouble, read only), and `InFlight.mayHaveLanded`: when a retryLater streak may have put the
/// workout on the record. Synthetic workouts only.
final class ResendBoundaryTests: XCTestCase {
    /// Front A over the real boundary, except that its first `lost` sends answer retryLater PERSISTENCE_FAILURE: the first of them after
    /// the boundary recorded it (`landFirst`: a write that landed and whose answer was lost), the others without reaching the boundary.
    final class LossySink: DeviceActivitySink, @unchecked Sendable {
        let inner: NodeSink, landFirst: Bool
        private let lock = NSLock()
        private var lost: Int, sends = 0
        private(set) var delivered: [DeviceDelivery] = []
        init(_ inner: NodeSink, lost: Int, landFirst: Bool) { self.inner = inner; self.lost = lost; self.landFirst = landFirst }
        func ingestContext() async -> IngestContextResult { await inner.ingestContext() }
        func deliver(_ d: DeviceDelivery) async -> DeliveryResult {
            let (n, failing) = lock.withLock { () -> (Int, Bool) in delivered.append(d); sends += 1; return (sends, sends <= lost) }
            guard failing else { return await inner.deliver(d) }
            if landFirst && n == 1 { _ = await inner.deliver(d) }
            return .retryLater(code: "PERSISTENCE_FAILURE")
        }
    }

    /// HK-A (linked to w0-run-d1) and a Strava copy of it; three sends answered retryLater; then a signal and the round.
    func run(landFirst: Bool, athlete: String) async throws -> (NodeSink, LossySink, HealthKitIngestor) {
        let node = try NodeSink(athleteId: athlete); try node.set("2026-11-17", "21:00")
        let sink = LossySink(node, lost: 3, landFirst: landFirst)
        var rig = Rig(sink: sink); rig.config.maxConsecutiveRetryLater = 3
        let a = workout("HK-A", end: at("2026-11-17", "07:45"))
        let copy = WorkoutSnapshot(id: "SA", activityTypeRaw: WorkoutKind.running, start: a.start.addingTimeInterval(5), end: a.end,
                                   durationSeconds: a.durationSeconds - 5, distanceMeters: 4990, hasRoute: true, indoor: nil, wasUserEntered: false,
                                   sourceBundleId: Src.strava, sourceName: nil, timeZoneIdentifier: nil)
        rig.reader.add(a, copy)
        let ing = rig.make(); await ing.start()
        for _ in 0..<2 { rig.clock.advance(400); await rig.scheduler.runAll() }
        let c0 = await ing.counts(); XCTAssertEqual(c0.setAside, [IngestCode.attemptsExhausted: 1]); XCTAssertEqual(c0.consolidated, 1)
        await ing.deliveryConditionsChanged(); rig.clock.advance(900); await rig.scheduler.runAll()
        XCTAssertEqual(sink.delivered.map { $0.activities.map(\.activityId) }, [["HK-A"], ["HK-A"], ["HK-A"], ["HK-A"]], "the copy is never sent")
        XCTAssertEqual(Set(sink.delivered.map(\.deliveryId)).count, 2, "the retried delivery, then ONE new delivery")
        XCTAssertEqual(sink.delivered.last?.activities, sink.delivered.first?.activities)
        return (node, sink, ing)
    }

    /// The write landed and its answer was lost: the re-send under the same activityId with the same facts is DUPLICATE. One row.
    func testALandedWriteIsSettledAsDuplicateAndCountedOnce() async throws {
        let (node, _, ing) = try await run(landFirst: true, athlete: "b-i85-landed")
        let rows = try node.deviceRows()
        XCTAssertEqual(rows.compactMap { $0["activityId"] as? String }, ["HK-A"], "one row for the physical run")
        XCTAssertEqual(rows.first?["sessionId"] as? String, "w0-run-d1")
        let runs = await ing.importedRuns(since: .distantPast)
        XCTAssertEqual(runs.first { $0.id == "HK-A" }?.status, .counted); XCTAssertEqual(runs.first { $0.id == "HK-A" }?.statusCode, "DUPLICATE")
        XCTAssertEqual(runs.first { $0.id == "SA" }?.status, .consolidatedDuplicate)
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.setAside, [:]); XCTAssertEqual(c.consolidated, 1)
    }

    /// Nothing landed during the outage: the re-send is decided as a first send and RECORDED. The run is no longer lost; one row.
    func testARunNothingOfWhichLandedIsRecordedByTheRound() async throws {
        let (node, _, ing) = try await run(landFirst: false, athlete: "b-i85-lost")
        XCTAssertEqual(try node.deviceRows().compactMap { $0["activityId"] as? String }, ["HK-A"])
        let runs = await ing.importedRuns(since: .distantPast)
        XCTAssertEqual(runs.first { $0.id == "HK-A" }?.statusCode, "RECORDED"); XCTAssertEqual(runs.first { $0.id == "SA" }?.status, .consolidatedDuplicate)
    }

    // MARK: mayHaveLanded (the over-caution of P3-2, fail closed)

    static let refusal: (DeviceDelivery) -> DeliveryResult = { _ in .refused(code: "BUSY", index: nil, disposition: .retryLater) }
    func stored(_ store: QueueStore, _ id: String) throws -> QueueItem? {
        try JSONDecoder().decode(QueueState.self, from: XCTUnwrap((store as? MemoryStore)?.data)).items.first { $0.activityId == id }
    }

    /// The process died after a send and before writing its answer: that send may have landed, so a streak finished by refusals after the
    /// relaunch still leaves G1 may-be-on-record.
    func testADeliveryReadBackFromDiskMayHaveLanded() async throws {
        let sink = ScriptedSink(context: .ready(Copies.plan)); var rig = Rig(sink: sink); rig.config.maxConsecutiveRetryLater = 2
        rig.config.resend.maxRounds = 0
        sink.answers = [Self.refusal, Self.refusal, Self.refusal]
        rig.reader.add(Copies.g1, Copies.s1)
        let dying = rig.make(); await dying.setDying(); await dying.start()
        XCTAssertEqual(sink.deliveries.count, 1)
        var again = Rig(sink: sink, store: rig.store); again.config = rig.config
        let ing = again.make(); await ing.start()
        again.clock.advance(400); await again.scheduler.runAll()
        XCTAssertEqual(sink.deliveries.map(\.activities.first?.activityId), ["G1", "G1", "G1"]); XCTAssertEqual(Set(sink.deliveries.map(\.deliveryId)).count, 1)
        XCTAssertEqual(try stored(rig.store, "G1")?.mayBeOnRecord, true)
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 1, "S1 is never promoted")
    }

    /// An answer B could not write is unknown on the next send: it may have been a landed write.
    func testAnAnswerThatCouldNotBeWrittenMayHaveLanded() async throws {
        let store = MemoryStore()
        let sink = ScriptedSink(context: .ready(Copies.plan)); var rig = Rig(sink: sink, store: store); rig.config.maxConsecutiveRetryLater = 2
        rig.config.resend.maxRounds = 0
        sink.answers = [Self.refusal, Self.refusal, Self.refusal]
        rig.reader.add(Copies.g1, Copies.s1)
        let ing = rig.make()
        sink.holdNext = true
        let launch = Task { await ing.start() }
        try await eventually("the first send held") { sink.isHolding }
        store.failSaves = 1; sink.release(); await launch.value
        await ing.readNow()
        rig.clock.advance(400); await rig.scheduler.runAll()
        XCTAssertEqual(sink.deliveries.count, 3); XCTAssertEqual(Set(sink.deliveries.map(\.deliveryId)).count, 1)
        XCTAssertEqual(try stored(store, "G1")?.mayBeOnRecord, true)
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 1)
    }

    /// The same streak of refusals with every answer written: nothing landed, G1 is certainly not on record (the control of the two above).
    func testARefusalOnlyStreakInOneProcessRecordedNothing() async throws {
        let sink = ScriptedSink(context: .ready(Copies.plan)); var rig = Rig(sink: sink); rig.config.maxConsecutiveRetryLater = 2
        rig.config.resend.maxRounds = 0
        sink.answers = [Self.refusal, Self.refusal]
        rig.reader.add(Copies.g1, Copies.s1)
        let ing = rig.make(); await ing.start()
        rig.clock.advance(400); await rig.scheduler.runAll()
        XCTAssertEqual(sink.deliveries.map(\.activities.first?.activityId), ["G1", "G1", "S1"])
        XCTAssertEqual(try stored(rig.store, "G1")?.mayBeOnRecord, false)
    }
}
