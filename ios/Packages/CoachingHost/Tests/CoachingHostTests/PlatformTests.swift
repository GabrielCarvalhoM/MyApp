import Foundation
import XCTest
import CryptoKit
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation
import IntegrationContracts

/// The original handoff's tests 1, 3, 4, 5, 7, 11, 12, 13: the bundle at boot, HMAC and the key (N-4), the store's failures, D1, the
/// `DeviceActivitySink` with real boundary codes, the signals to B after the commit, and the first-launch reconciliation.
final class PlatformTests: XCTestCase {
    func run(_ s: String, _ day: String, time: String = "07:45", minutes: Double = 40, km: Double = 8.1, session: String? = nil, id: String? = nil) throws -> DeviceActivity {
        DeviceActivity(activityId: id ?? "HK-\(s)-\(day)", sessionId: session, observedAt: "\(day)T\(time):00-03:00",
                       actual: DeviceActual(completed: true, minutes: minutes, distanceKm: km, measurement: .gps, gpsQuality: .ok))
    }
    func enrolled(_ name: String, clock: TestClock = TestClock()) async throws -> HostFixture {
        let f = try await HostFixture.make(name, clock: clock)
        let o = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(o.answer.planOutcome, .planCreated)
        f.b.reset()
        return f
    }

    // MARK: 1 — the bundle at boot

    func testBootRefusesATamperedAssetOrBundle() throws {
        let q = DispatchQueue(label: "tamper")
        XCTAssertThrowsError(try q.sync { try EngineRuntime(queue: q, keys: FixtureKeys(), tamper: { k, t in k.hasSuffix("HEART_RATE_FIVE_ZONE_V2.json") ? t.replacingOccurrences(of: "65", with: "66") : t }) }) {
            guard case EngineRuntime.Failure.assetHash = $0 else { return XCTFail("\($0)") }
        }
        // A copy of the resources with one changed byte in the bundle: refused before evaluation (the pin compiled into the module).
        let src = try EngineRuntime.resourceURL(), dst = TestEnv.root("tampered-resources")
        try FileManager.default.createDirectory(at: dst.deletingLastPathComponent(), withIntermediateDirectories: true)
        try FileManager.default.copyItem(at: src, to: dst)
        let js = dst.appendingPathComponent("coachinghost.js")
        var text = try String(contentsOf: js, encoding: .utf8); text = text.replacingOccurrences(of: "'use strict';", with: "'use strict'; ", options: [], range: text.range(of: "'use strict';"))
        try text.write(to: js, atomically: true, encoding: .utf8)
        XCTAssertThrowsError(try q.sync { try EngineRuntime(queue: q, keys: FixtureKeys(), resources: dst) }) {
            guard case EngineRuntime.Failure.bundleHash = $0 else { return XCTFail("\($0)") }
        }
        let ok = try q.sync { try EngineRuntime(queue: q, keys: FixtureKeys()) }
        emit("bundle-boot", ["pinned": BundlePin.bundleSha256, "loadMs": String(format: "%.1f", ok.load?.totalMs ?? -1), "tamperedAsset": "refused", "tamperedBundle": "refused"])
        try? FileManager.default.removeItem(at: dst)
    }

    #if os(macOS)
    /// Acceptance rule 1 (Node): the manifest is the amendment's shas plus app-projections.mjs; export gate 0.
    func testManifestIsTheAmendment() throws {
        let p = Process(); p.executableURL = URL(fileURLWithPath: "/usr/bin/env")
        p.arguments = ["node", TestEnv.repo.appendingPathComponent("ios/Packages/CoachingHost/build/check-manifest.mjs").path]
        let pipe = Pipe(); p.standardOutput = pipe; try p.run(); p.waitUntilExit()
        let o = try JSONSerialization.jsonObject(with: pipe.fileHandleForReading.readDataToEndOfFile()) as! [String: Any]
        XCTAssertEqual(p.terminationStatus, 0); XCTAssertEqual(o["failures"] as? [String], [])
        XCTAssertEqual(o["bundleSha256"] as? String, BundlePin.bundleSha256, "the bundle the manifest names is the pinned one")
        XCTAssertEqual(o["coachingCoreModules"] as? Int, 47); XCTAssertEqual(o["assets"] as? Int, 18)
    }
    #endif

