# Shared Training Demand & Interference Model

## Shared demand dimensions
Each dimension is represented as an ordinal/qualitative estimate with confidence and provenance, not a single 'fatigue score'.

- local lower-limb demand
- local upper-limb demand
- muscle-group-specific demand
- cardiovascular demand
- neuromuscular demand
- eccentric demand
- axial loading
- musculoskeletal impact
- metabolic demand
- coordination / skill demand
- systemic recovery burden
- novelty
- schedule sensitivity
- key-session proximity sensitivity

## Overlap vs interference
`overlap` is descriptive: two stimuli load the same domain.
`interference` is contextual: overlap may become decision-relevant depending on dose, timing, recovery state, goal priority and the athlete's observed response history.

Therefore:
- Upper strength + easy run may have limited material overlap for many contexts, but no hardcoded 'safe' rule is created.
- Heavy lower + hard hills may have high overlap, but that still does not automatically require moving a session. Adequacy/necessity/Minimum Effective Change must decide.

## Output shape
TrainingDemandProfile { dimension, band, confidence, provenance, observed_vs_estimated }
InterferenceAssessment { shared_dimensions, timing_context, evidence, uncertainty, affected_session_intents, alternatives_to_evaluate }

## Evidence guard
Recent concurrent-training syntheses support context sensitivity rather than a universal interference rule. Evidence on sequence/spacing is heterogeneous; Vilumo must not turn a review's average recommendation into a fixed global threshold.
