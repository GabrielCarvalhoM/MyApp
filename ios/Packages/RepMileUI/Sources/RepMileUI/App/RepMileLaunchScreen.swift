import SwiftUI

/// What the live composition root shows before `RepMileShell` exists: the loading skeleton while the host opens, and the operational-error
/// state (with "try again") when it could not open. The same screens the shell shows for `.loading` and `.operationalError`; no new copy.
public struct RepMileLaunchScreen: View {
    public enum Phase: Equatable { case opening, failed(code: String) }

    let phase: Phase
    let retry: () -> Void

    public init(phase: Phase, retry: @escaping () -> Void) { RMFonts.register(); self.phase = phase; self.retry = retry }

    public var body: some View {
        Group {
            switch phase {
            case .opening: LoadingSkeleton()
            case .failed(let code): StateScreen(route: .operationalError(code: code), primary: {}, retry: retry)
            }
        }
        .preferredColorScheme(.dark)
    }
}
