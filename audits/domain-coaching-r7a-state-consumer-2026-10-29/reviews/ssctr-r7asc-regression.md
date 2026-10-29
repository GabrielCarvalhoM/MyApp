# SSCTR regression review of STATE-MODEL-CONSUMER-FREEZE-1

**Revision R7ASC-SSCTR-r1, 2026-10-29.** Gate `STATE_MODEL_CONSUMER_SCIENTIFIC_REGRESSION`. This is the single regression-only review of the single freeze (Founder request §31). No correction cycle follows it.

- **Target:** runtime STATE-MODEL-CONSUMER-FREEZE-1 at the unchanged policy R6-POLICY-5 (`18ec48f3…`).
- **Closes against:** my previous record, R7ASM-SSCTR-r1 on HISTORICAL-PROJECTION-FREEZE-1 (NOT_READY: F1, F2, F3), and the freeze I accepted for D53 and D56–D59, STATE-EVIDENCE-FREEZE-1 (R7ASE-SSCTR-r1).
- **Outputs, all in this folder:**
  - `ssctr-r7asc-regression.json`: the ruling plus 17 decision records (13 re-bound, 4 new);
  - `ssctr-r7asc-regression-queue-items.json`: a proposal of 13 queue items.

## At a glance

**Verdict: `STATE_MODEL_CONSUMER_SCIENTIFIC_REGRESSION = NOT_READY`.**

READY would have meant only one thing: no material sporting regression demonstrated in this state/consumer boundary change. On strength, the closure does what it claims: F1, F2 and F3 are closed, D53 and D57 are restored, and D56, D58 and D59 hold. On the walk/jog ladder it does not. A later walk/jog return still resumes one ladder step above the approved return recipe (F4). This is a predecessor defect that this freeze only partly closed, and it sits in the class this mission itself placed under the F1 closure.

This verdict says nothing about whether the whole coach is ready, and I do not declare `R7A_EXIT_READINESS`.

| Item | Ruling | Basis, in one line |
|---|---|---|
| **F1** (strength) | **Closed** | Restoration grid B = 0 (predecessor 2); caps B = 0, 0 covered jumps; my two timelines come back 1 → 2 → 3 |
| F1, run side | Holds for RETURN and RESTART | The run goes entry, entry, step 2, prior dose, as on my accepted freeze |
| **F1, walk/jog side** | **Not closed: F4** | After a HOLD or a consolidation week, a later return resumes one step above the recipe in 10 of 12 cells (my accepted freeze 0) |
| **F2** | **Closed** | 240 HOLD gates on four goals and five paths: 0 raises of load, repetitions or sets, 0 outside the range, 0 credit, 0 progression without evidence |
| **F3** | **Closed** | R6-H25: bench press and lat pulldown 2 × 8 at RIR 3. My MAINTAIN probe: 0 of 393 known-dose rows outside 8–8 |
| D53 | **Restored** | Grids B = 0; S-F 0 on 22 paths |
| D56 | Holds | 0 cap rises or ends after a non-whole week (of 4,181) |
| D57 | **Restored** | Caps 0 unexplained; no exercise leaves its protection early |
| D58 | Holds | Short grid 0/315; readings byte-identical |
| D59 | Holds | First-week grids E = O = B = 0 for every class |
| Item 3 (accessory 7 → 6) | APPROVED_WITH_REASON | The current goal's range on a known dose, equal to the KNOWN rows the athlete executed |
| Item 8 (return base) | APPROVED_WITH_REASON | My earlier approval carried: the dose last executed, as one unit |

## Reviewer, authority, freeze

**Reviewer.** I am a fresh default Claude Code session (`claude-opus-5-5`), started directly by the Founder for this review.
- I act in the project role by loading:
  - the constitution SSCTR-CONST-1.0.0;
  - the skill 1.0.0;
  - the registry;
  - the decision schema;
  - the Claude adapter.
- This is not a native dispatch of the project agent type. The registry allows that when it is labelled, as here. I used no delegation.
- I did not author the policy, the runtime, the contract or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal decisions only. It is not human, empirical or clinical validation, and it publishes nothing.

