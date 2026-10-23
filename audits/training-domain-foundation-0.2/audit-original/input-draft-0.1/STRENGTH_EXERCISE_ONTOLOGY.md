# Strength Exercise Ontology

## Entity boundaries

### StrengthExercise (stable-ish metadata)
- canonical id/name and aliases
- movement pattern(s)
- primary/secondary muscles
- equipment
- unilateral/bilateral
- compound/isolation-like
- ROM/variation descriptors when applicable
- candidate skill/stability/axial/eccentric tendencies (domain-reviewed, not raw fact)
- objective tags
- substitution relations

### StrengthPrescription (session-specific)
- sets / reps
- load or relative load reference
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
For lexical/basic metadata, prefer legally simple open sources. `free-exercise-db` is public-domain/Unlicense; Kinetic exercises-db is MIT. These may seed names, equipment and basic muscles after verification. Vilumo-specific demand, substitution and interference metadata must be separately authored/reviewed.
