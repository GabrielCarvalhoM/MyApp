import Foundation
import XCTest
import P0Host

/// P0 measurements (PERFORMANCE_FOUNDATION §3 "Motor" and "Memória" rows), synthetic data only, results printed as P0RESULT lines.
/// Run on the entry device, Release configuration, nothing else running, battery not in Low Power Mode (recorded with the result).
/// The budgets are compared, never adjusted: see P0_REPORT.md.
@MainActor
final class PerformanceTests: XCTestCase {

    struct Budget: Codable { let metric: String; let budgetMs: Double?; let budgetMB: Double?; let measured: Double; let pass: Bool }

    func testP0Measurements() async throws {
        let device = DeviceInfo.current()
        let p16 = try Fixture.load("p16"), fixed = p16.fixedReviewStep!
        let mem0 = Memory.footprintMB()

        // 1. Context creation + bundle load, 10 fresh runtimes (VM, context, assets verified, bundle evaluated), and the first plan on each.
        var loads: [CoachingCoreRuntime.LoadMetrics] = [], firstGenerate: [Double] = []
        for i in 0..<10 {
            let rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.cold\(i)")
            loads.append(rt.load)
            let g = try await rt.run { rt -> Double in _ = try rt.call("reset"); return try replaySteps(rt, p16, to: 1, opts: "{}")[0].1.swiftWallMs }
            firstGenerate.append(g)
        }

        // 2. One runtime: warm generation x10, then the whole P16 journey timed per step (record growing to ~95 rows).
        let rt = try await CoachingCoreRuntime.make()
        let warmGenerate: [Double] = try await rt.run { rt in try (0..<10).map { _ in _ = try rt.call("reset"); return try replaySteps(rt, p16, to: 1, opts: "{}")[0].1.swiftWallMs } }
        let sampler = FootprintSampler()
        let journey = try await rt.run { rt -> [StepResult] in _ = try rt.call("reset"); return try replaySteps(rt, p16, opts: "{}").map { $0.1 } }
        let journeyPeakMB = sampler.stop()
        let reviews = journey.filter { $0.kind != "ONBOARD" }
        let short = reviews.filter { $0.ledgerRows < 60 }, long = reviews.filter { $0.ledgerRows >= 60 }

        // 3. The fixed review with the whole plan on record (the ADR's "revisão com o registro de um plano inteiro"), 30 repetitions on one state.
        struct Cycle: Codable { let restoreMs: Double; let reviewWallMs: Double; let engineMs: Double; let cpuMs: Double; let footprintMB: Double; let peakMB: Double }
        _ = try await rt.run { rt -> Int in _ = try rt.call("reset"); _ = try replaySteps(rt, p16, to: fixed, opts: "{}"); _ = try rt.call("takeSnapshot"); return 0 }
        var cycles: [Cycle] = []
        for _ in 0..<30 {
            let s = FootprintSampler()
            let c = try await rt.run { rt -> (Double, StepResult) in
                let restore = try JSONDecoder().decode(MsReply.self, from: Data(try rt.call("restoreSnapshot").utf8)).ms
                return (restore, try replaySteps(rt, p16, from: fixed, to: fixed + 1, opts: "{}")[0].1)
            }
            let peak = s.stop()
            cycles.append(Cycle(restoreMs: c.0, reviewWallMs: c.1.swiftWallMs, engineMs: c.1.engineMs, cpuMs: c.1.cpuMs, footprintMB: Memory.footprintMB().current, peakMB: peak))
        }
        let hostPerReview = try await rt.run { rt -> String in
            let before = try rt.call("hostCalls"); _ = try rt.call("restoreSnapshot"); _ = try replaySteps(rt, p16, from: fixed, to: fixed + 1, opts: "{}"); return before + "\n" + (try rt.call("hostCalls"))
        }
        let retainedMB: Double = try await rt.run { rt in rt.collectGarbage(); return Memory.footprintMB().current }

        // 4. Bridge costs.
        let bridge = try await bridgeCosts(rt)

        // 5. Main thread: max gap of an 8 ms main-queue timer while a full-plan review runs on the engine queue (and the control: run on main).
        let gapOffMain = try await mainGap(rt, fixed: fixed, fx: p16, onMain: false)
        let gapControl = try await mainGap(rt, fixed: fixed, fx: p16, onMain: true)

        let mem1 = Memory.footprintMB()
        let ev = Stats(cycles.map { $0.reviewWallMs })!, load = Stats(loads.map { $0.totalMs })!, gen = Stats(firstGenerate)!
        let budgets = [
            Budget(metric: "context + bundle load p95 (PF-0: <= 1.0 s)", budgetMs: 1000, budgetMB: nil, measured: load.p95, pass: load.p95 <= 1000),
            Budget(metric: "first plan generateProgram p95 (PF-0: <= 2.0 s)", budgetMs: 2000, budgetMB: nil, measured: gen.p95, pass: gen.p95 <= 2000),
            Budget(metric: "full-plan review p95 (PF-0: <= 1.5 s)", budgetMs: 1500, budgetMB: nil, measured: ev.p95, pass: ev.p95 <= 1500),
            Budget(metric: "full-plan review worst case (PF-0: <= 3 s)", budgetMs: 3000, budgetMB: nil, measured: ev.max, pass: ev.max <= 3000),
            Budget(metric: "stable footprint after GC (PF-0: <= 150 MB)", budgetMs: nil, budgetMB: 150, measured: retainedMB, pass: retainedMB <= 150),
            Budget(metric: "peak footprint during reviews (PF-0: <= 350 MB)", budgetMs: nil, budgetMB: 350, measured: max(journeyPeakMB, cycles.map { $0.peakMB }.max() ?? 0), pass: max(journeyPeakMB, cycles.map { $0.peakMB }.max() ?? 0) <= 350)
        ]

        struct Report: Codable {
            let device: DeviceInfo; let bundle: CoachingCoreRuntime.LoadMetrics
            let load: [String: Stats]; let firstGenerateMs: Stats; let warmGenerateMs: Stats
            let journey: [StepResult]; let reviewShortHistoryMs: Stats?; let reviewLongHistoryMs: Stats?; let firstReviewMs: Double
            let fixedFullPlanReview: [String: Stats]; let cycles: [Cycle]; let hostCallsAroundOneReview: String
            let memoryMB: [String: Double]; let bridge: Bridge; let mainThread: [String: Double]; let budgets: [Budget]
        }
        let report = Report(
            device: device, bundle: loads[0],
            load: ["totalMs": load, "assetsReadVerifyMs": Stats(loads.map { $0.assetsReadVerifyMs })!, "vmContextMs": Stats(loads.map { $0.vmContextMs })!, "bundleEvalMs": Stats(loads.map { $0.bundleEvalMs })!],
            firstGenerateMs: gen, warmGenerateMs: Stats(warmGenerate)!, journey: journey,
            reviewShortHistoryMs: Stats(short.map { $0.swiftWallMs }), reviewLongHistoryMs: Stats(long.map { $0.swiftWallMs }), firstReviewMs: reviews[0].swiftWallMs,
            fixedFullPlanReview: ["wallMs": ev, "engineMs": Stats(cycles.map { $0.engineMs })!, "cpuMs": Stats(cycles.map { $0.cpuMs })!, "restoreSnapshotMs": Stats(cycles.map { $0.restoreMs })!],
            cycles: cycles, hostCallsAroundOneReview: hostPerReview,
            memoryMB: ["beforeAnyRuntime": mem0.current, "journeyPeakSampled": journeyPeakMB, "cyclesPeakSampled": cycles.map { $0.peakMB }.max() ?? 0,
                       "afterCyclesBeforeGC": cycles.last?.footprintMB ?? 0, "afterGC": retainedMB, "end": mem1.current, "processLifetimePeak": mem1.lifetimePeak],
            bridge: bridge, mainThread: ["maxGapMsEngineOffMain": gapOffMain, "maxGapMsControlEngineOnMain": gapControl], budgets: budgets)
        emit("performance", report)
        XCTAssertLessThan(gapOffMain, gapControl, "the engine run off the main thread must leave the main queue free")
    }

