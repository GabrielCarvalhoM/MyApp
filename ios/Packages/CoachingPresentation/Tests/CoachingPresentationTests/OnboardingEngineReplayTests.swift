import XCTest
@testable import CoachingPresentation

#if os(macOS)
/// CCP-ONB-1 (#109): each new field and each case, ENCODED BY SWIFT, through the real boundary (`Facade/e2e-runner.mjs`: `createIntegration` +
/// `api.mjs`, the current runtime), with what the engine READ from it (`engineRead`: the stored plan's canonical intake, disclosures and first
/// week) and the readings the app decodes. Validated separately, as the Founder asked: contract, single sport, beginners with no history,
/// goals, preferences, safety. With CCP_ONB_REPLAY_DIR set, the Swift-encoded input and the engine's raw answers are written there (the replay
/// evidence of audits/v1-ios-integration-2026-11-26/results/i109-ccp-onb/).
final class OnboardingEngineReplayTests: XCTestCase {
    typealias Step = EndToEndBoundaryTests.Step
    typealias Case = EndToEndBoundaryTests.Case
    static func intake(_ a: OnboardingAnswers) -> IntakeRequest {
        IntakeRequest(answers: a, asOf: "2026-11-13", timezoneOffsetMinutes: -180, learningConsent: true, mode: .syntheticShadowReference)
    }
    static func journey(_ name: String, _ a: OnboardingAnswers, _ more: [String] = []) -> Case {
        Case(name: name, steps: [Step(op: "enroll", intake: intake(a)), Step(op: "engineRead")] + more.map { Step(op: $0) })
    }
    static func with(_ f: (inout OnboardingAnswers) -> Void) -> OnboardingAnswers { var a = RequestSchemaTests.answers(); f(&a); return a }
    static let load = { (kg: Double, c: LoadConvention) in LoggedLoadEntry(value: kg, unit: .kg, convention: c) }
    static let onlyStrength = with {
        $0.athlete.goals = IntakeGoals(run: RunGoal(kind: "NONE"), strength: "STRENGTH"); $0.athlete.runTrainingMonths = nil; $0.athlete.performanceAnchors = []
        $0.athlete.recent = RecentTraining(strengthDaysPerWeek: 2, runDaysPerWeek: nil, runMinutesPerWeek: nil, longestRunMinutes: nil)
        $0.schedule = TrainingSchedule(strengthDays: [1, 3, 5], strengthMinutes: 45, runDays: [], runMinutes: nil, longRunMinutes: nil, longRunDay: nil, runTurn: nil, strengthTurn: "PM")
        $0.weeks = nil
    }
    static func onlyRun(goal: String = "REGULAR", months: Int?, recent: RecentTraining) -> OnboardingAnswers { with {
        $0.athlete.goals = IntakeGoals(run: RunGoal(kind: goal), strength: "NONE"); $0.athlete.strengthTrainingMonths = nil; $0.athlete.runTrainingMonths = months
        $0.athlete.recent = recent; $0.athlete.equipment = []; if months == 0 { $0.athlete.performanceAnchors = [] }
        $0.schedule = TrainingSchedule(strengthDays: [], strengthMinutes: nil, runDays: [1, 3, 6], runMinutes: 40, longRunMinutes: 60, longRunDay: 6, runTurn: "AM", strengthTurn: nil)
        $0.weeks = nil
    } }
    static func marathon(_ met: Bool) -> OnboardingAnswers { with {
        $0.weeks = 16; $0.athlete.goals.run = RunGoal(kind: "RACE", event: GoalEvent(kind: "MARATHON", date: "2027-02-28"))
        if met { $0.athlete.recent = RecentTraining(strengthDaysPerWeek: 2, runDaysPerWeek: 5, runMinutesPerWeek: 300, longestRunMinutes: 120)
                 $0.schedule.runDays = [0, 1, 3, 5, 6]; $0.schedule.longRunMinutes = 180 }
    } }
    static let everyNewField = with {
        $0.athlete.knownExercises = [KnownExercise(id: "back-squat", sets: 4, reps: 5, rir: 3, load: load(90, .total))]
        $0.athlete.coaching = IntakeCoaching(profile: .demanding); $0.athlete.goals.run.event?.timeGoalMinutes = 44.5
        $0.schedule.temporaryPreference = .strength; $0.schedule.sameTurnConfirmed = true
    }

