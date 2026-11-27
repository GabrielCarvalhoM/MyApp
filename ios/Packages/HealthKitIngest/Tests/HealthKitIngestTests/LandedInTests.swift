import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// #85, QRE recheck of PR #90. `QueueItem.landedIn`: which deliveries may have put a workout on the record. P3-A: a result missing from
/// an `ok:true` answer may have been recorded. P3-B: an admission refusal of the SAME delivery id proves it never landed (custody replays
/// a request id it has seen); another delivery's refusal, or a retryable/waiting one, proves nothing. Synthetic workouts only (`Copies`).
final class LandedInTests: XCTestCase {
    typealias Answer = (DeviceDelivery) -> DeliveryResult
    static let lost: Answer = { _ in .retryLater(code: "OPERATIONAL_ERROR") }
    static let invalid: Answer = { _ in .refused(code: "INVALID_OBSERVATION", index: 0, disposition: .setAsideItem) }

    func sent(_ sink: ScriptedSink) -> [String] { sink.deliveries.flatMap(\.activities).map(\.activityId) }
    func stored(_ store: QueueStore, _ id: String) throws -> QueueItem? {
        try JSONDecoder().decode(QueueState.self, from: XCTUnwrap((store as? MemoryStore)?.data)).items.first { $0.activityId == id }
    }
    func rig(_ answers: [Answer], store: MemoryStore = MemoryStore(), configure: (inout HealthKitIngestor.Configuration) -> Void = { _ in })
        -> (Rig, ScriptedSink) {
        let sink = ScriptedSink(context: .ready(Copies.plan)); var rig = Rig(sink: sink, store: store); configure(&rig.config)
        sink.answers = answers; rig.reader.add(Copies.g1, Copies.s1)
        return (rig, sink)
    }

    // MARK: P3-A

    /// `ok:true` without G1's result (none, or one naming another workout): the request was committed, G1 may be on record. With its
    /// attempts used up it is set aside may-be-on-record and S1 is never sent.
    func testAResultMissingFromAnOkAnswerMayHaveLanded() async throws {
        let none: Answer = { _ in .answered(version: 2, activities: []) }
        let other: Answer = { _ in .answered(version: 2, activities: [ActivityResult(index: 0, activityId: "OTHER", outcome: .duplicate)]) }
        for answer in [none, other] {
            let (rig, sink) = rig([answer]) { $0.maxAttempts = 0 }
            let ing = rig.make(); await ing.start(); await ing.deliveryConditionsChanged()
            XCTAssertEqual(sent(sink), ["G1"], "S1 is never sent")
            let g1 = try stored(rig.store, "G1")
            XCTAssertEqual(g1?.state, .setAside(code: IngestCode.attemptsExhausted)); XCTAssertEqual(g1?.mayBeOnRecord, true)
            XCTAssertEqual(g1?.landedIn, [QueueItem.landedUnknown])
            let c = await ing.counts(); XCTAssertEqual(c.consolidated, 1)
        }
    }

