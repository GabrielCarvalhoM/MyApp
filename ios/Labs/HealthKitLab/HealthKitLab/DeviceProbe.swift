import Foundation
import HealthKit
import UIKit
import HealthKitIngest
import IntegrationContracts

/// Device probes run INSIDE the installed lab app (no test-runner reinstall between the Founder's answer and the read). Each writes a
/// counts-and-codes-only report to the lab's own Documents folder, copied out with `devicectl device copy from`. Contract §9: nothing is
/// written to Apple Health, heart rate is never requested on a device, nothing reaches CoachingCore (the host double answers WAITING), the
/// queue lives in a temporary folder and is purged at the end, and no value, date or source name is ever written.
enum DeviceProbe {
    /// The host double: never forwards anything; every workout stays queued (and is purged at the end).
    final class NoHost: DeviceActivitySink, @unchecked Sendable {
        let context: IngestContext
        private(set) var deliveries = 0
        init(days: Int) {
            context = IngestContext(recordStartDay: BoundaryInstant.day(Date().addingTimeInterval(-Double(days) * 86_400), offsetMinutes: 0),
                                    timezoneOffsetMinutes: 0, runSessions: [], version: 1)
        }
        func ingestContext() async -> IngestContextResult { .ready(context) }
        func deliver(_ d: DeviceDelivery) async -> DeliveryResult { deliveries += 1; return .waiting(code: "LAB_NO_HOST") }
    }
    final class Lines: IngestLogSink, @unchecked Sendable {
        private let lock = NSLock(); private(set) var all: [String] = []
        func log(_ e: IngestLogEvent) { lock.lock(); all.append(e.description); lock.unlock() }
    }

    static func write(_ name: String, _ lines: [String]) {
        let url = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent(name)
        try? Data((lines.joined(separator: "\n") + "\n").utf8).write(to: url, options: .atomic)
    }
    static func ingestor(_ sink: NoHost, _ log: Lines) -> HealthKitIngestor {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("hklab-probe-\(UUID().uuidString)")
        return HealthKitIngestor(reader: HealthKitReader(), sink: sink, recordings: nil, store: FileQueueStore(directory: dir), log: log)
    }
    static func report(_ ing: HealthKitIngestor, _ sink: NoHost, _ log: Lines, tag: String) async -> [String] {
        let st = await ing.status(), c = await ing.counts()
        return ["\(tag) authorization=\(st.authorization.rawValue) lastReadError=\(st.lastReadError ?? "none")",
                "\(tag) receivedTypes=\(st.receivedTypes.joined(separator: ","))",
                "\(tag) queued=\(st.queued) pending=\(c.pending) held=\(c.held) setAside=\(c.setAside.count) deliveriesToDouble=\(sink.deliveries)",
                "\(tag) excluded=\(c.excluded.sorted { $0.key < $1.key }.map { "\($0.key):\($0.value)" }.joined(separator: ","))",
                "\(tag) nonRunSummaries=\(await ing.importedNonRunWorkouts(since: .distantPast).count)"] + log.all.map { "\(tag) log \($0)" }
    }

    /// `-labDeviceProbe`: authorization state, one anchored read of the last 28 days, observer + background-delivery registration.
    static func read() async {
        let sink = NoHost(days: 28), log = Lines(), ing = ingestor(sink, log)
        await ing.start()
        var out = await report(ing, sink, log, tag: "READ")
        try? await ing.purge(.accountErased)
        try? await ing.setEnabled(false)   // leaves no lab observer or background registration behind
        out.append("READ purged=yes observerStopped=yes")
        write("lab-probe.txt", out)
    }

    /// `-labLockProbe`: waits for the Founder to lock the iPhone, reads while locked (HealthKit is inaccessible: the read must wait, losing
    /// nothing), then reads again after the unlock.
    @MainActor static func lock() async {
        write("lab-lock.txt", ["LOCK waiting for the lock (press the side button)"])
        let task = UIApplication.shared.beginBackgroundTask(withName: "hklab-lock-probe")
        defer { UIApplication.shared.endBackgroundTask(task) }
        for await _ in NotificationCenter.default.notifications(named: UIApplication.protectedDataWillBecomeUnavailableNotification) { break }
        try? await Task.sleep(nanoseconds: 12_000_000_000)   // the Health store closes some seconds after the lock
        let sink = NoHost(days: 28), log = Lines(), ing = ingestor(sink, log)
        await ing.start()
        var out = await report(ing, sink, log, tag: "LOCKED")
        write("lab-lock.txt", out + ["LOCK waiting for the unlock"])
        if !UIApplication.shared.isProtectedDataAvailable {
            for await _ in NotificationCenter.default.notifications(named: UIApplication.protectedDataDidBecomeAvailableNotification) { break }
        }
        await ing.protectedDataDidBecomeAvailable()
        out += await report(ing, sink, log, tag: "UNLOCKED")
        try? await ing.purge(.accountErased); try? await ing.setEnabled(false)
        write("lab-lock.txt", out + ["LOCK done"])
    }
}
