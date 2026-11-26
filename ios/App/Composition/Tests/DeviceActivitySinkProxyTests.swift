import IntegrationContracts
import XCTest

/// The composition's late-bound A ↔ B proxy (#16): unbound answers, forwarding, weak ownership, a single bind, and CCP-B-04 (no wait added
/// between the two sides; a re-entrant call from inside A's answer completes).
final class DeviceActivitySinkProxyTests: XCTestCase {
    private final class FakeHost: DeviceActivitySink, @unchecked Sendable {
        var contexts = 0, deliveries = 0
        var onContext: (() async -> Void)?
        let context: IngestContextResult
        init(context: IngestContextResult = .ready(IngestContext(recordStartDay: "2026-11-23", timezoneOffsetMinutes: -180, runSessions: [], version: 3))) {
            self.context = context
        }
        func ingestContext() async -> IngestContextResult { contexts += 1; await onContext?(); return context }
        func deliver(_ delivery: DeviceDelivery) async -> DeliveryResult { deliveries += 1; return .answered(version: 4, activities: []) }
    }

    private func delivery() throws -> DeviceDelivery {
        let a = DeviceActivity(activityId: "hk-1", observedAt: "2026-11-24T10:30:00-03:00", actual: DeviceActual(completed: true, minutes: 30))
        return try DeviceDelivery(deliveryId: UUID().uuidString, activities: [a])
    }

    func testUnboundAnswersHostUnavailableAndNothingIsSent() async throws {
        let proxy = DeviceActivitySinkProxy()
        XCTAssertFalse(proxy.isBound)
        let ctx = await proxy.ingestContext()
        XCTAssertEqual(ctx, .unavailable(code: HostCode.hostUnavailable))
        let d = await proxy.deliver(try delivery())
        XCTAssertEqual(d, .hostUnavailable)
    }

    func testBoundForwardsExactlyOnceToTheHost() async throws {
        let proxy = DeviceActivitySinkProxy(), host = FakeHost()
        XCTAssertTrue(proxy.bind(host))
        let ctx = await proxy.ingestContext()
        XCTAssertEqual(ctx, host.context)
        let d = await proxy.deliver(try delivery())
        XCTAssertEqual(d, .answered(version: 4, activities: []))
        XCTAssertEqual(host.contexts, 1); XCTAssertEqual(host.deliveries, 1)
    }

    /// #49 P2-1: one host per process. A second bind changes nothing.
    func testASecondBindIsRefused() async {
        let proxy = DeviceActivitySinkProxy(), first = FakeHost(), second = FakeHost(context: .unavailable(code: "NOT_ENROLLED"))
        XCTAssertTrue(proxy.bind(first))
        XCTAssertFalse(proxy.bind(second))
        _ = await proxy.ingestContext()
        XCTAssertEqual(first.contexts, 1); XCTAssertEqual(second.contexts, 0)
    }

    /// The proxy never keeps the host alive (A → B → proxy would be a cycle): the composition owns A. Once A is gone, B gets "host unavailable".
    func testTheHostIsHeldWeakly() async {
        let proxy = DeviceActivitySinkProxy()
        weak var gone: FakeHost?
        do {
            let host = FakeHost()
            gone = host
            proxy.bind(host)
            XCTAssertTrue(proxy.isBound)
        }
        XCTAssertNil(gone)
        XCTAssertFalse(proxy.isBound)
        let ctx = await proxy.ingestContext()
        XCTAssertEqual(ctx, .unavailable(code: HostCode.hostUnavailable))
    }

    /// CCP-B-04: while B's call is pending inside A, A may signal B, and B may call the sink again (a re-entrant read). The proxy holds no
    /// lock across the await, so the inner call completes before the outer one returns: no deadlock, no serialisation added by the proxy.
    func testAReentrantCallWhileACallIsPendingCompletes() async {
        let proxy = DeviceActivitySinkProxy(), host = FakeHost()
        var depth = 0
        host.onContext = { [weak proxy] in
            depth += 1
            if depth == 1 { _ = await proxy?.ingestContext() }
        }
        proxy.bind(host)
        let done = expectation(description: "outer call returns")
        Task { _ = await proxy.ingestContext(); done.fulfill() }
        await fulfillment(of: [done], timeout: 5)
        XCTAssertEqual(host.contexts, 2)
    }

    /// Many concurrent calls from B (observer, triggers, retries) all reach the host; none waits on another inside the proxy.
    func testConcurrentCallsAllReachTheHost() async {
        let proxy = DeviceActivitySinkProxy(), host = Counting()
        proxy.bind(host)
        await withTaskGroup(of: Void.self) { g in for _ in 0..<200 { g.addTask { _ = await proxy.ingestContext() } } }
        let n = await host.calls.value
        XCTAssertEqual(n, 200)
    }

    private final class Counting: DeviceActivitySink, @unchecked Sendable {
        actor Box { var value = 0; func add() { value += 1 } }
        let calls = Box()
        func ingestContext() async -> IngestContextResult { await calls.add(); return .unavailable(code: "NOT_ENROLLED") }
        func deliver(_ delivery: DeviceDelivery) async -> DeliveryResult { .hostUnavailable }
    }

    /// A late bind: a call made before A is bound answers "host unavailable"; the next one, after the bind, reaches A (B's next trigger).
    func testACallAfterTheLateBindReachesTheHost() async {
        let proxy = DeviceActivitySinkProxy(), host = FakeHost()
        let before = await proxy.ingestContext()
        XCTAssertEqual(before, .unavailable(code: HostCode.hostUnavailable))
        proxy.bind(host)
        let after = await proxy.ingestContext()
        XCTAssertEqual(after, host.context)
    }
}
