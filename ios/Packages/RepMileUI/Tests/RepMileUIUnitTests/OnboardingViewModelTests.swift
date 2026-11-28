import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #101: the onboarding flow's state, its one write and the screen each engine answer leads to (spec F-ONBOARDING-FIGMA §1, §3).
@MainActor
final class OnboardingViewModelTests: XCTestCase {
    /// Saturday 24 Oct 2026 at noon: the plan starts on Monday 26 Oct (Figma 08).
    private let saturday: () -> Date = { Calendar.current.date(from: DateComponents(year: 2026, month: 10, day: 24, hour: 12)) ?? Date() }

    private func vm(_ writer: CoachingWriting = FixtureCoachingWriter(store: Repo.store), store: OnboardingStoring = MemoryOnboardingStore()) -> OnboardingViewModel {
        OnboardingViewModel(writer: writer, store: store, athleteId: "i101-athlete", now: saturday)
    }
    private func onboardCalls(_ w: FixtureCoachingWriter) -> Int { w.journal.entries.filter { $0.call == "onboard" }.count }

    /// Walks every screen with Lucas' answers, as the athlete would.
    private func atDataUse(_ d: OnboardingDraft = OnboardingTests.lucas(), writer: CoachingWriting = FixtureCoachingWriter(store: Repo.store),
                           store: OnboardingStoring = MemoryOnboardingStore()) -> OnboardingViewModel {
        let m = vm(writer, store: store)
        m.draft = d
        while m.step != .dataUse {
            let before = m.step
            m.next()
            if m.sheet == .confirmCare { m.confirmCare() }
            XCTAssertNotEqual(m.step, before, "stuck at \(before)")
            if m.step == before { break }
        }
        return m
    }

    func testAnUnansweredScreenCannotBeLeft() {
        let m = vm()
        XCTAssertEqual(m.step, .opening)
        m.next()
        XCTAssertEqual(m.step, .train)
        XCTAssertFalse(m.canContinue, "nothing chosen")
        m.next()
        XCTAssertEqual(m.step, .train)
        m.draft.choose(train: .both)
        m.next()
        XCTAssertEqual(m.step, .runAim)
        m.back()
        XCTAssertEqual(m.step, .train)
    }

    func testTheStartIsTheNextMondayAndARaceBeyondSixteenWeeksBlocks() {
        let m = vm()
        XCTAssertEqual(m.startDay, "2026-10-26")
        m.draft = OnboardingTests.lucas()
        XCTAssertEqual(m.planWeeks, 8)
        m.draft.raceDay = "2027-03-07"
        XCTAssertTrue(m.raceBeyondPlan)
        while m.step != .raceDate { m.next() }
        XCTAssertFalse(m.canContinue, "`838:3864`: Continuar disabled")
        m.continueWithoutRace()
        XCTAssertEqual(m.step, .runAim)
        XCTAssertNil(m.draft.raceDay)
        XCTAssertNil(m.draft.runAim, "the athlete chooses again")
    }

    /// 27b: a clinical sign is confirmed before continuing; "Revisar respostas" stays on Cuidados.
    func testAMarkedSignAsksForConfirmation() {
        var d = OnboardingTests.lucas(); d.toggleCare(.injury)
        let m = vm(); m.draft = d
        while m.step != .care { m.next() }
        m.next()
        XCTAssertEqual(m.sheet, .confirmCare)
        XCTAssertEqual(m.step, .care)
        m.sheet = nil
        XCTAssertEqual(m.step, .care, "review: the answers stay")
        m.next(); m.confirmCare()
        XCTAssertEqual(m.step, .youDone)
    }

    func testSubmitSendsOnceAndShowsThePlan() async {
        let w = FixtureCoachingWriter(store: Repo.store), store = MemoryOnboardingStore()
        let m = atDataUse(writer: w, store: store)
        XCTAssertTrue(m.canContinue)
        await m.submit()
        XCTAssertEqual(m.phase, .ready)
        await m.submit()
        XCTAssertEqual(onboardCalls(w), 1, "no second enrolment")
        XCTAssertNil(store.load()?.draft, "the record holds the answers now")
        XCTAssertEqual(store.load()?.profile?.name, "Lucas", "the local-only profile stays")
        XCTAssertEqual(store.load()?.profile?.heightCm, 178)
    }

