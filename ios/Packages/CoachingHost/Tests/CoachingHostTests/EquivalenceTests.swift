import Foundation
import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost

/// A handoff §7 test 2 (handoff §10 rule): the PRODUCTION bundle (this package's, with the app facade and app-projections.mjs linked) replays
/// the HR5R oracle fixtures `core`, `int`, `final` and `hr5` (98 steps) with 0 DIVERGED, over the memory store and over this package's native
/// file store + Keychain anchor. The drivers are the fixtures' own (Node oracles); they reach the boundary modules through `__p0req` by
/// repository path (the module ids of this bundle, never the harness's). IDENTICAL / EXPLAINED_LIBM (RFC-NUMERIC-1) / DIVERGED as in HR5R.
final class EquivalenceTests: XCTestCase {
    enum StepVerdict: String, Codable { case IDENTICAL, EXPLAINED_LIBM, LIBM_CANDIDATE, DIVERGED }
    struct Report: Codable { let fixture: String; let store: String; let digestEqual: Bool; let diverged: [String]; let explainedLibm: Int; let identical: Int
        let journeys: Int; let steps: Int; let hmacCalls: Int; let anchorWrites: Int?; let keychainFailures: [Int32]?; let bundleSha256: String }

    /// The fixture drivers' store hooks (`newStore(name)`, `newAnchor(name)`) over a fresh native store folder and Keychain prefix per journey.
    final class Bridge {
        let root: URL; let prefix: String
        var store: NativeStore; var anchor: KeychainAnchor
        init(root: URL, prefix: String) throws {
            self.root = root; self.prefix = prefix
            store = try NativeStore(dir: root.appendingPathComponent("default")); anchor = KeychainAnchor(items: KeychainItems(prefix: prefix))
        }
        func select(_ name: String) throws {
            let d = root.appendingPathComponent(name); try? FileManager.default.removeItem(at: d)
            store = try NativeStore(dir: d)
            let items = KeychainItems(prefix: prefix + name + "."); items.deleteAll()
            let w = anchor.writes, f = anchor.failures
            anchor = KeychainAnchor(items: items); writesBefore += w; failuresBefore += f
        }
        var writesBefore = 0, failuresBefore: [Int32] = []
        var writes: Int { writesBefore + anchor.writes }
        var failures: [Int32] { failuresBefore + anchor.failures }
        func install(_ rt: EngineRuntime) throws {
            let b = self
            let load: @convention(block) (String) -> String? = { b.store.raw($0) }
            let commit: @convention(block) (String, Int, Bool, String) -> String = { id, v, none, text in (try? b.store.commit(id, expected: none ? nil : v, text: text)) ?? "{\"thrown\":\"write\"}" }
            let remove: @convention(block) (String) -> Void = { b.store.remove($0) }
            let tomb: @convention(block) (String, String) -> String? = { s, t in (try? b.store.tombstone(s, t)) == nil ? "write" : nil }
            let tombOf: @convention(block) (String) -> String? = { b.store.tombstoneOf($0) }
            let setRaw: @convention(block) (String, String) -> Void = { b.store.setRaw($0, $1) }
            let select: @convention(block) (String) -> Bool = { (try? b.select($0)) != nil }
            rt.install("__nstore", ["raw": unsafeBitCast(load, to: AnyObject.self), "commit": unsafeBitCast(commit, to: AnyObject.self), "remove": unsafeBitCast(remove, to: AnyObject.self),
                                    "tombstone": unsafeBitCast(tomb, to: AnyObject.self), "tombstoneOf": unsafeBitCast(tombOf, to: AnyObject.self), "setRaw": unsafeBitCast(setRaw, to: AnyObject.self),
                                    "select": unsafeBitCast(select, to: AnyObject.self)])
            let aget: @convention(block) (String) -> String? = { b.anchor.get($0) }
            let aset: @convention(block) (String, String) -> Bool = { b.anchor.set($0, $1) }
            let aclear: @convention(block) (String) -> Void = { b.anchor.clear($0) }
            rt.install("__nanchor", ["get": unsafeBitCast(aget, to: AnyObject.self), "set": unsafeBitCast(aset, to: AnyObject.self), "clear": unsafeBitCast(aclear, to: AnyObject.self)])
            _ = try rt.evaluate("""
            globalThis.__nativeStore = () => ({
              load: id => { const t = __nstore.raw(id); return t === null || t === undefined ? null : JSON.parse(t); },
              commit: (id, v, doc) => { const r = JSON.parse(__nstore.commit(id, v === null || v === undefined ? -1 : v, v === null || v === undefined, JSON.stringify(doc))); if (r.thrown) throw new Error(r.thrown); return r; },
              remove: id => { __nstore.remove(id); },
              tombstone: (s, t) => { const e = __nstore.tombstone(s, JSON.stringify(t)); if (e) throw new Error(e); },
              tombstoneOf: s => { const t = __nstore.tombstoneOf(s); return t === null || t === undefined ? null : JSON.parse(t); },
              raw: id => { const t = __nstore.raw(id); return t === null || t === undefined ? null : t; },
              setRaw: (id, t) => { __nstore.setRaw(id, t); }
            });
            globalThis.__keychainAnchor = () => ({
              get: id => { const t = __nanchor.get(id); return t === null || t === undefined || t === '' ? null : JSON.parse(t); },
              set: (id, v) => { if (!__nanchor.set(id, JSON.stringify(v))) throw new Error('keychain write failed'); },
              clear: id => { __nanchor.clear(id); }
            });
            """)
        }
    }

