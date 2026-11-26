import Foundation

// The athlete's session reports (channel ATHLETE, `OBSERVATION_KEYS.ATHLETE`: sessionId, occurrenceDate, observedAt, actual, response,
// correctionOf). Closed: a report carries only what the athlete states; a measured distance, a GPS quality or a heart rate is never the
// athlete's (those are the device channel's, IntegrationContracts.DeviceActual). Enumerations are the frozen ones (RequestSchemaTests).

/// `RUN_FORMATS_V1.json runFacts.stops.reasons`.
public enum StopReason: String, Codable, CaseIterable, Sendable {
    case symptom = "SYMPTOM", fatigue = "FATIGUE", pacing = "PACING", conditions = "CONDITIONS", time = "TIME", choice = "CHOICE", other = "OTHER"
}
/// `RUN_FORMATS_V1.json runFacts.declaredFailureReasons`: why the athlete contests a distance the device measured.
public enum DeclaredDistanceReason: String, Codable, CaseIterable, Sendable {
    case signalLoss = "SIGNAL_LOSS", obstructedSky = "OBSTRUCTED_SKY", autoPause = "AUTO_PAUSE", deviceRestart = "DEVICE_RESTART"
}
/// `r6-provenance.mjs RESPONSE`. Unknown is `.unknown`, never omitted when the form asked.
public enum PerformanceResponse: String, Codable, CaseIterable, Sendable { case compatible = "COMPATIBLE", under = "UNDER", over = "OVER", unknown = "UNKNOWN" }
public enum RecoveryResponse: String, Codable, CaseIterable, Sendable { case compatible = "COMPATIBLE", adverse = "ADVERSE", unknown = "UNKNOWN" }
public enum EffortResponse: String, Codable, CaseIterable, Sendable { case onTarget = "ON_TARGET", easier = "EASIER", harder = "HARDER", unknown = "UNKNOWN" }
public enum NextDayFunctionResponse: String, Codable, CaseIterable, Sendable { case normal = "NORMAL", impaired = "IMPAIRED", unknown = "UNKNOWN" }

public struct SessionResponse: Codable, Equatable, Sendable {
    public var performance: PerformanceResponse
    public var recovery: RecoveryResponse
    public var effort: EffortResponse
    public var nextDayFunction: NextDayFunctionResponse
    public init(performance: PerformanceResponse, recovery: RecoveryResponse, effort: EffortResponse, nextDayFunction: NextDayFunctionResponse) {
        self.performance = performance; self.recovery = recovery; self.effort = effort; self.nextDayFunction = nextDayFunction
    }
    public static let unknown = SessionResponse(performance: .unknown, recovery: .unknown, effort: .unknown, nextDayFunction: .unknown)
}

/// `r6-intake.mjs LOAD_CONVENTIONS`.
public enum LoadConvention: String, Codable, CaseIterable, Sendable {
    case total = "TOTAL", perHand = "PER_HAND", singleImplement = "SINGLE_IMPLEMENT", bodyweight = "BODYWEIGHT", machineStack = "MACHINE_STACK"
}
/// As logged: a pound value is converted by the engine (to the nearest 0.5 kg), never by the app.
public enum LoadUnit: String, Codable, CaseIterable, Sendable { case kg = "KG", lb = "LB" }
public struct LoggedLoadEntry: Codable, Equatable, Sendable {
    public var value: Double
    public var unit: LoadUnit
    public var convention: LoadConvention
    public init(value: Double, unit: LoadUnit, convention: LoadConvention) { self.value = value; self.unit = unit; self.convention = convention }
}
public struct LoggedSetEntry: Codable, Equatable, Sendable {
    public var reps: Int
    public var load: LoggedLoadEntry?
    public var rir: Double?
    public init(reps: Int, load: LoggedLoadEntry?, rir: Double?) { self.reps = reps; self.load = load; self.rir = rir }
}
public struct LoggedExerciseEntry: Codable, Equatable, Sendable {
    /// The prescribed exercise id (an exercise outside the prescription is the athlete's statement; GAP-10 / CHG-UI-2 2.10).
    public var id: String
    public var sets: [LoggedSetEntry]
    public init(id: String, sets: [LoggedSetEntry]) { self.id = id; self.sets = sets }
}

