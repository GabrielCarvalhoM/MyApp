import Foundation
import IntegrationContracts

/// Everything B keeps, in ONE file written atomically (contract §7): the queue, set-aside items, the ledger of delivered workouts, the
/// HealthKit anchor, exclusion counters, the history-only summaries and the status facts. One file means the anchor can never advance
/// without the entries it read (they are in the same write). Erased by `purge`.
struct QueueState: Codable, Equatable {
    static let schema = "RM-HKI-QUEUE-1"
    var schema = QueueState.schema
    /// Advanced first by every `purge`; an answer to a delivery started under another generation is discarded (G07).
    var generation = 0
    var enabled = true
    var authorizationRequested = false
    var anchor: Data?
    /// The `recordStartDay` the anchor's predicate was built with; another one (a new record) restarts the read from no anchor.
    var anchorStartDay: String?
    var items: [QueueItem] = []
    var ledger: [String: LedgerEntry] = [:]
    var inFlight: InFlight?
    var block: QueueBlock?
    /// Workout id → exclusion reason, for workouts never queued (counted once even when read again).
    var excluded: [String: String] = [:]
    /// Counters with no workout to key them by (G-5 deletions, lost measured distance).
    var counters: [String: Int] = [:]
    var summaries: [StoredSummary] = []
    var lastReadAt: Date?
    var lastWorkoutReceivedAt: Date?
    var lastReadError: String?
    var initialImportDone = false
    var receivedTypes: [String] = []
    var retryLaterStreak = 0
    var nextRetryAt: Date?
}

struct QueueItem: Codable, Equatable {
    let activityId: String
    let start: Date
    let end: Date
    /// The normalized observation. Once `frozen`, these are the exact bytes of every send (its link included), forever (contract §4.3, §7).
    var activity: DeviceActivity
    var frozen = false
    var state: ItemState = .pending
    /// Re-sends after a `deliveryConditionsChanged()` that followed a NOT_RECORDED (contract §6.2: the only ones that count).
    var attempts = 0
    var adapterBugStrikes = 0
    /// Deleted in Apple Health while its delivery was in flight: settled when the answer arrives.
    var deletedWhileInFlight = false
}

enum ItemState: Codable, Equatable {
    case pending
    /// Answered NOT_RECORDED: re-sent (in a new delivery) only after `deliveryConditionsChanged()`.
    case notRecorded(reason: String)
    /// `RecordingDedupe.holdUntilRecordingSettles`: re-decided on every read, `deliveryConditionsChanged()` and launch; never lost.
    case held(recordingId: String)
    /// Not sent again (unless HealthKit's sample changes, which for HealthKit is a new UUID).
    case setAside(code: String)
}

struct LedgerEntry: Codable, Equatable {
    /// nil for DUPLICATE (the boundary already held it exactly).
    let eventId: String?
    let outcome: String
    let sessionId: String?
    let digest: String
    let end: Date
    /// The bytes first delivered (a re-send would reuse them; V1 sends none after delivery).
    let activity: DeviceActivity
}

struct InFlight: Codable, Equatable {
    let deliveryId: String
    let activities: [DeviceActivity]
    let generation: Int
}

enum QueueBlock: Codable, Equatable {
    /// `DeliveryResult.waiting`: nothing is sent until `deliveryConditionsChanged()`; never counts toward the attempt limit.
    case waiting(code: String)
    /// `DeliveryResult.halted`: nothing is sent until `deliveryConditionsChanged()` or `purge`; never retried on a timer.
    case halted(code: String)
    var code: String { switch self { case .waiting(let c), .halted(let c): return c } }
}

/// `ImportedWorkoutSummary` is not `Codable` in the shared package; this is its stored form inside B's own file (no other front sees it).
struct StoredSummary: Codable, Equatable {
    let id: String
    let activityKind: String
    let start: Date
    let end: Date
    let durationSeconds: Double
    let sourceName: String?
    init(_ s: ImportedWorkoutSummary) {
        id = s.id; activityKind = s.activityKind; start = s.start; end = s.end; durationSeconds = s.durationSeconds; sourceName = s.sourceName
    }
    var shared: ImportedWorkoutSummary {
        ImportedWorkoutSummary(id: id, activityKind: activityKind, start: start, end: end, durationSeconds: durationSeconds, sourceName: sourceName)
    }
}
