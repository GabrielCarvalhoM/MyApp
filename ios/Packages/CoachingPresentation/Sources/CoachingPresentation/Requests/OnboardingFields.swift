import Foundation

// CCP-ONB-1 (#109, Founder 2026-11-27, "APROVADO — Opção A, com revisão técnica obrigatória por campo"): the onboarding answers of the approved
// Figma (`10 · Onboarding`) that the FROZEN engine already reads and the contract did not carry, plus the two readings the engine already
// produces for the plan-ready screen. Additive only: every new key is optional and omitted when `nil`, so every earlier encoding is unchanged.
// Field by field (Figma node, engine path, encoding, absent/nil): audits/v1-ios-integration-2026-11-26/results/i109-ccp-onb/CCP-ONB-1.md.
// No sporting default, no inferred value: what the athlete did not answer is not sent.

/// Figma 26 `836:3194` "Quais cargas você já conhece?": one exercise and the dose the athlete knows (`r6-intake.mjs knownExercise`).
/// The engine reads the load as a STARTING HINT (`loadHint`: the first exposure establishes by effort, the note cites it); it prescribes the
/// known dose itself only when the athlete also states the dose is current, familiar and tolerated, observed in the last 28 days — facts the
/// approved screen does not ask, so this type does not carry them (CCP-ONB-1 §D01: SSCTR/Founder decision, not a default).
public struct KnownExercise: Codable, Equatable, Sendable {
    /// A configuration id of the bound catalog (`r7b-repertoire.mjs`, e.g. `back-squat`). An id outside it is kept as history and not planned;
    /// one whose equipment the athlete did not declare is kept and not planned (both disclosed by the engine).
    public var id: String
    public var sets: Int?
    public var reps: Int?
    /// "sobravam N": repetitions in reserve.
    public var rir: Double?
    /// `nil`: familiar, load not known (the exercise is established in the first week). A pound value is converted by the engine, never here.
    public var load: LoggedLoadEntry?
    public init(id: String, sets: Int?, reps: Int?, rir: Double?, load: LoggedLoadEntry?) {
        self.id = id; self.sets = sets; self.reps = reps; self.rir = rir; self.load = load
    }
}

/// Figma 15 `836:830` "Que treinador combina com você?" → `athlete.coaching` (`v1-coaching.mjs canonicalCoaching`). Volume and difficulty
/// start at the engine's standard ("Volume e dificuldade começam no padrão") and are not asked at onboarding, so only the profile is encoded.
public struct IntakeCoaching: Codable, Equatable, Sendable {
    public var profile: CoachProfile
    public init(profile: CoachProfile) { self.profile = profile }
}
/// `v1-coaching.mjs COACH_PROFILES`: Conservador, Equilibrado, Exigente.
public enum CoachProfile: String, Codable, CaseIterable, Sendable { case conservative = "CONSERVATIVE", balanced = "BALANCED", demanding = "DEMANDING" }

/// Figma 07 `835:2400` → `schedule.temporaryPreference` (`r6-intake.mjs`, read by `r6-balanced.mjs chooseBalanced`): the sport protected when
/// one arrangement must cost the other. "Equilíbrio" has no engine word and is `nil`; on a genuine tie the engine then asks this field.
public enum TemporaryPreference: String, Codable, CaseIterable, Sendable { case run = "RUN", strength = "STRENGTH" }

/// The conditions of a result the athlete can state (Figma 24 "Condições"), in `RUN_CALIBRATION_EXTENSION_V1.json evidence.excludedConditions`.
/// Either one makes the result not comparable (`CONDITIONS_NOT_COMPARABLE`): it is kept and not used for calibration. TRAIL is in the engine's
/// list but no V1 form asks it. The Figma's single "Calor ou subida" item has no single code (CCP-ONB-1 §D20: not encoded until decided).
public enum RunCondition: String, Codable, CaseIterable, Sendable { case heat = "HEAT", hilly = "HILLY" }

// MARK: - Readings the engine already produces (CCP-ONB-1, read side)

