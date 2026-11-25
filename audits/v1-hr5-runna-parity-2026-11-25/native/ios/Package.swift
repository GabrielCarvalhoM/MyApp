// swift-tools-version:5.9
// P0 target: the CoachingCore bundle in JavaScriptCore with the minimal host (bundled assets, existence, native SHA-256, a clock).
// No product screen, no HealthKit, no network, no athlete data. iOS 16 is the floor of the unmodified bundle (Array.prototype.toSorted).
// macOS is listed only so the package can be compiled and smoke-run on the Mac; macOS numbers are not device numbers. (Under `swift test` the
// JSContext runs interpreter-only too, like the device: measured 2026-11-18, FocalTests.testExecutionTierProbe vs jsc --useJIT=false.)
import PackageDescription

let package = Package(
    name: "P0Host",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "P0Host", targets: ["P0Host"])],
    targets: [
        // The four items are copied one by one, not the folder: an iOS (shallow) resource bundle with a top-level "Resources" folder is
        // rejected by codesign ("bundle format unrecognized"), first seen on the Mac build of 2026-11-18. Same files, same bytes.
        .target(name: "P0Host", resources: [.copy("Resources/coachingcore-p0.js"), .copy("Resources/assets"),
                                            .copy("Resources/assets-manifest.json"), .copy("Resources/build-manifest.json")]),
        .testTarget(name: "P0HostTests", dependencies: ["P0Host"], resources: [.copy("Fixtures")])
    ]
)
