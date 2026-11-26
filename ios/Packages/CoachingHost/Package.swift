// swift-tools-version:5.9
// RepMile V1 front A (CoachingHost): the frozen CoachingCore (REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2) in JavaScriptCore on one serial
// queue, with the sealed native store, the Keychain key and anchor, the cross-process lock, the trusted clock (D1), and the implementations of
// the shared ports CoachingReading / CoachingWriting / TimeInZoneClassifying (CoachingPresentation) and DeviceActivitySink
// (IntegrationContracts). It transports, executes, persists and presents. It never decides training and has no screen.
// Imports (contract §2): Foundation, JavaScriptCore, CryptoKit, Security, os, IntegrationContracts, CoachingPresentation. Never HealthKit,
// SwiftUI or front B's module. iOS 16 is the floor of the unmodified bundle (Array.prototype.toSorted; D3 decides the minimum).
import PackageDescription

let package = Package(
    name: "CoachingHost",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "CoachingHost", targets: ["CoachingHost"])],
    dependencies: [.package(path: "../IntegrationContracts"), .package(path: "../CoachingPresentation")],
    targets: [
        // The four resources are copied one by one, not the folder (an iOS shallow bundle with a top-level "Resources" folder is rejected by
        // codesign: HR5R/P0 Package.swift).
        .target(name: "CoachingHost", dependencies: ["IntegrationContracts", "CoachingPresentation"],
                resources: [.copy("Resources/coachinghost.js"), .copy("Resources/assets"),
                            .copy("Resources/assets-manifest.json"), .copy("Resources/build-manifest.json")]),
        // A second process for the cross-process tests (N-5 lock, HR5 two writers, persistence between processes). macOS only; never shipped.
        .executableTarget(name: "coachinghost-proc", dependencies: ["CoachingHost"], path: "Tools/coachinghost-proc"),
        .testTarget(name: "CoachingHostTests", dependencies: ["CoachingHost", "coachinghost-proc"], resources: [.copy("Fixtures")]),
    ]
)
