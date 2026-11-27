import XCTest
@testable import CoachingPresentation

/// CCP-ONB-1 (#109) contract tests: the new onboarding fields are additive (every earlier encoding byte-equivalent, every new key omitted when
/// `nil`), encode exactly the words the FROZEN engine reads (lists read from the CoachingCore bytes), and the two new readings decode.
/// The engine's reading of each field is OnboardingEngineReplayTests.
final class OnboardingIntakeTests: XCTestCase {
    static let intakeSource = "CoachingCore/src/r6-intake.mjs"
    static let baseline = "audits/v1-ios-integration-2026-11-26/results/i109-ccp-onb/baseline-intakes-before-ccp.json"

    /// The JSON of the three intakes the earlier contract encoded, captured before this change: the same objects today (old encodings valid).
    func testEarlierEncodingsAreUnchanged() throws {
        let before = try XCTUnwrap(try JSONSerialization.jsonObject(with: Data(Repo.text(Self.baseline).utf8)) as? [String: Any])
        let now: [String: IntakeRequest] = ["base": RequestSchemaTests.intake(), "pregnancy": RequestSchemaTests.intake(special: [.pregnancy]),
                                            "hr": RequestSchemaTests.intake(hr: HeartRateProfileRequest(maxHeartRateBpm: .some(195)))]
        XCTAssertEqual(Set(before.keys), Set(now.keys))
        for (name, intake) in now {
            XCTAssertEqual(try encoded(intake) as NSDictionary, try XCTUnwrap(before[name] as? [String: Any]) as NSDictionary, name)
        }
    }

    /// Every new key is absent when its value is `nil`; a present value encodes the engine's word at the engine's path.
    func testNewFieldsEncodeAtTheEnginePaths() throws {
        var a = RequestSchemaTests.answers()
        a.athlete.knownExercises = [KnownExercise(id: "back-squat", sets: 4, reps: 5, rir: 3, load: LoggedLoadEntry(value: 90, unit: .kg, convention: .total)),
                                    KnownExercise(id: "lat-pulldown", sets: nil, reps: nil, rir: nil, load: nil)]
        a.athlete.coaching = IntakeCoaching(profile: .conservative)
        a.athlete.goals.run.event?.timeGoalMinutes = 44.5
        a.athlete.performanceAnchors[0].conditions = [.heat]
        a.schedule.temporaryPreference = .run; a.schedule.sameTurnConfirmed = true
        let j = try encoded(IntakeRequest(answers: a, asOf: "2026-11-13", timezoneOffsetMinutes: -180, learningConsent: true, mode: .syntheticShadowReference))
        let athlete = try XCTUnwrap(j["athlete"] as? [String: Any]), schedule = try XCTUnwrap(j["schedule"] as? [String: Any])
        let known = try XCTUnwrap(athlete["knownExercises"] as? [[String: Any]])
        XCTAssertEqual(known[0] as NSDictionary, ["id": "back-squat", "sets": 4, "reps": 5, "rir": 3, "load": ["value": 90, "unit": "KG", "convention": "TOTAL"]] as NSDictionary)
        XCTAssertEqual(known[1] as NSDictionary, ["id": "lat-pulldown"] as NSDictionary, "an unknown dose is omitted, never zero")
        XCTAssertEqual(athlete["coaching"] as? NSDictionary, ["profile": "CONSERVATIVE"] as NSDictionary)
        let event = try XCTUnwrap(((athlete["goals"] as? [String: Any])?["run"] as? [String: Any])?["event"] as? [String: Any])
        XCTAssertEqual(event["timeGoalMinutes"] as? Double, 44.5)
        XCTAssertEqual(((athlete["performanceAnchors"] as? [[String: Any]])?.first)?["conditions"] as? [String], ["HEAT"])
        XCTAssertEqual(schedule["temporaryPreference"] as? String, "RUN"); XCTAssertEqual(schedule["sameTurnConfirmed"] as? Bool, true)

        // Nil: none of the new keys appears (the earlier key sets stay exact, RequestSchemaTests.testIntakeCarriesEverySafetyKey).
        let plain = try encoded(RequestSchemaTests.intake())
        let pa = try XCTUnwrap(plain["athlete"] as? [String: Any]), ps = try XCTUnwrap(plain["schedule"] as? [String: Any])
        XCTAssertNil(pa["knownExercises"]); XCTAssertNil(pa["coaching"]); XCTAssertNil(ps["temporaryPreference"]); XCTAssertNil(ps["sameTurnConfirmed"])
        XCTAssertNil((((pa["goals"] as? [String: Any])?["run"] as? [String: Any])?["event"] as? [String: Any])?["timeGoalMinutes"])
        XCTAssertNil(((pa["performanceAnchors"] as? [[String: Any]])?.first)?["conditions"])
    }

