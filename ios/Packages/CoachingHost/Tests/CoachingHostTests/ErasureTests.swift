import Foundation
import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation
import IntegrationContracts

/// CCP-A-04 (QRE-A-04; Security R1 and Core R1 of `CCP_A_04_RESOLUTION.md`): an account erasure removes the record, the anchor, the side files
/// and the integrity key (6.3), and the erased athlete id stays GONE whatever the key (the native erasure fence). A new account (a new id)
/// is genuinely new. Synthetic ids only.
final class ErasureTests: XCTestCase {
    func exists(_ u: URL) -> Bool { FileManager.default.fileExists(atPath: u.path) }
    func files(_ f: HostFixture) -> [String] { ((try? FileManager.default.contentsOfDirectory(atPath: f.host.configuration.root.path)) ?? []).sorted() }
    func key(_ f: HostFixture) -> Data? { f.host.keychain.get(KeychainIntegrityKey.account).data }
    func code<T>(_ r: Result<T, BoundaryError>) -> String { if case .failure(let e) = r { return e.code.raw }; return "OK" }
    func enrolled(_ name: String, athlete: String? = nil) async throws -> HostFixture {
        let f = try await HostFixture.make(name, athlete: athlete)
        let o = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(o.answer.planOutcome, .planCreated)
        f.b.reset()
        return f
    }
    func activity(_ day: String) -> DeviceActivity {
        DeviceActivity(activityId: "HK-erasure-\(day)", sessionId: nil, observedAt: "\(day)T07:45:00-03:00",
                       actual: DeviceActual(completed: true, minutes: 40, distanceKm: 8.1, measurement: .gps, gpsQuality: .ok))
    }

    /// T1 effective erasure; T10 a repeat erasure is GONE and rewrites nothing.
    func testErasureIsEffectiveAndIdempotent() async throws {
        let f = try await enrolled("er-t1")
        let h = f.host, root = h.configuration.root
        _ = await h.setConsent(.healthSignals, granted: true)
        f.b.reset()
        XCTAssertNotNil(key(f)); XCTAssertNotNil(h.anchor.get(h.athleteId))
        let e = await h.eraseAccount()
        XCTAssertTrue(e.answer.ok)
        // Before any further call (a later GONE check creates a fresh, empty key: Security R1 F7).
        XCTAssertNil(key(f), "the integrity key is gone")
        XCTAssertFalse(exists(h.store.file(h.athleteId))); XCTAssertFalse(exists(h.store.file(h.athleteId).appendingPathExtension("tmp")))
        XCTAssertNil(h.keychain.get(KeychainAnchor.account(h.athleteId)).data, "the anchor is gone")
        XCTAssertFalse(exists(CoachingHost.signalsFile(root, h.tag))); XCTAssertFalse(exists(CoachingHost.clockFile(root, h.tag)))
        XCTAssertEqual(h.fence.state(h.tag), .erased, "B's purge returned")
        XCTAssertEqual(f.b.calls.map(\.name), ["purge:ACCOUNT_ERASED"])
        let fenceJSON = try JSONSerialization.jsonObject(with: Data(contentsOf: h.fence.file(h.tag))) as! [String: Any]
        XCTAssertEqual(Set(fenceJSON.keys), ["scope", "state"], "no time, no id, no key in the fence")
        XCTAssertTrue(files(f).filter { $0.hasPrefix("tombstone-") }.isEmpty, "the custody tombstones named by the removed key are removed (Security R1 F5)")
        let left = files(f)
        emit("ccp-a-04-t1", ["files": left.map { $0.hasPrefix("athlete-") ? "athlete-<tag>" + ($0.hasSuffix(".lock") ? ".lock" : ".json") : $0.hasPrefix("erased-") ? "erased-<tag>.json" : $0 }])
        XCTAssertEqual(Set(left.map { $0.hasPrefix("athlete-") && $0.hasSuffix(".lock") ? "lock" : $0.hasPrefix("erased-") ? "fence" : $0 }),
                       ["lock", "fence", "install-marker.json"], "only the data-free lock (QRE-A-07), the fence and the install marker remain")
        // T10: again, in the same process and after a restart: GONE from the custody, nothing rewritten.
        let mtime = try FileManager.default.attributesOfItem(atPath: h.fence.file(h.tag).path)[.modificationDate] as? Date
        let again = await h.eraseAccount()
        XCTAssertEqual(again.answer.error?.code, "GONE")
        let g = try await f.reopen()
        let third = await g.host.eraseAccount()
        XCTAssertEqual(third.answer.error?.code, "GONE")
        let mtime2 = try FileManager.default.attributesOfItem(atPath: h.fence.file(h.tag).path)[.modificationDate] as? Date
        XCTAssertEqual(mtime, mtime2, "a repeat erasure writes no new time-bearing file")
        XCTAssertFalse(exists(h.store.file(h.athleteId)))
        TestEnv.cleanup("er-t1")
    }

