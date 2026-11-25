# QRE + Security review: V1HR5 five heart-rate zones (commit 1c5d29b)

- **Reviewer:** independent QRE + Security (did not write the change). Worker is not judge: this review edits no code, test, data or fixture.
- **Under review:** `1c5d29b` on `claude/v1-five-zone-heart-rate`, base `476b657`. The sporting rules are `ssctr/SSCTR_HR5_DECISION.json` (`values`). Sports science is reviewed separately. This review covers engineering, regression, contract and security, and whether the code implements those values.
- **Date:** 2026-11-25. Mac mini, Node v24, Swift 6.4.2. The physical iPhone was not used.
- **Machine-readable findings:** `QRE_SEC_HR5_REVIEW.json`.

## Verdict

**READY_WITH_CONDITIONS.** Conditions C1, C2 and C3 block. The commit must not be used as integration input, and no enabling record may be appended, until they are met.

The CoachingCore change itself (`src/v1-heart-rate-zones.mjs` and the 3-hunk change to `src/v1-run-calibration.mjs`) has no blocking defect:

- It implements the decision's machine values.
- It is additive. The frozen-vs-amended replay is reproduced as ADDITIVE_ONLY.
- It fails closed.

The **committed native package is NOT_READY as committed** (QRE-HR5-01). Its bundle, assets and fixtures were built from a draft of the values file and the module. It fails its own `FiveZoneTests` on the Mac JavaScriptCore.

| # | Condition | Findings |
|---|---|---|
| C1 (blocking) | Regenerate the mission native package with `native/build.sh` from the committed tree, then commit it. Add a post-build check that the tree is unchanged, and that the bundled `HR5_SHA256` equals the CoachingCore pin. | 01 |
| C2 (blocking) | Declare the amendment against `REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE`: add a successor/amendment record and verifier, or state explicitly that this candidate sits outside the freeze. Commit the amended-tree suite result: 48 failures, the 47 baseline ones plus the freeze-record test. | 02 |
| C3 (blocking) | Correct `CONTRACT_DELTA.md` to match the emitted shape: conflict, rounding, reasons, missing referenced files, and where the session roles live. | 04 |
| C4 | Add a boundary-ON variant of the evidence: the hr5 oracle, `FiveZoneTests` and the regression diff, with the five-zone authority injected as `capture-hr5.mjs --dev` does. Do this before the enabling record is appended. | 03, 09 |
| C5 | Make the session-role precedence match the reading's: pass the run calibration's HR boundary into `sessionHeartRate` and use one order for hold and authority. Route the NO_ZONES-state interpretation to SSCTR. | 05 |
| C6 | Swift proposal: decode at least `strides`, `source` and `notes`. State the absent-key rule relative to `runCalibration.status`. | 06, 07 |

## What was run (reproducible)

| Check | Result |
|---|---|
| `cd CoachingCore && node --test test/v1hr5-five-zones.test.mjs` (scratch worktree at 1c5d29b) | 22/22 pass |
| Full `node --test` in CoachingCore at 1c5d29b | 1964 tests, 1916 pass, 48 fail. Against the recorded baseline (`results/node/suite-baseline-476b657.txt`, 47 failures / 48 titles), the only **new** failure is `REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE: RC-1 preserved but for the two declared amendments; …` |
| `node scripts/v1-final-release-freeze.mjs --check` at 1c5d29b | **exit 1**: `CHANGED and not declared: src/v1-heart-rate-zones.mjs, src/v1-run-calibration.mjs, test/v1hr5-five-zones.test.mjs, v1/HEART_RATE_FIVE_ZONE_V1.json`; `bundle module not the bound source: src/v1-run-calibration.mjs`. At 476b657 it passes (87/87, bundle 9cf3149b…) |
| `regression-diff.mjs --old <pristine 476b657> --hr5 …/Fixtures/hr5.json` | ADDITIVE_ONLY. 326 steps (int 78, final 184, hr5 64). Allowed: 428 added keys, 428 run-calibration hashes, 408 carriedMac. 3 steps skipped (the hr5-strap tamper window). 0 unexplained |
| `native/build.sh` in a scratch worktree at 1c5d29b | **12 committed files change**: `coachingcore-p0.js`, `assets-manifest.json`, `build-manifest.json`, the five-zone asset, the core/final/focal/int/j5/j5-answers/p16 fixtures, and a new records asset. A second run then gives no diff. The historical package stays clean (`git status --ignored`) |
| `mac/hr5-oracle.mjs` | `fiveZoneBoundaryOn: false`. Every journey is `EXTENSION_NOT_ENABLED`, except `hr5-hold` (`HOLD_NO_PRESCRIPTION`). hr5.json is unchanged |
| `probes/capture-hr5.mjs --dev` | No diff: the committed probes are current |
| `swift test` of `proposals/CoachingPresentation` (scratch build path) | 9/9 pass |
| `swift test --filter FiveZone` of the mission P0Host package, **as committed** | **3/3 FAIL**: "assets asked for but not bundled: audits/v1-five-zone…/SSCTR_HR5_RECORDS.json", "DIVERGED steps", and the units differ from Node |
| The same after regeneration (C1) | 3/3 pass (memory and native file + Keychain store, units identical, 81 maxima) |
| Adversarial probes (`scratchpad/qre/probe1.mjs`, `probe2.mjs`) | Results under the findings below |

