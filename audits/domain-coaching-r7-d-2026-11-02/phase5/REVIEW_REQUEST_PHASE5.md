# R7-D Phase 5: request for the two independent reviews of the corrected candidate

**What is asked.** Two independent reviews, run in parallel by fresh instances, of the Phase 5 candidate before any freeze:
- **SSCTR** (sports science, concurrent training; nonclinical, PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY): the domain side of the three runtime corrections and of the public composition rules the author will read.
- **Quality / Reliability (QRE):** correctness, regressions, test and mutation adequacy, and the instruments of the new holdout (K03).

A pass from both lets `CoachingCore/scripts/freeze-r7d-6.mjs` create `R7D-FREEZE-6`. The Founder's rule for this cycle (`AUTHORIZATION_PHASE5.md`): at most one narrow runtime-or-instrument adjustment to a new finding of yours before the freeze; anything else closes R7-D `NOT_READY` with the blocker named. Name your blocking findings precisely, with the smallest change that closes each, or say that no narrow change exists.

**The candidate:** the commit that adds this file (its hash is in your dispatch message; `git log -1 --format=%H -- audits/domain-coaching-r7-d-2026-11-02/phase5/REVIEW_REQUEST_PHASE5.md`), on branch `claude/domain-coaching-r7-d` (worktree `.claude/worktrees/domain-coaching-r7-d`). Judge exactly those bytes. Its runtime is `CoachingCore/src` at that commit; `R7D-FREEZE-5` (record `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_5.json`, bytes of `cc0b56f`) is the baseline.

## 1. What changed

**Runtime** (3 files; no new number). Diff: `git diff cc0b56f <candidate> -- CoachingCore/src`.

