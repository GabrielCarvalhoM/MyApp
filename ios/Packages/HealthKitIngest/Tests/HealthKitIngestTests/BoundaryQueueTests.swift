import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// Handoff original §7 items 4–5 against the REAL frozen boundary (`createIntegration` over `memoryStore`, synthetic athlete), with front
/// A's part played by NodeDouble/boundary-double.mjs. Every code below is one the frozen boundary actually answered.
/// Synthetic plan: enrolled 2026-11-14 (-03:00); RUN sessions w0-run-d1 (11-17), w0-run-d3 (11-19), w0-run-d5 (11-21), w0-run-d6 (11-22) …
final class BoundaryQueueTests: XCTestCase {
    override func setUpWithError() throws { guard node() else { throw XCTSkip("node not installed") } }

    func testRecordedAndDuplicateLeaveTheQueueAndAnIdenticalResyncMakesNoVersion() async throws {
        let node = try NodeSink(athleteId: "b-rec"); try node.set("2026-11-17", "21:00")
        let rig = Rig(sink: node)
        rig.reader.add(workout("HK-A", end: at("2026-11-17", "07:45"), minutes: 40, meters: 7060))
        let ing = rig.make(); await ing.start()
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.pending, 0)
        XCTAssertEqual(node.sent.first?.activities.first?.sessionId, "w0-run-d1")
        let v = try node.version()
        // A reinstall (fresh B: no ledger, no anchor) reads the same workout again: the boundary answers DUPLICATE, no new version.
        let fresh = Rig(sink: node); fresh.reader.add(workout("HK-A", end: at("2026-11-17", "07:45"), minutes: 40, meters: 7060))
        let again = fresh.make(); await again.start()
        XCTAssertEqual(try node.version(), v)
        let c2 = await again.counts(); XCTAssertEqual(c2.delivered, 1); XCTAssertEqual(c2.pending, 0)
        XCTAssertEqual(try node.deviceRows().count, 1)
    }

    func testAnAskOnlyChunkIsRecordedAfterTheScreenBecauseTheIdIsNew() async throws {
        let node = try NodeSink(athleteId: "b-ask")
        // 40 days on, the onboarding screen is no longer current: the engine asks (ASK), the workout is NOT_RECORDED.
        try node.set("2026-12-27", "09:00")
        let rig = Rig(sink: node)
        rig.reader.add(workout("HK-late", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        var c = await ing.counts(); XCTAssertEqual(c.notRecorded, 1)
        let firstId = node.sent[0].deliveryId
        try node.set("2026-12-27", "09:10"); try node.call("screen", ["day": "2026-12-27"])
        try node.set("2026-12-27", "09:20")
        // With the old id the custody would replay its stored answer for ever (custody `seen` → `replayed`):
        let replay = try node.call("importWithId", ["clientRequestId": firstId, "activities": try JSONSerialization.jsonObject(with: JSONEncoder().encode(node.sent[0].activities))]) as! [String: Any]
        XCTAssertEqual((replay["activities"] as? [[String: Any]])?.first?["outcome"] as? String, "NOT_RECORDED", "\(replay)")
        await ing.deliveryConditionsChanged()
        c = await ing.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.notRecorded, 0)
        XCTAssertNotEqual(node.sent.last!.deliveryId, firstId)
        XCTAssertEqual(node.sent.last!.activities, node.sent[0].activities, "the same bytes, a new delivery")
        XCTAssertEqual(try node.deviceRows().count, 1)
    }

    func testScreenRequiredWaitsUntilTheAthleteAnswers() async throws {
        let node = try NodeSink(athleteId: "b-scr")
        try node.call("eraseScreen", ["sessionId": "w0-run-d1"])
        try node.set("2026-11-19", "20:00")
        let rig = Rig(sink: node)
        rig.reader.add(workout("HK-B", end: at("2026-11-19", "07:45")))
        let ing = rig.make(); await ing.start()
        var st = await ing.status(); XCTAssertEqual(st.waitingReason, "SCREEN_REQUIRED"); XCTAssertEqual(st.queued, 1)
        await ing.readNow()
        XCTAssertEqual(node.sent.count, 1, "waiting: nothing sent until the host signals")
        try node.call("screen", ["day": "2026-11-19"])
        await ing.deliveryConditionsChanged()
        st = await ing.status(); XCTAssertNil(st.waitingReason); XCTAssertEqual(st.queued, 0)
        XCTAssertEqual(try node.deviceRows().map { $0["activityId"] as? String }, ["HK-B"])
    }

    func testBeforeRecordStartIsSetAsideAndTheRestIsResent() async throws {
        let node = try NodeSink(athleteId: "b-brs"); try node.set("2026-11-19", "21:00")
        let rig = Rig(sink: node)
        // HealthKit's predicate already keeps workouts before the enrolment day out; the boundary's refusal is the second line of defence.
        rig.reader.applyPredicate = false
        rig.reader.add(workout("HK-old", end: at("2026-11-13", "07:45")), workout("HK-1", end: at("2026-11-17", "07:45")), workout("HK-2", end: at("2026-11-19", "07:45")))
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(node.sent.map { $0.activities.map(\.activityId) }, [["HK-old", "HK-1", "HK-2"], ["HK-1", "HK-2"]])
        XCTAssertEqual(Set(node.sent.map(\.deliveryId)).count, node.sent.count)
        let c = await ing.counts(); XCTAssertEqual(c.setAside, ["BEFORE_RECORD_START": 1]); XCTAssertEqual(c.delivered, 2)
    }

    /// The context names a session the record does not have (e.g. a context read before a restart): UNKNOWN_SESSION → re-sent unlinked.
    func testUnknownSessionIsResentUnlinked() async throws {
        let node = try NodeSink(athleteId: "b-unk"); try node.set("2026-11-18", "21:00")
        let lying = ContextOverride(node) { ctx in
            IngestContext(recordStartDay: ctx.recordStartDay, timezoneOffsetMinutes: ctx.timezoneOffsetMinutes,
                          runSessions: ctx.runSessions + [PlannedRunSession(sessionId: "w9-run-x", day: "2026-11-18")], version: ctx.version)
        }
        let rig = Rig(sink: lying)
        rig.reader.add(workout("HK-U", end: at("2026-11-18", "07:45")))
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(node.sent.map { $0.activities[0].sessionId ?? "-" }, ["w9-run-x", "-"])
        XCTAssertEqual(try node.deviceRows().first?["sessionId"] as? NSNull, NSNull())
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1)
    }

    /// A workout already on record linked to a session, read again by a B that would send it unlinked: ACTIVITY_LINKED_ELSEWHERE → set aside.
    func testActivityLinkedElsewhereIsSetAside() async throws {
        let node = try NodeSink(athleteId: "b-lnk"); try node.set("2026-11-17", "21:00")
        let rig = Rig(sink: node)
        rig.reader.add(workout("HK-A", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(node.sent[0].activities[0].sessionId, "w0-run-d1")
        // Reinstall: B starts empty and finds two runs that day, so it links neither.
        let fresh = Rig(sink: node)
        fresh.reader.add(workout("HK-A", end: at("2026-11-17", "07:45")), workout("HK-B", end: at("2026-11-17", "19:00")))
        let again = fresh.make(); await again.start()
        let c = await again.counts(); XCTAssertEqual(c.setAside, ["ACTIVITY_LINKED_ELSEWHERE": 1]); XCTAssertEqual(c.delivered, 1)
        XCTAssertEqual(Set(try node.deviceRows().compactMap { $0["activityId"] as? String }), ["HK-A", "HK-B"])
    }

    /// Nine device reports on one day: the ninth is refused LIMIT_EXCEEDED (reportsPerDayPerChannel = 8) with its index → set aside.
    func testLimitExceededWithAnIndexIsSetAside() async throws {
        let node = try NodeSink(athleteId: "b-lim"); try node.set("2026-11-18", "23:00")
        let rig = Rig(sink: node)
        for i in 0..<9 { rig.reader.add(workout("HK-\(i)", end: at("2026-11-18", String(format: "%02d:30", 8 + i)), minutes: 20)) }
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(node.sent.map(\.activities.count), [9, 8])
        let c = await ing.counts(); XCTAssertEqual(c.setAside, ["LIMIT_EXCEEDED": 1]); XCTAssertEqual(c.delivered, 8)
    }

    func testBackfillOf100InChunksOfAtMost32() async throws {
        let node = try NodeSink(athleteId: "b-100")
        // After the last workout (2027-01-03), with a current screen (an old one would make the engine ASK).
        try node.set("2027-01-04", "12:00"); try node.call("screen", ["day": "2027-01-04"]); try node.set("2027-01-04", "12:30")
        let rig = Rig(sink: node)
        let days = (0..<50).map { BoundaryInstant.day(at("2026-11-15", "12:00").addingTimeInterval(Double($0) * 86_400), offsetMinutes: -180) }
        for (k, d) in days.enumerated() { rig.reader.add(workout("HK-\(k)-am", end: at(d, "07:00")), workout("HK-\(k)-pm", end: at(d, "19:00"))) }
        let ing = rig.make(); await ing.start()
        XCTAssertEqual(node.sent.map(\.activities.count), [32, 32, 32, 4])
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 100, "\(c)")
        XCTAssertEqual(try node.deviceRows().count, 100)
    }

    func testSourceQualityAloneIsADuplicate() async throws {
        let node = try NodeSink(athleteId: "b-sq"); try node.set("2026-11-17", "21:00")
        var a = WorkoutNormalizer.activity(workout("HK-Q", end: at("2026-11-17", "07:45")))
        a.sessionId = "w0-run-d1"
        let r1 = await node.deliver(try DeviceDelivery(deliveryId: "q-1", activities: [a]))
        a.sourceQuality = .wearablePartial
        let r2 = await node.deliver(try DeviceDelivery(deliveryId: "q-2", activities: [a]))
        guard case .answered(_, let x) = r1, case .answered(_, let y) = r2 else { return XCTFail("\(r1) \(r2)") }
        XCTAssertEqual(x.map(\.outcome.leavesQueue), [true]); XCTAssertEqual(y.map(\.outcome), [.duplicate])
    }

    /// Item 5: the host recorded the delivery and B died before writing the answer → the same delivery id is re-sent: replayed, one credit.
    func testDeathBetweenSendAndAnswerReplaysTheSameId() async throws {
        let node = try NodeSink(athleteId: "b-die"); try node.set("2026-11-17", "21:00")
        let store = MemoryStore(); let rig = Rig(sink: node, store: store)
        rig.reader.add(workout("HK-D", end: at("2026-11-17", "07:45")))
        let ing = rig.make(); await ing.setDying(); await ing.start()
        XCTAssertEqual(try node.deviceRows().count, 1, "the host committed it")
        let restarted = rig.make(); await restarted.start()
        XCTAssertEqual(node.sent.count, 2); XCTAssertEqual(node.sent[0].deliveryId, node.sent[1].deliveryId)
        XCTAssertEqual(node.sent[0].activities, node.sent[1].activities)
        let c = await restarted.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.pending + c.inFlight, 0)
        XCTAssertEqual(try node.deviceRows().count, 1, "no double credit")
    }
}

extension HealthKitIngestor { func setDying() { dieAfterDeliverBeforeApply = true } }

/// Front A with a context the test rewrites (to reach UNKNOWN_SESSION through the real boundary).
final class ContextOverride: DeviceActivitySink, @unchecked Sendable {
    let inner: NodeSink; let rewrite: (IngestContext) -> IngestContext
    init(_ inner: NodeSink, _ rewrite: @escaping (IngestContext) -> IngestContext) { self.inner = inner; self.rewrite = rewrite }
    func ingestContext() async -> IngestContextResult {
        if case .ready(let c) = await inner.ingestContext() { return .ready(rewrite(c)) }
        return await inner.ingestContext()
    }
    func deliver(_ d: DeviceDelivery) async -> DeliveryResult { await inner.deliver(d) }
}
