import CoachingPresentation
import XCTest
@testable import RepMileUI

/// Handoff C §8.6: the JSON the forms produce is the shared types' JSON, with the safety keys present and nothing the athlete did not state.
@MainActor
final class RequestShapeTests: XCTestCase {
    func encoded(_ v: some Encodable) throws -> [String: Any] {
        let e = JSONEncoder(); e.outputFormatting = .sortedKeys
        return try XCTUnwrap(try JSONSerialization.jsonObject(with: e.encode(v)) as? [String: Any])
    }
    var plan: PlanView { get throws { try Repo.store.decode(PlanView.self, "13-plan-w1", at: "view") } }

    func testPlannedRunReportCarriesNoDistance() throws {
        let s = try XCTUnwrap(try plan.week?.sessions.first { $0.id == "w0-run-d6" })
        let obs = RunReportViewModel.makeObservation(planned: (s.id, s.date), today: "2026-11-22", end: Date(timeIntervalSince1970: 1_795_850_000), completed: true,
                                                minutes: 81, rpe: 4, stop: nil, effort: .onTarget)
        let review = try encoded(ReviewRequest(.sessionReports([obs]), eligibility: nil))
        XCTAssertEqual(review["kind"] as? String, "WEEKLY_REVIEW")
        let o = try XCTUnwrap((review["observations"] as? [[String: Any]])?.first)
        XCTAssertEqual(Set(o.keys), ["sessionId", "occurrenceDate", "observedAt", "actual", "response"])
        let actual = try XCTUnwrap(o["actual"] as? [String: Any])
        XCTAssertEqual(Set(actual.keys), ["completed", "minutes", "rpe"])
        XCTAssertNil(actual["distanceKm"], "GAP-16: the iPhone's distance never reaches a report")
        XCTAssertTrue((o["observedAt"] as? String)?.range(of: #"[+-]\d\d:\d\d$|Z$"#, options: .regularExpression) != nil)
    }

    func testSymptomStopIsReportedAsAStopNotCompleted() throws {
        let s = try XCTUnwrap(try plan.week?.sessions.first { $0.id == "w0-run-d6" })
        let obs = RunReportViewModel.makeObservation(planned: (s.id, s.date), today: "", end: Date(), completed: true, minutes: 20, rpe: nil, stop: .symptom, effort: .unknown)
        let a = try XCTUnwrap((try encoded(obs))["actual"] as? [String: Any])
        XCTAssertEqual(a["completed"] as? Bool, false)
        XCTAssertEqual((a["stop"] as? [String: Any])?["reason"] as? String, "SYMPTOM")
    }

    func testUnplannedRunHasObservedAtSportAndNoStop() throws {
        let obs = RunReportViewModel.makeObservation(planned: nil, today: "2026-11-22", end: Date(), completed: true, minutes: 30, rpe: 3, stop: .symptom, effort: .harder)
        let o = try encoded(obs)
        XCTAssertNil(o["sessionId"])
        XCTAssertNotNil(o["observedAt"], "FND-ABC-01: required for an unplanned report")
        let a = try XCTUnwrap(o["actual"] as? [String: Any])
        XCTAssertEqual(a["sport"] as? String, "RUN")
        XCTAssertNil(a["stop"], "FND-ABC-02: a stop on an unplanned run goes through Não estou 100%")
        XCTAssertNil(a["distanceKm"])
    }

    func testNotFeeling100AsksExactlyTheEngineSetAndOmitsUnanswered() throws {
        struct Sets: Decodable { let sets: [WarningSignQuestionSet] }
        let sets = try Repo.store.decode(Sets.self, "P-warning-sign-sets").sets
        XCTAssertEqual(Set(sets.map { $0.warningSigns.count }), [9, 13, 15])
        let set = try XCTUnwrap(sets.first { $0.condition == "MINOR_DISCOMFORT" })
        var answers = Dictionary(uniqueKeysWithValues: set.warningSigns.dropLast().map { ($0, false) })
        answers["feverOrChillsNotAsked"] = true  // not in the set: refused, never sent
        let eligibility = EligibilityScreen(status: nil, assessedAt: "", pain: false, persistentPain: nil, injury: nil, illness: nil, functionalLimitation: nil, clinicalConcern: nil)
        let r = try XCTUnwrap(NotFeeling100Flow.makeRequest(condition: .minorDiscomfort, set: set, answers: answers, intent: .reduceLight, eligibility: eligibility, today: "2026-11-22"))
        let json = try encoded(r)
        XCTAssertEqual(json["kind"] as? String, "NOT_FEELING_100")
        let signs = try XCTUnwrap((json["wellbeing"] as? [String: Any])?["warningSigns"] as? [String: Bool])
        XCTAssertEqual(signs.count, set.warningSigns.count - 1, "the unanswered sign is omitted (never false)")
        XCTAssertTrue(Set(signs.keys).isSubset(of: Set(set.warningSigns)))
        let e = try XCTUnwrap(json["eligibility"] as? [String: Any])
        XCTAssertEqual(e["assessedAt"] as? String, "2026-11-22")
        XCTAssertEqual(e["pain"] as? Bool, false)
        XCTAssertNil(e["injury"], "nil = not answered, never false")
        XCTAssertNil(e["status"], "no nonclinical confirmation was given")
    }

    func testWriterRoutesNotFeelingBySigns() async throws {
        struct Sets: Decodable { let sets: [WarningSignQuestionSet] }
        let set = try XCTUnwrap(try Repo.store.decode(Sets.self, "P-warning-sign-sets").sets.first { $0.condition == "MILD_ILLNESS" })
        let w = FixtureCoachingWriter(store: Repo.store)
        let allNo = Dictionary(uniqueKeysWithValues: set.warningSigns.map { ($0, false) })
        let kept = await w.submit(try XCTUnwrap(NotFeeling100Flow.makeRequest(condition: .mildIllness, set: set, answers: allNo, intent: .rest, eligibility: nil, today: "")))
        XCTAssertEqual(kept.answer.status?.raw, "KEEP")
        var fever = allNo; fever["feverOrChills"] = true
        let blocked = await w.submit(try XCTUnwrap(NotFeeling100Flow.makeRequest(condition: .mildIllness, set: set, answers: fever, intent: .rest, eligibility: nil, today: "")))
        XCTAssertEqual(blocked.answer.status?.raw, "CLINICAL_HUMAN_REQUIRED")
        let partial = await w.submit(try XCTUnwrap(NotFeeling100Flow.makeRequest(condition: .mildIllness, set: set, answers: [:], intent: .rest, eligibility: nil, today: "")))
        XCTAssertNotEqual(partial.answer.status?.raw, "KEEP", "unanswered signs are never read as no")
    }

    /// SSCTR review: only KEEP is "the plan stays"; MODIFY says the next sessions changed; unknown fails closed.
    func testNotFeeling100OutcomeReadsTheEngineStatus() throws {
        func answer(_ json: String) throws -> BoundaryAnswer { try JSONDecoder().decode(BoundaryAnswer.self, from: Data(json.utf8)) }
        XCTAssertEqual(NotFeeling100Flow.outcome(try answer(#"{"ok":true,"status":"KEEP"}"#)), .kept)
        XCTAssertEqual(NotFeeling100Flow.outcome(try answer(#"{"ok":true,"status":"MODIFY"}"#)), .modified)
        XCTAssertEqual(NotFeeling100Flow.outcome(try answer(#"{"ok":true,"status":"ASK"}"#)), .needsAnswers)
        XCTAssertEqual(NotFeeling100Flow.outcome(try answer(#"{"ok":true,"status":"CLINICAL_HUMAN_REQUIRED"}"#)), .blocked)
        XCTAssertEqual(NotFeeling100Flow.outcome(try answer(#"{"ok":true,"status":"SOMETHING_NEW"}"#)), .failed("SOMETHING_NEW"))
        XCTAssertEqual(NotFeeling100Flow.outcome(try Repo.store.decode(BoundaryAnswer.self, "actions-D1-notFeeling100-no-sign")), .kept)
        XCTAssertEqual(NotFeeling100Flow.outcome(try Repo.store.decode(BoundaryAnswer.self, "16-notFeeling100-sign")), .blocked)
    }

    func testUnplannedStrengthKeptOnlyWithObservedAt() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let actual = StrengthActual(completed: true, minutes: 30, exercises: [])
        let withAt = await w.submit(ReviewRequest(.sessionReports([.unplannedStrength(occurrenceDate: "2026-11-22", observedAt: "2026-11-22T10:00:00-03:00", actual: actual, response: .unknown)]), eligibility: nil))
        XCTAssertFalse(withAt.kept.isEmpty, "GAP-12: saved only when the record keeps it")
    }
}
