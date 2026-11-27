import Foundation
import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation
import IntegrationContracts

/// #49, the P3 items: orphan temporaries after an erasure (P3-1), the first-launch reconciliation fails closed (P3-2), and the tests the
/// review found missing (P3-5: the erasure's lock retries, a folder that cannot be listed, a sweep of what reaches the log). Synthetic only.
final class IntegrationFollowUpTests: XCTestCase {
    func exists(_ u: URL) -> Bool { FileManager.default.fileExists(atPath: u.path) }
    func code<T>(_ r: Result<T, BoundaryError>) -> String { if case .failure(let e) = r { return e.code.raw }; return "OK" }
    func enrolled(_ name: String) async throws -> HostFixture {
        let f = try await HostFixture.make(name)
        let o = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(o.answer.planOutcome, .planCreated)
        f.b.reset()
        return f
    }

    /// P3-1: the temporaries a writer that died mid-write left beside the signals, the clock reference and a custody tombstone are removed
    /// by the account erasure with the files they were for.
    func testErasureRemovesOrphanTemporaries() async throws {
        let f = try await enrolled("i49-p31")
        let h = f.host, root = h.configuration.root
        let orphans = [".signals-\(h.tag).json.4242.\(UUID().uuidString).tmp", ".clock-\(h.tag).json.4242.\(UUID().uuidString).tmp",
                       "tombstone-\(String(repeating: "a", count: 32)).json.tmp"].map { root.appendingPathComponent($0) }
        for u in orphans { try Data(#"{"synthetic":true}"#.utf8).write(to: u) }
        let e = await h.eraseAccount()
        XCTAssertTrue(e.answer.ok)
        XCTAssertEqual(orphans.filter(exists).map(\.lastPathComponent), [], "no temporary outlives the erasure")
        let left = Set(((try? FileManager.default.contentsOfDirectory(atPath: root.path)) ?? []).map {
            $0.hasPrefix("athlete-") && $0.hasSuffix(".lock") ? "lock" : $0.hasPrefix("erased-") ? "fence" : $0 })
        XCTAssertEqual(left, ["lock", "fence", "install-marker.json"])
        emit("i49-p3-1", ["orphansLeft": orphans.filter(exists).count])
        TestEnv.cleanup("i49-p31")
    }

    #if os(macOS)
    /// P3-2: a reconciliation that cannot complete never writes the marker and the host does not open (fail closed); the next open completes
    /// it. Three causes: the Keychain items cannot be listed; one cannot be removed; the store folder cannot be listed.
    func testFirstLaunchReconciliationFailsClosed() async throws {
        let name = "i49-p32", service = "\(CoachingHost.keychainService).i49-p32"
        TestEnv.cleanup(name)
        let kdir = try XCTUnwrap(TestEnv.keychainDirectory), root = TestEnv.root(name)
        let items = KeychainItems(service: service, prefix: TestEnv.prefix(name), storage: .file(kdir))
        items.set("anchor.leftover", Data(#"{"version":3,"docMac":"x"}"#.utf8))
        let serviceDir = kdir.appendingPathComponent(TestKeychainFile.hex(service))
        defer { chmod(serviceDir.path, 0o700); chmod(root.path, 0o700); items.deleteAll(); TestEnv.cleanup(name) }
        let marker = root.appendingPathComponent(FirstLaunch.markerName)
        func open(_ b: RecordingQueueControl) async throws -> CoachingHost {
            try await CoachingHost.openForTesting(.init(athleteId: "athlete-\(name)", root: root, keychainService: service), keychainPrefix: TestEnv.prefix(name),
                                                 queueControl: b, clock: TestClock(), testKeychainDirectory: kdir)
        }
        func refusal(_ mode: mode_t, on u: URL) async -> FirstLaunch.Incomplete? {
            chmod(u.path, mode); defer { chmod(u.path, 0o700) }
            let b = RecordingQueueControl()
            do { _ = try await open(b); return nil } catch {
                XCTAssertEqual(b.calls, [], "nothing is purged or signalled on a guess")
                return error as? FirstLaunch.Incomplete
            }
        }
        let unlistable = await refusal(0o000, on: serviceDir)
        XCTAssertEqual(unlistable, .keychainUnavailable)
        let undeletable = await refusal(0o500, on: serviceDir)
        XCTAssertEqual(undeletable, .keychainUnavailable)
        XCTAssertEqual(items.accounts(), ["anchor.leftover"], "the leftover is still there"); XCTAssertFalse(exists(marker), "no marker over a guess")
        try? FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        let storeUnlistable = await refusal(0o300, on: root)
        XCTAssertEqual(storeUnlistable, .storeUnlistable); XCTAssertFalse(exists(marker))
        let b = RecordingQueueControl()
        let h = try await open(b)
        XCTAssertEqual(h.reconciliation, .freshInstallPurged); XCTAssertEqual(items.accounts(), [], "the leftover is removed")
        XCTAssertTrue(exists(marker)); XCTAssertEqual(b.calls.map(\.name), ["purge:FRESH_INSTALL", "deliveryConditionsChanged"])
        emit("i49-p3-2", ["keychainUnlistable": "\(unlistable.map { "\($0)" } ?? "opened")", "keychainUndeletable": "\(undeletable.map { "\($0)" } ?? "opened")",
                          "storeUnlistable": "\(storeUnlistable.map { "\($0)" } ?? "opened")", "then": h.reconciliation.rawValue])
    }

    /// P3-5: a store folder that cannot be listed. At start the fence scan is unknown, so nothing runs; an enrolment is refused; an account
    /// erasure is not complete (its key removal needs the listing) and stays pending; once the folder can be listed, the next operation
    /// completes it.
    func testAFolderThatCannotBeListed() async throws {
        let f = try await enrolled("i49-list")
        let root = f.host.configuration.root
        defer { chmod(root.path, 0o700) }
        chmod(root.path, 0o300)                   // write and search, no listing
        let g = try await f.reopen()
        let p = code(await g.host.plan(week: nil))
        XCTAssertEqual(p, HostCode.hostUnavailable, "an unknown fence scan is pending, never 'none'")
        let o = await g.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(o.answer.error?.code.raw, HostCode.hostUnavailable)
        let e = await f.host.eraseAccount()
        XCTAssertEqual(e.answer.error?.code, "PERSISTENCE_FAILURE", "not complete while the folder cannot be listed")
        XCTAssertEqual(f.host.fence.state(f.host.tag), .requested)
        chmod(root.path, 0o700)
        let after = code(await f.host.plan(week: nil))
        XCTAssertEqual(after, "GONE"); XCTAssertNotEqual(f.host.fence.state(f.host.tag), .requested)
        emit("i49-unlistable", ["start": p, "onboard": o.answer.error?.code.raw ?? "OK", "erasure": e.answer.error?.code.raw ?? "OK", "listedAgain": after])
        TestEnv.cleanup("i49-list")
    }
    #endif

    /// P3-5 (code review R1 #7): the erasure's lock is retried. Held past every attempt: the answer says it is pending (fence REQUESTED, nothing
    /// erased, no purge). Released between two attempts: the second one erases.
    func testEraseAccountRetriesTheLock() async throws {
        let f = try await enrolled("i49-lock")
        let h = f.host
        let fd = open(h.store.lockFile(h.athleteId).path, O_CREAT | O_RDWR, 0o600); XCTAssertEqual(flock(fd, LOCK_EX), 0)
        defer { close(fd) }
        h.store.lockWait = 0.05; h.busyRetryDelay = 1_000
        let held = await h.eraseAccount()
        XCTAssertEqual(held.answer.error?.code.raw, HostCode.hostUnavailable)
        XCTAssertEqual(h.fence.state(h.tag), .requested); XCTAssertTrue(exists(h.store.file(h.athleteId)), "nothing erased under another holder's lock")
        XCTAssertEqual(f.b.calls, [])
        h.store.lockWait = 0.2; h.busyRetryDelay = 400_000
        DispatchQueue.global().asyncAfter(deadline: .now() + 0.3) { flock(fd, LOCK_UN) }
        let retried = await h.eraseAccount()
        XCTAssertTrue(retried.answer.ok, "\(String(describing: retried.answer.error?.code))")
        XCTAssertFalse(exists(h.store.file(h.athleteId))); XCTAssertEqual(f.b.calls.map(\.name), ["purge:ACCOUNT_ERASED"])
        emit("i49-lock-retries", ["heldThroughout": held.answer.error?.code.raw ?? "OK", "releasedBetweenAttempts": retried.answer.ok ? "OK" : "-"])
        TestEnv.cleanup("i49-lock")
    }

    /// P3-5 (3.5): a sweep of every record that reaches the log over a full journey (enrolment, reports with a symptom stop, a delivery, the
    /// heart-rate profile, a clinical restart, a health-fact erasure, the record loss, the account erasure). Only the boundary's telemetry
    /// fields and the host's own events; no id, activity, number of a health value or health word.
    func testLogSweepCarriesNoPayload() async throws {
        let lock = NSLock(); var lines: [String] = []
        HostLog.tap = { l in lock.withLock { lines.append(l) } }
        defer { HostLog.tap = nil }
        let f = try await enrolled("i49-log")
        let h = f.host
        f.clock.set(day: "2026-11-17", "19:00")
        let stop = AthleteObservation.plannedRun(sessionId: "w0-run-d1", occurrenceDate: "2026-11-17", observedAt: "2026-11-17T07:20:00-03:00",
                                                 actual: PlannedRunActual(completed: false, minutes: 13, rpe: 7, stop: RunStop(reason: .symptom)), response: .unknown)
        _ = await h.submit(ReviewRequest(.sessionReports([stop]), eligibility: Athlete.screen("2026-11-17")))
        _ = await h.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [DeviceActivity(activityId: "HK-i49-log", observedAt: "2026-11-17T06:00:00-03:00", actual: DeviceActual(completed: true, minutes: 37))]))
        _ = await h.setHeartRateProfile(HeartRateProfileRequest(maxHeartRateBpm: .some(193)))
        f.clock.set(day: "2026-11-20", "10:00")
        _ = await h.restart(Athlete.answers(start: "2026-11-23", assessedAt: "2026-11-20", pain: true))
        _ = await h.eraseHealthFacts(eventIds: ["ev-i49-log"])
        try FileManager.default.removeItem(at: h.store.file(h.athleteId))
        _ = await h.plan(week: nil)
        _ = await h.acknowledgeRecordLoss()
        _ = await h.eraseAccount()
        let all = lock.withLock { lines }
        XCTAssertGreaterThan(all.count, 8)
        let allowed: Set<String> = ["op", "ok", "code", "version", "category", "decisionId", "host"]
        let forbidden = [h.athleteId, h.tag, "HK-i49-log", "ev-i49-log", "w0-run-d1", "193", "\"37", "\"13", "2026-11", "swift-a", "pain", "injury", "illness",
                         "WELLBEING", "READINESS", "CLINICAL", "symptom", "SYMPTOM", "ageYears", "Bpm"]
        for l in all {
            let o = try XCTUnwrap(try JSONSerialization.jsonObject(with: Data(l.utf8)) as? [String: Any], l)
            XCTAssertTrue(Set(o.keys).isSubset(of: allowed), "a field beyond the telemetry: \(l)")
            // The opaque decision id is allowed as is (it may hold any digits); every other value is swept.
            var rest = o; rest["decisionId"] = nil
            let text = String(data: try JSONSerialization.data(withJSONObject: rest, options: [.sortedKeys]), encoding: .utf8) ?? l
            for w in forbidden { XCTAssertFalse(text.contains(w), "\(w) in \(l)") }
        }
        emit("i49-log-sweep", ["records": all.count, "fields": Set(all.flatMap { ((try? JSONSerialization.jsonObject(with: Data($0.utf8)) as? [String: Any]) ?? [:]).keys }).sorted().count])
        TestEnv.cleanup("i49-log")
    }
}
