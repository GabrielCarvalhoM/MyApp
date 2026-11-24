import Foundation

// One delivery from the HealthKit adapter (front B) to the CoachingHost (front A), and its answer, as the queue needs it.
// Derived from integration.mjs `importActivities` and `activitiesOf`, admission.mjs LIMITS, and SWIFTUI_BACKEND_HANDOFF.md §7 and §11.

/// The bounds admission applies to a delivery (admission.mjs LIMITS; checked against the source by the tests).
public enum DeliveryLimits {
    /// `LIMITS.observationsPerRequest`: the HealthKit chunk size.
    public static let activitiesPerDelivery = 32
    /// `LIMITS.idLength`: activity ids, session ids and the request id.
    public static let idLength = 128
}

/// A chunk of 1...32 workouts. `deliveryId` (a UUID string) is the idempotency key A sends as `clientRequestId`.
/// B reuses a `deliveryId` ONLY to retry a delivery whose answer it never received (process death, `hostUnavailable`) or that answered
/// `retryLater`; nothing was committed then, or a write that landed is replayed. After ANY other answer the next send is a new delivery with a
/// NEW UUID, even with identical content: custody stores every committed request (an ASK included) and replays its stored answer for the same
/// id, so re-sending a NOT_RECORDED chunk under its old id would answer NOT_RECORDED forever (custody.mjs `seen` → `replayed`). A reused id
/// over other content is CONFLICT_IDEMPOTENCY_KEY, an app bug.
public struct DeviceDelivery: Equatable, Sendable {
    public let deliveryId: String
    public let activities: [DeviceActivity]

    public enum Invalid: Error, Equatable { case empty, tooMany(Int), badId(String), duplicateActivity(String) }

    public init(deliveryId: String, activities: [DeviceActivity]) throws {
        guard !activities.isEmpty else { throw Invalid.empty }
        guard activities.count <= DeliveryLimits.activitiesPerDelivery else { throw Invalid.tooMany(activities.count) }
        for id in [deliveryId] + activities.map(\.activityId) + activities.compactMap(\.sessionId) where !Self.idOk(id) {
            throw Invalid.badId(id)
        }
        // admission refuses one workout twice in one request (DUPLICATE_IN_REQUEST): refused here, before it costs a round trip.
        var seen = Set<String>()
        for a in activities where !seen.insert(a.activityId).inserted { throw Invalid.duplicateActivity(a.activityId) }
        self.deliveryId = deliveryId; self.activities = activities
    }

    /// admission.mjs `idOk`: a non-empty string of at most 128 UTF-16 units with no control character.
    static func idOk(_ s: String) -> Bool {
        !s.isEmpty && s.utf16.count <= DeliveryLimits.idLength && !s.unicodeScalars.contains { $0.value < 0x20 }
    }
}

/// What happened to one workout of an answered delivery (integration.mjs `activitiesOf`).
public enum ActivityOutcome: Equatable, Sendable {
    /// On record. The workout leaves the queue.
    case recorded(eventId: String)
    /// Already on record exactly. The workout leaves the queue.
    case duplicate
    /// Not put on record by this decision (`reason`: the engine's, e.g. FUTURE_OBSERVATION, or NOT_RECORDED_BY_THIS_DECISION for an ASK).
    /// The workout stays and is re-sent, in a NEW delivery, only after `deliveryConditionsChanged()`; only those re-sends count toward the
    /// queue's attempt limit (an ASK or a HOLD legitimately lasts until the athlete answers or a restarted plan starts).
    case notRecorded(reason: String)

    /// Whether the queue may drop the workout (handoff §11: only RECORDED or DUPLICATE).
    public var leavesQueue: Bool { if case .notRecorded = self { return false }; return true }
}

public struct ActivityResult: Equatable, Sendable {
    public let index: Int
    public let activityId: String
    public let outcome: ActivityOutcome
    public init(index: Int, activityId: String, outcome: ActivityOutcome) { self.index = index; self.activityId = activityId; self.outcome = outcome }
}

