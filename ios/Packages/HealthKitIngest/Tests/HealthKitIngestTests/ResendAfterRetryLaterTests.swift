import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// #85: a workout set aside after its delivery exhausted `retryLater` is sent again, with its frozen bytes in a NEW delivery, once its
/// round is due after `deliveryConditionsChanged()` or at launch; bounded rounds with a doubling wait. Its copies stay consolidated into it
/// until an answer settles it. Synthetic workouts only (`Copies`: G1 is the run, S1 its copy from another app).
final class ResendAfterRetryLaterTests: XCTestCase {
    static let failure: (DeviceDelivery) -> DeliveryResult = { _ in .retryLater(code: "PERSISTENCE_FAILURE") }
    static let refusal: (DeviceDelivery) -> DeliveryResult = { _ in .refused(code: "BUSY", index: nil, disposition: .retryLater) }

    func sent(_ sink: ScriptedSink) -> [String] { sink.deliveries.flatMap(\.activities).map(\.activityId) }
    func stored(_ rig: Rig, _ id: String) throws -> QueueItem? {
        try JSONDecoder().decode(QueueState.self, from: XCTUnwrap((rig.store as? MemoryStore)?.data)).items.first { $0.activityId == id }
    }

    /// G1 and S1 are read; the first `streak.count` sends of G1 get those answers (3 by default, the limit), so G1 is set aside
    /// ATTEMPTS_EXHAUSTED at t0 + 800 s and its first round is due at t0 + 1700 s (default policy: 900 s).
    func exhausted(_ streak: [(DeviceDelivery) -> DeliveryResult] = [failure, failure, failure], then: [(DeviceDelivery) -> DeliveryResult] = [],
                   configure: (inout HealthKitIngestor.Configuration) -> Void = { _ in }) async -> (Rig, ScriptedSink, HealthKitIngestor) {
        let sink = ScriptedSink(context: .ready(Copies.plan)); var rig = Rig(sink: sink)
        rig.config.maxConsecutiveRetryLater = streak.count; configure(&rig.config)
        sink.answers = streak + then
        rig.reader.add(Copies.g1, Copies.s1)
        let ing = rig.make(); await ing.start()
        for _ in 1..<streak.count { rig.clock.advance(400); await rig.scheduler.runAll() }
        return (rig, sink, ing)
    }

