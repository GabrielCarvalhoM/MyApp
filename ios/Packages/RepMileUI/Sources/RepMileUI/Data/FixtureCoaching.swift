import CoachingPresentation
import Foundation
import IntegrationContracts

/// Front C's parallel-phase reader: implements the shared `CoachingReading` port by replaying the scenario's captures. Replaced by front A's
/// CoachingHost at integration; the screens do not change.
public final class FixtureCoachingReader: CoachingReading {
    public let scenario: Scenario
    let store: FixtureStore

    public init(scenario: Scenario, store: FixtureStore) { self.scenario = scenario; self.store = store }

    private func read<T: Decodable>(_ r: Scenario.Read, key: String, as: T.Type) -> Result<T, BoundaryError> {
        switch r {
        case .file(let name):
            do { return .success(try store.decode(T.self, name, at: key)) } catch {
                return .failure(BoundaryError(code: "FIXTURE_UNREADABLE", field: name))
            }
        case .failure(let name):
            return .failure((try? store.error(name)) ?? BoundaryError(code: "FIXTURE_UNREADABLE", field: name))
        case .hostFailure(let code):
            return .failure(BoundaryError(code: Code(raw: code)))
        }
    }

    public func plan(week: Int?) async -> Result<PlanView, BoundaryError> {
        let current = read(scenario.plan, key: "view", as: PlanView.self)
        guard let week, case .success(let v) = current, v.week?.index != week else { return current }
        // Another week: the plan view of the current week with that week's sessions, as `allWeeks` holds them (no rewrite of any field).
        return current
    }
    public func allWeeks() async -> Result<[Week], BoundaryError> { read(scenario.allWeeks, key: "weeks", as: [Week].self) }
    public func presentation() async -> Result<PresentationSnapshot, BoundaryError> {
        switch scenario.presentation {
        case .file(let name):
            do { return .success(try store.decode(PresentationSnapshot.self, name)) } catch { return .failure(BoundaryError(code: "FIXTURE_UNREADABLE", field: name)) }
        default: return read(scenario.presentation, key: "", as: PresentationSnapshot.self)
        }
    }
    public func history() async -> Result<HistoryView, BoundaryError> { read(scenario.history, key: "history", as: HistoryView.self) }
    public func decision(id: String) async -> Result<DecisionDetail, BoundaryError> { read(.file("21-decision"), key: "decision", as: DecisionDetail.self) }
    public func loggedEntries() async -> Result<LoggedEntries, BoundaryError> {
        switch scenario.logged {
        case .file(let name):
            do { return .success(try store.decode(LoggedEntries.self, name)) } catch { return .failure(BoundaryError(code: "FIXTURE_UNREADABLE", field: name)) }
        default: return read(scenario.logged, key: "", as: LoggedEntries.self)
        }
    }
    public func weekPlan() async -> Result<WeekPlanProjection, BoundaryError> {
        switch scenario.weekPlan {
        case .file(let name):
            do { return .success(try store.decode(WeekPlanProjection.self, name)) } catch { return .failure(BoundaryError(code: "FIXTURE_UNREADABLE", field: name)) }
        default: return read(scenario.weekPlan, key: "", as: WeekPlanProjection.self)
        }
    }
    public func warningSignSet(condition: String) async -> Result<WarningSignQuestionSet, BoundaryError> {
        struct Sets: Decodable { let sets: [WarningSignQuestionSet] }
        guard let sets = try? store.decode(Sets.self, "P-warning-sign-sets").sets else { return .failure(BoundaryError(code: "FIXTURE_UNREADABLE")) }
        guard let set = sets.first(where: { $0.condition == condition }) else { return .failure(BoundaryError(code: "UNKNOWN_CONDITION", field: condition)) }
        return .success(set)
    }
    public func startability(sessionId: String) async -> Startability {
        guard case .success(let view) = await plan(week: nil) else { return .notStartable(reason: .recordUnavailable) }
        return scenario.startability(of: view.week?.sessions.first { $0.id == sessionId })
    }
    public func pendingReports() async -> PendingReports {
        PendingReports(count: scenario.pendingReports, oldestQueuedAt: scenario.pendingReports > 0 ? Date(timeIntervalSince1970: 1_795_600_000) : nil)
    }
}