All scratch worktrees I created were removed. The pre-existing `scratchpad/baseline-476b657` worktree is not mine and was left in place.

An untracked `audits/v1-five-zone-heart-rate-2026-11-25/SCIENCE_AND_CALIBRATION_DECISION.md` appeared in the reviewed worktree during this review, timestamped 10:27, after the 10:26 commit. It was written by another session. It is not part of 1c5d29b and was not reviewed.

## 1. Correctness against the decision's `values`

Every machine value was checked against the code and by execution:

- **Arithmetic:** `floor((bpm×perMille+500)/1000)`, integer per mille. The 800 and 870 per-mille edges equal the three-zone `Math.round` for 140–220, including the 0.87 half case at 150 bpm. The worked examples give 190→137/152/165/175, 150→108/120/131/138, 140→101/112/122/129 and 220→158/176/191/202.
- **Intervals:** `[from, to)` with Z1 open below and Z5 open above. A reading of 165 against a 190 reference falls in Z4.
- **Reference order:** lab, then observed.
- **Lab rules:**
  - 182 days, no declared break of 14 days or more, the hold/return floor;
  - plausible range 140–220;
  - CHEST_STRAP or ECG;
  - RPE of 8 or more; completed not false; tolerated not false;
  - declared running modality, normalised.

  A cycle-ergometer lab with an observed maximum uses the observed maximum. A cycle-ergometer lab alone gives `LAB_MODALITY_NOT_RUNNING_OR_UNKNOWN`.
- **Observed rule:** identical to the three-zone filter (Q6(b)).
- **Conflict:** observed minus lab > 5 gives `REFERENCE_CONFLICT`. A difference of 5 is inside the band and 6 is a conflict. A lab maximum above the observed one is used. The conflict output carries all seven fields of the decision's conflict output.
- **Confidence and disclosures:**
  - confidence is LOW/LOW, and `estimated: true`;
  - the notes are set per reference;
  - disclosures are ZONES, the reference kind, and NEWER_RUNNER for NONE or NOVICE. An undeclared experience defaults to NOVICE, which errs towards disclosure.
- **Session use:**
  - the family roles and reasons match the decision;
  - the Z4 cue applies to EASY, LONG, RECOVERY_EASY, SHAKEOUT and EASY_REESTABLISHMENT;
  - strides carry NO_HEART_RATE_GUIDANCE;
  - an unknown family gives NO_HEART_RATE_GUIDANCE with UNKNOWN_FAMILY_FAIL_CLOSED.
- **Updating:** changes only at a week boundary. A probe confirmed a 179-day lab gives way to the observed maximum in the next week.
- **Determinism:** same input, same bytes.
- **No throw found** with admitted or malformed input: bad bpm types, malformed records, prototype-named families, odd series.

The deviations found are LOW or INFO: 05, 11(e), 12, 13, 15.

## 2. Regression

The engine diff is minimal:

- one import;
- `effortOnly` hoisted unchanged;
- one `hr5Sessions` entry per session;
- one output key.

Nothing reads the new output. I reproduced the frozen-vs-amended replay: only the key, the run calibration's `hash` and `carriedMac` move, and the regenerated native fixtures change only in digests that cover them.

**Harness soundness:**

- **The `hash` allowance is narrow.** It applies only on an object that gains `heartRateFiveZones`.
- **The `carriedMac` allowance is unconditional (09).** The carried content is still compared in full, so a content change cannot hide. A MAC-scheme regression could hide.
- **The tamper-window skip is justified.** The target string `"reason":"EXTENSION_NOT_ENABLED"` does not exist in the frozen document, so every occurrence in the amended document is inside the new reading. The window is closed by `raw.restore`, and it covers only `raw.tamper`, `it.read` and `api.plan`. The harness should fail if a window is still open at the end of a journey.
- **The proof covers the boundary OFF only (03).**

## 3. Fail-closed authority

These held under test:

