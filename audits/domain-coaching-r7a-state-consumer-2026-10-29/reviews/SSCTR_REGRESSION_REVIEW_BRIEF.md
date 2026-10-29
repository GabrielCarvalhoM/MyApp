# SSCTR REGRESSION REVIEW BRIEF — COACHING CORE: STATE MODEL CONSUMER CLOSURE

**Not yet dispatched.** This brief is for the project's Sports Science & Concurrent Training Reviewer. It and [ENGINEERING_REVIEW_BRIEF.md](ENGINEERING_REVIEW_BRIEF.md) point at exactly the same bytes.

**This review is regression-only (Founder request §31).**
- The mission is domain engineering: the consumers of HistoricalState, the PlanningView and evidence through time.
- No sporting rule was added. Policy R6-POLICY-5 (`18ec48f3…`) is unchanged.
- Every dose rule the runtime applies is one you approved, named where it is used.
- Do not reopen the general literature.

## The freeze you review

| | |
|---|---|
| Freeze | **STATE-MODEL-CONSUMER-FREEZE-1** |
| Freeze record | `CoachingCore/r7/state-consumer/RUNTIME_FREEZE_STATE_MODEL_CONSUMER.json` |
| Source digest | `adab37162d4f30d783faed2fe02fd44769a4be36be7bb1f6e8455a01b86235e5` |
| Policy | R6-POLICY-5, `18ec48f3…`, unchanged |
| Runtime changed | `src/r6-adaptation.mjs`, `src/r6-program.mjs` |
| Byte-exact predecessor | `audits/domain-coaching-r7a-state-consumer-2026-10-29/state-model-freeze-source/` (HISTORICAL-PROJECTION-FREEZE-1) |
| The freeze you accepted for D53, D56–D59 | STATE-EVIDENCE-FREEZE-1, byte-exact in `audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source/` |

Confirm the digest at the start and the end of your review. No runtime change follows the freeze.

## What to verify (Founder §31)

F1, F2, F3, D53, D56, D57, D58, D59, HOLD, MAINTAIN, return, restart, restoration, progression.

## Your own kit, re-run unchanged on these bytes

`probes/run-ssctr-kit.mjs` re-ran every instrument your R7ASM-SSCTR-r1 runner ran, with the same script and environment. It left out only the `.PRED` variants and the literature search. Outputs are in `probes/kit-final/` (never in your folders); `RUNS.json` binds each of the 43 jobs to `adab3716…` before and after, with 0 failed.

The comparison with your runs on both earlier freezes:
- `probes/runs/ssctr-kit-compare.out.json`: byte identity, wall clocks and labels aside;
- `probes/runs/ssctr-kit-explain.out.json`: every differing leaf, sorted by shape.