    func testTwoTapsWhileBuildingEnrolOnce() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        let m = atDataUse(writer: w)
        async let first: Void = m.submit(minimumDisplay: .milliseconds(50))
        async let second: Void = m.submit(minimumDisplay: .milliseconds(50))
        _ = await (first, second)
        XCTAssertEqual(onboardCalls(w), 1)
        XCTAssertEqual(m.phase, .ready)
    }

    /// An open decision holds the send: "Montar meu plano" is disabled and nothing reaches the engine (Rafa: no race, D03).
    func testAHeldDraftSendsNothing() async {
        var d = OnboardingTests.lucas(); d.choose(aim: .noRace(.performance))
        let w = FixtureCoachingWriter(store: Repo.store)
        let m = atDataUse(d, writer: w)
        XCTAssertFalse(m.canContinue)
        XCTAssertEqual(m.holds, [.noRaceWeeks])
        await m.submit()
        XCTAssertEqual(onboardCalls(w), 0)
        XCTAssertEqual(m.phase, .form)
    }

    /// The screen the Figma draws for each engine outcome (engineering decisions D27/D23, 27/11): INVALID_INPUT and failures → `838:3972`.
    func testEachOutcomeLeadsToItsFrame() {
        XCTAssertEqual(OnboardingViewModel.phase(for: .planCreated), .ready)
        XCTAssertEqual(OnboardingViewModel.phase(for: .outsideV1Scope(reason: nil)), .outcome(.outsideScope(.unknown)))
        XCTAssertEqual(OnboardingViewModel.phase(for: .clinicalHumanRequired), .outcome(.heldForSafety))
        XCTAssertEqual(OnboardingViewModel.phase(for: .needsInput(["athlete.event.date"])), .outcome(.missingAnswer(["athlete.event.date"])))
        XCTAssertEqual(OnboardingViewModel.phase(for: .invalidInput), .outcome(.notBuilt))
        XCTAssertEqual(OnboardingViewModel.phase(for: .failed("BUSY")), .outcome(.notBuilt))
        XCTAssertEqual(OnboardingViewModel.phase(for: .unrecognized("NEW")), .outcome(.notBuilt), "fail closed: never a plan")
    }

    func testRetryAndReviewKeepTheAnswers() async throws {
        let json = #"{"ok":true,"status":"INVALID_INPUT","missingInputs":[],"errors":["event.withinHorizonAndNotImmediate"],"enrolled":false}"#
        let w = ScriptedOnboardWriter(try Safety.answer(json))
        let m = atDataUse(writer: w)
        await m.submit()
        XCTAssertEqual(m.phase, .outcome(.notBuilt))
        await m.retry()
        XCTAssertEqual(w.calls, 2, "Tentar de novo sends the same answers again")
        m.review()
        XCTAssertEqual(m.phase, .form)
        XCTAssertEqual(m.step, .train)
        XCTAssertEqual(m.draft, OnboardingTests.lucas(), "answers kept")
    }

    func testMissingAnswersReturnToTheirStep() async throws {
        let json = #"{"ok":true,"status":"ASK","missingInputs":["schedule.runMinutes"],"enrolled":false}"#
        let m = atDataUse(writer: ScriptedOnboardWriter(try Safety.answer(json)))
        await m.submit()
        XCTAssertEqual(m.phase, .outcome(.missingAnswer(["schedule.runMinutes"])))
        m.review()
        XCTAssertEqual(m.step, .duration)
        let flow = OnboardingStep.flow(for: OnboardingTests.lucas())
        XCTAssertEqual(OnboardingViewModel.step(asking: ["athlete.event.date"], in: flow), .raceDate)
        XCTAssertEqual(OnboardingViewModel.step(asking: ["athlete.eligibility.currentNonclinicalAssessment"], in: flow), .care)
        XCTAssertNil(OnboardingViewModel.step(asking: ["asOf/startDate"], in: flow), "host-set fields are not the athlete's to fix")
    }

    /// The real engine's answer to a marked sign (`Captures/onboard-clinical`, replayed by the fixture writer): retido por segurança.
    func testAClinicalSignIsHeldForSafety() async {
        var d = OnboardingTests.lucas(); d.toggleCare(.persistentPain)
        let m = atDataUse(d)
        await m.submit()
        XCTAssertEqual(m.phase, .outcome(.heldForSafety))
    }

    /// QRE P3-7: outside scope reviews the answer the engine named (its reason carries the scope code).
    func testOutsideScopeReviewsTheAnswerTheEngineNamed() async throws {
        let base = "Outside the V1 coaching population or event scope: "
        for (code, scope, step) in [("POPULATION_OUTSIDE_V1_AGE_RANGE", OutsideScope.age, OnboardingStep.age),
                                    ("SPECIAL_POPULATION_OUTSIDE_V1", .specialPopulation, .care), ("EVENT_DISTANCE_OUTSIDE_V1", .eventDistance, .runAim)] {
            let json = #"{"ok":true,"status":"UNSUPPORTED","enrolled":false,"reason":"\#(base + code)"}"#
            let m = atDataUse(writer: ScriptedOnboardWriter(try Safety.answer(json)))
            await m.submit()
            XCTAssertEqual(m.phase, .outcome(.outsideScope(scope)), code)
            m.review()
            XCTAssertEqual(m.step, step, code)
        }
        XCTAssertEqual(OutsideScope(reason: nil), .unknown)
    }

    /// SSCTR C4: after CLINICAL_HUMAN_REQUIRED the draft is never sent again: no review, and a relaunch resumes on "Retido por segurança".
    func testAHeldForSafetyDraftIsNeverSentAgain() async {
        var d = OnboardingTests.lucas(); d.toggleCare(.persistentPain)
        let w = FixtureCoachingWriter(store: Repo.store), store = MemoryOnboardingStore()
        let m = atDataUse(d, writer: w, store: store)
        await m.submit()
        XCTAssertEqual(m.phase, .outcome(.heldForSafety))
        XCTAssertEqual(store.load()?.heldForSafety, true)
        m.review()
        XCTAssertEqual(m.phase, .outcome(.heldForSafety), "no review from the held screen")
        let relaunched = vm(w, store: store)
        XCTAssertEqual(relaunched.phase, .outcome(.heldForSafety), "resumes on the held screen, never on an editable form")
        relaunched.resumeWhereStopped(); relaunched.restart(); relaunched.review()
        relaunched.draft.chooseNoCare()
        await relaunched.submit()
        XCTAssertEqual(relaunched.phase, .outcome(.heldForSafety))
        XCTAssertEqual(onboardCalls(w), 1, "\"Nenhum destes\" afterwards never reaches the engine (the replay shows it would enrol)")
    }

    /// QRE P1 (until #109): a held draft with a marked sign still asks 27b, and nothing is sent.
    func testAHeldDraftWithAMarkedSignConfirmsAndSendsNothing() async {
        var d = OnboardingTests.lucas(); d.choose(aim: .noRace(.regularity)); d.toggleCare(.pain)
        let w = FixtureCoachingWriter(store: Repo.store)
        let m = vm(w); m.draft = d
        while m.step != .care { m.next() }
        m.next()
        XCTAssertEqual(m.sheet, .confirmCare, "27b shows the sign")
        m.confirmCare()
        while m.step != .dataUse { m.next() }
        XCTAssertFalse(m.canContinue)
        XCTAssertEqual(m.holds, [.noRaceWeeks])
        await m.submit()
        XCTAssertEqual(onboardCalls(w), 0)
    }

    /// QRE P3-5: the accepted draft leaves the store before "Montando seu plano" finishes on screen.
    func testTheSentDraftIsClearedBeforeTheMinimumDisplay() async throws {
        let store = MemoryOnboardingStore()
        let m = atDataUse(store: store)
        let task = Task { await m.submit(minimumDisplay: .milliseconds(600)) }
        try await Task.sleep(for: .milliseconds(200))
        XCTAssertEqual(m.phase, .building)
        XCTAssertNil(store.load()?.draft)
        await task.value
        XCTAssertEqual(m.phase, .ready)
    }

    /// QRE P3-6: "Montar meu plano" opens only for a request that can be built.
    func testBuildNeedsABuildableRequest() {
        let m = atDataUse()
        XCTAssertTrue(m.canContinue)
        m.draft.age = nil
        XCTAssertEqual(m.holds, [])
        XCTAssertFalse(m.canContinue, "no hold, but an answer is missing: nothing to send")
    }

    /// QRE P3-4: "Retomar" names a real screen; a respiro resumes at the next stage with no screen named.
    func testResumeNamesARealScreen() {
        for s in OnboardingStep.allCases where !s.isRespiro && s != .opening {
            XCTAssertNotEqual(L.t("ob.stepName.\(s.rawValue)"), "ob.stepName.\(s.rawValue)", "\(s) has a name")
            XCTAssertEqual(OnboardingViewModel.resumePoint(for: s).stoppedAt, s)
        }
        XCTAssertEqual(OnboardingViewModel.resumePoint(for: .goalDone).stage, 2)
        XCTAssertNil(OnboardingViewModel.resumePoint(for: .routineDone).stoppedAt)
        XCTAssertEqual(OnboardingViewModel.resumePoint(for: .youDone).stage, 4)
    }

    /// `838:4219` / `838:3918`: unsent answers stay on this iPhone and the flow resumes where it stopped; "Recomeçar" erases them.
    func testUnsentAnswersResume() {
        let store = MemoryOnboardingStore()
        let m = vm(store: store)
        m.next(); m.draft.choose(train: .both); m.next()
        XCTAssertEqual(store.load()?.step, .runAim)
        let again = vm(store: store)
        XCTAssertEqual(again.phase, .resume)
        XCTAssertEqual(again.draft.train, .both)
        again.resumeWhereStopped()
        XCTAssertEqual(again.phase, .form)
        XCTAssertEqual(again.step, .runAim)
        again.restart()
        XCTAssertNotNil(store.load(), "\"Recomeçar\" exists only on the resume screen")
        let third = vm(store: store)
        third.restart()
        XCTAssertNil(store.load())
        XCTAssertEqual(third.step, .opening)
        XCTAssertEqual(vm(store: store).phase, .form)
    }

    /// D18 (#113): 31 → 32 alpha local → "Continuar neste iPhone" → 33 build de teste → 34. Closing 32 stays on 31.
    func testTheAlphaPathToTheFirstWeek() async {
        let m = atDataUse()
        await m.submit()
        m.saveThePlan()
        XCTAssertEqual(m.sheet, .account)
        m.sheet = nil
        XCTAssertEqual(m.phase, .ready, "closing the sheet keeps 31")
        m.saveThePlan(); m.continueOnThisIPhone()
        XCTAssertEqual(m.phase, .subscribe)
        XCTAssertNil(m.sheet)
        m.subscriptionDone()
        XCTAssertEqual(m.phase, .firstWeek)
        XCTAssertFalse(OBBuild.accountAvailable, "no account service in V1 yet (#28)")
    }

    /// D21 A (#113): × goes straight to "Retomar o cadastro", the answers kept; no confirmation (nothing is lost).
    func testCloseGoesStraightToResumeKeepingTheAnswers() {
        let store = MemoryOnboardingStore()
        let m = vm(store: store); m.draft = OnboardingTests.lucas()
        while m.step != .week { m.next() }
        m.leaveToResume()
        XCTAssertEqual(m.phase, .resume)
        XCTAssertNil(m.sheet)
        XCTAssertEqual(store.load()?.step, .week)
        XCTAssertEqual(store.load()?.draft, OnboardingTests.lucas())
        m.resumeWhereStopped()
        XCTAssertEqual(m.step, .week)
    }

    /// D04 A (`1491:8266`): under 7 days from the start blocks 04 for 5 km/10 km/half; a marathon closer is the preparatory plan.
    func testARaceTooCloseBlocksExceptTheMarathon() {
        let m = vm(); m.draft = OnboardingTests.lucas()
        m.draft.raceDay = "2026-10-30"
        XCTAssertTrue(m.raceTooClose)
        XCTAssertFalse(m.raceBeyondPlan)
        while m.step != .raceDate { m.next() }
        XCTAssertFalse(m.canContinue)
        m.draft.raceDay = "2026-11-02"
        XCTAssertFalse(m.raceTooClose, "from 2 November (the Figma's example)")
        XCTAssertTrue(m.canContinue)
        m.draft.choose(aim: .race(.marathon)); m.draft.raceDay = "2026-10-30"
        XCTAssertFalse(m.raceTooClose, "the marathon exception")
        m.draft.raceDay = "2026-10-20"
        XCTAssertTrue(m.raceTooClose, "a day before the start is never a race day")
        XCTAssertEqual(OnboardingDraft.firstRaceDay(start: "2026-10-26"), "2026-11-02")
    }

    func testTheSkipsAnswerTheirStep() {
        let m = vm(); m.draft = OnboardingTests.lucas(); m.draft.goalMinutes = nil; m.draft.goalSeconds = nil
        while m.step != .goalTime { m.next() }
        XCTAssertFalse(m.canContinue)
        m.skip()
        XCTAssertTrue(m.draft.goalSkipped)
        XCTAssertEqual(m.step, .strengthAim)
        m.draft.hasResult = nil; m.draft.resultMinutes = nil
        while m.step != .result { m.next() }
        m.draft.resultConditions = .heatOrHill; m.draft.resultMeasure = .track
        m.skip()
        XCTAssertEqual(m.draft.hasResult, false)
        XCTAssertNil(m.draft.resultConditions, "QRE P3-9: nothing of a result stays behind")
        XCTAssertNil(m.draft.resultMeasure)
        XCTAssertEqual(m.step, .result, "23 shows its \"não tenho\" variant first")
        m.draft.choose(resultDistance: .half); m.draft.resultMinutes = 52; m.draft.resultSeconds = 30
        XCTAssertFalse(m.canContinue, "D19 A: a half needs its hours column")
        m.draft.resultHours = 1
        XCTAssertTrue(m.canContinue)
        XCTAssertEqual(m.draft.resultTotalSeconds, 6750)
        m.draft.choose(resultDistance: .tenK)
        XCTAssertNil(m.draft.resultMinutes, "another distance clears the wheel")
    }
}
