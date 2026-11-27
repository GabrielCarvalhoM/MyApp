import CoachingPresentation
import Foundation
import IntegrationContracts
@testable import RunRecorder
import XCTest
@testable import RepMileUI

/// #73 QRE recheck (P3-c, P3-d) and SSCTR C2: Today's banner order, announcing an urgent level once, a readiness view that outranks the
/// floor, and the per-screen "only rises" level staying on its screen.
@MainActor
final class GuidanceRecheckTests: XCTestCase {
    private func plan(_ name: String) throws -> PlanView { try Repo.store.decode(PlanView.self, name, at: "view") }
    private func capture(_ name: String) throws -> BoundaryAnswer { try Repo.store.decode(BoundaryAnswer.self, name) }
    private let end = Date(timeIntervalSince1970: 1_795_850_000)

    // MARK: Today (P3-d: urgent + host gate)

    func testTodayShowsTheUrgentHoldFirstAndTheGateBelowIt() throws {
        let urgent = try plan("plan-blocked-urgent"), professional = try plan("17-plan-blocked"), valid = try plan("13-plan-w1")
        XCTAssertEqual(TodayContent.banners(plan: urgent, gate: .outsideV1Scope), [.urgentHold, .gate(.outsideV1Scope)])
        XCTAssertEqual(TodayContent.banners(plan: urgent, gate: .clinicalHumanRequired), [.urgentHold, .gate(.clinicalHumanRequired)])
        XCTAssertEqual(TodayContent.banners(plan: urgent, gate: nil), [.urgentHold])
        XCTAssertEqual(TodayContent.banners(plan: urgent, gate: .blocked), [.urgentHold], "the hold's own gate adds nothing")
        XCTAssertEqual(TodayContent.banners(plan: professional, gate: nil), [.state(.blocked)])
        XCTAssertEqual(TodayContent.banners(plan: professional, gate: .outsideV1Scope), [.gate(.outsideV1Scope)], "unchanged before #73")
        XCTAssertEqual(TodayContent.banners(plan: valid, gate: nil), [])
    }

    // MARK: Announcements (P3-c, P3-d: announce once)

    func testAnUrgentLevelIsAnnouncedOncePerKey() {
        let key = "test:" + UUID().uuidString
        XCTAssertTrue(UrgentCareBanner.claimAnnouncement(key))
        XCTAssertFalse(UrgentCareBanner.claimAnnouncement(key), "the same hold's reappearance is not announced again")
        XCTAssertTrue(UrgentCareBanner.claimAnnouncement(nil))
        XCTAssertTrue(UrgentCareBanner.claimAnnouncement(nil), "a result banner announces every time it appears")
    }

    /// Urgent, then professional (#79), then urgent again: the second urgent level has its own key, so Today announces it.
    func testAHoldThatTurnsUrgentAgainIsAnnouncedAgain() throws {
        let first = try plan("plan-blocked-urgent")
        XCTAssertEqual(UrgentCareBanner.key(for: first), UrgentCareBanner.key(for: try plan("plan-blocked-urgent")), "stable for the same view")
        let again = try variant(lastDecision: "dc_again", level: "URGENT_CARE_ADVISED")
        XCTAssertEqual(again.hold?.since, first.hold?.since, "the same hold")
        XCTAssertNotEqual(UrgentCareBanner.key(for: again), UrgentCareBanner.key(for: first))
        let ask = try variant(lastDecision: "dc_ask", level: nil)
        XCTAssertNotEqual(UrgentCareBanner.key(for: ask), UrgentCareBanner.key(for: first))
        XCTAssertEqual(UrgentCareBanner.key(for: ask), UrgentCareBanner.key(for: try variant(lastDecision: "dc_ask2", level: nil)),
                       "decisions without an urgent level share the standing key: at most one more announcement")
    }

    // MARK: Readiness (P3-d: a view outranks the floor)

    func testReadinessWithAViewAtProfessionalIgnoresTheUrgentFloor() throws {
        XCTAssertEqual(ReadinessViewModel.reply(for: try capture("readiness-sign-gettingWorse"), holdGuidance: .urgentCare),
                       .stillBlocked(.professionalAssessment), "the answer's view is the engine's current word")
        XCTAssertEqual(ReadinessViewModel.reply(for: try capture("actions-E2-break-clinical"), holdGuidance: .urgentCare),
                       .stillBlocked(.professionalAssessment))
    }

