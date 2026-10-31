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

## Evidence so far (paused here: session usage limit, 2026-10-31)

- Two corrections made after the first commit: the SKILL_MISMATCH fallback direction applies only to the replaced exercise's own slots (`ownSlot` in `buildTemplates`). Applied to knock-on slots, it had produced two false ASKs and one lower-skill knock-on pick versus FREEZE-2. The substitution's candidate order stays FREEZE-2's (`ladderPrevious`, then the pool), only iterated. A stand-in test was added (23 tests in the file).
- SSCTR recheck probes, FREEZE-2 vs R7-B.1: 17 of 20 byte-identical (dose sweep, graduation, bouts, return interplay, hybrid content, strides, calf, claims scan, disclosures). r03/r04 differ only by the F9 fix (weeks 2–4 capped as their state says); r06 is OBS-04 (rerun r06 on the final bytes).
- `scripts/regress-r7b1.mjs` (timeline differential vs `10b26d6`, last run on the final bytes): PRESERVE 98/98 timelines identical. Blocker paths changed as expected (OBS-04 12, R2-01 3, R2-02 2, R2-03 2). Substitution grid: 184 decisions, 138 applied on both, inconsistent 8 → 0, changed exactly those 8. Envelope findings 0.
- One item still to classify: two `runRises` in `R2-02:graduation-decline`, week 4. The longest run goes 34 → 35 while weekly minutes drop 89 → 80 and quality 1 → 0, which looks like the withdrawn threshold session becoming an easy run. Confirm it, then refine the script's run check so that an easy run replacing a withdrawn quality session is not counted as a rise.

## Resumed (after the usage-limit pause)

