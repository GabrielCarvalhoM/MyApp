import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// Handoff §4 item 16 / §7 item 2: the six cases of `AdditiveContractTests.testRecordingDedupeCountsARunOnce`, through the real queue path.
final class DedupeTests: XCTestCase {
    static let plan = IngestContext.plan([("w0-run-d1", "2026-11-17"), ("w0-run-d3", "2026-11-19")])
    static let wStart = at("2026-11-17", "07:00"), wEnd = at("2026-11-17", "07:30")
    /// The watch workout: 07:01 → 07:30:30 (as in the shared test: 60 s later, 30 s longer than the recording).
    static let watch = WorkoutSnapshot(id: "HK-W", activityTypeRaw: WorkoutKind.running, start: wStart.addingTimeInterval(60), end: wEnd.addingTimeInterval(30),
                                       durationSeconds: 1770, distanceMeters: 5000, hasRoute: true, indoor: nil, wasUserEntered: false,
                                       sourceBundleId: "com.apple.health.X", sourceName: "Apple Watch", timeZoneIdentifier: "America/Sao_Paulo")
    static func rec(_ sid: String?, _ ev: String?, id: String = "rec-1", start: Date = wStart, end: Date = wEnd) -> AppRecordedRunRef {
        AppRecordedRunRef(id: id, sessionId: sid, start: start, end: end, reportedEventId: ev)
    }
    /// A second run that day, so the normal rule alone would link neither (the dedupe link is what links the watch run).
    static let evening = workout("HK-E", end: at("2026-11-17", "19:00"), minutes: 20)

    func rig(_ recs: [AppRecordedRunRef]) -> (Rig, ScriptedSink, FakeRecordingIndex) {
        let sink = ScriptedSink(context: .ready(Self.plan)); let index = FakeRecordingIndex(); index.set(recs)
        let r = Rig(sink: sink, index: index); r.reader.add(Self.watch, Self.evening)
        return (r, sink, index)
    }
    func linkOf(_ sink: ScriptedSink, _ id: String) -> String?? { sink.deliveries.flatMap(\.activities).first { $0.activityId == id }.map(\.sessionId) }

    func testNoRecordingFollowsTheNormalRule() async {
        let (r, sink, _) = rig([]); let ing = r.make(); await ing.start()
        XCTAssertEqual(linkOf(sink, "HK-W"), .some(nil), "two runs that day: unlinked by the normal rule")
    }

    func testPlannedReportedRecordingLinksTheWatchRunToThatSession() async {
        let (r, sink, _) = rig([Self.rec("w0-run-d1", "ob_1")]); let ing = r.make(); await ing.start()
        XCTAssertEqual(linkOf(sink, "HK-W"), .some("w0-run-d1"))
        XCTAssertEqual(linkOf(sink, "HK-E"), .some(nil), "one workout per session")
    }

    func testUnplannedReportedRecordingSetsTheWatchRunAsideAndCountsTheLostDistance() async {
        let (r, sink, _) = rig([Self.rec(nil, "ob_1")]); let ing = r.make(); await ing.start()
        XCTAssertNil(linkOf(sink, "HK-W"), "never delivered")
        let c = await ing.counts()
        XCTAssertEqual(c.setAside, ["OVERLAPS_APP_RECORDING": 1]); XCTAssertEqual(c.counters["MEASURED_DISTANCE_LOST_TO_APP_RECORDING"], 1)
        let st = await ing.status(); XCTAssertEqual(st.setAside, 1)
    }

    func testUnreportedRecordingHoldsThenRedecidesWhenReported() async {
        let (r, sink, index) = rig([Self.rec("w0-run-d1", nil)]); let ing = r.make(); await ing.start()
        XCTAssertNil(linkOf(sink, "HK-W"), "held, not sent")
        var c = await ing.counts(); XCTAssertEqual(c.held, 1)
        let st = await ing.status(); XCTAssertEqual(st.queued, 1, "a held run is queued, never lost")
        // The index never notifies: the next HealthKit read re-decides.
        index.set([Self.rec("w0-run-d1", "ob_9")])
        await r.reader.fire(); await ing.settled()
        XCTAssertEqual(linkOf(sink, "HK-W"), .some("w0-run-d1"))
        c = await ing.counts(); XCTAssertEqual(c.held, 0); XCTAssertEqual(c.delivered, 2)
    }

