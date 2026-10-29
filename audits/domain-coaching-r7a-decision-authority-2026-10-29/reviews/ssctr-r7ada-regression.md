# SSCTR regression review of R7A-DECISION-AUTHORITY-FREEZE-1

**Revision R7ADA-SSCTR-r1, 2026-10-29.** Gate `R7A_DECISION_AUTHORITY_SCIENTIFIC_REGRESSION`. Regression only (Founder §42; my brief): no general sports research reopened, no correction, no freeze, no R7-B0.

- **Reviewer role:** Sports Science & Concurrent Training Reviewer, regression review. I did not author the policy, the runtime, the decision authority contract or the tests.
- **Bytes judged:** R7A-DECISION-AUTHORITY-FREEZE-1, runtime commit `d4631cd03fb27bbc1857532500748476ab764987`; the handoff commit `5434b3265f5634d1e7c796426cd9d8415b3b1af2` changes no bound byte.
- **Written on** the review branch `review/r7ada-decision-authority-ssctr`, created from `5434b32` at the Founder's request. The baseline branch `claude/trusting-euler-04la8t` is untouched.
- **Outputs, all in this folder:**
  - `ssctr-r7ada-regression.md` (this file);
  - `ssctr-r7ada-regression.json`: the ruling plus 6 decision records, validated;
  - `ssctr-r7ada-regression-queue-items.json`: a proposal of 3 queue items;
  - instruments `ssctr-r7ada-*.mjs` and `ssctr-r7ada-build.py`; outputs in `ssctr-r7ada-runs/`.

## Verdict

```
R7A_DECISION_AUTHORITY_SCIENTIFIC_REGRESSION = NOT_READY
```

The brief's line, with the same meaning: `R7A_DECISION_AUTHORITY_SSCTR_REGRESSION_REVIEW = NOT_READY`.

READY needs F4 closed. F4 is closed on the walk/jog ladder:
- every return cell I built returns at or below the step last run, where the predecessor failed;
- the Founder's essential case is closed: step A tolerated, step B only projected, pause, and the return does not start at B.

F4 is not closed at the ladder's exit to continuous running (**F4-X**). That is the boundary the Founder placed inside F4 (§20 "transition to continuous running"; my brief item 12), and the one the author declared NÃO TESTADO.
- **What happens:** the athlete's last session was walk/jog step 8 (1 × 20 min jog). The evidence released the exit (continuous easy runs), but the athlete never ran it. Then comes a pause, and the return treats continuous running as already tolerated.
- **Origin:** pre-existing, not introduced by this freeze. It is identical on the predecessor and on the accepted STATE-EVIDENCE-FREEZE-1.

Everything else in the finite gate holds: F1, F2, F3, D53, D56, D57, D58, D59, HOLD, MAINTAIN and evidence-based progression.
- If the Chief and the Founder rule the exit boundary outside F4, F4-X is the only reason for NOT_READY.
- I do not declare `R7A_EXIT_READINESS`.

| # | Item | Ruling |
|---|---|---|
| 4 | F1 | **Closed** (preserved) |
| 5 | F2 / HOLD | **Closed** (preserved) |
| 6 | F3 / MAINTAIN | **Closed** (preserved) |
| 7 | F4 | **Not fully closed:** closed on the ladder, open at the exit (F4-X) |
| 8–12 | D53, D56, D57, D58, D59 | **Each valid** (separately below) |
| 13–14 | HOLD, MAINTAIN | **Coherent** |
| 15 | R2 | **ACCEPT_WITH_REASON** |
| 16 | R3 | **ACCEPT_WITH_REASON** (no materially wrong prescription) |
| 17 | R6-H35 | **EXPECTED_CORRECTION** |
| 18 | Walk/jog → continuous | **F4-X** (blocking, pre-existing) |
| 19 | New findings in the gate | F4-X (blocking); NF-R7ADA-2 (non-blocking, backlog) |

## 1. Freeze and digests

