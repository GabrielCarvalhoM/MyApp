# Shared Training Demand & Interference Model — 0.2

Shared vocabulary permits cross-sport questions without equivalent units or calibrated bands. Example estimates remain UNKNOWN. Dimensions are optional unless their construct serves a real decision; adding a dimension never justifies new collection by default.

| Candidate dimension | Meaning / evidence needed | Exclusion / consumer |
|---|---|---|
| lower_local / upper_local | Region-specific task exposure/estimated local burden, dose/side/athlete-linked | Projection of muscle/task detail, not another exposure to sum. Local constraint/overlap. |
| muscle-group detail | Curated role projection of unique segments | Parent/child labels cannot be added; no universal effective-set weights. Specificity. |
| cardiovascular | Named cardiovascular response/demand construct and protocol | Not identical to metabolic stress, RPE or total fatigue. Domain interpretation. |
| neuromuscular | Specific force/power/velocity/task endpoint and horizon | Not a universal measured CNS-fatigue quantity. Relevant next-task preservation. |
| eccentric | Contraction/dose/configuration; residual effect needs method, novelty/history | Name, uphill label or soreness is not damage/recovery score. Mechanical context. |
| axial | Mechanical loading/configuration relevant to axial support | Not injury probability, spinal-force measurement or systemic fatigue. Alternatives. |
| impact | Repeated contact/landing with surface/grade/task context | Not distance alone, eccentric burden or injury risk. Mechanical context. |
| metabolic | Named energetic/metabolic endpoint and dose context | Separate momentary effort/rate from accumulated exposure; no strides=high default. Use only where independently supported. |

Systemic recovery burden is an optional summary hypothesis of the **same exposure and response signals**, with endpoint/window/method/uncertainty. Never add it to its components. Skill/stability are task × support × athlete requirements/feasibility, not fixed fatigue. Novelty belongs to history. Schedule sensitivity, key-session proximity and criticality belong to timing/intent/Change Cost context, outside the physical vector.

## Representation and comparison

Use TrainingDemandProfile in DATA_MODEL_CONTRACTS.md. A usable band needs a defined construct, prescription/configuration revision, athlete snapshot, anchored comparison basis/method/rule, source/judgment, limitations and validity. Otherwise UNKNOWN with reason. Replacing high/moderate_high with arbitrary numbers is not a correction.

Overlap means shared region/construct. A label in one sport is not portable without a reviewed comparator covering both. No sum/average/dot product or km↔sets conversion exists. Unknown is unordered and never low/zero. Multiple dimensions from one segment are views of one exposure, not additive accounting.

## Overlap, effects and intervention

1. Reuse canonical ExposureContribution and active revisions (SIS SIL-I1–5). Reconcile observed against matched planned past. Preserve unknown past and separately project valid future remainder.
2. Describe overlap, exact order/timing, endpoint and horizon. Acute next-session performance and chronic adaptation are different claims with different evidence.
3. Output SIS InteractionAssessment: applicable dose/population, endpoint/horizon, response evidence/counterevidence and uncertainty per alternative. No significant group-average interference does not establish this athlete's readiness; acute fatigue does not prove chronic interference.
4. Adequacy, necessity, stimulus, Minimum Effective Change and PlanStabilityCost remain rule-bound AEOS decisions. Priority changes what is protected, not physical dose. Invalidity/missing authority is not repaired by calling a lower dose conservative.

Upper + easy can have little shared lower exposure while systemic/time constraints matter. Heavy lower + hill repeats can overlap, yet ascent/descent, work/rest and history matter before MOVE. These counterexamples reject blanket rules; they do not certify recipes.

DOMAIN_REVIEW_FIXTURES.json supplies concrete doses, hillside recovery, partial reconciliation and unknown alternative effects. It supplies no scientific cost estimator or positive sporting oracle.
