# ENGINEERING REVIEW BRIEF — COACHING CORE: STATE MODEL CONSUMER CLOSURE

**Not yet dispatched.** This brief is for a new, independent Quality & Reliability Engineering instance. It and [SSCTR_REGRESSION_REVIEW_BRIEF.md](SSCTR_REGRESSION_REVIEW_BRIEF.md) point at exactly the same bytes.

## The freeze you review

| | |
|---|---|
| Freeze | **STATE-MODEL-CONSUMER-FREEZE-1** |
| Freeze record | `CoachingCore/r7/state-consumer/RUNTIME_FREEZE_STATE_MODEL_CONSUMER.json` |
| Source digest | `adab37162d4f30d783faed2fe02fd44769a4be36be7bb1f6e8455a01b86235e5`. Recompute it as `scripts/freeze-r7asc.mjs` does: the canonical `hash()` of the `src/*.mjs` SHA-256 map |
| Policy | R6-POLICY-5, `18ec48f3…`, unchanged |
| Runtime changed from HISTORICAL-PROJECTION-FREEZE-1 | `src/r6-adaptation.mjs`, `src/r6-program.mjs` |
| Tests | `test/r7asc-state-consumer.test.mjs` added; `test/r7asm-state-model.test.mjs` edited in place (marked `State consumer`) |
| Byte-exact predecessor | `audits/domain-coaching-r7a-state-consumer-2026-10-29/state-model-freeze-source/` (HISTORICAL-PROJECTION-FREEZE-1, 83 files, own MANIFEST) |

Confirm the digest at the start and at the end of your review. No runtime change is permitted after the freeze. If you find a material case, do not fix it and do not ask for a second freeze. Record it: after this review, only a material violation of Properties A–D, or a direct sports regression, can block this foundation (Founder §34).

## The central question (Founder §30)

> **Is there any material V1 path on which PlanningProjection, prescribed lines, retracted evidence or future evidence can contaminate HistoricalState or produce a semantically incoherent dose?**

