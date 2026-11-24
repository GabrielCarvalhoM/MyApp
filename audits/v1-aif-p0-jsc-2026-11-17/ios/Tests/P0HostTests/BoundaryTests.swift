import Foundation
import XCTest
import CryptoKit
import P0Host
#if canImport(UIKit)
import UIKit
#endif

// REPMILE CoachingCore V1 final physical validation (2026-11-24): the integration boundary in JavaScriptCore (Mac README §14 step 3, §15), the
// host's CryptoKit HMAC, and the native store and Keychain contract (NATIVE_OBLIGATIONS §1, §2, §6.3). Every expected value comes from a Node
// oracle (int-oracle.mjs, final-oracle.mjs, hmac-oracle.mjs); nothing here decides training. Any DIVERGED step fails.
//
// The guarded tests run only when xcodebuild passes TEST_RUNNER_P0_PHASE (the variable reaches the test process as P0_PHASE):
//   P0_PHASE=deathA1  kills the process right after a commit's rename, before the answer (the run is reported as crashed, by design)
//   P0_PHASE=deathB1  kills the process after the temporary file is written and synced, before the rename
//   P0_PHASE=recover  a new process over the same files and Keychain: A answers `replayed`, B is the earlier record and records anew
//   P0_PHASE=locked   waits for the device to be locked, then reads and writes the store and the Keychain while locked
//   P0_PHASE=reinstall1 / reinstall2   before and after the app is deleted and installed again
final class BoundaryTests: XCTestCase {
    struct Fx: Decodable { let driver: String; let inputJSON: String }
    static func fixture(_ name: String) throws -> (fx: Fx, expected: [String: Any], data: Data) {
        guard let url = Bundle.module.url(forResource: name, withExtension: "json", subdirectory: "Fixtures") else { throw CoachingCoreRuntime.P0Error.resource(name) }
        let data = try Data(contentsOf: url)
        let o = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        return (try JSONDecoder().decode(Fx.self, from: data), o["expected"] as! [String: Any], data)
    }
    /// The fixture keys are synthetic references the Node oracle passed as the key text itself; the host stores those bytes in the Keychain under
    /// the reference's digest and reads them back from the Keychain (once per runtime) whenever the bundle asks for an HMAC.
    static func keychainKeys(_ refs: [String]) -> (String) -> Data? {
        for r in refs { Keychain.set("key." + digest(r), Data(r.utf8)) }
        var cache: [String: Data] = [:]
        return { ref in if let k = cache[ref] { return k }; let d = Keychain.get("key." + digest(ref)).data; cache[ref] = d; return d }
    }
    static func digest(_ s: String) -> String { String(CoachingCoreRuntime.hex(SHA256.hash(data: Data(s.utf8))).prefix(24)) }
    static func supportDir(_ name: String) throws -> URL {
        let base = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        return base.appendingPathComponent("p0-boundary").appendingPathComponent(name)
    }
    static func moduleExpr() throws -> String {
        let ids = try CoachingCoreRuntime.bundleModuleIds(), id = { (f: String) throws -> Int in
            guard let i = ids["CoachingCore/src/" + f] else { throw CoachingCoreRuntime.P0Error.resource("module " + f) }; return i }
        return "integration: __p0req(\(try id("boundary/integration.mjs"))), store: __p0req(\(try id("boundary/store.mjs"))), api: __p0req(\(try id("boundary/api.mjs"))), value: __p0req(\(try id("value.mjs")))"
    }

