import CoachingPresentation
import Foundation

/// Which part of the V1 scope the engine said the answers fall outside (`UNSUPPORTED`): its reason names the code
/// (`r6-intake.mjs` scope: POPULATION_OUTSIDE_V1_AGE_RANGE, SPECIAL_POPULATION_OUTSIDE_V1, EVENT_DISTANCE_OUTSIDE_V1). Display routing only.
enum OutsideScope: Equatable, Sendable {
    case age, specialPopulation, eventDistance, unknown
    init(reason: String?) {
        let r = reason ?? ""
        if r.hasSuffix("POPULATION_OUTSIDE_V1_AGE_RANGE") { self = .age }
        else if r.hasSuffix("SPECIAL_POPULATION_OUTSIDE_V1") { self = .specialPopulation }
        else if r.hasSuffix("EVENT_DISTANCE_OUTSIDE_V1") { self = .eventDistance }
        else { self = .unknown }
    }
}

/// The pure mappings of the flow: engine outcome → frame, outcome → the step "Revisar" opens, field → step, and where "Retomar" says the
/// athlete stopped.
extension OnboardingViewModel {
    static func phase(for outcome: PlanOutcome) -> Phase {
        switch outcome {
        case .planCreated: .ready
        case .outsideV1Scope(let reason): .outcome(.outsideScope(OutsideScope(reason: reason)))
        case .clinicalHumanRequired: .outcome(.heldForSafety)
        case .needsInput(let fields): .outcome(.missingAnswer(fields))
        case .invalidInput, .failed, .unrecognized: .outcome(.notBuilt)
        }
    }

    /// The step "Revisar resposta(s)" opens (QRE P3-7: outside scope by age opens the age). Held for safety has no review (SSCTR C4).
    static func reviewStep(for outcome: Outcome, in flow: [OnboardingStep]) -> OnboardingStep {
        switch outcome {
        case .outsideScope(.age): .age
        case .outsideScope(.specialPopulation): .care
        case .outsideScope(.eventDistance): .runAim
        case .outsideScope(.unknown), .notBuilt: .train
        case .heldForSafety: .dataUse
        case .missingAnswer(let fields): step(asking: fields, in: flow) ?? .dataUse
        }
    }

    /// Where the form asks a field the engine named (display routing only: the engine decided what is missing).
    static func step(asking fields: [String], in flow: [OnboardingStep]) -> OnboardingStep? {
        let named: [OnboardingStep] = fields.flatMap { f -> [OnboardingStep] in
            if f.hasPrefix("athlete.event") || f.hasPrefix("event.") { return [.raceDate] }
            if f.hasPrefix("schedule.longRunDay") { return [.longRun] }
            if f.hasPrefix("schedule.") && f.hasSuffix("Minutes") { return [.duration] }
            if f.hasPrefix("schedule.") { return [.week] }
            if f.hasPrefix("recent.") { return [.runNow, .strengthYears] }
            if f.hasSuffix("TrainingMonths") { return [.runYears, .strengthYears] }
            if f.contains("ageEligibility") || f.contains("ageYears") { return [.age] }
            if f.contains("eligibility") { return [.care] }
            if f.contains("equipment") { return [.strengthPlace] }
            return []
        }
        return flow.first(where: named.contains)
    }

    /// `838:3918`: the stage now in progress and the screen named in "Você parou em …". A respiro closes its stage, so the athlete stopped at
    /// the start of the next one and no screen is named (QRE P3-4).
    static func resumePoint(for step: OnboardingStep) -> (stage: Int, stoppedAt: OnboardingStep?) {
        step.isRespiro ? (min(4, step.stage + 1), nil) : (max(1, step.stage), step == .opening ? nil : step)
    }
}
