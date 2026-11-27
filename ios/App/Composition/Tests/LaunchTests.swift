import CoachingHost
import HealthKitIngest
import IntegrationContracts
@testable import RunRecorder
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

/// #83: `-isolatedLiveStores <token>` (Debug only) gives the live UI tests stores of their own; without it, and in every Release build, the
/// live composition uses the standard places.
final class LiveStoresTests: XCTestCase {
    private let tmp = URL(fileURLWithPath: "/tmp-of-the-test", isDirectory: true)

    func testWithoutTheArgumentTheStandardPlaces() throws {
        XCTAssertEqual(LiveStores.of([], temporary: tmp), .standard)
        XCTAssertEqual(LiveStores.of(["RepMile", "-simulatedLocation", "-AppleLanguages", "(pt-BR)"], temporary: tmp), .standard)
        XCTAssertNil(LiveStores.standard.isolatedFolder("CoachingHost"))
        XCTAssertEqual(try LiveStores.standard.identity().directory, try AthleteIdentityStore.standard().directory)
    }

    /// #83 review P3-1: without the argument, each front's own standard place and A's production Keychain service.
    func testTheStandardBranchesAreEachFrontsStandardPlaceAndAsProductionService() throws {
        let stores = LiveStores.of([], temporary: tmp)
        XCTAssertEqual(stores.recordings().directory, RecordingStore.standardDirectory)
        XCTAssertEqual(try stores.queue().directory, try FileQueueStore.applicationSupport().directory)
        let host = stores.host("rm1-0123")
        XCTAssertEqual(host.athleteId, "rm1-0123")
        XCTAssertEqual(host.root, CoachingHost.defaultRoot())
        XCTAssertEqual(host.keychainService, CoachingHost.keychainService)
    }

    #if DEBUG
    func testATokenIsOneFolderOfItsOwnInTheTemporaryDirectory() throws {
        let stores = LiveStores.of(["RepMile", "-isolatedLiveStores", "run-1A", "-simulatedLocation"], temporary: tmp)
        let root = tmp.appendingPathComponent("uitest-live-run-1A", isDirectory: true)
        XCTAssertEqual(stores, .isolated(root))
        XCTAssertEqual(LiveStores.of(["-isolatedLiveStores", "run-1A"], temporary: tmp), stores, "the same token is the same install")
        for name in ["RepMileAccount", "CoachingHost", "HealthKitIngest", "RunRecorder"] {
            XCTAssertEqual(stores.isolatedFolder(name), root.appendingPathComponent(name, isDirectory: true))
        }
        let identity = try stores.identity().directory
        XCTAssertEqual(identity, root.appendingPathComponent("RepMileAccount", isDirectory: true))
        XCTAssertNotEqual(identity.standardizedFileURL, try AthleteIdentityStore.standard().directory.standardizedFileURL)
    }

    func testAMissingOrUnsafeTokenGetsANewFolderNeverTheStandardPlaces() {
        for args in [["-isolatedLiveStores"], ["-isolatedLiveStores", ""], ["-isolatedLiveStores", "../up"], ["-isolatedLiveStores", "a/b"],
                     ["-isolatedLiveStores", ".hidden"], ["-isolatedLiveStores", "é"], ["-isolatedLiveStores", String(repeating: "a", count: 65)],
                     // #83 review P3-3: the next launch argument is not a token (every such launch would share one folder).
                     ["-isolatedLiveStores", "-simulatedLocation", "-AppleLanguages", "(pt-BR)"], ["-isolatedLiveStores", "-"]] {
            XCTAssertEqual(LiveStores.of(args, temporary: tmp, newName: { "fresh" }),
                           .isolated(tmp.appendingPathComponent("uitest-live-fresh", isDirectory: true)), "\(args)")
        }
    }

