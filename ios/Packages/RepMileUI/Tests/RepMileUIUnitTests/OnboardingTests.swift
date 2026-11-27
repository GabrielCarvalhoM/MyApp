import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #101: the Figma onboarding's answers → the shared `OnboardingAnswers` (spec F-ONBOARDING-FIGMA §2, §4, §6). The golden requests below are
/// what the engine replay (`results/i101-onboarding/scratch/i101-engine-replay.mjs`) sends to the real CoachingCore.
final class OnboardingTests: XCTestCase {
    struct NotBuildable: Error {}
    static func encoded(_ v: some Encodable) throws -> String {
        let e = JSONEncoder(); e.outputFormatting = [.sortedKeys, .withoutEscapingSlashes]
        return String(decoding: try e.encode(v), as: UTF8.self)
    }

    /// Lucas (`837:1144`): 10 km on Sunday 20 Dec, plan from Monday 26 Oct, 5 km in 21:48 on 18 Oct.
    static func lucas() -> OnboardingDraft {
        var d = OnboardingDraft()
        d.choose(train: .both); d.choose(aim: .race(.tenK)); d.raceDay = "2026-12-20"; d.goalMinutes = 44; d.goalSeconds = 30; d.strengthAim = .strength
        d.runDays = [1, 3, 5, 6]; d.strengthDays = [0, 2, 3]; d.runTurn = .night; d.strengthTurn = .morning; d.longRunDay = 5
        d.runMinutes = 60; d.longRunMinutes = 100; d.strengthMinutes = 55; d.strengthPlace = .fullGym; d.runPlaces = [.street]; d.runDevice = .watch
        d.name = "Lucas"; d.age = 32; d.heightCm = 178; d.weightKg = 76; d.appleHealthAnswered = true
        d.recentRunDays = 4; d.recentRunMinutes = 200; d.longestRunMinutes = 80; d.runBand = .overTwoYears
        d.hasResult = true; d.resultDistance = .fiveK; d.resultMinutes = 21; d.resultSeconds = 48; d.resultDay = "2026-10-18"
        d.resultMeasure = .officialRace; d.resultEffort = 9; d.resultTolerated = true; d.resultConditions = .normal
        d.strengthBand = .overTwoYears; d.recentStrengthDays = 3; d.chooseNoCare()
        return d
    }

    /// The marathon (`838:913`, `838:1478`): Sunday 28 Feb 2027 from Monday 9 Nov, every criterion of the block stated.
    static func marathon() -> OnboardingDraft {
        var d = lucas()
        d.choose(aim: .race(.marathon)); d.raceDay = "2027-02-28"; d.goalMinutes = nil; d.goalSeconds = nil; d.goalSkipped = true
        d.runDays = [0, 1, 3, 4, 6]; d.strengthDays = [2]; d.longRunDay = 6; d.runMinutes = 70; d.longRunMinutes = 210
        d.recentRunDays = 5; d.recentRunMinutes = 360; d.longestRunMinutes = 150; d.hasResult = false
        return d
    }

    /// The marathon without the base (`838:1568`): intermediate, 50 min longest run, 120 min a week, three run days, 120 min for the long run.
    static func marathonPrep() -> OnboardingDraft {
        var d = marathon()
        d.runDays = [1, 3, 6]; d.strengthDays = [0, 2]; d.runMinutes = 50; d.longRunMinutes = 120
        d.recentRunDays = 3; d.recentRunMinutes = 120; d.longestRunMinutes = 50; d.runBand = .sixMonthsToTwoYears
        return d
    }

    static func answers(_ d: OnboardingDraft, start: String, today: String) throws -> OnboardingAnswers {
        // QRE P2-2: a request that cannot be built fails the test, never skips it.
        let built = d.build(athleteId: "i101-athlete", today: today, startDate: start)
        guard case .ready(let a) = built else {
            XCTFail("not buildable: \(built)")
            throw NotBuildable()
        }
        return a
    }

    static let lucasGolden = #"{"athlete":{"ageYears":32,"eligibility":{"assessedAt":"2026-10-24","clinicalConcern":false,"functionalLimitation":false,"illness":false,"injury":false,"pain":false,"persistentPain":false,"status":"NONCLINICAL_CONFIRMED"},"equipment":["BARBELL","RACK","BENCH","DUMBBELLS","MACHINES"],"exerciseRotationPreference":"COACH_DECIDES","goals":{"run":{"event":{"date":"2026-12-20","kind":"10K"},"kind":"RACE"},"strength":"STRENGTH"},"id":"i101-athlete","performanceAnchors":[{"date":"2026-10-18","distance":"5K","kind":"RACE_RESULT","measurement":"OFFICIAL","rpe":9,"seconds":1308,"tolerated":true}],"recent":{"longestRunMinutes":80,"runDaysPerWeek":4,"runMinutesPerWeek":200,"strengthDaysPerWeek":3},"runTrainingMonths":24,"specialPopulation":[],"strengthTrainingMonths":24},"schedule":{"longRunDay":5,"longRunMinutes":100,"runDays":[1,3,5,6],"runMinutes":60,"runTurn":"PM","strengthDays":[0,2,3],"strengthMinutes":55,"strengthTurn":"AM"},"startDate":"2026-10-26","weeks":8}"#

