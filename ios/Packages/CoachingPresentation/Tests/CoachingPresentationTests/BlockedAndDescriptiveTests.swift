import XCTest
@testable import CoachingPresentation

/// Mission 5.1 (`descriptiveOnly`, FND-HR5-03) and the blocked states: whole answers under a hold, after an erasure, outside the V1 scope and
/// with no plan decode with the shared types, show nothing startable, and never turn a descriptive reading into a prescription. Also: every
/// fixture decodes with the type its kind names (none is left undecoded), and the projections hold the GAP-06/07/12 rules.
final class BlockedAndDescriptiveTests: XCTestCase {
    func testWholePresentationUnderAHoldDecodes() throws {
        let p = try fixture(PresentationSnapshot.self, "17b-presentation-blocked")
        let r = try XCTUnwrap(p.readings)
        XCTAssertEqual(r.strengthExposure?.status, "NOT_APPLICABLE"); XCTAssertEqual(r.strengthExposure?.reason, "NO_PRESCRIPTION")
        XCTAssertNil(r.strengthExposure?.descriptiveOnly); XCTAssertEqual(r.strengthExposure?.isDescriptiveOnly, true, "a missing flag never makes it a target")
        XCTAssertNil(r.strengthExposure?.planned)
        // FND-ABC-05: the presentation still lists the future sessions' steps under a hold (prescribed: false); the join never returns them.
        let future = (p.inForce ?? [:]).values.filter { $0.past != true }
        XCTAssertFalse(future.isEmpty); XCTAssertTrue(future.allSatisfy { $0.prescribed == false && $0.blocks != nil }, "pinned engine behaviour")
        let blocked = try fixture(PlanView.self, "17-plan-blocked", at: ["view"])
        XCTAssertTrue(blocked.week!.sessions.allSatisfy { p.runSession(for: $0) == nil }, "no step of a blocked plan reaches a screen")
        XCTAssertTrue((p.inForce ?? [:]).values.filter { $0.past == true }.allSatisfy { $0.blocks == nil && p.execution(sessionId: $0.sessionId, date: $0.date) != nil })
        // In a valid plan the join returns the steps of every prescribed run session.
        let valid = try fixture(PlanView.self, "02-plan-w0", at: ["view"]), vp = try fixture(PresentationSnapshot.self, "04-presentation-after-onboard")
        let runs = valid.week!.sessions.filter { $0.sport == "RUN" && $0.prescription != nil }
        XCTAssertFalse(runs.isEmpty); XCTAssertTrue(runs.allSatisfy { vp.runSession(for: $0)?.blocks?.isEmpty == false })
        let hold = try fixture(PresentationSnapshot.self, "hr5r-hold-presentation")
        XCTAssertEqual(hold.readings?.runCalibration?.heartRateFiveZones?.reason, "HOLD_NO_PRESCRIPTION")
        XCTAssertEqual(hold.readings?.strengthExposure?.isDescriptiveOnly, true)
        // In a valid plan the engine states it.
        XCTAssertEqual(try fixture(PresentationSnapshot.self, "12-presentation-after-w0").readings?.strengthExposure?.descriptiveOnly, true)
    }

    func testBlockedPlansShowNothingStartable() throws {
        for name in ["17-plan-blocked", "actions-F3-plan-after-erase"] {
            let v = try fixture(PlanView.self, name, at: ["view"])
            XCTAssertEqual(v.state, .blocked, name)
            XCTAssertTrue(v.sports.values.allSatisfy { $0.state == "BLOCKED" }, name)
            XCTAssertTrue(v.week!.sessions.allSatisfy { !$0.executable && $0.prescription == nil && $0.explanation == nil }, name)
            XCTAssertEqual(v.hold?.exit, "READINESS_DECLARATION"); XCTAssertEqual(v.hold?.guidance.wordingStatus, "INTERIM_PENDING_G04")
        }
        struct Weeks: Decodable { let weeks: [Week?] }
        let all = try fixture(Weeks.self, "17c-sessions-blocked").weeks.compactMap { $0 }
        XCTAssertFalse(all.isEmpty)
        XCTAssertTrue(all.flatMap(\.sessions).allSatisfy { !$0.executable && $0.prescription == nil }, "no week of a blocked plan has a prescription")
        // A clinical break and a substitution with pain are human-routed, not prescriptions.
        XCTAssertEqual(try fixture(BoundaryAnswer.self, "actions-E2-break-clinical").view?.state, .blocked)
        XCTAssertEqual(try fixture(BoundaryAnswer.self, "actions-A3-substitution-pain").status, "CLINICAL_HUMAN_REQUIRED")
    }