    /// T3 / T6: old record bytes put back (with the fence; without it; with the old anchor too) are never served.
    func testOldRecordRecoveryAndRollbackRefused() async throws {
        let f = try await enrolled("er-t3")
        let h = f.host
        let oldBytes = try XCTUnwrap(h.store.rawData(h.athleteId)), oldAnchor = try XCTUnwrap(h.keychain.get(KeychainAnchor.account(h.athleteId)).data)
        let oldKey = try XCTUnwrap(key(f))
        let _e = await h.eraseAccount(); XCTAssertTrue(_e.answer.ok)
        try oldBytes.write(to: h.store.file(h.athleteId))
        let p1 = code(await h.plan(week: nil)), s1 = code(await h.presentation()), o1 = await h.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual([p1, s1, o1.answer.error?.code.raw ?? "OK"], ["GONE", "GONE", "GONE"], "the fence refuses the restored record")
        // An attacker also deletes the fence: the old record was sealed under a key that no longer exists.
        try FileManager.default.removeItem(at: h.fence.file(h.tag))
        let g = try await f.reopen()
        let p2 = code(await g.host.plan(week: nil)), o2 = await g.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(p2, "INTEGRITY_FAILURE"); XCTAssertEqual(o2.answer.error?.code, "INTEGRITY_FAILURE")
        XCTAssertNotEqual(key(g), oldKey, "a later key is a new key")
        // T6: the old record AND the old anchor back (a rollback of both stores), fence deleted: still never served.
        g.host.keychain.set(KeychainAnchor.account(h.athleteId), oldAnchor)
        let r = try await f.reopen()
        let p3 = code(await r.host.plan(week: nil)), h3 = code(await r.host.history())
        XCTAssertEqual([p3, h3], ["INTEGRITY_FAILURE", "INTEGRITY_FAILURE"])
        emit("ccp-a-04-t3-t6", ["withFence": [p1, s1], "fenceDeleted": [p2, o2.answer.error?.code.raw ?? "OK"], "rolledBackWithAnchor": [p3, h3]])
        TestEnv.cleanup("er-t3")
    }

