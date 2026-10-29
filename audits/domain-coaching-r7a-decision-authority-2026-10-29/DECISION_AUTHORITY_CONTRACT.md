# R7-A DECISION AUTHORITY CLOSURE — contract

**Revision:** R7ADA-CONTRACT-1, 2026-10-29. **Authority:** the Founder request of 2026-10-29, verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md).
**Supersedes nothing.** [STATE_CONSUMER_CONTRACT.md](../domain-coaching-r7a-state-consumer-2026-10-29/STATE_CONSUMER_CONTRACT.md) and the state model contract stay in force. This contract adds the rules below and withdraws only boundary E10 of the state consumer contract (§1.2).
**Architecture unchanged (§1.6):** `HistoricalState ≠ PlanningProjection`; `PlanningView = HistoricalState + PlanningProjection + constraints/policy`. No new state model, planner, provenance framework, event sourcing or temporal store.

The five findings group into three contracts. The walk/jog ceiling is the sporting consequence of the third.

| Contract | Findings | Runtime change |
|---|---|---|
| A. Factual authority | QE-R7ASC-01 | `heldKnownLoad` (r6-program); `viewMovedBy` and REPLAN_FROM_EVIDENCE (r6-adaptation) |
| B. Coherent decision context | QE-R7ASC-04 | the PLAN reading of the evidence reducer (`evidenceState`, `decisionEvidence`); `rebuild` |
| C. Evidence-based progression authority | QE-R7ASC-02, QE-R7ASC-03 | `planningBase` (run from evidence); HOLD replay of open weeks; `GATE_ORDER` |
| C′. Walk/jog return ceiling | SSCTR F4 | `advanceRun` WALK_JOG; `historicalRun` in `stateAtBreak` |

## A. Factual authority (QE-R7ASC-01)

**A1. A prescribed load never establishes history.** A KNOWN row is the reference a log is judged against (SSCTR D44) only when the start holds a factual known load for the exercise (`heldKnownLoad`: mode KNOWN with a finite load, settled by executed evidence). Otherwise the row is read as an establishment (`asEstablishment`), and its first log waits for confirmation (SSCTR D45). This applies in every reader of executed evidence:
- the facts-only reading of a week no review closed (`strengthAtBreak`);
- the evidence transition (`advanceStrength`, any reading that is not a conditional projection);
- the load questions (`loggedLoadQuestions`).

An exercise held only as FROM_LOG, unlogged or awaiting confirmation therefore adopts nothing from a KNOWN row planned before a correction, retraction or conflict removed its evidence.

**A2. Unknown is not zero and not the target.** An unreadable execution (an unknown unit, repetitions without a load, a completed session without details) is no load. It is never filled with the prescribed value.

**A3. A correction re-plans what was planned from the fact it removes.** A review under way whose evidence about an earlier week moves this week's PlanningView re-plans the sessions still ahead (`viewMovedBy` → `REPLAN_FROM_EVIDENCE`). That evidence is a correction, a retraction, or a newly quarantined conflict. Completed sessions keep their rows. A row planned from a retracted fact is therefore never the reference a later log is judged against, whether the correction arrived before or after the row was planned (EARLY = LATE = AFTER).

**A4. Declared, unchanged:** an exposure executed against a row before that row's correction arrived keeps its SSCTR D44 meaning. It was judged against the row in force when it was executed. The self-challenge records it (`declared.A2`).

**P1 (property):** the same factual evidence with a planning target of 20 or of 24 gives the same HistoricalState. Tested by `P1 factual independence` and the self-challenge class A4 (18 cases).

## B. Coherent decision context (QE-R7ASC-04)

**B1. One reading per decision.** Every planning consumer of a decision resolves from one PlanningView. That view comes from the evidence reducer in its **PLAN reading** (`decisionEvidence`, `reading:'PLAN'`).
- **PLAN reading:** a week's gates and its transition are judged under the context of the week entered (`skOf(k)`), as the planner's own transitions are (R7-A.1 C2). One goal, phase and schedule apply per transition. No resolution starts under the old goal and finishes under the new one.
- **HISTORY reading (HistoricalState, unchanged):** each week is judged under its own context (`skj`), so no later decision rewrites what an earlier week earned (I1, P3).

**B2. A return's own week is read once.** The PLAN reading reads a return's own week as the planner's weekly review reads it, under SSCTR E7: every row of the week, with the week's summary, whether or not a review closed it. A review that closes the week therefore never changes the dose a later no-op decision resolves. HistoricalState keeps C5: the sessions after the return's point.

**B3. A re-plan of this week reads its own context.** When a decision re-plans from its own week (`rebuild` with `fromWeek === ctx.w`), its PlanningView is recomputed on the program it produces, under the new context. It never reuses the view of the context it replaces.

**P2 (property):** the same facts with the same active context give the same resolved prescription, whatever irrelevant handler acts or in whatever order. Tested by P07's 20 goal pairs, the goal change stated after the closing review, 28 handler orders (equipment, equipment window, schedule, empty review), review closure and the return week. Self-challenge classes C1–C5: 77 cases, 0 violations (predecessor 52).

## C. Evidence-based progression authority (QE-R7ASC-02, QE-R7ASC-03)

