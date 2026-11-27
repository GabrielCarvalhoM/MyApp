import Foundation
import IntegrationContracts

// #85: a workout set aside after its delivery exhausted `retryLater` is sent again, bounded. Since #48 (P3-2) such a workout stays the run
// of its same-run group (its copies are consolidated into it), so before this it was never sent at all: a long PERSISTENCE_FAILURE outage in
// which nothing landed lost the run. It is now reopened by `deliveryConditionsChanged()` and at launch, once its round is due, and sent with
// its frozen bytes (same `activityId`, same link, same facts) in a NEW delivery (contract: a new id after any answer that is not retried).
// The boundary settles it (integration.mjs `admit`): same id with the same facts is DUPLICATE when a write landed (it goes to the ledger and
// counts once); otherwise it is decided as a first send. Nothing here releases the group's copies: only an answered NOT_RECORDED proves the
// workout absent (+Answers), and a workout whose rounds ran out keeps #48's rule.

/// Waits before a `retryLater` re-send (bounded exponential backoff, contract §6.2) or before a re-send round is due (#85). Injected so
/// tests control time.
public protocol RetryScheduler: Sendable {
    func schedule(after seconds: TimeInterval, _ work: @escaping @Sendable () async -> Void)
}
public struct TaskRetryScheduler: RetryScheduler {
    public init() {}
    public func schedule(after seconds: TimeInterval, _ work: @escaping @Sendable () async -> Void) {
        Task { try? await Task.sleep(nanoseconds: UInt64(max(0, seconds) * 1_000_000_000)); await work() }
    }
}

extension HealthKitIngestor {
    /// #85: how often, and how far apart, a workout set aside after exhausting `retryLater` is sent again. Each round may itself exhaust
    /// `retryLater` (at most `maxConsecutiveRetryLater` sends); after `maxRounds` the workout stays set aside for good, so a fault that never
    /// clears never loops. Delivery-retry parameters only: nothing here is a training rule.
    public struct ResendPolicy: Sendable {
        public var maxRounds = 8
        /// The first round is due this long after the set-aside; each next one twice as long, at most `cap` (15 min … 24 h).
        public var base: TimeInterval = 900
        public var cap: TimeInterval = 86_400
        public init() {}
        func delay(afterRounds n: Int) -> TimeInterval { min(cap, base * pow(2, Double(max(0, n)))) }
    }

    /// The round after a `retryLater` exhaustion of item `i`, if one is left. A workout deleted in Apple Health is never sent again (G-5).
    func armResend(_ s: inout QueueState, _ i: Int) {
        let it = s.items[i]
        s.items[i].resendDue = it.resends < config.resend.maxRounds && !it.deletedWhileInFlight
            ? clock().addingTimeInterval(config.resend.delay(afterRounds: it.resends)) : nil
    }

    static func awaitsResend(_ it: QueueItem) -> Bool {
        it.resendDue != nil && !it.deletedWhileInFlight && it.state == .setAside(code: IngestCode.attemptsExhausted)
    }

    /// Reopens every workout whose round is due: pending again, still frozen, so `buildDelivery` puts its exact bytes in a new delivery. A due
    /// instant further away than the longest wait means the clock went back: due now (the rounds still bound it). Returns how many were
    /// reopened and the earliest round still to come.
    func reopenDue(_ s: inout QueueState) -> (reopened: Int, next: Date?) {
        let now = clock()
        var reopened = 0, next: Date?
        for i in s.items.indices where Self.awaitsResend(s.items[i]) {
            guard let due = s.items[i].resendDue else { continue }
            if due <= now || due.timeIntervalSince(now) > config.resend.cap {
                s.items[i].state = .pending; s.items[i].resendDue = nil; s.items[i].resends += 1; reopened += 1
            } else { next = min(next ?? due, due) }
        }
        if reopened > 0 { log.log(.init(.resendReopened, counts: ["reopened": reopened])) }
        return (reopened, next)
    }

    /// `deliveryConditionsChanged()`: every NOT_RECORDED workout is sent again (attempt counted, contract §6.2), and every re-send round that
    /// is due (#85). A round not yet due is armed by this signal: it is reopened when due, without waiting for another signal.
    func reopenAfterSignal(_ s: inout QueueState) {
        for i in s.items.indices { if case .notRecorded = s.items[i].state { s.items[i].attempts += 1; s.items[i].state = .pending } }
        if let next = reopenDue(&s).next { scheduleResendWake(at: next) }
    }

    /// At launch (#85): the rounds that came due while the app was not running, and the wake for the next one. A failed write is retried on
    /// the next trigger; memory already holds the reopened state (QRE-B-04).
    func resendAtLaunch() {
        guard !storeUnreadable, purgePending == nil else { return }
        var s = state
        let r = reopenDue(&s)
        if let next = r.next { scheduleResendWake(at: next) }
        guard r.reopened > 0 else { return }
        do { try commit(s) } catch { state = s; writeFailed = true }
    }

    func scheduleResendWake(at due: Date) {
        if let w = resendWakeAt, w <= due { return }
        resendWakeAt = due
        scheduler.schedule(after: max(0, due.timeIntervalSince(clock()))) { [weak self] in await self?.resendWakeFired() }
    }

    /// The armed round is due: reopen it (a wake that fires early only arms the next one) and run the delivery loop.
    func resendWakeFired() async {
        resendWakeAt = nil
        guard !dead, loaded, !storeUnreadable, purgePending == nil else { return }
        var s = state
        let r = reopenDue(&s)
        if let next = r.next { scheduleResendWake(at: next) }
        guard r.reopened > 0 else { return }
        do { try commit(s) } catch { state = s; writeFailed = true; return }
        await pump()
    }
}
