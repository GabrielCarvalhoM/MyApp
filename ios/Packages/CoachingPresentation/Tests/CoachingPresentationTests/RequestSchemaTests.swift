import XCTest
@testable import CoachingPresentation

/// CHG-UI-2 (schemas and safety): the closed request types encode exactly the keys and enumerations the FROZEN sources read. Every list is read
/// from the repository's CoachingCore bytes, so a drift in either direction fails here. No value is invented.
final class RequestSchemaTests: XCTestCase {
    static let custody = "CoachingCore/src/boundary/custody.mjs"
    static let admission = "CoachingCore/src/boundary/admission.mjs"
    static let f08 = "CoachingCore/src/v1-f08.mjs"

    /// The string list after `NAME` up to the closing bracket, in `NAME=Object.freeze([...])`, `NAME:Object.freeze([...])` or `NAME=[...]`.
    static func list(_ text: String, _ name: String) throws -> [String] {
        let re = try NSRegularExpression(pattern: "\\b\(name)\\s*[:=]\\s*(?:Object\\.freeze\\()?\\[([^\\]]*)\\]")
        guard let m = re.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)), let r = Range(m.range(at: 1), in: text) else {
            XCTFail("\(name) not found"); return []
        }
        return text[r].split(separator: ",").map { $0.trimmingCharacters(in: CharacterSet(charactersIn: " '\"\n")) }.filter { !$0.isEmpty }
    }
    /// The key list of `unknownKeys(x,[...])` on the line that reads `prefix` (the F08 readers' own allow-lists).
    static func f08Keys(_ reader: String) throws -> [String] {
        let text = try Repo.text(f08)
        let re = try NSRegularExpression(pattern: "unknownKeys\\(\(reader),\\[([^\\]]*)\\]\\)")
        let m = try XCTUnwrap(re.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)), reader)
        return text[Range(m.range(at: 1), in: text)!].split(separator: ",").map { $0.trimmingCharacters(in: CharacterSet(charactersIn: " '")) }
    }
    static let screen = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "2026-11-13", pain: false, persistentPain: false, injury: false,
                                          illness: false, functionalLimitation: false, clinicalConcern: false)
    static func answers(special: [SpecialPopulation] = [], hr: HeartRateProfileRequest? = nil) -> OnboardingAnswers {
        OnboardingAnswers(athlete: AthleteIntake(id: "swift-a", ageYears: 32, eligibility: screen, specialPopulation: special, strengthTrainingMonths: 18,
                                                 runTrainingMonths: 36, exerciseRotationPreference: "COACH_DECIDES",
                                                 goals: IntakeGoals(run: RunGoal(kind: "RACE", event: GoalEvent(kind: "10K", date: "2027-01-10")), strength: "RUNNING_SUPPORT"),
                                                 equipment: ["BARBELL", "RACK", "BENCH", "DUMBBELLS", "KETTLEBELL", "MACHINES", "BANDS", "PULL_UP_BAR"],
                                                 recent: RecentTraining(strengthDaysPerWeek: 2, runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 80),
                                                 performanceAnchors: [PerformanceAnchor(kind: "RACE_RESULT", distance: "10K", seconds: 3000, date: "2026-11-01",
                                                                                        measurement: "OFFICIAL", rpe: 9, tolerated: true)]),
                         schedule: TrainingSchedule(strengthDays: [2, 5], strengthMinutes: 45, runDays: [1, 3, 5, 6], runMinutes: 50, longRunMinutes: 90,
                                                    longRunDay: 6, runTurn: "AM", strengthTurn: "PM"),
                         weeks: 8, startDate: "2026-11-16", heartRateProfile: hr)
    }
    static func intake(special: [SpecialPopulation] = [], hr: HeartRateProfileRequest? = nil) -> IntakeRequest {
        IntakeRequest(answers: answers(special: special, hr: hr), asOf: "2026-11-13", timezoneOffsetMinutes: -180, learningConsent: true, mode: .syntheticShadowReference)
    }

    func testEnumerationsAreTheFrozenOnes() throws {
        let formats = try XCTUnwrap(try JSONSerialization.jsonObject(with: Data(Repo.text("CoachingCore/v1/RUN_FORMATS_V1.json").utf8)) as? [String: Any])
        let facts = try XCTUnwrap(formats["runFacts"] as? [String: Any])
        XCTAssertEqual(StopReason.allCases.map(\.rawValue), (formats["stops"] as? [String: Any])?["reasons"] as? [String])
        XCTAssertEqual(DeclaredDistanceReason.allCases.map(\.rawValue), facts["declaredFailureReasons"] as? [String])
        XCTAssertEqual(LoadConvention.allCases.map(\.rawValue), try Self.list(Repo.text("CoachingCore/src/r6-intake.mjs"), "LOAD_CONVENTIONS"))
        let f08 = try Repo.text(Self.f08)
        XCTAssertEqual(WellbeingCondition.allCases.map(\.rawValue), try Self.list(f08, "CONDITIONS"))
        XCTAssertEqual(WellbeingIntent.allCases.map(\.rawValue), try Self.list(f08, "INTENTS"))
        XCTAssertEqual(ReturnSpeed.allCases.map(\.rawValue), try Self.list(f08, "RETURN_SPEEDS"))
        let prov = try Repo.text("CoachingCore/src/r6-provenance.mjs")
        XCTAssertEqual(PerformanceResponse.allCases.map(\.rawValue), try Self.list(prov, "performance"))
        XCTAssertEqual(RecoveryResponse.allCases.map(\.rawValue), try Self.list(prov, "recovery"))
        XCTAssertEqual(EffortResponse.allCases.map(\.rawValue), try Self.list(prov, "effort"))
        XCTAssertEqual(NextDayFunctionResponse.allCases.map(\.rawValue), try Self.list(prov, "nextDayFunction"))
        XCTAssertEqual(Set(ConsentPurpose.allCases.map(\.rawValue)), ["COACHING", "HEALTH_SIGNALS", "LEARNING"])
        XCTAssertTrue(try Repo.text(Self.custody).contains("PURPOSES=Object.freeze({COACHING:'COACHING',HEALTH_SIGNALS:'HEALTH_SIGNALS',LEARNING:'LEARNING'})"))
        // The engine's special populations (r6-intake.mjs): the two the form asks are among them.
        let special = try Repo.text("CoachingCore/src/r6-intake.mjs")
        XCTAssertTrue(special.contains("['PREGNANCY','POSTPARTUM','ELITE','ADOLESCENT'].includes(x)))scope='SPECIAL_POPULATION_OUTSIDE_V1'"))
        XCTAssertEqual(SpecialPopulation.allCases.map(\.rawValue), ["PREGNANCY", "POSTPARTUM"])
    }

    /// GAP-02: `specialPopulation` is always sent (`[]` included), so no closed key list can lose it; unanswered eligibility flags are omitted.
    func testIntakeCarriesEverySafetyKey() throws {
        let none = try encoded(Self.intake())
        let athlete = try XCTUnwrap(none["athlete"] as? [String: Any])
        XCTAssertEqual(athlete["specialPopulation"] as? [String], [], "the answer 'none' is sent, not omitted")
        XCTAssertEqual(try XCTUnwrap(try encoded(Self.intake(special: [.pregnancy]))["athlete"] as? [String: Any])["specialPopulation"] as? [String], ["PREGNANCY"])
        XCTAssertEqual(Set(none.keys), ["version", "synthetic", "purpose", "asOf", "startDate", "weeks", "timezoneOffsetMinutes", "learningConsent", "athlete", "schedule"])
        XCTAssertEqual(none["synthetic"] as? Bool, true); XCTAssertEqual(none["purpose"] as? String, "SHADOW_REFERENCE"); XCTAssertEqual(none["version"] as? String, "R6-INTAKE-1")
        XCTAssertEqual(Set(athlete.keys), ["id", "ageYears", "eligibility", "specialPopulation", "strengthTrainingMonths", "runTrainingMonths",
                                            "exerciseRotationPreference", "goals", "equipment", "recent", "performanceAnchors"])
        var partial = Self.screen; partial.pain = nil; partial.status = nil
        let e = try encoded(partial)
        XCTAssertNil(e["pain"], "an unanswered flag is a question again, never false"); XCTAssertNil(e["status"])
        XCTAssertFalse(partial.isComplete); XCTAssertTrue(Self.screen.isComplete)
        let withHR = try encoded(Self.intake(hr: HeartRateProfileRequest(maxHeartRateBpm: .some(195))))
        XCTAssertEqual(withHR["heartRateProfile"] as? [String: Int], ["maxHeartRateBpm": 195])
        // Boundary-owned keys (admission.mjs) never appear in an intake the host sends, except the engine-contract envelope the intake itself is.
        let owned = Set(try Self.list(Repo.text(Self.admission), "BOUNDARY_OWNED"))
        XCTAssertTrue(owned.isDisjoint(with: athlete.keys))
    }

    /// SEC-INT-12 + CHG-UI-2 2.8: an athlete report states only OBSERVATION_KEYS.ATHLETE, never a boundary-owned or device-only fact; an unplanned
    /// report carries `actual.sport` and `observedAt` (GAP-12) and no stop (FND-ABC-02); a contest carries `actual.declared`.
    func testAthleteObservationsAreClosed() throws {
        let adm = try Repo.text(Self.admission)
        let athleteKeys = Set(try Self.list(adm, "ATHLETE")), owned = Set(try Self.list(adm, "BOUNDARY_OWNED"))
        let planned = AthleteObservation.plannedRun(sessionId: "w0-run-d1", occurrenceDate: "2026-11-17", observedAt: "2026-11-17T07:45:00-03:00",
            actual: PlannedRunActual(completed: false, minutes: 12, rpe: 6, stop: RunStop(reason: .symptom), declared: ContestedDistance(distanceKm: 3, reason: .signalLoss)),
            response: .unknown).correcting(eventId: "ob_1")
        let p = try encoded(planned)
        XCTAssertEqual(Set(p.keys), athleteKeys, "a fully populated report states exactly the ATHLETE keys")
        let pa = try XCTUnwrap(p["actual"] as? [String: Any])
        XCTAssertTrue(owned.isDisjoint(with: pa.keys)); XCTAssertNil(pa["measurement"]); XCTAssertNil(pa["gpsQuality"]); XCTAssertNil(pa["heartRate"])
        XCTAssertEqual((pa["stop"] as? [String: String])?["reason"], "SYMPTOM"); XCTAssertEqual((pa["declared"] as? [String: Any])?["reason"] as? String, "SIGNAL_LOSS")
        let run = try encoded(AthleteObservation.unplannedRun(occurrenceDate: "2026-11-21", observedAt: "2026-11-21T18:10:00-03:00",
                                                              actual: UnplannedRunActual(completed: true, minutes: 30, rpe: 3), response: .unknown))
        XCTAssertNil(run["sessionId"]); XCTAssertEqual(run["observedAt"] as? String, "2026-11-21T18:10:00-03:00")
        let ra = try XCTUnwrap(run["actual"] as? [String: Any])
        XCTAssertEqual(ra["sport"] as? String, "RUN"); XCTAssertNil(ra["stop"], "an unplanned run states no stop the engine would not read")
        let str = try encoded(AthleteObservation.unplannedStrength(occurrenceDate: "2026-11-21", observedAt: "2026-11-21T20:40:00-03:00",
            actual: StrengthActual(completed: true, minutes: 35, exercises: [LoggedExerciseEntry(id: "goblet-squat", sets: [LoggedSetEntry(reps: 8, load: LoggedLoadEntry(value: 16, unit: .kg, convention: .singleImplement), rir: 3)])]),
            response: .unknown))
        let sa = try XCTUnwrap(str["actual"] as? [String: Any])
        XCTAssertEqual(sa["sport"] as? String, "STRENGTH"); XCTAssertEqual(Set(sa.keys), ["completed", "minutes", "exercises", "sport"])
        XCTAssertEqual(Set(try encoded(SessionResponse.unknown).keys), ["performance", "recovery", "effort", "nextDayFunction"], "unknown is sent as UNKNOWN, never omitted")
    }

    /// Every review encodes only custody's CLIENT_REVIEW_FIELDS, with the kinds api.mjs and custody use.
    func testReviewsUseOnlyClientReviewFields() throws {
        let allowed = Set(try Self.list(Repo.text(Self.custody), "CLIENT_REVIEW_FIELDS"))
        let sets = try signSets()
        func set(_ c: String) throws -> WarningSignQuestionSet { try XCTUnwrap(sets.first { $0.condition == c }, c) }
        let o = AthleteObservation.plannedRun(sessionId: "s", occurrenceDate: "2026-11-17", actual: PlannedRunActual(completed: false), response: .unknown)
        let cases: [(ReviewRequest, String)] = [
            (ReviewRequest(.sessionReports([o]), eligibility: Self.screen), "WEEKLY_REVIEW"),
            (ReviewRequest(.missedSession(o), eligibility: nil), "MISSED_SESSION"),
            (ReviewRequest(.notFeeling100(WellbeingDeclaration(condition: .unusualFatigue, set: try set("UNUSUAL_FATIGUE"), intent: .reduceLight, days: 2), reports: []), eligibility: Self.screen), "NOT_FEELING_100"),
            (ReviewRequest(.wellbeingCheck(WellbeingCheckAnswers(set: try set("MILD_ILLNESS")), reports: []), eligibility: nil), "WELLBEING_CHECK"),
            (ReviewRequest(.readiness(ReadinessDeclaration(declaredRecovered: true, set: try set("READINESS"), sports: .init(run: .init(ready: true), strength: .init(ready: true, restrictions: []))), reports: []), eligibility: Self.screen), "READINESS_DECLARATION"),
            (ReviewRequest(.reportBreak(BreakReport(reasonCategory: "TRAVEL", nonclinical: true, startDate: "2026-11-18", endDate: "2026-11-24")), eligibility: Self.screen), "RETURN_AFTER_PAUSE"),
            (ReviewRequest(.unavailableDays(["2026-11-19"]), eligibility: Self.screen), "UNAVAILABLE_DAY"),
            (ReviewRequest(.preferences(volume: ["RUN": .lower], difficulty: nil), eligibility: nil), "PREFERENCE_CHANGE"),
            (ReviewRequest(.coach(profile: "BALANCED"), eligibility: nil), "PREFERENCE_CHANGE"),
            (ReviewRequest(.exerciseSubstitution(ExerciseSubstitution(exerciseId: "x", reason: .skillMismatch, nonclinicalConfirmed: true)), eligibility: Self.screen), "EXERCISE_SUBSTITUTION"),
        ]
        for (r, kind) in cases {
            let e = try encoded(r)
            XCTAssertEqual(e["kind"] as? String, kind)
            XCTAssertTrue(Set(e.keys).isSubset(of: allowed), "\(kind): \(Set(e.keys).subtracting(allowed))")
        }
        XCTAssertEqual(try encoded(cases[1].0)["targetSessionId"] as? String, "s")
        let api = try Repo.text("CoachingCore/src/boundary/api.mjs")
        for k in ["'NOT_FEELING_100'", "'WELLBEING_CHECK'", "'READINESS_DECLARATION'", "'RETURN_AFTER_PAUSE'", "'UNAVAILABLE_DAY'", "'PREFERENCE_CHANGE'", "'MISSED_SESSION'"] {
            XCTAssertTrue(api.contains(k), k)
        }
        XCTAssertTrue(try Repo.text(Self.custody).contains("'EXERCISE_SUBSTITUTION'"))
    }

    /// GAP-03: the F08 forms encode only their reader's keys, and only the signs the engine asked; an unasked sign cannot be set.
    func testF08FormsAskExactlyTheEngineSigns() throws {
        let sets = try signSets()
        XCTAssertEqual(sets.map(\.condition), ["MILD_INDISPOSITION", "UNUSUAL_FATIGUE", "MILD_ILLNESS", "MINOR_DISCOMFORT", "NEED_REST", "READINESS"])
        XCTAssertEqual(sets.map(\.warningSigns.count), [15, 13, 15, 9, 9, 15], "9/13/15 by condition; never a fixed number in the UI")
        let fatigue = try XCTUnwrap(sets.first { $0.condition == "UNUSUAL_FATIGUE" }), minor = try XCTUnwrap(sets.first { $0.condition == "MINOR_DISCOMFORT" })
        var w = WellbeingDeclaration(condition: .minorDiscomfort, set: minor, intent: .reduceLight, days: 2)
        XCTAssertThrowsError(try w.warningSigns.answer("bodyWideAches", false), "bodyWideAches is not asked for MINOR_DISCOMFORT") {
            XCTAssertEqual($0 as? SignAnswers.Invalid, .notAsked("bodyWideAches"))
        }
        for s in minor.warningSigns.dropLast() { try w.warningSigns.answer(s, false) }
        XCTAssertEqual(w.warningSigns.unanswered, [minor.warningSigns.last!])
        let e = try encoded(w)
        XCTAssertTrue(Set(e.keys).isSubset(of: Set(try Self.f08Keys("w"))))
        XCTAssertEqual((e["warningSigns"] as? [String: Bool])?.count, 8, "the unanswered sign is omitted (asked again), never sent as false")
        XCTAssertTrue(Set(try encoded(WellbeingCheckAnswers(set: fatigue, improved: true)).keys).isSubset(of: Set(try Self.f08Keys("c"))))
        let r = ReadinessDeclaration(declaredRecovered: true, set: try XCTUnwrap(sets.last), sports: .init(run: .init(ready: true), strength: nil))
        XCTAssertTrue(Set(try encoded(r).keys).isSubset(of: Set(try Self.f08Keys("r"))))
        // The vocabulary is the engine's: every sign of every set is one of WARNING_SIGNS / EXERCISE_SIGNS.
        let f08 = try Repo.text(Self.f08)
        for s in sets.flatMap({ $0.warningSigns + $0.exerciseSigns }) { XCTAssertTrue(f08.contains(":'\(s)'"), s) }
    }

    /// V1HR5R: null clears, an omitted field is left as it is.
    func testHeartRateProfileRequestEncoding() throws {
        let enc = JSONEncoder(); enc.outputFormatting = .sortedKeys
        XCTAssertEqual(String(data: try enc.encode(HeartRateProfileRequest(maxHeartRateBpm: .some(195))), encoding: .utf8), #"{"maxHeartRateBpm":195}"#)
        XCTAssertEqual(String(data: try enc.encode(HeartRateProfileRequest(zoneUpperBpm: .some([130, 150, 165, 180]))), encoding: .utf8), #"{"zoneUpperBpm":[130,150,165,180]}"#)
        XCTAssertEqual(String(data: try enc.encode(HeartRateProfileRequest(maxHeartRateBpm: .some(nil), zoneUpperBpm: .some(nil))), encoding: .utf8), #"{"maxHeartRateBpm":null,"zoneUpperBpm":null}"#)
        XCTAssertEqual(String(data: try enc.encode(HeartRateProfileRequest()), encoding: .utf8), "{}")
    }
}
