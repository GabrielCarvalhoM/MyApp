# R7-D domain-evaluation packet (R7D-FINAL-1)

Runtime R7D-FREEZE-5 (7272e9a), harness R7D-HARNESS-8, first evaluation: true. Corpus sha256 2f2a5d270c96117dfa5a8ef3c9b8a8ba2d380c7ec27c0835a7af8a4834b63b18.

Per case: what the case asks, the intake, onboarding, every decision (current week = prescription; next week = provisional projection), automated results, the author's expectations and independent assessment.

## R7D-F01

**Intent.** Cold start of a run-first half-marathon plan over 16 weeks with a non-Monday calendar, then a confounded long run with adverse recovery and impaired next day versus a confounded long run that went fine, then the race moved a week earlier. Confounding must not erase an adverse recovery.

**Tags.** COLD_START, RUN_FIRST, RACE_HALF, H16, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, START_NON_MONDAY, TIMEZONE, ADVERSE_RESPONSE, EVENT_DATE_CHANGE, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":16,"asOf":"2026-11-10","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-28","timeGoalMinutes":125}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-02-28","timeGoalMinutes":125},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":130,"longestRunMinutes":60,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[1,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":40,"longRunDay":4,"longRunMinutes":120}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-11 AM RUN EASY 35min (EASY) | d1 2026-11-12 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-13 AM RUN EASY 35min (EASY) | d4 2026-11-15 AM RUN LONG 55min (LONG) | d5 2026-11-16 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-11-18 AM RUN EASY 35min (EASY) | d1 2026-11-19 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-11-20 AM RUN EASY 35min (EASY) | d4 2026-11-22 AM RUN LONG 55min (LONG) | d5 2026-11-23 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 14 (TAPER): d0 2027-02-17 AM RUN QUALITY 31min (HALF_MARATHON_SPECIFIC 2x7'/2') | d1 2027-02-18 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; incline-push-up 1x14 RIR3 BW; band-row 1x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d2 2027-02-19 AM RUN EASY 35min (EASY +strides) | d4 2027-02-21 AM RUN LONG 45min (LONG) | d5 2027-02-22 PM STRENGTH_FULL_B 17min: glute-bridge 1x14 RIR4 BW; band-row 1x10 RIR4 BW; incline-push-up 1x14 RIR4 BW
- Week 15 (RACE_WEEK): d0 2027-02-24 AM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d1 STRENGTH REST_BY_DESIGN | d2 2027-02-26 AM RUN EASY 25min (EASY) | d4 2027-02-28  RUN RACE 150min (RACE) | d5 STRENGTH REST_BY_DESIGN

### s1 · 2026-11-24T20:00:00+01:00 · WEEKLY_REVIEW (week 1)

- Athlete: 5 report(s): w1-run-d0 done 35min; w1-str-d1 done 27min 5 exercises; w1-run-d2 done 35min; w1-run-d4 done 55min (performance=UNDER,recovery=ADVERSE,effort=HARDER,nextDayFunction=IMPAIRED); w1-str-d5 done 27min 5 exercises
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 1 (BUILD) from 2026-11-24: —
- Next week 2 (BUILD, provisional): d0 2026-11-25 AM RUN EASY 35min (EASY) | d1 2026-11-26 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x10 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d2 2026-11-27 AM RUN EASY 35min (EASY) | d4 2026-11-29 AM RUN LONG 55min (LONG) | d5 2026-11-30 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

### s2 · 2026-12-01T20:00:00+01:00 · WEEKLY_REVIEW (week 2)

- Athlete: 5 report(s): w2-run-d0 done 35min; w2-str-d1 done 27min 5 exercises; w2-run-d2 done 35min; w2-run-d4 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d5 done 28min 5 exercises
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 2 (BUILD) from 2026-12-01: —
- Next week 3 (BUILD, provisional): d0 2026-12-02 AM RUN EASY 40min (EASY) | d1 2026-12-03 PM STRENGTH_FULL_A 28min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x12 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x14 RIR3 BW | d2 2026-12-04 AM RUN EASY 35min (EASY) | d4 2026-12-06 AM RUN LONG 60min (LONG) | d5 2026-12-07 PM STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x12 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW

### s3 · 2026-12-03T12:00:00+01:00 · EVENT_DATE_CHANGE (week 3)

- Athlete: no reports · changes `{"eventDate":"2027-02-21"}`
- Coach: **MODIFY** / REPLAN_FUTURE_PHASES · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Goal or event date changed: future phases, priorities and arrangements are re-planned from the current state; completed weeks stay as they were
- Current week 3 (BUILD) from 2026-12-03: d1 2026-12-03 PM STRENGTH_FULL_A 28min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x12 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x14 RIR3 BW | d2 2026-12-04 AM RUN EASY 35min (EASY) | d4 2026-12-06 AM RUN LONG 60min (LONG) | d5 2026-12-07 PM STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x12 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-09 AM RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2026-12-10 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; incline-push-up 1x14 RIR3 BW; band-row 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d2 2026-12-11 AM RUN EASY 40min (EASY +strides) | d4 2026-12-13 AM RUN LONG 55min (LONG) | d5 2026-12-14 PM STRENGTH_FULL_B 21min: glute-bridge 1x14 RIR3 BW; band-row 1x10 RIR3 BW; incline-push-up 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f01-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f01-e2 @GENERATE ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["15:4:RACE"]`
- f01-e3 @GENERATE PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"RACE_WEEK"`
- f01-e4 @GENERATE ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":75,"otherWeek":55}`
- f01-e5 @s1 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":55,"otherWeek":55}`
- f01-e6 @s1 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The adverse recovery and impaired next day of the confounded long run are treated as real signals: the confounding only makes its pace and effort hard to read.
- f01-e7 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The confounded long run that went fine is not penalised: the plan may resume its normal progression without treating the slow conditions as underperformance.
- f01-e8 @s3 ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["14:4:RACE"]`
- f01-e9 @s3 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- f01-e10 @s3 PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"RACE_WEEK"`

**Independent assessment (author, written before any output).**
- Rationale: Ines is an intermediate runner with a 54-minute 10K and a 60-minute longest run aiming at a 2:05 half in 16 weeks; strength is support work she is new to. Heat and hills explain a slow pace, not legs that are still impaired the next day.
- Preferred: Propose a progressive half-marathon build with a gradual long-run progression on Sundays and two short running-support strength sessions. After week 1 hold or slightly reduce the next long run and keep intensity easy until recovery is normal; after the fine week 2 resume progression. When the race moves a week earlier, compress the build and taper toward the new date without adding load to catch up.
- Acceptable alternatives: Keeping the week-2 long run equal to week 1 rather than reducing it. / Asking how the legs feel before the next long run. / Placing the taper over the last one to two weeks before the new date.
- Concerns: Progressing the long run after an impaired next day because the run was confounded. / Penalising the fine confounded control run as underperformance. / Keeping a race on the old date or adding volume to recover the lost week.
- Domain notes: Day 0 is Wednesday; long-run day 4 is Sunday; the race 2027-02-28 is week 15 day 4 and moves to 2027-02-21 (week 14 day 4). Week 0 has no review (skipped). No clinical signal anywhere.

## R7D-F02

**Intent.** A close 10K for an experienced runner: a late bulk sync of the build, a lower-body local fatigue report during the taper, the race week, and the plan after the race. Probes that a taper response does not remove the race or add load, and that the week after a race is recovery.

**Tags.** COLD_START, RUN_FIRST, RACE_10K, H8, RUN_EXP_EXPERIENCED, STR_EXP_INTERMEDIATE, FREQ_HIGH, TAPER, TAPER_ANSWER, RACE_WEEK, POST_RACE, FATIGUE_LOCAL, TIMEZONE, LATE_REPORTER, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":8,"asOf":"2026-11-14","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-03","timeGoalMinutes":44}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2027-01-03","timeGoalMinutes":44},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":260,"longestRunMinutes":85,"strengthDaysPerWeek":1},"knownRuns":1,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":41,"specialPopulation":null,"schedule":{"runDays":[0,1,3,5,6],"strengthDays":[2],"runTurn":"AM","strengthTurn":"PM","runMinutes":55,"strengthMinutes":35,"longRunDay":6,"longRunMinutes":90}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-16 AM RUN EASY 40min (EASY) | d1 2026-11-17 AM RUN EASY 40min (EASY) | d2 2026-11-18 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-11-19 AM RUN EASY 40min (EASY) | d5 2026-11-21 AM RUN EASY 40min (EASY) | d6 2026-11-22 AM RUN LONG 85min (LONG)
- Week 1 (BUILD): d0 2026-11-23 AM RUN EASY 40min (EASY) | d1 2026-11-24 AM RUN QUALITY 50min (THRESHOLD 3x7'/2') | d2 2026-11-25 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d3 2026-11-26 AM RUN EASY 40min (EASY) | d5 2026-11-28 AM RUN EASY 40min (EASY) | d6 2026-11-29 AM RUN LONG 85min (LONG)
- Week 5 (TAPER): d0 2026-12-21 AM RUN EASY 35min (EASY +strides) | d1 2026-12-22 AM RUN QUALITY 28min (TEN_K_SPECIFIC 3x3'/2') | d2 2026-12-23 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; db-bench-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2026-12-24 AM RUN EASY 35min (EASY +strides) | d5 2026-12-26 AM RUN EASY 35min (EASY +strides) | d6 2026-12-27 AM RUN LONG 55min (LONG)
- Week 6 (RACE_WEEK): d0 2026-12-28 AM RUN EASY 25min (EASY) | d1 2026-12-29 AM RUN EASY 25min (EASY) | d2 2026-12-30 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; db-bench-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d3 2026-12-31 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d5 2027-01-02 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d6 2027-01-03  RUN RACE 75min (RACE)

### s1 · 2026-12-20T21:00:00-05:00 · WEEKLY_REVIEW (week 4)

- Athlete: 18 report(s): w2-run-d0 done 40min; w2-run-d1 done 48min; w2-run-d3 done 40min; w2-run-d5 done 40min; w2-run-d6 done 85min; w3-run-d0 done 45min; w3-run-d1 done 38min; w3-run-d3 done 40min; w3-run-d5 done 40min; w3-run-d6 done 85min; w4-run-d0 done 45min; w4-run-d1 done 43min; w4-run-d3 done 40min; w4-run-d5 done 40min; w4-run-d6 done 85min; w2-str-d2 done 20min 5 exercises; w3-str-d2 done 20min 5 exercises; w4-str-d2 done 20min 5 exercises
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-bench-press":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE"}`
- Current week 4 (SPECIFIC) from 2026-12-20: d6 2026-12-20 AM RUN LONG 85min (LONG)
- Next week 5 (TAPER, provisional): d0 2026-12-21 AM RUN EASY 35min (EASY +strides) | d1 2026-12-22 AM RUN QUALITY 28min (TEN_K_SPECIFIC 3x3'/2') | d2 2026-12-23 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 establish; db-bench-press 1x8 RIR3 establish; db-row 1x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d3 2026-12-24 AM RUN EASY 35min (EASY +strides) | d5 2026-12-26 AM RUN EASY 35min (EASY +strides) | d6 2026-12-27 AM RUN LONG 55min (LONG)

### s2 · 2026-12-23T10:00:00-05:00 · LOCAL_FATIGUE (week 5)

- Athlete: no reports · signals `{"region":"LOWER"}`
- Coach: **MODIFY** / REDUCE · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Remove only optional local work for the affected region; essentials stay
- Current week 5 (TAPER) from 2026-12-23: d2 2026-12-23 PM STRENGTH_FULL_A 18min: goblet-squat 1x8 RIR3 establish; db-bench-press 1x8 RIR3 establish; db-row 1x8 RIR3 establish; dead-bug 1x12 RIR3 BW | d3 2026-12-24 AM RUN EASY 35min (EASY +strides) | d5 2026-12-26 AM RUN EASY 35min (EASY +strides) | d6 2026-12-27 AM RUN LONG 55min (LONG)
- Next week 6 (RACE_WEEK, provisional): d0 2026-12-28 AM RUN EASY 25min (EASY) | d1 2026-12-29 AM RUN EASY 25min (EASY) | d2 2026-12-30 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; db-bench-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d3 2026-12-31 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d5 2027-01-02 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d6 2027-01-03  RUN RACE 75min (RACE)

### s3 · 2027-01-03T21:00:00-05:00 · WEEKLY_REVIEW (week 6)

- Athlete: 6 report(s): w6-run-d0 done 25min; w6-run-d1 done 25min; w6-run-d3 done 25min; w6-run-d5 done 15min; w6-race done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET); w6-str-d2 done 16min 3 exercises
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"EASY":"ADVANCE","goblet-squat":"ADVANCE","db-bench-press":"ADVANCE","db-row":"ADVANCE"}`
- Current week 6 (RACE_WEEK) from 2027-01-03: d6 2027-01-03  RUN RACE 75min (RACE)
- Next week 7 (POST_EVENT, provisional): d0 RUN REST_BY_DESIGN | d1 2027-01-05 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d2 2027-01-06 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 establish; db-bench-press 1x8 RIR4 establish; db-row 1x8 RIR4 establish | d3 2027-01-07 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d5 2027-01-09 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 2027-01-10 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f02-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f02-e2 @GENERATE ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["6:6:RACE"]`
- f02-e3 @GENERATE PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"RACE_WEEK"`
- f02-e4 @GENERATE ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":55,"otherWeek":85}`
- f02-e5 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f02-e6 @s2 ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["6:6:RACE"]`
- f02-e7 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Lower-body local fatigue in the taper reduces or holds lower-body strength and adds no running load; nothing is added to make up.
- f02-e8 @s3 PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"POST_EVENT"`
- f02-e9 @s3 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`

**Independent assessment (author, written before any output).**
- Rationale: Marcus is experienced, runs five days and has a current threshold session; seven weeks to a 10K allows a short build and a one-week taper. Local fatigue in the taper is common and is managed by trimming, not by changing the goal.
- Preferred: Propose a compact 10K build with one quality session a week, a taper in the last week or so, and keep strength at maintenance. On the taper fatigue report, reduce or drop the lower-body strength and keep runs easy and short, keeping the race touch and the race. After the race, plan an easy recovery week before any next block.
- Acceptable alternatives: Asking whether the fatigue settles before the race touch. / Replacing the strength session of the taper week with mobility-level work. / A post-race week labelled NEXT_BLOCK if its content is easy.
- Concerns: Removing the race or moving it because of local fatigue. / Adding volume in the taper. / Programming a quality session in the first week after the race.
- Domain notes: Monday start, local offset -05:00. Weeks 0 and 1 are never reported; weeks 2 to 4 arrive in one sync (late reports), so no month-long run silence occurs.

## R7D-F03

**Intent.** Balanced hybrid with a shared day where both sports are in the morning, confirmed by the athlete, then a double conflict on that shared day. Probes that both sports keep their own chosen days, that a conflict never moves a session to a day the athlete did not choose, and that it does not stack load elsewhere.

**Tags.** COLD_START, BALANCED_HYBRID, SHARED_DAYS, SAME_TURN, DOUBLE_CONFLICT, NON_RACE, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, START_NON_MONDAY, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":12,"asOf":"2026-11-11","tz":330,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BENCH","KETTLEBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[0,3,5],"runTurn":"AM","strengthTurn":"AM","sameTurnConfirmed":true,"runMinutes":45,"strengthMinutes":45,"longRunDay":2,"longRunMinutes":70}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-12 AM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 establish; db-rdl 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-11-12 AM RUN EASY 40min (EASY) | d2 2026-11-14 AM RUN LONG 60min (LONG) | d3 2026-11-15 AM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2026-11-16 AM RUN EASY 40min (EASY) | d5 2026-11-17 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-19 AM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-11-19 AM RUN EASY 40min (EASY) | d2 2026-11-21 AM RUN LONG 60min (LONG) | d3 2026-11-22 AM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2026-11-23 AM RUN EASY 40min (EASY) | d5 2026-11-24 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW

### s1 · 2026-11-19T05:30:00+05:30 · DOUBLE_CONFLICT (week 1)

- Athlete: no reports · changes `{"from":"2026-11-19","to":"2026-11-19"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: Run and strength cannot both fit this shared shift; choose a different shift for one sport or a temporary preference for which goes first
- Current week 1 (DEVELOPMENT) from 2026-11-19: d0 2026-11-19 AM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-11-19 AM RUN EASY 40min (EASY) | d2 2026-11-21 AM RUN LONG 60min (LONG) | d3 2026-11-22 AM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2026-11-23 AM RUN EASY 40min (EASY) | d5 2026-11-24 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW
- Next week 2 (DEVELOPMENT, provisional): d0 2026-11-26 AM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d0 2026-11-26 AM RUN EASY 40min (EASY) | d2 2026-11-28 AM RUN LONG 60min (LONG) | d3 2026-11-29 AM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d4 2026-11-30 AM RUN EASY 40min (EASY) | d5 2026-12-01 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f03-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f03-e2 @GENERATE JUDGED [INVARIANT_ORACLE]: **JUDGED** — Runs fall only on days 0, 2 and 4 and strength only on days 0, 3 and 5; days 1 and 6 receive no session.
- f03-e3 @GENERATE JUDGED [DOMAIN_ORACLE]: **JUDGED** — On the shared day the two sessions are ordered and dosed so that neither compromises the other (for example easy running with the strength session, not a hard run followed by heavy lower-body work).
- f03-e4 @s1 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"ASK"`
- f03-e5 @s1 JUDGED [DOMAIN_ORACLE]: **JUDGED** — On the conflict date the plan no longer requires both sessions; any session it keeps or moves stays on a day the athlete chose, and the week is not made heavier to compensate.

**Independent assessment (author, written before any output).**
- Rationale: Priya trains both sports at an intermediate level and has confirmed she wants both in the morning on Thursdays. When one Thursday morning only allows one session, the coach should pick by priority rather than squeeze both or push one onto a rest day.
- Preferred: Propose a balanced plan honouring the chosen days, with the shared Thursday combining an easy run and the strength session in a sensible order. On the conflict keep the session that matters most that week (or ask which she prefers), drop or shorten the other, and leave unchosen days empty.
- Acceptable alternatives: Asking which of the two she prefers to keep on that date. / Keeping strength and turning the run into rest by design that day. / Shortening both into one short combined slot if the athlete has time for that.
- Concerns: Moving the dropped session to Friday or Wednesday (unchosen days) without her act. / Doubling the next run to make up. / Treating the conflict as invalid input.
- Domain notes: Day 0 is Thursday (local offset +05:30). The conflict is week 1 day 0, 2026-11-19, at 05:30 local before the sessions.

## R7D-F04

**Intent.** A 4-week general block for a novice who chooses six run days and four strength days while running about 20 minutes a week. Probes dosing within capacity on many chosen days, unknown versus missed sessions in the first review, and a schedule change in the last week.

**Tags.** COLD_START, GENERAL_FITNESS, NON_RACE, H4, RUN_EXP_NOVICE, STR_EXP_NOVICE, TOO_MANY_DAYS, FREQ_HIGH, SHARED_DAYS, START_NON_MONDAY, MIXED_EXECUTION, SHORTENED_RUNS, SCHEDULE_CHANGE, TIMEZONE, LOW_DATA, BODYWEIGHT_ONLY · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":4,"asOf":"2026-11-19","tz":120,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":20,"longestRunMinutes":20,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,2,4,6],"runMinutes":40,"strengthMinutes":40}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-20  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d0 2026-11-20  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-21  RUN WALK 20min (WALK) | d2 2026-11-22  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-22  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-23  RUN WALK 20min (WALK) | d4 2026-11-24  STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-11-24  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-25  RUN WALK 20min (WALK) | d6 2026-11-26  STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-27  STRENGTH_FULL_A 28min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-11-27  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-11-28  RUN WALK 20min (WALK) | d2 2026-11-29  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-29  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-30  RUN WALK 20min (WALK) | d4 2026-12-01  STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d4 2026-12-01  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-02  RUN WALK 20min (WALK) | d6 2026-12-03  STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

### s1 · 2026-11-26T21:30:00+02:00 · WEEKLY_REVIEW (week 0)

- Athlete: 7 report(s): w0-run-d0 done 20min; w0-run-d1 done 12min; w0-run-d2 not done; w0-str-d0 done 15min 5 exercises; w0-str-d2 done 2 exercises; w0-str-d4 not done; w0-str-d6 done 11min 2 exercises
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"WALK_JOG":"HOLD","sit-to-stand":"ADVANCE","wall-pushup":"ADVANCE","prone-row-practice":"ADVANCE","supported-calf-raise":"HOLD","dead-bug-practice":"HOLD","glute-bridge":"ADVANCE","band-row":"ADVANCE","incline-push-up":"HOLD","reverse-lunge":"HOLD","dead-bug":"HOLD"}`
- Current week 0 (ESTABLISHMENT) from 2026-11-26: d6 2026-11-26  STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Next week 1 (DEVELOPMENT, provisional): d0 2026-11-27  STRENGTH_FULL_A 28min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-11-27  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-28  RUN WALK 20min (WALK) | d2 2026-11-29  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-29  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-30  RUN WALK 20min (WALK) | d4 2026-12-01  STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d4 2026-12-01  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-02  RUN WALK 20min (WALK) | d6 2026-12-03  STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

### s2 · 2026-12-12T09:00:00+02:00 · SCHEDULE_CHANGE (week 3)

- Athlete: no reports · changes `{"runDays":[0,2,4]}`
- Coach: **HOLD** / HOLD · REQUIRES_RECONCILIATION
- Reason: Malformed review facts: Cannot read properties of undefined (reading 'sessions')
- Current week 3 (DEVELOPMENT) from 2026-12-12: d1 2026-12-12  RUN WALK 20min (WALK) | d2 2026-12-13  STRENGTH_FULL_B 30min: glute-bridge 2x14 RIR3 BW; band-row 2x12 RIR3 BW; incline-push-up 2x14 RIR3 BW; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d2 2026-12-13  RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d3 2026-12-14  RUN WALK 20min (WALK) | d4 2026-12-15  STRENGTH_CORE 15min: dead-bug 1x16 RIR3 BW; standing-calf-raise 1x16 RIR3 BW; front-plank 1x16 RIR3 BW | d4 2026-12-15  RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d5 2026-12-16  RUN WALK 20min (WALK) | d6 2026-12-17  STRENGTH_CORE 15min: dead-bug 1x16 RIR3 BW; standing-calf-raise 1x16 RIR3 BW; front-plank 1x16 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f04-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f04-e2 @GENERATE ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- f04-e3 @GENERATE JUDGED [DOMAIN_ORACLE]: **JUDGED** — Week-0 running is a modest step up from about 20 minutes a week: many chosen days get very short, walk, walk/jog or rest-by-design sessions, not six full 40-minute runs; strength volume is novice-appropriate with bodyweight and bands only.
- f04-e4 @s1 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Runs of days 3 to 5 with no report are treated as unknown, neither done nor missed; the next week does not progress on the basis of them, and the missed and shortened sessions hold progression.
- f04-e5 @s2 JUDGED [INVARIANT_ORACLE]: **JUDGED** — After the last-week change no run is planned on a day outside the athlete's chosen days; the change is either applied to the remaining days or refused, never turned into extra sessions.

**Independent assessment (author, written before any output).**
- Rationale: Eleni is enthusiastic but runs about 20 minutes a week. Ten chosen sessions a week is far above capacity; a good coach either negotiates fewer days or fills many of them with very light sessions. In week 0 she shortened, skipped and simply did not report some days.
- Preferred: Plan a 4-week general block where total weekly running starts close to current capacity, spread as short walk/jog or rest-by-design days, and novice bodyweight strength. After the review, hold progression and treat unreported runs as unknown. In the last week accept the reduction to three run days or decline the change, without adding anything.
- Acceptable alternatives: Asking her to choose fewer days before planning. / Explaining that some chosen days are rest by design.
- Concerns: Six 40-minute runs in week 0. / Counting unreported runs as done (or as missed) and progressing on that basis. / Moving sessions to new days in the last week.
- Domain notes: Day 0 is Friday (offset +02:00). Strength day 6 is the last session of each week, so the week-0 review is at 21:30 on day 6.

## R7D-F05

**Intent.** An athlete experienced in both sports, with learning consent, reports one easy run that felt hard (noise) and then the same lower-body fatigue on the morning after the lower-body strength day two weeks in a row (a pattern). Probes that noise changes nothing and a consented pattern may change the arrangement within limits.

**Tags.** COLD_START, BALANCED_HYBRID, NON_RACE, H8, RUN_EXP_EXPERIENCED, STR_EXP_EXPERIENCED, GYM, FREQ_HIGH, START_NON_MONDAY, TIMEZONE, LEARNING_PATTERN, LEARNING_NOISE, FATIGUE_LOCAL, REPEATED_SIGNAL, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":8,"asOf":"2026-11-14","tz":660,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":240,"longestRunMinutes":95,"strengthDaysPerWeek":3},"knownRuns":1,"knownExercises":["back-squat 4x5 110KG TOTAL","barbell-rdl 3x6 100KG TOTAL","bench-press 4x5 85KG TOTAL","barbell-row 4x8 70KG TOTAL"],"equipment":["BARBELL","RACK","BENCH","DUMBBELLS","PULL_UP_BAR","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4,6],"strengthDays":[1,3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":60,"strengthMinutes":70,"longRunDay":0,"longRunMinutes":100}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-15 AM RUN LONG 95min (LONG) | d1 2026-11-16 PM STRENGTH_LOWER 37min: back-squat 4x5 RIR3 110kg TOTAL; barbell-rdl 3x6 RIR3 100kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2026-11-17 AM RUN EASY 45min (EASY) | d3 2026-11-18 PM STRENGTH_UPPER 40min: bench-press 4x5 RIR3 85kg TOTAL; barbell-row 4x6 RIR3 70kg TOTAL; db-bench-press 2x7 RIR3 establish; db-row 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d4 2026-11-19 AM RUN QUALITY 55min (THRESHOLD 4x6'/2') | d5 2026-11-20 PM STRENGTH_FULL_B 45min: barbell-rdl 3x6 RIR3 100kg TOTAL; barbell-row 4x6 RIR3 70kg TOTAL; bench-press 4x5 RIR3 85kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2026-11-21 AM RUN EASY 45min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-22 AM RUN LONG 95min (LONG) | d1 2026-11-23 PM STRENGTH_LOWER 37min: back-squat 4x5 RIR3 110kg TOTAL; barbell-rdl 3x6 RIR3 100kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d2 2026-11-24 AM RUN EASY 45min (EASY) | d3 2026-11-25 PM STRENGTH_UPPER 40min: bench-press 4x5 RIR3 85kg TOTAL; barbell-row 4x6 RIR3 70kg TOTAL; db-bench-press 2x7 RIR3 last logged; db-row 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d4 2026-11-26 AM RUN QUALITY 53min (THRESHOLD 4x8'/2') | d5 2026-11-27 PM STRENGTH_FULL_B 45min: barbell-rdl 3x6 RIR3 100kg TOTAL; barbell-row 4x6 RIR3 70kg TOTAL; bench-press 4x5 RIR3 85kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d6 2026-11-28 AM RUN EASY 45min (EASY)

### s1 · 2026-11-21T21:00:00+11:00 · WEEKLY_REVIEW (week 0)

- Athlete: 7 report(s): w0-run-d0 done 95min; w0-run-d2 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=HARDER,nextDayFunction=NORMAL); w0-run-d4 done 55min; w0-run-d6 done 45min; w0-str-d1 done 37min 5 exercises; w0-str-d3 done 40min 5 exercises; w0-str-d5 done 45min 5 exercises · learning consent true
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"HOLD","back-squat":"ADVANCE","barbell-rdl":"ADVANCE","bulgarian-split-squat-db":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","bench-press":"ADVANCE","barbell-row":"ADVANCE","db-bench-press":"ADVANCE","db-row":"ADVANCE"}`
- Current week 0 (DEVELOPMENT) from 2026-11-21: d6 2026-11-21 AM RUN EASY 45min (EASY)
- Next week 1 (DEVELOPMENT, provisional): d0 2026-11-22 AM RUN LONG 95min (LONG) | d1 2026-11-23 PM STRENGTH_LOWER 37min: back-squat 4x5 RIR3 110kg TOTAL; barbell-rdl 3x6 RIR3 100kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x9 RIR3 BW | d2 2026-11-24 AM RUN EASY 45min (EASY) | d3 2026-11-25 PM STRENGTH_UPPER 40min: bench-press 4x5 RIR3 85kg TOTAL; barbell-row 4x6 RIR3 70kg TOTAL; db-bench-press 2x7 RIR3 establish; db-row 2x7 RIR3 establish; dead-bug 2x9 RIR3 BW | d4 2026-11-26 AM RUN QUALITY 53min (THRESHOLD 4x8'/2') | d5 2026-11-27 PM STRENGTH_FULL_B 45min: barbell-rdl 3x6 RIR3 100kg TOTAL; barbell-row 4x6 RIR3 70kg TOTAL; bench-press 4x5 RIR3 85kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 2x9 RIR3 BW | d6 2026-11-28 AM RUN EASY 45min (EASY)

### s2 · 2026-11-24T06:00:00+11:00 · LOCAL_FATIGUE (week 1)

- Athlete: no reports · signals `{"region":"LOWER"}` · learning consent true
- Coach: **MODIFY** / REDUCE · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Remove only optional local work for the affected region; essentials stay
- Current week 1 (DEVELOPMENT) from 2026-11-24: d2 2026-11-24 AM RUN EASY 45min (EASY) | d3 2026-11-25 PM STRENGTH_UPPER 40min: bench-press 4x5 RIR3 85kg TOTAL; barbell-row 4x6 RIR3 70kg TOTAL; db-bench-press 2x7 RIR3 establish; db-row 2x7 RIR3 establish; dead-bug 2x9 RIR3 BW | d4 2026-11-26 AM RUN QUALITY 53min (THRESHOLD 4x8'/2') | d5 2026-11-27 PM STRENGTH_FULL_B 42min: barbell-rdl 3x6 RIR3 100kg TOTAL; barbell-row 4x6 RIR3 70kg TOTAL; bench-press 4x5 RIR3 85kg TOTAL; dead-bug 2x9 RIR3 BW | d6 2026-11-28 AM RUN EASY 45min (EASY)
- Next week 2 (DEVELOPMENT, provisional): d0 2026-11-29 AM RUN LONG 95min (LONG) | d1 2026-11-30 PM STRENGTH_LOWER 37min: back-squat 4x5 RIR3 112.5kg TOTAL; barbell-rdl 3x6 RIR3 102.5kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d2 2026-12-01 AM RUN EASY 45min (EASY) | d3 2026-12-02 PM STRENGTH_UPPER 40min: bench-press 4x5 RIR3 87.5kg TOTAL; barbell-row 4x6 RIR3 72.5kg TOTAL; db-bench-press 2x7 RIR3 last logged; db-row 2x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d4 2026-12-03 AM RUN QUALITY 49min (THRESHOLD 3x10'/2') | d5 2026-12-04 PM STRENGTH_FULL_B 45min: barbell-rdl 3x6 RIR3 102.5kg TOTAL; barbell-row 4x6 RIR3 72.5kg TOTAL; bench-press 4x5 RIR3 87.5kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d6 2026-12-05 AM RUN EASY 45min (EASY)