    func testOutsideScopeAndNoDataAreNeverAnEmptyPlan() throws {
        for name in ["special-pregnancy-onboard", "special-postpartum-onboard"] {
            let a = try fixture(BoundaryAnswer.self, name)
            XCTAssertEqual(a.planOutcome, .outsideV1Scope(reason: "Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1"), name)
            XCTAssertNil(a.view)
        }
        XCTAssertEqual(try fixture(BoundaryAnswer.self, "special-none-onboard").planOutcome, .planCreated)
        for name in ["special-pregnancy-plan", "special-pregnancy-sessions", "23-error-not-enrolled", "actions-F5-plan-after-account-erase"] {
            let a = try fixture(BoundaryAnswer.self, name)
            XCTAssertFalse(a.ok, name); XCTAssertEqual(a.state, .noData, name); XCTAssertNil(a.view, name)
        }
        // Fail closed: an unknown onboarding status is never a plan.
        let odd = try JSONDecoder().decode(BoundaryAnswer.self, from: Data(#"{"ok":true,"status":"SOMETHING_NEW","enrolled":true}"#.utf8))
        XCTAssertEqual(odd.planOutcome, .unrecognized("SOMETHING_NEW"))
    }

    /// Every fixture decodes with the type its name says; INDEX.json lists exactly the files present.
    func testEveryFixtureDecodes() throws {
        struct Index: Decodable { struct F: Decodable { let file: String }; let files: [F]; let projections: String }
        let index = try fixture(Index.self, "INDEX")
        XCTAssertEqual(index.projections, CoachingContract.projections)
        let present = Set(try FileManager.default.contentsOfDirectory(atPath: Repo.fixtures.path).filter { $0.hasSuffix(".json") && $0 != "INDEX.json" })
        XCTAssertEqual(Set(index.files.map(\.file)), present)
        struct Weeks: Decodable { let weeks: [Week?] }
        struct Carried: Decodable { let ok: Bool; let records: [String: AnyJSON] }
        struct Decision: Decodable { let decision: DecisionDetail }
        struct History: Decodable { let history: HistoryView }
        struct WeekPlanFile: Decodable { let weeks: [WeekPlanEntry] }
        struct TimeFile: Decodable { let timeInZones: TimeInZoneReading }
        struct Kept: Decodable { let checks: [AnyJSON] }
        for f in present.sorted() {
            let n = String(f.dropLast(5))
            do {
                switch n {
                case _ where n.hasSuffix("presentation") || n.contains("presentation-"): _ = try fixture(PresentationSnapshot.self, n)
                case "03-sessions", "17c-sessions-blocked": _ = try fixture(Weeks.self, n)
                case "special-pregnancy-sessions": _ = try fixture(BoundaryAnswer.self, n)
                case "hr5r-carried": _ = try fixture(Carried.self, n)
                case "21-decision": _ = try fixture(Decision.self, n)
                case _ where n.hasSuffix("history") || n == "20-history" || n == "26-history-final": _ = try fixture(History.self, n)
                case "P-week-plan": _ = try fixture(WeekPlanProjection.self, n)
                case _ where n.hasPrefix("P-logged"): _ = try fixture(LoggedEntries.self, n)
                case "P-warning-sign-sets": _ = try signSets()
                case "P-kept-check": _ = try fixture(Kept.self, n)
                case _ where n.hasPrefix("hr5r-time-in-zone"): _ = try fixture(TimeFile.self, n)
                case _ where n.hasPrefix("hr5r-") && (n.hasSuffix("-answer") || n.hasSuffix("-replay") || n.contains("without-consent")):
                    _ = try fixture(HeartRateProfileAnswer.self, n); _ = try fixture(BoundaryAnswer.self, n)
                default: _ = try fixture(BoundaryAnswer.self, n)
                }
            } catch { XCTFail("\(f): \(error)") }
        }
    }

    func testProjectionsKeepVoicesAndDistancesApart() throws {
        let two = try fixture(LoggedEntries.self, "P-logged-two-voices")
        let e = try XCTUnwrap(two.entries.first)
        XCTAssertEqual(e.channels, ["ATHLETE", "DEVICE"]); XCTAssertEqual(e.voices.count, 2)
        XCTAssertEqual(e.measuredKm, e.voices.first { $0.channel == "DEVICE" }?.measuredKm); XCTAssertNotNil(e.declaredKm)
        XCTAssertEqual(e.rpe, e.voices.first { $0.channel == "ATHLETE" }?.rpe, "athlete-only facts come from the athlete's voice")
        XCTAssertTrue(e.voices.allSatisfy { two.keeps($0.eventId) }, "both voices of a planned session are kept")
        // QRE-ABC-01: an athlete's symptom stop against a completed device run stays visible, in the athlete's voice and at the top.
        let conflict = try XCTUnwrap(try fixture(LoggedEntries.self, "P-logged-conflict").entries.first { !$0.superseded && $0.voices.count == 2 })
        XCTAssertEqual(conflict.stopReason, "SYMPTOM"); XCTAssertEqual(conflict.response?.recovery, "ADVERSE")
        let athleteVoice = try XCTUnwrap(conflict.voices.first { $0.channel == "ATHLETE" })
        XCTAssertEqual(athleteVoice.completed, false); XCTAssertEqual(athleteVoice.stopReason, "SYMPTOM"); XCTAssertEqual(athleteVoice.minutes, 5)
        XCTAssertEqual(try fixture(BoundaryAnswer.self, "conflict-1-athlete-stop-against-device").warningSignScreen?.status, "REQUIRED")
        let u = try fixture(LoggedEntries.self, "P-logged-unplanned")
        let contested = try XCTUnwrap(u.entries.first { $0.contested != nil })
        XCTAssertEqual(contested.measuredKm, 12.5); XCTAssertEqual(contested.contested?.distanceKm, 7); XCTAssertEqual(contested.contested?.reason, "SIGNAL_LOSS")
        let merged = try XCTUnwrap(u.entries.first { $0.unplannedMerge })
        XCTAssertEqual(merged.voices.count, 2, "FND-ABC-01: two same-instant unplanned reports kept as one row")
        XCTAssertFalse(u.keeps(merged.voices[1].eventId), "a report merged into another unplanned row is never 'saved' as a session")
        let final = try fixture(LoggedEntries.self, "P-logged-final")
        XCTAssertTrue(final.entries.contains { $0.sessionId == nil && $0.channels == ["DEVICE"] && $0.measuredKm == 5.2 }, "the unlinked device run is an entry")
        let afterW0 = try fixture(LoggedEntries.self, "P-logged-after-w0")
        XCTAssertTrue(afterW0.entries.contains { $0.sport == "STRENGTH" && $0.exercises?.first?.sets.first?.load != nil }, "sets and loads as logged (GAP-06)")
        // No boundary-reserved key crosses: the projection JSON has none of them anywhere.
        let raw = try Repo.text("ios/Packages/CoachingPresentation/Tests/CoachingPresentationTests/Fixtures/P-logged-final.json")
        for k in ["\"provenance\"", "\"context\"", "\"source\"", "\"sourceHash\"", "\"athleteId\"", "\"reportedAt\""] { XCTAssertFalse(raw.contains(k), k) }
        let plan = try fixture(WeekPlanProjection.self, "P-week-plan")
        XCTAssertEqual(plan.weeks.count, 12); XCTAssertEqual(plan.weeks.first?.phase, "ESTABLISHMENT")
        XCTAssertEqual(plan.weeks.first?.timing, "AHEAD", "captured on enrolment day 2026-11-14, before the plan starts on 2026-11-16")
        XCTAssertTrue(plan.weeks.allSatisfy { $0.plannedRunMinutes != nil && $0.plannedStrengthSets != nil })
        struct TimeFile: Decodable { let timeInZones: TimeInZoneReading }
        let gated = try fixture(TimeFile.self, "hr5r-time-in-zone-gated").timeInZones
        XCTAssertEqual(gated.status, "UNAVAILABLE"); XCTAssertEqual(gated.reason, "SERIES_CHANNEL_NOT_REVIEWED"); XCTAssertNil(gated.seconds); XCTAssertFalse(gated.fromAverageHeartRate)
        let gatedRaw = try Repo.text("ios/Packages/CoachingPresentation/Tests/CoachingPresentationTests/Fixtures/hr5r-time-in-zone-gated.json")
        XCTAssertFalse(gatedRaw.contains("\"seconds\"") || gatedRaw.contains("\"engine\""), "SSCTR-ABC-S3: the gated answer carries no distribution")
        XCTAssertEqual(try fixture(TimeFile.self, "hr5r-time-in-zone-hold").timeInZones.reason, "HOLD_NO_PRESCRIPTION")
    }
}

#if os(macOS)
/// The fixtures are what the current runtime answers: the capture is re-run into a temporary directory and must give the same bytes and the same
/// file set. A runtime change (an amendment) or an edited fixture fails here; regenerate with Facade/capture-fixtures.mjs in the same commit.
final class FixtureFreshnessTests: XCTestCase {
    func testFixturesAreTheCurrentRuntimeAnswers() throws {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("cp-fx-\(UUID().uuidString)")
        defer { try? FileManager.default.removeItem(at: dir) }
        let (status, out) = try node([Repo.facade.appendingPathComponent("capture-fixtures.mjs").path, dir.path])
        XCTAssertEqual(status, 0, out)
        let fm = FileManager.default
        let mine = Set(try fm.contentsOfDirectory(atPath: Repo.fixtures.path)), fresh = Set(try fm.contentsOfDirectory(atPath: dir.path))
        XCTAssertEqual(mine, fresh)
        for f in mine.intersection(fresh).sorted() {
            XCTAssertEqual(try Data(contentsOf: Repo.fixtures.appendingPathComponent(f)), try Data(contentsOf: dir.appendingPathComponent(f)), f)
        }
    }
    /// The facade's own Node tests (projections, HR5 concurrency contract, special population) run as part of `swift test`.
    func testFacadeNodeSuite() throws {
        let (status, out) = try node(["--test", "--test-reporter=tap", Repo.facade.appendingPathComponent("test").path + "/*.test.mjs"])
        XCTAssertEqual(status, 0, out)
        XCTAssertTrue(out.contains("# fail 0"), out)
    }
}
#endif
