# R7-D Phase 3.5: quality/reliability check of candidate `8e78b8a` (QRE-R7D-PHASE35-CHECK-r1)

**Verdict: NOT_READY.** One blocking finding (QRE-P35-01). The reference record is `QUALITY_CHECK_R7D_PHASE35.json`.

## What closes

- **QRE2-P34-01 is closed.** On every path probed, the start-time question that a re-read of a recorded return raises can be answered.
  - The answer works by a declaration, a weekly review or a return report.
  - R07 cases: the restatement is read and the I6 confirmation follows. The named confirmation then applies the return, equal to the start time stated from the outset. No review asks through week 11.
  - R04 cases: the restatement applies the correction, equal to the control. The same correction sent again changes nothing.
  - Confirming first, timeless or wrong-day restatements, "newest decides", replays and an earlier applied return in the history all resolve.
  - Every persistent ask left is for a fact that is still unstated, and stating it clears the ask at any week probed (up to week 9).
  - R02, R03, T25 and the other 24 Phase 3.4 probe cases are unchanged.
- **F01 and F02 are correct and scoped.**
  - F01 changes only running in a gateless week that the systemic rule holds.
  - F02 changes only the re-read of a correction.
  - An independent differential reproduces the author's: 172 cases, 168 the same, and the same 4 differing (DEV-48, DEV-49, DEV-51, DEV-52).
- **The Δ23 items are done.**
  - The NESTED guard reads "after" by first days (QH4 and DEV-50 are not evaluable).
  - T34 kills the depth-2 drop, and T35 kills N01 and N05 (reproduced).
  - Units that cannot be evaluated are listed with their case result.
  - The Δ30 text is present.
- **The evidence is accurate for what it claims.**
  - Suite 1002/1002, directed 95/95.
  - RED is 7/3 on `46934a0`.
  - The outputs and the source bytes hash as listed.
  - Fidelity is reproduced: the rerun of the role's probe equals the author's fidelity output.

## Blocking

**QRE-P35-01 (HIGH; found now, carried since `46934a0`; narrow; runtime-only).** The case: the latest break (the trip) is reported again with the same dates and no `episodeId`, after a return that read an earlier break as its own return. This is the R7-A §9 duplicate rule, and the I6 question itself offers it ("episodeId X, or the same dates").

What the candidate does:
- It re-establishes the trip alone and drops the holiday's own return from the record and the state.
- Strength then resumes known loads: back-squat 2x8 at 85 kg where the return in force gives 1x7 ESTABLISH. In the R07 answer flow it reaches 3x10 where the named confirmation gives 3x9 and 2x8.
- R7D-FREEZE-4 asks on the same input. This is a progression regression on an accepted input, which the Phase 3.5 authorization excludes.
- HARNESS-7 P18(d) detects it, but no corpus case has the shape.

**Smallest fix.** In `returnAfterPause`, call `recordedStop` for an unnamed report whose days equal the latest episode's (the rule-2 test), as it already does for a named one.

A scratch prototype was checked, not delivered; the worker owns the change. It gives:
- 95/95 directed tests and 1002/1002 suite;
- 0 of 172 corpus cases changed;
- the unnamed re-send and the unnamed confirmation equal to the named ones.

The tests to add, RED on `8e78b8a`, are the QH17 and QH18 shapes with their controls.

## Non-blocking

These bind before any holdout or the next runtime change.

| Id | Severity | What | Smallest fix (checked on scratch) |
|---|---|---|---|
| QRE-P35-02 | MEDIUM | P18(e) is not a necessary condition. It counts recovery ADVERSE with performance OVER, which the runtime reads as CONFLICTING. QH15 and QH16 false-block the candidate with SYSTEMIC_WEEK_REENTERED. | Count only `recovery ADVERSE && (confounded \|\| performance != OVER)`. DEV-48 is still detected. Domain question to the SSCTR. |
| QRE-P35-03 | MEDIUM | Under Δ32 a restatement ends an earlier break's P17 window and opens none. A runtime that silently drops a kept correction (mutant QH-DROP) passes every property and relation. | In P17, a restatement does not end an earlier window. QH-DROP is then detected, with no false block. |
| QRE-P35-04 | MEDIUM | P18 lacks the restatement reading. The next return after a KEEP restatement false-blocks the candidate (QH19, QH20: OLDER_BREAK_DROPPED). | Leave restatements out of P18's open breaks. Sensitivity is kept. |
| QRE-P35-05 | MEDIUM | Two clauses are pinned by no test; each mutant passes 1002/1002. Q10: a reason-text change consumed as a restatement skips the clinical route after the re-entry week. Q15: reading the first return relocks the case that has an earlier applied return. | Two directed tests (R07n2, R07m). The candidate already behaves correctly. |
| QRE-P35-06 | LOW | The post-review guard of `freeze-r7d-5.mjs` (line 99) covers only src, test, harness/lib and r7d-harness. | Extend the paths, or check `git diff <reviewed> HEAD` before the freeze. |

With all three harness fixes on scratch:
- 194 cases show no false block (only the VARIANT rows that have failed since Phase 3).
- DEV-48 and DEV-49 are still detected on `46934a0`.
- QH17 and QH18 are detected on the candidate.

## Conditions for freeze

- **CQ3-1:** no freeze of `8e78b8a`. Fix QRE-P35-01 in a new candidate, with RED tests, a differential limited to that shape and a new independent check.
- **CQ3-2:** add the QRE-P35-05 tests in that candidate.
- **CQ3-3:** fix QRE-P35-02, -03 and -04 in the harness before any holdout, under a PREREG addendum and with DEV cases.
- **CQ3-4:** extend the freeze guard (QRE-P35-06) before any freeze run.
- **CQ3-5:** carry the routed items.

`freeze-r7d-5.mjs` refuses on this verdict.

**States:** V1_COACHING_AUTHORITY_READY = NO; FINAL_HOLDOUT_EXISTS = NO; F08_OPEN; the queue stays at 235.

**Scope note:** while this record was being written, HEAD moved to `6203dcf`, another author's bounded-cycle commit acting on these findings (it changes `r6-adaptation.mjs` and `r7d-phase35.test.mjs`). Five harness and probe files were also modified in the working tree without a commit. None of this is reviewed here, and none of it was touched. The verdict above is for `8e78b8a`. `6203dcf` and any harness revision need their own independent check.

**Probes:** `probes/qre2-p35-*.mjs`; outputs are in `probes/out/`. All scratch work is in `qre2-p35-20261107-165736-736`; nothing was deleted, committed or run against the repository.