    /// Single sport, beginners and no race: what was not asked is omitted (no sentinel, no zero, no default plan length).
    func testWhatWasNotAskedIsOmitted() throws {
        var a = RequestSchemaTests.answers()
        a.athlete.goals = IntakeGoals(run: RunGoal(kind: "NONE"), strength: "STRENGTH"); a.athlete.runTrainingMonths = nil
        a.athlete.recent = RecentTraining(strengthDaysPerWeek: 2, runDaysPerWeek: nil, runMinutesPerWeek: nil, longestRunMinutes: nil)
        a.athlete.performanceAnchors = []
        a.schedule = TrainingSchedule(strengthDays: [1, 3, 5], strengthMinutes: 45, runDays: [], runMinutes: nil, longRunMinutes: nil, longRunDay: nil,
                                      runTurn: nil, strengthTurn: nil)
        a.weeks = nil
        let j = try encoded(IntakeRequest(answers: a, asOf: "2026-11-13", timezoneOffsetMinutes: -180, learningConsent: true, mode: .syntheticShadowReference))
        XCTAssertNil(j["weeks"], "no race: the plan length is the engine's, not the app's")
        let athlete = try XCTUnwrap(j["athlete"] as? [String: Any])
        XCTAssertNil(athlete["runTrainingMonths"]); XCTAssertEqual(athlete["strengthTrainingMonths"] as? Int, 18)
        XCTAssertEqual(athlete["recent"] as? NSDictionary, ["strengthDaysPerWeek": 2] as NSDictionary)
        XCTAssertEqual(j["schedule"] as? NSDictionary, ["strengthDays": [1, 3, 5], "strengthMinutes": 45, "runDays": [Int]()] as NSDictionary)
        // "Nunca corri": the zeros are the athlete's answer and are sent.
        let never = RecentTraining(strengthDaysPerWeek: 3, runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0)
        XCTAssertEqual(try encoded(never) as NSDictionary, ["strengthDaysPerWeek": 3, "runDaysPerWeek": 0, "runMinutesPerWeek": 0, "longestRunMinutes": 0] as NSDictionary)
    }

    /// QRE P3-8 / #110: no special-population code stated is never encoded as "none" nor as a code; without a clinical flag nothing is sent.
    func testSpecialPopulationNotStated() throws {
        for gap in SpecialPopulationGap.allCases {
            var a = RequestSchemaTests.answers(); a.athlete.specialPopulationNotStated = gap
            XCTAssertEqual(a.hold, .specialPopulationNotStated(gap), "no clinical flag: held")
            XCTAssertThrowsError(try JSONEncoder().encode(OnboardingEngineReplayTests.intake(a))) { XCTAssertEqual($0 as? IntakeHold, .specialPopulationNotStated(gap)) }
            a.athlete.eligibility = EligibilityScreen(status: nil, assessedAt: "2026-11-13", pain: nil, persistentPain: true, injury: nil, illness: nil,
                                                      functionalLimitation: nil, clinicalConcern: nil)
            XCTAssertNil(a.hold, "a clinical flag is screened by the engine first")
            let athlete = try XCTUnwrap(try encoded(OnboardingEngineReplayTests.intake(a))["athlete"] as? [String: Any])
            XCTAssertNil(athlete["specialPopulation"], "no code: the key is omitted, never []")
            a.athlete.specialPopulation = [.pregnancy]
            XCTAssertThrowsError(try JSONEncoder().encode(OnboardingEngineReplayTests.intake(a)), "a code and 'not stated' together")
        }
        XCTAssertNil(RequestSchemaTests.answers().hold)
        // Decoding an intake with no key reads "not answered" (fail closed), never "none".
        let j = try JSONEncoder().encode(RequestSchemaTests.answers().athlete)
        var o = try XCTUnwrap(try JSONSerialization.jsonObject(with: j) as? [String: Any]); o["specialPopulation"] = nil
        let back = try JSONDecoder().decode(AthleteIntake.self, from: try JSONSerialization.data(withJSONObject: o))
        XCTAssertEqual(back.specialPopulationNotStated, .notAnswered); XCTAssertEqual(back.hold, .specialPopulationNotStated(.notAnswered))
        XCTAssertEqual(try JSONDecoder().decode(AthleteIntake.self, from: j), RequestSchemaTests.answers().athlete, "round trip")
    }