| Instrument | Against STATE-EVIDENCE-FREEZE-1 (your accepted run) | Against HISTORICAL-PROJECTION-FREEZE-1 |
|---|---|---|
| Short grid, D58, first-week grid (r7a1), same-day (f), ceiling, rotation, same-day (x), rotation trace, caps extension (2 shards) | **Byte-identical** | Identical, except the caps extension (3 counts) |
| Restoration grid shards 1–3, caps grid shards 1–3 (the instruments' own outputs: counts and examples) | **Byte-identical** | Differ (the predecessor had F1) |
| Restoration grid and caps grid, shard 0 (the same outputs) | Counts differ; **B = 0, C = 0**; no cap rises or ends after a non-whole week; caps: 0 unexplained, 0 covered jumps | Differ |
| x-items | 15 rows; all are accessory repetition targets 7 → 6 under STRENGTH (item 3 below) | Differ also by F1 |
| x-firstweek (8 shards) | Only the REPS_ROW tally: 108 → 0 (item 3); E = O = B = 0 in every class | Differ also by F1 |
| x-trace-sd | Two `regainCap` atoms of a start state; the rows are identical | **Identical** |
| Round-12 instrument | Identical to the predecessor in 42 of 43 sections; section V (the D47 statement, NF-R7ASM-1) is identical to STATE-EVIDENCE-FREEZE-1 | — |
| Your probes (reps, tick, the traces, changes, regression, holdout detail, probe, se-, b-, f-probe, systemic) | Differ, as each probe reads the change it was written for; read below | — |

**Every row of the restoration grid** (the caps grid reads the same 864 timelines) is compared row by row on the three trees in `probes/runs/grid-signature.*` and `grid-explain.shard*`. This is finer than the instruments' own counts. The grid's counts are identical to your accepted run in shards 1–3; its rows differ there too.

At row level, 159 of the 864 timelines differ from your accepted run (shards 0–3: 27, 42, 43, 47). Every differing row falls into one of three classes, **0 unexplained**:

| Class | What it is | Rows |
|---|---|---|
| `CARRIED_FROM_PREDECESSOR` | The return base you approved on the predecessor (item 8) | 1,464 |
| `GOAL_RANGE_CUT` | This mission's F3 class (item 3) | 132 |
| `F1_RESTORED_WITH_RETURN_BASE` | A return step the predecessor skipped, back, at the predecessor's executed target | 60 |

## The findings, on your instruments

| Finding | On these bytes | Where |
|---|---|---|
| **F1** (D53, D57) | Restoration grid B = 0 (predecessor 2), caps grid B = 0 with 0 covered jumps, caps extension B = 0. Your two timelines `sg-ret16thu-{STRENGTH,HYPERTROPHY}-K-3-20-after3` come back 1 → 2 → 3 | `kit-final/grid.*`, `caps*`, `trace-b`, `trace-b2` |
| **F1, run side** | A return reported on Friday goes entry, entry, step 2, prior dose, as on your accepted freeze; restart minutes step from the minutes run | `probes/runs/r7asc-run-reentry-step{,.PRIOR,.SE}.out.json` |
| **F1, walk/jog side** | After a short return the walk/jog step follows the step run (found by the mutation check) | test `F1, the walk/jog side` |
| **F2** | Your repetition probe: 126 rows, none outside its goal's range (the predecessor: 9 under STRENGTH). HOLD repeats 82.5 × 5. Your tick probe: × 5 again, not × 3 | `kit-final/reps.out.json`, `tick.out.json` |
| **F2, REGRESS** | A REGRESS at a load the plan stepped above history starts from the dose held there: 20 × 8 → 18 × 8 under HYPERTROPHY. That equals your accepted freeze; the predecessor gave 18 × 7 and 18 × 6 | test `SSCTR F2, REGRESS at a projected load` |
| **F3** | After the change to MAINTAIN no bench press or lat pulldown row is above 8, in the holdout run and in your full-record control | `kit-final/trace-h25.out.json` |
| D56 | No cap rises or ends after a week whose last exposure was not whole (grid A = 0); 0 held after a whole week; caps 0 unexplained | the grids |
| D58 | Short grid and D58 readings byte-identical to your accepted run | `kit-final/short`, `d58` |
| D59 | First-week grids E = O = B = 0 for every class | `kit-final/firstweek`, `x-firstweek.*` |

## Items for your ruling (contract §10)

1. **F1, D53, D57: the restoration back in lockstep.**
   - A return step moves from the dose the week's exposures were prescribed at, never above the state, so an exposure that repeated the entry completes the entry only.
   - The run's return step, restart minutes and walk/jog step follow the same rule.
2. **F2: HOLD repeats the held dose**, on the R42 path too. At a new load, HOLD and REGRESS take the row's target and ADVANCE the logged repetitions.
3. **F3 and its reach.** Every row of a known dose stays inside the current goal's range; below the range the executed dose stands.
   - **Without a goal change**, accessory return-entry, return-step and unlogged rows under STRENGTH (4–6) now show 6 where they showed 7. They follow the KNOWN rows the next week already showed at 6.
   - First establishments and re-establishments keep the goal's establishment target, 7 for an accessory (`g.reps + 2`).
   - Your first-week REPS_ROW tally (a first post-return row whose target is not the repetitions executed) falls from 108 to 0.
   - Where: T08, x-items, the restoration grid, the f-, b- and systemic probes.
4. **EarnedProgress repetitions.** REPS_THEN_LOAD and bodyweight targets follow executed weeks: R6-H22, H24 and H33 sit one step behind the predecessor's projected steps.
5. **R42 across a heavier load the athlete chose** (your scope note).
   - The credit restarts at 0 and the step comes one exposure later: 80 → 82.5 lifted → 82.5 → 85.
   - The new load's target is the repetitions executed at it under ADVANCE.
6. **E9: a return week's pre-return sessions are not credited** (NF-R7ASM-1's own recommendation). In T05 there are no taper strides, and the race warm-up says none were done.
7. **The gate window.** A past week's gate no longer counts later logs. T04 and T13 are now row-identical to your accepted freeze; the predecessor's view had hidden the effect.
8. **The return base, carried from the predecessor** (your R7ASM ruling, "Return base: Approved").
   - When the last week before a break ADVANCED a dose the athlete never lifted, the return starts from the dose last executed. Example: 20 kg × 12 executed, then the advanced 22 kg × 8 never lifted, gives a return entry × 12 at ≤ 20 kg; your accepted freeze gave × 8 at ≤ 22 kg.
   - It is why some targets in `probe`, `b-probe` and the restoration grid's rows are above your accepted run and identical to the predecessor's.

