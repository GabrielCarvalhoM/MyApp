import CoachingPresentation
import Foundation
@testable import RepMileUI

/// The fixture reader of a scenario whose presentation and logged entries can change between reads: a write the engine recorded changes
/// what the next `AppModel.load()` reads (#58). The captures are still the engine's; only which one answers changes.
final class SwitchableReader: CoachingReading, @unchecked Sendable {
    private let base: FixtureCoachingReader
    private let lock = NSLock()
    private var presentationName: String
    private var loggedName: String
    private var reads = 0
    /// The plan's today the next `plan` reads give (the plan's midnight passing), nil for the scenario's own.
    private var planToday: String?

    init(scenario: Scenario = .today, presentation: String, logged: String) {
        base = FixtureCoachingReader(scenario: scenario, store: Repo.store); presentationName = presentation; loggedName = logged
    }

    func switchTo(presentation: String? = nil, logged: String? = nil, planToday: String? = nil) {
        lock.withLock { if let presentation { presentationName = presentation }; if let logged { loggedName = logged }; if let planToday { self.planToday = planToday } }
    }
    /// How many times the presentation was read (one per `AppModel.load()`).
    var loads: Int { lock.withLock { reads } }

    func presentation() async -> Result<PresentationSnapshot, BoundaryError> {
        let name = lock.withLock { reads += 1; return presentationName }
        do { return .success(try Repo.store.decode(PresentationSnapshot.self, name)) } catch { return .failure(BoundaryError(code: "FIXTURE_UNREADABLE")) }
    }
    func loggedEntries() async -> Result<LoggedEntries, BoundaryError> {
        let name = lock.withLock { loggedName }
        do { return .success(try Repo.store.decode(LoggedEntries.self, name)) } catch { return .failure(BoundaryError(code: "FIXTURE_UNREADABLE")) }
    }
    func plan(week: Int?) async -> Result<PlanView, BoundaryError> {
        guard let day = lock.withLock({ planToday }) else { return await base.plan(week: week) }
        var view = (try? Repo.store.object("13-plan-w1")["view"] as? [String: Any]) ?? [:]
        view["today"] = day
        do { return .success(try JSONDecoder().decode(PlanView.self, from: JSONSerialization.data(withJSONObject: view))) }
        catch { return .failure(BoundaryError(code: "FIXTURE_UNREADABLE")) }
    }
    func allWeeks() async -> Result<[Week], BoundaryError> { await base.allWeeks() }
    func history() async -> Result<HistoryView, BoundaryError> { await base.history() }
    func decision(id: String) async -> Result<DecisionDetail, BoundaryError> { await base.decision(id: id) }
    func weekPlan() async -> Result<WeekPlanProjection, BoundaryError> { await base.weekPlan() }
    func warningSignSet(condition: String) async -> Result<WarningSignQuestionSet, BoundaryError> { await base.warningSignSet(condition: condition) }
    func startability(sessionId: String) async -> Startability { await base.startability(sessionId: sessionId) }
    func pendingReports() async -> PendingReports { await base.pendingReports() }
}

/// The fixture writer, telling `recorded` which call the engine answered `ok` (the test then switches what the reader returns). The first
/// `consentFailures` consent writes are refused.
final class RecordingWriter: CoachingWriting, @unchecked Sendable {
    let base = FixtureCoachingWriter(store: Repo.store)
    private let recorded: @Sendable (String) -> Void
    private let lock = NSLock()
    private var consentFailures: Int

    init(consentFailures: Int = 0, recorded: @escaping @Sendable (String) -> Void = { _ in }) {
        self.consentFailures = consentFailures; self.recorded = recorded
    }

    private func note(_ call: String, _ ok: Bool) { if ok { recorded(call) } }

    func submit(_ review: ReviewRequest) async -> WriteOutcome { let o = await base.submit(review); note("submit", o.answer.ok); return o }
    func setHeartRateProfile(_ profile: HeartRateProfileRequest) async -> Result<HeartRateProfileAnswer, BoundaryError> {
        let r = await base.setHeartRateProfile(profile); note("setHeartRateProfile", (try? r.get())?.ok == true); return r
    }
    func eraseHeartRateProfile() async -> Result<HeartRateProfileAnswer, BoundaryError> {
        let r = await base.eraseHeartRateProfile(); note("eraseHeartRateProfile", (try? r.get())?.ok == true); return r
    }
    func setConsent(_ purpose: ConsentPurpose, granted: Bool) async -> WriteOutcome {
        let o = await base.setConsent(purpose, granted: granted)
        let refuse = lock.withLock { () -> Bool in defer { consentFailures = max(0, consentFailures - 1) }; return consentFailures > 0 }
        if refuse { return WriteOutcome(answer: FixtureCoachingWriter.unavailable, kept: [], notKept: []) }
        note("setConsent", o.answer.ok); return o
    }
    func onboard(_ answers: OnboardingAnswers, consents: Consents) async -> WriteOutcome { await base.onboard(answers, consents: consents) }
    func restart(_ answers: OnboardingAnswers) async -> WriteOutcome { await base.restart(answers) }
    func accept(decisionId: String) async -> WriteOutcome { await base.accept(decisionId: decisionId) }
    func decline(decisionId: String) async -> WriteOutcome { await base.decline(decisionId: decisionId) }
    func eraseHealthFacts(eventIds: [String]) async -> WriteOutcome { await base.eraseHealthFacts(eventIds: eventIds) }
    func eraseAccount() async -> WriteOutcome { await base.eraseAccount() }
    func acknowledgeRecordLoss() async -> WriteOutcome { await base.acknowledgeRecordLoss() }
}

enum Reread {
    @MainActor
    static func model(_ reader: SwitchableReader, _ writer: CoachingWriting) -> AppModel {
        AppModel(reader: reader, writer: writer, health: FixtureHealthIngestStatus(queued: 0), athleteName: "Teste")
    }

    /// A captured logged entry with its ATHLETE voice removed: what the record holds for a linked device run the athlete never reported (#59).
    static func deviceOnly(_ name: String, sessionId: String = "w0-run-d1") throws -> LoggedEntry {
        try edited(name, sessionId: sessionId) { e in
            e["voices"] = (e["voices"] as? [[String: Any]] ?? []).filter { $0["channel"] as? String != "ATHLETE" }
            e["channels"] = ["DEVICE"]
            e["conflicted"] = false
        }
    }

    /// A captured logged entry, edited as raw JSON before decoding (shapes the record can hold that no capture has).
    static func edited(_ name: String, sessionId: String = "w0-run-d1", _ edit: (inout [String: Any]) -> Void) throws -> LoggedEntry {
        let obj = try Repo.store.object(name)
        guard var e = (obj["entries"] as? [[String: Any]])?.first(where: { $0["sessionId"] as? String == sessionId }) else {
            throw NSError(domain: "Reread", code: 1, userInfo: [NSLocalizedDescriptionKey: "no \(sessionId) in \(name)"])
        }
        edit(&e)
        return try JSONDecoder().decode(LoggedEntry.self, from: JSONSerialization.data(withJSONObject: e))
    }
}
