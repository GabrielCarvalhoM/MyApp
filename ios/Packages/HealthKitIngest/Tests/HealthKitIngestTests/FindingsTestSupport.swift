import Foundation
import XCTest
@testable import HealthKitIngest
import IntegrationContracts

// Doubles for the #48 findings (P3-2, P3-3, P3-4, QueueStore, QRE-B-R2-03). Synthetic only: no Apple Health data, no value is logged.

/// Fails the test, instead of hanging the run, when `work` does not finish in time. `XCTestExpectation` times out on its own; a cancelled
/// task blocked on a continuation never would (the R2-01 test used to rely on `cancel()`, which unblocks nothing).
func assertFinishes(within seconds: TimeInterval, _ test: XCTestCase, _ what: String, _ work: @escaping @Sendable () async -> Void) async {
    let done = XCTestExpectation(description: what)
    Task { await work(); done.fulfill() }
    await test.fulfillment(of: [done], timeout: seconds)
}

func eventually(_ condition: @Sendable () async -> Bool) async throws {
    for _ in 0..<400 { if await condition() { return }; try await Task.sleep(nanoseconds: 5_000_000) }
}

/// A background window that records, in order, when it was asked for and released, next to the test's own events.
final class RecordingWindow: BackgroundWindow, @unchecked Sendable {
    final class Token: BackgroundWindowToken, @unchecked Sendable {
        let owner: RecordingWindow, n: Int
        init(_ owner: RecordingWindow, _ n: Int) { self.owner = owner; self.n = n }
        var grant: BackgroundWindowGrant { .granted }
        var expired: Bool { false }
        func end() { owner.note("end\(n)") }
    }
    private let lock = NSLock()
    private var all: [String] = []
    private var begun = 0
    func note(_ e: String) { lock.withLock { all.append(e) } }
    var events: [String] { lock.withLock { all } }
    func begin(_ reason: String) async -> BackgroundWindowToken {
        let n = lock.withLock { begun += 1; all.append("begin\(begun)"); return begun }
        return Token(self, n)
    }
    /// Index of an event, for ordering assertions (nil when it never happened).
    func at(_ e: String) -> Int? { events.firstIndex(of: e) }
}

/// Notes each delivery and its answer (by activity ids) in the window's event list.
final class NotingSink: DeviceActivitySink, @unchecked Sendable {
    let inner: ScriptedSink, window: RecordingWindow
    init(_ inner: ScriptedSink, _ window: RecordingWindow) { self.inner = inner; self.window = window }
    func ingestContext() async -> IngestContextResult { await inner.ingestContext() }
    func deliver(_ d: DeviceDelivery) async -> DeliveryResult {
        let ids = d.activities.map(\.activityId).joined(separator: ",")
        window.note("deliver:\(ids)")
        let r = await inner.deliver(d)
        window.note("answered:\(ids)")
        return r
    }
}

/// A sink whose first context answers are scripted (the rest are the inner sink's).
final class ContextScriptSink: DeviceActivitySink, @unchecked Sendable {
    let inner: ScriptedSink
    private let lock = NSLock()
    private var script: [IngestContextResult] = []
    init(_ inner: ScriptedSink) { self.inner = inner }
    func then(_ r: IngestContextResult...) { lock.withLock { script += r } }
    func ingestContext() async -> IngestContextResult {
        if let next = lock.withLock({ script.isEmpty ? nil : script.removeFirst() }) { return next }
        return await inner.ingestContext()
    }
    func deliver(_ d: DeviceDelivery) async -> DeliveryResult { await inner.deliver(d) }
}

/// Apple Health whose observer or background-delivery registration can be held mid-call; what is held takes effect only when released
/// (the worst case: the registration lands after the athlete turned the switch off).
final class GatedReader: HealthReading, @unchecked Sendable {
    enum Gate { case startObserving, backgroundOn }
    let inner = ScriptedReader()
    private let lock = NSLock()
    private var holds: [Gate] = []
    private var waiter: CheckedContinuation<Void, Never>?
    func hold(_ g: Gate) { lock.withLock { holds.append(g) } }
    var isHolding: Bool { lock.withLock { waiter != nil } }
    func release() { let w = lock.withLock { () -> CheckedContinuation<Void, Never>? in let w = waiter; waiter = nil; return w }; w?.resume() }
    private func gate(_ g: Gate) async {
        let held = lock.withLock { () -> Bool in guard let i = holds.firstIndex(of: g) else { return false }; holds.remove(at: i); return true }
        if held { await withCheckedContinuation { c in lock.withLock { waiter = c } } }
    }
    func requestReadAuthorization() async throws { try await inner.requestReadAuthorization() }
    func readWorkouts(anchor: Data?, startingAt: Date) async throws -> WorkoutReadBatch { try await inner.readWorkouts(anchor: anchor, startingAt: startingAt) }
    func startObserving(_ onChange: @escaping @Sendable () async -> Void) async throws { await gate(.startObserving); try await inner.startObserving(onChange) }
    func stopObserving() async { await inner.stopObserving() }
    func setBackgroundDelivery(_ enabled: Bool) async throws {
        if enabled { await gate(.backgroundOn) }
        try await inner.setBackgroundDelivery(enabled)
    }
}

/// A store that records every operation, so a test can prove a purge never removes the file before replacing it (QRE-B-R2-02 c).
final class OpsStore: QueueStore, @unchecked Sendable {
    private let lock = NSLock()
    private(set) var data: Data?
    private(set) var ops: [String] = []
    var failSaves = 0
    init(_ data: Data?) { self.data = data }
    func load() throws -> Data? { lock.withLock { ops.append("load"); return data } }
    func save(_ d: Data) throws {
        try lock.withLock {
            ops.append("save")
            if failSaves > 0 { failSaves -= 1; throw QueueStoreError.writeFailed(code: 28) }
            data = d
        }
    }
    func remove() throws { lock.withLock { ops.append("remove"); data = nil } }
}

/// Two copies of one physical run (same facts, different apps): G1 starts first, so it is the run of the group when none was sent.
enum Copies {
    static let g1 = hkRun("G1", "2026-11-17", "07:00", minutes: 40, meters: 7000, source: Src.garmin)
    static let s1 = hkRun("S1", "2026-11-17", "07:00", seconds: 5, minutes: 39.9, meters: 6990, source: Src.strava)
    static let plan = IngestContext.plan([("w0-run-d1", "2026-11-17"), ("w0-run-d3", "2026-11-19")])
}
