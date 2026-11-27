import CoachingPresentation
import Foundation
import Observation

/// The readiness declaration (the only exit of a clinical hold): the engine's READINESS set (15 signs), "recovered", sport by sport, and its
/// one write (`CoachingWriting.submit`). "De volta" only when the engine restarts training; anything else keeps the hold (fail closed).
/// #72: the declaration carries the eligibility screen answered here (#68 rule: nothing pre-answered, dated the plan's today, never an earlier
/// one). Without it the engine answers CLINICAL_HUMAN_REQUIRED with `eligibility.currentAssessment` missing and the hold cannot be released;
/// a red-flag sign sent without it gets only the professional-assessment level, never its urgent one (replay
/// `audits/v1-ios-swiftui-2026-11-26/results/i72-eligibility-rest/`).
@Observable @MainActor
final class ReadinessViewModel {
    enum Phase: Equatable {
        /// The engine's set is not read (or could not be): nothing to answer, never a form without the engine's signs.
        case loading
        case answering(WarningSignQuestionSet)
        /// The one request is in flight: a second tap does nothing.
        case submitting(WarningSignQuestionSet)
        /// The engine asked for more (ASK / NEEDS_INPUT); "Voltar" returns to the form with the answers kept.
        case needsAnswers(WarningSignQuestionSet)
        case returning
        /// The hold stands, at the engine's guidance level (#73).
        case stillBlocked(ClinicalGuidance)
    }
    /// What an engine answer means for this screen.
    enum Reply: Equatable { case needsAnswers, returning, stillBlocked(ClinicalGuidance) }

    private(set) var phase: Phase = .loading
    /// Only the asked signs; an unanswered one stays absent.
    var answers: [String: Bool] = [:]
    /// No default: the declaration cannot be sent until the athlete answers.
    var recovered: Bool?
    var run = false
    var strength = false
    /// Answered here, for this declaration only; kept through "Voltar" (the same draft).
    var eligibility = EligibilityScreen.unanswered

    private let reader: CoachingReading
    private let writer: CoachingWriting
    private let planToday: () -> String?
    /// The level of the hold this declaration answers (the plan view the app holds): shown when the answer carries none of its own.
    private let holdGuidance: () -> ClinicalGuidance?

    init(reader: CoachingReading, writer: CoachingWriting, planToday: @escaping () -> String?,
         holdGuidance: @escaping () -> ClinicalGuidance? = { nil }) {
        self.reader = reader; self.writer = writer; self.planToday = planToday; self.holdGuidance = holdGuidance
    }

    var questionSet: WarningSignQuestionSet? {
        switch phase {
        case .answering(let s), .submitting(let s): s
        case .loading, .needsAnswers, .returning, .stillBlocked: nil
        }
    }

    /// "Recovered" and the screen answered, the plan gives the day, and every sign answered unless one is "sim". During a hold the engine
    /// does not ASK an unanswered sign: it answers CLINICAL_HUMAN_REQUIRED with `readiness.warningSigns.<sign>` missing (replay i72 §4), which
    /// this screen cannot tell from a route (the port exposes no `decision.missingInputs`) and would show as a reported sign. A "sim" never
    /// waits for the others: the engine routes it at once.
    var canSend: Bool {
        guard request() != nil, let set = questionSet else { return false }
        return set.warningSigns.contains { answers[$0] == true } || set.warningSigns.allSatisfy { answers[$0] != nil }
    }

    /// Reads the READINESS set once; a failed read leaves nothing to answer.
    func load() async {
        guard case .loading = phase, case .success(let set) = await reader.warningSignSet(condition: "READINESS"), case .loading = phase else { return }
        phase = .answering(set)
    }

    /// Sends the declaration once. `apply` wraps the change to the answer's state (the view's animation; plain in tests).
    func send(applying apply: (_ change: () -> Void) -> Void = { $0() }) async {
        guard canSend, case .answering(let set) = phase, let request = request() else { return }
        phase = .submitting(set)
        let out = await writer.submit(request)
        apply {
            switch Self.reply(for: out.answer, holdGuidance: holdGuidance()) {
            case .needsAnswers: phase = .needsAnswers(set)
            case .returning: phase = .returning
            case .stillBlocked(let g): phase = .stillBlocked(g)
            }
        }
    }

    /// "Voltar" after the engine asked for more.
    func back() {
        guard case .needsAnswers(let set) = phase else { return }
        phase = .answering(set)
    }

    /// The request exactly as sent; the screen dated the plan's today (never the device's, #59). Nil until "recovered" and the screen are
    /// answered, and while no plan gives the day.
    func request() -> ReviewRequest? {
        guard case .answering(let set) = phase, let recovered, let today = planToday(), let screen = eligibility.dated(today),
              var decl = try? ReadinessDeclaration(declaredRecovered: recovered, set: set,
                                                   sports: .init(run: .init(ready: run), strength: .init(ready: strength, restrictions: []))) else { return nil }
        for (k, v) in answers { try? decl.warningSigns.answer(k, v) }
        return ReviewRequest(.readiness(decl, reports: []), eligibility: screen)
    }

    /// The engine's answer: ASK first; returning only when the engine restarts training; anything else keeps the hold (fail closed), at the
    /// highest of: the answer's clinical route, the hold in the answer's view and, for an answer without a view (nothing changed, or a
    /// `viewError`), the hold the declaration answered. None of them is the professional-assessment level (QRE P2-1, SSCTR C1).
    static func reply(for a: BoundaryAnswer, holdGuidance: ClinicalGuidance? = nil) -> Reply {
        if a.status?.raw == "ASK" || a.view?.state == .needsInput { return .needsAnswers }
        if a.ok && (a.action?.raw == "READINESS_RESTART" || a.view?.state == .returning) { return .returning }
        return .stillBlocked(ClinicalGuidance.professionalAssessment.raised(to: a.clinicalGuidance(floor: holdGuidance))
            .raised(to: a.view?.clinicalGuidance).raised(to: a.view == nil ? holdGuidance : nil))
    }
}
