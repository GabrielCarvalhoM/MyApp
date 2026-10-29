# DOMAIN_COACHING_R7-A Final Boundary Closure — checkpoint

Read [TASK_CONTRACT.md](TASK_CONTRACT.md) first. Each resume point is appended; earlier ones are not edited.

## Resume point 1 — rehydrated, baseline reproduced and bound (2026-10-28)

- **Rehydrated:** AGENTS.md, CLAUDE.md, CURRENT_MISSION.md (R7-A Final Closure blocks), MISSION_LEDGER.md; `CoachingCore/r7/final/FINAL_REPORT_R7AF.md`, `audits/domain-coaching-r7a-final-2026-10-28/FINAL_DISPOSITION.json` (`notReadyRecord`), `CHECKPOINT.md`, `TASK_CONTRACT.md`, `INTERRUPTION_EPISODE_CONTRACT.md`; the engineering re-check R7AF-QE-r1 (QE-R7AF-01 to 04, boundaries B1–B6) and its probes P30, P30b, P30c, P30d; the SSCTR verdict R7AF-SSCTR-r1; runtime `src/r6-adaptation.mjs` (`stateAtBreak`, `interruptionEpisode`, `returnAfterPause`, the handlers), `src/r6-composition.mjs` (`composeWeeks`, `conditionalNext`, `adaptThisWeek`), `src/r6-program.mjs` (`projectWeeks`, `strengthAtBreak`, `generateProgram`).
- **Baseline (§5), before any edit:** R7A-FINAL-FREEZE digest recomputed `ec2debe7…` (0 of 80 drift; policy `18ec48f3…`); `verify-r7af.mjs` read-only 18/18; `node --test` 528/528; the judge's P30c and P30b byte-identical to the recorded outputs (`8dfa53db…`, `db28ce3d…`); SSCTR R7AF-SSCTR-r1 ACCEPT. Outputs in `probes/baseline/`.
- **Bound:** `CoachingCore/scripts/prepare-r7ab.mjs` wrote `BASELINE.json` (2,366 files) and `final-freeze-source/` (80 files).
- **Found during rehydration (same class, to be closed by the same model):** the earned predicate's third clause ("the week before executed as planned") counts any non-conflicted report as executed (a report of a session not completed, a partial one) and a skipped session as done, and ignores adverse responses, unlogged sets, a load below plan and a same-week adaptation made after the start was projected. A weekly review that keeps the plan leaves no record, so the consolidation it performs is only visible in the evidence.

**Next:** the authority record, the one consumer, the temporal-contradiction rule, the tests; then self-challenge, mutation, regression and evidence; then the single freeze.

## Resume point 2 — model built, self-challenged and evidenced; ready to freeze (2026-10-28)

- **Runtime delta** (contract [WEEK_START_AUTHORITY_CONTRACT.md](WEEK_START_AUTHORITY_CONTRACT.md), R7AB-WEEKSTART-1):
  - `src/r6-program.mjs`: the record (`WEEK_START`, `premiseOf`, `startAuthority`, `anchoredStart`, `projectedStart`) and the generator's authorities.
  - `src/r6-composition.mjs`: `composeWeeks` records the authority of every placed start.
  - `src/r6-adaptation.mjs`: `historicalWeekStart`, the one consumer; `stateAtBreak` walks back while a start is not history, before any return too (B3 superseded), and records `stateAt.authority`; `weeklyReview`, `rebuild` and `returnAfterPause` pass their start's authority; the §11 contradiction is asked.
  - Policy unchanged. Source digest `36a71ca8…`.
- **Tests:** new `test/r7ab-week-start-authority.test.mjs` (12); `test/r6-adaptation.test.mjs` "nonclinical return is staged…" edited in place, marked `R7-A boundary` (a never-logged program starts from the intake; the 1-set entry is now asserted after three executed weeks). `node --test` 540/540. On a byte-exact R7A-FINAL-FREEZE copy, 10 of the 12 new tests fail; the 2 that pass (time alone, late sync) are behaviour that freeze already had.
- **Found and fixed before the freeze (self-challenge and mutation):**
  - In a return the strength rows are effort-guided (ESTABLISH, the known load a ceiling). A lighter logged load passed a check against the row's planned value, so the projection kept 82.5 kg where a review would adopt the 20 kg lifted. The premise now compares with the load the projection assumed lifted.
  - The C4 scenario first reported Sunday's run on Sunday (itself a review, so week 5 was consolidated); it now reports it on Monday so the held-value case is really exercised.
  - Mutation round 1 left five survivors (16/21). They became tests:
    - a partial session in the held-value case;
    - an equipment statement on Sunday;
    - a strength-only change after a Sunday review;
    - an event change that re-plans this week (Founder family C).
  - The decision-clock guard is documented as equivalent on reachable paths. Final mutation: 20/21 plus 1 documented.
- **Self-challenge** (`probes/r7ab-self-challenge.mjs`, 9 classes): 0 violations on the candidate, 56 on R7A-FINAL-FREEZE.
- **Regression** against R7A-FINAL-FREEZE (`scripts/regress-r7ab.mjs`): R6 holdout 35/35, R5 24/24, profiles 16/16, simulations 14/14 identical (`startAuthority` is bookkeeping).
- **Evidence** (`probes/run-evidence-r7ab.mjs`): 78 runs, 0 failures, all on `36a71ca8…`. Of 77 compared with R7A-FINAL-FREEZE outputs, 68 are byte-identical and 9 differ, each named in `probes/COMPARE_R7AB_NAMED.json`:
  - QE-R7AF-01 fixed: P30, P30b, P30c;
  - §11: P37 E1, E2, E7;
  - Founder 0.1: P32 L4 unreviewed and the round-12 instrument's `O_returnStrength` never-logged case;
  - bookkeeping: R7-A final self-challenge, SSCTR items;
  - this mission's self-challenge.

  D59 first-week grid E = O = B = 0; P09 O1–O7 = 0; P31 identity V1/V2/V4/V5 = 0 at four time zones; P36 0 false confirmations.

