import Foundation
import IntegrationContracts
import CoachingPresentation

// MARK: - TimeInZoneClassifying

extension CoachingHost: TimeInZoneClassifying {
    /// The facade's `timeInZones` (the engine classifier over the current five-zone reading) behind the shared gate (`enabled:false` until
    /// SSCTR C10). Never a Swift zone table.
    public func timeInZones(_ series: HeartRateSeries) async -> TimeInZoneReading {
        let a: Answer = await onQueue {
            guard let s = try? JSONText.encode(series) else { return Self.hostFailure("INVALID_REQUEST", "series") }
            return self.perform("timeInZones", [("series", s), ("durationSeconds", String(series.durationSeconds))], clockRule: .read)
        }
        if let r = Self.decode(TimeInZoneReading.self, a.data) { return r }
        let reason = Self.boundaryError(a).code.raw
        return Self.decode(TimeInZoneReading.self, Data("{\"status\":\"UNAVAILABLE\",\"reason\":\(JSONText.string(reason)),\"fromAverageHeartRate\":false}".utf8))!
    }
}

// MARK: - DeviceActivitySink

extension CoachingHost: DeviceActivitySink {
    public func ingestContext() async -> IngestContextResult {
        let a: Answer = await onQueue { self.perform("ingestContext", clockRule: .read) }
        guard a.ok, let day = a.object["recordStartDay"] as? String, let tz = (a.object["timezoneOffsetMinutes"] as? NSNumber)?.intValue,
              let v = (a.object["version"] as? NSNumber)?.intValue, let runs = a.object["runSessions"] as? [[String: Any]] else {
            return .unavailable(code: a.code ?? HostCode.hostUnavailable)
        }
        return .ready(IngestContext(recordStartDay: day, timezoneOffsetMinutes: tz,
                                    runSessions: runs.compactMap { r in (r["sessionId"] as? String).flatMap { s in (r["day"] as? String).map { PlannedRunSession(sessionId: s, day: $0) } } },
                                    version: v))
    }

    /// Contract §4.1 item 1 and §6.1: `importActivities` with the authenticated actor, `clientRequestId = deliveryId` (`<deliveryId>~<n>` after a
    /// stale version or a reused id, at most 3), the current version; BUSY retried with the same id at most 3 times, then `retryLater`; D1 refuses
    /// before custody (`waiting`). Exactly one `DeliveryResult`; never throws.
    public func deliver(_ delivery: DeviceDelivery) async -> DeliveryResult {
        let r: (DeliveryResult, Bool) = await onQueue {
            guard let acts = try? JSONText.encode(delivery.activities) else { return (.refused(code: "INVALID_REQUEST", index: nil, disposition: .adapterBug), false) }
            var n = 0
            let saved = self.idSource
            self.idSource = { n += 1; return "\(delivery.deliveryId)~\(n)" }
            defer { self.idSource = saved }
            let a = self.perform("importActivities", [("activities", acts)], versioned: true, requestId: delivery.deliveryId, clockRule: .bounded)
            return (Self.deliveryResult(a), self.takeClockRecovery(a))
        }
        // CCP-B-04 rule 1 (#49 P3-4): this is B's call, pending on B's side. A never awaits B from inside it: the signal is sent from a new
        // task, as the purge below is.
        if r.1, let q = queueControl { Task { await q.deliveryConditionsChanged() } }
        // Code review R1 #5b: an erasure completed during this delivery owes B a purge (or an intent is still owed); it is sent outside B's
        // call (never re-entering it).
        if await onQueue({ self.purgeIsOwedOnQueue }) { Task { await self.settleOwedPurge(nil) } }
        return r.0
    }

    static func deliveryResult(_ a: Answer) -> DeliveryResult {
        if a.ok, let v = (a.object["version"] as? NSNumber)?.intValue {
            let items = (a.object["activities"] as? [[String: Any]] ?? []).compactMap { x -> ActivityResult? in
                guard let i = (x["index"] as? NSNumber)?.intValue, let id = x["activityId"] as? String, let o = x["outcome"] as? String else { return nil }
                let outcome: ActivityOutcome
                switch o {
                case "RECORDED": outcome = .recorded(eventId: x["eventId"] as? String ?? "")
                case "DUPLICATE": outcome = .duplicate
                default: outcome = .notRecorded(reason: x["reason"] as? String ?? o)
                }
                return ActivityResult(index: i, activityId: id, outcome: outcome)
            }
            return .answered(version: v, activities: items)
        }
        let e = a.object["error"] as? [String: Any], code = e?["code"] as? String ?? "OPERATIONAL_ERROR", index = (e?["index"] as? NSNumber)?.intValue
        if code == HostCode.clockAheadOfReference { return .waiting(code: code) }
        if code == "HOST_NOT_OPEN" || code == HostCode.hostUnavailable { return .hostUnavailable }
        switch BoundaryDisposition.of(code: code, index: index) {
        case .waiting: return .waiting(code: code)
        case .retryLater: return .retryLater(code: code)
        case .halted: return .halted(code: code)
        case let d: return .refused(code: code, index: index, disposition: d)
        }
    }
}