| | Value |
|---|---|
| Freeze | R7A-DECISION-AUTHORITY-FREEZE-1, `CoachingCore/r7/decision-authority/RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json`, file sha256 `8d5c7146…` |
| Source digest | `3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244`, recomputed |
| Manifest digest | `a500cdd94b8a4994a718029d4ee6efdc703e4f54de59d0855b5598c0d1afb224`, recomputed |
| Policy | R6-POLICY-5, canonical `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`; file `a75be1aa…` recomputed |
| Runtime commit | `d4631cd03fb27bbc1857532500748476ab764987` |
| Handoff commit | `5434b3265f5634d1e7c796426cd9d8415b3b1af2`: only `CURRENT_MISSION.md`, `MISSION_LEDGER.md`, `REVIEW_HANDOFF.md` |

## 2. Integrity

`REVIEW_INVALID = NO`.

**My own recomputation.** I re-implemented the canonical hash rather than importing it: in Python at the start, in Node after the probes and again after every output was written (`ssctr-r7ada-digest.mjs`; `ssctr-r7ada-runs/digest.mid.out.json`, `digest.end.out.json`).
- 85 of 85 bound files match at `d4631cd`, at `5434b32` and in the worktree.
- 0 unbound `src/` or `test/` files.
- The source and manifest digests above recomputed, and the policy file hash matches.

**The author's chain.** `verify-r7ada.mjs --tests`, read-only, on Node v24.19.0, before my files existed: 14/14, suite 663/663. Re-run at the end without `--tests`: 12/13, the failing check being `reviews-not-dispatched`, as designed once a review file exists.

**Predecessor and control trees:**
- **STATE-MODEL-CONSUMER-FREEZE-1:** rebuilt from `r7/decision-authority-closure-base` (`ffc1136`). It matches its MANIFEST: 84/84 files, `adab3716…`, `4f11f4b4…`, freeze file `5c868775…`. The in-repo byte-exact copy shows 0 drift.
- **STATE-EVIDENCE-FREEZE-1:** used as an origin control, `692483ce…`.

**Across my 81 jobs** (`ssctr-r7ada-runs/RUNS.json`), the live source digest stayed `3a7166b2…` before and after each one. Each scratch tree's digest was recorded too.

**Environment notes:**
- `node_modules` (ajv 8.20.0, from the lockfile) was installed into `CoachingCore/`. It is git-ignored; no tracked byte changed.
- No file outside this folder was written.

## 3. Instruments

| Group | What | Trees |
|---|---|---|
| Kit (43) | My earlier grids and probes, unchanged, from their own folders | Candidate (live tree) |
| Controls (11) | Kit instruments that accept `SSCTR_CC` | Predecessor |
| R7ASC probes (6) | `hold`, `maintain`, `temporal`, `walkjog` (the 12-cell F4 probe), `walkjog-trace`, `easyreturn` | Candidate, predecessor |
| New (5) | `walkjog-matrix` (99 returns), `continuous` (the item-12 boundary, 34 cells), `progression` (30 decisions), `returnwalks`, `h25run` | Candidate, predecessor, STATE-EVIDENCE |
| Tests | `SSCTR F4` ×5, `P6`, `P7`, `HOLD (Founder 1.3)`, `MAINTAIN (Founder §23)` from `test/r7ada-decision-authority.test.mjs` | Candidate runtime, predecessor runtime |
| Comparison | `ssctr-r7ada-compare.mjs`: my kit against the author's kit-final and my R7ASC runs | — |

**Kit results:**
- 43/43 kit outputs reproduce the author's `probes/kit-final` (labels and clocks aside).
- 11/11 controls reproduce my R7ASC predecessor runs.
- 38 kit outputs are identical to the predecessor. 5 differ: `changes`, `holdout-detail`, `r12-instrument`, `regression`, `x-trace-sd`. These are exactly the five the author named.
- `regression` exits with the R6-H35 runner error, as in the author's run.

**Test results:**
- On the predecessor runtime, the 5 F4 cells, P6 and P7 fail; HOLD and MAINTAIN pass.
- On the candidate, all 9 pass.

