import Foundation

/// The local athlete identity (CCP-A-05, binding): an opaque random id of 128 bits, issued when this install first needs an account and
/// issued again only after that account is known erased. It is never derived from an email, a phone number, an identity-provider subject, a
/// device id or any other stable personal identifier, and an erased id is never issued again.
///
/// One small file in Application Support (deleted with the app, like front A's record and install marker, so a reinstall is a new account and
/// A's first-launch reconciliation clears the Keychain leftovers). Protected until the first unlock and excluded from the backup, as A's store
/// (QRE-A-11): a restored id without A's ThisDeviceOnly key would only meet an integrity failure.
///
/// A file that exists but cannot be read (before the first unlock) is an error, never "no identity": minting a new id then would make a second
/// athlete on this install (A refuses it, ANOTHER_ATHLETE_ON_THIS_INSTALL) and orphan the first one's record.
final class AthleteIdentityStore: @unchecked Sendable {
    enum Failure: Error, Equatable {
        /// The file exists but cannot be read now (protected data unavailable).
        case unreadable
        /// The file reads but is not an identity this code wrote: fail closed, never replaced silently.
        case malformed
        case writeFailed
    }

    /// The athlete id the host accepts: non-empty, at most 128 UTF-16 units, no control character (`facade.open`, admission `idOk`).
    static let maxLength = 128
    static let prefix = "rm1-"

    let directory: URL
    private let random: () -> [UInt8]
    private let lock = NSLock()
    private var file: URL { directory.appendingPathComponent("athlete-identity.json") }

    init(directory: URL, random: @escaping () -> [UInt8] = AthleteIdentityStore.systemRandom128) {
        self.directory = directory; self.random = random
    }

    /// Application Support/RepMileAccount of the app's own container.
    static func standard() throws -> AthleteIdentityStore {
        let base = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        return AthleteIdentityStore(directory: base.appendingPathComponent("RepMileAccount", isDirectory: true))
    }

    /// 128 bits from the system's cryptographically secure generator.
    static func systemRandom128() -> [UInt8] {
        var g = SystemRandomNumberGenerator()
        return (0..<16).map { _ in UInt8.random(in: .min ... .max, using: &g) }
    }

    /// The current athlete id; on the first call of an install, a new one, written durably before it is returned.
    func current() throws -> String {
        lock.lock(); defer { lock.unlock() }
        if let id = try read() { return id }
        let id = mint()
        try write(id)
        return id
    }

    /// After the account `erased` is known erased (a successful `eraseAccount`, or `GONE` read for it): a new id replaces it in one atomic
    /// rename, so there is never a moment with no identity. A no-op when the stored id is already another one (a second signal for the same
    /// erasure). Returns the id the next launch opens with.
    @discardableResult
    func rotate(from erased: String) throws -> String {
        lock.lock(); defer { lock.unlock() }
        if let id = try read(), id != erased { return id }
        var id = mint()
        while id == erased { id = mint() }
        try write(id)
        return id
    }

    static func isValid(_ id: String) -> Bool {
        !id.isEmpty && id.utf16.count <= maxLength && !id.unicodeScalars.contains { $0.value < 0x20 || $0.value == 0x7F }
    }

    // MARK: file

    private struct Stored: Codable { var schema: Int; var athleteId: String }

    private func mint() -> String {
        let bytes = random()
        precondition(bytes.count >= 16, "an athlete id needs at least 128 random bits")
        return Self.prefix + bytes.map { String(format: "%02x", $0) }.joined()
    }

    private func read() throws -> String? {
        guard FileManager.default.fileExists(atPath: file.path) else { return nil }
        guard let data = try? Data(contentsOf: file) else { throw Failure.unreadable }
        guard let s = try? JSONDecoder().decode(Stored.self, from: data), s.schema == 1, Self.isValid(s.athleteId) else { throw Failure.malformed }
        return s.athleteId
    }

    private func write(_ id: String) throws {
        guard Self.isValid(id) else { throw Failure.writeFailed }
        do {
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            var dir = directory; var rv = URLResourceValues(); rv.isExcludedFromBackup = true; try? dir.setResourceValues(rv)
            try Self.durableWrite(try JSONEncoder().encode(Stored(schema: 1, athleteId: id)), to: file)
        } catch { throw Failure.writeFailed }
    }

    /// tmp + fsync + rename + directory fsync (as A's and B's stores): the id is on disk before the host is opened with it, so a crash can never
    /// leave a record whose id the next launch does not know.
    private static func durableWrite(_ data: Data, to url: URL) throws {
        let tmp = url.appendingPathExtension("tmp")
        let fd = open(tmp.path, O_WRONLY | O_CREAT | O_TRUNC, 0o600)
        guard fd >= 0 else { throw Failure.writeFailed }
        var ok = data.withUnsafeBytes { buf -> Bool in
            var off = 0
            while off < buf.count {
                let n = Darwin.write(fd, buf.baseAddress!.advanced(by: off), buf.count - off)
                if n <= 0 { return false }
                off += n
            }
            return true
        }
        ok = ok && fsync(fd) == 0
        close(fd)
        guard ok else { unlink(tmp.path); throw Failure.writeFailed }
        #if os(iOS)
        try? FileManager.default.setAttributes([.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication], ofItemAtPath: tmp.path)
        #endif
        guard rename(tmp.path, url.path) == 0 else { unlink(tmp.path); throw Failure.writeFailed }
        let dfd = open(url.deletingLastPathComponent().path, O_RDONLY)
        if dfd >= 0 { _ = fsync(dfd); close(dfd) }
    }
}
