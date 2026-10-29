# INTERRUPTION_EPISODE_CONTRACT — R7-A Final Closure

**Revision:** R7AF-INTERRUPTION-1, 2026-10-28. It succeeds §2 (the break a return reports), §3 (the state at the break) and boundaries 3 and 5 of §5 of [INTERRUPTION_CONTRACT.md](../domain-coaching-r7a2-2026-10-28/INTERRUPTION_CONTRACT.md) (R7A2-COMPOSITION-3, frozen with R7A2-FREEZE-1). Every other clause of that contract and of [WEEK_COMPOSITION_CONTRACT.md](../domain-coaching-r7a1-2026-10-27/WEEK_COMPOSITION_CONTRACT.md) (R7A1-COMPOSITION-2) is unchanged, including easy-slot ownership (§4 there).

**Authority:** the Founder decisions 0.1–0.8 of [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md), applied as given. **Status:** engineering contract of the offline synthetic Coaching Core (SHADOW reference). It adds no sporting rule and does not change policy R6-POLICY-5 (`18ec48f3…`). Code: `CoachingCore/src/r6-adaptation.mjs` (`episodesOf`, `interruptionEpisode`, `stateAtBreak`, `returnStrength`, `staleReturn`, `returnAfterPause`).

## 1. Why

R7-A.2 decided which break a report was about by comparing dates with the latest report still in force, and read the starting point from the returns still in force at the moment of the new report. A later report of an earlier break (QE-R7A2-01) moved "the latest report" past a separate break that had already begun and removed from force the return whose re-entry the athlete had executed. The separate break was then read as the first one and started from before it (pre-break dose). One cause: identity and state were read from the record's current supersession, not from what the record said and what the athlete had executed when the break began.

## 2. The record: InterruptionEpisode (0.1)

A return report (`RETURN_AFTER_PAUSE`) that re-plans records its interruption in the decision's `interruption`:

| Founder field | Recorded as |
|---|---|
| episodeId | `episode`: the interruption's identity. The `interruption.episodeId` the report gave for a new interruption, else the event id of its first report |
| startedAt | `startDate` (local day) and, when the report states it, `startedAt` (a timezone-aware instant) |
| endedAt / duration | `endDate`, `days`, `class` |
| reportedAt | the decision's `asOf` and `eventId` |
| provenance/source | `basis` (EXPLICIT, DUPLICATE, FIRST, AFTER_REENTRY, TRAINING_BETWEEN) and `inputHash` (the facts given) |
| revision/supersession | `relation` (NEW or SAME_BREAK), `revision` (1, 2, …) and `supersedes` (the report of the same interruption it replaces) |

It also records `stateAt` (the point its state came from, the exercises executed after it, and `sameDay` when a first-day session could be read either way without changing the plan) and `entry` (the start it set). A report that asks re-plans nothing and records nothing.

## 3. Which interruption is this? (`isSameInterruption`, 0.2–0.4, §8, §9)

Decided in this order, against the interruptions the record holds (episodes in the order first reported; each has its reports, the one in force and its first report, the day its re-entry began):

1. **Explicit identity.** `interruption.episodeId` names a recorded interruption (its identity, or the event id of one of its reports): the report is a newer report of it (SAME_BREAK, `basis` EXPLICIT). It keeps the identity and supersedes the report in force. Only the latest interruption is corrected, never back across the re-entry of the one before; a correction of an earlier interruption, once a later one set the plan, is **asked**. A name the record does not hold is a **new** interruption with that identity, under rule 3.
2. **The same report again** (one event id, the same facts): already recorded, **KEEP**, nothing added. One event id with other facts is **asked**.
3. **A demonstrable duplicate** (no name): the same days as the latest interruption: a newer report of it (SAME_BREAK, `basis` DUPLICATE). Two distinct interruptions cannot have the same days.
4. **A new interruption after re-entry or training** (0.3): it begins after the latest interruption's days, and on or after that interruption's first report (its re-entry) or with training recorded between them (an executed session of the plan): NEW, `basis` AFTER_REENTRY or TRAINING_BETWEEN, whatever the dates or the clock of any other report.
5. **Everything else is asked** (I9): a report ending before the latest interruption began, or reaching back across an earlier re-entry, asks for the dates; a report sharing days with the latest interruption (or following it with no re-entry or training between) without its name asks whether it corrects it (`interruption.episodeId`). Dates that touch or overlap never make two reports one interruption on their own (0.4).

