# R7-A.1 independent engineering review (R7A1-QE-r1)

**R7A1_ENGINEERING_REVIEW = NOT_READY on R7A1-FREEZE-A1.**

- **Blockers:** 4 of the 7 are closed by their mechanism (QE-R7A-03, QE-R7A-12, QE-R7A-19 and the engineering side of D56/D53). 3 are still open: QE-R7A-01, QE-R7A-02 and QE-R7A-05. Each has a residual in the same mechanism and claim, on a path the author's grids do not reach.
- **New findings:** 5 are material (2 HIGH, 3 MEDIUM). 3 are LOW and do not block.
- **The central question (Founder §12).** Is there another handler that can destroy, or rebuild differently, state the contract protects? **Yes, five.** The common pattern is that the composition fixed *which* state survives, but three inputs still differ between handlers:
  1. the context a moved session is placed under;
  2. the inputs the evidence rule reads;
  3. the week whose start a return correction reads.
- **Next step:** one correction cycle, then FREEZE-A2. Each material finding below has a minimal reproduction and the change it needs.

**Who did this.** I am the Quality & Reliability Engineer (constitution 1.3.0), a fresh instance (claude-opus-5-5). I did not write this runtime, I changed nothing under `CoachingCore/`, and I judge no sporting dose.

## Freeze checked

R7A1-FREEZE-A1 (`CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A1.json`).

| Check | Start | End |
|---|---|---|
| Source digest, recomputed (`hash()` of `value.mjs` over the `src/*.mjs` SHA-256 map, as in `freeze-r7a1.mjs`) | `2de8681f13e5cb499df6a5a3dc443d52877850528ceb298b598d03de6ec2141a` | `2de8681f13e5cb499df6a5a3dc443d52877850528ceb298b598d03de6ec2141a` |
| Policy hash | `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c` | same |
| Frozen files that differ from their recorded SHA-256 | 0 of 77 | 0 of 77 |
| `node CoachingCore/scripts/verify-r7a1.mjs` (without `--write`) | 13/15. Only `independent-reviews` and `deliverables` fail, as the brief expects. `freeze-current`, `tests` (495/495), `regression`, the five probe re-runs, `ssctr-instrument` and `mutation-check` all pass | see `qe-a1-verify.end.out.json` |

Files: `qe-a1-digest.mjs` and `qe-a1-digest.{start,end}.out.json`; `qe-a1-verify.{start,end}.out.json`.

## What I ran

All scripts are in `audits/domain-coaching-r7a1-2026-10-27/reviews/`. They print only and load the live runtime read-only. Where it helps, they also load the byte-exact FREEZE-2 copy (`freeze2-source/`). P08 loads the R6-closure snapshot, rebuilt in the OS temp folder.

| Script | What it checks | Result |
|---|---|---|
| My R7-A re-check probes `qe-recheck-P1…P8` (in the R7-A folder) | The seven reproductions on FREEZE-A1 | P1, P2, P3, P4, P5 fixed; P7 and P8 unchanged (LOW items outside scope). P6 refuses, as the brief expects |
| `qe-a1-P01-moved-content-after-equipment.mjs`, `qe-a1-P01b-move-into-equipment-window.mjs` | A recorded move, then an equipment change; a move into an equipment window | **QE-R7A1-01** |
| `qe-a1-P02-return-correction-next-week.mjs` | A return correction made ten hours apart, across the week boundary | **QE-R7A1-03** |
| `qe-a1-P03-timezone-invariance.mjs` | Time-zone translation invariance: 5 offsets × 4 clock pairs × the singles and pairs of the author's change set, 2 programs | 2,844 comparisons, **0 differences** |
| `qe-a1-P04-systemic-signal-paths.mjs`, `qe-a1-P05-learned-rearrangement-systemic.mjs` | The weekly review's systemic hold against every other handler that starts next week from the evidence | **QE-R7A1-02** (part A); QE-R7A1-08 (for the SSCTR) |
| `qe-a1-P10-confirmed-load-rederived.mjs` | Confirmed first loads (SSCTR D45) against a later re-plan the same evening | **QE-R7A1-02** (part B) |
| `qe-a1-P06-same-day-adaptations.mjs` | C1 same-day eligibility in the adaptation handlers | **QE-R7A1-04** |
| `qe-a1-P07-merge-known-definitions.mjs` | The QE-R7A-05 merge with present but unreadable loads; three agreeing reports in all six orders | **QE-R7A1-05**. The three-report merge is order-independent |
| `qe-a1-P08-d56-real-legacy-rows.mjs` | D56 on rows actually written by the R6-closure runtime, not stripped copies. 24 timelines, switched to FREEZE-A1 at week 8 or 9 | 300 legacy rows read; **0** cap rises or ends after a trimmed week; **0** capped jumps of more than one set |
| `qe-a1-P09-random-sequences-oracles.mjs` | A seeded random search: 2–4 changes per sequence, on the same day, later days and across the week boundary with the weekly review in between. Five programs, including PM runs, three strength days and a race close to the taper. Checked by 7 invariant oracles, not by order equivalence | see "Random search" below |
| `qe-a1-P11-mutation-spotcheck.mjs` | 4 of the author's mutants, plus 3 of my own | 4 of 4 match the recorded results |
| `qe-a1-P12-window-event-refusal.mjs` | A refusal found by P09 | QE-R7A1-07 |
| `qe-a1-scratch-*.mjs` | Exploration only (schedules where a strength move is admissible, quality counts per week, field-level diffs) | no claim rests on them alone |

