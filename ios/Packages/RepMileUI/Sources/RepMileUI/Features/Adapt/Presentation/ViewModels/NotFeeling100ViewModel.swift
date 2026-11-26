import CoachingPresentation
import Foundation
import Observation

/// "Não estou 100%" (F08 Situation 1): the condition, the engine's signs for it (`CoachingReading.warningSignSet`), the eligibility screen when
/// the entry point asks it, the intent, and its one write (`CoachingWriting.submit`). The outcome is the engine's status, read without
/// guessing; the view renders `phase` and forwards the athlete's answers.
@Observable @MainActor
final class NotFeeling100ViewModel {
    enum Outcome: Equatable { case kept, modified, blocked, needsAnswers, failed(String) }
    enum Phase: Equatable {
        case choosingCondition
        /// The condition chosen and the exact set the engine returned for it.
        case answering(WellbeingCondition, WarningSignQuestionSet)
        /// The one request is in flight: a second tap does nothing.
        case submitting(WellbeingCondition, WarningSignQuestionSet)
        case outcome(Outcome)
    }

    private(set) var phase: Phase = .choosingCondition
    /// Only the asked signs; an unanswered one stays absent ("Sem resposta não conta como não").
    var answers: [String: Bool] = [:]
    /// Six flags, nil until answered (never false by default); sent only when `requireEligibility`.
    var eligibility = EligibilityScreen(status: nil, assessedAt: "", pain: nil, persistentPain: nil, injury: nil, illness: nil, functionalLimitation: nil, clinicalConcern: nil)
    var intent: WellbeingIntent?

    let requireEligibility: Bool
    private let reader: CoachingReading
    private let writer: CoachingWriting
    private let planToday: () -> String?
    private let now: () -> Date
    /// The condition last tapped whose set is still loading.
    @ObservationIgnored private var pendingCondition: WellbeingCondition?

    init(reader: CoachingReading, writer: CoachingWriting, requireEligibility: Bool = false, planToday: @escaping () -> String?,
         now: @escaping () -> Date = Date.init) {
        self.reader = reader; self.writer = writer; self.requireEligibility = requireEligibility; self.planToday = planToday; self.now = now
    }

    var questionSet: WarningSignQuestionSet? {
        switch phase {
        case .answering(_, let s), .submitting(_, let s): s
        case .choosingCondition, .outcome: nil
        }
    }

    var sending: Bool { if case .submitting = phase { true } else { false } }

    /// The intents the engine accepts for the chosen condition (an illness offers no near-normal week).
    var intents: [WellbeingIntent] { questionSet?.intents.compactMap(WellbeingIntent.init(rawValue:)) ?? [] }

    /// Reads the engine's set for `condition`; a failed read keeps the condition list on screen. The latest tap wins: a set that arrives
    /// for a condition no longer pending is dropped, so the questions shown are always those of the condition last chosen.
    func choose(_ condition: WellbeingCondition) async {
        guard case .choosingCondition = phase else { return }
        pendingCondition = condition
        let read = await reader.warningSignSet(condition: condition.rawValue)
        guard pendingCondition == condition, case .choosingCondition = phase else { return }
        pendingCondition = nil
        guard case .success(let set) = read else { return }
        answers = [:]
        phase = .answering(condition, set)
    }

    /// Sends the declaration once. `apply` wraps the change to the outcome (the view's animation; plain in tests).
    func send(applying apply: (_ change: () -> Void) -> Void = { $0() }) async {
        guard case .answering(let condition, let set) = phase, let request = request() else { return }
        phase = .submitting(condition, set)
        let out = await writer.submit(request)
        apply { phase = .outcome(Self.outcome(out.answer)) }
    }

    /// The request exactly as the shared types encode it (asked signs only; unanswered omitted; eligibility only when the flow asked it).
    func request() -> ReviewRequest? {
        guard case .answering(let condition, let set) = phase else { return nil }
        return Self.makeRequest(condition: condition, set: set, answers: answers, intent: intent,
                                eligibility: requireEligibility ? eligibility : nil, today: planToday() ?? Fmt.deviceDay(now()))
    }

    /// Asked signs only (a sign outside the engine's set is refused by `SignAnswers`), unanswered omitted, eligibility dated today.
    static func makeRequest(condition: WellbeingCondition, set: WarningSignQuestionSet, answers: [String: Bool], intent: WellbeingIntent?,
                            eligibility: EligibilityScreen?, today: String) -> ReviewRequest? {
        guard var decl = try? WellbeingDeclaration(condition: condition, set: set, intent: intent) else { return nil }
        for (k, v) in answers { try? decl.warningSigns.answer(k, v) }
        var e = eligibility; e?.assessedAt = today
        return ReviewRequest(.notFeeling100(decl, reports: []), eligibility: e)
    }

    /// The engine's answer, read without guessing: only KEEP is "the plan stays"; an unknown status fails closed.
    static func outcome(_ a: BoundaryAnswer) -> Outcome {
        guard a.ok else { return .failed(a.error?.code.raw ?? "UNKNOWN") }
        if a.view?.state == .blocked || a.status?.raw == "CLINICAL_HUMAN_REQUIRED" { return .blocked }
        switch a.status?.raw {
        case "ASK": return .needsAnswers
        case "KEEP": return .kept
        case "MODIFY": return .modified
        default: return .failed(a.status?.raw ?? "UNRECOGNIZED")
        }
    }
}
