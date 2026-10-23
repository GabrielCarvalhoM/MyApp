# Run Session / Workout Ontology

Revision 0.2, review candidate. DATA_MODEL_CONTRACTS.md governs typed fields/cardinalities. Seeds are review templates, not approved workouts or cost profiles.

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

## Composition and execution

The 17 retained IDs cover 16 session families and a phase template (taper_specific_session). Purpose, structure, duration-relative role, event and phase are separate axes. Tempo versus threshold needs an explicit construct/alias decision; short intervals can serve distinct purposes. No new record is needed for every 6×800 versus 5×1000 dose.

Each step separates metric (RPE/HR/pace/power), primary/secondary/optional role and versioned reference. HR_secondary and pace_optional are not metrics; time belongs to completion. Relative pace needs an explicit baseline. Unknown/absent targets require a stated condition, without population-zone fallback.

Repeats declare total iterations and final-recovery inclusion. Recovery has its own mode, amount, target and advance. Pauses/skips/partial results retain step/repetition and target revision. Warmup/cooldown contribute time/exposure. Total, work, intense-work and recovery are different constructs.

Terrain is per step when material: signed grade/surface, ascent work and descent recovery; missing terrain cannot become high eccentric/impact. The hills example proves shape only. Race/taper links existing event/date/distance/priority/phase refs and revisions. Taper, deload, recovery run, rest and HOLD differ; recovery intent does not prove restoration. Cancellation removes event rationale and requires review, not automatic load restoration.

No archetype-level acute demand bands remain. Three concrete examples exercise interval/recovery/terrain/continuous forms; they do not test all manual/open/distance/nested variants, approve intensity references or establish full V1 population/event coverage.
