import CoachingPresentation
import Foundation

/// What the onboarding has collected so far (Figma 10). Every answer starts unanswered (nil, empty or false): nothing is pre-answered, a
/// wheel or a counter shows "—" until the athlete touches it (D17). Codable so the unsent answers stay on this iPhone ("Suas respostas ficam
/// neste iPhone", `838:4219`) and the flow resumes where it stopped (`838:3918`). Turned into the shared `OnboardingAnswers` only by
/// `OnboardingDraft+Answers`.
struct OnboardingDraft: Codable, Equatable, Sendable {
    // Etapa 1 · Objetivo
    var train: TrainChoice?
    var runAim: RunAim?
    /// The race day the athlete picked, as a local calendar day (#61b): `YYYY-MM-DD`.
    var raceDay: String?
    /// 05 "Tem um tempo em mente?": local only (D07). `goalSkipped` = "Seguir sem meta".
    var goalMinutes: Int?
    var goalSeconds: Int?
    var goalSkipped = false
    var strengthAim: StrengthAim?

    // Etapa 2 · Rotina (days: 0 = Monday … 6 = Sunday, the engine's convention)
    var runDays: Set<Int> = []
    var strengthDays: Set<Int> = []
    var runTurn: DayTurn?
    var strengthTurn: DayTurn?
    var longRunDay: Int?
    var runMinutes: Int?
    var longRunMinutes: Int?
    var strengthMinutes: Int?
    var strengthPlace: StrengthPlace?
    var gymItems: Set<GymItem> = []
    var runPlaces: Set<RunPlace> = []
    var runDevice: RunDevice?

    // Etapa 3 · Você
    var name = ""
    var age: Int?
    var heightCm: Int?
    var weightKg: Int?
    var bodySizeSkipped = false
    /// 20: "Agora não" chosen (connecting is unavailable: D15).
    var appleHealthAnswered = false
    var runStart: RunStart?
    var recentRunDaysChoice: RecentRunDays?
    var recentRunDays: Int?
    var recentRunMinutes: Int?
    var longestRunMinutes: Int?
    var runBand: TrainingBand?
    /// 23: nil until answered; false = "Não tenho resultado recente".
    var hasResult: Bool?
    var resultDistance: RaceDistance?
    /// D19 A (`1491:8444`): hours for the half marathon and the marathon only.
    var resultHours: Int?
    var resultMinutes: Int?
    var resultSeconds: Int?
    var resultDay: String?
    var resultMeasure: ResultMeasure?
    var resultEffort: Int?
    var resultTolerated: Bool?
    var resultConditions: ResultConditions?
    var strengthBand: TrainingBand?
    var recentStrengthDays: Int?
    var care: Set<CareItem> = []
    var careNone = false

    // Etapa 4 · Seu plano (the "Treino" use is necessary: sent as granted when the athlete builds the plan)
    var consentHealthSignals = false
    var consentLearning = false

    var runs: Bool { train?.runs ?? false }
    var lifts: Bool { train?.lifts ?? false }

    /// What "Academia completa", the chips or "Só peso do corpo" send (catalogue codes).
    var equipmentCodes: [String]? {
        switch strengthPlace {
        case nil: nil
        case .fullGym: StrengthPlace.fullGymEquipment.map(\.rawValue)
        case .buildingGym, .home: gymItems.map(\.rawValue).sorted()
        case .bodyweightOnly: ["BODYWEIGHT"]
        }
    }

