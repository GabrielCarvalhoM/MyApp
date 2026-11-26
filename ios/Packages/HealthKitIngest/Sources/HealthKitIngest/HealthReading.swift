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

    public init(id: String, activityTypeRaw: UInt, start: Date, end: Date, durationSeconds: Double, distanceMeters: Double?, hasRoute: Bool,
                indoor: Bool?, wasUserEntered: Bool, sourceBundleId: String, sourceName: String?, timeZoneIdentifier: String?) {
        self.id = id; self.activityTypeRaw = activityTypeRaw; self.start = start; self.end = end; self.durationSeconds = durationSeconds
        self.distanceMeters = distanceMeters; self.hasRoute = hasRoute; self.indoor = indoor; self.wasUserEntered = wasUserEntered
        self.sourceBundleId = sourceBundleId; self.sourceName = sourceName; self.timeZoneIdentifier = timeZoneIdentifier
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
    /// Exclusions from the DEVICE channel (counted, contract §4.4 G-4 / OPEN-1, handoff §4.3).
    public static let userEntered = "USER_ENTERED"
    public static let thirdPartySource = "THIRD_PARTY_SOURCE"
    public static let strengthNotDeviceChannel = "STRENGTH_NOT_DEVICE_CHANNEL"
    public static let otherNonRun = "NON_RUN_WORKOUT"
    /// G-5: a workout deleted in Apple Health after it was delivered (nothing is sent in V1, only counted), or before (it leaves the queue).
    public static let deletedAfterDelivery = "DELETED_AFTER_DELIVERY"
    public static let deletedBeforeDelivery = "DELETED_BEFORE_DELIVERY"
    /// SSCTR-ABC-S4 b: a workout set aside as the same run as an app recording, whose measured distance therefore does not reach the record.
    public static let measuredDistanceLostToAppRecording = "MEASURED_DISTANCE_LOST_TO_APP_RECORDING"
}