    static func runtime(_ label: String) throws -> (EngineRuntime, DispatchQueue) {
        let q = DispatchQueue(label: label)
        let rt = try q.sync { try EngineRuntime(queue: q, keys: FixtureKeys(), exposeModules: true, testMode: true) }
        return (rt, q)
    }
    static func moduleExpr() throws -> String {
        let ids = try EngineRuntime.moduleIds()
        func id(_ f: String) throws -> Int { guard let i = ids["CoachingCore/src/" + f] else { throw EngineRuntime.Failure.resource(f) }; return i }
        return "integration: __p0req(\(try id("boundary/integration.mjs"))), store: __p0req(\(try id("boundary/store.mjs"))), api: __p0req(\(try id("boundary/api.mjs"))), value: __p0req(\(try id("value.mjs")))"
    }
    static func hostClean(_ rt: EngineRuntime) throws -> (misses: [String], unsupported: [String]) {
        let o = try JSONSerialization.jsonObject(with: Data(try rt.call("hostCalls").utf8)) as! [String: Any]
        return (o["misses"] as? [String] ?? [], o["unsupported"] as? [String] ?? [])
    }

    @discardableResult
    func replay(_ name: String, global: String, native: Bool, verdicts: UnsafeMutablePointer<[String: StepVerdict]>? = nil) throws -> Report {
        struct Fx: Decodable { let driver: String; let inputJSON: String }
        let data = try TestEnv.fixture(name), fx = try JSONDecoder().decode(Fx.self, from: data)
        let expected = (try JSONSerialization.jsonObject(with: data) as! [String: Any])["expected"] as! [String: Any]
        let (rt, q) = try Self.runtime("eq.\(name)")
        let tag = "eq-\(name)-\(native ? "native" : "memory")"
        TestEnv.cleanup(tag)
        let bridge = native ? try Bridge(root: TestEnv.root(tag), prefix: TestEnv.prefix(tag)) : nil
        let mods = try Self.moduleExpr()
        let extra = native ? ", newStore: n => { if (!__nstore.select(n)) throw new Error('select'); return __nativeStore(); }, newAnchor: n => __keychainAnchor()" : ""
        let raw: String = try q.sync {
            if let bridge { try bridge.install(rt) }
            _ = try rt.evaluate(fx.driver)
            _ = try rt.evaluate("globalThis.__runB = i => \(global)({ \(mods)\(extra) }, i);")
            return try rt.callGlobal("__runB", [fx.inputJSON])
        }
        let got = try JSONSerialization.jsonObject(with: Data(raw.utf8)) as! [String: Any]
        let gj = got["journeys"] as! [[String: Any]], ej = expected["journeys"] as! [[String: Any]]
        var diverged: [String] = [], explained = 0, identical = 0, all: [String: StepVerdict] = [:]
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
                    if v == .DIVERGED { diverged.append(id) } else { explained += 1 }
                }
                all[id] = v
            }
        }
        verdicts?.pointee = all
        let digestEqual = (got["digest"] as? String) == (expected["digest"] as? String)
        let clean = try q.sync { try Self.hostClean(rt) }
        XCTAssertTrue(clean.misses.isEmpty, "\(name): assets asked for but not bundled: \(clean.misses)")
        XCTAssertTrue(clean.unsupported.isEmpty, "\(name): host functions asked for but not provided: \(clean.unsupported)")
        let rep = Report(fixture: name, store: native ? "native-file+keychain" : "memory", digestEqual: digestEqual, diverged: diverged, explainedLibm: explained,
                         identical: identical, journeys: gj.count, steps: gj.map { ($0["steps"] as! [Any]).count }.reduce(0, +), hmacCalls: rt.counters.hmac,
                         anchorWrites: bridge?.writes, keychainFailures: bridge?.failures, bundleSha256: BundlePin.bundleSha256)
        emit("equivalence-\(name)-\(native ? "native" : "memory")", rep)
        XCTAssertTrue(diverged.isEmpty, "DIVERGED steps: \(diverged)")
        XCTAssertTrue(digestEqual || (diverged.isEmpty && explained > 0), "the cross-runtime digest differs from Node beyond EXPLAINED_LIBM steps")
        XCTAssertGreaterThan(rt.counters.hmac, 0, "the boundary sealed through the host's CryptoKit HMAC")
        if let bridge { XCTAssertTrue(bridge.failures.isEmpty, "Keychain statuses: \(bridge.failures)"); XCTAssertGreaterThan(bridge.writes, 0) }
        TestEnv.cleanup(tag)
        return rep
    }

    func testHR5R() throws { try replay("hr5", global: "__hr5", native: false) }
    func testHR5RNativeStore() throws { try replay("hr5", global: "__hr5", native: true) }
    func testFinal() throws { try replay("final", global: "__finalfocal", native: false) }
    func testFinalNativeStore() throws { try replay("final", global: "__finalfocal", native: true) }
    /// int.json (journeys B, D, G, H); a step where only `answer`/`stored` differ is accepted only if the same step replayed by final-driver.js
    /// (`final-<journey>`) is IDENTICAL or EXPLAINED_LIBM (HR5R rule).
    func testInt() throws {
        var intV: [String: StepVerdict] = [:], finalV: [String: StepVerdict] = [:]
        try replay("int", global: "__intfocal", native: false, verdicts: &intV)
        let candidates = intV.filter { $0.value == .LIBM_CANDIDATE }.map(\.key).sorted()
        if !candidates.isEmpty { try replay("final", global: "__finalfocal", native: false, verdicts: &finalV) }
        let unexplained = candidates.filter { ![StepVerdict.IDENTICAL, .EXPLAINED_LIBM].contains(finalV["final-" + $0]) }
        emit("equivalence-int-classified", ["candidates": candidates.count, "unexplained": unexplained.count])
        XCTAssertTrue(unexplained.isEmpty, "int.json steps not explained by their final-driver replay: \(unexplained)")
    }

    /// Core Safety & Lifecycle (24 journeys, 171 steps): the composed engine entry, the contract and value modules, by path.
    func testCore() throws {
        struct Core: Decodable {
            struct Step: Codable, Equatable { let op: String; let status: String?; let proposal: Bool?; let namespace: String?; let answer: String?; let stable: String?; let persisted: String?; let error: String? }
            struct Journey: Codable, Equatable { let name: String; let steps: [Step] }
            struct Out: Codable { let journeys: [Journey]; let anchors: [String: String]; let localeCompareCalls: Int; let digest: String }
            let driver: String, inputJSON: String, expected: Out
        }
        let fx = try JSONDecoder().decode(Core.self, from: try TestEnv.fixture("core"))
        let ids = try EngineRuntime.moduleIds()
        let core = try XCTUnwrap(ids["CoachingCore/src/v1-safety-index.mjs"]), contract = try XCTUnwrap(ids["CoachingCore/src/r5-contract.mjs"]), value = try XCTUnwrap(ids["CoachingCore/src/value.mjs"])
        let (rt, q) = try Self.runtime("eq.core")
        let raw: String = try q.sync {
            _ = try rt.evaluate(fx.driver)
            _ = try rt.evaluate("globalThis.__coreRun = i => __corefocal({ core: __p0req(\(core)), contract: __p0req(\(contract)), value: __p0req(\(value)) }, i);")
            return try rt.callGlobal("__coreRun", [fx.inputJSON])
        }
        let r = try JSONDecoder().decode(Core.Out.self, from: Data(raw.utf8)), e = fx.expected
        var diverged: [String] = [], explained: [String] = []
        for (j, x) in zip(r.journeys, e.journeys) {
            for (k, (s, t)) in zip(j.steps, x.steps).enumerated() {
                if s.op != t.op || s.status != t.status || s.proposal != t.proposal || s.namespace != t.namespace || s.stable != t.stable || s.persisted != t.persisted || s.error != t.error { diverged.append("\(j.name)#\(k)") }
                else if s.answer != t.answer { explained.append("\(j.name)#\(k)") }
            }
        }
        let clean = try q.sync { try Self.hostClean(rt) }
        XCTAssertTrue(clean.misses.isEmpty && clean.unsupported.isEmpty, "\(clean)")
        struct Rep: Codable { let digestEqual: Bool; let diverged: [String]; let explainedLibm: Int; let journeys: Int; let steps: Int; let localeCompareCalls: Int; let anchorsEqual: Bool }
        let rep = Rep(digestEqual: r.digest == e.digest, diverged: diverged, explainedLibm: explained.count, journeys: r.journeys.count, steps: r.journeys.map { $0.steps.count }.reduce(0, +),
                      localeCompareCalls: r.localeCompareCalls, anchorsEqual: r.anchors == e.anchors)
        emit("equivalence-core", rep)
        XCTAssertEqual(r.journeys.map(\.name), e.journeys.map(\.name))
        XCTAssertTrue(diverged.isEmpty, "DIVERGED: \(diverged)")
        XCTAssertTrue(rep.digestEqual); XCTAssertEqual(r.localeCompareCalls, 0); XCTAssertTrue(rep.anchorsEqual)
    }

    /// The five-zone module called directly: every maximum 120–230 and age 18–80, readings and classifier, byte-equal to Node.
    func testFiveZoneModule() throws {
        struct Units: Decodable { let driver: String; let unitsInputJSON: String; let unitsExpectedJSON: String }
        let fx = try JSONDecoder().decode(Units.self, from: try TestEnv.fixture("hr5"))
        let id = try XCTUnwrap(try EngineRuntime.moduleIds()["CoachingCore/src/v1-heart-rate-zones.mjs"])
        let (rt, q) = try Self.runtime("eq.hr5units")
        let got: String = try q.sync {
            _ = try rt.evaluate(fx.driver)
            _ = try rt.evaluate("globalThis.__runU = i => __hr5units(__p0req(\(id)), i);")
            return try rt.callGlobal("__runU", [fx.unitsInputJSON])
        }
        let g = try JSONSerialization.jsonObject(with: Data(got.utf8)) as! NSDictionary, e = try JSONSerialization.jsonObject(with: Data(fx.unitsExpectedJSON.utf8)) as! NSDictionary
        XCTAssertEqual(g, e, "the five-zone module answers in JavaScriptCore exactly as in Node")
        XCTAssertEqual(g.value(forKeyPath: "ages.30") as? String, "123,153,169,184")
        XCTAssertEqual((g["edges"] as? [String: Any])?.count, 111)
        emit("equivalence-hr5-units", ["identical": g.isEqual(to: e as! [AnyHashable: Any])])
    }
}
