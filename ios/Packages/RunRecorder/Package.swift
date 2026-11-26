// swift-tools-version: 5.9
// RepMile V1 · front C · RunRecorder (no UI). The iPhone's own run recording: CoreLocation, the step timer of `runSession(for:)`, pause/resume,
// background location, a crash-safe temporary file and resume after process death. Measured distance, pace, splits and route stay on the
// device (never in an athlete report, never across the bridge; GAP-16). No HealthKit, no JavaScriptCore.
import PackageDescription

let package = Package(
    name: "RunRecorder",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [.library(name: "RunRecorder", targets: ["RunRecorder"])],
    dependencies: [
        .package(path: "../CoachingPresentation"),
        .package(path: "../IntegrationContracts"),
    ],
    targets: [
        .target(name: "RunRecorder", dependencies: ["CoachingPresentation", "IntegrationContracts"]),
        .testTarget(name: "RunRecorderTests", dependencies: ["RunRecorder"]),
    ]
)
