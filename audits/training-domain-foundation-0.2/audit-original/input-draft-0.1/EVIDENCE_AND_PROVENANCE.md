# Evidence and Provenance

## Current project authorities
- RUN_INTELLIGENCE_SPEC: requires SessionIntent/SessionDemand, structured steps/repeats, versioned intensity references, separate intense vs total volume, progression and recovery semantics.
- STRENGTH_INTELLIGENCE_SPEC: requires exercise/group/pattern exposure, reps/load/RIR-RPE, axial/eccentric demand, substitutions, progression and planned-vs-executed fidelity.
- SPORT_INTELLIGENCE_SPEC: explicitly forbids collapsing hybrid load into a single scalar and requires shared ExposureRefs and no double counting.

## Candidate open exercise sources
- free-exercise-db — 800+ exercises, JSON, Unlicense/public domain. Good candidate for names/basic muscles/equipment; still verify individual media provenance before bundling.
- Kinetic exercises-db — 899 structured exercises, MIT. Useful alternate/secondary lexical source.
- ExerciseDB API — large dataset but AGPL-3.0; do not adopt into proprietary product flow without explicit legal/architecture review.
- RepDB free dataset — commercial in-app use with attribution; viable fallback if attribution/product requirements are acceptable.

## Scientific anchors used for ontology constraints (not automatic policies)
- ACSM 2026 Position Stand / overview of 137 reviews (PMID 41843416): prescription variables matter differently by outcome; supports keeping load/volume/frequency/exercise ordering as separate dimensions rather than one generic intensity score.
- Resistance-training volume/frequency dose-response meta-regression (PMID 41343037): supports direct vs indirect exposure distinction and diminishing-return logic, but does not create universal Vilumo volume thresholds.
- Proximity-to-failure meta-regression (PMID 38970765) and 2026 acute-fatigue study (PMID 42458937): effort proximity can affect fatigue and interacts with exercise/load; therefore cost cannot be fixed on exercise identity alone.
- Training-intensity distribution review in runners (PMID 34749417): intensity distribution and quantification method matter; supports explicit intensity-reference provenance.
- 2026 concurrent-training umbrella review (PMID 41762427) and concurrent HIIT+strength meta-analysis (PMID 42759564): concurrent training is context-dependent; no blanket 'running + strength = interference' rule.
- 2024 squat biomechanics review (PMID 38576836): technique/variation changes joint and muscular demands; supports modeling variations rather than treating 'squat' as one immutable exposure.

## Evidence rule
Scientific literature informs ontology fields, constraints and candidate policies. It does not automatically authorize exact doses, recovery timers, spacing cutoffs or proprietary readiness scores.
