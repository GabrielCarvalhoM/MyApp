import CoachingPresentation
import Foundation
import Observation

/// The onboarding flow's state and its one write (`CoachingWriting.onboard`). The outcome shown is the engine's `planOutcome`, never decided
/// here; the view renders `step` / `phase` and forwards the athlete's input to `draft`.
@Observable @MainActor
final class OnboardingViewModel {
    enum Step: Int, CaseIterable { case welcome, age, goals, experience, schedule, equipment, anchor, care, consents }
    enum Phase: Equatable { case form, building, outcome(PlanOutcome) }

    private(set) var step: Step = .welcome
    private(set) var phase: Phase = .form
    var draft = OnboardingDraft()

    private let writer: CoachingWriting
    private let now: () -> Date
    /// Parallel phase: A sets the athlete id at integration (handoff C §4).
    private let athleteId: String

    init(writer: CoachingWriting, athleteId: String = "synthetic-athlete", now: @escaping () -> Date = Date.init) {
        self.writer = writer; self.athleteId = athleteId; self.now = now
    }

    var stepCount: Int { Step.allCases.count - 1 }
    var isLastStep: Bool { step == Step.allCases.last }

    /// What the current step needs before the athlete can continue. Nothing is defaulted: no age, no care choice, an unanswered
    /// eligibility flag or consent all keep the button off.
    var canContinue: Bool {
        switch step {
        case .age: draft.age != nil
        case .schedule: !draft.runDays.isEmpty
        case .anchor: !draft.hasAnchor || OnboardingDraft.seconds(draft.anchorTime) != nil
        case .care: draft.careAnswered && draft.eligibilityAnswered
        case .consents: draft.consentsAnswered
        default: true
        }
    }

    func next() {
        guard canContinue, let next = Step(rawValue: step.rawValue + 1) else { return }
        step = next
    }

    func back() { step = Step(rawValue: step.rawValue - 1) ?? .welcome }

    /// Sends the intake once. A second call while building or after an outcome does nothing (no double enrolment). `minimumDisplay` keeps
    /// "Montando o plano" on screen long enough to read (shorter with Reduce Motion; 0 in tests).
    func submit(minimumDisplay: Duration = .zero) async {
        guard phase == .form, isLastStep, canContinue else { return }
        let date = now()
        let today = Fmt.deviceDay(date)
        let start = Calendar.current.nextDate(after: date, matching: DateComponents(weekday: 2), matchingPolicy: .nextTime).map(Fmt.deviceDay) ?? today
        guard let answers = draft.answers(athleteId: athleteId, today: today, startDate: start) else { return }
        phase = .building
        let out = await writer.onboard(answers, consents: draft.consentsValue)
        if minimumDisplay > .zero { try? await Task.sleep(for: minimumDisplay) }
        phase = .outcome(out.answer.planOutcome)
    }

    /// "Revisar respostas" after "Plano indisponível": back to the care step, answers kept.
    func reviewCare() { phase = .form; step = .care }

    /// After a missing answer or an operational error: back to the form, answers kept.
    func returnToForm() { phase = .form }
}
