import Foundation
import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation
import IntegrationContracts

/// The fixes of QRE/Security review R1 (reviews/QRE_SECURITY_R1.md). Each test fails without its fix.
final class ReviewFixTests: XCTestCase {
    /// QRE-A-01: an exempt operation under a clock ahead neither moves the reference nor ends the refusal: the next submit is still refused,
    /// and B is not told conditions changed.
    func testExemptOperationDoesNotLaunderAnAheadClock() async throws {
        let clock = TestClock()
        let f = try await HostFixture.make("qre01", clock: clock)
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        clock.setWallOnly(clock.wall + 86_400_000)            // one day ahead, no time passing
        let r = await f.host.submit(ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-11-15")))
        XCTAssertEqual(r.answer.error?.code, "CLOCK_AHEAD_OF_REFERENCE")
        f.b.reset()
        let _v1 = (await f.host.setConsent(.learning, granted: false)).answer.ok
        XCTAssertTrue(_v1, "revocation passes")
        let _v2 = try await f.host.eraseHeartRateProfile().get().ok
        XCTAssertTrue(_v2, "the heart-rate erasure passes")
        XCTAssertEqual(f.b.calls, [], "an exempt operation is not a clock recovery")
        let again = await f.host.submit(ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-11-15")))
        XCTAssertEqual(again.answer.error?.code, "CLOCK_AHEAD_OF_REFERENCE", "the clock ahead was not laundered into the reference")
        let d = await f.host.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [DeviceActivity(activityId: "HK-q1", observedAt: "2026-11-15T07:00:00-03:00", actual: DeviceActual(completed: true, minutes: 30))]))
        XCTAssertEqual(d, .waiting(code: HostCode.clockAheadOfReference))
        TestEnv.cleanup("qre01")
    }

    /// QRE-A-02: a restart is marked in flight before it is sent; if the resolution cannot be written, nothing starts, also in a new process;
    /// if the marker cannot be written, nothing is sent. The same for the erasure's screen-required signal.
    func testSafetySignalsAreDurableBeforeTheOperation() async throws {
        let f = try await HostFixture.make("qre02")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        f.clock.set(day: "2026-11-20", "10:00")
        // The marker write fails: the restart is not sent.
        f.host.signals.writeHook = { false }
        let refused = await f.host.restart(Athlete.answers(special: [.postpartum], start: "2026-11-23", assessedAt: "2026-11-20"))
        XCTAssertEqual(refused.answer.error?.code, "PERSISTENCE_FAILURE")
        // The marker is written, the resolution is not (a death between the answer and the write, as far as the disk is concerned).
        var n = 0; f.host.signals.writeHook = { n += 1; return n == 1 }
        let r = await f.host.restart(Athlete.answers(special: [.postpartum], start: "2026-11-23", assessedAt: "2026-11-20"))
        XCTAssertEqual(r.answer.planOutcome, .outsideV1Scope(reason: "Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1"))
        let _v3 = try await f.host.allWeeks().get().flatMap(\.sessions).first { $0.executable }?.id
        let id = try XCTUnwrap(_v3)
        let here = await f.host.startability(sessionId: id)
        XCTAssertEqual(here, .notStartable(reason: .recordUnavailable), "not durable: nothing starts in this process")
        let g = try await f.reopen()
        let there = await g.host.startability(sessionId: id)
        XCTAssertEqual(there, .notStartable(reason: .recordUnavailable), "a new process finds the restart in flight: nothing starts")
        // The erasure: the screen-required signal is on disk before the erasure is sent.
        g.host.signals.writeHook = { false }
        let e = await g.host.eraseHealthFacts(eventIds: ["any"])
        XCTAssertEqual(e.answer.error?.code, "PERSISTENCE_FAILURE", "no erasure without its signal on disk first")
        g.host.signals.writeHook = nil
        // #49 P3-5: the exact order: the signal is on disk, then the erasure is sent (the boundary's telemetry of it). The earlier attempt's
        // signal, kept in memory when its write failed, is written with it and never withdrawn (fail closed), so it stays set.
        var order: [String] = []
        g.host.signals.writeHook = { order.append("signal-written"); return true }
        HostLog.tap = { if $0.contains("\"op\":\"erasure\"") { order.append("erasure-sent") } }
        let refusedErasure = await g.host.eraseHealthFacts(eventIds: ["unknown-id"])
        HostLog.tap = nil; g.host.signals.writeHook = nil
        XCTAssertEqual(refusedErasure.answer.error?.code.raw, "NOT_FOUND")
        XCTAssertEqual(order, ["signal-written", "erasure-sent"], "durable before it is sent")
        let h = try await g.reopen()
        XCTAssertTrue(h.host.signals.current.screenRequiredAfterErasure, "the erasure's signal is on disk")
        XCTAssertTrue(h.host.signals.current.pendingIntake, "the unresolved restart is still in flight")
        TestEnv.cleanup("qre02")
    }

