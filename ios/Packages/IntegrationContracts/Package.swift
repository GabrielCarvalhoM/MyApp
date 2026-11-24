// swift-tools-version:5.9
// RepMile V1 shared integration contracts (audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md).
// The only code both implementation fronts consume: CoachingHost (front A) implements the protocols, the HealthKit adapter (front B) calls them.
// Pure Swift values and protocols: no SwiftUI, no JavaScriptCore, no HealthKit, no Security/CryptoKit, no dependency. Frozen while A and B run;
// a change is a proposal to the integration mission (contract §11), never an edit by one front.
import PackageDescription

let package = Package(
    name: "IntegrationContracts",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "IntegrationContracts", targets: ["IntegrationContracts"])],
    targets: [
        .target(name: "IntegrationContracts"),
        .testTarget(name: "IntegrationContractsTests", dependencies: ["IntegrationContracts"])
    ]
)
