import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// #48 P3-2: a copy of a run is promoted (sent with its own activityId) only after an answer that proves the run it was consolidated into
/// is not on the record. A set-aside that does not prove it (`retryLater` exhausted; ACTIVITY_LINKED_ELSEWHERE) stays the run of its group.
final class MayBeOnRecordTests: XCTestCase {
    func sent(_ sink: ScriptedSink) -> [String] { sink.deliveries.flatMap(\.activities).map(\.activityId) }

    /// G1 is chosen; three consecutive retryLater set it aside ATTEMPTS_EXHAUSTED. A write may have landed: S1 is never sent.
    func exhaustedByRetryLater() async -> (Rig, ScriptedSink, HealthKitIngestor) {
        let sink = ScriptedSink(context: .ready(Copies.plan)); var rig = Rig(sink: sink); rig.config.maxConsecutiveRetryLater = 3
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
}
