import CoachingPresentation
import Foundation

/// What the onboarding form collects, turned into the shared `OnboardingAnswers` only (handoff C §4). Safety fields: `specialPopulation` is
/// always sent (`[]` for "Nenhum destes"; no choice = cannot continue), the eligibility flags stay nil until answered (never false by default).
struct OnboardingDraft: Equatable {
    enum Care: Equatable { case pregnancy, postpartum, noneOfThese }
    /// Typed by the athlete; no default and no clamp: an age outside 18–80 is the engine's to refuse (POPULATION_OUTSIDE_V1_AGE_RANGE).
    var ageText = ""
    var age: Int? { Int(ageText.trimmingCharacters(in: .whitespaces)).flatMap { (1...120).contains($0) ? $0 : nil } }
    var runGoal = "RACE"
    var eventKind = "10K"
    var eventDate = Calendar.current.date(byAdding: .day, value: 84, to: Date()) ?? Date()
    var strengthGoal = "RUNNING_SUPPORT"
    var runMonths = 12
    var strengthMonths = 6
    var runDaysPerWeek = 3
    var runMinutesPerWeek = 120
    var longestRun = 50
    var strengthDaysPerWeek = 2
    var runDays: Set<Int> = [1, 3, 5]
    var strengthDays: Set<Int> = [0, 3]
    var longRunDay = 5
    var runMinutes = 40
    var strengthMinutes = 40
    var longRunMinutes = 70
    var runTurn = "AM"
    var strengthTurn = "PM"
    var weeks = 8
    var equipment: Set<String> = ["DUMBBELLS", "BENCH"]
    var anchorTime = ""
    var anchorDistance = "10K"
    var anchorDate = Calendar.current.date(byAdding: .day, value: -21, to: Date()) ?? Date()
    var hasAnchor = false
    var care: Care?
    var eligibility = EligibilityScreen(status: nil, assessedAt: "", pain: nil, persistentPain: nil, injury: nil, illness: nil, functionalLimitation: nil, clinicalConcern: nil)
    var consents: [ConsentPurpose: Bool] = [:]

    static func seconds(_ s: String) -> Double? {
        let parts = s.split(separator: ":").compactMap { Double($0) }
        guard (2...3).contains(parts.count), parts.count == s.split(separator: ":").count else { return nil }
        return parts.reduce(0) { $0 * 60 + $1 }
    }

    var careAnswered: Bool { care != nil }
    var eligibilityAnswered: Bool {
        let flags = [eligibility.pain, eligibility.persistentPain, eligibility.injury, eligibility.illness, eligibility.functionalLimitation, eligibility.clinicalConcern]
        return flags.allSatisfy { $0 != nil } && (eligibility.statesAClinicalFlag || eligibility.status == .nonclinicalConfirmed)
    }
    var consentsAnswered: Bool { ConsentPurpose.allCases.allSatisfy { consents[$0] != nil } }

    /// The shared request. `id` and the dates of the plan-local day come from the host side in integration (A sets the athlete id).
    func answers(athleteId: String, today: String, startDate: String) -> OnboardingAnswers? {
        guard let care, let age, eligibilityAnswered else { return nil }
        var e = eligibility; e.assessedAt = today
        let special: [SpecialPopulation] = care == .pregnancy ? [.pregnancy] : care == .postpartum ? [.postpartum] : []
        var anchors: [PerformanceAnchor] = []
        if hasAnchor, let s = Self.seconds(anchorTime) {
            anchors.append(PerformanceAnchor(kind: "RACE_RESULT", distance: anchorDistance, seconds: s, date: Fmt.dayString(anchorDate), measurement: "GPS"))
        }
        let event = runGoal == "RACE" ? GoalEvent(kind: eventKind, date: Fmt.dayString(eventDate)) : nil
        return OnboardingAnswers(
            athlete: AthleteIntake(id: athleteId, ageYears: age, eligibility: e, specialPopulation: special, strengthTrainingMonths: strengthMonths,
                                   runTrainingMonths: runMonths, exerciseRotationPreference: "COACH_DECIDES",
                                   goals: IntakeGoals(run: RunGoal(kind: runGoal, event: event), strength: strengthGoal), equipment: equipment.sorted(),
                                   recent: RecentTraining(strengthDaysPerWeek: strengthDaysPerWeek, runDaysPerWeek: runDaysPerWeek, runMinutesPerWeek: runMinutesPerWeek,
                                                          longestRunMinutes: longestRun),
                                   performanceAnchors: anchors),
            schedule: TrainingSchedule(strengthDays: strengthDays.sorted(), strengthMinutes: strengthMinutes, runDays: runDays.sorted(), runMinutes: runMinutes,
                                       longRunMinutes: longRunMinutes, longRunDay: longRunDay, runTurn: runTurn, strengthTurn: strengthTurn),
            weeks: weeks, startDate: startDate)
    }

    var consentsValue: Consents { Consents(coaching: consents[.coaching] ?? false, healthSignals: consents[.healthSignals] ?? false, learning: consents[.learning] ?? false) }
}
