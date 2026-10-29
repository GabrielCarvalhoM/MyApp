# DOMAIN_COACHING_R7-A Final Closure — checkpoint

Read [TASK_CONTRACT.md](TASK_CONTRACT.md) first. Each resume point is appended; earlier ones are not edited.

## Resume point 1 — rehydrated, baseline reproduced and bound (2026-10-28)

- **Rehydrated:** AGENTS.md, CLAUDE.md, CURRENT_MISSION.md (R7-A.2 closure block), MISSION_LEDGER.md; `CoachingCore/r7/a2/FINAL_REPORT_R7A2.md`, `audits/domain-coaching-r7a2-2026-10-28/FINAL_DISPOSITION.json`, `CHECKPOINT.md`, `TASK_CONTRACT.md`, `INTERRUPTION_CONTRACT.md`; the engineering re-check (R7A2-QE-r1) and its probes P17, P19, P20, P21; the SSCTR re-check (R7A2-SSCTR-r1: S-A to S-H, NF-1, R37); runtime `src/r6-adaptation.mjs` (identity, state at the break, return), `src/r6-composition.mjs` (easy slot), `src/r6-program.mjs` (`strengthAtBreak`); `test/r7a2-interruption.test.mjs`.
- **Baseline (§4), before any edit:** R7A2-FREEZE-1 digest recomputed `e0637ec2…` (0 of 79 drift; policy `18ec48f3…`); `verify-r7a2.mjs` read-only 19/19; `node --test` 519/519; P17, P19, P20 and P21 byte-identical to the judge's outputs (same week: B read as A, six rows at the pre-break dose and a 70-minute long run; cross week: B read as A; P20 week 4 Tuesday THRESHOLD 41; P21 B merged into A). Outputs in `probes/baseline/`.
- **Bound:** `CoachingCore/scripts/prepare-r7af.mjs` wrote `BASELINE.json` (1,952 files) and `freeze1-source/` (79 files).

**Next:** the model (identity, state at the start, same day, late evidence), the contract, the tests; then self-challenge, mutation, regression and evidence; then the single freeze.

## Resume point 2 — model, contract and tests built; self-challenge clean (2026-10-28)

