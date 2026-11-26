import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// Handoff original §7 items 1–2: normalization table → exact JSON, determinism, omitted fields, exclusions with their reason, and the frozen
/// admission + voice guard accepting every output.
final class NormalizationTests: XCTestCase {
    static func json(_ a: DeviceActivity) throws -> String {
        let e = JSONEncoder(); e.outputFormatting = [.sortedKeys]
        return String(data: try e.encode(a), encoding: .utf8)!
    }
    static let end = at("2026-11-17", "07:45")

    /// The table: synthetic HealthKit workouts → the exact bytes B sends (session link decided later, so absent here).
    static let table: [(String, WorkoutSnapshot, String)] = [
        ("outdoor, route, distance, zone metadata",
         workout("A1", end: end, minutes: 31.5, meters: 5012.4),
         #"{"activityId":"A1","activityType":"RUN","actual":{"completed":true,"distanceKm":5.012,"measurement":"GPS","minutes":31.5},"observedAt":"2026-11-17T07:45:00-03:00","sourceQuality":"WEARABLE_FULL"}"#),
        ("no zone metadata: UTC, never the device zone",
         workout("A2", end: end, minutes: 40, meters: 7060, tz: nil),
         #"{"activityId":"A2","activityType":"RUN","actual":{"completed":true,"distanceKm":7.06,"measurement":"GPS","minutes":40},"observedAt":"2026-11-17T10:45:00Z","sourceQuality":"WEARABLE_FULL"}"#),
        ("indoor: TREADMILL (PROVISIONAL, OPEN-2)",
         workout("A3", end: end, minutes: 25, meters: 4000, route: false, indoor: true),
         #"{"activityId":"A3","activityType":"RUN","actual":{"completed":true,"distanceKm":4,"measurement":"TREADMILL","minutes":25},"observedAt":"2026-11-17T07:45:00-03:00","sourceQuality":"WEARABLE_FULL"}"#),
        ("no route, distance only: measurement omitted, PARTIAL",
         workout("A4", end: end, minutes: 20, meters: 3333.3, route: false),
         #"{"activityId":"A4","activityType":"RUN","actual":{"completed":true,"distanceKm":3.333,"minutes":20},"observedAt":"2026-11-17T07:45:00-03:00","sourceQuality":"WEARABLE_PARTIAL"}"#),
        ("no distance: distanceKm omitted (never 0), PARTIAL",
         workout("A5", end: end, minutes: 12.346, meters: nil),
         #"{"activityId":"A5","activityType":"RUN","actual":{"completed":true,"measurement":"GPS","minutes":12.35},"observedAt":"2026-11-17T07:45:00-03:00","sourceQuality":"WEARABLE_PARTIAL"}"#),
        ("zero distance and zero duration: both omitted",
         workout("A6", end: end, minutes: 0, meters: 0, route: false),
         #"{"activityId":"A6","activityType":"RUN","actual":{"completed":true},"observedAt":"2026-11-17T07:45:00-03:00","sourceQuality":"WEARABLE_PARTIAL"}"#),
        ("another zone in the metadata (travel): its own offset",
         workout("A7", end: end, minutes: 30, meters: 5000, tz: "Asia/Kathmandu"),
         #"{"activityId":"A7","activityType":"RUN","actual":{"completed":true,"distanceKm":5,"measurement":"GPS","minutes":30},"observedAt":"2026-11-17T16:30:00+05:45","sourceQuality":"WEARABLE_FULL"}"#),
    ]

    func testTableGivesExactBytes() throws {
        for (name, w, want) in Self.table {
            XCTAssertEqual(WorkoutNormalizer.select(w), .device, name)
            XCTAssertEqual(try Self.json(WorkoutNormalizer.activity(w)), want, name)
        }
    }

    func testDeterministicAndIndependentOfTheDeviceZone() throws {
        let first = try Self.table.map { try Self.json(WorkoutNormalizer.activity($0.1)) }
        let saved = NSTimeZone.default
        defer { NSTimeZone.default = saved }
        for zone in ["Pacific/Auckland", "America/Los_Angeles", "UTC", "Asia/Tokyo"] {
            NSTimeZone.default = TimeZone(identifier: zone)!
            XCTAssertEqual(try Self.table.map { try Self.json(WorkoutNormalizer.activity($0.1)) }, first, "device zone \(zone) changed the bytes")
        }
    }

    func testExclusionsCarryTheirReason() {
        let end = Self.end
        XCTAssertEqual(WorkoutNormalizer.select(workout("x", end: end, userEntered: true)), .excludedRun(reason: "USER_ENTERED"))
        // OPEN-1 policy 2: another app's measured run is a run like any other.
        XCTAssertEqual(WorkoutNormalizer.select(workout("x", end: end, source: "com.strava.stravaride")), .device)
        XCTAssertEqual(WorkoutNormalizer.select(workout("x", end: end, source: "com.garmin.connect.mobile")), .device)
        XCTAssertEqual(WorkoutNormalizer.select(workout("x", end: end, userEntered: true, source: "com.garmin.connect.mobile")), .excludedRun(reason: "USER_ENTERED"))
        XCTAssertEqual(WorkoutNormalizer.select(workout("x", end: end, type: WorkoutKind.traditionalStrengthTraining)), .nonRun(reason: "STRENGTH_NOT_DEVICE_CHANNEL"))
        XCTAssertEqual(WorkoutNormalizer.select(workout("x", end: end, type: WorkoutKind.functionalStrengthTraining)), .nonRun(reason: "STRENGTH_NOT_DEVICE_CHANNEL"))
        XCTAssertEqual(WorkoutNormalizer.select(workout("x", end: end, type: 52)), .nonRun(reason: "NON_RUN_WORKOUT"), "walking is not a run")
        XCTAssertEqual(WorkoutNormalizer.select(workout("x", end: end, source: "com.apple.health")), .device)
        // A non-run summary carries duration and provenance only (G-4, GAP-18).
        let s = WorkoutNormalizer.summary(workout("S1", end: end, minutes: 45, type: WorkoutKind.traditionalStrengthTraining, sourceName: "Strong"))
        XCTAssertEqual(s.activityKind, "TRADITIONAL_STRENGTH_TRAINING"); XCTAssertEqual(s.durationSeconds, 2700); XCTAssertEqual(s.sourceName, "Strong")
        XCTAssertEqual(WorkoutKind.code(9999), "HK_ACTIVITY_9999", "an unknown type is never guessed")
    }

    func testDigestLeavesSourceQualityOut() {
        var a = WorkoutNormalizer.activity(workout("D", end: Self.end))
        let d = WorkoutNormalizer.digest(a)
        a.sourceQuality = .wearablePartial
        XCTAssertEqual(WorkoutNormalizer.digest(a), d, "a change of sourceQuality alone is not a change of facts (boundary factsDigest)")
        a.actual.minutes = 31
        XCTAssertNotEqual(WorkoutNormalizer.digest(a), d)
    }

    /// Item 2: every normalized output (linked and unlinked) passes the frozen `observationError('DEVICE')` and `checkReportVoice('DEVICE')`.
    func testFrozenAdmissionAcceptsEveryOutput() throws {
        var outputs = Self.table.map { WorkoutNormalizer.activity($0.1) }
        outputs += outputs.map { var a = $0; a.sessionId = "w0-run-d1"; a.activityId += "-L"; return a }
        let json = String(data: try JSONEncoder().encode(outputs), encoding: .utf8)!
        let src = Repo.url("CoachingCore/src/boundary")
        let script = """
        const {observationError,requestError}=await import(\(String(reflecting: src.appendingPathComponent("admission.mjs").absoluteString)));
        const {checkReportVoice}=await import(\(String(reflecting: src.appendingPathComponent("report-voices.mjs").absoluteString)));
        const list=JSON.parse(process.argv[2]);const out=[];
        const r=requestError({kind:'WEEKLY_REVIEW',observations:list},{observations:list});if(r)out.push({request:r});
        list.forEach((o,i)=>{const e=observationError('DEVICE',o,i);if(e)out.push(e);
          const {activityId,activityType,sourceQuality,...rest}=o;
          const v=checkReportVoice('DEVICE',{...rest,source:{provider:'HEALTHKIT',activityId,quality:sourceQuality??'WEARABLE_FULL'},canonicalActivityId:activityId,reportedAt:'2026-11-24T12:00:00Z'});
          if(!v.ok)out.push({index:i,voice:v});});
        console.log(JSON.stringify({n:list.length,errors:out}));
        """
        let r = try runNode(script, args: [json]) as! [String: Any]
        XCTAssertEqual(r["n"] as? Int, outputs.count)
        XCTAssertEqual((r["errors"] as! [Any]).count, 0, "\(r)")
    }
}
