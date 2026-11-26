import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// Regressions for the independent review (QRE-B-01..06, 08, 10, 11). P1–P6 are the reviewer's own probes, which failed before the fixes.
final class ReviewRegressionTests: XCTestCase {

    /// QRE-B-01 (P1): a purge on an ingestor that has not loaded yet keeps the athlete's switch OFF.
    func testPurgeBeforeLoadKeepsTheAthletesSwitch() async throws {
        let sink = ScriptedSink(); let store = MemoryStore(); let rig = Rig(sink: sink, store: store)
        let first = rig.make(); await first.start(); try await first.setEnabled(false)
        let second = rig.make()
        try await second.purge(.accountErased)
        let st = await second.status(); XCTAssertTrue(st.disabledInApp)
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        await second.start()
        XCTAssertEqual(sink.deliveries.count, 0, "nothing read or sent while Apple Health is off in RepMile")
    }

    /// QRE-B-01: a purge when the file exists but cannot be read (before the first unlock) throws; it never writes a default switch.
    func testPurgeOfALockedFileThrowsAndWritesNothing() async throws {
        let sink = ScriptedSink(); let store = MemoryStore(); let rig = Rig(sink: sink, store: store)
        let first = rig.make(); await first.start(); try await first.setEnabled(false)
        let bytes = store.data
        store.locked = true
        let second = rig.make()
        do { try await second.purge(.accountErased); XCTFail("expected a throw") } catch {}
        XCTAssertEqual(store.data, bytes)
        store.locked = false
        try await second.purge(.accountErased)
        let st = await second.status(); XCTAssertTrue(st.disabledInApp)
    }

