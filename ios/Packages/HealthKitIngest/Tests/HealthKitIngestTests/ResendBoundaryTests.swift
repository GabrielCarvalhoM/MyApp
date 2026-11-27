import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// #85 through the real frozen boundary (NodeDouble, read only), and `QueueItem.mayHaveLanded`: when a send may have put the workout on
/// the record (QRE #90 P3-1, P3-2). Synthetic workouts only.
final class ResendBoundaryTests: XCTestCase {
    /// Front A over the real boundary, except for its first sends, scripted: `landAndLose` reaches the boundary (the write lands) and
    /// answers retryLater PERSISTENCE_FAILURE (the answer is lost), `lose` answers the same without reaching it, `waiting` is A's own
    /// refusal before the boundary (e.g. CLOCK_AHEAD_OF_REFERENCE). Every later send goes to the boundary.
    final class LossySink: DeviceActivitySink, @unchecked Sendable {
        enum Step { case landAndLose, lose, waiting(String) }
        let inner: NodeSink
        private let lock = NSLock()
        private var script: [Step]
        private(set) var delivered: [DeviceDelivery] = []
        init(_ inner: NodeSink, _ script: [Step]) { self.inner = inner; self.script = script }
        func ingestContext() async -> IngestContextResult { await inner.ingestContext() }
        func deliver(_ d: DeviceDelivery) async -> DeliveryResult {
            let step = lock.withLock { () -> Step? in delivered.append(d); return script.isEmpty ? nil : script.removeFirst() }
            switch step {
            case nil: return await inner.deliver(d)
            case .landAndLose?: _ = await inner.deliver(d); return .retryLater(code: "PERSISTENCE_FAILURE")
            case .lose?: return .retryLater(code: "PERSISTENCE_FAILURE")
            case .waiting(let c)?: return .waiting(code: c)
            }
        }
    }

