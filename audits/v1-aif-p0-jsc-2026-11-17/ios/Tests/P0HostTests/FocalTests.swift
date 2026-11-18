import Foundation
import XCTest
import P0Host

/// Focal checks added on the device run of 2026-11-18, all on synthetic or frozen inputs, none touching the engine or the PF-0 budgets:
/// the localeCompare/toSorted paths J5 and P16 never reach (QRE-P0-04), the math-library calls behind EXPLAINED_LIBM, the execution tier
/// of the JSContext, the aggregate bridge cost of one full-plan review, and proportional stress (context churn, a restart at every P16 step,
/// long repetition, a projection requested while a review runs, snapshot isolation). Results are P0RESULT lines, as in the other tests.
@MainActor
final class FocalTests: XCTestCase {

    struct Focal: Decodable {
        struct Modules: Decodable { let r6: Int, sched: Int, learn: Int, value: Int }
        struct Libm: Decodable { let f: String, args: [String], v8: String, steps: [Int] }
        let bundleSha256: String, driver: String, modules: Modules, inputJSON: String, expected: Result, libm: [Libm]
        static func load() throws -> Focal {
            guard let url = Bundle.module.url(forResource: "focal", withExtension: "json", subdirectory: "Fixtures") else { throw CoachingCoreRuntime.P0Error.resource("focal") }
            return try JSONDecoder().decode(Focal.self, from: Data(contentsOf: url))
        }
    }
    struct Result: Codable, Equatable {
        struct Item: Codable, Equatable { let caseId: String; let status: String?; let digest: String?; let error: String? }
        struct Collation: Codable, Equatable { let defaultLocale: String, pairs: Int, pairsDigest: String, signs: [String: String], differFromDefault: [String: Int]
            let list: [[String]]; let table: [String: [Int]] }
        let generate: [Item], schedule: [Item], counts: [String: [String: Int]], collation: Collation, digest: String
    }

    /// The device state only (thermal, battery, Low Power Mode), to wait for a cool device between measurement runs without loading anything.
    func testDeviceState() { emit("device-state", DeviceInfo.current()) }