    /// QRE P3 (PR #121): the hand-written coding of `AthleteIntake` drops nothing. Every stored property but `specialPopulationNotStated` (not an
    /// engine key) has a CodingKey, and a fully populated intake encodes every one of them; a property added later without a key fails here.
    func testAthleteIntakeCodingCoversEveryStoredProperty() throws {
        var a = RequestSchemaTests.answers().athlete
        a.pause = IntakePause(reasonCategory: "TRAVEL", nonclinical: true, weeks: 2)
        a.knownExercises = [KnownExercise(id: "back-squat", sets: 4, reps: 5, rir: 3, load: LoggedLoadEntry(value: 90, unit: .kg, convention: .total))]
        a.coaching = IntakeCoaching(profile: .balanced)
        let stored = Set(Mirror(reflecting: a).children.compactMap(\.label)).subtracting(["specialPopulationNotStated"])
        XCTAssertEqual(stored, Set(AthleteIntake.CodingKeys.allCases.map(\.rawValue)), "a stored property without a CodingKey, or a key without a property")
        XCTAssertEqual(Set(try encoded(a).keys), stored, "a fully populated intake encodes every property")
        XCTAssertEqual(try JSONDecoder().decode(AthleteIntake.self, from: JSONEncoder().encode(a)), a, "round trip")
    }

    /// D03 (QRE P3, PR #121): a race always sends its weeks; a clinical flag still reaches the engine (it is screened first, nothing enrolled).
    func testRaceWithoutWeeksIsHeld() throws {
        var a = RequestSchemaTests.answers(); a.weeks = nil
        XCTAssertEqual(a.hold, .raceWithoutWeeks)
        XCTAssertThrowsError(try JSONEncoder().encode(OnboardingEngineReplayTests.intake(a))) { XCTAssertEqual($0 as? IntakeHold, .raceWithoutWeeks) }
        a.athlete.goals.run = RunGoal(kind: "PERFORMANCE"); XCTAssertNil(a.hold, "no race: the engine's 12 weeks")
        var c = RequestSchemaTests.answers(); c.weeks = nil; c.athlete.eligibility.injury = true
        XCTAssertNil(c.hold); XCTAssertNil(try encoded(OnboardingEngineReplayTests.intake(c))["weeks"])
    }

    /// The new words are the frozen engine's, read from its bytes.
    func testNewEnumerationsAreTheFrozenOnes() throws {
        XCTAssertEqual(CoachProfile.allCases.map(\.rawValue), try RequestSchemaTests.list(Repo.text("CoachingCore/src/v1-coaching.mjs"), "COACH_PROFILES"))
        let intake = try Repo.text(Self.intakeSource)
        XCTAssertTrue(intake.contains("const temporaryPreference=['RUN','STRENGTH'].includes("), "the engine's priority words")
        XCTAssertEqual(TemporaryPreference.allCases.map(\.rawValue), ["RUN", "STRENGTH"])
        XCTAssertTrue(intake.contains("event.timeGoalMinutes=number(event.timeGoalMinutes,10,400)?event.timeGoalMinutes:null;"))
        XCTAssertTrue(intake.contains("sameTurnConfirmed:s.sameTurnConfirmed===true"))
        XCTAssertTrue(intake.contains("coaching=canonicalCoaching(a.coaching??source.coaching,coachingErrors)"))
        XCTAssertTrue(intake.contains("const weeks=source.weeks??12;"), "no weeks: the engine's 12")
        let rc = try XCTUnwrap(try JSONSerialization.jsonObject(with: Data(Repo.text("CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json").utf8)) as? [String: Any])
        let excluded = try XCTUnwrap((rc["evidence"] as? [String: Any])?["excludedConditions"] as? [String])
        XCTAssertTrue(Set(RunCondition.allCases.map(\.rawValue)).isSubset(of: excluded), "each condition makes the result not comparable")
        // #110: no combined or unspecified special population exists, and the engine recognises only its four codes.
        XCTAssertEqual(SpecialPopulation.allCases.map(\.rawValue), ["PREGNANCY", "POSTPARTUM"])
        XCTAssertTrue(intake.contains("if(special.some(x=>['PREGNANCY','POSTPARTUM','ELITE','ADOLESCENT'].includes(x)))scope='SPECIAL_POPULATION_OUTSIDE_V1';"))
    }