Test counts are auxiliary evidence. The rulings rest on the probes.

## 4. F1: closed (preserved)

| User check | Evidence |
|---|---|
| Temporal evidence correct | `temporal` (return reported Thursday 07:00, Friday strength still planned): Friday's exposures enter history only from their execution; strength rows identical to the predecessor. History's run return step now waits for the week's runs: RETURN step 0 at Thursday 20:00, Friday 23:00 and Saturday 12:00, step 1 from Sunday 22:00. The predecessor credited step 1 from Thursday evening, with Sunday's long run still ahead (P5) |
| Future sessions earn no credit | Same probe, all four cells |
| Restoration skips no step | Restoration grid B = 0, C = 0 (864 timelines; U = 237, the uncovered R23 class, unchanged); `temporal` restoration jumps 0 in all cells |
| Accessories keep their protection | Caps grid B = 0, 0 covered jumps, 0 unexplained; extension 0/0/0; `x-items` identical |
| Dose does not jump early | `trace-b`, `trace-b2` identical (1 → 2 → 3); no strength dose rose against the predecessor in my holdout-detail run (73 = 73 rise lines against the accepted freeze, same set) |

## 5. F2 (HOLD): closed (preserved)

My HOLD probe ran 240 HOLD gates on four goals and five paths. It is identical on both trees:

| Check | Count |
|---|---|
| Load raised | 0 |
| Repetitions raised | 0 |
| Sets raised | 0 |
| Row outside the goal range | 0 |
| Load tick gained | 0 |
| Progression with no new evidence | 0 |

**The Founder's example.** STRENGTH (4–6, LOAD); the current line is 82.5 × 5 (4 sets). The athlete executes 82.5 × 3 at the prescribed reserve; the gate is HOLD.
- The next row is 4 × 5 at 82.5. Load, repetitions and sets are unchanged.
- The tick stays 1, with `stepEarned: false`.
- The projection after the review is 82.5 × 5.
- With the next week unreported, the row is still 82.5 × 5.

**No new "reps ≤ executed" policy.** The 5 repeats the valid current line (above the executed 3), as approved.

**Projected progress is not carried.** On the R42 paths a row at a load only the projection held repeats that row and gains no tick.

## 6. F3 (MAINTAIN): closed (preserved)

My MAINTAIN probe is identical on both trees.
- **Setup:** 70 × 10 executed, the projection at 70 × 12, then a change to MAINTAIN (8–8, RIR 3).
- **Result:** the back squat is 70 × 8 every week (3 × 8 in development, 2 × 8 in consolidation).
- **Counts:** of 393 known-dose rows, 0 are above 8, 0 below 8, 0 at RIR below 3, and 0 above the last executed load.
- **R6-H25:** `trace-h25` is identical.

The 3 sets against `maxSets` 2 are O-1 (item 15).

## 7. F4: not fully closed

**Closed on the ladder:**

| Probe | Candidate | Predecessor | STATE-EVIDENCE |
|---|---|---|---|
| My 12-cell R7ASC walk/jog probe | 0 / 12 above the recipe | 10 / 12 | 0 / 12 (its own record) |
| My 99-return matrix | 0 / 99 | 29 / 99 | 4 / 99 |

The matrix covers:
- first pause: cross-week, same-week or moderate;
- held week: consolidation or development, with ADVANCE, HOLD (one session missed) or nothing;
- second pause: SHORT, MODERATE or LONG;
- repeated (third) pauses;
- the essential case: step B released but never run, held empty or never reported, then SHORT, MODERATE or LONG.

**Three checks:** the entry; the re-entry week against the recipe; the week after it against recipe + 1.

**Breakdown on the predecessor (29 / 99):**

| Dimension | Cells above the recipe |
|---|---|
| Cross-week first pause | 10 / 18 |
| Same-week first pause | 10 / 18 |
| Moderate first pause | 5 / 18 |
| Essential case (held empty) | 2 / 3 |
| Essential case (never reported) | 2 / 3 |