Other bounds:
- I used the DEV_TEST_ONLY `devAuthority()`, synthetic data and no network.
- I did **not** run `npm run verify`, `npm run simulate`, `npm run demonstrations:r6`, any other `verify-r*.mjs`, `regress-r7a*.mjs`, `freeze-r7a1.mjs`, `prepare-r7a1.mjs`, the author's `mutation-check-r7a1.mjs` or the SSCTR instrument. I read their recorded outputs instead.

To reproduce a result, run `node audits/domain-coaching-r7a1-2026-10-27/reviews/<script>` from the repository root.

## The seven blockers on FREEZE-A1

| Id | Status | Evidence |
|---|---|---|
| QE-R7A-01 (HIGH) | **OPEN** | The return re-base now survives an equipment change, permanent or windowed, in both orders (rerun P1 S1: `returnStrengthErasedByEquipmentChange false`, same in either order). But the blocker's mechanism, as the task contract states it ("the start of next week a decision of this week already set is re-derived"), is still live through the evidence branch of C3. The weekly review's hold for a systemic signal, and its adoption of confirmed loads, are re-derived differently by an equipment, schedule or goal change the same evening: **QE-R7A1-02** |
| QE-R7A-02 | **OPEN** | The short return now eases the same-day quality run at 05:00 and at 21:00 (rerun P2: `sameRunsEitherClock true`). Its mechanism was same-day eligibility, the selection `date > asOfLocal` instead of `aheadOf`. That selection is still in the fatigue, unavailable-day and event-conflict selectors and in the move-slot filter, while C1 says `aheadOf` is "one definition for every handler": **QE-R7A1-04** |
| QE-R7A-03 (HIGH) | **CLOSED** | Return, then postponement: one race in either order (rerun P1 S2). Both event-date orders equal their later statement alone (author grids). Oracle O6 of the random search (at most one live race, on the current event date): 0 violations in 5,000 sequences. The `duplicateRace` guard survives its mutant (documented); it was never needed in any path I generated |
| QE-R7A-05 | **OPEN** | The author's case (a null load) is fixed: P4 4a `mergedEqualsUnion true`, P5 5a loads equal the field union. But `filled` and the readers use two definitions of a known value. A load that is present but unreadable (no unit, `LBS`, `pounds`) in the chosen entry still makes the other report's 80 kg unknown, in either arrival order: **QE-R7A1-05** |
| QE-R7A-12 | **CLOSED** (engineering) | HOLD keeps the repetition target at 5 for a lighter shortfall at 77.5 kg and 75 kg; ADVANCE at a lighter load takes the logged repetitions (rerun P3). The dose reading is the SSCTR's |
| QE-R7A-19 (HIGH) | **CLOSED** | Fatigue or an unavailable day, then an event change: the same either order, adaptation kept (rerun P1 S3). Recorded adaptations are re-applied by `composeWeeks`. My mutant "a move is never re-applied" is caught (P11). One new defect sits *inside* this mechanism, in how a move is re-applied: **QE-R7A1-01**, reported separately. The adaptation is no longer lost; it is rebuilt with history content |
| D56 / D53 (engineering side) | **CLOSED** (engineering) | The author's D56 grid passes (verifier). My P08 adds rows actually written by the R6 closure: 0 cap rises or ends after a trimmed week, 0 capped jumps above the largest executed count plus one. The formulation is the SSCTR's |

