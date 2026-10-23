# Data Model Contracts — Conceptual

## StrengthExercise
`id, canonical_name, aliases[], movement_patterns[], primary_muscles[], secondary_muscles[], equipment[], laterality, mechanic, stable_metadata_provenance[]`

## StrengthPrescription
`exercise_id, sets[], load_reference, effort_reference, tempo, rom, rest, density, set_structure, session_role, revision`

## RunSessionArchetype
`id, purpose, structure_type, allowed_target_types[], progression_knobs[], context_requirements[], provenance[]`

## RunWorkoutBlock
`type, completion_basis, work_amount, recovery_amount, target_reference, repeats, terrain_context, order`

## RunPrescription
`archetype_id, blocks[], primary_intensity_reference, session_role, revision`

## TrainingDemandProfile
`subject_ref, domain, dimensions[{name, band, confidence, provenance, status}], derived_at, model_revision`

## EstimatedTrainingCost
`session_ref, planned_or_observed, demand_profile, athlete_state_ref, uncertainty, model_revision`

## SubstitutionRelation
`from_exercise, to_exercise, preserved_dimensions[], changed_dimensions[], constraints[], confidence, provenance, approval_status`

## InterferenceContext
`session_a, session_b, timing, demand_overlap[], recovery_state_ref, goal_priority, recent_response_evidence[], assessment_status`

## DomainEvidenceRef
`source_type, identifier, population, construct, applicability, limitations, review_status`

### Provenance classes
`FACT_SOURCE | DOMAIN_JUDGMENT | ATHLETE_OBSERVATION | DERIVED_ESTIMATE | POLICY_CANDIDATE`
