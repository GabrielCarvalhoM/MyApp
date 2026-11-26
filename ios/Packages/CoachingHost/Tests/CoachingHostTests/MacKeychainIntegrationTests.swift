import Foundation
import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost

/// KEYCHAIN_TESTING.md: the real system Keychain on macOS, OPT-IN (`CH_REAL_KEYCHAIN=1 swift test --filter MacKeychainIntegrationTests`), in an
/// isolated service unique to the run, created, used and removed by this one process. One process is never asked for access to an item it
/// created itself, so this runs without a prompt, even right after a rebuild. The default runs use the file storage, and the production
/// Keychain (iOS, data protection) is tested on the iPhone by every device suite.
final class MacKeychainIntegrationTests: XCTestCase {
    func testRealKeychainSemanticsInAnIsolatedService() throws {
        #if os(macOS)
        guard ProcessInfo.processInfo.environment["CH_REAL_KEYCHAIN"] == "1" else { throw XCTSkip("opt-in: CH_REAL_KEYCHAIN=1 (KEYCHAIN_TESTING.md)") }
        let service = "\(KeychainItems.productionService).it.\(UUID().uuidString.lowercased())"
        let items = KeychainItems(service: service, prefix: "it.", storage: .system)
        defer { items.deleteAll() }
        XCTAssertEqual(items.get("a").status, errSecItemNotFound)
        XCTAssertEqual(items.addIfAbsent("a", Data("1".utf8)), errSecSuccess)
        XCTAssertEqual(items.addIfAbsent("a", Data("2".utf8)), errSecDuplicateItem, "created once, never overwritten")
        XCTAssertEqual(items.set("a", Data("3".utf8)), errSecSuccess, "updated in place")
        XCTAssertEqual(items.get("a").data, Data("3".utf8))
        let key = KeychainIntegrityKey(items: items)
        let k = try XCTUnwrap(key.key(for: KeychainIntegrityKey.keyRef)); XCTAssertEqual(k.count, 32); XCTAssertTrue(key.created)
        XCTAssertEqual(Set(items.accounts()), ["a", KeychainIntegrityKey.account])
        XCTAssertTrue(key.erase()); XCTAssertEqual(items.get(KeychainIntegrityKey.account).status, errSecItemNotFound)
        XCTAssertEqual(items.delete("a"), errSecSuccess); XCTAssertEqual(items.delete("a"), errSecItemNotFound)
        XCTAssertEqual(items.accounts(), [])
        #else
        throw XCTSkip("macOS only: the iPhone suites use the real Keychain throughout")
        #endif
    }

    /// The file storage answers as the Keychain does (the semantics the host relies on), so the default macOS runs test the same contract.
    func testFileStorageMatchesTheKeychainContract() throws {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("ch-kc-\(UUID().uuidString)")
        defer { try? FileManager.default.removeItem(at: dir) }
        #if COACHINGHOST_TESTING
        let items = KeychainItems(service: KeychainItems.productionService, prefix: "t.", storage: .file(dir))
        XCTAssertEqual(items.get("a").status, errSecItemNotFound)
        XCTAssertEqual(items.addIfAbsent("a", Data("1".utf8)), errSecSuccess)
        XCTAssertEqual(items.addIfAbsent("a", Data("2".utf8)), errSecDuplicateItem)
        XCTAssertEqual(items.set("a", Data("3".utf8)), errSecSuccess); XCTAssertEqual(items.get("a").data, Data("3".utf8))
        XCTAssertEqual(items.set("b", Data("4".utf8)), errSecSuccess)
        XCTAssertEqual(Set(items.accounts()), ["a", "b"])
        XCTAssertEqual(KeychainItems(service: KeychainItems.productionService, prefix: "other.", storage: .file(dir)).accounts(), [], "prefixes isolate")
        XCTAssertEqual(items.delete("a"), errSecSuccess); XCTAssertEqual(items.delete("a"), errSecItemNotFound)
        XCTAssertEqual(items.deleteAll(), 1)
        #endif
    }
}
