import CoachingPresentation
import Foundation
import XCTest
@testable import RepMileUI

/// #32 increment 5: Perfil e ajustes' privacy writes and the erase confirmation live in `ProfileViewModel` (behaviour of increment 06,
/// G07 account erasure).
@MainActor
final class ProfileViewModelTests: XCTestCase {
    /// What the composition root's closures were asked to do, in order.
    private final class Effects { var log: [String] = [] }

    private func viewModel(_ w: PrivacyWriter, _ e: Effects) -> ProfileViewModel {
        ProfileViewModel(writer: w, reload: { e.log.append("reload") }, eraseRecordings: { e.log.append("eraseRecordings") },
                         accountErased: { e.log.append("accountErased") })
    }

    private func json(_ d: Data) -> String { String(decoding: d, as: UTF8.self) }

    func testOutcomeIsDoneOnlyWhenTheEngineSaysOk() throws {
        XCTAssertEqual(ProfileViewModel.outcome(try Safety.answer(#"{"ok":true}"#)), .done)
        XCTAssertEqual(ProfileViewModel.outcome(try Safety.answer(#"{"ok":false,"error":{"code":"CONSENT_REQUIRED"}}"#)), .failed("CONSENT_REQUIRED"))
        XCTAssertEqual(ProfileViewModel.outcome(try Safety.answer(#"{"ok":false}"#)), .failed("UNKNOWN"))
    }

    func testConsentRecordedForItsPurposeOnlyWhenOk() async {
        let w = PrivacyWriter(), e = Effects()
        let vm = viewModel(w, e)
        await vm.setConsent(.coaching, granted: false)
        XCTAssertEqual(vm.consentDone, [.coaching])
        XCTAssertEqual(w.calls("setConsent").map(json), [#"{"COACHING":false}"#])
        XCTAssertEqual(e.log, [], "a consent write reads nothing again and erases nothing")
        let refused = viewModel(PrivacyWriter(consentAnswer: FixtureCoachingWriter.unavailable), e)
        await refused.setConsent(.learning, granted: true)
        XCTAssertEqual(refused.consentDone, [], "a refused consent write shows nothing recorded")
        XCTAssertEqual(refused.activity, .idle)
    }

    func testOneWriteAtATime() async {
        let w = PrivacyWriter(delay: .milliseconds(80)), e = Effects()
        let vm = viewModel(w, e)
        let first = Task { await vm.setConsent(.healthSignals, granted: true) }
        for _ in 0..<100 where !vm.isWriting { await Task.yield() }
        XCTAssertEqual(vm.activity, .writing(.consent(.healthSignals)))
        await vm.setConsent(.healthSignals, granted: true)
        await vm.setConsent(.coaching, granted: false)
        await vm.erase(.account)
        await first.value
        XCTAssertEqual(w.calls("setConsent").count, 1, "a second tap while writing sends nothing")
        XCTAssertEqual(w.calls("eraseAccount").count, 0)
        XCTAssertEqual(vm.consentDone, [.healthSignals])
        XCTAssertFalse(vm.isWriting)
    }

    /// G07: the recordings and then the in-memory record, only after the engine erased the account; the root then routes to `.accountErased`.
    func testAccountErasureReachesTheRecordingsAndTheRecordOnlyWhenOk() async {
        let w = PrivacyWriter(), e = Effects()
        let vm = viewModel(w, e)
        vm.confirm = .account
        await vm.erase(vm.confirm)
        XCTAssertEqual(w.calls("eraseAccount").count, 1)
        XCTAssertEqual(e.log, ["eraseRecordings", "accountErased"])

        let refused = PrivacyWriter(accountAnswer: FixtureCoachingWriter.unavailable), r = Effects()
        await viewModel(refused, r).erase(.account)
        XCTAssertEqual(refused.calls("eraseAccount").count, 1)
        XCTAssertEqual(r.log, [], "a refused erasure keeps the recordings and the record on screen")
    }

    func testAccountErasureSentOnceWhileInFlight() async {
        let w = PrivacyWriter(delay: .milliseconds(50)), e = Effects()
        let vm = viewModel(w, e)
        async let first: Void = vm.erase(.account)
        async let second: Void = vm.erase(.account)
        _ = await (first, second)
        XCTAssertEqual(w.calls("eraseAccount").count, 1)
        XCTAssertEqual(e.log, ["eraseRecordings", "accountErased"])
    }

    func testHealthErasureSendsNoEventIdsThenReadsAgain() async {
        let w = PrivacyWriter(), e = Effects()
        let vm = viewModel(w, e)
        await vm.erase(.health)
        XCTAssertEqual(w.calls("eraseHealthFacts").map(json), ["[]"])
        XCTAssertEqual(w.calls("eraseAccount").count, 0)
        XCTAssertEqual(e.log, ["reload"], "erasing health facts never erases the account or the recordings")
    }

    func testNoConfirmationErasesNothing() async {
        let w = PrivacyWriter(), e = Effects()
        await viewModel(w, e).erase(nil)
        XCTAssertTrue(w.base.journal.entries.isEmpty)
        XCTAssertEqual(e.log, [])
    }
}
