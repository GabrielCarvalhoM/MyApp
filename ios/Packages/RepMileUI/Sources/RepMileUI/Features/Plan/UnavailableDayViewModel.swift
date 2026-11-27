import CoachingPresentation
import Foundation
import Observation

/// "Não posso neste dia" (GAP-09): the origin day becomes unavailable (`CoachingWriting.submit`), the engine proposes, the athlete confirms
/// (`CoachingWriting.accept`). The UI never chooses a destination. The proposal shown is read after the write (QRE R1 P1-10): `reload` runs
/// before the phase becomes `.proposed`, and `proposal` reads the presentation the app holds then, never the pre-write one.
/// #72: the day carries the eligibility screen answered here (#68 rule: nothing pre-answered, dated the plan's today, never an earlier one).
/// Without it the engine answers ASK `eligibility.currentAssessment` with a decision id but nothing pending, and a flag answered yes routes to
/// a human (CLINICAL_HUMAN_REQUIRED, plan BLOCKED, also with a decision id): neither is a proposal, so only a pending decision is proposed
/// (replay `audits/v1-ios-swiftui-2026-11-26/results/i72-eligibility-rest/`).
@Observable @MainActor
final class UnavailableDayViewModel {
    enum Phase: Equatable {
        case ask
        /// The unavailable day is in flight: a second tap does nothing.
        case sending
        /// The engine asked for more (ASK / NEEDS_INPUT): nothing changed. The form sent everything it can ask (the day and an answered
        /// screen), so it is not offered again: resending the same request would get the same question.
        case needsInput
        /// The answer routes to a qualified human (a flag answered yes, or a clinical dependency on record): nothing moves. The engine's
        /// guidance level (#73).
        case clinical(ClinicalGuidance)
        case proposed(decisionId: String)
        /// The confirmation is in flight: a second tap does nothing.
        case accepting(decisionId: String)
        case accepted
        case failed(String)
    }

    private(set) var phase: Phase = .ask
    /// Answered here, for this request only: nothing pre-answered (nil ≠ false), never an earlier screen.
    var eligibility = EligibilityScreen.unanswered

    let session: PlannedSession
    private let writer: CoachingWriting
    private let planToday: () -> String?
    private let reload: () async -> Void
    private let presentation: () -> PresentationSnapshot?
    /// The level of the hold the app holds now (`PlanView.clinicalGuidance`, the engine's): the floor of an answer without a view (#73).
    private let holdGuidance: () -> ClinicalGuidance?

    init(session: PlannedSession, writer: CoachingWriting, planToday: @escaping () -> String?, reload: @escaping () async -> Void,
         presentation: @escaping () -> PresentationSnapshot?, holdGuidance: @escaping () -> ClinicalGuidance?) {
        self.session = session; self.writer = writer; self.planToday = planToday; self.reload = reload; self.presentation = presentation
        self.holdGuidance = holdGuidance
    }

    /// On the form, with the screen answered and the plan's day known.
    var canSend: Bool { phase == .ask && request() != nil }
    /// Only a proposal the athlete can see: a re-read with no rows keeps "Aceitar" off (never an invisible change confirmed).
    var canAccept: Bool { if case .proposed = phase { !proposal.isEmpty } else { false } }
    /// Proposed, but the re-read shows no row to review: the view shows `move.proposal.unavailable` instead of the rows.
    var proposalUnavailable: Bool { if case .proposed = phase { proposal.isEmpty } else { false } }

    /// The engine's proposal: the run sessions of `presentation().pending`, by date (strength rows are not exposed yet, GAP-08).
    var proposal: [RunSessionPresentation] { Self.proposal(presentation()) }

    func send() async {
        guard canSend, let request = request() else { return }
        phase = .sending
        let next = Self.phase(afterSubmit: await writer.submit(request).answer, floor: holdGuidance())
        if case .proposed = next { await reload() }  // the proposal's run sessions are read after the write, never the pre-write presentation
        phase = next
    }

    func accept() async {
        guard canAccept, case .proposed(let id) = phase else { return }
        phase = .accepting(decisionId: id)
        phase = Self.phase(afterAccept: await writer.accept(decisionId: id).answer)
    }

    /// The request exactly as sent; nil until the screen is answered and while no plan gives the day.
    func request() -> ReviewRequest? {
        guard let today = planToday(), let screen = eligibility.dated(today) else { return nil }
        return Self.request(for: session, screen: screen)
    }

    /// The one request: the session's day, unavailable, with the screen as dated by the caller. No destination.
    static func request(for session: PlannedSession, screen: EligibilityScreen) -> ReviewRequest {
        ReviewRequest(.unavailableDays([session.date]), eligibility: screen)
    }

    /// The engine's answer to the unavailable day. Pure. A clinical route first, then a question; a proposal only as a pending decision (the
    /// view's, else the decision of a MODIFY answer): a decision id alone is not one (an ASK and a clinical route carry one too). An `ok`
    /// with nothing of these fails closed.
    static func phase(afterSubmit a: BoundaryAnswer, floor: ClinicalGuidance? = nil) -> Phase {
        guard a.ok else { return .failed(a.error?.code.raw ?? "UNKNOWN") }
        if let g = a.clinicalGuidance(floor: floor) { return .clinical(g) }
        if a.status?.raw == "ASK" || a.view?.state == .needsInput { return .needsInput }
        if let id = a.view?.pending?.decisionId ?? (a.status?.raw == "MODIFY" ? a.decisionId : nil) { return .proposed(decisionId: id) }
        return .failed("UNKNOWN")
    }

    static func phase(afterAccept a: BoundaryAnswer) -> Phase { a.ok ? .accepted : .failed(a.error?.code.raw ?? "UNKNOWN") }

    static func proposal(_ p: PresentationSnapshot?) -> [RunSessionPresentation] {
        (p?.pending?.values.map { $0 } ?? []).sorted { $0.date < $1.date }
    }

    /// A stale version has its own copy; every other failure is the operational error.
    static func failureKey(_ code: String) -> String { code == "CONFLICT_STALE_VERSION" ? "state.stale.body" : "state.opError.body" }
}
