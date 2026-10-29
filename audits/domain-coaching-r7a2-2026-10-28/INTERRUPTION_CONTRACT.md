# INTERRUPTION_CONTRACT — R7-A.2

**Revision:** R7A2-COMPOSITION-3, 2026-10-28. It amends the return sentences of clause C5 of [WEEK_COMPOSITION_CONTRACT.md](../domain-coaching-r7a1-2026-10-27/WEEK_COMPOSITION_CONTRACT.md) (R7A1-COMPOSITION-2, frozen with R7A1-FREEZE-A2); every other clause is unchanged. Read the two together: this file is the successor for "which break a return reports" and "the state a return starts from".

**Status:** engineering contract of the offline synthetic Coaching Core (SHADOW reference). It adds no sporting rule. It applies the current policy (R6-POLICY-5, hash `18ec48f3…`: `strengthReturnSets`, SSCTR D49, D52, D53, D55) to a state it now reads correctly. The items with sporting reach are listed in §6 for the SSCTR.

## 1. Why

On R7A1-FREEZE-A2 a return started from a week-boundary snapshot: the start of the break's week, or `startBeforeReturn` for any return whose break began in a week an earlier return re-planned. Its easy slot was found by its explanation text. Nothing said which break a report was about, whether it corrected an earlier report or reported a new break, or what the athlete had executed when the break began. One cause, three blockers:
- QE-R7A1-09: a separate, later break was read as a correction of the earlier one and restored the state from before the first break;
- QE-R7A1-10: a second short break adopted the first one's executed easy slot;
- D59: exercises executed in the break's week before it, first exposures included, were missing from the state the return used.

## 2. The break a return reports (InterruptionEpisode)

