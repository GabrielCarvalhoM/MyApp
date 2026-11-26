import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #32 increment 1: the onboarding state and its write live in `OnboardingViewModel`; the behaviour is the one the UI tests already pin.
@MainActor
final class OnboardingViewModelTests: XCTestCase {
    private func answeredDraft(_ care: OnboardingDraft.Care) -> OnboardingDraft {
        var d = OnboardingDraft(); d.care = care; d.ageText = "32"
        d.eligibility = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "", pain: false, persistentPain: false, injury: false, illness: false,
                                          functionalLimitation: false, clinicalConcern: false)
        for p in ConsentPurpose.allCases { d.consents[p] = p == .coaching }
        return d
    }

    /// Walks every step with a fully answered draft, as the athlete would.
    private func atLastStep(_ care: OnboardingDraft.Care, writer: FixtureCoachingWriter) -> OnboardingViewModel {
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
}
