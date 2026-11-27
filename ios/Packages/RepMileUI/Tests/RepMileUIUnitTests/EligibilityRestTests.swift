import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #72: "Não estou 100%" (every entry point), the readiness declaration and the unavailable day ask the eligibility screen themselves, with
/// #68's rule (`EligibilityScreen.unanswered`, `answered`, `dated`). The engine reads the screen before anything else: without it a red-flag
/// sign gets ASK with no guidance, a readiness declaration cannot release the hold, and an unavailable day is not applied (replay
/// `audits/v1-ios-swiftui-2026-11-26/results/i72-eligibility-rest/`). With it, a lone urgent sign routes at once: the screen is the only gate.
@MainActor
final class EligibilityRestTests: XCTestCase {
    private func submits(_ j: RequestJournal) -> Int { j.entries.filter { $0.call == "submit" }.count }
    private func answerAllButConfirmation(_ e: inout EligibilityScreen) {
        e.pain = false; e.persistentPain = false; e.injury = false; e.illness = false; e.functionalLimitation = false; e.clinicalConcern = false
    }
    private var runSession: PlannedSession {
        get throws { try XCTUnwrap(try Repo.store.decode(PlanView.self, "13-plan-w1", at: "view").week?.sessions.first { $0.executable && $0.sport.raw == "RUN" }) }
    }

    // MARK: "Não estou 100%"

    private func notFeeling(_ w: CoachingWriting, today: String? = "2026-11-22") -> NotFeeling100ViewModel {
        NotFeeling100ViewModel(reader: Safety.reader(), writer: w, planToday: { today })
    }

