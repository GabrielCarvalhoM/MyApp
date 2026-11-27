import IntegrationContracts
import RunRecorder
import XCTest

/// #63 P3-1 (G07) and P3-2, kept by #76: the device erasure that follows a rotation, now through front C's own store
/// (`RecordingStore.eraseAll()`, which throws), and the launch-failure codes and states.
@MainActor
final class PendingErasureTests: XCTestCase {
    private var dir: URL!

    override func setUp() {
        dir = FileManager.default.temporaryDirectory.appendingPathComponent("erasure-tests-" + UUID().uuidString, isDirectory: true)
    }
    override func tearDown() {
        let rec = dir.appendingPathComponent("RunRecorder", isDirectory: true)
        for d in [rec, dir!] { try? FileManager.default.setAttributes([.posixPermissions: 0o755], ofItemAtPath: d.path) }
        try? FileManager.default.removeItem(at: dir)
    }

    private var rec: URL { dir.appendingPathComponent("RunRecorder", isDirectory: true) }
    private func rotated() throws -> AthleteIdentityStore {
        let identity = AthleteIdentityStore(directory: dir.appendingPathComponent("account"))
        _ = try identity.rotate(from: try identity.current())
        return identity
    }

    /// Front C's real store over `rec`, holding a finished (indexed) recording of the erased account and a running one in the active file.
    private func filledStore() async -> RecordingStore {
        let store = RecordingStore(directory: rec), clock = Clock()
        let r = RunRecorder(source: SimulatedLocationSource(), store: store, clock: clock)
        r.start(sessionId: nil, sessionDate: nil, steps: [RecorderStep(kind: "STEADY", target: .seconds(600))]); clock.t += 120; r.finish(); r.close()
        r.start(sessionId: nil, sessionDate: nil, steps: [RecorderStep(kind: "STEADY", target: .seconds(600))])
        let indexed = await store.recordings(overlapping: PendingErasure.everything)
        XCTAssertEqual(indexed.count, 1, "the old account's recording is indexed")
        return store
    }

    private final class Clock: RecorderClock, @unchecked Sendable {
        var t = Date(timeIntervalSince1970: 1_795_000_000)
        func now() -> Date { t }
    }

    /// The composition's own call, as `LiveComposition.make` writes it: C opens its store, C erases it, C's index answers.
    private func complete(_ identity: AthleteIdentityStore) async throws -> RecordingStore {
        try await PendingErasure.complete(identity: identity, openStore: { RecordingStore(directory: rec) }, erase: { try $0.eraseAll() },
                                          isEmpty: { await $0.recordings(overlapping: PendingErasure.everything).isEmpty })
    }

    /// The open after a rotation: the erased account's recordings are removed through C, the index checked empty, then the flag cleared.
    func testCompleteErasesTheOldAccountsRecordingsThroughCThenClearsTheFlag() async throws {
        let identity = try rotated()
        _ = await filledStore()
        let store = try await complete(identity)
        let left = await store.recordings(overlapping: PendingErasure.everything)
        XCTAssertTrue(left.isEmpty)
        XCTAssertNil(RunRecorder(source: SimulatedLocationSource(), store: store).finishedRecording)
        XCTAssertEqual(try FileManager.default.contentsOfDirectory(atPath: rec.path), [], "nothing of a run is left in C's folder")
        XCTAssertFalse(try identity.isDeviceErasurePending())
    }

    /// Nothing pending (an ordinary launch): the recordings are the account's own and are never touched.
    func testCompleteLeavesTheCurrentAccountsRecordingsAlone() async throws {
        let identity = AthleteIdentityStore(directory: dir.appendingPathComponent("account"))
        _ = try identity.current()
        _ = await filledStore()
        let store = try await complete(identity)
        let kept = await store.recordings(overlapping: PendingErasure.everything)
        XCTAssertEqual(kept.count, 1)
    }

    /// C's removal fails (here: a folder it cannot change): `DEVICE_ERASURE_PENDING`, the flag stays, the composition does not open; once
    /// the folder can be changed, the next open finishes the erasure.
    func testAFailedRemovalThroughCKeepsTheFlagAndBlocksTheOpen() async throws {
        let identity = try rotated()
        _ = await filledStore()
        try FileManager.default.setAttributes([.posixPermissions: 0o555], ofItemAtPath: rec.path)
        do { _ = try await complete(identity); XCTFail("must throw") } catch {
            XCTAssertEqual(error as? PendingErasure.Failure, .notErased)
            XCTAssertEqual(LaunchFailure.code(for: error), LaunchFailure.erasurePending)
            XCTAssertEqual(LaunchFailure.shown(for: LaunchFailure.code(for: error)), .retryable(code: LaunchFailure.erasurePending))
        }
        XCTAssertTrue(try identity.isDeviceErasurePending())
        try FileManager.default.setAttributes([.posixPermissions: 0o755], ofItemAtPath: rec.path)
        let store = try await complete(identity)
        let left = await store.recordings(overlapping: PendingErasure.everything)
        XCTAssertTrue(left.isEmpty)
        XCTAssertFalse(try identity.isDeviceErasurePending())
    }