/// Front C's parallel-phase writer: answers each closed request with the capture the engine gave for the same intent. `kept` is computed the
/// way A will (the logged-entries projection that followed the answer, `LoggedEntries.keeps`), never from `recorded` (GAP-12).
public final class FixtureCoachingWriter: CoachingWriting {
    let store: FixtureStore
    /// Every request the UI produced, encoded, in order: the evidence for the request-shape tests (handoff C §8.6).
    public let journal = RequestJournal()

    public init(store: FixtureStore) { self.store = store }

    private func answer(_ name: String, keptBy logged: String? = nil) -> WriteOutcome {
        guard let a = try? store.decode(BoundaryAnswer.self, name) else {
            return WriteOutcome(answer: Self.unavailable, kept: [], notKept: [])
        }
        let recorded = a.recorded ?? []
        guard let logged, let entries = try? store.decode(LoggedEntries.self, logged) else { return WriteOutcome(answer: a, kept: [], notKept: recorded) }
        return WriteOutcome(answer: a, kept: recorded.filter(entries.keeps), notKept: recorded.filter { !entries.keeps($0) })
    }
    /// No capture exists for this intent: an honest failure (the UI shows the operational-error state), never an invented answer.
    static let unavailable: BoundaryAnswer = {
        let json = #"{"ok":false,"error":{"code":"FIXTURE_UNAVAILABLE"},"state":"OPERATIONAL_ERROR"}"#
        return try! JSONDecoder().decode(BoundaryAnswer.self, from: Data(json.utf8))
    }()

    /// CCP-ONB-1 (QRE P3, PR #121): a held intake (`OnboardingAnswers.hold`) is answered as the real host answers it — INVALID_REQUEST, nothing
    /// sent (the host cannot encode it) — so a screen that forgot to check `hold` first fails the same way here as on the device.
    static let invalidRequest: BoundaryAnswer = {
        let json = #"{"ok":false,"error":{"code":"INVALID_REQUEST","message":"The request could not be encoded"},"state":"OPERATIONAL_ERROR"}"#
        return try! JSONDecoder().decode(BoundaryAnswer.self, from: Data(json.utf8))
    }()
    /// Held intake, then clinical flag (no capture exists for one: an honest failure, never a plan), for enrolment and restart alike.
    private func refusal(_ answers: OnboardingAnswers) -> WriteOutcome? {
        if answers.hold != nil { return WriteOutcome(answer: Self.invalidRequest, kept: [], notKept: []) }
        if answers.athlete.eligibility.statesAClinicalFlag { return WriteOutcome(answer: Self.unavailable, kept: [], notKept: []) }
        return nil
    }