    /// IDENTICAL: every digest of the step equal to Node's. EXPLAINED_LIBM (RFC-NUMERIC-1): only `answer`/`stored` differ, while the step's digests
    /// without the Race Forecast, of the canonical record and of the forecasts at 9 significant digits are equal (final.json). LIBM_CANDIDATE:
    /// an int.json step (int-driver.js has no such digests) where only `answer`/`stored` differ; it is accepted only if the same step of the
    /// same journey replayed by final-driver.js (`final-<journey>`) is IDENTICAL or EXPLAINED_LIBM. DIVERGED: anything else; it fails.
    enum StepVerdict: String, Codable { case IDENTICAL, EXPLAINED_LIBM, LIBM_CANDIDATE, DIVERGED }
    struct Report: Codable { let fixture: String; let store: String; let digestEqual: Bool; let diverged: [String]; let explainedLibm: [String]; let identical: Int; let journeys: Int; let steps: Int; let wallMs: Double
        let hmacCalls: Int; let hmacMs: Double; let constantTimeEqualCalls: Int; let footprintMB: Double; let peakMB: Double; let bundleSha256: String; let anchorWrites: Int?; let keychainFailures: [Int32]? }

    /// Replays a boundary fixture in the device JSContext over the memory store or the native store + Keychain anchor and compares every step.
    @discardableResult
    func replay(_ name: String, global: String, native: Bool, verdicts: UnsafeMutablePointer<[String: StepVerdict]>? = nil) async throws -> Report {
        let (fx, expected, _) = try Self.fixture(name)
        // Every key reference the input names: the fixture's own and any journey's (final.json replays int.json's journeys with int.json's key).
        let input = try JSONSerialization.jsonObject(with: Data(fx.inputJSON.utf8)) as! [String: Any]
        let refs = Set([input["key"] as! String] + ((input["journeys"] as? [[String: Any]]) ?? []).compactMap { $0["key"] as? String })
        let rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.boundary", exposeModules: true, keys: Self.keychainKeys(Array(refs)))
        let bridge = native ? try NativeBridge(root: try Self.supportDir("\(name)-native"), anchorPrefix: "test.\(name)") : nil
        let mods = try Self.moduleExpr()
        let extra = native ? ", newStore: n => { if (!__nstore.select(n)) throw new Error('select'); return __nativeStore(); }, newAnchor: n => __keychainAnchor()" : ""
        let t0 = Clock.ms()
        let raw = try await rt.run { rt -> String in
            if let bridge { try rt.installNative(bridge) }
            _ = try rt.evaluate(fx.driver)
            _ = try rt.evaluate("globalThis.__runB = i => \(global)({ \(mods)\(extra) }, i);")
            return try rt.callGlobal("__runB", [fx.inputJSON])
        }
        let wall = Clock.ms() - t0
        let got = try JSONSerialization.jsonObject(with: Data(raw.utf8)) as! [String: Any]
        let gj = got["journeys"] as! [[String: Any]], ej = expected["journeys"] as! [[String: Any]]
        var diverged: [String] = [], explained: [String] = [], identical = 0, all: [String: StepVerdict] = [:]
        XCTAssertEqual(gj.map { $0["name"] as! String }, ej.map { $0["name"] as! String })
        for (a, b) in zip(gj, ej) {
            let gs = a["steps"] as! [[String: Any]], es = b["steps"] as! [[String: Any]]
            XCTAssertEqual(gs.count, es.count, "\(a["name"]!) steps")
            for (k, (s, e)) in zip(gs, es).enumerated() {
                let id = "\(a["name"]!)#\(k)", v: StepVerdict
                if (s as NSDictionary).isEqual(to: e) { v = .IDENTICAL; identical += 1 }
                else {
                    var rs = s, re = e; for key in ["answer", "stored"] { rs.removeValue(forKey: key); re.removeValue(forKey: key) }
                    let rest = (rs as NSDictionary).isEqual(to: re), classified = e["canonical"] != nil || e["storedSans"] != nil || e["answerSans"] != nil
                    v = !rest ? .DIVERGED : classified ? .EXPLAINED_LIBM : .LIBM_CANDIDATE
                    if v == .DIVERGED { diverged.append(id) } else { explained.append(id) }
                }
                all[id] = v
            }
        }
        verdicts?.pointee = all
        let digestEqual = (got["digest"] as? String) == (expected["digest"] as? String)
        let h = try await rt.run { try hostCalls($0) }
        assertHostClean(h, name)
        let fp = Memory.footprintMB(), sha = try CoachingCoreRuntime.bundleSha256()
        XCTAssertEqual(sha.manifest, sha.shipped, "the shipped bundle is the one the manifest names")
        let rep = Report(fixture: name, store: native ? "native-file+keychain" : "memory", digestEqual: digestEqual, diverged: diverged, explainedLibm: explained, identical: identical, journeys: gj.count,
                         steps: gj.map { ($0["steps"] as! [Any]).count }.reduce(0, +), wallMs: wall, hmacCalls: rt.host.hmacCalls, hmacMs: Double(rt.host.hmacNanos) / 1e6,
                         constantTimeEqualCalls: rt.host.constantTimeEqualCalls, footprintMB: fp.current, peakMB: fp.lifetimePeak, bundleSha256: sha.shipped,
                         anchorWrites: bridge?.anchorWrites, keychainFailures: bridge?.keychainFailures)
        if !diverged.isEmpty || !digestEqual { let a = XCTAttachment(string: raw); a.name = "\(name)-\(native ? "native" : "memory")-reply.json"; a.lifetime = .keepAlways; add(a)
            if let d = ProcessInfo.processInfo.environment["P0_DUMP_DIR"] { try? raw.write(toFile: d + "/\(name)-\(native ? "native" : "memory")-reply.json", atomically: true, encoding: .utf8) } }
        await emit("boundary-\(name)-\(native ? "native" : "memory")", rep)
        XCTAssertTrue(diverged.isEmpty, "DIVERGED steps: \(diverged)")
        XCTAssertTrue(digestEqual || (diverged.isEmpty && !explained.isEmpty), "the cross-runtime digest differs from Node beyond EXPLAINED_LIBM steps")
        XCTAssertGreaterThan(rt.host.hmacCalls, 0, "the boundary sealed through the host's CryptoKit HMAC")
        if let bridge { XCTAssertTrue(bridge.keychainFailures.isEmpty, "Keychain statuses: \(bridge.keychainFailures)"); XCTAssertGreaterThan(bridge.anchorWrites, 0) }
        Keychain.deleteAll(prefix: "test.\(name)")
        for r in refs { Keychain.delete("key." + Self.digest(r)) }
        if let bridge { try? FileManager.default.removeItem(at: bridge.root) }
        return rep
    }

