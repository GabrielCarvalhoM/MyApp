# DOMAIN_COACHING_R7-A — Final Boundary Closure — task contract

**Mission:** DOMAIN_COACHING_R7-A Final Boundary Closure — Week-Start State Authority & Return Continuity. It is the last micro-mission of phase R7-A, after R7-A, R7-A.1, R7-A.2 and the R7-A Final Closure (all closed NOT_READY). It is **not** R7-B0 or R7-B and never starts them.
**Authority:** the direct Founder request of 2026-10-28, preserved verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md). Its §0 decision (0.1: planned state is not automatically historical state) and §11 (temporal contradiction → ASK) are given and not re-discussed.
**Contract revision:** R7AB-CONTRACT-1, 2026-10-28.

## Authorization and prohibitions

- `IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_ONLY`: the offline, synthetic Node 24 Coaching Core in `CoachingCore/` (runtime, tests, scripts, artifacts under `CoachingCore/r7/boundary/`, and the handoff `CoachingCore/r7/R7A_FINAL_HANDOFF.md` only if READY).
- `UI / FIGMA / KMP / PRODUCTION / REAL_USER_PLAN_EFFECTS / INTEGRATIONS / HEALTHKIT / ANDROID / iOS = NO`. No new capability, sporting policy, planner, event sourcing, temporal store or replay.
- Policy R6-POLICY-5 (`18ec48f3…`) is not changed. No commit, merge or deploy (not requested). `product/` and `canon/` are not edited.

## Preservation (§4, §6)

R6, R7-A, R7-A.1, R7-A.2 and the R7-A Final Closure are closed history. [BASELINE.json](BASELINE.json) binds 2,366 protected files before the first edit, and `final-freeze-source/` keeps the R7A-FINAL-FREEZE runtime byte for byte (80 files). Earlier freezes, reviews, regressions, verdicts and verification records are never rewritten; historical verifiers and writers are never run in write mode (`npm run verify`, `npm run simulate`, any `verify-r*.mjs --write`, any earlier `regress-*`, `freeze-*`, `queue-*` or `prepare-*` script, any earlier evidence runner). `verify-r7af.mjs` ran once read-only for the baseline (18/18); after the first edit its `freeze-current` and `baseline-preserved` checks fail by design (this mission supersedes R7A-FINAL-FREEZE without rewriting its record). Mission files are insert-only. Where this mission changes the meaning of an earlier test, the earlier test is edited in place and marked `R7-A boundary`; its R7A-FINAL-FREEZE bytes stay in `final-freeze-source/`.

Must not regress (§6): interruption episode identity, same-pause correction, distinct-pause behaviour, temporal state at interruption, late-evidence behaviour, D53, D56–D59, QE-R7A-01, QE-R7A1-09/10, WEEK_COMPOSITION, EVENT_SUPERSESSION and EXERCISE_MERGE integrity.

## Baseline (§5), reproduced before any edit

| Check | Result |
|---|---|
| R7A-FINAL-FREEZE source digest, recomputed | `ec2debe730df8931d1525f2b1a729ce3d808c08842fb75397d2fc91084294605`, 0 of 80 files drift; freeze file `a5f07a3f…`; policy `18ec48f3…` |
| `node CoachingCore/scripts/verify-r7af.mjs` (read-only) | 18/18 (`probes/baseline/verify-r7af.read-only.out.json`) |
| `node --test` (Node v24.19.0) | 528/528 (`probes/baseline/node-test.on-final-freeze.out.txt`) |
| QE-R7AF-01, the judge's P30c | byte-identical to `reviews/qe-r7af-P30c.out.json` (`8dfa53db…`): with an equipment statement (even the no-op full kit) or a systemic-fatigue report on Monday of week 6, B starts at A's stored week-6 start (return step 1, never executed): week 6 runs 30/45 instead of 15/20, week 7 `back-squat 2x5@3 KNOWN 82.5` |
| QE-R7AF-01, the judge's P30b grid | byte-identical (`db28ce3d…`): 13 of 15 cells change B's start, 7 advance the run return step |
| Prior SSCTR (R7AF-SSCTR-r1) on the historical freeze | ACCEPT, bound to `ec2debe7…` |

## The single cause and the model

**Cause.** `stateAtBreak` reused a stored week start as the state the athlete had executed whenever its `earned` predicate held, and that predicate asked *when* a decision was made, not *what made the start*: any decision dated after the week before ended "earned" the start a return had projected. The stored start had no record of why it existed, so no consumer could tell a projection from a consolidation (Founder 0.1, §7, §8).

