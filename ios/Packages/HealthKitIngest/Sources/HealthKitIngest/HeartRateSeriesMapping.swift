import Foundation
import IntegrationContracts

/// One `HKQuantitySample` of `heartRate`, as HealthKit gives it (read only in the Simulator in this phase: G-1 / GAP-17).
public struct RawHeartRateSample: Sendable, Equatable {
    public let start: Date
    public let end: Date
    /// Count/min, as HealthKit gives it (a fraction is kept: the engine rounds).
    public let bpm: Double
    public let sourceBundleId: String?
    /// `HKDevice.model` (e.g. "Watch"), nil when HealthKit has no device.
    public let deviceModel: String?
    /// Only when HealthKit itself marks the sample as an artifact. HealthKit has no such key for heart rate today, so the reader passes nil.
    public let artifact: Bool?
    public init(start: Date, end: Date, bpm: Double, sourceBundleId: String?, deviceModel: String?, artifact: Bool? = nil) {
        self.start = start; self.end = end; self.bpm = bpm; self.sourceBundleId = sourceBundleId; self.deviceModel = deviceModel; self.artifact = artifact
    }
}

/// Handoff item 17: samples of a workout's interval → `HeartRateSeries`, the engine classifier's input. B maps and validates; it never
/// classifies, never interpolates, never fills a gap, never derives from an average, never downsamples, and holds no zone table.
public enum HeartRateSeriesMapping {
    /// The sensor class of one sample, never guessed: an Apple Watch (an Apple source whose device model is "Watch") is OPTICAL; anything
    /// else, including a strap paired through another app and a sample with no device, is UNKNOWN (which the engine does not qualify).
    public static func sensorClass(_ s: RawHeartRateSample) -> HeartRateSensorClass {
        if let b = s.sourceBundleId, WorkoutNormalizer.isAppleSource(b), s.deviceModel == "Watch" { return .optical }
        return .unknown
    }

    /// Samples whose start lies inside [start, end] of the workout, in time order (ties keep HealthKit's order), `t` = seconds from the
    /// workout's start, bpm as given. One sensor class for the whole series only when every sample has it; otherwise UNKNOWN. The source is
    /// the samples' common source bundle, nil when they differ. More than `HeartRateSeries.maxSamples` is refused, never thinned.
    public static func series(activityId: String, workoutStart: Date, workoutEnd: Date,
                              samples: [RawHeartRateSample]) -> Result<HeartRateSeries, HeartRateSeries.Invalid> {
        let duration = max(0, workoutEnd.timeIntervalSince(workoutStart))
        let inside = samples.enumerated()
            .filter { $0.element.start >= workoutStart && $0.element.start <= workoutEnd }
            .sorted { ($0.element.start, $0.offset) < ($1.element.start, $1.offset) }
            .map(\.element)
        let classes = Set(inside.map(sensorClass))
        let sensor: HeartRateSensorClass = classes.count == 1 ? classes.first! : .unknown
        let sources = Set(inside.map { $0.sourceBundleId ?? "" })
        let source = sources.count == 1 && !(sources.first!.isEmpty) ? sources.first : nil
        do {
            return .success(try HeartRateSeries(activityId: activityId, sensor: sensor, source: source, durationSeconds: duration,
                                                 samples: inside.map { HeartRateSample(t: $0.start.timeIntervalSince(workoutStart), bpm: $0.bpm, artifact: $0.artifact) }))
        } catch let e as HeartRateSeries.Invalid { return .failure(e) } catch { return .failure(.empty) }
    }
}

/// `HeartRateSeriesSource` for V1: the heart-rate read permission is not decided (G-1 / GAP-17), so every workout answers NOT_IN_V1 and
/// nothing is read. The mapping above is prepared and tested only with synthetic Simulator data.
public final class HeartRateSeriesNotInV1: HeartRateSeriesSource {
    public init() {}
    public func heartRateSeries(activityId: String) async -> HeartRateSeriesResult { .unavailable(reason: IngestCode.notInV1) }
}

/// `HealthSignalSource` for V1: resting heart rate, HRV and sleep are not approved for display (FDR + SEC, GAP-17): always `.notInV1`.
public final class HealthSignalsNotInV1: HealthSignalSource {
    public init() {}
    public func signals(_ kind: HealthSignalKind, in window: DateInterval) async -> HealthSignalAvailability { .notInV1 }
}
