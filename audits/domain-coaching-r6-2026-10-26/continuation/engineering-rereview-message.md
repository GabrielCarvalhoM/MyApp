Re-review request: DOMAIN_COACHING_R6, FREEZE-2.

Your FAIL on FREEZE-1 (`reviews/quality-engineering-review.json`) was answered by the runtime author. Your report stays as it is: do not overwrite it.

What happened, in order:
1. The single first holdout evaluation ran on the unchanged FREEZE-1 before any fix (`CoachingCore/r6/holdout/FIRST_EVALUATION.json`). The runtime author did not inspect its contents.
2. The fixes are pinned in `CoachingCore/test/r6-engineering-fixes.test.mjs`, one test per finding QRE-R6-01…23. They came with policy R6-POLICY-3; the author's change map is `reviews/ssctr-dossier/REVISION_R6_POLICY_3.md`.
3. SSCTR round 7, on R6-POLICY-3, returned binding defects D42–D46 and recommendations R5–R10.
4. The author answered them in R6-POLICY-4 (`reviews/ssctr-dossier/REVISION_R6_POLICY_4.md`) with regression tests in `CoachingCore/test/r6-ssctr-r7-fixes.test.mjs`. That revision also fixes one return-entry defect the author found.
5. SSCTR round 8, on R6-POLICY-4, returned binding defects D47–D49 and recommendations R11–R13.
6. The author answered them in R6-POLICY-5 (`reviews/ssctr-dossier/REVISION_R6_POLICY_5.md`) with regression tests in `CoachingCore/test/r6-ssctr-r8-fixes.test.mjs`. That revision also clears the achieved run peaks at a long-interruption restart, a change the author found.
7. SSCTR round 9, at the R6-POLICY-5 hash, resolved D47–D49 and returned two runtime-only defects, D50 and D51. The author fixed them in `r6-program.mjs` with tests in `CoachingCore/test/r6-ssctr-r9-fixes.test.mjs`; the policy hash did not change (`reviews/ssctr-dossier/RUNTIME_DELTA_D50_D51.md`). SSCTR round 10 checked them at the same hash: D50 and D51 resolved, freeze still NO on one more runtime-only defect present since FREEZE-1, D52 (the strength state was updated from prescriptions rather than executions).
8. The author fixed D52 with tests in `CoachingCore/test/r6-ssctr-r10-fixes.test.mjs`; the policy hash did not change (`reviews/ssctr-dossier/RUNTIME_DELTA_D52.md`). SSCTR round 11 resolved D52 at the same hash and returned one new runtime-only defect, D53: after a re-establishment, the block-boundary set came back at once on top of the regained set.
9. The author fixed D53 with tests in `CoachingCore/test/r6-ssctr-r11-fixes.test.mjs` (`reviews/ssctr-dossier/RUNTIME_DELTA_D53.md`). SSCTR round 12, the last round the Founder allowed, checked it at the same hash (`reviews/ssctr-policy-review.json`) [CHECK AT DISPATCH: state round 12's actual verdict].
10. The runtime was frozen again as FREEZE-2: `CoachingCore/r6/RUNTIME_FREEZE_R6_2.json`, which lists the delta against FREEZE-1.

The SSCTR approvals hold under a **weekly-review contract**, stated in every record and in the FREEZE-2 record (`reason.ssctrRounds.weeklyReviewContract`):
- every elapsed week receives a gating weekly review, in order and after its last session, with unreported sessions reviewed as missed;
- a week without one keeps the projection's assumption that it was executed and logged.

That path is the owned gap R18. Treat behaviour on skipped reviews as known and outside the approval, not as a new finding, unless it goes beyond that assumption.

Some author-side material is for reference only; re-run your own probes:
- the author's reruns of your probes (dev authority) in `reviews/ssctr-dossier/freeze2-author-reruns/`;
- the rerun of the SSCTR round-7 probe in `reviews/ssctr-dossier/policy4-author-reruns/`;
- the rerun of the SSCTR round-8 probe in `reviews/ssctr-dossier/policy5-author-reruns/`, the rerun of the round-9 probe in `reviews/ssctr-dossier/r9-author-reruns/`, the rerun of the round-10 probe on the D52 runtime in `reviews/ssctr-dossier/r10-author-reruns/`, and the author checks in `continuation/author-checks/` (the `mutation-check-*` scripts rewrite `CoachingCore/src` temporarily: do not run them).

Please re-review FREEZE-2 independently with the same rigour and the real `r6Authority()`:
- Verify the FREEZE-2 integrity, and that its predecessor is your FREEZE-1 digest.
- Re-run your Q1–Q8 probes against FREEZE-2. Write new outputs under `reviews/quality-engineering/` with a `.freeze2` suffix; never overwrite the FREEZE-1 outputs.
- Decide each finding: RESOLVED, PARTIALLY_RESOLVED or OPEN.
- Look for regressions the fixes introduced. These areas changed:
  - **Engineering fixes:** event proximity counted in days; walk/jog below the minimum session; the single-run ceiling; load units; logged-load adoption; the append-only conflict record; consent scope; return facts; the widened clinical screen.
  - **Round-7 answers, run side:**
    - a raised walk/jog start stays within the longest current run (D42);
    - taper, race-window and post-event sessions follow the run mode, and race day is a completion with walk breaks for walk/jog, restart, return, or a half marathon below a 75-minute achieved long run (D43, R9);
    - warm-up strides appear only after executed strides;
    - in projection, a dimension with no planned session holds (D46);
    - the taper long run is never shorter than the easy run (R10).
  - **Round-7 answers, strength and clinical side:**
    - an above-plan logged load is adopted only on the ADVANCE criterion (D44);
    - a first establishment log stays pending until it is confirmed (new review field `loadConfirmations`), logged again within one increment (including the same week), or matches the athlete's load hint (D45). A changed pending value travels in a proposal;
    - a return-entry log is capped at the load before the break (D45);
    - yes-meaning eligibility flags route to a human in the intake, the review and the legacy path (R6);
    - lexicon additions, and locally negated damage is asked (R7);
    - every exposure of a return-entry week is at the entry dose, and exercises first set up in it follow the return steps (author-found).
  - **Round-8 answers:**
    - **D47.** Race day is a completion, with its negotiation, also when the program used walk/jog or restart in an earlier week. The history travels in `run.modeHistory`, set by `withModeHistory` in `projectWeeks`. The negotiation states `run.longestContinuous` and is recomputed in every proposal by `finishProposal`.
    - **D48.** A row whose load waits for confirmation reads effort-guided selection only.
    - **D49.** The strength return state gains `lastExecutedSets`, `setCeiling`, `setCap` and `returnInBlock`, and the week's planned counts travel in `stateTrace[w].strength.planned`. Step 2 is max(1, min(ceiling − 1, entry + 1)), with phase reductions on top. After the steps the count climbs one set per executed unreduced week. Return weeks earn no block set.
    - **Restart history (author-found).** A long-interruption restart clears `achieved` and `longestContinuous`.
    - **R11.** Lexicon additions, and `joinCompounds` for C-section and recém-nascido.
    - **R12.** With every easy day a walk, the executed long run gates the walk conversion.
    - **R13.** In projection, restart and return sessions of any role gate on EASY.
  - **Round-9 answers (runtime only):**
    - **D50.** A long-run step that the long-run share cap holds is no increase. `distributeRun` marks it (`progression.heldBy`), `plannedOf` carries `longHeldByShare`, and `advanceRun` then lets the easy and quality steps follow their own gates. When one of them steps, the long-run target waits.
    - **D51.** A return ends with the exercises prescribed in the week. The return markers of exercises not used during it are cleared then, so rotation resumes.
  - **Round-10 answer (runtime only):**
    - **D52, what was performed.** `r6-adaptation.mjs` `performedInWeek` reads the reviewed week's evidence. A completed or partial report counts when it lists the exercise with a set. A completed report without details counts for every exercise of its session. Missed, not-reported, pending and conflicted sessions perform nothing.
    - **D52, establishment.** In `advanceStrength` a new exercise gets its state only when it is performed. A loaded one also needs a logged load that is adopted or pending. A re-establishment takes effect only when performed. A from-log state performed without a usable logged load is marked `unlogged`, and `strengthDose` gives it the effort-guided establishment row under any earlier ceiling.
    - **D52, the same week.** `buildWeek` no longer treats an exercise first set up earlier in a week as established for its later sessions, except in a return-entry week.
    - **D52, the clock.** `lastWeek` is replaced by `lastPerformed`, a local date taken from reviews, from planned dates in projection, and from the intake `observedAt` of a known dose. `strength.resumeAfterDays` counts calendar days from it to the session date.
    - **Author-found with D52.** `loggedLoads` skips conflicted rows, so a conflicted report neither sets nor confirms a load (your QRE-R6-14 area).
    - **Tests.** `CoachingCore/test/r6-ssctr-r10-fixes.test.mjs` (10 tests). The D30 test of `r6-ssctr-revision.test.mjs` now sets `lastPerformed`.
  - **Round-11 answer (runtime only):**
    - **D53.** A performed re-establishment sets `regainCap` to its set count. `strengthDose` prescribes `min(normal, setCap, regainCap)` before the phase reduction. The cap rises one set per executed week without a phase reduction, and ends once it can no longer bind. `startStrengthReturn` clears it.
    - **Tests.** `CoachingCore/test/r6-ssctr-r11-fixes.test.mjs` (5 tests).

Two author choices need your view:
- A missed session that is moved is still annotated SKIPPED in the past week (your q5 counted it). Its prescription is unchanged.
- Intake contradictions in your fuzz rows outside QRE-12 are not changed, for example longRunMinutes below runMinutes, or experience NONE with high volume. They will be recorded as open gaps.

Write `reviews/quality-engineering-rereview.json` with: revision, evaluator, independent, freezeDigest, predecessorDigest, checks, findingDispositions:[{id, disposition, evidence}], newFindings, verdict:{engineeringStatus PASS|PASS_WITH_FINDINGS|FAIL, rationale}. Also write a short `.md`.

Do not read the holdout corpus or either evaluation raw. Do not modify anything outside `reviews/`. Never run `npm run verify` or any `verify-r*` script.
