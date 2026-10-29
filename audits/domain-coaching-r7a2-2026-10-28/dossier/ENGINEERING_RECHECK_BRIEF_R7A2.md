# R7-A.2 — engineering re-check brief (R7A2-FREEZE-1)

**For:** the independent engineering judge of DOMAIN_COACHING_R7-A.2 (gate `R7A2_ENGINEERING_RECHECK`). You are a fresh instance; you did not write this code, and the runtime author never judges it.
**Binding:** R7A2-FREEZE-1, `CoachingCore/r7/a2/RUNTIME_FREEZE_R7A2_FREEZE_1.json`, source digest `e0637ec2613acde1132d70fc64a5a6f0f1062b74d6c5cfafb6654dc1a54c7a28`, policy R6-POLICY-5 `18ec48f3…` (unchanged). The SSCTR re-checks the same bytes in parallel.
**Mission:** [FOUNDER_REQUEST.md](../FOUNDER_REQUEST.md) (§20 is your remit), [TASK_CONTRACT.md](../TASK_CONTRACT.md), [INTERRUPTION_CONTRACT.md](../INTERRUPTION_CONTRACT.md).
**The rule:** this is the single re-check of the single freeze. There is no correction cycle after it: a material blocker you find closes R7-A.2 NOT_READY and goes to the Founder.

## The question you answer (Founder §20)

> Is there any normal V1 path in which one interruption is confused with another, or in which a return starts from a temporally incorrect state?

Priority scope: P13, P14, P02, P09; the new interruption identity; the state at the break; same-break correction against a separate break; temporal causality; preservation of the earlier READY verdicts (week composition, event supersession, exercise merge). Not in scope: cold start and program quality.

The open blockers this freeze claims to close: **QE-R7A1-09** (HIGH) and **QE-R7A1-10** (MEDIUM), your predecessor's findings, and through them **QE-R7A-01**. D59 and D53 are the SSCTR's; you may report an engineering effect on them.

## Bounds

- **Read-only runtime.** Write only under `audits/domain-coaching-r7a2-2026-10-28/reviews/`. Scratch copies and mutants only in your session scratchpad.
- **Never run** `npm run verify`, `npm run simulate`, `npm run demonstrations:r6`, any `CoachingCore/scripts/verify-r*.mjs` with `--write`, `regress-r7a*.mjs`, `freeze-r7a2.mjs`, `prepare-r7a2.mjs`, or any `queue-*.mjs`. `verify-r7a2.mjs` without `--write` is read-only and may be run. `verify-r7a1.mjs` (read-only) now fails `freeze-current` by design: R7-A.2 supersedes FREEZE-A2.
- The probes in `audits/domain-coaching-r7a1-2026-10-27/reviews/` and `probes/` print only. `probes/ssctr-r12-instrument.mjs` and `probes/mutation-check-r7a2.mjs` of this mission write next to themselves: copy them into your folder before running (`R7A_PROBE_OUT`, `MUT_OUT`).
- The judges' library `qe-a2-lib.mjs` takes `QE_LIVE_ROOT` for another runtime root; a byte-exact FREEZE-A2 runtime is at `audits/domain-coaching-r7a2-2026-10-28/freezeA2-source/CoachingCore`.
- Synthetic data and the DEV_TEST_ONLY authority only. No commit, no network.
- Verify the binding at your start and end: recompute the source digest (`hash()` of `src/value.mjs` over the `src/*.mjs` SHA-256 map, as in `scripts/freeze-r7a2.mjs`) and check the 79 bound files.

## What changed (R7A1-FREEZE-A2 → R7A2-FREEZE-1)

- **Changed:** `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs`. **Added:** `test/r7a2-interruption.test.mjs` (14 tests). Nothing else: no other source or test, the policy, the fixtures.
- **Diff:** `dossier/RUNTIME_DELTA_R7A2.diff`.
- **Contract:** `INTERRUPTION_CONTRACT.md` (R7A2-COMPOSITION-3) amends the return sentences of C5 of the R7-A.1 composition contract; every other clause is unchanged.

