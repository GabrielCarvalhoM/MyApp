import Foundation

/// `api.history().history` (`views.mjs historyView`). Frozen and minimal: per linked session only date, completed and minutes. Unlinked device
/// runs, distances, paces, sets and loads are not in it: `LoggedEntry` (the shared facade projection) is the history the screens use.
public struct HistoryView: Decodable, Equatable, Sendable {
    public let version: Int
    public let sessions: [HistorySession]
    public let facts: [HistoryFact]
    public let erasedSlots: Int
    public let decisions: [HistoryDecision]
}
public struct HistorySession: Decodable, Equatable, Sendable {
    public let eventId: String
    public let sessionId: String
    public let date: String
    public let completed: Bool
    public let minutes: Double?
}
public struct HistoryFact: Decodable, Equatable, Sendable {
    /// CLINICAL_HOLD, READINESS_DECLARED, ... (F08 rows summarised by type only).
    public let fact: Code
    public let eventId: String
    public let at: String?
}
public struct HistoryDecision: Decodable, Equatable, Sendable {
    public let decisionId: String
    public let kind: Code
    public let at: String
    public let status: Code
    public let action: Code?
    public let reason: EngineText?
    public let guidance: Guidance?
}

/// Every answer: `{ok:true, ...}` or `{ok:false, error, state}`. Only the fields the screens and the host read are typed; the rest is ignored.
public struct BoundaryAnswer: Decodable, Equatable, Sendable {
    public let ok: Bool
    public let version: Int?
    /// A decision status (KEEP, MODIFY, ASK, CLINICAL_HUMAN_REQUIRED, ...) or, for onboarding/restart, PROPOSED / UNSUPPORTED / ASK / INVALID_INPUT.
    public let status: Code?
    public let action: Code?
    public let decisionId: String?
    /// Onboarding: whether a record now exists. `false` with status UNSUPPORTED is a refusal by scope (e.g. SPECIAL_POPULATION_OUTSIDE_V1).
    public let enrolled: Bool?
    public let reason: EngineText?
    public let missingInputs: [String]?
    /// Reports the decision admitted. NOT proof the record keeps each one as a session (GAP-12): check `LoggedEntries.keeps(_:)`.
    public let recorded: [String]?
    public let notRecorded: [NotRecorded]?
    public let duplicate: Bool?
    /// A retry of a request id already answered: the stored answer, nothing written again.
    public let replayed: Bool?
    public let warningSignScreen: WarningSignScreen?
    /// The names (never the values) of safety content in a refused request: keep the athlete's draft and ask again.
    public let safetyFields: [String]?
    public let view: PlanView?
    public let error: BoundaryError?
    public let state: ClientState?

    /// What an onboarding or restart answer means for the screens (a mapping of the engine's own status; no rule).
    public var planOutcome: PlanOutcome {
        guard ok else { return .failed(error?.code ?? "UNKNOWN") }
        switch status?.raw {
        case "PROPOSED" where enrolled != false: return .planCreated
        case "UNSUPPORTED": return .outsideV1Scope(reason: reason?.english)
        case "ASK": return .needsInput(missingInputs ?? [])
        case "CLINICAL_HUMAN_REQUIRED": return .clinicalHumanRequired
        case "INVALID_INPUT": return .invalidInput
        default: return .unrecognized(status?.raw ?? "")
        }
    }
}
public enum PlanOutcome: Equatable, Sendable {
    case planCreated
    /// No plan is offered: the athlete is outside the V1 coaching scope (special population, age, event). Figma 81 "Plano indisponível ·
    /// sinal informado no cadastro". Never a plan, never "try again later".
    case outsideV1Scope(reason: String?)
    case needsInput([String])
    case clinicalHumanRequired
    case invalidInput
    case failed(Code)
    /// Fail closed: an unknown status is never read as a plan.
    case unrecognized(String)
}
public struct NotRecorded: Decodable, Equatable, Sendable {
    public let eventId: String?
    public let reason: Code
}
public struct BoundaryError: Decodable, Equatable, Sendable, Error {
    /// handoff §7 table: CONFLICT_STALE_VERSION, BUSY, PERSISTENCE_FAILURE, CLOCK_BEHIND_RECORD, BEFORE_RECORD_START, SCREEN_REQUIRED,
    /// RECORD_LOST, RECORD_ROLLED_BACK, INTEGRITY_FAILURE, CONSENT_REQUIRED, GONE, NOT_ENROLLED, SYNTHETIC_ONLY, ...
    public let code: Code
    public let message: EngineText?
    public let index: Int?
    public let field: String?
    /// INVALID_REQUEST of a heart-rate profile or an intake: the fields to fix (codes, e.g. `zoneUpperBpm.strictlyIncreasing`).
    public let fields: [String]?
    /// CONSENT_REQUIRED: the purpose to ask again.
    public let purpose: Code?
    /// CONFLICT_STALE_VERSION: the version the record is at now.
    public let version: Int?
    public init(code: Code, message: EngineText? = nil, index: Int? = nil, field: String? = nil, fields: [String]? = nil, purpose: Code? = nil, version: Int? = nil) {
        self.code = code; self.message = message; self.index = index; self.field = field; self.fields = fields; self.purpose = purpose; self.version = version
    }
    enum CodingKeys: String, CodingKey { case code, message, index, field, fields, purpose, version }
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        code = try c.decode(Code.self, forKey: .code); message = try c.decodeIfPresent(EngineText.self, forKey: .message)
        index = try c.decodeIfPresent(Int.self, forKey: .index); field = try c.decodeIfPresent(String.self, forKey: .field)
        // `fields` is a list of names; a count-only refusal (custody "n fields are not part of a review") has none.
        fields = (try? c.decodeIfPresent([String].self, forKey: .fields)) ?? nil
        purpose = try c.decodeIfPresent(Code.self, forKey: .purpose); version = try c.decodeIfPresent(Int.self, forKey: .version)
    }
}

