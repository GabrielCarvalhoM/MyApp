import Foundation

// The athlete's reviews (`integration.submit({actor, clientRequestId, expectedVersion, review})`): one closed request per intent, encoding only
// custody's CLIENT_REVIEW_FIELDS. Front A sends every athlete review through `submit` with exactly this JSON. (The `api.mjs` form helpers keep
// only completed/minutes/exercises/response of a report — FND-ABC-03 — so a report with rpe, a stop, a declared distance or a sport sent
// through them would lose those fields; `submit` with these types loses nothing.)

// ---- Warning signs (GAP-03): the set comes from the engine, never from a table in Swift ----

/// The signs the engine asks for one condition, as the app facade projects them (`warningSignSet(condition)`, re-exported from the frozen
/// `v1-f08.mjs signsFor`/`exerciseSignsFor`): 9, 13 or 15 warning signs; 15 for READINESS.
public struct WarningSignQuestionSet: Decodable, Equatable, Sendable {
    public let condition: String
    public let warningSigns: [String]
    public let exerciseSigns: [String]
    /// The intents the engine accepts for this condition (`intentsFor`): an illness offers no near-normal week.
    public let intents: [String]
}

/// The athlete's answers to exactly the signs asked. An unasked sign cannot be set (it is not "no"); an unanswered asked sign is omitted, so
/// the engine asks it again (`readBooleans`: missing → ASK). The UI shows "Sem resposta não conta como não".
public struct SignAnswers: Encodable, Equatable, Sendable {
    public enum Invalid: Error, Equatable { case notAsked(String) }
    public let asked: [String]
    public private(set) var answers: [String: Bool] = [:]
    public init(asking signs: [String]) { asked = signs }
    public mutating func answer(_ sign: String, _ yes: Bool) throws {
        guard asked.contains(sign) else { throw Invalid.notAsked(sign) }
        answers[sign] = yes
    }
    public var unanswered: [String] { asked.filter { answers[$0] == nil } }
    public var yes: [String] { asked.filter { answers[$0] == true } }
    private struct Key: CodingKey { let stringValue: String; var intValue: Int? { nil }; init(stringValue: String) { self.stringValue = stringValue }; init?(intValue: Int) { nil } }
    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: Key.self)
        for s in asked { if let v = answers[s] { try c.encode(v, forKey: Key(stringValue: s)) } }
    }
}

/// `v1-f08.mjs CONDITIONS`.
public enum WellbeingCondition: String, Codable, CaseIterable, Sendable {
    case mildIndisposition = "MILD_INDISPOSITION", unusualFatigue = "UNUSUAL_FATIGUE", mildIllness = "MILD_ILLNESS", minorDiscomfort = "MINOR_DISCOMFORT", needRest = "NEED_REST"
}
/// `v1-f08.mjs INTENTS` (the set offered for a condition is `WarningSignQuestionSet.intents`).
public enum WellbeingIntent: String, Codable, CaseIterable, Sendable {
    case reduceLight = "REDUCE_LIGHT", reduceSubstantial = "REDUCE_SUBSTANTIAL", lightActivityOnly = "LIGHT_ACTIVITY_ONLY", rest = "REST"
}
/// `v1-f08.mjs RETURN_SPEEDS`.
public enum ReturnSpeed: String, Codable, CaseIterable, Sendable { case conservative = "CONSERVATIVE", balanced = "BALANCED", faster = "FASTER" }

