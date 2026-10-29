# SSCTR re-check of the R7-A second cycle

**Revision R7A-SSCTR-r2, 2026-10-27.** This is the single narrow re-check the Founder's cycle bound allows. Target: runtime R7A-FREEZE-2, at the unchanged policy R6-POLICY-5 (`18ec48f3…`). The previous revision is R7A-SSCTR-r1, on R7A-FREEZE-1. Structured record: `ssctr-r7a-recheck.json`. Queue proposal: `ssctr-r7a-recheck-queue-items.json`. Both are in this folder.

## At a glance

**Verdict: `runtimeAccepted` = false.**

- **D55 is RESOLVED.**
- **A new blocker, D56, comes from the second cycle itself.** It is new, narrow and runtime-only, but no further cycle exists. Under the bound, R7-A closes NOT_READY with D56 named.

**D56 in one line.** A week in which every executed exposure of an exercise was trimmed to the time budget now counts as a whole executed week, so it releases the regain cap.
- When more time is available, the count returns two sets at once.
- Example: back squat 2x5 at re-establishment, then 2x5 (trimmed from 3), then 4x5.
- FREEZE-1 gave 2, 2, 3, 4.

| Item | Ruling |
|---|---|
| S1 / D55 | Resolved |
| S2 HOLD and REGRESS repeat the repetition target | Holds |
| S3 a return re-plans the same day; a session waits | Holds, with one non-blocking gap (R27, short returns) |
| S4 an event change that reaches this week | Holds |
| S5 moves keep the dose their new date allows | Holds |
| S6 time fit, fatigue reduction, return ceiling | Partly holds. R20 ceiling: holds. Fatigue reduction: holds. "A time fit is not a reduction" for the regain and return caps: does not hold (**D56**) |
| S7 entry week kept through a rebuild | Holds |

**Does any of S2–S7 need its own record?** None is a new rule that needs a policy declaration. They are compositions and readings of declared rules. Because I approve them and they change what is prescribed, they share one new record, R7A-SSCTR-CYCLE2-COMPOSITIONS, with its own queue item.

**My four FREEZE-1 decisions on FREEZE-2.** All four are re-bound to FREEZE-2.

| Record | Carries? |
|---|---|
| R7A-SSCTR-REESTABLISH-PHASE | Unchanged |
| R7A-SSCTR-ITEMS-5-8 | Unchanged; its D55 condition is now met |
| R7A-SSCTR-SPLIT-WEEK | With one amendment: condition 4 adopts my R20 and aligns the cap rise with D56 |
| R7A-SSCTR-REGAIN-BASE | The decision is unchanged, but FREEZE-2 does not meet its conditions 5 and 6 in time-trimmed weeks; D56 is recorded as not met |

**The complete blocking list at R7A-FREEZE-2:**

| Item | New | Narrow | Runtime-only | Boundaries | Required change |
|---|---|---|---|---|---|
| D56 | yes (introduced by cycle 2, S6 / QE-R7A-14) | yes | yes | PLANNED-PROGRESSION 14, ROTATION 10, LOAD-ESTABLISHMENT 15 (return cap: same predicate) | The regain cap, and the return cap at and after the end of the return steps, rise or end only after a week in which an executed exposure executed its whole count **after** its time fit. The return ceiling already uses this test (R20) |

Nothing else blocks from the SSCTR side. One pre-existing state-composition defect outside the delta (O-1) is reported for the Chief and the engineering judge to weigh.

## Reviewer, authority and target

**Reviewer.** A fresh SSCTR-1.0.0 instance, working under the constitution and the project skill.
- My instructions are the Chief's dispatch prompt for this re-check.
- No Agent tool was used.
- The dispatch mechanism is as the caller reports it.
- I did not author the policy, the runtime or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This is not human, empirical or clinical validation, and it carries no runtime sovereignty.

**Target: R7A-FREEZE-2, verified at the start and at the end** (`ssctr-r7a-recheck-verify.mjs`).
- Freeze file `15be6a40…`.
- All 75 bound files match.
- Source digest recomputed with `value.mjs`: `f56ae974762523b1efacd9ad7a9046cc7f6b7d33e42a7c2c955e758ef0f7821c`.
- Policy canonical hash recomputed: `18ec48f3…`; policy file `a75be1aa…`.

