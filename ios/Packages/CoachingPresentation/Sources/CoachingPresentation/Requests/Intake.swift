import Foundation

// CHG-UI-1b + CHG-UI-2 2.7 (ABC foundation consolidation, 2026-11-26): the CLOSED request types of the athlete channel. They are shared because
// front C fills them from the forms and front A sends them; neither front defines its own. Each struct encodes exactly the keys the frozen engine
// reads (SWIFTUI_BACKEND_HANDOFF §5, corrected by this mission: specialPopulation, heartRateProfile, performance-anchor heart rate), nothing else.
// A key a form asked is never dropped: required safety fields are non-optional, so a form cannot compile without answering them.
// Tests: RequestSchemaTests (keys and enumerations against the frozen sources) and EndToEndBoundaryTests (Swift JSON -> real boundary -> engine).
// CCP-ONB-1 (#109, Founder 2026-11-27, additive): the onboarding answers the approved Figma asks and the frozen engine already reads, field by
// field in audits/v1-ios-integration-2026-11-26/results/i109-ccp-onb/CCP-ONB-1.md; new types in OnboardingFields.swift; OnboardingIntakeTests.

/// The special populations the onboarding "Cuidados" step asks (Figma 10 · 27 `836:3299`). The engine reads `athlete.specialPopulation` and puts
/// either one outside the V1 coaching scope (`r6-intake.mjs`: SPECIAL_POPULATION_OUTSIDE_V1 → status UNSUPPORTED, `enrolled: false`).
/// ELITE and ADOLESCENT exist in the engine's vocabulary but no V1 form asks them, so no case exists for them here.
/// #110 / CCP-ONB-1: the combined Figma item "Gestação atual ou parto nos últimos 12 meses" has NO case: it is never encoded as either code, and
/// the frozen engine ignores any other code (it would plan), so a combined or unspecified code needs an engine change first. C holds the send.
public enum SpecialPopulation: String, Codable, CaseIterable, Sendable {
    case pregnancy = "PREGNANCY"
    case postpartum = "POSTPARTUM"
}

/// The eligibility / warning-sign screen (handoff §5.4): six clinical flags and the athlete's nonclinical confirmation, dated. A flag the athlete
/// did not answer is `nil` and is OMITTED: the engine then asks again (UNASSESSED → ASK). It is never sent as `false`.
public struct EligibilityScreen: Codable, Equatable, Sendable {
    /// `NONCLINICAL_CONFIRMED` when the athlete confirmed the nonclinical statement; `nil` otherwise (never guessed).
    public var status: EligibilityStatus?
    /// The plan-local day the athlete answered (`YYYY-MM-DD`): the engine reads it current for 14 days.
    public var assessedAt: String
    public var pain: Bool?
    public var persistentPain: Bool?
    public var injury: Bool?
    public var illness: Bool?
    public var functionalLimitation: Bool?
    public var clinicalConcern: Bool?
    public init(status: EligibilityStatus?, assessedAt: String, pain: Bool?, persistentPain: Bool?, injury: Bool?, illness: Bool?,
                functionalLimitation: Bool?, clinicalConcern: Bool?) {
        self.status = status; self.assessedAt = assessedAt; self.pain = pain; self.persistentPain = persistentPain; self.injury = injury
        self.illness = illness; self.functionalLimitation = functionalLimitation; self.clinicalConcern = clinicalConcern
    }
    /// Every flag answered: a screen the engine can read as current (the UI still sends it as it is when not).
    public var isComplete: Bool { status != nil && [pain, persistentPain, injury, illness, functionalLimitation, clinicalConcern].allSatisfy { $0 != nil } }
    /// Any flag answered yes: the engine routes to a qualified human (CLINICAL_HUMAN_REQUIRED). The UI shows that state from the answer, not from this.
    public var statesAClinicalFlag: Bool { [pain, persistentPain, injury, illness, functionalLimitation, clinicalConcern].contains(true) }
}
public enum EligibilityStatus: String, Codable, CaseIterable, Sendable { case nonclinicalConfirmed = "NONCLINICAL_CONFIRMED" }

