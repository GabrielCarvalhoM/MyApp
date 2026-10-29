# R5 holdout regression through R6

Deliverable 1 of DOMAIN_COACHING_R6. The machine-readable record is [R5_HOLDOUT_REGRESSION_R6.json](R5_HOLDOUT_REGRESSION_R6.json). It joins the raw replay [R5_HOLDOUT_REPLAY_R6.json](R5_HOLDOUT_REPLAY_R6.json) with the independent classification in [r5-regression-review.json](../../audits/domain-coaching-r6-2026-10-26/reviews/r5-regression-review.json); the judge's own account is [r5-regression-review.md](../../audits/domain-coaching-r6-2026-10-26/reviews/r5-regression-review.md).

## What was run
The 24 frozen R5 holdout cases were replayed, facts unchanged, through the frozen R6 runtime (source digest `507f35fc…`, policy R6-POLICY-2 `af2779fe…`, real SSCTR authority). Every case enters through the R5-INPUT-1 legacy route (`src/r6-legacy.mjs`). This is a development regression: the R6 corrections were designed against these exact failures, so improvement here is expected and is not evidence of generalisation. The fresh R6 holdout is the generalisation evidence.

Integrity was checked by the judge, not the runtime author:
- the corpus (`9557f4bf…`), the R5 first raw (`c202e0ab…`) and the R5 quality review (`eeb9c09d…`) match BASELINE.json;
- all 53 freeze entries match;
- all 24 cases re-run in memory hash-identical to the published outputs;
- there were 0 errors and no official effects.

## Before → after (independent classification)

| Label | R5 | R6 |
|---|---|---|
| BEST_SUPPORTED | 4 | 11 |
| ACCEPTABLE_ALTERNATIVE | 4 | 10 |
| SUBOPTIMAL | 3 | 0 |
| INSUFFICIENT_INFORMATION | 6 | 2 |
| UNSUPPORTED | 7 | 0 |
| CLINICAL_OUT_OF_SCOPE | 0 | 1 |

Generation: 23 PROPOSED and 1 ASK, against R5's 5 INVALID_INPUT and 1 UNSUPPORTED. All 23 intended review steps execute, against 14 in R5. No unsafe positive prescription was found. No case got worse at runtime. One label went down: H18. Its output is identical to R5, and the judge found a latent defect the R5 judge had missed.

## Disposition of every R5 defect

The three R5 review findings:

| R5 finding | Cases | Disposition |
|---|---|---|
| QH-BALANCED-ORDER | H03, H11, H20 | **Resolved.** The selection is order-invariant (reversed-order probe) and flips under STRENGTH_FIRST. It is decided by lowest worst-case joint harm, with the cost disclosed. |
| QH-REPRESENTATION-CLOCK | H07, H08, H10, H11 | **Resolved, with a note.** The evaluator adapter binds a day-precision observation to the latest causal instant of its day that is not after the review clock. Real ingestion still has to carry timestamps (see PROVENANCE_TIME_R6). |
| QH-CONTRACT-BREADTH | H02, H09, H13, H16, H19, H24 | **Resolved for these cases.** The fixes are per-alternative admissibility, dependent dimensions and substitute candidates. |

Per case:

