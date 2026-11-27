import CoachingPresentation
import Foundation
import Observation

/// "Não estou 100%" (F08 Situation 1): the condition, the engine's signs for it (`CoachingReading.warningSignSet`), the eligibility screen, the
/// intent, and its one write (`CoachingWriting.submit`). The outcome is the engine's status, read without guessing; the view renders `phase`
/// and forwards the athlete's answers.
///
/// #72: every entry point asks the screen. The engine reads the screen before the signs (`r6-adaptation.mjs`: eligibility gate, then the
/// sign route): without a current screen even a red-flag sign gets ASK `eligibility.currentAssessment`, with no clinical route and no
/// guidance (replay `audits/v1-ios-swiftui-2026-11-26/results/i72-eligibility-rest/`); with it, a lone urgent sign routes at once, the other
/// signs and the intent unanswered. So the send waits for the screen and for nothing else the app could add: the signs come first on screen,
/// the screen right after them, and no other answer gates the send.
@Observable @MainActor
final class NotFeeling100ViewModel {
    /// `blocked` carries the engine's guidance level of the clinical route (#73: URGENT_CARE_ADVISED is shown as such, never lowered).
    enum Outcome: Equatable { case kept, modified, blocked(ClinicalGuidance), needsAnswers, failed(String) }
    enum Phase: Equatable {
        case choosingCondition
        /// The condition chosen and the exact set the engine returned for it.
        case answering(WellbeingCondition, WarningSignQuestionSet)
        /// The one request is in flight: a second tap does nothing.
        case submitting(WellbeingCondition, WarningSignQuestionSet)
        case outcome(Outcome)
        /// The engine asked for more (ASK): "Voltar" returns to these questions with every answer and the screen kept.
        case needsAnswers(WellbeingCondition, WarningSignQuestionSet)
    }

    private(set) var phase: Phase = .choosingCondition
    /// Only the asked signs; an unanswered one stays absent ("Sem resposta não conta como não").
    var answers: [String: Bool] = [:]
    /// Answered here, for this declaration only (#68 rule): nothing pre-answered (nil ≠ false), never an earlier screen.
    var eligibility = EligibilityScreen.unanswered
    var intent: WellbeingIntent?

    private let reader: CoachingReading
    private let writer: CoachingWriting
    private let planToday: () -> String?
    /// The level of the hold the app holds now (`PlanView.clinicalGuidance`, the engine's): the floor of an answer without a view (#73).
    private let holdGuidance: () -> ClinicalGuidance?
    /// The condition last tapped whose set is still loading.
    @ObservationIgnored private var pendingCondition: WellbeingCondition?

    init(reader: CoachingReading, writer: CoachingWriting, planToday: @escaping () -> String?, holdGuidance: @escaping () -> ClinicalGuidance? = { nil }) {
        self.reader = reader; self.writer = writer; self.planToday = planToday; self.holdGuidance = holdGuidance
    }

    var questionSet: WarningSignQuestionSet? {
        switch phase {
        case .answering(_, let s), .submitting(_, let s): s
        case .choosingCondition, .outcome, .needsAnswers: nil
        }
    }

    var sending: Bool { if case .submitting = phase { true } else { false } }

    /// The questions are on screen, the screen is answered and the plan gives the day. Unanswered signs and the intent never gate it: the
    /// engine asks them itself, and a red-flag sign must not wait for them.
    var canSend: Bool { request() != nil }

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
        apply {
            let o = Self.outcome(out.answer, floor: holdGuidance())
            phase = o == .needsAnswers ? .needsAnswers(condition, set) : .outcome(o)
        }
    }

    /// "Voltar" after the engine asked for more: the same draft (the signs, the intent and the screen answered here).
    func back() {
        guard case .needsAnswers(let condition, let set) = phase else { return }
        phase = .answering(condition, set)
    }

    /// The request exactly as the shared types encode it (asked signs only; unanswered omitted) with the screen answered here, dated the
    /// plan's today (never the device's, #59). Nil until the screen is answered, and while no plan gives the day (the draft waits).
    func request() -> ReviewRequest? {
        guard case .answering(let condition, let set) = phase, let today = planToday(), let screen = eligibility.dated(today) else { return nil }
        return Self.makeRequest(condition: condition, set: set, answers: answers, intent: intent, screen: screen)
    }

    /// Asked signs only (a sign outside the engine's set is refused by `SignAnswers`), unanswered omitted, the screen as dated by the caller.
    static func makeRequest(condition: WellbeingCondition, set: WarningSignQuestionSet, answers: [String: Bool], intent: WellbeingIntent?,
                            screen: EligibilityScreen) -> ReviewRequest? {
        guard var decl = try? WellbeingDeclaration(condition: condition, set: set, intent: intent) else { return nil }
        for (k, v) in answers { try? decl.warningSigns.answer(k, v) }
        return ReviewRequest(.notFeeling100(decl, reports: []), eligibility: screen)
    }

    /// The engine's answer, read without guessing: only KEEP is "the plan stays"; an unknown status fails closed.
    /// `floor`: the hold's level, for an answer without a view (`BoundaryAnswer.clinicalGuidance(floor:)`).
    static func outcome(_ a: BoundaryAnswer, floor: ClinicalGuidance? = nil) -> Outcome {
        guard a.ok else { return .failed(a.error?.code.raw ?? "UNKNOWN") }
        if let g = a.clinicalGuidance(floor: floor) { return .blocked(g) }
        switch a.status?.raw {
        case "ASK": return .needsAnswers
        case "KEEP": return .kept
        case "MODIFY": return .modified
        default: return .failed(a.status?.raw ?? "UNRECOGNIZED")
        }
    }
}
