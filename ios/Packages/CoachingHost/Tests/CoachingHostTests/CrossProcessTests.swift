import Foundation
import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation

#if os(macOS)
/// N-5 / SEC-FPV-03 and the HR5 concurrency contract across REAL processes (macOS): separate `coachinghost-proc` processes over one native
/// store folder and one Keychain (the production Keychain key under a test prefix). The iPhone repeats the persistence and death proofs as
/// device phases (CoachingHostLab).
final class CrossProcessTests: XCTestCase {
    final class Proc {
        let p = Process(), inp = Pipe(), out = Pipe()
        var buffer = Data()
        init(root: URL, prefix: String, athlete: String) throws {
            let exe = Bundle(for: CrossProcessTests.self).bundleURL.deletingLastPathComponent().appendingPathComponent("coachinghost-proc")
            p.executableURL = exe
            p.arguments = ["--root", root.path, "--prefix", prefix, "--athlete", athlete, "--wall", String(TestClock.ms("2026-11-14T12:00:00-03:00"))]
            p.standardInput = inp; p.standardOutput = out; p.standardError = FileHandle.nullDevice
            try p.run()
            let r = try line(); precondition(r["ready"] as? Bool == true, "\(r)")
        }
        func send(_ o: [String: Any]) throws { inp.fileHandleForWriting.write(try JSONSerialization.data(withJSONObject: o) + Data("\n".utf8)) }
        func line() throws -> [String: Any] {
            while true {
                if let i = buffer.firstIndex(of: 0x0a) { let l = buffer[..<i]; buffer = Data(buffer[(i + 1)...]); return try JSONSerialization.jsonObject(with: l) as! [String: Any] }
                let d = out.fileHandleForReading.availableData
                if d.isEmpty { return ["eof": true, "status": p.isRunning ? -1 : Int(p.terminationStatus)] }
                buffer += d
            }
        }
        func call(_ o: [String: Any]) throws -> [String: Any] { try send(o); return try line() }
        func close() { try? send(["cmd": "exit"]); p.waitUntilExit() }
        var pid: Int32 { p.processIdentifier }
    }

    /// A handoff §7 test 6 (a): two processes race `setHeartRateProfile` on one record, 200 rounds; every declaration of every round is on record
    /// after the round (no lost update: the lock held from load to commit + the bytes CAS), and no write is refused or interleaved.
    func testTwoProcessesRaceHeartRateProfile() throws {
        let name = "xp-race"; TestEnv.cleanup(name)
        let root = TestEnv.root(name), prefix = TestEnv.prefix(name), athlete = "athlete-xp"
        let a = try Proc(root: root, prefix: prefix, athlete: athlete), b = try Proc(root: root, prefix: prefix, athlete: athlete)
        XCTAssertNotEqual(a.pid, b.pid)
        XCTAssertEqual(try a.call(["cmd": "enroll"])["ok"] as? Bool, true)
        var lost = 0, refused: [String] = [], rounds = 0
        let limits = [[130, 150, 165, 180], [131, 151, 166, 181]]
        for r in 0..<200 {
            try a.send(["cmd": "setMax", "bpm": 180 + r % 2]); try b.send(["cmd": "setLimits", "limits": limits[r % 2]])
            let ra = try a.line(), rb = try b.line()
            for x in [ra, rb] where x["ok"] as? Bool != true { refused.append(x["code"] as? String ?? "?") }
            let added = (ra["added"] as? [String] ?? []) + (rb["added"] as? [String] ?? [])
            XCTAssertEqual(added.count, 2, "round \(r): \(ra) \(rb)")
            let ids = Set(try a.call(["cmd": "hrIds"])["ids"] as? [String] ?? [])
            lost += added.filter { !ids.contains($0) }.count
            rounds += 1
        }
        let hr = try b.call(["cmd": "hr"])
        a.close(); b.close()
        emit("xp-hr5-race", ["rounds": rounds, "declarations": rounds * 2, "lost": lost, "refused": refused.count, "processes": 2])
        XCTAssertEqual(lost, 0); XCTAssertEqual(refused, [])
        XCTAssertEqual(hr["kind"] as? String, "ATHLETE_DECLARED_MAXIMUM")
        TestEnv.cleanup(name)
    }

    /// Test 6 (b): process 1 writes the profile and ends; a NEW process 2 reads ATHLETE_DECLARED_MAXIMUM 195 (store + Keychain anchor + key).
    func testPersistenceBetweenProcesses() throws {
        let name = "xp-persist"; TestEnv.cleanup(name)
        let root = TestEnv.root(name), prefix = TestEnv.prefix(name)
        let p1 = try Proc(root: root, prefix: prefix, athlete: "athlete-p")
        XCTAssertEqual(try p1.call(["cmd": "enroll"])["ok"] as? Bool, true)
        XCTAssertEqual(try p1.call(["cmd": "setMax", "bpm": 195])["ok"] as? Bool, true)
        let pid1 = p1.pid; p1.close()
        let p2 = try Proc(root: root, prefix: prefix, athlete: "athlete-p")
        let hr = try p2.call(["cmd": "hr"]); let pid2 = p2.pid; p2.close()
        emit("xp-persistence", ["writerPid": String(pid1), "readerPid": String(pid2), "kind": hr["kind"] as? String ?? "-", "bpm": String(hr["bpm"] as? Int ?? -1)])
        XCTAssertNotEqual(pid1, pid2)
        XCTAssertEqual(hr["kind"] as? String, "ATHLETE_DECLARED_MAXIMUM"); XCTAssertEqual(hr["bpm"] as? Int, 195); XCTAssertEqual(hr["declared"] as? Int, 195)
        TestEnv.cleanup(name)
    }

