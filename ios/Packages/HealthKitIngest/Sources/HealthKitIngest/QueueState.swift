import Foundation
import IntegrationContracts

/// Everything B keeps, in ONE file written atomically (contract §7): the queue, set-aside items, the ledger of delivered workouts, the
/// HealthKit anchor, exclusion counters, the history-only summaries and the status facts. One file means the anchor can never advance
/// without the entries it read (they are in the same write). Erased by `purge`.
struct QueueState: Codable, Equatable {
    static let schema = "RM-HKI-QUEUE-1"
    /// OPEN-1 selection policy: 1 = Apple sources only (before 2026-11-26); 2 = every measured run, the same run counted once. A file
    /// without the field was written under policy 1 (decoded as 1, then migrated by the ingestor).
    static let currentSelectionPolicy = 2
    var schema = QueueState.schema
    var selectionPolicy = QueueState.currentSelectionPolicy
    /// Policy-1 migration: workouts excluded as THIRD_PARTY_SOURCE, to be read once more (a full read filtered to exactly these ids, next to
    /// the normal anchored read, so no deletion is missed). Emptied by the first such read that succeeds.
    var rescanIds: [String] = []
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
    /// User-entered runs, for the history only (never delivered: the athlete's statement, SEC-INT-09 a).
    var enteredRuns: [StoredEnteredRun] = []
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
    /// Deleted in Apple Health while its place on the record was unknown: in flight (settled when the answer arrives), or set aside with
    /// `mayBeOnRecord` (kept: it may be on the record).
    var deletedWhileInFlight = false
    /// P3-2: set aside after an answer that does not prove it absent from the record (`retryLater` exhausted after a send that may have
    /// landed, #85 `InFlight.mayHaveLanded`; ACTIVITY_LINKED_ELSEWHERE: it is on the record). It stays the run of its same-run group, so a
    /// copy is never promoted and sent. Cleared only by an answered NOT_RECORDED of a re-send (#85: on record, it would be DUPLICATE).
    var mayBeOnRecord = false
    /// #85: set aside after its delivery exhausted `retryLater` (a fault of the moment, not an answer), with a re-send round still to come:
    /// the earliest instant of that round. Reopened then by `deliveryConditionsChanged()` or a launch, with the same frozen bytes in a NEW
    /// delivery (same id, same facts: DUPLICATE if a write landed, otherwise the boundary decides). nil: no round to come.
    var resendDue: Date?
    /// #85: the re-send rounds already reopened (bounded by `ResendPolicy.maxRounds`).
    var resends = 0
    /// What HealthKit said about where the run came from (nil only in a file written before policy 2).
    var provenance: RunProvenance?
}

enum ItemState: Codable, Equatable {
    case pending
    /// Answered NOT_RECORDED: re-sent (in a new delivery) only after `deliveryConditionsChanged()`.
    case notRecorded(reason: String)
    /// `RecordingDedupe.holdUntilRecordingSettles`: re-decided on every read, `deliveryConditionsChanged()` and launch; never lost.
    case held(recordingId: String)
    /// Not sent again (unless HealthKit's sample changes, which for HealthKit is a new UUID).
    case setAside(code: String)
    /// `SameRunRule`: another workout of the same physical run is the one delivered. Re-decided on every write (if that one disappears
    /// before it is sent, this one may become the run); never sent while it lasts.
    case sameRunAs(activityId: String)
    /// `SameRunRule`: probably the same run as other workouts, not enough evidence. Never sent while it lasts; re-decided on every write.
    case reconcile(code: String, group: String)
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
    /// nil only in a file written before policy 2 (then `end − minutes`, or `end`, stands in for it in `SameRunRule`).
    var start: Date?
    var provenance: RunProvenance?
}

