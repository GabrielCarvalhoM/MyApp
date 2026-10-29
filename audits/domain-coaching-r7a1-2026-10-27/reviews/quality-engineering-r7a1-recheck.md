# R7-A.1 narrow engineering re-check (R7A1-QE-r2)

**R7A1_ENGINEERING_REVIEW = NOT_READY on R7A1-FREEZE-A2.** This is the single narrow re-check. There is no further cycle (FOUNDER_REQUEST §11).

- **My five findings are closed by their mechanism.** QE-R7A1-01 to 05 each have a test that fails on FREEZE-A1 and passes on FREEZE-A2. Every probe I named gives the expected result on the live tree.
- **One new HIGH, in the mechanism of the return correction.** QE-R7A1-09: a return report for a second, separate break is treated as a correction of the earlier break. The athlete's re-entry after a 16-day break is erased, and the plan goes back to pre-break doses. Within the same week this is already on FREEZE-A1, and my first review missed it. Across the week boundary it is new on FREEZE-A2, through the QE-R7A1-03 fix, which applied my required change as I had written it. FREEZE-2 has neither variant.
- **One MEDIUM from the same root cause.** QE-R7A1-10: a second short break reuses the first one's easy slot, so its own first quality run stays hard (D58 identity).
- **One LOW, not material.** QE-R7A1-11: state only.
- **Blockers:** 7 of the 8 rows are closed. QE-R7A-01 stays open through QE-R7A1-09.

**Who did this.** I am the Quality & Reliability Engineer (constitution 1.3.0), a fresh instance (claude-opus-5-5). I did not write this runtime, I changed nothing under `CoachingCore/`, and I judge no sporting dose.

## Freeze checked

R7A1-FREEZE-A2 (`CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A2.json`).