**Delta from FREEZE-1.** Four source files changed:
- `r6-program.mjs` (`963130bb…`);
- `r6-adaptation.mjs` (`2f7c339e…`);
- `r6-provenance.mjs`;
- `r6-intake.mjs`.

One test file was added: `test/r7a-cycle2.test.mjs`.

**Comparator.** I rebuilt FREEZE-1 by reverse-applying `dossier/RUNTIME_DELTA_R7A_CYCLE2.diff` to a scratch copy of FREEZE-2. All 74 files of the copy equal the FREEZE-1 manifest, so the diff is exactly the delta between the two freezes. That copy is my FREEZE-1 runtime in every comparison below.

## What I ran and read

| Check | Result |
|---|---|
| `node --test` in CoachingCore (Node 24.19.0) | 476/476 pass |
| My round-12 instrument, byte copy, on FREEZE-2 (`ssctr-r7a-recheck-instrument.mjs`) | All 43 sections equal the author's CYCLE2 output, apart from file paths. Against FREEZE-1, only Y, Y2, AF, AG, AL and COMPARE differ, all from same-day return sessions (S3). AI, AJ, AH and AK are unchanged |
| My phase grid and regain grid from R7A-SSCTR-r1, on FREEZE-2 (`ssctr-r7a-recheck-grid.mjs`) | Identical to FREEZE-1 apart from labels: 400 timelines and 3,520 re-establishment rows; 2,448 and 1,224 re-establishments |
| Re-check probe on FREEZE-2, the FREEZE-1 rebuild and the pre-R7A runtime (`ssctr-r7a-recheck-probe.mjs`) | Sections D55, S2–S7, ITEM8 and D56, below |
| Literature (`ssctr-r7a-recheck-literature.mjs`) | PubMed worked (HTTP 200). One directed search on short-term training cessation, 50 hits, four abstracts read. No new full text |

**Authority used.** DEV_TEST_ONLY `devAuthority()` of each runtime, bound to the unchanged hash. The data are synthetic and offline.

**Not run or read.**
- `npm run verify`, `npm run simulate`, `npm run demonstrations:r6`, any `scripts/verify-r*.mjs` and the mutation checks.
- The engineering judge's re-check and `qe-*` files, to keep the two judgments independent.
- `REGRESSION_R7A.json`, read only as the author's claims.

## D55: resolved

Section D55 extends my RS2 scenario to week s2+4 and adds two variants:
- return step 2 one week later, so it is not a block end;
- a permanent move to a gym without a barbell.

It covers EVERY_2_WEEKS and FIXED rotation, for HYPERTROPHY, STRENGTH and RUNNING_SUPPORT.

| Runtime | New exercises in step 2 | Block set after step 2 | Rise of more than one set in a week | More than one set above the largest executed count |
|---|---|---|---|---|
| FREEZE-2 | 12 | 0 | 0 | 0 |
| FREEZE-1 | 12 | 6 | 6 | 6 |
| pre-R7A | 12 | 3 | 3 | 3 |

**Example on FREEZE-2, goblet squat:**
- HYPERTROPHY: 2x8 then 3x8;
- STRENGTH: 2x5 then 3x5;
- RUNNING_SUPPORT: 1x8 then 2x8, or 2x8 then 2x8.

FREEZE-1 went to 4x8, 4x5 and 3x8. The author's RS2 claim is reproduced.

## S2: HOLD and REGRESS repeat the repetition target — holds

This is the literal reading of the declared gates: HOLD repeats the dose; REGRESS lowers the load.

**Eight shortfall timelines** (STRENGTH and HYPERTROPHY; one short set, all short, last set short, all short with low reserve; repeated in weeks 0–3):
- FREEZE-2 keeps 3x5 and steps the load 80, 77.5, 75 kg on REGRESS.
- FREEZE-1 walked the target down to 3x1 or 3x2, below the 4–6 range.

