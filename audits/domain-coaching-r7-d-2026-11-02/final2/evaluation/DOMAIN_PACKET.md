# R7-D domain-evaluation packet (R7D-FINAL-2)

Runtime R7D-FREEZE-6 (d569ef2), harness R7D-HARNESS-9, first evaluation: true. Corpus sha256 24df57049442e1041f2ba09bdb08fccc4de5ccbd2c894bab680f6d33719c9dba.

Per case: what the case asks, the intake, onboarding, every decision (current week = prescription; next week = provisional projection), automated results, the author's expectations and independent assessment.

## R7D-H01

**Intent.** Cold start of an intermediate runner toward a half marathon in 12 weeks, carried through the build, a taper-week fatigue report, the race and the week after; also a same-day long-run report with day precision.

**Tags.** COLD_START, RUN_FIRST, RACE_HALF, H12, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, TAPER, RACE_WEEK, POST_RACE, FATIGUE_LOCAL, SKIPPED_REVIEW, OFFERS · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":12,"asOf":"2026-11-07","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-24","timeGoalMinutes":125}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-01-24","timeGoalMinutes":125},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":160,"longestRunMinutes":75,"strengthDaysPerWeek":1},"knownRuns":2,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[0,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":40,"longRunDay":6,"longRunMinutes":110}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-09 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-10 AM RUN EASY 45min (EASY) | d3 2026-11-12 AM RUN EASY 45min (EASY) | d4 2026-11-13 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-15 AM RUN LONG 70min (LONG)
- Week 1 (BUILD): d0 2026-11-16 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2026-11-17 AM RUN EASY 45min (EASY) | d3 2026-11-19 AM RUN EASY 45min (EASY) | d4 2026-11-20 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-22 AM RUN LONG 70min (LONG)
- Week 9 (TAPER): d0 2027-01-11 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; incline-push-up 1x14 RIR3 BW; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2027-01-12 AM RUN EASY 35min (EASY +strides) | d3 2027-01-14 AM RUN QUALITY 34min (HALF_MARATHON_SPECIFIC 2x8'/3') | d4 2027-01-15 PM STRENGTH_FULL_B 21min: glute-bridge 1x14 RIR3 BW; db-row 1x8 RIR3 last logged; incline-push-up 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2027-01-17 AM RUN LONG 50min (LONG)
- Week 10 (RACE_WEEK): d0 2027-01-18 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; incline-push-up 1x14 RIR4 BW; db-row 1x8 RIR4 last logged | d1 2027-01-19 AM RUN EASY 25min (EASY) | d3 2027-01-21 AM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d4 STRENGTH REST_BY_DESIGN | d6 2027-01-24  RUN RACE 150min (RACE)

### s1 · 2026-11-15T19:30:00+00:00 · WEEKLY_REVIEW (week 0)

- Athlete: 5 report(s): w0-run-d1 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d6 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) reportedAt 2026-11-15T11:40:00+00:00; w0-str-d0 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 1 load question(s) · new plan
- Reason: The progression rule is unchanged; first logged loads wait for confirmation before they become numbers (db-row)
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","sit-to-stand":"ADVANCE","wall-pushup":"ADVANCE","prone-row-practice":"ADVANCE","supported-calf-raise":"ADVANCE","dead-bug-practice":"ADVANCE","glute-bridge":"ADVANCE","db-row":"ADVANCE","incline-push-up":"ADVANCE","reverse-lunge":"ADVANCE","dead-bug":"ADVANCE"}`
- Current week 0 (ESTABLISHMENT) from 2026-11-15: d6 2026-11-15 AM RUN LONG 70min (LONG)
- Next week 1 (BUILD, provisional): d0 2026-11-16 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2026-11-17 AM RUN EASY 45min (EASY) | d3 2026-11-19 AM RUN EASY 45min (EASY) | d4 2026-11-20 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-22 AM RUN LONG 70min (LONG)

### s2 · 2026-12-20T19:30:00+00:00 · WEEKLY_REVIEW (week 5)

- Athlete: 25 report(s): w1-run-d1 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d6 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d1 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d3 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d6 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d1 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d3 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d6 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d1 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d3 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d6 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d1 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d3 done 41min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d6 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d4 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d4 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d0 done 20min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d4 done 21min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d4 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · client notes NO_OFFER_TO_RESPOND
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 5 (SPECIFIC) from 2026-12-20: d6 2026-12-20 AM RUN LONG 70min (LONG)
- Next week 6 (SPECIFIC, provisional): d0 2026-12-21 PM STRENGTH_FULL_A 28min: goblet-squat 2x8 RIR3 22kg SINGLE_IMPLEMENT; incline-push-up 2x14 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-calf-raise 1x10 RIR3 16kg PER_HAND; dead-bug 1x14 RIR3 BW | d1 2026-12-22 AM RUN EASY 50min (EASY +strides) | d3 2026-12-24 AM RUN QUALITY 42min (HALF_MARATHON_SPECIFIC 2x12'/3') | d4 2026-12-25 PM STRENGTH_FULL_B 29min: glute-bridge 2x14 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; incline-push-up 2x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2026-12-27 AM RUN LONG 75min (LONG)

### s3 · 2027-01-14T07:00:00+00:00 · LOCAL_FATIGUE (week 9)

- Athlete: no reports · signals `{"region":"LOWER"}`
- Coach: **MODIFY** / REDUCE · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Remove only optional local work for the affected region; essentials stay
- Current week 9 (TAPER) from 2027-01-14: d3 2027-01-14 AM RUN QUALITY 34min (HALF_MARATHON_SPECIFIC 2x8'/3') | d4 2027-01-15 PM STRENGTH_FULL_B 19min: glute-bridge 1x14 RIR3 BW; db-row 1x8 RIR3 18kg PER_HAND; incline-push-up 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2027-01-17 AM RUN LONG 50min (LONG)
- Next week 10 (RACE_WEEK, provisional): d0 2027-01-18 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 22kg SINGLE_IMPLEMENT; incline-push-up 1x14 RIR4 BW; db-row 1x8 RIR4 18kg PER_HAND | d1 2027-01-19 AM RUN EASY 25min (EASY) | d3 2027-01-21 AM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d4 STRENGTH REST_BY_DESIGN | d6 2027-01-24  RUN RACE 150min (RACE)

### s4 · 2027-01-24T15:00:00+00:00 · WEEKLY_REVIEW (week 10)

- Athlete: 24 report(s): w6-run-d1 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d3 done 42min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d6 done 75min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d1 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d3 done 49min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d6 done 80min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-run-d1 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-run-d3 done 48min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-run-d6 done 80min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w9-run-d1 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w9-run-d3 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w9-run-d6 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w10-race done 150min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w10-run-d1 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w10-run-d3 done 28min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d4 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d4 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-str-d4 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w9-str-d0 done 20min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w9-str-d4 done 19min 4 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w10-str-d0 done 16min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · client notes NO_OFFER_TO_RESPOND
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","db-row":"ADVANCE"}`
- Current week 10 (RACE_WEEK) from 2027-01-24: d6 2027-01-24  RUN RACE 150min (RACE)
- Next week 11 (POST_EVENT, provisional): d0 STRENGTH REST_BY_DESIGN | d1 2027-01-26 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 2027-01-28 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d4 2027-01-29 PM STRENGTH_FULL_B 17min: glute-bridge 1x14 RIR4 BW; db-row 1x8 RIR4 18kg PER_HAND; incline-push-up 1x14 RIR4 BW | d6 2027-01-31 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure · not evaluable: P03 (2), P06 (2)

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"RACE_WEEK"`
- e3 @GENERATE ROLE_PRESENT [INVARIANT_ORACLE]: **PASS** observed `["10:6:RACE"]`
- e4 @GENERATE ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":50,"otherWeek":80}`
- e5 @s2 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The week-0 long run reported on its own day with only a date and an earlier report time is part of the record used at s2 (not lost or treated as unknown).
- e6 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e7 @s3 ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["10:6:RACE"]`
- e8 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — After the fatigue report no taper-week run dose is increased and lower-body strength in the next two days is reduced, removed or kept light.
- e9 @s4 PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"POST_EVENT"`
- e10 @s4 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`

**Independent assessment (author, written before any output).**
- Rationale: An intermediate runner (about 160 min a week, 75-minute long run) has a realistic 12-week path to a half marathon; strength supports running and must not compete with the long run or the taper.
- Preferred: Build the long run gradually from 75 minutes toward race-specific length, keep harder running limited and familiar, keep strength away from the day before the long run, taper over the last one to two weeks with lower volume, ease lower-body strength after the taper calf fatigue while keeping the race, and make the week after the race easy.
- Acceptable alternatives: Keep the taper as planned after the fatigue report and only lighten the next lower-body strength session / A KEEP decision at the fatigue report that tells the athlete to keep the remaining taper runs easy
- Concerns: Adding volume or a hard session in the taper after fatigue / Moving or dropping the race for ordinary local fatigue / Quality running in the week after the half marathon / Losing the same-day long-run report because it has no clock time
- Domain notes: Reviews are skipped between week 0, week 5 and the race week; reports for those weeks arrive in bulk at s2 and s4.

## R7D-H02

**Intent.** A close 10K for an intermediate runner, then a work trip in the taper week and a family visit after the race; the race week between them holds touch, shakeout and race, and both the strength session and the shakeout report adverse recovery.

**Tags.** COLD_START, RUN_FIRST, RACE_10K, H8, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, START_NON_MONDAY, TIMEZONE, RACE_WEEK, POST_RACE, ADVERSE_RESPONSE, RETURN_MODERATE, OFFERS · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":8,"asOf":"2026-11-08","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-20","timeGoalMinutes":50}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2026-12-20","timeGoalMinutes":50},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":60,"strengthDaysPerWeek":1},"knownRuns":2,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4,5],"strengthDays":[0,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":35,"longRunDay":5,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT · NEXT_BLOCK
- Week 0 (ESTABLISHMENT): d0 2026-11-10 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-11 AM RUN EASY 40min (EASY) | d3 2026-11-13 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-11-14 AM RUN EASY 40min (EASY) | d5 2026-11-15 AM RUN LONG 60min (LONG)
- Week 1 (BUILD): d0 2026-11-17 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-18 AM RUN EASY 40min (EASY) | d3 2026-11-20 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2026-11-21 AM RUN EASY 40min (EASY) | d5 2026-11-22 AM RUN LONG 60min (LONG)
- Week 4 (TAPER): d0 2026-12-08 PM STRENGTH_FULL_B 20min: glute-bridge 1x10 RIR3 BW; db-row 1x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-09 AM RUN QUALITY 25min (THRESHOLD 2x4'/2') | d3 2026-12-11 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2026-12-12 AM RUN EASY 35min (EASY +strides) | d5 2026-12-13 AM RUN LONG 40min (LONG)
- Week 5 (RACE_WEEK): d0 2026-12-15 PM STRENGTH_FULL_B 16min: glute-bridge 1x10 RIR4 BW; db-row 1x8 RIR4 last logged; incline-push-up 1x10 RIR4 BW | d1 2026-12-16 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d3 STRENGTH REST_BY_DESIGN | d4 2026-12-19 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d5 2026-12-20  RUN RACE 75min (RACE)

### s1 · 2026-11-23T19:00:00-05:00 · WEEKLY_REVIEW (week 1)

- Athlete: 10 report(s): w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · client notes NO_OFFER_TO_RESPOND
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 2 load question(s) · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged; first logged loads wait for confirmation before they become numbers (goblet-squat, db-calf-raise)
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","glute-bridge":"ADVANCE","db-row":"ADVANCE","incline-push-up":"ADVANCE","reverse-lunge":"ADVANCE","dead-bug":"ADVANCE","goblet-squat":"ADVANCE","db-calf-raise":"ADVANCE"}`
- Current week 1 (BUILD) from 2026-11-23: —
- Next week 2 (SPECIFIC, provisional): d0 2026-11-24 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x10 RIR3 18kg PER_HAND; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-25 AM RUN EASY 40min (EASY) | d3 2026-11-27 PM STRENGTH_FULL_A 28min: goblet-squat 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW; db-row 2x10 RIR3 18kg PER_HAND; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2026-11-28 AM RUN EASY 40min (EASY) | d5 2026-11-29 AM RUN LONG 65min (LONG)

### s2 · 2026-12-07T19:00:00-05:00 · WEEKLY_REVIEW (week 3)

- Athlete: 10 report(s): w2-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d1 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d4 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · client notes NO_OFFER_TO_RESPOND
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","glute-bridge":"ADVANCE","db-row":"ADVANCE","incline-push-up":"ADVANCE","reverse-lunge":"ADVANCE","dead-bug":"ADVANCE","goblet-squat":"ADVANCE","db-calf-raise":"ADVANCE"}`
- Current week 3 (SPECIFIC) from 2026-12-07: —
- Next week 4 (TAPER, provisional): d0 2026-12-08 PM STRENGTH_FULL_B 20min: glute-bridge 1x10 RIR3 BW; db-row 1x10 RIR3 18kg PER_HAND; incline-push-up 1x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-09 AM RUN QUALITY 25min (THRESHOLD 2x4'/2') | d3 2026-12-11 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 22kg SINGLE_IMPLEMENT; incline-push-up 1x10 RIR3 BW; db-row 1x10 RIR3 18kg PER_HAND; db-calf-raise 1x10 RIR3 16kg PER_HAND; dead-bug 1x12 RIR3 BW | d4 2026-12-12 AM RUN EASY 35min (EASY +strides) | d5 2026-12-13 AM RUN LONG 40min (LONG)

### s3 · 2026-12-10T21:00:00-05:00 · WEEKLY_REVIEW (week 4)

- Athlete: no reports · break `{"startDate":"2026-12-08","endDate":"2026-12-14","reasonCategory":"WORK","nonclinical":true,"reason":"work trip abroad the whole week, no training possible"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-11T02:00:00.000Z with a WEEKLY_REVIEW report (R7D-H02-s3), not applied yet: `{"startDate":"2026-12-08","endDate":"2026-12-14","reasonCategory":"WORK","nonclinical":true,"reason":"work trip abroad the whole week, no training possible"}`
- Current week 4 (TAPER) from 2026-12-10: d3 2026-12-11 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 22kg SINGLE_IMPLEMENT; incline-push-up 1x10 RIR3 BW; db-row 1x10 RIR3 18kg PER_HAND; db-calf-raise 1x10 RIR3 16kg PER_HAND; dead-bug 1x12 RIR3 BW | d4 2026-12-12 AM RUN EASY 35min (EASY +strides) | d5 2026-12-13 AM RUN LONG 40min (LONG)
- Next week 5 (RACE_WEEK, provisional): d0 2026-12-15 PM STRENGTH_FULL_B 16min: glute-bridge 1x10 RIR4 BW; db-row 1x10 RIR4 18kg PER_HAND; incline-push-up 1x10 RIR4 BW | d1 2026-12-16 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d3 STRENGTH REST_BY_DESIGN | d4 2026-12-19 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d5 2026-12-20  RUN RACE 75min (RACE)

### s4 · 2026-12-27T18:00:00-05:00 · RETURN_AFTER_PAUSE (week 6)

- Athlete: 4 report(s): w5-run-d1 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d4 done 15min (performance=COMPATIBLE,recovery=ADVERSE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-race done 75min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d0 done 16min 3 exercises (performance=COMPATIBLE,recovery=ADVERSE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-22","endDate":"2026-12-26","reasonCategory":"FAMILY","nonclinical":true,"reason":"family visit after the race","episodeId":"h02-family"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-08 to 2026-12-14; 2026-12-22 to 2026-12-26), each its own interruption; the stop read runs from 2026-12-08 to 2026-12-26 through the training recorded between them, which completed no whole week of the plan (no re-entry): moderate nonclinical interruption (19 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 6 (POST_EVENT) from 2026-12-27: d5 2026-12-27 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)
- Next week 7 (NEXT_BLOCK, provisional): d0 2026-12-29 PM STRENGTH_FULL_B 20min: glute-bridge 1x10 RIR4 BW; db-row 1x10 RIR4 establish; incline-push-up 1x10 RIR4 BW; reverse-lunge 1x12 RIR4 BW; dead-bug 1x12 RIR4 BW | d1 2026-12-30 AM RUN EASY 15min (EASY) | d3 2027-01-01 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR4 establish; incline-push-up 1x10 RIR4 BW; db-row 1x10 RIR4 establish; db-calf-raise 1x10 RIR4 establish; dead-bug 1x12 RIR4 BW | d4 2027-01-02 AM RUN EASY 15min (EASY) | d5 2027-01-03 AM RUN LONG 20min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"RACE_WEEK"`
- e3 @GENERATE ROLE_PRESENT [INVARIANT_ORACLE]: **PASS** observed `["5:5:RACE"]`
- e4 @s3 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- e5 @s3 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e6 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e7 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e8 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The race week is not a re-entry week: its strength session and its shakeout both report adverse recovery, so the return is read from the stop that starts on the work trip first day (8 Dec) and ends on the family visit last day (26 Dec), not from the 5-day visit alone; the running dose ahead is not above what was executed before the trip.
- e9 @s4 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`

**Independent assessment (author, written before any output).**
- Rationale: A close 10K leaves no room for a long build. The race week sits between a work trip and a family visit; the touch and the race went well, but the strength session and the shakeout both recovered badly.
- Preferred: Plan a short sharpening block toward 20 Dec. While the trip is under way, ask and plan nothing. On return, keep the two breaks separate, refuse to treat the race week as a clean re-entry because two sports reported adverse recovery, and plan a conservative return from the combined stop with easy running and light strength first.
- Acceptable alternatives: Ask about the race-week responses before planning the return / A first week back of easy running only, with strength at a light entry
- Concerns: Classing the return by the 5-day family visit alone / Treating the finished race as proof that capacity is restored and resuming quality / Adding the two breaks days together instead of reading the stop / Prescribing during the trip from the stale plan
- Domain notes: —

## R7D-H03

**Intent.** Strength-first intermediate lifter on gym machines with known stack settings: logs exactly as prescribed, then the athlete's own heavier leg-press setting, its confirmation and an equal second log, and a heavier chest-press attempt that missed its target.

**Tags.** COLD_START, STRENGTH_FIRST, GYM, H12, STR_EXP_INTERMEDIATE, RUN_EXP_NOVICE, NON_RACE, LOAD_CONFIRMATION, START_NON_MONDAY, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":12,"asOf":"2026-11-15","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":25,"longestRunMinutes":25,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["leg-press 3x8 120KG MACHINE_STACK","lat-pulldown 3x10 55KG MACHINE_STACK","seated-cable-row 3x10 50KG MACHINE_STACK","machine-chest-press 3x10 45KG MACHINE_STACK"],"equipment":["MACHINES","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,5],"strengthDays":[0,2,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":30,"strengthMinutes":60}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-17 PM STRENGTH_LOWER 31min: leg-press 3x6 RIR3 120kg MACHINE_STACK; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-11-18 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-19 PM STRENGTH_UPPER 36min: seated-cable-row 3x6 RIR3 50kg MACHINE_STACK; machine-chest-press 3x6 RIR3 45kg MACHINE_STACK; lat-pulldown 3x6 RIR3 55kg MACHINE_STACK; push-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-11-21 PM STRENGTH_FULL_B 36min: glute-bridge 2x5 RIR3 BW; seated-cable-row 3x6 RIR3 50kg MACHINE_STACK; machine-chest-press 3x6 RIR3 45kg MACHINE_STACK; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-11-22 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-11-24 PM STRENGTH_LOWER 34min: leg-press 3x6 RIR3 120kg MACHINE_STACK; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-11-25 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-11-26 PM STRENGTH_UPPER 36min: seated-cable-row 3x6 RIR3 50kg MACHINE_STACK; machine-chest-press 3x6 RIR3 45kg MACHINE_STACK; lat-pulldown 3x6 RIR3 55kg MACHINE_STACK; push-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-11-28 PM STRENGTH_FULL_B 39min: glute-bridge 3x5 RIR3 BW; seated-cable-row 3x6 RIR3 50kg MACHINE_STACK; machine-chest-press 3x6 RIR3 45kg MACHINE_STACK; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-11-29 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

### s1 · 2026-11-30T20:00:00+01:00 · WEEKLY_REVIEW (week 1)

- Athlete: 10 report(s): w0-run-d1 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 21min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 21min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 31min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d2 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 34min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d2 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"WALK_JOG":"ADVANCE","leg-press":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","seated-cable-row":"ADVANCE","machine-chest-press":"ADVANCE","lat-pulldown":"ADVANCE","push-up":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-11-30: —
- Next week 2 (DEVELOPMENT, provisional): d0 2026-12-01 PM STRENGTH_LOWER 35min: leg-press 3x6 RIR3 120kg MACHINE_STACK; glute-bridge 3x7 RIR3 BW; reverse-lunge 2x9 RIR3 BW; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d1 2026-12-02 AM RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d2 2026-12-03 PM STRENGTH_UPPER 36min: seated-cable-row 3x6 RIR3 50kg MACHINE_STACK; machine-chest-press 3x6 RIR3 45kg MACHINE_STACK; lat-pulldown 3x6 RIR3 55kg MACHINE_STACK; push-up 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d4 2026-12-05 PM STRENGTH_FULL_B 40min: glute-bridge 3x7 RIR3 BW; seated-cable-row 3x6 RIR3 50kg MACHINE_STACK; machine-chest-press 3x6 RIR3 45kg MACHINE_STACK; reverse-lunge 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d5 2026-12-06 AM RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk))

### s2 · 2026-12-07T20:00:00+01:00 · WEEKLY_REVIEW (week 2)

- Athlete: 5 report(s): w2-run-d1 done 23min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 23min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 35min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d2 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d4 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"WALK_JOG":"ADVANCE","leg-press":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","seated-cable-row":"ADVANCE","machine-chest-press":"ADVANCE","lat-pulldown":"ADVANCE","push-up":"ADVANCE"}`
- Current week 2 (DEVELOPMENT) from 2026-12-07: —
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-08 PM STRENGTH_LOWER 36min: leg-press 3x6 RIR3 next machine setting above 120kg (else 120kg x6); glute-bridge 3x9 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2026-12-09 AM RUN WALK_JOG 26min (WALK_JOG 5x(90s jog/120s walk)) | d2 2026-12-10 PM STRENGTH_UPPER 37min: seated-cable-row 3x6 RIR3 next machine setting above 50kg (else 50kg x6); machine-chest-press 3x6 RIR3 next machine setting above 45kg (else 45kg x6); lat-pulldown 3x6 RIR3 next machine setting above 55kg (else 55kg x6); push-up 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2026-12-12 PM STRENGTH_FULL_B 41min: glute-bridge 3x9 RIR3 BW; seated-cable-row 3x6 RIR3 next machine setting above 50kg (else 50kg x6); machine-chest-press 3x6 RIR3 next machine setting above 45kg (else 45kg x6); reverse-lunge 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2026-12-13 AM RUN WALK_JOG 26min (WALK_JOG 5x(90s jog/120s walk))

### s3 · 2026-12-14T20:00:00+01:00 · WEEKLY_REVIEW (week 3)

- Athlete: 5 report(s): w3-run-d1 done 26min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d5 done 26min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d0 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d2 done 37min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d4 done 2 exercises (performance=UNDER,recovery=COMPATIBLE,effort=HARDER) · client notes NO_LOAD_QUESTION_TO_CONFIRM
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 2 load question(s) · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"WALK_JOG":"ADVANCE","leg-press":"ADVANCE","glute-bridge":"HOLD","reverse-lunge":"HOLD","standing-calf-raise":"ADVANCE","dead-bug":"HOLD","seated-cable-row":"HOLD","machine-chest-press":"HOLD","lat-pulldown":"ADVANCE","push-up":"ADVANCE"}`
- Current week 3 (DEVELOPMENT) from 2026-12-14: —
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-15 PM STRENGTH_LOWER 24min: leg-press 2x6 RIR3 120kg MACHINE_STACK; glute-bridge 2x9 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-16 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d2 2026-12-17 PM STRENGTH_UPPER 25min: seated-cable-row 2x6 RIR3 50kg MACHINE_STACK; machine-chest-press 2x6 RIR3 45kg MACHINE_STACK; lat-pulldown 2x6 RIR3 55kg MACHINE_STACK; push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-19 PM STRENGTH_FULL_B 28min: glute-bridge 2x9 RIR3 BW; seated-cable-row 2x6 RIR3 50kg MACHINE_STACK; machine-chest-press 2x6 RIR3 45kg MACHINE_STACK; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-20 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE JUDGED [DOMAIN_ORACLE]: **JUDGED** — Known machine rows are prescribed in kilograms in the MACHINE_STACK convention at the known settings; the coach states no machine number of its own, and the small easy running dose does not precede the heaviest lower-body session.
- e3 @s2 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The 130 kg leg-press setting logged once without confirmation is not yet the reference: one load question is asked (loadQuestions) and the earlier settings are kept.
- e4 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — After the confirmation 130 kg is the leg-press reference; the 55 kg chest-press attempt that missed its repetitions with no reserve does not become the chest-press reference and no heavier chest-press setting is prescribed from it.
- e5 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`

**Independent assessment (author, written before any output).**
- Rationale: An intermediate lifter whose priority is strength, with known machine stack settings, and a small general running goal.
- Preferred: Prescribe the known machine settings in kilograms as stated, progress a machine by asking for its next heavier setting rather than computing one, adopt a heavier setting only after the athlete confirms it or logs it again from a session that met target, and ignore a heavier attempt that missed its target.
- Acceptable alternatives: Keep the known settings for the first weeks and progress repetitions first / Ask a question about the failed chest-press attempt before progressing that row
- Concerns: Inventing a stack number such as +5 kg on a machine / Adopting a single unconfirmed heavier log as the reference / Raising the chest press after sets with no reserve and missed repetitions
- Domain notes: Heavier settings are stated only for the squat pattern, whose only loaded option with this equipment is the leg press; the explicit Saturday log names the known machine ids. Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H04

**Intent.** Balanced intermediate hybrid with running in the morning and strength in the evening on shared days; probes duplicate phone and watch reports, an in-time and a late correction, an exact re-send and a one-day double conflict confirmed in the same turn.

**Tags.** COLD_START, BALANCED_HYBRID, SHARED_DAYS, SAME_TURN, DOUBLE_CONFLICT, GYM, H8, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, DUPLICATE_SOURCES, CORRECTION, START_NON_MONDAY, TIMEZONE, WEARABLE_FULL · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":8,"asOf":"2026-11-10","tz":600,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":65,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","RACK","BENCH","DUMBBELLS","MACHINES"],"pause":null,"wearable":"PARTIAL","history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[0,4,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":60,"longRunDay":2,"longRunMinutes":75}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-12 AM RUN EASY 40min (EASY) | d0 2026-11-12 PM STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-11-14 AM RUN LONG 65min (LONG) | d4 2026-11-16 AM RUN EASY 40min (EASY) | d4 2026-11-16 PM STRENGTH_UPPER 29min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2026-11-17 PM STRENGTH_FULL_B 31min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-11-19 AM RUN EASY 40min (EASY) | d0 2026-11-19 PM STRENGTH_LOWER 34min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x8 RIR3 last logged; leg-extension-machine 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d2 2026-11-21 AM RUN LONG 65min (LONG) | d4 2026-11-23 AM RUN EASY 40min (EASY) | d4 2026-11-23 PM STRENGTH_UPPER 34min: db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d5 2026-11-24 PM STRENGTH_FULL_B 38min: db-rdl 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged

### s1 · 2026-11-18T20:00:00+10:00 · WEEKLY_REVIEW (week 0)

- Athlete: 7 report(s): w0-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via phone-app; w0-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-11-12T06:10:00+10:00 via wristwatch; w0-run-d2 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 31min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 2 load question(s) · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged; first logged loads wait for confirmation before they become numbers (goblet-squat, db-calf-raise)
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-bench-press":"ADVANCE","db-row":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE"}`
- Current week 0 (ESTABLISHMENT) from 2026-11-18: —
- Next week 1 (DEVELOPMENT, provisional): d0 2026-11-19 AM RUN EASY 40min (EASY) | d0 2026-11-19 PM STRENGTH_LOWER 34min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x8 RIR3 75kg PER_HAND; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d2 2026-11-21 AM RUN LONG 65min (LONG) | d4 2026-11-23 AM RUN EASY 40min (EASY) | d4 2026-11-23 PM STRENGTH_UPPER 34min: db-bench-press 3x8 RIR3 62.5kg PER_HAND; db-row 3x8 RIR3 55kg PER_HAND; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2026-11-24 PM STRENGTH_FULL_B 38min: db-rdl 3x8 RIR3 75kg PER_HAND; db-row 3x8 RIR3 55kg PER_HAND; db-bench-press 3x8 RIR3 62.5kg PER_HAND; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish

### s2 · 2026-11-24T07:00:00+10:00 · DOUBLE_CONFLICT (week 1)

- Athlete: no reports · changes `{"from":"2026-11-30","to":"2026-11-30","runTurn":"PM","strengthTurn":"PM","sameTurnConfirmed":true}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The change is stated for 2026-11-30 only; a dated window of days or shifts is not re-planned automatically. Say whether the change is permanent from a date, or move or skip the affected sessions
- Current week 1 (DEVELOPMENT) from 2026-11-24: d5 2026-11-24 PM STRENGTH_FULL_B 38min: db-rdl 3x8 RIR3 75kg PER_HAND; db-row 3x8 RIR3 55kg PER_HAND; db-bench-press 3x8 RIR3 62.5kg PER_HAND; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish
- Next week 2 (DEVELOPMENT, provisional): d0 2026-11-26 AM RUN EASY 40min (EASY) | d0 2026-11-26 PM STRENGTH_LOWER 35min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x10 RIR3 75kg PER_HAND; leg-extension-machine 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d2 2026-11-28 AM RUN LONG 65min (LONG) | d4 2026-11-30 AM RUN EASY 40min (EASY) | d4 2026-11-30 PM STRENGTH_UPPER 36min: db-bench-press 3x10 RIR3 62.5kg PER_HAND; db-row 3x10 RIR3 55kg PER_HAND; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d5 2026-12-01 PM STRENGTH_FULL_B 40min: db-rdl 3x10 RIR3 75kg PER_HAND; db-row 3x10 RIR3 55kg PER_HAND; db-bench-press 3x10 RIR3 62.5kg PER_HAND; leg-curl-machine 2x10 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged

### s3 · 2026-11-25T20:00:00+10:00 · WEEKLY_REVIEW (week 1)

- Athlete: 9 report(s): w1-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 30min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) corrects h04-w1-thu; w1-run-d2 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 34min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 34min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 38min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) corrects h04-w0-long; w0-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via phone-app
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"ADVANCE","EASY":"HOLD","goblet-squat":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-bench-press":"ADVANCE","db-row":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-11-25: —
- Next week 2 (DEVELOPMENT, provisional): d0 2026-11-26 AM RUN EASY 40min (EASY) | d0 2026-11-26 PM STRENGTH_LOWER 36min: goblet-squat 3x10 RIR3 80kg SINGLE_IMPLEMENT; db-rdl 3x10 RIR3 75kg PER_HAND; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x12 RIR3 20kg PER_HAND; dead-bug 2x12 RIR3 BW | d2 2026-11-28 AM RUN LONG 65min (LONG) | d4 2026-11-30 AM RUN EASY 40min (EASY) | d4 2026-11-30 PM STRENGTH_UPPER 36min: db-bench-press 3x10 RIR3 62.5kg PER_HAND; db-row 3x10 RIR3 55kg PER_HAND; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x12 RIR3 BW | d5 2026-12-01 PM STRENGTH_FULL_B 40min: db-rdl 3x10 RIR3 75kg PER_HAND; db-row 3x10 RIR3 55kg PER_HAND; db-bench-press 3x10 RIR3 62.5kg PER_HAND; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE JUDGED [INVARIANT_ORACLE]: **JUDGED** — On Thursday and Monday the run is in the morning and strength in the evening as chosen; no day puts both sports in the same turn without the athlete's confirmation.
- e3 @s1 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The phone and watch reports of the week-0 Thursday run are one session, counted once.
- e4 @s2 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"ASK"`
- e5 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Only Monday of week 2 puts both sessions in the evening, as confirmed; the other days keep their turns.
- e6 @s3 JUDGED [INVARIANT_ORACLE]: **JUDGED** — Week-1 Thursday counts as 30 minutes (the in-time correction); the week-0 long run counts as 45 minutes for future dosing without rewriting what week 0 decided; the re-sent phone report is not counted again; the next long run is not progressed from the uncorrected 60 minutes.

**Independent assessment (author, written before any output).**
- Rationale: A balanced intermediate hybrid sharing two days split by turn. The data are messy in ordinary ways: two devices, a corrected duration, a late correction of a long run and a re-sent report.
- Preferred: Keep runs in the morning and strength in the evening on shared days; count the Thursday run once; use the corrected 30 minutes for week 1 and the corrected 45-minute week-0 long run for what comes next while leaving earlier decisions untouched; ignore the re-send; accept the confirmed Monday same-turn day only for that date.
- Acceptable alternatives: Ask the athlete which week-0 long-run duration is right before progressing it / Keep the plan unchanged at the double conflict and simply move next Monday's turns
- Concerns: Counting the duplicate or the re-send as extra training / Progressing the long run from 60 minutes after the correction / Rewriting the week-0 decision / Applying the same-turn change to other Mondays
- Domain notes: The double conflict concerns Monday of week 2 and is sent on Tuesday of week 1, after every week-1 session named at s3 had taken place. Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H05

**Intent.** A 4-week general block for a novice: a skill-mismatch substitution, then a pain substitution named by pattern that also states a travel break, a qualified clearance, a review that does not restate the break, and a schedule change in the last week.

**Tags.** COLD_START, GENERAL_FITNESS, H4, RUN_EXP_NOVICE, STR_EXP_NOVICE, NON_RACE, START_NON_MONDAY, TIMEZONE, SUBSTITUTION, SUBSTITUTION_PAIN_CLEARANCE, CLINICAL_SIGNAL, CLINICAL_PAUSE, SCHEDULE_CHANGE, RETURN_SHORT, TRAVEL · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-13","weeks":4,"asOf":"2026-11-11","tz":330,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":50,"longestRunMinutes":30,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4],"strengthDays":[0,3],"runMinutes":35,"strengthMinutes":40}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-13  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-14  RUN EASY 20min (EASY) | d3 2026-11-16  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-17  RUN LONG 30min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-20  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-21  RUN EASY 20min (EASY) | d3 2026-11-23  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-24  RUN LONG 30min (LONG)

### s1 · 2026-11-20T18:00:00+05:30 · EXERCISE_SUBSTITUTION (week 1)

- Athlete: no reports · substitution `{"reason":"SKILL_MISMATCH","text":"heels lift and the knees cave in, cannot keep steady technique","exerciseId":"goblet-squat"}`
- Coach: **MODIFY** / SUBSTITUTE_FOR_REASON · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: goblet-squat is replaced by box-squat-bodyweight (cannot be done with steady technique); the new exercise starts with effort-guided establishment, nothing is converted
- Current week 1 (DEVELOPMENT) from 2026-11-20: d0 2026-11-20  STRENGTH_FULL_A 28min: box-squat-bodyweight 2x10 RIR3 BW; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-21  RUN EASY 20min (EASY) | d3 2026-11-23  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-24  RUN LONG 30min (LONG)
- Next week 2 (DEVELOPMENT, provisional): d0 2026-11-27  STRENGTH_FULL_A 29min: box-squat-bodyweight 2x12 RIR3 BW; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d1 2026-11-28  RUN EASY 20min (EASY) | d3 2026-11-30  STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d4 2026-12-01  RUN LONG 35min (LONG)

### s2 · 2026-11-30T18:30:00+05:30 · EXERCISE_SUBSTITUTION (week 2)

- Athlete: no reports · break `{"startDate":"2026-11-25","endDate":"2026-11-29","reasonCategory":"TRAVEL","nonclinical":true,"reason":"trip to a wedding, no training"}` · substitution `{"reason":"NONCLINICAL_DISCOMFORT_OR_PREFERENCE","pain":true,"text":"sharp pain at the front of the knee on squats today","exerciseId":"box-squat-bodyweight"}`
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: Pain, injury, illness or a functional limitation with box-squat-bodyweight routes to qualified human assessment; no exercise is substituted as a remedy
- Record: break declared 2026-11-30T13:00:00.000Z with a EXERCISE_SUBSTITUTION report (R7D-H05-s2), not applied yet: `{"startDate":"2026-11-25","endDate":"2026-11-29","reasonCategory":"TRAVEL","nonclinical":true,"reason":"trip to a wedding, no training"}`
- Current week 2 (DEVELOPMENT) from 2026-11-30: d3 2026-11-30  STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d4 2026-12-01  RUN LONG 35min (LONG)
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-04  STRENGTH_FULL_A 29min: box-squat-bodyweight 2x14 RIR3 BW; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2026-12-05  RUN EASY 25min (EASY +strides) | d3 2026-12-07  STRENGTH_FULL_B 29min: glute-bridge 2x14 RIR3 BW; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d4 2026-12-08  RUN LONG 35min (LONG)

### s3 · 2026-12-03T19:00:00+05:30 · WEEKLY_REVIEW (week 2)

- Athlete: qualified clearance · 8 report(s): w0-run-d1 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 30min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 30min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · client notes QUALIFIED_CLEARANCE_APPLIED
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: The break reported on 2026-11-30 is on record and applied now: short nonclinical interruption (5 days): resume the last completed doses; no step until execution is observed
- Current week 2 (DEVELOPMENT) from 2026-12-03: —
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-04  STRENGTH_FULL_A 28min: box-squat-bodyweight 2x10 RIR3 BW; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-05  RUN EASY 20min (EASY) | d3 2026-12-07  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-08  RUN LONG 30min (LONG)

### s4 · 2026-12-05T08:00:00+05:30 · SCHEDULE_CHANGE (week 3)

- Athlete: no reports · changes `{"runDays":[1,5]}`
- Coach: **HOLD** / HOLD · REQUIRES_RECONCILIATION
- Reason: Malformed review facts: Cannot read properties of undefined (reading 'sessions')
- Current week 3 (DEVELOPMENT) from 2026-12-05: d1 2026-12-05  RUN EASY 20min (EASY) | d3 2026-12-07  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-08  RUN LONG 30min (LONG)

### s5 · 2026-12-10T19:00:00+05:30 · WEEKLY_REVIEW (week 3)

- Athlete: 4 report(s): w3-run-d1 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d4 done 30min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Final week of the horizon; record outcomes for the next program
- Current week 3 (DEVELOPMENT) from 2026-12-10: —

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE ROLE_ABSENT [INVARIANT_ORACLE]: **PASS** observed `[]`
- e3 @s1 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e4 @s1 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The replacement is a squat-pattern exercise of lower technical demand within bodyweight or dumbbells; nothing outside the catalog or the equipment is invented.
- e5 @s2 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- e6 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e7 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e8 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e9 @s3 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The kept 5-day travel break is applied without the athlete stating it again, as a short return; the plan from before the break is not reused as if nothing happened, and the squat substitution from week 1 is kept.
- e10 @s4 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"HOLD"`
- e11 @s5 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- e12 @s5 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The travel break is not applied again and no clinical route reopens without a new clinical signal.