    static let cases: [Case] = [
        // Contract: the earlier intake, unchanged.
        journey("C0-earlier-intake", RequestSchemaTests.answers(), ["weekPlan"]),
        // Field: known loads (26), time goal (05), priority (07), shifts and the shared day (09, 838:4011), coach (15), result conditions (24).
        journey("F1-known-loads", with { $0.athlete.knownExercises = [
            KnownExercise(id: "back-squat", sets: 4, reps: 5, rir: 3, load: load(90, .total)), KnownExercise(id: "barbell-row", sets: 3, reps: 8, rir: 2, load: load(60, .total)),
            KnownExercise(id: "lat-pulldown", sets: 3, reps: 10, rir: 2, load: load(50, .machineStack)), KnownExercise(id: "leg-press", sets: nil, reps: nil, rir: nil, load: nil)] }),
        journey("F2-time-goal", with { $0.athlete.goals.run.event?.timeGoalMinutes = 44.5 }, ["presentation"]),
        journey("F3-priority-run", with { $0.schedule.temporaryPreference = .run }),
        journey("F3-priority-strength", with { $0.schedule.temporaryPreference = .strength }),
        journey("F3-priority-balance", RequestSchemaTests.answers()),
        journey("F4-shifts-not-answered", with { $0.schedule.runTurn = nil; $0.schedule.strengthTurn = nil }),
        journey("F4-same-shift-confirmed", with { $0.schedule.runTurn = nil; $0.schedule.strengthTurn = nil; $0.schedule.sameTurnConfirmed = true }),
        journey("F5-coach-conservative", with { $0.athlete.coaching = IntakeCoaching(profile: .conservative) }),
        journey("F5-coach-balanced", with { $0.athlete.coaching = IntakeCoaching(profile: .balanced) }),
        journey("F5-coach-demanding", with { $0.athlete.coaching = IntakeCoaching(profile: .demanding) }),
        journey("F6-result-conditions", with { $0.athlete.performanceAnchors = [
            PerformanceAnchor(id: "a-heat", kind: "RACE_RESULT", distance: "10K", seconds: 3000, date: "2026-11-01", measurement: "OFFICIAL", rpe: 9, tolerated: true, conditions: [.heat]),
            PerformanceAnchor(id: "a-teste", kind: "TIME_TRIAL", distance: "5K", seconds: 1400, date: "2026-11-02", measurement: nil, rpe: 9, tolerated: true, conditions: []),
            PerformanceAnchor(id: "a-pista", kind: "TIME_TRIAL", distance: "5K", seconds: 1420, date: "2026-10-30", measurement: "TRACK", rpe: 9, tolerated: true, conditions: [])] },
            ["presentation"]),
        // Single sport.
        journey("S1-only-strength", onlyStrength, ["weekPlan"]),
        journey("S2-only-run", onlyRun(months: 36, recent: RecentTraining(strengthDaysPerWeek: nil, runDaysPerWeek: 3, runMinutesPerWeek: 120, longestRunMinutes: 50)), ["weekPlan"]),
        // Beginners with no history (SSCTR D12): "Já corri e parei" with 2 days and nothing else; "Nunca corri" (true zeros).
        journey("B1-stopped-runner", onlyRun(goal: "GENERAL", months: 0, recent: RecentTraining(strengthDaysPerWeek: nil, runDaysPerWeek: 2, runMinutesPerWeek: nil, longestRunMinutes: nil))),
        journey("B2-never-ran", onlyRun(goal: "GENERAL", months: 0, recent: RecentTraining(strengthDaysPerWeek: nil, runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0))),
        // Goals: no race and no plan length; the marathon (31) preparatory and block.
        journey("G1-no-race-no-weeks", with { $0.athlete.goals.run = RunGoal(kind: "PERFORMANCE"); $0.weeks = nil }, ["weekPlan"]),
        journey("G2-marathon-preparatory", marathon(false), ["weekPlan"]),
        journey("G3-marathon-block", marathon(true), ["weekPlan"]),
        // Safety: no new field opens a plan the screen or the population closes.
        journey("X1-clinical-with-every-new-field", with { $0 = everyNewField; $0.athlete.eligibility.pain = true }),
        journey("X2-pregnancy-only-strength", with { $0 = onlyStrength; $0.athlete.specialPopulation = [.pregnancy] }),
        journey("X3-postpartum-with-every-new-field", with { $0 = everyNewField; $0.athlete.specialPopulation = [.postpartum] }),
        journey("X4-unanswered-flag-with-every-new-field", with { $0 = everyNewField; $0.athlete.eligibility.injury = nil }),
    ]

