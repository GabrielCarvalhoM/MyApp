import Foundation
import IntegrationContracts

// How B acts on A's answer to a delivery (contract §6.2) and runs its delivery loop. Moved out of `HealthKitIngestor.swift`; changed only
// where QRE-B P3-2 (set-asides that may be on the record), QRE-B-R2-03 (a caller that waits for the loop) and #85 (re-sends after an
// exhausted retryLater; a delivery that may have landed) needed it, as marked.

extension HealthKitIngestor {
    /// The boundary code of a refusal that says the workout is already on the record, linked to another session.
    static let activityLinkedElsewhere = "ACTIVITY_LINKED_ELSEWHERE"

    /// Runs the delivery loop until nothing more can be sent now. A caller arriving while it runs asks for one more pass and returns at
    /// once (A's signals and triggers: never wait, the running pass may itself be awaiting A, CCP-B-04), or, with `waitForRunning`, returns
    /// only once that loop has ended (the observer's background window, QRE-B-R2-03: it is called from its own task, which A never awaits).
    func pump(waitForRunning: Bool = false) async {
        if pumping {
            pumpAgain = true
            if waitForRunning { await withCheckedContinuation { pumpWaiters.append($0) } }
            return
        }
        pumping = true
        repeat { pumpAgain = false; await drain() } while pumpAgain && !dead
        pumping = false
        let waiters = pumpWaiters; pumpWaiters = []
        for w in waiters { w.resume() }
    }


