# G03 — reconciled outcome and adherence semantics

**Revision SDC-G03-r1 · 2026-10-23 America/Sao_Paulo · AUTHOR_SUBMISSION.** Author: `/root/semantics_author`, Product/UX + Data semantics workstream. Independent SSCTR sporting, source-fidelity and governance review are pending. This is a documentary candidate for the authorized Sports Domain Closure Round; it changes no Product Truth, runtime, provider contract, clinical rule or experience architecture.

## Question, baseline and target

Can an outcome be compared to the prescription actually attempted without treating a provider delivery, missing field, deliberate adaptation or duplicate as athletic success/failure? PDM-1.3 §3–6, AEC-1.3 §1/§4, AEOS-1.2-r2 §3/§13–15, SIS-1.1-r2 §5–6, RIL-1.1-r1 §3/§7 and STIL-1.1-r1 §2/§8 already require one reconciled fact, immutable target history and separate interpretation. G03/PS03 lacks concrete session comparators and partial/correction witnesses. Foundation 0.2 DATA_MODEL_CONTRACTS is a candidate representation aid, never an approved library.

Target: retain those owners and add a bounded reconciled-fact contract, dimensional comparators and adversarial synthetic witnesses. **Normalization establishes the fact; a versioned sporting method interprets it; a separate AE adequacy/necessity review decides any future adaptation.** No raw provider label crosses all three steps.

Preserving only provider `completed` was rejected because it cannot establish segment coverage or target revision. A universal adherence percentage was rejected because unlike constructs, deliberate withdrawals, unknown coverage and goal-specific stimuli cannot be fairly collapsed into one denominator. Dimensional exact/banded comparison is selected; physiological tolerance and stimulus achievement remain recipe-specific SSCTR dependencies.

## Canonical ownership and contract

The JSON companion defines these documentary projections over existing PDM/AEOS/SIS objects, not new database entities or APIs:

| Projection | Required meaning / owner |
|---|---|
| Target lineage | `original_target_ref`, accepted adaptation refs and `executed_target_map` by set/step/repeat instance, including effective start/acceptance boundary. AE owns plan intent; completed prefix retains its original executing revision. Unknown target association permits factual recording but blocks dependent adherence. |
| Reconciled fact | Subject and purpose; namespaced origin identity; canonical fact + active source/state revision; immutable delivery refs; occurred/observed/received timestamps with timezone; association status; correction/supersession lineage; provenance and actual coverage. Integration reconciles sources; Athlete Context owns the fact. |
| Observation dimension | Construct, value/unknown reason, explicit unit and load convention, scale/anchors, measurement/collection method and timing, source refs, transformation and coverage. Zero is a measured value; missing is not zero. Strength per-hand/total and different machine stacks are not interchangeable. |
| Intensity/configuration | Exact target method, baseline/calibration revision and construct. Session RPE, interval RPE, set RPE, RIR, HR and pain stay separate. Same zone number or exercise name is insufficient. RPE fixture anchors describe reported effort and do not certify physiological threshold. |
| Comparability assessment | Per dimension/task: configuration/method/context needed for that comparison, compatible revisions, coverage, critical conflicts, and `COMPARABLE / PARTIAL / NOT_COMPARABLE / UNKNOWN` with reason. A known distance may be comparable while intensity is unknown. No averaging away the latter. Sporting meaning belongs to Run/Strength under an approved method. |
| Freshness assessment | Decision scope, effective source/revision, observation time, relevant contextual changes, validity rule/ref, status and missing evidence. A historic fact does not expire as history because it is unsuitable for today's readiness. Elapsed hours or newest arrival alone do not establish validity. |
| Exposure projection | Canonical fact + active revision + unique segment/scope; known observed portion once, unknown past remainder marked unknown, future remainder projected separately. Planned past is never added to matched observed past. Local muscle projections and systemic interpretations reference the same exposure; they are not additional sessions. |
| Interpretation | Target actually executed, comparator revision, each dimension result, structural completion, sporting intent status and adherence status separately; evidence/limits and trigger. Product/UX owns honest meaning/agency; Data owns comparability; SSCTR owns sporting criteria. |

Conflicting revisions or identities are not resolved by majority, provider richness, receipt time, LLM confidence or averaging. Explicit verified origin/correction relationships may resolve them; otherwise preserve alternatives and ASK for the smallest missing fact. Similarity proposes association only. Two confirmed real sessions remain two even if metrics match.

## Bounded comparison method — SDC-CMP-EXACT-r1

This method is a **semantic test method**, not a physiological tolerance policy. An exact target or a range explicitly present in an accepted synthetic prescription is compared using its own meaning. Numeric sample values are fixture facts, not recommended doses, universal thresholds, validated minimum stimuli or a declaration that the recipe is approved.