| Check | Start | End |
|---|---|---|
| Source digest, recomputed (`hash()` over the `src/*.mjs` SHA-256 map, as in `freeze-r7a1.mjs`) | `71edc245cfe06a376732ec8054f2e09f277066f2ee4004f34827b2c90a1c4024` | `71edc245cfe06a376732ec8054f2e09f277066f2ee4004f34827b2c90a1c4024` |
| Policy hash | `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c` | same |
| Frozen files that differ from their recorded SHA-256 | 0 of 78 | 0 of 78 |
| `node CoachingCore/scripts/verify-r7a1.mjs` (no `--write`) | 14/17. `freeze-current` passes. Three checks fail: `mutation-check` (the author's final A2 output was not yet written), `independent-reviews` and `deliverables` | 15/17. `freeze-current` and `mutation-check` pass. Only `independent-reviews` and `deliverables` fail |

Files: `qe-a2-digest.mjs`, `qe-a2-digest.{start,end}.out.json`, `qe-a2-verify.{start,end}.out.json`.

**The delta, checked independently:**
- The A1 and A2 manifests differ only in the four `src` files the brief names and the added `test/r7a1-correction.test.mjs`.
- I reverse-applied `dossier/RUNTIME_DELTA_R7A1_A1_TO_A2.diff` to a copy of the live tree. The result matches FREEZE-A1 byte for byte (77/77 hashes).
- I used that copy as my FREEZE-A1 reference. My probes on it reproduce my first review's outputs byte for byte.

## What I ran

All scripts are in `reviews/`. They print only, and they load the live runtime, or with `QE_LIVE_ROOT` a scratch copy, read-only. The `qe-a2-P0x`/`P10` scripts are my first-review probes, unchanged except that they import `qe-a2-lib.mjs`. That library adds only the configurable root.

| Script | Result on FREEZE-A2 |
|---|---|
| P01, P01b, P02, P04, P05, P06, P07, P10 | All as expected (below). Each output is byte-identical to the author's `probes/a1-judge-rerun/*.A2` file |
| P09, seeds 7 and 1013, N=2,500 each | 5,000 sequences, 14,943 steps, 0 errors. O1, O2, O3, O4, O6 and O7: 0 violations. O9: 6 refusals, all QE-R7A1-07 (`phaseDose:glute-bridge:accessory`) |
| P08 (the delta touches the cap end) | 300 legacy rows: 0 cap rises or ends after a trimmed week, 0 capped jumps |
| P03 (the delta touches same-day selectors and adaptation clocks) | 2,844 comparisons, 0 differences |
| `node --test` | 505/505 |
| `test/r7a1-correction.test.mjs` on my FREEZE-A1 copy | 0/10. Each test fails for the right reason (I checked the assertion messages) |
| **P13** (new): a second, separate break after a re-entry | **QE-R7A1-09** |
| **P14** (new): a second, separate short break after an easy slot | **QE-R7A1-10** |
| **P15** (new): a recorded no-op equipment statement (the A2 instantiation-only KEEP), 27 cases | No row or adaptation changes. One state-only difference: QE-R7A1-11 |
| **P16** (new): a KEEP weekly review, then a change the same evening | QE-R7A1-11. Pre-existing on FREEZE-2 and FREEZE-A1 |
| Mutants in scratch copies | Caught: the two run-1 survivors ("final validation ignores equipment", "return cap ends after a week that was not whole"), and the FREEZE-A1 reading of the return start (caught by the C5 test). Survives: the own-clock guard in `reapply` (an observation, below) |

**Not run:** `npm run verify`, `simulate` and `demonstrations:r6`; any other `verify-r*.mjs`; `regress-r7a*.mjs`, `freeze-r7a1.mjs`, `prepare-r7a1.mjs` and `queue-r7a1.mjs`; `probes/mutation-check-r7a1.mjs`; the SSCTR instrument.

**Bounds:** DEV_TEST_ONLY authority, synthetic data, no network, no commit. Copies and mutants live only in the session scratchpad.

## My five findings

| Id | Status | Mechanism now, and my evidence |
|---|---|---|
| QE-R7A1-01 (HIGH) | **CLOSED** | One per-date equipment reading (`sk.equipmentForDate`, `r6-program.mjs:831`). It is used by the templates, by `moveCandidates` `fits` (`r6-composition.mjs:57`) and by C7 (`:813`). Every move path goes through `fits`: missed session, unavailable day and re-application. A statement with nothing to substitute is recorded (`r6-adaptation.mjs:554`). P01: no barbell row after the change in any of the four cases. P01b: the move into the window is refused. P09 O2: 0 violations. My copy of the C7 survivor is now caught. That guard is pinned by a direct test only, because no composition path writes such a row. |
| QE-R7A1-02 (HIGH) | **CLOSED** | `systemicOf`, `confirmationsOf` and `reviewGates` (`r6-adaptation.mjs:239-241`) are read by the weekly review, `evidenceStart`, `rebuild` and the load questions. Confirmations are recorded on the week (`:324`). P04: no dose above the held start on all 8 paths. P05: LONG and EASY hold. P10: the confirmed loads stay KNOWN after an equipment add or swap, a schedule change and a goal change. |
| QE-R7A1-03 (MEDIUM) | **CLOSED** (its claim) | `prior = weeks[pauseWeek].startBeforeReturn ?? stateTrace[pauseWeek]` (`:626`). P02: the same plan at Sunday 22:00 and at Monday 07:00. My mutant with the FREEZE-A1 reading is caught by the C5 test. **The mechanism over-reaches: QE-R7A1-09.** |
| QE-R7A1-04 (MEDIUM) | **CLOSED** | Every selector uses `env.ahead` alone. An adaptation records the sessions of its day already past (`adaptation().past`) and is re-applied with `aheadAt`. P06: unavailable today, fatigue and an event conflict today all reach the PM session still ahead. |
| QE-R7A1-05 (MEDIUM) | **CLOSED** | In the merge, known means readable (`kgOf` for a load, `Number.isFinite` for a count). An unreadable value is kept under `unreadable` (`r6-provenance.mjs:43`). P07: 80 kg in both orders for a missing unit, `LBS` and `pounds`, with no load question and `loadTick 1`. Three reports give the same result in all six orders. |

**Observations (not findings):**
- **QE-R7A1-01, order of a miss and an equipment change.**
  - Miss, then equipment: the recorded move is dropped, and the target stays missed, without debt.
  - Equipment, then miss: the substituted content moves.
  - My first review allowed this option ("the move is not offered, or it is consumed"), and C4 *A2* states it.
- **QE-R7A1-04, the own-clock guard.**
  - `reapply` adds the guard `ahead: s => env.ahead(s) && own(s)`. My mutant that removes it survives the four R7-A/R7-A.1 test files.
  - It only matters when a re-plan's clock is earlier than the adaptation's, so it is a test gap with no forward-time effect.

## The seven blockers

| Id | Status | Evidence |
|---|---|---|
| QE-R7A-01 (HIGH) | **OPEN** | Its path (an equipment change) is closed, and so is its C3 residual (QE-R7A1-02). But its expectation is still violated: "a localized change in the current week does not destroy valid future state". A second return in the same week, for a separate break, re-plans this week and next week from the state before the first break. That erases the first return's re-entry (P13 S, on FREEZE-A1 and FREEZE-A2). It is QE-R7A1-09, by the standard my first review applied. |
| QE-R7A-02 | **CLOSED** | Same-day eligibility is one test in every selector (QE-R7A1-04). The D58 identity defect (QE-R7A1-10) is a different mechanism. |
| QE-R7A-03 (HIGH) | **CLOSED** | Unchanged. P09 O6: 0 in 5,000. |
| QE-R7A-05 | **CLOSED** | QE-R7A1-05. |
| QE-R7A-12 | **CLOSED** | Not touched by the delta. 505/505. Its mutation reverts are caught in run 1. |
| QE-R7A-19 (HIGH) | **CLOSED** | Adaptations are re-applied by the composition, and a move that no longer fits is dropped without debt. P15: no adaptation lost (27 cases). P09: O1, O3, O4 and O7 have 0 violations. |
| D56 / D53 (engineering side) | **CLOSED** | P08: 0/0 on real R6-closure rows. The D57 whole-week mutant is caught. The SSCTR rules the formulation and D57. |

## New findings

### QE-R7A1-09 (HIGH, material): a separate, later break is read as a correction of the earlier one, and the re-entry is erased

**Class:** C5 supersession without break identity. This is the Founder's §12 question: another handler (a second return) destroys state that the contract protects (the first return's re-entry).

