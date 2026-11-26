// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "RepMileUI",
    platforms: [.iOS(.v17)],
    products: [.library(name: "RepMileUI", targets: ["RepMileUI"])],
    targets: [.target(name: "RepMileUI")]
)
