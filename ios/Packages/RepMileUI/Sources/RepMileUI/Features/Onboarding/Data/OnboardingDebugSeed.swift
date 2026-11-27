#if DEBUG
import Foundation

/// Debug launch arguments for UI tests and the visual captures (QUALITY_GATES §2b, "tela executada no estado da referência"): fixture
/// composition only, never the live store. `-onboardingSeed <persona>` writes the persona's answers to the fixture store; `-onboardingStep
/// <step>` resumes there (the resume screen `838:3918` unless `-onboardingPhase form`); `-onboardingPhase <phase>` opens an outcome.
/// Personas are the Figma's (Lucas `837:1144`, the marathon `838:913`/`838:1478`, its preparatory case `838:1568`, Rafa `838:853`,
/// Marina `838:1045`); every value is synthetic.
enum OnboardingDebugSeed {
    static func apply(arguments: [String], to store: OnboardingStoring, now: Date = Date()) {
        func value(_ flag: String) -> String? { arguments.firstIndex(of: flag).flatMap { arguments.indices.contains($0 + 1) ? arguments[$0 + 1] : nil } }
        guard let persona = value("-onboardingSeed") else { return }
        let step = value("-onboardingStep").flatMap(OnboardingStep.init(rawValue:)) ?? .dataUse
        store.save(OnboardingSaved(draft: draft(persona, now: now), step: step, profile: nil))
    }

    static func phase(arguments: [String]) -> String? {
        arguments.firstIndex(of: "-onboardingPhase").flatMap { arguments.indices.contains($0 + 1) ? arguments[$0 + 1] : nil }
    }

    static func draft(_ persona: String, now: Date) -> OnboardingDraft {
        let start = Calendar.current.nextDate(after: now, matching: DateComponents(weekday: 2), matchingPolicy: .nextTime) ?? now
        func day(_ offset: Int, from base: Date) -> String { Fmt.deviceDay(Calendar.current.date(byAdding: .day, value: offset, to: base) ?? base) }
        var d = OnboardingDraft()
        d.train = .both; d.strengthAim = .strength; d.name = "Lucas"; d.age = 32; d.heightCm = 178; d.weightKg = 76; d.appleHealthAnswered = true
        d.runDays = [1, 3, 5, 6]; d.strengthDays = [0, 2, 3]; d.runTurn = .night; d.strengthTurn = .morning; d.longRunDay = 5
        d.runMinutes = 60; d.longRunMinutes = 100; d.strengthMinutes = 55; d.strengthPlace = .fullGym; d.runPlaces = [.street]; d.runDevice = .watch
        d.recentRunDays = 4; d.recentRunMinutes = 200; d.longestRunMinutes = 80; d.runBand = .overTwoYears
        d.hasResult = true; d.resultDistance = .fiveK; d.resultMinutes = 21; d.resultSeconds = 48; d.resultDay = day(-6, from: now)
        d.resultMeasure = .officialRace; d.resultEffort = 9; d.resultTolerated = true; d.resultConditions = .normal
        d.strengthBand = .overTwoYears; d.recentStrengthDays = 3; d.careNone = true; d.consentHealthSignals = true; d.consentLearning = true
        d.runAim = .race(.tenK); d.raceDay = day(55, from: start); d.goalMinutes = 44; d.goalSeconds = 30
        switch persona {
        case "marathon":
            d.name = "Lucas"; d.runAim = .race(.marathon); d.raceDay = day(111, from: start); d.goalMinutes = 225; d.goalSeconds = 0
            d.runDays = [0, 1, 3, 4, 6]; d.strengthDays = [2]; d.longRunDay = 6; d.runMinutes = 70; d.longRunMinutes = 210
            d.recentRunDays = 5; d.recentRunMinutes = 360; d.longestRunMinutes = 150; d.hasResult = false
        case "marathon-prep":
            d.runAim = .race(.marathon); d.raceDay = day(111, from: start); d.goalMinutes = nil; d.goalSeconds = nil; d.goalSkipped = true
            d.runDays = [1, 3, 6]; d.strengthDays = [0, 2]; d.longRunDay = 6; d.runMinutes = 50; d.longRunMinutes = 120
            d.recentRunDays = 3; d.recentRunMinutes = 120; d.longestRunMinutes = 50; d.runBand = .sixMonthsToTwoYears; d.hasResult = false
        case "rafa":
            d.name = "Rafa"; d.runAim = .noRace(.regularity); d.raceDay = nil; d.goalMinutes = nil; d.goalSeconds = nil
            d.runDays = [1, 3, 6]; d.strengthDays = [0]; d.longRunDay = 6; d.hasResult = false
        case "marina":
            d.name = "Marina"; d.runAim = .noRace(.startRunning); d.raceDay = nil; d.goalMinutes = nil; d.goalSeconds = nil; d.runStart = .never
            d.runDays = [1, 3, 5]; d.strengthDays = [2]; d.longRunDay = 5; d.runMinutes = 20; d.longRunMinutes = 20; d.strengthMinutes = 15
            d.strengthPlace = .bodyweightOnly; d.recentRunDays = nil; d.recentRunMinutes = nil; d.longestRunMinutes = nil; d.runBand = nil; d.hasResult = nil
            d.strengthBand = .never; d.recentStrengthDays = nil
        case "beyond":   // `838:3864`: a race past the longest plan
            d.raceDay = day(140, from: start)
        case "home":     // `867:2289`: equipment at home
            d.strengthPlace = .home; d.gymItems = [.bench, .dumbbells, .machines]
        case "marina-stopped":   // `838:1093`
            d.name = "Marina"; d.runAim = .noRace(.startRunning); d.raceDay = nil; d.goalMinutes = nil; d.goalSeconds = nil; d.runStart = .stopped
            d.recentRunDaysChoice = RecentRunDays.none; d.recentRunDays = nil; d.recentRunMinutes = nil; d.longestRunMinutes = nil; d.runBand = nil; d.hasResult = false
        case "lucas-off":   // 29 with both optional uses off (the default)
            d.consentHealthSignals = false; d.consentLearning = false
        case "clinical":
            d.careNone = false; d.care = [.persistentPain]
        default: break
        }
        return d
    }
}
#endif

