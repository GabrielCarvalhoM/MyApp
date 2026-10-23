# Foundation Validation Report — Draft 0.1

## Verdict
**READY WITH FIXES for sports-domain review. NOT READY for prescriptive runtime.**

## Structural checks
PASS — Strength exercise identity is separated from prescription and athlete-specific cost.
PASS — Run archetype is separated from dose and athlete-specific intensity reference.
PASS — Shared model uses a vector of demand dimensions instead of one fatigue scalar.
PASS — Planned and observed exposure remain distinct.
PASS — Overlap does not automatically become interference.
PASS — Unknown/missing values have an explicit place; they are not silently converted to zero.
PASS — Public exercise-data candidates are separated from Vilumo-specific judgment metadata.

## Synthetic sanity examples
1. Back Squat 3×5 @ comfortable margin vs 5×8 near failure: same exercise, materially different derived cost expected.
2. Easy Run 30 min vs Easy Run 120 min: same archetype, materially different total burden expected.
3. Upper session + Easy Run: limited shared local-lower demand is possible; no automatic 'conflict' conclusion.
4. Heavy lower + Hill Repeats: large shared lower/neuromuscular/eccentric dimensions may exist; still requires timing, recovery, priority and necessity reasoning before mutation.
5. Chest-supported row vs barbell row: both horizontal pull, but different trunk/axial demands; substitution cannot be selected only by primary muscle.
6. Threshold Continuous vs Cruise Intervals: same broad purpose can differ in structure/density while preserving intent; the AE should compare alternatives at intent + demand level.

## Open fixes before domain authority
- Human sports-domain review of all candidate demand bands/tags.
- Choose and legally verify the canonical open factual exercise source(s).
- Add formal substitution relations for the seed set; do not infer them from muscle overlap alone.
- Define approved intensity-reference and progression policies under G02.
- Add athlete-specific response-history semantics to cost estimation.
- Re-materialize the ten domain-open Golden fixtures using this ontology and rerun S01/S02/S05/S12/S13/S14/S28/S29 only after G01–G04 review.

## Scope limit
This package is a domain-model draft, not scientific validation, clinical guidance or a training recommendation.
