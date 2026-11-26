import CoachingPresentation
import Foundation
import XCTest
@testable import RepMileUI

/// #58: after a write the engine answered `ok`, the record is read again from the port (CODE_AND_ARCHITECTURE §2) and the screen shows what
/// was re-read; a failure reads nothing again. #59: a history row with no ATHLETE voice is never offered the correction.
@MainActor
final class RereadAfterWriteTests: XCTestCase {
    private func five(_ model: AppModel) -> HeartRateFiveZones? { model.presentation?.readings?.runCalibration?.heartRateFiveZones }

    // MARK: Heart-rate zones

    /// Saved: the model is read again and the zones screen (which reads `model.presentation`) shows the declared reference and its zones.
    func testASavedMaximumIsReadAgainAndTheZonesShowTheNewReference() async throws {
        let reader = SwitchableReader(presentation: "hr5r-age30-presentation", logged: "P-logged-two-voices")
        let writer = RecordingWriter { if $0 == "setHeartRateProfile" { reader.switchTo(presentation: "hr5r-declared-presentation") } }
        let model = Reread.model(reader, writer)
        await model.load()
        XCTAssertEqual(five(model)?.reference?.kind.raw, "AGE_ESTIMATE")
        var reloads = 0
        let vm = HeartRateZonesViewModel(writer: writer, mode: .maximum, current: five(model), reload: { reloads += 1; await model.load() })
        vm.maximum = "195"
        await vm.save()
        XCTAssertEqual(vm.message, .saved)
        XCTAssertEqual(reloads, 1)
        XCTAssertEqual(five(model)?.reference?.kind.raw, "ATHLETE_DECLARED_MAXIMUM", "never the pre-write reference")
        XCTAssertEqual(five(model)?.reference?.bpm, 195)
        XCTAssertEqual(five(model)?.zones, try Zones.five("declared")?.zones)
    }

    func testAnErasedProfileIsReadAgain() async throws {
        let reader = SwitchableReader(presentation: "hr5r-declared-presentation", logged: "P-logged-two-voices")
        let writer = RecordingWriter { if $0 == "eraseHeartRateProfile" { reader.switchTo(presentation: "hr5r-after-erase-presentation") } }
        let model = Reread.model(reader, writer)
        await model.load()
        XCTAssertTrue(HeartRateZonesViewModel.offersErase(five(model)))
        let vm = HeartRateZonesViewModel(writer: writer, mode: .maximum, current: five(model), reload: { await model.load() })
        await vm.erase()
        XCTAssertEqual(vm.message, .erased)
        XCTAssertEqual(five(model)?.reference?.kind.raw, "AGE_ESTIMATE")
        XCTAssertFalse(HeartRateZonesViewModel.offersErase(five(model)), "the editor no longer offers erasing what is gone")
    }

