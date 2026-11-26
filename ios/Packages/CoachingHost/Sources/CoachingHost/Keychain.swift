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
    let service: String
    /// Tests isolate their items under a prefix; production uses none.
    let prefix: String

    init(service: String = KeychainItems.productionService, prefix: String = "") { self.service = service; self.prefix = prefix }

    private func base(_ account: String) -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: prefix + account]
    }

    /// Update in place; add only if absent. Returns the final status (errSecSuccess on success).
    @discardableResult
    func set(_ account: String, _ data: Data) -> OSStatus {
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
        var q = base(account); q[kSecValueData as String] = data
        #if os(iOS)
        q[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        #endif
        return SecItemAdd(q as CFDictionary, nil)
    }

    func get(_ account: String) -> (data: Data?, status: OSStatus) {
        var q = base(account); q[kSecReturnData as String] = true; q[kSecMatchLimit as String] = kSecMatchLimitOne
        var out: CFTypeRef?
        let st = SecItemCopyMatching(q as CFDictionary, &out)
        return (out as? Data, st)
    }

    @discardableResult
    func delete(_ account: String) -> OSStatus { SecItemDelete(base(account) as CFDictionary) }

    /// Every account of this service under this prefix (the first-launch reconciliation and account erasure).
    func accounts() -> [String] {
        let q: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service,
                                kSecReturnAttributes as String: true, kSecMatchLimit as String: kSecMatchLimitAll]
        var out: CFTypeRef?
        guard SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let items = out as? [[String: Any]] else { return [] }
        return items.compactMap { $0[kSecAttrAccount as String] as? String }.filter { $0.hasPrefix(prefix) }.map { String($0.dropFirst(prefix.count)) }
    }

    /// Removes every item of this service under this prefix. Returns how many were removed.
    @discardableResult
    func deleteAll() -> Int { let a = accounts(); for x in a { delete(x) }; return a.count }

    /// The accessibility class an item was stored with (nil off iOS or if unreadable).
    func accessible(_ account: String) -> String? {
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

    /// Account erasure (6.3): the key goes with the record; the next enrolment creates a new one.
    func erase() { lock.lock(); cached = nil; items.delete(Self.account); lock.unlock() }
}
