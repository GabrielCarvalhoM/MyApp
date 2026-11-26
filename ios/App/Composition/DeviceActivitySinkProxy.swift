import Foundation
import IntegrationContracts

/// Breaks the A ↔ B construction cycle: front B (`HealthKitIngestor`) needs a `DeviceActivitySink` when it is built, and front A
/// (`CoachingHost.open`) needs B as its `DeviceQueueControl` while it opens. The composition builds B over this proxy, opens A with B, then
/// binds A here. Owned by the composition; it holds A weakly (A → B → proxy would otherwise be a cycle), so A's lifetime is the composition's.
///
/// Before `bind` (A still opening, or it failed to open) and after A is gone, B gets the answers the contract defines for "no host": the
/// context is `unavailable(HOST_UNAVAILABLE)` and a delivery is `hostUnavailable` (nothing sent, nothing confirmed; B keeps its queue and tries
/// again on the next trigger). B reaches the engine only through A's own `deliver`; the proxy changes no content and decides nothing.
///
/// CCP-B-04: the lock guards only the reference. It is never held across an `await`, so a call from B is never serialised behind another
/// call, the proxy adds no wait between the two sides, and a re-entrant call (A signalling B while B's call is pending on A) cannot block here.
final class DeviceActivitySinkProxy: DeviceActivitySink, @unchecked Sendable {
    private let lock = NSLock()
    private weak var target: DeviceActivitySink?
    private var bound = false

    init() {}

    /// Binds the one host of this process. A second bind is refused and changes nothing (one `CoachingHost` per athlete per process, #49 P2-1).
    @discardableResult
    func bind(_ sink: DeviceActivitySink) -> Bool {
        lock.lock(); defer { lock.unlock() }
        guard !bound else { return false }
        target = sink; bound = true
        return true
    }

    var isBound: Bool { lock.lock(); defer { lock.unlock() }; return target != nil }

    private func current() -> DeviceActivitySink? { lock.lock(); defer { lock.unlock() }; return target }

    func ingestContext() async -> IngestContextResult {
        guard let sink = current() else { return .unavailable(code: HostCode.hostUnavailable) }
        return await sink.ingestContext()
    }

    func deliver(_ delivery: DeviceDelivery) async -> DeliveryResult {
        guard let sink = current() else { return .hostUnavailable }
        return await sink.deliver(delivery)
    }
}