**Freeze.** Recomputed by my own probe, with the canonical hash re-implemented rather than imported. I ran it at the start (`ssctr-r7asc-digest.start.out.json`) and at the end (`…end.out.json`):

| | Value |
|---|---|
| Freeze file | `5c8687755daa3294339150d35170178e033e12d552315ed92fb4cd668217f3b2` |
| Source digest | `adab37162d4f30d783faed2fe02fd44769a4be36be7bb1f6e8455a01b86235e5`, recomputed |
| Manifest digest | `4f11f4b48782a5f16dc6c9770a367d013564380aecc42d19be348d4ebc45cd1f`, recomputed |
| Bound files | 84 match; 0 unfrozen, 0 missing; exactly one freeze file |
| Policy | `18ec48f3…` recomputed |
| Evidence bindings | All 7 recorded hashes match (evidence runs, kit runs, mutation, survivors, regression, named regression, baseline) |
| Source delta | Exactly `r6-adaptation.mjs` and `r6-program.mjs` against the byte-exact HISTORICAL-PROJECTION-FREEZE-1 copy |
| Predecessor copies | HISTORICAL-PROJECTION-FREEZE-1: 0 of 83 drifted (`0db72d0e…`). STATE-EVIDENCE-FREEZE-1: 0 of 82 (`692483ce…`) |
| Changes after the freeze | None: every one of my 72 jobs recorded `adab3716…` before and after it |

`REVIEW_INVALID = NO`. I read the whole delta of both runtime files.

## What I ran

All outputs are in `ssctr-r7asc-runs/`, bound to the digests in `RUNS.json`.

| Check | Result |
|---|---|
| `node --test` | 632/632 |
| `verify-r7asc.mjs`, read-only | 24/25. The failing check is `reviews-not-dispatched`, as expected now that my files exist |
| My kit, 43 instruments, re-run unchanged | 43/43 byte-identical (clocks and labels aside) to the author's re-run in `probes/kit-final`. Byte-identical to my accepted run: short, D58, the first-week grid (D59), same-day (f and x), ceiling, rotation, rotation trace, caps extension, grid and caps shards 1–3. The extended first-week grid differs only in its REPS_ROW tally |
| 11 predecessor controls | 11/11 reproduce my R7ASM outputs on HISTORICAL-PROJECTION-FREEZE-1 |
| New: HOLD probe | 4 goals × 5 paths × 2 held weeks × 9 log variants, on three trees |
| New: MAINTAIN probe | 70 × 10 executed, projection at × 12, goal changed to MAINTAIN; 5 cells over 9 weeks |
| New: temporal probe | A return reported Thursday 07:00 with Friday's strength planned; 4 cells |
| New: walk/jog probe, trace, easy-run return | The run side of F1 across a second break |

## F1, D53, D57: return and restoration

**Strength, closed.** My restoration grid (864 timelines) gives:
- B = 0 and C = 0;
- 0 cap rises or ends after a non-whole week (of 4,181), and 0 caps held after a whole week;
- U = 237, the uncovered R23 class, unchanged on every freeze.

My caps grid gives B = 0, 0 covered jumps and 0 unexplained; the NONE/NOVICE extension gives B = 0. The predecessor had B = 2 on the restoration grid and on the caps grid. My two F1 timelines bring the overhead press back 1 (entry, w7) → 2 (return step, w8) → 3 (w10), as on my accepted freeze; the predecessor went 1 → 3. In the mechanism trace, every exercise holds return step 1 at week 8 in lockstep with the plan; on the predecessor three had already left their protection.

Against my accepted run, the grid and caps counts differ only in shard 0, and only in coverage: +6 cap weeks, +4 binding, +2 held-last-trimmed, +2 held-last-phased. That is more protection, not less.

**The Founder's §12 case** (my temporal probe): a return reported Thursday 07:00 with Friday's strength planned.

