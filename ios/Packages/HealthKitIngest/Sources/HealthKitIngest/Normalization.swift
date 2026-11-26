import Foundation
import IntegrationContracts

/// Which channel, if any, a workout goes to (handoff §4 item 3). Exactly one answer per workout, decided only from what HealthKit states.
public enum WorkoutSelection: Equatable, Sendable {
    /// A running workout recorded by an Apple source: normalized for the DEVICE channel.
    case device
    /// A running workout B does not send (counted by reason): `USER_ENTERED` (`HKMetadataKeyWasUserEntered`, the athlete's statement) or
    /// `THIRD_PARTY_SOURCE` (OPEN-1: another app's write is outside the DEVICE channel until the Founder + Security decide).
    case excludedRun(reason: String)
    /// Not a run: history only (`ImportedWorkoutSummary`, GAP-18), never to the engine (G-4). `reason` is the counter it adds to.
    case nonRun(reason: String)
}

/// Normalization rules (handoff §4 item 4). Deterministic: the same snapshot always gives the same bytes. Provisional rules are marked.
public enum WorkoutNormalizer {
    /// OPEN-1: only Apple sources (`com.apple.health` prefix: the Apple Watch and iPhone workout recorders) enter the DEVICE channel.
    public static let appleSourcePrefix = "com.apple.health"

    public static func isAppleSource(_ bundleId: String) -> Bool { bundleId.hasPrefix(appleSourcePrefix) }

    /// `isDeviceSource` is the OPEN-1 policy; the default is Apple sources only. Tests in the Simulator, where the only writer is the lab app
    /// itself, pass the lab's own bundle id explicitly; production never overrides it.
    public static func select(_ w: WorkoutSnapshot, isDeviceSource: (String) -> Bool = isAppleSource) -> WorkoutSelection {
        if w.activityTypeRaw == WorkoutKind.running {
            if w.wasUserEntered { return .excludedRun(reason: IngestCode.userEntered) }
            if !isDeviceSource(w.sourceBundleId) { return .excludedRun(reason: IngestCode.thirdPartySource) }
            return .device
        }
        if w.activityTypeRaw == WorkoutKind.traditionalStrengthTraining || w.activityTypeRaw == WorkoutKind.functionalStrengthTraining {
            return .nonRun(reason: IngestCode.strengthNotDeviceChannel)
        }
        return .nonRun(reason: IngestCode.otherNonRun)
    }

    /// The UTC offset `observedAt` is written in: the offset of `HKMetadataKeyTimeZone` at the workout's end when the sample has one, otherwise
    /// 0 (UTC, `Z`). Never the device's current zone: `observedAt` is in the boundary's facts digest (contract §7).
    public static func offsetSeconds(_ w: WorkoutSnapshot) -> Int {
        guard let id = w.timeZoneIdentifier, let tz = TimeZone(identifier: id) else { return 0 }
        return tz.secondsFromGMT(for: w.end)
    }

    /// `minutes` = duration / 60, rounded half away from zero to 0.01 min. Omitted when HealthKit states no positive duration.
    public static func minutes(_ seconds: Double) -> Double? {
        guard seconds.isFinite, seconds > 0 else { return nil }
        return (seconds * 100 / 60).rounded(.toNearestOrAwayFromZero) / 100
    }

    /// `distanceKm` = metres / 1000, rounded half away from zero to the metre (3 decimals). Omitted when HealthKit has no distance, or a
    /// non-positive one (a zero sum is no measured distance: DR-118, missing stays missing).
    public static func kilometres(_ metres: Double?) -> Double? {
        guard let m = metres, m.isFinite, m > 0 else { return nil }
        return m.rounded(.toNearestOrAwayFromZero) / 1000
    }

    /// `measurement`: TREADMILL when HealthKit says indoor (PROVISIONAL, OPEN-2: the engine's neutral measurement, excluded from sizing);
    /// GPS when a route is associated and the workout is not indoor; otherwise omitted (the device stated nothing).
    public static func measurement(_ w: WorkoutSnapshot) -> DeviceMeasurement? {
        if w.indoor == true { return .treadmill }
        if w.hasRoute { return .gps }
        return nil
    }

    /// `sourceQuality` (PROVISIONAL, OPEN-3, reviewed at integration by SSCTR + Engineering): WEARABLE_FULL when HealthKit gives a positive
    /// duration, a positive distance and a way it was measured (a route, or indoor); otherwise WEARABLE_PARTIAL. Never omitted, because an
    /// absent one is read by the boundary as WEARABLE_FULL.
    public static func sourceQuality(_ w: WorkoutSnapshot) -> DeviceSourceQuality {
        minutes(w.durationSeconds) != nil && kilometres(w.distanceMeters) != nil && measurement(w) != nil ? .wearableFull : .wearablePartial
    }

    /// The DEVICE observation of a selected run, without a session link (the link is decided at delivery, contract §4.3). `gpsQuality` is
    /// always omitted: HealthKit does not expose it. Nothing missing becomes 0 or a default (DR-118).
    public static func activity(_ w: WorkoutSnapshot) -> DeviceActivity {
        DeviceActivity(activityId: w.id, activityType: .run, sessionId: nil,
                       observedAt: BoundaryInstant.string(w.end, offsetSeconds: offsetSeconds(w)),
                       actual: DeviceActual(completed: true, minutes: minutes(w.durationSeconds), distanceKm: kilometres(w.distanceMeters),
                                            measurement: measurement(w), gpsQuality: nil),
                       sourceQuality: sourceQuality(w))
    }

    /// The history-only summary of a non-run workout: duration and provenance, nothing else (G-4, GAP-18).
    public static func summary(_ w: WorkoutSnapshot) -> ImportedWorkoutSummary {
        ImportedWorkoutSummary(id: w.id, activityKind: WorkoutKind.code(w.activityTypeRaw), start: w.start, end: w.end,
                               durationSeconds: w.durationSeconds, sourceName: w.sourceName)
    }

    /// B's ledger digest of a delivered workout: the facts the boundary digests (`sessionId`, `observedAt`, `actual`), canonical JSON with
    /// sorted keys. `sourceQuality` is outside it, as at the boundary (contract §4.1 item 5). Not a secret, so no keyed hash is needed.
    public static func digest(_ a: DeviceActivity) -> String {
        struct Facts: Encodable { let sessionId: String?; let observedAt: String; let actual: DeviceActual }
        let e = JSONEncoder(); e.outputFormatting = [.sortedKeys]
        return (try? String(data: e.encode(Facts(sessionId: a.sessionId, observedAt: a.observedAt, actual: a.actual)), encoding: .utf8)) ?? ""
    }
}