## The model

| Piece | Code | What it does |
|---|---|---|
| The break a return reports | `liveReturns`, `breakOf`, `interruptionEpisode` (`r6-adaptation.mjs`) | Every `REESTABLISH` decision records `interruption.{startDate, endDate, episode, relation, supersedes, stateAt, entry}`. Against the latest live return: `NEW` when the break begins on or after the day it was reported; `SAME_BREAK` when it begins before that report and does not end before that break began (it supersedes it and keeps its identity); otherwise `ASK` (it ends before the latest break began, or it spans the re-entry of the return before) |
| The state at the break | `stateAtBreak` (`r6-adaptation.mjs`), `strengthAtBreak` (`r6-program.mjs`) | The latest point at or before the break's first day: the start of its week before any return of that week replaced it, or the start a live return reported in that week on or before that day set. Then the exposures executed after that point and before the break (sessions planned before it or executed before it; executions observed before it; decisions dated before it), read as facts only: in use, last performed date, last executed whole count when the logged target was met. No adoption, step, cap, return step or block set |
| Shared readings | `executedOf`, `countsOf`, `wholeCounts`, `setUp`, `reEstablish` (`r6-program.mjs`) | Extracted from `advanceStrength` so the week's transition and the state at a break read executed exposures one way. `advanceStrength` behaviour is unchanged (505 earlier tests, R5 24/24, profiles 16/16, simulations 14/14) |
| Easy-slot ownership | `shortReturnEasy`, `composeWeeks` carry (`r6-composition.mjs`) | The eased slot carries `easedFor` = the break's identity. A short return's slot is the one its break eased, else the first quality slot still ahead; carried per break |
| Supersession of adaptations | `returnAfterPause` `strip` | Only the superseded break's `RETURN_WAIT` and `SHORT_RETURN_EASY` are replaced; a separate break's stay |

## Evidence on the frozen bytes

Every output below was produced by `probes/run-evidence-r7a2.mjs` and is listed in `probes/EVIDENCE_RUNS_R7A2.json` with the source digest before and after its run. `node CoachingCore/scripts/verify-r7a2.mjs` (read-only) checks them; before the re-checks it passes 17 of 19 checks; the two open ones are `independent-reviews` and `deliverables`.

| Evidence | Result |
|---|---|
| Your predecessor's P13 (`runs/qe-P13.out.json`) | X, X2 and S: the second return keeps the re-entry (1 set @RIR 4, the run in RETURN with its step). 0 rows above what was executed since the first return, 0 above the re-entry plan, 0 at the pre-break dose (FREEZE-A2: 3x5 @RIR3 at the pre-break known load and a 70-minute long run) |
| P14 (`runs/qe-P14.out.json`) | Both breaks: week 4 Tuesday runs EASY (34), the second break’s own slot; the second break alone: EASY 41; two eased slots, one per break (FREEZE-A2: THRESHOLD 41 after both breaks) |
| P02 (`runs/qe-P02.out.json`) | Byte-identical to its FREEZE-A2 output (the same-break correction across the week boundary) |
| P09, seeds 7 and 1013, 2,500 sequences each | 5,000 sequences, 0 errors; O1, O2, O3, O4, O6 and O7: 0; O9: 6 refusals, all `phaseDose:glute-bridge:accessory` (QE-R7A1-07, unchanged). Both outputs are byte-identical to their FREEZE-A2 outputs |
| P01, P01b, P03, P04, P05, P07, P08, P10, P15, P16 | Byte-identical to their FREEZE-A2 outputs |
| P06 | One named row: a moderate return's entry keeps the rep target an accessory was executed at before the break (7, was the goal's 5) |
| `node --test` | 519/519 (505 earlier and 14 new) |
| `test/r7a2-interruption.test.mjs` on a byte-exact FREEZE-A2 copy | 14/14 fail (`probes/r7a2-tests.on-FREEZE-A2.out.txt`) |
| Author self-challenge (`probes/r7a2-self-challenge.mjs`), 42 cases in 13 classes | 0 violations; 16 on FREEZE-A2 (`probes/r7a2-self-challenge.FREEZE-A2.out.json`) |
| Mutation of the new invariants (`probes/mutation-check-r7a2.out.json`) | 19/19 caught |
| R7-A.1 author probes | Composition probes, three-step and D58 combinations: byte-identical. Monday grid (157 pairs, 0 defects): equal up to the D59 entry reps of the expected RETURN_MODERATE × RETURN_SHORT pair. Evening grid (1,188 pairs): the two named pairs of boundary 1 below, rows equal. D56 grid: rises or ends after a trimmed week 0, capped jumps 0, trimmed cap-weeks 206 → 200 |
| Regression against FREEZE-A2 (`CoachingCore/r7/a2/REGRESSION_R7A2.json`) | R5 24/24, profiles 16/16, simulations 14/14, R6 holdout 34/35: R6-H17 differs in state facts only (last performed dates; one last executed count 1 → 2 under the declared ceiling rule), no row and no status |

