import CoachingPresentation
import Foundation
import IntegrationContracts
@testable import RunRecorder
import XCTest
@testable import RepMileUI

extension EligibilityScreen {
    /// Six "não" and the nonclinical confirmation, as the athlete answers `EligibilityForm`.
    static var testNoneApplies: EligibilityScreen {
        EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "", pain: false, persistentPain: false, injury: false, illness: false,
                          functionalLimitation: false, clinicalConcern: false)
    }
}

/// #68: the run report and the strength log ask the eligibility screen themselves (the engine records no athlete report without a current
/// one, `r6-adaptation.mjs` eligibility.currentAssessment; replay in `audits/v1-ios-swiftui-2026-11-26/results/i68-report-eligibility/`).
/// Nothing pre-answered (nil ≠ false), nothing sent until answered, dated the day it is answered, never carried from an earlier report; a
/// flag answered yes reaches the engine and its clinical route is shown.
@MainActor
final class ReportEligibilityTests: XCTestCase {
    private let end = Date(timeIntervalSince1970: 1_795_850_000)
    private var recording: FinishedRecording {
        FinishedRecording(ref: AppRecordedRunRef(id: "rec-1", sessionId: "w0-run-d6", start: end.addingTimeInterval(-2400), end: end, reportedEventId: nil),
                          sessionDate: "2026-11-22", movingMinutes: 39.6, local: LocalMeasurement(distanceMetres: nil, splitsSeconds: [], route: []))
    }
    private var strengthSession: PlannedSession {
        get throws { try XCTUnwrap(try Repo.store.decode(PlanView.self, "02-plan-w0", at: "view").week?.sessions.first { $0.id == "w0-str-d2" }) }
    }
    private func run(_ w: CoachingWriting, today: String? = "2026-11-22", marked: @escaping (String) -> Void = { _ in }) -> RunReportViewModel {
        RunReportViewModel(recording: recording, writer: w, planToday: { today }, markReported: marked, now: { [end] in end }, holdGuidance: { nil })
    }
    private func strength(_ w: CoachingWriting) throws -> StrengthLogViewModel {
        let vm = StrengthLogViewModel(session: try strengthSession, writer: w, planToday: { "2026-11-22" }, now: { [end] in end }, holdGuidance: { nil })
        vm.minutes = 40; vm.confirmAsPrescribed()
        return vm
    }
    private func submits(_ j: RequestJournal) -> Int { j.entries.filter { $0.call == "submit" }.count }
    private func answerAllButConfirmation(_ e: inout EligibilityScreen) {
        e.pain = false; e.persistentPain = false; e.injury = false; e.illness = false; e.functionalLimitation = false; e.clinicalConcern = false
    }

