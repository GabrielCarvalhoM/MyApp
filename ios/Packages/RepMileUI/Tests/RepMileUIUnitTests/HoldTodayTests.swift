import CoachingPresentation
import SwiftUI
import XCTest
@testable import RepMileUI

/// #99: Hoje under a clinical hold (Figma 72 `805:492` urgent, `805:410` professional), the held week marks, the neutral light, the tab bar's
/// inset and the onboarding strip. Replays the real engine's captures (`plan-blocked-urgent`, `17-plan-blocked`, `13-plan-w1`).
@MainActor
final class HoldTodayTests: XCTestCase {
    private func plan(_ name: String) throws -> PlanView { try Repo.store.decode(PlanView.self, name, at: "view") }
    private func today(_ p: PlanView, paused: Bool = false, gate: NotStartableReason = .blocked) -> TodayContent {
        TodayContent.build(plan: p, logged: nil, presentation: nil, weekPlan: nil, paused: paused) { _ in .notStartable(reason: gate) }
    }

    // MARK: headline and signal

    func testAnUrgentHoldHeadlinesTheUrgentInstruction() throws {
        let p = try plan("plan-blocked-urgent")
        XCTAssertEqual(p.clinicalGuidance, .urgentCare)
        let c = today(p)
        XCTAssertEqual(c.heroLead, "", "one tone: the instruction is the whole headline")
        XCTAssertEqual(c.heroRest, L.t("today.hero.urgent.interim"))
        XCTAssertTrue(c.paused)
        XCTAssertNil(c.next, "nothing starts")
        XCTAssertNotNil(c.signalAt)
        XCTAssertEqual(c.signalAt, Fmt.instant(try XCTUnwrap(p.hold?.since)))
    }

    func testAProfessionalHoldHeadlinesNoPrescription() throws {
        let c = today(try plan("17-plan-blocked"))
        XCTAssertEqual(c.heroLead, "")
        XCTAssertEqual(c.heroRest, L.t("today.hero.held"))
        XCTAssertNotNil(c.signalAt)
    }

    /// A host gate without a clinical hold (outside V1 scope) keeps its own headline and has no reported sign to date.
    func testAHostGateWithoutAHoldKeepsThePausedHeadline() throws {
        let c = today(try plan("13-plan-w1"), paused: true, gate: .outsideV1Scope)
        XCTAssertEqual(c.heroLead, L.t("today.hero.paused"))
        XCTAssertNil(c.signalAt)
        XCTAssertTrue(c.paused)
    }

    func testTheSignalTimeIsTheInstantOrNothing() {
        let utc = TimeZone(identifier: "UTC")!
        let s = Fmt.instant("2026-11-17T11:00:00.000Z", in: utc)
        XCTAssertNotNil(s)
        XCTAssertTrue(s?.contains("17") == true && s?.contains("11") == true && s?.contains(" · ") == true, s ?? "nil")
        XCTAssertNotNil(Fmt.instant("2026-11-17T11:00:00Z", in: utc), "without fractional seconds")
        XCTAssertNil(Fmt.instant("not a date"), "no made-up time")
    }

    // MARK: held marks and light

    func testUnderAHoldEveryOpenSessionIsHeldNeverPlannedOrNext() throws {
        for name in ["plan-blocked-urgent", "17-plan-blocked"] {
            let marks = today(try plan(name)).days.flatMap(\.marks)
            XCTAssertFalse(marks.isEmpty, name)
            XCTAssertTrue(marks.contains { $0.status == .held }, name)
            for m in marks { XCTAssertTrue([.held, .done, .missed].contains(m.status), "\(name) \(m.id) \(m.status)") }
        }
        let valid = today(try plan("13-plan-w1"), gate: .blocked)
        XCTAssertFalse(valid.days.flatMap(\.marks).contains { $0.status == .held }, "a valid plan holds nothing")
    }

    func testTheLightIsNeutralWhenNothingMayStart() throws {
        XCTAssertEqual(TodayView.glowColor(today(try plan("plan-blocked-urgent"))), RM.Palette.luzNeutra)
        XCTAssertEqual(TodayView.glowColor(today(try plan("17-plan-blocked"))), RM.Palette.luzNeutra)
        let valid = TodayContent.build(plan: try plan("13-plan-w1"), logged: nil, presentation: nil, weekPlan: nil) { _ in .startable }
        XCTAssertEqual(TodayView.glowColor(valid), RM.Palette.luzCorrida, "the long run is next: the run light")
    }