    func testEveryFieldAndCaseThroughTheEngine() throws {
        let r = try Self.run(Self.cases)
        func read(_ n: String) throws -> AnyJSON { try XCTUnwrap(r[n]?[1].answer, n) }
        func outcome(_ n: String) throws -> PlanOutcome { try JSONDecoder().decode(BoundaryAnswer.self, from: try XCTUnwrap(r[n]?[0].answer, n).data()).planOutcome }
        for c in Self.cases where !c.name.hasPrefix("X") { XCTAssertEqual(try outcome(c.name), .planCreated, c.name) }
        let c0 = try read("C0-earlier-intake")
        XCTAssertEqual(c0["canonical"]?["coaching"], .null); XCTAssertEqual(c0["temporaryPreference"], .null); XCTAssertEqual(c0["weeks"], .number(8))

        // F1: each load is a starting hint, never a prescribed dose (the screen does not ask current / tolerated / when): ESTABLISH rows.
        let known = try XCTUnwrap(try read("F1-known-loads")["canonical"]?["athlete"]?["knownExercises"]?.array)
        XCTAssertEqual(known.compactMap { $0["id"]?.string }, ["back-squat", "barbell-row", "lat-pulldown", "leg-press"])
        XCTAssertEqual(known[0]["loadHint"]?["value"], .number(90)); XCTAssertEqual(known[0]["dose"], .null); XCTAssertEqual(known[3]["loadHint"], .null)
        XCTAssertTrue(known.allSatisfy { $0["familiar"] == .bool(true) })
        let squat = try XCTUnwrap(try read("F1-known-loads")["firstWeekStrength"]?.array?.first { $0["id"]?.string == "back-squat" })
        XCTAssertEqual(squat["load"]?["mode"]?.string, "ESTABLISH")
        // F2: context only, compared with the estimate.
        XCTAssertEqual(try read("F2-time-goal")["canonical"]?["goals"]?["event"]?["timeGoalMinutes"], .number(44.5))
        let pres = try JSONDecoder().decode(PresentationSnapshot.self, from: try XCTUnwrap(r["F2-time-goal"]?[2].answer).data())
        let goal = try XCTUnwrap(pres.readings?.runCalibration?.goal)
        XCTAssertEqual(goal.goalSeconds, 2670); XCTAssertEqual(goal.usedForPace, false); XCTAssertEqual(goal.isPrediction, false); XCTAssertNotNil(goal.relation)
        // F3, F4, F5.
        for (n, want) in [("F3-priority-run", AnyJSON.string("RUN")), ("F3-priority-strength", .string("STRENGTH")), ("F3-priority-balance", .null)] {
            XCTAssertEqual(try read(n)["temporaryPreference"], want, n); XCTAssertEqual(try read(n)["canonical"]?["schedule"]?["temporaryPreference"], want, n)
        }
        let unset = try XCTUnwrap(try read("F4-shifts-not-answered")["negotiation"]?.array).compactMap { $0["id"]?.string }
        XCTAssertTrue(unset.contains("SHARED_DAY_TURN_UNKNOWN") && unset.contains("BACK_TO_BACK_CONFIRMATION"), "\(unset)")
        let confirmed = try read("F4-same-shift-confirmed")
        XCTAssertEqual(confirmed["canonical"]?["schedule"]?["sameTurnConfirmed"], .bool(true))
        XCTAssertFalse(try XCTUnwrap(confirmed["negotiation"]?.array).contains { $0["id"]?.string == "BACK_TO_BACK_CONFIRMATION" })
        for (n, p) in [("F5-coach-conservative", "CONSERVATIVE"), ("F5-coach-balanced", "BALANCED"), ("F5-coach-demanding", "DEMANDING")] {
            XCTAssertEqual(try read(n)["canonical"]?["coaching"]?["profile"]?.string, p, n)
        }
        XCTAssertTrue(try XCTUnwrap(try read("F5-coach-conservative")["negotiation"]?.array).contains { $0["id"]?.string == "COACH_CONSERVATIVE" })
        // F6: a stated condition and an unknown measurement ("Teste") keep the result out of calibration; a normal track result calibrates.
        let evidence = try XCTUnwrap(r["F6-result-conditions"]?[2].answer["readings"]?["runCalibration"]?["evidence"]?.array)
        let use = Dictionary(uniqueKeysWithValues: evidence.compactMap { e in e["id"]?.string.map { ($0, e) } })
        XCTAssertEqual(use["a-heat"]?["reasons"]?.strings, ["CONDITIONS_NOT_COMPARABLE"]); XCTAssertEqual(use["a-heat"]?["use"]?.string, "REJECTED")
        XCTAssertEqual(use["a-teste"]?["reasons"]?.strings, ["MEASUREMENT_UNKNOWN"]); XCTAssertEqual(use["a-pista"]?["use"]?.string, "CAPACITY")

        // Single sport: the other sport is not programmed and none of its facts was invented.
        let s1 = try read("S1-only-strength"), s2 = try read("S2-only-run")
        XCTAssertEqual(s1["capability"]?["run"], .bool(false)); XCTAssertEqual(s1["capability"]?["strength"], .bool(true)); XCTAssertEqual(s1["weeks"], .number(12))
        XCTAssertEqual(s1["canonical"]?["schedule"]?["longRunDay"], .null); XCTAssertEqual(s1["canonical"]?["athlete"]?["recentRun"]?["runMinutesPerWeek"], .null)
        XCTAssertEqual(s2["capability"]?["strength"], .bool(false)); XCTAssertEqual(s2["capability"]?["run"], .bool(true)); XCTAssertEqual(s2["canonical"]?["schedule"]?["strengthMinutes"], .null)
        // Beginners: a missing exposure stays missing (conservative establishment, disclosed); zeros only for "Nunca corri".
        let b1 = try read("B1-stopped-runner"), b2 = try read("B2-never-ran")
        XCTAssertEqual(b1["canonical"]?["athlete"]?["recentRun"]?["runMinutesPerWeek"], .null); XCTAssertEqual(b1["canonical"]?["athlete"]?["recentRun"]?["runDaysPerWeek"], .number(2))
        XCTAssertTrue(try XCTUnwrap(b1["uncertainty"]?.array).contains { $0["field"]?.string == "recent.runMinutesPerWeek" && $0["category"]?.string == "SAFE_CONSERVATIVE_ESTABLISHMENT" })
        XCTAssertEqual(b2["canonical"]?["athlete"]?["recentRun"]?["runMinutesPerWeek"], .number(0)); XCTAssertEqual(b1["capability"]?["runClass"]?.string, "WALK_JOG")
        // Goals: no race, no weeks → the engine's 12; the marathon criteria as the engine listed them.
        XCTAssertEqual(try read("G1-no-race-no-weeks")["weeks"], .number(12)); XCTAssertEqual(try read("G1-no-race-no-weeks")["canonical"]?["weeks"], .number(12))
        let prep = try JSONDecoder().decode(WeekPlanProjection.self, from: try XCTUnwrap(r["G2-marathon-preparatory"]?[2].answer).data())
        XCTAssertEqual(prep.marathon?.status, "PREPARATORY"); XCTAssertEqual(prep.marathon?.date, "2027-02-28")
        XCTAssertEqual(prep.marathon?.unmet.map(\.id), ["LONGEST_RUN", "LONG_RUN_TIME"]); XCTAssertEqual(prep.marathon?.unmet.first?.needed, .number(90))
        let engineUnmet = try XCTUnwrap(try read("G2-marathon-preparatory")["negotiation"]?.array?.first { $0["id"]?.string == "MARATHON_PREPARATORY_PLAN" }?["unmet"]?.array)
        XCTAssertEqual(engineUnmet.compactMap { $0["id"]?.string }, prep.marathon?.unmet.map(\.id.raw), "the projection is the plan's own disclosure")
        let block = try JSONDecoder().decode(WeekPlanProjection.self, from: try XCTUnwrap(r["G3-marathon-block"]?[2].answer).data())
        XCTAssertEqual(block.marathon?.status, "BLOCK"); XCTAssertEqual(block.marathon?.unmet, [])
        // SSCTR C5: the preparatory disclosure, verbatim from the plan (screen 31 shows it whenever the plan is preparatory).
        let d = try XCTUnwrap(prep.marathon?.disclosures?.first); XCTAssertEqual(prep.marathon?.disclosures?.map(\.id.raw), ["MARATHON_PREPARATORY_PLAN"])
        let engineDisclosure = try XCTUnwrap(try read("G2-marathon-preparatory")["negotiation"]?.array?.first { $0["id"]?.string == "MARATHON_PREPARATORY_PLAN" })
        XCTAssertEqual(d.blocking, false); XCTAssertEqual(d.options.map(\.english), ["Keep the preparatory plan", "Choose a later marathon", "Choose a 10K or half marathon first"])
        for fact in ["it does not prepare you for the marathon date you gave", "no date is promised", "do not train for 7 days after it"] {
            XCTAssertTrue(d.detail?.english.contains(fact) == true, fact)
        }
        XCTAssertNotNil(engineDisclosure["unmet"], "the engine's own disclosure (engineRead keeps id and unmet; the text is the projection's)")
        XCTAssertEqual(block.marathon?.disclosures?.map(\.id.raw), ["MARATHON_BLOCK_NOTES", "MARATHON_PROJECTION"])
        XCTAssertNotNil(block.marathon?.disclosures?.last?.projectedLongRunMinutes)
        for n in ["C0-earlier-intake", "S1-only-strength", "G1-no-race-no-weeks"] {
            XCTAssertNil(try JSONDecoder().decode(WeekPlanProjection.self, from: try XCTUnwrap(r[n]?[2].answer).data()).marathon, n)
        }

        // Safety.
        XCTAssertEqual(try outcome("X1-clinical-with-every-new-field"), .clinicalHumanRequired)
        XCTAssertEqual(try outcome("X2-pregnancy-only-strength"), .outsideV1Scope(reason: "Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1"))
        XCTAssertEqual(try outcome("X3-postpartum-with-every-new-field"), .outsideV1Scope(reason: "Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1"))
        XCTAssertEqual(try outcome("X4-unanswered-flag-with-every-new-field"), .needsInput(["athlete.eligibility.currentNonclinicalAssessment"]))
        for n in ["X1-clinical-with-every-new-field", "X2-pregnancy-only-strength", "X3-postpartum-with-every-new-field", "X4-unanswered-flag-with-every-new-field"] {
            XCTAssertEqual(r[n]?[1].answer["error"]?["code"]?.string, "NOT_ENROLLED", "\(n): no plan, never an empty plan")
        }
        // Transport: the new keys reached the boundary.
        XCTAssertEqual(r["X1-clinical-with-every-new-field"]?[0].received?["athleteKeys"]?.strings?.contains("knownExercises"), true)
        XCTAssertEqual(r["F4-same-shift-confirmed"]?[0].received?["scheduleKeys"]?.strings?.contains("sameTurnConfirmed"), true)
        XCTAssertEqual(r["S1-only-strength"]?[0].received?["intakeKeys"]?.strings?.contains("weeks"), false)
    }