### s3 · 2026-12-01T06:00:00+11:00 · LOCAL_FATIGUE (week 2)

- Athlete: no reports · signals `{"region":"LOWER"}` · learning consent true
- Coach: **MODIFY** / REDUCE · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Remove only optional local work for the affected region; essentials stay
- Current week 2 (DEVELOPMENT) from 2026-12-01: d2 2026-12-01 AM RUN EASY 45min (EASY) | d3 2026-12-02 PM STRENGTH_UPPER 40min: bench-press 4x5 RIR3 87.5kg TOTAL; barbell-row 4x6 RIR3 72.5kg TOTAL; db-bench-press 2x7 RIR3 last logged; db-row 2x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d4 2026-12-03 AM RUN QUALITY 49min (THRESHOLD 3x10'/2') | d5 2026-12-04 PM STRENGTH_FULL_B 42min: barbell-rdl 3x6 RIR3 102.5kg TOTAL; barbell-row 4x6 RIR3 72.5kg TOTAL; bench-press 4x5 RIR3 87.5kg TOTAL; dead-bug 2x10 RIR3 BW | d6 2026-12-05 AM RUN EASY 45min (EASY)
- Next week 3 (CONSOLIDATION, provisional): d0 2026-12-06 AM RUN LONG 85min (LONG) | d1 2026-12-07 PM STRENGTH_LOWER 26min: back-squat 3x5 RIR3 112.5kg TOTAL; barbell-rdl 2x6 RIR3 102.5kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 last logged; db-calf-raise 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2026-12-08 AM RUN EASY 50min (EASY +strides) | d3 2026-12-09 PM STRENGTH_UPPER 29min: bench-press 3x5 RIR3 87.5kg TOTAL; barbell-row 3x6 RIR3 72.5kg TOTAL; db-bench-press 1x7 RIR3 last logged; db-row 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d4 2026-12-10 AM RUN QUALITY 53min (THRESHOLD 4x8'/2') | d5 2026-12-11 PM STRENGTH_FULL_B 33min: barbell-rdl 2x6 RIR3 102.5kg TOTAL; barbell-row 3x6 RIR3 72.5kg TOTAL; bench-press 3x5 RIR3 87.5kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-12 AM RUN EASY 45min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f05-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f05-e2 @GENERATE ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["1:4:QUALITY","2:4:QUALITY"]`
- f05-e3 @GENERATE JUDGED [DOMAIN_ORACLE]: **JUDGED** — Known barbell loads are used as references in kilograms (TOTAL), not re-established from scratch.
- f05-e4 @s1 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f05-e5 @s1 JUDGED [DOMAIN_ORACLE]: **JUDGED** — A single easy run reported harder, with normal recovery, does not by itself cut running load or intensity.
- f05-e6 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f05-e7 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f05-e8 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — With consent, the repeated lower-body fatigue the morning after the lower-body day may be learned within limits (for example spacing heavy lower-body work away from the next quality or long run); the response is proportionate and does not cut the whole program.

**Independent assessment (author, written before any output).**
- Rationale: Liam is experienced in both sports with known loads and a current threshold session. One hard-feeling easy run after a bad night is noise. The same lower-body fatigue on the day after lower-body strength two weeks running is a personal pattern worth adapting to, which he has consented to.
- Preferred: Plan a concurrent block with quality running and heavy strength separated sensibly. Ignore the single hard easy run. On the first fatigue report adjust that day. On the repeat, with consent, rearrange or lighten the lower-body session before the next run; without consent, handle each report on its own only.
- Acceptable alternatives: Keeping the plan but turning the affected run easy each time. / Asking whether he wants the lower-body day moved within his chosen days.
- Concerns: Cutting running volume after the single noisy run. / Ignoring the repeated pattern entirely when consent is given, or learning it when consent is off. / Dropping all lower-body strength.
- Domain notes: Day 0 is Sunday (offset +11:00, Sydney summer time). Week 1 has no review.

## R7D-F06

**Intent.** Running-support strength with kettlebells only, known kettlebell loads in a single-implement convention, then a travel week with bodyweight only. Probes that the catalog stays within equipment and the temporary window ends.

**Tags.** COLD_START, RUN_FIRST, KETTLEBELL, EQUIPMENT_CHANGE, TRAVEL, NON_RACE, H8, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, START_NON_MONDAY, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":8,"asOf":"2026-12-01","tz":-180,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":120,"longestRunMinutes":55,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["kb-goblet-squat 3x10 16KG SINGLE_IMPLEMENT","kb-deadlift 3x10 20KG SINGLE_IMPLEMENT"],"equipment":["KETTLEBELL","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[1,5],"runMinutes":45,"strengthMinutes":35,"longRunDay":4,"longRunMinutes":70}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-02  RUN EASY 35min (EASY) | d1 2026-12-03  STRENGTH_FULL_A 30min: kb-goblet-squat 3x10 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-04  RUN EASY 35min (EASY) | d4 2026-12-06  RUN LONG 50min (LONG) | d5 2026-12-07  STRENGTH_FULL_B 30min: kb-deadlift 3x10 RIR3 20kg SINGLE_IMPLEMENT; kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-09  RUN EASY 35min (EASY) | d1 2026-12-10  STRENGTH_FULL_A 30min: kb-goblet-squat 3x6 RIR3 18kg SINGLE_IMPLEMENT; incline-push-up 2x10 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-11  RUN EASY 35min (EASY) | d4 2026-12-13  RUN LONG 55min (LONG) | d5 2026-12-14  STRENGTH_FULL_B 30min: kb-deadlift 3x6 RIR3 22kg SINGLE_IMPLEMENT; kb-row 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

### s1 · 2026-12-16T09:00:00-03:00 · EQUIPMENT_CHANGE (week 2)

- Athlete: no reports · changes `{"equipment":["BODYWEIGHT"],"from":"2026-12-17","to":"2026-12-22"}`
- Coach: **MODIFY** / SUBSTITUTE · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Equipment changed: same-intent substitutes from 2026-12-17 to 2026-12-22; unfamiliar ones are established by effort; the stimulus change is disclosed
- Current week 2 (DEVELOPMENT) from 2026-12-16: d0 2026-12-16  RUN EASY 40min (EASY +strides) | d1 2026-12-17  STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-18  RUN EASY 35min (EASY) | d4 2026-12-20  RUN LONG 60min (LONG) | d5 2026-12-21  STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Next week 3 (CONSOLIDATION, provisional): d0 2026-12-23  RUN EASY 40min (EASY +strides) | d1 2026-12-24  STRENGTH_FULL_A 23min: kb-goblet-squat 2x10 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 1x10 RIR3 BW; kb-row 1x8 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-25  RUN EASY 35min (EASY) | d4 2026-12-27  RUN LONG 50min (LONG) | d5 2026-12-28  STRENGTH_FULL_B 22min: kb-deadlift 2x8 RIR3 establish; kb-row 1x8 RIR3 establish; incline-push-up 1x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f06-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f06-e2 @GENERATE JUDGED [INVARIANT_ORACLE]: **JUDGED** — Every strength exercise uses kettlebell or bodyweight only; known kettlebell loads are in the SINGLE_IMPLEMENT convention, never converted to a barbell or dumbbell exercise.
- f06-e3 @s1 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f06-e4 @s1 JUDGED [INVARIANT_ORACLE]: **JUDGED** — Strength sessions dated 2026-12-17 to 2026-12-22 use bodyweight exercises only; kettlebell work returns after that window; running is not changed by the equipment change.

**Independent assessment (author, written before any output).**
- Rationale: Joana runs three times a week and supports it with two kettlebell sessions; her kettlebell loads are known. A travel week without equipment needs bodyweight alternatives for the same patterns, then a return to the kettlebell plan.
- Preferred: Propose running-support strength from kettlebell exercises at the known loads, and for the travel window substitute bodyweight versions of the squat, hinge and calf work at similar effort, then resume.
- Acceptable alternatives: Reducing strength to one bodyweight session that week. / Keeping run doses unchanged and only swapping exercises.
- Concerns: Prescribing kettlebell exercises during travel. / Leaving the bodyweight-only constraint in force after the window. / Adding dumbbell or barbell exercises she does not own.
- Domain notes: Day 0 is Wednesday (offset -03:00). The travel window is week 2 days 1 to 6.

## R7D-F07

**Intent.** A once-intermediate runner restarting after 14 weeks of no training, built from walk/jog toward a 10K in week 14, then an unavailable day early on. Probes a restart progression and that an unavailable day is not made up on another day.

**Tags.** COLD_START, RESTART, WALK_JOG, RUN_FIRST, RACE_10K, H16, RUN_EXP_INTERMEDIATE, STR_EXP_NONE, BODYWEIGHT_ONLY, UNAVAILABLE_DAY, LOW_DATA, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":16,"asOf":"2026-11-28","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-14"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-03-14"},"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"runMinutesPerWeek":0,"longestRunMinutes":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":14,"reasonCategory":"WORK","reason":"long work project, stopped all training"},"wearable":null,"history":0,"ageYears":35,"specialPopulation":null,"schedule":{"runDays":[0,2,5],"strengthDays":[3],"runMinutes":40,"strengthMinutes":30,"longRunDay":5,"longRunMinutes":60}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-30  RUN EASY 15min (EASY) | d2 2026-12-02  RUN EASY 15min (EASY) | d3 2026-12-03  STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d5 2026-12-05  RUN EASY 15min (EASY)
- Week 1 (BUILD): d0 2026-12-07  RUN EASY 20min (EASY) | d2 2026-12-09  RUN EASY 20min (EASY) | d3 2026-12-10  STRENGTH_FULL_A 21min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d5 2026-12-12  RUN EASY 20min (EASY)
- Week 13 (TAPER): d0 2027-03-01  RUN EASY 30min (EASY +strides) | d2 2027-03-03  RUN EASY 30min (EASY +strides) | d3 2027-03-04  STRENGTH_FULL_A 17min: box-squat-bodyweight 1x16 RIR3 BW; incline-push-up 1x16 RIR3 BW; prone-ytw-raise 1x16 RIR3 BW | d5 2027-03-06  RUN LONG 30min (LONG)
- Week 14 (RACE_WEEK): d0 2027-03-08  RUN EASY 20min (EASY) | d2 2027-03-10  RUN EASY 20min (EASY) | d3 2027-03-11  STRENGTH_FULL_A 15min: box-squat-bodyweight 1x16 RIR4 BW; incline-push-up 1x16 RIR4 BW | d5 2027-03-13  RUN SHAKEOUT 15min (SHAKEOUT +strides) | d6 2027-03-14  RUN RACE 75min (RACE, completion)

### s1 · 2026-12-08T08:00:00+01:00 · UNAVAILABLE_DAY (week 1)

- Athlete: no reports · changes `{"unavailableDates":["2026-12-09"]}`
- Coach: **MODIFY** / RESCHEDULE_WITHIN_WEEK · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Sessions on the unavailable date are moved within chosen days when that adds no interference, otherwise skipped without debt
- Current week 1 (BUILD) from 2026-12-08: d2 2026-12-09  RUN EASY 20min (EASY) [SKIPPED] | d3 2026-12-10  STRENGTH_FULL_A 21min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d5 2026-12-12  RUN EASY 20min (EASY)
- Next week 2 (BUILD, provisional): d0 2026-12-14  RUN EASY 25min (EASY) | d2 2026-12-16  RUN EASY 25min (EASY) | d3 2026-12-17  STRENGTH_FULL_A 22min: box-squat-bodyweight 2x12 RIR3 BW; incline-push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW | d5 2026-12-19  RUN EASY 25min (EASY)

**Automated properties.** P06 FAIL `[{"at":"GENERATE","week":0,"sessionId":"w0-run-d0","role":"EASY","minutes":15,"ceiling":5,"reference":{"date":"2026-11-28","minutes":0,"source":"INTAKE_LONGEST"}},{"at":"GENERATE","week":0,"sessionId":"w0-run-d2","role":"EASY","minutes":15,"ceiling":5,"reference":{"date":"2026-11-28","minutes":0,"source":"INTAKE_LONGEST"}},{"at":"GENERATE","week":0,"sessionId":"w0-run-d5","role":"EASY","minutes":15,"ceiling":5,"reference":{"date":"2026-11-28","minutes":0,"source":"INTAKE_LONGEST"}},{"at":"s1","week":1,"sessionId":"w1-run-d5","role":"EASY","minutes":20,"ceiling":5,"reference":{"date":"2026-11-28","minutes":0,"source":"INTAKE_LONGEST"}}]`

**Metamorphic.** no violation

**Author expectations.**
- f07-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f07-e2 @GENERATE ROLE_PRESENT [DOMAIN_ORACLE]: **FAIL** observed `[]`
- f07-e3 @GENERATE ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- f07-e4 @GENERATE ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["14:6:RACE"]`
- f07-e5 @s1 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f07-e6 @s1 JUDGED [INVARIANT_ORACLE]: **JUDGED** — No session is planned on 2026-12-09; the lost session is not moved to an unchosen day nor added to another run day.

**Independent assessment (author, written before any output).**
- Rationale: Tomas used to run at an intermediate level but has not trained for 14 weeks for nonclinical reasons. His history makes progress faster than a true beginner, but tissues need a restart from walk/jog. Sixteen weeks is enough to finish a 10K comfortably.
- Preferred: Start with walk/jog on the three chosen days, progress toward continuous easy running and a modest long run, add one bodyweight strength session, and only introduce harder running late if at all. On the unavailable day, drop that session and keep the rest of the week as planned.
- Acceptable alternatives: Moving the lost session to another chosen day only if that day had no run and the week stays within its planned load. / Asking whether he can do a short session another day.
- Concerns: Starting with continuous 40-minute runs because he used to be intermediate. / Quality sessions in the first weeks. / Making up the lost session by lengthening the long run.
- Domain notes: Monday start, offset +01:00. Race 2027-03-14 is week 14 day 6. The unavailable date is 2026-12-09 (week 1 day 2).

## R7D-F08

**Intent.** Onboarding with the eligibility questions unanswered. Unknown eligibility must be a question: never a clearance, never a presumed illness.

**Tags.** ELIGIBILITY_UNKNOWN, COLD_START, RUN_FIRST, NON_RACE, H8, RUN_EXP_NOVICE, STR_EXP_NONE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-14","weeks":8,"asOf":"2026-12-09","tz":0,"learningConsent":null,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":null,"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[2],"runMinutes":30,"strengthMinutes":30}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f08-e1 @GENERATE STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f08-e2 @GENERATE NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f08-e3 @GENERATE JUDGED [INVARIANT_ORACLE]: **JUDGED** — The question asks for the eligibility answers; it neither treats the athlete as cleared nor routes him as if ill.

**Independent assessment (author, written before any output).**
- Rationale: Pat has not answered whether he has pain, injury, illness or other clinical concerns. A coach cannot plan safely or assume either answer.
- Preferred: Ask the eligibility questions before any plan.
- Acceptable alternatives: Showing a generic description of what the plan would look like once eligibility is confirmed, without doses.
- Concerns: Proposing a program anyway. / Routing to a clinician as if a clinical signal had been reported.
- Domain notes: All clinical flags omitted on purpose (unknown).

## R7D-F09

**Intent.** An athlete with a race goal reports current and persistent pain at onboarding. The coach must route to a qualified human and prescribe nothing, however motivated the goal.

**Tags.** CLINICAL_SIGNAL, COLD_START, RUN_FIRST, RACE_HALF, H12, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, TIMEZONE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":12,"asOf":"2027-01-02","tz":-300,"learningConsent":null,"eligibility":"CLINICAL","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-28"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-03-28"},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":75},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[2],"runMinutes":50,"strengthMinutes":30,"longRunDay":6,"longRunMinutes":100}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f09-e1 @GENERATE STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- f09-e2 @GENERATE NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- f09-e3 @GENERATE JUDGED [NOT_EVALUABLE_DOMAIN]: **JUDGED** — Whether and how she may train with this pain is a clinical judgment and is not assessed here; only the routing is.

**Independent assessment (author, written before any output).**
- Rationale: Ruth has persistent pain. Whatever her race ambition, a non-clinical coach cannot judge whether running is safe.
- Preferred: Route to a qualified human and prescribe nothing until a clearance exists.
- Acceptable alternatives: Explaining that planning resumes after a qualified clearance.
- Concerns: A reduced or "pain-free" plan. / Advice on managing the pain.
- Domain notes: Race 2027-03-28 is week 11 day 6.

## R7D-F10

**Intent.** A 16-year-old asks for a 10K plan. Adolescents are outside V1; the request must not be planned.

**Tags.** OUT_OF_SCOPE, COLD_START, RACE_10K, H8, RUN_EXP_NOVICE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-02-08","weeks":8,"asOf":"2027-02-06","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-28"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-03-28"},"runExperience":"NOVICE","strengthExperience":"NONE","recent":null,"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":16,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[],"runMinutes":35,"longRunDay":6,"longRunMinutes":50}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: POPULATION_OUTSIDE_V1_AGE_RANGE

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f10-e1 @GENERATE STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"UNSUPPORTED"`
- f10-e2 @GENERATE NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"UNSUPPORTED"`

**Independent assessment (author, written before any output).**
- Rationale: The athlete is 16. V1 serves adults only.
- Preferred: Decline the plan as outside scope, without a partial program.
- Acceptable alternatives: Asking to confirm the age if it might be a typo, without planning.
- Concerns: Planning anyway with lighter doses. / Treating it as a clinical case.
- Domain notes: Race 2027-03-28 is week 6 day 6.

## R7D-F11

**Intent.** A novice hybrid athlete never reports for seven weeks and sends an empty review in the last week of an 8-week program. The coach should ask about the unreported runs; the direct answer comes in the next step, in the same last week.

**Tags.** UNREPORTED_WEEKS, LATE_ANSWER, EMPTY_REVIEW, SKIPPED_REVIEW, SHORTENED_RUNS, PARTIAL_ANSWER, LATE_REPORTER, BALANCED_HYBRID, GENERAL_FITNESS, NON_RACE, H8, RUN_EXP_NOVICE, STR_EXP_NOVICE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":8,"asOf":"2027-01-02","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":50,"longestRunMinutes":30,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[0,4],"runMinutes":35,"strengthMinutes":35,"longRunDay":5,"longRunMinutes":50}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-04  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2027-01-05  RUN EASY 15min (EASY) | d3 2027-01-07  RUN EASY 15min (EASY) | d4 2027-01-08  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-09  RUN LONG 20min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-01-11  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2027-01-12  RUN EASY 15min (EASY) | d3 2027-01-14  RUN EASY 15min (EASY) | d4 2027-01-15  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-16  RUN LONG 20min (LONG)

### s1 · 2027-02-28T18:00:00+00:00 · WEEKLY_REVIEW (week 7)

- Athlete: no reports
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Final week of the horizon; record outcomes for the next program
- Current week 7 (DEVELOPMENT) from 2027-02-28: —

### s2 · 2027-02-28T20:30:00+00:00 · WEEKLY_REVIEW (week 7)

- Athlete: 16 report(s): w0-str-d0 done 15min 5 exercises; w0-str-d4 done 28min 5 exercises; w1-str-d0 done 28min 5 exercises; w1-str-d4 done 28min 5 exercises; w2-str-d0 done 28min 5 exercises; w2-str-d4 done 28min 5 exercises; w4-str-d0 done 20min 5 exercises; w4-str-d4 done 21min 5 exercises; w5-str-d0 done 32min 3 exercises; w5-str-d4 done 33min 3 exercises; w6-str-d0 done 32min 3 exercises; w6-str-d4 done 33min 3 exercises; w7-str-d0 done 32min 3 exercises; w7-str-d4 done 33min 3 exercises; w3-str-d0 not done; w3-str-d4 not done · client notes ANSWER_WITHOUT_PENDING_QUESTION
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Final week of the horizon; record outcomes for the next program
- Current week 7 (DEVELOPMENT) from 2027-02-28: —

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f11-e1 @s1 QUESTION_KIND_IS [DOMAIN_ORACLE]: **FAIL** observed `null`
- f11-e2 @s1 NO_PRESCRIPTION [DOMAIN_ORACLE]: **FAIL** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- f11-e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- f11-e4 @s2 QUESTION_KIND_IS [DOMAIN_ORACLE]: **PASS** observed `null`
- f11-e5 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The answer is recorded as given: most runs at about 80% of the planned time and the week-3 runs not done; earlier decisions are not rewritten and nothing is planned beyond the program end.

**Independent assessment (author, written before any output).**
- Rationale: Noor trained but never logged. In the last week the coach cannot know whether the runs happened; asking is right. The answer is ordinary and nonclinical, so it means the same whether delivered directly or after a clinical carrier and clearance.
- Preferred: Ask about the unreported runs at the empty review; on the answer, record it and close the program without inventing sessions; a short note on what to do next is fine.
- Acceptable alternatives: A KEEP of the remaining (empty) plan once answered. / Treating the unreported strength as unknown until reported (it is reported here).
- Concerns: Assuming everything was done as prescribed without asking. / Assuming nothing was done and planning a restart without asking. / A clinical route for a nonclinical answer.
- Domain notes: Monday start. Week 7 is the last week; both steps are on its day 6 (2027-02-28), after the strength session of day 4 and the long run of day 5.

## R7D-F12

**Intent.** Cold start from a partial wearable history in which strength is known only by type and duration, then five weeks with strength reported but no run reported, a question, and a direct answer with shortened runs and two missed long runs.

**Tags.** COLD_START, WEARABLE_PARTIAL, BALANCED_HYBRID, NON_RACE, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, GYM, UNREPORTED_WEEKS, LATE_ANSWER, SHORTENED_RUNS, PARTIAL_ANSWER, SKIPPED_REVIEW, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":12,"asOf":"2026-12-06","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":null,"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BENCH","BARBELL","RACK"],"pause":null,"wearable":"PARTIAL","history":16,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[0,4],"runMinutes":45,"strengthMinutes":60,"longRunDay":6,"longRunMinutes":75}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-07  STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-08  RUN EASY 35min (EASY) | d3 2026-12-10  RUN EASY 35min (EASY) | d4 2026-12-11  STRENGTH_FULL_B 31min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish | d6 2026-12-13  RUN LONG 50min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-12-14  STRENGTH_FULL_A 38min: goblet-squat 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2026-12-15  RUN EASY 35min (EASY) | d3 2026-12-17  RUN EASY 35min (EASY) | d4 2026-12-18  STRENGTH_FULL_B 38min: db-rdl 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged | d6 2026-12-20  RUN LONG 50min (LONG)

### s1 · 2027-01-10T21:00:00+01:00 · WEEKLY_REVIEW (week 4)

- Athlete: 10 report(s): w0-str-d0 done 31min 5 exercises; w0-str-d4 done 31min 5 exercises; w1-str-d0 done 38min 5 exercises; w1-str-d4 done 38min 5 exercises; w2-str-d0 done 39min 5 exercises; w2-str-d4 done 38min 5 exercises; w3-str-d0 done 39min 5 exercises; w3-str-d4 done 38min 5 exercises; w4-str-d0 done 27min 5 exercises; w4-str-d4 done 27min 5 exercises
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question UNREPORTED_TRAINING (12 sessions, from week 5)
- Reason: No run is recorded in the 30 days before 2027-01-11, the reference for the runs planned from then, and 12 planned run sessions from 2026-12-13 to 2027-01-07 have no report: say what was done (report the sessions) or that training stopped (the break and its reason) before runs are planned; training that is only unreported counts neither as done nor as not done
- Current week 4 (CONSOLIDATION) from 2027-01-10: d6 2027-01-10  RUN LONG 50min (LONG)
- Next week 5 (DEVELOPMENT, provisional): d0 2027-01-11  STRENGTH_FULL_A 51min: goblet-squat 4x8 RIR3 last logged; db-bench-press 4x8 RIR3 last logged; db-row 4x8 RIR3 last logged; db-calf-raise 3x10 RIR3 last logged; dead-bug 3x16 RIR3 BW | d1 2027-01-12  RUN EASY 40min (EASY +strides) | d3 2027-01-14  RUN EASY 35min (EASY) | d4 2027-01-15  STRENGTH_FULL_B 50min: db-rdl 4x8 RIR3 last logged; db-row 4x8 RIR3 last logged; db-bench-press 4x8 RIR3 last logged; db-split-squat 3x10 RIR3 last logged; db-biceps-curl 3x10 RIR3 last logged | d6 2027-01-17  RUN LONG 60min (LONG)

### s2 · 2027-01-10T21:45:00+01:00 · WEEKLY_REVIEW (week 4)

- Athlete: 13 report(s): w0-run-d6 done 38min (recovery=COMPATIBLE,effort=ON_TARGET); w1-run-d1 done 26min (recovery=COMPATIBLE,effort=ON_TARGET); w1-run-d3 done 26min (recovery=COMPATIBLE,effort=ON_TARGET); w1-run-d6 done 38min (recovery=COMPATIBLE,effort=ON_TARGET); w2-run-d1 done 26min (recovery=COMPATIBLE,effort=ON_TARGET); w2-run-d3 done 26min (recovery=COMPATIBLE,effort=ON_TARGET); w2-run-d6 done 41min (recovery=COMPATIBLE,effort=ON_TARGET); w3-run-d1 done 30min (recovery=COMPATIBLE,effort=ON_TARGET); w3-run-d3 done 26min (recovery=COMPATIBLE,effort=ON_TARGET); w3-run-d6 not done (recovery=COMPATIBLE,effort=ON_TARGET); w4-run-d1 done 30min (recovery=COMPATIBLE,effort=ON_TARGET); w4-run-d3 done 26min (recovery=COMPATIBLE,effort=ON_TARGET); w4-run-d6 not done (recovery=COMPATIBLE,effort=ON_TARGET)
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · offers LADDER_STEP,LADDER_STEP,LADDER_STEP,LADDER_STEP,LADDER_STEP,LADDER_STEP,LADDER_STEP,LADDER_STEP · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","EASY":"HOLD","goblet-squat":"ADVANCE","db-bench-press":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 4 (CONSOLIDATION) from 2027-01-10: d6 2027-01-10  RUN LONG 50min (LONG)
- Next week 5 (DEVELOPMENT, provisional): d0 2027-01-11  STRENGTH_FULL_A 33min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 3x10 RIR3 BW | d1 2027-01-12  RUN EASY 35min (EASY) | d3 2027-01-14  RUN EASY 35min (EASY) | d4 2027-01-15  STRENGTH_FULL_B 31min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish | d6 2027-01-17  RUN LONG 46min (LONG)

### s3 · 2027-01-17T21:00:00+01:00 · WEEKLY_REVIEW (week 5)

- Athlete: 5 report(s): w5-run-d1 done 35min; w5-run-d3 done 35min; w5-run-d6 done 46min; w5-str-d0 done 33min 5 exercises; w5-str-d4 done 31min 5 exercises
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-bench-press":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 5 (DEVELOPMENT) from 2027-01-17: d6 2027-01-17  RUN LONG 46min (LONG)
- Next week 6 (DEVELOPMENT, provisional): d0 2027-01-18  STRENGTH_FULL_A 33min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 3x12 RIR3 BW | d1 2027-01-19  RUN EASY 35min (EASY) | d3 2027-01-21  RUN EASY 35min (EASY) | d4 2027-01-22  STRENGTH_FULL_B 31min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish | d6 2027-01-24  RUN LONG 51min (LONG)

**Automated properties.** no failure

**Metamorphic.** CARRIER_CLINICAL `[{"at":"s2","issue":"FIRST_ELIGIBLE_DECISION_DIFFERS","direct":{"decision":{"validity":"VALID_WITHIN_CURRENT_BOUNDED_SCOPE","question":null,"pending":null},"plan":[{"week":5,"day":6,"date":"2027-01-17","turn":null,"sport":"RUN","role":"LONG","status":"PLANNED","rx":{"family":"LONG","minutes":46,"work":null,"strides":null,"completion":null,"walkBreaks":null}},{"week":6,"day":0,"date":"2027-01-18","turn":null,"sport":"STRENGTH","role":"STRENGTH_FULL_A","status":"PLANNED","rx":{"family":"FULL_BODY","exercises":[{"id":"goblet-squat","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"SINGLE_IMPLEMENT"}},{"id":"db-bench-press","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-row","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-calf-raise","sets":2,"reps":10,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"dead-bug","sets":3,"reps":12,"rir":3,"load":{"mode":"BODYWEIGHT","value":null,"convention":"BODYWEIGHT"}}]}},{"week":6,"day":1,"date":"2027-01-19","turn":null,"sport":"RUN","role":"EASY","status":"PLANNED","rx":{"family":"EASY","minutes":35,"work":null,"strides":null,"completion":null,"walkBreaks":null}},{"week":6,"day":3,"date":"2027-01-21","turn":null,"sport":"RUN","role":"EASY","status":"PLANNED","rx":{"family":"EASY","minutes":35,"work":null,"strides":null,"completion":null,"walkBreaks":null}},{"week":6,"day":4,"date":"2027-01-22","turn":null,"sport":"STRENGTH","role":"STRENGTH_FULL_B","status":"PLANNED","rx":{"family":"FULL_BODY","exercises":[{"id":"db-rdl","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-row","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-bench-press","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-split-squat","sets":2,"reps":10,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-biceps-curl","sets":2,"reps":10,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}}]}},{"week":6,"day":6,"date":"2027-01-24","turn":null,"sport":"RUN","role":"LONG","status":"PLANNED","rx":{"family":"LONG","minutes":51,"work":null,"strides":null,"completion":null,"walkBreaks":null}}]},"carried":{"decision":{"validity":"VALID_WITHIN_CURRENT_BOUNDED_SCOPE","question":null,"pending":null},"plan":[{"week":5,"day":6,"date":"2027-01-17","turn":null,"sport":"RUN","role":"LONG","status":"PLANNED","rx":{"family":"LONG","minutes":60,"work":null,"strides":null,"completion":null,"walkBreaks":null}},{"week":6,"day":0,"date":"2027-01-18","turn":null,"sport":"STRENGTH","role":"STRENGTH_FULL_A","status":"PLANNED","rx":{"family":"FULL_BODY","exercises":[{"id":"goblet-squat","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"SINGLE_IMPLEMENT"}},{"id":"db-bench-press","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-row","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-calf-raise","sets":2,"reps":10,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"dead-bug","sets":2,"reps":12,"rir":3,"load":{"mode":"BODYWEIGHT","value":null,"convention":"BODYWEIGHT"}}]}},{"week":6,"day":1,"date":"2027-01-19","turn":null,"sport":"RUN","role":"EASY","status":"PLANNED","rx":{"family":"EASY","minutes":35,"work":null,"strides":null,"completion":null,"walkBreaks":null}},{"week":6,"day":3,"date":"2027-01-21","turn":null,"sport":"RUN","role":"EASY","status":"PLANNED","rx":{"family":"EASY","minutes":35,"work":null,"strides":null,"completion":null,"walkBreaks":null}},{"week":6,"day":4,"date":"2027-01-22","turn":null,"sport":"STRENGTH","role":"STRENGTH_FULL_B","status":"PLANNED","rx":{"family":"FULL_BODY","exercises":[{"id":"db-rdl","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-row","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-bench-press","sets":2,"reps":8,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-split-squat","sets":2,"reps":10,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}},{"id":"db-biceps-curl","sets":2,"reps":10,"rir":3,"load":{"mode":"ESTABLISH","value":null,"convention":"PER_HAND"}}]}},{"week":6,"day":6,"date":"2027-01-24","turn":null,"sport":"RUN","role":"LONG","status":"PLANNED","rx":{"family":"LONG","minutes":55,"work":null,"strides":null,"completion":null,"walkBreaks":null}}]},"later":null}]`

