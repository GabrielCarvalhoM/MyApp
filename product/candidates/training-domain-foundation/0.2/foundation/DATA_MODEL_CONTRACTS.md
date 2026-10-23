# Data Model Contracts — TDF-CONCEPT-0.2

Conceptual, typed review contract; not an API/database implementation. These payload refinements reuse AEOS §5, SIS §§3/5/6, RIL and STIL. No second Athlete Model, plan, policy registry or exposure ledger. DOMAIN_REVIEW_FIXTURES.json exercises a bounded subset; no formal JSON Schema or general runtime validator is claimed.

## Common types and cardinalities

`Ref = {id: nonempty string, revision: nonempty string}`. Both mandatory; no implicit latest revision. `Quantity = {value: finite number, unit: explicit unit}`. Seconds, meters, kg; HR bpm, pace s/km, speed m/s, power W or method-specific unit, RPE scale-specific. No conversions between modalities, machine stacks, total/per-hand load or pace/speed ranges by assumption.

`Knowledge<T> = {status: KNOWN|UNKNOWN|NOT_APPLICABLE|CONFLICT|NOT_COLLECTED, value:T|null, reason:string}`. Only KNOWN carries a usable value. Zero is not missingness. Unknown may include stale/incomplete data with reason; conflicting observations remain individually referenced. Empty array means known empty only with coverage; otherwise use Knowledge. N/A needs a task-specific reason. Examples use UNKNOWN for missing values and null only where explicitly documented, such as an absent approval.

Every catalog entity carries id/revision, status and claim provenance. Approved interpretations additionally reference the existing AuthorityRef/PolicyBundle: population/task, rule/method revision, approver/competence, scope, validity/withdrawal conditions and limitations. Approval absence is null, never 'LLM approved'. Current validity/revocation must be checked for dependent use under AEOS; not implemented here.

One StrengthExercise → zero or more StrengthVariations. A runnable StrengthPrescription selects exactly one variation, not an unresolved family. One Session → one or more ordered prescriptions of its modality, one SessionIntent revision and zero or more observation segments. One RunPrescription → one archetype/template reference and a nonempty ordered block tree. Multi-purpose blocks do not create duplicate canonical sessions. Review objects may leave inputs unknown; an approved prescription must resolve every decision-critical input.

## Strength

| Entity | Minimum content / relation | Invariant / consumer |
|---|---|---|
| StrengthExercise | id/revision, name, aliases:string[], taxonomy candidates: patterns, muscle roles, mechanic; source/review per claim | Identity only. Muscle labels do not establish activation, effective sets or transfer. Family equipment options are not eligible configurations. |
| StrengthVariation | exercise_ref:Ref; equipment:string[] as complete AND set; resistance_mode:external/bodyweight/assisted/mixed; laterality:bilateral/unilateral/alternating; relevant grip/support/stance/ROM/contraction; provenance/approval | Alternatives are different variations. Bodyweight cannot replace an anchor. Specify machine/configuration, assistance and available increments when material. |
| StrengthPrescription | id/revision; variation_ref; session_intent_ref; ordered StrengthSet[1..n]; accepted_envelope_ref or explicit absence; approval | STIL modality payload, not a parallel plan. Same identity at different dose is different exposure. |
| StrengthSet | id; role:warmup/work/technique; side:left/right/both/alternating; completion:{basis:reps/duration/open, amount:Quantity or N/A, advance:manual/automatic}; load:{value,unit,convention}; effort:{metric,value,scale_ref,collection,status}; rest/tempo/ROM with unknown states | Reps and duration are alternatives. Static holds use duration and contraction mode. Total including bar, per-hand, machine/stack, assistance and bodyweight conventions are explicit. RIR/set-RPE differs from session RPE and pain. |
| StrengthExecution | canonical_fact_ref; session_ref; executing_prescription_ref; observed_at/received_at; segments[{set_id,target_revision_ref,actual dose/load/effort/rest,observation_status}]; coverage/correction refs | Partial/omitted/interrupted/unknown/deliberately withdrawn differ. Completed parts retain their executed target revision. New remainder proposal never rewrites observed work. |

Only seven selected configuration examples bind complete equipment sets. The 32 concept seeds retain unresolved configuration tokens for review; this is not 32 approved variations. Mechanic `core`, mixed pattern axes and parent/child muscle labels remain review issues, not a controlled vocabulary. No numerical muscle roll-up/effective-set coefficient exists.

## Running

