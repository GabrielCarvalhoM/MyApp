# SSCTR regression review brief — R7A-DECISION-AUTHORITY-FREEZE-1

**For:** the provisional Sports Science / Concurrent Training reviewer, regression only, in a new session. The author does not review.
**Bytes under review:** `CoachingCore/r7/decision-authority/RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json`.
- Source digest `3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244`; policy R6-POLICY-5 `18ec48f3…` unchanged.
- Committed on branch `claude/trusting-euler-04la8t` (commit in [REVIEW_HANDOFF.md](../REVIEW_HANDOFF.md)).
- Predecessor STATE-MODEL-CONSUMER-FREEZE-1 is byte-exact in `../state-consumer-freeze-source/`.

## Central question (Founder request §42)

Does the freeze close F4, and keep F1, F2, F3, D53, D56, D57, D58, D59, HOLD, MAINTAIN, return/restoration and progression within the approved policies? Do not reopen the general literature.

## F4: what changed (contract C′)

- **W1.** The walk/jog transition moves from min(state, the step the week's runs prescribed) for every gate, as RETURN and RESTART do. HOLD and consolidation repeat that step. The event window holds the step reached (D43).
- **W2.** A return reads the walk/jog step of the last walk/jog session executed. A step released but never run is not tolerated. Once it is run, it is (P7).

Your 12-cell matrix (`ssctr-r7asc-walkjog-probe.mjs`, `SSCTR_CC=CoachingCore`) gives 0 cells above the recipe; it gave 10 of 12 on the predecessor (`probes/runs/candidate/BLOCKERS.json`, F4). Further cells:
- self-challenge E1 and E2 (28 cases, 0 violations; 22 on the predecessor);
- the tests `SSCTR F4 (…)` (5 cells), P6 and P7.

## Preservation evidence

- **Your own kit**, re-run unchanged on these bytes (`../probes/kit-final/RUNS.json`, all 43 bound to the digest):
  - 37 outputs are byte-identical to the predecessor's run; 1 differs only in its clock (`trace-h25`);
  - 5 differ, each named in `../probes/NAMED_DIFFERENCES_R7ADA.json`.
- **F1 grids, caps, `trace-b`, F2 `reps` and `tick`, D58, F-sameday, the D53 R12 instrument:** identical, except `r12-instrument`.
  - In `r12-instrument`, its V_D47reviews section now equals its own round-10/11 record (it differed on the predecessor). AF_skippedReviews runs at the earned dose.
- **HOLD and MAINTAIN, the Founder's examples, tested on both trees:**
  - executed 82.5 × 3 on the current line 82.5 × 5 (range 4–6): HOLD gives 82.5 × 5;
  - 70 × 10 with the projection at 70 × 12, then MAINTAIN 8: 70 × 8.
- **Regression against the predecessor:**
  - R5 24/24 and profiles 16/16 identical;
  - simulations 13/14: T05 changes only the decision label (KEEP for INSTANTIATE_LOGGED_LOADS), with identical rows;
  - R6 holdout 20/35 identical. Every difference is attributed by ablation (`CoachingCore/r7/decision-authority/REGRESSION_R7ADA_NAMED.json`).
- **No strength dose rose.** All 58 run fields that rose are read against the ladders:

  | Reading | Fields |
  |---|---|
  | A lower ladder step whose single field is larger (for example 5 × 5 for 3 × 8) | 39 |
  | The athlete's own familiar task | 9 |
  | Quality withheld (an easy run) | 5 |
  | A projection's rotation | 3 |
  | The specific ladder not yet earned | 2 |
- **R6-H35** now ends in a runner error. Its week-5 quality fact matches no session, because weeks 0–3 are never reported and quality is not unlocked (QE-R7ASC-02's closure). The case is recorded, never dropped.

## For your ruling (sporting points the author did not decide)

1. **R2, a mid-week return holds its first week.**
   - Under E7 ("the planner's weekly review of a return's own week gates on every row of that week, the sessions before the return included"), now resolved most-restrictive-first (C3, QE-R7ASC-03), runs planned inside the pause hold the return even when every run after it was executed.
   - Example: a moderate return reported on Thursday, with Thursday and Sunday executed, repeats RETURN step 0 (predecessor: step 1, via the last-writer merge that QE-R7ASC-03 removed). History (C5) still credits the week.
   - If rows inside the declared pause should not hold the return, that is a one-condition exception in `weeklyGates`. It was not made, because §15 forbids new policy.
2. **R3, kit `changes`, A_E6, SHORT.** The planner keeps the pre-break tick that history spent on a release never lifted:
   - the bench reaches 20 kg after one fully executed week back (week 9; predecessor week 10);
   - regain caps persist a week longer (2 × 6 where the predecessor gave 3 × 6; D56 conservative).
3. **QE-R7ASC-02's consequence for unreported weeks:**
   - a corpus that never reports its early weeks (R6-H17, H19, H22, H25, H31, H34 and others) now starts the run from intake or earned doses, not the projection;
   - R6-H19's week 5 prescribes the athlete's familiar 10K task (5 × 3) at intake level.

   Is this within the approved progression policies?

## Rules

- Regression only (§42). Run instruments from your own folder with `SSCTR_CC` pointing at a tree; never edit the author's files.
- The stop condition is finite (§43). Only a direct sports regression blocks: F1–F4, D53/D56–D59, HOLD, MAINTAIN or return/restoration.
- **Verdict line:** `R7A_DECISION_AUTHORITY_SSCTR_REGRESSION_REVIEW = ACCEPT | NOT_READY`, with F4 and each preserved item stated.