    // MARK: 3/4 — HMAC and the production key (N-4)

    func testHmacVectorsAndProductionKey() throws {
        struct V: Codable { let key: String; let text: String?; let `repeat`: String?; let count: Int?; let hex: String }
        struct E: Codable { let a: String; let b: String; let equal: Bool }
        struct F: Codable { let vectors: [V]; let constantTimeEqual: [E] }
        let f = try JSONDecoder().decode(F.self, from: try TestEnv.fixture("hmac"))
        let text = { (v: V) -> String in v.text ?? String(repeating: v.repeat!, count: v.count!) }
        let direct = f.vectors.filter { EngineRuntime.hex(HMAC<SHA256>.authenticationCode(for: Data(text($0).utf8), using: SymmetricKey(data: Data($0.key.utf8)))) == $0.hex }.count
        XCTAssertEqual(direct, f.vectors.count)
        let q = DispatchQueue(label: "hmac")
        let rt = try q.sync { try EngineRuntime(queue: q, keys: FixtureKeys()) }
        let vjson = String(data: try JSONEncoder().encode(f.vectors), encoding: .utf8)!, ejson = String(data: try JSONEncoder().encode(f.constantTimeEqual), encoding: .utf8)!
        let out: String = try q.sync {
            _ = try rt.evaluate("globalThis.__hm = (v, e) => JSON.stringify({ macs: JSON.parse(v).map(x => __p0host.hmacSHA256(x.key, x.text ?? x.repeat.repeat(x.count))), eq: JSON.parse(e).map(x => __p0host.constantTimeEqual(x.a, x.b)) });")
            return try rt.callGlobal("__hm", [vjson, ejson])
        }
        struct O: Codable { let macs: [String]; let eq: [Bool] }
        let o = try JSONDecoder().decode(O.self, from: Data(out.utf8))
        XCTAssertEqual(o.macs, f.vectors.map(\.hex), "through the JSContext host function"); XCTAssertEqual(o.eq, f.constantTimeEqual.map(\.equal))
        // N-4: 32 random bytes created once; the same key for a second resolver; another install (prefix) gets another key; only the allowlist.
        TestEnv.cleanup("n4"); TestEnv.cleanup("n4b")
        let items = KeychainItems(prefix: TestEnv.prefix("n4")), k1 = KeychainIntegrityKey(items: items)
        let a = try XCTUnwrap(k1.key(for: KeychainIntegrityKey.keyRef)); XCTAssertEqual(a.count, 32); XCTAssertTrue(k1.created)
        let k2 = KeychainIntegrityKey(items: items); XCTAssertEqual(k2.key(for: KeychainIntegrityKey.keyRef), a); XCTAssertFalse(k2.created)
        let other = try XCTUnwrap(KeychainIntegrityKey(items: KeychainItems(prefix: TestEnv.prefix("n4b"))).key(for: KeychainIntegrityKey.keyRef))
        XCTAssertNotEqual(other, a, "random per install")
        XCTAssertNil(k1.key(for: "v1int-synthetic-key")); XCTAssertNil(k1.key(for: ""))
        let accessible = items.accessible(KeychainIntegrityKey.account)
        #if os(iOS)
        XCTAssertEqual(accessible, kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly as String)
        #endif
        emit("hmac-and-key", ["vectors": String(f.vectors.count), "direct": String(direct), "viaJS": String(zip(o.macs, f.vectors).filter { $0 == $1.hex }.count), "keyBytes": String(a.count), "keychainAccessible": accessible ?? "n/a"])
        TestEnv.cleanup("n4"); TestEnv.cleanup("n4b")
    }

    /// A keyRef outside the allowlist resolves to nothing: the bundle refuses to seal, and nothing is written.
    func testUnknownKeyRefRefuses() async throws {
        let f = try await HostFixture.make("n4-unknown", keyRef: "not-in-the-allowlist")
        let o = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertFalse(o.answer.ok); XCTAssertNil(f.host.store.rawData(f.host.athleteId), "nothing written")
        TestEnv.cleanup("n4-unknown")
    }