    /// A refusal, a failure or a success that is not `ok` reads nothing again; the gate is open while a reload runs.
    func testAFailedHeartRateWriteReadsNothingAgain() async throws {
        var reloads = 0
        let refused = HeartRateZonesViewModel(writer: PrivacyWriter(), mode: .limits, current: try Zones.five("age30"), reload: { reloads += 1 })
        refused.limits = ["150", "140", "160", "170"]
        await refused.save()
        XCTAssertEqual(refused.message, .refused(field: "zoneUpperBpm.strictlyIncreasing"))
        let failing = HeartRateZonesViewModel(writer: PrivacyWriter(eraseProfileResult: .failure(BoundaryError(code: "PERSISTENCE_FAILURE"))), mode: .maximum,
                                              current: try Zones.five("declared"), reload: { reloads += 1 })
        await failing.erase()
        XCTAssertEqual(failing.message, .failed)
        let notOk = try JSONDecoder().decode(HeartRateProfileAnswer.self, from: Data(#"{"ok":false}"#.utf8))
        let silent = HeartRateZonesViewModel(writer: PrivacyWriter(eraseProfileResult: .success(notOk)), mode: .maximum,
                                             current: try Zones.five("declared"), reload: { reloads += 1 })
        await silent.erase()
        XCTAssertEqual(silent.message, .failed)
        XCTAssertEqual(reloads, 0)

        var activityDuringReload: HeartRateZonesViewModel.Activity?
        var vm: HeartRateZonesViewModel!
        vm = HeartRateZonesViewModel(writer: PrivacyWriter(), mode: .maximum, current: try Zones.five("age30"), reload: { activityDuringReload = vm.activity })
        vm.maximum = "195"
        await vm.save()
        XCTAssertEqual(activityDuringReload, .idle, "the reload is not a write")
    }

    // MARK: Consent

    func testARecordedConsentIsReadAgain() async {
        let e = PrivacyWriter()
        var log: [String] = []
        var writingDuringReload: Bool?
        var vm: ProfileViewModel!
        vm = ProfileViewModel(writer: e, reload: { writingDuringReload = vm.isWriting; log.append("reload") }, eraseRecordings: {}, accountErased: {})
        await vm.setConsent(.coaching, granted: false)
        XCTAssertEqual(log, ["reload"])
        XCTAssertEqual(writingDuringReload, false)
        XCTAssertEqual(vm.consentDone, [.coaching])
        XCTAssertEqual(vm.consentFailed, [])
    }

    /// Privacy: a revocation the engine did not record is shown as an error (never silence, never "registrado") and reads nothing again; a
    /// retry clears the error and, recorded, reads again.
    func testAFailedRevocationIsVisibleAndCanBeRetried() async {
        var log: [String] = []
        let vm = ProfileViewModel(writer: RecordingWriter(consentFailures: 1), reload: { log.append("reload") }, eraseRecordings: {}, accountErased: {})
        await vm.setConsent(.healthSignals, granted: false)
        XCTAssertEqual(vm.consentFailed, [.healthSignals])
        XCTAssertEqual(vm.consentDone, [])
        XCTAssertEqual(log, [], "a failed write reads nothing again")
        XCTAssertFalse(vm.isWriting, "the athlete can retry")
        XCTAssertNotEqual(L.t("profile.consent.failed"), "profile.consent.failed")
        await vm.setConsent(.healthSignals, granted: false)
        XCTAssertEqual(vm.consentFailed, [])
        XCTAssertEqual(vm.consentDone, [.healthSignals])
        XCTAssertEqual(log, ["reload"])
    }

    // MARK: History correction

    /// A kept correction: the model is read again, the row now carries the athlete's correction and is not offered again.
    func testAKeptCorrectionIsReadAgainAndNotOfferedAgain() async throws {
        let reader = SwitchableReader(presentation: "12-presentation-after-w0", logged: "P-logged-two-voices")
        let writer = RecordingWriter { if $0 == "submit" { reader.switchTo(logged: "P-logged-unplanned") } }
        let model = Reread.model(reader, writer)
        await model.load()
        let row = { model.logged?.entries.first { $0.sessionId == "w0-run-d1" && !$0.superseded } }
        let before = try XCTUnwrap(row())
        XCTAssertTrue(HistoryCorrectionViewModel.canContest(before))
        let vm = HistoryCorrectionViewModel(entry: before, writer: writer, reload: { await model.load() })
        vm.startContesting(); vm.km = "7"
        let loads = reader.loads
        await vm.send()
        XCTAssertEqual(vm.phase, .saved)
        XCTAssertEqual(reader.loads, loads + 1, "read again once")
        let after = try XCTUnwrap(row())
        XCTAssertNotNil(after.contested, "the row shows the correction")
        XCTAssertFalse(HistoryCorrectionViewModel.canContest(after), "and does not offer it again")
    }

    func testAFailedCorrectionReadsNothingAgainAnOkOneDoes() async throws {
        let e = try XCTUnwrap(try Repo.store.decode(LoggedEntries.self, "P-logged-two-voices").entries.first { $0.sessionId == "w0-run-d1" })
        var reloads = 0
        let failed = HistoryCorrectionViewModel(entry: e, writer: ScriptedSubmitWriter(FixtureCoachingWriter.unavailable), reload: { reloads += 1 })
        failed.startContesting(); failed.km = "7"
        await failed.send()
        XCTAssertEqual(failed.phase, .notKept)
        XCTAssertEqual(reloads, 0)
        // `ok` but not kept: the write still happened at the port, so the record is read again; the screen says "não mantido".
        let unkept = HistoryCorrectionViewModel(entry: e, writer: ScriptedSubmitWriter(try Safety.answer(#"{"ok":true,"recorded":["ob_1"]}"#)), reload: { reloads += 1 })
        unkept.startContesting(); unkept.km = "7"
        await unkept.send()
        XCTAssertEqual(unkept.phase, .notKept)
        XCTAssertEqual(reloads, 1)
    }

    // MARK: #59 — no correction without the athlete's voice

    /// A linked device run (planned, measured, uncontested) that the athlete never reported: not offered, no observation, nothing sent.
    func testADeviceOnlyRowIsNeverOfferedTheCorrection() async throws {
        let device = try Reread.deviceOnly("P-logged-two-voices")
        XCTAssertNotNil(device.sessionId); XCTAssertNotNil(device.measuredKm); XCTAssertNil(device.contested)
        XCTAssertEqual(device.voices.map(\.channel.raw), ["DEVICE"])
        XCTAssertFalse(HistoryCorrectionViewModel.canContest(device))
        XCTAssertNil(HistoryCorrectionViewModel.observation(entry: device, distanceKm: 7, reason: .signalLoss), "the device's numbers are never the athlete's")
        let w = FixtureCoachingWriter(store: Repo.store)
        var reloads = 0
        let vm = HistoryCorrectionViewModel(entry: device, writer: w, reload: { reloads += 1 })
        XCTAssertFalse(vm.canContest)
        vm.startContesting()
        XCTAssertEqual(vm.phase, .idle, "the form never opens")
        vm.km = "7"
        await vm.send()
        XCTAssertTrue(w.journal.entries.isEmpty)
        XCTAssertEqual(reloads, 0)
        XCTAssertFalse(HistoryCorrectionViewModel.canContest(try Reread.deviceOnly("P-logged-conflict")))
    }

    /// Rows with an ATHLETE voice keep their behaviour: offered, and the observation is built from that voice.
    func testRowsWithTheAthletesVoiceAreUnchanged() throws {
        for name in ["P-logged-two-voices", "P-logged-conflict", "P-logged-after-w0"] {
            let e = try XCTUnwrap(try Repo.store.decode(LoggedEntries.self, name).entries.first { $0.sessionId == "w0-run-d1" })
            XCTAssertTrue(HistoryCorrectionViewModel.canContest(e), name)
            let mine = try XCTUnwrap(HistoryCorrectionViewModel.athleteVoice(e))
            guard case .plannedRun(let a)? = HistoryCorrectionViewModel.observation(entry: e, distanceKm: 6, reason: .signalLoss)?.actual else {
                return XCTFail(name)
            }
            XCTAssertEqual(a.completed, mine.completed, name)
            XCTAssertEqual(a.minutes, mine.minutes ?? e.minutes, name)
            XCTAssertEqual(a.rpe, mine.rpe, name)
        }
    }

    // MARK: Empty proposal

    /// A re-read proposal with no rows: "Aceitar" stays off, the fallback is shown, and a tap that gets through confirms nothing.
    func testAnEmptyProposalCannotBeAccepted() async throws {
        let s = try XCTUnwrap(try Repo.store.decode(PlanView.self, "13-plan-w1", at: "view").week?.sessions.first { $0.executable && $0.sport.raw == "RUN" })
        let w = FixtureCoachingWriter(store: Repo.store)
        let empty = try Repo.store.decode(PresentationSnapshot.self, "12-presentation-after-w0")
        XCTAssertNil(empty.pending)
        let vm = UnavailableDayViewModel(session: s, writer: w, reload: {}, presentation: { empty })
        XCTAssertFalse(vm.proposalUnavailable, "nothing proposed yet")
        await vm.send()
        XCTAssertEqual(vm.phase, .proposed(decisionId: "dc_000031"))
        XCTAssertTrue(vm.proposal.isEmpty)
        XCTAssertFalse(vm.canAccept)
        XCTAssertTrue(vm.proposalUnavailable)
        XCTAssertNotEqual(L.t("move.proposal.unavailable"), "move.proposal.unavailable")
        await vm.accept()
        XCTAssertTrue(w.journal.entries.filter { $0.call == "accept" }.isEmpty, "never an invisible change confirmed")
        XCTAssertEqual(vm.phase, .proposed(decisionId: "dc_000031"))

        let pending = try Repo.store.decode(PresentationSnapshot.self, "actions-B1b-presentation-pending")
        let shown = UnavailableDayViewModel(session: s, writer: w, reload: {}, presentation: { pending })
        await shown.send()
        XCTAssertFalse(shown.proposal.isEmpty)
        XCTAssertTrue(shown.canAccept)
        XCTAssertFalse(shown.proposalUnavailable)
    }
}
