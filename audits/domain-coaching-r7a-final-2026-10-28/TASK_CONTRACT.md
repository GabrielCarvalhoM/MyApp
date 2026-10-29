# DOMAIN_COACHING_R7-A — Final Closure — task contract

**Mission:** DOMAIN_COACHING_R7-A Final Closure — Interruption Episode Identity & Return Continuity. It is the last micro-mission of phase R7-A, after R7-A, R7-A.1 and R7-A.2 (all closed NOT_READY). It is **not** R7-B0 or R7-B and never starts them.
**Authority:** the direct Founder request of 2026-10-28, preserved verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md). Its §0 decisions (0.1–0.8) are given and not re-discussed.
**Contract revision:** R7AF-CONTRACT-1, 2026-10-28.

## Authorization and prohibitions

- `IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_ONLY`: the offline, synthetic Node 24 Coaching Core in `CoachingCore/` (runtime, tests, scripts, artifacts under `CoachingCore/r7/final/`, and the handoff `CoachingCore/r7/R7A_FINAL_HANDOFF.md` only if READY).
- `UI / FIGMA / KMP / PRODUCTION / REAL_USER_PLAN_EFFECTS / INTEGRATIONS / HEALTHKIT / ANDROID / iOS = NO`. No new capability, sporting policy, planner, event sourcing, event framework, temporal store or graph engine (§7).
- Policy R6-POLICY-5 (`18ec48f3…`) is not changed. No commit, merge or deploy (not requested). `product/` and `canon/` are not edited.

## Preservation (§3)

R6, R7-A, R7-A.1 and R7-A.2 are closed history. [BASELINE.json](BASELINE.json) binds the protected files before the first edit, and `freeze1-source/` keeps the R7A2-FREEZE-1 runtime byte for byte (79 files). Earlier freezes, reviews, regressions and verification records are never rewritten; historical verifiers and writers are never run in write mode (`npm run verify`, `npm run simulate`, any `verify-r*.mjs --write`, any earlier `regress-*`, `freeze-*`, `queue-*` or `prepare-*` script, any earlier evidence runner). `verify-r7a2.mjs` runs once read-only for the baseline; after the first edit its `freeze-current` and `baseline-preserved` checks fail by design (this mission supersedes R7A2-FREEZE-1 without rewriting its record). Mission files are insert-only.

Where this mission changes the meaning of an earlier test, the earlier test file is edited in place, each changed case marked `R7-A final`, and its R7A2-FREEZE-1 bytes stay in `freeze1-source/`.

## Baseline (§4), reproduced before any edit

| Check | Result |
|---|---|
| R7A2-FREEZE-1 source digest, recomputed | `e0637ec2613acde1132d70fc64a5a6f0f1062b74d6c5cfafb6654dc1a54c7a28`, 0 of 79 files drift; freeze file `14fd8efe…`; policy `18ec48f3…` |
| `node CoachingCore/scripts/verify-r7a2.mjs` (read-only) and `node --test` | recorded in `probes/baseline/` |
| QE-R7A2-01, same week (judge's P17 L1–L4; P19 cells with B in A's re-entry week) | byte-identical to the judge's outputs: B read as SAME_BREAK of A, six rows at the pre-break dose (`back-squat 3x5@3 KNOWN 82.5`), long run 70 |
| QE-R7A2-01, cross week (P19 cells with B in the next week) | byte-identical: B read as SAME_BREAK of A (identity wrong; rows equal the control) |
| QE-R7A1-10 through it (P20) and QE-R7A2-03 (P21) | byte-identical: week 4 Tuesday `QUALITY THRESHOLD 41`; B merged into A |

## The single cause and the model (Founder §0)

R7-A.2 decided a report's break by dates against the latest report still in force, and its starting point against the returns still in force now. A later report of an earlier break therefore changed which break a later report was, and erased the return the athlete executed. The model answers three questions, no more (§26):

