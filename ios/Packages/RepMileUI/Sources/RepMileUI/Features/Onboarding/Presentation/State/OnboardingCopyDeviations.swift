import Foundation

/// TEMPORARY DEVIATIONS (QRE/SSCTR review of PR #119, 27/11): Figma sentences the engine contradicts today. They stay in `copy.psv` and are
/// hidden only while false; the final text is a Founder Decision. Restoring one is flipping its switch (spec F-ONBOARDING-FIGMA §8).
enum OBCopyDeviation {
    /// 12 `867:2289` "Não sabe tudo? Você confirma no primeiro treino." — no first-session equipment confirmation exists.
    static let showConfirmInFirstWorkout = false
    /// 27 `836:3299` "Fica só na sua conta." — there is no account in V1 (#28); the answers stay on this iPhone.
    static let showOnlyInYourAccount = false
    /// 25 `838:1187` "Sem carga conhecida, a primeira semana é uma sessão curta de prática com o peso do corpo. As cargas vêm na semana
    /// seguinte." — true only with exactly one strength day and external equipment (SSCTR C1, engine replay matrix); shown then.
    static let showPracticeNoteAlways = false

    static func showsPracticeNote(_ d: OnboardingDraft) -> Bool {
        if showPracticeNoteAlways { return true }
        guard d.strengthDays.count == 1, let codes = d.equipmentCodes else { return false }
        return codes.contains { $0 != "BODYWEIGHT" }
    }
}