| Friday | Effect on history | Effect on prescriptions |
|---|---|---|
| Not executed | Never credited | Weeks 7–10 identical in all four cells, and identical to my accepted freeze |
| Executed | Credited from Friday 23:00; Thursday 20:00 reads no Friday credit | |
| Reported late | No decision before the sync sees it; after the sync it enters retroactively and changes no step | |
| Done on Saturday | Credited from Saturday only | |

On the predecessor, Friday's credit took the Friday exercises out of their return protection a week early.

Every user check on F1 holds for strength:
- only executed sessions earn credit;
- a future session never does;
- no return step advances early;
- no exercise leaves its protection early;
- the restoration skips no dose;
- a longer session (the 75-minute budget raise) gives no jump.

**Walk/jog, not closed: F4.** See below.

## F2 and HOLD

**The policy in force** is "HOLD repeats the pertinent dose and grants no progression" (Founder §9). The approved reading is my DOSE-READING (R7A1): HOLD and REGRESS keep the planned target.

**The Founder's example, reproduced.** Performed 82.5 kg × 3 at the prescribed reserve against a row of 82.5 × 5 (STRENGTH, 4–6), gate HOLD. Next:
- 3 × 5 at 82.5 kg, then 82.5 × 5 again;
- 85 kg only after two earned exposures at 82.5.

This is my accepted freeze's dose. The predecessor gave 82.5 × 3 and kept progressing the load (F2).

The 5 is the goal's own fixed target under STRENGTH (LOAD mode has no repetition steps). It is the row the HOLD repeats, not "future reps the PlanningProjection had". With 8 repetitions at RIR 0, the HOLD gives × 5, not × 6. The athlete's reserve floor makes the repeated target self-limiting.

**My HOLD probe.** 240 HOLD gates on STRENGTH, HYPERTROPHY, GENERAL and RUNNING_SUPPORT. Each held exposure is reached one of five ways:
- normally;
- after a light unreviewed week (a projected load);
- after a facts-only week (a projected repetition step);
- after two of either.

Every HOLD was checked on load, repetitions, sets, progression credit and projected progress:

| On this freeze | Count |
|---|---|
| Load raised | 0 |
| Repetitions raised | 0 |
| Sets raised | 0 |
| Known row outside the goal range | 0 |
| Load tick gained | 0 |
| Progression with no new evidence (the next week left unreported) | 0 |

The predecessor control finds 18 raises, 54 rows outside the range and 18 progressions without evidence. My accepted freeze finds 0.

**Projected progress is not carried into a HOLD at the same load.** When the row's target was a repetition step only the projection held (for example 82.5 × 10 after an unreviewed week at 82.5 × 8), a HOLD resolves to the executed dose, 82.5 × 8. That is 30 of 30 cases. This is the Founder's §9 concern, met.

**DOSE-READING S4.** A lighter load short of the target holds the planned target at the adopted load (80 × 3 against 82.5 × 5 → 80 × 5). The 40 differences from my accepted freeze in these variants are all earned-progress readings (R42):
- set increases a facts-only week never earned;
- one load step earned by two ADVANCE exposures at the historical load.