    /// The isolated branches: under the token's folder, A's items under a service that is never the production one.
    func testTheIsolatedBranchesStayInTheTokensFolderAndService() throws {
        let stores = LiveStores.of(["-isolatedLiveStores", "run-2"], temporary: tmp)
        let root = tmp.appendingPathComponent("uitest-live-run-2", isDirectory: true)
        XCTAssertEqual(stores.recordings().directory, root.appendingPathComponent("RunRecorder", isDirectory: true))
        XCTAssertEqual(try stores.queue().directory, root.appendingPathComponent("HealthKitIngest", isDirectory: true))
        let host = stores.host("rm1-0123")
        XCTAssertEqual(host.root, root.appendingPathComponent("CoachingHost", isDirectory: true))
        XCTAssertEqual(host.keychainService, "fit.vilumo.repmile.lab.coachinghost.uitest-isolated")
        XCTAssertNotEqual(host.keychainService, CoachingHost.keychainService)
        XCTAssertNil(LiveStores.standard.isolatedKeychainItems(), "a standard launch never lists a Keychain service")
    }

    /// #83 review P2-1: what the reinstall UI test reads. Only items still there with the same bytes are leftovers that remain.
    func testTheReconciliationProbeCountsLeftoversAndWhatRemainsOfThem() {
        let key = Data([1]), anchor = Data([2]), newKey = Data([3])
        XCTAssertEqual(LiveStores.reconciliationProbe(outcome: "FRESH_INSTALL_PURGED", before: ["key": key, "anchor.a": anchor], after: [:]),
                       "FRESH_INSTALL_PURGED leftovers=2 remaining=0")
        XCTAssertEqual(LiveStores.reconciliationProbe(outcome: "FRESH_INSTALL_PURGED", before: ["key": key, "anchor.a": anchor], after: ["key": newKey]),
                       "FRESH_INSTALL_PURGED leftovers=2 remaining=0", "a key A wrote after the cleanup is not a leftover")
        XCTAssertEqual(LiveStores.reconciliationProbe(outcome: "FRESH_INSTALL_PURGED", before: ["key": key, "anchor.a": anchor], after: ["anchor.a": anchor]),
                       "FRESH_INSTALL_PURGED leftovers=2 remaining=1")
        XCTAssertEqual(LiveStores.reconciliationProbe(outcome: "NOT_NEEDED", before: ["key": key], after: ["key": key]), "NOT_NEEDED leftovers=1 remaining=1")
        XCTAssertEqual(LiveStores.reconciliationProbe(outcome: "FRESH_INSTALL_PURGED", before: nil, after: [:]), "FRESH_INSTALL_PURGED KEYCHAIN_UNLISTABLE")
    }

    func testTheFirstLaunchOfATokenRemovesEarlierTokensAndARelaunchKeepsItsOwn() throws {
        let parent = FileManager.default.temporaryDirectory.appendingPathComponent("live-stores-" + UUID().uuidString, isDirectory: true)
        defer { try? FileManager.default.removeItem(at: parent) }
        let old = parent.appendingPathComponent("uitest-live-old", isDirectory: true), other = parent.appendingPathComponent("something-else")
        try FileManager.default.createDirectory(at: old, withIntermediateDirectories: true)
        try FileManager.default.createDirectory(at: other, withIntermediateDirectories: true)

        let stores = LiveStores.of(["-isolatedLiveStores", "new"], temporary: parent)
        try stores.prepare()
        let root = parent.appendingPathComponent("uitest-live-new", isDirectory: true)
        XCTAssertTrue(FileManager.default.fileExists(atPath: root.path))
        XCTAssertFalse(FileManager.default.fileExists(atPath: old.path), "an earlier token's folder")
        XCTAssertTrue(FileManager.default.fileExists(atPath: other.path), "nothing else in the folder")

        let id = try stores.identity().current()
        try LiveStores.of(["-isolatedLiveStores", "new"], temporary: parent).prepare()
        XCTAssertEqual(try stores.identity().current(), id, "a relaunch with the same token is the same install")
    }
    #else
    func testAReleaseBuildIgnoresTheArgument() {
        XCTAssertEqual(LiveStores.of(["-isolatedLiveStores", "run-1"], temporary: tmp), .standard)
    }
    #endif
}