Attack especially the seven findings this mission closes:
- QE-R7ASM-01, 02, 03 and 04 (your predecessor's);
- F1, F2 and F3 (the SSCTR's).

The four properties under test (Founder §33):

| Property | Statement |
|---|---|
| **A** | Only factual evidence writes HistoricalState |
| **B** | Retracted or superseded evidence cannot remain factual through another API |
| **C** | The PlanningView resolves coherent prescriptions, not arbitrary atom mixtures |
| **D** | Evidence affects history only after it actually exists in time |

## What changed, in one page

- **Front A, history ingress (`asEstablishment`, `src/r6-program.mjs`).** Read as executed evidence, an exposure of an exercise the start does not hold is an effort-guided establishment, whatever its row prescribed. A KNOWN row's load is never the exercise's load, nor the reference a first log is judged against.
  - It is applied in the evidence reducer (`advanceStrength` in evidence mode), the facts-only reading (`strengthAtBreak`) and the load questions (`loggedLoadQuestions`).
- **Front B, the correction boundary (`canonicalRecord`, `src/r6-adaptation.mjs`).** `historicalStateOf` normalizes and binds the carried record with `normalizeObservations` and `bindObservations`, at the record's own clock: the latest correction, report, supersession or observation, or the cut if later.
- **Front C, the resolved prescription.**
  - `resolveExercisePrescription` (HistoricalState's exercise as one unit) replaces the removed `planningExercise` and `HISTORY_ATOMS`.
  - `strengthCandidate` caps the repetition target of every row of a known dose at the current goal's range (`inRange`).
  - `earnedAt` restarts the credit whenever the adopted load is above the load history held, whoever set it. Its repetitions are the gate's: ADVANCE the logged ones, HOLD and REGRESS the row's.
  - `planningBase` takes history's whole run while either reading is in RETURN or RESTART.
- **Front D, evidence through time.**
  - `weeklyGates` bounds the strength look-back by the gate's clock.
  - A strength return step moves from the dose the week's exposures were prescribed at (`doseStep`).
  - The run's return step, restart minutes and walk/jog step move from what the week's runs prescribed: `plannedOf` now states the re-entry dose.
  - The evidence reducer reads a return's own week with the summary of the sessions after the return's point.
  - The public reader answers in a program's last week while a return is in force.

Contract: `audits/domain-coaching-r7a-state-consumer-2026-10-29/STATE_CONSUMER_CONTRACT.md` (R7ASC-STATE-CONSUMER-1), including the declared boundaries E7–E11 (§8).

## Evidence prepared for you

| Artifact | Path |
|---|---|
| Tests | `CoachingCore/test/r7asc-state-consumer.test.mjs`, 42 tests:<ul><li>the seven findings, on the judges' own scenarios;</li><li>H1–H5, S1–S6, T1–T5, P1–P7;</li><li>the defects found on the way;</li><li>four tests the mutation check called for.</li></ul>Plus T15, T15c and P7 in `r7asm-state-model.test.mjs` |
| Tests on the predecessor | `probes/runs/r7asc-tests-on-predecessor.out.json`: every finding regression fails on HISTORICAL-PROJECTION-FREEZE-1 |
| Your predecessor's probes on these bytes | `probes/runs/qe-r7asm-Q2…Q12*.out.json` (13 probes, run unchanged from `audits/domain-coaching-r7a-state-model-2026-10-28/reviews/`) |
| Baseline (before any edit) | `probes/baseline/` and `BASELINE_COMPARE.json`: the seven findings reproduced on the predecessor |
| Self-challenge | `probes/r7asc-self-challenge.mjs`, 16 classes:<ul><li>C1–C4, history contamination;</li><li>C5–C9, semantic dose;</li><li>C10–C13, temporal evidence;</li><li>C14–C15, the public API;</li><li>C16, Property D over the whole simulation corpus.</li></ul>Outputs `probes/runs/r7asc-self-challenge{,.PRIOR}.out.json` |
| Mutation | `probes/mutation-check-r7asc.mjs` (26 mutants: the Founder's §25 list first, then the pieces the fronts rest on), `probes/mutation-check-r7asc.out.json`, `probes/MUTATION_SURVIVORS_R7ASC.json`. The one survivor's evidence is in `probes/runs/r7asc-mutant-equivalence.out.json` |
| Audits | `dossier/CONSUMER_AUDIT_R7ASC.md` (Founder §22), `dossier/TEST_QUALITY_AUDIT_R7ASC.md` (§23) |
| Regression | `CoachingCore/r7/state-consumer/REGRESSION_R7ASC.json` and `REGRESSION_R7ASC_NAMED.json` |
| Earlier judges' probes re-run | `probes/runs/`: QE-R7ASE P51d, P51c, P51b, P50 at three time zones, P52, I01, I02; QE-R7AB P40, P40b, P40c, P41, P47b; QE-R7AF P30c, P31, P32, P37; R7-A.2 P17, P19; R7-A.1 P07 |
| Evidence runs | `probes/EVIDENCE_RUNS_R7ASC.json`, each output bound to the freeze digest before and after |
| Mechanical verification | `node CoachingCore/scripts/verify-r7asc.mjs` (read-only without `--write`) |

## What the author claims, for you to check

1. **QE-R7ASM-01 is closed.** No prescribed KNOWN load becomes history:
   - whether the record was corrected before or after the rows were planned (Q3, four variants);
   - through a conflict (Q3b);
   - read facts-only (Q12a).

   The decision also asks to confirm the first log of such an exercise, as the transition leaves it waiting (D45).
2. **QE-R7ASM-02 is closed.** With identical ledgers, a LONG (RESTART) and a MODERATE (RETURN) return plan the same run as history (Q4, Q4b).
3. **QE-R7ASM-03 is closed.** Identical ledgers prescribe identical rows on the REPS_THEN_LOAD goals (Q11c, Q12b).
4. **QE-R7ASM-04 is closed.** `historicalStateOf` applies real corrections and never reads a superseded or retracted row (Q2, Q2b; H5, P2, P7).
5. **F1–F3 are closed on the SSCTR's own instruments** (the SSCTR brief has the detail).
6. **Property D holds across the simulation corpus.** At every week start, a session executed later moves nothing, and history records for each exercise the target its last executed exposure carried (C16: 0 violations on these bytes, 34 on the predecessor).
7. **The earlier blockers stay closed** on their judges' probes.

## Known limits the author declares

- **Mutation:** 26 mutants, 25 caught, 1 survivor. "The view takes history's run only when history itself is in re-entry" is equivalent on a 112-timeline battery, and the battery's positive control is caught. The argument is in `MUTATION_SURVIVORS_R7ASC.json`; attack it if you can build a path where the projection is in a re-entry mode and history is not.
- **Four first-run survivors were material:** the load questions, the walk/jog step, the R42 condition and the repetitions of a new load. Each got a test before the freeze, and the mutation check was re-run on the frozen bytes.
- **The public reader returns the resumable state.** It is the dose last executed, with `earnedProgress.stepEarned` for a step the evidence released. The decision's view reads the reducer's state with that step. This is declared, not changed.
- **QE-R7ASM-05** (EARNED_PROGRESS depends on whether a decision closed an incomplete week; the declared E1/E3) and **QE-R7ASM-06** (the naming of `lastExecuted*`) are unchanged and in the backlog. Q10 and Q9 are re-run on these bytes.
- The consumer audit is a bounded search of `CoachingCore/src` on the named paths, not a proof.
- **Not tested anywhere:** real data, real athletes, human or clinical validation, HealthKit, KMP, UI, production.

## Scope and prohibitions

- Offline synthetic Node 24 Coaching Core only.
- Do not edit `CoachingCore/` or any runtime file.
- Do not run:
  - `npm run verify` or `npm run simulate`;
  - any `verify-r*.mjs --write`;
  - any earlier `freeze-*`, `prepare-*`, `queue-*` or `regress-*` script, or any evidence runner.
- Write only files you own, prefixed `qe-r7asc-`, in `audits/domain-coaching-r7a-state-consumer-2026-10-29/reviews/`.
- Record your verdict in `quality-engineering-r7asc-review.md` and `.json`, bound to the freeze digest you recomputed.