/// "Não estou 100%" (F08 Situation 1): `review.wellbeing` (keys: condition, sports, region, warningSigns, intent, days, startDate, endDate, returnSpeed).
public struct WellbeingDeclaration: Encodable, Equatable, Sendable {
    public var condition: WellbeingCondition
    public var warningSigns: SignAnswers
    public var intent: WellbeingIntent?
    public var days: Int?
    /// For a local condition, the sports the athlete states (never inferred).
    public var sports: [String]?
    public var region: String?
    public var returnSpeed: ReturnSpeed?
    public enum Invalid: Error, Equatable { case setNotForCondition(expected: String, got: String) }
    /// `set` must be the engine's set for `condition` (a mismatch throws: fail closed, never a crash: QRE-ABC-09).
    public init(condition: WellbeingCondition, set: WarningSignQuestionSet, intent: WellbeingIntent? = nil, days: Int? = nil, sports: [String]? = nil,
                region: String? = nil, returnSpeed: ReturnSpeed? = nil) throws {
        guard set.condition == condition.rawValue else { throw Invalid.setNotForCondition(expected: condition.rawValue, got: set.condition) }
        self.condition = condition; self.warningSigns = SignAnswers(asking: set.warningSigns); self.intent = intent; self.days = days
        self.sports = sports; self.region = region; self.returnSpeed = returnSpeed
    }
}
/// The check of a Situation 1 episode: `review.wellbeingCheck` (keys: warningSigns, exerciseResponse, improved, returnSpeed).
/// QRE-ABC-03: with several open conditions due, the engine asks the union of their signs and `improved` per condition. The signs to ask are then
/// the ones the engine names in `missingInputs` (`wellbeingCheck.warningSigns.<sign>`, `wellbeingCheck.improved.<CONDITION>`), passed as `asking`.
public struct WellbeingCheckAnswers: Encodable, Equatable, Sendable {
    public enum Improved: Encodable, Equatable, Sendable {
        /// One condition concerned.
        case single(Bool)
        /// Several: `{CONDITION: Bool}`, every due one answered.
        case perCondition([String: Bool])
        public func encode(to encoder: Encoder) throws {
            var c = encoder.singleValueContainer()
            switch self { case .single(let b): try c.encode(b); case .perCondition(let m): try c.encode(m) }
        }
    }
    public var warningSigns: SignAnswers
    public var exerciseResponse: SignAnswers
    public var improved: Improved?
    public var returnSpeed: ReturnSpeed?
    public init(set: WarningSignQuestionSet, improved: Improved? = nil, returnSpeed: ReturnSpeed? = nil) {
        warningSigns = SignAnswers(asking: set.warningSigns); exerciseResponse = SignAnswers(asking: set.exerciseSigns); self.improved = improved; self.returnSpeed = returnSpeed
    }
    /// The signs exactly as the engine asked them (several conditions open).
    public init(askingWarningSigns w: [String], exerciseSigns x: [String], improved: Improved? = nil, returnSpeed: ReturnSpeed? = nil) {
        warningSigns = SignAnswers(asking: w); exerciseResponse = SignAnswers(asking: x); self.improved = improved; self.returnSpeed = returnSpeed
    }
}
/// The return speeds the readiness declaration accepts (`readReadiness`: BALANCED or CONSERVATIVE; QRE-ABC-09).
public enum ReadinessReturnSpeed: String, Codable, CaseIterable, Sendable { case conservative = "CONSERVATIVE", balanced = "BALANCED" }
/// The readiness declaration after a hold (the ONLY exit of a clinical hold): `review.readiness` (keys: declaredRecovered, warningSigns, sports, returnSpeed).
public struct ReadinessDeclaration: Encodable, Equatable, Sendable {
    public struct Sports: Encodable, Equatable, Sendable {
        public struct Run: Encodable, Equatable, Sendable {
            public var ready: Bool
            /// QRE-ABC-02: asked by the engine when RUN is ready and STRENGTH avoids lower-body work (`readiness.sports.RUN.runningNotRestricted`).
            /// Nil = not asked (omitted); the form sends it when the engine's `missingInputs` names it.
            public var runningNotRestricted: Bool?
            public init(ready: Bool, runningNotRestricted: Bool? = nil) { self.ready = ready; self.runningNotRestricted = runningNotRestricted }
        }
        public struct Strength: Encodable, Equatable, Sendable {
            public var ready: Bool
            /// `v1-f08.mjs RESTRICTIONS`: AVOID_LOWER_BODY_STRENGTH, AVOID_UPPER_BODY_STRENGTH.
            public var restrictions: [String]
            public init(ready: Bool, restrictions: [String]) { self.ready = ready; self.restrictions = restrictions }
        }
        public var RUN: Run?
        public var STRENGTH: Strength?
        public init(run: Run?, strength: Strength?) { RUN = run; STRENGTH = strength }
    }
    public var declaredRecovered: Bool
    public var warningSigns: SignAnswers
    public var sports: Sports
    public var returnSpeed: ReturnSpeed?
    /// `set` must be the READINESS set (15 signs); otherwise it throws (fail closed).
    public init(declaredRecovered: Bool, set: WarningSignQuestionSet, sports: Sports, returnSpeed: ReadinessReturnSpeed? = nil) throws {
        guard set.condition == "READINESS" else { throw WellbeingDeclaration.Invalid.setNotForCondition(expected: "READINESS", got: set.condition) }
        self.returnSpeed = returnSpeed.map { ReturnSpeed(rawValue: $0.rawValue)! }
        self.declaredRecovered = declaredRecovered; warningSigns = SignAnswers(asking: set.warningSigns); self.sports = sports
    }
}

// ---- The other athlete intents ----

