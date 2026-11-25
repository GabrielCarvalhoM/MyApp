# REPMILE — HR5 Runna parity correction: final report

Mission V1HR5R: the [Founder decision](FOUNDER_REQUEST.md) of 2026-11-25, executed on the Mac mini M4. All athletes and records are synthetic.

## 1. Git and isolation

- `fetch --all --prune` ran. `claude/v1-five-zone-heart-rate` was at `4850560` locally and on `origin`, with no successors.
- The previous worktree and the A/B worktrees were clean and were not touched.
- A new branch `claude/v1-hr5-runna-parity` was created from `4850560` in its own worktree, `~/.codex/worktrees/myapp-v1-hr5-runna/MyApp`.
- Read before changing anything:
  - V1HR5's FINAL_REPORT, CONTRACT_DELTA, SSCTR decision, code and tests;
  - the freeze and amendment-1 verifiers. On this line both fail by design, only on declared files (§10).

## 2. What changed

The HR5 amendment was **corrected in place**; this is not a parallel system. The five-zone reading moves to revision 2, `V1X-HR-FIVE-ZONE-2`. `v1-run-calibration.mjs` is **byte-identical** to the first amendment, and so is the three-zone `heartRateZones`.

**Calibration** ([CONTRACT_DELTA.md](CONTRACT_DELTA.md)):
- Maximum = **220 − age**, from the onboarding `athlete.ageYears`. An age is valid from 18 to 80.
- No watch, strap, lab or history is required.
- The reading is marked `AGE_ESTIMATE` / `ESTIMATED` / LOW.
- Aging counts whole years in the plan's local days. Past 80 there is no estimate (`AGE_OUTSIDE_ESTIMATE_RANGE`); a declared or measured maximum still gives zones.
- An invalid age is refused by the intake rules and never recorded. An intake that states only "adult" gets `AGE_REQUIRED`.

**Bands:**
- Z1 up to 65 %, Z2 above 65 up to 81, Z3 above 81 up to 89, Z4 above 89 up to 97, Z5 above 97, all of the maximum.
- Whole-bpm upper limit = floor(max × p / 100). The next zone starts one bpm above.
- For every maximum from 120 to 230 bpm and every bpm from 1 to 260, each bpm lies in exactly one zone, and in Z_k exactly when its percentage is above the lower bound and at most the upper.
- Readings are rounded half up.
- 30 years (190): **Z1 ≤123 · Z2 124–153 · Z3 154–169 · Z4 170–184 · Z5 ≥185**.

**Personalisation:**
- The athlete can declare a maximum (`DECLARED`, UNVERIFIED) and custom limits (`ATHLETE_CUSTOM`, ordering checked).
- Both are kept until the athlete changes or clears them. A measurement, the intake, a restart or adopting a plan never overwrites them.
- The reference order is: declared > lab maximum (`MEASURED`) > chest-strap observed maximum above the estimate (a measured lower bound) > age estimate. Every reference not used is listed with the reason.
- A lab/strap conflict uses neither measured value, and the conflict is shown.

**Wearables:**
- The five zones exist without one.
- Measured session maxima are classified one by one, with their sensor; optical carries a caveat. They are never a distribution.
- `sessionDistribution` is UNAVAILABLE (no series in the contract).
- `liveHeartRate` is UNAVAILABLE, and a synced watch is never assumed to provide it.
- The series classifier is ready for a future HealthKit channel: strap, ECG or optical, provenance kept, minimum samples and coverage, gaps unknown. Its limits are placeholders until that channel's review (SSCTR C10).

**Prescription and safety:**
- Pace and effort govern. Heart rate is a reference scale and a slow-down cue (Z4) in easy running; it is never primary.
- It changes **no plan, session, decision or record** (regression and neutrality proofs, §6).
- It is not medical evidence, not a measured threshold, and never releases a safety block.
- A hold withholds the zones. Walk/jog, restart and return keep the zones but give no session role.
- The five zones no longer nest in the three domains (`threeDomains: NOT_NESTED`). The three-zone reading keeps its own dependants.

**Persistence:**
- A carried, sealed, append-only `heartRateProfileRecord`. It is validated by source, read in the plan's offset, and compacts at 128 rows.
- The integration has two new operations, `setHeartRateProfile` and `eraseHeartRateProfile`. They make no engine call and record no custody decision. They need COACHING consent to record, and are never held back by consent or clock to erase.
- The anchor keeps a carried sequence, so a same-version rollback is detected.

