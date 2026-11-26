import XCTest
@testable import IntegrationContracts

/// The ABC consolidation's additive contracts (B → C status and imports, the heart-rate series for the engine's classifier, display-only signals,
/// the app recording index and its dedupe rule). The seven original conformance tests are untouched.
final class AdditiveContractTests: XCTestCase {
    func testHeartRateSeriesIsValidatedNeverRepaired() throws {
        let ok = try HeartRateSeries(activityId: "hk-1", sensor: .chestStrap, source: "synthetic", durationSeconds: 60, samples: [.init(t: 0, bpm: 120), .init(t: 30, bpm: 150.4)])
        XCTAssertEqual(ok.samples.count, 2)
        XCTAssertThrowsError(try HeartRateSeries(activityId: "hk", sensor: .optical, source: nil, durationSeconds: 60, samples: [])) { XCTAssertEqual($0 as? HeartRateSeries.Invalid, .empty) }
        XCTAssertThrowsError(try HeartRateSeries(activityId: "hk", sensor: .optical, source: nil, durationSeconds: 60, samples: [.init(t: 10, bpm: 1), .init(t: 5, bpm: 1)])) { XCTAssertEqual($0 as? HeartRateSeries.Invalid, .outOfOrder(1)) }
        XCTAssertThrowsError(try HeartRateSeries(activityId: "hk", sensor: .optical, source: nil, durationSeconds: 60, samples: [.init(t: 61, bpm: 1)])) { XCTAssertEqual($0 as? HeartRateSeries.Invalid, .outsideWorkout(0)) }
        XCTAssertThrowsError(try HeartRateSeries(activityId: "hk", sensor: .optical, source: nil, durationSeconds: 60, samples: [.init(t: 0, bpm: .nan)])) { XCTAssertEqual($0 as? HeartRateSeries.Invalid, .notFinite(0)) }
        XCTAssertEqual(HeartRateSensorClass.allCases.map(\.rawValue), ["CHEST_STRAP", "ECG", "OPTICAL", "UNKNOWN"])
    }

    func testRecordingDedupeCountsARunOnce() {
        let t0 = Date(timeIntervalSince1970: 1_795_000_000)
        let rec = { (sid: String?, ev: String?) in AppRecordedRunRef(id: "rec-1", sessionId: sid, start: t0, end: t0 + 1800, reportedEventId: ev) }
        let watch = DateInterval(start: t0 + 60, end: t0 + 1830)
        XCTAssertEqual(RecordingDedupe.decision(workout: watch, recordings: []), .deliverByNormalRule)
        XCTAssertEqual(RecordingDedupe.decision(workout: watch, recordings: [rec("w0-run-d1", "ob_1")]), .deliverLinked(sessionId: "w0-run-d1"))
        XCTAssertEqual(RecordingDedupe.decision(workout: watch, recordings: [rec(nil, "ob_1")]), .setAside(code: "OVERLAPS_APP_RECORDING"))
        XCTAssertEqual(RecordingDedupe.decision(workout: watch, recordings: [rec("w0-run-d1", nil)]), .holdUntilRecordingSettles(recordingId: "rec-1"), "not yet reported: waits, never lost")
        XCTAssertEqual(RecordingDedupe.decision(workout: watch, recordings: [rec(nil, nil)]), .holdUntilRecordingSettles(recordingId: "rec-1"))
        let later = DateInterval(start: t0 + 1500, end: t0 + 4000)
        XCTAssertEqual(RecordingDedupe.decision(workout: later, recordings: [rec(nil, "ob_1")]), .deliverByNormalRule, "300 s of 1800 overlap: a different run")
        // SSCTR-ABC-S4 c: a 5-minute accidental app recording inside a 60-minute watch run never sets the watch run aside.
        let short = AppRecordedRunRef(id: "rec-2", sessionId: nil, start: t0 + 600, end: t0 + 900, reportedEventId: "ob_2")
        XCTAssertEqual(RecordingDedupe.decision(workout: DateInterval(start: t0, end: t0 + 3600), recordings: [short]), .deliverByNormalRule)
        XCTAssertFalse(RecordingDedupe.sameRun(DateInterval(start: t0, end: t0 + 100), DateInterval(start: t0 + 50, end: t0 + 1000)))
        XCTAssertTrue(RecordingDedupe.sameRun(DateInterval(start: t0, end: t0 + 1000), DateInterval(start: t0 + 50, end: t0 + 1000)))
        XCTAssertFalse(RecordingDedupe.sameRun(DateInterval(start: t0, end: t0 + 100), DateInterval(start: t0 + 100, end: t0 + 200)))
        // A recording reference carries no coordinate, distance, pace or route: only identity and interval.
        let keys = Set(((try? JSONSerialization.jsonObject(with: JSONEncoder().encode(rec(nil, nil)))) as? [String: Any] ?? [:]).keys)
        XCTAssertTrue(keys.isSubset(of: ["id", "sessionId", "start", "end", "reportedEventId"]), "\(keys)")
    }

    /// The series B builds is the engine classifier's input: the frozen `classifySamples` reads it as is (over the engine's zones for a 30-year-old).
    #if os(macOS)
    func testEngineClassifierReadsTheSeriesAsEncoded() throws {
        let samples = (0...120).map { HeartRateSample(t: Double($0 * 15), bpm: $0 < 60 ? 120 : 175) }
        let series = try HeartRateSeries(activityId: "hk-1", sensor: .chestStrap, source: "synthetic", durationSeconds: 1800, samples: samples)
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("ic-hr-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true); defer { try? FileManager.default.removeItem(at: dir) }
        let input = dir.appendingPathComponent("series.json"); try JSONEncoder().encode(series).write(to: input)
        let zonesModule = ContractConformanceTests.repo.appendingPathComponent("CoachingCore/src/v1-heart-rate-zones.mjs").absoluteString
        let script = """
        import fs from 'node:fs';const {classifySamples}=await import(\(String(reflecting: zonesModule)));
        const s=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
        // QRE-ABC-08: the zones are the engine's own answer for a 30-year-old (a captured fixture), never a table written here.
        const zones=JSON.parse(fs.readFileSync(\(String(reflecting: ContractConformanceTests.repo.appendingPathComponent("ios/Packages/CoachingPresentation/Tests/CoachingPresentationTests/Fixtures/hr5r-age30-presentation.json").path)),'utf8')).readings.runCalibration.heartRateFiveZones.zones;
        console.log(JSON.stringify(classifySamples(zones,{sensor:s.sensor,source:s.source,samples:s.samples},{durationSeconds:s.durationSeconds})));
        """
        let scriptURL = dir.appendingPathComponent("c.mjs"); try Data(script.utf8).write(to: scriptURL)
        let p = Process(); p.executableURL = URL(fileURLWithPath: "/usr/bin/env"); p.arguments = ["node", scriptURL.path, input.path]
        let pipe = Pipe(); p.standardOutput = pipe; p.standardError = pipe; try p.run(); p.waitUntilExit()
        let out = String(data: pipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        if p.terminationStatus == 127 { throw XCTSkip("node not installed") }
        XCTAssertEqual(p.terminationStatus, 0, out)
        let r = try XCTUnwrap(try JSONSerialization.jsonObject(with: Data(out.split(separator: "\n").last!.utf8)) as? [String: Any])
        XCTAssertEqual(r["status"] as? String, "AVAILABLE", out)
        XCTAssertEqual(r["seconds"] as? [String: Double], ["Z1": 900, "Z2": 0, "Z3": 0, "Z4": 900, "Z5": 0], out)
        XCTAssertEqual(r["fromAverageHeartRate"] as? Bool, false)
    }
    #endif
}