    func testNotFeelingWaitsForTheScreenOnly() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = notFeeling(w)
        XCTAssertEqual(vm.eligibility, .unanswered, "nothing pre-answered")
        await vm.choose(.mildIllness)
        vm.answers["chestPainPressureOrTightness"] = true
        XCTAssertFalse(vm.canSend, "the engine routes no sign without the screen (ASK, no guidance)")
        await vm.send()
        XCTAssertEqual(submits(w.journal), 0, "an unanswered screen sends nothing")
        answerAllButConfirmation(&vm.eligibility)
        XCTAssertFalse(vm.canSend, "six \"não\" but not confirmed")
        vm.eligibility.status = .nonclinicalConfirmed
        XCTAssertNil(vm.intent)
        XCTAssertTrue(vm.canSend, "a red flag waits for no other sign and no intent: with the screen the engine routes it at once")
    }

    func testARedFlagAloneIsSentWithTheScreenAndShowsTheClinicalRoute() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = notFeeling(w, today: "2026-11-23")
        await vm.choose(.minorDiscomfort)
        vm.answers["chestPainPressureOrTightness"] = true
        vm.eligibility = .testNoneApplies
        await vm.send()
        XCTAssertEqual(vm.phase, .outcome(.blocked))
        let sent = try XCTUnwrap(try Safety.submits(w.journal).first)
        XCTAssertEqual((sent["wellbeing"] as? [String: Any])?["warningSigns"] as? [String: Bool], ["chestPainPressureOrTightness": true],
                       "only the answered sign; the others stay unanswered, never false")
        let e = try XCTUnwrap(sent["eligibility"] as? [String: Any])
        XCTAssertEqual(e["assessedAt"] as? String, "2026-11-23", "the plan's today")
        XCTAssertEqual(e["status"] as? String, "NONCLINICAL_CONFIRMED")
    }

    func testNotFeelingIsDatedThePlansDayOnly() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = notFeeling(w, today: nil)
        await vm.choose(.needRest)
        vm.eligibility = .testNoneApplies
        XCTAssertNil(vm.request(), "no plan loaded: never the device's day (#59)")
        XCTAssertFalse(vm.canSend)
        await vm.send()
        XCTAssertEqual(submits(w.journal), 0)
    }

    func testAFlagYesOnTheScreenIsSentAndRoutesToAHuman() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = notFeeling(w)
        await vm.choose(.mildIllness)
        answerAllButConfirmation(&vm.eligibility); vm.eligibility.illness = true
        XCTAssertTrue(vm.canSend, "a yes is an answer: the engine routes it, the app does not judge it")
        await vm.send()
        XCTAssertEqual(vm.phase, .outcome(.blocked))
        let e = try XCTUnwrap(try Safety.submits(w.journal).first?["eligibility"] as? [String: Any])
        XCTAssertEqual(e["illness"] as? Bool, true)
        XCTAssertNil(e["status"], "never confirmed nonclinical alongside a yes")
    }

    func testEachDeclarationAsksAgain() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let first = notFeeling(w)
        await first.choose(.needRest)
        first.eligibility = .testNoneApplies
        await first.send()
        let second = notFeeling(w)
        await second.choose(.needRest)
        XCTAssertEqual(second.eligibility, .unanswered, "a \"não\" given before is not a current assessment")
        XCTAssertFalse(second.canSend)
    }

    /// Fixture mode answers as the engine does: a declaration without an answered, dated screen gets the captured ASK, a red flag included.
    func testFixtureWriterAsksTheScreenBeforeTheSigns() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let set = try Safety.set("MILD_ILLNESS")
        var decl = try WellbeingDeclaration(condition: .mildIllness, set: set, intent: .rest)
        try decl.warningSigns.answer("chestPainPressureOrTightness", true)
        var undated = EligibilityScreen.testNoneApplies; undated.assessedAt = ""
        for screen in [nil, EligibilityScreen.unanswered, undated] as [EligibilityScreen?] {
            let out = await w.submit(ReviewRequest(.notFeeling100(decl, reports: []), eligibility: screen))
            XCTAssertEqual(NotFeeling100ViewModel.outcome(out.answer), .needsAnswers, "ASK eligibility.currentAssessment, no clinical route")
        }
        let routed = await w.submit(ReviewRequest(.notFeeling100(decl, reports: []), eligibility: EligibilityScreen.testNoneApplies.dated("2026-11-22")))
        XCTAssertEqual(NotFeeling100ViewModel.outcome(routed.answer), .blocked)
    }

    // MARK: Readiness

    /// Loaded, every one of the 15 signs "não" (the sign gate is pinned in `testReadinessAnswersEverySignUnlessOneIsYes`).
    private func readiness(_ w: CoachingWriting, today: String? = "2026-11-22") async -> ReadinessViewModel {
        let vm = ReadinessViewModel(reader: Safety.reader(), writer: w, planToday: { today })
        await vm.load()
        vm.answers = Dictionary(uniqueKeysWithValues: (vm.questionSet?.warningSigns ?? []).map { ($0, false) })
        return vm
    }

    /// During a hold the engine does not ASK an unanswered sign: CLINICAL_HUMAN_REQUIRED with the sign missing (replay i72 §4), which would
    /// read as a reported sign. So every sign is answered first, unless one is "sim" (routed at once, the others unanswered).
    func testReadinessAnswersEverySignUnlessOneIsYes() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = await readiness(w)
        let set = try Safety.set("READINESS")
        vm.recovered = true; vm.eligibility = .testNoneApplies
        XCTAssertTrue(vm.canSend)
        vm.answers[set.warningSigns[3]] = nil
        XCTAssertFalse(vm.canSend, "one sign unanswered")
        await vm.send()
        XCTAssertEqual(submits(w.journal), 0)
        vm.answers = [set.warningSigns[2]: true]
        XCTAssertTrue(vm.canSend, "a \"sim\" waits for no other sign")
    }

    func testReadinessWaitsForTheScreenAndCarriesIt() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = await readiness(w)
        vm.recovered = true; vm.run = true; vm.strength = true
        XCTAssertEqual(vm.eligibility, .unanswered)
        XCTAssertFalse(vm.canSend, "without the screen the engine cannot release the hold")
        await vm.send()
        XCTAssertEqual(submits(w.journal), 0)
        answerAllButConfirmation(&vm.eligibility)
        XCTAssertFalse(vm.canSend)
        vm.eligibility.status = .nonclinicalConfirmed
        XCTAssertTrue(vm.canSend, "the 15 signs never gate it: the engine asks them")
        await vm.send()
        XCTAssertEqual(vm.phase, .returning)
        let e = try XCTUnwrap(try Safety.submits(w.journal).first?["eligibility"] as? [String: Any])
        XCTAssertEqual(e["assessedAt"] as? String, "2026-11-22")
        XCTAssertEqual(e["status"] as? String, "NONCLINICAL_CONFIRMED")
    }

    func testReadinessWithoutThePlansDayOrWithAYes() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let noPlan = await readiness(w, today: nil)
        noPlan.recovered = true; noPlan.eligibility = .testNoneApplies
        XCTAssertNil(noPlan.request())
        await noPlan.send()
        XCTAssertEqual(submits(w.journal), 0)
        let yes = await readiness(w)
        yes.recovered = true; answerAllButConfirmation(&yes.eligibility); yes.eligibility.pain = true
        await yes.send()
        XCTAssertEqual(yes.phase, .stillBlocked, "a flag yes keeps the hold")
        XCTAssertEqual((try Safety.submits(w.journal).first?["eligibility"] as? [String: Any])?["pain"] as? Bool, true)
    }

    func testReadinessBackKeepsTheScreen() async throws {
        let vm = await readiness(ScriptedSubmitWriter(try Safety.answer(#"{"ok":true,"status":"ASK"}"#)))
        vm.recovered = true; vm.eligibility = .testNoneApplies
        await vm.send()
        vm.back()
        XCTAssertEqual(vm.eligibility, .testNoneApplies, "the same draft: the screen answered here stays")
        XCTAssertTrue(vm.canSend)
    }

    /// The engine answers a declaration without the screen CLINICAL_HUMAN_REQUIRED (the hold stands); fixture mode, its clinical capture.
    func testFixtureWriterKeepsTheHoldWithoutTheScreen() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let decl = try ReadinessDeclaration(declaredRecovered: true, set: try Safety.set("READINESS"), sports: .init(run: .init(ready: true), strength: nil))
        let out = await w.submit(ReviewRequest(.readiness(decl, reports: []), eligibility: nil))
        XCTAssertEqual(ReadinessViewModel.reply(for: out.answer), .stillBlocked)
    }

    // MARK: Unavailable day

    private func unavailable(_ w: CoachingWriting, today: String? = "2026-11-22", reload: @escaping () async -> Void = {}) throws -> UnavailableDayViewModel {
        UnavailableDayViewModel(session: try runSession, writer: w, planToday: { today }, reload: reload,
                                presentation: { try? Repo.store.decode(PresentationSnapshot.self, "actions-B1b-presentation-pending") })
    }

    func testUnavailableDayWaitsForTheScreenAndCarriesIt() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = try unavailable(w, today: "2026-11-23")
        XCTAssertEqual(vm.eligibility, .unanswered)
        XCTAssertFalse(vm.canSend)
        await vm.send()
        XCTAssertEqual(submits(w.journal), 0)
        vm.eligibility = .testNoneApplies
        XCTAssertTrue(vm.canSend)
        await vm.send()
        XCTAssertEqual(vm.phase, .proposed(decisionId: "dc_000031"))
        let e = try XCTUnwrap(try Safety.submits(w.journal).first?["eligibility"] as? [String: Any])
        XCTAssertEqual(e["assessedAt"] as? String, "2026-11-23", "the plan's today")
        let noPlan = try unavailable(w, today: nil)
        noPlan.eligibility = .testNoneApplies
        XCTAssertFalse(noPlan.canSend)
    }

    /// Before #72 the answer's decision id alone made a proposal: the engine's ASK and its clinical route both carry one.
    func testOnlyAPendingDecisionIsAProposal() throws {
        let ask = try Repo.store.decode(BoundaryAnswer.self, "14-setPreferences")
        XCTAssertNotNil(ask.decisionId)
        XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: ask), .needsInput)
        let clinical = try Repo.store.decode(BoundaryAnswer.self, "actions-E2-break-clinical")
        XCTAssertNotNil(clinical.decisionId)
        XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: clinical), .clinical)
        XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: try Repo.store.decode(BoundaryAnswer.self, "actions-B1-unavailable-day")), .proposed(decisionId: "dc_000031"))
        XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: try Safety.answer(#"{"ok":true,"status":"KEEP","decisionId":"dc_1"}"#)), .failed("UNKNOWN"))
    }

    /// Fixture mode answers as the engine does: no answered, dated screen → the captured ASK (a decision id, nothing pending).
    func testFixtureWriterAsksTheScreenForTheUnavailableDay() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let s = try runSession
        for screen in [nil, EligibilityScreen.unanswered] as [EligibilityScreen?] {
            let out = await w.submit(ReviewRequest(.unavailableDays([s.date]), eligibility: screen))
            XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: out.answer), .needsInput)
        }
        let flagged = await w.submit(ReviewRequest(.unavailableDays([s.date]), eligibility: {
            var e = EligibilityScreen.testNoneApplies; e.status = nil; e.pain = true; return e.dated("2026-11-22") }()))
        XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: flagged.answer), .clinical)
    }

    func testAQuestionEndsTheRequestAndAClinicalRouteMovesNothing() async throws {
        var reloads = 0
        let ask = try unavailable(ScriptedSubmitWriter(try Repo.store.decode(BoundaryAnswer.self, "14-setPreferences")), reload: { reloads += 1 })
        ask.eligibility = .testNoneApplies
        await ask.send()
        XCTAssertEqual(ask.phase, .needsInput)
        XCTAssertFalse(ask.canAccept)
        XCTAssertFalse(ask.canSend, "the same request would get the same question: not offered again")

        let w = FixtureCoachingWriter(store: Repo.store)
        let yes = try unavailable(w, reload: { reloads += 1 })
        answerAllButConfirmation(&yes.eligibility); yes.eligibility.injury = true
        await yes.send()
        XCTAssertEqual(yes.phase, .clinical)
        XCTAssertFalse(yes.canAccept)
        await yes.accept()
        XCTAssertTrue(w.journal.entries.filter { $0.call == "accept" }.isEmpty, "nothing to confirm")
        XCTAssertEqual(reloads, 0, "no proposal to re-read")
    }
}