On the candidate every cell passes; it returns at the step last run. So F4 fails on the predecessor and passes on the candidate, as Founder §21 requires.

**The trace** (consolidation, no walk/jog session, SHORT) prescribes exactly what my accepted freeze prescribed:
- second entry at walk step 2;
- weeks 6–7 at steps 2 and 3, against 3 and 4 on the predecessor.

The author's F4 tests, P6 and P7 fail on the predecessor runtime and pass here.

**Open at the ladder's exit: F4-X.** See item 18.

## 8–12. D53, D56, D57, D58, D59: each valid

| Item | Instrument | Candidate | Against the predecessor |
|---|---|---|---|
| **D53** | Restoration grid; `r12-instrument`; `temporal` | B = 0, C = 0 of 864 timelines; restoration jumps 0. In `r12-instrument`, `V_D47reviews` now equals its own round-10/11 record (it differed on the predecessor); its other sections are unchanged, apart from a machine path | Identical, except `r12-instrument`, which moves toward the approved record |
| **D56** | Restoration grid A, A2; `changes` | 0 cap rises or ends after a non-whole week (of 4,181 cap weeks); 0 caps held after a whole week. In `changes` the regain caps hold one week longer (2 × 6 where the predecessor gave 3 × 6): the conservative side of D56 | Identical, except `changes` (more conservative) |
| **D57** | Caps grid; extension | B = 0, covered jumps 0, unexplained 0; extension 0 / 0 / 0 | Identical |
| **D58** | `short`; `d58` | 0 / 315 defects after the return and after the review | Identical |
| **D59** | `firstweek`; `x-firstweek` (8 shards); `f-sameday`; `x-sameday` | E = O = B = 0 for NONE (90 cases), FAMILIAR (108), KNOWN (108); extended grid identical (1,377 cases) | Identical. `x-trace-sd` differs only in a `regainCap` marker in one state start; its rows are identical |

## 13. HOLD: coherent

HOLD repeats the current valid line inside the range and grants no progression credit (item 5). Nothing in this freeze changes it.
- The gate resolution change (C3, most restrictive first) only adds HOLDs that a later-read gate used to overwrite.
- The 240 HOLD gates are identical on both trees.

## 14. MAINTAIN: coherent

See item 6. A goal change resolves under the context of the week it enters (B1). The Founder's example holds on both trees.

## 15. R2, a mid-week return holds its first week: ACCEPT_WITH_REASON

**The behavior** (my `temporal` probe on this freeze):
- **Break and report:** a 15-day break, reported Thursday 07:00; Thursday's easy 15 and Sunday's long 20 are executed.
- **Prescriptions:** week 7 repeats RETURN step 0 (easy 15, 15, long 20); week 8 is step 1 (easy 30, 30, long 45).
- **History:** credits step 1 from Sunday 22:00 (C5).
- **Prior executed doses:** easy 45, long 70.

**Why I accept it:**
- It is a direct consequence of approved E7 plus fail-closed C3: rows planned before the return day hold the EASY gate.
- The approved MODERATE recipe gives conditional steps to the prior executed dose. A return week with only two of its sessions after the return is a thin basis for doubling the session doses.
- The cost is bounded: one more week at the entry dose. Nothing executed is lost from history, and step 1 follows one executed week later.
- This is not material under-dosing after an 11–28-day break (R6-S19: fitness declines with cessation; R6-S21: steps follow executed work).

**Conditions:**
- at most one additional entry week on this ground;
- history keeps crediting what was executed.

An exception for rows inside the declared pause would be new policy, a one-condition change in `weeklyGates`. Safety does not require it.

## 16. R3, plan against history after a return: ACCEPT_WITH_REASON

**The behavior** (kit `changes`, A_E6, SHORT second break, every reduction variant):
- after the return the bench stays at 18 kg: the rest of the return week (3 × 6), a regain-capped week (2 × 6) and a full week (3 × 6);
- 20 kg comes in week 9 (predecessor week 10).

