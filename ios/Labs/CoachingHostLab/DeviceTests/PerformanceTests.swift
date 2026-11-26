import Foundation
import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation
#if canImport(UIKit)
import UIKit
#endif

/// PF-0 on the iPhone for the production host (budgets of handoff §7 / FINAL_REPORT §8, the same `device-budgets` limits as HR5R):
///  - boot: context + verified bundle (`EngineRuntime` from cold in this process, then warm), budget 1 s;
///  - first plan (onboard through the host: facade, store, Keychain), budget 2 s;
///  - full-plan review: the week-0 weekly review through `CoachingWriting.submit` (the facade's submit, kept/notKept and the view), budget 1.5 s
///    p95, 3 s worst; this is the host's own operation (it includes the GAP-12 read and the view), not the harness's P16 step;
///  - footprint after GC and peak, atomic write p95, the largest main-queue stall while all of it runs.
/// `testColdStart` is meant to run once per process (10 xcodebuild invocations) for the cold p95.
final class PerformanceTests: XCTestCase {
    struct Stats: Codable { let n: Int; let p50: Double; let p95: Double; let max: Double
        init(_ xs: [Double]) { let s = xs.sorted(); n = s.count; p50 = s[s.count / 2]; p95 = s[min(s.count - 1, Int((Double(s.count) * 0.95).rounded(.up)) - 1)]; max = s.last! } }

