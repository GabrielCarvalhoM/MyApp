import Foundation

// ABC foundation consolidation (2026-11-26), mission 6.1 / CHG-UI-5 / GAP-16: a run recorded by the iPhone itself, without a watch.
//
// Ownership: front C owns the recorder as a NON-VISUAL package, `ios/Packages/RunRecorder` (CoreLocation, the step timer, pause/resume,
// background location, the crash-safe temporary file, the route kept for sharing). Its screens only render it. Front B never records; front A
// never sees a coordinate.
//
// What reaches CoachingCore: only the athlete's own report of the session (ATHLETE channel: completed, minutes, rpe, response, a stop for a
// planned session), built by C's form from the recording's elapsed time. A distance, pace, split or route the iPhone MEASURED is never put in
// an athlete report (it would falsify authorship: GAP-16), and no coordinate ever crosses the bridge. Until the Founder + Security decide the
// HealthKit write-back (DR-121, OPEN-1 extension), the measured numbers stay on the device for the live screen, the summary ("medido pelo
// iPhone · não usado pelo plano") and sharing, and are erased with the account (G07).
//
// Double counting: a run recorded by RepMile AND found later in Apple Health (e.g. the same run on an Apple Watch) must count once. B consults
// this index before delivering any workout (`RecordingDedupe.decision`).

/// What the recorder keeps of one finished recording that other fronts may know: identity, interval, link, never coordinates.
public struct AppRecordedRunRef: Codable, Equatable, Sendable, Identifiable {
    /// A UUID the recorder assigns (and, if a write-back is ever approved, `HKMetadataKeyExternalUUID` of that workout).
    public let id: String
    /// The planned session the athlete ran (nil: an unplanned run).
    public let sessionId: String?
    public let start: Date
    public let end: Date
    /// Whether the athlete's report of this recording was accepted by the host (its event id), so B can link a matching watch workout to it.
    public let reportedEventId: String?
    public init(id: String, sessionId: String?, start: Date, end: Date, reportedEventId: String?) {
        self.id = id; self.sessionId = sessionId; self.start = start; self.end = end; self.reportedEventId = reportedEventId
    }
    public var interval: DateInterval { DateInterval(start: start, end: max(start, end)) }
}
/// Implemented by C's RunRecorder; consumed by B. Erased by the same account erasure as every other layer (G07).
public protocol AppRecordingIndex: AnyObject, Sendable {
    func recordings(overlapping interval: DateInterval) async -> [AppRecordedRunRef]
}

/// The one dedupe rule between an app recording and a HealthKit workout (provisional engineering rule, like OPEN-3; reviewed at integration by
/// SSCTR + Engineering; no sporting meaning).
public enum RecordingDedupe {
    /// Two intervals are the same run when their overlap covers at least half of the shorter one.
    public static let minimumOverlapOfShorter = 0.5
    public static func sameRun(_ a: DateInterval, _ b: DateInterval) -> Bool {
        guard let o = a.intersection(with: b) else { return false }
        let shorter = min(a.duration, b.duration)
        return shorter > 0 && o.duration / shorter >= minimumOverlapOfShorter
    }
    public enum Decision: Equatable, Sendable {
        /// No app recording overlaps: B links by the normal rule (contract §4.3).
        case deliverByNormalRule
        /// The app recording was a planned session the athlete reported: deliver the workout linked to THAT session, so the boundary keeps both
        /// voices on one row (O-1) and counts the run once.
        case deliverLinked(sessionId: String)
        /// The app recording was unplanned (or not yet reported): the workout is set aside with this code and counted (never delivered), so the
        /// unplanned athlete report and an unlinked device run never make two runs of one.
        case setAside(code: String)
    }
    public static let overlapsAppRecording = "OVERLAPS_APP_RECORDING"
    public static func decision(workout: DateInterval, recordings: [AppRecordedRunRef]) -> Decision {
        guard let r = recordings.filter({ sameRun($0.interval, workout) }).max(by: { ($0.interval.intersection(with: workout)?.duration ?? 0) < ($1.interval.intersection(with: workout)?.duration ?? 0) }) else {
            return .deliverByNormalRule
        }
        if let s = r.sessionId, r.reportedEventId != nil { return .deliverLinked(sessionId: s) }
        return .setAside(code: overlapsAppRecording)
    }
}