    public func onboard(_ answers: OnboardingAnswers, consents: Consents) async -> WriteOutcome {
        journal.add("onboard", answers)
        if let r = refusal(answers) { return r }
        let special = answers.athlete.specialPopulation
        if special.contains(.pregnancy) { return answer("special-pregnancy-onboard") }
        if special.contains(.postpartum) { return answer("special-postpartum-onboard") }
        return answer("special-none-onboard")
    }
    public func restart(_ answers: OnboardingAnswers) async -> WriteOutcome {
        journal.add("restart", answers)
        if let r = refusal(answers) { return r }
        let special = answers.athlete.specialPopulation
        if special.contains(.pregnancy) { return answer("special-pregnancy-onboard") }
        if special.contains(.postpartum) { return answer("special-postpartum-onboard") }
        return answer("special-none-onboard")
    }
    public func submit(_ review: ReviewRequest) async -> WriteOutcome {
        journal.add("submit", review)
        switch review.body {
        case .sessionReports(let reports):
            if let gate = screenGate(review) { return gate }
            guard let first = reports.first else { return answer("11-weekly-review-w0") }
            switch first.actual {
            case .plannedRun(let a):
                if a.stop?.reason == .symptom { return answer("actions-C1-run-stop-symptom", keptBy: "P-logged-conflict") }
                if !a.completed || a.minutes == nil { return answer("actions-C3-run-partial-time") }
                return answer("07-athlete-run-form", keptBy: "P-logged-two-voices")
            case .strength: return answer("09-logStrength", keptBy: "P-logged-after-w0")
            case .unplannedRun: return answer(first.observedAt == nil ? "unplanned-1-run-no-observedAt" : "unplanned-3-run-observedAt", keptBy: "P-logged-unplanned")
            case .unplannedStrength: return answer(first.observedAt == nil ? "unplanned-2-strength-no-observedAt" : "unplanned-6-strength-observedAt", keptBy: "P-logged-unplanned")
            }
        case .missedSession: return answer("10-logRun-missed")
        case .notFeeling100(let w, _):
            if let gate = screenGate(review) { return gate }
            if let urgent = urgentCapture("nf-urgent-", w.warningSigns.yes) { return answer(urgent) }
            if !w.warningSigns.yes.isEmpty { return answer("actions-F1-notFeeling100-sign") }
            if !w.warningSigns.unanswered.isEmpty { return answer("actions-D3-notFeeling100-no-screen") }
            return answer("actions-D1-notFeeling100-no-sign")
        case .wellbeingCheck: return answer("actions-D1-notFeeling100-no-sign")
        case .readiness(let r, _):
            if let gate = screenGate(review, missing: "actions-E2-break-clinical") { return gate }
            if let urgent = urgentCapture("readiness-urgent-", r.warningSigns.yes) { return answer(urgent) }
            // A sign "sim" keeps the hold (the engine's answer, captured): never the restart of a declaration with every sign "não".
            return answer(r.warningSigns.yes.isEmpty ? "18-declareReadiness" : "readiness-sign-gettingWorse")
        case .reportBreak(let b): return answer(b.nonclinical ? "actions-E1-break-nonclinical" : "actions-E2-break-clinical")
        case .unavailableDays: return screenGate(review) ?? answer("actions-B1-unavailable-day")
        case .preferences: return answer(review.eligibility == nil ? "14-setPreferences" : "actions-B3-preferences-with-screen")
        case .coach: return answer("14-setPreferences")
        case .exerciseSubstitution(let s):
            if s.pain == true { return answer("actions-A3-substitution-pain") }
            return answer(s.reason == .nonclinicalDiscomfortOrPreference ? "actions-A2-substitution-valid-reason" : "actions-A1-substitution-preference")
        }
    }
    /// The engine records no athlete report without a current screen sent with it (#68; the fixtures once hid this): a report without an
    /// answered, dated screen gets the engine's captured ASK for a review without one (`14-setPreferences`: eligibility.currentAssessment,
    /// nothing recorded), and a flag answered yes the captured clinical route (`actions-E2-break-clinical`: nothing recorded, plan BLOCKED).
    /// The 14-day window is the engine's; fixture mode only refuses what is missing. A yes with a symptom stop also raises the warning-sign
    /// screen in the engine (replay 7b); no capture holds both, so fixture mode shows the clinical route alone (the app's handling of both is
    /// unit-tested from a scripted answer).
    /// #72: "Não estou 100%", the readiness declaration and the unavailable day pass the same gate first, as in the engine (the screen is read
    /// before the signs: a red-flag sign without it gets ASK, replay i72). A readiness declaration without it is answered CLINICAL_HUMAN_REQUIRED
    /// by the engine (the hold stands, `eligibility.currentAssessment` missing); no capture holds that exact answer, so fixture mode answers
    /// it with the captured clinical route (`missing`), which the readiness screen reads the same way (the hold stands).
    private func screenGate(_ review: ReviewRequest, missing: String = "14-setPreferences") -> WriteOutcome? {
        guard let e = review.eligibility, e.answered, !e.assessedAt.isEmpty else { return answer(missing) }
        return e.statesAClinicalFlag ? answer("actions-E2-break-clinical") : nil
    }
    /// #73: the engine's answer for a sign "sim" at the URGENT_CARE_ADVISED level, captured per sign (`Captures/`, the real engine). The
    /// engine gives the higher level when several signs are "sim" (`guidanceOf`), so the capture of any "sim" sign that has one answers;
    /// which signs are urgent is never listed here, only read from which captures exist.
    private func urgentCapture(_ prefix: String, _ yes: [String]) -> String? { yes.lazy.map { prefix + $0 }.first(where: store.has) }

