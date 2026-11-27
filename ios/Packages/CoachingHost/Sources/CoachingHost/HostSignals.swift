import Foundation

/// The persistent native safety signals of one athlete (beside the store, same protection, atomic writes). Each one stops every session from
/// being startable for a reason the engine's view cannot see, and only the event named below releases it. Fail closed: an unreadable signals
/// file reads as "every signal set" (nothing startable) until it is written again.
struct HostSignals: Codable, Equatable {
    /// SEC-FPV-01 / N-3: set BEFORE any `eraseHealthFacts` is sent (QRE-A-02: an erasure committed and a process death before the signal is
    /// written must not lose it); kept after a successful erasure; released only when a request carrying `eligibility` is recorded.
    var screenRequiredAfterErasure = false
    /// FND-ABC-04 / 04b: the latest intake (a restart) was refused by scope or routed to a human while the earlier plan stays executable in the
    /// record. Released only by an intake the engine accepts (`planCreated`) or by the account erasure.
    var scope: Scope? = nil
    /// QRE-A-02: a restart is in flight. Written before the restart is sent and resolved from its answer. Found set (the process died between the
    /// answer and the resolution), nothing starts until an intake is accepted or the account is erased: the refused restart left no trace in
    /// the record, so the host cannot know whether it was refused.
    var pendingIntake = false
    /// A18a (ii) and handoff 5.4: an answer asked for the warning signs (`warningSignScreen` REQUIRED, or `missingInputs` naming warning signs).
    /// Released only by the answer to a request that carries sign answers or a screen (QRE-A-05), never by an unrelated report.
    var warningSignsAsked = false

    enum Scope: String, Codable, Equatable { case outsideV1Scope = "OUTSIDE_V1_SCOPE", clinicalHumanRequired = "CLINICAL_HUMAN_REQUIRED" }
    /// In memory only, while the file cannot be read (QRE-A-08: never written to disk as a fact).
    static let failClosed = HostSignals(screenRequiredAfterErasure: true, scope: nil, pendingIntake: true, warningSignsAsked: true)

    init(screenRequiredAfterErasure: Bool = false, scope: Scope? = nil, pendingIntake: Bool = false, warningSignsAsked: Bool = false) {
        self.screenRequiredAfterErasure = screenRequiredAfterErasure; self.scope = scope; self.pendingIntake = pendingIntake; self.warningSignsAsked = warningSignsAsked
    }
    enum CodingKeys: String, CodingKey { case screenRequiredAfterErasure, scope, pendingIntake, warningSignsAsked }
    init(from d: Decoder) throws {
        let c = try d.container(keyedBy: CodingKeys.self)
        screenRequiredAfterErasure = try c.decodeIfPresent(Bool.self, forKey: .screenRequiredAfterErasure) ?? false
        scope = try c.decodeIfPresent(Scope.self, forKey: .scope)
        pendingIntake = try c.decodeIfPresent(Bool.self, forKey: .pendingIntake) ?? false
        warningSignsAsked = try c.decodeIfPresent(Bool.self, forKey: .warningSignsAsked) ?? false
    }
}

/// The signals file of one athlete. Every change is written atomically and its result checked: if it cannot be written, the change stays
/// pending in memory (`dirty`) and `startability` answers `recordUnavailable` until a write succeeds (QRE-A-02). An unreadable file is never
/// overwritten with a guess (QRE-A-08): it stays `unreadable` (startability `recordUnavailable`) until it can be read again.
///
/// #49 P2-1 (FND-ABC-04/04b): nothing is cached across a write. Each change, and each `flush`, runs under the athlete's kernel lock
/// (`withLock`, set by the host): the file is read again, the changes not yet on disk are applied over it, then this one, and the result is
/// written. Another instance or process writing an unrelated signal meanwhile is never overwritten by a stale copy (a `scope` stays).
final class SignalStore {
    let file: URL
    private(set) var current: HostSignals
    private(set) var unreadable = false
    /// The changes made in memory that are not on disk yet, in order; replayed over the file as read at the next write.
    private var pending: [(inout HostSignals) -> Void] = []
    var dirty: Bool { !pending.isEmpty }
    /// Tests only: returns false to make the next writes fail.
    var writeHook: (() -> Bool)?
    /// The athlete's lock around a read-modify-write of the file (the host's `NativeStore.withLock`; re-entrant on the engine queue).
    var withLock: (() -> Void) throws -> Void = { $0() }

    init(file: URL) {
        self.file = file
        current = HostSignals()
        reload()
    }

    private func reload() {
        if let d = try? Data(contentsOf: file) {
            if let s = try? JSONDecoder().decode(HostSignals.self, from: d) { current = s; unreadable = false } else { current = .failClosed; unreadable = true }
        } else if FileManager.default.fileExists(atPath: file.path) {
            current = .failClosed; unreadable = true            // present but unreadable (e.g. protected data unavailable)
        } else { current = HostSignals(); unreadable = false }
    }

    private func persist() -> Bool {
        if writeHook?() == false { return false }
        // CCP-A-04: nothing is written for an erased athlete; a write racing an erasure in another process is taken back out (the erasure
        // writes its fence before it removes this file).
        if erased() { pending = []; return true }
        guard let d = try? JSONEncoder().encode(current) else { return false }
        do { try AtomicFile.write(d, to: file) } catch { return false }
        pending = []
        if erased() { try? FileManager.default.removeItem(at: file) }
        return true
    }
    /// Whether this athlete is behind an erasure fence (set by the host).
    var erased: () -> Bool = { false }

    /// Under the lock: the file as it is now, the pending changes, then `f`. Returns whether the result is on disk.
    private func applyLocked(_ f: ((inout HostSignals) -> Void)?) -> Bool {
        reload()
        if let f { pending.append(f) }
        if unreadable { return false }        // memory only (fail closed): never write over a file that cannot be read
        let disk = current
        var s = disk; for p in pending { p(&s) }
        current = s
        if s == disk { pending = []; return true }
        return persist()
    }

    /// Applies a change. Returns whether it is durable.
    @discardableResult
    func update(_ f: @escaping (inout HostSignals) -> Void) -> Bool {
        var ok = false
        do { try withLock { ok = self.applyLocked(f) } } catch {
            // The lock cannot be had (another process holds it past the wait; the folder is unavailable): memory only, fail closed.
            pending.append(f); if !unreadable { f(&current) }
            return false
        }
        return ok
    }

    /// Reads the file again under the lock and retries a write that failed earlier. Returns whether the signals on disk are the ones in memory.
    @discardableResult
    func flush() -> Bool {
        var ok = false
        do { try withLock { ok = self.applyLocked(nil) } } catch { return false }
        return ok
    }

    func erase() { current = HostSignals(); unreadable = false; pending = []; try? FileManager.default.removeItem(at: file) }
}
