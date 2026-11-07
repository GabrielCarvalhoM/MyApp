# QRE-R7D-PHASE35-CHECK-r2: quality and reliability recheck of the Phase 3.5 bounded cycle

- **Candidate:** `33d3181`. Its runtime commit is `6203dcf`; `r6-adaptation.mjs` has SHA-256 `5e910f52…`.
- **Supersedes:** QRE-R7D-PHASE35-CHECK-r1, which judged `8e78b8a` NOT_READY. That record is not edited.
- **Verdict: READY_WITH_CONDITIONS.** No finding blocks. The reference record is `QUALITY_CHECK_R7D_PHASE35_R2.json`.
- **Reviewer:** an independent Quality & Reliability Engineer instance. It wrote none of the work under review and did not open `phase35/reviews/ssctr/`.
- **Method:** every run used new `git archive` rebuilds in scratch:
  - `33d3181`;
  - `8e78b8a`;
  - R7D-FREEZE-4 (`8bbbb8e`): its 129 bound files match;
  - `46934a0`.

  Nothing was deleted. No `freeze-*` script, `verify-*` script or `npm run verify` was run.

## Answers

**Q1. QRE-P35-01 and CQ3-1: closed.**
- **The fix as stated.** The `6203dcf` line is the r1 smallestFix, byte for byte; only the comment differs. The r1 runtime probe gives the same 74 of 74 cases on the candidate and on the r1 prototype.
- **QH17 and QH18.** Both shapes now equal the named reports, in the record and in the doses. Example: back-squat 1x7 ESTABLISH, where `8e78b8a` gave 2x8@85. No ask remains through week 11.
- **Controls:**
  - the TRAINING_AFTER row is kept;
  - a single-break duplicate stays SAME_BREAK / DUPLICATE;
  - a continuity return re-sent with the trip's days still asks.
- **RED on `8e78b8a`.** With the candidate's tests on `8e78b8a`, the suite gives 1004/1005: T36 alone fails. The failure comes from the dropped separate breaks. Scratch variants show that each shape also fails on its own assertion.
- **Differential.** I ran an independent differential with no trigger filter, on step views and record views.

  | Baseline | Standard cases (177) | Same | Differ | Which |
  |---|---|---|---|---|
  | `8e78b8a` | 177 | 176 | 1 | DEV-53 |
  | `46934a0` | 177 | 169 | 8 | the author's eight |
  | R7D-FREEZE-4 | 177 | 148 | 29 | r1's 24, plus DEV-53 to DEV-57 |

  - On the probe corpora, only duplicate shapes differ.
  - Against R7D-FREEZE-4, the only new ask is DEV-49's, as in r1.
- **Other paths the new branch reaches.** I probed 18 duplicate shapes, including:
  - a continuity return confirmed with the stop's dates;
  - a partial client record, which asks for the record;
  - clinical reports;
  - a re-send in week 9;
  - a re-send with a start time, or by last day and length only;
  - a re-send after a named correction;
  - the weekly-review and declaration channels;
  - R07 with the confirmation first.

  In every one, the unnamed form equals the named form on the candidate. Non-duplicates are unchanged.
- **Regressions.**
  - Against R7D-FREEZE-4: the candidate's doses are never higher than R7D-FREEZE-4's named answer.
  - Against `8e78b8a`: the suite gives 1005/1005, and the Phase 3.4 probe gives 32/32 identical cases.

**Q2. CQ3-2: met.**
- Q10 is killed by T37 alone, and Q15 by T38 alone.
- Reverting the fix (QF0, the author's P35-M13) is killed by T36.

**Q3. CQ3-3: met as stated.**
- **P18(e)** counts only what the reducer reads ADVERSE. DEV-54 is clean.
- **P17:** a restatement ends only its own break's window.
- **P18** leaves restatements out of its open breaks. DEV-55 is clean.
- **Detection still holds:**
  - DEV-48 and DEV-49 on `46934a0`;
  - DEV-53 on `8e78b8a`;
  - the r1 silent-drop mutant QH-DROP, now caught on DEV-57, QH10, QH11 and QH12.
- **No false block** on the 59 DEV cases, the regressions or the r1 probe cases. One exception, in the new P17 code (QRE3-P35-02, below).

**Q4. CQ3-4 and the evidence: adequate.**
- **The guard (read, not run)** refuses:
  - any change to src, test or the harness after the reviewed commit;
  - anything but added files under the two review folders;
  - uncommitted bound files.
- **The evidence:**
  - mutation 18/18 and both differentials were reproduced;
  - fidelity is unchanged apart from paths and the source hash.

## Findings (none blocking)

| Id | Severity | Scope | What | Smallest fix |
|---|---|---|---|---|
| QRE3-P35-01 | MEDIUM | tests | Three clauses of the new line are pinned by no test: the duplicate test by last day and length, the propagation of the unnamed re-read's decisions, and the comparison with the report in force. Each mutant (QF3, QF6, QF7) survives 1005/1005. Each brings the drop back on an accepted input where the candidate is correct. HARNESS-7 r2 detects each, but only on this check's probe shapes. | Add directed tests of the N16b, N6 and N9 shapes in the next authorized candidate, or before any change to `returnAfterPause`. No runtime change. |
| QRE3-P35-02 | MEDIUM | harness | `sameBreakNamed` compares names literally. When a break has its own episodeId and the two answers name it in different forms, a correct runtime is false-blocked by P17 (QH21, QH22). | Resolve both names through the listed row. The scratch prototype fixes QH21 and QH22 and keeps QH-DROP and the `8e78b8a` detections. It goes in a PREREG addendum before any holdout. |
| QRE3-P35-03 | LOW | harness | P18(e) requires `completed` for confounded reports too, which is narrower than the runtime and than Δ35's text. It remains a necessary condition. | Align the code or Δ35, in the same addendum. |
| QRE3-P35-04 | LOW | freeze script | `freeze-r7d-5.mjs` does not bind the `probes2/` folders where the r2 reviews write. | At freeze time, check those files against the records' SHA-256 lists. |

## Conditions for the freeze

| Condition | Status |
|---|---|
| CQ3-1 | Satisfied |
| CQ3-2 | Satisfied |
| CQ3-3 | Satisfied; residual items carried as CQ4-2 |
| CQ3-4 | Satisfied; disclosure carried as CQ4-3 |
| CQ3-5 | Carried unchanged |

New conditions:

- **CQ4-1** (Engineering worker): add the QRE3-P35-01 tests by the next authorized candidate, or before any change to `returnAfterPause` or `recordedStop`, whichever comes first.
- **CQ4-2** (Chief / instrument owner): resolve QRE3-P35-02 and QRE3-P35-03 before any final holdout exists, under an append-only addendum and with DEV cases of the new shapes.
- **CQ4-3** (Chief): run the freeze only on `33d3181` plus new review-folder files, and only if the SSCTR recheck passes on its own. At freeze time, check the `probes2/` files against the records' SHA-256 lists.

## States

- V1_COACHING_AUTHORITY_READY = NO
- FINAL_HOLDOUT_EXISTS = NO
- F08_OPEN
- The queue stays at 235, with no append.

Probes are under `probes2/` and their outputs under `probes2/out/`. The record lists the SHA-256 of all 58 files.
