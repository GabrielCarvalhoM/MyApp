import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #32 increment 1: the onboarding state and its write live in `OnboardingViewModel`; the behaviour is the one the UI tests already pin.
@MainActor
final class OnboardingViewModelTests: XCTestCase {
    private func answeredDraft(_ care: OnboardingDraft.Care) -> OnboardingDraft {
        // #61: the plan length and the race date are the athlete's choice now (they were starting values).
        var d = OnboardingDraft(); d.care = care; d.ageText = "32"; d.weeks = 12; d.eventDate = Calendar.current.date(from: DateComponents(year: 2027, month: 1, day: 21, hour: 12))
        d.eligibility = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "", pain: false, persistentPain: false, injury: false, illness: false,
                                          functionalLimitation: false, clinicalConcern: false)
        for p in ConsentPurpose.allCases { d.consents[p] = p == .coaching }
        return d
    }

    /// Walks every step with a fully answered draft, as the athlete would.
    private func atLastStep(_ care: OnboardingDraft.Care, writer: CoachingWriting) -> OnboardingViewModel {
        let vm = OnboardingViewModel(writer: writer)
        vm.draft = answeredDraft(care)
        while !vm.isLastStep { let before = vm.step; vm.next(); XCTAssertNotEqual(vm.step, before, "stuck at \(before)") }
        return vm
    }

    private func onboardCalls(_ w: FixtureCoachingWriter) -> Int { w.journal.entries.filter { $0.call == "onboard" }.count }

    func testAStepWithoutItsAnswerCannotBeLeft() {
        let vm = OnboardingViewModel(writer: FixtureCoachingWriter(store: Repo.store))
        vm.next()
        XCTAssertEqual(vm.step, .age)
        XCTAssertFalse(vm.canContinue, "no age, no default")
        vm.next()
        XCTAssertEqual(vm.step, .age)
        vm.draft.ageText = "41"
        XCTAssertTrue(vm.canContinue)
        vm.next()
        XCTAssertEqual(vm.step, .goals)
        vm.back()
        XCTAssertEqual(vm.step, .age)
    }

    func testCareStepNeedsTheChoiceAndEveryEligibilityFlag() {
        let vm = OnboardingViewModel(writer: FixtureCoachingWriter(store: Repo.store))
        vm.draft = answeredDraft(.noneOfThese)
        while vm.step != .care { vm.next() }
        vm.draft.care = nil
        XCTAssertFalse(vm.canContinue)
        vm.draft.care = .noneOfThese
        vm.draft.eligibility.illness = nil
        XCTAssertFalse(vm.canContinue, "an unanswered flag is never read as false")
    }

    func testSubmitSendsOnceAndShowsTheEngineOutcome() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = atLastStep(.noneOfThese, writer: w)
        await vm.submit()
        XCTAssertEqual(vm.phase, .outcome(.planCreated))
        await vm.submit()
        XCTAssertEqual(onboardCalls(w), 1, "a second tap after the outcome does not enrol again")
    }

    func testTwoTapsWhileBuildingEnrolOnce() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = atLastStep(.noneOfThese, writer: w)
        async let first: Void = vm.submit(minimumDisplay: .milliseconds(50))
        async let second: Void = vm.submit(minimumDisplay: .milliseconds(50))
        _ = await (first, second)
        XCTAssertEqual(onboardCalls(w), 1)
        XCTAssertEqual(vm.phase, .outcome(.planCreated))
    }

    func testSubmitBeforeTheLastStepSendsNothing() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = OnboardingViewModel(writer: w)
        vm.draft = answeredDraft(.noneOfThese)
        await vm.submit()
        XCTAssertEqual(onboardCalls(w), 0)
        XCTAssertEqual(vm.phase, .form)
    }

    func testOutsideScopeThenReviewReturnsToCareWithTheAnswersKept() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = atLastStep(.pregnancy, writer: w)
        await vm.submit()
        guard case .outcome(.outsideV1Scope) = vm.phase else { return XCTFail("pregnancy must be outside the V1 scope, got \(vm.phase)") }
        vm.reviewCare()
        XCTAssertEqual(vm.phase, .form)
        XCTAssertEqual(vm.step, .care)
        XCTAssertEqual(vm.draft.care, .pregnancy)
        XCTAssertEqual(vm.draft.ageText, "32")
    }

    /// #61: the goals step needs the race date and the schedule step the plan length; neither is a starting value.
    func testRaceDateAndPlanLengthMustBeChosenToContinue() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = OnboardingViewModel(writer: w)
        vm.draft = answeredDraft(.noneOfThese); vm.draft.eventDate = nil; vm.draft.weeks = nil
        while vm.step != .goals { vm.next() }
        XCTAssertFalse(vm.canContinue, "a race without its date")
        XCTAssertEqual(vm.requiredNote, "ob.event.date.required")
        vm.next()
        XCTAssertEqual(vm.step, .goals)
        vm.draft.eventDate = Calendar.current.date(from: DateComponents(year: 2027, month: 1, day: 21, hour: 12))
        XCTAssertNil(vm.requiredNote)
        while vm.step != .schedule { vm.next() }
        XCTAssertFalse(vm.canContinue, "no plan length")
        XCTAssertEqual(vm.requiredNote, "ob.weeks.required")
        vm.next()
        XCTAssertEqual(vm.step, .schedule)
        vm.draft.weeks = 8
        XCTAssertTrue(vm.canContinue)
        while !vm.isLastStep { vm.next() }
        vm.draft.weeks = nil
        await vm.submit()
        XCTAssertEqual(onboardCalls(w), 0, "unset plan length: nothing is sent")
        XCTAssertEqual(vm.phase, .form)
    }

    /// #61: INVALID_INPUT is its own state ("Algumas respostas não combinam entre si"), never the missing-answer one.
    func testInvalidInputIsShownAsSuch() async throws {
        let json = #"{"ok":true,"status":"INVALID_INPUT","missingInputs":[],"errors":["event.withinHorizonAndNotImmediate"],"reason":"Input facts are malformed or contradictory","enrolled":false}"#
        let vm = atLastStep(.noneOfThese, writer: ScriptedOnboardWriter(try Safety.answer(json)))
        await vm.submit()
        XCTAssertEqual(vm.phase, .outcome(.invalidInput))
        // `errors` is not decoded by BoundaryAnswer yet: no step is named, the review starts at the first question.
        XCTAssertEqual(vm.reviewSteps, [])
        vm.reviewAnswers()
        XCTAssertEqual(vm.phase, .form)
        XCTAssertEqual(vm.step, .age)
        XCTAssertEqual(vm.draft.weeks, 12, "answers kept")
    }

    func testNeedsInputStaysTheMissingAnswerState() async throws {
        let json = #"{"ok":true,"status":"ASK","missingInputs":["athlete.event.date"],"errors":[],"enrolled":false}"#
        let vm = atLastStep(.noneOfThese, writer: ScriptedOnboardWriter(try Safety.answer(json)))
        await vm.submit()
        XCTAssertEqual(vm.phase, .outcome(.needsInput(["athlete.event.date"])))
        XCTAssertEqual(vm.reviewSteps, [])
        vm.returnToForm()
        XCTAssertEqual(vm.phase, .form)
        XCTAssertEqual(vm.step, .consents, "as before: back to the form where the athlete was")
    }

    /// Display routing only: each engine field code to the step that asks it, in step order.
    func testEngineFieldsMapToTheStepsThatAskThem() {
        XCTAssertEqual(OnboardingViewModel.steps(asking: ["event.withinHorizonAndNotImmediate"]), [.goals, .schedule])
        XCTAssertEqual(OnboardingViewModel.steps(asking: ["weeks.4/8/12/16"]), [.schedule])
        XCTAssertEqual(OnboardingViewModel.steps(asking: ["athlete.equipment", "schedule.longRunDay.mustBeChosenRunDay", "recent.runMinutesPerWeek"]),
                       [.experience, .schedule, .equipment])
        XCTAssertEqual(OnboardingViewModel.steps(asking: ["asOf/startDate", "timezoneOffsetMinutes"]), [], "host-set fields are not the athlete's to fix")
    }
}