- Run item classified. The differential's R2-02 cross-check shows R7-B.1's question carries exactly FREEZE-2's correction-alone re-plan (the path the SSCTR approved in r02), and the next three weekly reviews are identical. `regress-r7b1.mjs` → **PASS**: PRESERVE 98/98 identical, grid inconsistent 8 → 0, envelope 0, run rises 0.
- Suite 756/756 on the final bytes; SSCTR r06 0/20; r03/r04 unchanged.
- Adversarial probes (`probes/adversarial-r7b1.mjs`): R7-B.1 3,212 checks, **0 failed** (P1 counts 105 projection-only appearances: a substitute planned in the last SPECIFIC week shows in the decision's projected taper; the review of that week re-plans from evidence and leaves it out). FREEZE-2: **445 failed** across all five grids. Two over-strict probe properties were corrected before this result: projected weeks are counted, not judged; the history-vs-plan cap check is skipped for day-count changes, where the R7-A HISTORY and PLAN readings differ by design.
- Tests: 29 in the R7-B.1 file. Five were added for fix branches without a test, and one more for M38 (below). On FREEZE-2 every blocker test fails and only the preservation tests pass.
- Mutation `scripts/mutate-r7b1.mjs`: **15/15 killed**. M38 (the stand-in's SKILL_MISMATCH direction) first survived; it was a test gap, now closed by the kb-row/one-arm-db-row test. `scripts/mutate-r7b.mjs` on the new bytes is running.
- Conformance `conformance-r7b.mjs` PASS (301); delta matrix `r7/b1/CONFORMANCE_R7B1_DELTA.json` with `scripts/conformance-r7b1.mjs`.
- Written: `r7/b1/BLOCKER_CLOSURE_R7B1.md`, `r7/b1/README.md`, `TEST_CHANGES_R7B1.md`, `scripts/freeze-r7b1.mjs`, `scripts/verify-r7b1.mjs`.

## Freeze

- **R7B1-FREEZE-1** — record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json`, freeze commit `d41df8b129495e32fe2923087d665798854609e9`, source `976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9`, manifest `2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b`, 112 files. Suite 762/762; conformance PASS and delta PASS; intake differential vs FREEZE-2 0 changed; timeline differential PASS; adversarial 3,212/0; mutation 15/15 and R7-B 24/25 (M13 equivalent). `node scripts/verify-r7b1.mjs --tests --write` → 24/24 PASS (`r7/b1/VERIFICATION_R7B1_1.json`).
- Quality: a narrow review is requested, not inherited. The delta adds user-facing decision outputs and changes some substitution choices. The R7-B Quality probes from mirrors: 21 of 22 outputs identical; reachability through reviews 66 → 67 configurations.

## Next (in order)

1. Dispatch the SSCTR, Engineering and Quality judges (one review each, in parallel, own output folders, no in-place mutation scripts).
2. Read the verdicts; at most one correction cycle for a narrow blocker created by R7-B.1's own correction (then a new freeze and a narrow recheck); otherwise close.
3. Closure records, queue integration if the SSCTR approves records, insert-only closed blocks, memory, commit, push, remote HEAD check.

## Reviews of R7B1-FREEZE-1 (committed at `2e874f1`)

- SSCTR (`aa802176c57dcc4d3`, R7B1-SSCTR-r1): **ACCEPT_WITH_CONDITIONS**. OBS-04 met; F11 (MODERATE, inherited: equipment-forced event-week substitutes), F12 and F13 (MINOR) routed; seven records APPROVE_WITH_CONDITIONS bound to FREEZE-1.
- Engineering (`a3bb1922f1384fa4f`, R7B1-ENG-r1): **NOT_READY**. QE-R7B1-01 MAJOR (a block choice skipped the clinical screen; R7-B.1's R2-02 fix gave it a prescription); QE-R7B1-02/-03 MINOR, pre-existing.
- Quality (`a2cd5f24b68eb2a47`): **NOT_READY**. QR7B1-01 MAJOR (the no-lower-skill question is a dead end; created by the R2-03 fix); QR7B1-02 MAJOR (rotation and rebuilt slots bring never-performed configurations into the event weeks); QR7B1-03/-04 MINOR; QR7B1-05..07 observations.

## Correction cycle (request §17; the only one)

- Pre-freeze commit `dec8397`: runtime (`src/r6-adaptation.mjs`, `src/r6-program.mjs`), `test/r7b1-correction-cycle.test.mjs` (24 tests: 19 RED on FREEZE-1, 5 preservation), mutation probe M41–M57 (32 R7-B.1 mutants), delta matrix revision 2, `scripts/freeze-r7b1-2.mjs`, `scripts/verify-r7b1.mjs --freeze 1|2`, records appended (`BLOCKER_CLOSURE_R7B1.md` C1–C6, `TEST_CHANGES_R7B1.md`).
- Closed in the batch: QE-R7B1-01, QR7B1-01, QR7B1-02 (with SSCTR F11), QR7B1-03, QR7B1-04 (with the review half of F12), QR7B1-05. Routed: F12 decision-time half, F13, QE-R7B1-02/-03, QR7B1-06/-07, Engineering observations.
- Verified on the pre-freeze bytes: suite 786/786; intake differential 83/83 identical; timeline differential PASS (PRESERVE 98/98, grid 8 → 0); adversarial 3,228 checks, 0 failed; Quality q03 statuses identical, q09c slots not taken 12 → 0; SSCTR s02 94 → 0; Engineering J1b 16/16 clinical.
- A prototype slip check keyed on session ids made 46 false questions for capped novices (q03 41 → 87); it was keyed on the week before porting.
- `integrate-queue-r7b1.mjs` now binds the latest R7-B.1 freeze record (FREEZE-2 once it exists).

## Next (in order, after the cycle)

1. Mutation probes read-only, then `scripts/freeze-r7b1-2.mjs` → commit → `verify-r7b1.mjs --tests --write` → commit → push.
2. One narrow recheck per gate by the same judges (SendMessage), outputs under `reviews/*/recheck/`; request files in `reviews/*_RECHECK_REQUEST.md`.
3. Close: if a blocker remains, R7B_RUNTIME_REPERTOIRE_READY = NO; never V1_COACHING_AUTHORITY_READY = YES. Closure records, queue integration only if the SSCTR approves records bound to FREEZE-2, insert-only closed blocks, memory, commit, push, remote HEAD check. Stop; no R7-C.

## Closed — 2026-10-31 (CLOSED NOT_READY with one explicit blocker)

- Rechecks on R7B1-FREEZE-2 (committed at `80602bd`): SSCTR **ACCEPT_WITH_CONDITIONS** (R7B1-SSCTR-r2, seven records re-bound to FREEZE-2); Engineering **NOT_READY** (QE-R7B1-04 MAJOR, pre-existing: R7-A's late-evidence question precedes the substitution's clinical screen in a return's re-entry week; reproduced by the author from a mirror); Quality **READY**.
- R7B_RUNTIME_REPERTOIRE_READY = NO; V1_COACHING_AUTHORITY_READY = NO; one correction cycle consumed of one; no further cycle.
- Queue 223 → 230 (seven HQ-R7B1-SSCTR-* items, append-only; `QUEUE_INTEGRATION_R7B1.json`).
- Closure records: `FINAL_DISPOSITION.json`, `CoachingCore/r7/b1/R7B1_CLOSURE_HANDOFF.md`, insert-only closed blocks in CURRENT_MISSION.md and MISSION_LEDGER.md.
- Next: a narrow runtime mission with QE-R7B1-04 first, on its own Founder authorization. R7-C not started.