    func testAnExhaustedRunIsSentAgainWithItsFrozenBytesInANewDelivery() async throws {
        let (rig, sink, ing) = await exhausted()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1"]); let c0 = await ing.counts(); XCTAssertEqual(c0.setAside, [IngestCode.attemptsExhausted: 1])
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 3, "the signal arms the round; it is not due yet")
        XCTAssertEqual(rig.scheduler.delays, [900])
        rig.clock.advance(900); await rig.scheduler.runAll()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1", "G1"], "S1 is never sent")
        let resent = sink.deliveries[3]
        XCTAssertNotEqual(resent.deliveryId, sink.deliveries[0].deliveryId, "a NEW delivery")
        XCTAssertEqual(resent.activities, sink.deliveries[0].activities, "the same frozen bytes: same activityId, link and facts")
        XCTAssertEqual(resent.activities.first?.sessionId, "w0-run-d1")
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.setAside, [:]); XCTAssertEqual(c.consolidated, 1)
        let runs = await ing.importedRuns(since: .distantPast)
        XCTAssertEqual(runs.first { $0.id == "G1" }?.status, .counted); XCTAssertEqual(runs.first { $0.id == "S1" }?.sameRunAs, "G1")
        XCTAssertTrue(rig.log.lines.contains("hki.resendReopened reopened=1"))
    }

    func testASignalOnceTheRoundIsDueSendsItAtOnce() async {
        let (rig, sink, ing) = await exhausted()
        rig.clock.advance(900); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1", "G1"])
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1)
    }

    func testALaunchSendsARoundThatCameDueWhileTheAppWasNotRunning() async {
        let (rig, sink, _) = await exhausted()
        rig.clock.advance(3600)
        let relaunched = rig.make(); await relaunched.start()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1", "G1"])
        let c = await relaunched.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.consolidated, 1)
    }

    /// Nothing is re-sent without a signal or a launch: the bare passage of time (other triggers included) never reopens it.
    func testNoRoundIsSentWithoutASignalOrALaunch() async {
        let (rig, sink, ing) = await exhausted()
        rig.clock.advance(86_400); await ing.readNow(); await rig.reader.fire(); await ing.settled(); await rig.scheduler.runAll()
        XCTAssertEqual(sink.deliveries.count, 3)
    }

    /// A fault that never clears: `maxRounds` rounds, each a new delivery that exhausts retryLater again, each waiting twice as long
    /// (capped); then the workout stays set aside for good, still holding its group.
    func testTheRoundsAreBoundedAndTheirWaitDoubles() async throws {
        let (rig, sink, ing) = await exhausted([Self.failure, Self.failure], then: (0..<20).map { _ in Self.failure }) {
            $0.resend.maxRounds = 3; $0.resend.base = 100; $0.resend.cap = 250
        }
        var waits: [TimeInterval] = []
        for _ in 0..<5 {
            await ing.deliveryConditionsChanged()
            waits += rig.scheduler.delays
            rig.clock.advance(250); await rig.scheduler.runAll()
            rig.clock.advance(10); await rig.scheduler.runAll()
        }
        XCTAssertEqual(waits, [100, 200, 250], "doubling, capped; nothing after the last round")
        XCTAssertEqual(sent(sink).count, 2 + 3 * 2, "the first delivery and three rounds, two sends each")
        let relaunched = rig.make(); rig.clock.advance(86_400); await relaunched.start(); await relaunched.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink).count, 8, "never again")
        XCTAssertEqual(Set(sent(sink)), ["G1"], "S1 is never sent")
        let g1 = try stored(rig, "G1"); XCTAssertEqual(g1?.resends, 3); XCTAssertNil(g1?.resendDue); XCTAssertEqual(g1?.mayBeOnRecord, true)
        let c = await relaunched.counts(); XCTAssertEqual(c.setAside, [IngestCode.attemptsExhausted: 1]); XCTAssertEqual(c.consolidated, 1)
    }

    /// A refusal-only streak recorded nothing (G1 is not may-be-on-record), but G1 still holds its group while a round is to come: S1 waits
    /// for that answer, and G1 recorded on the re-send makes S1 its copy. One count.
    func testTheCopyWaitsForTheAnswerToTheRoundEvenWhenNothingLanded() async throws {
        let (rig, sink, ing) = await exhausted([Self.refusal, Self.refusal, Self.refusal])
        XCTAssertEqual(try stored(rig, "G1")?.mayBeOnRecord, false)
        let c0 = await ing.counts(); XCTAssertEqual(c0.consolidated, 1)
        await ing.deliveryConditionsChanged(); rig.clock.advance(900); await rig.scheduler.runAll()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1", "G1"])
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.consolidated, 1)
    }

    /// With no round left, a refusal-only streak releases the group (nothing of G1 is on record): S1 is the run, counted once.
    func testWithNoRoundLeftARefusalOnlyStreakLetsTheCopyBeTheRun() async {
        let (_, sink, ing) = await exhausted([Self.refusal, Self.refusal, Self.refusal]) { $0.resend.maxRounds = 0 }
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1", "S1"])
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.setAside, [IngestCode.attemptsExhausted: 1]); XCTAssertEqual(c.consolidated, 0)
    }

    /// The re-send answered NOT_RECORDED proves G1 absent (on record it would be DUPLICATE). With its attempts used up, it is set aside
    /// certainly-not-on-record and S1 may be the run.
    func testAnAnsweredNotRecordedOfTheRoundProvesItAbsent() async throws {
        let (rig, sink, ing) = await exhausted(then: [ScriptedSink.each(.notRecorded(reason: "NOT_RECORDED_BY_THIS_DECISION"))]) { $0.maxAttempts = 0 }
        await ing.deliveryConditionsChanged(); rig.clock.advance(900); await rig.scheduler.runAll()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1", "G1", "S1"])
        let g1 = try stored(rig, "G1"); XCTAssertEqual(g1?.mayBeOnRecord, false); XCTAssertNil(g1?.resendDue)
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.consolidated, 0)
    }

    /// A refusal of the re-send records nothing NOW, but proves nothing about the earlier send that may have landed: G1 stays
    /// may-be-on-record and holds its group; the refusal ends the rounds.
    func testARefusalOfTheRoundNeverReleasesTheCopy() async throws {
        let (rig, sink, ing) = await exhausted(then: [{ _ in .refused(code: "BEFORE_RECORD_START", index: 0, disposition: .setAsideItem) }])
        await ing.deliveryConditionsChanged(); rig.clock.advance(900); await rig.scheduler.runAll()
        rig.clock.advance(86_400); await ing.deliveryConditionsChanged(); await rig.scheduler.runAll()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1", "G1"])
        XCTAssertEqual(try stored(rig, "G1")?.mayBeOnRecord, true)
        let c = await ing.counts(); XCTAssertEqual(c.setAside, ["BEFORE_RECORD_START": 1]); XCTAssertEqual(c.consolidated, 1)
    }

    /// A workout deleted in Apple Health is never sent again (G-5): neither while its round is to come, nor once reopened and not yet sent.
    func testADeletedRunIsNeverSentAgain() async throws {
        let (rig, sink, ing) = await exhausted()
        rig.reader.delete("G1"); await ing.readNow()
        await ing.deliveryConditionsChanged(); rig.clock.advance(900); await rig.scheduler.runAll(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 3)
        let c = await ing.counts(); XCTAssertEqual(c.counters[IngestCode.deletedMaybeOnRecord], 1); XCTAssertEqual(c.consolidated, 1)

        let (rig2, sink2, ing2) = await exhausted()
        sink2.context = .unavailable(code: "NOT_ENROLLED")
        rig2.clock.advance(900); await ing2.deliveryConditionsChanged()
        XCTAssertEqual(try stored(rig2, "G1")?.state, .pending, "reopened, not sent: no context")
        rig2.reader.delete("G1"); sink2.context = .ready(Copies.plan); await ing2.readNow(); await ing2.deliveryConditionsChanged()
        XCTAssertEqual(sink2.deliveries.count, 3)
        let g1 = try stored(rig2, "G1"); XCTAssertEqual(g1?.state, .setAside(code: IngestCode.attemptsExhausted)); XCTAssertNil(g1?.resendDue)
        let c2 = await ing2.counts(); XCTAssertEqual(c2.counters[IngestCode.deletedMaybeOnRecord], 1); XCTAssertEqual(c2.consolidated, 1)
    }

    /// A clock that went back leaves the due instant further away than the longest wait: the round is due now (still bounded).
    func testAClockThatWentBackNeverStrandsTheRound() async {
        let (rig, sink, ing) = await exhausted()
        rig.clock.advance(-3 * 86_400); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sink.deliveries.count, 4)
    }

    /// A queue file written before #85 has no `resends`: a may-be-on-record ATTEMPTS_EXHAUSTED run gets its rounds, the first due at once.
    func testAFileWrittenBeforeThisFixGetsItsRounds() async throws {
        let (rig0, sink, _) = await exhausted { $0.resend.maxRounds = 0 }
        let store = try XCTUnwrap(rig0.store as? MemoryStore)
        var o = try JSONSerialization.jsonObject(with: XCTUnwrap(store.data)) as! [String: Any]
        o["items"] = (o["items"] as! [[String: Any]]).map { var i = $0; i.removeValue(forKey: "resends"); i.removeValue(forKey: "resendDue"); return i }
        try store.save(JSONSerialization.data(withJSONObject: o))
        let decoded = try JSONDecoder().decode(QueueState.self, from: XCTUnwrap(store.data))
        XCTAssertEqual(decoded.items.first { $0.activityId == "G1" }?.resendDue, .distantPast)
        XCTAssertNil(decoded.items.first { $0.activityId == "S1" }?.resendDue)
        var rig = Rig(sink: sink, store: store); rig.config.maxConsecutiveRetryLater = 3
        let relaunched = rig.make(); await relaunched.start()
        XCTAssertEqual(sent(sink), ["G1", "G1", "G1", "G1"])
        let c = await relaunched.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.consolidated, 1)
    }
}
