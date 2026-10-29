# REVIEW HANDOFF — COACHING CORE: STATE MODEL CLOSURE

**Purpose:** let two new, independent sessions review exactly the same bytes. The mission stops here: no reviewer has been dispatched, no readiness verdict has been issued, R7-B0 is not started (Founder's operational adjustment of 2026-10-28).

`STATE_MODEL_FREEZE_READY_FOR_INDEPENDENT_REVIEW = YES`

## 1. Freeze identity

| | |
|---|---|
| Freeze | **HISTORICAL-PROJECTION-FREEZE-1** |
| Manifest | `CoachingCore/r7/state-model/RUNTIME_FREEZE_HISTORICAL_PROJECTION.json` |
| Manifest SHA-256 | `39b326ac11b2faa3c316fefeeb1d332cc5043d2f552067151e336a4fb6ca41a4` |
| Source digest | `0db72d0edd9fd7f1382e1ed8622d29e2ff3356699da18872b0670615956e2eb8` |
| Frozen at | 2026-10-29T02:32:19Z (Node v24.19.0) |
| Files bound | 83 (`src/*.mjs`, `test/*.mjs`, the R6 policy, the dev fixtures, package.json) |
| Policy | R6-POLICY-5 `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, **unchanged** |
| Predecessor | STATE-EVIDENCE-FREEZE-1, source digest `692483ce…`, kept byte-exact in `state-evidence-freeze-source/` (82 files, own MANIFEST) |

**Runtime files changed** from the predecessor: `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs`.
**Test files changed** (in place, each change marked `State model`): `test/r7a-cycle2.test.mjs`, `test/r7a1-composition.test.mjs`, `test/r7a2-interruption.test.mjs`, `test/r7ab-week-start-authority.test.mjs`, `test/r7ase-state-evidence.test.mjs`.
**Test file added:** `test/r7asm-state-model.test.mjs`. **Removed:** none.

**Zero changes after the freeze.** `node CoachingCore/scripts/verify-r7asm.mjs` (read-only) reports `freeze-current` passing: every bound file matches, no source or test file is unfrozen, exactly one freeze file exists, and the recomputed source digest equals the recorded one. Recompute it yourself as `scripts/freeze-r7asm.mjs` does: the canonical `hash()` of the `src/*.mjs` SHA-256 map.

## 2. Baseline and evidence

| Gate | Result |
|---|---|
| Baseline, before any edit | STATE-EVIDENCE-FREEZE-1 recomputed (0 of 82 drift), `verify-r7ase` read-only 17/17, `node --test` 555/555, and the state-evidence judge's P51d, P51c, P50, P52 and I02 byte-identical to their recorded outputs (`probes/baseline/`) |
| Tests | **589/589** (`node --test`, Node v24.19.0): 555 before plus 34 in `test/r7asm-state-model.test.mjs` |
| T1–T17 | All in `test/r7asm-state-model.test.mjs`. T1 and T2 are also expressed through the public evaluation surface in `probes/t1t2-both-freezes.mjs`, which **passes on this freeze and fails on the predecessor** (`probes/t1t2.live.out.json` vs `probes/t1t2.prior-freeze.out.json`) |
| P1–P7 | Same file; P1 (persistence through four no-op handlers), P2 (time), P3 (future-only change), P4 (relevant execution), P5 (order), P6 (plan removal), P7 (correction) |
| Mutation | `probes/mutation-check-r7asm.out.json`: 29 mutants, **20 caught**, 0 unapplied, 9 survivors each justified in `probes/MUTATION_SURVIVORS_R7ASM.json` (one of them is caught by the regression gate rather than the unit suites, which is the only thing the harness runs) |
| Self-challenge | `probes/r7asm-self-challenge.mjs`, 12 classes over the Founder's §23 channels: **0 violations** on this freeze, **42** on the predecessor |
| Consumer audit | `dossier/CONSUMER_AUDIT_R7ASM.md`: every material consumer classified HISTORY / PLANNING / VIEW; `evidenceMode` at three call sites only; no `stateTrace` entry carries the executed doses; the learning model reads bound observations only |
| Regression suites | R5 **24/24**, profiles **16/16**, simulations **12/14**, R6 fresh holdout **20/35**; `CoachingCore/r7/state-model/REGRESSION_R7ASM.json` |
| Evidence runs | `probes/EVIDENCE_RUNS_R7ASM.json`: **29 runs, 0 failed, 0 skipped, 0 unbound**, each bound to `0db72d0e…` before and after; outputs in `probes/runs/` |

**Known differences and their causes** (`CoachingCore/r7/state-model/REGRESSION_R7ASM_NAMED.json`, **0 unclassified**; 17 of 89 cases differ; **113 dose fields fell, 3 rose**, all three repetition targets on rows the evidence turned into effort-guided establishments, proven in `probes/rows-h24-h29.out.json`):

1. `NEVER_ESTABLISHED_EXERCISE` (12 cases) — an exercise the evidence never established is not in the PlanningView, so its next exposure establishes the load by effort again (SSCTR D52), where the predecessor carried the projection's established state.
2. `RUN_CAPABILITY_FROM_HISTORY` (7) — the achieved peaks and longest continuous run come from history, so the taper, the race-day completion rule and redevelopment read what was executed. In R6-H30 this moves a race day from `EFFORT_ANCHORED` to `COMPLETION`.
3. `EARNED_PROGRESS_R42` (4) — no progression credit crosses a load change, so a step can come one successful exposure later.
4. `DECISION_FROM_VIEW` (2) — a decision reads the view, so its own week's rows, its move admissibility and its counterfactuals follow executed history. Two status changes: R6-H18 (a missed key session no longer moves: zero work, no debt) and R6-H26 (a review that now instantiates logged loads).
5. `ROW_SHAPE` (14) and `STATE_BOOKKEEPING` (8) — the rows and state atoms that follow from the four causes above.

## 3. Target blockers

| Blocker | Claim | Where to check it |
|---|---|---|
| **QE-R7ASE-01** | Closed. With identical ledgers the named atoms (`db-rdl`, `db-split-squat`) no longer differ between the unreviewed cell and its control, and the rows after the break are identical; a lifted projected dose promotes the load, never the projection's credit | `probes/runs/qe-r7ase-P51d.out.json`, `qe-r7ase-P51c.out.json`, `qe-r7ase-P51b.out.json`; T1, T6, T6b, T7b, T7c |
| **QE-R7ASE-02** | Closed. The week the finding named prescribes the D52 re-establishment in both cells, and the planning view reads the executed date 2026-11-14, not the planned 2026-11-21; the return-step instance (P52) follows | `probes/runs/qe-r7ase-P50*.out.json` (three time zones), `qe-r7ase-P52.out.json`; T2, T8, T9 |
| **QE-R7AB-01** | Stays closed | `probes/runs/qe-r7ab-P40*.out.json`, `P40b`, `P40c`, `P41`, `P47b` |
| QE-R7AF-01, QE-R7AF-02 | Stay closed | `probes/runs/qe-r7af-P30c.out.json`, `qe-r7af-P37.out.json`, `qe-r7af-P32.out.json` |
| QE-R7A-01, QE-R7A1-09, QE-R7A1-10, QE-R7A2-01, QE-R7A2-02, QE-R7A2-03 | Stay closed | `probes/runs/qe-r7af-P31.out.json`, `qe-r7a2-P17.out.json`, `qe-r7a2-P19.out.json`, `qe-a1-P07.out.json`, and the R7-A suites in the 589 |
| D53, D56, D57, D58, D59 | Hold (for the SSCTR to confirm) | the same runs, plus `test/r7ab-week-start-authority.test.mjs`, `r7af-episode-identity.test.mjs`, `r7a2-interruption.test.mjs` |

## 4. Architectural contract, in brief

Full text: `STATE_MODEL_CONTRACT.md` (revision R7ASM-STATE-MODEL-1).

- **HistoricalState** — what the record shows the athlete did by a cut. One writer: the reducer `evidenceState` (`src/r6-adaptation.mjs`), from canonical evidence. It never reads a stored start's values; from the planning record it reads only the week's rows, the week's prescription summary, which decision closed a week for a sport, and a return's recorded entry. Public, read-only, frozen: `historicalStateOf(program,{asOf,actualLedger})`.
- **PlanningProjection** — the program's `stateTrace`, written only by the planner: targets, planned dates, projected credits and steps.
- **PlanningView** — `planningBase(ctx)`, derived per decision, with no historical authority of its own; it declares atom by atom which structure each value comes from (contract §4). Strength from history; the run's targets and unlock permissions from the projection, with its capability atoms and its whole state inside a return from history; the load never above the evidence-gated load; the credit from EARNED_PROGRESS at the view's load.
- **Write ownership** — `evidenceMode` is passed at three call sites, all inside the reducer or the history readers; a planning transition deletes any executed-dose record it is handed; the planner never writes a historical atom.
- **Evidence reducer** — per week and per sport: the intake at week 0; a return in force at its own point; otherwise the week before applied by the weekly review's own rule when a decision closed that week for the sport (`WEEK_EVIDENCE`) or the athlete executed every row of it (`COMPLETED_SESSIONS`), and by its facts only in every other case. Each week is read at its own clock and under the plan it was executed under.
- **Progression/tick ownership (R42)** — `EARNED_PROGRESS` (historical; only the evidence that earned it writes it) versus `PROJECTED_PROGRESS` (planning). A load above the one the state held starts its credit at 0 and takes the repetition target of the dose executed at it, in both readings.
- **`lastPerformed` authority** — an execution date only; the view hands it to the planner, so D52 and the exposure kind are measured from executed history. A planned date never becomes one.
- Removed with the copying they served: `historicalView`, `projectedBaseOf`, `atDose`, the `projectedBase` record and the per-value `rebuilt` flag.

## 5. Reviewer entry points

| What | Path |
|---|---|
| Freeze manifest | `CoachingCore/r7/state-model/RUNTIME_FREEZE_HISTORICAL_PROJECTION.json` |
| Contract | `audits/domain-coaching-r7a-state-model-2026-10-28/STATE_MODEL_CONTRACT.md` |
| Task contract | `audits/domain-coaching-r7a-state-model-2026-10-28/TASK_CONTRACT.md` |
| Founder request (verbatim) | `audits/domain-coaching-r7a-state-model-2026-10-28/FOUNDER_REQUEST.md` |
| Checkpoint | `audits/domain-coaching-r7a-state-model-2026-10-28/CHECKPOINT.md` |
| Tests | `CoachingCore/test/r7asm-state-model.test.mjs` plus the five edited suites |
| Probes | `audits/domain-coaching-r7a-state-model-2026-10-28/probes/` (`r7asm-self-challenge.mjs`, `t1t2-both-freezes.mjs`, `mutation-check-r7asm.mjs`, `classify-regression.mjs`, `rows-h24-h29.mjs`, `h29-dbrow.mjs`, `run-evidence-r7asm.mjs`) |
| Evidence artifacts | `probes/EVIDENCE_RUNS_R7ASM.json`, `probes/runs/`, `probes/mutation-check-r7asm.out.json`, `probes/MUTATION_SURVIVORS_R7ASM.json`, `probes/self-challenge.*.out.json`, `probes/t1t2.*.out.json`, `probes/baseline/` |
| Regression | `CoachingCore/r7/state-model/REGRESSION_R7ASM.json`, `REGRESSION_R7ASM_NAMED.json` |
| Consumer audit | `audits/domain-coaching-r7a-state-model-2026-10-28/dossier/CONSUMER_AUDIT_R7ASM.md` |
| Mechanical verification | `node CoachingCore/scripts/verify-r7asm.mjs` (read-only; `--write` only in the closing session) |
| Predecessor runtime | `audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source/` |

## 6. The two briefs, prepared and not executed

- `reviews/ENGINEERING_REVIEW_BRIEF.md` — the main gate. Central question kept verbatim: *is there any material V1 path on which PlanningProjection can alter HistoricalState without passing through factual evidence?*
- `reviews/SSCTR_REGRESSION_REVIEW_BRIEF.md` — regression only: did the separation unduly change dose, progression, return, re-establishment, ceilings or phase behaviour? It names the three changes the contract sends to the SSCTR (§10) plus the race-day completion consequence.

Both point at **HISTORICAL-PROJECTION-FREEZE-1**, source digest `0db72d0e…`.

## 7. Known limitations

- **Mutation survivors (9 of 29)**, each with its reason in `MUTATION_SURVIVORS_R7ASM.json`. The two most worth independent attack: "the view takes the tick from the projection at any load" and "a week's gates are read at the cut instead of at its own clock".
- **A conditional plan may still show a from-log row for an exercise whose establishment it only assumed.** History never holds that exercise and the next decision that re-plans from the view prescribes its establishment again; the planner's own projection semantics were out of scope (Founder §10, §14).
- **The regression delta is large** (17 of 89 cases) with two status changes; every difference is classified, and no dose rises except the three establishment repetition targets.
- The consumer audit is a bounded search of `CoachingCore/src` on the named paths, not a proof.
- R41 was not expanded (Founder §7); its direction is nevertheless touched by consequence 1 in the SSCTR brief, which is declared there.
- **Not tested anywhere:** real data, real athletes, human or clinical validation, HealthKit, KMP, UI, production. No queue item was appended (no SSCTR review has run); the human queue is byte-identical to the baseline.
