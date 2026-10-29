# Scientific evidence protocol — SSCTR-EP-1.0.0

2026-10-23 · owner Sports Science & Concurrent Training Reviewer · applies to [constitution](CONSTITUTION.md) SSCTR-1.0.0. This is a project review method authorized by Founder, not a claim that any sports policy is empirically validated. Changes to this method require a version/delta; approval records retain the version actually used.

## 1. Bound the decision before searching

Record question/scenario, population/training status, intervention/configuration/dose, comparator, relevant outcome and horizon. Add priority, schedule, race proximity, equipment, recovery/history, known restrictions and unknowns only when decision-relevant. Separate supplied synthetic facts from real observations, inferred judgments and assumptions. An uncalibrated RPE target is not proof of physiological threshold. An absent symptom/restriction assessment is not a normal assessment.

State what evidence could change KEEP, an adaptation, scope eligibility or the wording of a policy. Stop research when the bounded decision is supported or a concrete gap prevents it; do not collect papers to hit a quota. A claim about one session, chronic adaptation, injury risk, adherence or service coverage requires different evidence.

## 2. Search and verify

Prefer PubMed/MEDLINE discovery; Cochrane when applicable; recognized ACSM/NSCA/IOC/BJSM/European College of Sport Science statements; peer-reviewed exercise physiology, sports medicine, endurance and strength/conditioning journals. PubMed indexing alone does not establish quality. Record exact query, database/site, search/access date, purpose, and notable inclusion/exclusion reasons. Search across relevant synonyms, including concurrent/hybrid training, sequence/order, session separation, trained status and endpoints. Include a directed counterevidence search; a null result is logged as a search result, not proof that contrary evidence is absent.

Open actual PubMed/publisher/official records; verify title, authors/year, DOI/PMID (when assigned), publication type and revision/retraction/correction status when indicated. Use stable direct source links. Verify effect magnitude/uncertainty, population, dose and endpoint from accessible text before using them. Cite exact sections/tables/pages or abstract sections where available; paraphrase accurately and obey source quotation limits. Distinguish FULL_TEXT, ABSTRACT_ONLY and RECORD_ONLY access. Do not claim inaccessible full text was read. An abstract can justify only narrow explicitly reported findings; it cannot be the sole basis for a prescriptive policy. Search snippets/model memory are discovery aids, not evidence.

## 3. Contextual evidence hierarchy

| Source class | Appropriate use and limits |
|---|---|
| Recognized consensus/position stand | Population/safety/programming frameworks when scope, methods, date and conflicts of interest fit; not automatically superior to newer direct evidence. |
| Systematic review/meta-analysis/umbrella review | Synthesized chronic or acute question when populations/interventions/outcomes match; inspect bias, heterogeneity, certainty, overlap and included-study limitations. Reviews of the same trials are not independent replications. |
| Randomized controlled trial | Direct causal evidence for a bounded intervention; useful when synthesis is absent, outdated or too indirect. One trial never becomes a universal rule. |
| Prospective/cohort study | Longitudinal association/real-world context with confounding and selection limits. No causal prescription solely from association. |
| Mechanistic/biomechanical study | Mechanism, local demand or movement-specific question; cannot alone establish long-term adaptation, readiness or clinical safety. |
| Acute study | Immediate performance/fatigue/recovery question; cannot establish chronic interference or universally adequate spacing. |
| Other observational evidence | Auxiliary when necessary, uncertainty explicit. Do not silently upgrade it to prescriptive certainty. |
| Preprint, unreviewed study, abstract-only report, commentary/opinion | Weak/auxiliary; never sole basis for prescriptive policy. Record status explicitly. |

No generic blogs, influencers, commercial marketing, manufacturer claims or Reddit/social evidence for training policy. A primary peer-reviewed trial may be more applicable than a broad review; justify that choice. Do not vote-count positive/negative studies or treat lack of statistical significance as equivalence/safety. No formal GRADE rating unless a documented appropriate appraisal was actually performed; otherwise use transparent qualitative appraisal.

## 4. Appraise and challenge

