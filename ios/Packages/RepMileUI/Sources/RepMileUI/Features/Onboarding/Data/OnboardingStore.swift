import Foundation

/// What stays on this iPhone from the onboarding (spec §5): the unsent draft and the step it stopped at (`838:4219` "Suas respostas ficam
/// neste iPhone", `838:3918` "Retomar o cadastro"), and after an accepted intake only the answers the engine does not read (name, height and
/// weight, where the athlete runs, what they use, the time goal and the result conditions held by an open contract decision). Never sent to the engine, front B, a log,
/// analytics or the network; erased with the account.
struct OnboardingSaved: Codable, Equatable, Sendable {
    /// The unsent answers; nil once the engine accepted them (the record holds them from then on).
    var draft: OnboardingDraft?
    var step: OnboardingStep?
    var profile: OnboardingProfile?
    /// The engine answered CLINICAL_HUMAN_REQUIRED to this draft: it resumes on "Retido por segurança" and is never sent again (SSCTR C4).
    var heldForSafety: Bool? = nil
}

/// The local-only profile kept after the plan is built. Nothing here has a sporting use.
struct OnboardingProfile: Codable, Equatable, Sendable {
    var name: String
    var heightCm: Int?
    var weightKg: Int?
    var runPlaces: [RunPlace]
    var runDevice: RunDevice?
    /// Held until their contract decision (D07, D20): kept as answered, used by nothing.
    var goalMinutes: Int?
    var goalSeconds: Int?
    var resultConditions: ResultConditions?

    init(_ d: OnboardingDraft) {
        name = d.name.trimmingCharacters(in: .whitespacesAndNewlines); heightCm = d.heightCm; weightKg = d.weightKg
        runPlaces = RunPlace.allCases.filter(d.runPlaces.contains); runDevice = d.runDevice
        goalMinutes = d.goalMinutes; goalSeconds = d.goalSeconds; resultConditions = d.resultConditions
    }
}

protocol OnboardingStoring: AnyObject, Sendable {
    func load() -> OnboardingSaved?
    func save(_ saved: OnboardingSaved)
    /// With the account (`accountErased`, GONE) and on "Recomeçar".
    func erase()
}

/// One JSON file in its own folder, written atomically with complete-unless-open protection and excluded from backups. Small: read and
/// written synchronously at step boundaries only. Erasure is durable (QRE P2-3): a pending marker is set first and cleared only once the
/// folder is gone; while it is set nothing is loaded and nothing is saved, so a later account never inherits an earlier profile.
final class FileOnboardingStore: OnboardingStoring, @unchecked Sendable {
    // @unchecked: the stored values are immutable and every file access goes through `lock`.
    let directory: URL
    private let url: URL
    private let lock = NSLock()
    private let defaults: UserDefaults
    private let remove: @Sendable (URL) throws -> Void
    private var pendingKey: String { "repmile.onboarding.erasurePending." + directory.path }

    init(directory: URL, defaults: UserDefaults = .standard, remove: @escaping @Sendable (URL) throws -> Void = { try FileManager.default.removeItem(at: $0) }) {
        self.directory = directory; url = directory.appendingPathComponent("onboarding.json"); self.defaults = defaults; self.remove = remove
    }

    /// The live composition's place: Application Support, excluded from backups like the other athlete data of the app.
    static var standardDirectory: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first ?? FileManager.default.temporaryDirectory
        return base.appendingPathComponent("RepMile/Onboarding", isDirectory: true)
    }

    var erasurePending: Bool { defaults.bool(forKey: pendingKey) }

    func load() -> OnboardingSaved? {
        lock.lock(); defer { lock.unlock() }
        guard settlePendingErasure(), let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(OnboardingSaved.self, from: data)
    }

    func save(_ saved: OnboardingSaved) {
        lock.lock(); defer { lock.unlock() }
        guard settlePendingErasure() else { return }
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        var values = URLResourceValues(); values.isExcludedFromBackup = true
        var d = directory; try? d.setResourceValues(values)
        guard let data = try? JSONEncoder().encode(saved) else { return }
        try? data.write(to: url, options: [.atomic, .completeFileProtectionUnlessOpen])
    }

    func erase() {
        lock.lock(); defer { lock.unlock() }
        defaults.set(true, forKey: pendingKey)
        _ = settlePendingErasure()
    }

    /// Removes the folder when an erasure is pending; true when nothing of an erased account is left.
    private func settlePendingErasure() -> Bool {
        guard defaults.bool(forKey: pendingKey) else { return true }
        if FileManager.default.fileExists(atPath: directory.path) {
            do { try remove(directory) } catch { return false }
        }
        defaults.removeObject(forKey: pendingKey)
        return true
    }
}

/// Tests and previews.
final class MemoryOnboardingStore: OnboardingStoring, @unchecked Sendable {
    // @unchecked: `saved` is only touched under `lock`.
    private let lock = NSLock()
    private var saved: OnboardingSaved?
    init(_ saved: OnboardingSaved? = nil) { self.saved = saved }
    func load() -> OnboardingSaved? { lock.lock(); defer { lock.unlock() }; return saved }
    func save(_ s: OnboardingSaved) { lock.lock(); defer { lock.unlock() }; saved = s }
    func erase() { lock.lock(); defer { lock.unlock() }; saved = nil }
}