**MR2 "reps below target":** FREEZE-2 gives 3x5, 3x5, 2x5 @77.5, 4x5 @77.5. FREEZE-1 gave 3x5, 3x3, 2x1, 4x1.

**Newly established loads** keep their logged repetitions, as on FREEZE-1. Split week, second session only: 2x8 at 18 kg, regain cap 2.

**Residuals (R25).** These are pre-existing and identical on both freezes, so not a cycle-2 change:
- a log at a lower load with fewer repetitions (75 kg × 3 for a 3x5 target) becomes 3x3 @75;
- a re-establishment logged two repetitions short at the earlier load becomes 2x6, for an 8–12 range.

## S3: a return re-plans what is still ahead the same day — holds, one non-blocking gap

**What holds.**
- A return reported at 07:00 re-plans that day's unreported sessions:
  - the threshold run (41 min) becomes the return's easy 15 min;
  - strength becomes 1 set @RIR4 per exercise.
- Sessions reported before the review keep their prescription.
- Instrument AG shows a same-day back squat after a 14-day break: FREEZE-1 kept 4x10 @RIR3 KNOWN 82.5; FREEZE-2 gives the effort-guided 1x11 @RIR4, at no more than 80 kg.
- When re-entry starts next week and one session is still ahead, it waits (rest by design). FREEZE-1 kept it at its pre-break dose: a 65–70 minute long run the morning after a 17-day break.

Waiting is the composition that neither keeps the pre-break dose nor starts re-entry against the declared start rule. At most one session waits.

**Gap R27 (new, narrow, runtime-only; non-blocking).**
- Case: a short return (at most 10 days) reported on the morning of a quality day.
- The same-day quality session is re-planned to the last executed dose (threshold 41 min, 4x5) but does not run easy.
- No later quality slot is made easy either.
- Cause: the short-return step ("first quality slot after a short break runs easy") still selects sessions dated after the review.
- So my R6-NONCLINICAL-RETURN condition 7 ("the first quality slot runs easy") is not met for that case.
- FREEZE-1 was worse here: it kept the progressed 48 min, 5x5.

**Why R27 does not block.**
- Nothing is prescribed above the last executed dose.
- After 10 days without running, VO2max was unchanged in distance runners (R7A-S06). After 14 days it was about 4% lower (R7A-S04).
- Counterevidence: two weeks of detraining reduced VO2max and strength (R7A-S05).
- All four new sources are abstracts. They weigh R27 only and support no rule.

**R26 (non-blocking).** For a short return, the one waiting session could take the resumed dose instead of resting.

## S4: an event change that reaches this week — holds

S4 is a composition of `proximitySemantics`: days count to the race, whatever the calendar week.

**Race moved, on Monday of week 6, to Monday of week 7.** The remaining days equal a program generated with the new date:
- taper strength: 1 set @RIR3;
- race-window strength: main lifts only, 1 set @RIR4, 4 days before the race;
- runs: easy 25, race touch 25 min 3x2, easy 25.

Against my own reading of the event bounds there are 0 violations and one race-window session. FREEZE-1 left 15 rows at the BUILD dose and a threshold run 4 days before the race.

**Race postponed in race week.**
- On FREEZE-2 the old race is gone and the week is a taper equal to the twin: strength 1 set @RIR3, easy 40, 10K-specific 23 min, long 45.
- FREEZE-1 kept the old race.

## S5: moves keep the dose their new date allows — holds

S5 is a composition of LE-15 (each session judged on its own date) and D52.
- A missed key session whose exercises would cross the 28-day window by moving (28 days to 30) gets no move candidate. It is skipped without debt.
- A control at 26–28 days still moves, and its rows keep their kinds.

R24 is closed. The author recorded why the rows are not re-derived: the move would replace the planned session by a re-establishment.

## S6: time fit, fatigue reduction and the return ceiling — partly holds

**Return ceiling (my R20): holds.** The ceiling is the largest whole count executed outside a phase reduction, counted after the fit. With both split-week rows executed, the ceiling is now 3; on FREEZE-1 it was 2.

**Fatigue reduction is a reduction: holds.** FR2 is identical on both freezes: barbell RDL 2x5 @RIR4 in the fatigue week, regain cap 3 kept, then 3x5.

