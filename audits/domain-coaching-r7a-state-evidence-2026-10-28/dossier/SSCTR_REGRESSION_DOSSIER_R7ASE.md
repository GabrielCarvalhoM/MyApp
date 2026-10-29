# COACHING CORE — STATE EVIDENCE MODEL — SSCTR regression dossier (STATE-EVIDENCE-FREEZE-1)

**For:** the Sports Science & Concurrent Training Reviewer (gate `STATE_EVIDENCE_SCIENTIFIC_REGRESSION`), the single regression check of the single freeze.
- This session exposes the native type `sports-science-concurrent-training-reviewer` (`.claude/agents/sports-science-concurrent-training-reviewer.md`). Load `governance/agents/sports-science-reviewer/CONSTITUTION.md` and `.agents/skills/sports-science-review/SKILL.md` as it directs.
- Your authority is PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only.

**Binding:**
- STATE-EVIDENCE-FREEZE-1, `CoachingCore/r7/state-evidence/RUNTIME_FREEZE_STATE_EVIDENCE.json`. Source digest `692483ce5147d90797441baf2ac73c9d433197bd40047f147202ca4e4bff2cc1`; freeze file SHA-256 `a8683cbad60fd7f7b9da8b09e5c44bc74a55c6a2445e744606d37dbc6fde69f7`; policy R6-POLICY-5 `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c` (unchanged). At the freeze, the read-only `verify-r7ase.mjs` passes 15 of 17 checks. The two open ones are `independent-reviews` (these reviews) and `deliverables` (the closure).
- Policy R6-POLICY-5 `18ec48f3…` is **unchanged**: no policy text was edited and no sporting rule was added.
- The engineering judge reviews the same bytes in parallel.

**Your previous check:** `audits/domain-coaching-r7a-boundary-2026-10-28/reviews/ssctr-r7ab-recheck.{md,json}` (R7AB-SSCTR-r1, ACCEPT on R7A-BOUNDARY-FINAL-FREEZE `36a71ca8…`):
- D53 closed; D56–D59 hold;
- S-A to S-F approved;
- non-blocking NF-R7AB-1 (R40: walk back per sport).

**Mission:** [FOUNDER_REQUEST.md](../FOUNDER_REQUEST.md) (§25 is your remit), [TASK_CONTRACT.md](../TASK_CONTRACT.md), [STATE_EVIDENCE_CONTRACT.md](../STATE_EVIDENCE_CONTRACT.md). No correction cycle follows this check.

## Your remit (Founder §25): regression only

This is predominantly a state-engineering mission. Do not open new sporting research when nothing sporting changed. Confirm that the change did **not unduly alter**:
- prescriptions;
- the return entry;
- restoration;
- progression rules;
- ceilings;
- phase behaviour.

D53 and D56–D59 must hold. If the sporting outputs stay within the approved rules, and each changed output follows from "a value only a projection made is not history", the answer is ACCEPT.

## Bounds

- **Read-only runtime.** Write only under `audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/` (prefix `ssctr-r7ase-`):
  - your probes and outputs;
  - `ssctr-r7ase-regression.md` and `.json`;
  - a queue proposal, only if you approve something prescriptive (a proposal only; the Chief integrates it append-only).
- **Never run:**
  - `npm run verify`, `simulate` or `demonstrations:r6`;
  - any `scripts/verify-r*.mjs` with `--write`;
  - any `regress-*`, `freeze-*`, `prepare-*` or `queue-*` script;
  - any evidence runner (`run-evidence-*.mjs`, your earlier `ssctr-*-run.mjs`);
  - `mutation-check-*.mjs`;
  - any build script that writes into an earlier audit folder.

  `node CoachingCore/scripts/verify-r7ase.mjs` without `--write` is read-only.
- **Your instruments:**
  - your R7-A.1, R7-A.2, R7-A final and R7-A boundary instruments print only and load the live tree;
  - your probes accept `SSCTR_CC` to point at a copy;
  - a byte-exact R7A-BOUNDARY-FINAL-FREEZE runtime is at `audits/domain-coaching-r7a-state-evidence-2026-10-28/boundary-freeze-source/CoachingCore`.
