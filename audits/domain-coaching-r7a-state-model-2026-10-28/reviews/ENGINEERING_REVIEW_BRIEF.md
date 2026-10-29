# ENGINEERING REVIEW BRIEF — COACHING CORE: STATE MODEL CLOSURE

**Not yet dispatched.** This brief is prepared for a new, independent Quality & Reliability Engineering instance. It and [SSCTR_REGRESSION_REVIEW_BRIEF.md](SSCTR_REGRESSION_REVIEW_BRIEF.md) point at exactly the same bytes.

## The freeze you review

| | |
|---|---|
| Freeze | **HISTORICAL-PROJECTION-FREEZE-1** |
| Manifest | `CoachingCore/r7/state-model/RUNTIME_FREEZE_HISTORICAL_PROJECTION.json` |
| Source digest | see the manifest's `sourceDigest` (recompute it: the canonical `hash()` of the `src/*.mjs` SHA-256 map, as `scripts/freeze-r7asm.mjs` does) |
| Policy | R6-POLICY-5, `18ec48f3…`, unchanged |
| Runtime files changed from STATE-EVIDENCE-FREEZE-1 | `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs` |
| Test files changed | `test/r7a-cycle2.test.mjs`, `test/r7a1-composition.test.mjs`, `test/r7a2-interruption.test.mjs`, `test/r7ab-week-start-authority.test.mjs`, `test/r7ase-state-evidence.test.mjs` (each change marked `State model`) |
| Test file added | `test/r7asm-state-model.test.mjs` |
| Byte-exact predecessor | `audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source/` (STATE-EVIDENCE-FREEZE-1, 82 files, with its own MANIFEST) |

Confirm the digest at the start and at the end of your review. No runtime change is permitted after the freeze; if you find a material case, the mission closes NOT_READY and returns to the Founder (Founder request §28, §33) — do not fix it and do not ask for a second freeze.

## The mission's central question (Founder §29)

> **Is there any material V1 path on which PlanningProjection can alter HistoricalState without passing through factual evidence?**

Test especially: QE-R7ASE-01; QE-R7ASE-02; QE-R7AB-01; load; tick; `lastPerformed`; partial evidence; the weekly review; the week boundary; the return; progression; cross-exercise; cross-sport.

## What changed, in one page

