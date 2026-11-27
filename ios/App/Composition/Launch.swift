import Foundation
import IntegrationContracts
import UIKit

/// Which composition this process runs (#63 P3-3). `-scenario <id>` (the fixture composition every XCUITest launches) exists only in a Debug
/// build: a Release build always runs the live composition, whatever its launch arguments say.
enum LaunchMode: Equatable {
    case live, fixture

    static func of(_ arguments: [String]) -> LaunchMode {
        #if DEBUG
        return arguments.contains("-scenario") ? .fixture : .live
        #else
        return .live
        #endif
    }

    static let current = of(ProcessInfo.processInfo.arguments)
}

/// Where the live composition keeps the athlete's device data: the identity, A's store and Keychain items, B's queue, C's recordings.
///
/// `standard` is the only case a Release build has: Application Support of the app's own container and A's production Keychain service.
/// Debug builds only (#83): `-isolatedLiveStores <token>` puts all of it in a folder of its own in the temporary directory, and A's items under
/// a Keychain service of their own (`LiveStores.isolatedKeychainService`), so a live UI test never meets what an earlier run left (an enrolled
/// athlete after a test that failed half way) and never reads or touches the standard identity, store or Keychain items. The same token is
/// the same install across relaunches. A new token is a new install whose Keychain is not new, as after a reinstall: A's first-launch
/// reconciliation (#49) runs and removes what the previous isolated install left. A token that is missing or not `[A-Za-z0-9-]{1,64}`
/// gets a new folder for that launch, never the standard places.
enum LiveStores: Equatable {
    case standard
    #if DEBUG
    case isolated(URL)

    static let argument = "-isolatedLiveStores"
    static let folderPrefix = "uitest-live-"
    #endif

    static let current = of(ProcessInfo.processInfo.arguments, temporary: FileManager.default.temporaryDirectory)

    static func of(_ arguments: [String], temporary: URL, newName: () -> String = { UUID().uuidString }) -> LiveStores {
        #if DEBUG
        guard let i = arguments.firstIndex(of: argument) else { return .standard }
        let token = arguments.indices.contains(i + 1) ? arguments[i + 1] : ""
        let valid = (1...64).contains(token.count) && token.unicodeScalars.allSatisfy { ($0.isASCII && CharacterSet.alphanumerics.contains($0)) || $0 == "-" }
        return .isolated(temporary.appendingPathComponent(folderPrefix + (valid ? token : newName()), isDirectory: true))
        #else
        return .standard
        #endif
    }

    /// Before anything is opened. Isolated, at the first launch of a token: the folders of earlier tokens are removed (the temporary directory
    /// stays bounded) and this one is created; a relaunch with the same token keeps everything. Standard: nothing.
    func prepare() throws {
        #if DEBUG
        guard case .isolated(let root) = self, !FileManager.default.fileExists(atPath: root.path) else { return }
        let parent = root.deletingLastPathComponent()
        for name in (try? FileManager.default.contentsOfDirectory(atPath: parent.path)) ?? [] where name.hasPrefix(Self.folderPrefix) {
            try? FileManager.default.removeItem(at: parent.appendingPathComponent(name, isDirectory: true))
        }
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        #endif
    }

    /// One store's folder in an isolated launch (`RepMileAccount`, `CoachingHost`, `HealthKitIngest`, `RunRecorder`); nil: its standard place.
    func isolatedFolder(_ store: String) -> URL? {
        #if DEBUG
        if case .isolated(let root) = self { return root.appendingPathComponent(store, isDirectory: true) }
        #endif
        return nil
    }

    func identity() throws -> AthleteIdentityStore {
        if let dir = isolatedFolder("RepMileAccount") { return AthleteIdentityStore(directory: dir) }
        return try AthleteIdentityStore.standard()
    }
}

