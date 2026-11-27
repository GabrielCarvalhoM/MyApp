import RepMileUI
import SwiftUI
import UIKit

/// The app root without `-scenario`: the loading state while the live composition opens (`CoachingHost.open`), the shell once it is open, and
/// the operational-error state, with "try again", when it could not open. Never a crash, never a fixture.
///
/// The composition is the one the app delegate opened at launch (#63 P2-1): `LiveComposition.open()` returns that same instance. When the
/// open failed before the first unlock, the next unlock opens again by itself.
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
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.protectedDataDidBecomeAvailableNotification)) { _ in phase = .opening }
        }
    }

    private func open() async {
        do { phase = .ready(try await LiveComposition.open()) }
        // A code only (#63 P3-2: a damaged identity has its own, `LaunchFailure`).
        catch { phase = .failed(code: LaunchFailure.code(for: error)) }
    }
}
