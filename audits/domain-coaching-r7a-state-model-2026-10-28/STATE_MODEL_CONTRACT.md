# STATE_MODEL_CONTRACT — HistoricalState vs PlanningProjection

**Revision:** R7ASM-STATE-MODEL-1, 2026-10-28. It succeeds [STATE_EVIDENCE_CONTRACT.md](../domain-coaching-r7a-state-evidence-2026-10-28/STATE_EVIDENCE_CONTRACT.md) (R7ASE-STATE-EVIDENCE-1) in full: its §2 two views of one record, §4 per-value table, §5 facts, §6 record and boundaries E1–E6 are replaced by this contract. Unchanged: the R7-A final interruption-episode contract (identity, the point a return starts from, late evidence), the R7-A.1 week-composition contract (C1–C6) and [WEEK_START_AUTHORITY_CONTRACT.md](../domain-coaching-r7a-boundary-2026-10-28/WEEK_START_AUTHORITY_CONTRACT.md) except where §6 below narrows what a start records.

**Authority:** the Founder decision of [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md) §0, applied as given: `HistoricalState` and `PlanningProjection` are separated, with a derived `PlanningView`; planning never writes history. **Status:** engineering contract of the offline synthetic Coaching Core (SHADOW reference). It adds no sporting rule and does not change policy R6-POLICY-5 (`18ec48f3…`).

**Code:** `CoachingCore/src/r6-adaptation.mjs` (`evidenceState`, `planningBase`, `planningExercise`, `historicalStateOf`, `stateAtBreak`, `evidenceStart`, `weeklyGates`), `src/r6-program.mjs` (`advanceStrength`, `strengthAtBreak`, `historicalStrength`, `executedDosesOf`, `anchoredStart`), `src/r6-composition.mjs` (`weekAsPlanned`, `composeWeeks`, `withContextChange`, `moveCandidates`).

## 1. Why

In the value-scoped model history was still *reconstructed from the planning record*: each value was copied out of a stored week start under a per-value rule. Every copy rule had to be exact atom by atom, and two were not:
- `atDose` copied the stored dose's **load tick** together with the load the athlete lifted (QE-R7ASE-01);
- the planner's own history-defined predicate D52 read the stored **last-performed date** (QE-R7ASE-02), and the row's exposure kind read a stored **return step** (P52).

One record served both meanings, so any reader could take a projection for a fact. This contract removes the class structurally: history is computed from evidence and never reads a stored start's values.

## 2. The three structures

| Structure | What it is | Who writes it | Who reads it |
|---|---|---|---|
| **HistoricalState** | What the record shows the athlete did, by a cut: per strength exercise the dose executed, the date performed, EARNED_PROGRESS, counts, return steps and caps; the run's evidence-gated state and its capability atoms | **Only** the evidence reducer `evidenceState`, from canonical evidence (execution reports, their corrections, the intake) | The state at an interruption and through it every return's entry and ceilings, the late-evidence check, the PlanningView, and the public read-only `historicalStateOf` |
| **PlanningProjection** | The program's `stateTrace`: the start the plan assumes for each week, with its targets, planned dates, projected ticks and steps | **Only** the planner (`projectWeeks`, `advanceRun`/`advanceStrength` without `evidenceMode`, `composeWeeks`) | The planner, to build and re-plan weeks |
| **PlanningView** | `planningBase(ctx)`: the start of this week a decision plans from, declared atom by atom (§4) | Nobody: it is derived per decision | Every handler of `evaluateProgram`, through `ctx.base` |

`PlanningView` has no historical authority of its own. No API merges the two silently: `planningBase` is the one combining function, and it is built per decision from the two named sources.

## 3. Write ownership

```
canonical evidence ─► evidenceState ─► HistoricalState
                                           │ + goals, constraints, policy (PlanningView)
                                           ▼
                                      the planner ─► PlanningProjection ─► prescription
```

