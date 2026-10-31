# SSCTR narrow regression recheck of R7A-RESIDUAL-AUTHORITY-FREEZE-1

**Revision R7ARA-SSCTR-r1, 2026-10-31.** Gate `R7A_RESIDUAL_AUTHORITY_SCIENTIFIC_RECHECK`. Narrow regression recheck only (the Founder's request for this recheck; my brief [SSCTR_RECHECK_BRIEF.md](SSCTR_RECHECK_BRIEF.md)). No science is reopened, nothing is corrected, no freeze is made, R7-B0 is not started.

- **Reviewer role:** Sports Science & Concurrent Training Reviewer, narrow regression recheck, in a new session.
  - I did not author the policy, the runtime, the residual authority contract or the tests.
  - The R46 recommendation this freeze implements came from the earlier SSCTR session (R7ADA-SSCTR-r1), not from this instance.
- **Bytes judged:** R7A-RESIDUAL-AUTHORITY-FREEZE-1, freeze commit `7d2da3603e224124696a2290766ec448080f3264`. The handoff commit `4917489` changes no bound byte.
- **Written on** the review branch `review/r7ara-residual-authority-ssctr`, created from `4917489`. The baseline `claude/r7a-residual-authority-closure` and the earlier review branches are untouched.
- **Outputs, all under `reviews/`:**
  - `SSCTR_RECHECK.md` (this file);
  - `ssctr-recheck/ssctr-r7ara-recheck.json`: the ruling plus 6 decision records, validated;
  - `ssctr-recheck/ssctr-r7ara-queue-items.json`: a proposal of 5 queue items;
  - instruments `ssctr-recheck/*.mjs` and the builder `ssctr-r7ara-build.py`; outputs in `ssctr-recheck/runs/`.

## Verdict

```
R7A_RESIDUAL_AUTHORITY_SCIENTIFIC_RECHECK = READY
```

The brief's line, with the same meaning: `R7A_RESIDUAL_AUTHORITY_SSCTR_RECHECK = ACCEPT`.

Every condition of the verdict rule holds:
- F4-X is closed, on my own probe and on two new variants;
- the EASY return factual ceiling holds in every return I built: 0 of 416 returns above the executed and tolerated dose (445 flags on the predecessor);
- R7ARA-SELF-01 is closed;
- the ruling points E1-a to E1-f are acceptable;
- F1–F4, D53, D56–D59, HOLD and MAINTAIN stay valid;
- no material sporting regression caused by this freeze exists inside the gate.

One coherence finding introduced by this freeze, **NF-R7ARA-1**, is non-blocking and goes to the backlog (section 17). I do not declare `R7A_EXIT_READINESS`. R7-B0 is not started. I did not read the engineering recheck.

| # | Item | Ruling |
|---|---|---|
| 1 | Branch | `review/r7ara-residual-authority-ssctr` |
| 2 | Review commit | Reported with the push (this file is in it) |
| 3 | Freeze and digests | R7A-RESIDUAL-AUTHORITY-FREEZE-1; source `e7172eb2…`, manifest `3d214fb5…`, policy `18ec48f3…` |
| 4 | Integrity | `RECHECK_INVALID = NO` |
| 5 | F1 | **VALID** |
| 6 | F2 / HOLD | **VALID** |
| 7 | F3 / MAINTAIN | **VALID** |
| 8 | F4 (ladder) | **VALID** (0/99, 0/12) |
| 9 | F4-X | **CLOSED** |
| 10 | EASY return factual ceiling | **HOLDS** |
| 11 | R7ARA-SELF-01 | **CLOSED** |
| 12 | E1-a … E1-f | E1-a ACCEPT_WITH_REASON · E1-b ACCEPT_WITH_REASON · E1-c ACCEPT_WITH_REASON · E1-d ACCEPT · E1-e ACCEPT · E1-f ACCEPT_WITH_REASON |
| 13 | Earned/eligible vs executed/tolerated | **ACCEPT_WITH_REASON** |
| 14 | Consolidation long run | Returning to the executed 60: **ACCEPT** (coherent with the factual tolerated dose; no consolidation rule violated) |
| 15–19 | D53, D56, D57, D58, D59 | **Each VALID** |
| 20 | HOLD | **VALID** (240 cases, nothing rises) |
| 21 | MAINTAIN | **VALID** (no row above the range or the last executed load) |
| 22 | New findings inside the gate | NF-R7ARA-1 (NONBLOCKING, BACKLOG R48) |
| 23 | Observations outside the gate | 6, each NONBLOCKING / BACKLOG / LATER_GATE (section 18) |
| 24 | Verdict | `R7A_RESIDUAL_AUTHORITY_SCIENTIFIC_RECHECK = READY` |

## 1. Freeze and digests

| | Value |
|---|---|
| Freeze | R7A-RESIDUAL-AUTHORITY-FREEZE-1, `CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json`, file sha256 `51e67fb0…` |
| Source digest | `e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d`, recomputed |
| Manifest digest | `3d214fb53f62e45ca7d99f39f2c562d358719a2264c2de46098d39b318c85125`, recomputed |
| Policy | R6-POLICY-5, canonical `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`; file `a75be1aa…`, recomputed |
| Freeze commit | `7d2da3603e224124696a2290766ec448080f3264` (ancestor of `4917489`; the baseline `5434b32` is its ancestor) |
| Handoff commit | `4917489364bb1138f8d82b46c20dd65d1bf693c7`: only `CURRENT_MISSION.md`, `MISSION_LEDGER.md`, `REVIEW_HANDOFF.md` |
| Runtime delta | `src/r6-adaptation.mjs` (`a44142d5…`), `src/r6-program.mjs` (`9e499734…`); test added `r7ara-residual-authority.test.mjs`; `r7ab-week-start-authority.test.mjs` re-expressed in place |

## 2. Integrity

`RECHECK_INVALID = NO`.

**My own recomputation.** I re-implemented the canonical hash rather than importing it: in Python at the start, in Node (`ssctr-recheck/ssctr-r7ara-digest.mjs`) after the probes and again after every output was written (`runs/digest.mid.out.json`, `runs/digest.end.out.json`).
- 86 of 86 bound files match in the worktree and in a `git archive` of `7d2da36`; 0 unbound `src/` or `test/` files.
- The source and manifest digests above recompute, and the policy's canonical hash and file hash match.
- The live tree and the archive of `7d2da36` give identical probe outputs, labels aside (checked on the exit-variant probe).

**The author's chain.** `verify-r7ara.mjs --tests`, read-only, on Node v24.19.0, before my files existed: **13/13**, suite 673/673 (`runs/verify-r7ara.start.out.json`).
- The first attempt failed only its `suite` check: this fresh container had no `node_modules`, so the pinned `ajv` 8.20.0 was missing. I installed it from the lockfile (`npm ci`, git-ignored); `package.json` and `package-lock.json` kept their hashes; the rerun passed 13/13.
- Re-run at the end without `--tests`: 11 of its 12 read-only checks pass; the only failure is `reviews-not-dispatched`, as designed once a recheck adds its files to `reviews/` (`runs/verify-r7ara.end.out.json`). My end digest (`runs/digest.end.out.json`) shows no drift on the live tree or on either archive.

**Predecessor.** R7A-DECISION-AUTHORITY-FREEZE-1 rebuilt from `git archive d4631cd` matches its record (85/85, `3a7166b2…`, `a500cdd9…`). The in-repo copy `decision-authority-freeze-source/` equals git byte for byte (85/85).

**My R7ADA probes.** The author's copies in `probes/judges/ssctr/` have the git blob ids of my branch `6f5d40c` (6/6); my copies in `ssctr-recheck/` were taken from `6f5d40c` directly.

**Environment notes.**
- Node v24.19.0 installed with nvm (the container had v22); `package.json` engines `>=24`.
- No file outside `reviews/` was written. No author script ran with `--write`.

## 3. Instruments

| Group | What | Trees |
|---|---|---|
| My R7ADA probes (byte-identical to `6f5d40c`) | `continuous` (F4-X, 34 cells), `walkjog-matrix` (F4, 99 returns), `progression`, `returnwalks`, `h25run` | Candidate, predecessor |
| My R7ASC probes (unchanged, from their folder) | `hold`, `maintain`, `temporal`, `walkjog` (12 cells), `walkjog-trace`, `easyreturn` | Candidate, predecessor |
| My kit (43 jobs, the decision authority closure's job list) | Restoration and caps grids, short and first-week grids, D58, same-day, traces, changes, round-12 instrument | Candidate (live tree), compared with the author's run on the same bytes and with `kit-final` on the predecessor |
| New, this recheck | `ssctr-r7ara-return-probe.mjs` (416 returns: 388 single pauses on three easy runners, 8 with an adverse long run, 20 in repeated pauses), `ssctr-r7ara-exitvariants-probe.mjs` (10 cells), `ssctr-r7ara-crossentry-probe.mjs` (4 cells) | Candidate, predecessor |

**Reproduction.** Every output of my R7ADA and R7ASC probes equals the author's run of the same probe on the same tree (labels aside). Kit: 43 of 43 outputs reproduce the author's run on the same bytes (labels and clocks aside); 35 are identical to the predecessor's `kit-final` (`trace-h25` differs in its clock only) and 8 differ (`b-probe`, `changes`, `d58`, `f-probe`, `holdout-detail`, `probe`, `systemic`, `x-items`), the 8 the author named E1. `regression` exits with the R6-H35 runner error (the week-5 quality fact matches no session), byte-identical to the predecessor's stderr, paths aside. The live source digest stayed `e7172eb2…` before and after every job (`runs/kit/RUNS.json`).

## 4. F4-X: closed

My continuous probe (two athletes: TOP5, a non-novice from step 5 whose exit falls in a CONSOLIDATION week; FULL, the fixture novice from step 0, exit in a DEVELOPMENT week; step 8 = 1 × 20 min jog):

| Case (pause from Monday of the exit week) | Candidate | Predecessor |
|---|---|---|
| Exit released, never run (week L reviewed, or complete and unreviewed), SHORT | **Walk/jog step 8** in the re-entry week | 3 × 25 min continuous |
| Same, MODERATE | **Step 7** | RETURN 5 × 15, then 5 × 20 min |
| Same, LONG (TOP5) | **Step 0** | RESTART 15-min continuous runs |
| Exit only projected; step-8 week held; pause from Saturday; one continuous run executed (P7) | Unchanged and correct | Same |

- **Totals:** ladder view **0**, duration view **0** (predecessor 10 and 4). The weekly view flags 3 cells (predecessor 7).
  - Those 3 cells are byte-identical to the predecessor's: TOP5 EXIT_HELD/SHORT and ONE_CONTINUOUS_RUN/MODERATE on both athletes.
  - I ruled them correct in R7ADA item 18: the weekly view counts the exit projected after the re-entry week (conditional on its execution) and RETURN walk days (NF-R7ADA-2, backlog).
- **Only the EXIT_EARNED cells differ** from the predecessor; the other 24 cells and the no-pause cell are identical.
- **New variants** (`exitvariants`): Monday's first continuous run missed (pause from Wednesday), or reported complete at 20 of 25 minutes (a partial; pause from Tuesday), SHORT/MODERATE/LONG on both athletes.
  - Candidate: 0 of 10 cells with a continuous run in the re-entry week, 0 above the recipe (SHORT 8, MODERATE 7, LONG 0).
  - Predecessor: 10 of 10 with continuous runs.
- **Mechanism (read in the diff):** `historicalRun` undoes a mode whose release no executed run has used; `stateAtBreak` passes `undo` true for the walk/jog exit under every break class. This is R46.

The approved rule this restores: R6-NONCLINICAL-RETURN SHORT "resume the last executed doses … the next step waits for executed sessions"; MODERATE "conditional steps to the prior executed dose"; contract W2.

## 5. F4 (ladder): valid

| Probe | Candidate | Predecessor |
|---|---|---|
| My 99-return walk/jog matrix | 0 / 99 | 0 / 99 (identical output) |
| My 12-cell R7ASC walk/jog probe | 0 / 12 | 0 / 12 (identical) |
| `walkjog-trace` | Identical | — |

F4 closed on the ladder in R7ADA; this freeze keeps it byte-identical and adds the exit.

## 6. EASY return factual ceiling: holds

Property checked: return dose/state ≤ the applicable factual executed and tolerated dose/state.

**My return probe** (`ssctr-r7ara-return-probe.mjs`), three easy runners:
- PERF: my lib's intake (PERFORMANCE, runs Tue/Thu/Sun, long run Sunday, 16 weeks);
- HM: fixture A_RUN_FIRST_HALF_MARATHON (16 weeks);
- HYB: fixture C_BALANCED_HYBRID (12 weeks).

Weeks 0..k-1 executed and reviewed; a pause from Monday of week k, or from Thursday after that week's earlier sessions were executed and reported day by day; SHORT 4, 6 and 10 days, MODERATE 14, 17, 21 and 28 days. The references are read from the record I built, not from the runtime: the prescribed minutes of the runs executed completely with a tolerated response.

| Check | Candidate | Predecessor |
|---|---|---|
| Single-pause returns | 388 (174 SHORT, 214 MODERATE) | 388 |
| SHORT cells with the entry long or easy, or a LONG or EASY row of the re-entry week, above the largest executed and tolerated | **0** of 174 | 138 of 174 |
| MODERATE cells with `returnTo` above the largest executed, `returnFrom` above the 15-minute entry, or a re-entry row above `returnFrom` | **0** of 214 | 164 of 214 |
| Adverse-response cells / repeated-pause cases (C1, C2, C4–C7) with a return above the executed and tolerated dose | **0** of 8 / **0** of 18 | 8 of 8 / 14 of 18 |
| Cells where HistoricalState held a released long run above the executed one | 296 | 296 |
| Returns below min(HistoricalState, largest executed and tolerated) | **0** | — |
| Re-entry weeks with more minutes than the predecessor | **0** (110 lower, 278 the same) | — |
| Total flags | **1**: the half-marathon race row inside a MODERATE re-entry week, an event the single-run ceiling excludes by policy; identical on the predecessor (section 18, O-1) | 445 |

**The requested shapes:**
- **Easy dose and long run, SHORT:** PERF k2–k3 (65 executed, 70 released) resume **65** (predecessor 70); PERF k6 (70 executed, 75 released) resume **70** (75). The rotating extra easy step waits too: no entry easy plus extra above the largest easy run executed.
- **MODERATE:** `returnTo` is the executed dose: PERF k6 **70** (predecessor 75); HM k6 **70** (75). This is the brief's E1-c example.
- **"70 executed, 75 projected only, pause":** the return never starts from 75 (PERF k6, SHORT and MODERATE; the author's test case k=5 likewise).
- **Adverse long run** (8 cells): an adverse run is no tolerated dose, so the cap falls back to the largest tolerated (PERF k6: 70 adverse → **65**).
- **Bounded repeated pauses** (C1 SHORT→SHORT on PERF k5, PERF k9, HM k7; C2 70 executed/75 released → SHORT, re-entry executed, then SHORT or MODERATE; C7): 0 above the executed dose.
- **My R7ASC easy-return probe:** 0 of 4 cells above the longest executed (predecessor 1; the cell I recorded in R7ADA as "SHORT returns of easy runners can resume an easy slot 5 minutes above any easy run executed" is now closed).
- **D58 quality logic untouched:** the eased first quality slot after a SHORT break is identical on both trees in all 388 single-pause cells (section 15, D58).

## 7. R7ARA-SELF-01: closed

My C4 cells (PERF and HM): a MODERATE first break; return steps 0 (15/15/20) and 1 (30/30/45) executed; the evidence completes the return (released, never run); then a second break.

| Second break | Candidate | Predecessor |
|---|---|---|
| MODERATE 14 or 21 days | **RETURN step 0 from 15/15/20**, towards **30/45** (the doses executed since the first return's entry); step 1 at 25/25/35 | RETURN step 0, towards 40/70 (released, never run since) |
| SHORT 4 days | RETURN **step 1** (Sunday's 45-minute long run), then the completion projected | Easy running (Sunday 60–65 min) |
| LONG 33 days | RESTART at 15 | RESTART at 15 |

The defect R7ARA-SELF-01 (a moderate break resuming step 1 at 30/30/45, skipping the entry) is absent: the moderate recipe keeps its 15-minute entry.

## 8. Ruling points E1-a … E1-f

| Id | What I reproduced | Ruling |
|---|---|---|
| **E1-a** | 32 SHORT cells resume a long run above the last one executed, every one right after a CONSOLIDATION week, at the largest executed since the entry: PERF k5 (65 in weeks 0–3, 60 in consolidation, 70 released) → **65**; PERF k9 → 75 (not the consolidation 65); HYB k4 → 60. None is above the largest executed; none uses a released step | **ACCEPT_WITH_REASON** (below) |
| **E1-b** | Section 10 | **ACCEPT_WITH_REASON** |
| **E1-c** | MODERATE `returnTo` = the dose reached by execution: PERF k6 70 (predecessor 75); after a consolidation week the build week's 65, not the consolidation's 60 (PERF k5) | **ACCEPT_WITH_REASON** ("the last executed dose" in the brief reads, exactly, the largest executed and tolerated since the entry) |
| **E1-d** | Completion released, short pause before any easy-mode run: RETURN at step 1, the step last run. With one easy-mode run executed first (C5): easy running with long and easy capped at the return step's 45 and 30 (predecessor 70 and 40–45) | **ACCEPT** |
| **E1-e** | Restart switched to easy (restart minutes run 15, 20, 25), short pause before any easy-mode run: RESTART at **25** (predecessor easy 30, long 40) | **ACCEPT** |
| **E1-f** | MODERATE after the completion: re-entry from the 15-minute entry towards 30/45 (section 7). MODERATE after the switch: from 15/20 towards easy **25**, long 40 (the switch's offset, E1-B3), as on the predecessor except easy 30 → 25 | **ACCEPT_WITH_REASON** |

**Why E1-a is sports-coherent.**
- A consolidation week runs shorter rows from an unchanged state. It is a planned recovery week, part of a predefined progression (R6-S21's program alternated progressive weeks with a −25% recovery week), not evidence of lower tolerance.
- The approved strength rule D49 already reads its ceiling "outside a return step and a phase reduction"; reading the run's largest tolerated dose is the same logic.
- It is bounded three ways: never above HistoricalState (the cap only lowers), never above an executed and tolerated run, and still under the 30-day single-run ceiling of the composition.
- The return week's own phase reduces its rows again when it is itself a consolidation week (B/PERF/k7: entry 70, re-entry consolidation row 60).
- Under-dose check: 0 returns below min(state, largest executed). Holding the return to the consolidation's 60 would have been the under-dose the author's first cut produced (Q06d k=8, 65 instead of 75).

**Why E1-f is acceptable.** After two breaks in close succession (two moderate breaks four weeks apart, two weeks of return training between them), the doses executed before the first break are a historical maximum, "a ceiling, not current proof". Re-entering from the 15-minute entry towards the most recent executed doses applies the moderate recipe as approved. The cost is a slower rebuild through the normal executed cadence; it is not material under-dosing after about four weeks without training in six (R6-S19). The switch's long-run target of 40 against a longest executed run of 25 is the restart offset (E1-B3), identical on the predecessor, outside this gate by the Founder's instruction; the rows stay under the single-run ceiling (section 18, O-4).

## 9. Earned/eligible vs executed/tolerated: ACCEPT_WITH_REASON

The candidate keeps two readings apart:
- HistoricalState records what the evidence earned for normal planning (the next step is eligible, and without a break the plan prescribes it, response-gated);
- the return reads what was executed and tolerated.

This separation is sports-coherent:
- **Without a break**, an earned step is prescribed and then monitored on execution: its eligibility rests on fresh, continuous training.
- **A break removes that currency** (R6-S19: fitness declines with cessation). What was earned but never run has no tolerance evidence; what was executed has. "Eligible to progress in normal planning ≠ proven as a tolerated return baseline."
- **Nothing is lost:** once the earned step is executed, a later break resumes it (P4, verified: C3 control, the test P4, and the continuous probe's ONE_CONTINUOUS_RUN cells).
- **No materially wrong prescription:** in every case I built, the gap is at most one step for at most one week at the dose last executed (sections 6 and 10).
- **No approved policy is contradicted:** SHORT says "the next step waits for executed sessions"; MODERATE says "conditional steps to the prior executed dose".

## 10. Short return after an executed moderate re-entry week (E1-b): ACCEPT_WITH_REASON

My C3 cells (PERF and HM):
- a 14-day break; the re-entry week executed at return step 0 (15/15/20) and reviewed;
- history then credits return step 1;
- a 4-day trip from Monday of the next week, before any step-1 session.

| | Candidate | Predecessor |
|---|---|---|
| Entry | RETURN **step 0** | RETURN step 1 |
| Rest of the trip week | Sunday's long run at 20 min (step 0) | Sunday's long run at 45 min (step 1) |
| Next week | Step 1 (30/30/45) | Easy running (the completion) |
| Control (P4): step 1 run once before the trip | Step 1 | Step 1 |

The four questions:
- **Factual tolerated dose:** respected. Step 0 is the step executed; step 1 is eligible, not demonstrated.
- **Material under-dosing:** no. One exposure at the entry dose (a 20-minute long run), then step 1 the following week. The athlete is still inside a return after an 11–28 day break, at 15–45 minute doses; the delay is at most one week and history loses nothing.
- **Recipe/policy:** consistent. SHORT "resume the last executed doses; the next step waits for executed sessions"; the moderate recipe's two conditional steps are delivered, one week later.
- **Conservative consequence:** yes, bounded, the same class as R2, which I accepted in R7ADA ("at most one additional entry week").

The kit's `systemic` probe shows the same shape (its U cell: entry step 0 against the predecessor's 1, the following rows lower). The three `r7ab` tests re-expressed in place (I5/P3, §13 premise, I6) now assert this, and still assert that history credits step 1.

## 11. Consolidation long run: ACCEPT

The Founder's framing, "60 min factual executed vs 65 min previously projected/released", reproduces on HYB k4:
- the build week ran 60, the consolidation week 55, and the evidence released 65;
- the SHORT return resumes **60** (the predecessor resumed the released 65);
- the next week projects 65, conditional on the re-entry week's execution.

Returning to 60:
- **is coherent with the factual tolerated dose:** it is the largest long run executed and tolerated;
- **is conservative but acceptable:** one 5-minute step below the plan for one week;
- **violates no consolidation rule.** The consolidation parameters (every 4th development week; the long run two steps shorter) shape rows from an unchanged state. They grant no right to restore a projected dose after a break. The share-cap clause "never below the long run prescribed in the last build week" governs the share cap, not returns, and the return here *is* the last build week's executed long run.

**65 is not restored because it was the earlier projection.** Where 65 *was* executed before the consolidation week (PERF k5, HM k5), the return is 65 because it was executed (E1-a), not because it was projected.

## 12. F1: valid

- **Temporal evidence** (my R7ASC `temporal` probe; a 15-day break reported Thursday 07:00):
  - history as each cut saw it is identical to the predecessor;
  - the run's return step stays 0 at Thursday 20:00, Friday 23:00 and Saturday 12:00, and becomes 1 from Sunday 22:00, after the week's runs.
- **No future session credited:** the same, in all four cells.
- **Restoration:** restoration jumps 0 in all cells; restoration grid B = 0, C = 0 of 864 timelines (U = 237, the uncovered R23 class, unchanged).
- **No dose rises:** strength rows are identical in every cell. The only difference is a week-9 long run's progression value (65 against the predecessor's released 70) at the same 50 minutes.
- `trace-b` and `trace-b2` are identical to the predecessor (1 → 2 → 3).

## 13. F2 / HOLD: valid

My HOLD probe (240 HOLD gates on four goals and five paths) is identical on both trees:

| Check | Count |
|---|---|
| Load raised | 0 |
| Repetitions raised | 0 |
| Sets raised | 0 |
| Row outside the goal range | 0 |
| Load tick gained | 0 |
| Progression with no new evidence | 0 |

**The Founder's example:** STRENGTH, current line 82.5 × 5; the athlete executes 82.5 × 3 at the prescribed reserve; the gate is HOLD → **82.5 × 5** (4 × 5), unchanged load, repetitions and sets. No global "target reps ≤ executed reps" rule is applied. A row at a load only the projection held repeats that row with no tick (R42 paths). The kit's `reps` and `tick` probes: `reps`, 0 of 126 rows outside the goal range (42 per goal), and `tick`, both identical to the predecessor.

## 14. F3 / MAINTAIN: valid

My MAINTAIN probe is identical on both trees:
- **Setup:** 70 × 10 executed, the projection at 70 × 12, then a change to MAINTAIN (8–8, RIR 3).
- **Result:** back squat **70 × 8** every week (3 × 8 in development, 2 × 8 in consolidation).
- **Counts:** of 393 known-dose rows, 0 above the range, 0 below, 0 at RIR below 3, 0 above the last executed load.
- `trace-h25` differs from the predecessor in its clock only; my R6-H25 run trace is identical on both trees.

The 3 sets against `maxSets` 2 are O-1 (recorded in R7ADA; outside the gate).

## 15. D53, D56, D57, D58, D59: each valid

| Item | Instrument | Candidate | Against the predecessor |
|---|---|---|---|
| **D53** | Restoration grid; `r12-instrument`; `temporal` | B = 0, C = 0 of 864 timelines; restoration jumps 0 | Identical |
| **D56** | Restoration grid A, A2; `changes` | 0 cap rises or ends after a non-whole week (of 4,181 cap weeks); 0 caps held after a whole week (of 8,546) | Grid identical; `changes` differs in run rows only (A_E6, E1-d), no strength value |
| **D57** | Caps grid; extension | B = 0, covered jumps 0, unexplained 0; extension 0 / 0 / 0 | Identical |
| **D58** | `short`; `d58` | 0 of 315 defects after the return and after the review | Grid identical; `d58` differs only in the long runs after returns, one step lower |
| **D59** | `firstweek`; `x-firstweek` (8 shards); `f-sameday`; `x-sameday` | E = O = B = 0 for NONE (90 cases), FAMILIAR (108), KNOWN (108); extended grid 1,377 cases, same tally; same-day tallies unchanged | Identical |

None of the five is touched by E1 outside the run doses of returns: every strength, restoration, cap and first-week quantity is identical.

**D58, with the attention it deserves.**
- In the `d58` instrument the only differences are the long runs after returns, one step lower (65 against 70, 70 against 75): the E1 cap.
- The eased first quality slot, the easy-slot markers and every quality and easy row are unchanged.
- My return probe confirms it at scale: the eased quality rows are identical on both trees in all 388 single-pause cells.
- The factual ceiling did not touch the approved quality logic.

## 16. Differences against the predecessor (relevant to this gate)

- **Kit:** 35 of 43 jobs identical to the predecessor (`trace-h25` in its clock only); 8 differ, each in run doses after a return (`b-probe`, `changes`, `d58`, `f-probe`, `holdout-detail`, `probe`, `systemic`, `x-items`); `regression` fails on both with the same R6-H35 runner error.
- **No named difference changes a strength row:** the differing leaves of `b-probe`, `changes`, `d58`, `f-probe`, `holdout-detail`, `probe`, `systemic` and `x-items` hold no strength value.
- **Every named running difference lowers a dose or steps down in kind:** a quality session becomes an eased slot, a released mode is undone, a long run is one step lower. `changes` A_E6 SHORT is E1-d; the `systemic` U cell is E1-b; `holdout-detail` R6-H17/H26 are E1 long-run caps.
- **The author's claims check out:**
  - no dose rose in any difference I examined (the 8 kit differences, the 388 re-entry weeks of my return probe, my continuous, exit-variant and R7ASC probes), consistent with `DIRECTION_R7ARA.json` (0 unexplained rises);
  - differences are named;
  - most come from the new factual ceiling: every kit difference is a return-path run dose;
  - R6-H35 is unchanged: the `regression` job exits with the same runner error.
  - The two A5 (factual correction) differences are in the engineering probes Q01 and Q01b, outside this gate; no kit output differs because of A5.
- **Byte identity is not required by itself.** The differences above are the intended ceilings.

## 17. New findings inside the gate

| Id | What | Introduced by this freeze | Materiality | Blocks |
|---|---|---|---|---|
| **NF-R7ARA-1** | The easy-running cap's window restarts at each return report (E1.2). After a SHORT return whose re-entry week is a CONSOLIDATION week, a second SHORT pause caps a **tolerated** athlete at that week's reduced row, while an athlete whose re-entry long run was **adverse** keeps the entry's state (E1.5) | Yes (E1) | Not material | **No**: BACKLOG R48 |

**Reproduction** (`ssctr-r7ara-crossentry-probe.mjs`; PERF and HM, k = 7; re-entry week 8 is CONSOLIDATION with a 65-minute long run; second SHORT pause from week 9):

| Cell | Second return, long run | No-break control | Predecessor |
|---|---|---|---|
| PERF, re-entry long run tolerated | **65** (row 65) | row 70 (state 75) | 75 (row 70) |
| PERF, re-entry long run adverse | 75 (row 70) | row 70 | 75 (row 70) |
| HM, tolerated | **65** (row 65) | row 75 | 80 (row 75; above the executed 75) |
| HM, adverse | 75 (row 75) | row 75 | 80 (row 75) |

- **Every reading stays at or below the factual tolerated dose:** 75, executed in week 6, before the first break. P3 holds.
- **The adverse path** equals the approved HOLD reading and the no-break control, and is identical to the predecessor.
- **The incoherence:**
  - the tolerated athlete resumes 5–10 minutes below the adverse one, for one week;
  - this contradicts the contract's own E1.4 rationale ("a planned reduction is no lower tolerance") across the entry boundary.
- **Why it does not block:** the effect is one week, at most two 5-minute steps, rebuilt as executed sessions accrue. Two short breaks within three weeks make the lower dose defensible (R6-S19). No approved policy is contradicted: "resume the last executed doses"; "historical maxima are a ceiling, not current proof".
- **Routing:** the policy owner, with the runtime author, chooses one reading for a phase-reduced post-entry run, so that a tolerated response never resumes below an adverse one. I propose no recipe. Any fix must not raise a return above the executed and tolerated dose.

No other finding inside the gate.

## 18. Observations outside the gate

Each is NONBLOCKING; none reopens phase A.

| Id | Observation | Same on the predecessor | Route |
|---|---|---|---|
| O-1 | HM k11, a 17-day pause ending five days before the half marathon: the MODERATE re-entry week is 15 and 15 minutes, then the race (150 minutes). The race is an event the single-run ceiling excludes by policy | Yes | LATER_GATE: race proximity after a break (event/race semantics, not this gate) |
| O-2 | After a SHORT break the eased first quality slot (D58) runs the released threshold step's duration (for example 53 minutes against a largest easy run of 50 and a longest quality session of 48); the next quality session follows the evidence's step | Yes (identical in 388 cells) | LATER_GATE: E1-B1, the quality ladder after a short break |
| O-3 | Asymmetry: an adverse easy-running long run is excluded from the cap (the return falls back to the largest tolerated), while an adverse walk/jog step is resumed (OBS-2, E1-B4) | Walk/jog side yes; easy side new (conservative) | BACKLOG; OBS-2 not reopened |
| O-4 | E1-B3: after a restart switch released and never run, a MODERATE return targets long 40 (the switch's offset) against a longest executed run of 25 since the restart; the rows stay under the single-run ceiling | Yes | LATER_GATE (restart long-run offset under a pause; Founder: not reopened) |
| O-5 | NF-R7ADA-2: RETURN weeks turn walk days into runs (`returnwalks` w5–w6 flags unchanged; w7 now lower) | Yes | BACKLOG R47 |
| O-6 | O-1 (R7ADA): MAINTAIN keeps 3 sets against `maxSets` 2 (99 rows) | Yes | BACKLOG |

## 19. Verdict

```
R7A_RESIDUAL_AUTHORITY_SCIENTIFIC_RECHECK = READY
```

- **Met:** F4-X closed; the EASY return factual ceiling correct; R7ARA-SELF-01 closed; E1-a to E1-f acceptable; F1–F4, D53, D56, D57, D58, D59, HOLD and MAINTAIN valid; no material sporting regression caused by this freeze inside the gate.
- **Backlog:** NF-R7ARA-1 (R48) and the observations of section 18.
- **Not declared:** `R7A_EXIT_READINESS`, engineering readiness, R7-B0, Product Truth publication.

## Literature

Not reopened (the Founder's request for this recheck, items 19–20). Web search was available in this session and was deliberately not used.

The rulings reuse verified full-text sources from the R6 SSCTR records (r12), copied verbatim through my R7ADA records, with the read depth recorded there:
- R6-S19 (detraining meta-analysis);
- R6-S21 (individualized vs predefined progression, recreational runners);
- R6-S02 (single-session spikes and overuse injury, 5,200-runner cohort).

I did not re-read them. They support the direction of the rulings (resume the executed dose after a break; progression after executed work; caution with single-session spikes), not the policy's exact step sizes.

## Validation

`validate_records.py` (Python 3.13, jsonschema 4.26.0) passes: 6 records and 5 queue items, 0 errors (`ssctr-recheck/runs/validate.out.json`).

Negative control (`runs/validate.negative-control.out.json`):
- **Planted defects:** a stale target hash, a missing AE answer, a decisive claim whose sources are made abstract-only, and an altered queue condition.
- **Result:** the validator fails with 11 errors, covering all four.
- **Caveat:** the altered queue condition surfaces as unresolved queue references, because the planted copy lives at another path.

This checks record consistency only.

## Records and queue

| Record | Disposition | Queue |
|---|---|---|
| `R7ARA-SSCTR-F4X-EXIT-RETURN` (supersedes `R7ADA-SSCTR-WALKJOG-EXIT-RETURN`) | APPROVE_WITH_CONDITIONS / KEEP | Proposed |
| `R7ARA-SSCTR-EASY-RETURN-CEILING` (E1-a, E1-c, consolidation long run) | APPROVE_WITH_CONDITIONS / KEEP | Proposed |
| `R7ARA-SSCTR-E1B-SHORT-AFTER-REENTRY` (E1-b, earned vs executed) | APPROVE_WITH_CONDITIONS / KEEP | Proposed |
| `R7ARA-SSCTR-RELEASED-MODES-RETURN` (E1-d, E1-e, E1-f, R7ARA-SELF-01) | APPROVE_WITH_CONDITIONS / KEEP | Proposed |
| `R7ARA-SSCTR-CROSS-ENTRY-CAP` (NF-R7ARA-1) | REVISE / MODIFY_CANDIDATE, non-blocking | Not approved |
| `R7ARA-SSCTR-RESIDUAL-AUTHORITY-RECHECK` (the recheck) | APPROVE_WITH_CONDITIONS / KEEP | Proposed |

The 5 queue items bind R7A-RESIDUAL-AUTHORITY-FREEZE-1, with funding NOT_DECLARED. I did not edit the queue file; the Chief decides.

## How to rerun

```bash
cd CoachingCore && npm ci && cd ..
```

```bash
mkdir -p /tmp/r7ara/pred /tmp/r7ara/cand && git archive d4631cd CoachingCore | tar -x -C /tmp/r7ara/pred && git archive 7d2da36 CoachingCore | tar -x -C /tmp/r7ara/cand
```

```bash
ln -s "$PWD/CoachingCore/node_modules" /tmp/r7ara/pred/CoachingCore/node_modules && ln -s "$PWD/CoachingCore/node_modules" /tmp/r7ara/cand/CoachingCore/node_modules
```

```bash
cd audits/domain-coaching-r7a-residual-authority-2026-10-30/reviews/ssctr-recheck && SSCTR_CC=/tmp/r7ara/cand/CoachingCore node ssctr-r7ara-return-probe.mjs > /tmp/return.cand.json
```

Every probe in `ssctr-recheck/` takes `SSCTR_CC` the same way (`pred` for the predecessor). The kit: `node ssctr-r7ara-kit-run.mjs <repo root> <out dir> 2`, then `node ssctr-r7ara-kit-compare.mjs <out dir> <repo>/audits/domain-coaching-r7a-residual-authority-2026-10-30/probes/runs/kit <repo>/audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/kit-final`. The R7ASC probes run from their own folder with `SSCTR_CC` set.

## Not done

- No runtime, test, policy, contract, brief or mission file edited.
- No correction, no freeze, no merge, no R7-B0.
- No `--write` of any author script.
- The engineering recheck is not read.

## Routing

| To | What |
|---|---|
| **Chief** | Record `R7A_RESIDUAL_AUTHORITY_SCIENTIFIC_RECHECK = READY` with the engineering recheck; decide on the 5 queue proposals |
| **Founder** | `R7A_EXIT_READINESS` after both rechecks |
| **Policy owner and SSCTR** | NF-R7ARA-1 (R48); O-1, O-2, O-4 in their later gates; R47 (NF-R7ADA-2) |
| **Clinical** | No clinical dependency |