/// The answer B acts on. A maps every boundary answer to exactly one case (`BoundaryDisposition.of(code:)` for failures).
public enum DeliveryResult: Equatable, Sendable {
    /// `ok:true`: one result per workout of the delivery, in order.
    case answered(version: Int, activities: [ActivityResult])
    /// A whole refusal at admission: NOTHING was recorded. `index` names the workout at fault when the boundary named one.
    case refused(code: String, index: Int?, disposition: BoundaryDisposition)
    /// Nothing was recorded; the queue keeps everything and waits for `deliveryConditionsChanged()` (screen, clock, consent, enrolment).
    /// The next send is a new delivery (new id). Waiting never counts toward the attempt limit.
    case waiting(code: String)
    /// Nothing was confirmed; retry the SAME delivery (same id) after a bounded backoff. The only answer after which the id is reused.
    case retryLater(code: String)
    /// The record cannot take deliveries (lost, rolled back, integrity, erased, not enrolled) or the app is wrong. Keep the queue, stop
    /// sending, and wait for A's `deliveryConditionsChanged()` or `purge(_:)`. Never retried on a timer.
    case halted(code: String)
    /// The CoachingHost is not running or cannot read its store or key now (e.g. protected data unavailable). Nothing was sent.
    case hostUnavailable
}

/// Codes A answers itself, before the boundary is called (not boundary codes).
public enum HostCode {
    /// D1 (handoff §8, NATIVE 5.1): the operation clock is more than 300 s ahead of A's trusted reference; refused before custody, nothing
    /// written. Recovery: A signals `deliveryConditionsChanged()` after its first successful mutating operation following this refusal.
    public static let clockAheadOfReference = "CLOCK_AHEAD_OF_REFERENCE"
    /// The host is not running or cannot read its store or key (`DeliveryResult.hostUnavailable`, `IngestContextResult.unavailable`).
    public static let hostUnavailable = "HOST_UNAVAILABLE"
}

/// How B treats a failure code (SWIFTUI_BACKEND_HANDOFF.md §7 error table, integration.mjs and admission.mjs codes).
public enum BoundaryDisposition: String, Equatable, Sendable, CaseIterable {
    /// Set the workout at `index` aside (not sent again unless its HealthKit sample changes); re-send the rest as a NEW delivery.
    case setAsideItem
    /// Re-send the workout at `index` unlinked, and the rest, as a NEW delivery (UNKNOWN_SESSION, SPORT_MISMATCH).
    case resendUnlinked
    /// B built a wrong request (no index to blame): split or fix it; log the code only.
    case adapterBug
    case waiting
    case retryLater
    case halted

    /// Fail closed: a code this table does not know halts the queue (nothing is lost and nothing is retried forever).
    public static func of(code: String) -> BoundaryDisposition {
        switch code {
        case "BEFORE_RECORD_START", "UNKNOWN_FIELD", "BOUNDARY_OWNED_FIELD", "INVALID_OBSERVATION", "INVALID_IDENTIFIER", "INVALID_TIME",
             "UNSUPPORTED_ACTIVITY", "REPORT_VOICE_MIXED", "ACTIVITY_LINKED_ELSEWHERE", "CORRECTION_ACTIVITY_MISMATCH",
             "CORRECTION_SESSION_MISMATCH", "CORRECTION_TARGET_NOT_FOUND", "CORRECTION_OF_REPLACED", "CROSS_AUTHOR_CORRECTION",
             "DUPLICATE_IN_REQUEST", "LIMIT_EXCEEDED":
            return .setAsideItem
        case "UNKNOWN_SESSION", "SPORT_MISMATCH":
            return .resendUnlinked
        case "INVALID_REQUEST", "NOTHING_TO_IMPORT", "UNKNOWN_CHANNEL":
            return .adapterBug
        case "SCREEN_REQUIRED", "CLOCK_BEHIND_RECORD", "CONSENT_REQUIRED", "NOT_ENROLLED", HostCode.clockAheadOfReference:
            return .waiting
        case "BUSY", "PERSISTENCE_FAILURE", "OPERATIONAL_ERROR":
            return .retryLater
        default:
            // RECORD_LOST, RECORD_ROLLED_BACK, INTEGRITY_FAILURE, ENGINE_CONTRACT_VIOLATION, FORBIDDEN, GONE, UNAUTHENTICATED,
            // CONFLICT_IDEMPOTENCY_KEY, and unknown codes. CONFLICT_STALE_VERSION and REQUEST_ID_REUSED are resolved inside A (a fresh
            // request id on the current version, bounded attempts, contract §6.1); B sees them only if A gave up, and then halts.
            return .halted
        }
    }

    /// The disposition of a refusal as the boundary answered it: a per-item disposition without an index to act on is an adapter bug
    /// (e.g. LIMIT_EXCEEDED observationsPerRequest / requestBytes: the chunk itself is wrong).
    public static func of(code: String, index: Int?) -> BoundaryDisposition {
        let d = of(code: code)
        if index == nil && (d == .setAsideItem || d == .resendUnlinked) { return .adapterBug }
        return d
    }
}
