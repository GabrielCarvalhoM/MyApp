# SSCTR review of C-F01-1 r2, R1 (2026-11-18)

**Decision: ACCEPT_WITH_CONDITIONS.** For SSCTR, C-F01-1 r2 (i) to (iv) is closed on candidate `3f0b04f`. None of the conditions blocks, so SSCTR does not spend the focal correction cycle. Lifting C-F01-1 r2's binding before real-athlete restart also needs Security (SB-1) and QRE. C-F01-2, C-F01-3 and C-F01-4 are carried unchanged.

| # | Item | Disposition | Blocking |
|---|---|---|---|
| 1 | (i): bound, not ASK; 0/0 maps to RESTART | ACCEPTED | no |
| 2 | (ii): the `occurred` predicate; disputed amount = 0 | ACCEPTED, with observation O-1 | no |
| 3 | Dose changes = DECISION §4, no unauthorized sporting change | ACCEPTED, with condition C-R2-1 (one consequence not listed) | no |
| 4 | Pause, recovery, new execution; shorter pause | ACCEPTED | no |
| 5 | (iv) re-pin; the window residual | Re-pin ACCEPTED. The window residual is **kept as a residual, not widened now** (C-R2-2) | no |
| 6 | Calibration not contaminated | CONFIRMED | no |

## 0. Reviewer, target, method

- **Reviewer:** SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), model claude-opus-5-5. This is a fresh instance launched by the Chief.
  - I wrote none of the change, tests or records. The SSCTR instance that set C-F01-1 r2 was a different one.
  - Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only. No human review took place, I made no clinical judgment, and I delegated nothing. I did not read the Security review, so as to judge independently.
