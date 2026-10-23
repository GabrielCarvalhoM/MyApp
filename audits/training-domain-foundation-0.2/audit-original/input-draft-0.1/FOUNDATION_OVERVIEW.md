# V1 Training Domain Foundation — Draft 0.1

## Status
**READY WITH FIXES → suitable for domain review, NOT runtime authority.**

This package materializes the training-domain concepts already required by the current Run Intelligence, Strength Intelligence and Sport Intelligence specs. It does not replace G01–G04 human/domain review and does not reclassify the eight domain-open Adaptive Engine cases.

## Four pillars
1. Strength Exercise Ontology
2. Run Session / Workout Ontology
3. Shared Training Demand & Interference Model
4. Concrete Seed Dataset + Scenario Integration

## Core separation
- **Fact**: canonical name, equipment, muscles, session structure, observed dose.
- **Domain judgment**: movement pattern, relative demand tendencies, substitution equivalence, session purpose.
- **Derived estimate**: estimated training cost for this prescription and athlete.
- **Policy**: what change to make, when, and why. Policy remains G01–G04 / human-review dependent.

## Non-negotiable model rule
`exercise/session identity != training cost`.

Strength: `Exercise Metadata × Prescription × Athlete/Context → Estimated Training Cost`

Run: `Run Session Definition × Prescription × Athlete/Context → Estimated Training Cost`

Hybrid: `Demand overlap × timing × recovery state × goal priority × athlete response history → Interference Assessment`

Overlap never implies automatic plan mutation.