    // MARK: bridge

    struct MsReply: Decodable { let ms: Double }
    struct Bridge: Codable {
        struct Sha: Codable { let chars: Int; let reps: Int; let jsObservedMsPerCall: Double; let swiftInsideMsPerCall: Double; let bridgeMsPerCall: Double }
        let sha256: [Sha]; let noopCrossingUs: Double
        let exportEnvelopeMs: Double; let stringifyInsideJsMs: Double; let envelopeBytes: Int
        let restoreFromSwiftMs: Double; let restoreInsideJsMs: Double
        let views: [String: [String: Double]]; let atomicWriteMs: Stats
    }

    private func bridgeCosts(_ rt: CoachingCoreRuntime) async throws -> Bridge {
        try await rt.run { rt -> Bridge in
            var sha: [Bridge.Sha] = []
            for (chars, reps) in [(64, 2000), (4096, 500), (262_144, 20), (2_097_152, 5)] {
                let n0 = rt.host.sha256Nanos
                let js = try rt.evaluate("(() => { const s = 'a'.repeat(\(chars)); const t0 = __p0host.now(); for (let i = 0; i < \(reps); i++) __p0host.sha256(s); return (__p0host.now() - t0) / \(reps); })()")!.toDouble()
                let inside = Double(rt.host.sha256Nanos - n0) / 1_000_000 / Double(reps)
                sha.append(.init(chars: chars, reps: reps, jsObservedMsPerCall: js, swiftInsideMsPerCall: inside, bridgeMsPerCall: js - inside))
            }
            let noop = try rt.evaluate("(() => { const t0 = __p0host.now(); for (let i = 0; i < 10000; i++) __p0host.existsAsset('none'); return (__p0host.now() - t0) / 10000 * 1000; })()")!.toDouble()
            // The envelope out (JS -> Swift, as persistence needs) and back in (Swift -> JS, restore), against the same work inside JS only.
            let e0 = Clock.ms(), env = try rt.call("exportEnvelope"), exportMs = Clock.ms() - e0
            let s0 = Clock.ms(); _ = try rt.call("takeSnapshot"); let insideMs = Clock.ms() - s0
            let r0 = Clock.ms(); _ = try rt.call("restore", [env]); let restoreMs = Clock.ms() - r0
            let restoreInside = try JSONDecoder().decode(MsReply.self, from: Data(try rt.call("restoreSnapshot").utf8)).ms
            var views: [String: [String: Double]] = [:]
            for v in ["TODAY", "WEEK", "INSIGHTS"] {
                let t0 = Clock.ms(), raw = try rt.call("view", [v, Date().timeIntervalSince1970 * 1000]), wall = Clock.ms() - t0
                struct V: Decodable { let ms: Double; let chars: Int }
                let x = try JSONDecoder().decode(V.self, from: Data(raw.utf8))
                views[v] = ["swiftWallMs": wall, "insideJsMs": x.ms, "chars": Double(x.chars)]
            }
            let file = FileManager.default.temporaryDirectory.appendingPathComponent("p0-envelope-write.json")
            var writes: [Double] = []
            for _ in 0..<10 {
                let w0 = Clock.ms()
                #if os(iOS)
                try Data(env.utf8).write(to: file, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
                #else
                try Data(env.utf8).write(to: file, options: [.atomic])
                #endif
                writes.append(Clock.ms() - w0)
            }
            try? FileManager.default.removeItem(at: file)
            return Bridge(sha256: sha, noopCrossingUs: noop, exportEnvelopeMs: exportMs, stringifyInsideJsMs: insideMs, envelopeBytes: env.utf8.count,
                          restoreFromSwiftMs: restoreMs, restoreInsideJsMs: restoreInside, views: views, atomicWriteMs: Stats(writes)!)
        }
    }

    // MARK: main thread

    private func mainGap(_ rt: CoachingCoreRuntime, fixed: Int, fx: Fixture, onMain: Bool) async throws -> Double {
        _ = try await rt.run { try $0.call("restoreSnapshot") }
        final class Probe { var last = Clock.ms(), maxGap = 0.0 }
        let probe = Probe()
        let timer = DispatchSource.makeTimerSource(queue: .main)
        timer.schedule(deadline: .now(), repeating: .milliseconds(8))
        timer.setEventHandler { let n = Clock.ms(); probe.maxGap = max(probe.maxGap, n - probe.last); probe.last = n }
        timer.resume()
        try await Task.sleep(nanoseconds: 50_000_000)
        if onMain {
            // Control: the same review blocking the main thread (what the architecture forbids), to show the probe sees a stall.
            try rt.queue.sync { _ = try replaySteps(rt, fx, from: fixed, to: fixed + 1, opts: "{}") }
        } else {
            _ = try await rt.run { rt in try replaySteps(rt, fx, from: fixed, to: fixed + 1, opts: "{}") }
        }
        try await Task.sleep(nanoseconds: 50_000_000)
        timer.cancel()
        return probe.maxGap
    }
}

/// The first JavaScriptCore runtime of a fresh test process (run alone, repeatedly, for the cold samples; see RUN.md).
@MainActor
final class ColdStartTests: XCTestCase {
    func testFirstContextInProcess() async throws {
        let t0 = Clock.ms()
        let rt = try await CoachingCoreRuntime.make()
        let makeMs = Clock.ms() - t0
        let p16 = try Fixture.load("p16")
        let gen = try await rt.run { rt -> Double in _ = try rt.call("reset"); return try replaySteps(rt, p16, to: 1, opts: "{}")[0].1.swiftWallMs }
        struct Cold: Codable { let device: DeviceInfo; let load: CoachingCoreRuntime.LoadMetrics; let makeMs: Double; let firstGenerateMs: Double; let footprintMB: Double }
        emit("cold-start", Cold(device: DeviceInfo.current(), load: rt.load, makeMs: makeMs, firstGenerateMs: gen, footprintMB: Memory.footprintMB().current))
    }
}
