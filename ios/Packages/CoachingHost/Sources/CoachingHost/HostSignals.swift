import Foundation

/// The persistent native safety signals of one athlete (beside the store, same protection, atomic writes). Each one stops every session from
/// being startable for a reason the engine's view cannot see, and only the event named below releases it. Fail closed: an unreadable signals
/// file reads as "every signal set" (nothing startable) until it is written again.
struct HostSignals: Codable, Equatable {
    /// SEC-FPV-01 / N-3: set after any successful `eraseHealthFacts`; released only when a request carrying `eligibility` is recorded.
    var screenRequiredAfterErasure = false
    /// FND-ABC-04 / 04b: the latest intake (a restart) was refused by scope or routed to a human while the earlier plan stays executable in the
    /// record. Released only by an intake the engine accepts (`planCreated`) or by the account erasure.
    var scope: Scope? = nil
    /// A18a (ii) and handoff 5.4: the last answer (or the open question) asks for the warning signs (`warningSignScreen` REQUIRED, or
    /// `missingInputs` naming warning signs). Covers the abandoned unplanned-run route: the athlete said "yes" (C's write), the engine asked
    /// the signs, and the athlete left. Released by an answer that no longer asks for them.
    var warningSignsAsked = false

    enum Scope: String, Codable, Equatable { case outsideV1Scope = "OUTSIDE_V1_SCOPE", clinicalHumanRequired = "CLINICAL_HUMAN_REQUIRED" }

    static let failClosed = HostSignals(screenRequiredAfterErasure: true, scope: .outsideV1Scope, warningSignsAsked: true)
}

final class SignalStore {
    let file: URL
    private(set) var current: HostSignals
    private(set) var unreadable = false

    init(file: URL) {
        self.file = file
        if let d = try? Data(contentsOf: file) {
            if let s = try? JSONDecoder().decode(HostSignals.self, from: d) { current = s } else { current = .failClosed; unreadable = true }
        } else if FileManager.default.fileExists(atPath: file.path) {
            current = .failClosed; unreadable = true            // present but unreadable (e.g. protected data unavailable)
        } else { current = HostSignals() }
    }

    /// Writes the new signals; returns false if they could not be persisted (the caller then keeps the stricter state in memory).
    @discardableResult
    func update(_ f: (inout HostSignals) -> Void) -> Bool {
        var s = current; f(&s)
        guard s != current || unreadable else { return true }
        current = s
        guard let d = try? JSONEncoder().encode(s) else { return false }
        do { try AtomicFile.write(d, to: file); unreadable = false; return true } catch { return false }
    }

    func erase() { current = HostSignals(); unreadable = false; try? FileManager.default.removeItem(at: file) }
}
