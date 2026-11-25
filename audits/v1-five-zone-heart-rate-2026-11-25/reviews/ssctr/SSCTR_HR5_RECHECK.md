# SSCTR-HR5-RECHECK-r1: narrow recheck of the five-zone delta (2026-11-25)

`SSCTR_HR5_RECHECK.json` is the authoritative record. This page is its reading view.

**Delta disposition: APPROVE_WITH_CONDITIONS.** Evidence status SUPPORTED_WITH_LIMITS. No blocking finding. I am the same independent SSCTR instance as SSCTR-HR5-REVIEW-r1, and I did not author the delta. This is a provisional AI judgement, not human, clinical or empirical validation.

## Scope

The check covers only the delta from `1c5d29b` to the uncommitted worktree, plus the V1RC file-level recheck that SSCTR-HR5-R-01 requires. The bindings are to these file hashes:

| File | sha256 |
|---|---|
| `CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json` | `387d66a73f3ab9071aa2313af7cd616dce251e7f83b9e7eb8a23b7a62055c04d` (equal to `HR5_SHA256`) |
| `CoachingCore/src/v1-heart-rate-zones.mjs` | `86ff6fd52311bece46796883ef22cdda49000de1c50c47d84e411d3f0856644a` |
| `CoachingCore/src/v1-run-calibration.mjs` | `8203b875b66bc3780bc13a14299c896d23449bf2201ec03f85eb92e43226dc83` (at `476b657`: `0eae6521…9f01`) |

## Evidence

- **HR5 tests:** 26/26 pass.
- **Full suite:** 1968 tests, 48 failing. The failures are the baseline's 47 titles plus only the final-release freeze-record test (R-07, for QRE).
- **Regression:** I reran it with the stricter harness against a scratch `git archive` of `476b657`. Result: 326 steps, 0 unexplained, **ADDITIVE_ONLY**.
- **`heartRateOf`:** still byte-identical (`243f6eed…`).
- **New probes:**
  - Order: a hold comes first, then boundary off (either boundary), then effort-only mode, then the family.
  - `onlyInMode`: EASY_REESTABLISHMENT gives a cue only in EASY mode.
  - Prototype and non-string family names fall back to UNKNOWN_FAMILY_FAIL_CLOSED.
  - Malformed values give a typed error, no cue, and leave the rest of the calibration identical.
  - The tightened classifier limits hold.
- **Earlier probes:** rerun, no failures.

## Findings

| Id | Severity | Status / finding |
|---|---|---|
| SSCTR-HR5-R-02 | NOTE | Closed. Session roles now see `on.HR`, and the order of the checks is consistent. |
| SSCTR-HR5-R-03 | NOTE | Closed. Families are looked up as own keys only, and prototype names fail closed. |
| SSCTR-HR5-RC-01 | NOTE | `onlyInMode: EASY` faithfully encodes the decision's "onlyWhen". Outside EASY the reason given is MODE_WALK_JOG_RESTART_RETURN, which is accurate. |
| SSCTR-HR5-RC-02 | NOTE | Fault isolation fails closed. Engineering should not let the catch hide defects during testing. |
| SSCTR-HR5-RC-03 | CONDITION | The NO_ZONES ruling below. |

## NO_ZONES ruling (QRE-HR5-05): confirm the implemented reading

NO_ZONES applies to the roles that depend on zones, which are the cue families. They get NONE with the zones' typed reason.

The other families keep their own reason whether or not zones exist:
- THRESHOLD, HM and M, 5K and 10K, strides, RACE and RACE_TOUCH keep NO_HEART_RATE_GUIDANCE;
- the walk families keep NONE / EFFORT_ONLY_FAMILY.

Each of those reasons is true independently of any reference. In both readings such a session carries no heart-rate number and no cue, so requiring NONE everywhere would change no guidance.

**Condition:** clients read zone availability only from the week-level status. They never infer it from a per-session reason, and they show no zone bpm for those sessions.

## V1RC file-level recheck (R-01)

The calibration file `src/v1-run-calibration.mjs` changed from `0eae652116915342a28f0c8a5b4da7aa4724e743b45e08dee1852bf578ab9f01` to `8203b875b66bc3780bc13a14299c896d23449bf2201ec03f85eb92e43226dc83`. `v1-run-index.mjs` (`a86b6f1e…`) and the extension values (`d9f7429b…`) are unchanged.

| Boundary | Disposition |
|---|---|
| V1X-RUN-CAPACITY | CONFIRMED_UNCHANGED_BEHAVIOUR |
| V1X-RUN-PACE | CONFIRMED_UNCHANGED_BEHAVIOUR |
| V1X-RUN-HR | CONFIRMED_UNCHANGED_BEHAVIOUR |
| V1X-RUN-ESTIMATE | CONFIRMED_UNCHANGED_BEHAVIOUR |

Basis:
- The diff has 4 hunks, all inside `runCalibrationOf`, and none of them edits a V1RC computation.
- Every other function is byte-identical.
- The five-zone code is now fault-isolated.
- The regression is ADDITIVE_ONLY, the on/off invariance probes match, and there is no new V1RC test failure.

This checks that behaviour is preserved under a code-hash change. It does not re-appraise the V1RC evidence, and all RECHECK-r1 conditions carry over. The confirmation is recorded in `SSCTR_HR5_V1RC_FILE_RECHECK.json`, a new governance file that the runtime does not read. The historical V1RC file is not edited.

## Record

One record was appended to `SSCTR_HR5_RECORDS.json`:
- reviewId `SSCTR-HR5-RECHECK-r1`, supersedes `SSCTR-HR5-REVIEW-r1`;
- valuesSha256 `387d66a7…`;
- conditions name the module and calibration hashes above.

The r1 record and the note are kept. The r1 record is bound to the old bytes, so it no longer counts. `fiveZoneAuthority()` now approves with the RECHECK-r1 record only.

All REVIEW-r1 conditions carry over. Review by **2027-05-11**. Committing bytes other than those listed above requires a recheck.
