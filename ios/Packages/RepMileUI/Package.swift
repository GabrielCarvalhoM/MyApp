// swift-tools-version: 5.9
// RepMile V1 · front C (SwiftUI). The app's screens, design system and the parallel-phase fixture providers. Consumes the shared contracts
// (CoachingPresentation, IntegrationContracts) read-only; never imports HealthKit, JavaScriptCore, CryptoKit, Security or CoreLocation
// (CoreLocation lives only in RunRecorder).
import PackageDescription

let package = Package(
    name: "RepMileUI",
    defaultLocalization: "pt-BR",
    platforms: [.iOS(.v17)],
    products: [.library(name: "RepMileUI", targets: ["RepMileUI"])],
    dependencies: [
        .package(path: "../CoachingPresentation"),
        .package(path: "../IntegrationContracts"),
    ],
    targets: [
        .target(
            name: "RepMileUI",
            dependencies: ["CoachingPresentation", "IntegrationContracts"],
            resources: [.process("Resources")]
        ),
        .testTarget(name: "RepMileUIUnitTests", dependencies: ["RepMileUI"]),
    ]
)