    #if os(macOS)
    /// No fixture key in the production target: none of the oracles' key texts appears in the module's sources or resources.
    func testNoFixtureKeyInProduction() throws {
        var refs = Set<String>(["v1int-synthetic-key", "abc-synthetic-key"])
        for n in ["int", "final", "hr5"] {
            struct Fx: Decodable { let inputJSON: String }
            let fx = try JSONDecoder().decode(Fx.self, from: try TestEnv.fixture(n))
            let i = try JSONSerialization.jsonObject(with: Data(fx.inputJSON.utf8)) as! [String: Any]
            if let k = i["key"] as? String { refs.insert(k) }
            for j in (i["journeys"] as? [[String: Any]]) ?? [] { if let k = j["key"] as? String { refs.insert(k) } }
        }
        let prod = TestEnv.repo.appendingPathComponent("ios/Packages/CoachingHost/Sources")
        let e = FileManager.default.enumerator(at: prod, includingPropertiesForKeys: nil)!
        var hits: [String] = []
        for case let u as URL in e where !u.hasDirectoryPath { let t = (try? String(contentsOf: u, encoding: .utf8)) ?? ""; for r in refs where t.contains(r) { hits.append("\(u.lastPathComponent): \(r)") } }
        XCTAssertEqual(hits, [], "fixture keys in production")
        // Imports (contract §2): never HealthKit or SwiftUI; never front B's module.
        let imports = try FileManager.default.subpathsOfDirectory(atPath: prod.path).filter { $0.hasSuffix(".swift") }
            .flatMap { try String(contentsOf: prod.appendingPathComponent($0), encoding: .utf8).split(separator: "\n").filter { $0.hasPrefix("import ") } }
        XCTAssertTrue(imports.allSatisfy { !$0.contains("HealthKit") && !$0.contains("SwiftUI") && !$0.contains("HealthKitIngest") }, "\(Set(imports))")
        // 18a (iv): the review-only time-in-zone path is never called outside tests.
        let facade = try String(contentsOf: TestEnv.repo.appendingPathComponent("ios/Packages/CoachingHost/facade/entry.mjs"), encoding: .utf8)
        XCTAssertFalse(facade.contains("timeInZonesForReviewOnly")); XCTAssertFalse(hits.contains { $0.contains("timeInZonesForReviewOnly") })
        emit("no-fixture-key", ["references": String(refs.count), "hits": String(hits.count)])
    }
    #endif

    // MARK: 5 — the store

    func testFailedWriteConfirmsNothingAndProtection() async throws {
        let f = try await enrolled("store-fail")
        let before = f.host.store.rawData(f.host.athleteId)
        f.host.store.failWrites = true
        f.clock.set(day: "2026-11-17", "19:00")
        let review = ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-11-17"))
        let failed = await f.host.submit(review)
        XCTAssertEqual(failed.answer.error?.code, "PERSISTENCE_FAILURE"); XCTAssertEqual(f.host.store.rawData(f.host.athleteId), before, "the record unchanged")
        XCTAssertEqual(f.b.calls, [], "nothing signalled for a write that did not happen")
        f.host.store.failWrites = false
        let again = await f.host.submit(review)
        XCTAssertTrue(again.answer.ok)
        #if os(iOS)
        XCTAssertEqual(f.host.store.protectionOf(f.host.athleteId), FileProtectionType.completeUntilFirstUserAuthentication.rawValue)
        #endif
        emit("store-write-failure", ["failed": failed.answer.error?.code.raw ?? "-", "after": again.answer.ok ? "OK" : "-"])
        TestEnv.cleanup("store-fail")
    }

    // MARK: 7 — D1

