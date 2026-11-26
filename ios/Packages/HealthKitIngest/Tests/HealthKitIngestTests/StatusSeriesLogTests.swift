import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// Handoff §7 items 1, 3 and 4: the ingest status (CHG-UI-3), the heart-rate series mapping (Simulator data shape, synthetic here), the
/// display-only signals, and the log canary.
final class StatusSeriesLogTests: XCTestCase {

    // MARK: status (CHG-UI-3)

    func testAnEmptyReadNeverClaimsADenial() async throws {
        let rig = Rig(sink: ScriptedSink()); let ing = rig.make()
        var st = await ing.status()
        XCTAssertEqual(st.authorization, .notRequested); XCTAssertFalse(st.disabledInApp)
        try await ing.requestAuthorization()
        st = await ing.status()
        XCTAssertEqual(st.authorization, .requested); XCTAssertEqual(rig.reader.authorizationRequests, 1)
        XCTAssertEqual(st.queued, 0); XCTAssertEqual(st.setAside, 0); XCTAssertEqual(st.receivedTypes, []); XCTAssertNil(st.lastReadError)
        XCTAssertNotNil(st.lastReadAt, "the read happened: it simply received nothing")
        XCTAssertNil(st.lastWorkoutReceivedAt)
        let text = "\(st)".uppercased()
        XCTAssertFalse(text.contains("DENIED") || text.contains("NEGADO") || text.contains("REFUSED"), text)
        XCTAssertFalse(st.disabledInApp, "disabledInApp only by setEnabled(false)")
    }

    func testStatusCountsTypesAndSummariesAndPurgeEmptiesThem() async throws {
        let sink = ScriptedSink(); let index = FakeRecordingIndex()
        let rig = Rig(sink: sink, index: index)
        let held = workout("HK-H", end: at("2026-11-20", "07:45"))
        index.set([AppRecordedRunRef(id: "r", sessionId: nil, start: held.start, end: held.end, reportedEventId: nil)])
        rig.reader.add(workout("HK-1", end: at("2026-11-17", "07:45")), held,
                       workout("ST-1", end: at("2026-11-18", "19:00"), minutes: 50, type: WorkoutKind.traditionalStrengthTraining, sourceName: "Strong"),
                       workout("YG-1", end: at("2026-11-19", "19:00"), minutes: 30, type: 57, sourceName: "Apple Watch"),
                       workout("GM-1", end: at("2026-11-19", "08:00"), source: "com.garmin.connect.mobile"))
        let ing = rig.make(); await ing.start()
        let st = await ing.status()
        XCTAssertEqual(st.receivedTypes, ["DISTANCE", "NON_RUN_WORKOUT", "ROUTE_PRESENCE", "RUN_WORKOUT"])
        XCTAssertEqual(st.queued, 1, "the held run"); XCTAssertEqual(st.setAside, 0); XCTAssertNotNil(st.lastWorkoutReceivedAt)
        let all = await ing.importedNonRunWorkouts(since: .distantPast)
        XCTAssertEqual(all.map(\.activityKind), ["TRADITIONAL_STRENGTH_TRAINING", "YOGA"]); XCTAssertEqual(all.map(\.durationSeconds), [3000, 1800])
        XCTAssertEqual(all.map(\.sourceName), ["Strong", "Apple Watch"])
        let since = await ing.importedNonRunWorkouts(since: at("2026-11-19", "00:00")); XCTAssertEqual(since.map(\.id), ["YG-1"])
        XCTAssertFalse(sink.deliveries.flatMap(\.activities).contains { ["ST-1", "YG-1", "GM-1"].contains($0.activityId) }, "never to the engine (G-4, OPEN-1)")
        let c = await ing.counts()
        XCTAssertEqual(c.excluded, ["STRENGTH_NOT_DEVICE_CHANNEL": 1, "NON_RUN_WORKOUT": 1, "THIRD_PARTY_SOURCE": 1])
        try await ing.purge(.accountErased)
        let after = await ing.status()
        XCTAssertEqual(after.queued, 0); XCTAssertEqual(after.receivedTypes, []); XCTAssertNil(after.lastReadAt)
        let left = await ing.importedNonRunWorkouts(since: .distantPast); XCTAssertTrue(left.isEmpty, "summaries erased by purge (G07)")
        let heldLeft = await ing.counts().held; XCTAssertEqual(heldLeft, 0, "held items erased by purge")
    }

    // MARK: heart-rate series (item 17)

    static func raw(_ t: TimeInterval, _ bpm: Double, model: String? = nil, bundle: String? = "com.apple.health.W") -> RawHeartRateSample {
        RawHeartRateSample(start: t0.addingTimeInterval(t), end: t0.addingTimeInterval(t), bpm: bpm, sourceBundleId: bundle, deviceModel: model)
    }

