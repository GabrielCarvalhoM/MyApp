import CoachingPresentation
import Foundation
import Observation

/// "Não posso neste dia" (GAP-09): the origin day becomes unavailable (`CoachingWriting.submit`), the engine proposes, the athlete confirms
/// (`CoachingWriting.accept`). The UI never chooses a destination. The proposal shown is read after the write (QRE R1 P1-10): `reload` runs
/// before the phase becomes `.proposed`, and `proposal` reads the presentation the app holds then, never the pre-write one.
@Observable @MainActor
final class UnavailableDayViewModel {
    enum Phase: Equatable {
        case ask
        /// The unavailable day is in flight: a second tap does nothing.
        case sending
        case proposed(decisionId: String)
        /// The confirmation is in flight: a second tap does nothing.
        case accepting(decisionId: String)
        case accepted
        case failed(String)
    }

    private(set) var phase: Phase = .ask

    let session: PlannedSession
    private let writer: CoachingWriting
    private let reload: () async -> Void
    private let presentation: () -> PresentationSnapshot?

    init(session: PlannedSession, writer: CoachingWriting, reload: @escaping () async -> Void, presentation: @escaping () -> PresentationSnapshot?) {
        self.session = session; self.writer = writer; self.reload = reload; self.presentation = presentation
    }

    var canSend: Bool { phase == .ask }
    var canAccept: Bool { if case .proposed = phase { true } else { false } }

    /// The engine's proposal: the run sessions of `presentation().pending`, by date (strength rows are not exposed yet, GAP-08).
    var proposal: [RunSessionPresentation] { Self.proposal(presentation()) }

    func send() async {
        guard canSend else { return }
        phase = .sending
        let next = Self.phase(afterSubmit: await writer.submit(Self.request(for: session)).answer)
        if case .proposed = next { await reload() }  // the proposal's run sessions are read after the write, never the pre-write presentation
        phase = next
    }

    func accept() async {
        guard case .proposed(let id) = phase else { return }
        phase = .accepting(decisionId: id)
        phase = Self.phase(afterAccept: await writer.accept(decisionId: id).answer)
    }

    /// The one request: the session's day, unavailable. No destination, no eligibility.
    static func request(for session: PlannedSession) -> ReviewRequest { ReviewRequest(.unavailableDays([session.date]), eligibility: nil) }

    /// The engine's answer to the unavailable day: its pending decision (the view's, else the answer's), or the error code. An `ok` with no
    /// decision fails closed.
    static func phase(afterSubmit a: BoundaryAnswer) -> Phase {
        if a.ok, let id = a.view?.pending?.decisionId ?? a.decisionId { return .proposed(decisionId: id) }
        return .failed(a.error?.code.raw ?? "UNKNOWN")
    }

    static func phase(afterAccept a: BoundaryAnswer) -> Phase { a.ok ? .accepted : .failed(a.error?.code.raw ?? "UNKNOWN") }

    static func proposal(_ p: PresentationSnapshot?) -> [RunSessionPresentation] {
        (p?.pending?.values.map { $0 } ?? []).sorted { $0.date < $1.date }
    }

    /// A stale version has its own copy; every other failure is the operational error.
    static func failureKey(_ code: String) -> String { code == "CONFLICT_STALE_VERSION" ? "state.stale.body" : "state.opError.body" }
}
