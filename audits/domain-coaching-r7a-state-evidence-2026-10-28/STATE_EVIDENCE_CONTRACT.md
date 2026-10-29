# STATE_EVIDENCE_CONTRACT — value-scoped fact vs projection

**Revision:** R7ASE-STATE-EVIDENCE-1, 2026-10-28. It succeeds §3 ("The consumer: historicalWeekStart"), §4's point rule and boundary B8 of [WEEK_START_AUTHORITY_CONTRACT.md](../domain-coaching-r7a-boundary-2026-10-28/WEEK_START_AUTHORITY_CONTRACT.md) (R7AB-WEEKSTART-1, frozen with R7A-BOUNDARY-FINAL-FREEZE), and adds the facts in §5 below. Everything else stands as written there: the record each week start keeps, the temporal-contradiction rule, and boundaries B1–B7 and B9–B11. Also unchanged are the R7-A final interruption contract and the R7-A.1 week-composition contract.

**Authority:** the Founder decision of [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md), §0: `STATE_EVIDENCE_AUTHORITY = VALUE_SCOPED`, applied as given. **Status:** engineering contract of the offline synthetic Coaching Core (SHADOW reference). It adds no sporting rule and does not change policy R6-POLICY-5 (`18ec48f3…`).

**Code:**
- `CoachingCore/src/r6-adaptation.mjs`: `historicalView`, `stateAtBreak`, `projectedBaseOf`, `evidenceStart`, `weeklyReview`, `rebuild`.
- `src/r6-program.mjs`: `exercisePremiseOf`, `projectedStart`, `anchoredStart`, `strengthAtBreak`.
- `src/r6-composition.mjs`: `composeWeeks`.

## 1. Why

A weekly review, or any handler that applies its rule, builds the next week's start on the week's stored start and records it as `WEEK_EVIDENCE`. Every value its evidence did not move is copied from that stored start, even when the stored start was a projection the athlete never executed. The authority belonged to the container (the start, per sport), not to the value. So a projected value became history because a later decision stored it (QE-R7AB-01).

The same container rule had two more effects:
- a projection verified by completed sessions carried an earlier projection's assumptions;
- history kept a planned last-performed date and a known load the athlete did not lift (Founder §8, P5).

## 2. Two views of one record

| View | What it is | Who reads it |
|---|---|---|
| **Planning view** | The stored start of each week (`stateTrace[k]`), as before: the plan's state, facts and projections combined (Founder §2, §15, §16) | The planner: the transition to next week, the composition, the week's rows and their rules (re-establishment threshold, unlock counters, caps), the race-week assessment, gates and log questions about the week as prescribed |
| **Historical view** | `historicalView(ctx, {cut, …})(k)`: the athlete's state at the start of week k, value by value, as the record stands at the cut, and why each value holds there | History: the state at an interruption (`stateAtBreak`) and through it every return's entry and ceilings, the late-evidence check (`staleReturn`), and the record of which values a review carried from a projection |

The planner keeps projecting: the plan of P40's cell U still prescribes 22 kg after the review that saw it missed (historical 20, projected 22: Founder §3, §18). Only history changed.

## 3. Values

A **value** is one strength exercise (its load, repetitions, sets, load ticks, return step, caps, last performed date and last executed count), or the run state as a whole. The run is one coupled machine: one mode, and long, easy and quality steps that share the week's one-step rule and its caps. Sport-level counters that no rule reads (the strength development count) follow their sport's start.

## 4. The historical value of each value at the start of week k