| Entity | Minimum content / relation | Invariant / consumer |
|---|---|---|
| RunSessionArchetype | id/revision; purpose/structure candidates; target_options[{metric,role,optional,reference_kind}]; progression knobs; required context; provenance/approval | Axes may overlap: structure, purpose, duration-relative role, event, phase. Taper_specific is a phase template, not intensity. Tempo/threshold alias/construct distinction awaits review. |
| RunIntensityReference | id/revision; metric/construct; method/protocol/source; unit/scale/anchors; established_at; population/applicability; validity/comparability/limitations; approval | Zone number is not portable. Synthetic RPE6 is not a measured threshold. Preserve exact target/reference used in history. |
| RunWorkoutBlock | Union: step/sequence/repeat. Step: id, role:warmup/work/recovery/cooldown, completion:{basis:duration/distance/open,amount,advance}, target, terrain, recovery_mode. Sequence: ordered children[1..n]. Repeat: positive integer iterations_total, work subtree, optional recovery subtree, explicit recovery_after_last | Total includes first repetition. Block ID plus repetition index identifies execution. Recovery has its own target/completion. Time is completion, not intensity. No implicit final recovery. |
| RunPrescription | id/revision; archetype_ref; session_intent_ref; intensity_reference_ref; blocks[1..n]; derived totals by construct; envelope if applicable; approval | At most one active primary target per step. Secondary constraints need approved precedence. Estimates never become observations. Total/work/intense-work/recovery are distinct; work role alone does not mean high intensity. |
| RunExecution | canonical_fact_ref; session_ref; executing_prescription_ref; step/repeat-instance results and target/intensity refs; observed_at/received_at; pauses/skips/partial/unknown; coverage/correction refs | Missing sync is not failed work or honoured rest. Compare to accepted executed target, with no retrospective zone or adherence rewrite. |

Terrain is per step when material: surface, signed grade_percent, elevation quantity/source if used. Uphill and downhill within one repeat can differ. Unknown remains unknown; no new location collection. Completion has exactly one appropriate amount or open with no numeric amount. Target ranges use metric-specific ordering, including reversed pace/speed order.

## Shared projections and relations

| Entity | Minimum content / relation | Invariant / consumer |
|---|---|---|
| TrainingDemandProfile | subject/session/prescription refs; planned_or_observed; dimensions[{dimension,Knowledge<band>,comparison_basis_ref,provenance_class,source refs,limitations}]; muscle projection; athlete_state_ref; source_exposure_refs; model/method revision and derived_at when actually derived | Refines SessionDemand (AEOS §5), not competing canonical data. Unanchored numeric/ordinal estimates cannot be consumed. This shape governs all documents. |
| EstimatedTrainingCost | session_ref; demand_profile_ref; athlete_state_ref; scope/window; model/method/rule refs; derived_at; uncertainty/limitations | Alias of the SessionDemand cost projection, not another additive score/entity. Distinct from AEOS PlanStabilityCost/Change Cost: consequences of changing a commitment. No estimator delivered. |
| ExposureContribution | reuse SIS canonical fact_ref + active revision + segment/scope; planned/observed dose with units; session/target association; transformation/coverage refs | Duplicate deliveries yield one active observed contribution per scope. Correction replaces prior revision. Matched planned segments are not added to observed past. Unobserved past stays unknown; valid future remainder is projected separately. |
| SubstitutionRelation | directed from/to variation refs; objective/essential stimulus; preserved/changed/lost dimensions; dose transform or unknown; eligibility/equipment/context; comparator/approval status | Neither symmetric nor transitive by default. Muscle overlap/cheaper cost does not prove preserved stimulus. Row example remains a proposal. |
| InterferenceContext | session/payload revisions; ordered start/end timing; athlete/recovery refs; priority/goal/event/phase refs; overlap; response evidence; status | Priority/context is not physical exposure. Calendar feasibility is distinct from physiological adequacy. |
| InteractionAssessment | reuse SIS: DemandRelation refs; endpoint/construct; acute/chronic horizon; evidence/rule refs; alternative-specific effects/uncertainty and joint eligibility | Replaces draft's ambiguous InterferenceAssessment. No automatic cause or additive penalty; descriptive relation can have unknown effect. |
| DomainEvidenceRef | id/revision; source_type/identifier/URL/locator; access_date; source_revision when available; population/design/construct/horizon; supported/unsupported claim; applicability/limitations/review | PMID/license name alone is not field provenance. Source permission, factual fidelity and sporting applicability are distinct. |

## Reuse upstream controls

SessionIntent, GoalPriorityModel, event/phase state, AthleteState, ProgressionAssessment, PlanAdequacyAssessment, ChangeNecessityAssessment, PlanStabilityCost, PolicyBundle and DecisionTrace remain upstream objects. Intent/criticality/priority do not inflate physical demand. Performance/model updates need not mutate the plan.

Minimum Effective Change requires approved essential stimulus, current adequacy, comparable material fact, reasons for KEEP/smaller alternatives, joint horizon validity, Change Cost and agency. Catalog/profile presence supplies no such approval. Missing critical interpretation blocks the dependent conclusion, not independent recording. S29 retains started revision/completed prefix; a stale pending prestart proposal cannot justify readapting the remainder without a genuinely new post-start material fact (SIS §7/AEOS).

Response history links canonical observations, configuration/target revisions, context/comparability, endpoint/window, evidence and counterevidence. It is a hypothesis, not an invented recovery coefficient. An accepted envelope has exact revision/scope/conditions: inside is execution, outside needs a new proposal/act. Synthetic acceptance tests control only.

## Conformance boundary

Artifact checks prove referential/form consistency of supplied examples, not completeness of every future field, sports correctness, approval, software behavior or formal schema compliance. Storage/API/formal schemas belong to a future authorized implementation mission and must preserve these distinctions.
