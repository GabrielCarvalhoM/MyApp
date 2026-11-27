import IntegrationContracts
import XCTest

/// The local athlete identity (CCP-A-05) and its rotation after an erasure, and the once-per-process open (#49 P2-1).
final class AthleteIdentityStoreTests: XCTestCase {
    private var dir: URL!

    override func setUp() {
        dir = FileManager.default.temporaryDirectory.appendingPathComponent("identity-tests-" + UUID().uuidString, isDirectory: true)
    }
    override func tearDown() { try? FileManager.default.removeItem(at: dir) }

    private var file: URL { dir.appendingPathComponent("athlete-identity.json") }

    func testTheFirstIdIsRandomBoundedAndDurable() throws {
        let a = AthleteIdentityStore(directory: dir)
        let id = try a.current()
        XCTAssertTrue(id.hasPrefix(AthleteIdentityStore.prefix))
        XCTAssertEqual(id.count, AthleteIdentityStore.prefix.count + 32, "128 bits, hex")
        XCTAssertLessThanOrEqual(id.utf16.count, AthleteIdentityStore.maxLength)
        XCTAssertTrue(AthleteIdentityStore.isValid(id))
        XCTAssertEqual(try a.current(), id, "stable within a launch")
        XCTAssertEqual(try AthleteIdentityStore(directory: dir).current(), id, "stable across launches (a new process reads the file)")
        XCTAssertFalse(FileManager.default.fileExists(atPath: file.appendingPathExtension("tmp").path), "no temporary left behind")
    }

    /// Two installs (two directories) never share an id, and nothing personal goes in: the id is the random bytes only.
    func testIdsComeOnlyFromTheRandomSource() throws {
        let one = try AthleteIdentityStore(directory: dir.appendingPathComponent("one")).current()
        let two = try AthleteIdentityStore(directory: dir.appendingPathComponent("two")).current()
        XCTAssertNotEqual(one, two)
        let fixed = AthleteIdentityStore(directory: dir.appendingPathComponent("fixed"), random: { Array(repeating: 0xAB, count: 16) })
        XCTAssertEqual(try fixed.current(), "rm1-" + String(repeating: "ab", count: 16))
    }

    /// CCP-A-05 rule 3: after an erasure the next launch is a new account (NOT_ENROLLED → onboarding), and the erased id is never issued again.
    func testRotationAfterAnErasureIssuesANewIdForTheNextLaunch() throws {
        let a = AthleteIdentityStore(directory: dir)
        let erased = try a.current()
        let next = try a.rotate(from: erased)
        XCTAssertNotEqual(next, erased)
        XCTAssertTrue(AthleteIdentityStore.isValid(next))
        XCTAssertEqual(try AthleteIdentityStore(directory: dir).current(), next, "the next launch opens the new id")
    }

    /// A second signal for the same erasure (the explicit erase, then GONE read for it) rotates once only.
    func testRotationIsIdempotentForTheSameErasure() throws {
        let a = AthleteIdentityStore(directory: dir)
        let erased = try a.current()
        let next = try a.rotate(from: erased)
        XCTAssertEqual(try a.rotate(from: erased), next)
        XCTAssertEqual(try a.current(), next)
    }

    /// A random source that repeats the erased id is never accepted as the new one.
    func testRotationNeverReissuesTheErasedId() throws {
        var calls = 0
        let a = AthleteIdentityStore(directory: dir, random: {
            calls += 1
            return Array(repeating: calls <= 2 ? 0x11 : 0x22, count: 16)
        })
        let erased = try a.current()
        XCTAssertEqual(erased, "rm1-" + String(repeating: "11", count: 16))
        XCTAssertEqual(try a.rotate(from: erased), "rm1-" + String(repeating: "22", count: 16))
    }