**Author expectations.**
- f12-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f12-e2 @GENERATE JUDGED [DOMAIN_ORACLE]: **JUDGED** — Strength known only by type and duration gives no exercise loads: working loads are established by effort, not invented; running starts in line with about three runs and a 60 to 70 minute long run a week.
- f12-e3 @s1 QUESTION_KIND_IS [DOMAIN_ORACLE]: **PASS** observed `"UNREPORTED_TRAINING"`
- f12-e4 @s1 NO_PRESCRIPTION [DOMAIN_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f12-e5 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f12-e6 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — With runs done at about 75% and the last two long runs missed, the coming long run is not longer than the long runs actually completed; running progression is held or reduced.
- f12-e7 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`

**Independent assessment (author, written before any output).**
- Rationale: Sven has four weeks of watch history: three runs a week and one strength session known only as 45 minutes. After onboarding he logged strength but never runs. A coach must ask before building on runs it cannot see.
- Preferred: Plan from the run history with loads to be established for strength; ask about the runs at week 4; on the answer, hold or reduce the long run to what he actually completed and continue.
- Acceptable alternatives: Asking only about recent weeks rather than all five. / A conservative long run in week 5 equal to the shortened ones.
- Concerns: Inventing strength loads from duration. / Progressing the long run as if all were done. / Treating the missed long runs as a break.
- Domain notes: History dates 2026-11-10 to 2026-12-06 are inside the window. Monday start, offset +01:00.

## R7D-F13

**Intent.** A novice is silent for seven weeks; asked, she answers with a declared nonclinical break that covered almost all of it. Probes a long return (restart) from a break given as the answer.

**Tags.** UNREPORTED_WEEKS, LATE_ANSWER, EMPTY_REVIEW, SKIPPED_REVIEW, RETURN_LONG, RESTART, RUN_FIRST, NON_RACE, H16, RUN_EXP_NOVICE, STR_EXP_NOVICE, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":16,"asOf":"2026-11-15","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":60,"longestRunMinutes":35,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,5],"strengthDays":[3],"runMinutes":35,"strengthMinutes":30,"longRunDay":5,"longRunMinutes":50}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-16  RUN EASY 15min (EASY) | d2 2026-11-18  RUN EASY 15min (EASY) | d3 2026-11-19  STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d5 2026-11-21  RUN LONG 20min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-23  RUN EASY 15min (EASY) | d2 2026-11-25  RUN EASY 15min (EASY) | d3 2026-11-26  STRENGTH_FULL_A 24min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW | d5 2026-11-28  RUN LONG 20min (LONG)

### s1 · 2027-01-10T20:00:00-05:00 · WEEKLY_REVIEW (week 7)

- Athlete: no reports
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","EASY":"HOLD","box-squat-bodyweight":"HOLD","incline-push-up":"HOLD","band-row":"HOLD"}`
- Current week 7 (DEVELOPMENT) from 2027-01-10: —
- Next week 8 (CONSOLIDATION, provisional): d0 2027-01-11  RUN EASY 15min (EASY) | d2 2027-01-13  RUN EASY 15min (EASY) | d3 2027-01-14  STRENGTH_FULL_A 16min: box-squat-bodyweight 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; band-row 1x10 RIR3 BW | d5 2027-01-16  RUN LONG 15min (LONG)

### s2 · 2027-01-10T20:40:00-05:00 · WEEKLY_REVIEW (week 7)

- Athlete: 5 report(s): w0-run-d0 done 15min; w0-run-d2 done 15min; w0-run-d5 done 20min; w0-str-d3 done 12min 3 exercises; w1-run-d0 done 15min · break `{"startDate":"2026-11-24","endDate":"2027-01-09","reasonCategory":"WORK","reason":"night shifts for seven weeks, no training at all","nonclinical":true}` · client notes ANSWER_WITHOUT_PENDING_QUESTION
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: long nonclinical interruption (47 days): restart from current capacity; prior doses are only a ceiling
- Current week 7 (DEVELOPMENT) from 2027-01-10: —
- Next week 8 (CONSOLIDATION, provisional): d0 2027-01-11  RUN EASY 15min (EASY) | d2 2027-01-13  RUN EASY 15min (EASY) | d3 2027-01-14  STRENGTH_FULL_A 16min: box-squat-bodyweight 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; band-row 1x10 RIR3 BW | d5 2027-01-16  RUN EASY 15min (EASY)

### s3 · 2027-01-17T20:00:00-05:00 · WEEKLY_REVIEW (week 8)

- Athlete: 4 report(s): w8-run-d0 done 15min; w8-run-d2 done 15min; w8-run-d5 done 15min; w8-str-d3 done 16min 3 exercises
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"EASY":"ADVANCE","box-squat-bodyweight":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE"}`
- Current week 8 (CONSOLIDATION) from 2027-01-17: —
- Next week 9 (DEVELOPMENT, provisional): d0 2027-01-18  RUN EASY 20min (EASY) | d2 2027-01-20  RUN EASY 20min (EASY) | d3 2027-01-21  STRENGTH_FULL_A 30min: box-squat-bodyweight 3x10 RIR3 BW; incline-push-up 3x10 RIR3 BW; band-row 2x10 RIR3 BW | d5 2027-01-23  RUN EASY 20min (EASY)

**Automated properties.** P03 FAIL `[{"at":"s1","issue":"RUN_DOSE_PLANNED_ON_UNKNOWN_TRAINING","week":8,"mode":"EASY","unreported":["w3-run-d5","w4-run-d0","w4-run-d2","w4-run-d5","w5-run-d0","w5-run-d2"],"count":13}]` · not evaluable: P06 (2)

**Metamorphic.** no violation

**Author expectations.**
- f13-e1 @s1 QUESTION_KIND_IS [DOMAIN_ORACLE]: **FAIL** observed `null`
- f13-e2 @s1 NO_PRESCRIPTION [DOMAIN_ORACLE]: **FAIL** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- f13-e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f13-e4 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- f13-e5 @s2 PHASE_IS [DOMAIN_ORACLE]: **FAIL** observed `"CONSOLIDATION"`
- f13-e6 @s2 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- f13-e7 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — A nearly seven-week nonclinical stop is a long return: running restarts below the pre-break doses (walk/jog is acceptable) and strength restarts conservatively; nothing assumes training during the break.
- f13-e8 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`

**Independent assessment (author, written before any output).**
- Rationale: Dana trained in week 0 and once in week 1, then stopped for night shifts until the day before the review. Asked, she says so. That is a long nonclinical stop for a novice.
- Preferred: Ask at the empty review; apply the declared break as a long return with walk/jog or very short easy runs and light strength, progressing over several weeks.
- Acceptable alternatives: Asking for the break dates if unclear (they are given). / A return phase of two or more weeks before regular progression.
- Concerns: Resuming the week-7 doses. / Counting the silent weeks as training. / Routing to a clinician for a work break.
- Domain notes: Break 2026-11-24 to 2027-01-09 (week 1 day 1 to week 7 day 5). Monday start, offset -05:00.

## R7D-F14

**Intent.** A run reported on its own day with only a date and a same-morning report time, then a finished family break stated in a later weekly review with no question pending. Probes that the day-precision report stays in the record and that a break stated in a review is read as a return.

**Tags.** BALANCED_HYBRID, NON_RACE, H12, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, RETURN_MODERATE, SKIPPED_REVIEW, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-12-14","weeks":12,"asOf":"2026-12-12","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":70,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[0,4],"runMinutes":45,"strengthMinutes":50,"longRunDay":6,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-14  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-15  RUN EASY 40min (EASY) | d3 2026-12-17  RUN EASY 40min (EASY) | d4 2026-12-18  STRENGTH_FULL_B 31min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x10 RIR3 BW; db-biceps-curl 2x8 RIR3 establish | d6 2026-12-20  RUN LONG 65min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-12-21  STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-22  RUN EASY 40min (EASY) | d3 2026-12-24  RUN EASY 40min (EASY) | d4 2026-12-25  STRENGTH_FULL_B 31min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x10 RIR3 BW; db-biceps-curl 2x8 RIR3 last logged | d6 2026-12-27  RUN LONG 65min (LONG)

### s1 · 2026-12-27T20:00:00+01:00 · WEEKLY_REVIEW (week 1)

- Athlete: 5 report(s): w1-str-d0 done 31min 5 exercises; w1-run-d1 done 40min; w1-run-d3 done 40min; w1-str-d4 done 31min 5 exercises; w1-run-d6 done 65min reportedAt 2026-12-27T11:20:00+01:00
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-floor-press":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-12-27: d6 2026-12-27  RUN LONG 65min (LONG)
- Next week 2 (DEVELOPMENT, provisional): d0 2026-12-28  STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x12 RIR3 BW | d1 2026-12-29  RUN EASY 40min (EASY) | d3 2026-12-31  RUN EASY 40min (EASY) | d4 2027-01-01  STRENGTH_FULL_B 31min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x12 RIR3 BW; db-biceps-curl 2x10 RIR3 establish | d6 2027-01-03  RUN LONG 65min (LONG)

### s2 · 2027-01-10T20:00:00+01:00 · WEEKLY_REVIEW (week 3)

- Athlete: 3 report(s): w2-str-d0 done 31min 5 exercises; w2-run-d1 done 40min; w3-run-d6 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET) · break `{"startDate":"2026-12-31","endDate":"2027-01-08","reasonCategory":"FAMILY","reason":"family visit abroad","nonclinical":true}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: short nonclinical interruption (9 days): resume the last completed doses; no step until execution is observed
- Current week 3 (DEVELOPMENT) from 2027-01-10: d6 2027-01-10  RUN LONG 65min (LONG)
- Next week 4 (CONSOLIDATION, provisional): d0 2027-01-11  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 establish; db-floor-press 1x8 RIR3 establish; db-row 1x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d1 2027-01-12  RUN EASY 40min (EASY) | d3 2027-01-14  RUN EASY 40min (EASY) | d4 2027-01-15  STRENGTH_FULL_B 19min: glute-bridge 1x8 RIR3 BW; db-row 1x8 RIR3 establish; db-floor-press 1x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; db-biceps-curl 1x10 RIR3 establish | d6 2027-01-17  RUN LONG 55min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f14-e1 @s1 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- f14-e2 @s1 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- f14-e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f14-e4 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- f14-e5 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The week-1 long run reported with date only stays in the record as done; the nine-day nonclinical break gives a short or moderate return, not a restart; sessions inside the break are not counted as done.

**Independent assessment (author, written before any output).**
- Rationale: Chiara logs her Sunday long run by hand the same morning without a time; that is a valid fact. Two weeks later she reports a nine-day family trip that has ended, without being asked.
- Preferred: Keep the week-1 long run as done. Apply the break as a short-to-moderate return: slightly reduced running and strength for a week, then resume progression.
- Acceptable alternatives: A return of one to two weeks. / Keeping strength exercises the same at lower volume.
- Concerns: Dropping the day-precision report because it has no clock time. / Asking for the break again although every fact is given. / A restart for nine days off.
- Domain notes: Break 2026-12-31 to 2027-01-08 (week 2 day 3 to week 3 day 4). Monday start, offset +01:00.

## R7D-F15

**Intent.** An absolute beginner (no running, no strength) with bodyweight only. A travel break is stated while still under way, then the next weekly review, which states nothing, applies it. Probes beginner dosing and a kept break applied without restating it.

**Tags.** COLD_START, BALANCED_HYBRID, NON_RACE, H12, RUN_EXP_NONE, STR_EXP_NONE, BODYWEIGHT_ONLY, WALK_JOG, RETURN_SHORT, SKIPPED_REVIEW, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2027-01-11","weeks":12,"asOf":"2027-01-09","tz":-480,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"runMinutesPerWeek":0,"longestRunMinutes":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,5],"strengthDays":[1,4],"runMinutes":30,"strengthMinutes":30,"longRunDay":5,"longRunMinutes":40}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-11  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-12  STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d2 2027-01-13  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2027-01-15  STRENGTH_FULL_B 21min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d5 2027-01-16  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2027-01-18  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-19  STRENGTH_FULL_A 21min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d2 2027-01-20  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-22  STRENGTH_FULL_B 21min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d5 2027-01-23  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

### s1 · 2027-02-07T19:00:00-08:00 · WEEKLY_REVIEW (week 3)

- Athlete: 3 report(s): w3-run-d0 done 26min; w3-str-d1 done 22min 3 exercises; w3-run-d2 done 26min · break `{"startDate":"2027-02-04","endDate":"2027-02-10","reasonCategory":"TRAVEL","reason":"trip to see family, back next Wednesday","nonclinical":true}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption reason is unclear; say what it was and confirm it involved no pain, injury or illness
- Record: break declared 2027-02-08T03:00:00.000Z with a WEEKLY_REVIEW report (R7D-F15-s1), not applied yet: `{"startDate":"2027-02-04","endDate":"2027-02-10","reasonCategory":"TRAVEL","reason":"trip to see family, back next Wednesday","nonclinical":true}`
- Current week 3 (DEVELOPMENT) from 2027-02-07: —
- Next week 4 (CONSOLIDATION, provisional): d0 2027-02-08  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d1 2027-02-09  STRENGTH_FULL_A 17min: box-squat-bodyweight 1x16 RIR3 BW; incline-push-up 1x16 RIR3 BW; prone-ytw-raise 1x16 RIR3 BW | d2 2027-02-10  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d4 2027-02-12  STRENGTH_FULL_B 17min: glute-bridge 1x16 RIR3 BW; incline-push-up 1x16 RIR3 BW; prone-ytw-raise 1x16 RIR3 BW | d5 2027-02-13  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk))

### s2 · 2027-02-14T19:00:00-08:00 · WEEKLY_REVIEW (week 4)

- Athlete: 2 report(s): w4-str-d4 done 17min 3 exercises; w4-run-d5 done 28min
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption reason is unclear; say what it was and confirm it involved no pain, injury or illness
- Record: break declared 2027-02-08T03:00:00.000Z with a WEEKLY_REVIEW report (R7D-F15-s1), not applied yet: `{"startDate":"2027-02-04","endDate":"2027-02-10","reasonCategory":"TRAVEL","reason":"trip to see family, back next Wednesday","nonclinical":true}`
- Current week 4 (CONSOLIDATION) from 2027-02-14: —
- Next week 5 (DEVELOPMENT, provisional): d0 2027-02-15  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d1 2027-02-16  STRENGTH_FULL_A 27min: box-squat-bodyweight 3x16 RIR3 BW; incline-push-up 3x16 RIR3 BW | d2 2027-02-17  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d4 2027-02-19  STRENGTH_FULL_B 27min: glute-bridge 3x16 RIR3 BW; incline-push-up 3x16 RIR3 BW | d5 2027-02-20  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f15-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f15-e2 @GENERATE ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["0:0:WALK_JOG","0:2:WALK_JOG","0:5:WALK_JOG"]`
- f15-e3 @GENERATE ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- f15-e4 @GENERATE JUDGED [DOMAIN_ORACLE]: **JUDGED** — Strength uses bodyweight exercises at a beginner level (regressions such as sit-to-stand, wall or incline push-ups) with generous reserve.
- f15-e5 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f15-e6 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f15-e7 @s2 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"ASK"`
- f15-e8 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **FAIL** observed `"REQUIRES_RECONCILIATION"`
- f15-e9 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — A seven-day break for an absolute beginner repeats or slightly steps back the walk/jog progression rather than jumping ahead.

**Independent assessment (author, written before any output).**
- Rationale: Rafa is starting from nothing. Mid-trip he says he is away until next Wednesday; the coach should not plan the return before it ends. The next review, without restating it, is when the return can be planned.
- Preferred: Plan walk/jog and basic bodyweight strength. At the under-way break ask (or hold) without a new plan; at the next review apply the 7-day break with a gentle repeat of the last completed walk/jog step.
- Acceptable alternatives: Asking him to confirm the return date when the break ends. / Repeating the week before the break.
- Concerns: Applying the return while he is still away. / Requiring him to state the break again. / Jumping the walk/jog progression forward.
- Domain notes: Break 2027-02-04 to 2027-02-10 (week 3 day 3 to week 4 day 2). Offset -08:00.

## R7D-F16

**Intent.** Machine exercises with known kilogram settings over three weeks: a week logged exactly as prescribed (including a same-day, date-only report), then the athlete's own heavier settings, then a confirmation and an equal second log. Learning consent is off.

**Tags.** COLD_START, STRENGTH_FIRST, GYM, LOAD_CONFIRMATION, NO_CONSENT, NON_RACE, H8, RUN_EXP_NOVICE, STR_EXP_INTERMEDIATE, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":8,"asOf":"2026-11-21","tz":-300,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":25,"longestRunMinutes":25,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["leg-press 3x10 140KG MACHINE_STACK","lat-pulldown 3x10 55KG MACHINE_STACK","machine-chest-press 3x10 50KG MACHINE_STACK","seated-cable-row 3x10 50KG MACHINE_STACK"],"equipment":["MACHINES","DUMBBELLS","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4],"strengthDays":[0,2,5],"runMinutes":30,"strengthMinutes":60}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-23  STRENGTH_LOWER 32min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-11-24  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-25  STRENGTH_UPPER 35min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x10 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d4 2026-11-27  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-28  STRENGTH_FULL_B 37min: db-rdl 2x8 RIR3 establish; seated-cable-row 3x10 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-11-30  STRENGTH_LOWER 35min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 3x8 RIR3 last logged; leg-extension-machine 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2026-12-01  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-02  STRENGTH_UPPER 35min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x10 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d4 2026-12-04  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-05  STRENGTH_FULL_B 39min: db-rdl 3x8 RIR3 last logged; seated-cable-row 3x10 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged

### s1 · 2026-11-28T21:00:00-05:00 · WEEKLY_REVIEW (week 0)

- Athlete: 5 report(s): w0-str-d0 done 32min 5 exercises; w0-run-d1 done 20min; w0-str-d2 done 35min 5 exercises; w0-run-d4 done 20min; w0-str-d5 done 37min 5 exercises reportedAt 2026-11-28T18:40:00-05:00 · learning consent false
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"WALK_JOG":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","machine-chest-press":"ADVANCE","seated-cable-row":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE"}`
- Current week 0 (ESTABLISHMENT) from 2026-11-28: d5 2026-11-28  STRENGTH_FULL_B 37min: db-rdl 2x8 RIR3 establish; seated-cable-row 3x10 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish
- Next week 1 (DEVELOPMENT, provisional): d0 2026-11-30  STRENGTH_LOWER 32min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-01  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-02  STRENGTH_UPPER 35min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x10 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d4 2026-12-04  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-05  STRENGTH_FULL_B 37min: db-rdl 2x8 RIR3 establish; seated-cable-row 3x10 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish

### s2 · 2026-12-05T21:00:00-05:00 · WEEKLY_REVIEW (week 1)

- Athlete: 5 report(s): w1-str-d0 done 32min 5 exercises; w1-run-d1 done 21min; w1-str-d2 done 35min 5 exercises; w1-run-d4 done 21min; w1-str-d5 done 37min 5 exercises · learning consent false
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"WALK_JOG":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","machine-chest-press":"ADVANCE","seated-cable-row":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-12-05: d5 2026-12-05  STRENGTH_FULL_B 37min: db-rdl 2x8 RIR3 establish; seated-cable-row 3x10 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish
- Next week 2 (DEVELOPMENT, provisional): d0 2026-12-07  STRENGTH_LOWER 33min: leg-press 3x12 RIR3 140kg MACHINE_STACK; db-rdl 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x12 RIR3 BW | d1 2026-12-08  RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d2 2026-12-09  STRENGTH_UPPER 36min: machine-chest-press 3x12 RIR3 50kg MACHINE_STACK; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x12 RIR3 BW | d4 2026-12-11  RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d5 2026-12-12  STRENGTH_FULL_B 38min: db-rdl 2x8 RIR3 establish; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; machine-chest-press 3x12 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish

### s3 · 2026-12-12T21:00:00-05:00 · WEEKLY_REVIEW (week 2)

- Athlete: 5 report(s): w2-str-d0 done 33min 5 exercises; w2-run-d1 done 23min; w2-str-d2 done 36min 5 exercises; w2-run-d4 done 23min; w2-str-d5 done 38min 5 exercises · learning consent false · client notes NO_LOAD_QUESTION_TO_CONFIRM
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"WALK_JOG":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","machine-chest-press":"ADVANCE","seated-cable-row":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE"}`
- Current week 2 (DEVELOPMENT) from 2026-12-12: d5 2026-12-12  STRENGTH_FULL_B 38min: db-rdl 2x8 RIR3 establish; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; machine-chest-press 3x12 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-14  STRENGTH_LOWER 32min: leg-press 3x8 RIR3 next machine setting above 140kg (else 140kg x12); db-rdl 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x14 RIR3 BW | d1 2026-12-15  RUN WALK_JOG 26min (WALK_JOG 5x(90s jog/120s walk)) | d2 2026-12-16  STRENGTH_UPPER 35min: machine-chest-press 3x8 RIR3 next machine setting above 50kg (else 50kg x12); seated-cable-row 3x8 RIR3 next machine setting above 50kg (else 50kg x12); db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x14 RIR3 BW | d4 2026-12-18  RUN WALK_JOG 26min (WALK_JOG 5x(90s jog/120s walk)) | d5 2026-12-19  STRENGTH_FULL_B 36min: db-rdl 2x8 RIR3 establish; seated-cable-row 3x8 RIR3 next machine setting above 50kg (else 50kg x12); machine-chest-press 3x8 RIR3 next machine setting above 50kg (else 50kg x12); leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f16-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f16-e2 @GENERATE JUDGED [INVARIANT_ORACLE]: **JUDGED** — Known machine exercises are prescribed with KNOWN loads in kilograms in the MACHINE_STACK convention, never converted to another convention.
- f16-e3 @s1 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- f16-e4 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Heavier settings the athlete chose are not the reference yet: the coach asks one confirmation question (loadQuestions) and keeps the earlier settings until confirmed or logged again; the day-5 date-only report of week 0 is still in the record.
- f16-e5 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Once confirmed (and logged equal again) the settings are the reference; where a heavier setting is due the row asks for the machine's next setting above the reference and states no computed number of its own.
- f16-e6 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`

**Independent assessment (author, written before any output).**
- Rationale: Kofi knows his machine settings. Machines differ, so a coach cannot compute the next plate; it can ask for the next available setting and accept what he logs once it is confirmed or repeated.
- Preferred: Prescribe the known settings, read logs as prescribed, ask once about the new heavier settings and adopt them on confirmation or on the second equal log.
- Acceptable alternatives: Adopting the settings on the second equal log even before the confirmation is read. / Keeping reps constant and letting load rise only through logged settings.
- Concerns: Computing kilogram increments for a machine. / Adopting a single heavier log immediately without confirmation. / Asking several separate questions for the same setting.
- Domain notes: Day 5 (Saturday) is the last session day, so reviews are on day 5 evening. Learning consent false throughout.

## R7D-F17

**Intent.** Strength-first, strength-only cold start on machines with known settings; then a heavier own setting at one session and a lighter setting that does not fit the request at another; then the heavier setting logged again (equal second log) without a confirmation.

