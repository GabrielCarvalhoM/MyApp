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

/// #63 P3-1 (G07) and P3-2: the device erasure that follows a rotation, and the launch-failure codes.
final class PendingErasureTests: XCTestCase {
    private var dir: URL!

    override func setUp() {
        dir = FileManager.default.temporaryDirectory.appendingPathComponent("erasure-tests-" + UUID().uuidString, isDirectory: true)
    }
    override func tearDown() {
        try? FileManager.default.setAttributes([.posixPermissions: 0o755], ofItemAtPath: dir.path)
        try? FileManager.default.removeItem(at: dir)
    }

    func testEraseRemovesTheFolderAndEverythingInIt() throws {
        let rec = dir.appendingPathComponent("RunRecorder", isDirectory: true)
        try FileManager.default.createDirectory(at: rec.appendingPathComponent("nested"), withIntermediateDirectories: true)
        try Data("{}".utf8).write(to: rec.appendingPathComponent("active.json"))
        try Data("[]".utf8).write(to: rec.appendingPathComponent("index.json"))
        try PendingErasure.erase(rec)
        XCTAssertFalse(FileManager.default.fileExists(atPath: rec.path))
        XCTAssertNoThrow(try PendingErasure.erase(rec), "already erased is erased")
    }

    /// A removal that fails is reported (C's `eraseAll()` cannot report it): the launch does not go on.
    func testAFailedRemovalThrows() throws {
        let rec = dir.appendingPathComponent("RunRecorder", isDirectory: true)
        try FileManager.default.createDirectory(at: rec, withIntermediateDirectories: true)
        try Data("{}".utf8).write(to: rec.appendingPathComponent("rec-1.json"))
        try FileManager.default.setAttributes([.posixPermissions: 0o555], ofItemAtPath: rec.path)
        defer { try? FileManager.default.setAttributes([.posixPermissions: 0o755], ofItemAtPath: rec.path) }
        XCTAssertThrowsError(try PendingErasure.erase(rec)) { XCTAssertEqual($0 as? PendingErasure.Failure, .notErased) }
        XCTAssertEqual(LaunchFailure.code(for: PendingErasure.Failure.notErased), LaunchFailure.erasurePending)
    }

    /// The rotation and the flag are one write: the new id is never on disk without "erasure pending"; the flag is cleared only explicitly,
    /// and clearing it keeps the id.
    func testARotationLeavesTheErasurePendingUntilItIsDone() throws {
        let store = AthleteIdentityStore(directory: dir)
        let first = try store.current()
        XCTAssertFalse(try store.isDeviceErasurePending(), "a new install has nothing to erase")
        let next = try store.rotate(from: first)
        XCTAssertTrue(try AthleteIdentityStore(directory: dir).isDeviceErasurePending(), "the next launch reads the flag")
        XCTAssertEqual(try store.rotate(from: first), next, "a second signal changes nothing")
        XCTAssertTrue(try store.isDeviceErasurePending())
        try store.deviceErasureDone()
        XCTAssertFalse(try AthleteIdentityStore(directory: dir).isDeviceErasurePending())
        XCTAssertEqual(try AthleteIdentityStore(directory: dir).current(), next)
    }