    /// Whether the step has the answer it asks for. Respiros and optional screens are always answered.
    func answered(_ step: OnboardingStep) -> Bool {
        switch step {
        case .opening, .goalDone, .routineDone, .youDone, .name, .dataUse: true
        case .train: train != nil
        case .runAim: runAim != nil
        case .raceDate: raceDay != nil
        case .goalTime: goalSkipped || (goalMinutes != nil && goalSeconds != nil)
        case .strengthAim: strengthAim != nil
        case .week: train != nil && (!runs || (!runDays.isEmpty && runTurn != nil)) && (!lifts || (!strengthDays.isEmpty && strengthTurn != nil))
        case .longRun: longRunDay.map(runDays.contains) ?? false
        case .duration: train != nil && (!runs || (runMinutes != nil && longRunMinutes != nil)) && (!lifts || strengthMinutes != nil)
        case .strengthPlace: strengthPlace != nil && (strengthPlace?.asksEquipment != true || !gymItems.isEmpty)
        case .runPlace: !runPlaces.isEmpty
        case .runDevice: runDevice != nil
        case .age: age != nil
        case .bodySize: bodySizeSkipped || (heightCm != nil && weightKg != nil)
        case .appleHealth: appleHealthAnswered
        case .runStart: runStart != nil
        case .runRecentDays: recentRunDaysChoice != nil
        case .runNow: recentRunDays != nil && recentRunMinutes != nil && longestRunMinutes != nil
        case .runYears: runBand != nil
        case .result: hasResult == false || (resultDistance != nil && resultMinutes != nil && resultSeconds != nil
                                             && (resultDistance?.hasHours != true || resultHours != nil))
        case .resultDetail: resultDay != nil && resultMeasure != nil && resultEffort != nil && resultTolerated != nil && resultConditions != nil
        case .strengthYears: strengthBand != nil && (strengthBand == .never || recentStrengthDays != nil)
        case .care: careNone || !care.isEmpty
        }
    }

    /// 27: "Nenhum destes" is exclusive with every item.
    mutating func toggleCare(_ item: CareItem) {
        careNone = false
        if care.contains(item) { care.remove(item) } else { care.insert(item) }
    }
    mutating func chooseNoCare() { care = []; careNone = true }

    /// 09: a day toggled for a sport; the long-run day follows the run days (it must be one of them).
    mutating func toggle(day: Int, run: Bool) {
        if run {
            if runDays.contains(day) { runDays.remove(day) } else { runDays.insert(day) }
            if let l = longRunDay, !runDays.contains(l) { longRunDay = nil }
        } else {
            if strengthDays.contains(day) { strengthDays.remove(day) } else { strengthDays.insert(day) }
        }
    }

    /// 02: a new choice drops the answers of the sport no longer trained (they would otherwise be sent).
    mutating func choose(train t: TrainChoice) {
        train = t
        if !t.runs {
            runAim = nil; raceDay = nil; goalMinutes = nil; goalSeconds = nil; goalSkipped = false
            runDays = []; runTurn = nil; longRunDay = nil; runMinutes = nil; longRunMinutes = nil; runPlaces = []; runDevice = nil
            runStart = nil; recentRunDaysChoice = nil; recentRunDays = nil; recentRunMinutes = nil; longestRunMinutes = nil; runBand = nil
            hasResult = nil
        }
        if !t.lifts {
            strengthAim = nil; strengthDays = []; strengthTurn = nil; strengthMinutes = nil; strengthPlace = nil; gymItems = []
            strengthBand = nil; recentStrengthDays = nil
        }
    }

    /// 03: a race needs its date; another aim drops the race answers.
    mutating func choose(aim: RunAim) {
        if aim.race == nil { raceDay = nil; goalMinutes = nil; goalSeconds = nil; goalSkipped = false }
        if aim != .noRace(.startRunning) { runStart = nil; recentRunDaysChoice = nil }
        else if runAim != aim { recentRunDays = nil; recentRunMinutes = nil; longestRunMinutes = nil; runBand = nil }
        runAim = aim
    }

    /// The result's time in seconds (h:min:s for the half and the marathon, min:s otherwise).
    var resultTotalSeconds: Int? {
        guard let d = resultDistance, let m = resultMinutes, let s = resultSeconds else { return nil }
        if d.hasHours { guard let h = resultHours else { return nil }; return h * 3600 + m * 60 + s }
        return m * 60 + s
    }

    /// 23: another distance changes the wheel's columns and clears it (D19 A); nothing is carried over.
    mutating func choose(resultDistance d: RaceDistance) {
        if resultDistance != d { resultHours = nil; resultMinutes = nil; resultSeconds = nil }
        resultDistance = d; hasResult = true
    }

    /// 21 iniciante (SSCTR 27/11): "Nunca corri" ends the running questions; "Já corri e parei" asks 21b; "Corro hoje" asks 21 and 22. The
    /// answers of a branch no longer taken are dropped, so they are never sent.
    mutating func choose(start: RunStart) {
        runStart = start
        if start != .stopped { recentRunDaysChoice = nil }
        if start != .current { recentRunDays = nil; recentRunMinutes = nil; longestRunMinutes = nil; runBand = nil }
        if start == .never { hasResult = nil }
    }
}