    /// The same missing result with attempts left: G1 waits NOT_RECORDED, still possibly landed. Deleted in Apple Health then, it is kept
    /// set aside (never re-sent, G-5), counted once; S1 is never sent. A later admission refusal can never clear an unknown landing.
    func testAResultMissingKeepsADeletedRunThatWaitsForItsResend() async throws {
        let (rig, sink) = rig([{ _ in .answered(version: 2, activities: []) }])
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(try stored(rig.store, "G1")?.state, .notRecorded(reason: "RESULT_MISSING"))
        rig.reader.delete("G1"); await ing.readNow(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), ["G1"])
        let g1 = try stored(rig.store, "G1"); XCTAssertEqual(g1?.state, .setAside(code: IngestCode.attemptsExhausted)); XCTAssertEqual(g1?.mayBeOnRecord, true)
        let c = await ing.counts()
        XCTAssertEqual(c.counters[IngestCode.deletedMaybeOnRecord], 1); XCTAssertNil(c.counters[IngestCode.deletedBeforeDelivery]); XCTAssertEqual(c.consolidated, 1)
    }

    /// Deleted in Apple Health while in flight, and the `ok:true` answer misses its result: kept set aside, counted once, S1 never sent.
    func testAResultMissingForARunDeletedInFlightKeepsIt() async throws {
        let (rig, sink) = rig([{ _ in .answered(version: 2, activities: []) }])
        sink.holdNext = true
        let ing = rig.make()
        let launch = Task { await ing.start() }
        try await eventually("the send held") { sink.isHolding }
        rig.reader.delete("G1"); await ing.readNow()
        sink.release(); await launch.value
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), ["G1"])
        let c = await ing.counts()
        XCTAssertEqual(c.counters[IngestCode.deletedMaybeOnRecord], 1); XCTAssertNil(c.counters[IngestCode.deletedBeforeDelivery]); XCTAssertEqual(c.consolidated, 1)
    }

    // MARK: P3-B

    /// retryLater, then the retry under the SAME delivery id is refused INVALID_OBSERVATION: that request never landed, so G1 is not on the
    /// record and the valid copy S1 is the run (one count).
    func testARefusalOfTheSameDeliveryProvesItNeverLanded() async throws {
        let (rig, sink) = rig([Self.lost, Self.invalid])
        let ing = rig.make(); await ing.start()
        rig.clock.advance(2); await rig.scheduler.runAll()
        XCTAssertEqual(sent(sink), ["G1", "G1", "S1"]); XCTAssertEqual(Set(sink.deliveries.prefix(2).map(\.deliveryId)).count, 1)
        let g1 = try stored(rig.store, "G1"); XCTAssertEqual(g1?.mayBeOnRecord, false); XCTAssertEqual(g1?.landedIn, [])
        let c = await ing.counts(); XCTAssertEqual(c.setAside, ["INVALID_OBSERVATION": 1]); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.consolidated, 0)
    }

    /// retryLater on D1, then waiting (D1 is dropped), then the new delivery D2 refused: D2's refusal proves nothing about D1. G1 keeps its
    /// group; S1 is never sent.
    func testARefusalOfAnotherDeliveryNeverClearsIt() async throws {
        let (rig, sink) = rig([Self.lost, { _ in .waiting(code: "CONSENT_REQUIRED") }, Self.invalid])
        let ing = rig.make(); await ing.start()
        rig.clock.advance(2); await rig.scheduler.runAll(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1"]); XCTAssertEqual(Set(sink.deliveries.map(\.deliveryId)).count, 2)
        let g1 = try stored(rig.store, "G1"); XCTAssertEqual(g1?.mayBeOnRecord, true); XCTAssertEqual(g1?.landedIn, [sink.deliveries[0].deliveryId])
        await ing.deliveryConditionsChanged()
        let c = await ing.counts(); XCTAssertEqual(c.setAside, ["INVALID_OBSERVATION": 1]); XCTAssertEqual(c.consolidated, 1)
    }

    /// A refusal of the same id that is not an admission refusal (a waiting disposition: e.g. A's own CLOCK_AHEAD_OF_REFERENCE, answered
    /// before custody) proves nothing: D1 stays possibly landed through the next delivery's refusal.
    func testAWaitingRefusalOfTheSameDeliveryNeverClearsIt() async throws {
        let ahead: Answer = { _ in .refused(code: HostCode.clockAheadOfReference, index: nil, disposition: .waiting) }
        let (rig, sink) = rig([Self.lost, ahead, Self.invalid])
        let ing = rig.make(); await ing.start()
        rig.clock.advance(2); await rig.scheduler.runAll(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1"])
        XCTAssertEqual(try stored(rig.store, "G1")?.mayBeOnRecord, true)
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 1)
    }

    /// The delivery read back from disk after the process died is possibly landed in THAT delivery: its retry under the same id refused at
    /// admission proves it never landed.
    func testARelaunchedDeliveryRefusedUnderItsOwnIdNeverLanded() async throws {
        let (rig, sink) = rig([Self.invalid, Self.invalid])
        let dying = rig.make(); await dying.setDying(); await dying.start()
        let again = Rig(sink: sink, store: rig.store)
        let ing = again.make(); await ing.start()
        XCTAssertEqual(sent(sink), ["G1", "G1", "S1"]); XCTAssertEqual(Set(sink.deliveries.prefix(2).map(\.deliveryId)).count, 1)
        XCTAssertEqual(try stored(rig.store, "G1")?.mayBeOnRecord, false)
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1)
        withExtendedLifetime(again) {}
    }

    /// A file written without `landedIn`: a sent workout landed in an unknown delivery, which no refusal clears.
    func testAFileWithoutLandedInFailsClosedAndNoRefusalClearsIt() async throws {
        let store = MemoryStore()
        let (rig, sink) = rig([{ _ in .waiting(code: "CONSENT_REQUIRED") }, Self.invalid], store: store)
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(try stored(store, "G1")?.landedIn, [], "a waiting answer records nothing")
        var o = try JSONSerialization.jsonObject(with: XCTUnwrap(store.data)) as! [String: Any]
        o["items"] = (o["items"] as! [[String: Any]]).map { var i = $0; i.removeValue(forKey: "landedIn"); return i }
        try store.save(JSONSerialization.data(withJSONObject: o))
        XCTAssertEqual(try stored(store, "G1")?.landedIn, [QueueItem.landedUnknown]); XCTAssertEqual(try stored(store, "S1")?.landedIn, [])
        _ = ing
        let again = Rig(sink: sink, store: store)
        let relaunched = again.make(); await relaunched.start(); await relaunched.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), ["G1", "G1"], "S1 is never sent")
        XCTAssertEqual(try stored(store, "G1")?.mayBeOnRecord, true)
        withExtendedLifetime(again) {}
    }

    // MARK: #48's guarantees around a re-sent workout

    /// A re-sent workout (already may-be-on-record) deleted while its round is in flight, then answered waiting: set aside, counted once,
    /// never sent again (G-5); S1 never sent.
    func testAReSentRunDeletedInFlightIsNeverSentAgain() async throws {
        let (rig, sink) = rig([Self.lost, Self.lost, Self.lost, { _ in .waiting(code: "CONSENT_REQUIRED") }]) { $0.maxConsecutiveRetryLater = 3 }
        let ing = rig.make(); await ing.start()
        for _ in 0..<2 { rig.clock.advance(400); await rig.scheduler.runAll() }
        sink.holdNext = true
        rig.clock.advance(900)
        let round = Task { await rig.scheduler.runAll() }
        try await eventually("the round held") { sink.isHolding }
        rig.reader.delete("G1"); await ing.readNow()
        sink.release(); await round.value
        await ing.deliveryConditionsChanged(); rig.clock.advance(86_400); await rig.scheduler.runAll(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1", "G1"])
        let g1 = try stored(rig.store, "G1"); XCTAssertEqual(g1?.state, .setAside(code: IngestCode.attemptsExhausted)); XCTAssertNil(g1?.resendDue)
        let c = await ing.counts()
        XCTAssertEqual(c.counters[IngestCode.deletedMaybeOnRecord], 1); XCTAssertNil(c.counters[IngestCode.deletedBeforeDelivery]); XCTAssertEqual(c.consolidated, 1)
    }
}
