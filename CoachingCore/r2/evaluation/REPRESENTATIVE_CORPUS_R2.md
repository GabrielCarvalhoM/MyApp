# Representative synthetic corpus R2

R2-EVAL-1.0.0 · 2026-10-24 · Independent scenario authoring. Facts and semantic expectations are frozen before R2 evaluation. The runtime must never import this file or its JSON companion.

This corpus contains 42 ordinary V1 decision situations. It deliberately includes incomplete and non-prescriptive cases rather than only policy success demonstrations. It is a designed challenge set, not a probability sample, an estimate of real-world prevalence, scientific approval, efficacy or safety evidence.

The author read the BSR contract, input/output schemas and current fixture adapter to understand transport and boundaries. No runtime implementation, runtime output or development oracle was imported to create facts or expected prescriptions. No existing development fixture was copied. The author is not the scientific approver or runtime quality judge.

## Frozen expectation contract

A positive target is an independently identified product opportunity conditional on applicable scientific approval, concrete recipe, executable binding and trace. It is not permission to prescribe. A correct ASK/HOLD/NOT_SUPPORTED response to an unresolved opportunity remains a visible coverage gap and never enters the positive numerator. Strict semantic controls include missing eligibility, clinical dependencies, adequate ordinary work, optional-session omission, construct uncertainty and learning overfit.

No exact dose oracle is supplied. Numeric histories and available candidate values are synthetic individual facts, not universal laws. The runtime must independently justify its action with current approved policy evidence. The evaluation must preserve official state, completed exposure and clinical boundaries. Single noisy observations cannot create rules.

An API adapter may losslessly rename these facts, and must report facts it cannot represent. It cannot replace case facts or expectations with development outputs. Results, replay rows, classifications and reviews belong in separate artifacts. A later corpus revision requires an explicit reason and a new freeze hash; it must not be silently substituted for this baseline.

Corpus content SHA-256 (sorted-key JSON of cases): `efd521341252db0413ea9dbac0b28df83ef5b7606cad1b99fd025ea024f07971`.

## Composition

| Group | Cases |
|---|---:|
| ACF-G01 | 8 |
| ACF-G02 | 10 |
| ACF-G03 | 6 |
| ACF-G04 | 6 |
| ACF-G05 | 10 |
| ATHLETE_SPECIFIC_LEARNING | 2 |

| Independent target category | Cases | Interpretation |
|---|---:|---|
| POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED | 23 | Opportunity; not approval or achieved coverage |
| SUPPORTED_KEEP | 3 | Semantic control |
| USEFUL_ASK | 8 | Semantic control |
| CORRECT_ABSTAIN_OR_HOLD | 2 | Semantic control |
| NOT_SUPPORTED_YET | 4 | Semantic control |
| CLINICAL_OR_OUT_OF_SCOPE | 2 | Semantic control |

Coverage includes Run-first, Strength-first and Balanced goals; novice/intermediate status independently for each modality; no/partial/rich wearable data; reported/low/comparable history; first weeks; ordinary weeks; double sessions; missed optional work; local and systemic fatigue; small deviations; return; event weeks; calibration; and learned history. The broad case denominator must not be represented as population coverage.

## Case manifest

