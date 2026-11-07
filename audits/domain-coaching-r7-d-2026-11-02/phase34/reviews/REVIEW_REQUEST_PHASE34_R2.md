# R7-D Phase 3.4: request for the narrow rechecks of the corrected candidate (after the one bounded cycle)

## The candidate

Branch `claude/domain-coaching-r7-d`, commit **`46934a0`**.
- **Runtime bytes:** those of `77768e6`. Only `CoachingCore/src/r6-adaptation.mjs` changed since the first candidate `1978cc4`: +22/−9, see `git diff 1978cc4 77768e6 -- CoachingCore/src`. `r6-composition.mjs` and every other source file are unchanged since `1978cc4`.
- **Tests:** nine directed tests were added to `CoachingCore/test/r7d-phase34.test.mjs` (T22 to T30, 40 in the file). No other test byte changed.
- **Instruments and text:** commit `0b502b1` (R7D-HARNESS-6 r2, DEV-46 and DEV-47, the PREREG-6 addendum Δ14–Δ20, INTERFACE-6, the brief, the mutation and evidence probes). Evidence refreshed in `46934a0`.

**The first reviews**, both of `1978cc4`, are now committed:
- `ssctr/SSCTR_PHASE34_RECHECK_R7D.json` (SSCTR-R7D-P34-RECHECK-r1): BLOCK, SSCTR-P34R-F01 to F04, CFR-01 to CFR-06;
- `engineering/QUALITY_CHECK_R7D_PHASE34.json` (QRE-R7D-PHASE34-CHECK-r1): NOT_READY, QRE-P34-01 blocking, CQ-1 to CQ-6.

**This is the one bounded cycle.** A blocker these rechecks find means no freeze: the phase closes with that blocker named and routed. There is no further correction cycle.

## What the cycle changed

