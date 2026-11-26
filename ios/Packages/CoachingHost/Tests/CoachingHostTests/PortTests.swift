import Foundation
import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation
import IntegrationContracts

/// A handoff §7 tests 4, 5 and 7, and the original handoff's 8–10, through THIS package's `CoachingWriting` / `CoachingReading` (the JSContext
/// over the native store, the Keychain anchor and the production Keychain key): the cases of CoachingPresentation's EndToEndBoundaryTests,
/// the FND-ABC-04/04b gate (persistent across a reopen and a reinstall), SEC-FPV-01 (N-3), the warning-sign gate (18a ii), WriteOutcome,
/// SSCTR-BC-01 and the heart-rate profile operations.
final class PortTests: XCTestCase {
    func sets(_ h: CoachingHost) async throws -> [String: WarningSignQuestionSet] {
        var out: [String: WarningSignQuestionSet] = [:]
        for c in WellbeingCondition.allCases.map(\.rawValue) + ["READINESS"] { out[c] = try await h.warningSignSet(condition: c).get() }
        return out
    }
    func executableIds(_ h: CoachingHost) async throws -> [String] { try await h.allWeeks().get().flatMap(\.sessions).filter(\.executable).map(\.id) }
    func startable(_ h: CoachingHost) async throws -> [Startability] { var r: [Startability] = []; for id in try await executableIds(h) { r.append(await h.startability(sessionId: id)) }; return r }

    // MARK: test 4 — the EndToEndBoundaryTests cases through the host

    func testSpecialPopulationBlocksThePlan() async throws {
        for (name, sp) in [("pregnancy", [SpecialPopulation.pregnancy]), ("postpartum", [.postpartum])] {
            let f = try await HostFixture.make("e2e-\(name)")
            let o = await f.host.onboard(Athlete.answers(special: sp), consents: Athlete.all)
            XCTAssertEqual(o.answer.planOutcome, .outsideV1Scope(reason: "Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1"), name)
            XCTAssertEqual(o.answer.enrolled, false)
            guard case .failure(let e) = await f.host.plan(week: nil) else { return XCTFail("a plan for \(name)") }
            XCTAssertEqual(e.code, "NOT_ENROLLED", "no plan, never an empty plan")
            TestEnv.cleanup("e2e-\(name)")
        }
        let f = try await HostFixture.make("e2e-none")
        let _v1 = (await f.host.onboard(Athlete.answers(), consents: Athlete.all)).answer.planOutcome
        XCTAssertEqual(_v1, .planCreated)
        let _v2 = try await f.host.plan(week: nil).get().state
        XCTAssertEqual(_v2, .validPlan)
        TestEnv.cleanup("e2e-none")
    }

    /// FND-ABC-04 (and test 5): the restart declaring postpartum is refused; the engine keeps the earlier plan executable; the host starts
    /// nothing, after a reopen, and after a reinstall (with the first-launch reconciliation); only an accepted intake or the account erasure
    /// releases it.
    func testRestartOutsideScopeGate() async throws {
        let f = try await HostFixture.make("fnd04")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        f.clock.set(day: "2026-11-20", "10:00")
        let r = await f.host.restart(Athlete.answers(special: [.postpartum], start: "2026-11-23", assessedAt: "2026-11-20"))
        XCTAssertEqual(r.answer.planOutcome, .outsideV1Scope(reason: "Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1"))
        let _v3 = try await f.host.plan(week: nil).get().state
        XCTAssertEqual(_v3, .validPlan, "pinned: the engine keeps the earlier plan in force")
        let ids = try await executableIds(f.host); XCTAssertFalse(ids.isEmpty)
        for s in try await startable(f.host) { XCTAssertEqual(s, .notStartable(reason: .outsideV1Scope)) }
        // A new process over the same store and Keychain.
        let g = try await f.reopen()
        for s in try await startable(g.host) { XCTAssertEqual(s, .notStartable(reason: .outsideV1Scope), "after reopening the process") }
        // An accepted intake releases it.
        let ok = await g.host.restart(Athlete.answers(start: "2026-11-23", assessedAt: "2026-11-20"))
        XCTAssertEqual(ok.answer.planOutcome, .planCreated)
        let after = try await startable(g.host); XCTAssertFalse(after.isEmpty); XCTAssertTrue(after.contains(.startable), "\(after)")
        emit("fnd-abc-04", ["refused": "outsideV1Scope", "afterReopen": "outsideV1Scope", "releasedBy": "planCreated"])
        TestEnv.cleanup("fnd04")
    }

