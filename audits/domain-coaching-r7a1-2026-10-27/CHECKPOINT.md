# DOMAIN_COACHING_R7-A.1 — checkpoint

Read [TASK_CONTRACT.md](TASK_CONTRACT.md) first. Each resume point is appended; earlier ones are not edited.

## Resume point 1 — rehydrated, baseline captured, equivalent paths confirmed (2026-10-27)

- **Rehydrated:** AGENTS.md, CLAUDE.md, CURRENT_MISSION.md (R7-A closure block, VWS r2 scope), MISSION_LEDGER.md (R7-A entries); `CoachingCore/r7/FINAL_REPORT_R7A.md`, `READINESS_R7A.json`, `CLASS_DISPOSITIONS_R7A.json` (invariants); R7-A `FINAL_DISPOSITION.json`, `TASK_CONTRACT.md`, `CHECKPOINT.md`; both re-checks (`reviews/quality-engineering-r7a-recheck.md`, `reviews/ssctr-r7a-recheck.md`) and the judges' probes P1–P8 and the SSCTR D56 section. Runtime read: `r6-adaptation.mjs` (all handlers), `r6-program.mjs` (strength state machine, `buildWeek`, `projectWeeks`, `validateWeeks`, `skeletonOf`), `r6-provenance.mjs`.
- **Baseline:** the runtime is R7A-FREEZE-2 (75/75 files, digest `f56ae974…`, policy `18ec48f3…`); `node --test` 476/476 (Node v24.19.0). Judge probes P1–P6 rerun: byte-identical to the judges' outputs (P6 differs only in its temp folder path). `scripts/prepare-r7a1.mjs` wrote `BASELINE.json` (1,266 files) and `freeze2-source/` (75 files).
- **Equivalent paths:** `probes/r7a1-composition-probes.mjs` on the FREEZE-2 snapshot (`*.BEFORE.out.json`): E01, E02, E03, E04, E06, E10, E11, E12, E13, E14 and D56 all defective. Classes in TASK_CONTRACT.md.
- **Native SSCTR type:** not in this session's agent list; the documented fallback (fresh default instance loading the adapter, constitution and skill) will be used and labelled.

**Next:** the composition contract (`WEEK_COMPOSITION_CONTRACT.md`), then the structural fix with tests, regression, R7A1-FREEZE-A1.

## Resume point 2 — build complete, evidence regenerated, freeze pending the mutation result (2026-10-27)

- **Runtime delta** (against `freeze2-source/`, `dossier/RUNTIME_DELTA_R7A1.diff`): new `src/r6-composition.mjs` (213 lines) and `test/r7a1-composition.test.mjs` (19 tests); changed `src/r6-adaptation.mjs`, `src/r6-program.mjs`, `src/r6-provenance.mjs` and one scenario of `test/r7a-semantic-core.test.mjs` (C11). Policy `18ec48f3…` unchanged.
- **Paths beyond the starting set**, found by the author before the freeze and fixed in the build: twelve (brief, "Twelve more paths"). They came from whole-plan grid comparison, the later-statement check, the evening grid on every day and the mutation survivors. Contract updated (C1–C5).
- **Evidence on the final code:**
  - `node --test` 495/495.
  - Composition probes: 11/11 clean (all defective on FREEZE-2).
  - Monday grid: 157 pairs, 0 defects (FREEZE-2 84).
  - Evening grid (Tuesday to Sunday): 1,188 pairs, 0 defects (FREEZE-2 384).
  - Expected pairs are checked, not assumed. Representation-only pairs are listed, and the three-step probe shows 172 sequences with 0 differences.
  - D56 grid: 0/196 (FREEZE-2 54/70).
  - SSCTR instrument: equal to the R7-A CYCLE2 output except one named value (S9).
  - Regression explained in `verify-r7a1.mjs`: against FREEZE-2, R6 holdout 30/35, simulations 13/14, R5 24/24, profiles 16/16.
- **Mutation:** a full run of 73 mutants on the final code was in progress (`probes/mutation-check-r7a1.out.json`). A targeted run of the 16 new or earlier-surviving mutants caught all 16.
- **Dossiers:** `dossier/ENGINEERING_REVIEW_BRIEF_R7A1.md` and `dossier/SSCTR_DOSSIER_R7A1.md`. The placeholders `@@DIGEST@@`, `@@TESTS@@`, `@@MUTATION@@` and `@@SURVIVOR@@` are filled after the freeze.

