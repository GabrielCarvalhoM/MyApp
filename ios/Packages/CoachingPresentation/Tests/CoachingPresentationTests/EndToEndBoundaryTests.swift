import XCTest
@testable import CoachingPresentation

#if os(macOS)
/// The mission's chain, end to end, with no hand-written JSON in between:
/// (1) the onboarding answers and forms as front C fills them → (2) the closed Swift types validate (the safety keys are required) →
/// (3) Swift encodes → (4) the JSON reaches the real boundary (`Facade/e2e-runner.mjs` plays host A: actor, request id, version, clock) →
/// (5) `createIntegration` + `api.mjs` admit it → (6) the CURRENT engine reads it → (7) the answer (a refusal by scope, a hold, an ASK, the
/// zones) is decoded by the same Swift types. A key dropped anywhere fails one of these tests.
final class EndToEndBoundaryTests: XCTestCase {
    struct Step: Encodable {
        var at: String? = nil; let op: String
        var intake: IntakeRequest? = nil; var review: ReviewRequest? = nil; var heartRateProfile: HeartRateProfileRequest? = nil
        var condition: String? = nil; var sport: String? = nil
    }
    struct Case: Encodable { let name: String; let steps: [Step] }
    struct Out: Decodable { let cases: [CaseOut] }
    struct CaseOut: Decodable { let name: String; let answers: [AnswerOut] }
    struct AnswerOut: Decodable { let op: String; let answer: AnyJSON; let received: AnyJSON? }

