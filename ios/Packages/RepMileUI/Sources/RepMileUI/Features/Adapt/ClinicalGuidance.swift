import CoachingPresentation
import Foundation
import os

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
    static let knownCodes: Set<String> = [urgentCode, "PROFESSIONAL_ASSESSMENT"]

    /// The highest of the levels the engine gave; none (or only unknown codes) is the professional-assessment level. A level code this
    /// build does not know is a contract violation: reported (the code only) and still shown at the professional-assessment level (SSCTR C3).
    init(levels: [Code?]) {
        for raw in levels.compactMap({ $0?.raw }) where !Self.knownCodes.contains(raw) { ContractViolations.report("guidance.level", code: raw) }
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
    var clinicalGuidance: ClinicalGuidance? { clinicalGuidance(floor: nil) }

    /// The same, with `floor`: the level of the hold the app held before this write (`PlanView.clinicalGuidance`, the engine's own level).
    /// It counts only when the answer carries no view (`viewError`): such an answer tells no level of its own, so the standing hold's
    /// level stands and is never lowered to the professional-assessment default. An answer with a view is the engine's current word.
    func clinicalGuidance(floor: ClinicalGuidance?) -> ClinicalGuidance? {
        guard routesToHuman else { return nil }
        let own = view?.lastDecision.flatMap { d in decisionId != nil && d.decisionId == decisionId ? d.guidance?.level : nil }
        let read = ClinicalGuidance(levels: [own, view?.hold?.guidance.level])
        return view == nil ? read.raised(to: floor) : read
    }
}

extension PlanView {
    /// The guidance of the standing hold. Nil when nothing is held.
    var clinicalGuidance: ClinicalGuidance? {
        guard hold != nil || state == .blocked else { return nil }
        return ClinicalGuidance(levels: [hold?.guidance.level])
    }
}

/// Answers outside the frozen contract (e.g. a guidance level this build does not know). Logged with the field and the code only, never a
/// health value; each one once per process. Kept in memory for the tests.
enum ContractViolations {
    private static let lock = NSLock()
    /// Only read and written under `lock`.
    nonisolated(unsafe) private static var seen: [String] = []
    private static let log = Logger(subsystem: "fit.vilumo.repmile", category: "contract")

    static func report(_ field: String, code: String) {
        let entry = field + ":" + code
        let first = lock.withLock { () -> Bool in
            guard !seen.contains(entry) else { return false }
            seen.append(entry)
            return true
        }
        if first { log.error("contract violation \(field, privacy: .public): unknown code \(code, privacy: .public)") }
    }

    static var reported: [String] { lock.withLock { seen } }
}
