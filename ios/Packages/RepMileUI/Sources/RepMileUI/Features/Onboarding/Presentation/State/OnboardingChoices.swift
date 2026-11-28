import Foundation

// The answers of the onboarding (Figma 10 `551:5`), one type per question, with the engine word each maps to where the shared contract carries
// it. A case without an engine word is kept locally only (spec §5, F-ONBOARDING-FIGMA). Nothing here decides a sporting value.

/// 02 "O que você quer treinar?" (`835:2114`).
enum TrainChoice: String, Codable, CaseIterable, Sendable {
    case both, runOnly, strengthOnly
    var runs: Bool { self != .strengthOnly }
    var lifts: Bool { self != .runOnly }
}

/// 03 "Uma prova" (`835:2188`): the engine's event kinds (`r6-intake.mjs` EVENTS).
enum RaceDistance: String, Codable, CaseIterable, Sendable {
    case fiveK = "5K", tenK = "10K", half = "HALF_MARATHON", marathon = "MARATHON"
    /// 23 (D19 A, `1491:8444`): h:min:s for the half and the marathon; min:s for 5 and 10 km (10 km minutes may pass 59).
    var hasHours: Bool { self == .half || self == .marathon }
}

/// 03 "Sem prova": the engine's RUN_GOALS words.
enum NoRaceAim: String, Codable, CaseIterable, Sendable {
    case startRunning, regularity, performance
    /// SSCTR 27/11 (D06): "Começar a correr" is GENERAL, never PERFORMANCE; the word never decides walk/jog.
    var engineWord: String {
        switch self {
        case .startRunning: "GENERAL"
        case .regularity: "REGULAR"
        case .performance: "PERFORMANCE"
        }
    }
}

enum RunAim: Codable, Equatable, Sendable {
    case race(RaceDistance)
    case noRace(NoRaceAim)
    var race: RaceDistance? { if case .race(let d) = self { return d }; return nil }
}

/// 06 "E na força?" (`835:2349`): the engine's STRENGTH_GOALS words.
enum StrengthAim: String, Codable, CaseIterable, Sendable {
    case hypertrophy = "HYPERTROPHY", strength = "STRENGTH", general = "GENERAL", maintenance = "MAINTAIN"
}

/// 09 turn chips "Manhã / Tarde / Noite" (`862:2271`). The contract has AM/PM per sport (D10 interim, engineering decision 27/11).
enum DayTurn: String, Codable, CaseIterable, Sendable {
    case morning, afternoon, night
    var engineTurn: String { self == .morning ? "AM" : "PM" }
}

/// 12 "Onde você treina força?" (`836:624`, `867:2289`).
enum StrengthPlace: String, Codable, CaseIterable, Sendable {
    case fullGym, buildingGym, home, bodyweightOnly
    /// The presets whose equipment the athlete marks (`867:2289` "O que tem lá?").
    var asksEquipment: Bool { self == .buildingGym || self == .home }
    /// "Academia completa": the design's own stated assumption ("O plano conta com barra, rack, banco, halteres e máquinas.").
    static let fullGymEquipment: [GymItem] = [.barbell, .rack, .bench, .dumbbells, .machines]
}

/// The equipment chips of `867:2289`, as the catalogue's codes (`r7b-repertoire.mjs`). KETTLEBELL is never offered, so never sent.
enum GymItem: String, Codable, CaseIterable, Sendable {
    case barbell = "BARBELL", rack = "RACK", bench = "BENCH", dumbbells = "DUMBBELLS", machines = "MACHINES", pullUpBar = "PULL_UP_BAR", bands = "BANDS"
}

/// 13 "Onde você corre?" (`836:741`). Local profile only.
enum RunPlace: String, Codable, CaseIterable, Sendable { case street, treadmill, track, trail }

/// 14 "Na corrida, você usa" (`836:782`). Local profile only.
enum RunDevice: String, Codable, CaseIterable, Sendable { case iPhoneOnly, watch, chestStrap }

/// 21 iniciante "Você já correu antes?" (`838:1045`).
enum RunStart: String, Codable, CaseIterable, Sendable { case never, stopped, current }

/// 22 / 25 time bands. Months sent = the band's lower bound (D13, SSCTR 27/11): the engine reads only the categories (0 NONE, 1–5 NOVICE,
/// 6–23 INTERMEDIATE, ≥24 EXPERIENCED) and the six-month threshold. The value is a band code: never shown in a screen.
enum TrainingBand: String, Codable, CaseIterable, Sendable {
    case never, underSixMonths, sixMonthsToTwoYears, overTwoYears
    var months: Int {
        switch self {
        case .never: 0
        case .underSixMonths: 1
        case .sixMonthsToTwoYears: 6
        case .overTwoYears: 24
        }
    }
    /// 22 "Há quanto tempo você corre com regularidade?" has no "never".
    static let running: [TrainingBand] = [.underSixMonths, .sixMonthsToTwoYears, .overTwoYears]
}

/// 21b "Nas últimas 4 semanas, em quantos dias você correu?" (`838:1093`). "3 ou mais" sends its lower bound.
enum RecentRunDays: Int, Codable, CaseIterable, Sendable { case none = 0, one = 1, two = 2, threeOrMore = 3 }

/// 24 "Como foi medido" (`836:3049`): the evidence kind and measurement (D20: "Teste" waits for SSCTR).
enum ResultMeasure: String, Codable, CaseIterable, Sendable {
    case officialRace, track, test
    var kind: String? {
        switch self {
        case .officialRace: "RACE_RESULT"
        case .track: "TIME_TRIAL"
        case .test: nil
        }
    }
    var measurement: String? {
        switch self {
        case .officialRace: "OFFICIAL"
        case .track: "TRACK"
        case .test: nil
        }
    }
}

/// 24 "Condições". Local only until D20 (`conditions` is not in the contract's anchor).
enum ResultConditions: String, Codable, CaseIterable, Sendable { case normal, heatOrHill }

/// 27 "Algum destes vale para você hoje?" (`836:3299`): the six eligibility flags and the special-population item.
enum CareItem: String, Codable, CaseIterable, Sendable {
    case pain, persistentPain, injury, illness, functionalLimitation, clinicalConcern, pregnancyOrPostpartum
    var isClinical: Bool { self != .pregnancyOrPostpartum }
}
