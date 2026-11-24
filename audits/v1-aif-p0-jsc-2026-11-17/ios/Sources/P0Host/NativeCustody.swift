import Foundation
import JavaScriptCore
import CryptoKit
import Security

// REPMILE CoachingCore V1 final physical validation (2026-11-24): the native side of the integration boundary's store contract
// (CoachingCore/src/boundary/store.mjs, NATIVE_OBLIGATIONS §1), as the harness can prove it. This is not the app's persistence layer: it is the
// smallest implementation of the contract the boundary is handed, so the device can run the boundary over real files and the real Keychain.
//  - one file per athlete (named by a digest of the id), written tmp + fsync + rename, the directory fsynced, success only after the rename;
//  - file protection completeUntilFirstUserAuthentication on iOS (so background delivery can write after first unlock);
//  - one writer: an exclusive lock file per commit (O_EXCL), compare-and-swap by version; leftover .tmp/.lock files are removed at start;
//  - the anchor {version, docMac} and the integrity key as Keychain items (kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly on iOS).
// Test hooks (faultAfterTmp, faultAfterRename, failWrites) let the tests kill the process mid-write and simulate a failed write. No training rule.

/// Generic-password Keychain items of the harness (service fit.vilumo.p0.coachingcore).
public enum Keychain {
    public static let service = "fit.vilumo.p0.coachingcore"
    private static func base(_ account: String) -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: account]
    }
    @discardableResult public static func set(_ account: String, _ data: Data) -> OSStatus {
        SecItemDelete(base(account) as CFDictionary)
        var q = base(account); q[kSecValueData as String] = data
        #if os(iOS)
        q[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        #endif
        return SecItemAdd(q as CFDictionary, nil)
    }
    public static func get(_ account: String) -> (data: Data?, status: OSStatus) {
        var q = base(account); q[kSecReturnData as String] = true; q[kSecMatchLimit as String] = kSecMatchLimitOne
        var out: CFTypeRef?
        let st = SecItemCopyMatching(q as CFDictionary, &out)
        return (out as? Data, st)
    }
    @discardableResult public static func delete(_ account: String) -> OSStatus { SecItemDelete(base(account) as CFDictionary) }
    /// Every item of the harness whose account starts with `prefix` (test cleanup).
    public static func deleteAll(prefix: String) {
        var q: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service,
                                kSecReturnAttributes as String: true, kSecMatchLimit as String: kSecMatchLimitAll]
        var out: CFTypeRef?
        guard SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let items = out as? [[String: Any]] else { return }
        for i in items { if let a = i[kSecAttrAccount as String] as? String, a.hasPrefix(prefix) { delete(a) } }
        q.removeAll()
    }
    /// The accessibility class the item was stored with (nil off iOS or if unreadable).
    public static func accessible(_ account: String) -> String? {
        var q = base(account); q[kSecReturnAttributes as String] = true; q[kSecMatchLimit as String] = kSecMatchLimitOne
        var out: CFTypeRef?
        guard SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let a = out as? [String: Any] else { return nil }
        return a[kSecAttrAccessible as String] as? String
    }
}

/// The store contract of store.mjs over files.
public final class NativeFileStore {
    public let dir: URL
    public private(set) var cleanedAtStart: [String] = []
    public var faultAfterTmp: (() -> Void)?
    public var faultAfterRename: (() -> Void)?
    public var failWrites = false
    public private(set) var commits = 0, conflicts = 0, busy = 0, bytesWritten = 0

    public init(dir: URL) throws {
        self.dir = dir
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true, attributes: Self.protection)
        // One writer per app: a .tmp or .lock left here belongs to a writer that is dead (this process just started).
        for f in (try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? [] where f.hasSuffix(".tmp") || f.hasSuffix(".lock") {
            try? FileManager.default.removeItem(at: dir.appendingPathComponent(f)); cleanedAtStart.append(f)
        }
    }
    #if os(iOS)
    static let protection: [FileAttributeKey: Any] = [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication]
    #else
    static let protection: [FileAttributeKey: Any] = [:]
    #endif

