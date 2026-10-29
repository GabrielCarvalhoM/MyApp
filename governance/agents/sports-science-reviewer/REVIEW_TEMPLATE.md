# SSCTR material review template — 1.0.0

Use one decision per bounded question/item/version. Markdown can explain a structured JSON record; JSON must satisfy [decision.schema.json](decision.schema.json). This template is not a blank human signature form and has no implied approval.

Run the project [record consistency validator](../../../.agents/skills/sports-science-review/scripts/validate_records.py) with the explicit records file and `--queue` file before submission. This checks structure/cross-links, not scientific truth or hard LLM enforcement; independent source/behavior checks remain necessary.

- Review ID / revision / date / instance ID:
- Agent / constitution / evidence protocol versions:
- Target artifact / revision / SHA-256 when supplied / rule IDs:
- Gate subset / item IDs / prescriptive impact:
- Question / Scenario / outcome and horizon:
- Population / Context / eligibility status:
- Supplied facts (real vs synthetic), inferred judgments, assumptions and unknowns:
- Evidence Reviewed / literature snapshot / query log / inclusion and exclusion reasons:
- Evidence Quality / access depth / bias / precision / design relevance:
- Relevant Findings: claim ID → statement → epistemic class → evidence status → source IDs → limitations:
- Counterevidence / failed applicability / confounding / attempted refutation:
- Applicability (population, training status, dose, outcome, horizon):
- Decision disposition (APPROVE, APPROVE_WITH_CONDITIONS, REVISE, REJECT, ABSTAIN, LIMITED_REVERSIBLE_RECOMMENDATION, OUT_OF_SCOPE):
- Proposed AE action (KEEP, ASK, HOLD, CONDITIONAL_OPTIONS, MODIFY_CANDIDATE, CLINICAL_HUMAN_REQUIRED, NOT_APPLICABLE):
- Preserve:
- Modify:
- MEC / existing Change Level / why relevant smaller options fail:
- Trade-off / protected goal and progression / change cost:
- Must Not:
- Confidence (LOW/MODERATE/HIGH) and rationale:
- Evidence Status (six allowed labels), separate from disposition:
- Limitations / conditions / smallest missing evidence or input:
- Ten AE questions and answers (or explicit not applicable):
- Gate Status: NOT_CLOSED_BY_THIS_RECORD; whole gate closure = false:
- Publication Status: NOT_PUBLISHED; existing governance next owner/action:
- Human validation = false / empirical product validation = false / clinical clearance = false:
- Re-review owner / date or event-based expiry / triggers:
- Human queue item/ref for every approved prescriptive decision:
- Supersedes / superseded-by / dependent items invalidated:
- Sources: verified bibliographic metadata, DOI/PMID when assigned, direct URL, accessed date, read depth, source type, study context/method/findings, locator, limitations/counterevidence:

Clinical case: disposition OUT_OF_SCOPE; evidence status OUT_OF_SCOPE_CLINICAL; proposed action CLINICAL_HUMAN_REQUIRED; do not recommend a substitute training dose. Missing eligibility without a clinical signal: ASK / ELIGIBILITY_UNASSESSED; leave prescription unapproved. A scientific source supporting a general principle does not establish this person's eligibility or prove this product's coverage.
