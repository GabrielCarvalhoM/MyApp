import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// #48 P3-2: a copy of a run is promoted (sent with its own activityId) only after an answer that proves the run it was consolidated into
/// is not on the record. A set-aside that does not prove it (`retryLater` exhausted; ACTIVITY_LINKED_ELSEWHERE) stays the run of its group.
final class MayBeOnRecordTests: XCTestCase {
    func sent(_ sink: ScriptedSink) -> [String] { sink.deliveries.flatMap(\.activities).map(\.activityId) }

    /// G1 is chosen; three consecutive retryLater set it aside ATTEMPTS_EXHAUSTED. A write may have landed: S1 is never sent. #85: with
    /// its re-send rounds used up (`maxRounds = 0`), #48's rule alone (the rounds themselves: ResendAfterRetryLaterTests).
    func exhaustedByRetryLater() async -> (Rig, ScriptedSink, HealthKitIngestor) {
        let sink = ScriptedSink(context: .ready(Copies.plan)); var rig = Rig(sink: sink); rig.config.maxConsecutiveRetryLater = 3
        rig.config.resend.maxRounds = 0
        sink.answers = (0..<3).map { _ in { _ in .retryLater(code: "PERSISTENCE_FAILURE") } }
        rig.reader.add(Copies.g1, Copies.s1)
        let ing = rig.make(); await ing.start()
        for _ in 0..<4 { rig.clock.advance(400); await rig.scheduler.runAll() }
        return (rig, sink, ing)
    }

    func testACopyIsNeverPromotedAfterRetryLaterIsExhausted() async {
        let (rig, sink, ing) = await exhaustedByRetryLater()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1"]); XCTAssertEqual(Set(sink.deliveries.map(\.deliveryId)).count, 1, "the same delivery, retried")
        await ing.deliveryConditionsChanged(); await ing.readNow(); rig.clock.advance(400); await rig.scheduler.runAll()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1"], "S1 is never sent: G1 may already count this run")
        let c = await ing.counts(); XCTAssertEqual(c.setAside, [IngestCode.attemptsExhausted: 1]); XCTAssertEqual(c.consolidated, 1)
        let runs = await ing.importedRuns(since: .distantPast)
        XCTAssertEqual(runs.first { $0.id == "S1" }?.status, .consolidatedDuplicate); XCTAssertEqual(runs.first { $0.id == "S1" }?.sameRunAs, "G1")
        XCTAssertEqual(runs.first { $0.id == "G1" }?.status, .setAside); XCTAssertEqual(runs.first { $0.id == "G1" }?.statusCode, IngestCode.attemptsExhausted)
    }

    /// The same limit reached by NOT_RECORDED answers: each answer proves G1 is not on the record, so S1 may be the run (one count).
    func testACopyIsPromotedOnlyAfterAnAnswerProvingNothingWasRecorded() async {
        let sink = ScriptedSink(context: .ready(Copies.plan)); var rig = Rig(sink: sink); rig.config.maxAttempts = 2
        sink.answers = (0..<3).map { _ in ScriptedSink.each(.notRecorded(reason: "NOT_RECORDED_BY_THIS_DECISION")) }
        rig.reader.add(Copies.g1, Copies.s1)
        let ing = rig.make(); await ing.start()
        await ing.deliveryConditionsChanged(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1", "S1"])
        let c = await ing.counts(); XCTAssertEqual(c.setAside, [IngestCode.attemptsExhausted: 1]); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.consolidated, 0)
    }