**Mechanism.**
- `returnAfterPause` reads `program.weeks[pauseWeek].startBeforeReturn` (`r6-adaptation.mjs:626`) for any return whose break begins in a week where an earlier return stored it. An earlier MODERATE or LONG return that re-planned its own week stores it (`:651`).
- Nothing checks that the newer report is about the same break: not its dates against the earlier interruption, nor its start against the earlier return's report day.
- So a break that began after re-entry started gets the state from before the first break. `returnStep`, the run `RETURN` mode and its `returnTo` are gone.
- A SHORT break then "resumes last completed doses" from the pre-break doses.

**Origin.**
- Same-week variant: FREEZE-A1's C5 (`pauseWeek === w`).
- Cross-week variant: FREEZE-A2's QE-R7A1-03 fix.
- FREEZE-2 reads `stateTrace[pauseWeek]`, the re-entry start, and has neither.

**Reproduction** (`qe-a2-P13-second-break-after-reentry.mjs`). Program: runs on [1, 3, 6], strength on [2, 5]; weeks 0–2 executed, weeks 3–4 not trained.
1. Week 5, Monday 06:00: a 16-day return. Re-entry starts this week: `back-squat 1x5 @RIR4 ESTABLISH`, runs 15/15/20.
2. Tuesday to Thursday are executed and reviewed. Week 6 is then at return step 1: `back-squat 2x5`, run mode RETURN, long run 45.