/// A writer whose `onboard` answers one given answer.
private final class ScriptedOnboardWriter: CoachingWriting {
    let answer: BoundaryAnswer
    init(_ answer: BoundaryAnswer) { self.answer = answer }
    private var none: WriteOutcome { WriteOutcome(answer: FixtureCoachingWriter.unavailable, kept: [], notKept: []) }
    func onboard(_ answers: OnboardingAnswers, consents: Consents) async -> WriteOutcome { WriteOutcome(answer: answer, kept: [], notKept: []) }
    func restart(_ answers: OnboardingAnswers) async -> WriteOutcome { none }
    func submit(_ review: ReviewRequest) async -> WriteOutcome { none }
    func accept(decisionId: String) async -> WriteOutcome { none }
    func decline(decisionId: String) async -> WriteOutcome { none }
    func setHeartRateProfile(_ profile: HeartRateProfileRequest) async -> Result<HeartRateProfileAnswer, BoundaryError> { .failure(BoundaryError(code: "UNUSED")) }
    func eraseHeartRateProfile() async -> Result<HeartRateProfileAnswer, BoundaryError> { .failure(BoundaryError(code: "UNUSED")) }
    func setConsent(_ purpose: ConsentPurpose, granted: Bool) async -> WriteOutcome { none }
    func eraseHealthFacts(eventIds: [String]) async -> WriteOutcome { none }
    func eraseAccount() async -> WriteOutcome { none }
    func acknowledgeRecordLoss() async -> WriteOutcome { none }
}
