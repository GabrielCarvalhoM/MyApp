# REVIEW HANDOFF — R7A-DECISION-AUTHORITY-FREEZE-1

`CURRENT_MISSION = R7A_DECISION_AUTHORITY_FROZEN` · `NEXT_STEP = INDEPENDENT_REVIEWS`

This session froze the runtime and stopped (Founder request §40). No reviewer was run. Two new, independent sessions review exactly these bytes. Readiness is decided only after both; `R7A_EXIT_READINESS` is not declared here.

## The bytes

| | |
|---|---|
| Freeze | R7A-DECISION-AUTHORITY-FREEZE-1, record `CoachingCore/r7/decision-authority/RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json` |
| Source digest | `3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244` |
| Manifest digest | `a500cdd94b8a4994a718029d4ee6efdc703e4f54de59d0855b5598c0d1afb224` (85 files: runtime, tests, policy, dev fixtures, `package.json`) |
| Policy | R6-POLICY-5, `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, unchanged |
| Branch | `claude/trusting-euler-04la8t` (pushed). Base `r7/decision-authority-closure-base` = `ffc1136643d51390199b57c23700eb652f40265b`, unchanged and not merged |
| Freeze commit | `d4631cd03fb27bbc1857532500748476ab764987`: the commit that adds the freeze record and every bound byte (all 85 bound files in it match the record). This handoff is in the commit after it, which changes no runtime, test or evidence file |
| Predecessor | STATE-MODEL-CONSUMER-FREEZE-1 (`adab3716…`), byte-exact in `state-consumer-freeze-source/`, with the two NOT_READY reviews in `../domain-coaching-r7a-state-consumer-2026-10-29/reviews/` |
| Runtime delta | `src/r6-adaptation.mjs`, `src/r6-program.mjs`. Tests edited in place (marked `Decision authority closure`): `r7ab-week-start-authority`, `r7ase-state-evidence`, `r7asc-state-consumer`. Added: `test/r7ada-decision-authority.test.mjs` |

To check the chain read-only: `node CoachingCore/scripts/verify-r7ada.mjs --tests`.
- Expected: every check passes. `reviews-not-dispatched` fails by design once a review file is added.
- Use Node v24.19.0 (`package.json` engines `>=24`).

## What the freeze claims

The rules are in [DECISION_AUTHORITY_CONTRACT.md](DECISION_AUTHORITY_CONTRACT.md); the evidence is item by item in [PRE_FREEZE_REPORT.md](PRE_FREEZE_REPORT.md).
- **A. Factual authority (QE-R7ASC-01):**
  - a planned KNOWN load never establishes history;
  - a correction re-plans the rows planned from the fact it removes.
- **B. Coherent decision context (QE-R7ASC-04):**
  - one PLAN reading per decision, each transition under the context of the week it enters;
  - E7 for a return's own week;
  - a re-plan of this week reads its own new context.
- **C. Evidence-based progression authority (QE-R7ASC-02, QE-R7ASC-03):**
  - the decision's run is earned in every mode (E10 withdrawn);
  - an open week earns nothing;
  - the most restrictive gate stands;
  - a run not yet due holds.
- **C′. Walk/jog ceiling (F4):**
  - HOLD and consolidation repeat the step run;
  - a return starts at the step last run at most.

## Declared, for the reviews (not fixed here)

- **R1, the standing projection between re-plans.** Founder-owned: a general fix changes the meaning of an unreviewed week, and 29 approved tests encode the current rule.
- **R2, a mid-week return holds its first week** (E7 resolved most-restrictive-first). SSCTR.
- **R3, plan versus history after a return week** (E7 versus C5). SSCTR.
- **R4, D44 for an exposure executed before its correction.** SSCTR, approved.
- **R5, O-1 and R41** stay outside the gate.

## The two reviews

1. **Engineering** (independent Quality & Reliability Engineering judge): [reviews/ENGINEERING_REVIEW_BRIEF.md](reviews/ENGINEERING_REVIEW_BRIEF.md). Verdict line `R7A_DECISION_AUTHORITY_ENGINEERING_REVIEW = READY | NOT_READY`.
2. **SSCTR regression** (`.claude/agents/sports-science-concurrent-training-reviewer.md`, regression only): [reviews/SSCTR_REGRESSION_REVIEW_BRIEF.md](reviews/SSCTR_REGRESSION_REVIEW_BRIEF.md). Verdict line `R7A_DECISION_AUTHORITY_SSCTR_REGRESSION_REVIEW = ACCEPT | NOT_READY`.

Each review writes only into `reviews/` (its own probes and outputs) and never edits the author's files.
- **The stop condition is finite (§43).** Only these block:
  - a material violation of factual authority, correction/retraction consistency, coherent decision resolution, temporal/evidence-based progression, or return ≤ factual tolerated dose;
  - a direct sports regression in F1–F4, D53/D56–D59, HOLD, MAINTAIN or return/restoration.
- Anything else goes to the backlog.

## Not done in this session (by the request)

- No reviewer run.
- No R7-B0, repertoires, archetypes, race distances, pace, Athlete Learning, KMP, HealthKit, Android, UI, Figma, landing page, Admin or Growth Layer.
- `audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch` is **not applied**. It waits for the appropriate closure or sync.
- No merge into `r7/decision-authority-closure-base` or `main`.
