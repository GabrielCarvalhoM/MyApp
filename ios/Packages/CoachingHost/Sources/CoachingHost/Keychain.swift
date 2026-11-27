import Foundation
import Security

/// Generic-password Keychain items of the CoachingHost (service `fit.vilumo.repmile.lab.coachinghost`; contract §9: separate from every other
/// front and from the harness, which this module never touches).
///
/// N-5 / SEC-FPV-03: an item is written by `SecItemUpdate` and, only when it does not exist yet, `SecItemAdd`. It is NEVER deleted before it is
/// added (the harness's `Keychain.set` did `SecItemDelete` + `SecItemAdd`, leaving a window with no anchor: not copied). Items are
/// `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` on iOS (readable while locked after the first unlock: background delivery).
struct KeychainItems {
    static let productionService = "fit.vilumo.repmile.lab.coachinghost"
    /// Where the items live. Production (and every iOS run, the iPhone tests included) is always the system Keychain. `file` exists only in
    /// test builds (COACHINGHOST_TESTING) for the macOS `swift test` runs: see `KEYCHAIN_TESTING.md` (the macOS login keychain binds an item's
    /// access to the creating binary's ad-hoc code identity, which changes at every rebuild, so tests that used it prompted for access).
    enum Storage: Equatable {
        case system
        #if COACHINGHOST_TESTING
        case file(URL)
        #endif
    }
    let service: String
    /// Tests isolate their items under a prefix; production uses none.
    let prefix: String
    let storage: Storage

    init(service: String = KeychainItems.productionService, prefix: String = "", storage: Storage = .system) {
        self.service = service; self.prefix = prefix; self.storage = storage
        #if COACHINGHOST_TESTING && os(macOS)
        // Tripwire (KEYCHAIN_TESTING.md): under XCTest on macOS, the CoachingHost service never reaches the login keychain. A test that
        // forgets the test storage stops here instead of prompting the person at the keyboard.
        if storage == .system, service == Self.productionService, NSClassFromString("XCTestCase") != nil {
            fatalError("CoachingHost tests on macOS must use the test keychain storage (TestEnv.keychainStorage); see KEYCHAIN_TESTING.md")
        }
        #endif
    }

    private func base(_ account: String) -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: prefix + account]
    }

    /// Update in place; add only if absent. Returns the final status (errSecSuccess on success).
    @discardableResult
    func set(_ account: String, _ data: Data) -> OSStatus {
        #if COACHINGHOST_TESTING
        if case .file(let d) = storage { return TestKeychainFile(root: d, service: service).set(prefix + account, data) }
        #endif
        let st = SecItemUpdate(base(account) as CFDictionary, [kSecValueData as String: data] as CFDictionary)
        if st != errSecItemNotFound { return st }
        var q = base(account); q[kSecValueData as String] = data
        #if os(iOS)
        q[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        #endif
        let added = SecItemAdd(q as CFDictionary, nil)
        // A concurrent writer may have added it between the update and the add: update again, never delete.
        if added == errSecDuplicateItem { return SecItemUpdate(base(account) as CFDictionary, [kSecValueData as String: data] as CFDictionary) }
        return added
    }

    /// Adds only if absent (the integrity key: created once, never overwritten). errSecDuplicateItem means another writer created it first.
    func addIfAbsent(_ account: String, _ data: Data) -> OSStatus {
        #if COACHINGHOST_TESTING
        if case .file(let d) = storage { return TestKeychainFile(root: d, service: service).addIfAbsent(prefix + account, data) }
        #endif
        var q = base(account); q[kSecValueData as String] = data
        #if os(iOS)
        q[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        #endif
        return SecItemAdd(q as CFDictionary, nil)
    }

    func get(_ account: String) -> (data: Data?, status: OSStatus) {
        #if COACHINGHOST_TESTING
        if case .file(let d) = storage { return TestKeychainFile(root: d, service: service).get(prefix + account) }
        #endif
        var q = base(account); q[kSecReturnData as String] = true; q[kSecMatchLimit as String] = kSecMatchLimitOne
        var out: CFTypeRef?
        let st = SecItemCopyMatching(q as CFDictionary, &out)
        return (out as? Data, st)
    }

    @discardableResult
    func delete(_ account: String) -> OSStatus {
        #if COACHINGHOST_TESTING
        if case .file(let d) = storage { return TestKeychainFile(root: d, service: service).delete(prefix + account) }
        #endif
        return SecItemDelete(base(account) as CFDictionary)
    }

    /// Every account of this service under this prefix (account erasure, tests). A listing that fails reads as none: see `listAccounts`.
    func accounts() -> [String] { listAccounts() ?? [] }

    /// #49 P3-2: the accounts, or nil when they cannot be listed (e.g. the Keychain is unavailable before the first unlock). Never "none" on
    /// a failure.
    func listAccounts() -> [String]? {
        #if COACHINGHOST_TESTING
        if case .file(let d) = storage { return TestKeychainFile(root: d, service: service).accountsChecked()?.filter { $0.hasPrefix(prefix) }.map { String($0.dropFirst(prefix.count)) } }
        #endif
        let q: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service,
                                kSecReturnAttributes as String: true, kSecMatchLimit as String: kSecMatchLimitAll]
        var out: CFTypeRef?
        let st = SecItemCopyMatching(q as CFDictionary, &out)
        if st == errSecItemNotFound { return [] }
        guard st == errSecSuccess, let items = out as? [[String: Any]] else { return nil }
        let all = items.compactMap { $0[kSecAttrAccount as String] as? String }
        return all.filter { $0.hasPrefix(prefix) }.map { String($0.dropFirst(prefix.count)) }
    }

    /// Removes every item of this service under this prefix. Returns how many were listed (tests and cleanup; unchecked).
    @discardableResult
    func deleteAll() -> Int { let a = accounts(); for x in a { delete(x) }; return a.count }

    /// #49 P3-2: the same, checked: nil when the items cannot be listed or one of them cannot be removed.
    func deleteAllChecked() -> Int? {
        guard let a = listAccounts() else { return nil }
        for x in a { let st = delete(x); if st != errSecSuccess && st != errSecItemNotFound { return nil } }
        return a.count
    }

    /// The accessibility class an item was stored with (nil off iOS, in the test file storage, or if unreadable).
    func accessible(_ account: String) -> String? {
        guard storage == .system else { return nil }
        var q = base(account); q[kSecReturnAttributes as String] = true; q[kSecMatchLimit as String] = kSecMatchLimitOne
        var out: CFTypeRef?
        guard SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let a = out as? [String: Any] else { return nil }
        return a[kSecAttrAccessible as String] as? String
    }
}

