// swift-tools-version:5.9
// RepMile V1 front B (HealthKit): audits/v1-abc-foundation-consolidation-2026-11-26/B_HEALTHKIT_HANDOFF.md, contract rev. 2
// (audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md).
//
// Read-only Apple Health ingest: authorization, observer + anchored query, normalization with provenance, the unambiguous session link, the
// persistent idempotent queue, dedupe against the iPhone's own recordings, deletions and purge. It reaches the engine ONLY through the shared
// `DeviceActivitySink` port. It never prescribes, never classifies heart rate, never builds a second engine and never touches CoachingCore.
//
// Imports: Foundation, IntegrationContracts and (iOS only, `HealthKitReader.swift`) HealthKit and os. Never JavaScriptCore, CryptoKit,
// Security, SwiftUI, CoachingPresentation or front A's module (contract §2). Everything but the HealthKit reader is plain Foundation, so the
// queue, normalization, link, dedupe and series mapping are tested on macOS with `swift test`.
import PackageDescription

let package = Package(
    name: "HealthKitIngest",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "HealthKitIngest", targets: ["HealthKitIngest"])],
    dependencies: [.package(path: "../IntegrationContracts")],
    targets: [
        .target(name: "HealthKitIngest", dependencies: ["IntegrationContracts"]),
        .testTarget(name: "HealthKitIngestTests", dependencies: ["HealthKitIngest", "IntegrationContracts"],
                    exclude: ["NodeDouble"])
    ]
)
