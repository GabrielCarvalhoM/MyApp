import XCTest
@testable import CoachingPresentation

/// V1HR5R contract delta (revision 2 of the five zones, Founder decision FOUNDER-HR5-RUNNA-PARITY-2026-11-25). Decodes what the CORRECTED boundary
/// returned (probes/out, captured by probes/capture-hr5r.mjs and by the reconciliation's capture scripts rerun over the corrected engine), what
/// the first amendment returned (V1HR5's probes/out, revision 1), and what the FROZEN boundary returned before both (the reconciliation's probes/out):
/// five zones for a 30-year-old with no device, declared and custom maxima, measured references kept apart, no safety field lost, and records
/// from before decode (five zones absent = not computed by that version, never "no zones").
final class FiveZoneDecodingTests: XCTestCase {
    /// The current runtime's captures, and two historical capture sets kept in their audits (read-only) for backward compatibility.
    static let corrected = Repo.fixtures
    static let revision1 = Repo.url("audits/v1-five-zone-heart-rate-2026-11-25/probes/out")
    static let frozen = Repo.url("audits/v1-ui-functional-reconciliation/probes/out")
    /// The `readings.runCalibration` subtree of a captured presentation (whole presentations are decoded in BlockedAndDescriptiveTests).
    func readings(_ dir: URL, _ name: String) throws -> RunCalibration {
        let o = try JSONSerialization.jsonObject(with: Data(contentsOf: dir.appendingPathComponent(name + ".json"))) as! [String: Any]
        let rc = try XCTUnwrap((o["readings"] as? [String: Any])?["runCalibration"], name)
        return try JSONDecoder().decode(RunCalibration.self, from: try JSONSerialization.data(withJSONObject: rc))
    }
    func five(_ name: String) throws -> HeartRateFiveZones { try XCTUnwrap(try readings(Self.corrected, name).heartRateFiveZones, name) }
    func limits(_ z: HeartRateFiveZones) -> [[Int?]] { (z.zones ?? []).map { [$0.minBpm, $0.maxBpm] } }

