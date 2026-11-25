# V1HR5 — Independent review (phase 9)

There were three independent reviews, each by an instance that authored neither the decision nor the code. The worker (the Chief/implementer) is not a judge: this file consolidates and records the dispositions, and the reviews themselves are kept as received.

| Review | Reviewer | Target | Disposition | File |
|---|---|---|---|---|
| SSCTR-HR5-DECISION-r1 | SSCTR decision instance | the request (science) | 5 approved with conditions, 3 amended (lab conditions, conflict rule, lab confidence) | `ssctr/SSCTR_HR5_DECISION.*` |
| SSCTR-HR5-REVIEW-r1 | fresh SSCTR instance | candidate `1c5d29b` (sport) | **APPROVE_WITH_CONDITIONS**, no blocking finding; enabling record appended | `reviews/ssctr/SSCTR_HR5_REVIEW.*` |
| QRE-SEC-HR5-REVIEW | independent QRE + Security reviewer | candidate `1c5d29b` (engineering, regression, contract, security) | **READY_WITH_CONDITIONS** (C1–C3 blocking) | `reviews/qre/QRE_SEC_HR5_REVIEW.*` |
| SSCTR-HR5-RECHECK-r1 | the SSCTR-HR5-REVIEW-r1 instance (independent of the delta) | the fix delta; the V1RC file-level recheck | **APPROVE_WITH_CONDITIONS**; NO_ZONES ruling; four V1RC boundaries CONFIRMED_UNCHANGED_BEHAVIOUR; record rebound | `reviews/ssctr/SSCTR_HR5_RECHECK.*`, `SSCTR_HR5_V1RC_FILE_RECHECK.json` |

The two review files had one edit made by the Chief: the local home path in their `target.worktree` field was replaced with `~` before publication (privacy). Nothing else in them was changed.

## Dispositions

### QRE-SEC-HR5-REVIEW