    /// Runs the cases through the real boundary; returns each case's answers as raw JSON objects.
    func run(_ cases: [Case]) throws -> [String: [AnswerOut]] {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("cp-e2e-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: dir) }
        struct Input: Encodable { let cases: [Case] }
        let input = dir.appendingPathComponent("in.json"); try JSONEncoder().encode(Input(cases: cases)).write(to: input)
        let (status, out) = try node([Repo.facade.appendingPathComponent("e2e-runner.mjs").path, input.path])
        XCTAssertEqual(status, 0, out)
        let last = try XCTUnwrap(out.split(separator: "\n").last.map(String.init), out)
        let o = try JSONDecoder().decode(Out.self, from: Data(last.utf8))
        return Dictionary(uniqueKeysWithValues: o.cases.map { ($0.name, $0.answers) })
    }
    func decode<T: Decodable>(_ t: T.Type, _ a: AnswerOut) throws -> T { try JSONDecoder().decode(T.self, from: try a.answer.data()) }
    static func intake(_ special: [SpecialPopulation], hr: HeartRateProfileRequest? = nil) -> IntakeRequest { RequestSchemaTests.intake(special: special, hr: hr) }

    /// GAP-02 / CHG-UI-2 2.7: pregnancy and postpartum reach the engine and stop the plan; "none" gives a plan. `received` is the runner's echo
    /// of the JSON Swift produced (it proves the encoding, not the boundary's reading); the proof that the engine read the key is the outcome
    /// (UNSUPPORTED versus PROPOSED for the same intake without it: Facade/test/projections.test.mjs) (QRE-ABC-10).
    func testSpecialPopulationReachesTheEngineAndBlocksThePlan() throws {
        let r = try run([
            Case(name: "pregnancy", steps: [Step(op: "enroll", intake: Self.intake([.pregnancy])), Step(op: "plan")]),
            Case(name: "postpartum", steps: [Step(op: "enroll", intake: Self.intake([.postpartum])), Step(op: "plan")]),
            Case(name: "none", steps: [Step(op: "enroll", intake: Self.intake([])), Step(op: "plan")]),
        ])
        for (name, want) in [("pregnancy", "PREGNANCY"), ("postpartum", "POSTPARTUM")] {
            let a = try XCTUnwrap(r[name])
            XCTAssertEqual(a[0].received?["specialPopulation"]?.strings, [want], "transport: the boundary received the key")
            let onboard = try decode(BoundaryAnswer.self, a[0])
            XCTAssertEqual(onboard.planOutcome, .outsideV1Scope(reason: "Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1"), name)
            XCTAssertEqual(onboard.enrolled, false)
            let plan = try decode(BoundaryAnswer.self, a[1])
            XCTAssertFalse(plan.ok); XCTAssertEqual(plan.error?.code, "NOT_ENROLLED"); XCTAssertEqual(plan.state, .noData, "no plan, never an empty plan")
        }
        let none = try XCTUnwrap(r["none"])
        XCTAssertEqual(none[0].received?["specialPopulation"]?.strings, [])
        XCTAssertEqual(try decode(BoundaryAnswer.self, none[0]).planOutcome, .planCreated)
        XCTAssertEqual(try decode(PlanView.self, none[1].answer["view"]!).state, .validPlan)
    }

    /// FND-ABC-04: a restart that declares a special population is refused by scope, and the record keeps the earlier plan, executable. The
    /// engine's behaviour is pinned here; the host must not start any session after it (`NotStartableReason.outsideV1Scope`).
    func testRestartDeclaringPostpartumIsRefusedButTheEarlierPlanStays() throws {
        var restart = Self.intakeAt(asOf: "2026-11-20", start: "2026-11-23", special: [.postpartum])
        restart = IntakeRequest(answers: restart.answers, asOf: restart.asOf, timezoneOffsetMinutes: -180, learningConsent: true, mode: .syntheticShadowReference)
        let r = try XCTUnwrap(try run([Case(name: "restart", steps: [Step(op: "enroll", intake: Self.intake([])),
                                                                       Step(at: "2026-11-20 10:00", op: "restart", intake: restart), Step(op: "plan")])])["restart"])
        XCTAssertEqual(r[1].received?["specialPopulation"]?.strings, ["POSTPARTUM"])
        XCTAssertEqual(try decode(BoundaryAnswer.self, r[1]).planOutcome, .outsideV1Scope(reason: "Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1"))
        let plan = try decode(PlanView.self, r[2].answer["view"]!)
        XCTAssertEqual(plan.state, .validPlan, "the engine keeps the earlier plan in force: the host gate (FND-ABC-04) is what stops it")
        XCTAssertTrue(plan.week?.sessions.contains { $0.executable } == true)
    }
    /// FND-ABC-04b: a restart declaring a clinical flag is CLINICAL_HUMAN_REQUIRED and the earlier plan also stays executable: the same gate.
    /// SSCTR-ABC-S1 C2: the "Não estou 100%" route carries the eligibility screen; a "yes" flag there is CLINICAL_HUMAN_REQUIRED.
    func testClinicalRestartAndClinicalFlagInTheWellbeingRoute() throws {
        var a = RequestSchemaTests.answers(special: []); a.startDate = "2026-11-23"; a.athlete.eligibility.assessedAt = "2026-11-20"; a.athlete.eligibility.pain = true
        let restart = IntakeRequest(answers: a, asOf: "2026-11-20", timezoneOffsetMinutes: -180, learningConsent: true, mode: .syntheticShadowReference)
        let sets = try signSets(); let set = sets.first { $0.condition == "MINOR_DISCOMFORT" }!
        var w = try WellbeingDeclaration(condition: .minorDiscomfort, set: set, intent: .reduceLight, days: 2)
        for s in w.warningSigns.asked { try w.warningSigns.answer(s, false) }
        let flag = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "2026-11-18", pain: true, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false)
        let r = try run([Case(name: "restart", steps: [Step(op: "enroll", intake: Self.intake([])), Step(at: "2026-11-20 10:00", op: "restart", intake: restart), Step(op: "plan")]),
                         Case(name: "route", steps: [Step(op: "enroll", intake: Self.intake([])), Step(at: "2026-11-18 09:00", op: "submit", review: ReviewRequest(.notFeeling100(w, reports: []), eligibility: flag)), Step(op: "plan")])])
        XCTAssertEqual(try decode(BoundaryAnswer.self, r["restart"]![1]).planOutcome, .clinicalHumanRequired)
        XCTAssertTrue(try decode(PlanView.self, r["restart"]![2].answer["view"]!).week?.sessions.contains { $0.executable } == true, "pinned: the host gate stops it")
        XCTAssertEqual(try decode(BoundaryAnswer.self, r["route"]![1]).status, "CLINICAL_HUMAN_REQUIRED")
        XCTAssertEqual(try decode(PlanView.self, r["route"]![2].answer["view"]!).state, .blocked)
    }
    static func intakeAt(asOf: String, start: String, special: [SpecialPopulation]) -> IntakeRequest {
        var a = RequestSchemaTests.answers(special: special); a.startDate = start; a.athlete.eligibility.assessedAt = asOf
        return IntakeRequest(answers: a, asOf: asOf, timezoneOffsetMinutes: -180, learningConsent: true, mode: .syntheticShadowReference)
    }

