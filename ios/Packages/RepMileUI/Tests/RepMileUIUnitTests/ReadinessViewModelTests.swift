import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #32 increment 3: the readiness declaration's state, the read of the READINESS set and its one write live in `ReadinessViewModel`.
/// "De volta" only on READINESS_RESTART / RETURNING; anything else keeps the hold (fail closed).
@MainActor
final class ReadinessViewModelTests: XCTestCase {
    private func loaded(_ writer: CoachingWriting) async -> ReadinessViewModel {
        let vm = ReadinessViewModel(reader: Safety.reader(), writer: writer)
        await vm.load()
        return vm
    }

    func testLoadsExactlyTheEngineReadinessSet() async throws {
        let vm = ReadinessViewModel(reader: Safety.reader(), writer: FixtureCoachingWriter(store: Repo.store))
        XCTAssertEqual(vm.phase, .loading)
        await vm.load()
        let set = try Safety.set("READINESS")
        XCTAssertEqual(vm.phase, .answering(set))
        XCTAssertEqual(vm.questionSet?.warningSigns.count, 15)
        XCTAssertNil(vm.recovered, "no default")
        XCTAssertTrue(vm.answers.isEmpty)
    }

    func testTheSetIsReadOnceAndAnswersSurviveAReappearance() async throws {
        let reader = DelayedSignReader(delays: [:])
        let vm = ReadinessViewModel(reader: reader, writer: FixtureCoachingWriter(store: Repo.store))
        await vm.load()
        vm.recovered = true
        await vm.load()
        XCTAssertEqual(reader.journal.entries.count, 1)
        XCTAssertEqual(vm.phase, .answering(try Safety.set("READINESS")))
        XCTAssertEqual(vm.recovered, true)
    }

    func testNothingIsSentUntilRecoveredIsAnswered() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = await loaded(w)
        XCTAssertFalse(vm.canSend)
        await vm.send()
        XCTAssertTrue(w.journal.entries.isEmpty)
        vm.recovered = false
        XCTAssertTrue(vm.canSend)
    }

    func testUnansweredSignsAreOmittedAndTheSportsAreSent() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = await loaded(w)
        let set = try Safety.set("READINESS")
        for s in set.warningSigns.dropLast() { vm.answers[s] = false }
        vm.answers["notInTheSet"] = true
        vm.recovered = true; vm.run = true
        await vm.send()
        let sent = try XCTUnwrap(try Safety.submits(w.journal).first)
        let readiness = try XCTUnwrap(sent["readiness"] as? [String: Any])
        let signs = try XCTUnwrap(readiness["warningSigns"] as? [String: Bool])
        XCTAssertEqual(Set(signs.keys), Set(set.warningSigns.dropLast()), "the unanswered sign is omitted, never false; an unasked one is never sent")
        XCTAssertEqual(readiness["declaredRecovered"] as? Bool, true)
        let sports = try XCTUnwrap(readiness["sports"] as? [String: [String: Any]])
        XCTAssertEqual(sports["RUN"]?["ready"] as? Bool, true)
        XCTAssertEqual(sports["STRENGTH"]?["ready"] as? Bool, false)
        XCTAssertNil(sent["eligibility"])
        XCTAssertEqual(vm.phase, .returning, "the capture restarts training (READINESS_RESTART, RETURNING)")
    }

    func testReplyReadsTheEngineAnswer() throws {
        let cases: [(BoundaryAnswer, ReadinessViewModel.Reply, String)] = [
            (try Repo.store.decode(BoundaryAnswer.self, "18-declareReadiness"), .returning, "18"),
            (try Repo.store.decode(BoundaryAnswer.self, "actions-D3-notFeeling100-no-screen"), .needsAnswers, "ASK + NEEDS_INPUT"),
            (try Repo.store.decode(BoundaryAnswer.self, "16-notFeeling100-sign"), .stillBlocked, "clinical"),
            (try Safety.answer(#"{"ok":true,"status":"ASK"}"#), .needsAnswers, "ASK"),
            (try Safety.answer(#"{"ok":true,"status":"MODIFY","action":"READINESS_RESTART"}"#), .returning, "restart"),
            (try Safety.answer(#"{"ok":true,"status":"MODIFY"}"#), .stillBlocked, "no restart"),
            (try Safety.answer(#"{"ok":true,"status":"SOMETHING_NEW"}"#), .stillBlocked, "unknown"),
            (try Safety.answer(#"{"ok":false,"action":"READINESS_RESTART","error":{"code":"BUSY"}}"#), .stillBlocked, "not ok"),
            (FixtureCoachingWriter.unavailable, .stillBlocked, "unavailable"),
        ]
        for (answer, expected, name) in cases { XCTAssertEqual(ReadinessViewModel.reply(for: answer), expected, name) }
    }

    func testNeedsAnswersThenBackKeepsTheAnswers() async throws {
        let w = ScriptedSubmitWriter(try Safety.answer(#"{"ok":true,"status":"ASK"}"#))
        let vm = await loaded(w)
        let set = try Safety.set("READINESS")
        vm.recovered = true; vm.answers[set.warningSigns[0]] = false
        await vm.send()
        XCTAssertEqual(vm.phase, .needsAnswers(set))
        XCTAssertNil(vm.questionSet)
        vm.back()
        XCTAssertEqual(vm.phase, .answering(set))
        XCTAssertEqual(vm.recovered, true)
        XCTAssertEqual(vm.answers, [set.warningSigns[0]: false])
    }

    func testTwoTapsWhileSendingWriteOnce() async throws {
        let w = ScriptedSubmitWriter(try Repo.store.decode(BoundaryAnswer.self, "18-declareReadiness"), delay: .milliseconds(50))
        let vm = await loaded(w)
        vm.recovered = true
        async let first: Void = vm.send()
        async let second: Void = vm.send()
        _ = await (first, second)
        XCTAssertEqual(try Safety.submits(w.journal).count, 1, "one declaration per tap sequence (the known missing `sending` guard)")
        XCTAssertEqual(vm.phase, .returning)
        await vm.send()
        XCTAssertEqual(try Safety.submits(w.journal).count, 1)
    }

    func testAFailedReadLeavesNothingToAnswer() async {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = ReadinessViewModel(reader: Safety.reader(Safety.emptyStore), writer: w)
        await vm.load()
        XCTAssertEqual(vm.phase, .loading)
        XCTAssertNil(vm.questionSet)
        vm.recovered = true
        XCTAssertFalse(vm.canSend)
        await vm.send()
        XCTAssertTrue(w.journal.entries.isEmpty)
    }

    func testAFailedWriteKeepsTheHold() async {
        let vm = await loaded(FixtureCoachingWriter(store: Safety.emptyStore))
        vm.recovered = true
        await vm.send()
        XCTAssertEqual(vm.phase, .stillBlocked)
    }
}
