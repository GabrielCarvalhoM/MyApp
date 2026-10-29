# Athlete model — R6

The athlete model keeps comparable observations with provenance and turns them into bounded, associative evidence: what this athlete's responses were, how confident that is, and never why. It changes future decisions only inside reviewed envelopes.

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE; envelope R6-PARTIAL-NOISY-LEARNING. Evidence: `ATHLETE_MODEL_R6.json`, demonstrations G, H, I, M, trajectories T03 and T09, tests labelled Learning.

## Model (`src/r6-learning.mjs`)

- Updated only with learning consent; declined consent keeps nothing for personalization (gating still uses the completed-work ledger). Without consent no athlete-specific pattern changes the plan either: the learned rearrangement and the learned preference run only with consent (QRE-R6-16). Whether that is the right privacy scope is a Product/Data decision, recorded as an open gap.
- Observations carry session type, phase class (build, taper, event, post-event, review; return and restart periods form their own class), mode, dose key, arrangement and the interference that preceded them.
- Evidence for a context (`evidenceFor`): direction (compatible, adverse, surplus, mixed, tentative) and confidence (prior, emerging with three informative observations over a week, strong with four over two weeks and no mix). Partial, unknown-response and confounded observations are counted but are not informative.
- Nothing is causal and nothing is dose authority; the population prior is retained.

## How it changes decisions

- Gating uses repeated comparable observations of the same phase class since the last regression or return; consolidation weeks never feed EARNED.
- A learned interference pattern (key runs adverse at least twice over at least a week after one preceding-session cause, compatible without it, no adverse without it) raises that cause's severity for this athlete and can re-arrange future weeks at the same doses, with the week's gates applied and recorded.
- Arrangement preference uses strong evidence at the current quality dose and phase class to break ties among equal-harm options only.

## Overfit guards

One event is a signal, never a rule; missing effort is unknown, not adverse; duplicates never double-count. Conflicting reports quarantine: both stay out of learning until corrected, which closes the first-seen-payload leak the R5 judge found (F-H24). Hysteresis prevents a second regression from the same evidence. Association is always labelled as such.

## Limits

Small samples; the model ranks admissible options and never authorizes a dose outside an envelope.
