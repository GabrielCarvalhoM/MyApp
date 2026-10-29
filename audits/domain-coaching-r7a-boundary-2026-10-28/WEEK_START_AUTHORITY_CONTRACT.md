# WEEK_START_AUTHORITY_CONTRACT — R7-A Final Boundary Closure

**Revision:** R7AB-WEEKSTART-1, 2026-10-28. It succeeds the "point" paragraph of §4 and boundary B3 of [INTERRUPTION_EPISODE_CONTRACT.md](../domain-coaching-r7a-final-2026-10-28/INTERRUPTION_EPISODE_CONTRACT.md) (R7AF-INTERRUPTION-1, frozen with R7A-FINAL-FREEZE), and adds the temporal-contradiction rule to its §3. Every other clause of that contract, of R7-A.2's [INTERRUPTION_CONTRACT.md](../domain-coaching-r7a2-2026-10-28/INTERRUPTION_CONTRACT.md) and of R7-A.1's [WEEK_COMPOSITION_CONTRACT.md](../domain-coaching-r7a1-2026-10-27/WEEK_COMPOSITION_CONTRACT.md) is unchanged: identity, correction, distinct pauses, the facts read after the point, the same day, late evidence and the easy slot.

**Authority:** Founder decisions §0.1 and §11 of [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md), applied as given. **Status:** engineering contract of the offline synthetic Coaching Core (SHADOW reference). It adds no sporting rule and does not change policy R6-POLICY-5 (`18ec48f3…`). Code: `CoachingCore/src/r6-program.mjs` (`WEEK_START`, `premiseOf`, `startAuthority`, `anchoredStart`, `projectedStart`, `generateProgram`), `src/r6-composition.mjs` (`composeWeeks`), `src/r6-adaptation.mjs` (`historicalWeekStart`, `stateAtBreak`, `weeklyReview`, `rebuild`, `returnAfterPause`).

## 1. Why

`stateAtBreak` reused a stored week start as the state the athlete had executed whenever its `earned` predicate held. The predicate asked *when* a decision was made (any decision dated after the week before ended, QE-R7AF-01), not *what had made the start*, because the stored start recorded nothing about why it existed. Its third clause ("the week before executed as planned") also counted a report of a session not done, a partial one or a skipped one, and ignored adverse responses, unlogged sets, a lighter load and a same-week adaptation made after the projection. Before any return the start of the week was the plan's (B3). One cause: projected and historical starts shared one structure and no consumer could tell them apart (Founder 0.1, §7).

## 2. The record: WeekStartState