/// What the athlete states of a PLANNED run (its session id is set).
public struct PlannedRunActual: Codable, Equatable, Sendable {
    public var completed: Bool
    public var minutes: Double?
    public var seconds: Double?
    /// The distance the athlete DECLARES (their own number). A distance the iPhone or a watch measured is never put here (GAP-16).
    public var distanceKm: Double?
    /// 0–10.
    public var rpe: Double?
    /// A stop and its reason. SYMPTOM raises the warning-sign screen (`warningSignScreen: REQUIRED`) for planned runs.
    public var stop: RunStop?
    public var conditions: [String]?
    public var walkBreaks: Bool?
    /// The athlete contests a distance the device measured for this session (`POOR` / `CORRECTED_MEASUREMENT`).
    public var declared: ContestedDistance?
    public init(completed: Bool, minutes: Double? = nil, seconds: Double? = nil, distanceKm: Double? = nil, rpe: Double? = nil, stop: RunStop? = nil,
                conditions: [String]? = nil, walkBreaks: Bool? = nil, declared: ContestedDistance? = nil) {
        self.completed = completed; self.minutes = minutes; self.seconds = seconds; self.distanceKm = distanceKm; self.rpe = rpe; self.stop = stop
        self.conditions = conditions; self.walkBreaks = walkBreaks; self.declared = declared
    }
}
public struct RunStop: Codable, Equatable, Sendable {
    public var reason: StopReason
    public init(reason: StopReason) { self.reason = reason }
}
public struct ContestedDistance: Codable, Equatable, Sendable {
    public var distanceKm: Double
    public var reason: DeclaredDistanceReason
    public init(distanceKm: Double, reason: DeclaredDistanceReason) { self.distanceKm = distanceKm; self.reason = reason }
}
public struct StrengthActual: Codable, Equatable, Sendable {
    public var completed: Bool
    public var minutes: Double?
    public var exercises: [LoggedExerciseEntry]
    public init(completed: Bool, minutes: Double? = nil, exercises: [LoggedExerciseEntry]) { self.completed = completed; self.minutes = minutes; self.exercises = exercises }
}
/// What the athlete states of an UNPLANNED ("avulsa") run. No `stop`: the engine does not read a stop on a run outside the plan (SSCTR-CORE-O-1,
/// V1RWS), so a form that carried one would lose it silently. A symptom during an unplanned run goes through the existing warning-sign flow
/// ("Não estou 100%", `ReviewRequest.notFeeling100`), never through this report (FND-ABC-02).
public struct UnplannedRunActual: Codable, Equatable, Sendable {
    public var completed: Bool
    public var minutes: Double
    public var distanceKm: Double?
    public var rpe: Double?
    public init(completed: Bool, minutes: Double, distanceKm: Double? = nil, rpe: Double? = nil) {
        self.completed = completed; self.minutes = minutes; self.distanceKm = distanceKm; self.rpe = rpe
    }
}

/// One athlete report, in the observation shape the boundary admits. Build it with the static constructors: each encodes exactly the keys of its
/// case. The server assigns the event id; the host sets nothing here.
public struct AthleteObservation: Encodable, Equatable, Sendable {
    public enum Actual: Equatable, Sendable {
        case plannedRun(PlannedRunActual)
        case strength(StrengthActual)
        case unplannedRun(UnplannedRunActual)
        case unplannedStrength(StrengthActual)
    }
    public let sessionId: String?
    public let occurrenceDate: String
    /// The instant the session ended, with its offset (`BoundaryInstant` format). REQUIRED for an unplanned report (GAP-12 / FND-ABC-01: two
    /// unplanned reports of the same day without it are kept as one row by the engine, the later one lost as a session).
    public let observedAt: String?
    public let actual: Actual
    public let response: SessionResponse
    /// The server event id of the report this one corrects (the original stays on record as history).
    public let correctionOf: String?

    public static func plannedRun(sessionId: String, occurrenceDate: String, observedAt: String? = nil, actual: PlannedRunActual, response: SessionResponse) -> Self {
        .init(sessionId: sessionId, occurrenceDate: occurrenceDate, observedAt: observedAt, actual: .plannedRun(actual), response: response, correctionOf: nil)
    }
    public static func plannedStrength(sessionId: String, occurrenceDate: String, observedAt: String? = nil, actual: StrengthActual, response: SessionResponse) -> Self {
        .init(sessionId: sessionId, occurrenceDate: occurrenceDate, observedAt: observedAt, actual: .strength(actual), response: response, correctionOf: nil)
    }
    public static func unplannedRun(occurrenceDate: String, observedAt: String, actual: UnplannedRunActual, response: SessionResponse) -> Self {
        .init(sessionId: nil, occurrenceDate: occurrenceDate, observedAt: observedAt, actual: .unplannedRun(actual), response: response, correctionOf: nil)
    }
    public static func unplannedStrength(occurrenceDate: String, observedAt: String, actual: StrengthActual, response: SessionResponse) -> Self {
        .init(sessionId: nil, occurrenceDate: occurrenceDate, observedAt: observedAt, actual: .unplannedStrength(actual), response: response, correctionOf: nil)
    }
    /// A correction: the whole report in force again, naming the event id it replaces (R7-A). Only the athlete's own report can be corrected
    /// this way; a device workout is contested with `PlannedRunActual.declared` (NATIVE 7.5).
    public func correcting(eventId: String) -> Self {
        .init(sessionId: sessionId, occurrenceDate: occurrenceDate, observedAt: observedAt, actual: actual, response: response, correctionOf: eventId)
    }

    enum CodingKeys: String, CodingKey { case sessionId, occurrenceDate, observedAt, actual, response, correctionOf }
    private struct SportTagged<T: Encodable>: Encodable {
        let sport: String; let body: T
        enum K: String, CodingKey { case sport }
        func encode(to encoder: Encoder) throws { try body.encode(to: encoder); var c = encoder.container(keyedBy: K.self); try c.encode(sport, forKey: .sport) }
    }
    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        try c.encodeIfPresent(sessionId, forKey: .sessionId)
        try c.encode(occurrenceDate, forKey: .occurrenceDate)
        try c.encodeIfPresent(observedAt, forKey: .observedAt)
        switch actual {
        case .plannedRun(let a): try c.encode(a, forKey: .actual)
        case .strength(let a): try c.encode(a, forKey: .actual)
        // `actual.sport` is how the engine reads a report without a session (SEC-INT-12 correction, CHG-UI-2 2.8).
        case .unplannedRun(let a): try c.encode(SportTagged(sport: "RUN", body: a), forKey: .actual)
        case .unplannedStrength(let a): try c.encode(SportTagged(sport: "STRENGTH", body: a), forKey: .actual)
        }
        try c.encode(response, forKey: .response)
        try c.encodeIfPresent(correctionOf, forKey: .correctionOf)
    }
}
