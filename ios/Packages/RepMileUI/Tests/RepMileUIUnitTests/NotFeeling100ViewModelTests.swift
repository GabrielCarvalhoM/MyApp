import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #32 increment 3: "Não estou 100%" state, the read of the engine's set and the one write live in `NotFeeling100ViewModel`. The request
/// shape and the status mapping stay pinned by `RequestShapeTests`; this pins the flow around them.
@MainActor
final class NotFeeling100ViewModelTests: XCTestCase {
    private func viewModel(reader: CoachingReading = Safety.reader(), writer: CoachingWriting, eligibility: Bool = false,
                           planToday: String? = "2026-11-22") -> NotFeeling100ViewModel {
        NotFeeling100ViewModel(reader: reader, writer: writer, requireEligibility: eligibility, planToday: { planToday },
                               now: { Date(timeIntervalSince1970: 1_795_850_000) })
    }

    func testChoosingAConditionAsksExactlyTheEngineSet() async throws {
        let vm = viewModel(writer: FixtureCoachingWriter(store: Repo.store))
        XCTAssertEqual(vm.phase, .choosingCondition)
        XCTAssertNil(vm.questionSet)
        await vm.choose(.mildIllness)
        let set = try Safety.set("MILD_ILLNESS")
        XCTAssertEqual(vm.phase, .answering(.mildIllness, set))
        XCTAssertEqual(vm.questionSet?.warningSigns, set.warningSigns)
        XCTAssertEqual(vm.intents.map(\.rawValue), set.intents, "only the intents the engine accepts for the condition")
        XCTAssertTrue(vm.answers.isEmpty, "nothing is preset")
    }

    /// QRE #32.3: tap A, then B; B's set arrives first and A's late. The questions are B's, never the first set to arrive.
    func testTheLatestConditionTapWins() async throws {
        let reader = DelayedSignReader(delays: ["MILD_ILLNESS": .milliseconds(150), "MINOR_DISCOMFORT": .milliseconds(10)])
        let vm = viewModel(reader: reader, writer: FixtureCoachingWriter(store: Repo.store))
        let first = Task { await vm.choose(.mildIllness) }
        for _ in 0..<100 where reader.journal.entries.isEmpty { await Task.yield() }
        await vm.choose(.minorDiscomfort)
        XCTAssertEqual(vm.phase, .answering(.minorDiscomfort, try Safety.set("MINOR_DISCOMFORT")))
        vm.answers["feverOrChills"] = false
        await first.value
        XCTAssertEqual(vm.phase, .answering(.minorDiscomfort, try Safety.set("MINOR_DISCOMFORT")), "the late set of the earlier tap is dropped")
        XCTAssertEqual(vm.answers, ["feverOrChills": false], "answers already given are not reset by the late set")
        XCTAssertEqual(reader.journal.entries.count, 2)
    }

    /// The reverse order: A's set arrives first while B is pending. A is dropped; the screen waits for B.
    func testAnEarlierTapResolvingFirstIsDropped() async throws {
        let reader = DelayedSignReader(delays: ["MILD_ILLNESS": .milliseconds(50), "MINOR_DISCOMFORT": .milliseconds(250)])
        let vm = viewModel(reader: reader, writer: FixtureCoachingWriter(store: Repo.store))
        let first = Task { await vm.choose(.mildIllness) }
        for _ in 0..<100 where reader.journal.entries.isEmpty { await Task.yield() }
        let second = Task { await vm.choose(.minorDiscomfort) }
        for _ in 0..<100 where reader.journal.entries.count < 2 { await Task.yield() }
        await first.value
        XCTAssertEqual(vm.phase, .choosingCondition, "the earlier condition's set never reaches the screen")
        await second.value
        XCTAssertEqual(vm.phase, .answering(.minorDiscomfort, try Safety.set("MINOR_DISCOMFORT")))
    }

