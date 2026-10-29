# REVIEW HANDOFF — COACHING CORE: STATE MODEL CONSUMER CLOSURE

**Purpose:** let two new, independent sessions review exactly the same bytes. The mission stops here (Founder request §29):
- no reviewer has been dispatched;
- no readiness verdict has been issued, and `R7A_EXIT_READINESS` is not emitted;
- R7-B0 is not started.

`STATE_MODEL_CONSUMER_FREEZE_READY_FOR_INDEPENDENT_REVIEW = YES`

## 1. Freeze identity

| | |
|---|---|
| Freeze | **STATE-MODEL-CONSUMER-FREEZE-1** |
| Freeze record | `CoachingCore/r7/state-consumer/RUNTIME_FREEZE_STATE_MODEL_CONSUMER.json` |
| Source digest | `adab37162d4f30d783faed2fe02fd44769a4be36be7bb1f6e8455a01b86235e5` |
| Manifest digest | `4f11f4b48782a5f16dc6c9770a367d013564380aecc42d19be348d4ebc45cd1f` (the canonical `hash()` of the 84-file SHA-256 map) |
| Frozen at | 2026-10-29T14:19:24Z (Node v24.19.0) |
| Files bound | 84: `src/*.mjs` (43), `test/*.mjs` (36), the R6 policy, the three dev fixtures, `package.json` |
| Policy | R6-POLICY-5 `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, **unchanged** |
| Predecessor | HISTORICAL-PROJECTION-FREEZE-1, source digest `0db72d0e…`, kept byte-exact in `state-model-freeze-source/` (83 files, own MANIFEST) |

**Changed from the predecessor:**
- runtime: `src/r6-adaptation.mjs` and `src/r6-program.mjs`. `src/r6-composition.mjs` is unchanged;
- test, edited in place with each change marked `State consumer`: `test/r7asm-state-model.test.mjs` (T15 and P7 re-expressed on the real correction path, and T15c added);
- test added: `test/r7asc-state-consumer.test.mjs`.

Nothing was removed.

**Evidence bound in the freeze record** (Founder §28): the suite on these bytes, the evidence runs, the SSCTR kit runs, the mutation check and its survivors document, the regression and its named classes. Each is bound by SHA-256 and checked against this source digest, and the freeze refuses to exist otherwise.

**Zero changes after the freeze.** Run `node CoachingCore/scripts/verify-r7asc.mjs` (read-only). Its `freeze-current` check confirms four things:
- every bound file matches;
- no source or test file is unfrozen;
- exactly one freeze file exists;
- the recomputed source and manifest digests equal the recorded ones.

To recompute the digest yourself: take the canonical `hash()` of the `src/*.mjs` SHA-256 map, as `scripts/freeze-r7asc.mjs` does.

**Verification after the freeze:** 25/25, recorded in `CoachingCore/r7/state-consumer/VERIFICATION_R7ASC.json`, written once with `--write` after the freeze. Each check reads the recorded evidence; none re-runs a writer.

One caveat on the probes. `ssctr-kit-compare.mjs` and `kit-explain-r7asc.mjs` compare only the first 200 characters of an output that is not JSON. The only such instrument is `x-trace-rot`, which prints text. `verify-r7asc.mjs` compares it in full: it is byte-identical to the SSCTR's runs on both earlier freezes.

## 2. Baseline and evidence

| Gate | Result |
|---|---|
| Baseline, before any edit | HISTORICAL-PROJECTION-FREEZE-1 recomputed (0 of 83 drift). `verify-r7asm` read-only 15/16 (`reviews-not-dispatched`, by design). `node --test` 589/589. Every judge probe for the seven findings reproduced: 22 of 22, 21 byte for byte, and trace-h25 except its own clock (`probes/baseline/BASELINE_COMPARE.json`) |
| Tests | **632/632** (`node --test`, Node v24.19.0): 589, plus T15c, plus 42 in `test/r7asc-state-consumer.test.mjs` |
| Finding regressions | One or more per finding, each on the judge's own scenario. **All fail on the predecessor's bytes**, together with H1, H4, H5, S5, P2, P7 and the defects found on the way (`probes/runs/r7asc-tests-on-predecessor.out.json`) |
| H1–H5, S1–S6, T1–T5, P1–P7 | All in `test/r7asc-state-consumer.test.mjs` |
| Consumer audit | `dossier/CONSUMER_AUDIT_R7ASC.md`: every material consumer, its view, whether it resolves a dose, future evidence, retracted rows |
| Test-quality audit | `dossier/TEST_QUALITY_AUDIT_R7ASC.md`. No correction test of the R6/R7 suites now counts a conflict; T15 and P7 re-expressed, T15c labelled as a conflict (QE-R7ASM-07) |
| Self-challenge | `probes/r7asc-self-challenge.mjs`: 16 classes over the Founder's §24 list. **0 violations** in 1,376 cases on this freeze, **84** on the predecessor (in 8 of the 16 classes; 34 of them in C16) (`probes/runs/r7asc-self-challenge*.out.json`) |
| Mutation | `probes/mutation-check-r7asc.out.json`: **26 mutants, 25 caught**, 0 unapplied, 1 survivor documented with its equivalence evidence. The record binds the source digest and the hashes of the test files it ran. Four first-run survivors were material and each got a test (`probes/MUTATION_SURVIVORS_R7ASC.json`) |
| Regression suites | Against the predecessor: R5 **24/24**, profiles **12/16**, simulations **10/14**, R6 fresh holdout **25/35**, no decision status changed. 80 of 89 cases are identical once the plan's re-entry dose summary is set aside. `CoachingCore/r7/state-consumer/REGRESSION_R7ASC.json` |
| Evidence runs | `probes/EVIDENCE_RUNS_R7ASC.json`: **62** runs, 0 failed, 0 skipped, 0 unbound, each bound to `adab3716…` before and after. Outputs in `probes/runs/` |
| SSCTR kit | `probes/kit-final/RUNS.json`: the SSCTR's own 43 instruments re-run unchanged, 0 failed, 0 unbound |

**Named differences against the predecessor.** Source: `CoachingCore/r7/state-consumer/REGRESSION_R7ASC_NAMED.json`, **0 unclassified**.
1. `EARNED_REPETITIONS` (R6-H22, H24, H33) — F2, R42. A new load starts with the repetitions its gate allows, and the credit restarts at 0 whoever set the higher load.
2. `GOAL_RANGE_CUT` (R6-H18, H25, T08) — F3. Every row of a known dose stays inside the current goal's range.
3. `HOLD_REPEATS_DOSE` (T04, T13) — F2 and Property D. Restored to the rows of STATE-EVIDENCE-FREEZE-1: a past week's gate counts only the logs up to its clock.
4. `RETURN_WEEK_SUMMARY` (T05) — NF-R7ASM-1, Property A. Runs planned inside the pause are never credited as run.
5. `PLANNED_SUMMARY_BOOKKEEPING` (the rest) — only the stored prescription summary differs.

Dose fields: 60 rose and 82 fell. Of the risen, 56 are in T04 and T13: rows restored to STATE-EVIDENCE-FREEZE-1, with which both simulations are now identical. The other 4 are R6-H22's REPS_THEN_LOAD cycle points one step behind the predecessor's projected steps: 29 × 10 where it had 31.5 × 6, a higher repetition target at a lower load. One simulation decision changes action (T05 week 4: KEEP → INSTANTIATE_LOGGED_LOADS, class RETURN_WEEK_SUMMARY); no corpus case changes status.

## 3. Target findings

| Finding | Claim | Where to check it |
|---|---|---|
| **QE-R7ASM-01** (blocking) | Closed. On every Q3 variant, Q3b and Q12a: `prescribedKnownLoadBecameHistory = false`, `sameRecordDifferentHistory = false`, and the facts-only reading holds no load | `probes/runs/qe-r7asm-Q3-known-row-setup.out.json`, `…Q3b…`, `…Q12-robustness…`; tests `QE-R7ASM-01 (…)` |
| **QE-R7ASM-02** | Closed. A LONG return (RESTART) and a MODERATE one plan the same run as history with identical ledgers (`planDiffersWithIdenticalLedgers = false`), and Q4b's `historyAlwaysEqual = true` | `…Q4-restart-view…`, `…Q4b-restart-rows…`; S5 |
| **QE-R7ASM-03** | Closed. Q11c's rows are identical (`onlyU` and `onlyR` empty), and so are Q12b's GENERAL and RUNNING_SUPPORT | `…Q11c-reps-identical…`, `…Q12-robustness…` |
| **QE-R7ASM-04** | Closed. The public reader applies a `correctionOf` chain (`publicApiIgnoresCorrection = false`) and never reads the retracted load (`publicApiReadsRetractedLoad = false`) | `…Q2-correction…`, `…Q2b-correction-load…`; H5, P2, P7 |
| **F1** (D53, D57) | Closed. Restoration grid B = 0 (predecessor 2), caps grid B = 0 with 0 covered jumps, NONE/NOVICE extension B = 0. The walk/jog and run return steps move from the dose run | `probes/kit-final/grid.shard*.out.json`, `caps*.out.json`, `trace-b*.out.json`; `probes/runs/r7asc-run-reentry-step*.out.json` |
| **F2** | Closed. The repetition probe has 126 rows and none outside its goal's range (the predecessor had 9 under STRENGTH). HOLD repeats 82.5 × 5; a REGRESS at a projected load starts from the dose held there | `probes/kit-final/reps.out.json`, `tick.out.json`; tests `SSCTR F2 …` |
| **F3** | Closed. After the change to MAINTAIN, no bench press or lat pulldown row is above 8 | `probes/kit-final/trace-h25.out.json`; test `SSCTR F3 (R6-H25)` |
| D56, D58, D59 | Hold. The short grid, D58, the first-week grid, same-day, ceiling, rotation, the rotation trace and the caps extension are all byte-identical to the SSCTR's accepted run. The first-week grids show E = O = B = 0 | `probes/kit-final/` |
| Earlier blockers | QE-R7ASE-01, QE-R7ASE-02 and QE-R7AB-01 stay closed on their judges' probes, as do QE-R7AF-01/02, QE-R7A-01, QE-R7A1-09/10 and QE-R7A2-01/02/03 | `probes/runs/qe-r7ase-*`, `qe-r7ab-*`, `qe-r7af-*`, `qe-r7a2-*`, `qe-a1-P07` |

**Non-blocking findings** (Founder §16):

| Finding | Status | Evidence |
|---|---|---|
| NF-R7ASM-1 | Closed (Property A: the return week's summary) | Round-12 section V back to the accepted reading |
| NF-R7ASM-3 | Closed collaterally (Property C: history's exercise is the dose) | The SSCTR's change probe, part D: no stall at 80 |
| QE-R7ASM-07 | Closed collaterally | The test-quality audit |
| R42 scope note | Closed (credit restarts on a heavier load the athlete chose) | Test `R42 and the gate's repetitions` |
| NF-R7ASM-2 | Unchanged; backlog | E5 class; R6-H26 identical after bookkeeping |
| R41 | Unchanged; backlog | — |
| QE-R7ASM-05 | Unchanged; backlog | Declared E1/E3; ruling still requested (Q10 re-run on these bytes) |
| QE-R7ASM-06 | Unchanged; backlog | Representational naming of `lastExecuted*` |

None violates Properties A–D as this mission states them.

## 4. Architectural contract, in brief

Full text: `STATE_CONSUMER_CONTRACT.md` (R7ASC-STATE-CONSUMER-1), which amends `STATE_MODEL_CONTRACT.md` on four points.

- **A, history ingress.** A prescription never establishes HistoricalState.
  - An exposure of an exercise the start does not hold is read as an effort-guided establishment (`asEstablishment`), in every reading of evidence. That covers the reducer, the facts-only reading, a review's transition and the load questions.
- **B, the correction boundary.** Every public reading runs on the canonical record (`canonicalRecord`): normalized and bound by the runtime's own functions at the record's own clock.
- **C, the resolved prescription.** `resolveExercisePrescription` is the one place a decision's exercise dose is resolved: HistoricalState's exercise as one unit (EarnedProgress), never an atom mixture.
  - The planner applies the goal's range to every row of a known dose (`inRange`).
  - HOLD and REGRESS take the target the row prescribed at a new load; ADVANCE takes the logged repetitions.
  - The credit restarts at 0 whoever set the higher load.
  - The run comes from history while either reading is in RETURN or RESTART.
- **D, evidence through time.**
  - A past week's gate counts only the logs up to its clock.
  - A return step, the restart minutes and the walk/jog step move from the dose the week prescribed, never above the state (`doseStep`, and `plannedOf`'s re-entry dose).
  - A return's own week is read from the sessions after the return's point.
- **Declared boundaries E7–E11:** contract §8.

## 5. Reviewer entry points

| What | Path |
|---|---|
| Freeze record | `CoachingCore/r7/state-consumer/RUNTIME_FREEZE_STATE_MODEL_CONSUMER.json` |
| Contract | `audits/domain-coaching-r7a-state-consumer-2026-10-29/STATE_CONSUMER_CONTRACT.md` |
| Task contract | `audits/domain-coaching-r7a-state-consumer-2026-10-29/TASK_CONTRACT.md` |
| Founder request (verbatim) | `audits/domain-coaching-r7a-state-consumer-2026-10-29/FOUNDER_REQUEST.md` |
| Checkpoint | `audits/domain-coaching-r7a-state-consumer-2026-10-29/CHECKPOINT.md` |
| Tests | `CoachingCore/test/r7asc-state-consumer.test.mjs`, plus the edited `r7asm-state-model.test.mjs` |
| Author probes | `audits/domain-coaching-r7a-state-consumer-2026-10-29/probes/`: `r7asc-self-challenge.mjs`, `mutation-check-r7asc.mjs`, `mutant-search-r7asc.mjs`, `mutant-equivalence-r7asc.mjs`, `tests-on-predecessor.mjs`, `classify-regression-r7asc.mjs`, `name-regression-r7asc.mjs`, `r7asc-run-reentry-step.mjs`, `grid-signature-r7asc.mjs`, `grid-explain-r7asc.mjs`, `kit-explain-r7asc.mjs`, `ssctr-kit-compare.mjs`, `run-ssctr-kit.mjs`, `run-evidence-r7asc.mjs`, `baseline-compare-r7asc.mjs` |
| Evidence | `probes/EVIDENCE_RUNS_R7ASC.json` with `probes/runs/`; `probes/kit-final/`; `probes/mutation-check-r7asc.out.json`; `probes/MUTATION_SURVIVORS_R7ASC.json`; `probes/baseline/` |
| Regression | `CoachingCore/r7/state-consumer/REGRESSION_R7ASC.json`, `REGRESSION_R7ASC_NAMED.json` |
| Audits | `dossier/CONSUMER_AUDIT_R7ASC.md`, `dossier/TEST_QUALITY_AUDIT_R7ASC.md` |
| Mechanical verification | `node CoachingCore/scripts/verify-r7asc.mjs` (read-only; `--write` writes only `VERIFICATION_R7ASC.json`) |
| Predecessor runtime | `audits/domain-coaching-r7a-state-consumer-2026-10-29/state-model-freeze-source/` |

`probes/work/` holds this session's scratch outputs: earlier runs, debugging traces and drafts. It is not evidence; the bound evidence is listed above.

## 6. The two briefs, prepared and not executed

Both point at **STATE-MODEL-CONSUMER-FREEZE-1**, source digest `adab3716…`.

- `reviews/ENGINEERING_REVIEW_BRIEF.md`, the main gate. Its central question, verbatim (Founder §30): *Is there any material V1 path on which PlanningProjection, prescribed lines, retracted evidence or future evidence can contaminate HistoricalState or produce a semantically incoherent dose?*
- `reviews/SSCTR_REGRESSION_REVIEW_BRIEF.md`, regression only (Founder §31). It covers F1, F2, F3, D53, D56–D59, HOLD, MAINTAIN, return, restart, restoration and progression, with no general literature reopened.

## 7. Known limitations

- **One mutation survivor**, documented with its evidence: the view taking history's run only when history itself is in re-entry. It is equivalent on a 112-timeline battery, and the battery's positive control is detected.
- **The goal-range cut also reaches accessory return rows when no goal changed.** Under STRENGTH they show 6 where they showed 7, following the KNOWN rows the next week already showed. Establishment rows keep 7. This is for the SSCTR to rule on (contract §10, item 3).
- **The return base carried from the predecessor**, which the SSCTR approved on it, shows in the kit as repetition targets above those of STATE-EVIDENCE-FREEZE-1 (contract §10, item 8).
- **The public reader returns the resumable state:** the dose last executed, with `earnedProgress.stepEarned` for a step the evidence released. A decision's view reads the reducer's state with that step. Both are declared (contract §5, STATE_MODEL_CONTRACT §3).
- The consumer audit is a bounded search of `CoachingCore/src` on the named paths, not a proof.
- **Not tested anywhere:** real data, real athletes, human or clinical validation, HealthKit, KMP, UI, production. No queue item was appended (no SSCTR review has run), and the human queue is byte-identical to the baseline.
- **Concurrent product work** (the Growth Layer, PDR-1.10/1.11) holds an additive product/canon patch until this mission's closure: `audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch`. This mission does not apply it. The session that closes this mission must apply it before any later baseline binds `product/` or `canon/`.