    /// Contract §6.2, every row.
    /// `signalledSince`: A called `deliveryConditionsChanged()` while this delivery was in flight (QRE-B-03). A waiting, halted or
    /// hostUnavailable answer then does not park the queue, and a NOT_RECORDED workout counts as already signalled: it is re-sent at once
    /// in a new delivery (attempt counted), never left for a signal that already came.
    func apply(_ result: DeliveryResult, to flight: InFlight, signalledSince: Bool) {
        var s = state
        s.inFlight = nil
        let ids = flight.activities.map(\.activityId)
        func index(_ id: String) -> Int? { s.items.firstIndex { $0.activityId == id } }
        /// Nothing was recorded by this answer: a workout deleted in Apple Health while in flight now simply leaves the queue, unless it
        /// may be on the record (QRE #84 P3-1: e.g. `retryLater` exhausted by a refusal): it stays the run of its group, so its copy is never
        /// promoted. QRE #90 P3-1: also when an EARLIER send of it may have landed (a retryLater, then e.g. CLOCK_AHEAD_OF_REFERENCE): it is
        /// kept set aside ATTEMPTS_EXHAUSTED and may-be-on-record, with no re-send (deleted, G-5), counted once DELETED_MAYBE_ON_RECORD.
        func dropDeletedUnrecorded() {
            for id in ids { if let i = index(id), s.items[i].deletedWhileInFlight, !s.items[i].mayBeOnRecord {
                if s.items[i].mayHaveLanded { Self.setAside(&s, i, code: IngestCode.attemptsExhausted); s.items[i].resendDue = nil; continue }
                s.items.remove(at: i); s.counters[IngestCode.deletedBeforeDelivery, default: 0] += 1 } }
        }
        var code: String?
        switch result {
        case .answered(_, let results):
            s.retryLaterStreak = 0; s.nextRetryAt = nil; lastRetryCode = nil
            chunkLimit = DeliveryLimits.activitiesPerDelivery
            let byIndex = Dictionary(results.map { ($0.index, $0) }, uniquingKeysWith: { a, _ in a })
            for (k, a) in flight.activities.enumerated() {
                guard let i = index(a.activityId) else { continue }
                let r = byIndex[k].flatMap { $0.activityId == a.activityId ? $0.outcome : nil } ?? .notRecorded(reason: "RESULT_MISSING")
                switch r {
                case .recorded, .duplicate:
                    var eventId: String?; if case .recorded(let e) = r { eventId = e }
                    s.ledger[a.activityId] = LedgerEntry(eventId: eventId, outcome: eventId == nil ? "DUPLICATE" : "RECORDED", sessionId: a.sessionId,
                                                         digest: WorkoutNormalizer.digest(a), end: s.items[i].end, activity: a,
                                                         start: s.items[i].start, provenance: s.items[i].provenance)
                    if s.items[i].deletedWhileInFlight { s.counters[IngestCode.deletedAfterDelivery, default: 0] += 1 }
                    s.items.remove(at: i)
                case .notRecorded(let reason):
                    // #85: an answered NOT_RECORDED proves the workout absent from the record (on record, the same id and facts would be
                    // DUPLICATE): no earlier send of it landed, so a re-sent workout no longer holds its group on that account.
                    s.items[i].mayBeOnRecord = false; s.items[i].mayHaveLanded = false
                    if s.items[i].deletedWhileInFlight {
                        s.items.remove(at: i); s.counters[IngestCode.deletedBeforeDelivery, default: 0] += 1
                    } else if s.items[i].attempts >= config.maxAttempts {
                        // An answered NOT_RECORDED proves it is not on the record: a copy of the same run may become the run (P3-2).
                        s.items[i].state = .setAside(code: IngestCode.attemptsExhausted)
                    } else if signalledSince {
                        s.items[i].attempts += 1; s.items[i].state = .pending
                    } else {
                        s.items[i].state = .notRecorded(reason: reason)
                    }
                }
            }
            log.log(.init(.deliveryAnswered, counts: Self.outcomeCounts(results), deliveryId: flight.deliveryId))
        case .refused(let c, let at, let disposition):
            code = c
            // QRE-B-02: a refusal with the retryLater disposition continues the streak (QRE #84 P3-1: it used to restart it here, so the
            // bound never applied to it); any other refusal breaks it (also below).
            if disposition != .retryLater { s.retryLaterStreak = 0; s.nextRetryAt = nil }
            let culprit = at.flatMap { $0 >= 0 && $0 < ids.count ? index(ids[$0]) : nil }
            switch disposition {
            case .setAsideItem where culprit != nil:
                Self.setAside(&s, culprit!, code: c)
            case .resendUnlinked where culprit != nil:
                // Frozen unlinked for good: the boundary refused the link (UNKNOWN_SESSION, SPORT_MISMATCH).
                s.items[culprit!].activity = s.items[culprit!].activity.unlinked()
            case .waiting:
                if !signalledSince { s.block = .waiting(code: c) }
            case .halted:
                if !signalledSince { s.block = .halted(code: c) }
            case .retryLater:
                s.inFlight = flight
                retryLater(&s, flight, code: c)
            default:
                // adapterBug (or a per-item disposition without a usable index): log the code only, split, and set aside on repetition.
                log.log(.init(.adapterBug, code: c, deliveryId: flight.deliveryId))
                if ids.count > 1 { chunkLimit = max(1, ids.count / 2) }
                else if let i = index(ids[0]) {
                    s.items[i].adapterBugStrikes += 1
                    if s.items[i].adapterBugStrikes >= 2 { Self.setAside(&s, i, code: c) }
                }
            }
            if s.inFlight == nil { dropDeletedUnrecorded() }
        case .waiting(let c):
            code = c; if !signalledSince { s.block = .waiting(code: c) }; dropDeletedUnrecorded()
        case .halted(let c):
            code = c; if !signalledSince { s.block = .halted(code: c) }; dropDeletedUnrecorded()
        case .retryLater(let c):
            // #85: "nothing was confirmed": this send may have landed.
            for id in ids { if let i = index(id) { s.items[i].mayHaveLanded = true } }
            code = c; s.inFlight = flight
            retryLater(&s, flight, code: c)
        case .hostUnavailable:
            code = HostCode.hostUnavailable
            s.inFlight = flight
            if !signalledSince { hostUnavailable = true }
        }
        // QRE-B-02: only CONSECUTIVE retryLater answers count; any other answer breaks the streak.
        if case .retryLater = result {} else if case .refused(_, _, .retryLater) = result {} else {
            s.retryLaterStreak = 0; s.nextRetryAt = nil; lastRetryCode = nil
        }
        if case .answered = result {} else { log.log(.init(.deliveryAnswered, code: code, deliveryId: flight.deliveryId)) }
        do { try commit(s) } catch {
            // The answer could not be written: the in-flight delivery stays on disk and is re-sent with the same id (custody replays its
            // stored answer: QRE-B-15, one extra round trip at most). Nothing is sent until a write succeeds; every trigger retries.
            // #85: the unwritten answer may have been a landed write (kept in memory; written with the next commit that succeeds).
            writeFailed = true
            for id in ids { if let i = state.items.firstIndex(where: { $0.activityId == id }) { state.items[i].mayHaveLanded = true } }
        }
    }

