# DOMAIN_COACHING_R7-A.2 — task contract

**Mission:** DOMAIN_COACHING_R7-A.2 — Interruption Identity & Return-State Closure, the last bounded closure of R7-A. It is **not** R7-B0 or R7-B and never starts them.
**Authority:** the direct Founder request of 2026-10-28, preserved verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md).
**Contract revision:** R7A2-CONTRACT-1, 2026-10-28.

## Authorization and prohibitions

- `IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_ONLY`: the offline, synthetic Node 24 Coaching Core in `CoachingCore/` (runtime, tests, probes, scripts, R7-A.2 artifacts under `CoachingCore/r7/a2/`).
- `UI / FIGMA / KMP / PRODUCTION / REAL_USER_PLAN_EFFECTS / INTEGRATIONS / HEALTHKIT / ANDROID / iOS = NO`. No new capability, policy, planner, workout family or general event sourcing (§29).
- Policy R6-POLICY-5 (`18ec48f3…`) is not changed. A sporting decision that turns out to be new is documented and sent to the SSCTR, never invented (§8).
- No commit, merge or deploy (not requested). `product/` and `canon/` are not edited. The Core stays platform- and vendor-agnostic (DR-120–123).

## Preservation

R6, R7-A and R7-A.1 are closed history. [BASELINE.json](BASELINE.json) binds 1,674 files before the first R7-A.2 edit (the whole `CoachingCore/` tree with every earlier freeze, review and verifier output, `product/`, `canon/`, the closed R6, R7-A and R7-A.1 audits, the VWS record, the mission files and the human queue). The R7A1-FREEZE-A2 runtime is copied byte-exact in [freezeA2-source/](freezeA2-source/MANIFEST.json).
- Runtime edits land in the current `CoachingCore/src/` modules; earlier freezes, reviews, regressions and verification records are never rewritten.
- Historical verifiers and writers are **never run in write mode**: `npm run verify`, `npm run simulate`, every earlier `scripts/verify-r*.mjs` with `--write`, `regress-r7a.mjs` and `regress-r7a1.mjs`. `verify-r7a1.mjs` was run once read-only for the baseline (17/17). After the first R7-A.2 edit its `freeze-current` check fails by design: R7-A.2 supersedes FREEZE-A2 without rewriting its record.
- Mission files are insert-only: new blocks are appended, existing lines stay byte-identical, no CR is added.

## Baseline (§3), reproduced before any edit

| Check | Result |
|---|---|
| R7A1-FREEZE-A2 source digest, recomputed | `71edc245cfe06a376732ec8054f2e09f277066f2ee4004f34827b2c90a1c4024`; 0 of 78 files drift; freeze file `a8c5e409…` |
| `node CoachingCore/scripts/verify-r7a1.mjs` (read-only) | 17/17 |
| `node --test` | 505/505 (Node v24.19.0) |
| QE-R7A1-09 (`reviews/qe-a2-P13-…mjs`) | byte-identical to `qe-a2-P13.A2.out.json`: X, X2 and S restore 3x5 @RIR3 at the pre-break known load and a 70-minute long run |
| QE-R7A1-10 (`reviews/qe-a2-P14-…mjs`) | byte-identical to `qe-a2-P14.A2.out.json`: week 4 Tuesday THRESHOLD 41 after both breaks, EASY 41 after the second alone |
| D59 (`reviews/ssctr-r7a1-recheck-firstweek.mjs`) | byte-identical to its A2 output: NONE E 264, O 561, B 109; FAMILIAR E 408, O 1,021, B 117; KNOWN O 72 |

Outputs: `probes/baseline/` (copied from the session scratchpad).

## The class and the single cause

The three blockers have one cause (both judges): a return's starting point is a week-boundary snapshot (`stateTrace[pauseWeek]`, or `startBeforeReturn` for any return whose break begins in a week an earlier return re-planned), and its easy slot is found by its explanation text. Nothing says **which** break a report is about, whether it **corrects** an earlier report or reports a **new** break, or **what the athlete had executed** when the break began. The fix is one model, not three patches:

