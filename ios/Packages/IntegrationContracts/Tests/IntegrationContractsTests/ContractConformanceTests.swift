import XCTest
@testable import IntegrationContracts

// Conformance of the shared contract with the FROZEN sources it is derived from. The tests read the bytes of the repository's frozen
// CoachingCore (admission.mjs, report-voices.mjs, RUN_FORMATS_V1.json): if a value here drifts from them, the test fails, so the contract
// can never silently invent a format. The Node test runs the frozen admission and voice guard over what Swift encodes.
final class ContractConformanceTests: XCTestCase {
    /// <repo>/ios/Packages/IntegrationContracts/Tests/IntegrationContractsTests/<this file>
    static let repo = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
    static func source(_ rel: String) throws -> String { try String(contentsOf: repo.appendingPathComponent(rel), encoding: .utf8) }
    static let admission = "CoachingCore/src/boundary/admission.mjs"

    /// The string list of `NAME` frozen in a JS source: `NAME:Object.freeze([...])` or `NAME=Object.freeze([...])`.
    static func jsList(_ text: String, _ name: String) throws -> [String] {
        let re = try NSRegularExpression(pattern: "\\b\(name)\\s*[:=]\\s*Object\\.freeze\\(\\[([^\\]]*)\\]\\)")
        guard let m = re.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)), let r = Range(m.range(at: 1), in: text) else {
            throw XCTSkip("\(name) not found")
        }
        return text[r].split(separator: ",").map { $0.trimmingCharacters(in: CharacterSet(charactersIn: " '\"\n")) }.filter { !$0.isEmpty }
    }
    static func jsInt(_ text: String, _ name: String) throws -> Int {
        let re = try NSRegularExpression(pattern: "\\b\(name):(\\d+)")
        guard let m = re.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)), let r = Range(m.range(at: 1), in: text) else {
            throw XCTSkip("\(name) not found")
        }
        return Int(text[r])!
    }
    static func encode(_ v: some Encodable) throws -> [String: Any] {
        try JSONSerialization.jsonObject(with: JSONEncoder().encode(v)) as! [String: Any]
    }

    static let sample = DeviceActivity(activityId: "6F1C2B9E-2B1D-4C77-9E57-1D2A3B4C5D6E", sessionId: "w0-run-d1",
                                       observedAt: "2026-11-24T07:45:00-03:00",
                                       actual: DeviceActual(completed: true, minutes: 31.5, distanceKm: 5.012, measurement: .gps, gpsQuality: .ok),
                                       sourceQuality: .wearableFull)

    func testDeviceKeysAreAdmissionDeviceKeys() throws {
        let text = try Self.source(Self.admission)
        let device = try Self.jsList(text, "DEVICE")
        XCTAssertEqual(device, ["activityId", "activityType", "sessionId", "observedAt", "actual", "sourceQuality"])
        let all = try Self.encode(Self.sample)
        XCTAssertEqual(Set(all.keys), Set(device), "a fully populated DeviceActivity states exactly the DEVICE keys")
        let owned = Set(try Self.jsList(text, "BOUNDARY_OWNED"))
        XCTAssertTrue(owned.isDisjoint(with: all.keys))
        XCTAssertTrue(owned.isDisjoint(with: (all["actual"] as! [String: Any]).keys))
    }

    func testEnumerationsAreTheFrozenOnes() throws {
        let text = try Self.source(Self.admission)
        XCTAssertEqual(DeviceSourceQuality.allCases.map(\.rawValue), try Self.jsList(text, "DEVICE_QUALITIES"))
        XCTAssertEqual(DeviceActivityType.allCases.map(\.rawValue), try Self.jsList(text, "DEVICE_ACTIVITY_TYPES"))
        let formats = try JSONSerialization.jsonObject(with: Data(Self.source("CoachingCore/v1/RUN_FORMATS_V1.json").utf8)) as! [String: Any]
        let facts = formats["runFacts"] as! [String: Any]
        XCTAssertEqual(DeviceMeasurement.allCases.map(\.rawValue), facts["measuredSources"] as! [String])
        XCTAssertEqual(DeviceGPSQuality.allCases.map(\.rawValue), facts["quality"] as! [String])
    }

    func testActualCarriesNoAthleteOnlyFact() throws {
        let voices = try Self.source("CoachingCore/src/boundary/report-voices.mjs")
        let athleteOnly = Set(try Self.jsList(voices, "ATHLETE_ONLY"))
        let actual = try Self.encode(Self.sample.actual)
        XCTAssertTrue(athleteOnly.isDisjoint(with: actual.keys))
        XCTAssertEqual(Set(actual.keys), ["completed", "minutes", "distanceKm", "measurement", "gpsQuality"])
        // Missing stays missing (DR-118): nil fields are absent, never 0 or null.
        let bare = try Self.encode(DeviceActual(completed: true))
        XCTAssertEqual(Set(bare.keys), ["completed"])
        let unlinked = try Self.encode(Self.sample.unlinked())
        XCTAssertNil(unlinked["sessionId"])
    }

    func testDeliveryBoundsAreAdmissionLimits() throws {
        let text = try Self.source(Self.admission)
        XCTAssertEqual(DeliveryLimits.activitiesPerDelivery, try Self.jsInt(text, "observationsPerRequest"))
        XCTAssertEqual(DeliveryLimits.idLength, try Self.jsInt(text, "idLength"))
        let a = Self.sample
        func many(_ n: Int) -> [DeviceActivity] { (0..<n).map { i in var x = a; x.activityId = "hk-\(i)"; return x } }
        XCTAssertNoThrow(try DeviceDelivery(deliveryId: "d-1", activities: many(32)))
        XCTAssertThrowsError(try DeviceDelivery(deliveryId: "d-1", activities: many(33))) { XCTAssertEqual($0 as? DeviceDelivery.Invalid, .tooMany(33)) }
        XCTAssertThrowsError(try DeviceDelivery(deliveryId: "d-1", activities: [])) { XCTAssertEqual($0 as? DeviceDelivery.Invalid, .empty) }
        XCTAssertThrowsError(try DeviceDelivery(deliveryId: String(repeating: "x", count: 129), activities: [a]))
        XCTAssertThrowsError(try DeviceDelivery(deliveryId: "d\u{1}", activities: [a]))
        XCTAssertThrowsError(try DeviceDelivery(deliveryId: "d-1", activities: [a, a])) {
            XCTAssertEqual($0 as? DeviceDelivery.Invalid, .duplicateActivity(a.activityId))
        }
    }

    func testInstantMatchesAdmissionFormat() throws {
        // admission.mjs instantOk, copied as the source states it; the test fails if the source changes it.
        let text = try Self.source(Self.admission)
        XCTAssertTrue(text.contains(#"/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/"#))
        let re = try NSRegularExpression(pattern: #"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$"#)
        let d = Date(timeIntervalSince1970: 1_795_000_000) // 2026-11-18T11:06:40Z
        for (off, want) in [(-3 * 3600, "2026-11-18T08:06:40-03:00"), (0, "2026-11-18T11:06:40Z"), (5 * 3600 + 2700, "2026-11-18T16:51:40+05:45")] {
            let s = BoundaryInstant.string(d, offsetSeconds: off)
            XCTAssertEqual(s, want)
            XCTAssertNotNil(re.firstMatch(in: s, range: NSRange(s.startIndex..., in: s)), s)
        }
        XCTAssertEqual(BoundaryInstant.day(Date(timeIntervalSince1970: 1_795_000_000 - 9 * 3600), offsetMinutes: -180), "2026-11-17")
        XCTAssertEqual(BoundaryInstant.day(Date(timeIntervalSince1970: 1_795_000_000 - 9 * 3600), offsetMinutes: 0), "2026-11-18")
        XCTAssertEqual(BoundaryInstant.day(Date(timeIntervalSince1970: 1_795_000_000), offsetMinutes: 600), "2026-11-18")
    }

    func testDispositionCoversEveryBoundaryCode() throws {
        // Every failure code the frozen boundary can answer is classified on purpose; an unknown one halts (fail closed).
        let codes = ["ACTIVITY_LINKED_ELSEWHERE", "BEFORE_RECORD_START", "BOUNDARY_OWNED_FIELD", "BUSY", "CONFLICT_IDEMPOTENCY_KEY",
                     "CONFLICT_STALE_VERSION", "CONSENT_REQUIRED", "CORRECTION_ACTIVITY_MISMATCH", "CORRECTION_OF_REPLACED",
                     "CORRECTION_SESSION_MISMATCH", "CROSS_AUTHOR_CORRECTION", "DUPLICATE_IN_REQUEST", "ENGINE_CONTRACT_VIOLATION", "FORBIDDEN",
                     "GONE", "INTEGRITY_FAILURE", "INVALID_IDENTIFIER", "INVALID_OBSERVATION", "INVALID_REQUEST", "INVALID_TIME", "LIMIT_EXCEEDED",
                     "NOT_ENROLLED", "NOTHING_TO_IMPORT", "OPERATIONAL_ERROR", "SCREEN_REQUIRED", "SPORT_MISMATCH", "SYNTHETIC_ONLY",
                     "UNAUTHENTICATED", "UNKNOWN_CHANNEL", "UNKNOWN_FIELD", "UNKNOWN_SESSION", "UNSUPPORTED_ACTIVITY", "RECORD_LOST",
                     "RECORD_ROLLED_BACK", "PERSISTENCE_FAILURE", "CLOCK_BEHIND_RECORD", "REQUEST_ID_REUSED", "CORRECTION_TARGET_NOT_FOUND",
                     "REPORT_VOICE_MIXED", "CORRECTION_ORIGIN_UNKNOWN"]
        let want: [String: BoundaryDisposition] = [
            "BEFORE_RECORD_START": .setAsideItem, "UNKNOWN_SESSION": .resendUnlinked, "SPORT_MISMATCH": .resendUnlinked,
            "SCREEN_REQUIRED": .waiting, "CLOCK_BEHIND_RECORD": .waiting, HostCode.clockAheadOfReference: .waiting, "CONSENT_REQUIRED": .waiting, "NOT_ENROLLED": .waiting,
            "BUSY": .retryLater, "PERSISTENCE_FAILURE": .retryLater, "OPERATIONAL_ERROR": .retryLater,
            "RECORD_LOST": .halted, "RECORD_ROLLED_BACK": .halted, "INTEGRITY_FAILURE": .halted, "SYNTHETIC_ONLY": .halted,
            "CONFLICT_IDEMPOTENCY_KEY": .halted, "CONFLICT_STALE_VERSION": .halted, "REQUEST_ID_REUSED": .halted,
            "CORRECTION_ORIGIN_UNKNOWN": .halted, "NOTHING_TO_IMPORT": .adapterBug, "INVALID_REQUEST": .adapterBug]
        for c in codes { if let w = want[c] { XCTAssertEqual(BoundaryDisposition.of(code: c), w, c) } }
        XCTAssertEqual(BoundaryDisposition.of(code: "SOMETHING_NEW"), .halted)
        XCTAssertEqual(BoundaryDisposition.of(code: "LIMIT_EXCEEDED", index: 3), .setAsideItem)
        XCTAssertEqual(BoundaryDisposition.of(code: "LIMIT_EXCEEDED", index: nil), .adapterBug)
        XCTAssertEqual(BoundaryDisposition.of(code: "UNKNOWN_SESSION", index: nil), .adapterBug)
        XCTAssertFalse(ActivityOutcome.notRecorded(reason: "NOT_RECORDED_BY_THIS_DECISION").leavesQueue)
        XCTAssertTrue(ActivityOutcome.recorded(eventId: "e").leavesQueue)
        XCTAssertTrue(ActivityOutcome.duplicate.leavesQueue)
    }

    /// The frozen admission (`observationError('DEVICE', …)`) and voice guard (`checkReportVoice('DEVICE', …)`, over the report the
    /// boundary builds: source HEALTHKIT + canonicalActivityId) accept what Swift encodes. Skipped when Node is not installed.
    #if os(macOS)
    func testFrozenAdmissionAcceptsSwiftEncoding() throws {
        let variants = [Self.sample, Self.sample.unlinked(),
                        DeviceActivity(activityId: "hk-bare", observedAt: "2026-11-24T10:00:00Z", actual: DeviceActual(completed: true)),
                        DeviceActivity(activityId: "hk-tm", observedAt: "2026-11-24T10:00:00+01:00",
                                       actual: DeviceActual(completed: true, minutes: 40, distanceKm: 8, measurement: .treadmill),
                                       sourceQuality: .wearablePartial)]
        let json = String(data: try JSONEncoder().encode(variants), encoding: .utf8)!
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("ic-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: dir) }
        let input = dir.appendingPathComponent("in.json"); try Data(json.utf8).write(to: input)
        let src = Self.repo.appendingPathComponent("CoachingCore/src/boundary")
        let script = """
        import fs from 'node:fs';
        const {observationError,requestError}=await import(\(String(reflecting: src.appendingPathComponent("admission.mjs").absoluteString)));
        const {checkReportVoice}=await import(\(String(reflecting: src.appendingPathComponent("report-voices.mjs").absoluteString)));
        const list=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const out=[];
        const r=requestError({kind:'WEEKLY_REVIEW',observations:list},{observations:list});if(r)out.push({request:r});
        list.forEach((o,i)=>{const e=observationError('DEVICE',o,i);if(e)out.push(e);
          const {activityId,activityType,sourceQuality,...rest}=o;
          const v=checkReportVoice('DEVICE',{...rest,source:{provider:'HEALTHKIT',activityId,quality:sourceQuality??'WEARABLE_FULL'},canonicalActivityId:activityId,reportedAt:'2026-11-24T12:00:00Z'});
          if(!v.ok)out.push({index:i,voice:v});});
        // A form field on the device channel must be refused (the guard is live, not vacuous).
        const bad=observationError('DEVICE',{...list[0],response:{effort:'HARDER'}},0),badVoice=checkReportVoice('DEVICE',{...list[0],actual:{...list[0].actual,rpe:5},source:{provider:'HEALTHKIT',activityId:list[0].activityId},canonicalActivityId:list[0].activityId});
        console.log(JSON.stringify({errors:out,refusesForm:bad?.code==='UNKNOWN_FIELD',refusesRpe:badVoice.ok===false}));
        """
        let scriptURL = dir.appendingPathComponent("check.mjs"); try Data(script.utf8).write(to: scriptURL)
        // Node from PATH (fnm, Homebrew or system); exit 127 from env means it is not installed, and the test is skipped.
        let p = Process(); p.executableURL = URL(fileURLWithPath: "/usr/bin/env"); p.arguments = ["node", scriptURL.path, input.path]
        let pipe = Pipe(); p.standardOutput = pipe; p.standardError = pipe
        try p.run(); p.waitUntilExit()
        let out = String(data: pipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        if p.terminationStatus == 127 { throw XCTSkip("node not installed") }
        XCTAssertEqual(p.terminationStatus, 0, out)
        let res = try JSONSerialization.jsonObject(with: Data(out.split(separator: "\n").last.map(String.init)?.utf8 ?? "".utf8)) as! [String: Any]
        XCTAssertEqual((res["errors"] as! [Any]).count, 0, out)
        XCTAssertEqual(res["refusesForm"] as? Bool, true, out)
        XCTAssertEqual(res["refusesRpe"] as? Bool, true, out)
    }
    #endif
}
