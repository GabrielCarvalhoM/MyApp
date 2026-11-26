import CoachingPresentation
import Foundation
import IntegrationContracts

/// One step of the session as the engine prescribes it, flattened from `RunSessionPresentation.blocks` (repeats expanded). A step is timed OR
/// measured by distance, exactly as prescribed: the recorder never converts one into the other.
public struct RecorderStep: Codable, Equatable, Sendable {
    public enum Target: Codable, Equatable, Sendable { case seconds(Double), metres(Double) }
    public let kind: String
    public let target: Target
    public init(kind: String, target: Target) { self.kind = kind; self.target = target }

    /// The steps of a presentation, or `[]` when it has none (e.g. under a hold: nothing to run, nothing timed).
    public static func steps(of presentation: RunSessionPresentation?) -> [RecorderStep] {
        (presentation?.blocks ?? []).flatMap { block in
            (0..<max(1, block.repeat_)).flatMap { _ in
                block.steps.compactMap { s -> RecorderStep? in
                    if s.target.type.raw == "TIME", let sec = s.target.seconds { return RecorderStep(kind: s.kind.raw, target: .seconds(sec)) }
                    if s.target.type.raw == "DISTANCE", let m = s.target.metres { return RecorderStep(kind: s.kind.raw, target: .metres(m)) }
                    return nil
                }
            }
        }
    }
}

/// A location fix as the recorder keeps it (local only; erased with the account).
public struct Fix: Codable, Equatable, Sendable {
    public let t: Date
    public let lat: Double
    public let lon: Double
    public let horizontalAccuracy: Double
    /// The running segment the fix belongs to: distance is never counted across a pause.
    public var segment: Int
    public init(t: Date, lat: Double, lon: Double, horizontalAccuracy: Double, segment: Int = 0) {
        self.t = t; self.lat = lat; self.lon = lon; self.horizontalAccuracy = horizontalAccuracy; self.segment = segment
    }
}

/// What the location layer can honestly say. None of these blocks a run by time.
public enum LocationState: String, Codable, Equatable, Sendable {
    case notRequested = "NOT_REQUESTED"
    case denied = "DENIED"
    case noSignal = "NO_SIGNAL"
    case poorAccuracy = "POOR_ACCURACY"
    case good = "GOOD"
}

/// The durable state of one recording, written atomically after every change so a killed process resumes where it was.
public struct RecordingState: Codable, Equatable, Sendable {
    public enum Phase: String, Codable, Sendable { case running, paused, finished }
    public let id: String
    public let sessionId: String?
    /// The plan-local day of the session (nil for an unplanned run).
    public let sessionDate: String?
    public let steps: [RecorderStep]
    public let startedAt: Date
    public var phase: Phase
    /// Moving time accumulated before the current running segment.
    public var accumulated: TimeInterval
    /// When the current running segment began (nil while paused or finished).
    public var segmentStart: Date?
    public var endedAt: Date?
    /// For each distance step (by step index): the measured metres when it began and the moving time when it ended (by the measured
    /// distance or by the athlete's advance when no usable GPS exists). Timed steps after it count from that end, never from a conversion.
    public var distanceStepStart: [Int: Double] = [:]
    public var distanceStepEnd: [Int: TimeInterval] = [:]
    /// Incremented on every resume.
    public var segment: Int
    public var fixes: [Fix]
    public var reportedEventId: String?

    public func movingTime(at now: Date) -> TimeInterval {
        accumulated + (segmentStart.map { max(0, now.timeIntervalSince($0)) } ?? 0)
    }
}

/// The local measurement shown in the summary ("medido pelo iPhone · não usado pelo plano") and used for sharing. Never in a report.
public struct LocalMeasurement: Equatable, Sendable {
    public let distanceMetres: Double?
    public let splitsSeconds: [Double]
    public let route: [Fix]
    /// Average pace over the measured distance, seconds per km; nil without distance.
    public var paceSecondsPerKm: Double? = nil
}

public struct FinishedRecording: Equatable, Sendable {
    public let ref: AppRecordedRunRef
    public let movingMinutes: Double
    public let local: LocalMeasurement
}

enum Geo {
    /// Great-circle distance in metres (haversine, mean Earth radius).
    static func metres(_ a: Fix, _ b: Fix) -> Double {
        let r = 6_371_000.0, p = Double.pi / 180
        let dLat = (b.lat - a.lat) * p, dLon = (b.lon - a.lon) * p
        let h = sin(dLat / 2) * sin(dLat / 2) + cos(a.lat * p) * cos(b.lat * p) * sin(dLon / 2) * sin(dLon / 2)
        return 2 * r * asin(min(1, sqrt(h)))
    }
    /// The fixes the recorder trusts for distance (accuracy ≤ 30 m), the threshold of "precisão ruim".
    static let usableAccuracy = 30.0
    static func distance(_ fixes: [Fix]) -> Double {
        let ok = fixes.filter { $0.horizontalAccuracy >= 0 && $0.horizontalAccuracy <= usableAccuracy }
        return zip(ok, ok.dropFirst()).reduce(0) { $1.0.segment == $1.1.segment ? $0 + metres($1.0, $1.1) : $0 }
    }
}
