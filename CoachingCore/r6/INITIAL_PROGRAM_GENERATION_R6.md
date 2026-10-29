# Initial program generation — R6

From a canonical intake the engine builds a complete conditional program: phases → blocks → weeks → sessions, on the athlete's chosen days, for 4, 8, 12 or 16 weeks. Every future week is conditional: each step needs the previous comparable exposure executed without an adverse signal.

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE; reviewed envelopes R6-COLD-START, R6-PLANNED-PROGRESSION, R6-HYBRID-ARRANGEMENT, R6-EVENT-TRANSITION. Evidence: `INITIAL_PROGRAM_GENERATION_R6.json`.

## How a program is built (`src/r6-program.mjs`)

1. **Phases** (`planPhases`): an establishment week when running or strength capacity is unknown; development weeks with a consolidation week every fourth development week; for an event, specific weeks, one taper week, race week, a post-event week and, if the horizon continues, a next block.
2. **Blocks** (`blocksFrom`): consecutive phases grouped with an intent, contextual priority and exit criteria.
3. **Strength templates** (`strengthTemplates`): slot patterns per template (full body, lower, upper) filled from the catalogue by familiarity, competence and available equipment; emphasis reorders, never invents competence.
4. **Arrangements** (`arrangementCandidates` + `chooseBalanced`): quality day × template order × back-to-back order on shared shifts, chosen per phase context (see `BALANCED_HYBRID_R6.md`).
5. **State machines**: running (`initialRunState`, `runRow`, `advanceRun`) and strength (`initialStrengthState`, `strengthDose`, `advanceStrength`). The projection (`projectWeeks`) assumes each week is executed; the same transitions run during adaptation with real gates, so plan and adaptation never disagree on the rules.
6. **Validation** (`validateWeeks`): prescriptions, chosen days, chosen session time, race week present, establishment rows only with authority, unique session ids and no date with two key runs (QRE-R6-08). A program that fails is not presented. Known loads above 500 kg or in pounds fail the prescription validator.

## What the athlete sees per week

Phase and contextual priority, every session with its prescription (effort cues, durations, exercises with sets, reps, reserve and load mode), explanations for converted days (walks, rest by design), negotiation items and disclosed gaps (for example a long-run peak below an event target).

## Limits

- Phase lengths are operational choices inside reviewed envelopes, not validated optimal periodization.
- Weeks are conditional proposals, never predictions; the shadow program is never applied to an official plan.
