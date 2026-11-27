import Foundation

/// One `HKWorkout` as B reads it: only what HealthKit actually states, nothing derived. Built by the HealthKit reader (`HealthKitReader`,
/// iOS) or by a test double. Internal read model of the adapter (DR-123: source types and identifiers stay in the platform adapter); it never
/// leaves B. What crosses to other fronts is `DeviceActivity` (A) and `ImportedWorkoutSummary` (C), both shared types.
public struct WorkoutSnapshot: Sendable, Equatable, Codable {
    /// `HKWorkout.uuid.uuidString`.
    public let id: String
    /// `HKWorkout.workoutActivityType.rawValue`.
    public let activityTypeRaw: UInt
    public let start: Date
    public let end: Date
    /// `HKWorkout.duration` (seconds, as HealthKit reports it).
    public let durationSeconds: Double
    /// The workout's `distanceWalkingRunning` sum in metres, nil when HealthKit has none.
    public let distanceMeters: Double?
    /// Whether at least one `HKWorkoutRoute` is associated with the workout (presence only; B never reads a coordinate).
    public let hasRoute: Bool
    /// `HKMetadataKeyIndoorWorkout`, nil when absent.
    public let indoor: Bool?
    /// `HKMetadataKeyWasUserEntered == true`.
    public let wasUserEntered: Bool
    /// `sourceRevision.source.bundleIdentifier`.
    public let sourceBundleId: String
    /// `sourceRevision.source.name`, as Apple Health reports it.
    public let sourceName: String?
    /// `HKMetadataKeyTimeZone` (a time-zone identifier), nil when absent.
    public let timeZoneIdentifier: String?
    /// `sourceRevision.productType` (e.g. "Watch7,1", "iPhone17,2"), nil when HealthKit has none. Provenance only (which Apple device).
    public let sourceProductType: String?
    /// `HKMetadataKeySyncIdentifier` / `HKMetadataKeySyncVersion`, when the writing app set them. A sync identifier is scoped to its source:
    /// the same identifier from the SAME source is the same record (a newer version replaces an older one); across sources it means nothing.
    public let syncIdentifier: String?
    public let syncVersion: Int?

    public init(id: String, activityTypeRaw: UInt, start: Date, end: Date, durationSeconds: Double, distanceMeters: Double?, hasRoute: Bool,
                indoor: Bool?, wasUserEntered: Bool, sourceBundleId: String, sourceName: String?, timeZoneIdentifier: String?,
                sourceProductType: String? = nil, syncIdentifier: String? = nil, syncVersion: Int? = nil) {
        self.id = id; self.activityTypeRaw = activityTypeRaw; self.start = start; self.end = end; self.durationSeconds = durationSeconds
        self.distanceMeters = distanceMeters; self.hasRoute = hasRoute; self.indoor = indoor; self.wasUserEntered = wasUserEntered
        self.sourceBundleId = sourceBundleId; self.sourceName = sourceName; self.timeZoneIdentifier = timeZoneIdentifier
        self.sourceProductType = sourceProductType; self.syncIdentifier = syncIdentifier; self.syncVersion = syncVersion
    }
}

/// What one anchored read returned: new samples, deleted sample ids (`HKDeletedObject.uuid`) and the anchor after them (archived
/// `HKQueryAnchor`). B persists the anchor only together with the queue entries the read produced (contract §7).
public struct WorkoutReadBatch: Sendable, Equatable {
    public let added: [WorkoutSnapshot]
    public let deletedIds: [String]
    public let anchor: Data
    public init(added: [WorkoutSnapshot], deletedIds: [String], anchor: Data) { self.added = added; self.deletedIds = deletedIds; self.anchor = anchor }
}

public enum HealthReadError: Error, Equatable {
    /// `HKError.errorDatabaseInaccessible`: the device is locked. B waits for `protectedDataDidBecomeAvailable`, losing nothing.
    case protectedDataUnavailable
    /// Health data is not available on this device (`HKHealthStore.isHealthDataAvailable() == false`).
    case healthDataUnavailable
    /// Any other read failure, as a code (never a payload).
    case failed(code: String)

    public var code: String {
        switch self {
        case .protectedDataUnavailable: return IngestCode.protectedDataUnavailable
        case .healthDataUnavailable: return "HEALTH_DATA_UNAVAILABLE"
        case .failed(let c): return c
        }
    }
}

