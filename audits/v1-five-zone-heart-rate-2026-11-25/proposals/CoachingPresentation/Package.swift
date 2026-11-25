// swift-tools-version:5.9
// PROPOSAL CHG-UI-1 (V1 UI functional reconciliation, 2026-11-24). Not a shared contract until the integration mission incorporates it at
// ios/Packages/CoachingPresentation. Foundation only: no SwiftUI, JavaScriptCore, CryptoKit or HealthKit.
import PackageDescription

let package = Package(
    name: "CoachingPresentation",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "CoachingPresentation", targets: ["CoachingPresentation"])],
    targets: [
        .target(name: "CoachingPresentation"),
        .testTarget(name: "CoachingPresentationTests", dependencies: ["CoachingPresentation"]),
    ]
)
