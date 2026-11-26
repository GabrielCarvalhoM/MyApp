import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation

final class SmokeTests: XCTestCase {
    func testOnboardPlanStartability() async throws {
        let f = try await HostFixture.make("smoke")
        let o = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(o.answer.planOutcome, .planCreated, "\(o.answer.error?.code.raw ?? "")")
        let plan = try await f.host.plan(week: nil).get()
        XCTAssertEqual(plan.state, .validPlan)
        let s = try XCTUnwrap(plan.week?.sessions.first { $0.executable })
        let st = await f.host.startability(sessionId: s.id)
        XCTAssertEqual(st, .startable)
        XCTAssertEqual(f.b.calls.map(\.name), ["deliveryConditionsChanged"])
        TestEnv.cleanup("smoke")
    }
}