    func testTheScreenStartsUnansweredAndGatesTheRunReport() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = run(w)
        XCTAssertEqual(vm.eligibility, .unanswered, "nothing pre-answered")
        XCTAssertFalse(vm.canSend, "no screen answered: nil is not \"não\"")
        await vm.send()
        XCTAssertEqual(submits(w.journal), 0, "an unanswered screen sends nothing")
        vm.eligibility.pain = false; vm.eligibility.persistentPain = false; vm.eligibility.injury = false
        vm.eligibility.illness = false; vm.eligibility.functionalLimitation = false
        XCTAssertFalse(vm.canSend, "one flag still unanswered")
        vm.eligibility.clinicalConcern = false
        XCTAssertFalse(vm.canSend, "six \"não\" but not confirmed")
        vm.eligibility.status = .nonclinicalConfirmed
        XCTAssertTrue(vm.canSend)
    }

    func testAllNoCarriesTheScreenDatedTheDayItIsAnswered() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        var marked: [String] = []
        // Reported the day after the session: the screen is dated the day it is answered, the report keeps the session's day.
        let vm = run(w, today: "2026-11-23") { marked.append($0) }
        vm.eligibility = .testNoneApplies
        await vm.send()
        XCTAssertEqual(vm.result, .saved)
        XCTAssertFalse(vm.clinical)
        XCTAssertEqual(marked.count, 1)
        let sent = try XCTUnwrap(try Safety.submits(w.journal).first)
        XCTAssertEqual(sent["kind"] as? String, "WEEKLY_REVIEW")
        let e = try XCTUnwrap(sent["eligibility"] as? [String: Any])
        XCTAssertEqual(e["assessedAt"] as? String, "2026-11-23", "the plan's today, not the session's day")
        XCTAssertEqual((sent["observations"] as? [[String: Any]])?.first?["occurrenceDate"] as? String, "2026-11-22")
        XCTAssertEqual(e["status"] as? String, "NONCLINICAL_CONFIRMED")
        for k in ["pain", "persistentPain", "injury", "illness", "functionalLimitation", "clinicalConcern"] { XCTAssertEqual(e[k] as? Bool, false, k) }
    }

    /// As #59: the screen is dated the plan's day only (the engine reads it against the plan's local day; a device day ahead of it is a
    /// future screen, ASK, replay 8). Without the plan's day nothing is sent and the draft waits.
    func testWithoutThePlansTodayNothingIsSent() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = run(w, today: nil)
        vm.eligibility = .testNoneApplies
        XCTAssertNil(vm.request())
        XCTAssertFalse(vm.canSend)
        let log = StrengthLogViewModel(session: try strengthSession, writer: w, planToday: { nil }, now: { [end] in end }, holdGuidance: { nil })
        log.minutes = 40; log.confirmAsPrescribed(); log.eligibility = .testNoneApplies
        XCTAssertNil(log.request())
        XCTAssertFalse(log.canSend)
        await vm.send(); await log.send()
        XCTAssertEqual(submits(w.journal), 0)
    }

    func testEachReportAsksAgainNeverReusingAnEarlierScreen() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let first = run(w)
        first.eligibility = .testNoneApplies
        await first.send()
        XCTAssertEqual(first.result, .saved)
        // A later report, even the same day, carries nothing from the first: it cannot be sent until answered again.
        let second = run(w), log = try strength(w)
        XCTAssertEqual(second.eligibility, .unanswered, "a stale \"não\" is not a current assessment")
        XCTAssertEqual(log.eligibility, .unanswered)
        XCTAssertFalse(second.canSend); XCTAssertFalse(log.canSend)
        await second.send(); await log.send()
        XCTAssertEqual(submits(w.journal), 1, "only the first, answered report was sent")
    }

    func testAYesReachesTheEngineAndShowsItsClinicalRoute() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        var marked: [String] = []
        let vm = run(w) { marked.append($0) }
        answerAllButConfirmation(&vm.eligibility)
        vm.eligibility.injury = true
        XCTAssertTrue(vm.canSend, "a yes is an answer: the engine routes it, the app does not judge it")
        await vm.send()
        XCTAssertEqual(vm.result, .notKept)
        XCTAssertTrue(vm.clinical)
        XCTAssertFalse(vm.canClose, "'Concluir' would drop the draft; leaving stays explicit")
        XCTAssertTrue(marked.isEmpty)
        let e = try XCTUnwrap(try Safety.submits(w.journal).first?["eligibility"] as? [String: Any])
        XCTAssertEqual(e["injury"] as? Bool, true)
        XCTAssertNil(e["status"], "never confirmed nonclinical alongside a yes")
    }

    func testOutcomeMappingCarriesTheClinicalRoute() throws {
        let clinical = try Repo.store.decode(BoundaryAnswer.self, "actions-E2-break-clinical")
        let r = RunReportViewModel.result(for: WriteOutcome(answer: clinical, kept: [], notKept: []), screenRequiredBefore: false)
        XCTAssertEqual(r.result, .notKept)
        XCTAssertEqual(r.clinical, .professionalAssessment)
        let ok = try Repo.store.decode(BoundaryAnswer.self, "07-athlete-run-form")
        let id = try XCTUnwrap(ok.recorded?.first)
        XCTAssertNil(RunReportViewModel.result(for: WriteOutcome(answer: ok, kept: [id], notKept: []), screenRequiredBefore: false).clinical)
        XCTAssertNotNil(RunReportViewModel.result(for: WriteOutcome(answer: ok, kept: [id], notKept: []), screenRequiredBefore: false, clinicalBefore: .professionalAssessment).clinical,
                      "sticky: a route already shown is not hidden by a later answer")
        XCTAssertNotNil(RunReportViewModel.result(for: WriteOutcome(answer: FixtureCoachingWriter.unavailable, kept: [], notKept: []), screenRequiredBefore: false,
                                                  clinicalBefore: .professionalAssessment).clinical)
        XCTAssertFalse(FixtureCoachingWriter.unavailable.routesToHuman, "an error is no route")
    }

    /// Replay 7b: a symptom stop with a "sim" comes back clinical AND asks the warning-sign screen; the report shows both, keeps the draft.
    func testASymptomStopWithAYesShowsBothSafetyStates() async throws {
        let both = try Safety.answer(#"{"ok":true,"status":"CLINICAL_HUMAN_REQUIRED","action":"CLINICAL_HUMAN_REQUIRED","recorded":[],"notRecorded":[],"warningSignScreen":{"status":"REQUIRED"}}"#)
        let vm = run(ScriptedSubmitWriter(both))
        vm.stopped = true; vm.stopReason = .symptom
        answerAllButConfirmation(&vm.eligibility); vm.eligibility.pain = true
        await vm.send()
        XCTAssertEqual(vm.result, .notKept)
        XCTAssertTrue(vm.clinical)
        XCTAssertTrue(vm.screenRequired, "the warning-sign screen is never hidden by the clinical route")
        XCTAssertFalse(vm.canClose)
    }

    func testTheStrengthLogWaitsForTheScreenAndCarriesIt() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = try strength(w)
        XCTAssertFalse(vm.canSend, "sets and minutes stated, screen unanswered")
        await vm.send()
        XCTAssertEqual(submits(w.journal), 0)
        answerAllButConfirmation(&vm.eligibility)
        XCTAssertFalse(vm.canSend, "not confirmed")
        vm.eligibility.status = .nonclinicalConfirmed
        async let a: Void = vm.send()
        async let b: Void = vm.send()
        _ = await (a, b)
        XCTAssertEqual(submits(w.journal), 1, "one write")
        XCTAssertEqual(vm.phase, .saved)
        XCTAssertFalse(vm.clinical)
        let e = try XCTUnwrap(try Safety.submits(w.journal).first?["eligibility"] as? [String: Any])
        XCTAssertEqual(e["assessedAt"] as? String, "2026-11-22")
        XCTAssertEqual(e["status"] as? String, "NONCLINICAL_CONFIRMED")
    }

    func testAYesOnTheStrengthLogShowsTheClinicalRoute() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = try strength(w)
        answerAllButConfirmation(&vm.eligibility)
        vm.eligibility.pain = true
        await vm.send()
        XCTAssertEqual(vm.phase, .notKept)
        XCTAssertTrue(vm.clinical)
        XCTAssertEqual(try Safety.submits(w.journal).first.flatMap { $0["eligibility"] as? [String: Any] }?["pain"] as? Bool, true)
    }

    /// Fixture mode answers as the engine does (#68: the fixtures once hid the missing screen): no answered, dated screen → the captured ASK
    /// for eligibility.currentAssessment, nothing kept.
    func testFixtureWriterAsksForTheScreenAsTheEngineDoes() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let obs = RunReportViewModel.makeObservation(planned: ("w0-run-d6", "2026-11-22"), today: "2026-11-22", end: end, completed: true, minutes: 40, rpe: 4,
                                                     stop: nil, effort: .onTarget)
        var incomplete = EligibilityScreen.testNoneApplies; incomplete.illness = nil
        var undated = EligibilityScreen.testNoneApplies; undated.assessedAt = ""
        for screen in [nil, incomplete.dated("2026-11-22") ?? incomplete, undated] as [EligibilityScreen?] {
            let out = await w.submit(ReviewRequest(.sessionReports([obs]), eligibility: screen))
            XCTAssertEqual(out.answer.status?.raw, "ASK")
            XCTAssertTrue(out.kept.isEmpty && (out.answer.recorded ?? []).isEmpty, "nothing recorded without a current screen")
        }
        let kept = await w.submit(ReviewRequest(.sessionReports([obs]), eligibility: EligibilityScreen.testNoneApplies.dated("2026-11-22")))
        XCTAssertFalse(kept.kept.isEmpty)
    }
}
