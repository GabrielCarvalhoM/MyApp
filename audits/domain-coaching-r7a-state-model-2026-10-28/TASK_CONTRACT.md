# COACHING CORE — STATE MODEL CLOSURE — task contract

**Mission:** COACHING CORE — STATE MODEL CLOSURE: HistoricalState vs PlanningProjection. It follows the State Evidence Model mission (closed NOT_READY on QE-R7ASE-01 and QE-R7ASE-02) and is the architectural decision that mission routed to. It is **not** R7-B0 or R7-B and never starts them.
**Authority:** the direct Founder request of 2026-10-28, preserved verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md). Its §0 decision is given and not re-discussed: the Coaching Core separates `HistoricalState` from `PlanningProjection`, in distinct structures or APIs, with a derived `PlanningView` where the coach combines them.
**Contract revision:** R7ASM-CONTRACT-1, 2026-10-28.

## Authorization and prohibitions

- `IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_ONLY`: the offline, synthetic Node 24 Coaching Core in `CoachingCore/` (runtime, tests, scripts, artifacts under `CoachingCore/r7/state-model/`, and the handoff `CoachingCore/r7/R7A_FINAL_HANDOFF.md` only if READY).
- `UI / FIGMA / KMP / PRODUCTION / REAL_USER_PLAN_EFFECTS / INTEGRATIONS / HEALTHKIT / ANDROID / iOS = NO`. No redesign of run or strength programming, the hybrid coordinator, the planner, return or phase policy, pace, archetypes, cold start or athlete learning (§10). No event sourcing, CQRS, temporal store or generic provenance framework (§36).
- Policy R6-POLICY-5 (`18ec48f3…`) is not changed. No commit, merge or deploy (not requested). `product/` and `canon/` are not edited.

## Preservation (§9, §25)

R6 and every R7-A mission, the State Evidence mission included, are closed history. [BASELINE.json](BASELINE.json) binds 3,513 protected files before the first edit, and `state-evidence-freeze-source/` keeps the STATE-EVIDENCE-FREEZE-1 runtime byte for byte (82 files). Earlier freezes, reviews, regressions, verdicts and verification records are never rewritten. Historical verifiers and writers are never run in write mode: `npm run verify`, `npm run simulate`, any `verify-r*.mjs --write`, and any earlier `regress-*`, `freeze-*`, `queue-*` or `prepare-*` script or evidence runner. `verify-r7ase.mjs` ran once read-only for the baseline (17/17); after the first edit its `freeze-current` and `baseline-preserved` checks fail by design, because this mission supersedes STATE-EVIDENCE-FREEZE-1 without rewriting its record. Mission files are insert-only. Where this mission changes the meaning of an earlier test, that test is edited in place and marked `State model`; its STATE-EVIDENCE-FREEZE-1 bytes stay in `state-evidence-freeze-source/`.

Must not regress (§25): R5 corpus, R6 holdout, profiles, simulations, every R7-A suite, week composition, interruption identity, the executed state at an interruption, week-start state authority, D53, D56–D59, QE-R7AF-01 and QE-R7AB-01. Every difference needs a named cause.

## Baseline (§4, §5), reproduced before any edit

| Check | Result |
|---|---|
| STATE-EVIDENCE-FREEZE-1 source digest, recomputed | `692483ce5147d90797441baf2ac73c9d433197bd40047f147202ca4e4bff2cc1`, 0 of 82 files drift, no unfrozen source or test; freeze file `a8683cba…`; policy `18ec48f3…` |
| `node CoachingCore/scripts/verify-r7ase.mjs` (read-only) | 17/17 (`probes/baseline/verify-r7ase.read-only.out.json`) |
| `node --test` (Node v24.19.0) | 555/555 (`probes/baseline/node-test.on-state-evidence-freeze.out.txt`) |
| QE-R7ASE-01, the judge's P51d | byte-identical to `reviews/qe-r7ase-P51d.out.json` (`e0268648…`): identical ledgers, U `db-rdl`/`db-split-squat` KNOWN 24 tick 1 against R6 tick 0; after a SHORT return U steps to 26 kg on 2027-01-09, R6 on 2027-01-16 |
| QE-R7ASE-02, the judge's P50 | byte-identical (`2c4a48f7…`): on 2026-12-19, 35 days after the last exposure, U prescribes `db-rdl 3x5@3 KNOWN22` (planning `lastPerformed` 2026-11-21, never executed) where R prescribes the D52 re-establishment |
| Variants P51c, P52, I02 | byte-identical to the judge's outputs (`7ec48bb9…`, `298a87d6…`, `716b096a…`) |

## The cause (both findings)

History was rebuilt from the one planning record (`stateTrace`) by per-value copy rules. Each copy rule had to be exact per atom, and two were not: `atDose` copied the stored dose's load tick with the lifted load (QE-R7ASE-01), and the planner's history-defined predicate D52 read the stored `lastPerformed` (QE-R7ASE-02; also the return-step kind, P52). The record held projections and facts in the same fields, so any reader could take one for the other.

## The model (Founder §0–§3, §11–§15)