    func testSeriesMappingOrdersKeepsOnlyTheWorkoutAndNeverGuessesTheSensor() throws {
        let samples = [Self.raw(30, 151.5), Self.raw(-5, 90), Self.raw(0, 120), Self.raw(1801, 100), Self.raw(15, 140), Self.raw(1800, 170)]
        let s = try HeartRateSeriesMapping.series(activityId: "hk-1", workoutStart: t0, workoutEnd: t0.addingTimeInterval(1800), samples: samples).get()
        XCTAssertEqual(s.samples.map(\.t), [0, 15, 30, 1800], "inside the workout, in time order")
        XCTAssertEqual(s.samples.map(\.bpm), [120, 140, 151.5, 170], "bpm as HealthKit gives it")
        XCTAssertEqual(s.sensor, .unknown, "no device metadata: UNKNOWN, never a guess"); XCTAssertEqual(s.durationSeconds, 1800)
        XCTAssertEqual(s.samples.compactMap(\.artifact), [], "HealthKit marks no artifact: none is invented")
        let watch = try HeartRateSeriesMapping.series(activityId: "hk-2", workoutStart: t0, workoutEnd: t0.addingTimeInterval(60),
                                                      samples: [Self.raw(0, 120, model: "Watch"), Self.raw(5, 121, model: "Watch")]).get()
        XCTAssertEqual(watch.sensor, .optical); XCTAssertEqual(watch.source, "com.apple.health.W")
        let mixed = try HeartRateSeriesMapping.series(activityId: "hk-3", workoutStart: t0, workoutEnd: t0.addingTimeInterval(60),
                                                      samples: [Self.raw(0, 120, model: "Watch"), Self.raw(5, 121, model: "Polar H10", bundle: "com.polar.beat")]).get()
        XCTAssertEqual(mixed.sensor, .unknown); XCTAssertNil(mixed.source)
        XCTAssertEqual(HeartRateSeriesMapping.sensorClass(Self.raw(0, 1, model: "Watch", bundle: "com.thirdparty.app")), .unknown)
        // Empty and too many are refused, never thinned.
        XCTAssertEqual(HeartRateSeriesMapping.series(activityId: "e", workoutStart: t0, workoutEnd: t0.addingTimeInterval(60), samples: [Self.raw(-1, 1)]), .failure(.empty))
        let many = (0...HeartRateSeries.maxSamples).map { Self.raw(Double($0) * 0.5, 130) }
        XCTAssertEqual(HeartRateSeriesMapping.series(activityId: "m", workoutStart: t0, workoutEnd: t0.addingTimeInterval(7000), samples: many), .failure(.tooMany(12_001)))
        XCTAssertNoThrow(try HeartRateSeriesMapping.series(activityId: "m", workoutStart: t0, workoutEnd: t0.addingTimeInterval(7000), samples: Array(many.dropLast())).get())
    }

    /// The JSON B builds is the frozen `classifySamples` input as is (the pattern of `testEngineClassifierReadsTheSeriesAsEncoded`).
    func testEngineClassifierReadsTheMappedSeries() throws {
        guard node() else { throw XCTSkip("node not installed") }
        let raw = (0...120).map { Self.raw(Double($0 * 15), $0 < 60 ? 120 : 175, model: nil) }.reversed()
        let s = try HeartRateSeriesMapping.series(activityId: "hk-1", workoutStart: t0, workoutEnd: t0.addingTimeInterval(1800), samples: Array(raw)).get()
        let chest = try HeartRateSeries(activityId: s.activityId, sensor: .chestStrap, source: s.source, durationSeconds: s.durationSeconds, samples: s.samples)
        let zones = Repo.url("ios/Packages/CoachingPresentation/Tests/CoachingPresentationTests/Fixtures/hr5r-age30-presentation.json").path
        let script = """
        import fs from 'node:fs';const {classifySamples}=await import(\(String(reflecting: Repo.url("CoachingCore/src/v1-heart-rate-zones.mjs").absoluteString)));
        const zones=JSON.parse(fs.readFileSync(\(String(reflecting: zones)),'utf8')).readings.runCalibration.heartRateFiveZones.zones;
        const out=JSON.parse(process.argv[2]).map(s=>classifySamples(zones,{sensor:s.sensor,source:s.source,samples:s.samples},{durationSeconds:s.durationSeconds}));
        console.log(JSON.stringify(out));
        """
        let json = String(data: try JSONEncoder().encode([chest, s]), encoding: .utf8)!
        let r = try runNode(script, args: [json]) as! [[String: Any]]
        XCTAssertEqual(r[0]["status"] as? String, "AVAILABLE", "\(r[0])")
        XCTAssertEqual(r[0]["seconds"] as? [String: Double], ["Z1": 900, "Z2": 0, "Z3": 0, "Z4": 900, "Z5": 0])
        XCTAssertEqual(r[0]["fromAverageHeartRate"] as? Bool, false)
        XCTAssertNotEqual(r[1]["status"] as? String, "AVAILABLE", "an UNKNOWN sensor is not qualified by the engine: \(r[1])")
    }

