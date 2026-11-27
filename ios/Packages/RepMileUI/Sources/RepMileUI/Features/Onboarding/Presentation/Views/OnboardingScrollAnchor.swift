import SwiftUI

/// `-onboardingScroll bottom` (Debug, captures of large text below the fold): the onboarding's scroll views open at their end.
enum OBDebugScroll {
    static let toBottom: Bool = {
        #if DEBUG
        let a = ProcessInfo.processInfo.arguments
        return a.firstIndex(of: "-onboardingScroll").map { a.indices.contains($0 + 1) && a[$0 + 1] == "bottom" } ?? false
        #else
        return false
        #endif
    }()
}

extension View {
    /// Top in the app; the end only for the Debug captures (`OBDebugScroll`).
    func obScrollAnchor() -> some View { defaultScrollAnchor(OBDebugScroll.toBottom ? .bottom : .top) }
}
