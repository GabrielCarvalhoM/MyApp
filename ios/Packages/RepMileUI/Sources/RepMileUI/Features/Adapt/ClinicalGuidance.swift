import CoachingPresentation

/// The guidance level of a clinical route, as the engine gives it (`Guidance.level`, INTERIM_PENDING_G04) and as the screens show it (#73).
/// The app derives no level: it reads the one the frozen port exposes. `BoundaryAnswer` carries none at its top level; the level of the
/// decision an answer made is in the plan view the host appends to it (`view.lastDecision.guidance`, when it is this answer's decision), and
/// the level of the standing hold in `view.hold.guidance`.
///
/// Fail closed: `urgentCare` only when the engine says URGENT_CARE_ADVISED. Any other level (PROFESSIONAL_ASSESSMENT, a code this build does
/// not know) and a missing one show the professional-assessment copy, never nothing. Never lowered: of the levels an answer carries, the
/// higher one is shown, and a screen that keeps one across resends keeps the higher (`raised(to:)`).
enum ClinicalGuidance: Comparable, Sendable {
    case professionalAssessment
    case urgentCare

    static let urgentCode = "URGENT_CARE_ADVISED"

    /// The highest of the levels the engine gave; none (or only unknown codes) is the professional-assessment level.
    init(levels: [Code?]) {
        self = levels.contains { $0?.raw == Self.urgentCode } ? .urgentCare : .professionalAssessment
    }

    /// The higher of this level and `other` (a later answer never lowers what a screen already shows).
    func raised(to other: ClinicalGuidance?) -> ClinicalGuidance { max(self, other ?? self) }
}

extension Optional where Wrapped == ClinicalGuidance {
    /// Sticky over resends: nil (no clinical route yet) takes the new level; a level only rises.
    func raised(to other: ClinicalGuidance?) -> ClinicalGuidance? {
        guard let self else { return other }
        return self.raised(to: other)
    }
}

extension BoundaryAnswer {
    /// The guidance of this answer's clinical route: the decision it made (only when the view's last decision is this answer's own) and
    /// the standing hold, the higher of the two. Nil when the answer does not route to a qualified human.
    var clinicalGuidance: ClinicalGuidance? {
        guard routesToHuman else { return nil }
        let own = view?.lastDecision.flatMap { d in decisionId != nil && d.decisionId == decisionId ? d.guidance?.level : nil }
        return ClinicalGuidance(levels: [own, view?.hold?.guidance.level])
    }
}

extension PlanView {
    /// The guidance of the standing hold. Nil when nothing is held.
    var clinicalGuidance: ClinicalGuidance? {
        guard hold != nil || state == .blocked else { return nil }
        return ClinicalGuidance(levels: [hold?.guidance.level])
    }
}
