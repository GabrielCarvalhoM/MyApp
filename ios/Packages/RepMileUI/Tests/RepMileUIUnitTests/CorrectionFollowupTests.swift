import CoachingPresentation
import Foundation
import IntegrationContracts
@testable import RunRecorder
import XCTest
@testable import RepMileUI

/// #70, front C follow-ups of #59's reviews (engine replay `audits/v1-ios-swiftui-2026-11-26/results/i70-correction-followups/`):
/// (a) a corrected row is corrected again, naming the correction in force; past the engine's limit the sheet says so;
/// (b) a lone "sim" on the eligibility screen is sent at once, at every athlete write site (the engine routes it before anything else);
/// (c) the screen is dated the plan's day read at send time, never the day the sheet was opened.
@MainActor
final class CorrectionFollowupTests: XCTestCase {
    private func entry(_ name: String) throws -> LoggedEntry {
        try XCTUnwrap(try Repo.store.decode(LoggedEntries.self, name).entries.first { $0.sessionId == "w0-run-d1" })
    }
    private func submits(_ j: RequestJournal) throws -> [[String: Any]] {
        try j.entries.filter { $0.call == "submit" }.map { try XCTUnwrap(try JSONSerialization.jsonObject(with: $0.json) as? [String: Any]) }
    }
    private static let flags: [WritableKeyPath<EligibilityScreen, Bool?>] = [\.pain, \.persistentPain, \.injury, \.illness, \.functionalLimitation, \.clinicalConcern]
    private static let names = ["pain", "persistentPain", "injury", "illness", "functionalLimitation", "clinicalConcern"]

    // MARK: (a) a corrected row

    func testACorrectedRowIsCorrectedAgainNamingTheCorrectionInForce() async throws {
        let e = try entry("P-logged-unplanned")
        XCTAssertNotNil(e.contested, "the fixture's row already carries a correction")
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = HistoryCorrectionViewModel(testing: e, writer: w, reload: {})
        XCTAssertTrue(vm.canContest)
        vm.startContesting()
        XCTAssertEqual(vm.phase, .editing)
        XCTAssertEqual(vm.km, "", "nothing pre-filled from the earlier correction")
        vm.km = "5,5"; vm.reason = .obstructedSky; vm.answerNoneApplies()
        await vm.send()
        let o = try XCTUnwrap((try submits(w.journal).first?["observations"] as? [[String: Any]])?.first)
        XCTAssertEqual(o["correctionOf"] as? String, HistoryCorrectionViewModel.athleteVoice(e)?.eventId, "the ATHLETE voice of the row as read")
        let actual = try XCTUnwrap(o["actual"] as? [String: Any])
        XCTAssertEqual((actual["declared"] as? [String: Any])?["distanceKm"] as? Double, 5.5)
        XCTAssertEqual((actual["declared"] as? [String: Any])?["reason"] as? String, "OBSTRUCTED_SKY")
        XCTAssertEqual(actual["distanceKm"] as? Double, HistoryCorrectionViewModel.athleteVoice(e)?.declaredKm, "the athlete's own figure, never the earlier correction")
    }

