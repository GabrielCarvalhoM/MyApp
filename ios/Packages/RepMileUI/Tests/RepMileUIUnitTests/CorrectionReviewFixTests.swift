import CoachingPresentation
import Foundation
import IntegrationContracts
@testable import RunRecorder
import XCTest
@testable import RepMileUI

/// PR #96 review fixes (QRE P1, P2, P3-2, P3-3, P3-7). Engine replay: `audits/v1-ios-swiftui-2026-11-26/results/i70-correction-followups/`.
@MainActor
final class CorrectionReviewFixTests: XCTestCase {
    private func entry(_ name: String) throws -> LoggedEntry {
        try XCTUnwrap(try Repo.store.decode(LoggedEntries.self, name).entries.first { $0.sessionId == "w0-run-d1" })
    }
    private func submits(_ j: RequestJournal) throws -> [[String: Any]] {
        try j.entries.filter { $0.call == "submit" }.map { try XCTUnwrap(try JSONSerialization.jsonObject(with: $0.json) as? [String: Any]) }
    }
    private func keys(_ v: some Encodable) throws -> Set<String> {
        let o = try XCTUnwrap(try JSONSerialization.jsonObject(with: JSONEncoder().encode(v)) as? [String: Any])
        return Set((o["eligibility"] as? [String: Any] ?? [:]).keys)
    }
    /// The engine's refusal past `correctionsPerReport` (replay §1: `{"code":"LIMIT_EXCEEDED","index":0,"limit":"correctionsPerReport"}`).
    private var limit: BoundaryAnswer { get throws { try Safety.answer(#"{"ok":false,"error":{"code":"LIMIT_EXCEEDED","message":"A report of this request is not admitted; nothing was recorded","index":0,"limit":"correctionsPerReport"}}"#) } }
    /// The engine's answer to the screen alone with a "sim" (replay §1): routed, nothing recorded, plan BLOCKED.
    private var routed: BoundaryAnswer { get throws { try Safety.answer(#"{"ok":true,"status":"CLINICAL_HUMAN_REQUIRED","recorded":[]}"#) } }

    // MARK: QRE P1 — a "sim" past the limit

    func testASimPastTheLimitIsSentAloneAndRoutesToAHuman() async throws {
        let w = ScriptedSubmitWriter(try limit, then: [try routed])
        var reloads = 0
        let vm = HistoryCorrectionViewModel(testing: try entry("P-logged-unplanned"), writer: w, reload: { reloads += 1 })
        vm.startContesting(); vm.km = "6"; vm.eligibility.injury = true
        await vm.send()
        let sent = try submits(w.journal)
        XCTAssertEqual(sent.count, 2, "the correction, then the screen alone")
        XCTAssertEqual((sent[0]["observations"] as? [Any])?.count, 1)
        XCTAssertEqual((sent[1]["observations"] as? [Any])?.count, 0, "the screen alone: observations []")
        XCTAssertEqual(sent[1]["kind"] as? String, "WEEKLY_REVIEW")
        let screen = try XCTUnwrap(sent[1]["eligibility"] as? [String: Any])
        XCTAssertEqual(Set(screen.keys), ["assessedAt", "injury"])
        XCTAssertEqual(screen["assessedAt"] as? String, HistoryCorrectionViewModel.testToday)
        XCTAssertTrue(vm.limitReached)
        XCTAssertTrue(vm.clinical, "the engine's route is shown, never \"nothing changed\"")
        XCTAssertFalse(vm.signUndelivered)
        XCTAssertEqual(vm.phase, .notKept)
        XCTAssertEqual(reloads, 1, "the route changed the plan: read again")
    }

    func testASimPastTheLimitThatIsNotRoutedShowsTheClinicalCopy() async throws {
        let w = ScriptedSubmitWriter(try limit, then: [FixtureCoachingWriter.unavailable])
        let vm = HistoryCorrectionViewModel(testing: try entry("P-logged-unplanned"), writer: w, reload: {})
        vm.startContesting(); vm.km = "6"; vm.eligibility.pain = true
        await vm.send()
        XCTAssertEqual(try submits(w.journal).count, 2)
        XCTAssertFalse(vm.clinical)
        XCTAssertTrue(vm.signUndelivered, "the clinical copy and \"Não estou 100%\", never the limit message alone")
    }

    func testWithoutASimTheLimitIsTheLimitAlone() async throws {
        let w = ScriptedSubmitWriter(try limit, then: [try routed])
        let vm = HistoryCorrectionViewModel(testing: try entry("P-logged-unplanned"), writer: w, reload: {})
        vm.startContesting(); vm.km = "6"; vm.answerNoneApplies()
        await vm.send()
        XCTAssertEqual(try submits(w.journal).count, 1, "no screen alone without a \"sim\"")
        XCTAssertTrue(vm.limitReached); XCTAssertFalse(vm.signUndelivered); XCTAssertFalse(vm.clinical)
    }

    /// P3-3: only the refusal of this correction's observation reads as its limit (the engine's `limit` key is not decoded by the shared type).
    func testOnlyTheCorrectionsOwnLimitIsTheLimit() throws {
        XCTAssertTrue(HistoryCorrectionViewModel.correctionLimit(try limit))
        XCTAssertFalse(HistoryCorrectionViewModel.correctionLimit(try Safety.answer(#"{"ok":false,"error":{"code":"LIMIT_EXCEEDED","limit":"requestBytes"}}"#)), "no index: the request's size")
        XCTAssertFalse(HistoryCorrectionViewModel.correctionLimit(try Safety.answer(#"{"ok":false,"error":{"code":"CORRECTION_OF_REPLACED","index":0}}"#)))
        XCTAssertFalse(HistoryCorrectionViewModel.correctionLimit(try routed))
    }

    // MARK: QRE P2 — what is sent is what was stated when tapped

    func testEditsWhileThePlansDayIsReadAreNotSent() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let e = try entry("P-logged-two-voices")
        let vm = HistoryCorrectionViewModel(entry: e, sessionDate: e.date, writer: w,
                                            planToday: { try? await Task.sleep(for: .milliseconds(150)); return "2026-11-18" }, reload: {}, holdGuidance: { nil })
        vm.startContesting(); vm.km = "6"; vm.reason = .autoPause; vm.answerNoneApplies()
        let first = Task { await vm.send() }
        for _ in 0..<100 where vm.phase != .submitting { await Task.yield() }
        XCTAssertEqual(vm.phase, .submitting)
        vm.km = ""; vm.reason = .deviceRestart; vm.eligibility.pain = nil   // the form is disabled on screen; the model never reads these
        await first.value
        let sent = try XCTUnwrap(try submits(w.journal).first)
        let actual = try XCTUnwrap((sent["observations"] as? [[String: Any]])?.first?["actual"] as? [String: Any])
        XCTAssertEqual((actual["declared"] as? [String: Any])?["distanceKm"] as? Double, 6)
        XCTAssertEqual((actual["declared"] as? [String: Any])?["reason"] as? String, "AUTO_PAUSE")
        XCTAssertEqual((sent["eligibility"] as? [String: Any])?["pain"] as? Bool, false)
        XCTAssertFalse(vm.dayUnavailable, "P3-1: an edit never reads as a plan day that could not be read")
    }

    // MARK: QRE P3-2 — the model's plan day at send time

    func testTheModelDatesTheScreenWithThePlansDayAtSendTime() async throws {
        let reader = SwitchableReader(presentation: "12-presentation-after-w0", logged: "P-logged-two-voices")
        let w = FixtureCoachingWriter(store: Repo.store)
        let model = Reread.model(reader, w)
        await model.load()
        let loaded = try XCTUnwrap(model.plan?.today)
        let row = try XCTUnwrap(model.logged?.entries.first { $0.sessionId == "w0-run-d1" && !$0.superseded })
        let vm = HistoryCorrectionViewModel(entry: row, sessionDate: row.date, writer: w, planToday: { await model.planDayNow() },
                                            reload: {}, holdGuidance: { nil })
        vm.startContesting(); vm.km = "6"; vm.answerNoneApplies()
        reader.switchTo(planToday: "2026-11-30")   // the plan's midnight passes while the sheet is open
        XCTAssertEqual(model.plan?.today, loaded, "the last load still holds the earlier day")
        XCTAssertNotEqual(loaded, "2026-11-30")
        await vm.send()
        XCTAssertEqual((try submits(w.journal).first?["eligibility"] as? [String: Any])?["assessedAt"] as? String, "2026-11-30")
    }

    // MARK: QRE P3-7 — nil flags are omitted at the other report sites

    func testALoneSimOmitsTheUnansweredFlagsAtTheReportSites() async throws {
        let end = Date(timeIntervalSince1970: 1_795_850_000)
        var lone = EligibilityScreen.unanswered; lone.functionalLimitation = true
        let w = FixtureCoachingWriter(store: Repo.store)
        let rec = FinishedRecording(ref: AppRecordedRunRef(id: "rec-1", sessionId: "w0-run-d6", start: end.addingTimeInterval(-2400), end: end, reportedEventId: nil),
                                    sessionDate: "2026-11-22", movingMinutes: 39.6, local: LocalMeasurement(distanceMetres: nil, splitsSeconds: [], route: []))
        let run = RunReportViewModel(recording: rec, writer: w, planToday: { "2026-11-22" }, markReported: { _ in }, now: { end }, holdGuidance: { nil })
        run.eligibility = lone
        XCTAssertEqual(try keys(XCTUnwrap(run.request())), ["assessedAt", "functionalLimitation"], "run report")
        let session = try XCTUnwrap(try Repo.store.decode(PlanView.self, "02-plan-w0", at: "view").week?.sessions.first { $0.id == "w0-str-d2" })
        let strength = StrengthLogViewModel(session: session, writer: w, planToday: { "2026-11-22" }, now: { end }, holdGuidance: { nil })
        strength.minutes = 40; strength.confirmAsPrescribed(); strength.eligibility = lone
        XCTAssertEqual(try keys(XCTUnwrap(strength.request())), ["assessedAt", "functionalLimitation"], "strength log")
        let nf = NotFeeling100ViewModel(reader: Safety.reader(), writer: w, planToday: { "2026-11-22" }, holdGuidance: { nil })
        await nf.choose(.mildIllness); nf.eligibility = lone
        XCTAssertEqual(try keys(XCTUnwrap(nf.request())), ["assessedAt", "functionalLimitation"], "não estou 100%")
    }
}
