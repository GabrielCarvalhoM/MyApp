# R7-D Phase 3.3 — narrow quality/reliability check (`R7D-QUALITY-PHASE33-CHECK-1`)

**Verdict: READY_WITH_CONDITIONS.** The structured record `QUALITY_CHECK_R7D_PHASE33.json` prevails where the two differ.

- **Candidate:** runtime `3228a70` (`r6-adaptation.mjs` sha256 `15e4279b…`); evidence and scripts `f74bb82`.
- **Scope:** the quality/reliability questions of `../REVIEW_REQUEST_PHASE33.md`. The SSCTR folder and the SSCTR scratch directory were not opened.
- **Evidence class:** synthetic development fixtures, so engineering evidence only.
- **How it ran:** every probe ran on scratch copies; nothing was deleted, and no `verify-r*`, `freeze-r*` or `--write` script ran against the repository.

## What holds

SSCTR-P32-F01 is closed on the paths the rule names, and the closure reproduces.

| Check | Result |
|---|---|
| Suite on `git archive 3228a70` | 952/952 |
| Directed tests | 3.3: 14/14 · 3.2: 17/17 · 3.1: 14/14 |
| Phase 3.3 file on R7D-FREEZE-3 | 11 fail, 3 pass (T2, T7, T8) |
| F01 witness | Equal to the committed outputs: RED on R7D-FREEZE-3, clean on the candidate, E1–E3 recognized |
| Author's mutants | 8/8 killed |
| Harness validation 5 | Summary, runs, witnesses and coverage equal to the committed file: 14/14 sensitivity, 43/43 witnesses, P18 24 units |
| Differential | 151 cases, 147 same, 4 differing, 0 unexplained; rows equal to the committed file |
| Updated Phase 3.2 assertions | Old file on the candidate: 15 pass, 2 fail (exactly the two disclosed). Updated tests on R7D-FREEZE-3: 2/2 fail. The updates are tighter, not weaker |
| Freeze dry run | Scratch clone of `f74bb82`, dummy reviews: refuses before integration; integration append-only (0 deletions); freeze writes 397 files, 952/952; a second freeze refuses; verify 23/23 |
| Deletion | No script of this phase deletes anything |

The reviewer's own probes (17 cases, run on both runtimes) confirm the closure for:
- run-only and strength-only plans;
- three separate breaks;
- a return in force before the earlier break (the stop equals the same days declared once);
- determinism (byte-identical outputs);
- append-only provenance and event separation.

No path was found where an isolated session still ends the earlier break.

## Findings

| Id | Severity | One line |
|---|---|---|
| QE-R7D-P33-01 | MAJOR | "Executed completely" is the reducer's gate reading. It never gates optional WALK, RECOVERY_EASY or SHAKEOUT sessions, or the race-week RACE_TOUCH and RACE. INTERFACE-5, PREREG-5 Δ2 and P18(a) require every session of the week, so P18(a) blocks the candidate (QH-1, QH-2: `OLDER_BREAK_DROPPED` on a TRAINING_AFTER that is correct by the runtime's own rule) |
| QE-R7D-P33-02 | MINOR | Inverse-defect residual, not disclosed. A whole week executed before a later break that starts later the same day (`startedAt`) is not a re-entry: 24 days MODERATE instead of R7D-FREEZE-3's 4 days SHORT (Q5). EXP-1 confirms the day-granular week selection is the cause |
| QE-R7D-P33-03 | MINOR | An applied break between two separate breaks: reading the stop through isolated training gives a relation question (`interruption.episodeId`) that restating the later break does not end. The same question was already asked on R7D-FREEZE-3 with nothing trained between; fail-closed |
| QE-R7D-P33-04 | OBSERVATION | With three or more breaks, every earlier break gets the `reentryWeek` found after the latest earlier break (Q3b) |
| QE-R7D-P33-05 | TEST_GAP | QM2, QM4, QM5 and QM8 survive the directed tests and are killed only by the reviewer's probes. QM1, QM3 and QM9 survive everything. Untested: run-only and strength-only plans, three breaks, boundary days, SKIPPED sessions, and optional or race-week sessions in a re-entry week |
| QE-R7D-P33-06 | MINOR | The queue item says "superseded by R7D-FREEZE-4" before that freeze exists, and the freeze needs the append first. The queue write is not atomic |
| QE-R7D-P33-07 | OBSERVATION | The freeze takes `--reviewed` on trust. It refuses post-review changes only in `src` and `test`; the harness and scripts are listed in `postReview`, not refused |
| QE-R7D-P33-08 | OBSERVATION | Of the 151 differential cases, 139 are identical by construction. The differential's explainer shares the day-granular test, so a Q5-shaped loss would be counted as F01 |