## New findings

### QE-R7A1-01 (HIGH, material): a moved session keeps the equipment of its history after an equipment change

**Class:** C4 × C2, an adaptation re-applied under a newer context.

**Mechanism.**
- `reapply` for `MISSED_SESSION` (`r6-composition.mjs:111–117`) re-runs `missedMove`.
- `moveCandidates` (`:54`) then places `clone(target)` into the slot. That is the missed session's *history* prescription.
- Nothing composes that content for the slot's date under the context in force there (`templatesForDate`, substitution).
- `equipmentChange` (`r6-adaptation.mjs:536–543`) compares the old and composed rows. In the window case it finds no swap and answers KEEP, "Planned exercises already fit the available equipment".
- C7 has no equipment check, so nothing fails closed.
- The same placement happens in the missed-session handler itself when the slot lies in a window stated earlier (P01b). That path predates R7-A.1: it is identical on FREEZE-2.

**Reproduction** (P01). Program: strength on [0, 2, 5], runs on [1, 3, 6]; weeks 0–2 executed. Week 3:
- Tuesday 07:00, `MISSED_SESSION w3-str-d0`: MOVE to `w3-str-d2`.
- Tuesday 07:30, `EQUIPMENT_CHANGE` to `['DUMBBELLS','BENCH']`.

| Case | Wednesday (`w3-str-d2`) |
|---|---|
| Miss, then permanent change | `back-squat 2x5 KNOWN 82.5` (BARBELL, RACK), status MODIFY/SUBSTITUTE |
| Miss, then window Mon–Sun | the same row; the change answers KEEP/KEEP |
| Equipment change Monday 06:00, then the miss | `goblet-squat 2x5 ESTABLISH` |
| FREEZE-2, miss then permanent change | the move is lost (the QE-R7A-19 class) |
| P01b (A1 and FREEZE-2): a window over Wed–Sun stated on Sunday, then the Monday miss | the barbell squat moves into the window |

The two orders give different validity on A1. The order-equivalence grids cannot see the same-evening variant, because both orders move the same history content there.

The random search (P09, seed 1013, O2) found the window variant on its own: a window stated Monday 23:30, then Tuesday 12:30 `MISSED_SESSION w3-str-d0`, puts `back-squat` into the window.

**Required change.**
1. Compose a moved session's content for the slot's date under the context in force there: the same substitution an equipment change applies. If the content is not available on that date, the move is not offered, or it is consumed.
2. Add per-date equipment availability to C7, so that a residual fails closed.
3. Tests: move × equipment change in both orders (permanent and window); a move into a window stated before.

### QE-R7A1-02 (HIGH, material): the start of next week set by the weekly review is re-derived without the review's own inputs

**Class:** C3 "one rule for every handler". It is the QE-R7A-01 mechanism, through the evidence branch.

**Mechanism.** `weeklyReview` gates with two inputs that `evidenceStart` and `rebuild` do not read:
- **The systemic flag.** `weeklyReview` (`r6-adaptation.mjs:339`) gates with `systemic`: a `SYSTEMIC_SIGNAL` recorded on the week, or `ev.systemicConvergence`. `evidenceStart` (`:237–240`) feeds `evidenceRule`, which `composeWeeks` uses for equipment and return changes once the week is complete. `rebuild` (`:444`) serves schedule, goal and learned-arrangement changes. Both compute `weeklyGates(...)` without `systemic`.
- **The load confirmations.** `evidenceStart` reads `loggedLoads(ctx.ev, ctx.confirmations)`: the *current* review's load confirmations. Confirmations are not stored, so a later review that carries none reads none.

**Reproduction A, systemic** (P04). Program: runs on [1, 4, 6], strength on [0, 2]; weeks 0–2 executed. Week 3:
1. Sunday 07:00, `SYSTEMIC_FATIGUE`. Nothing is left to reduce, so it is recorded as `SYSTEMIC_SIGNAL`.
2. Sunday 21:00, the weekly review with every report: all gates HOLD; week 4 at 3 sets.
3. Sunday 22:00, one more change:

| Change at 22:00 | Week 4 |
|---|---|
| `SCHEDULE_CHANGE {runDays:[1,3,6]}` or `GOAL_CHANGE {strength:HYPERTROPHY}` | all 10 gates ADVANCE; 7 exercises go from 3 to 4 sets; run state advanced |
| `EQUIPMENT_CHANGE ['DUMBBELLS','BENCH']` (permanent, or a window over next Monday) | 6 exercises go from 3 to 4 sets |

Related paths:
- With convergence (three adverse reports), schedule and goal changes advance QUALITY and LONG; only the `qualityDone` state differs.
- The learned-rearrangement branch of the weekly review itself (P05) advances EASY and LONG where the plain review holds them. In that profile no row differs, because the time cap binds.

**Reproduction B, confirmations** (P10). Program: runs on [1, 3, 6], strength on [2, 5].
1. The week-0 weekly review confirms 20 kg for `db-calf-raise`, `db-rdl` and `db-split-squat`: all three are KNOWN 20.
2. An equipment, schedule or goal change at 22:00 puts the three back to `FROM_LOG` with `pendingLoad 20`. Week 1 then asks to choose the load by effort again (`2x7 FROM_LOG` instead of `2x6 KNOWN 20`).

This path also exists on FREEZE-2.

**Required change.**
1. After the weekly review of a complete week, a later change of that week keeps the start the review set, as it keeps a return's re-base. Alternatively, it re-derives that start with exactly the review's inputs: the systemic determination and the confirmations, recorded on the week.
2. Use one function for `weeklyReview`, `evidenceStart` and `rebuild`.
3. Tests: the held start and the confirmed loads survive each of an equipment, schedule and goal change after the review.

### QE-R7A1-03 (MEDIUM, material): a return correction made the next week does not supersede the earlier return

**Class:** C5 supersession across the week boundary. It is the author's own path "16-day return corrected to 5 days".

**Mechanism.** `returnAfterPause` (`r6-adaptation.mjs:614`) reads `startBeforeReturn` only when `pauseWeek === w`. Otherwise it reads `program.stateTrace[pauseWeek]`, which the earlier return overwrote with its re-entry start.

**Reproduction** (P02). Program: runs on [1, 3, 6], strength on [2, 5]; weeks 0–4 executed; week 5 Monday to Thursday not trained.
1. Friday 21:00: a 16-day return, ending Thursday. Re-entry starts Saturday.
2. Sunday 21:00: the weekly review, with Saturday and Sunday reported.
3. The correction: the break was 4 days, Monday to Thursday of week 5.

| Correction made | Week 6 |
|---|---|
| Sunday 22:00 | the pre-break doses: `back-squat 4x5 @85`, runs 48/45/75 |
| Monday 07:00 | re-entry at step 0: `1x5 @RIR4`, runs 15/15/20. Every return step is reset to 0, including `db-rdl` and `db-split-squat`, which the review had moved to step 1 |

On FREEZE-2 both clocks give the re-entry. A1 fixed one side of the boundary.

**Required change.**
1. Read `program.weeks[pauseWeek].startBeforeReturn ?? program.stateTrace[pauseWeek]`.
2. State C5 for the break's own week, not "this week".
3. Test: the same correction, ten hours apart across Sunday and Monday, gives the same plan.

### QE-R7A1-04 (MEDIUM, material): same-day eligibility is not one definition

**Class:** C1, the QE-R7A-02 class in other handlers.

**Mechanism.** Four selectors still add `s.date > asOfLocal` to `aheadOf`:
- `fatigueSessions` (`r6-composition.mjs:64`);
- `unavailableSessions` (`:72`);
- `conflictSessions` (`:96`);
- the move-slot filter (`:52`).

So a session that `aheadOf` calls ahead on the review's own day is never adapted. The return path (`aheadAt`, `waitSessions`) and every re-plan use `aheadOf` alone. C1 says: "*Ahead* has one definition for every handler (`aheadOf`)".

**Reproduction** (P06, A1 and FREEZE-2). Program: runs on [1, 3, 6], strength on [0, 3]; weeks 0–2 executed. Week 3, Monday 06:00:

| Report at 06:00 | Monday PM strength (`2x5 @82.5`) |
|---|---|
| `UNAVAILABLE_DAY` for that Monday | stays prescribed; the answer is KEEP, "No planned session falls on the unavailable date" |
| `SYSTEMIC_FATIGUE` | unchanged |
| `EVENT_WEEK_CONFLICT` for that Monday (race program, week 12) | stays |
| A return, at the same clock | re-planned to `1x5 @RIR4` |