| Case | Root cause (runtime author) | R5 → R6 | Disposition |
|---|---|---|---|
| H01 | EVENT_TRANSITION_NOT_DERIVABLE | ACCEPTABLE → ACCEPTABLE | Root cause confirmed: taper and race week now derived. Stays ACCEPTABLE because the legacy route builds no progression (F-LEGACY-FLAT). |
| H02 | VALIDATION_COUPLED_TO_UNUSED_ALTERNATIVES | UNSUPPORTED → ACCEPTABLE | Resolved (confirmed); legacy flat build is the residual. |
| H03 | BALANCED_INPUT_ORDER | SUBOPTIMAL → BEST | Resolved (confirmed). |
| H04, H05 | BOUNDED_R5_BEHAVIOR | ACCEPTABLE → ACCEPTABLE | Not a defect; identical output. |
| H06 | BOUNDED_R5_BEHAVIOR | INSUFFICIENT → INSUFFICIENT | Open, bounded (F-H06-COLD-START-UNREACHABLE). The R5 input shape cannot reach the native cold start, so it still asks for current tolerated exposure. The native R6 intake serves the same athlete with an establishment program. |
| H07 | ADAPTER_CLOCK_AND_STRUCTURED_TOTALS | INSUFFICIENT → BEST | Resolved (confirmed). |
| H08 | ADAPTER_CLOCK_AND_PHASE_COMPARABILITY | INSUFFICIENT → BEST | Resolved (confirmed). |
| H09 | VALIDATION_COUPLED_TO_UNUSED_ALTERNATIVES | UNSUPPORTED → BEST | Resolved (confirmed). |
| H10 | ADAPTER_CLOCK | INSUFFICIENT → BEST | Resolved (confirmed). |
| H11 | BALANCED_INPUT_ORDER_AND_ADAPTER_CLOCK | SUBOPTIMAL → BEST | Resolved (confirmed). |
| H12, H14, H23 | BOUNDED_R5_BEHAVIOR | BEST → BEST | Not a defect. |
| H13 | VALIDATION_COUPLED_TO_UNUSED_ALTERNATIVES | UNSUPPORTED → ACCEPTABLE | Resolved (confirmed). Residual, P3: it regresses only at the third adverse session (F-H13-ADVERSE-HYSTERESIS). |
| H15 | BOUNDED_R5_BEHAVIOR | INSUFFICIENT → INSUFFICIENT | Not a defect. The correct answer is a targeted ASK for a current eligibility assessment. |
| H16 | RETURN_PREPARATION_DIMENSION | UNSUPPORTED → ACCEPTABLE | Resolved (confirmed). Residual, P3: one staged week on the legacy route (F-H16-RETURN-SCALING). |
| H17 | BOUNDED_R5_BEHAVIOR | UNSUPPORTED → CLINICAL_OUT_OF_SCOPE | Not a defect; correct clinical routing, relabelled. |
| H18 | BOUNDED_R5_BEHAVIOR | BEST → ACCEPTABLE | Latent defect, found by the R6 judge and shared with R5: a persistent schedule change moves week 2 only (F-H18-HORIZON-SCOPE). Open. |
| H19 | SUBSTITUTION_NOT_SELECTED | UNSUPPORTED → BEST | Resolved (confirmed). |
| H20 | BALANCED_INITIAL_GENERATION | SUBOPTIMAL → BEST | Resolved (confirmed): the initial generation is fixed, as the Founder required. |
| H21 | UNKNOWN_COMBINED_TOLERANCE | INSUFFICIENT → ACCEPTABLE | Partially resolved. Generation is fixed; the learned ranking is cited but not operative on this corpus (F-H21-LEARNING-NOT-OPERATIVE). Open. |
| H22 | EVENT_TRANSITION_NOT_DERIVABLE | ACCEPTABLE → ACCEPTABLE | Resolved (confirmed): race placed with a derived taper. |
| H24 | STALE_ALTERNATIVE_POISONS_BASELINE | UNSUPPORTED → ACCEPTABLE | Partially resolved. Staleness is fixed. The duplicate and conflict part is untested on the frozen facts; a counterfactual shows the first-seen payload stays in the learning model (F-H24-CONFLICT-FIRST-WINS). Open. |

Every residual is carried into [OPEN_GAPS_R6](OPEN_GAPS_R6.md) with its owner. The judge's regression gate is **QUALITY_READY_WITH_CONDITIONS**; the conditions are the four P2 findings (F-LEGACY-FLAT, F-H18-HORIZON-SCOPE, F-H21-LEARNING-NOT-OPERATIVE, F-H24-CONFLICT-FIRST-WINS).

## What this does not show
- The native R6 path is not exercised here: intake, cold start, planned progression, rotation and native adaptation. Those are judged on the fresh R6 holdout, the simulator and the demonstrations.
- BEST_SUPPORTED is scoped to each case's primary decision, as in R5. It is not a whole-program or physiological claim.
- The evidence is synthetic, with one judge instance and no human, empirical or clinical validation.
