import XCTest
@testable import HealthKitIngest
import IntegrationContracts

// OPEN-1 policy 2 (Founder decision 2026-11-26): runs written to Apple Health by any app are imported, and the same physical run is counted
// once. Everything is synthetic: the bundle ids are the apps' public identifiers, no workout here is real Apple Health data.

enum Src {
    static let watch = "com.apple.health.6F1C2B9E"
    static let garmin = "com.garmin.connect.mobile"
    static let strava = "com.strava.stravaride"
    static let coros = "com.example.otherrunapp"
}

/// A synthetic run with an explicit interval and source.
func hkRun(_ id: String, _ day: String, _ from: String, seconds: Int = 0, minutes: Double, meters: Double? = 5000, route: Bool = true,
         source: String, name: String? = nil, product: String? = nil, sync: String? = nil, version: Int? = nil, userEntered: Bool = false) -> WorkoutSnapshot {
    let start = at(day, from).addingTimeInterval(TimeInterval(seconds))
    return WorkoutSnapshot(id: id, activityTypeRaw: WorkoutKind.running, start: start, end: start.addingTimeInterval(minutes * 60), durationSeconds: minutes * 60,
                           distanceMeters: meters, hasRoute: route, indoor: nil, wasUserEntered: userEntered, sourceBundleId: source,
                           sourceName: name, timeZoneIdentifier: nil, sourceProductType: product, syncIdentifier: sync, syncVersion: version)
}

// MARK: - The rule alone (pure, deterministic)

final class SameRunRuleTests: XCTestCase {
    func facts(_ w: WorkoutSnapshot, fixed: Bool = false) -> SameRunRule.Facts {
        let a = WorkoutNormalizer.activity(w)
        return .init(id: w.id, start: w.start, end: w.end, minutes: a.actual.minutes, distanceKm: a.actual.distanceKm, quality: a.sourceQuality,
                     sourceBundleId: w.sourceBundleId, syncIdentifier: w.syncIdentifier, syncVersion: w.syncVersion, fixed: fixed)
    }

    func testTheSourceNeverChangesSelectionNormalizationOrQuality() {
        let ws = [Src.watch, Src.garmin, Src.strava, Src.coros, ""].map { hkRun("X", "2026-11-17", "07:00", minutes: 40, meters: 7060, source: $0) }
        for w in ws { XCTAssertEqual(WorkoutNormalizer.select(w), .device, w.sourceBundleId) }
        let e = JSONEncoder(); e.outputFormatting = [.sortedKeys]
        let bytes = Set(ws.map { try! String(decoding: e.encode(WorkoutNormalizer.activity($0)), as: UTF8.self) })
        XCTAssertEqual(bytes.count, 1, "the same facts give the same DEVICE bytes whatever app wrote them")
        XCTAssertEqual(WorkoutNormalizer.select(hkRun("M", "2026-11-17", "07:00", minutes: 40, source: Src.strava, userEntered: true)),
                       .excludedRun(reason: "USER_ENTERED"), "a manual entry stays the athlete's statement, from any app")
    }

    func testOriginIsDisplayOnly() {
        XCTAssertEqual(ImportedRunOrigin.of(bundleId: Src.watch, productType: "Watch7,1"), .appleWatch)
        XCTAssertEqual(ImportedRunOrigin.of(bundleId: Src.watch, productType: "iPhone17,2"), .iPhone)
        XCTAssertEqual(ImportedRunOrigin.of(bundleId: Src.watch, productType: nil), .appleOther)
        XCTAssertEqual(ImportedRunOrigin.of(bundleId: Src.garmin, productType: nil), .garmin)
        XCTAssertEqual(ImportedRunOrigin.of(bundleId: Src.strava, productType: "iPhone17,2"), .strava)
        XCTAssertEqual(ImportedRunOrigin.of(bundleId: Src.coros, productType: nil), .otherApp)
        XCTAssertEqual(ImportedRunOrigin.of(bundleId: "", productType: nil), .unknown)
    }