    /// Acceptance 1: a 30-year-old with no device gets five estimated zones from 220 - 30 = 190, with no fabricated measurement.
    func testAge30WithNoDevice() throws {
        let z = try five("hr5r-age30-presentation")
        XCTAssertEqual(z.status, "AVAILABLE"); XCTAssertEqual(z.model, "V1X-HR-FIVE-ZONE-2")
        XCTAssertEqual(z.reference?.kind, "AGE_ESTIMATE"); XCTAssertEqual(z.reference?.bpm, 190); XCTAssertEqual(z.reference?.ageYears, 30); XCTAssertEqual(z.reference?.formula, "220_MINUS_AGE")
        XCTAssertEqual(z.provenance, "ESTIMATED"); XCTAssertEqual(z.estimated, true); XCTAssertEqual(z.boundarySource, "DEFAULT_PERCENT_OF_MAXIMUM")
        XCTAssertEqual(limits(z), [[nil, 123], [124, 153], [154, 169], [170, 184], [185, nil]])
        XCTAssertEqual(z.zones?.map(\.upToPercent), [65, 81, 89, 97, nil]); XCTAssertEqual(z.zones?.map(\.abovePercent), [nil, 65, 81, 89, 97])
        XCTAssertEqual(z.zones?.compactMap(\.domain), [], "revision 2 does not nest in the three domains"); XCTAssertEqual(z.threeDomains, "NOT_NESTED")
        XCTAssertEqual(z.measuredHeartRate?.status, "UNAVAILABLE"); XCTAssertEqual(z.measurements, [])
        XCTAssertEqual(z.sessionDistribution?.reason, "NO_HEART_RATE_SERIES_IN_CONTRACT"); XCTAssertEqual(z.liveHeartRate?.status, "UNAVAILABLE")
        for (k, v) in [("primaryGuidance", z.primaryGuidance), ("sessionTarget", z.sessionTarget), ("gatesProgression", z.gatesProgression), ("convertedToPaceOrEffort", z.convertedToPaceOrEffort),
                       ("changesThePlan", z.changesThePlan), ("medicalEvidence", z.medicalEvidence), ("releasesASafetyBlock", z.releasesASafetyBlock)] { XCTAssertEqual(v, false, k) }
        XCTAssertEqual(z.disclosures, ["ZONES", "AGE_ESTIMATE", "NOT_MEDICAL"])
        let roles = try XCTUnwrap(z.sessions).values
        XCTAssertTrue(roles.allSatisfy { !$0.primary && $0.effortGoverns }, "heart rate is never primary; effort governs every session")
        let cues = roles.filter { $0.role == "COMPLEMENTARY_CEILING_CUE" }
        XCTAssertFalse(cues.isEmpty); XCTAssertTrue(cues.allSatisfy { $0.slowDownCueAtOrAboveBpm == 170 && $0.neverSpeedUp == true && $0.healthMeaning == false && $0.reference == "AGE_ESTIMATE" })
        XCTAssertTrue(roles.filter { $0.strides != nil }.allSatisfy { $0.strides!.role == "NO_HEART_RATE_GUIDANCE" }, "the cue never applies to strides")
    }
    /// Acceptance 2 and the reference order: a strap maximum above the estimate replaces it; one below is shown, not used; a lab maximum is used;
    /// under a lab/strap conflict neither is used and the age estimate is, both shown.
    func testMeasuredReferences() throws {
        let above = try five("hr5r-strap-above-presentation")
        XCTAssertEqual(above.reference?.kind, "OBSERVED_MAXIMUM"); XCTAssertEqual(above.provenance, "MEASURED"); XCTAssertEqual(limits(above), [[nil, 120], [121, 150], [151, 165], [166, 180], [181, nil]])
        let below = try five("hr5r-strap-below-presentation")
        XCTAssertEqual(below.reference?.kind, "AGE_ESTIMATE"); XCTAssertEqual(below.notUsed?.first?.reason, "OBSERVED_NOT_ABOVE_THE_AGE_ESTIMATE")
        XCTAssertEqual(below.measuredReferences?.observed?.bpm, 186); XCTAssertEqual(below.measurements?.first?.zone, "Z5"); XCTAssertEqual(below.measurements?.first?.isADistribution, false)
        let lab = try five("hr5r-lab-presentation")
        XCTAssertEqual(lab.reference?.kind, "LAB_MEASURED_MAXIMUM"); XCTAssertEqual(lab.reference?.checkedByTheApp, false); XCTAssertEqual(lab.referenceConfidence, "MODERATE")
        let conflict = try five("hr5r-conflict-presentation")
        XCTAssertEqual(conflict.status, "AVAILABLE"); XCTAssertEqual(conflict.reference?.kind, "AGE_ESTIMATE"); XCTAssertEqual(conflict.conflict?.differenceBpm, 12)
        XCTAssertEqual(conflict.notUsed?.map(\.reason), ["REFERENCE_CONFLICT", "REFERENCE_CONFLICT"])
        let optical = try five("hr5r-optical-presentation")
        XCTAssertEqual(optical.measurements?.first?.sensor, "OPTICAL"); XCTAssertTrue(optical.disclosures?.contains("OPTICAL_MEASUREMENT") == true); XCTAssertEqual(optical.reference?.kind, "AGE_ESTIMATE")
    }
    /// Acceptance 3: the athlete's declared maximum and custom limits, through setHeartRateProfile; no age; a hold.
    func testDeclaredCustomNoAgeAndHold() throws {
        let declared = try five("hr5r-declared-presentation")
        XCTAssertEqual(declared.reference?.kind, "ATHLETE_DECLARED_MAXIMUM"); XCTAssertEqual(declared.provenance, "DECLARED"); XCTAssertEqual(declared.referenceConfidence, "UNVERIFIED")
        XCTAssertEqual(limits(declared), [[nil, 126], [127, 157], [158, 173], [174, 189], [190, nil]]); XCTAssertEqual(declared.profile?.declaredMaximumBpm, 195)
        let custom = try five("hr5r-custom-presentation")
        XCTAssertEqual(custom.boundarySource, "ATHLETE_CUSTOM"); XCTAssertEqual(limits(custom), [[nil, 130], [131, 150], [151, 165], [166, 180], [181, nil]]); XCTAssertEqual(custom.zones?.compactMap(\.upToPercent), [])
        let answer = try JSONDecoder().decode(HeartRateProfileAnswer.self, from: Data(contentsOf: Self.corrected.appendingPathComponent("hr5r-declared-answer.json")))
        XCTAssertTrue(answer.ok); XCTAssertEqual(answer.heartRateProfile?.added.count, 1); XCTAssertEqual(answer.fiveZones?.status, "AVAILABLE")
        let noAge = try five("hr5r-noage-presentation")
        XCTAssertEqual(noAge.status, "UNAVAILABLE"); XCTAssertEqual(noAge.reason, "AGE_REQUIRED"); XCTAssertNil(noAge.zones)
        let hold = try five("hr5r-hold-presentation")
        XCTAssertEqual(hold.reason, "HOLD_NO_PRESCRIPTION"); XCTAssertTrue(hold.sessions!.values.allSatisfy { $0.role == "NONE" })
        // The request a screen sends: null clears; an omitted field is left as it is.
        let enc = JSONEncoder(); enc.outputFormatting = .sortedKeys
        XCTAssertEqual(String(data: try enc.encode(HeartRateProfileRequest(maxHeartRateBpm: .some(195))), encoding: .utf8), "{\"maxHeartRateBpm\":195}")
        XCTAssertEqual(String(data: try enc.encode(HeartRateProfileRequest(maxHeartRateBpm: .some(nil), zoneUpperBpm: .some(nil))), encoding: .utf8), "{\"maxHeartRateBpm\":null,\"zoneUpperBpm\":null}")
    }
    /// Backward compatibility, three ways: the frozen engine's reading (no five zones), the first amendment's (revision 1) and the corrected one.
    func testRecordsFromBeforeDecode() throws {
        let old = try readings(Self.frozen, "12-presentation-after-w0")
        XCTAssertNil(old.heartRateFiveZones, "absent: not computed by the frozen engine (never read as 'no zones')")
        let r1 = try XCTUnwrap(try readings(Self.revision1, "hr5-strap-presentation").heartRateFiveZones)
        XCTAssertEqual(r1.model, "V1X-HR-FIVE-ZONE-1"); XCTAssertEqual(r1.zones?.map(\.domain), ["LOW", "LOW", "MODERATE", "HIGH", "HIGH"]); XCTAssertNil(r1.zones?.first?.maxBpm)
        let new = try readings(Self.corrected, "12-presentation-after-w0")
        XCTAssertEqual(new.heartRateFiveZones?.model, "V1X-HR-FIVE-ZONE-2")
        XCTAssertEqual(new.heartRateZones, old.heartRateZones, "the three-zone reading is the same value")
        XCTAssertEqual(new.paceBands, old.paceBands); XCTAssertEqual(new.estimates, old.estimates); XCTAssertEqual(new.capacity, old.capacity)
    }
}