    /// QRE-P0-04: the real engine functions holding the localeCompare/toSorted call sites, on frozen inputs, against the Node oracle
    /// (lab/focal-oracle.mjs). Run once per device language (RUN.md: -testLanguage en / pt-BR); the default collator locale is recorded.
    func testLocaleAndSortCoverage() async throws {
        let fx = try Focal.load(), rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.focal", exposeModules: true)
        let raw = try await rt.run { rt -> String in
            _ = try rt.evaluate(fx.driver)
            _ = try rt.evaluate("globalThis.__p0focalRun = i => __p0focal({ r6: __p0req(\(fx.modules.r6)), sched: __p0req(\(fx.modules.sched)), learn: __p0req(\(fx.modules.learn)), value: __p0req(\(fx.modules.value)) }, i);")
            return try rt.callGlobal("__p0focalRun", [fx.inputJSON])
        }
        let r = try JSONDecoder().decode(Result.self, from: Data(raw.utf8)), e = fx.expected
        // Node's own compared pairs, re-judged in this JSContext under the default locale, each explicit locale and UTF-16 code units.
        let nodePairs = String(data: try JSONEncoder().encode(e.collation.list), encoding: .utf8)!
        let rejudged = try await rt.run { rt -> [String: [Int]] in
            let js = try rt.evaluate("JSON.stringify((() => { const p = \(nodePairs), s = x => (x < 0 ? -1 : x > 0 ? 1 : 0); return { default: p.map(([a, b]) => s(a.localeCompare(b))), codeUnits: p.map(([a, b]) => (a < b ? -1 : a > b ? 1 : 0)), 'en-US': p.map(([a, b]) => s(a.localeCompare(b, 'en-US'))), 'pt-BR': p.map(([a, b]) => s(a.localeCompare(b, 'pt-BR'))) }; })())")!.toString()!
            return try JSONDecoder().decode([String: [Int]].self, from: Data(js.utf8))
        }
        let h = try await rt.run { try hostCalls($0) }
        assertHostClean(h, "focal")
        // Per call site group: was it reached (string comparisons / toSorted made in that phase), in Node and here. The NUMBER of comparator
        // calls is not compared: V8 (TimSort) and JavaScriptCore (merge sort) make different comparisons to reach the same order.
        func reached(_ c: [String: [String: Int]]) -> [String: Bool] {
            let g = c["generate"]!, s = c["schedule"]!, l = c["learning"]!
            return ["generate.localeCompare": g["localeCompare"]! > 0, "generate.toSorted": g["toSorted"]! > 0,
                    "schedule.localeCompare": s["localeCompare"]! > g["localeCompare"]!, "schedule.toSorted": s["toSorted"]! > g["toSorted"]!,
                    "learning.localeCompare": l["localeCompare"]! > s["localeCompare"]!]
        }
        struct Out: Codable { let defaultLocale: String; let digestEqual: Bool; let generateDiffer: [String]; let scheduleDiffer: [String]
            let reached: [String: Bool]; let reachedEqual: Bool; let counts: [String: [String: Int]]; let nodeCounts: [String: [String: Int]]
            let pairsCompared: Int; let pairsDifferAcrossLocales: [String: Int]; let nodePairs: Int; let nodePairsRejudgedEqual: [String: Bool] }
        let out = Out(defaultLocale: r.collation.defaultLocale, digestEqual: r.digest == e.digest,
                      generateDiffer: zip(r.generate, e.generate).filter { $0 != $1 }.map { $0.0.caseId }, scheduleDiffer: zip(r.schedule, e.schedule).filter { $0 != $1 }.map { $0.0.caseId },
                      reached: reached(r.counts), reachedEqual: reached(r.counts) == reached(e.counts), counts: r.counts, nodeCounts: e.counts,
                      pairsCompared: r.collation.pairs, pairsDifferAcrossLocales: r.collation.differFromDefault, nodePairs: e.collation.pairs,
                      nodePairsRejudgedEqual: Dictionary(uniqueKeysWithValues: ["default", "codeUnits", "en-US", "pt-BR"].map { ($0, rejudged[$0] == e.collation.table["default"]) }))
        if !out.digestEqual { let a = XCTAttachment(string: raw); a.name = "focal-reply.json"; a.lifetime = .keepAlways; add(a) }
        emit("focal-locale", out)
        XCTAssertTrue(out.digestEqual, "focal digests differ from Node: generate \(out.generateDiffer) schedule \(out.scheduleDiffer)")
        XCTAssertTrue(out.reachedEqual, "a call site was reached in one engine and not in the other")
        // QRE-P0-DEVICE-R1 C-2: the expected set, so the check cannot pass with nothing exercised. schedule.localeCompare is the r5-schedule
        // tie-break after day and startMinute, which valid inputs never reach (one session per window); r6-program.mjs:960 is not driven here.
        XCTAssertEqual(out.reached, ["generate.localeCompare": true, "generate.toSorted": true, "schedule.localeCompare": false, "schedule.toSorted": true, "learning.localeCompare": true])
        XCTAssertTrue(out.pairsDifferAcrossLocales.values.allSatisfy { $0 == 0 }, "a comparison the engine made here depends on the locale")
        XCTAssertTrue(out.nodePairsRejudgedEqual.values.allSatisfy { $0 }, "Node's comparisons are judged differently here")
    }

    /// Every Math.exp/log/pow call of the P16 replay, recomputed in this JSContext and compared bit for bit with V8's result.
    func testLibmBits() async throws {
        let fx = try Focal.load(), rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.libm")
        let calls = String(data: try JSONEncoder().encode(fx.libm.map { [$0.f, $0.v8] + $0.args }), encoding: .utf8)!
        let raw = try await rt.run { rt -> String in
            try rt.evaluate("""
            (() => { const dv = new DataView(new ArrayBuffer(8));
              const from = h => { for (let i = 0; i < 8; i++) dv.setUint8(i, parseInt(h.slice(2 * i, 2 * i + 2), 16)); return dv.getFloat64(0); };
              const to = x => { dv.setFloat64(0, x); let s = ''; for (let i = 0; i < 8; i++) s += dv.getUint8(i).toString(16).padStart(2, '0'); return s; };
              return JSON.stringify(\(calls).map(([f, v8, ...a]) => { const r = to(Math[f](...a.map(from))); return { f, args: a.map(from), v8: from(v8), jsc: from(r), ulp: r === v8 ? 0 : Number(BigInt('0x' + r) - BigInt('0x' + v8)) }; }));
            })()
            """)!.toString()
        }
        struct Call: Codable { let f: String; let args: [Double]; let v8: Double; let jsc: Double; let ulp: Int; var steps: [Int]? }
        var res = try JSONDecoder().decode([Call].self, from: Data(raw.utf8))
        for i in res.indices { res[i].steps = fx.libm[i].steps }
        struct Out: Codable { let calls: Int; let byFunction: [String: Int]; let differ: [Call] }
        emit("libm", Out(calls: res.count, byFunction: Dictionary(grouping: res, by: { $0.f }).mapValues { $0.count }, differ: res.filter { $0.ulp != 0 }))
    }

