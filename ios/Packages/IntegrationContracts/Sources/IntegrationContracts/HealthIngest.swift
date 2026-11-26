import Foundation

// ABC foundation consolidation (2026-11-26), ADDITIVE to the A↔B contract: what front B (HealthKit) exposes to front C (SwiftUI) and to the
// host, besides the DEVICE channel. Nothing here reaches CoachingCore: the only path to the engine stays `DeviceActivitySink.deliver` (RUN
// workouts) and, for heart-rate series, the engine's own classifier through front A (`TimeInZoneClassifying`, CoachingPresentation).
// No type here can say "denied": iOS does not reveal a read denial (GAP-19); an empty read is "nothing received".

// ---- CHG-UI-3: ingest status and non-run imports (B → C) ----

public enum HealthAuthorizationRequest: String, Sendable, Equatable { case notRequested = "NOT_REQUESTED", requested = "REQUESTED" }

/// What B can honestly say about Apple Health (Figma 81, 20). Never "denied".
public struct HealthIngestStatus: Equatable, Sendable {
    public let authorization: HealthAuthorizationRequest
    /// The athlete switched Apple Health off inside RepMile (an explicit, observable act).
    public let disabledInApp: Bool
    public let lastReadAt: Date?
    public let lastWorkoutReceivedAt: Date?
    public let initialImportInProgress: Bool
    /// A code, never a payload.
    public let lastReadError: String?
    /// Waiting for delivery to the host.
    public let queued: Int
    /// e.g. SCREEN_REQUIRED, CLOCK_AHEAD_OF_REFERENCE, HOST_UNAVAILABLE (a `BoundaryDisposition.waiting`/`.halted` code).
    public let waitingReason: String?
    public let setAside: Int
    /// What is arriving, e.g. ["RUN_WORKOUT", "DISTANCE", "ROUTE_PRESENCE"]; never a type that was not read.
    public let receivedTypes: [String]
    public init(authorization: HealthAuthorizationRequest, disabledInApp: Bool, lastReadAt: Date?, lastWorkoutReceivedAt: Date?, initialImportInProgress: Bool,
                lastReadError: String?, queued: Int, waitingReason: String?, setAside: Int, receivedTypes: [String]) {
        self.authorization = authorization; self.disabledInApp = disabledInApp; self.lastReadAt = lastReadAt; self.lastWorkoutReceivedAt = lastWorkoutReceivedAt
        self.initialImportInProgress = initialImportInProgress; self.lastReadError = lastReadError; self.queued = queued; self.waitingReason = waitingReason
        self.setAside = setAside; self.receivedTypes = receivedTypes
    }
}
/// A non-run workout read from Apple Health, for the history only (GAP-18): never delivered to CoachingCore (G-4), never with sets, loads or RIR.
public struct ImportedWorkoutSummary: Equatable, Sendable, Identifiable {
    /// `HKWorkout.uuid`.
    public let id: String
    /// e.g. TRADITIONAL_STRENGTH_TRAINING (HealthKit's activity type, mapped by B to a stable code).
    public let activityKind: String
    public let start: Date
    public let end: Date
    public let durationSeconds: Double
    /// As Apple Health reports it.
    public let sourceName: String?
    public init(id: String, activityKind: String, start: Date, end: Date, durationSeconds: Double, sourceName: String?) {
        self.id = id; self.activityKind = activityKind; self.start = start; self.end = end; self.durationSeconds = durationSeconds; self.sourceName = sourceName
    }
}
/// Implemented by B; consumed by C (through the composition root). Kept under B's protection and erased by `purge` (G07).
public protocol HealthIngestStatusSource: AnyObject, Sendable {
    func status() async -> HealthIngestStatus
    func importedNonRunWorkouts(since: Date) async -> [ImportedWorkoutSummary]
}

// ---- Mission 6.3: heart-rate series of one workout (B → A's classifier → C) ----

/// The sensor class of a heart-rate series. B maps it from the sample's device/source metadata and NEVER guesses: unknown is `.unknown`,
/// which the engine's classifier does not qualify (SENSOR_NOT_QUALIFYING). Apple Watch is optical.
public enum HeartRateSensorClass: String, Codable, CaseIterable, Sendable { case chestStrap = "CHEST_STRAP", ecg = "ECG", optical = "OPTICAL", unknown = "UNKNOWN" }

