# R7-A DECISION AUTHORITY — FINAL CLOSURE — task contract

**Mission:** DOMAIN_COACHING_R7-A — DECISION AUTHORITY FINAL CLOSURE (Cloud implementation mission). It succeeds STATE-MODEL-CONSUMER-FREEZE-1. Both of that freeze's independent reviews closed NOT_READY: Engineering (QE-R7ASC-01 to 04) and SSCTR (F4). It is **not** R7-B0 or R7-B and never starts them.
**Authority:** the direct Founder request of 2026-10-29, verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md). Its §1 decisions are binding and not re-discussed:
- walk/jog stays V1;
- QE-R7ASC-02 is a blocker;
- the approved HOLD semantics;
- O-1 and R41 are outside the gate;
- no redesign of HistoricalState, PlanningProjection, PlanningView or Canonical Evidence.

**Contract revision:** R7ADA-TASK-1, 2026-10-29. The rules are in [DECISION_AUTHORITY_CONTRACT.md](DECISION_AUTHORITY_CONTRACT.md).

## Authorization and prohibitions

- `IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_ONLY`: the offline, synthetic Node 24 Coaching Core in `CoachingCore/`. That covers the runtime, tests and scripts, and the artifacts under `CoachingCore/r7/decision-authority/`.
- **No** UI, Figma, KMP, HealthKit, Android, iOS, Admin, landing page, production or real-user plan effects (§44). No R7-B0, repertoires, archetypes, 5K, 10K, half marathon or marathon, pace, Athlete Learning, or Growth Layer.
- **No** new sporting rule. Every verdict applied is an existing policy verdict, with fail closed between them (§15). Policy R6-POLICY-5 (`18ec48f3…`) is unchanged. `product/` and `canon/` are not edited.
- `audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch` is **not applied** (§45). Its SHA-256 `6b737179…` is bound by [BASELINE.json](BASELINE.json) and checked by the freeze.
- **Branch:** the Cloud session's branch `claude/trusting-euler-04la8t`. The request names it `cloud/trusting-euler-041a8t`; the infrastructure created `claude/…`. It was created at `ffc1136643d51390199b57c23700eb652f40265b`, the same commit as `r7/decision-authority-closure-base`. The freeze is committed and pushed there. Nothing is merged into `r7/decision-authority-closure-base` or `main` (§39).
- **Stop at the freeze (§40):** one freeze, R7A-DECISION-AUTHORITY-FREEZE-1, then the handoff and the two briefs. No reviewer runs in this session. `R7A_EXIT_READINESS` is not declared (§46). The runtime does not change after the freeze.

## Immutable history (§3)

- [BASELINE.json](BASELINE.json) (R7ADA-BASELINE-1) binds 4,477 files before the first runtime edit, among them:
  - every closed R6 and R7-A audit, including the state consumer closure with both reviews;
  - `product/`, `canon/`, the mission files, the human queue, the Growth Layer patch and the CoachingCore tree.
- `state-consumer-freeze-source/` keeps the STATE-MODEL-CONSUMER-FREEZE-1 runtime byte for byte, with its own MANIFEST: 84 files; source digest `adab3716…`, manifest `4f11f4b4…`, freeze file `5c868775…`. `prepare-r7ada.mjs` refused to copy unless all 84 files matched.
- Earlier freezes, reviews, regressions and verdicts are never rewritten. Mission files are append-only.
- The reviewers' probes are never edited. They are re-run from their own folders, with outputs written here.
- Three earlier test files whose meaning this mission changes are edited in place and marked `Decision authority closure`. Their earlier bytes stay in `state-consumer-freeze-source/`:
  - `test/r7ab-week-start-authority.test.mjs` (I5/P3);
  - `test/r7ase-state-evidence.test.mjs` (I7/I10);
  - `test/r7asc-state-consumer.test.mjs` (QE-R7ASM-01 variants, now EARLY, LATE and AFTER).

## Baseline (§4), reproduced before any runtime edit

| Check | Result |
|---|---|
| Branch, HEAD, status | `claude/trusting-euler-04la8t` at `ffc1136643d51390199b57c23700eb652f40265b`, clean |
| STATE-MODEL-CONSUMER-FREEZE-1 | 84 of 84 bound files match its manifest; source digest `adab37162d4f30d783faed2fe02fd44769a4be36be7bb1f6e8455a01b86235e5` |
| The five blockers on the predecessor, with the reviewers' own probes | QE-R7ASC-01, 02, 03, 04 and F4 all present. 10 of 10 outputs are identical to the runs the reviewers cited, their machine path aside (`probes/runs/baseline-predecessor/BLOCKERS.json`) |

## Causes (one root per contract)

| Finding | Root cause on the predecessor | Contract |
|---|---|---|
| QE-R7ASC-01 | A KNOWN row was the reference for a log, and the setup of an exercise, whenever the start held the exercise at all, even as FROM_LOG without a load. A row planned before a correction stayed in place | A1, A3 |
| QE-R7ASC-04 | A decision read history (each week under its own context) while the planner's transitions read the entered week's context. A return's own week was read after its point (C5) by the view, and with every row (E7) by the review. A re-plan of this week kept the view of the context it replaced | B1, B2, B3 |
| QE-R7ASC-02 | Outside RETURN and RESTART, the view took the run's targets and counters from the projection (E10) | C1, C2 |
| QE-R7ASC-03 | `setGate` let the last role read win the shared re-entry gate | C3, C4 |
| F4 | The walk/jog ladder took the step the week ran only when the gate advanced, and a return read history's step | W1, W2 |

## Pre-freeze gate (§37)

All gates, with their evidence: [PRE_FREEZE_REPORT.md](PRE_FREEZE_REPORT.md).
