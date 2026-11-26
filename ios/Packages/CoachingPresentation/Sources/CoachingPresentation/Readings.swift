import Foundation

/// `presentation().readings`: the projections the last answer carried. Each one has its own `status`; a screen shows a value only when its
/// own status says it is available, and otherwise the state the engine names (never a placeholder number).
public struct Readings: Decodable, Equatable, Sendable {
    public let at: String?
    public let warningSignScreen: WarningSignScreen?
    public let runCalibration: RunCalibration?
    public let runForecast: RunForecast?
    public let paceInsights: PaceInsights?
    public let strengthExposure: StrengthExposure?
}

/// REQUIRED: take the athlete to the warning-sign screen (NATIVE 7.1), whatever the plan state.
public struct WarningSignScreen: Decodable, Equatable, Sendable {
    public let status: Code
    public let reason: Code?
    public let sessionIds: [String]?
}

public struct RunCalibration: Decodable, Equatable, Sendable {
    public let status: Code
    public let asOf: String?
    public let capacity: Capacity?
    /// By effort domain (EASY, LONG, RECOVERY, FIVE_K_EFFORT, TEN_K_EFFORT, THRESHOLD_CONTROLLED, HALF_MARATHON_EFFORT, MARATHON_EFFORT).
    public let paceBands: [String: CalibratedPaceBand]?
    public let heartRateZones: HeartRateZones?
    /// V1HR5 (additive): five zones nested in the three domains of `heartRateZones`, with the heart-rate role of each session. `nil` = not computed
    /// by the engine version that produced this reading (never "no zones"); see HeartRateFiveZones.swift.
    public let heartRateFiveZones: HeartRateFiveZones?
    /// Current-capacity estimates by distance (5K, 10K, HALF_MARATHON, MARATHON): range first, central never alone, never a promise.
    public let estimates: [String: DistanceEstimate]?
    /// FUTURE_PROJECTION: UNAVAILABLE in V1 (NO_VALIDATED_PROJECTION_MODEL). The race forecast is `RunForecast`, not this.
    public let projection: StatusOnly?
    /// Results the athlete actually ran (race results, time trials), not estimates.
    public let actualResults: [RunResult]?
    public let historicalBest: [RunResult]?
    /// Whether a field test is offered (71 · Teste de campo): status, reason and progress toward calibration. Never required.
    public let assessment: Assessment?
}
public struct Assessment: Decodable, Equatable, Sendable {
    public let status: Code
    public let reason: Code?
    public let neverRequired: Bool?
}
public struct Capacity: Decodable, Equatable, Sendable {
    public let status: Code
    public let basis: Code?
    public let recency: Code?
    public let confidence: Code?
    public let validUntil: String?
    public let reference: RunResult?
}
public struct CalibratedPaceBand: Decodable, Equatable, Sendable {
    public let status: Code
    public let reason: Code?
    public let fastSecondsPerKm: Double?
    public let slowSecondsPerKm: Double?
    public let ceilingOnly: Bool?
    public let effortGoverns: Bool?
    /// ESTIMATED: say so on screen.
    public let label: Code?
    public let confidence: Code?
    public let validUntil: String?
}
/// AVAILABLE only from lab values as supplied, or three zones (LOW/MODERATE/HIGH) from a chest-strap maximum observed in a race or test
/// (UI_CONTRACT_GAPS GAP-37); otherwise UNAVAILABLE with its reason. A reference scale, never a session target; never an age formula.
public struct HeartRateZones: Decodable, Equatable, Sendable {
    public let status: Code
    public let reason: Code?
    public let basis: Code?
    public let observedMaximumBpm: Double?
    public let zones: [HeartRateZone]?
    public let values: [LabValue]?
}
public struct HeartRateZone: Decodable, Equatable, Sendable {
    public let name: Code
    public let lowBpm: Double?
    public let highBpm: Double?
}
public struct LabValue: Decodable, Equatable, Sendable {
    public let name: String
    public let value: Double
    public let unit: String?
}
public struct DistanceEstimate: Decodable, Equatable, Sendable {
    public let status: Code
    public let reason: Code?
    public let kind: Code?
    public let distanceKm: Double?
    public let lowSeconds: Double?
    public let centralSeconds: Double?
    public let highSeconds: Double?
    /// RANGE_FIRST_CENTRAL_NEVER_ALONE.
    public let display: Code?
    public let confidence: Code?
    public let promise: Bool?
    public let statement: EngineText?
}
public struct RunResult: Decodable, Equatable, Sendable {
    public let id: String?
    public let kind: Code?
    public let date: String?
    public let distanceKm: Double?
    public let seconds: Double?
    public let measurement: Code?
    public let isEstimate: Bool?
}
public struct StatusOnly: Decodable, Equatable, Sendable {
    public let status: Code
    public let reason: Code?
}

/// The race forecast (`v1-race-forecast.mjs`): a plan scenario ("if you follow the plan from now on"), and an observed forecast once there is
/// enough history. A plausibility envelope, not a probability; never a goal, never a record.
public struct RunForecast: Decodable, Equatable, Sendable {
    public let status: Code
    public let reason: Code?
    public let event: RaceEvent?
    public let current: SecondsRange?
    /// e.g. PLAN_SCENARIO_ONLY.
    public let display: Code?
    public let confidence: Code?
    public let planScenario: ForecastPart?
    public let observedForecast: ForecastPart?
    public let raceWeek: StatusOnly?
}
public struct SecondsRange: Decodable, Equatable, Sendable {
    public let lowSeconds: Double
    public let centralSeconds: Double
    public let highSeconds: Double
    public let confidence: Code?
}
public struct ForecastPart: Decodable, Equatable, Sendable {
    public let kind: Code
    public let status: Code
    public let reason: Code?
    public let lowSeconds: Double?
    public let centralSeconds: Double?
    public let highSeconds: Double?
    public let conditionalOn: Code?
    /// How many more weeks of history are needed (observed forecast).
    public let needed: Int?
    public let statement: EngineText?
}

/// Pace insights per effort domain: INFORMATIVE_ONLY; they change no capacity, estimate or forecast.
public struct PaceInsights: Decodable, Equatable, Sendable {
    public let status: Code
    public let heartRateInput: Bool?
    public let domains: [String: PaceInsightDomain]?
}
public struct PaceInsightDomain: Decodable, Equatable, Sendable {
    /// e.g. INSUFFICIENT_DATA.
    public let state: Code
    public let votes: Int?
    public let median: Double?
    public let action: Code?
}

/// Weekly working sets per primary muscle, planned and logged: descriptive only, never a target or a recommendation.
/// FND-HR5-03 (closed here): under a hold or with no prescription the engine answers `{status: NOT_APPLICABLE, reason: NO_PRESCRIPTION}` with no
/// `descriptiveOnly` and no sides, so both are optional. The reading is descriptive in every state: `isDescriptiveOnly` is never false, and a
/// missing flag never makes it a target.
public struct StrengthExposure: Decodable, Equatable, Sendable {
    public let status: Code
    public let reason: Code?
    public let descriptiveOnly: Bool?
    public var isDescriptiveOnly: Bool { descriptiveOnly ?? true }
    public let weekIndex: Int?
    public let unit: Code?
    public let planned: ExposureSide?
    public let executed: ExposureSide?
}
public struct ExposureSide: Decodable, Equatable, Sendable {
    public let basis: Code?
    public let byPrimaryMuscle: [String: Double]?
    public let sessionsPlanned: Int?
    public let sessionsReported: Int?
    public let imputed: Bool?
}