    /// QRE P1 (PR #119): a marked clinical sign always reaches the engine, in every draft that was held before CCP-ONB-1 — single sport (either),
    /// no race and no plan length, the combined Cuidados item, and the item left unmarked — and the engine routes it to a qualified human first.
    /// The screen is the UI's: one sign marked, the other flags unanswered (nil, omitted), no nonclinical confirmation.
    static let signs: [(String, WritableKeyPath<EligibilityScreen, Bool?>)] = [("pain", \.pain), ("persistentPain", \.persistentPain), ("injury", \.injury),
        ("illness", \.illness), ("functionalLimitation", \.functionalLimitation), ("clinicalConcern", \.clinicalConcern)]
    static let heldDrafts: [(String, OnboardingAnswers)] = [
        ("only-strength", onlyStrength),
        ("only-run", onlyRun(months: 36, recent: RecentTraining(strengthDaysPerWeek: nil, runDaysPerWeek: 3, runMinutesPerWeek: 120, longestRunMinutes: 50))),
        ("no-race-no-weeks", with { $0.athlete.goals.run = RunGoal(kind: "REGULAR"); $0.weeks = nil }),
        ("combined-item", with { $0.athlete.specialPopulationNotStated = .pregnancyOrPostpartumUnspecified }),
        ("box-not-answered", with { $0.athlete.specialPopulationNotStated = .notAnswered }),
    ]
    static var clinicalCases: [Case] {
        signs.flatMap { sign, key in heldDrafts.map { draft, a in
            var x = a; x.athlete.eligibility = EligibilityScreen(status: nil, assessedAt: "2026-11-13", pain: nil, persistentPain: nil, injury: nil, illness: nil,
                                                                 functionalLimitation: nil, clinicalConcern: nil)
            x.athlete.eligibility[keyPath: key] = true
            return Case(name: "K-\(sign)-\(draft)", steps: [Step(op: "enroll", intake: intake(x)), Step(op: "plan")])
        } }
    }
    func testEveryClinicalSignReachesTheEngineFromEveryHeldDraft() throws {
        let cases = Self.clinicalCases; XCTAssertEqual(cases.count, 30)
        let r = try Self.run(cases, evidence: "clinical")
        for c in cases {
            let a = try XCTUnwrap(r[c.name], c.name)
            XCTAssertEqual(try JSONDecoder().decode(BoundaryAnswer.self, from: try a[0].answer.data()).planOutcome, .clinicalHumanRequired, c.name)
            XCTAssertEqual(a[0].answer["enrolled"], .bool(false), c.name); XCTAssertEqual(a[1].answer["error"]?["code"]?.string, "NOT_ENROLLED", c.name)
            if c.name.hasSuffix("combined-item") || c.name.hasSuffix("box-not-answered") {
                XCTAssertEqual(a[0].received?["athleteKeys"]?.strings?.contains("specialPopulation"), false, "\(c.name): no code, never 'none'")
            }
        }
    }

