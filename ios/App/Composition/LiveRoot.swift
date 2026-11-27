import RepMileUI
import os
import SwiftUI
import UIKit

/// The app root without `-scenario`: the loading state while the live composition opens (`CoachingHost.open`), the shell once it is open, and
/// the operational-error state, with "try again", when it could not open; a damaged identity has its own state with no "try again" and no
/// re-open on unlock (#76: opening again reads the same file, which is never replaced). Never a crash, never a fixture.
///
/// The composition is the one the app delegate opened at launch (#63 P2-1): `LiveComposition.open()` returns that same instance. When the
/// open failed before the first unlock, the next unlock opens again by itself.
struct LiveRoot: View {
    private enum Phase { case opening, ready(LiveComposition), failed(code: String) }
    @State private var phase: Phase = .opening
    private static let log = Logger(subsystem: "fit.vilumo.repmile", category: "composition")

    var body: some View {
        switch phase {
        case .opening:
            RepMileLaunchScreen(phase: .opening, retry: {}).task { await open() }
        case .ready(let c):
            RepMileShell(model: c.model, recorder: c.recorder, live: RepMileShell.Live(athleteId: c.athleteId, accountErased: { c.accountErased() }))
            #if DEBUG
                .overlay(alignment: .bottomLeading) { ReconciliationProbe(text: c.reconciliationProbe) }
            #endif
        case .failed(let code):
            switch LaunchFailure.shown(for: code) {
            case .identityDamaged:
                RepMileLaunchScreen(phase: .identityDamaged)
            case .retryable(let code):
                RepMileLaunchScreen(phase: .failed(code: code), retry: { phase = .opening })
                    .onReceive(NotificationCenter.default.publisher(for: UIApplication.protectedDataDidBecomeAvailableNotification)) { _ in phase = .opening }
            }
        }
    }

    private func open() async {
        do { phase = .ready(try await LiveComposition.open()) }
        // A code only (#63 P3-2: a damaged identity has its own, `LaunchFailure`).
        catch {
            let code = LaunchFailure.code(for: error)
            Self.log.error("live composition did not open: \(code, privacy: .public)")
            phase = .failed(code: code)
        }
    }
}

#if DEBUG
/// Debug, isolated live launches only (#83 review P2-1): A's first-launch reconciliation for a UI test (`debug-host-reconciliation`), in
/// a 1-point text nobody sees or touches. Nothing for a standard launch; not compiled in Release.
private struct ReconciliationProbe: View {
    let text: String?
    var body: some View {
        if let text {
            Text(verbatim: text).font(.system(size: 1)).opacity(0.02).allowsHitTesting(false).accessibilityIdentifier("debug-host-reconciliation")
        }
    }
}
#endif