    func testUnreportedUnplannedRecordingHoldsThenDiscardedGoesByTheNormalRule() async {
        let (r, sink, index) = rig([Self.rec(nil, nil)]); let ing = r.make(); await ing.start()
        var c = await ing.counts(); XCTAssertEqual(c.held, 1)
        index.set([])                                  // the athlete discarded the recording
        await ing.deliveryConditionsChanged()          // …and a host signal re-decides as well
        XCTAssertEqual(linkOf(sink, "HK-W"), .some(nil))
        c = await ing.counts(); XCTAssertEqual(c.held, 0); XCTAssertEqual(c.delivered, 2)
        // Launch re-decides too: a new ingestor over the same store sees no hold left.
        let again = r.make(); await again.start(); let c2 = await again.counts(); XCTAssertEqual(c2.held, 0)
    }

    func testAShortRecordingInsideALongRunNeverSetsItAside() async {
        let long = WorkoutSnapshot(id: "HK-L", activityTypeRaw: WorkoutKind.running, start: at("2026-11-19", "06:00"), end: at("2026-11-19", "07:00"),
                                   durationSeconds: 3600, distanceMeters: 10000, hasRoute: true, indoor: nil, wasUserEntered: false,
                                   sourceBundleId: "com.apple.health.X", sourceName: "Apple Watch", timeZoneIdentifier: nil)
        let short = Self.rec(nil, "ob_2", id: "rec-2", start: at("2026-11-19", "06:10"), end: at("2026-11-19", "06:15"))
        let later = Self.rec(nil, "ob_3", id: "rec-3", start: Self.wStart.addingTimeInterval(1500), end: Self.wStart.addingTimeInterval(4000))
        let sink = ScriptedSink(context: .ready(Self.plan)); let index = FakeRecordingIndex(); index.set([short, later])
        let r = Rig(sink: sink, index: index); r.reader.add(long, Self.watch)
        let ing = r.make(); await ing.start()
        XCTAssertEqual(linkOf(sink, "HK-L"), .some("w0-run-d3"), "5 of 60 minutes: a different run (SSCTR-ABC-S4 c)")
        XCTAssertEqual(linkOf(sink, "HK-W"), .some("w0-run-d1"), "a recording overlapping little of the watch run: a different run")
        let c = await ing.counts(); XCTAssertEqual(c.setAside, [:])
    }

    func testALinkedRecordingWhoseSessionIsTakenIsSetAside() async {
        let (r, sink, _) = rig([Self.rec("w0-run-d1", "ob_1")])
        let ing = r.make(); await ing.start()
        let other = WorkoutSnapshot(id: "HK-W2", activityTypeRaw: WorkoutKind.running, start: Self.wStart.addingTimeInterval(30), end: Self.wEnd,
                                    durationSeconds: 1770, distanceMeters: nil, hasRoute: false, indoor: nil, wasUserEntered: false,
                                    sourceBundleId: "com.apple.health.Y", sourceName: "iPhone", timeZoneIdentifier: nil)
        r.reader.add(other); await r.reader.fire(); await ing.settled()
        XCTAssertNil(linkOf(sink, "HK-W2"), "the session already has its run: never a second link, never a second unlinked row")
        let c = await ing.counts(); XCTAssertEqual(c.setAside, ["OVERLAPS_APP_RECORDING": 1]); XCTAssertNil(c.counters["MEASURED_DISTANCE_LOST_TO_APP_RECORDING"])
    }

    /// The linked case through the REAL boundary: the athlete's report of the recording and the watch run end up on ONE row of the session.
    func testLinkedDedupeCountsTheRunOnceAtTheBoundary() async throws {
        guard node() else { throw XCTSkip("node not installed") }
        let node = try NodeSink(athleteId: "b-dd")
        let report = try node.call("reportSession", ["sessionId": "w0-run-d1", "day": "2026-11-17", "time": "08:00"]) as! [String: Any]
        let eventId = try XCTUnwrap(report["eventId"] as? String)
        try node.set("2026-11-17", "21:00")
        let index = FakeRecordingIndex(); index.set([Self.rec("w0-run-d1", eventId)])
        let r = Rig(sink: node, index: index); r.reader.add(Self.watch, Self.evening)
        let ing = r.make(); await ing.start()
        XCTAssertEqual(node.sent.flatMap(\.activities).first { $0.activityId == "HK-W" }?.sessionId, "w0-run-d1")
        let rows = try node.call("liveRows", ["sessionId": "w0-run-d1"]) as! [[String: Any]]
        XCTAssertEqual(rows.count, 1, "one run, one row: \(rows)")
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 2)
    }
}
