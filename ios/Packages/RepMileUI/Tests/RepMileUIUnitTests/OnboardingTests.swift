import CoachingPresentation
import XCTest
@testable import RepMileUI

/// Handoff C §8.6 and addendum §5 (10): the onboarding JSON is the shared types' JSON; `specialPopulation` is always present.
@MainActor
final class OnboardingTests: XCTestCase {
    func encoded(_ v: some Encodable) throws -> [String: Any] {
        let e = JSONEncoder(); e.outputFormatting = .sortedKeys
        return try XCTUnwrap(try JSONSerialization.jsonObject(with: e.encode(v)) as? [String: Any])
    }
    func answered(_ care: OnboardingDraft.Care?) -> OnboardingDraft {
        // #61: the plan length and the race date are the athlete's choice now (they were starting values).
        var d = OnboardingDraft(); d.care = care; d.ageText = "32"; d.weeks = 12; d.eventDate = Fmt.day("2027-01-21")
        d.eligibility = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "", pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false)
        return d
    }

    func testNoChoiceCannotBeSent() {
        XCTAssertNil(answered(nil).answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30"))
        var d = answered(.noneOfThese); d.eligibility.injury = nil
        XCTAssertNil(d.answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30"), "an unanswered flag is never sent as false")
    }

    func testNoneSendsAnEmptySpecialPopulation() throws {
        let a = try XCTUnwrap(answered(.noneOfThese).answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30"))
        let intake = try encoded(IntakeRequest(answers: a, asOf: "2026-11-26", timezoneOffsetMinutes: -180, learningConsent: false, mode: .syntheticShadowReference))
        let athlete = try XCTUnwrap(intake["athlete"] as? [String: Any])
        XCTAssertEqual(athlete["specialPopulation"] as? [String], [], "the key is always sent")
        XCTAssertEqual((athlete["eligibility"] as? [String: Any])?["assessedAt"] as? String, "2026-11-26")
        XCTAssertEqual((athlete["goals"] as? [String: Any]).flatMap { ($0["run"] as? [String: Any])?["kind"] as? String }, "RACE")
    }

    func testPregnancyAndPostpartumMapToTheEngineCodes() throws {
        for (care, code) in [(OnboardingDraft.Care.pregnancy, "PREGNANCY"), (.postpartum, "POSTPARTUM")] {
            let a = try XCTUnwrap(answered(care).answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30"))
            XCTAssertEqual(try encoded(a.athlete)["specialPopulation"] as? [String], [code])
        }
    }

    func testOutcomesFromTheCaptures() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let none = await w.onboard(try XCTUnwrap(answered(.noneOfThese).answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30")), consents: .init(coaching: true, healthSignals: false, learning: false))
        XCTAssertEqual(none.answer.planOutcome, .planCreated)
        let preg = await w.onboard(try XCTUnwrap(answered(.pregnancy).answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30")), consents: .init(coaching: true, healthSignals: false, learning: false))
        guard case .outsideV1Scope = preg.answer.planOutcome else { return XCTFail("pregnancy must be outside the V1 scope, got \(preg.answer.planOutcome)") }
    }

    func testAgeIsTypedNeverDefaultedOrClamped() throws {
        var d = answered(.noneOfThese); d.ageText = ""
        XCTAssertNil(d.answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30"), "no age, no request")
        d.ageText = "16"
        XCTAssertEqual(try XCTUnwrap(d.answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30")).athlete.ageYears, 16, "the engine refuses, not the form")
    }

    /// #61: no starting plan length or race date. Without them nothing is sent; with them the request carries the athlete's choice.
    func testPlanLengthAndRaceDateAreChosenNeverDefaulted() throws {
        XCTAssertNil(OnboardingDraft().weeks, "no default plan length")
        XCTAssertNil(OnboardingDraft().eventDate, "no default race date")
        var d = answered(.noneOfThese); d.weeks = nil
        XCTAssertNil(d.answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30"), "no plan length, no request")
        d = answered(.noneOfThese); d.eventDate = nil
        XCTAssertFalse(d.eventAnswered)
        XCTAssertNil(d.answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30"), "a race without its date is never sent")
        d.runGoal = "REGULAR"
        XCTAssertTrue(d.eventAnswered, "another run goal has no event to date")
        XCTAssertNil(try XCTUnwrap(d.answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30")).athlete.goals.run.event)
        let a = try XCTUnwrap(answered(.noneOfThese).answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30"))
        XCTAssertEqual(a.weeks, 12)
        XCTAssertEqual(a.athlete.goals.run.event, GoalEvent(kind: "10K", date: "2027-01-21"))
    }

    func testAnchorTimeParsing() {
        XCTAssertEqual(OnboardingDraft.seconds("50:00"), 3000)
        XCTAssertEqual(OnboardingDraft.seconds("1:45:00"), 6300)
        XCTAssertNil(OnboardingDraft.seconds("50"))
    }
}