/// The athlete facts of onboarding and restart (`intake.athlete`). What the UI collects; the host (A) wraps it in `IntakeRequest`.
public struct AthleteIntake: Codable, Equatable, Sendable {
    /// The app's athlete id (A sets it from the authenticated account; C passes what A gives).
    public var id: String
    /// 18–80 whole years: the five-zone age estimate (220 − age) needs it; an age outside is UNSUPPORTED by the engine.
    public var ageYears: Int
    public var eligibility: EligibilityScreen
    /// REQUIRED (GAP-02). `[]` when the athlete answered "none of these": the key is always sent, so it can never be lost by a closed key list.
    /// CCP-ONB-1: the only exception is `specialPopulationNotStated` (OnboardingFields.swift).
    public var specialPopulation: [SpecialPopulation]
    /// CCP-ONB-1 (QRE P3-8, SSCTR; #110): the athlete stated no special-population CODE — the Cuidados box left unmarked beside a marked sign, or
    /// the combined item "Gestação atual ou parto nos últimos 12 meses". `specialPopulation` is then `[]` and its key is OMITTED (never "none"),
    /// and the intake encodes only when a clinical flag is stated: the engine screens it first (CLINICAL_HUMAN_REQUIRED, nothing enrolled).
    /// Otherwise encoding throws `IntakeHold` and nothing is sent. `nil` (default): `specialPopulation` is the athlete's answer.
    /// Not preserved by decoding: an intake without the key always decodes as `.notAnswered` (`SpecialPopulationGap`).
    public var specialPopulationNotStated: SpecialPopulationGap? = nil
    /// Months of regular training per sport (Figma 22, 25: the lower bound of the band, D13). CCP-ONB-1: `nil` (omitted) when the flow did not
    /// ask it — the sport the athlete does not train ("Só força" / "Só corrida"); never 0 for "not asked" (0 is "Nunca treinei" / "Nunca corri").
    public var strengthTrainingMonths: Int?
    public var runTrainingMonths: Int?
    public var exerciseRotationPreference: String
    public var goals: IntakeGoals
    public var equipment: [String]
    public var recent: RecentTraining
    /// The run history at onboarding (SEC-INT-06): the only way declared performance evidence reaches the engine in V1 (FND-HR5-01).
    public var performanceAnchors: [PerformanceAnchor]
    /// Restart only (a declared break).
    public var pause: IntakePause?
    /// CCP-ONB-1 (Figma 26 `836:3194`): the loads the athlete already knows. `nil` = the screen was not shown or "Não sei minhas cargas".
    public var knownExercises: [KnownExercise]?
    /// CCP-ONB-1 (Figma 15 `836:830`): the coach the athlete chose. `nil` = not asked (the engine keeps its default path, no `coaching` key).
    public var coaching: IntakeCoaching?
    public init(id: String, ageYears: Int, eligibility: EligibilityScreen, specialPopulation: [SpecialPopulation], strengthTrainingMonths: Int?,
                runTrainingMonths: Int?, exerciseRotationPreference: String, goals: IntakeGoals, equipment: [String], recent: RecentTraining,
                performanceAnchors: [PerformanceAnchor], pause: IntakePause? = nil, knownExercises: [KnownExercise]? = nil,
                coaching: IntakeCoaching? = nil) {
        self.id = id; self.ageYears = ageYears; self.eligibility = eligibility; self.specialPopulation = specialPopulation
        self.strengthTrainingMonths = strengthTrainingMonths; self.runTrainingMonths = runTrainingMonths
        self.exerciseRotationPreference = exerciseRotationPreference; self.goals = goals; self.equipment = equipment; self.recent = recent
        self.performanceAnchors = performanceAnchors; self.pause = pause; self.knownExercises = knownExercises; self.coaching = coaching
    }
}
public struct IntakeGoals: Codable, Equatable, Sendable {
    public var run: RunGoal
    /// e.g. RUNNING_SUPPORT (the engine's STRENGTH_GOALS words).
    public var strength: String
    public init(run: RunGoal, strength: String) { self.run = run; self.strength = strength }
}
public struct RunGoal: Codable, Equatable, Sendable {
    /// e.g. RACE, GENERAL (the engine's RUN_GOALS words).
    public var kind: String
    public var event: GoalEvent?
    public init(kind: String, event: GoalEvent? = nil) { self.kind = kind; self.event = event }
}
public struct GoalEvent: Codable, Equatable, Sendable {
    /// 5K, 10K, HALF_MARATHON, MARATHON.
    public var kind: String
    public var date: String
    /// CCP-ONB-1 (Figma 05 `835:2301`, optional): the athlete's time goal in minutes (min + s/60). Context only: the engine never derives a pace
    /// or an intensity from it; it compares it with the current estimate (`RunCalibration.goal`). `nil` = "Seguir sem meta".
    public var timeGoalMinutes: Double?
    public init(kind: String, date: String, timeGoalMinutes: Double? = nil) { self.kind = kind; self.date = date; self.timeGoalMinutes = timeGoalMinutes }
}
/// CCP-ONB-1: each fact is optional and `nil` is OMITTED, never zero-filled (SSCTR D12): a sport not trained, or what the flow does not ask
/// ("Já corri e parei" with 1–3 days asks no minutes nor longest run). The engine reads a missing exposure as a conservative establishment.
/// 0 is sent only when it is the athlete's answer ("Nunca corri", "Nenhum").
public struct RecentTraining: Codable, Equatable, Sendable {
    public var strengthDaysPerWeek: Int?
    public var runDaysPerWeek: Int?
    public var runMinutesPerWeek: Int?
    public var longestRunMinutes: Int?
    public init(strengthDaysPerWeek: Int?, runDaysPerWeek: Int?, runMinutesPerWeek: Int?, longestRunMinutes: Int?) {
        self.strengthDaysPerWeek = strengthDaysPerWeek; self.runDaysPerWeek = runDaysPerWeek
        self.runMinutesPerWeek = runMinutesPerWeek; self.longestRunMinutes = longestRunMinutes
    }
}
/// A result the athlete brings to onboarding (race, time trial, field test, lab test). Heart rate and lab values are optional and, when
/// present, the five-zone measured references read them (V1HR5R: lab maximum, chest-strap observed maximum, optical shown only).
public struct PerformanceAnchor: Codable, Equatable, Sendable {
    public var id: String?
    /// RACE_RESULT, TIME_TRIAL, FIELD_TEST, LAB_TEST.
    public var kind: String
    public var distance: String?
    public var seconds: Double?
    public var date: String
    /// OFFICIAL, TRACK, MEASURED_COURSE, GPS, TREADMILL, MANUAL.
    public var measurement: String?
    public var rpe: Double?
    public var tolerated: Bool?
    public var heartRate: AnchorHeartRate?
    public var lab: LabReport?
    /// CCP-ONB-1 (Figma 24 "Condições"): `[]` = "Normais"; `nil` = not asked. A condition makes the result not comparable for calibration.
    public var conditions: [RunCondition]?
    public init(id: String? = nil, kind: String, distance: String? = nil, seconds: Double? = nil, date: String, measurement: String? = nil,
                rpe: Double? = nil, tolerated: Bool? = nil, heartRate: AnchorHeartRate? = nil, lab: LabReport? = nil, conditions: [RunCondition]? = nil) {
        self.id = id; self.kind = kind; self.distance = distance; self.seconds = seconds; self.date = date; self.measurement = measurement
        self.rpe = rpe; self.tolerated = tolerated; self.heartRate = heartRate; self.lab = lab; self.conditions = conditions
    }
}
public struct AnchorHeartRate: Codable, Equatable, Sendable {
    public var maxBpm: Int
    /// CHEST_STRAP, ECG, OPTICAL. Never guessed: unknown means the anchor carries no heart rate.
    public var sensor: HeartRateSensorKind
    public init(maxBpm: Int, sensor: HeartRateSensorKind) { self.maxBpm = maxBpm; self.sensor = sensor }
}
public enum HeartRateSensorKind: String, Codable, CaseIterable, Sendable { case chestStrap = "CHEST_STRAP", ecg = "ECG", optical = "OPTICAL" }
public struct LabReport: Codable, Equatable, Sendable {
    public var protocolName: String
    public var source: String
    /// e.g. TREADMILL_RUN (declared by the athlete: the open lab.modality decision of V1HR5).
    public var modality: String?
    public var values: [LabReportValue]
    enum CodingKeys: String, CodingKey { case protocolName = "protocol", source, modality, values }
    public init(protocolName: String, source: String, modality: String?, values: [LabReportValue]) {
        self.protocolName = protocolName; self.source = source; self.modality = modality; self.values = values
    }
}
public struct LabReportValue: Codable, Equatable, Sendable {
    public var name: String
    public var value: Double
    public var unit: String
    public init(name: String, value: Double, unit: String) { self.name = name; self.value = value; self.unit = unit }
}
public struct IntakePause: Codable, Equatable, Sendable {
    public var reasonCategory: String
    public var nonclinical: Bool
    public var weeks: Int
    public init(reasonCategory: String, nonclinical: Bool, weeks: Int) { self.reasonCategory = reasonCategory; self.nonclinical = nonclinical; self.weeks = weeks }
}
/// CCP-ONB-1: the fields of a sport are optional and `nil` is OMITTED, so a single-sport plan ("Só força" / "Só corrida") sends `[]` days and
/// nothing else of the other sport (no sentinel: the engine refuses a `longRunDay` outside `runDays`). The engine still asks the minutes of a
/// sport that has days (`schedule.runMinutes` / `schedule.strengthMinutes` → ASK).
public struct TrainingSchedule: Codable, Equatable, Sendable {
    public var strengthDays: [Int]
    public var strengthMinutes: Int?
    public var runDays: [Int]
    public var runMinutes: Int?
    public var longRunMinutes: Int?
    /// One of `runDays`.
    public var longRunDay: Int?
    /// AM, PM (Manhã → AM; Tarde, Noite → PM: the engine has two shifts). Optional (Figma 09: the shift is optional); with a day shared by both
    /// sports and a shift missing, the engine plans them back to back and asks the confirmation (SHARED_DAY_TURN_UNKNOWN, not blocking).
    public var runTurn: String?
    public var strengthTurn: String?
    /// CCP-ONB-1 (Figma `838:4011` "Os dois no mesmo turno, um depois do outro"): the athlete confirmed the back-to-back order on the shared days.
    /// Only `true` has an effect; `nil` = not answered (never sent as `false` for "not asked").
    public var sameTurnConfirmed: Bool?
    /// CCP-ONB-1 (Figma 07 `835:2400`): who goes first when the week is tight. `nil` = "Equilíbrio" (the engine has no third word) or not asked.
    public var temporaryPreference: TemporaryPreference?
    public init(strengthDays: [Int], strengthMinutes: Int?, runDays: [Int], runMinutes: Int?, longRunMinutes: Int?, longRunDay: Int?, runTurn: String?,
                strengthTurn: String?, sameTurnConfirmed: Bool? = nil, temporaryPreference: TemporaryPreference? = nil) {
        self.strengthDays = strengthDays; self.strengthMinutes = strengthMinutes; self.runDays = runDays; self.runMinutes = runMinutes
        self.longRunMinutes = longRunMinutes; self.longRunDay = longRunDay; self.runTurn = runTurn; self.strengthTurn = strengthTurn
        self.sameTurnConfirmed = sameTurnConfirmed; self.temporaryPreference = temporaryPreference
    }
}

