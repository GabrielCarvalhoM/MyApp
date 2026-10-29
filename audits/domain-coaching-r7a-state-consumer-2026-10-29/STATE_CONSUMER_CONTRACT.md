# STATE_CONSUMER_CONTRACT — history ingress, the resolved prescription and evidence through time

**Revision:** R7ASC-STATE-CONSUMER-1, 2026-10-29.

**What it amends:** [STATE_MODEL_CONTRACT.md](../domain-coaching-r7a-state-model-2026-10-28/STATE_MODEL_CONTRACT.md) (R7ASM-STATE-MODEL-1), on four points only:
- §4, the PlanningView atom table, is replaced by §5 below;
- §5 gains the ingress, correction and time rules (§3, §4, §6);
- §7, R42, is extended (§7);
- §8, the declared boundaries, is updated (§8).

Everything else stays in force: the three structures, write ownership, the evidence reducer, the week-start record, the interruption-episode contract and the week-composition contract C1–C6.

**Authority:** the Founder decision of [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md) §0: keep HistoricalState, PlanningProjection and PlanningView, and close the consumers.

**Status:** engineering contract of the offline synthetic Coaching Core (SHADOW reference). It adds no sporting rule. Every dose rule it applies is an approved one, named where it is used. Policy R6-POLICY-5 (`18ec48f3…`) is unchanged.

**Code:**
- `src/r6-program.mjs`: `asEstablishment`, `resolveExercisePrescription`, `earnedAt`, `doseStep`, `strengthCandidate` (`inRange`), `advanceRun`, `plannedOf`;
- `src/r6-adaptation.mjs`: `planningBase`, `historicalStateOf`, `canonicalRecord`, `evidenceState`, `weeklyGates`, `loggedLoadQuestions`.

## 1. Why

The two independent reviews of HISTORICAL-PROJECTION-FREEZE-1 found that the separation held where it was built, at the stored starts. Several consumers still crossed it:

| Finding | Consumer | What crossed |
|---|---|---|
| QE-R7ASM-01 | the evidence reducer's set-up of an exercise it does not hold | a KNOWN row's prescribed load became history |
| QE-R7ASM-04 | the public `historicalStateOf` | superseded rows were read as live evidence |
| QE-R7ASM-02 | the PlanningView's run in a restart | the run was read from the projection |
| QE-R7ASM-03 | the PlanningView's repetition target | in REPS_THEN_LOAD goals, the projection's steps |
| F2 | the new-load repetition rule (`earnedAt`) | the logged repetitions, whatever the gate |
| F3 | the view after a goal change, and from-log rows | the old goal's projected target, unclamped |
| F1 | the return-step counter | an exposure that repeated the entry counted as return step 2 |

## 2. What stays

```
canonical evidence ─► evidenceState ─► HistoricalState
                                           │ (resolveExercisePrescription; the run by mode)
                                           ▼
                                      PlanningView ─► the planner (strengthDose, distributeRun) ─► PlanningProjection ─► rows
```

The reducer is still the only writer of history and never reads a stored start's values. The planner never writes a historical atom.

## 3. A — History ingress (Property A: only factual evidence writes HistoricalState)

**Rule.** A prescription never establishes HistoricalState. Read as executed evidence, an exposure of an exercise the start does not hold is an effort-guided establishment, whatever its row prescribed (`asEstablishment`):
- a KNOWN row's load is not the exercise's load;
- it is not the reference a first log is judged against, so that log waits for confirmation (SSCTR D45);
- an exposure without a usable load leaves the exercise to be established by effort again (SSCTR D52).

The rule applies to every reading of evidence: the evidence reducer (review rule and facts-only reading), a review's transition, and the load questions. The conditional projection is planning and keeps its own rows.

**Consequence.** Whether the evidence that once established an exercise was corrected or quarantined before or after its rows were planned makes no difference to its load, mode, pending log, dates or lift (QE-R7ASM-01, P1).

**The repetition target** stays the one the row prescribed for that exposure. A target is not a load.

**The largest whole count executed** (`lastExecutedSets`, the return ceiling of SSCTR D49 and R20) is still the prescribed count the athlete executed. It never exceeds what was executed or what was prescribed. Two rows that prescribed different counts can therefore leave different ceilings on the same record (§8, E8).

## 4. B — The correction boundary (Property B: retracted evidence is not factual through any API)

**Rule.** Every public reading of HistoricalState runs on the **canonical record**, the carried completed-work record normalized and bound by the same functions `evaluateProgram` applies (`canonicalRecord`):
- duplicates are merged;
- corrections supersede what they correct;
- retractions are applied;
- conflicts are quarantined.

The record's own clock is the latest instant any of its facts became available, or the cut if later. So every fact the record holds is read, and a correction made after the cut still replaces what it corrects. Only the reducer's cut limits what counts: executions observed before it.

**Consequence.** The public reader and the decisions' own reducer give one HistoricalState (P7). A superseded row is inert history in both (QE-R7ASM-04, H5, P2).

