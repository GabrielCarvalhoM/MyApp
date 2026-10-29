# R7-A independent engineering re-check — brief

You are the independent engineering judge of DOMAIN_COACHING_R7-A. Your first review (`reviews/quality-engineering-r7a-review.md` / `.json`, R7A-QE-r1, on R7A-FREEZE-1) returned NOT_READY with blockers QE-R7A-01…12 and LOW findings 13–18. You did not write this runtime and you do not fix it.

**Bound (Founder rule, `TASK_CONTRACT.md`):** this is the single narrow re-check. There is no further cycle: whatever still blocks after it closes R7-A NOT_READY with that blocker named. Scope: (1) whether each of your findings is fixed on the new freeze, and (2) defects the second-cycle delta itself introduced. Do not re-open areas the delta does not touch.

## Target

- **R7A-FREEZE-2**: `CoachingCore/r7/RUNTIME_FREEZE_R7A_2.json` (source digest `f56ae974762523b1efacd9ad7a9046cc7f6b7d33e42a7c2c955e758ef0f7821c`; every file with its SHA-256). Verify your reviewed files against it.
- Delta from FREEZE-1: `dossier/RUNTIME_DELTA_R7A_CYCLE2.diff` (4 files: `r6-program.mjs`, `r6-adaptation.mjs`, `r6-provenance.mjs`, `r6-intake.mjs`; no policy change) and the new `CoachingCore/test/r7a-cycle2.test.mjs` (16 property or metamorphic tests, one or two per class). Policy R6-POLICY-5 `18ec48f3…` unchanged.
- Your probes are in `reviews/qe-probe-*.mjs` and `qe-lib.mjs`; they run against the current runtime and, with `QE_RUNTIME=pre`, the R6 closure runtime. Node 24, `devAuthority()` (DEV_TEST_ONLY), offline.

## Claimed resolution (check each on FREEZE-2)

| Finding | Claimed change |
|---|---|
| QE-R7A-01 | A same-week review (weekly, schedule change, goal change) starts next week from the return state an earlier review of the week stored (`rebasedNext`), so the order of the two reviews does not matter |
| QE-R7A-02 | A session later the same day with no report is still ahead (`aheadOf`): the return re-plans it; when re-entry starts next week, a session still ahead this week waits (rest by design) |
| QE-R7A-03 | A rebuild that starts in the current week keeps what is not ahead and re-plans what is; an event change reaches this week when it moves a remaining day into the taper, race-week or post-event window or the race is still ahead this week; a postponed race leaves no old race |
| QE-R7A-04 | `validateWeeks` skips executed history (sessions kept with an unchanged prescription); immutability uses the same "ahead" test |
| QE-R7A-05 | Two agreeing reports merge per exercise (`mergeActual`: known beats unknown, then declared source quality, then the conservative value); source quality comes from the declared quality or a device activity id, never a provider name prefix |
| QE-R7A-06, 07 | The exercise-level agreement test compares repetitions and reserve within one, and loads in pounds are converted |
| QE-R7A-08, 09 | Every report merged into a row keeps its input hash (`provenance.inputHashes`); a carried superseded row stays findable under every merged report id; an exact replay of a merged report is recognised |
| QE-R7A-10 | Planner and moves share `needsReestablishment`: a move is offered only when every row keeps its kind on the new date |
| QE-R7A-11 | Equipment window dates must be real dates with the end not before the start; otherwise ASK |
| QE-R7A-12 | When a log confirms the known load, its repetitions replace the target only on ADVANCE or EARNED; HOLD and REGRESS keep the planned target; a newly established load is adopted with its logged repetitions |
| QE-R7A-13 | Intake lead: the athlete's own list vs an external history by where the record came from; instants compared as instants (a date-only record at the latest instant of its day); the last tie by content, never by label; a later record without a load keeps the earlier hint |
| QE-R7A-14 | `exposure.phasedSets` = the count before any time fit (a fatigue reduction lowers it); the plan records each row's fitted count; a fit is not a reduction; the return ceiling is the largest whole count executed outside a phase reduction (SSCTR R20), read alike in projection and review |
| QE-R7A-15 | The week's entry flag travels in its state; a week planned as a return-entry week stays one when its remaining days are rebuilt |
| QE-R7A-16 | Only a carried row can be history; a new report's `superseded` flags are dropped and it passes every check |
| QE-R7A-17 | The review reads a practice row by its exposure kind, as the plan does |
| QE-R7A-18 | Not changed: routed to R7-B (CORE rotation) |

The author's indicators on your own probe outputs (FREEZE-1 → candidate): all of 01–17 move from your failing condition to the fixed one; 18 unchanged.

## Found by the author during the second cycle (please scrutinise)

1. The first version of the QE-14 change recorded `phasedSets` at the phase step only, so a fatigue-reduced week read as unreduced and released a regain cap (the SSCTR's FR2 caught it before the freeze). Fixed: the fatigue reduction lowers the recorded count.
2. The first version of the QE-03 "reaches this week" test compared week phases, so a goal change effective next Monday re-planned this week for a phase rename (holdout H25). Fixed: only taper/race/post-event day moves or a race still ahead this week reach it.
3. The projection read untrimmed counts while the review read fitted ones (your QE-14 "two readings"); with the SSCTR's R20 both now read the largest whole fitted count.
4. A KEEP review leaves the projection as the next week's state; the regression difference H05 / WALK_JOG_FIVE_DAYS is that projection now reading the fitted count.
5. The first version of the QE-12 change also applied in the branch that adopts a newly established load, so a re-establishment by effort (2x8 at 18 kg) kept the old 10-rep target (the SSCTR's split-week probe showed it). Fixed: a log that confirms the known load leaves the target to the gate; a newly established load comes with its logged repetitions.
6. Mutation check: one first-cycle revert ("counts from the first executed exposure") now survives. Since R20 it can only change the reduction flag of a week whose executed exposures differ in reduction while a cap is active; `probes/r7a-mutant-reach-search.out.json` (A) finds no such reachable week. It is recorded as a documented survivor, not a pass — try to reach it.

## Regression, mutation, class probes

- `CoachingCore/r7/REGRESSION_R7A.json`: R5 24/24 identical; profiles 15/16; simulations differ in T04, T05, T08, T13; holdout 24/35 identical; every difference is named by its fix in `scripts/verify-r7a.mjs` (`EXPLAINED`); only status change H23. FREEZE-1's record: `r7/REGRESSION_R7A_FREEZE1.json`. Two bookkeeping fields are ignored as byte-level (the recorded entry-week flag and per-report input hashes); try to show that ignoring them hides a decision difference.
- `probes/mutation-check-r7a.out.json`: `33 of 34 (one documented survivor, below)` single-fix reverts caught by the R7-A tests (FREEZE-1 run kept as `.FREEZE1.*`).
- `probes/r7a-class-probes.CYCLE2.out.json`: every class not reproduced except C15 (routed R7-C), as on FREEZE-1.

## What to write (only these files)

- `reviews/quality-engineering-r7a-recheck.md` and `reviews/quality-engineering-r7a-recheck.json`: per finding FIXED / NOT_FIXED / PARTIAL with evidence; any new finding with severity, blocking, new/narrow/runtimeOnly, mechanism and reproduction; a verdict; and `freezeReviewed` with the source digest you recomputed.
- Probes: `reviews/qe-recheck-*.mjs` and their outputs. Never edit `CoachingCore/`, the dossier or any other file.
