import Foundation
import CryptoKit
import JavaScriptCore

/// The store contract of `store.mjs` over files (NATIVE_OBLIGATIONS 1.1–1.6, N-5, HR5 concurrency: HR5_INTEGRATION_REPORT §4).
///  - one file per athlete (named by a digest of the id), written tmp + fsync + rename + directory fsync; success only after the rename;
///  - file protection `completeUntilFirstUserAuthentication` on iOS (read and written while locked after the first unlock);
///  - one writer across processes: a kernel `flock` on the athlete's lock file, held by the host for the WHOLE facade operation, from the
///    first load to the commit (SEC-FPV-03; it also serialises the app and a future extension), and released by the kernel if the process dies;
///  - commit compares and swaps by version AND by the digest of the bytes this operation loaded (HR5: a carried commit at the same version
///    cannot overwrite a record another writer changed after this load); a mismatch is `{ok:false, conflict:true}`;
///  - a leftover `.tmp` is removed at start, but only under the athlete's lock (a `.tmp` of a live writer in another process is never touched).
///    The `.lock` file itself is never removed while the athlete is in use: with `flock` the lock is the open descriptor, not the file, and a
///    leftover lock file holds nothing once its process is gone (unlinking a file another process has locked would split the lock in two).
/// Test hooks (`faultAfterTmp`, `faultAfterRename`, `failWrites`) kill the process mid-write or simulate a failed write. No training rule.
final class NativeStore {
    enum StoreError: Error { case busy, io(Int32) }

    let dir: URL
    private(set) var cleanedAtStart: [String] = []
    var faultAfterTmp: (() -> Void)?
    var faultAfterRename: (() -> Void)?
    var failWrites = false
    private(set) var commits = 0, conflicts = 0, bytesConflicts = 0, bytesWritten = 0
    /// The digest of the bytes the current operation last loaded, per athlete (nil: absent; not present in the map: not loaded).
    private var loaded: [String: String?] = [:]
    private var held: [String: Int32] = [:]
    /// How long an operation waits for another process holding the athlete's lock before answering BUSY.
    var lockWait: TimeInterval = 10