    public func accept(decisionId: String) async -> WriteOutcome { journal.add("accept", ["decisionId": decisionId]); return answer("actions-B2-accept-unavailable") }
    public func decline(decisionId: String) async -> WriteOutcome { journal.add("decline", ["decisionId": decisionId]); return WriteOutcome(answer: Self.unavailable, kept: [], notKept: []) }
    public func setHeartRateProfile(_ profile: HeartRateProfileRequest) async -> Result<HeartRateProfileAnswer, BoundaryError> {
        journal.add("setHeartRateProfile", profile)
        if let z = profile.zoneUpperBpm, let limits = z, zip(limits, limits.dropFirst()).contains(where: { $0 >= $1 }) {
            return .failure((try? store.error("hr5r-invalid-answer")) ?? BoundaryError(code: "INVALID_REQUEST"))
        }
        guard let a = try? store.decode(HeartRateProfileAnswer.self, "hr5r-declared-answer") else { return .failure(BoundaryError(code: "FIXTURE_UNREADABLE")) }
        return .success(a)
    }
    public func eraseHeartRateProfile() async -> Result<HeartRateProfileAnswer, BoundaryError> {
        journal.add("eraseHeartRateProfile", [String: String]())
        guard let a = try? store.decode(HeartRateProfileAnswer.self, "hr5r-erase-answer") else { return .failure(BoundaryError(code: "FIXTURE_UNREADABLE")) }
        return .success(a)
    }
    public func setConsent(_ purpose: ConsentPurpose, granted: Bool) async -> WriteOutcome {
        journal.add("setConsent", [purpose.rawValue: granted])
        return answer(granted ? "hr5r-consent-granted" : "hr5r-consent-revoked")
    }
    public func eraseHealthFacts(eventIds: [String]) async -> WriteOutcome { journal.add("eraseHealthFacts", eventIds); return answer("actions-F2-eraseHealthFacts") }
    public func eraseAccount() async -> WriteOutcome { journal.add("eraseAccount", [String]()); return answer("actions-F4-eraseAccount") }
    public func acknowledgeRecordLoss() async -> WriteOutcome { journal.add("acknowledgeRecordLoss", [String]()); return WriteOutcome(answer: Self.unavailable, kept: [], notKept: []) }
}

/// The encoded requests the UI sent (sorted keys), for the request-shape tests. In memory only: no health data reaches a log (§10.9).
public final class RequestJournal: @unchecked Sendable {
    private let lock = NSLock()
    private var items: [(String, Data)] = []
    func add(_ call: String, _ value: some Encodable) {
        let e = JSONEncoder(); e.outputFormatting = .sortedKeys
        guard let d = try? e.encode(value) else { return }
        lock.lock(); items.append((call, d)); lock.unlock()
    }
    public var entries: [(call: String, json: Data)] { lock.lock(); defer { lock.unlock() }; return items.map { ($0.0, $0.1) } }
}

/// Front B's Apple Health status during the parallel phase (a Swift port fixture: B's state is not the engine's). Never says "denied".
public final class FixtureHealthIngestStatus: HealthIngestStatusSource {
    let value: HealthIngestStatus
    public init(queued: Int) {
        value = HealthIngestStatus(authorization: .requested, disabledInApp: false, lastReadAt: nil, lastWorkoutReceivedAt: nil, initialImportInProgress: false,
                                   lastReadError: nil, queued: queued, waitingReason: nil, setAside: 0, receivedTypes: [])
    }
    public func status() async -> HealthIngestStatus { value }
    public func importedNonRunWorkouts(since: Date) async -> [ImportedWorkoutSummary] { [] }
}