**Independent assessment (author, written before any output).**
- Rationale: A novice in a 4-week general block. A squat that cannot be done with steady technique is a skill issue; knee pain on squats a week later is clinical, and the athlete also mentions a wedding trip.
- Preferred: Swap the squat for an easier squat variant; on the pain report route to a qualified human and prescribe nothing; after the physiotherapist clears, apply the 5-day travel break as a short return without asking the athlete to state it again; refuse the last-week schedule change.
- Acceptable alternatives: At s3, ask a short question about the knee before planning, as long as the clinical route is not reopened without a clinical signal / At s4, keep the plan and explain that the block ends this week
- Concerns: Treating the knee pain as a preference and swapping the exercise / Planning around the travel break while the pain route stands / Requiring the athlete to state the trip again after clearance / Accepting a schedule change in the last week as a new plan
- Domain notes: The substitutions name their exercise by pattern only (delta 8 section 2). The week-2 reference resolves to the first week-2 strength session holding a squat-pattern exercise.

## R7D-H06

**Intent.** An absolute beginner with bodyweight only returns on a Thursday from a one-week family break, after reporting that the Monday to Wednesday sessions of that week were not done.

**Tags.** COLD_START, GENERAL_FITNESS, BODYWEIGHT_ONLY, H8, RUN_EXP_NONE, STR_EXP_NONE, WALK_JOG, RETURN_SHORT, START_NON_MONDAY, TIMEZONE, LOW_DATA · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":8,"asOf":"2026-11-13","tz":-480,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":null,"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":52,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[2,4],"runMinutes":30,"strengthMinutes":30}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-16  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-17  STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d3 2026-11-18  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-11-19  STRENGTH_FULL_B 21min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d5 2026-11-20  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d1 2026-11-23  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-11-24  STRENGTH_FULL_A 21min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d3 2026-11-25  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-11-26  STRENGTH_FULL_B 21min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d5 2026-11-27  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

### s1 · 2026-11-28T18:00:00-08:00 · WEEKLY_REVIEW (week 1)

- Athlete: 10 report(s): w0-run-d1 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 21min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 21min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 21min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d2 done 12min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 21min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d2 done 21min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 21min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"WALK_JOG":"ADVANCE","box-squat-bodyweight":"ADVANCE","incline-push-up":"ADVANCE","prone-ytw-raise":"ADVANCE","glute-bridge":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-11-28: —
- Next week 2 (DEVELOPMENT, provisional): d1 2026-11-30  RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d2 2026-12-01  STRENGTH_FULL_A 22min: box-squat-bodyweight 2x12 RIR3 BW; incline-push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW | d3 2026-12-02  RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d4 2026-12-03  STRENGTH_FULL_B 22min: glute-bridge 2x12 RIR3 BW; incline-push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW | d5 2026-12-04  RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk))

### s2 · 2026-12-10T07:00:00-08:00 · RETURN_AFTER_PAUSE (week 3)

- Athlete: 3 report(s): w3-run-d1 not done; w3-str-d2 not done; w3-run-d3 not done · break `{"startDate":"2026-11-29","endDate":"2026-12-05","reasonCategory":"FAMILY","nonclinical":true,"reason":"visiting my daughter, no exercise that week"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: short nonclinical interruption (7 days): resume the last completed doses; no step until execution is observed
- Current week 3 (DEVELOPMENT) from 2026-12-10: d4 2026-12-10  STRENGTH_FULL_B 21min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d5 2026-12-11  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Next week 4 (CONSOLIDATION, provisional): d1 2026-12-14  RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d2 2026-12-15  STRENGTH_FULL_A 16min: box-squat-bodyweight 1x10 RIR3 BW; incline-push-up 1x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW | d3 2026-12-16  RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d4 2026-12-17  STRENGTH_FULL_B 16min: glute-bridge 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW | d5 2026-12-18  RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["0:1:WALK_JOG","0:3:WALK_JOG","0:5:WALK_JOG"]`
- e3 @GENERATE ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- e4 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e5 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e6 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The Monday to Wednesday sessions are not credited; the walk/jog dose ahead is not above the last completed week-1 dose, and bodyweight strength resumes at a light entry.

**Independent assessment (author, written before any output).**
- Rationale: A 52-year-old with no running or strength background, bodyweight only. A week away and three more days off are a short stop for a beginner whose base is two weeks old.
- Preferred: Start with walking or walk/jog and simple bodyweight patterns; on the Thursday return, credit nothing from Monday to Wednesday, resume walk/jog at or slightly below the last completed level and strength at a light entry.
- Acceptable alternatives: Repeat week 1 exactly / Resume at the last completed level if the athlete reports feeling normal
- Concerns: Progressing as if weeks 2 and 3 had been done / Continuous running or harder running for this athlete / Compressing the missed sessions into the rest of the week
- Domain notes: —

## R7D-H07

**Intent.** A non-runner builds from walk/jog toward a 10K over 16 weeks; a fully executed week sits between a family break and a run of night shifts, with the optional brisk walks of that week left undone.

**Tags.** COLD_START, RACE_10K, H16, RUN_EXP_NONE, STR_EXP_NOVICE, WALK_JOG, START_NON_MONDAY, RETURN_SHORT, BODYWEIGHT_ONLY, FREQ_HIGH · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":16,"asOf":"2026-11-09","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-28"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-02-28"},"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"runMinutesPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4,5],"strengthDays":[1,6],"runMinutes":40,"strengthMinutes":30,"longRunDay":4,"longRunMinutes":50}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-11  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-12  STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d2 2026-11-13  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-11-15  RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-16  RUN WALK 20min (WALK) | d6 2026-11-17  STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW
- Week 1 (BUILD): d0 2026-11-18  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-11-19  STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW | d2 2026-11-20  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-11-22  RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-11-23  RUN WALK 20min (WALK) | d6 2026-11-24  STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW
- Week 14 (TAPER): d0 2027-02-17  RUN EASY 25min (EASY +strides) | d1 2027-02-18  STRENGTH_FULL_A 17min: box-squat-bodyweight 1x14 RIR3 BW; incline-push-up 1x14 RIR3 BW; band-row 1x10 RIR3 BW | d2 2027-02-19  RUN EASY 25min (EASY +strides) | d4 2027-02-21  RUN EASY 25min (EASY +strides) | d5 2027-02-22  RUN EASY 15min (EASY) | d6 2027-02-23  STRENGTH_FULL_B 17min: glute-bridge 1x14 RIR4 BW; band-row 1x10 RIR4 BW; incline-push-up 1x14 RIR4 BW
- Week 15 (RACE_WEEK): d0 2027-02-24  RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d2 2027-02-26  RUN EASY 15min (EASY) | d4 2027-02-28  RUN RACE 75min (RACE, completion) | d5 RUN REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

### s1 · 2026-12-06T19:00:00+00:00 · WEEKLY_REVIEW (week 3)

- Athlete: 18 report(s): w0-run-d0 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 21min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 21min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 21min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d0 done 23min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d2 done 23min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d4 done 23min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 12min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d6 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d1 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d6 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d1 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d6 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-02","endDate":"2026-12-08","reasonCategory":"FAMILY","nonclinical":true,"reason":"caring for my mother after her operation"}`
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: The interruption reason is clinical or possibly clinical (operation): qualified assessment is needed; no nonclinical return recipe
- Record: break declared 2026-12-06T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-H07-s1), not applied yet: `{"startDate":"2026-12-02","endDate":"2026-12-08","reasonCategory":"FAMILY","nonclinical":true,"reason":"caring for my mother after her operation"}`
- Current week 3 (BUILD) from 2026-12-06: d4 2026-12-06  RUN WALK_JOG 26min (WALK_JOG 5x(90s jog/120s walk)) | d5 2026-12-07  RUN WALK 20min (WALK) | d6 2026-12-08  STRENGTH_FULL_B 25min: glute-bridge 2x12 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x12 RIR3 BW
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-09  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d1 2026-12-10  STRENGTH_FULL_A 17min: box-squat-bodyweight 1x14 RIR3 BW; incline-push-up 1x14 RIR3 BW; band-row 1x10 RIR3 BW | d2 2026-12-11  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d4 2026-12-13  RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d5 2026-12-14  RUN WALK 20min (WALK) | d6 2026-12-15  STRENGTH_FULL_B 17min: glute-bridge 1x14 RIR3 BW; band-row 1x10 RIR3 BW; incline-push-up 1x14 RIR3 BW

### s2 · 2026-12-22T18:00:00+00:00 · RETURN_AFTER_PAUSE (week 5)

- Athlete: 6 report(s): w4-run-d0 done 28min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d2 done 28min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d4 done 28min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d5 not done; w4-str-d1 done 17min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d6 done 17min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-16","endDate":"2026-12-21","reasonCategory":"WORK","nonclinical":true,"reason":"six night shifts covering a colleague","episodeId":"h07-shifts"}`
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: A prior clinical dependency remains outside this nonclinical reference; no automatic clearance
- Record: break declared 2026-12-06T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-H07-s1), not applied yet: `{"startDate":"2026-12-02","endDate":"2026-12-08","reasonCategory":"FAMILY","nonclinical":true,"reason":"caring for my mother after her operation"}`
- Record: break declared 2026-12-22T18:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H07-s2), not applied yet: `{"startDate":"2026-12-16","endDate":"2026-12-21","reasonCategory":"WORK","nonclinical":true,"reason":"six night shifts covering a colleague","episodeId":"h07-shifts"}`
- Current week 5 (BUILD) from 2026-12-22: d6 2026-12-22  STRENGTH_FULL_B 28min: glute-bridge 3x14 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x14 RIR3 BW
- Next week 6 (BUILD, provisional): d0 2026-12-23  RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d1 2026-12-24  STRENGTH_FULL_A 28min: box-squat-bodyweight 3x14 RIR3 BW; incline-push-up 2x14 RIR3 BW; band-row 2x10 RIR3 BW | d2 2026-12-25  RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d4 2026-12-27  RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d5 2026-12-28  RUN WALK 20min (WALK) | d6 2026-12-29  STRENGTH_FULL_B 28min: glute-bridge 3x14 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x14 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["0:0:WALK_JOG","0:2:WALK_JOG","0:4:WALK_JOG","0:5:WALK"]`
- e3 @GENERATE ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- e4 @GENERATE ROLE_PRESENT [INVARIANT_ORACLE]: **PASS** observed `["15:4:RACE"]`
- e5 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e6 @s2 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"CLINICAL_HUMAN_REQUIRED"`
- e7 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **FAIL** observed `"REQUIRES_RECONCILIATION"`
- e8 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Week 4 counts as a re-entry week in both sports: every walk/jog session and every strength session was done as prescribed and tolerated, and the undone optional walks do not decide the week. The family break is history; the return is classed by the 6-day shift break alone and continues walk/jog from what was executed, without a jump to continuous running.

**Independent assessment (author, written before any output).**
- Rationale: A woman with no running background aims at a 10K in 16 weeks with four chosen run days; walk/jog fills some days and optional brisk walks the others. Between a family break and night shifts she did every walk/jog and strength session of week 4 but skipped the optional walks.
- Preferred: Build walk/jog gradually with optional walks on the extra days; while the family break is under way, plan nothing; on return read week 4 as a full week executed in both sports, treat the earlier break as history, and resume walk/jog from the week-4 doses after a short-break return.
- Acceptable alternatives: Repeat the week-4 walk/jog step once before progressing / Ask how the night shifts affected sleep before choosing the first dose
- Concerns: Treating the skipped optional walks as missed training that blocks re-entry / Reading the stop from the family break's first day / Progressing to continuous running right after the return
- Domain notes: —

## R7D-H08

**Intent.** An athlete experienced in both sports states four separate breaks before any return: a trade fair touching client meetings, then a family emergency, then a quarter-end close; the week between the second and third holds only strength done in full, the week between the third and fourth only running.

**Tags.** COLD_START, BALANCED_HYBRID, RUN_EXP_EXPERIENCED, STR_EXP_EXPERIENCED, GYM, H16, FREQ_HIGH, NON_RACE, RETURN_SHORT, OFFERS, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":16,"asOf":"2026-11-07","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":260,"longestRunMinutes":100,"strengthDaysPerWeek":3},"knownRuns":2,"knownExercises":["back-squat 4x5 130KG TOTAL","barbell-rdl 3x6 120KG TOTAL","bench-press 4x5 90KG TOTAL","barbell-row 3x8 80KG TOTAL","pull-up 4x6 0KG BODYWEIGHT"],"equipment":["BARBELL","RACK","BENCH","DUMBBELLS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4,6],"strengthDays":[1,3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":60,"strengthMinutes":75,"longRunDay":6,"longRunMinutes":110}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-09 AM RUN EASY 50min (EASY) | d1 2026-11-10 PM STRENGTH_LOWER 37min: back-squat 4x5 RIR3 130kg TOTAL; barbell-rdl 3x6 RIR3 120kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2026-11-11 AM RUN EASY 50min (EASY) | d3 2026-11-12 PM STRENGTH_UPPER 40min: bench-press 4x5 RIR3 90kg TOTAL; barbell-row 3x6 RIR3 80kg TOTAL; db-bench-press 2x7 RIR3 establish; pull-up 4x6 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-11-13 AM RUN EASY 50min (EASY) | d5 2026-11-14 PM STRENGTH_FULL_B 42min: barbell-rdl 3x6 RIR3 120kg TOTAL; barbell-row 3x6 RIR3 80kg TOTAL; bench-press 4x5 RIR3 90kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2026-11-15 AM RUN LONG 100min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-16 AM RUN EASY 50min (EASY) | d1 2026-11-17 PM STRENGTH_LOWER 37min: back-squat 4x5 RIR3 130kg TOTAL; barbell-rdl 3x6 RIR3 120kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d2 2026-11-18 AM RUN EASY 50min (EASY) | d3 2026-11-19 PM STRENGTH_UPPER 41min: bench-press 4x5 RIR3 90kg TOTAL; barbell-row 3x6 RIR3 80kg TOTAL; db-bench-press 2x7 RIR3 last logged; pull-up 4x6 RIR3 BW; dead-bug 2x9 RIR3 BW | d4 2026-11-20 AM RUN EASY 50min (EASY) | d5 2026-11-21 PM STRENGTH_FULL_B 42min: barbell-rdl 3x6 RIR3 120kg TOTAL; barbell-row 3x6 RIR3 80kg TOTAL; bench-press 4x5 RIR3 90kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d6 2026-11-22 AM RUN LONG 100min (LONG)

### s1 · 2026-12-02T20:00:00+00:00 · WEEKLY_REVIEW (week 3)

- Athlete: 21 report(s): w0-run-d0 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d6 done 100min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d6 done 100min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d0 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d2 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d4 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d6 done 100min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 37min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d3 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 42min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d1 done 37min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d3 done 41min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 42min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d1 done 37min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d3 done 41min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d5 done 42min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-11-30","endDate":"2026-12-03","reasonCategory":"TRAVEL","nonclinical":true,"reason":"trade fair abroad","episodeId":"h08-a"}` · client notes NO_OFFER_TO_RESPOND
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-02T20:00:00.000Z with a WEEKLY_REVIEW report (R7D-H08-s1), not applied yet: `{"startDate":"2026-11-30","endDate":"2026-12-03","reasonCategory":"TRAVEL","nonclinical":true,"reason":"trade fair abroad","episodeId":"h08-a"}`
- Current week 3 (CONSOLIDATION) from 2026-12-02: d2 2026-12-02 AM RUN EASY 50min (EASY) | d3 2026-12-03 PM STRENGTH_UPPER 30min: bench-press 3x5 RIR3 92.5kg TOTAL; barbell-row 2x6 RIR3 82.5kg TOTAL; db-bench-press 1x7 RIR3 last logged; pull-up 3x6 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-04 AM RUN QUALITY 34min (THRESHOLD 3x5'/2') | d5 2026-12-05 PM STRENGTH_FULL_B 30min: barbell-rdl 2x6 RIR3 122.5kg TOTAL; barbell-row 2x6 RIR3 82.5kg TOTAL; bench-press 3x5 RIR3 92.5kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-06 AM RUN LONG 90min (LONG)
- Next week 4 (DEVELOPMENT, provisional): d0 2026-12-07 AM RUN EASY 55min (EASY +strides) | d1 2026-12-08 PM STRENGTH_LOWER 46min: back-squat 4x5 RIR3 132.5kg TOTAL; barbell-rdl 4x6 RIR3 122.5kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; db-calf-raise 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d2 2026-12-09 AM RUN EASY 50min (EASY) | d3 2026-12-10 PM STRENGTH_UPPER 47min: bench-press 4x5 RIR3 92.5kg TOTAL; barbell-row 4x6 RIR3 82.5kg TOTAL; db-bench-press 3x7 RIR3 last logged; pull-up 4x6 RIR3 BW; dead-bug 3x10 RIR3 BW | d4 2026-12-11 AM RUN QUALITY 41min (THRESHOLD 4x5'/2') | d5 2026-12-12 PM STRENGTH_FULL_B 52min: barbell-rdl 4x6 RIR3 122.5kg TOTAL; barbell-row 4x6 RIR3 82.5kg TOTAL; bench-press 4x5 RIR3 92.5kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d6 2026-12-13 AM RUN LONG 100min (LONG)

### s2 · 2026-12-05T20:00:00+00:00 · WEEKLY_REVIEW (week 3)

- Athlete: no reports · break `{"startDate":"2026-12-04","endDate":"2026-12-06","reasonCategory":"WORK","nonclinical":true,"reason":"stayed on for client meetings","episodeId":"h08-b"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-02T20:00:00.000Z with a WEEKLY_REVIEW report (R7D-H08-s1), not applied yet: `{"startDate":"2026-11-30","endDate":"2026-12-03","reasonCategory":"TRAVEL","nonclinical":true,"reason":"trade fair abroad","episodeId":"h08-a"}`
- Record: break declared 2026-12-05T20:00:00.000Z with a WEEKLY_REVIEW report (R7D-H08-s2), not applied yet: `{"startDate":"2026-12-04","endDate":"2026-12-06","reasonCategory":"WORK","nonclinical":true,"reason":"stayed on for client meetings","episodeId":"h08-b"}`
- Current week 3 (CONSOLIDATION) from 2026-12-05: d5 2026-12-05 PM STRENGTH_FULL_B 30min: barbell-rdl 2x6 RIR3 122.5kg TOTAL; barbell-row 2x6 RIR3 82.5kg TOTAL; bench-press 3x5 RIR3 92.5kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-06 AM RUN LONG 90min (LONG)
- Next week 4 (DEVELOPMENT, provisional): d0 2026-12-07 AM RUN EASY 55min (EASY +strides) | d1 2026-12-08 PM STRENGTH_LOWER 46min: back-squat 4x5 RIR3 132.5kg TOTAL; barbell-rdl 4x6 RIR3 122.5kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; db-calf-raise 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d2 2026-12-09 AM RUN EASY 50min (EASY) | d3 2026-12-10 PM STRENGTH_UPPER 47min: bench-press 4x5 RIR3 92.5kg TOTAL; barbell-row 4x6 RIR3 82.5kg TOTAL; db-bench-press 3x7 RIR3 last logged; pull-up 4x6 RIR3 BW; dead-bug 3x10 RIR3 BW | d4 2026-12-11 AM RUN QUALITY 41min (THRESHOLD 4x5'/2') | d5 2026-12-12 PM STRENGTH_FULL_B 52min: barbell-rdl 4x6 RIR3 122.5kg TOTAL; barbell-row 4x6 RIR3 82.5kg TOTAL; bench-press 4x5 RIR3 92.5kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d6 2026-12-13 AM RUN LONG 100min (LONG)

### s3 · 2026-12-17T20:00:00+00:00 · WEEKLY_REVIEW (week 5)

- Athlete: 7 report(s): w4-str-d1 done 46min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d3 done 47min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d5 done 52min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d0 not done; w4-run-d2 not done; w4-run-d4 not done; w4-run-d6 not done · break `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"FAMILY","nonclinical":true,"reason":"family emergency at home, no training","episodeId":"h08-c"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-02T20:00:00.000Z with a WEEKLY_REVIEW report (R7D-H08-s1), not applied yet: `{"startDate":"2026-11-30","endDate":"2026-12-03","reasonCategory":"TRAVEL","nonclinical":true,"reason":"trade fair abroad","episodeId":"h08-a"}`
- Record: break declared 2026-12-05T20:00:00.000Z with a WEEKLY_REVIEW report (R7D-H08-s2), not applied yet: `{"startDate":"2026-12-04","endDate":"2026-12-06","reasonCategory":"WORK","nonclinical":true,"reason":"stayed on for client meetings","episodeId":"h08-b"}`
- Record: break declared 2026-12-17T20:00:00.000Z with a WEEKLY_REVIEW report (R7D-H08-s3), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"FAMILY","nonclinical":true,"reason":"family emergency at home, no training","episodeId":"h08-c"}`
- Current week 5 (DEVELOPMENT) from 2026-12-17: d3 2026-12-17 PM STRENGTH_UPPER 47min: bench-press 4x5 RIR3 95kg TOTAL; barbell-row 4x6 RIR3 85kg TOTAL; db-bench-press 3x7 RIR3 last logged; pull-up 4x6 RIR3 BW; dead-bug 3x10 RIR3 BW | d4 2026-12-18 AM RUN QUALITY 48min (THRESHOLD 5x5'/2') | d5 2026-12-19 PM STRENGTH_FULL_B 52min: barbell-rdl 4x6 RIR3 125kg TOTAL; barbell-row 4x6 RIR3 85kg TOTAL; bench-press 4x5 RIR3 95kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d6 2026-12-20 AM RUN LONG 100min (LONG)
- Next week 6 (DEVELOPMENT, provisional): d0 2026-12-21 AM RUN EASY 55min (EASY +strides) | d1 2026-12-22 PM STRENGTH_LOWER 46min: back-squat 4x5 RIR3 135kg TOTAL; barbell-rdl 4x6 RIR3 125kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; db-calf-raise 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d2 2026-12-23 AM RUN EASY 55min (EASY) | d3 2026-12-24 PM STRENGTH_UPPER 47min: bench-press 4x5 RIR3 95kg TOTAL; barbell-row 4x6 RIR3 85kg TOTAL; db-bench-press 3x7 RIR3 last logged; pull-up 4x6 RIR3 BW; dead-bug 3x10 RIR3 BW | d4 2026-12-25 AM RUN QUALITY 43min (THRESHOLD 3x8'/2') | d5 2026-12-26 PM STRENGTH_FULL_B 52min: barbell-rdl 4x6 RIR3 125kg TOTAL; barbell-row 4x6 RIR3 85kg TOTAL; bench-press 4x5 RIR3 95kg TOTAL; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d6 2026-12-27 AM RUN LONG 100min (LONG)

### s4 · 2026-12-31T06:30:00+00:00 · RETURN_AFTER_PAUSE (week 7)

- Athlete: 7 report(s): w6-run-d0 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d2 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d4 done 43min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d6 done 100min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d1 done 2 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d3 done 2 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d5 done 2 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-28","endDate":"2026-12-30","reasonCategory":"WORK","nonclinical":true,"reason":"quarter-end close, three very long days","episodeId":"h08-d"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-11-30 to 2026-12-03; 2026-12-04 to 2026-12-06; 2026-12-14 to 2026-12-20; 2026-12-28 to 2026-12-30), each its own interruption; the stop read runs from 2026-12-28 to 2026-12-30; the break from 2026-12-14 to 2026-12-20 is read as its own return (short, 7 days), as if applied when training resumed on 2026-12-21, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return: short nonclinical interruption (3 days): resume the last completed doses; no step until execution is observed
- Current week 7 (CONSOLIDATION) from 2026-12-31: d3 2026-12-31 PM STRENGTH_UPPER 30min: bench-press 3x5 RIR3 95kg TOTAL; barbell-row 2x6 RIR3 85kg TOTAL; db-bench-press 1x6 RIR3 85kg PER_HAND; pull-up 3x6 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2027-01-01 AM RUN EASY 41min (EASY) | d5 2027-01-02 PM STRENGTH_FULL_B 30min: barbell-rdl 2x6 RIR3 125kg TOTAL; barbell-row 2x6 RIR3 85kg TOTAL; bench-press 3x5 RIR3 95kg TOTAL; bulgarian-split-squat-db 1x6 RIR3 24kg PER_HAND; dead-bug 1x10 RIR3 BW | d6 2027-01-03 AM RUN LONG 90min (LONG)
- Next week 8 (DEVELOPMENT, provisional): d0 2027-01-04 AM RUN EASY 55min (EASY +strides) | d1 2027-01-05 PM STRENGTH_LOWER 40min: back-squat 4x5 RIR3 135kg TOTAL; barbell-rdl 4x6 RIR3 125kg TOTAL; db-split-squat 2x7 RIR3 establish; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d2 2027-01-06 AM RUN EASY 55min (EASY) | d3 2027-01-07 PM STRENGTH_UPPER 40min: bench-press 4x5 RIR3 95kg TOTAL; barbell-row 4x6 RIR3 85kg TOTAL; db-floor-press 2x7 RIR3 establish; scapular-pull-up 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d4 2027-01-08 AM RUN QUALITY 48min (THRESHOLD 5x5'/2') | d5 2027-01-09 PM STRENGTH_FULL_B 49min: barbell-rdl 4x6 RIR3 125kg TOTAL; barbell-row 4x6 RIR3 85kg TOTAL; bench-press 4x5 RIR3 95kg TOTAL; bulgarian-split-squat-db 3x6 RIR3 24kg PER_HAND; front-plank 2x7 RIR3 BW | d6 2027-01-10 AM RUN LONG 100min (LONG)

**Automated properties.** no failure · not evaluable: P18 (1)

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["2:4:QUALITY","3:4:QUALITY"]`
- e3 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e4 @s3 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e5 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e6 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e7 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The four breaks stay separate and their days are not added up. The trade fair and the client meetings touch and read as one continuous stop (30 Nov to 6 Dec). Week 4 counts for strength only and week 6 for running only, so no week re-enters both sports: running and strength resume from different references, each sport gets no step it did not earn, and the partial strength week 6 does not advance strength.
- e8 @s4 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":100,"otherWeek":100}`

**Independent assessment (author, written before any output).**
- Rationale: An experienced runner and lifter whose month is cut by four interruptions. The pattern of what was trained between them is uneven: strength fully in week 4 with no running, running fully in week 6 with half-finished lifting.
- Preferred: Keep each break as stated and never add their days. Read the first two as one continuous stop because they touch; read week 4 as strength training and week 6 as running training; resume each sport from what it actually executed, with strength not advanced past week 4 and running not credited for week 4, and keep doses at or below the pre-break levels.
- Acceptable alternatives: Ask a confirming question about the partial strength week before planning strength / A slightly more conservative strength entry because the latest strength week was partial
- Concerns: Summing the breaks into one long break and restarting both sports / Treating week 6 as a full re-entry in both sports / Raising strength from the partial week-6 logs / Prescribing while any break is kept and unapplied
- Domain notes: —

## R7D-H09

**Intent.** A kettlebell-only hybrid executes a whole week in both sports between a ski week and a family trip that began on the afternoon of that week's last session; later the athlete corrects the family trip by name to start the next day.