    init(dir: URL) throws {
        self.dir = dir
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true, attributes: Self.protection)
    }

    #if os(iOS)
    static let protection: [FileAttributeKey: Any] = [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication]
    #else
    static let protection: [FileAttributeKey: Any] = [:]
    #endif

    static func name(_ id: String) -> String { String(EngineRuntime.hex(SHA256.hash(data: Data(id.utf8))).prefix(32)) }
    func file(_ id: String) -> URL { file(tag: Self.name(id)) }
    func lockFile(_ id: String) -> URL { lockFile(tag: Self.name(id)) }
    func file(tag: String) -> URL { dir.appendingPathComponent("athlete-\(tag).json") }
    func lockFile(tag: String) -> URL { dir.appendingPathComponent("athlete-\(tag).lock") }
    func tomb(_ s: String) -> URL { dir.appendingPathComponent("tombstone-\(Self.name(s)).json") }
    static func digest(_ data: Data) -> String { EngineRuntime.hex(SHA256.hash(data: data)) }

    /// The folder's names; nil when it cannot be listed (code review R1 #3: a failed listing is "unknown", never "empty").
    func names() -> [String]? { try? FileManager.default.contentsOfDirectory(atPath: dir.path) }
    /// The install-wide lock (CCP-A-04, code review R1 #1): the key removal and an enrolment's check-and-seal never interleave.
    static let installTag = "install"

    // MARK: the operation lock (kernel flock, across processes)

    /// Runs `body` holding the athlete's kernel lock; re-entrant within this process (one serial queue). A `.tmp` left by a dead writer is
    /// removed once the lock is held. Throws `.busy` if another process keeps the lock longer than `lockWait`.
    func withLock<T>(_ id: String, _ body: () throws -> T) throws -> T {
        let tag = Self.name(id)
        if held[tag] != nil { return try body() }
        return try withLock(tag: tag) { loaded.removeValue(forKey: id); defer { loaded.removeValue(forKey: id) }; return try body() }
    }

    /// The same kernel lock by the athlete's file tag alone (CCP-A-04: the completion of an erasure knows only the tag).
    func withLock<T>(tag: String, _ body: () throws -> T) throws -> T {
        if held[tag] != nil { return try body() }
        let fd = open(lockFile(tag: tag).path, O_CREAT | O_RDWR | O_CLOEXEC, 0o600)
        guard fd >= 0 else { throw StoreError.io(errno) }
        let deadline = Date().addingTimeInterval(lockWait)
        while flock(fd, LOCK_EX | LOCK_NB) != 0 {
            guard errno == EWOULDBLOCK || errno == EINTR else { let e = errno; close(fd); throw StoreError.io(e) }
            if Date() > deadline { close(fd); throw StoreError.busy }
            usleep(2_000)
        }
        if !Self.protection.isEmpty { try? FileManager.default.setAttributes(Self.protection, ofItemAtPath: lockFile(tag: tag).path) }
        held[tag] = fd
        let tmp = file(tag: tag).appendingPathExtension("tmp")
        if FileManager.default.fileExists(atPath: tmp.path) { try? FileManager.default.removeItem(at: tmp); cleanedAtStart.append(tmp.lastPathComponent) }
        defer { held.removeValue(forKey: tag); flock(fd, LOCK_UN); close(fd) }
        return try body()
    }

    // MARK: store.mjs contract (called from JavaScript, under the lock)

    func rawData(_ id: String) -> Data? { try? Data(contentsOf: file(id)) }
    func raw(_ id: String) -> String? { rawData(id).flatMap { String(data: $0, encoding: .utf8) } }

    /// `load`: the stored text, remembering the digest of exactly these bytes for this operation's commit.
    func load(_ id: String) -> String? {
        let d = rawData(id)
        if held[Self.name(id)] != nil { loaded[id] = .some(d.map(Self.digest)) }
        return d.flatMap { String(data: $0, encoding: .utf8) }
    }

    static func versionOf(_ data: Data?) -> Int? {
        guard let data, let o = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
        return (o["version"] as? NSNumber)?.intValue
    }

    /// store.mjs commit: {"ok":true} | {"ok":false,"conflict":true,"version":v}; a failed write throws (the boundary answers PERSISTENCE_FAILURE).
    func commit(_ id: String, expected: Int?, text: String) throws -> String {
        let cur = rawData(id)
        let curVersion = Self.versionOf(cur)
        if curVersion != expected { conflicts += 1; return "{\"ok\":false,\"conflict\":true,\"version\":\(curVersion.map(String.init) ?? "null")}" }
        // HR5 guard: the bytes on disk must be the bytes this operation loaded (same-version carried commits: setHeartRateProfile).
        if let seen = loaded[id], seen != cur.map(Self.digest) {
            bytesConflicts += 1; return "{\"ok\":false,\"conflict\":true,\"version\":\(curVersion.map(String.init) ?? "null")}"
        }
        let data = Data(text.utf8)
        try atomicWrite(data, to: file(id))
        if held[Self.name(id)] != nil { loaded[id] = .some(Self.digest(data)) }
        commits += 1
        return #"{"ok":true}"#
    }

    /// tmp + fsync + rename + directory fsync. Throws on any failure; the earlier file then stays as it was.
    func atomicWrite(_ data: Data, to url: URL) throws {
        if failWrites { throw StoreError.io(ENOSPC) }
        let tmp = url.appendingPathExtension("tmp")
        let fd = open(tmp.path, O_CREAT | O_TRUNC | O_WRONLY | O_CLOEXEC, 0o600)
        guard fd >= 0 else { throw StoreError.io(errno) }
        var ok = data.withUnsafeBytes { buf -> Bool in
            var off = 0
            while off < buf.count { let n = write(fd, buf.baseAddress! + off, buf.count - off); if n <= 0 { return false }; off += n }
            return true
        }
        ok = ok && fsync(fd) == 0
        close(fd)
        guard ok else { unlink(tmp.path); throw StoreError.io(EIO) }
        if !Self.protection.isEmpty { try FileManager.default.setAttributes(Self.protection, ofItemAtPath: tmp.path) }
        faultAfterTmp?()
        guard rename(tmp.path, url.path) == 0 else { let e = errno; unlink(tmp.path); throw StoreError.io(e) }
        let dfd = open(dir.path, O_RDONLY | O_CLOEXEC); if dfd >= 0 { fsync(dfd); close(dfd) }
        bytesWritten += data.count
        faultAfterRename?()
    }

    func remove(_ id: String) { try? FileManager.default.removeItem(at: file(id)) }
    func setRaw(_ id: String, _ text: String) { try? atomicWrite(Data(text.utf8), to: file(id)) }
    func tombstone(_ s: String, _ text: String) throws { try atomicWrite(Data(text.utf8), to: tomb(s)) }
    func tombstoneOf(_ s: String) -> String? { try? String(contentsOf: tomb(s), encoding: .utf8) }
    /// Removes every custody tombstone file (only once the key that named them is gone: `CoachingHost.completeErasure`), and the `.tmp` of
    /// a tombstone write that died before its rename (#49 P3-1). True when none is left.
    func removeTombstones() -> Bool {
        guard let all = self.names() else { return false }
        let names = all.filter { $0.hasPrefix("tombstone-") && ($0.hasSuffix(".json") || $0.hasSuffix(".json.tmp")) }
        for n in names { try? FileManager.default.removeItem(at: dir.appendingPathComponent(n)) }
        return names.allSatisfy { !FileManager.default.fileExists(atPath: dir.appendingPathComponent($0).path) }
    }
    /// Whether a record of an athlete other than `tag` exists (V1: one enrolled athlete per install).
    func hasRecord(otherThan tag: String) -> Bool {
        guard let n = names() else { return true }
        return n.contains { $0.hasPrefix("athlete-") && $0.hasSuffix(".json") && $0 != "athlete-\(tag).json" }
    }

    /// Account erasure on the native side (6.3): the athlete's file and its `.tmp`, under the athlete's lock. The lock file is kept: it holds no
    /// data, and unlinking it while another process waits on it would split the lock in two (QRE-A-07).
    func eraseFiles(_ id: String) { _ = eraseFiles(tag: Self.name(id)) }
    /// The same by tag; true when neither file exists afterwards (CCP-A-04: an erasure is complete only when this is checked).
    func eraseFiles(tag: String) -> Bool {
        if failErasureForTesting { return false }
        var gone = true
        for u in [file(tag: tag), file(tag: tag).appendingPathExtension("tmp")] {
            try? FileManager.default.removeItem(at: u)
            if FileManager.default.fileExists(atPath: u.path) { gone = false }
        }
        return gone
    }
    /// Tests only: the native removal of the record fails (CCP-A-04 T8c).
    var failErasureForTesting = false

    func protectionOf(_ id: String) -> String? {
        ((try? FileManager.default.attributesOfItem(atPath: file(id).path))?[.protectionKey] as? FileProtectionType)?.rawValue
    }

    /// The anchor fields of the stored record (`{version, docMac, carriedSeq}`), to rewrite a stale anchor (contract §6.1 `anchorStale`).
    func anchorOfStored(_ id: String) -> String? {
        guard let d = rawData(id), let o = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
              let v = (o["version"] as? NSNumber)?.intValue, let mac = o["docMac"] as? String else { return nil }
        var a: [String: Any] = ["version": v, "docMac": mac]
        if let seq = ((o["carried"] as? [String: Any])?["seq"] as? NSNumber)?.intValue { a["carriedSeq"] = seq }
        return (try? JSONSerialization.data(withJSONObject: a, options: [.sortedKeys])).flatMap { String(data: $0, encoding: .utf8) }
    }

    /// The JS adapters (`__chstore`): store.mjs's signature over this store.
    /// `fenced` (CCP-A-04): whether this host's athlete is behind an erasure fence. The custody asks `tombstoneOf` only for the subject of
    /// the host's own actor (`custody.mjs` open/enroll), so a fenced athlete answers with a tombstone even when the key that named the custody's
    /// own tombstone file was removed by the account erasure (6.3). The frozen custody then answers GONE through its own code.
    func jsMembers(fenced: @escaping () -> Bool = { false }) -> [String: Any] {
        let s = self
        let load: @convention(block) (String) -> String? = { s.load($0) }
        let raw: @convention(block) (String) -> String? = { s.raw($0) }
        let commit: @convention(block) (String, Int, Bool, String) -> String = { id, v, none, text in
            do { return try s.commit(id, expected: none ? nil : v, text: text) } catch { return "{\"thrown\":\"write failed\"}" }
        }
        let remove: @convention(block) (String) -> Void = { s.remove($0) }
        let tombstone: @convention(block) (String, String) -> String? = { a, t in do { try s.tombstone(a, t); return nil } catch { return "write failed" } }
        let tombstoneOf: @convention(block) (String) -> String? = { s.tombstoneOf($0) ?? (fenced() ? ErasureFence.tombstoneText : nil) }
        let setRaw: @convention(block) (String, String) -> Void = { s.setRaw($0, $1) }
        return ["load": unsafeBitCast(load, to: AnyObject.self), "raw": unsafeBitCast(raw, to: AnyObject.self),
                "commit": unsafeBitCast(commit, to: AnyObject.self), "remove": unsafeBitCast(remove, to: AnyObject.self),
                "tombstone": unsafeBitCast(tombstone, to: AnyObject.self), "tombstoneOf": unsafeBitCast(tombstoneOf, to: AnyObject.self),
                "setRaw": unsafeBitCast(setRaw, to: AnyObject.self)]
    }
}

