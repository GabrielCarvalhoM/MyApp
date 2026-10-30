# ENGINEERING RECHECK BRIEF — R7A-RESIDUAL-AUTHORITY-FREEZE-1

**For:** an independent Quality & Reliability Engineering judge, in a new session. Do not run this in the session that froze the runtime.

**Verdict line:** `R7A_RESIDUAL_AUTHORITY_ENGINEERING_RECHECK = READY | NOT_READY`

## The bytes

| | |
|---|---|
| Freeze | R7A-RESIDUAL-AUTHORITY-FREEZE-1, record `CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json` |
| Source digest | `259ab3eff431d2381d50904be7594d9fa122c7d8d2fc369e20d67b5419f84cb6` |
| Manifest digest | `d530846b515c99ff9b0b9c6bdf36dd28f8f908c49ee6be2544a131b051192ff2`. 86 files: runtime, tests, policy, dev fixtures, `package.json` |
| Policy | R6-POLICY-5, `18ec48f3…`, unchanged |
| Predecessor | R7A-DECISION-AUTHORITY-FREEZE-1 (`3a7166b2…`), byte-exact in `audits/domain-coaching-r7a-residual-authority-2026-10-30/decision-authority-freeze-source/`. Its review is yours: `review/r7ada-decision-authority-engineering`, `17e7285` |
| Branch and commits | In [REVIEW_HANDOFF.md](../REVIEW_HANDOFF.md) |

To check the chain read-only: `node CoachingCore/scripts/verify-r7ara.mjs --tests`, on Node v24.19.0.

## Scope: exactly three questions (Founder request §33)

This is not an open review.

1. **QE-R7ADA-01, factual correction globality.** Does every review kind decide on the factual truth in force for the same evidence?
   - The review kinds: weekly review, schedule (no-op, from next week), goal (no-op, from next week), unavailable day, local fatigue that reduces, turn conflict, missed session, equipment, return report.
   - What to check: is the correction, retraction or newly quarantined conflict applied before the handler (§6), so that EARLY = LATE?
   - The confirmation rule must hold (§11): a log above the corrected row is asked, never adopted silently.
2. **QE-R7ADA-02, the structural return ceiling.** Does every return start at or below the running state or dose last executed, and never from one only released or projected?
   - The states: walk/jog, the walk/jog exit, EASY long and easy runs, moderate `returnTo`, repeated pauses (return steps, a return's completion, a restart's switch).
3. **Preservation.** The properties A, B and E of your earlier review that these two changes touch.
   - A (factual authority) and B (correction consistency): QE-R7ASC-01 and its class.
   - E (return ≤ factual tolerated dose): F4's cells.
   - C (coherent decision resolution) only as far as the new dispatch stage could move it (your Q05).

## What changed (one place per root cause)

The rules are in [RESIDUAL_AUTHORITY_CONTRACT.md](../RESIDUAL_AUTHORITY_CONTRACT.md).

- **A5 — `src/r6-adaptation.mjs`: `factualReplan` and `withFactualReplan`, called once in `evaluateProgram` before dispatch.**
  - It is A3's rule (trigger `viewMovedBy`, `composeWeeks` from this week), moved out of `weeklyReview`'s mid-week branch.
  - A week counts as under way while any session is still ahead by the C1 test: a later date, or later today. A3 counted only later dates, so a correction on the week's last day, before that day's session, kept that row through every review kind. The re-plan never closes the week.
  - The handler then decides on the re-planned program, with the PlanningView read on it.
  - What it returns:
    - its own proposal carries the re-plan, and two decisions are recorded;
    - a KEEP becomes REPLAN_FROM_EVIDENCE;
    - an ASK or UNSUPPORTED keeps its status, with the re-plan proposed;
    - CLINICAL proposes nothing.
  - A proposal with the re-plan is validated from this week.
- **E1 — `src/r6-program.mjs`: `historicalRun` generalized, and `src/r6-adaptation.mjs` `stateAtBreak` feeds it.**
  - The input: the runs executed completely since the latest return's report (else the intake) and before the interruption.
  - The mode: a mode the evidence released that no run has used is undone to the state that prescribed the last run.
  - The doses within the mode:
    - the walk/jog step, restart minutes and return step: never above the last run;
    - the long and easy runs: never above the largest executed and tolerated since the entry. Easy rows are phase-modulated from the state, so a consolidation week's reduced row is no lower tolerance. Your Q06b reads the week before the pause and flags k=4 and k=8 after consolidation weeks for this reason (named in the report); Q06c, the largest executed, is clean.
- **Tests:** `test/r7ara-residual-authority.test.mjs` is new. `test/r7ab-week-start-authority.test.mjs` I5/P3, §13 premise and I6 are re-expressed in place (marked `Residual authority closure`): a short trip after an executed MODERATE re-entry week resumes return step 0, while history credits step 1.

## Evidence on these bytes

Every run is bound to `259ab3ef…` in `probes/EVIDENCE_RUNS_R7ARA.json`. Outputs are in `probes/runs/`.

- **Your probes, byte-exact copies in `probes/judges/qe/`** (git blob ids equal to your branch's), run on both trees. In `runs/findings/`:
  - Q01: 0 of 78 on the candidate, 14 on the predecessor;
  - Q01b: 0 of 45, against 12;
  - Q06c: 0 of 21, against 11;
  - Q06, Q06b, Q06d, Q04 and Q05: see [PRE_FREEZE_REPORT.md](../PRE_FREEZE_REPORT.md), which also names Q06's and Q06b's remaining flags.
- **Earlier judges:**
  - the predecessor judge's QE-R7ASC P01–P07 on both trees (`runs/r7asc-qe/`);
  - the 35 earlier judge probes (`runs/judges/`), compared with their run on the predecessor bytes (`COMPARISON_R7ARA.json`).
- **This mission's own checks:**
  - tests on the predecessor (`runs/tests-on-predecessor.out.json`);
  - the self-challenge (`runs/self-challenge/`);
  - the four mutants (`runs/mutation.out.json`);
  - the regression (`CoachingCore/r7/residual-authority/REGRESSION_R7ARA.json`).
- **Named differences:** `probes/NAMED_DIFFERENCES_R7ARA.json`.

## Declared, for this recheck (not changed)

- **A5-B1.** A correction can arrive after the week's last session, with a review that does not close the week. Next week's projected rows then stand until a closing review re-plans them from the corrected evidence. This is R1, the standing projection: Founder ruling `R1_R7A_BLOCKER = NO`, `PRE_TESTFLIGHT_GATE`.
- **E1-B1.** The quality ladder after a short break. D58 governs it, and the request's scope excludes the running catalogue.
- **E1-B2.** RETURN walk days: NF-R7ADA-2, backlog.
- **E1-B3.** The restart switch's long-run offset after one easy run of the new mode. The single-run ceiling bounds it. NOT TESTED under a pause.
- **E1-B4.** OBS-2: W2's reading is unchanged.
- **E1-B5.** `historicalStateOf().state.run` stays HistoricalState's run. HistoricalState is not redesigned.

## Rules for the recheck

- Read these exact bytes; record the digest at the start and at the end (`REVIEW_INVALID` if they differ).
- Write only into `audits/domain-coaching-r7a-residual-authority-2026-10-30/reviews/`, on your own review branch. Never edit the author's files, the baseline or earlier review branches.
- **The stop condition is finite (§35).** Only these block:
  - a material violation of the two root causes;
  - a direct regression of the A, B or E properties these changes touch.
- Any other finding goes to the backlog and does not reopen phase A.
- Not issued here: `R7A_EXIT_READINESS` (the closure session decides it after both rechecks), R7-B0.