    func testTrustedClockD1() async throws {
        let clock = TestClock()
        let f = try await enrolled("d1", clock: clock)
        let base = clock.wall
        // +299 s with no time passing on the monotonic clock: accepted.
        clock.setWallOnly(base + 299_000)
        let ok = await f.host.setConsent(.learning, granted: true)
        XCTAssertTrue(ok.answer.ok, "\(ok.answer.error?.code.raw ?? "")")
        let v = NativeStore.versionOf(f.host.store.rawData(f.host.athleteId)), bytes = f.host.store.rawData(f.host.athleteId)
        // +301 s past the new reference: refused before custody, nothing written, CLOCK_AHEAD_OF_REFERENCE; waiting in the sink.
        clock.setWallOnly(base + 299_000 + 301_000)
        let refused = await f.host.setConsent(.learning, granted: true)
        XCTAssertEqual(refused.answer.error?.code, "CLOCK_AHEAD_OF_REFERENCE"); XCTAssertEqual(f.host.store.rawData(f.host.athleteId), bytes)
        let d = try DeviceDelivery(deliveryId: UUID().uuidString, activities: [try run("d1", "2026-11-17", session: "w0-run-d1")])
        let r = await f.host.deliver(d)
        XCTAssertEqual(r, .waiting(code: HostCode.clockAheadOfReference))
        let st = await f.host.startability(sessionId: "w0-run-d1")
        XCTAssertEqual(st, .notStartable(reason: .clockUntrusted))
        // Revocation and erasure pass.
        let _v1 = (await f.host.setConsent(.learning, granted: false)).answer.ok
        XCTAssertTrue(_v1, "revocation passes")
        let _v2 = try await f.host.eraseHeartRateProfile().get().ok
        XCTAssertTrue(_v2, "the heart-rate erasure passes")
        // A reboot invalidates the reference: the device clock is used; the first committed mutating op tells B (§4.2).
        clock.boot = "boot-B"; f.b.reset()
        let afterReboot = await f.host.setConsent(.learning, granted: true)
        XCTAssertTrue(afterReboot.answer.ok); XCTAssertEqual(f.b.calls.map(\.name), ["deliveryConditionsChanged"])
        // A clock behind the record: the boundary's own refusal.
        clock.setWallOnly(base - 3_600_000)
        let behind = await f.host.setConsent(.learning, granted: true)
        XCTAssertEqual(behind.answer.error?.code, "CLOCK_BEHIND_RECORD")
        let _v3 = (await f.host.setConsent(.learning, granted: false)).answer.ok
        XCTAssertTrue(_v3, "revocation passes a clock behind the record")
        emit("d1", ["plus299": "accepted", "plus301": "CLOCK_AHEAD_OF_REFERENCE", "sink": "waiting", "reboot": "reference invalidated", "behind": "CLOCK_BEHIND_RECORD", "version": String(v ?? -1)])
        TestEnv.cleanup("d1")
    }

    // MARK: 11 — DeviceActivitySink with real codes