    /// GAP-03 and the F08 safety paths: the signs come from the facade; a "yes" holds; an unanswered sign is ASK; readiness is the only exit.
    func testWarningSignFlows() throws {
        let sets = try signSets()
        func set(_ c: String) -> WarningSignQuestionSet { sets.first { $0.condition == c }! }
        let screen = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "2026-11-18", pain: false, persistentPain: false, injury: false,
                                       illness: false, functionalLimitation: false, clinicalConcern: false)
        var yes = try WellbeingDeclaration(condition: .unusualFatigue, set: set("UNUSUAL_FATIGUE"), intent: .reduceLight, days: 2)
        for s in yes.warningSigns.asked { try yes.warningSigns.answer(s, s == "swelling") }
        var unanswered = try WellbeingDeclaration(condition: .minorDiscomfort, set: set("MINOR_DISCOMFORT"), intent: .reduceLight, days: 2)
        for s in unanswered.warningSigns.asked.dropFirst() { try unanswered.warningSigns.answer(s, false) }
        var allNo = try WellbeingDeclaration(condition: .minorDiscomfort, set: set("MINOR_DISCOMFORT"), intent: .reduceLight, days: 2)
        for s in allNo.warningSigns.asked { try allNo.warningSigns.answer(s, false) }
        var ready = try ReadinessDeclaration(declaredRecovered: true, set: set("READINESS"), sports: .init(run: .init(ready: true), strength: .init(ready: true, restrictions: [])))
        for s in ready.warningSigns.asked { try ready.warningSigns.answer(s, false) }
        var readyRestricted = try ReadinessDeclaration(declaredRecovered: true, set: set("READINESS"), sports: .init(run: .init(ready: true, runningNotRestricted: true), strength: .init(ready: true, restrictions: ["AVOID_LOWER_BODY_STRENGTH"])))
        for s in readyRestricted.warningSigns.asked { try readyRestricted.warningSigns.answer(s, false) }
        let screen2 = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "2026-11-21", pain: false, persistentPain: false, injury: false,
                                        illness: false, functionalLimitation: false, clinicalConcern: false)
        let r = try run([
            Case(name: "facade", steps: [Step(op: "warningSignSet", condition: "UNUSUAL_FATIGUE")]),
            Case(name: "hold", steps: [Step(op: "enroll", intake: Self.intake([])),
                                       Step(at: "2026-11-18 09:00", op: "submit", review: ReviewRequest(.notFeeling100(yes, reports: []), eligibility: screen)),
                                       Step(op: "plan"),
                                       Step(at: "2026-11-21 09:00", op: "submit", review: ReviewRequest(.readiness(ready, reports: []), eligibility: screen2)),
                                       Step(op: "plan")]),
            Case(name: "restricted", steps: [Step(op: "enroll", intake: Self.intake([])),
                                             Step(at: "2026-11-18 09:00", op: "submit", review: ReviewRequest(.notFeeling100(yes, reports: []), eligibility: screen)),
                                             Step(at: "2026-11-21 09:00", op: "submit", review: ReviewRequest(.readiness(readyRestricted, reports: []), eligibility: screen2)),
                                             Step(op: "plan")]),
            Case(name: "ask", steps: [Step(op: "enroll", intake: Self.intake([])),
                                      Step(at: "2026-11-18 09:00", op: "submit", review: ReviewRequest(.notFeeling100(unanswered, reports: []), eligibility: screen))]),
            Case(name: "keep", steps: [Step(op: "enroll", intake: Self.intake([])),
                                       Step(at: "2026-11-18 09:00", op: "submit", review: ReviewRequest(.notFeeling100(allNo, reports: []), eligibility: screen)), Step(op: "plan")]),
        ])
        XCTAssertEqual(try decode(WarningSignQuestionSet.self, r["facade"]![0]), set("UNUSUAL_FATIGUE"), "the fixture is the facade's live answer")
        let hold = try XCTUnwrap(r["hold"])
        XCTAssertEqual(try decode(BoundaryAnswer.self, hold[1]).status, "CLINICAL_HUMAN_REQUIRED")
        let blocked = try decode(PlanView.self, hold[2].answer["view"]!)
        XCTAssertEqual(blocked.state, .blocked); XCTAssertTrue(blocked.week!.sessions.allSatisfy { !$0.executable && $0.prescription == nil })
        XCTAssertEqual(blocked.hold?.exit, "READINESS_DECLARATION")
        XCTAssertTrue(try decode(BoundaryAnswer.self, hold[3]).ok)
        XCTAssertNotEqual(try decode(PlanView.self, hold[4].answer["view"]!).state, .blocked, "the readiness declaration is the exit")
        // QRE-ABC-02: the readiness exit with a lower-body restriction is reachable from Swift (runningNotRestricted).
        XCTAssertNotEqual(try decode(BoundaryAnswer.self, r["restricted"]![2]).status, "CLINICAL_HUMAN_REQUIRED")
        let rv = try decode(PlanView.self, r["restricted"]![3].answer["view"]!)
        XCTAssertNotEqual(rv.state, .blocked); XCTAssertEqual(rv.sports["STRENGTH"]?.restricted, ["LOWER"], "the engine's own region code")
        let ask = try decode(BoundaryAnswer.self, r["ask"]![1])
        XCTAssertEqual(ask.status, "ASK"); XCTAssertEqual(ask.action, "ASK")
        XCTAssertTrue((r["ask"]![1].answer["decision"]?["missingInputs"]?.strings ?? []).contains("wellbeing.warningSigns.\(set("MINOR_DISCOMFORT").warningSigns[0])"),
                      "the unanswered sign is asked again by name")
        let keep = try XCTUnwrap(r["keep"])
        XCTAssertTrue(try decode(BoundaryAnswer.self, keep[1]).ok)
        XCTAssertEqual(try decode(PlanView.self, keep[2].answer["view"]!).state, .validPlan, "nine 'no' answers for MINOR_DISCOMFORT are a complete screen")
    }

    /// GAP-12 / FND-ABC-01 and FND-ABC-02: unplanned reports with `observedAt` are each kept as a session; the same reports without it (which the
    /// Swift type cannot produce) lose the second one. A planned run stopped for a symptom raises the screen.
    func testUnplannedReportsAndSymptomStop() throws {
        let loose = AthleteObservation.unplannedRun(occurrenceDate: "2026-11-21", observedAt: "2026-11-21T18:10:00-03:00", actual: UnplannedRunActual(completed: true, minutes: 30, rpe: 3), response: .unknown)
        let str = AthleteObservation.unplannedStrength(occurrenceDate: "2026-11-21", observedAt: "2026-11-21T20:40:00-03:00",
            actual: StrengthActual(completed: true, minutes: 35, exercises: [LoggedExerciseEntry(id: "goblet-squat", sets: [LoggedSetEntry(reps: 8, load: LoggedLoadEntry(value: 16, unit: .kg, convention: .singleImplement), rir: 3)])]),
            response: .unknown)
        let screen = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "2026-11-21", pain: false, persistentPain: false, injury: false,
                                       illness: false, functionalLimitation: false, clinicalConcern: false)
        let both = ReviewRequest(.sessionReports([loose, str]), eligibility: screen)
        let stop = AthleteObservation.plannedRun(sessionId: "w0-run-d1", occurrenceDate: "2026-11-17", observedAt: "2026-11-17T07:20:00-03:00",
                                                 actual: PlannedRunActual(completed: false, minutes: 12, rpe: 7, stop: RunStop(reason: .symptom)), response: .unknown)
        let r = try run([
            Case(name: "with", steps: [Step(op: "enroll", intake: Self.intake([])), Step(at: "2026-11-21 21:00", op: "submit", review: both), Step(op: "logged")]),
            Case(name: "without", steps: [Step(op: "enroll", intake: Self.intake([])), Step(at: "2026-11-21 21:00", op: "stripObservedAt", review: both)]),
            Case(name: "stop", steps: [Step(op: "enroll", intake: Self.intake([])), Step(op: "firstSession", sport: "RUN"),
                                       Step(at: "2026-11-17 19:00", op: "submit", review: ReviewRequest(.sessionReports([stop]), eligibility: screen))]),
        ])
        let with = try XCTUnwrap(r["with"])
        XCTAssertEqual(with[1].answer["recorded"]?.strings?.count, 2); XCTAssertEqual(with[1].answer["notKept"]?.strings, [])
        let logged = try decode(LoggedEntries.self, with[2])
        XCTAssertEqual(logged.entries.map(\.sport), ["RUN", "STRENGTH"]); XCTAssertTrue(logged.entries.allSatisfy { $0.unplanned && !$0.unplannedMerge })
        XCTAssertEqual(logged.entries[1].exercises?.first?.sets.first?.load?.value, 16)
        for id in with[1].answer["recorded"]?.strings ?? [] { XCTAssertTrue(logged.keeps(id)) }
        let without = try XCTUnwrap(r["without"])
        XCTAssertEqual(without[1].answer["recorded"]?.strings?.count, 2, "the answer lists both")
        XCTAssertEqual(without[1].answer["notKept"]?.strings?.count, 1, "FND-ABC-01: without observedAt the record keeps one: why the type requires it")
        let s = try XCTUnwrap(r["stop"])
        XCTAssertEqual(s[1].answer["id"]?.string, "w0-run-d1"); XCTAssertEqual(s[1].answer["date"]?.string, "2026-11-17")
        let a = try decode(BoundaryAnswer.self, s[2])
        XCTAssertEqual(a.warningSignScreen?.status, "REQUIRED"); XCTAssertEqual(a.warningSignScreen?.reason, "RUN_STOPPED_FOR_A_SYMPTOM")
    }

    /// V1HR5R operations, from the Swift request to the decoded answer: declared maximum, custom limits refused out of order, erasure.
    func testHeartRateProfileOperations() throws {
        let r = try XCTUnwrap(try run([Case(name: "hr", steps: [
            Step(op: "enroll", intake: Self.intake([], hr: nil)),
            Step(op: "setHeartRateProfile", heartRateProfile: HeartRateProfileRequest(maxHeartRateBpm: .some(195))), Step(op: "presentation"),
            Step(op: "setHeartRateProfile", heartRateProfile: HeartRateProfileRequest(zoneUpperBpm: .some([150, 140, 165, 180]))),
            Step(op: "eraseHeartRateProfile"), Step(op: "presentation")])])["hr"])
        let set = try decode(HeartRateProfileAnswer.self, r[1])
        XCTAssertTrue(set.ok); XCTAssertEqual(set.heartRateProfile?.added.count, 1); XCTAssertEqual(set.fiveZones?.status, "AVAILABLE")
        let z = try XCTUnwrap(try decode(PresentationSnapshot.self, r[2]).readings?.runCalibration?.heartRateFiveZones)
        XCTAssertEqual(z.reference?.kind, "ATHLETE_DECLARED_MAXIMUM"); XCTAssertEqual(z.zones?.map(\.maxBpm), [126, 157, 173, 189, nil])
        let bad = try decode(BoundaryAnswer.self, r[3])
        XCTAssertFalse(bad.ok); XCTAssertEqual(bad.error?.code, "INVALID_REQUEST"); XCTAssertEqual(bad.error?.fields, ["zoneUpperBpm.strictlyIncreasing"])
        let erased = try decode(HeartRateProfileAnswer.self, r[4])
        XCTAssertTrue(erased.ok); XCTAssertEqual(erased.erased?.count, 1)
        let after = try XCTUnwrap(try decode(PresentationSnapshot.self, r[5]).readings?.runCalibration?.heartRateFiveZones)
        XCTAssertEqual(after.reference?.kind, "AGE_ESTIMATE"); XCTAssertEqual(after.reference?.bpm, 188, "220 − 32: back to the age estimate")
    }
}