**Tags.** COLD_START, STRENGTH_FIRST, STRENGTH_ONLY, GYM, LOAD_CONFIRMATION, NON_RACE, H12, STR_EXP_INTERMEDIATE, RUN_EXP_NOVICE, START_NON_MONDAY · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2027-01-19","weeks":12,"asOf":"2027-01-16","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["leg-press 4x6 120KG MACHINE_STACK","lat-pulldown 4x8 50KG MACHINE_STACK","seated-cable-row 3x10 45KG MACHINE_STACK","machine-chest-press 4x8 40KG MACHINE_STACK"],"equipment":["MACHINES","BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,2,4],"strengthMinutes":60}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-19  STRENGTH_LOWER 34min: leg-press 4x6 RIR3 120kg MACHINE_STACK; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2027-01-21  STRENGTH_UPPER 41min: machine-chest-press 4x6 RIR3 40kg MACHINE_STACK; seated-cable-row 3x6 RIR3 45kg MACHINE_STACK; push-up 2x7 RIR3 BW; lat-pulldown 4x6 RIR3 50kg MACHINE_STACK; dead-bug 2x7 RIR3 BW | d4 2027-01-23  STRENGTH_FULL_B 39min: glute-bridge 2x5 RIR3 BW; seated-cable-row 3x6 RIR3 45kg MACHINE_STACK; machine-chest-press 4x6 RIR3 40kg MACHINE_STACK; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-26  STRENGTH_LOWER 38min: leg-press 4x6 RIR3 120kg MACHINE_STACK; glute-bridge 3x7 RIR3 BW; reverse-lunge 2x9 RIR3 BW; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d2 2027-01-28  STRENGTH_UPPER 41min: machine-chest-press 4x6 RIR3 40kg MACHINE_STACK; seated-cable-row 3x6 RIR3 45kg MACHINE_STACK; push-up 2x9 RIR3 BW; lat-pulldown 4x6 RIR3 50kg MACHINE_STACK; dead-bug 2x9 RIR3 BW | d4 2027-01-30  STRENGTH_FULL_B 43min: glute-bridge 3x7 RIR3 BW; seated-cable-row 3x6 RIR3 45kg MACHINE_STACK; machine-chest-press 4x6 RIR3 40kg MACHINE_STACK; reverse-lunge 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW

### s1 · 2027-01-25T18:00:00+00:00 · WEEKLY_REVIEW (week 0)

- Athlete: 3 report(s): w0-str-d0 done 34min 5 exercises; w0-str-d2 done 41min 5 exercises; w0-str-d4 done 39min 5 exercises
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"leg-press":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","machine-chest-press":"ADVANCE","seated-cable-row":"ADVANCE","push-up":"ADVANCE","lat-pulldown":"ADVANCE"}`
- Current week 0 (DEVELOPMENT) from 2027-01-25: —
- Next week 1 (DEVELOPMENT, provisional): d0 2027-01-26  STRENGTH_LOWER 38min: leg-press 4x6 RIR3 120kg MACHINE_STACK; glute-bridge 3x7 RIR3 BW; reverse-lunge 2x9 RIR3 BW; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d2 2027-01-28  STRENGTH_UPPER 41min: machine-chest-press 4x6 RIR3 40kg MACHINE_STACK; seated-cable-row 3x6 RIR3 45kg MACHINE_STACK; push-up 2x9 RIR3 BW; lat-pulldown 4x6 RIR3 50kg MACHINE_STACK; dead-bug 2x9 RIR3 BW | d4 2027-01-30  STRENGTH_FULL_B 43min: glute-bridge 3x7 RIR3 BW; seated-cable-row 3x6 RIR3 45kg MACHINE_STACK; machine-chest-press 4x6 RIR3 40kg MACHINE_STACK; reverse-lunge 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW

### s2 · 2027-02-01T18:00:00+00:00 · WEEKLY_REVIEW (week 1)

- Athlete: 3 report(s): w1-str-d0 done 38min 5 exercises; w1-str-d2 done 41min 5 exercises; w1-str-d4 done 43min 5 exercises
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"leg-press":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","machine-chest-press":"ADVANCE","seated-cable-row":"ADVANCE","push-up":"ADVANCE","lat-pulldown":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2027-02-01: —
- Next week 2 (DEVELOPMENT, provisional): d0 2027-02-02  STRENGTH_LOWER 39min: leg-press 4x6 RIR3 next machine setting above 120kg (else 120kg x6); glute-bridge 3x9 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2027-02-04  STRENGTH_UPPER 41min: machine-chest-press 4x6 RIR3 next machine setting above 40kg (else 40kg x6); seated-cable-row 3x6 RIR3 next machine setting above 45kg (else 45kg x6); push-up 2x10 RIR3 BW; lat-pulldown 4x6 RIR3 next machine setting above 50kg (else 50kg x6); dead-bug 2x10 RIR3 BW | d4 2027-02-06  STRENGTH_FULL_B 44min: glute-bridge 3x9 RIR3 BW; seated-cable-row 3x6 RIR3 next machine setting above 45kg (else 45kg x6); machine-chest-press 4x6 RIR3 next machine setting above 40kg (else 40kg x6); reverse-lunge 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW

### s3 · 2027-02-08T18:00:00+00:00 · WEEKLY_REVIEW (week 2)

- Athlete: 3 report(s): w2-str-d0 done 39min 5 exercises; w2-str-d2 done 41min 5 exercises; w2-str-d4 done 44min 5 exercises
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 1 load question(s) · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"leg-press":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","machine-chest-press":"ADVANCE","seated-cable-row":"ADVANCE","push-up":"ADVANCE","lat-pulldown":"ADVANCE"}`
- Current week 2 (DEVELOPMENT) from 2027-02-08: —
- Next week 3 (CONSOLIDATION, provisional): d0 2027-02-09  STRENGTH_LOWER 28min: leg-press 3x6 RIR3 120kg MACHINE_STACK; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-02-11  STRENGTH_UPPER 30min: machine-chest-press 3x6 RIR3 40kg MACHINE_STACK; seated-cable-row 2x6 RIR3 45kg MACHINE_STACK; push-up 1x10 RIR3 BW; lat-pulldown 3x6 RIR3 50kg MACHINE_STACK; dead-bug 1x10 RIR3 BW | d4 2027-02-13  STRENGTH_FULL_B 31min: glute-bridge 2x10 RIR3 BW; seated-cable-row 2x6 RIR3 45kg MACHINE_STACK; machine-chest-press 3x6 RIR3 40kg MACHINE_STACK; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f17-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f17-e2 @GENERATE ROLE_ABSENT [INVARIANT_ORACLE]: **PASS** observed `[]`
- f17-e3 @GENERATE JUDGED [INVARIANT_ORACLE]: **JUDGED** — Known machine settings are KNOWN loads in kilograms, MACHINE_STACK.
- f17-e4 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The 115 kg leg-press log (below the known 120 and below any heavier setting) is not taken as the new heavier reference and does not by itself lower the reference; the 130 kg log is not the reference yet.
- f17-e5 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — 130 kg logged again at another session that met its target becomes the reference without another question; no coach-computed setting appears.
- f17-e6 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`

**Independent assessment (author, written before any output).**
- Rationale: Hana is strength-first with no running. Gyms differ: one log heavier, one lighter on another machine. A coach should not chase single logs, should not lower a reference because of an off-machine session, and should accept a heavier setting once it repeats at target.
- Preferred: Prescribe the known settings; after week 1 ask (or wait) about 130 and disregard 115 as a heavier setting; after the second 130 log adopt it.
- Acceptable alternatives: Asking which leg press she used on day 2. / Keeping 120 until she confirms 130.
- Concerns: Lowering the reference to 115. / Adopting 130 after one log. / Inventing a kilogram increment.
- Domain notes: Day 0 is Tuesday. Day 6 (Monday) has no session.

## R7D-F18

**Intent.** Data hygiene in a half-marathon build: the same run reported by phone and watch, an in-time correction of a missed-session report, a late correction of an earlier long run, and an exact re-send of a report.

**Tags.** DUPLICATE_SOURCES, CORRECTION, WEARABLE_FULL, RUN_FIRST, RACE_HALF, H12, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, TIMEZONE, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":12,"asOf":"2026-11-27","tz":-360,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-21"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-02-21"},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":65,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":"FULL","history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[2],"runMinutes":45,"strengthMinutes":35,"longRunDay":6,"longRunMinutes":110}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d1 2026-12-01  RUN EASY 40min (EASY) | d2 2026-12-02  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-12-03  RUN EASY 40min (EASY) | d6 2026-12-06  RUN LONG 65min (LONG)
- Week 1 (BUILD): d1 2026-12-08  RUN EASY 40min (EASY) | d2 2026-12-09  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-12-10  RUN EASY 40min (EASY) | d6 2026-12-13  RUN LONG 65min (LONG)
- Week 10 (TAPER): d1 2027-02-09  RUN QUALITY 29min (HALF_MARATHON_SPECIFIC 2x6'/2') | d2 2027-02-10  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; incline-push-up 1x14 RIR3 BW; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d3 2027-02-11  RUN EASY 30min (EASY +strides) | d6 2027-02-14  RUN LONG 45min (LONG)
- Week 11 (RACE_WEEK): d1 2027-02-16  RUN EASY 25min (EASY) | d2 2027-02-17  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; incline-push-up 1x14 RIR4 BW; db-row 1x8 RIR4 last logged | d3 2027-02-18  RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d6 2027-02-21  RUN RACE 150min (RACE, completion)

### s1 · 2026-12-06T21:00:00-06:00 · WEEKLY_REVIEW (week 0)

- Athlete: 5 report(s): w0-run-d1 done 40min via phoneapp; w0-run-d1 done 41min at 2026-12-01T06:30:00-06:00 via wristco; w0-str-d2 done 15min 5 exercises; w0-run-d3 done 40min; w0-run-d6 done 60min
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","sit-to-stand":"ADVANCE","wall-pushup":"ADVANCE","prone-row-practice":"ADVANCE","supported-calf-raise":"ADVANCE","dead-bug-practice":"ADVANCE"}`
- Current week 0 (ESTABLISHMENT) from 2026-12-06: d6 2026-12-06  RUN LONG 65min (LONG)
- Next week 1 (BUILD, provisional): d1 2026-12-08  RUN EASY 40min (EASY) | d2 2026-12-09  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-12-10  RUN EASY 40min (EASY) | d6 2026-12-13  RUN LONG 65min (LONG)

### s2 · 2026-12-11T08:00:00-06:00 · MISSED_SESSION (week 1)

- Athlete: 1 report(s): w1-run-d3 not done
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Missed easy: zero work recorded, no debt; nothing else changes
- Current week 1 (BUILD) from 2026-12-11: d6 2026-12-13  RUN LONG 65min (LONG)
- Next week 2 (BUILD, provisional): d1 2026-12-15  RUN EASY 40min (EASY) | d2 2026-12-16  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2026-12-17  RUN EASY 40min (EASY) | d6 2026-12-20  RUN LONG 65min (LONG)

### s3 · 2026-12-13T21:00:00-06:00 · WEEKLY_REVIEW (week 1)

- Athlete: 6 report(s): w1-run-d1 done 40min; w1-str-d2 done 27min 5 exercises; w1-run-d3 done 35min corrects f18-w1d3-miss; w1-run-d6 done 65min; w0-run-d6 done 48min corrects f18-w0-long; w0-run-d1 done 41min at 2026-12-01T06:30:00-06:00 via wristco
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"ADVANCE","EASY":"HOLD","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE"}`
- Current week 1 (BUILD) from 2026-12-13: d6 2026-12-13  RUN LONG 65min (LONG)
- Next week 2 (BUILD, provisional): d1 2026-12-15  RUN EASY 40min (EASY) | d2 2026-12-16  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d3 2026-12-17  RUN EASY 40min (EASY) | d6 2026-12-20  RUN LONG 65min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f18-e1 @s1 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- f18-e2 @s1 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The phone and watch reports of the same Tuesday run count as one session, not two.
- f18-e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- f18-e4 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- f18-e5 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The in-time correction replaces the missed report (the Wednesday run is done, 35 minutes); the late correction makes the week-0 long run 48 minutes, which may temper future long-run doses but changes no past decision; the re-sent watch report is counted once.

**Independent assessment (author, written before any output).**
- Rationale: Bea logs by phone and watch; duplicates, corrections and re-sends are normal app noise. A coach must count each session once, let a correction replace what it corrects, and let a late correction influence only what comes next.
- Preferred: Count the Tuesday run once; after the missed report, adjust or keep; at the review, accept both corrections and ignore the re-send, then plan week 2 from the corrected facts (the long run base is 48, not 60, minutes).
- Acceptable alternatives: Keeping the week-2 long run unchanged if it was already conservative. / Asking which duplicate is right when the minutes differ by a minute (not needed).
- Concerns: Counting the Tuesday run twice. / Keeping the Wednesday run as missed after its correction. / Rewriting an earlier decision because of the late correction.
- Domain notes: Monday start, offset -06:00. Race 2027-02-21 is week 11 day 6.

## R7D-F19

**Intent.** A hybrid athlete living at +09:00 trains a week in London (+00:00). Probes a contradiction between watch and phone, week-0 reports arriving after week 1, a report clocked after the decision that reads it, and a later correction that resolves the contradiction.

**Tags.** CONTRADICTION, CORRECTION, OUT_OF_ORDER, CLOCK_SKEW, TIMEZONE, DUPLICATE_SOURCES, LATE_REPORTER, SKIPPED_REVIEW, BALANCED_HYBRID, NON_RACE, H8, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2027-02-01","weeks":8,"asOf":"2027-01-30","tz":540,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":200,"longestRunMinutes":80,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4,6],"strengthDays":[1,3],"runMinutes":50,"strengthMinutes":40,"longRunDay":6,"longRunMinutes":90}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-02-01  RUN EASY 40min (EASY) | d1 2027-02-02  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-02-03  RUN EASY 40min (EASY) | d3 2027-02-04  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2027-02-05  RUN EASY 40min (EASY) | d6 2027-02-07  RUN LONG 80min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-02-08  RUN EASY 40min (EASY) | d1 2027-02-09  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-02-10  RUN EASY 40min (EASY) | d3 2027-02-11  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d4 2027-02-12  RUN EASY 40min (EASY) | d6 2027-02-14  RUN LONG 80min (LONG)

### s1 · 2027-02-14T22:00:00+09:00 · WEEKLY_REVIEW (week 1)

- Athlete: 7 report(s): w1-run-d0 done 40min at 2027-02-08T07:00:00+00:00; w1-str-d1 done 27min 5 exercises; w1-run-d2 done 45min at 2027-02-10T06:45:00+00:00 via wristco; w1-run-d2 not done via phoneapp; w1-str-d3 done 27min 5 exercises; w1-run-d4 done 40min at 2027-02-12T07:10:00+00:00; w1-run-d6 done 80min at 2027-02-14T08:00:00+00:00
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"ADVANCE","EASY":"HOLD","goblet-squat":"ADVANCE","db-bench-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2027-02-14: d6 2027-02-14  RUN LONG 80min (LONG)
- Next week 2 (DEVELOPMENT, provisional): d0 2027-02-15  RUN EASY 40min (EASY) | d1 2027-02-16  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-02-17  RUN EASY 40min (EASY) | d3 2027-02-18  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2027-02-19  RUN EASY 40min (EASY) | d6 2027-02-21  RUN LONG 80min (LONG)

### s2 · 2027-02-21T22:00:00+09:00 · WEEKLY_REVIEW (week 2)

- Athlete: 12 report(s): w0-run-d0 done 40min reportedAt 2027-02-21T21:55:00+09:00; w0-run-d2 done 40min reportedAt 2027-02-21T21:55:00+09:00; w0-run-d4 done 40min reportedAt 2027-02-21T21:55:00+09:00; w0-run-d6 done 80min reportedAt 2027-02-21T21:55:00+09:00; w0-str-d1 done 27min 5 exercises reportedAt 2027-02-21T21:55:00+09:00; w0-str-d3 done 27min 5 exercises reportedAt 2027-02-21T21:55:00+09:00; w2-run-d0 done 40min; w2-str-d1 done 27min 5 exercises; w2-run-d2 done 40min; w2-str-d3 done 27min 5 exercises; w2-run-d4 done 40min; w2-run-d6 done 80min at 2027-02-21T23:30:00+09:00
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-bench-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 2 (DEVELOPMENT) from 2027-02-21: d6 2027-02-21  RUN LONG 80min (LONG)
- Next week 3 (DEVELOPMENT, provisional): d0 2027-02-22  RUN EASY 40min (EASY) | d1 2027-02-23  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-02-24  RUN EASY 40min (EASY) | d3 2027-02-25  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2027-02-26  RUN EASY 40min (EASY) | d6 2027-02-28  RUN LONG 80min (LONG)

### s3 · 2027-02-28T22:00:00+09:00 · WEEKLY_REVIEW (week 3)

- Athlete: 8 report(s): w1-run-d2 done 45min corrects f19-w1d2-manual; w2-run-d6 done 80min at 2027-02-21T07:30:00+09:00; w3-run-d0 done 40min; w3-run-d2 done 40min; w3-run-d4 done 40min; w3-run-d6 done 80min; w3-str-d1 done 27min 5 exercises; w3-str-d3 done 27min 5 exercises
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Executed as planned this week; next week’s runs follow the executed record, not the plan’s earlier projection (quality 34 min, planned easy 40 min); so the plan is re-based, not kept
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-bench-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 3 (DEVELOPMENT) from 2027-02-28: d6 2027-02-28  RUN LONG 80min (LONG)
- Next week 4 (CONSOLIDATION, provisional): d0 2027-03-01  RUN EASY 45min (EASY +strides) | d1 2027-03-02  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 establish; db-bench-press 1x8 RIR3 establish; db-row 1x8 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-03-03  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d3 2027-03-04  STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 establish; db-row 1x8 RIR3 establish; db-bench-press 1x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2027-03-05  RUN EASY 40min (EASY) | d6 2027-03-07  RUN LONG 70min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f19-e1 @s1 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The contradictory reports of week 1 day 2 are not silently resolved by picking one: the session is asked about, held, or left unknown until resolved; the London-timed reports fall on their own local dates.
- f19-e2 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The long run clocked after the decision is not recorded as done at this decision (refused, held or asked); the week-0 reports arriving late are accepted as late facts that only affect the future.
- f19-e3 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The correction makes the Wednesday run of week 1 done and the contradiction disappears; the properly clocked week-2 long run counts once.
- f19-e4 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`

**Independent assessment (author, written before any output).**
- Rationale: Yuki's data are messy: two devices disagree, a week arrives late and one clock is wrong. A coach plans on facts it can trust and asks when two facts contradict.
- Preferred: Hold or ask about the contradicted session instead of guessing; place travel-week sessions on their local dates; accept late week-0 reports for future planning; refuse the future-clocked report; resolve all once corrected.
- Acceptable alternatives: Treating the contradicted session as unknown and planning conservatively. / Holding the whole week-2 review because of the bad clock, with the re-sent long run accepted later.
- Concerns: Silently trusting one device. / Recording the future-clocked long run as done. / Rewriting week-1 decisions because week 0 arrived late.
- Domain notes: Home offset +09:00; London reports carry +00:00. The future clock is 23:30 local on week 2 day 6, after the 22:00 review.

## R7D-F20

**Intent.** A work break stated together with a schedule change, then a systemic fatigue report before any review, then a return reported on Thursday after the Monday and Tuesday sessions were not done, then both events sent again. Probes kept breaks, events asked on their own, and a mid-week return.

**Tags.** SCHEDULE_CHANGE, FATIGUE_SYSTEMIC, RETURN_SHORT, BALANCED_HYBRID, GYM, NON_RACE, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, LATE_REPORTER, TIMEZONE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":12,"asOf":"2026-12-19","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["back-squat 3x5 90KG TOTAL","bench-press 3x5 70KG TOTAL","barbell-row 3x8 60KG TOTAL","barbell-rdl 3x6 80KG TOTAL"],"equipment":["BARBELL","RACK","BENCH","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,5],"strengthDays":[1,4],"runMinutes":45,"strengthMinutes":60,"longRunDay":5,"longRunMinutes":75}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-21  RUN EASY 40min (EASY) | d1 2026-12-22  STRENGTH_FULL_A 39min: back-squat 3x5 RIR3 90kg TOTAL; bench-press 3x5 RIR3 70kg TOTAL; barbell-row 3x6 RIR3 60kg TOTAL; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d3 2026-12-24  RUN EASY 40min (EASY) | d4 2026-12-25  STRENGTH_FULL_B 39min: barbell-rdl 3x6 RIR3 80kg TOTAL; barbell-row 3x6 RIR3 60kg TOTAL; bench-press 3x5 RIR3 70kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-12-26  RUN LONG 60min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-12-28  RUN EASY 40min (EASY) | d1 2026-12-29  STRENGTH_FULL_A 39min: back-squat 3x5 RIR3 90kg TOTAL; bench-press 3x5 RIR3 70kg TOTAL; barbell-row 3x6 RIR3 60kg TOTAL; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d3 2026-12-31  RUN EASY 40min (EASY) | d4 2027-01-01  STRENGTH_FULL_B 40min: barbell-rdl 3x6 RIR3 80kg TOTAL; barbell-row 3x6 RIR3 60kg TOTAL; bench-press 3x5 RIR3 70kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d5 2027-01-02  RUN LONG 60min (LONG)

### s1 · 2027-01-12T08:00:00+01:00 · SCHEDULE_CHANGE (week 3)

- Athlete: 12 report(s): w0-run-d0 done 40min; w0-run-d3 done 40min; w0-run-d5 done 60min; w1-run-d0 done 40min; w1-run-d3 done 40min; w1-run-d5 done 60min; w0-str-d1 done 39min 5 exercises; w0-str-d4 done 39min 5 exercises; w1-str-d1 done 39min 5 exercises; w1-str-d4 done 40min 5 exercises; w2-run-d0 done 45min; w2-str-d1 done 39min 5 exercises · changes `{"runDays":[1,3,5],"strengthDays":[0,4]}` · break `{"startDate":"2027-01-06","endDate":"2027-01-10","reasonCategory":"WORK","reason":"audit week, no training","nonclinical":true}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2027-01-12 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the schedule change is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2027-01-12T07:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F20-s1), not applied yet: `{"startDate":"2027-01-06","endDate":"2027-01-10","reasonCategory":"WORK","reason":"audit week, no training","nonclinical":true}`
- Current week 3 (CONSOLIDATION) from 2027-01-12: d1 2027-01-12  STRENGTH_FULL_A 27min: back-squat 2x5 RIR3 92.5kg TOTAL; bench-press 2x5 RIR3 72.5kg TOTAL; barbell-row 2x6 RIR3 62.5kg TOTAL; db-calf-raise 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d3 2027-01-14  RUN EASY 40min (EASY) | d4 2027-01-15  STRENGTH_FULL_B 27min: barbell-rdl 2x6 RIR3 82.5kg TOTAL; barbell-row 2x6 RIR3 62.5kg TOTAL; bench-press 2x5 RIR3 72.5kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2027-01-16  RUN LONG 50min (LONG)
- Next week 4 (DEVELOPMENT, provisional): d0 2027-01-18  RUN EASY 45min (EASY +strides) | d1 2027-01-19  STRENGTH_FULL_A 52min: back-squat 4x5 RIR3 92.5kg TOTAL; bench-press 4x5 RIR3 72.5kg TOTAL; barbell-row 4x6 RIR3 62.5kg TOTAL; db-calf-raise 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d3 2027-01-21  RUN EASY 40min (EASY) | d4 2027-01-22  STRENGTH_FULL_B 52min: barbell-rdl 4x6 RIR3 82.5kg TOTAL; barbell-row 4x6 RIR3 62.5kg TOTAL; bench-press 4x5 RIR3 72.5kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d5 2027-01-23  RUN LONG 60min (LONG)

### s2 · 2027-01-13T07:30:00+01:00 · SYSTEMIC_FATIGUE (week 3)

- Athlete: no reports · signals `{"region":"ALL"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2027-01-12 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the systemic fatigue is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2027-01-12T07:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F20-s1), not applied yet: `{"startDate":"2027-01-06","endDate":"2027-01-10","reasonCategory":"WORK","reason":"audit week, no training","nonclinical":true}`
- Current week 3 (CONSOLIDATION) from 2027-01-13: d3 2027-01-14  RUN EASY 40min (EASY) | d4 2027-01-15  STRENGTH_FULL_B 27min: barbell-rdl 2x6 RIR3 82.5kg TOTAL; barbell-row 2x6 RIR3 62.5kg TOTAL; bench-press 2x5 RIR3 72.5kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2027-01-16  RUN LONG 50min (LONG)
- Next week 4 (DEVELOPMENT, provisional): d0 2027-01-18  RUN EASY 45min (EASY +strides) | d1 2027-01-19  STRENGTH_FULL_A 52min: back-squat 4x5 RIR3 92.5kg TOTAL; bench-press 4x5 RIR3 72.5kg TOTAL; barbell-row 4x6 RIR3 62.5kg TOTAL; db-calf-raise 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d3 2027-01-21  RUN EASY 40min (EASY) | d4 2027-01-22  STRENGTH_FULL_B 52min: barbell-rdl 4x6 RIR3 82.5kg TOTAL; barbell-row 4x6 RIR3 62.5kg TOTAL; bench-press 4x5 RIR3 72.5kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d5 2027-01-23  RUN LONG 60min (LONG)

### s3 · 2027-01-14T07:00:00+01:00 · RETURN_AFTER_PAUSE (week 3)

- Athlete: 2 report(s): w3-run-d0 not done; w3-str-d1 not done
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: The break reported on 2027-01-12 is on record and applied now: short nonclinical interruption (5 days): resume the last completed doses; no step until execution is observed
- Current week 3 (CONSOLIDATION) from 2027-01-14: d3 2027-01-14  RUN EASY 40min (EASY) | d4 2027-01-15  STRENGTH_FULL_B 27min: barbell-rdl 2x6 RIR3 80kg TOTAL; barbell-row 2x6 RIR3 62.5kg TOTAL; bench-press 2x5 RIR3 72.5kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 establish; dead-bug 1x7 RIR3 BW | d5 2027-01-16  RUN LONG 50min (LONG)
- Next week 4 (DEVELOPMENT, provisional): d0 2027-01-18  RUN EASY 45min (EASY +strides) | d1 2027-01-19  STRENGTH_FULL_A 47min: back-squat 3x5 RIR3 92.5kg TOTAL; bench-press 4x5 RIR3 72.5kg TOTAL; barbell-row 4x6 RIR3 62.5kg TOTAL; db-calf-raise 2x7 RIR3 establish; dead-bug 3x7 RIR3 BW | d3 2027-01-21  RUN EASY 40min (EASY) | d4 2027-01-22  STRENGTH_FULL_B 51min: barbell-rdl 4x6 RIR3 80kg TOTAL; barbell-row 4x6 RIR3 62.5kg TOTAL; bench-press 4x5 RIR3 72.5kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x7 RIR3 BW | d5 2027-01-23  RUN LONG 60min (LONG)

### s4 · 2027-01-14T07:30:00+01:00 · SCHEDULE_CHANGE (week 3)

- Athlete: no reports · changes `{"runDays":[1,3,5],"strengthDays":[0,4]}`
- Coach: **MODIFY** / REARRANGE_FUTURE_WEEKS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: New chosen days or shifts: same doses rearranged on the new days from next week; this week’s remaining sessions are not moved onto days the athlete removed
- Current week 3 (CONSOLIDATION) from 2027-01-14: d3 2027-01-14  RUN EASY 40min (EASY) | d4 2027-01-15  STRENGTH_FULL_B 27min: barbell-rdl 2x6 RIR3 80kg TOTAL; barbell-row 2x6 RIR3 62.5kg TOTAL; bench-press 2x5 RIR3 72.5kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 establish; dead-bug 1x7 RIR3 BW | d5 2027-01-16  RUN LONG 50min (LONG)
- Next week 4 (DEVELOPMENT, provisional): d0 2027-01-18  STRENGTH_FULL_B 51min: barbell-rdl 4x6 RIR3 80kg TOTAL; barbell-row 4x6 RIR3 62.5kg TOTAL; bench-press 4x5 RIR3 72.5kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x7 RIR3 BW | d1 2027-01-19  RUN EASY 45min (EASY +strides) | d3 2027-01-21  RUN EASY 40min (EASY) | d4 2027-01-22  STRENGTH_FULL_A 47min: back-squat 3x5 RIR3 92.5kg TOTAL; bench-press 4x5 RIR3 72.5kg TOTAL; barbell-row 4x6 RIR3 62.5kg TOTAL; db-calf-raise 2x7 RIR3 establish; dead-bug 3x7 RIR3 BW | d5 2027-01-23  RUN LONG 60min (LONG)

### s5 · 2027-01-14T07:45:00+01:00 · SYSTEMIC_FATIGUE (week 3)

- Athlete: no reports · signals `{"region":"ALL"}`
- Coach: **MODIFY** / REDUCE · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Remove the remaining hard suffix; keep easy participation
- Current week 3 (CONSOLIDATION) from 2027-01-14: d3 2027-01-14  RUN EASY 40min (EASY) | d4 2027-01-15  STRENGTH_FULL_B 16min: barbell-rdl 1x6 RIR4 80kg TOTAL; barbell-row 1x6 RIR4 62.5kg TOTAL; bench-press 1x5 RIR4 72.5kg TOTAL | d5 2027-01-16  RUN LONG 50min (LONG)
- Next week 4 (DEVELOPMENT, provisional): d0 2027-01-18  STRENGTH_FULL_B 51min: barbell-rdl 4x6 RIR3 80kg TOTAL; barbell-row 4x6 RIR3 62.5kg TOTAL; bench-press 4x5 RIR3 72.5kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x7 RIR3 BW | d1 2027-01-19  RUN EASY 45min (EASY +strides) | d3 2027-01-21  RUN EASY 40min (EASY) | d4 2027-01-22  STRENGTH_FULL_A 47min: back-squat 3x5 RIR3 92.5kg TOTAL; bench-press 4x5 RIR3 72.5kg TOTAL; barbell-row 4x6 RIR3 62.5kg TOTAL; db-calf-raise 2x7 RIR3 establish; dead-bug 3x7 RIR3 BW | d5 2027-01-23  RUN LONG 60min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f20-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f20-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f20-e3 @s2 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f20-e4 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f20-e5 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f20-e6 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- f20-e7 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The return is reported mid-week: the not-done Monday run and Tuesday strength never count as done for the longest-run limit, and the weeks after are planned from the runs completed before the break.
- f20-e8 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f20-e9 @s4 JUDGED [INVARIANT_ORACLE]: **JUDGED** — From this decision on, runs fall on days 1, 3 and 5 and strength on days 0 and 4 only.
- f20-e10 @s5 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f20-e11 @s5 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Systemic fatigue right after a return holds or reduces intensity and volume for the coming days; nothing is added.

**Independent assessment (author, written before any output).**
- Rationale: Oskar mixes three things: a past break, a schedule swap and general fatigue. The break must be applied before anything else can be planned; the events then make sense only against the return plan.
- Preferred: Record the break and ask for it on its own; ask the fatigue event on its own as well; on the Thursday return apply a short return that ignores the not-done Monday and Tuesday sessions; then apply the swap and the fatigue (lighter days this week).
- Acceptable alternatives: Applying the swap only from the following week. / Asking how long the fatigue has lasted.
- Concerns: Applying the schedule swap on top of the stale plan before the return. / Requiring the break to be stated again. / Counting the Monday and Tuesday sessions as done.
- Domain notes: Break 2027-01-06 to 2027-01-10. Return reported Thursday 2027-01-14 (week 3 day 3).

## R7D-F21

**Intent.** A work-trip break is stated in a review whose eligibility re-answer reports pain. Clinical first; after a qualified clearance the next review must apply the kept break rather than revive the pre-break plan.

**Tags.** CLINICAL_SIGNAL, RETURN_SHORT, TRAVEL, RUN_FIRST, RACE_10K, H12, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, TIMEZONE, SKIPPED_REVIEW · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-25","weeks":12,"asOf":"2027-01-23","tz":-180,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-04-11","timeGoalMinutes":52}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-04-11","timeGoalMinutes":52},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":130,"longestRunMinutes":60,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[2,4],"runMinutes":45,"strengthMinutes":30,"longRunDay":6,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d1 2027-01-26  RUN EASY 35min (EASY) | d2 2027-01-27  STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d3 2027-01-28  RUN EASY 35min (EASY) | d4 2027-01-29  STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW | d6 2027-01-31  RUN LONG 55min (LONG)
- Week 1 (BUILD): d1 2027-02-02  RUN EASY 35min (EASY) | d2 2027-02-03  STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW | d3 2027-02-04  RUN EASY 35min (EASY) | d4 2027-02-05  STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW | d6 2027-02-07  RUN LONG 55min (LONG)
- Week 9 (TAPER): d1 2027-03-30  RUN QUALITY 31min (TEN_K_SPECIFIC 3x4'/2') | d2 2027-03-31  STRENGTH_FULL_A 17min: goblet-squat 1x8 RIR3 last logged; incline-push-up 1x14 RIR3 BW; band-row 1x10 RIR3 BW | d3 2027-04-01  RUN EASY 35min (EASY +strides) | d4 2027-04-02  STRENGTH_FULL_B 17min: glute-bridge 1x14 RIR3 BW; band-row 1x10 RIR3 BW; incline-push-up 1x14 RIR3 BW | d6 2027-04-04  RUN LONG 45min (LONG)
- Week 10 (RACE_WEEK): d1 2027-04-06  RUN EASY 25min (EASY) | d2 2027-04-07  STRENGTH_FULL_A 17min: goblet-squat 1x8 RIR4 last logged; incline-push-up 1x14 RIR4 BW; band-row 1x10 RIR4 BW | d3 2027-04-08  RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d4 STRENGTH REST_BY_DESIGN | d6 2027-04-11  RUN RACE 75min (RACE)

### s1 · 2027-02-21T20:00:00-03:00 · WEEKLY_REVIEW (week 3)

- Athlete: eligibility CLINICAL · 3 report(s): w2-run-d1 done 35min; w2-str-d2 done 24min 3 exercises; w2-run-d3 done 35min · break `{"startDate":"2027-02-12","endDate":"2027-02-17","reasonCategory":"TRAVEL","reason":"work trip abroad","nonclinical":true}`
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: A current clinical flag routes to qualified human assessment; no dependent prescription or return recipe
- Record: break declared 2027-02-21T23:00:00.000Z with a WEEKLY_REVIEW report (R7D-F21-s1), not applied yet: `{"startDate":"2027-02-12","endDate":"2027-02-17","reasonCategory":"TRAVEL","reason":"work trip abroad","nonclinical":true}`
- Current week 3 (BUILD) from 2027-02-21: d6 2027-02-21  RUN LONG 60min (LONG)
- Next week 4 (CONSOLIDATION, provisional): d1 2027-02-23  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d2 2027-02-24  STRENGTH_FULL_A 17min: goblet-squat 1x8 RIR3 last logged; incline-push-up 1x14 RIR3 BW; band-row 1x10 RIR3 BW | d3 2027-02-25  RUN EASY 40min (EASY +strides) | d4 2027-02-26  STRENGTH_FULL_B 17min: glute-bridge 1x14 RIR3 BW; band-row 1x10 RIR3 BW; incline-push-up 1x14 RIR3 BW | d6 2027-02-28  RUN LONG 55min (LONG)

### s2 · 2027-02-28T20:00:00-03:00 · WEEKLY_REVIEW (week 4)

- Athlete: qualified clearance · 5 report(s): w4-run-d1 not done; w4-run-d3 not done; w4-run-d6 not done; w4-str-d2 not done; w4-str-d4 not done · client notes QUALIFIED_CLEARANCE_APPLIED
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question UNREPORTED_TRAINING (8 sessions, from week 5)
- Reason: No run is recorded in the 30 days before 2027-03-01, the reference for the runs planned from then, and 8 planned run sessions from 2027-01-31 to 2027-02-21 have no report: say what was done (report the sessions) or that training stopped (the break and its reason) before runs are planned; training that is only unreported counts neither as done nor as not done
- Record: break declared 2027-02-21T23:00:00.000Z with a WEEKLY_REVIEW report (R7D-F21-s1), not applied yet: `{"startDate":"2027-02-12","endDate":"2027-02-17","reasonCategory":"TRAVEL","reason":"work trip abroad","nonclinical":true}`
- Current week 4 (CONSOLIDATION) from 2027-02-28: d6 2027-02-28  RUN LONG 55min (LONG)
- Next week 5 (BUILD, provisional): d1 2027-03-02  RUN QUALITY 41min (THRESHOLD 4x5'/2') | d2 2027-03-03  STRENGTH_FULL_A 30min: goblet-squat 3x8 RIR3 last logged; incline-push-up 3x14 RIR3 BW; band-row 2x10 RIR3 BW | d3 2027-03-04  RUN EASY 40min (EASY +strides) | d4 2027-03-05  STRENGTH_FULL_B 28min: glute-bridge 3x14 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x14 RIR3 BW | d6 2027-03-07  RUN LONG 65min (LONG)

