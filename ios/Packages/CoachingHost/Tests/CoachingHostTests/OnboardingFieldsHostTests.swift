import Foundation
import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation

/// CCP-ONB-1 (#109), A/C integration: the new onboarding fields as C fills them, sent by THIS host (`CoachingWriting.onboard`, the JSContext
/// over the production bundle, the native store and the test Keychain storage), and the new readings decoded from its read ports. The host
/// forwards the intake unchanged: no host code was needed for the write side; the read side is `weekPlan().marathon` in the rebuilt bundle.
final class OnboardingFieldsHostTests: XCTestCase {
    static func with(_ f: (inout OnboardingAnswers) -> Void) -> OnboardingAnswers { var a = Athlete.answers(); f(&a); return a }
    static let everyField = with {
        $0.athlete.knownExercises = [KnownExercise(id: "back-squat", sets: 4, reps: 5, rir: 3, load: LoggedLoadEntry(value: 90, unit: .kg, convention: .total))]
        $0.athlete.coaching = IntakeCoaching(profile: .conservative); $0.athlete.goals.run.event?.timeGoalMinutes = 44.5
        $0.athlete.performanceAnchors[0].conditions = []
        $0.schedule.temporaryPreference = .run; $0.schedule.runTurn = nil; $0.schedule.strengthTurn = nil; $0.schedule.sameTurnConfirmed = true
    }

    func testEveryNewFieldThroughTheHost() async throws {
        let f = try await HostFixture.make("onb-every-field"); defer { TestEnv.cleanup("onb-every-field") }
        let o_f = await f.host.onboard(Self.everyField, consents: Athlete.all).answer.planOutcome; XCTAssertEqual(o_f, .planCreated)
        let _plan = try await f.host.plan(week: nil).get()
        XCTAssertEqual(_plan.state, .validPlan)
        let goal = try await f.host.presentation().get().readings?.runCalibration?.goal
        XCTAssertEqual(goal?.goalSeconds, 2670); XCTAssertEqual(goal?.usedForPace, false); XCTAssertNotNil(goal?.relation)
        let _wp = try await f.host.weekPlan().get()
        XCTAssertNil(_wp.marathon, "a 10K plan has no marathon reading")
    }

    func testSingleSportAndBeginnerThroughTheHost() async throws {
        let strength = Self.with {
            $0.athlete.goals = IntakeGoals(run: RunGoal(kind: "NONE"), strength: "STRENGTH"); $0.athlete.runTrainingMonths = nil; $0.athlete.performanceAnchors = []
            $0.athlete.recent = RecentTraining(strengthDaysPerWeek: 2, runDaysPerWeek: nil, runMinutesPerWeek: nil, longestRunMinutes: nil)
            $0.schedule = TrainingSchedule(strengthDays: [1, 3, 5], strengthMinutes: 45, runDays: [], runMinutes: nil, longRunMinutes: nil, longRunDay: nil, runTurn: nil, strengthTurn: "PM")
            $0.weeks = nil
        }
        let stopped = Self.with {
            $0.athlete.goals = IntakeGoals(run: RunGoal(kind: "GENERAL"), strength: "NONE"); $0.athlete.strengthTrainingMonths = nil; $0.athlete.runTrainingMonths = 0
            $0.athlete.recent = RecentTraining(strengthDaysPerWeek: nil, runDaysPerWeek: 2, runMinutesPerWeek: nil, longestRunMinutes: nil)
            $0.athlete.performanceAnchors = []; $0.athlete.equipment = []
            $0.schedule = TrainingSchedule(strengthDays: [], strengthMinutes: nil, runDays: [1, 3, 6], runMinutes: 30, longRunMinutes: 40, longRunDay: 6, runTurn: "AM", strengthTurn: nil)
            $0.weeks = nil
        }
        for (name, a, run, str) in [("onb-only-strength", strength, false, true), ("onb-stopped-runner", stopped, true, false)] {
            let f = try await HostFixture.make(name); defer { TestEnv.cleanup(name) }
            let o_f = await f.host.onboard(a, consents: Athlete.all).answer.planOutcome; XCTAssertEqual(o_f, .planCreated, name)
            let p = try await f.host.plan(week: nil).get()
            XCTAssertEqual(p.sports["RUN"]?.programmed, run, name); XCTAssertEqual(p.sports["STRENGTH"]?.programmed, str, name)
            XCTAssertEqual(p.weeks, 12, "\(name): no plan length sent, the engine's 12")
        }
    }

    func testMarathonCriteriaAndSafetyThroughTheHost() async throws {
        let f = try await HostFixture.make("onb-marathon"); defer { TestEnv.cleanup("onb-marathon") }
        let m = Self.with { $0.weeks = 16; $0.athlete.goals.run = RunGoal(kind: "RACE", event: GoalEvent(kind: "MARATHON", date: "2027-02-28")) }
        let o_f = await f.host.onboard(m, consents: Athlete.all).answer.planOutcome; XCTAssertEqual(o_f, .planCreated)
        let marathon = try await f.host.weekPlan().get().marathon
        XCTAssertEqual(marathon?.status, "PREPARATORY"); XCTAssertEqual(marathon?.unmet.map(\.id.raw), ["LONGEST_RUN", "LONG_RUN_TIME"])
        XCTAssertEqual(marathon?.unmet.first?.value, .number(80)); XCTAssertEqual(marathon?.unmet.first?.needed, .number(90))

        let g = try await HostFixture.make("onb-clinical"); defer { TestEnv.cleanup("onb-clinical") }
        var clinical = Self.everyField; clinical.athlete.eligibility.pain = true
        let o_g = await g.host.onboard(clinical, consents: Athlete.all).answer.planOutcome; XCTAssertEqual(o_g, .clinicalHumanRequired, "no new field opens a plan")
        guard case .failure(let e) = await g.host.plan(week: nil) else { return XCTFail("a plan after a clinical flag") }
        XCTAssertEqual(e.code, "NOT_ENROLLED")
        // QRE P1 / P3-8: the combined Cuidados item with a sign reaches the engine (clinical first); without a sign the host sends nothing.
        for (n, sign) in [("onb-combined-sign", true), ("onb-combined-alone", false)] {
            let h = try await HostFixture.make(n); defer { TestEnv.cleanup(n) }
            var a = Athlete.answers(); a.athlete.specialPopulationNotStated = .pregnancyOrPostpartumUnspecified
            a.athlete.eligibility = EligibilityScreen(status: nil, assessedAt: "2026-11-13", pain: sign ? true : nil, persistentPain: nil, injury: nil, illness: nil,
                                                      functionalLimitation: nil, clinicalConcern: nil)
            let o = await h.host.onboard(a, consents: Athlete.all).answer.planOutcome
            XCTAssertEqual(o, sign ? .clinicalHumanRequired : .failed("INVALID_REQUEST"), n)
            guard case .failure(let x) = await h.host.plan(week: nil) else { return XCTFail("\(n): a plan") }
            XCTAssertEqual(x.code, "NOT_ENROLLED", n)
        }
    }
}
