# REPMILE — Five-Zone Heart Rate Intelligence V1: final report

Mission V1HR5, [Founder request](FOUNDER_REQUEST.md) of 2026-11-25, executed on the Mac mini M4. All athletes and records are synthetic.

## 1. Initial Git state

- `origin` is `GabrielCarvalhoM/MyApp`; `fetch --all --prune --tags` ran.
- Every referenced branch was local and on the remote at the same commit, and every worktree was clean:
  - `claude/v1-cc-final-physical` `a7e2e24`
  - `claude/v1-parallel-foundation` `077f031`
  - `claude/v1-ui-functional-reconciliation` `476b657`
  - `claude/v1-ios-coachinghost` and `claude/v1-ios-healthkit`, both at `8d2a7c0` and not started
- Tag `v1-parallel-base-2026-11-24` → `8d2a7c0`.
- Ancestry is linear: `460a9ab` → `6482749` → `a7e2e24` → `8d2a7c0` → `077f031` → `476b657`.

Details: [BASELINE_AUDIT.md](BASELINE_AUDIT.md).

## 2. Baseline and worktree

- New branch `claude/v1-five-zone-heart-rate` from **`476b657`**, in its own worktree `~/.codex/worktrees/myapp-v1-five-zone/MyApp`.
- The original freeze verifier on the base: **87/87**, bundle `9cf3149b…` as recorded.
- Baseline suite in a pristine detached checkout: **1942 / 1895 / 47**, the same 47 distinct failing titles as the freeze record.
- The historical linker rebuilds the frozen bundle byte for byte.

## 3. Five-zone method

From SSCTR-HR5-DECISION-r1 ([summary](SCIENCE_AND_CALIBRATION_DECISION.md)):

- **Zones:** Z1–Z5 as fixed per-mille fractions **720 / 800 / 870 / 920** of one reference maximum heart rate.
  - Edges use integer half-up arithmetic, equal to the three zones' `Math.round` for 140–220 bpm.
  - Intervals are `[from, to)`, open at both ends.
  - 186 bpm gives < 134 / 134–148 / 149–161 / 162–170 / ≥ 171.
- **Reference:**
  1. a lab maximum: a declared running test, chest strap or ECG, RPE ≥ 8, tolerated, ≤ 182 days, no break since;
  2. otherwise the approved chest-strap maximum observed in a hard race or test (Q6(b)).
- **Never used:** age, heart-rate reserve, a declared maximum, an average, an optical sensor.
- **Conflict:** a strap maximum more than 5 bpm above the lab maximum gives `REFERENCE_CONFLICT` (no zones, both shown). Lower-wins was refused.
- **Confidence:** LOW for every reference and for the zone model; every value is `estimated`, with full provenance.
- **Prescription:**
  - effort governs every session, and heart rate is **never primary in V1**;
  - a sustained Z4+ reading may suggest slowing in EASY, LONG, RECOVERY and SHAKEOUT runs (and EASY_REESTABLISHMENT in EASY mode); it never suggests speeding up and has no health meaning;
  - there is no heart-rate guidance in threshold, race-specific, interval, stride or race sessions; none in walk/jog, restart or return; none during a hold.
- **Time in zone:** `UNAVAILABLE`, because V1 carries no heart-rate series. A classifier is ready for a future reviewed channel but not wired.

## 4. The three physiological domains

They are preserved:

- `heartRateZones` (LOW / MODERATE / HIGH) is unchanged: `heartRateOf` is byte-identical and the output is equal.
- The five zones **nest** in them: Z1+Z2 = LOW, Z3 = MODERATE, Z4+Z5 = HIGH. The shared edges are the same bpm.
- The within-domain splits carry no sporting role, so no artificial domain was created.
- The only behavioural use of the zones (the slow-down cue) sits on the approved HIGH boundary.

## 5. Files and contracts changed