/// The HealthKit side of B, behind a protocol so the queue is tested without HealthKit. Read only: no method writes to Apple Health.
public protocol HealthReading: AnyObject, Sendable {
    /// Requests READ authorization for workouts, `distanceWalkingRunning` and workout routes (presence). Never heart rate on a device in
    /// this phase (G-1), never write (DR-121). iOS never says whether reading was denied (GAP-19): the call only tells that the sheet was shown.
    func requestReadAuthorization() async throws
    /// One anchored read of workouts whose interval reaches `startingAt` or later (`nil` anchor: from the start).
    func readWorkouts(anchor: Data?, startingAt: Date) async throws -> WorkoutReadBatch
    /// Registers the workout observer; `onChange` runs for every HealthKit notification and the observer's completion handler is called only
    /// after it returns (always, also on failure).
    func startObserving(_ onChange: @escaping @Sendable () async -> Void) async throws
    func stopObserving() async
    /// `enableBackgroundDelivery(for: workoutType, frequency: .immediate)` / `disableBackgroundDelivery(for:)`.
    func setBackgroundDelivery(_ enabled: Bool) async throws
}

/// Codes B itself answers (never a payload).
public enum IngestCode {
    public static let protectedDataUnavailable = "PROTECTED_DATA_UNAVAILABLE"
    public static let attemptsExhausted = "ATTEMPTS_EXHAUSTED"
    public static let notInV1 = "NOT_IN_V1"
    public static let noSamples = "NO_SAMPLES"
    /// Exclusions from the DEVICE channel (counted, contract §4.4 G-4, handoff §4.3). A user-entered run is the athlete's statement, never a
    /// device measurement (SEC-INT-09 a): it is kept for the history only (`ImportedRunStatus.notForEngine`).
    public static let userEntered = "USER_ENTERED"
    /// Policy 1 only (OPEN-1 before the Founder's decision of 2026-11-26). No longer produced; a file written under policy 1 is migrated: its
    /// workouts excluded with this reason are read again under policy 2 (`QueueState.selectionPolicy`).
    public static let thirdPartySource = "THIRD_PARTY_SOURCE"
    public static let strengthNotDeviceChannel = "STRENGTH_NOT_DEVICE_CHANNEL"
    public static let otherNonRun = "NON_RUN_WORKOUT"
    /// G-5: a workout deleted in Apple Health after it was delivered (nothing is sent in V1, only counted), or before (it leaves the queue).
    public static let deletedAfterDelivery = "DELETED_AFTER_DELIVERY"
    public static let deletedBeforeDelivery = "DELETED_BEFORE_DELIVERY"
    /// P3-2: a workout deleted in Apple Health while it may be on the record (set aside after an answer that does not prove it absent). It
    /// stays in B's file as the run of its group, so no copy of it is promoted; nothing is sent (G-5). Counted once.
    public static let deletedMaybeOnRecord = "DELETED_MAYBE_ON_RECORD"
    /// SSCTR-ABC-S4 b: a workout set aside as the same run as an app recording, whose measured distance therefore does not reach the record.
    public static let measuredDistanceLostToAppRecording = "MEASURED_DISTANCE_LOST_TO_APP_RECORDING"
    /// FND-ABC-06 (b): a workout delivered by the normal rule although a REPORTED app recording overlaps it below the same-run threshold
    /// (both may count; the decision is Core + SSCTR + B). Counted once, when the workout is first sent.
    public static let partialOverlapWithReportedAppRecording = "PARTIAL_OVERLAP_WITH_REPORTED_APP_RECORDING"
    /// Same physical run in several HealthKit workouts (OPEN-1 policy 2, `SameRunRule`): one is delivered, the others are consolidated into it.
    public static let consolidatedSameRun = "CONSOLIDATED_SAME_RUN"
    /// Probably the same run, not enough evidence to consolidate: none of the open records is delivered until reconciled (`SameRunRule`).
    public static let reconcilePartialOverlap = "RECONCILE_PARTIAL_OVERLAP"
    public static let reconcileMeasurementsDisagree = "RECONCILE_MEASUREMENTS_DISAGREE"
    public static let reconcileSeveralRuns = "RECONCILE_SEVERAL_RUNS"
    /// `HealthIngestStatus.waitingReason` when every queued run awaits reconciliation (nothing else is pending).
    public static let awaitingReconciliation = "AWAITING_RECONCILIATION"
}