    /// README §14 step 3 (`testIntegrationBoundary`): int.json (journeys B, D, G, H) over the memory store; `stored` equal in every step proves the
    /// host's HMAC gives Node's seals.
    func testIntegrationBoundary() async throws {
        var intV: [String: StepVerdict] = [:], finalV: [String: StepVerdict] = [:]
        try await replay("int", global: "__intfocal", native: false, verdicts: &intV)
        let candidates = intV.filter { $0.value == .LIBM_CANDIDATE }.map { $0.key }.sorted()
        if !candidates.isEmpty { try await replay("final", global: "__finalfocal", native: false, verdicts: &finalV) }
        let unexplained = candidates.filter { ![StepVerdict.IDENTICAL, .EXPLAINED_LIBM].contains(finalV["final-" + $0]) }
        await emit("boundary-int-classified", ["candidates": candidates.count, "unexplained": unexplained.count])
        XCTAssertTrue(unexplained.isEmpty, "int.json steps not explained by their final-driver replay: \(unexplained)")
    }
    /// Journeys A, C, E, F, G07, SEC-BC-R2-01, the clock (D1) and storage failures, through createIntegration and the frozen api.mjs.
    func testFinalJourneys() async throws { try await replay("final", global: "__finalfocal", native: false) }
    /// The same final journeys over the native file store and the Keychain anchor: the same answers and the same stored digests.
    func testFinalJourneysNativeStore() async throws { try await replay("final", global: "__finalfocal", native: true) }
    func testIntegrationBoundaryNativeStore() async throws {
        // int-driver.js builds its own memory store; the native run of the same operations is testFinalJourneysNativeStore.
        throw XCTSkip("int-driver.js has no store hook; covered by testFinalJourneysNativeStore")
    }