Every return decision (`REESTABLISH`) records its break in `interruption`: `startDate`, `endDate` (the day before the report when not given), `episode` (identity: the event id of the break's first report), `relation`, `supersedes`, `stateAt` (the point its state came from and the exercises executed after it) and `entry` (the start state the return set).

Against the latest return still in force (one no newer report superseded):

| Relation | When | Effect |
|---|---|---|
| `NEW` | the break begins on or after the day that return was reported (after its re-entry) | a break of its own, with its own identity (I1, I3) |
| `SAME_BREAK` | it begins before that report and does not end before that break began | a newer report of the same break: it supersedes the earlier report and keeps its identity (I2) |
| asked | it ends before the latest reported break began, or it begins before the report of the return before (it would span that re-entry) | `ASK` for the whole period; never guessed (I1) |

A newer report of the same break replaces the adaptations its earlier report recorded (`RETURN_WAIT`, `SHORT_RETURN_EASY`) on the weeks from its own report on. A separate break's adaptations stay with that break (I9).

## 3. The state at the break (ExecutedStateAtInterruption)

`stateAtBreak` answers "what had the athlete executed when this break began?" with one reading:

1. **The point.** The latest state-setting point at or before the break's first day:
   - the start of the break's week as it stood before any return of that week replaced it (C5, `startBeforeReturn`), or
   - the start a return still in force set, from its report on, when that return was reported in the break's week on or before the break's first day (I3).
   A report this one supersedes was made after this break began, so it is never the point. A review decided after the break began is not used (I6).
2. **The window.** The sessions of that week after the point (C1 at the return's clock) that were planned before the break's first day or executed before it. Executions are read from the record by their own date: an execution observed on the break's first day or later is not before the break (I6), and a conflicted report executes nothing until it is corrected (QRE-R6-14).
3. **The facts** (`strengthAtBreak`, I5, I7). Each exposure executed in the window is read as the week's transition reads it, and only its facts are kept:
   - the exercise is in use: set up as a review sets it up (in a return-entry week it starts the return steps, R6-POLICY-4; while an exercise in use is in them its count comes back from its own, SSCTR D55), or recorded as re-established (SSCTR D53);
   - its last performed date (SSCTR D52);
   - outside a return, its last executed whole count after the time fit, when its logged target was met (the gate is read as the weekly review reads the part of the week before the break): the ceiling of a later return (SSCTR D49, R20).
   Nothing a review of the week decides is applied: no load adoption (a loaded exercise left without a usable reference is `unlogged`, SSCTR D52), no gate step, no cap rise or end, no return step, no block set (`strengthReturnSets`: the block in progress earns no set).
4. **Runs** keep the point's run state. What they executed counts through the completed-work record (the single-run ceiling), as before.

The return recipe then applies unchanged (I8): SHORT resumes that state; MODERATE and LONG start the return steps from it, with the last executed count as the ceiling.

## 4. Easy-slot ownership (I9)

The slot a short return makes easy carries its break's identity (`easedFor`). A short return's slot is the one its break already made easy, else the first quality slot still ahead of its report in the week as it stands (a run another adaptation already eased is no longer a quality slot, SSCTR R7A1-r2 reading a). A slot its week does not hold is carried to the next week placed, each break's on its own. A newer report of the same break whose slot is already history keeps that slot, in whatever week it comes: nothing else changes. Exactly one slot changes per break. A slot or a fact recorded before R7-A.2 carries no identity, and the two are read together as before.

## 5. Declared boundaries

- **The record as reported.** A return reads the executions recorded by its report. An execution of a session before the break that is recorded after the return does not re-derive that return: the record is append-only and no transition is replayed on a later fact, as for every other transition. A newer report of the same break reads it (I2). So the order of a return and a report of the week's earlier sessions decides only what that return read; in the R7-A.1 evening grid both orders give the same rows, and next week's start differs only by those exercises' last performed dates.
- **The point is the plan's start of the week.** When the week before the break was not reviewed, that start is the week's conditional plan (C3), as for every week.
- **The plan before a return.** A session executed after a break ended but before its return was reported belongs to the plan before the break (C5). It is never a fact of that return, nor of a later break.
- **A break's first day is a whole day.** Breaks are stated in dates. The break covers its first day, so a session executed that day and a review decided that day (for example the weekly review that evening) come after the break began. A break reported from Sunday therefore starts from the week before that evening's review; reported from Monday, it starts from the start that review set. The report time alone never changes the break (P5, P6).
- **Legacy returns.** A return recorded before R7-A.2 states no dates: its break is read as the days that ended the day before its report, and its start as the start of its re-entry week.

## 6. Items with sporting reach (for the SSCTR)

| # | Behaviour | Basis |
|---|---|---|
| S-A | An exercise first executed in the break's week enters the moderate or long return at the entry, with its executed count as the ceiling | `strengthReturnSets`; SSCTR D59 required change |
| S-B | A first-establishment log the break interrupted is not adopted: the exercise is in use without a load reference, so after a short break it is established by effort again (UNLOGGED, at most `effortGuidedLoad.sets` = 2, the same count as before R7-A.2); a bodyweight exercise set up before a short break continues at its normal count | SSCTR D52, D45; "resume the last completed doses" |
| S-C | An exposure that missed its logged target is performed but gives no ceiling count; the ceiling falls back as declared (the known count, else the normal count) | `strengthReturnSets` (D49) |
| S-D | A re-establishment executed before a break is recorded: the return's ceiling is the re-establishment count; after a short break the load is established by effort again | SSCTR D53, D52 |
| S-E | A second, separate short break gets its own easy slot; when the first break's slot is still ahead, both slots run easy | SSCTR D58 and reading a |
| S-F | A short break during the return steps resumes the step reached; a weekly review decided after the break began does not count | `strengthReturnSets`; I6 |
| S-G | The entry rep target of an exercise first executed before the break is the one it was executed at (an accessory's 7 instead of the goal's 5) | the executed fact |

## 7. Invariants and evidence

| Invariant | Test (`CoachingCore/test/r7a2-interruption.test.mjs`) and probes |
|---|---|
| I1 identity | "a separate break in the same week …", "a report of a break that ended before …" (ASK); P13 |
| I2 same-break supersession | "a newer report of the same break supersedes …", "three breaks …"; P02 |
| I3 distinct-break independence | "same week", "across the week boundary", "three breaks"; P13 X, X2, S |
| I4 temporal causality | "an exercise not executed, or executed only from the break's first day …", "a return reads the executions recorded by its report …", "a session of the plan before a return …" |
| I5 intraweek execution | "exercises first executed in the break's week …" (NONE, FAMILIAR, KNOWN); first-week grid |
| I6 no future leakage | "… executed only from the break's first day …", "P3/P4" |
| I7 no progression laundering | "a week's executed exposures before the break earn no step …" |
| I8 entry and ceiling continuity | "exercises first executed …" (E, O, B); first-week, restoration, cap grids |
| I9 easy-slot ownership | "a second short break never adopts …"; P14; short grid |
| P1–P6 | "P1/P6", "P3/P4", "P5"; author self-challenge (42 cases) |