    func testPairVerdictsAtTheirBoundaries() {
        let a = hkRun("A", "2026-11-17", "07:00", minutes: 30, meters: 5000, source: Src.garmin)
        // Touching (back to back, or overlapping by at most 60 s: clocks and button presses) is two runs; more than 60 s is not.
        XCTAssertEqual(SameRunRule.pair(facts(a), facts(hkRun("B", "2026-11-17", "07:30", minutes: 20, source: Src.strava))), .twoRuns)
        XCTAssertEqual(SameRunRule.pair(facts(a), facts(hkRun("B", "2026-11-17", "07:29", minutes: 20, source: Src.strava))), .twoRuns, "60 s overlap")
        XCTAssertEqual(SameRunRule.pair(facts(a), facts(hkRun("B", "2026-11-17", "07:28", seconds: 59, minutes: 20, source: Src.strava))),
                       .inconclusive(code: "RECONCILE_PARTIAL_OVERLAP"), "61 s overlap")
        // Overlap = exactly half of the longer: the shared sameRun rule says the same run.
        XCTAssertEqual(SameRunRule.pair(facts(hkRun("L", "2026-11-17", "07:00", minutes: 60, meters: nil, source: Src.watch)),
                                        facts(hkRun("S", "2026-11-17", "07:31", minutes: 29, meters: nil, source: Src.strava))), .inconclusive(code: "RECONCILE_PARTIAL_OVERLAP"),
                       "29 of the longer 60 min overlap: below half")
        XCTAssertEqual(SameRunRule.pair(facts(hkRun("L", "2026-11-17", "07:00", minutes: 60, meters: nil, source: Src.watch)),
                                        facts(hkRun("S", "2026-11-17", "07:30", minutes: 30, meters: nil, source: Src.strava))), .inconclusive(code: "RECONCILE_MEASUREMENTS_DISAGREE"),
                       "exactly half: the shared sameRun rule holds, but 30 vs 60 min disagree")
        XCTAssertEqual(SameRunRule.pair(facts(hkRun("L", "2026-11-17", "07:00", minutes: 60, meters: nil, source: Src.watch)),
                                        facts(hkRun("S", "2026-11-17", "07:00", minutes: 57, meters: nil, source: Src.strava))), .sameRun,
                       "57 of 60 min: the engine's R7-A duration rule (≤ max(3, 10 %)) agrees")
        // Duration: max(3 min, 10 %) — 30 vs 33 agrees, 30 vs 33.5 does not.
        XCTAssertEqual(SameRunRule.pair(facts(a), facts(hkRun("B", "2026-11-17", "07:00", minutes: 33, meters: 5000, source: Src.strava))), .sameRun)
        XCTAssertEqual(SameRunRule.pair(facts(a), facts(hkRun("B", "2026-11-17", "07:00", minutes: 33.5, meters: 5000, source: Src.strava))),
                       .inconclusive(code: "RECONCILE_MEASUREMENTS_DISAGREE"))
        // Distance: 10 % of the longer — 5.0 vs 5.5 agrees, 5.0 vs 5.6 does not; an unknown distance never disagrees.
        XCTAssertEqual(SameRunRule.pair(facts(a), facts(hkRun("B", "2026-11-17", "07:00", minutes: 30, meters: 5500, source: Src.strava))), .sameRun)
        XCTAssertEqual(SameRunRule.pair(facts(a), facts(hkRun("B", "2026-11-17", "07:00", minutes: 30, meters: 5600, source: Src.strava))),
                       .inconclusive(code: "RECONCILE_MEASUREMENTS_DISAGREE"))
        XCTAssertEqual(SameRunRule.pair(facts(a), facts(hkRun("B", "2026-11-17", "07:00", minutes: 30, meters: nil, source: Src.strava))), .sameRun)
        // Same source + same sync identifier: the same record, even if an edit moved it.
        XCTAssertEqual(SameRunRule.pair(facts(hkRun("V1", "2026-11-17", "07:00", minutes: 30, source: Src.garmin, sync: "g-1", version: 1)),
                                        facts(hkRun("V2", "2026-11-17", "09:00", minutes: 20, source: Src.garmin, sync: "g-1", version: 2))), .sameRun)
        // The same sync identifier from ANOTHER source means nothing.
        XCTAssertEqual(SameRunRule.pair(facts(hkRun("V1", "2026-11-17", "07:00", minutes: 30, source: Src.garmin, sync: "g-1")),
                                        facts(hkRun("V2", "2026-11-17", "09:00", minutes: 20, source: Src.strava, sync: "g-1"))), .twoRuns)
    }

    func testDecisionsDoNotDependOnOrder() {
        let ws = [hkRun("G", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin),
                  hkRun("S", "2026-11-17", "07:00", seconds: 4, minutes: 39.9, meters: 6980, source: Src.strava),
                  hkRun("W", "2026-11-17", "06:59", seconds: 40, minutes: 40.5, meters: 7080, source: Src.watch),
                  hkRun("E", "2026-11-17", "19:00", minutes: 20, meters: 3000, source: Src.strava)]
        let first = SameRunRule.decide(ws.map { facts($0) })
        XCTAssertEqual(first["W"], .deliver, "earliest start among equally complete copies"); XCTAssertEqual(first["E"], .deliver)
        XCTAssertEqual(first["G"], .duplicateOf("W")); XCTAssertEqual(first["S"], .duplicateOf("W"))
        for p in [[3, 2, 1, 0], [1, 3, 0, 2], [2, 0, 3, 1]] { XCTAssertEqual(SameRunRule.decide(p.map { facts(ws[$0]) }), first) }
    }

