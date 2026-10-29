# Consumer audit — State Model Consumer Closure (Founder §22)

**Scope.** Bounded to the material consumers the Founder named: set-up, `historicalStateOf`, `planningBase` / the PlanningView, progression, the weekly review, return, restart, re-establishment and goal change. Also every other reader of a stored start or of the evidence windows on those paths. It is a search of `CoachingCore/src` (`r6-adaptation.mjs`, `r6-program.mjs`, `r6-composition.mjs`), not a proof.

**Questions** (Founder §22):
1. Does the consumer ask for History or Projection?
2. Does it get that view?
3. Does it resolve a dose semantically?
4. Does it use future evidence?
5. Does it read retracted rows?

**Line numbers** are of the runtime as it stands before the freeze.

## Readers of history, and their view

| Consumer | Asks for | Gets | Resolves a dose? | Future evidence? | Retracted rows? |
|---|---|---|---|---|---|
| `evidenceState` (`r6-adaptation.mjs:680`), the reducer | History | Canonical evidence observed before the cut (`seen`). Week k−1 is read at its own clock (`clockOf`), with its gates' windows bounded by that clock (`weeklyGates:179`) | It applies the weekly review's rule (`advanceStrength`/`advanceRun` in evidence mode) or the facts only (`strengthAtBreak`) | No. Fixed here: the strength look-back window had no upper bound, so later logs counted in an earlier week's gate | No. It reads `ctx.fullLedger`, the normalized ledger |
| `strengthAtBreak` and `advanceStrength` in evidence mode, set-up (`r6-program.mjs:547`, `:614`) | History | The week's rows read only as what was prescribed. For an exercise the start does not hold, `asEstablishment` (`:543`, `:605`) | Establishment only: no prescribed load and no adoption reference (QE-R7ASM-01) | No | No |
| `historicalStateOf` (`:772`) | History | `canonicalRecord` (`:798`): the carried record normalized and bound by the runtime's own functions | — | No (the reducer's cut) | No. Fixed here: QE-R7ASM-04 |
| `stateAtBreak` (`:826`), a return's entry | History at the break | The reducer at the break, the ledger before the break, `historicalStrength` | Its entry is `returnStrength` (approved D49 recipe) | No | No |
| `staleReturn` (`:869`) | History at the latest break | `stateAtBreak` | — | No | No |
| `returnAfterPause` (`:919`) | History at the break | `stateAtBreak`; the run from history at the break | The return recipe per class (unchanged) | No | No |

## The PlanningView and the decisions that read it

| Consumer | Asks for | Gets | Resolves a dose? | Future evidence? | Retracted rows? |
|---|---|---|---|---|---|
| `planningBase` (`:752`) | View | Strength: `resolveExercisePrescription` over history's exercises (`:758`). Run: history's whole run in RETURN/RESTART (`:756`); otherwise the projection's targets with history's capability atoms | Yes: one unit per exercise (EarnedProgress). No atom mixtures (QE-R7ASM-02, QE-R7ASM-03) | No | No |
| `weeklyReview` → `weeklyGates(base: ctx.base)` (`:372`), `evidenceStart(start: ctx.base)` (`:377`) | View + this week's evidence | `ctx.base`; `ctx.ev` (this week, at the decision) | `advanceStrength`: HOLD repeats the held dose (`earnedAt`), a return step moves from the dose executed (`doseStep`). `advanceRun`: re-entry steps from the dose run | No (decision time) | No |
| `rebuild` (goal, schedule and learned changes; `:474`) | View | `evidenceStart(ctx.base)` or `conditionalNext(weekAsPlanned(ctx.base))` | The planner rows from the view; the goal range in `strengthCandidate` (`inRange`, F3) | No | No |
| `equipmentChange`, `fatigue`, `missedSession`, `unavailableDay`, `eventWeekConflict` | View for re-plans; this week's rows for adaptations | `composeWeeks` / `weekAsPlanned` from `ctx.base` (`r6-composition.mjs:177`); `adaptThisWeek` changes only rows still ahead | Rows from the view | No | No |
| `loggedLoadQuestions` (`:88`) | View | `base: ctx.base`; `asEstablishment` for an exercise the view does not hold (`:94`) | It judges each log as the transition did | No | No |
| `moveCandidates` (`r6-composition.mjs:57`) | View (D52 dates) | `env.base` when a decision passes it; in a re-planned future week, that week's composed start | — | No | No |
| `strengthCandidate` (`r6-program.mjs:344`) | The resolved state of the week planned | The view's exercise, or a projected start for later weeks (planning) | The row: kind, counts, the current goal's range on every row of a known dose (`inRange`), the phase (`phaseDose`) | — | — |