**The input contract** is the record as `evaluateProgram` returns it. A record stripped of the superseded rows its corrections point at is read the way `evaluateProgram` would read it: an orphan correction is rejected as an invalid chain.

## 5. C — The resolved prescription (Property C: coherent doses, not atom mixtures)

**Strength.** `resolveExercisePrescription(history)` is the one place a decision's exercise dose is resolved. The dose is HistoricalState's exercise, as one unit:
- **EarnedProgress:** the load, repetition target and load tick the evidence settled. They come from the weekly review's rule applied only to executed weeks, so they include the steps the evidence released.
- **The atoms only executed evidence moves:** the last performed date, the return steps and their caps, the counts that come back one executed week at a time, the blocks earned, and what the logs left (unlogged, a pending log, a re-establishment ceiling).

No atom of the projection is combined with another atom of history. The atom-by-atom view (`planningExercise`, `HISTORY_ATOMS`) is removed. An exercise only the plan assumed established is not resolved, and its next exposure is an establishment (D52).

**The rows.** The planner then builds the rows in one place for every week and every kind of row (`strengthDose`: `strengthCandidate` with `phaseDose`). That place applies:
- the current goal: its repetition range, HOLD and MAINTAIN;
- the phase;
- the return or re-establishment the state is in;
- the time budget.

**The current goal's contract (F3, S2, S6).** The repetition target of an exercise with a known load is never above the goal's range, whichever row carries it: the exercise is known, or re-established, returning or unlogged under a known load. The KNOWN row already cut it there; the from-log, return-step, return-entry and unlogged rows now do too (`inRange`). Below the range the executed dose stands, because an increase needs evidence. A row that carries the goal's establishment target instead of the exercise's keeps it (a first establishment, a re-establishment: an approved protocol). Under STRENGTH (4–6) that target is 7 for an accessory (`g.reps + 2`); once the exercise has a known load, its KNOWN rows have always shown 6, and its return and unlogged rows now show 6 too (§10, item 3).

**HOLD (F2, S1, P4).** HOLD repeats the dose it held (SSCTR DOSE-READING; cycle-2 S2).
- When a lift adopts a load above the one history held, its repetition target is the gate's: ADVANCE takes the repetitions logged; HOLD and REGRESS take the target the row prescribed.
- A short set never walks the target out of the range, and a HOLD never raises it.

**The run.** A re-entry's steps follow the weeks the athlete executed, whichever mode (QE-R7ASM-02, S5).
- **History's whole run** while either reading is in a re-entry mode (RETURN, a moderate return; RESTART, a long return or a reported pause).
- **Otherwise** the projection's targets and unlock permissions, with the capability atoms (achieved peaks, longest continuous run) from history.
- The difference between RETURN and RESTART comes from their recipes only (a step count back to the prior dose, against restart minutes), never from where each one is read.

## 6. D — Evidence through time (Property D: evidence affects history only after it exists)