**"A time fit is not a reduction" for the regain and return caps: does not hold.** This is D56, below.

## D56 (new, blocking): a time-trimmed week releases the regain cap

**Mechanism.**
- QE-R7A-14 made the review read a time-trimmed row by its count before the trim (`exposure.phasedSets`), as the projection already did.
- That removes two readings of one week, but in the less conservative direction.
- A week whose only executed exposures were trimmed to 2 of 3 sets now counts as whole, so the regain cap rises or ends.

**Minimal timeline.** STRENGTH; one 25-minute strength day; known squat, RDL and bench; strength missed in weeks 2–6; re-established in week 7; budget raised to 75 minutes after week 8.

| Week | FREEZE-2 back squat (and bench) | FREEZE-1 |
|---|---|---|
| 7 (consolidation) | 2x5 re-establishment | 2x5 re-establishment |
| 8 | 2x5, trimmed from 3; regain cap 3, then released | 2x5, trimmed from 3; cap 3 kept |
| 9 | **4x5** | 3x5 |
| 10 | 4x5 | 4x5 |

**Grid: 72 tight-budget timelines per runtime** (one or two strength days of 25–35 minutes; three goals; known or no exercises; a five-week gap).

| Measure | FREEZE-2 | FREEZE-1 |
|---|---|---|
| Cap rises or ends after a week whose every executed exposure was trimmed (constant budget) | 64 | 0 |
| Same, with the budget raised (later weeks are no longer trimmed) | 48 | 0 |
| Later counts more than one set above the largest count executed since the re-establishment, with the budget raised | 16 | 0 |
| Same, with a constant budget | 0 | 0 |

With a constant budget the trim keeps the rows at 2 sets on both freezes. On FREEZE-2 the cap is gone anyway.

**What it contradicts.**
- `strength.setsAfterReestablishment`: "comes back one set per executed week, never at once".
- PLANNED-PROGRESSION condition 14 and ROTATION condition 10: "never two at once".
- LOAD-ESTABLISHMENT condition 15.
- My REGAIN-BASE condition 5: the cap rises only after a week whose executed sets equal the count before the phase reduction.
- My REGAIN-BASE condition 6: never more than one set above the largest count executed since the re-establishment.

**Sporting weight.** It is the same class and size as D53 and D55, which blocked: a two-set rise within two weeks of a re-establishment after more than four weeks without the exercise. It needs a binding time budget and, later, more time. Both are ordinary events.

**Required change (runtime-only).**
- The regain cap, and the return cap at and after the end of the return steps, rise or end only after a week in which an executed exposure executed its count before the phase reduction **after** its time fit.
- That is the same whole-count set the return ceiling already uses (R20).
- A time fit stays a non-reduction for the phase reading and for the ceiling.
- Regression tests: my D56 timelines and the S6 trimmed-regain grid with a raised budget.

**Where my grid did not reach.** The return cap shares the predicate. My 24 tight-budget returns had no case where every exposure was trimmed while the return cap was active.

## S7: entry week kept through a rebuild — holds

S7 is a composition of `strengthEntryWeek`. After a same-morning permanent move to a machines-only gym in a return-entry week:
- in every budget (30, 45 and 60 minutes) the new lifts get 1x8 @RIR4 RETURN_ENTRY;
- the week after, they get RETURN_STEP 2x8 @RIR3.

FREEZE-1 at 30 minutes gave 2x8 @RIR3 FIRST_ESTABLISH.

**Item 8 is unchanged:** no move into taper days, for the 10K and the half marathon.

## Findings outside the delta

**O-1 / R28 (new; pre-existing on FREEZE-2, FREEZE-1 and the pre-R7A runtime).** An equipment change reported after the weekly review of the same week re-projects that week from its start. The reviewed strength transition is lost.

**Evidence.** A 16-day return; the entry week is reviewed with the back squat entry logged at 20 kg; then a barbell-free window from return step 2 is reported after that review.
- The squat state at step 2 is KNOWN 82.5 kg, the load before the break.
- After the window the squat returns as 4x5 @RIR3 KNOWN 82.5.
- Reported before the review instead, the state is KNOWN 20.
- With a permanent change in the same order, a never-performed substitute is credited with an entry exposure. Its doses run 1, 2, 3 sets, so there is no escalation.