    /// A fake of front C's store over a folder, for the steps C's real store cannot be made to fail on: its erase can fail on demand, and
    /// its index is "empty" when the folder holds no file.
    private final class FolderStore {
        let folder: URL
        var eraseFails = false
        init(_ folder: URL) { self.folder = folder; try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true) }
        func erase() throws {
            struct Failed: Error {}
            if eraseFails { throw Failed() }
            for f in (try? FileManager.default.contentsOfDirectory(atPath: folder.path)) ?? [] {
                try FileManager.default.removeItem(at: folder.appendingPathComponent(f))
            }
        }
        var isEmpty: Bool { ((try? FileManager.default.contentsOfDirectory(atPath: folder.path)) ?? []).isEmpty }
    }

    /// A crash (or a failure) between the steps leaves the flag set; the next open does the whole erasure again.
    func testAFailureAtAnyStepKeepsTheFlagAndTheNextOpenFinishesIt() async throws {
        let identity = try rotated()
        try FileManager.default.createDirectory(at: rec, withIntermediateDirectories: true)
        for f in ["active.json", "index.json", "rec-old.json"] { try Data("{}".utf8).write(to: rec.appendingPathComponent(f)) }
        // 1. The erasure throws (any error of C's, not only its own type): flag kept, nothing opened.
        do {
            _ = try await PendingErasure.complete(identity: identity, openStore: { () -> FolderStore in let s = FolderStore(rec); s.eraseFails = true; return s },
                                                  erase: { try $0.erase() }, isEmpty: { $0.isEmpty })
            XCTFail("must throw")
        } catch { XCTAssertEqual(error as? PendingErasure.Failure, .notErased) }
        XCTAssertTrue(try identity.isDeviceErasurePending())
        XCTAssertFalse(FolderStore(rec).isEmpty, "nothing claimed erased")
        // 2. Erased, but the index still answers something (a store elsewhere, a write after the removal): flag kept.
        do { _ = try await PendingErasure.complete(identity: identity, openStore: { FolderStore(rec) }, erase: { try $0.erase() }, isEmpty: { _ in false }); XCTFail("must throw") }
        catch { XCTAssertEqual(error as? PendingErasure.Failure, .notErased) }
        XCTAssertTrue(try identity.isDeviceErasurePending())
        // 3. The old process wrote again after the rotation (or the store recreated a file): the next open removes it too.
        try Data("{}".utf8).write(to: rec.appendingPathComponent("rec-late.json"))
        let store = try await PendingErasure.complete(identity: identity, openStore: { FolderStore(rec) }, erase: { try $0.erase() }, isEmpty: { $0.isEmpty })
        XCTAssertTrue(store.isEmpty)
        XCTAssertFalse(try identity.isDeviceErasurePending())
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

    /// #76: only the damaged identity is shown without "try again"; every other code, the pending erasure included, keeps it.
    func testOnlyADamagedIdentityIsShownWithoutRetry() {
        XCTAssertEqual(LaunchFailure.shown(for: LaunchFailure.identityDamaged), .identityDamaged)
        for code in [HostCode.hostUnavailable, LaunchFailure.erasurePending, "SOMETHING_NEW", ""] {
            XCTAssertEqual(LaunchFailure.shown(for: code), .retryable(code: code), code)
        }
    }

    #if DEBUG
    /// The Debug seam the UI test uses (`-simulateDamagedIdentity`): a damaged file in a folder of its own, read as damaged, kept as it is.
    func testTheSimulatedDamagedIdentityIsDamagedAndNeverTheRealFolder() throws {
        let store = try AthleteIdentityStore.damagedForUITests()
        defer { try? FileManager.default.removeItem(at: store.directory) }
        XCTAssertTrue(store.directory.path.hasPrefix(FileManager.default.temporaryDirectory.path))
        XCTAssertNotEqual(store.directory.standardizedFileURL, try AthleteIdentityStore.standard().directory.standardizedFileURL)
        let file = store.directory.appendingPathComponent("athlete-identity.json")
        let before = try Data(contentsOf: file)
        do { _ = try store.current(); XCTFail("must throw") } catch {
            XCTAssertEqual(error as? AthleteIdentityStore.Failure, .malformed)
            XCTAssertEqual(LaunchFailure.shown(for: LaunchFailure.code(for: error)), .identityDamaged)
        }
        XCTAssertEqual(try Data(contentsOf: file), before, "the damaged file is never replaced")
    }
    #endif
}
