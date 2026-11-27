import CoachingPresentation
import Foundation
import IntegrationContracts
@testable import RunRecorder
import XCTest
@testable import RepMileUI

/// #32 increment 2: the run report's state and its write live in `RunReportViewModel` (behaviour pinned by increments 09, 10, 10b).
@MainActor
final class RunReportViewModelTests: XCTestCase {
    private func recording(planned: Bool = true, reported: String? = nil) -> FinishedRecording {
        let end = Date(timeIntervalSince1970: 1_795_850_000)
        return FinishedRecording(ref: AppRecordedRunRef(id: "rec-1", sessionId: planned ? "w0-run-d6" : nil, start: end.addingTimeInterval(-2400), end: end,
                                                        reportedEventId: reported),
                                 sessionDate: planned ? "2026-11-22" : nil, movingMinutes: 39.6,
                                 local: LocalMeasurement(distanceMetres: nil, splitsSeconds: [], route: []))
    }

    /// With the eligibility screen answered "none applies" (#68), so these tests pin the report itself; the screen is pinned in
    /// `ReportEligibilityTests`.
    private func viewModel(_ r: FinishedRecording, _ w: FixtureCoachingWriter, marked: @escaping (String) -> Void = { _ in }) -> RunReportViewModel {
        let vm = RunReportViewModel(recording: r, writer: w, planToday: { "2026-11-22" }, markReported: marked, holdGuidance: { nil })
        vm.eligibility = .testNoneApplies
        return vm
    }

    private func submits(_ w: FixtureCoachingWriter) -> Int { w.journal.entries.filter { $0.call == "submit" }.count }

    func testMinutesStartFromTheRecordingAndNothingElseIsPreset() {
        let vm = viewModel(recording(), FixtureCoachingWriter(store: Repo.store))
        XCTAssertEqual(vm.minutes, 40)
        XCTAssertNil(vm.rpe)
        XCTAssertNil(vm.stopReason, "no preset stop reason (QRE R1 P0-2)")
        XCTAssertTrue(vm.canSend)
        vm.stopped = true
        XCTAssertFalse(vm.canSend, "a stop needs a reason")
    }

    func testUnplannedRunNeedsTheSymptomAnswer() {
        let vm = viewModel(recording(planned: false), FixtureCoachingWriter(store: Repo.store))
        XCTAssertFalse(vm.canSend)
        vm.unusual = false
        XCTAssertTrue(vm.canSend)
    }

    func testPlannedReportSavedOnceAndMarkedReported() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        var marked: [String] = []
        let vm = viewModel(recording(), w) { marked.append($0) }
        await vm.send()
        XCTAssertEqual(vm.result, .saved)
        XCTAssertEqual(marked.count, 1)
        XCTAssertTrue(vm.canClose)
        await vm.send()
        XCTAssertEqual(submits(w), 1, "a saved report is not sent again")
    }

    func testSymptomStopNotKeptShowsTheScreenAndStaysResendable() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        var marked: [String] = []
        let vm = viewModel(recording(), w) { marked.append($0) }
        vm.stopped = true; vm.stopReason = .symptom
        await vm.send()
        XCTAssertEqual(vm.result, .notKept)
        XCTAssertTrue(vm.screenRequired)
        XCTAssertFalse(vm.canClose, "'Concluir' would lose the report")
        XCTAssertTrue(vm.canSend)
        XCTAssertTrue(marked.isEmpty)
        // Resent with another reason: the instruction already given still stands (sticky); the kept/not-kept mapping is pinned in
        // `testOutcomeMappingIsPure`.
        vm.stopReason = .fatigue
        await vm.send()
        XCTAssertTrue(vm.screenRequired)
    }

    func testARestoredReportedRecordingIsNotSentAgain() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = viewModel(recording(reported: "ob_x"), w)
        XCTAssertEqual(vm.result, .saved)
        XCTAssertFalse(vm.canSend)
        await vm.send()
        XCTAssertEqual(submits(w), 0)
    }

    func testOutcomeMappingIsPure() throws {
        let ok = try Repo.store.decode(BoundaryAnswer.self, "07-athlete-run-form")
        let id = try XCTUnwrap(ok.recorded?.first)
        let kept = WriteOutcome(answer: ok, kept: [id], notKept: [])
        XCTAssertEqual(RunReportViewModel.result(for: kept, screenRequiredBefore: false).result, .saved)
        XCTAssertEqual(RunReportViewModel.result(for: kept, screenRequiredBefore: true).result, .screenRequired)
        let notKept = WriteOutcome(answer: ok, kept: [], notKept: [id])
        XCTAssertEqual(RunReportViewModel.result(for: notKept, screenRequiredBefore: true).result, .notKept)
        XCTAssertTrue(RunReportViewModel.result(for: notKept, screenRequiredBefore: true).screenRequired)
        let failed = WriteOutcome(answer: FixtureCoachingWriter.unavailable, kept: [], notKept: [])
        let f = RunReportViewModel.result(for: failed, screenRequiredBefore: true)
        XCTAssertEqual(f.result, .failed("FIXTURE_UNAVAILABLE"))
        XCTAssertTrue(f.screenRequired, "a failed resend never hides an instruction already given")
    }
}
