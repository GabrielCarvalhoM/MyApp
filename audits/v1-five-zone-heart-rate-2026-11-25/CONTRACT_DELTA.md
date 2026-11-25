# V1HR5 — Contract delta (phase 5)

This is a technical delta, ready for the coordinated A/B/C incorporation. **This mission changed no shared contract:**

- `ios/Packages/IntegrationContracts`, the A/B handoffs, `PARALLEL_IMPLEMENTATION_CONTRACT.md` and the A/B worktrees are byte-identical to `8d2a7c0`/`476b657`;
- the Swift types below live only in this mission's copy of the CHG-UI-1 proposal (`proposals/CoachingPresentation`).

## 1. What the engine exposes now

The change is **additive, one key**: `runCalibration.heartRateFiveZones`, beside the unchanged `runCalibration.heartRateZones`. No existing key changed value. The regression proof (`evidence/regression-diff.mjs`) replays every recorded boundary journey through the frozen and the amended engine. Its only allowed differences are:

- the added key;
- the `runCalibration.hash` that covers it;
- the `carriedMac` that seals the carried readings.

### 1.1 Shape (checked against the code by QRE-SEC-HR5-REVIEW, corrected by C3)

Available (a 186 bpm chest-strap maximum; every bpm is the engine's, from the pinned per-mille values):

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
                 "bpm": 186, "evidenceId": "race-10k", "evidenceKind": "RACE_RESULT", "date": "2026-11-01", "ageDays": 16, "sensor": "CHEST_STRAP" },
                 // a lab reference adds "protocol", "source", "modality", "checkedByTheApp": false
  "referenceConfidence": "LOW", "zoneModelConfidence": "LOW",
  "conflict": null,
  "convention": "FROM_INCLUSIVE_TO_EXCLUSIVE", "rounding": "HALF_UP_INTEGER_PER_MILLE",
  "zones": [ { "zone": "Z1", "domain": "LOW", "fromBpm": null, "toBpm": 134, "fromFraction": null, "toFraction": 0.72 },
             { "zone": "Z2", "domain": "LOW", "fromBpm": 134, "toBpm": 149, ... }, { "zone": "Z3", "domain": "MODERATE", "fromBpm": 149, "toBpm": 162, ... },
             { "zone": "Z4", "domain": "HIGH", "fromBpm": 162, "toBpm": 171, ... }, { "zone": "Z5", "domain": "HIGH", "fromBpm": 171, "toBpm": null, ... } ],
  "domains": { "LOW": ["Z1","Z2"], "MODERATE": ["Z3"], "HIGH": ["Z4","Z5"] }, "withinDomainSplitsHaveSportingRole": false,
  "role": "REFERENCE_SCALE_ONLY", "primaryGuidance": false, "sessionTarget": false, "gatesProgression": false,
  "convertedToPaceOrEffort": false, "namedThresholds": false,
  "sessionDistribution": { "status": "UNAVAILABLE", "reason": "NO_HEART_RATE_SERIES_IN_CONTRACT", "fromAverageHeartRate": false },
  "changesAt": "WEEK_BOUNDARY", "withdrawnBy": [ "BREAK_OF_14_DAYS_OR_MORE", "HOLD", "WALK_JOG_RESTART_OR_RETURN_MODE", "REFERENCE_PAST_ITS_RECENCY" ],
  "ageFormula": "AGE_FORMULA_NOT_INDIVIDUAL",
  "notes": [ "NOT_THRESHOLDS", "FIXED_FRACTIONS_OF_A_MAXIMUM", "OBSERVED_MAXIMUM_MAY_BE_BELOW_TRUE_MAXIMUM" ],   // lab: "NOT_CHECKED_BY_THE_APP"
  "disclosures": [ "ZONES", "OBSERVED_MAXIMUM" ],     // + "NEWER_RUNNER" (experience NONE/NOVICE); lab: "LAB_MEASURED_MAXIMUM"
  "sessions": { "<sessionId>": { "role": "COMPLEMENTARY_CEILING_CUE", "primary": false, "effortGoverns": true,
                 "slowDownCueFromZone": "Z4", "slowDownCueAtOrAboveBpm": 162, "sustainedReadingOnly": true, "neverSpeedUp": true, "healthMeaning": false,
                 "effortConflict": "EFFORT_GOVERNS_HEART_RATE_MAY_ONLY_SUGGEST_SLOWING", "reference": "OBSERVED_MAXIMUM", "disclosure": "CUE",
                 "strides": { "role": "NO_HEART_RATE_GUIDANCE", "reason": "HEART_RATE_LAGS_SHORT_HARD_BOUTS", "primary": false, "effortGoverns": true },  // when the run has strides
                 "family": "EASY", "week": 0, "provisional": false },
                "<sessionId>": { "role": "NO_HEART_RATE_GUIDANCE", "reason": "ZONES_ARE_NOT_INDIVIDUAL_THRESHOLDS", "primary": false, "effortGoverns": true, "family": "THRESHOLD", ... } }
}
```

The per-session heart-rate roles live **in the five-zone reading** (`heartRateFiveZones.sessions`, by session id), **not** in `runCalibration.sessions`, which stays byte-identical: heart rate changes no session guidance.

Unavailable:

```jsonc
"heartRateFiveZones": { "version", "model", "sha256", "source", "status": "UNAVAILABLE", "reason": "<code>", "ageFormula": "AGE_FORMULA_NOT_INDIVIDUAL",
                        // REFERENCE_CONFLICT only:
                        "conflict": { "status": "REFERENCE_CONFLICT", "labMaxBpm": 180, "labDate", "labEvidenceId", "observedMaxBpm": 192, "observedDate", "observedEvidenceId",
                                      "differenceBpm": 12, "bandBpm": 5 }, "disclosures": [ "REFERENCE_CONFLICT" ],
                        "sessions": { "<sessionId>": { "role": "NONE" | "NO_HEART_RATE_GUIDANCE", "reason": "<code>", "primary": false, "effortGoverns": true, ... } } }
