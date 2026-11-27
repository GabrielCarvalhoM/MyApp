import CoachingPresentation
import Foundation
@testable import RepMileUI

/// Helpers for the safety view-model tests (#32 increment 3).
enum Safety {
    /// A store with no capture: every read fails (`FIXTURE_UNREADABLE`) and every write is the honest `FIXTURE_UNAVAILABLE`.
    static let emptyStore = FixtureStore(directory: URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("repmile-no-fixtures-\(UUID().uuidString)"))

    static func reader(_ store: FixtureStore = Repo.store) -> FixtureCoachingReader { FixtureCoachingReader(scenario: .blocked, store: store) }

    static func set(_ condition: String) throws -> WarningSignQuestionSet {
        struct Sets: Decodable { let sets: [WarningSignQuestionSet] }
        guard let s = try Repo.store.decode(Sets.self, "P-warning-sign-sets").sets.first(where: { $0.condition == condition }) else {
            throw NSError(domain: "Safety", code: 1, userInfo: [NSLocalizedDescriptionKey: "no set for \(condition)"])
        }
        return s
    }

    static func answer(_ json: String) throws -> BoundaryAnswer { try JSONDecoder().decode(BoundaryAnswer.self, from: Data(json.utf8)) }

    /// The submitted requests, decoded as JSON objects, in order.
    static func submits(_ journal: RequestJournal) throws -> [[String: Any]] {
        try journal.entries.filter { $0.call == "submit" }.map { try object($0.json) }
    }

    private static func object(_ d: Data) throws -> [String: Any] {
        guard let o = try JSONSerialization.jsonObject(with: d) as? [String: Any] else { throw NSError(domain: "Safety", code: 2) }
        return o
    }
}

/// A writer whose `submit` answers one given answer (or, with `then`, the next answers in order, the last repeated), after an optional
/// delay (a request still in flight), and records every call.
final class ScriptedSubmitWriter: CoachingWriting, @unchecked Sendable {
    let answer: BoundaryAnswer
    let delay: Duration
    let journal = RequestJournal()
    private let lock = NSLock()
    private var next: [BoundaryAnswer]

    init(_ answer: BoundaryAnswer, then next: [BoundaryAnswer] = [], delay: Duration = .zero) { self.answer = answer; self.next = next; self.delay = delay }
    private var served = false

    private var none: WriteOutcome { WriteOutcome(answer: FixtureCoachingWriter.unavailable, kept: [], notKept: []) }

    func submit(_ review: ReviewRequest) async -> WriteOutcome {
        journal.add("submit", review)
        if delay > .zero { try? await Task.sleep(for: delay) }
        let a: BoundaryAnswer = lock.withLock {
            guard served, !next.isEmpty else { served = true; return answer }
            return next.count > 1 ? next.removeFirst() : next[0]
        }
        return WriteOutcome(answer: a, kept: [], notKept: [])
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

/// The fixture reader with a delay per condition on `warningSignSet` (reads resolving out of order), counting its sign-set reads.
final class DelayedSignReader: CoachingReading {
    let base: FixtureCoachingReader
    let delays: [String: Duration]
    let journal = RequestJournal()

    init(delays: [String: Duration], base: FixtureCoachingReader = Safety.reader()) { self.base = base; self.delays = delays }

    func warningSignSet(condition: String) async -> Result<WarningSignQuestionSet, BoundaryError> {
        journal.add("warningSignSet", [condition])
        if let d = delays[condition] { try? await Task.sleep(for: d) }
        return await base.warningSignSet(condition: condition)
    }
    func plan(week: Int?) async -> Result<PlanView, BoundaryError> { await base.plan(week: week) }
    func allWeeks() async -> Result<[Week], BoundaryError> { await base.allWeeks() }
    func presentation() async -> Result<PresentationSnapshot, BoundaryError> { await base.presentation() }
    func history() async -> Result<HistoryView, BoundaryError> { await base.history() }
    func decision(id: String) async -> Result<DecisionDetail, BoundaryError> { await base.decision(id: id) }
    func loggedEntries() async -> Result<LoggedEntries, BoundaryError> { await base.loggedEntries() }
    func weekPlan() async -> Result<WeekPlanProjection, BoundaryError> { await base.weekPlan() }
    func startability(sessionId: String) async -> Startability { await base.startability(sessionId: sessionId) }
    func pendingReports() async -> PendingReports { await base.pendingReports() }
}