**Legacy input (§9).** A report without a name is read by rules 2–5 only: equivalence is demonstrated by the same event or the same record, separation by re-entry or training, and anything else is asked. Returns recorded before this mission keep their recorded identity (R7-A.2 `episode`, else their event id); no migration.

## 4. What had the athlete executed when it began? (`executedStateAt`, 0.5–0.8, §10)

**The point:** the start set by the latest decision in force at the interruption's start.

- The latest interruption before this one (other than its own earlier reports) sets it through **the report of it in force at that moment**: made on or before the first day, or before the stated start time when there is one, even if a newer report of it came later (QE-R7A2-01). Reported in the interruption's week, the point is the start that report set from its report on; reported earlier, the start of the interruption's week, which carries it, as it stood before any return of that week replaced it (C5).
- An interruption first reported only after this one began is still the latest one before it (0.7, late historical fact): the start its report set is the point. The sessions between its end and its report belong to the plan before it (C5).
- **After an earlier interruption's return, a week's start is a point only when it was earned:** that return set it, a decision re-planned it after the week before was over (the weekly review's rule), or the week before was executed as planned. Otherwise (a re-entry week neither reviewed nor executed as planned) its planned start assumes return steps the athlete did not take (§10): the point moves back, week by week, as far as the return itself, and those weeks' executions are read as facts too. The same history therefore gives the same state whichever side of a week boundary the interruption begins (P5).
- Without an earlier interruption, the point is the start of the interruption's week as the plan set it (C3; the week before reviewed or, unreviewed, as planned): R7-A.2 boundary 3, unchanged.

**The facts** (`strengthAtBreak`, unchanged from R7-A.2): the strength exposures the record shows executed after the point and before the start (planned before it, or executed before it; a conflicted report executes nothing until corrected), each week read as the weekly review reads it, as facts only: in use, last performed date, and outside a return the last executed whole count when its target was met (the return ceiling). No load adoption, no step, no block set. Runs keep the point's run state; their executed minutes count through the completed-work record. Nothing from the start on counts (I7).

**The same day (0.8).** With a stated `startedAt`, an execution before it is before the interruption and one after it is not. With dates only, a session on the first day cannot be ordered: the state reads it as after the start (the first day is a whole day of the interruption), and the other reading is computed. When the two readings differ in a fact the return starts from (an exercise in use or not, its ceiling, an unlogged load), the start time is **asked** (`interruption.startedAt`). When they differ only in a last performed date, the date suffices and the other reading is recorded (`stateAt.sameDay`): that date can only move a re-establishment threshold, and the reading kept (the earlier date) is the conservative one. Materiality is judged on the state, never on the plan in force, so a later change of schedule, event or goal on the same day never makes the same two reports give different results (an order dependence a plan-based test showed in the R7-A.1 evening grid before the freeze).

**A correction (0.6)** reads `executedStateAt` at its own start, never the earlier report's snapshot: its own earlier reports are never its point.

## 5. Late historical evidence (0.7, I6)

An execution is placed by its execution time, never by its report time: a session synced after an interruption began counts before it if it was executed before it (the return reads it when the sync came first).

When the sync comes **after** the return: while that return still sets the plan (until its re-entry week is over), every review first recomputes `executedStateAt` for the latest interruption with the whole record. If the return's start would change (or a first-day session now makes the order material), the review **asks** to confirm the interruption again (`interruption.episodeId`, or the same dates), records the late facts and changes nothing else (confirmation-first). A new interruption reported meanwhile is asked the same way. The confirmation is a newer report of the same interruption, which reads the whole record.

After the re-entry week, the re-entry has been executed and reviewed: a late fact is read as every late fact (completed-work record, history windows), never by replaying a decision (boundary B1).

## 6. Easy slot

Unchanged (INTERRUPTION_CONTRACT §4): a short return's slot carries its interruption's identity; a newer report of the same interruption keeps it; a separate interruption never adopts it. With identity decided as above, a separate interruption reported after a late report of the earlier one keeps its own slot (QE-R7A1-10 through QE-R7A2-01).

## 7. Declared boundaries

| # | Boundary | Why |
|---|---|---|
| B1 | A late fact arriving after the latest return's re-entry week is read as every late fact, without replay | The re-entry was executed and reviewed on its own evidence; replay would be event sourcing (§7) |
| B2 | A late log of a week before the state point (a week a review already decided) is read through that review | Same rule as every reviewed week; no replay |
| B3 | Before any return, an unreviewed week's start is the plan's (C3) | R7-A.2 boundary 3, accepted by both judges; this mission changes it only after a return (P5 between episodes) |
| B4 | A correction of an earlier interruption, once a later one set the plan, is asked | Re-planning it would erase the later interruption's re-entry |
| B5 | A report made on an interruption's first day precedes it (dates only) | The same reading that makes a break beginning on a return's report day a new break; a stated `startedAt` orders instants |
| B6 | A session between a break's end and its report belongs to the plan before it (C5) | Unchanged; identity still counts it as training between interruptions |

## 8. Items with sporting reach (for the SSCTR regression check)

| # | Behaviour | Basis |
|---|---|---|
| F-A | A separate interruption after a re-entry starts from that re-entry, whatever reports came later (the QE-R7A2-01 path no longer restores the pre-break dose) | 0.3, 0.5; SSCTR D53, D59 readings unchanged |
| F-B | After an unreviewed, unfinished re-entry week, a later interruption starts from the re-entry plus the executed facts, not from the week start that assumed the steps | §10, P5; more conservative than R7-A.2 on that path only |
| F-C | A first-day strength session without a start time is asked when the order changes the plan | 0.8; SSCTR NF-1 |
| F-D | A pre-break session logged after the return is confirmed before anything else is planned | 0.7; SSCTR R37 |
| F-E | A break first reported after a later break began is the later break's point (its return's start) | 0.7; P21 |
| F-F | A date-shifted correction without the interruption's name is asked; a named one re-derives as R7-A.2 did | 0.4, §8 |

