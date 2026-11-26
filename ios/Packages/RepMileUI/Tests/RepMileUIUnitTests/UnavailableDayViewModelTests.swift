import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #32 increment 7: "não posso neste dia" state, its two writes and the re-read after the write live in `UnavailableDayViewModel`.
@MainActor
final class UnavailableDayViewModelTests: XCTestCase {
    /// The fixture writer with `accept` held for a while (a confirmation still in flight).
    final class SlowAcceptWriter: CoachingWriting {
        let base = FixtureCoachingWriter(store: Repo.store)
        func submit(_ review: ReviewRequest) async -> WriteOutcome { await base.submit(review) }
        func accept(decisionId: String) async -> WriteOutcome { try? await Task.sleep(for: .milliseconds(150)); return await base.accept(decisionId: decisionId) }
        func onboard(_ answers: OnboardingAnswers, consents: Consents) async -> WriteOutcome { await base.onboard(answers, consents: consents) }
        func restart(_ answers: OnboardingAnswers) async -> WriteOutcome { await base.restart(answers) }
        func decline(decisionId: String) async -> WriteOutcome { await base.decline(decisionId: decisionId) }
        func setHeartRateProfile(_ profile: HeartRateProfileRequest) async -> Result<HeartRateProfileAnswer, BoundaryError> { await base.setHeartRateProfile(profile) }
        func eraseHeartRateProfile() async -> Result<HeartRateProfileAnswer, BoundaryError> { await base.eraseHeartRateProfile() }
        func setConsent(_ purpose: ConsentPurpose, granted: Bool) async -> WriteOutcome { await base.setConsent(purpose, granted: granted) }
        func eraseHealthFacts(eventIds: [String]) async -> WriteOutcome { await base.eraseHealthFacts(eventIds: eventIds) }
        func eraseAccount() async -> WriteOutcome { await base.eraseAccount() }
        func acknowledgeRecordLoss() async -> WriteOutcome { await base.acknowledgeRecordLoss() }
    }

    private var session: PlannedSession {
        get throws { try XCTUnwrap(try Repo.store.decode(PlanView.self, "13-plan-w1", at: "view").week?.sessions.first { $0.executable && $0.sport.raw == "RUN" }) }
    }
    private func snapshot(_ name: String) throws -> PresentationSnapshot { try Repo.store.decode(PresentationSnapshot.self, name) }
    private func encoded(_ r: ReviewRequest) throws -> Data { let e = JSONEncoder(); e.outputFormatting = .sortedKeys; return try e.encode(r) }

    /// The request is the session's day, unavailable, exactly as the sheet built it before (no destination, no eligibility).
    func testRequestIsTheSessionDayUnavailable() async throws {
        let s = try session
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = UnavailableDayViewModel(session: s, writer: w, reload: {}, presentation: { nil })
        await vm.send()
        let submits = w.journal.entries.filter { $0.call == "submit" }
        XCTAssertEqual(submits.count, 1)
        XCTAssertEqual(submits.first?.json, try encoded(ReviewRequest(.unavailableDays([s.date]), eligibility: nil)))
        let json = try XCTUnwrap(try JSONSerialization.jsonObject(with: XCTUnwrap(submits.first?.json)) as? [String: Any])
        XCTAssertEqual(json["kind"] as? String, "UNAVAILABLE_DAY")
        XCTAssertEqual((json["changes"] as? [String: Any])?["unavailableDates"] as? [String], [s.date])
        XCTAssertNil(json["eligibility"])
    }

    /// QRE R1 P1-10: the proposal is the one read after the write. The reload runs before `.proposed`, and the rows shown are the
    /// presentation the app holds after it, never the one it held before.
    func testTheProposalShownIsTheOneReadAfterTheWrite() async throws {
        let before = try snapshot("12-presentation-after-w0"), after = try snapshot("actions-B1b-presentation-pending")
        XCTAssertNil(before.pending)
        var current: PresentationSnapshot? = before
        var reloads = 0
        var phaseDuringReload: UnavailableDayViewModel.Phase?
        var vm: UnavailableDayViewModel!
        vm = UnavailableDayViewModel(session: try session, writer: FixtureCoachingWriter(store: Repo.store),
                                     reload: { reloads += 1; phaseDuringReload = vm.phase; current = after }, presentation: { current })
        XCTAssertTrue(vm.proposal.isEmpty, "nothing is proposed before the write")
        await vm.send()
        XCTAssertEqual(reloads, 1)
        XCTAssertEqual(phaseDuringReload, .sending, "the proposal is not on screen until the re-read has finished")
        XCTAssertEqual(vm.phase, .proposed(decisionId: "dc_000031"))
        XCTAssertEqual(vm.proposal.map(\.sessionId), UnavailableDayViewModel.proposal(after).map(\.sessionId))
        XCTAssertEqual(vm.proposal.map(\.date), vm.proposal.map(\.date).sorted(), "by date")
        XCTAssertEqual(Set(vm.proposal.map(\.sessionId)), Set(try XCTUnwrap(after.pending).keys))
    }