    /// QRE-A-03: a Keychain read that fails is an error, not "no anchor": a rolled-back record is never served as valid while it fails.
    func testKeychainReadFailureFailsClosed() async throws {
        let f = try await HostFixture.make("qre03")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        let before = try XCTUnwrap(f.host.store.raw(f.host.athleteId))
        let _v4 = try await f.host.setHeartRateProfile(HeartRateProfileRequest(maxHeartRateBpm: .some(195))).get().ok
        XCTAssertTrue(_v4)
        f.host.store.setRaw(f.host.athleteId, before)          // a rolled-back carried blob at the same version
        f.host.anchor.failReadsForTesting = true
        let plan = await f.host.plan(week: nil)
        guard case .failure = plan else { return XCTFail("served a record while the anchor could not be read") }
        let w = await f.host.submit(ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-11-14")))
        XCTAssertFalse(w.answer.ok); XCTAssertEqual(f.host.store.raw(f.host.athleteId), before, "nothing committed over it")
        f.host.anchor.failReadsForTesting = false
        guard case .failure(let e) = await f.host.plan(week: nil) else { return XCTFail("rollback not detected") }
        XCTAssertEqual(e.code, "RECORD_ROLLED_BACK")
        TestEnv.cleanup("qre03")
    }

    /// QRE-A-05: the warning-sign gate is released only by the answer to a request that carried sign answers or a screen.
    func testWarningSignGateNotReleasedByAnUnrelatedReport() async throws {
        let f = try await HostFixture.make("qre05")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        let stop = AthleteObservation.plannedRun(sessionId: "w0-run-d1", occurrenceDate: "2026-11-17", observedAt: "2026-11-17T07:20:00-03:00",
                                                 actual: PlannedRunActual(completed: false, minutes: 12, rpe: 7, stop: RunStop(reason: .symptom)), response: .unknown)
        f.clock.set(day: "2026-11-17", "19:00")
        let a = await f.host.submit(ReviewRequest(.sessionReports([stop]), eligibility: Athlete.screen("2026-11-17")))
        XCTAssertEqual(a.answer.warningSignScreen?.status, "REQUIRED"); XCTAssertTrue(f.host.signals.current.warningSignsAsked)
        let other = AthleteObservation.unplannedRun(occurrenceDate: "2026-11-18", observedAt: "2026-11-18T18:00:00-03:00", actual: UnplannedRunActual(completed: true, minutes: 20, rpe: 3), response: .unknown)
        f.clock.set(day: "2026-11-18", "19:00")
        let u = await f.host.submit(ReviewRequest(.sessionReports([other]), eligibility: nil))
        XCTAssertTrue(u.answer.ok)
        XCTAssertTrue(f.host.signals.current.warningSignsAsked, "an unrelated report does not release the gate")
        TestEnv.cleanup("qre05")
    }

    /// QRE-A-06: the native side is erased even when the boundary holds no record (a refused onboarding left a scope-free record-less athlete).
    func testEraseAccountWithoutARecordErasesTheNativeSide() async throws {
        let f = try await HostFixture.make("qre06")
        _ = await f.host.onboard(Athlete.answers(special: [.pregnancy]), consents: Athlete.all)
        _ = await f.host.onQueue { f.host.signals.update { $0.scope = .clinicalHumanRequired } }    // on the engine queue (it takes the lock)
        XCTAssertTrue(FileManager.default.fileExists(atPath: f.host.signals.file.path))
        XCTAssertEqual(f.b.calls, [], "a refused onboarding enrols nothing: B is not told")
        let e = await f.host.eraseAccount()
        XCTAssertEqual(e.answer.error?.code, "NOT_ENROLLED")
        XCTAssertFalse(FileManager.default.fileExists(atPath: f.host.signals.file.path), "signals erased")
        XCTAssertEqual(f.b.calls.map(\.name), ["purge:ACCOUNT_ERASED"])
        TestEnv.cleanup("qre06")
    }

    /// QRE-A-10: the bytes-CAS refuses a commit at the same version over bytes another writer changed after this operation's load.
    func testBytesCompareAndSwap() throws {
        TestEnv.cleanup("qre10-cas")
        let s = try NativeStore(dir: TestEnv.root("qre10-cas"))
        XCTAssertEqual(try s.commit("a", expected: nil, text: #"{"version":1,"x":0}"#), #"{"ok":true}"#)
        let r = try s.withLock("a") { () throws -> String in
            _ = s.load("a")
            try s.atomicWrite(Data(#"{"version":1,"x":1}"#.utf8), to: s.file("a"))      // another writer, same version, after this load
            return try s.commit("a", expected: 1, text: #"{"version":1,"x":2}"#)
        }
        XCTAssertTrue(r.contains("conflict")); XCTAssertEqual(s.bytesConflicts, 1)
        XCTAssertEqual(s.raw("a"), #"{"version":1,"x":1}"#, "the other writer's bytes kept")
        TestEnv.cleanup("qre10-cas")
    }

    /// QRE-A-10: three stale versions resolved inside A, then `halted` (contract §6.1).
    func testStaleRetriesThenHalted() async throws {
        let f = try await HostFixture.make("qre10-stale")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        f.host.versionSkewForTesting = 4
        let id = UUID().uuidString
        let r = await f.host.deliver(try DeviceDelivery(deliveryId: id, activities: [DeviceActivity(activityId: "HK-st", observedAt: "2026-11-14T11:00:00-03:00", actual: DeviceActual(completed: true, minutes: 30))]))
        XCTAssertEqual(r, .halted(code: "CONFLICT_STALE_VERSION"))
        XCTAssertEqual(Array(f.host.sentRequestIds.suffix(4)), [id, id + "~1", id + "~2", id + "~3"])
        TestEnv.cleanup("qre10-stale")
    }

    #if os(macOS)
    /// QRE-A-10: the FND-ABC-04 signal across REAL processes: process 1 restarts with postpartum and ends; process 2 starts nothing.
    func testScopeSignalAcrossRealProcesses() throws {
        let name = "qre10-xp"; TestEnv.cleanup(name)
        let root = TestEnv.root(name), prefix = TestEnv.prefix(name)
        let p1 = try CrossProcessTests.Proc(root: root, prefix: prefix, athlete: "athlete-s")
        XCTAssertEqual(try p1.call(["cmd": "enroll"])["ok"] as? Bool, true)
        let r = try p1.call(["cmd": "restartPostpartum"]); XCTAssertEqual(r["status"] as? String, "UNSUPPORTED")
        p1.close()
        let p2 = try CrossProcessTests.Proc(root: root, prefix: prefix, athlete: "athlete-s")
        let s = try p2.call(["cmd": "startability"]); p2.close()
        emit("qre-a-10-xp-scope", ["executable": String(s["executable"] as? Int ?? -1), "startability": (s["startability"] as? [String] ?? []).joined(separator: ",")])
        XCTAssertGreaterThan(s["executable"] as? Int ?? 0, 0, "the engine keeps the earlier plan executable")
        XCTAssertEqual(s["startability"] as? [String], ["notStartable(reason: CoachingPresentation.NotStartableReason.outsideV1Scope)"])
        TestEnv.cleanup(name)
    }
    #endif
}