/// `presentation().readings.runCalibration.goal` (`v1-run-calibration.mjs goalOf`): the athlete's time goal beside the current estimate
/// (Figma 31 "Sua meta … está dentro"). Never a prediction and never used for pace. `nil` = no time goal stated.
public struct AthleteGoalReading: Decodable, Equatable, Sendable {
    /// ATHLETE_GOAL.
    public let kind: Code
    /// 5K, 10K, HALF_MARATHON, MARATHON.
    public let event: Code?
    public let goalSeconds: Double?
    public let isPrediction: Bool?
    public let usedForPace: Bool?
    /// INSIDE_RANGE, FASTER_THAN_RANGE, SLOWER_THAN_RANGE, NO_CURRENT_ESTIMATE.
    public let relation: Code?
}

/// `weekPlan().marathon` (facade projection over the record, RM-APP-PROJECTIONS-2): how the engine planned a marathon goal (Figma 31
/// `838:1478` block, `838:1568` preparatory plan). `nil` = the plan has no marathon goal.
public struct MarathonPlanReading: Decodable, Equatable, Sendable {
    /// BLOCK (every eligibility criterion held: a marathon block to the date) or PREPARATORY (the plan builds the running a block needs; the
    /// marathon is context only, no date promised).
    public let status: Code
    public let date: String?
    /// PREPARATORY: the criteria not met yet, in the engine's order and words (`r6-intake.mjs`, `v1/EVENT_EXTENSION_V1.json`). BLOCK: `[]` —
    /// the engine lists no met criteria, so the screen shows no count of them.
    public let unmet: [MarathonCriterion]
    /// SSCTR C5: the plan's own marathon disclosures, verbatim and in its order. PREPARATORY: MARATHON_PREPARATORY_PLAN (this plan does not
    /// prepare for the date given, no date is promised, 7 days without training after racing anyway, and the alternatives in `options`) — screen
    /// 31 shows it whenever `status` is PREPARATORY. BLOCK: MARATHON_BLOCK_NOTES and MARATHON_PROJECTION. Copy by `id` (the text is English);
    /// `nil` = an earlier projection.
    public let disclosures: [MarathonDisclosure]?
}
public struct MarathonDisclosure: Decodable, Equatable, Sendable {
    public let id: Code
    public let blocking: Bool
    public let detail: EngineText?
    /// The engine's choices, in order (PREPARATORY: keep the preparatory plan, a later marathon, a 10K or half marathon first).
    public let options: [EngineText]
    /// MARATHON_PROJECTION only: the longest run the block reaches if the planned long runs are done (conditional, never a promise).
    public let projectedLongRunMinutes: Double?
}
/// One criterion the engine found not met: its id (RUN_EXPERIENCE, RUN_EXPERIENCE_MONTHS, LONGEST_RUN, WEEKLY_RUNNING, RUN_DAYS, LONG_RUN_TIME,
/// RACE_TOO_CLOSE, RACE_BEYOND_THIS_PLAN, RETURNING_FROM_A_STOP, CURRENT_RUNNING_CLASS, PROJECTED_LONG_RUN), the athlete's value and the need.
public struct MarathonCriterion: Decodable, Equatable, Sendable {
    public let id: Code
    /// `nil` = the fact is unknown (an unknown fact is a criterion not met; nothing is inferred).
    public let value: CriterionValue?
    public let needed: CriterionValue?
}
/// A criterion's value as the engine states it: minutes, days or weeks (`number`), a category (`text`), a flag, or a list of categories.
public enum CriterionValue: Decodable, Equatable, Sendable {
    case number(Double), text(String), flag(Bool), list([String])
    public init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if let b = try? c.decode(Bool.self) { self = .flag(b) } else if let n = try? c.decode(Double.self) { self = .number(n) }
        else if let s = try? c.decode(String.self) { self = .text(s) } else { self = .list(try c.decode([String].self)) }
    }
}

// MARK: - Special population not stated (QRE P3-8, SSCTR; #110) and the clinical route of held drafts (QRE P1)

