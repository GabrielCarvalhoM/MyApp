import CoachingPresentation
import Foundation
import IntegrationContracts
@testable import RunRecorder
import XCTest
@testable import RepMileUI

/// #73 review (QRE P2-1/P2-2/P3-4, SSCTR C1/C3): a clinical answer without a view (`viewError`) carries no level of its own, so every flow
/// keeps the level of the hold the app already holds (the engine's own, `PlanView.clinicalGuidance`) as its floor; an answer with a view is
/// the engine's current word. An unknown level code is reported and still shown at the professional-assessment level.
@MainActor
final class GuidanceFloorTests: XCTestCase {
    /// CLINICAL_HUMAN_REQUIRED, no view.
    private func noView() throws -> BoundaryAnswer { try Safety.answer(#"{"ok":true,"status":"CLINICAL_HUMAN_REQUIRED","recorded":[]}"#) }
    private func capture(_ name: String) throws -> BoundaryAnswer { try Repo.store.decode(BoundaryAnswer.self, name) }
    private let end = Date(timeIntervalSince1970: 1_795_850_000)

    // MARK: The helper

    func testTheFloorCountsOnlyWithoutAView() throws {
        XCTAssertEqual(try noView().clinicalGuidance(floor: .urgentCare), .urgentCare, "no view: the standing hold's level stands")
        XCTAssertEqual(try noView().clinicalGuidance(floor: nil), .professionalAssessment, "no hold known: never nothing")
        XCTAssertEqual(try capture("actions-E2-break-clinical").clinicalGuidance(floor: .urgentCare), .professionalAssessment,
                       "a view is the engine's current word (its hold is at the professional level)")
        XCTAssertEqual(try capture("nf-urgent-breathlessAtRest").clinicalGuidance(floor: .professionalAssessment), .urgentCare)
        XCTAssertNil(try capture("actions-D1-notFeeling100-no-sign").clinicalGuidance(floor: .urgentCare), "no route, no level")
    }

    /// SSCTR C3: an unknown non-null level is a contract violation, reported by code, and shown at the professional-assessment level.
    func testAnUnknownLevelIsReportedAndShownAsProfessionalAssessment() {
        XCTAssertEqual(ClinicalGuidance(levels: ["C3_PROBE_LEVEL", nil]), .professionalAssessment)
        XCTAssertTrue(ContractViolations.reported.contains("guidance.level:C3_PROBE_LEVEL"))
        _ = ClinicalGuidance(levels: ["PROFESSIONAL_ASSESSMENT", "URGENT_CARE_ADVISED", nil])
        XCTAssertFalse(ContractViolations.reported.contains { $0.hasSuffix(":PROFESSIONAL_ASSESSMENT") || $0.hasSuffix(":URGENT_CARE_ADVISED") },
                       "known codes and a missing level are no violation")
    }

    // MARK: Readiness (P2-1, SSCTR C1)

    func testReadinessWithoutAViewKeepsTheUrgentHold() async throws {
        XCTAssertEqual(ReadinessViewModel.reply(for: try noView(), holdGuidance: .urgentCare), .stillBlocked(.urgentCare))
        XCTAssertEqual(ReadinessViewModel.reply(for: try noView(), holdGuidance: nil), .stillBlocked(.professionalAssessment))
        let vm = ReadinessViewModel(reader: Safety.reader(), writer: ScriptedSubmitWriter(try noView()), planToday: { "2026-11-22" },
                                    holdGuidance: { .urgentCare })
        await vm.load()
        vm.recovered = true; vm.eligibility = .testNoneApplies
        vm.answers = Dictionary(uniqueKeysWithValues: (vm.questionSet?.warningSigns ?? []).map { ($0, false) })
        await vm.send()
        XCTAssertEqual(vm.phase, .stillBlocked(.urgentCare))
    }

    // MARK: Every other flow (P2-2): the helper, then the wiring

    func testNotFeelingWithoutAViewKeepsTheUrgentHold() async throws {
        XCTAssertEqual(NotFeeling100ViewModel.outcome(try noView(), floor: .urgentCare), .blocked(.urgentCare))
        let vm = NotFeeling100ViewModel(reader: Safety.reader(), writer: ScriptedSubmitWriter(try noView()), planToday: { "2026-11-22" },
                                        holdGuidance: { .urgentCare })
        await vm.choose(.mildIllness)
        vm.answers = ["feverOrChills": true]; vm.eligibility = .testNoneApplies
        await vm.send()
        XCTAssertEqual(vm.phase, .outcome(.blocked(.urgentCare)))
    }

    func testUnavailableDayWithoutAViewKeepsTheUrgentHold() async throws {
        XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: try noView(), floor: .urgentCare), .clinical(.urgentCare))
        let vm = UnavailableDayViewModel(session: try runSession(), writer: ScriptedSubmitWriter(try noView()), planToday: { "2026-11-22" },
                                         reload: {}, presentation: { nil }, holdGuidance: { .urgentCare })
        vm.eligibility = .testNoneApplies
        await vm.send()
        XCTAssertEqual(vm.phase, .clinical(.urgentCare))
    }