| File | Change |
|---|---|
| `CoachingCore/src/v1-heart-rate-zones.mjs` | new: the zones, references, conflict, session roles, classifier, fail-closed authority |
| `CoachingCore/src/v1-run-calibration.mjs` | amended: a 9-line additive diff (import; zones and roles computed beside the guidance; one output key) |
| `CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json` | new: pinned values `387d66a7…` |
| `audits/…/reviews/ssctr/SSCTR_HR5_RECORDS.json` | new: enabling records (SSCTR-HR5-RECHECK-r1) |
| `CoachingCore/scripts/v1-five-zone-amendment.mjs`, `CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json` | the amendment verifier and record |
| `CoachingCore/test/v1hr5-five-zones.test.mjs` (26), `v1hr5-amendment-record.test.mjs` (2) | tests |

- **Contract:** additive `runCalibration.heartRateFiveZones` ([CONTRACT_DELTA.md](CONTRACT_DELTA.md)).
- **Shared contracts:** none changed. `IntegrationContracts`, the A/B handoffs, the parallel contract, the A/B worktrees, `CURRENT_MISSION.md`, the historical audits and the freeze record are all byte-identical to the base. The Swift delta lives in the mission's copy of CHG-UI-1.

## 6. Node tests

| Run | Tests / pass / fail |
|---|---|
| Baseline `476b657` | 1942 / 1895 / 47 |
| Amended `822e2c0` | 1968 / 1920 / 48 |
| With the record `f363a25` | **1970 / 1922 / 48** |

- The one failure beyond the 47 is the original freeze-record test, which fails **by design**. Its successors pass.
- **Regression proof:** ADDITIVE_ONLY over 326 recorded boundary steps with the five zones on, 0 unexplained.

Details: [TEST_REPORT.md](TEST_REPORT.md).

## 7. macOS JavaScriptCore

- **P0Host package:** 29 tests, 0 failures (6 phase tests skipped by design).
- **Every fixture 0 DIVERGED:** final (57 IDENTICAL + 127 EXPLAINED_LIBM, the frozen pattern), int, **hr5** (memory and native store + Keychain), core (24 journeys).
- **Five-zone module:** identical to Node for all 81 maxima.

Details: [NATIVE_VALIDATION_REPORT.md](NATIVE_VALIDATION_REPORT.md).

## 8. Swift tests

**CoachingPresentation delta: 9/9.**

- The frozen-shape tests pass over the amended captures.
- The five-zone decoding tests cover strap, lab, conflict, none, hold and strides, with no safety field lost, and backward compatibility both ways.

## 9. iPhone

iPhone 17 Pro Max, iOS 27.2.1, Release, no debugger, through the device lock, bundle `2f69066416cdec4e`:

| Test | Result |
|---|---|
| Equivalence | 5/5 |
| BoundaryTests (pt-BR) | 9 run, 0 failures |
| Five-zone tests (en-US) | 3/3 |
| Core Safety en/pt-BR | 0 DIVERGED |
| Process death A and B | recovered |
| PF-0 | 10/10 PASS (review p95 294.6 ms vs 285.4 frozen) |

**Not run:** the locked-device and reinstall phases (both need a person or delete the host app), and HealthKit (out of scope).

## 10. Regressions found and corrected

- **FND-HR5-02:** the pure zone function accepted an impossible maximum (found by the JSC unit check; no output was affected). Fixed.
- **Review cycle:** QRE-HR5-01 to 15 and SSCTR R-01 to R-03 and RC-01 to RC-03 were dispositioned in [INDEPENDENT_REVIEW.md](INDEPENDENT_REVIEW.md):
  - session-role order;
  - fault isolation;
  - own-key lookup;
  - classifier limits;
  - `onlyInMode`;
  - the regression harness's allowances;
  - the redirect guard;
  - the stale native package.
- **Process errors, corrected before publication:**
  - a contaminated baseline run was discarded;
  - the first native package was built from draft values and rebuilt;
  - a local path in two review files was redacted before any push.

## 11. Security and compatibility

- **Integrity:** the carried MAC covers the new reading; a tampered five-zone value gives `INTEGRITY_FAILURE`, on device too.
- **Input surface:** no new input channel. The device channel still sends no heart rate (G-1).
- **Authority:** the dev authority is not reachable from requests. The values are read only as the pinned bytes, and the boundary is off without an independent record.
- **Compatibility:** stored records from before the amendment decode unchanged. An absent key is read relative to `runCalibration.status`, and there is no silent migration.
- **Privacy:** there is no PII in the committed files.
- **Open:** a Security review of heart-rate and lab data before real athletes.

