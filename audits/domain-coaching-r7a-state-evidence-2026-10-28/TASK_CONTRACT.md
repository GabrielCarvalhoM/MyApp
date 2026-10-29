# COACHING CORE — STATE EVIDENCE MODEL — task contract

**Mission:** COACHING CORE — STATE EVIDENCE MODEL: value-scoped fact vs projection closure. It follows the R7-A Final Boundary Closure (closed NOT_READY on QE-R7AB-01) and is the architectural decision that closure routed to. It is **not** R7-B0 or R7-B and never starts them.
**Authority:** the direct Founder request of 2026-10-28, preserved verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md). Its §0 decision (`STATE_EVIDENCE_AUTHORITY = VALUE_SCOPED`; recursive whole-week authority rejected as the main solution) is given and not re-discussed.
**Contract revision:** R7ASE-CONTRACT-2, 2026-10-28. R7ASE-CONTRACT-1 summarized the first build in "The model" (the review builds on history); that build changed planning and was reverted before the freeze (CHECKPOINT resume point 2). Only that summary changed.

## Authorization and prohibitions

- `IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_ONLY`: the offline, synthetic Node 24 Coaching Core in `CoachingCore/` (runtime, tests, scripts, artifacts under `CoachingCore/r7/state-evidence/`, and the handoff `CoachingCore/r7/R7A_FINAL_HANDOFF.md` only if READY).
- `UI / FIGMA / KMP / PRODUCTION / REAL_USER_PLAN_EFFECTS / INTEGRATIONS / HEALTHKIT / ANDROID / iOS = NO`. No new planner, Adaptive Engine, event sourcing, temporal store, graph state, sporting policy, repertoire, pace, marathon, archetype or athlete learning (§7).
- Policy R6-POLICY-5 (`18ec48f3…`) is not changed. No commit, merge or deploy (not requested). `product/` and `canon/` are not edited.

## Preservation (§6, §24)

R6 and every R7-A mission are closed history. [BASELINE.json](BASELINE.json) binds 2,862 protected files before the first edit, and `boundary-freeze-source/` keeps the R7A-BOUNDARY-FINAL-FREEZE runtime byte for byte (81 files). Earlier freezes, reviews, regressions, verdicts and verification records are never rewritten. Historical verifiers and writers are never run in write mode: `npm run verify`, `npm run simulate`, any `verify-r*.mjs --write`, and any earlier `regress-*`, `freeze-*`, `queue-*` or `prepare-*` script or evidence runner. `verify-r7ab.mjs` ran once read-only for the baseline (17/17); after the first edit its `freeze-current` and `baseline-preserved` checks fail by design, because this mission supersedes R7A-BOUNDARY-FINAL-FREEZE without rewriting its record. Mission files are insert-only. Where this mission changes the meaning of an earlier test, that test is edited in place and marked `State evidence`; its R7A-BOUNDARY-FINAL-FREEZE bytes stay in `boundary-freeze-source/`.

Must not regress (§24): R5 corpus, R6 holdout and regressions, profiles, simulations, every R7-A suite, interruption identity, week composition, event supersession, exercise merge, D53, D56–D59 and QE-R7AF-01. Every difference needs a named cause.

## Baseline (§4), reproduced before any edit

| Check | Result |
|---|---|
| R7A-BOUNDARY-FINAL-FREEZE source digest, recomputed | `36a71ca84fb87789d8623e2050ac9e308a963400af86a3ba73a373043bbf186c`, 0 of 81 files drift; freeze file `3ebc9b02…`; policy `18ec48f3…` |
| `node CoachingCore/scripts/verify-r7ab.mjs` (read-only) | 17/17 (`probes/baseline/verify-r7ab.read-only.out.json`) |
| `node --test` (Node v24.19.0) | 540/540 (`probes/baseline/node-test.on-boundary-freeze.out.txt`) |
| QE-R7AB-01, the judge's P40 | byte-identical to `reviews/qe-r7ab-P40.out.json` (`b76b8259…`, the author's recorded reproduction): cell U starts the program's first interruption at week 4 (`WEEK_EVIDENCE`) with `db-rdl` and `db-split-squat` at 22 kg, never lifted; the control R gives 20 |
| Variants P40b, P40c, P41, P47b | byte-identical to the judge's outputs (`4ced6921…`, `884a0900…`, `c73352d5…`, `943ae185…`) |
| P40 on the R7A-FINAL-FREEZE copy | the same values as the judge's FINAL-FREEZE output (the only difference is the `tz` field the judge added to the script after that run) |

## The cause

A weekly review, or any handler applying its rule, builds the next week's start from the week's stored start and records it as `WEEK_EVIDENCE`. Every value its evidence did not move is copied from that stored start, even when the stored start was a projection whose premise the athlete never executed. The authority belongs to the container (the start, per sport), not to the value, so a projected value acquires evidence authority because a later decision stored it (Founder §1, §10; QE-R7AB-01). The same container-level authority lets a verified projection carry an earlier projection's assumptions outside a return, and leaves a planned last-performed date and a never-lifted target load (P5) in history.

