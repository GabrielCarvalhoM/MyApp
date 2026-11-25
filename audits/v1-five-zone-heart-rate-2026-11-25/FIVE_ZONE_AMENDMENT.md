# REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1 (phase 8)

This is a **versioned amendment beside the original freeze**, not a new freeze cycle.

| | |
|---|---|
| Record | `CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json`, written at `dec5ad5`, committed in `bec39c5` |
| Verifier | `node CoachingCore/scripts/v1-five-zone-amendment.mjs --check` |
| Successor test | `CoachingCore/test/v1hr5-amendment-record.test.mjs` |
| Narrative inputs | `AMENDMENT_INPUTS.json` |

## 1. The original validated version (untouched)

**REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE.** Its record `CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json` is from commit `6482749` and binds 87 files at `460a9ab` (filesDigest `0a417686…`) and the bundle `9cf3149b83540685`.

- **The record was not rewritten.** The amendment verifier proves its bytes equal those of `6482749`.
- **The historical baseline still passes:** on `476b657`, `v1-final-release-freeze.mjs --check` gives 87/87 consumed files byte-identical, bundle `9cf3149b…` as recorded.
- **On this line the original verifier fails, by design** (`results/node/original-freeze-check-on-amended-line.txt`). Every line it prints names only what this amendment declares: the amended file, the added files and this record. The successor test proves this.

The historical baseline's approval and the amended version's approval are **distinct evidence**.

## 2. What changed

| File | Kind | sha256 (now) |
|---|---|---|
| `CoachingCore/src/v1-run-calibration.mjs` | **amended** (frozen `0eae6521…`) | `8203b875…`: a 9-line additive diff recorded in the record (`diffSha256`). One import; the five zones and session roles computed beside the unchanged guidance; one output key. `heartRateOf` is byte-identical to the frozen function. |
| `CoachingCore/src/v1-heart-rate-zones.mjs` | added, consumed | `86ff6fd5…` |
| `CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json` | added, consumed (pinned values) | `387d66a7…` |
| `audits/v1-five-zone-heart-rate-2026-11-25/reviews/ssctr/SSCTR_HR5_RECORDS.json` | added, consumed (enabling records) | bound in the record |
| `CoachingCore/scripts/v1-five-zone-amendment.mjs`, `CoachingCore/test/v1hr5-*.test.mjs` | added, not consumed | — |

The other 86 files the original record binds are byte-identical. In total, **90 consumed files are bound.**

The **amended bundle** is `2f69066416cdec4e8ed171933ab3d03a7412f44105122eb3a1a7f907e84b7e9c`: 49 modules, of which 46 are CoachingCore modules equal to the bound sources, and 18 assets equal to the bound data files. It is the bundle that ran on the Mac and the iPhone.

## 3. Sporting reason and method

- **Reason:** the Founder's decision of 2026-11-25. V1 has five heart-rate zones truly computed by CoachingCore, and the three physiological domains are kept.
- **Method:** SSCTR-HR5-DECISION-r1 ([summary](SCIENCE_AND_CALIBRATION_DECISION.md)):
  - Z1–Z5 at 720/800/870/920 per mille of one reference maximum, nested in LOW/MODERATE/HIGH;
  - the reference is a lab maximum under strict conditions, otherwise the approved chest-strap observed maximum;
  - `REFERENCE_CONFLICT` when the strap reads more than 5 bpm above the lab;
  - LOW confidence;
  - effort governs every session; heart rate is never primary, and may only suggest slowing in easy running;
  - no time in zone without a series.
- **Enabled by:** SSCTR-HR5-RECHECK-r1. The four V1RC boundaries were confirmed at the new file hash in `SSCTR_HR5_V1RC_FILE_RECHECK.json`.

## 4. Contracts

**Additive:** `runCalibration.heartRateFiveZones` ([CONTRACT_DELTA.md](CONTRACT_DELTA.md)). No shared contract was changed; the Swift delta is in the mission's copy of CHG-UI-1.

## 5. Tests and runtimes

| Evidence | Result |
|---|---|
| Baseline suite (`476b657`) | 1942 / 1895 / 47 (= the freeze record) |
| Amended suite (`822e2c0`) | 1968 / 1920 / 48 (the 47, plus the original freeze-record test by design) |
| **Suite with this record** (`f363a25`, `results/node/suite-amended-record.txt`) | 1970 / 1922 / 48 (the 47, plus the original freeze-record test by design; both successor tests pass); amendment verifier 90/90 |
| Directed tests | 26 (+ 2 successor) |
| Regression proof, five zones on | ADDITIVE_ONLY, 326 steps, 0 unexplained |
| Node × Mac JSC × iPhone JSC | 0 DIVERGED on every fixture. Final keeps the frozen pattern (57 IDENTICAL / 127 EXPLAINED_LIBM); the five-zone module is identical for 81 maxima. Only tolerance: RFC-NUMERIC-1 (Race Forecast), never on a heart-rate value. |
| iPhone 17 Pro Max | Equivalence 5/5, Boundary 9/9 + 3/3, Core en/pt-BR, process death recovered, PF-0 10/10 ([report](NATIVE_VALIDATION_REPORT.md)) |
| Reviews | SSCTR APPROVE_WITH_CONDITIONS (review and recheck); QRE/Security READY_WITH_CONDITIONS, C1–C6 met ([consolidation](INDEPENDENT_REVIEW.md)) |

## 6. Still open

These are in `AMENDMENT_INPUTS.json` `open`:

- **FND-HR5-01:** the boundary refuses `runEvidence`;
- **FND-HR5-03:** the CHG-UI-1 `descriptiveOnly` field;
- **R-04:** `lab.modality` must be a real declaration;
- **R-08:** Product copy;
- a Security review of heart-rate and lab data before real athletes;
- the funded-human revalidation HQ-V1HR5-SSCTR-ZONES, and the review-by date 2027-05-11;
- clinical heart-rate modifiers (ASK);
- the earlier, unmixed items: `specialPopulation`, unplanned strength, the GPS path, the backend;
- not run: the locked-device and reinstall phases.

## 7. What this amendment validates, exactly

For synthetic athletes only:

- the five-zone reading and per-session heart-rate roles of CoachingCore at the bound bytes;
- that every other engine output is byte-identical to the original freeze's (additive);
- that Node, macOS JavaScriptCore and iPhone JavaScriptCore agree on it;
- its persistence and integrity through the integration boundary.

It does **not** validate real athletes, HealthKit, heart-rate series, any UI, or the application. **REAL_ATHLETE_READY stays NO.**
