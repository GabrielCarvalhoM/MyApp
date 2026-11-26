import Foundation
import XCTest
import CryptoKit
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation

/// A handoff §7 test 3: every facade answer of the shared-fixture reproduction (facade/test/reproduce-fixtures.mjs, Node) is given byte for byte
/// by the production bundle in JavaScriptCore, over this package's native file store; after removing exactly the keys the facade adds, each
/// one is byte-equal to the committed CoachingPresentation fixture (sha256 of the bytes); and each decodes in the CoachingPresentation types.
final class FacadeReplayTests: XCTestCase {
    struct Script: Decodable {
        struct Call: Decodable { let fn: String; let a: [AnyArg]; let sha256: String; let sansForecastSha256: String; let forecastCoarseSha256: String }
        struct Fix: Decodable { let file: String; let call: Int?; let calls: [Int]?; let strip: [String]?; let built: Bool?; let sha256: String; let equal: Bool }
        let calls: [Call]; let fixtures: [Fix]; let projections: String; let classifier: String
    }
    enum AnyArg: Decodable {
        case s(String), n(Double)
        init(from d: Decoder) throws { let c = try d.singleValueContainer(); if let s = try? c.decode(String.self) { self = .s(s) } else { self = .n(try c.decode(Double.self)) } }
        var any: Any { switch self { case .s(let s): return s; case .n(let n): return n } }
    }
    static func sha(_ s: String) -> String { EngineRuntime.hex(SHA256.hash(data: Data(s.utf8))) }

    func testFacadeAnswersAreTheFixtures() throws {
        let script = try JSONDecoder().decode(Script.self, from: try TestEnv.fixture("facade-calls"))
        XCTAssertEqual(script.projections, CoachingContract.projections)
        let tag = "facade-replay"; TestEnv.cleanup(tag)
        let q = DispatchQueue(label: tag)
        let store = try NativeStore(dir: TestEnv.root(tag))
        let rt = try q.sync { try EngineRuntime(queue: q, keys: FixtureKeys(), testMode: true) }
        var outs: [String] = []
        let t0 = Date()
        try q.sync {
            rt.install("__chstore", store.jsMembers())
            _ = try rt.evaluate("globalThis.__chIdSeq = 0; globalThis.__fixBytes = (o, s) => { const v = JSON.parse(o); for (const k of JSON.parse(s)) delete v[k]; return JSON.stringify(v, null, 1) + '\\n'; };"
                                + "globalThis.__wrap = (k, o) => JSON.stringify({ok: true, projections: 'RM-APP-PROJECTIONS-1', [k]: JSON.parse(o)}, null, 1) + '\\n';"
                                + "globalThis.__sets = a => JSON.stringify({ok: true, projections: 'RM-APP-PROJECTIONS-1', sets: JSON.parse(a).map(x => JSON.parse(x))}, null, 1) + '\\n';")
            for c in script.calls { outs.append(try rt.call(c.fn, c.a.map(\.any))) }
        }
        let wall = Date().timeIntervalSince(t0)
        // IDENTICAL: the same string as Node. EXPLAINED_LIBM (RFC-NUMERIC-1): only the Race Forecast's unrounded numbers differ (the answer
        // without runForecast identical, the forecasts at 9 significant digits identical). DIVERGED: anything else; it fails.
        var differ: [Int] = [], libm: Set<Int> = []
        try q.sync { _ = try rt.evaluate("globalThis.__classify = \(script.classifier);") }
        for (i, c) in script.calls.enumerated() where Self.sha(outs[i]) != c.sha256 {
            let k = try q.sync { try rt.callGlobal("__classify", [outs[i]]) }
            let o = try JSONSerialization.jsonObject(with: Data(k.utf8)) as! [String: String]
            if Self.sha(o["sans"]!) == c.sansForecastSha256 && Self.sha(o["coarse"]!) == c.forecastCoarseSha256 { libm.insert(i) } else { differ.append(i) }
        }
        XCTAssertEqual(differ, [], "DIVERGED facade answers: \(differ.prefix(5).map { script.calls[$0].fn })")
        // Fixture bytes: the same strip as in Node, in this JSContext, then the committed sha256.
        var skipped: [String] = [], fixtureEqual = 0, fixtureDiffer: [String] = [], fixtureLibm: [String] = [], decoded = 0, decodeFailures: [String] = []
        for f in script.fixtures {
            let bytes: String?
            if let call = f.call {
                let s = String(data: try JSONEncoder().encode(f.strip ?? []), encoding: .utf8)!
                bytes = try q.sync { try rt.callGlobal("__fixBytes", [outs[call], s]) }
            } else if f.file.hasPrefix("hr5r-time-in-zone"), let i = f.calls?.first {
                bytes = try q.sync { try rt.callGlobal("__wrap", ["timeInZones", outs[i]]) }
            } else if f.file == "P-warning-sign-sets.json", let cs = f.calls {
                let arr = String(data: try JSONEncoder().encode(cs.map { outs[$0] }), encoding: .utf8)!
                bytes = try q.sync { try rt.callGlobal("__sets", [arr]) }
            } else { bytes = nil }                      // P-kept-check: built from four answers and the final record (checked in Node)
            guard let bytes else { skipped.append(f.file); continue }
            if Self.sha(bytes) == f.sha256 { fixtureEqual += 1 }
            else if let call = f.call, libm.contains(call) { fixtureLibm.append(f.file) } else { fixtureDiffer.append(f.file) }
            do { try Self.decode(f.file, Data(bytes.utf8)); decoded += 1 } catch { decodeFailures.append("\(f.file): \(error)") }
        }
        struct Rep: Codable { let calls: Int; let callsIdentical: Int; let callsExplainedLibm: Int; let callsDiverged: Int; let fixtures: Int; let fixturesIdentical: Int
            let fixturesExplainedLibm: [String]; let fixturesDiverged: [String]; let fixturesDecoded: Int; let wallSeconds: Double; let bundleSha256: String }
        let rep = Rep(calls: outs.count, callsIdentical: outs.count - differ.count - libm.count, callsExplainedLibm: libm.count, callsDiverged: differ.count,
                      fixtures: script.fixtures.count, fixturesIdentical: fixtureEqual, fixturesExplainedLibm: fixtureLibm, fixturesDiverged: fixtureDiffer,
                      fixturesDecoded: decoded, wallSeconds: wall, bundleSha256: BundlePin.bundleSha256)
        emit("facade-replay", rep)
        XCTAssertEqual(fixtureDiffer, [])
        XCTAssertEqual(decodeFailures, [])
        XCTAssertEqual(skipped, ["P-kept-check.json"])
        XCTAssertEqual(fixtureEqual + fixtureLibm.count, script.fixtures.count - 1, "every compared fixture but P-kept-check (Node only): byte-equal or EXPLAINED_LIBM")
        TestEnv.cleanup(tag)
    }