**Model (WeekStartState).** Each week records the authority of its start, per sport, set by the one composition every handler uses and by the program generator:
- `INTAKE` (the first week: the athlete's reported current state), `RETURN_ENTRY` (a return's entry: the state executed when its interruption began plus the interruption's facts) and `WEEK_EVIDENCE` (the weekly review's rule applied to a complete week by any handler): evidence-anchored, with `evidenceThrough` (the decision clock);
- `CONDITIONAL_PLAN` (the plan assumes the week before executed as prescribed): projected, with `premise` (a digest of the week-before rows it assumed).

One consumer, `historicalWeekStart`, answers "does this start hold authority as history at the cut?" for `stateAtBreak`, the only reader that reuses a week start as history. A projected start becomes historical only through evidence: the week before executed as its premise assumed (rows unchanged, every weekly-review gate ADVANCE or EARNED, no logged load below plan; Founder §10 "completed sessions"). Nothing is promoted by a decision's date, a handler's existence or the passage of time (I1, I3, P5). The rule holds before and after a return alike (Founder 0.1 and §2, "todo início de semana"): R7-A.2 boundary 3 (the plan's start of an unreviewed week stands before any return) is superseded by 0.1.

**Temporal contradiction (§11, I7).** A named correction of an interruption whose days would place training already recorded after its return began before or inside the interruption, when it changes what the return plans, is asked.

## Routing (route-work, applied manually)

Python is not installed on this host, so the global helper cannot run; `registry/routing.json` is applied by hand, as in R7-A to the R7-A Final Closure.

| Axis | Level | Evidence |
|---|---|---|
| Impact | medium | Prescribed doses and state transitions in an offline synthetic reference; no real athlete, plan or surface |
| Irreversibility | low | Additive, diffable against the byte-exact R7A-FINAL-FREEZE copy |
| Uncertainty | medium | Mechanism reproduced; the authority rule needs both judges |
| Dependencies | medium | One module family, one domain authority, one engineering judge |

**Classification:** T3 / R2 / L3 / A4, phases implementation → review. Security, Product/UX, Data and AI are not affected (no trust boundary, surface, measurement or AI change).

**Owner and graph.** The current Claude Code instance is the Chief and the runtime author (Product Engineer role); it never judges its own work. Graph: baseline → model and tests → self-challenge → mutation, regression and evidence → **R7A-BOUNDARY-FINAL-FREEZE** → engineering re-check ∥ SSCTR regression re-check on the same bytes → closure.

| Instance | Role | Gate |
|---|---|---|
| Fresh `quality-reliability-engineer` | Independent engineering judge (§20, the main gate) | R7A_FINAL_ENGINEERING_RECHECK |
| Native `sports-science-concurrent-training-reviewer` | Regression-only domain judge (§21): D53, D56–D59, return entry, recovery ceilings, restoration | R7A_FINAL_SCIENTIFIC_RECHECK |

## Cycle bound (§19, §22)

Build → self-challenge → **one freeze, R7A-BOUNDARY-FINAL-FREEZE** → both re-checks in parallel on the same bytes → stop. No second freeze, no correction cycle, no new sub-phase. A material blocker from either judge closes the mission NOT_READY with `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION` (§26), documenting whether it is a new manifestation of projected-vs-historical and whether the history/state model needs revision.

## Acceptance (§23)

READY only if QE-R7AF-01 is CLOSED and every earlier blocker stays CLOSED; WEEK_COMPOSITION, STATE_PRESERVATION, EVENT_SUPERSESSION, EXERCISE_MERGE, RETURN_RECOVERY_CEILING integrity and WEEK_START_STATE_AUTHORITY are READY; and both re-checks accept the freeze. Not declared (§24): autonomous coach, global coaching quality, KMP, production, human validation. Handoff `CoachingCore/r7/R7A_FINAL_HANDOFF.md` only if READY, naming `DOMAIN_COACHING_R7-B0 — V1 COACHING REPERTOIRE FOUNDATION`, not started.

## STOP_WHEN and ESCALATE_IF

**STOP_WHEN:** both re-checks are recorded on R7A-BOUNDARY-FINAL-FREEZE; then closure (readiness, report, disposition, mission and ledger blocks, queue append if the SSCTR proposes items, handoff only if READY).

**ESCALATE_IF:** the fix needs a policy text change, a Founder or Product/Data decision beyond §0 and §11, or clinical semantics; or a judge finds a material blocker. Escalation closes NOT_READY; it never invents a pass.