    // MARK: held sports and "Entendi"

    func testHeldSportsAreTheOnesTheEngineHolds() throws {
        XCTAssertEqual(HoldPanel.heldSports(try plan("plan-blocked-urgent")), [.run, .strength])
        XCTAssertEqual(HoldPanel.heldSports(try plan("13-plan-w1")), [], "nothing held in a valid plan")
        var view = try XCTUnwrap(try Repo.store.object("17-plan-blocked")["view"] as? [String: Any])
        view["sports"] = ["RUN": ["programmed": true, "state": "BLOCKED"], "STRENGTH": ["programmed": true, "state": "ACTIVE"]]
        let one = try JSONDecoder().decode(PlanView.self, from: JSONSerialization.data(withJSONObject: view))
        XCTAssertEqual(HoldPanel.heldSports(one), [.run])
        view["sports"] = [String: Any]()
        let none = try JSONDecoder().decode(PlanView.self, from: JSONSerialization.data(withJSONObject: view))
        XCTAssertEqual(HoldPanel.heldSports(none), [], "a sport the view does not name is not listed")
    }

    func testEntendiIsRememberedPerHoldOnly() throws {
        let a = UrgentCareBanner.key(for: try plan("plan-blocked-urgent")), b = UrgentCareBanner.key(for: try plan("17-plan-blocked"))
        XCTAssertNotEqual(a, b)
        XCTAssertFalse(HoldAcknowledgement.isAcknowledged(a))
        HoldAcknowledgement.acknowledge(a)
        XCTAssertTrue(HoldAcknowledgement.isAcknowledged(a))
        XCTAssertFalse(HoldAcknowledgement.isAcknowledged(b), "another hold asks again")
    }

    // MARK: tab bar, onboarding strip, copy

    func testTheContentEndsAboveTheTabBar() {
        // 30 pt from the bottom edge + 68 pt bar + 12 pt clearance = 110 pt from the bottom, of which the safe area already gives its own.
        XCTAssertEqual(TabBarArea.contentInset(safeBottom: 34), 76)
        XCTAssertEqual(TabBarArea.contentInset(safeBottom: 0), 110)
        XCTAssertEqual(TabBarArea.contentInset(safeBottom: 200), 0)
    }

    func testTheStripInitialsAreMondayFirst() {
        XCTAssertEqual(WeekStripArt.initials(locale: Locale(identifier: "pt-BR")), ["S", "T", "Q", "Q", "S", "S", "D"])
        XCTAssertEqual(WeekStripArt.initials(locale: Locale(identifier: "en")), ["M", "T", "W", "T", "F", "S", "S"])
        XCTAssertEqual(WeekStripArt.pills.filter { $0.day == WeekStripArt.restDay }, [], "Friday rests")
    }

    /// The #99 copy is in the three languages; the clinical lines are INTERIM (`.interim` keys, final wording in #87).
    func testTheHoldCopyExistsInTheThreeLanguages() throws {
        let interim = ["today.hero.urgent.interim", "hold.urgent.title.interim", "hold.urgent.body.interim", "hold.professional.title.interim",
                       "hold.professional.body.interim"]
        let plain = ["today.hero.held", "today.signal", "hold.urgent.label", "hold.meanwhile", "hold.sport.RUN", "hold.sport.STRENGTH", "hold.sport.detail",
                     "hold.note", "hold.understood", "hold.declare", "ob.welcome.title", "ob.welcome.body"]
        for lang in ["pt-BR", "en", "es"] {
            let path = try XCTUnwrap(Bundle.module.path(forResource: "Localizable", ofType: "strings", inDirectory: nil, forLocalization: lang), lang)
            let table = try XCTUnwrap(NSDictionary(contentsOfFile: path) as? [String: String], lang)
            for key in interim + plain { XCTAssertFalse((table[key] ?? "").isEmpty, "\(lang) \(key)") }
            if lang == "pt-BR" {
                XCTAssertEqual(table["today.hero.urgent.interim"], "Pare agora e procure atendimento médico urgente")
                XCTAssertEqual(table["hold.urgent.title.interim"], "Se for forte ou não passar, ligue para o número de emergência local")
                XCTAssertEqual(table["ob.welcome.title"], "Corrida e força na mesma semana")
            }
        }
    }
}
