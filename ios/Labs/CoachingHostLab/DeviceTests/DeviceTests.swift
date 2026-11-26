import Foundation
import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation
#if canImport(UIKit)
import UIKit
#endif

/// The iPhone-only phases of A handoff §7 (run through `tools/device-lock/with-device.sh coachinghost --wait`). Each guarded test runs only
/// when xcodebuild passes TEST_RUNNER_CH_PHASE (it reaches the test process as CH_PHASE):
///   CH_PHASE=xpWrite     process 1 enrols and declares a maximum heart rate of 195 on the native store + Keychain, then ends
///   CH_PHASE=xpRead      a NEW process reads ATHLETE_DECLARED_MAXIMUM 195 (test 6 b on the device)
///   CH_PHASE=reinstall1  enrols, then a clinical restart (FND-ABC-04b): nothing startable; writes a marker in the Keychain
///   CH_PHASE=reinstall2  after the lab app was deleted and installed again: the first-launch reconciliation removed the leftovers, the athlete
///                        meets NOT_ENROLLED (never RECORD_LOST), and nothing is startable (FND-ABC-04/04b after a reinstall)
///   CH_PHASE=locked      waits for the device to be locked, then reads and writes the record and the Keychain while locked
final class DevicePhaseTests: XCTestCase {
    var phase: String? { ProcessInfo.processInfo.environment["CH_PHASE"] }
    static let name = "device-phase"
    static var pidFile: URL { TestEnv.rootNoClean("device-pids").appendingPathComponent("pid.txt") }

    func testPhaseCrossProcessWrite() async throws {
        guard phase == "xpWrite" else { throw XCTSkip("CH_PHASE=xpWrite only") }
        let f = try await HostFixture.make("xp-device")
        let _v1 = (await f.host.onboard(Athlete.answers(), consents: Athlete.all)).answer.planOutcome
        XCTAssertEqual(_v1, .planCreated)
        let _v2 = try await f.host.setHeartRateProfile(HeartRateProfileRequest(maxHeartRateBpm: .some(195))).get().ok
        XCTAssertTrue(_v2)
        try FileManager.default.createDirectory(at: Self.pidFile.deletingLastPathComponent(), withIntermediateDirectories: true)
        try "\(getpid())".write(to: Self.pidFile, atomically: true, encoding: .utf8)
        emit("device-xp-write", ["pid": String(getpid()), "declared": "195"])
    }
    func testPhaseCrossProcessRead() async throws {
        guard phase == "xpRead" else { throw XCTSkip("CH_PHASE=xpRead only") }
        let writer = try String(contentsOf: Self.pidFile, encoding: .utf8)
        let f = try await HostFixture.make("xp-device", clean: false)
        let _v3 = try await f.host.presentation().get().readings?.runCalibration?.heartRateFiveZones
        let z = try XCTUnwrap(_v3)
        emit("device-xp-read", ["writerPid": writer, "readerPid": String(getpid()), "kind": z.reference?.kind.raw ?? "-", "bpm": String(z.reference?.bpm ?? -1)])
        XCTAssertNotEqual(writer, "\(getpid())", "a new process")
        XCTAssertEqual(z.reference?.kind, "ATHLETE_DECLARED_MAXIMUM"); XCTAssertEqual(z.reference?.bpm, 195)
        TestEnv.cleanup("xp-device"); try? FileManager.default.removeItem(at: Self.pidFile.deletingLastPathComponent())
    }