    func testLucasSendsWhatTheFigmaAsked() throws {
        let a = try Self.answers(Self.lucas(), start: "2026-10-26", today: "2026-10-24")
        XCTAssertEqual(try Self.encoded(a), Self.lucasGolden)
        XCTAssertEqual(Self.lucas().consents, Consents(coaching: true, healthSignals: false, learning: false), "29: only the necessary use until a toggle is on")
    }

    func testTheMarathonsSendTheirFacts() throws {
        let met = try Self.answers(Self.marathon(), start: "2026-11-09", today: "2026-11-07")
        XCTAssertEqual(met.weeks, 16, "16 semanas até a maratona")
        XCTAssertEqual(met.athlete.goals.run, RunGoal(kind: "RACE", event: GoalEvent(kind: "MARATHON", date: "2027-02-28")))
        XCTAssertEqual(met.athlete.performanceAnchors, [], "Não tenho resultado recente")
        let prep = try Self.answers(Self.marathonPrep(), start: "2026-11-09", today: "2026-11-07")
        XCTAssertEqual(prep.athlete.runTrainingMonths, 6)
        XCTAssertEqual(prep.athlete.recent, RecentTraining(strengthDaysPerWeek: 3, runDaysPerWeek: 3, runMinutesPerWeek: 120, longestRunMinutes: 50))
    }

    /// The weeks come from the race day (the Figma never asks a plan length): "8 semanas até lá", and `838:3864` "até 14 de fevereiro de 2027".
    func testPlanWeeksFollowTheRaceDay() {
        XCTAssertEqual(OnboardingDraft.planWeeks(start: "2026-10-26", race: "2026-12-20"), 8)
        XCTAssertEqual(OnboardingDraft.planWeeks(start: "2026-10-26", race: "2026-10-30"), 4)
        XCTAssertEqual(OnboardingDraft.planWeeks(start: "2026-11-09", race: "2027-02-28"), 16)
        XCTAssertEqual(OnboardingDraft.planWeeks(start: "2026-10-26", race: "2027-02-14"), 16)
        XCTAssertNil(OnboardingDraft.planWeeks(start: "2026-10-26", race: "2027-02-15"), "beyond 16 weeks")
        XCTAssertNil(OnboardingDraft.planWeeks(start: "2026-10-26", race: "2026-10-25"), "before the start")
        XCTAssertEqual(OnboardingDraft.lastRaceDay(start: "2026-10-26"), "2027-02-14")
    }

    func testNothingIsPreAnswered() {
        let d = OnboardingDraft()
        for step in OnboardingStep.allCases where ![.opening, .goalDone, .routineDone, .youDone, .name, .dataUse].contains(step) {
            XCTAssertFalse(d.answered(step), "\(step) starts unanswered")
        }
        XCTAssertEqual(d.consents, Consents(coaching: true, healthSignals: false, learning: false))
        // PR #121 review: no starting months (the old form began at 12 and 6, a sporting default): nil until 22 and 25 are answered.
        XCTAssertNil(d.runBand); XCTAssertNil(d.strengthBand); XCTAssertNil(d.runTrainingMonths)
        var started = Self.lucas(); started.runBand = nil; started.strengthBand = nil
        XCTAssertNil(started.runTrainingMonths)
        XCTAssertEqual(started.build(athleteId: "a", today: "2026-10-24", startDate: "2026-10-26"), .incomplete, "nothing is sent without them")
        XCTAssertEqual(d.build(athleteId: "a", today: "2026-10-24", startDate: "2026-10-26"), .held([.singleSport]))
    }

    /// 27: "Nenhum destes" answers each flag "não" and confirms; a marked sign leaves the others unanswered (omitted, never "não").
    func testCareChecklist() throws {
        var d = Self.lucas()
        XCTAssertEqual(d.eligibility, EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "", pain: false, persistentPain: false, injury: false,
                                                       illness: false, functionalLimitation: false, clinicalConcern: false))
        d.toggleCare(.persistentPain)
        XCTAssertFalse(d.careNone, "a sign clears Nenhum destes")
        XCTAssertEqual(d.eligibility, EligibilityScreen(status: nil, assessedAt: "", pain: nil, persistentPain: true, injury: nil, illness: nil,
                                                       functionalLimitation: nil, clinicalConcern: nil))
        let json = try Self.encoded(try Self.answers(d, start: "2026-10-26", today: "2026-10-24").athlete.eligibility)
        XCTAssertEqual(json, #"{"assessedAt":"2026-10-24","persistentPain":true}"#)
        d.chooseNoCare()
        XCTAssertTrue(d.care.isEmpty)
        d.care = []; d.careNone = false
        XCTAssertFalse(d.answered(.care), "no choice cannot continue")
    }