    /// CryptoKit HMAC<SHA256> equal to Node's createHmac, directly and through the JSContext host function, and the constant-time comparison.
    func testHmacVectors() async throws {
        guard let url = Bundle.module.url(forResource: "hmac", withExtension: "json", subdirectory: "Fixtures") else { throw CoachingCoreRuntime.P0Error.resource("hmac") }
        struct V: Codable { let key: String; let text: String?; let `repeat`: String?; let count: Int?; let hex: String }
        struct E: Codable { let a: String; let b: String; let equal: Bool }
        struct F: Codable { let vectors: [V]; let constantTimeEqual: [E] }
        let f = try JSONDecoder().decode(F.self, from: Data(contentsOf: url))
        let text = { (v: V) -> String in v.text ?? String(repeating: v.repeat!, count: v.count!) }
        var direct = 0
        for v in f.vectors {
            let mac = CoachingCoreRuntime.hex(HMAC<SHA256>.authenticationCode(for: Data(text(v).utf8), using: SymmetricKey(data: Data(v.key.utf8))))
            XCTAssertEqual(mac, v.hex, "CryptoKit \(v.key.prefix(12)) / \(text(v).prefix(16))"); if mac == v.hex { direct += 1 }
        }
        let rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.hmac", keys: Self.keychainKeys(Array(Set(f.vectors.map { $0.key }))))
        let vjson = String(data: try JSONEncoder().encode(f.vectors), encoding: .utf8)!, ejson = String(data: try JSONEncoder().encode(f.constantTimeEqual), encoding: .utf8)!
        let out = try await rt.run { rt -> String in
            _ = try rt.evaluate("globalThis.__hm = (v, e) => JSON.stringify({ macs: JSON.parse(v).map(x => __p0host.hmacSHA256(x.key, x.text ?? x.repeat.repeat(x.count))), eq: JSON.parse(e).map(x => __p0host.constantTimeEqual(x.a, x.b)) });")
            return try rt.callGlobal("__hm", [vjson, ejson])
        }
        struct O: Codable { let macs: [String]; let eq: [Bool] }
        let o = try JSONDecoder().decode(O.self, from: Data(out.utf8))
        XCTAssertEqual(o.macs, f.vectors.map { $0.hex }, "through the JSContext host function")
        XCTAssertEqual(o.eq, f.constantTimeEqual.map { $0.equal })
        let keychainAccessible = Keychain.accessible("key." + Self.digest(f.vectors[0].key))
        struct R: Codable { let vectors: Int; let direct: Int; let viaJS: Int; let constantTimeEqual: Int; let keychainAccessible: String? }
        await emit("hmac-vectors", R(vectors: f.vectors.count, direct: direct, viaJS: zip(o.macs, f.vectors).filter { $0 == $1.hex }.count, constantTimeEqual: o.eq.count, keychainAccessible: keychainAccessible))
        #if os(iOS)
        XCTAssertEqual(keychainAccessible, kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly as String)
        #endif
        for k in Set(f.vectors.map { $0.key }) { Keychain.delete("key." + Self.digest(k)) }
    }

