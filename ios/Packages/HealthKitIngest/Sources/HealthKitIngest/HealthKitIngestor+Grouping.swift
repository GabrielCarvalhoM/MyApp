import Foundation
import IntegrationContracts

// What B holds, and how the copies of one physical run are grouped (`SameRunRule`) and linked (contract §4.3). Moved out of
// `HealthKitIngestor.swift` unchanged, except where QRE-B P3-2 changed it (marked).

extension HealthKitIngestor {
    /// Adds what the read returned. A workout B already knows (queued, delivered, excluded, summarized) is not added twice.
    func merge(_ batch: WorkoutReadBatch, into s: inout QueueState) -> [String: Int] {
        var counts: [String: Int] = [:]
        let flying = Set(s.inFlight?.activities.map(\.activityId) ?? [])
        for id in batch.deletedIds {
            if let i = s.items.firstIndex(where: { $0.activityId == id }) {
                if flying.contains(id) { s.items[i].deletedWhileInFlight = true }
                else if s.items[i].mayBeOnRecord {
                    // P3-2: it may be on the record, so it stays the run of its group (its copies are never promoted); counted once.
                    if !s.items[i].deletedWhileInFlight { s.counters[IngestCode.deletedMaybeOnRecord, default: 0] += 1 }
                    s.items[i].deletedWhileInFlight = true
                    // #85: a deleted workout is never sent again: a round still to come, or one reopened and not yet sent, ends here.
                    s.items[i].resendDue = nil
                    if s.items[i].state == .pending { s.items[i].state = .setAside(code: IngestCode.attemptsExhausted) }
                }
                else { s.items.remove(at: i); s.counters[IngestCode.deletedBeforeDelivery, default: 0] += 1 }
            } else if s.ledger[id] != nil {
                // G-5: nothing is sent in V1; the session link stays (one workout per session prevents a second link).
                s.counters[IngestCode.deletedAfterDelivery, default: 0] += 1
            }
            s.summaries.removeAll { $0.id == id }
            s.enteredRuns.removeAll { $0.id == id }
            s.rescanIds.removeAll { $0 == id }
            s.excluded.removeValue(forKey: id)
            counts["deleted", default: 0] += 1
        }
        let known = Set(s.items.map(\.activityId)).union(s.ledger.keys).union(s.excluded.keys)
        var types = Set(s.receivedTypes)
        for w in batch.added.sorted(by: { ($0.end, $0.id) < ($1.end, $1.id) }) where !known.contains(w.id) {
            switch WorkoutNormalizer.select(w) {
            case .device:
                let a = WorkoutNormalizer.activity(w)
                s.items.append(QueueItem(activityId: w.id, start: w.start, end: w.end, activity: a, provenance: RunProvenance(w)))
                types.insert("RUN_WORKOUT")
                if a.actual.distanceKm != nil { types.insert("DISTANCE") }
                if w.hasRoute { types.insert("ROUTE_PRESENCE") }
                counts["added", default: 0] += 1
            case .excludedRun(let reason):
                s.excluded[w.id] = reason
                if reason == IngestCode.userEntered {
                    s.enteredRuns.append(StoredEnteredRun(id: w.id, start: w.start, end: w.end, durationSeconds: w.durationSeconds, provenance: RunProvenance(w)))
                }
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

    /// Contract §4.3: link only when the workout's plan-local day has exactly one RUN session, exactly one workout, and no workout was ever
    /// linked to that session. Session ids repeat across plans, so a session already linked (in any plan) stays unlinkable: never a guess.
    static func normalLink(_ item: QueueItem, ctx: IngestContext, in s: QueueState) -> String? {
        let day = BoundaryInstant.day(item.end, offsetMinutes: ctx.timezoneOffsetMinutes)
        let sessions = ctx.runSessions.filter { $0.day == day }
        guard sessions.count == 1 else { return nil }
        // A workout consolidated into another one is the same run, not a second candidate (`SameRunRule`).
        let onDay = s.items.filter { !Self.isConsolidated($0.state) && BoundaryInstant.day($0.end, offsetMinutes: ctx.timezoneOffsetMinutes) == day }.count
            + s.ledger.values.filter { BoundaryInstant.day($0.end, offsetMinutes: ctx.timezoneOffsetMinutes) == day }.count
        guard onDay == 1 else { return nil }
        let sid = sessions[0].sessionId
        return linkTaken(sid, in: s) ? nil : sid
    }

    static func linkTaken(_ sid: String, in s: QueueState) -> Bool {
        s.ledger.values.contains { $0.sessionId == sid } || s.items.contains { $0.frozen && $0.activity.sessionId == sid }
    }

    static func isOpen(_ st: ItemState) -> Bool {
        switch st { case .pending, .held: return true; case .notRecorded, .setAside, .sameRunAs, .reconcile: return false }
    }
    static func isConsolidated(_ st: ItemState) -> Bool { if case .sameRunAs = st { return true }; return false }

    /// `SameRunRule` over everything B holds: every queued workout (except set-aside ones that are certainly not on the record) and every
    /// delivered one. Applied on every write, so the decisions always follow the current facts (a deletion, a new copy, a delivery).
    static func regroup(_ s: inout QueueState) {
        var facts: [SameRunRule.Facts] = []
        var ids = Set<String>()
        for it in s.items {
            // A set-aside run that IS, or may be, on record stays the run of its group, so its copies are consolidated into it and never
            // promoted: the athlete's reported app recording already counts it (QRE-B-O1-01), or the answer that set it aside does not prove
            // it absent from the record (P3-2: `mayBeOnRecord`), or it is to be sent again (#85: `resendDue`, its copies wait for that
            // answer). Any other set-aside item is certainly not on record and leaves the groups.
            var keepsItsGroup = false
            if case .setAside(let c) = it.state {
                guard c == RecordingDedupe.overlapsAppRecording || it.mayBeOnRecord || it.resendDue != nil else { continue }
                keepsItsGroup = true
            }
            ids.insert(it.activityId)
            facts.append(.init(id: it.activityId, start: it.start, end: it.end, minutes: it.activity.actual.minutes, distanceKm: it.activity.actual.distanceKm,
                               quality: it.activity.sourceQuality, sourceBundleId: it.provenance?.sourceBundleId ?? "",
                               syncIdentifier: it.provenance?.syncIdentifier, syncVersion: it.provenance?.syncVersion, fixed: it.frozen || keepsItsGroup))
        }
        for (id, e) in s.ledger where !ids.contains(id) {
            let start = e.start ?? e.activity.actual.minutes.map { e.end.addingTimeInterval(-$0 * 60) } ?? e.end
            facts.append(.init(id: id, start: start, end: e.end, minutes: e.activity.actual.minutes, distanceKm: e.activity.actual.distanceKm,
                               quality: e.activity.sourceQuality, sourceBundleId: e.provenance?.sourceBundleId ?? "",
                               syncIdentifier: e.provenance?.syncIdentifier, syncVersion: e.provenance?.syncVersion, fixed: true))
        }
        let decisions = SameRunRule.decide(facts)
        for i in s.items.indices where !s.items[i].frozen {
            guard let d = decisions[s.items[i].activityId] else { continue }
            switch s.items[i].state { case .setAside, .notRecorded: continue; default: break }
            switch d {
            case .deliver:
                switch s.items[i].state { case .sameRunAs, .reconcile: s.items[i].state = .pending; default: break }
            case .duplicateOf(let r): s.items[i].state = .sameRunAs(activityId: r)
            case .reconcile(let c, let g): s.items[i].state = .reconcile(code: c, group: g)
            }
        }
    }
    static func regrouped(_ s: QueueState) -> QueueState { var c = s; regroup(&c); return c }
    static func sameRunCounts(_ s: QueueState) -> (consolidated: Int, reconcile: Int) {
        var c = 0, r = 0
        for i in s.items { switch i.state { case .sameRunAs: c += 1; case .reconcile: r += 1; default: break } }
        return (c, r)
    }
    static func byEnd(_ a: QueueItem, _ b: QueueItem) -> Bool { (a.end, a.activityId) < (b.end, b.activityId) }
}
