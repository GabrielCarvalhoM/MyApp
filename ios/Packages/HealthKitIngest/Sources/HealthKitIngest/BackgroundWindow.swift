import Foundation

/// QRE-B-R2-03: after a background wake, HealthKit's observer completion handler is called once the read is durably queued (QRE-B-08), and
/// iOS may suspend the app right after it. The delivery to A that the notification started would then wait for the next run. B asks the
/// system for a window of background execution BEFORE that handler is called, and holds it until the delivery loop has ended.
///
/// A window only asks: the system may refuse it or end it early (`expired`). Nothing depends on it for correctness: an interrupted delivery
/// stays durable in flight and is re-sent with the same id at the next trigger (contract §7).
public protocol BackgroundWindow: Sendable {
    /// Asks for the window and returns once the system granted or refused it (bounded), so that the caller lets the process be suspended
    /// only after the request is in place.
    func begin(_ reason: String) async -> BackgroundWindowToken
}

public enum BackgroundWindowGrant: String, Sendable {
    case granted = "GRANTED"
    /// The system had no background time to give (it answered "expired" at once).
    case refused = "REFUSED"
    /// The system did not answer within `ProcessBackgroundWindow.confirmationWait`; B went on without waiting longer.
    case unconfirmed = "UNCONFIRMED"
}

public protocol BackgroundWindowToken: AnyObject, Sendable {
    var grant: BackgroundWindowGrant { get }
    /// The system ended the window before `end()`.
    var expired: Bool { get }
    /// Releases the window. Idempotent.
    func end()
}

/// Production window: `ProcessInfo.performExpiringActivity`, Foundation's form of a background task (B imports no UI framework). Its block
/// holds the system's assertion until it returns, so it waits for `end()`, or returns at once when the system says time is up.
public struct ProcessBackgroundWindow: BackgroundWindow {
    /// The system call: `performExpiringActivity(withReason:using:)`. macOS has none (no app suspension there): the block is called at once
    /// with `expired == false` on a background queue, so the window logic runs the same in `swift test`. Tests inject a scripted system.
    typealias Perform = @Sendable (String, @escaping @Sendable (Bool) -> Void) -> Void
    /// The longest `begin` waits for the system's first answer: an observer's completion handler is never held longer for it.
    public var confirmationWait: TimeInterval = 1
    let perform: Perform

    public init() { self.init(perform: Self.system) }
    init(perform: @escaping Perform) { self.perform = perform }

    static let system: Perform = { reason, block in
        #if os(macOS)
        DispatchQueue.global().async { block(false) }
        #else
        ProcessInfo.processInfo.performExpiringActivity(withReason: reason, using: block)
        #endif
    }

    public func begin(_ reason: String) async -> BackgroundWindowToken {
        let activity = ExpiringActivity()
        let wait = confirmationWait
        await withCheckedContinuation { (c: CheckedContinuation<Void, Never>) in
            activity.whenAnswered { c.resume() }
            DispatchQueue.global().asyncAfter(deadline: .now() + wait) { activity.answer(.unconfirmed) }
            perform(reason) { expired in activity.run(expired: expired) }
        }
        return activity
    }
}

/// One `performExpiringActivity`: the block's first call answers `begin`; a call with `expired == false` waits until `end()` or expiry.
final class ExpiringActivity: BackgroundWindowToken, @unchecked Sendable {
    private let lock = NSLock()
    private let released = DispatchSemaphore(value: 0)
    private var onAnswer: (() -> Void)?
    private var answered = false
    private var _grant = BackgroundWindowGrant.unconfirmed
    private var _expired = false
    private var _holding = false

    var grant: BackgroundWindowGrant { lock.withLock { _grant } }
    var expired: Bool { lock.withLock { _expired } }
    /// Tests: the block is still holding the system's assertion.
    var isHolding: Bool { lock.withLock { _holding } }

    func whenAnswered(_ f: @escaping () -> Void) { lock.withLock { onAnswer = f } }

    func answer(_ g: BackgroundWindowGrant) {
        let f: (() -> Void)? = lock.withLock {
            // A late system answer still says what happened, but `begin` is resumed only once.
            if _grant == .unconfirmed { _grant = g }
            guard !answered else { return nil }
            answered = true; let f = onAnswer; onAnswer = nil; return f
        }
        f?()
    }

    func run(expired: Bool) {
        if expired {
            lock.withLock { _expired = true }
            answer(.refused)
            released.signal()                 // the holding call (if any) returns now: the system is about to suspend
            return
        }
        lock.withLock { _holding = true }
        answer(.granted)
        released.wait()
        lock.withLock { _holding = false }
    }

    func end() { released.signal() }
}
