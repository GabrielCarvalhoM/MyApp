# SSCTR REGRESSION REVIEW BRIEF — COACHING CORE: STATE MODEL CLOSURE

**Not yet dispatched.** This brief is prepared for the project's Sports Science & Concurrent Training Reviewer. It and [ENGINEERING_REVIEW_BRIEF.md](ENGINEERING_REVIEW_BRIEF.md) point at exactly the same bytes.

**This review is regression-only (Founder request §26).** The mission is domain engineering: it separates what is known to have happened from what the plan projects. No sporting rule was added and policy R6-POLICY-5 (`18ec48f3…`) is unchanged. Do not open new scientific research without a real sporting change in front of you.

## The freeze you review

| | |
|---|---|
| Freeze | **HISTORICAL-PROJECTION-FREEZE-1** |
| Manifest | `CoachingCore/r7/state-model/RUNTIME_FREEZE_HISTORICAL_PROJECTION.json` |
| Policy | R6-POLICY-5, `18ec48f3…`, unchanged |
| Runtime changed | `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs` |
| Byte-exact predecessor | `audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source/` (STATE-EVIDENCE-FREEZE-1) |

Confirm the digest at the start and the end of your review. No runtime change follows the freeze.

## Your question (Founder §26)

> Did separating HistoricalState from PlanningProjection unduly change **dose, progression, return, re-establishment, ceilings or phase behaviour**?

## The three changes the author sends you explicitly (contract §10)

1. **A week the athlete executed as finally prescribed is now evidence for its sport, whoever reduced those rows** (a fatigue report, an unavailable day, an equipment change). The predecessor compared the week against what an earlier projection had assumed and, when they differed, sent that sport back to the return's re-entry; that comparison existed only to decide whether to trust a stored projected start, and it is gone with the copying it served. Effect: the executed reduced week is credited by the weekly review's own rule instead of being discarded. This removes the under-reading you recorded as **NF-R7AB-1** and is the direction of your **R41** recommendation (b)/(c), reached as a consequence of the structural separation rather than as a new rule. Evidence: `test/r7ab-week-start-authority.test.mjs` case `reduced (systemic fatigue)`, and the regression class `NEVER_ESTABLISHED_EXERCISE` / `DECISION_FROM_VIEW`.
2. **A return resumes the dose last executed** (`historicalStrength`, Founder §3, T13): a load or repetition step the evidence released but the athlete has not yet executed is undone for the return's base, while counts, return steps and caps (which only executed weeks move) stand, and a re-establishment ceiling is never above the last executed load.
3. **R42, in both readings:** a load above the one the state held starts its progression credit at 0 and takes the repetition target of the dose executed at it. A step can therefore come one successful exposure later than on the predecessor. `PROGRESSION_TICK_OWNERSHIP = EARNED_PROGRESS (historical) vs PROJECTED_PROGRESS (planning)`. This is your **NF-R7ASE-3 / R42** item, now implemented.

## A fourth consequence you should weigh

**The run's achieved peaks and longest continuous run are now read from history**, so the taper, the race-day completion rule (D43, D47) and redevelopment see what was executed rather than what a projection assumed. In the R6 holdout this changes a race-week prescription: in **R6-H30** the week-13 race-day calibration moves from `EFFORT_ANCHORED` to `COMPLETION` and a taper long run becomes an easy run, because the achieved long run on the record is below the half-marathon minimum. Regression class `RUN_CAPABILITY_FROM_HISTORY`.

## Regression evidence prepared for you

| Corpus | Result |
|---|---|
| R5 corpus | 24/24 identical |
| Profiles | 16/16 identical |
| Simulations | 12/14 identical (T04, T13 differ) |
| R6 fresh holdout | 20/35 identical; 15 differ |
| Status or action changes | 2 (R6-H18: a missed key session that no longer moves, so zero work with no debt; R6-H26: a review that now instantiates logged loads) |
| Prescribed dose fields | **113 fell, 3 rose**; every risen field is a repetition target on a row the evidence turned into an effort-guided establishment (no known load), proven in `probes/rows-h24-h29.out.json` (`allRisenAreEffortGuided: true`) |
| Every difference | classified into six named causes, 0 unclassified: `CoachingCore/r7/state-model/REGRESSION_R7ASM_NAMED.json` |

Files: `CoachingCore/r7/state-model/REGRESSION_R7ASM.json` (full diffs), `REGRESSION_R7ASM_NAMED.json` (classes and the dose tally), `probes/h29-dbrow.mjs` and `probes/rows-h24-h29.mjs` (row-level comparisons on both runtimes).

## What stayed the same, for you to confirm

- D53, D56, D57, D58, D59 and the week-composition, event-supersession, exercise-merge and interruption-identity semantics: the earlier judges' probes re-run on these bytes are in `probes/runs/` (QE-R7AB P40/P40b/P40c/P41/P47b; QE-R7AF P30c/P31/P32/P37; R7-A.2 P17/P19; R7-A.1 P07).
- The return recipe code is unchanged; what changed is the base it reads.
- The planner still projects freely (Founder §14): the plan may hold a target above history, and T3 asserts exactly the canonical 20/22 state.

## Scope and prohibitions

Offline synthetic Node 24 Coaching Core only; no UI, Figma, KMP, HealthKit, integration, production or real-plan effect. Do not edit `CoachingCore/` or any runtime file; do not run `npm run verify`, `npm run simulate`, any `verify-r*.mjs --write`, or any earlier `freeze-*`, `prepare-*`, `queue-*`, `regress-*` script or evidence runner. Write only files you own, prefixed `ssctr-r7asm-`, in this folder. Record your verdict in `ssctr-r7asm-regression.md` and `.json`, bound to the freeze digest you recomputed. If you approve prescriptive decisions, propose their queue items in `ssctr-r7asm-regression-queue-items.json`; the queue itself is untouched by this mission and its integration belongs to the closing session.
