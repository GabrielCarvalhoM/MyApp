import XCTest
@testable import HealthKitIngest
import IntegrationContracts

// OPEN-1 policy 2: the same-run rule alone (pure, deterministic), moved out of ThirdPartyImportTests.swift (#48), with its exact limits.
// Everything is synthetic: the bundle ids are the apps' public identifiers, no workout here is real Apple Health data.

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

    /// #48 P3-4: every limit at its exact edge, on facts built directly (no normalization rounding in between), so a change to any part of
    /// the rule (the 3-min floor, the 10 % of the longer, the 60 s touching tolerance, the half-overlap rule) fails here.
    func testEveryLimitAtItsExactEdge() {
        func f(_ id: String, at offset: TimeInterval = 0, minutes m: Double, km: Double? = nil) -> SameRunRule.Facts {
            let s = t0.addingTimeInterval(offset)
            return .init(id: id, start: s, end: s.addingTimeInterval(m * 60), minutes: m, distanceKm: km, quality: .wearableFull,
                         sourceBundleId: Src.garmin, syncIdentifier: nil, syncVersion: nil, fixed: false)
        }
        let disagree = SameRunRule.Pair.inconclusive(code: IngestCode.reconcileMeasurementsDisagree)
        let partial = SameRunRule.Pair.inconclusive(code: IngestCode.reconcilePartialOverlap)
        // The 3-min floor: below 30 min, 10 % of the longer is under 3 min, and 3 min still agree.
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 10), f("b", minutes: 13)), .sameRun, "3 min apart on a 13-min run: the floor")
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 10), f("b", minutes: 13.01)), disagree)
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 7), f("b", minutes: 10)), .sameRun)
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 6.99), f("b", minutes: 10)), disagree)
        // Where the floor and the 10 % meet (a 30-min longer run): exactly 3 min.
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 27), f("b", minutes: 30)), .sameRun)
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 26.99), f("b", minutes: 30)), disagree)
        // Above it, 10 % of the LONGER: 30 vs 33.33 (3.33 ≤ 3.333) agrees, 30 vs 33.34 (3.34 > 3.334) does not.
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 30), f("b", minutes: 33.33)), .sameRun)
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 30), f("b", minutes: 33.34)), disagree)
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 60), f("b", minutes: 66.66)), .sameRun)
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 60), f("b", minutes: 66.67)), disagree)
        // Distance: 10 % of the longer, to the metre. 5.000 vs 5.555 agrees, 5.000 vs 5.556 does not; unknown never disagrees.
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 30, km: 5), f("b", minutes: 30, km: 5.555)), .sameRun)
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 30, km: 5), f("b", minutes: 30, km: 5.556)), disagree)
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 30, km: 5), f("b", minutes: 30)), .sameRun)
        // Touching: an overlap of exactly 60 s is two runs; 60.5 s is not.
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 30), f("b", at: 29 * 60, minutes: 20)), .twoRuns)
        XCTAssertEqual(SameRunRule.pair(f("a", minutes: 30), f("b", at: 29 * 60 - 0.5, minutes: 20)), partial)
        // Half of the longer: exactly half meets the shared sameRun rule (then 30 vs 60 min disagree); one second less does not.
        XCTAssertEqual(SameRunRule.pair(f("L", minutes: 60), f("S", at: 30 * 60, minutes: 30)), disagree)
        XCTAssertEqual(SameRunRule.pair(f("L", minutes: 60), f("S", at: 30 * 60 + 1, minutes: 30 - 1.0 / 60)), partial)
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