    /// One writer: two threads commit the same version of the same athlete 200 times; exactly one wins each round, the other is refused.
    func testConcurrentWriters() throws {
        let dir = try Self.supportDir("concurrent"); try? FileManager.default.removeItem(at: dir)
        let s = try NativeFileStore(dir: dir)
        XCTAssertEqual(try s.commit("a", expected: nil, text: #"{"version":1}"#), #"{"ok":true}"#)
        var wins = 0, refusals = 0, other = 0
        for v in 1...200 {
            var r = [String](repeating: "", count: 2); let g = DispatchGroup()
            for i in 0..<2 { g.enter(); DispatchQueue.global().async { r[i] = (try? s.commit("a", expected: v, text: "{\"version\":\(v + 1),\"w\":\(i)}")) ?? "thrown"; g.leave() } }
            g.wait()
            for x in r { if x == #"{"ok":true}"# { wins += 1 } else if x.contains("busy") || x.contains("conflict") { refusals += 1 } else { other += 1 } }
        }
        XCTAssertEqual(wins, 200); XCTAssertEqual(refusals, 200); XCTAssertEqual(other, 0)
        XCTAssertEqual(NativeFileStore.versionOf(s.raw("a")), 201)
        struct R: Codable { let rounds: Int; let wins: Int; let refusals: Int; let protection: String? }
        let p = s.protectionOf("a")
        MainActor.assumeIsolated { emit("native-concurrent-writers", R(rounds: 200, wins: wins, refusals: refusals, protection: p)) }
        #if os(iOS)
        XCTAssertEqual(p, FileProtectionType.completeUntilFirstUserAuthentication.rawValue)
        #endif
        try? FileManager.default.removeItem(at: dir)
    }

    // MARK: persistence through the boundary over the native store (enroll and a review of journey final-c-strength, custody's own random ids)

    static let persistDriver = """
    globalThis.__persist = function (M, inputJSON, name, stepsJSON) {
      const input = JSON.parse(inputJSON), j = input.journeys.find(x => x.name === name), ks = JSON.parse(stepsJSON);
      let clock = 0; const it = M.integration.createIntegration({ store: __nativeStore(), key: input.key, clock: () => clock, anchor: __keychainAnchor() });
      const out = [];
      for (const k of ks) { const s = j.steps[k]; clock = s.at; const r = it[s.op.slice(3)]({ actor: { athleteId: j.athleteId }, ...s.args });
        out.push({ k, op: s.op, code: r.ok === false ? r.error.code : 'OK', replayed: r.replayed === true, version: r.version ?? null }); }
      const rd = it.read({ actor: { athleteId: j.athleteId } });
      return JSON.stringify({ steps: out, read: rd.ok ? 'OK' : rd.error.code, version: rd.ok ? rd.doc.version : null });
    };
    """
    struct PStep: Codable { let k: Int; let op: String; let code: String; let replayed: Bool; let version: Int? }
    struct POut: Codable { let steps: [PStep]; let read: String; let version: Int? }
    func persist(_ bridge: NativeBridge, _ steps: [Int], before: ((NativeBridge) -> Void)? = nil) async throws -> POut {
        let (fx, _, _) = try Self.fixture("final")
        let key = (try JSONSerialization.jsonObject(with: Data(fx.inputJSON.utf8)) as! [String: Any])["key"] as! String
        let rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.persist", exposeModules: true, keys: Self.keychainKeys([key]))
        let mods = try Self.moduleExpr(), sj = String(data: try JSONEncoder().encode(steps), encoding: .utf8)!
        let raw = try await rt.run { rt -> String in
            try rt.installNative(bridge); before?(bridge)
            _ = try rt.evaluate(Self.persistDriver)
            _ = try rt.evaluate("globalThis.__runP = (i, n, s) => __persist({ \(mods) }, i, n, s);")
            return try rt.callGlobal("__runP", [fx.inputJSON, "final-c-strength", sj])
        }
        return try JSONDecoder().decode(POut.self, from: Data(raw.utf8))
    }

    /// A write that fails (the disk full, simulated at the native store) confirms nothing: PERSISTENCE_FAILURE, the earlier record unchanged.
    func testWriteFailureConfirmsNothing() async throws {
        let root = try Self.supportDir("write-failure"); try? FileManager.default.removeItem(at: root)
        let b = try NativeBridge(root: root, anchorPrefix: "test.wf"); try b.select("wf")
        let first = try await persist(b, [0]); XCTAssertEqual(first.steps.map { $0.code }, ["OK"]); let before = b.store.raw("fc")
        let failed = try await persist(b, [1]) { $0.store.failWrites = true }
        XCTAssertEqual(failed.steps.map { $0.code }, ["PERSISTENCE_FAILURE"]); XCTAssertEqual(b.store.raw("fc"), before)
        b.store.failWrites = false
        let again = try await persist(b, [1]); XCTAssertEqual(again.steps.map { $0.code }, ["OK"]); XCTAssertEqual(again.version, 2)
        await emit("native-write-failure", ["failed": failed.steps[0].code, "after": again.read, "version": String(again.version ?? -1)])
        Keychain.deleteAll(prefix: "test.wf"); try? FileManager.default.removeItem(at: root)
    }

    var phase: String? { ProcessInfo.processInfo.environment["P0_PHASE"] }
    static let deathRoot = "death"

    func testPhaseDeathA1_KillAfterRename() async throws {
        guard phase == "deathA1" else { throw XCTSkip("P0_PHASE=deathA1 only") }
        let root = try Self.supportDir(Self.deathRoot); try? FileManager.default.removeItem(at: root.appendingPathComponent("A"))
        let b = try NativeBridge(root: root, anchorPrefix: "test.death"); try b.select("A")
        let e1 = try await persist(b, [0]); XCTAssertEqual(e1.steps.map { $0.code }, ["OK"])
        print("P0RESULT death-A1 {\"enrolled\":true,\"killing\":\"after rename, before the answer\"}")
        _ = try await persist(b, [1]) { $0.store.faultAfterRename = { _exit(137) } }
        XCTFail("unreachable: the process was to be killed")
    }
    func testPhaseDeathB1_KillBeforeRename() async throws {
        guard phase == "deathB1" else { throw XCTSkip("P0_PHASE=deathB1 only") }
        let root = try Self.supportDir(Self.deathRoot); try? FileManager.default.removeItem(at: root.appendingPathComponent("B"))
        let b = try NativeBridge(root: root, anchorPrefix: "test.death"); try b.select("B")
        let e2 = try await persist(b, [0]); XCTAssertEqual(e2.steps.map { $0.code }, ["OK"])
        print("P0RESULT death-B1 {\"enrolled\":true,\"killing\":\"after the temporary file is synced, before the rename\"}")
        _ = try await persist(b, [1]) { $0.store.faultAfterTmp = { _exit(137) } }
        XCTFail("unreachable: the process was to be killed")
    }
    func testPhaseDeathRecover() async throws {
        guard phase == "recover" else { throw XCTSkip("P0_PHASE=recover only") }
        let root = try Self.supportDir(Self.deathRoot)
        struct R: Codable { let cleanedAtStart: [String]; let readBeforeRetry: String; let versionBeforeRetry: Int?; let retry: String; let replayed: Bool; let versionAfter: Int?; let readAfter: String }
        var out: [String: R] = [:]
        for (dirName, expectReplay) in [("A", true), ("B", false)] {
            // A new process over the same directory and the same Keychain items (the store and the anchor of the killed process).
            let s = try NativeFileStore(dir: root.appendingPathComponent(dirName))
            let b = try NativeBridge(root: root, anchorPrefix: "test.death|\(dirName)|"); b.adopt(s, prefix: "test.death|\(dirName)|")
            let look = try await persist(b, [])
            let retry = try await persist(b, [1])
            out[dirName] = R(cleanedAtStart: s.cleanedAtStart, readBeforeRetry: look.read, versionBeforeRetry: look.version, retry: retry.steps[0].code,
                             replayed: retry.steps[0].replayed, versionAfter: retry.version, readAfter: retry.read)
            XCTAssertEqual(look.read, "OK", "\(dirName): the record after the death is readable and verifies")
            XCTAssertEqual(retry.steps[0].code, "OK"); XCTAssertEqual(retry.steps[0].replayed, expectReplay, "\(dirName) replayed")
            XCTAssertEqual(look.version, expectReplay ? 2 : 1, "\(dirName): what the record holds after the death")
            XCTAssertEqual(retry.version, 2)
        }
        await emit("death-recover", out)
        Keychain.deleteAll(prefix: "test.death"); try? FileManager.default.removeItem(at: root)
    }

    /// The device locked after first unlock: the store file and the Keychain anchor stay readable and writable (the classes HealthKit background
    /// delivery needs). Waits up to 120 s for the lock; skipped when the device is not locked in time.
    func testPhaseLockedDevice() async throws {
        guard phase == "locked" else { throw XCTSkip("P0_PHASE=locked only") }
        #if os(iOS)
        let root = try Self.supportDir("locked"); try? FileManager.default.removeItem(at: root)
        let b = try NativeBridge(root: root, anchorPrefix: "test.locked"); try b.select("L")
        let e3 = try await persist(b, [0]); XCTAssertEqual(e3.steps.map { $0.code }, ["OK"])
        // The host app is suspended when the screen locks: ask for background time, and detect the lock off the main thread with a canary
        // written under .complete protection (unreadable once the class A keys are discarded, about 10 s after locking).
        let bg = await MainActor.run { UIApplication.shared.beginBackgroundTask(withName: "p0-locked") {} }
        let canary = root.appendingPathComponent("canary-complete")
        try Data("canary".utf8).write(to: canary, options: .completeFileProtection)
        print("P0RESULT lock-wait {\"lockTheDeviceNow\":true}")
        var locked = false
        for _ in 0..<480 { if (try? Data(contentsOf: canary)) == nil { locked = true; break }; try await Task.sleep(nanoseconds: 250_000_000) }
        guard locked else { await MainActor.run { UIApplication.shared.endBackgroundTask(bg) }; throw XCTSkip("the device was not locked within 120 s") }
        let review = try await persist(b, [1])
        let stillLocked = (try? Data(contentsOf: canary)) == nil
        await MainActor.run { UIApplication.shared.endBackgroundTask(bg) }
        struct R: Codable { let locked: Bool; let stillLocked: Bool; let read: String; let write: String; let version: Int?; let protection: String?; let keychainFailures: [Int32] }
        let r = R(locked: locked, stillLocked: stillLocked, read: review.read, write: review.steps[0].code, version: review.version, protection: b.store.protectionOf("fc"), keychainFailures: b.keychainFailures)
        await emit("locked-device", r)
        XCTAssertTrue(stillLocked, "the device stayed locked during the read and the write")
        XCTAssertEqual(review.steps[0].code, "OK"); XCTAssertEqual(review.read, "OK"); XCTAssertTrue(b.keychainFailures.isEmpty)
        Keychain.deleteAll(prefix: "test.locked"); try? FileManager.default.removeItem(at: root)
        #else
        throw XCTSkip("iOS only")
        #endif
    }

    /// Reinstall: phase 1 writes a record and its anchor; the app is deleted and installed again; phase 2 reads what is left.
    func testPhaseReinstall() async throws {
        guard phase == "reinstall1" || phase == "reinstall2" else { throw XCTSkip("P0_PHASE=reinstall1|reinstall2 only") }
        let root = try Self.supportDir("reinstall")
        if phase == "reinstall1" {
            try? FileManager.default.removeItem(at: root)
            let b = try NativeBridge(root: root, anchorPrefix: "test.reinstall"); try b.select("R")
            let e4 = try await persist(b, [0, 1]); XCTAssertEqual(e4.steps.map { $0.code }, ["OK", "OK"])
            Keychain.set("test.reinstall.marker", Data("installed-before".utf8))
            await emit("reinstall-1", ["file": b.store.raw("fc") != nil ? "present" : "absent", "anchor": "written"])
        } else {
            let s = try NativeFileStore(dir: root.appendingPathComponent("R"))
            let b = try NativeBridge(root: root, anchorPrefix: "test.reinstall|R|"); b.adopt(s, prefix: "test.reinstall|R|")
            let look = try await persist(b, [])
            let marker = Keychain.get("test.reinstall.marker")
            struct R: Codable { let fileAfterReinstall: Bool; let keychainMarker: String; let keychainStatus: Int32; let read: String }
            let r = R(fileAfterReinstall: s.raw("fc") != nil, keychainMarker: marker.data.flatMap { String(data: $0, encoding: .utf8) } ?? "absent", keychainStatus: marker.status, read: look.read)
            await emit("reinstall-2", r)
            Keychain.deleteAll(prefix: "test.reinstall"); Keychain.delete("test.reinstall.marker"); try? FileManager.default.removeItem(at: root)
        }
    }
}
