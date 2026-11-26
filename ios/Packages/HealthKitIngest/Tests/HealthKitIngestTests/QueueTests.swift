import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// Handoff original §7 items 3–7 with the scripted host (codes and shapes from the shared contract only).
final class QueueTests: XCTestCase {
    static let plan = IngestContext.plan([("w0-run-d1", "2026-11-17"), ("w0-run-d3", "2026-11-19"), ("dd-a", "2026-11-21"), ("dd-b", "2026-11-21")])

    // MARK: link (contract §4.3)

    func testLinkOnlyWhenUnambiguous() async {
        let sink = ScriptedSink(context: .ready(Self.plan)); let rig = Rig(sink: sink)
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")),                       // one session, one workout → linked
                       workout("B", end: at("2026-11-19", "07:00")), workout("C", end: at("2026-11-19", "19:00")), // two workouts → none
                       workout("D", end: at("2026-11-21", "08:00")),                       // two RUN sessions → none
                       workout("E", end: at("2026-11-18", "08:00")))                       // no session → none
        let ing = rig.make(); await ing.start()
        let sent = sink.deliveries.flatMap(\.activities)
        XCTAssertEqual(sent.map(\.activityId), ["A", "E", "B", "C", "D"], "ascending end date")
        XCTAssertEqual(Dictionary(uniqueKeysWithValues: sent.map { ($0.activityId, $0.sessionId ?? "-") }), ["A": "w0-run-d1", "B": "-", "C": "-", "D": "-", "E": "-"])
    }

    func testDayIsReadInThePlanOffsetNotTheDevice() async {
        let sink = ScriptedSink(context: .ready(Self.plan))
        // 2026-11-17T02:30Z is 2026-11-16 23:30 in the plan's -03:00: no session that day (UTC, the device's zone here, would say 11-17).
        let saved = NSTimeZone.default; NSTimeZone.default = TimeZone(identifier: "UTC")!; defer { NSTimeZone.default = saved }
        let end = ISO8601DateFormatter().date(from: "2026-11-17T02:30:00Z")!
        let rig2 = Rig(sink: sink); rig2.reader.add(workout("N2", end: end, tz: nil))
        let ing = rig2.make(); await ing.start()
        XCTAssertNil(sink.deliveries.last!.activities[0].sessionId)
        XCTAssertEqual(BoundaryInstant.day(end, offsetMinutes: -180), "2026-11-16")
    }

    func testOneWorkoutPerSessionAndLinkKeptForever() async {
        let sink = ScriptedSink(context: .ready(Self.plan)); let rig = Rig(sink: sink)
        sink.answers = [{ _ in .waiting(code: "SCREEN_REQUIRED") }]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(sink.deliveries.count, 1); XCTAssertEqual(sink.deliveries[0].activities[0].sessionId, "w0-run-d1")
        // The plan changes (no session that day any more): the first link is kept, byte for byte, in a NEW delivery.
        sink.context = .ready(.plan([("w0-run-d3", "2026-11-19")]))
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 2)
        XCTAssertEqual(sink.deliveries[1].activities, sink.deliveries[0].activities)
        XCTAssertNotEqual(sink.deliveries[1].deliveryId, sink.deliveries[0].deliveryId)
        // A second workout that day: the session already has one → unlinked.
        sink.context = .ready(Self.plan)
        rig.reader.add(workout("A2", end: at("2026-11-17", "19:00")))
        await rig.reader.fire()
        XCTAssertEqual(sink.deliveries.last!.activities.map(\.activityId), ["A2"]); XCTAssertNil(sink.deliveries.last!.activities[0].sessionId)
        // Re-read of a delivered workout (an anchor lost): nothing sent again.
        let rig3Reader = ScriptedReader(); let a = workout("A", end: at("2026-11-17", "07:45")); rig3Reader.add(a, a, a)
        let again = rig.make(reader: rig3Reader); await again.start()
        XCTAssertEqual(sink.deliveries.count, 3)
    }

    // MARK: §6.2 answers

    func testRetryLaterReusesTheIdWithBoundedBackoff() async {
        let sink = ScriptedSink(); let rig = Rig(sink: sink)
        sink.answers = [{ _ in .retryLater(code: "BUSY") }, { _ in .retryLater(code: "PERSISTENCE_FAILURE") }]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(sink.deliveries.count, 1); XCTAssertEqual(rig.scheduler.delays, [2])
        let st = await ing.status(); XCTAssertEqual(st.waitingReason, "BUSY"); XCTAssertEqual(st.queued, 1)
        rig.clock.advance(2); await rig.scheduler.runAll()
        XCTAssertEqual(sink.deliveries.count, 2); XCTAssertEqual(rig.scheduler.delays, [4])
        rig.clock.advance(4); await rig.scheduler.runAll()
        XCTAssertEqual(sink.deliveries.count, 3)
        XCTAssertEqual(Set(sink.deliveries.map(\.deliveryId)).count, 1, "the same delivery id after retryLater")
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.pending, 0)
    }

    func testHaltedStopsUntilTheHostSignals() async {
        let sink = ScriptedSink(); let rig = Rig(sink: sink)
        sink.answers = [{ _ in .halted(code: "RECORD_LOST") }]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        rig.reader.add(workout("B", end: at("2026-11-18", "07:45"))); await rig.reader.fire(); await ing.readNow()
        XCTAssertEqual(sink.deliveries.count, 1, "never retried on a trigger or a timer")
        XCTAssertTrue(rig.scheduler.delays.isEmpty)
        let st = await ing.status(); XCTAssertEqual(st.waitingReason, "RECORD_LOST"); XCTAssertEqual(st.queued, 2)
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 2); XCTAssertNotEqual(sink.deliveries[1].deliveryId, sink.deliveries[0].deliveryId)
        XCTAssertEqual(sink.deliveries[1].activities.map(\.activityId), ["A", "B"])
    }

    func testWaitingAndHaltedNeverCountTowardTheLimit() async {
        let sink = ScriptedSink(); var rig = Rig(sink: sink); rig.config.maxAttempts = 2
        sink.answers = (0..<20).map { i in { _ in i % 2 == 0 ? .waiting(code: "CONSENT_REQUIRED") : .halted(code: "NOT_ENROLLED") } }
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        for _ in 0..<19 { await ing.deliveryConditionsChanged() }
        XCTAssertEqual(sink.deliveries.count, 20)
        let c = await ing.counts(); XCTAssertEqual(c.setAside, [:]); XCTAssertEqual(c.pending, 1)
        await ing.deliveryConditionsChanged()
        let c2 = await ing.counts(); XCTAssertEqual(c2.delivered, 1)
    }

    func testNotRecordedWaitsForTheHostThenStopsAtTheLimit() async {
        let sink = ScriptedSink(); let rig = Rig(sink: sink)
        sink.answers = (0..<9).map { _ in ScriptedSink.each(.notRecorded(reason: "NOT_RECORDED_BY_THIS_DECISION")) }
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        await rig.reader.fire(); await ing.readNow()
        XCTAssertEqual(sink.deliveries.count, 1, "NOT_RECORDED is re-sent only after deliveryConditionsChanged()")
        for _ in 0..<8 { await ing.deliveryConditionsChanged() }
        XCTAssertEqual(sink.deliveries.count, 9, "the first send and 8 re-sends")
        XCTAssertEqual(Set(sink.deliveries.map(\.deliveryId)).count, 9, "every re-send is a NEW delivery")
        let c = await ing.counts(); XCTAssertEqual(c.setAside, ["ATTEMPTS_EXHAUSTED": 1])
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 9, "nothing is re-sent forever")
    }

    func testConsecutiveRetryLaterAreBounded() async {
        let sink = ScriptedSink(); var rig = Rig(sink: sink); rig.config.maxConsecutiveRetryLater = 3
        sink.answers = (0..<5).map { _ in { _ in .retryLater(code: "OPERATIONAL_ERROR") } }
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        for _ in 0..<4 { rig.clock.advance(400); await rig.scheduler.runAll() }
        XCTAssertEqual(sink.deliveries.count, 3)
        let c = await ing.counts(); XCTAssertEqual(c.setAside, ["ATTEMPTS_EXHAUSTED": 1])
    }

    func testAdapterBugSplitsTheChunkThenSetsAsideOnRepetition() async {
        let sink = ScriptedSink(); let rig = Rig(sink: sink)
        let bug: (DeviceDelivery) -> DeliveryResult = { _ in .refused(code: "INVALID_REQUEST", index: nil, disposition: .adapterBug) }
        sink.answers = [bug, ScriptedSink.recordAll, ScriptedSink.recordAll, ScriptedSink.recordAll]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")), workout("B", end: at("2026-11-18", "07:45")),
                       workout("C", end: at("2026-11-19", "07:45")), workout("D", end: at("2026-11-20", "07:45")))
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(sink.deliveries.map(\.activities.count), [4, 2, 2])
        // One workout refused as an adapter bug twice → set aside with the code.
        let sink2 = ScriptedSink(); let rig2 = Rig(sink: sink2); sink2.answers = [bug, bug]
        rig2.reader.add(workout("Z", end: at("2026-11-17", "07:45")))
        let ing2 = rig2.make(); await ing2.start()
        XCTAssertEqual(sink2.deliveries.count, 2)
        let c = await ing2.counts(); XCTAssertEqual(c.setAside, ["INVALID_REQUEST": 1])
        XCTAssertTrue(rig2.log.lines.contains { $0.contains("hki.adapterBug code=INVALID_REQUEST") })
    }

    func testHostUnavailableKeepsTheSameDeliveryForTheNextTrigger() async {
        let sink = ScriptedSink(); let rig = Rig(sink: sink)
        sink.answers = [{ _ in .hostUnavailable }]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        let st = await ing.status(); XCTAssertEqual(st.waitingReason, HostCode.hostUnavailable)
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 2); XCTAssertEqual(sink.deliveries[0].deliveryId, sink.deliveries[1].deliveryId)
    }

    func testRefusedItemSetAsideAndUnlinkedResend() async {
        let sink = ScriptedSink(context: .ready(Self.plan)); let rig = Rig(sink: sink)
        sink.answers = [{ _ in .refused(code: "BEFORE_RECORD_START", index: 0, disposition: .setAsideItem) },
                        { _ in .refused(code: "UNKNOWN_SESSION", index: 0, disposition: .resendUnlinked) }]
        rig.reader.add(workout("OLD", end: at("2026-11-15", "07:45")), workout("A", end: at("2026-11-17", "07:45")), workout("B", end: at("2026-11-18", "07:45")))
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(sink.deliveries.map { $0.activities.map(\.activityId) }, [["OLD", "A", "B"], ["A", "B"], ["A", "B"]])
        XCTAssertEqual(sink.deliveries[1].activities[0].sessionId, "w0-run-d1")
        XCTAssertNil(sink.deliveries[2].activities[0].sessionId, "re-sent unlinked")
        XCTAssertEqual(Set(sink.deliveries.map(\.deliveryId)).count, 3)
        let c = await ing.counts(); XCTAssertEqual(c.setAside, ["BEFORE_RECORD_START": 1]); XCTAssertEqual(c.delivered, 2)
    }

    func testBackfillChunksOf32InEndOrder() async {
        let sink = ScriptedSink(); let rig = Rig(sink: sink)
        for i in (0..<100).reversed() { rig.reader.add(workout(String(format: "W%03d", i), end: t0.addingTimeInterval(Double(i) * 3600))) }
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(sink.deliveries.map(\.activities.count), [32, 32, 32, 4])
        XCTAssertEqual(sink.deliveries.flatMap(\.activities).map(\.activityId), (0..<100).map { String(format: "W%03d", $0) })
    }

    // MARK: recovery, deletions, purge, enable (items 5, 6)

    func testDeathBeforeTheEnqueueRereadsTheSample() async throws {
        let sink = ScriptedSink(context: .ready(Self.plan)); let store = MemoryStore(); let rig = Rig(sink: sink, store: store)
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        store.failSaves = 1
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(rig.reader.reads, 1); XCTAssertEqual(sink.deliveries.count, 0, "nothing enqueued, nothing sent")
        let disk = try JSONDecoder().decode(QueueState.self, from: XCTUnwrap(store.data))
        XCTAssertNil(disk.anchor, "the anchor did not advance"); XCTAssertTrue(disk.items.isEmpty)
        let again = rig.make(); await again.start()
        XCTAssertEqual(sink.deliveries.flatMap(\.activities).map(\.activityId), ["A"], "re-read and delivered once")
    }

    func testDeletionBeforeAndAfterDelivery() async {
        let sink = ScriptedSink(); let rig = Rig(sink: sink)
        sink.answers = [ScriptedSink.recordAll, { _ in .waiting(code: "SCREEN_REQUIRED") }]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        rig.reader.add(workout("B", end: at("2026-11-18", "07:45"))); await rig.reader.fire()
        rig.reader.delete("B"); rig.reader.delete("A"); await rig.reader.fire()
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 2, "neither the deleted queued workout nor a deletion is ever sent")
        let c = await ing.counts()
        XCTAssertEqual(c.counters, ["DELETED_AFTER_DELIVERY": 1, "DELETED_BEFORE_DELIVERY": 1]); XCTAssertEqual(c.pending, 0); XCTAssertEqual(c.delivered, 1)
    }

    func testPurgeForEveryReasonErasesEverything() async throws {
        for reason in QueuePurgeReason.allCases {
            let sink = ScriptedSink(); let store = MemoryStore(); let rig = Rig(sink: sink, store: store)
            sink.answers = [ScriptedSink.recordAll, { _ in .refused(code: "BEFORE_RECORD_START", index: 0, disposition: .setAsideItem) }, { _ in .waiting(code: "SCREEN_REQUIRED") }]
            rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
            let ing = rig.make(); await ing.start()
            rig.reader.add(workout("B", end: at("2026-11-18", "07:45"))); await rig.reader.fire()
            rig.reader.add(workout("C", end: at("2026-11-19", "07:45")), workout("S", end: at("2026-11-19", "18:00"), type: WorkoutKind.traditionalStrengthTraining))
            await rig.reader.fire()
            let before = await ing.counts(); XCTAssertEqual(before.delivered, 1); XCTAssertEqual(before.setAside.count, 1); XCTAssertEqual(before.pending, 1)
            try await ing.purge(reason)
            let after = await ing.counts()
            XCTAssertEqual(after, IngestCounts(pending: 0, notRecorded: 0, held: 0, inFlight: 0, setAside: [:], delivered: 0, excluded: [:], counters: [:]), "\(reason)")
            let summaries = await ing.importedNonRunWorkouts(since: .distantPast); XCTAssertTrue(summaries.isEmpty)
            let disk = try JSONDecoder().decode(QueueState.self, from: XCTUnwrap(store.data))
            XCTAssertNil(disk.anchor); XCTAssertTrue(disk.items.isEmpty && disk.ledger.isEmpty && disk.summaries.isEmpty && disk.excluded.isEmpty)
            XCTAssertEqual(disk.generation, 1)
            XCTAssertTrue(rig.log.lines.contains("hki.purged code=\(reason.rawValue)"))
        }
    }

    func testPurgeDuringADeliveryInFlightDiscardsItsAnswer() async throws {
        let sink = ScriptedSink(); let store = MemoryStore(); let rig = Rig(sink: sink, store: store)
        sink.holdNext = true
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make()
        let started = Task { await ing.start() }
        while !sink.isHolding { try await Task.sleep(nanoseconds: 1_000_000) }
        try await ing.purge(.accountErased)
        sink.release()
        await started.value
        let c = await ing.counts()
        XCTAssertEqual(c.delivered, 0, "the answer of a delivery started before the purge is never written back (G07)")
        XCTAssertEqual(c.pending + c.inFlight, 0)
        XCTAssertTrue(rig.log.lines.contains { $0.hasPrefix("hki.deliveryDiscardedAfterPurge") })
        let disk = try JSONDecoder().decode(QueueState.self, from: XCTUnwrap(store.data)); XCTAssertTrue(disk.ledger.isEmpty && disk.items.isEmpty)
    }

    func testSetEnabledFalseStopsObservingAndSending() async throws {
        let sink = ScriptedSink(); let rig = Rig(sink: sink)
        let ing = rig.make(); await ing.start()
        XCTAssertTrue(rig.reader.observing); XCTAssertTrue(rig.reader.backgroundDelivery)
        try await ing.setEnabled(false)
        XCTAssertFalse(rig.reader.observing); XCTAssertFalse(rig.reader.backgroundDelivery)
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        await ing.readNow(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 0)
        let st = await ing.status(); XCTAssertTrue(st.disabledInApp)
        try await ing.setEnabled(true)
        XCTAssertEqual(sink.deliveries.count, 1); let st2 = await ing.status(); XCTAssertFalse(st2.disabledInApp)
    }

    // MARK: protected data (item 12)

    func testLockedQueueFileWaitsAndNeverOverwrites() async throws {
        let sink = ScriptedSink(); let store = MemoryStore(); let rig = Rig(sink: sink, store: store)
        sink.answers = [{ _ in .waiting(code: "SCREEN_REQUIRED") }]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let first = rig.make(); await first.start()
        let bytes = store.data
        store.locked = true
        let ing = rig.make(); await ing.start(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 1); XCTAssertEqual(store.data, bytes, "nothing read or written before the first unlock")
        let st = await ing.status(); XCTAssertEqual(st.waitingReason, IngestCode.protectedDataUnavailable)
        store.locked = false
        await ing.protectedDataDidBecomeAvailable()
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 2); let c = await ing.counts(); XCTAssertEqual(c.delivered, 1)
    }

    func testHealthKitLockedWaitsForProtectedData() async {
        let sink = ScriptedSink(); let rig = Rig(sink: sink)
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        rig.reader.failNextRead = .protectedDataUnavailable
        let ing = rig.make(); await ing.start()
        let st = await ing.status(); XCTAssertEqual(st.lastReadError, IngestCode.protectedDataUnavailable); XCTAssertEqual(sink.deliveries.count, 0)
        await ing.protectedDataDidBecomeAvailable()
        XCTAssertEqual(sink.deliveries.count, 1); let st2 = await ing.status(); XCTAssertNil(st2.lastReadError)
    }

    func testFileStoreIsAtomicAndSurvivesARestart() async throws {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("hki-store-\(UUID().uuidString)")
        defer { try? FileManager.default.removeItem(at: dir) }
        let sink = ScriptedSink(); sink.answers = [{ _ in .waiting(code: "SCREEN_REQUIRED") }]
        let rig = Rig(sink: sink, store: FileQueueStore(directory: dir))
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(try FileManager.default.contentsOfDirectory(atPath: dir.path), ["queue.json"], "no temporary file left")
        let rig2 = Rig(sink: sink, store: FileQueueStore(directory: dir)); let again = rig2.make(reader: rig.reader)
        await again.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 2); XCTAssertEqual(sink.deliveries[1].activities, sink.deliveries[0].activities)
        let c = await again.counts(); XCTAssertEqual(c.delivered, 1)
    }
}