**Against the five checks:**

| Check | Reading |
|---|---|
| Coherence of the next prescription | Each row is coherent with what was executed |
| Factual tolerated dose | No row exceeds a dose the athlete executed at the full count |
| Progression | The 2 kg step comes after executed exposures at 18 kg, including a full week (R6-S01, R6-S11) |
| Restoration | Regain caps hold one week longer (D56, conservative); the back squat comes back 2 → 3 sets where the predecessor gave 4, against a ceiling of 3 |
| Ceilings | Respected |

The divergence between the readings produces no materially wrong prescription.

## 17. R6-H35: EXPECTED_CORRECTION

**The case:** weeks 0–3 are never reported, so QUALITY is not unlocked. The corpus's week-5 quality fact then matches no session.

**The approved rule:** quality and strides unlock on executed established easy weeks (R6 RQ-5). Founder decision 1.2 forbids releasing QUALITY without sufficient execution.

**Control:** with the same intake and steps but weeks 0–3 executed and reviewed (my holdout-detail full-record variant), the case runs without error. Its 6 programs are identical to the accepted freeze's and to the predecessor's.

**Reading:** the runner error is the corpus's expectation, not a runtime defect.

**Backlog:** re-express R6-H35 with its early weeks reported, so it keeps exercising athlete learning. Do not restore the predecessor behavior.

## 18. Walk/jog → continuous running: F4-X

My `continuous` probe uses two athletes. Both run walk/jog on Monday, Wednesday and Friday, with walks on Tuesday and Saturday.

| Athlete | Ladder | Exit week |
|---|---|---|
| TOP5 | A non-novice starting at step 5 (SSCTR D42) | A CONSOLIDATION week |
| FULL | The fixture novice from step 0 | A DEVELOPMENT week |

In both, the last ladder step is 8 (1 × 20 min jog, 60 min of jogging a week). The exit is continuous easy runs: 3 × 25 min plus 2 walks.

| Case (pause from Monday of the exit week unless noted) | Candidate | Predecessor | STATE-EVIDENCE |
|---|---|---|---|
| Exit **released and never run** (step-8 week executed, reviewed or complete and unreviewed), SHORT | **3 × 25 min continuous** (last run step 8; longest continuous run 20 min) | Same | Same |
| Same, MODERATE | **RETURN on all five chosen days:** 5 × 15, then 5 × 20 min (75, then 100 min a week, against at most 3 sessions and 60 min executed) | Same | Same |
| Same, LONG (TOP5) | RESTART 15-min continuous runs (the walk/jog LONG recipe restarts at step 0) | Same | Same |
| Exit **only projected** (step-8 week not executed), SHORT / MODERATE / LONG | Step 7 / 6 / 0: correct | 8 / 7 / 0 | 8 / 7 / 0 |
| Step-8 week with one session missed (HOLD) | Step 8 / 7 / 0: correct | Same | Same |
| Pause from **Saturday of the last ladder week**, after the third step-8 session | Step 8: correct | Same | Same |
| One continuous run executed before the pause (P7) | Exit dose: correct | Same | Same |

**Rule violated.** The approved R6-SSCTR-NONCLINICAL-RETURN conditions (r12):
- SHORT: "resume the last executed doses … the next step waits for executed sessions";
- MODERATE: "conditional steps to the prior executed dose".

This contract's W2: "a step the evidence released but the athlete never ran is not tolerated yet". Founder §19: "return entry ≤ factual tolerated walk/jog step".

**Mechanism.** `historicalRun` caps the walk/jog step only while the state's mode is WALK_JOG. A released exit changes the mode to EASY, so the cap does not apply. A pause one day earlier (Saturday) returns correctly, a pause on Monday does not. That one-day cliff shows an uncovered boundary, not a policy choice.

