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
    /// Workouts never queued, by reason (USER_ENTERED, THIRD_PARTY_SOURCE, STRENGTH_NOT_DEVICE_CHANNEL, NON_RUN_WORKOUT).
    public let excluded: [String: Int]
    /// G-5 deletions, measured distance lost to an app recording.
    public let counters: [String: Int]
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
        /// OPEN-1 policy (default: Apple sources only). Overridden only by the Simulator lab tests for the lab's own bundle id.
        public var isDeviceSource: @Sendable (String) -> Bool = { WorkoutNormalizer.isAppleSource($0) }
        public init() {}
    }

    private let reader: HealthReading
    private let sink: DeviceActivitySink
    private let recordings: AppRecordingIndex?
    private let store: QueueStore
    private let log: IngestLogSink
    private let clock: @Sendable () -> Date
    private let scheduler: RetryScheduler
    private let config: Configuration

    private var state = QueueState()
    private var loaded = false
    /// The queue file could not be decoded: fail closed, never overwritten; only `purge` clears it.
    private var storeUnreadable = false
    /// HealthKit answered `errorDatabaseInaccessible` (device locked): reads wait for `protectedDataDidBecomeAvailable`.
    private var healthLocked = false
    private var hostUnavailable = false
    /// QRE-B-04: B could not write an answer or a signal. Nothing is sent until a write succeeds again (retried on every trigger).
    private var writeFailed = false
    /// QRE-B-05: a purge whose durable write failed. Memory already holds the purged state; nothing is read or sent, and every trigger
    /// retries the write, until it is on disk.
    private var purgePending: QueuePurgeReason?
    /// QRE-B-03: advanced by every `deliveryConditionsChanged()`. The answer to a delivery sent before the latest signal cannot park the
    /// queue (that signal may be exactly what the answer was waiting for).
    private var conditionsEpoch = 0
    private var contextUnavailableCode: String?
    private var lastRetryCode: String?
    private var chunkLimit = DeliveryLimits.activitiesPerDelivery
    private var pumping = false, pumpAgain = false
    private var reading = false, readAgain = false
    private var observing = false
    private var retryScheduled = false

    /// Test hook: the process "dies" after the host answered a delivery and before B wrote the answer (handoff §7 item 5).
    var dieAfterDeliverBeforeApply = false
    private(set) var dead = false

    public init(reader: HealthReading, sink: DeviceActivitySink, recordings: AppRecordingIndex?, store: QueueStore,
                log: IngestLogSink = OSIngestLog(), clock: @escaping @Sendable () -> Date = { Date() },
                scheduler: RetryScheduler = TaskRetryScheduler(), configuration: Configuration = Configuration()) {
        self.reader = reader; self.sink = sink; self.recordings = recordings; self.store = store; self.log = log
        self.clock = clock; self.scheduler = scheduler; self.config = configuration
    }

    // MARK: - Lifecycle

    /// At launch: load the queue, register the observer and background delivery (if enabled), read, and re-decide held workouts.
    public func start() async {
        guard ensureLoaded() else { return }
        log.log(.init(.started, counts: ["queued": state.items.count, "inFlight": state.inFlight?.activities.count ?? 0]))
        if state.enabled { await startObserving() }
        await readNow()
    }

    /// Requests READ authorization (workouts, distance, route presence). The state says only that it was requested: iOS never reveals a denial.
    public func requestAuthorization() async throws {
        guard ensureLoaded() else { throw HealthReadError.protectedDataUnavailable }
        try await reader.requestReadAuthorization()
        var s = state; s.authorizationRequested = true
        try commit(s)
        log.log(.init(.authorizationRequested))
        if state.enabled { await startObserving() }
        await readNow()
    }

    /// The athlete's switch inside RepMile (the only revocation B can observe). Off: the observer stops and background delivery is disabled;
    /// nothing is read or sent. The data stays until `purge`.
    public func setEnabled(_ on: Bool) async throws {
        guard ensureLoaded() else { throw HealthReadError.protectedDataUnavailable }
        var s = state; s.enabled = on
        try commit(s)
        log.log(.init(.enabledChanged, code: on ? "ON" : "OFF"))
        if on {
            await startObserving()
            await readNow()
        } else {
            await reader.stopObserving(); observing = false
            try? await reader.setBackgroundDelivery(false)
        }
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
    private func read(waitForRunningRead: Bool) async {
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
    private var readWaiters: [CheckedContinuation<Void, Never>] = []

    /// A pending purge or a failed write is written again before anything else happens. False while it still cannot be written.
    private func retryPendingWrites() -> Bool {
        guard loaded, purgePending != nil || writeFailed else { return true }
        do {
            try commit(state)
            if let r = purgePending { log.log(.init(.purged, code: r.rawValue)) }
            purgePending = nil; writeFailed = false
            return true
        } catch { return false }
    }

    private func readOnce() async {
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
            let batch = try await reader.readWorkouts(anchor: anchor, startingAt: Self.startOfDay(ctx.recordStartDay, offsetMinutes: ctx.timezoneOffsetMinutes))
            guard gen == state.generation, !dead else { log.log(.init(.readCompleted, code: "DISCARDED_AFTER_PURGE")); return }
            healthLocked = false
            var s = state
            let counts = merge(batch, into: &s)
            s.anchor = batch.anchor; s.anchorStartDay = ctx.recordStartDay
            s.lastReadAt = clock(); s.lastReadError = nil; s.initialImportDone = true
            if counts["added", default: 0] > 0 { s.lastWorkoutReceivedAt = s.lastReadAt }
            try commit(s)
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

    private func noteReadError(_ code: String) {
        log.log(.init(.readFailed, code: code))
        var s = state; s.lastReadError = code
        try? commit(s)
    }

    /// Adds what the read returned. A workout B already knows (queued, delivered, excluded, summarized) is not added twice.
    private func merge(_ batch: WorkoutReadBatch, into s: inout QueueState) -> [String: Int] {
        var counts: [String: Int] = [:]
        let flying = Set(s.inFlight?.activities.map(\.activityId) ?? [])
        for id in batch.deletedIds {
            if let i = s.items.firstIndex(where: { $0.activityId == id }) {
                if flying.contains(id) { s.items[i].deletedWhileInFlight = true }
                else { s.items.remove(at: i); s.counters[IngestCode.deletedBeforeDelivery, default: 0] += 1 }
            } else if s.ledger[id] != nil {
                // G-5: nothing is sent in V1; the session link stays (one workout per session prevents a second link).
                s.counters[IngestCode.deletedAfterDelivery, default: 0] += 1
            }
            s.summaries.removeAll { $0.id == id }
            s.excluded.removeValue(forKey: id)
            counts["deleted", default: 0] += 1
        }
        let known = Set(s.items.map(\.activityId)).union(s.ledger.keys).union(s.excluded.keys)
        var types = Set(s.receivedTypes)
        for w in batch.added.sorted(by: { ($0.end, $0.id) < ($1.end, $1.id) }) where !known.contains(w.id) {
            switch WorkoutNormalizer.select(w, isDeviceSource: config.isDeviceSource) {
            case .device:
                let a = WorkoutNormalizer.activity(w)
                s.items.append(QueueItem(activityId: w.id, start: w.start, end: w.end, activity: a))
                types.insert("RUN_WORKOUT")
                if a.actual.distanceKm != nil { types.insert("DISTANCE") }
                if w.hasRoute { types.insert("ROUTE_PRESENCE") }
                counts["added", default: 0] += 1
            case .excludedRun(let reason):
                s.excluded[w.id] = reason
                counts[reason, default: 0] += 1
            case .nonRun(let reason):
                s.excluded[w.id] = reason
                s.summaries.append(StoredSummary(WorkoutNormalizer.summary(w)))
                types.insert("NON_RUN_WORKOUT")
                counts[reason, default: 0] += 1
            }
        }
        s.receivedTypes = types.sorted()
        return counts
    }

    // MARK: - Delivering

    func pump() async {
        if pumping { pumpAgain = true; return }
        pumping = true
        repeat { pumpAgain = false; await drain() } while pumpAgain && !dead
        pumping = false
    }

    private func drain() async {
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
    private func buildDelivery(_ gen: Int) async -> InFlight? {
        let ctxResult = await sink.ingestContext()
        guard gen == state.generation, !dead, state.inFlight == nil else { return nil }
        guard case .ready(let ctx) = ctxResult else {
            if case .unavailable(let code) = ctxResult { contextUnavailableCode = code }
            return nil
        }
        contextUnavailableCode = nil
        // Dedupe against the iPhone's own recordings, for every workout never sent (held ones are re-decided here: the index never notifies).
        let open = state.items.filter { !$0.frozen && Self.isOpen($0.state) }.sorted(by: Self.byEnd)
        var decisions: [String: RecordingDedupe.Decision] = [:]
        var partialOverlap = Set<String>()
        for item in open {
            let interval = DateInterval(start: item.start, end: max(item.start, item.end))
            let recs = await recordings?.recordings(overlapping: interval) ?? []
            decisions[item.activityId] = RecordingDedupe.decision(workout: interval, recordings: recs)
            // FND-ABC-06 (b): a REPORTED app recording that overlaps the workout below the same-run threshold. Both go on record (the
            // dedupe rule says "a different run"); B counts it so the possible double count is visible (decision: Core + SSCTR + B).
            if recs.contains(where: { $0.reportedEventId != nil && $0.interval.intersects(interval) && !RecordingDedupe.sameRun($0.interval, interval) }) {
                partialOverlap.insert(item.activityId)
            }
        }
        guard gen == state.generation, !dead, state.inFlight == nil else { return nil }

        var s = state
        var chosen: [Int] = []
        let order = s.items.indices.filter { Self.isOpen(s.items[$0].state) }.sorted { Self.byEnd(s.items[$0], s.items[$1]) }
        for i in order {
            if s.items[i].frozen {
                if s.items[i].state == .pending, chosen.count < chunkLimit { chosen.append(i) }
                continue
            }
            // A workout that arrived after the dedupe queries waits for the next round (never decided without the index).
            guard let d = decisions[s.items[i].activityId] else { continue }
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

    /// Contract §4.3: link only when the workout's plan-local day has exactly one RUN session, exactly one workout, and no workout was ever
    /// linked to that session. Session ids repeat across plans, so a session already linked (in any plan) stays unlinkable: never a guess.
    static func normalLink(_ item: QueueItem, ctx: IngestContext, in s: QueueState) -> String? {
        let day = BoundaryInstant.day(item.end, offsetMinutes: ctx.timezoneOffsetMinutes)
        let sessions = ctx.runSessions.filter { $0.day == day }
        guard sessions.count == 1 else { return nil }
        let onDay = s.items.filter { BoundaryInstant.day($0.end, offsetMinutes: ctx.timezoneOffsetMinutes) == day }.count
            + s.ledger.values.filter { BoundaryInstant.day($0.end, offsetMinutes: ctx.timezoneOffsetMinutes) == day }.count
        guard onDay == 1 else { return nil }
        let sid = sessions[0].sessionId
        return linkTaken(sid, in: s) ? nil : sid
    }

    static func linkTaken(_ sid: String, in s: QueueState) -> Bool {
        s.ledger.values.contains { $0.sessionId == sid } || s.items.contains { $0.frozen && $0.activity.sessionId == sid }
    }

    private static func isOpen(_ st: ItemState) -> Bool {
        switch st { case .pending, .held: return true; case .notRecorded, .setAside: return false }
    }
    private static func byEnd(_ a: QueueItem, _ b: QueueItem) -> Bool { (a.end, a.activityId) < (b.end, b.activityId) }

    /// Contract §6.2, every row.
    /// `signalledSince`: A called `deliveryConditionsChanged()` while this delivery was in flight (QRE-B-03). A waiting, halted or
    /// hostUnavailable answer then does not park the queue, and a NOT_RECORDED workout counts as already signalled: it is re-sent at once
    /// in a new delivery (attempt counted), never left for a signal that already came.
    private func apply(_ result: DeliveryResult, to flight: InFlight, signalledSince: Bool) {
        var s = state
        s.inFlight = nil
        let ids = flight.activities.map(\.activityId)
        func index(_ id: String) -> Int? { s.items.firstIndex { $0.activityId == id } }
        /// Nothing was recorded: a workout deleted in Apple Health while in flight now simply leaves the queue.
        func dropDeletedUnrecorded() {
            for id in ids { if let i = index(id), s.items[i].deletedWhileInFlight {
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
                                                         digest: WorkoutNormalizer.digest(a), end: s.items[i].end, activity: a)
                    if s.items[i].deletedWhileInFlight { s.counters[IngestCode.deletedAfterDelivery, default: 0] += 1 }
                    s.items.remove(at: i)
                case .notRecorded(let reason):
                    if s.items[i].deletedWhileInFlight {
                        s.items.remove(at: i); s.counters[IngestCode.deletedBeforeDelivery, default: 0] += 1
                    } else if s.items[i].attempts >= config.maxAttempts {
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
            s.retryLaterStreak = 0; s.nextRetryAt = nil
            let culprit = at.flatMap { $0 >= 0 && $0 < ids.count ? index(ids[$0]) : nil }
            switch disposition {
            case .setAsideItem where culprit != nil:
                s.items[culprit!].state = .setAside(code: c)
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
                    if s.items[i].adapterBugStrikes >= 2 { s.items[i].state = .setAside(code: c) }
                }
            }
            if s.inFlight == nil { dropDeletedUnrecorded() }
        case .waiting(let c):
            code = c; if !signalledSince { s.block = .waiting(code: c) }; dropDeletedUnrecorded()
        case .halted(let c):
            code = c; if !signalledSince { s.block = .halted(code: c) }; dropDeletedUnrecorded()
        case .retryLater(let c):
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
            writeFailed = true
        }
    }

    private func retryLater(_ s: inout QueueState, _ flight: InFlight, code: String) {
        s.retryLaterStreak += 1
        lastRetryCode = code
        if s.retryLaterStreak >= config.maxConsecutiveRetryLater {
            for a in flight.activities { if let i = s.items.firstIndex(where: { $0.activityId == a.activityId }) {
                s.items[i].state = .setAside(code: IngestCode.attemptsExhausted) } }
            s.inFlight = nil; s.retryLaterStreak = 0; s.nextRetryAt = nil; lastRetryCode = nil
            return
        }
        let delay = min(config.backoffCap, config.backoffBase * pow(2, Double(s.retryLaterStreak - 1)))
        s.nextRetryAt = clock().addingTimeInterval(delay)
    }

    private func scheduleRetry(at: Date) {
        guard !retryScheduled else { return }
        retryScheduled = true
        scheduler.schedule(after: at.timeIntervalSince(clock())) { [weak self] in await self?.retryFired() }
    }
    private func retryFired() async { retryScheduled = false; await pump() }

    private static func outcomeCounts(_ results: [ActivityResult]) -> [String: Int] {
        var c: [String: Int] = [:]
        for r in results {
            switch r.outcome { case .recorded: c["RECORDED", default: 0] += 1; case .duplicate: c["DUPLICATE", default: 0] += 1
            case .notRecorded(let why): c["NOT_RECORDED:" + why, default: 0] += 1 }
        }
        return c
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
        let waiting = (purgePending != nil || writeFailed ? "QUEUE_WRITE_FAILED" : nil) ?? state.block?.code
            ?? (hostUnavailable ? HostCode.hostUnavailable : nil) ?? contextUnavailableCode
            ?? (state.nextRetryAt != nil ? lastRetryCode : nil)
        return HealthIngestStatus(authorization: state.authorizationRequested ? .requested : .notRequested, disabledInApp: !state.enabled,
                                  lastReadAt: state.lastReadAt, lastWorkoutReceivedAt: state.lastWorkoutReceivedAt,
                                  initialImportInProgress: reading && !state.initialImportDone,
                                  lastReadError: state.lastReadError ?? (healthLocked ? IngestCode.protectedDataUnavailable : nil),
                                  queued: state.items.count - setAside, waitingReason: waiting, setAside: setAside, receivedTypes: state.receivedTypes)
    }

    public func importedNonRunWorkouts(since: Date) async -> [ImportedWorkoutSummary] {
        guard ensureLoaded(), !storeUnreadable else { return [] }
        return state.summaries.filter { $0.end >= since }.sorted { ($0.start, $0.id) < ($1.start, $1.id) }.map(\.shared)
    }

    public func counts() async -> IngestCounts {
        _ = ensureLoaded()
        var setAside: [String: Int] = [:], pending = 0, notRecorded = 0, held = 0
        for i in state.items {
            switch i.state {
            case .pending: pending += 1
            case .notRecorded: notRecorded += 1
            case .held: held += 1
            case .setAside(let c): setAside[c, default: 0] += 1
            }
        }
        var excluded: [String: Int] = [:]
        for r in state.excluded.values { excluded[r, default: 0] += 1 }
        return IngestCounts(pending: pending, notRecorded: notRecorded, held: held, inFlight: state.inFlight?.activities.count ?? 0,
                            setAside: setAside, delivered: state.ledger.count, excluded: excluded, counters: state.counters)
    }

    // MARK: - Persistence

    private func ensureLoaded() -> Bool {
        if loaded { return true }
        if storeUnreadable { return false }
        do {
            if let d = try store.load() {
                guard let s = try? JSONDecoder().decode(QueueState.self, from: d), s.schema == QueueState.schema else {
                    storeUnreadable = true; log.log(.init(.readFailed, code: "QUEUE_UNREADABLE")); return false
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

    private func commit(_ s: QueueState) throws {
        let e = JSONEncoder(); e.outputFormatting = [.sortedKeys]
        try store.save(try e.encode(s))
        state = s
    }

    private func startObserving() async {
        guard !observing else { return }
        do {
            try await reader.startObserving { [weak self] in
                guard let self else { return }
                await self.observerFired()
            }
            observing = true
        } catch let e as HealthReadError { noteReadError(e.code) } catch { noteReadError("OBSERVER_FAILED") }
        // Registration only: an observed background wake-up is a separate fact (BACKGROUND_DELIVERY_ON_DEVICE), never inferred from this.
        do { try await reader.setBackgroundDelivery(true); log.log(.init(.backgroundDelivery, code: "REGISTERED")) }
        catch let e as HealthReadError { log.log(.init(.backgroundDelivery, code: e.code)); noteReadError(e.code) }
        catch { log.log(.init(.backgroundDelivery, code: "BACKGROUND_DELIVERY_FAILED")); noteReadError("BACKGROUND_DELIVERY_FAILED") }
    }

    /// The observer's completion handler runs when this returns: after the read is durably queued, not after the delivery to A
    /// (background-delivery time budget, QRE-B-08). The delivery continues on its own.
    private func observerFired() async {
        log.log(.init(.observerFired))
        await read(waitForRunningRead: true)
        observerPump = Task { await self.pump() }
    }
    private var observerPump: Task<Void, Never>?
    /// Tests: waits for the delivery an observer notification started.
    func settled() async { while let t = observerPump { observerPump = nil; await t.value } }

    /// The plan-local midnight of `day` (`YYYY-MM-DD`): the start of the read window (the anchor starts at the enrolment day).
    static func startOfDay(_ day: String, offsetMinutes: Int) -> Date {
        let p = day.split(separator: "-").compactMap { Int($0) }
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(secondsFromGMT: offsetMinutes * 60) ?? TimeZone(secondsFromGMT: 0)!
        guard p.count == 3, let d = cal.date(from: DateComponents(year: p[0], month: p[1], day: p[2])) else { return Date(timeIntervalSince1970: 0) }
        return d
    }
}