| Founder field | Recorded as |
|---|---|
| state | `stateTrace[k]` (unchanged) |
| authority | `weeks[k].startAuthority.authority`: `EVIDENCE_ANCHORED` when every sport's part is evidence, else `PROJECTED` |
| provenance | `weeks[k].startAuthority.RUN` and `.STRENGTH`: `provenance` and `eventId` (the decision that set it) |
| evidenceThrough | `evidenceThrough` of an evidence part (that decision's clock); a projected part records `asOf` and `premise` instead |

Provenances:
- **INTAKE**: the first week, the athlete's reported current state.
- **RETURN_ENTRY**: a return's entry, the state executed when its interruption began with the interruption's facts.
- **WEEK_EVIDENCE**: the weekly review's rule applied to the complete week before.
- **CONDITIONAL_PLAN**: the plan, which assumes the week before executed as prescribed. `premise` is a digest of that week's rows of the sport (identity, status, prescription) the transition assumed.

Who sets it:
- `generateProgram`: week 0 INTAKE, every later week CONDITIONAL_PLAN.
- `composeWeeks`, the one composition every handler uses:
  - a start the caller sets carries the caller's authority (the weekly review's WEEK_EVIDENCE or a return's re-base; `rebuild`'s evidence or conditional start; a return's RETURN_ENTRY);
  - a start kept keeps its authority;
  - the next week's start from this week's evidence is WEEK_EVIDENCE, by this decision;
  - every conditional transition is CONDITIONAL_PLAN with the rows it assumed, which are the rows *before* this composition re-applies the week's adaptations;
  - a sport outside the re-planned sports keeps its part.
- A return that re-plans its own week keeps the authority of the start it replaced with it (`startBeforeReturnAuthority`).
- Same-week adaptations (fatigue, unavailable day, a move, a wait) change rows without re-projecting the next start. Its `premise` then no longer matches, so a projection made before an adaptation never verifies.

## 3. The consumer: historicalWeekStart

The planner reads every start alike. Only `stateAtBreak` reuses a week start as history, and it asks one question: does this start hold authority as history at the cut (the interruption's start)? Each sport's part must hold:

| Part | Holds when |
|---|---|
| INTAKE | always |
| RETURN_ENTRY | set before the cut |
| WEEK_EVIDENCE | set before the cut. Inside a return (the start carries return steps), the week before's own start must hold too, or the week before was executed in full (every prescribed session completed): a value the review held is that start's value (I4) |
| CONDITIONAL_PLAN | the week before executed as the projection assumed, read as the weekly review reads it at the cut (completed sessions, §10): (a) its rows are the premise; (b) every gate of the sport is ADVANCE or EARNED; (c) no logged load the review would adopt is below the load the projection assumed lifted (the row's known load, else the one the week started with); plus the same inside-a-return base rule |

Nothing else makes a projection history: not a decision's date, a handler, a stored field or the passage of time (I1, I3, P5). A week recorded before this contract states no authority: week 0 is the intake; a later week is read as a projection whose gates and loads must hold (rows unknown).

## 4. The state point (stateAtBreak)

The point is still the start set by the latest decision in force at the interruption's start (R7AF-INTERRUPTION-1 §4: the report in force by report time, late reports, the start a return of the week replaced).

A week's start is a point only when `historicalWeekStart` says it holds. Otherwise:
- the point moves back week by week, as far as the return in force or week 0;
- those weeks' executions are read as facts (`strengthAtBreak`, unchanged: in use, last performed, the ceiling when the target was met outside a return; no adoption, step or block set).

This holds **before any return too**: B3 is superseded by Founder 0.1. The decision records why the point holds: `interruption.stateAt.authority = {RUN, STRENGTH}`, one of INTAKE, RETURN_ENTRY, WEEK_EVIDENCE or COMPLETED_SESSIONS.

## 5. Temporal contradiction (Founder §11, I7)

A named correction of the same interruption (SAME_BREAK, EXPLICIT) may put the interruption's end on or after training recorded after that interruption's return began, which is its first report. That training would then be both re-entry and before or inside the interruption, and both cannot be true. When the corrected report would change any prescription, it is **asked** (`interruption.startDate`, `interruption.endDate`). No story is chosen.

A correction that crosses no executed re-entry applies as before (R7-A final). An unnamed date-shifted one is still asked (Founder 0.4).

## 6. Declared boundaries

| # | Boundary | Why |
|---|---|---|
| B1, B2, B4–B6 | Unchanged from R7AF-INTERRUPTION-1 §7 | |
| B3 | **Superseded**: before any return, a planned week start is history only through evidence | Founder 0.1, §2 ("todo início de semana") |
| B7 | A start a review confirmed, or completed sessions verified, keeps the plan's last-performed dates | A review that keeps the plan records nothing; the state is the one the plan stored. A date can only move a re-establishment threshold |
| B8 | Inside a return, "executed in full" is per week, not per exercise: a week with one session missed keeps a start holding values carried from a projection out of history, and the walk-back then reads the executed sessions only as facts | Conservative. Per-exercise authority would be a new state model |
| B9 | A recorded WEEK_EVIDENCE start stands when evidence it read is corrected later. A start verified by completed sessions is recomputed from the record at every read (P4) | Same rule as B2: a week a review decided is read through that review; no replay (§7) |
| B10 | A week recorded before this contract states no authority (legacy): week 0 is the intake; a later week must pass the gates and loads | No migration, as for identity (R7-A final §9) |
| B11 | The decision clock (a part set at or after the cut never counts) is a guard: no start a point can read is set at or after the cut (§18 mutation, documented) | I7 of R7-A final ("no decision made then or later") |

## 7. Items with sporting reach (for the SSCTR regression check)

| # | Behaviour | Basis |
|---|---|---|
| S-A | After an unfinished, unreviewed re-entry week, a later interruption starts from the re-entry plus the executed facts, whatever was decided meanwhile (QE-R7AF-01 closed). The run stays at the return step executed; only a review on the complete week may step exercises executed in it | 0.1, §9, §14 |
| S-B | Completed sessions anchor a projected start only when the week executed exactly as assumed, including the loads. Lighter effort-guided loads during a return leave the start to a review, or to the re-entry plus facts | §10 |
| S-C | A first interruption after an unconsolidated week walks back to the last historical start plus facts. On a never-logged program this is the intake: runs from the intake capacity, and an exercise never performed is established by effort (D52), not entered as a return step of a load the plan only assumed | 0.1; B3 superseded |
| S-D | Inside a return, a value a review held from a projected start is not history until a week is executed in full | I4 |
| S-E | A named correction contradicting its own executed re-entry is asked (QE-R7AF-02 closed by §11) | §11, I7 |
| S-F | No unexecuted return step, load or whole count reaches a ceiling or a resumed dose through a stored start | D49, D53, D56 |

## 8. Invariants and evidence

| Invariant | Tests (`CoachingCore/test/r7ab-week-start-authority.test.mjs`) | Self-challenge classes (`probes/r7ab-self-challenge.mjs`) |
|---|---|---|
| I1 projected ≠ historical | "QE-R7AF-01", "time alone" | C1, C5 |
| I2 evidence anchor | "I2" | all (`stateAt.authority`) |
| I3 no projection promotion | "QE-R7AF-01", "I8/P1/P2", "families A, C" | C1 |
| I4 return continuity | "QE-R7AF-01", "I4" | C1, C4 |
| I5 execution promotes authority | "I5/P3" | C2 |
| I6 late evidence | "I6" | C2 |
| I7 temporal contradiction | "I7" | C7 |
| I8 handler independence | "I8/P1/P2", "families A, C" | C1, C9 |
| P1–P5 | "I8/P1/P2" (P1, P2), "I5/P3" (P3), "P4", "time alone" (P5) | C1, C2, C5, C6 |
| Premise breakers | "§13 premise" | C3 |
| Before any return | "Founder 0.1, family G" | C8 |

## 9. Earlier tests whose meaning changed (Founder 0.1)

`test/r6-adaptation.test.mjs`, "nonclinical return is staged from current evidence", edited in place and marked `R7-A boundary`. On a never-logged program the return starts from the intake, and exercises never performed are established by effort. The 1-set return entry is now asserted on the same program after three executed and reviewed weeks. Its R7A-FINAL-FREEZE bytes are in `final-freeze-source/`.
