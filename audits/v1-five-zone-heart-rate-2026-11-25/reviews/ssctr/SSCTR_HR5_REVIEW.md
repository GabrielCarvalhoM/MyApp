# SSCTR-HR5-REVIEW-r1: independent review of the five-zone implementation (2026-11-25)

`SSCTR_HR5_REVIEW.json` is the authoritative record. This page is its reading view.

**Overall disposition: APPROVE_WITH_CONDITIONS.** Evidence status SUPPORTED_WITH_LIMITS. No blocking finding.

## Reviewer

- A fresh SSCTR instance (SSCTR-1.0.0, SSCTR-CONST-1.0.0, SSCTR-EP-1.0.0, skill 1.0.0, model claude-opus-5-5), started by the V1HR5 Chief. It claims no native dispatch and delegated nothing.
- It did not author SSCTR-HR5-DECISION-r1, the values, the code, the tests or the proofs.
- It holds no human credentials. This is a provisional internal sporting judgement under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. It is not human, clinical or empirical validation.

## Target

Commit `1c5d29b` on `claude/v1-five-zone-heart-rate` (base `476b657`):

| File | sha256 |
|---|---|
| `CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json` | `11440a13…09ce`, equal to `HR5_SHA256` |
| `CoachingCore/src/v1-heart-rate-zones.mjs` | `4d4555e8…570d` |
| `CoachingCore/src/v1-run-calibration.mjs` | `d3e20f14…f87e` (base `0eae6521…9f01`) |

## What I read and ran

- I read the code itself: the whole new module, the whole diff, and in the calibration `readEvidence`, the authority, `floorOf`, `fold`, `heartRateOf` and `runCalibrationOf`. I also read the values file, the test file, decision r1, and V1RC Q6 and Q9 with their records.
- `node --test test/v1hr5-five-zones.test.mjs`: **22/22 pass**.
- Full suite: 1964 tests, 48 failing. The failures are the baseline's 47 titles plus one new one, the final-release freeze record (R-07).
- `hr5-oracle.mjs`: every journey is off under the production authorities, as expected with no record yet. It is deterministic and left `git status` unchanged.
- Regression replay against a `git archive` of `476b657` in scratch (no worktree created): 326 steps, 0 unexplained, **ADDITIVE_ONLY**.
- My own probes in scratch, through `X.generateProgram` with `{...DEV, heartRateFiveZone: devFiveZone()}`, through `runCalibrationOf` and through the integration boundary: **77/77 checks pass**. They covered:
  - arithmetic for 140–220 bpm;
  - more than 30 lab and observed edge cases;
  - conflict and stale references;
  - on/off invariance for nine athletes, a hold and a strength-only intake;
  - every session family, including strides and unknown or prototype-key family names;
  - breaks of 16 and 10 days;
  - the authority gate.
- Literature: I used PubMed E-utilities. I re-read five decisive sources:
  - S02 Table 2, full text: 54–73 / 74–83 / 84–88 / 89–93 / >94 %HRmax;
  - S06, full text: within-domain splits are "arbitrarily/experientially defined";
  - S07, full text: VT1 at 81.4 ± 3.9 %HRmax;
  - S17, abstract: chest strap vs ECG rc 0.996;
  - S16, abstract: heart rate differs between running and cycling.

  Three currency searches found no new systematic review.

## Questions

1. **Does the implementation match the decision? Yes, with conditions.** All of these match decision r1:
   - the zones, per-mille values and integer half-up edges;
   - the open ends;
   - the lab tier: running modality, chest strap or ECG, RPE ≥ 8, not stopped, not reported not tolerated, 182 days, no break of 14 days or more, after the hold/return floor;
   - the unchanged observed maximum;
   - the conflict rule: observed more than lab + 5 gives UNAVAILABLE / REFERENCE_CONFLICT with both values, and there is no lower-wins;
   - LOW confidence for every reference;
   - session roles, including strides, unknown families and EASY_REESTABLISHMENT;
   - the cue rules;
   - the newer-runner disclosure;
   - the week boundary and Q9 withdrawal;
   - hold-first ordering and effort-only modes;
   - time in zone UNAVAILABLE.

   `lab.modality` inside the free-form lab object is acceptable for the sporting rule, as a declaration only (R-04).