- **HistoricalState** is computed by one evidence reducer and never reads a stored start's values. From the intake (the athlete's reported current state), each week is applied as evidence: a week a review closed for a sport, or one the athlete executed completely for that sport, by the weekly review's own rule on history's own base; any other week by its facts only (as the state at an interruption reads them, R7-A.2). A return's entry, computed from history, restarts it. The reducer also keeps, per strength exercise, the dose the athlete actually executed. The historical view a return reads (I13) undoes any load or repetition step the evidence released but the athlete has not yet executed (§3, T13).
- **PlanningProjection** is `stateTrace`, written only by the planner: targets, planned dates, projected ticks and steps for the weeks it plans.
- **PlanningView** is the start the planner decides from at every decision (`planningBase`): strength from the evidence state (the evidence-gated targets, earned ticks, real last-performed dates, return steps and counts); the run from the projection (its targets and unlock permissions, so the trainer is not made more conservative, §14) with its capability atoms (achieved peaks, longest continuous run) and its position in a return taken from the evidence state.
- **Write ownership:** only the reducer writes history; the planner reads the view and writes only the projection.
- **R42:** two concepts. EARNED_PROGRESS (historical: successful exposures at the load, written only by the evidence that earned them) and PROJECTED_PROGRESS (planning: the ticks a plan assumes for weeks it projects). Every decision steps a load on EARNED_PROGRESS.

The contract that goes with the runtime is written with it: `STATE_MODEL_CONTRACT.md` in this folder.

## Routing (route-work, applied manually)

Python is not installed on this host, so the global helper cannot run; `registry/routing.json` is applied by hand, as in the R7-A missions.

| Axis | Level | Evidence |
|---|---|---|
| Impact | medium | Prescribed doses, return bases and state transitions in an offline synthetic reference; no real athlete, plan or surface |
| Irreversibility | low | Additive, diffable against the byte-exact STATE-EVIDENCE-FREEZE-1 copy |
| Uncertainty | medium-high | A structural change to the state model; both judges needed |
| Dependencies | medium | One module family, one domain authority, one engineering judge |

**Classification:** T3 / R2 / L3 / A4, phases implementation → review. Security, Product/UX, Data and AI are not affected (no trust boundary, surface, measurement or AI change).

**Owner and graph.** The current Claude Code instance is the Chief and the runtime author (Product Engineer role); it never judges its own work. Graph: baseline → model and tests → consumer audit → self-challenge → mutation, regression and evidence → **HISTORICAL-PROJECTION-FREEZE-1** → engineering review ∥ SSCTR regression check on the same bytes → closure.

| Instance | Role | Gate |
|---|---|---|
| Fresh `quality-reliability-engineer` | Independent engineering judge (§29, the main gate) | STATE_MODEL_ENGINEERING_REVIEW |
| Native `sports-science-concurrent-training-reviewer` | Regression-only domain judge (§26): dose, progression, return, re-establishment, ceilings, phase behaviour | STATE_MODEL_SCIENTIFIC_REGRESSION |

## Cycle bound (§27, §28)

Build → self-challenge → **one freeze, HISTORICAL-PROJECTION-FREEZE-1** → both reviews in parallel on the same bytes → stop. No second freeze and no correction cycle. A new material case of projection → history found after the freeze closes the mission `STATE_MODEL_CLOSURE = NOT_READY` with `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION` (§28, §33), recording which projection contaminated history, through which API or path, whether the separation was incomplete, and whether the mixed legacy state must be replaced entirely.

## Acceptance (§30, §31)

READY only if QE-R7ASE-01, QE-R7ASE-02 and QE-R7AB-01 are CLOSED, no material equivalent remains known, every earlier blocker stays closed, and HISTORICAL_STATE_INTEGRITY, PLANNING_PROJECTION_INTEGRITY, FACT_PROJECTION_SEPARATION, VALUE_SCOPED_EVIDENCE_AUTHORITY, WEEK_START_STATE_AUTHORITY, STATE_PRESERVATION_INTEGRITY, RETURN_RECOVERY_CEILING_INTEGRITY, STATE_MODEL_ENGINEERING_REVIEW and STATE_MODEL_SCIENTIFIC_REGRESSION are READY. Then `R7A_EXIT_READINESS = READY` (semantic, history and state foundation only) and the short handoff `CoachingCore/r7/R7A_FINAL_HANDOFF.md`, naming `DOMAIN_COACHING_R7-B0 — V1 COACHING REPERTOIRE FOUNDATION`, not started. Not declared: AUTONOMOUS_COACH_READY, program quality, KMP, production, real-user or human validation.

## STOP_WHEN and ESCALATE_IF

**STOP_WHEN:** both reviews are recorded on HISTORICAL-PROJECTION-FREEZE-1; then closure (readiness, report, disposition, mission and ledger blocks, queue append if the SSCTR proposes items, handoff only if READY).

**ESCALATE_IF:** the change needs a policy text change, a Founder or Product/Data decision beyond §0, or clinical semantics; or a judge finds a material blocker. Escalation closes NOT_READY; it never invents a pass.
