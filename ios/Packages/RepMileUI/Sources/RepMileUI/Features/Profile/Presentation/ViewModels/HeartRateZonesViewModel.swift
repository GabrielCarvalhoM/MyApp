import CoachingPresentation
import Foundation
import Observation

/// Informar a máxima / personalizar limites (Figma 71): the editor's fields and its two writes, `setHeartRateProfile` and
/// `eraseHeartRateProfile` (never held back by consent). Validation is the engine's: the fields only need whole numbers, and a refusal's
/// `fields` become the message shown. One write at a time. Made per editor presentation, so every opening starts from the profile in force.
/// After an `ok` answer the record is read again (`reload`, CODE_AND_ARCHITECTURE §2): the zones screen shows the reference and zones the
/// engine now holds, never the pre-write ones. A failure reads nothing again.
@Observable @MainActor
final class HeartRateZonesViewModel {
    enum Editor: String, Identifiable { case maximum, limits; var id: String { rawValue } }
    enum Activity: Equatable { case idle, saving, erasing }
    /// The last answer, as copy: `key` in the copy table, `ok` its tone.
    enum Message: Equatable {
        case saved, erased, consentRequired
        /// INVALID_REQUEST: the first of the engine's `fields` the copy table has (`hr.error.<field>`).
        case refused(field: String)
        case failed

        var key: String {
            switch self {
            case .saved: "hr.saved"
            case .erased: "hr.erased"
            case .consentRequired: "hr.error.consent"
            case .refused(let field): "hr.error." + field
            case .failed: "state.opError.body"
            }
        }
        var ok: Bool { self == .saved || self == .erased }
    }

    let mode: Editor
    var maximum = ""
    var limits = ["", "", "", ""]
    private(set) var activity: Activity = .idle
    private(set) var message: Message?

    private let writer: CoachingWriting
    private let reload: @MainActor () async -> Void
    private let hasCopy: (String) -> Bool

    /// The fields start from the athlete's profile in force (`current`); `reload` is `AppModel.load`; `hasCopy` says whether
    /// `hr.error.<field>` has copy.
    init(writer: CoachingWriting, mode: Editor, current: HeartRateFiveZones?, reload: @escaping @MainActor () async -> Void,
         hasCopy: @escaping (String) -> Bool = { L.code("hr.error", Code(raw: $0)) != nil }) {
        self.writer = writer; self.mode = mode; self.reload = reload; self.hasCopy = hasCopy
        if let m = current?.profile?.declaredMaximumBpm { maximum = "\(m)" }
        if let z = current?.profile?.customZoneUpperBpm, z.count == 4 { limits = z.map(String.init) }
    }

    var request: HeartRateProfileRequest? { Self.request(mode: mode, maximum: maximum, limits: limits) }
    var canSave: Bool { request != nil && activity == .idle }

    func save() async {
        guard activity == .idle, let r = request else { return }
        activity = .saving
        await finish(Self.saveMessage(await writer.setHeartRateProfile(r), hasCopy: hasCopy))
    }

    func erase() async {
        guard activity == .idle else { return }
        activity = .erasing
        await finish(Self.eraseMessage(await writer.eraseHeartRateProfile()))
    }

    /// The answer as copy, then, only when it is `ok`, the record read again. The gate opens before the read: the reload is not a write.
    private func finish(_ m: Message) async {
        message = m
        activity = .idle
        if m.ok { await reload() }
    }

    /// Whole numbers only; the range and order are the engine's to judge (its `fields` come back on refusal).
    static func request(mode: Editor, maximum: String, limits: [String]) -> HeartRateProfileRequest? {
        if mode == .maximum { return Int(maximum).map { HeartRateProfileRequest(maxHeartRateBpm: .some($0)) } }
        let v = limits.compactMap(Int.init)
        return v.count == 4 ? HeartRateProfileRequest(zoneUpperBpm: .some(v)) : nil
    }

    /// Saved only on an answer that says `ok` (the port does not promise a `.success` is one). CONSENT_REQUIRED asks for the consent; any
    /// other refusal names the first field the copy table has, else the operational error.
    static func saveMessage(_ result: Result<HeartRateProfileAnswer, BoundaryError>, hasCopy: (String) -> Bool) -> Message {
        switch result {
        case .success(let a) where a.ok: return .saved
        case .success: return .failed
        case .failure(let e):
            if e.code.raw == "CONSENT_REQUIRED" { return .consentRequired }
            return (e.fields ?? []).first(where: hasCopy).map { .refused(field: $0) } ?? .failed
        }
    }

    static func eraseMessage(_ result: Result<HeartRateProfileAnswer, BoundaryError>) -> Message {
        // Erased only on an answer that says ok (the protocol does not promise `.success` implies `ok`), as the save.
        if case .success(let a) = result, a.ok { return .erased }
        return .failed
    }

    /// Erasing is offered only when the athlete has something of their own in force (a declared maximum or custom limits).
    static func offersErase(_ current: HeartRateFiveZones?) -> Bool {
        current?.profile?.declaredMaximumBpm != nil || current?.profile?.customZoneUpperBpm != nil
            || current?.boundarySource?.raw == "ATHLETE_CUSTOM" || current?.reference?.kind.raw == "ATHLETE_DECLARED_MAXIMUM"
    }
}
