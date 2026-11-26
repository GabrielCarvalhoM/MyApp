import Foundation

/// CCP-A-04 (QRE-A-04): the native erasure fence of one athlete, `erased-<tag>.json` in A's store folder (tag = `NativeStore.name(athleteId)`).
///
/// The custody's tombstone file is named by `hmac(key, …|subject|athleteId)`, and the account erasure removes that key (6.3). Without the fence,
/// the next key could no longer find the tombstone, and the erased id could write and enrol again. The fence keeps the custody's rule ("a new
/// account is a new athlete") without the key: while it exists, the store adapter answers `tombstoneOf` for this host's actor (`NativeStore.jsMembers`).
///  - It is keyed by the same tag that already names the athlete's `.lock` file, which outlives the erasure (QRE-A-07), so it exposes no new
///    identifier. It holds `{scope, state}` only: no time, no health data, no key material. The custody's own tombstone file is unchanged (G07).
///  - It is not sealed. It only ever restricts: forging one denies service on one's own device, and deleting one brings back no data. The
///    old record is deleted and the key that sealed it is gone.
///  - `REQUESTED` is written before the boundary is called. `NATIVE_DONE` is written only when every native removal is checked, and `ERASED`
///    only when B's `purge(.accountErased)` returned. A `REQUESTED` fence found at start is completed before any operation runs; while one
///    remains, nothing runs but that erasure (`CoachingHost.perform`), so old key material can never serve a later enrolment. A
///    `NATIVE_DONE` fence has B's purge re-sent at start and after each write until it returns.
///  - It lives in the app container and goes with it. After a reinstall, the first-launch reconciliation removes the Keychain leftovers, and
///    the same id enrols as a new install with nothing old to recover.
final class ErasureFence {
    /// REQUESTED: asked, not known to be complete. NATIVE_DONE: A's side is removed and checked; B's purge is owed (Security R1 F2a).
    /// ERASED: A's side removed and B's purge returned.
    enum State: String, Codable { case requested = "REQUESTED", nativeDone = "NATIVE_DONE", erased = "ERASED" }
    struct Body: Codable, Equatable { var scope = "ACCOUNT"; var state: State }
    /// What `tombstoneOf` answers for a fenced athlete (the custody only tests that a tombstone exists).
    static let tombstoneText = #"{"scope":"ACCOUNT"}"#
    static let prefix = "erased-"

    let dir: URL
    /// Tests only: returns false to make the next writes fail.
    var writeHook: (() -> Bool)?
    init(dir: URL) { self.dir = dir }

    func file(_ tag: String) -> URL { dir.appendingPathComponent("\(Self.prefix)\(tag).json") }

    /// nil: no fence. A fence file that exists but cannot be read is `REQUESTED` (fail closed: the erasure is not known to be complete).
    func state(_ tag: String) -> State? {
        let u = file(tag)
        if let d = try? Data(contentsOf: u) { return (try? JSONDecoder().decode(Body.self, from: d))?.state ?? .requested }
        return FileManager.default.fileExists(atPath: u.path) ? .requested : nil
    }

    /// A fence file that exists but whose bytes cannot be read (e.g. protected data unavailable). It fences, but never drives a removal
    /// (Security R1 F8: never act on a guess); it is completed once it can be read. A fence whose bytes ARE read but do not decode is
    /// REQUESTED and is completed: its existence alone proves the athlete asked for the erasure (code review R1 #6: no permanent block).
    func isUnreadable(_ tag: String) -> Bool {
        let u = file(tag)
        return FileManager.default.fileExists(atPath: u.path) && (try? Data(contentsOf: u)) == nil
    }

    /// Writes the fence atomically. Returns whether it is durable.
    func set(_ tag: String, _ state: State) -> Bool {
        if writeHook?() == false { return false }
        guard let d = try? JSONEncoder().encode(Body(state: state)) else { return false }
        do { try AtomicFile.write(d, to: file(tag)); return true } catch { return false }
    }

    /// The tags in a state. Only names whose tag is exactly 32 lowercase hex characters (`NativeStore.name`) count: anything else in the
    /// folder is ignored and never drives a removal (Security R1 F6).
    func tags(_ s: State) -> [String]? {
        guard let names = try? FileManager.default.contentsOfDirectory(atPath: dir.path) else { return nil }   // unknown, never "none"
        return names.filter { $0.hasPrefix(Self.prefix) && $0.hasSuffix(".json") }
            .map { String($0.dropFirst(Self.prefix.count).dropLast(".json".count)) }
            .filter(Self.isTag).filter { state($0) == s }.sorted()
    }
    static func isTag(_ t: String) -> Bool { t.utf8.count == 32 && t.utf8.allSatisfy { (48...57).contains($0) || (97...102).contains($0) } }
}