    func testAFailedWriteIsNotReloadedAndKeepsItsCode() async throws {
        var reloads = 0
        let writer = ScriptedSubmitWriter(try Safety.answer(#"{"ok":false,"error":{"code":"CONFLICT_STALE_VERSION"}}"#))
        let vm = UnavailableDayViewModel(session: try session, writer: writer, reload: { reloads += 1 }, presentation: { nil })
        await vm.send()
        XCTAssertEqual(vm.phase, .failed("CONFLICT_STALE_VERSION"))
        XCTAssertEqual(reloads, 0)
        XCTAssertEqual(UnavailableDayViewModel.failureKey("CONFLICT_STALE_VERSION"), "state.stale.body")
        XCTAssertEqual(UnavailableDayViewModel.failureKey("FIXTURE_UNAVAILABLE"), "state.opError.body")
    }

    func testAnOkAnswerWithoutADecisionFailsClosed() throws {
        XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: try Safety.answer(#"{"ok":true}"#)), .failed("UNKNOWN"))
        XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: try Safety.answer(#"{"ok":true,"decisionId":"dc_1"}"#)), .proposed(decisionId: "dc_1"))
        XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: try Repo.store.decode(BoundaryAnswer.self, "actions-B1-unavailable-day")), .proposed(decisionId: "dc_000031"))
        XCTAssertEqual(UnavailableDayViewModel.phase(afterAccept: try Repo.store.decode(BoundaryAnswer.self, "actions-B2-accept-unavailable")), .accepted)
        XCTAssertEqual(UnavailableDayViewModel.phase(afterAccept: FixtureCoachingWriter.unavailable), .failed("FIXTURE_UNAVAILABLE"))
    }

    func testAcceptConfirmsTheProposedDecision() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = UnavailableDayViewModel(session: try session, writer: w, reload: {}, presentation: { nil })
        await vm.accept()
        XCTAssertTrue(w.journal.entries.isEmpty, "nothing to accept before a proposal")
        await vm.send()
        await vm.accept()
        XCTAssertEqual(vm.phase, .accepted)
        let accepts = w.journal.entries.filter { $0.call == "accept" }
        XCTAssertEqual(accepts.count, 1)
        XCTAssertEqual(try JSONSerialization.jsonObject(with: XCTUnwrap(accepts.first?.json)) as? [String: String], ["decisionId": "dc_000031"])
    }

    /// A second tap while the unavailable day is in flight sends nothing.
    func testNoDoubleSubmit() async throws {
        let writer = ScriptedSubmitWriter(try Repo.store.decode(BoundaryAnswer.self, "actions-B1-unavailable-day"), delay: .milliseconds(150))
        let vm = UnavailableDayViewModel(session: try session, writer: writer, reload: {}, presentation: { nil })
        let first = Task { await vm.send() }
        for _ in 0..<100 where writer.journal.entries.isEmpty { await Task.yield() }
        XCTAssertEqual(vm.phase, .sending)
        XCTAssertFalse(vm.canSend)
        await vm.send()
        await first.value
        XCTAssertEqual(writer.journal.entries.filter { $0.call == "submit" }.count, 1)
        XCTAssertEqual(vm.phase, .proposed(decisionId: "dc_000031"))
    }

    /// A second tap while the confirmation is in flight confirms nothing more.
    func testNoDoubleAccept() async throws {
        let w = SlowAcceptWriter()
        let vm = UnavailableDayViewModel(session: try session, writer: w, reload: {}, presentation: { nil })
        await vm.send()
        let first = Task { await vm.accept() }
        for _ in 0..<100 where vm.phase != .accepting(decisionId: "dc_000031") { await Task.yield() }
        XCTAssertEqual(vm.phase, .accepting(decisionId: "dc_000031"))
        XCTAssertFalse(vm.canAccept)
        await vm.accept()
        await first.value
        XCTAssertEqual(vm.phase, .accepted)
        XCTAssertEqual(w.base.journal.entries.filter { $0.call == "accept" }.count, 1)
    }
}