**Next:** read the mutation result (a test for any undocumented survivor), then `node CoachingCore/scripts/freeze-r7a1.mjs R7A1-FREEZE-A1`, fill the placeholders, run `node CoachingCore/scripts/verify-r7a1.mjs`, and dispatch both judges in parallel. No runtime edit after the freeze.

## Resume point 3 — R7A1-FREEZE-A1 frozen, both judges dispatched (2026-10-27)

- **Freeze:** `CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A1.json`, source digest `2de8681f13e5cb499df6a5a3dc443d52877850528ceb298b598d03de6ec2141a`, policy `18ec48f3…` unchanged. Delta from FREEZE-2: 4 changed and 2 added files, none removed.
- **Mutation** on the final code: 73 reverts, 72 caught, with one documented survivor (the C7 duplicate-race guard). The R7-A survivor QE-R7A-22 is now caught.
- **Verifier** (`node CoachingCore/scripts/verify-r7a1.mjs`): 13/15. The two open checks are `independent-reviews` and `deliverables`, as expected before the reviews and closure.
  - The baseline is preserved: only the allowed delta changed; the mission files are insert-only, with no CR appended.
  - The freeze is current.
- **Dossiers** filled with the digest: `dossier/ENGINEERING_REVIEW_BRIEF_R7A1.md` and `dossier/SSCTR_DOSSIER_R7A1.md`.
- **Judges dispatched in parallel on FREEZE-A1:**
  - a fresh `quality-reliability-engineer` (claude-opus-5-5, xhigh);
  - the SSCTR as the documented fallback: a fresh default instance loading the adapter, constitution and skill (claude-opus-5-5, xhigh).
  - Expected outputs are in `reviews/`.
- **Rule:** no runtime edit while the judges review. A material finding goes into one correction cycle, then FREEZE-A2, then one narrow re-check by each judge. No third cycle.

**Next:** read both reviews. If either judge has material findings, run the single correction cycle. Otherwise close: readiness, final disposition, report, queue integration, the mission and ledger blocks, and the handoff only if R7A_EXIT_READINESS = READY.

## Resume point 4 — the single correction cycle applied; evidence on the A2 candidate, freeze pending the mutation and instrument (2026-10-27)

- **Reviews of FREEZE-A1:** engineering NOT_READY (QE-R7A1-01 to 05 material; 06 to 08 LOW). SSCTR NOT_READY (D57, D58 material; S2, S4–S10 and the D56 formulation approved; nine queue items proposed).
- **Correction cycle (material findings only):**
  - **Changed:** `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs`, `src/r6-provenance.mjs`.
  - **Added:** `test/r7a1-correction.test.mjs` (8 tests: one per finding, D58 two).
  - **Contract:** R7A1-COMPOSITION-2 (marks *A2*).
  - **D58 final semantics:**
    - the slot already made easy stays the slot;
    - the first quality slot is read in the week as it stands (skipped or fatigue-eased runs are not slots);
    - a slot made easy and later skipped passes on at the next composition from a later week.
- **Evidence on the candidate:**
  - `node --test` 503/503. The 8 correction tests fail on a byte-exact FREEZE-A1 copy (`probes/r7a1-correction-tests.on-FREEZE-A1.out.txt`).
  - Grids:
    - Monday: 157 pairs, 0 defects.
    - Evening: 1,188 pairs, 0 defects, 22 expected.
    - D58 combinations (new probe): 0/136 (A1 68, F2 103).
    - D56: 0/206.
  - Three-step: 172/0. Composition probes: 11/11.
  - SSCTR grids:
    - restoration: B 0, A 0, C 0, U 237;
    - short: 0 after return and after review.
  - Judge probes P01–P10 and P12 clean, or unchanged where expected. P09: 5,000 sequences, O1–O7 0, O9 6 (QE-R7A1-07).
  - Regression: the same named differences.
- **Pending:**
  - mutation (89 reverts, `probes/mutation-check-r7a1.A2.out.json`), the instrument and P11;
  - then FREEZE-A2, `verify-r7a1`, the briefs' placeholders, and the narrow re-checks in parallel;
  - then closure.