| The start's part | The value is history when | Otherwise |
|---|---|---|
| INTAKE (week 0) | always | — |
| RETURN_ENTRY, set before the cut (the report in force at the cut sets the point of its own week, R7-A final §4) | always: the entry is computed from history | — |
| WEEK_EVIDENCE, set before the cut | the review built the value on its historical value: the start before held that value as stored | **rebuilt**: the same rule (`evidenceStart`'s), on the same week's evidence, applied to the historical value. The review happened; its base did not |
| CONDITIONAL_PLAN, set before the cut | its own base value was history at k−1, **and** the week before executed the sport as the projection assumed: every row of the sport as assumed (per exercise for strength, including an exercise a later adaptation removed), every gate ADVANCE or EARNED, no logged load the review would adopt below the one assumed lifted (COMPLETED_SESSIONS) | the historical value at k−1 with week k−1's facts (§5); a run value keeps its state |
| any part set at or after the cut | never (B11) | as above |

Rules that hold everywhere:
- A value's basis is per value, never the container's: a `WEEK_EVIDENCE` start never lends its authority to a value it carried (Founder §10, I2, I9).
- Promotion is per sport for completed sessions (SSCTR S-A: a step for an exercise executed in an unreviewed week needs the complete week; R7-A final P5: the same start on either side of the week boundary). Each value then also needs its own historical base.
- A run value and a strength value are independent (per sport, SSCTR R40). Evidence about one exercise or sport never promotes another (I4, P3).
- The record at the cut decides. A fact executed before the cut and reported later counts by its execution time (R7-A final I6). Time, a week boundary, a handler, a stored field or the existence of a value in a projected base never promote (I1, I3, I8; Founder §11).

## 5. Facts read in a week (`strengthAtBreak`, and the rebuilt rule)

- In use, last performed date and, outside a return, the last executed whole count when its target was met: unchanged from R7-A.2.
- **A known load lifted is the load (Founder §19 B, P5).** On a row that prescribed a known load, the load the athlete lifted is the exercise's known load: lighter or heavier than the one held, never a step. The adoption rule reads the week's deciding log, judged against that row (SSCTR D44); a heavier load needs the row's target met. An effort-guided row, whose known load is a ceiling, adopts nothing (R7-A boundary S-B).
- **A projected dose the athlete then lifted is a fact (completed execution, Founder §11).** When the deciding log is exactly the known load the row prescribed from the stored start, and the historical value holds another load, the exercise enters the week at that dose: its load, repetitions and load ticks, the step the projection took and the athlete then took. Its own facts (last performed, last executed count) are kept. The repetitions are the target that goes with that load, never a count achieved: with repetitions unlogged, the load lifted is still the fact, the gate holds, and no further step is taken. §13 applies to what is missing, never to the load lifted (P40b cells 2 and 5).
- **Partial evidence stays partial (Founder §13).** Unlogged repetitions leave the target; a load in an unknown unit is no load (the last known one stays, never the planned one); an unexecuted count is never counted.
- **Last performed is an execution date.** For a value verified by completed sessions it is the executed date (`performedInWeek`), never the planned one (Founder §8; supersedes boundary B7 for dates).
- **A correction is a fact (I6, P6).** A corrected report replaces the report it corrects at every later read. A projection it no longer supports stops being verified, and it promotes nothing else.

## 6. The record (Founder §10)

- A projection's strength part records, per exercise, the rows it assumed (`startAuthority.STRENGTH.values`, `exercisePremiseOf`).
- A `WEEK_EVIDENCE` start records the values its review carried from a projection (`startAuthority.RUN.projectedBase: true`, `startAuthority.STRENGTH.projectedBase: [ids]`). History rebuilds them, and the planner keeps them.
- Every return records, per value, the basis and the week its stored value comes from: `interruption.stateAt.values`, with `rebuilt: true` for a value rebuilt on history. `stateAt.authority` is still per sport, and `stateAt.week` is the earliest of those weeks (a return's entry when that is the point).

## 7. Declared boundaries

| # | Boundary | Why |
|---|---|---|
| E1 | Planning reads the planning view: its rows, including the re-establishment threshold (D52), the quality and strides unlock counters, caps and the race-week assessment, are the plan's, made with its projections | Founder §2, §15, §16: the planner may project freely. History never reads them as facts. A plan made before facts arrive cannot know them, and the next review reads the facts |
| E2 | A run value read through an unreviewed week keeps that week's start; it is not re-gated, so the review's cap rule ("when a cap trimmed this week's run, progression continues from what was prescribed") does not trim it | The kept value is that week's evidence start, never a projection. Re-gating would change the state on one side of a week boundary only (R7-A final P5). Conservative everywhere else: the unreviewed week's run steps and counts are not credited |
| E3 | Completed sessions verify a sport only when the whole week executed it as assumed, so one exercise or session not as assumed (lighter, missed, a correction) leaves the others to their facts until a review | SSCTR S-A; R7-A final P5. Conservative (U ≤ R) |
| E4 | A value a review carried from a projection is rebuilt on the evidence as known at the cut, not at the review's clock | No consolidation exists for it to keep (B9 still applies to values the review built on history) |
| E5 | Weeks never reported are not history. A first review after them builds history on the intake plus its own week; the planner keeps its plan | Founder §1, §11 ("unknown != executed"); R7-A boundary S-C applied to the weekly review's base |
| E6 | A handler that applies the weekly review's rule to a sport on the week's last day is that sport's review. Examples: an equipment, schedule, goal or fatigue statement on Sunday. History reads its `WEEK_EVIDENCE` start per value as it reads a weekly review's, rebuilt where the handler carried a projection. A later return therefore starts, for that sport, as after a Sunday review, and for the other sport as without one. A handler in the next week (Monday) re-plans without reviewing the week before, and changes no history | Planning decides which decisions review a week (unchanged, E1). Per sport (SSCTR R40) instead of per whole start, which discarded a review of one sport while the other was still projected. Example (P30): after a Sunday equipment statement, a SHORT return resumes the back squat at the 20 kg executed on its effort-guided entry row, step 1, as after a Sunday review; without the statement it resumes the 82.5 kg ceiling at step 0. Evidence: P30, P30b, P47 (Sunday cells); the R7-A boundary self-challenge C1; `probes/COMPARE_R7ASE_NAMED.json` |

## 8. Invariants and evidence

| Founder item | Tests (`CoachingCore/test/r7ase-state-evidence.test.mjs`) | Self-challenge classes (`probes/r7ase-self-challenge.mjs`) |
|---|---|---|
| §18 P40, I1, I2, I9; families A, F, H | "§18 P40" | C1 (16 cells), C7 |
| B, I (P4) | "families B, I"; "§8 last performed date" | C7 |
| C (I5) | "family C" | C3 |
| P5 | "P5" | C9 |
| D, E (I4, P3) | "families D, E" | C4, C5 |
| G, K (I8, P1, P2, P7) | "families G, K" | C2, C6, C11 |
| J (I6, P6) | "family J" | C8 |
| I7, I10 | "I7, I10"; every R7-A suite | C1 (planning start kept) |
| I11 | "I11" | — |
| late evidence (R7-A final I6) | R7-A final and boundary suites | C10 |

## 9. Earlier tests whose meaning changed

`test/r7ab-week-start-authority.test.mjs` was edited in place, each change marked `State evidence`; its R7A-BOUNDARY-FINAL-FREEZE bytes are in `boundary-freeze-source/`.
- **"§13 premise", case "reduced (systemic fatigue)".** The report reduced only strength rows, and every run was executed as projected. The run therefore holds its completed sessions, and strength goes back to the re-entry (SSCTR R40).
- **"I4".** The review of week 6 records which values it carried from a projection. History rebuilds those on the re-entry and reads the rest from the start, so the break's point is week 7 and the Saturday-only exercises stay at step 0. The progress executed since the return is kept instead of being walked back to the re-entry.
- **"families A, C".** A strength-only change on Sunday applies the review's rule to strength. Strength is then history as the review would make it, and the run, still the plan, goes back to the re-entry (SSCTR R40).