    func testV1ProvidersAnswerNotInV1() async {
        let hr = HeartRateSeriesNotInV1()
        let r = await hr.heartRateSeries(activityId: "any")
        XCTAssertEqual(r, .unavailable(reason: "NOT_IN_V1"))
        let sig = HealthSignalsNotInV1()
        for k in HealthSignalKind.allCases { let a = await sig.signals(k, in: DateInterval(start: t0, duration: 86_400)); XCTAssertEqual(a, .notInV1) }
    }

    // MARK: log canary (item 4)

    func testNoHealthValueEverReachesTheLog() async throws {
        let sink = ScriptedSink(context: .ready(.plan([("w0-run-d1", "2026-11-17")])))
        sink.answers = [ScriptedSink.each(.notRecorded(reason: "NOT_RECORDED_BY_THIS_DECISION")), { _ in .retryLater(code: "BUSY") },
                        { _ in .refused(code: "BEFORE_RECORD_START", index: 0, disposition: .setAsideItem) }]
        let rig = Rig(sink: sink)
        let canary = WorkoutSnapshot(id: "CANARY-UUID-7A7A", activityTypeRaw: WorkoutKind.running, start: at("2026-11-17", "06:13"), end: at("2026-11-17", "07:24"),
                                     durationSeconds: 4321.987, distanceMeters: 98765.4321, hasRoute: true, indoor: nil, wasUserEntered: false,
                                     sourceBundleId: "com.apple.health.CANARYDEVICE", sourceName: "CANARY-SOURCE-Ω", timeZoneIdentifier: "Asia/Kathmandu")
        rig.reader.add(canary, workout("CANARY-STR", end: at("2026-11-18", "19:00"), minutes: 77.77, type: WorkoutKind.traditionalStrengthTraining, sourceName: "CANARY-GYM-APP"),
                       workout("CANARY-3P", end: at("2026-11-18", "09:00"), minutes: 55.55, source: "com.canary.thirdparty", sourceName: "CANARY-3P"))
        let ing = rig.make(); await ing.start(); await ing.deliveryConditionsChanged()
        rig.clock.advance(10); await rig.scheduler.runAll()
        rig.reader.delete("CANARY-STR"); await rig.reader.fire(); await ing.settled()
        try await ing.purge(.accountErased)
        let lines = rig.log.lines
        XCTAssertGreaterThan(lines.count, 8)
        let forbidden = ["CANARY", "98765", "98.765", "4321", "72.03", "77.77", "55.55", "2026-11", "06:13", "07:24", "Kathmandu", "+05:45", "Apple Watch", "Ω", "w0-run-d1"]
        for l in lines { for f in forbidden { XCTAssertFalse(l.contains(f), "log line leaks \(f): \(l)") } }
        // Structural: B's sources never print and log only through IngestLogEvent.
        let dir = Repo.url("ios/Packages/HealthKitIngest/Sources/HealthKitIngest")
        for f in try FileManager.default.contentsOfDirectory(atPath: dir.path) where f.hasSuffix(".swift") {
            let text = try String(contentsOf: dir.appendingPathComponent(f), encoding: .utf8)
            XCTAssertFalse(text.contains("print(") || text.contains("NSLog(") || text.contains("debugPrint("), f)
            if f != "IngestLog.swift" { XCTAssertFalse(text.contains("Logger("), f) }
        }
    }

    /// Contract §2: B imports only Foundation, IntegrationContracts, HealthKit (and os for the logger); never the forbidden modules.
    func testImportsAreTheAllowedOnes() throws {
        let allowed: Set<String> = ["Foundation", "IntegrationContracts", "HealthKit", "os"]
        let dir = Repo.url("ios/Packages/HealthKitIngest/Sources/HealthKitIngest")
        for f in try FileManager.default.contentsOfDirectory(atPath: dir.path) where f.hasSuffix(".swift") {
            for line in try String(contentsOf: dir.appendingPathComponent(f), encoding: .utf8).split(separator: "\n") where line.hasPrefix("import ") {
                XCTAssertTrue(allowed.contains(String(line.dropFirst(7)).trimmingCharacters(in: .whitespaces)), "\(f): \(line)")
            }
        }
    }
}