public struct HeartRateSample: Codable, Equatable, Sendable {
    /// Seconds from the workout start (the classifier's `t`).
    public let t: Double
    /// As HealthKit gives it (a fraction is allowed; the engine rounds half up).
    public let bpm: Double
    public let artifact: Bool?
    public init(t: Double, bpm: Double, artifact: Bool? = nil) { self.t = t; self.bpm = bpm; self.artifact = artifact }
}
/// The authorised `HKQuantityTypeIdentifier.heartRate` samples of ONE workout, aligned to it by B, in the engine classifier's input shape
/// (`v1-heart-rate-zones.mjs classifySamples`: {sensor, source, samples:[{t, bpm, artifact?}]}). B validates; it never classifies, never
/// interpolates, never fills a gap and never builds a series from an average. Zones come only from the engine (A).
public struct HeartRateSeries: Codable, Equatable, Sendable {
    public enum Invalid: Error, Equatable { case empty, tooMany(Int), outOfOrder(Int), outsideWorkout(Int), notFinite(Int) }
    /// At most this many samples per series (a 3-hour run at 1 Hz fits; B downsamples nothing, it refuses).
    public static let maxSamples = 12_000
    /// The workout (`HKWorkout.uuid`) the samples were read for; the same id as the DEVICE activity when it is a run.
    public let activityId: String
    public let sensor: HeartRateSensorClass
    /// The source bundle or device name class, for provenance (never shown as a measurement claim).
    public let source: String?
    public let durationSeconds: Double
    public let samples: [HeartRateSample]
    public init(activityId: String, sensor: HeartRateSensorClass, source: String?, durationSeconds: Double, samples: [HeartRateSample]) throws {
        guard !samples.isEmpty else { throw Invalid.empty }
        guard samples.count <= Self.maxSamples else { throw Invalid.tooMany(samples.count) }
        for (i, s) in samples.enumerated() {
            guard s.t.isFinite, s.bpm.isFinite else { throw Invalid.notFinite(i) }
            guard s.t >= 0, s.t <= durationSeconds else { throw Invalid.outsideWorkout(i) }
            if i > 0, s.t < samples[i - 1].t { throw Invalid.outOfOrder(i) }
        }
        self.activityId = activityId; self.sensor = sensor; self.source = source; self.durationSeconds = durationSeconds; self.samples = samples
    }
}
public enum HeartRateSeriesResult: Equatable, Sendable {
    case available(HeartRateSeries)
    /// NO_SAMPLES (nothing received: never "denied"), NOT_A_WORKOUT_OF_THIS_RECORD, NOT_IN_V1 (the permission is not requested in V1 unless the
    /// Founder + Security decide a display-only read: GAP-17 / G-1), PROTECTED_DATA_UNAVAILABLE.
    case unavailable(reason: String)
}
/// Implemented by B. Until the heart-rate read permission is decided (G-1/GAP-17), it answers `.unavailable("NOT_IN_V1")` for every workout.
public protocol HeartRateSeriesSource: AnyObject, Sendable {
    func heartRateSeries(activityId: String) async -> HeartRateSeriesResult
}

// ---- Mission 6.2: display-only health signals (B → C), never to the engine ----

/// Resting heart rate, HRV and sleep, when the athlete's Apple Health has them AND the Founder + Security have approved the display-only read
/// (GAP-17). The engine reads none of them (`paceInsights.heartRateInput = false`); nothing here informs a plan, a readiness or a safety rule.
public enum HealthSignalKind: String, Codable, CaseIterable, Sendable {
    case restingHeartRate = "RESTING_HEART_RATE", heartRateVariabilitySDNN = "HRV_SDNN", sleepDuration = "SLEEP_DURATION"
}
public struct HealthSignalReading: Equatable, Sendable {
    public let kind: HealthSignalKind
    public let value: Double
    /// bpm, ms, s.
    public let unit: String
    public let start: Date
    public let end: Date
    public let sourceName: String?
    public init(kind: HealthSignalKind, value: Double, unit: String, start: Date, end: Date, sourceName: String?) {
        self.kind = kind; self.value = value; self.unit = unit; self.start = start; self.end = end; self.sourceName = sourceName
    }
}
public enum HealthSignalAvailability: Equatable, Sendable {
    /// The read is not approved in this version: the UI keeps the component hidden (`Availability.unsupported("NOT_IN_V1")`).
    case notInV1
    /// Approved and read; nothing received for the window (never "denied").
    case nothingReceived
    case readings([HealthSignalReading])
}
public protocol HealthSignalSource: AnyObject, Sendable {
    func signals(_ kind: HealthSignalKind, in window: DateInterval) async -> HealthSignalAvailability
}