## 12. The original freeze

**Preserved.** `FINAL_RELEASE_FREEZE_V1.json` is byte-identical to `6482749`, and its verifier passes 87/87 on `476b657`. On this line it fails by design, only on the declared files. The amendment record REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1 binds 90 files and the amended bundle ([FIVE_ZONE_AMENDMENT.md](FIVE_ZONE_AMENDMENT.md)).

## 13. Published

- **Branch:** `claude/v1-five-zone-heart-rate` on `origin`. It was pushed once with no force, and the remote was verified equal to local at `85b5aa1` (`git ls-remote`).
- **Commits:**
  - `1c5d29b` candidate
  - `822e2c0` review cycle
  - `dec5ad5` native validation
  - `bec39c5` record
  - `f363a25` successor fix
  - `85b5aa1` closing evidence
  - plus the commit that adds this report, pushed and verified the same way.
- No merge.

## 14. Changes required in the A/B/C foundation

Per [CONTRACT_DELTA.md §3](CONTRACT_DELTA.md):

- **A:**
  - take the 3 runtime files and the records file;
  - rebuild the app bundle (49 modules, 18 assets) and rerun the device equivalence gate;
  - carry `lab.modality` and the lab `heartRate {maxBpm, sensor}` in the intake struct only as real declarations (R-04).
- **B:** no change. No heart-rate permission or field.
- **C:**
  - add `HeartRateFiveZones` and `RunCalibration.heartRateFiveZones` to CHG-UI-1, and make `StrengthExposure.descriptiveOnly` optional (FND-HR5-03);
  - show Z1–Z5 only from the engine, with the session roles from `heartRateFiveZones.sessions`, never on strides;
  - keep "máxima informada" hidden and "tempo por zona" `FUTURE_ONLY`;
  - follow the Product copy conditions (R-08).
- **Fixtures:** regenerate them with the historical oracles (`native/build.sh` shows how) and add `hr5.json` and `FiveZoneTests.swift`.

## 15. Still open

- FND-HR5-01: the boundary refuses `runEvidence` (contract-closure mission, A + SEC).
- FND-HR5-03 (C).
- R-04: `lab.modality` collection.
- R-08: copy.
- A Security review of heart-rate and lab data.
- HQ-V1HR5-SSCTR-ZONES: funded-human revalidation (proposed). Review by 2027-05-11.
- Clinical heart-rate modifiers (ASK).
- Locked-device and reinstall phases not rerun.
- Unmixed, from earlier: `specialPopulation`, unplanned strength, the GPS path (GAP-16), the backend.
- **REAL_ATHLETE_READY = NO.**

| Critério | Resultado |
|---|---|
| GIT_BASELINE_VERIFIED | YES |
| WORKTREE_ISOLATED | YES |
| ORIGINAL_FREEZE_PRESERVED | YES |
| FIVE_ZONE_MODEL_IMPLEMENTED | YES |
| SCIENCE_METHOD_APPROVED | YES: provisional internal SSCTR authority (APPROVE_WITH_CONDITIONS, SUPPORTED_WITH_LIMITS); not human or clinical validation |
| FIVE_ZONE_CALIBRATION_TESTED | YES |
| FIVE_ZONE_PRESCRIPTION_VALIDATED | YES: the role of heart rate (never primary; a slow-down cue in easy running), with SSCTR conditions |
| WATCHLESS_FALLBACK_PRESERVED | YES |
| SPORTS_REGRESSION_CLEAR | YES |
| SECURITY_REGRESSION_CLEAR | YES: for the change (QRE/Security C1–C6 met); a Security review of HR/lab data before real athletes stays open |
| MACOS_JSC_VALIDATED | YES |
| SWIFT_CONTRACT_VALIDATED | YES: the proposal delta (mission copy), not a shared package |
| IPHONE_PHYSICAL_VALIDATED | YES: locked-device and reinstall phases not run |
| AMENDMENT_DOCUMENTED | YES |
| REMOTE_BRANCH_PUBLISHED | YES |
| READY_FOR_A_B_C_CONSOLIDATION | YES: as the input in §14; the open items do not block consolidation |
