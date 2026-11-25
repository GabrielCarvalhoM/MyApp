import Foundation

// V1HR5 CONTRACT DELTA (2026-11-25), additive over the CHG-UI-1 proposal: `runCalibration.heartRateFiveZones`. Not a shared contract until the
// A/B/C integration mission incorporates it (audits/v1-five-zone-heart-rate-2026-11-25/CONTRACT_DELTA.md). Foundation only.
//
// Rules a screen keeps (the engine's, restated so a reader sees them where the type is used):
// - Show zones only when `status == "AVAILABLE"`, and exactly `zones` (never recomputed from `reference.bpm`, never from age).
// - `nil` (the key absent) means "not computed by this engine version" (a record stored before the amendment): it is NOT "no zones".
// - Heart rate is never the primary guidance: `primaryGuidance`, `sessionTarget`, `gatesProgression`, `convertedToPaceOrEffort` are false.
//   The effort cue stays the prescription of every session; a session's `heartRate` role can only suggest slowing (`neverSpeedUp`).
// - Intervals are [fromBpm, toBpm): `fromBpm == nil` is open below (Z1), `toBpm == nil` open above (Z5).
public struct HeartRateFiveZones: Decodable, Equatable, Sendable {
    public let version: String?
    public let model: String?
    public let status: Code
    public let reason: Code?
    public let method: Code?
    public let basis: Code?
    public let estimated: Bool?
    public let reference: HeartRateReference?
    public let referenceConfidence: Code?
    public let zoneModelConfidence: Code?
    public let conflict: HeartRateConflict?
    public let convention: Code?
    public let zones: [FiveZone]?
    /// The approved three domains each zone belongs to: LOW = Z1, Z2; MODERATE = Z3; HIGH = Z4, Z5.
    public let domains: [String: [String]]?
    public let primaryGuidance: Bool?
    public let sessionTarget: Bool?
    public let gatesProgression: Bool?
    public let convertedToPaceOrEffort: Bool?
    /// Time in zone: UNAVAILABLE in V1 (NO_HEART_RATE_SERIES_IN_CONTRACT); never derived from an average heart rate.
    public let sessionDistribution: StatusAndReason?
    public let ageFormula: Code?
    /// Codes of the copy a screen shows beside the zones (ZONES, OBSERVED_MAXIMUM | LAB_MEASURED_MAXIMUM, NEWER_RUNNER, REFERENCE_CONFLICT);
    /// the wording is Product's, the meaning the engine's values file (`disclosures`).
    public let disclosures: [Code]?
    /// The heart-rate role of each planned run session, by session id.
    public let sessions: [String: SessionHeartRate]?
}
public struct HeartRateReference: Decodable, Equatable, Sendable {
    /// LAB_MEASURED_MAXIMUM or OBSERVED_MAXIMUM.
    public let kind: Code
    public let bpm: Int
    public let evidenceId: String?
    public let evidenceKind: Code?
    public let date: String?
    public let ageDays: Int?
    public let sensor: String?
    public let protocolName: String?
    public let source: String?
    public let modality: String?
    public let checkedByTheApp: Bool?
    enum CodingKeys: String, CodingKey { case kind, bpm, evidenceId, evidenceKind, date, ageDays, sensor, protocolName = "protocol", source, modality, checkedByTheApp }
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
    /// LOW, MODERATE or HIGH.
    public let domain: Code
    public let fromBpm: Int?
    public let toBpm: Int?
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
    public let family: Code?
    public let week: Int?
    public let provisional: Bool?
}