- Synthetic data and the DEV_TEST_ONLY authority only. No clinical semantics; unknown eligibility is ASK.

## What changed (R7A-BOUNDARY-FINAL-FREEZE → STATE-EVIDENCE-FREEZE-1)

**The planner is unchanged.** Every week start the planner reads, and every prescription it writes from it, is produced as before. The plan may still project a load the athlete has not lifted yet ("historical 20 kg, projected 22 kg", Founder §3, §18).

**History is read value by value** (`historicalView`). The state at an interruption, and so every return's entry and ceilings, reads each strength exercise and the run state from a week start only when that start holds that value as evidence. A weekly review's start no longer lends its authority to a value it carried from a projection: that value is rebuilt, by the same review rule, on what the athlete executed. A projection counts only when the week before executed the sport as it assumed and the value's own base was historical.

**The return recipe is unchanged:** SHORT resumes; MODERATE and LONG start the return steps, with the last executed count as the ceiling (D49). Unchanged code: `startStrengthReturn`, `advanceStrength`, `advanceRun`, the composition rules and the easy slot. In `strengthAtBreak`, one load fact was added (SE-C below).

Diff: `dossier/RUNTIME_DELTA_R7ASE.diff`.

## Items with a sporting reach (please rule)

| # | Behaviour now | On R7A-BOUNDARY-FINAL-FREEZE | Where to see it |
|---|---|---|---|
| SE-A | **No prescription changes before a return.** The R5 corpus, the profiles and the simulations are identical, and so are 33 of 35 R6 holdout cases. Every difference sits in a return's entry and the weeks it plans (SE-B) | — | `CoachingCore/r7/state-evidence/REGRESSION_R7ASE.json` |
| SE-B | **A return starts from what the athlete executed.** It never starts from a value only a projection made: a load step, a load tick, a whole count or an easy week the plan assumed in a week not executed as assumed. QE-R7AB-01's P40: a SHORT return resumes db-rdl 20 kg (last lifted; the plan projected 22). P40c: the MODERATE ceiling is 20, not 22. R6-H26: the accessory re-enters at its known 14 kg × 10 (the projected 16 × 6 was never reported), and the runs are shorter. R6-H17: an earlier point of the same progression (weeks never reported are not counted) | A review carried projected values into an evidence start, and a return read them as executed | `probes/runs/qe7ab-P40*.out.json`, `qe7ab-P40c`, `REGRESSION_R7ASE_NAMED.json` |
| SE-C | **A known load lifted is the load.** In a week read as facts (no review), the load the athlete lifted on a known-load row is the exercise's load: lighter (P5: target 22, lifted 21, so 21), or heavier with the row's target met (the D44 adoption rule). An effort-guided row (a return entry or establishment, whose known load is a ceiling) adopts nothing, as your S-B approved | The known load stayed even when a lighter one was lifted | tests "P5", "families B, I" |
| SE-D | **A projected dose the athlete then lifts is history.** When the athlete lifted exactly the load a projection prescribed, that dose (load, repetitions and load ticks) is history; the step the plan assumed was then taken. P41: back-squat 85 kg with its own tick, never a tick counted at 82.5 kg carried onto 85 (that would step to 87.5). With repetitions unlogged, the load lifted is still the fact and the repetitions stay the target at that load; the gate holds (P40b cells 2 and 5) | — (new reading) | `qe7ab-P41`, test "families B, I" |
| SE-E | **Per sport (your R40).** A sport executed exactly as its projection assumed keeps its completed sessions when the other sport did not. A systemic report that reduced only strength rows leaves the run at its executed return step 1, while strength goes back to the re-entry. After two return weeks whose runs were all executed, the run's return is complete, while lifts never executed stay at step 0 | The start counted only when both sports held (your NF-R7AB-1) | R7-A boundary tests "§13 premise" and "I4" (marked `State evidence`); your b-probe SB (lifted lighter: B's runs continue the return, easy 30 and long 45 instead of 15 and 20) and SD (held: the run's return complete; full: one reviewed step, so no pre-break-dose rows after B) in `probes/COMPARE_R7ASE_NAMED.json` |
| SE-F | **A review's carried values are rebuilt.** A value that a review's start carried from a projection is rebuilt by the review's own rule on what was executed. Example (I4 history): the Saturday-only lifts, missed twice, stay at return step 0; Wednesday's lifts, executed and reviewed in week 6, are at step 1. A strength-only change on Sunday applies the review's rule to strength, so strength is as the Sunday review makes it, and the run, still the plan, goes back to the re-entry | The whole start walked back to the re-entry (discarding week 6's reviewed progress), or was trusted whole | test "families A, C" (marked); the Sunday cells of P30, P30b and P47, and your b-probe SA (`probes/COMPARE_R7ASE_NAMED.json`, contract E6) |
| SE-G | **Last performed is the execution date** in history, so a re-establishment threshold read from history uses the date the exercise was executed, not the planned one | The planned date of a verified projection was kept (B7) | test "§8 last performed date" |
| SE-H | **Declared boundaries E1–E6** (contract §7, quoted in summary below) | — | contract §7 |