    /// FND-ABC-04b: a clinical restart, the same gate (including the reinstall and the eraseAccount release), and the wellbeing route with a flag.
    func testClinicalRestartGateAndReinstall() async throws {
        let f = try await HostFixture.make("fnd04b")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        f.clock.set(day: "2026-11-20", "10:00")
        let r = await f.host.restart(Athlete.answers(start: "2026-11-23", assessedAt: "2026-11-20", pain: true))
        XCTAssertEqual(r.answer.planOutcome, .clinicalHumanRequired)
        let _v4 = try await executableIds(f.host).isEmpty
        XCTAssertFalse(_v4, "pinned: the engine keeps the earlier plan executable")
        for s in try await startable(f.host) { XCTAssertEqual(s, .notStartable(reason: .clinicalHumanRequired)) }
        // Reinstall: the container (store, signals, marker) is deleted with the app; the Keychain survives. The reconciliation clears the
        // Keychain; there is no record, so nothing is startable; RECORD_LOST is not what the athlete meets.
        try FileManager.default.removeItem(at: TestEnv.rootNoClean("fnd04b"))
        let g = try await f.reopen()
        XCTAssertEqual(g.host.reconciliation, .freshInstallPurged)
        guard case .failure(let e) = await g.host.plan(week: nil) else { return XCTFail("a plan after a reinstall") }
        XCTAssertEqual(e.code, "NOT_ENROLLED", "a reinstall is a new install, never RECORD_LOST")
        let _v5 = await g.host.startability(sessionId: "w0-run-d1")
        XCTAssertEqual(_v5, .notStartable(reason: .recordUnavailable))
        XCTAssertEqual(g.callsAtOpen, ["purge:FRESH_INSTALL", "deliveryConditionsChanged"], "purge after the reconciliation, then available")
        // eraseAccount also releases the signal: a second athlete flow over a fresh record.
        g.clock.set(day: "2026-11-20", "11:00")
        _ = await g.host.onboard(Athlete.answers(start: "2026-11-23", assessedAt: "2026-11-20"), consents: Athlete.all)
        _ = await g.host.restart(Athlete.answers(start: "2026-11-23", assessedAt: "2026-11-20", pain: true))
        let _v6 = await g.host.startability(sessionId: try await executableIds(g.host).first ?? "-")
        XCTAssertEqual(_v6, .notStartable(reason: .clinicalHumanRequired))
        let _v7 = (await g.host.eraseAccount()).answer.ok
        XCTAssertTrue(_v7)
        XCTAssertNil(g.host.signals.current.scope, "released by the account erasure")
        TestEnv.cleanup("fnd04b")
    }