- **Runtime delta** (only `src/r6-adaptation.mjs`): `episodesOf` (episodes, reports, report in force, first report), `interruptionEpisode` (explicit `episodeId` → replay KEEP → same-days duplicate → new after re-entry or training → ASK), `stateAtBreak` (the report in force at the start by report time; a late-reported earlier break; earned week starts after a return; first-day sessions read both ways), `returnStrength`, `staleReturn` (late evidence asked while the return sets the plan), `returnAfterPause` (validation of `episodeId`/`startedAt`, replay, same-day materiality by planned rows, the recorded episode fields). Policy unchanged.
- **Contract:** [INTERRUPTION_EPISODE_CONTRACT.md](INTERRUPTION_EPISODE_CONTRACT.md) (R7AF-INTERRUPTION-1).
- **Tests:** new `test/r7af-episode-identity.test.mjs` (9); earlier tests whose meaning the Founder's decisions changed, edited in place and marked `R7-A final`: `r7a1-composition` C4/C6, `r7a2-interruption` I2, I9, I4/I6 and the three-break correction. `node --test` 528/528.
- **Judge probes on the candidate:** P17 0 pre-break rows (B NEW from A's re-entry in every case); P19 0 violations in 48 cells (the week-6 cells no longer read the assumed week start); P20 B's own slot; P21 B separate (TRAINING_BETWEEN).
- **Self-challenge** (`probes/r7af-self-challenge.mjs`, 42 cases, 15 classes): 0 violations on the candidate, 50 on R7A2-FREEZE-1. Its first run found 3 flags, all oracle over-reach (a reviewed week legitimately decides a later start; a practice-only first-day session does not change the plan), tightened to the declared rules.
- **Design decisions found during the build** (recorded in the contract): same-day materiality is judged on planned rows, not raw state (the judge's own scenarios have a session on the stated first day); the earned-start rule applies only after a return (applied to a first break it would reopen R6-era outputs on never-logged programs).

**Next:** mutation of the new invariants, regression against R7A2-FREEZE-1, the evidence runs on the final candidate, then the single freeze.

## Resume point 3 — mutation, regression, informative evidence; one more class found and fixed before the freeze (2026-10-28)

- **Mutation** (`probes/mutation-check-r7af.mjs`, new invariants only): first run 15/20; the five survivors were untested corners (re-entry read from the latest report with no training between; named corrections of an earlier break that move past or reach back; a correction moved after its own first report; a late first-day log). Tests added for each; then 20/20, and 21/21 after the same-day change below.
- **Regression** against R7A2-FREEZE-1 (`scripts/regress-r7af.mjs`): R6 holdout 35/35, R5 24/24, profiles 16/16, simulations 14/14 identical.
- **Informative evidence run** (archived in `probes/informative-run-1/`, not bound): every judge, SSCTR and author output byte-identical to its R7A2-FREEZE-1 output except the expected ones (P02, P09 step counts, P17–P21, SSCTR probe S5, SSCTR items SE and same-day grid, composition probe E14, the R7-A.1 handler grids, the R7-A.2 self-challenge's unnamed corrections), each traced to a Founder decision or to the blocker fix.
- **Found by that run and fixed before the freeze:** same-day materiality judged on the *planned rows* depended on the plan in force when the return was decided, so a schedule or event change on the same evening changed whether the return asked (the R7-A.1 evening grid: `SCHEDULE_MINUTES × RETURN_MODERATE` days 2 and 5, `RETURN_SHORT × EVENT_REACHING` day 1). Materiality is now judged on the state at the break: the two readings differ materially when they differ in anything but a last performed date (contract §4). The grid's three pairs are gone; the self-challenge gained an immaterial case (43 cases, 0 violations; 51 on R7A2-FREEZE-1).
- **Tests on R7A2-FREEZE-1:** 8 of the 9 new tests fail; the P3 test passes there too (R7-A.2 already kept the first break's record when reports came in order).

**Next:** the bound evidence run on the final candidate (`probes/run-evidence-r7af.mjs`), the comparison and its named differences, then the single freeze, the verifier and both re-checks in parallel on the same bytes.

## Resume point 4 — R7A-FINAL-FREEZE frozen; both re-checks dispatched (2026-10-28)

- **Bound evidence** (`probes/run-evidence-r7af.mjs`, 59 runs, 0 failures, source digest `ec2debe7…` before and after every run): 41 outputs byte-identical to their R7A2-FREEZE-1 outputs; 16 differ, each named in `probes/COMPARE_R7AF_NAMED.json` (Founder 0.4/0.8/0.7 or the blocker fix); none unnamed. D59 first-week grid, restoration grid, cap grids, short grid, D58 readings, first-week extension, rotation, ceiling, traces, D56 grid, three-step, D58 combinations, P13, P14, P01–P08, P10, P15, P16: byte-identical. P09: 5,000 sequences, 0 errors, O1–O7 = 0.
- **Freeze:** `CoachingCore/r7/final/RUNTIME_FREEZE_R7A_FINAL.json`, revision R7A-FINAL-FREEZE, source digest `ec2debe730df8931d1525f2b1a729ce3d808c08842fb75397d2fc91084294605`, file `a5f07a3f…`, policy `18ec48f3…` unchanged. Delta from R7A2-FREEZE-1: `src/r6-adaptation.mjs`, `test/r7a1-composition.test.mjs`, `test/r7a2-interruption.test.mjs` changed; `test/r7af-episode-identity.test.mjs` added.
- **Verifier** (`node CoachingCore/scripts/verify-r7af.mjs`, read-only): 16/18; open only `independent-reviews` and `deliverables`, as expected before the re-checks and closure.
- **Dispatched in parallel on R7A-FINAL-FREEZE** (claude-opus-5-5, effort xhigh): a fresh `quality-reliability-engineer` with `dossier/ENGINEERING_RECHECK_BRIEF_R7AF.md`, and the native `sports-science-concurrent-training-reviewer` (regression-only) with `dossier/SSCTR_RECHECK_DOSSIER_R7AF.md`. Outputs: `reviews/quality-engineering-r7af-recheck.{md,json}` and `reviews/ssctr-r7af-recheck.{md,json}`.
- **Rule:** no runtime or test edit from now on; no correction cycle (Founder §17). A material blocker from either judge closes the mission NOT_READY with `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`.

**Next:** read both re-checks; READY only if both accept R7A-FINAL-FREEZE. Then closure: readiness, report, disposition, queue append if any, the insert-only mission and ledger blocks, `verify-r7af --write`, and the handoff only if READY.

## Resume point 5 — closed NOT_READY (2026-10-28)

- **SSCTR (R7AF-SSCTR-r1, native): ACCEPT** on R7A-FINAL-FREEZE (digest at start and end, 0 of 80 files drift). D53 closed; D56, D57, D58 and D59 hold (grids byte-identical to R7A2-FREEZE-1); F-A to F-F approved (F-C resolves NF-1, F-D implements R37); 13 records re-bound; non-blocking NF-R7AF-1 (R38) and NF-R7AF-2 (R39). Queue 163 → 175 (12 HQ-R7AF-SSCTR-* items, append-only, funding NOT_DECLARED; `QUEUE_INTEGRATION_R7AF.json`).
- **Engineering (R7AF-QE-r1, fresh `quality-reliability-engineer`): NOT_READY** on R7A-FINAL-FREEZE (digest at start and end).
  - **Identity: no failure** in 216 order/timing cells at four time zones, three-break short-return grids, duplicates and named cases. QE-R7A-01, QE-R7A1-09, QE-R7A1-10, QE-R7A2-01, 02 and 03 CLOSED.
  - **QE-R7AF-01 (MEDIUM, material, new class):** after a return whose re-entry week was neither finished nor reviewed, any unrelated decision dated after that week (an equipment statement, a systemic-fatigue report) makes the earned-week predicate (`src/r6-adaptation.mjs:674`) accept the week start the return stored, so a separate later break starts from a return step never executed. On R7A2-FREEZE-1 every cell gives that same output. Reproduction `reviews/qe-r7af-P30c-reproduction.mjs`, grid `qe-r7af-P30b-earned-week-grid.mjs`; reproduced by the author byte for byte (`8dfa53db…`).
  - Non-material: QE-R7AF-02 (MEDIUM, a named correction moved past its own executed re-entry), QE-R7AF-03 (LOW, pre-existing), QE-R7AF-04 (LOW). Boundaries B1–B6 accepted.
- **Consolidated:** R7A_EXIT_READINESS = NOT_READY (`CoachingCore/r7/final/READINESS_R7AF.json`, `FINAL_DISPOSITION.json` with `notReadyRecord`); report `CoachingCore/r7/final/FINAL_REPORT_R7AF.md`.
- **Not done, by rule:** no runtime or test edit after the freeze; no second freeze, correction cycle, A.3.1 or third judge; no handoff (`CoachingCore/r7/R7A_FINAL_HANDOFF.md` not written); R7-B0 and R7-B not started.

**Next:** `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`, the Founder's to take; not started. Start from `CoachingCore/r7/final/FINAL_REPORT_R7AF.md` §13 and `FINAL_DISPOSITION.json` `notReadyRecord`.