/// Why no special-population code is stated. The frozen engine reads an absent or empty list as "none" and has no word for either case
/// (an unknown code is ignored and a plan is made), so neither is ever encoded as a code; see `AthleteIntake.specialPopulationNotStated`.
public enum SpecialPopulationGap: String, Codable, CaseIterable, Sendable {
    /// The Cuidados item left unmarked while another item is marked: not an answer, never "none".
    case notAnswered
    /// Figma 27 item 7, one item for two engine codes (#110: never PREGNANCY or POSTPARTUM by guess).
    case pregnancyOrPostpartumUnspecified
}
/// An intake that cannot be sent as it is: nothing reaches the engine and C keeps the draft (the engine needs a change first, CCP-ONB-1 §X).
public enum IntakeHold: Error, Equatable, Sendable {
    /// No special-population code and no clinical flag: the engine would read "none" and plan.
    case specialPopulationNotStated(SpecialPopulationGap)
}
extension OnboardingAnswers {
    /// Why these answers cannot be sent, or `nil`. A stated clinical flag always reaches the engine (it screens it before any other field,
    /// `r6-intake.mjs` status order), whatever else is missing: single sport, no race and the combined Cuidados item are all expressible.
    public var hold: IntakeHold? { athlete.hold }
}
extension AthleteIntake {
    public var hold: IntakeHold? {
        guard let gap = specialPopulationNotStated, !eligibility.statesAClinicalFlag else { return nil }
        return .specialPopulationNotStated(gap)
    }
    enum CodingKeys: String, CodingKey {
        case id, ageYears, eligibility, specialPopulation, strengthTrainingMonths, runTrainingMonths, exerciseRotationPreference, goals, equipment, recent,
             performanceAnchors, pause, knownExercises, coaching
    }
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id); ageYears = try c.decode(Int.self, forKey: .ageYears)
        eligibility = try c.decode(EligibilityScreen.self, forKey: .eligibility)
        let sp = try c.decodeIfPresent([SpecialPopulation].self, forKey: .specialPopulation)
        specialPopulation = sp ?? []; specialPopulationNotStated = sp == nil ? .notAnswered : nil
        strengthTrainingMonths = try c.decodeIfPresent(Int.self, forKey: .strengthTrainingMonths)
        runTrainingMonths = try c.decodeIfPresent(Int.self, forKey: .runTrainingMonths)
        exerciseRotationPreference = try c.decode(String.self, forKey: .exerciseRotationPreference)
        goals = try c.decode(IntakeGoals.self, forKey: .goals); equipment = try c.decode([String].self, forKey: .equipment)
        recent = try c.decode(RecentTraining.self, forKey: .recent); performanceAnchors = try c.decode([PerformanceAnchor].self, forKey: .performanceAnchors)
        pause = try c.decodeIfPresent(IntakePause.self, forKey: .pause); knownExercises = try c.decodeIfPresent([KnownExercise].self, forKey: .knownExercises)
        coaching = try c.decodeIfPresent(IntakeCoaching.self, forKey: .coaching)
    }
    public func encode(to encoder: Encoder) throws {
        if let h = hold { throw h }
        if specialPopulationNotStated != nil, !specialPopulation.isEmpty {
            throw EncodingError.invalidValue(specialPopulation, .init(codingPath: encoder.codingPath, debugDescription: "a code and 'not stated' together"))
        }
        var c = encoder.container(keyedBy: CodingKeys.self)
        try c.encode(id, forKey: .id); try c.encode(ageYears, forKey: .ageYears); try c.encode(eligibility, forKey: .eligibility)
        if specialPopulationNotStated == nil { try c.encode(specialPopulation, forKey: .specialPopulation) }
        try c.encodeIfPresent(strengthTrainingMonths, forKey: .strengthTrainingMonths); try c.encodeIfPresent(runTrainingMonths, forKey: .runTrainingMonths)
        try c.encode(exerciseRotationPreference, forKey: .exerciseRotationPreference); try c.encode(goals, forKey: .goals)
        try c.encode(equipment, forKey: .equipment); try c.encode(recent, forKey: .recent); try c.encode(performanceAnchors, forKey: .performanceAnchors)
        try c.encodeIfPresent(pause, forKey: .pause); try c.encodeIfPresent(knownExercises, forKey: .knownExercises); try c.encodeIfPresent(coaching, forKey: .coaching)
    }
}