**Files:**
- New: `src/v1-heart-rate-profile.mjs`, `v1/HEART_RATE_FIVE_ZONE_V2.json`.
- Amended: `src/v1-heart-rate-zones.mjs`, `src/v1-safety-index.mjs`, `src/boundary/integration.mjs`, `src/boundary/api.mjs`, `src/boundary/inventory.mjs`.
- Tests: `test/v1hr5-five-zones.test.mjs` (rewritten), `test/v1hr5r-boundary.test.mjs`, `test/v1hr5r-successors.test.mjs`.
- Verifier: `scripts/v1-hr5-runna-amendment.mjs`; record: `v1/HR5_RUNNA_AMENDMENT_V1.json`.
- The revision-1 values and records are kept byte for byte as history.

## 3. Reviews

Details: [INDEPENDENT_REVIEW.md](INDEPENDENT_REVIEW.md) and [SCIENCE_AND_CALIBRATION_DECISION.md](SCIENCE_AND_CALIBRATION_DECISION.md).

- **SSCTR** (sports-science reviewer; PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, not human or clinical validation):
  - **r1: REVISE.** No estimate past 80; state the direction of the age-formula error; an optical caveat. All applied.
  - **RECHECK-r1 and r2: APPROVE_WITH_CONDITIONS / SUPPORTED_WITH_LIMITS.** The enabling record is bound to values `784ba7fe…` and to the final code. 23 conditions: copy, one cue per session, neutral zone names, no rest or illness suggestions, future channels reviewed, the week rule, a Security review before real athletes.
  - Operational estimates and physiological measurements are kept apart in every reference and in its disclosure.
- **QRE + Security** (independent, read-only):
  - **Round 1: NOT_READY.** 1 blocker: a heart-rate write after an erasure could suppress a warning-sign screen. 4 major: accept erased an override; no consent check; timezones; forged intake records. 3 minor.
  - **Round 2: READY_WITH_CONDITIONS.** 4 new issues in the fixes.
  - **All 14 are fixed, each with a regression test.** The reviewer's probes pass. One risk is accepted: a multi-process same-version race.

## 4. Acceptance criteria

| # | Criterion | Result |
|---|---|---|
| 1 | A 30-year-old with no wearable gets five estimated zones | **YES:** 190, 123 / 153 / 169 / 184, cue at 170 (Node, Mac JSC, Swift decoding) |
| 2 | An athlete with measured heart rate keeps five zones | **YES:** a strap above the estimate replaces it; below, it is shown and classified; lab; conflict falls back to the estimate |
| 3 | An athlete with a custom maximum gets five zones recalculated correctly | **YES:** 195 gives 126 / 157 / 173 / 189; custom limits exact; kept across reopen, review, restart and accept |
| 4 | No valid user loses the zones for lack of a lab test or strap | **YES:** every age 18–80; a conflict does not take them away |
| 5 | Missing measurements give no fictitious distribution | **YES:** `sessionDistribution` and `liveHeartRate` UNAVAILABLE; single values only; `fromAverageHeartRate: false` |
| 6 | Pace, RPE, strength and safety unchanged | **YES:** regression proof and neutrality proof, 0 unexplained at −180 and +600; under a hold, the clinical answer is the one without heart rate |
| 7 | Node, JavaScriptCore and the iPhone consistent | **PARTIAL:** Node = macOS JavaScriptCore, 0 DIVERGED everywhere. **The iPhone was not run:** it was offline and Xcode had no account or profile in this session (§8). |
| 8 | Published on the remote | **YES** (§11) |

## 5. Node

**1993 tests, 1942 pass, 0 skipped.** The 51 failures are V1HR5's 48 plus 3 that fail by design, each with a passing successor: amendment-1's record test (2) and QRE-AIF-01's byte equality. Directed tests:

- `v1hr5-five-zones` 33/33;
- `v1hr5r-boundary` 13/13;
- `v1hr5r-successors` 3/3.

Details: [TEST_REPORT.md](TEST_REPORT.md), [`results/node/suite-closing.txt`](results/node/suite-closing.txt).

## 6. Proofs