    func testTheMoreCompleteCopyIsTheRunAndAFixedOneAlwaysIs() {
        let partial = hkRun("P", "2026-11-17", "07:00", minutes: 30, meters: nil, route: false, source: Src.garmin)
        let full = hkRun("F", "2026-11-17", "07:00", seconds: 30, minutes: 30, meters: 5000, source: Src.strava)
        XCTAssertEqual(SameRunRule.decide([facts(partial), facts(full)]), ["F": .deliver, "P": .duplicateOf("F")])
        XCTAssertEqual(SameRunRule.decide([facts(partial, fixed: true), facts(full)]), ["F": .duplicateOf("P")],
                       "a run already sent stays the run: the copy is consolidated into it, never sent")
    }
}

// MARK: - Through the queue and the real frozen boundary

/// Synthetic plan of the Node double: enrolled 2026-11-14 (-03:00); RUN sessions w0-run-d1 (11-17), w0-run-d3 (11-19), …
final class ThirdPartyImportTests: XCTestCase {
    static let plan = IngestContext.plan([("w0-run-d1", "2026-11-17"), ("w0-run-d3", "2026-11-19")])
    func sent(_ sink: ScriptedSink) -> [DeviceActivity] { sink.deliveries.flatMap(\.activities) }
    func scripted(_ ws: WorkoutSnapshot...) -> (Rig, ScriptedSink) {
        let sink = ScriptedSink(context: .ready(Self.plan)); let r = Rig(sink: sink); for w in ws { r.reader.add(w) }; return (r, sink)
    }
    func nodeRig(_ athlete: String, at day: String = "2026-11-17", _ time: String = "21:00") throws -> (Rig, NodeSink) {
        guard node() else { throw XCTSkip("node not installed") }
        let n = try NodeSink(athleteId: athlete); try n.set(day, time); return (Rig(sink: n), n)
    }

