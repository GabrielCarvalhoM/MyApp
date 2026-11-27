import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #59 review fixes: what the correction offers and sends at its edges (the athlete's own distance, the engine's bounds, the plan's day, the
/// fields the run form sends).
@MainActor
final class HistoryCorrectionBoundsTests: XCTestCase {
    private func entry(_ name: String) throws -> LoggedEntry {
        try XCTUnwrap(try Repo.store.decode(LoggedEntries.self, name).entries.first { $0.sessionId == "w0-run-d1" })
    }
    private func object(_ v: some Encodable) throws -> [String: Any] {
        try XCTUnwrap(try JSONSerialization.jsonObject(with: JSONEncoder().encode(v)) as? [String: Any])
    }

    /// QRE #59 P1: a correction replaces the report in force. The athlete's declared distance is re-sent when they stated one, and never
    /// made up when they did not (the device's measured 7.06 km is not theirs).
    func testTheAthletesDeclaredDistanceStaysTheirs() throws {
        let stated = try entry("P-logged-two-voices")
        let said = try XCTUnwrap(HistoryCorrectionViewModel.observation(entry: stated, distanceKm: 6, reason: .signalLoss))
        guard case .plannedRun(let a) = said.actual else { return XCTFail("planned run") }
        XCTAssertEqual(a.declaredDistanceKm, HistoryCorrectionViewModel.athleteVoice(stated)?.declaredKm)
        XCTAssertEqual(a.declared?.distanceKm, 6)

        let silent = try Reread.edited("P-logged-two-voices") { row in
            row["voices"] = (row["voices"] as? [[String: Any]] ?? []).map { v in var v = v; if v["channel"] as? String == "ATHLETE" { v["declaredKm"] = NSNull() }; return v }
        }
        XCTAssertEqual(silent.measuredKm, 7.06)
        let none = try XCTUnwrap(HistoryCorrectionViewModel.observation(entry: silent, distanceKm: 6, reason: .signalLoss))
        XCTAssertNil((try object(none)["actual"] as? [String: Any])?["distanceKm"], "the measured distance is never re-sent as the athlete's")
    }

    /// SSCTR #59 P2-1: only a distance the engine reads (0.01–300 km) can be sent; "Salvo" never shows a correction it ignores.
    func testOnlyADistanceTheEngineReadsCanBeSent() throws {
        let vm = HistoryCorrectionViewModel(testing: try entry("P-logged-two-voices"), writer: FixtureCoachingWriter(store: Repo.store), reload: {})
        vm.startContesting(); vm.answerNoneApplies()
        for typed in ["-3", "0", "0,001", "300,5", "999", "nan", "inf"] { vm.km = typed; XCTAssertFalse(vm.canSend, typed) }
        for typed in ["0,01", "6", "7,4", "300"] { vm.km = typed; XCTAssertTrue(vm.canSend, typed) }
    }

    /// The screen is dated the plan's today, never the device's: no plan, no request (QRE #59 P3).
    func testNoPlanTodayNoRequest() async throws {
        let w = FixtureCoachingWriter(store: Repo.store)
        let e = try entry("P-logged-two-voices")
        let vm = HistoryCorrectionViewModel(entry: e, sessionDate: e.date, writer: w, planToday: { nil }, reload: {}, holdGuidance: { nil })
        vm.startContesting(); vm.km = "6"; vm.answerNoneApplies()
        XCTAssertNil(vm.request())
        await vm.send()
        XCTAssertEqual(vm.phase, .editing)
        XCTAssertTrue(w.journal.entries.isEmpty)
    }

    /// The day the plan in force holds for the row's session (what `HistoryScreen` passes): none for an unplanned row, a session the plan
    /// does not hold, or a session it holds on more than one date.
    func testSessionDateIsThePlansOneDayForTheSession() throws {
        let e = try entry("P-logged-two-voices")
        let weeks = try Repo.store.decode([Week].self, "03-sessions", at: "weeks")
        XCTAssertEqual(HistoryCorrectionViewModel.sessionDate(of: e, in: weeks), "2026-11-17")
        XCTAssertNil(HistoryCorrectionViewModel.sessionDate(of: e, in: []), "no plan")
        let unplanned = try Reread.edited("P-logged-two-voices") { $0["sessionId"] = NSNull() }
        XCTAssertNil(HistoryCorrectionViewModel.sessionDate(of: unplanned, in: weeks))
        var raw = try XCTUnwrap(try Repo.store.object("03-sessions")["weeks"] as? [[String: Any]])
        var moved = raw[0]
        moved["sessions"] = (moved["sessions"] as? [[String: Any]] ?? []).map { s in var s = s; if s["id"] as? String == "w0-run-d1" { s["date"] = "2026-11-18" }; return s }
        raw.append(moved)
        let twice = try JSONDecoder().decode([Week].self, from: JSONSerialization.data(withJSONObject: raw))
        XCTAssertNil(HistoryCorrectionViewModel.sessionDate(of: e, in: twice), "two dates for one session: not ours to pick")
    }

    /// QRE/SSCTR #59 P2/P3-2: every field the app's run form sends for a planned run is re-sent by the correction (the projection cannot show
    /// `seconds`, `conditions` or `walkBreaks`: if the form starts to send one, this fails). `observedAt` is left out on purpose.
    func testTheCorrectionResendsEveryFieldTheRunFormSends() throws {
        let form = RunReportViewModel.makeObservation(planned: (sessionId: "w0-run-d1", date: "2026-11-17"), today: "2026-11-17", end: Date(),
                                                      completed: false, minutes: 5, rpe: 9, stop: .symptom, effort: .onTarget)
        let e = try entry("P-logged-conflict")
        let corr = try XCTUnwrap(HistoryCorrectionViewModel.observation(entry: e, distanceKm: 2, reason: .signalLoss))
        let f = try object(form), c = try object(corr)
        XCTAssertTrue(Set(f.keys).subtracting(["observedAt"]).isSubset(of: Set(c.keys)), "\(f.keys) vs \(c.keys)")
        let fa = try XCTUnwrap(f["actual"] as? [String: Any]), ca = try XCTUnwrap(c["actual"] as? [String: Any])
        XCTAssertTrue(Set(fa.keys).isSubset(of: Set(ca.keys)), "\(fa.keys) vs \(ca.keys)")
        XCTAssertEqual(Set((f["response"] as? [String: Any] ?? [:]).keys), Set((c["response"] as? [String: Any] ?? [:]).keys))
    }
}
