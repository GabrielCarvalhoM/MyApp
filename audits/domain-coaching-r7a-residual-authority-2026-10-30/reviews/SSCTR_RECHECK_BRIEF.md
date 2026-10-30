# SSCTR RECHECK BRIEF — R7A-RESIDUAL-AUTHORITY-FREEZE-1

**For:** the Sports Science & Concurrent Training Reviewer (`.claude/agents/sports-science-concurrent-training-reviewer.md`), regression only, in a new session. Do not run this in the session that froze the runtime.

**Verdict line:** `R7A_RESIDUAL_AUTHORITY_SSCTR_RECHECK = ACCEPT | NOT_READY`

## The bytes

| | |
|---|---|
| Freeze | R7A-RESIDUAL-AUTHORITY-FREEZE-1, record `CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json` |
| Source digest | `e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d` |
| Manifest digest | `3d214fb53f62e45ca7d99f39f2c562d358719a2264c2de46098d39b318c85125` (86 files) |
| Policy | R6-POLICY-5, `18ec48f3…`, unchanged. No sporting rule is added |
| Predecessor | R7A-DECISION-AUTHORITY-FREEZE-1 (`3a7166b2…`), byte-exact in `audits/domain-coaching-r7a-residual-authority-2026-10-30/decision-authority-freeze-source/`. Your regression of it: `review/r7ada-decision-authority-ssctr`, `6f5d40c` |
| Branch and commits | In [REVIEW_HANDOFF.md](../REVIEW_HANDOFF.md) |

## Scope: exactly five items (Founder request §34)

No science is reopened.

1. **F4-X.** Step 8 executed (1 × 20 min jog), the exit to continuous running released but never run, then a pause.
   - Expected: the return is the walk/jog recipe: SHORT step 8, MODERATE step 7, LONG step 0.
   - Expected: no continuous run in the re-entry week.
2. **The EASY return factual ceiling.** "70 factual, 75 projected only, pause": the return never starts from 75.
   - SHORT: the long run is never above the last long run, and an easy run never above the largest easy run of the last week that ran one.
   - MODERATE: `returnTo` is the executed dose.
3. **F1–F4.** F4 includes F4-X and the walk/jog ladder matrix.
4. **D53, D56, D57, D58, D59.**
5. **HOLD and MAINTAIN preservation.**

## What changed

The rules are in [RESIDUAL_AUTHORITY_CONTRACT.md](../RESIDUAL_AUTHORITY_CONTRACT.md).
- **E1 (your items 1–2).** The state a return reads is HistoricalState's run, with every release the athlete has not run undone (condition 7: "resume the last executed doses; … the next step waits for executed sessions").
  - A released mode that no run has used is undone where the recipe reads the state last run:
    - a SHORT break undoes the walk/jog exit, the restart's switch and a return's completion;
    - a MODERATE or LONG break undoes only the walk/jog exit (your R46: step 7, step 0). For a continuous runner, the moderate recipe re-enters from the entry and the long one restarts, from the released easy state with its doses capped at the executed ones.
  - Within the mode, no dose is above the one reached by execution: on a ladder, the step last run; in easy running, the largest long and easy runs executed and tolerated since the entry.
- **A5 (engineering scope).** A correction, retraction or newly quarantined conflict re-plans the sessions still ahead before any review kind decides. It is the weekly review's existing rule (A3), now applied in one place. Strength rows planned from a retracted fact are re-planned; the D44/D45 questions are kept.

## Ruling points this change creates (inside your items 2–3; please rule)