**Tags.** COLD_START, KETTLEBELL, BALANCED_HYBRID, H12, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, START_NON_MONDAY, TIMEZONE, RETURN_SHORT, CORRECTION, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-14","weeks":12,"asOf":"2026-11-12","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":130,"longestRunMinutes":55,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["kb-goblet-squat 3x10 16KG SINGLE_IMPLEMENT","kb-deadlift 3x10 24KG SINGLE_IMPLEMENT"],"equipment":["KETTLEBELL","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[2,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":45,"strengthMinutes":35,"longRunDay":1,"longRunMinutes":70}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-11-15 AM RUN LONG 55min (LONG) | d2 2026-11-16 AM STRENGTH_FULL_A 30min: kb-goblet-squat 3x8 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-17 AM RUN EASY 35min (EASY) | d5 2026-11-19 AM RUN EASY 35min (EASY) | d6 2026-11-20 AM STRENGTH_FULL_B 30min: kb-deadlift 3x8 RIR3 24kg SINGLE_IMPLEMENT; kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-11-22 AM RUN LONG 55min (LONG) | d2 2026-11-23 AM STRENGTH_FULL_A 30min: kb-goblet-squat 3x8 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 2x10 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-24 AM RUN EASY 35min (EASY) | d5 2026-11-26 AM RUN EASY 35min (EASY) | d6 2026-11-27 AM STRENGTH_FULL_B 30min: kb-deadlift 3x8 RIR3 24kg SINGLE_IMPLEMENT; kb-row 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

### s1 · 2026-12-03T20:00:00+01:00 · WEEKLY_REVIEW (week 2)

- Athlete: 10 report(s): w0-run-d1 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d2 done 30min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d6 done 30min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d2 done 30min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d6 done 30min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-11-28","endDate":"2026-12-04","reasonCategory":"VACATION","nonclinical":true,"reason":"ski week, no running or kettlebell"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-03T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-H09-s1), not applied yet: `{"startDate":"2026-11-28","endDate":"2026-12-04","reasonCategory":"VACATION","nonclinical":true,"reason":"ski week, no running or kettlebell"}`
- Current week 2 (DEVELOPMENT) from 2026-12-03: d5 2026-12-03 AM RUN EASY 35min (EASY) | d6 2026-12-04 AM STRENGTH_FULL_B 30min: kb-deadlift 3x8 RIR3 24kg SINGLE_IMPLEMENT; kb-row 2x8 RIR3 last logged; incline-push-up 2x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Next week 3 (CONSOLIDATION, provisional): d1 2026-12-06 AM RUN LONG 50min (LONG) | d2 2026-12-07 AM STRENGTH_FULL_A 22min: kb-goblet-squat 2x8 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 1x12 RIR3 BW; kb-row 1x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-08 AM RUN EASY 40min (EASY +strides) | d5 2026-12-10 AM RUN EASY 35min (EASY) | d6 2026-12-11 AM STRENGTH_FULL_B 22min: kb-deadlift 2x8 RIR3 24kg SINGLE_IMPLEMENT; kb-row 1x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

### s2 · 2026-12-19T10:00:00+01:00 · RETURN_AFTER_PAUSE (week 5)

- Athlete: 5 report(s): w3-run-d1 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d5 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d2 done 22min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d6 done 22min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-12-11T07:00:00+01:00 · break `{"startDate":"2026-12-11","endDate":"2026-12-18","reasonCategory":"FAMILY","nonclinical":true,"reason":"flew to my parents after the Friday morning session","episodeId":"h09-family","startedAt":"2026-12-11T12:30:00+01:00"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-11-28 to 2026-12-04; 2026-12-11 to 2026-12-18), each its own interruption; the stop read runs from 2026-12-11 to 2026-12-18, and a whole week of the plan executed in full after the earlier one re-entered the athlete: short nonclinical interruption (8 days): resume the last completed doses; no step until execution is observed
- Current week 5 (DEVELOPMENT) from 2026-12-19: d1 2026-12-20 AM RUN LONG 55min (LONG) | d2 2026-12-21 AM STRENGTH_FULL_A 30min: kb-goblet-squat 3x8 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 2x12 RIR3 BW; kb-row 2x8 RIR3 16kg SINGLE_IMPLEMENT; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-22 AM RUN EASY 40min (EASY +strides) | d5 2026-12-24 AM RUN EASY 35min (EASY) | d6 2026-12-25 AM STRENGTH_FULL_B 30min: kb-deadlift 3x8 RIR3 24kg SINGLE_IMPLEMENT; kb-row 2x8 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 2x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Next week 6 (DEVELOPMENT, provisional): d1 2026-12-27 AM RUN LONG 60min (LONG) | d2 2026-12-28 AM STRENGTH_FULL_A 30min: kb-goblet-squat 3x8 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 2x12 RIR3 BW; kb-row 2x8 RIR3 16kg SINGLE_IMPLEMENT; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-29 AM RUN EASY 40min (EASY +strides) | d5 2026-12-31 AM RUN EASY 35min (EASY) | d6 2027-01-01 AM STRENGTH_FULL_B 30min: kb-deadlift 3x8 RIR3 24kg SINGLE_IMPLEMENT; kb-row 2x8 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 2x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

### s3 · 2026-12-25T19:00:00+01:00 · WEEKLY_REVIEW (week 5)

- Athlete: 5 report(s): w5-run-d1 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d5 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d2 done 30min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d6 done 30min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-12","endDate":"2026-12-18","reasonCategory":"FAMILY","nonclinical":true,"reason":"the flight was on Saturday, not Friday","episodeId":"h09-family"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-11-28 to 2026-12-04; 2026-12-12 to 2026-12-18), each its own interruption; the stop read runs from 2026-12-12 to 2026-12-18, and a whole week of the plan executed in full after the earlier one re-entered the athlete (read again with this newer report of the interruption): short nonclinical interruption (7 days): resume the last completed doses; no step until execution is observed
- Current week 5 (DEVELOPMENT) from 2026-12-25: d6 2026-12-25 AM STRENGTH_FULL_B 30min: kb-deadlift 3x8 RIR3 24kg SINGLE_IMPLEMENT; kb-row 2x8 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 2x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Next week 6 (DEVELOPMENT, provisional): d1 2026-12-27 AM RUN LONG 55min (LONG) | d2 2026-12-28 AM STRENGTH_FULL_A 30min: kb-goblet-squat 3x8 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 2x12 RIR3 BW; kb-row 2x8 RIR3 16kg SINGLE_IMPLEMENT; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-29 AM RUN EASY 40min (EASY +strides) | d5 2026-12-31 AM RUN EASY 35min (EASY) | d6 2027-01-01 AM STRENGTH_FULL_B 30min: kb-deadlift 3x8 RIR3 24kg SINGLE_IMPLEMENT; kb-row 2x8 RIR3 16kg SINGLE_IMPLEMENT; incline-push-up 2x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE JUDGED [INVARIANT_ORACLE]: **JUDGED** — Strength uses only kettlebell and bodyweight exercises, and the known kettlebell loads are used in their single-implement convention.
- e3 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- e4 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e5 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e6 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Week 3 re-enters the athlete in both sports: every run and both strength sessions were done as prescribed with loads, the Friday session at 07:00 before the stated 12:30 start of the family trip. The ski week is history and the return is classed by the family trip alone, from the doses executed in week 3.
- e7 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e8 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — After the correction the family trip runs from Saturday; week 3 still re-enters, nothing is asked about uncovered sessions (the uncovered Friday is already reported), and the plan ahead is not lowered by the shorter break.

**Independent assessment (author, written before any output).**
- Rationale: An intermediate runner who lifts with two kettlebells. Between a ski week and a family trip he trained every session of week 3, including Friday morning, and left at lunchtime that Friday.
- Preferred: Plan kettlebell and bodyweight strength only. On return, read week 3 as a whole week executed in both sports because the Friday session came before the stated start time, treat the ski week as history and plan a short return from week-3 doses; after the correction, re-read with the trip starting Saturday and keep the same or a slightly higher plan.
- Acceptable alternatives: Ask for the Friday session time if the start time were missing / Keep the return plan unchanged after the correction
- Concerns: Ignoring the start time and treating week 3 as not between the breaks / Reading the stop from the ski week's first day / Asking about the already reported Friday session after the correction / Barbell or machine exercises for a kettlebell-only athlete
- Domain notes: The Friday strength session needs its own observedAt, so week-3 strength is reported by chosen day. Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H10

**Intent.** Onboarding from four weeks of watch history in which strength is known only by type and duration, then an athlete whose reports always arrive at the next week's review.

**Tags.** COLD_START, WEARABLE_PARTIAL, LOW_DATA, BALANCED_HYBRID, H12, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, START_NON_MONDAY, TIMEZONE, LATE_REPORTER, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":12,"asOf":"2026-11-30","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":null,"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT"],"pause":null,"wearable":"PARTIAL","history":20,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4,6],"strengthDays":[0,3],"runMinutes":50,"strengthMinutes":45,"longRunDay":4,"longRunMinutes":70}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-02  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-03  RUN EASY 40min (EASY) | d3 2026-12-05  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-06  RUN LONG 60min (LONG) | d6 2026-12-08  RUN EASY 40min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-09  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-10  RUN EASY 40min (EASY) | d3 2026-12-12  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-13  RUN LONG 60min (LONG) | d6 2026-12-15  RUN EASY 40min (EASY)

### s1 · 2026-12-15T21:00:00-05:00 · WEEKLY_REVIEW (week 1)

- Athlete: 5 report(s): w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via gpswatch; w0-run-d4 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via gpswatch; w0-run-d6 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via gpswatch; w0-str-d0 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via manual-log; w0-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via manual-log
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","EASY":"HOLD","goblet-squat":"HOLD","db-floor-press":"HOLD","db-row":"HOLD","standing-calf-raise":"HOLD","dead-bug":"HOLD","glute-bridge":"HOLD","reverse-lunge":"HOLD"}`
- Current week 1 (DEVELOPMENT) from 2026-12-15: d6 2026-12-15  RUN EASY 40min (EASY)
- Next week 2 (DEVELOPMENT, provisional): d0 2026-12-16  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-17  RUN EASY 40min (EASY) | d3 2026-12-19  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-20  RUN LONG 60min (LONG) | d6 2026-12-22  RUN EASY 40min (EASY)

### s2 · 2026-12-22T21:00:00-05:00 · WEEKLY_REVIEW (week 2)

- Athlete: 5 report(s): w1-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via gpswatch; w1-run-d4 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via gpswatch; w1-run-d6 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via gpswatch; w1-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via manual-log; w1-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via manual-log
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","EASY":"HOLD","goblet-squat":"HOLD","db-floor-press":"HOLD","db-row":"HOLD","standing-calf-raise":"HOLD","dead-bug":"HOLD","glute-bridge":"HOLD","reverse-lunge":"HOLD"}`
- Current week 2 (DEVELOPMENT) from 2026-12-22: d6 2026-12-22  RUN EASY 40min (EASY)
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-23  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 14kg PER_HAND; db-row 2x10 RIR3 18kg PER_HAND; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d1 2026-12-24  RUN EASY 40min (EASY) | d3 2026-12-26  STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; db-row 2x10 RIR3 18kg PER_HAND; db-floor-press 2x10 RIR3 14kg PER_HAND; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d4 2026-12-27  RUN LONG 60min (LONG) | d6 2026-12-29  RUN EASY 40min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE JUDGED [DOMAIN_ORACLE]: **JUDGED** — Running starts near the observed volume (about 145 minutes a week, longest about 60 minutes), not above it; strength loads are found by effort and logged (ESTABLISH), never derived from the type-and-duration rows.
- e3 @s1 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The unreported week-1 sessions are unknown, neither missed nor done; nothing is reduced for them and nothing is progressed from them.
- e4 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e5 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The late week-1 reports are used from s2 on; the coach does not ask an unreported-training question (the silence is far shorter than a month) and the progression stays conservative while the current week is still unreported.

**Independent assessment (author, written before any output).**
- Rationale: An intermediate runner with a watch that records runs fully but strength only as a workout with a duration; she always syncs a week late.
- Preferred: Anchor running on the four observed weeks; ask the athlete to find and log strength loads by effort; treat each current week as unknown until its reports arrive and progress conservatively from what is known.
- Acceptable alternatives: Ask for running or strength experience details before planning / Hold progression one week while reports lag
- Concerns: Inventing strength loads from the watch history / Treating the unsynced week as missed and cutting the plan / Progressing as if the unsynced week was done
- Domain notes: History rows fall inside the date window (3 Nov to 29 Nov 2026).

## R7D-H11

**Intent.** A novice who runs about 50 minutes a week chooses five run days; between a work crunch and an exam week she completes every counted session of a week and skips its optional walks.

**Tags.** COLD_START, TOO_MANY_DAYS, FREQ_HIGH, H8, RUN_EXP_NOVICE, STR_EXP_NOVICE, START_NON_MONDAY, TIMEZONE, RETURN_SHORT, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-24","weeks":8,"asOf":"2026-11-22","tz":-360,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":50,"longestRunMinutes":30,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5],"strengthDays":[2,6],"runMinutes":40,"strengthMinutes":35,"longRunDay":5,"longRunMinutes":45}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-24  RUN EASY 15min (EASY) | d1 2026-11-25  RUN EASY 15min (EASY) | d2 2026-11-26  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-11-27  RUN WALK 20min (WALK) | d4 2026-11-28  RUN WALK 20min (WALK) | d5 2026-11-29  RUN LONG 20min (LONG) | d6 2026-11-30  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-01  RUN EASY 15min (EASY) | d1 2026-12-02  RUN EASY 15min (EASY) | d2 2026-12-03  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-04  RUN WALK 20min (WALK) | d4 2026-12-05  RUN WALK 20min (WALK) | d5 2026-12-06  RUN LONG 20min (LONG) | d6 2026-12-07  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

### s1 · 2026-12-12T20:00:00-06:00 · WEEKLY_REVIEW (week 2)

- Athlete: 14 report(s): w0-run-d0 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d1 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d2 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d6 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d2 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d6 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-08","endDate":"2026-12-14","reasonCategory":"WORK","nonclinical":true,"reason":"year-end inventory, twelve-hour days"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-13T02:00:00.000Z with a WEEKLY_REVIEW report (R7D-H11-s1), not applied yet: `{"startDate":"2026-12-08","endDate":"2026-12-14","reasonCategory":"WORK","nonclinical":true,"reason":"year-end inventory, twelve-hour days"}`
- Current week 2 (DEVELOPMENT) from 2026-12-12: d4 2026-12-12  RUN WALK 20min (WALK) | d5 2026-12-13  RUN LONG 20min (LONG) | d6 2026-12-14  STRENGTH_FULL_B 28min: glute-bridge 2x12 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-15  RUN EASY 20min (EASY +strides) | d1 2026-12-16  RUN EASY 15min (EASY) | d2 2026-12-17  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d3 2026-12-18  RUN WALK 20min (WALK) | d4 2026-12-19  RUN WALK 20min (WALK) | d5 2026-12-20  RUN LONG 20min (LONG) | d6 2026-12-21  STRENGTH_FULL_B 29min: glute-bridge 2x14 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW

### s2 · 2026-12-26T08:00:00-06:00 · RETURN_AFTER_PAUSE (week 4)

- Athlete: 7 report(s): w3-run-d0 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d1 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d5 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d3 not done; w3-run-d4 not done; w3-str-d2 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d6 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-22","endDate":"2026-12-25","reasonCategory":"STUDY","nonclinical":true,"reason":"final exams","episodeId":"h11-exams"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-08 to 2026-12-14; 2026-12-22 to 2026-12-25), each its own interruption; the stop read runs from 2026-12-22 to 2026-12-25, and a whole week of the plan executed in full after the earlier one re-entered the athlete: short nonclinical interruption (4 days): resume the last completed doses; no step until execution is observed
- Current week 4 (CONSOLIDATION) from 2026-12-26: d4 2026-12-26  RUN WALK 20min (WALK) | d5 2026-12-27  RUN LONG 15min (LONG) | d6 2026-12-28  STRENGTH_FULL_B 20min: glute-bridge 1x12 RIR3 BW; db-row 1x8 RIR3 12kg PER_HAND; db-floor-press 1x8 RIR3 10kg PER_HAND; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-29  RUN EASY 15min (EASY +strides) | d1 2026-12-30  RUN EASY 15min (EASY) | d2 2026-12-31  STRENGTH_FULL_A 35min: goblet-squat 2x10 RIR3 16kg SINGLE_IMPLEMENT; db-floor-press 3x8 RIR3 10kg PER_HAND; db-row 3x8 RIR3 12kg PER_HAND; standing-calf-raise 1x14 RIR3 BW; dead-bug 2x14 RIR3 BW | d3 2027-01-01  RUN WALK 20min (WALK) | d4 2027-01-02  RUN WALK 20min (WALK) | d5 2027-01-03  RUN LONG 20min (LONG) | d6 2027-01-04  STRENGTH_FULL_B 32min: glute-bridge 3x12 RIR3 BW; db-row 3x8 RIR3 12kg PER_HAND; db-floor-press 3x8 RIR3 10kg PER_HAND

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE JUDGED [DOMAIN_ORACLE]: **JUDGED** — With five chosen run days but about 50 minutes a week of current running, the extra days hold optional walks or rest rather than five real runs, and week-0 counted running stays close to the current volume.
- e3 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e4 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e5 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e6 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Week 3 re-enters the athlete in both sports although its optional walks were not done; the work crunch is history and the return is classed by the 4-day exam break alone, from the week-3 doses.

**Independent assessment (author, written before any output).**
- Rationale: A novice runner choosing more run days than her running supports: the competent answer is fewer real runs and optional walks, not five runs.
- Preferred: Plan two or three easy runs a week near her current volume, with optional walks or rest on the other chosen days; on return, read week 3 as fully executed in both sports, keep the optional walks out of the decision, and resume from week 3 after a short-break return.
- Acceptable alternatives: Ask the athlete to reduce the run days before planning / Plan three short easy runs and two optional walks
- Concerns: Five real runs a week for a 50-minute-a-week novice / Blocking re-entry because optional walks were skipped / Reading the stop from the work crunch
- Domain notes: —

## R7D-H12

**Intent.** Eligibility not confirmed: the athlete answered only the pain question. The coach must ask, neither clearing her nor presuming illness.

**Tags.** COLD_START, ELIGIBILITY_UNKNOWN, RACE_10K, H8, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, TIMEZONE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":8,"asOf":"2026-11-14","tz":60,"learningConsent":null,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-03"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-01-03"},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":120,"longestRunMinutes":50},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[2],"runMinutes":45,"strengthMinutes":30,"longRunDay":6}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- e2 @GENERATE NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- e3 @GENERATE JUDGED [INVARIANT_ORACLE]: **JUDGED** — The coach asks for the unanswered eligibility items; it neither clears the athlete nor routes her to a clinician as if a clinical signal existed.

**Independent assessment (author, written before any output).**
- Rationale: A runner who left most eligibility questions unanswered.
- Preferred: Ask for the missing answers and plan nothing until they arrive.
- Acceptable alternatives: Ask and show which answers are missing
- Concerns: Planning anyway / Routing to a clinician without any clinical signal / Treating the single pain:false answer as full clearance
- Domain notes: —

## R7D-H13

**Intent.** Persistent pain declared at onboarding: the coach must route to a qualified human and prescribe nothing.

**Tags.** COLD_START, CLINICAL_SIGNAL, BALANCED_HYBRID, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, START_NON_MONDAY, TIMEZONE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":12,"asOf":"2026-11-16","tz":-180,"learningConsent":null,"eligibility":"CLINICAL","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","RACK","BENCH","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,5],"strengthDays":[1,4],"runMinutes":50,"strengthMinutes":60,"longRunDay":5}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- e2 @GENERATE NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- e3 @GENERATE JUDGED [NOT_EVALUABLE_DOMAIN]: **JUDGED** — Whether the pain allows training is a clinical judgment the coach does not make.

**Independent assessment (author, written before any output).**
- Rationale: A hybrid athlete with persistent pain.
- Preferred: Route to a qualified human, plan nothing, and say why.
- Acceptable alternatives: Route and offer to plan once a qualified human clears the athlete
- Concerns: A modified plan around the pain / A rehabilitation program / Asking the athlete to rate the pain and planning anyway
- Domain notes: —

## R7D-H14

**Intent.** A 16-year-old asks for a 10K plan: adolescents are outside V1 scope, so the coach must not plan.

**Tags.** COLD_START, OUT_OF_SCOPE, RACE_10K, H12, RUN_EXP_NOVICE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":12,"asOf":"2026-11-19","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-23"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-01-23"},"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":60,"longestRunMinutes":35},"knownRuns":0,"knownExercises":[],"equipment":null,"pause":null,"wearable":null,"history":0,"ageYears":16,"specialPopulation":["ADOLESCENT"],"schedule":{"runDays":[0,2,4],"strengthDays":[],"runMinutes":40}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"UNSUPPORTED"`
- e2 @GENERATE NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"UNSUPPORTED"`

**Independent assessment (author, written before any output).**
- Rationale: A minor asking for race training.
- Preferred: Decline as outside the V1 scope, plan nothing, and say why.
- Acceptable alternatives: Decline and suggest the athlete look for age-appropriate coaching
- Concerns: Planning a reduced adult program / Treating the request as clinical
- Domain notes: —

## R7D-H15

**Intent.** An experienced runner stops reporting for five weeks; an empty review on the last week's first evening raises the unreported-training question, answered next with a declared work break, then the last review.

**Tags.** UNREPORTED_WEEKS, LATE_ANSWER, EMPTY_REVIEW, SKIPPED_REVIEW, BALANCED_HYBRID, H8, RUN_EXP_EXPERIENCED, STR_EXP_NOVICE, TIMEZONE, RETURN_LONG, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":8,"asOf":"2026-12-05","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":180,"longestRunMinutes":80,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[2,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":55,"strengthMinutes":40,"longRunDay":5,"longRunMinutes":90}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-08 PM RUN EASY 50min (EASY) | d2 2026-12-09 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-12-10 PM RUN EASY 50min (EASY) | d4 2026-12-11 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-12 PM RUN LONG 80min (LONG)
- Week 1 (DEVELOPMENT): d1 2026-12-15 PM RUN EASY 50min (EASY) | d2 2026-12-16 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-17 PM RUN EASY 50min (EASY) | d4 2026-12-18 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-19 PM RUN LONG 80min (LONG)

### s1 · 2026-12-20T19:00:00+01:00 · WEEKLY_REVIEW (week 1)

- Athlete: 10 report(s): w0-run-d1 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 80min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 80min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d2 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d2 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 1 load question(s) · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged; first logged loads wait for confirmation before they become numbers (goblet-squat)
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-floor-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-12-20: —
- Next week 2 (DEVELOPMENT, provisional): d1 2026-12-22 PM RUN EASY 50min (EASY) | d2 2026-12-23 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-24 PM RUN EASY 50min (EASY) | d4 2026-12-25 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-26 PM RUN LONG 80min (LONG)

### s2 · 2027-01-25T20:30:00+01:00 · WEEKLY_REVIEW (week 7)

- Athlete: no reports
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question UNREPORTED_TRAINING (13 sessions, from week 7)
- Reason: No run is recorded in the 30 days before 2027-01-25, the reference for the runs planned from then, and 13 planned run sessions from 2026-12-26 to 2027-01-23 have no report: say what was done (report the sessions) or that training stopped (the break and its reason) before runs are planned; training that is only unreported counts neither as done nor as not done
- Current week 7 (DEVELOPMENT) from 2027-01-25: d1 2027-01-26 PM RUN EASY 55min (EASY +strides) | d2 2027-01-27 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-28 PM RUN EASY 55min (EASY) | d4 2027-01-29 PM STRENGTH_FULL_B 28min: glute-bridge 2x12 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-30 PM RUN LONG 80min (LONG)

### s3 · 2027-01-25T21:15:00+01:00 · WEEKLY_REVIEW (week 7)

- Athlete: no reports · break `{"startDate":"2026-12-21","endDate":"2027-01-24","reasonCategory":"WORK","nonclinical":true,"reason":"year-end project, no training at all"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: long nonclinical interruption (35 days): restart from current capacity; prior doses are only a ceiling
- Current week 7 (DEVELOPMENT) from 2027-01-25: d1 2027-01-26 PM RUN EASY 15min (EASY) | d2 2027-01-27 PM STRENGTH_FULL_A 19min: goblet-squat 1x8 RIR4 establish; db-floor-press 1x8 RIR4 establish; db-row 1x8 RIR4 establish; standing-calf-raise 1x10 RIR4 BW; dead-bug 1x10 RIR4 BW | d3 2027-01-28 PM RUN EASY 15min (EASY) | d4 2027-01-29 PM STRENGTH_FULL_B 19min: glute-bridge 1x8 RIR4 BW; db-row 1x8 RIR4 establish; db-floor-press 1x8 RIR4 establish; reverse-lunge 1x10 RIR4 BW; dead-bug 1x10 RIR4 BW | d5 2027-01-30 PM RUN EASY 15min (EASY)

### s4 · 2027-01-31T19:00:00+01:00 · WEEKLY_REVIEW (week 7)

- Athlete: 5 report(s): w7-run-d1 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d3 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d5 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d2 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d4 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Final week of the horizon; record outcomes for the next program
- Current week 7 (DEVELOPMENT) from 2027-01-31: —

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- e1 @s2 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"UNREPORTED_TRAINING"`
- e2 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e3 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e4 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e5 @s3 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":0,"otherWeek":80}`
- e6 @s3 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- e7 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`

**Independent assessment (author, written before any output).**
- Rationale: An experienced runner went silent for five weeks; asked, he says he stopped completely for a work project. A five-week stop matters more than his experience.
- Preferred: Ask what happened before planning the last week; on the answer, apply the break as a long-ish return: easy running clearly below week-1 doses, no quality, light strength, and say plainly that the five weeks are a stop, not missing data.
- Acceptable alternatives: A restart with walk/jog elements for the first days / A short easy week with every run below 40 minutes
- Concerns: Continuing the week-6 projection as if training had happened / Treating the five unreported weeks as missed sessions to make up / Asking the same question again after the answer
- Domain notes: The empty review and the answer are 45 minutes apart, so the evaluation's one-minute probe fits between them; runs of the last week fall on days 1, 3 and 5 in the evening, after the answer. Strength sessions on days 2 and 4 follow the answer day.

## R7D-H16

**Intent.** A strength-first hybrid keeps logging machine work (a heavier leg-press setting, then an equal second log) but stops reporting runs for five weeks; an unavailable-day request on the last week's first evening raises the question, answered next: no runs were done.

**Tags.** UNREPORTED_WEEKS, LATE_ANSWER, STRENGTH_FIRST, GYM, H8, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, UNAVAILABLE_DAY, LOAD_CONFIRMATION, START_NON_MONDAY, TIMEZONE, SKIPPED_REVIEW, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-13","weeks":8,"asOf":"2026-11-11","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":120,"longestRunMinutes":50,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["leg-press 3x10 100KG MACHINE_STACK","lat-pulldown 3x10 50KG MACHINE_STACK","machine-chest-press 3x10 40KG MACHINE_STACK","seated-cable-row 3x10 45KG MACHINE_STACK"],"equipment":["MACHINES","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[0,2,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":45,"strengthMinutes":60,"longRunDay":1,"longRunMinutes":60}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-13 PM STRENGTH_UPPER 37min: machine-chest-press 3x10 RIR3 40kg MACHINE_STACK; seated-cable-row 3x10 RIR3 45kg MACHINE_STACK; cable-triceps-pushdown 2x10 RIR3 establish; lat-pulldown 3x10 RIR3 50kg MACHINE_STACK; dead-bug 2x10 RIR3 BW | d1 2026-11-14 AM RUN LONG 50min (LONG) | d2 2026-11-15 PM STRENGTH_LOWER 32min: leg-press 3x10 RIR3 100kg MACHINE_STACK; glute-bridge 2x8 RIR3 BW; leg-extension-machine 2x10 RIR3 establish; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2026-11-16 AM RUN EASY 35min (EASY) | d4 2026-11-17 PM STRENGTH_FULL_B 37min: glute-bridge 2x8 RIR3 BW; seated-cable-row 3x10 RIR3 45kg MACHINE_STACK; machine-chest-press 3x10 RIR3 40kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2026-11-18 AM RUN EASY 35min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-20 PM STRENGTH_UPPER 39min: machine-chest-press 3x12 RIR3 40kg MACHINE_STACK; seated-cable-row 3x12 RIR3 45kg MACHINE_STACK; cable-triceps-pushdown 2x10 RIR3 last logged; lat-pulldown 3x12 RIR3 50kg MACHINE_STACK; dead-bug 2x12 RIR3 BW | d1 2026-11-21 AM RUN LONG 55min (LONG) | d2 2026-11-22 PM STRENGTH_LOWER 36min: leg-press 3x12 RIR3 100kg MACHINE_STACK; glute-bridge 3x10 RIR3 BW; leg-extension-machine 2x10 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d3 2026-11-23 AM RUN EASY 35min (EASY) | d4 2026-11-24 PM STRENGTH_FULL_B 41min: glute-bridge 3x10 RIR3 BW; seated-cable-row 3x12 RIR3 45kg MACHINE_STACK; machine-chest-press 3x12 RIR3 40kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d5 2026-11-25 AM RUN EASY 35min (EASY)

### s1 · 2026-12-03T20:00:00-05:00 · WEEKLY_REVIEW (week 2)

- Athlete: 15 report(s): w0-run-d1 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 37min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d2 done 32min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 37min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d2 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 41min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d2 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d4 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 1 load question(s) · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","EASY":"HOLD","machine-chest-press":"ADVANCE","seated-cable-row":"ADVANCE","cable-triceps-pushdown":"ADVANCE","lat-pulldown":"ADVANCE","dead-bug":"ADVANCE","leg-press":"ADVANCE","glute-bridge":"ADVANCE","leg-extension-machine":"ADVANCE","seated-calf-raise-machine":"ADVANCE","leg-curl-machine":"ADVANCE"}`
- Current week 2 (DEVELOPMENT) from 2026-12-03: —
- Next week 3 (CONSOLIDATION, provisional): d0 2026-12-04 PM STRENGTH_UPPER 26min: machine-chest-press 2x10 RIR3 40kg MACHINE_STACK; seated-cable-row 2x10 RIR3 45kg MACHINE_STACK; cable-triceps-pushdown 1x10 RIR3 establish; lat-pulldown 2x10 RIR3 50kg MACHINE_STACK; dead-bug 1x12 RIR3 BW | d1 2026-12-05 AM RUN LONG 50min (LONG) | d2 2026-12-06 PM STRENGTH_LOWER 24min: leg-press 2x10 RIR3 100kg MACHINE_STACK; glute-bridge 2x10 RIR3 BW; leg-extension-machine 1x10 RIR3 establish; seated-calf-raise-machine 1x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d3 2026-12-07 AM RUN EASY 40min (EASY +strides) | d4 2026-12-08 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; seated-cable-row 2x10 RIR3 45kg MACHINE_STACK; machine-chest-press 2x10 RIR3 40kg MACHINE_STACK; leg-curl-machine 1x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d5 2026-12-09 AM RUN EASY 35min (EASY)

### s2 · 2026-12-17T20:00:00-05:00 · WEEKLY_REVIEW (week 4)

- Athlete: 6 report(s): w3-str-d0 done 26min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d2 done 24min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d4 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d0 done 47min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d2 done 46min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d4 done 52min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","EASY":"HOLD","machine-chest-press":"ADVANCE","seated-cable-row":"ADVANCE","cable-triceps-pushdown":"ADVANCE","lat-pulldown":"ADVANCE","dead-bug":"ADVANCE","leg-press":"ADVANCE","glute-bridge":"ADVANCE","leg-extension-machine":"ADVANCE","seated-calf-raise-machine":"ADVANCE","leg-curl-machine":"ADVANCE"}`
- Current week 4 (DEVELOPMENT) from 2026-12-17: —
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-18 PM STRENGTH_UPPER 39min: machine-chest-press 3x12 RIR3 40kg MACHINE_STACK; seated-cable-row 3x12 RIR3 45kg MACHINE_STACK; cable-triceps-pushdown 2x10 RIR3 establish; lat-pulldown 3x12 RIR3 50kg MACHINE_STACK; dead-bug 2x14 RIR3 BW | d1 2026-12-19 AM RUN LONG 60min (LONG) | d2 2026-12-20 PM STRENGTH_LOWER 36min: leg-press 3x10 RIR3 110kg MACHINE_STACK; glute-bridge 3x12 RIR3 BW; leg-extension-machine 2x10 RIR3 establish; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x14 RIR3 BW | d3 2026-12-21 AM RUN EASY 40min (EASY +strides) | d4 2026-12-22 PM STRENGTH_FULL_B 41min: glute-bridge 3x12 RIR3 BW; seated-cable-row 3x12 RIR3 45kg MACHINE_STACK; machine-chest-press 3x12 RIR3 40kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; dead-bug 2x14 RIR3 BW | d5 2026-12-23 AM RUN EASY 35min (EASY)

### s3 · 2027-01-01T19:30:00-05:00 · UNAVAILABLE_DAY (week 7)

- Athlete: no reports · changes `{"unavailableDates":["2027-01-04"]}`
- Coach: **MODIFY** / RESCHEDULE_WITHIN_WEEK · REQUIRES_RECONCILIATION · question UNREPORTED_TRAINING (13 sessions, from week 7) · new plan
- Reason: Sessions on the unavailable date are moved within chosen days when that adds no interference, otherwise skipped without debt; the run sessions ahead stay as they were and wait for an answer: No run is recorded in the 30 days before 2027-01-01, the reference for the runs planned from then, and 13 planned run sessions from 2026-12-02 to 2026-12-30 have no report: say what was done (report the sessions) or that training stopped (the break and its reason) before runs are planned; training that is only unreported counts neither as done nor as not done
- Current week 7 (CONSOLIDATION) from 2027-01-01: d0 2027-01-01 PM STRENGTH_UPPER 27min: machine-chest-press 2x12 RIR3 40kg MACHINE_STACK; seated-cable-row 2x12 RIR3 45kg MACHINE_STACK; cable-triceps-pushdown 1x10 RIR3 last logged; lat-pulldown 2x12 RIR3 50kg MACHINE_STACK; dead-bug 1x16 RIR3 BW | d1 2027-01-02 AM RUN LONG 50min (LONG) | d2 2027-01-03 PM STRENGTH_LOWER 26min: leg-press 2x12 RIR3 110kg MACHINE_STACK; glute-bridge 2x16 RIR3 BW; leg-extension-machine 1x10 RIR3 last logged; seated-calf-raise-machine 1x10 RIR3 last logged; dead-bug 1x16 RIR3 BW | d3 2027-01-04 AM RUN EASY 40min (EASY +strides) [SKIPPED] | d4 2027-01-05 PM STRENGTH_FULL_B 30min: glute-bridge 2x16 RIR3 BW; seated-cable-row 2x12 RIR3 45kg MACHINE_STACK; machine-chest-press 2x12 RIR3 40kg MACHINE_STACK; leg-curl-machine 1x10 RIR3 last logged; dead-bug 1x16 RIR3 BW | d5 2027-01-06 AM RUN EASY 40min (EASY)

### s4 · 2027-01-01T21:00:00-05:00 · WEEKLY_REVIEW (week 7)

- Athlete: 13 report(s): w2-run-d5 not done; w3-run-d1 not done; w3-run-d3 not done; w3-run-d5 not done; w4-run-d1 not done; w4-run-d3 not done; w4-run-d5 not done; w5-run-d1 not done; w5-run-d3 not done; w5-run-d5 not done; w6-run-d1 not done; w6-run-d3 not done; w6-run-d5 not done
- Coach: **MODIFY** / REPLAN_FROM_EVIDENCE · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: The reports of the run sessions that had no report answer the question about unreported training: the sessions still ahead are planned from those facts, not from the doses stored while they were unknown; completed sessions stay as they were; Final week of the horizon; record outcomes for the next program
- Current week 7 (CONSOLIDATION) from 2027-01-01: d0 2027-01-01 PM STRENGTH_UPPER 27min: machine-chest-press 2x12 RIR3 40kg MACHINE_STACK; seated-cable-row 2x12 RIR3 45kg MACHINE_STACK; cable-triceps-pushdown 1x10 RIR3 establish; lat-pulldown 2x12 RIR3 50kg MACHINE_STACK; dead-bug 1x14 RIR3 BW | d1 2027-01-02 AM RUN LONG 15min (LONG) | d2 2027-01-03 PM STRENGTH_LOWER 25min: leg-press 2x10 RIR3 110kg MACHINE_STACK; glute-bridge 2x12 RIR3 BW; leg-extension-machine 1x10 RIR3 establish; seated-calf-raise-machine 1x10 RIR3 establish; dead-bug 1x14 RIR3 BW | d3 2027-01-04 AM RUN EASY 15min (EASY +strides) [SKIPPED] | d4 2027-01-05 PM STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; seated-cable-row 2x12 RIR3 45kg MACHINE_STACK; machine-chest-press 2x12 RIR3 40kg MACHINE_STACK; leg-curl-machine 1x10 RIR3 establish; dead-bug 1x14 RIR3 BW | d5 2027-01-06 AM RUN EASY 15min (EASY)

### s5 · 2027-01-01T21:15:00-05:00 · UNAVAILABLE_DAY (week 7)

- Athlete: no reports · changes `{"unavailableDates":["2027-01-04"]}`
- Coach: **MODIFY** / RESCHEDULE_WITHIN_WEEK · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Sessions on the unavailable date are moved within chosen days when that adds no interference, otherwise skipped without debt
- Current week 7 (CONSOLIDATION) from 2027-01-01: d0 2027-01-01 PM STRENGTH_UPPER 27min: machine-chest-press 2x12 RIR3 40kg MACHINE_STACK; seated-cable-row 2x12 RIR3 45kg MACHINE_STACK; cable-triceps-pushdown 1x10 RIR3 establish; lat-pulldown 2x12 RIR3 50kg MACHINE_STACK; dead-bug 1x14 RIR3 BW | d1 2027-01-02 AM RUN LONG 15min (LONG) | d2 2027-01-03 PM STRENGTH_LOWER 25min: leg-press 2x10 RIR3 110kg MACHINE_STACK; glute-bridge 2x12 RIR3 BW; leg-extension-machine 1x10 RIR3 establish; seated-calf-raise-machine 1x10 RIR3 establish; dead-bug 1x14 RIR3 BW | d3 2027-01-04 AM RUN EASY 15min (EASY +strides) [SKIPPED] | d4 2027-01-05 PM STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; seated-cable-row 2x12 RIR3 45kg MACHINE_STACK; machine-chest-press 2x12 RIR3 40kg MACHINE_STACK; leg-curl-machine 1x10 RIR3 establish; dead-bug 1x14 RIR3 BW | d5 2027-01-06 AM RUN EASY 15min (EASY)

### s6 · 2027-01-07T19:00:00-05:00 · WEEKLY_REVIEW (week 7)

- Athlete: 5 report(s): w7-run-d1 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d5 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d2 done 25min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d4 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Final week of the horizon; record outcomes for the next program
- Current week 7 (CONSOLIDATION) from 2027-01-07: —

