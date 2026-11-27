import CoachingPresentation
import Foundation
import XCTest
@testable import RepMileUI

/// #37 (SSCTR + code review) and ARCHITECTURE §4 #4: the strength log records only what the athlete confirmed. Nothing is pre-filled as
/// done; unconfirmed sets are absent; `completed` is the contract's reading of the stated sets; one write at a time.
@MainActor
final class StrengthLogViewModelTests: XCTestCase {
    /// `w0-str-d2`: goblet-squat 2×8, db-bench-press 2×8, db-row 2×8, db-calf-raise 1×10, dead-bug 1×10 (bodyweight).
    private var session: PlannedSession {
        get throws { try XCTUnwrap(try Repo.store.decode(PlanView.self, "02-plan-w0", at: "view").week?.sessions.first { $0.id == "w0-str-d2" }) }
    }
    private let end = Date(timeIntervalSince1970: 1_795_850_000)

    /// The screen answered "none applies" (#68): these tests pin the log itself (the screen: `ReportEligibilityTests`).
    private func viewModel(_ s: PlannedSession?, _ w: FixtureCoachingWriter) -> StrengthLogViewModel {
        let vm = StrengthLogViewModel(session: s, writer: w, planToday: { "2026-11-22" }, now: { [end] in end }, holdGuidance: { nil }); vm.eligibility = .testNoneApplies; return vm
    }
    private func submits(_ w: FixtureCoachingWriter) -> [Data] { w.journal.entries.filter { $0.call == "submit" }.map(\.json) }
    private func exercise(_ vm: StrengthLogViewModel, _ id: String) throws -> PrescribedExercise { try XCTUnwrap(vm.exercises.first { $0.id == id }) }