- **The cut.** HistoricalState through T reads only executions observed before T; the reducer's cut. A late sync of an earlier execution enters retroactively, because the record now holds it (T3). An execution after T never does, whenever it is reported (T4, P5, P6).
- **A past week's gate is read at that week's own clock** (the closing decision's, else its last instant). It counts only logs that existed by then: the strength look-back window is bounded above by the clock, as `recent()` already was. A log executed weeks later never makes an earlier week REGRESS or EARNED.
- **A return step is credited by the dose executed** (F1, D53, D57). It moves from the dose the week's exposures were prescribed at, never above the state (`doseStep`):
  - an exposure that repeated the entry dose completes the entry only, so the restoration never skips the step it did not execute;
  - HOLD repeats that dose.

  The run side is the same rule. The return step, the restart minutes and the walk/jog step move from the dose the week's runs prescribed (`plannedOf` states it), never above the state, as easy and long runs already did ("progression continues from what was prescribed"). A taper therefore holds what was run (SSCTR D43).
- **A return's own week** is read from the sessions after the return's point, its prescription summary included. A run planned before the break, inside the pause, is never credited as run (C5; NF-R7ASM-1).
- **Planned sessions** of the week a cut falls in are never evidence at that cut, nor are the sessions of a new week at its start (T1, T5).

## 7. R42 — EarnedProgress and ProjectedProgress

```
PROGRESSION_STATE = EarnedProgress (HistoricalState) vs ProjectedProgress (PlanningProjection)
```

- **EarnedProgress** is HistoricalState's exercise dose and progression state: the load tick, and the repetition target where the goal progresses repetitions (REPS_THEN_LOAD goals and bodyweight). Only the evidence that earned them writes them.
  - When a lift adopts a load above the one history held, the credit at that new load starts at 0, **whoever set the higher load**: a row the plan stepped, or the athlete lifting above the row with its target met (SSCTR D44). A credit earned at another load never crosses to it.
  - This closes the SSCTR's R42 scope note: the contract's §7 now says what the code does.
- **ProjectedProgress** is the ticks, repetition steps and loads the planner carries in `stateTrace` for the weeks it projects. It may run ahead, and it is never a starting dose (§5).

No new metadata is introduced: the two concepts are the two existing structures, and the resolved prescription reads only the first.

## 8. Declared boundaries (STATE_MODEL_CONTRACT §8, updated)

| # | Boundary | Why |
|---|---|---|
| E1–E5 | Unchanged | — |
| E6 | Unchanged: a week executed as finally prescribed is evidence for its sport | SSCTR R7ASM: approved outside the return's own week |
| E7 | The planner's weekly review of a return's own week gates on every row of that week, the sessions before the return included (unchanged); history reads only the sessions after the return's point (C5). The planner can re-base a step the evidence already credited. The next transition starts from the dose the rows prescribed, never above history (§6), so the two readings meet without a skipped step | F1. Kept: the conservative re-base is the planner's, and §6 makes it harmless |
| E8 | `lastExecutedSets` is the prescribed whole count the athlete executed (SSCTR D49, R20), not the logged count | An approved rule; it never exceeds what was executed or prescribed |
| E9 | Sessions before a return's point are not credited, not even their capability atoms when they were executed. Example: T05, strides done on the morning of the evening the return was reported. The taper and race warm-up follow | NF-R7ASM-1's own recommendation (C5); conservative. For the SSCTR to check (§10) |
| E10 | Outside a re-entry mode (EASY, WALK_JOG) the run's targets and unlock permissions come from the projection | Founder §14 of the previous mission; R6-H35. The reviewer's inference that a walk/jog athlete's return takes this branch is declared here: such a return has no re-entry mode in the policy, and its ladder steps from the step it ran (§6) |
| E11 | D51 is unchanged: when the exercises in use finish their return steps, one not used in the finishing week loses its return step | With §6 the restoration is back in lockstep, and the SSCTR grids give B = 0. The latent time-fit path is attacked in the self-challenge; R43's alternative (a cap instead) was not needed |

## 9. Invariants and where they are tested

All of these are in `CoachingCore/test/r7asc-state-consumer.test.mjs`.

| Property | Tests |
|---|---|
| A | QE-R7ASM-01 (4 variants, facts only, conflict), H1–H4, P1 |
| B | QE-R7ASM-04, H5, P2, P7; T15, T15c and P7 in `r7asm-state-model.test.mjs` on the real correction path |
| C | QE-R7ASM-02, QE-R7ASM-03, F2, F3, S1–S6, P3, P4 |
| D | F1, S5, T1–T5, P5, P6, NF-R7ASM-1, the gate window (T04's dead bug) |
| Public API | P7, and the last-week reader |

The self-challenge (`probes/r7asc-self-challenge.mjs`, Founder §24) attacks the same properties in 16 classes. C16 is Property D over the whole simulation corpus, at every week start:
- history read with the whole record equals the same read with only the sessions executed before that start;
- the target history records for each exercise's last executed exposure is the target that exposure's row carried. This is the class of the gate-window defect.

## 10. What the SSCTR must check (regression)

1. **F1, D53, D57.** The restoration back in lockstep. The run side too: a moderate return after a Friday report goes entry, entry, step 2, prior dose, as on STATE-EVIDENCE-FREEZE-1; the restart minutes step from the minutes run.
2. **F2.** HOLD repeats the held dose, on the R42 path too.
3. **F3.** The goal range on every row of a known dose: from-log, return-step, return-entry and unlogged rows. Below the range the executed dose stands.
   - Accessory return rows under STRENGTH now show 6 where they showed 7, with or without a goal change. They follow the KNOWN row the next week already showed. Seen in T08, the restoration grid, x-items, the f-, b- and systemic probes.
   - In the SSCTR's first-week grid, the REPS_ROW tally (a first post-return row whose target is not the repetitions executed) falls from 108 to 0.
   - First establishments and re-establishments keep the goal's establishment target, 7 for an accessory under STRENGTH.
4. **EarnedProgress repetitions.** REPS_THEN_LOAD and bodyweight targets follow executed weeks (R6-H22, H24, H33: one step behind the predecessor's projected steps).
5. **R42 across an athlete-initiated heavier lift.** The step comes one exposure later (the SSCTR's own scope note).
6. **E9.** The return week's pre-return sessions are not credited (T05: no taper strides; the race warm-up says none were done).
7. **The gate window.** A past week's gate no longer counts later logs. T04 and T13 are now row-identical to STATE-EVIDENCE-FREEZE-1, where the predecessor's view had hidden the effect.
8. **The return base, carried from the predecessor** (the SSCTR's R7ASM ruling, "Return base: Approved"). Where the last week before a break ADVANCED a dose the athlete then never lifted, the return now starts from the dose last executed, as on HISTORICAL-PROJECTION-FREEZE-1. Example: 20 kg × 12 executed, then the advanced 22 kg × 8 never lifted, gives a return entry × 12 at ≤ 20 kg; STATE-EVIDENCE-FREEZE-1 gave × 8 at ≤ 22 kg. It appears in the SSCTR kit as repetition targets higher than on STATE-EVIDENCE-FREEZE-1 and identical to the predecessor (the restoration grid's rows, `probe`, `b-probe`). The F1 restoration keeps the predecessor's targets on rows whose return step it restores.