| Id | Sev. | Finding (short) | Disposition |
|---|---|---|---|
| C1 / QRE-HR5-01 | HIGH | The committed native package was built from the draft values and module | **Fixed.** `build.sh` was rerun on the final bytes (bundle `2f69066416cdec4e`, 18 assets, the records bundled). New checks: the bundled values equal the engine pin, no residue in the historical package, and `--twice` proves determinism against the committed copy. Committed in `822e2c0`. |
| C2 / QRE-HR5-02 | MEDIUM | The frozen-release verifier fails with no declared amendment | **Fixed.** `CoachingCore/scripts/v1-five-zone-amendment.mjs` plus `CoachingCore/v1/FIVE_ZONE_AMENDMENT_V1.json` (REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1), and the successor test `v1hr5-amendment-record.test.mjs`. The amended suite is committed. |
| C3 / QRE-HR5-04 | MEDIUM | `CONTRACT_DELTA.md` did not match the code | **Fixed.** §1.1 was rewritten against the code: the conflict shape, the reasons, the rounding name, the session roles' location and the absent-key rule. |
| C4 / QRE-HR5-03 | MEDIUM | All native and integration evidence ran with the boundary off | **Fixed** after SSCTR-HR5-RECHECK-r1 enabled it. The hr5 oracle now runs its `if(ON)` assertions, the regression proof ran with the boundary on (ADDITIVE_ONLY), and Mac and iPhone JavaScriptCore were run with the zones on. |
| C5 / QRE-HR5-05 | LOW | Session roles ignored the HR boundary and used a different order | **Fixed:** hold, then off (either boundary), then effort-only, then family; tested. NO_ZONES for non-cue families was **routed to SSCTR**: ruled cue-only (RECHECK RC-03). |
| C6 / QRE-HR5-06 | LOW | The Swift types dropped `strides`, `disclosure`, `source`, `notes`, `sha256` | **Fixed** in the proposal delta; tests assert strides (6 in the capture) and the cue disclosure. |
| QRE-HR5-07 | LOW | "Absent = older engine" cannot be decided from the key alone | **Documented:** the rule is stated relative to `runCalibration.status` (CONTRACT_DELTA §1.1, Swift doc comment). |
| QRE-HR5-08 | LOW | No fault isolation | **Fixed:** `FIVE_ZONE_ERROR`; tested (nothing else moves). SSCTR RC-02: do not let the catch hide defects in testing (the suite asserts no `FIVE_ZONE_ERROR` on valid inputs). |
| QRE-HR5-09 | LOW | `carriedMac` allowance unconditional; an open tamper window | **Fixed:** the seal is allowed only where the stored document adds the reading, and an unclosed window fails the harness. |
| QRE-HR5-10 | LOW | The redirect guarded only some APIs; build.sh missed untracked or ignored residue | **Fixed:** all sync write, rename, copy, unlink and open-for-write calls are guarded, async writers are refused, and `git status --ignored` must be empty. |
| QRE-HR5-11 | LOW | Test gaps | **Fixed:** sessions with the HR boundary off; production records end to end; lab expiry and lab-across-break; NOVICE unconditional; classifier limit validation. |
| QRE-HR5-12 | INFO | The two readings may name different evidence | **Documented** (CONTRACT_DELTA §1.1). |
| QRE-HR5-13 | INFO | Prototype family names; fractional bpm rounded before the range check | **Fixed** (own-key lookup; SSCTR R-03). Fractional rounding is inherited from the frozen `readEvidence` and left as it is (not this amendment's). |
| QRE-HR5-14 | INFO | Security positives; an empty-string source id is accepted; about 19 KB per reading | **Noted.** The source-id rule is the runtime's general rule (unchanged). The size is recorded for A. |
| QRE-HR5-15 | INFO | EASY_REESTABLISHMENT "only in EASY mode" was not encoded | **Fixed:** `onlyInMode: "EASY"` in the values, enforced and tested; SSCTR RC-01 confirms it. |

### SSCTR-HR5-REVIEW-r1 and RECHECK-r1

| Id | Kind | Finding | Disposition |
|---|---|---|---|
| R-01 | CONDITION | The V1RC RECHECK-r1 records bind the whole `v1-run-calibration.mjs` hash (0eae6521…) | **Resolved by an independent file-level recheck:** CAPACITY, PACE, HR and ESTIMATE are CONFIRMED_UNCHANGED_BEHAVIOUR at `8203b875…` (`SSCTR_HR5_V1RC_FILE_RECHECK.json`, a governance record). The historical V1RC records file is untouched. BASELINE_AUDIT §5.2 was corrected. |
| R-02 | NOTE | Session roles without `on.HR`; order | **Fixed** (see C5). |
| R-03 | NOTE | Prototype family names | **Fixed.** |
| R-04 | CONDITION | `lab.modality` must be a real declaration by the athlete or the lab report, never defaulted or inferred by a client | **Carried** into the handoff for A and C (CONTRACT_DELTA) and into the amendment's open items. |
| R-05 | NOTE | A lab report with only a maximum does not qualify (needs a values list) | Kept: conservative, the existing readability rule. |
| R-06 | NOTE | Unknown experience gives no newer-runner disclosure | Kept: the intake requires experience. |
| R-07 | NOTE | The freeze-record test now fails | **Resolved:** the amendment record plus its successor test (C2). |
| R-08 | CONDITION | Product copy: one cue per session, the meanings kept, no "Olympiatoppen"/"Norwegian" naming, no health meaning | **Carried** to C and Product. |
| R-09 | NOTE | The classifier has no approved numbers; a channel needs its own review | Kept (unwired). |
| RC-01–RC-03 | NOTES / CONDITION | `onlyInMode` correct; the catch must not hide defects; clients take zone availability only from the week-level status | **Carried** (RC-03 is in CONTRACT_DELTA §1.1 and the Swift comments). |

## What the reviews did not cover

- **Security review before real athletes:** heart-rate and lab data are health-adjacent. This review was for synthetic integration, not for production data; that is a decision condition.
- **Human revalidation:** HQ-V1HR5-SSCTR-ZONES is proposed and not appended (the queue owner appends it).
- **Clinical:** medication or conditions that change heart-rate response are ASK / ELIGIBILITY_UNASSESSED and were not decided.
- The device results came after the reviews. They are recorded in NATIVE_VALIDATION_REPORT.md and were not re-reviewed: they are replays of the reviewed oracles and fixtures.