## 9. Invariants and evidence

| Invariant | Tests (`CoachingCore/test/r7af-episode-identity.test.mjs`, and R7-A.2's file where noted) | Self-challenge classes |
|---|---|---|
| I1 stable identity | "same episode", "P6" | C3, C13, C14 |
| I2 distinct identity | "QE-R7A2-01", "cross week", R7-A.2 I1/I3 | C1, C2, C6, C12, C15 |
| I3 same-episode supersession | "same episode" | C3, C4 |
| I4 distinct-episode independence | "QE-R7A2-01", "P3" | C1, C6 |
| I5 temporal state | "same episode" (0.6), "cross week" | C3, C9 |
| I6 late evidence | "late session" | C7 |
| I7 no future leakage | "same day", R7-A.2 I4/I6, P3/P4 | C8 |
| I8 easy-slot ownership | "short + short", R7-A.2 I9 | C11 |
| I9 ambiguity fail-closed | "I9", "same day" | C5, C8, C13, C14 |
| P1–P6 | "QE-R7A2-01" (P1), "same episode" (P2), "P3", "same day" (P4), "cross week" (P5), "P6" | C6, C3, C1, C8, C9, C13 |

## 10. Earlier tests whose meaning changed (Founder §0)

Edited in place and marked `R7-A final`; their R7A2-FREEZE-1 bytes are in `freeze1-source/`:
- `test/r7a1-composition.test.mjs` (C4/C6): the 16→5-day correction now names its interruption; unnamed, it is asked (0.4).
- `test/r7a2-interruption.test.mjs`: I2 (the correction names A; unnamed is asked), I9 (the same-morning and next-week corrections name the first break), the three-break correction names B, and I4/I6 (Monday's session observed on the break's first day is asked without a start time; with a start time before it, it is after the break).