    /// HK-A (linked to w0-run-d1) and a Strava copy of it; three sends answered retryLater; then a signal and the round.
    func run(landFirst: Bool, athlete: String) async throws -> (NodeSink, LossySink, HealthKitIngestor) {
        let node = try NodeSink(athleteId: athlete); try node.set("2026-11-17", "21:00")
        let sink = LossySink(node, landFirst ? [.landAndLose, .lose, .lose] : [.lose, .lose, .lose])
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

    /// QRE #90 P3-1, through the real boundary: the write lands and its answer is lost (retryLater), the athlete deletes the run, the
    /// retry is refused CLOCK_AHEAD_OF_REFERENCE (waiting). The run may be on the record: kept, never re-sent, and its copy never sent.
    func testARunDeletedAfterALandedWriteIsNeverCountedTwice() async throws {
        let node = try NodeSink(athleteId: "b-i85-deleted"); try node.set("2026-11-17", "21:00")
        let sink = LossySink(node, [.landAndLose, .waiting(HostCode.clockAheadOfReference)])
        let rig = Rig(sink: sink)
        let a = workout("HK-A", end: at("2026-11-17", "07:45"))
        let copy = WorkoutSnapshot(id: "SA", activityTypeRaw: WorkoutKind.running, start: a.start.addingTimeInterval(5), end: a.end,
                                   durationSeconds: a.durationSeconds - 5, distanceMeters: 4990, hasRoute: true, indoor: nil, wasUserEntered: false,
                                   sourceBundleId: Src.strava, sourceName: nil, timeZoneIdentifier: nil)
        rig.reader.add(a, copy)
        let ing = rig.make(); await ing.start()
        rig.reader.delete("HK-A"); await ing.readNow()
        rig.clock.advance(2); await rig.scheduler.runAll()
        await ing.deliveryConditionsChanged(); rig.clock.advance(86_400); await rig.scheduler.runAll(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.delivered.map { $0.activities.map(\.activityId) }, [["HK-A"], ["HK-A"]], "never re-sent, the copy never sent")
        XCTAssertEqual(try node.deviceRows().compactMap { $0["activityId"] as? String }, ["HK-A"], "one row for the physical run")
        let c = await ing.counts()
        XCTAssertEqual(c.counters[IngestCode.deletedMaybeOnRecord], 1); XCTAssertNil(c.counters[IngestCode.deletedBeforeDelivery])
        XCTAssertEqual(c.setAside, [IngestCode.attemptsExhausted: 1]); XCTAssertEqual(c.consolidated, 1)
    }

    // MARK: mayHaveLanded (the over-caution of P3-2, fail closed; QRE #90 P3-1, P3-2)

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

    /// The QRE #90 P3-1 sequence, scripted: retryLater, then deleted while the delivery waits for its retry, then waiting. Kept set aside
    /// ATTEMPTS_EXHAUSTED and may-be-on-record, with no round; counted once.
    func testARunDeletedInFlightAfterASendThatMayHaveLandedIsKept() async throws {
        let sink = ScriptedSink(context: .ready(Copies.plan)); let rig = Rig(sink: sink)
        sink.answers = [{ _ in .retryLater(code: "OPERATIONAL_ERROR") }, { _ in .waiting(code: HostCode.clockAheadOfReference) }]
        rig.reader.add(Copies.g1, Copies.s1)
        let ing = rig.make(); await ing.start()
        rig.reader.delete("G1"); await ing.readNow()
        rig.clock.advance(2); await rig.scheduler.runAll()
        await ing.deliveryConditionsChanged(); rig.clock.advance(86_400); await rig.scheduler.runAll(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.map(\.activities.first?.activityId), ["G1", "G1"], "S1 is never sent")
        let g1 = try stored(rig.store, "G1")
        XCTAssertEqual(g1?.state, .setAside(code: IngestCode.attemptsExhausted)); XCTAssertEqual(g1?.mayBeOnRecord, true); XCTAssertNil(g1?.resendDue)
        let c = await ing.counts()
        XCTAssertEqual(c.counters[IngestCode.deletedMaybeOnRecord], 1); XCTAssertNil(c.counters[IngestCode.deletedBeforeDelivery]); XCTAssertEqual(c.consolidated, 1)
    }

    /// The same knowledge outside a delivery: after retryLater then waiting G1 waits, pending, for a new delivery; deleted then, it is kept.
    func testAPendingRunASendOfWhichMayHaveLandedIsKeptWhenDeleted() async throws {
        let sink = ScriptedSink(context: .ready(Copies.plan)); let rig = Rig(sink: sink)
        sink.answers = [{ _ in .retryLater(code: "OPERATIONAL_ERROR") }, { _ in .waiting(code: "CONSENT_REQUIRED") }]
        rig.reader.add(Copies.g1, Copies.s1)
        let ing = rig.make(); await ing.start()
        rig.clock.advance(2); await rig.scheduler.runAll()
        XCTAssertEqual(try stored(rig.store, "G1")?.state, .pending)
        rig.reader.delete("G1"); await ing.readNow(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 2)
        XCTAssertEqual(try stored(rig.store, "G1")?.mayBeOnRecord, true)
        let c = await ing.counts()
        XCTAssertEqual(c.counters[IngestCode.deletedMaybeOnRecord], 1); XCTAssertNil(c.counters[IngestCode.deletedBeforeDelivery]); XCTAssertEqual(c.consolidated, 1)
    }

    /// A refusal that sets G1 aside after a send that may have landed proves nothing about that send: G1 keeps its group.
    func testASetAsideAfterASendThatMayHaveLandedKeepsItsGroup() async throws {
        let sink = ScriptedSink(context: .ready(Copies.plan)); let rig = Rig(sink: sink)
        sink.answers = [{ _ in .retryLater(code: "OPERATIONAL_ERROR") }, { _ in .refused(code: "BEFORE_RECORD_START", index: 0, disposition: .setAsideItem) }]
        rig.reader.add(Copies.g1, Copies.s1)
        let ing = rig.make(); await ing.start()
        rig.clock.advance(2); await rig.scheduler.runAll(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 2, "S1 is never sent")
        XCTAssertEqual(try stored(rig.store, "G1")?.mayBeOnRecord, true)
        let c = await ing.counts(); XCTAssertEqual(c.setAside, ["BEFORE_RECORD_START": 1]); XCTAssertEqual(c.consolidated, 1)
    }

    /// A queue file without `mayHaveLanded`: a workout that was sent (frozen) may have landed; one never sent cannot have.
    func testAFileWithoutTheFlagFailsClosedForASentRun() async throws {
        let store = MemoryStore()
        let sink = ScriptedSink(context: .ready(Copies.plan)); let rig = Rig(sink: sink, store: store)
        sink.answers = [{ _ in .waiting(code: "CONSENT_REQUIRED") }]
        rig.reader.add(Copies.g1, Copies.s1)
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(try stored(store, "G1")?.mayHaveLanded, false, "a waiting answer records nothing")
        var o = try JSONSerialization.jsonObject(with: XCTUnwrap(store.data)) as! [String: Any]
        o["items"] = (o["items"] as! [[String: Any]]).map { var i = $0; i.removeValue(forKey: "mayHaveLanded"); return i }
        try store.save(JSONSerialization.data(withJSONObject: o))
        XCTAssertEqual(try stored(store, "G1")?.mayHaveLanded, true); XCTAssertEqual(try stored(store, "S1")?.mayHaveLanded, false)
        _ = ing
    }
}
