import CoachingPresentation
import XCTest
@testable import RepMileUI

/// The plan's today in these tests, and a row's session date as the plan holds it (the fixtures' rows are on their sessions' days).
extension HistoryCorrectionViewModel {
    static let testToday = "2026-11-18"
    convenience init(testing entry: LoggedEntry, writer: CoachingWriting, reload: @escaping @MainActor () async -> Void) {
        self.init(entry: entry, sessionDate: entry.date, writer: writer, planToday: { HistoryCorrectionViewModel.testToday }, reload: reload)
    }
    /// The athlete answers "não" to the six flags and confirms none applies.
    func answerNoneApplies() {
        eligibility = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "", pain: false, persistentPain: false, injury: false, illness: false,
                                        functionalLimitation: false, clinicalConcern: false)
    }
}

/// #32 increment 8, #59: the history distance correction's state and its one write live in `HistoryCorrectionViewModel`. The request is a
/// correction of the athlete's own report (`correctionOf`), rebuilt from their voice, with the declared distance and the screen answered here.
@MainActor
final class HistoryCorrectionViewModelTests: XCTestCase {
    private func entries(_ name: String) throws -> [LoggedEntry] { try Repo.store.decode(LoggedEntries.self, name).entries }
    private func entry(_ name: String, _ sessionId: String = "w0-run-d1") throws -> LoggedEntry {
        try XCTUnwrap(try entries(name).first { $0.sessionId == sessionId })
    }
    private func object(_ d: Data) throws -> [String: Any] { try XCTUnwrap(try JSONSerialization.jsonObject(with: d) as? [String: Any]) }
    private func encoded(_ v: some Encodable) throws -> Data { let e = JSONEncoder(); e.outputFormatting = .sortedKeys; return try e.encode(v) }

    func testOnlyAMeasuredUncontestedPlannedRunCanBeContested() throws {
        XCTAssertTrue(HistoryCorrectionViewModel.canContest(try entry("P-logged-two-voices")))
        XCTAssertFalse(HistoryCorrectionViewModel.canContest(try entry("P-logged-unplanned")), "already contested")
        XCTAssertFalse(HistoryCorrectionViewModel.canContest(try entry("P-logged-after-w0", "w0-run-d5")), "nothing measured")
        XCTAssertFalse(HistoryCorrectionViewModel.canContest(try entry("P-logged-after-w0", "w0-str-d2")), "strength")
        XCTAssertFalse(try entries("P-logged-unplanned").filter { $0.sessionId == nil }.contains(where: HistoryCorrectionViewModel.canContest), "unplanned")
    }

    /// The exact request: the athlete's own voice (completed, minutes, RPE, responses) with the declared distance, naming the voice's event id,
    /// the row's day and no instant, and the screen dated the plan's today. The #59 engine replay sends these bytes.
    func testTheCorrectionNamesTheAthletesReportAndCarriesTheScreen() async throws {
        let e = try entry("P-logged-two-voices")
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = HistoryCorrectionViewModel(testing: e, writer: w, reload: {})
        vm.startContesting()
        vm.km = "7,4"; vm.reason = .obstructedSky; vm.answerNoneApplies()
        await vm.send()
        let submits = w.journal.entries.filter { $0.call == "submit" }
        XCTAssertEqual(submits.count, 1)
        let golden = #"{"eligibility":{"assessedAt":"2026-11-18","clinicalConcern":false,"functionalLimitation":false,"illness":false,"injury":false,"#
            + #""pain":false,"persistentPain":false,"status":"NONCLINICAL_CONFIRMED"},"kind":"WEEKLY_REVIEW","observations":[{"actual":{"completed":true,"#
            + #""declared":{"distanceKm":7.4,"reason":"OBSTRUCTED_SKY"},"minutes":40,"rpe":4},"correctionOf":"ob_4074beafc9803b0fb18e52ff4a","#
            + #""occurrenceDate":"2026-11-17","response":{"effort":"ON_TARGET","nextDayFunction":"NORMAL","performance":"COMPATIBLE","recovery":"COMPATIBLE"},"#
            + #""sessionId":"w0-run-d1"}]}"#
        XCTAssertEqual(String(decoding: try XCTUnwrap(submits.first?.json), as: UTF8.self), golden)
        let request = try object(XCTUnwrap(submits.first?.json))
        let o = try XCTUnwrap((request["observations"] as? [[String: Any]])?.first)
        let athlete = try XCTUnwrap(HistoryCorrectionViewModel.athleteVoice(e))
        XCTAssertEqual(o["correctionOf"] as? String, athlete.eventId, "the correction names the athlete's report (else ALREADY_REPORTED)")
        XCTAssertNotEqual(o["correctionOf"] as? String, e.voices.first { $0.channel.raw == "DEVICE" }?.eventId)
        let actual = try XCTUnwrap(o["actual"] as? [String: Any])
        XCTAssertEqual(actual["rpe"] as? Double, 4, "the athlete's RPE, not the device's (none)")
        XCTAssertNil(actual["distanceKm"], "the measured distance is never re-sent as the athlete's")
        XCTAssertEqual((request["eligibility"] as? [String: Any])?["assessedAt"] as? String, HistoryCorrectionViewModel.testToday)
    }

