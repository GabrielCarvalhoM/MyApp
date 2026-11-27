import IntegrationContracts
import XCTest

/// #63: the composition is opened at launch (also a background launch with no scene), the root reuses that one instance, an open that failed
/// before the first unlock is tried again on the unlock, and the fixture composition never opens anything.
@MainActor
final class LaunchOpenerTests: XCTestCase {
    private final class Thing {}
    private struct Locked: Error {}

    /// Counts the opens and the finished ones; an open started while `failing` is true fails (protected data unavailable). `gate`, when set, holds an
    /// open until the test releases it.
    private final class Maker {
        var opens = 0, finished = 0
        var failing = false
        var gate: CheckedContinuation<Void, Never>?
        var holding = false
        func make() async throws -> Thing {
            opens += 1
            defer { finished += 1 }
            let locked = failing  // decided when the open starts: an open that started locked fails, as the real one does
            if holding { await withCheckedContinuation { gate = $0 } }
            await Task.yield()
            if locked { throw Locked() }
            return Thing()
        }
        func release() { holding = false; gate?.resume(); gate = nil }
    }

    private let unlocked = Notification.Name("test-protected-data-available")

    private func until(_ what: String, _ condition: () -> Bool) async {
        for _ in 0..<1000 where !condition() { try? await Task.sleep(nanoseconds: 5_000_000) }
        XCTAssertTrue(condition(), what)
    }

    /// #49 P2-1 with #63: the delegate opens at launch, then the SwiftUI root asks; both get the SAME instance and it was built once
    /// (one CoachingHost per athlete per process).
    func testTheRootReusesTheCompositionOpenedAtLaunch() async throws {
        let maker = Maker(), center = NotificationCenter()
        let opener = LaunchOpener<Thing>(center: center, unlocked: unlocked) { try await maker.make() }
        opener.launch(.live)
        let fromRoot = try await opener.open()
        let again = try await opener.open()
        XCTAssertTrue(fromRoot === again)
        XCTAssertEqual(maker.opens, 1, "one open per process")
        await until("the launch-time open settled") { !opener.isWaitingForUnlock }
        center.post(name: unlocked, object: nil)
        for _ in 0..<10 { await Task.yield() }
        XCTAssertEqual(maker.opens, 1, "an unlock after a successful open opens nothing")
    }

    /// The root first (its open is already running when the delegate's launch comes), then the launch: still one open, one instance.
    func testRootFirstThenLaunchStillOpensOnce() async throws {
        let maker = Maker()
        maker.holding = true
        let opener = LaunchOpener<Thing>(center: NotificationCenter(), unlocked: unlocked) { try await maker.make() }
        let root = Task { try await opener.open() }
        await until("the root's open is running") { maker.opens == 1 && maker.gate != nil }
        opener.launch(.live)
        for _ in 0..<10 { await Task.yield() }
        maker.release()
        let a = try await root.value
        let b = try await opener.open()
        XCTAssertTrue(a === b)
        XCTAssertEqual(maker.opens, 1)
        await until("the launch joined the root's open") { !opener.isWaitingForUnlock }
    }

    /// Before the first unlock the open fails; the next `protectedDataDidBecomeAvailable` opens again by itself, with no scene and no tap.
    func testAnOpenThatFailedBeforeTheFirstUnlockIsTriedAgainOnTheUnlock() async throws {
        let maker = Maker(), center = NotificationCenter()
        maker.failing = true
        let opener = LaunchOpener<Thing>(center: center, unlocked: unlocked) { try await maker.make() }
        opener.launch(.live)
        await until("the first open ran and failed") { maker.finished == 1 }
        for _ in 0..<10 { await Task.yield() }
        XCTAssertTrue(opener.isWaitingForUnlock)

        maker.failing = false
        center.post(name: unlocked, object: nil)
        await until("the unlock opened it") { !opener.isWaitingForUnlock }
        XCTAssertEqual(maker.opens, 2)
        _ = try await opener.open()
        XCTAssertEqual(maker.opens, 2, "the root gets the instance the unlock opened")
    }