/// The one way the process opens its live composition (#63 P2-1), whoever asks first: the app delegate at launch (also a background launch
/// by HealthKit, when no SwiftUI scene is connected) or the SwiftUI root. Both go through the same `SingleOpen`, so they get the same instance
/// and the composition is built once per process (exactly one `CoachingHost` per athlete per process, #49 P2-1).
///
/// A launch-time open that fails (typically before the first unlock: the athlete id and A's store are protected until then) is tried again on
/// every `protectedDataDidBecomeAvailable` until one succeeds. The observer is registered before the first attempt, so an unlock that lands
/// between a failure and the registration is never missed; an unlock that lands while an attempt is still running (it would only join that
/// attempt, which started locked) makes one more attempt once that one has failed. The fixture composition never opens anything here (no
/// HealthKit, no host).
@MainActor
final class LaunchOpener<Value: AnyObject> {
    private let once = SingleOpen<Value>()
    private let make: @MainActor () async throws -> Value
    private let center: NotificationCenter
    private let unlocked: Notification.Name
    private var waiting: NSObjectProtocol?
    private var attempting = false
    private var unlockedDuringAttempt = false
    private(set) var launched = false

    init(center: NotificationCenter = .default, unlocked: Notification.Name = UIApplication.protectedDataDidBecomeAvailableNotification,
         make: @escaping @MainActor () async throws -> Value) {
        self.center = center; self.unlocked = unlocked; self.make = make
    }

    /// The process's value: opened now, or the one already opened (or opening) by another caller.
    func open() async throws -> Value { try await once.value(make) }

    /// `application(_:didFinishLaunchingWithOptions:)`. Idempotent; a no-op for the fixture composition.
    func launch(_ mode: LaunchMode) {
        guard mode == .live, !launched else { return }
        launched = true
        waiting = center.addObserver(forName: unlocked, object: nil, queue: .main) { [weak self] _ in
            Task { @MainActor [weak self] in self?.didUnlock() }
        }
        Task { await attempt() }
    }

    /// True while a launch-time open has not succeeded yet (the unlock observer is registered).
    var isWaitingForUnlock: Bool { waiting != nil }

    private func didUnlock() {
        guard waiting != nil else { return }
        if attempting { unlockedDuringAttempt = true } else { Task { await attempt() } }
    }

    private func attempt() async {
        guard waiting != nil, !attempting else { return }
        attempting = true
        while true {
            unlockedDuringAttempt = false
            do {
                _ = try await open()
                if let w = waiting { center.removeObserver(w); waiting = nil }
                break
            } catch {
                // Kept waiting for the next unlock, unless one already came while this attempt ran. The root shows its own state meanwhile.
                if !unlockedDuringAttempt { break }
            }
        }
        attempting = false
    }
}

/// What the launch screen is told when the live composition could not open (#63 P3-2). Codes only: an error may carry a path or a message,
/// and logs and screens carry codes, never payloads.
enum LaunchFailure {
    /// The identity file is there but is not an identity this code wrote. Permanent: trying again cannot fix it, and the file is never replaced
    /// (a new id would be a second athlete on the install and orphan the first record).
    static let identityDamaged = "ACCOUNT_IDENTITY_DAMAGED"
    /// The device-side data of an erased account could not be removed yet (G07); the launch does not go on until it is.
    static let erasurePending = "DEVICE_ERASURE_PENDING"

    /// The launch screen's state for a failure code (#76): a damaged identity has its own state, with no "try again" (opening again reads the
    /// same file, which is never replaced); every other code is the operational error, where trying again can work.
    enum Shown: Equatable { case retryable(code: String), identityDamaged }

    static func shown(for code: String) -> Shown { code == identityDamaged ? .identityDamaged : .retryable(code: code) }

    static func code(for error: Error) -> String {
        switch error {
        case AthleteIdentityStore.Failure.malformed: return identityDamaged
        case is PendingErasure.Failure: return erasurePending
        // Unreadable before the first unlock, a write that failed, or A could not open: trying again can work.
        default: return HostCode.hostUnavailable
        }
    }
}