**Automated properties.** no failure · not evaluable: P06 (2)

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The 110 kg leg-press setting logged once is not yet the reference: one load question is asked and the 100 kg setting is kept.
- e2 @s2 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The equal second log at another session makes 110 kg the leg-press reference without a confirmation.
- e3 @s3 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"UNREPORTED_TRAINING"`
- e4 @s3 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e5 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e6 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e7 @s4 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- e8 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Running in week 7 restarts clearly below the week-1 doses because the listed runs were not done, while strength continues from its logged machine references (110 kg leg press); the strength record is not discarded because running stopped.
- e9 @s5 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`

**Independent assessment (author, written before any output).**
- Rationale: A lifter who kept logging the gym but never logged a run after week 1; asked, he says he did not run at all. Strength history is real; running stopped five weeks ago.
- Preferred: Adopt the heavier leg-press setting after the equal second log; when the silence is noticed, ask before planning; after the answer, rebuild running from a low easy dose with no quality, keep strength progressing from its references, and respect the unavailable Monday.
- Acceptable alternatives: Ask once more how much running is realistic before choosing the first dose / Keep strength at its current references for the last week rather than progressing
- Concerns: Assuming the unreported runs were done because lifting was logged / Cutting strength because running stopped / Computing a machine setting instead of using the logged one
- Domain notes: The unavailable-day request asked at s3 is sent again at s5, after the answer. Strength sessions on days 0, 2 and 4 of the last week fall on and after the answer day.

## R7D-H17

**Intent.** An intermediate hybrid whose watch broke reports nothing for five weeks; a travel equipment change on the last week's first evening raises the question, answered next morning: every run done except two long runs.

**Tags.** UNREPORTED_WEEKS, LATE_ANSWER, PARTIAL_ANSWER, BALANCED_HYBRID, H8, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, EQUIPMENT_CHANGE, TRAVEL, START_NON_MONDAY, TIMEZONE, SKIPPED_REVIEW, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":8,"asOf":"2026-11-13","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":60,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[2,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":45,"longRunDay":6,"longRunMinutes":75}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-16 PM RUN EASY 40min (EASY) | d2 2026-11-17 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-18 PM RUN EASY 40min (EASY) | d5 2026-11-20 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d6 2026-11-21 PM RUN LONG 60min (LONG)
- Week 1 (DEVELOPMENT): d1 2026-11-23 PM RUN EASY 40min (EASY) | d2 2026-11-24 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2026-11-25 PM RUN EASY 40min (EASY) | d5 2026-11-27 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-11-28 PM RUN LONG 60min (LONG)

### s1 · 2026-11-28T19:00:00+01:00 · WEEKLY_REVIEW (week 1)

- Athlete: 10 report(s): w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d6 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d6 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d2 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d2 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","db-rdl":"ADVANCE","db-row":"ADVANCE","db-bench-press":"ADVANCE","db-split-squat":"ADVANCE","dead-bug":"ADVANCE","goblet-squat":"ADVANCE","standing-calf-raise":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-11-28: d6 2026-11-28 PM RUN LONG 60min (LONG)
- Next week 2 (DEVELOPMENT, provisional): d1 2026-11-30 PM RUN EASY 40min (EASY) | d2 2026-12-01 PM STRENGTH_FULL_B 29min: db-rdl 2x12 RIR3 18kg PER_HAND; db-row 2x12 RIR3 18kg PER_HAND; db-bench-press 2x12 RIR3 14kg PER_HAND; db-split-squat 1x8 RIR3 14kg PER_HAND; dead-bug 1x14 RIR3 BW | d3 2026-12-02 PM RUN EASY 40min (EASY) | d5 2026-12-04 PM STRENGTH_FULL_A 29min: goblet-squat 2x12 RIR3 22kg SINGLE_IMPLEMENT; db-bench-press 2x12 RIR3 14kg PER_HAND; db-row 2x12 RIR3 18kg PER_HAND; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2026-12-05 PM RUN LONG 60min (LONG)

### s2 · 2027-01-03T20:00:00+01:00 · EQUIPMENT_CHANGE (week 7)

- Athlete: no reports · changes `{"equipment":["BODYWEIGHT"],"from":"2027-01-04","to":"2027-01-09"}`
- Coach: **MODIFY** / SUBSTITUTE · REQUIRES_RECONCILIATION · question UNREPORTED_TRAINING (13 sessions, from week 7) · new plan
- Reason: Equipment changed: same-intent substitutes from 2027-01-04 to 2027-01-09; unfamiliar ones are established by effort; the stimulus change is disclosed; the run sessions ahead stay as they were and wait for an answer: No run is recorded in the 30 days before 2027-01-03, the reference for the runs planned from then, and 13 planned run sessions from 2026-12-05 to 2027-01-02 have no report: say what was done (report the sessions) or that training stopped (the break and its reason) before runs are planned; training that is only unreported counts neither as done nor as not done
- Current week 7 (DEVELOPMENT) from 2027-01-03: d1 2027-01-04 PM RUN EASY 45min (EASY +strides) | d2 2027-01-05 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2027-01-06 PM RUN EASY 45min (EASY) | d5 2027-01-08 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2027-01-09 PM RUN LONG 60min (LONG)

### s3 · 2027-01-04T06:45:00+01:00 · WEEKLY_REVIEW (week 7)

- Athlete: 13 report(s): w2-run-d6 done 60min; w3-run-d1 done 45min; w3-run-d3 done 40min; w3-run-d6 done 60min; w4-run-d1 done 45min; w4-run-d3 done 40min; w4-run-d6 not done; w5-run-d1 done 45min; w5-run-d3 done 40min; w5-run-d6 not done; w6-run-d1 done 45min; w6-run-d3 done 45min; w6-run-d6 done 60min
- Coach: **MODIFY** / REPLAN_FROM_EVIDENCE · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: The reports of the run sessions that had no report answer the question about unreported training: the sessions still ahead are planned from those facts, not from the doses stored while they were unknown; completed sessions stay as they were; Final week of the horizon; record outcomes for the next program
- Current week 7 (DEVELOPMENT) from 2027-01-04: d1 2027-01-04 PM RUN EASY 45min (EASY +strides) | d2 2027-01-05 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2027-01-06 PM RUN EASY 40min (EASY) | d5 2027-01-08 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2027-01-09 PM RUN LONG 60min (LONG)

### s4 · 2027-01-04T07:00:00+01:00 · EQUIPMENT_CHANGE (week 7)

- Athlete: no reports · changes `{"equipment":["BODYWEIGHT"],"from":"2027-01-04","to":"2027-01-09"}`
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Planned exercises already fit the available equipment; the equipment is recorded for the dates stated
- Current week 7 (DEVELOPMENT) from 2027-01-04: d1 2027-01-04 PM RUN EASY 45min (EASY +strides) | d2 2027-01-05 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2027-01-06 PM RUN EASY 40min (EASY) | d5 2027-01-08 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2027-01-09 PM RUN LONG 60min (LONG)

### s5 · 2027-01-09T19:00:00+01:00 · WEEKLY_REVIEW (week 7)

- Athlete: 5 report(s): w7-run-d1 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d6 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d2 done 25min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d5 done 25min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Final week of the horizon; record outcomes for the next program
- Current week 7 (DEVELOPMENT) from 2027-01-09: d6 2027-01-09 PM RUN LONG 60min (LONG)

**Automated properties.** no failure · not evaluable: P03 (2), P06 (2)

**Metamorphic.** no violation

**Author expectations.**
- e1 @s2 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"UNREPORTED_TRAINING"`
- e2 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e3 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e4 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e5 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The two long runs are known misses and the other runs known done; the last week continues near the planned doses without a long run above the longest long run actually done, and no make-up session is added.
- e6 @s4 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"KEEP"`
- e7 @s4 JUDGED [INVARIANT_ORACLE]: **JUDGED** — From Monday to Saturday strength uses bodyweight exercises only.

**Independent assessment (author, written before any output).**
- Rationale: An intermediate hybrid with a broken watch; she trained but logged nothing. Asked, she says every run was done except two long runs.
- Preferred: Ask before planning the last week; on the answer, keep the plan roughly as projected, cap the last long run at what was actually done, and switch the trip-week strength to bodyweight.
- Acceptable alternatives: A modest reduction of the last long run because two long runs were missed / Asking about strength sessions as well
- Concerns: Planning the last week before asking / Treating the unreported weeks as all missed / Adding a make-up long run / Dumbbell exercises during the hotel week
- Domain notes: Answer at 06:45, fifteen minutes before the re-sent equipment change and before the Monday evening run; strength sessions on days 2 and 5 follow the answer day. The two long runs are named by role in weeks no adopted decision re-planned.

## R7D-H18

**Intent.** A 12-day road-trip break is stated in a review whose eligibility carries new knee pain; after a qualified clearance the next reviews apply and then leave the break without restating it.

**Tags.** CLINICAL_SIGNAL, CLINICAL_PAUSE, BALANCED_HYBRID, H8, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, RETURN_SHORT, START_NON_MONDAY, TIMEZONE, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-14","weeks":8,"asOf":"2026-11-12","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":135,"longestRunMinutes":60,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[1,5],"runMinutes":45,"strengthMinutes":40,"longRunDay":0,"longRunMinutes":70}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-14  RUN LONG 55min (LONG) | d1 2026-11-15  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-16  RUN EASY 35min (EASY) | d4 2026-11-18  RUN EASY 35min (EASY) | d5 2026-11-19  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-21  RUN LONG 55min (LONG) | d1 2026-11-22  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-23  RUN EASY 35min (EASY) | d4 2026-11-25  RUN EASY 35min (EASY) | d5 2026-11-26  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW

### s1 · 2026-12-11T19:00:00-05:00 · WEEKLY_REVIEW (week 3)

- Athlete: eligibility CLINICAL · 11 report(s): w0-run-d0 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d1 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d5 not done · break `{"startDate":"2026-11-28","endDate":"2026-12-09","reasonCategory":"VACATION","nonclinical":true,"reason":"road trip with friends"}`
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: A current clinical flag routes to qualified human assessment; no dependent prescription or return recipe
- Record: break declared 2026-12-12T00:00:00.000Z with a WEEKLY_REVIEW report (R7D-H18-s1), not applied yet: `{"startDate":"2026-11-28","endDate":"2026-12-09","reasonCategory":"VACATION","nonclinical":true,"reason":"road trip with friends"}`
- Current week 3 (DEVELOPMENT) from 2026-12-11: —
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-12  RUN LONG 50min (LONG) | d1 2026-12-13  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-14  RUN EASY 40min (EASY +strides) | d4 2026-12-16  RUN EASY 35min (EASY) | d5 2026-12-17  STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW

### s2 · 2026-12-12T08:00:00-05:00 · WEEKLY_REVIEW (week 4)

- Athlete: qualified clearance · no reports · client notes QUALIFIED_CLEARANCE_APPLIED
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: The break reported on 2026-12-11 is on record and applied now: moderate nonclinical interruption (12 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 4 (CONSOLIDATION) from 2026-12-12: d0 2026-12-12  RUN LONG 20min (LONG) | d1 2026-12-13  STRENGTH_FULL_A 19min: goblet-squat 1x8 RIR4 establish; db-floor-press 1x8 RIR4 establish; db-row 1x8 RIR4 establish; standing-calf-raise 1x8 RIR4 BW; dead-bug 1x8 RIR4 BW | d2 2026-12-14  RUN EASY 15min (EASY) | d4 2026-12-16  RUN EASY 15min (EASY) | d5 2026-12-17  STRENGTH_FULL_B 19min: db-rdl 1x8 RIR4 establish; db-row 1x8 RIR4 establish; db-floor-press 1x8 RIR4 establish; db-split-squat 1x8 RIR4 establish; dead-bug 1x8 RIR4 BW
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-19  RUN LONG 25min (LONG) | d1 2026-12-20  STRENGTH_FULL_A 19min: goblet-squat 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; standing-calf-raise 1x8 RIR3 BW; dead-bug 1x8 RIR3 BW | d2 2026-12-21  RUN EASY 25min (EASY) | d4 2026-12-23  RUN EASY 25min (EASY) | d5 2026-12-24  STRENGTH_FULL_B 19min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-split-squat 1x8 RIR3 last logged; dead-bug 1x8 RIR3 BW

### s3 · 2026-12-18T19:00:00-05:00 · WEEKLY_REVIEW (week 4)

- Athlete: 5 report(s): w4-run-d0 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d2 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d4 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d1 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d5 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 3 load question(s) · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged; first logged loads wait for confirmation before they become numbers (goblet-squat, db-rdl, db-split-squat)
- Gates: `{"EASY":"ADVANCE","goblet-squat":"ADVANCE","db-floor-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 4 (CONSOLIDATION) from 2026-12-18: —
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-19  RUN LONG 25min (LONG) | d1 2026-12-20  STRENGTH_FULL_A 19min: goblet-squat 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 14kg PER_HAND; db-row 1x8 RIR3 18kg PER_HAND; standing-calf-raise 1x8 RIR3 BW; dead-bug 1x8 RIR3 BW | d2 2026-12-21  RUN EASY 25min (EASY) | d4 2026-12-23  RUN EASY 25min (EASY) | d5 2026-12-24  STRENGTH_FULL_B 19min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 18kg PER_HAND; db-floor-press 1x8 RIR3 14kg PER_HAND; db-split-squat 1x8 RIR3 last logged; dead-bug 1x8 RIR3 BW

**Automated properties.** no failure · not evaluable: P08 (1)

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e4 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e5 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The return reflects a stop of about two weeks (the 12-day trip plus the Thursday session not done after it): running and strength resume below the week-1 doses, and the plan from before the trip is not reused as if nothing happened.
- e6 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- e7 @s3 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The break is not applied a second time and the plan progresses from the executed week 4.

**Independent assessment (author, written before any output).**
- Rationale: A hybrid athlete reports a road trip together with new knee pain. Pain comes first; the trip is a fact the coach keeps.
- Preferred: Route to a qualified human and prescribe nothing; after the physiotherapist clears, apply the trip as a short return at the next review without asking the athlete to state it again, then continue normally.
- Acceptable alternatives: At s2, a brief check of how the knee feels on easy runs, without reopening a clinical route / A slightly more conservative first week than the stop length alone suggests
- Concerns: Planning the return while the pain route stands / Forgetting the trip after clearance and continuing the pre-trip plan / Asking the athlete to state the trip again / Applying the trip twice
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H19

**Intent.** A novice back from an offshore work rotation reports the break in a return report while the eligibility now shows an illness; a qualified clearance, then reviews that do not restate the break.

**Tags.** CLINICAL_SIGNAL, CLINICAL_PAUSE, GENERAL_FITNESS, H12, RUN_EXP_NOVICE, STR_EXP_NONE, BODYWEIGHT_ONLY, RETURN_SHORT, START_NON_MONDAY, TIMEZONE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":12,"asOf":"2026-11-10","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":60,"longestRunMinutes":30},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,5],"strengthDays":[1,4],"runMinutes":35,"strengthMinutes":30,"longRunDay":3}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-12  RUN EASY 15min (EASY) | d1 2026-11-13  STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d3 2026-11-15  RUN LONG 20min (LONG) | d4 2026-11-16  STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW | d5 2026-11-17  RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-19  RUN EASY 15min (EASY) | d1 2026-11-20  STRENGTH_FULL_A 24min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW | d3 2026-11-22  RUN LONG 20min (LONG) | d4 2026-11-23  STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW | d5 2026-11-24  RUN EASY 15min (EASY)

### s1 · 2026-12-07T18:00:00+01:00 · RETURN_AFTER_PAUSE (week 3)

- Athlete: eligibility CLINICAL · 10 report(s): w0-run-d0 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 12min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d1 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-11-26","endDate":"2026-12-06","reasonCategory":"WORK","nonclinical":true,"reason":"offshore work rotation"}`
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: A current clinical flag routes to qualified human assessment; no dependent prescription or return recipe
- Record: break declared 2026-12-07T17:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H19-s1), not applied yet: `{"startDate":"2026-11-26","endDate":"2026-12-06","reasonCategory":"WORK","nonclinical":true,"reason":"offshore work rotation"}`
- Current week 3 (DEVELOPMENT) from 2026-12-07: d4 2026-12-07  STRENGTH_FULL_B 26min: glute-bridge 2x14 RIR3 BW; band-row 2x12 RIR3 BW; incline-push-up 2x14 RIR3 BW | d5 2026-12-08  RUN EASY 15min (EASY)
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-10  RUN EASY 20min (EASY +strides) | d1 2026-12-11  STRENGTH_FULL_A 17min: box-squat-bodyweight 1x16 RIR3 BW; incline-push-up 1x16 RIR3 BW; band-row 1x12 RIR3 BW | d3 2026-12-13  RUN LONG 15min (LONG) | d4 2026-12-14  STRENGTH_FULL_B 17min: glute-bridge 1x16 RIR3 BW; band-row 1x12 RIR3 BW; incline-push-up 1x16 RIR3 BW | d5 2026-12-15  RUN EASY 15min (EASY)

### s2 · 2026-12-09T19:00:00+01:00 · WEEKLY_REVIEW (week 3)