| ID | Gap | Situation | Independent target |
|---|---|---|---|
| REP-R2-01 | ACF-G01 | New athlete, no product history, first low-data week | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-02 | ACF-G01 | Run novice, experienced lifter, first integrated week | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-03 | ACF-G01 | Strength novice, established runner, first strength exposure | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-04 | ACF-G01 | Unknown movement competence with a requested loaded squat | USEFUL_ASK |
| REP-R2-05 | ACF-G01 | First VO2 family requested by a run novice | USEFUL_ASK |
| REP-R2-06 | ACF-G01 | Reported familiar easy running without imported device history | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-07 | ACF-G01 | First run/walk establishment after comfortable walking | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-08 | ACF-G01 | Incomplete onboarding and unknown eligibility | USEFUL_ASK |
| REP-R2-09 | ACF-G02 | Local calf fatigue and an optional unperformed accessory | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-10 | ACF-G02 | Converging systemic fatigue and under-target cruise execution | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-11 | ACF-G02 | Repeated over-target strength execution with familiar next step | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-12 | ACF-G02 | Under-target strength execution in one known configuration | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-13 | ACF-G02 | One small easy-run deviation in an otherwise ordinary week | SUPPORTED_KEEP |
| REP-R2-14 | ACF-G02 | Missed optional easy session with normal core work | SUPPORTED_KEEP |
| REP-R2-15 | ACF-G02 | Double-session conflict with Run-first priority | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-16 | ACF-G02 | Same double-session conflict with Strength-first priority | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-17 | ACF-G02 | A wearable-only recovery warning without an athlete problem | SUPPORTED_KEEP |
| REP-R2-18 | ACF-G02 | Configured substitution requested without a complete joint prescription | USEFUL_ASK |
| REP-R2-19 | ACF-G03 | Short travel interruption, familiar runner, first return session | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-20 | ACF-G03 | Moderate work interruption, familiar strength athlete | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-21 | ACF-G03 | Hybrid return week after a nonclinical pause | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-22 | ACF-G03 | Old training history without interruption reason or current response | USEFUL_ASK |
| REP-R2-23 | ACF-G03 | Post-pause current test has an incompatible but nonclinical response | CORRECT_ABSTAIN_OR_HOLD |
| REP-R2-24 | ACF-G03 | Return following injury with persistent pain | CLINICAL_OR_OUT_OF_SCOPE |
| REP-R2-25 | ACF-G04 | Recreational 10K Run-first race week with familiar strength maintenance | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-26 | ACF-G04 | Recreational half-marathon Run-first week | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-27 | ACF-G04 | Balanced athlete temporarily elevates a familiar 10K event | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-28 | ACF-G04 | First half-marathon with incomplete long-run and race-pace history | NOT_SUPPORTED_YET |
| REP-R2-29 | ACF-G04 | Post-10K ordinary recovery transition without a capacity claim | USEFUL_ASK |
| REP-R2-30 | ACF-G04 | Race-week illness symptoms override event preference | CLINICAL_OR_OUT_OF_SCOPE |
| REP-R2-31 | ACF-G05 | Easy session without a wearable or lab test | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-32 | ACF-G05 | Recovery label has no separately calibrated construct | USEFUL_ASK |
| REP-R2-33 | ACF-G05 | Steady session with a personally familiar effort anchor | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-34 | ACF-G05 | Cruise session with recent comparable execution and disagreement limits | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-35 | ACF-G05 | VO2-style label from a proprietary watch prediction | NOT_SUPPORTED_YET |
| REP-R2-36 | ACF-G05 | Short intervals without recent comparable high-speed exposure | NOT_SUPPORTED_YET |
| REP-R2-37 | ACF-G05 | Long-run next step after compatible repeated familiar exposure | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-38 | ACF-G05 | Hills on an unfamiliar steep route | USEFUL_ASK |
| REP-R2-39 | ACF-G05 | Familiar relaxed strides with explicit recovery | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-40 | ACF-G05 | Race-pace work inferred from a noncomparable old result | NOT_SUPPORTED_YET |
| REP-R2-41 | ATHLETE_SPECIFIC_LEARNING | Repeated lower-before-cruise response ranks existing schedule options | POSITIVE_PRESCRIPTION_OR_ADAPTATION_SUPPORTED |
| REP-R2-42 | ATHLETE_SPECIFIC_LEARNING | Single noisy fatigue-performance association cannot create a rule | CORRECT_ABSTAIN_OR_HOLD |

## Reading and scoring

Use the JSON facts and decision question as the independent input, then classify the actual returned semantics. Report actual positive/KEEP/ASK/HOLD/unsupported/clinical counts separately. Report unresolved positive opportunities by case ID and missing domain/recipe/input/binding dependency. Do not change target categories to match runtime results, double-count a replay, or treat positive opportunity counts as achieved prescriptions.

For every actual positive result, inspect necessity, essential stimulus, alternatives, chosen action, confidence, next check and shadow invariants. A MODIFY label without concrete proposal and applicable independent review is not positive coverage. Correct failure-closed behavior and positive product coverage are separate judgments.