/// Resolves the opaque `keyRef` the boundary is given to the integrity key bytes. The key never crosses into JavaScript.
public protocol IntegrityKeyResolving: AnyObject {
    func key(for ref: String) -> Data?
}

/// SEC-FPV-02 / N-4: the production integrity key. A random 256-bit key created by the host (`SecRandomCopyBytes`) on first need and added
/// once to the Keychain; `keyRef` is an opaque label in a one-entry allowlist; any other label resolves to nothing (the bundle then refuses).
/// The key is never logged, never written anywhere but the Keychain, and no fixture key exists in this module (a test greps for it).
final class KeychainIntegrityKey: IntegrityKeyResolving {
    static let keyRef = "rm.integrity.v1"
    static let allowlist: Set<String> = [keyRef]
    static let account = "key.integrity.v1"
    private let items: KeychainItems
    private var cached: Data?
    private let lock = NSLock()
    private(set) var created = false

    init(items: KeychainItems) { self.items = items }

    func key(for ref: String) -> Data? {
        guard Self.allowlist.contains(ref) else { return nil }
        lock.lock(); defer { lock.unlock() }
        if let cached { return cached }
        let got = items.get(Self.account)
        if let d = got.data, d.count == 32 { cached = d; return d }
        guard got.status == errSecItemNotFound else { return nil }   // unreadable (e.g. locked before first unlock): no key, fail closed
        var bytes = [UInt8](repeating: 0, count: 32)
        guard SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes) == errSecSuccess else { return nil }
        let st = items.addIfAbsent(Self.account, Data(bytes))
        if st == errSecDuplicateItem, let d = items.get(Self.account).data, d.count == 32 { cached = d; return d }   // another process won
        guard st == errSecSuccess else { return nil }
        created = true; cached = Data(bytes)
        return cached
    }

    /// Code review R1 #1: drops the cached key unless the Keychain still holds exactly it (one read per operation). An erasure in another
    /// host instance or process removes the key; a cached copy must never seal anything after that.
    func revalidate() {
        lock.lock(); defer { lock.unlock() }
        guard let c = cached else { return }
        let got = items.get(Self.account)
        if got.status != errSecSuccess || got.data != c { cached = nil }
    }

    /// Account erasure (6.3): the key goes with the record; the next enrolment creates a new one. True when the Keychain holds no key afterwards.
    @discardableResult
    func erase() -> Bool {
        lock.lock(); defer { lock.unlock() }
        cached = nil
        if failEraseForTesting { return false }
        let st = items.delete(Self.account)
        return st == errSecSuccess || st == errSecItemNotFound
    }
    /// Tests only: the key's removal fails (CCP-A-04 T12).
    var failEraseForTesting = false
}