1. **Which interruption is this?** Explicit identity first: `interruption.episodeId` names the break a report is about. Without it (legacy input, §9): the same report replayed is deduplicated, the same days as the latest break are a duplicate of it, a break beginning after the latest break's re-entry (its first report) or after training recorded since it ended is a new break, and anything else is asked. Dates alone never make two reports the same break (0.4).
2. **A correction or a new break?** A revision keeps the break's identity and supersedes its earlier report (0.2, I1, I3); a new break gets a new identity (0.3, I2). A revision of a break that a later, separate break followed is asked.
3. **What had the athlete executed when it began?** `executedStateAt(start)`: the start set by the latest decision in force at the break's start by report time (a revision made after the break began is not in force then), plus the exposures executed after that point and before the break, as facts only. Same-day order follows timestamps when the break states its start time; otherwise a material same-day session is asked (0.8). Training recorded late that changes the state a return started from is asked for confirmation before anything else is planned (0.7, I6, confirmation-first).

The contract is `INTERRUPTION_EPISODE_CONTRACT.md` (successor of R7-A.2's INTERRUPTION_CONTRACT §2, §3 and §5).

## Routing (route-work, applied manually)

Python is not installed on this host, so the global helper cannot run; `registry/routing.json` is applied by hand, as in R7-A, R7-A.1 and R7-A.2.

| Axis | Level | Evidence |
|---|---|---|
| Impact | medium | Prescribed doses and state transitions in an offline synthetic reference; no real athlete, plan or surface |
| Irreversibility | low | Additive, diffable against the byte-exact R7A2-FREEZE-1 copy |
| Uncertainty | medium | Mechanism reproduced; the identity and state rules need both judges |
| Dependencies | medium | One module family, one domain authority, one engineering judge |

**Classification:** T3 / R2 / L3 / A4, phases implementation → review. Security, Product/UX, Data and AI are not affected (no trust boundary, surface, measurement or AI change).

**Owner and graph.** The current Claude Code instance is the Chief and the runtime author (Product Engineer role); it never judges its own work. Graph: baseline → model and tests → self-challenge → regression and evidence → **R7A-FINAL-FREEZE** → engineering re-check ∥ SSCTR regression re-check on the same bytes → closure.

| Instance | Role | Gate |
|---|---|---|
| Fresh `quality-reliability-engineer` | Independent engineering judge (§18) | R7A_FINAL_ENGINEERING_RECHECK |
| Fresh `sports-science-concurrent-training-reviewer` | Regression-only domain judge (§19): D53, D56–D59, return entry, recovery ceiling, restoration, short returns | R7A_FINAL_SCIENTIFIC_RECHECK |

## Cycle bound (§17)

Build → self-challenge → **one freeze, R7A-FINAL-FREEZE** → both re-checks in parallel on the same bytes → stop. No second freeze, no correction cycle, no A.3.1, no third reviewer. A material blocker from either judge closes the mission NOT_READY with `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION` (§23).

## Acceptance (§20)

READY only if QE-R7A-01, QE-R7A1-09, QE-R7A1-10, D53, D56, D57, D58 and D59 are CLOSED; WEEK_COMPOSITION, STATE_PRESERVATION, EVENT_SUPERSESSION, EXERCISE_MERGE and RETURN_RECOVERY_CEILING integrity are READY; and both re-checks accept the freeze. Not emitted (§21): autonomous coach, decision quality, KMP, production, human or clinical validation. Handoff `CoachingCore/r7/R7A_FINAL_HANDOFF.md` only if READY, naming `DOMAIN_COACHING_R7-B0 — V1 COACHING REPERTOIRE FOUNDATION`, not started.

## STOP_WHEN and ESCALATE_IF

**STOP_WHEN:** both re-checks are recorded on R7A-FINAL-FREEZE; then closure (readiness, report, disposition, mission and ledger blocks, queue append if the SSCTR proposes items, handoff only if READY).

**ESCALATE_IF:** the fix needs a policy text change, a Founder or Product/Data decision beyond §0, or clinical semantics; or a judge finds a material blocker. Escalation closes NOT_READY; it never invents a pass.
