import XCTest
@testable import CoachingPresentation

/// V1HR5 contract delta. Decodes what the AMENDED boundary returned (probes/out, captured by probes/capture-hr5.mjs and by the reconciliation's
/// capture scripts rerun over the amended engine) and what the FROZEN boundary returned before the amendment (the reconciliation's own
/// probes/out, read in place): the five zones are transported whole, no safety field is lost, and a record from before the amendment decodes
/// with the five zones absent (nil = not computed by that version), never as "no zones".
final class FiveZoneDecodingTests: XCTestCase {
    static let here = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
    static let amended = here.appendingPathComponent("../../../../probes/out").standardized
    static let frozen = here.appendingPathComponent("../../../../../v1-ui-functional-reconciliation/probes/out").standardized
    /// The `readings.runCalibration` subtree of a captured presentation. Only that subtree: CHG-UI-1's `StrengthExposure.descriptiveOnly` is
    /// not optional, while the frozen engine answers `{status: NOT_APPLICABLE, reason: NO_PRESCRIPTION}` under a hold, so a whole hold
    /// presentation does not decode with the proposal's types (finding FND-HR5-03, pre-existing, reproduced on 476b657; front C, not this delta).
    func readings(_ dir: URL, _ name: String) throws -> RunCalibration {
        let o = try JSONSerialization.jsonObject(with: Data(contentsOf: dir.appendingPathComponent(name + ".json"))) as! [String: Any]
        let rc = try XCTUnwrap((o["readings"] as? [String: Any])?["runCalibration"], name)
        return try JSONDecoder().decode(RunCalibration.self, from: try JSONSerialization.data(withJSONObject: rc))
    }

    func testFiveZonesFromAChestStrapMaximum() throws {
        let rc = try readings(Self.amended, "hr5-strap-presentation"), z = try XCTUnwrap(rc.heartRateFiveZones)
        XCTAssertEqual(z.status, "AVAILABLE")
        XCTAssertEqual(z.reference?.kind, "OBSERVED_MAXIMUM"); XCTAssertEqual(z.reference?.bpm, 186)
        XCTAssertEqual(z.zones?.map(\.zone.raw), ["Z1", "Z2", "Z3", "Z4", "Z5"])
        XCTAssertEqual(z.zones?.map(\.domain.raw), ["LOW", "LOW", "MODERATE", "HIGH", "HIGH"])
        XCTAssertEqual(z.zones?.first?.fromBpm, nil, "Z1 open below"); XCTAssertEqual(z.zones?.last?.toBpm, nil, "Z5 open above")
        let edges = try XCTUnwrap(z.zones).dropFirst().map { $0.fromBpm! }
        XCTAssertEqual(edges, edges.sorted()); XCTAssertEqual(Set(edges).count, 4, "strictly increasing")
        // The shared edges equal the three-zone output's (LOW|MODERATE, MODERATE|HIGH).
        let three = try XCTUnwrap(rc.heartRateZones?.zones)
        XCTAssertEqual(Double(z.zones![2].fromBpm!), three[1].lowBpm); XCTAssertEqual(Double(z.zones![3].fromBpm!), three[2].lowBpm)
        XCTAssertEqual(z.domains?["HIGH"], ["Z4", "Z5"])
        for (k, v) in [("primaryGuidance", z.primaryGuidance), ("sessionTarget", z.sessionTarget), ("gatesProgression", z.gatesProgression), ("convertedToPaceOrEffort", z.convertedToPaceOrEffort)] {
            XCTAssertEqual(v, false, k)
        }
        XCTAssertEqual(z.sessionDistribution?.reason, "NO_HEART_RATE_SERIES_IN_CONTRACT")
        XCTAssertEqual(z.ageFormula, "AGE_FORMULA_NOT_INDIVIDUAL")
        let roles = try XCTUnwrap(z.sessions).values
        XCTAssertFalse(roles.isEmpty)
        XCTAssertTrue(roles.allSatisfy { !$0.primary && $0.effortGoverns }, "heart rate is never primary; effort governs every session")
        XCTAssertTrue(roles.filter { $0.role == "COMPLEMENTARY_CEILING_CUE" }.allSatisfy { $0.neverSpeedUp == true && $0.sustainedReadingOnly == true && $0.healthMeaning == false && $0.slowDownCueAtOrAboveBpm == z.zones![3].fromBpm })
        XCTAssertEqual(z.referenceConfidence, "LOW"); XCTAssertEqual(z.disclosures, ["ZONES", "OBSERVED_MAXIMUM"])
        XCTAssertEqual(z.notes, ["NOT_THRESHOLDS", "FIXED_FRACTIONS_OF_A_MAXIMUM", "OBSERVED_MAXIMUM_MAY_BE_BELOW_TRUE_MAXIMUM"]); XCTAssertNotNil(z.sha256)
        XCTAssertTrue(roles.filter { $0.role == "COMPLEMENTARY_CEILING_CUE" }.allSatisfy { $0.disclosure == "CUE" })
        let withStrides = roles.filter { $0.strides != nil }
        XCTAssertFalse(withStrides.isEmpty, "the capture has easy runs with strides")
        XCTAssertTrue(withStrides.allSatisfy { $0.strides!.role == "NO_HEART_RATE_GUIDANCE" && $0.strides!.reason == "HEART_RATE_LAGS_SHORT_HARD_BOUTS" }, "the cue never applies to strides")
        XCTAssertTrue(roles.contains { $0.role == "NO_HEART_RATE_GUIDANCE" })
    }

