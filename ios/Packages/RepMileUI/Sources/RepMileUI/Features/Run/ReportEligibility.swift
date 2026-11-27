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

    /// Every flag answered, and either one answered yes (the engine routes it to a human) or the athlete confirmed none applies (the rule of
    /// onboarding and of the history correction, #59).
    var answered: Bool {
        [pain, persistentPain, injury, illness, functionalLimitation, clinicalConcern].allSatisfy { $0 != nil } && (statesAClinicalFlag || status == .nonclinicalConfirmed)
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
