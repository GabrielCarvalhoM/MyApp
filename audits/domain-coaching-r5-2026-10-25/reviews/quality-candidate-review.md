# Independent R5 candidate review — 2026-10-26

Evaluator `/root/quality`, Quality & Reliability Engineer 1.3.0, independent of runtime/policy/DEV-fixture authors. Task Contract R5-1; QUALITY1.1.0; verify-domain-gate/verify-before-completion1.3.0. Node v24.19.0 on Windows. HEAD remains `1d25c73e56661c8feac780aa814cc26aef51c9fc`; authoritative evaluated source hashes are in `quality-probes-dev-results-round3.json` and match `quality-simulation-replay-candidate.json`. This is a candidate pre-freeze review, not the unseen holdout.

The original blocking probes were corrected. Independent execution found 271/271 current tests passing (`quality-full-suite-candidate.tap`), 22/22 DEV criteria satisfied, and exact current-runtime replay of all 11 stored trajectories plus G (`quality-simulation-replay-candidate.json`). No root runtime, policy or fixture file was edited by this reviewer. Existing pre-fix raws remain preserved.

The 22 probes include positive controls: valid run30→35, valid strength6→7 with complete actual physical stimulus, smallest cruise increment4 rather than5 despite larger-first ordering, and same-dose MOVE retaining the current earned35. Invalid alternatives reject for direction/dimension errors; incomplete/different actual stimuli do not earn progression; known actuals in the model remain immutable when the caller omits a duplicate ledger; updated overlapping windows reject. Clinical observations do not enter positive dose learning. Calendar, chronology, dose-window/equipment checks and affected-only optional reduction also satisfy their narrowly tested criteria.

## Independent DEV coaching judgment

These classifications address the material decisions in the supplied synthetic context. They do not certify that the whole generated program is optimal or that arbitrary repertoire limitations are the athlete's best possible development path.

| Scenario | Observed behavior and independent judgment |
| --- | --- |
| A | Run-first 16-week conditional hierarchy, repeated easy surplus then30→35. **ACCEPTABLE_ALTERNATIVE** for the bounded progression. No evidence establishes that easy duration is the best development choice across the half-marathon goal. Event week remains unsupported. |
| B | Strength-first repertoire has3strength/2run anchors, repeated squat surplus then6→7reps while running remains55min. **ACCEPTABLE_ALTERNATIVE** for goal-aligned familiar progression. Goal-specific superiority among load/reps/sets/block alternatives has not been demonstrated. |
| C | Availability genuinely makes the current strength slot infeasible; a familiar alternative preserves both modalities with the same doses. **BEST_SUPPORTED within the supplied option set**: Pareto continuity avoids an unnecessary priority trade-off. |
| D | Missing long run inweek10 triggers moving the next long run fromSunday toSaturday. No supplied next-week constraint or benefit makes the original next long inadequate. **SUBOPTIMAL** by MEC/stability: presence of a new schedule option is not necessity to move. Current KEEP/DISCARD continuity is missing from the feasible comparison. |
| E | Three comparable actual underperformances at the same current dose support the known smaller25-minute alternative instead of broad replanning. **BEST_SUPPORTED within the supplied covered dose set**, subject to the population/eligibility/source conditions. No diagnosis or validated optimal regression magnitude is implied. |
| F | Repeated strength surplus inRun-first earns6→7reps. **ACCEPTABLE_ALTERNATIVE**: both goals are preserved, but superiority to other admissible whole-block coaching choices is unestablished. |
| G | Four comparable adverse actual exposures over21days affect future same-dose schedule ranking; an already feasible alternate wins. **BEST_SUPPORTED within the supplied schedule set** as reversible avoidance of recurrent adverse association. Alternate-specific response is still UNKNOWN; no causal or physiological-optimum claim is justified. |

Do not add these DEV judgments to unseen-holdout metrics. The corpus and outputs were available to implementers during development. Classification is independent; corpus authorship is not.

## Remaining acceptance boundaries

1. **P2 REQUEST_CHANGES: D unnecessary MOVE.** Owner `/root`. Resolve by proving a genuine next-horizon constraint or retaining the adequate next schedule. Merely renaming the fixture or reporting admissibility does not establish goal-optimal coaching.
2. Broad program competence remains unproven. The compiler repeats supplied complete tolerated weekly work across operational phase labels and gates only covered familiar alternatives. It does not independently invent event preparation, phase-specific distributions, broad cold-start recipes or complete return/taper trajectories. The unsupported event weeks inA/D/E/F remain explicit dependencies.
3. RETURN8 andFATIGUE8 show ASK followed by later externally supplied recovered actual outcomes. This demonstrates fixture replay and response handling, not persistent plan-validity suspension/resolution or autonomous authorization to resume. Do not infer those capabilities from the simulator's absence of permanentHOLD.
4. Freeze/hashes, new sealed independent holdout first evaluation, final source binding and current aggregate verification are still required for final R5 closure. Any affected source change invalidates the corresponding candidate evidence until rechecked.

Overall state: **QUALITY_BLOCKED for final R5 readiness** because the final evidence sequence is not complete andD has an unresolved material coaching finding. Narrow tested engineering invariants pass at the referenced source hashes. Production, real-athlete, empirical/human/clinical, UI/Figma andKMP validation are outside this review.

## Subsequent candidate — round4

The author corrected the unnecessary-MOVE selector and changed the DEV D facts explicitly: the upcoming Sunday window is now10minutes, making the familiar Saturday same-dose option necessary. Q23 confirms that a missed essential workout alone, even with an alternate option, returns KEEP/DISCARD without mutation. The revised D should be judged against those changed DEV facts and must not be represented as an unchanged comparison to its earlier defective version.

A new reference-validity implementation was then reviewed. Q25 confirms that RECOVERED alone does not clear a nonclinical pending dependency. **Q24 finds a newP1 blocker:** journal sequence clinical→missing-eligibility review→complete self-report reconciliation yields CLINICAL_HUMAN_REQUIRED→ASK→KEEP. The missing-eligibility rejection replaces the clinical pending dependency before previousValidity can preserve it. This violates the new explicit invariant that clinical dependencies cannot clear automatically. Reproduction and hashes: `quality-probes-dev-results-round4.json`; owner `/root`; REQUEST_CHANGES. No final gate is granted on this revision. Q01–23 andQ25 remain satisfied at these hashes; positive reconciliation controlsQ26/Q27 await the author's correction notice.