1. Fix subject, purpose, fact frontier, identity, active correction and target segment map. Invalid critical identity, permission or target association retains only the affected interpretation.
2. Reconcile unique execution segments. A stopped/omitted segment requires explicit evidence; an unreported segment is unknown. `PARTIAL_KNOWN` and `COVERAGE_UNKNOWN` can coexist for different segments.
3. Compare each compatible dimension to the actual target: `BELOW / WITHIN_TARGET / ABOVE / UNCLASSIFIED`. A value inside an explicitly targeted range is within that range. For pace, faster means lower s/km; this is a dimension fact, not better adherence. A mixed vector stays mixed; no composite above/below training verdict is inferred.
4. Structural completion answers whether required segment instances are accounted for. It does not establish correct technique, intended stimulus, recovered state, adaptation or safety. An authenticated `completed` label without segment coverage establishes none of those.
5. `HONOURED_EXECUTED_TARGET` may be asserted only for the explicitly defined semantic dimensions when coverage is known and every required dimension conforms under this comparator. Any critical unknown/conflict makes overall adherence `UNCLASSIFIED`; known dimensional results remain visible. Physiological intent stays `UNASSESSED` until an applicable approved sporting criterion exists. Deliberate withdrawal before execution is assessed against the accepted successor target, never as failure or earned completion of the original.
6. Above-target work is recorded once and never awarded extra adherence credit. It triggers evaluation of the remaining horizon only where G02 materiality/adequacy rules apply. No automatic reduction, progression, debt repayment or plan mutation follows.

No tolerance beyond an explicitly targeted band is approved here. A measurement error model, permitted pause, technical standard, terrain equivalence, effort tolerance or criterion for essential stimulus requires its own method/revision/applicability. Data uncertainty does not become a silently broadened band. No universal completion/adherence percentage is used.

## Corrections, partials and delivery

- A confirmed correction supersedes only its referenced fact/segment scope. Recompute affected projections from the active revision once, keep prior interpretation/decision as historical with the original fact frontier, and re-evaluate future opportunity if material. Never revise a past plan as though it had been prescribed differently.
- Out-of-order delivery of a superseded revision does not reactivate it. Duplicate transport retry or confirmed mirrored origin supplies one observed exposure. An unresolved possible duplicate retains identity uncertainty and blocks dependent total/trend; it does not become two or vanish as zero.
- An athlete may confirm partial performance or correct units/association. Confirmation establishes that declared fact, without proving unobserved technique or clinical status. Uncertain source precedence requires reconciliation, not a default “manual always wins.”
- Source delay does not establish skipped work, honoured rest or nonadherence. Authorized logging/correction can continue while the dependent interpretation is held. An otherwise independently valid future plan is not automatically held because an optional metric is missing.
- A set warmup/work role, superset member, unilateral side or run repeat index is part of scope. Multi-muscle attribution, set RPE and external work are projections of the same fact; they cannot be summed as independent systemic exposure.

## Witnesses and acceptance

[SEMANTICS_WITNESSES.json](SEMANTICS_WITNESSES.json) contains **G03-W01–W19**, all explicitly synthetic, with input → reconciled fact → interpretation → action bounds, preserve/modify/must-not, agency and re-review triggers. Cases cover exact/banded targets, accepted reductions, known partial versus unknown coverage, confirmed duplicate versus distinct sessions, ambiguous identity, correction/out-of-order replay, stale readiness context, incompatible units, calibration changes/conflicts, in-session target lineage, above-target work and exposure accounting.

These are documentary expected results, **not executed runtime tests** or physiological gold. Numeric identity/arithmetic and reference checks can verify artifact consistency only. An SSCTR independent instance must judge each sporting interpretation. A Data/UX semantics judge must verify that comparisons cannot create false certainty or double counting.

## Evidence, limits and proposed disposition

All decisive contract requirements are **DECIDED normative/project semantics**, supported by the exact sections above and the direct mission. They are not claimed to be scientific discoveries. The pilot SSCTR-LIT-20261023-r1 CL4/SS6/SS7 is reused only as inherited contextual caution that intensity methods/scales are not interchangeable; this author has not freshly verified those full sources and adopts no numeric mapping. CL9/SS9 is not a clinical screening authority. Current scientific source audit belongs to the independent SSCTR/source reviewers.

**Proposed disposition: ACCEPTABLE_AUTHOR_SUBMISSION for the reconciled-fact/exact-dimensional subset, pending independent gates.** Full automatic G03 physiological adherence is **OPEN_BY_RECIPE**, not closed through syntax. Concrete gaps: G03-GAP-01 approved sporting intent/tolerance criteria for every activated recipe; G03-GAP-02 modality/context-specific comparability/freshness rules where decisive; G03-GAP-03 future executable integration/idempotency/lineage proof; G03-GAP-04 legal/purpose/provider validity under existing G06/G07/G09. The first two may close only for individually reviewed subsets; no entire-mode tolerance is inferred.

No new prescriptive approval is issued by this author and no human-queue item is created here. Any later independent approval with prescriptive impact must be linked by Chief to the funded-human queue. Re-review on target/method/configuration/calibration change, new active correction, coverage/identity resolution, material context change, revoked authority, relevant scientific correction or funded-human review. Publication and runtime authorization remain separate.
