import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// #48 P3-4: the tests front B's integration review found missing or weak, and the QueueStore protection write (#48, QueueStore.swift).
final class IntegrationReviewTests: XCTestCase {
    static let garbage = Data("not a queue file".utf8)

    // MARK: QRE-B-R2-02 (b): an undecodable file

    /// Never read, written or sent while undecodable; its purge leaves the switch OFF (unknown, never on by default).
    func testAnUndecodableFileIsNeverOverwrittenAndItsPurgeLeavesTheSwitchOff() async throws {
        let sink = ScriptedSink(); let store = MemoryStore(); try store.save(Self.garbage)
        let rig = Rig(sink: sink, store: store)
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start(); await ing.deliveryConditionsChanged(); await ing.readNow()
        do { try await ing.setEnabled(true); XCTFail("expected a throw") } catch {}
        XCTAssertEqual(store.data, Self.garbage, "never overwritten"); XCTAssertEqual(rig.reader.reads, 0); XCTAssertEqual(sink.deliveries.count, 0)
        XCTAssertFalse(rig.reader.observing, "nothing registered for a file whose switch is unknown")
        let st = await ing.status(); XCTAssertEqual(st.waitingReason, "QUEUE_UNREADABLE"); XCTAssertEqual(st.lastReadError, "QUEUE_UNREADABLE")
        try await ing.purge(.accountErased)
        let after = await ing.status(); XCTAssertTrue(after.disabledInApp); XCTAssertNil(after.waitingReason)
        let disk = try JSONDecoder().decode(QueueState.self, from: XCTUnwrap(store.data))
        XCTAssertFalse(disk.enabled); XCTAssertTrue(disk.items.isEmpty && disk.ledger.isEmpty); XCTAssertEqual(disk.generation, 1)
        await ing.readNow(); XCTAssertEqual(sink.deliveries.count, 0, "off until the athlete turns it on")
        try await ing.setEnabled(true)
        XCTAssertEqual(sink.deliveries.count, 1)
    }

    // MARK: QRE-B-R2-02 (c): no remove() before the atomic write

    /// A purge of an undecodable file replaces it in one atomic write: never "no file" (which would read as the switch on) in between,
    /// also when that write fails and the process then dies.
    func testPurgingAnUndecodableFileNeverRemovesItFirst() async throws {
        let sink = ScriptedSink(); let store = OpsStore(Self.garbage); store.failSaves = 1
        let rig = Rig(sink: sink, store: store)
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let first = rig.make(); await first.start()
        do { try await first.purge(.recordLossAcknowledged); XCTFail("expected a throw") } catch {}
        XCTAssertFalse(store.ops.contains("remove")); XCTAssertEqual(store.data, Self.garbage, "the old file stays until the new one replaces it")
        let st = await first.status(); XCTAssertTrue(st.disabledInApp); XCTAssertEqual(st.waitingReason, "QUEUE_WRITE_FAILED")
        // The process dies here; the next launch finds the old, undecodable file, never an absent one.
        let relaunched = rig.make(); await relaunched.start()
        let st2 = await relaunched.status(); XCTAssertEqual(st2.waitingReason, "QUEUE_UNREADABLE"); XCTAssertEqual(sink.deliveries.count, 0)
        try await relaunched.purge(.recordLossAcknowledged)
        XCTAssertFalse(store.ops.contains("remove"))
        let st3 = await relaunched.status(); XCTAssertTrue(st3.disabledInApp)
        await relaunched.readNow(); XCTAssertEqual(sink.deliveries.count, 0)
    }

    // MARK: CCP-B-04: A's signal from inside `deliver`

