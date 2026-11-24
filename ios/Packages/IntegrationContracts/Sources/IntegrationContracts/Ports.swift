import Foundation

// The two ports between the fronts. Front A (CoachingHost) implements `DeviceActivitySink`; front B (HealthKit adapter) implements
// `DeviceQueueControl`. Neither front imports the other's module: each sees only this package, and the app's composition root wires them.

/// A run session of the plan in force, as the plan view gives it (`view.week.sessions[]` with `sport == "RUN"`), for linking only.
public struct PlannedRunSession: Equatable, Sendable {
    public let sessionId: String
    /// The plan-local day `YYYY-MM-DD` (the view's `date`).
    public let day: String
    public init(sessionId: String, day: String) { self.sessionId = sessionId; self.day = day }
}

/// What B needs to read and link HealthKit workouts. A builds it from the verified record and the plan view; it is a projection, never a
/// decision: B uses it only to bound its query window and to link a workout when exactly one run session and one workout share a day.
public struct IngestContext: Equatable, Sendable {
    /// The day the record began (`doc.createdAt` in the plan's offset): no workout before it is sent (BEFORE_RECORD_START).
    public let recordStartDay: String
    /// The plan's fixed offset (`program.timezoneOffsetMinutes`); local days are read in it, not in the device's zone.
    public let timezoneOffsetMinutes: Int
    /// Every run session of the plan in force, all weeks. Session ids repeat across plans: never link across a restart by id alone.
    public let runSessions: [PlannedRunSession]
    /// The record version the context was read at (diagnostic only; A sends the current version itself).
    public let version: Int
    public init(recordStartDay: String, timezoneOffsetMinutes: Int, runSessions: [PlannedRunSession], version: Int) {
        self.recordStartDay = recordStartDay; self.timezoneOffsetMinutes = timezoneOffsetMinutes
        self.runSessions = runSessions; self.version = version
    }
}

public enum IngestContextResult: Equatable, Sendable {
    case ready(IngestContext)
    /// No context now (not enrolled, record lost, integrity failure, host unavailable): B reads nothing new into the boundary path and
    /// keeps its queue. `code` is the boundary error code or `HostCode.hostUnavailable`.
    case unavailable(code: String)
}

/// Implemented by front A. The only way device workouts reach CoachingCore (channel DEVICE, `integration.importActivities`).
/// Contract: every call runs on A's single engine queue; A sets the authenticated actor and the current `expectedVersion`; A never changes
/// an activity's content; A answers with exactly one `DeliveryResult`; A never throws for a boundary refusal.
public protocol DeviceActivitySink: AnyObject, Sendable {
    func ingestContext() async -> IngestContextResult
    func deliver(_ delivery: DeviceDelivery) async -> DeliveryResult
}

/// Why A asks B to drop queued data.
public enum QueuePurgeReason: String, Equatable, Sendable, CaseIterable {
    /// `eraseAccount` succeeded (G07: every layer).
    case accountErased = "ACCOUNT_ERASED"
    /// The athlete acknowledged a lost or rolled-back record (`acknowledgeRecordLoss`): a new plan starts from a new intake.
    case recordLossAcknowledged = "RECORD_LOSS_ACKNOWLEDGED"
    /// First launch after an install with no backup (handoff §6.1): a leftover queue belongs to no record.
    case freshInstall = "FRESH_INSTALL"
}

/// Implemented by front B. A calls it; B never calls into A's internals.
public protocol DeviceQueueControl: AnyObject, Sendable {
    /// Something that made deliveries wait or halt may have changed (a screen answered, the clock corrected, consent given, enrolment or a
    /// restart done, the host back). B re-reads `ingestContext()` and retries what is waiting. Idempotent and cheap.
    func deliveryConditionsChanged() async
    /// Remove every queued, set-aside and delivered-activity entry and B's HealthKit anchors (not HealthKit data, which is the athlete's).
    /// Returns only after the removal is durable. It advances B's purge generation first: the result of any delivery started before the
    /// purge (e.g. one queued behind `eraseAccount` on A's queue, answered GONE) is discarded and never written back (G07).
    func purge(_ reason: QueuePurgeReason) async throws
}
