import CoachingPresentation
import Foundation

/// A decision still open between the Figma and the shared contract that keeps "Montar meu plano" from sending (spec §6). Nothing is sent
/// with a value the athlete did not give (CODE_AND_ARCHITECTURE §1, PRODUCT_SCOPE "Três autoridades").
enum BuildHold: String, CaseIterable, Sendable {
    /// "Só corrida" / "Só força": the contract requires the other sport's minutes, long-run day and turn.
    case singleSport = "D05"
    /// No race: the Figma never asks the plan length; the contract requires `weeks`.
    case noRaceWeeks = "D03"
    /// 21 iniciante "Já corri e parei" with 1–3 days in 21b: minutes and the longest run are unknown and the contract requires them (SSCTR
    /// 27/11: never zero-filled).
    case beginnerRecent = "D12"
    /// One item, "Gestação atual ou parto nos últimos 12 meses": never encoded as PREGNANCY or POSTPARTUM, either would be a false record
    /// (Founder #110). Held until CCP-ONB-1 (#109) carries a combined or unspecified condition.
    case pregnancyCode = "D02"
    /// 24 "Teste": no evidence kind and measurement decided.
    case testMeasure = "D20"
}

enum IntakeBuild: Equatable, Sendable {
    case ready(OnboardingAnswers)
    case held([BuildHold])
    /// An answer the flow asks is missing (the view never lets this happen; the guard keeps it from sending).
    case incomplete
}

extension OnboardingDraft {
    /// The plan lengths the contract accepts (`OnboardingAnswers.weeks`).
    static let planLengths = [4, 8, 12, 16]

    /// Days between two plan-local days (`YYYY-MM-DD`), nil if either does not parse.
    static func days(from start: String, to end: String) -> Int? {
        guard let a = Fmt.day(start), let b = Fmt.day(end) else { return nil }
        return Int((b.timeIntervalSince(a) / 86_400).rounded())
    }

    /// With a race, the plan runs from the start to the race: the shortest accepted length that still holds the race day ("8 semanas até lá").
    /// nil when the race is before the start or beyond the longest plan (`838:3864` "Esta versão monta planos de até 16 semanas").
    static func planWeeks(start: String, race: String) -> Int? {
        guard let gap = days(from: start, to: race), gap >= 0 else { return nil }
        return planLengths.first { gap < $0 * 7 }
    }

    /// D04 A (`1491:8266`): a 5 km, 10 km or half marathon needs at least 7 days from the plan's start (the engine's
    /// `event.withinHorizonAndNotImmediate`; a marathon closer is the preparatory plan, never an error). Repeated here until the host gives
    /// the minimum and maximum race days (the frame's Dev Mode note; open item of #101).
    static let minimumDaysToRace = 7

    static func firstRaceDay(start: String) -> String? {
        guard let s = Fmt.day(start), let d = Fmt.calendar.date(byAdding: .day, value: minimumDaysToRace, to: s) else { return nil }
        return Fmt.dayString(d)
    }

    /// The last race day a plan from `start` can hold (`838:3864` "Escolha uma data até …").
    static func lastRaceDay(start: String) -> String? {
        guard let s = Fmt.day(start), let last = Fmt.calendar.date(byAdding: .day, value: (planLengths.last ?? 16) * 7 - 1, to: s) else { return nil }
        return Fmt.dayString(last)
    }

    /// The decisions that keep this draft from being sent, in the order of the flow.
    var holds: [BuildHold] {
        var h: [BuildHold] = []
        if train != .both { h.append(.singleSport) }
        if runs, runAim?.race == nil { h.append(.noRaceWeeks) }
        if runAim == .noRace(.startRunning), runStart == .stopped, let r = recentRunDaysChoice, r != .none { h.append(.beginnerRecent) }
        if care.contains(.pregnancyOrPostpartum) { h.append(.pregnancyCode) }
        if hasResult == true, resultMeasure == .test { h.append(.testMeasure) }
        return h
    }

    /// The six flags: "Nenhum destes" answers each one "não" and confirms the nonclinical statement. With an item marked, the marked flags are
    /// true and the others stay unanswered (nil, omitted): an unmarked box is never read as "não".
    var eligibility: EligibilityScreen {
        func flag(_ i: CareItem) -> Bool? { careNone ? false : (care.contains(i) ? true : nil) }
        return EligibilityScreen(status: careNone ? .nonclinicalConfirmed : nil, assessedAt: "", pain: flag(.pain), persistentPain: flag(.persistentPain),
                                 injury: flag(.injury), illness: flag(.illness), functionalLimitation: flag(.functionalLimitation), clinicalConcern: flag(.clinicalConcern))
    }

