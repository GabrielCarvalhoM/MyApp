import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #38: the gate that withholds the prescription of a run in progress (and stops an unplanned start) is exactly the safety allow-list.
@MainActor
final class RunSafetyGateTests: XCTestCase {
    private func loaded(_ scenario: Scenario) async -> AppModel {
        let m = AppModel(reader: FixtureCoachingReader(scenario: scenario, store: Repo.store), writer: FixtureCoachingWriter(store: Repo.store),
                         health: FixtureHealthIngestStatus(queued: 0), athleteName: "Teste")
        await m.load()
        return m
    }

    func testNoGateOnAnOrdinaryDay() async throws {
        let m = await loaded(.today)
        let s = try XCTUnwrap(m.plan?.week?.sessions.first { m.startability(of: $0) == .startable })
        XCTAssertNil(m.runSafetyGate(for: s))
        XCTAssertNil(m.runSafetyGate(for: nil))
        XCTAssertNil(m.unplannedRunGate)
    }

    func testEverySafetyReasonWithholdsTheSteps() async {
        let cases: [(Scenario, NotStartableReason)] = [(.blocked, .blocked), (.restartOutsideScope, .outsideV1Scope), (.screenRequired, .screenRequired)]
        for (scenario, reason) in cases {
            let m = await loaded(scenario)
            XCTAssertEqual(m.runSafetyGate(for: nil), reason, scenario.id)
            for s in m.plan?.week?.sessions ?? [] { XCTAssertEqual(m.runSafetyGate(for: s), reason, "\(scenario.id) \(s.id)") }
        }
    }

    func testAClockReasonStopsAStartButNotARunInProgress() async throws {
        let m = await loaded(.clockUntrusted)
        let s = try XCTUnwrap(m.plan?.week?.sessions.first)
        XCTAssertFalse(m.canStart(s))
        XCTAssertNil(m.runSafetyGate(for: s), "clock, record or repertoire reasons are not safety holds (SSCTR: no new prescriptive rule)")
    }
}