    /// NATIVE 1.1 across a real process death: killed after the rename (the retry with the same request id is `replayed`), or after the
    /// temporary file is synced and before the rename (the earlier record; the retry records anew; the dead writer's `.tmp` is removed).
    func testProcessDeathBeforeAndAfterRename() throws {
        for (fault, replay) in [("afterRename", true), ("afterTmp", false)] {
            let name = "xp-death-\(fault)"; TestEnv.cleanup(name)
            let root = TestEnv.root(name), prefix = TestEnv.prefix(name)
            let p1 = try Proc(root: root, prefix: prefix, athlete: "athlete-d")
            XCTAssertEqual(try p1.call(["cmd": "enroll"])["ok"] as? Bool, true)
            _ = try p1.call(["cmd": "arm", "fault": fault])
            let dead = try p1.call(["cmd": "screen", "rid": "death-1"])
            p1.p.waitUntilExit()
            XCTAssertEqual(dead["eof"] as? Bool, true, "the process died mid-write"); XCTAssertEqual(p1.p.terminationStatus, 137)
            let p2 = try Proc(root: root, prefix: prefix, athlete: "athlete-d")
            let v = try p2.call(["cmd": "version"])["version"] as? Int
            let retry = try p2.call(["cmd": "screen", "rid": "death-1"])
            p2.close()
            emit("xp-death-\(fault)", ["versionAfterDeath": String(v ?? -1), "retry": (retry["ok"] as? Bool) == true ? "OK" : "-", "replayed": String(retry["replayed"] as? Bool ?? false),
                                      "cleaned": (retry["cleaned"] as? [String] ?? []).joined(separator: ",")])
            XCTAssertEqual(v, replay ? 2 : 1, "\(fault): what the record holds after the death")
            XCTAssertEqual(retry["ok"] as? Bool, true); XCTAssertEqual(retry["replayed"] as? Bool, replay, fault)
            XCTAssertEqual(retry["version"] as? Int, 2)
            if !replay { XCTAssertEqual((retry["cleaned"] as? [String])?.count, 1, "the dead writer's .tmp removed under the lock") }
            TestEnv.cleanup(name)
        }
    }
}
#endif

/// Test 6 (c) and N-5's anchor: a carried blob rolled back to the same version is RECORD_ROLLED_BACK against the Keychain anchor; and the
/// anchor update never leaves a window without the item (update in place; a reader never sees it missing).
final class AnchorTests: XCTestCase {
    func testRollbackSameVersionAndAnchorWindow() async throws {
        let f = try await HostFixture.make("rollback")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        let before = try XCTUnwrap(f.host.store.raw(f.host.athleteId))
        let _v1 = try await f.host.setHeartRateProfile(HeartRateProfileRequest(maxHeartRateBpm: .some(195))).get().ok
        XCTAssertTrue(_v1)
        let anchor = try XCTUnwrap(f.host.anchor.get(f.host.athleteId))
        XCTAssertTrue(anchor.contains("carriedSeq"), "the anchor keeps carriedSeq: \(anchor)")
        XCTAssertEqual(NativeStore.versionOf(Data(before.utf8)), NativeStore.versionOf(f.host.store.rawData(f.host.athleteId)), "same custody version")
        f.host.store.setRaw(f.host.athleteId, before)
        guard case .failure(let e) = await f.host.plan(week: nil) else { return XCTFail("a rolled-back blob was read") }
        XCTAssertEqual(e.code, "RECORD_ROLLED_BACK")
        // The anchor window: 300 updates while another thread reads; never missing.
        let items = KeychainItems(prefix: TestEnv.prefix("anchor-window")); items.deleteAll()
        XCTAssertEqual(items.set("anchor.w", Data("0".utf8)), errSecSuccess)
        let stop = ManagedAtomicFlag(), missing = ManagedCounter()
        let reader = Thread { while !stop.value { if items.get("anchor.w").status == errSecItemNotFound { missing.add() } } }
        reader.start()
        for i in 1...300 { XCTAssertEqual(items.set("anchor.w", Data("\(i)".utf8)), errSecSuccess) }
        stop.value = true; Thread.sleep(forTimeInterval: 0.05)
        emit("anchor", ["rollback": e.code.raw, "updates": "300", "missingReads": String(missing.value)])
        XCTAssertEqual(missing.value, 0, "the anchor was never absent during its updates")
        items.deleteAll(); TestEnv.cleanup("rollback")
    }
}
final class ManagedAtomicFlag: @unchecked Sendable { private let l = NSLock(); private var v = false; var value: Bool { get { l.withLock { v } } set { l.withLock { v = newValue } } } }
final class ManagedCounter: @unchecked Sendable { private let l = NSLock(); private var v = 0; var value: Int { l.withLock { v } }; func add() { l.withLock { v += 1 } } }