1. **InterruptionEpisode** recorded on every return decision: identity, start, end, report instant, relation to the previous report (`NEW` or `SAME_BREAK`, the report it supersedes), and the start state the return set.
2. **State at the break** (`stateAtBreak`): the latest state-setting point at or before the break's first day (the start of its week as it stood before any return of that week replaced it, or the start an earlier live return set from its report on), advanced by the strength exposures executed after that point and before the break, as facts only (`strengthAtBreak`).
3. **Easy-slot ownership:** the slot a short return eases carries that break's identity; a newer report of the same break keeps it, a separate break never adopts it.

## Routing (route-work, applied manually)

Python is not installed on this host, so the global helper cannot run; `registry/routing.json` 1.5.0 is applied by hand, as in R7-A and R7-A.1.

| Axis | Level | Evidence |
|---|---|---|
| Impact | medium | Prescribed doses and state transitions in an offline synthetic reference; no real athlete, plan or surface |
| Irreversibility | low | Additive, diffable against the byte-exact FREEZE-A2 copy |
| Uncertainty | medium | Mechanism reproduced; the identity rule and the fact reading need both judges |
| Dependencies | medium | One module family, one domain authority, one engineering judge |

**Classification:** T3 / R2 / L3 / A4, phases implementation → review. Flags: behavior, domain_logic, regression, reproducible_bug, significant_state, code_changed, independent_review. Not affected: auth, payments, permissions, sensitive data, trust boundary (Security not applicable); product structure and visual surface; measurement and AI material.

**Owner and graph.** The current Claude Code instance is the Chief and the runtime author (Product Engineer role); it never judges its own work. Graph: rehydration → baseline → invariants and tests → structural fix → self-challenge → regression and evidence → **R7A2-FREEZE-1** → engineering re-check ∥ SSCTR re-check on the same bytes → closure.

| Instance | Role | Route | Gate |
|---|---|---|---|
| Fresh `quality-reliability-engineer` | Independent engineering judge: P13, P14, P02, P09, identity, state at the break, causality, earlier READY preserved | `claude-opus-5-5`, effort xhigh | R7A2_ENGINEERING_RECHECK |
| Fresh `sports-science-concurrent-training-reviewer` (native type, exposed in this session) | Domain judge for D59, D53, return entry, ceilings, the short-return easy slot and D56/D57/D58 regressions only | `claude-opus-5-5`, effort xhigh | R7A2_SCIENTIFIC_RECHECK |

## Cycle bound (Founder §19)

Build → candidate evidence → **one freeze, R7A2-FREEZE-1** → both re-checks in parallel on the same bytes → stop. **No correction cycle after the freeze**: no FREEZE-2, no A.2.1, no third judge, no new round. A material blocker from either judge closes R7-A.2 NOT_READY with the blocker, its root cause, its reproduction and the smallest architectural decision, and returns to the Founder.

## Acceptance and readiness (§22)

READY only if QE-R7A1-09, QE-R7A1-10 and D59 are CLOSED, and with them QE-R7A-01 and D53; the earlier READY verdicts and closed blockers (QE-R7A-02, 03, 05, 12, 19; D56, D57, D58) are preserved; regressions are explained; every material new-invariant mutant is caught or justified; and Engineering and SSCTR both accept R7A2-FREEZE-1. Verdicts: WEEK_COMPOSITION_INTEGRITY, STATE_PRESERVATION_INTEGRITY, EVENT_SUPERSESSION_INTEGRITY, EXERCISE_MERGE_INTEGRITY, RETURN_RECOVERY_CEILING_INTEGRITY, R7A2_ENGINEERING_RECHECK, R7A2_SCIENTIFIC_RECHECK, R7A_EXIT_READINESS. Not emitted (§23): AUTONOMOUS_COACHING_READY, COACHING_DECISION_QUALITY, KMP_READY, PRODUCTION_READY, REAL_USER_VALIDATION. `CoachingCore/r7/R7A_FINAL_HANDOFF.md` only if R7A_EXIT_READINESS = READY, naming `R7-B0 — V1 COACHING REPERTOIRE FOUNDATION` as the next mission, not started.

## STOP_WHEN and ESCALATE_IF

**STOP_WHEN:** both re-checks are recorded on R7A2-FREEZE-1; then closure (readiness, report, disposition, mission and ledger blocks, queue append if any, handoff only if READY). R7-B0 and R7-B are never started.

**ESCALATE_IF:** the fix needs a policy text change, a Founder or Product/Data decision, or clinical semantics; or a judge finds a material blocker. Escalation closes NOT_READY with `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`; it never invents a pass.