    /// #59 P2: the row's top-line instant is the device's (10:45Z): it is never sent as the athlete's; the day is the plan's for the session.
    func testTimingIsTheAthletesNeverTheRowsInstant() async throws {
        let e = try entry("P-logged-two-voices")
        XCTAssertEqual(e.observedAt, "2026-11-17T10:45:00.000Z", "the fixture's row carries the device's instant")
        let obs = try XCTUnwrap(HistoryCorrectionViewModel.observation(entry: e, distanceKm: 6, reason: .signalLoss))
        XCTAssertNil(obs.observedAt)
        XCTAssertEqual(obs.occurrenceDate, "2026-11-17")
        XCTAssertNil(try object(encoded(obs))["observedAt"], "absent: the engine reads the report at the end of its day")
        // A row on another day than the plan holds for its session (the device's day), or a session the plan does not hold: not offered.
        for date in ["2026-11-18", nil] as [String?] {
            let w = FixtureCoachingWriter(store: Repo.store)
            let vm = HistoryCorrectionViewModel(entry: e, sessionDate: date, writer: w, planToday: { "2026-11-18" }, reload: {})
            XCTAssertTrue(HistoryCorrectionViewModel.canContest(e))
            XCTAssertFalse(vm.canContest, String(describing: date))
            vm.startContesting(); vm.km = "6"; vm.answerNoneApplies()
            await vm.send()
            XCTAssertEqual(vm.phase, .idle)
            XCTAssertTrue(w.journal.entries.isEmpty)
        }
    }

    /// A conflicted row: the athlete's stop (SYMPTOM), their not-completed and their adverse recovery stay theirs; the device's completed 40
    /// min never replaces them.
    func testAConflictedRowKeepsTheAthletesStop() throws {
        let e = try entry("P-logged-conflict")
        let obs = try XCTUnwrap(HistoryCorrectionViewModel.observation(entry: e, distanceKm: 6, reason: .signalLoss))
        guard case .plannedRun(let a) = obs.actual else { return XCTFail("planned run") }
        XCTAssertEqual(a.stop?.reason, .symptom)
        XCTAssertFalse(a.completed)
        XCTAssertEqual(a.minutes, 5)
        XCTAssertEqual(obs.response.recovery, .adverse)
        XCTAssertEqual(obs.correctionOf, HistoryCorrectionViewModel.athleteVoice(e)?.eventId)
    }

    /// #59 P2: a stop (or a response) the shared enumerations do not hold, e.g. `UNSTATED`, cannot be re-sent as stated; a correction replaces
    /// the report, so sending it without would erase a safety signal. Not offered, nothing built, nothing sent.
    func testAnUnmappableStatementIsNeverOffered() async throws {
        let edits: [(String, (inout [String: Any]) -> Void)] = [
            ("UNSTATED stop", { $0["stopReason"] = "UNSTATED" }),
            ("unknown recovery", { $0["response"] = ["performance": "COMPATIBLE", "recovery": "SOMETHING_NEW", "effort": "ON_TARGET", "nextDayFunction": "NORMAL"] })]
        for (name, edit) in edits {
            let e = try Reread.edited("P-logged-conflict") { row in
                row["voices"] = (row["voices"] as? [[String: Any]] ?? []).map { v in var v = v; if v["channel"] as? String == "ATHLETE" { edit(&v) }; return v }
            }
            let mine = try XCTUnwrap(HistoryCorrectionViewModel.athleteVoice(e), name)
            XCTAssertNil(HistoryCorrectionViewModel.statement(mine), name)
            XCTAssertFalse(HistoryCorrectionViewModel.canContest(e), name)
            XCTAssertNil(HistoryCorrectionViewModel.observation(entry: e, distanceKm: 6, reason: .signalLoss), name)
            let w = FixtureCoachingWriter(store: Repo.store)
            let vm = HistoryCorrectionViewModel(testing: e, writer: w, reload: {})
            vm.startContesting(); vm.km = "6"; vm.answerNoneApplies()
            await vm.send()
            XCTAssertEqual(vm.phase, .idle, name)
            XCTAssertTrue(w.journal.entries.isEmpty, name)
        }
    }

