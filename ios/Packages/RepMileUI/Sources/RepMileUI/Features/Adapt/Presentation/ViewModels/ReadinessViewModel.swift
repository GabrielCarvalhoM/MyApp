import CoachingPresentation
import Foundation
import Observation

/// The readiness declaration (the only exit of a clinical hold): the engine's READINESS set (15 signs), "recovered", sport by sport, and its
/// one write (`CoachingWriting.submit`). "De volta" only when the engine restarts training; anything else keeps the hold (fail closed).
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
        case stillBlocked
    }
    /// What an engine answer means for this screen.
    enum Reply: Equatable { case needsAnswers, returning, stillBlocked }

    private(set) var phase: Phase = .loading
    /// Only the asked signs; an unanswered one stays absent.
    var answers: [String: Bool] = [:]
    /// No default: the declaration cannot be sent until the athlete answers.
    var recovered: Bool?
    var run = false
    var strength = false

    private let reader: CoachingReading
    private let writer: CoachingWriting

    init(reader: CoachingReading, writer: CoachingWriting) { self.reader = reader; self.writer = writer }

    var questionSet: WarningSignQuestionSet? {
        switch phase {
        case .answering(let s), .submitting(let s): s
        case .loading, .needsAnswers, .returning, .stillBlocked: nil
        }
    }

    var canSend: Bool { if case .answering = phase { recovered != nil } else { false } }

    /// Reads the READINESS set once; a failed read leaves nothing to answer.
    func load() async {
        guard case .loading = phase, case .success(let set) = await reader.warningSignSet(condition: "READINESS"), case .loading = phase else { return }
        phase = .answering(set)
    }

    /// Sends the declaration once. `apply` wraps the change to the answer's state (the view's animation; plain in tests).
    func send(applying apply: (_ change: () -> Void) -> Void = { $0() }) async {
        guard case .answering(let set) = phase, let request = request() else { return }
        phase = .submitting(set)
        let out = await writer.submit(request)
        apply {
            switch Self.reply(for: out.answer) {
            case .needsAnswers: phase = .needsAnswers(set)
            case .returning: phase = .returning
            case .stillBlocked: phase = .stillBlocked
            }
        }
    }

    /// "Voltar" after the engine asked for more.
    func back() {
        guard case .needsAnswers(let set) = phase else { return }
        phase = .answering(set)
    }

    func request() -> ReviewRequest? {
        guard case .answering(let set) = phase, let recovered,
              var decl = try? ReadinessDeclaration(declaredRecovered: recovered, set: set,
                                                   sports: .init(run: .init(ready: run), strength: .init(ready: strength, restrictions: []))) else { return nil }
        for (k, v) in answers { try? decl.warningSigns.answer(k, v) }
        return ReviewRequest(.readiness(decl, reports: []), eligibility: nil)
    }

    /// The engine's answer: ASK first; returning only when the engine restarts training; anything else keeps the hold (fail closed).
    static func reply(for a: BoundaryAnswer) -> Reply {
        if a.status?.raw == "ASK" || a.view?.state == .needsInput { return .needsAnswers }
        return a.ok && (a.action?.raw == "READINESS_RESTART" || a.view?.state == .returning) ? .returning : .stillBlocked
    }
}
