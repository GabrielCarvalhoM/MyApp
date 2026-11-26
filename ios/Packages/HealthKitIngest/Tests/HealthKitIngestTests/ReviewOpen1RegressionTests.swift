import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// Independent review of OPEN-1 policy 2 (`INDEPENDENT_REVIEW.md`, round O1): the reviewer's probes, kept as regression tests. The five
/// finding tests (01 a/b, 05, 02 a/b) fail on the code the reviewer received; chunking and reentrancy were checks that already passed.
final class ReviewOpen1RegressionTests: XCTestCase {
    static let plan = IngestContext.plan([("w0-run-d1", "2026-11-17"), ("w0-run-d3", "2026-11-19")])
    func sent(_ sink: ScriptedSink) -> [String] { sink.deliveries.flatMap(\.activities).map(\.activityId) }
    func rig(_ recs: [AppRecordedRunRef] = []) -> (Rig, ScriptedSink) {
        let sink = ScriptedSink(context: .ready(Self.plan)); let idx = FakeRecordingIndex(); idx.set(recs)
        return (Rig(sink: sink, index: idx), sink)
    }
    static func unplannedReported(_ from: String, _ to: String) -> AppRecordedRunRef {
        AppRecordedRunRef(id: "rec", sessionId: nil, start: at("2026-11-17", from), end: at("2026-11-17", to), reportedEventId: "ev-athlete")
    }

    /// QRE-B-O1-01 (a): the copy chosen to deliver the run does not meet the athlete's unplanned recording, but another copy of the same run
    /// does. The whole run is the recorded one: nothing is sent.
    func testTheRecordingIsMatchedAgainstEveryCopyOfTheRun() async {
        let (r, sink) = rig([Self.unplannedReported("07:20", "07:40")])
        r.reader.add(hkRun("W", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.watch),
                     hkRun("S", "2026-11-17", "06:59", seconds: 30, minutes: 40, meters: 7000, source: Src.strava))
        let ing = r.make(); await ing.start()
        XCTAssertEqual(sent(sink), [])
        let c = await ing.counts(); XCTAssertEqual(c.setAside, ["OVERLAPS_APP_RECORDING": 1]); XCTAssertEqual(c.consolidated, 1)
    }

    /// QRE-B-O1-01 (b): the chosen copy is set aside as the recorded run; its copy is consolidated into it, never promoted and sent.
    func testACopyOfARunCountedByARecordingIsNeverPromoted() async {
        let (r, sink) = rig([Self.unplannedReported("07:00", "07:20")])
        r.reader.add(hkRun("W", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.watch),
                     hkRun("S", "2026-11-17", "07:00", seconds: 30, minutes: 40, meters: 7000, source: Src.strava))
        let ing = r.make(); await ing.start(); await ing.readNow(); await ing.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink), [])
        let runs = await ing.importedRuns(since: .distantPast)
        XCTAssertEqual(runs.first { $0.id == "S" }?.status, .consolidatedDuplicate); XCTAssertEqual(runs.first { $0.id == "S" }?.sameRunAs, "W")
    }

    /// QRE-B-O1-05: the lost measured distance is counted per run, not per copy.
    func testLostDistanceIsCountedOncePerRun() async {
        let (r, _) = rig([Self.unplannedReported("07:00", "07:40")])
        r.reader.add(hkRun("W", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.watch),
                     hkRun("S", "2026-11-17", "07:00", seconds: 5, minutes: 40, meters: 7000, source: Src.strava),
                     hkRun("G", "2026-11-17", "07:00", seconds: 9, minutes: 40, meters: 7000, source: Src.garmin))
        let ing = r.make(); await ing.start(); await ing.readNow(); await ing.readNow()
        let c = await ing.counts()
        XCTAssertEqual(c.counters["MEASURED_DISTANCE_LOST_TO_APP_RECORDING"], 1); XCTAssertEqual(c.setAside.values.reduce(0, +), 1); XCTAssertEqual(c.consolidated, 2)
    }

    /// QRE-B-O1-02 (a): a copy drifting by seconds over two back-to-back runs never drags the second run into reconciliation.
    func testACopysDriftDoesNotHoldTheNextRun() async {
        let (r, sink) = rig()
        r.reader.add(hkRun("A", "2026-11-17", "07:00", minutes: 30, meters: 5000, source: Src.garmin),
                     hkRun("B", "2026-11-17", "07:30", minutes: 30, meters: 5000, source: Src.garmin),
                     hkRun("SA", "2026-11-17", "07:00", seconds: 10, minutes: 30, meters: 5000, source: Src.strava))
        let ing = r.make(); await ing.start()
        XCTAssertEqual(Set(sent(sink)), ["A", "B"])
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 1); XCTAssertEqual(c.reconcile, [:])
    }

    /// QRE-B-O1-02 (b): two runs of ONE watch overlapping by a second (rounding) are both delivered, as before policy 2.
    func testOneSecondOverlapIsTwoRuns() async {
        let (r, sink) = rig()
        r.reader.add(hkRun("A", "2026-11-17", "07:00", minutes: 30 + 1.0 / 60, meters: 5000, source: Src.watch),
                     hkRun("B", "2026-11-17", "07:30", minutes: 30, meters: 5000, source: Src.watch))
        let ing = r.make(); await ing.start()
        XCTAssertEqual(Set(sent(sink)), ["A", "B"])
    }

    /// Chunking: 40 runs, each with a copy — 40 delivered in chunks of at most 32, 40 copies consolidated, no copy sent.
    func testChunkingWithCopies() async {
        let (r, sink) = rig()
        for k in 0..<40 {
            let h = String(format: "%02d:00", k % 20 + 1), day = k < 20 ? "2026-11-20" : "2026-11-21"
            r.reader.add(hkRun("R\(k)", day, h, minutes: 30, meters: 5000, source: Src.garmin),
                         hkRun("C\(k)", day, h, seconds: 4, minutes: 30, meters: 5010, source: Src.strava))
        }
        let ing = r.make(); await ing.start()
        XCTAssertTrue(sink.deliveries.allSatisfy { $0.activities.count <= 32 })
        XCTAssertEqual(Set(sent(sink)).count, 40); XCTAssertTrue(sent(sink).allSatisfy { $0.hasPrefix("R") })
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 40); XCTAssertEqual(c.delivered, 40)
    }

    /// Reentrancy: a better copy arrives and is committed while the delivery being built awaits the recording index: one is sent.
    func testABetterCopyArrivingDuringTheIndexAwaitIsSentAlone() async {
        let sink = ScriptedSink(context: .ready(Self.plan)); let reader = ScriptedReader(); let idx = ReentrantIndex()
        reader.add(hkRun("P", "2026-11-17", "07:00", minutes: 30, meters: nil, route: false, source: Src.garmin))
        let ing = HealthKitIngestor(reader: reader, sink: sink, recordings: idx, store: MemoryStore(), log: CapturingLog(), scheduler: ManualScheduler())
        idx.onFirst = { reader.add(hkRun("F", "2026-11-17", "07:00", seconds: 5, minutes: 30, meters: 5000, source: Src.strava)); await ing.readNow() }
        await ing.start()
        XCTAssertEqual(sent(sink), ["F"])
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 1)
    }
}