/// The external anchor `{version, docMac, carriedSeq}` per athlete in the Keychain, stored as the JSON the boundary hands over, WHOLE (HR5R:
/// a port that keeps only `{version, docMac}` is wrong). Written by `SecItemUpdate`/`SecItemAdd`, never deleted before it is added.
final class KeychainAnchor {
    let items: KeychainItems
    private(set) var writes = 0, reads = 0, failures: [Int32] = []
    init(items: KeychainItems) { self.items = items }
    static func account(_ id: String) -> String { account(tag: NativeStore.name(id)) }
    static func account(tag: String) -> String { "anchor." + tag }

    /// The facade's anchor adapter throws on this value (QRE-A-03): a Keychain read that fails is never read as "no anchor", which would turn
    /// off the RECORD_LOST / RECORD_ROLLED_BACK checks.
    static let readFailed = "\u{0}KEYCHAIN_READ_FAILED"
    /// Tests only: the next reads fail as an unreadable Keychain would.
    var failReadsForTesting = false
    func get(_ id: String) -> String? {
        reads += 1
        let r = failReadsForTesting ? (data: nil, status: errSecInteractionNotAllowed) : items.get(Self.account(id))
        if r.status == errSecItemNotFound { return nil }
        guard r.status == errSecSuccess, let d = r.data, let s = String(data: d, encoding: .utf8) else { failures.append(r.status); return Self.readFailed }
        return s
    }
    func set(_ id: String, _ json: String) -> Bool {
        writes += 1
        let st = items.set(Self.account(id), Data(json.utf8))
        if st != errSecSuccess { failures.append(st) }
        return st == errSecSuccess
    }
    func clear(_ id: String) { items.delete(Self.account(id)) }

    func jsMembers() -> [String: Any] {
        let a = self
        let get: @convention(block) (String) -> String? = { a.get($0) }
        let set: @convention(block) (String, String) -> Bool = { a.set($0, $1) }
        let clear: @convention(block) (String) -> Void = { a.clear($0) }
        return ["get": unsafeBitCast(get, to: AnyObject.self), "set": unsafeBitCast(set, to: AnyObject.self), "clear": unsafeBitCast(clear, to: AnyObject.self)]
    }
}
