import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #73: every clinical surface shows the engine's guidance level (`Guidance.level`). URGENT_CARE_ADVISED is shown as such and never lowered;
/// any other or a missing level shows the professional-assessment copy, never nothing. The captures are the real engine's
/// (`RepMileUI/Captures`, replay `audits/v1-ios-swiftui-2026-11-26/results/i73-guidance-level/`).
@MainActor
final class GuidanceLevelTests: XCTestCase {
    private func capture(_ name: String) throws -> BoundaryAnswer { try Repo.store.decode(BoundaryAnswer.self, name) }
    private func plan(_ name: String) throws -> PlanView { try Repo.store.decode(PlanView.self, name, at: "view") }
    private static let urgentSigns = ["chestPainPressureOrTightness", "breathlessAtRest", "palpitationsAtRest", "faintingOrDizziness"]

    // MARK: The mapping

    func testOnlyTheEnginesUrgentCodeIsUrgent() {
        XCTAssertEqual(ClinicalGuidance(levels: ["URGENT_CARE_ADVISED"]), .urgentCare)
        XCTAssertEqual(ClinicalGuidance(levels: ["PROFESSIONAL_ASSESSMENT"]), .professionalAssessment)
        XCTAssertEqual(ClinicalGuidance(levels: ["SOMETHING_NEW"]), .professionalAssessment, "an unknown level: the conservative existing copy")
        XCTAssertEqual(ClinicalGuidance(levels: [nil]), .professionalAssessment, "no level: never nothing")
        XCTAssertEqual(ClinicalGuidance(levels: []), .professionalAssessment)
        XCTAssertEqual(ClinicalGuidance(levels: ["PROFESSIONAL_ASSESSMENT", "URGENT_CARE_ADVISED"]), .urgentCare, "the higher level the engine gave")
    }

    func testALevelNeverFalls() {
        XCTAssertEqual(ClinicalGuidance.urgentCare.raised(to: .professionalAssessment), .urgentCare)
        XCTAssertEqual(ClinicalGuidance.professionalAssessment.raised(to: .urgentCare), .urgentCare)
        XCTAssertEqual(ClinicalGuidance.urgentCare.raised(to: nil), .urgentCare)
        XCTAssertNil(ClinicalGuidance?.none.raised(to: nil))
        XCTAssertEqual(ClinicalGuidance?.none.raised(to: .professionalAssessment), .professionalAssessment)
    }

    // MARK: Answers and plan views (real engine captures)

    func testAnUrgentSignWithTheScreenIsUrgent() throws {
        for sign in Self.urgentSigns {
            let a = try capture("nf-urgent-" + sign)
            XCTAssertEqual(a.view?.lastDecision?.decisionId, a.decisionId, "the host's view names this answer's decision")
            XCTAssertEqual(a.clinicalGuidance, .urgentCare, sign)
            XCTAssertEqual(NotFeeling100ViewModel.outcome(a), .blocked(.urgentCare), sign)
            XCTAssertEqual(ReadinessViewModel.reply(for: try capture("readiness-urgent-" + sign)), .stillBlocked(.urgentCare), sign)
        }
    }

    func testANonUrgentSignIsProfessionalAssessment() throws {
        XCTAssertEqual(try capture("actions-F1-notFeeling100-sign").clinicalGuidance, .professionalAssessment, "fever")
        XCTAssertEqual(try capture("16-notFeeling100-sign").clinicalGuidance, .professionalAssessment)
        XCTAssertEqual(ReadinessViewModel.reply(for: try capture("readiness-sign-gettingWorse")), .stillBlocked(.professionalAssessment))
        XCTAssertEqual(UnavailableDayViewModel.phase(afterSubmit: try capture("actions-E2-break-clinical")), .clinical(.professionalAssessment))
    }