    func testWarningSignFlowsAndTheRoute() async throws {
        let f = try await HostFixture.make("signs")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        let s = try await sets(f.host)
        XCTAssertEqual(s["READINESS"]?.warningSigns.count, 15); XCTAssertTrue(s.values.allSatisfy { $0.warningSigns.count >= 9 }, "9/13/15 per condition, from the engine")
        // Unanswered sign: ASK, and nothing startable until it is answered (18a ii, handoff 5.4).
        var unanswered = try WellbeingDeclaration(condition: .minorDiscomfort, set: s["MINOR_DISCOMFORT"]!, intent: .reduceLight, days: 2)
        for x in unanswered.warningSigns.asked.dropFirst() { try unanswered.warningSigns.answer(x, false) }
        f.clock.set(day: "2026-11-18", "09:00")
        let ask = await f.host.submit(ReviewRequest(.notFeeling100(unanswered, reports: []), eligibility: Athlete.screen("2026-11-18")))
        XCTAssertEqual(ask.answer.status, "ASK")
        let probe = try await f.host.allWeeks().get().flatMap(\.sessions).first { $0.date >= "2026-11-18" && $0.sport == "RUN" }!.id
        let _v8 = await f.host.startability(sessionId: probe)
        XCTAssertEqual(_v8, .notStartable(reason: .projected), "the view projects the week under the question")
        XCTAssertTrue(f.host.signals.current.warningSignsAsked)
        // All answered "no": a complete screen, the plan kept, startable again.
        var allNo = try WellbeingDeclaration(condition: .minorDiscomfort, set: s["MINOR_DISCOMFORT"]!, intent: .reduceLight, days: 2)
        for x in allNo.warningSigns.asked { try allNo.warningSigns.answer(x, false) }
        let keep = await f.host.submit(ReviewRequest(.notFeeling100(allNo, reports: []), eligibility: Athlete.screen("2026-11-18")))
        XCTAssertTrue(keep.answer.ok); XCTAssertFalse(f.host.signals.current.warningSignsAsked)
        let _v9 = try await f.host.plan(week: nil).get().state
        XCTAssertEqual(_v9, .validPlan)
        // A "yes": the hold; BLOCKED, no prescription; readiness is the exit.
        var yes = try WellbeingDeclaration(condition: .unusualFatigue, set: s["UNUSUAL_FATIGUE"]!, intent: .reduceLight, days: 2)
        for x in yes.warningSigns.asked { try yes.warningSigns.answer(x, x == "swelling") }
        let hold = await f.host.submit(ReviewRequest(.notFeeling100(yes, reports: []), eligibility: Athlete.screen("2026-11-18")))
        XCTAssertEqual(hold.answer.status, "CLINICAL_HUMAN_REQUIRED")
        let blocked = try await f.host.plan(week: nil).get()
        XCTAssertEqual(blocked.state, .blocked); XCTAssertTrue(blocked.week!.sessions.allSatisfy { !$0.executable && $0.prescription == nil })
        let _v10 = await f.host.startability(sessionId: probe)
        XCTAssertEqual(_v10, .notStartable(reason: .blocked))
        var ready = try ReadinessDeclaration(declaredRecovered: true, set: s["READINESS"]!, sports: .init(run: .init(ready: true), strength: .init(ready: true, restrictions: [])))
        for x in ready.warningSigns.asked { try ready.warningSigns.answer(x, false) }
        f.clock.set(day: "2026-11-21", "09:00")
        let _v11 = (await f.host.submit(ReviewRequest(.readiness(ready, reports: []), eligibility: Athlete.screen("2026-11-21")))).answer.ok
        XCTAssertTrue(_v11)
        let _v12 = try await f.host.plan(week: nil).get().state
        XCTAssertNotEqual(_v12, .blocked, "the readiness declaration is the exit")
        TestEnv.cleanup("signs")
    }

