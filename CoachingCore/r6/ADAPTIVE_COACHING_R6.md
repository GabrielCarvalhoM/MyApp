# Adaptive coaching — R6

Every review compares concrete options across four horizons (H0 session, H1 week, H2 block, H3 goal or event) and chooses the smallest change that keeps the goal on track. Proposals are shadow programs; the official plan and completed work never change.

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE; envelopes R6-PLANNED-PROGRESSION, R6-PARTIAL-NOISY-LEARNING and the event, return, substitution and arrangement envelopes. Evidence: `ADAPTIVE_COACHING_R6.json`, demonstrations E–M, fourteen 4/8/12/16-week trajectories (`SIMULATION_RESULTS_R6.json`), tests labelled Adaptation and Simulation.

## Review contract (`src/r6-adaptation.mjs` `evaluateProgram`)

`R6-REVIEW-1` with a timezone-aware clock, a week index that contains it, current eligibility (clinical flags route to a human; unknown is asked), observations, optional changes. Invalid chronology, integrity or ownership holds; a pending clinical dependency stays sticky until resolved outside this reference. An eligibility date that is not a date is no assessment (QRE-R6-05), and any malformed fact inside the review gives HOLD with a reason, never an exception (QRE-R6-10).

## Decisions

- **Weekly gating**: per running role and per strength exercise. The gates are ADVANCE, HOLD (missed, partial, single adverse, unlogged strength), REGRESS (two comparable adverse within 14 days since the last regression) and EARNED (repeated comparable surplus, one step). Mid-week reviews never gate next week. A dimension with no executed session in the week has no gate and holds, so race, post-event and walk-only weeks never count as executed easy weeks (QRE-R6-04).
- **Logged loads**: an executed load becomes the next reference only inside 0–500 kg and at most one increment above the planned load; otherwise the plan's reference stays and the athlete is asked (`loadQuestions`). Pounds are converted; an unknown unit is never adopted. A changed known load is a MODIFY (`ADOPT_LOGGED_LOADS`), not a silent instantiation (QRE-R6-01/02).
- **Missed session**: zero work, no debt; a key session may move to a later chosen day of the same sport only when no interference is added; otherwise the next comparable step repeats. Stacking and catch-up are never selected. A missed report for a session the record shows as executed is asked about, never moved (QRE-R6-15).
- **Partial session**: counts what was done; the step repeats.
- **Performance signals**: one adverse or easier execution is a signal, not a trend.
- **Fatigue**: local fatigue removes optional work for the region; converging systemic signals remove the remaining hard work and hold every step.
- **Schedule change, unavailable day, double conflict**: future weeks re-arranged on the new days (with cost disclosure); within-week moves only without added interference; a genuine shared-shift conflict is asked. A change with invalid days, shifts or times is asked, never re-planned (QRE-R6-08); a race date marked unavailable is asked, never kept or skipped silently (QRE-R6-18).
- **Equipment change**: persistent same-intent substitution (`SUBSTITUTION_ENGINE_R6.md`).
- **Goal or event-date change**: future phases re-planned from the current state; nothing new is asked rather than re-planned; goals outside the intake vocabulary and event dates that are not real dates are asked (QRE-R6-11).
- **Return after pause**: `RETURN_ENGINE_R6.md`. **Event-week conflict**: skip, never catch up.
- **Learned pattern**: repeated athlete-specific interference changes future arrangements at the same doses, only with learning consent (`ATHLETE_MODEL_R6.md`, QRE-R6-16).

Every decision returns its counterfactuals (selected one admissible), the horizons, the reason, the next observation to record and, for rebuilds, the gates applied, so regression hysteresis sees them.

## Invariants checked in simulation

No official effect, no completed-work rewrite, selected options admissible, no deadlock, no permanent hold, no repeated unnecessary ask, no adaptation cascade, no runaway weekly volume outside event weeks, stable arrangements unless a re-arrangement was decided, no strength priority inversion near events, valid schedules, race week present.

## Limits

Responses in simulations are scripted inputs, never predicted physiology.

## After FREEZE-1 (SSCTR rounds 7–12; not frozen)

This describes the R6 runtime after FREEZE-1, which is **not frozen**: the SSCTR refused FREEZE-2 in round 12, and under the Founder's bound R6 closes with an explicit blocker (`OPEN_GAPS_R6.md`). The official evidence stays bound to FREEZE-1. Every rule below holds under the SSCTR's weekly-review contract: every elapsed week receives a gating weekly review, with unreported sessions reviewed as missed (a week without one keeps the projection's assumption; owned gap R18).

- **Logged loads (SSCTR D44, D45).** An above-plan load is adopted only on the ADVANCE criterion. A first establishment log stays pending until it is confirmed (review field `loadConfirmations`), repeated within one increment (also earlier in the same week) or matches the athlete's hint. A changed pending value always travels in a proposal. `loadQuestions` are built after the decision, from its gates. A `loadConfirmations` value that is not a list is a HOLD.
- **Round-8 answers.** Every proposal recomputes the completion negotiation from its own race-week state (D47). A pending row reads effort-guided selection only (D48). `stateTrace[w].strength.planned` carries the week's planned counts, so a review sees them (D49).
- **What a review counts as performed (SSCTR D52).** `performedInWeek` reads the reviewed week: a completed or partial report counts when it lists the exercise with a set; a completed report without details counts for every exercise of its session; missed, pending, not-reported and conflicted sessions perform nothing. A new exercise gets its state only when performed, a loaded one only with a logged load (adopted or pending). A from-log state performed without a usable load becomes `unlogged` and its next row is chosen by effort. A conflicted report neither sets nor confirms a load (author-found). The resume clock is `lastPerformed`, a local date.
- **Sets after a re-establishment (SSCTR D53, known-load path).** The count, block-boundary set included, comes back from the re-establishment count one set per executed week without a phase reduction (`regainCap`). **Open for R7:** the same rule for a pending or unlogged state (D53), and the phase doses of a re-establishment row (D54).
