import Foundation
import IntegrationContracts

/// Waits before a `retryLater` re-send (bounded exponential backoff, contract §6.2). Injected so tests control time.
public protocol RetryScheduler: Sendable {
    func schedule(after seconds: TimeInterval, _ work: @escaping @Sendable () async -> Void)
}
public struct TaskRetryScheduler: RetryScheduler {
    public init() {}
    public func schedule(after seconds: TimeInterval, _ work: @escaping @Sendable () async -> Void) {
        Task { try? await Task.sleep(nanoseconds: UInt64(max(0, seconds) * 1_000_000_000)); await work() }
    }
}

/// Counts by queue state, for the app's own NOT_SYNCED state (handoff §4 item 13). Codes and counts only, never a payload.
public struct IngestCounts: Equatable, Sendable {
    public let pending: Int
    public let notRecorded: Int
    public let held: Int
    public let inFlight: Int
    /// Set-aside workouts by code (BEFORE_RECORD_START, OVERLAPS_APP_RECORDING, ATTEMPTS_EXHAUSTED, …).
    public let setAside: [String: Int]
    public let delivered: Int
    /// Workouts never queued, by reason (USER_ENTERED, STRENGTH_NOT_DEVICE_CHANNEL, NON_RUN_WORKOUT).
    public let excluded: [String: Int]
    /// G-5 deletions, measured distance lost to an app recording.
    public let counters: [String: Int]
    /// Workouts consolidated into another workout of the same physical run (`SameRunRule`): never sent.
    public let consolidated: Int
    /// Workouts awaiting reconciliation, by code (RECONCILE_PARTIAL_OVERLAP, RECONCILE_MEASUREMENTS_DISAGREE, RECONCILE_SEVERAL_RUNS).
    public let reconcile: [String: Int]
}

