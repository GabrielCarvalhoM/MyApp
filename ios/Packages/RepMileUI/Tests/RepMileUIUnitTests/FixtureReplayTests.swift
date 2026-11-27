import CoachingPresentation
import XCTest
@testable import RepMileUI

/// The committed CoachingCore captures, read from the repository (the app bundles the same directory by reference).
enum Repo {
    static let fixtures = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
        .appendingPathComponent("../../../CoachingPresentation/Tests/CoachingPresentationTests/Fixtures").standardized
    /// Front C's own engine captures (#73, `RepMileUI/Tools/capture-engine.mjs`), bundled by the app as `Captures`.
    static let captures = URL(fileURLWithPath: #filePath).deletingLastPathComponent().appendingPathComponent("../../Captures").standardized
    static let store = FixtureStore(directory: fixtures, more: [captures])
}

@MainActor
final class FixtureReplayTests: XCTestCase {
    /// Handoff C §8.1: every fixture of INDEX.json is read by the port that serves it, without failure.
    func testEveryIndexedFixtureDecodesThroughItsPort() throws {
        let files = try Repo.store.indexedFiles()
        XCTAssertEqual(Set(files).count, 99)
        XCTAssertEqual(files.count, 100, "INDEX.json lists hr5r-declared-presentation twice (generator output, not edited here)")
        for name in files {
            let obj = try Repo.store.object(name)
            if obj["ok"] as? Bool == false {
                XCTAssertNoThrow(try Repo.store.error(name), name); continue
            }
            if obj["view"] != nil { XCTAssertNoThrow(try Repo.store.decode(PlanView.self, name, at: "view"), name) }
            if obj["weeks"] != nil, obj["projections"] == nil { XCTAssertNoThrow(try Repo.store.decode([Week].self, name, at: "weeks"), name) }
            if obj["inForce"] != nil { XCTAssertNoThrow(try Repo.store.decode(PresentationSnapshot.self, name), name) }
            if obj["history"] != nil { XCTAssertNoThrow(try Repo.store.decode(HistoryView.self, name, at: "history"), name) }
            if obj["entries"] != nil { XCTAssertNoThrow(try Repo.store.decode(LoggedEntries.self, name), name) }
            if obj["decision"] != nil, obj["decisionId"] == nil { XCTAssertNoThrow(try Repo.store.decode(DecisionDetail.self, name, at: "decision"), name) }
            if obj["decisionId"] != nil || obj["enrolled"] != nil { XCTAssertNoThrow(try Repo.store.decode(BoundaryAnswer.self, name), name) }
            if obj["timeInZones"] != nil { XCTAssertNoThrow(try Repo.store.decode(TimeInZoneReading.self, name, at: "timeInZones"), name) }
        }
    }

    /// Every plan view captured renders Hoje's content without crashing, and every scenario reaches a root route.
    func testEveryPlanViewBuildsTodayAndEveryScenarioRoutes() async throws {
        let presentation = try Repo.store.decode(PresentationSnapshot.self, "12-presentation-after-w0")
        for name in try Repo.store.indexedFiles() where (try Repo.store.object(name))["view"] != nil {
            let plan = try Repo.store.decode(PlanView.self, name, at: "view")
            _ = TodayContent.build(plan: plan, logged: nil, presentation: presentation, weekPlan: nil) { _ in .startable }
        }
        for s in Scenario.all {
            let model = AppModel(reader: FixtureCoachingReader(scenario: s, store: Repo.store), writer: FixtureCoachingWriter(store: Repo.store),
                                 health: FixtureHealthIngestStatus(queued: 0), athleteName: "Teste")
            await model.load()
            XCTAssertNotEqual(model.route, .loading, s.id)
        }
    }