    /// Worst case (A breaks rule 1 and awaits B's signal inside B's `deliver`): no deadlock, and the signal counts for that delivery.
    func testASignalAwaitedInsideDeliverNeverDeadlocks() async throws {
        final class SignallingSink: DeviceActivitySink, @unchecked Sendable {
            let inner = ScriptedSink(); weak var ingestor: HealthKitIngestor?; var signalled = false
            func ingestContext() async -> IngestContextResult { await inner.ingestContext() }
            func deliver(_ d: DeviceDelivery) async -> DeliveryResult {
                if !signalled, let i = ingestor { signalled = true; await i.deliveryConditionsChanged() }
                return await inner.deliver(d)
            }
        }
        let sink = SignallingSink(); let rig = Rig(sink: sink)
        sink.inner.answers = [ScriptedSink.each(.notRecorded(reason: "NOT_RECORDED_BY_THIS_DECISION"))]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); sink.ingestor = ing
        await assertFinishes(within: 5, self, "start with a signal inside deliver") { await ing.start() }
        XCTAssertEqual(sink.inner.deliveries.count, 2, "the NOT_RECORDED answer came after the signal: re-sent at once")
        XCTAssertNotEqual(sink.inner.deliveries[0].deliveryId, sink.inner.deliveries[1].deliveryId)
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1)
    }

    /// Rule 1 as A implements it: the signal is sent from a Task, never awaited inside `deliver`. Nothing is lost either way.
    func testASignalSentFromATaskInsideDeliverIsNeverLost() async throws {
        final class TaskSignallingSink: DeviceActivitySink, @unchecked Sendable {
            let inner = ScriptedSink(); weak var ingestor: HealthKitIngestor?; var signalled = false
            func ingestContext() async -> IngestContextResult { await inner.ingestContext() }
            func deliver(_ d: DeviceDelivery) async -> DeliveryResult {
                if !signalled, let i = ingestor { signalled = true; Task { await i.deliveryConditionsChanged() } }
                return await inner.deliver(d)
            }
        }
        let sink = TaskSignallingSink(); let rig = Rig(sink: sink)
        sink.inner.answers = [ScriptedSink.each(.notRecorded(reason: "NOT_RECORDED_BY_THIS_DECISION"))]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); sink.ingestor = ing
        await assertFinishes(within: 5, self, "start") { await ing.start() }
        try await eventually { await ing.counts().delivered == 1 }
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(sink.inner.deliveries.count, 2)
    }

    /// The timeout helper really fails a test whose work never finishes (what `cancel()` in the old R2-01 test could not do).
    func testTheTimeoutFailsInsteadOfHanging() async {
        XCTExpectFailure("work that never finishes must fail the test, not hang it")
        await assertFinishes(within: 0.2, self, "never") { await withCheckedContinuation { (_: CheckedContinuation<Void, Never>) in } }
    }

    // MARK: copies of one run arriving in different reads

    /// Nothing sent in between: the run of the group is the same whatever read brought which copy (P: partial, F: full).
    func testCopiesArrivingInDifferentReadsChooseTheSameRun() async throws {
        let p = hkRun("P", "2026-11-17", "07:00", minutes: 30, meters: nil, route: false, source: Src.garmin)
        let f = hkRun("F", "2026-11-17", "07:00", seconds: 30, minutes: 30, meters: 5000, source: Src.strava)
        for batches in [[[p, f]], [[p], [f]], [[f], [p]]] {
            let inner = ScriptedSink(context: .ready(Copies.plan)); let sink = ContextScriptSink(inner); let rig = Rig(sink: sink)
            let ing = rig.make()
            for (n, batch) in batches.enumerated() {
                for w in batch { rig.reader.add(w) }
                // Every read but the last finds the host unable to take a delivery: the copy is queued, never sent.
                if n < batches.count - 1 { sink.then(.ready(Copies.plan), .unavailable(code: HostCode.hostUnavailable)) }
                if n == 0 { await ing.start() } else { await rig.reader.fire(); await ing.settled() }
            }
            XCTAssertEqual(inner.deliveries.flatMap(\.activities).map(\.activityId), ["F"], "\(batches.map { $0.map(\.id) })")
            let c = await ing.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.consolidated, 1)
        }
    }

    /// The first copy was already sent (frozen) when the better one arrives in a later read: the first stays the run, counted once.
    func testACopyArrivingInALaterReadAfterTheFirstWasSentIsConsolidated() async {
        let p = hkRun("P", "2026-11-17", "07:00", minutes: 30, meters: nil, route: false, source: Src.garmin)
        let f = hkRun("F", "2026-11-17", "07:00", seconds: 30, minutes: 30, meters: 5000, source: Src.strava)
        let sink = ScriptedSink(context: .ready(Copies.plan)); let rig = Rig(sink: sink)
        sink.answers = [{ _ in .waiting(code: "SCREEN_REQUIRED") }]
        rig.reader.add(p)
        let ing = rig.make(); await ing.start()
        rig.reader.add(f); await rig.reader.fire(); await ing.settled(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.flatMap(\.activities).map(\.activityId), ["P", "P"])
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.consolidated, 1)
    }

    // MARK: QueueStore: the data-protection class (formerly a silent `try?`)

    func testAFileThatCannotBeProtectedNeverReplacesTheCurrentOne() async throws {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("hki-protect-\(UUID().uuidString)")
        defer { try? FileManager.default.removeItem(at: dir) }
        try FileQueueStore(directory: dir).save(Data("old".utf8))
        struct Refused: Error {}
        let failing = FileQueueStore(directory: dir, protect: { _ in throw Refused() })
        XCTAssertThrowsError(try failing.save(Data("new".utf8))) { XCTAssertEqual($0 as? QueueStoreError, .protectionFailed) }
        XCTAssertEqual(try FileManager.default.contentsOfDirectory(atPath: dir.path), ["queue.json"], "no unprotected temporary left")
        XCTAssertEqual(try failing.load(), Data("old".utf8))
        // Through the ingestor: the answer is not written, so nothing more is sent until a write succeeds.
        let sink = ScriptedSink(); let rig = Rig(sink: sink, store: failing)
        try FileManager.default.removeItem(at: dir)
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        let st = await ing.status(); XCTAssertEqual(st.lastReadError, "QUEUE_WRITE_FAILED"); XCTAssertEqual(sink.deliveries.count, 0)
    }
}