**Materiality.**
- **SHORT:** one ladder step above the step last run: three 25-minute runs a week when the longest run executed in 30 days is 20 minutes, a single-session increase of about 25%. R6-S02 (a 5,200-runner cohort, observational, distance-based) associates the >10–30% band with higher overuse-injury rates. The policy allows such a step only response-gated and disclosed (`singleRunCeiling`), which a return after a break is not. This is the same class and size as F4's ladder steps, by the same standard my F4 ruling applied.
- **MODERATE:** bypasses the walk/jog recipe (step 7, three days). Each run stays at or below 20 min, so the harm of the frequency increase is uncertain (R6-S02 found no association for weekly ratios).

**Not introduced by this freeze.** The freeze also closes the projected-only variant, which was open on both predecessors.

**Recommendation R46** (not implemented). Extend W2 to the exit: when the run state left WALK_JOG through `walkJogExit` and no continuous run of that state has been executed, a return reads the walk/jog state at the step last run. SHORT then resumes step 8, MODERATE step 7 and LONG step 0.

Re-run after the correction:

| Instrument | Expected |
|---|---|
| `ssctr-r7ada-continuous-probe.mjs` | ladderView 0 in every EXIT_EARNED cell; the P7 and cross-week cells unchanged |
| The walk/jog matrix | 0 / 99 |
| My 12-cell probe | 0 / 12 |
| The kit grids | Unchanged |

## 19. New findings inside the gate

| Id | What | Introduced by this freeze | Materiality | Blocks |
|---|---|---|---|---|
| **F4-X** | Walk/jog exit return (item 18); record `R7ADA-SSCTR-WALKJOG-EXIT-RETURN` | No (predecessor and STATE-EVIDENCE identical) | Material for SHORT; recipe-level for MODERATE and LONG | **Yes** (F4 not fully closed) |
| **NF-R7ADA-2** | RETURN mode turns the plan's walk days into runs. A NOVICE EASY_LOW runner on 3 runs and 2 walks (50 min a week) gets 5 runs / 80 min in both RETURN weeks. Record `R7ADA-SSCTR-RETURN-WALK-DAYS` | No (identical on the predecessor and on STATE-EVIDENCE-FREEZE-1) | Conformance gap ("to the prior executed dose"); harm plausible but uncertain | No: backlog R47 (keep walk days in RETURN weeks) |

**Observed, not ruled:**
- **R1 (Founder-owned).** After two unreported weeks, an empty mid-week report keeps the standing projection. The stored rows of the exit week (continuous 25-minute runs), and of a quality week, stay as projected until a decision re-plans. The empty weekly review then re-plans correctly: step 7 for walk/jog; no QUALITY or strides for the runner.
- **SHORT returns of easy runners.** They can resume an easy slot 5 minutes above any easy run executed: my `easyreturn` probe, 1 cell, identical on all freezes. This is below the athlete's executed long runs, outside F4, and not a regression, so I do not raise it.

## Progression authority, approved differences, O-1, R41 (brief items 13–16)

**Progression authority: confirmed.** My `progression` probe covers two runners: EASY_CURRENT, and the same runner with a familiar 4 × 5 min threshold task.