    /// Handoff C §8.3: each engine/host state reaches its own screen; unrecognized fails closed.
    func testRootRoutes() async throws {
        func route(_ s: Scenario) async -> RootRoute {
            let m = AppModel(reader: FixtureCoachingReader(scenario: s, store: Repo.store), writer: FixtureCoachingWriter(store: Repo.store),
                             health: FixtureHealthIngestStatus(queued: 0), athleteName: "T")
            await m.load(); return m.route
        }
        let notEnrolled = await route(.notEnrolled); XCTAssertEqual(notEnrolled, .onboarding)
        let gone = await route(.accountErased); XCTAssertEqual(gone, .accountErased)
        let stale = await route(.staleVersion); XCTAssertEqual(stale, .operationalError(code: "CONFLICT_STALE_VERSION"))
        let integrity = await route(.integrityFailure); XCTAssertEqual(integrity, .integrityFailure)
        let lost = await route(.recordLost); XCTAssertEqual(lost, .recordLost)
        for s in [Scenario.today, .blocked, .returning, .pending, .screenRequired] { let r = await route(s); XCTAssertEqual(r, .app, s.id) }
        let reduced = try JSONDecoder().decode(ClientState.self, from: Data(#""REDUCED""#.utf8))
        XCTAssertEqual(reduced, .unrecognized("REDUCED"))
    }

    /// Handoff C §8.5 / FND-ABC-05: under `17-plan-blocked` + `17b-presentation-blocked` no step, load, minute or target is visible.
    func testBlockedShowsNoPrescription() throws {
        let plan = try Repo.store.decode(PlanView.self, "17-plan-blocked", at: "view")
        let pres = try Repo.store.decode(PresentationSnapshot.self, "17b-presentation-blocked")
        let c = TodayContent.build(plan: plan, logged: nil, presentation: pres, weekPlan: nil) { _ in .notStartable(reason: .blocked) }
        for d in c.days { for m in d.marks { XCTAssertNil(m.minutes, m.id); XCTAssertTrue(m.details.isEmpty, m.id) } }
        XCTAssertNil(c.body)
        XCTAssertNil(c.next, "a hold offers no next session and no start")
        // #99 (Figma 72 `805:410`): under a clinical hold the headline is "Sem treino prescrito por enquanto", one tone.
        XCTAssertEqual(c.heroLead, "")
        XCTAssertEqual(c.heroRest, L.t("today.hero.held"))
        for s in plan.week?.sessions ?? [] { XCTAssertNil(pres.runSession(for: s), s.id) }
        // FND-ABC-04: the earlier plan stays in force, but a restart outside the V1 scope pauses Hoje the same way.
        let valid = try Repo.store.decode(PlanView.self, "13-plan-w1", at: "view")
        let gated = TodayContent.build(plan: valid, logged: nil, presentation: nil, weekPlan: nil, paused: true) { _ in .notStartable(reason: .outsideV1Scope) }
        XCTAssertNil(gated.next)
        for d in gated.days { for m in d.marks { XCTAssertNil(m.minutes, m.id); XCTAssertTrue(m.details.isEmpty, m.id) } }
        XCTAssertEqual(gated.heroLead, L.t("today.hero.paused"))
    }

    /// Handoff C §8.4: "Começar" is enabled only for `.startable`; every NotStartableReason disables it.
    func testStartOnlyWhenStartable() throws {
        let plan = try Repo.store.decode(PlanView.self, "13-plan-w1", at: "view")
        let ok = TodayContent.build(plan: plan, logged: nil, presentation: nil, weekPlan: nil) { _ in .startable }
        XCTAssertEqual(ok.startability, .startable)
        for r in NotStartableReason.allCases {
            let c = TodayContent.build(plan: plan, logged: nil, presentation: nil, weekPlan: nil) { _ in .notStartable(reason: r) }
            XCTAssertNotEqual(c.startability, .startable, r.rawValue)
            XCTAssertNotEqual(L.t("reason." + r.rawValue), "reason." + r.rawValue, "copy for \(r.rawValue)")
        }
        // The scenario stand-in for A keeps the engine's `executable` necessary: past, non-executable sessions never start.
        for s in plan.week?.sessions ?? [] where !s.executable { XCTAssertNotEqual(Scenario.today.startability(of: s), .startable, s.id) }
    }

    /// Hoje of the default scenario: the long run today, earlier sessions done from the record, numbers only from the fixtures.
    func testTodayContentFromFixtures() throws {
        let plan = try Repo.store.decode(PlanView.self, "13-plan-w1", at: "view")
        let logged = try Repo.store.decode(LoggedEntries.self, "P-logged-two-voices")
        let pres = try Repo.store.decode(PresentationSnapshot.self, "12-presentation-after-w0")
        let wp = try Repo.store.decode(WeekPlanProjection.self, "P-week-plan")
        let c = TodayContent.build(plan: plan, logged: logged, presentation: pres, weekPlan: wp) { Scenario.today.startability(of: $0) }
        XCTAssertEqual(c.days.count, 7)
        XCTAssertEqual(c.days.last?.isToday, true)
        XCTAssertEqual(c.next?.session.id, "w0-run-d6")
        XCTAssertEqual(c.next?.minutes, 80)
        XCTAssertEqual(c.startability, .startable)
        XCTAssertEqual(c.phases.count, wp.weeks.count)
        XCTAssertNotNil(c.race?.range)
        let done = c.days.flatMap(\.marks).filter { $0.status == .done }
        XCTAssertFalse(done.isEmpty)
        for m in done { XCTAssertTrue(logged.entries.contains { $0.sessionId == m.session.id && $0.completed }, m.id) }

        // After the week was logged: the day is done and Wednesday's "not done" report shows as missed (from the record, never inferred).
        let after = try Repo.store.decode(LoggedEntries.self, "P-logged-after-w0")
        let d = TodayContent.build(plan: plan, logged: after, presentation: pres, weekPlan: wp) { Scenario.today.startability(of: $0) }
        XCTAssertNil(d.next)
        XCTAssertEqual(d.heroLead, L.t("today.hero.done"))
        XCTAssertEqual(d.days.flatMap(\.marks).filter { $0.status == .missed }.map(\.session.id), ["w0-run-d3"])
    }
}