## The model (value-scoped)

Contract: [STATE_EVIDENCE_CONTRACT.md](STATE_EVIDENCE_CONTRACT.md) (written with the runtime). In short:
- **Values:** one value per strength exercise; one value for the run state, which is one coupled machine (one mode; long, easy and quality steps share the week's one-step rule and its caps).
- **Planning view:** the stored start (`stateTrace[k]`), read by the planner as before; projections stay free (§15, I7).
- **Historical view:** per value, at a cut. A stored value counts as history when its start holds it as evidence (intake, a return's entry, a review that held that value as stored), or when it is a projection whose own base value was historical and the week before executed its sport as assumed. Otherwise the value is the historical value before it plus the week's facts. A last-performed date always comes from the executed date.
- **The review keeps planning; history rebuilds what it carried:** the weekly review builds next week's start on the stored start, as before. A value it carried from a projection is recorded (`projectedBase`), and history rebuilds it by the same rule on its historical value, so no evidence start lends its authority to a value it carried (I2, I9).
- **Facts:** a known load lifted is the load, by the adoption rule (SSCTR D44; a heavier one needs the row's target met; an effort-guided row adopts nothing) (P5). A projected dose the athlete then lifted is that dose. A last-performed date is the executed date.

## Routing (route-work, applied manually)

Python is not installed on this host, so the global helper cannot run; `registry/routing.json` is applied by hand, as in the R7-A missions.

| Axis | Level | Evidence |
|---|---|---|
| Impact | medium | Prescribed doses and state transitions in an offline synthetic reference; no real athlete, plan or surface |
| Irreversibility | low | Additive, diffable against the byte-exact R7A-BOUNDARY-FINAL-FREEZE copy |
| Uncertainty | medium | Mechanism reproduced; the value-scoped rule needs both judges |
| Dependencies | medium | One module family, one domain authority, one engineering judge |

**Classification:** T3 / R2 / L3 / A4, phases implementation → review. Security, Product/UX, Data and AI are not affected (no trust boundary, surface, measurement or AI change).

**Owner and graph.** The current Claude Code instance is the Chief and the runtime author (Product Engineer role); it never judges its own work. Graph: baseline → model and tests → consumer audit → self-challenge → mutation, regression and evidence → **STATE-EVIDENCE-FREEZE-1** → engineering re-check ∥ SSCTR regression check on the same bytes → closure.

| Instance | Role | Gate |
|---|---|---|
| Fresh `quality-reliability-engineer` | Independent engineering judge (§28, the main gate) | STATE_EVIDENCE_ENGINEERING_REVIEW |
| Native `sports-science-concurrent-training-reviewer` | Regression-only domain judge (§25): prescriptions, return entry, restoration, progression rules, ceilings, phase behaviour | STATE_EVIDENCE_SCIENTIFIC_REGRESSION |

## Cycle bound (§26, §27)

Build → self-challenge → **one freeze, STATE-EVIDENCE-FREEZE-1** → both reviews in parallel on the same bytes → stop. No second freeze and no correction cycle. A material blocker from either judge closes the mission `STATE_EVIDENCE_MODEL = NOT_READY` with `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION` (§27, §32), recording the finding, its reproduction, the state atom that lost provenance, whether the granularity caused it, and whether HistoricalState and PlanningProjection need separate structures.

## Acceptance (§29, §30)

READY only if QE-R7AB-01 is CLOSED, no material equivalent manifestation remains known, every earlier blocker stays closed, and VALUE_SCOPED_EVIDENCE_AUTHORITY, HISTORICAL_STATE_INTEGRITY, PLANNING_PROJECTION_INTEGRITY, STATE_PRESERVATION_INTEGRITY, WEEK_START_STATE_AUTHORITY, RETURN_RECOVERY_CEILING_INTEGRITY, STATE_EVIDENCE_ENGINEERING_REVIEW and STATE_EVIDENCE_SCIENTIFIC_REGRESSION are READY. Then `R7A_EXIT_READINESS = READY` and the short handoff `CoachingCore/r7/R7A_FINAL_HANDOFF.md`, naming `DOMAIN_COACHING_R7-B0 — V1 COACHING REPERTOIRE FOUNDATION`, not started. Not declared: AUTONOMOUS_COACH_READY, COACHING_DECISION_QUALITY, KMP, production, human validation.

## STOP_WHEN and ESCALATE_IF

**STOP_WHEN:** both reviews are recorded on STATE-EVIDENCE-FREEZE-1; then closure (readiness, report, disposition, mission and ledger blocks, queue append if the SSCTR proposes items, handoff only if READY).

**ESCALATE_IF:** the fix needs a policy text change, a Founder or Product/Data decision beyond §0, or clinical semantics; or a judge finds a material blocker. Escalation closes NOT_READY; it never invents a pass.
