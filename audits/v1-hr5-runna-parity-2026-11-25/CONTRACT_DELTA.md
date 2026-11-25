# V1HR5R — Contract delta

This is a technical delta, ready for the coordinated A/B/C incorporation. It **supersedes the five-zone part** of [V1HR5's CONTRACT_DELTA](../v1-five-zone-heart-rate-2026-11-25/CONTRACT_DELTA.md). Everything else in that document still holds.

**This mission changed no shared contract:**

- `ios/Packages/IntegrationContracts`, the A/B handoffs, `PARALLEL_IMPLEMENTATION_CONTRACT.md` and the A/B worktrees are byte-identical to `4850560`.
- The Swift types below live only in this mission's copy of the CHG-UI-1 proposal (`proposals/CoachingPresentation`).

## 1. What the engine exposes now

### 1.1 `runCalibration.heartRateFiveZones`, revision 2

- `model` is `V1X-HR-FIVE-ZONE-2`, `version` is `V1X-HR-FIVE-ZONE-STATE-2`, and `sha256` is `784ba7fe…`: the pinned `CoachingCore/v1/HEART_RATE_FIVE_ZONE_V2.json`.
- Example: a 30-year-old with no device.

```jsonc
{
  "status": "AVAILABLE", "method": "PERCENT_OF_MAXIMUM_HEART_RATE", "basis": "ESTIMATED_FROM_AGE", "provenance": "ESTIMATED", "estimated": true,
  "reference": { "kind": "AGE_ESTIMATE", "provenance": "ESTIMATED", "bpm": 190, "formula": "220_MINUS_AGE", "ageYears": 30, "ageDeclared": 30, "ageDeclaredOn": "2026-11-14" },
  "referenceConfidence": "LOW", "zoneModelConfidence": "LOW", "boundarySource": "DEFAULT_PERCENT_OF_MAXIMUM",
  "conflict": null, "notUsed": [ { "kind": "OBSERVED_MAXIMUM", "bpm": 186, "reason": "OBSERVED_NOT_ABOVE_THE_AGE_ESTIMATE" } ],
  "convention": "ABOVE_LOWER_PERCENT_UP_TO_UPPER_PERCENT_INCLUSIVE", "rounding": "WHOLE_BPM_UPPER_LIMIT_FLOOR_OF_EXACT_PERCENT", "readingRounding": "HALF_UP_TO_WHOLE_BPM",
  "zones": [ { "zone": "Z1", "minBpm": null, "maxBpm": 123, "fromBpm": null, "toBpm": 124, "abovePercent": null, "upToPercent": 65, "fromFraction": null, "toFraction": 0.65 },
             { "zone": "Z2", "minBpm": 124, "maxBpm": 153, ... }, { "zone": "Z3", "minBpm": 154, "maxBpm": 169, ... },
             { "zone": "Z4", "minBpm": 170, "maxBpm": 184, ... }, { "zone": "Z5", "minBpm": 185, "maxBpm": null, ... } ],
  "threeDomains": "NOT_NESTED",
  "role": "REFERENCE_SCALE_ONLY", "primaryGuidance": false, "sessionTarget": false, "gatesProgression": false, "convertedToPaceOrEffort": false, "namedThresholds": false,
  "changesThePlan": false, "medicalEvidence": false, "releasesASafetyBlock": false,
  "measuredHeartRate": { "status": "AVAILABLE", "count": 1 },
  "measurements": [ { "evidenceId": "race-10k", "kind": "SESSION_MAXIMUM", "bpm": 186, "sensor": "CHEST_STRAP", "zone": "Z5", "singleValue": true, "isADistribution": false } ],
  "sessionDistribution": { "status": "UNAVAILABLE", "reason": "NO_HEART_RATE_SERIES_IN_CONTRACT", "fromAverageHeartRate": false },
  "liveHeartRate": { "status": "UNAVAILABLE", "reason": "NO_LIVE_HEART_RATE_CHANNEL_IN_CONTRACT", "assumedFromASyncedWatch": false },
  "measuredReferences": { "status": "AVAILABLE", "lab": null, "observed": { "kind": "OBSERVED_MAXIMUM", "provenance": "MEASURED", "bpm": 186, ... }, "conflict": null },
  "profile": { "ageYears": 30, "ageDeclared": 30, "ageDeclaredOn": "2026-11-14", "declaredMaximumBpm": null, "customZoneUpperBpm": null },
  "notes": [ "NOT_THRESHOLDS", "FIXED_PERCENTAGES_OF_A_MAXIMUM", "NOT_MEDICAL_EVIDENCE", "POPULATION_FORMULA_NOT_INDIVIDUAL" ],
  "disclosures": [ "ZONES", "AGE_ESTIMATE", "NOT_MEDICAL" ],     // + the reference kind, ATHLETE_CUSTOM, REFERENCE_CONFLICT, OPTICAL_MEASUREMENT, NEWER_RUNNER
  "sessions": { "<id>": { "role": "COMPLEMENTARY_CEILING_CUE", "slowDownCueFromZone": "Z4", "slowDownCueAtOrAboveBpm": 170, "reference": "AGE_ESTIMATE", "boundarySource": "DEFAULT_PERCENT_OF_MAXIMUM", ... } }
}
```

**The reference, in this order:**

1. `ATHLETE_DECLARED_MAXIMUM`: DECLARED, UNVERIFIED.
2. `LAB_MEASURED_MAXIMUM`: MEASURED, MODERATE; under the r1 lab rules.
3. `OBSERVED_MAXIMUM`: MEASURED, LOW; a chest strap in a hard effort, used only when it is above the age estimate.
4. `AGE_ESTIMATE`: ESTIMATED, LOW; 220 − the age in force, for ages 18–80 only.

Every candidate not used is listed in `notUsed` with the reason.

**Limits:**

- `boundarySource: ATHLETE_CUSTOM` means the athlete set the four limits. The percentages are then null, and the limits are never recomputed from a new maximum.
- Each zone's `minBpm` and `maxBpm` are inclusive whole bpm. `fromBpm` and `toBpm` give the same interval as `[from, to)`.

**Reasons for `UNAVAILABLE`:**

| Reason | When |
|---|---|
| `HOLD_NO_PRESCRIPTION` | Checked first. |
| `EXTENSION_NOT_ENABLED` | The boundary is off. |
| `AGE_REQUIRED` | No age, no declared maximum, no qualifying measurement, no custom limits. |
| `AGE_OUTSIDE_ESTIMATE_RANGE` | The age in force is past 80 and nothing else is in force. |
| `REFERENCE_CONFLICT` | A lab/strap conflict with no age and no declaration. |
| `ZONE_BOUNDARIES_DEGENERATE` | Checked; impossible in range. |
| `FIVE_ZONE_ERROR` | Isolated; the rest of the reading is intact. |

The old reasons `NO_MEASURED_HEART_RATE`, `HEART_RATE_DATA_NOT_QUALIFYING` and `LAB_MODALITY_NOT_RUNNING_OR_UNKNOWN` now live in `measuredReferences.reason`.

**Walk/jog, restart and return modes** keep the zones (`AVAILABLE`). Their sessions are `NONE` / `MODE_WALK_JOG_RESTART_RETURN`.

**Kept from revision 1:**

- the session roles;
- the strides rule;
- the cue rules: sustained only, never speed up, no health meaning;
- the fault isolation;
- the week-boundary rule for **measured** references.

An athlete's declared maximum or limits take effect at once. That is the athlete's explicit choice, and it changes no plan.

### 1.2 The athlete's heart-rate profile (new carried record)

Every composed-entry answer (`generateProgram`, `evaluateProgram`, `restartProgram` of `v1-safety-index.mjs`) carries two new keys:

- **`heartRateProfileRecord`:** append-only rows `{fact: "V1HR5R-HEART-RATE-PROFILE-DECLARED", version, eventId, athleteId, declaredAt, source: INTAKE|ATHLETE, declaration, inputHash}`.
  - The caller keeps this record and sends it back, as it does `runEvidenceRecord`.
  - The integration carries it under the seal.
- **`heartRateProfileDeclared`:** `{added: [eventId], refused: [{errors}], unchanged: [field]}`.

**Inputs, taken off before the engine reads:**

- The **intake's** `athlete.ageYears`, appended as an INTAKE row when it differs from the age in force.
- `heartRateProfile: {maxHeartRateBpm?: int 120–230 | null, zoneUpperBpm?: [4 ints 60–230, strictly increasing] | null}` on an intake, a review or a restart.

**How the record behaves:**

- It is refused whole on any error.
- It is never coerced, rounded or repaired.
- A backdated row is refused.
- An unchanged value is not appended again.
- It is bounded at 128 rows.

**Through the integration boundary (`createIntegration`):**

- `heartRateProfileRecord` is one of `CARRIED_RECORDS`. A record stored before this amendment reads as `[]`.
- A new operation: `setHeartRateProfile({actor, clientRequestId, expectedVersion, heartRateProfile})`.
  - It answers `{ok, version, heartRateProfile: {added, unchanged}, fiveZones: {status, reason}}`, plus `replayed` on a retry.
  - It does not ask the engine.
  - It records no custody decision and changes no plan.
  - It writes the profile record and the re-resolved reading in one carried commit at the same custody version.
  - It is idempotent by request id.
  - It refuses with `INVALID_REQUEST` (with `fields`), `CONFLICT_STALE_VERSION`, `CONFLICT_IDEMPOTENCY_KEY` or the read errors.
- **`eraseHeartRateProfile({actor, clientRequestId, expectedVersion})`** (QRE-HR5R-08): erases every maximum and limit the athlete entered, history included, and answers `{ok, version, erased: [eventId], fiveZones}`. The intake age stays: it is onboarding data, erased with the account.
- **Both operations:**
  - require **COACHING consent** (`CONSENT_REQUIRED` otherwise, QRE-HR5R-03; whether HEALTH_SIGNALS should also govern this data is an open G07 / Founder question);
  - are refused whole on any error;
  - give a typed `OPERATIONAL_ERROR` or `PERSISTENCE_FAILURE` on a fault, with nothing written.
- **Readings after an erasure** (QRE-HR5R-01): when an erasure of health facts left the stored readings null, a heart-rate write keeps them null, so a resent report goes back to the engine.
- **Readings' time:** a heart-rate write never moves the readings' time.
- **Accept** (QRE-HR5R-02): adopting a pending change keeps the profile record in force.
- **Enroll and restart** (QRE-HR5R-05):
  - an intake that carries any carried record (`runFormatRecord`, `runHistoryRecord`, `runEvidenceRecord`, `heartRateProfileRecord`) is refused (`INVALID_REQUEST`, `fields`);
  - so is an intake with an invalid `heartRateProfile`;
  - a first plan never reads a record from its input.
- **Carried sequence and anchor** (QRE-HR5R-06):
  - the carried document has `seq`, one more on every carried commit;
  - the external anchor now stores `{version, docMac, carriedSeq}`;
  - an older carried blob at the same custody version is `RECORD_ROLLED_BACK`;
  - an anchor written before this has no `carriedSeq` and checks none;
  - **native (A):** the Keychain anchor stores the JSON whole (`NativeCustody.swift`), so nothing changes there; a port that stores only `{version, docMac}` must keep `carriedSeq` too.
- **Time:** the profile record reads every time in the plan's offset (QRE-HR5R-04).
- **Accepted risk:** two processes writing one store can still race on a same-version carried commit; the device's single serial queue prevents it in-process, and the server store is PENDING.
- `api.mjs` passes `setHeartRateProfile` and `eraseHeartRateProfile` through; over a bare custody they answer `NOT_SUPPORTED`.

## 2. Swift (proposal delta, mission copy only)

These changes are in `proposals/CoachingPresentation` (a copy of CHG-UI-1 plus V1HR5's delta). Every new field is optional, so revision-1 and frozen readings still decode.

**`HeartRateFiveZones` gains:**

- `provenance`, `boundarySource`, `threeDomains`;
- `notUsed: [HeartRateNotUsed]`, `measuredReferences: MeasuredHeartRateReferences`, `profile: HeartRateProfileSummary`;
- `measurements: [HeartRateMeasurement]`, `measuredHeartRate`, `liveHeartRate`;
- `changesThePlan`, `medicalEvidence`, `releasesASafetyBlock`;
- `ageOutsideEstimateRange`, `customLimitsReachTheMaximum`.

**Other types:**

| Type | Change |
|---|---|
| `HeartRateReference` | Gains `provenance`, `formula`, `ageYears`, `ageDeclared`, `ageDeclaredOn`, `declaredAt`. |
| `FiveZone` | `domain` becomes optional (revision 1 only); gains `minBpm`, `maxBpm`, `abovePercent`, `upToPercent`. |
| `SessionHeartRate` | Gains `reference`, `boundarySource`. |
| `HeartRateProfileRequest` (new) | Encodable; a nil value encodes as `null`, which clears; an omitted field is left as it is. |
| `HeartRateProfileAnswer` (new) | Decodable. |

**Tests:**

- `FiveZoneDecodingTests` was rewritten (4 tests) over this mission's captures (`probes/out`, production authority):
  - age 30 with no device;
  - strap above and below the estimate, lab, conflict, optical;
  - declared and custom maxima, no age, a hold;
  - backward compatibility three ways: frozen, revision 1, revision 2.
- `FrozenShapeDecodingTests` is unchanged (6 tests) and passes over the corrected engine's captures.
- **10/10 on the Mac.**

## 3. Incorporation checklist (A/B/C)

| Where | Change |
|---|---|
| CoachingCore runtime | Take these files at the bytes REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2 binds:<br>• `src/v1-heart-rate-zones.mjs`, `src/v1-heart-rate-profile.mjs`, `src/v1-safety-index.mjs`, `v1/HEART_RATE_FIVE_ZONE_V2.json`;<br>• `src/boundary/integration.mjs`, `src/boundary/api.mjs`, `src/boundary/inventory.mjs`;<br>• `audits/v1-hr5-runna-parity-2026-11-25/reviews/ssctr/SSCTR_HR5R_RECORDS.json`.<br>`src/v1-run-calibration.mjs` is unchanged from the first amendment. The revision-1 values and records stay on disk as history; the runtime no longer reads them. |
| App bundle (A) | Rebuild with the linker: 50 modules, 18 assets. Run the device equivalence gate on the new bundle (`native/build.sh` shows how). |
| CoachingHost (A) | 1. Keep `heartRateProfileRecord` in the carried store. It comes for free through `createIntegration`.<br>2. Expose `setHeartRateProfile` and `eraseHeartRateProfile` as host calls beside the other athlete operations, on the same serial queue.<br>3. Keep the anchor's `carriedSeq`.<br>4. Collect `athlete.ageYears` at onboarding. It already exists in R6-INTAKE-1 (18–80). An intake that only states "adult" (`ageEligible`) gets `AGE_REQUIRED`.<br>5. Optionally pass `heartRateProfile` in the onboarding intake. |
| `IntegrationContracts` (A/B) | No change by this mission. When A/B incorporate it, they add `setHeartRateProfile` to the host port and `heartRateProfileRecord` to the carried-records list, by their own coordinated change. |
| HealthKit (B) | No change now. When a heart-rate series channel is reviewed (SSCTR C10), use `classifySamples` with its sensor and source. Until then, `sessionDistribution` stays UNAVAILABLE, and a synced watch is never read as live heart rate. |
| `CoachingPresentation` (C, CHG-UI-1) | Take `HeartRateFiveZones.swift` from this mission's proposal. FND-HR5-03 is still open (`StrengthExposure.descriptiveOnly` optional). |
| UI (C), Figma 50/71 | Show Z1–Z5 only from the engine's `zones`, as `minBpm`–`maxBpm`, with the reference's disclosure. "Máxima informada" is now a real input (`setHeartRateProfile`), and custom limits are an edit screen with the ordering check done by the engine. "Tempo por zona" stays `FUTURE_ONLY`. SSCTR conditions for screens:<br>• **C1:** an unused strap value more than 5 bpm above a declared maximum is shown beside it.<br>• **C2:** under a conflict, show both values and offer manual entry.<br>• **C3:** keep the size and direction of the age-estimate error, and "you can enter your own".<br>• **C4:** cue copy: "consider slowing", never "speed up", no alarm styling.<br>• **C5:** a cue from an estimated or declared maximum carries its disclosure.<br>• **C7:** one cue per session; the five-zone cue replaces the three-zone one where both exist.<br>• **C8:** Z1–Z5 or neutral names, never "Tempo", "Threshold" or "Anaerobic".<br>• **C9:** a single value is "highest recorded heart rate, in Zx" with its sensor.<br>• **C11:** heart rate never suggests rest, illness or overtraining. |
| Fixtures | Regenerate `j5`, `p16`, `focal`, `core`, `int`, `final` and `hmac` with the historical oracles. Replace `hr5.json` with this mission's (98 steps) and take `FiveZoneTests.swift` from this mission's copy (111 maxima, ages 18–80). |
| Open (A + SEC) | FND-HR5-01 is still open: the frozen custody refuses `runEvidence` in a review. A measured reference reaches the engine only through intake anchors and the plan's race rows. `setHeartRateProfile` does not depend on it. |