    /// SSCTR 27/11 (D12, D13): "Nunca corri" and "Já corri e parei" send 0 (never the past months); otherwise the band of 22.
    var runTrainingMonths: Int? {
        guard runAim == .noRace(.startRunning) else { return runBand?.months }
        switch runStart {
        case .never, .stopped: return 0
        case .current: return runBand?.months
        case nil: return nil
        }
    }

    /// The last four weeks. Strength days come from 25 ("Nunca treinei" is zero days, the athlete's own answer). Running: "Nunca corri" is
    /// zero (true facts); "Já corri e parei" sends the days of 21b, and zero minutes only with "Nenhum"; everyone else the counters of 21.
    var recent: RecentTraining? {
        let strengthDaysPerWeek = strengthBand == .never ? 0 : recentStrengthDays
        guard let strengthDaysPerWeek else { return nil }
        func with(_ d: Int, _ m: Int, _ l: Int) -> RecentTraining {
            RecentTraining(strengthDaysPerWeek: strengthDaysPerWeek, runDaysPerWeek: d, runMinutesPerWeek: m, longestRunMinutes: l)
        }
        if runAim == .noRace(.startRunning) {
            switch runStart {
            case .never: return with(0, 0, 0)
            case .stopped: return recentRunDaysChoice == RecentRunDays.none ? with(0, 0, 0) : nil
            case .current, nil: break
            }
        }
        guard let d = recentRunDays, let m = recentRunMinutes, let l = longestRunMinutes else { return nil }
        return with(d, m, l)
    }

    var anchors: [PerformanceAnchor]? {
        // "Nunca corri" is not asked for a result (23 is not in its flow): no anchor, truthfully.
        guard hasResult == true else { return hasResult == false || runStart == .never ? [] : nil }
        guard let d = resultDistance, let total = resultTotalSeconds, let day = resultDay, let measure = resultMeasure,
              let kind = measure.kind, let effort = resultEffort, let tolerated = resultTolerated else { return nil }
        return [PerformanceAnchor(kind: kind, distance: d.rawValue, seconds: Double(total), date: day, measurement: measure.measurement,
                                  rpe: Double(effort), tolerated: tolerated)]
    }

    /// The shared request, or why it cannot be sent. `today` dates the eligibility answer; `startDate` is the plan's first day (next Monday).
    func build(athleteId: String, today: String, startDate: String) -> IntakeBuild {
        let h = holds
        if !h.isEmpty { return .held(h) }
        // Today only a race reaches here (D03 and D05 hold the rest): the weeks come from the race day.
        guard train == .both, let aim = runAim, let race = aim.race, let raceDay, let weeks = Self.planWeeks(start: startDate, race: raceDay),
              let strengthAim, let age, let runMinutes, let longRunMinutes, let strengthMinutes, let longRunDay, let runTurn, let strengthTurn,
              let equipment = equipmentCodes, let runMonths = runTrainingMonths, let strengthBand, let recent, let anchors,
              careNone || !care.isEmpty else { return .incomplete }
        var e = eligibility; e.assessedAt = today
        let athlete = AthleteIntake(id: athleteId, ageYears: age, eligibility: e, specialPopulation: [], strengthTrainingMonths: strengthBand.months,
                                    runTrainingMonths: runMonths, exerciseRotationPreference: "COACH_DECIDES",
                                    goals: IntakeGoals(run: RunGoal(kind: "RACE", event: GoalEvent(kind: race.rawValue, date: raceDay)), strength: strengthAim.rawValue),
                                    equipment: equipment, recent: recent, performanceAnchors: anchors)
        let schedule = TrainingSchedule(strengthDays: strengthDays.sorted(), strengthMinutes: strengthMinutes, runDays: runDays.sorted(), runMinutes: runMinutes,
                                        longRunMinutes: longRunMinutes, longRunDay: longRunDay, runTurn: runTurn.engineTurn, strengthTurn: strengthTurn.engineTurn)
        return .ready(OnboardingAnswers(athlete: athlete, schedule: schedule, weeks: weeks, startDate: startDate))
    }

    /// 29: "Treino" is necessary (the plan is built only with it); the other two are the athlete's toggles, off until turned on.
    var consents: Consents { Consents(coaching: true, healthSignals: consentHealthSignals, learning: consentLearning) }
}