    /// The open decisions hold the send; nothing is filled in to make it go (spec §6).
    func testOpenDecisionsHoldTheSend() {
        var d = Self.lucas(); d.choose(train: .runOnly)
        XCTAssertTrue(d.holds.contains(.singleSport), "D05")
        d = Self.lucas(); d.choose(aim: .noRace(.performance))
        XCTAssertEqual(d.holds, [.noRaceWeeks], "D03: no plan length without a race")
        d = Self.lucas(); d.toggleCare(.pregnancyOrPostpartum)
        XCTAssertEqual(d.holds, [.pregnancyCode], "D02: the item is shown, its encoding waits")
        d = Self.lucas(); d.resultMeasure = .test
        XCTAssertEqual(d.holds, [.testMeasure], "D20")
        for h in [BuildHold.singleSport, .noRaceWeeks, .pregnancyCode, .testMeasure, .beginnerRecent] { XCTAssertFalse(h.rawValue.isEmpty) }
    }

    /// SSCTR 27/11 (D06, D12, D13).
    func testBeginnerBranches() {
        XCTAssertEqual(NoRaceAim.startRunning.engineWord, "GENERAL", "never PERFORMANCE")
        var d = Self.lucas(); d.choose(aim: .noRace(.startRunning)); d.choose(start: .never)
        XCTAssertEqual(d.runTrainingMonths, 0)
        XCTAssertEqual(d.recent, RecentTraining(strengthDaysPerWeek: 3, runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0), "true zeros; strength from 25")
        XCTAssertEqual(d.anchors, [])
        XCTAssertEqual(d.holds, [.noRaceWeeks])
        d.choose(start: .stopped)
        XCTAssertEqual(d.runTrainingMonths, 0, "never the past months")
        XCTAssertNil(d.recentRunMinutes, "the counters of 21 are dropped")
        d.recentRunDaysChoice = RecentRunDays.none
        XCTAssertEqual(d.recent, RecentTraining(strengthDaysPerWeek: 3, runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0))
        d.recentRunDaysChoice = .two
        XCTAssertNil(d.recent, "minutes and longest run unknown: never zero-filled")
        XCTAssertEqual(d.holds, [.noRaceWeeks, .beginnerRecent])
        d.choose(start: .current)
        XCTAssertNil(d.runTrainingMonths, "Corro hoje asks 22")
        d.runBand = .underSixMonths
        XCTAssertEqual(d.runTrainingMonths, 1)
        XCTAssertEqual(TrainingBand.allCases.map(\.months), [0, 1, 6, 24])
    }

    func testEquipmentPresetsAndTurns() {
        var d = Self.lucas()
        XCTAssertEqual(d.equipmentCodes, ["BARBELL", "RACK", "BENCH", "DUMBBELLS", "MACHINES"], "the Figma's stated assumption")
        d.strengthPlace = .bodyweightOnly
        XCTAssertEqual(d.equipmentCodes, ["BODYWEIGHT"])
        d.strengthPlace = .home
        XCTAssertFalse(d.answered(.strengthPlace), "D14: no chip, no continue")
        d.gymItems = [.dumbbells, .bands]
        XCTAssertEqual(d.equipmentCodes, ["BANDS", "DUMBBELLS"])
        XCTAssertTrue(d.answered(.strengthPlace))
        XCTAssertEqual(DayTurn.allCases.map(\.engineTurn), ["AM", "PM", "PM"])
    }

    /// 02: a new choice drops the answers of the sport no longer trained; 09: the long-run day follows the run days.
    func testChoicesDropAnswersThatNoLongerApply() {
        var d = Self.lucas()
        d.choose(train: .strengthOnly)
        XCTAssertNil(d.runAim); XCTAssertNil(d.raceDay); XCTAssertTrue(d.runDays.isEmpty); XCTAssertNil(d.recentRunDays); XCTAssertNil(d.hasResult)
        XCTAssertEqual(d.strengthAim, .strength)
        d = Self.lucas()
        d.toggle(day: 5, run: true)
        XCTAssertNil(d.longRunDay, "Saturday is no longer a run day")
    }

    func testFlowBranches() {
        var d = Self.lucas()
        XCTAssertEqual(OnboardingStep.flow(for: d), [.opening, .train, .runAim, .raceDate, .goalTime, .strengthAim, .goalDone, .week, .longRun, .duration,
                                                     .strengthPlace, .runPlace, .runDevice, .routineDone, .name, .age, .bodySize, .appleHealth, .runNow,
                                                     .runYears, .result, .resultDetail, .strengthYears, .care, .youDone, .dataUse])
        d.choose(train: .strengthOnly)
        XCTAssertFalse(OnboardingStep.flow(for: d).contains { [.runAim, .longRun, .runPlace, .runNow, .result].contains($0) })
        d = Self.lucas(); d.choose(aim: .noRace(.startRunning)); d.choose(start: .never)
        let marina = OnboardingStep.flow(for: d)
        XCTAssertTrue(marina.contains(.runStart)); XCTAssertFalse(marina.contains(.runNow)); XCTAssertFalse(marina.contains(.result)); XCTAssertFalse(marina.contains(.goalDone))
        d.choose(start: .stopped)
        XCTAssertTrue(OnboardingStep.flow(for: d).contains(.runRecentDays))
    }
}