- The reducer never reads `stateTrace[k]`'s values. From the planning record it reads only: the week's rows (what was prescribed), the week's prescription summary (`planned`), **which decision closed a week for a sport** (a start's `WEEK_EVIDENCE` provenance and its clock) and a return's recorded entry, which the return itself computed from history.
- The planner never writes a historical atom: `advanceStrength` and `strengthAtBreak` keep the executed doses (`facts`) only under `evidenceMode`, which only the reducer passes, and a planning transition deletes any `facts` it is handed.
- `historicalStateOf(program, {asOf, actualLedger})` is read-only and returns a frozen value: `lastExecutedLoad`, `lastExecutedReps`, `liftedLoad`, `lastPerformedAt`, `earnedProgress.loadTick`, `earnedProgress.stepEarned`, `returnStep` per exercise, the run's mode and capability atoms, and `state` (the same history in the planner's terms).

## 4. The PlanningView, atom by atom

| Atom | From | Why |
|---|---|---|
| Strength: every atom of an exercise the evidence established | HistoricalState | Every rule the plan applies to the week it re-plans is defined on executed history: the re-establishment threshold D52 (`lastPerformed`), the exposure kind (`returnStep`), the caps that come back one executed week at a time (`setCap`, `regainCap`, `setCeiling`, `sets`, `priorSets`), what the logs left (`unlogged`, `pendingLoad`, `ceiling`, `source`), the blocks earned (`blocksDone`) and the last executed count |
| Strength: load and repetition targets | PlanningProjection, **never above** the evidence-gated load | A target is the plan's; above the evidence-gated load it would be a step history has not released. Where the view lowers the load it takes the repetition target with it, so the dose moves as a unit |
| Strength: `loadTick` | EARNED_PROGRESS at the view's load: history's tick where history holds that load, else 0 | R42 (§7) |
| Strength: an exercise the evidence never established | Absent from the view | A prescription establishes nothing (SSCTR D52): the next exposure establishes it again |
| Run: targets, unlock counters and permissions (`easy`, `long`, `qualityStep`, `specificStep`, `easyWeeksDone`, `walks`, …) | PlanningProjection | The planner keeps projecting the future freely (Founder §14, §15; R6-H35: reading the run from history would change planning) |
| Run: `achieved` peaks and `longestContinuous` | HistoricalState | They are statements about what was reached; the taper, race-day completion and redevelopment read them as facts |
| Run: the whole state while it is in a return | HistoricalState | A return's steps follow the weeks the athlete executed (I13) |
| The week's prescription summaries (`planned`) and `entryWeek` | PlanningProjection | They describe the rows the week prescribes, not a state |

## 5. The evidence reducer

`evidenceState(ctx,{cut,day,ledger,ret,p})(k)`: the athlete's state at the start of week k as the record stands at `cut`.