    func testRunReportWithoutAViewKeepsTheUrgentHold() async throws {
        XCTAssertEqual(RunReportViewModel.result(for: WriteOutcome(answer: try noView(), kept: [], notKept: []), screenRequiredBefore: false,
                                                 floor: .urgentCare).clinical, .urgentCare)
        let vm = RunReportViewModel(recording: recording, writer: ScriptedSubmitWriter(try noView()), planToday: { "2026-11-22" }, markReported: { _ in },
                                    now: { [end] in end }, holdGuidance: { .urgentCare })
        vm.eligibility = .testNoneApplies
        await vm.send()
        XCTAssertEqual(vm.clinicalGuidance, .urgentCare)
    }

    func testStrengthLogWithoutAViewKeepsTheUrgentHold() async throws {
        let vm = try strength(ScriptedSubmitWriter(try noView()), hold: .urgentCare)
        await vm.send()
        XCTAssertEqual(vm.clinicalGuidance, .urgentCare)
    }

    func testHistoryCorrectionWithoutAViewKeepsTheUrgentHold() async throws {
        let vm = HistoryCorrectionViewModel(entry: try entry(), sessionDate: try entry().date, writer: ScriptedSubmitWriter(try noView()),
                                            planToday: { HistoryCorrectionViewModel.testToday }, reload: {}, holdGuidance: { .urgentCare })
        vm.startContesting(); vm.km = "7"; vm.answerNoneApplies()
        await vm.send()
        XCTAssertEqual(vm.clinicalGuidance, .urgentCare)
    }

    // MARK: Urgent levels per flow (P3-4)

    /// The strength log keeps the higher level over resends: urgent, then a professional-assessment answer.
    func testStrengthLogNeverLowersTheLevel() async throws {
        let w = SequencedWriter([try capture("nf-urgent-chestPainPressureOrTightness"), try capture("actions-E2-break-clinical")])
        let vm = try strength(w, hold: nil)
        await vm.send()
        XCTAssertEqual(vm.clinicalGuidance, .urgentCare)
        await vm.send()
        XCTAssertEqual(w.sent, 2, "resent")
        XCTAssertEqual(vm.clinicalGuidance, .urgentCare, "a later professional answer never lowers it")
    }

