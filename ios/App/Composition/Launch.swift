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

/// The one way the process opens its live composition (#63 P2-1), whoever asks first: the app delegate at launch (also a background launch
/// by HealthKit, when no SwiftUI scene is connected) or the SwiftUI root. Both go through the same `SingleOpen`, so they get the same instance
/// and the composition is built once per process (exactly one `CoachingHost` per athlete per process, #49 P2-1).
///
/// A launch-time open that fails (typically before the first unlock: the athlete id and A's store are protected until then) is tried again on
/// every `protectedDataDidBecomeAvailable` until one succeeds. The observer is registered before the first attempt, so an unlock that lands
/// between a failure and the registration is never missed. The fixture composition never opens anything here (no HealthKit, no host).
@MainActor
final class LaunchOpener<Value: AnyObject> {
    private let once = SingleOpen<Value>()
    private let make: @MainActor () async throws -> Value
    private let center: NotificationCenter
    private let unlocked: Notification.Name
    private var waiting: NSObjectProtocol?
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
            Task { @MainActor [weak self] in await self?.attempt() }
        }
        Task { await attempt() }
    }

    /// True while a launch-time open has not succeeded yet (the unlock observer is registered).
    var isWaitingForUnlock: Bool { waiting != nil }

    private func attempt() async {
        guard waiting != nil else { return }
        do {
            _ = try await open()
            if let w = waiting { center.removeObserver(w); waiting = nil }
        } catch {
            // Kept waiting: the next unlock tries again. The root shows its own state (and its own "try again") meanwhile.
        }
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

    static func code(for error: Error) -> String {
        switch error {
        case AthleteIdentityStore.Failure.malformed: return identityDamaged
        case is PendingErasure.Failure: return erasurePending
        // Unreadable before the first unlock, a write that failed, or A could not open: trying again can work.
        default: return HostCode.hostUnavailable
        }
    }
}
