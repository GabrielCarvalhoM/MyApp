import XCTest
@testable import RepMileUI

/// The zone bar geometry moved out of the view builder (CI type-check timeout on Swift 6.3); same arithmetic as before.
final class ZoneBarTests: XCTestCase {
    func testBarFractionsOnTheNinetyToMaximumAxis() {
        let z2 = ZoneRow.barFractions(minBpm: 130, maxBpm: 150, maximum: 190)
        XCTAssertEqual(z2.start, 0.4, accuracy: 1e-9)
        XCTAssertEqual(z2.width, 0.2, accuracy: 1e-9)
        let openLow = ZoneRow.barFractions(minBpm: nil, maxBpm: 130, maximum: 190)
        XCTAssertEqual(openLow.start, 0, accuracy: 1e-9)
        XCTAssertEqual(openLow.width, 0.4, accuracy: 1e-9)
        let openHigh = ZoneRow.barFractions(minBpm: 180, maxBpm: nil, maximum: 190)
        XCTAssertEqual(openHigh.start, 0.9, accuracy: 1e-9)
        XCTAssertEqual(openHigh.width, 0.1, accuracy: 1e-9)
        let clamped = ZoneRow.barFractions(minBpm: 60, maxBpm: 230, maximum: 190)
        XCTAssertEqual(clamped.start, 0, accuracy: 1e-9)
        XCTAssertEqual(clamped.width, 1, accuracy: 1e-9)
    }
}