    /// Replay 1: past `correctionsPerReport` the engine refuses LIMIT_EXCEEDED and changes nothing: the sheet says why, never "send again".
    func testTheEnginesCorrectionLimitIsShown() async throws {
        var reloads = 0
        let limit = try Safety.answer(#"{"ok":false,"error":{"code":"LIMIT_EXCEEDED"}}"#)
        let vm = HistoryCorrectionViewModel(testing: try entry("P-logged-unplanned"), writer: ScriptedSubmitWriter(limit), reload: { reloads += 1 })
        vm.startContesting(); vm.km = "6"; vm.answerNoneApplies()
        await vm.send()
        XCTAssertEqual(vm.phase, .notKept)
        XCTAssertTrue(vm.limitReached)
        XCTAssertFalse(vm.clinical)
        XCTAssertEqual(reloads, 0, "a refusal changed nothing")
        XCTAssertNotEqual(L.t("history.contest.limit"), "history.contest.limit")
        let other = HistoryCorrectionViewModel(testing: try entry("P-logged-unplanned"), writer: ScriptedSubmitWriter(FixtureCoachingWriter.unavailable), reload: {})
        other.startContesting(); other.km = "6"; other.answerNoneApplies()
        await other.send()
        XCTAssertEqual(other.phase, .notKept)
        XCTAssertFalse(other.limitReached, "only the engine's limit reads as the limit")
    }

    // MARK: (b) a lone "sim"

    func testALoneSimIsSentAsStatedOnTheCorrection() async throws {
        for (k, name) in zip(Self.flags, Self.names) {
            let w = FixtureCoachingWriter(store: Repo.store)
            let vm = HistoryCorrectionViewModel(testing: try entry("P-logged-two-voices"), writer: w, reload: {})
            vm.startContesting(); vm.km = "6"
            vm.eligibility[keyPath: k] = true
            XCTAssertTrue(vm.canSend, "\(name): a \"sim\" waits for no other flag")
            await vm.send()
            let e = try XCTUnwrap(try submits(w.journal).first?["eligibility"] as? [String: Any])
            XCTAssertEqual(Set(e.keys), ["assessedAt", name], "\(name): only what the athlete answered; nothing sent as \"não\", no confirmation")
            XCTAssertEqual(e[name] as? Bool, true)
            XCTAssertTrue(vm.clinical, "\(name): the captured clinical route (the engine's answer to a flag \"sim\")")
            XCTAssertEqual(vm.phase, .notKept)
        }
    }

    /// The shared rule: a "sim" is answered; without one, every flag answered and confirmed (unchanged: nil ≠ false, a "não" is no yes).
    func testTheSharedRuleWithAndWithoutASim() {
        var e = EligibilityScreen.unanswered
        XCTAssertFalse(e.answered)
        e.illness = false
        XCTAssertFalse(e.answered, "a lone \"não\" is not an assessment")
        e.status = .nonclinicalConfirmed
        XCTAssertFalse(e.answered, "five unanswered: never assumed \"não\"")
        e = .unanswered; e.clinicalConcern = true
        XCTAssertTrue(e.answered)
        XCTAssertEqual(e.dated("2026-11-22")?.assessedAt, "2026-11-22")
        XCTAssertNil(EligibilityScreen.unanswered.dated("2026-11-22"))
    }

    func testALoneSimIsSentAtEveryOtherSite() async throws {
        let end = Date(timeIntervalSince1970: 1_795_850_000)
        var lone = EligibilityScreen.unanswered; lone.pain = true
        let rec = FinishedRecording(ref: AppRecordedRunRef(id: "rec-1", sessionId: "w0-run-d6", start: end.addingTimeInterval(-2400), end: end, reportedEventId: nil),
                                    sessionDate: "2026-11-22", movingMinutes: 39.6, local: LocalMeasurement(distanceMetres: nil, splitsSeconds: [], route: []))
        let w = FixtureCoachingWriter(store: Repo.store)
        let run = RunReportViewModel(recording: rec, writer: w, planToday: { "2026-11-22" }, markReported: { _ in }, now: { end }, holdGuidance: { nil })
        run.eligibility = lone
        XCTAssertTrue(run.canSend, "run report")

        let session = try XCTUnwrap(try Repo.store.decode(PlanView.self, "02-plan-w0", at: "view").week?.sessions.first { $0.id == "w0-str-d2" })
        let strength = StrengthLogViewModel(session: session, writer: w, planToday: { "2026-11-22" }, now: { end }, holdGuidance: { nil })
        strength.minutes = 40; strength.confirmAsPrescribed(); strength.eligibility = lone
        XCTAssertTrue(strength.canSend, "strength log")

        let nf = NotFeeling100ViewModel(reader: Safety.reader(), writer: w, planToday: { "2026-11-22" }, holdGuidance: { nil })
        await nf.choose(.mildIllness); nf.eligibility = lone
        XCTAssertTrue(nf.canSend, "não estou 100%")

        let ready = ReadinessViewModel(reader: Safety.reader(), writer: w, planToday: { "2026-11-22" }, holdGuidance: { nil })
        await ready.load()
        ready.answers = Dictionary(uniqueKeysWithValues: (ready.questionSet?.warningSigns ?? []).map { ($0, false) })
        ready.recovered = true; ready.eligibility = lone
        XCTAssertTrue(ready.canSend, "readiness")
        await ready.send()
        XCTAssertEqual(ready.phase, .stillBlocked(.professionalAssessment), "a flag \"sim\" keeps the hold")

        let runSession = try XCTUnwrap(try Repo.store.decode(PlanView.self, "13-plan-w1", at: "view").week?.sessions.first { $0.executable && $0.sport.raw == "RUN" })
        let day = UnavailableDayViewModel(session: runSession, writer: w, planToday: { "2026-11-22" }, reload: {},
                                          presentation: { try? Repo.store.decode(PresentationSnapshot.self, "actions-B1b-presentation-pending") }, holdGuidance: { nil })
        day.eligibility = lone
        XCTAssertTrue(day.canSend, "unavailable day")
        XCTAssertEqual(day.request()?.eligibility?.pain, true)
        XCTAssertNil(day.request()?.eligibility?.illness, "never sent as \"não\"")
    }

    // MARK: (c) the plan's day at send time

    /// A sheet opened on the 18th and sent after the plan's midnight: the screen is dated the 19th, read from the plan when sent.
    func testTheScreenIsDatedThePlansDayReadAtSendTime() async throws {
        var reads = 0
        let w = FixtureCoachingWriter(store: Repo.store)
        let e = try entry("P-logged-two-voices")
        let vm = HistoryCorrectionViewModel(entry: e, sessionDate: e.date, writer: w, planToday: { reads += 1; return "2026-11-19" },
                                            reload: {}, holdGuidance: { nil })
        vm.startContesting(); vm.km = "6"; vm.answerNoneApplies()
        XCTAssertEqual(reads, 0, "nothing is read when the sheet opens or while the athlete answers")
        await vm.send()
        XCTAssertEqual(reads, 1, "read once, at send time")
        XCTAssertEqual((try submits(w.journal).first?["eligibility"] as? [String: Any])?["assessedAt"] as? String, "2026-11-19")
        XCTAssertEqual(vm.phase, .saved)
    }

    /// The day is read after the phase turns `submitting`: a second tap while it is read sends nothing more.
    func testNoDoubleSubmitWhileThePlansDayIsRead() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let e = try entry("P-logged-two-voices")
        let vm = HistoryCorrectionViewModel(entry: e, sessionDate: e.date, writer: w,
                                            planToday: { try? await Task.sleep(for: .milliseconds(150)); return "2026-11-18" }, reload: {}, holdGuidance: { nil })
        vm.startContesting(); vm.km = "6"; vm.answerNoneApplies()
        let first = Task { await vm.send() }
        for _ in 0..<100 where vm.phase != .submitting { await Task.yield() }
        XCTAssertEqual(vm.phase, .submitting)
        XCTAssertFalse(vm.canSend)
        await vm.send()
        await first.value
        XCTAssertEqual(try submits(w.journal).count, 1)
    }
}
