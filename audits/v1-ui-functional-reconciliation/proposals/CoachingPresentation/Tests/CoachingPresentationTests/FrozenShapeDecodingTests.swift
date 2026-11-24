import XCTest
@testable import CoachingPresentation

/// Decodes what the FROZEN boundary really returned for a synthetic athlete (probes/out, captured by probes/capture-*.mjs). A field the
/// proposal types and the engine renamed or dropped fails here; an engine field the proposal ignores is allowed (screens use a subset).
final class FrozenShapeDecodingTests: XCTestCase {
    static let out = URL(fileURLWithPath: #filePath).deletingLastPathComponent().appendingPathComponent("../../../../probes/out").standardized
    func load<T: Decodable>(_ type: T.Type, _ name: String, at path: [String] = []) throws -> T {
        let data = try Data(contentsOf: Self.out.appendingPathComponent(name + ".json"))
        var obj: Any = try JSONSerialization.jsonObject(with: data)
        for k in path { obj = (obj as! [String: Any])[k]! }
        return try JSONDecoder().decode(T.self, from: try JSONSerialization.data(withJSONObject: obj, options: [.fragmentsAllowed]))
    }

    func testPlanViewsDecodeInEveryCapturedState() throws {
        let valid = try load(PlanView.self, "02-plan-w0", at: ["view"])
        XCTAssertEqual(valid.state, .validPlan)
        XCTAssertTrue(valid.week!.sessions.contains { $0.executable && $0.prescription?.exercises?.isEmpty == false })
        let blocked = try load(PlanView.self, "17-plan-blocked", at: ["view"])
        XCTAssertEqual(blocked.state, .blocked)
        XCTAssertEqual(blocked.hold?.guidance.wordingStatus, "INTERIM_PENDING_G04")
        XCTAssertTrue(blocked.week!.sessions.allSatisfy { !$0.executable && $0.prescription == nil })
        let returning = try load(PlanView.self, "19-plan-after-readiness", at: ["view"])
        XCTAssertEqual(returning.state, .returning)
        let question = try load(PlanView.self, "14-setPreferences", at: ["view"])
        XCTAssertEqual(question.state, .needsInput)
        XCTAssertEqual(question.question?.missingInputs, ["eligibility.currentAssessment"])
        XCTAssertTrue(question.week!.sessions.allSatisfy { !$0.executable })
        let pending = try load(PlanView.self, "actions-A2b-plan-after-substitution", at: ["view"])
        XCTAssertEqual(pending.state, .pendingConfirmation)
        XCTAssertNotNil(pending.pending?.decisionId)
    }

    func testAllWeeksDecode() throws {
        struct Weeks: Decodable { let weeks: [Week] }
        let w = try load(Weeks.self, "03-sessions")
        XCTAssertEqual(w.weeks.count, 12)
        let loads = w.weeks.flatMap(\.sessions).compactMap(\.prescription).flatMap { $0.exercises ?? [] }.compactMap(\.load)
        XCTAssertFalse(loads.isEmpty)
        XCTAssertTrue(loads.filter { $0.mode == "ESTABLISH" }.allSatisfy { $0.value == nil }, "an establishing load carries no number")
    }

    func testPresentationAndReadingsDecode() throws {
        let p = try load(PresentationSnapshot.self, "12-presentation-after-w0")
        let r = try XCTUnwrap(p.readings)
        XCTAssertEqual(r.runCalibration?.heartRateZones?.status, "UNAVAILABLE")
        XCTAssertEqual(r.runCalibration?.heartRateZones?.reason, "NO_MEASURED_HEART_RATE")
        XCTAssertEqual(r.runCalibration?.projection?.status, "UNAVAILABLE")
        XCTAssertEqual(r.runCalibration?.estimates?["MARATHON"]?.status, "UNAVAILABLE")
        XCTAssertEqual(r.runCalibration?.estimates?["10K"]?.display, "RANGE_FIRST_CENTRAL_NEVER_ALONE")
        XCTAssertEqual(r.runCalibration?.assessment?.status, "NOT_NEEDED")
        XCTAssertNil(r.runCalibration?.heartRateZones?.zones)
        XCTAssertEqual(r.runForecast?.planScenario?.status, "SHOWN")
        XCTAssertEqual(r.runForecast?.observedForecast?.reason, "NOT_ENOUGH_HISTORY")
        XCTAssertEqual(r.strengthExposure?.descriptiveOnly, true)
        XCTAssertEqual(r.paceInsights?.heartRateInput, false)
        let executions = (p.inForce ?? [:]).values.compactMap(\.execution)
        XCTAssertTrue(executions.contains { $0.measuredKm != nil }, "the device run carried a measured distance")
        let partial = try load(PresentationSnapshot.self, "actions-C4-presentation-after-partial")
        let e = try XCTUnwrap(partial.inForce?.values.first { $0.execution != nil }?.execution)
        XCTAssertNil(e.measuredKm, "a time-only report has no distance: nothing is invented")
        XCTAssertNil(e.declaredKm)
    }

    func testAnswersHistoryAndErrorsDecode() throws {
        let stop = try load(BoundaryAnswer.self, "actions-C1-run-stop-symptom")
        XCTAssertEqual(stop.warningSignScreen?.status, "REQUIRED")
        XCTAssertEqual(stop.warningSignScreen?.reason, "RUN_STOPPED_FOR_A_SYMPTOM")
        let stale = try load(BoundaryAnswer.self, "22-error-stale-version")
        XCTAssertEqual(stale.error?.code, "CONFLICT_STALE_VERSION")
        XCTAssertEqual(stale.state, .operationalError)
        let gone = try load(BoundaryAnswer.self, "actions-F5-plan-after-account-erase")
        XCTAssertEqual(gone.state, .noData)
        let before = try load(BoundaryAnswer.self, "25-import-before-start")
        XCTAssertEqual(before.error?.code, "BEFORE_RECORD_START")
        let h = try load(HistoryView.self, "26-history-final", at: ["history"])
        XCTAssertFalse(h.sessions.contains { $0.sessionId.isEmpty })
        XCTAssertEqual(h.sessions.count, 6, "the unlinked device run is on record but not in historyView (GAP-CORE-01)")
        let d = try load(DecisionDetail.self, "21-decision", at: ["decision"])
        XCTAssertEqual(d.action, "READINESS_RESTART")
    }

    func testUnknownStatesFailClosed() throws {
        let s = try JSONDecoder().decode([ClientState].self, from: Data(#"["REDUCED","SOMETHING_NEW","VALID_PLAN"]"#.utf8))
        XCTAssertEqual(s, [.unrecognized("REDUCED"), .unrecognized("SOMETHING_NEW"), .validPlan])
    }

    func testDisplayValueNeverCarriesAValueWithoutAvailability() {
        let ok = DisplayValue(availability: .available, value: 5.2, unit: "km", source: .healthKit)
        XCTAssertEqual(ok.value, 5.2)
        let none = DisplayValue<Double>(availability: .unsupported(reason: "NOT_IN_V1"), value: nil, unit: nil, source: .coachingCore)
        XCTAssertNil(none.value)
        XCTAssertFalse(Availability.missing(reason: nil).carriesValue)
        XCTAssertFalse(Availability.disabledInApp.carriesValue)
    }
}
