# Run programming — R6

Running progresses one response-gated step at a time from current capacity. The modes are a walk/jog ladder, restart, and easy and long runs. One quality session per week follows once easy running is established, and event-specific work comes before a race.

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE; envelopes R6-PLANNED-PROGRESSION and R6-RUN-QUALITY. Evidence: `RUN_PROGRAMMING_R6.json`, including the SSCTR round-8 tests R12 and R13 and the round-9 tests D50.

**Status at R6 closure (2026-10-27).** This describes the R6 runtime after FREEZE-1, which is **not frozen**: the SSCTR refused FREEZE-2 in round 12, and under the Founder's bound R6 closes with an explicit blocker. The official evidence (the first evaluation, the simulations, the demonstrations and the R5 replay) stays bound to FREEZE-1. See `OPEN_GAPS_R6.md`. The two open blockers (D53, D54) are in strength programming; the run rules here are not affected by them.

## Modes

### WALK_JOG
- **The ladder** has nine steps, from 3×30 s of jogging to 20 minutes continuous.
- **Exposures:** at most three a week; the other chosen days are optional walks.
- **Exit:** to 25-minute easy runs on three running days, with extra days returning one at a time.
- **Who starts here (FREEZE-2, `establishment.belowMinimumSession`):** an athlete whose current running is below the 15-minute minimum session, whether the longest current run or the weekly total. Before this change they got 5-minute "easy runs".
  - Novices, and athletes with zero or unknown exposure, start at step 0.
  - Anyone else starts at the highest step whose jogging per session is within both the longest current run and their weekly running divided by the week's walk/jog exposures (SSCTR D42).

### RESTART
- **Start:** easy runs from the reviewed 15-minute entry.
- **Steps:** +5 minutes per executed week.
- **Switch:** to easy mode at 30 minutes, with the long run capped by the single-run ceiling and the running days kept at the restart frequency.

### EASY
- **Runs:** easy runs, plus a long run on the athlete's long-run day.
- **Long run:** +5 minutes per executed development week, up to the goal target.
- **Easy runs:** one steps +5 minutes every second executed development week, rotating, so weekly volume rises by about one step.
- **Consolidation weeks** hold intensity and shorten the long run by two steps.
- **Walks on extra chosen days** convert to easy runs one at a time, at block starts, when the executed easy runs allow. With no easy run planned (every easy day a walk), the executed long run gates the conversion. The first converted walk becomes a 15-minute easy run, which then progresses like the others (SSCTR R12).

### Run history
The run state remembers two things across mode changes, reviews and reprojections (SSCTR D47):
- the walk/jog and restart modes this program has used (`modeHistory`);
- the longest continuous run executed so far (`longestContinuous`): easy, long, restart or return runs, or a ladder step without walk breaks.

Both feed race day (see `EVENT_TRANSITION_R6.md`). A restart after a long interruption clears the achieved peaks and the longest run, so later doses come only from runs executed after it.

### RETURN
See `RETURN_ENGINE_R6.md`.

## Safety rails

- **Single-run ceiling.** No planned run (except the race) exceeds the longest completed run of the preceding 30 days by more than 5 minutes.
  - With no run in that window, the reviewed 15-minute entry is the ceiling in every projected week (QRE-R6-09), not only the first.
  - Walk/jog counts its jogging minutes; walks are not running.
- **Long-run share.** With three or more running sessions, the long run stays within 0.45 of planned weekly running. It is never below the typical easy run, nor below the last build week's long run: the cap holds the long run, it never shortens it.
- **Short-reference steps.** On a reference under 50 minutes, a 5-minute step exceeds 10% of it. Such a step is disclosed, and no other session grows that week.
  - **A step the share cap holds is no increase (SSCTR D50).** When the long-run share holds the long run, its planned step does not happen, so the easy and quality steps follow their own gates and cadence that week. If one of them steps, the long run waits where it was prescribed, so two sessions never grow in the same week. Easy running then grows, the cap releases, and the long run steps the week after. Before this fix, many cold-start plans stalled for most of their build weeks.
- **One step per dimension per week.**
  - EARNED (three comparable easier-than-target executions over at least a week, outside consolidation and near-event weeks) releases a held step but never adds a second one. It is unavailable in walk/jog, restart and return.
  - **A dimension with nothing executed holds.** A run dimension with no executed session in the reviewed week has no gate: it holds, and it never counts as an executed week (QRE-R6-04).
  - **The same in projection.** In a conditional projection, a dimension advances only when that week plans a session of it (SSCTR D46). For example, the walk/jog ladder no longer advances through race and post-event weeks. Restart and return sessions of any role gate on EASY there, as in reviews, so a return whose only run day is the long-run day still completes its steps (SSCTR R13).

## Quality

- **Activation:** after two executed established easy weeks, or immediately in week 2 for a current familiar quality task that fits. Never in week 1, except that familiar task.
- **Frequency:** at most one quality session a week, not next to the long run when another chosen day can hold it.
- **Ladders:**
  - threshold: 3×5 → 4×5 → 5×5 → 3×8 → 4×8 → 3×10 minutes, continuing from the athlete's familiar level;
  - event-specific: 10K 5–6×3–4 min, half marathon 2–3×10–15 min, after two executed threshold sessions.
- **Effort:** cues only; the first exposure to each family is a calibration. No pace from a goal time or from easy pace, and no VO2max, threshold-pace or hill prescription.
- **Strides:** after two executed easy weeks; optional for easy-low or novice runners. Race-day and shakeout strides appear only after strides were executed (SSCTR D43(c)).
- **Near a race:** see `EVENT_TRANSITION_R6.md`. Walk/jog, restart and return athletes keep or reduce what they have reached and get no quality, touch or strides.

## Limits

- No pace, heart-rate zone or threshold measurement; effort is self-rated.
- Long-run targets per goal are operational ceilings, not readiness claims.
