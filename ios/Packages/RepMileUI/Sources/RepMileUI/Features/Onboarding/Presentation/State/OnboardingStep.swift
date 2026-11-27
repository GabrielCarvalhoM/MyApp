import Foundation

/// One screen of the onboarding form (Figma 10, the numbers are the frames'). The order and the branches are the Figma's; a screen whose
/// answer cannot be sent truthfully, or whose copy would claim an effect the plan does not have, is held out of the flow (engineering decision
/// 27/11): 07 Prioridade (D08), 15 Treinador (D11), 26 Cargas conhecidas (D01), 25b pausa (reached only from Apple Saúde, D15), 09b (D10).
enum OnboardingStep: String, Codable, CaseIterable, Sendable {
    case opening                                                              // 01 `835:2069`
    case train, runAim, raceDate, goalTime, strengthAim, goalDone             // 02–06, 08
    case week, longRun, duration, strengthPlace, runPlace, runDevice, routineDone   // 09–14, 16
    case name, age, bodySize, appleHealth                                     // 17–20
    case runStart, runRecentDays, runNow, runYears, result, resultDetail      // 21 (iniciante), 21b, 21, 22, 23, 24
    case strengthYears, care, youDone                                         // 25, 27, 28
    case dataUse                                                              // 29

    /// 1…4: "Etapa N de 4"; 0 for the opening.
    var stage: Int {
        switch self {
        case .opening: 0
        case .train, .runAim, .raceDate, .goalTime, .strengthAim, .goalDone: 1
        case .week, .longRun, .duration, .strengthPlace, .runPlace, .runDevice, .routineDone: 2
        case .name, .age, .bodySize, .appleHealth, .runStart, .runRecentDays, .runNow, .runYears, .result, .resultDetail, .strengthYears, .care, .youDone: 3
        case .dataUse: 4
        }
    }

    /// The respiros close a stage: no question, a summary and the next stage's button.
    var isRespiro: Bool { self == .goalDone || self == .routineDone || self == .youDone }

    /// The steps the athlete sees for these answers, in order. Answers decide branches only (run, strength, race, beginner).
    static func flow(for d: OnboardingDraft) -> [OnboardingStep] {
        let runs = d.train?.runs ?? true, lifts = d.train?.lifts ?? true
        let startRunning = d.runAim == .noRace(.startRunning)
        var s: [OnboardingStep] = [.opening, .train]
        if runs { s.append(.runAim); if d.runAim?.race != nil { s += [.raceDate, .goalTime] } }
        if lifts { s.append(.strengthAim) }
        // 08 is drawn for a race only (D09): without a race the stage closes on its last question.
        if d.runAim?.race != nil && runs { s.append(.goalDone) }
        s.append(.week)
        if runs { s.append(.longRun) }
        s.append(.duration)
        if lifts { s.append(.strengthPlace) }
        if runs { s += [.runPlace, .runDevice] }
        s += [.routineDone, .name, .age, .bodySize, .appleHealth]
        if runs {
            // 21 iniciante (SSCTR 27/11, D12): "Nunca corri" ends the running questions; "Já corri e parei" asks 21b; "Corro hoje" asks the
            // full counters of 21 and 22, like every other aim.
            if startRunning { s.append(.runStart) }
            if startRunning && d.runStart == .stopped { s.append(.runRecentDays) }
            if !startRunning || d.runStart == .current { s += [.runNow, .runYears] }
            if !(startRunning && (d.runStart == nil || d.runStart == .never)) {
                s.append(.result)
                if d.hasResult == true { s.append(.resultDetail) }
            }
        }
        if lifts { s.append(.strengthYears) }
        s += [.care, .youDone, .dataUse]
        return s
    }
}