**What it contradicts.** NONCLINICAL-RETURN condition 9 and `strengthKnownLoadAfterReturnLog` ("the prior KNOWN load is prescribed only after a post-interruption logged entry supports it"), in that arrival order.

**Classification.** It is not a blocker of this re-check: it is outside the cycle-2 delta and present in the R6 closure runtime. It is, however, a state-composition defect with a dose effect.
- Whether it is a HIGH structural failure of R7-A (STATE_COMPOSITION_STABILITY) is for the engineering judge and the Chief.
- It must be fixed before any use beyond the offline reference.

**R23 (retained, sharpened).** The exercise a substitute replaced resumes at its full count when the window ends.
- This holds in all 12 window configurations on all three runtimes: from a 1-set entry to 3 or 4 sets.
- STRENGTH case: 1x5 @RIR4, then 4x5 @RIR3.
- The same class appears in my return grid with a raised budget: accessories the time fit dropped during the return come back at 3 sets (20 cases, equal on both freezes).
- It remains non-blocking under the bound, as in R7A-SSCTR-r1. It is a reading of D51, routed with R17(b) and R21 to the next policy revision.

## The four FREEZE-1 decisions on FREEZE-2

| Record (revision R7A-SSCTR-r2) | Status | Basis on FREEZE-2 |
|---|---|---|
| R7A-SSCTR-REGAIN-BASE | Decision unchanged; binding has D56 open | The regain grid and instrument AI, AJ and AH equal FREEZE-1; conditions 5 and 6 are not met in time-trimmed weeks |
| R7A-SSCTR-REESTABLISH-PHASE | Carries unchanged | Phase grid and AK equal FREEZE-1; S4 rows are within the event bounds |
| R7A-SSCTR-SPLIT-WEEK | Carries with an amendment | Condition 4 now reads the week's whole counts after the fit, for both the ceiling (R20, met) and the cap rise (D56, not met) |
| R7A-SSCTR-ITEMS-5-8 | Carries unchanged | D55 met; items 6, 7 and 8 unchanged in behaviour; item 8 strengthened by S5 |

## Round-12 conditions at the unchanged hash

All ten boundaries stay APPROVE_WITH_CONDITIONS, SUPPORTED_WITH_LIMITS.

| Boundary | Status at R7A-FREEZE-2 |
|---|---|
| R6-COLD-START | Met |
| R6-LOAD-ESTABLISHMENT | Met at default budgets; **condition 15 not met in time-trimmed weeks (D56)** |
| R6-PLANNED-PROGRESSION | D55 resolved; S2 now keeps the target; **condition 14 not met in time-trimmed weeks (D56)** |
| R6-RUN-QUALITY | Met |
| R6-HYBRID-ARRANGEMENT | Met |
| R6-SUBSTITUTION | Condition 6 met; O-1 routed |
| R6-NONCLINICAL-RETURN | D55 resolved (conditions 9 and 21); S3 and S7 met; condition 7 not met for a short same-day quality slot (R27, non-blocking); condition 9 not met in one arrival order (O-1, pre-existing) |
| R6-EVENT-TRANSITION | Met; strengthened by S4 |
| R6-PARTIAL-NOISY-LEARNING | Met |
| R6-ROTATION | **Condition 10 not met in time-trimmed weeks (D56)** |

The weekly-review contract (R18) stays the last condition of every boundary.

## Non-blocking recommendations

| Id | Kind | Owner | Recommendation |
|---|---|---|---|
| R25 | new; pre-existing behaviour | R7-B, with F-ACCESSORY-REPS; Data for the low-load gap | When a log adopts a new load with repetitions below the goal's range, keep or clamp the target |
| R26 | new | Runtime author with Product Constitution & Governance | In a short return, the one waiting session could take the resumed dose instead of resting |
| R27 | new, narrow, runtime-only | Runtime author, together with D56 | The short-return first quality slot uses the same "still ahead" test |
| R28 (O-1) | new; pre-existing | Engineering, Chief | An equipment change after a weekly review keeps the reviewed transition |
| R23 | retained | Runtime author with Product Constitution & Governance | As above |
| R20 | adopted | — | — |
| R24 | closed | — | — |
| R21, R22, R17, R18, F-ACCESSORY-REPS | retained | as in R7A-SSCTR-r1 | — |