    /// QRE-B-02 (P2): only CONSECUTIVE retryLater answers count; a waiting answer breaks the streak.
    func testRetryLaterStreakBreaksOnAnyOtherAnswer() async throws {
        let sink = ScriptedSink(); var rig = Rig(sink: sink); rig.config.maxConsecutiveRetryLater = 3
        sink.answers = [{ _ in .retryLater(code: "BUSY") }, { _ in .retryLater(code: "BUSY") },
                        { _ in .waiting(code: "SCREEN_REQUIRED") }, { _ in .retryLater(code: "BUSY") }]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        rig.clock.advance(400); await rig.scheduler.runAll()
        rig.clock.advance(400); await rig.scheduler.runAll()
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 4)
        let c = await ing.counts(); XCTAssertEqual(c.setAside, [:])
        rig.clock.advance(400); await rig.scheduler.runAll()
        let c2 = await ing.counts(); XCTAssertEqual(c2.delivered, 1)
    }

    /// QRE-B-03 (P3, P3b): a signal that arrives while a delivery is in flight is not consumed by that delivery's stale answer.
    func testASignalDuringAFlightIsNeverLost() async throws {
        for answer in [{ (_: DeviceDelivery) in DeliveryResult.waiting(code: "SCREEN_REQUIRED") },
                       ScriptedSink.each(.notRecorded(reason: "NOT_RECORDED_BY_THIS_DECISION")),
                       { _ in .halted(code: "NOT_ENROLLED") }, { _ in .hostUnavailable }] {
            let sink = ScriptedSink(); let rig = Rig(sink: sink)
            sink.holdNext = true; sink.answers = [answer]
            rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
            let ing = rig.make()
            let started = Task { await ing.start() }
            while !sink.isHolding { try await Task.sleep(nanoseconds: 1_000_000) }
            let signal = Task { await ing.deliveryConditionsChanged() }
            try await Task.sleep(nanoseconds: 50_000_000)
            sink.release()
            await started.value; await signal.value
            XCTAssertEqual(sink.deliveries.count, 2, "re-sent without waiting for a second signal")
            let c = await ing.counts(); XCTAssertEqual(c.delivered, 1)
            let st = await ing.status(); XCTAssertNil(st.waitingReason)
        }
    }

    /// QRE-B-04 (P4): B's own failed write is retried on the next trigger (a read), not only on A's signal.
    func testOwnWriteFailureIsRetriedOnTheNextTrigger() async throws {
        final class FailNth: QueueStore, @unchecked Sendable {
            let inner = MemoryStore(); var n = 0; let fail: Int
            init(_ fail: Int) { self.fail = fail }
            func load() throws -> Data? { try inner.load() }
            func save(_ d: Data) throws { n += 1; if n == fail { throw QueueStoreError.writeFailed(code: 28) }; try inner.save(d) }
            func remove() throws { try inner.remove() }
        }
        // writes: 1 read, 2 in-flight, 3 the answer (fails)
        let sink = ScriptedSink(); let rig = Rig(sink: sink, store: FailNth(3))
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        let st = await ing.status(); XCTAssertEqual(st.waitingReason, "QUEUE_WRITE_FAILED")
        rig.reader.add(workout("B", end: at("2026-11-18", "07:45"))); await rig.reader.fire(); await ing.settled()
        XCTAssertEqual(sink.deliveries.count, 3, "the unwritten answer is replayed with the same id, then B goes out")
        XCTAssertEqual(sink.deliveries[0].deliveryId, sink.deliveries[1].deliveryId)
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 2)
    }

    /// QRE-B-04 (P6): a host that was unavailable is tried again on the next trigger (an observer fire).
    func testHostUnavailableIsRetriedOnTheNextTrigger() async throws {
        let sink = ScriptedSink(); let rig = Rig(sink: sink)
        sink.answers = [{ _ in .hostUnavailable }]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        rig.reader.add(workout("B", end: at("2026-11-18", "07:45")))
        await rig.reader.fire(); await ing.settled(); await ing.pump()
        XCTAssertEqual(sink.deliveries.count, 3)
        XCTAssertEqual(sink.deliveries[0].deliveryId, sink.deliveries[1].deliveryId)
    }

    /// QRE-B-05 (P5): a purge whose write fails fails closed: nothing purged is sent, and the write is retried on the next trigger.
    func testAFailedPurgeFailsClosed() async throws {
        let sink = ScriptedSink(); let store = MemoryStore(); let rig = Rig(sink: sink, store: store)
        sink.answers = [{ _ in .waiting(code: "NOT_ENROLLED") }]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        store.failSaves = 1
        do { try await ing.purge(.recordLossAcknowledged); XCTFail("expected a throw") } catch {}
        let c = await ing.counts(); XCTAssertEqual(c.pending + c.delivered + c.inFlight, 0, "memory already holds the purged state")
        // The new record starts after the old workout (its read window excludes it; a purge clears the anchor, never Apple Health).
        sink.context = .ready(.plan([], start: "2026-11-20"))
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.dropFirst().flatMap(\.activities).map(\.activityId), [], "never sent after the purge")
        let disk = try JSONDecoder().decode(QueueState.self, from: XCTUnwrap(store.data))
        XCTAssertTrue(disk.items.isEmpty && disk.ledger.isEmpty && disk.generation == 1, "the purge reached the disk on the next trigger")
    }

    /// QRE-B-06: FND-ABC-06 (b) is counted: a reported app recording overlapping a watch run below the same-run threshold.
    func testPartialOverlapWithAReportedRecordingIsCounted() async throws {
        let sink = ScriptedSink(); let index = FakeRecordingIndex(); let rig = Rig(sink: sink, index: index)
        let long = workout("L", end: at("2026-11-19", "07:00"), minutes: 60)
        index.set([AppRecordedRunRef(id: "r", sessionId: nil, start: at("2026-11-19", "06:10"), end: at("2026-11-19", "06:15"), reportedEventId: "ob_1")])
        rig.reader.add(long)
        let ing = rig.make(); await ing.start(); await ing.deliveryConditionsChanged()
        let c = await ing.counts()
        XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.counters[IngestCode.partialOverlapWithReportedAppRecording], 1, "counted once")
    }

    /// QRE-B-11 (1): a launch re-decides a workout that is STILL held (the index changed while the app was closed).
    func testALaunchRedecidesAHeldWorkout() async throws {
        let sink = ScriptedSink(); let index = FakeRecordingIndex(); let store = MemoryStore()
        let rig = Rig(sink: sink, store: store, index: index)
        let w = workout("W", end: at("2026-11-17", "07:45"))
        index.set([AppRecordedRunRef(id: "r", sessionId: nil, start: w.start, end: w.end, reportedEventId: nil)])
        rig.reader.add(w)
        let ing = rig.make(); await ing.start()
        let held = await ing.counts().held; XCTAssertEqual(held, 1)
        index.set([])                                   // discarded while the app was closed
        let relaunched = rig.make(); await relaunched.start()
        let c = await relaunched.counts(); XCTAssertEqual(c.held, 0); XCTAssertEqual(c.delivered, 1)
    }

    /// QRE-B-08: the observer's completion runs after the read is durably queued, without waiting for the delivery to the host.
    func testObserverCompletionDoesNotWaitForTheDelivery() async throws {
        let sink = ScriptedSink(); let store = MemoryStore(); let rig = Rig(sink: sink, store: store)
        let ing = rig.make(); await ing.start()
        sink.holdNext = true
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        await rig.reader.fire()                          // returns although the delivery is held by the host
        let disk = try JSONDecoder().decode(QueueState.self, from: XCTUnwrap(store.data))
        XCTAssertEqual(disk.items.map(\.activityId), ["A"], "durably queued before the completion")
        while !sink.isHolding { try await Task.sleep(nanoseconds: 1_000_000) }
        sink.release()
        for _ in 0..<200 { if await ing.counts().delivered == 1 { break }; try await Task.sleep(nanoseconds: 5_000_000) }
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1)
    }

    /// QRE-B-10: a queue file written without a field a later version added still loads (defaults), never "unreadable".
    func testAnOlderQueueFileStillLoads() async throws {
        let sink = ScriptedSink(); let store = MemoryStore(); let rig = Rig(sink: sink, store: store)
        sink.answers = [{ _ in .waiting(code: "SCREEN_REQUIRED") }]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        var o = try JSONSerialization.jsonObject(with: XCTUnwrap(store.data)) as! [String: Any]
        for k in ["counters", "receivedTypes", "retryLaterStreak", "summaries"] { o.removeValue(forKey: k) }
        var items = o["items"] as! [[String: Any]]; items[0].removeValue(forKey: "adapterBugStrikes"); o["items"] = items
        try store.save(JSONSerialization.data(withJSONObject: o))
        let again = rig.make(); await again.deliveryConditionsChanged()
        let c = await again.counts(); XCTAssertEqual(c.delivered, 1)
    }
}