**Next:** the single freeze (`scripts/freeze-r7ab.mjs`), the read-only verifier, then both re-checks in parallel on the same bytes.

## Resume point 3 — R7A-BOUNDARY-FINAL-FREEZE frozen; both re-checks dispatched (2026-10-28)

- **Freeze:** `CoachingCore/r7/boundary/RUNTIME_FREEZE_R7A_BOUNDARY.json`, revision R7A-BOUNDARY-FINAL-FREEZE, source digest `36a71ca84fb87789d8623e2050ac9e308a963400af86a3ba73a373043bbf186c`, file `3ebc9b02…`, policy `18ec48f3…` unchanged. Delta from R7A-FINAL-FREEZE: `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs`, `test/r6-adaptation.test.mjs` changed; `test/r7ab-week-start-authority.test.mjs` added. The 78 evidence runs ran on these source bytes (digest before and after each run).
- **Verifier** (`node CoachingCore/scripts/verify-r7ab.mjs`, read-only): 15/17. Open only `independent-reviews` and `deliverables`, as expected before the re-checks and closure. Its first run had a wrong run-count threshold in `evidence-runs-bound` (≥ 80 against the runner's 78 jobs); the check now names the exact job list. It is verifier tooling, not the frozen runtime.
- **Dispatched in parallel on R7A-BOUNDARY-FINAL-FREEZE** (claude-opus-5-5, effort xhigh): a fresh `quality-reliability-engineer` with `dossier/ENGINEERING_RECHECK_BRIEF_R7AB.md`, and the native `sports-science-concurrent-training-reviewer` (regression-only) with `dossier/SSCTR_RECHECK_DOSSIER_R7AB.md`. Outputs: `reviews/quality-engineering-r7ab-recheck.{md,json}` and `reviews/ssctr-r7ab-recheck.{md,json}`.
- **Rule:** no runtime or test edit from now on; no correction cycle (Founder §22). A material blocker from either judge closes the mission NOT_READY with `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`.

**Next:** read both re-checks. READY only if both accept R7A-BOUNDARY-FINAL-FREEZE. Then closure: readiness, report, disposition, queue append if any, the insert-only mission and ledger blocks, `verify-r7ab --write`, and the handoff only if READY.

## Resume point 4 — closed NOT_READY (2026-10-28)

- **SSCTR (R7AB-SSCTR-r1, native): ACCEPT** on R7A-BOUNDARY-FINAL-FREEZE (digest at start and end).
  - D53 closed; D56, D57, D58 and D59 hold.
  - S-A to S-F approved.
  - The 13 records re-bound.
  - Non-blocking NF-R7AB-1 (R40): the start is history only when both sports hold, so a strength-only shortfall in an unreviewed re-entry week also sends the run back to its entry.
  - Queue 175 → 187 (12 HQ-R7AB-SSCTR-* items, append-only, funding NOT_DECLARED; `QUEUE_INTEGRATION_R7AB.json`).
- **Engineering (R7AB-QE-r1, fresh `quality-reliability-engineer`): NOT_READY** on R7A-BOUNDARY-FINAL-FREEZE (digest at start and end).
  - QE-R7AF-01 is closed on its path. QE-R7AF-02 is closed (§11). Identity holds at four time zones. The judge's 47 re-runs are byte-identical to the recorded outputs.
  - **QE-R7AB-01 (MEDIUM, material, new manifestation of projected-vs-historical):**
    - outside a return, a weekly review records the next start as WEEK_EVIDENCE and carries, from the week's own start, every value its evidence did not move, even an unverified projection;
    - `historicalWeekStart` checks that base only inside a return;
    - reproduction: `reviews/qe-r7ab-P40-held-outside-return.mjs`, a never-lifted 22 kg reaching a first interruption (variants P40b, P40c, P41, P47b);
    - reproduced by the author byte for byte (`b76b8259…`), and present on R7A-FINAL-FREEZE too.
  - Non-material: QE-R7AB-02 (LOW) and QE-R7AB-03 (LOW, a §11 scope question for the Founder).
- **Consolidated:**
  - `CoachingCore/r7/boundary/READINESS_R7AB.json`: R7A_EXIT_READINESS = NOT_READY;
  - `FINAL_DISPOSITION.json`, with `notReadyRecord`;
  - report `CoachingCore/r7/boundary/FINAL_REPORT_R7AB.md`;
  - closed blocks in CURRENT_MISSION and MISSION_LEDGER (insert-only).
- **Not done, by rule:**
  - no runtime or test edit after the freeze;
  - no second freeze, correction cycle or new sub-phase;
  - no handoff (`CoachingCore/r7/R7A_FINAL_HANDOFF.md` not written);
  - R7-B0 and R7-B not started.

**Next:** `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`, the Founder's to take; not started. The decision is whether evidence authority is recursive on every week or recorded per value. Start from `CoachingCore/r7/boundary/FINAL_REPORT_R7AB.md` §8 and §11, and from `FINAL_DISPOSITION.json` `notReadyRecord`.