public struct BreakReport: Encodable, Equatable, Sendable {
    /// e.g. TRAVEL, WORK, ILLNESS, INJURY (a clinical reason routes to a human).
    public var reasonCategory: String
    public var nonclinical: Bool
    public var startDate: String
    public var endDate: String
    public init(reasonCategory: String, nonclinical: Bool, startDate: String, endDate: String) {
        self.reasonCategory = reasonCategory; self.nonclinical = nonclinical; self.startDate = startDate; self.endDate = endDate
    }
}
/// `EXERCISE_SUBSTITUTION` (custody CONFIRMATION_KINDS): reasons the engine reads; with `pain` the answer is CLINICAL_HUMAN_REQUIRED.
public struct ExerciseSubstitution: Encodable, Equatable, Sendable {
    public enum Reason: String, Encodable, CaseIterable, Sendable { case nonclinicalDiscomfortOrPreference = "NONCLINICAL_DISCOMFORT_OR_PREFERENCE", skillMismatch = "SKILL_MISMATCH" }
    public var exerciseId: String
    public var reason: Reason
    public var nonclinicalConfirmed: Bool
    public var pain: Bool?
    public init(exerciseId: String, reason: Reason, nonclinicalConfirmed: Bool, pain: Bool? = nil) {
        self.exerciseId = exerciseId; self.reason = reason; self.nonclinicalConfirmed = nonclinicalConfirmed; self.pain = pain
    }
}
/// LOWER, STANDARD, HIGHER per sport (from next week).
public enum PreferenceLevel: String, Encodable, CaseIterable, Sendable { case lower = "LOWER", standard = "STANDARD", higher = "HIGHER" }

/// One athlete review, closed by intent. `eligibility` is the screen the athlete answered with it, when the flow asked one (GAP-20: the actions
/// that need `eligibility.currentAssessment`).
public struct ReviewRequest: Encodable, Equatable, Sendable {
    public enum Body: Equatable, Sendable {
        /// The athlete's session reports (WEEKLY_REVIEW): planned, unplanned, corrections; or only the screen (`[]`).
        case sessionReports([AthleteObservation])
        /// A planned session not done (MISSED_SESSION, `targetSessionId`): the coach may offer a move; nothing moves on its own.
        case missedSession(AthleteObservation)
        case notFeeling100(WellbeingDeclaration, reports: [AthleteObservation])
        case wellbeingCheck(WellbeingCheckAnswers, reports: [AthleteObservation])
        case readiness(ReadinessDeclaration, reports: [AthleteObservation])
        case reportBreak(BreakReport)
        /// "Toque e segure para mudar o dia" (GAP-09): the origin day becomes unavailable; the engine proposes, the athlete confirms.
        case unavailableDays([String])
        case preferences(volume: [String: PreferenceLevel]?, difficulty: [String: PreferenceLevel]?)
        /// CONSERVATIVE / BALANCED / ... (the engine's coach profiles).
        case coach(profile: String)
        case exerciseSubstitution(ExerciseSubstitution)
    }
    public let body: Body
    public let eligibility: EligibilityScreen?
    public init(_ body: Body, eligibility: EligibilityScreen?) { self.body = body; self.eligibility = eligibility }

    enum CodingKeys: String, CodingKey { case kind, observations, eligibility, wellbeing, wellbeingCheck, readiness, interruption, changes, substitution, targetSessionId }
    private struct Coaching: Encodable { let volume: [String: PreferenceLevel]?; let difficulty: [String: PreferenceLevel]?; let profile: String? }
    private struct Changes: Encodable { let unavailableDates: [String]?; let coaching: Coaching? }
    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        func reports(_ r: [AthleteObservation]) throws { if !r.isEmpty { try c.encode(r, forKey: .observations) } }
        switch body {
        case .sessionReports(let r): try c.encode("WEEKLY_REVIEW", forKey: .kind); try c.encode(r, forKey: .observations)
        case .missedSession(let o):
            try c.encode("MISSED_SESSION", forKey: .kind); try c.encode([o], forKey: .observations); try c.encodeIfPresent(o.sessionId, forKey: .targetSessionId)
        case .notFeeling100(let w, let r): try c.encode("NOT_FEELING_100", forKey: .kind); try c.encode(w, forKey: .wellbeing); try reports(r)
        case .wellbeingCheck(let w, let r): try c.encode("WELLBEING_CHECK", forKey: .kind); try c.encode(w, forKey: .wellbeingCheck); try reports(r)
        case .readiness(let x, let r): try c.encode("READINESS_DECLARATION", forKey: .kind); try c.encode(x, forKey: .readiness); try reports(r)
        case .reportBreak(let b): try c.encode("RETURN_AFTER_PAUSE", forKey: .kind); try c.encode(b, forKey: .interruption)
        case .unavailableDays(let d): try c.encode("UNAVAILABLE_DAY", forKey: .kind); try c.encode(Changes(unavailableDates: d, coaching: nil), forKey: .changes)
        case .preferences(let v, let d): try c.encode("PREFERENCE_CHANGE", forKey: .kind); try c.encode(Changes(unavailableDates: nil, coaching: Coaching(volume: v, difficulty: d, profile: nil)), forKey: .changes)
        case .coach(let p): try c.encode("PREFERENCE_CHANGE", forKey: .kind); try c.encode(Changes(unavailableDates: nil, coaching: Coaching(volume: nil, difficulty: nil, profile: p)), forKey: .changes)
        case .exerciseSubstitution(let s): try c.encode("EXERCISE_SUBSTITUTION", forKey: .kind); try c.encode(s, forKey: .substitution)
        }
        try c.encodeIfPresent(eligibility, forKey: .eligibility)
    }
}