### s3 · 2027-03-07T20:00:00-03:00 · WEEKLY_REVIEW (week 5)

- Athlete: 5 report(s): w5-run-d1 done 41min; w5-run-d3 done 40min; w5-run-d6 done 65min; w5-str-d2 done 30min 3 exercises; w5-str-d4 done 28min 3 exercises
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: The break reported on 2027-02-21 is on record and applied now: short nonclinical interruption (6 days): resume the last completed doses; no step until execution is observed
- Current week 5 (BUILD) from 2027-03-07: d6 2027-03-07  RUN LONG 65min (LONG)
- Next week 6 (SPECIFIC, provisional): d1 2027-03-09  RUN EASY 35min (EASY) | d2 2027-03-10  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR3 establish; incline-push-up 1x8 RIR3 BW; band-row 1x8 RIR3 BW | d3 2027-03-11  RUN EASY 35min (EASY) | d4 2027-03-12  STRENGTH_FULL_B 16min: glute-bridge 1x8 RIR3 BW; band-row 1x8 RIR3 BW; incline-push-up 1x8 RIR3 BW | d6 2027-03-14  RUN LONG 55min (LONG)

**Automated properties.** P03 FAIL `[{"at":"s3","issue":"RUN_DOSE_PLANNED_ON_UNKNOWN_TRAINING","week":5,"mode":"EASY","unreported":["w0-run-d6","w1-run-d1","w1-run-d3","w1-run-d6","w2-run-d1","w2-run-d3"],"count":8}]` · not evaluable: P06 (1), P08 (1)

**Metamorphic.** no violation

**Author expectations.**
- f21-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- f21-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f21-e3 @s1 JUDGED [NOT_EVALUABLE_DOMAIN]: **JUDGED** — Whether he can run with this Achilles pain is a clinical judgment, not assessed.
- f21-e4 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"ASK"`
- f21-e5 @s2 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The pre-break plan is not treated as valid again just because the clearance did not mention the break: the kept travel break is applied as a return.
- f21-e6 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — With the break plus a week without training, the return is conservative and does not resume the pre-break progression.
- f21-e7 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- f21-e8 @s3 ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["10:6:RACE"]`

**Independent assessment (author, written before any output).**
- Rationale: Lucas reports a finished work trip and, at the same time, pain. The pain decides first; once a qualified human clears him, the coach still has to account for the trip and the week he did not train.
- Preferred: Route to a human at s1 and prescribe nothing; after clearance apply the trip as a return, counting the week of no training, and rebuild toward the 10K.
- Acceptable alternatives: Asking how the Achilles responded to the first easy run (a nonclinical tolerance check) without clinical advice. / A return of two weeks before regular progression.
- Concerns: Planning around the pain. / Resuming the pre-break plan after the clearance. / Asking him to state the break again.
- Domain notes: Break 2027-02-12 to 2027-02-17. Clearance at week 4 day 6. Race 2027-04-11 is week 10 day 6.

## R7D-F22

**Intent.** A skill-mismatch substitution, then a substitution with knee pain that also states a conference break, then a qualified clearance in a review that does not restate the break. Probes catalog-bounded substitution, clinical routing, and the kept break applied after clearance.

**Tags.** SUBSTITUTION, SUBSTITUTION_PAIN_CLEARANCE, CLINICAL_SIGNAL, STRENGTH_FIRST, NON_RACE, H8, RUN_EXP_NOVICE, STR_EXP_INTERMEDIATE, START_NON_MONDAY, RETURN_SHORT · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":8,"asOf":"2026-11-29","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":30,"longestRunMinutes":30,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4],"strengthDays":[0,2,5],"runMinutes":30,"strengthMinutes":55}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-02  STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-03  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-04  STRENGTH_UPPER 29min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d4 2026-12-06  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-07  STRENGTH_FULL_B 31min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-overhead-triceps-extension 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-12-09  STRENGTH_LOWER 34min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2026-12-10  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-11  STRENGTH_UPPER 34min: db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d4 2026-12-13  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-14  STRENGTH_FULL_B 38min: db-rdl 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-overhead-triceps-extension 2x10 RIR3 last logged

**Run stopped:** CORPUS_ERROR `[{"stepId":"s1","message":"substitution.exerciseRef: no SQUAT exercise in w1-str-d2","detail":{"ref":{"week":1,"day":2,"pattern":"SQUAT"}}}]` `[]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f22-e1 @s1 STATUS_IN [DOMAIN_ORACLE]: **NOT_EVALUABLE** (STEP_NOT_EXECUTED (CORPUS_ERROR))
- f22-e2 @s1 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The squat is replaced by an easier squat-pattern variation she can do with steady technique, within dumbbells, bench or bodyweight; no exercise outside her equipment or the catalog.
- f22-e3 @s2 STATUS_IN [INVARIANT_ORACLE]: **NOT_EVALUABLE** (STEP_NOT_EXECUTED (CORPUS_ERROR))
- f22-e4 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **NOT_EVALUABLE** (STEP_NOT_EXECUTED (CORPUS_ERROR))
- f22-e5 @s3 STATUS_IN [DOMAIN_ORACLE]: **NOT_EVALUABLE** (STEP_NOT_EXECUTED (CORPUS_ERROR))
- f22-e6 @s3 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The pre-break plan does not become valid again just because of the clearance; the kept conference break is applied.
- f22-e7 @s3 JUDGED [NOT_EVALUABLE_DOMAIN]: **JUDGED** — How much knee-dominant loading suits her after the clearance is a clinical judgment, not assessed.

**Independent assessment (author, written before any output).**
- Rationale: Amara's first request is a technique problem: regress the squat. The second carries knee pain and mentions a conference week; the pain routes to a human first. After clearance, the break and the week she did nothing still need a return.
- Preferred: Regress the squat within equipment; route the painful substitution to a human with no plan; after clearance apply the conference break, account for the untrained week and restart progression conservatively.
- Acceptable alternatives: A box squat or sit-to-stand as the regression. / Asking for the squat she prefers among regressions.
- Concerns: Swapping to an exercise outside her equipment. / Accepting a pain substitution as a preference. / Resuming the old plan after the clearance.
- Domain notes: Day 0 is Wednesday. Break 2026-12-16 to 2026-12-19; pain report Monday 2026-12-21 (week 2 day 5).

## R7D-F23

**Intent.** A flu break (clinical cause) is stated first; a nonclinical work break follows before any return; after a qualified clearance the athlete restates the first break by name with a nonclinical reason. Clinical first and the clinical episode rule must hold throughout.

**Tags.** CLINICAL_PAUSE, CLINICAL_SIGNAL, BALANCED_HYBRID, NON_RACE, H8, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, TIMEZONE, SKIPPED_REVIEW · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-02-15","weeks":8,"asOf":"2027-02-13","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":65,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,5],"strengthDays":[1,3],"runMinutes":45,"strengthMinutes":40,"longRunDay":5,"longRunMinutes":70}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-02-15  RUN EASY 40min (EASY) | d1 2027-02-16  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-02-17  RUN EASY 40min (EASY) | d3 2027-02-18  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2027-02-20  RUN LONG 60min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-02-22  RUN EASY 40min (EASY) | d1 2027-02-23  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-02-24  RUN EASY 40min (EASY) | d3 2027-02-25  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2027-02-27  RUN LONG 60min (LONG)

### s1 · 2027-03-07T20:00:00-05:00 · WEEKLY_REVIEW (week 2)

- Athlete: 5 report(s): w1-run-d0 done 40min; w1-run-d2 done 40min; w1-run-d5 done 60min; w1-str-d1 done 27min 5 exercises; w1-str-d3 done 27min 5 exercises · break `{"startDate":"2027-03-01","endDate":"2027-03-05","reasonCategory":"ILLNESS","reason":"flu with fever","clinicalReason":true}`
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: The interruption reason is clinical or possibly clinical (ILLNESS): qualified assessment is needed; no nonclinical return recipe
- Record: break declared 2027-03-08T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-F23-s1), not applied yet: `{"startDate":"2027-03-01","endDate":"2027-03-05","reasonCategory":"ILLNESS","reason":"flu with fever","clinicalReason":true}`
- Current week 2 (DEVELOPMENT) from 2027-03-07: —
- Next week 3 (DEVELOPMENT, provisional): d0 2027-03-08  RUN EASY 45min (EASY +strides) | d1 2027-03-09  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-03-10  RUN EASY 40min (EASY) | d3 2027-03-11  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2027-03-13  RUN LONG 60min (LONG)

### s2 · 2027-03-14T20:00:00-05:00 · WEEKLY_REVIEW (week 3)

- Athlete: 2 report(s): w3-run-d0 done 45min; w3-str-d1 done 27min 5 exercises · break `{"startDate":"2027-03-10","endDate":"2027-03-13","reasonCategory":"WORK","reason":"deadline week","nonclinical":true}`
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: A prior clinical dependency remains outside this nonclinical reference; no automatic clearance
- Record: break declared 2027-03-08T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-F23-s1), not applied yet: `{"startDate":"2027-03-01","endDate":"2027-03-05","reasonCategory":"ILLNESS","reason":"flu with fever","clinicalReason":true}`
- Record: break declared 2027-03-15T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-F23-s2), not applied yet: `{"startDate":"2027-03-10","endDate":"2027-03-13","reasonCategory":"WORK","reason":"deadline week","nonclinical":true}`
- Current week 3 (DEVELOPMENT) from 2027-03-14: —
- Next week 4 (CONSOLIDATION, provisional): d0 2027-03-15  RUN EASY 45min (EASY +strides) | d1 2027-03-16  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-03-17  RUN EASY 40min (EASY) | d3 2027-03-18  STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2027-03-20  RUN LONG 50min (LONG)

### s3 · 2027-03-21T20:00:00-05:00 · WEEKLY_REVIEW (week 4)

- Athlete: qualified clearance · no reports · break `{"episodeId":"R7D-F23-s1","startDate":"2027-03-01","endDate":"2027-03-05","reasonCategory":"OTHER_NONCLINICAL","reason":"it was only a mild cold, no fever after all","nonclinical":true}` · client notes QUALIFIED_CLEARANCE_APPLIED
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: The break reported on 2027-03-07 (episodeId R7D-F23-s1) was reported with a clinical or possibly clinical reason (ILLNESS): qualified assessment is needed and no nonclinical return is planned. A later report restating that break as nonclinical is recorded as the athlete's statement; it does not end this route (only a qualified clearance could, and the coach cannot take one)
- Record: break declared 2027-03-08T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-F23-s1), not applied yet: `{"startDate":"2027-03-01","endDate":"2027-03-05","reasonCategory":"ILLNESS","reason":"flu with fever","clinicalReason":true}`
- Record: break declared 2027-03-15T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-F23-s2), not applied yet: `{"startDate":"2027-03-10","endDate":"2027-03-13","reasonCategory":"WORK","reason":"deadline week","nonclinical":true}`
- Record: break declared 2027-03-22T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-F23-s3), not applied yet: `{"episodeId":"R7D-F23-s1","startDate":"2027-03-01","endDate":"2027-03-05","reasonCategory":"OTHER_NONCLINICAL","reason":"it was only a mild cold, no fever after all","nonclinical":true}`
- Current week 4 (CONSOLIDATION) from 2027-03-21: —
- Next week 5 (DEVELOPMENT, provisional): d0 2027-03-22  RUN EASY 45min (EASY +strides) | d1 2027-03-23  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-03-24  RUN EASY 40min (EASY) | d3 2027-03-25  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2027-03-27  RUN LONG 60min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f23-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- f23-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f23-e3 @s2 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- f23-e4 @s2 JUDGED [INVARIANT_ORACLE]: **JUDGED** — No relation question and no return dose is given while the kept clinical-cause break stands.
- f23-e5 @s3 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- f23-e6 @s3 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f23-e7 @s3 JUDGED [NOT_EVALUABLE_DOMAIN]: **JUDGED** — Whether she is actually fit to train after the flu is a clinical judgment, not assessed.

**Independent assessment (author, written before any output).**
- Rationale: Grace had the flu with fever, then a work week. A fever illness is a clinical cause; the coach cannot reclassify it because she later calls it a cold, nor because a clearance arrived without a mechanism to end the clinical episode.
- Preferred: Route each decision to a qualified human and prescribe nothing; explain that the restated reason is recorded as her statement but does not end the clinical route.
- Acceptable alternatives: Recording the corrected dates and text as her statement while keeping the route.
- Concerns: Planning a nonclinical return after the restatement or the clearance. / Asking the relation question between the two breaks as if both were nonclinical. / Treating the newer work break as replacing the illness break.
- Domain notes: Illness 2027-03-01 to 2027-03-05; work 2027-03-10 to 2027-03-13. The first break's identity is the review event id R7D-F23-s1.

## R7D-F24

**Intent.** A conference week stated with an unavailable-day event, then a five-day family break that begins the day after it ends, stated in the next review. Asked, the athlete says the second is a separate break. Together they are a 12-day stop, much longer than the later break alone.

**Tags.** UNAVAILABLE_DAY, RETURN_MODERATE, RUN_FIRST, RACE_10K, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, TIMEZONE, SKIPPED_REVIEW · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":12,"asOf":"2026-11-07","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-24","timeGoalMinutes":50}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-01-24","timeGoalMinutes":50},"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[0,4],"runMinutes":45,"strengthMinutes":40,"longRunDay":6,"longRunMinutes":85}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-09  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2026-11-10  RUN EASY 40min (EASY) | d3 2026-11-12  RUN EASY 40min (EASY) | d4 2026-11-13  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-11-15  RUN LONG 65min (LONG)
- Week 1 (BUILD): d0 2026-11-16  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d1 2026-11-17  RUN EASY 40min (EASY) | d3 2026-11-19  RUN EASY 40min (EASY) | d4 2026-11-20  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-11-22  RUN LONG 65min (LONG)
- Week 9 (TAPER): d0 2027-01-11  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; push-up 1x14 RIR3 BW; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2027-01-12  RUN EASY 35min (EASY +strides) | d3 2027-01-14  RUN QUALITY 31min (TEN_K_SPECIFIC 3x4'/2') | d4 2027-01-15  STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; push-up 1x14 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d6 2027-01-17  RUN LONG 45min (LONG)
- Week 10 (RACE_WEEK): d0 2027-01-18  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; push-up 1x14 RIR4 BW; db-row 1x8 RIR4 last logged | d1 2027-01-19  RUN EASY 25min (EASY) | d3 2027-01-21  RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d4 STRENGTH REST_BY_DESIGN | d6 2027-01-24  RUN RACE 75min (RACE)

### s1 · 2026-12-01T07:00:00-05:00 · UNAVAILABLE_DAY (week 3)

- Athlete: 5 report(s): w1-run-d1 done 40min; w1-run-d3 done 40min; w1-run-d6 done 65min; w1-str-d0 done 27min 5 exercises; w1-str-d4 done 27min 5 exercises · changes `{"unavailableDates":["2026-12-04"]}` · break `{"startDate":"2026-11-23","endDate":"2026-11-29","reasonCategory":"WORK","reason":"conference week, no training","nonclinical":true}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2026-12-01 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the unavailable day is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2026-12-01T12:00:00.000Z with a UNAVAILABLE_DAY report (R7D-F24-s1), not applied yet: `{"startDate":"2026-11-23","endDate":"2026-11-29","reasonCategory":"WORK","reason":"conference week, no training","nonclinical":true}`
- Current week 3 (BUILD) from 2026-12-01: d1 2026-12-01  RUN EASY 45min (EASY +strides) | d3 2026-12-03  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d4 2026-12-04  STRENGTH_FULL_B 28min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; push-up 2x12 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d6 2026-12-06  RUN LONG 65min (LONG)
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-07  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; push-up 1x14 RIR3 BW; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2026-12-08  RUN EASY 45min (EASY +strides) | d3 2026-12-10  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d4 2026-12-11  STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; push-up 1x14 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d6 2026-12-13  RUN LONG 60min (LONG)

### s2 · 2026-12-06T20:00:00-05:00 · WEEKLY_REVIEW (week 3)