- **Pin.** The values are pinned (`11440a13…`), and one extra byte gives no values.
- **Enabling records.** The records must be bound to that hash, independent, enabling, with supported evidence and at least one source. A records file that is missing, empty, `{}`, `{records:'x'}` or full of junk entries enables nothing.
- **Both run-calibration boundaries required.** With HR or CAPACITY off there are no zones, and with CAPACITY off the key is absent.
- **Dev authority unreachable from production.** `options.heartRateFiveZone` and `heartRateFiveZoneRecords` come only from the caller of the engine. Custody calls the engine with no options or `{withhold}` (`custody.mjs:233/271/344`), so a request cannot reach dev authority.
- **JSC asset bundling.** The linker picks up both new data files on a fresh build (18 assets).

The committed bundle lacks the records asset and pins the draft hash `2878eb…`, so it can never be enabled: it is fail-closed, but it is wrong evidence (01).

A record with `sourceIds:['']` counts as having a source. That is the same rule as the run calibration (INFO, 14).

## 4. Security and privacy

- **Integrity.** The carried MAC covers `canonical(carried)`, which includes `readings.runCalibration.heartRateFiveZones` (`integration.mjs:65`). A tampered five-zone value gives `INTEGRITY_FAILURE` (journey hr5-strap, Node and Mac JSC after regeneration).
- **Input channels.** No new input channel. `runEvidence` is still refused by the boundary (FND-HR5-01), IntegrationContracts is byte-identical, and there is no HealthKit or permission change.
- **Data handling.**
  - The new reading duplicates data that is already carried: the heart-rate maximum, the lab protocol and the lab source.
  - The lab `source` is athlete-supplied free text, and it is now copied into a second reading.
  - Erasure clears the readings, the new key included (`integration.mjs:122`).
- **No PII** in the committed files: synthetic athletes only; the repository owner's handle appears in `BASELINE_AUDIT.md`.
- **Redirect preload.** It refused every write outside the mission copy in this run, and the historical tree stayed clean, including ignored files. Its guard is an allow-list of sync APIs, and the post-check does not see untracked files (10).

## 5. Contract

The Swift change is additive: one optional `RunCalibration.heartRateFiveZones` and a new file. `FrozenShapeDecodingTests` is unchanged and passes over the amended captures. `IntegrationContracts` is untouched.

`CONTRACT_DELTA.md` has material inaccuracies (04). The "absent key = not computed" rule needs a qualifier (07). The Swift types drop fields a UI needs (06).

## 6. Test adequacy

The Node tests are thorough on the decision's values. The gaps are:

- the boundary-ON integration and JSC path (03);
- session roles under a boundary that is off (05);
- the production-authority path end to end;
- lab expiry and the floor;
- classifier parameter edges.

There are also weak assertions (11).

One assertion is self-referential under the dev authority: `test:64`, `z.sha256 === HR5_FILE_SHA256`. The pin is tested separately at `test:30–32`.

## Findings