- Athlete: qualified clearance · no reports · client notes QUALIFIED_CLEARANCE_APPLIED
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: The break reported on 2026-12-07 is on record and applied now: moderate nonclinical interruption (11 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 3 (DEVELOPMENT) from 2026-12-09: —
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-10  RUN EASY 15min (EASY) | d1 2026-12-11  STRENGTH_FULL_A 16min: box-squat-bodyweight 1x10 RIR4 BW; incline-push-up 1x10 RIR4 BW; band-row 1x10 RIR4 BW | d3 2026-12-13  RUN LONG 20min (LONG) | d4 2026-12-14  STRENGTH_FULL_B 16min: glute-bridge 1x10 RIR4 BW; band-row 1x10 RIR4 BW; incline-push-up 1x10 RIR4 BW | d5 2026-12-15  RUN EASY 15min (EASY)

### s3 · 2026-12-16T19:00:00+01:00 · WEEKLY_REVIEW (week 4)

- Athlete: 5 report(s): w4-run-d0 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d3 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d5 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d1 done 16min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d4 done 16min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"EASY":"ADVANCE","box-squat-bodyweight":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE","glute-bridge":"ADVANCE"}`
- Current week 4 (CONSOLIDATION) from 2026-12-16: —
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-17  RUN EASY 15min (EASY) | d1 2026-12-18  STRENGTH_FULL_A 16min: box-squat-bodyweight 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; band-row 1x10 RIR3 BW | d3 2026-12-20  RUN LONG 25min (LONG) | d4 2026-12-21  STRENGTH_FULL_B 16min: glute-bridge 1x10 RIR3 BW; band-row 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW | d5 2026-12-22  RUN EASY 15min (EASY)

**Automated properties.** no failure · not evaluable: P08 (1)

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e4 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e5 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The 11-day work break is applied as a short return for a novice: easy running and bodyweight strength at or below the week-1 level, no progression from the unexecuted weeks.
- e6 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`

**Independent assessment (author, written before any output).**
- Rationale: A novice who had just started is away for 11 days for work and comes back ill. Illness comes first; the work break is a nonclinical fact the coach keeps.
- Preferred: Route to a qualified human and prescribe nothing; once cleared, apply the kept work break as a short return at the next review, gently for a novice, then continue.
- Acceptable alternatives: Repeating week 1 after clearance / Asking how the athlete feels on the first easy session before progressing
- Concerns: Planning a return while the illness route stands / Treating the infection as the break reason and holding the athlete forever / Losing the work break after clearance
- Domain notes: —

## R7D-H20

**Intent.** A break stated in a weekly review while still under way is kept and asked about; the athlete then sends a plain return report on Thursday, after the Monday to Wednesday sessions fell inside the break.

**Tags.** BALANCED_HYBRID, H8, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, RETURN_SHORT, TIMEZONE, SKIPPED_REVIEW, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":8,"asOf":"2026-11-28","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":65,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[0,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":50,"strengthMinutes":40,"longRunDay":5,"longRunMinutes":75}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-30 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-01 PM RUN EASY 40min (EASY) | d3 2026-12-03 PM RUN EASY 40min (EASY) | d3 2026-12-03 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d5 2026-12-05 PM RUN LONG 60min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-12-07 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-08 PM RUN EASY 40min (EASY) | d3 2026-12-10 PM RUN EASY 40min (EASY) | d3 2026-12-10 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2026-12-12 PM RUN LONG 60min (LONG)

### s1 · 2026-12-20T19:00:00+01:00 · WEEKLY_REVIEW (week 2)

- Athlete: 14 report(s): w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-18","endDate":"2026-12-23","reasonCategory":"VACATION","nonclinical":true,"reason":"long weekend in the mountains, back on Wednesday"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption reason is unclear; say what it was and confirm it involved no pain, injury or illness
- Record: break declared 2026-12-20T18:00:00.000Z with a WEEKLY_REVIEW report (R7D-H20-s1), not applied yet: `{"startDate":"2026-12-18","endDate":"2026-12-23","reasonCategory":"VACATION","nonclinical":true,"reason":"long weekend in the mountains, back on Wednesday"}`
- Current week 2 (DEVELOPMENT) from 2026-12-20: —
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-21 AM STRENGTH_FULL_A 29min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2026-12-22 PM RUN EASY 45min (EASY +strides) | d3 2026-12-24 PM RUN EASY 40min (EASY) | d3 2026-12-24 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d5 2026-12-26 PM RUN LONG 60min (LONG)

### s2 · 2026-12-24T07:00:00+01:00 · RETURN_AFTER_PAUSE (week 3)

- Athlete: no reports
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption reason is unclear; say what it was and confirm it involved no pain, injury or illness
- Record: break declared 2026-12-20T18:00:00.000Z with a WEEKLY_REVIEW report (R7D-H20-s1), not applied yet: `{"startDate":"2026-12-18","endDate":"2026-12-23","reasonCategory":"VACATION","nonclinical":true,"reason":"long weekend in the mountains, back on Wednesday"}`
- Current week 3 (DEVELOPMENT) from 2026-12-24: d3 2026-12-24 PM RUN EASY 40min (EASY) | d3 2026-12-24 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d5 2026-12-26 PM RUN LONG 60min (LONG)
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-28 AM STRENGTH_FULL_A 21min: goblet-squat 1x10 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2026-12-29 PM RUN EASY 45min (EASY +strides) | d3 2026-12-31 PM RUN EASY 40min (EASY) | d3 2026-12-31 AM STRENGTH_FULL_B 20min: db-rdl 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d5 2027-01-02 PM RUN LONG 50min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"ASK"`
- e4 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **FAIL** observed `"REQUIRES_RECONCILIATION"`
- e5 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The kept break is applied without being stated again; the week-2 Saturday long run and the Monday to Wednesday sessions of week 3 fell inside the break and are not counted; the weeks after are planned from the runs completed before it.
- e6 @s2 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":50,"otherWeek":60}`

**Independent assessment (author, written before any output).**
- Rationale: A short mountain break, stated on Sunday while still under way, and a Thursday return.
- Preferred: Keep the break and plan nothing while it is under way; on the Thursday return report apply it, count nothing inside it, and resume from the doses completed before it, with the long run capped by the week-1 long run.
- Acceptable alternatives: Resume the remaining week-3 sessions unchanged if two or more are still ahead / Ask whether the athlete trained in the mountains
- Concerns: Applying the break at the Sunday review as if it had ended / Counting the Saturday long run inside the break / Requiring the break to be restated
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H21

**Intent.** A three-week overseas trip, stated while under way, is followed the next day by a 3-day house move reported in a return report; a plain review then states none, and the athlete says the move is a separate break.

**Tags.** BALANCED_HYBRID, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, RETURN_MODERATE, TIMEZONE, NON_RACE, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":12,"asOf":"2026-11-14","tz":-360,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[0,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":45,"longRunDay":5,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-16 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-17 AM RUN EASY 40min (EASY) | d3 2026-11-19 AM RUN EASY 40min (EASY) | d3 2026-11-19 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2026-11-21 AM RUN LONG 65min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-23 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-24 AM RUN EASY 40min (EASY) | d3 2026-11-26 AM RUN EASY 40min (EASY) | d3 2026-11-26 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2026-11-28 AM RUN LONG 65min (LONG)

### s1 · 2026-12-13T19:00:00-06:00 · WEEKLY_REVIEW (week 3)

- Athlete: 15 report(s): w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-07","endDate":"2026-12-23","reasonCategory":"VACATION","nonclinical":true,"reason":"three weeks with family overseas"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-14T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H21-s1), not applied yet: `{"startDate":"2026-12-07","endDate":"2026-12-23","reasonCategory":"VACATION","nonclinical":true,"reason":"three weeks with family overseas"}`
- Current week 3 (DEVELOPMENT) from 2026-12-13: —
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-14 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; db-bench-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-15 AM RUN EASY 45min (EASY +strides) | d3 2026-12-17 AM RUN EASY 40min (EASY) | d3 2026-12-17 PM STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-bench-press 1x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2026-12-19 AM RUN LONG 55min (LONG)

### s2 · 2026-12-27T17:00:00-06:00 · RETURN_AFTER_PAUSE (week 5)

- Athlete: no reports · break `{"startDate":"2026-12-24","endDate":"2026-12-26","reasonCategory":"FAMILY","nonclinical":true,"reason":"helped my brother move house right after the trip"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question INTERRUPTION_RELATION (0 sessions, from week undefined)
- Reason: Breaks in training reported on 2026-12-13 (2026-12-07 to 2026-12-23) and 2026-12-27 (2026-12-24 to 2026-12-26) are on record and not applied, and the one reported on 2026-12-27 (2026-12-24 to 2026-12-26, episodeId R7D-H21-s2) does not say how it relates to the earlier: report it again with an episodeId, the earlier break's if it corrects that break, or its own if it is a separate break. No break is replaced or joined to another on its own and the earlier facts need not be stated again; until then no return dose is chosen and the plan is not valid
- Record: break declared 2026-12-14T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H21-s1), not applied yet: `{"startDate":"2026-12-07","endDate":"2026-12-23","reasonCategory":"VACATION","nonclinical":true,"reason":"three weeks with family overseas"}`
- Record: break declared 2026-12-27T23:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H21-s2), not applied yet: `{"startDate":"2026-12-24","endDate":"2026-12-26","reasonCategory":"FAMILY","nonclinical":true,"reason":"helped my brother move house right after the trip"}`
- Current week 5 (DEVELOPMENT) from 2026-12-27: —
- Next week 6 (DEVELOPMENT, provisional): d0 2026-12-28 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-29 AM RUN EASY 45min (EASY +strides) | d3 2026-12-31 AM RUN EASY 45min (EASY) | d3 2026-12-31 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2027-01-02 AM RUN LONG 65min (LONG)

### s3 · 2026-12-27T18:00:00-06:00 · WEEKLY_REVIEW (week 5)

- Athlete: no reports
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question INTERRUPTION_RELATION (0 sessions, from week undefined)
- Reason: Breaks in training reported on 2026-12-13 (2026-12-07 to 2026-12-23) and 2026-12-27 (2026-12-24 to 2026-12-26) are on record and not applied, and the one reported on 2026-12-27 (2026-12-24 to 2026-12-26, episodeId R7D-H21-s2) does not say how it relates to the earlier: report it again with an episodeId, the earlier break's if it corrects that break, or its own if it is a separate break. No break is replaced or joined to another on its own and the earlier facts need not be stated again; until then no return dose is chosen and the plan is not valid
- Record: break declared 2026-12-14T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H21-s1), not applied yet: `{"startDate":"2026-12-07","endDate":"2026-12-23","reasonCategory":"VACATION","nonclinical":true,"reason":"three weeks with family overseas"}`
- Record: break declared 2026-12-27T23:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H21-s2), not applied yet: `{"startDate":"2026-12-24","endDate":"2026-12-26","reasonCategory":"FAMILY","nonclinical":true,"reason":"helped my brother move house right after the trip"}`
- Current week 5 (DEVELOPMENT) from 2026-12-27: —
- Next week 6 (DEVELOPMENT, provisional): d0 2026-12-28 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-29 AM RUN EASY 45min (EASY +strides) | d3 2026-12-31 AM RUN EASY 45min (EASY) | d3 2026-12-31 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2027-01-02 AM RUN LONG 65min (LONG)

### s4 · 2026-12-27T18:30:00-06:00 · WEEKLY_REVIEW (week 5)

- Athlete: no reports · break `{"startDate":"2026-12-24","endDate":"2026-12-26","reasonCategory":"FAMILY","nonclinical":true,"reason":"helped my brother move house right after the trip","episodeId":"R7D-H21-s2"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-07 to 2026-12-23; 2026-12-24 to 2026-12-26), each its own interruption; the stop read runs from 2026-12-07 to 2026-12-26 with no training recorded between them: moderate nonclinical interruption (20 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 5 (DEVELOPMENT) from 2026-12-27: —
- Next week 6 (DEVELOPMENT, provisional): d0 2026-12-28 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR4 establish; db-bench-press 1x8 RIR4 establish; db-row 1x8 RIR4 establish; standing-calf-raise 1x12 RIR4 BW; dead-bug 1x12 RIR4 BW | d1 2026-12-29 AM RUN EASY 15min (EASY) | d3 2026-12-31 AM RUN EASY 15min (EASY) | d3 2026-12-31 PM STRENGTH_FULL_B 19min: db-rdl 1x8 RIR4 establish; db-row 1x8 RIR4 establish; db-bench-press 1x8 RIR4 establish; db-split-squat 1x8 RIR4 establish; dead-bug 1x12 RIR4 BW | d5 2027-01-02 AM RUN LONG 20min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s2 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"INTERRUPTION_RELATION"`
- e2 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e3 @s3 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"INTERRUPTION_RELATION"`
- e4 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e5 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e6 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The move touches the trip, so the separate breaks read as one continuous stop from 7 Dec to 26 Dec (20 days); the return is that of a stop of almost three weeks, not of the 3-day move, and the two breaks' days are not summed beyond that stop.
- e7 @s4 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":20,"otherWeek":65}`

**Independent assessment (author, written before any output).**
- Rationale: A long family trip and a short house move back to back. The move alone would be a short break; together they are almost three weeks without training.
- Preferred: Ask how the two breaks relate before planning; once the athlete says the move is a separate break, read the stop from the first day of the trip to the last day of the move and plan the return for about three weeks off.
- Acceptable alternatives: A short question about whether any training happened during the trip / A return slightly more conservative because strength was also stopped
- Concerns: Classing the return by the 3-day move alone / Treating the move as replacing the trip / Planning before the relation is answered
- Domain notes: —

## R7D-H22

**Intent.** A conference trip stated as starting that night is postponed; the athlete trains Monday to Thursday, travels Friday to Sunday, reports that trip, and when asked says it corrects the earlier report.

**Tags.** BALANCED_HYBRID, H8, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, RETURN_SHORT, CORRECTION, TIMEZONE, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":8,"asOf":"2026-11-07","tz":120,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":130,"longestRunMinutes":55,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[0,2],"runMinutes":45,"strengthMinutes":40,"longRunDay":5,"longRunMinutes":70}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-09  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-10  RUN EASY 35min (EASY) | d2 2026-11-11  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-12  RUN EASY 35min (EASY) | d5 2026-11-14  RUN LONG 55min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-16  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-17  RUN EASY 35min (EASY) | d2 2026-11-18  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-19  RUN EASY 35min (EASY) | d5 2026-11-21  RUN LONG 55min (LONG)

### s1 · 2026-11-29T19:00:00+02:00 · WEEKLY_REVIEW (week 2)

- Athlete: 15 report(s): w0-run-d1 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d1 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d2 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d2 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d2 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-11-29","endDate":"2026-12-02","reasonCategory":"WORK","nonclinical":true,"reason":"conference abroad, flying out tonight"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-11-29T17:00:00.000Z with a WEEKLY_REVIEW report (R7D-H22-s1), not applied yet: `{"startDate":"2026-11-29","endDate":"2026-12-02","reasonCategory":"WORK","nonclinical":true,"reason":"conference abroad, flying out tonight"}`
- Current week 2 (DEVELOPMENT) from 2026-11-29: —
- Next week 3 (DEVELOPMENT, provisional): d0 2026-11-30  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2026-12-01  RUN EASY 40min (EASY +strides) | d2 2026-12-02  STRENGTH_FULL_B 29min: glute-bridge 2x14 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d3 2026-12-03  RUN EASY 35min (EASY) | d5 2026-12-05  RUN LONG 60min (LONG)

### s2 · 2026-12-07T19:00:00+02:00 · RETURN_AFTER_PAUSE (week 4)

- Athlete: no reports · break `{"startDate":"2026-12-04","endDate":"2026-12-06","reasonCategory":"WORK","nonclinical":true,"reason":"conference: the flight was moved, the trip was Friday to Sunday"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question INTERRUPTION_RELATION (0 sessions, from week undefined)
- Reason: Breaks in training reported on 2026-11-29 (2026-11-29 to 2026-12-02) and 2026-12-07 (2026-12-04 to 2026-12-06) are on record and not applied, and the one reported on 2026-12-07 (2026-12-04 to 2026-12-06, episodeId R7D-H22-s2) does not say how it relates to the earlier: report it again with an episodeId, the earlier break's if it corrects that break, or its own if it is a separate break. No break is replaced or joined to another on its own and the earlier facts need not be stated again; until then no return dose is chosen and the plan is not valid
- Record: break declared 2026-11-29T17:00:00.000Z with a WEEKLY_REVIEW report (R7D-H22-s1), not applied yet: `{"startDate":"2026-11-29","endDate":"2026-12-02","reasonCategory":"WORK","nonclinical":true,"reason":"conference abroad, flying out tonight"}`
- Record: break declared 2026-12-07T17:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H22-s2), not applied yet: `{"startDate":"2026-12-04","endDate":"2026-12-06","reasonCategory":"WORK","nonclinical":true,"reason":"conference: the flight was moved, the trip was Friday to Sunday"}`
- Current week 4 (CONSOLIDATION) from 2026-12-07: d0 2026-12-07  STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2026-12-08  RUN EASY 40min (EASY +strides) | d2 2026-12-09  STRENGTH_FULL_B 21min: glute-bridge 1x16 RIR3 BW; db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d3 2026-12-10  RUN EASY 35min (EASY) | d5 2026-12-12  RUN LONG 50min (LONG)
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-14  STRENGTH_FULL_A 40min: goblet-squat 3x10 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; standing-calf-raise 2x16 RIR3 BW; dead-bug 2x16 RIR3 BW | d1 2026-12-15  RUN EASY 40min (EASY +strides) | d2 2026-12-16  STRENGTH_FULL_B 37min: glute-bridge 3x16 RIR3 BW; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; reverse-lunge 2x16 RIR3 BW | d3 2026-12-17  RUN EASY 35min (EASY) | d5 2026-12-19  RUN LONG 60min (LONG)

### s3 · 2026-12-07T19:20:00+02:00 · WEEKLY_REVIEW (week 4)

- Athlete: 4 report(s): w3-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d2 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question INTERRUPTION_RELATION (0 sessions, from week undefined)
- Reason: Breaks in training reported on 2026-11-29 (2026-11-29 to 2026-12-02) and 2026-12-07 (2026-12-04 to 2026-12-06) are on record and not applied, and the one reported on 2026-12-07 (2026-12-04 to 2026-12-06, episodeId R7D-H22-s2) does not say how it relates to the earlier: report it again with an episodeId, the earlier break's if it corrects that break, or its own if it is a separate break. No break is replaced or joined to another on its own and the earlier facts need not be stated again; until then no return dose is chosen and the plan is not valid
- Record: break declared 2026-11-29T17:00:00.000Z with a WEEKLY_REVIEW report (R7D-H22-s1), not applied yet: `{"startDate":"2026-11-29","endDate":"2026-12-02","reasonCategory":"WORK","nonclinical":true,"reason":"conference abroad, flying out tonight"}`
- Record: break declared 2026-12-07T17:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H22-s2), not applied yet: `{"startDate":"2026-12-04","endDate":"2026-12-06","reasonCategory":"WORK","nonclinical":true,"reason":"conference: the flight was moved, the trip was Friday to Sunday"}`
- Current week 4 (CONSOLIDATION) from 2026-12-07: d0 2026-12-07  STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2026-12-08  RUN EASY 40min (EASY +strides) | d2 2026-12-09  STRENGTH_FULL_B 21min: glute-bridge 1x16 RIR3 BW; db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d3 2026-12-10  RUN EASY 35min (EASY) | d5 2026-12-12  RUN LONG 50min (LONG)
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-14  STRENGTH_FULL_A 40min: goblet-squat 3x10 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; standing-calf-raise 2x16 RIR3 BW; dead-bug 2x16 RIR3 BW | d1 2026-12-15  RUN EASY 40min (EASY +strides) | d2 2026-12-16  STRENGTH_FULL_B 37min: glute-bridge 3x16 RIR3 BW; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; reverse-lunge 2x16 RIR3 BW | d3 2026-12-17  RUN EASY 35min (EASY) | d5 2026-12-19  RUN LONG 60min (LONG)

### s4 · 2026-12-07T19:40:00+02:00 · WEEKLY_REVIEW (week 4)

- Athlete: no reports · break `{"startDate":"2026-12-04","endDate":"2026-12-06","reasonCategory":"WORK","nonclinical":true,"reason":"conference: the flight was moved, the trip was Friday to Sunday","episodeId":"R7D-H22-s1"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: short nonclinical interruption (3 days): resume the last completed doses; no step until execution is observed
- Current week 4 (CONSOLIDATION) from 2026-12-07: d0 2026-12-07  STRENGTH_FULL_A 21min: goblet-squat 1x12 RIR3 16kg SINGLE_IMPLEMENT; db-floor-press 1x10 RIR3 10kg PER_HAND; db-row 1x10 RIR3 12kg PER_HAND; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2026-12-08  RUN EASY 40min (EASY +strides) | d2 2026-12-09  STRENGTH_FULL_B 21min: glute-bridge 1x14 RIR3 BW; db-row 1x10 RIR3 12kg PER_HAND; db-floor-press 1x10 RIR3 10kg PER_HAND; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d3 2026-12-10  RUN EASY 35min (EASY) | d5 2026-12-12  RUN LONG 45min (LONG)
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-14  STRENGTH_FULL_A 37min: goblet-squat 3x12 RIR3 16kg SINGLE_IMPLEMENT; db-floor-press 3x10 RIR3 10kg PER_HAND; db-row 3x10 RIR3 12kg PER_HAND; standing-calf-raise 2x16 RIR3 BW | d1 2026-12-15  RUN EASY 40min (EASY +strides) | d2 2026-12-16  STRENGTH_FULL_B 38min: glute-bridge 3x14 RIR3 BW; db-row 3x10 RIR3 12kg PER_HAND; db-floor-press 3x10 RIR3 10kg PER_HAND; reverse-lunge 2x16 RIR3 BW | d3 2026-12-17  RUN EASY 35min (EASY) | d5 2026-12-19  RUN LONG 55min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s2 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"INTERRUPTION_RELATION"`
- e2 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e3 @s3 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"INTERRUPTION_RELATION"`
- e4 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e5 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e6 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The later report corrects the earlier one: the break is the 3-day trip from Friday to Sunday. The Monday to Thursday sessions done that week are training, the first dates are not days of a stop, and the return is a short one close to the pre-trip doses.

**Independent assessment (author, written before any output).**
- Rationale: A trip announced as starting that night was postponed; the athlete kept training and travelled later. The second report is a correction of the first.
- Preferred: Ask how the reports relate; once the athlete says it is the same trip corrected, use only the Friday to Sunday break, count the Monday to Thursday training, and plan a short return close to the pre-trip doses.
- Acceptable alternatives: Continue the pre-trip plan with no return step for a 3-day break
- Concerns: Reading a stop from the first reported date to the last day of the trip / Keeping both reports as two breaks after the athlete said it was one / Ignoring the Monday to Thursday sessions
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H23

**Intent.** A novice states a wedding break while under way, then a stocktaking week; asked, she says it is a separate break; asked about the sessions between, she reports that only one Saturday run was done.

**Tags.** BALANCED_HYBRID, H12, RUN_EXP_NOVICE, STR_EXP_NOVICE, RETURN_MODERATE, START_NON_MONDAY, TIMEZONE, PARTIAL_ANSWER, SKIPPED_REVIEW, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-13","weeks":12,"asOf":"2026-11-11","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":90,"longestRunMinutes":40,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[2,5],"runMinutes":35,"strengthMinutes":35,"longRunDay":1,"longRunMinutes":50}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-14  RUN LONG 40min (LONG) | d2 2026-11-15  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-11-16  RUN EASY 25min (EASY) | d5 2026-11-18  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-11-19  RUN EASY 25min (EASY)
- Week 1 (DEVELOPMENT): d1 2026-11-21  RUN LONG 40min (LONG) | d2 2026-11-22  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-23  RUN EASY 25min (EASY) | d5 2026-11-25  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-11-26  RUN EASY 25min (EASY)

### s1 · 2026-11-30T20:00:00-05:00 · WEEKLY_REVIEW (week 2)

- Athlete: 10 report(s): w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d6 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d6 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d2 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d2 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-11-27","endDate":"2026-12-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family wedding abroad"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-01T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H23-s1), not applied yet: `{"startDate":"2026-11-27","endDate":"2026-12-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family wedding abroad"}`
- Current week 2 (DEVELOPMENT) from 2026-11-30: d3 2026-11-30  RUN EASY 25min (EASY) | d5 2026-12-02  STRENGTH_FULL_B 28min: glute-bridge 2x12 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2026-12-03  RUN EASY 25min (EASY)
- Next week 3 (DEVELOPMENT, provisional): d1 2026-12-05  RUN LONG 40min (LONG) | d2 2026-12-06  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d3 2026-12-07  RUN EASY 30min (EASY +strides) | d5 2026-12-09  STRENGTH_FULL_B 29min: glute-bridge 2x14 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d6 2026-12-10  RUN EASY 25min (EASY)

### s2 · 2026-12-18T07:00:00-05:00 · RETURN_AFTER_PAUSE (week 5)

- Athlete: no reports · break `{"startDate":"2026-12-11","endDate":"2026-12-17","reasonCategory":"WORK","nonclinical":true,"reason":"stocktaking week at the shop"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question INTERRUPTION_RELATION (0 sessions, from week undefined)
- Reason: Breaks in training reported on 2026-11-30 (2026-11-27 to 2026-12-01) and 2026-12-18 (2026-12-11 to 2026-12-17) are on record and not applied, and the one reported on 2026-12-18 (2026-12-11 to 2026-12-17, episodeId R7D-H23-s2) does not say how it relates to the earlier: report it again with an episodeId, the earlier break's if it corrects that break, or its own if it is a separate break. No break is replaced or joined to another on its own and the earlier facts need not be stated again; until then no return dose is chosen and the plan is not valid
- Record: break declared 2026-12-01T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H23-s1), not applied yet: `{"startDate":"2026-11-27","endDate":"2026-12-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family wedding abroad"}`
- Record: break declared 2026-12-18T12:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H23-s2), not applied yet: `{"startDate":"2026-12-11","endDate":"2026-12-17","reasonCategory":"WORK","nonclinical":true,"reason":"stocktaking week at the shop"}`
- Current week 5 (DEVELOPMENT) from 2026-12-18: d1 2026-12-19  RUN LONG 40min (LONG) | d2 2026-12-20  STRENGTH_FULL_A 32min: goblet-squat 3x10 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged | d3 2026-12-21  RUN EASY 30min (EASY +strides) | d5 2026-12-23  STRENGTH_FULL_B 33min: glute-bridge 3x16 RIR3 BW; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged | d6 2026-12-24  RUN EASY 25min (EASY)
- Next week 6 (DEVELOPMENT, provisional): d1 2026-12-26  RUN LONG 40min (LONG) | d2 2026-12-27  STRENGTH_FULL_A 32min: goblet-squat 3x10 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged | d3 2026-12-28  RUN EASY 30min (EASY +strides) | d5 2026-12-30  STRENGTH_FULL_B 33min: glute-bridge 3x16 RIR3 BW; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged | d6 2026-12-31  RUN EASY 30min (EASY)

### s3 · 2026-12-18T07:20:00-05:00 · WEEKLY_REVIEW (week 5)

- Athlete: no reports
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question INTERRUPTION_RELATION (0 sessions, from week undefined)
- Reason: Breaks in training reported on 2026-11-30 (2026-11-27 to 2026-12-01) and 2026-12-18 (2026-12-11 to 2026-12-17) are on record and not applied, and the one reported on 2026-12-18 (2026-12-11 to 2026-12-17, episodeId R7D-H23-s2) does not say how it relates to the earlier: report it again with an episodeId, the earlier break's if it corrects that break, or its own if it is a separate break. No break is replaced or joined to another on its own and the earlier facts need not be stated again; until then no return dose is chosen and the plan is not valid
- Record: break declared 2026-12-01T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H23-s1), not applied yet: `{"startDate":"2026-11-27","endDate":"2026-12-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family wedding abroad"}`
- Record: break declared 2026-12-18T12:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H23-s2), not applied yet: `{"startDate":"2026-12-11","endDate":"2026-12-17","reasonCategory":"WORK","nonclinical":true,"reason":"stocktaking week at the shop"}`
- Current week 5 (DEVELOPMENT) from 2026-12-18: d1 2026-12-19  RUN LONG 40min (LONG) | d2 2026-12-20  STRENGTH_FULL_A 32min: goblet-squat 3x10 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged | d3 2026-12-21  RUN EASY 30min (EASY +strides) | d5 2026-12-23  STRENGTH_FULL_B 33min: glute-bridge 3x16 RIR3 BW; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged | d6 2026-12-24  RUN EASY 25min (EASY)
- Next week 6 (DEVELOPMENT, provisional): d1 2026-12-26  RUN LONG 40min (LONG) | d2 2026-12-27  STRENGTH_FULL_A 32min: goblet-squat 3x10 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged | d3 2026-12-28  RUN EASY 30min (EASY +strides) | d5 2026-12-30  STRENGTH_FULL_B 33min: glute-bridge 3x16 RIR3 BW; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged | d6 2026-12-31  RUN EASY 30min (EASY)

### s4 · 2026-12-18T07:40:00-05:00 · WEEKLY_REVIEW (week 5)

- Athlete: no reports · break `{"startDate":"2026-12-11","endDate":"2026-12-17","reasonCategory":"WORK","nonclinical":true,"reason":"stocktaking week at the shop","episodeId":"R7D-H23-s2"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question TRAINING_BETWEEN_BREAKS (7 sessions, from week undefined)
- Reason: The breaks reported on 2026-11-30 (2026-11-27 to 2026-12-01) and on 2026-12-18 (2026-12-11 to 2026-12-17) are separate, and 7 planned sessions between them (2026-12-02 to 2026-12-10) have no report: say what was done (report the sessions, done or not done); training that is only unreported counts neither as done nor as not done, and the return depends on it
- Record: break declared 2026-12-01T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H23-s1), not applied yet: `{"startDate":"2026-11-27","endDate":"2026-12-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family wedding abroad"}`
- Record: break declared 2026-12-18T12:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H23-s2), not applied yet: `{"startDate":"2026-12-11","endDate":"2026-12-17","reasonCategory":"WORK","nonclinical":true,"reason":"stocktaking week at the shop"}`
- Record: break declared 2026-12-18T12:40:00.000Z with a WEEKLY_REVIEW report (R7D-H23-s4), not applied yet: `{"startDate":"2026-12-11","endDate":"2026-12-17","reasonCategory":"WORK","nonclinical":true,"reason":"stocktaking week at the shop","episodeId":"R7D-H23-s2"}`
- Current week 5 (DEVELOPMENT) from 2026-12-18: d1 2026-12-19  RUN LONG 40min (LONG) | d2 2026-12-20  STRENGTH_FULL_A 32min: goblet-squat 3x10 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged | d3 2026-12-21  RUN EASY 30min (EASY +strides) | d5 2026-12-23  STRENGTH_FULL_B 33min: glute-bridge 3x16 RIR3 BW; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged | d6 2026-12-24  RUN EASY 25min (EASY)
- Next week 6 (DEVELOPMENT, provisional): d1 2026-12-26  RUN LONG 40min (LONG) | d2 2026-12-27  STRENGTH_FULL_A 32min: goblet-squat 3x10 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged | d3 2026-12-28  RUN EASY 30min (EASY +strides) | d5 2026-12-30  STRENGTH_FULL_B 33min: glute-bridge 3x16 RIR3 BW; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged | d6 2026-12-31  RUN EASY 30min (EASY)

### s5 · 2026-12-18T08:00:00-05:00 · WEEKLY_REVIEW (week 5)

- Athlete: 7 report(s): w2-str-d5 not done; w2-run-d6 not done; w3-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d2 not done; w3-run-d3 not done; w3-str-d5 not done; w3-run-d6 not done
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-11-27 to 2026-12-01; 2026-12-11 to 2026-12-17), each its own interruption; the stop read runs from 2026-11-27 to 2026-12-17 through the training recorded between them, which completed no whole week of the plan (no re-entry): moderate nonclinical interruption (21 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 5 (DEVELOPMENT) from 2026-12-18: d1 2026-12-19  RUN LONG 20min (LONG) | d2 2026-12-20  STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR4 establish; db-floor-press 1x8 RIR4 establish; db-row 1x8 RIR4 establish; standing-calf-raise 1x12 RIR4 BW; dead-bug 1x12 RIR4 BW | d3 2026-12-21  RUN EASY 15min (EASY) | d5 2026-12-23  STRENGTH_FULL_B 20min: glute-bridge 1x10 RIR4 BW; db-row 1x8 RIR4 establish; db-floor-press 1x8 RIR4 establish; reverse-lunge 1x12 RIR4 BW; dead-bug 1x12 RIR4 BW | d6 2026-12-24  RUN EASY 15min (EASY)
- Next week 6 (DEVELOPMENT, provisional): d1 2026-12-26  RUN LONG 30min (LONG) | d2 2026-12-27  STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-28  RUN EASY 20min (EASY) | d5 2026-12-30  STRENGTH_FULL_B 20min: glute-bridge 1x10 RIR3 BW; db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-31  RUN EASY 20min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s2 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"INTERRUPTION_RELATION"`
- e2 @s3 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"INTERRUPTION_RELATION"`
- e3 @s3 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e4 @s4 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"TRAINING_BETWEEN_BREAKS"`
- e5 @s4 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e6 @s5 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e7 @s5 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e8 @s5 JUDGED [DOMAIN_ORACLE]: **JUDGED** — One run in the gap is a fact of the stop, not a re-entry: the stop runs from the wedding's first day (27 Nov) to the end of stocktaking (17 Dec), and the return is that of about three weeks off, not of the 7-day work break; the single run is not taken as proof that capacity is restored.
- e9 @s5 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":30,"otherWeek":40}`

**Independent assessment (author, written before any output).**
- Rationale: A novice with two breaks a week and a half apart; between them she ran once. One run in three weeks is not a training block.
- Preferred: Ask how the breaks relate, then ask what happened between them; with only one run done, read the stop from the wedding to the end of stocktaking and plan a gentle return for about three weeks off.
- Acceptable alternatives: Ask whether the Saturday run felt normal before choosing the first dose / A first week with fewer sessions than chosen
- Concerns: Reading the return from the 7-day work break alone because one run happened / Counting the unreported sessions as done or not done before the athlete says so / Adding the two breaks' days together while ignoring the gap
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H24

**Intent.** A flu break is stated, then an audit-week break before any return; the clinical cause keeps routing to a human through a qualified clearance and through a later restatement of the flu break by name as a nonclinical cold.

**Tags.** CLINICAL_PAUSE, CLINICAL_SIGNAL, BALANCED_HYBRID, H8, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, START_NON_MONDAY, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":8,"asOf":"2026-11-08","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":60,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,5],"strengthDays":[1,4],"runMinutes":45,"strengthMinutes":40,"longRunDay":5,"longRunMinutes":70}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-10  RUN EASY 40min (EASY) | d1 2026-11-11  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-12  RUN EASY 40min (EASY) | d4 2026-11-14  STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d5 2026-11-15  RUN LONG 60min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-17  RUN EASY 40min (EASY) | d1 2026-11-18  STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d2 2026-11-19  RUN EASY 40min (EASY) | d4 2026-11-21  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-22  RUN LONG 60min (LONG)

### s1 · 2026-11-30T19:00:00+00:00 · WEEKLY_REVIEW (week 2)

- Athlete: 11 report(s): w0-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d1 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-11-25","endDate":"2026-11-30","reasonCategory":"ILLNESS","clinicalReason":true,"reason":"flu with fever"}`
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: The interruption reason is clinical or possibly clinical (ILLNESS): qualified assessment is needed; no nonclinical return recipe
- Record: break declared 2026-11-30T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-H24-s1), not applied yet: `{"startDate":"2026-11-25","endDate":"2026-11-30","reasonCategory":"ILLNESS","clinicalReason":true,"reason":"flu with fever"}`
- Current week 2 (DEVELOPMENT) from 2026-11-30: —
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-01  RUN EASY 45min (EASY +strides) | d1 2026-12-02  STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d2 2026-12-03  RUN EASY 40min (EASY) | d4 2026-12-05  STRENGTH_FULL_A 29min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d5 2026-12-06  RUN LONG 60min (LONG)

### s2 · 2026-12-07T19:00:00+00:00 · WEEKLY_REVIEW (week 3)

- Athlete: no reports · break `{"startDate":"2026-12-04","endDate":"2026-12-07","reasonCategory":"WORK","nonclinical":true,"reason":"audit week, long days"}`
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: A prior clinical dependency remains outside this nonclinical reference; no automatic clearance
- Record: break declared 2026-11-30T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-H24-s1), not applied yet: `{"startDate":"2026-11-25","endDate":"2026-11-30","reasonCategory":"ILLNESS","clinicalReason":true,"reason":"flu with fever"}`
- Record: break declared 2026-12-07T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-H24-s2), not applied yet: `{"startDate":"2026-12-04","endDate":"2026-12-07","reasonCategory":"WORK","nonclinical":true,"reason":"audit week, long days"}`
- Current week 3 (DEVELOPMENT) from 2026-12-07: —
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-08  RUN EASY 45min (EASY +strides) | d1 2026-12-09  STRENGTH_FULL_B 20min: db-rdl 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d2 2026-12-10  RUN EASY 40min (EASY) | d4 2026-12-12  STRENGTH_FULL_A 21min: goblet-squat 1x10 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d5 2026-12-13  RUN LONG 50min (LONG)

### s3 · 2026-12-14T19:00:00+00:00 · WEEKLY_REVIEW (week 4)

- Athlete: qualified clearance · no reports · client notes QUALIFIED_CLEARANCE_APPLIED
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: The interruption reason is clinical or possibly clinical (ILLNESS): qualified assessment is needed; no nonclinical return recipe
- Record: break declared 2026-11-30T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-H24-s1), not applied yet: `{"startDate":"2026-11-25","endDate":"2026-11-30","reasonCategory":"ILLNESS","clinicalReason":true,"reason":"flu with fever"}`
- Record: break declared 2026-12-07T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-H24-s2), not applied yet: `{"startDate":"2026-12-04","endDate":"2026-12-07","reasonCategory":"WORK","nonclinical":true,"reason":"audit week, long days"}`
- Current week 4 (CONSOLIDATION) from 2026-12-14: —
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-15  RUN EASY 45min (EASY +strides) | d1 2026-12-16  STRENGTH_FULL_B 36min: db-rdl 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; db-floor-press 3x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged | d2 2026-12-17  RUN EASY 40min (EASY) | d4 2026-12-19  STRENGTH_FULL_A 37min: goblet-squat 3x10 RIR3 last logged; db-floor-press 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; standing-calf-raise 2x16 RIR3 BW | d5 2026-12-20  RUN LONG 60min (LONG)

### s4 · 2026-12-17T19:00:00+00:00 · WEEKLY_REVIEW (week 5)

