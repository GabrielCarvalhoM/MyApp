// swift-tools-version:5.9
// P0 target: the CoachingCore bundle in JavaScriptCore with the minimal host (bundled assets, existence, native SHA-256, a clock).
// No product screen, no HealthKit, no network, no athlete data. iOS 16 is the floor of the unmodified bundle (Array.prototype.toSorted).
// macOS is listed only so the package can be compiled and smoke-run on the Mac; macOS numbers are not device numbers (JIT is on there).
import PackageDescription

let package = Package(
    name: "P0Host",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "P0Host", targets: ["P0Host"])],
    targets: [
        .target(name: "P0Host", resources: [.copy("Resources")]),
        .testTarget(name: "P0HostTests", dependencies: ["P0Host"], resources: [.copy("Fixtures")])
    ]
)