| | Candidate | Predecessor |
|---|---|---|
| Decisions with QUALITY, strides, a threshold step or a long run not earned | 0 of 30 | 4 flags in the "never reported, then reviewed" cell (QUALITY with 0 executed easy weeks; strides twice; threshold step 2 above history's 1) |

**Partial execution follows the existing per-dimension gates**, not a "perfect training only" rule:
- a missed long run holds the long run at its prescribed dose (no jump), and easy runs progress as in the reference;
- missed quality sessions hold the threshold step at 1, and easy and long runs progress as in the reference.

**Walk/jog without execution:**
- two unreported weeks then a review prescribe the released step 7, not continuous running (the predecessor prescribed continuous 20-minute runs);
- my matrix shows no step rise without an executed week.

**R6-H25** (weeks before its first step executed and reviewed, weeks 2–5 unreported): the threshold stays at the earned step and the 10K-specific ladder is not released by the calendar (`ssctr-r7ada-h25run-probe.mjs`). The predecessor credited the unreported weeks (threshold step 3).

**APPROVED_WITH_REASON differences: preserved.**
- Accessories 7 → 6 in returns: `x-items` identical.
- The return base with the last executed repetitions: `trace-b` and `trace-b2` identical.

**O-1: outside the gate.** MAINTAIN rows keep 3 sets against `maxSets` 2 on both trees. Nothing shows that `maxSets` is a hard constraint on that path.

**R41: non-blocking, not expanded.**

## 20. Verdict

```
R7A_DECISION_AUTHORITY_SCIENTIFIC_REGRESSION = NOT_READY
```

- **Met:** F1, F2 and F3 stay closed; D53, D56, D57, D58 and D59 are valid; HOLD and MAINTAIN are coherent; progression authority holds; no material regression introduced by this freeze in return, restoration or progression.
- **Not met:** "F4 closed". F4 is closed on the ladder but not at the exit to continuous running (F4-X, pre-existing).
- `R7A_EXIT_READINESS` is not declared. R7-B0 is not started.

## Literature

Not reopened. Web search was available in this session and was deliberately not used.

The approvals reuse verified full-text sources from the R6 SSCTR records (r12), with the read depth recorded there:
- R6-S21 and R6-S19 (R2);
- R6-S01 and R6-S11 (R3);
- R6-S21 and R6-S22 (R6-H35);
- R6-S02 (F4-X materiality, NF-R7ADA-2 counterevidence).

I did not re-read them.

## Validation

`validate_records.py` (Python 3.13, jsonschema 4.26.0) passes: 6 records and 3 queue items, 0 errors (`ssctr-r7ada-runs/validate.out.json`).

Negative control (`validate.negative-control.out.json`):
- **Planted defects:** a stale target hash, an altered queue condition, a missing AE answer, and a decisive claim on an abstract-only source.
- **Result:** the validator fails with 8 errors.
- **Caveat:** the altered queue condition surfaces as an unresolved queue reference, because the planted copy lives at another path.

This checks record consistency only.

## Records and queue

| Record | Disposition | Queue |
|---|---|---|
| `R7ADA-SSCTR-WALKJOG-EXIT-RETURN` (F4-X) | REVISE / MODIFY_CANDIDATE | Not approved |
| `R7ADA-SSCTR-RETURN-WALK-DAYS` (NF-R7ADA-2) | REVISE / MODIFY_CANDIDATE, non-blocking | Not approved |
| `R7ADA-SSCTR-R2-MIDWEEK-RETURN` | APPROVE_WITH_CONDITIONS / KEEP | Proposed |
| `R7ADA-SSCTR-R3-PLAN-HISTORY` | APPROVE_WITH_CONDITIONS / KEEP | Proposed |
| `R7ADA-SSCTR-H35-QUALITY-EVIDENCE` | APPROVE_WITH_CONDITIONS / KEEP | Proposed |
| `R7ADA-SSCTR-DECISION-AUTHORITY` (the review) | REVISE / MODIFY_CANDIDATE | Not approved |

The 3 queue items bind a NOT_READY freeze, with funding NOT_DECLARED. I did not edit the queue file; the Chief decides.

## Not done

- No runtime, test, policy, contract or mission file edited.
- No freeze, no correction, no R7-B0.
- No `--write` of any author script.
- The engineering review is not read.

## Routing

| To | What |
|---|---|
| **Chief** | Record `R7A_DECISION_AUTHORITY_SCIENTIFIC_REGRESSION = NOT_READY` (F4-X) with the engineering review |
| **Founder** | Whether F4-X is inside F4, as I rule (§20, item 12), and the next step. R46 is one condition inside the declared policy, then a new freeze and this check again |
| **Runtime author, with the engineering judge** | R46 (F4-X) |
| **Policy owner and SSCTR** | R47 (NF-R7ADA-2), the R6-H35 corpus re-expression, O-1 |
| **Clinical** | No clinical dependency |