    /// Test 7 (GAP-12 / FND-ABC-01): the unplanned pair WITHOUT observedAt (impossible by type: injected JSON) is answered recorded 2, kept 1;
    /// with observedAt, kept 2. And the planned run stopped for a symptom raises the screen: nothing startable (FND-ABC-02 route).
    func testWriteOutcomeKeptAndSymptomStop() async throws {
        let f = try await HostFixture.make("kept")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        let loose = AthleteObservation.unplannedRun(occurrenceDate: "2026-11-21", observedAt: "2026-11-21T18:10:00-03:00", actual: UnplannedRunActual(completed: true, minutes: 30, rpe: 3), response: .unknown)
        let str = AthleteObservation.unplannedStrength(occurrenceDate: "2026-11-21", observedAt: "2026-11-21T20:40:00-03:00",
            actual: StrengthActual(completed: true, minutes: 35, exercises: [LoggedExerciseEntry(id: "goblet-squat", sets: [LoggedSetEntry(reps: 8, load: LoggedLoadEntry(value: 16, unit: .kg, convention: .singleImplement), rir: 3)])]),
            response: .unknown)
        let both = ReviewRequest(.sessionReports([loose, str]), eligibility: Athlete.screen("2026-11-21"))
        f.clock.set(day: "2026-11-21", "21:00")
        let w = await f.host.submit(both)
        XCTAssertEqual(w.answer.recorded?.count, 2); XCTAssertEqual(w.kept.count, 2); XCTAssertEqual(w.notKept, [])
        // The same pair without observedAt, injected (a second athlete).
        let g = try await HostFixture.make("kept-raw")
        _ = await g.host.onboard(Athlete.answers(), consents: Athlete.all)
        g.clock.set(day: "2026-11-21", "21:00")
        var o = try JSONSerialization.jsonObject(with: Data(try JSONText.encode(both).utf8)) as! [String: Any]
        o["observations"] = (o["observations"] as! [[String: Any]]).map { var x = $0; x.removeValue(forKey: "observedAt"); return x }
        let json = String(data: try JSONSerialization.data(withJSONObject: o), encoding: .utf8)!
        XCTAssertFalse(json.contains("observedAt"))
        let raw = await g.host.submitRawForTesting(json, screened: true)
        XCTAssertEqual(raw.answer.recorded?.count, 2, "the answer lists both"); XCTAssertEqual(raw.kept.count, 1); XCTAssertEqual(raw.notKept.count, 1, "FND-ABC-01")
        // Symptom stop on a planned run.
        let stop = AthleteObservation.plannedRun(sessionId: "w0-run-d1", occurrenceDate: "2026-11-17", observedAt: "2026-11-17T07:20:00-03:00",
                                                 actual: PlannedRunActual(completed: false, minutes: 12, rpe: 7, stop: RunStop(reason: .symptom)), response: .unknown)
        let h = try await HostFixture.make("stop")
        _ = await h.host.onboard(Athlete.answers(), consents: Athlete.all)
        h.clock.set(day: "2026-11-17", "19:00")
        let a = await h.host.submit(ReviewRequest(.sessionReports([stop]), eligibility: Athlete.screen("2026-11-17")))
        XCTAssertEqual(a.answer.warningSignScreen?.status, "REQUIRED"); XCTAssertEqual(a.answer.warningSignScreen?.reason, "RUN_STOPPED_FOR_A_SYMPTOM")
        let next = try await executableIds(h.host).first!
        let _v13 = await h.host.startability(sessionId: next)
        XCTAssertEqual(_v13, .notStartable(reason: .screenRequired))
        emit("write-outcome", ["withObservedAtKept": w.kept.count, "withoutObservedAtKept": raw.kept.count, "withoutObservedAtNotKept": raw.notKept.count])
        for n in ["kept", "kept-raw", "stop"] { TestEnv.cleanup(n) }
    }