/// A JSON value, for reading the runner's output without inventing a Swift type for every answer.
enum AnyJSON: Decodable, Equatable {
    case null, bool(Bool), number(Double), string(String), array([AnyJSON]), object([String: AnyJSON])
    init(from d: Decoder) throws {
        let c = try d.singleValueContainer()
        if c.decodeNil() { self = .null } else if let b = try? c.decode(Bool.self) { self = .bool(b) } else if let n = try? c.decode(Double.self) { self = .number(n) }
        else if let s = try? c.decode(String.self) { self = .string(s) } else if let a = try? c.decode([AnyJSON].self) { self = .array(a) } else { self = .object(try c.decode([String: AnyJSON].self)) }
    }
    subscript(_ k: String) -> AnyJSON? { if case .object(let o) = self { return o[k] }; return nil }
    var string: String? { if case .string(let s) = self { return s }; return nil }
    var strings: [String]? { if case .array(let a) = self { return a.compactMap(\.string) }; return nil }
    var any: Any {
        switch self {
        case .null: NSNull(); case .bool(let b): b; case .number(let n): n; case .string(let s): s
        case .array(let a): a.map(\.any); case .object(let o): o.mapValues(\.any)
        }
    }
    func data() throws -> Data { try JSONSerialization.data(withJSONObject: any, options: [.fragmentsAllowed]) }
}
extension EndToEndBoundaryTests {
    func decode<T: Decodable>(_ t: T.Type, _ j: AnyJSON) throws -> T { try JSONDecoder().decode(T.self, from: try j.data()) }
}
#endif