/// What the onboarding flow collects (front C). The host (front A) turns it into an `IntakeRequest` with the values only it may set.
public struct OnboardingAnswers: Encodable, Equatable, Sendable {
    public var athlete: AthleteIntake
    public var schedule: TrainingSchedule
    /// 4, 8, 12 or 16. With a race, derived from its date (D03). CCP-ONB-1: `nil` (omitted) only when there is no race — the engine then plans
    /// its own 12 weeks (`r6-intake.mjs`: `weeks??12`); with a race, a `nil` would also give 12 weeks around a nearer race, so C sends it.
    public var weeks: Int?
    public var startDate: String
    /// Optional at onboarding: the athlete's declared maximum and/or custom limits (V1HR5R). Absent = nothing declared.
    public var heartRateProfile: HeartRateProfileRequest?
    public init(athlete: AthleteIntake, schedule: TrainingSchedule, weeks: Int?, startDate: String, heartRateProfile: HeartRateProfileRequest? = nil) {
        self.athlete = athlete; self.schedule = schedule; self.weeks = weeks; self.startDate = startDate; self.heartRateProfile = heartRateProfile
    }
}

/// The custody mode of an intake. In this phase the only case is the synthetic shadow reference: `createIntegration({syntheticOnly: true})`
/// refuses anything else (SYNTHETIC_ONLY, OPEN-4 / GAP-01). A case for real athletes is added only by the integration mission after the Founder's
/// recorded real-athlete gate, so no front can send a real intake by accident.
public enum IntakeCustodyMode: Sendable { case syntheticShadowReference }