## Records and queue items

There are five records, all revision R7A-SSCTR-r2, all APPROVE_WITH_CONDITIONS, all bound to R7A-FREEZE-2:
- R7A-SSCTR-REGAIN-BASE;
- R7A-SSCTR-REESTABLISH-PHASE;
- R7A-SSCTR-SPLIT-WEEK;
- R7A-SSCTR-ITEMS-5-8;
- R7A-SSCTR-CYCLE2-COMPOSITIONS (new).

In each record, conditions that are not met are marked as such and fall outside the approval until a later freeze meets them.

**Queue proposal R7A-SSCTR-QUEUE-PROPOSAL-r2** holds five items, one per record, each bound to R7A-FREEZE-2:
- HQ-R7A-SSCTR-REGAIN-BASE;
- HQ-R7A-SSCTR-REESTABLISH-PHASE;
- HQ-R7A-SSCTR-SPLIT-WEEK;
- HQ-R7A-SSCTR-ITEMS-5-8;
- HQ-R7A-SSCTR-CYCLE2-COMPOSITIONS.

They supersede the four r1 proposals, which were never integrated. All five are QUEUED_FOR_FUNDED_HUMAN_REVALIDATION.

This is a proposal only: I did not edit the queue file, which holds 127 entries. The Chief integrates it append-only. Funding is NOT_DECLARED.

## Validation

**Gap.** Python and `jsonschema` are not installed, so `validate_records.py` did not run.

**Declared substitute.** `ssctr-r7a-validate.mjs`, unchanged from R7A-SSCTR-r1: Node with ajv 8.20.0 against `decision.schema.json`, and the helper's cross-checks ported.

**Result.** The five records and the five queue items pass: 0 errors.

**Negative control.** A copy with a stale target hash, an altered approval condition and a missing AE answer fails with six errors, so all three defects are caught.

This certifies record consistency only.

## Escalation and routing

**No clinical, Product or Founder escalation.** No envelope magnitude is widened.

**Routing:**
- **Chief:** apply the cycle bound. D56 is the only blocker and no further cycle exists, so R7-A closes NOT_READY with D56 named. Integrate the five queue items. Weigh O-1 for STATE_COMPOSITION_STABILITY.
- **Next authorized mission (runtime author):** fix D56 and R27 with their regression tests. A new freeze then needs a narrow SSCTR delta check of the changed files at `18ec48f3…` before these records bind it.
- **Engineering:** O-1.
- **Runtime author with Product Constitution & Governance, in the next policy revision:** R23, R26, R21 with R17(b), and R22.
- **R7-B:** R25 and F-ACCESSORY-REPS.
- **Engineering with Product/Data:** R18 before any use beyond the offline reference.

## Files

All in `audits/domain-coaching-r7a-2026-10-27/reviews/`.

Outputs:
- `ssctr-r7a-recheck.md` (this file)
- `ssctr-r7a-recheck.json`
- `ssctr-r7a-recheck-queue-items.json`

Instruments and their outputs, with their hashes in the JSON:
- `ssctr-r7a-recheck-verify.mjs` and its `.start.out.json` and `.end.out.json`
- `ssctr-r7a-recheck-probe.mjs` and its `.out.json` and `.log`
- `ssctr-r7a-recheck-grid.mjs` and its `.out.json` and `.log`
- `ssctr-r7a-recheck-instrument.mjs` and its `.out.json` and `.log`
- `ssctr-r7a-recheck-literature.mjs`, `ssctr-r7a-recheck-literature.out.json`, `ssctr-r7a-recheck-abstracts.out.txt`
- `ssctr-r7a-recheck-node-test.out.txt`
- `ssctr-r7a-recheck-validate.out.json`

Nothing was edited under `CoachingCore/` or in the dossier, the earlier reviews or the queue file.