    /// Which execution tier this JSContext runs: the same loop is timed on the Mac with jsc --useJIT=false and with the JIT (P0_REPORT §5.3).
    func testExecutionTierProbe() async throws {
        let rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.tier")
        let raw = try await rt.run { rt in
            try rt.evaluate("(() => { const run = () => { const t0 = __p0host.now(); let s = 0; for (let i = 0; i < 20000000; i++) s = (s + i * 7) % 1000003; return [__p0host.now() - t0, s]; }; const r = [run(), run(), run()]; return JSON.stringify({ ms: r.map(x => x[0]), check: r[0][1] }); })()")!.toString()!
        }
        struct Out: Codable { let ms: [Double]; let check: Int }
        emit("tier-probe", try JSONDecoder().decode(Out.self, from: Data(raw.utf8)))
    }

    /// The aggregate bridge cost of one full-plan review (P16 fixed step): host calls, characters, time inside Swift (UTF-8 conversion, CryptoKit,
    /// hex) and time seen from JavaScript (adds the JS->Swift string conversion and the crossing), as a share of the review's wall time.
    func testBridgeAggregatePerReview() async throws {
        let p16 = try Fixture.load("p16"), fixed = p16.fixedReviewStep!, rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.bridge")
        _ = try await rt.run { rt -> Int in _ = try rt.call("reset"); _ = try replaySteps(rt, p16, to: fixed, opts: "{}"); _ = try rt.call("takeSnapshot"); return 0 }
        struct Rep: Codable { let wallMs: Double; let calls: Int; let utf8Bytes: Int; let swiftInsideMs: Double; let jsObservedMs: Double? }
        let plain: [Rep] = try await rt.run { rt in try (0..<10).map { _ in
            _ = try rt.call("restoreSnapshot")
            let c0 = rt.host.sha256Calls, b0 = rt.host.sha256UTF8Bytes, n0 = rt.host.sha256Nanos
            let s = try replaySteps(rt, p16, from: fixed, to: fixed + 1, opts: "{}")[0].1
            return Rep(wallMs: s.swiftWallMs, calls: rt.host.sha256Calls - c0, utf8Bytes: rt.host.sha256UTF8Bytes - b0, swiftInsideMs: Double(rt.host.sha256Nanos - n0) / 1e6, jsObservedMs: nil)
        } }
        var nowPairMs = 0.0
        // The prelude calls __p0host.sha256 through the property on every use, so a timing wrapper installed now sees every engine hash.
        let wrapped: [Rep] = try await rt.run { rt in
            _ = try rt.evaluate("(() => { const o = __p0host.sha256, now = __p0host.now; let ms = 0; __p0host.sha256 = t => { const a = now(); const r = o(t); ms += now() - a; return r; }; globalThis.__p0shaTake = () => { const m = ms; ms = 0; return m; }; })()")
            let nowPair = try rt.evaluate("(() => { const now = __p0host.now, t0 = now(); for (let i = 0; i < 10000; i++) { now(); now(); } return (now() - t0) / 10000; })()")!.toDouble()
            nowPairMs = nowPair
            return try (0..<10).map { _ in
                _ = try rt.call("restoreSnapshot"); _ = try rt.evaluate("__p0shaTake()")
                let c0 = rt.host.sha256Calls, b0 = rt.host.sha256UTF8Bytes, n0 = rt.host.sha256Nanos
                let s = try replaySteps(rt, p16, from: fixed, to: fixed + 1, opts: "{}")[0].1
                let calls = rt.host.sha256Calls - c0, js = try rt.evaluate("__p0shaTake()")!.toDouble() - Double(calls) * nowPair / 2
                return Rep(wallMs: s.swiftWallMs, calls: calls, utf8Bytes: rt.host.sha256UTF8Bytes - b0, swiftInsideMs: Double(rt.host.sha256Nanos - n0) / 1e6, jsObservedMs: js)
            }
        }
        struct Out: Codable { let callsPerReview: Int; let utf8BytesPerReview: Int; let wallMs: Stats; let swiftInsideMs: Stats; let swiftInsideShareOfWall: Double
            let jsObservedMs: Stats; let jsObservedShareOfWall: Double; let crossingAndConversionMs: Double; let nowPairMs: Double; let note: String }
        let wall = Stats(plain.map { $0.wallMs })!, inside = Stats(plain.map { $0.swiftInsideMs })!, js = Stats(wrapped.compactMap { $0.jsObservedMs })!
        emit("bridge-aggregate", Out(callsPerReview: plain[0].calls, utf8BytesPerReview: plain[0].utf8Bytes, wallMs: wall, swiftInsideMs: inside,
                                     swiftInsideShareOfWall: inside.median / wall.median, jsObservedMs: js, jsObservedShareOfWall: js.median / wall.median,
                                     crossingAndConversionMs: js.median - Stats(wrapped.map { $0.swiftInsideMs })!.median, nowPairMs: nowPairMs,
                                     note: "each timed interval holds about one now() crossing; jsObserved is net of half of nowPairMs per call (approximate); wall from the unwrapped repetitions"))
    }