    // MARK: SSCTR C2: the raised level is screen-local

    func testTheRaisedLevelStaysOnItsScreen() async throws {
        let answers = [try capture("nf-urgent-chestPainPressureOrTightness"), try capture("actions-E2-break-clinical")]
        let model = AppModel(reader: FixtureCoachingReader(scenario: .blocked, store: Repo.store), writer: FixtureCoachingWriter(store: Repo.store),
                             health: FixtureHealthIngestStatus(queued: 0), athleteName: "Teste")
        await model.load()

        let strengthWriter = SequencedWriter(answers)
        let log = try strength(strengthWriter)
        await log.send(); await log.send()
        XCTAssertEqual(log.clinicalGuidance, .urgentCare, "the screen keeps the higher level")

        let runWriter = SequencedWriter(answers)
        let report = RunReportViewModel(recording: recording, writer: runWriter, planToday: { "2026-11-22" }, markReported: { _ in },
                                        now: { [end] in end }, holdGuidance: { nil })
        report.eligibility = .testNoneApplies
        await report.send(); await report.send()
        XCTAssertEqual(report.clinicalGuidance, .urgentCare)

        // Never put into a request.
        for (call, json) in strengthWriter.journal.entries + runWriter.journal.entries {
            XCTAssertEqual(call, "submit")
            let text = String(decoding: json, as: UTF8.self)
            for word in ["guidance", "URGENT", "PROFESSIONAL_ASSESSMENT", "level"] { XCTAssertFalse(text.contains(word), "\(word) in \(text)") }
        }
        XCTAssertEqual(strengthWriter.journal.entries.count, 2)
        // Never reaches Today or the plan view: the app's plan keeps the engine's own level.
        XCTAssertEqual(model.plan?.clinicalGuidance, .professionalAssessment)
        XCTAssertEqual(TodayContent.banners(plan: try XCTUnwrap(model.plan), gate: nil), [.state(.blocked)])
        // Never persisted: a new screen starts with no level.
        XCTAssertNil(try strength(SequencedWriter(answers)).clinicalGuidance)
        XCTAssertNil(RunReportViewModel(recording: recording, writer: runWriter, planToday: { "2026-11-22" }, markReported: { _ in },
                                        holdGuidance: { nil }).clinicalGuidance)
    }

    // MARK: Helpers

    /// `plan-blocked-urgent` with its last decision replaced (same hold).
    private func variant(lastDecision id: String, level: String?) throws -> PlanView {
        var view = try XCTUnwrap(try Repo.store.object("plan-blocked-urgent")["view"] as? [String: Any])
        var last = try XCTUnwrap(view["lastDecision"] as? [String: Any])
        last["decisionId"] = id
        last["guidance"] = level.map { ["level": $0, "wordingStatus": "INTERIM_PENDING_G04"] }
        view["lastDecision"] = last
        return try JSONDecoder().decode(PlanView.self, from: JSONSerialization.data(withJSONObject: view))
    }
    private var recording: FinishedRecording {
        FinishedRecording(ref: AppRecordedRunRef(id: "rec-73c", sessionId: "w0-run-d6", start: end.addingTimeInterval(-2400), end: end, reportedEventId: nil),
                          sessionDate: "2026-11-22", movingMinutes: 39.6, local: LocalMeasurement(distanceMetres: nil, splitsSeconds: [], route: []))
    }
    private func strength(_ w: CoachingWriting) throws -> StrengthLogViewModel {
        let s = try XCTUnwrap(try Repo.store.decode(PlanView.self, "02-plan-w0", at: "view").week?.sessions.first { $0.id == "w0-str-d2" })
        let vm = StrengthLogViewModel(session: s, writer: w, planToday: { "2026-11-22" }, now: { [end] in end }, holdGuidance: { nil })
        vm.minutes = 40; vm.confirmAsPrescribed(); vm.eligibility = .testNoneApplies
        return vm
    }
}
