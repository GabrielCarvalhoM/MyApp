# R7-B.1 — test changes

**No existing test was changed, removed or skipped.** The 733 tests of R7B-RUNTIME-REPERTOIRE-FREEZE-2 pass unchanged on the R7-B.1 runtime.

**Added:** `CoachingCore/test/r7b1-residual-closure.test.mjs` — plan-level tests for the residual blockers, each running the weekly reviews after the deciding review where the blocker showed only there:

| Group | Tests | Blocker |
|---|---|---|
| R2-02 | 6 | QE-R7B-R2-02 (the block-choice question keeps the factual re-plan; no stale-state resurrection; one preservation test) |
| R2-01 | 4 | QE-R7B-R2-01 (stored novice templates survive later reviews) |
| R2-03 | 5 | QE-R7B-R2-03 (the SKILL_MISMATCH fallback never climbs; asks without a lower option; one preservation test) |
| QE-R7B-01 residual | 4 | QE-R7B-R2-04 (the plan prescribes what the decision selects in every slot) |
| OBS-04 | 10 | QE-R7B-OBS-04 (no never-performed exercise in the event weeks; stand-ins; disclosure; two preservation tests) |

On the FREEZE-2 bytes (`git archive 10b26d6`) every blocker test fails and only the preservation tests pass: the R2-02 off-boundary question without a correction, the knock-on slot applied, the clinical screen first, and a substitute performed before the taper kept. The exact counts are in the freeze record (`CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json`, `tests`).

The fixtures are the R7-B ones (`CoachingCore/r7/b/fixtures/helpers.mjs`), unchanged.