struct InFlight: Codable, Equatable {
    let deliveryId: String
    let activities: [DeviceActivity]
    let generation: Int
    /// #85 (over-caution of P3-2): a send of this delivery may have landed on the record. False while every answer to it said nothing was
    /// recorded (a refusal, even with the retryLater disposition, or `hostUnavailable`); true after a `retryLater` answer ("nothing was
    /// confirmed"), after an answer B could not write, and for every delivery read back from disk (a process that died may have sent it and
    /// never written the answer). Never stored: decoding always says true (fail closed).
    var mayHaveLanded = false
    enum CodingKeys: String, CodingKey { case deliveryId, activities, generation }
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

/// A user-entered run, kept for the history only: the athlete's entry, not a measurement (no distance is kept).
struct StoredEnteredRun: Codable, Equatable {
    let id: String
    let start: Date
    let end: Date
    let durationSeconds: Double
    let provenance: RunProvenance
}

// QRE-B-10: decoding takes every field's default when it is absent, so a field added by a later version never makes an existing queue file
// unreadable (the schema string changes only for an incompatible layout, and then the file fails closed).
extension QueueState {
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let d = QueueState()
        schema = try c.decodeIfPresent(String.self, forKey: .schema) ?? ""
        selectionPolicy = try c.decodeIfPresent(Int.self, forKey: .selectionPolicy) ?? 1
        rescanIds = try c.decodeIfPresent([String].self, forKey: .rescanIds) ?? []
        enteredRuns = try c.decodeIfPresent([StoredEnteredRun].self, forKey: .enteredRuns) ?? []
        generation = try c.decodeIfPresent(Int.self, forKey: .generation) ?? d.generation
        enabled = try c.decodeIfPresent(Bool.self, forKey: .enabled) ?? d.enabled
        authorizationRequested = try c.decodeIfPresent(Bool.self, forKey: .authorizationRequested) ?? d.authorizationRequested
        anchor = try c.decodeIfPresent(Data.self, forKey: .anchor)
        anchorStartDay = try c.decodeIfPresent(String.self, forKey: .anchorStartDay)
        items = try c.decodeIfPresent([QueueItem].self, forKey: .items) ?? []
        ledger = try c.decodeIfPresent([String: LedgerEntry].self, forKey: .ledger) ?? [:]
        inFlight = try c.decodeIfPresent(InFlight.self, forKey: .inFlight)
        block = try c.decodeIfPresent(QueueBlock.self, forKey: .block)
        excluded = try c.decodeIfPresent([String: String].self, forKey: .excluded) ?? [:]
        counters = try c.decodeIfPresent([String: Int].self, forKey: .counters) ?? [:]
        summaries = try c.decodeIfPresent([StoredSummary].self, forKey: .summaries) ?? []
        lastReadAt = try c.decodeIfPresent(Date.self, forKey: .lastReadAt)
        lastWorkoutReceivedAt = try c.decodeIfPresent(Date.self, forKey: .lastWorkoutReceivedAt)
        lastReadError = try c.decodeIfPresent(String.self, forKey: .lastReadError)
        initialImportDone = try c.decodeIfPresent(Bool.self, forKey: .initialImportDone) ?? d.initialImportDone
        receivedTypes = try c.decodeIfPresent([String].self, forKey: .receivedTypes) ?? []
        retryLaterStreak = try c.decodeIfPresent(Int.self, forKey: .retryLaterStreak) ?? 0
        nextRetryAt = try c.decodeIfPresent(Date.self, forKey: .nextRetryAt)
    }
}

extension QueueItem {
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        activityId = try c.decode(String.self, forKey: .activityId)
        start = try c.decode(Date.self, forKey: .start)
        end = try c.decode(Date.self, forKey: .end)
        activity = try c.decode(DeviceActivity.self, forKey: .activity)
        frozen = try c.decodeIfPresent(Bool.self, forKey: .frozen) ?? false
        state = try c.decodeIfPresent(ItemState.self, forKey: .state) ?? .pending
        attempts = try c.decodeIfPresent(Int.self, forKey: .attempts) ?? 0
        adapterBugStrikes = try c.decodeIfPresent(Int.self, forKey: .adapterBugStrikes) ?? 0
        deletedWhileInFlight = try c.decodeIfPresent(Bool.self, forKey: .deletedWhileInFlight) ?? false
        // A file written before P3-2 cannot tell an exhausted retryLater from an exhausted NOT_RECORDED: fail closed, it may be on record.
        mayBeOnRecord = try c.decodeIfPresent(Bool.self, forKey: .mayBeOnRecord)
            ?? (frozen && [.setAside(code: IngestCode.attemptsExhausted), .setAside(code: HealthKitIngestor.activityLinkedElsewhere)].contains(state))
        provenance = try c.decodeIfPresent(RunProvenance.self, forKey: .provenance)
        // #85: a file written before #85 has no `resends`. Its ATTEMPTS_EXHAUSTED item that may be on record was set aside by an exhausted
        // retryLater (or, before P3-2, possibly by NOT_RECORDED answers): it gets its re-send rounds, the first one due at once. Re-sending
        // it is safe either way: the same id with the same facts is DUPLICATE when on record.
        resends = try c.decodeIfPresent(Int.self, forKey: .resends) ?? 0
        resendDue = try c.decodeIfPresent(Date.self, forKey: .resendDue)
        if !c.contains(.resends), mayBeOnRecord, !deletedWhileInFlight, state == .setAside(code: IngestCode.attemptsExhausted) { resendDue = .distantPast }
    }
}

extension InFlight {
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        deliveryId = try c.decode(String.self, forKey: .deliveryId)
        activities = try c.decode([DeviceActivity].self, forKey: .activities)
        generation = try c.decode(Int.self, forKey: .generation)
        mayHaveLanded = true
    }
}