| Id | Behavior on these bytes | Reading |
|---|---|---|
| E1-a | Easy running resumes the largest long run, and the largest easy run, executed and tolerated since the entry, never a step only released. After a consolidation week the return is not held to that week's reduced row. Examples: engineering Q06b k=4, a SHORT return resumes 65 (week 2's), not the consolidation 60 nor the released 70 (the predecessor 70). Q06d k=8, a MODERATE return steps back to the 75 executed in week 6 (the predecessor 75). A first cut that capped at the last run gave 65 there; it was corrected before the freeze | A planned reduction is no lower tolerance; the return week's own phase reduces its rows again. Engineering Q06b's last-week criterion flags k=4 and k=8 for this reason; Q06c (the largest executed) is clean |
| E1-b | A repeated pause. A MODERATE re-entry week is executed at return step 0, then a short trip: the trip resumes step 0, while history credits step 1. Three earlier tests (`r7ab` I5/P3, §13 premise, I6) are re-expressed in place | "The next step waits for executed sessions." Once step 1 is run, a later break resumes step 1 (P4) |
| E1-c | MODERATE: `returnTo` is the last executed dose. Example: long 70, the predecessor 75, released but never run | "Conditional steps to the prior executed dose" |
| E1-d | A return completed by the evidence, then a short pause before any easy-mode run: RETURN at the step last run. With an easy-mode run executed first: EASY, with the long run capped at the last long run (the return step's) | The same rule. Self-challenge class `E1.return-completion` |
| E1-e | A restart switched to easy running, then a short pause before any easy-mode run: RESTART at the minutes last run | The same rule. Class `E1.restart-switch` |
| E1-f | The same two cases with a MODERATE pause (14 days) re-enter from the 15-minute entry. After the completion (your kit's `changes` A_E6: steps 0 and 1 run at 15/15/20 and 30/30/45): a new return 15/15/20, then towards the 30/45 executed since the first return's entry, where the predecessor stepped towards the first return's target, 40/70, released and never run since. After the switch (restart minutes run 15, 20, 25): towards easy 25, not the switch's 30; its long-run target, 40, is the switch's offset (E1-B3), as on the predecessor | Moderate recipe: re-entry from a current demonstration or the 15-minute entry, "conditional steps to the prior executed dose"; "historical maxima are a ceiling, not current proof". A first cut resumed return step 1 (30/30/45) after the 14 days, skipping the entry. This mission's direction check found it on the first evidence round (R7ARA-SELF-01, [probes/SUPERSEDED_ROUND_R7ARA.json](../probes/SUPERSEDED_ROUND_R7ARA.json)), and it was corrected before the freeze |

**Declared and not changed:**
- **E1-B1, the quality ladder after a short break.** D58: the first quality slot runs easy, and the next quality session follows the evidence's step, as approved.
- **E1-B2, NF-R7ADA-2.** RETURN walk days: backlog, §21.
- **E1-B3, the restart switch's long-run offset after one easy run of the new mode.** The single-run ceiling bounds it (`restart.longRunCappedBySingleRunCeiling`). NOT TESTED under a pause.
- **E1-B4, OBS-2.** A walk/jog step run once with an adverse response, then a short break, resumes that step, consistent with HOLD.

## Evidence on these bytes

Every run is bound to `e7172eb2…` in `probes/EVIDENCE_RUNS_R7ARA.json`. Outputs are in `probes/runs/`.

- **Your R7ADA probes, byte-exact copies in `probes/judges/ssctr/`** (git blob ids equal to your branch's), on both trees, in `runs/findings/`:
  - continuous running (F4-X);
  - the walk/jog matrix (F4);
  - progression authority, return walk days, R6-H25.
- **Your R7ASC probes, unchanged, from their folder**, on both trees, in `runs/asc/`: HOLD, MAINTAIN, temporal evidence, walk/jog F4, walk/jog trace, easy return.
- **Your kit**, the same 43 jobs as the decision authority closure's `kit-final`, compared with that run on the predecessor bytes (`runs/kit/`, `COMPARISON_R7ARA.json`).
  - It covers F1–F3, D53/D56–D59, HOLD and MAINTAIN.
  - Every difference has a named cause (`NAMED_DIFFERENCES_R7ARA.json`).
  - No named difference raises a dose against the predecessor (`DIRECTION_R7ARA.json`). The check counts a session that stepped down in kind (walk/jog for a continuous run, an easy run for a quality one) as no rise, and lists the cases it counted that way.
- **This mission's own checks:**
  - tests: `test/r7ara-residual-authority.test.mjs` (F4-X on your continuous-running profile and timeline; the EASY ceiling; the moderate repeated pause, E1-f; P3, P4);
  - the self-challenge (`runs/self-challenge/`);
  - the regression against the predecessor (`CoachingCore/r7/residual-authority/REGRESSION_R7ARA.json`).

## Rules for the recheck

- Read these exact bytes, and record the digest at the start and at the end.
- Write only into `audits/domain-coaching-r7a-residual-authority-2026-10-30/reviews/`, on your own review branch. Never edit the author's files, the baseline or earlier review branches.
- **The stop condition is finite (§35).** Only these block:
  - a material violation in F4-X or the EASY return factual ceiling;
  - a direct sports regression in F1–F4, D53/D56–D59, HOLD or MAINTAIN caused by this freeze.
- Anything else goes to the backlog and does not reopen phase A.
- Not issued here: `R7A_EXIT_READINESS`, R7-B0.
