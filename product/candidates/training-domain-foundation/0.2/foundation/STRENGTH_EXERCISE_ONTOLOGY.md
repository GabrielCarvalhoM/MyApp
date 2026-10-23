# Strength Exercise Ontology

Revision 0.2, review candidate. DATA_MODEL_CONTRACTS.md defines fields/cardinalities. EstimatedStrengthCost below aliases the shared SessionDemand cost projection, not another additive score. Seed taxonomy/configuration claims are not externally verified facts.

## Entity boundaries

### StrengthExercise (stable-ish metadata)
- canonical id/name and aliases
- movement pattern(s)
- primary/secondary muscles
- equipment
- unilateral/bilateral
- compound/isolation-like
- ROM/variation descriptors when applicable
- skill/stability/axial/eccentric constructs reviewed at configuration × dose × athlete level; unanchored 0.1 bands removed from active seeds
- objective tags
- substitution relations

### StrengthPrescription (session-specific)
- selected StrengthVariation/configuration reference and revision, complete equipment, resistance mode and laterality
- sets / reps
- duration/open completion when applicable, contraction mode and side-specific unique segment IDs
- load or relative load reference
- explicit unit/convention: total including bar, per hand, machine identity/stack, bodyweight or assistance
- RIR or set-RPE with scale/version
- tempo, ROM, rest, density
- working vs warm-up set
- special set structure
- session role / criticality

### StrengthExecution (observed)
- actual sets/reps/load/effort/rest
- partial/omitted/interrupted/unknown semantics
- planned vs completed must remain separate

### EstimatedStrengthCost (derived, athlete-specific)
May contain qualitative/ordinal demand bands plus confidence for local muscle demand, lower/upper region, neuromuscular, axial, eccentric, metabolic and systemic recovery burden. No universal 0–100 score is allowed without validated model.

## Critical rules
- Back squat does not have a fixed fatigue score.
- Primary/secondary muscle mapping is not equivalent to validated 'effective sets'.
- Substitution is multi-dimensional: purpose, pattern, target musculature, equipment, skill, local/systemic cost, and upcoming plan context.
- A lower-cost substitute can only be preferred when it still preserves the required stimulus.
- RIR/RPE is evidence about effort, not certainty of technique, failure or readiness.

## Seed source strategy
Potential sources and license scope are in EVIDENCE_AND_PROVENANCE.md. None was adopted/imported by this correction. Source mapping remains UNVERIFIED; license alone cannot validate anatomy, prescriptions or media ownership.

## Configuration and coverage boundary

Family choices such as barbell_or_dumbbell and bilateral_or_unilateral are unresolved alternatives. Seven explicit examples demonstrate complete configurations without multiplying every exercise. Side plank has a static timed example, with no eccentric band inferred from its name. Nordic assistance, calf knee position/support, machine type, grip/bench angle and ROM need configuration review.

Pattern/muscle/mechanic labels remain candidate vocabulary. Dominance, anatomical aggregates and stabilizer/primary roles need normalization before filtering or volume roll-up; core is an old category, not an approved compound/isolation mechanic. Running_specific_strength states intended use, not evidence of performance transfer or injury prevention. Omitted tags do not prohibit other objectives.

Substitutions are directed and purpose/dose/context-bound, not automatically symmetric/transitive. The row example changes support, specificity and load convention; cost and stimulus equivalence remain unknown. A muscle-overlapping exercise can fail a task-specific max-strength goal. No all-pairs matrix is needed.

Progression/regression uses STIL/SIS assessments: target/configuration, dose/effort/ROM/rest, comparability and earned opportunity. Configuration changes can require rebase. Easy completion, missing sync or planned withdrawal does not earn the removed target. Calf/soleus, hamstring, unilateral and trunk examples sample runner support; lateral-hip/adductor, carry and plyometric families remain G01 coverage questions, with no silent claim of full novice/elite/clinical support.