    func testUntouchedFormStatesNothingAndCannotSend() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = viewModel(try session, w)
        XCTAssertEqual(vm.exercises.count, 5)
        XCTAssertEqual(vm.statedSetCount, 0, "no set is pre-filled as done")
        XCTAssertTrue(vm.sets.values.joined().allSatisfy { $0.reps == nil && $0.load.isEmpty })
        XCTAssertNil(vm.minutes, "minutes are the athlete's")
        XCTAssertFalse(vm.canSend)
        vm.minutes = 30
        XCTAssertFalse(vm.canSend, "minutes alone do not report a planned session as done")
        await vm.send()
        XCTAssertTrue(submits(w).isEmpty)
        XCTAssertEqual(vm.actual().exercises, [])
        XCTAssertFalse(vm.actual().completed)
    }

    func testConfirmAsPrescribedSendsExactlyThePrescribedSets() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = viewModel(try session, w)
        vm.minutes = 40
        XCTAssertTrue(vm.canConfirmAsPrescribed)
        vm.confirmAsPrescribed()
        let a = vm.actual()
        XCTAssertTrue(a.completed)
        XCTAssertEqual(a.minutes, 40)
        XCTAssertEqual(a.exercises.map(\.id), vm.exercises.map(\.id))
        for (logged, e) in zip(a.exercises, vm.exercises) {
            XCTAssertEqual(logged.sets, Array(repeating: LoggedSetEntry(reps: try XCTUnwrap(e.reps), load: nil, rir: nil), count: e.sets), e.id)
        }
        await vm.send()
        XCTAssertEqual(submits(w).count, 1)
        XCTAssertEqual(vm.phase, .saved)
    }

    func testEditedRepsAndTypedLoadAreSentAsStated() throws {
        let vm = viewModel(try session, FixtureCoachingWriter(store: Repo.store))
        vm.confirmAsPrescribed()
        vm.setReps(6, "goblet-squat", 1)
        vm.setLoad("16,5", "goblet-squat", 1)
        let squat = try XCTUnwrap(vm.actual().exercises.first { $0.id == "goblet-squat" })
        XCTAssertEqual(squat.sets, [LoggedSetEntry(reps: 8, load: nil, rir: nil),
                                    LoggedSetEntry(reps: 6, load: LoggedLoadEntry(value: 16.5, unit: .kg, convention: .singleImplement), rir: nil)])
        XCTAssertTrue(vm.actual().completed, "every set done: completion does not depend on reps (SSCTR #37b F1)")
    }

    /// SSCTR #37b F1: completion is sets done >= sets planned (CoachingCore `bindObservations` setsOk); a reps shortfall is the
    /// per-exercise target, read by the engine from the reps sent as stated. A missing set or an omitted exercise keeps it false.
    func testCompletedCountsSetsNotReps() throws {
        let vm = viewModel(try session, FixtureCoachingWriter(store: Repo.store))
        for e in vm.exercises { for i in 0..<e.sets { vm.setReps(3, e.id, i) } }
        vm.setReps(1, "db-row", 0)
        let a = vm.actual()
        XCTAssertTrue(a.completed, "every prescribed set stated, some with fewer reps than prescribed")
        XCTAssertEqual(a.exercises.first { $0.id == "db-row" }?.sets.map(\.reps), [1, 3], "reps are sent as stated")
        XCTAssertEqual(a.exercises.first { $0.id == "goblet-squat" }?.sets.map(\.reps), [3, 3])
        vm.setReps(nil, "goblet-squat", 1)
        XCTAssertFalse(vm.actual().completed, "a missing set")
        vm.setReps(3, "goblet-squat", 1)
        vm.setReps(nil, "dead-bug", 0)
        XCTAssertFalse(vm.actual().completed, "an omitted exercise")
    }

    /// SSCTR recheck of 296696a: a withdrawn set drops its load; stated again, it never re-sends the load typed before.
    func testWithdrawingASetClearsItsLoad() throws {
        let vm = viewModel(try session, FixtureCoachingWriter(store: Repo.store))
        let squat = try exercise(vm, "goblet-squat")
        vm.toggleSet(squat, 0)
        vm.setLoad("20", "goblet-squat", 0)
        vm.toggleSet(squat, 0)
        XCTAssertEqual(vm.draft("goblet-squat", 0), StrengthLogViewModel.SetDraft(), "unchecked: no reps, no load")
        vm.toggleSet(squat, 0)
        XCTAssertEqual(vm.actual().exercises, [LoggedExerciseEntry(id: "goblet-squat", sets: [LoggedSetEntry(reps: 8, load: nil, rir: nil)])])
        vm.setLoad("22", "goblet-squat", 0)
        vm.setReps(0, "goblet-squat", 0)
        XCTAssertEqual(vm.draft("goblet-squat", 0), StrengthLogViewModel.SetDraft(), "stepper to 0: no reps, no load")
        vm.setReps(6, "goblet-squat", 0)
        XCTAssertNil(vm.actual().exercises.first?.sets.first?.load)
    }

    /// SSCTR #37b F2: confirm first, then edit. Once any set is stated, "Fiz como prescrito" is no longer offered and cannot overwrite it.
    func testConfirmAsPrescribedNeverOverwritesAStatedSet() throws {
        let vm = viewModel(try session, FixtureCoachingWriter(store: Repo.store))
        vm.setReps(5, "goblet-squat", 0)
        XCTAssertFalse(vm.canConfirmAsPrescribed)
        vm.confirmAsPrescribed()
        XCTAssertEqual(vm.draft("goblet-squat", 0)?.reps, 5)
        XCTAssertEqual(vm.statedSetCount, 1)
        vm.setReps(nil, "goblet-squat", 0)
        XCTAssertTrue(vm.canConfirmAsPrescribed, "offered again once nothing is stated")
    }

    /// SSCTR #37b F7: a planned session presented without exercises has nothing to state; it fails closed (never sendable on minutes alone).
    func testPlannedSessionWithoutExercisesIsNotSendable() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = viewModel(try session { $0 = [] }, w)
        XCTAssertNotNil(vm.session)
        XCTAssertTrue(vm.exercises.isEmpty)
        vm.minutes = 30
        XCTAssertFalse(vm.canSend)
        XCTAssertFalse(vm.completed)
        await vm.send()
        XCTAssertTrue(submits(w).isEmpty)
    }

    func testUnconfirmedSetsAndExercisesAreAbsent() throws {
        let vm = viewModel(try session, FixtureCoachingWriter(store: Repo.store))
        vm.toggleSet(try exercise(vm, "goblet-squat"), 0)
        vm.setReps(5, "db-row", 1)
        vm.setLoad("20", "db-bench-press", 0)  // a load never states a set (SSCTR #37b F4): ignored on an unstated set
        XCTAssertEqual(vm.draft("db-bench-press", 0), StrengthLogViewModel.SetDraft())
        let a = vm.actual()
        XCTAssertEqual(a.exercises, [LoggedExerciseEntry(id: "goblet-squat", sets: [LoggedSetEntry(reps: 8, load: nil, rir: nil)]),
                                     LoggedExerciseEntry(id: "db-row", sets: [LoggedSetEntry(reps: 5, load: nil, rir: nil)])])
        XCTAssertFalse(a.completed, "a partial log is never completed")
        vm.minutes = 20
        XCTAssertTrue(vm.canSend, "a partial log can be sent")
        // The check withdraws a stated set; zero repetitions withdraws it too.
        vm.toggleSet(try exercise(vm, "goblet-squat"), 0)
        vm.setReps(0, "db-row", 1)
        XCTAssertEqual(vm.actual().exercises, [])
        XCTAssertFalse(vm.canSend)
    }

    /// The same session with its presented exercises edited (the shared type allows `reps: nil` and an empty list).
    private func session(_ edit: (inout [[String: Any]]) -> Void) throws -> PlannedSession {
        let view = try XCTUnwrap(try Repo.store.object("02-plan-w0")["view"] as? [String: Any])
        var s = try XCTUnwrap(((view["week"] as? [String: Any])?["sessions"] as? [[String: Any]])?.first { $0["id"] as? String == "w0-str-d2" })
        var p = try XCTUnwrap(s["prescription"] as? [String: Any])
        var exercises = try XCTUnwrap(p["exercises"] as? [[String: Any]])
        edit(&exercises)
        p["exercises"] = exercises
        s["prescription"] = p
        return try JSONDecoder().decode(PlannedSession.self, from: JSONSerialization.data(withJSONObject: s))
    }
    private func session(withoutRepsOn id: String) throws -> PlannedSession {
        try session { $0 = $0.map { e in var e = e; if e["id"] as? String == id { e.removeValue(forKey: "reps") }; return e } }
    }

    func testNoPrescribedRepsIsNeverInvented() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = viewModel(try session(withoutRepsOn: "db-row"), w)
        let row = try exercise(vm, "db-row")
        XCTAssertNil(row.reps, "premise")
        XCTAssertFalse(vm.canConfirmAsPrescribed, "'Fiz como prescrito' cannot state a count the prescription does not give")
        XCTAssertFalse(vm.canToggle(row, 0))
        vm.toggleSet(row, 0)
        XCTAssertNil(vm.draft("db-row", 0)?.reps, "never 0, never a guess")
        vm.setReps(7, "db-row", 0)
        XCTAssertEqual(vm.actual().exercises, [LoggedExerciseEntry(id: "db-row", sets: [LoggedSetEntry(reps: 7, load: nil, rir: nil)])])
        XCTAssertTrue(vm.canToggle(row, 0), "a stated set can be withdrawn")
        // Loads: only a typed number is a load; bodyweight rows carry none.
        XCTAssertNil(StrengthLogViewModel.loggedLoad("", for: row))
        XCTAssertNil(StrengthLogViewModel.loggedLoad("abc", for: row))
        XCTAssertNil(StrengthLogViewModel.loggedLoad("10", for: try exercise(vm, "dead-bug")))
    }

    func testDoubleTapSendsOnce() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let vm = viewModel(try session, w)
        vm.minutes = 30
        vm.confirmAsPrescribed()
        async let first: Void = vm.send()
        async let second: Void = vm.send()
        _ = await (first, second)
        await vm.send()
        XCTAssertEqual(submits(w).count, 1)
        XCTAssertEqual(vm.phase, .saved)
        XCTAssertFalse(vm.editable, "a kept report is not edited or resent")
        vm.setReps(1, "goblet-squat", 0)
        XCTAssertEqual(vm.draft("goblet-squat", 0)?.reps, 8)
    }

    func testOutcomeMapping() throws {
        let ok = try Repo.store.decode(BoundaryAnswer.self, "09-logStrength")
        let id = try XCTUnwrap(ok.recorded?.first)
        XCTAssertEqual(StrengthLogViewModel.phase(for: WriteOutcome(answer: ok, kept: [id], notKept: [])), .saved)
        XCTAssertEqual(StrengthLogViewModel.phase(for: WriteOutcome(answer: ok, kept: [], notKept: [id])), .notKept, "saved only when kept (GAP-12)")
        XCTAssertEqual(StrengthLogViewModel.phase(for: WriteOutcome(answer: FixtureCoachingWriter.unavailable, kept: [], notKept: [])), .failed("FIXTURE_UNAVAILABLE"))
    }

    func testNotKeptAndFailedReportsStayEditableAndResendable() async throws {
        let ok = try Repo.store.decode(BoundaryAnswer.self, "09-logStrength")
        let id = try XCTUnwrap(ok.recorded?.first)
        let w = ScriptedWriter([WriteOutcome(answer: ok, kept: [], notKept: [id]), WriteOutcome(answer: FixtureCoachingWriter.unavailable, kept: [], notKept: []),
                                WriteOutcome(answer: ok, kept: [id], notKept: [])])
        let vm = StrengthLogViewModel(session: try session, writer: w, planToday: { "2026-11-22" }, holdGuidance: { nil })
        vm.eligibility = .testNoneApplies
        vm.minutes = 30
        vm.confirmAsPrescribed()
        await vm.send()
        XCTAssertEqual(vm.phase, .notKept)
        XCTAssertTrue(vm.editable && vm.canSend, "the draft stays and can be sent again")
        vm.setReps(6, "db-row", 0)
        await vm.send()
        XCTAssertEqual(vm.phase, .failed("FIXTURE_UNAVAILABLE"))
        XCTAssertTrue(vm.canSend)
        await vm.send()
        XCTAssertEqual(vm.phase, .saved)
        XCTAssertEqual(w.sent.count, 3)
        guard case .sessionReports(let reports) = try XCTUnwrap(w.sent.last).body, case .strength(let a) = try XCTUnwrap(reports.first).actual else {
            return XCTFail("a planned strength report")
        }
        XCTAssertEqual(a.exercises.first { $0.id == "db-row" }?.sets.map(\.reps), [6, 8], "the resend carries the edit")
    }

    // MARK: request shape (RequestShapeTests style)

    private func encoded(_ v: some Encodable) throws -> [String: Any] {
        let e = JSONEncoder(); e.outputFormatting = .sortedKeys
        return try XCTUnwrap(try JSONSerialization.jsonObject(with: e.encode(v)) as? [String: Any])
    }

    func testPlannedPartialReportCarriesOnlyStatedKeys() throws {
        let vm = viewModel(try session, FixtureCoachingWriter(store: Repo.store))
        vm.minutes = 25
        vm.toggleSet(try exercise(vm, "db-bench-press"), 0)
        vm.setLoad("12", "db-bench-press", 0)
        vm.toggleSet(try exercise(vm, "dead-bug"), 0)
        let review = try encoded(ReviewRequest(.sessionReports([vm.observation()]), eligibility: nil))
        let o = try XCTUnwrap((review["observations"] as? [[String: Any]])?.first)
        XCTAssertEqual(Set(o.keys), ["sessionId", "occurrenceDate", "observedAt", "actual", "response"])
        XCTAssertEqual(o["sessionId"] as? String, "w0-str-d2")
        let actual = try XCTUnwrap(o["actual"] as? [String: Any])
        XCTAssertEqual(Set(actual.keys), ["completed", "minutes", "exercises"])
        XCTAssertEqual(actual["completed"] as? Bool, false)
        XCTAssertNil(actual["sport"], "a planned report is read by its session")
        let exercises = try XCTUnwrap(actual["exercises"] as? [[String: Any]])
        XCTAssertEqual(exercises.map { $0["id"] as? String }, ["db-bench-press", "dead-bug"])
        let bench = try XCTUnwrap((exercises[0]["sets"] as? [[String: Any]])?.first)
        XCTAssertEqual(Set(bench.keys), ["reps", "load"], "no RIR is stated")
        XCTAssertEqual(bench["reps"] as? Int, 8)
        XCTAssertEqual(bench["load"] as? [String: AnyHashable], ["value": 12.0, "unit": "KG", "convention": "PER_HAND"])
        let bug = try XCTUnwrap((exercises[1]["sets"] as? [[String: Any]])?.first)
        XCTAssertEqual(Set(bug.keys), ["reps"], "bodyweight: no load")
    }

    func testUnplannedReportHasSportObservedAtAndNoExercises() throws {
        let vm = viewModel(nil, FixtureCoachingWriter(store: Repo.store))
        XCTAssertFalse(vm.canSend, "minutes are the athlete's, never defaulted")
        vm.minutes = 35
        XCTAssertTrue(vm.canSend)
        let o = try encoded(vm.observation())
        XCTAssertNil(o["sessionId"])
        XCTAssertEqual(o["occurrenceDate"] as? String, "2026-11-22")
        XCTAssertNotNil(o["observedAt"], "FND-ABC-01: required for an unplanned report")
        let a = try XCTUnwrap(o["actual"] as? [String: Any])
        XCTAssertEqual(Set(a.keys), ["sport", "completed", "minutes", "exercises"])
        XCTAssertEqual(a["sport"] as? String, "STRENGTH")
        XCTAssertEqual(a["completed"] as? Bool, true)
        XCTAssertEqual((a["exercises"] as? [Any])?.count, 0)
    }
}

