import Foundation

// V1HR5 CONTRACT DELTA (2026-11-25), additive over the CHG-UI-1 proposal: `runCalibration.heartRateFiveZones`; corrected by V1HR5R (the same
// day, Founder decision FOUNDER-HR5-RUNNA-PARITY-2026-11-25: revision 2, V1X-HR-FIVE-ZONE-2, five zones for every valid age). Not a shared contract
// until the A/B/C integration mission incorporates it (audits/v1-hr5-runna-parity-2026-11-25/CONTRACT_DELTA.md). Foundation only.
// Every field revision 2 adds is optional, so a revision-1 reading (a record stored under the first amendment) still decodes.
//
// Rules a screen keeps (the engine's, restated so a reader sees them where the type is used):
// - Show zones only when `status == "AVAILABLE"`, and exactly `zones` (never recomputed from `reference.bpm` or the age on the device). The
//   engine computes them from the athlete's age (220 - age) when nothing better is in force; `reference.kind` and `provenance` say which
//   (AGE_ESTIMATE / ESTIMATED, ATHLETE_DECLARED_MAXIMUM / DECLARED, LAB_MEASURED_MAXIMUM or OBSERVED_MAXIMUM / MEASURED), and
//   `boundarySource` whether the limits are the default percentages or the athlete's own (ATHLETE_CUSTOM). Show `minBpm`...`maxBpm`.
// - SSCTR-HR5R conditions for a screen: one heart-rate cue per session (the five-zone cue replaces the three-zone one where both exist, C7);
//   Z1-Z5 or neutral names, never "Tempo/Threshold/Anaerobic" (C8); a single value is "highest recorded heart rate, in Zx" with its sensor,
//   never time in zone (C9); the age-estimate disclosure keeps the size and direction of its error and "you can enter your own" (C3); no heart
//   rate ever suggests rest, illness or overtraining (C11).
// - The key absent (QRE-HR5-07): read it with `runCalibration.status`. When the run calibration itself is DISABLED, NOT_APPLICABLE or an
//   error (or absent), the amended engine also gives no five-zone key: show no zones. When the run calibration answered (any other status)
//   and the key is absent, the reading was computed by an engine before the amendment (a record stored before it): "not computed", never
//   "no zones". `model` and `sha256` name the version of an answer that has the key.
// - Heart rate is never the primary guidance: `primaryGuidance`, `sessionTarget`, `gatesProgression`, `convertedToPaceOrEffort` are false.
//   The effort cue stays the prescription of every session; a session's `heartRate` role can only suggest slowing (`neverSpeedUp`).
// - Revision 2 gives inclusive whole-bpm limits `minBpm`...`maxBpm` (nil = open: Z1 below, Z5 above) and the same interval as [fromBpm, toBpm).
public struct HeartRateFiveZones: Decodable, Equatable, Sendable {
    public let version: String?
    public let model: String?
    /// The pinned sha256 of the five-zone values the answer used, and the authority that enabled them (CURRENT_INDEPENDENT_REVIEW).
    public let sha256: String?
    public let source: Code?
    public let status: Code
    public let reason: Code?
    public let method: Code?
    public let basis: Code?
    public let estimated: Bool?
    /// Revision 2: ESTIMATED, DECLARED or MEASURED (the reference's own provenance), and where the limits come from.
    public let provenance: Code?
    public let boundarySource: Code?
    public let reference: HeartRateReference?
    public let referenceConfidence: Code?
    public let zoneModelConfidence: Code?
    public let conflict: HeartRateConflict?
    public let convention: Code?
    public let zones: [FiveZone]?
    /// Revision 1 only: the approved three domains each zone belonged to. Revision 2 does not nest (`threeDomains == "NOT_NESTED"`).
    public let domains: [String: [String]]?
    public let threeDomains: Code?
    /// Every candidate reference not used, with why (REFERENCE_CONFLICT, OBSERVED_NOT_ABOVE_THE_AGE_ESTIMATE, ATHLETE_DECLARED_MAXIMUM_IN_FORCE, ...).
    public let notUsed: [HeartRateNotUsed]?
    /// The week's measured references as read (shown beside a declared or estimated maximum, SSCTR C1/C2), and the athlete's profile in force.
    public let measuredReferences: MeasuredHeartRateReferences?
    public let profile: HeartRateProfileSummary?
    /// Single measured values classified one by one (never a distribution), with their sensor.
    public let measurements: [HeartRateMeasurement]?
    public let measuredHeartRate: StatusAndReason?
    /// Never assumed from a synced watch (UNAVAILABLE in V1).
    public let liveHeartRate: StatusAndReason?
    public let changesThePlan: Bool?
    public let medicalEvidence: Bool?
    public let releasesASafetyBlock: Bool?
    /// AGE_OUTSIDE_ESTIMATE_RANGE: the age in force is past 80 (no estimate; a declared or measured maximum still gives zones).
    public let ageOutsideEstimateRange: Bool?
    public let customLimitsReachTheMaximum: Bool?
    public let primaryGuidance: Bool?
    public let sessionTarget: Bool?
    public let gatesProgression: Bool?
    public let convertedToPaceOrEffort: Bool?
    /// Time in zone: UNAVAILABLE in V1 (NO_HEART_RATE_SERIES_IN_CONTRACT); never derived from an average heart rate.
    public let sessionDistribution: StatusAndReason?
    public let ageFormula: Code?
    /// NOT_THRESHOLDS, FIXED_FRACTIONS_OF_A_MAXIMUM, and OBSERVED_MAXIMUM_MAY_BE_BELOW_TRUE_MAXIMUM or NOT_CHECKED_BY_THE_APP.
    public let notes: [Code]?
    /// Codes of the copy a screen shows beside the zones (ZONES, OBSERVED_MAXIMUM | LAB_MEASURED_MAXIMUM, NEWER_RUNNER, REFERENCE_CONFLICT);
    /// the wording is Product's, the meaning the engine's values file (`disclosures`).
    public let disclosures: [Code]?
    /// The heart-rate role of each planned run session, by session id.
    public let sessions: [String: SessionHeartRate]?
}
public struct HeartRateReference: Decodable, Equatable, Sendable {
    /// AGE_ESTIMATE, ATHLETE_DECLARED_MAXIMUM, LAB_MEASURED_MAXIMUM or OBSERVED_MAXIMUM.
    public let kind: Code
    public let bpm: Int
    public let provenance: Code?
    /// AGE_ESTIMATE: the formula and the age it used (the age in force, the age declared, the day declared).
    public let formula: Code?
    public let ageYears: Int?
    public let ageDeclared: Int?
    public let ageDeclaredOn: String?
    /// ATHLETE_DECLARED_MAXIMUM: when the athlete entered it.
    public let declaredAt: String?
    public let evidenceId: String?
    public let evidenceKind: Code?
    public let date: String?
    public let ageDays: Int?
    public let sensor: String?
    public let protocolName: String?
    public let source: String?
    public let modality: String?
    public let checkedByTheApp: Bool?
    enum CodingKeys: String, CodingKey { case kind, bpm, provenance, formula, ageYears, ageDeclared, ageDeclaredOn, declaredAt, evidenceId, evidenceKind, date, ageDays, sensor, protocolName = "protocol", source, modality, checkedByTheApp }
}
/// REFERENCE_CONFLICT (the five zones are UNAVAILABLE then): a chest-strap maximum more than `bandBpm` above the lab maximum. Both are shown.
public struct HeartRateConflict: Decodable, Equatable, Sendable {
    public let status: Code
    public let labMaxBpm: Int
    public let labDate: String?
    public let labEvidenceId: String?
    public let observedMaxBpm: Int
    public let observedDate: String?
    public let observedEvidenceId: String?
    public let differenceBpm: Int
    public let bandBpm: Int
}
public struct FiveZone: Decodable, Equatable, Sendable {
    /// Z1 ... Z5.
    public let zone: Code
    /// Revision 1 only (LOW, MODERATE or HIGH); absent in revision 2.
    public let domain: Code?
    public let fromBpm: Int?
    public let toBpm: Int?
    /// Revision 2: inclusive whole-bpm limits and the percentages of the maximum (nil for the athlete's custom limits).
    public let minBpm: Int?
    public let maxBpm: Int?
    public let abovePercent: Int?
    public let upToPercent: Int?
}
public struct HeartRateNotUsed: Decodable, Equatable, Sendable {
    public let kind: Code
    public let bpm: Int?
    public let reason: Code
}
public struct MeasuredHeartRateReferences: Decodable, Equatable, Sendable {
    public let status: Code
    public let reason: Code?
    public let lab: HeartRateReference?
    public let observed: HeartRateReference?
    public let conflict: HeartRateConflict?
}
public struct HeartRateProfileSummary: Decodable, Equatable, Sendable {
    public let ageYears: Int?
    public let ageDeclared: Int?
    public let ageDeclaredOn: String?
    public let declaredMaximumBpm: Int?
    public let customZoneUpperBpm: [Int]?
}
public struct HeartRateMeasurement: Decodable, Equatable, Sendable {
    public let evidenceId: String
    public let date: String?
    public let kind: Code
    public let bpm: Int
    public let sensor: String?
    public let zone: Code?
    public let singleValue: Bool
    public let isADistribution: Bool
}
/// What the integration's `setHeartRateProfile` and `eraseHeartRateProfile` answer (no plan, no decision: the athlete's own maximum and
/// limits). Both need COACHING consent (CONSENT_REQUIRED otherwise); a refusal names the `fields` to fix.
public struct HeartRateProfileAnswer: Decodable, Equatable, Sendable {
    public struct Recorded: Decodable, Equatable, Sendable { public let added: [String]; public let unchanged: [String] }
    public let ok: Bool
    public let version: Int?
    public let replayed: Bool?
    public let heartRateProfile: Recorded?
    /// eraseHeartRateProfile: the ids of the athlete's rows erased (the intake age stays).
    public let erased: [String]?
    public let fiveZones: StatusAndReason?
}
/// The request a screen sends (null clears): a whole bpm 120-230, and/or the highest whole bpm of Z1-Z4, strictly increasing, 60-230.
public struct HeartRateProfileRequest: Encodable, Equatable, Sendable {
    public var maxHeartRateBpm: Int??
    public var zoneUpperBpm: [Int]??
    public init(maxHeartRateBpm: Int?? = .none, zoneUpperBpm: [Int]?? = .none) { self.maxHeartRateBpm = maxHeartRateBpm; self.zoneUpperBpm = zoneUpperBpm }
    enum CodingKeys: String, CodingKey { case maxHeartRateBpm, zoneUpperBpm }
    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        if let m = maxHeartRateBpm { if let v = m { try c.encode(v, forKey: .maxHeartRateBpm) } else { try c.encodeNil(forKey: .maxHeartRateBpm) } }
        if let z = zoneUpperBpm { if let v = z { try c.encode(v, forKey: .zoneUpperBpm) } else { try c.encodeNil(forKey: .zoneUpperBpm) } }
    }
}
public struct StatusAndReason: Decodable, Equatable, Sendable {
    public let status: Code
    public let reason: Code?
}
public struct SessionHeartRate: Decodable, Equatable, Sendable {
    /// COMPLEMENTARY_CEILING_CUE, NO_HEART_RATE_GUIDANCE or NONE. Never a primary role in V1.
    public let role: Code
    public let reason: Code?
    public let primary: Bool
    public let effortGoverns: Bool
    public let slowDownCueFromZone: Code?
    public let slowDownCueAtOrAboveBpm: Int?
    public let neverSpeedUp: Bool?
    public let sustainedReadingOnly: Bool?
    public let healthMeaning: Bool?
    /// CUE when the session shows the slow-down cue (the copy code of the values file).
    public let disclosure: Code?
    /// Revision 2: the reference kind and limit source the cue was set from.
    public let reference: Code?
    public let boundarySource: Code?
    /// The strides of an easy run have their own role (NO_HEART_RATE_GUIDANCE): the cue never applies to them.
    public let strides: StridesHeartRate?
    public let family: Code?
    public let week: Int?
    public let provisional: Bool?
}
public struct StridesHeartRate: Decodable, Equatable, Sendable {
    public let role: Code
    public let reason: Code?
    public let primary: Bool
    public let effortGoverns: Bool
}