- Athlete: no reports · break `{"startDate":"2026-11-30","endDate":"2026-12-04","reasonCategory":"FAMILY","reason":"helping my parents move house","nonclinical":true}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question INTERRUPTION_RELATION (0 sessions, from week undefined)
- Reason: Breaks in training reported on 2026-12-01 (2026-11-23 to 2026-11-29) and 2026-12-06 (2026-11-30 to 2026-12-04) are on record and not applied, and the one reported on 2026-12-06 (2026-11-30 to 2026-12-04, episodeId R7D-F24-s2) does not say how it relates to the earlier: report it again with an episodeId, the earlier break's if it corrects that break, or its own if it is a separate break. No break is replaced or joined to another on its own and the earlier facts need not be stated again; until then no return dose is chosen and the plan is not valid
- Record: break declared 2026-12-01T12:00:00.000Z with a UNAVAILABLE_DAY report (R7D-F24-s1), not applied yet: `{"startDate":"2026-11-23","endDate":"2026-11-29","reasonCategory":"WORK","reason":"conference week, no training","nonclinical":true}`
- Record: break declared 2026-12-07T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-F24-s2), not applied yet: `{"startDate":"2026-11-30","endDate":"2026-12-04","reasonCategory":"FAMILY","reason":"helping my parents move house","nonclinical":true}`
- Current week 3 (BUILD) from 2026-12-06: d6 2026-12-06  RUN LONG 65min (LONG)
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-07  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; push-up 1x14 RIR3 BW; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2026-12-08  RUN EASY 45min (EASY +strides) | d3 2026-12-10  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d4 2026-12-11  STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; push-up 1x14 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d6 2026-12-13  RUN LONG 60min (LONG)

### s3 · 2026-12-07T07:00:00-05:00 · RETURN_AFTER_PAUSE (week 4)

- Athlete: 1 report(s): w3-run-d6 not done · break `{"startDate":"2026-11-30","endDate":"2026-12-04","reasonCategory":"FAMILY","reason":"helping my parents move house","nonclinical":true,"episodeId":"R7D-F24-s2"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-11-23 to 2026-11-29; 2026-11-30 to 2026-12-04), each its own interruption; the stop read runs from 2026-11-23 to 2026-12-04 with no training recorded between them: moderate nonclinical interruption (12 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 4 (CONSOLIDATION) from 2026-12-07: d0 2026-12-07  STRENGTH_FULL_A 19min: goblet-squat 1x8 RIR4 establish; push-up 1x8 RIR4 BW; db-row 1x8 RIR4 establish; db-calf-raise 1x10 RIR4 establish; dead-bug 1x10 RIR4 BW | d1 2026-12-08  RUN EASY 15min (EASY) | d3 2026-12-10  RUN EASY 15min (EASY) | d4 2026-12-11  STRENGTH_FULL_B 19min: db-rdl 1x8 RIR4 establish; db-row 1x8 RIR4 establish; push-up 1x8 RIR4 BW; db-split-squat 1x10 RIR4 establish; dead-bug 1x10 RIR4 BW | d6 2026-12-13  RUN LONG 20min (LONG)
- Next week 5 (BUILD, provisional): d0 2026-12-14  STRENGTH_FULL_A 19min: goblet-squat 1x8 RIR3 last logged; push-up 1x8 RIR3 BW; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d1 2026-12-15  RUN EASY 30min (EASY) | d3 2026-12-17  RUN EASY 30min (EASY) | d4 2026-12-18  STRENGTH_FULL_B 19min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; push-up 1x8 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-20  RUN LONG 45min (LONG)

### s4 · 2026-12-13T20:00:00-05:00 · WEEKLY_REVIEW (week 4)

- Athlete: 5 report(s): w4-run-d1 done 15min; w4-run-d3 done 15min; w4-run-d6 done 20min; w4-str-d0 done 19min 5 exercises; w4-str-d4 done 19min 5 exercises
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"EASY":"ADVANCE","goblet-squat":"ADVANCE","push-up":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 4 (CONSOLIDATION) from 2026-12-13: d6 2026-12-13  RUN LONG 20min (LONG)
- Next week 5 (BUILD, provisional): d0 2026-12-14  STRENGTH_FULL_A 19min: goblet-squat 1x8 RIR4 establish; push-up 1x8 RIR3 BW; db-row 1x8 RIR4 establish; db-calf-raise 1x10 RIR4 establish; dead-bug 1x10 RIR3 BW | d1 2026-12-15  RUN EASY 30min (EASY) | d3 2026-12-17  RUN EASY 30min (EASY) | d4 2026-12-18  STRENGTH_FULL_B 19min: db-rdl 1x8 RIR4 establish; db-row 1x8 RIR4 establish; push-up 1x8 RIR3 BW; db-split-squat 1x10 RIR4 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-20  RUN LONG 45min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f24-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f24-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f24-e3 @s2 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"INTERRUPTION_RELATION"`
- f24-e4 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f24-e5 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f24-e6 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Two separate breaks that touch form one continuous stop from 2026-11-23 to 2026-12-04 (12 days); the return is dosed for that stop, clearly more conservative than for the five-day later break alone.
- f24-e7 @s3 ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["10:6:RACE"]`
- f24-e8 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`

**Independent assessment (author, written before any output).**
- Rationale: Mateo was away a full week at a conference and then five more days helping his parents. Each break alone is short; back to back they are almost two weeks without running before a 10K build continues.
- Preferred: Keep the conference break, ask how the second break relates, and once he says it is separate, plan the return for the continuous 12-day stop, then rebuild toward the race.
- Acceptable alternatives: A return of one to two weeks at reduced volume. / Lowering the 10K time goal expectation in the explanation.
- Concerns: Planning the return from the five-day break alone. / Adding up the days of both breaks beyond the actual stop. / Asking him to restate the conference break.
- Domain notes: Break A 2026-11-23 to 2026-11-29 (week 2); break B 2026-11-30 to 2026-12-04 (week 3 days 0 to 4). The answer step names B by its own identity R7D-F24-s2.

## R7D-F25

**Intent.** A novice states a ski trip together with a local fatigue report, then a review states overlapping trip dates; asked, she says the newer dates correct the first ones. Probes correction of a kept break and training done after the corrected stop.

**Tags.** FATIGUE_LOCAL, CORRECTION, RETURN_SHORT, SHORTENED_RUNS, BALANCED_HYBRID, NON_RACE, H16, RUN_EXP_NOVICE, STR_EXP_NOVICE, KETTLEBELL, TIMEZONE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":16,"asOf":"2026-12-26","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":60,"longestRunMinutes":35,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,5],"strengthDays":[1,3],"runMinutes":35,"strengthMinutes":35,"longRunDay":5,"longRunMinutes":50}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-28  RUN EASY 15min (EASY) | d1 2026-12-29  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-12-30  RUN EASY 15min (EASY) | d3 2026-12-31  STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-02  RUN LONG 20min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-01-04  RUN EASY 15min (EASY) | d1 2027-01-05  STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-01-06  RUN EASY 15min (EASY) | d3 2027-01-07  STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-09  RUN LONG 20min (LONG)

### s1 · 2027-01-20T08:00:00+01:00 · LOCAL_FATIGUE (week 3)

- Athlete: 11 report(s): w0-run-d0 done 15min; w0-run-d2 done 15min; w0-run-d5 done 20min; w1-run-d0 done 15min; w1-run-d2 done 15min; w1-run-d5 done 20min; w0-str-d1 done 15min 5 exercises; w0-str-d3 done 27min 5 exercises; w1-str-d1 done 27min 5 exercises; w1-str-d3 done 27min 5 exercises; w2-run-d0 done 15min · break `{"startDate":"2027-01-12","endDate":"2027-01-16","reasonCategory":"VACATION","reason":"ski trip","nonclinical":true}` · signals `{"region":"LOWER"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2027-01-20 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the local fatigue is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2027-01-20T07:00:00.000Z with a LOCAL_FATIGUE report (R7D-F25-s1), not applied yet: `{"startDate":"2027-01-12","endDate":"2027-01-16","reasonCategory":"VACATION","reason":"ski trip","nonclinical":true}`
- Current week 3 (DEVELOPMENT) from 2027-01-20: d2 2027-01-20  RUN EASY 15min (EASY) | d3 2027-01-21  STRENGTH_FULL_B 28min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-23  RUN LONG 20min (LONG)
- Next week 4 (CONSOLIDATION, provisional): d0 2027-01-25  RUN EASY 20min (EASY +strides) | d1 2027-01-26  STRENGTH_FULL_A 20min: kb-goblet-squat 1x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW; kb-row 1x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-27  RUN EASY 15min (EASY) | d3 2027-01-28  STRENGTH_FULL_B 20min: kb-deadlift 1x8 RIR3 last logged; kb-row 1x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-30  RUN LONG 15min (LONG)

### s2 · 2027-01-24T20:00:00+01:00 · WEEKLY_REVIEW (week 3)

- Athlete: 3 report(s): w3-run-d2 done 11min (recovery=COMPATIBLE); w3-str-d3 done 28min 5 exercises; w3-run-d5 done 20min · break `{"startDate":"2027-01-14","endDate":"2027-01-19","reasonCategory":"VACATION","reason":"ski trip, the real dates","nonclinical":true}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question INTERRUPTION_RELATION (0 sessions, from week undefined)
- Reason: Breaks in training reported on 2027-01-20 (2027-01-12 to 2027-01-16) and 2027-01-24 (2027-01-14 to 2027-01-19) are on record and not applied, and the one reported on 2027-01-24 (2027-01-14 to 2027-01-19, episodeId R7D-F25-s2) does not say how it relates to the earlier: report it again with an episodeId, the earlier break's if it corrects that break, or its own if it is a separate break. No break is replaced or joined to another on its own and the earlier facts need not be stated again; until then no return dose is chosen and the plan is not valid
- Record: break declared 2027-01-20T07:00:00.000Z with a LOCAL_FATIGUE report (R7D-F25-s1), not applied yet: `{"startDate":"2027-01-12","endDate":"2027-01-16","reasonCategory":"VACATION","reason":"ski trip","nonclinical":true}`
- Record: break declared 2027-01-24T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-F25-s2), not applied yet: `{"startDate":"2027-01-14","endDate":"2027-01-19","reasonCategory":"VACATION","reason":"ski trip, the real dates","nonclinical":true}`
- Current week 3 (DEVELOPMENT) from 2027-01-24: —
- Next week 4 (CONSOLIDATION, provisional): d0 2027-01-25  RUN EASY 20min (EASY +strides) | d1 2027-01-26  STRENGTH_FULL_A 20min: kb-goblet-squat 1x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW; kb-row 1x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-27  RUN EASY 15min (EASY) | d3 2027-01-28  STRENGTH_FULL_B 20min: kb-deadlift 1x8 RIR3 last logged; kb-row 1x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-30  RUN LONG 15min (LONG)

### s3 · 2027-01-25T07:30:00+01:00 · RETURN_AFTER_PAUSE (week 4)

- Athlete: 2 report(s): w2-str-d1 not done; w2-run-d2 not done · break `{"startDate":"2027-01-14","endDate":"2027-01-19","reasonCategory":"VACATION","reason":"ski trip, the real dates","nonclinical":true,"episodeId":"R7D-F25-s1"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: short nonclinical interruption (6 days): resume the last completed doses; no step until execution is observed
- Current week 4 (CONSOLIDATION) from 2027-01-25: d0 2027-01-25  RUN EASY 15min (EASY) | d1 2027-01-26  STRENGTH_FULL_A 19min: kb-goblet-squat 1x8 RIR3 establish; incline-push-up 1x8 RIR3 BW; kb-row 1x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-01-27  RUN EASY 15min (EASY) | d3 2027-01-28  STRENGTH_FULL_B 19min: kb-deadlift 1x8 RIR3 establish; kb-row 1x8 RIR3 establish; incline-push-up 1x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-30  RUN LONG 15min (LONG)
- Next week 5 (DEVELOPMENT, provisional): d0 2027-02-01  RUN EASY 15min (EASY +strides) | d1 2027-02-02  STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-02-03  RUN EASY 15min (EASY) | d3 2027-02-04  STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-02-06  RUN LONG 20min (LONG)

### s4 · 2027-01-31T20:00:00+01:00 · WEEKLY_REVIEW (week 4)

- Athlete: 5 report(s): w4-run-d0 done 15min; w4-run-d2 done 15min; w4-run-d5 done 15min; w4-str-d1 done 19min 5 exercises; w4-str-d3 done 19min 5 exercises
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · offers LADDER_STEP,LADDER_STEP,LADDER_STEP · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","kb-goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","kb-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","kb-deadlift":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 4 (CONSOLIDATION) from 2027-01-31: —
- Next week 5 (DEVELOPMENT, provisional): d0 2027-02-01  RUN EASY 15min (EASY +strides) | d1 2027-02-02  STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-02-03  RUN EASY 15min (EASY) | d3 2027-02-04  STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-02-06  RUN LONG 20min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f25-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f25-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f25-e3 @s2 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"INTERRUPTION_RELATION"`
- f25-e4 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f25-e5 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f25-e6 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The corrected break (2027-01-14 to 2027-01-19) replaces the first facts; the stop is not lengthened by the superseded dates; the runs and strength done after the trip count as executed training for the return.
- f25-e7 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`

**Independent assessment (author, written before any output).**
- Rationale: Lea first gave rough trip dates, then the real ones, overlapping. She says the second is the same trip corrected. After the trip she already ran and lifted a little.
- Preferred: Keep the first statement, ask the relation, then read only the corrected dates: a six-day stop for a novice, a short return that takes into account the shortened run and the sessions done since.
- Acceptable alternatives: Asking how the local fatigue is now before progressing. / Repeating the last pre-break week.
- Concerns: Joining the two date ranges into one longer stop. / Treating the corrected break as a second break. / Ignoring the sessions done after the trip.
- Domain notes: First statement 2027-01-12 to 2027-01-16; corrected 2027-01-14 to 2027-01-19. The answer names the first break by R7D-F25-s1. The local fatigue was not re-sent after the return (it had resolved).

## R7D-F26

**Intent.** A three-day work break stated with a schedule change, then a later travel break with four days between them; asked, the athlete says they are separate; the planned sessions between were never reported until the coach asks, and none was done.

**Tags.** SCHEDULE_CHANGE, TRAVEL, RETURN_MODERATE, BALANCED_HYBRID, NON_RACE, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, START_NON_MONDAY, TIMEZONE, PARTIAL_ANSWER · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-07","weeks":12,"asOf":"2027-01-05","tz":120,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":160,"longestRunMinutes":75,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[1,5],"runMinutes":50,"strengthMinutes":45,"longRunDay":2,"longRunMinutes":85}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-07  RUN EASY 45min (EASY) | d1 2027-01-08  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-09  RUN LONG 70min (LONG) | d4 2027-01-11  RUN EASY 45min (EASY) | d5 2027-01-12  STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-14  RUN EASY 45min (EASY) | d1 2027-01-15  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-16  RUN LONG 70min (LONG) | d4 2027-01-18  RUN EASY 45min (EASY) | d5 2027-01-19  STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW

### s1 · 2027-01-24T09:00:00+02:00 · SCHEDULE_CHANGE (week 2)

- Athlete: 10 report(s): w0-run-d0 done 45min; w0-run-d2 done 70min; w0-run-d4 done 45min; w1-run-d0 done 45min; w1-run-d2 done 70min; w1-run-d4 done 45min; w0-str-d1 done 28min 5 exercises; w0-str-d5 done 28min 5 exercises; w1-str-d1 done 28min 5 exercises; w1-str-d5 done 28min 5 exercises · changes `{"runTurn":"PM"}` · break `{"startDate":"2027-01-21","endDate":"2027-01-23","reasonCategory":"WORK","reason":"inventory at work","nonclinical":true}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2027-01-24 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the schedule change is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2027-01-24T07:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F26-s1), not applied yet: `{"startDate":"2027-01-21","endDate":"2027-01-23","reasonCategory":"WORK","reason":"inventory at work","nonclinical":true}`
- Current week 2 (DEVELOPMENT) from 2027-01-24: d4 2027-01-25  RUN EASY 45min (EASY) | d5 2027-01-26  STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW
- Next week 3 (DEVELOPMENT, provisional): d0 2027-01-28  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2027-01-29  STRENGTH_FULL_A 29min: goblet-squat 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d2 2027-01-30  RUN LONG 70min (LONG) | d4 2027-02-01  RUN EASY 50min (EASY +strides) | d5 2027-02-02  STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW

### s2 · 2027-02-03T20:00:00+02:00 · WEEKLY_REVIEW (week 3)

- Athlete: no reports · break `{"startDate":"2027-01-29","endDate":"2027-02-02","reasonCategory":"TRAVEL","reason":"ferry trip to the islands","nonclinical":true}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question INTERRUPTION_RELATION (0 sessions, from week undefined)
- Reason: Breaks in training reported on 2027-01-24 (2027-01-21 to 2027-01-23) and 2027-02-03 (2027-01-29 to 2027-02-02) are on record and not applied, and the one reported on 2027-02-03 (2027-01-29 to 2027-02-02, episodeId R7D-F26-s2) does not say how it relates to the earlier: report it again with an episodeId, the earlier break's if it corrects that break, or its own if it is a separate break. No break is replaced or joined to another on its own and the earlier facts need not be stated again; until then no return dose is chosen and the plan is not valid
- Record: break declared 2027-01-24T07:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F26-s1), not applied yet: `{"startDate":"2027-01-21","endDate":"2027-01-23","reasonCategory":"WORK","reason":"inventory at work","nonclinical":true}`
- Record: break declared 2027-02-03T18:00:00.000Z with a WEEKLY_REVIEW report (R7D-F26-s2), not applied yet: `{"startDate":"2027-01-29","endDate":"2027-02-02","reasonCategory":"TRAVEL","reason":"ferry trip to the islands","nonclinical":true}`
- Current week 3 (DEVELOPMENT) from 2027-02-03: —
- Next week 4 (CONSOLIDATION, provisional): d0 2027-02-04  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2027-02-05  STRENGTH_FULL_A 21min: goblet-squat 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d2 2027-02-06  RUN LONG 65min (LONG) | d4 2027-02-08  RUN EASY 50min (EASY +strides) | d5 2027-02-09  STRENGTH_FULL_B 20min: db-rdl 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW

### s3 · 2027-02-04T07:00:00+02:00 · RETURN_AFTER_PAUSE (week 4)

- Athlete: no reports · break `{"startDate":"2027-01-29","endDate":"2027-02-02","reasonCategory":"TRAVEL","reason":"ferry trip to the islands","nonclinical":true,"episodeId":"islands-trip"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question TRAINING_BETWEEN_BREAKS (3 sessions, from week undefined)
- Reason: The breaks reported on 2027-01-24 (2027-01-21 to 2027-01-23) and on 2027-02-03 (2027-01-29 to 2027-02-02) are separate, and 3 planned sessions between them (2027-01-24 to 2027-01-28) have no report: say what was done (report the sessions, done or not done); training that is only unreported counts neither as done nor as not done, and the return depends on it
- Record: break declared 2027-01-24T07:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F26-s1), not applied yet: `{"startDate":"2027-01-21","endDate":"2027-01-23","reasonCategory":"WORK","reason":"inventory at work","nonclinical":true}`
- Record: break declared 2027-02-03T18:00:00.000Z with a WEEKLY_REVIEW report (R7D-F26-s2), not applied yet: `{"startDate":"2027-01-29","endDate":"2027-02-02","reasonCategory":"TRAVEL","reason":"ferry trip to the islands","nonclinical":true}`
- Record: break declared 2027-02-04T05:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-F26-s3), not applied yet: `{"startDate":"2027-01-29","endDate":"2027-02-02","reasonCategory":"TRAVEL","reason":"ferry trip to the islands","nonclinical":true,"episodeId":"islands-trip"}`
- Current week 4 (CONSOLIDATION) from 2027-02-04: d0 2027-02-04  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2027-02-05  STRENGTH_FULL_A 21min: goblet-squat 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d2 2027-02-06  RUN LONG 65min (LONG) | d4 2027-02-08  RUN EASY 50min (EASY +strides) | d5 2027-02-09  STRENGTH_FULL_B 20min: db-rdl 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW
- Next week 5 (DEVELOPMENT, provisional): d0 2027-02-11  RUN QUALITY 41min (THRESHOLD 4x5'/2') | d1 2027-02-12  STRENGTH_FULL_A 41min: goblet-squat 3x10 RIR3 last logged; db-bench-press 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; standing-calf-raise 2x16 RIR3 BW; dead-bug 2x16 RIR3 BW | d2 2027-02-13  RUN LONG 70min (LONG) | d4 2027-02-15  RUN EASY 50min (EASY +strides) | d5 2027-02-16  STRENGTH_FULL_B 41min: db-rdl 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; db-bench-press 3x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged; dead-bug 2x16 RIR3 BW

### s4 · 2027-02-04T12:00:00+02:00 · RETURN_AFTER_PAUSE (week 4)

- Athlete: 3 report(s): w2-run-d4 not done; w2-str-d5 not done; w3-run-d0 not done
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2027-01-21 to 2027-01-23; 2027-01-29 to 2027-02-02), each its own interruption; the stop read runs from 2027-01-21 to 2027-02-02 with no training recorded between them: moderate nonclinical interruption (13 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 4 (CONSOLIDATION) from 2027-02-04: d0 2027-02-04  RUN EASY 15min (EASY) | d1 2027-02-05  STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR4 establish; db-bench-press 1x10 RIR4 establish; db-row 1x10 RIR4 establish; standing-calf-raise 1x12 RIR4 BW; dead-bug 1x12 RIR4 BW | d2 2027-02-06  RUN LONG 20min (LONG) | d4 2027-02-08  RUN EASY 15min (EASY) | d5 2027-02-09  STRENGTH_FULL_B 20min: db-rdl 1x10 RIR4 establish; db-row 1x10 RIR4 establish; db-bench-press 1x10 RIR4 establish; db-split-squat 1x12 RIR4 establish; dead-bug 1x12 RIR4 BW
- Next week 5 (DEVELOPMENT, provisional): d0 2027-02-11  RUN EASY 30min (EASY) | d1 2027-02-12  STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-02-13  RUN LONG 45min (LONG) | d4 2027-02-15  RUN EASY 30min (EASY) | d5 2027-02-16  STRENGTH_FULL_B 20min: db-rdl 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f26-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f26-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f26-e3 @s2 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"INTERRUPTION_RELATION"`
- f26-e4 @s3 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"TRAINING_BETWEEN_BREAKS"`
- f26-e5 @s3 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f26-e6 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f26-e7 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- f26-e8 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — With every planned session between them reported not done, the stop runs from 2027-01-21 to 2027-02-02 (13 days) and the return is dosed for that stop.

**Independent assessment (author, written before any output).**
- Rationale: Nikos had an inventory weekend, four ordinary days in which he did nothing, then a ferry trip. Without knowing about the days between, the coach cannot tell whether he trained; asking is right. Since nothing was done, the stop is effectively continuous.
- Preferred: Keep the first break, ask the relation, ask about the sessions between, then plan a return for the whole 13-day stop.
- Acceptable alternatives: Treating the stop as two shorter breaks only if training had been reported between them (it was not).
- Concerns: Assuming the unreported sessions were done. / Assuming they were not done without asking. / Planning the return from the later five-day break alone.
- Domain notes: Day 0 is Thursday (offset +02:00). Break A 2027-01-21 to 2027-01-23; sessions between on 2027-01-25, 2027-01-26 and 2027-01-28; break B 2027-01-29 to 2027-02-02.

## R7D-F27

**Intent.** Half-marathon build for an intermediate runner with a shortened, harder-than-planned run in the taper week, then the race and the plan after it. Probes that a taper response adds nothing and keeps the race, and that the week after a half marathon is recovery.

**Tags.** COLD_START, RUN_FIRST, RACE_HALF, H8, TAPER, TAPER_ANSWER, RACE_WEEK, POST_RACE, SHORTENED_RUNS, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, LATE_REPORTER, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2027-03-01","weeks":8,"asOf":"2027-02-27","tz":-180,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-18","timeGoalMinutes":120}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-04-18","timeGoalMinutes":120},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":220,"longestRunMinutes":110,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4,6],"strengthDays":[1,3],"runMinutes":50,"strengthMinutes":30,"longRunDay":6,"longRunMinutes":130}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2027-03-01  RUN EASY 40min (EASY) | d1 2027-03-02  STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d2 2027-03-03  RUN EASY 40min (EASY) | d3 2027-03-04  STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW | d4 2027-03-05  RUN EASY 40min (EASY) | d6 2027-03-07  RUN LONG 95min (LONG)
- Week 1 (BUILD): d0 2027-03-08  RUN EASY 40min (EASY) | d1 2027-03-09  STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged | d2 2027-03-10  RUN EASY 40min (EASY) | d3 2027-03-11  STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW | d4 2027-03-12  RUN EASY 40min (EASY) | d6 2027-03-14  RUN LONG 95min (LONG)
- Week 5 (TAPER): d0 2027-04-05  RUN EASY 30min (EASY +strides) | d1 2027-04-06  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW; db-row 1x8 RIR3 last logged | d2 2027-04-07  RUN EASY 30min (EASY +strides) | d3 2027-04-08  STRENGTH_FULL_B 16min: glute-bridge 1x10 RIR3 BW; db-row 1x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW | d4 2027-04-09  RUN QUALITY 27min (THRESHOLD 2x5'/2') | d6 2027-04-11  RUN LONG 50min (LONG)
- Week 6 (RACE_WEEK): d0 2027-04-12  RUN EASY 25min (EASY) | d1 2027-04-13  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; incline-push-up 1x10 RIR4 BW; db-row 1x8 RIR4 last logged | d2 2027-04-14  RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d3 STRENGTH REST_BY_DESIGN | d4 2027-04-16  RUN EASY 25min (EASY) | d6 2027-04-18  RUN RACE 150min (RACE)

### s1 · 2027-04-04T21:00:00-03:00 · WEEKLY_REVIEW (week 4)

- Athlete: 24 report(s): w1-run-d0 done 40min; w1-run-d2 done 40min; w1-run-d4 done 40min; w1-run-d6 done 95min; w2-run-d0 done 40min; w2-run-d2 done 40min; w2-run-d4 done 40min; w2-run-d6 done 95min; w3-run-d0 done 45min; w3-run-d2 done 40min; w3-run-d4 done 34min; w3-run-d6 done 95min; w4-run-d0 done 45min; w4-run-d2 done 40min; w4-run-d4 done 41min; w4-run-d6 done 100min; w1-str-d1 done 24min 3 exercises; w1-str-d3 done 24min 3 exercises; w2-str-d1 done 24min 3 exercises; w2-str-d3 done 24min 3 exercises; w3-str-d1 done 24min 3 exercises; w3-str-d3 done 24min 3 exercises; w4-str-d1 done 24min 3 exercises; w4-str-d3 done 24min 3 exercises
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","db-row":"ADVANCE","glute-bridge":"ADVANCE"}`
- Current week 4 (SPECIFIC) from 2027-04-04: d6 2027-04-04  RUN LONG 100min (LONG)
- Next week 5 (TAPER, provisional): d0 2027-04-05  RUN EASY 30min (EASY +strides) | d1 2027-04-06  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR3 establish; incline-push-up 1x8 RIR3 BW; db-row 1x8 RIR3 establish | d2 2027-04-07  RUN EASY 30min (EASY +strides) | d3 2027-04-08  STRENGTH_FULL_B 16min: glute-bridge 1x8 RIR3 BW; db-row 1x8 RIR3 establish; incline-push-up 1x8 RIR3 BW | d4 2027-04-09  RUN QUALITY 27min (THRESHOLD 2x5'/2') | d6 2027-04-11  RUN LONG 50min (LONG)

### s2 · 2027-04-08T07:00:00-03:00 · UNDERPERFORMANCE (week 5)

- Athlete: 1 report(s): w5-run-d2 done 21min (performance=UNDER,recovery=COMPATIBLE,effort=HARDER,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: One adverse execution is a signal, not a trend; keep the plan and compare the next execution
- Current week 5 (TAPER) from 2027-04-08: d3 2027-04-08  STRENGTH_FULL_B 16min: glute-bridge 1x8 RIR3 BW; db-row 1x8 RIR3 establish; incline-push-up 1x8 RIR3 BW | d4 2027-04-09  RUN QUALITY 27min (THRESHOLD 2x5'/2') | d6 2027-04-11  RUN LONG 50min (LONG)
- Next week 6 (RACE_WEEK, provisional): d0 2027-04-12  RUN EASY 25min (EASY) | d1 2027-04-13  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; incline-push-up 1x8 RIR4 BW; db-row 1x8 RIR4 last logged | d2 2027-04-14  RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d3 STRENGTH REST_BY_DESIGN | d4 2027-04-16  RUN EASY 25min (EASY) | d6 2027-04-18  RUN RACE 150min (RACE)

### s3 · 2027-04-18T21:00:00-03:00 · WEEKLY_REVIEW (week 6)

- Athlete: 5 report(s): w6-run-d0 done 25min; w6-run-d2 done 28min; w6-run-d4 done 25min; w6-race done 127min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET); w6-str-d1 done 16min 3 exercises
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","db-row":"ADVANCE"}`
- Current week 6 (RACE_WEEK) from 2027-04-18: d6 2027-04-18  RUN RACE 150min (RACE)
- Next week 7 (POST_EVENT, provisional): d0 RUN REST_BY_DESIGN | d1 2027-04-20  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 establish; incline-push-up 1x8 RIR4 BW; db-row 1x8 RIR4 establish | d2 2027-04-21  RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 STRENGTH REST_BY_DESIGN | d4 2027-04-23  RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 2027-04-25  RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f27-e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- f27-e2 @GENERATE ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["6:6:RACE"]`
- f27-e3 @GENERATE PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"RACE_WEEK"`
- f27-e4 @GENERATE ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":50,"otherWeek":95}`
- f27-e5 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- f27-e6 @s2 ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["6:6:RACE"]`
- f27-e7 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — A single hard, shortened taper run adds no make-up load and no extra quality; the remaining taper is kept or eased.
- f27-e8 @s3 PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"POST_EVENT"`
- f27-e9 @s3 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`

**Independent assessment (author, written before any output).**
- Rationale: Camila ran 2:05 and aims at 2:00. Her build was synced late but complete. One humid taper session felt hard; that is not a reason to add or to change the race.
- Preferred: Keep the taper, perhaps easing the next session, keep the race, then plan an easy recovery week without quality or a long run.
- Acceptable alternatives: Asking how she slept or felt (nonclinical) before the race touch. / A post-race week of short easy runs and light strength.
- Concerns: Adding a session to make up for the cut run. / Removing the race touch or the race. / A long run or intervals in the week after the race.
- Domain notes: Offset -03:00. Race 2027-04-18 is week 6 day 6. Week 0 never reported (no month-long silence).

## R7D-F28

**Intent.** Two weeks of holiday, one run, then a short trip: the single run must not end a three-week stop. After the return, the trip is corrected by name to start later, which uncovers sessions between the breaks that were never reported.

**Tags.** RETURN_MODERATE, TRAVEL, SCHEDULE_CHANGE, CORRECTION, SHORTENED_RUNS, LATE_REPORTER, BALANCED_HYBRID, NON_RACE, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":12,"asOf":"2026-12-05","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":75,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4,6],"strengthDays":[0,3],"runMinutes":45,"strengthMinutes":45,"longRunDay":6,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-07  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-08  RUN EASY 40min (EASY) | d3 2026-12-10  STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2026-12-11  RUN EASY 40min (EASY) | d6 2026-12-13  RUN LONG 65min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-12-14  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-15  RUN EASY 40min (EASY) | d3 2026-12-17  STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2026-12-18  RUN EASY 40min (EASY) | d6 2026-12-20  RUN LONG 65min (LONG)

### s1 · 2027-01-04T08:00:00+00:00 · SCHEDULE_CHANGE (week 4)

- Athlete: 10 report(s): w0-run-d1 done 40min; w0-run-d4 done 40min; w0-run-d6 done 65min; w1-run-d1 done 40min; w1-run-d4 done 40min; w1-run-d6 done 65min; w0-str-d0 done 28min 5 exercises; w0-str-d3 done 28min 5 exercises; w1-str-d0 done 28min 5 exercises; w1-str-d3 done 28min 5 exercises · changes `{"runTurn":"PM"}` · break `{"startDate":"2026-12-21","endDate":"2027-01-03","reasonCategory":"VACATION","reason":"two-week holiday","nonclinical":true,"episodeId":"hol-dec"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2027-01-04 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the schedule change is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2027-01-04T08:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F28-s1), not applied yet: `{"startDate":"2026-12-21","endDate":"2027-01-03","reasonCategory":"VACATION","reason":"two-week holiday","nonclinical":true,"episodeId":"hol-dec"}`
- Current week 4 (CONSOLIDATION) from 2027-01-04: d0 2027-01-04  STRENGTH_FULL_A 21min: goblet-squat 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2027-01-05  RUN EASY 45min (EASY +strides) | d3 2027-01-07  STRENGTH_FULL_B 20min: db-rdl 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d4 2027-01-08  RUN EASY 40min (EASY) | d6 2027-01-10  RUN LONG 55min (LONG)
- Next week 5 (DEVELOPMENT, provisional): d0 2027-01-11  STRENGTH_FULL_A 41min: goblet-squat 3x10 RIR3 last logged; db-bench-press 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; standing-calf-raise 2x16 RIR3 BW; dead-bug 2x16 RIR3 BW | d1 2027-01-12  RUN EASY 45min (EASY +strides) | d3 2027-01-14  STRENGTH_FULL_B 41min: db-rdl 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; db-bench-press 3x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged; dead-bug 2x16 RIR3 BW | d4 2027-01-15  RUN EASY 40min (EASY) | d6 2027-01-17  RUN LONG 65min (LONG)

### s2 · 2027-01-10T21:00:00+00:00 · WEEKLY_REVIEW (week 4)

- Athlete: 2 report(s): w4-str-d0 not done; w4-run-d1 done 45min · break `{"startDate":"2027-01-07","endDate":"2027-01-10","reasonCategory":"TRAVEL","reason":"short work trip","nonclinical":true,"episodeId":"trip-jan"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-21 to 2027-01-03; 2027-01-07 to 2027-01-10), each its own interruption; the stop read runs from 2026-12-21 to 2027-01-10 through the training recorded between them, which completed no whole week of the plan (no re-entry): moderate nonclinical interruption (21 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 4 (CONSOLIDATION) from 2027-01-10: d6 RUN REST_BY_DESIGN
- Next week 5 (DEVELOPMENT, provisional): d0 2027-01-11  STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR4 establish; db-bench-press 1x10 RIR4 establish; db-row 1x10 RIR4 establish; standing-calf-raise 1x12 RIR4 BW; dead-bug 1x12 RIR4 BW | d1 2027-01-12  RUN EASY 15min (EASY) | d3 2027-01-14  STRENGTH_FULL_B 20min: db-rdl 1x10 RIR4 establish; db-row 1x10 RIR4 establish; db-bench-press 1x10 RIR4 establish; db-split-squat 1x12 RIR4 establish; dead-bug 1x12 RIR4 BW | d4 2027-01-15  RUN EASY 15min (EASY) | d6 2027-01-17  RUN LONG 20min (LONG)

### s3 · 2027-01-13T08:00:00+00:00 · RETURN_AFTER_PAUSE (week 5)

- Athlete: 2 report(s): w5-str-d0 done 20min 5 exercises; w5-run-d1 done 15min · break `{"startDate":"2027-01-09","endDate":"2027-01-10","reasonCategory":"TRAVEL","reason":"short work trip; I only left on Saturday","nonclinical":true,"episodeId":"trip-jan"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question TRAINING_BETWEEN_BREAKS (2 sessions, from week undefined)
- Reason: The breaks reported on 2027-01-04 (2026-12-21 to 2027-01-03) and on 2027-01-10 (2027-01-09 to 2027-01-10) are separate, and 2 planned sessions between them (2027-01-04 to 2027-01-08) have no report: say what was done (report the sessions, done or not done); training that is only unreported counts neither as done nor as not done, and the return depends on it
- Record: break declared 2027-01-13T08:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-F28-s3), not applied yet: `{"startDate":"2027-01-09","endDate":"2027-01-10","reasonCategory":"TRAVEL","reason":"short work trip; I only left on Saturday","nonclinical":true,"episodeId":"trip-jan"}`
- Current week 5 (DEVELOPMENT) from 2027-01-13: d3 2027-01-14  STRENGTH_FULL_B 20min: db-rdl 1x10 RIR4 establish; db-row 1x10 RIR4 establish; db-bench-press 1x10 RIR4 establish; db-split-squat 1x12 RIR4 establish; dead-bug 1x12 RIR4 BW | d4 2027-01-15  RUN EASY 15min (EASY) | d6 2027-01-17  RUN LONG 20min (LONG)
- Next week 6 (DEVELOPMENT, provisional): d0 2027-01-18  STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2027-01-19  RUN EASY 30min (EASY) | d3 2027-01-21  STRENGTH_FULL_B 20min: db-rdl 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2027-01-22  RUN EASY 30min (EASY) | d6 2027-01-24  RUN LONG 45min (LONG)

### s4 · 2027-01-17T21:00:00+00:00 · WEEKLY_REVIEW (week 5)

- Athlete: 5 report(s): w4-str-d3 not done; w4-run-d4 done 24min; w5-str-d3 done 20min 5 exercises; w5-run-d4 done 15min; w5-run-d6 done 20min
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-21 to 2027-01-03; 2027-01-09 to 2027-01-10), each its own interruption; the stop read runs from 2026-12-21 to 2027-01-10 through the training recorded between them, which completed no whole week of the plan (no re-entry) (read again with this newer report of the interruption): moderate nonclinical interruption (21 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 5 (DEVELOPMENT) from 2027-01-17: d6 2027-01-17  RUN LONG 20min (LONG)
- Next week 6 (DEVELOPMENT, provisional): d0 2027-01-18  STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR4 establish; db-bench-press 1x10 RIR4 establish; db-row 1x10 RIR4 establish; standing-calf-raise 1x12 RIR4 BW; dead-bug 1x12 RIR4 BW | d1 2027-01-19  RUN EASY 15min (EASY) | d3 2027-01-21  STRENGTH_FULL_B 20min: db-rdl 1x10 RIR4 establish; db-row 1x10 RIR4 establish; db-bench-press 1x10 RIR4 establish; db-split-squat 1x12 RIR4 establish; dead-bug 1x12 RIR4 BW | d4 2027-01-22  RUN EASY 15min (EASY) | d6 2027-01-24  RUN LONG 20min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f28-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f28-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f28-e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f28-e4 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — One run between the holiday and the trip, with the strength session missed, does not end the stop: the return is read through the holiday, from 2026-12-21 to 2027-01-10 (21 days), and is dosed as such; the single run is not proof of restored capacity.
- f28-e5 @s2 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- f28-e6 @s3 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"TRAINING_BETWEEN_BREAKS"`
- f28-e7 @s3 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f28-e8 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f28-e9 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- f28-e10 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The run of 2027-01-05 and the shortened run of 2027-01-08 remain isolated training: no whole week was executed, so the stop is still read through the holiday and nothing is presented as restored fitness.

**Independent assessment (author, written before any output).**
- Rationale: Ollie had two weeks off, ran once, then went on a short trip. One run does not undo two weeks off. When he later says he left on Saturday, two sessions appear between the breaks that he never reported.
- Preferred: Keep the holiday, apply both breaks at the review as one stop through the holiday with a moderate return; on the corrected trip ask about the uncovered sessions; with one partial run and a missed lift, keep the same conservative reading.
- Acceptable alternatives: A return of two weeks at reduced volume. / Asking whether the partial run was cut for a nonclinical reason.
- Concerns: Treating the single run as a re-entry and returning from the short trip alone. / Ignoring the uncovered sessions or guessing them. / Adding up days beyond the actual stop.
- Domain notes: Holiday 2026-12-21 to 2027-01-03; run 2027-01-05; trip first 2027-01-07 to 2027-01-10, corrected to 2027-01-09 to 2027-01-10. Uncovered: strength 2027-01-07, run 2027-01-08.

## R7D-F29

**Intent.** Between a work break and a family trip the athlete executes one whole plan week in both sports, every session as prescribed; the trip states a start time on the day of that week's long run, which was done that morning. Later the trip is corrected by name with only its length and last day.

**Tags.** GYM, TRAVEL, UNAVAILABLE_DAY, CORRECTION, RETURN_SHORT, LATE_REPORTER, BALANCED_HYBRID, NON_RACE, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":12,"asOf":"2027-01-02","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":75,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["back-squat 3x6 70KG TOTAL","barbell-rdl 3x8 60KG TOTAL","db-bench-press 3x10 18KG PER_HAND","one-arm-db-row 3x10 20KG PER_HAND"],"equipment":["BARBELL","RACK","BENCH","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,6],"strengthDays":[1,4],"runMinutes":45,"strengthMinutes":60,"longRunDay":6,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-04  RUN EASY 40min (EASY) | d1 2027-01-05  STRENGTH_FULL_A 39min: back-squat 3x6 RIR3 70kg TOTAL; db-bench-press 3x6 RIR3 18kg PER_HAND; one-arm-db-row 3x6 RIR3 20kg PER_HAND; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2027-01-06  RUN EASY 40min (EASY) | d4 2027-01-08  STRENGTH_FULL_B 39min: barbell-rdl 3x6 RIR3 60kg TOTAL; one-arm-db-row 3x6 RIR3 20kg PER_HAND; db-bench-press 3x6 RIR3 18kg PER_HAND; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2027-01-10  RUN LONG 65min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-01-11  RUN EASY 40min (EASY) | d1 2027-01-12  STRENGTH_FULL_A 40min: back-squat 3x6 RIR3 70kg TOTAL; db-bench-press 3x6 RIR3 18kg PER_HAND; one-arm-db-row 3x6 RIR3 20kg PER_HAND; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d2 2027-01-13  RUN EASY 40min (EASY) | d4 2027-01-15  STRENGTH_FULL_B 40min: barbell-rdl 3x6 RIR3 60kg TOTAL; one-arm-db-row 3x6 RIR3 20kg PER_HAND; db-bench-press 3x6 RIR3 18kg PER_HAND; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d6 2027-01-17  RUN LONG 65min (LONG)

### s1 · 2027-01-21T08:00:00+01:00 · UNAVAILABLE_DAY (week 2)

- Athlete: 8 report(s): w0-run-d0 done 40min; w0-run-d2 done 40min; w0-run-d6 done 65min; w0-str-d1 done 39min 5 exercises; w0-str-d4 done 39min 5 exercises; w1-run-d0 done 40min; w1-str-d1 done 40min 5 exercises; w1-run-d2 done 40min · changes `{"unavailableDates":["2027-01-28"]}` · break `{"startDate":"2027-01-14","endDate":"2027-01-20","reasonCategory":"WORK","reason":"site visit","nonclinical":true,"episodeId":"site-a"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2027-01-21 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the unavailable day is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2027-01-21T07:00:00.000Z with a UNAVAILABLE_DAY report (R7D-F29-s1), not applied yet: `{"startDate":"2027-01-14","endDate":"2027-01-20","reasonCategory":"WORK","reason":"site visit","nonclinical":true,"episodeId":"site-a"}`
- Current week 2 (DEVELOPMENT) from 2027-01-21: d4 2027-01-22  STRENGTH_FULL_B 40min: barbell-rdl 3x6 RIR3 62.5kg TOTAL; one-arm-db-row 3x6 RIR3 22kg PER_HAND; db-bench-press 3x6 RIR3 20kg PER_HAND; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d6 2027-01-24  RUN LONG 65min (LONG)
- Next week 3 (CONSOLIDATION, provisional): d0 2027-01-25  RUN EASY 45min (EASY +strides) | d1 2027-01-26  STRENGTH_FULL_A 28min: back-squat 2x6 RIR3 72.5kg TOTAL; db-bench-press 2x6 RIR3 20kg PER_HAND; one-arm-db-row 2x6 RIR3 22kg PER_HAND; db-calf-raise 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2027-01-27  RUN EASY 40min (EASY) | d4 2027-01-29  STRENGTH_FULL_B 28min: barbell-rdl 2x6 RIR3 62.5kg TOTAL; one-arm-db-row 2x6 RIR3 22kg PER_HAND; db-bench-press 2x6 RIR3 20kg PER_HAND; bulgarian-split-squat-db 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2027-01-31  RUN LONG 55min (LONG)

### s2 · 2027-02-07T20:00:00+01:00 · WEEKLY_REVIEW (week 4)

- Athlete: 8 report(s): w2-str-d4 done 40min 5 exercises; w2-run-d6 done 65min; w3-run-d0 done 45min; w3-str-d1 done 28min 5 exercises; w3-run-d2 done 40min; w3-str-d4 done 28min 5 exercises; w3-run-d6 done 55min at 2027-01-31T07:30:00+01:00; w4-run-d6 done 65min · break `{"startDate":"2027-01-31","endDate":"2027-02-05","reasonCategory":"TRAVEL","reason":"flight for a family trip","nonclinical":true,"startedAt":"2027-01-31T15:00:00+01:00","episodeId":"trip-b"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2027-01-14 to 2027-01-20; 2027-01-31 to 2027-02-05), each its own interruption; the stop read runs from 2027-01-31 to 2027-02-05; the break from 2027-01-14 to 2027-01-20 is read as its own return (short, 7 days), as if applied when training resumed on 2027-01-21, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return: short nonclinical interruption (6 days): resume the last completed doses; no step until execution is observed
- Current week 4 (DEVELOPMENT) from 2027-02-07: d6 2027-02-07  RUN LONG 65min (LONG)
- Next week 5 (DEVELOPMENT, provisional): d0 2027-02-08  RUN EASY 40min (EASY) | d1 2027-02-09  STRENGTH_FULL_A 39min: back-squat 3x6 RIR3 72.5kg TOTAL; db-bench-press 3x6 RIR3 20kg PER_HAND; one-arm-db-row 3x6 RIR3 22kg PER_HAND; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2027-02-10  RUN EASY 40min (EASY) | d4 2027-02-12  STRENGTH_FULL_B 39min: barbell-rdl 3x6 RIR3 62.5kg TOTAL; one-arm-db-row 3x6 RIR3 22kg PER_HAND; db-bench-press 3x6 RIR3 20kg PER_HAND; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2027-02-14  RUN LONG 65min (LONG)

### s3 · 2027-02-11T07:00:00+01:00 · RETURN_AFTER_PAUSE (week 5)

- Athlete: 3 report(s): w5-run-d0 done 40min; w5-str-d1 done 39min 5 exercises; w5-run-d2 done 40min · break `{"episodeId":"trip-b","days":5,"endDate":"2027-02-05","reasonCategory":"TRAVEL","reason":"family trip; the flight was on Monday after all","nonclinical":true}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2027-01-14 to 2027-01-20; 2027-02-01 to 2027-02-05), each its own interruption; the stop read runs from 2027-02-01 to 2027-02-05; the break from 2027-01-14 to 2027-01-20 is read as its own return (short, 7 days), as if applied when training resumed on 2027-01-21, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return (read again with this newer report of the interruption): short nonclinical interruption (5 days): resume the last completed doses; no step until execution is observed
- Current week 5 (DEVELOPMENT) from 2027-02-11: d4 2027-02-12  STRENGTH_FULL_B 39min: barbell-rdl 3x6 RIR3 62.5kg TOTAL; one-arm-db-row 3x6 RIR3 22kg PER_HAND; db-bench-press 3x6 RIR3 20kg PER_HAND; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2027-02-14  RUN LONG 65min (LONG)
- Next week 6 (DEVELOPMENT, provisional): d0 2027-02-15  RUN EASY 40min (EASY +strides) | d1 2027-02-16  STRENGTH_FULL_A 40min: back-squat 3x6 RIR3 72.5kg TOTAL; db-bench-press 3x6 RIR3 20kg PER_HAND; one-arm-db-row 3x6 RIR3 22kg PER_HAND; db-calf-raise 2x7 RIR3 establish; dead-bug 2x9 RIR3 BW | d2 2027-02-17  RUN EASY 40min (EASY) | d4 2027-02-19  STRENGTH_FULL_B 40min: barbell-rdl 3x6 RIR3 62.5kg TOTAL; one-arm-db-row 3x6 RIR3 22kg PER_HAND; db-bench-press 3x6 RIR3 20kg PER_HAND; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d6 2027-02-21  RUN LONG 65min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation · non-blocking differences: LOAD_CONVENTION_EQUIVALENT

**Author expectations.**
- f29-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f29-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f29-e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f29-e4 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Week 3 lies wholly between the breaks (its long run was done at 07:30, before the 15:00 start) and was executed completely in both sports: the athlete re-entered, the site visit is history, and the return is classed by the six-day trip alone, resuming from the doses executed (presented as resumed training, never as restored fitness).
- f29-e5 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f29-e6 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- f29-e7 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The corrected trip runs 2027-02-01 to 2027-02-05, read from its length and last day; the earlier break is not re-read as a stop and week 3 remains the re-entry week.

**Independent assessment (author, written before any output).**
- Rationale: Ana trained a complete week, both sports exactly as planned, between a work trip and a family trip, and she ran long on the morning she flew out. That is clear evidence she resumed; the return should reflect only the second trip.
- Preferred: Apply the return for the six-day trip from the executed week-3 doses; on the correction accept the new dates (Monday to Friday) and keep the same reading.
- Acceptable alternatives: A one-week short return. / Asking to confirm the flight time if it had been missing (it is given).
- Concerns: Reading the stop through the site visit despite the complete week. / Treating the morning long run as inside the trip. / Re-opening the site visit on the correction.
- Domain notes: Site visit 2027-01-14 to 2027-01-20; week 3 is 2027-01-25 to 2027-01-31; trip first 2027-01-31 15:00 to 2027-02-05, corrected to 5 days ending 2027-02-05.

## R7D-F30

**Intent.** Runs of the week between two breaks all done, strength missed: the earlier break must be read as its own return for strength. The return is reported on a Friday after a missed Thursday run. A strength session on the earlier break's first day is then reported late without a time; the start time is answered in a return report.

**Tags.** RETURN_SHORT, LATE_REPORTER, SCHEDULE_CHANGE, MIXED_EXECUTION, RUN_FIRST, RACE_HALF, H16, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":16,"asOf":"2026-11-14","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-28"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-02-28"},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":160,"longestRunMinutes":80,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[0,4],"runMinutes":50,"strengthMinutes":35,"longRunDay":6,"longRunMinutes":120}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-16  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-17  RUN EASY 45min (EASY) | d3 2026-11-19  RUN EASY 45min (EASY) | d4 2026-11-20  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-22  RUN LONG 70min (LONG)
- Week 1 (BUILD): d0 2026-11-23  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2026-11-24  RUN EASY 45min (EASY) | d3 2026-11-26  RUN EASY 45min (EASY) | d4 2026-11-27  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-29  RUN LONG 70min (LONG)
- Week 13 (TAPER): d0 2027-02-15  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; incline-push-up 1x14 RIR3 BW; band-row 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2027-02-16  RUN EASY 35min (EASY +strides) | d3 2027-02-18  RUN QUALITY 31min (HALF_MARATHON_SPECIFIC 2x7'/2') | d4 2027-02-19  STRENGTH_FULL_B 21min: glute-bridge 1x14 RIR3 BW; band-row 1x10 RIR3 BW; incline-push-up 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2027-02-21  RUN LONG 50min (LONG)
- Week 14 (RACE_WEEK): d0 2027-02-22  STRENGTH_FULL_A 17min: goblet-squat 1x8 RIR4 last logged; incline-push-up 1x14 RIR4 BW; band-row 1x10 RIR4 BW | d1 2027-02-23  RUN EASY 25min (EASY) | d3 2027-02-25  RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d4 STRENGTH REST_BY_DESIGN | d6 2027-02-28  RUN RACE 150min (RACE)