/// A writer that answers `submit` with the given outcomes in order (kept / not kept / error through the real `send()`); every other
/// write is an honest failure. `@unchecked Sendable`: test-only, its state is guarded by the lock.
private final class ScriptedWriter: CoachingWriting, @unchecked Sendable {
    private let lock = NSLock()
    private var outcomes: [WriteOutcome]
    private var requests: [ReviewRequest] = []
    init(_ outcomes: [WriteOutcome]) { self.outcomes = outcomes }
    var sent: [ReviewRequest] { lock.withLock { requests } }
    private var none: WriteOutcome { WriteOutcome(answer: FixtureCoachingWriter.unavailable, kept: [], notKept: []) }

    func submit(_ review: ReviewRequest) async -> WriteOutcome {
        lock.withLock { requests.append(review); return outcomes.isEmpty ? none : outcomes.removeFirst() }
    }
    func onboard(_ answers: OnboardingAnswers, consents: Consents) async -> WriteOutcome { none }
    func restart(_ answers: OnboardingAnswers) async -> WriteOutcome { none }
    func accept(decisionId: String) async -> WriteOutcome { none }
    func decline(decisionId: String) async -> WriteOutcome { none }
    func setHeartRateProfile(_ profile: HeartRateProfileRequest) async -> Result<HeartRateProfileAnswer, BoundaryError> { .failure(BoundaryError(code: "UNUSED")) }
    func eraseHeartRateProfile() async -> Result<HeartRateProfileAnswer, BoundaryError> { .failure(BoundaryError(code: "UNUSED")) }
    func setConsent(_ purpose: ConsentPurpose, granted: Bool) async -> WriteOutcome { none }
    func eraseHealthFacts(eventIds: [String]) async -> WriteOutcome { none }
    func eraseAccount() async -> WriteOutcome { none }
    func acknowledgeRecordLoss() async -> WriteOutcome { none }
}