## Progression transitions

| Consumer | Asks for | Gets | Notes |
|---|---|---|---|
| `earnedAt` (`r6-program.mjs:515`) | The dose a new load starts with | The adopted load against the load the state held | The credit restarts at 0 whoever set the higher load. The repetitions follow the gate: ADVANCE the logged repetitions, HOLD and REGRESS the row's target (F2) |
| `doseStep` / the return step (`:659`) | The return step the week executed | The kinds of the week's executed exposures (or rows) | It moves from the dose the exposures were prescribed at, never above the state (F1) |
| `advanceRun` RETURN / RESTART / WALK_JOG (`:200`–`:204`) | The re-entry dose the week ran | `P.returnStep` / `P.restart` / `P.walkStep` from `plannedOf` | It moves from the dose the runs prescribed, never above the state (the run side of F1) |

## Remaining readers of stored starts (projection), each declared

| Reader | What it reads | Why it is planning, not history |
|---|---|---|
| `modeOf` in `bindObservations` (`r6-adaptation.mjs:113`) | The run mode / return flag of the week the session was prescribed in | An observation's context label: the plan the athlete executed. It sets the comparable pool, not a state |
| `finishProposal` (`:265`) | The proposal's race-week run state | The completion negotiation describes the plan's race week |
| `weeklyReview` `pendingMoved` (`:383`) | The stored next-week pending loads | Whether the plan changed: a planning comparison |
| `breakOf` (`:621`) | `stateTrace[fromWeek]` only for a return recorded before R7-A.2 without its own entry | The start that return itself computed |
| `evidenceState` intake (`:695`) | `startBeforeReturn ?? stateTrace[0]` | The intake, the one start the reducer reads by contract. A week-0 re-plan writes the view back, and the view is the history verbatim, so the intake does not move |
| `evidenceState` prescription summary (`:720`) | `stateTrace[j].planned`, except in a return's own week | What the plan prescribed. In a return's own week it is the summary of the sessions after the return's point (NF-R7ASM-1) |
| `planningBase` (`:753`) | The projection's run outside re-entry modes; strength `planned`, `entryWeek` | Declared (contract §5, E10) |
| `rebasedNext` (`r6-composition.mjs:32`) | `stateTrace[w+1]` after a return re-planned from next week | That return's own start |
| `composeWeeks` `own()` (`:226`) | Stored states of the sports a change does not re-plan | A strength-only re-plan keeps the run's rows and states unchanged. The run start it computes is discarded, so the run is never planned from that stored state |

## Windows over the record

| Reader | Bound | Status |
|---|---|---|
| `recent()` (`:139`) | `observedAt ≤ asOf` and the window | Already bounded |
| `weeklyGates` strength `hist` (`:179`) | `observedAt ≤ asOf` added | **Fixed here** (Property D) |
| `learnedInterference` (`:194`) | No upper bound | Called only at decision time on the normalized ledger, which rejects anything observed after the decision clock (`normalizeObservations`, FUTURE_OBSERVATION). It is never part of history. No change |

## Conclusion

Every material consumer on the named paths reads the structure its rule is defined on:
- history for what happened (with the cut, the week's own clock and the canonical record);
- the resolved prescription for the dose a decision starts from;
- the projection only as declared planning.

Within this bounded search, none uses evidence from after its clock or a retracted row.