- Athlete: no reports · break `{"startDate":"2026-11-25","endDate":"2026-11-30","reasonCategory":"OTHER_NONCLINICAL","nonclinical":true,"reason":"it was only a heavy cold in the end, no fever","episodeId":"R7D-H24-s1"}`
- Coach: **CLINICAL_HUMAN_REQUIRED** / CLINICAL_HUMAN_REQUIRED · REQUIRES_RECONCILIATION
- Reason: A prior clinical dependency remains outside this nonclinical reference; no automatic clearance
- Record: break declared 2026-11-30T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-H24-s1), not applied yet: `{"startDate":"2026-11-25","endDate":"2026-11-30","reasonCategory":"ILLNESS","clinicalReason":true,"reason":"flu with fever"}`
- Record: break declared 2026-12-07T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-H24-s2), not applied yet: `{"startDate":"2026-12-04","endDate":"2026-12-07","reasonCategory":"WORK","nonclinical":true,"reason":"audit week, long days"}`
- Record: break declared 2026-12-17T19:00:00.000Z with a WEEKLY_REVIEW report (R7D-H24-s4), not applied yet: `{"startDate":"2026-11-25","endDate":"2026-11-30","reasonCategory":"OTHER_NONCLINICAL","nonclinical":true,"reason":"it was only a heavy cold in the end, no fever","episodeId":"R7D-H24-s1"}`
- Current week 5 (DEVELOPMENT) from 2026-12-17: d2 2026-12-17  RUN EASY 40min (EASY) | d4 2026-12-19  STRENGTH_FULL_A 37min: goblet-squat 3x10 RIR3 last logged; db-floor-press 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; standing-calf-raise 2x16 RIR3 BW | d5 2026-12-20  RUN LONG 60min (LONG)
- Next week 6 (DEVELOPMENT, provisional): d0 2026-12-22  RUN EASY 45min (EASY +strides) | d1 2026-12-23  STRENGTH_FULL_B 36min: db-rdl 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; db-floor-press 3x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged | d2 2026-12-24  RUN EASY 45min (EASY) | d4 2026-12-26  STRENGTH_FULL_A 37min: goblet-squat 3x10 RIR3 last logged; db-floor-press 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; standing-calf-raise 2x16 RIR3 BW | d5 2026-12-27  RUN LONG 60min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e3 @s2 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- e4 @s2 JUDGED [INVARIANT_ORACLE]: **JUDGED** — No INTERRUPTION_RELATION question is asked and no return dose is chosen; the later nonclinical break does not make the flu break nonclinical.
- e5 @s3 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- e6 @s3 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e7 @s4 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"CLINICAL_HUMAN_REQUIRED"`
- e8 @s4 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e9 @s4 JUDGED [NOT_EVALUABLE_DOMAIN]: **JUDGED** — Whether the athlete can train after the flu is a clinical judgment.

**Independent assessment (author, written before any output).**
- Rationale: A flu with fever is a clinical cause; a later work week does not change that, a clearance in this evaluation does not plan a return for a clinical cause, and relabelling the flu as a cold is the athlete's statement, not a clinical decision.
- Preferred: Route to a qualified human at every decision of this case; do not ask the relation question or choose a dose; record the restatement without ending the route.
- Acceptable alternatives: Route while explaining that only a qualified human can resolve the flu episode
- Concerns: Planning a nonclinical return once the audit week is reported / Treating the clearance as permission to plan a return for the flu / Accepting the restated cold as a way out of the clinical route / Asking the relation question before the clinical route
- Domain notes: The flu break is named by the identity of the review that first stated it (R7D-H24-s1). Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H25

**Intent.** A sales-conference break is stated inside a schedule change; a systemic fatigue report follows before the weekly review; the review applies the kept break without restating it, then the schedule change and the fatigue report are sent again. Also a same-day long-run report with day precision.

**Tags.** SCHEDULE_CHANGE, FATIGUE_SYSTEMIC, BALANCED_HYBRID, H8, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, RETURN_SHORT, START_NON_MONDAY, TIMEZONE, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":8,"asOf":"2026-11-13","tz":-480,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":65,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,4,6],"strengthDays":[1,5],"runMinutes":45,"strengthMinutes":40,"longRunDay":6,"longRunMinutes":75}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-16  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-17  RUN EASY 40min (EASY) | d4 2026-11-19  RUN EASY 40min (EASY) | d5 2026-11-20  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-21  RUN LONG 60min (LONG)
- Week 1 (DEVELOPMENT): d1 2026-11-23  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-24  RUN EASY 40min (EASY) | d4 2026-11-26  RUN EASY 40min (EASY) | d5 2026-11-27  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-28  RUN LONG 60min (LONG)

### s1 · 2026-11-28T19:00:00-08:00 · WEEKLY_REVIEW (week 1)

- Athlete: 10 report(s): w0-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d6 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d1 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d6 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) reportedAt 2026-11-28T10:40:00-08:00
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 1 load question(s) · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged; first logged loads wait for confirmation before they become numbers (goblet-squat)
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-floor-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-11-28: d6 2026-11-28  RUN LONG 60min (LONG)
- Next week 2 (DEVELOPMENT, provisional): d1 2026-11-30  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-01  RUN EASY 40min (EASY) | d4 2026-12-03  RUN EASY 40min (EASY) | d5 2026-12-04  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-05  RUN LONG 60min (LONG)

### s2 · 2026-12-03T07:00:00-08:00 · SCHEDULE_CHANGE (week 2)

- Athlete: no reports · changes `{"runDays":[0,2,4],"longRunDay":0}` · break `{"startDate":"2026-11-29","endDate":"2026-12-02","reasonCategory":"WORK","nonclinical":true,"reason":"four-day sales conference"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2026-12-03 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the schedule change is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2026-12-03T15:00:00.000Z with a SCHEDULE_CHANGE report (R7D-H25-s2), not applied yet: `{"startDate":"2026-11-29","endDate":"2026-12-02","reasonCategory":"WORK","nonclinical":true,"reason":"four-day sales conference"}`
- Current week 2 (DEVELOPMENT) from 2026-12-03: d4 2026-12-03  RUN EASY 40min (EASY) | d5 2026-12-04  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-05  RUN LONG 60min (LONG)
- Next week 3 (DEVELOPMENT, provisional): d1 2026-12-07  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-08  RUN EASY 45min (EASY +strides) | d4 2026-12-10  RUN EASY 40min (EASY) | d5 2026-12-11  STRENGTH_FULL_B 28min: glute-bridge 2x12 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-12  RUN LONG 60min (LONG)

### s3 · 2026-12-04T20:00:00-08:00 · SYSTEMIC_FATIGUE (week 2)

- Athlete: no reports · signals `{"region":"ALL"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2026-12-03 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the systemic fatigue is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2026-12-03T15:00:00.000Z with a SCHEDULE_CHANGE report (R7D-H25-s2), not applied yet: `{"startDate":"2026-11-29","endDate":"2026-12-02","reasonCategory":"WORK","nonclinical":true,"reason":"four-day sales conference"}`
- Current week 2 (DEVELOPMENT) from 2026-12-04: d5 2026-12-04  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-05  RUN LONG 60min (LONG)
- Next week 3 (DEVELOPMENT, provisional): d1 2026-12-07  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-08  RUN EASY 45min (EASY +strides) | d4 2026-12-10  RUN EASY 40min (EASY) | d5 2026-12-11  STRENGTH_FULL_B 28min: glute-bridge 2x12 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-12  RUN LONG 60min (LONG)

### s4 · 2026-12-05T19:00:00-08:00 · WEEKLY_REVIEW (week 2)

- Athlete: 1 report(s): w2-run-d6 not done
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: The break reported on 2026-12-03 is on record and applied now: short nonclinical interruption (4 days): resume the last completed doses; no step until execution is observed
- Current week 2 (DEVELOPMENT) from 2026-12-05: d6 2026-12-05  RUN LONG 60min (LONG)
- Next week 3 (DEVELOPMENT, provisional): d1 2026-12-07  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-08  RUN EASY 40min (EASY) | d4 2026-12-10  RUN EASY 40min (EASY) | d5 2026-12-11  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-12  RUN LONG 60min (LONG)

### s5 · 2026-12-05T19:30:00-08:00 · SCHEDULE_CHANGE (week 2)

- Athlete: no reports · changes `{"runDays":[0,2,4],"longRunDay":0}`
- Coach: **MODIFY** / REARRANGE_FUTURE_WEEKS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: New chosen days or shifts: same doses rearranged on the new days from next week; this week’s remaining sessions are not moved onto days the athlete removed
- Gates: `{"LONG":"HOLD","EASY":"HOLD","goblet-squat":"HOLD","db-floor-press":"HOLD","db-row":"HOLD","standing-calf-raise":"HOLD","dead-bug":"HOLD","glute-bridge":"HOLD","reverse-lunge":"HOLD"}`
- Current week 2 (DEVELOPMENT) from 2026-12-05: d6 2026-12-05  RUN LONG 60min (LONG)
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-06  RUN LONG 60min (LONG) | d1 2026-12-07  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-08  RUN EASY 40min (EASY) | d4 2026-12-10  RUN EASY 40min (EASY) | d5 2026-12-11  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

### s6 · 2026-12-05T19:45:00-08:00 · SYSTEMIC_FATIGUE (week 2)

- Athlete: no reports · signals `{"region":"ALL"}`
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Converging fatigue signal: The return reported this week already plans next week; this review keeps it
- Gates: `{"LONG":"HOLD","EASY":"HOLD","goblet-squat":"HOLD","db-floor-press":"HOLD","db-row":"HOLD","standing-calf-raise":"HOLD","dead-bug":"HOLD","glute-bridge":"HOLD","reverse-lunge":"HOLD"}`
- Current week 2 (DEVELOPMENT) from 2026-12-05: d6 2026-12-05  RUN LONG 60min (LONG)
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-06  RUN LONG 60min (LONG) | d1 2026-12-07  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-08  RUN EASY 40min (EASY) | d4 2026-12-10  RUN EASY 40min (EASY) | d5 2026-12-11  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure · not evaluable: P03 (4), P06 (4)

**Metamorphic.** no violation

**Author expectations.**
- e1 @s2 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- e2 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e3 @s3 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- e4 @s3 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The fatigue report is not applied while the break is kept; the coach says the break is recorded and asks for a weekly review or return report.
- e5 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e6 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e7 @s4 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The Saturday long run reported the day it happened in week 1, with only its date, is still in the record and informs the return.
- e8 @s5 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e9 @s5 JUDGED [DOMAIN_ORACLE]: **JUDGED** — From the next planned week the runs are on Sunday, Tuesday and Thursday with the long run on Sunday; strength stays on Monday and Friday.
- e10 @s6 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- e11 @s6 JUDGED [DOMAIN_ORACLE]: **JUDGED** — After systemic fatigue the next sessions are reduced or made easy, with no harder running and no added volume.

**Independent assessment (author, written before any output).**
- Rationale: An intermediate runner mixes three things in one message: a new schedule, a conference that interrupted training, and then fatigue.
- Preferred: Record the break and ask for it on its own; apply nothing of the schedule change or the fatigue until a weekly review applies the break; then apply the new days and ease the next sessions for the fatigue.
- Acceptable alternatives: Apply the schedule change from the week after next if the current week is already planned / Answer the re-sent fatigue with a KEEP and easy guidance
- Concerns: Applying the schedule change together with the break / Applying the fatigue report while the break is kept / Requiring the athlete to state the conference again / Increasing load after the return despite fatigue
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H26

**Intent.** A regular runner switches to a 10K goal in the same message that reports a wedding-week break; after the review applies the break the goal change is sent again, and later the organiser moves the race a week.

**Tags.** GOAL_CHANGE, EVENT_DATE_CHANGE, RACE_10K, H12, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, RETURN_SHORT, START_NON_MONDAY, TIMEZONE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":12,"asOf":"2026-11-09","tz":330,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":130,"longestRunMinutes":60,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[1,5],"runMinutes":45,"strengthMinutes":40,"longRunDay":4,"longRunMinutes":75}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-11  RUN EASY 35min (EASY) | d1 2026-11-12  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-13  RUN EASY 35min (EASY) | d4 2026-11-15  RUN LONG 55min (LONG) | d5 2026-11-16  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-18  RUN EASY 35min (EASY) | d1 2026-11-19  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-20  RUN EASY 35min (EASY) | d4 2026-11-22  RUN LONG 55min (LONG) | d5 2026-11-23  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

### s1 · 2026-12-01T20:00:00+05:30 · GOAL_CHANGE (week 2)

- Athlete: no reports · changes `{"goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-24"}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2027-01-24"}}` · break `{"startDate":"2026-11-26","endDate":"2026-11-30","reasonCategory":"FAMILY","nonclinical":true,"reason":"my sister's wedding week"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A break in training reported on 2026-12-01 is recorded and not applied yet: a return report or the week’s review applies it, with no need to state the break again, and then the goal change is sent again; until then nothing changes and the plan is not valid
- Record: break declared 2026-12-01T14:30:00.000Z with a GOAL_CHANGE report (R7D-H26-s1), not applied yet: `{"startDate":"2026-11-26","endDate":"2026-11-30","reasonCategory":"FAMILY","nonclinical":true,"reason":"my sister's wedding week"}`
- Current week 2 (DEVELOPMENT) from 2026-12-01: —
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-02  RUN EASY 40min (EASY +strides) | d1 2026-12-03  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-04  RUN EASY 35min (EASY) | d4 2026-12-06  RUN LONG 60min (LONG) | d5 2026-12-07  STRENGTH_FULL_B 28min: glute-bridge 2x12 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

### s2 · 2026-12-01T20:30:00+05:30 · WEEKLY_REVIEW (week 2)

- Athlete: 11 report(s): w0-run-d0 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d1 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d0 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: The break reported on 2026-12-01 is on record and applied now: short nonclinical interruption (5 days): resume the last completed doses; no step until execution is observed
- Current week 2 (DEVELOPMENT) from 2026-12-01: —
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-02  RUN EASY 35min (EASY) | d1 2026-12-03  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-04  RUN EASY 35min (EASY) | d4 2026-12-06  RUN LONG 55min (LONG) | d5 2026-12-07  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

### s3 · 2026-12-01T20:45:00+05:30 · GOAL_CHANGE (week 2)

- Athlete: no reports · changes `{"goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-24"}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2027-01-24"}}`
- Coach: **MODIFY** / REPLAN_FUTURE_PHASES · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Goal or event date changed: future phases, priorities and arrangements are re-planned from the current state; completed weeks stay as they were
- Gates: `{"LONG":"HOLD","EASY":"HOLD","goblet-squat":"HOLD","db-floor-press":"HOLD","db-row":"HOLD","standing-calf-raise":"HOLD","dead-bug":"HOLD","glute-bridge":"HOLD","reverse-lunge":"HOLD"}`
- Current week 2 (DEVELOPMENT) from 2026-12-01: —
- Next week 3 (BUILD, provisional): d0 2026-12-02  RUN EASY 35min (EASY) | d1 2026-12-03  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-04  RUN EASY 35min (EASY) | d4 2026-12-06  RUN LONG 55min (LONG) | d5 2026-12-07  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

### s4 · 2026-12-04T09:00:00+05:30 · EVENT_DATE_CHANGE (week 3)

- Athlete: no reports · changes `{"eventDate":"2027-01-31"}`
- Coach: **MODIFY** / REPLAN_FUTURE_PHASES · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Goal or event date changed: future phases, priorities and arrangements are re-planned from the current state; completed weeks stay as they were
- Current week 3 (BUILD) from 2026-12-04: d2 2026-12-04  RUN EASY 35min (EASY) | d4 2026-12-06  RUN LONG 55min (LONG) | d5 2026-12-07  STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-09  RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2026-12-10  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 14kg PER_HAND; db-row 1x8 RIR3 18kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-11  RUN EASY 40min (EASY +strides) | d4 2026-12-13  RUN LONG 50min (LONG) | d5 2026-12-14  STRENGTH_FULL_B 20min: glute-bridge 1x10 RIR3 BW; db-row 1x8 RIR3 18kg PER_HAND; db-floor-press 1x8 RIR3 14kg PER_HAND; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 STATUS_IN [INVARIANT_ORACLE]: **PASS** observed `"ASK"`
- e2 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e4 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e5 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e6 @s3 PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"RACE_WEEK"`
- e7 @s3 ROLE_PRESENT [INVARIANT_ORACLE]: **PASS** observed `["10:4:RACE"]`
- e8 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e9 @s4 ROLE_PRESENT [INVARIANT_ORACLE]: **PASS** observed `["11:4:RACE"]`
- e10 @s4 ROLE_ABSENT [INVARIANT_ORACLE]: **PASS** observed `[]`

**Independent assessment (author, written before any output).**
- Rationale: A regular runner commits to a 10K after a wedding week; later the organiser moves the race. The goal change must wait until the break is applied.
- Preferred: Ask for the break on its own; apply it as a short return at the review; then turn the plan into a 10K build toward the race date; when the date moves, shift the taper and race week by one week.
- Acceptable alternatives: Keep the current block as a base and start race-specific work after the return
- Concerns: Applying the goal change together with the break / Keeping a race session on the old date / Compressing the build because of the 5-day break
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H27

**Intent.** An intermediate runner's 10K race week falls between a two-week holiday and a site visit: the race touch is cut to half its minutes, the shakeout and the light strength session are done, and the race is cancelled by a storm.

**Tags.** RACE_10K, RACE_WEEK, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, SHORTENED_RUNS, MIXED_EXECUTION, RETURN_MODERATE, TIMEZONE, OFFERS, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":12,"asOf":"2026-11-14","tz":-240,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-09","timeGoalMinutes":47}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-01-09","timeGoalMinutes":47},"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":65,"strengthDaysPerWeek":2},"knownRuns":1,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4,5],"strengthDays":[0,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":40,"longRunDay":5,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT · NEXT_BLOCK · NEXT_BLOCK · NEXT_BLOCK
- Week 0 (ESTABLISHMENT): d0 2026-11-16 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2026-11-17 AM RUN EASY 40min (EASY) | d3 2026-11-19 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2026-11-20 AM RUN EASY 40min (EASY) | d5 2026-11-21 AM RUN LONG 65min (LONG)
- Week 1 (BUILD): d0 2026-11-23 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d1 2026-11-24 AM RUN EASY 40min (EASY) | d3 2026-11-26 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d4 2026-11-27 AM RUN EASY 40min (EASY) | d5 2026-11-28 AM RUN LONG 65min (LONG)
- Week 6 (TAPER): d0 2026-12-28 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; push-up 1x12 RIR3 BW; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2026-12-29 AM RUN QUALITY 28min (TEN_K_SPECIFIC 3x3'/2') | d3 2026-12-31 PM STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; push-up 1x12 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d4 2027-01-01 AM RUN EASY 35min (EASY +strides) | d5 2027-01-02 AM RUN LONG 45min (LONG)
- Week 7 (RACE_WEEK): d0 2027-01-04 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; push-up 1x12 RIR4 BW; db-row 1x8 RIR4 last logged | d1 2027-01-05 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-08 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d5 2027-01-09  RUN RACE 75min (RACE)

### s1 · 2026-12-06T19:00:00-04:00 · WEEKLY_REVIEW (week 2)

- Athlete: 15 report(s): w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · client notes NO_OFFER_TO_RESPOND
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","push-up":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 2 (BUILD) from 2026-12-06: —
- Next week 3 (SPECIFIC, provisional): d0 2026-12-07 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 22kg SINGLE_IMPLEMENT; push-up 2x12 RIR3 BW; db-row 2x10 RIR3 18kg PER_HAND; db-calf-raise 1x6 RIR3 18kg PER_HAND; dead-bug 1x14 RIR3 BW | d1 2026-12-08 AM RUN QUALITY 34min (THRESHOLD 3x5'/2') | d3 2026-12-10 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 18kg PER_HAND; db-row 2x10 RIR3 18kg PER_HAND; push-up 2x12 RIR3 BW; db-split-squat 1x6 RIR3 14kg PER_HAND; dead-bug 1x14 RIR3 BW | d4 2026-12-11 AM RUN EASY 45min (EASY +strides) | d5 2026-12-12 AM RUN LONG 65min (LONG)

### s2 · 2026-12-20T19:00:00-04:00 · WEEKLY_REVIEW (week 4)

- Athlete: 10 report(s): w3-run-d1 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d4 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d1 done 41min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d4 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d5 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · client notes NO_OFFER_TO_RESPOND
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","push-up":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 4 (SPECIFIC) from 2026-12-20: —
- Next week 5 (SPECIFIC, provisional): d0 2026-12-21 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 22kg SINGLE_IMPLEMENT; push-up 2x12 RIR3 BW; db-row 2x10 RIR3 18kg PER_HAND; db-calf-raise 1x6 RIR3 18kg PER_HAND; dead-bug 1x14 RIR3 BW | d1 2026-12-22 AM RUN QUALITY 38min (TEN_K_SPECIFIC 5x3'/2') | d3 2026-12-24 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 18kg PER_HAND; db-row 2x10 RIR3 18kg PER_HAND; push-up 2x12 RIR3 BW; db-split-squat 1x6 RIR3 14kg PER_HAND; dead-bug 1x14 RIR3 BW | d4 2026-12-25 AM RUN EASY 45min (EASY +strides) | d5 2026-12-26 AM RUN LONG 70min (LONG)

### s3 · 2026-12-30T20:00:00-04:00 · WEEKLY_REVIEW (week 6)

- Athlete: no reports · break `{"startDate":"2026-12-21","endDate":"2027-01-03","reasonCategory":"VACATION","nonclinical":true,"reason":"two weeks of holiday, no running"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-31T00:00:00.000Z with a WEEKLY_REVIEW report (R7D-H27-s3), not applied yet: `{"startDate":"2026-12-21","endDate":"2027-01-03","reasonCategory":"VACATION","nonclinical":true,"reason":"two weeks of holiday, no running"}`
- Current week 6 (TAPER) from 2026-12-30: d3 2026-12-31 PM STRENGTH_FULL_B 20min: db-rdl 1x10 RIR3 18kg PER_HAND; db-row 1x10 RIR3 18kg PER_HAND; push-up 1x12 RIR3 BW; db-split-squat 1x6 RIR3 14kg PER_HAND; dead-bug 1x14 RIR3 BW | d4 2027-01-01 AM RUN EASY 35min (EASY +strides) | d5 2027-01-02 AM RUN LONG 45min (LONG)
- Next week 7 (RACE_WEEK, provisional): d0 2027-01-04 PM STRENGTH_FULL_A 17min: goblet-squat 1x10 RIR4 22kg SINGLE_IMPLEMENT; push-up 1x12 RIR4 BW; db-row 1x10 RIR4 18kg PER_HAND | d1 2027-01-05 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-08 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d5 2027-01-09  RUN RACE 75min (RACE)

### s4 · 2027-01-16T09:00:00-04:00 · RETURN_AFTER_PAUSE (week 8)

- Athlete: 4 report(s): w7-run-d1 done 13min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d4 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-race not done; w7-str-d0 done 17min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2027-01-11","endDate":"2027-01-15","reasonCategory":"WORK","nonclinical":true,"reason":"site visit abroad","episodeId":"h27-site"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-21 to 2027-01-03; 2027-01-11 to 2027-01-15), each its own interruption; the stop read runs from 2027-01-11 to 2027-01-15; the break from 2026-12-21 to 2027-01-03 is read as its own return (moderate, 14 days), as if applied when training resumed on 2027-01-04, because the training after it completed a whole week of the plan in strength: those weeks are training, not days of the stop, and running continues from that return: short nonclinical interruption (5 days): resume the last completed doses; no step until execution is observed
- Current week 8 (POST_EVENT) from 2027-01-16: d5 RUN REST_BY_DESIGN
- Next week 9 (NEXT_BLOCK, provisional): d0 2027-01-18 PM STRENGTH_FULL_A 36min: goblet-squat 3x10 RIR3 22kg SINGLE_IMPLEMENT; push-up 3x12 RIR3 BW; db-row 3x10 RIR3 18kg PER_HAND; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d1 2027-01-19 AM RUN EASY 15min (EASY) | d3 2027-01-21 PM STRENGTH_FULL_B 33min: db-rdl 2x8 RIR3 establish; db-row 3x10 RIR3 18kg PER_HAND; push-up 3x12 RIR3 BW; reverse-lunge-db 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d4 2027-01-22 AM RUN EASY 15min (EASY) | d5 2027-01-23 AM RUN LONG 20min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"RACE_WEEK"`
- e3 @GENERATE ROLE_PRESENT [INVARIANT_ORACLE]: **PASS** observed `["7:5:RACE"]`
- e4 @s3 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e5 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e6 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e7 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Week 7 does not count for running (the race touch at half its minutes is not done and the race was not run) but counts for strength. The holiday is read as its own return: running resumes from that own return with no step it did not earn, strength from the light week-7 session; the cancelled race is not treated as a race done.

**Independent assessment (author, written before any output).**
- Rationale: A runner whose race week came straight after two weeks off: he cut the touch short, did the shakeout and the light lift, and the race was cancelled. Running in that week shows little; strength was done in full.
- Preferred: Treat the race week as strength training only; read the holiday as its own return for running, resume strength from its race-week dose, and plan a conservative post-race-week return for running with no race credit.
- Acceptable alternatives: Ask whether the athlete ran the course alone after the cancellation / A slightly more conservative strength entry because the race-week session was light
- Concerns: Counting the half touch or the cancelled race as done running / Reading the return by the 5-day site visit alone for running / Planning a recovery week as if a race had been run
- Domain notes: —

## R7D-H28

**Intent.** A half-marathon race week sits between a family holiday and an inventory week; the race week holds race touch, optional shakeout and race; the light strength session and the shakeout both recover badly while the touch and the race go well.

**Tags.** RACE_HALF, RACE_WEEK, POST_RACE, H12, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, SHARED_DAYS, ADVERSE_RESPONSE, RETURN_MODERATE, START_NON_MONDAY, TIMEZONE, OFFERS · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":12,"asOf":"2026-11-09","tz":180,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-09","timeGoalMinutes":115}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-01-09","timeGoalMinutes":115},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":170,"longestRunMinutes":85,"strengthDaysPerWeek":1},"knownRuns":1,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3],"strengthDays":[0,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":55,"strengthMinutes":35,"longRunDay":3,"longRunMinutes":110}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT · NEXT_BLOCK · NEXT_BLOCK
- Week 0 (ESTABLISHMENT): d0 2026-11-11 AM RUN EASY 45min (EASY) | d0 2026-11-11 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-13 AM RUN EASY 45min (EASY) | d3 2026-11-14 AM RUN LONG 70min (LONG) | d5 2026-11-16 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-11-18 AM RUN EASY 45min (EASY) | d0 2026-11-18 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-11-20 AM RUN EASY 45min (EASY) | d3 2026-11-21 AM RUN LONG 70min (LONG) | d5 2026-11-23 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 7 (TAPER): d0 2026-12-30 AM RUN QUALITY 33min (HALF_MARATHON_SPECIFIC 2x8'/2') | d0 2026-12-30 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d2 2027-01-01 AM RUN EASY 35min (EASY +strides) | d3 2027-01-02 AM RUN LONG 50min (LONG) | d5 2027-01-04 PM STRENGTH_FULL_B 17min: glute-bridge 1x12 RIR4 BW; db-row 1x8 RIR4 last logged; incline-push-up 1x12 RIR4 BW
- Week 8 (RACE_WEEK): d0 2027-01-06 AM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d0 STRENGTH REST_BY_DESIGN | d2 2027-01-08 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d3 2027-01-09  RUN RACE 150min (RACE) | d5 STRENGTH REST_BY_DESIGN

### s1 · 2026-12-01T19:00:00+03:00 · WEEKLY_REVIEW (week 2)

- Athlete: 15 report(s): w0-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d2 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d3 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d5 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · client notes NO_OFFER_TO_RESPOND
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 2 (BUILD) from 2026-12-01: —
- Next week 3 (SPECIFIC, provisional): d0 2026-12-02 AM RUN QUALITY 34min (THRESHOLD 3x5'/2') | d0 2026-12-02 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 22kg SINGLE_IMPLEMENT; incline-push-up 2x12 RIR3 BW; db-row 2x10 RIR3 18kg PER_HAND; db-calf-raise 1x6 RIR3 18kg PER_HAND; dead-bug 1x14 RIR3 BW | d2 2026-12-04 AM RUN EASY 50min (EASY +strides) | d3 2026-12-05 AM RUN LONG 70min (LONG) | d5 2026-12-07 PM STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; db-row 2x10 RIR3 18kg PER_HAND; incline-push-up 2x12 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW

### s2 · 2026-12-22T19:00:00+03:00 · WEEKLY_REVIEW (week 5)

- Athlete: 15 report(s): w3-run-d0 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d2 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d3 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d0 done 41min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d2 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d3 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d0 done 42min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d2 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d3 done 75min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d5 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d5 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d5 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · client notes NO_OFFER_TO_RESPOND
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 5 (SPECIFIC) from 2026-12-22: —
- Next week 6 (SPECIFIC, provisional): d0 2026-12-23 AM RUN QUALITY 49min (HALF_MARATHON_SPECIFIC 3x10'/2') | d0 2026-12-23 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 22kg SINGLE_IMPLEMENT; incline-push-up 2x12 RIR3 BW; db-row 2x10 RIR3 18kg PER_HAND; db-calf-raise 1x6 RIR3 18kg PER_HAND; dead-bug 1x14 RIR3 BW | d2 2026-12-25 AM RUN EASY 50min (EASY +strides) | d3 2026-12-26 AM RUN LONG 80min (LONG) | d5 2026-12-28 PM STRENGTH_FULL_B 21min: glute-bridge 1x12 RIR3 BW; db-row 1x10 RIR3 18kg PER_HAND; incline-push-up 1x12 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW

### s3 · 2027-01-03T19:00:00+03:00 · WEEKLY_REVIEW (week 7)

- Athlete: 5 report(s): w6-run-d0 done 49min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d2 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d3 done 80min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d5 done 21min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-30","endDate":"2027-01-05","reasonCategory":"VACATION","nonclinical":true,"reason":"family holiday the week before the race"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2027-01-03T16:00:00.000Z with a WEEKLY_REVIEW report (R7D-H28-s3), not applied yet: `{"startDate":"2026-12-30","endDate":"2027-01-05","reasonCategory":"VACATION","nonclinical":true,"reason":"family holiday the week before the race"}`
- Current week 7 (TAPER) from 2027-01-03: d5 2027-01-04 PM STRENGTH_FULL_B 17min: glute-bridge 1x12 RIR4 BW; db-row 1x10 RIR4 18kg PER_HAND; incline-push-up 1x12 RIR4 BW
- Next week 8 (RACE_WEEK, provisional): d0 2027-01-06 AM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d0 STRENGTH REST_BY_DESIGN | d2 2027-01-08 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d3 2027-01-09  RUN RACE 150min (RACE) | d5 STRENGTH REST_BY_DESIGN

### s4 · 2027-01-17T18:00:00+03:00 · RETURN_AFTER_PAUSE (week 9)

- Athlete: 3 report(s): w8-run-d0 done 28min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-run-d2 done 15min (performance=COMPATIBLE,recovery=ADVERSE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-race done 150min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2027-01-13","endDate":"2027-01-16","reasonCategory":"WORK","nonclinical":true,"reason":"year-start inventory","episodeId":"h28-inventory"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-30 to 2027-01-05; 2027-01-13 to 2027-01-16), each its own interruption; the stop read runs from 2027-01-13 to 2027-01-16, and a whole week of the plan executed in full after the earlier one re-entered the athlete: short nonclinical interruption (4 days): resume the last completed doses; no step until execution is observed
- Current week 9 (POST_EVENT) from 2027-01-17: d5 STRENGTH REST_BY_DESIGN
- Next week 10 (NEXT_BLOCK, provisional): d0 2027-01-20 AM RUN EASY 48min (EASY) | d0 2027-01-20 PM STRENGTH_FULL_A 35min: goblet-squat 3x10 RIR3 22kg SINGLE_IMPLEMENT; incline-push-up 3x12 RIR3 BW; db-row 3x10 RIR3 18kg PER_HAND; standing-calf-raise 1x10 RIR3 BW | d2 2027-01-22 AM RUN EASY 50min (EASY +strides) | d3 2027-01-23 AM RUN LONG 80min (LONG) | d5 2027-01-25 PM STRENGTH_FULL_B 35min: glute-bridge 3x12 RIR3 BW; db-row 3x10 RIR3 18kg PER_HAND; incline-push-up 3x12 RIR3 BW; split-squat-bodyweight 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- e2 @GENERATE PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"RACE_WEEK"`
- e3 @GENERATE ROLE_PRESENT [INVARIANT_ORACLE]: **PASS** observed `["8:3:RACE"]`
- e4 @s3 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e5 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e6 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e7 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The adverse recovery after the strength session and after the shakeout converge across sports, so the race week re-enters neither sport even though touch and race went well; the return is read from the stop running from the holiday's first day to the inventory's last day, and the first week back holds easy running and light strength only.
- e8 @s4 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`

**Independent assessment (author, written before any output).**
- Rationale: A half-marathon runner who raced well between two breaks, but whose body signalled poor recovery in two sports that week.
- Preferred: Do not read a good race as restored capacity; with adverse recovery in strength and in the shakeout, read the stop through the race week, plan easy running and light strength after the inventory week, and add no quality yet.
- Acceptable alternatives: Ask how the athlete recovered after the race before planning / Plan the post-race week as recovery running only
- Concerns: Resuming the pre-holiday build because the race was finished / Classing the return by the 4-day inventory alone / Ignoring the shakeout's adverse recovery because the shakeout is optional
- Domain notes: —

## R7D-H29

**Intent.** The earlier break starts on a strength day and that day's session is reported done with no start time for the break; between the breaks every run of a week is done but strength is missed, so strength is read from the earlier break's own return and the order matters.

**Tags.** BALANCED_HYBRID, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, RETURN_SHORT, START_NON_MONDAY, TIMEZONE, MIXED_EXECUTION, NON_RACE, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":12,"asOf":"2026-11-10","tz":660,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[1,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":50,"strengthMinutes":45,"longRunDay":2,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-12 AM RUN EASY 40min (EASY) | d1 2026-11-13 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-14 AM RUN LONG 65min (LONG) | d4 2026-11-16 AM RUN EASY 40min (EASY) | d5 2026-11-17 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-19 AM RUN EASY 40min (EASY) | d1 2026-11-20 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-21 AM RUN LONG 65min (LONG) | d4 2026-11-23 AM RUN EASY 40min (EASY) | d5 2026-11-24 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW

### s1 · 2026-12-07T20:00:00+11:00 · WEEKLY_REVIEW (week 3)

- Athlete: 17 report(s): w0-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d2 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d1 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d1 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d5 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d1 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-04","endDate":"2026-12-09","reasonCategory":"TRAVEL","nonclinical":true,"reason":"flew to a friend's wedding on Friday","episodeId":"h29-trip"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-07T09:00:00.000Z with a WEEKLY_REVIEW report (R7D-H29-s1), not applied yet: `{"startDate":"2026-12-04","endDate":"2026-12-09","reasonCategory":"TRAVEL","nonclinical":true,"reason":"flew to a friend's wedding on Friday","episodeId":"h29-trip"}`
- Current week 3 (DEVELOPMENT) from 2026-12-07: d4 2026-12-07 AM RUN EASY 40min (EASY) | d5 2026-12-08 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-10 AM RUN EASY 45min (EASY +strides) | d1 2026-12-11 AM STRENGTH_FULL_A 21min: goblet-squat 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d2 2026-12-12 AM RUN LONG 55min (LONG) | d4 2026-12-14 AM RUN EASY 40min (EASY) | d5 2026-12-15 AM STRENGTH_FULL_B 20min: db-rdl 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-bench-press 1x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW

### s2 · 2026-12-24T07:00:00+11:00 · RETURN_AFTER_PAUSE (week 6)

- Athlete: 5 report(s): w4-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d2 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d1 not done; w4-str-d5 not done · break `{"startDate":"2026-12-17","endDate":"2026-12-23","reasonCategory":"WORK","nonclinical":true,"reason":"product launch week","episodeId":"h29-launch"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question undefined (0 sessions, from week undefined)
- Reason: A strength session was recorded on 2026-12-04, the day the break reported on 2026-12-07 (episodeId h29-trip) began, and whether it came before that break changes the state its own return starts from: report that break again with its episodeId and the time it began (interruption.startedAt)
- Record: break declared 2026-12-07T09:00:00.000Z with a WEEKLY_REVIEW report (R7D-H29-s1), not applied yet: `{"startDate":"2026-12-04","endDate":"2026-12-09","reasonCategory":"TRAVEL","nonclinical":true,"reason":"flew to a friend's wedding on Friday","episodeId":"h29-trip"}`
- Record: break declared 2026-12-23T20:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H29-s2), not applied yet: `{"startDate":"2026-12-17","endDate":"2026-12-23","reasonCategory":"WORK","nonclinical":true,"reason":"product launch week","episodeId":"h29-launch"}`
- Current week 6 (DEVELOPMENT) from 2026-12-24: d0 2026-12-24 AM RUN EASY 45min (EASY +strides) | d1 2026-12-25 AM STRENGTH_FULL_A 41min: goblet-squat 3x10 RIR3 last logged; db-bench-press 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; standing-calf-raise 2x16 RIR3 BW; dead-bug 2x16 RIR3 BW | d2 2026-12-26 AM RUN LONG 65min (LONG) | d4 2026-12-28 AM RUN EASY 45min (EASY) | d5 2026-12-29 AM STRENGTH_FULL_B 41min: db-rdl 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; db-bench-press 3x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged; dead-bug 2x16 RIR3 BW
- Next week 7 (DEVELOPMENT, provisional): d0 2026-12-31 AM RUN EASY 45min (EASY +strides) | d1 2027-01-01 AM STRENGTH_FULL_A 41min: goblet-squat 3x10 RIR3 last logged; db-bench-press 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; standing-calf-raise 2x16 RIR3 BW; dead-bug 2x16 RIR3 BW | d2 2027-01-02 AM RUN LONG 65min (LONG) | d4 2027-01-04 AM RUN EASY 45min (EASY) | d5 2027-01-05 AM STRENGTH_FULL_B 41min: db-rdl 3x10 RIR3 last logged; db-row 3x10 RIR3 last logged; db-bench-press 3x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged; dead-bug 2x16 RIR3 BW

### s3 · 2026-12-24T07:40:00+11:00 · RETURN_AFTER_PAUSE (week 6)

- Athlete: no reports · break `{"startDate":"2026-12-04","endDate":"2026-12-09","reasonCategory":"TRAVEL","nonclinical":true,"reason":"flew to a friend's wedding on Friday","episodeId":"h29-trip","startedAt":"2026-12-04T13:00:00+11:00"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-04 to 2026-12-09; 2026-12-17 to 2026-12-23), each its own interruption; the stop read runs from 2026-12-17 to 2026-12-23; the break from 2026-12-04 to 2026-12-09 is read as its own return (short, 6 days), as if applied when training resumed on 2026-12-10, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return: short nonclinical interruption (7 days): resume the last completed doses; no step until execution is observed
- Current week 6 (DEVELOPMENT) from 2026-12-24: d0 2026-12-24 AM RUN EASY 45min (EASY +strides) | d1 2026-12-25 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 22kg SINGLE_IMPLEMENT; db-bench-press 2x10 RIR3 14kg PER_HAND; db-row 2x10 RIR3 18kg PER_HAND; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-12-26 AM RUN LONG 65min (LONG) | d4 2026-12-28 AM RUN EASY 40min (EASY) | d5 2026-12-29 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 18kg PER_HAND; db-row 2x10 RIR3 18kg PER_HAND; db-bench-press 2x10 RIR3 14kg PER_HAND; db-split-squat 1x12 RIR3 12kg PER_HAND; dead-bug 1x14 RIR3 BW
- Next week 7 (DEVELOPMENT, provisional): d0 2026-12-31 AM RUN EASY 45min (EASY +strides) | d1 2027-01-01 AM STRENGTH_FULL_A 29min: goblet-squat 2x12 RIR3 22kg SINGLE_IMPLEMENT; db-bench-press 2x12 RIR3 14kg PER_HAND; db-row 2x12 RIR3 18kg PER_HAND; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d2 2027-01-02 AM RUN LONG 65min (LONG) | d4 2027-01-04 AM RUN EASY 40min (EASY) | d5 2027-01-05 AM STRENGTH_FULL_B 29min: db-rdl 2x12 RIR3 18kg PER_HAND; db-row 2x12 RIR3 18kg PER_HAND; db-bench-press 2x12 RIR3 14kg PER_HAND; db-split-squat 1x8 RIR3 14kg PER_HAND; dead-bug 1x16 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e2 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"ASK"`
- e3 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Week 4 counts for running only, so the trip is read as its own return; strength is read from that own return, and with a strength session on the trip's first day and no start time the coach does not decide on its own whether the session came before the trip: it asks for the start time, or plans strength without crediting that session. Running resumes from the week-4 doses.
- e4 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e5 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e6 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — With the 13:00 start the Friday strength session counts as training before the trip; strength resumes from the trip's own return at a light entry with no step it did not earn, and running from week 4.

**Independent assessment (author, written before any output).**
- Rationale: A hybrid athlete who lifted on Friday morning and flew out at lunchtime, then ran a full week but skipped strength before a launch week. Strength depends on the Friday order; running does not.
- Preferred: Resume running from week 4; for strength, ask when the trip began or credit nothing uncertain; once the start time is given, count the Friday session before the trip and resume strength gently from the trip's own return.
- Acceptable alternatives: Plan strength from the trip's own return without the Friday session and say so / Ask the start time and the session time together
- Concerns: Assuming the Friday session came after the trip began / Advancing strength from the run-only week 4 / Treating the start-time answer as a third break
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H30

**Intent.** Between a house move and a conference every run of a week is done but strength is logged with sets, reps and loads and no reps in reserve; after the return the athlete corrects the conference by length and last day, which uncovers a Tuesday run that was never reported.

**Tags.** BALANCED_HYBRID, GYM, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, CORRECTION, RETURN_SHORT, START_NON_MONDAY, TIMEZONE, PARTIAL_ANSWER, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":12,"asOf":"2026-11-08","tz":-480,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":60,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["back-squat 3x5 80KG TOTAL","barbell-rdl 3x6 70KG TOTAL","bench-press 3x6 60KG TOTAL","barbell-row 3x8 50KG TOTAL"],"equipment":["BARBELL","RACK","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[1,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":60,"longRunDay":4,"longRunMinutes":75}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-10 AM RUN EASY 40min (EASY) | d1 2026-11-11 PM STRENGTH_FULL_A 39min: back-squat 3x5 RIR3 80kg TOTAL; bench-press 3x6 RIR3 60kg TOTAL; barbell-row 3x6 RIR3 50kg TOTAL; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-11-12 AM RUN EASY 40min (EASY) | d4 2026-11-14 AM RUN LONG 60min (LONG) | d5 2026-11-15 PM STRENGTH_FULL_B 39min: barbell-rdl 3x6 RIR3 70kg TOTAL; barbell-row 3x6 RIR3 50kg TOTAL; bench-press 3x6 RIR3 60kg TOTAL; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-17 AM RUN EASY 40min (EASY) | d1 2026-11-18 PM STRENGTH_FULL_A 40min: back-squat 3x5 RIR3 80kg TOTAL; bench-press 3x6 RIR3 60kg TOTAL; barbell-row 3x6 RIR3 50kg TOTAL; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d2 2026-11-19 AM RUN EASY 40min (EASY) | d4 2026-11-21 AM RUN LONG 60min (LONG) | d5 2026-11-22 PM STRENGTH_FULL_B 40min: barbell-rdl 3x6 RIR3 70kg TOTAL; barbell-row 3x6 RIR3 50kg TOTAL; bench-press 3x6 RIR3 60kg TOTAL; reverse-lunge 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW

### s1 · 2026-12-06T19:00:00-08:00 · WEEKLY_REVIEW (week 3)

- Athlete: 15 report(s): w0-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d4 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d1 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d1 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d5 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-01","endDate":"2026-12-07","reasonCategory":"MOVING","nonclinical":true,"reason":"moving apartments"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-07T03:00:00.000Z with a WEEKLY_REVIEW report (R7D-H30-s1), not applied yet: `{"startDate":"2026-12-01","endDate":"2026-12-07","reasonCategory":"MOVING","nonclinical":true,"reason":"moving apartments"}`
- Current week 3 (CONSOLIDATION) from 2026-12-06: d5 2026-12-06 PM STRENGTH_FULL_B 28min: barbell-rdl 2x6 RIR3 72.5kg TOTAL; barbell-row 2x6 RIR3 52.5kg TOTAL; bench-press 2x6 RIR3 62.5kg TOTAL; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Next week 4 (DEVELOPMENT, provisional): d0 2026-12-08 AM RUN EASY 45min (EASY +strides) | d1 2026-12-09 PM STRENGTH_FULL_A 53min: back-squat 4x5 RIR3 82.5kg TOTAL; bench-press 4x6 RIR3 62.5kg TOTAL; barbell-row 4x6 RIR3 52.5kg TOTAL; standing-calf-raise 3x10 RIR3 BW; dead-bug 3x10 RIR3 BW | d2 2026-12-10 AM RUN EASY 40min (EASY) | d4 2026-12-12 AM RUN LONG 60min (LONG) | d5 2026-12-13 PM STRENGTH_FULL_B 53min: barbell-rdl 4x6 RIR3 72.5kg TOTAL; barbell-row 4x6 RIR3 52.5kg TOTAL; bench-press 4x6 RIR3 62.5kg TOTAL; reverse-lunge 3x10 RIR3 BW; dead-bug 3x10 RIR3 BW

### s2 · 2026-12-20T18:00:00-08:00 · RETURN_AFTER_PAUSE (week 5)

- Athlete: 5 report(s): w4-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d4 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d1 done 4 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d5 done 4 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-15","endDate":"2026-12-19","reasonCategory":"WORK","nonclinical":true,"reason":"conference in another city","episodeId":"h30-conf"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-01 to 2026-12-07; 2026-12-15 to 2026-12-19), each its own interruption; the stop read runs from 2026-12-15 to 2026-12-19; the break from 2026-12-01 to 2026-12-07 is read as its own return (short, 7 days), as if applied when training resumed on 2026-12-08, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return: short nonclinical interruption (5 days): resume the last completed doses; no step until execution is observed
- Current week 5 (DEVELOPMENT) from 2026-12-20: d5 STRENGTH REST_BY_DESIGN
- Next week 6 (DEVELOPMENT, provisional): d0 2026-12-22 AM RUN EASY 45min (EASY +strides) | d1 2026-12-23 PM STRENGTH_FULL_A 40min: back-squat 3x5 RIR3 80kg TOTAL; bench-press 3x6 RIR3 60kg TOTAL; barbell-row 3x6 RIR3 50kg TOTAL; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-24 AM RUN EASY 45min (EASY) | d4 2026-12-26 AM RUN LONG 60min (LONG) | d5 2026-12-27 PM STRENGTH_FULL_B 40min: barbell-rdl 3x6 RIR3 70kg TOTAL; barbell-row 3x6 RIR3 50kg TOTAL; bench-press 3x6 RIR3 60kg TOTAL; reverse-lunge 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW

### s3 · 2026-12-21T19:00:00-08:00 · RETURN_AFTER_PAUSE (week 5)

- Athlete: no reports · break `{"episodeId":"h30-conf","days":4,"endDate":"2026-12-19","reasonCategory":"WORK","nonclinical":true,"reason":"the conference trip started on Wednesday morning"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question TRAINING_BETWEEN_BREAKS (1 sessions, from week undefined)
- Reason: The breaks reported on 2026-12-06 (2026-12-01 to 2026-12-07) and on 2026-12-20 (2026-12-16 to 2026-12-19) are separate, and 1 planned session between them (2026-12-08 to 2026-12-15) has no report: say what was done (report the sessions, done or not done); training that is only unreported counts neither as done nor as not done, and the return depends on it
- Record: break declared 2026-12-22T03:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H30-s3), not applied yet: `{"episodeId":"h30-conf","days":4,"endDate":"2026-12-19","reasonCategory":"WORK","nonclinical":true,"reason":"the conference trip started on Wednesday morning"}`
- Current week 5 (DEVELOPMENT) from 2026-12-21: —
- Next week 6 (DEVELOPMENT, provisional): d0 2026-12-22 AM RUN EASY 45min (EASY +strides) | d1 2026-12-23 PM STRENGTH_FULL_A 40min: back-squat 3x5 RIR3 80kg TOTAL; bench-press 3x6 RIR3 60kg TOTAL; barbell-row 3x6 RIR3 50kg TOTAL; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-24 AM RUN EASY 45min (EASY) | d4 2026-12-26 AM RUN LONG 60min (LONG) | d5 2026-12-27 PM STRENGTH_FULL_B 40min: barbell-rdl 3x6 RIR3 70kg TOTAL; barbell-row 3x6 RIR3 50kg TOTAL; bench-press 3x6 RIR3 60kg TOTAL; reverse-lunge 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW

### s4 · 2026-12-21T19:30:00-08:00 · WEEKLY_REVIEW (week 5)

- Athlete: 1 report(s): w5-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-01 to 2026-12-07; 2026-12-16 to 2026-12-19), each its own interruption; the stop read runs from 2026-12-16 to 2026-12-19; the break from 2026-12-01 to 2026-12-07 is read as its own return (short, 7 days), as if applied when training resumed on 2026-12-08, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return (read again with this newer report of the interruption): short nonclinical interruption (4 days): resume the last completed doses; no step until execution is observed
- Current week 5 (DEVELOPMENT) from 2026-12-21: —
- Next week 6 (DEVELOPMENT, provisional): d0 2026-12-22 AM RUN EASY 45min (EASY +strides) | d1 2026-12-23 PM STRENGTH_FULL_A 40min: back-squat 3x5 RIR3 80kg TOTAL; bench-press 3x6 RIR3 60kg TOTAL; barbell-row 3x6 RIR3 50kg TOTAL; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-24 AM RUN EASY 45min (EASY) | d4 2026-12-26 AM RUN LONG 60min (LONG) | d5 2026-12-27 PM STRENGTH_FULL_B 40min: barbell-rdl 3x6 RIR3 70kg TOTAL; barbell-row 3x6 RIR3 50kg TOTAL; bench-press 3x6 RIR3 60kg TOTAL; reverse-lunge 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e2 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e3 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Week 4 counts for running only: strength logged without reps in reserve does not count, so the move is read as its own return; strength continues from it with no step it did not earn, running from the week-4 runs.
- e4 @s3 QUESTION_KIND_IS [INVARIANT_ORACLE]: **PASS** observed `"TRAINING_BETWEEN_BREAKS"`
- e5 @s3 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e6 @s3 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The correction gives only the length and the last day; the conference is read from Wednesday, the report it replaces is not read as days of the stop, and the earlier break is not dropped.
- e7 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e8 @s4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e9 @s4 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The Tuesday run is training between the breaks but completes no week, so the reading stays per sport as before; strength still does not advance from the logs without reserve.

**Independent assessment (author, written before any output).**
- Rationale: A gym-going hybrid whose app dropped the reps-in-reserve field for a week; the runs of that week were complete. She later remembers she flew on Wednesday, not Tuesday.
- Preferred: Count week 4 for running only; resume strength cautiously from the move's own return; when the conference dates are corrected, ask about the uncovered Tuesday run before re-reading, then keep the per-sport reading.
- Acceptable alternatives: Ask the athlete for the missing reserve values before deciding strength / Keep strength at the pre-move loads for the first week back
- Concerns: Advancing strength from logs without reserve / Re-reading the return without asking about the uncovered Tuesday run / Treating the correction as a third break
- Domain notes: The correction states the length and last day only, as the brief asks; its first day is read from them. The explicit strength logs name the known barbell exercises.

## R7D-H31

**Intent.** After a return that read a road trip and an audit as separate breaks (runs done in full between them, strength missed), the athlete reports late that she lifted on the trip's first day, with no start time for the trip; she answers in a return report.

**Tags.** BALANCED_HYBRID, H12, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, LATE_REPORTER, RETURN_SHORT, START_NON_MONDAY, TIMEZONE, NON_RACE, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-13","weeks":12,"asOf":"2026-11-11","tz":330,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":130,"longestRunMinutes":60,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[0,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":45,"strengthMinutes":40,"longRunDay":1,"longRunMinutes":70}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-13 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-14 AM RUN LONG 55min (LONG) | d3 2026-11-16 AM RUN EASY 35min (EASY) | d4 2026-11-17 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-18 AM RUN EASY 35min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-20 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-21 AM RUN LONG 55min (LONG) | d3 2026-11-23 AM RUN EASY 35min (EASY) | d4 2026-11-24 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-25 AM RUN EASY 35min (EASY)

### s1 · 2026-12-07T20:00:00+05:30 · WEEKLY_REVIEW (week 3)

- Athlete: 15 report(s): w0-run-d1 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d1 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d4 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-04","endDate":"2026-12-10","reasonCategory":"TRAVEL","nonclinical":true,"reason":"road trip to the coast","episodeId":"h31-trip"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-07T14:30:00.000Z with a WEEKLY_REVIEW report (R7D-H31-s1), not applied yet: `{"startDate":"2026-12-04","endDate":"2026-12-10","reasonCategory":"TRAVEL","nonclinical":true,"reason":"road trip to the coast","episodeId":"h31-trip"}`
- Current week 3 (DEVELOPMENT) from 2026-12-07: d3 2026-12-07 AM RUN EASY 40min (EASY +strides) | d4 2026-12-08 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d5 2026-12-09 AM RUN EASY 35min (EASY)
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-11 PM STRENGTH_FULL_B 21min: glute-bridge 1x16 RIR3 BW; db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2026-12-12 AM RUN LONG 50min (LONG) | d3 2026-12-14 AM RUN EASY 40min (EASY +strides) | d4 2026-12-15 PM STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d5 2026-12-16 AM RUN EASY 35min (EASY)

### s2 · 2026-12-25T07:00:00+05:30 · RETURN_AFTER_PAUSE (week 6)

- Athlete: 5 report(s): w4-run-d1 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d5 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d0 not done; w4-str-d4 not done · break `{"startDate":"2026-12-18","endDate":"2026-12-24","reasonCategory":"WORK","nonclinical":true,"reason":"audit at a client site","episodeId":"h31-audit"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-12-04 to 2026-12-10; 2026-12-18 to 2026-12-24), each its own interruption; the stop read runs from 2026-12-18 to 2026-12-24; the break from 2026-12-04 to 2026-12-10 is read as its own return (short, 7 days), as if applied when training resumed on 2026-12-11, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return: short nonclinical interruption (7 days): resume the last completed doses; no step until execution is observed
- Current week 6 (DEVELOPMENT) from 2026-12-25: d0 2026-12-25 PM STRENGTH_FULL_B 28min: glute-bridge 2x12 RIR3 BW; db-row 2x8 RIR3 12kg PER_HAND; db-floor-press 2x8 RIR3 10kg PER_HAND; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d1 2026-12-26 AM RUN LONG 55min (LONG) | d3 2026-12-28 AM RUN EASY 40min (EASY +strides) | d4 2026-12-29 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 16kg SINGLE_IMPLEMENT; db-floor-press 2x8 RIR3 10kg PER_HAND; db-row 2x8 RIR3 12kg PER_HAND; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d5 2026-12-30 AM RUN EASY 35min (EASY)
- Next week 7 (DEVELOPMENT, provisional): d0 2027-01-01 PM STRENGTH_FULL_B 29min: glute-bridge 2x14 RIR3 BW; db-row 2x10 RIR3 12kg PER_HAND; db-floor-press 2x10 RIR3 10kg PER_HAND; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2027-01-02 AM RUN LONG 60min (LONG) | d3 2027-01-04 AM RUN EASY 40min (EASY +strides) | d4 2027-01-05 PM STRENGTH_FULL_A 29min: goblet-squat 2x12 RIR3 16kg SINGLE_IMPLEMENT; db-floor-press 2x10 RIR3 10kg PER_HAND; db-row 2x10 RIR3 12kg PER_HAND; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d5 2027-01-06 AM RUN EASY 35min (EASY)

### s3 · 2026-12-31T19:00:00+05:30 · WEEKLY_REVIEW (week 6)

- Athlete: 6 report(s): w6-run-d1 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d5 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d4 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d0 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question undefined (0 sessions, from week undefined)
- Reason: A strength session was recorded on 2026-12-04, the day the break reported on 2026-12-07 (episodeId h31-trip) began, and whether it came before that break changes the state its own return starts from: report that break again with its episodeId and the time it began (interruption.startedAt)
- Current week 6 (DEVELOPMENT) from 2026-12-31: —
- Next week 7 (DEVELOPMENT, provisional): d0 2027-01-01 PM STRENGTH_FULL_B 29min: glute-bridge 2x14 RIR3 BW; db-row 2x10 RIR3 12kg PER_HAND; db-floor-press 2x10 RIR3 10kg PER_HAND; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2027-01-02 AM RUN LONG 60min (LONG) | d3 2027-01-04 AM RUN EASY 40min (EASY +strides) | d4 2027-01-05 PM STRENGTH_FULL_A 29min: goblet-squat 2x12 RIR3 16kg SINGLE_IMPLEMENT; db-floor-press 2x10 RIR3 10kg PER_HAND; db-row 2x10 RIR3 12kg PER_HAND; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d5 2027-01-06 AM RUN EASY 35min (EASY)

### s4 · 2027-01-01T07:00:00+05:30 · RETURN_AFTER_PAUSE (week 7)

- Athlete: no reports · break `{"startDate":"2026-12-04","endDate":"2026-12-10","reasonCategory":"TRAVEL","nonclinical":true,"reason":"road trip to the coast","episodeId":"h31-trip","startedAt":"2026-12-04T16:00:00+05:30"}`
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: This report restates the break from 2026-12-04 to 2026-12-10 (episodeId h31-trip), which the return in force read: the record keeps it as that break's report, and nothing else changes
- Record: break declared 2027-01-01T01:30:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H31-s4), not applied yet: `{"startDate":"2026-12-04","endDate":"2026-12-10","reasonCategory":"TRAVEL","nonclinical":true,"reason":"road trip to the coast","episodeId":"h31-trip","startedAt":"2026-12-04T16:00:00+05:30"}`
- Current week 7 (DEVELOPMENT) from 2027-01-01: d0 2027-01-01 PM STRENGTH_FULL_B 29min: glute-bridge 2x14 RIR3 BW; db-row 2x10 RIR3 12kg PER_HAND; db-floor-press 2x10 RIR3 10kg PER_HAND; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2027-01-02 AM RUN LONG 60min (LONG) | d3 2027-01-04 AM RUN EASY 40min (EASY +strides) | d4 2027-01-05 PM STRENGTH_FULL_A 29min: goblet-squat 2x12 RIR3 16kg SINGLE_IMPLEMENT; db-floor-press 2x10 RIR3 10kg PER_HAND; db-row 2x10 RIR3 12kg PER_HAND; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d5 2027-01-06 AM RUN EASY 35min (EASY)
- Next week 8 (CONSOLIDATION, provisional): d0 2027-01-08 PM STRENGTH_FULL_B 21min: glute-bridge 1x16 RIR3 BW; db-row 1x12 RIR3 12kg PER_HAND; db-floor-press 1x12 RIR3 10kg PER_HAND; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2027-01-09 AM RUN LONG 50min (LONG) | d3 2027-01-11 AM RUN EASY 40min (EASY +strides) | d4 2027-01-12 PM STRENGTH_FULL_A 21min: goblet-squat 1x8 RIR3 18kg SINGLE_IMPLEMENT; db-floor-press 1x12 RIR3 10kg PER_HAND; db-row 1x12 RIR3 12kg PER_HAND; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d5 2027-01-13 AM RUN EASY 40min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e2 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e3 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Week 4 counts for running only; the road trip is read as its own return; strength resumes from that own return and running from week 4.
- e4 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"ASK"`
- e5 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The late Friday session is not silently placed before or after the trip: the coach asks for the trip's start time (or first asks to confirm the latest break), and the executed week 6 stays in the record.
- e6 @s4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- e7 @s4 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The start-time report is read as the road trip's own report, never as a new break; the Friday session counts as training before the trip; no strength dose ahead is above what was executed.

**Independent assessment (author, written before any output).**
- Rationale: A runner who lifts occasionally; her notebook shows a lifting session on the morning the road trip began. The start time decides whether it is before the trip.
- Preferred: Ask for the trip's start time rather than guess; once given, credit the session before the trip and keep strength cautious; running is unaffected.
- Acceptable alternatives: Asking first to confirm the audit break, then the start time / Keeping the current plan while the question is open
- Concerns: Assuming the session was after the trip started / Treating the restated trip as a third break / Raising strength because of one late session
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H32

**Intent.** After a return from a trade show and a family visit (runs complete between them, strength missed), a late report shows a Monday 06:30 lift on the trade show's first day; the athlete first confirms the later break, then gives the trade show's start time in the week's review.

**Tags.** BALANCED_HYBRID, GYM, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, LATE_REPORTER, RETURN_SHORT, TIMEZONE, NON_RACE, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":12,"asOf":"2026-11-21","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":60,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","RACK","BENCH","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[0,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":50,"strengthMinutes":60,"longRunDay":5,"longRunMinutes":75}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-23 AM STRENGTH_FULL_A 30min: goblet-squat 2x5 RIR3 establish; db-bench-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2026-11-24 PM RUN EASY 40min (EASY) | d3 2026-11-26 PM RUN EASY 40min (EASY) | d4 2026-11-27 AM STRENGTH_FULL_B 30min: db-rdl 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-bench-press 2x5 RIR3 establish; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-11-28 PM RUN LONG 60min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-30 AM STRENGTH_FULL_A 39min: goblet-squat 3x5 RIR3 last logged; db-bench-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d1 2026-12-01 PM RUN EASY 40min (EASY) | d3 2026-12-03 PM RUN EASY 40min (EASY) | d4 2026-12-04 AM STRENGTH_FULL_B 39min: db-rdl 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-bench-press 3x5 RIR3 last logged; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d5 2026-12-05 PM RUN LONG 60min (LONG)

### s1 · 2026-12-17T20:00:00-05:00 · WEEKLY_REVIEW (week 3)

- Athlete: 15 report(s): w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 30min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 30min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d4 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"WORK","nonclinical":true,"reason":"trade show, on my feet all week","episodeId":"h32-a"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption reason is unclear; say what it was and confirm it involved no pain, injury or illness
- Record: break declared 2026-12-18T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H32-s1), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"WORK","nonclinical":true,"reason":"trade show, on my feet all week","episodeId":"h32-a"}`
- Current week 3 (DEVELOPMENT) from 2026-12-17: d3 2026-12-17 PM RUN EASY 40min (EASY) | d4 2026-12-18 AM STRENGTH_FULL_B 39min: db-rdl 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-bench-press 3x5 RIR3 last logged; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d5 2026-12-19 PM RUN LONG 60min (LONG)
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-21 AM STRENGTH_FULL_A 27min: goblet-squat 2x5 RIR3 last logged; db-bench-press 2x5 RIR3 last logged; db-row 2x5 RIR3 last logged; db-calf-raise 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d1 2026-12-22 PM RUN EASY 45min (EASY +strides) | d3 2026-12-24 PM RUN EASY 40min (EASY) | d4 2026-12-25 AM STRENGTH_FULL_B 27min: db-rdl 2x5 RIR3 last logged; db-row 2x5 RIR3 last logged; db-bench-press 2x5 RIR3 last logged; bulgarian-split-squat-db 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2026-12-26 PM RUN LONG 50min (LONG)

### s2 · 2027-01-02T08:00:00-05:00 · RETURN_AFTER_PAUSE (week 5)

- Athlete: 5 report(s): w4-run-d1 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d5 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d0 not done; w4-str-d4 not done · break `{"startDate":"2026-12-28","endDate":"2027-01-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family visit","episodeId":"h32-b"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The break reported on 2026-12-17 (episodeId h32-a): its reason is unclear; say what it was and confirm it involved no pain, injury or illness; report it again with its episodeId
- Record: break declared 2026-12-18T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H32-s1), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"WORK","nonclinical":true,"reason":"trade show, on my feet all week","episodeId":"h32-a"}`
- Record: break declared 2027-01-02T13:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H32-s2), not applied yet: `{"startDate":"2026-12-28","endDate":"2027-01-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family visit","episodeId":"h32-b"}`
- Current week 5 (DEVELOPMENT) from 2027-01-02: d5 2027-01-02 PM RUN LONG 60min (LONG)
- Next week 6 (DEVELOPMENT, provisional): d0 2027-01-04 AM STRENGTH_FULL_A 51min: goblet-squat 4x5 RIR3 last logged; db-bench-press 4x5 RIR3 last logged; db-row 4x5 RIR3 last logged; db-calf-raise 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d1 2027-01-05 PM RUN EASY 45min (EASY +strides) | d3 2027-01-07 PM RUN EASY 45min (EASY) | d4 2027-01-08 AM STRENGTH_FULL_B 51min: db-rdl 4x5 RIR3 last logged; db-row 4x5 RIR3 last logged; db-bench-press 4x5 RIR3 last logged; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d5 2027-01-09 PM RUN LONG 60min (LONG)