    // 1. A single Garmin run is imported, through the real boundary, linked by the normal rule.
    func testASingleGarminRunIsImported() async throws {
        let (r, n) = try nodeRig("tp-garmin")
        r.reader.add(hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 7060, source: Src.garmin, name: "Garmin Connect"))
        let ing = r.make(); await ing.start()
        let rows = try n.deviceRows()
        XCTAssertEqual(rows.count, 1); XCTAssertEqual(rows.first?["activityId"] as? String, "G1"); XCTAssertEqual(rows.first?["sessionId"] as? String, "w0-run-d1")
        let runs = await ing.importedRuns(since: .distantPast)
        XCTAssertEqual(runs.map(\.status), [.counted]); XCTAssertEqual(runs.first?.origin, .garmin); XCTAssertEqual(runs.first?.sourceName, "Garmin Connect")
        XCTAssertEqual(runs.first?.sessionId, "w0-run-d1"); XCTAssertEqual(runs.first?.statusCode, "RECORDED")
        let c = await ing.counts(); XCTAssertEqual(c.excluded, [:]); XCTAssertEqual(c.delivered, 1)
    }

    // 2. A single Strava run is imported.
    func testASingleStravaRunIsImported() async {
        let (r, sink) = scripted(hkRun("S1", "2026-11-19", "18:00", minutes: 25, meters: 4100, source: Src.strava, name: "Strava"))
        let ing = r.make(); await ing.start()
        XCTAssertEqual(sent(sink).map(\.activityId), ["S1"]); XCTAssertEqual(sent(sink).first?.sessionId, "w0-run-d3")
        let runs = await ing.importedRuns(since: .distantPast); XCTAssertEqual(runs.first?.origin, .strava); XCTAssertEqual(runs.first?.status, .counted)
    }

    // 3. A single Apple Watch run is imported (unchanged by the new policy).
    func testASingleAppleWatchRunIsImported() async {
        let (r, sink) = scripted(hkRun("W1", "2026-11-17", "06:30", minutes: 35, meters: 6000, source: Src.watch, name: "Apple Watch", product: "Watch7,1"))
        let ing = r.make(); await ing.start()
        XCTAssertEqual(sent(sink).map(\.activityId), ["W1"])
        let runs = await ing.importedRuns(since: .distantPast); XCTAssertEqual(runs.first?.origin, .appleWatch)
    }

    // 4. The same HKWorkout read again (a later read, a restart, an anchor reset) is one import.
    func testTheSameWorkoutReadAgainIsImportedOnce() async {
        let g = hkRun("G1", "2026-11-17", "07:00", minutes: 40, source: Src.garmin)
        let store = MemoryStore(); let sink = ScriptedSink(context: .ready(Self.plan)); let r = Rig(sink: sink, store: store)
        r.reader.add(g); let ing = r.make(); await ing.start()
        r.reader.add(g); await ing.readNow()                       // HealthKit hands it back
        // A relaunch whose plan starts another day: the anchor is dropped and HealthKit is read again from no anchor (QRE-B-O1-07).
        sink.context = .ready(IngestContext.plan([("w0-run-d1", "2026-11-17")], start: "2026-11-15"))
        let fresh = ScriptedReader(); fresh.add(g)
        let again = r.make(reader: fresh); await again.start()
        XCTAssertEqual(fresh.reads, 1, "read again from no anchor (another record start day)")
        XCTAssertEqual(sent(sink).map(\.activityId), ["G1"], "delivered once")
        let c = await again.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.consolidated, 0); XCTAssertEqual(c.pending, 0)
    }

    /// Control: what the frozen boundary does if B sent both copies. Two rows — so B, not the boundary, must count the run once.
    func testControlTheBoundaryWouldRecordTwoCopiesAsTwoRuns() async throws {
        let (_, n) = try nodeRig("tp-control")
        let g = WorkoutNormalizer.activity(hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin))
        let s = WorkoutNormalizer.activity(hkRun("S1", "2026-11-17", "07:00", seconds: 5, minutes: 39.9, meters: 6990, source: Src.strava))
        let acts = try JSONSerialization.jsonObject(with: JSONEncoder().encode([g, s]))
        _ = try n.call("importWithId", ["clientRequestId": UUID().uuidString, "activities": acts])
        XCTAssertEqual(try n.deviceRows().count, 2, "the boundary keys DEVICE rows by activityId only")
    }

    // 5. Garmin + Strava copies of one run: one count, whichever arrives first.
    func testGarminAndStravaCopiesOfOneRunCountOnce() async throws {
        let (r, n) = try nodeRig("tp-gs")
        r.reader.add(hkRun("S1", "2026-11-17", "07:00", seconds: 5, minutes: 39.9, meters: 6990, source: Src.strava),
                     hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin))
        let ing = r.make(); await ing.start()
        let rows = try n.deviceRows()
        XCTAssertEqual(rows.count, 1, "one physical run, one row"); XCTAssertEqual(rows.first?["activityId"] as? String, "G1")
        XCTAssertEqual(rows.first?["sessionId"] as? String, "w0-run-d1", "the copy is not a second candidate of the day: the link rule still links")
        XCTAssertFalse(n.sent.flatMap(\.activities).contains { $0.activityId == "S1" }, "the copy is never sent")
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 1); XCTAssertEqual(c.delivered, 1)
        let runs = await ing.importedRuns(since: .distantPast)
        XCTAssertEqual(runs.first { $0.id == "S1" }?.status, .consolidatedDuplicate); XCTAssertEqual(runs.first { $0.id == "S1" }?.sameRunAs, "G1")
        XCTAssertEqual(runs.first { $0.id == "S1" }?.origin, .strava, "the copy keeps its own provenance")
        let st = await ing.status(); XCTAssertEqual(st.queued, 0, "a consolidated copy is done, not queued"); XCTAssertNil(st.waitingReason)
    }

    func testACopyArrivingAfterTheRunWasDeliveredIsConsolidatedIntoIt() async throws {
        let (r, n) = try nodeRig("tp-late")
        r.reader.add(hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin))
        let ing = r.make(); await ing.start()
        r.reader.add(hkRun("S1", "2026-11-17", "07:00", seconds: 5, minutes: 39.9, meters: 6990, source: Src.strava)); await ing.readNow()
        XCTAssertEqual(try n.deviceRows().count, 1); XCTAssertEqual(n.sent.count, 1)
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 1)
    }

    // 6. Apple Watch + a third-party app (both worn) for one run: one count.
    func testAppleWatchAndAThirdPartyCopyOfOneRunCountOnce() async throws {
        let (r, n) = try nodeRig("tp-wg")
        r.reader.add(hkRun("W1", "2026-11-17", "06:59", seconds: 30, minutes: 40.7, meters: 7050, source: Src.watch, product: "Watch7,1"),
                     hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 6950, source: Src.garmin))
        let ing = r.make(); await ing.start()
        XCTAssertEqual(try n.deviceRows().count, 1)
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 1); XCTAssertEqual(c.delivered, 1)
    }

    // 7. A run recorded by RepMile and reported, plus its Garmin AND Strava copies in Apple Health: one row on the session.
    func testARepMileRecordingAndTwoHealthCopiesAreOneRun() async throws {
        let (_, n) = try nodeRig("tp-rec")
        let report = try n.call("reportSession", ["sessionId": "w0-run-d1", "day": "2026-11-17", "time": "08:00"]) as! [String: Any]
        let ev = try XCTUnwrap(report["eventId"] as? String)
        try n.set("2026-11-17", "21:00")
        let index = FakeRecordingIndex()
        index.set([AppRecordedRunRef(id: "rec-1", sessionId: "w0-run-d1", start: at("2026-11-17", "07:00"), end: at("2026-11-17", "07:40"), reportedEventId: ev)])
        let r = Rig(sink: n, index: index)
        r.reader.add(hkRun("G1", "2026-11-17", "07:00", seconds: 20, minutes: 39.5, meters: 7000, source: Src.garmin),
                     hkRun("S1", "2026-11-17", "07:00", seconds: 25, minutes: 39.4, meters: 6990, source: Src.strava))
        let ing = r.make(); await ing.start()
        let rows = try n.call("liveRows", ["sessionId": "w0-run-d1"]) as! [[String: Any]]
        XCTAssertEqual(rows.count, 1, "the athlete's report and ONE device copy on one row: \(rows)")
        XCTAssertEqual(n.sent.flatMap(\.activities).map(\.activityId), ["G1"])
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 1)
    }

    // 8. Two legitimate runs close in time (back to back, or the same distance and duration at other hours) are both kept.
    func testTwoLegitimateRunsCloseInTimeAreBothKept() async throws {
        let (r, n) = try nodeRig("tp-two")
        r.reader.add(hkRun("A", "2026-11-17", "07:00", minutes: 30, meters: 5000, source: Src.garmin),
                     hkRun("B", "2026-11-17", "07:30", minutes: 30, meters: 5000, source: Src.garmin),      // starts when A ends
                     hkRun("C", "2026-11-17", "08:02", minutes: 15, meters: 2500, source: Src.strava),
                     hkRun("D", "2026-11-17", "18:00", minutes: 30, meters: 5000, source: Src.strava))      // same numbers as A, evening
        let ing = r.make(); await ing.start()
        XCTAssertEqual(Set(try n.deviceRows().compactMap { $0["activityId"] as? String }), ["A", "B", "C", "D"])
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 0); XCTAssertEqual(c.reconcile, [:])
        XCTAssertTrue(n.sent.flatMap(\.activities).allSatisfy { $0.sessionId == nil }, "four runs that day: none linked (contract §4.3)")
    }

    // 9. Similar but inconclusive: kept, not delivered, not reported as imported, reconcilable.
    func testInconclusiveCopiesAwaitReconciliationAndAreNeverDiscarded() async {
        let (r, sink) = scripted(hkRun("W1", "2026-11-17", "07:00", minutes: 60, meters: 10000, source: Src.watch),
                                 hkRun("S1", "2026-11-17", "07:40", minutes: 50, meters: 8000, source: Src.strava),       // partial overlap
                                 hkRun("G2", "2026-11-19", "07:00", minutes: 40, meters: 7000, source: Src.garmin),
                                 hkRun("S2", "2026-11-19", "07:00", minutes: 40, meters: 9000, source: Src.strava))       // distances disagree
        let ing = r.make(); await ing.start()
        XCTAssertTrue(sent(sink).isEmpty, "no possible double count reaches the engine")
        let c = await ing.counts()
        XCTAssertEqual(c.reconcile, ["RECONCILE_PARTIAL_OVERLAP": 2, "RECONCILE_MEASUREMENTS_DISAGREE": 2]); XCTAssertEqual(c.delivered, 0)
        let st = await ing.status(); XCTAssertEqual(st.queued, 4); XCTAssertEqual(st.waitingReason, "AWAITING_RECONCILIATION"); XCTAssertEqual(st.setAside, 0)
        let runs = await ing.importedRuns(since: .distantPast)
        XCTAssertEqual(runs.map(\.status), Array(repeating: .awaitingReconciliation, count: 4))
        XCTAssertEqual(Set(runs.filter { $0.id == "W1" || $0.id == "S1" }.map(\.reconciliationGroup)), ["S1"])
        XCTAssertEqual(Set(runs.filter { $0.id == "G2" || $0.id == "S2" }.map(\.reconciliationGroup)), ["G2"])
        // A later copy that disagrees with a run already delivered waits too; the delivered run stays counted.
        r.reader.add(hkRun("D1", "2026-11-21", "07:00", minutes: 30, meters: 5000, source: Src.garmin)); await ing.readNow()
        r.reader.add(hkRun("D2", "2026-11-21", "07:00", minutes: 45, meters: 5000, source: Src.strava)); await ing.readNow()
        XCTAssertEqual(sent(sink).map(\.activityId), ["D1"])
        let d2 = await ing.importedRuns(since: .distantPast).first { $0.id == "D2" }
        XCTAssertEqual(d2?.status, .awaitingReconciliation); XCTAssertEqual(d2?.statusCode, "RECONCILE_MEASUREMENTS_DISAGREE")
    }

    func testARunOverlappingTwoRunsIsNotForcedIntoEither() async {
        let (r, sink) = scripted(hkRun("A", "2026-11-17", "07:00", minutes: 30, source: Src.garmin),
                                 hkRun("B", "2026-11-17", "07:35", minutes: 30, source: Src.garmin),
                                 hkRun("C", "2026-11-17", "07:00", minutes: 65, meters: 10000, source: Src.strava))
        let ing = r.make(); await ing.start()
        XCTAssertTrue(sent(sink).isEmpty)
        let c = await ing.counts(); XCTAssertEqual(c.reconcile, ["RECONCILE_SEVERAL_RUNS": 3])
    }

    // 10. Deletion and update keep the state consistent.
    func testDeletingOneInconclusiveCopyLetsTheOtherThrough() async {
        let (r, sink) = scripted(hkRun("W1", "2026-11-17", "07:00", minutes: 60, meters: 10000, source: Src.watch),
                                 hkRun("S1", "2026-11-17", "07:40", minutes: 50, meters: 8000, source: Src.strava))
        let ing = r.make(); await ing.start()
        XCTAssertTrue(sent(sink).isEmpty)
        r.reader.delete("S1"); await ing.readNow()
        XCTAssertEqual(sent(sink).map(\.activityId), ["W1"]); XCTAssertEqual(sent(sink).first?.sessionId, "w0-run-d1")
        let c = await ing.counts(); XCTAssertEqual(c.reconcile, [:]); XCTAssertEqual(c.counters["DELETED_BEFORE_DELIVERY"], 1)
    }

    func testDeletingTheChosenCopyBeforeItIsSentDeliversTheOther() async {
        let (r, sink) = scripted(hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin),
                                 hkRun("S1", "2026-11-17", "07:00", seconds: 5, minutes: 39.9, meters: 6990, source: Src.strava))
        sink.answers = [{ _ in .waiting(code: "CONSENT_REQUIRED") }]
        let ing = r.make(); await ing.start()
        XCTAssertEqual(sent(sink).map(\.activityId), ["G1"]); var c = await ing.counts(); XCTAssertEqual(c.consolidated, 1)
        r.reader.delete("G1"); await ing.readNow()                  // waiting: the frozen G1 leaves the queue, nothing is sent
        c = await ing.counts(); XCTAssertEqual(c.consolidated, 0); XCTAssertEqual(c.pending, 1)
        await ing.deliveryConditionsChanged()
        XCTAssertEqual(sent(sink).map(\.activityId), ["G1", "S1"]); c = await ing.counts(); XCTAssertEqual(c.delivered, 1)
    }

    func testAnAppUpdatingItsRecordAfterDeliveryIsNotASecondRun() async {
        let (r, sink) = scripted(hkRun("V1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin, sync: "g-77", version: 1))
        let ing = r.make(); await ing.start()
        // Garmin re-syncs a trimmed version: HealthKit deletes V1 and adds V2 (new UUID, same sync identifier, other numbers).
        r.reader.delete("V1"); r.reader.add(hkRun("V2", "2026-11-17", "07:05", minutes: 30, meters: 5200, source: Src.garmin, sync: "g-77", version: 2))
        await ing.readNow()
        XCTAssertEqual(sent(sink).map(\.activityId), ["V1"], "G-5: nothing is sent after delivery in V1")
        let c = await ing.counts(); XCTAssertEqual(c.consolidated, 1); XCTAssertEqual(c.counters["DELETED_AFTER_DELIVERY"], 1); XCTAssertEqual(c.reconcile, [:])
    }

    func testTheNewestVersionOfARecordIsTheRunWhenNoneWasSent() async {
        let (r, sink) = scripted(hkRun("V1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin, sync: "g-78", version: 1),
                                 hkRun("V2", "2026-11-17", "07:05", minutes: 30, meters: 5200, source: Src.garmin, sync: "g-78", version: 2))
        let ing = r.make(); await ing.start()
        XCTAssertEqual(sent(sink).map(\.activityId), ["V2"])
    }

    // 11. A crash between the send and the answer: same delivery id, one credit, the copy still never sent.
    func testACrashBetweenSendAndAnswerKeepsOneCredit() async throws {
        let (base, n) = try nodeRig("tp-die")
        let store = MemoryStore(); let r = Rig(sink: n, store: store); _ = base
        r.reader.add(hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin),
                     hkRun("S1", "2026-11-17", "07:00", seconds: 5, minutes: 39.9, meters: 6990, source: Src.strava))
        let ing = r.make(); await ing.setDying(); await ing.start()
        let restarted = r.make(); await restarted.start()
        XCTAssertEqual(n.sent.count, 2); XCTAssertEqual(n.sent[0].deliveryId, n.sent[1].deliveryId); XCTAssertEqual(n.sent[0].activities, n.sent[1].activities)
        XCTAssertEqual(n.sent.flatMap(\.activities).map(\.activityId), ["G1", "G1"])
        XCTAssertEqual(try n.deviceRows().count, 1, "no double credit")
        let c = await restarted.counts(); XCTAssertEqual(c.delivered, 1); XCTAssertEqual(c.consolidated, 1)
    }

    // 12. A restart keeps every dedupe index: a copy arriving after a relaunch is consolidated, not sent.
    func testARestartKeepsTheDedupeIndexes() async throws {
        let (base, n) = try nodeRig("tp-restart"); _ = base
        let store = MemoryStore(); let r = Rig(sink: n, store: store)
        r.reader.add(hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin))
        let ing = r.make(); await ing.start()
        // The same Apple Health history, one workout later (the stored anchor points past G1).
        let later = ScriptedReader(); later.add(hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin),
                                                hkRun("S1", "2026-11-17", "07:00", seconds: 5, minutes: 39.9, meters: 6990, source: Src.strava))
        let relaunched = r.make(reader: later); await relaunched.start()
        XCTAssertEqual(try n.deviceRows().count, 1); XCTAssertEqual(n.sent.count, 1)
        let c = await relaunched.counts(); XCTAssertEqual(c.consolidated, 1)
        let runs = await relaunched.importedRuns(since: .distantPast)
        XCTAssertEqual(runs.first { $0.id == "G1" }?.origin, .garmin, "provenance survives the relaunch")
    }

    func testAPolicyOneFileIsMigratedAndItsThirdPartyRunsAreReadAgain() async throws {
        // A queue file written under policy 1: two Garmin runs excluded THIRD_PARTY_SOURCE, the anchor past them.
        let store = MemoryStore(); let sink = ScriptedSink(context: .ready(Self.plan)); let r = Rig(sink: sink, store: store)
        let g1 = hkRun("G1", "2026-11-17", "07:00", minutes: 40, source: Src.garmin), g2 = hkRun("G2", "2026-11-19", "07:00", minutes: 30, source: Src.garmin)
        r.reader.add(g1, g2)
        var old = QueueState(); old.anchor = Data("2".utf8); old.anchorStartDay = "2026-11-14"
        old.excluded = ["G1": "THIRD_PARTY_SOURCE", "G2": "THIRD_PARTY_SOURCE", "ST": "STRENGTH_NOT_DEVICE_CHANNEL"]
        var json = try JSONSerialization.jsonObject(with: JSONEncoder().encode(old)) as! [String: Any]
        json.removeValue(forKey: "selectionPolicy"); json.removeValue(forKey: "rescanIds"); json.removeValue(forKey: "enteredRuns")
        try store.save(JSONSerialization.data(withJSONObject: json))
        r.reader.delete("G2")                                         // deleted since the last read: must not come back
        let ing = r.make(); await ing.start()
        XCTAssertEqual(sent(sink).map(\.activityId), ["G1"])
        let c = await ing.counts(); XCTAssertEqual(c.excluded, ["STRENGTH_NOT_DEVICE_CHANNEL": 1])
        XCTAssertTrue(r.log.lines.contains("hki.policyMigrated rescan=2"), "\(r.log.lines)")
        let reads = r.reader.reads; await ing.readNow()
        XCTAssertEqual(r.reader.reads, reads + 1, "the rescan happens once"); XCTAssertEqual(sent(sink).count, 1)
    }

    func testAPolicyOneFileWithNoAnchorReadsEverythingOnce() async throws {
        let store = MemoryStore(); let sink = ScriptedSink(context: .ready(Self.plan)); let r = Rig(sink: sink, store: store)
        r.reader.add(hkRun("G1", "2026-11-17", "07:00", minutes: 40, source: Src.garmin))
        var old = QueueState(); old.excluded = ["G1": "THIRD_PARTY_SOURCE"]
        var json = try JSONSerialization.jsonObject(with: JSONEncoder().encode(old)) as! [String: Any]
        json.removeValue(forKey: "selectionPolicy"); try store.save(JSONSerialization.data(withJSONObject: json))
        let ing = r.make(); await ing.start()
        XCTAssertEqual(sent(sink).map(\.activityId), ["G1"]); XCTAssertEqual(r.reader.reads, 1, "no anchor: the one full read is the rescan")
        let disk = try JSONDecoder().decode(QueueState.self, from: XCTUnwrap(store.data))
        XCTAssertEqual(disk.selectionPolicy, 2); XCTAssertEqual(disk.rescanIds, [])
    }

    // 13. A run without a distance: delivered with no distance (never 0), partial; in a pair, the copy with a distance is the run.
    func testARunWithoutDistance() async {
        let (r, sink) = scripted(hkRun("N1", "2026-11-17", "07:00", minutes: 30, meters: nil, route: false, source: Src.coros, name: "Other app"))
        let ing = r.make(); await ing.start()
        let a = sent(sink).first
        XCTAssertNil(a?.actual.distanceKm); XCTAssertNil(a?.actual.measurement); XCTAssertEqual(a?.sourceQuality, .wearablePartial)
        let rec = await ing.importedRuns(since: .distantPast).first
        XCTAssertNil(rec?.distanceKm); XCTAssertFalse(rec?.hasRoute ?? true); XCTAssertEqual(rec?.completeness, .wearablePartial); XCTAssertEqual(rec?.origin, .otherApp)

        let (r2, sink2) = scripted(hkRun("P", "2026-11-19", "07:00", minutes: 30, meters: nil, route: false, source: Src.garmin),
                                   hkRun("F", "2026-11-19", "07:00", seconds: 20, minutes: 30, meters: 5000, source: Src.strava))
        let ing2 = r2.make(); await ing2.start()
        XCTAssertEqual(sent(sink2).map(\.activityId), ["F"], "an unknown distance never disagrees; the more complete copy is the run")
    }

    // 14. A manual entry (any app) keeps its provenance and its own policy: history only, never the engine, never a dedupe partner.
    func testAManualEntryIsTheAthletesStatement() async {
        let (r, sink) = scripted(hkRun("M1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.strava, name: "Strava", userEntered: true),
                                 hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin))
        let ing = r.make(); await ing.start()
        XCTAssertEqual(sent(sink).map(\.activityId), ["G1"], "the measured run goes; the typed one never does and never blocks it")
        let c = await ing.counts(); XCTAssertEqual(c.excluded, ["USER_ENTERED": 1]); XCTAssertEqual(c.consolidated, 0)
        let m = await ing.importedRuns(since: .distantPast).first { $0.id == "M1" }
        XCTAssertEqual(m?.status, .notForEngine); XCTAssertEqual(m?.statusCode, "USER_ENTERED"); XCTAssertEqual(m?.origin, .strava)
        XCTAssertNil(m?.distanceKm, "a typed distance is not a measurement"); XCTAssertNil(m?.completeness); XCTAssertEqual(m?.minutes, 40)
        r.reader.delete("M1"); await ing.readNow()
        let left = await ing.importedRuns(since: .distantPast).map(\.id); XCTAssertEqual(left, ["G1"])
        try? await ing.purge(.accountErased)
        let none = await ing.importedRuns(since: .distantPast); XCTAssertTrue(none.isEmpty, "erased by purge (G07)")
    }

    /// Logs: counts and codes only, never a source, a name, a date or a distance.
    func testLogsNameNoSourceAndNoValue() async {
        let (r, _) = scripted(hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin, name: "Garmin Connect"),
                              hkRun("S1", "2026-11-17", "07:00", seconds: 5, minutes: 39.9, meters: 6990, source: Src.strava, name: "Strava"))
        let ing = r.make(); await ing.start()
        let text = r.log.lines.joined(separator: "\n")
        for banned in ["garmin", "Garmin", "strava", "Strava", "39.9", "2026-11", "G1", "S1", "km"] { XCTAssertFalse(text.contains(banned), banned) }
        XCTAssertTrue(text.contains("consolidated=1"), text)
    }
}
