# Escalation and human revalidation — SSCTR-HR-1.0.0

2026-10-23 · derived from SSCTR-05/06/08/09/10/11 and current Founder authorization. This policy creates no clinical authority, revenue threshold, legal conclusion or new runtime behavior.

| Trigger | Record / immediate handling | Owner and smallest resolution |
|---|---|---|
| Missing restrictions, history, tolerance, calibration or equipment eligibility | ASK / ELIGIBILITY_UNASSESSED; no prescriptive approval. Do not infer illness or normality. | Chief obtains only decision-relevant input; qualifying facts permit bounded review. |
| Clinical injury/illness return, persistent pain, functional limitation, pathology, contraindication or clearance need | OUT_OF_SCOPE_CLINICAL + CLINICAL_HUMAN_REQUIRED; no training workaround. | Qualified health professional; clinical boundary never waits for product revenue. |
| Scientific insufficiency or inaccessible decisive evidence | ABSTAIN / INSUFFICIENT_EVIDENCE; dependent rule stays open. | Scientific reviewer reports missing comparator/population/source; Chief routes feasible evidence. |
| Material contradictory literature | CONFLICTING_EVIDENCE; abstain or limited reversible recommendation with monitoring/stop criteria, no unqualified approval. | Scientific reviewer evaluates applicability; Chief owns unresolved cross-domain decision. |
| Strategy or population expansion beyond approved V1 | No silent scope expansion; return bounded options/impact. | Founder decides; PCG formalizes authorized delta. |
| G03 adherence/comparability semantics | Sporting opinion alone cannot close it. | Product/UX + Data meanings/provenance, coordinated by Chief. |
| Runtime, safety, privacy, implementation or service-model legal question | No authority by this agent; relevant item remains unapproved. | Existing competent owner/gates; legal/clinical human where required. |
| Policy author asked to judge own work, or synthesis author asked to independently audit it | Report independence gap; self-check is not gate. | Chief assigns a distinct fresh reviewer instance. |
| New systematic review/meta-analysis, population/scope/data/library change, adverse event or runtime inconsistency | Mark impacted approvals stale/pending re-review; preserve old record and dependent map. | Review owner + Chief bound affected items; clinical event routes to human as needed. |

## Queue and funding trigger

The queue lives at `reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json` initially; future missions reuse or supersede it with an explicit pointer, never create an untracked second queue. Each approved decision with prescriptive impact MUST be appended immediately with decision ID/revision, target/rule/version, approved scope/conditions, approval date and re-review trigger, `QUEUED_FOR_FUNDED_HUMAN_REVALIDATION`, owner Chief/Founder, and human review = null. Rejected/abstained items are not misrepresented as approved prescriptive decisions; their dependency remains in the decision registry.

When Founder records that revenue/funding is sufficient to contract a qualified professional, record funding declaration reference/date and move every applicable approved prescriptive item to `HUMAN_REVALIDATION_REQUIRED`. No fabricated financial threshold, automatic revenue monitoring, scheduling, purchase or hiring is authorized. New approvals after the funding trigger enter HUMAN_REVALIDATION_REQUIRED directly. This trigger affects all prior prescribing-impact approvals even if not yet published or implemented.

The contracted human may MAINTAIN / MODIFY / REVOKE with name, actual qualifications/professional scope verified as appropriate, review date, evidence, rationale, conditions, artifact/rule/version and effective scope. Record actor_type HUMAN_PROFESSIONAL separately from AI_AGENT and never fabricate credentials on the AI's record. Human review provenance must be accessible; pending identity verification is not verified review. The AI has no veto. Preserve previous records, mark supersession/revocation, identify impacted policy/cases/gates and have competent owners re-evaluate downstream changes.

Maintain provisional review labels in the history after human revalidation; do not rewrite old AI decisions as human decisions or retroactively claim empirical validation. Queue completion does not authorize clinical clearance, legal service-model approval, publication, release or runtime changes beyond existing gates.