| Item | Where | What |
|---|---|---|
| SSCTR-P4-F01 | `r6-adaptation.mjs` `returnStrength`, `modeOf`; `r6-program.mjs` `entryWeekOf`, `endReturnEntry`, `advanceStrength`, `buildWeek`, `slotEntries` | A moderate or long return sets `returnEntry` on the strength state. While it is set, a week is a return-entry week whatever exercises it uses (an exercise never executed before the break has no state to be at the entry step), so new exercises enter at `strengthEntrySets` with at least `strengthEntryMinimumRir`, are set up at return step 0 and follow the D49 steps with the normal count as ceiling; no block is credited for a return-step week. The marker ends when a week's transition (`advanceStrength`) leaves an exercise in use with a state: from then on the exercises in use carry their own return steps, and one not executed stays at the entry step, which keeps the next week an entry week; the facts read at a later break (`strengthAtBreak`) never end it. Rotation and the learning mode label read it too (the block boundary does not: a first version did, and that read was removed, since no test could pin it and FREEZE-5 behaviour stands there) |
| R7D-FC-01 | `r6-adaptation.mjs` `loggedLoads` | A band or assistance log (no kilogram, B0-C04) is evidence like a bodyweight one. Found while correcting F01: on R7D-FREEZE-5 a band row never progressed in a review (`band-row` 2x10 for ever while the bodyweight rows went 10→12→14→16), and after the F01 fix it would have repeated the return entry for ever |
| QRE-P4-F01 | `r6-composition.mjs` `unknownRunWindow`, new `creditDecides` | Root cause: the dependence test compared the entry-capped week with the uncapped week, both planned from the facts' start, which already reads unreported weeks at their held dose (the zero reading). A CONSOLIDATION week planned short by its phase equals the entry in both readings, so nothing was asked. Now the same week is also planned from the projected start (the credit reading, `CONDITIONAL_PLAN` only) with the window's unreported runs counted as run; if it plans any run longer, the dose depends on the unknown and the coach asks. A start anchored on evidence (intake, week evidence, a return's entry with its demonstration) is never credit |

**Tests** (suite 1014/1014): `CoachingCore/test/r7d-phase5.test.mjs` (T42–T47: the F13 shape, the W-D49 witness and control, the band row, the QRE witness grid, the no-ask controls, determinism and idempotence); `CoachingCore/test/r7d-phase4-cq41.test.mjs` (T39–T41 moved into the suite, QRE-P4-K04); one legacy assertion amended in `CoachingCore/test/r6-adaptation.test.mjs` (it required `FIRST_ESTABLISH` in a moderate return's entry week for exercises never performed: the defect itself, CND-2).

**Instruments for the new holdout** (all new files; the Phase 4 instruments, results and judgments are unchanged):
- `R7D-HARNESS-9`: `harness/r7d-harness-9.mjs`, `harness/lib/client-9.mjs`, `harness/lib/properties-9.mjs`, `harness/lib/metamorphic-9.mjs` (K03: QRE-P4-H01, -H02 and its P06 twin, -H03; substitution by pattern);
- validation 9: `harness/validation/build-dev-cases-9.mjs`, `DEV_CASES_R7D_9.json`, `run-validation-9.mjs`, `HARNESS_VALIDATION_R7D_9.json`;
- `harness/seal-final-2.mjs`; `author/INTERFACE_DELTA_R7D_8.md`, `author/AUTHOR_BRIEF_FINAL_R7D_8.md`, `author/check-corpus-8.mjs`;
- `PREREGISTRATION_R7D_8.md` (Δ47–Δ58);
- `CoachingCore/scripts/freeze-r7d-6.mjs`, `verify-r7d-6.mjs` (not run yet).

**Evidence** (`phase5/evidence/`, from `phase5/probes/`): `EVIDENCE_PHASE5.json` (suite, directed tests, RED on R7D-FREEZE-5: exactly T42–T45 fail, conformance R7-B/B.1/B.2), `MUTATION_PHASE5.json` (10 mutants of the runtime hunks, each killed by the whole suite against a 1014/1014 baseline; CQ4-1's QF3/QF7/QF6/QF0 killed by T39/T40/T41 inside the suite), `DIFFERENTIAL_PHASE5.json` (192 cases against R7D-FREEZE-5, every difference explained by F01, FC-01 or F02), `WITNESS_GRID_PHASE5.json` (both judges' grids re-run on both runtimes), `K03_PHASE4_UNITS.json` (the three Phase 4 gap units read by HARNESS-8 and HARNESS-9, development reading only).

## 2. Disclosures you must rule on

1. **Step-2 arithmetic (SSCTR).** With the normal count as ceiling and no unexecuted block credit, F13's return step 2 is 1 set for each exercise (normal 2). The Phase 4 SSCTR record illustrated 2, 2 and 1 from the planned counts that included the unexecuted credit (3, 3, 2). The candidate applies `strengthReturnSets` as written.
2. **Exercises executed in the entry week without a usable load** (a loaded `ESTABLISH` row reported with no load) are not set up (D52); once an exercise in use holds a state the marker ends, and such an exercise later starts as a first establishment under D55. Rule whether that path is inside D49/D55.
3. **R7D-FC-01** extends the correction to band and assistance rows everywhere (they now progress by repetitions in reviews). Rule whether that is inside B0-C04 and the F01 mandate.
4. **The question asks more often (SSCTR, QRE).** Any VALID decision with no run reported in the 30-day window, unreported elapsed runs and a projected start that plans more than the zero reading now asks. SSCTR-P4-O03 asked whether a long silence should trigger the question when the dose cannot depend on it; the candidate asks when the credit reading differs and not otherwise. Rule whether this is the SSCTR-SD-R7C-r2 semantics and whether any question it adds is repetitive or impossible to answer.
5. **The legacy assertion amendment** (`test/r6-adaptation.test.mjs`).
6. **K03's P06 twin (QRE).** H02's predicate also lives in P06's own-week check; validation 9 found it as a false P06 FAIL (a false SAFETY_BLOCKER) on DEV-65, and the Phase 4 SSCTR saw the same session in F21's P06 unit (SSCTR-P4-O04). Rule whether correcting it stays inside the Founder's K03 decision ("lacunas de instrumento comprovadas pelo julgamento anterior").
7. **W-CARRIER retired (QRE):** the probe now carries the clearance; W-CARRIER9 and W-CARRIER9b replace it, and the CARRIER_CLINICAL sensitivity rows stay detected.
8. **Interface 8 composition rules (both).** They describe the plan as an athlete sees it (optional sessions, race-week composition, when the question comes). The instrument owner checked them against the candidate (validation 9 reachability). Rule whether they leak runtime output or implementation beyond a product description, and (SSCTR) whether they are true to the domain.

## 3. Questions for each reviewer

**SSCTR:** (a) does the candidate apply D49 and `strengthEntryWeek` to exercises never executed before a moderate or long break, with no credited progression, while exercises with a valid history are unchanged (W-D49-B, the differential); (b) is FC-01's band progression correct and bounded; (c) does the run side stay unchanged by the strength fix and is the run-strength coordination intact; (d) is the QRE-P4-F01 behaviour the accepted unknown-training semantics; (e) the disclosures 1–4 and 8; (f) any SCIENTIFIC_BLOCKER, UNSAFE step or number added.

**QRE:** (a) correctness and causality of the three runtime changes, and regressions (suite, differential, conformance); (b) determinism, idempotence and retroactive corrections on the changed paths; (c) the adequacy of the directed tests and the mutation evidence (any hunk not pinned, any RED that is not the defect); (d) K03: do H01, H02, H03 and the P06 twin remove only the false FAILs, return the units NOT_EVALUABLE and change no other reading (instrumentFix9, the K03 units, validation 9's sensitivity rows and witnesses); (e) the client change, the advisory checker, the seal, the freeze and verifier scripts, and PREREG-8 against PREREG-1 §3, §8 and §9; (f) whether the author can reach every registered coverage item through INTERFACE-8 and brief 8 without runtime output; (g) disclosures 4–8.

## 4. How to work

- You are a fresh instance. You did not write the runtime, the harness or the instruments, and you will not author or judge the new holdout.
- Read what you need under the worktree. Do not open `final/` cases to grade them again: `final/` is the spent Phase 4 holdout (you may read its two judgment records and its intakes as the probes do).
- Run anything read-only. Build any runtime copy into a **new, uniquely named** directory under your scratchpad. **Never delete anything recursively** (no `rm -rf`, no recursive `fs.rmSync`); leftover scratch costs nothing. Never run `npm run verify` or any `verify-r*` script with `--write`, never run `--first-evaluation`, and never write under `final/`.
- Write only in your own folder: `phase5/reviews/ssctr/` (SSCTR) or `phase5/reviews/engineering/` (QRE), as new files, including any probes you keep (`probes/`). Do not commit; the coordinator commits your folder as you leave it.
- Your record: one JSON and one short MD.
  - SSCTR: `phase5/reviews/ssctr/SSCTR_PHASE5_REVIEW_R7D.json` with `recordId`, `candidate` (the commit you judged), `disposition` (`ACCEPT`, `ACCEPT_WITH_CONDITIONS` or `BLOCK`), `findings` (id, class, evidence, blocking), `conditions`, `conditionsForFreeze`, `disclosureRulings`, `literature` (what you read and how), `proposedHumanRevalidation` (proposed only; the queue is not appended in this phase).
  - QRE: `phase5/reviews/engineering/QUALITY_PHASE5_REVIEW_R7D.json` with `recordId`, `candidate`, `verdict` (`READY`, `READY_WITH_CONDITIONS` or `NOT_READY`), `findings`, `conditions`, `conditionsForFreeze`, `disclosureRulings`, `reproduction` (what you ran).
- Report back in a few lines: your disposition or verdict, blocking findings with the smallest change, and conditions.