    /// SEC-FPV-01 / N-3 (the report's case): "not 100%" with its signs unanswered opens no hold; its erasure drops the question and the view is
    /// executable again; the host starts nothing, also after reopening the process, until a new screen is recorded.
    func testSecFpv01AfterErasure() async throws {
        let f = try await HostFixture.make("n3")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        let s = try await sets(f.host)
        var w = try WellbeingDeclaration(condition: .unusualFatigue, set: s["UNUSUAL_FATIGUE"]!, intent: .reduceLight, days: 2)
        try w.warningSigns.answer(w.warningSigns.asked[1], false)
        f.clock.set(day: "2026-11-18", "09:00")
        let ask = await f.host.submit(ReviewRequest(.notFeeling100(w, reports: []), eligibility: Athlete.screen("2026-11-18")))
        XCTAssertEqual(ask.answer.status, "ASK")
        // The report's own event id (the security probe r3 erases exactly it: an ASK writes no fact row).
        let eventId = try XCTUnwrap((try JSONSerialization.jsonObject(with: Data(f.host.lastAnswerJSON!.utf8)) as? [String: Any])?["eventId"] as? String)
        let _v90 = await f.host.eraseHealthFacts(eventIds: [eventId])
        XCTAssertTrue(_v90.answer.ok)
        let view = try await f.host.plan(week: nil).get()
        let id = try XCTUnwrap(view.week?.sessions.first { $0.executable }?.id, "the view shows the plan executable again (the residual)")
        let _v15 = await f.host.startability(sessionId: id)
        XCTAssertEqual(_v15, .notStartable(reason: .screenRequired))
        let g = try await f.reopen()
        let _v16 = await g.host.startability(sessionId: id)
        XCTAssertEqual(_v16, .notStartable(reason: .screenRequired), "the signal persists across a new process")
        let _v17 = (await g.host.submit(ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-11-18")))).answer.ok
        XCTAssertTrue(_v17)
        let _v18 = await g.host.startability(sessionId: id)
        XCTAssertEqual(_v18, .startable, "a new screen recorded releases it")
        emit("n3-sec-fpv-01", ["afterErasure": "screenRequired", "afterReopen": "screenRequired", "afterNewScreen": "startable"])
        TestEnv.cleanup("n3")
    }

    /// SSCTR-BC-01: a weekly report answered NOT_RECORDED by an ASK (no current screen) is recorded when re-sent in the same request as the screen.
    func testBC01ResendWithTheScreen() async throws {
        let f = try await HostFixture.make("bc01")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        let run = AthleteObservation.plannedRun(sessionId: "w0-run-d1", occurrenceDate: "2026-11-17", observedAt: "2026-11-17T07:40:00-03:00",
                                                actual: PlannedRunActual(completed: true, minutes: 40, rpe: 4), response: .unknown)
        f.clock.set(day: "2026-12-02", "20:00")        // the intake's screen (2026-11-13) is older than 14 days: the engine asks for a current one
        let first = await f.host.submit(ReviewRequest(.sessionReports([run]), eligibility: nil))
        let notRecorded = first.answer.notRecorded?.count ?? 0
        XCTAssertTrue(first.answer.status == "ASK" || notRecorded > 0, "\(first.answer.status?.raw ?? "-") \(first.answer.error?.code.raw ?? "")")
        let again = await f.host.submit(ReviewRequest(.sessionReports([run]), eligibility: Athlete.screen("2026-12-02")))
        XCTAssertTrue(again.answer.ok); XCTAssertEqual(again.kept.count, 1, "recorded with the screen in the same request")
        emit("ssctr-bc-01", ["firstStatus": first.answer.status?.raw ?? "-", "secondKept": String(again.kept.count)])
        TestEnv.cleanup("bc01")
    }

    func testHeartRateProfileOperations() async throws {
        let f = try await HostFixture.make("hr")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        let set = try await f.host.setHeartRateProfile(HeartRateProfileRequest(maxHeartRateBpm: .some(195))).get()
        XCTAssertTrue(set.ok); XCTAssertEqual(set.heartRateProfile?.added.count, 1); XCTAssertEqual(set.fiveZones?.status, "AVAILABLE")
        let _v19 = try await f.host.presentation().get().readings?.runCalibration?.heartRateFiveZones
        let z = try XCTUnwrap(_v19)
        XCTAssertEqual(z.reference?.kind, "ATHLETE_DECLARED_MAXIMUM"); XCTAssertEqual(z.zones?.map(\.maxBpm), [126, 157, 173, 189, nil])
        guard case .failure(let bad) = await f.host.setHeartRateProfile(HeartRateProfileRequest(zoneUpperBpm: .some([150, 140, 165, 180]))) else { return XCTFail("accepted") }
        XCTAssertEqual(bad.code, "INVALID_REQUEST"); XCTAssertEqual(bad.fields, ["zoneUpperBpm.strictlyIncreasing"])
        let erased = try await f.host.eraseHeartRateProfile().get()
        XCTAssertEqual(erased.erased?.count, 1)
        let _v20 = try await f.host.presentation().get().readings?.runCalibration?.heartRateFiveZones
        let after = try XCTUnwrap(_v20)
        XCTAssertEqual(after.reference?.kind, "AGE_ESTIMATE"); XCTAssertEqual(after.reference?.bpm, 188)
        // Without COACHING consent: refused; the erasure still passes.
        _ = await f.host.setConsent(.coaching, granted: false)
        guard case .failure(let c) = await f.host.setHeartRateProfile(HeartRateProfileRequest(maxHeartRateBpm: .some(190))) else { return XCTFail("accepted without consent") }
        XCTAssertEqual(c.code, "CONSENT_REQUIRED"); XCTAssertEqual(c.purpose, "COACHING")
        let _v21 = try await f.host.eraseHeartRateProfile().get().ok
        XCTAssertTrue(_v21)
        TestEnv.cleanup("hr")
    }
}