### s3 · 2027-01-10T19:00:00-05:00 · WEEKLY_REVIEW (week 6)

- Athlete: 6 report(s): w6-run-d1 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d3 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d0 done 51min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d4 done 51min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d0 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-12-14T06:30:00-05:00
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The break reported on 2026-12-17 (episodeId h32-a): its reason is unclear; say what it was and confirm it involved no pain, injury or illness; report it again with its episodeId
- Record: break declared 2026-12-18T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H32-s1), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"WORK","nonclinical":true,"reason":"trade show, on my feet all week","episodeId":"h32-a"}`
- Record: break declared 2027-01-02T13:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H32-s2), not applied yet: `{"startDate":"2026-12-28","endDate":"2027-01-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family visit","episodeId":"h32-b"}`
- Current week 6 (DEVELOPMENT) from 2027-01-10: —
- Next week 7 (DEVELOPMENT, provisional): d0 2027-01-11 AM STRENGTH_FULL_A 51min: goblet-squat 4x5 RIR3 last logged; db-bench-press 4x5 RIR3 last logged; db-row 4x5 RIR3 last logged; db-calf-raise 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d1 2027-01-12 PM RUN EASY 45min (EASY +strides) | d3 2027-01-14 PM RUN EASY 45min (EASY) | d4 2027-01-15 AM STRENGTH_FULL_B 51min: db-rdl 4x5 RIR3 last logged; db-row 4x5 RIR3 last logged; db-bench-press 4x5 RIR3 last logged; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d5 2027-01-16 PM RUN LONG 60min (LONG)

### s4 · 2027-01-10T20:00:00-05:00 · WEEKLY_REVIEW (week 6)

- Athlete: no reports · break `{"startDate":"2026-12-28","endDate":"2027-01-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family visit","episodeId":"h32-b"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The break reported on 2026-12-17 (episodeId h32-a): its reason is unclear; say what it was and confirm it involved no pain, injury or illness; report it again with its episodeId
- Record: break declared 2026-12-18T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H32-s1), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"WORK","nonclinical":true,"reason":"trade show, on my feet all week","episodeId":"h32-a"}`
- Record: break declared 2027-01-02T13:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H32-s2), not applied yet: `{"startDate":"2026-12-28","endDate":"2027-01-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family visit","episodeId":"h32-b"}`
- Record: break declared 2027-01-11T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H32-s4), not applied yet: `{"startDate":"2026-12-28","endDate":"2027-01-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family visit","episodeId":"h32-b"}`
- Current week 6 (DEVELOPMENT) from 2027-01-10: —
- Next week 7 (DEVELOPMENT, provisional): d0 2027-01-11 AM STRENGTH_FULL_A 51min: goblet-squat 4x5 RIR3 last logged; db-bench-press 4x5 RIR3 last logged; db-row 4x5 RIR3 last logged; db-calf-raise 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d1 2027-01-12 PM RUN EASY 45min (EASY +strides) | d3 2027-01-14 PM RUN EASY 45min (EASY) | d4 2027-01-15 AM STRENGTH_FULL_B 51min: db-rdl 4x5 RIR3 last logged; db-row 4x5 RIR3 last logged; db-bench-press 4x5 RIR3 last logged; bulgarian-split-squat-db 3x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d5 2027-01-16 PM RUN LONG 60min (LONG)

### s5 · 2027-01-17T19:00:00-05:00 · WEEKLY_REVIEW (week 7)

- Athlete: 5 report(s): w7-run-d1 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d3 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d0 done 51min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d4 done 51min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"WORK","nonclinical":true,"reason":"trade show, on my feet all week","episodeId":"h32-a","startedAt":"2026-12-14T09:15:00-05:00"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The break reported on 2026-12-17 (episodeId h32-a): its reason is unclear; say what it was and confirm it involved no pain, injury or illness; report it again with its episodeId
- Record: break declared 2026-12-18T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H32-s1), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"WORK","nonclinical":true,"reason":"trade show, on my feet all week","episodeId":"h32-a"}`
- Record: break declared 2027-01-02T13:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H32-s2), not applied yet: `{"startDate":"2026-12-28","endDate":"2027-01-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family visit","episodeId":"h32-b"}`
- Record: break declared 2027-01-11T01:00:00.000Z with a WEEKLY_REVIEW report (R7D-H32-s4), not applied yet: `{"startDate":"2026-12-28","endDate":"2027-01-01","reasonCategory":"FAMILY","nonclinical":true,"reason":"family visit","episodeId":"h32-b"}`
- Record: break declared 2027-01-18T00:00:00.000Z with a WEEKLY_REVIEW report (R7D-H32-s5), not applied yet: `{"startDate":"2026-12-14","endDate":"2026-12-20","reasonCategory":"WORK","nonclinical":true,"reason":"trade show, on my feet all week","episodeId":"h32-a","startedAt":"2026-12-14T09:15:00-05:00"}`
- Current week 7 (DEVELOPMENT) from 2027-01-17: —
- Next week 8 (CONSOLIDATION, provisional): d0 2027-01-18 AM STRENGTH_FULL_A 39min: goblet-squat 3x5 RIR3 last logged; db-bench-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2027-01-19 PM RUN EASY 50min (EASY +strides) | d3 2027-01-21 PM RUN EASY 45min (EASY) | d4 2027-01-22 AM STRENGTH_FULL_B 39min: db-rdl 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-bench-press 3x5 RIR3 last logged; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d5 2027-01-23 PM RUN LONG 50min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e2 @s2 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"ASK"`
- e3 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"ASK"`
- e4 @s4 JUDGED [INVARIANT_ORACLE]: **JUDGED** — Restating the family visit with the same facts records nothing new and applies nothing twice; if the trade show's start time is still needed it is asked again.
- e5 @s5 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"ASK"`
- e6 @s5 VALIDITY_IS [DOMAIN_ORACLE]: **FAIL** observed `"REQUIRES_RECONCILIATION"`
- e7 @s5 JUDGED [DOMAIN_ORACLE]: **JUDGED** — With the 09:15 start, the 06:30 Monday session counts as training before the trade show; strength resumes from the trade show's own return with no step it did not earn, and the running record of weeks 4, 6 and 7 stands.

**Independent assessment (author, written before any output).**
- Rationale: A barbell hybrid whose app synced an old Monday lift weeks later; the session was before the trade show began, but the coach cannot know that without the start time.
- Preferred: Accept the late fact; confirm the later break if asked; ask for the trade show's start time and, once given, credit the Monday session before the trade show while keeping strength gated by its own return.
- Acceptable alternatives: Ask for the start time first, then confirm the family visit
- Concerns: Re-planning strength upward from the late session before the order is known / Applying the confirmed family visit a second time / Reading the start-time restatement as a new break
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H33

**Intent.** A strength beginner with bodyweight only reports late a Sunday session on the first day of a family break, after a return from two separate breaks; she gives the break's start time together with a generic recovered message, and the next review applies it.

**Tags.** BALANCED_HYBRID, BODYWEIGHT_ONLY, H8, RUN_EXP_INTERMEDIATE, STR_EXP_NONE, LATE_REPORTER, RETURN_SHORT, START_NON_MONDAY, TIMEZONE, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":8,"asOf":"2026-11-13","tz":-180,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":120,"longestRunMinutes":55},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,6],"strengthDays":[0,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":45,"strengthMinutes":30,"longRunDay":6,"longRunMinutes":70}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-15 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-16 AM RUN EASY 35min (EASY) | d3 2026-11-18 AM RUN EASY 35min (EASY) | d4 2026-11-19 AM STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW | d6 2026-11-21 AM RUN LONG 50min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-22 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW | d1 2026-11-23 AM RUN EASY 35min (EASY) | d3 2026-11-25 AM RUN EASY 35min (EASY) | d4 2026-11-26 AM STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW | d6 2026-11-28 AM RUN LONG 50min (LONG)

### s1 · 2026-12-03T20:00:00-03:00 · WEEKLY_REVIEW (week 2)

- Athlete: 10 report(s): w0-run-d1 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d6 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d6 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 12min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-11-29","endDate":"2026-12-05","reasonCategory":"FAMILY","nonclinical":true,"reason":"helping my parents after a flood at their house","episodeId":"h33-a"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-03T23:00:00.000Z with a WEEKLY_REVIEW report (R7D-H33-s1), not applied yet: `{"startDate":"2026-11-29","endDate":"2026-12-05","reasonCategory":"FAMILY","nonclinical":true,"reason":"helping my parents after a flood at their house","episodeId":"h33-a"}`
- Current week 2 (DEVELOPMENT) from 2026-12-03: d4 2026-12-03 AM STRENGTH_FULL_B 25min: glute-bridge 2x12 RIR3 BW; band-row 2x12 RIR3 BW; incline-push-up 2x12 RIR3 BW | d6 2026-12-05 AM RUN LONG 55min (LONG)
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-06 AM STRENGTH_FULL_A 26min: box-squat-bodyweight 2x14 RIR3 BW; incline-push-up 2x14 RIR3 BW; band-row 2x12 RIR3 BW | d1 2026-12-07 AM RUN EASY 40min (EASY +strides) | d3 2026-12-09 AM RUN EASY 35min (EASY) | d4 2026-12-10 AM STRENGTH_FULL_B 26min: glute-bridge 2x14 RIR3 BW; band-row 2x12 RIR3 BW; incline-push-up 2x14 RIR3 BW | d6 2026-12-12 AM RUN LONG 60min (LONG)

### s2 · 2026-12-19T07:00:00-03:00 · RETURN_AFTER_PAUSE (week 4)

- Athlete: 5 report(s): w3-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d6 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d0 not done; w3-str-d4 not done · break `{"startDate":"2026-12-13","endDate":"2026-12-18","reasonCategory":"WORK","nonclinical":true,"reason":"inventory at the warehouse","episodeId":"h33-b"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Separate breaks on record are applied now (2026-11-29 to 2026-12-05; 2026-12-13 to 2026-12-18), each its own interruption; the stop read runs from 2026-12-13 to 2026-12-18; the break from 2026-11-29 to 2026-12-05 is read as its own return (short, 7 days), as if applied when training resumed on 2026-12-06, because the training after it completed a whole week of the plan in running: those weeks are training, not days of the stop, and strength continues from that return: short nonclinical interruption (6 days): resume the last completed doses; no step until execution is observed
- Current week 4 (CONSOLIDATION) from 2026-12-19: d6 RUN REST_BY_DESIGN
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-20 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW | d1 2026-12-21 AM RUN EASY 40min (EASY +strides) | d3 2026-12-23 AM RUN EASY 35min (EASY) | d4 2026-12-24 AM STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW | d6 2026-12-26 AM RUN LONG 60min (LONG)

### s3 · 2026-12-26T19:00:00-03:00 · WEEKLY_REVIEW (week 5)

- Athlete: 6 report(s): w5-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d6 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d0 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d4 done 24min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 25min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-11-29T07:00:00-03:00
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · question undefined (0 sessions, from week undefined)
- Reason: A strength session was recorded on 2026-11-29, the day the break reported on 2026-12-03 (episodeId h33-a) began, and whether it came before that break changes the state its own return starts from: report that break again with its episodeId and the time it began (interruption.startedAt)
- Current week 5 (DEVELOPMENT) from 2026-12-26: d6 2026-12-26 AM RUN LONG 60min (LONG)
- Next week 6 (DEVELOPMENT, provisional): d0 2026-12-27 AM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x12 RIR3 BW; incline-push-up 2x12 RIR3 BW; band-row 2x12 RIR3 BW | d1 2026-12-28 AM RUN EASY 40min (EASY +strides) | d3 2026-12-30 AM RUN EASY 35min (EASY) | d4 2026-12-31 AM STRENGTH_FULL_B 25min: glute-bridge 2x12 RIR3 BW; band-row 2x12 RIR3 BW; incline-push-up 2x12 RIR3 BW | d6 2027-01-02 AM RUN LONG 60min (LONG)

### s4 · 2026-12-28T07:00:00-03:00 · RECOVERED (week 6)

- Athlete: no reports · break `{"startDate":"2026-11-29","endDate":"2026-12-05","reasonCategory":"FAMILY","nonclinical":true,"reason":"helping my parents after a flood at their house","episodeId":"h33-a","startedAt":"2026-11-29T11:00:00-03:00"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: A generic recovered label does not supply the specific facts the pending decision needs
- Record: break declared 2026-12-28T10:00:00.000Z with a RECOVERED report (R7D-H33-s4), not applied yet: `{"startDate":"2026-11-29","endDate":"2026-12-05","reasonCategory":"FAMILY","nonclinical":true,"reason":"helping my parents after a flood at their house","episodeId":"h33-a","startedAt":"2026-11-29T11:00:00-03:00"}`
- Current week 6 (DEVELOPMENT) from 2026-12-28: d1 2026-12-28 AM RUN EASY 40min (EASY +strides) | d3 2026-12-30 AM RUN EASY 35min (EASY) | d4 2026-12-31 AM STRENGTH_FULL_B 25min: glute-bridge 2x12 RIR3 BW; band-row 2x12 RIR3 BW; incline-push-up 2x12 RIR3 BW | d6 2027-01-02 AM RUN LONG 60min (LONG)
- Next week 7 (DEVELOPMENT, provisional): d0 2027-01-03 AM STRENGTH_FULL_A 26min: box-squat-bodyweight 2x14 RIR3 BW; incline-push-up 2x14 RIR3 BW; band-row 2x12 RIR3 BW | d1 2027-01-04 AM RUN EASY 40min (EASY +strides) | d3 2027-01-06 AM RUN EASY 40min (EASY) | d4 2027-01-07 AM STRENGTH_FULL_B 26min: glute-bridge 2x14 RIR3 BW; band-row 2x12 RIR3 BW; incline-push-up 2x14 RIR3 BW | d6 2027-01-09 AM RUN LONG 60min (LONG)

### s5 · 2027-01-02T19:00:00-03:00 · WEEKLY_REVIEW (week 6)

- Athlete: 5 report(s): w6-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d3 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d6 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d0 done 25min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d4 done 25min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Record: break declared 2026-12-28T10:00:00.000Z with a RECOVERED report (R7D-H33-s4), not applied yet: `{"startDate":"2026-11-29","endDate":"2026-12-05","reasonCategory":"FAMILY","nonclinical":true,"reason":"helping my parents after a flood at their house","episodeId":"h33-a","startedAt":"2026-11-29T11:00:00-03:00"}`
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","box-squat-bodyweight":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE","glute-bridge":"ADVANCE"}`
- Current week 6 (DEVELOPMENT) from 2027-01-02: d6 2027-01-02 AM RUN LONG 60min (LONG)
- Next week 7 (DEVELOPMENT, provisional): d0 2027-01-03 AM STRENGTH_FULL_A 26min: box-squat-bodyweight 2x14 RIR3 BW; incline-push-up 2x14 RIR3 BW; band-row 2x12 RIR3 BW | d1 2027-01-04 AM RUN EASY 40min (EASY +strides) | d3 2027-01-06 AM RUN EASY 40min (EASY) | d4 2027-01-07 AM STRENGTH_FULL_B 26min: glute-bridge 2x14 RIR3 BW; band-row 2x12 RIR3 BW; incline-push-up 2x14 RIR3 BW | d6 2027-01-09 AM RUN LONG 60min (LONG)

**Automated properties.** no failure · not evaluable: P03 (1), P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e2 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e3 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"ASK"`
- e4 @s4 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The restated break with its start time, sent with a generic recovered message, is recorded as the family break's report (not a new break) and nothing is planned from the recovered label itself; the next weekly review applies what is pending.
- e5 @s5 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- e6 @s5 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e7 @s5 JUDGED [DOMAIN_ORACLE]: **JUDGED** — With the 11:00 start the Sunday session counts as training before the break; strength resumes from the family break's own return at a light bodyweight entry, and running from what it executed.

**Independent assessment (author, written before any output).**
- Rationale: A runner new to strength training who did one bodyweight session before driving to her parents; she reports it weeks later.
- Preferred: Treat the late session as a fact whose order needs the break's start time; accept the start time from any channel, apply it at the next review, and keep strength progression gentle for a strength beginner.
- Acceptable alternatives: Keep strength unchanged after the start time is known / Ask for the session time as well
- Concerns: Treating the recovered message as an answer or a clearance / Treating the restated break as a new break / Progressing strength because of one late session
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H34

**Intent.** Three separate breaks are stated before any return; between the first and second only running is done in full, between the second and third only strength.

**Tags.** BALANCED_HYBRID, H16, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, RETURN_SHORT, START_NON_MONDAY, TIMEZONE, MIXED_EXECUTION, NON_RACE, SKIPPED_REVIEW · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":16,"asOf":"2026-11-10","tz":540,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":65,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[1,5],"runMinutes":45,"strengthMinutes":50,"longRunDay":2,"longRunMinutes":75}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-12  RUN EASY 40min (EASY) | d1 2026-11-13  STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-11-14  RUN LONG 60min (LONG) | d4 2026-11-16  RUN EASY 40min (EASY) | d5 2026-11-17  STRENGTH_FULL_B 31min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-11-19  RUN EASY 40min (EASY) | d1 2026-11-20  STRENGTH_FULL_A 38min: goblet-squat 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d2 2026-11-21  RUN LONG 60min (LONG) | d4 2026-11-23  RUN EASY 40min (EASY) | d5 2026-11-24  STRENGTH_FULL_B 38min: db-rdl 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged

### s1 · 2026-12-07T20:00:00+09:00 · WEEKLY_REVIEW (week 3)

- Athlete: 15 report(s): w0-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d2 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 31min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 31min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d1 done 38min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 38min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d1 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d5 done 38min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · break `{"startDate":"2026-12-03","endDate":"2026-12-09","reasonCategory":"WORK","nonclinical":true,"reason":"business trip to Osaka","episodeId":"h34-a"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption facts are out of range or contradict each other (interruption.endAfterThisReview); say when it started and when it ended
- Record: break declared 2026-12-07T11:00:00.000Z with a WEEKLY_REVIEW report (R7D-H34-s1), not applied yet: `{"startDate":"2026-12-03","endDate":"2026-12-09","reasonCategory":"WORK","nonclinical":true,"reason":"business trip to Osaka","episodeId":"h34-a"}`
- Current week 3 (DEVELOPMENT) from 2026-12-07: d4 2026-12-07  RUN EASY 40min (EASY) | d5 2026-12-08  STRENGTH_FULL_B 38min: db-rdl 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-10  RUN EASY 45min (EASY +strides) | d1 2026-12-11  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x16 RIR3 BW | d2 2026-12-12  RUN LONG 50min (LONG) | d4 2026-12-14  RUN EASY 40min (EASY) | d5 2026-12-15  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; db-biceps-curl 1x10 RIR3 last logged

### s2 · 2026-12-21T20:00:00+09:00 · WEEKLY_REVIEW (week 5)

- Athlete: 5 report(s): w4-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d2 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d1 not done; w4-str-d5 not done · break `{"startDate":"2026-12-17","endDate":"2026-12-23","reasonCategory":"FAMILY","nonclinical":true,"reason":"a new baby in the family","episodeId":"h34-b"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The interruption reason is unclear; say what it was and confirm it involved no pain, injury or illness
- Record: break declared 2026-12-07T11:00:00.000Z with a WEEKLY_REVIEW report (R7D-H34-s1), not applied yet: `{"startDate":"2026-12-03","endDate":"2026-12-09","reasonCategory":"WORK","nonclinical":true,"reason":"business trip to Osaka","episodeId":"h34-a"}`
- Record: break declared 2026-12-21T11:00:00.000Z with a WEEKLY_REVIEW report (R7D-H34-s2), not applied yet: `{"startDate":"2026-12-17","endDate":"2026-12-23","reasonCategory":"FAMILY","nonclinical":true,"reason":"a new baby in the family","episodeId":"h34-b"}`
- Current week 5 (DEVELOPMENT) from 2026-12-21: d4 2026-12-21  RUN EASY 40min (EASY) | d5 2026-12-22  STRENGTH_FULL_B 50min: db-rdl 4x8 RIR3 last logged; db-row 4x8 RIR3 last logged; db-bench-press 4x8 RIR3 last logged; db-split-squat 3x10 RIR3 last logged; db-biceps-curl 3x10 RIR3 last logged
- Next week 6 (DEVELOPMENT, provisional): d0 2026-12-24  RUN EASY 45min (EASY +strides) | d1 2026-12-25  STRENGTH_FULL_A 44min: goblet-squat 4x8 RIR3 last logged; db-bench-press 4x8 RIR3 last logged; db-row 4x8 RIR3 last logged; db-calf-raise 3x10 RIR3 last logged | d2 2026-12-26  RUN LONG 60min (LONG) | d4 2026-12-28  RUN EASY 45min (EASY) | d5 2026-12-29  STRENGTH_FULL_B 50min: db-rdl 4x8 RIR3 last logged; db-row 4x8 RIR3 last logged; db-bench-press 4x8 RIR3 last logged; db-split-squat 3x10 RIR3 last logged; db-biceps-curl 3x10 RIR3 last logged

### s3 · 2027-01-05T07:00:00+09:00 · RETURN_AFTER_PAUSE (week 7)

- Athlete: 5 report(s): w6-str-d1 done 44min 4 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d5 done 50min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d0 not done; w6-run-d2 not done; w6-run-d4 not done · break `{"startDate":"2026-12-31","endDate":"2027-01-04","reasonCategory":"TRAVEL","nonclinical":true,"reason":"year-end trip home","episodeId":"h34-c"}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The break reported on 2026-12-21 (episodeId h34-b): its reason is unclear; say what it was and confirm it involved no pain, injury or illness; report it again with its episodeId
- Record: break declared 2026-12-07T11:00:00.000Z with a WEEKLY_REVIEW report (R7D-H34-s1), not applied yet: `{"startDate":"2026-12-03","endDate":"2026-12-09","reasonCategory":"WORK","nonclinical":true,"reason":"business trip to Osaka","episodeId":"h34-a"}`
- Record: break declared 2026-12-21T11:00:00.000Z with a WEEKLY_REVIEW report (R7D-H34-s2), not applied yet: `{"startDate":"2026-12-17","endDate":"2026-12-23","reasonCategory":"FAMILY","nonclinical":true,"reason":"a new baby in the family","episodeId":"h34-b"}`
- Record: break declared 2027-01-04T22:00:00.000Z with a RETURN_AFTER_PAUSE report (R7D-H34-s3), not applied yet: `{"startDate":"2026-12-31","endDate":"2027-01-04","reasonCategory":"TRAVEL","nonclinical":true,"reason":"year-end trip home","episodeId":"h34-c"}`
- Current week 7 (DEVELOPMENT) from 2027-01-05: d5 2027-01-05  STRENGTH_FULL_B 50min: db-rdl 4x8 RIR3 last logged; db-row 4x8 RIR3 last logged; db-bench-press 4x8 RIR3 last logged; db-split-squat 3x10 RIR3 last logged; db-biceps-curl 3x10 RIR3 last logged
- Next week 8 (CONSOLIDATION, provisional): d0 2027-01-07  RUN EASY 45min (EASY +strides) | d1 2027-01-08  STRENGTH_FULL_A 39min: goblet-squat 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x16 RIR3 BW | d2 2027-01-09  RUN LONG 50min (LONG) | d4 2027-01-11  RUN EASY 45min (EASY) | d5 2027-01-12  STRENGTH_FULL_B 38min: db-rdl 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e2 @s2 NO_PRESCRIPTION [INVARIANT_ORACLE]: **PASS** observed `"REQUIRES_RECONCILIATION"`
- e3 @s3 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"ASK"`
- e4 @s3 VALIDITY_IS [DOMAIN_ORACLE]: **FAIL** observed `"REQUIRES_RECONCILIATION"`
- e5 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The three breaks stay separate and their days are never summed. Week 4 counts for running only and week 6 for strength only, so no week re-enters both sports; each sport resumes from what it executed in its own counting week, with no step it did not earn, and no dose is above the pre-trip level.
- e6 @s3 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":50,"otherWeek":60}`

**Independent assessment (author, written before any output).**
- Rationale: A hybrid athlete with a work trip, a family event and a year-end trip, each a week or less, with one sport trained between each pair.
- Preferred: Keep the breaks separate; credit running from week 4 and strength from week 6 only; plan a short return for the last trip with each sport starting from its own executed reference.
- Acceptable alternatives: A slightly lower running entry because running has not been done for three weeks / A slightly lower strength entry because strength skipped week 4
- Concerns: Adding the breaks into one long stop and restarting both sports / Crediting running from week 6 or strength from week 4 / Treating the chain as one return that ignores the trained weeks
- Domain notes: —

## R7D-H35

**Intent.** A 17-day moving break is declared in a weekly review after it ended, with no question pending; the 10K build resumes, a flat quality session is reported in the taper week, then the race and the week after.

**Tags.** RACE_10K, TAPER, RACE_WEEK, POST_RACE, RETURN_MODERATE, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, SKIPPED_REVIEW, TIMEZONE, OFFERS, MIXED_EXECUTION · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":12,"asOf":"2026-11-07","tz":60,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-24","timeGoalMinutes":52}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-01-24","timeGoalMinutes":52},"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":135,"longestRunMinutes":60,"strengthDaysPerWeek":2},"knownRuns":1,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,4,6],"strengthDays":[0,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":40,"longRunDay":6,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-09 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-11-11 AM RUN EASY 35min (EASY) | d3 2026-11-12 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2026-11-13 AM RUN EASY 35min (EASY) | d6 2026-11-15 AM RUN LONG 55min (LONG)
- Week 1 (BUILD): d0 2026-11-16 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2026-11-18 AM RUN EASY 35min (EASY) | d3 2026-11-19 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d4 2026-11-20 AM RUN EASY 35min (EASY) | d6 2026-11-22 AM RUN LONG 55min (LONG)
- Week 9 (TAPER): d0 2027-01-11 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 last logged; push-up 1x14 RIR3 BW; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d2 2027-01-13 AM RUN QUALITY 31min (TEN_K_SPECIFIC 3x4'/2') | d3 2027-01-14 PM STRENGTH_FULL_B 20min: db-rdl 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; push-up 1x14 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d4 2027-01-15 AM RUN EASY 35min (EASY +strides) | d6 2027-01-17 AM RUN LONG 45min (LONG)
- Week 10 (RACE_WEEK): d0 2027-01-18 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; push-up 1x14 RIR4 BW; db-row 1x8 RIR4 last logged | d2 2027-01-20 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-22 AM RUN EASY 25min (EASY) | d6 2027-01-24  RUN RACE 75min (RACE)

### s1 · 2026-12-13T19:00:00+01:00 · WEEKLY_REVIEW (week 4)

- Athlete: 13 report(s): w0-run-d2 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d6 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d6 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d3 done 20min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d6 not done · break `{"startDate":"2026-11-23","endDate":"2026-12-09","reasonCategory":"MOVING","nonclinical":true,"reason":"moving to a new city, no training"}` · client notes NO_OFFER_TO_RESPOND
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: moderate nonclinical interruption (17 days): re-entry from the reviewed entry dose, returning to the prior tolerated dose in 2 conditional steps
- Current week 4 (CONSOLIDATION) from 2026-12-13: d6 2026-12-13 AM RUN LONG 55min (LONG)
- Next week 5 (BUILD, provisional): d0 2026-12-14 PM STRENGTH_FULL_A 19min: goblet-squat 1x8 RIR4 establish; push-up 1x8 RIR4 BW; db-row 1x8 RIR4 establish; db-calf-raise 1x10 RIR4 establish; dead-bug 1x10 RIR4 BW | d2 2026-12-16 AM RUN EASY 15min (EASY) | d3 2026-12-17 PM STRENGTH_FULL_B 19min: db-rdl 1x8 RIR4 establish; db-row 1x8 RIR4 establish; push-up 1x8 RIR4 BW; db-split-squat 1x10 RIR4 establish; dead-bug 1x10 RIR4 BW | d4 2026-12-18 AM RUN EASY 15min (EASY) | d6 2026-12-20 AM RUN LONG 20min (LONG)

### s2 · 2027-01-17T19:00:00+01:00 · WEEKLY_REVIEW (week 9)

- Athlete: 25 report(s): w5-run-d2 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d4 done 15min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d6 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d2 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d4 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d6 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d2 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d4 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d6 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-run-d2 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-run-d4 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-run-d6 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d0 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d3 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d0 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d3 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d0 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d3 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-str-d0 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-str-d3 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w9-str-d0 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w9-str-d3 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w9-run-d2 done 25min (performance=UNDER,recovery=COMPATIBLE,effort=HARDER,nextDayFunction=NORMAL); w9-run-d4 done 30min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w9-run-d6 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · client notes NO_OFFER_TO_RESPOND
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"ADVANCE","QUALITY":"HOLD","EASY":"ADVANCE","goblet-squat":"ADVANCE","push-up":"ADVANCE","db-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 9 (TAPER) from 2027-01-17: d6 2027-01-17 AM RUN LONG 35min (LONG)
- Next week 10 (RACE_WEEK, provisional): d0 2027-01-18 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 22kg SINGLE_IMPLEMENT; push-up 1x8 RIR4 BW; db-row 1x8 RIR4 18kg PER_HAND | d2 2027-01-20 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-22 AM RUN EASY 20min (EASY) | d6 2027-01-24  RUN RACE 75min (RACE)

### s3 · 2027-01-24T16:00:00+01:00 · WEEKLY_REVIEW (week 10)

- Athlete: 4 report(s): w10-race done 75min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w10-run-d2 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w10-run-d4 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w10-str-d0 done 16min 3 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"EASY":"ADVANCE","goblet-squat":"ADVANCE","push-up":"ADVANCE","db-row":"ADVANCE"}`
- Current week 10 (RACE_WEEK) from 2027-01-24: d6 2027-01-24  RUN RACE 75min (RACE)
- Next week 11 (POST_EVENT, provisional): d0 STRENGTH REST_BY_DESIGN | d2 2027-01-27 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 2027-01-28 PM STRENGTH_FULL_B 16min: db-rdl 1x8 RIR4 18kg PER_HAND; db-row 1x8 RIR4 18kg PER_HAND; push-up 1x8 RIR4 BW | d4 2027-01-29 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 2027-01-31 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure · not evaluable: P03 (2), P06 (2)

**Metamorphic.** no violation

**Author expectations.**
- e1 @GENERATE PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"RACE_WEEK"`
- e2 @s1 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e3 @s1 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e4 @s1 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":20,"otherWeek":55}`
- e5 @s1 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The 17-day move is applied as a moderate return; the Sunday long run not done after the move is a known miss, not made up, and the race date is kept.
- e6 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e7 @s2 ROLE_PRESENT [DOMAIN_ORACLE]: **PASS** observed `["10:6:RACE"]`
- e8 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — A flat, harder-than-planned quality session in the taper does not lead to extra work in race week; race week stays light.
- e9 @s3 PHASE_IS [DOMAIN_ORACLE]: **PASS** observed `"POST_EVENT"`
- e10 @s3 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`

**Independent assessment (author, written before any output).**
- Rationale: An intermediate runner who lost two and a half weeks to a move early in a 10K build, then trained well until one flat taper session.
- Preferred: Apply the move as a moderate return with a lower long run, rebuild to the race, keep the taper light after the flat session, run the race and recover the week after.
- Acceptable alternatives: Shorten the build target after the move / Replace the next taper quality session with easy running
- Concerns: Continuing the pre-move build as if nothing happened / Adding a make-up long run / Adding work in race week after a flat taper session
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H36

**Intent.** After a seven-week project abroad with no training, an intermediate runner with four chosen run days returns with one easy 20-minute demonstration run.

**Tags.** RETURN_LONG, RESTART, BALANCED_HYBRID, H16, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, FREQ_HIGH, START_NON_MONDAY, TIMEZONE, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":16,"asOf":"2026-11-08","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":170,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4,5],"strengthDays":[1,3],"runMinutes":45,"strengthMinutes":40,"longRunDay":5,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-10  RUN EASY 30min (EASY) | d1 2026-11-11  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-12  RUN EASY 30min (EASY) | d3 2026-11-13  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-14  RUN EASY 30min (EASY) | d5 2026-11-15  RUN LONG 70min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-17  RUN EASY 30min (EASY) | d1 2026-11-18  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-19  RUN EASY 30min (EASY) | d3 2026-11-20  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-21  RUN EASY 30min (EASY) | d5 2026-11-22  RUN LONG 70min (LONG)

### s1 · 2026-11-23T19:00:00-05:00 · WEEKLY_REVIEW (week 1)

- Athlete: 12 report(s): w0-run-d0 done 30min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 30min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 30min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 30min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 30min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d4 done 30min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d1 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 1 load question(s) · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged; first logged loads wait for confirmation before they become numbers (goblet-squat)
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-floor-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-11-23: —
- Next week 2 (DEVELOPMENT, provisional): d0 2026-11-24  RUN EASY 30min (EASY) | d1 2026-11-25  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 10kg PER_HAND; db-row 2x10 RIR3 12kg PER_HAND; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-11-26  RUN EASY 30min (EASY) | d3 2026-11-27  STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; db-row 2x10 RIR3 12kg PER_HAND; db-floor-press 2x10 RIR3 10kg PER_HAND; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d4 2026-11-28  RUN EASY 30min (EASY) | d5 2026-11-29  RUN LONG 70min (LONG)

### s2 · 2027-01-12T07:00:00-05:00 · RETURN_AFTER_PAUSE (week 9)

- Athlete: no reports · break `{"startDate":"2026-11-24","endDate":"2027-01-10","reasonCategory":"WORK","nonclinical":true,"reason":"seven-week project abroad, no training"}` · demonstration `{"observedAt":"2027-01-11T18:00:00-05:00","sport":"RUN","family":"EASY","minutes":20,"completed":true,"effort":"CONVERSATIONAL","response":"COMPATIBLE","ordinaryFunction":"COMPATIBLE","nextDayFunction":"NORMAL"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: long nonclinical interruption (48 days): restart from current capacity; prior doses are only a ceiling
- Current week 9 (DEVELOPMENT) from 2027-01-12: d0 2027-01-12  RUN EASY 20min (EASY) | d1 2027-01-13  STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR4 establish; db-floor-press 1x8 RIR4 establish; db-row 1x8 RIR4 establish; standing-calf-raise 1x12 RIR4 BW; dead-bug 1x12 RIR4 BW | d2 2027-01-14  RUN EASY 20min (EASY) | d3 2027-01-15  STRENGTH_FULL_B 20min: glute-bridge 1x10 RIR4 BW; db-row 1x8 RIR4 establish; db-floor-press 1x8 RIR4 establish; reverse-lunge 1x12 RIR4 BW; dead-bug 1x12 RIR4 BW | d4 2027-01-16  RUN EASY 20min (EASY) | d5 2027-01-17  RUN WALK 20min (WALK)
- Next week 10 (DEVELOPMENT, provisional): d0 2027-01-19  RUN EASY 25min (EASY) | d1 2027-01-20  STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-21  RUN EASY 25min (EASY) | d3 2027-01-22  STRENGTH_FULL_B 20min: glute-bridge 1x10 RIR3 BW; db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-23  RUN EASY 25min (EASY) | d5 2027-01-24  RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e2 @s2 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- e3 @s2 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- e4 @s2 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":0,"otherWeek":70}`
- e5 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — A seven-week stop is a long break: running restarts with short easy or walk/jog sessions, the extra chosen run days hold optional walks or rest rather than full runs, strength returns at a light entry; the 20-minute demonstration informs the start but does not restore the pre-break doses.

**Independent assessment (author, written before any output).**
- Rationale: An intermediate runner who did nothing for seven weeks; one easy 20-minute run went fine.
- Preferred: Restart running gently from about the demonstrated level, with fewer real runs than chosen days and optional walks on the others, light strength, and build back over several weeks.
- Acceptable alternatives: Start from walk/jog for the first week despite the demonstration / Use three of the four chosen days for short easy runs
- Concerns: Resuming the pre-break plan / Taking the demonstration as proof of restored capacity / Quality sessions in the first two weeks
- Domain notes: —

## R7D-H37

**Intent.** Shortened, missed and partial sessions; a long run in heat flagged as confounded but followed by adverse recovery and an impaired next day, against a confounded hilly long run that went fine; then lower-body fatigue reported twice.

**Tags.** SHORTENED_RUNS, MIXED_EXECUTION, ADVERSE_RESPONSE, FATIGUE_LOCAL, REPEATED_SIGNAL, BALANCED_HYBRID, H8, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, START_NON_MONDAY, TIMEZONE, SKIPPED_REVIEW, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":8,"asOf":"2026-11-10","tz":-180,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":70,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4],"strengthDays":[1,5],"runMinutes":45,"strengthMinutes":40,"longRunDay":2,"longRunMinutes":80}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-12  RUN EASY 40min (EASY) | d1 2026-11-13  STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-14  RUN LONG 60min (LONG) | d4 2026-11-16  RUN EASY 40min (EASY) | d5 2026-11-17  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-19  RUN EASY 40min (EASY) | d1 2026-11-20  STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-21  RUN LONG 60min (LONG) | d4 2026-11-23  RUN EASY 40min (EASY) | d5 2026-11-24  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

