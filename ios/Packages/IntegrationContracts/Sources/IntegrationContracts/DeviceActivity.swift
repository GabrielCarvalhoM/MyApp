import Foundation

// The DEVICE channel observation, exactly as the frozen boundary admits it. Every key and value below is derived from the frozen sources, and
// the tests check them against those bytes (ContractConformanceTests):
//  - keys: CoachingCore/src/boundary/admission.mjs OBSERVATION_KEYS.DEVICE
//    ['activityId','activityType','sessionId','observedAt','actual','sourceQuality'];
//  - activityType: admission.mjs DEVICE_ACTIVITY_TYPES ['RUN'] (strength is the athlete's, never the device channel in V1);
//  - sourceQuality: admission.mjs DEVICE_QUALITIES ['WEARABLE_FULL','WEARABLE_PARTIAL'];
//  - actual: handoff SWIFTUI_BACKEND_HANDOFF.md §5.3 (SEC-INT-12 for the device channel), the device's facts only (report-voices.mjs: never
//    conditions, walkBreaks, stop, rpe or a response); measurement values from RUN_FORMATS_V1.json runFacts.measuredSources, gpsQuality
//    values from runFacts.quality.
// Not here on purpose (contract §4.4, gaps G-1..G-3): `heartRate` (no reviewed rule of the boundary engine reads it), `seconds` and
// `segments` (read by the engine, not in the approved device list). Adding any of them is a reviewed contract change.

/// The activity types the V1 device channel admits.
public enum DeviceActivityType: String, Codable, CaseIterable, Sendable { case run = "RUN" }

/// How completely the device recorded the workout (r6-provenance sourceQuality; the boundary defaults an absent one to WEARABLE_FULL).
public enum DeviceSourceQuality: String, Codable, CaseIterable, Sendable {
    case wearableFull = "WEARABLE_FULL"
    case wearablePartial = "WEARABLE_PARTIAL"
}

/// How the device measured the distance (RUN_FORMATS_V1.json runFacts.measuredSources). A HealthKit run is normally GPS or TREADMILL;
/// the adapter states only what HealthKit actually says, never a guess (DR-118: missing stays missing).
public enum DeviceMeasurement: String, Codable, CaseIterable, Sendable {
    case track = "TRACK"
    case measuredCourse = "MEASURED_COURSE"
    case official = "OFFICIAL"
    case treadmill = "TREADMILL"
    case gps = "GPS"
}

/// The device's own flag on its GPS (RUN_FORMATS_V1.json runFacts.quality).
public enum DeviceGPSQuality: String, Codable, CaseIterable, Sendable {
    case ok = "OK"
    case unknown = "UNKNOWN"
    case poor = "POOR"
}

/// What the device measured. A nil field is absent from the JSON (never 0, never a default).
public struct DeviceActual: Codable, Equatable, Sendable {
    /// Required by admission (`actual.completed` must be a boolean).
    public var completed: Bool
    /// Elapsed workout duration in minutes. The adapter's rounding must be deterministic: the same HKWorkout always gives the same value,
    /// because the boundary treats a re-sync whose facts differ as the device's own correction (integration.mjs factsDigest: sessionId,
    /// observedAt, occurrenceDate, actual).
    public var minutes: Double?
    public var distanceKm: Double?
    public var measurement: DeviceMeasurement?
    public var gpsQuality: DeviceGPSQuality?

    public init(completed: Bool, minutes: Double? = nil, distanceKm: Double? = nil, measurement: DeviceMeasurement? = nil,
                gpsQuality: DeviceGPSQuality? = nil) {
        self.completed = completed; self.minutes = minutes; self.distanceKm = distanceKm
        self.measurement = measurement; self.gpsQuality = gpsQuality
    }
}

/// One HealthKit workout on the DEVICE channel (`importActivities` activities[i]).
public struct DeviceActivity: Codable, Equatable, Sendable {
    /// `HKWorkout.uuid.uuidString`. Stable for the life of the sample; the boundary binds re-syncs and corrections by it. Same id, same
    /// facts → DUPLICATE; same id, other `actual`/`observedAt` → the device's own correction; same id, other `sessionId` →
    /// ACTIVITY_LINKED_ELSEWHERE (never a correction); a change of `sourceQuality` alone is not in the digest → DUPLICATE (not recorded).
    public var activityId: String
    public var activityType: DeviceActivityType
    /// A session of the plan in force, only when the link is unambiguous (contract §4.3); otherwise nil (sent unlinked).
    public var sessionId: String?
    /// The workout's end, ISO 8601 with its offset (`BoundaryInstant.string(_:offsetSeconds:)`). Part of the facts digest, so it must be
    /// byte-stable: the offset of `HKMetadataKeyTimeZone` when the sample has one, otherwise UTC (`Z`), never the device's current zone; a
    /// re-send reuses the bytes first delivered.
    public var observedAt: String
    public var actual: DeviceActual
    public var sourceQuality: DeviceSourceQuality?

    public init(activityId: String, activityType: DeviceActivityType = .run, sessionId: String? = nil, observedAt: String,
                actual: DeviceActual, sourceQuality: DeviceSourceQuality? = nil) {
        self.activityId = activityId; self.activityType = activityType; self.sessionId = sessionId
        self.observedAt = observedAt; self.actual = actual; self.sourceQuality = sourceQuality
    }

    /// The same workout without its session link (the re-send after UNKNOWN_SESSION / SPORT_MISMATCH, contract §6.2).
    public func unlinked() -> DeviceActivity { var c = self; c.sessionId = nil; return c }
}

/// The instant format admission accepts (`instantOk`: `YYYY-MM-DDTHH:MM[:SS[.fff]]` then `Z` or `±HH:MM`). An instant without an offset is
/// read in the runtime's own zone, so the adapter always states one.
public enum BoundaryInstant {
    /// `date` at the given UTC offset, to the second: `2026-11-24T07:45:00-03:00` (`Z` at offset 0).
    public static func string(_ date: Date, offsetSeconds: Int) -> String {
        let offset = offsetSeconds - offsetSeconds % 60
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(secondsFromGMT: offset) ?? TimeZone(secondsFromGMT: 0)!
        let c = cal.dateComponents([.year, .month, .day, .hour, .minute, .second], from: date)
        let body = String(format: "%04d-%02d-%02dT%02d:%02d:%02d", c.year!, c.month!, c.day!, c.hour!, c.minute!, c.second!)
        if offset == 0 { return body + "Z" }
        let a = abs(offset) / 60
        return body + String(format: "%@%02d:%02d", offset < 0 ? "-" : "+", a / 60, a % 60)
    }

    /// The local calendar day (`YYYY-MM-DD`) of `date` at a fixed offset in minutes (the plan's `timezoneOffsetMinutes`).
    public static func day(_ date: Date, offsetMinutes: Int) -> String {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(secondsFromGMT: offsetMinutes * 60) ?? TimeZone(secondsFromGMT: 0)!
        let c = cal.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year!, c.month!, c.day!)
    }
}