    func testNoRouteNoLevel() throws {
        XCTAssertNil(try capture("actions-D1-notFeeling100-no-sign").clinicalGuidance, "KEEP")
        XCTAssertNil(try capture("14-setPreferences").clinicalGuidance, "ASK")
        XCTAssertNil(FixtureCoachingWriter.unavailable.clinicalGuidance, "an error is no route")
    }

    func testAClinicalRouteWithoutALevelIsNeverSilent() throws {
        // No view (the level the port exposes lives in it): the professional-assessment copy.
        XCTAssertEqual(try Safety.answer(#"{"ok":true,"status":"CLINICAL_HUMAN_REQUIRED"}"#).clinicalGuidance, .professionalAssessment)
        // A hold whose level this build does not know.
        let unknown = try Safety.answer(#"{"ok":true,"status":"CLINICAL_HUMAN_REQUIRED","decisionId":"d1","view":\#(view(hold: "SOMETHING_NEW", last: ("d1", nil)))}"#)
        XCTAssertEqual(unknown.clinicalGuidance, .professionalAssessment)
    }

    /// The view's last decision counts only when it is this answer's own; the hold's level always counts, and the higher one is shown.
    func testTheAnswersOwnDecisionAndTheHoldTheHigherWins() throws {
        let other = try Safety.answer(#"{"ok":true,"status":"CLINICAL_HUMAN_REQUIRED","decisionId":"d2","view":\#(view(hold: "PROFESSIONAL_ASSESSMENT", last: ("d1", "URGENT_CARE_ADVISED")))}"#)
        XCTAssertEqual(other.clinicalGuidance, .professionalAssessment, "another decision's level is not this answer's")
        let own = try Safety.answer(#"{"ok":true,"status":"CLINICAL_HUMAN_REQUIRED","decisionId":"d1","view":\#(view(hold: "PROFESSIONAL_ASSESSMENT", last: ("d1", "URGENT_CARE_ADVISED")))}"#)
        XCTAssertEqual(own.clinicalGuidance, .urgentCare)
        let holdUrgent = try Safety.answer(#"{"ok":true,"status":"CLINICAL_HUMAN_REQUIRED","decisionId":"d1","view":\#(view(hold: "URGENT_CARE_ADVISED", last: ("d1", "PROFESSIONAL_ASSESSMENT")))}"#)
        XCTAssertEqual(holdUrgent.clinicalGuidance, .urgentCare, "never lowered below the standing hold's level")
    }

    func testThePlanViewShowsTheHoldsLevel() throws {
        XCTAssertEqual(try plan("plan-blocked-urgent").clinicalGuidance, .urgentCare)
        XCTAssertEqual(try plan("17-plan-blocked").clinicalGuidance, .professionalAssessment)
        XCTAssertNil(try plan("13-plan-w1").clinicalGuidance)
    }

    // MARK: View models

    func testNotFeelingWithAnUrgentSignShowsTheUrgentRoute() async throws {
        for sign in Self.urgentSigns {
            let w = FixtureCoachingWriter(store: Repo.store)
            let vm = NotFeeling100ViewModel(reader: Safety.reader(), writer: w, planToday: { "2026-11-22" }, holdGuidance: { nil })
            await vm.choose(.mildIllness)
            vm.answers = ["feverOrChills": true, sign: true]
            vm.eligibility = .testNoneApplies
            await vm.send()
            XCTAssertEqual(vm.phase, .outcome(.blocked(.urgentCare)), "with a non-urgent sign too, the higher level: \(sign)")
        }
    }

    func testReadinessKeepsTheHoldAtItsLevel() async throws {
        let vm = ReadinessViewModel(reader: Safety.reader(), writer: FixtureCoachingWriter(store: Repo.store), planToday: { "2026-11-22" }, holdGuidance: { nil })
        await vm.load()
        let signs = try XCTUnwrap(vm.questionSet?.warningSigns)
        vm.recovered = true; vm.eligibility = .testNoneApplies
        vm.answers = Dictionary(uniqueKeysWithValues: signs.map { ($0, $0 == "breathlessAtRest") })
        await vm.send()
        XCTAssertEqual(vm.phase, .stillBlocked(.urgentCare))

        let other = ReadinessViewModel(reader: Safety.reader(), writer: FixtureCoachingWriter(store: Repo.store), planToday: { "2026-11-22" }, holdGuidance: { nil })
        await other.load()
        other.recovered = true; other.eligibility = .testNoneApplies
        other.answers = Dictionary(uniqueKeysWithValues: signs.map { ($0, $0 == "severeHeadache") })
        await other.send()
        XCTAssertEqual(other.phase, .stillBlocked(.professionalAssessment), "a sign \"sim\" keeps the hold: never the restart")
    }

    /// An answer without a view changed nothing: the hold the declaration answered keeps its level (never lowered by a failed write).
    func testAFailedReadinessKeepsTheHoldsUrgentLevel() async throws {
        let vm = ReadinessViewModel(reader: Safety.reader(), writer: FixtureCoachingWriter(store: Safety.emptyStore), planToday: { "2026-11-22" },
                                    holdGuidance: { .urgentCare })
        await vm.load()
        vm.recovered = true; vm.eligibility = .testNoneApplies
        vm.answers = Dictionary(uniqueKeysWithValues: (vm.questionSet?.warningSigns ?? []).map { ($0, false) })
        await vm.send()
        XCTAssertEqual(vm.phase, .stillBlocked(.urgentCare))
        XCTAssertEqual(ReadinessViewModel.reply(for: FixtureCoachingWriter.unavailable, holdGuidance: nil), .stillBlocked(.professionalAssessment))
    }

    func testAReportKeepsTheHigherLevelOverResends() throws {
        let urgent = try capture("nf-urgent-chestPainPressureOrTightness")
        let first = RunReportViewModel.result(for: WriteOutcome(answer: urgent, kept: [], notKept: []), screenRequiredBefore: false)
        XCTAssertEqual(first.clinical, .urgentCare)
        let later = RunReportViewModel.result(for: WriteOutcome(answer: try capture("actions-E2-break-clinical"), kept: [], notKept: []),
                                              screenRequiredBefore: false, clinicalBefore: first.clinical)
        XCTAssertEqual(later.clinical, .urgentCare, "a later professional-assessment answer never lowers what the report shows")
    }

    func testEveryCaptureOfFrontCDecodes() throws {
        let index = try JSONSerialization.jsonObject(with: Data(contentsOf: Repo.captures.appendingPathComponent("INDEX.json"))) as? [String: Any]
        let files = try XCTUnwrap(index?["files"] as? [[String: Any]]).compactMap { ($0["file"] as? String)?.replacingOccurrences(of: ".json", with: "") }
        XCTAssertEqual(files.count, 10)
        for name in files where name != "plan-blocked-urgent" { XCTAssertNotNil(try capture(name).clinicalGuidance, name) }
    }

    // A plan view JSON with a hold at `hold` and a last decision (id, level).
    private func view(hold: String, last: (String, String?)) -> String {
        let g = last.1.map { #","guidance":{"level":"\#($0)","wordingStatus":"INTERIM_PENDING_G04"}"# } ?? ""
        return #"{"state":"BLOCKED","version":3,"programHash":"h","today":"2026-11-22","weekIndex":0,"weeks":12,"sports":{},"#
            + #""hold":{"clinical":true,"since":null,"guidance":{"level":"\#(hold)","wordingStatus":"INTERIM_PENDING_G04"},"exit":"READINESS_DECLARATION"},"#
            + #""pending":null,"question":null,"week":null,"#
            + #""lastDecision":{"decisionId":"\#(last.0)","at":"2026-11-22T11:00:00.000Z","status":"CLINICAL_HUMAN_REQUIRED","action":"CLINICAL_HUMAN_REQUIRED","reason":null,"missingInputs":[]\#(g)}}"#
    }
}
