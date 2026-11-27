import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #101 31 Plano pronto / 34 Primeira semana: what the engine answered after an accepted intake, read from the committed captures
/// (`02-plan-w0`, `P-week-plan`, `04-presentation-after-onboard`: a 12-week 10 km plan calibrated by a 10 km in 50:00).
final class OnboardingPlanPreviewTests: XCTestCase {
    private func preview(race: RaceDistance?, name: String = "Lucas", presentation: PresentationSnapshot? = nil) throws -> OnboardingPlanPreview {
        let plan = try Repo.store.decode(PlanView.self, "02-plan-w0", at: "view")
        let weeks = try Repo.store.decode(WeekPlanProjection.self, "P-week-plan")
        let p = try presentation ?? Repo.store.decode(PresentationSnapshot.self, "04-presentation-after-onboard")
        return OnboardingPlanPreview(plan: plan, weekPlan: weeks, presentation: p, race: race, name: name)
    }

    func testTheFirstWeekAndThePeriodComeFromThePlan() throws {
        let p = try preview(race: .tenK)
        XCTAssertEqual(p.runDays, [1, 3, 5, 6])
        XCTAssertEqual(p.strengthDays, [2, 5])
        XCTAssertEqual(p.longRunDay, 6)
        XCTAssertTrue(p.title?.contains("12") == true && p.title?.contains("Lucas") == true, p.title ?? "nil")
        XCTAssertNotNil(p.period)
        XCTAssertNotNil(p.weekLine)
        XCTAssertFalse(p.preparatory, "a plan with specific, taper and race weeks")
    }

    /// "Ritmos calibrados" and "Capacidade atual" only from the engine's calibration; the verdict on the goal is not shown (D07).
    func testTheCardsAreTheEnginesCalibration() throws {
        let p = try preview(race: .tenK)
        XCTAssertEqual(p.cards.count, 2)
        XCTAssertEqual(p.cards.first?.icon, .run)
        XCTAssertTrue(p.cards.first?.detail?.contains("50:00") == true, p.cards.first?.detail ?? "nil")
        let k = Fmt.usesMiles ? 1.609344 : 1   // the locale's unit (the test host may run in en_US)
        XCTAssertTrue(p.cards.first?.detail?.contains(Fmt.clock(375 * k)) == true && p.cards.first?.detail?.contains(Fmt.clock(450 * k)) == true,
                      p.cards.first?.detail ?? "nil")
        XCTAssertEqual(p.cards.last?.value, "48:45–51:15")
        XCTAssertEqual(p.cards.last?.detail, L.t("ob.ready.estimate"))
    }

    /// No title is written for a distance the Figma did not draw (the half marathon, D22); no capacity card either.
    func testTheHalfHasNoInventedTitle() throws {
        let p = try preview(race: .half)
        XCTAssertNil(p.title)
        XCTAssertEqual(p.cards.count, 1)
    }

    /// Lucas' own record (`Captures/lucas-*`, the real engine's answer to the app's request): 8 weeks, 4 runs and 3 strength sessions.
    func testLucasReadsHisOwnPlan() throws {
        let plan = try Repo.store.decode(PlanView.self, "lucas-plan", at: "view")
        let p = OnboardingPlanPreview(plan: plan, weekPlan: try Repo.store.decode(WeekPlanProjection.self, "lucas-week-plan"),
                                      presentation: try Repo.store.decode(PresentationSnapshot.self, "lucas-presentation"), race: .tenK, name: "Lucas")
        XCTAssertTrue(p.title?.contains("8") == true, p.title ?? "nil")
        XCTAssertEqual(p.runDays, [1, 3, 5, 6])
        XCTAssertEqual(p.strengthDays, [0, 2, 3])
        XCTAssertEqual(p.longRunDay, 5)
        XCTAssertEqual(p.weekLine, L.f("ob.ready.week1", OBText.counts(runs: 4, strength: 3), OBText.onDay("2026-10-26")))
        XCTAssertTrue(p.cards.first?.detail?.contains("21:48") == true, p.cards.first?.detail ?? "nil")
    }

    /// SSCTR C6: an optional walk is not a run (counted by role, never by sport alone).
    func testAWalkIsNotARun() throws {
        var root = try XCTUnwrap(try Repo.store.object("lucas-plan")["view"] as? [String: Any])
        var week = try XCTUnwrap(root["week"] as? [String: Any])
        var sessions = try XCTUnwrap(week["sessions"] as? [[String: Any]])
        var walk = try XCTUnwrap(sessions.first { $0["sport"] as? String == "RUN" })
        walk["id"] = "w0-walk"; walk["role"] = "WALK"; walk["optional"] = true; walk["date"] = "2026-10-30"
        sessions.append(walk); week["sessions"] = sessions; root["week"] = week
        let plan = try JSONDecoder().decode(PlanView.self, from: JSONSerialization.data(withJSONObject: root))
        let p = OnboardingPlanPreview(plan: plan, weekPlan: nil, presentation: nil, race: .tenK, name: "")
        XCTAssertFalse(p.runDays.contains(4), "Friday's walk draws no run")
        XCTAssertEqual(p.weekLine, L.f("ob.ready.week1", OBText.counts(runs: 4, strength: 3), OBText.onDay("2026-10-26")))
    }

    func testNothingReadNothingShown() {
        let p = OnboardingPlanPreview(plan: nil, weekPlan: nil, presentation: nil, race: .tenK, name: "")
        XCTAssertNil(p.title); XCTAssertNil(p.period); XCTAssertNil(p.weekLine); XCTAssertTrue(p.cards.isEmpty); XCTAssertTrue(p.runDays.isEmpty)
    }
}