The self-challenge classes: two breaks (same week, next week, short or moderate second break); three reports (new, its correction, a new break after it); a correction then a new break; a late report of an earlier break; first exposures (NONE, FAMILIAR, KNOWN × short, moderate, long × two start days); the week boundary at three time zones; a break starting on an executed session's day; an equipment change, a fatigue report and a missed-session move between two breaks; a re-establishment before a short or moderate break.

## Declared boundaries (please rule)

1. **The record as reported.** A return reads the executions recorded by its report; an execution of a session before the break recorded after the return does not re-derive that return (the record is append-only and no transition is replayed on a later fact); a newer report of the same break reads it. In the R7-A.1 evening grid this makes two pairs (race program, Sunday: a short return and a report of the week's earlier sessions, in both orders) differ: the rows are equal; next week's start differs only by those exercises' last performed dates. On FREEZE-A2 the pairs were equal because the return ignored the week's executions (D59). Is this acceptable, or a material regression of WEEK_COMPOSITION_INTEGRITY?
2. **ASK** for a report that ends before the latest reported break began, or that spans an earlier re-entry.
3. **The point is the plan's start of the week**: when the week before the break was not reviewed, it is that week's conditional plan (C3), as for every week.
4. **The plan before a return**: a session executed after a break ended but before its return was reported is never a fact of that return or of a later break (C5).
5. **A break's first day is a whole day** (breaks are stated in dates): a session executed that day and a review decided that day come after the break began. A break reported from Sunday starts from the week before that evening's review; from Monday, from the start that review set. The report time alone never changes the break (P5, P6).
6. **Two pre-freeze refinements found by the author's self-challenge** (CHECKPOINT resume point 3): a newer report of the same short break made after its slot was run eases no second slot; a conflicted report executes nothing before the break (QRE-R6-14).

## What to deliver

`reviews/quality-engineering-r7a2-recheck.md` and `.json`. The JSON carries at least: `revision` (R7A2-QE-r1), `verdict` (READY or NOT_READY), `freezeReviewed: {revision, sourceDigest}`, the status of QE-R7A1-09, QE-R7A1-10 and QE-R7A-01 (CLOSED or OPEN), your findings with severity and whether each is material, and your recommendation for WEEK_COMPOSITION_INTEGRITY, STATE_PRESERVATION_INTEGRITY, EVENT_SUPERSESSION_INTEGRITY, EXERCISE_MERGE_INTEGRITY and the engineering side of RETURN_RECOVERY_CEILING_INTEGRITY. READY means you found no material blocker of this class on R7A2-FREEZE-1.