| ID | Sev | File:line | Summary |
|---|---|---|---|
| QRE-HR5-01 | HIGH | `native/ios/Sources/P0Host/Resources/coachingcore-p0.js:9186` | Committed native package built from a draft: the bundle pins `2878eb…` (revision 0, `DRAFT_PENDING_SSCTR_DECISION`), the records asset is missing, 7 fixtures are stale, and `FiveZoneTests` fails 3/3 on Mac JSC. `build.sh` claims "run twice, no diff", but the first run changes 12 files |
| QRE-HR5-02 | MEDIUM | `CoachingCore/scripts/v1-final-release-freeze.mjs` (`--check`) | The frozen release verifier and its suite test now fail. No amendment or successor record exists; `CONTRACT_DELTA §3` names a nonexistent `CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json`. No amended suite result is committed |
| QRE-HR5-03 | MEDIUM | `mac/hr5-oracle.mjs:29` | All native and integration evidence runs with the boundary OFF. Every `if(ON)` assertion is dead, so JSC never runs the AVAILABLE, lab, conflict or cue paths through the boundary. The regression proof is OFF-only too |
| QRE-HR5-04 | MEDIUM | `CONTRACT_DELTA.md:32-35,67,104` | The delta does not match the code: conflict shape and status, rounding, the reason list (omits `LAB_MODALITY_NOT_RUNNING_OR_UNKNOWN`/`REFERENCE_CONFLICT`, lists the never-emitted `CONFLICTING_REFERENCES`), two missing referenced files, and "a session's `heartRate` role" |
| QRE-HR5-05 | LOW | `CoachingCore/src/v1-heart-rate-zones.mjs:189-198` | Session roles ignore the run calibration's HR boundary: with HR off, THRESHOLD sessions still carry NO_HEART_RATE_GUIDANCE. Hold and authority are checked in opposite orders by the reading (line 160) and by the sessions (line 193). In no-zone states, non-cue families keep their family role (decision `states.NO_ZONES` is ambiguous) |
| QRE-HR5-06 | LOW | `proposals/.../HeartRateFiveZones.swift:80` | The Swift types drop `strides` (a UI could apply the Z4 cue to strides), `disclosure`, `effortConflict`, `source`, `notes` and `sha256` |
| QRE-HR5-07 | LOW | `HeartRateFiveZones.swift:8`; `v1-run-calibration.mjs:565` | The key is also absent when the amended engine's calibration is DISABLED, NOT_APPLICABLE or CALIBRATION_ERROR, and the version is unchanged. "Absent = older engine" is not decidable without `runCalibration.status` |
| QRE-HR5-08 | LOW | `CoachingCore/src/v1-run-calibration.mjs:586` | No fault isolation: a throw in the five-zone code would turn the whole run calibration (three zones, pace bands, guidance) into CALIBRATION_ERROR. None was found |
| QRE-HR5-09 | LOW | `evidence/regression-diff.mjs:54` | The `carriedMac` allowance is unconditional, and a tamper window left open at the end of a journey would silently skip the rest of it |
| QRE-HR5-10 | LOW | `native/redirect.mjs:26-32`; `native/build.sh:16` | The preload guards only some sync fs APIs. The post-check `git diff --quiet` misses untracked and ignored files in the historical tree. No breach in this run |
| QRE-HR5-11 | LOW | `CoachingCore/test/v1hr5-five-zones.test.mjs:42-45,64,200`; `v1-heart-rate-zones.mjs:107,117` | Test gaps: sessions under HR off, the production-records path end to end, lab expiry and floor, a conditional NOVICE test. Classifier accepts limits of 0 or reversed, giving AVAILABLE with 0 coverage, and a duration shorter than the series gives covered > duration |
| QRE-HR5-12 | INFO | `v1-heart-rate-zones.mjs:143,145` vs `v1-run-calibration.mjs:482,485` | The three-zone and five-zone readings can name different evidence: the newest lab of any modality versus the newest qualifying running lab, and a different tie-break between observed maxima |
| QRE-HR5-13 | INFO | `v1-run-calibration.mjs:101`; `v1-heart-rate-zones.mjs:196` | A fractional bpm is rounded before the plausibility check (139.5 → 140 is accepted; inherited behaviour). A prototype-named family gives NONE/UNKNOWN_ROLE instead of UNKNOWN_FAMILY_FAIL_CLOSED |
| QRE-HR5-14 | INFO | `src/boundary/integration.mjs:65,122` | Positive checks (MAC coverage, no new channel, erasure, no PII, dev authority not reachable). Also: `sourceIds:['']` is accepted, and the key adds about 19 KB to a 72 KB run calibration (16 weeks, 48 sessions); performance budgets were not re-measured |
| QRE-HR5-15 | INFO | `CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json:65` | The decision's `EASY_REESTABLISHMENT.onlyWhen` ("plan in EASY mode") is not encoded. It is covered in practice: the family comes only from the r4 re-establishment path and effort-only modes withdraw the zones. Raised for SSCTR |

### Reproductions (abridged; full text in the JSON)

- **01.**
  1. `shasum -a 256 CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json native/ios/Sources/P0Host/Resources/assets/CoachingCore__v1__HEART_RATE_FIVE_ZONE_V1.json` gives `11440a…` vs `2878eb…`. The bundled file has `"revision": 0` and `"status": "DRAFT_PENDING_SSCTR_DECISION"`.
  2. In a worktree at 1c5d29b, `cd native/ios && swift test --filter FiveZone` fails 3/3. After `native/build.sh` it passes 3/3.
- **02.** At 1c5d29b, `cd CoachingCore && node scripts/v1-final-release-freeze.mjs --check; echo $?` prints 1. `node --test` shows the one new failing title.
- **03.** `node mac/hr5-oracle.mjs` prints `"fiveZoneBoundaryOn": false` and every summary is `EXTENSION_NOT_ENABLED` (hr5-hold: `HOLD_NO_PRESCRIPTION`).
- **05.** `X.generateProgram(runner({anchors:[10K with CHEST_STRAP 186]}), {...DEV, heartRateFiveZone: devFiveZone(), runCalibration: devRunCalibration(all but V1X-RUN-HR)})`:
  - the reading is `EXTENSION_NOT_ENABLED`;
  - 9 THRESHOLD sessions are `NO_HEART_RATE_GUIDANCE:ZONES_ARE_NOT_INDIVIDUAL_THRESHOLDS`.
- **12.** Anchors: lab `labRun` (running, 190, 60 days) and lab `labCyc` (CYCLE, 170, 20 days). The three-zone `reference` is `labCyc` and the five-zone `reference` is `labRun`.
