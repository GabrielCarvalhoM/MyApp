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

## Correction cycle (R7B1-FREEZE-2, request §17)

**No existing test was changed, removed or skipped.** The 733 tests of R7B-RUNTIME-REPERTOIRE-FREEZE-2 and the 29 tests of `r7b1-residual-closure.test.mjs` pass unchanged on the corrected runtime.

**Added:** `CoachingCore/test/r7b1-correction-cycle.test.mjs`, 24 tests, one group per finding of the reviews of R7B1-FREEZE-1 that the cycle closes:

| Group | Tests | Finding |
|---|---|---|
| QE-R7B1-01 | 4 | Engineering MAJOR: pain or illness with any block choice routes to a human and proposes nothing; an unrecognised choice with a correction asks and keeps the factual re-plan; one preservation test |
| QR7B1-01 | 3 | Quality MAJOR: the no-lower-skill question names only missing equipment and its options act (confirm with the slot left out; nothing harder through later reviews; a gap already held is not asked again) |
| QR7B1-02 | 8 | Quality MAJOR, with R7B1-SSCTR-F11: nothing never performed enters the event weeks whatever placed it (four rotation witnesses, an equipment change, a rebuild with a stand-in); rotation slots take the selected exercise; one preservation test (profile E) |
| QR7B1-03 | 2 | Quality MINOR: naming another exercise is offered only when one would take the place |
| QR7B1-04 | 3 | Quality MINOR, with the review half of R7B1-SSCTR-F12: the review that keeps a slot out discloses it; two preservation tests |
| QR7B1-05 | 3 | Quality observation: a program that ends with the post-event week says so (option, event-week note, rest text) |
| Week-level slot test | 1 | Preservation: a capped novice's substitution is applied when its full session moves to another day |

On the R7B1-FREEZE-1 bytes (`git archive d41df8b`, with the audit inputs the runtime reads) the 19 finding tests fail and only the 5 preservation tests pass.

**Scripts:** `scripts/mutate-r7b1.mjs` runs both R7-B.1 test files, carries the four fragments the cycle moved (M26, M33, M35, M40) and adds one mutant per branch of the cycle (M41–M57). `r7/b1/CONFORMANCE_R7B1_DELTA.json` is revision 2. `scripts/freeze-r7b1-2.mjs` is new and `scripts/verify-r7b1.mjs` takes `--freeze 1|2`. The adversarial probe is unchanged and writes `out/adversarial-R7B1-2.json` for FREEZE-2.
