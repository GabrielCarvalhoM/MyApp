import Foundation

/// Plan B adapter: in the package, SwiftPM generates `Bundle.module` for the test target; in this Xcode test target the same tests find their
/// `Fixtures/` folder (a folder reference, copied as is) in the .xctest bundle that contains this class. Nothing else differs.
private final class PlanBBundleMarker {}
extension Bundle {
    static let module = Bundle(for: PlanBBundleMarker.self)
}
