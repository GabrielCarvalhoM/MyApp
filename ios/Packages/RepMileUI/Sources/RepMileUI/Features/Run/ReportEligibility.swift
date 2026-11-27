import CoachingPresentation

/// The eligibility screen an athlete report carries (#68). The engine records an athlete report only under a current screen sent with it
/// (`r6-adaptation.mjs` eligibility.currentAssessment: NONCLINICAL_CONFIRMED, assessed 0 to 14 days before, six booleans; a flag answered yes
/// routes to a human), and the athlete channel never reads one on record (`integration.mjs` review: only the device channel carries the
/// athlete's last screen). So each report asks it again: it starts `unanswered` (nothing pre-answered, nil ≠ false), cannot be sent until
/// answered, and is dated the day it is answered. An earlier screen is never carried into a later report, even inside the engine's window: a
/// "no" given before is not a current assessment (reusing one is an open Founder/SSCTR decision, #68).
extension EligibilityScreen {
    /// Six flags unanswered, not confirmed.
    static var unanswered: EligibilityScreen {
        EligibilityScreen(status: nil, assessedAt: "", pain: nil, persistentPain: nil, injury: nil, illness: nil, functionalLimitation: nil, clinicalConcern: nil)
    }

    /// A flag answered yes, or every flag answered and the athlete confirmed none applies.
    ///
    /// #70 (the #72 rule: a red flag never waits for answers the engine does not need): the engine routes a flag answered yes to a qualified
    /// human before it reads anything else of the screen (`r6-adaptation.mjs`: the clinical flags first, then the current-assessment check),
    /// so a lone "sim" with the five others unanswered gets the same answer as "sim" with five "não" at every athlete write site (status,
    /// guidance, nothing recorded, plan state; replay `audits/v1-ios-swiftui-2026-11-26/results/i70-correction-followups/`). Without a yes,
    /// nothing changes: every flag answered and confirmed, nil ≠ false. Onboarding keeps its own rule (`OnboardingDraft`, the intake path).
    var answered: Bool {
        statesAClinicalFlag
            || [pain, persistentPain, injury, illness, functionalLimitation, clinicalConcern].allSatisfy { $0 != nil } && status == .nonclinicalConfirmed
    }

    /// The screen as sent, dated `day` (the plan's today: never the device's, which can be a day ahead of the plan's); nil while it is not answered.
    func dated(_ day: String) -> EligibilityScreen? {
        guard answered else { return nil }
        var e = self; e.assessedAt = day
        return e
    }
}

extension BoundaryAnswer {
    /// The answer routes to a qualified human: a flag answered yes with this report, or a clinical dependency already on record (the plan is
    /// BLOCKED). Read from the answer, never from what the athlete ticked.
    var routesToHuman: Bool { ok && (status?.raw == "CLINICAL_HUMAN_REQUIRED" || view?.state == .blocked) }
}
