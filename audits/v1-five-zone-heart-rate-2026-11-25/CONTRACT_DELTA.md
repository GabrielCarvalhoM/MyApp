# V1HR5 — Contract delta (phase 5)

This is a technical delta, ready for the coordinated A/B/C incorporation. **This mission changed no shared contract:**

- `ios/Packages/IntegrationContracts`, the A/B handoffs, `PARALLEL_IMPLEMENTATION_CONTRACT.md` and the A/B worktrees are byte-identical to `8d2a7c0`/`476b657`;
- the Swift types below live only in this mission's copy of the CHG-UI-1 proposal (`proposals/CoachingPresentation`).

## 1. What the engine exposes now

The change is **additive, one key**: `runCalibration.heartRateFiveZones`, beside the unchanged `runCalibration.heartRateZones`. No existing key changed value. The regression proof (`evidence/regression-diff.mjs`) replays every recorded boundary journey through the frozen and the amended engine. Its only allowed differences are:

- the added key;
- the `runCalibration.hash` that covers it;
- the `carriedMac` that seals the carried readings.

### 1.1 Shape

Available:

```jsonc
"heartRateFiveZones": {
  "version": "V1X-HR-FIVE-ZONE-STATE-1", "model": "V1X-HR-FIVE-ZONE-1",
  "sha256": "<pinned sha256 of CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json>",
  "source": "CURRENT_INDEPENDENT_REVIEW",            // DEV_TEST_ONLY in tests
  "status": "AVAILABLE",
  "method": "FRACTION_OF_REFERENCE_MAXIMUM",
  "basis": "ESTIMATED_FROM_OBSERVED_MAXIMUM",        // or LAB_MAXIMUM_AS_SUPPLIED
  "estimated": true,
  "reference": { "kind": "OBSERVED_MAXIMUM",         // or LAB_MEASURED_MAXIMUM
                 "bpm": 186, "evidenceId": "race-10k", "evidenceKind": "RACE_RESULT", "date": "2026-11-01", "ageDays": 16,
                 "sensor": "CHEST_STRAP" },          // a lab reference adds protocol, source, checkedByTheApp:false
  "referenceConfidence": "LOW",                      // see SCIENCE_AND_CALIBRATION_DECISION.md
  "zoneModelConfidence": "LOW",
  "conflict": null,                                  // or {status:"CONFLICTING_REFERENCES", apartBpm, bandBpm, rule, candidates:[ref, ref]}
  "convention": "FROM_INCLUSIVE_TO_EXCLUSIVE", "rounding": "NEAREST_BPM_AS_THE_THREE_ZONES",
  "zones": [ { "zone": "Z1", "domain": "LOW", "fromBpm": null, "toBpm": 134, "fromFraction": null, "toFraction": 0.72 }, … Z5 (toBpm null) ],
  "domains": { "LOW": ["Z1","Z2"], "MODERATE": ["Z3"], "HIGH": ["Z4","Z5"] },
  "role": "REFERENCE_SCALE_ONLY", "primaryGuidance": false, "sessionTarget": false, "gatesProgression": false,
  "convertedToPaceOrEffort": false, "namedThresholds": false,
  "sessionDistribution": { "status": "UNAVAILABLE", "reason": "NO_HEART_RATE_SERIES_IN_CONTRACT", "fromAverageHeartRate": false },
  "changesAt": "WEEK_BOUNDARY", "withdrawnBy": [ "BREAK_OF_14_DAYS_OR_MORE", "HOLD", "WALK_JOG_RESTART_OR_RETURN_MODE", "REFERENCE_PAST_ITS_RECENCY" ],
  "ageFormula": "AGE_FORMULA_NOT_INDIVIDUAL", "notes": [ "NOT_THRESHOLDS", … ],
  "sessions": { "<sessionId>": { "role": "COMPLEMENTARY_CEILING_CUE", "primary": false, "effortGoverns": true,
                 "slowDownCueFromZone": "Z4", "slowDownCueAtOrAboveBpm": 162, "neverSpeedUp": true,
                 "effortConflict": "EFFORT_GOVERNS_HEART_RATE_MAY_ONLY_SUGGEST_SLOWING", "reference": "OBSERVED_MAXIMUM",
                 "family": "EASY", "week": 0, "provisional": false }, … }
}
```

The numbers shown are for a 186 bpm chest-strap maximum. The bpm values are the engine's, from the pinned fractions.

Unavailable:

```jsonc
"heartRateFiveZones": { "version", "model", "sha256", "source", "status": "UNAVAILABLE", "reason": "<code>", "ageFormula": "AGE_FORMULA_NOT_INDIVIDUAL",
                        "sessions": { "<sessionId>": { "role": "NONE" | "NO_HEART_RATE_GUIDANCE", "reason": "<code>", "primary": false, "effortGoverns": true, … } } }
```

Reasons:

- `EXTENSION_NOT_ENABLED`: no independent enabling record, or the run calibration's HR or CAPACITY boundary is off;
- `HOLD_NO_PRESCRIPTION`;
- `MODE_WALK_JOG_RESTART_RETURN`;
- `NO_MEASURED_HEART_RATE`;
- `HEART_RATE_DATA_NOT_QUALIFYING`;
- `ZONE_BOUNDARIES_DEGENERATE` (impossible inside the plausible range, but checked);
- `CONFLICTING_REFERENCES` (only if a decision rule names no winner).

When the run calibration itself is `DISABLED` or `NOT_APPLICABLE`, the key is absent, exactly as `heartRateZones` is. The calibration answers in that case are unchanged.

