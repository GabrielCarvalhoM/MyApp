# Run Session / Workout Ontology

## Why not a giant exercise library
Run training is modeled parametrically. `6×800 m` and `5×1 km` are instances of structured archetypes, not separate canonical exercises.

## RunSessionArchetype
- purpose
- structure type
- allowed intensity-reference types (pace / HR / power / RPE)
- warm-up / main work / recovery / cooldown primitives
- terrain/surface/elevation context
- progression and regression knobs
- phase/event relation
- candidate demand tendencies (domain-reviewed)

## RunPrescription
- ordered blocks and repeats
- distance/duration per step
- primary target metric + reference version
- recovery mode/duration
- completion/advance behavior
- session role / key-session criticality

## RunExecution
Keeps the actual block/step/repeat result, pauses/skips/partial work and the exact intensity reference used at execution time.

## Intensity rule
Zone number is not portable across methods. No age-predicted HRmax or population threshold is an automatic fallback. If pace, HR and RPE conflict materially, do not average them; preserve provenance and follow approved precedence or mark uncertainty.

## Training-cost rule
Archetype alone cannot determine cost. Long duration can materially change the burden of an otherwise 'easy' archetype; density can change interval demand without more distance; hills change mechanical/neuromuscular demand.
