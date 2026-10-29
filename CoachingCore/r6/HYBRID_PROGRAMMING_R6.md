# Hybrid programming — R6

Running and strength share one week, one recovery budget and one calendar. R6 derives which goal leads in each phase from the goals and the event, keeps both modalities present, and arranges sessions on the athlete's chosen days to keep the most important session freshest.

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE; envelopes R6-HYBRID-ARRANGEMENT and R6-PLANNED-PROGRESSION. Evidence: `HYBRID_PROGRAMMING_R6.json`; arrangement choice in `BALANCED_HYBRID_R6.md`.

## Contextual priority without a static flag

`buildGoalModel` derives the lead per phase: running leads for a run-first athlete or near an event (specific, taper, race week); strength leads for strength development without an event; both develop with equal standing (JOINT) when both goals are developmental; after an event strength may lead the next block. The athlete never has to pick a fixed priority; a temporary preference is honoured when stated.

## Coordination

- Chosen days and shifts are constraints; same-day pairs exist only where the athlete chose them; sessions are back to back only on shared shifts.
- Both modalities keep an essential stimulus in every phase: running keeps easy participation in strength-led blocks, strength keeps a reduced dose near events.
- Residual interference is ranked by direction and gap (heavy lower-body work before a key run, a key run before heavy lower-body work, an easy run right before lower-body work, two heavy lower days close together, strength within three days before a race).
- Adaptation keeps the same rules: missed work is never stacked; a key session moves only to a later chosen day of the same sport when nothing is added; schedule and goal changes re-arrange future weeks only.

## Limits

- Interference severities are ordinal ranking bands, not physiological thresholds; accustomed lifters show a weaker asymmetry, which the trace discloses.
- The engine never invents a training day the athlete did not choose.