| Finding | Runtime change (`r6-adaptation.mjs`) | Directed test (fails on `1978cc4`, passes now) |
|---|---|---|
| SSCTR-P34R-F01 | `appliedBetween(ctx,after,before,except)`: the episode of the break being read is never a return between the breaks (`stopOf` passes `H.g.identity`) | T22 (your C5 = C5f) |
| SSCTR-P34R-F02 | the race touch and the race count only when `!o.partial` (the existing completion rule; `bindObservations` exempts the race's minutes) | T23 (RT1, RT1o = RT2o) |
| SSCTR-P34R-F03 | `reentryBetween`: running re-enters through a week holding at least one required run (`RUN_GATE_ROLE` or RACE_TOUCH/RACE), with the reducer's `complete('RUN')` required only when the week has a gated run, and the race keys by their report test | T24 (RW, RWo) |
| SSCTR-P34R-F04 | in `stopOf`, after `ownReturnOf`: when `r.material` and STRENGTH was not re-entered between, ASK `interruption.startedAt` with `question:{episodeId,startDate}` of the break that starts that own stop (`startBreak`) | T25 (SD1 ASK; SD2, SD3 unchanged) |
| QRE-P34-01 | `recordedStop`: the head's first day defaults to `onDate(end,-(days-1))`, as `separateStop` does | T26 (a correction with only its length and last day, or only its length, equals the same correction with its first day; no later HOLD) |
| QRE CQ-2 (adequacy) | none | T27 (Q02, Q03: adverse race keys; a race observed after the later break began), T28 (Q09), T29 (Q12, characterization), T30 (Q10). Each passes on `1978cc4` and fails on its mutant (M18 to M22) |

Not reachable as a test: QRE Q04 (a conflicted race is asked as unreported first, on both runtimes); Q05, Q06 and Q07 (the QRE's own reading).

**Instruments** (the Chief's CQ-3 choice: correct, not only disclose; SSCTR CFR-05 done before the freeze):
- P18(a) counts an executed report only when not partial. DEV-46 is detected on R7D-FREEZE-4 (witness W-P18h).
- A second-level `WITHIN_OWN_RETURN` row is NOT_EVALUABLE when the record lists the inner own return after it in the same chain, and accounts for nothing otherwise. DEV-47 (your QH1) shows no false block; R7D-FREEZE-4 is detected on DEV-47 by P18(c) (witness W-P18i). The adjudication of such a unit is in PREREG-6 Δ16.
- P02 opens no clinical episode from a review refused unread.

**Disclosures** (SSCTR CFR-03; QRE CQ-5 and CQ-6): PREREG-6 Δ19.

## Evidence (`../evidence/EVIDENCE_PHASE34.json`, on `46934a0`)

- **Tests:**
  - suite 992/992;
  - directed: Phase 3.4 40/40, Phase 3.3 14/14, Phase 3.2 17/17, Phase 3.1 14/14;
  - conformance R7-B, R7-B.1 and R7-B.2 PASS.
- **RED:**
  - on R7D-FREEZE-4, 30/40 Phase 3.4 tests fail;
  - on a copy of `1978cc4` (checked against git), exactly T22–T26 fail, and T27–T30 pass (`red.boundedCycleOnReviewed`).
- **Mutation:** 23/23 killed, each by its own witness test. M14–M17 are the SSCTR findings, M23 is QRE-P34-01, and M18–M22 are the QRE survivors Q02, Q03, Q09, Q12 and Q10.
- **Harness validation 6:**
  - no false block on 49 development cases;
  - 20/20 sensitivity rows;
  - coverage: P17 163, P18 75;
  - 52/52 witnesses.
- **Regressions:** the diagnostic corpus has 0 property violations, with VARIANT only on the 4 triaged cases; the generated sample has 0.
- **Differential against R7D-FREEZE-4:** 167 cases, 148 identical, 19 differing, 0 unexplained. Its RACE_KEYS trigger now reads the race keys under the completion rule.
- **Decomposition:** PASS. 6 cases change by the ceiling fix alone (none raises a dose), 13 by the adaptation change alone, and none by both.
- **Witness:** RED on R7D-FREEZE-4 and clean on the candidate; the controls hold.

## Questions

**SSCTR (a fresh instance; narrow).** CFR-02 sends any deviation from the four fixes to a fresh SSCTR instance. Here there are two:
- one more runtime change (QRE-P34-01);
- the CFR-05 instrument change, made now instead of before the holdout.

Judge only:
1. **CFR-02 closure.** Your probes `ssctr/probes/p34-recheck.mjs` and `p34-recheck-detectors.mjs` on this candidate:
   - C5 equals C5f;
   - RT1o equals RT2o;
   - RT1 is OWN_RETURN, with RUN not re-entered and STRENGTH re-entered;
   - RW and RWo are TRAINING_AFTER SHORT 4, and P18(c) no longer flags RWo;
   - SD1 asks `interruption.startedAt`;
   - every other probe case is unchanged against `1978cc4`.
2. **QRE-P34-01 from the domain side.** A correction that gives only its length and last day, or only its length, is read from them. Is that the reading CF-P34-02 intends?
3. **CFR-03.** Are the disclosures of PREREG-6 Δ19 complete and right?
4. **CFR-05.** P18(a) now applies the completion rule to every counted session. Does that still match the re-entry week contract (BR-Q4)?
5. **The routed items** QRE-P34-03, -05 and -06: answer them if they are within your authority, or leave them routed and open.
6. **New numbers:** confirm that the cycle adds none.

**Quality/reliability (narrow; CQ-4).** Judge only:
- the CQ-1 fix and its test;
- the CQ-2 tests, each RED on its mutant;
- the five runtime changes: correctness, and no other runtime byte (`git diff 1978cc4 46934a0 -- CoachingCore/src`);
- the CQ-3 instrument changes: is the NOT_EVALUABLE rule sound, or can a runtime evade P18(a) through it? Is the P02 change right? Is P18(a) under the completion rule still a necessary condition?
- the evidence refresh (EVIDENCE, MUTATION with 23 mutants, validation 6 with 49 cases, regressions, differential, decomposition);
- freeze readiness on this candidate.

## Independence and outputs

- Neither of you wrote the runtime, the tests, the harness or the evidence.
- The fresh SSCTR instance did not write SSCTR-R7D-P34-RECHECK-r1, and may read it. The quality/reliability instance may read QRE-R7D-PHASE34-CHECK-r1.
- Do not open the other review's folder.
- Write only:
  - SSCTR: `ssctr/SSCTR_PHASE34_RECHECK2_R7D.{json,md}` and `ssctr/probes2/` (outputs in `ssctr/probes2/out/`);
  - quality/reliability: `engineering/QUALITY_CHECK_R7D_PHASE34_R2.{json,md}` and `engineering/probes2/` (outputs in `engineering/probes2/out/`).
- **Scratch work:** copies outside the repository only, each in a new, uniquely named directory under the session scratchpad. **Never delete anything** (no `rm -rf`, no recursive removal).
  - Rebuilt runtimes you may copy (read-only) are in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/664cd42f-94db-4235-9512-4d8817799bb1/scratchpad/p34-ev-20261107-102113-12324/`: `rt-d4` is R7D-FREEZE-4, and `rt-cand` holds the runtime bytes of `1978cc4`.
- The JSON must carry:
  - `recordId`;
  - `candidate: "46934a0"`;
  - `disposition` (ACCEPT, ACCEPT_WITH_CONDITIONS or BLOCK) or `verdict` (READY, READY_WITH_CONDITIONS or NOT_READY);
  - `findings`;
  - `conditionsForFreeze`.
- Do not commit, stage, push or merge. Do not run the freeze, verify or queue scripts, nor `npm run verify`. No UI, Figma, SwiftUI, KMP, backend, Apple Health or holdout work.