    func testPhaseReinstall() async throws {
        guard phase == "reinstall1" || phase == "reinstall2" else { throw XCTSkip("CH_PHASE=reinstall1|reinstall2 only") }
        let marker = KeychainItems(prefix: TestEnv.prefix("reinstall-device"))
        if phase == "reinstall1" {
            let f = try await HostFixture.make("reinstall-device")
            _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
            f.clock.set(day: "2026-11-20", "10:00")
            let _v4 = (await f.host.restart(Athlete.answers(start: "2026-11-23", assessedAt: "2026-11-20", pain: true))).answer.planOutcome
            XCTAssertEqual(_v4, .clinicalHumanRequired)
            let id = try await f.host.allWeeks().get().flatMap(\.sessions).first { $0.executable }?.id ?? "-"
            let st = await f.host.startability(sessionId: id)
            XCTAssertEqual(st, .notStartable(reason: .clinicalHumanRequired))
            XCTAssertEqual(marker.set("marker.installed-before", Data("1".utf8)), errSecSuccess)
            emit("device-reinstall-1", ["file": f.host.store.rawData(f.host.athleteId) != nil ? "present" : "absent", "keychainItems": String(marker.accounts().count), "startability": "clinicalHumanRequired"])
        } else {
            let before = marker.accounts()
            let f = try await HostFixture.make("reinstall-device", clean: false)
            let plan = await f.host.plan(week: nil)
            let code: String = { if case .failure(let e) = plan { return e.code.raw }; return "OK" }()
            let st = await f.host.startability(sessionId: "w0-run-d1")
            emit("device-reinstall-2", ["reconciliation": f.host.reconciliation.rawValue, "keychainItemsBefore": String(before.count), "keychainItemsAfter": marker.accounts().joined(separator: ","), "newKey": String(f.host.productionKey?.created ?? false),
                                        "plan": code, "startability": "\(st)", "purge": f.callsAtOpen.joined(separator: ",")])
            XCTAssertEqual(f.host.reconciliation, .freshInstallPurged)
            XCTAssertTrue(before.contains("marker.installed-before"), "the Keychain survived the deletion of the app")
            // The leftovers (the marker, the anchor, the old key) are gone; the only item now is the NEW key this install created on its first
            // seal (the reads above), never the old one.
            XCTAssertFalse(marker.accounts().contains("marker.installed-before"), "the reconciliation removed this app's leftover Keychain items")
            XCTAssertFalse(marker.accounts().contains { $0.hasPrefix("anchor.") }, "no leftover anchor")
            XCTAssertTrue(Set(marker.accounts()).isSubset(of: [KeychainIntegrityKey.account]))
            XCTAssertEqual(f.host.productionKey?.created, true, "the integrity key of this install is new: the old one was removed")
            XCTAssertEqual(code, "NOT_ENROLLED", "a reinstall is a new install, never RECORD_LOST")
            XCTAssertEqual(st, .notStartable(reason: .recordUnavailable))
            XCTAssertEqual(f.callsAtOpen.first, "purge:FRESH_INSTALL")
            TestEnv.cleanup("reinstall-device")
        }
    }

    /// The device locked after the first unlock: the record and the Keychain anchor stay readable and writable (classes
    /// completeUntilFirstUserAuthentication and AfterFirstUnlockThisDeviceOnly). Waits up to 120 s for the lock; skipped if not locked in time.
    func testPhaseLockedDevice() async throws {
        guard phase == "locked" else { throw XCTSkip("CH_PHASE=locked only") }
        #if os(iOS)
        let f = try await HostFixture.make("locked-device")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        let bg = await MainActor.run { UIApplication.shared.beginBackgroundTask(withName: "ch-locked") {} }
        let canary = TestEnv.rootNoClean("locked-device").appendingPathComponent("canary-complete")
        try Data("canary".utf8).write(to: canary, options: .completeFileProtection)
        print("CHRESULT lock-wait {\"lockTheDeviceNow\":true}")
        var locked = false
        for _ in 0..<480 { if (try? Data(contentsOf: canary)) == nil { locked = true; break }; try await Task.sleep(nanoseconds: 250_000_000) }
        guard locked else { await MainActor.run { UIApplication.shared.endBackgroundTask(bg) }; throw XCTSkip("the device was not locked within 120 s") }
        f.clock.set(day: "2026-11-17", "07:00")
        let w = await f.host.submit(ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-11-17")))
        let plan = await f.host.plan(week: nil)
        let stillLocked = (try? Data(contentsOf: canary)) == nil
        await MainActor.run { UIApplication.shared.endBackgroundTask(bg) }
        emit("device-locked", ["locked": String(locked), "stillLocked": String(stillLocked), "write": w.answer.ok ? "OK" : w.answer.error?.code.raw ?? "-",
                               "read": (try? plan.get()) != nil ? "OK" : "-", "protection": f.host.store.protectionOf(f.host.athleteId) ?? "-", "keychainFailures": String(f.host.anchor.failures.count)])
        XCTAssertTrue(stillLocked); XCTAssertTrue(w.answer.ok); XCTAssertNotNil(try? plan.get()); XCTAssertTrue(f.host.anchor.failures.isEmpty)
        TestEnv.cleanup("locked-device")
        #else
        throw XCTSkip("iOS only")
        #endif
    }
}