| k | The state | Basis recorded |
|---|---|---|
| A return in force at the cut, in its own week (a late report, in the break's week) | Its recorded entry, which it computed from history; the sessions before its point in that week belong to the plan before the break (C5) | `RETURN_ENTRY` |
| 0 | The intake: week 0's start as recorded under `INTAKE` authority (before any return of week 0 replaced it), without the week's prescription summary | `INTAKE` |
| otherwise | Week k−1 applied to the state at its own start, **per sport**: by the weekly review's rule (`weeklyGates` on this state, then `advanceRun`/`advanceStrength` in `evidenceMode`) when that week is **closed** or **complete** for the sport; otherwise by its facts only (`strengthAtBreak` in `evidenceMode`; a run keeps its state) | `WEEK_EVIDENCE`, `COMPLETED_SESSIONS`, or the basis the value had before |

- **Closed:** a decision recorded the next week's start for that sport as `WEEK_EVIDENCE` before the cut (a weekly review, or any handler that applies its rule, E1 below).
- **Complete:** every gate of the sport is ADVANCE or EARNED and, for strength, every exercise has a usable deciding log. A gate holds when any row of its role or exercise was not executed as prescribed, so an unexecuted, partial, adverse or skipped session leaves its sport to its facts. A load in an unknown unit is no evidence of any load (Founder §13).
- Each week's gates are read **at that week's own clock** — the closing decision's, else the week's last instant — with the decisions in force then. Time alone therefore never changes history (P2).
- Each week is judged **under the plan it was executed under** (`sk.at(k−1)`, the context in force for it), so no later goal, event or schedule change rewrites what an earlier week earned. `withContextChange` keeps past context segments for this reason; the planner never reads them.
- Facts read in a week are unchanged from R7-A.2 and the state evidence contract §5: a known load lifted is the load (the adoption rule, SSCTR D44; an effort-guided row adopts nothing); unlogged repetitions leave the target; an unexecuted count is never counted; `lastPerformed` is always an execution date; a correction is a fact and replaces what it corrects at every later read.

## 6. What a week start records

`anchoredStart` records, per sport, only `provenance` (`INTAKE`, `RETURN_ENTRY`, `WEEK_EVIDENCE`), the deciding `eventId` and `evidenceThrough` (the clock of the evidence it read). `projectedStart` records `CONDITIONAL_PLAN` with the rows it assumed (`premise`, per sport and per exercise), which the planner's own validation and the record keep.

Removed with this contract: the `projectedBase` record (which values a start carried from a projection) and the per-value `rebuilt` flag. History no longer reads a start's values, so there is nothing to rebuild. A return still records, per value, its basis and the week it comes from (`interruption.stateAt.values`).

## 7. R42 — progression tick ownership

```
PROGRESSION_TICK_OWNERSHIP = EARNED_PROGRESS (historical) vs PROJECTED_PROGRESS (planning)
```

Two concepts, never one ambiguous field:
- **EARNED_PROGRESS** — `HistoricalState.earnedProgress.loadTick`, the successful exposures at the exercise's current load. Only the evidence that earned them writes it: when a lift adopts a load above the one the evidence state held, the tick at that new load starts at 0 (`earnedAt`). A lifted projected dose therefore promotes the **load**, never the projection's count (QE-R7ASE-01).
- **PROJECTED_PROGRESS** — the `loadTick` the planner carries in `stateTrace` for the weeks it projects. It may run ahead; it is never read as history.

Every decision steps a load on EARNED_PROGRESS, because the PlanningView takes the tick from history (§4).

## 8. Declared boundaries

| # | Boundary | Why |
|---|---|---|
| E1 | A handler that applies the weekly review's rule for a sport closes that week for it (a weekly review; an equipment, schedule, goal or fatigue statement on the week's last day). Which decisions review a week is the planner's, unchanged | R7-A.1 C3; the state evidence contract E6, kept |
| E2 | The planner reads the PlanningView, and only the atoms of §4. Its rules defined on executed history read history | QE-R7ASE-02: the state evidence contract's E1 ("planning reads the planning view") was too broad and is withdrawn |
| E3 | A week is evidence for a sport only as a whole (every gate of the sport), and for strength only with a usable deciding log per exercise | SSCTR S-A; R7-A final P5 |
| E4 | A value is read at the cut, with the decisions and reports in force then | R7-A final I6 |
| E5 | Weeks never reported are not history: their sessions are facts only, so nothing steps | Founder §1, §11 |
| E6 | A week the athlete executed as **finally prescribed** is evidence, whoever reduced those rows (a fatigue report, an unavailable day, an equipment change). The premise comparison against what an earlier projection assumed is gone with the copying it served | §1; it removes NF-R7AB-1's under-reading. **New to this mission: the SSCTR must check it as a regression** (§10) |

## 9. Invariants

| Founder | Where |
|---|---|
| I1 history only from fact; I8 a review does not promote; I9 a week boundary does not promote | §3, §5; tests T11, T12, P1, P2 |
| I2 projection may differ | §4; T3 |
| I3 execution promotes the executed value; I5 a different execution wins | §5; T4, T5 |
| I4 execution does not promote unproven metadata | §7; T6, T7 |
| I6 last performed is factual | §5; T8, T9 |
| I7 partial execution is partial fact | §5; T10 |
| I10 cross-sport isolation; I11 cross-exercise isolation | §5 (per sport, per exercise); T16, T17 |
| I12 historical corrections are valid | §5; T15 |
| I13 return reads history | `stateAtBreak` with `historicalStrength`; T13, T14 |
| I14 learning contract | The athlete model reads reported observations only (`updateLearningModel` over the bound ledger), never a projection |

## 10. What the SSCTR must check as a regression (§26)

1. **E6**: a week executed as finally prescribed (a reduced week, an unavailable day, an equipment window) is now evidence for its sport, where the previous freeze sent that sport back to the re-entry. Dose, progression, return entry, re-establishment, ceilings and phase behaviour must stay inside the approved recipes.
2. **The return's base** (T13, `historicalStrength`): a return resumes the dose last executed, undoing a step the evidence released but the athlete never executed.
3. **R42**: a lifted projected dose promotes the load, not the projection's tick, so a step can come one successful exposure later than on the previous freeze.
