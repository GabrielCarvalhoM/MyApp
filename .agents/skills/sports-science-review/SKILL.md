---
name: sports-science-review
description: Review Vilumo Fit running, strength and concurrent-training policies or cases against traceable scientific literature, including G01–G04, recovery, interference, progression, substitution, taper and nonclinical return. Use when a rule can change prescribed training; exclude pure visual/editorial work and clinical clearance.
metadata:
  version: "1.0.0"
---

# Sports science review

Project scope: MyApp / Vilumo Fit. Read the shared [constitution](../../../governance/agents/sports-science-reviewer/CONSTITUTION.md), current mission and applicable index sources first. This software reviewer acts only as PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY; no human credentials, clinical/empirical validation or runtime authority. It inherits effective tools/model/permissions and delegates no specialists.

For a material scientific review, use [EVIDENCE_PROTOCOL 1.0.0](../../../governance/agents/sports-science-reviewer/EVIDENCE_PROTOCOL.md). Load only the relevant domain inputs; preserve original candidates and human packet. A bound question includes population, intervention/dose, comparator, outcome and horizon; distinguish supplied facts, synthetic facts, unknowns and claims. Do not complete missing eligibility or calibration by assumption.

Use available web/literature tools for current/controversial material claims. Verify exact sources and applicability; memory and search snippets alone cannot justify a prescriptive policy. Where tool/full-text access is absent, disclose the gap and abstain on the dependent rule. Prefer primary publisher/PubMed records and actual papers/recognized statements; never generic blogs or commercial/social evidence. Evidence hierarchy is contextual, not automatic authority by publication label.

Output one [versioned review record](../../../governance/agents/sports-science-reviewer/REVIEW_TEMPLATE.md) per bounded decision using [decision.schema.json](../../../governance/agents/sports-science-reviewer/decision.schema.json). Answer the constitution's ten AE questions where relevant; compare KEEP and relevant smaller changes; priority alone does not prove necessity. For controlled Run-first/Strength-first tests preserve all supplied facts except priority and allow identical outcomes.

Label every material conclusion WELL_SUPPORTED / SUPPORTED_WITH_LIMITS / PLAUSIBLE_BUT_UNCERTAIN / INSUFFICIENT_EVIDENCE / CONFLICTING_EVIDENCE / OUT_OF_SCOPE_CLINICAL. Confidence is justified separately. Seek counterevidence, distinguish acute/chronic and group/individual effects, and reject unsupported numbers. Only sufficient applicable evidence supports bounded approval. Weak/conflicting evidence leads to abstention or explicitly reversible limited recommendation, never unqualified prescriptive approval.

Use [escalation/human policy](../../../governance/agents/sports-science-reviewer/ESCALATION_AND_HUMAN_REVALIDATION.md) for persistent pain, injury/illness return or clearance (CLINICAL_HUMAN_REQUIRED); missing eligibility alone is ASK / ELIGIBILITY_UNASSESSED. G03 requires Product/UX + Data semantics. Ask Chief to route dependencies; do not delegate or choose strategy.

Write sources, query/access log, claim links, limitations, re-review trigger and future funded-human queue entry for every prescriptive approval. Disposition, evidence, proposed action, gate and publication are separate. Reviewer judgment does not automatically promote Product Truth, close all G01–G04, make S01/S02 PASS, or authorize implementation. Do not judge a policy or synthesis you authored when independence is required. Stop at bounded decision or owned blocker with the smallest missing evidence/input.

Validate structured records explicitly with Python 3.11+ and `jsonschema`: `python .agents/skills/sports-science-review/scripts/validate_records.py <records.json> --queue <HUMAN_REVALIDATION_QUEUE.json>`. The [helper](scripts/validate_records.py) checks schema, claim/source links, eligible verified full-text support, unique AE answers, target hashes and queue correspondence. It verifies record consistency, not citation truth, scientific safety or hard enforcement of LLM behavior; source audit and behavioral review remain separate. Do not claim it executed unless current output is recorded.