    func testDeviceActivitySink() async throws {
        let f = try await enrolled("sink")
        let ctx = await f.host.ingestContext()
        guard case .ready(let c) = ctx else { return XCTFail("\(ctx)") }
        XCTAssertEqual(c.timezoneOffsetMinutes, -180); XCTAssertTrue(c.runSessions.contains(PlannedRunSession(sessionId: "w0-run-d1", day: "2026-11-17")))
        f.clock.set(day: "2026-11-17", "08:00")
        let a = try run("a", "2026-11-17", session: "w0-run-d1")
        // No screen answered yet through the athlete's channel? The intake's screen counts; the delivery is recorded.
        let first = await f.host.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [a]))
        guard case .answered(_, let items) = first, case .recorded = items.first?.outcome else { return XCTFail("\(first)") }
        let entries = try await f.host.loggedEntries().get().entries.count
        // The same chunk again with a NEW id: DUPLICATE, no double credit.
        let dup = await f.host.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [a]))
        guard case .answered(_, let d2) = dup, d2.first?.outcome == .duplicate else { return XCTFail("\(dup)") }
        let entriesAfter = try await f.host.loggedEntries().get().entries.count
        XCTAssertEqual(entriesAfter, entries, "no double credit")
        // BEFORE_RECORD_START names its index: set it aside.
        let old = await f.host.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [try run("old", "2026-01-10")]))
        XCTAssertEqual(old, .refused(code: "BEFORE_RECORD_START", index: 0, disposition: .setAsideItem))
        // UNKNOWN_SESSION: re-send unlinked.
        f.clock.set(day: "2026-11-18", "08:00")
        let unknown = await f.host.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [try run("u", "2026-11-18", session: "no-such-session")]))
        if case .refused(let code, let index, let disp) = unknown { XCTAssertEqual(code, "UNKNOWN_SESSION"); XCTAssertEqual(index, 0); XCTAssertEqual(disp, .resendUnlinked) } else { XCTFail("\(unknown)") }
        // A stale version is resolved inside A with a new id <deliveryId>~1.
        f.host.versionSkewForTesting = 1
        let did = UUID().uuidString
        let stale = await f.host.deliver(try DeviceDelivery(deliveryId: did, activities: [try run("s", "2026-11-18", session: nil, id: "HK-stale")]))
        guard case .answered = stale else { return XCTFail("\(stale)") }
        XCTAssertEqual(Array(f.host.sentRequestIds.suffix(2)), [did, did + "~1"])
        // BUSY (another process holds the record past the wait): the same id, 3 retries, then retryLater.
        let fd = open(f.host.store.lockFile(f.host.athleteId).path, O_CREAT | O_RDWR, 0o600); XCTAssertEqual(flock(fd, LOCK_EX), 0)
        f.host.store.lockWait = 0.02; f.host.busyRetryDelay = 1_000
        let busy = await f.host.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [try run("b", "2026-11-18", id: "HK-busy")]))
        XCTAssertEqual(busy, .retryLater(code: "BUSY")); flock(fd, LOCK_UN); close(fd); f.host.store.lockWait = 10
        // PERSISTENCE_FAILURE: retryLater.
        f.host.store.failWrites = true
        let pf = await f.host.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [try run("p", "2026-11-18", id: "HK-pf")]))
        XCTAssertEqual(pf, .retryLater(code: "PERSISTENCE_FAILURE")); f.host.store.failWrites = false
        // RECORD_LOST (the file gone, the anchor there): halted.
        try FileManager.default.removeItem(at: f.host.store.file(f.host.athleteId))
        let lost = await f.host.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [try run("l", "2026-11-18", id: "HK-lost")]))
        XCTAssertEqual(lost, .halted(code: "RECORD_LOST"))
        guard case .unavailable(let code) = await f.host.ingestContext() else { return XCTFail("context of a lost record") }
        XCTAssertEqual(code, "RECORD_LOST")
        // acknowledgeRecordLoss, from that screen only: B purges after it.
        f.b.reset()
        let _v4 = (await f.host.acknowledgeRecordLoss()).answer.ok
        XCTAssertTrue(_v4)
        XCTAssertEqual(f.b.calls.map(\.name), ["purge:RECORD_LOSS_ACKNOWLEDGED"])
        emit("device-sink", ["recorded": "answered", "duplicate": "no double credit", "beforeRecordStart": "setAsideItem#0", "unknownSession": "resendUnlinked#0",
                             "stale": "resolved ~1", "busy": "retryLater", "persistenceFailure": "retryLater", "recordLost": "halted"])
        TestEnv.cleanup("sink")
    }

    /// An ASK through the sink (the intake's screen older than 14 days): the workout is NOT_RECORDED and stays in B's queue; the athlete's new
    /// screen tells B (deliveryConditionsChanged); the re-send as a NEW delivery is recorded (contract §6.2).
    func testSinkWaitsForTheScreen() async throws {
        let f = try await enrolled("sink-screen")
        f.clock.set(day: "2026-12-02", "09:00")
        let a = try run("ask", "2026-12-02", time: "08:30")
        let r = await f.host.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [a]))
        switch r {
        case .answered(_, let items): XCTAssertFalse(items.first?.outcome.leavesQueue ?? true, "an ASK does not record the workout: \(items)")
        case .waiting(let code): XCTAssertTrue(["SCREEN_REQUIRED"].contains(code))
        default: XCTFail("\(r)")
        }
        f.b.reset()
        _ = await f.host.submit(ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-12-02")))
        XCTAssertEqual(f.b.calls.map(\.name), ["deliveryConditionsChanged"], "a new screen frees what waits")
        let again = await f.host.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [a]))
        guard case .answered(_, let items) = again, items.first?.outcome.leavesQueue == true else { return XCTFail("\(again)") }
        emit("device-sink-screen", ["first": "\(r)".prefix(90).description, "afterScreen": "recorded"])
        TestEnv.cleanup("sink-screen")
    }

    // MARK: 12/13 — signals to B after the commit; the first-launch reconciliation

    func testSignalsComeAfterTheCommit() async throws {
        let f = try await HostFixture.make("signals")
        let o = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertTrue(o.answer.ok)
        XCTAssertEqual(f.b.calls, [.init(name: "deliveryConditionsChanged", versionOnDisk: 1, fileExists: true)], "enrol is on disk before B hears it")
        f.b.reset(); f.clock.set(day: "2026-11-17", "07:00")
        _ = await f.host.submit(ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-11-17")))
        XCTAssertEqual(f.b.calls.first?.versionOnDisk, 2)
        f.b.reset()
        _ = await f.host.setConsent(.healthSignals, granted: true)
        XCTAssertEqual(f.b.calls.map(\.name), ["deliveryConditionsChanged"])
        f.b.reset()
        let _v5 = (await f.host.eraseAccount()).answer.ok
        XCTAssertTrue(_v5)
        XCTAssertEqual(f.b.calls, [.init(name: "purge:ACCOUNT_ERASED", versionOnDisk: nil, fileExists: false)], "purge after the native erasure")
        // 6.3: the file, its .tmp, the host's side files, the anchor and the key are gone.
        XCTAssertNil(f.host.store.rawData(f.host.athleteId)); XCTAssertNil(f.host.anchor.get(f.host.athleteId))
        XCTAssertNil(f.host.keychain.get(KeychainIntegrityKey.account).data)
        TestEnv.cleanup("signals")
    }

    func testFirstLaunchReconciliation() async throws {
        TestEnv.cleanup("reinstall")
        // Leftovers of a deleted install: the Keychain items survive, the container does not.
        let items = KeychainItems(prefix: TestEnv.prefix("reinstall"))
        items.set("anchor.leftover", Data(#"{"version":3,"docMac":"x"}"#.utf8)); _ = KeychainIntegrityKey(items: items).key(for: KeychainIntegrityKey.keyRef)
        XCTAssertEqual(Set(items.accounts()), ["anchor.leftover", KeychainIntegrityKey.account])
        let f = try await HostFixture.make("reinstall", clean: false)
        XCTAssertEqual(f.host.reconciliation, .freshInstallPurged)
        XCTAssertEqual(f.callsAtOpen, ["purge:FRESH_INSTALL", "deliveryConditionsChanged"])
        XCTAssertFalse(items.accounts().contains("anchor.leftover"), "leftover anchor removed")
        let _v6 = (await f.host.onboard(Athlete.answers(), consents: Athlete.all)).answer.ok
        XCTAssertTrue(_v6, "a new install, never RECORD_LOST")
        let g = try await f.reopen()
        XCTAssertEqual(g.host.reconciliation, .notNeeded)
        emit("first-launch", ["first": f.host.reconciliation.rawValue, "second": g.host.reconciliation.rawValue])
        TestEnv.cleanup("reinstall")
    }

    // MARK: time in zone (gated) and the pending week

    func testTimeInZoneIsGated() async throws {
        let f = try await enrolled("tiz")
        let samples = (0..<61).map { HeartRateSample(t: Double($0 * 30), bpm: $0 < 20 ? 120 : $0 < 40 ? 150 : 175) }
        let series = try HeartRateSeries(activityId: "HK-1", sensor: .chestStrap, source: "SYNTHETIC", durationSeconds: 1800, samples: samples)
        let r = await f.host.timeInZones(series)
        XCTAssertEqual(r.status, "UNAVAILABLE"); XCTAssertEqual(r.reason, "SERIES_CHANNEL_NOT_REVIEWED"); XCTAssertNil(r.seconds); XCTAssertFalse(r.fromAverageHeartRate)
        TestEnv.cleanup("tiz")
    }
}
