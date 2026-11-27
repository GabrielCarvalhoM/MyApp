import CoachingHost
import Foundation
import HealthKitIngest
import RunRecorder
import Security

/// The stores of A, B and C for `LiveStores` (its folders and the identity are in `Launch.swift`). Standard: each front's own standard
/// place and A's production Keychain service, the only branch a Release build has.
extension LiveStores {
    #if DEBUG
    /// Never A's production service (`CoachingHost.keychainService`): an isolated launch only ever lists or removes what an isolated launch
    /// wrote, and its first-launch reconciliation (#49) removes the items the previous isolated install left, as after a reinstall.
    static let isolatedKeychainService = CoachingHost.keychainService + ".uitest-isolated"
    #endif

    func recordings() -> RecordingStore { isolatedFolder("RunRecorder").map { RecordingStore(directory: $0) } ?? RecordingStore.standard() }

    func queue() throws -> FileQueueStore {
        if let dir = isolatedFolder("HealthKitIngest") { return FileQueueStore(directory: dir) }
        return try FileQueueStore.applicationSupport()
    }

    func host(_ athleteId: String) -> CoachingHost.Configuration {
        #if DEBUG
        if let dir = isolatedFolder("CoachingHost") {
            return CoachingHost.Configuration(athleteId: athleteId, root: dir, keychainService: Self.isolatedKeychainService)
        }
        #endif
        return CoachingHost.Configuration(athleteId: athleteId)
    }

    #if DEBUG
    /// Debug, isolated launches only (#83 review P2-1): the isolated service's items (account → bytes) just before A opens, so the launch can
    /// say what A's first-launch reconciliation found and whether any of it is still there afterwards (`reconciliationProbe`). Nil for a
    /// standard launch (never probed: the production service is never listed here) or when the Keychain cannot be listed.
    func isolatedKeychainItems() -> [String: Data]? {
        guard isolatedFolder("CoachingHost") != nil else { return nil }
        let service = Self.isolatedKeychainService
        let all: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service,
                                  kSecReturnAttributes as String: true, kSecMatchLimit as String: kSecMatchLimitAll]
        var out: CFTypeRef?
        let st = SecItemCopyMatching(all as CFDictionary, &out)
        if st == errSecItemNotFound { return [:] }
        guard st == errSecSuccess, let rows = out as? [[String: Any]] else { return nil }
        var items: [String: Data] = [:]
        for account in rows.compactMap({ $0[kSecAttrAccount as String] as? String }) {
            let one: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service,
                                      kSecAttrAccount as String: account, kSecReturnData as String: true, kSecMatchLimit as String: kSecMatchLimitOne]
            var data: CFTypeRef?
            guard SecItemCopyMatching(one as CFDictionary, &data) == errSecSuccess, let bytes = data as? Data else { return nil }
            items[account] = bytes
        }
        return items
    }

    /// What the launch shows a UI test: `<A's reconciliation outcome> leftovers=<items before A opened> remaining=<of those, still there with
    /// the same bytes after it opened>`. A reinstall that cleans up reads `FRESH_INSTALL_PURGED leftovers=N remaining=0` with N > 0; a
    /// relaunch of the same install reads `NOT_NEEDED`. A new item A writes after the cleanup (a new integrity key) is not a leftover.
    static func reconciliationProbe(outcome: String, before: [String: Data]?, after: [String: Data]?) -> String {
        guard let before, let after else { return "\(outcome) KEYCHAIN_UNLISTABLE" }
        let remaining = before.filter { after[$0.key] == $0.value }.count
        return "\(outcome) leftovers=\(before.count) remaining=\(remaining)"
    }
    #endif
}
