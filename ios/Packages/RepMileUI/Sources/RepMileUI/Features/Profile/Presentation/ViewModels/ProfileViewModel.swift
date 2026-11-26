import CoachingPresentation
import Foundation
import Observation

/// Perfil e ajustes: the three privacy writes (`setConsent`, `eraseHealthFacts`, `eraseAccount`) and the erase confirmation. Erasing the
/// account reaches every layer this front owns (the run recordings) and the record (G07); erasing health facts is never readiness. One write
/// at a time: a tap while a write is in flight does nothing. The view renders `consentDone` / `confirm` and forwards the athlete's taps.
@Observable @MainActor
final class ProfileViewModel {
    enum Confirm: String, Identifiable { case health, account; var id: String { rawValue } }
    enum Write: Equatable { case consent(ConsentPurpose), eraseHealth, eraseAccount }
    enum Activity: Equatable { case idle, writing(Write) }
    enum Outcome: Equatable { case done, failed(String) }

    /// The erase confirmation on screen, if any.
    var confirm: Confirm?
    private(set) var activity: Activity = .idle
    /// The purposes whose grant or revocation the engine recorded on this screen.
    private(set) var consentDone: Set<ConsentPurpose> = []

    private let writer: CoachingWriting
    private let reload: @MainActor () async -> Void
    private let eraseRecordings: @MainActor () -> Void
    private let accountErased: @MainActor () async -> Void

    /// `reload` is `AppModel.load`, `eraseRecordings` the recorder's own erasure, `accountErased` `AppModel.accountErased` (the root then shows
    /// the erased state, and RepMileShell erases the recordings again on that route).
    init(writer: CoachingWriting, reload: @escaping @MainActor () async -> Void, eraseRecordings: @escaping @MainActor () -> Void,
         accountErased: @escaping @MainActor () async -> Void) {
        self.writer = writer; self.reload = reload; self.eraseRecordings = eraseRecordings; self.accountErased = accountErased
    }

    var isWriting: Bool { activity != .idle }

    func setConsent(_ purpose: ConsentPurpose, granted: Bool) async {
        guard begin(.consent(purpose)) else { return }
        defer { activity = .idle }
        let out = await writer.setConsent(purpose, granted: granted)
        if Self.outcome(out.answer) == .done { consentDone.insert(purpose) }
    }

    /// The confirmation's destructive button. `which` is read when it is tapped: the dialog clears `confirm` as it closes, before this runs.
    func erase(_ which: Confirm?) async {
        switch which {
        case .account: await eraseAccount()
        case .health: await eraseHealth()
        case nil: return
        }
    }

    /// The health facts, then the record is read again.
    private func eraseHealth() async {
        guard begin(.eraseHealth) else { return }
        defer { activity = .idle }
        _ = await writer.eraseHealthFacts(eventIds: [])
        await reload()
    }

    /// G07: the record and this front's own layer (run recordings and their index), only once the engine said the erasure happened. B's
    /// queue is purged by A's composition root.
    private func eraseAccount() async {
        guard begin(.eraseAccount) else { return }
        defer { activity = .idle }
        let out = await writer.eraseAccount()
        guard Self.outcome(out.answer) == .done else { return }
        eraseRecordings()
        await accountErased()
    }

    private func begin(_ write: Write) -> Bool {
        guard activity == .idle else { return false }
        activity = .writing(write)
        return true
    }

    /// The engine's answer, read without guessing: only `ok` counts as done.
    static func outcome(_ answer: BoundaryAnswer) -> Outcome {
        answer.ok ? .done : .failed(answer.error?.code.raw ?? "UNKNOWN")
    }
}
