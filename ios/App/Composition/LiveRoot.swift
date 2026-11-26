import IntegrationContracts
import RepMileUI
import SwiftUI

/// The app root without `-scenario`: the loading state while the live composition opens (`CoachingHost.open`), the shell once it is open, and
/// the operational-error state, with "try again", when it could not open. Never a crash, never a fixture.
struct LiveRoot: View {
    private enum Phase { case opening, ready(LiveComposition), failed(code: String) }
    @State private var phase: Phase = .opening

    var body: some View {
        switch phase {
        case .opening:
            RepMileLaunchScreen(phase: .opening, retry: {}).task { await open() }
        case .ready(let c):
            RepMileShell(model: c.model, recorder: c.recorder, live: RepMileShell.Live(athleteId: c.athleteId, accountErased: { c.accountErased() }))
        case .failed(let code):
            RepMileLaunchScreen(phase: .failed(code: code), retry: { phase = .opening })
        }
    }

    private func open() async {
        do { phase = .ready(try await LiveComposition.open()) }
        // The code only: the error itself may carry a path or a message (logs and screens carry codes, never payloads).
        catch { phase = .failed(code: HostCode.hostUnavailable) }
    }
}