```

Reasons (`status: UNAVAILABLE`):

- `HOLD_NO_PRESCRIPTION`: checked first;
- `EXTENSION_NOT_ENABLED`: no independent enabling record bound to the pinned values, or the run calibration's HR or CAPACITY boundary off;
- `MODE_WALK_JOG_RESTART_RETURN`;
- `NO_MEASURED_HEART_RATE`;
- `HEART_RATE_DATA_NOT_QUALIFYING`;
- `LAB_MODALITY_NOT_RUNNING_OR_UNKNOWN`;
- `REFERENCE_CONFLICT`;
- `ZONE_BOUNDARIES_DEGENERATE`: impossible inside 140–220 bpm, but checked;
- `FIVE_ZONE_ERROR`: a fault of this code; the rest of the run calibration is unaffected.

Session reasons:

- the family reasons of the values file (`ZONES_ARE_NOT_INDIVIDUAL_THRESHOLDS`, `HEART_RATE_LAGS_SHORT_HARD_BOUTS`, `RACE_DAY_GUIDANCE_AS_APPROVED`, `EFFORT_ONLY_FAMILY`, `UNKNOWN_FAMILY_FAIL_CLOSED`);
- the order is hold, then boundary off, then effort-only mode (or a family that holds only in another mode), then the family's role;
- a cue family with no zones in force is `NONE`, with the zones' reason.

**The key absent (QRE-HR5-07): read it with `runCalibration.status`.**

| `runCalibration.status` | Five-zone key | Meaning |
|---|---|---|
| `DISABLED`, `NOT_APPLICABLE` or an error (or `runCalibration` absent) | absent, in every engine version | Show no zones. |
| Any other status, key absent | — | Computed by an engine **before** this amendment, for example a reading stored before it: "not computed", **never** "no zones". |
| Any other status, key present | present | `model` and `sha256` name the version. |

**The two readings may name different evidence (QRE-HR5-12):**

- the three-zone `heartRateZones` keeps its own rules: lab values as supplied take its place whenever a qualifying lab test exists, and its observed maximum ties are its own;
- the five zones use their own hierarchy: a lab **maximum** under the HR5-2 conditions, else the observed maximum.

A screen shows each reading's `reference` / `basis` as given and never assumes they are the same test.

## 2. Swift (proposal delta, mission copy only)

In `proposals/CoachingPresentation`, a copy of CHG-UI-1:

- new file `HeartRateFiveZones.swift`: `HeartRateFiveZones`, `HeartRateReference`, `HeartRateConflict`, `FiveZone`, `StatusAndReason`, `SessionHeartRate`;
- one added optional field, `RunCalibration.heartRateFiveZones`;
- the types carry `sha256`, `source`, `notes`, `disclosures`, and per session `sustainedReadingOnly`, `healthMeaning`, `disclosure` and `strides` (QRE-HR5-06);
- new tests `FiveZoneDecodingTests`:
  - five zones from a strap maximum, a lab maximum, a conflict, no heart rate, and a hold;
  - no safety field lost (`primaryGuidance`, `sessionTarget`, `gatesProgression`, `convertedToPaceOrEffort` false, `neverSpeedUp`, `effortGoverns`);
  - backward compatibility both ways.
- `FrozenShapeDecodingTests` is unchanged and passes over the **amended** engine's captures (`probes/out`, recaptured by the reconciliation's own scripts).

FND-HR5-03 (pre-existing, for C): `StrengthExposure.descriptiveOnly` must become optional. The frozen engine returns `NOT_APPLICABLE` without it under a hold.

## 3. Incorporation checklist (A/B/C)

| Where | Change |
|---|---|
| CoachingCore runtime | Take `src/v1-heart-rate-zones.mjs`, the change to `src/v1-run-calibration.mjs` (one import; the five zones and session roles computed beside the unchanged guidance; one output key), `v1/HEART_RATE_FIVE_ZONE_V1.json` and `reviews/ssctr/SSCTR_HR5_RECORDS.json`. The amendment record `CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json` and its verifier `CoachingCore/scripts/v1-five-zone-amendment.mjs` bind exactly these bytes; they are written by the closing commit of this mission. |
| App bundle (A) | Rebuild with the linker: 49 modules, 18 assets. Run the device equivalence gate on the new bundle. |
| `IntegrationContracts` (A/B) | No change. |
| `CoachingPresentation` (C, CHG-UI-1) | Add `HeartRateFiveZones.swift` and `RunCalibration.heartRateFiveZones`; make `StrengthExposure.descriptiveOnly` optional (FND-HR5-03). |
| Fixtures | Regenerate `j5`, `p16`, `focal`, `core`, `int`, `final` and `hmac` with the historical oracles over the amended engine (`native/build.sh` shows how, into a copy); add `hr5.json` and `FiveZoneTests.swift`. |
| UI (C), Figma 50/71 | Five zones are now engine values: show Z1–Z5 only from `heartRateFiveZones`. "Máxima informada" stays hidden (a declared maximum is not a reference). "Tempo por zona" stays `FUTURE_ONLY` (no series). The proposed copy change "baixa · moderada · alta" (GAP-37) is no longer needed, because `domains` gives the three-domain grouping. |
| Open (A + SEC) | FND-HR5-01: the boundary refuses `runEvidence`. A heart-rate reference reaches the engine from the app only through intake anchors and the plan's race rows until the contract-closure mission decides that channel. |