    /// Deleting the set-aside run in Apple Health does not prove it absent from the record either: it stays, S1 is still never sent.
    func testDeletingARunThatMayBeOnRecordNeverPromotesItsCopy() async {
        let (rig, sink, ing) = await exhaustedByRetryLater()
        rig.reader.delete("G1"); await ing.readNow()
        await rig.reader.fire(); await ing.settled(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1"])
        let c = await ing.counts()
        XCTAssertEqual(c.counters[IngestCode.deletedMaybeOnRecord], 1, "counted once"); XCTAssertNil(c.counters[IngestCode.deletedBeforeDelivery])
        XCTAssertEqual(c.consolidated, 1); XCTAssertEqual(c.setAside, [IngestCode.attemptsExhausted: 1])
    }

    /// A queue file written before this fix has no `mayBeOnRecord`: an ATTEMPTS_EXHAUSTED run that was sent is read as possibly on record.
    func testAFileWrittenBeforeTheFixFailsClosed() async throws {
        let (rig, sink, _) = await exhaustedByRetryLater()
        let store = try XCTUnwrap(rig.store as? MemoryStore)
        var o = try JSONSerialization.jsonObject(with: XCTUnwrap(store.data)) as! [String: Any]
        o["items"] = (o["items"] as! [[String: Any]]).map { var i = $0; i.removeValue(forKey: "mayBeOnRecord"); return i }
        try store.save(JSONSerialization.data(withJSONObject: o))
        let decoded = try JSONDecoder().decode(QueueState.self, from: XCTUnwrap(store.data))
        XCTAssertEqual(decoded.items.first { $0.activityId == "G1" }?.mayBeOnRecord, true)
        XCTAssertEqual(decoded.items.first { $0.activityId == "S1" }?.mayBeOnRecord, false, "never sent: certainly not on record")
        let relaunched = rig.make(); await relaunched.start(); await relaunched.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1"])
        let c = await relaunched.counts(); XCTAssertEqual(c.consolidated, 1)
    }

    /// Through the real frozen boundary. HK-A is on the record linked to w0-run-d1; after a reinstall B finds HK-A, a Strava copy of it and
    /// a second run that day, so it sends HK-A unlinked and the boundary refuses it ACTIVITY_LINKED_ELSEWHERE (it IS on the record). The copy
    /// stays consolidated into it: two rows, never three.
    func testACopyOfARunAlreadyOnTheRecordIsNeverSentAfterAReinstall() async throws {
        let node = try NodeSink(athleteId: "b-mbor"); try node.set("2026-11-17", "21:00")
        let a = workout("HK-A", end: at("2026-11-17", "07:45"))
        let first = Rig(sink: node); first.reader.add(a)
        let ing = first.make(); await ing.start()
        XCTAssertEqual(node.sent.first?.activities.first?.sessionId, "w0-run-d1")
        let copy = WorkoutSnapshot(id: "SA", activityTypeRaw: WorkoutKind.running, start: a.start.addingTimeInterval(5), end: a.end,
                                   durationSeconds: a.durationSeconds - 5, distanceMeters: 4990, hasRoute: true, indoor: nil, wasUserEntered: false,
                                   sourceBundleId: Src.strava, sourceName: nil, timeZoneIdentifier: nil)
        let fresh = Rig(sink: node)
        fresh.reader.add(a, copy, workout("HK-B", end: at("2026-11-17", "19:00")))
        let again = fresh.make(); await again.start(); await again.deliveryConditionsChanged()
        let c = await again.counts()
        XCTAssertEqual(c.setAside, ["ACTIVITY_LINKED_ELSEWHERE": 1]); XCTAssertEqual(c.consolidated, 1); XCTAssertEqual(c.delivered, 1)
        XCTAssertFalse(node.sent.flatMap(\.activities).contains { $0.activityId == "SA" }, "the copy is never sent")
        XCTAssertEqual(Set(try node.deviceRows().compactMap { $0["activityId"] as? String }), ["HK-A", "HK-B"], "one row per physical run")
    }

    // MARK: QRE #84 P3-1: deleted in Apple Health while in flight

    /// Two sends of G1 answered `answer` (the first one `first`, when given); G1 is deleted in Apple Health while the second is in flight.
    func deletedDuringTheLastSend(first: ((DeviceDelivery) -> DeliveryResult)? = nil, _ answer: @escaping (DeviceDelivery) -> DeliveryResult)
        async throws -> (ScriptedSink, HealthKitIngestor, Rig) {
        let sink = ScriptedSink(context: .ready(Copies.plan)); var rig = Rig(sink: sink); rig.config.maxConsecutiveRetryLater = 2
        sink.answers = [first ?? answer, answer]
        rig.reader.add(Copies.g1, Copies.s1)
        let ing = rig.make(); await ing.start()
        sink.holdNext = true
        rig.clock.advance(400)
        let retry = Task { await rig.scheduler.runAll() }
        try await eventually("the second send held") { sink.isHolding }
        rig.reader.delete("G1"); await ing.readNow()
        sink.release(); await retry.value
        await ing.deliveryConditionsChanged(); await rig.reader.fire(); await ing.settled()
        return (sink, ing, rig)
    }

    /// #85 (the over-caution QRE noted): a streak made only of refusals with the retryLater disposition recorded NOTHING (contract), so G1
    /// is not on the record: deleted while in flight, it leaves as "deleted before delivery" and S1 is the run (one count).
    func testARefusalOnlyStreakRecordedNothingSoADeletedRunLeavesAndItsCopyIsTheRun() async throws {
        let (sink, ing, _) = try await deletedDuringTheLastSend { _ in .refused(code: "BUSY", index: nil, disposition: .retryLater) }
        XCTAssertEqual(sent(sink), ["G1", "G1", "S1"])
        let c = await ing.counts()
        XCTAssertEqual(c.counters[IngestCode.deletedBeforeDelivery], 1); XCTAssertNil(c.counters[IngestCode.deletedMaybeOnRecord])
        XCTAssertEqual(c.setAside, [:]); XCTAssertEqual(c.consolidated, 0); XCTAssertEqual(c.delivered, 1)
    }

    /// A refusal that exhausts a streak which began with a plain retryLater ("nothing was confirmed"): G1 may be on record, so it is not
    /// dropped as "deleted before delivery" and S1 is never promoted. Counted once as DELETED_MAYBE_ON_RECORD.
    func testARefusalThatExhaustsRetryLaterNeverDropsADeletedRunThatMayBeOnRecord() async throws {
        let (sink, ing, _) = try await deletedDuringTheLastSend(first: { _ in .retryLater(code: "PERSISTENCE_FAILURE") }) { _ in
            .refused(code: "BUSY", index: nil, disposition: .retryLater) }
        XCTAssertEqual(sent(sink), ["G1", "G1"], "S1 is never sent")
        let c = await ing.counts()
        XCTAssertEqual(c.counters[IngestCode.deletedMaybeOnRecord], 1); XCTAssertNil(c.counters[IngestCode.deletedBeforeDelivery])
        XCTAssertEqual(c.setAside, [IngestCode.attemptsExhausted: 1]); XCTAssertEqual(c.consolidated, 1)
    }

    /// The same with a plain retryLater: the set-aside lands on a workout already deleted while in flight, and it is counted.
    func testASetAsideOnARunDeletedInFlightIsCountedOnce() async throws {
        let (sink, ing, rig) = try await deletedDuringTheLastSend { _ in .retryLater(code: "OPERATIONAL_ERROR") }
        XCTAssertEqual(sent(sink), ["G1", "G1"])
        await ing.readNow(); rig.clock.advance(400); await rig.scheduler.runAll()
        let c = await ing.counts()
        XCTAssertEqual(c.counters[IngestCode.deletedMaybeOnRecord], 1, "once, whatever triggers follow"); XCTAssertEqual(c.consolidated, 1)
    }

    /// ACTIVITY_LINKED_ELSEWHERE on a workout deleted while in flight: kept and counted, the copy never promoted.
    func testALinkedElsewhereRefusalOfARunDeletedInFlightKeepsIt() async throws {
        let sink = ScriptedSink(context: .ready(Copies.plan)); let rig = Rig(sink: sink)
        sink.holdNext = true; sink.answers = [{ _ in .refused(code: "ACTIVITY_LINKED_ELSEWHERE", index: 0, disposition: .setAsideItem) }]
        rig.reader.add(Copies.g1, Copies.s1)
        let ing = rig.make()
        let launch = Task { await ing.start() }
        try await eventually("the send held") { sink.isHolding }
        rig.reader.delete("G1"); await ing.readNow()
        sink.release(); await launch.value
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), ["G1"])
        let c = await ing.counts()
        XCTAssertEqual(c.counters[IngestCode.deletedMaybeOnRecord], 1); XCTAssertNil(c.counters[IngestCode.deletedBeforeDelivery])
        XCTAssertEqual(c.setAside, ["ACTIVITY_LINKED_ELSEWHERE": 1]); XCTAssertEqual(c.consolidated, 1)
    }

    // MARK: QRE #84 P3-2: ACTIVITY_LINKED_ELSEWHERE whatever the disposition

    /// Without a usable index (none, or out of range) the refusal goes the adapter-bug way and sets G1 aside on the second strike. The code
    /// still says G1 is on the record: S1 is never promoted.
    func testALinkedElsewhereSetAsideByAnyPathMayBeOnRecord() async {
        for (index, disposition) in [(Int?.none, BoundaryDisposition.adapterBug), (5, .setAsideItem)] {
            let sink = ScriptedSink(context: .ready(Copies.plan)); let rig = Rig(sink: sink)
            let refusal: (DeviceDelivery) -> DeliveryResult = { _ in .refused(code: "ACTIVITY_LINKED_ELSEWHERE", index: index, disposition: disposition) }
            sink.answers = [refusal, refusal]
            rig.reader.add(Copies.g1, Copies.s1)
            let ing = rig.make(); await ing.start(); await ing.deliveryConditionsChanged()
            XCTAssertEqual(sent(sink), ["G1", "G1"], "\(disposition)")
            let c = await ing.counts(); XCTAssertEqual(c.setAside, ["ACTIVITY_LINKED_ELSEWHERE": 1]); XCTAssertEqual(c.consolidated, 1)
            let state = try? JSONDecoder().decode(QueueState.self, from: XCTUnwrap((rig.store as? MemoryStore)?.data))
            XCTAssertEqual(state?.items.first { $0.activityId == "G1" }?.mayBeOnRecord, true)
        }
    }
}