    func testLabConflictNoneAndHold() throws {
        let lab = try XCTUnwrap(try readings(Self.amended, "hr5-lab-presentation").heartRateFiveZones)
        XCTAssertEqual(lab.reference?.kind, "LAB_MEASURED_MAXIMUM"); XCTAssertEqual(lab.reference?.checkedByTheApp, false); XCTAssertNotNil(lab.reference?.protocolName)
        XCTAssertEqual(lab.reference?.modality, "TREADMILL_RUN"); XCTAssertEqual(lab.referenceConfidence, "LOW")
        XCTAssertEqual(lab.disclosures, ["ZONES", "LAB_MEASURED_MAXIMUM"])
        let conflict = try XCTUnwrap(try readings(Self.amended, "hr5-conflict-presentation").heartRateFiveZones)
        XCTAssertEqual(conflict.status, "UNAVAILABLE"); XCTAssertEqual(conflict.reason, "REFERENCE_CONFLICT"); XCTAssertNil(conflict.zones, "no zones under a conflict")
        XCTAssertEqual(conflict.conflict?.labMaxBpm, 180); XCTAssertEqual(conflict.conflict?.observedMaxBpm, 192); XCTAssertEqual(conflict.conflict?.differenceBpm, 12)
        XCTAssertTrue(conflict.sessions!.values.allSatisfy { $0.slowDownCueAtOrAboveBpm == nil }, "no cue under a conflict")
        let none = try XCTUnwrap(try readings(Self.amended, "hr5-none-presentation").heartRateFiveZones)
        XCTAssertEqual(none.status, "UNAVAILABLE"); XCTAssertEqual(none.reason, "NO_MEASURED_HEART_RATE"); XCTAssertNil(none.zones, "no zone is shown without a reference")
        let hold = try XCTUnwrap(try readings(Self.amended, "hr5-hold-presentation").heartRateFiveZones)
        XCTAssertEqual(hold.reason, "HOLD_NO_PRESCRIPTION"); XCTAssertTrue(hold.sessions!.values.allSatisfy { $0.role == "NONE" })
    }

    /// Backward compatibility, both ways: a reading stored before the amendment decodes with the new types (the five zones nil), and every
    /// capture of the amended engine decodes with the frozen proposal's types (FrozenShapeDecodingTests, unchanged, runs over probes/out).
    func testRecordsFromBeforeTheAmendmentDecodeWithoutFiveZones() throws {
        let old = try readings(Self.frozen, "12-presentation-after-w0")
        XCTAssertNil(old.heartRateFiveZones, "absent: not computed by the frozen engine (never read as 'no zones')")
        XCTAssertEqual(old.heartRateZones?.status, "UNAVAILABLE")
        let new = try readings(Self.amended, "12-presentation-after-w0")
        XCTAssertNotNil(new.heartRateFiveZones, "the amended engine always states the five zones' status")
        XCTAssertEqual(new.heartRateZones, old.heartRateZones, "the three-zone reading is the same value")
        XCTAssertEqual(new.paceBands, old.paceBands); XCTAssertEqual(new.estimates, old.estimates); XCTAssertEqual(new.capacity, old.capacity)
    }
}