    /// The screen the correction needs (the engine records no report without a current one): six flags, nil until answered and never false
    /// by default; sent only once every flag is answered and either one is "sim" or the athlete confirmed none applies.
    func testTheScreenIsAskedNeverAssumed() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = HistoryCorrectionViewModel(testing: try entry("P-logged-two-voices"), writer: w, reload: {})
        vm.startContesting(); vm.km = "7"
        let flags = { [vm.eligibility.pain, vm.eligibility.persistentPain, vm.eligibility.injury, vm.eligibility.illness,
                       vm.eligibility.functionalLimitation, vm.eligibility.clinicalConcern] }
        XCTAssertEqual(flags(), [nil, nil, nil, nil, nil, nil])
        XCTAssertFalse(vm.canSend, "no screen answered")
        vm.eligibility.pain = false; vm.eligibility.persistentPain = false; vm.eligibility.injury = false
        vm.eligibility.illness = false; vm.eligibility.functionalLimitation = false
        vm.eligibility.status = .nonclinicalConfirmed
        XCTAssertFalse(vm.canSend, "one flag unanswered: nil is not \"não\"")
        vm.eligibility.clinicalConcern = false
        XCTAssertTrue(vm.canSend)
        vm.eligibility.status = nil
        XCTAssertFalse(vm.canSend, "all \"não\" but not confirmed")
        await vm.send()
        XCTAssertTrue(w.journal.entries.isEmpty)
        // A flag answered "sim" is the athlete's statement: sent as stated (no confirmation), the engine routes it to a human.
        vm.eligibility.pain = true
        XCTAssertTrue(vm.canSend)
        let e = try XCTUnwrap(vm.request()?.eligibility)
        XCTAssertEqual(e.pain, true); XCTAssertNil(e.status); XCTAssertEqual(e.assessedAt, HistoryCorrectionViewModel.testToday)
    }

    /// The answer's safety states stay on screen: a clinical route (a "sim" here) and the warning-sign screen a re-sent symptom stop raises.
    func testTheAnswersSafetyStatesAreShown() async throws {
        let route = try Safety.answer(#"{"ok":true,"status":"CLINICAL_HUMAN_REQUIRED","recorded":[]}"#)
        let clinical = HistoryCorrectionViewModel(testing: try entry("P-logged-two-voices"), writer: ScriptedSubmitWriter(route), reload: {})
        clinical.startContesting(); clinical.km = "7"; clinical.answerNoneApplies(); clinical.eligibility.pain = true
        await clinical.send()
        XCTAssertEqual(clinical.phase, .notKept)
        XCTAssertTrue(clinical.clinical)
        XCTAssertFalse(clinical.screenRequired)

        let required = try Safety.answer(#"{"ok":true,"status":"KEEP","recorded":["ob_1"],"warningSignScreen":{"status":"REQUIRED","reason":"RUN_STOPPED_FOR_A_SYMPTOM"}}"#)
        let symptom = HistoryCorrectionViewModel(testing: try entry("P-logged-conflict"), writer: ScriptedSubmitWriter(required), reload: {})
        symptom.startContesting(); symptom.km = "6"; symptom.answerNoneApplies()
        await symptom.send()
        XCTAssertTrue(symptom.screenRequired)
        XCTAssertFalse(symptom.clinical)
    }

    func testTheTypedDistanceAcceptsACommaAndNothingElse() {
        XCTAssertEqual(HistoryCorrectionViewModel.distance("12,4"), 12.4)
        XCTAssertEqual(HistoryCorrectionViewModel.distance("12.4"), 12.4)
        XCTAssertNil(HistoryCorrectionViewModel.distance(""))
        XCTAssertNil(HistoryCorrectionViewModel.distance("doze"))
    }

    func testNothingIsSentWithoutAValidDistanceOrBeforeContesting() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = HistoryCorrectionViewModel(testing: try entry("P-logged-two-voices"), writer: w, reload: {})
        XCTAssertEqual(vm.phase, .idle)
        vm.km = "7"; vm.answerNoneApplies()
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

        let vm = HistoryCorrectionViewModel(testing: try entry("P-logged-two-voices"), writer: ScriptedSubmitWriter(FixtureCoachingWriter.unavailable), reload: {})
        vm.startContesting(); vm.km = "7"; vm.answerNoneApplies()
        var animated = 0
        await vm.send { change in animated += 1; change() }
        XCTAssertEqual(vm.phase, .notKept)
        XCTAssertEqual(animated, 1, "the result change goes through the view's animation")
    }

    func testNoDoubleSubmit() async throws {
        let writer = ScriptedSubmitWriter(try Safety.answer(#"{"ok":true,"recorded":["ob_1"]}"#), delay: .milliseconds(150))
        let vm = HistoryCorrectionViewModel(testing: try entry("P-logged-two-voices"), writer: writer, reload: {})
        vm.startContesting(); vm.km = "7"; vm.answerNoneApplies()
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