    static func name(_ id: String) -> String { String(CoachingCoreRuntime.hex(SHA256.hash(data: Data(id.utf8))).prefix(32)) }
    public func file(_ id: String) -> URL { dir.appendingPathComponent("athlete-\(Self.name(id)).json") }
    func lock(_ id: String) -> URL { dir.appendingPathComponent("athlete-\(Self.name(id)).lock") }
    func tomb(_ s: String) -> URL { dir.appendingPathComponent("tombstone-\(Self.name(s)).json") }

    public func raw(_ id: String) -> String? { try? String(contentsOf: file(id), encoding: .utf8) }
    public static func versionOf(_ text: String?) -> Int? {
        guard let text, let o = try? JSONSerialization.jsonObject(with: Data(text.utf8)) as? [String: Any] else { return nil }
        return (o["version"] as? NSNumber)?.intValue
    }

    /// Writes `data` to `url` by tmp + fsync + rename (+ directory fsync). Throws on any failure; the earlier file then stays as it was.
    func atomicWrite(_ data: Data, to url: URL) throws {
        if failWrites { throw POSIXError(.ENOSPC) }
        let tmp = url.appendingPathExtension("tmp")
        let fd = open(tmp.path, O_CREAT | O_TRUNC | O_WRONLY, 0o600)
        guard fd >= 0 else { throw POSIXError(POSIXErrorCode(rawValue: errno) ?? .EIO) }
        var ok = data.withUnsafeBytes { buf -> Bool in
            var off = 0
            while off < buf.count { let n = write(fd, buf.baseAddress! + off, buf.count - off); if n <= 0 { return false }; off += n }
            return true
        }
        ok = ok && fsync(fd) == 0
        close(fd)
        guard ok else { unlink(tmp.path); throw POSIXError(.EIO) }
        if !Self.protection.isEmpty { try FileManager.default.setAttributes(Self.protection, ofItemAtPath: tmp.path) }
        faultAfterTmp?()
        guard rename(tmp.path, url.path) == 0 else { unlink(tmp.path); throw POSIXError(POSIXErrorCode(rawValue: errno) ?? .EIO) }
        let dfd = open(dir.path, O_RDONLY); if dfd >= 0 { fsync(dfd); close(dfd) }
        bytesWritten += data.count
        faultAfterRename?()
    }