My mutant that makes fatigue use `aheadOf` alone survives every test (P11). No test pins same-day adaptation either way.

**Required change.**
1. Use `aheadOf` alone in these selectors, with each adaptation's own clock when it is re-applied.
2. Tests: a same-day PM session adapted by fatigue, by "unavailable today" and by an event conflict today; an AM session after noon not adapted.

### QE-R7A1-05 (MEDIUM, material): the merge still loses a known load when the chosen entry's load is unreadable

**Class:** I4, the QE-R7A-05 claim in the same function.

**Mechanism.** The ranking (`exerciseFacts` and `kgOf`) and every reader (`strengthLogs`) count a load with a missing or unreadable unit as unknown. But `filled` (`r6-provenance.mjs:41`) only fills a value that is `null` or `undefined`. When such an entry is chosen on a tie (equal known counts, then the better declared source), the other report's readable load is never taken.

**Reproduction** (P07). One week-0 strength session, two reports of it:
- manual: `back-squat` 3×(80 kg, 5 reps, no RIR);
- device (`WEARABLE_FULL`, same session): 3×(5 reps, RIR 3), with a load of `{value:80}` (no unit), `176 'LBS'` or `176 'pounds'`.

| Reports | Squat load read |
|---|---|
| Manual alone | 80 kg |
| Both, in either order | none: `unitUnknown`, and the athlete is asked `LOGGED_UNIT_OR_CONVENTION_UNKNOWN` |
| Both, device load null (the author's case) | 80 kg, `loadTick 1` |

FREEZE-2 is the same.

**Required change.**
1. Use one definition of a known value in the merge: fill from the other report's same set when the chosen set's load is unreadable, with the same predicate the ranking uses. Keep the raw value as provenance.
2. Tests: loads without a unit and with an unknown unit, in both orders.

### Not blocking (LOW)

- **QE-R7A1-06: C3 completeness against C1.** C3 treats a week as complete from `ev.pending` (`date > asOfLocal`). So a re-plan on Sunday 07:00 gates the still-ahead Sunday long run as NOT_REPORTED (LONG HOLD). The evening review corrects it. No row effect was observed (`qe-a1-scratch-sundaymorning.mjs`).
- **QE-R7A1-07: a false UNSUPPORTED** (P12, P09 O9; the QE-R7A-04 class; it predates R7-A.1).
  - Setup: a bodyweight-only window over Wednesday–Thursday, and the race moved so that Thursday falls in the race window.
  - The window's hinge substitute, `glute-bridge`, is a catalogue ACCESSORY in a race-window session.
  - C7 refuses the event change in both orders. This is fail-closed: no wrong plan is emitted, but the athlete cannot move the race.
- **QE-R7A1-08: a dose effect for the SSCTR, not ruled here** (P04 part (a)).
  - A systemic fatigue report on Thursday reduces the remaining quality, and next week advances: 7 exercises go from 3 to 4 sets.
  - The same report on Sunday morning has nothing left to reduce; it is recorded as SYSTEMIC_SIGNAL, and next week holds.
  - Whether a reducing report should also hold next week is a sporting reading.
- **Observation (C5 as written).** "A permanent change ends every earlier window" also deletes a window stated earlier for *future* dates (`r6-adaptation.mjs:531` drops windows with `from >=` the change). This is product semantics; it is not counted.

## The random search (P09)

**Setup.** 2 seeds × 2,500 sequences of 2–4 changes. Five programs: plain; three strength days (moves possible); a race at week 6; a race at week 10 (close to the taper); PM runs with AM strength. Every passed session is reported as prescribed, except a missed target, a declared break and an unavailable date.

**Oracles:**
- O1 history immutability, across steps;
- O2 equipment, by the latest statement covering the date, at that statement's own C1 clock;
- O3 no session on an unavailable or conflict date;
- O4 no hard run after a systemic fatigue report that week;
- O6 one race, on the current event date;
- O7 a return's wait;
- O9 refusals.

**Results** (`qe-a1-P09.seed7.final.out.json`, `qe-a1-P09.seed1013.final.out.json`). 5,000 sequences and 14,995 steps, with 0 errors:

| Oracle | Violations |
|---|---|
| O1 history | 0 |
| O2 equipment | **1**: QE-R7A1-01 found independently. A window (dumbbells and bench) was stated on Monday 23:30; Tuesday 12:30 `MISSED_SESSION w3-str-d0` then put the barbell squat on Wednesday, inside the window |
| O3 unavailable date | 0 |
| O4 systemic fatigue | 0 |
| O6 event | 0 |
| O7 return wait | 0 |
| O9 refusals | 6, all one class: QE-R7A1-07 |

**Note on the oracle.** The first run of O2 counted the statement's own day too strictly: it flagged a PM session the statement re-planned that evening (`qe-a1-P09.seed*.out.json`, 11 per seed, all of that artifact). I corrected O2 to use the statement's own C1 clock before counting.

**What the search did not reach.** It drives no adverse reports, confirmations or return corrections, so QE-R7A1-02, 03 and 05 came only from the targeted probes.

## Is the evidence adequate?

- **The grids.** The author's two handler grids test one relation: pairs on the same clock in both orders. It is a real structural test, and it caught 84 + 384 defects on FREEZE-2. But it cannot see four kinds of defect:
  - a defect that hits both orders equally (QE-R7A1-01 on the same evening);
  - a defect that needs a later step after the review (QE-R7A1-02);
  - a defect that needs the week boundary (QE-R7A1-03);
  - a defect that needs a same-day adaptation compared against another handler (QE-R7A1-04).

  It also uses one schedule shape per program, with no strength move possible. The `adaptationsHold` checks are per pair; there is no context-validity oracle.
- **The tests.** 495/495 pass; I checked this through the verifier and in a copy. The new tests are metamorphic and property tests in the right direction, but none covers:
  - context validity of moved content;
  - a change after the weekly review;
  - a cross-week correction;
  - unreadable loads in a merge.
- **Mutation.** 72/73 is recorded. My spot-check (P11) reproduces 4 of those results exactly: the survivor and three that are caught. The mutation runs only revert the author's own fixes, so by construction they cannot measure behaviour nobody fixed. My mutant for QE-R7A1-04 survives.
- **Regression and the SSCTR instrument.** I did not re-run them (prohibited). The verifier re-checks the recorded outputs and requires every difference to be named. I found nothing that contradicts a named difference.
- **Representation-only claims.** These are consistent with P03: no row or state differed across time zones in 2,844 comparisons.

## Integrity recommendations (engineering scope)

| Verdict | Recommendation | Why |
|---|---|---|
| WEEK_COMPOSITION_INTEGRITY | NOT_READY | QE-R7A1-01 (a move re-applied under a newer context), QE-R7A1-02 (two evidence rules), QE-R7A1-04 (two same-day definitions) |
| STATE_PRESERVATION_INTEGRITY | NOT_READY | QE-R7A1-02 (the review's held start and confirmed loads re-derived away), QE-R7A1-03 (a superseded return stays in force) |
| EVENT_SUPERSESSION_INTEGRITY | READY (engineering) | QE-R7A-03 closed; O6 found 0 violations in 5,000 sequences; both event-date orders equal their later statement alone. QE-R7A1-07 is a fail-closed refusal, not a supersession defect |
| EXERCISE_MERGE_INTEGRITY | NOT_READY | QE-R7A1-05 |
| RETURN_RECOVERY_CEILING_INTEGRITY | READY (engineering side; the SSCTR rules the formulation) | D56 closed for every representation, including real legacy rows (P08). The return-correction defect is counted under state preservation |

## Verdict and binding

**NOT_READY.** This verdict is bound to R7A1-FREEZE-A1, source digest `2de8681f13e5cb499df6a5a3dc443d52877850528ceb298b598d03de6ec2141a`, policy `18ec48f3…`.

What blocks:
- QE-R7A-01, QE-R7A-02 and QE-R7A-05 are open;
- five material equivalents were found (QE-R7A1-01…05), two of them HIGH.

This is the first review of the single cycle. For the narrow re-check of FREEZE-A2:
- each material finding needs its required change and a test that fails on FREEZE-A1;
- I will re-run P01, P01b, P02, P04, P06, P07, P10 and P09 (both seeds) against FREEZE-A2;
- I will re-run nothing else unless the delta touches it.

Machine-readable version: `quality-engineering-r7a1-review.json`.