    /// Fail closed: a file that is there but does not hold an identity this code wrote is never replaced by a new id (that would make a second
    /// athlete on the install and orphan the first record).
    func testAMalformedFileIsAnErrorNotANewAccount() throws {
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let junk = Data("{\"schema\":1,\"athleteId\":\"\"}".utf8)
        try junk.write(to: file)
        XCTAssertThrowsError(try AthleteIdentityStore(directory: dir).current()) { XCTAssertEqual($0 as? AthleteIdentityStore.Failure, .malformed) }
        XCTAssertThrowsError(try AthleteIdentityStore(directory: dir).rotate(from: "x"))
        XCTAssertEqual(try Data(contentsOf: file), junk, "never overwritten")
    }

    /// #63 P3-2: bytes that are not JSON at all are a damaged identity, never replaced, with their own launch code.
    func testANonJSONFileIsDamagedAndKept() throws {
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let junk = Data([0xFF, 0x00, 0x7B, 0x13, 0x37])
        try junk.write(to: file)
        XCTAssertThrowsError(try AthleteIdentityStore(directory: dir).current()) {
            XCTAssertEqual($0 as? AthleteIdentityStore.Failure, .malformed)
            XCTAssertEqual(LaunchFailure.code(for: $0), LaunchFailure.identityDamaged)
        }
        XCTAssertThrowsError(try AthleteIdentityStore(directory: dir).isDeviceErasurePending())
        XCTAssertEqual(try Data(contentsOf: file), junk, "never overwritten")
    }

    /// #63 P3-2: a file that is there but cannot be read now (before the first unlock) is "unreadable", retryable, and never replaced.
    func testAnUnreadableFileIsAnErrorAndKept() throws {
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let id = try AthleteIdentityStore(directory: dir).current()
        try FileManager.default.setAttributes([.posixPermissions: 0o000], ofItemAtPath: file.path)
        defer { try? FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: file.path) }
        XCTAssertThrowsError(try AthleteIdentityStore(directory: dir).current()) {
            XCTAssertEqual($0 as? AthleteIdentityStore.Failure, .unreadable)
            XCTAssertEqual(LaunchFailure.code(for: $0), HostCode.hostUnavailable, "the next unlock can open it")
        }
        XCTAssertThrowsError(try AthleteIdentityStore(directory: dir).rotate(from: id))
        try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: file.path)
        XCTAssertEqual(try AthleteIdentityStore(directory: dir).current(), id, "the same id once readable again")
    }

    func testAnOverlongOrControlCharacterIdIsInvalid() {
        XCTAssertFalse(AthleteIdentityStore.isValid(""))
        XCTAssertFalse(AthleteIdentityStore.isValid(String(repeating: "a", count: 129)))
        XCTAssertTrue(AthleteIdentityStore.isValid(String(repeating: "a", count: 128)))
        XCTAssertFalse(AthleteIdentityStore.isValid("rm1-\n"))
    }
}

@MainActor
final class SingleOpenTests: XCTestCase {
    private final class Thing {}

    /// #49 P2-1: concurrent and later callers share ONE opened instance (one CoachingHost per athlete per process).
    func testConcurrentCallersShareOneOpen() async throws {
        let once = SingleOpen<Thing>()
        var opens = 0
        let open: @MainActor () async throws -> Thing = { opens += 1; try await Task.sleep(nanoseconds: 50_000_000); return Thing() }
        async let a = once.value(open)
        async let b = once.value(open)
        let (x, y) = try await (a, b)
        let z = try await once.value(open)
        XCTAssertEqual(opens, 1)
        XCTAssertTrue(x === y); XCTAssertTrue(y === z)
    }

    /// A failed open is not kept: "try again" opens again, and its success is then shared.
    func testAFailedOpenIsRetried() async throws {
        struct Boom: Error {}
        let once = SingleOpen<Thing>()
        var opens = 0
        do { _ = try await once.value { opens += 1; throw Boom() }; XCTFail("must throw") } catch {}
        let t = try await once.value { opens += 1; return Thing() }
        let u = try await once.value { opens += 1; return Thing() }
        XCTAssertEqual(opens, 2)
        XCTAssertTrue(t === u)
    }
}