### 1.2 Answers to the ten questions of phase 5

| # | Question | Answer |
|---|---|---|
| 1 | How the five zones are exposed | `runCalibration.heartRateFiveZones.zones`: always five, Z1…Z5 in order, `[fromBpm, toBpm)`, Z1 open below and Z5 open above, with integer bpm. |
| 2 | Method | `method` (`FRACTION_OF_REFERENCE_MAXIMUM`), `basis` and `reference.kind`. The values are identified by `model` plus `sha256`. |
| 3 | Confidence and origin | `referenceConfidence`, `zoneModelConfidence`, `reference` (evidence id, kind, date, age, sensor or lab protocol and source, `checkedByTheApp:false`), `conflict`, `estimated:true`, `source` (the authority). |
| 4 | An athlete without zones | `status: "UNAVAILABLE"` and a typed `reason`, no `zones`. The UI shows the state the engine names, never an empty or placeholder zone. The sessions keep their effort cue (`effortGoverns: true`). |
| 5 | Historical three-zone records | **Untouched.** `heartRateZones` is the same key with the same value: same rules, same bytes, same three zones or lab values. The five zones are a separate key. |
| 6 | No silent migration | Nothing stored is rewritten. A document stored before the amendment keeps its `carried.presentation.readings` as computed, without `heartRateFiveZones`, until the next operation recomputes the readings. A reader must treat an **absent** key as "not computed by that engine version", never as "no zones" (decoding test `testRecordsFromBeforeTheAmendmentDecodeWithoutFiveZones`). The engine reads none of it back: the calibration is a pure function of the record. |
| 7 | CoachingHost (A) | Nothing new to carry. The key travels inside the `runCalibration` reading that A already transports, under the same carried MAC (a tampered five-zone value is `INTEGRITY_FAILURE`, journey `hr5-strap`). A must bundle **two new assets**: `CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json` and `audits/v1-five-zone-heart-rate-2026-11-25/reviews/ssctr/SSCTR_HR5_RECORDS.json`, with the module `src/v1-heart-rate-zones.mjs` (the historical linker picks all three up by itself). |
| 8 | SwiftUI (C) | Decode `HeartRateFiveZones` (`proposals/CoachingPresentation/Sources/CoachingPresentation/HeartRateFiveZones.swift`). Show `zones` only when `AVAILABLE`, exactly as given; never recompute from `reference.bpm`. A session's `heartRate` role is shown only as a reference or a slow-down cue, never as the session's target. |
| 9 | HealthKit (B) | **No change.** The engine still reads no heart rate from the DEVICE channel (G-1), and no heart-rate permission is needed. Time in zone stays `FUTURE_ONLY` until a reviewed heart-rate series channel exists. The classifier is ready (`classifySamples`); the channel, its permission and its sporting conditions are not approved. |
| 10 | Files and fixtures to update at integration | See §3. |

## 2. Swift (proposal delta, mission copy only)

In `proposals/CoachingPresentation`, a copy of CHG-UI-1:

- new file `HeartRateFiveZones.swift`: `HeartRateFiveZones`, `HeartRateReference`, `HeartRateConflict`, `FiveZone`, `StatusAndReason`, `SessionHeartRate`;
- one added optional field, `RunCalibration.heartRateFiveZones`;
- new tests `FiveZoneDecodingTests`:
  - five zones from a strap maximum, a lab maximum, a conflict, no heart rate, and a hold;
  - no safety field lost (`primaryGuidance`, `sessionTarget`, `gatesProgression`, `convertedToPaceOrEffort` false, `neverSpeedUp`, `effortGoverns`);
  - backward compatibility both ways.
- `FrozenShapeDecodingTests` is unchanged and passes over the **amended** engine's captures (`probes/out`, recaptured by the reconciliation's own scripts).

FND-HR5-03 (pre-existing, for C): `StrengthExposure.descriptiveOnly` must become optional. The frozen engine returns `NOT_APPLICABLE` without it under a hold.

## 3. Incorporation checklist (A/B/C)

| Where | Change |
|---|---|
| CoachingCore runtime | Take `src/v1-heart-rate-zones.mjs`, the 3-hunk change to `src/v1-run-calibration.mjs` (import; five zones and session roles computed beside the guidance; one output key), `v1/HEART_RATE_FIVE_ZONE_V1.json` and the records file. The amendment record is `CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json`. |
| App bundle (A) | Rebuild with the linker: 49 modules, 18 assets. Run the device equivalence gate on the new bundle. |
| `IntegrationContracts` (A/B) | No change. |
| `CoachingPresentation` (C, CHG-UI-1) | Add `HeartRateFiveZones.swift` and `RunCalibration.heartRateFiveZones`; make `StrengthExposure.descriptiveOnly` optional (FND-HR5-03). |
| Fixtures | Regenerate `j5`, `p16`, `focal`, `core`, `int`, `final` and `hmac` with the historical oracles over the amended engine (`native/build.sh` shows how, into a copy); add `hr5.json` and `FiveZoneTests.swift`. |
| UI (C), Figma 50/71 | Five zones are now engine values: show Z1–Z5 only from `heartRateFiveZones`. "Máxima informada" stays hidden (a declared maximum is not a reference). "Tempo por zona" stays `FUTURE_ONLY` (no series). The proposed copy change "baixa · moderada · alta" (GAP-37) is no longer needed, because `domains` gives the three-domain grouping. |
| Open (A + SEC) | FND-HR5-01: the boundary refuses `runEvidence`. A heart-rate reference reaches the engine from the app only through intake anchors and the plan's race rows until the contract-closure mission decides that channel. |