### s1 · 2026-12-06T07:00:00-05:00 · SCHEDULE_CHANGE (week 2)

- Athlete: 10 report(s): w0-run-d1 done 45min; w0-run-d3 done 45min; w0-run-d6 done 70min; w1-run-d1 done 45min; w1-run-d3 done 45min; w1-run-d6 done 70min; w0-str-d0 done 15min 5 exercises; w0-str-d4 done 27min 5 exercises; w1-str-d0 done 27min 5 exercises; w1-str-d4 done 27min 5 exercises · changes `{"strengthTurn":"PM"}` · break `{"startDate":"2026-11-30","endDate":"2026-12-05","reasonCategory":"FAMILY","reason":"family wedding abroad","nonclinical":true,"episodeId":"fam-1"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2026-12-06 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the schedule change is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2026-12-06T12:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F30-s1), not applied yet: `{"startDate":"2026-11-30","endDate":"2026-12-05","reasonCategory":"FAMILY","reason":"family wedding abroad","nonclinical":true,"episodeId":"fam-1"}`
- Current week 2 (BUILD) from 2026-12-06: d6 2026-12-06  RUN LONG 70min (LONG)
- Next week 3 (BUILD, provisional): d0 2026-12-07  STRENGTH_FULL_A 28min: goblet-squat 2x8 RIR3 last logged; incline-push-up 2x12 RIR3 BW; band-row 2x10 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2026-12-08  RUN EASY 50min (EASY +strides) | d3 2026-12-10  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d4 2026-12-11  STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x12 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2026-12-13  RUN LONG 70min (LONG)

### s2 · 2026-12-18T07:00:00-05:00 · RETURN_AFTER_PAUSE (week 4)

- Athlete: 7 report(s): w2-run-d6 done 70min; w3-run-d1 done 50min; w3-run-d3 done 34min; w3-run-d6 done 70min; w3-str-d0 not done; w3-str-d4 not done; w4-run-d3 not done · break `{"startDate":"2026-12-14","endDate":"2026-12-15","reasonCategory":"WORK","reason":"two-day off-site","nonclinical":true,"episodeId":"work-1"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption reason is unclear; say what it was and confirm it involved no pain, injury or illness
- Record: break declared 2026-12-06T12:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F30-s1), not applied yet: `{"startDate":"2026-11-30","endDate":"2026-12-05","reasonCategory":"FAMILY","reason":"family wedding abroad","nonclinical":true,"episodeId":"fam-1"}`
- Record: break declared 2026-12-18T12:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-F30-s2), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-15","reasonCategory":"WORK","reason":"two-day off-site","nonclinical":true,"episodeId":"work-1"}`
- Current week 4 (CONSOLIDATION) from 2026-12-18: d4 2026-12-18  STRENGTH_FULL_B 21min: glute-bridge 1x14 RIR3 BW; band-row 1x10 RIR3 BW; incline-push-up 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2026-12-20  RUN LONG 65min (LONG)
- Next week 5 (BUILD, provisional): d0 2026-12-21  STRENGTH_FULL_A 33min: goblet-squat 3x8 RIR3 last logged; incline-push-up 3x14 RIR3 BW; band-row 3x10 RIR3 BW | d1 2026-12-22  RUN EASY 50min (EASY +strides) | d3 2026-12-24  RUN QUALITY 41min (THRESHOLD 4x5'/2') | d4 2026-12-25  STRENGTH_FULL_B 34min: glute-bridge 3x14 RIR3 BW; band-row 3x10 RIR3 BW; incline-push-up 3x14 RIR3 BW | d6 2026-12-27  RUN LONG 70min (LONG)

### s3 · 2026-12-20T21:00:00-05:00 · WEEKLY_REVIEW (week 4)

- Athlete: 3 report(s): w4-str-d4 done 21min 5 exercises; w4-run-d6 done 65min; w2-str-d0 done 28min 5 exercises reportedAt 2026-12-20T20:55:00-05:00
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption reason is unclear; say what it was and confirm it involved no pain, injury or illness
- Record: break declared 2026-12-06T12:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F30-s1), not applied yet: `{"startDate":"2026-11-30","endDate":"2026-12-05","reasonCategory":"FAMILY","reason":"family wedding abroad","nonclinical":true,"episodeId":"fam-1"}`
- Record: break declared 2026-12-18T12:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-F30-s2), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-15","reasonCategory":"WORK","reason":"two-day off-site","nonclinical":true,"episodeId":"work-1"}`
- Current week 4 (CONSOLIDATION) from 2026-12-20: d6 2026-12-20  RUN LONG 65min (LONG)
- Next week 5 (BUILD, provisional): d0 2026-12-21  STRENGTH_FULL_A 33min: goblet-squat 3x8 RIR3 last logged; incline-push-up 3x14 RIR3 BW; band-row 3x10 RIR3 BW | d1 2026-12-22  RUN EASY 50min (EASY +strides) | d3 2026-12-24  RUN QUALITY 41min (THRESHOLD 4x5'/2') | d4 2026-12-25  STRENGTH_FULL_B 34min: glute-bridge 3x14 RIR3 BW; band-row 3x10 RIR3 BW; incline-push-up 3x14 RIR3 BW | d6 2026-12-27  RUN LONG 70min (LONG)

### s4 · 2026-12-22T07:00:00-05:00 · RETURN_AFTER_PAUSE (week 5)

- Athlete: 1 report(s): w5-str-d0 done 33min 3 exercises · break `{"startDate":"2026-11-30","endDate":"2026-12-05","reasonCategory":"FAMILY","reason":"family wedding abroad","nonclinical":true,"episodeId":"fam-1","startedAt":"2026-11-30T11:00:00-05:00"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption reason is unclear; say what it was and confirm it involved no pain, injury or illness
- Record: break declared 2026-12-06T12:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F30-s1), not applied yet: `{"startDate":"2026-11-30","endDate":"2026-12-05","reasonCategory":"FAMILY","reason":"family wedding abroad","nonclinical":true,"episodeId":"fam-1"}`
- Record: break declared 2026-12-18T12:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-F30-s2), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-15","reasonCategory":"WORK","reason":"two-day off-site","nonclinical":true,"episodeId":"work-1"}`
- Record: break declared 2026-12-22T12:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-F30-s4), not applied yet: `{"startDate":"2026-11-30","endDate":"2026-12-05","reasonCategory":"FAMILY","reason":"family wedding abroad","nonclinical":true,"episodeId":"fam-1","startedAt":"2026-11-30T11:00:00-05:00"}`
- Current week 5 (BUILD) from 2026-12-22: d1 2026-12-22  RUN EASY 50min (EASY +strides) | d3 2026-12-24  RUN QUALITY 41min (THRESHOLD 4x5'/2') | d4 2026-12-25  STRENGTH_FULL_B 34min: glute-bridge 3x14 RIR3 BW; band-row 3x10 RIR3 BW; incline-push-up 3x14 RIR3 BW | d6 2026-12-27  RUN LONG 70min (LONG)
- Next week 6 (BUILD, provisional): d0 2026-12-28  STRENGTH_FULL_A 33min: goblet-squat 3x8 RIR3 last logged; incline-push-up 3x14 RIR3 BW; band-row 3x10 RIR3 BW | d1 2026-12-29  RUN EASY 50min (EASY +strides) | d3 2026-12-31  RUN QUALITY 48min (THRESHOLD 5x5'/2') | d4 2027-01-01  STRENGTH_FULL_B 34min: glute-bridge 3x14 RIR3 BW; band-row 3x10 RIR3 BW; incline-push-up 3x14 RIR3 BW | d6 2027-01-03  RUN LONG 75min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f30-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f30-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f30-e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"ASK"`
- f30-e4 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Week 3 counts for running only (every run done, strength missed): the wedding trip is read as its own return; running resumes from what week 3 executed; strength continues from that own return and gets no step it did not earn; the missed Thursday run of week 4 never counts as done for the longest-run limit.
- f30-e5 @s2 ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["14:6:RACE"]`
- f30-e6 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"ASK"`
- f30-e7 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The coach asks for the start time of fam-1 (or first confirms the latest break) instead of guessing whether the session was before the trip.
- f30-e8 @s4 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"ASK"`
- f30-e9 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **FAIL** observed `"REQUIRES_RECONCILIATION"`
- f30-e10 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — With the trip starting at 11:00, the session that morning is training done before the break; it informs strength's starting state but is never a re-entry by itself.

**Independent assessment (author, written before any output).**
- Rationale: Ben kept running between his two trips but skipped every lift. Running has shown it resumed; strength has not. Later he remembers a lift on the morning he left, which matters only if it came before the trip started.
- Preferred: Read the wedding trip as its own return: running continues from the executed week, strength from the own return. Ignore the missed Thursday run when setting the long run. Ask the start time once the late lift arrives; with 11:00 given, count the lift as pre-break training.
- Acceptable alternatives: Asking first to confirm the off-site dates, then the start time. / Holding strength at the own-return level for an extra week.
- Concerns: Restoring strength progression because running resumed. / Counting the missed Thursday run as done. / Guessing the order of the lift and the trip.
- Domain notes: Wedding trip 2026-11-30 to 2026-12-05 (Monday lift that morning); week 3 2026-12-07 to 2026-12-13; off-site 2026-12-14 to 2026-12-15; Thursday 2026-12-17 run missed; return Friday 2026-12-18.

## R7D-F31

**Intent.** Between a move and a family visit every run is done while strength is first missed and then logged without reps in reserve, so strength has no counting week. Then a lift on the move's first day is reported late; the athlete confirms the later break first, sends the start time with an unavailable-day event, and the week's review applies it.

**Tags.** GYM, MIXED_EXECUTION, LATE_REPORTER, UNAVAILABLE_DAY, RETURN_SHORT, BALANCED_HYBRID, NON_RACE, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, START_NON_MONDAY, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-25","weeks":12,"asOf":"2026-11-24","tz":330,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["back-squat 4x8 80KG TOTAL","bench-press 4x8 60KG TOTAL","barbell-row 4x10 55KG TOTAL","barbell-rdl 3x10 70KG TOTAL"],"equipment":["BARBELL","RACK","BENCH","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,5],"strengthDays":[1,4],"runMinutes":50,"strengthMinutes":60,"longRunDay":3,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-25  RUN EASY 40min (EASY) | d1 2026-11-26  STRENGTH_FULL_A 47min: back-squat 4x8 RIR3 80kg TOTAL; bench-press 4x8 RIR3 60kg TOTAL; barbell-row 4x10 RIR3 55kg TOTAL; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2026-11-28  RUN LONG 65min (LONG) | d4 2026-11-29  STRENGTH_FULL_B 44min: barbell-rdl 3x10 RIR3 70kg TOTAL; barbell-row 4x10 RIR3 55kg TOTAL; bench-press 4x8 RIR3 60kg TOTAL; db-split-squat 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish | d5 2026-11-30  RUN EASY 40min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-02  RUN EASY 40min (EASY) | d1 2026-12-03  STRENGTH_FULL_A 48min: back-squat 4x10 RIR3 80kg TOTAL; bench-press 4x10 RIR3 60kg TOTAL; barbell-row 4x12 RIR3 55kg TOTAL; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d3 2026-12-05  RUN LONG 65min (LONG) | d4 2026-12-06  STRENGTH_FULL_B 46min: barbell-rdl 3x12 RIR3 70kg TOTAL; barbell-row 4x12 RIR3 55kg TOTAL; bench-press 4x10 RIR3 60kg TOTAL; db-split-squat 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged | d5 2026-12-07  RUN EASY 40min (EASY)

### s1 · 2026-12-10T08:00:00+05:30 · UNAVAILABLE_DAY (week 2)

- Athlete: 6 report(s): w0-run-d0 done 40min; w0-run-d3 done 65min; w0-run-d5 done 40min; w0-str-d1 done 47min 5 exercises; w0-str-d4 done 44min 5 exercises; w1-run-d0 done 40min · changes `{"unavailableDates":["2026-12-23"]}` · break `{"startDate":"2026-12-03","endDate":"2026-12-09","reasonCategory":"MOVING","reason":"moving flat","nonclinical":true,"episodeId":"move-1"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2026-12-10 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the unavailable day is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2026-12-10T02:30:00.000Z with a UNAVAILABLE_DAY report (R7D-F31-s1), not applied yet: `{"startDate":"2026-12-03","endDate":"2026-12-09","reasonCategory":"MOVING","reason":"moving flat","nonclinical":true,"episodeId":"move-1"}`
- Current week 2 (DEVELOPMENT) from 2026-12-10: d1 2026-12-10  STRENGTH_FULL_A 49min: back-squat 4x12 RIR3 80kg TOTAL; bench-press 4x12 RIR3 60kg TOTAL; barbell-row 4x8 RIR3 57.5kg TOTAL; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x14 RIR3 BW | d3 2026-12-12  RUN LONG 65min (LONG) | d4 2026-12-13  STRENGTH_FULL_B 45min: barbell-rdl 3x8 RIR3 72.5kg TOTAL; barbell-row 4x8 RIR3 57.5kg TOTAL; bench-press 4x12 RIR3 60kg TOTAL; db-split-squat 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged | d5 2026-12-14  RUN EASY 45min (EASY +strides)
- Next week 3 (CONSOLIDATION, provisional): d0 2026-12-16  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2026-12-17  STRENGTH_FULL_A 35min: back-squat 3x8 RIR3 82.5kg TOTAL; bench-press 3x8 RIR3 62.5kg TOTAL; barbell-row 3x10 RIR3 57.5kg TOTAL; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x16 RIR3 BW | d3 2026-12-19  RUN LONG 60min (LONG) | d4 2026-12-20  STRENGTH_FULL_B 33min: barbell-rdl 2x10 RIR3 72.5kg TOTAL; barbell-row 3x10 RIR3 57.5kg TOTAL; bench-press 3x8 RIR3 62.5kg TOTAL; db-split-squat 1x10 RIR3 last logged; db-biceps-curl 1x10 RIR3 last logged | d5 2026-12-21  RUN EASY 45min (EASY +strides)

### s2 · 2026-12-29T21:00:00+05:30 · WEEKLY_REVIEW (week 4)

- Athlete: 11 report(s): w2-str-d1 not done; w2-run-d3 done 65min; w2-str-d4 not done; w2-run-d5 done 45min; w3-run-d0 done 34min; w3-run-d3 done 60min; w3-run-d5 done 45min; w3-str-d1 done 3 exercises; w3-str-d4 done 3 exercises; w4-str-d4 done 51min 5 exercises; w4-run-d5 done 45min · break `{"startDate":"2026-12-23","endDate":"2026-12-26","reasonCategory":"FAMILY","reason":"family visit","nonclinical":true,"episodeId":"fam-2"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-03 to 2026-12-09; 2026-12-23 to 2026-12-26), each its own interruption; the stop read runs from 2026-12-23 to 2026-12-26; the break from 2026-12-03 to 2026-12-09 is read as its own return (short, 7 days), as if applied when training resumed on 2026-12-10, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return: short nonclinical interruption (4 days): resume the last completed doses; no step until execution is observed
- Current week 4 (DEVELOPMENT) from 2026-12-29: —
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-30  RUN EASY 34min (EASY) | d1 2026-12-31  STRENGTH_FULL_A 47min: back-squat 4x8 RIR3 80kg TOTAL; bench-press 4x8 RIR3 60kg TOTAL; barbell-row 4x10 RIR3 55kg TOTAL; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2027-01-02  RUN LONG 65min (LONG) | d4 2027-01-03  STRENGTH_FULL_B 42min: barbell-rdl 2x8 RIR3 establish; barbell-row 4x10 RIR3 55kg TOTAL; bench-press 4x8 RIR3 60kg TOTAL; db-split-squat 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish | d5 2027-01-04  RUN EASY 40min (EASY +strides)

### s3 · 2027-01-05T21:00:00+05:30 · WEEKLY_REVIEW (week 5)

- Athlete: 6 report(s): w5-run-d0 done 34min; w5-run-d3 done 65min; w5-run-d5 done 40min; w5-str-d1 done 47min 5 exercises; w5-str-d4 done 42min 5 exercises; w1-str-d1 done 48min 5 exercises reportedAt 2027-01-05T20:50:00+05:30
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Executed as planned this week; next week’s runs follow the executed record, not the plan’s earlier projection (quality 34 min, planned quality 41 min; long run 65 min, planned long run 70 min); a break was declared from 2026-12-23 to 2026-12-26, and next week follows what was executed since its return; so the plan is re-based, not kept
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","back-squat":"ADVANCE","bench-press":"ADVANCE","barbell-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","barbell-rdl":"ADVANCE","db-split-squat":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 5 (DEVELOPMENT) from 2027-01-05: —
- Next week 6 (DEVELOPMENT, provisional): d0 2027-01-06  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2027-01-07  STRENGTH_FULL_A 48min: back-squat 4x10 RIR3 80kg TOTAL; bench-press 4x10 RIR3 60kg TOTAL; barbell-row 4x12 RIR3 55kg TOTAL; db-calf-raise 2x10 RIR3 establish; dead-bug 2x12 RIR3 BW | d3 2027-01-09  RUN LONG 65min (LONG) | d4 2027-01-10  STRENGTH_FULL_B 43min: barbell-rdl 2x10 RIR3 establish; barbell-row 4x12 RIR3 55kg TOTAL; bench-press 4x10 RIR3 60kg TOTAL; db-split-squat 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish | d5 2027-01-11  RUN EASY 45min (EASY +strides)

### s4 · 2027-01-06T07:00:00+05:30 · RETURN_AFTER_PAUSE (week 6)

- Athlete: no reports · break `{"startDate":"2026-12-23","endDate":"2026-12-26","reasonCategory":"FAMILY","reason":"family visit","nonclinical":true,"episodeId":"fam-2"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-03 to 2026-12-09; 2026-12-23 to 2026-12-26), each its own interruption; the stop read runs from 2026-12-23 to 2026-12-26; the break from 2026-12-03 to 2026-12-09 is read as its own return (short, 7 days), as if applied when training resumed on 2026-12-10, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return (read again with this newer report of the interruption): short nonclinical interruption (4 days): resume the last completed doses; no step until execution is observed
- Current week 6 (DEVELOPMENT) from 2027-01-06: d0 2027-01-06  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2027-01-07  STRENGTH_FULL_A 47min: back-squat 4x8 RIR3 80kg TOTAL; bench-press 4x8 RIR3 60kg TOTAL; barbell-row 4x10 RIR3 55kg TOTAL; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2027-01-09  RUN LONG 65min (LONG) | d4 2027-01-10  STRENGTH_FULL_B 42min: barbell-rdl 2x8 RIR3 establish; barbell-row 4x10 RIR3 55kg TOTAL; bench-press 4x8 RIR3 60kg TOTAL; db-split-squat 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish | d5 2027-01-11  RUN EASY 40min (EASY +strides)
- Next week 7 (CONSOLIDATION, provisional): d0 2027-01-13  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2027-01-14  STRENGTH_FULL_A 36min: back-squat 3x10 RIR3 80kg TOTAL; bench-press 3x10 RIR3 60kg TOTAL; barbell-row 3x12 RIR3 55kg TOTAL; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2027-01-16  RUN LONG 60min (LONG) | d4 2027-01-17  STRENGTH_FULL_B 34min: barbell-rdl 2x10 RIR3 last logged; barbell-row 3x12 RIR3 55kg TOTAL; bench-press 3x10 RIR3 60kg TOTAL; db-split-squat 1x10 RIR3 last logged; db-biceps-curl 1x10 RIR3 last logged | d5 2027-01-18  RUN EASY 45min (EASY +strides)

### s5 · 2027-01-07T07:00:00+05:30 · UNAVAILABLE_DAY (week 6)

- Athlete: no reports · changes `{"unavailableDates":["2027-01-11"]}` · break `{"startDate":"2026-12-03","endDate":"2026-12-09","reasonCategory":"MOVING","reason":"moving flat","nonclinical":true,"episodeId":"move-1","startedAt":"2026-12-03T14:00:00+05:30"}`
- Coach: **MODIFY** / RESCHEDULE_WITHIN_WEEK · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Sessions on the unavailable date are moved within chosen days when that adds no interference, otherwise skipped without debt
- Record: break declared 2027-01-07T01:30:00.000Z with a UNAVAILABLE_DAY report (R7D-F31-s5), not applied yet: `{"startDate":"2026-12-03","endDate":"2026-12-09","reasonCategory":"MOVING","reason":"moving flat","nonclinical":true,"episodeId":"move-1","startedAt":"2026-12-03T14:00:00+05:30"}`
- Current week 6 (DEVELOPMENT) from 2027-01-07: d1 2027-01-07  STRENGTH_FULL_A 47min: back-squat 4x8 RIR3 80kg TOTAL; bench-press 4x8 RIR3 60kg TOTAL; barbell-row 4x10 RIR3 55kg TOTAL; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2027-01-09  RUN LONG 65min (LONG) | d4 2027-01-10  STRENGTH_FULL_B 42min: barbell-rdl 2x8 RIR3 establish; barbell-row 4x10 RIR3 55kg TOTAL; bench-press 4x8 RIR3 60kg TOTAL; db-split-squat 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish | d5 2027-01-11  RUN EASY 40min (EASY +strides) [SKIPPED]
- Next week 7 (CONSOLIDATION, provisional): d0 2027-01-13  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2027-01-14  STRENGTH_FULL_A 36min: back-squat 3x10 RIR3 80kg TOTAL; bench-press 3x10 RIR3 60kg TOTAL; barbell-row 3x12 RIR3 55kg TOTAL; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2027-01-16  RUN LONG 60min (LONG) | d4 2027-01-17  STRENGTH_FULL_B 34min: barbell-rdl 2x10 RIR3 last logged; barbell-row 3x12 RIR3 55kg TOTAL; bench-press 3x10 RIR3 60kg TOTAL; db-split-squat 1x10 RIR3 last logged; db-biceps-curl 1x10 RIR3 last logged | d5 2027-01-18  RUN EASY 45min (EASY +strides)

### s6 · 2027-01-12T21:00:00+05:30 · WEEKLY_REVIEW (week 6)

- Athlete: 4 report(s): w6-run-d0 done 34min; w6-run-d3 done 65min; w6-str-d1 done 47min 5 exercises; w6-str-d4 done 42min 5 exercises
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Record: break declared 2027-01-07T01:30:00.000Z with a UNAVAILABLE_DAY report (R7D-F31-s5), not applied yet: `{"startDate":"2026-12-03","endDate":"2026-12-09","reasonCategory":"MOVING","reason":"moving flat","nonclinical":true,"episodeId":"move-1","startedAt":"2026-12-03T14:00:00+05:30"}`
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"HOLD","back-squat":"ADVANCE","bench-press":"ADVANCE","barbell-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","barbell-rdl":"ADVANCE","db-split-squat":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 6 (DEVELOPMENT) from 2027-01-12: —
- Next week 7 (CONSOLIDATION, provisional): d0 2027-01-13  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2027-01-14  STRENGTH_FULL_A 36min: back-squat 3x10 RIR3 80kg TOTAL; bench-press 3x10 RIR3 60kg TOTAL; barbell-row 3x12 RIR3 55kg TOTAL; db-calf-raise 1x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d3 2027-01-16  RUN LONG 60min (LONG) | d4 2027-01-17  STRENGTH_FULL_B 31min: barbell-rdl 1x10 RIR3 establish; barbell-row 3x12 RIR3 55kg TOTAL; bench-press 3x10 RIR3 60kg TOTAL; db-split-squat 1x10 RIR3 establish; db-biceps-curl 1x10 RIR3 establish | d5 2027-01-18  RUN EASY 40min (EASY +strides)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f31-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f31-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f31-e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f31-e4 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Strength logged without reps in reserve never counts a week for strength; week 3 counts for running only: the move is read as its own return, running resumes from what was executed and strength continues from the move's own return without an unearned step.
- f31-e5 @s3 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"MODIFY"`
- f31-e6 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f31-e7 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The identical restatement of fam-2 applies nothing new; if the start time of move-1 is still missing it is asked again.
- f31-e8 @s5 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The restated move with its 14:00 start is recorded as that break's report, never as a break of its own; the unavailable day is handled without inventing a session on another day.
- f31-e9 @s6 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f31-e10 @s6 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`

**Independent assessment (author, written before any output).**
- Rationale: Arjun ran every session between his move and the family visit but missed his first two lifts and logged the next ones without reserve, so the coach cannot tell whether strength was really at prescription. A late-remembered lift on moving day matters only if it preceded the move.
- Preferred: Treat running as resumed and strength as continuing from the move's own return; ask the start time after the late lift; accept the same-facts confirmation without change; record the start time sent with the unavailable day and apply it at the next review, with the unavailable session dropped.
- Acceptable alternatives: Asking to confirm the family visit before the start time. / Prompting him to log reserve on future lifts.
- Concerns: Counting the week-3 lifts as a strength re-entry. / Treating the restated move as a third break. / Moving the unavailable session to an unchosen day.
- Domain notes: Day 0 is Wednesday (offset +05:30). Move 2026-12-03 (Thursday lift that morning) to 2026-12-09; week 3 2026-12-16 to 2026-12-22; family visit 2026-12-23 to 2026-12-26.

## R7D-F32

**Intent.** A work trip in the week before a 10K (stated with a systemic fatigue report), the race week between it and a post-race holiday: the race touch done at half its minutes, the optional shakeout left undone, the race finished, strength done in full. Probes per-sport counting of a race week.

**Tags.** RACE_10K, RACE_WEEK, POST_RACE, FATIGUE_SYSTEMIC, SHORTENED_RUNS, RETURN_SHORT, LATE_REPORTER, RUN_FIRST, H8, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, KETTLEBELL, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2027-02-01","weeks":8,"asOf":"2027-01-30","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-07","timeGoalMinutes":51}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2027-03-07","timeGoalMinutes":51},"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":160,"longestRunMinutes":75,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[0,4],"runMinutes":45,"strengthMinutes":40,"longRunDay":6,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · RACE_WEEK · POST_EVENT · NEXT_BLOCK · NEXT_BLOCK
- Week 0 (ESTABLISHMENT): d0 2027-02-01  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2027-02-02  RUN EASY 45min (EASY) | d3 2027-02-04  RUN EASY 45min (EASY) | d4 2027-02-05  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2027-02-07  RUN LONG 70min (LONG)
- Week 1 (BUILD): d0 2027-02-08  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d1 2027-02-09  RUN EASY 45min (EASY) | d3 2027-02-11  RUN EASY 45min (EASY) | d4 2027-02-12  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2027-02-14  RUN LONG 70min (LONG)
- Week 3 (SPECIFIC): d0 2027-02-22  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d1 2027-02-23  RUN EASY 45min (EASY +strides) | d3 2027-02-25  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d4 2027-02-26  STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2027-02-28  RUN LONG 70min (LONG)
- Week 4 (RACE_WEEK): d0 2027-03-01  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d1 2027-03-02  RUN EASY 25min (EASY) | d3 2027-03-04  RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d4 STRENGTH REST_BY_DESIGN | d6 2027-03-07  RUN RACE 75min (RACE)

### s1 · 2027-02-28T09:00:00+00:00 · SYSTEMIC_FATIGUE (week 3)

- Athlete: 15 report(s): w0-run-d1 done 45min; w0-run-d3 done 45min; w0-run-d6 done 70min; w1-run-d1 done 45min; w1-run-d3 done 45min; w1-run-d6 done 70min; w2-run-d1 done 45min; w2-run-d3 done 45min; w2-run-d6 done 70min; w0-str-d0 done 27min 5 exercises; w0-str-d4 done 27min 5 exercises; w1-str-d0 done 27min 5 exercises; w1-str-d4 done 27min 5 exercises; w2-str-d0 done 20min 5 exercises; w2-str-d4 done 20min 5 exercises · break `{"startDate":"2027-02-23","endDate":"2027-02-27","reasonCategory":"WORK","reason":"work trip, no training","nonclinical":true}` · signals `{"region":"ALL"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2027-02-28 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the systemic fatigue is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2027-02-28T09:00:00.000Z with a SYSTEMIC_FATIGUE report (R7D-F32-s1), not applied yet: `{"startDate":"2027-02-23","endDate":"2027-02-27","reasonCategory":"WORK","reason":"work trip, no training","nonclinical":true}`
- Current week 3 (SPECIFIC) from 2027-02-28: d6 2027-02-28  RUN LONG 70min (LONG)
- Next week 4 (RACE_WEEK, provisional): d0 2027-03-01  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d1 2027-03-02  RUN EASY 25min (EASY) | d3 2027-03-04  RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d4 STRENGTH REST_BY_DESIGN | d6 2027-03-07  RUN RACE 75min (RACE)

### s2 · 2027-03-13T08:00:00+00:00 · RETURN_AFTER_PAUSE (week 5)

- Athlete: 5 report(s): w3-run-d6 done 70min; w4-str-d0 done 16min 3 exercises; w4-run-d3 done 13min; w4-run-d1 done 25min; w4-race done 52min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET) · break `{"startDate":"2027-03-08","endDate":"2027-03-12","reasonCategory":"VACATION","reason":"post-race holiday","nonclinical":true,"episodeId":"after-race"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2027-02-23 to 2027-02-27; 2027-03-08 to 2027-03-12), each its own interruption; the stop read runs from 2027-02-23 to 2027-03-12 through the training recorded between them, which completed no whole week of the plan (no re-entry): moderate nonclinical interruption (18 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 5 (POST_EVENT) from 2027-03-13: d6 RUN REST_BY_DESIGN
- Next week 6 (NEXT_BLOCK, provisional): d0 2027-03-15  STRENGTH_FULL_A 19min: goblet-squat 1x8 RIR4 establish; db-floor-press 1x8 RIR4 establish; db-row 1x8 RIR4 establish; db-calf-raise 1x10 RIR4 establish; dead-bug 1x10 RIR4 BW | d1 2027-03-16  RUN EASY 15min (EASY) | d3 2027-03-18  RUN EASY 15min (EASY) | d4 2027-03-19  STRENGTH_FULL_B 19min: db-rdl 1x8 RIR4 establish; db-row 1x8 RIR4 establish; db-floor-press 1x8 RIR4 establish; db-split-squat 1x10 RIR4 establish; dead-bug 1x10 RIR4 BW | d6 2027-03-21  RUN LONG 20min (LONG)

**Run stopped:** CORPUS_ERROR `[{"stepId":"s3","message":"fact 0 matches no session: {\"week\":5,\"sport\":\"RUN\",\"day\":6}","detail":{"ref":{"week":5,"sport":"RUN","day":6}}}]` `[]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f32-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f32-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f32-e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f32-e4 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The race touch done at half its minutes is not done, so the race week does not count for running even though the race was finished; the undone optional shakeout decides nothing; strength done in full counts that week for strength only. The work trip is therefore read as its own return for running, with no restored fitness claimed.
- f32-e5 @s2 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- f32-e6 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **NOT_EVALUABLE** (STEP_NOT_EXECUTED (CORPUS_ERROR))