    /// store.mjs commit: {"ok":true} | {"ok":false,"conflict":true,"version":v} | {"ok":false,"busy":true}; a failed write throws.
    public func commit(_ id: String, expected: Int?, text: String) throws -> String {
        let lfd = open(lock(id).path, O_CREAT | O_EXCL | O_WRONLY, 0o600)
        if lfd < 0 { if errno == EEXIST { busy += 1; return #"{"ok":false,"busy":true}"# }; throw POSIXError(POSIXErrorCode(rawValue: errno) ?? .EIO) }
        defer { close(lfd); unlink(lock(id).path) }
        let cur = Self.versionOf(raw(id))
        if cur != expected { conflicts += 1; return "{\"ok\":false,\"conflict\":true,\"version\":\(cur.map(String.init) ?? "null")}" }
        try atomicWrite(Data(text.utf8), to: file(id))
        commits += 1
        return #"{"ok":true}"#
    }
    public func remove(_ id: String) { try? FileManager.default.removeItem(at: file(id)) }
    public func setRaw(_ id: String, _ text: String) { try? atomicWrite(Data(text.utf8), to: file(id)) }
    public func tombstone(_ s: String, _ text: String) throws { try atomicWrite(Data(text.utf8), to: tomb(s)) }
    public func tombstoneOf(_ s: String) -> String? { try? String(contentsOf: tomb(s), encoding: .utf8) }
    /// Account erasure on the native side (NATIVE_OBLIGATIONS §6.3): the athlete's file and any .tmp/.lock of it.
    public func eraseFiles(_ id: String) { for u in [file(id), file(id).appendingPathExtension("tmp"), lock(id)] { try? FileManager.default.removeItem(at: u) } }
    public func protectionOf(_ id: String) -> String? {
        ((try? FileManager.default.attributesOfItem(atPath: file(id).path))?[.protectionKey] as? FileProtectionType)?.rawValue
    }
}

/// The JS adapters over the native store and the Keychain anchor (store.mjs and the anchor {get, set, clear} the integration takes).
public final class NativeBridge {
    public private(set) var store: NativeFileStore
    public let root: URL
    public private(set) var anchorPrefix: String
    public private(set) var anchorWrites = 0, anchorReads = 0, keychainFailures: [Int32] = []
    public init(root: URL, anchorPrefix: String) throws {
        self.root = root; self.anchorPrefix = anchorPrefix
        store = try NativeFileStore(dir: root.appendingPathComponent("default"))
    }
    /// A fresh store directory and anchor prefix (one per journey).
    public func select(_ name: String) throws {
        let d = root.appendingPathComponent(name)
        try? FileManager.default.removeItem(at: d)
        store = try NativeFileStore(dir: d)
        anchorPrefix = anchorPrefix.components(separatedBy: "|").first! + "|" + name + "|"
        Keychain.deleteAll(prefix: anchorPrefix)
    }
    func account(_ id: String) -> String { anchorPrefix + "anchor." + NativeFileStore.name(id) }
    /// A store a new process opens over an existing directory, with the anchor prefix it was written under.
    public func adopt(_ s: NativeFileStore, prefix: String) { store = s; anchorPrefix = prefix }

    public static let adapters = """
    globalThis.__nativeStore = () => ({
      load: id => { const t = __nstore.raw(id); return t === null || t === undefined ? null : JSON.parse(t); },
      commit: (id, v, doc) => { const r = JSON.parse(__nstore.commit(id, v === null || v === undefined ? -1 : v, v === null || v === undefined, JSON.stringify(doc))); if (r.thrown) throw new Error(r.thrown); return r; },
      remove: id => { __nstore.remove(id); },
      tombstone: (s, t) => { const e = __nstore.tombstone(s, JSON.stringify(t)); if (e) throw new Error(e); },
      tombstoneOf: s => { const t = __nstore.tombstoneOf(s); return t === null || t === undefined ? null : JSON.parse(t); },
      raw: id => { const t = __nstore.raw(id); return t === null || t === undefined ? null : t; },
      setRaw: (id, t) => { __nstore.setRaw(id, t); }
    });
    globalThis.__keychainAnchor = () => ({
      get: id => { const t = __nanchor.get(id); return t === null || t === undefined || t === '' ? null : JSON.parse(t); },
      set: (id, v) => { if (!__nanchor.set(id, JSON.stringify(v))) throw new Error('keychain write failed'); },
      clear: id => { __nanchor.clear(id); }
    });
    """

    func install(in context: JSContext) {
        let b = self
        let raw: @convention(block) (String) -> String? = { b.store.raw($0) }
        let commit: @convention(block) (String, Int, Bool, String) -> String = { id, v, none, text in
            do { return try b.store.commit(id, expected: none ? nil : v, text: text) } catch { return "{\"thrown\":\"\(error)\"}" }
        }
        let remove: @convention(block) (String) -> Void = { b.store.remove($0) }
        let tombstone: @convention(block) (String, String) -> String? = { s, t in do { try b.store.tombstone(s, t); return nil } catch { return "\(error)" } }
        let tombstoneOf: @convention(block) (String) -> String? = { b.store.tombstoneOf($0) }
        let setRaw: @convention(block) (String, String) -> Void = { b.store.setRaw($0, $1) }
        let s = JSValue(newObjectIn: context)!
        s.setObject(unsafeBitCast(raw, to: AnyObject.self), forKeyedSubscript: "raw" as NSString)
        s.setObject(unsafeBitCast(commit, to: AnyObject.self), forKeyedSubscript: "commit" as NSString)
        s.setObject(unsafeBitCast(remove, to: AnyObject.self), forKeyedSubscript: "remove" as NSString)
        s.setObject(unsafeBitCast(tombstone, to: AnyObject.self), forKeyedSubscript: "tombstone" as NSString)
        s.setObject(unsafeBitCast(tombstoneOf, to: AnyObject.self), forKeyedSubscript: "tombstoneOf" as NSString)
        s.setObject(unsafeBitCast(setRaw, to: AnyObject.self), forKeyedSubscript: "setRaw" as NSString)
        let select: @convention(block) (String) -> Bool = { name in do { try b.select(name); return true } catch { return false } }
        s.setObject(unsafeBitCast(select, to: AnyObject.self), forKeyedSubscript: "select" as NSString)
        context.setObject(s, forKeyedSubscript: "__nstore" as NSString)
        let aget: @convention(block) (String) -> String? = { id in
            b.anchorReads += 1; let r = Keychain.get(b.account(id))
            if r.status != errSecSuccess && r.status != errSecItemNotFound { b.keychainFailures.append(r.status) }
            return r.data.flatMap { String(data: $0, encoding: .utf8) }
        }
        let aset: @convention(block) (String, String) -> Bool = { id, v in
            b.anchorWrites += 1; let st = Keychain.set(b.account(id), Data(v.utf8)); if st != errSecSuccess { b.keychainFailures.append(st) }; return st == errSecSuccess
        }
        let aclear: @convention(block) (String) -> Void = { id in Keychain.delete(b.account(id)) }
        let a = JSValue(newObjectIn: context)!
        a.setObject(unsafeBitCast(aget, to: AnyObject.self), forKeyedSubscript: "get" as NSString)
        a.setObject(unsafeBitCast(aset, to: AnyObject.self), forKeyedSubscript: "set" as NSString)
        a.setObject(unsafeBitCast(aclear, to: AnyObject.self), forKeyedSubscript: "clear" as NSString)
        context.setObject(a, forKeyedSubscript: "__nanchor" as NSString)
        context.evaluateScript(Self.adapters)
    }
}

extension CoachingCoreRuntime {
    /// The module ids of the bundle by repository path (build-manifest.json), for tests that reach boundary modules through `__p0req`.
    public static func bundleModuleIds() throws -> [String: Int] {
        guard let url = Bundle.module.url(forResource: "build-manifest", withExtension: "json") else { throw P0Error.resource("build-manifest") }
        struct M: Decodable { struct Mod: Decodable { let id: Int; let file: String }; let modules: [Mod]; let bundle: B; struct B: Decodable { let sha256: String } }
        let m = try JSONDecoder().decode(M.self, from: Data(contentsOf: url))
        return Dictionary(uniqueKeysWithValues: m.modules.map { ($0.file, $0.id) })
    }
    /// The bundle's SHA-256 as the build manifest states it, and as the bytes shipped in the app hash.
    public static func bundleSha256() throws -> (manifest: String, shipped: String) {
        guard let url = Bundle.module.url(forResource: "build-manifest", withExtension: "json"), let js = Bundle.module.url(forResource: "coachingcore-p0", withExtension: "js") else { throw P0Error.resource("bundle") }
        struct M: Decodable { let bundle: B; struct B: Decodable { let sha256: String } }
        return (try JSONDecoder().decode(M.self, from: Data(contentsOf: url)).bundle.sha256, hex(SHA256.hash(data: try Data(contentsOf: js))))
    }
    /// Tests only: installs the native store and Keychain anchor adapters in this runtime's context (engine queue).
    public func installNative(_ bridge: NativeBridge) throws {
        dispatchPrecondition(condition: .onQueue(queue))
        bridge.install(in: context)
        _ = try evaluate("void 0")
    }
}