2. **Can heart rate become primary, a target, a gate or a dose input, or suggest speeding up? I found no path.** Nothing reads the output. Every other key and the plan are byte-identical with the zones on or off. Zones never appear without a qualifying reference. Age, average, optical, declared and implausible values are refused with typed reasons. There is no cue outside the easy families and no speed-up text.
3. **Is `heartRateOf` byte-identical to base? Yes.** The function text has the same hash in base and candidate, and `fold`, `floorOf`, `classify` and `readEvidence` are also unchanged. However, the records in force (SSCTR-V1RC-RECHECK-r1) bind the whole `v1-run-calibration.mjs` file hash, and that hash changed. So their recheck condition is triggered at the file level (R-01).

## Findings

| Id | Severity | Finding |
|---|---|---|
| SSCTR-HR5-R-01 | CONDITION | The V1RC RECHECK-r1 records bind the old `v1-run-calibration.mjs` hash (`0eae6521…`), which is now `d3e20f14…`. I found no V1RC behaviour change. Chief must route the V1RC recheck before integration. |
| SSCTR-HR5-R-02 | NOTE | `sessionHeartRate` does not see `on.HR`. With HR off, NO_GUIDANCE families give their own reason instead of EXTENSION_NOT_ENABLED. Hold and authority checks run in a different order than in `fiveZonesOf`. No cue is produced. |
| SSCTR-HR5-R-03 | NOTE | Family names that are prototype keys (`constructor`, `__proto__`) give NONE / UNKNOWN_ROLE instead of UNKNOWN_FAMILY_FAIL_CLOSED. This still fails closed. |
| SSCTR-HR5-R-04 | CONDITION | `lab.modality` is acceptable only as a real declaration. A client must never default or infer it. Data and Product own collection. |
| SSCTR-HR5-R-05 | NOTE | A lab report that gives only a maximum does not qualify, because the existing readability rule needs a values list. This is conservative. |
| SSCTR-HR5-R-06 | NOTE | When run experience is unknown, no newer-runner disclosure is shown. Intake requires experience, so this is theoretical. |
| SSCTR-HR5-R-07 | NOTE | Two engineering items, not sporting, routed to QRE: the answer now carries the new key even when the boundary is off, and the final-release freeze test fails on the undeclared amendment. |
| SSCTR-HR5-R-08 | CONDITION | Product must show one heart-rate cue per session, keep the meaning of each disclosure, avoid "Olympiatoppen" naming and imply no health meaning. |
| SSCTR-HR5-R-09 | NOTE | The classifier is unwired and has no approved numeric limits. A future series channel needs its own SSCTR and Data review. |

## Conditions (carried into the record)

- Synthetic data only.
- The record is bound to the values bytes and to the module hashes above. Any change to them requires a recheck.
- The five zones stay inert unless CAPACITY and HR are validly enabled (R-01).
- Display-only, under effort, with a Z4 slow-down cue in the easy families only.
- R-04 and R-08 apply.
- Time in zone stays UNAVAILABLE.
- Security review of heart-rate and lab data before any real athlete.
- Medication that alters heart rate stays ASK / ELIGIBILITY_UNASSESSED for the clinical owner.
- This is an AI's provisional judgement.
- Proposed for funded human revalidation as HQ-V1HR5-SSCTR-ZONES.
- Review by **2027-05-11**, or earlier on the decision's triggers.

## Record

One record was appended to `SSCTR_HR5_RECORDS.json`. It binds `V1X-RUN-HR-FIVE-ZONE` to values sha256 `11440a132a83fb5d5d7468742112064c036949b707e49497736baa2c00b409ce`.