/// The shared facade projection `loggedEntries` (CHG-UI-2 2.1, GAP-06/GAP-12): the athlete's sessions as the record keeps them. The record stays
/// the single source; the UI keeps no second copy (G07: an erasure reaches every layer).
public struct LoggedEntries: Decodable, Equatable, Sendable {
    public let projections: String
    public let entries: [LoggedEntry]
    /// Whether the record keeps the report `eventId` as its own session (its own row, or a voice of a PLANNED session). The ONLY basis for a
    /// "salvo" / "saved" confirmation of a report (GAP-12): the answer's `recorded` is not. Same rule as `keepsReport` of the facade.
    public func keeps(_ eventId: String) -> Bool {
        entries.contains { $0.eventId == eventId || (!$0.unplanned && $0.voices.contains { $0.eventId == eventId }) }
    }
}
public struct LoggedEntry: Decodable, Equatable, Sendable, Identifiable {
    public var id: String { eventId }
    public let eventId: String
    /// Nil for an unplanned report or an unlinked device run.
    public let sessionId: String?
    /// The plan-local day.
    public let date: String
    public let observedAt: String?
    /// ATHLETE and/or DEVICE: who reported this session (both when the device and the athlete reported one planned session, O-1).
    public let channels: [Code]
    public let sport: Code?
    public let unplanned: Bool
    public let completed: Bool
    public let minutes: Double?
    /// The distance a device measured (DEVICE voice). Never the athlete's.
    public let measuredKm: Double?
    /// The distance the athlete declared (ATHLETE voice). Never shown as measured.
    public let declaredKm: Double?
    /// The athlete contested the measured distance (`declared`).
    public let contested: ContestedDistanceEntry?
    /// GPS, TRACK, TREADMILL, ... (device) or nil.
    public let measurement: Code?
    public let gpsQuality: Code?
    public let rpe: Double?
    public let stopReason: Code?
    public let exercises: [LoggedExercise]?
    public let response: LoggedResponse?
    public let voices: [LoggedVoice]
    /// FND-ABC-01: two unplanned reports of the same day and instant kept as this one row by the engine. Show the row as kept; never present the
    /// reports inside it as separate saved sessions.
    public let unplannedMerge: Bool
    /// A corrected report stays as history; the screens show the report in force.
    public let superseded: Bool
    public let correctionOf: String?
    public let conflicted: Bool
}
public struct ContestedDistanceEntry: Decodable, Equatable, Sendable {
    public let distanceKm: Double
    public let reason: Code?
}
public struct LoggedVoice: Decodable, Equatable, Sendable {
    public let eventId: String
    public let channel: Code
    public let completed: Bool
    public let minutes: Double?
    public let measuredKm: Double?
    public let declaredKm: Double?
    public let measurement: Code?
    public let gpsQuality: Code?
    public let rpe: Double?
    /// The athlete's stop, in this voice (QRE-ABC-01: a conflicted row shows each voice, never only the top line).
    public let stopReason: Code?
    public let exercises: [LoggedExercise]?
    public let response: LoggedResponse?
}
public struct LoggedResponse: Decodable, Equatable, Sendable {
    public let performance: Code?
    public let recovery: Code?
    public let effort: Code?
    public let nextDayFunction: Code?
}
public struct LoggedExercise: Decodable, Equatable, Sendable {
    public let id: String
    public let sets: [LoggedSet]
}
public struct LoggedSet: Decodable, Equatable, Sendable {
    public let reps: Int?
    public let load: LoggedLoad?
    public let rir: Double?
}
public struct LoggedLoad: Decodable, Equatable, Sendable {
    public let value: Double
    /// KG or LB, as logged: never converted silently.
    public let unit: Code
    public let convention: Code?
}

/// The shared facade projection `weekPlan` (CHG-UI-2 2.2, GAP-07): each week's phase and planned volume as the plan holds them.
public struct WeekPlanProjection: Decodable, Equatable, Sendable {
    public let programHash: String?
    public let startDate: String?
    public let weeks: [WeekPlanEntry]
    /// CCP-ONB-1 (RM-APP-PROJECTIONS-2, additive): how the engine planned a marathon goal; `nil` = no marathon goal, or an earlier projection.
    public let marathon: MarathonPlanReading?
}
public struct WeekPlanEntry: Decodable, Equatable, Sendable {
    public let index: Int
    public let startDate: String?
    /// ESTABLISHMENT, BUILD, CONSOLIDATION, SPECIFIC, TAPER, RACE_WEEK (copy by code). Nil when the plan holds none: no phase is shown.
    public let phase: Code?
    public let plannedRunMinutes: Double?
    public let plannedStrengthSets: Double?
    /// PAST, CURRENT, AHEAD (relative to the plan-local today).
    public let timing: Code?
}

/// The shared facade projection `timeInZones` (mission phase 6.3): the engine's classifier over one authorised heart-rate series, gated until the
/// series channel is reviewed (SSCTR C10). `status` UNAVAILABLE with a reason is the normal V1 state; the UI then shows no distribution.
public struct TimeInZoneReading: Decodable, Equatable, Sendable {
    public let status: Code
    public let reason: Code?
    /// Seconds per zone (Z1..Z5), only when AVAILABLE.
    public let seconds: [String: Double]?
    public let coveredSeconds: Double?
    public let unknownSeconds: Double?
    public let coverage: Double?
    public let sensor: Code?
    public let source: String?
    /// Always false: a distribution is never derived from an average heart rate.
    public let fromAverageHeartRate: Bool
}
