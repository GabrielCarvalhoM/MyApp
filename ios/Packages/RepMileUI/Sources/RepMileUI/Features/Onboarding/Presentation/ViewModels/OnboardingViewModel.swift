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
    /// After INVALID_INPUT: the steps that ask the fields the engine named (empty when it named none the form asks).
    private(set) var reviewSteps: [Step] = []
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

    /// What the current step needs before the athlete can continue. Nothing is defaulted: no age, no race date, no plan length, no care
    /// choice, an unanswered eligibility flag or consent all keep the button off.
    var canContinue: Bool {
        switch step {
        case .age: draft.age != nil
        case .goals: draft.eventAnswered
        case .schedule: !draft.runDays.isEmpty && draft.weeksAnswered
        case .anchor: !draft.hasAnchor || OnboardingDraft.seconds(draft.anchorTime) != nil
        case .care: draft.careAnswered && draft.eligibilityAnswered
        case .consents: draft.consentsAnswered
        default: true
        }
    }

    /// The note under the button while the step's choice is missing (copy key), or nil.
    var requiredNote: String? {
        switch step {
        case .goals where !draft.eventAnswered: "ob.event.date.required"
        case .schedule where !draft.weeksAnswered: "ob.weeks.required"
        case .care where !draft.careAnswered: "ob.care.required"
        default: nil
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
        let start = Calendar.current.nextDate(after: date, matching: DateComponents(weekday: 2), matchingPolicy: .nextTime).map { Fmt.deviceDay($0) } ?? today
        guard let answers = draft.answers(athleteId: athleteId, today: today, startDate: start) else { return }
        phase = .building
        let out = await writer.onboard(answers, consents: draft.consentsValue)
        if minimumDisplay > .zero { try? await Task.sleep(for: minimumDisplay) }
        let outcome = out.answer.planOutcome
        reviewSteps = outcome == .invalidInput ? Self.steps(asking: Self.invalidFields(out.answer)) : []
        phase = .outcome(outcome)
    }

    /// "Revisar respostas" after "Plano indisponível": back to the care step, answers kept.
    func reviewCare() { phase = .form; step = .care }

    /// After a missing answer or an operational error: back to the form, answers kept.
    func returnToForm() { phase = .form }

    /// "Revisar respostas" after INVALID_INPUT: back to the first step the engine pointed at, else to the first question; answers kept.
    func reviewAnswers() { phase = .form; step = reviewSteps.first ?? .age }
}

extension OnboardingViewModel {
    /// The field codes of an INVALID_INPUT answer. The engine's onboarding answer lists them as `errors` (custody.mjs), which `BoundaryAnswer`
    /// does not decode yet; the only typed list is `error.fields`. Until CoachingPresentation carries `errors`, this is usually empty.
    static func invalidFields(_ answer: BoundaryAnswer) -> [String] { answer.error?.fields ?? [] }

    /// Where the form asks each field the engine named (display routing only: the engine decided the answers do not fit together, not this).
    static func steps(asking fields: [String]) -> [Step] {
        let named: [Step] = fields.flatMap { f -> [Step] in
            if f.hasPrefix("event.withinHorizon") { return [.goals, .schedule] }  // the race date against the plan length
            if f.hasPrefix("weeks") || f.hasPrefix("schedule.") { return [.schedule] }
            if f.hasPrefix("event.") || f.hasPrefix("athlete.event") || f.hasPrefix("goals.") { return [.goals] }
            if f.hasPrefix("recent.") || f.hasSuffix("TrainingMonths") { return [.experience] }
            if f.hasPrefix("athlete.equipment") || f.hasPrefix("equipment") { return [.equipment] }
            if f.contains("performanceAnchors") { return [.anchor] }
            if f.contains("ageYears") { return [.age] }
            return []
        }
        return Step.allCases.filter(named.contains)
    }
}