/// Front B's queue: one Swift actor, one delivery in flight at a time (contract §7). It implements `DeviceQueueControl` (called by A) and
/// `HealthIngestStatusSource` (read by C), and delivers only through `DeviceActivitySink` (A). It never classifies, never prescribes.
public actor HealthKitIngestor: DeviceQueueControl, HealthIngestStatusSource {
    public struct Configuration: Sendable {
        /// Re-sends of a NOT_RECORDED workout after `deliveryConditionsChanged()` before it is set aside `ATTEMPTS_EXHAUSTED` (contract §6.2).
        public var maxAttempts = 8
        /// Consecutive `retryLater` answers of one delivery before its workouts are set aside `ATTEMPTS_EXHAUSTED`.
        public var maxConsecutiveRetryLater = 8
        public var backoffBase: TimeInterval = 2
        public var backoffCap: TimeInterval = 300
        public init() {}
    }

    // Internal, not private: the actor's extensions (`HealthKitIngestor+*.swift`) share them. Nothing outside the module sees them.
    let reader: HealthReading
    let sink: DeviceActivitySink
    let recordings: AppRecordingIndex?
    let store: QueueStore
    let log: IngestLogSink
    let clock: @Sendable () -> Date
    let scheduler: RetryScheduler
    let config: Configuration
    /// QRE-B-R2-03: keeps the process running while an observer notification's delivery is under way.
    let backgroundWindow: BackgroundWindow

    var state = QueueState()
    var loaded = false
    /// The queue file could not be decoded: fail closed, never overwritten; only `purge` clears it.
    var storeUnreadable = false
    /// HealthKit answered `errorDatabaseInaccessible` (device locked): reads wait for `protectedDataDidBecomeAvailable`.
    var healthLocked = false
    var hostUnavailable = false
    /// QRE-B-04: B could not write an answer or a signal. Nothing is sent until a write succeeds again (retried on every trigger).
    var writeFailed = false
    /// QRE-B-05: a purge whose durable write failed. Memory already holds the purged state; nothing is read or sent, and every trigger
    /// retries the write, until it is on disk.
    var purgePending: QueuePurgeReason?
    /// QRE-B-03: advanced by every `deliveryConditionsChanged()`. The answer to a delivery sent before the latest signal cannot park the
    /// queue (that signal may be exactly what the answer was waiting for).
    var conditionsEpoch = 0
    var contextUnavailableCode: String?
    var lastRetryCode: String?
    var chunkLimit = DeliveryLimits.activitiesPerDelivery
    var pumping = false, pumpAgain = false
    var pumpWaiters: [CheckedContinuation<Void, Never>] = []
    var reading = false, readAgain = false
    var readWaiters: [CheckedContinuation<Void, Never>] = []
    /// The observer is registered (`syncObservation` keeps it, and background delivery, in line with the athlete's switch).
    var observing = false
    var syncingObservation = false, syncObservationAgain = false
    var observationWaiters: [CheckedContinuation<Void, Never>] = []
    var observerPump: Task<Void, Never>?
    var retryScheduled = false

    /// Test hook: the process "dies" after the host answered a delivery and before B wrote the answer (handoff §7 item 5).
    var dieAfterDeliverBeforeApply = false
    private(set) var dead = false

    public init(reader: HealthReading, sink: DeviceActivitySink, recordings: AppRecordingIndex?, store: QueueStore,
                log: IngestLogSink = OSIngestLog(), clock: @escaping @Sendable () -> Date = { Date() },
                scheduler: RetryScheduler = TaskRetryScheduler(), configuration: Configuration = Configuration(),
                backgroundWindow: BackgroundWindow = ProcessBackgroundWindow()) {
        self.reader = reader; self.sink = sink; self.recordings = recordings; self.store = store; self.log = log
        self.clock = clock; self.scheduler = scheduler; self.config = configuration; self.backgroundWindow = backgroundWindow
    }

    // MARK: - Lifecycle

    /// At launch: load the queue, bring the observer and background delivery in line with the switch, read, and re-decide held workouts.
    public func start() async {
        guard ensureLoaded() else { return }
        log.log(.init(.started, counts: ["queued": state.items.count, "inFlight": state.inFlight?.activities.count ?? 0]))
        await syncObservation()
        await readNow()
    }

    /// Requests READ authorization (workouts, distance, route presence). The state says only that it was requested: iOS never reveals a denial.
    public func requestAuthorization() async throws {
        guard ensureLoaded() else { throw HealthReadError.protectedDataUnavailable }
        try await reader.requestReadAuthorization()
        var s = state; s.authorizationRequested = true
        try commit(s)
        log.log(.init(.authorizationRequested))
        await syncObservation()
        await readNow()
    }

    /// The athlete's switch inside RepMile (the only revocation B can observe). Off: the observer stops and background delivery is disabled
    /// (also when the switch is turned off while they are being registered, QRE-B P3-3); nothing is read or sent. The data stays until `purge`.
    public func setEnabled(_ on: Bool) async throws {
        guard ensureLoaded() else { throw HealthReadError.protectedDataUnavailable }
        var s = state; s.enabled = on
        try commit(s)
        log.log(.init(.enabledChanged, code: on ? "ON" : "OFF"))
        await syncObservation()
        if on { await readNow() }
    }

    /// `UIApplication.protectedDataDidBecomeAvailableNotification` (wired by the app): resume reading and sending, nothing lost.
    public func protectedDataDidBecomeAvailable() async {
        healthLocked = false
        log.log(.init(.protectedDataAvailable))
        if !loaded { await start() } else { await readNow() }
    }

    // MARK: - Reading

    /// One anchored read (observer notification, launch, a trigger). The anchor is written only together with what the read queued.
    public func readNow() async {
        await read(waitForRunningRead: false)
        await pump()
    }

    /// Reads until no read is pending. A caller arriving during a read either asks for one more read and returns at once (A's signals and
    /// triggers: never wait, since the running read may itself be awaiting A, QRE-B-R2-01), or, for the observer only, returns once that
    /// read and the one it asked for are durable (its completion handler must not run earlier, QRE-B-08).
    func read(waitForRunningRead: Bool) async {
        guard !dead else { return }
        // Contract §6.2 "tenta no próximo gatilho": every trigger retries a host that was unavailable and B's own failed writes (QRE-B-04).
        hostUnavailable = false
        guard retryPendingWrites() else { return }
        if reading {
            readAgain = true
            if waitForRunningRead { await withCheckedContinuation { readWaiters.append($0) } }
            return
        }
        reading = true
        repeat { readAgain = false; await readOnce() } while readAgain && !dead
        reading = false
        let waiters = readWaiters; readWaiters = []
        for w in waiters { w.resume() }
    }

    /// A pending purge or a failed write is written again before anything else happens. False while it still cannot be written.
    func retryPendingWrites() -> Bool {
        guard loaded, purgePending != nil || writeFailed else { return true }
        do {
            try commit(state)
            if let r = purgePending { log.log(.init(.purged, code: r.rawValue)) }
            purgePending = nil; writeFailed = false
            return true
        } catch { return false }
    }

    func readOnce() async {
        guard ensureLoaded(), state.enabled, !storeUnreadable, purgePending == nil else { return }
        let gen = state.generation
        let ctxResult = await sink.ingestContext()
        guard gen == state.generation, !dead else { return }
        guard case .ready(let ctx) = ctxResult else {
            if case .unavailable(let code) = ctxResult { contextUnavailableCode = code }
            return
        }
        contextUnavailableCode = nil
        let anchor = state.anchorStartDay == ctx.recordStartDay ? state.anchor : nil
        do {
            let from = Self.startOfDay(ctx.recordStartDay, offsetMinutes: ctx.timezoneOffsetMinutes)
            let batch = try await reader.readWorkouts(anchor: anchor, startingAt: from)
            guard gen == state.generation, !dead else { log.log(.init(.readCompleted, code: "DISCARDED_AFTER_PURGE")); return }
            // Policy-1 migration: the workouts once excluded as THIRD_PARTY_SOURCE are behind the anchor. One full read, filtered to exactly
            // those ids, brings them back; the anchored read above still carries every deletion. (No anchor: the read above was full.)
            var rescanned: [WorkoutSnapshot] = []
            if anchor != nil, !state.rescanIds.isEmpty {
                let full = try await reader.readWorkouts(anchor: nil, startingAt: from)
                guard gen == state.generation, !dead else { log.log(.init(.readCompleted, code: "DISCARDED_AFTER_PURGE")); return }
                let want = Set(state.rescanIds)
                rescanned = full.added.filter { want.contains($0.id) }
            }
            healthLocked = false
            var s = state
            var counts = merge(batch, into: &s)
            if !s.rescanIds.isEmpty {
                let deleted = Set(batch.deletedIds)
                let again = merge(WorkoutReadBatch(added: rescanned.filter { !deleted.contains($0.id) }, deletedIds: [], anchor: batch.anchor), into: &s)
                for (k, v) in again { counts[k, default: 0] += v }
                counts["rescanned"] = rescanned.count
                s.rescanIds = []
            }
            s.anchor = batch.anchor; s.anchorStartDay = ctx.recordStartDay
            s.lastReadAt = clock(); s.lastReadError = nil; s.initialImportDone = true
            if counts["added", default: 0] > 0 { s.lastWorkoutReceivedAt = s.lastReadAt }
            try commit(s)
            let c = Self.sameRunCounts(state)
            if c.consolidated > 0 { counts["consolidated"] = c.consolidated }
            if c.reconcile > 0 { counts["reconcile"] = c.reconcile }
            log.log(.init(.readCompleted, counts: counts))
        } catch let e as HealthReadError {
            if e == .protectedDataUnavailable { healthLocked = true; log.log(.init(.protectedDataUnavailable)) }
            noteReadError(e.code)
        } catch is QueueStoreError {
            noteReadError("QUEUE_WRITE_FAILED")
        } catch {
            noteReadError("READ_FAILED")
        }
    }

    func noteReadError(_ code: String) {
        log.log(.init(.readFailed, code: code))
        var s = state; s.lastReadError = code
        // Status only: when even this write fails, the status still says so (it is written with the next commit).
        do { try commit(s) } catch { state.lastReadError = code }
    }

    // MARK: - Delivering

    func drain() async {
        while !dead, ensureLoaded(), !storeUnreadable, purgePending == nil, !writeFailed, state.enabled, state.block == nil, !hostUnavailable {
            if let at = state.nextRetryAt, at > clock() { scheduleRetry(at: at); return }
            let gen = state.generation
            let flight: InFlight
            if let f = state.inFlight { flight = f } else {
                guard let built = await buildDelivery(gen) else { return }
                flight = built
            }
            guard let delivery = try? DeviceDelivery(deliveryId: flight.deliveryId, activities: flight.activities) else {
                // Unreachable by construction (ids are HealthKit UUIDs, 1…32 distinct items); fail closed, never loop.
                log.log(.init(.adapterBug, code: "INVALID_DELIVERY", deliveryId: flight.deliveryId))
                var s = state; s.inFlight = nil; s.block = .halted(code: "INVALID_DELIVERY"); try? commit(s); return
            }
            log.log(.init(.deliverySent, counts: ["activities": flight.activities.count], deliveryId: flight.deliveryId))
            let epoch = conditionsEpoch
            let result = await sink.deliver(delivery)
            if dieAfterDeliverBeforeApply { dead = true; return }
            guard gen == state.generation, state.inFlight?.deliveryId == flight.deliveryId else {
                log.log(.init(.deliveryDiscardedAfterPurge, deliveryId: flight.deliveryId)); return
            }
            apply(result, to: flight, signalledSince: epoch != conditionsEpoch)
        }
    }

    /// Picks the next chunk (≤ 32, ascending end date), decides dedupe and links for workouts never sent, freezes the bytes and writes the
    /// in-flight delivery durably BEFORE sending it.
    func buildDelivery(_ gen: Int) async -> InFlight? {
        let ctxResult = await sink.ingestContext()
        guard gen == state.generation, !dead, state.inFlight == nil else { return nil }
        guard case .ready(let ctx) = ctxResult else {
            if case .unavailable(let code) = ctxResult { contextUnavailableCode = code }
            return nil
        }
        contextUnavailableCode = nil
        // Dedupe against the iPhone's own recordings, for every workout never sent (held ones are re-decided here: the index never notifies).
        // The same-run groups first (`SameRunRule`): only the run a group delivers is a candidate.
        let grouped = Self.regrouped(state)
        let open = grouped.items.filter { !$0.frozen && Self.isOpen($0.state) }.sorted(by: Self.byEnd)
        var decisions: [String: RecordingDedupe.Decision] = [:]
        var partialOverlap = Set<String>()
        var copySets: [String: Set<String>] = [:]
        for item in open {
            copySets[item.activityId] = Set(grouped.items.filter { $0.state == .sameRunAs(activityId: item.activityId) }.map(\.activityId))
            let interval = DateInterval(start: item.start, end: max(item.start, item.end))
            let recs = await recordings?.recordings(overlapping: interval) ?? []
            var d = RecordingDedupe.decision(workout: interval, recordings: recs)
            // QRE-B-O1-01: the app recording is matched against the whole physical run, not only the copy chosen to deliver it. If any
            // copy consolidated into this one is the same run as an app recording, that decision is the group's (in id order).
            if d == .deliverByNormalRule {
                let copies = grouped.items.filter { $0.state == .sameRunAs(activityId: item.activityId) }.sorted { $0.activityId < $1.activityId }
                for m in copies {
                    let mi = DateInterval(start: m.start, end: max(m.start, m.end))
                    let md = RecordingDedupe.decision(workout: mi, recordings: await recordings?.recordings(overlapping: mi) ?? [])
                    if md != .deliverByNormalRule { d = md; break }
                }
            }
            decisions[item.activityId] = d
            // FND-ABC-06 (b): a REPORTED app recording that overlaps the workout below the same-run threshold. Both go on record (the
            // dedupe rule says "a different run"); B counts it so the possible double count is visible (decision: Core + SSCTR + B).
            if recs.contains(where: { $0.reportedEventId != nil && $0.interval.intersects(interval) && !RecordingDedupe.sameRun($0.interval, interval) }) {
                partialOverlap.insert(item.activityId)
            }
        }
        guard gen == state.generation, !dead, state.inFlight == nil else { return nil }

        var s = Self.regrouped(state)
        var chosen: [Int] = []
        let order = s.items.indices.filter { Self.isOpen(s.items[$0].state) }.sorted { Self.byEnd(s.items[$0], s.items[$1]) }
        for i in order {
            if s.items[i].frozen {
                if s.items[i].state == .pending, chosen.count < chunkLimit { chosen.append(i) }
                continue
            }
            // A workout that arrived after the dedupe queries waits for the next round (never decided without the index).
            guard let d = decisions[s.items[i].activityId] else { continue }
            // QRE-B-O1-10: a copy joined (or left) this run while the index was awaited; the decision above did not see it. Decide again.
            let nowCopies = Set(s.items.filter { $0.state == .sameRunAs(activityId: s.items[i].activityId) }.map(\.activityId))
            guard nowCopies == copySets[s.items[i].activityId] else { decisions[s.items[i].activityId] = nil; pumpAgain = true; continue }
            let measured = s.items[i].activity.actual.distanceKm != nil
            switch d {
            case .holdUntilRecordingSettles(let rid):
                s.items[i].state = .held(recordingId: rid)
                continue
            case .setAside(let code):
                setAsideForAppRecording(&s, i, code: code, measured: measured)
                continue
            case .deliverLinked(let sid):
                guard ctx.runSessions.contains(where: { $0.sessionId == sid }), !Self.linkTaken(sid, in: s) else {
                    // The app recording's report already counts this run on that session: linking elsewhere or sending it unlinked would make
                    // two runs of one. Set aside and counted (SSCTR-ABC-S4).
                    setAsideForAppRecording(&s, i, code: RecordingDedupe.overlapsAppRecording, measured: measured)
                    continue
                }
                s.items[i].state = .pending
                guard chosen.count < chunkLimit else { continue }
                s.items[i].activity.sessionId = sid
            case .deliverByNormalRule:
                s.items[i].state = .pending
                guard chosen.count < chunkLimit else { continue }
                s.items[i].activity.sessionId = Self.normalLink(s.items[i], ctx: ctx, in: s)
                if partialOverlap.contains(s.items[i].activityId) { s.counters[IngestCode.partialOverlapWithReportedAppRecording, default: 0] += 1 }
            }
            s.items[i].frozen = true
            chosen.append(i)
        }
        guard !chosen.isEmpty else {
            if s != state { try? commit(s) }
            // QRE-B-O1-06: this write may have made a copy the run of its group (its chosen copy was set aside or held); it was never
            // decided in this round, so decide it now rather than at the next trigger.
            if state.items.contains(where: { !$0.frozen && $0.state == .pending && decisions[$0.activityId] == nil }) { pumpAgain = true }
            return nil
        }
        chosen.sort { Self.byEnd(s.items[$0], s.items[$1]) }
        let flight = InFlight(deliveryId: UUID().uuidString, activities: chosen.map { s.items[$0].activity }, generation: s.generation)
        s.inFlight = flight
        do { try commit(s) } catch { return nil }
        return flight
    }

    private func setAsideForAppRecording(_ s: inout QueueState, _ i: Int, code: String, measured: Bool) {
        s.items[i].state = .setAside(code: code)
        if measured { s.counters[IngestCode.measuredDistanceLostToAppRecording, default: 0] += 1 }
    }

    // MARK: - DeviceQueueControl (A → B)

    public func deliveryConditionsChanged() async {
        guard !dead, ensureLoaded(), !storeUnreadable else { return }
        conditionsEpoch += 1
        var s = state
        s.block = nil
        for i in s.items.indices { if case .notRecorded = s.items[i].state { s.items[i].attempts += 1; s.items[i].state = .pending } }
        hostUnavailable = false
        // A signal is never lost to a failed write (QRE-B-04): memory takes it now; the write is retried on the next trigger.
        do { try commit(s) } catch { state = s; writeFailed = true }
        log.log(.init(.conditionsChanged))
        await readNow()
    }

    public func purge(_ reason: QueuePurgeReason) async throws {
        // QRE-B-01: the athlete's switch and the authorization bookkeeping survive a purge, so the file is read first. A file that exists
        // but cannot be read now (before the first unlock) is NOT treated as absent: A retries the purge. (Never loaded: nothing of it is
        // in flight in this process.)
        if !loaded && !storeUnreadable && !ensureLoaded() && !storeUnreadable { throw HealthReadError.protectedDataUnavailable }
        // The generation advances before anything is written, so an answer to a delivery started before this purge is discarded whatever
        // happens next.
        state.generation += 1
        state.inFlight = nil
        var s = QueueState()
        s.generation = state.generation
        if storeUnreadable {
            // The switch is unknown: off, never on by default (the athlete turns it on again; `disabledInApp` says so). No `remove()`: the
            // atomic write below replaces the file, so a crash in between never leaves "no file" (= switch on) behind (QRE-B-R2-02 c).
            s.enabled = false
        } else {
            s.enabled = state.enabled; s.authorizationRequested = state.authorizationRequested
        }
        // QRE-B-05: fail closed. Memory holds the purged state whatever the write does, so nothing purged can be read, linked or sent; a
        // failed write stays pending and is retried on every trigger before anything else.
        state = s; loaded = true; storeUnreadable = false
        chunkLimit = DeliveryLimits.activitiesPerDelivery; hostUnavailable = false; contextUnavailableCode = nil; lastRetryCode = nil
        purgePending = reason
        do { try commit(s) } catch { log.log(.init(.purged, code: "WRITE_PENDING")); throw error }
        purgePending = nil; writeFailed = false
        log.log(.init(.purged, code: reason.rawValue))
    }

    // MARK: - HealthIngestStatusSource (B → C)

    public func status() async -> HealthIngestStatus {
        guard ensureLoaded(), !storeUnreadable else {
            return HealthIngestStatus(authorization: .notRequested, disabledInApp: false, lastReadAt: nil, lastWorkoutReceivedAt: nil,
                                      initialImportInProgress: false, lastReadError: storeUnreadable ? "QUEUE_UNREADABLE" : IngestCode.protectedDataUnavailable,
                                      queued: 0, waitingReason: storeUnreadable ? "QUEUE_UNREADABLE" : IngestCode.protectedDataUnavailable, setAside: 0, receivedTypes: [])
        }
        let setAside = state.items.filter { if case .setAside = $0.state { return true }; return false }.count
        // A consolidated workout is done (its run is the other one); one awaiting reconciliation is still queued, never "imported".
        let same = Self.sameRunCounts(state)
        let queued = state.items.count - setAside - same.consolidated
        let waiting = (purgePending != nil || writeFailed ? "QUEUE_WRITE_FAILED" : nil) ?? state.block?.code
            ?? (hostUnavailable ? HostCode.hostUnavailable : nil) ?? contextUnavailableCode
            ?? (state.nextRetryAt != nil ? lastRetryCode : nil)
            ?? (same.reconcile > 0 && same.reconcile == queued ? IngestCode.awaitingReconciliation : nil)
        return HealthIngestStatus(authorization: state.authorizationRequested ? .requested : .notRequested, disabledInApp: !state.enabled,
                                  lastReadAt: state.lastReadAt, lastWorkoutReceivedAt: state.lastWorkoutReceivedAt,
                                  initialImportInProgress: reading && !state.initialImportDone,
                                  lastReadError: state.lastReadError ?? (healthLocked ? IngestCode.protectedDataUnavailable : nil),
                                  queued: queued, waitingReason: waiting, setAside: setAside, receivedTypes: state.receivedTypes)
    }

    /// Every run B read from Apple Health since `since` (by end), with its provenance and where it stands (local adapter for C, CCP-B-05).
    /// Values are what HealthKit stated; nothing missing is filled in.
    public func importedRuns(since: Date) async -> [ImportedRunRecord] {
        guard ensureLoaded(), !storeUnreadable else { return [] }
        var out: [ImportedRunRecord] = []
        func record(_ id: String, _ start: Date, _ end: Date, _ p: RunProvenance?, _ a: DeviceActivity?, _ status: ImportedRunStatus, code: String? = nil,
                    sameRunAs: String? = nil, group: String? = nil, minutes: Double? = nil, sessionId: String? = nil) -> ImportedRunRecord {
            ImportedRunRecord(id: id, start: start, end: end, origin: p?.origin ?? .unknown, sourceName: p?.sourceName, status: status, statusCode: code,
                              sameRunAs: sameRunAs, reconciliationGroup: group, minutes: a?.actual.minutes ?? minutes, distanceKm: a?.actual.distanceKm,
                              hasRoute: p?.hasRoute ?? false, completeness: a?.sourceQuality, sessionId: sessionId)
        }
        for it in state.items where it.end >= since {
            let sid = it.frozen ? it.activity.sessionId : nil
            switch it.state {
            case .pending, .held: out.append(record(it.activityId, it.start, it.end, it.provenance, it.activity, .awaitingDelivery, sessionId: sid))
            case .notRecorded(let r): out.append(record(it.activityId, it.start, it.end, it.provenance, it.activity, .awaitingDelivery, code: r, sessionId: sid))
            case .setAside(let c): out.append(record(it.activityId, it.start, it.end, it.provenance, it.activity, .setAside, code: c, sessionId: sid))
            case .sameRunAs(let r): out.append(record(it.activityId, it.start, it.end, it.provenance, it.activity, .consolidatedDuplicate,
                                                      code: IngestCode.consolidatedSameRun, sameRunAs: r))
            case .reconcile(let c, let g): out.append(record(it.activityId, it.start, it.end, it.provenance, it.activity, .awaitingReconciliation, code: c, group: g))
            }
        }
        for (id, e) in state.ledger where e.end >= since {
            let start = e.start ?? e.activity.actual.minutes.map { e.end.addingTimeInterval(-$0 * 60) } ?? e.end
            out.append(record(id, start, e.end, e.provenance, e.activity, .counted, code: e.outcome, sessionId: e.sessionId))
        }
        for r in state.enteredRuns where r.end >= since {
            out.append(record(r.id, r.start, r.end, r.provenance, nil, .notForEngine, code: IngestCode.userEntered,
                              minutes: WorkoutNormalizer.minutes(r.durationSeconds)))
        }
        return out.sorted { ($0.start, $0.id) < ($1.start, $1.id) }
    }

    public func importedNonRunWorkouts(since: Date) async -> [ImportedWorkoutSummary] {
        guard ensureLoaded(), !storeUnreadable else { return [] }
        return state.summaries.filter { $0.end >= since }.sorted { ($0.start, $0.id) < ($1.start, $1.id) }.map(\.shared)
    }

    public func counts() async -> IngestCounts {
        _ = ensureLoaded()
        var setAside: [String: Int] = [:], reconcile: [String: Int] = [:], pending = 0, notRecorded = 0, held = 0, consolidated = 0
        for i in state.items {
            switch i.state {
            case .pending: pending += 1
            case .notRecorded: notRecorded += 1
            case .held: held += 1
            case .setAside(let c): setAside[c, default: 0] += 1
            case .sameRunAs: consolidated += 1
            case .reconcile(let c, _): reconcile[c, default: 0] += 1
            }
        }
        var excluded: [String: Int] = [:]
        for r in state.excluded.values { excluded[r, default: 0] += 1 }
        return IngestCounts(pending: pending, notRecorded: notRecorded, held: held, inFlight: state.inFlight?.activities.count ?? 0,
                            setAside: setAside, delivered: state.ledger.count, excluded: excluded, counters: state.counters,
                            consolidated: consolidated, reconcile: reconcile)
    }

    // MARK: - Persistence

    func ensureLoaded() -> Bool {
        if loaded { return true }
        if storeUnreadable { return false }
        do {
            if let d = try store.load() {
                guard var s = try? JSONDecoder().decode(QueueState.self, from: d), s.schema == QueueState.schema else {
                    storeUnreadable = true; log.log(.init(.readFailed, code: "QUEUE_UNREADABLE")); return false
                }
                if s.selectionPolicy < QueueState.currentSelectionPolicy {
                    // OPEN-1 policy 1 → 2: a run once excluded only for its source is read again (it may now be delivered). Written with the
                    // next commit; until then the migration is simply done again at the next load (idempotent).
                    let ids = s.excluded.filter { $0.value == IngestCode.thirdPartySource }.map(\.key)
                    for id in ids { s.excluded.removeValue(forKey: id) }
                    s.rescanIds = Array(Set(s.rescanIds).union(ids)).sorted()
                    s.selectionPolicy = QueueState.currentSelectionPolicy
                    log.log(.init(.policyMigrated, counts: ["rescan": ids.count]))
                }
                state = s
            } else { state = QueueState() }
            loaded = true
            return true
        } catch {
            // The file exists but cannot be read (before the first unlock): nothing is read, written or sent until it can be.
            log.log(.init(.protectedDataUnavailable, code: "QUEUE_FILE"))
            return false
        }
    }

    func commit(_ s: QueueState) throws {
        var s = s
        Self.regroup(&s)
        let e = JSONEncoder(); e.outputFormatting = [.sortedKeys]
        try store.save(try e.encode(s))
        state = s
    }

    /// The plan-local midnight of `day` (`YYYY-MM-DD`): the start of the read window (the anchor starts at the enrolment day).
    static func startOfDay(_ day: String, offsetMinutes: Int) -> Date {
        let p = day.split(separator: "-").compactMap { Int($0) }
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(secondsFromGMT: offsetMinutes * 60) ?? TimeZone(secondsFromGMT: 0)!
        guard p.count == 3, let d = cal.date(from: DateComponents(year: p[0], month: p[1], day: p[2])) else { return Date(timeIntervalSince1970: 0) }
        return d
    }
}