**C1. The run of a decision is earned, in every mode (E10 withdrawn).** `planningBase` takes the whole run from the PLAN reading (EarnedRunProgress): targets, ladder steps, unlock counters (`easyWeeksDone`, `qualityDone`, `stridesDone`, `thresholdDone`, `devCount`) and peaks. The projection supplies only the summary of the rows the week prescribes (`planned`) and the record of modes the program used (`modeHistory`, SSCTR D47, kept from both). The projection's run is never a start. Two unexecuted weeks therefore advance no threshold, QUALITY, strides, walk/jog step, continuous running or long run.

**C2. A week the evidence never closed or completed earns nothing in the PLAN reading.** A week that is past, not closed by a review and not complete is replayed as HOLD for the run: no progression credit, and the HOLD consequences (repeat the step the week prescribed). HistoricalState makes no transition for it, as before. The PLAN reading can therefore sit at or below history, never above it (self-challenge D1: 44 cases, 0 with the plan ahead of history).

**C3. Gate resolution is semantic (P4).** One verdict per gate key, whatever order roles and rows are read in: the most restrictive stands (`GATE_ORDER`: REGRESS > HOLD > ADVANCE > EARNED). A gate that prevents progression never disappears because another gate was read after it. This applies to the run, where RETURN and RESTART share the EASY gate (SSCTR R13), and to each strength exercise. No new science is added: each verdict is an existing policy verdict, and fail closed decides between them. No explicit policy exception exists.

**C4. Temporal credit (P5).** A run not yet due (PENDING) holds its gate. The week is not complete until that session is executed, so the history read on Thursday 22:00 never credits Sunday's long run, and a missed long run holds the return (P05, P05b).

**C5. Missed long run (§17).** An unexecuted long run never steps the next one because the projection was ahead: neither inside a re-entry (P05: 20 → 20, not 45) nor outside it (self-challenge D2).

**Preserved (§22, §23):** HOLD repeats the current valid line within its range. The Founder example: executed 82.5 × 3, range 4–6, line 82.5 × 5, HOLD gives 82.5 × 5. HOLD carries no future progression. MAINTAIN: last factual 70 × 10, old projection 70 × 12, new goal MAINTAIN with target 8 gives 70 × 8. Both are tested on both trees.

## C′. Walk/jog return ceiling (SSCTR F4)

**W1. The ladder moves from the step the week ran, for every gate.** Outside the event window, the walk/jog transition starts from `min(state, the step the week's runs prescribed)`, as RETURN and RESTART already do. A HOLD or a consolidation week repeats that step, so history never keeps a step above the one the week ran. In the event window the one-step-back days are a planned reduction, not a tolerance: the step reached holds there (SSCTR D43).

**W2. A return never starts above the step last run (P6).** The state a return reads caps the walk/jog step at the step of the last walk/jog session executed (`historicalRun` in `stateAtBreak`). A step the evidence released but the athlete never ran is not tolerated yet. Without any walk/jog session on the record, the state stands (the intake's step).

**P7 (execution promotion):** once the athlete runs the next step, that step is the one a later return reads.

## Declared boundaries and ruling points (not changed here)

| Id | What | Why it is not changed in this mission | Owner |
|---|---|---|---|
| R1 | **Standing projection between re-plans.** A week's rows stay as last planned until a decision re-plans that sport: a closing review, a schedule, goal or event change, a return, a correction re-plan (A3), or an equipment statement for strength. If a week passes unreviewed with nothing executed, a decision that re-plans nothing (an empty mid-week report, an identical schedule) keeps the next week's rows. Those rows were projected assuming the week was executed. Every re-plan, every return and HistoricalState read the evidence (C1, C2). Identical on the predecessor (self-challenge `declared.C4c`). | A general rule that re-plans any decision under way from its PlanningView was implemented and measured: 29 of 663 approved tests fail (R6 "mid-week reviews never gate", local fatigue, the state evidence T-family, F2, P40). It changes what an unreviewed week means: "unknown, the plan stands" (E1/E3, QE-R7ASM-05) becomes "not executed". That is a planner-level change (§1.6) | Founder |
| R2 | **A mid-week return holds its first week.** With C3, SSCTR E7 (the planner gates every row of a return's own week, the sessions inside the pause included) holds that week whenever runs planned before the return day fall in the pause, even if every session after it was executed. P05's control cell (Thursday and Sunday executed) is now RETURN step 0 rather than 1. History (C5) still credits the week. E7 anticipates this ("the planner can re-base a step the evidence already credited"); the predecessor's last-writer merge hid it for the run | Applying an exception for rows inside the declared pause would be new policy (§15: "Não invente ciência nova"). It is a one-condition change in `weeklyGates` if the SSCTR rules it | SSCTR |
| R3 | **Plan and history may differ after a return week (E7 vs C5).** The planner can hold a pre-break tick that history spends on a release the athlete never lifted. Example: kit `changes`, A_E6, SHORT: the plan releases 20 kg after the first full week back (week 9), the predecessor in week 10. The planner never sits above a dose the athlete has not executed: the release needs the entry's factual tick plus one fully executed week | Both readings are approved; aligning them would change HistoricalState (§1.6) | SSCTR |
| R4 | A2/A4: an exposure executed against a stale row before its correction arrived keeps D44 | SSCTR D44, approved | SSCTR |
| R5 | O-1 (MAINTAIN 3 sets with maxSets 2) and R41 stay outside this gate (§1.4, §1.5) | No implementation here shows `maxSets` is a hard constraint for that case | Backlog |
