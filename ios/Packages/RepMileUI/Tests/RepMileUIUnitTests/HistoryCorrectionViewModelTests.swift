import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #32 increment 8: the history distance correction's state and its one write live in `HistoryCorrectionViewModel`. The request is the
/// athlete's own report of the row, built from their voice, with the declared distance.
@MainActor
final class HistoryCorrectionViewModelTests: XCTestCase {
    private func entries(_ name: String) throws -> [LoggedEntry] { try Repo.store.decode(LoggedEntries.self, name).entries }
    private func entry(_ name: String, _ sessionId: String = "w0-run-d1") throws -> LoggedEntry {
        try XCTUnwrap(try entries(name).first { $0.sessionId == sessionId })
    }
    private func object(_ d: Data) throws -> [String: Any] { try XCTUnwrap(try JSONSerialization.jsonObject(with: d) as? [String: Any]) }
    private func encoded(_ v: some Encodable) throws -> Data { let e = JSONEncoder(); e.outputFormatting = .sortedKeys; return try e.encode(v) }

    /// The observation as `HistoryDetail.contest()` built it before #32.8, kept here as the reference the view model must reproduce.
    private func reference(_ entry: LoggedEntry, _ d: Double, _ reason: DeclaredDistanceReason) -> AthleteObservation {
        let mine = entry.voices.first { $0.channel.raw == "ATHLETE" }
        let response = SessionResponse(performance: PerformanceResponse(rawValue: mine?.response?.performance?.raw ?? "") ?? .unknown,
                                       recovery: RecoveryResponse(rawValue: mine?.response?.recovery?.raw ?? "") ?? .unknown,
                                       effort: EffortResponse(rawValue: mine?.response?.effort?.raw ?? "") ?? .unknown,
                                       nextDayFunction: NextDayFunctionResponse(rawValue: mine?.response?.nextDayFunction?.raw ?? "") ?? .unknown)
        return .plannedRun(sessionId: entry.sessionId!, occurrenceDate: entry.date, observedAt: entry.observedAt,
                           actual: PlannedRunActual(completed: mine?.completed ?? entry.completed, minutes: mine?.minutes ?? entry.minutes, rpe: mine?.rpe,
                                                    stop: mine?.stopReason.flatMap { StopReason(rawValue: $0.raw) }.map(RunStop.init(reason:)),
                                                    declared: ContestedDistance(distanceKm: d, reason: reason)),
                           response: response)
    }

    func testOnlyAMeasuredUncontestedPlannedRunCanBeContested() throws {
        XCTAssertTrue(HistoryCorrectionViewModel.canContest(try entry("P-logged-two-voices")))
        XCTAssertFalse(HistoryCorrectionViewModel.canContest(try entry("P-logged-unplanned")), "already contested")
        XCTAssertFalse(HistoryCorrectionViewModel.canContest(try entry("P-logged-after-w0", "w0-run-d5")), "nothing measured")
        XCTAssertFalse(HistoryCorrectionViewModel.canContest(try entry("P-logged-after-w0", "w0-str-d2")), "strength")
        XCTAssertFalse(try entries("P-logged-unplanned").filter { $0.sessionId == nil }.contains(where: HistoryCorrectionViewModel.canContest), "unplanned")
    }

    /// The request is built from the athlete's own voice (completed, minutes, RPE, responses), with the declared distance, identical to the
    /// request the view sent before the refactor.
    func testTheCorrectionIsTheAthletesOwnVoice() async throws {
        let e = try entry("P-logged-two-voices")
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = HistoryCorrectionViewModel(entry: e, writer: w)
        vm.startContesting()
        vm.km = "7,4"; vm.reason = .obstructedSky
        await vm.send()
        let submits = w.journal.entries.filter { $0.call == "submit" }
        XCTAssertEqual(submits.count, 1)
        XCTAssertEqual(submits.first?.json, try encoded(ReviewRequest(.sessionReports([reference(e, 7.4, .obstructedSky)]), eligibility: nil)))
        let o = try XCTUnwrap((try object(XCTUnwrap(submits.first?.json))["observations"] as? [[String: Any]])?.first)
        XCTAssertEqual(o["sessionId"] as? String, "w0-run-d1")
        let actual = try XCTUnwrap(o["actual"] as? [String: Any])
        XCTAssertEqual(actual["completed"] as? Bool, true)
        XCTAssertEqual(actual["minutes"] as? Double, 40)
        XCTAssertEqual(actual["rpe"] as? Double, 4, "the athlete's RPE, not the device's (none)")
        XCTAssertNil(actual["distanceKm"], "the measured distance is never re-sent as the athlete's")
        let declared = try XCTUnwrap(actual["declared"] as? [String: Any])
        XCTAssertEqual(declared["distanceKm"] as? Double, 7.4)
        XCTAssertEqual(declared["reason"] as? String, "OBSTRUCTED_SKY")
        XCTAssertEqual((o["response"] as? [String: String])?["effort"], "ON_TARGET")
    }

