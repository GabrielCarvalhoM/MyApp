# Event transition — R6

For a 10K or half marathon the plan runs build → specific → taper → race window → race → post-event, and continues into a next block when the horizon allows. Taper and race-window doses come from what the athlete actually executed, and from the run mode they have reached. This corrects the R5 gaps in H01 and H22, where event-week work had to be supplied.

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE; envelope R6-EVENT-TRANSITION. Evidence: `EVENT_TRANSITION_R6.json`, demonstration L, trajectories T01 and T10, and the tests labelled event, race or taper. Those include QRE-R6-03, the SSCTR round-7 tests D43, R9 and R10, and the round-8 tests D47.

**Status at R6 closure (2026-10-27).** This describes the R6 runtime after FREEZE-1, which is **not frozen**: the SSCTR refused FREEZE-2 in round 12, and under the Founder's bound R6 closes with an explicit blocker. The official evidence (the first evaluation, the simulations, the demonstrations and the R5 replay) stays bound to FREEZE-1. See `OPEN_GAPS_R6.md`. **Open for R7: D54.** A re-establishment row (an exercise not performed for more than 28 days) ignores the taper, race-week and post-event strength doses: 2 sets at RIR 3 where the phase dose is 1 set at RIR ≥ 4.

## Phases (`planPhases`)

Specific weeks come before the taper: 3 for a 10K and 4 for a half marathon, fewer when the event is close. Then come one taper week, race week, one post-event week and a next block. An event that is too close, or outside the horizon, is negotiated or asked about. Marathons and longer races are outside V1.

## Proximity counts days, not calendar weeks (FREEZE-2)

Event rules follow days to the race, whatever the race weekday (`event.proximitySemantics`):
- **The race window** is the 6 days before the race (`raceWindowDays`).
- **The taper days** are the 7 days per taper week before that window.

A session takes the rules of the days it falls on, whichever calendar week contains it. Sessions after the race follow the post-event rules, counted in days since the race.

## Taper and race window (`eventWeekSessions`)

- **Doses come from achieved peaks.** These are recorded only for executed sessions, and a restart after a long interruption clears them, so a taper after a restart comes only from runs executed after it (author-found with D47). Each fraction applies per session:
  - the taper long run is 0.55–0.7 of the achieved long run;
  - taper easy runs are 0.6–0.8 of the achieved easy run;
  - taper quality keeps the same effort with 0.5–0.6 of the achieved peak session's work minutes (fewer repetitions when that fits, otherwise shorter ones).
- **The race window** has no long run and no quality session:
  - short easy runs at 0.4–0.6;
  - at most one brief race-effort touch, on the run day closest to the race that is still at least 3 days before it. It appears only if quality was executed in the build and R6-RUN-QUALITY is enabled;
  - an optional short shakeout the day before.
- **With no executed quality**, the taper and the race window are easy-only.
- **The long-run floor (R10):** in the taper, and at the start of the next block, the long run is never shorter than that week's easy run.
- **Strength** stays at a reduced dose. Taper days have about half the sets at RIR ≥ 3. In the race window there is no strength in the last 3 days, and at most one short light session (1 set, main lifts, RIR ≥ 4) on the strength day furthest from the race. There is no new exercise, no load increase and no rotation.

## Athletes who have not reached continuous running (D43)

Walk/jog, restart and return athletes keep or reduce what they have reached (`event.modeAwareSessions`). They never get a continuous run they have not done.

- **Walk/jog:**
  - taper days hold the current ladder step;
  - race-window days use one step back;
  - the day before the race is an optional walk;
  - post-event days are optional walk/jog, one step back.
- **Restart or return:**
  - taper days hold the current easy minutes;
  - race-window days take 0.4–0.6 of them, never below the 15-minute entry;
  - the day before is an optional short easy run;
  - post-event runs never exceed the current minutes.
- **None of these modes** gets a touch, quality or strides. Their steps do not advance on taper, race-window or post-event days. The next block restarts the walk/jog ladder one step back.

## Race day

The race is on the athlete's own event date. It uses effort cues and promises no finish time. The race-day window and warm-up values are declared in the policy.

- **Completion race (D43, D47, R9).** In these cases race day is a completion at conversational effort with walk breaks: no strides, no surges, nothing to press.
  - The run mode in race week is walk/jog, restart or return. The walk breaks follow the athlete's ladder step.
  - The run mode was walk/jog or restart in any earlier week of this program: the starting class, or a restart applied by a review (`historyModes`, SSCTR D47). The run state keeps that history through mode changes, reviews and reprojections. No exemption applies by default, even after a long run is rebuilt; one would have to be declared and reviewed first.
  - For a half marathon, the achieved long run is below 75 minutes.
  - `raceDayCompletionBasis` names which case applies.
- **The negotiation** (`EVENT_AMBITIOUS_FOR_CURRENT_RUNNING`, non-blocking) goes with every completion race day. It is recomputed from the race-week state of every proposal, so a restart or a goal change applied by a review carries it, and a change that removes the completion removes it.
  - It states the longest continuous run executed by race week: the longest executed easy, long, restart or return run, or ladder step without walk breaks. It is never 0 minutes when such a run was reached. In walk/jog it also states the ladder step; in a return in race week it states the current easy minutes instead.
  - It states why race day is a completion: the mode in race week, the program history, or the half-marathon long run.
  - It offers keeping the event with walk breaks, or choosing a later or shorter event. Collecting that choice before the race window (SSCTR R8) is an open gap.
- **Warm-up strides** on race day, and strides in the shakeout, appear only after strides were executed in training.
- **A race date marked unavailable** is asked about. It is never kept or skipped silently.

## After the race

- **The first days:** no running for two days. After that, optional easy runs of 20–30 minutes, or walk/jog one step back, and one light strength session.
- **Redevelopment** needs an eligibility and function check dated on or after race day.
- **The next block** restarts from 0.625 of the achieved long run, 0.7 of the achieved easy run and three quality steps back.

## Limits

- No readiness, finish-time or peak-performance claim.
- Only one taper week.
- The event date is the athlete's.
- A half-marathon long-run peak can stay below its target when the build is short. Profile A peaks at 85 of 105 minutes. This is disclosed as `LONG_RUN_PEAK_BELOW_TARGET` and is an open gap.