    /// Proportional stress on the tested device: context churn, a persisted restart before every P16 step, 200 repeated full-plan reviews,
    /// a projection asked for while a review runs, and snapshot isolation (a discarded review leaves no trace).
    func testStress() async throws {
        let p16 = try Fixture.load("p16"), fixed = p16.fixedReviewStep!
        let thermalStart = DeviceInfo.current().thermalState, wall0 = ProcessInfo.processInfo.systemUptime
        // 1. Create and discard 30 runtimes, each generating the first plan.
        var churn: [Double] = []
        for i in 0..<30 {
            do { // the runtime goes out of scope here; its release before the footprint read is likely, not guaranteed (ARC, JSC GC)
                let rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.churn\(i)")
                _ = try await rt.run { rt -> Int in _ = try rt.call("reset"); _ = try replaySteps(rt, p16, to: 1, opts: "{}"); rt.collectGarbage(); return 0 }
            }
            churn.append(Memory.footprintMB().current)
        }
        // 2. P16 with a restart at every step: export, atomic write, new VM and context, read, restore, next step (digests against the oracle).
        let file = FileManager.default.temporaryDirectory.appendingPathComponent("p0-stress-envelope.json")
        var verdicts: [Verdict] = [], writes: [Double] = [], reads: [Double] = [], boots: [Double] = [], restores: [Double] = [], chainFootprint: [Double] = []
        for i in 0..<p16.steps.count {
            let b0 = Clock.ms(), rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.chain\(i)"); boots.append(Clock.ms() - b0)
            if i == 0 { _ = try await rt.run { try $0.call("reset") } } else {
                let r0 = Clock.ms(), text = try String(contentsOf: file, encoding: .utf8); reads.append(Clock.ms() - r0)
                let s0 = Clock.ms(), ok = try await rt.run { try $0.call("restore", [text]) }; restores.append(Clock.ms() - s0)
                XCTAssertTrue(ok.contains("\"ok\":true"), ok)
            }
            let (res, json) = try await rt.run { rt in (try replaySteps(rt, p16, from: i, to: i + 1, opts: #"{"digest":true}"#), try rt.call("exportEnvelope")) }
            verdicts.append(res[0].1.verdict)
            let w0 = Clock.ms()
            #if os(iOS)
            try Data(json.utf8).write(to: file, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
            #else
            try Data(json.utf8).write(to: file, options: [.atomic])
            #endif
            writes.append(Clock.ms() - w0)
            chainFootprint.append(Memory.footprintMB().current)
        }
        try? FileManager.default.removeItem(at: file)
        // 3. 200 full-plan reviews on one runtime (restoreSnapshot + review), the footprint every 25.
        let rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.long")
        _ = try await rt.run { rt -> Int in _ = try rt.call("reset"); _ = try replaySteps(rt, p16, to: fixed, opts: "{}"); _ = try rt.call("takeSnapshot"); return 0 }
        var long: [Double] = [], longFootprint: [Double] = []
        for k in 0..<200 {
            long.append(try await rt.run { rt -> Double in _ = try rt.call("restoreSnapshot"); return try replaySteps(rt, p16, from: fixed, to: fixed + 1, opts: "{}")[0].1.swiftWallMs })
            if k % 25 == 24 { longFootprint.append(Memory.footprintMB().current) }
        }
        let afterLongGC: Double = try await rt.run { rt in rt.collectGarbage(); return Memory.footprintMB().current }
        // 4. A projection asked for while a review runs on the same (serial) engine queue, against the same projection when idle.
        let idle0 = Clock.ms(); _ = try await rt.run { try $0.call("view", ["TODAY", Date().timeIntervalSince1970 * 1000]) }; let idleView = Clock.ms() - idle0
        _ = try await rt.run { try $0.call("restoreSnapshot") }
        async let review: Double = rt.run { rt in try replaySteps(rt, p16, from: fixed, to: fixed + 1, opts: "{}")[0].1.swiftWallMs }
        try await Task.sleep(nanoseconds: 20_000_000)
        let v0 = Clock.ms(); _ = try await rt.run { try $0.call("view", ["TODAY", Date().timeIntervalSince1970 * 1000]) }; let busyView = Clock.ms() - v0
        let concurrentReview = try await review
        // 5. Isolation: a review whose result is discarded (snapshot restored) leaves the envelope exactly as before.
        let iso = try await rt.run { rt -> [String] in
            _ = try rt.call("restoreSnapshot"); let before = try rt.call("envelopeDigest")
            _ = try replaySteps(rt, p16, from: fixed, to: fixed + 1, opts: "{}"); let during = try rt.call("envelopeDigest")
            _ = try rt.call("restoreSnapshot"); return [before, during, try rt.call("envelopeDigest")]
        }
        struct Out: Codable {
            let churnFootprintMB: [Double]; let chainVerdicts: [String: Int]; let chainNonIdenticalSteps: [Int]; let chainBootMs: Stats; let chainReadMs: Stats; let chainRestoreMs: Stats; let chainWriteMs: Stats
            let chainFootprintMB: [Double]; let longReviewMs: [String: Stats]; let longFootprintMB: [Double]; let afterLongGCMB: Double
            let viewIdleMs: Double; let viewWhileReviewMs: Double; let concurrentReviewMs: Double; let isolationRestored: Bool; let isolationReviewChangedEnvelope: Bool
            let thermalStart: String; let thermalEnd: String; let elapsedS: Double; let lifetimePeakMB: Double
        }
        let blocks = Dictionary(uniqueKeysWithValues: stride(from: 0, to: 200, by: 50).map { ("reviews\($0)-\($0 + 49)", Stats(Array(long[$0..<$0 + 50]))!) })
        let out = Out(churnFootprintMB: churn.map { ($0 * 10).rounded() / 10 }, chainVerdicts: Dictionary(grouping: verdicts, by: { $0.rawValue }).mapValues { $0.count },
                      chainNonIdenticalSteps: verdicts.enumerated().filter { $0.1 != .IDENTICAL }.map { $0.0 }, chainBootMs: Stats(boots)!, chainReadMs: Stats(reads)!,
                      chainRestoreMs: Stats(restores)!, chainWriteMs: Stats(writes)!, chainFootprintMB: chainFootprint.map { ($0 * 10).rounded() / 10 },
                      longReviewMs: blocks.merging(["all": Stats(long)!]) { a, _ in a }, longFootprintMB: longFootprint.map { ($0 * 10).rounded() / 10 }, afterLongGCMB: afterLongGC,
                      viewIdleMs: idleView, viewWhileReviewMs: busyView, concurrentReviewMs: concurrentReview, isolationRestored: iso[0] == iso[2], isolationReviewChangedEnvelope: iso[0] != iso[1],
                      thermalStart: thermalStart, thermalEnd: DeviceInfo.current().thermalState, elapsedS: ProcessInfo.processInfo.systemUptime - wall0, lifetimePeakMB: Memory.footprintMB().lifetimePeak)
        emit("stress", out)
        XCTAssertFalse(verdicts.contains(.DIVERGED), "a restart before a step changed the engine's answer")
        XCTAssertTrue(out.isolationRestored && out.isolationReviewChangedEnvelope)
    }
}