    /// T4: a new host instance and a new process: every read, write, delivery and the record-loss path give GONE; no side file comes back.
    func testRestartAndOtherProcessStayGone() async throws {
        let f = try await enrolled("er-t4")
        let root = f.host.configuration.root, id = f.host.athleteId
        let _e = await f.host.eraseAccount(); XCTAssertTrue(_e.answer.ok)
        let g = try await f.reopen()
        f.clock.set(day: "2026-11-17", "08:00")
        let reads = [code(await g.host.plan(week: nil)), code(await g.host.presentation()), code(await g.host.history())]
        let submit = await g.host.submit(ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-11-17")))
        let erase = await g.host.eraseHealthFacts(eventIds: ["ev-x"])
        let restart = await g.host.restart(Athlete.answers(start: "2026-11-23", assessedAt: "2026-11-17"))
        let ack = await g.host.acknowledgeRecordLoss()
        let onboard = await g.host.onboard(Athlete.answers(), consents: Athlete.all)
        let delivery = await g.host.deliver(try DeviceDelivery(deliveryId: UUID().uuidString, activities: [activity("2026-11-17")]))
        let ctx = await g.host.ingestContext()
        let writes = [submit, erase, restart, ack, onboard].map { $0.answer.error?.code.raw ?? "OK" }
        XCTAssertEqual(reads, ["GONE", "GONE", "GONE"]); XCTAssertEqual(writes, ["GONE", "GONE", "GONE", "GONE", "GONE"])
        guard case .halted(let dc) = delivery else { return XCTFail("\(delivery)") }
        XCTAssertEqual(dc, "GONE", "contract §6: a delivery for the erased account comes back GONE")
        guard case .unavailable(let ic) = ctx else { return XCTFail("\(ctx)") }
        XCTAssertEqual(ic, "GONE")
        XCTAssertFalse(exists(CoachingHost.signalsFile(root, g.host.tag)) || exists(CoachingHost.clockFile(root, g.host.tag)), "no side file recreated (F5)")
        XCTAssertFalse(exists(g.host.store.file(id)))
        var other: [String] = ["not run (iOS: no second process tool)"]
        #if os(macOS)
        // A new process (the real host in another PID).
        let p = try CrossProcessTests.Proc(root: root, prefix: TestEnv.prefix("er-t4"), athlete: id)
        let pe = try p.call(["cmd": "enroll"]), ph = try p.call(["cmd": "hr"]), pm = try p.call(["cmd": "setMax", "bpm": 190])
        p.close()
        other = [pe["status"] as? String ?? "-", ph["code"] as? String ?? "-", pm["code"] as? String ?? "-"]
        XCTAssertEqual(other, ["GONE", "GONE", "GONE"])
        XCTAssertFalse(exists(g.host.store.file(id)), "no process brings the record back")
        #endif
        emit("ccp-a-04-t4", ["reads": reads, "writes": writes, "delivery": [dc], "ingestContext": [ic], "otherProcess": other])
        TestEnv.cleanup("er-t4")
    }

    /// T5 reinstall; T7 a new account (new id) on the same install; T2 the old key does not serve it.
    func testNewAccountIsGenuinelyNew() async throws {
        let f = try await enrolled("er-t7")
        let h = f.host
        let oldKey = try XCTUnwrap(key(f)), oldBytes = try XCTUnwrap(h.store.rawData(h.athleteId))
        let _e = await h.eraseAccount(); XCTAssertTrue(_e.answer.ok)
        // T7: a new account is a new athlete id: enrols at once, with a new key, version 1, no old decision.
        let n = try await f.reopen(athlete: "athlete-er-t7-new-account")
        let o = await n.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(o.answer.planOutcome, .planCreated)
        let newKey = try XCTUnwrap(key(n))
        XCTAssertNotEqual(newKey, oldKey, "new crypto material")
        let v = await n.host.versionForTesting()
        XCTAssertEqual(v, 1)
        // T2: the old record put in the NEW account's place does not verify (other key, other athlete).
        let newBytes = try XCTUnwrap(n.host.store.rawData(n.host.athleteId))
        try oldBytes.write(to: n.host.store.file(n.host.athleteId))
        let r = try await f.reopen(athlete: "athlete-er-t7-new-account")
        let swapped = code(await r.host.plan(week: nil))
        XCTAssertNotEqual(swapped, "OK", "the old record never serves the new account")
        try newBytes.write(to: n.host.store.file(n.host.athleteId))
        // T5: a reinstall (the container goes, the Keychain stays): the same old id enrols as a new install, nothing old to recover.
        try FileManager.default.removeItem(at: h.configuration.root)
        let ri = try await f.reopen(athlete: h.athleteId)
        XCTAssertEqual(ri.host.reconciliation, .freshInstallPurged)
        let o2 = await ri.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(o2.answer.planOutcome, .planCreated)
        XCTAssertNotEqual(key(ri), oldKey); XCTAssertNotEqual(key(ri), newKey, "the reconciliation removed the leftover key")
        emit("ccp-a-04-t2-t5-t7", ["newAccount": "planCreated", "newKeyDiffers": "true", "oldRecordInNewPlace": swapped, "reinstallSameId": "planCreated"])
        TestEnv.cleanup("er-t7")
    }

    /// T8a: the fence cannot be written: nothing is erased or sent.
    func testFenceWriteFailureStartsNothing() async throws {
        let f = try await enrolled("er-t8a")
        let h = f.host, k = key(f)
        h.fence.writeHook = { false }
        let e = await h.eraseAccount()
        XCTAssertEqual(e.answer.error?.code, "PERSISTENCE_FAILURE")
        h.fence.writeHook = nil
        XCTAssertNil(h.fence.state(h.tag)); XCTAssertEqual(key(f), k); XCTAssertEqual(f.b.calls, [])
        let p = code(await h.plan(week: nil))
        XCTAssertEqual(p, "OK", "nothing was erased: the athlete retries")
        TestEnv.cleanup("er-t8a")
    }

    /// T8b: the boundary erasure fails (a store write fails). The fence stays REQUESTED; nothing but the erasure runs; the next operation
    /// completes it natively, and the purge owed to B is sent and returns (fence ERASED).
    func testBoundaryFailureIsCompletedLater() async throws {
        let f = try await enrolled("er-t8b")
        let h = f.host
        h.store.failWrites = true
        let e = await h.eraseAccount()
        h.store.failWrites = false
        XCTAssertFalse(e.answer.ok)
        XCTAssertEqual(h.fence.state(h.tag), .requested)
        // The next operation completes the native side first, then the fence answers.
        let p = code(await h.plan(week: nil))
        XCTAssertEqual(p, "GONE")
        XCTAssertFalse(exists(h.store.file(h.athleteId)))
        XCTAssertEqual(h.fence.state(h.tag), .nativeDone, "B's purge is owed")
        let w = await h.setConsent(.healthSignals, granted: true)
        XCTAssertEqual(w.answer.error?.code, "GONE")
        XCTAssertEqual(f.b.calls.map(\.name), ["purge:ACCOUNT_ERASED"]); XCTAssertEqual(h.fence.state(h.tag), .erased)
        TestEnv.cleanup("er-t8b")
    }

    /// T8c / T12: a native removal (the record, then the key) fails: the fence stays REQUESTED and NOTHING runs (no seal under a key due to be
    /// removed, no enrolment). The next start completes it, then re-sends B's purge.
    func testNativeRemovalFailureBlocksEverythingUntilCompleted() async throws {
        let f = try await enrolled("er-t8c")
        let h = f.host
        h.store.failErasureForTesting = true
        let e = await h.eraseAccount()
        XCTAssertEqual(e.answer.error?.code, "PERSISTENCE_FAILURE")
        XCTAssertEqual(h.fence.state(h.tag), .requested)
        XCTAssertEqual(f.b.calls.map(\.name), ["purge:ACCOUNT_ERASED"], "the boundary erased the record: B purges")
        let p = code(await h.plan(week: nil)), o = await h.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual([p, o.answer.error?.code.raw ?? "OK"], [HostCode.hostUnavailable, HostCode.hostUnavailable], "nothing runs while the erasure is incomplete")
        // The key's removal fails too (T12): still nothing runs.
        h.store.failErasureForTesting = false; h.productionKey?.failEraseForTesting = true
        let p2 = code(await h.plan(week: nil))
        XCTAssertEqual(p2, HostCode.hostUnavailable)
        XCTAssertEqual(h.fence.state(h.tag), .requested)
        // A new start completes it and sends the purge.
        let b2 = RecordingQueueControl()
        let g = try await f.reopen(b: b2)
        XCTAssertEqual(g.host.fence.state(g.host.tag), .erased)
        XCTAssertEqual(g.callsAtOpen, ["purge:ACCOUNT_ERASED", "deliveryConditionsChanged"], "the owed purge, then available")
        XCTAssertFalse(exists(g.host.store.file(g.host.athleteId)))
        let p3 = code(await g.host.plan(week: nil))
        XCTAssertEqual(p3, "GONE")
        TestEnv.cleanup("er-t8c")
    }

    /// Security R1 F2a: B's purge failing leaves it owed (fence NATIVE_DONE) and re-sent at the next start.
    func testPurgeFailureIsOwed() async throws {
        final class FailingB: DeviceQueueControl, @unchecked Sendable {
            var fail = false; var purges = 0
            func deliveryConditionsChanged() async {}
            func purge(_ reason: QueuePurgeReason) async throws { purges += 1; if fail { throw NSError(domain: "b", code: 1) } }
        }
        TestEnv.cleanup("er-purge")
        let b = FailingB()
        let h = try await CoachingHost.openForTesting(.init(athleteId: "athlete-er-purge", root: TestEnv.root("er-purge")), keychainPrefix: TestEnv.prefix("er-purge"),
                                                      queueControl: b, clock: TestClock(), testKeychainDirectory: TestEnv.keychainDirectory)
        h.timezoneOffsetOverride = -180
        _ = await h.onboard(Athlete.answers(), consents: Athlete.all)
        b.fail = true      // B worked at the first open (an owed fresh-install purge blocks an enrolment, #49 P2-2); now it fails
        let e = await h.eraseAccount()
        XCTAssertTrue(e.answer.ok)
        XCTAssertEqual(h.fence.state(h.tag), .nativeDone, "the purge did not return: owed")
        b.fail = false
        let h2 = try await CoachingHost.openForTesting(.init(athleteId: "athlete-er-purge", root: TestEnv.rootNoClean("er-purge")), keychainPrefix: TestEnv.prefix("er-purge"),
                                                       queueControl: b, clock: TestClock(), testKeychainDirectory: TestEnv.keychainDirectory)
        XCTAssertEqual(h2.fence.state(h2.tag), .erased); XCTAssertEqual(b.purges, 3, "fresh install; the erasure's (failed); re-sent at the next start")
        // Code review R1 #5c: while a purge is owed, no new athlete enrols (B must be purged before a new athlete's data reaches it).
        let x = try await CoachingHost.openForTesting(.init(athleteId: "athlete-er-purge-2", root: TestEnv.rootNoClean("er-purge")), keychainPrefix: TestEnv.prefix("er-purge"),
                                                      queueControl: b, clock: TestClock(), testKeychainDirectory: TestEnv.keychainDirectory)
        x.timezoneOffsetOverride = -180
        _ = await x.onboard(Athlete.answers(), consents: Athlete.all)
        b.fail = true
        _ = await x.eraseAccount()
        XCTAssertEqual(x.fence.state(x.tag), .nativeDone)
        let y = try await CoachingHost.openForTesting(.init(athleteId: "athlete-er-purge-3", root: TestEnv.rootNoClean("er-purge")), keychainPrefix: TestEnv.prefix("er-purge"),
                                                      queueControl: b, clock: TestClock(), testKeychainDirectory: TestEnv.keychainDirectory)
        y.timezoneOffsetOverride = -180
        let refused = await y.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(refused.answer.error?.code.raw, HostCode.hostUnavailable, "an owed purge blocks a new enrolment")
        // B works again: the next write's wrapper (after its own refusal, since the purge was still owed at its check) settles the purge,
        // and the enrolment after that goes through.
        b.fail = false
        let second = await y.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(second.answer.error?.code.raw, HostCode.hostUnavailable)
        XCTAssertEqual(x.fence.state(x.tag), .erased, "settled after that write")
        let third = await y.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(third.answer.planOutcome, .planCreated)
        TestEnv.cleanup("er-purge")
    }

    /// T11 (Core R1 F2): an id that was never enrolled is fenced by its erasure too (A's host-level outcome: a new account is a new athlete).
    func testNeverEnrolledIdIsFenced() async throws {
        let f = try await HostFixture.make("er-t11")
        _ = await f.host.onboard(Athlete.answers(special: [.pregnancy]), consents: Athlete.all)
        let e = await f.host.eraseAccount()
        XCTAssertEqual(e.answer.error?.code, "NOT_ENROLLED")
        XCTAssertEqual(f.host.fence.state(f.host.tag), .erased)
        let o = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(o.answer.error?.code, "GONE", "pinned: the erased id stays erased; the person returns with a new account id")
        TestEnv.cleanup("er-t11")
    }

    /// Security R1 F1: one enrolled athlete per install; an install that already holds two (from before the rule) keeps the key the other needs.
    func testOneAthletePerInstallAndTheOtherRecordSurvives() async throws {
        let x = try await enrolled("er-xy", athlete: "athlete-er-x")
        let y = try await x.reopen(athlete: "athlete-er-y")
        let refused = await y.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(refused.answer.error?.code, "ANOTHER_ATHLETE_ON_THIS_INSTALL")
        // Build the pre-rule state by hand: Y's record enrolled while X's record was set aside.
        let xFile = x.host.store.file(x.host.athleteId), aside = xFile.appendingPathExtension("aside")
        try FileManager.default.moveItem(at: xFile, to: aside)
        let oy = await y.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(oy.answer.planOutcome, .planCreated)
        try FileManager.default.moveItem(at: aside, to: xFile)
        let x2 = try await x.reopen()
        let ex = await x2.host.eraseAccount()
        XCTAssertTrue(ex.answer.ok)
        XCTAssertNotNil(key(x2), "the key Y's record needs stays")
        let y2 = try await x.reopen(athlete: "athlete-er-y")
        let py = code(await y2.host.plan(week: nil))
        XCTAssertEqual(py, "OK", "Y still verifies after X's erasure")
        let px = code(await x2.host.plan(week: nil))
        XCTAssertEqual(px, "GONE")
        TestEnv.cleanup("er-xy")
    }

    /// Code review R1 #1: another host instance that cached the old key never seals a new enrolment with it.
    func testCachedOldKeyNeverSealsANewEnrolment() async throws {
        let x = try await enrolled("er-key", athlete: "athlete-er-key-x")
        let y = try await x.reopen(athlete: "athlete-er-key-y")
        let before = code(await y.host.plan(week: nil))       // computes the subject: Y's instance now caches K1
        XCTAssertEqual(before, "NOT_ENROLLED")
        let k1 = try XCTUnwrap(key(x))
        let e = await x.host.eraseAccount()
        XCTAssertTrue(e.answer.ok); XCTAssertNil(key(x), "K1 removed")
        let o = await y.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(o.answer.planOutcome, .planCreated)
        let k2 = try XCTUnwrap(key(y))
        XCTAssertNotEqual(k2, k1)
        let y2 = try await x.reopen(athlete: "athlete-er-key-y")
        let after = code(await y2.host.plan(week: nil))
        XCTAssertEqual(after, "OK", "Y's record is sealed under the key the Keychain holds, never the removed one")
        emit("ccp-a-04-cached-key", ["newEnrolment": "planCreated", "reopened": after])
        TestEnv.cleanup("er-key")
    }

    /// Security R1 F6/F8: an unreadable fence fences but never drives a removal; a malformed fence name is ignored.
    func testUnreadableAndMalformedFences() async throws {
        let f = try await enrolled("er-bad")
        let h = f.host, root = h.configuration.root
        try Data("REQUESTED".utf8).write(to: root.appendingPathComponent("erased-NOT-A-TAG.json"))
        try Data(#"{"scope":"ACCOUNT","state":"REQUESTED"}"#.utf8).write(to: root.appendingPathComponent("erased-../x.json".replacingOccurrences(of: "/", with: "_")))
        let g = try await f.reopen()
        let p = code(await g.host.plan(week: nil))
        XCTAssertEqual(p, "OK", "malformed fence names are ignored")
        // The athlete's own fence whose bytes cannot be read (protected data unavailable; here, no read permission): the athlete is fenced
        // and nothing is removed on that guess.
        try Data("not json".utf8).write(to: h.fence.file(h.tag))
        chmod(h.fence.file(h.tag).path, 0o000)
        let r = try await f.reopen()
        let p2 = code(await r.host.plan(week: nil))
        XCTAssertEqual(p2, HostCode.hostUnavailable, "an unreadable fence blocks: the erasure is not known to be complete")
        XCTAssertTrue(exists(r.host.store.file(r.host.athleteId)), "never removed on a guess")
        // Readable again but not decodable (code review R1 #6): its existence proves the request, so the erasure completes; no permanent block.
        chmod(h.fence.file(h.tag).path, 0o600)
        let r2 = try await f.reopen()
        let p3 = code(await r2.host.plan(week: nil))
        XCTAssertEqual(p3, "GONE"); XCTAssertFalse(exists(r2.host.store.file(r2.host.athleteId)))
        TestEnv.cleanup("er-bad")
    }

    /// T9: concurrency. Writes and a delivery queued with the erasure answer OK (before it) or GONE (after it), never recreate the record; a
    /// second process writing during the erasure leaves no record behind.
    func testConcurrentOperationsAndASecondProcess() async throws {
        let f = try await enrolled("er-t9")
        let h = f.host, root = h.configuration.root, id = h.athleteId
        f.clock.set(day: "2026-11-17", "08:00")
        #if os(macOS)
        let p = try CrossProcessTests.Proc(root: root, prefix: TestEnv.prefix("er-t9"), athlete: id)
        let other = Task.detached { () -> [String] in
            var out: [String] = []
            for bpm in 180..<200 { let r = (try? p.call(["cmd": "setMax", "bpm": bpm])) ?? [:]; out.append((r["ok"] as? Bool == true) ? "OK" : (r["code"] as? String ?? "-")) }
            return out
        }
        #else
        let other = Task.detached { () -> [String] in [] }
        #endif
        let dd = try DeviceDelivery(deliveryId: UUID().uuidString, activities: [activity("2026-11-17")])
        async let s1 = h.submit(ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-11-17")))
        async let d1 = h.deliver(dd)
        async let e = h.eraseAccount()
        async let s2 = h.setConsent(.learning, granted: false)
        let (a, b, c, d) = await (s1, d1, e, s2)
        let procResults = await other.value
        #if os(macOS)
        p.close()
        #endif
        // Contention: the erasure may wait out the lock 3 times, then answers it is pending (never BUSY, #49 P3-5); the next operation completes it.
        XCTAssertTrue(c.answer.ok || c.answer.error?.code.raw == HostCode.hostUnavailable, "\(String(describing: c.answer.error?.code))")
        for w in [a, d] { XCTAssertTrue(w.answer.ok || ["GONE", "BUSY"].contains(w.answer.error?.code.raw ?? "-"), "\(String(describing: w.answer.error?.code))") }
        // Refusals that write nothing are allowed under contention: BUSY (B retries later) and, for the second process whose fixed clock is
        // behind the in-process writes, CLOCK_BEHIND_RECORD.
        switch b { case .answered: break; case .halted(let code): XCTAssertEqual(code, "GONE"); case .retryLater(let code): XCTAssertEqual(code, "BUSY"); default: XCTFail("\(b)") }
        XCTAssertTrue(procResults.allSatisfy { ["OK", "GONE", "BUSY", "CLOCK_BEHIND_RECORD"].contains($0) }, "\(procResults)")
        if let i = procResults.firstIndex(of: "GONE") { XCTAssertFalse(procResults[i...].contains("OK"), "after GONE, the other process never writes again") }
        let after = code(await h.plan(week: nil))
        XCTAssertEqual(after, "GONE")
        XCTAssertFalse(exists(h.store.file(id)), "no record is left or recreated")
        XCTAssertFalse(exists(CoachingHost.signalsFile(root, h.tag)) || exists(CoachingHost.clockFile(root, h.tag)), "no side file outlives the erasure")
        emit("ccp-a-04-t9", ["otherProcess": procResults.reduce(into: [String: Int]()) { $0[$1, default: 0] += 1 }.map { "\($0.key)=\($0.value)" }.sorted()])
        TestEnv.cleanup("er-t9")
    }

    /// Core R1 F4: the fence serves `tombstoneOf` for this host's actor only, which is faithful because the pinned bundle has exactly two
    /// call sites, both `store.tombstoneOf(subjectOf(actor.athleteId))`. A bundle change that adds one fails here (re-review CCP-A-04).
    func testPinnedBundleTombstoneCallSites() throws {
        #if !os(macOS)
        throw XCTSkip("macOS: reads the repository's bundle file")
        #endif
        let js = try String(contentsOf: TestEnv.repo.appendingPathComponent("ios/Packages/CoachingHost/Sources/CoachingHost/Resources/coachinghost.js"), encoding: .utf8)
        let calls = js.components(separatedBy: "tombstoneOf(").count - 1
        let actorCalls = js.components(separatedBy: "store.tombstoneOf(subjectOf(actor.athleteId))").count - 1
        emit("ccp-a-04-tombstone-call-sites", ["all": calls, "actorSubject": actorCalls])
        XCTAssertEqual(actorCalls, 2)
        XCTAssertEqual(calls, 4, "the two custody calls plus the two adapter pass-throughs (integration.mjs:100, the facade's native adapter)")
    }
}
