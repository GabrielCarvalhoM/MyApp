import CoachingPresentation
import XCTest
@testable import RepMileUI

/// CCP-ONB-1 (QRE P3, PR #121): the fixture writer answers a held intake as the real host does (INVALID_REQUEST, nothing sent), and a restart
/// with a clinical flag as an enrolment with one (no capture: an honest failure, never a plan). The screens check `OnboardingAnswers.hold`
/// first and never show this generic failure (CCP-ONB-1 §8).
final class FixtureHoldTests: XCTestCase {
    static func answers() -> OnboardingAnswers {
        let screen = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "2026-11-13", pain: false, persistentPain: false, injury: false,
                                       illness: false, functionalLimitation: false, clinicalConcern: false)
        return OnboardingAnswers(athlete: AthleteIntake(id: "c-hold", ageYears: 32, eligibility: screen, specialPopulation: [], strengthTrainingMonths: 18,
                                                        runTrainingMonths: 36, exerciseRotationPreference: "COACH_DECIDES",
                                                        goals: IntakeGoals(run: RunGoal(kind: "RACE", event: GoalEvent(kind: "10K", date: "2027-01-10")), strength: "RUNNING_SUPPORT"),
                                                        equipment: ["BARBELL"], recent: RecentTraining(strengthDaysPerWeek: 2, runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 80),
                                                        performanceAnchors: []),
                                 schedule: TrainingSchedule(strengthDays: [2, 5], strengthMinutes: 45, runDays: [1, 3, 5, 6], runMinutes: 50, longRunMinutes: 90,
                                                            longRunDay: 6, runTurn: "AM", strengthTurn: "PM"),
                                 weeks: 8, startDate: "2026-11-16")
    }

    func testHeldIntakesAndClinicalRestart() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        var combined = Self.answers(); combined.athlete.specialPopulationNotStated = .pregnancyOrPostpartumUnspecified
        var raceNoWeeks = Self.answers(); raceNoWeeks.weeks = nil
        for a in [combined, raceNoWeeks] {
            XCTAssertNotNil(a.hold)
            let on = await w.onboard(a, consents: Consents(coaching: true, healthSignals: true, learning: true)).answer.planOutcome
            XCTAssertEqual(on, .failed("INVALID_REQUEST"))
            let re = await w.restart(a).answer.planOutcome
            XCTAssertEqual(re, .failed("INVALID_REQUEST"))
        }
        var clinical = Self.answers(); clinical.athlete.eligibility.pain = true
        let re = await w.restart(clinical).answer.planOutcome
        XCTAssertEqual(re, .failed("FIXTURE_UNAVAILABLE"), "a clinical restart is never answered with a plan")
        let ok = await w.restart(Self.answers()).answer.planOutcome
        XCTAssertEqual(ok, .planCreated)
    }
}