- **HistoricalState** is computed by one reducer, `evidenceState` (`src/r6-adaptation.mjs`), from canonical evidence only. It never reads a stored start's values. From the planning record it reads only: the week's rows, the week's prescription summary (`planned`), which decision closed a week for a sport (a start's `WEEK_EVIDENCE` provenance and its clock) and a return's recorded entry.
- **PlanningProjection** is `stateTrace`, written only by the planner.
- **PlanningView** is `planningBase(ctx)`, built per decision and declared atom by atom (contract §4): strength from history, the run's targets from the projection with its capability atoms from history, the load never above the evidence-gated load, the tick from EARNED_PROGRESS at the view's load.
- **Write ownership:** `evidenceMode` is passed at three call sites only (the reducer's week transition, `historicalStateOf`, `stateAtBreak`); the executed doses (`facts`) are deleted by every planning transition; `historicalStateOf` is public, read-only and frozen.
- **R42:** `PROGRESSION_TICK_OWNERSHIP = EARNED_PROGRESS (historical) vs PROJECTED_PROGRESS (planning)`. A load above the one the state held starts its credit at 0 and takes the rep target of the dose executed at it — in both readings.
- **`lastPerformed` authority:** an execution date only; the view hands it to the planner, so D52 and the exposure kind are measured from executed history.
- Removed with the copying they served: `historicalView`, `projectedBaseOf`, `atDose`, the `projectedBase` record and the per-value `rebuilt` flag.

Contract: `audits/domain-coaching-r7a-state-model-2026-10-28/STATE_MODEL_CONTRACT.md` (R7ASM-STATE-MODEL-1), including its declared boundaries E1–E6 (§8) and the three items it sends to the SSCTR (§10).

## Evidence prepared for you

| Artifact | Path |
|---|---|
| Tests | `CoachingCore/test/r7asm-state-model.test.mjs` (T1–T17, P1–P7, write ownership, I14) and the five edited suites |
| T1/T2 on both freezes | `probes/t1t2-both-freezes.mjs`, outputs `probes/t1t2.{live,prior-freeze}.out.json` (candidate passes, predecessor fails) |
| Self-challenge | `probes/r7asm-self-challenge.mjs`, 12 classes; `probes/self-challenge.{live,prior-freeze}.out.json` |
| Mutation | `probes/mutation-check-r7asm.mjs`, `probes/mutation-check-r7asm.out.json`, survivors justified in `probes/MUTATION_SURVIVORS_R7ASM.json` |
| Consumer audit | `dossier/CONSUMER_AUDIT_R7ASM.md` |
| Regression | `CoachingCore/r7/state-model/REGRESSION_R7ASM.json` and `REGRESSION_R7ASM_NAMED.json` (every difference classified) |
| Evidence runs | `probes/EVIDENCE_RUNS_R7ASM.json`, outputs in `probes/runs/` (each bound to the freeze digest, before and after) |
| Earlier judges' probes re-run | the same `probes/runs/` (QE-R7ASE P51d/P51c/P51b/P50 ×3 time zones/P52/I01/I02; QE-R7AB P40/P40b/P40c/P41/P47b; QE-R7AF P30c/P31/P32/P37; R7-A.2 P17/P19; R7-A.1 P07) |
| Mechanical verification | `node CoachingCore/scripts/verify-r7asm.mjs` (read-only without `--write`) |

## What the author claims, for you to check

1. **QE-R7ASE-01 is closed.** On the judge's own P51d, with identical ledgers, `db-rdl` and `db-split-squat` no longer differ between the unreviewed cell and its control, and the rows after the break are identical in both.
2. **QE-R7ASE-02 is closed.** On the judge's own P50, the week the finding named now prescribes the D52 re-establishment in both cells, and the planning view reads the executed date (2026-11-14), not the planned one.
3. **QE-R7AB-01 stays closed**, on the boundary judge's P40 family.
4. **No dose rose** against the predecessor except on rows the evidence turned into effort-guided establishments (`probes/rows-h24-h29.out.json`: `allRisenAreEffortGuided`).
5. Earlier blockers stay closed: QE-R7AF-01, QE-R7AF-02, QE-R7A-01, QE-R7A1-09, QE-R7A1-10, QE-R7A2-01, QE-R7A2-02, QE-R7A2-03.

## Known limits the author declares

- **Mutation survivors**, each justified in `MUTATION_SURVIVORS_R7ASM.json`; the two you may most want to attack yourself are "the view takes the tick from the projection at any load" and "a week's gates are read at the cut instead of at its own clock".
- **A conditional plan may still show a from-log row for an exercise whose establishment it only assumed** (it projects its own assumption). History never holds that exercise, and the next decision that re-plans from the view prescribes its establishment again. Not changed here: the planner's own projection semantics are out of scope (Founder §10, §14).
- **The regression delta is large**: 17 of 89 corpus cases differ, every difference classified into six named causes, with two status changes (R6-H18, R6-H26). The predecessor's own regression had 2 differing cases.
- The consumer audit is a bounded search of `CoachingCore/src` on the named paths, not a proof.
- Not tested anywhere: real data, real athletes, human or clinical validation, HealthKit, KMP, UI, production.

## Scope and prohibitions

Offline synthetic Node 24 Coaching Core only. Do not edit `CoachingCore/` or any runtime file; do not run `npm run verify`, `npm run simulate`, any `verify-r*.mjs --write`, or any earlier `freeze-*`, `prepare-*`, `queue-*`, `regress-*` script or evidence runner. Write only files you own, prefixed `qe-r7asm-`, in `audits/domain-coaching-r7a-state-model-2026-10-28/reviews/`. Record your verdict in `quality-engineering-r7asm-review.md` and `.json`, bound to the freeze digest you recomputed.