- **Literature:** none needed. Every item checks fidelity to decided rules: C-Q08-1 (SSCTR-V1CP-DECISION-r1#Q08), C-Q08-2, the RESTART class (`r6-program.mjs:49`, verified at that line), and the normalizer's quarantine (QRE-R6-14). No new dose, threshold or progression is decided here.
  - WebSearch and WebFetch exist as deferred tools; I did not load them.
  - No evidence status is assigned, because I make no empirical claim.
- **Judged bytes (SHA-256):**

  | File | Commit | SHA-256 |
  |---|---|---|
  | `CoachingCore/src/v1-f08.mjs` | `3f0b04f` | `41cdbb3d85e7efc12197c3b073998dc9fde1f6932b9054f8f3122aec7e5abb55` |
  | `CoachingCore/test/v1core-cf011r2-restart-evidence.test.mjs` | `3f0b04f` | `a74adc52a34aff8eedbb2788b0cfd47ee80d08baf818765dbb1c0fbef42e2bc2` |
  | `DECISION.md` | `7dc0ee5` | `cc58a76a32ec69f6619ae9f2badfc936cbd3203618c1706d49dd50d3cc0c1854` |
  | `CANDIDATE.md` | `7dc0ee5` | `4edc59fffa33ebda6749b5227652e76a2b98ad01cc318bf54cf1802b79a3247e` |
  | `SUCCESSOR_LEDGER.json` | `7dc0ee5` | `3f16168b43217a9025a2ace8042c575853059933cfcbc8aadc3b685f8b59d1ba` |
  | base `v1-f08.mjs`, and the extract | `4b6e1ea` | `a06c580c2d4f9c64287af3105c4cb471913b66cbd38605c0b7d24cc5bdd4d68b` |

- **Commands** (Node v24.19.0, Git Bash):
  - The new test file passes **31/31**.
  - `v1core-c2f01-restart-sizing.test.mjs` on the candidate gives 19 pass and 2 fail. The two failures are exactly the ledgered `:223` and `:255`, and `QRE-F01-04` still passes.
  - `evidence/red-on-4b6e1ea.txt` reads 31 tests, 19 pass, 12 fail.
  - I did not run `verify`, `verify-r*` or the freeze scripts.
- **Probes.** They are read-only and run on both trees. They are in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/bd5bc05f-f34c-4538-bfb8-fc330e278203/scratchpad/ssctr-r2r1-9e4b/`: `dose.mjs`, `floor.mjs`, `calib.mjs`, `strength.mjs` and `shape.mjs`. They call `restartProgram` (the format index, DEV) on the composed athlete `sixteen`, which states 300 min/week and 4 days, with a stated SCHEDULE pause of 1 week.

## 1. Item 1. Bound, not ASK: ACCEPTED

- **The rule wins without asking.** C-Q08-1 already lowers a stated exposure to the record whenever an execution exists, with no question. An ASK that "confirms against the record" could only end in the same bound. The only alternative would let a confirmed self-report exceed the record, and the rule forbids that.
- **The asymmetry is removed.** On the base, an execution 40 days ago gives 0/0 and RESTART, while a "not done" 3 days ago gave EASY_CURRENT at 295 min/week. On the candidate, both give RESTART.
- **Zero is not read as capacity.** The bound is the exposure the record shows in the window. RESTART is the decided return entry, the same one used after a pause of 4 or more weeks (45/60/75/90 min/week for the probe athlete). It is not a fitness estimate:
  - calibration goes to `EFFORT_ONLY` (`MODE_WALK_JOG_RESTART_RETURN`), so no pace is derived from it;
  - the record's prior capacity stays context only.
- **The cost of the choice.** An athlete who trains outside the record is under-dosed. That is a performance cost, not a safety cost.
- **Observation O-2** (Product/UX, not a condition): the athlete should be able to see that the start was lowered to what the record shows, and how to add sessions it lacks. This is the existing explainability obligation.

## 2. Item 2. `occurred`, and amount = 0: ACCEPTED

**The predicate.** `occurred` requires all of the following:
- a row in force, flagged `CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE`;
- two or more parts;
- every voice says the session took place.

This is the narrowest reading of "every report says completed". The test cases bear it out:
- a direct conflict keeps only one voice, so its occurrence is not shown (A12, B5, B7);
- a "not done" voice means the occurrence itself is disputed (B4, C7);
- a dispute over the response only is still a session (B6).

The occurrence is corroborated by the athlete and the device, so it is sufficient for "time since the last session".

**The amount.** 0 minutes and no day, which is the normalizer's quarantine value for a gate. It never exceeds the lowest reported value. In the probe, P4 alone gives RESTART at 45 min in week 0. Counting its lowest value (20 min) instead gives 5 min/week, which is WALK_JOG at 60.

**Observation O-1** (pre-existing, not caused by this change). The cold-start classes are not monotonic in the bounded minutes:
- 0 min/week gives RESTART, 45 min in week 0;
- 25 min/week over 1 day gives EASY_LOW, 15 min in week 0 (`strength.mjs`, `run100_3d`).

So DECISION §2's claim "zero never exceeds the lowest value" holds for the bound, but not always for the plan. Changing this belongs to the RUN_CLASS_THRESHOLDS revision (B0-F05). It is outside this mission.

## 3. Item 3. Dose: ACCEPTED, with C-R2-1

**DECISION §4 is reproduced.** Through `restartProgram`, every case ends in RESTART (45/60/75/90, with both fields bounded) on the candidate:
- A, a run corrected to "not done";
- P4 at 3 days;
- P4 at 20 days alone (pause 2 weeks);
- a direct conflict alone;
- watch against a "not done" correction.

On the base, the same cases gave EASY_CURRENT at 295. Three cases are unchanged on both trees:
- a "not done" older than 28 days alone;
- an empty record;
- executions in force.

**One consequence is not listed in DECISION §4: the shorter pause can lift the C-Q08-2 return floor.**
- **The record:** six executions 12 to 27 days ago, plus P4 at 3 days.
- **Base:** pause 12 days, so the floor applies: RESTART at 45 min in week 0.
- **Candidate:** pause 3 days: EASY_CURRENT at 80/80/80/104.
- **Control:** the same session reported directly at 20 min gives the identical plan and calibration.

This is correct. The athlete ran 3 days ago by every account, so there was no 12-day pause for the floor to protect.

**Nothing else moves.** Progression, thresholds, periodization, calibration rules, Race Forecast, Pace Insights and strength are unchanged:
- the diff is in `restartIntake` only;
- no forecast, pace, calibration, history or strength module reads `recent`.

**C-R2-1** (non-blocking, owner Chief). Record this floor-lift row in the closing record. Whether to pin it in a test is QRE's call.

## 4. Item 4. Pause, recovery, new execution: ACCEPTED

- The pause and the last executed day read `occurred`. The shorter pause is the factual one.
- `trainedAfter` reads `claimsDone`, so any voice in force that says the athlete trained after the declaration triggers the reason question.
- **Sporting view of SB-1.** Erring toward asking costs one question and adds no dose. A declaration should not answer a stop that came after it.
- The `else if(readiness)` change is also correct (D3-D4).
- CLINICAL_HUMAN_REQUIRED and HOLD still answer first (D8).

**Residual R-R2-2** (accepted, no action). A direct conflict alone sets no pause. With no exposure stated, this is the self-report cold start (EASY_UNKNOWN). The behaviour is identical on the base, and it follows "unknown stays unknown".

## 5. Item 5. Re-pin and window residual

**The re-pin is sound.**
- `:223` and `:255` assert the behaviour labelled "open", which is now decided otherwise.
- Their decided-correct parts are kept: (a) in D2, and QRE-F01-04 still passes.
- The successors cover the decided reading.
- `freeze:12` is preservation, and QRE judges it.

**Ruling: do not widen now; keep it as residual C-R2-2.**
- **Why not now.** A lone "not done" older than 28 days shows neither exposure in the window nor prior capacity. Leaving the stated exposure unbounded equals the accepted self-report cold start, so it is no safety regression.
- **The asymmetry is still real and large.** An execution 40 days ago gives RESTART at 45 min in week 0, but a "not done" 40 days ago gives EASY_CURRENT at 295.
- **A related case.** A strength-only record already bounds running to 0/0 on the base. This line extends the same to a strength "not done" in the window.
- **What would settle both.** A defined "period the record covers", per sport. That is a question of measurement semantics (Data). Both gates should then be harmonised on that definition.

## 6. Item 6. Calibration: CONFIRMED

- B3 passes: `factsFromLedger` returns no fact from a conflicted row, against 1 fact for the agreeing control.
- `v1-run-history.mjs` is not in the diff.
- `runCalibration` changes only through the program's class. It equals the in-force control at 20 min, and the disputed amount never reaches it.

## 7. Conditions and residuals

| Id | What | Blocking | Owner | Closes when |
|---|---|---|---|---|
| C-R2-1 | The floor-lift dose row (§3) is recorded in the closing record | no | Chief, with QRE for any test | The row is in the closing record |
| C-R2-2 | Record coverage per sport: a lone "not done" outside the window, and strength-only records bounding running. Harmonise with the execution gate | no; not binding before real-athlete use | Next Core mission, with Data semantics, then SSCTR | Coverage is defined and both gates read it |
| O-1 | Cold-start classes not monotonic in minutes | no | B0-F05 policy revision (SSCTR) | Revision record |
| O-2 | Explaining the bound to the athlete | no | Product/UX | — |
| R-R2-2 | A direct conflict alone sets no pause | accepted | — | — |

**Human queue** (proposed only, not appended). HQ-CORE-F01-SSCTR-B moves from conditional to the decided reading:
- (i) bound, mapped to RESTART;
- (ii) occurrence for the pause, amount 0;
- (iii) a "not done" is not an execution.

It enters as QUEUED_FOR_FUNDED_HUMAN_REVALIDATION.

**Re-review triggers:**
- a change to RUN_CLASS_THRESHOLDS or to the normalizer's conflict kinds;
- C-R2-2 being decided;
- the Security or QRE finding changing `restartIntake`;
- real-athlete data.