    /// The readings decode the engine's shapes, every value kind of a criterion included; an unknown fact stays `nil`.
    func testNewReadingsDecode() throws {
        let goal = try JSONDecoder().decode(AthleteGoalReading.self, from: Data("""
            {"kind":"ATHLETE_GOAL","event":"10K","goalSeconds":2670,"isPrediction":false,"usedForPace":false,"relation":"FASTER_THAN_RANGE"}
            """.utf8))
        XCTAssertEqual(goal.relation, "FASTER_THAN_RANGE"); XCTAssertEqual(goal.goalSeconds, 2670); XCTAssertEqual(goal.usedForPace, false)
        let m = try JSONDecoder().decode(MarathonPlanReading.self, from: Data("""
            {"status":"PREPARATORY","date":"2027-02-28","unmet":[{"id":"LONGEST_RUN","value":null,"needed":90},
             {"id":"RUN_EXPERIENCE","value":"NOVICE","needed":["INTERMEDIATE","EXPERIENCED"]},{"id":"RETURNING_FROM_A_STOP","value":true,"needed":false},
             {"id":"RUN_DAYS","value":1,"needed":4}]}
            """.utf8))
        XCTAssertEqual(m.unmet.map(\.id), ["LONGEST_RUN", "RUN_EXPERIENCE", "RETURNING_FROM_A_STOP", "RUN_DAYS"])
        XCTAssertNil(m.unmet[0].value, "unknown is not zero"); XCTAssertEqual(m.unmet[0].needed, .number(90))
        XCTAssertEqual(m.unmet[1].value, .text("NOVICE")); XCTAssertEqual(m.unmet[1].needed, .list(["INTERMEDIATE", "EXPERIENCED"]))
        XCTAssertEqual(m.unmet[2].value, .flag(true)); XCTAssertEqual(m.unmet[3].value, .number(1), "1 is a number, never a flag")
        // An earlier projection (RM-APP-PROJECTIONS-1, no `marathon` key) still decodes.
        XCTAssertNil(try JSONDecoder().decode(WeekPlanProjection.self, from: Data(#"{"programHash":null,"startDate":null,"weeks":[]}"#.utf8)).marathon)
    }

    /// The fixtures C codes against (Facade/capture-fixtures.mjs §7, reproduced through A's production facade) decode with these types.
    func testCcpFixturesDecode() throws {
        let prep = try fixture(WeekPlanProjection.self, "onb-marathon-preparatory-week-plan")
        XCTAssertEqual(prep.marathon?.status, "PREPARATORY"); XCTAssertEqual(prep.marathon?.unmet.map(\.id.raw), ["LONGEST_RUN", "LONG_RUN_TIME"])
        XCTAssertEqual(prep.marathon?.unmet.map(\.value), [.number(80), .number(90)]); XCTAssertEqual(prep.weeks.count, 16)
        let block = try fixture(WeekPlanProjection.self, "onb-marathon-block-week-plan").marathon
        XCTAssertEqual(block?.status, "BLOCK"); XCTAssertEqual(block?.unmet, [], "the engine lists no met criteria")
        XCTAssertEqual(prep.marathon?.disclosures?.map(\.id.raw), ["MARATHON_PREPARATORY_PLAN"]); XCTAssertEqual(prep.marathon?.disclosures?.first?.options.count, 3)
        XCTAssertEqual(block?.disclosures?.map(\.id.raw), ["MARATHON_BLOCK_NOTES", "MARATHON_PROJECTION"])
        XCTAssertNil(try fixture(WeekPlanProjection.self, "P-week-plan").marathon, "a 10K plan has no marathon reading")
        let goal = try XCTUnwrap(try fixture(PresentationSnapshot.self, "onb-time-goal-presentation").readings?.runCalibration?.goal)
        XCTAssertEqual(goal.event, "10K"); XCTAssertEqual(goal.goalSeconds, 2670); XCTAssertEqual(goal.relation, "FASTER_THAN_RANGE")
        for name in ["onb-marathon-preparatory-onboard", "onb-marathon-block-onboard", "onb-time-goal-onboard", "onb-every-field-onboard", "onb-only-strength-onboard"] {
            XCTAssertEqual(try fixture(BoundaryAnswer.self, name).planOutcome, .planCreated, name)
        }
        let strengthOnly = try fixture(PlanView.self, "onb-only-strength-plan", at: ["view"])
        XCTAssertEqual(strengthOnly.sports["RUN"]?.programmed, false); XCTAssertEqual(strengthOnly.sports["STRENGTH"]?.programmed, true)
        XCTAssertEqual(strengthOnly.weeks, 12, "no plan length sent: the engine's 12")
    }
}
