// swift-tools-version:5.9
// RepMile V1 shared coaching contract (CHG-UI-1 + CHG-UI-1b + CHG-UI-2, incorporated by the ABC foundation consolidation, 2026-11-26).
// Front A (CoachingHost) produces it: implements CoachingReading / CoachingWriting and links Facade/app-projections.mjs verbatim. Front C
// (SwiftUI) consumes it: decodes the views, fills the closed request types, codes against Tests/.../Fixtures. Foundation only: no SwiftUI,
// JavaScriptCore, CryptoKit, Security or HealthKit (plus the Foundation-only IntegrationContracts). Owned by the integration mission (PARALLEL_IMPLEMENTATION_CONTRACT §10/§11): read-only for
// every front; a change is a coordinated proposal.
import PackageDescription

let package = Package(
    name: "CoachingPresentation",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "CoachingPresentation", targets: ["CoachingPresentation"])],
    // One-way: the heart-rate series type (B's) is the input of A's time-in-zone port. IntegrationContracts never imports this package.
    dependencies: [.package(path: "../IntegrationContracts")],
    targets: [
        .target(name: "CoachingPresentation", dependencies: ["IntegrationContracts"]),
        .testTarget(name: "CoachingPresentationTests", dependencies: ["CoachingPresentation"], exclude: ["Fixtures"]),
    ]
)