    func testUnansweredSignsAreOmittedAndNoEligibilityWhenNotAsked() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = viewModel(writer: w)
        await vm.choose(.minorDiscomfort)
        let set = try Safety.set("MINOR_DISCOMFORT")
        for s in set.warningSigns.dropLast() { vm.answers[s] = false }
        vm.answers["notInTheSet"] = true
        vm.eligibility.pain = false
        vm.intent = .reduceLight
        await vm.send()
        let sent = try XCTUnwrap(try Safety.submits(w.journal).first)
        let signs = try XCTUnwrap((sent["wellbeing"] as? [String: Any])?["warningSigns"] as? [String: Bool])
        XCTAssertEqual(Set(signs.keys), Set(set.warningSigns.dropLast()), "the unanswered sign is omitted, never false; an unasked one is never sent")
        XCTAssertNil(sent["eligibility"], "the eligibility screen goes only with the entry point that asks it")
        XCTAssertEqual(vm.phase, .outcome(.needsAnswers), "the engine asks again for the unanswered sign")
    }

    func testEligibilityIsSentWhenAskedDatedThePlanDay() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = viewModel(writer: w, eligibility: true)
        await vm.choose(.mildIllness)
        vm.eligibility.injury = false
        await vm.send()
        let e = try XCTUnwrap(try Safety.submits(w.journal).first?["eligibility"] as? [String: Any])
        XCTAssertEqual(e["assessedAt"] as? String, "2026-11-22")
        XCTAssertEqual(e["injury"] as? Bool, false)
        XCTAssertNil(e["pain"], "nil = not answered, never false")
        XCTAssertNil(e["status"])

        let w2 = FixtureCoachingWriter(store: Repo.store)
        let noPlan = viewModel(writer: w2, eligibility: true, planToday: nil)
        await noPlan.choose(.mildIllness)
        await noPlan.send()
        let e2 = try XCTUnwrap(try Safety.submits(w2.journal).first?["eligibility"] as? [String: Any])
        XCTAssertEqual(e2["assessedAt"] as? String, Fmt.deviceDay(Date(timeIntervalSince1970: 1_795_850_000)), "no plan loaded: the device day")
    }

    func testOutcomeIsTheEngineStatus() async throws {
        let set = try Safety.set("MILD_ILLNESS")
        let allNo = Dictionary(uniqueKeysWithValues: set.warningSigns.map { ($0, false) })
        for (answers, expected) in [(allNo, NotFeeling100ViewModel.Outcome.kept), (allNo.merging(["feverOrChills": true]) { $1 }, .blocked)] {
            let vm = viewModel(writer: FixtureCoachingWriter(store: Repo.store))
            await vm.choose(.mildIllness)
            vm.answers = answers; vm.intent = .rest
            await vm.send()
            XCTAssertEqual(vm.phase, .outcome(expected))
        }
        for (json, expected) in [(#"{"ok":true,"status":"MODIFY"}"#, NotFeeling100ViewModel.Outcome.modified),
                                 (#"{"ok":true,"status":"ASK"}"#, .needsAnswers),
                                 (#"{"ok":true,"status":"CLINICAL_HUMAN_REQUIRED"}"#, .blocked),
                                 (#"{"ok":true}"#, .failed("UNRECOGNIZED")),
                                 (#"{"ok":false,"error":{"code":"CONFLICT_STALE_VERSION"}}"#, .failed("CONFLICT_STALE_VERSION"))] {
            let vm = viewModel(writer: ScriptedSubmitWriter(try Safety.answer(json)))
            await vm.choose(.unusualFatigue)
            await vm.send()
            XCTAssertEqual(vm.phase, .outcome(expected), json)
        }
    }

    func testTwoTapsWhileSendingWriteOnce() async throws {
        let w = ScriptedSubmitWriter(try Safety.answer(#"{"ok":true,"status":"KEEP"}"#), delay: .milliseconds(50))
        let vm = viewModel(writer: w)
        await vm.choose(.needRest)
        async let first: Void = vm.send()
        async let second: Void = vm.send()
        _ = await (first, second)
        XCTAssertEqual(try Safety.submits(w.journal).count, 1)
        XCTAssertEqual(vm.phase, .outcome(.kept))
        await vm.send()
        XCTAssertEqual(try Safety.submits(w.journal).count, 1, "an outcome is never sent again")
    }

    func testSubmittingDisablesTheSend() async throws {
        let w = ScriptedSubmitWriter(try Safety.answer(#"{"ok":true,"status":"KEEP"}"#), delay: .milliseconds(50))
        let vm = viewModel(writer: w)
        await vm.choose(.needRest)
        XCTAssertFalse(vm.sending)
        let task = Task { await vm.send() }
        for _ in 0..<100 where !vm.sending { await Task.yield() }
        XCTAssertTrue(vm.sending)
        XCTAssertNotNil(vm.questionSet, "the questions stay on screen while sending")
        await task.value
        XCTAssertFalse(vm.sending)
    }

    func testAFailedReadKeepsTheConditionListAndSendsNothing() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = viewModel(reader: Safety.reader(Safety.emptyStore), writer: w)
        await vm.choose(.mildIllness)
        XCTAssertEqual(vm.phase, .choosingCondition)
        await vm.send()
        XCTAssertTrue(w.journal.entries.isEmpty)
    }

    func testAFailedWriteFailsClosed() async {
        let vm = viewModel(writer: FixtureCoachingWriter(store: Safety.emptyStore))
        await vm.choose(.mildIllness)
        await vm.send()
        XCTAssertEqual(vm.phase, .outcome(.failed("FIXTURE_UNAVAILABLE")))
    }
}