### QE-R7D-P33-01 in detail

**Reproduction:** a hybrid plan with two optional walks a week (`probes/qre-p33-harness-probes.mjs`).
- Week 4 executed in full except the walks, which are unreported (QH-1) or reported not done (QH-2). The runtime gives the trip alone, 4 days SHORT, with the holiday `TRAINING_AFTER`, as its rule reads it. P18 FAILs with `OLDER_BREAK_DROPPED`.
- With the walks done (QH-3), P18 PASSes.

P18 is a blocker with no envelope. A fresh holdout case of this shape would fail the final gate on R7D-FREEZE-4. The "necessary condition, never blocks" claim in the harness README and PREREG-5 Δ1 does not hold for these roles.

**Routing:**
1. The SSCTR decides which sessions a re-entry week needs.
2. Chief/Founder then chooses the fix: instrument-side (pre-registration addendum, harness revision and a development case of the QH-1 shape) or runtime-side (a new authorized mission).

## Conditions for the freeze

1. **C1 (QE-R7D-P33-01), binding before any final holdout, final author or seed exists.**
   - Reconcile the runtime, INTERFACE-5 §1, PREREG-5 Δ1/Δ2 and P18(a) on ungated sessions, as routed above.
   - Until then, the freeze record and the closing checkpoint list the finding as an open conflict (owner Chief/Founder) and qualify the claim that P18(a) never blocks the runtime's rule.
   - An instrument-only fix before the freeze is preferred but not required.
2. **C2 (QE-R7D-P33-02, -03, -04):** disclose them as residuals of the rule, with owner and trigger.
   - QE-R7D-P33-02 goes to the SSCTR, then to the next runtime mission.
   - QE-R7D-P33-03 and -04 go to Chief/Founder.
   - Add a consumer condition for a later break with a stated start time.
3. **C3 (QE-R7D-P33-06):** append the queue item only after both reviews pass, immediately before the freeze. If the freeze is then refused, record that in a later addendum; never rewrite the item.
4. **C4 (QE-R7D-P33-07):** run the freeze with `--reviewed 3228a70`.
   - Before it, confirm that `src`, `test` and the harness are unchanged since `3228a70`, and the scripts since `f74bb82`.
   - After it, check that `postReview.changedSinceReviewed` lists only added files plus the queue.
5. **C5 (QE-R7D-P33-05):** record the test gaps, owned by the next runtime mission.
6. **C6:** commit this folder before the freeze runs, because the freeze binds it.

## Files

| Kind | Path (under `probes/`) |
|---|---|
| Runtime probes Q1–Q7 | `qre-p33-runtime-probes.mjs` → `out/runtime-probes.{candidate,R7D-FREEZE-3}.json` |
| Harness probe | `qre-p33-harness-probes.mjs` → `out/harness-probe.candidate.json` |
| Applied-between probe | `qre-p33-applied-between.mjs` → `out/applied-between.{candidate,R7D-FREEZE-3}.json` |
| Reviewer mutants QM1–QM10, EXP-1 | `qre-p33-mutation.mjs` → `out/mutation.qre.json` |
| Summary of the re-runs | `out/reruns.summary.json` |

No human-revalidation item is proposed from the quality side.