For each decisive source record study design, population/sample and training status, intervention/comparator/dose and duration, outcome/horizon, findings and precision, relevance and bias/limitations. Inspect risk of bias, intervention fidelity, confounding/cointerventions, representativeness, sex/age distribution, power/precision, publication bias/overlap and funding/conflicts when available. Missing information is a limitation; do not invent an appraisal score.

Attempt to refute the candidate rule. Identify a population or dose where it may fail; inspect disagreement, indirectness and competing explanations. Distinguish acute readiness from chronic adaptation, local from systemic fatigue, group mean from individual response, association from causation, and practical relevance from p-values. Explain why counterevidence changes or does not change the bounded decision. Claims of no interference require a defined endpoint/comparator/horizon; overlap by itself does not establish interference.

## 5. Label claims and calibrate decisions

Each material claim has a stable ID, source links (or empty with an explicit evidence gap), epistemic label OBSERVED/INFERRED/ASSUMED/DECIDED, applicability/limits, counterevidence and one evidence status:

| Status | Decision implication |
|---|---|
| WELL_SUPPORTED | Convergent applicable evidence supports the bounded conclusion; still list uncertainty and re-review conditions. |
| SUPPORTED_WITH_LIMITS | Applicable evidence supports a narrow conditional conclusion; specify population, outcome and exclusions. |
| PLAUSIBLE_BUT_UNCERTAIN | Mechanism/indirect or sparse evidence; no unqualified prescriptive approval. |
| INSUFFICIENT_EVIDENCE | Decisive gap; abstain/ASK/HOLD on dependent rule. Never invent an estimate. |
| CONFLICTING_EVIDENCE | Material unresolved disagreement; abstain or offer a limited reversible recommendation, retaining the uncertainty. |
| OUT_OF_SCOPE_CLINICAL | This role cannot provide the required clinical judgment; CLINICAL_HUMAN_REQUIRED. |

Evidence status is not disposition or confidence. Confidence LOW/MODERATE/HIGH needs a rationale that includes applicability and data quality. Approval requires WELL_SUPPORTED or SUPPORTED_WITH_LIMITS for every claim used as decisive support, verified eligible sources and fulfilled explicit conditions. A weak/conflicting contextual claim can be documented, but cannot be used to smuggle in a prescriptive approval. A reversible recommendation remains a recommendation; it does not close the dependent gate.

No magic numbers: HRV changes, volume reductions, hours of spacing, fatigue scores, sets or progression percentages require direct applicable support, measurement meaning and limits. Where one number is unsupported, use supported ranges/ordinal/context-dependent wording or abstain. Do not turn absence of evidence into evidence of no harm. Evidence may justify a larger change; show why relevant lower Change Levels are insufficient.

## 6. Apply to AE and controlled comparisons

Answer all ten constitution AE questions. Review goal alignment, priority, interference, recovery, stability, MEC, progression, agency, explanation/JEV and safety. Compare current adequacy with a concrete comparator. Priority can change what to protect without changing the final action. Material facts require provenance; labels such as lower/threshold/readiness alone are insufficient. Preserve user decisions and completed prefixes; review changes prospectively.

For the initial lower × threshold pair, use original CASE_INPUTS/case documents unchanged. Make the fixed-facts/priority-only contrast explicit. Unknown restrictions, response, calibration or tolerance stay unknown; hypothetical branches must be clearly conditional, never added as observed facts. KEEP, ASK, HOLD and conditional options may be identical between priorities. No obligation to create a priority effect.

## 7. Record, review and stop

Use [template](REVIEW_TEMPLATE.md), [schema](decision.schema.json), local [routing](registry.json) and [escalation/human policy](ESCALATION_AND_HUMAN_REVALIDATION.md). Store material records under the project review mission; never globals. The decision registry references bounded record IDs, versions and queue items, not a parallel policy source. Source/claim cross-links, exact target revision and conditions must be inspectable; schema validity does not prove scientific correctness.

Scientific disposition, evidence status, proposed action, whole-gate closure and publication remain separate. Chief routes any required independent source/policy review and consolidates existing gates; author/synthesizer cannot approve itself. A decision record alone never publishes Truth. Prescriptive approvals enter the funded-human queue; human/empirical/clinical validation flags remain false. Set expiry date or explicit event triggers, owner and supersession. Report supported subset and owned open items rather than claiming G01–G04 complete.