/// Recheck round (O1-R2): both finding tests fail on the code of round O1's fixes.
final class ReviewOpen1R2RegressionTests: XCTestCase {
    final class HookedIndex: AppRecordingIndex, @unchecked Sendable {
        var hook: (@Sendable () async -> Void)?; private var fired = false; let recs: [AppRecordedRunRef]
        init(_ r: [AppRecordedRunRef]) { recs = r }
        func recordings(overlapping i: DateInterval) async -> [AppRecordedRunRef] {
            if !fired, let h = hook { fired = true; await h() }
            return recs.filter { $0.interval.intersects(i) }
        }
    }

    /// QRE-B-O1-10: a copy that is the recorded run arrives while the index is awaited for the run's chosen copy: still counted once.
    func testACopyArrivingDuringTheIndexAwaitIsMatchedAgainstTheRecording() async {
        let sink = ScriptedSink(context: .ready(ReviewOpen1RegressionTests.plan)); let reader = ScriptedReader()
        let idx = HookedIndex([ReviewOpen1RegressionTests.unplannedReported("07:20", "07:40")])
        reader.add(hkRun("S", "2026-11-17", "06:59", seconds: 30, minutes: 40, meters: 7000, source: Src.strava))
        let ing = HealthKitIngestor(reader: reader, sink: sink, recordings: idx, store: MemoryStore(), log: CapturingLog(), scheduler: ManualScheduler())
        idx.hook = { reader.add(hkRun("W", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.watch)); await ing.readNow() }
        await ing.start(); await ing.readNow()
        XCTAssertEqual(sink.deliveries.flatMap(\.activities).map(\.activityId), [], "W is the recorded run and S is W's run")
    }

    /// QRE-B-O1-11: two copies of one 50 s run are one run (the 60 s tolerance never applies to a `sameRun` overlap).
    func testCopiesOfAVeryShortRunCountOnce() async {
        let sink = ScriptedSink(context: .ready(ReviewOpen1RegressionTests.plan)); let r = Rig(sink: sink)
        r.reader.add(hkRun("G", "2026-11-17", "07:00", minutes: 50.0 / 60, meters: 300, source: Src.garmin),
                     hkRun("S", "2026-11-17", "07:00", seconds: 1, minutes: 50.0 / 60, meters: 300, source: Src.strava))
        let ing = r.make(); await ing.start()
        XCTAssertEqual(sink.deliveries.flatMap(\.activities).map(\.activityId), ["G"])
    }

    /// `representative` depends only on the set of facts (all 24 orders of a group with tied and cycling sync versions).
    func testTheRepresentativeIsOrderIndependent() {
        func f(_ id: String, _ q: DeviceSourceQuality, _ d: Double?, _ sync: String?, _ v: Int?, _ src: String) -> SameRunRule.Facts {
            .init(id: id, start: at("2026-11-17", "07:00"), end: at("2026-11-17", "07:40"), minutes: 40, distanceKm: d, quality: q, sourceBundleId: src,
                  syncIdentifier: sync, syncVersion: v, fixed: false)
        }
        let xs = [f("V1", .wearableFull, 7, "g", 1, "g"), f("V2", .wearablePartial, nil, "g", 2, "g"), f("W", .wearablePartial, 7, nil, nil, "w"),
                  f("V2b", .wearablePartial, nil, "g", 2, "g")]
        func perms(_ a: [SameRunRule.Facts]) -> [[SameRunRule.Facts]] {
            a.count <= 1 ? [a] : a.indices.flatMap { i -> [[SameRunRule.Facts]] in var r = a; let x = r.remove(at: i); return perms(r).map { [x] + $0 } }
        }
        XCTAssertEqual(Set(perms(xs).map { SameRunRule.representative($0).id }).count, 1)
    }
}

final class ReentrantIndex: AppRecordingIndex, @unchecked Sendable {
    var onFirst: (@Sendable () async -> Void)?
    private var fired = false
    func recordings(overlapping interval: DateInterval) async -> [AppRecordedRunRef] {
        if !fired, let f = onFirst { fired = true; await f() }
        return []
    }
}
