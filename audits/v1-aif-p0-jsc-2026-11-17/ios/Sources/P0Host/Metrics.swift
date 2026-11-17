import Foundation
#if canImport(UIKit)
import UIKit
#endif

/// Process memory as the system accounts it (phys_footprint, the number jetsam uses) and its lifetime peak.
public enum Memory {
    public static func footprintMB() -> (current: Double, lifetimePeak: Double) {
        var info = task_vm_info_data_t()
        var count = mach_msg_type_number_t(MemoryLayout<task_vm_info_data_t>.size / MemoryLayout<natural_t>.size)
        let kr = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) { task_info(mach_task_self_, task_flavor_t(TASK_VM_INFO), $0, &count) }
        }
        guard kr == KERN_SUCCESS else { return (-1, -1) }
        return (Double(info.phys_footprint) / 1_048_576, Double(info.ledger_phys_footprint_peak) / 1_048_576)
    }
}

/// Samples phys_footprint every `intervalMs` on a utility queue; `stop()` returns the max seen (a transient peak of one operation).
public final class FootprintSampler {
    private let timer: DispatchSourceTimer
    private let lock = NSLock()
    private var maxMB = 0.0
    public init(intervalMs: Int = 2) {
        timer = DispatchSource.makeTimerSource(queue: DispatchQueue(label: "fit.vilumo.p0.sampler", qos: .utility))
        timer.schedule(deadline: .now(), repeating: .milliseconds(intervalMs))
        timer.setEventHandler { [weak self] in
            guard let self else { return }
            let m = Memory.footprintMB().current
            self.lock.lock(); if m > self.maxMB { self.maxMB = m }; self.lock.unlock()
        }
        timer.resume()
    }
    public func stop() -> Double { timer.cancel(); lock.lock(); defer { lock.unlock() }; return maxMB }
}

/// Nearest-rank statistics, as in the AIF lab (harness/perf.mjs): with n < 20 the p95 is the maximum.
public struct Stats: Codable {
    public let n: Int, median: Double, p95: Double, max: Double, min: Double
    public init?(_ xs: [Double]) {
        guard !xs.isEmpty else { return nil }
        let s = xs.sorted()
        func q(_ p: Double) -> Double { s[Swift.min(s.count - 1, Swift.max(0, Int((p * Double(s.count)).rounded(.up)) - 1))] }
        n = s.count; median = q(0.5); p95 = q(0.95); max = s.last!; min = s.first!
    }
}

/// The measurement environment, recorded with every result.
public struct DeviceInfo: Codable {
    public let machine: String, system: String, physicalMemoryMB: Double, processorCount: Int
    public let thermalState: String, lowPowerMode: Bool, configuration: String, isSimulator: Bool, debuggerAttached: Bool, date: String
    /// QRE-P0-08: timings taken under a debugger do not represent the app; the result records whether one was attached (P_TRACED).
    public static func isDebuggerAttached() -> Bool {
        var info = kinfo_proc(), size = MemoryLayout<kinfo_proc>.stride
        var mib: [Int32] = [CTL_KERN, KERN_PROC, KERN_PROC_PID, getpid()]
        guard sysctl(&mib, u_int(mib.count), &info, &size, nil, 0) == 0 else { return false }
        return (info.kp_proc.p_flag & P_TRACED) != 0
    }
    @MainActor public static func current() -> DeviceInfo {
        var u = utsname(); uname(&u)
        let machine = withUnsafeBytes(of: &u.machine) { String(decoding: $0.prefix(while: { $0 != 0 }), as: UTF8.self) }
        #if canImport(UIKit)
        let system = "\(UIDevice.current.systemName) \(UIDevice.current.systemVersion)"
        #else
        let system = ProcessInfo.processInfo.operatingSystemVersionString
        #endif
        let thermal: String
        switch ProcessInfo.processInfo.thermalState { case .nominal: thermal = "nominal"; case .fair: thermal = "fair"; case .serious: thermal = "serious"; case .critical: thermal = "critical"; @unknown default: thermal = "unknown" }
        #if DEBUG
        let config = "Debug"
        #else
        let config = "Release"
        #endif
        #if targetEnvironment(simulator)
        let sim = true
        #else
        let sim = false
        #endif
        return DeviceInfo(machine: machine, system: system, physicalMemoryMB: Double(ProcessInfo.processInfo.physicalMemory) / 1_048_576,
                          processorCount: ProcessInfo.processInfo.activeProcessorCount, thermalState: thermal,
                          lowPowerMode: ProcessInfo.processInfo.isLowPowerModeEnabled, configuration: config, isSimulator: sim, debuggerAttached: isDebuggerAttached(),
                          date: ISO8601DateFormatter().string(from: Date()))
    }
}