    /// Still locked at the unlock signal (or a failure for another reason): keep waiting, try again on the next one.
    func testItKeepsWaitingUntilAnOpenSucceeds() async {
        let maker = Maker(), center = NotificationCenter()
        maker.failing = true
        let opener = LaunchOpener<Thing>(center: center, unlocked: unlocked) { try await maker.make() }
        opener.launch(.live)
        await until("first attempt failed") { maker.finished == 1 }
        for _ in 0..<10 { await Task.yield() }
        center.post(name: unlocked, object: nil)
        await until("second attempt failed") { maker.finished == 2 }
        for _ in 0..<10 { await Task.yield() }
        XCTAssertTrue(opener.isWaitingForUnlock)
        maker.failing = false
        center.post(name: unlocked, object: nil)
        await until("third attempt succeeded") { !opener.isWaitingForUnlock }
        XCTAssertEqual(maker.opens, 3)
    }

    /// An unlock while the launch-time open (started locked) is still running is not lost: once that open fails, one more is made.
    func testAnUnlockDuringARunningAttemptTriesAgainAfterIt() async {
        let maker = Maker(), center = NotificationCenter()
        maker.failing = true; maker.holding = true
        let opener = LaunchOpener<Thing>(center: center, unlocked: unlocked) { try await maker.make() }
        opener.launch(.live)
        await until("the first open is running") { maker.gate != nil }
        center.post(name: unlocked, object: nil)
        for _ in 0..<20 { await Task.yield() }
        XCTAssertEqual(maker.opens, 1, "the unlock does not start a second open while one runs")
        maker.failing = false
        maker.release()  // the running open (started locked) fails
        await until("the retry after the in-flight failure opened it") { !opener.isWaitingForUnlock }
        XCTAssertEqual(maker.opens, 2)
    }

    /// `-scenario` (the fixture composition): the delegate opens nothing, so no host and no HealthKit start in that process.
    func testTheFixtureCompositionOpensNothing() async {
        let maker = Maker(), center = NotificationCenter()
        let opener = LaunchOpener<Thing>(center: center, unlocked: unlocked) { try await maker.make() }
        opener.launch(.fixture)
        center.post(name: unlocked, object: nil)
        for _ in 0..<20 { await Task.yield() }
        XCTAssertEqual(maker.opens, 0)
        XCTAssertFalse(opener.launched)
        XCTAssertFalse(opener.isWaitingForUnlock)
    }

    /// A second launch call (a second scene, a re-run) registers nothing more: one unlock, one attempt.
    func testLaunchIsIdempotent() async {
        let maker = Maker(), center = NotificationCenter()
        maker.failing = true
        let opener = LaunchOpener<Thing>(center: center, unlocked: unlocked) { try await maker.make() }
        opener.launch(.live); opener.launch(.live)
        await until("first attempt failed") { maker.finished == 1 }
        for _ in 0..<20 { await Task.yield() }
        XCTAssertEqual(maker.opens, 1)
        center.post(name: unlocked, object: nil)
        await until("one attempt on the unlock") { maker.finished == 2 }
        for _ in 0..<20 { await Task.yield() }
        XCTAssertEqual(maker.opens, 2)
    }

    /// The fixture composition exists in Debug only; this test target is built in Debug.
    func testScenarioArgumentSelectsTheFixtureCompositionInDebug() {
        XCTAssertEqual(LaunchMode.of([]), .live)
        XCTAssertEqual(LaunchMode.of(["RepMile", "-AppleLanguages", "(pt-BR)"]), .live)
        #if DEBUG
        XCTAssertEqual(LaunchMode.of(["RepMile", "-scenario", "today"]), .fixture)
        #else
        XCTAssertEqual(LaunchMode.of(["RepMile", "-scenario", "today"]), .live)
        #endif
    }
}