### s1 · 2026-11-25T19:00:00-03:00 · WEEKLY_REVIEW (week 1)

- Athlete: 10 report(s): w0-run-d0 done 24min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d4 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d1 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d5 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 60min (performance=UNDER,recovery=ADVERSE,effort=HARDER,nextDayFunction=IMPAIRED); w1-run-d4 not done; w1-str-d1 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d5 done 2 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","EASY":"HOLD","glute-bridge":"ADVANCE","db-row":"HOLD","db-floor-press":"ADVANCE","reverse-lunge":"ADVANCE","dead-bug":"HOLD","goblet-squat":"ADVANCE","standing-calf-raise":"HOLD"}`
- Current week 1 (DEVELOPMENT) from 2026-11-25: —
- Next week 2 (DEVELOPMENT, provisional): d0 2026-11-26  RUN EASY 40min (EASY) | d1 2026-11-27  STRENGTH_FULL_B 28min: glute-bridge 2x12 RIR3 BW; db-row 2x8 RIR3 12kg PER_HAND; db-floor-press 2x10 RIR3 10kg PER_HAND; reverse-lunge 1x14 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-28  RUN LONG 60min (LONG) | d4 2026-11-30  RUN EASY 40min (EASY) | d5 2026-12-01  STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 10kg PER_HAND; db-row 2x8 RIR3 12kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

### s2 · 2026-11-28T20:00:00-03:00 · LOCAL_FATIGUE (week 2)

- Athlete: no reports · signals `{"region":"LOWER"}`
- Coach: **MODIFY** / REDUCE · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Remove only optional local work for the affected region; essentials stay
- Current week 2 (DEVELOPMENT) from 2026-11-28: d2 2026-11-28  RUN LONG 60min (LONG) | d4 2026-11-30  RUN EASY 40min (EASY) | d5 2026-12-01  STRENGTH_FULL_A 26min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 10kg PER_HAND; db-row 2x8 RIR3 12kg PER_HAND; dead-bug 1x12 RIR3 BW
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-03  RUN EASY 40min (EASY) | d1 2026-12-04  STRENGTH_FULL_B 29min: glute-bridge 2x14 RIR3 BW; db-row 2x10 RIR3 12kg PER_HAND; db-floor-press 2x12 RIR3 10kg PER_HAND; reverse-lunge 1x16 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-12-05  RUN LONG 60min (LONG) | d4 2026-12-07  RUN EASY 40min (EASY) | d5 2026-12-08  STRENGTH_FULL_A 29min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x12 RIR3 10kg PER_HAND; db-row 2x10 RIR3 12kg PER_HAND; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW

### s3 · 2026-12-05T20:00:00-03:00 · LOCAL_FATIGUE (week 3)

- Athlete: no reports · signals `{"region":"LOWER"}`
- Coach: **MODIFY** / REDUCE · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Remove only optional local work for the affected region; essentials stay
- Current week 3 (DEVELOPMENT) from 2026-12-05: d2 2026-12-05  RUN LONG 60min (LONG) | d4 2026-12-07  RUN EASY 40min (EASY) | d5 2026-12-08  STRENGTH_FULL_A 27min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x12 RIR3 10kg PER_HAND; db-row 2x10 RIR3 12kg PER_HAND; dead-bug 1x14 RIR3 BW
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-10  RUN EASY 45min (EASY +strides) | d1 2026-12-11  STRENGTH_FULL_B 21min: glute-bridge 1x16 RIR3 BW; db-row 1x12 RIR3 12kg PER_HAND; db-floor-press 1x8 RIR3 12kg PER_HAND; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d2 2026-12-12  RUN LONG 50min (LONG) | d4 2026-12-14  RUN EASY 40min (EASY) | d5 2026-12-15  STRENGTH_FULL_A 21min: goblet-squat 1x10 RIR3 last logged; db-floor-press 1x8 RIR3 12kg PER_HAND; db-row 1x12 RIR3 12kg PER_HAND; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e2 @s1 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **PASS** observed `{"week":60,"otherWeek":60}`
- e3 @s1 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The heat run's adverse recovery and impaired next day stay adverse although the run is confounded (only its performance and effort are hard to read); the confounded trail run that went fine is not read as a warning; the shortened, skipped and partial sessions are known facts; nothing is progressed from the week.
- e4 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e5 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e6 @s3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The second lower-body fatigue report a week later is treated as a repeated signal: lower-body strength and running load are reduced at least as much as after the first, with no harder running added; without pain it is not a clinical route.

**Independent assessment (author, written before any output).**
- Rationale: An intermediate runner with an ordinary messy fortnight and a hot long run that hurt her recovery, then heavy thighs twice in a row.
- Preferred: Credit what was done, keep the heat run's adverse recovery as adverse, hold the long run, then cut lower-body load and keep running easy when the fatigue repeats.
- Acceptable alternatives: Ask how the athlete slept and hydrated before the next long run / Swap the next long run for two shorter easy runs
- Concerns: Discarding the adverse recovery because the run was hot / Treating the fine trail run as a warning / Progressing the long run after the heat run / Ignoring the repetition of the fatigue signal
- Domain notes: Day-specific references here name sessions on the athlete's own chosen days in weeks that no adopted decision re-planned: before them came only routine reviews, decisions that asked or routed and adopted nothing, or adopted decisions made after that week's named sessions had already taken place. Those days are truly fixed, so any check-corpus-8 warning on them is kept for that reason.

## R7D-H38

**Intent.** An athlete living at UTC-5 travels to Europe: reports carry +01:00 clocks, a phone and a watch duplicate, a phone and watch contradiction, an in-time and a late correction, a report that arrives out of order, a device clock in the future and an exact re-send.

**Tags.** DUPLICATE_SOURCES, CONTRADICTION, CORRECTION, OUT_OF_ORDER, CLOCK_SKEW, TIMEZONE, TRAVEL, BALANCED_HYBRID, H8, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, WEARABLE_FULL, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":8,"asOf":"2026-11-14","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":140,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":"FULL","history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[0,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":40,"longRunDay":5,"longRunMinutes":75}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-16 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-17 AM RUN EASY 40min (EASY) | d3 2026-11-19 AM RUN EASY 40min (EASY) | d3 2026-11-19 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-21 AM RUN LONG 60min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-23 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-24 AM RUN EASY 40min (EASY) | d3 2026-11-26 AM RUN EASY 40min (EASY) | d3 2026-11-26 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-28 AM RUN LONG 60min (LONG)

### s1 · 2026-11-22T21:00:00-05:00 · WEEKLY_REVIEW (week 0)

- Athlete: 5 report(s): w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-11-17T07:10:00+01:00 via phone-app; w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-11-17T07:10:00+01:00 via wristwatch; w0-run-d5 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 2 load question(s) · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation; first logged loads wait for confirmation before they become numbers (db-row, db-floor-press)
- Gates: `{"LONG":"ADVANCE","EASY":"HOLD","sit-to-stand":"ADVANCE","wall-pushup":"ADVANCE","prone-row-practice":"ADVANCE","supported-calf-raise":"ADVANCE","dead-bug-practice":"ADVANCE","glute-bridge":"ADVANCE","db-row":"ADVANCE","db-floor-press":"ADVANCE","reverse-lunge":"ADVANCE","dead-bug":"ADVANCE"}`
- Current week 0 (ESTABLISHMENT) from 2026-11-22: —
- Next week 1 (DEVELOPMENT, provisional): d0 2026-11-23 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-24 AM RUN EASY 40min (EASY) | d3 2026-11-26 AM RUN EASY 40min (EASY) | d3 2026-11-26 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-28 AM RUN LONG 60min (LONG)

### s2 · 2026-11-29T21:00:00-05:00 · WEEKLY_REVIEW (week 1)

- Athlete: 8 report(s): w1-run-d1 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) corrects h38-w1-tue; w1-run-d3 not done via phone-app; w1-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-11-26T18:30:00+01:00 via wristwatch; w1-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-11-30T08:00:00-05:00 via wristwatch; w0-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) reportedAt 2026-11-29T20:55:00-05:00 at 2026-11-19T07:05:00+01:00; w1-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 1 load question(s) · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation; first logged loads wait for confirmation before they become numbers (goblet-squat)
- Gates: `{"LONG":"HOLD","EASY":"HOLD","goblet-squat":"ADVANCE","db-floor-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-11-29: —
- Next week 2 (DEVELOPMENT, provisional): d0 2026-11-30 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 14kg PER_HAND; db-row 2x10 RIR3 18kg PER_HAND; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d1 2026-12-01 AM RUN EASY 40min (EASY) | d3 2026-12-03 AM RUN EASY 40min (EASY) | d3 2026-12-03 PM STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; db-row 2x10 RIR3 18kg PER_HAND; db-floor-press 2x10 RIR3 14kg PER_HAND; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d5 2026-12-05 AM RUN LONG 60min (LONG)

### s3 · 2026-12-06T21:00:00-05:00 · WEEKLY_REVIEW (week 2)

- Athlete: 8 report(s): w2-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d3 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) corrects h38-w1-thu-phone; w0-run-d5 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) corrects h38-w0-long; w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-11-17T07:10:00+01:00 via phone-app
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-floor-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 2 (DEVELOPMENT) from 2026-12-06: —
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-07 PM STRENGTH_FULL_A 29min: goblet-squat 2x12 RIR3 22kg SINGLE_IMPLEMENT; db-floor-press 2x12 RIR3 14kg PER_HAND; db-row 2x12 RIR3 18kg PER_HAND; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d1 2026-12-08 AM RUN EASY 40min (EASY) | d3 2026-12-10 AM RUN EASY 40min (EASY) | d3 2026-12-10 PM STRENGTH_FULL_B 30min: glute-bridge 2x14 RIR3 BW; db-row 2x12 RIR3 18kg PER_HAND; db-floor-press 2x12 RIR3 14kg PER_HAND; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d5 2026-12-12 AM RUN LONG 60min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The phone and watch reports of the week-0 Tuesday run are one session, counted once, at its +01:00 clock.
- e2 @s2 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The phone "not done" and watch "done 40 minutes" reports of the week-1 Thursday run are not both credited and neither is silently chosen: the coach asks, holds or keeps the session conflicted; the Saturday report stamped after the decision is not treated as a future session; the week-0 Thursday run arriving late is recorded without rewriting week 0; Tuesday counts as the corrected 35 minutes.
- e3 @s3 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- e4 @s3 JUDGED [INVARIANT_ORACLE]: **JUDGED** — After the correction the week-1 Thursday run counts as 40 minutes; the week-0 long run counts as 55 minutes for future dosing without rewriting past decisions; the re-sent phone report adds nothing.

**Independent assessment (author, written before any output).**
- Rationale: Real device data while travelling: two devices, a disagreement, a wrong clock and late syncs.
- Preferred: Count each session once at its own clock, keep the conflicting Thursday out of the record until it is resolved (or ask), ignore the impossible future stamp as a time without dropping the run, use corrections for the future only, and ignore the re-send.
- Acceptable alternatives: HOLD the week-1 review until the Thursday conflict is resolved / Ask the athlete which Thursday report is right
- Concerns: Crediting both Thursday reports or picking one silently / Counting the duplicate or the re-send / Planning a session at the future clock / Rewriting week 0 from late reports
- Domain notes: All three steps are routine reviews, so every chosen day is fixed. The future stamp (Monday 08:00, UTC-5) is within the date window.

## R7D-H39

**Intent.** With learning consent, every long run is reported easier than planned (a repeated pattern) while one hard Tuesday run is noise; consent is later revoked.

**Tags.** LEARNING_PATTERN, LEARNING_NOISE, CONSENT_REVOKED, NO_CONSENT, BALANCED_HYBRID, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, START_NON_MONDAY, SKIPPED_REVIEW, NON_RACE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2026-11-14","weeks":12,"asOf":"2026-11-12","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[2,4],"runMinutes":45,"strengthMinutes":40,"longRunDay":1,"longRunMinutes":90}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-15  RUN LONG 65min (LONG) | d2 2026-11-16  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-17  RUN EASY 40min (EASY) | d4 2026-11-18  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2026-11-19  RUN EASY 40min (EASY)
- Week 1 (DEVELOPMENT): d1 2026-11-22  RUN LONG 65min (LONG) | d2 2026-11-23  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-24  RUN EASY 40min (EASY) | d4 2026-11-25  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2026-11-26  RUN EASY 40min (EASY)

### s1 · 2026-11-27T19:00:00+00:00 · WEEKLY_REVIEW (week 1)

- Athlete: 10 report(s): w0-run-d1 done 65min (performance=OVER,recovery=COMPATIBLE,effort=EASIER,nextDayFunction=NORMAL); w0-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d1 done 65min (performance=OVER,recovery=COMPATIBLE,effort=EASIER,nextDayFunction=NORMAL); w1-run-d3 done 40min (performance=UNDER,recovery=COMPATIBLE,effort=HARDER,nextDayFunction=NORMAL); w1-run-d5 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d2 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d2 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · learning consent true
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"ADVANCE","EASY":"HOLD","goblet-squat":"ADVANCE","db-floor-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-11-27: —
- Next week 2 (DEVELOPMENT, provisional): d1 2026-11-29  RUN LONG 65min (LONG) | d2 2026-11-30  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 22kg SINGLE_IMPLEMENT; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-01  RUN EASY 40min (EASY) | d4 2026-12-02  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 18kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; db-split-squat 1x8 RIR3 12kg PER_HAND; dead-bug 1x12 RIR3 BW | d5 2026-12-03  RUN EASY 40min (EASY)

### s2 · 2026-12-11T19:00:00+00:00 · WEEKLY_REVIEW (week 3)

- Athlete: 10 report(s): w2-run-d1 done 65min (performance=OVER,recovery=COMPATIBLE,effort=EASIER,nextDayFunction=NORMAL); w2-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d1 done 65min (performance=OVER,recovery=COMPATIBLE,effort=EASIER,nextDayFunction=NORMAL); w3-run-d3 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d5 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d2 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d4 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d2 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d4 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · learning consent true
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"EARNED","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-floor-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 3 (DEVELOPMENT) from 2026-12-11: —
- Next week 4 (CONSOLIDATION, provisional): d1 2026-12-13  RUN LONG 55min (LONG) | d2 2026-12-14  STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 22kg SINGLE_IMPLEMENT; db-floor-press 1x8 RIR3 14kg PER_HAND; db-row 1x8 RIR3 18kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-15  RUN EASY 45min (EASY +strides) | d4 2026-12-16  STRENGTH_FULL_B 19min: db-rdl 1x8 RIR3 18kg PER_HAND; db-row 1x8 RIR3 18kg PER_HAND; db-floor-press 1x8 RIR3 14kg PER_HAND; db-split-squat 1x8 RIR3 12kg PER_HAND; dead-bug 1x12 RIR3 BW | d5 2026-12-17  RUN EASY 40min (EASY)

### s3 · 2026-12-25T19:00:00+00:00 · WEEKLY_REVIEW (week 5)

- Athlete: 10 report(s): w4-run-d1 done 55min (performance=OVER,recovery=COMPATIBLE,effort=EASIER,nextDayFunction=NORMAL); w4-run-d3 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d5 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d1 done 65min (performance=OVER,recovery=COMPATIBLE,effort=EASIER,nextDayFunction=NORMAL); w5-run-d3 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d5 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d2 done 20min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d4 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d2 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d4 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) · learning consent false
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","db-floor-press":"ADVANCE","db-row":"ADVANCE","standing-calf-raise":"ADVANCE","dead-bug":"ADVANCE","db-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 5 (DEVELOPMENT) from 2026-12-25: —
- Next week 6 (DEVELOPMENT, provisional): d1 2026-12-27  RUN LONG 65min (LONG) | d2 2026-12-28  STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 22kg SINGLE_IMPLEMENT; db-floor-press 2x8 RIR3 14kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-29  RUN EASY 45min (EASY +strides) | d4 2026-12-30  STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 18kg PER_HAND; db-row 2x8 RIR3 18kg PER_HAND; db-floor-press 2x8 RIR3 14kg PER_HAND; db-split-squat 1x8 RIR3 12kg PER_HAND; dead-bug 1x12 RIR3 BW | d5 2026-12-31  RUN EASY 40min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- e1 @s1 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e2 @s1 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The single hard Tuesday run after a bad night is noise: it does not lower the plan or start a learned adjustment.
- e3 @s2 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- e4 @s2 JUDGED [DOMAIN_ORACLE]: **JUDGED** — With consent, the repeated easier-than-planned long-run response may lead to a modest, bounded adjustment of the long-run dose; any adjustment stays within normal progression limits.
- e5 @s3 JUDGED [INVARIANT_ORACLE]: **JUDGED** — After consent is revoked no new learned adjustment is applied; the plan follows the facts with the unlearned rules.

**Independent assessment (author, written before any output).**
- Rationale: An intermediate runner whose long runs always feel easier than planned; one bad Tuesday is just a bad night.
- Preferred: Ignore the one-off; with consent, nudge the long run modestly after the pattern repeats; once consent is revoked, stop learning and plan from the facts alone.
- Acceptable alternatives: Make no learned adjustment at all and progress normally / Ask the athlete whether the long runs feel too easy
- Concerns: Lowering the plan after one hard run / A large jump in long-run duration from the pattern / Keeping a learned adjustment active after consent is revoked
- Domain notes: Every step is a routine review, so the chosen days are fixed.