The second break comes after that:

| Case | Second break, reported | FREEZE-A2 | FREEZE-A1 | FREEZE-2, and my A2 mutant with the A1 reading |
|---|---|---|---|---|
| X | Fri w5 – Tue w6 (5 days); reported Wed w6, 06:00 | Week 6: `back-squat 3x5 @RIR3 KNOWN 82.5`, long run 70. Week 7 starts at KNOWN 85, `returnStep null`; run EASY, easy 45 / long 75 | Re-entry kept: `1x5 @RIR4`, long 20; week 7 at `returnStep 1`, run RETURN | Re-entry kept |
| X2 | Fri–Sun w5; reported Mon w6, 06:00 | As X | Re-entry kept | Re-entry kept |
| S | Wed–Thu w5 (2 days); reported Fri w5, 06:00. No strength re-entry session done yet | Saturday `3x5 @RIR3 KNOWN 22`, long run 70; week 6 at pre-break doses | **As FREEZE-A2** | Re-entry kept |

Every input is a valid synthetic review through `evaluateProgram`, and every proposal passes C7. My first review's P02 and the author's tests check only a correction of the same break (same end date). Nothing in the grids, the probes or the tests has two separate breaks.

**Required change.**
1. Record the break a return reports (its interruption, or at least its report day) with `startBeforeReturn`.
2. Read `startBeforeReturn` only for a newer report of that break: one whose break begins before the earlier report day, or that overlaps its interruption.
3. Otherwise, start from the stored start of the break's week, which is the re-entry the athlete was doing.
4. Tests: two separate breaks, in the same week and across the week boundary. The QE-R7A1-03 and C4/C6 correction tests must keep passing.

### QE-R7A1-10 (MEDIUM, material): a second short break reuses the first one's easy slot

**Class:** C4/C5 (D58) slot identity. Same root cause as QE-R7A1-09.

**Mechanism.**
- `shortReturnEasy` (`r6-composition.mjs:114`) and the `composeWeeks` carry (`:203`) take as the slot any row that carries the easy-slot explanation.
- So a second, separate short break adopts an earlier short return's eased slot, which is already history. Nothing is carried, and its own first quality slot runs as planned.

**Reproduction** (`qe-a2-P14-second-short-break-easy-slot.mjs`). Default program; weeks 0–2 executed.
1. Week 3, Monday 06:00: a 6-day short return eases Tuesday's quality run. Tuesday is run and reported.
2. A second break, Wednesday to Friday, is reported on Saturday 06:00. Then the weekly review.

| Runtime | Week 4 Tuesday |
|---|---|
| FREEZE-A2, both breaks | `QUALITY THRESHOLD 41`. The only easy slot is the first break's |
| FREEZE-A2, the second break alone | `EASY 41` |
| FREEZE-A1 and FREEZE-2 | No easy slot in either case (the D58 defect) |

**Required change.** Tie the eased slot to its return, for example by the return's event id. Test: two separate short breaks in one week. The dose reading stays with the SSCTR.

### QE-R7A1-11 (LOW, not material): a KEEP weekly review and a later change disagree on next week's state

**Mechanism.**
- The weekly review answers KEEP without a proposal when its evidence start changes no row (`keepOk` compares sessions only). So the earlier projected `stateTrace[w+1]` stands.
- A later change of the complete week re-derives the evidence start instead:
  - a schedule change or an equipment window (FREEZE-2 and FREEZE-A1);
  - on FREEZE-A2, also a no-op equipment statement, which is now recorded.
- The difference is the state `reps` of `db-calf-raise` and `db-split-squat` (7 vs 6).

**Evidence.** P15 (afterReview) and P16 (two profiles, weeks 2–4). No row differs over weeks 3–8 or after two further reviews (`qe-a2-scratch-keepreview-rows.mjs`). Not required for READY.