- **Instrument output name:** it writes `probes/ssctr-r12-instrument.out.json` (default `R7A_PROBE_OUT`). Its stdout went to `.A2.out.json`. Rename them to `.A2.out.json` (data) and `.A2.log` (stdout).

## Resume point 5 — R7A1-FREEZE-A2 frozen, both narrow re-checks dispatched (2026-10-27)

- **Mutation run 1** (`probes/mutation-check-r7a1.A2-run1.out.json`): 86 of 89 caught. Its two undocumented survivors were the C7 equipment guard and the D57 whole-week end.
  - Two tests were added before the freeze: the `D57` whole-week rule (the SSCTR grid timeline sg-ret16mon-STRENGTH-N-1-30-none) and the `C7 (QE-R7A1-01)` guard.
  - A targeted re-run of the three affected reverts caught 3 of 3.
  - All 10 correction tests fail on the FREEZE-A1 copy for the right reason.
- **Freeze:** `CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A2.json`, source digest `71edc245cfe06a376732ec8054f2e09f277066f2ee4004f34827b2c90a1c4024`, policy `18ec48f3…` unchanged. `node --test` passes 505/505.
- **Verifier:** 14 of 17 checks pass, including `ssctr-instrument` (named S9 and D57 differences), `d58-combinations` and `correction-tests-fail-on-freeze-a1`. The three open checks:
  - `mutation-check`: the final full run is in progress and writes `probes/mutation-check-r7a1.A2.out.json`;
  - `independent-reviews`;
  - `deliverables`.
- **Briefs:**
  - `dossier/ENGINEERING_RECHECK_BRIEF_R7A1_A2.md`;
  - `dossier/SSCTR_RECHECK_DOSSIER_R7A1_A2.md`;
  - diffs `dossier/RUNTIME_DELTA_R7A1_A1_TO_A2.diff` and `dossier/RUNTIME_DELTA_R7A1_A2.diff`.
- **Re-checks dispatched in parallel on FREEZE-A2** (claude-opus-5-5, xhigh):
  - a fresh `quality-reliability-engineer`;
  - the SSCTR as the documented fallback.
  - Outputs: `reviews/quality-engineering-r7a1-recheck.{md,json}` and `reviews/ssctr-r7a1-recheck.{md,json}`.
- **Rule:** no runtime or test edit from now on. No third cycle.

**Next:** read both re-checks.
- READY only if both ACCEPT FREEZE-A2 and the mission's acceptance criteria hold.
- Then: closure (readiness, disposition, report, queue integration, the mission and ledger blocks, `verify --write`), and the handoff only if READY.

## Resume point 6 — closed NOT_READY (2026-10-27)

- **Re-checks of R7A1-FREEZE-A2:** both NOT_READY.
  - **Engineering (R7A1-QE-r2):** QE-R7A1-01 to 05 closed by mechanism. New: QE-R7A1-09 (HIGH), QE-R7A1-10 (MEDIUM), QE-R7A1-11 (LOW).
  - **SSCTR (R7A1-SSCTR-r2):** D56, D57 and D58 closed. New: D59 (blocking, pre-existing on FREEZE-2). D53 open.
- **Blockers:** QE-R7A-01 and D53 open; QE-R7A-02, 03, 05, 12, 19 and D56 closed.
- **Root cause:** the return baseline is read from week-boundary snapshots. There is no break identity, and the pause week's executed exposures are missed.
- **Closure written:**
  - `CoachingCore/r7/a1/READINESS_R7A1.json` (8 verdicts; R7A_EXIT_READINESS NOT_READY);
  - `CoachingCore/r7/a1/FINAL_REPORT_R7A1.md` (§9 is the NOT_READY record);
  - `FINAL_DISPOSITION.json`;
  - queue integration via `CoachingCore/scripts/queue-r7a1.mjs`: 132 → 151, r1 then r2 items, `QUEUE_INTEGRATION_R7A1.json`;
  - insert-only closure blocks in `CURRENT_MISSION.md` and `MISSION_LEDGER.md`.
- **Not done, by rule:** no handoff, no third cycle, R7-B not started. The next mission is the Founder's decision.
- **Left on disk, not deleted:**
  - `%TEMP%\r7a1-mut-eMSXou`, from an interrupted early mutation run;
  - the scratchpad copies (`a2/`, `a1check/`, `a1run/`, `mut57/`).