    /// A fake of front C's store over a folder: its index is "empty" when the folder holds no recording file.
    private final class FolderStore {
        let folder: URL
        init(_ folder: URL) { self.folder = folder; try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true) }
        var isEmpty: Bool { ((try? FileManager.default.contentsOfDirectory(atPath: folder.path)) ?? []).isEmpty }
    }

    private func filledRecordings() throws -> URL {
        let rec = dir.appendingPathComponent("RunRecorder", isDirectory: true)
        try FileManager.default.createDirectory(at: rec, withIntermediateDirectories: true)
        for f in ["active.json", "index.json", "rec-old.json"] { try Data("{}".utf8).write(to: rec.appendingPathComponent(f)) }
        return rec
    }

    /// The open after a rotation: the erased account's recordings are removed, the index checked empty, then the flag cleared.
    func testCompleteErasesTheOldAccountsRecordingsThenClearsTheFlag() async throws {
        let identity = AthleteIdentityStore(directory: dir.appendingPathComponent("account"))
        _ = try identity.rotate(from: try identity.current())
        let rec = try filledRecordings()
        let store = try await PendingErasure.complete(identity: identity, directory: rec, openStore: { FolderStore(rec) }, isEmpty: { $0.isEmpty })
        XCTAssertTrue(store.isEmpty)
        XCTAssertFalse(try identity.isDeviceErasurePending())
    }

    /// Nothing pending (an ordinary launch): the recordings are the account's own and are never touched.
    func testCompleteLeavesTheCurrentAccountsRecordingsAlone() async throws {
        let identity = AthleteIdentityStore(directory: dir.appendingPathComponent("account"))
        _ = try identity.current()
        let rec = try filledRecordings()
        let store = try await PendingErasure.complete(identity: identity, directory: rec, openStore: { FolderStore(rec) }, isEmpty: { $0.isEmpty })
        XCTAssertFalse(store.isEmpty)
    }

    /// A crash (or a failure) between the steps leaves the flag set; the next open does the whole erasure again.
    func testAFailureAtAnyStepKeepsTheFlagAndTheNextOpenFinishesIt() async throws {
        let identity = AthleteIdentityStore(directory: dir.appendingPathComponent("account"))
        _ = try identity.rotate(from: try identity.current())
        let rec = try filledRecordings()
        // 1. The removal fails (or the process dies before it): flag kept, nothing opened.
        try FileManager.default.setAttributes([.posixPermissions: 0o555], ofItemAtPath: rec.path)
        do { _ = try await PendingErasure.complete(identity: identity, directory: rec, openStore: { FolderStore(rec) }, isEmpty: { $0.isEmpty }); XCTFail("must throw") }
        catch { XCTAssertEqual(error as? PendingErasure.Failure, .notErased) }
        try FileManager.default.setAttributes([.posixPermissions: 0o755], ofItemAtPath: rec.path)
        XCTAssertTrue(try identity.isDeviceErasurePending())
        // 2. Removed, but the index still answers something (a store elsewhere, a write after the removal): flag kept.
        do { _ = try await PendingErasure.complete(identity: identity, directory: rec, openStore: { FolderStore(rec) }, isEmpty: { _ in false }); XCTFail("must throw") }
        catch { XCTAssertEqual(error as? PendingErasure.Failure, .notErased) }
        XCTAssertTrue(try identity.isDeviceErasurePending())
        // 3. The old process wrote again after the rotation (or the store recreated a file): the next open removes it too.
        try Data("{}".utf8).write(to: rec.appendingPathComponent("rec-late.json"))
        let store = try await PendingErasure.complete(identity: identity, directory: rec, openStore: { FolderStore(rec) }, isEmpty: { $0.isEmpty })
        XCTAssertTrue(store.isEmpty)
        XCTAssertFalse(try identity.isDeviceErasurePending())
    }

    /// A file written before #63 (no flag) still reads, as "nothing pending".
    func testAFileWithoutTheFlagStillReads() throws {
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let id = "rm1-" + String(repeating: "cd", count: 16)
        try Data("{\"schema\":1,\"athleteId\":\"\(id)\"}".utf8).write(to: dir.appendingPathComponent("athlete-identity.json"))
        let store = AthleteIdentityStore(directory: dir)
        XCTAssertEqual(try store.current(), id)
        XCTAssertFalse(try store.isDeviceErasurePending())
    }

    /// P3-2: a damaged identity file has its own code (trying again cannot fix it); an unreadable one is retryable (before the first unlock).
    func testLaunchFailureCodes() {
        XCTAssertEqual(LaunchFailure.code(for: AthleteIdentityStore.Failure.malformed), LaunchFailure.identityDamaged)
        XCTAssertEqual(LaunchFailure.code(for: AthleteIdentityStore.Failure.unreadable), HostCode.hostUnavailable)
        XCTAssertEqual(LaunchFailure.code(for: AthleteIdentityStore.Failure.writeFailed), HostCode.hostUnavailable)
        struct Other: Error {}
        XCTAssertEqual(LaunchFailure.code(for: Other()), HostCode.hostUnavailable)
        XCTAssertNotEqual(LaunchFailure.identityDamaged, HostCode.hostUnavailable)
    }
}