## Residuals stated in the brief

- **LOW items, unchanged:** QE-R7A1-06, 07 and 08. All six P09 refusals on FREEZE-A2 are QE-R7A1-07.
- **Order with a short return:** consistent with C4. The author's D58 combinations cover one return with each same-week adaptation, not two returns (QE-R7A1-10).
- **Context records:** P03 found 0 differences.

## Is the evidence adequate?

- **The new tests** pin each fix and fail on FREEZE-A1 for the right reasons (my copy). No test exercises two separate breaks.
- **The grids** compare the two orders of a pair of changes. With two returns there is only one order, so the meaning of the second return is invisible to them.
- **The mutation check.** The author's final A2 run (`probes/mutation-check-r7a1.A2.out.json`) was written before my end check:
  - 88 of 89 single-fix reverts are caught, and all 89 apply.
  - 0 survivors are undocumented. The one documented survivor is the C7 duplicate-race guard, as on FREEZE-A1.
  - The R7-A survivor QE-R7A-22 is caught.

  Independently, I confirmed that run 1's two undocumented survivors are now caught. A single-fix revert cannot measure a condition that nobody wrote (the same-break test).
- **The author's reports.** Every claim of the brief I could check matches what I ran: the 505 tests, the 10 failing on A1, P01–P10, P08, P09 and P03.

## Integrity recommendations (engineering scope)

| Verdict | Recommendation | Why |
|---|---|---|
| WEEK_COMPOSITION_INTEGRITY | READY (engineering) | QE-R7A1-01, 02 and 04 are closed. P09 found 0 violations, and P15 found that a no-op statement changes no row. QE-R7A1-11 is LOW |
| STATE_PRESERVATION_INTEGRITY | **NOT_READY** | QE-R7A1-09, with QE-R7A1-10 from the same root cause |
| EVENT_SUPERSESSION_INTEGRITY | READY (engineering) | Unchanged; O6 0 in 5,000 |
| EXERCISE_MERGE_INTEGRITY | READY | QE-R7A1-05 closed |
| RETURN_RECOVERY_CEILING_INTEGRITY | **NOT_READY** (engineering side) | QE-R7A1-09 bypasses the return steps after a 16-day break. D56 holds (P08). D57 and D58 are the SSCTR's |

## Verdict, binding and what NOT_READY records

**NOT_READY.** This verdict is bound to R7A1-FREEZE-A2, source digest `71edc245cfe06a376732ec8054f2e09f277066f2ee4004f34827b2c90a1c4024`, policy `18ec48f3…`.

- **Blocker:** QE-R7A1-09 (HIGH), with QE-R7A1-10 (MEDIUM). QE-R7A-01 stays open through them.
- **Root cause:** return supersession has no break identity. "A newer report of a break" is implemented two ways, and neither checks the break:
  - for the start: any return whose break begins in a week an earlier return re-planned (`startBeforeReturn`);
  - for the easy slot: any slot already eased.
- **Why it did not close:**
  - The same-week variant came with FREEZE-A1, and neither my first review, the grids nor the tests had two separate breaks.
  - The cross-week variant came with the A2 fix of QE-R7A1-03, which I specified without a same-break condition.
  - The single correction cycle is spent.
- **Smallest next mission:**
  - **Fix:** one bounded change in `returnAfterPause` and in `shortReturnEasy`/`composeWeeks`. Record the break a return reports. Use `startBeforeReturn` and the earlier eased slot only for a newer report of that same break. Otherwise, start from the stored re-entry and give the new short break its own slot.
  - **Tests:** two separate breaks, in the same week and across the boundary; two separate short breaks in one week; the existing correction tests.
  - **Re-check:** a narrow one that re-runs P13, P14, P02 and P09.

Machine-readable version: `quality-engineering-r7a1-recheck.json`.
