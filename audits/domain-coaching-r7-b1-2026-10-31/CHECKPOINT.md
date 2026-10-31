# R7-B.1 checkpoint

2026-10-31 · branch `claude/domain-coaching-r7-b1` (worktree `.claude/worktrees/domain-coaching-r7-b1`, from the R7-B closure `4230034d8819eb384c393a921db7eb3938c3440c`). Status: **IN PROGRESS — runtime fixes done, evidence and freeze next.**

## Baseline (verified)

- R7-B closure `4230034` is on `claude/domain-coaching-r7-b` and contains `CoachingCore/r7/b/R7B_CLOSURE_HANDOFF.md`; `c66966e` and `10b26d6` are its ancestors. The R7-B branch existed only locally; it was pushed unchanged over SSH and the remote ref equals `4230034d8819eb384c393a921db7eb3938c3440c`. Nothing merged.
- The Founder's main checkout was clean and was not touched; this mission runs in its own worktree. `CoachingCore/node_modules` installed in the worktree from the lockfile (`npm ci`).
- FREEZE-2 integrity: `node scripts/verify-r7b.mjs --freeze 2 --tests` (read-only) → 20/20 PASS, 733/733 tests, source `d2c73014…`, manifest `d509452e…`; no file written.
- All four blockers reproduced on FREEZE-2 with the judges' scenarios (N1, N1b, N3, N7a–d; SSCTR r06: 18 of 20 event-week substitutions brought a never-performed exercise).

## Runtime changes (smallest change per blocker)

| Blocker | Change |
|---|---|
| QE-R7B-R2-02 | `evaluateProgram`: both block-choice questions pass through `withFactualReplan`; a factual question keeps precedence. |
| QE-R7B-R2-01 | `finishProposal` copies or removes `noviceTemplates` when the change states them; `rebuild` and both equipment-change proposals state them. |
| QE-R7B-R2-03 | `buildTemplates`: the fallback for a configuration set aside for SKILL_MISMATCH follows the reason (rung below, nearest first, or lower skill; never above the substitute in use); with none the slot is unfilled (`asideGaps`) and the equipment change or substitution asks (`skillMismatchGap`). |
| QE-R7B-OBS-04 | `strengthRowsFor`: on TAPER, RACE_WEEK and POST_EVENT days a slot placed by a reason-based substitution whose configuration this program has not performed takes an admissible, already-performed stand-in or is left out (`eventStandIns` on the session); the substitution discloses it (`NO_NEW_EXERCISE_IN_EVENT_WEEKS`). |
| QE-R7B-01 residual (QE-R7B-R2-04) | `exerciseSubstitution`: candidates in the reason's order (SKILL_MISMATCH walks the ladder down nearest first); a candidate that cannot take every template slot of the replaced exercise is skipped (`slipsFrom`); a named one is asked about. |

Not changed (recorded, not fixed): QE-R7B-R2-05 (only when an elapsed week gets no review at all: the R18 contract path, excluded by request §9; with the week reviewed, even with nothing reported, the cap holds); QE-R7B-R2-OBS-01 and QE-R7B-OBS-01…03 (observations routed to a later runtime mission).

## Tests

`test/r7b1-residual-closure.test.mjs` (22 tests, plan-level, with the weekly reviews after the deciding review): RED on FREEZE-2 for every blocker test (15 of 18 at first run; the 3 preservation tests green), GREEN after the fixes. Full suite 755/755 (733 unchanged + 22 new; no existing test changed).

## Judge probes re-run on the new bytes (from a temporary mirror; the committed probe folders are untouched)

Engineering recheck probes: N1, N1b, N3, N5, A10, A13, N7a–c, N7d, N8-N1 FAIL → PASS; no PASS → FAIL. Still failing as on FREEZE-2: A3b and A11 (judged non-findings by the judge), B3, B6, C8, C8b (QE-R7B-OBS-01…03, routed), N2 (QE-R7B-R2-05), N6 (QE-R7B-R2-OBS-01).

## Next

SSCTR recheck probes before/after; R7-B.1 adversarial probes (request §12); timeline differential against FREEZE-2; mutation; conformance delta; freeze R7B1-FREEZE-1; review requests; independent SSCTR and Engineering gates; Quality inheritance assessment; closure, commit, push.

## Rules for any later session

Never run `npm run verify` or any closed `verify-r*` script with `--write`. Never edit the policy, the B0 catalog/schema/foundation, the B0 r2 records or closed evidence (R7-B's probe `out/` folders included: re-run judge probes only from a temporary mirror). Mission/ledger are insert-only (`append-block.mjs`).