**Independent assessment (author, written before any output).**
- Rationale: Imogen missed most of her taper week on a work trip, cut her race touch in half, skipped the optional shakeout, still finished the 10K, kept lifting, then went on holiday. The race says nothing about restored training capacity by itself.
- Preferred: Apply the holiday with a short, easy return; read running as continuing from the work trip's own return and strength from its executed race-week session; no quality in the first week back.
- Acceptable alternatives: A fully easy post-race week before any next block. / Asking how she felt after the race.
- Concerns: Counting the half race touch as done. / Treating the finished race as proof that full training load can resume. / Letting the undone optional shakeout hold the week.
- Domain notes: Work trip 2027-02-23 to 2027-02-27; race week 2027-03-01 to 2027-03-07 (race 2027-03-07); holiday 2027-03-08 to 2027-03-12. If the coach plans no race touch or shakeout, the bulk facts for them expand to nothing.

## R7D-F33

**Intent.** A half-marathon race week between a work crunch and a trip to friends: the race touch and the race go well, but the strength session and the optional shakeout both report an adverse recovery. Converging adverse responses across sports must hold the week in both sports.

**Tags.** RACE_HALF, RACE_WEEK, POST_RACE, ADVERSE_RESPONSE, RETURN_SHORT, SCHEDULE_CHANGE, TRAVEL, RUN_FIRST, H8, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, TIMEZONE, LATE_REPORTER · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2027-02-15","weeks":8,"asOf":"2027-02-13","tz":-360,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-14","timeGoalMinutes":116}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-03-14","timeGoalMinutes":116},"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":230,"longestRunMinutes":110,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[2],"runMinutes":55,"strengthMinutes":35,"longRunDay":6,"longRunMinutes":120}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK · POST_EVENT · NEXT_BLOCK · NEXT_BLOCK · NEXT_BLOCK
- Week 0 (ESTABLISHMENT): d1 2027-02-16  RUN EASY 55min (EASY) | d2 2027-02-17  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2027-02-18  RUN EASY 55min (EASY) | d6 2027-02-21  RUN LONG 85min (LONG)
- Week 1 (BUILD): d1 2027-02-23  RUN EASY 55min (EASY) | d2 2027-02-24  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d3 2027-02-25  RUN EASY 55min (EASY) | d6 2027-02-28  RUN LONG 85min (LONG)
- Week 2 (SPECIFIC): d1 2027-03-02  RUN EASY 55min (EASY) | d2 2027-03-03  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; push-up 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2027-03-04  RUN EASY 55min (EASY) | d6 2027-03-07  RUN LONG 85min (LONG)
- Week 3 (RACE_WEEK): d1 2027-03-09  RUN EASY 30min (EASY) | d2 2027-03-10  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; push-up 1x10 RIR4 BW; db-row 1x8 RIR4 last logged | d3 2027-03-11  RUN EASY 30min (EASY) | d6 2027-03-14  RUN RACE 150min (RACE)

### s1 · 2027-03-06T08:00:00-06:00 · SCHEDULE_CHANGE (week 2)

- Athlete: 8 report(s): w0-run-d1 done 55min; w0-run-d3 done 55min; w0-run-d6 done 85min; w1-run-d1 done 55min; w1-run-d3 done 55min; w1-run-d6 done 85min; w0-str-d2 done 27min 5 exercises; w1-str-d2 done 27min 5 exercises · changes `{"runTurn":"PM"}` · break `{"startDate":"2027-03-01","endDate":"2027-03-05","reasonCategory":"WORK","reason":"crunch week, no training","nonclinical":true,"episodeId":"crunch"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2027-03-06 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the schedule change is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2027-03-06T14:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F33-s1), not applied yet: `{"startDate":"2027-03-01","endDate":"2027-03-05","reasonCategory":"WORK","reason":"crunch week, no training","nonclinical":true,"episodeId":"crunch"}`
- Current week 2 (SPECIFIC) from 2027-03-06: d6 2027-03-07  RUN LONG 85min (LONG)
- Next week 3 (RACE_WEEK, provisional): d1 2027-03-09  RUN EASY 30min (EASY) | d2 2027-03-10  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; push-up 1x10 RIR4 BW; db-row 1x8 RIR4 last logged | d3 2027-03-11  RUN EASY 30min (EASY) | d6 2027-03-14  RUN RACE 150min (RACE)

### s2 · 2027-03-20T08:00:00-06:00 · RETURN_AFTER_PAUSE (week 4)

- Athlete: 5 report(s): w2-run-d6 done 85min; w3-str-d2 done 16min 3 exercises (recovery=ADVERSE); w3-run-d1 done 30min; w3-run-d3 done 30min; w3-race done 118min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET) · break `{"startDate":"2027-03-16","endDate":"2027-03-19","reasonCategory":"TRAVEL","reason":"visiting friends after the race","nonclinical":true,"episodeId":"visit"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2027-03-01 to 2027-03-05; 2027-03-16 to 2027-03-19), each its own interruption; the stop read runs from 2027-03-16 to 2027-03-19; the break from 2027-03-01 to 2027-03-05 is read as its own return (short, 5 days), as if applied when training resumed on 2027-03-06, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return: short nonclinical interruption (4 days): resume the last completed doses; no step until execution is observed
- Current week 4 (POST_EVENT) from 2027-03-20: d6 RUN REST_BY_DESIGN
- Next week 5 (NEXT_BLOCK, provisional): d1 2027-03-23  RUN EASY 34min (EASY) | d2 2027-03-24  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2027-03-25  RUN EASY 30min (EASY +strides) | d6 2027-03-28  RUN LONG 50min (LONG)

**Run stopped:** CORPUS_ERROR `[{"stepId":"s3","message":"fact 0 matches no session: {\"week\":4,\"sport\":\"RUN\",\"day\":6}","detail":{"ref":{"week":4,"sport":"RUN","day":6}}}]` `[]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f33-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f33-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f33-e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f33-e4 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Adverse recovery in the strength session and in the shakeout converge across sports: the race week re-enters neither sport, although the race touch and race went well; the return is no more aggressive than one read through the crunch week, and nothing is presented as restored fitness.
- f33-e5 @s2 ROLE_ABSENT [DOMAIN_ORACLE]: **FAIL** observed `["5:6:LONG"]`
- f33-e6 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **NOT_EVALUABLE** (STEP_NOT_EXECUTED (CORPUS_ERROR))

**Independent assessment (author, written before any output).**
- Rationale: Diego raced well, but both his strength session and his shakeout left him recovering poorly that week: a whole-body signal, not a one-sport blip. Coming back from a trip after a half marathon, he needs an easy return.
- Preferred: Apply the trip as a return without treating the race week as a re-entry in either sport; plan easy running and light strength for the first week back.
- Acceptable alternatives: Asking how he recovered from the race itself. / A full recovery week before any next block.
- Concerns: Counting the race week for running because the touch and race went well. / Ignoring the shakeout's adverse recovery because shakeouts are optional. / A long run or quality right after.
- Domain notes: Crunch 2027-03-01 to 2027-03-05; race week 2027-03-08 to 2027-03-14 (race 2027-03-14); trip 2027-03-16 to 2027-03-19. Whether the race week holds only the touch, a shakeout and the race is the coach's plan; bulk facts expand to the sessions it has.

## R7D-F34

**Intent.** Three separate named breaks in a chain: between the first two only running is done in full; between the last two the race week has strength done and the race missed. No week counts in both sports.

**Tags.** RACE_10K, RACE_WEEK, MIXED_EXECUTION, SCHEDULE_CHANGE, UNAVAILABLE_DAY, RETURN_SHORT, RUN_FIRST, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, TIMEZONE, LATE_REPORTER · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":12,"asOf":"2026-11-28","tz":-420,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-17"}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2027-01-17"},"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[2,4],"runMinutes":45,"strengthMinutes":40,"longRunDay":6,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT · NEXT_BLOCK · NEXT_BLOCK · NEXT_BLOCK · CONSOLIDATION
- Week 0 (ESTABLISHMENT): d1 2026-12-01  RUN EASY 40min (EASY) | d2 2026-12-02  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-12-03  RUN EASY 40min (EASY) | d4 2026-12-04  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-06  RUN LONG 65min (LONG)
- Week 1 (BUILD): d1 2026-12-08  RUN EASY 40min (EASY) | d2 2026-12-09  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d3 2026-12-10  RUN EASY 40min (EASY) | d4 2026-12-11  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-13  RUN LONG 65min (LONG)
- Week 5 (TAPER): d1 2027-01-05  RUN QUALITY 27min (THRESHOLD 2x5'/2') | d2 2027-01-06  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; db-bench-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2027-01-07  RUN EASY 35min (EASY +strides) | d4 2027-01-08  STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-bench-press 1x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2027-01-10  RUN LONG 45min (LONG)
- Week 6 (RACE_WEEK): d1 2027-01-12  RUN EASY 25min (EASY) | d2 2027-01-13  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; db-bench-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d3 2027-01-14  RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d4 STRENGTH REST_BY_DESIGN | d6 2027-01-17  RUN RACE 75min (RACE)

### s1 · 2026-12-27T21:00:00-07:00 · SCHEDULE_CHANGE (week 3)

- Athlete: 15 report(s): w0-run-d1 done 40min; w0-run-d3 done 40min; w0-run-d6 done 65min; w1-run-d1 done 40min; w1-run-d3 done 40min; w1-run-d6 done 65min; w0-str-d2 done 27min 5 exercises; w0-str-d4 done 27min 5 exercises; w1-str-d2 done 27min 5 exercises; w1-str-d4 done 27min 5 exercises; w3-run-d1 done 34min; w3-run-d3 done 45min; w3-run-d6 done 65min; w3-str-d2 not done; w3-str-d4 not done · changes `{"strengthTurn":"PM"}` · break `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"WORK","reason":"year-end deadline","nonclinical":true,"episodeId":"chain-1"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2026-12-27 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the schedule change is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2026-12-28T04:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F34-s1), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"WORK","reason":"year-end deadline","nonclinical":true,"episodeId":"chain-1"}`
- Current week 3 (SPECIFIC) from 2026-12-27: d6 2026-12-27  RUN LONG 65min (LONG)
- Next week 4 (SPECIFIC, provisional): d1 2026-12-29  RUN QUALITY 41min (THRESHOLD 4x5'/2') | d2 2026-12-30  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; db-bench-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2026-12-31  RUN EASY 45min (EASY +strides) | d4 2027-01-01  STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-bench-press 1x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2027-01-03  RUN LONG 70min (LONG)

### s2 · 2027-01-11T08:00:00-07:00 · UNAVAILABLE_DAY (week 6)

- Athlete: no reports · changes `{"unavailableDates":["2027-01-16"]}` · break `{"startDate":"2026-12-28","endDate":"2027-01-10","reasonCategory":"VACATION","reason":"holidays with family","nonclinical":true,"episodeId":"chain-2"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · new plan
- Reason: A break in training reported on 2027-01-11 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the unavailable day is sent again; until then nothing changes and the plan is not valid; meanwhile the run doses still ahead were stored while the record held no report of the run sessions they depended on; the record now holds those reports, whichever decision recorded them: the sessions still ahead are planned from those facts; completed sessions stay as they were
- Record: break declared 2026-12-28T04:00:00.000Z with a SCHEDULE_CHANGE report (R7D-F34-s1), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"WORK","reason":"year-end deadline","nonclinical":true,"episodeId":"chain-1"}`
- Record: break declared 2027-01-11T15:00:00.000Z with a UNAVAILABLE_DAY report (R7D-F34-s2), not applied yet: `{"startDate":"2026-12-28","endDate":"2027-01-10","reasonCategory":"VACATION","reason":"holidays with family","nonclinical":true,"episodeId":"chain-2"}`
- Current week 6 (RACE_WEEK) from 2027-01-11: d1 2027-01-12  RUN EASY 25min (EASY) | d2 2027-01-13  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 establish; db-bench-press 1x8 RIR4 establish; db-row 1x8 RIR4 establish | d3 2027-01-14  RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d4 STRENGTH REST_BY_DESIGN | d6 2027-01-17  RUN RACE 75min (RACE)
- Next week 7 (POST_EVENT, provisional): d1 2027-01-19  RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d2 2027-01-20  STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; db-bench-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d3 2027-01-21  RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d4 STRENGTH REST_BY_DESIGN | d6 2027-01-24  RUN RECOVERY_EASY 30min (RECOVERY_EASY)

### s3 · 2027-01-22T08:00:00-07:00 · RETURN_AFTER_PAUSE (week 7)

- Athlete: 4 report(s): w6-str-d2 done 16min 3 exercises; w6-run-d1 done 25min; w6-run-d3 done 25min; w6-race not done · break `{"startDate":"2027-01-18","endDate":"2027-01-21","reasonCategory":"FAMILY","reason":"family visit","nonclinical":true,"episodeId":"chain-3"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-14 to 2026-12-20; 2026-12-28 to 2027-01-10; 2027-01-18 to 2027-01-21), each its own interruption; the stop read runs from 2026-12-28 to 2027-01-21 through the training recorded between them, which completed no whole week of the plan (no re-entry); the break from 2026-12-14 to 2026-12-20 is read as its own return (short, 7 days), as if applied when training resumed on 2026-12-21, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return: moderate nonclinical interruption (25 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 7 (POST_EVENT) from 2027-01-22: d4 STRENGTH REST_BY_DESIGN | d6 RUN REST_BY_DESIGN
- Next week 8 (NEXT_BLOCK, provisional): d1 2027-01-26  RUN EASY 15min (EASY) | d2 2027-01-27  STRENGTH_FULL_A 19min: goblet-squat 1x8 RIR4 establish; db-bench-press 1x8 RIR4 establish; db-row 1x8 RIR4 establish; db-calf-raise 1x10 RIR4 establish; dead-bug 1x10 RIR4 BW | d3 2027-01-28  RUN EASY 15min (EASY) | d4 2027-01-29  STRENGTH_FULL_B 19min: db-rdl 1x8 RIR4 establish; db-row 1x8 RIR4 establish; db-bench-press 1x8 RIR4 establish; db-split-squat 1x10 RIR4 establish; dead-bug 1x10 RIR4 BW | d6 2027-01-31  RUN LONG 20min (LONG)

**Run stopped:** CORPUS_ERROR `[{"stepId":"s4","message":"fact 0 matches no session: {\"week\":7,\"sport\":\"STRENGTH\",\"day\":4}","detail":{"ref":{"week":7,"sport":"STRENGTH","day":4}}}]` `[]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f34-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f34-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f34-e3 @s2 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f34-e4 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f34-e5 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f34-e6 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Week 3 counts for running only and the race week (race missed, strength done) for strength only; no week counts in both sports, so neither sport gets a step it did not earn, the breaks' days are never added up, and nothing is presented as restored fitness.
- f34-e7 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **NOT_EVALUABLE** (STEP_NOT_EXECUTED (CORPUS_ERROR))

**Independent assessment (author, written before any output).**
- Rationale: Kim kept running through one week, then took two weeks of holidays, lifted but missed the race in the next week, then visited family. Each sport has evidence of continuity in a different week; neither has a week that shows both.
- Preferred: Return conservatively from the latest break, running from what it executed in week 3 and around it, strength from what the race week executed, without restoring the pre-break progression for either.
- Acceptable alternatives: Asking whether she wants a new race goal after the missed race. / A two-week return.
- Concerns: Adding the three breaks' days into one long stop. / Treating the missed race as a failed session to make up. / Returning both sports to the pre-break plan.
- Domain notes: Breaks 2026-12-14 to 2026-12-20, 2026-12-28 to 2027-01-10, 2027-01-18 to 2027-01-21; week 3 2026-12-21 to 2026-12-27; race week 2027-01-11 to 2027-01-17.

## R7D-F35

**Intent.** A beginner states two touching breaks through two other events, then a week of walk/jog done in full with the optional walks undone and strength missed, then a third break in the week's review. Probes touching breaks as one stop and a one-sport week for a beginner.

**Tags.** RUN_EXP_NONE, STR_EXP_NOVICE, WALK_JOG, MIXED_EXECUTION, SCHEDULE_CHANGE, UNAVAILABLE_DAY, RETURN_MODERATE, BALANCED_HYBRID, NON_RACE, H12, START_NON_MONDAY, TIMEZONE, LATE_REPORTER · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2027-01-17","weeks":12,"asOf":"2027-01-16","tz":-600,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"runMinutesPerWeek":0,"longestRunMinutes":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[1,5],"runMinutes":30,"strengthMinutes":30,"longRunDay":0,"longRunMinutes":40}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-17  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-18  STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d2 2027-01-19  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2027-01-21  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2027-01-22  STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-24  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-25  STRENGTH_FULL_A 24min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW | d2 2027-01-26  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-28  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-29  STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW

### s1 · 2027-02-17T08:00:00-10:00 · UNAVAILABLE_DAY (week 4)

- Athlete: 15 report(s): w0-run-d0 done 20min; w0-run-d2 done 20min; w0-run-d4 done 20min; w1-run-d0 done 21min; w1-run-d2 done 21min; w1-run-d4 done 21min; w2-run-d0 done 23min; w2-run-d2 done 23min; w2-run-d4 done 23min; w0-str-d1 done 12min 3 exercises; w0-str-d5 done 24min 3 exercises; w1-str-d1 done 24min 3 exercises; w1-str-d5 done 24min 3 exercises; w2-str-d1 done 25min 3 exercises; w2-str-d5 done 25min 3 exercises · changes `{"unavailableDates":["2027-02-19"]}` · break `{"startDate":"2027-02-07","endDate":"2027-02-10","reasonCategory":"VACATION","reason":"beach long weekend","nonclinical":true,"episodeId":"v1"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2027-02-17 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the unavailable day is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2027-02-17T18:00:00.000Z with a UNAVAILABLE_DAY report (R7D-F35-s1), not applied yet: `{"startDate":"2027-02-07","endDate":"2027-02-10","reasonCategory":"VACATION","reason":"beach long weekend","nonclinical":true,"episodeId":"v1"}`
- Current week 4 (CONSOLIDATION) from 2027-02-17: d4 2027-02-18  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d5 2027-02-19  STRENGTH_FULL_B 17min: glute-bridge 1x16 RIR3 BW; band-row 1x12 RIR3 BW; incline-push-up 1x16 RIR3 BW
- Next week 5 (DEVELOPMENT, provisional): d0 2027-02-21  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d1 2027-02-22  STRENGTH_FULL_A 29min: box-squat-bodyweight 3x16 RIR3 BW; incline-push-up 2x16 RIR3 BW; band-row 2x12 RIR3 BW | d2 2027-02-23  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d4 2027-02-25  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d5 2027-02-26  STRENGTH_FULL_B 29min: glute-bridge 3x16 RIR3 BW; band-row 2x12 RIR3 BW; incline-push-up 2x16 RIR3 BW

### s2 · 2027-02-17T08:10:00-10:00 · SCHEDULE_CHANGE (week 4)

- Athlete: no reports · changes `{"runTurn":"PM"}` · break `{"startDate":"2027-02-11","endDate":"2027-02-16","reasonCategory":"FAMILY","reason":"looking after my nephew","nonclinical":true,"episodeId":"v2"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2027-02-17 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the schedule change is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2027-02-17T18:00:00.000Z with a UNAVAILABLE_DAY report (R7D-F35-s1), not applied yet: `{"startDate":"2027-02-07","endDate":"2027-02-10","reasonCategory":"VACATION","reason":"beach long weekend","nonclinical":true,"episodeId":"v1"}`
- Record: break declared 2027-02-17T18:10:00.000Z with a SCHEDULE_CHANGE report (R7D-F35-s2), not applied yet: `{"startDate":"2027-02-11","endDate":"2027-02-16","reasonCategory":"FAMILY","reason":"looking after my nephew","nonclinical":true,"episodeId":"v2"}`
- Current week 4 (CONSOLIDATION) from 2027-02-17: d4 2027-02-18  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d5 2027-02-19  STRENGTH_FULL_B 17min: glute-bridge 1x16 RIR3 BW; band-row 1x12 RIR3 BW; incline-push-up 1x16 RIR3 BW
- Next week 5 (DEVELOPMENT, provisional): d0 2027-02-21  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d1 2027-02-22  STRENGTH_FULL_A 29min: box-squat-bodyweight 3x16 RIR3 BW; incline-push-up 2x16 RIR3 BW; band-row 2x12 RIR3 BW | d2 2027-02-23  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d4 2027-02-25  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d5 2027-02-26  STRENGTH_FULL_B 29min: glute-bridge 3x16 RIR3 BW; band-row 2x12 RIR3 BW; incline-push-up 2x16 RIR3 BW

### s3 · 2027-03-06T19:00:00-10:00 · WEEKLY_REVIEW (week 6)

- Athlete: 9 report(s): w4-run-d4 done 28min; w4-str-d5 not done; w5-run-d0 done 28min; w5-run-d2 done 28min; w5-run-d4 done 28min; w5-str-d1 not done; w5-str-d5 not done; w6-run-d0 done 26min; w6-str-d5 done 29min 3 exercises · break `{"startDate":"2027-03-01","endDate":"2027-03-04","reasonCategory":"WORK","reason":"night shifts","nonclinical":true,"episodeId":"v3"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2027-02-07 to 2027-02-10; 2027-02-11 to 2027-02-16; 2027-03-01 to 2027-03-04), each its own interruption; the stop read runs from 2027-03-01 to 2027-03-04; the break from 2027-02-07 to 2027-02-16 is read as its own return (short, 10 days), as if applied when training resumed on 2027-02-17, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return: short nonclinical interruption (4 days): resume the last completed doses; no step until execution is observed
- Current week 6 (DEVELOPMENT) from 2027-03-06: —
- Next week 7 (DEVELOPMENT, provisional): d0 2027-03-07  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d1 2027-03-08  STRENGTH_FULL_A 24min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW | d2 2027-03-09  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d4 2027-03-11  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d5 2027-03-12  STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW

### s4 · 2027-03-13T19:00:00-10:00 · WEEKLY_REVIEW (week 7)

- Athlete: 5 report(s): w7-run-d0 done 28min; w7-run-d2 done 28min; w7-run-d4 done 28min; w7-str-d1 done 24min 3 exercises; w7-str-d5 done 24min 3 exercises
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"WALK_JOG":"ADVANCE","box-squat-bodyweight":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE","glute-bridge":"ADVANCE"}`
- Current week 7 (DEVELOPMENT) from 2027-03-13: —
- Next week 8 (CONSOLIDATION, provisional): d0 2027-03-14  RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d1 2027-03-15  STRENGTH_FULL_A 17min: box-squat-bodyweight 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW; band-row 1x10 RIR3 BW | d2 2027-03-16  RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d4 2027-03-18  RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d5 2027-03-19  STRENGTH_FULL_B 17min: glute-bridge 1x12 RIR3 BW; band-row 1x10 RIR3 BW; incline-push-up 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- f35-e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f35-e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f35-e3 @s2 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- f35-e4 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- f35-e5 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- f35-e6 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The first two breaks touch and form one continuous ten-day stop (2027-02-07 to 2027-02-16); week 5 counts for running only (every walk/jog step done, optional walks deciding nothing, strength missed): running resumes from the walk/jog executed, strength continues from that stop's own return without an unearned step.
- f35-e7 @s3 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- f35-e8 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`

**Independent assessment (author, written before any output).**
- Rationale: Sam is new to running. A long weekend away ran straight into a week of childcare, then a solid week of walk/jog without the optional walks and without strength, then night shifts. The walk/jog week is real progress for running only.
- Preferred: Read the two touching breaks as one stop, credit the walk/jog week to running only, and after the night shifts repeat or gently continue walk/jog and restart strength from its own return level.
- Acceptable alternatives: Asking whether the night shifts will continue before progressing. / Repeating the last completed walk/jog step.
- Concerns: Treating the touching breaks as two short ones. / Holding running because optional walks were skipped. / Progressing strength as if the week had counted for it.
- Domain notes: Day 0 is Sunday (offset -10:00). Breaks 2027-02-07 to 2027-02-10 and 2027-02-11 to 2027-02-16 (touching); week 5 is 2027-02-21 to 2027-02-27; night shifts 2027-03-01 to 2027-03-04.

