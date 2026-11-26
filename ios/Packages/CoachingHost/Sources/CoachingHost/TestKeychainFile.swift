#if COACHINGHOST_TESTING
import Foundation
import Security

/// Test builds only (COACHINGHOST_TESTING), for the macOS `swift test` runs: a file-backed stand-in for the generic-password items of
/// `KeychainItems`, with the same answers (`errSecSuccess`, `errSecItemNotFound`, `errSecDuplicateItem`) and the same item-level atomicity
/// across processes (add-if-absent is a hard `link(2)`, which fails if the item exists; update is tmp + fsync + rename). See
/// `KEYCHAIN_TESTING.md`: the macOS login keychain ties an item's access to the creating binary's ad-hoc signature, so the tests prompted
/// a person after every rebuild and whenever a second process read an item. The real Keychain stays tested on the iPhone (data-protection
/// Keychain, the production one) and, opt-in, by `MacKeychainIntegrationTests` under an isolated service.
struct TestKeychainFile {
    let dir: URL
    init(root: URL, service: String) { dir = root.appendingPathComponent(Self.hex(service), isDirectory: true) }

    static func hex(_ s: String) -> String { s.utf8.map { String(format: "%02x", $0) }.joined() }
    static func unhex(_ h: String) -> String? {
        var bytes: [UInt8] = []; var i = h.startIndex
        while i < h.endIndex { let j = h.index(i, offsetBy: 2, limitedBy: h.endIndex) ?? h.endIndex; guard let b = UInt8(h[i..<j], radix: 16) else { return nil }; bytes.append(b); i = j }
        return String(bytes: bytes, encoding: .utf8)
    }
    func file(_ account: String) -> URL { dir.appendingPathComponent(Self.hex(account) + ".item") }
    private func ensureDir() { try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true) }

    func get(_ account: String) -> (data: Data?, status: OSStatus) {
        guard let d = try? Data(contentsOf: file(account)) else { return (nil, errSecItemNotFound) }
        return (d, errSecSuccess)
    }
    func addIfAbsent(_ account: String, _ data: Data) -> OSStatus {
        ensureDir()
        let tmp = dir.appendingPathComponent(".\(getpid()).\(UUID().uuidString).tmp")
        guard FileManager.default.createFile(atPath: tmp.path, contents: data) else { return errSecIO }
        defer { unlink(tmp.path) }
        if link(tmp.path, file(account).path) == 0 { return errSecSuccess }
        return errno == EEXIST ? errSecDuplicateItem : errSecIO
    }
    func update(_ account: String, _ data: Data) -> OSStatus {
        guard FileManager.default.fileExists(atPath: file(account).path) else { return errSecItemNotFound }
        do { try AtomicFile.write(data, to: file(account)); return errSecSuccess } catch { return errSecIO }
    }
    /// As `KeychainItems.set`: update in place; add only if absent; never delete first.
    func set(_ account: String, _ data: Data) -> OSStatus {
        let u = update(account, data); if u != errSecItemNotFound { return u }
        let a = addIfAbsent(account, data)
        return a == errSecDuplicateItem ? update(account, data) : a
    }
    func delete(_ account: String) -> OSStatus {
        if unlink(file(account).path) == 0 { return errSecSuccess }
        return errno == ENOENT ? errSecItemNotFound : errSecIO
    }
    func accounts() -> [String] {
        ((try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? []).filter { $0.hasSuffix(".item") }.compactMap { Self.unhex(String($0.dropLast(5))) }
    }
}
#endif