**Residual (NF-R7ASC-1, non-blocking).** Take REPS_THEN_LOAD goals, after two projected steps. At a new load, a HOLD repeats the row's target even when that target is a repetition step only the projection had: 82.5 × 8 at the prescribed reserve → 82.5 × 10. The same performance at the same load resolves to 82.5 × 8.
- It is identical to my accepted freeze, so this freeze did not introduce it.
- The athlete's own exposure at that load met the goal's reset target, so 10 at RIR 3 is supported by what they did.
- It is still an inconsistency between the two paths. Recommendation R45: at a new load take min(row target, the goal's reset plus the steps earned at that load).

## F3 and MAINTAIN

**R6-H25** (my trace, both the holdout and my full-record control): after the change to MAINTAIN, 28 rows, 0 above 8.
- Bench press and lat pulldown are 2 × 8 at RIR 3, from the load last logged, with a 70 kg ceiling.
- The bench press is re-established by effort because its last execution was 40 days earlier. D52 now measures from executed dates.
- The lat pulldown never jumps to the 62.5 kg step it earned but never lifted.
- The predecessor gave 2 × 12. My accepted freeze gave 3 × 8 at a known 70 kg, reading a projected last-performed date.

**My MAINTAIN probe.** The setup is 70 × 10 executed, the projection already at 70 × 12, then a change to MAINTAIN (8–8, 2 sets, RIR 3, mode HOLD). Five cells: reviewed, unreviewed, misses, extra repetitions and a return.

| On this freeze | Count |
|---|---|
| Known-dose rows | 393 |
| Above 8 | 0 |
| Below 8 | 0 |
| RIR below 3 | 0 |
| Load above the last executed | 0 |

The back squat is 70 × 8 every week. Extra repetitions with reserve progress nothing. Repeated misses lower the load and keep 8.

The predecessor walks misses down to 3 × 1. My accepted freeze prescribed return rows at × 10 after the change, a latent defect my earlier review never tested; this freeze cuts them to 8.

**O-1 (observation, predecessor).** Known-dose rows keep the executed 3 sets under MAINTAIN, whose `maxSets` is 2. This is identical on all three freezes, so it is not a regression. The policy owner should state whether `maxSets` caps a known count.

## Semantic dose, history and projection

I attacked HYPERTROPHY, GENERAL, RUNNING_SUPPORT, MAINTAIN, HOLD, return, restart, re-establishment and goal change for atom mixtures. I found none:
- each resolved row is HistoricalState's exercise as one unit;
- the current goal's range applies to every known-dose row;
- establishment rows keep the declared establishment target.

Across the corpora (my regression probe against my accepted freeze), rows outside their goal's range fall from 708 to 663. The only 2 rows new to this freeze are R6-H18 establishment rows at the declared target 7, of exercises with no known load.

R6-H22, H24 and H33 sit one REPS_THEN_LOAD cycle point behind (29 × 10 where the projection had 31.5 × 6). With a complete record R6-H24 is identical. These are steps not yet earned, not lost capability.

The separation therefore:
- does not inflate capacity (no unexecuted load or step enters a strength dose);
- does not deflate it beyond the declared earned-progress delay;
- does not grant early progression and does not block a valid one;
- does not distort recovery.

It does distort the walk/jog return (F4).

## The two differences left for my ruling

1. **Accessory return rows under STRENGTH, 7 → 6 without a goal change: APPROVED_WITH_REASON.**
   - All 15 differing x-items rows are accessory RETURN_ENTRY, RETURN_STEP or UNLOGGED rows of an exercise with a known load. Sets, reserve and load are unchanged.
   - The KNOWN rows the athlete executed before the break already showed 6. My accepted run's REPS_ROW examples show the old rows carried a target above both the range and the executed repetitions (8 against 6).
   - First establishments and re-establishments keep 7.
   - The change is one repetition fewer at an effort-chosen load, inside the range (R6-S01).
2. **The return base carried from the predecessor, repetitions above my accepted freeze in some kits: APPROVED_WITH_REASON.**
   - This carries my R7ASM "Return base: Approved". The return resumes the dose last executed as one unit, with the ceiling never above the last executed load.
   - Example: 20 kg × 12 executed, then 22 kg × 8 never lifted → entry × 12 at ≤ 20 kg.
   - The repetitions move both ways against my accepted freeze. They are higher where the cycle stood before a load step (8 → 12) and lower mid-cycle (calf raise 10 → 8, dead-bug 16 → 14). They always equal the executed dose and stay in range.

The other contract §10 items:

| Item | Ruling |
|---|---|
| 1, restoration in lockstep | Holds for strength and for RETURN and RESTART; not for walk/jog (F4) |
| 2, HOLD | Holds |
| 4, EarnedProgress repetitions | Holds |
| 5, R42 across a heavier load | Holds |
| 6, E9 | No change in any of my return timelines |
| 7, the gate window | Holds |

## New findings

### F4 (blocking): a walk/jog return after a HOLD or consolidation week resumes one ladder step above the approved recipe

**Where.** `ssctr-r7asc-walkjog-probe.mjs` and `-trace.mjs`, on profile WALK_JOG_FIVE_DAYS:
- a SHORT break reported mid-week;
- the next week held, by CONSOLIDATION or a HOLD;
- then a second SHORT or MODERATE break.

| Freeze | First week back above the recipe |
|---|---|
| This freeze | 10 of 12 cells |
| HISTORICAL-PROJECTION-FREEZE-1 | 12 of 12 |
| STATE-EVIDENCE-FREEZE-1 | 0 of 12 |

**Trace** (consolidation, no walk/jog in week 4, SHORT second break):
- The athlete runs step 2 three times and never runs step 3.
- History reaches step 3 from one post-return session and stays there.
- The second return's entry records walk step 3, against 2 on my accepted freeze.
- Weeks 6–7 prescribe steps 3 and 4, against 2 and 3.
- A MODERATE second break resumes the step last run instead of one below.

**Mechanism.**
1. History credits the re-entry week (read after the return point, C5) while the plan re-bases the next week (E7).
2. `advanceRun` WALK_JOG takes the step the week ran only when the gate advances (`d > 0`). A CONSOLIDATION week or a HOLD therefore leaves history at its own higher step. RETURN and RESTART take the dose run for every gate.
3. The next return reads history (`stateAtBreak`).

The easy-run return is unaffected: it is identical on all three freezes.

**Rules violated:**
- R6-NONCLINICAL-RETURN: re-entry "returns to the prior tolerated dose"; "historical maxima are a ceiling, not current proof";
- my R7ASM return base: the last executed dose, never one not executed;
- the contract's own §6 ("HOLD repeats that dose"; "the run side is the same rule") and E10 ("its ladder steps from the step it ran").

**Origin.** A predecessor defect, introduced by HISTORICAL-PROJECTION-FREEZE-1. This freeze closed only the ADVANCE case (the author's test "F1, the walk/jog side").

**Why it blocks.** The physiological size is one ladder step: 60 s → 90 s jog intervals, +50% jog time, for a walk/jog athlete just back from a break after a held week. The departure from the declared rule is systematic. It is the same standard I applied to F1:
- a known state mode lets a return come back faster than its recipe;
- this mission placed the walk/jog step under the F1 closure (handoff §3; brief "F1, walk/jog side");
- the review asks whether the closure restored the approved return rules (Founder §31, §34).

If the Chief and the Founder rule the walk/jog ladder outside F1's class, F4 is the only reason for NOT_READY. Every other criterion of my gate is met.

**Recommendation R44.** In `advanceRun` WALK_JOG, take the step the week ran for every gate, as RETURN and RESTART do. Alternatively, make a walk/jog return resume at most the step last run (SHORT) or one below it (MODERATE). Then re-run my walk/jog probe (expect 0 of 12), the grids and the temporal probe.

### NF-R7ASC-1 (non-blocking) and O-1 (observation)

See the HOLD and MAINTAIN sections. Neither was introduced by this freeze.

## R40, R41, R42

| Item | Status |
|---|---|
| **R40** | Preserved. In the b-probe sections where R40 was found (S-B, S-D), the run rows are identical on all three freezes, so a strength shortfall still discards no executed run step. The S-F checks are 0 on 22 paths |
| **R41** | Non-blocking, unchanged. The unreported-weeks behaviour is identical (easy-run return probe; NF-R7ASM-2 class), and nothing new is caused by this freeze |
| **R42** | Met. EarnedProgress and ProjectedProgress are not confused:<br>- the credit restarts at 0 at a new load;<br>- a projected repetition step is not carried at the same load;<br>- the REPS_THEN_LOAD cycle points follow executed weeks.<br>NF-R7ASC-1 is the only residual |

## Records and queue

**Records** (`ssctr-r7asc-regression.json`):

| Group | Records | Disposition |
|---|---|---|
| Re-bound, carried | QUALITY-SLOT-READINGS, D59, D56, SAME-DAY, REESTABLISH-PHASE, SPLIT-WEEK, ITEMS-5-8 | APPROVE_WITH_CONDITIONS |
| Re-bound, carried again (F1–F3 closed) | DOSE-READING (NF-R7ASC-1 a declared limitation), COMPOSITION, REGAIN-BASE, CYCLE2-COMPOSITIONS | APPROVE_WITH_CONDITIONS |
| Re-bound, abstention | RESTORATION-SCOPE | ABSTAIN, unchanged |
| Re-bound, does not carry | INTERRUPTION-STATE (F4) | REVISE |
| New | GOAL-RANGE-CUT, RETURN-BASE-CARRIED | APPROVE_WITH_CONDITIONS |
| New | WALKJOG-RETURN (F4), STATE-CONSUMER | REVISE |

**Queue proposal.** 13 items `HQ-R7ASC-SSCTR-*`, one per prescriptive approval, funding NOT_DECLARED.
- They bind a freeze that is NOT_READY. The Chief decides whether to integrate them append-only.
- I did not edit the queue file.

## Literature

Not reopened (Founder §31; the brief). No ruling here rests on a new search. The access and currency check of R7ASM-SSCTR-r1 ran on this same date and found no new synthesis.

The rulings are rule conformance against approved recipes. They reuse sources with the read depth recorded in my earlier records:
- R6-S01, R6-S48 for the approvals;
- R6-S48 as an inferred, uncertain basis for F4's size.

No running-specific source sizes one walk/jog step.

## Validation

| | |
|---|---|
| Gap | Python and `jsonschema` are not installed, so `validate_records.py` did not run |
| Substitute | My declared Node + ajv 8.20.0 validator (`ssctr-r7asc-validate.mjs`), with the helper's cross-checks ported one for one |
| Result | 17 records and 13 queue items, 0 errors |
| Negative control | A copy with four planted defects (stale target hash, altered queue condition, missing AE answer, decisive claim on an abstract-only source) fails with 7 errors; every defect is caught |

This checks record consistency only.

## Not run, not read

**Not run:**
- `npm run verify` or `simulate`;
- any `--write`;
- any `freeze-`, `prepare-`, `queue-` or `regress-` script;
- the author's evidence runner, kit runner and mutation check;
- any literature search.

**Not read:** the engineering judge's review. Its files (`qe-r7asc-*`, `quality-engineering-r7asc-review.*`) appeared in this folder near the end of my review. I saw their names in a directory listing only and opened none of them. Nothing in this review depends on them.

**Nothing edited** under `CoachingCore/`, in the mission files, in the queue, in `product/`, in `canon/` or in earlier audits.

## Escalation and routing

| To | What |
|---|---|
| **Chief** | Record `STATE_MODEL_CONSUMER_SCIENTIFIC_REGRESSION = NOT_READY` (F4), together with the engineering review |
| **Founder** | The next step. F4 needs one runtime correction inside the declared policy (R44), then a new freeze and this regression check again. This mission allows no correction cycle |
| **Runtime author, with the engineering judge** | F4 (R44); NF-R7ASC-1 (R45) |
| **Policy owner** | O-1 (MAINTAIN `maxSets` and a known count) |
| **Clinical** | No clinical dependency |

## Files

**Deliverables:**
- `ssctr-r7asc-regression.md`
- `ssctr-r7asc-regression.json`
- `ssctr-r7asc-regression-queue-items.json`

**Instruments:**
- `ssctr-r7asc-run.mjs`, `-compare.mjs`, `-build.mjs`, `-validate.mjs`, `-digest.mjs`, `-manifest.mjs`
- `-lib.mjs`, `-hold-probe.mjs`, `-maintain-probe.mjs`, `-temporal-probe.mjs`
- `-walkjog-probe.mjs`, `-walkjog-trace.mjs`, `-easyreturn-probe.mjs`

**Outputs:**
- `ssctr-r7asc-runs/*`
- the digest and validation outputs

Hashes are in `ssctr-r7asc-outputs.json`.