    /// The CoachingPresentation type of each fixture (as CoachingPresentationTests decodes them).
    static func decode(_ file: String, _ d: Data) throws {
        let n = String(file.dropLast(5))
        struct Weeks: Decodable { let weeks: [Week?] }
        struct Decision: Decodable { let decision: DecisionDetail }
        struct History: Decodable { let history: HistoryView }
        struct TimeFile: Decodable { let timeInZones: TimeInZoneReading }
        struct Sets: Decodable { let sets: [AnyDecodable] }
        struct AnyDecodable: Decodable { init(from decoder: Decoder) throws {} }
        let j = JSONDecoder()
        switch n {
        case _ where n.hasSuffix("presentation") || n.contains("presentation-"): _ = try j.decode(PresentationSnapshot.self, from: d)
        case "03-sessions", "17c-sessions-blocked": _ = try j.decode(Weeks.self, from: d)
        case "21-decision": _ = try j.decode(Decision.self, from: d)
        case _ where n.hasSuffix("history"): _ = try j.decode(History.self, from: d)
        case "P-week-plan": _ = try j.decode(WeekPlanProjection.self, from: d)
        case _ where n.hasPrefix("P-logged"): _ = try j.decode(LoggedEntries.self, from: d)
        case "P-warning-sign-sets": _ = try j.decode(Sets.self, from: d)
        case _ where n.hasPrefix("hr5r-time-in-zone"): _ = try j.decode(TimeFile.self, from: d)
        case _ where n.hasPrefix("hr5r-") && (n.hasSuffix("-answer") || n.hasSuffix("-replay") || n.contains("without-consent")):
            _ = try j.decode(HeartRateProfileAnswer.self, from: d); _ = try j.decode(BoundaryAnswer.self, from: d)
        default:
            let a = try j.decode(BoundaryAnswer.self, from: d)
            if n.hasSuffix("-plan") || n.contains("plan-") { XCTAssertTrue(a.view != nil || a.error != nil, n) }
        }
    }
}