Declared boundaries E1–E6, in summary:
- **E1.** The planner's own rules read the plan's view, which after unreviewed weeks may assume work not reported. These are the re-establishment threshold D52, the quality and strides unlock counters, caps and the race-week assessment. This is unchanged; history never reads them as facts.
- **E2.** A run value read through an unreviewed week keeps that week's start: it is not trimmed by the review's cap rule ("progression continues from what was prescribed").
- **E3.** Completed sessions verify a sport only when every row of it was executed as assumed: your S-A.
- **E4.** A rebuilt value reads the evidence as known at the interruption.
- **E5.** Weeks never reported are not history; a first review after them keeps the plan. This is your S-C applied to the review's base.
- **E6.** A handler that applies the weekly review's rule on the week's last day (an equipment, schedule, goal or fatigue statement on Sunday) is that sport's review, per sport. A later return then starts, for that sport, as after a Sunday review. Example (P30): after a Sunday equipment statement, a SHORT return resumes the back squat at the 20 kg executed on its effort-guided entry row, step 1, as after a Sunday review. Without the statement it resumes the 82.5 kg ceiling at step 0. A Monday handler changes no history.

## Evidence on the frozen bytes

- Your earlier grids and probes, re-run by the author on the frozen bytes (`probes/EVIDENCE_RUNS_R7ASE.json`): the R7-A.1 first-week grid, restoration grid and caps, the short grid, the D58 readings, the R7-A.2 extensions and items, the round-12 instrument, the R7-A final F probes and same-day, and the R7-A boundary b-probe.
- Their comparison with the R7A-BOUNDARY-FINAL-FREEZE outputs: `probes/COMPARE_R7ASE.json`, with every difference named in `probes/COMPARE_R7ASE_NAMED.json`.
- The regression: `CoachingCore/r7/state-evidence/REGRESSION_R7ASE.json` and `probes/REGRESSION_R7ASE_NAMED.json`.
- The consumer audit (§21): `dossier/CONSUMER_AUDIT_R7ASE.md`.
- The tests: 555/555. The new file `test/r7ase-state-evidence.test.mjs` has 15 tests, 10 of which fail on the boundary-freeze copy.

All of this is evidence to check, not a substitute for your own runs.

## What to write

`reviews/ssctr-r7ase-regression.md` and `reviews/ssctr-r7ase-regression.json`, with:
- `freezeReviewed.sourceDigest`;
- `verdict` (ACCEPT | REVISE | REJECT, or an equivalent mapping);
- your ruling on SE-A to SE-H;
- D53 and D56–D59 status;
- any non-blocking recommendation;
- queue items only if you approve something prescriptive.