- **Regression:** 326 recorded boundary steps (int, final, V1HR5's hr5) were replayed through `4850560` and this tree, at −180 and +600. **0 unexplained.** Only the five-zone reading, its hash, the carried seal and sequence, and the profile keys differ.
- **Neutrality:** the same steps were replayed with 75 heart-rate writes and erasures injected. **0 unexplained at both offsets: heart rate changes nothing but heart rate.**

## 7. macOS JavaScriptCore and Swift

- **Bundle** `d087ad51b37dfc4e…`: 50 modules, 18 assets, export gate 0 mismatches.
- **P0Host: 29 tests, 0 failures** (6 phase tests skipped by design).

| Fixture | Diverged | Identical | Libm-explained |
|---|---|---|---|
| final (184 steps) | 0 | 57 | 127 (the frozen pattern) |
| int (78 steps) | 0 | 22 | 56 |
| **hr5r** (14 journeys, 98 steps), memory and native file store + Keychain | **0** | 14 | 84 |
| core | 0 | — | — |

- The five-zone module in JavaScriptCore is identical to Node over 111 maxima and 63 ages.
- **Swift contract delta** (`proposals/CoachingPresentation`): 10/10. It decodes the corrected captures, revision 1 and the frozen readings.

## 8. iPhone: not run

- `devicectl` lists the iPhone 17 Pro Max (iOS 27.2.1) as **unavailable** and `xctrace` as **offline**. This was checked four times, the last at closing.
- `xcodebuild build-for-testing` stopped at signing: *No Accounts*, and no provisioning profile (the profile folder is empty).
- No device result is claimed. The bundle, fixtures and tests are committed and ready. To run:
  1. Sign in to Xcode (Settings → Accounts).
  2. Connect and unlock the iPhone.
  3. Run the commands in [NATIVE_VALIDATION_REPORT.md §4](NATIVE_VALIDATION_REPORT.md), through `tools/device-lock/with-device.sh`.

## 9. A/B/C integration delta

Summary of [CONTRACT_DELTA.md §3](CONTRACT_DELTA.md):

- **A (CoachingHost):**
  - take the 8 runtime files at the bound bytes;
  - rebuild the bundle and rerun the device gate;
  - expose `setHeartRateProfile` and `eraseHeartRateProfile`;
  - keep the anchor's `carriedSeq`;
  - collect `ageYears` at onboarding.
- **B (HealthKit):** no change now. A future heart-rate series goes through `classifySamples` after its own review. Never read a synced watch as live heart rate.
- **C (SwiftUI):**
  - take `HeartRateFiveZones.swift`;
  - show `minBpm`–`maxBpm` from the engine only;
  - "máxima informada" and custom limits become real inputs;
  - "tempo por zona" stays FUTURE_ONLY;
  - SSCTR copy conditions C1–C11.
- **Shared contracts:** none changed by this mission. `IntegrationContracts`, the A/B handoffs, the parallel contract and the A/B worktrees are untouched. Figma is untouched.

## 10. The freeze and the amendments

- **Preserved:**
  - `FINAL_RELEASE_FREEZE_V1.json` is byte-identical to `6482749`;
  - `FIVE_ZONE_AMENDMENT_V1.json` is byte-identical to `bec39c5`.
- **REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2** is recorded beside them ([FIVE_ZONE_AMENDMENT_2.md](FIVE_ZONE_AMENDMENT_2.md)). Its verifier passes 91/91: five declared amended files with recorded diffs, the run calibration byte-identical, and the bundle bound.
- The two earlier verifiers fail by design, and only on declared files (successor test).

## 11. Publication

- Branch `claude/v1-hr5-runna-parity`, pushed without force.
- The remote was checked equal to local HEAD with `git ls-remote`.
- No merge.

## 12. Still open

- **The iPhone run** of this bundle (§8).
- **G07 / Founder:** whether HEALTH_SIGNALS, and not only COACHING, governs the heart-rate profile.
- **Accepted risk:** the multi-process same-version carried-commit race.
- **Security:** a Security and privacy review of heart-rate data before any real athlete.
- **Revalidation queue:** HQ-V1HR5R-SSCTR-ZONES is proposed by SSCTR and not added.
- **Future work:** a series or live channel needs its own SSCTR and Data review.
- **From V1HR5:**
  - FND-HR5-01: custody refuses `runEvidence` in a review;
  - FND-HR5-03: `StrengthExposure.descriptiveOnly` optional in CHG-UI-1.
- **REAL_ATHLETE_READY = NO.**

| Criterion | Result |
|---|---|
| GIT_BASELINE_VERIFIED | YES |
| WORKTREE_ISOLATED | YES |
| ORIGINAL_FREEZE_AND_FIRST_AMENDMENT_PRESERVED | YES |
| FIVE_ZONES_FOR_EVERY_VALID_AGE | YES |
| PERSONALISATION_AND_PERSISTENCE | YES |
| ESTIMATED_DECLARED_MEASURED_KEPT_APART | YES |
| NO_FABRICATED_DISTRIBUTION | YES |
| PRESCRIPTION_AND_SAFETY_UNCHANGED | YES (regression and neutrality proofs) |
| SCIENCE_REVIEW | YES: SSCTR APPROVE_WITH_CONDITIONS (provisional internal authority; not human or clinical validation) |
| QRE_SECURITY_REVIEW | YES: every finding fixed with tests; one risk accepted; a Security review before real athletes stays open |
| MACOS_JSC_VALIDATED | YES |
| SWIFT_CONTRACT_DELTA_VALIDATED | YES (mission copy, not a shared package) |
| IPHONE_PHYSICAL_VALIDATED | **NO**: device offline, no Xcode signing in this session |
| SUCCESSOR_AMENDMENT_RECORDED | YES |
| REMOTE_BRANCH_PUBLISHED | YES |