    static func footprintMB() -> (current: Double, peak: Double) {
        var info = task_vm_info_data_t(); var count = mach_msg_type_number_t(MemoryLayout<task_vm_info_data_t>.size / MemoryLayout<integer_t>.size)
        let kr = withUnsafeMutablePointer(to: &info) { $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) { task_info(mach_task_self_, task_flavor_t(TASK_VM_INFO), $0, &count) } }
        guard kr == KERN_SUCCESS else { return (-1, -1) }
        return (Double(info.phys_footprint) / 1_048_576, Double(info.ledger_phys_footprint_peak) / 1_048_576)
    }

    /// The largest delay of a 5 ms main-queue timer while `body` runs (the host never blocks the main thread).
    final class StallProbe: @unchecked Sendable {
        private var last = DispatchTime.now().uptimeNanoseconds, worst: UInt64 = 0, timer: DispatchSourceTimer?
        private let lock = NSLock()
        func start() { let t = DispatchSource.makeTimerSource(queue: .main); t.schedule(deadline: .now(), repeating: .milliseconds(5))
            t.setEventHandler { [self] in let n = DispatchTime.now().uptimeNanoseconds; lock.withLock { worst = Swift.max(worst, n - last); last = n } }; t.resume(); timer = t }
        func stopMs() -> Double { timer?.cancel(); return lock.withLock { Double(worst) / 1e6 - 5 } }
    }

    func testColdStart() throws {
        let q = DispatchQueue(label: "cold")
        let t0 = Clock.ms(); let rt = try q.sync { try EngineRuntime(queue: q, keys: FixtureKeys()) }; let boot = Clock.ms() - t0
        emit("pf0-cold", ["bootMs": boot, "verifyMs": rt.load?.verifyMs ?? -1, "evalMs": rt.load?.evalMs ?? -1])
        XCTAssertLessThan(boot, 1000)
    }

    func testPF0() async throws {
        let probe = StallProbe(); await MainActor.run { probe.start() }
        let q = DispatchQueue(label: "warm")
        var boots: [Double] = []
        for _ in 0..<10 { let t0 = Clock.ms(); _ = try q.sync { try EngineRuntime(queue: q, keys: FixtureKeys()) }; boots.append(Clock.ms() - t0) }
        var firstPlan: [Double] = [], review: [Double] = [], writes: [Double] = []
        for i in 0..<10 {
            let f = try await HostFixture.make("pf0-\(i)")
            var t0 = Clock.ms()
            let o = await f.host.onboard(Athlete.answers(), consents: Athlete.all); firstPlan.append(Clock.ms() - t0)
            XCTAssertEqual(o.answer.planOutcome, .planCreated)
            // The week-0 review: every live session of week 0 reported as prescribed, on its Sunday.
            let week = try await f.host.plan(week: 0).get().week!
            let reports: [AthleteObservation] = week.sessions.filter { $0.status == "PLANNED" }.map { s in
                s.sport == "RUN"
                    ? .plannedRun(sessionId: s.id, occurrenceDate: s.date, observedAt: "\(s.date)T07:40:00-03:00", actual: PlannedRunActual(completed: true, minutes: s.prescription?.durationMinutes ?? 40, rpe: 4), response: .unknown)
                    : .plannedStrength(sessionId: s.id, occurrenceDate: s.date, observedAt: "\(s.date)T19:40:00-03:00",
                                       actual: StrengthActual(completed: true, minutes: 45, exercises: (s.prescription?.exercises ?? []).map { e in
                                           LoggedExerciseEntry(id: e.id, sets: (0..<e.sets).map { _ in LoggedSetEntry(reps: e.reps ?? 8, load: nil, rir: e.rir ?? 2) }) }), response: .unknown)
            }
            f.clock.set(day: "2026-11-22", "20:00")
            let bytes0 = f.host.store.bytesWritten, w0 = Clock.ms()
            t0 = Clock.ms()
            let r = await f.host.submit(ReviewRequest(.sessionReports(reports), eligibility: Athlete.screen("2026-11-22"))); review.append(Clock.ms() - t0)
            XCTAssertTrue(r.answer.ok, "\(r.answer.error?.code.raw ?? "")"); _ = bytes0; _ = w0
            writes.append(Double(f.host.store.commits))
            TestEnv.cleanup("pf0-\(i)")
        }
        // Atomic write: tmp + fsync + rename + dir fsync of a record-sized file.
        let dir = TestEnv.root("pf0-write"); let s = try NativeStore(dir: dir)
        let doc = Data(repeating: 0x61, count: 200_000)
        var atomic: [Double] = []
        for _ in 0..<20 { let t0 = Clock.ms(); try s.atomicWrite(doc, to: dir.appendingPathComponent("w.json")); atomic.append(Clock.ms() - t0) }
        try? FileManager.default.removeItem(at: dir)
        try q.sync { let rt = try EngineRuntime(queue: q, keys: FixtureKeys()); rt.collectGarbage() }
        let fp = Self.footprintMB(), stall = await MainActor.run { probe.stopMs() }
        struct Out: Codable { let boot: Stats; let firstPlan: Stats; let review: Stats; let atomicWrite: Stats; let footprintMB: Double; let peakMB: Double; let maxMainStallMs: Double
            let thermal: String; let lowPower: Bool; let bundleSha256: String }
        #if os(iOS)
        let thermal = ["nominal", "fair", "serious", "critical"][ProcessInfo.processInfo.thermalState.rawValue], low = ProcessInfo.processInfo.isLowPowerModeEnabled
        #else
        let thermal = "n/a", low = false
        #endif
        let out = Out(boot: Stats(boots), firstPlan: Stats(firstPlan), review: Stats(review), atomicWrite: Stats(atomic), footprintMB: fp.current, peakMB: fp.peak,
                      maxMainStallMs: stall, thermal: thermal, lowPower: low, bundleSha256: BundlePin.bundleSha256)
        emit("pf0", out)
        XCTAssertLessThan(out.boot.p95, 1000); XCTAssertLessThan(out.firstPlan.p95, 2000)
        XCTAssertLessThan(out.review.p95, 1500); XCTAssertLessThan(out.review.max, 3000)
        XCTAssertLessThan(out.atomicWrite.p95, 50); XCTAssertLessThan(out.footprintMB, 150); XCTAssertLessThan(out.peakMB, 350); XCTAssertLessThan(out.maxMainStallMs, 100)
    }
}