    /// The runner, as EndToEndBoundaryTests runs it, keeping the raw answers for the replay evidence.
    static func run(_ cases: [Case], evidence: String = "fields") throws -> [String: [EndToEndBoundaryTests.AnswerOut]] {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("cp-onb-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: dir) }
        struct Input: Encodable { let cases: [Case] }
        let e = JSONEncoder(); e.outputFormatting = [.sortedKeys]
        let input = dir.appendingPathComponent("in.json"); let data = try e.encode(Input(cases: cases)); try data.write(to: input)
        let (status, out) = try node([Repo.facade.appendingPathComponent("e2e-runner.mjs").path, input.path])
        XCTAssertEqual(status, 0, out)
        let last = try XCTUnwrap(out.split(separator: "\n").last.map(String.init), out)
        if let keep = ProcessInfo.processInfo.environment["CCP_ONB_REPLAY_DIR"] {
            let k = URL(fileURLWithPath: keep); try FileManager.default.createDirectory(at: k, withIntermediateDirectories: true)
            try data.write(to: k.appendingPathComponent("replay-\(evidence)-input-swift-encoded.json"))
            let pretty = try JSONSerialization.data(withJSONObject: try JSONSerialization.jsonObject(with: Data(last.utf8)), options: [.prettyPrinted, .sortedKeys])
            try pretty.write(to: k.appendingPathComponent("replay-\(evidence)-output-engine.json"))
        }
        let o = try JSONDecoder().decode(EndToEndBoundaryTests.Out.self, from: Data(last.utf8))
        return Dictionary(uniqueKeysWithValues: o.cases.map { ($0.name, $0.answers) })
    }
}
extension AnyJSON { var array: [AnyJSON]? { if case .array(let a) = self { return a }; return nil } }
#endif
