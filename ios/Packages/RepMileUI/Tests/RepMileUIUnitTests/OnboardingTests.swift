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
        var d = OnboardingDraft(); d.care = care; d.ageText = "32"; d.weeks = 12; d.eventDate = Calendar.current.date(from: DateComponents(year: 2027, month: 1, day: 21, hour: 12))
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

    /// #61b: the race and anchor dates are the local calendar day the athlete picked, whatever the time of day the picker kept.
    func testRaceAndAnchorDatesAreTheLocalDayPicked() throws {
        func at(_ zone: String, _ y: Int, _ m: Int, _ day: Int, _ h: Int, _ min: Int = 0) throws -> (Date, TimeZone) {
            let tz = try XCTUnwrap(TimeZone(identifier: zone))
            var c = Calendar(identifier: .gregorian); c.timeZone = tz
            return (try XCTUnwrap(c.date(from: DateComponents(year: y, month: m, day: day, hour: h, minute: min))), tz)
        }
        // Brasília 22:00 on 21 Jan is 01:00 UTC on 22 Jan; 23:30 on 5 Nov is 02:30 UTC on 6 Nov.
        let (race, sp) = try at("America/Sao_Paulo", 2027, 1, 21, 22), (anchor, _) = try at("America/Sao_Paulo", 2026, 11, 5, 23, 30)
        var d = answered(.noneOfThese); d.eventDate = race; d.hasAnchor = true; d.anchorTime = "50:00"; d.anchorDate = anchor
        var a = try XCTUnwrap(d.answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30", timeZone: sp))
        XCTAssertEqual(a.athlete.goals.run.event?.date, "2027-01-21")
        XCTAssertEqual(a.athlete.performanceAnchors.first?.date, "2026-11-05")
        // East of UTC: Tokyo 07:00 on 21 Jan is 22:00 UTC on 20 Jan.
        let (east, tokyo) = try at("Asia/Tokyo", 2027, 1, 21, 7)
        d.eventDate = east
        a = try XCTUnwrap(d.answers(athleteId: "a", today: "2026-11-26", startDate: "2026-11-30", timeZone: tokyo))
        XCTAssertEqual(a.athlete.goals.run.event?.date, "2027-01-21")
    }

    func testAnchorTimeParsing() {
        XCTAssertEqual(OnboardingDraft.seconds("50:00"), 3000)
        XCTAssertEqual(OnboardingDraft.seconds("1:45:00"), 6300)
        XCTAssertNil(OnboardingDraft.seconds("50"))
    }
}
