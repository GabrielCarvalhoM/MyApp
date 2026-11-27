import SwiftUI

/// What the live composition root shows before `RepMileShell` exists: the loading skeleton while the host opens, the operational-error
/// state (with "try again") when it could not open, and the damaged-identity state (#76), which has no "try again": the identity file on the
/// device is not one this code wrote, opening again reads the same file, and the file is never replaced (a new id would be a second athlete
/// on the install and orphan the first record).
public struct RepMileLaunchScreen: View {
    public enum Phase: Equatable { case opening, failed(code: String), identityDamaged }

    let phase: Phase
    let retry: () -> Void

    /// `retry` is offered only for `.failed`; `.identityDamaged` never offers it.
    public init(phase: Phase, retry: @escaping () -> Void = {}) { RMFonts.register(); self.phase = phase; self.retry = retry }

    /// The state screen a phase shows (nil: the loading skeleton). Pure, unit-tested.
    static func stateKind(_ phase: Phase) -> StateKind? {
        switch phase {
        case .opening: nil
        case .failed(let code): .route(.operationalError(code: code))
        case .identityDamaged: .identityDamaged
        }
    }

    public var body: some View {
        Group {
            if let kind = Self.stateKind(phase) { StateScreen(kind: kind, primary: {}, retry: retry) } else { LoadingSkeleton() }
        }
        .preferredColorScheme(.dark)
    }
}