/// The intake the engine reads (`R6-INTAKE-1`), built by front A from `OnboardingAnswers` plus the values only the host may set: the contract
/// version, the custody mode, `asOf` (the trusted plan-local day, D1), the plan's offset and the learning consent (from `consents`).
public struct IntakeRequest: Encodable, Equatable, Sendable {
    public static let intakeVersion = "R6-INTAKE-1"
    public let answers: OnboardingAnswers
    public let asOf: String
    public let timezoneOffsetMinutes: Int
    public let learningConsent: Bool
    public let mode: IntakeCustodyMode
    public init(answers: OnboardingAnswers, asOf: String, timezoneOffsetMinutes: Int, learningConsent: Bool, mode: IntakeCustodyMode) {
        self.answers = answers; self.asOf = asOf; self.timezoneOffsetMinutes = timezoneOffsetMinutes; self.learningConsent = learningConsent; self.mode = mode
    }
    enum CodingKeys: String, CodingKey { case version, synthetic, purpose, asOf, startDate, weeks, timezoneOffsetMinutes, learningConsent, athlete, schedule, heartRateProfile }
    public func encode(to encoder: Encoder) throws {
        if let h = answers.hold { throw h }       // CCP-ONB-1: a held intake is never sent (OnboardingFields.swift `IntakeHold`)
        var c = encoder.container(keyedBy: CodingKeys.self)
        try c.encode(Self.intakeVersion, forKey: .version)
        switch mode { case .syntheticShadowReference: try c.encode(true, forKey: .synthetic); try c.encode("SHADOW_REFERENCE", forKey: .purpose) }
        try c.encode(asOf, forKey: .asOf); try c.encode(answers.startDate, forKey: .startDate); try c.encodeIfPresent(answers.weeks, forKey: .weeks)
        try c.encode(timezoneOffsetMinutes, forKey: .timezoneOffsetMinutes); try c.encode(learningConsent, forKey: .learningConsent)
        try c.encode(answers.athlete, forKey: .athlete); try c.encode(answers.schedule, forKey: .schedule)
        try c.encodeIfPresent(answers.heartRateProfile, forKey: .heartRateProfile)
    }
}

/// The three explicit consents of onboarding (handoff §4): booleans, never defaulted.
public struct Consents: Codable, Equatable, Sendable {
    public var coaching: Bool
    public var healthSignals: Bool
    public var learning: Bool
    enum CodingKeys: String, CodingKey { case coaching = "COACHING", healthSignals = "HEALTH_SIGNALS", learning = "LEARNING" }
    public init(coaching: Bool, healthSignals: Bool, learning: Bool) { self.coaching = coaching; self.healthSignals = healthSignals; self.learning = learning }
}