    func testUnavailableDayUnderAnUrgentHoldIsUrgent() throws {
        XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: try capture("nf-urgent-faintingOrDizziness")), .clinical(.urgentCare))
    }

    /// The urgent level reaches the history correction through the view's hold (its own decision carries none).
    func testHistoryCorrectionUnderAnUrgentHoldIsUrgent() async throws {
        let hold = try Repo.store.object("plan-blocked-urgent")["view"]
        let viewJSON = String(decoding: try JSONSerialization.data(withJSONObject: try XCTUnwrap(hold)), as: UTF8.self)
        let answer = try Safety.answer(#"{"ok":true,"status":"KEEP","decisionId":"dc_other","recorded":[],"view":"# + viewJSON + "}")
        XCTAssertEqual(answer.view?.state, .blocked)
        let vm = HistoryCorrectionViewModel(testing: try entry(), writer: ScriptedSubmitWriter(answer), reload: {})
        vm.startContesting(); vm.km = "7"; vm.answerNoneApplies()
        await vm.send()
        XCTAssertEqual(vm.clinicalGuidance, .urgentCare)
    }

    // MARK: Helpers

    private var recording: FinishedRecording {
        FinishedRecording(ref: AppRecordedRunRef(id: "rec-73", sessionId: "w0-run-d6", start: end.addingTimeInterval(-2400), end: end, reportedEventId: nil),
                          sessionDate: "2026-11-22", movingMinutes: 39.6, local: LocalMeasurement(distanceMetres: nil, splitsSeconds: [], route: []))
    }
    private func runSession() throws -> PlannedSession {
        try XCTUnwrap(try Repo.store.decode(PlanView.self, "13-plan-w1", at: "view").week?.sessions.first { $0.executable && $0.sport.raw == "RUN" })
    }
    private func strength(_ w: CoachingWriting, hold: ClinicalGuidance?) throws -> StrengthLogViewModel {
        let s = try XCTUnwrap(try Repo.store.decode(PlanView.self, "02-plan-w0", at: "view").week?.sessions.first { $0.id == "w0-str-d2" })
        let vm = StrengthLogViewModel(session: s, writer: w, planToday: { "2026-11-22" }, now: { [end] in end }, holdGuidance: { hold })
        vm.minutes = 40; vm.confirmAsPrescribed(); vm.eligibility = .testNoneApplies
        return vm
    }
    private func entry() throws -> LoggedEntry {
        try XCTUnwrap(try Repo.store.decode(LoggedEntries.self, "P-logged-two-voices").entries.first { $0.sessionId == "w0-run-d1" })
    }
}

/// A writer whose `submit` answers the given answers in order (the last one repeats).
final class SequencedWriter: CoachingWriting {
    private let answers: [BoundaryAnswer]
    /// Every submitted request, encoded (sorted keys).
    let journal = RequestJournal()
    private let rest = ScriptedSubmitWriter(FixtureCoachingWriter.unavailable)
    private let lock = NSLock()
    /// Only read and written under `lock`.
    nonisolated(unsafe) private var count = 0
    var sent: Int { lock.withLock { count } }
    init(_ answers: [BoundaryAnswer]) { self.answers = answers }

    func submit(_ review: ReviewRequest) async -> WriteOutcome {
        journal.add("submit", review)
        let n = lock.withLock { () -> Int in count += 1; return count - 1 }
        return WriteOutcome(answer: answers[min(n, answers.count - 1)], kept: [], notKept: [])
    }
    func onboard(_ answers: OnboardingAnswers, consents: Consents) async -> WriteOutcome { await rest.onboard(answers, consents: consents) }
    func restart(_ answers: OnboardingAnswers) async -> WriteOutcome { await rest.restart(answers) }
    func accept(decisionId: String) async -> WriteOutcome { await rest.accept(decisionId: decisionId) }
    func decline(decisionId: String) async -> WriteOutcome { await rest.decline(decisionId: decisionId) }
    func setHeartRateProfile(_ profile: HeartRateProfileRequest) async -> Result<HeartRateProfileAnswer, BoundaryError> { await rest.setHeartRateProfile(profile) }
    func eraseHeartRateProfile() async -> Result<HeartRateProfileAnswer, BoundaryError> { await rest.eraseHeartRateProfile() }
    func setConsent(_ purpose: ConsentPurpose, granted: Bool) async -> WriteOutcome { await rest.setConsent(purpose, granted: granted) }
    func eraseHealthFacts(eventIds: [String]) async -> WriteOutcome { await rest.eraseHealthFacts(eventIds: eventIds) }
    func eraseAccount() async -> WriteOutcome { await rest.eraseAccount() }
    func acknowledgeRecordLoss() async -> WriteOutcome { await rest.acknowledgeRecordLoss() }
}
