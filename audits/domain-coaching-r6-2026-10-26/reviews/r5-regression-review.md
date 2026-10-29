# R5 holdout regression through R6: independent review

Revision R6-R5-REGRESSION-REVIEW-1, 2026-10-26. Quality & Reliability Engineer 1.3.0, acting as an independent judge. I did not write the runtime or either corpus. The machine-readable record is [r5-regression-review.json](r5-regression-review.json); probes and outputs are in [r5-regression/](r5-regression/).

**Scope.** This is a development regression, not fresh-holdout evidence. The 24 frozen R5 cases were replayed through the frozen R6 runtime (digest `507f35fc…`). Every case enters through the R5-INPUT-1 legacy route (`src/r6-legacy.mjs`), so the native R6 intake, cold start and planned progression are not exercised here.

## Integrity: PASS
- **R5 corpus.** `9557f4bf…` matches BASELINE.json and the replay declaration.
- **R5 first raw.** `c202e0ab…` matches.
- **R5 quality review.** `eeb9c09d…` matches.
- **Runtime freeze.** All 53 RUNTIME_FREEZE_R6 entries match on disk, including `r6-legacy.mjs` and `evaluate-holdout-r6.mjs`.
- **Reproduction.** All 24 cases re-run in memory are hash-identical to the published `r6Output`. Facts hashes are unchanged, there are 0 errors and no official effects.

## Before → after

| Label | R5 | R6 |
|---|---|---|
| BEST_SUPPORTED | 4 | 11 |
| ACCEPTABLE_ALTERNATIVE | 4 | 10 |
| SUBOPTIMAL | 3 | 0 |
| INSUFFICIENT_INFORMATION | 6 | 2 |
| UNSUPPORTED | 7 | 0 |
| CLINICAL_OUT_OF_SCOPE | 0 (H17 counted as UNSUPPORTED) | 1 |

- **Generation.** 23 cases are now PROPOSED and 1 is ASK; R5 had 5 INVALID_INPUT and 1 UNSUPPORTED.
- **Review steps.** All 23 intended review steps execute; R5 executed 14 of 23.
- **Unsafe positive prescriptions.** None identified.

| Case | R5 | R6 | Root cause |
|---|---|---|---|
| H01 | ACCEPTABLE | ACCEPTABLE (taper and race added) | confirmed |
| H02 | UNSUPPORTED | ACCEPTABLE | confirmed |
| H03 | SUBOPTIMAL | BEST | confirmed (order-invariance probe) |
| H04 | ACCEPTABLE | ACCEPTABLE | n/a, identical |
| H05 | ACCEPTABLE | ACCEPTABLE | n/a, identical |
| H06 | INSUFFICIENT | INSUFFICIENT | n/a, identical ASK |
| H07 | INSUFFICIENT | BEST | confirmed |
| H08 | INSUFFICIENT | BEST | confirmed |
| H09 | UNSUPPORTED | BEST | confirmed |
| H10 | INSUFFICIENT | BEST | confirmed |
| H11 | SUBOPTIMAL | BEST | confirmed |
| H12 | BEST | BEST | n/a |
| H13 | UNSUPPORTED | ACCEPTABLE | confirmed |
| H14 | BEST | BEST | n/a |
| H15 | INSUFFICIENT | INSUFFICIENT | n/a |
| H16 | UNSUPPORTED | ACCEPTABLE | confirmed |
| H17 | UNSUPPORTED (scope) | CLINICAL_OUT_OF_SCOPE | n/a, relabel only |
| H18 | BEST | ACCEPTABLE | n/a, behaviour identical (judge reclassification) |
| H19 | UNSUPPORTED | BEST | confirmed |
| H20 | SUBOPTIMAL | BEST | confirmed |
| H21 | INSUFFICIENT | ACCEPTABLE | partial |
| H22 | ACCEPTABLE | ACCEPTABLE (race placed) | confirmed |
| H23 | BEST | BEST | n/a |
| H24 | UNSUPPORTED | ACCEPTABLE | partial |

## Regressions
No runtime regressions, and no case got materially worse. 17 cases changed behaviour, all for the better; 7 are behaviour-identical.

The one downgraded label is **H18** (BEST → ACCEPTABLE). Its output is identical to R5. I rate it lower because the scenario is a new work schedule, yet the MOVE applies to week 2 only. Weeks 3–7 keep an arrangement the new availability no longer offers, and they are not flagged for reconciliation. The R5 judge missed this shared latent defect; it is not an R6 regression.

## Main findings
**Resolved.**
- **QH-BALANCED-ORDER** (H03, H11, H20). The choice is order-invariant, flips under STRENGTH_FIRST, and is justified by lowest worst-case harm with the cost disclosed.
- **QH-REPRESENTATION-CLOCK** (H07, H08, H10, H11). Resolved through the frozen evaluator adapter's latest-causal-instant assumption.
- **QH-CONTRACT-BREADTH** (H02, H09, H13, H16, H19, H24). Fixed through per-alternative admissibility, dependent dimensions and substitute candidates.

**Residual (owner: runtime author).**
- **P2 F-LEGACY-FLAT.** The legacy route projects no planned trajectory: build weeks repeat the baseline under hollow FOUNDATION/DEVELOPMENT/SPECIFIC labels. Half-marathon plans hold a 65-minute long run for up to 14 weeks, taper from that never-built peak, and race on a steady-hard cue that does not fit H01's "finish comfortably" goal. This is the main reason the generation cases stop at ACCEPTABLE.
- **P2 F-H18-HORIZON-SCOPE.** Covered under Regressions above.
- **P2 F-H21-LEARNING-NOT-OPERATIVE.** The arrangement history is cited, but `preferredId` is null and the evidence is EMERGING/POPULATION_PRIOR. The decision comes from population ordering, yet the KEEP reason presents the counts as its basis. A learned-ranking effect is still not demonstrated.
- **P2 F-H24-CONFLICT-FIRST-WINS.** The frozen facts never reach duplicate or conflict logic because staleness pre-empts it. In a counterfactual probe, the duplicate merges and the conflict is detected, but only the later payload is quarantined. The first-seen favourable payload stays in the learning model.
- **P3 F-H13-ADVERSE-HYSTERESIS.** The full dose is kept after two consecutive adverse-recovery sessions, with an inaccurate "not established" reason.
- **P3 F-H16-RETURN-SCALING.** Return uses one staged week, not the policy's 2 steps for an 11–28-day break.
- **P3 F-H06-COLD-START-UNREACHABLE.** Cold start cannot be reached from R5 inputs.

## Verdict
**Regression gate: QUALITY_READY_WITH_CONDITIONS.** The conditions are the four P2 findings above.

The gate covers only this frozen R5 corpus on the legacy route at digest `507f35fc…`. It is not fresh-holdout evidence, and it says nothing about native-path program quality, broad readiness or longitudinal learning. No retuning was performed. The fresh R6 holdout was not read, and verify scripts were not run.