## Non-blocking items

| Item | Status |
|---|---|
| NF-R7ASM-1 | Closed (item 6; round-12 section V) |
| NF-R7ASM-2 | Unchanged (R6-H26 is identical once the summary bookkeeping is set aside) |
| NF-R7ASM-3 | Closed collaterally. Your change probe, part D: history's 82.5 kg is carried, no stall at 80 |
| R41 | Unchanged |

## Regression evidence

| Corpus | Against the predecessor | Against your accepted freeze (informational) |
|---|---|---|
| R5 corpus | 24/24 | 24/24 |
| Profiles | 12/16 (summary bookkeeping only) | 12/16 |
| Simulations | 10/14 (T04, T05, T08, T13) | 12/14 (T05, T08) |
| R6 fresh holdout | 25/35 | 16/35 |
| Decision status changes | none | R6-H18 and R6-H26, both inherited from the predecessor, where you read them as no regression |

Every difference against the predecessor is named (0 unclassified): `CoachingCore/r7/state-consumer/REGRESSION_R7ASC_NAMED.json`. Dose fields: 60 rose and 82 fell. Of the risen, 56 are in T04 and T13: rows restored to STATE-EVIDENCE-FREEZE-1, with which both simulations are now identical. The other 4 are R6-H22's REPS_THEN_LOAD cycle points one step behind the predecessor's projected steps: 29 × 10 where it had 31.5 × 6, a higher repetition target at a lower load. One simulation decision changes action (T05 week 4: KEEP → INSTANTIATE_LOGGED_LOADS, class RETURN_WEEK_SUMMARY); no corpus case changes status.

## Scope and prohibitions

Offline synthetic Node 24 Coaching Core only; no UI, Figma, KMP, HealthKit, integration, production or real-plan effect.

Do not:
- edit `CoachingCore/` or any runtime file;
- run `npm run verify`, `npm run simulate` or any `verify-r*.mjs --write`;
- run any earlier `freeze-*`, `prepare-*`, `queue-*` or `regress-*` script, or any evidence runner.

Write only files you own, prefixed `ssctr-r7asc-`, in this folder. Record your verdict in `ssctr-r7asc-regression.md` and `.json`, bound to the freeze digest you recomputed.

If you approve prescriptive decisions, propose their queue items in `ssctr-r7asc-regression-queue-items.json`. The queue itself is untouched by this mission; integrating it belongs to the closing session.