    /// A conflicted row: the athlete's stop and their not-completed stay theirs; the device's completed 40 min never replaces them.
    func testAConflictedRowKeepsTheAthletesStop() throws {
        let e = try entry("P-logged-conflict")
        let obs = try XCTUnwrap(HistoryCorrectionViewModel.observation(entry: e, distanceKm: 6, reason: .signalLoss))
        XCTAssertEqual(try encoded(obs), try encoded(reference(e, 6, .signalLoss)))
        let a = try XCTUnwrap(try object(encoded(obs))["actual"] as? [String: Any])
        XCTAssertEqual(a["completed"] as? Bool, false)
        XCTAssertEqual(a["minutes"] as? Double, 5)
        XCTAssertEqual((a["stop"] as? [String: Any])?["reason"] as? String, "SYMPTOM")
    }

    func testTheTypedDistanceAcceptsACommaAndNothingElse() {
        XCTAssertEqual(HistoryCorrectionViewModel.distance("12,4"), 12.4)
        XCTAssertEqual(HistoryCorrectionViewModel.distance("12.4"), 12.4)
        XCTAssertNil(HistoryCorrectionViewModel.distance(""))
        XCTAssertNil(HistoryCorrectionViewModel.distance("doze"))
    }

    func testNothingIsSentWithoutAValidDistanceOrBeforeContesting() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = HistoryCorrectionViewModel(entry: try entry("P-logged-two-voices"), writer: w)
        XCTAssertEqual(vm.phase, .idle)
        vm.km = "7"
        await vm.send()
        XCTAssertTrue(w.journal.entries.isEmpty, "the form is not open")
        vm.startContesting()
        XCTAssertEqual(vm.phase, .editing)
        vm.km = "sete"
        XCTAssertFalse(vm.canSend)
        await vm.send()
        XCTAssertTrue(w.journal.entries.isEmpty)
        XCTAssertEqual(vm.phase, .editing)
    }

    /// "Salvo" only when the record keeps what the answer recorded (GAP-12); an error or an unkept record is "não mantido".
    func testSavedOnlyWhenTheRecordKeepsIt() async throws {
        let ok = try Safety.answer(#"{"ok":true,"recorded":["ob_1"]}"#)
        XCTAssertTrue(HistoryCorrectionViewModel.saved(WriteOutcome(answer: ok, kept: ["ob_1"], notKept: [])))
        XCTAssertFalse(HistoryCorrectionViewModel.saved(WriteOutcome(answer: ok, kept: [], notKept: ["ob_1"])))
        XCTAssertFalse(HistoryCorrectionViewModel.saved(WriteOutcome(answer: FixtureCoachingWriter.unavailable, kept: ["ob_1"], notKept: [])))

        let vm = HistoryCorrectionViewModel(entry: try entry("P-logged-two-voices"), writer: ScriptedSubmitWriter(FixtureCoachingWriter.unavailable))
        vm.startContesting(); vm.km = "7"
        var animated = 0
        await vm.send { change in animated += 1; change() }
        XCTAssertEqual(vm.phase, .notKept)
        XCTAssertEqual(animated, 1, "the result change goes through the view's animation")
    }

    func testNoDoubleSubmit() async throws {
        let writer = ScriptedSubmitWriter(try Safety.answer(#"{"ok":true,"recorded":["ob_1"]}"#), delay: .milliseconds(150))
        let vm = HistoryCorrectionViewModel(entry: try entry("P-logged-two-voices"), writer: writer)
        vm.startContesting(); vm.km = "7"
        let first = Task { await vm.send() }
        for _ in 0..<100 where writer.journal.entries.isEmpty { await Task.yield() }
        XCTAssertEqual(vm.phase, .submitting)
        XCTAssertFalse(vm.canSend)
        await vm.send()
        await first.value
        XCTAssertEqual(writer.journal.entries.filter { $0.call == "submit" }.count, 1)
        XCTAssertEqual(vm.phase, .notKept, "ScriptedSubmitWriter keeps nothing")
    }
}
