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

/// The signals file of one athlete. Every change is written atomically and its result checked: if it cannot be written, the stricter state
/// stays in memory (`dirty`) and `startability` answers `recordUnavailable` until a write succeeds (QRE-A-02). An unreadable file is never
/// overwritten with a guess (QRE-A-08): it stays `unreadable` (startability `recordUnavailable`) until it can be read again.
final class SignalStore {
    let file: URL
    private(set) var current: HostSignals
    private(set) var unreadable = false
    private(set) var dirty = false
    /// Tests only: returns false to make the next writes fail.
    var writeHook: (() -> Bool)?

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
        if writeHook?() == false { dirty = true; return false }
        // CCP-A-04: nothing is written for an erased athlete; a write racing an erasure in another process is taken back out (the erasure
        // writes its fence before it removes this file).
        if erased() { dirty = false; return true }
        guard let d = try? JSONEncoder().encode(current) else { dirty = true; return false }
        do { try AtomicFile.write(d, to: file); dirty = false } catch { dirty = true; return false }
        if erased() { try? FileManager.default.removeItem(at: file) }
        return true
    }
    /// Whether this athlete is behind an erasure fence (set by the host).
    var erased: () -> Bool = { false }

    /// Applies a change. Returns whether it is durable.
    @discardableResult
    func update(_ f: (inout HostSignals) -> Void) -> Bool {
        if unreadable { reload() }
        var s = current; f(&s)
        if unreadable { current = s; dirty = true; return false }     // memory only: never write over a file that cannot be read
        guard s != current || dirty else { return true }
        current = s
        return persist()
    }

    /// Retries a write that failed earlier. Returns whether the signals on disk are the ones in memory.
    @discardableResult
    func flush() -> Bool {
        if unreadable { reload(); if unreadable { return false } }
        return dirty ? persist() : true
    }

    func erase() { current = HostSignals(); unreadable = false; dirty = false; try? FileManager.default.removeItem(at: file) }
}