    func retryLater(_ s: inout QueueState, _ flight: InFlight, code: String) {
        s.retryLaterStreak += 1
        lastRetryCode = code
        if s.retryLaterStreak >= config.maxConsecutiveRetryLater {
            // P3-2: `retryLater` never proves that nothing was written ("or a write that landed is replayed", `DeviceDelivery`). These
            // workouts may be on the record: each stays the run of its group, so a copy of it is never promoted and sent as a second run.
            // #85: unless no send of it ever landed (only refusals, which record NOTHING: `QueueItem.mayHaveLanded`, applied by
            // `setAside`). Either way each workout gets its bounded re-send rounds (+Resend), holds its group while one is to come, and the
            // wake for its round is scheduled now (QRE #90 P3-3: a due round never waits for a signal or a launch).
            for a in flight.activities { if let i = s.items.firstIndex(where: { $0.activityId == a.activityId }) {
                Self.setAside(&s, i, code: IngestCode.attemptsExhausted)
                armResend(&s, i)
                if let due = s.items[i].resendDue { scheduleResendWake(at: due) } } }
            s.inFlight = nil; s.retryLaterStreak = 0; s.nextRetryAt = nil; lastRetryCode = nil
            return
        }
        let delay = min(config.backoffCap, config.backoffBase * pow(2, Double(s.retryLaterStreak - 1)))
        s.nextRetryAt = clock().addingTimeInterval(delay)
    }

    /// Every set-aside of a sent workout after a boundary answer. ACTIVITY_LINKED_ELSEWHERE, whatever the disposition that carried it,
    /// records nothing now but says the workout is ALREADY on the record (linked to another session): it may be on record (P3-2, QRE #84
    /// P3-2). So does any set-aside of a workout a send of which may have landed (#85 `mayHaveLanded`: a refusal now proves nothing about
    /// that earlier send). A workout deleted in Apple Health while in flight that turns out to be possibly on record is counted once (QRE
    /// #84 P3-1).
    static func setAside(_ s: inout QueueState, _ i: Int, code: String, mayBeOnRecord: Bool = false) {
        s.items[i].state = .setAside(code: code)
        guard mayBeOnRecord || code == activityLinkedElsewhere || s.items[i].mayHaveLanded, !s.items[i].mayBeOnRecord else { return }
        s.items[i].mayBeOnRecord = true
        if s.items[i].deletedWhileInFlight { s.counters[IngestCode.deletedMaybeOnRecord, default: 0] += 1 }
    }

    func scheduleRetry(at: Date) {
        guard !retryScheduled else { return }
        retryScheduled = true
        scheduler.schedule(after: at.timeIntervalSince(clock())) { [weak self] in await self?.retryFired() }
    }
    func retryFired() async { retryScheduled = false; await pump() }

    static func outcomeCounts(_ results: [ActivityResult]) -> [String: Int] {
        var c: [String: Int] = [:]
        for r in results {
            switch r.outcome { case .recorded: c["RECORDED", default: 0] += 1; case .duplicate: c["DUPLICATE", default: 0] += 1
            case .notRecorded(let why): c["NOT_RECORDED:" + why, default: 0] += 1 }
        }
        return c
    }
}
