# R7-D domain-evaluation packet (R7D-GENERATED-FINAL-1)

Runtime R7D-FREEZE-6 (d569ef2), harness R7D-HARNESS-9, first evaluation: true. Corpus sha256 b29dd52a58694143fe94cff3a0a4759bc1dde79948d1d6cabde40b9956e0e19f.

Per case: what the case asks, the intake, onboarding, every decision (current week = prescription; next week = provisional projection), automated results, the author's expectations and independent assessment.

## R7D-G001

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":8,"asOf":"2026-12-06","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-23"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-01-23"},"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":64,"longestRunMinutes":89,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","MACHINES","BANDS","PULL_UP_BAR","DUMBBELLS","BENCH","BARBELL","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":80,"strengthMinutes":28,"longRunDay":5,"longRunMinutes":102,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-12-09 AM RUN EASY 15min (EASY) | d1 2026-12-10 AM RUN EASY 15min (EASY) | d3 2026-12-12 AM RUN WALK 20min (WALK) | d4 2026-12-13 AM RUN WALK 20min (WALK) | d5 2026-12-14 AM RUN LONG 20min (LONG) | d6 2026-12-15 AM RUN WALK 20min (WALK)
- Week 1 (SPECIFIC): d0 2026-12-16 AM RUN EASY 15min (EASY) | d1 2026-12-17 AM RUN EASY 15min (EASY) | d3 2026-12-19 AM RUN WALK 20min (WALK) | d4 2026-12-20 AM RUN WALK 20min (WALK) | d5 2026-12-21 AM RUN LONG 20min (LONG) | d6 2026-12-22 AM RUN WALK 20min (WALK)
- Week 5 (TAPER): d0 2027-01-13 AM RUN EASY 15min (EASY +strides) | d1 2027-01-14 AM RUN EASY 15min (EASY +strides) | d3 2027-01-16 AM RUN EASY 15min (EASY +strides) | d4 2027-01-17 AM RUN EASY 15min (EASY) | d5 2027-01-18 AM RUN EASY 15min (EASY) | d6 2027-01-19 AM RUN WALK 20min (WALK)
- Week 6 (RACE_WEEK): d0 2027-01-20 AM RUN EASY 15min (EASY) | d1 2027-01-21 AM RUN EASY 15min (EASY) | d3 2027-01-23  RUN RACE 150min (RACE, completion) | d4 RUN REST_BY_DESIGN | d5 2027-01-25 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 2027-01-26 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G002

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":4,"asOf":"2027-01-03","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-26"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-01-26"},"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[0,1,2],"runTurn":"AM","strengthTurn":"PM","runMinutes":55,"strengthMinutes":66,"longRunDay":2,"longRunMinutes":94,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2027-01-04 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2027-01-04 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2027-01-05 AM RUN WALK 20min (WALK) | d1 2027-01-05 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-01-06 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2027-01-06 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2027-01-08 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2027-01-09 AM RUN WALK 20min (WALK) | d6 2027-01-10 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2027-01-11 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2027-01-11 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2027-01-12 AM RUN WALK 20min (WALK) | d1 2027-01-12 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-01-13 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2027-01-13 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; side-lying-hip-abduction 1x10 RIR3 BW | d4 2027-01-15 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-16 AM RUN WALK 20min (WALK) | d6 2027-01-17 AM RUN WALK 20min (WALK)
- Week 2 (SPECIFIC): d0 2027-01-18 AM RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d0 2027-01-18 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; side-lying-hip-abduction 1x12 RIR3 BW | d1 2027-01-19 AM RUN WALK 20min (WALK) | d1 2027-01-19 PM STRENGTH_UPPER 24min: incline-push-up 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 1x10 RIR3 establish; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-20 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2027-01-20 PM STRENGTH_FULL_B 16min: glute-bridge 1x10 RIR4 BW; db-row 1x8 RIR4 last logged; incline-push-up 1x10 RIR4 BW | d4 2027-01-22 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-23 AM RUN WALK 20min (WALK) | d6 2027-01-24 AM RUN WALK 20min (WALK)
- Week 3 (RACE_WEEK): d0 2027-01-25 AM RUN WALK 20min (WALK) | d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d1 2027-01-26  RUN RACE 150min (RACE, completion) | d2 RUN REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d4 2027-01-29 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-30 AM RUN WALK 20min (WALK) | d6 2027-01-31 AM RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G003

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":4,"asOf":"2026-11-25","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":58,"longestRunMinutes":49,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,5,6],"strengthDays":[0,1],"runTurn":"PM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":60,"longRunDay":5,"longRunMinutes":86,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-28 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-29 PM RUN EASY 15min (EASY) | d1 2026-11-29 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-30 PM RUN EASY 15min (EASY) | d5 2026-12-03 PM RUN LONG 20min (LONG) | d6 2026-12-04 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-05 PM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-06 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-06 PM RUN EASY 15min (EASY) | d2 2026-12-07 PM RUN EASY 15min (EASY) | d5 2026-12-10 PM RUN LONG 20min (LONG) | d6 2026-12-11 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G004

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-01","weeks":8,"asOf":"2026-11-28","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":140,"longestRunMinutes":40,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","RACK","BANDS","PULL_UP_BAR","KETTLEBELL","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,4,5,6],"strengthDays":[1,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":25,"strengthMinutes":60,"longRunDay":4,"longRunMinutes":144,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-02 PM RUN EASY 25min (EASY) | d1 2026-12-02 AM STRENGTH_LOWER 24min: kb-goblet-squat 2x8 RIR3 establish; kb-deadlift 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-03 PM RUN EASY 25min (EASY) | d4 2026-12-05 PM RUN LONG 40min (LONG) | d4 2026-12-05 AM STRENGTH_UPPER 24min: machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; push-up 1x10 RIR3 BW; kb-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2026-12-06 PM RUN EASY 25min (EASY) | d6 2026-12-07 PM RUN EASY 25min (EASY) | d6 2026-12-07 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-09 PM RUN EASY 25min (EASY) | d1 2026-12-09 AM STRENGTH_LOWER 24min: kb-goblet-squat 2x8 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-10 PM RUN EASY 25min (EASY) | d4 2026-12-12 PM RUN LONG 40min (LONG) | d4 2026-12-12 AM STRENGTH_UPPER 24min: machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; push-up 1x10 RIR3 BW; kb-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2026-12-13 PM RUN EASY 25min (EASY) | d6 2026-12-14 PM RUN EASY 25min (EASY) | d6 2026-12-14 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G005

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":4,"asOf":"2026-11-16","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-10"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2026-12-10"},"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":240,"longestRunMinutes":57,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT","PULL_UP_BAR","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,6],"strengthDays":[0,1,2,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":68,"strengthMinutes":73,"longRunDay":6,"longRunMinutes":121,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-17 AM STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-11-18 AM STRENGTH_UPPER 29min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-11-19 AM STRENGTH_LOWER_B 26min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; bent-knee-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-11-19 AM RUN EASY 57min (EASY) | d3 2026-11-20 AM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-overhead-triceps-extension 2x10 RIR3 establish | d3 2026-11-20 AM RUN EASY 57min (EASY) | d4 2026-11-21 AM RUN EASY 57min (EASY) | d6 2026-11-23 AM RUN LONG 55min (LONG)
- Week 1 (BUILD): d0 2026-11-24 AM STRENGTH_LOWER 34min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2026-11-25 AM STRENGTH_UPPER 34min: db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d2 2026-11-26 AM STRENGTH_LOWER_B 31min: db-rdl 3x8 RIR3 last logged; db-split-squat 3x10 RIR3 last logged; bent-knee-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-11-26 AM RUN EASY 57min (EASY) | d3 2026-11-27 AM STRENGTH_UPPER_B 27min: db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-overhead-triceps-extension 2x10 RIR3 last logged | d3 2026-11-27 AM RUN EASY 57min (EASY) | d4 2026-11-28 AM RUN EASY 57min (EASY) | d6 2026-11-30 AM RUN LONG 55min (LONG)
- Week 2 (SPECIFIC): d0 2026-12-01 AM STRENGTH_LOWER 35min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d1 2026-12-02 AM STRENGTH_UPPER 35min: db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d2 2026-12-03 AM STRENGTH_LOWER_B 32min: db-rdl 3x8 RIR3 last logged; db-split-squat 3x10 RIR3 last logged; bent-knee-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d2 2026-12-03 AM RUN EASY 57min (EASY) | d3 2026-12-04 AM STRENGTH_UPPER_B 14min: db-row 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged | d3 2026-12-04 AM RUN EASY 30min (EASY) | d4 2026-12-05 AM RUN EASY 30min (EASY) | d6 2026-12-07 AM RUN EASY 30min (EASY)
- Week 3 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d2 2026-12-10  RUN RACE 150min (RACE, completion) | d3 STRENGTH REST_BY_DESIGN | d3 RUN REST_BY_DESIGN | d4 2026-12-12 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 2026-12-14 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G006

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-24","weeks":12,"asOf":"2026-12-23","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":324,"longestRunMinutes":117,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["back-squat 5x10 105KG TOTAL"],"equipment":["PULL_UP_BAR","MACHINES","RACK","KETTLEBELL","DUMBBELLS","BENCH","BANDS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":58,"strengthMinutes":54,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-12-25 AM STRENGTH_FULL_A 36min: back-squat 5x10 RIR3 105kg TOTAL; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-29 AM STRENGTH_FULL_B 28min: kb-deadlift 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-01 AM STRENGTH_FULL_A 37min: back-squat 5x12 RIR3 105kg TOTAL; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d5 2027-01-05 AM STRENGTH_FULL_B 28min: kb-deadlift 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G007

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":16,"asOf":"2026-12-20","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":236,"longestRunMinutes":23,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["RACK","KETTLEBELL","BARBELL","BANDS","BENCH","DUMBBELLS","MACHINES","PULL_UP_BAR","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0,3,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":40,"strengthMinutes":46,"longRunDay":6,"longRunMinutes":104,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-21 PM RUN EASY 23min (EASY) | d0 2026-12-21 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-22 PM RUN EASY 23min (EASY) | d2 2026-12-23 PM RUN EASY 23min (EASY) | d3 2026-12-24 PM RUN EASY 23min (EASY) | d3 2026-12-24 AM STRENGTH_FULL_B 30min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; db-biceps-curl 2x8 RIR3 establish | d4 2026-12-25 PM RUN EASY 23min (EASY) | d4 2026-12-25 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-27 PM RUN LONG 20min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-12-28 PM RUN EASY 23min (EASY) | d0 2026-12-28 AM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-29 PM RUN EASY 23min (EASY) | d2 2026-12-30 PM RUN EASY 23min (EASY) | d3 2026-12-31 PM RUN EASY 23min (EASY) | d3 2026-12-31 AM STRENGTH_FULL_B 30min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; db-biceps-curl 2x8 RIR3 last logged | d4 2027-01-01 PM RUN EASY 23min (EASY) | d4 2027-01-01 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2027-01-03 PM RUN LONG 20min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G008

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-29","weeks":4,"asOf":"2026-11-29","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-24"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2026-12-24"},"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":64,"longestRunMinutes":52,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BODYWEIGHT","PULL_UP_BAR","BANDS","DUMBBELLS","KETTLEBELL","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,5],"strengthDays":[0,1,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":58,"strengthMinutes":31,"longRunDay":2,"longRunMinutes":143,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-29 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-30 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d2 2026-12-01 AM RUN LONG 20min (LONG) | d3 2026-12-02 AM RUN EASY 15min (EASY) | d4 2026-12-03 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-04 AM RUN EASY 15min (EASY)
- Week 1 (BUILD): d0 2026-12-06 AM STRENGTH_FULL_A 24min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-12-07 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d2 2026-12-08 AM RUN LONG 20min (LONG) | d3 2026-12-09 AM RUN EASY 15min (EASY) | d4 2026-12-10 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x12 RIR3 establish; front-plank 1x12 RIR3 BW | d5 2026-12-11 AM RUN EASY 15min (EASY)
- Week 2 (SPECIFIC): d0 2026-12-13 AM STRENGTH_LOWER 21min: goblet-squat 2x10 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW | d1 2026-12-14 AM STRENGTH_UPPER 20min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; machine-chest-press 1x12 RIR3 establish | d2 2026-12-15 AM RUN LONG 20min (LONG) | d3 2026-12-16 AM RUN EASY 15min (EASY) | d4 2026-12-17 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d5 2026-12-18 AM RUN EASY 15min (EASY)
- Week 3 (RACE_WEEK): d0 2026-12-20 AM STRENGTH_LOWER 14min: goblet-squat 1x10 RIR4 last logged; kb-deadlift 1x8 RIR4 last logged | d1 STRENGTH REST_BY_DESIGN | d2 2026-12-22 AM RUN EASY 15min (EASY) | d3 2026-12-23 AM RUN SHAKEOUT 15min (SHAKEOUT) | d4 STRENGTH REST_BY_DESIGN | d4 2026-12-24  RUN RACE 75min (RACE) | d5 RUN REST_BY_DESIGN

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G009

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":8,"asOf":"2026-12-29","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":260,"longestRunMinutes":28,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":37,"strengthMinutes":40,"longRunDay":1,"longRunMinutes":136,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-29 PM RUN EASY 28min (EASY) | d1 2026-12-30 PM RUN LONG 25min (LONG) | d4 2027-01-02 PM RUN EASY 28min (EASY) | d5 2027-01-03 PM RUN EASY 28min (EASY) | d6 2027-01-04 PM RUN EASY 28min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-05 PM RUN EASY 28min (EASY) | d1 2027-01-06 PM RUN LONG 30min (LONG) | d4 2027-01-09 PM RUN EASY 28min (EASY) | d5 2027-01-10 PM RUN EASY 28min (EASY) | d6 2027-01-11 PM RUN EASY 28min (EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G010

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-30","weeks":4,"asOf":"2026-12-27","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":300,"longestRunMinutes":16,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES","BODYWEIGHT","DUMBBELLS","BENCH","PULL_UP_BAR","BARBELL","RACK","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,5],"strengthDays":[1,2,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":84,"strengthMinutes":68,"longRunDay":1,"longRunMinutes":136,"sameTurnConfirmed":true}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G011

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-14","weeks":16,"asOf":"2026-11-12","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-26"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-02-26"},"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":52,"longestRunMinutes":72,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","PULL_UP_BAR","DUMBBELLS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[0,1],"runTurn":"PM","strengthTurn":"AM","runMinutes":87,"strengthMinutes":26,"longRunDay":2,"longRunMinutes":82,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-14 PM RUN EASY 15min (EASY) | d0 2026-11-14 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-15 PM RUN WALK 20min (WALK) | d1 2026-11-15 AM STRENGTH_FULL_B 25min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d2 2026-11-16 PM RUN LONG 20min (LONG) | d3 2026-11-17 PM RUN WALK 20min (WALK) | d5 2026-11-19 PM RUN EASY 15min (EASY)
- Week 1 (BUILD): d0 2026-11-21 PM RUN EASY 15min (EASY) | d0 2026-11-21 AM STRENGTH_FULL_A 25min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-11-22 PM RUN WALK 20min (WALK) | d1 2026-11-22 AM STRENGTH_FULL_B 25min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d2 2026-11-23 PM RUN LONG 20min (LONG) | d3 2026-11-24 PM RUN WALK 20min (WALK) | d5 2026-11-26 PM RUN EASY 15min (EASY)
- Week 13 (TAPER): d0 2027-02-13 PM RUN EASY 15min (EASY +strides) | d0 2027-02-13 AM STRENGTH_FULL_A 25min: goblet-squat 2x5 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2027-02-14 PM RUN EASY 15min (EASY +strides) | d1 2027-02-14 AM STRENGTH_FULL_B 25min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d2 2027-02-15 PM RUN LONG 25min (LONG) | d3 2027-02-16 PM RUN WALK 20min (WALK) | d5 2027-02-18 PM RUN EASY 15min (EASY +strides)
- Week 14 (RACE_WEEK): d0 2027-02-20 PM RUN EASY 15min (EASY) | d0 2027-02-20 AM STRENGTH_FULL_A 16min: goblet-squat 1x5 RIR4 last logged; db-floor-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d1 2027-02-21 PM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d2 2027-02-22 PM RUN EASY 15min (EASY) | d3 2027-02-23 PM RUN WALK 20min (WALK) | d5 2027-02-25 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d6 2027-02-26  RUN RACE 75min (RACE)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G012

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":8,"asOf":"2026-12-21","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-13"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-02-13"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["back-squat 3x12 41KG TOTAL","glute-bridge 3x12 0KG BODYWEIGHT"],"equipment":["RACK","BENCH","DUMBBELLS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3,5],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":45,"strengthMinutes":62,"longRunDay":3,"longRunMinutes":122,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-21 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-23 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-24 AM RUN WALK 20min (WALK) | d5 2026-12-26 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-12-28 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-30 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-31 AM RUN WALK 20min (WALK) | d5 2027-01-02 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 6 (TAPER): d0 2027-02-01 AM RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d2 2027-02-03 AM RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d3 2027-02-04 AM RUN WALK 20min (WALK) | d5 2027-02-06 AM RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk))
- Week 7 (RACE_WEEK): d0 2027-02-08 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d2 2027-02-10 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d3 2027-02-11 AM RUN WALK 20min (WALK) | d5 2027-02-13  RUN RACE 75min (RACE, completion)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G013

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":8,"asOf":"2026-12-20","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":180,"longestRunMinutes":21,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 3x10 7KG PER_HAND","glute-bridge 2x5 0KG BODYWEIGHT","db-split-squat 4x8 24KG TOTAL"],"equipment":["DUMBBELLS","MACHINES","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":47,"strengthMinutes":36,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G014

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":12,"asOf":"2026-12-25","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["kb-goblet-squat 4x6 8KG SINGLE_IMPLEMENT","glute-bridge 4x6 0KG BODYWEIGHT","reverse-lunge 5x6 0KG BODYWEIGHT"],"equipment":["BENCH","RACK","MACHINES","KETTLEBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[0,1,2,3,5,6],"strengthDays":[0,1,3,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":55,"strengthMinutes":24,"longRunDay":0,"longRunMinutes":33,"sameTurnConfirmed":true}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G015

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":16,"asOf":"2026-12-06","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-22"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-03-22"},"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":168,"longestRunMinutes":32,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["back-squat 4x12 118KG TOTAL"],"equipment":["BODYWEIGHT","DUMBBELLS","PULL_UP_BAR","BARBELL","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[0,1,2,3,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":72,"strengthMinutes":49,"longRunDay":3,"longRunMinutes":91,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d0 2026-12-06 AM STRENGTH_LOWER 29min: back-squat 4x10 RIR3 118kg TOTAL; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; side-lying-hip-abduction 1x10 RIR3 BW | d1 2026-12-07 AM RUN EASY 25min (EASY) | d1 2026-12-07 AM STRENGTH_UPPER 24min: incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 1x10 RIR3 establish; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-08 AM RUN EASY 25min (EASY) | d2 2026-12-08 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-09 AM RUN LONG 30min (LONG) | d3 2026-12-09 AM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d4 2026-12-10 AM RUN EASY 25min (EASY) | d5 2026-12-11 AM RUN EASY 25min (EASY) | d5 2026-12-11 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d6 2026-12-12 AM RUN EASY 25min (EASY)
- Week 1 (BUILD): d0 2026-12-13 AM STRENGTH_LOWER 29min: back-squat 4x6 RIR3 120.5kg TOTAL; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; side-lying-hip-abduction 1x12 RIR3 BW | d1 2026-12-14 AM RUN EASY 25min (EASY) | d1 2026-12-14 AM STRENGTH_UPPER 24min: incline-push-up 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-15 AM RUN EASY 25min (EASY) | d2 2026-12-15 AM STRENGTH_UPPER_B 21min: db-row 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-16 AM RUN LONG 35min (LONG) | d3 2026-12-16 AM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; bent-knee-calf-raise 1x12 RIR3 BW; tibialis-raise 1x12 RIR3 BW | d4 2026-12-17 AM RUN EASY 25min (EASY) | d5 2026-12-18 AM RUN EASY 25min (EASY) | d5 2026-12-18 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; front-plank 1x12 RIR3 BW | d6 2026-12-19 AM RUN EASY 25min (EASY)
- Week 14 (TAPER): d0 2027-03-14 AM STRENGTH_LOWER 23min: back-squat 2x10 RIR3 125.5kg TOTAL; glute-bridge 1x14 RIR3 BW; split-squat-bodyweight 1x14 RIR3 BW; single-leg-calf-raise 1x14 RIR3 BW; side-lying-hip-abduction 1x14 RIR3 BW | d1 2027-03-15 AM RUN EASY 25min (EASY +strides) | d1 2027-03-15 AM STRENGTH_UPPER 19min: incline-push-up 1x14 RIR3 BW; db-row 1x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; prone-ytw-raise 1x14 RIR3 BW; front-plank 1x14 RIR3 BW | d2 2027-03-16 AM RUN EASY 15min (EASY) | d2 2027-03-16 AM STRENGTH_UPPER_B 14min: db-row 1x8 RIR4 last logged; incline-push-up 1x14 RIR4 BW | d3 2027-03-17 AM RUN EASY 15min (EASY) | d3 STRENGTH REST_BY_DESIGN | d4 2027-03-18 AM RUN EASY 15min (EASY) | d5 2027-03-19 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d5 STRENGTH REST_BY_DESIGN | d6 2027-03-20 AM RUN EASY 15min (EASY)
- Week 15 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 2027-03-22  RUN RACE 75min (RACE) | d1 STRENGTH REST_BY_DESIGN | d2 RUN REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d3 2027-03-24 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 STRENGTH REST_BY_DESIGN | d4 2027-03-25 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 2027-03-26 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d5 STRENGTH REST_BY_DESIGN | d6 2027-03-27 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G016

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-10","weeks":8,"asOf":"2026-12-09","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-27"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-01-27"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":96,"longestRunMinutes":25,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","RACK","DUMBBELLS","PULL_UP_BAR","BENCH","BARBELL","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[6],"strengthDays":[1,2,4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":59,"strengthMinutes":70,"longRunDay":6,"longRunMinutes":43,"sameTurnConfirmed":false}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G017

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-05","weeks":16,"asOf":"2026-12-03","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":90,"longestRunMinutes":45,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS","DUMBBELLS","BARBELL","BENCH","RACK","KETTLEBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":82,"strengthMinutes":59,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-05 PM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 establish; db-rdl 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-06 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d2 2026-12-07 PM STRENGTH_LOWER_B 23min: db-rdl 2x10 RIR3 establish; db-split-squat 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-09 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d6 2026-12-11 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-12 PM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-13 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d2 2026-12-14 PM STRENGTH_LOWER_B 23min: db-rdl 2x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-16 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2026-12-18 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G018

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":4,"asOf":"2026-11-10","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":52,"longestRunMinutes":67,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[0,1,2,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":41,"strengthMinutes":53,"longRunDay":3,"longRunMinutes":33,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G019

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-24","weeks":4,"asOf":"2026-12-23","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-16"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-01-16"},"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BENCH","BANDS","PULL_UP_BAR","RACK","KETTLEBELL","BARBELL","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[6],"runTurn":"PM","strengthTurn":"AM","runMinutes":85,"strengthMinutes":64,"longRunDay":3,"longRunMinutes":36,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d3 2026-12-27 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-30 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d3 2027-01-03 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-06 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW
- Week 2 (SPECIFIC): d3 2027-01-10 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-13 AM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; db-bench-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged
- Week 3 (RACE_WEEK): d2 2027-01-16  RUN RACE 150min (RACE, completion) | d3 RUN REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G020

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":4,"asOf":"2026-12-05","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":120,"longestRunMinutes":23,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[6],"runTurn":"PM","strengthTurn":"PM","runMinutes":58,"strengthMinutes":69,"longRunDay":0,"longRunMinutes":96,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-06 PM RUN LONG 20min (LONG) | d1 2026-12-07 PM RUN EASY 23min (EASY) | d2 2026-12-08 PM RUN EASY 23min (EASY) | d3 2026-12-09 PM RUN EASY 23min (EASY) | d4 2026-12-10 PM RUN EASY 23min (EASY) | d6 2026-12-12 PM STRENGTH_FULL_A 39min: box-squat-bodyweight 5x10 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-13 PM RUN LONG 25min (LONG) | d1 2026-12-14 PM RUN EASY 23min (EASY) | d2 2026-12-15 PM RUN EASY 23min (EASY) | d3 2026-12-16 PM RUN EASY 23min (EASY) | d4 2026-12-17 PM RUN EASY 23min (EASY) | d6 2026-12-19 PM STRENGTH_FULL_A 43min: box-squat-bodyweight 5x10 RIR3 BW; incline-push-up 3x7 RIR3 BW; prone-ytw-raise 2x9 RIR3 BW; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G021

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":12,"asOf":"2026-12-14","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-27"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-02-27"},"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x12 0KG BODYWEIGHT","db-rdl 4x5 14KG PER_HAND"],"equipment":["BARBELL","BODYWEIGHT","PULL_UP_BAR","BENCH","BANDS","KETTLEBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,5],"strengthDays":[2,3,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":53,"strengthMinutes":34,"longRunDay":5,"longRunMinutes":87,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-15 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-17 AM STRENGTH_LOWER 33min: box-squat-bodyweight 4x12 RIR3 BW; db-rdl 4x5 RIR3 14kg PER_HAND; db-split-squat 2x10 RIR3 establish | d3 2026-12-18 AM STRENGTH_UPPER 22min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish | d3 2026-12-18 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-19 AM STRENGTH_LOWER_B 26min: db-rdl 4x5 RIR3 14kg PER_HAND; db-split-squat 2x8 RIR3 establish; seated-calf-raise-db 2x10 RIR3 establish | d5 2026-12-20 AM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-overhead-triceps-extension 2x10 RIR3 establish | d5 2026-12-20 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-12-22 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-24 AM STRENGTH_LOWER 33min: box-squat-bodyweight 4x12 RIR3 BW; db-rdl 4x5 RIR3 14kg PER_HAND; db-split-squat 2x10 RIR3 last logged | d3 2026-12-25 AM STRENGTH_UPPER 27min: db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged | d3 2026-12-25 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-26 AM STRENGTH_LOWER_B 29min: db-rdl 4x5 RIR3 14kg PER_HAND; db-split-squat 3x10 RIR3 last logged; seated-calf-raise-db 2x10 RIR3 last logged | d5 2026-12-27 AM STRENGTH_UPPER_B 27min: db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-overhead-triceps-extension 2x10 RIR3 last logged | d5 2026-12-27 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 9 (TAPER): d0 2027-02-16 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d2 2027-02-18 AM STRENGTH_LOWER 21min: box-squat-bodyweight 2x12 RIR3 BW; db-rdl 2x11 RIR3 14kg PER_HAND; reverse-lunge 1x10 RIR3 BW | d3 2027-02-19 AM STRENGTH_UPPER 20min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-lateral-raise 1x10 RIR3 last logged | d3 2027-02-19 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d4 2027-02-20 AM STRENGTH_LOWER_B 21min: db-rdl 2x11 RIR3 14kg PER_HAND; db-split-squat 2x10 RIR3 last logged; seated-calf-raise-db 1x10 RIR3 last logged | d5 2027-02-21 AM STRENGTH_UPPER_B 14min: db-row 1x8 RIR4 last logged; db-bench-press 1x8 RIR4 last logged | d5 2027-02-21 AM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk))
- Week 10 (RACE_WEEK): d0 2027-02-23 AM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d3 2027-02-26 AM RUN WALK 20min (WALK) | d4 STRENGTH REST_BY_DESIGN | d4 2027-02-27  RUN RACE 150min (RACE, completion) | d5 STRENGTH REST_BY_DESIGN | d5 RUN REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G022

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-30","weeks":8,"asOf":"2026-12-28","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":164,"longestRunMinutes":47,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["leg-press 5x10 85KG TOTAL"],"equipment":["KETTLEBELL","BANDS","MACHINES","RACK","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5,6],"strengthDays":[0,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":78,"strengthMinutes":40,"longRunDay":3,"longRunMinutes":37,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-30 AM STRENGTH_FULL_A 35min: leg-press 5x8 RIR3 85kg TOTAL; machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d0 2026-12-30 AM RUN EASY 25min (EASY) | d1 2026-12-31 AM RUN EASY 25min (EASY) | d3 2027-01-02 AM RUN LONG 37min (LONG) | d4 2027-01-03 AM RUN EASY 25min (EASY) | d5 2027-01-04 AM RUN EASY 25min (EASY) | d6 2027-01-05 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2027-01-05 AM RUN EASY 25min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-06 AM STRENGTH_FULL_A 35min: leg-press 5x8 RIR3 85kg TOTAL; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2027-01-06 AM RUN EASY 25min (EASY) | d1 2027-01-07 AM RUN EASY 25min (EASY) | d3 2027-01-09 AM RUN LONG 37min (LONG) | d4 2027-01-10 AM RUN EASY 25min (EASY) | d5 2027-01-11 AM RUN EASY 25min (EASY) | d6 2027-01-12 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-12 AM RUN EASY 25min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G023

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":16,"asOf":"2026-12-15","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":120,"longestRunMinutes":51,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3],"strengthDays":[0,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":46,"strengthMinutes":30,"longRunDay":3,"longRunMinutes":78,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G024

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":4,"asOf":"2026-12-05","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-21"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2026-12-21"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":164,"longestRunMinutes":24,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["back-squat 2x6 75KG TOTAL"],"equipment":["BARBELL","BENCH","MACHINES","PULL_UP_BAR","RACK","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4,5,6],"strengthDays":[0,3,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":34,"strengthMinutes":40,"longRunDay":6,"longRunMinutes":96,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-12-07 PM STRENGTH_LOWER 29min: back-squat 2x6 RIR3 75kg TOTAL; db-rdl 2x5 RIR3 establish; db-split-squat 2x7 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d3 2026-12-10 AM RUN EASY 24min (EASY) | d3 2026-12-10 PM STRENGTH_UPPER 28min: db-bench-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-floor-press 2x7 RIR3 establish; one-arm-db-row 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d4 2026-12-11 AM RUN EASY 24min (EASY) | d5 2026-12-12 AM RUN EASY 24min (EASY) | d6 2026-12-13 AM RUN LONG 20min (LONG) | d6 2026-12-13 PM STRENGTH_FULL_B 30min: db-rdl 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-bench-press 2x5 RIR3 establish; db-split-squat 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW
- Week 1 (SPECIFIC): d0 2026-12-14 PM STRENGTH_LOWER 32min: back-squat 2x6 RIR3 75kg TOTAL; db-rdl 3x5 RIR3 last logged; db-split-squat 2x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d3 2026-12-17 AM RUN EASY 15min (EASY) | d3 2026-12-17 PM STRENGTH_UPPER 13min: db-bench-press 1x5 RIR4 last logged; db-row 1x5 RIR4 last logged | d4 2026-12-18 AM RUN EASY 15min (EASY) | d5 2026-12-19 AM RUN EASY 15min (EASY) | d6 2026-12-20 AM RUN SHAKEOUT 15min (SHAKEOUT) | d6 STRENGTH REST_BY_DESIGN
- Week 1 (SPECIFIC): d0 2026-12-14 PM STRENGTH_LOWER 32min: back-squat 2x6 RIR3 75kg TOTAL; db-rdl 3x5 RIR3 last logged; db-split-squat 2x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d3 2026-12-17 AM RUN EASY 15min (EASY) | d3 2026-12-17 PM STRENGTH_UPPER 13min: db-bench-press 1x5 RIR4 last logged; db-row 1x5 RIR4 last logged | d4 2026-12-18 AM RUN EASY 15min (EASY) | d5 2026-12-19 AM RUN EASY 15min (EASY) | d6 2026-12-20 AM RUN SHAKEOUT 15min (SHAKEOUT) | d6 STRENGTH REST_BY_DESIGN
- Week 2 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2026-12-21  RUN RACE 150min (RACE, completion) | d3 2026-12-24 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 STRENGTH REST_BY_DESIGN | d4 2026-12-25 AM RUN RECOVERY_EASY 29min (RECOVERY_EASY) | d5 2026-12-26 AM RUN RECOVERY_EASY 29min (RECOVERY_EASY) | d6 2026-12-27 AM RUN RECOVERY_EASY 29min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G025

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":8,"asOf":"2026-12-28","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","DUMBBELLS","BANDS","MACHINES","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,4,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":48,"strengthMinutes":29,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2027-01-01 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d2 2027-01-02 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d4 2027-01-04 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-05 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-06 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-08 PM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d2 2027-01-09 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d4 2027-01-11 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d5 2027-01-12 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2027-01-13 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G026

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":16,"asOf":"2026-12-18","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":32,"longestRunMinutes":33,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":21,"strengthMinutes":67,"longRunDay":3,"longRunMinutes":84,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G027

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":4,"asOf":"2026-11-25","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-16"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2026-12-16"},"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":240,"longestRunMinutes":54,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5],"strengthDays":[4,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":29,"strengthMinutes":52,"longRunDay":2,"longRunMinutes":53,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-11-28 AM RUN EASY 29min (EASY) | d1 2026-11-29 AM RUN EASY 29min (EASY) | d2 2026-11-30 AM RUN LONG 50min (LONG) | d4 2026-12-02 AM RUN EASY 29min (EASY) | d4 2026-12-02 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-03 AM RUN EASY 29min (EASY) | d5 2026-12-03 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (SPECIFIC): d0 2026-12-05 AM RUN EASY 29min (EASY) | d1 2026-12-06 AM RUN EASY 29min (EASY) | d2 2026-12-07 AM RUN LONG 53min (LONG) | d4 2026-12-09 AM RUN EASY 29min (EASY) | d4 2026-12-09 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d5 2026-12-10 AM RUN EASY 15min (EASY) | d5 2026-12-10 PM STRENGTH_FULL_B 14min: glute-bridge 1x12 RIR4 BW; incline-push-up 1x12 RIR4 BW
- Week 1 (SPECIFIC): d0 2026-12-05 AM RUN EASY 29min (EASY) | d1 2026-12-06 AM RUN EASY 29min (EASY) | d2 2026-12-07 AM RUN LONG 53min (LONG) | d4 2026-12-09 AM RUN EASY 29min (EASY) | d4 2026-12-09 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d5 2026-12-10 AM RUN EASY 15min (EASY) | d5 2026-12-10 PM STRENGTH_FULL_B 14min: glute-bridge 1x12 RIR4 BW; incline-push-up 1x12 RIR4 BW
- Week 2 (RACE_WEEK): d0 2026-12-12 AM RUN EASY 15min (EASY) | d1 2026-12-13 AM RUN EASY 15min (EASY) | d2 2026-12-14 AM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d4 2026-12-16  RUN RACE 75min (RACE) | d5 RUN REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G028

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":12,"asOf":"2026-12-12","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":132,"longestRunMinutes":28,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","DUMBBELLS","KETTLEBELL","RACK","BANDS","BENCH","BODYWEIGHT","BARBELL"],"pause":{"nonclinical":true,"weeks":5,"reasonCategory":"TRAVEL"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":37,"strengthMinutes":31,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-12-15 AM STRENGTH_LOWER 22min: goblet-squat 2x5 RIR3 establish; db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x7 RIR3 establish | d3 2026-12-16 AM STRENGTH_UPPER 22min: db-bench-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-floor-press 2x7 RIR3 establish | d4 2026-12-17 AM STRENGTH_FULL_B 24min: db-rdl 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-bench-press 2x5 RIR3 establish
- Week 1 (DEVELOPMENT): d2 2026-12-22 AM STRENGTH_LOWER 28min: goblet-squat 3x5 RIR3 last logged; db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 2x7 RIR3 last logged | d3 2026-12-23 AM STRENGTH_UPPER 28min: db-bench-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-floor-press 2x7 RIR3 last logged | d4 2026-12-24 AM STRENGTH_FULL_B 30min: db-rdl 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-bench-press 2x5 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G029

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-23","weeks":4,"asOf":"2026-12-21","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x8 0KG BODYWEIGHT","kb-deadlift 4x6 14KG SINGLE_IMPLEMENT"],"equipment":["BENCH","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[5,6],"strengthDays":[2],"runTurn":"PM","strengthTurn":"AM","runMinutes":86,"strengthMinutes":30,"longRunDay":6,"longRunMinutes":87,"sameTurnConfirmed":false}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G030

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-19","weeks":8,"asOf":"2026-12-17","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":31,"longestRunMinutes":70,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BENCH","KETTLEBELL","BARBELL","DUMBBELLS","BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":6,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,5],"strengthDays":[0,1,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":88,"strengthMinutes":24,"longRunDay":0,"longRunMinutes":106,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-19 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-19 AM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish | d1 2026-12-20 AM STRENGTH_UPPER 20min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 1x10 RIR3 establish | d4 2026-12-23 AM STRENGTH_LOWER_B 20min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW | d5 2026-12-24 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-25 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-26 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-26 AM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged | d1 2026-12-27 AM STRENGTH_UPPER 20min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged | d4 2026-12-30 AM STRENGTH_LOWER_B 21min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW | d5 2026-12-31 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-01 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G031

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":8,"asOf":"2026-11-19","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-12"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-01-12"},"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":174,"longestRunMinutes":31,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":16,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,6],"strengthDays":[0,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":70,"strengthMinutes":23,"longRunDay":4,"longRunMinutes":126,"sameTurnConfirmed":true}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: POPULATION_OUTSIDE_V1_AGE_RANGE

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G032

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":8,"asOf":"2027-01-01","tz":330,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-17"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-02-17"},"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BARBELL","RACK","DUMBBELLS","BANDS","BENCH","MACHINES","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5],"strengthDays":[2,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":35,"strengthMinutes":72,"longRunDay":3,"longRunMinutes":48,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G033

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, CLINICAL_SIGNAL · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":8,"asOf":"2026-12-21","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","RACK","BANDS","PULL_UP_BAR","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":21,"strengthMinutes":47,"sameTurnConfirmed":true}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G034

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":4,"asOf":"2026-11-16","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":102,"longestRunMinutes":52,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 3x12 16KG PER_HAND","db-rdl 5x12 8KG PER_HAND"],"equipment":["BARBELL","DUMBBELLS","BENCH","BANDS","BODYWEIGHT","RACK","PULL_UP_BAR","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,6],"strengthDays":[4],"runTurn":"AM","strengthTurn":"AM","runMinutes":40,"strengthMinutes":30,"longRunDay":3,"longRunMinutes":140,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-18 AM RUN EASY 15min (EASY) | d1 2026-11-19 AM RUN EASY 15min (EASY) | d3 2026-11-21 AM RUN LONG 35min (LONG) | d4 2026-11-22 AM STRENGTH_FULL_A 27min: goblet-squat 3x12 RIR3 16kg PER_HAND; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish | d6 2026-11-24 AM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-25 AM RUN EASY 15min (EASY) | d1 2026-11-26 AM RUN EASY 15min (EASY) | d3 2026-11-28 AM RUN LONG 35min (LONG) | d4 2026-11-29 AM STRENGTH_FULL_A 29min: goblet-squat 3x8 RIR3 18kg PER_HAND; db-bench-press 3x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d6 2026-12-01 AM RUN EASY 15min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G035

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":4,"asOf":"2026-11-16","tz":0,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":93,"longestRunMinutes":56,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BARBELL","PULL_UP_BAR","RACK","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,6],"strengthDays":[1,3,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":74,"strengthMinutes":21,"longRunDay":2,"longRunMinutes":106,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G036

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-14","weeks":4,"asOf":"2026-12-13","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,6],"strengthDays":[5],"runTurn":"AM","strengthTurn":"PM","runMinutes":65,"strengthMinutes":63,"longRunDay":0,"longRunMinutes":91,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-14 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-17 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-19 PM STRENGTH_FULL_A 30min: box-squat-bodyweight 2x5 RIR3 BW; push-up 2x5 RIR3 BW; inverted-row 2x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-20 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-21 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-24 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-26 PM STRENGTH_FULL_A 39min: box-squat-bodyweight 3x5 RIR3 BW; push-up 3x5 RIR3 BW; inverted-row 3x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-27 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G037

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":16,"asOf":"2026-11-21","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-03"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-03-03"},"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":87,"longestRunMinutes":86,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["RACK","KETTLEBELL","BODYWEIGHT","BENCH","MACHINES","DUMBBELLS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[0,1,2,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":54,"strengthMinutes":33,"longRunDay":1,"longRunMinutes":85,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-22 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-23 PM RUN LONG 85min (LONG) | d1 2026-11-23 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d2 2026-11-24 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-11-26 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-28 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2026-11-29 AM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-11-30 PM RUN LONG 85min (LONG) | d1 2026-11-30 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d2 2026-12-01 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d4 2026-12-03 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2026-12-05 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW
- Week 13 (TAPER): d0 2027-02-21 AM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; leg-extension-machine 1x10 RIR3 last logged | d1 2027-02-22 PM RUN LONG 54min (LONG) | d1 2027-02-22 AM STRENGTH_UPPER 20min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-lateral-raise 1x10 RIR3 last logged | d2 2027-02-23 AM STRENGTH_LOWER_B 21min: kb-deadlift 2x8 RIR3 last logged; reverse-lunge 2x14 RIR3 BW; seated-calf-raise-db 1x10 RIR3 last logged | d4 2027-02-25 AM STRENGTH_UPPER_B 14min: db-row 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged | d6 STRENGTH REST_BY_DESIGN
- Week 14 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 2027-03-01 PM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d3 2027-03-03  RUN RACE 150min (RACE) | d4 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G038

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":12,"asOf":"2026-11-08","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":216,"longestRunMinutes":88,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","RACK","BARBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,3],"runTurn":"PM","strengthTurn":"PM","runMinutes":30,"strengthMinutes":72,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G039

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":8,"asOf":"2027-01-06","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 2x12 63KG TOTAL","hip-thrust-db 5x5 22KG PER_HAND","db-step-up 2x5 29KG PER_HAND"],"equipment":["PULL_UP_BAR","MACHINES","BARBELL","BENCH","RACK","DUMBBELLS","BANDS","BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5],"strengthDays":[1,2,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":80,"strengthMinutes":59,"longRunDay":5,"longRunMinutes":40,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2027-01-07 AM STRENGTH_LOWER 32min: leg-press 2x10 RIR3 63kg TOTAL; hip-thrust-db 5x5 RIR3 22kg PER_HAND; db-step-up 2x5 RIR3 29kg PER_HAND; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish | d2 2027-01-08 AM STRENGTH_UPPER 24min: incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-floor-press 1x10 RIR3 establish; db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2027-01-11 AM STRENGTH_FULL_B 35min: hip-thrust-db 5x5 RIR3 22kg PER_HAND; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; db-step-up 2x5 RIR3 29kg PER_HAND; dead-bug 1x10 RIR3 BW | d5 2027-01-11 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d1 2027-01-14 AM STRENGTH_LOWER 32min: leg-press 2x10 RIR3 63kg TOTAL; hip-thrust-db 5x5 RIR3 22kg PER_HAND; db-step-up 2x5 RIR3 29kg PER_HAND; db-calf-raise 1x10 RIR3 last logged; hip-abduction-machine 1x10 RIR3 last logged | d2 2027-01-15 AM STRENGTH_UPPER 24min: incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-floor-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2027-01-18 AM STRENGTH_FULL_B 35min: hip-thrust-db 5x5 RIR3 22kg PER_HAND; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; db-step-up 2x5 RIR3 29kg PER_HAND; dead-bug 1x10 RIR3 BW | d5 2027-01-18 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation · non-blocking differences: LOAD_CONVENTION_EQUIVALENT

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G040

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":16,"asOf":"2026-12-18","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":300,"longestRunMinutes":32,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":66,"strengthMinutes":62,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-22 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-12-24 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-29 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-31 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G041

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":4,"asOf":"2026-12-01","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-16"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2026-12-16"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":54,"longestRunMinutes":65,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BARBELL","KETTLEBELL","BANDS","BENCH","MACHINES","PULL_UP_BAR","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,4,6],"strengthDays":[3],"runTurn":"AM","strengthTurn":"PM","runMinutes":80,"strengthMinutes":56,"longRunDay":2,"longRunMinutes":41,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G042

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-23","weeks":4,"asOf":"2026-12-21","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":210,"longestRunMinutes":71,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES"],"pause":{"nonclinical":true,"weeks":6,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2],"runTurn":"PM","strengthTurn":"AM","runMinutes":64,"strengthMinutes":39,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-24 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-12-25 AM STRENGTH_FULL_B 31min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; band-biceps-curl 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-31 AM STRENGTH_FULL_A 31min: leg-press 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2027-01-01 AM STRENGTH_FULL_B 31min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; band-biceps-curl 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G043

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":8,"asOf":"2026-12-08","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":28,"longestRunMinutes":27,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 5x8 117KG TOTAL"],"equipment":["BENCH","RACK","MACHINES","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":77,"strengthMinutes":22,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2026-12-11 AM STRENGTH_FULL_A 21min: leg-press 2x8 RIR3 117kg TOTAL; machine-chest-press 2x8 RIR3 establish; seated-cable-row 1x8 RIR3 establish | d3 2026-12-12 AM STRENGTH_FULL_B 21min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; machine-chest-press 1x8 RIR3 establish
- Week 1 (DEVELOPMENT): d2 2026-12-18 AM STRENGTH_FULL_A 21min: leg-press 2x8 RIR3 117kg TOTAL; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 1x8 RIR3 last logged | d3 2026-12-19 AM STRENGTH_FULL_B 21min: glute-bridge 2x10 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 1x8 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G044

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":16,"asOf":"2026-12-13","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-22"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-03-22"},"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":37,"longestRunMinutes":84,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","BODYWEIGHT","BANDS","MACHINES","DUMBBELLS","BARBELL","BENCH","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3],"strengthDays":[0],"runTurn":"AM","strengthTurn":"AM","runMinutes":64,"strengthMinutes":21,"longRunDay":1,"longRunMinutes":54,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-13 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d0 2026-12-13 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-14 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-16 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-12-20 AM STRENGTH_FULL_A 19min: goblet-squat 2x10 RIR3 establish; db-floor-press 1x10 RIR3 establish; db-row 1x10 RIR3 establish | d0 2026-12-20 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-21 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-23 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 13 (TAPER): d0 2027-03-14 AM STRENGTH_FULL_A 16min: goblet-squat 1x10 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged | d0 2027-03-14 AM RUN EASY 20min (EASY) | d1 2027-03-15 AM RUN EASY 20min (EASY) | d3 2027-03-17 AM RUN EASY 15min (EASY)
- Week 14 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2027-03-21 AM RUN SHAKEOUT 15min (SHAKEOUT) | d1 2027-03-22  RUN RACE 75min (RACE, completion) | d3 2027-03-24 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G045

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-05","weeks":4,"asOf":"2026-12-02","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","RACK","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,5],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":86,"strengthMinutes":36,"longRunDay":5,"longRunMinutes":39,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d3 2026-12-08 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-10 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d3 2026-12-15 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-17 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G046

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-24","weeks":8,"asOf":"2026-11-21","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-12"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-01-12"},"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":260,"longestRunMinutes":40,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x5 0KG BODYWEIGHT","glute-bridge 3x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":63,"strengthMinutes":43,"longRunDay":3,"longRunMinutes":102,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d3 2026-11-27 PM RUN LONG 40min (LONG)
- Week 1 (BUILD): d3 2026-12-04 PM RUN LONG 45min (LONG)
- Week 6 (TAPER): d3 2027-01-08 PM RUN EASY 15min (EASY)
- Week 7 (RACE_WEEK): d0 2027-01-12  RUN RACE 150min (RACE, completion) | d3 2027-01-15 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G047

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":8,"asOf":"2026-11-20","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":108,"longestRunMinutes":43,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":7,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[0,1,2,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":22,"strengthMinutes":33,"longRunDay":4,"longRunMinutes":116,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-20 AM STRENGTH_LOWER 20min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d0 2026-11-20 AM RUN EASY 15min (EASY) | d1 2026-11-21 AM STRENGTH_UPPER 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW | d1 2026-11-21 AM RUN WALK 20min (WALK) | d2 2026-11-22 AM STRENGTH_LOWER_B 20min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW | d2 2026-11-22 AM RUN EASY 15min (EASY) | d3 2026-11-23 AM STRENGTH_UPPER_B 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-23 AM RUN WALK 20min (WALK) | d4 2026-11-24 AM RUN EASY 15min (EASY) | d6 2026-11-26 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-27 AM STRENGTH_LOWER 20min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d0 2026-11-27 AM RUN EASY 20min (EASY) | d1 2026-11-28 AM STRENGTH_UPPER 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW | d1 2026-11-28 AM RUN WALK 20min (WALK) | d2 2026-11-29 AM STRENGTH_LOWER_B 21min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW | d2 2026-11-29 AM RUN EASY 20min (EASY) | d3 2026-11-30 AM STRENGTH_UPPER_B 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-30 AM RUN WALK 20min (WALK) | d4 2026-12-01 AM RUN EASY 20min (EASY) | d6 2026-12-03 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G048

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-05","weeks":16,"asOf":"2026-12-02","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":98,"longestRunMinutes":68,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","BODYWEIGHT","DUMBBELLS","PULL_UP_BAR","BENCH","MACHINES","BARBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":84,"strengthMinutes":45,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-06 PM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 establish; db-rdl 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-07 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d6 2026-12-11 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-13 PM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-14 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2026-12-18 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G049

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":12,"asOf":"2026-11-18","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":96,"longestRunMinutes":25,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","PULL_UP_BAR","MACHINES","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":48,"strengthMinutes":34,"longRunDay":1,"longRunMinutes":122,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-21 AM RUN EASY 15min (EASY) | d1 2026-11-22 AM RUN LONG 25min (LONG) | d2 2026-11-23 AM RUN EASY 15min (EASY) | d3 2026-11-24 AM RUN EASY 15min (EASY) | d4 2026-11-25 AM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-28 AM RUN EASY 15min (EASY) | d1 2026-11-29 AM RUN LONG 30min (LONG) | d2 2026-11-30 AM RUN EASY 15min (EASY) | d3 2026-12-01 AM RUN EASY 15min (EASY) | d4 2026-12-02 AM RUN EASY 15min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G050

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-08","weeks":12,"asOf":"2027-01-07","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-23"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-03-23"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":52,"longestRunMinutes":130,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x6 0KG BODYWEIGHT","hip-thrust-db 3x6 56KG TOTAL","db-split-squat 4x8 14KG PER_HAND"],"equipment":["BANDS","PULL_UP_BAR","KETTLEBELL","BODYWEIGHT","DUMBBELLS","MACHINES","RACK","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":62,"strengthMinutes":55,"longRunDay":2,"longRunMinutes":71,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d1 2027-01-09 AM RUN WALK 20min (WALK) | d2 2027-01-10 AM RUN LONG 20min (LONG) | d3 2027-01-11 AM RUN WALK 20min (WALK) | d4 2027-01-12 AM RUN EASY 15min (EASY) | d5 2027-01-13 AM RUN EASY 15min (EASY) | d6 2027-01-14 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d1 2027-01-16 AM RUN WALK 20min (WALK) | d2 2027-01-17 AM RUN LONG 20min (LONG) | d3 2027-01-18 AM RUN WALK 20min (WALK) | d4 2027-01-19 AM RUN EASY 15min (EASY) | d5 2027-01-20 AM RUN EASY 15min (EASY) | d6 2027-01-21 AM RUN WALK 20min (WALK)
- Week 9 (TAPER): d1 2027-03-13 AM RUN WALK 20min (WALK) | d2 2027-03-14 AM RUN LONG 20min (LONG) | d3 2027-03-15 AM RUN WALK 20min (WALK) | d4 2027-03-16 AM RUN EASY 15min (EASY +strides) | d5 2027-03-17 AM RUN EASY 15min (EASY) | d6 2027-03-18 AM RUN EASY 15min (EASY)
- Week 10 (RACE_WEEK): d1 2027-03-20 AM RUN WALK 20min (WALK) | d2 2027-03-21 AM RUN EASY 15min (EASY) | d3 2027-03-22 AM RUN WALK 20min (WALK) | d4 2027-03-23  RUN RACE 150min (RACE, completion) | d5 RUN REST_BY_DESIGN | d6 2027-03-25 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G051

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":8,"asOf":"2026-12-29","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":84,"longestRunMinutes":60,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["kb-goblet-squat 4x6 16KG SINGLE_IMPLEMENT","barbell-rdl 5x5 61KG TOTAL","db-split-squat 2x5 28KG PER_HAND"],"equipment":["RACK","BARBELL","DUMBBELLS","PULL_UP_BAR","BODYWEIGHT","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3],"strengthDays":[1,2,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":88,"strengthMinutes":27,"longRunDay":3,"longRunMinutes":135,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-31 PM RUN EASY 20min (EASY) | d1 2027-01-01 PM STRENGTH_LOWER 22min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 2x5 RIR3 28kg PER_HAND | d2 2027-01-02 PM STRENGTH_UPPER 20min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; push-up 1x10 RIR3 BW | d3 2027-01-03 PM RUN LONG 60min (LONG) | d6 2027-01-06 PM STRENGTH_FULL_B 24min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2027-01-07 PM RUN EASY 20min (EASY) | d1 2027-01-08 PM STRENGTH_LOWER 22min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 2x5 RIR3 28kg PER_HAND | d2 2027-01-09 PM STRENGTH_UPPER 20min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; push-up 1x12 RIR3 BW | d3 2027-01-10 PM RUN LONG 65min (LONG) | d6 2027-01-13 PM STRENGTH_FULL_B 24min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G052

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":12,"asOf":"2026-12-31","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 2x5 13KG PER_HAND","glute-bridge 3x6 0KG BODYWEIGHT"],"equipment":["MACHINES","BARBELL","RACK","DUMBBELLS","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":87,"strengthMinutes":67,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2027-01-04 PM STRENGTH_FULL_A 27min: goblet-squat 2x5 RIR3 13kg PER_HAND; db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-08 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2027-01-11 PM STRENGTH_FULL_A 28min: goblet-squat 2x7 RIR3 13kg PER_HAND; db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2027-01-15 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G053

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":16,"asOf":"2026-11-14","tz":60,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":312,"longestRunMinutes":114,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BENCH","KETTLEBELL","BANDS","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4,5,6],"strengthDays":[0,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":69,"strengthMinutes":56,"longRunDay":4,"longRunMinutes":118,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G054

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":12,"asOf":"2026-11-16","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-01"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-02-01"},"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","KETTLEBELL","BODYWEIGHT","MACHINES","DUMBBELLS","BENCH","BANDS"],"pause":{"nonclinical":true,"weeks":10,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":21,"strengthMinutes":36,"longRunDay":2,"longRunMinutes":115,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-16 PM RUN EASY 15min (EASY) | d1 2026-11-17 PM RUN WALK 20min (WALK) | d2 2026-11-18 PM RUN EASY 15min (EASY) | d5 2026-11-21 PM RUN EASY 15min (EASY) | d6 2026-11-22 PM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-11-23 PM RUN EASY 20min (EASY) | d1 2026-11-24 PM RUN WALK 20min (WALK) | d2 2026-11-25 PM RUN EASY 20min (EASY) | d5 2026-11-28 PM RUN EASY 20min (EASY) | d6 2026-11-29 PM RUN WALK 20min (WALK)
- Week 10 (TAPER): d0 2027-01-25 PM RUN EASY 15min (EASY +strides) | d1 2027-01-26 PM RUN EASY 15min (EASY) | d2 2027-01-27 PM RUN EASY 15min (EASY) | d5 2027-01-30 PM RUN EASY 15min (EASY) | d6 2027-01-31 PM RUN SHAKEOUT 15min (SHAKEOUT +strides)
- Week 11 (RACE_WEEK): d0 2027-02-01  RUN RACE 75min (RACE, completion) | d1 RUN REST_BY_DESIGN | d2 2027-02-03 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 2027-02-06 PM RUN RECOVERY_EASY 21min (RECOVERY_EASY) | d6 2027-02-07 PM RUN RECOVERY_EASY 21min (RECOVERY_EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G055

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":12,"asOf":"2026-11-29","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x10 0KG BODYWEIGHT","glute-bridge 5x12 0KG BODYWEIGHT","reverse-lunge 3x10 0KG BODYWEIGHT"],"equipment":["RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[6],"strengthDays":[1,2,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":51,"strengthMinutes":38,"longRunDay":6,"longRunMinutes":92,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-03 PM STRENGTH_LOWER 28min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 3x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2026-12-04 PM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-07 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 3x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-08 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d1 2026-12-10 PM STRENGTH_LOWER 28min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 3x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2026-12-11 PM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-14 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 3x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-15 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G056

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-13","weeks":16,"asOf":"2026-11-11","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[6],"runTurn":"AM","strengthTurn":"PM","runMinutes":54,"strengthMinutes":52,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d6 2026-11-19 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d6 2026-11-26 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G057

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":4,"asOf":"2026-11-25","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":195,"longestRunMinutes":59,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x12 0KG BODYWEIGHT","glute-bridge 4x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":10,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[0,3,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":35,"strengthMinutes":36,"longRunDay":3,"longRunMinutes":121,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-28 AM RUN EASY 15min (EASY) | d0 2026-11-28 AM STRENGTH_LOWER 28min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-11-29 AM RUN WALK 20min (WALK) | d2 2026-11-30 AM RUN EASY 15min (EASY) | d3 2026-12-01 AM RUN WALK 20min (WALK) | d3 2026-12-01 AM STRENGTH_UPPER 20min: incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-02 AM RUN EASY 15min (EASY) | d4 2026-12-02 AM STRENGTH_LOWER_B 25min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-04 AM STRENGTH_UPPER_B 20min: incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-05 AM RUN EASY 20min (EASY) | d0 2026-12-05 AM STRENGTH_LOWER 34min: box-squat-bodyweight 3x5 RIR3 BW; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-12-06 AM RUN WALK 20min (WALK) | d2 2026-12-07 AM RUN EASY 20min (EASY) | d3 2026-12-08 AM RUN WALK 20min (WALK) | d3 2026-12-08 AM STRENGTH_UPPER 23min: incline-push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-09 AM RUN EASY 20min (EASY) | d4 2026-12-09 AM STRENGTH_LOWER_B 31min: glute-bridge 3x5 RIR3 BW; reverse-lunge 3x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-11 AM STRENGTH_UPPER_B 23min: incline-push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G058

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-08","weeks":4,"asOf":"2027-01-06","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-28"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-01-28"},"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":215,"longestRunMinutes":41,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x10 0KG BODYWEIGHT","glute-bridge 2x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT","RACK","DUMBBELLS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,4,5],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":43,"strengthMinutes":70,"longRunDay":4,"longRunMinutes":85,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d2 2027-01-10 AM RUN EASY 41min (EASY) | d4 2027-01-12 AM RUN LONG 40min (LONG) | d5 2027-01-13 AM RUN EASY 41min (EASY)
- Week 1 (SPECIFIC): d2 2027-01-17 AM RUN EASY 41min (EASY) | d4 2027-01-19 AM RUN LONG 45min (LONG) | d5 2027-01-20 AM RUN EASY 41min (EASY)
- Week 1 (SPECIFIC): d2 2027-01-17 AM RUN EASY 41min (EASY) | d4 2027-01-19 AM RUN LONG 45min (LONG) | d5 2027-01-20 AM RUN EASY 41min (EASY)
- Week 2 (RACE_WEEK): d2 2027-01-24 AM RUN EASY 20min (EASY) | d4 2027-01-26 AM RUN EASY 20min (EASY) | d5 2027-01-27 AM RUN SHAKEOUT 15min (SHAKEOUT) | d6 2027-01-28  RUN RACE 150min (RACE, completion)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G059

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":8,"asOf":"2026-12-14","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":47,"longestRunMinutes":47,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,4,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":43,"strengthMinutes":64,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-15 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-16 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-19 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-20 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-22 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-23 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-26 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d5 2026-12-27 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G060

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-24","weeks":4,"asOf":"2026-12-24","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":22,"longestRunMinutes":38,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BENCH","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1],"strengthDays":[0,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":67,"strengthMinutes":75,"longRunDay":0,"longRunMinutes":48,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-24 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d0 2026-12-24 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-25 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-29 PM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; cable-triceps-pushdown 2x8 RIR3 establish | d6 2026-12-30 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-31 PM STRENGTH_FULL_A 31min: leg-press 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d0 2026-12-31 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-01 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-05 PM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; cable-triceps-pushdown 2x8 RIR3 last logged | d6 2027-01-06 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 establish; front-plank 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G061

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":16,"asOf":"2026-11-16","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-28"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-02-28"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":300,"longestRunMinutes":54,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[6],"strengthDays":[0,1,2,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":90,"strengthMinutes":33,"longRunDay":6,"longRunMinutes":122,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-18 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-19 PM STRENGTH_FULL_B 21min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d2 2026-11-20 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-23 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-24 AM RUN LONG 50min (LONG) | d6 2026-11-24 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2026-11-25 PM STRENGTH_FULL_A 21min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d1 2026-11-26 PM STRENGTH_FULL_B 21min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d2 2026-11-27 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d5 2026-11-30 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2026-12-01 AM RUN LONG 50min (LONG) | d6 2026-12-01 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 13 (TAPER): d0 2027-02-17 PM STRENGTH_LOWER 17min: box-squat-bodyweight 1x16 RIR3 BW; glute-bridge 1x16 RIR3 BW; reverse-lunge 1x16 RIR3 BW | d1 2027-02-18 PM STRENGTH_UPPER 16min: incline-push-up 1x16 RIR3 BW; prone-ytw-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d2 2027-02-19 PM STRENGTH_LOWER_B 17min: glute-bridge 1x16 RIR3 BW; reverse-lunge 1x16 RIR3 BW; bent-knee-calf-raise 1x16 RIR3 BW | d5 2027-02-22 PM STRENGTH_UPPER_B 12min: incline-push-up 1x16 RIR4 BW | d6 2027-02-23 AM RUN EASY 15min (EASY) | d6 STRENGTH REST_BY_DESIGN
- Week 14 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d4 2027-02-28  RUN RACE 150min (RACE) | d5 STRENGTH REST_BY_DESIGN | d6 2027-03-02 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G062

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":8,"asOf":"2026-12-12","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":165,"longestRunMinutes":47,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3],"strengthDays":[0,1,2,3,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":56,"strengthMinutes":40,"longRunDay":1,"longRunMinutes":126,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-13 PM RUN EASY 40min (EASY) | d0 2026-12-13 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-14 PM RUN LONG 45min (LONG) | d1 2026-12-14 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-15 PM RUN EASY 40min (EASY) | d2 2026-12-15 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-16 PM RUN EASY 40min (EASY) | d3 2026-12-16 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-19 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-20 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d0 2026-12-20 PM RUN EASY 40min (EASY) | d1 2026-12-21 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-21 PM RUN LONG 45min (LONG) | d2 2026-12-22 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d2 2026-12-22 PM RUN EASY 40min (EASY) | d3 2026-12-23 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d3 2026-12-23 PM RUN EASY 40min (EASY) | d6 2026-12-26 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G063

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":4,"asOf":"2026-11-15","tz":0,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":108,"longestRunMinutes":77,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":5,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[3,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":85,"strengthMinutes":64,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G064

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":4,"asOf":"2026-11-18","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":230,"longestRunMinutes":18,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[0,1,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":36,"strengthMinutes":33,"longRunDay":1,"longRunMinutes":37,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-18 AM STRENGTH_UPPER 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW | d1 2026-11-19 AM RUN LONG 15min (LONG) | d1 2026-11-19 AM STRENGTH_LOWER 20min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d3 2026-11-21 AM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-25 AM STRENGTH_UPPER 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW | d1 2026-11-26 AM RUN LONG 15min (LONG) | d1 2026-11-26 AM STRENGTH_LOWER 20min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d3 2026-11-28 AM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G065

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":8,"asOf":"2026-11-20","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":94,"longestRunMinutes":75,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 4x12 51KG TOTAL","glute-bridge 4x10 0KG BODYWEIGHT","reverse-lunge 3x10 0KG BODYWEIGHT"],"equipment":["MACHINES","BANDS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,6],"strengthDays":[2,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":20,"strengthMinutes":42,"longRunDay":4,"longRunMinutes":131,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-22 AM RUN EASY 15min (EASY) | d1 2026-11-23 AM RUN EASY 15min (EASY) | d2 2026-11-24 AM STRENGTH_FULL_A 34min: leg-press 4x12 RIR3 51kg TOTAL; machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-24 AM RUN EASY 15min (EASY) | d4 2026-11-26 AM RUN LONG 35min (LONG) | d6 2026-11-28 AM STRENGTH_FULL_B 37min: glute-bridge 4x10 RIR3 BW; seated-cable-row 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; reverse-lunge 3x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-11-28 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-11-29 AM RUN EASY 15min (EASY) | d1 2026-11-30 AM RUN EASY 15min (EASY) | d2 2026-12-01 AM STRENGTH_FULL_A 33min: leg-press 4x8 RIR3 53.5kg TOTAL; machine-chest-press 2x10 RIR3 last logged; seated-cable-row 2x10 RIR3 last logged; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-12-01 AM RUN EASY 15min (EASY) | d4 2026-12-03 AM RUN LONG 35min (LONG) | d6 2026-12-05 AM STRENGTH_FULL_B 38min: glute-bridge 4x12 RIR3 BW; seated-cable-row 2x10 RIR3 last logged; machine-chest-press 2x10 RIR3 last logged; reverse-lunge 3x12 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2026-12-05 AM RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G066

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":16,"asOf":"2027-01-03","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-04-14"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-04-14"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":118,"longestRunMinutes":92,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BENCH","RACK","BARBELL","KETTLEBELL","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4],"strengthDays":[0],"runTurn":"PM","strengthTurn":"AM","runMinutes":59,"strengthMinutes":67,"longRunDay":3,"longRunMinutes":38,"sameTurnConfirmed":false}}`

**Onboarding.** UNSUPPORTED: Generated candidate failed complete validation; no partial program is presented as complete

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G067

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":4,"asOf":"2026-12-18","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 2x12 111KG TOTAL"],"equipment":["RACK","BENCH","DUMBBELLS","PULL_UP_BAR","MACHINES","BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5,6],"strengthDays":[1,2,3,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":34,"strengthMinutes":64,"longRunDay":6,"longRunMinutes":100,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-21 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-22 AM STRENGTH_LOWER 30min: leg-press 2x12 RIR3 111kg TOTAL; glute-bridge 2x8 RIR3 BW; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-22 AM RUN WALK 20min (WALK) | d2 2026-12-23 AM STRENGTH_UPPER 29min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-12-23 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-24 AM STRENGTH_LOWER_B 26min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; db-calf-raise 2x10 RIR3 establish; leg-curl-machine 2x10 RIR3 establish | d3 2026-12-24 AM RUN WALK 20min (WALK) | d5 2026-12-26 AM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d5 2026-12-26 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-27 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-28 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-29 AM STRENGTH_LOWER 32min: leg-press 2x12 RIR3 111kg TOTAL; glute-bridge 3x8 RIR3 BW; leg-extension-machine 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2026-12-29 AM RUN WALK 20min (WALK) | d2 2026-12-30 AM STRENGTH_UPPER 34min: db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d2 2026-12-30 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-31 AM STRENGTH_LOWER_B 31min: glute-bridge 3x8 RIR3 BW; reverse-lunge 3x8 RIR3 BW; db-calf-raise 2x10 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged | d3 2026-12-31 AM RUN WALK 20min (WALK) | d5 2027-01-02 AM STRENGTH_UPPER_B 27min: db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged | d5 2027-01-02 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-03 AM RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G068

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":12,"asOf":"2026-12-10","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":3,"runMinutesPerWeek":171,"longestRunMinutes":54,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","RACK","BANDS","BARBELL","DUMBBELLS","PULL_UP_BAR","BENCH","BODYWEIGHT","KETTLEBELL"],"pause":{"nonclinical":true,"weeks":2,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3],"strengthDays":[1,2,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":85,"strengthMinutes":41,"longRunDay":3,"longRunMinutes":102,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-13 AM RUN EASY 40min (EASY) | d1 2026-12-14 AM RUN EASY 40min (EASY) | d1 2026-12-14 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-12-15 AM RUN EASY 40min (EASY) | d2 2026-12-15 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-16 AM RUN LONG 50min (LONG) | d5 2026-12-18 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-20 AM RUN EASY 40min (EASY) | d1 2026-12-21 AM RUN EASY 40min (EASY) | d1 2026-12-21 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-22 AM RUN EASY 40min (EASY) | d2 2026-12-22 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d3 2026-12-23 AM RUN LONG 50min (LONG) | d5 2026-12-25 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G069

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-05","weeks":8,"asOf":"2026-12-05","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":24,"longestRunMinutes":34,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BENCH","BARBELL","RACK","DUMBBELLS","PULL_UP_BAR","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,4],"strengthDays":[2,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":90,"strengthMinutes":21,"longRunDay":1,"longRunMinutes":104,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-06 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-07 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-07 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d3 2026-12-08 AM STRENGTH_FULL_B 21min: kb-deadlift 2x8 RIR3 establish; band-row 2x8 RIR3 BW; incline-push-up 1x8 RIR3 BW | d4 2026-12-09 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-11 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-13 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-14 AM STRENGTH_FULL_A 21min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; band-row 1x8 RIR3 BW | d2 2026-12-14 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-15 AM STRENGTH_FULL_B 21min: kb-deadlift 2x8 RIR3 last logged; band-row 2x8 RIR3 BW; incline-push-up 1x8 RIR3 BW | d4 2026-12-16 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-18 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; side-lying-hip-abduction 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G070

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-25","weeks":4,"asOf":"2026-12-23","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BANDS","BODYWEIGHT","KETTLEBELL","MACHINES","BENCH","PULL_UP_BAR","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4,5],"strengthDays":[4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":86,"strengthMinutes":55,"longRunDay":5,"longRunMinutes":87,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d3 2026-12-28 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-29 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2026-12-29 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-30 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-31 AM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d3 2027-01-04 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-05 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d4 2027-01-05 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-06 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-07 AM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G071

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, OUT_OF_SCOPE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":12,"asOf":"2026-12-25","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"MARATHON","date":"2027-03-19"}},"strength":"NONE"},"event":{"kind":"MARATHON","date":"2027-03-19"},"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x10 0KG BODYWEIGHT","glute-bridge 5x12 0KG BODYWEIGHT","reverse-lunge 2x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":2,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":44,"strengthMinutes":27,"longRunDay":4,"longRunMinutes":99,"sameTurnConfirmed":true}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: EVENT_DISTANCE_OUTSIDE_V1

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G072

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-03","weeks":4,"asOf":"2027-01-03","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x6 0KG BODYWEIGHT","glute-bridge 4x12 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[3],"runTurn":"PM","strengthTurn":"PM","runMinutes":79,"strengthMinutes":49,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d3 2027-01-06 PM STRENGTH_FULL_A 23min: box-squat-bodyweight 2x6 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d3 2027-01-13 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G073

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, ELIGIBILITY_UNKNOWN, OUT_OF_SCOPE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":8,"asOf":"2026-12-04","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-29"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-01-29"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[0,5],"strengthDays":[0,1,2,3,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":48,"strengthMinutes":64,"longRunDay":0,"longRunMinutes":104,"sameTurnConfirmed":false}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1 · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G074

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-07","weeks":16,"asOf":"2027-01-06","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":3,"runMinutesPerWeek":111,"longestRunMinutes":78,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x6 0KG BODYWEIGHT","kb-deadlift 4x5 23KG SINGLE_IMPLEMENT"],"equipment":["BODYWEIGHT","BENCH","BANDS","BARBELL","DUMBBELLS","KETTLEBELL","MACHINES","RACK","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":65,"strengthMinutes":37,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2027-01-09 PM STRENGTH_LOWER 28min: box-squat-bodyweight 2x6 RIR3 BW; kb-deadlift 4x5 RIR3 23kg SINGLE_IMPLEMENT; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-10 PM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; machine-chest-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2027-01-11 PM STRENGTH_FULL_B 32min: kb-deadlift 4x5 RIR3 23kg SINGLE_IMPLEMENT; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2027-01-16 PM STRENGTH_LOWER 29min: box-squat-bodyweight 2x8 RIR3 BW; kb-deadlift 4x7 RIR3 23kg SINGLE_IMPLEMENT; reverse-lunge 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2027-01-17 PM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; machine-chest-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d4 2027-01-18 PM STRENGTH_FULL_B 33min: kb-deadlift 4x7 RIR3 23kg SINGLE_IMPLEMENT; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G075

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-26","weeks":12,"asOf":"2026-11-24","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-05"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-02-05"},"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x10 0KG BODYWEIGHT","glute-bridge 2x10 0KG BODYWEIGHT","reverse-lunge 4x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5],"strengthDays":[6],"runTurn":"AM","strengthTurn":"AM","runMinutes":69,"strengthMinutes":66,"longRunDay":5,"longRunMinutes":62,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-26 AM RUN EASY 15min (EASY) | d1 2026-11-27 AM RUN WALK 20min (WALK) | d2 2026-11-28 AM RUN EASY 15min (EASY) | d4 2026-11-30 AM RUN EASY 15min (EASY) | d5 2026-12-01 AM RUN WALK 20min (WALK) | d6 2026-12-02 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-03 AM RUN EASY 20min (EASY) | d1 2026-12-04 AM RUN WALK 20min (WALK) | d2 2026-12-05 AM RUN EASY 20min (EASY) | d4 2026-12-07 AM RUN EASY 20min (EASY) | d5 2026-12-08 AM RUN WALK 20min (WALK) | d6 2026-12-09 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 9 (TAPER): d0 2027-01-28 AM RUN EASY 20min (EASY +strides) | d1 2027-01-29 AM RUN EASY 20min (EASY +strides) | d2 2027-01-30 AM RUN EASY 15min (EASY) | d4 2027-02-01 AM RUN EASY 15min (EASY) | d5 2027-02-02 AM RUN EASY 15min (EASY) | d6 STRENGTH REST_BY_DESIGN
- Week 10 (RACE_WEEK): d0 2027-02-04 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d1 2027-02-05  RUN RACE 150min (RACE, completion) | d2 RUN REST_BY_DESIGN | d4 2027-02-08 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 2027-02-09 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G076

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-03","weeks":16,"asOf":"2027-01-01","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":108,"longestRunMinutes":15,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,5,6],"strengthDays":[0,1,3,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":65,"strengthMinutes":57,"longRunDay":1,"longRunMinutes":48,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-03 PM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2027-01-04 AM RUN LONG 15min (LONG) | d1 2027-01-04 PM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2027-01-05 AM RUN EASY 15min (EASY) | d3 2027-01-06 PM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d4 2027-01-07 PM STRENGTH_UPPER_B 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-08 AM RUN EASY 15min (EASY) | d6 2027-01-09 AM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-10 PM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d1 2027-01-11 AM RUN LONG 15min (LONG) | d1 2027-01-11 PM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-01-12 AM RUN EASY 15min (EASY) | d3 2027-01-13 PM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d4 2027-01-14 PM STRENGTH_UPPER_B 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-15 AM RUN EASY 15min (EASY) | d6 2027-01-16 AM RUN EASY 15min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G077

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-23","weeks":8,"asOf":"2026-12-21","tz":60,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BANDS","PULL_UP_BAR","KETTLEBELL","RACK","BARBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":81,"strengthMinutes":43,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G078

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":4,"asOf":"2026-12-08","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["leg-press 4x6 108KG TOTAL","db-rdl 2x10 40KG TOTAL"],"equipment":["BODYWEIGHT","RACK","BANDS","MACHINES","KETTLEBELL","PULL_UP_BAR","DUMBBELLS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":34,"strengthMinutes":28,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-08 PM STRENGTH_LOWER 27min: leg-press 4x6 RIR3 108kg TOTAL; db-rdl 2x10 RIR3 40kg TOTAL; leg-extension-machine 2x10 RIR3 establish | d5 2026-12-13 PM STRENGTH_UPPER 22min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish | d6 2026-12-14 PM STRENGTH_FULL_B 24min: db-rdl 2x10 RIR3 40kg TOTAL; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-12-15 PM STRENGTH_LOWER 28min: leg-press 4x8 RIR3 108kg TOTAL; db-rdl 2x12 RIR3 40kg TOTAL; leg-extension-machine 2x10 RIR3 last logged | d5 2026-12-20 PM STRENGTH_UPPER 27min: db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged | d6 2026-12-21 PM STRENGTH_FULL_B 27min: db-rdl 2x12 RIR3 40kg TOTAL; db-row 3x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation · non-blocking differences: LOAD_CONVENTION_EQUIVALENT

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G079

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":8,"asOf":"2026-12-18","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":3,"runMinutesPerWeek":69,"longestRunMinutes":19,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES","KETTLEBELL","BENCH","PULL_UP_BAR","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":61,"strengthMinutes":43,"longRunDay":0,"longRunMinutes":35,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-21 AM RUN LONG 15min (LONG) | d2 2026-12-23 AM RUN EASY 19min (EASY) | d6 2026-12-27 AM RUN EASY 19min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-28 AM RUN LONG 20min (LONG) | d2 2026-12-30 AM RUN EASY 19min (EASY) | d6 2027-01-03 AM RUN EASY 19min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G080

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-13","weeks":4,"asOf":"2026-11-13","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-04"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2026-12-04"},"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":240,"longestRunMinutes":87,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["back-squat 3x6 53KG TOTAL"],"equipment":["MACHINES","DUMBBELLS","BENCH","KETTLEBELL","PULL_UP_BAR","BODYWEIGHT","RACK","BANDS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5],"strengthDays":[2,3,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":41,"strengthMinutes":37,"longRunDay":0,"longRunMinutes":62,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · SPECIFIC · RACE_WEEK
- Week 0 (BUILD): d0 2026-11-13 PM RUN LONG 62min (LONG) | d1 2026-11-14 PM RUN EASY 40min (EASY) | d2 2026-11-15 PM RUN EASY 40min (EASY) | d2 2026-11-15 AM STRENGTH_LOWER 31min: back-squat 3x6 RIR3 53kg TOTAL; db-rdl 2x5 RIR3 establish; db-split-squat 2x7 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d3 2026-11-16 AM STRENGTH_UPPER 28min: db-bench-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-floor-press 2x7 RIR3 establish; one-arm-db-row 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d4 2026-11-17 PM RUN EASY 40min (EASY) | d4 2026-11-17 AM STRENGTH_LOWER_B 25min: db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x5 RIR3 establish; seated-calf-raise-db 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-11-18 PM RUN EASY 40min (EASY) | d5 2026-11-18 AM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-bench-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW
- Week 1 (SPECIFIC): d0 2026-11-20 PM RUN LONG 62min (LONG) | d1 2026-11-21 PM RUN EASY 40min (EASY) | d2 2026-11-22 PM RUN EASY 40min (EASY) | d2 2026-11-22 AM STRENGTH_LOWER 35min: back-squat 3x6 RIR3 53kg TOTAL; db-rdl 3x5 RIR3 last logged; db-split-squat 2x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d3 2026-11-23 AM STRENGTH_UPPER 34min: db-bench-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-floor-press 2x7 RIR3 last logged; one-arm-db-row 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d4 2026-11-24 PM RUN EASY 40min (EASY) | d4 2026-11-24 AM STRENGTH_LOWER_B 31min: db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 3x5 RIR3 last logged; seated-calf-raise-db 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d5 2026-11-25 PM RUN EASY 40min (EASY) | d5 2026-11-25 AM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-bench-press 3x5 RIR3 last logged; dead-bug 2x9 RIR3 BW
- Week 2 (SPECIFIC): d0 2026-11-27 PM RUN LONG 62min (LONG) | d1 2026-11-28 PM RUN EASY 20min (EASY) | d2 2026-11-29 PM RUN EASY 20min (EASY) | d2 2026-11-29 AM STRENGTH_LOWER 13min: back-squat 1x6 RIR4 53kg TOTAL; db-rdl 1x5 RIR4 last logged | d3 STRENGTH REST_BY_DESIGN | d4 2026-12-01 PM RUN EASY 20min (EASY) | d4 STRENGTH REST_BY_DESIGN | d5 2026-12-02 PM RUN EASY 20min (EASY) | d5 STRENGTH REST_BY_DESIGN
- Week 3 (RACE_WEEK): d0 2026-12-04  RUN RACE 150min (RACE, completion) | d1 RUN REST_BY_DESIGN | d2 2026-12-06 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 2026-12-08 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d4 STRENGTH REST_BY_DESIGN | d5 2026-12-09 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d5 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G081

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":8,"asOf":"2026-12-01","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":30,"longestRunMinutes":80,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5,6],"strengthDays":[0,1,3,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":31,"strengthMinutes":43,"longRunDay":5,"longRunMinutes":148,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-02 PM STRENGTH_LOWER 28min: kb-goblet-squat 2x5 RIR3 establish; kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-12-03 PM STRENGTH_UPPER 28min: push-up 2x5 RIR3 BW; kb-row 2x5 RIR3 establish; incline-push-up 2x7 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-05 PM STRENGTH_LOWER_B 25min: kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-06 PM STRENGTH_UPPER_B 22min: kb-row 2x5 RIR3 establish; push-up 2x5 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-07 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d5 2026-12-07 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-08 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-09 PM STRENGTH_LOWER 34min: kb-goblet-squat 3x5 RIR3 last logged; kb-deadlift 3x5 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-12-10 PM STRENGTH_UPPER 34min: push-up 3x5 RIR3 BW; kb-row 3x5 RIR3 last logged; incline-push-up 2x7 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-12 PM STRENGTH_LOWER_B 31min: kb-deadlift 3x5 RIR3 last logged; reverse-lunge 3x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-13 PM STRENGTH_UPPER_B 28min: kb-row 3x5 RIR3 last logged; push-up 3x5 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-14 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d5 2026-12-14 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-15 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G082

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":12,"asOf":"2026-12-26","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":3,"runMinutesPerWeek":162,"longestRunMinutes":95,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","KETTLEBELL","MACHINES","RACK","BENCH","BARBELL","BANDS","DUMBBELLS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4],"strengthDays":[2,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":89,"strengthMinutes":52,"longRunDay":4,"longRunMinutes":132,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-12-29 AM RUN EASY 45min (EASY) | d2 2026-12-29 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-12-30 AM RUN EASY 45min (EASY) | d3 2026-12-30 PM STRENGTH_FULL_B 30min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; db-biceps-curl 2x8 RIR3 establish | d4 2026-12-31 AM RUN LONG 70min (LONG)
- Week 1 (DEVELOPMENT): d2 2027-01-05 AM RUN EASY 45min (EASY) | d2 2027-01-05 PM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2027-01-06 AM RUN EASY 45min (EASY) | d3 2027-01-06 PM STRENGTH_FULL_B 30min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; db-biceps-curl 2x8 RIR3 last logged | d4 2027-01-07 AM RUN LONG 70min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G083

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-26","weeks":8,"asOf":"2026-11-23","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":100,"longestRunMinutes":36,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":73,"strengthMinutes":27,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-11-28 PM STRENGTH_LOWER 21min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW | d4 2026-11-30 PM STRENGTH_UPPER 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW | d6 2026-12-02 PM STRENGTH_FULL_B 21min: glute-bridge 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2026-12-05 PM STRENGTH_LOWER 21min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW | d4 2026-12-07 PM STRENGTH_UPPER 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW | d6 2026-12-09 PM STRENGTH_FULL_B 21min: glute-bridge 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G084

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-11","weeks":12,"asOf":"2026-12-09","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":324,"longestRunMinutes":106,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[3,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":48,"strengthMinutes":59,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d3 2026-12-14 AM STRENGTH_LOWER 29min: kb-goblet-squat 2x8 RIR3 establish; kb-deadlift 2x8 RIR3 establish; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2026-12-15 AM STRENGTH_UPPER 29min: push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 establish; pike-push-up 2x10 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2026-12-17 AM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d3 2026-12-21 AM STRENGTH_LOWER 34min: kb-goblet-squat 3x8 RIR3 last logged; kb-deadlift 3x8 RIR3 last logged; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2026-12-22 AM STRENGTH_UPPER 34min: push-up 3x8 RIR3 BW; kb-row 3x8 RIR3 last logged; pike-push-up 2x10 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2026-12-24 AM STRENGTH_FULL_B 38min: kb-deadlift 3x8 RIR3 last logged; kb-row 3x8 RIR3 last logged; push-up 3x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G085

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":12,"asOf":"2026-11-28","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":62,"strengthMinutes":70,"longRunDay":0,"longRunMinutes":58,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-30 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-07 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G086

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-01","weeks":8,"asOf":"2026-11-30","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-18"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-01-18"},"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":168,"longestRunMinutes":36,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BANDS","KETTLEBELL","MACHINES","RACK","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4,5],"strengthDays":[0,1,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":56,"strengthMinutes":58,"longRunDay":4,"longRunMinutes":64,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G087

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":4,"asOf":"2026-12-28","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":54,"longestRunMinutes":51,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4],"strengthDays":[3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":34,"strengthMinutes":31,"longRunDay":4,"longRunMinutes":124,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d3 2027-01-01 PM RUN WALK 20min (WALK) | d3 2027-01-01 PM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d4 2027-01-02 PM RUN LONG 50min (LONG) | d4 2027-01-02 PM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d3 2027-01-08 PM RUN WALK 20min (WALK) | d3 2027-01-08 PM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d4 2027-01-09 PM RUN LONG 50min (LONG) | d4 2027-01-09 PM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G088

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":4,"asOf":"2026-11-07","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":168,"longestRunMinutes":18,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[0],"runTurn":"AM","strengthTurn":"AM","runMinutes":37,"strengthMinutes":27,"longRunDay":0,"longRunMinutes":121,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-09 AM RUN LONG 15min (LONG) | d0 2026-11-09 AM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-16 AM RUN LONG 15min (LONG) | d0 2026-11-16 AM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G089

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-11","weeks":16,"asOf":"2026-12-10","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-25"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-03-25"},"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","DUMBBELLS","BARBELL","MACHINES","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[0,1,3,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":52,"strengthMinutes":37,"longRunDay":4,"longRunMinutes":40,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-11 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-11 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2026-12-12 AM RUN WALK 20min (WALK) | d1 2026-12-12 PM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; machine-chest-press 1x10 RIR3 establish; seated-cable-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-12-13 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-14 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; seated-calf-raise-machine 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2026-12-15 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-16 AM RUN WALK 20min (WALK) | d6 2026-12-17 AM RUN WALK 20min (WALK) | d6 2026-12-17 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-18 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-18 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d1 2026-12-19 AM RUN WALK 20min (WALK) | d1 2026-12-19 PM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged; seated-cable-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2026-12-20 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-21 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; seated-calf-raise-machine 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d4 2026-12-22 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-23 AM RUN WALK 20min (WALK) | d6 2026-12-24 AM RUN WALK 20min (WALK) | d6 2026-12-24 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; dead-bug 1x10 RIR3 BW
- Week 13 (TAPER): d0 2027-03-12 AM RUN EASY 20min (EASY) | d0 2027-03-12 PM STRENGTH_LOWER 19min: goblet-squat 1x8 RIR3 last logged; db-rdl 1x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d1 2027-03-13 AM RUN EASY 20min (EASY) | d1 2027-03-13 PM STRENGTH_UPPER 19min: db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged; seated-cable-row 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d2 2027-03-14 AM RUN EASY 20min (EASY) | d3 2027-03-15 PM STRENGTH_LOWER_B 17min: db-rdl 1x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; seated-calf-raise-machine 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2027-03-16 AM RUN WALK 20min (WALK) | d5 2027-03-17 AM RUN WALK 20min (WALK) | d6 2027-03-18 AM RUN WALK 20min (WALK) | d6 2027-03-18 PM STRENGTH_UPPER_B 15min: db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; dead-bug 1x12 RIR3 BW
- Week 14 (RACE_WEEK): d0 2027-03-19 AM RUN EASY 15min (EASY) | d0 2027-03-19 PM STRENGTH_LOWER 14min: goblet-squat 1x8 RIR4 last logged; db-rdl 1x8 RIR4 last logged | d1 2027-03-20 AM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d2 2027-03-21 AM RUN EASY 15min (EASY) | d3 STRENGTH REST_BY_DESIGN | d4 2027-03-23 AM RUN WALK 20min (WALK) | d5 2027-03-24 AM RUN WALK 20min (WALK) | d6 STRENGTH REST_BY_DESIGN | d6 2027-03-25  RUN RACE 150min (RACE, completion)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G090

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-14","weeks":16,"asOf":"2026-11-14","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","RACK","BANDS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[0,1,2,3,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":38,"strengthMinutes":21,"longRunDay":1,"longRunMinutes":100,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-14 AM RUN EASY 15min (EASY) | d0 2026-11-14 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-15 AM RUN WALK 20min (WALK) | d1 2026-11-15 AM STRENGTH_FULL_B 21min: glute-bridge 2x5 RIR3 BW; band-row 2x5 RIR3 BW; incline-push-up 1x5 RIR3 BW | d2 2026-11-16 AM RUN EASY 15min (EASY) | d2 2026-11-16 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-11-17 AM RUN WALK 20min (WALK) | d3 2026-11-17 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-11-18 AM RUN EASY 15min (EASY) | d4 2026-11-18 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-21 AM RUN EASY 20min (EASY) | d0 2026-11-21 AM STRENGTH_FULL_A 21min: box-squat-bodyweight 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; band-row 1x5 RIR3 BW | d1 2026-11-22 AM RUN WALK 20min (WALK) | d1 2026-11-22 AM STRENGTH_FULL_B 21min: glute-bridge 2x5 RIR3 BW; band-row 2x5 RIR3 BW; incline-push-up 1x5 RIR3 BW | d2 2026-11-23 AM RUN EASY 20min (EASY) | d2 2026-11-23 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d3 2026-11-24 AM RUN WALK 20min (WALK) | d3 2026-11-24 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d4 2026-11-25 AM RUN EASY 20min (EASY) | d4 2026-11-25 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G091

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":4,"asOf":"2026-12-05","tz":0,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-25"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2026-12-25"},"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":96,"longestRunMinutes":36,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,6],"strengthDays":[2,3,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":67,"strengthMinutes":42,"longRunDay":1,"longRunMinutes":65,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G092

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":16,"asOf":"2027-01-04","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":60,"longestRunMinutes":73,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x12 0KG BODYWEIGHT"],"equipment":["PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0],"runTurn":"AM","strengthTurn":"AM","runMinutes":55,"strengthMinutes":73,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-06 AM STRENGTH_FULL_A 30min: box-squat-bodyweight 4x12 RIR3 BW; push-up 2x8 RIR3 BW; scapular-pull-up 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-13 AM STRENGTH_FULL_A 30min: box-squat-bodyweight 4x12 RIR3 BW; push-up 2x10 RIR3 BW; scapular-pull-up 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G093

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":12,"asOf":"2026-12-28","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":138,"longestRunMinutes":25,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x5 0KG BODYWEIGHT","glute-bridge 3x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,6],"strengthDays":[0,3,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":74,"strengthMinutes":26,"longRunDay":6,"longRunMinutes":30,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-29 AM STRENGTH_LOWER 22min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 3x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d1 2026-12-30 PM RUN EASY 25min (EASY) | d3 2027-01-01 AM STRENGTH_UPPER 17min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-03 AM STRENGTH_FULL_B 23min: glute-bridge 3x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d6 2027-01-04 PM RUN LONG 25min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-01-05 AM STRENGTH_LOWER 23min: box-squat-bodyweight 2x7 RIR3 BW; glute-bridge 3x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW | d1 2027-01-06 PM RUN EASY 25min (EASY) | d3 2027-01-08 AM STRENGTH_UPPER 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-10 AM STRENGTH_FULL_B 24min: glute-bridge 3x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d6 2027-01-11 PM RUN LONG 30min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G094

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-13","weeks":12,"asOf":"2026-11-13","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":92,"longestRunMinutes":89,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","KETTLEBELL","RACK","PULL_UP_BAR","BARBELL","BANDS","BENCH","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3],"strengthDays":[0,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":50,"strengthMinutes":31,"longRunDay":0,"longRunMinutes":44,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-13 PM RUN LONG 40min (LONG) | d0 2026-11-13 AM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish | d1 2026-11-14 PM RUN EASY 25min (EASY) | d3 2026-11-16 PM RUN EASY 25min (EASY) | d5 2026-11-18 AM STRENGTH_FULL_B 24min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-11-20 PM RUN LONG 40min (LONG) | d0 2026-11-20 AM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-11-21 PM RUN EASY 25min (EASY) | d3 2026-11-23 PM RUN EASY 25min (EASY) | d5 2026-11-25 AM STRENGTH_FULL_B 24min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G095

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":8,"asOf":"2027-01-05","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":180,"longestRunMinutes":78,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x5 0KG BODYWEIGHT","db-rdl 2x5 56KG TOTAL"],"equipment":["BODYWEIGHT","DUMBBELLS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[0,1,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":41,"strengthMinutes":38,"longRunDay":3,"longRunMinutes":105,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-05 AM RUN EASY 25min (EASY) | d0 2027-01-05 PM STRENGTH_LOWER 28min: goblet-squat 2x5 RIR3 establish; db-rdl 2x5 RIR3 56kg TOTAL; reverse-lunge 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2027-01-06 AM RUN EASY 25min (EASY) | d1 2027-01-06 PM STRENGTH_UPPER 28min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; incline-push-up 2x7 RIR3 BW; one-arm-db-row 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2027-01-07 AM RUN EASY 25min (EASY) | d3 2027-01-08 AM RUN LONG 75min (LONG) | d5 2027-01-10 AM RUN EASY 25min (EASY) | d5 2027-01-10 PM STRENGTH_LOWER_B 25min: db-rdl 2x5 RIR3 56kg TOTAL; reverse-lunge 2x5 RIR3 BW; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2027-01-11 PM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-12 AM RUN EASY 25min (EASY) | d0 2027-01-12 PM STRENGTH_LOWER 32min: goblet-squat 3x5 RIR3 last logged; db-rdl 2x5 RIR3 56kg TOTAL; reverse-lunge 2x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d1 2027-01-13 AM RUN EASY 25min (EASY) | d1 2027-01-13 PM STRENGTH_UPPER 35min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; incline-push-up 2x9 RIR3 BW; one-arm-db-row 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d2 2027-01-14 AM RUN EASY 25min (EASY) | d3 2027-01-15 AM RUN LONG 75min (LONG) | d5 2027-01-17 AM RUN EASY 25min (EASY) | d5 2027-01-17 PM STRENGTH_LOWER_B 29min: db-rdl 2x5 RIR3 56kg TOTAL; reverse-lunge 3x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d6 2027-01-18 PM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; dead-bug 2x9 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation · non-blocking differences: LOAD_CONVENTION_EQUIVALENT

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G096

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":8,"asOf":"2026-11-17","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":180,"longestRunMinutes":48,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BODYWEIGHT","MACHINES","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,5,6],"strengthDays":[0,4,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":36,"strengthMinutes":35,"longRunDay":5,"longRunMinutes":34,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-17 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-19 AM RUN EASY 36min (EASY) | d4 2026-11-21 AM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; db-biceps-curl 2x8 RIR3 establish | d5 2026-11-22 AM RUN LONG 34min (LONG) | d5 2026-11-22 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-23 AM RUN EASY 36min (EASY) | d6 2026-11-23 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-24 AM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-11-26 AM RUN EASY 36min (EASY) | d4 2026-11-28 AM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; db-biceps-curl 2x8 RIR3 last logged | d5 2026-11-29 AM RUN LONG 34min (LONG) | d5 2026-11-29 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2026-11-30 AM RUN EASY 36min (EASY) | d6 2026-11-30 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G097

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":16,"asOf":"2026-12-12","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5,6],"strengthDays":[0],"runTurn":"PM","strengthTurn":"AM","runMinutes":77,"strengthMinutes":30,"longRunDay":6,"longRunMinutes":43,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-12 AM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d5 2026-12-17 PM RUN EASY 15min (EASY) | d6 2026-12-18 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-19 AM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d5 2026-12-24 PM RUN EASY 20min (EASY) | d6 2026-12-25 PM RUN EASY 20min (EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G098

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":16,"asOf":"2026-12-12","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BODYWEIGHT","DUMBBELLS","BARBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[4],"runTurn":"PM","strengthTurn":"PM","runMinutes":51,"strengthMinutes":65,"longRunDay":1,"longRunMinutes":76,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-15 PM RUN EASY 15min (EASY) | d1 2026-12-16 PM RUN EASY 15min (EASY) | d2 2026-12-17 PM RUN EASY 15min (EASY) | d4 2026-12-19 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-22 PM RUN EASY 20min (EASY) | d1 2026-12-23 PM RUN EASY 20min (EASY) | d2 2026-12-24 PM RUN EASY 20min (EASY) | d4 2026-12-26 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G099

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":4,"asOf":"2026-12-20","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["RACK","MACHINES","PULL_UP_BAR","DUMBBELLS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,5],"strengthDays":[0,1,2,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":71,"strengthMinutes":27,"longRunDay":0,"longRunMinutes":80,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-20 AM RUN EASY 15min (EASY) | d0 2026-12-20 AM STRENGTH_UPPER 21min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; machine-chest-press 1x12 RIR3 establish | d1 2026-12-21 AM STRENGTH_LOWER 21min: goblet-squat 2x10 RIR3 establish; db-rdl 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish | d2 2026-12-22 AM STRENGTH_LOWER_B 21min: db-rdl 2x10 RIR3 establish; db-split-squat 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW | d3 2026-12-23 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d5 2026-12-25 AM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-27 AM RUN EASY 20min (EASY) | d0 2026-12-27 AM STRENGTH_UPPER 21min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; machine-chest-press 1x12 RIR3 last logged | d1 2026-12-28 AM STRENGTH_LOWER 21min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged | d2 2026-12-29 AM STRENGTH_LOWER_B 21min: db-rdl 2x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW | d3 2026-12-30 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2027-01-01 AM RUN EASY 20min (EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G100

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-27","weeks":8,"asOf":"2026-11-24","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-20"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-01-20"},"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":88,"longestRunMinutes":51,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x6 0KG BODYWEIGHT","hip-thrust-db 5x12 8KG PER_HAND","db-split-squat 3x10 30KG PER_HAND"],"equipment":["BENCH","BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1],"strengthDays":[2,3],"runTurn":"PM","strengthTurn":"PM","runMinutes":82,"strengthMinutes":40,"longRunDay":1,"longRunMinutes":51,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d0 2026-11-27 PM RUN EASY 35min (EASY) | d1 2026-11-28 PM RUN LONG 50min (LONG) | d2 2026-11-29 PM STRENGTH_FULL_A 38min: box-squat-bodyweight 5x6 RIR3 BW; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2026-11-30 PM STRENGTH_FULL_B 38min: hip-thrust-db 5x12 RIR3 8kg PER_HAND; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 3x10 RIR3 30kg PER_HAND
- Week 1 (BUILD): d0 2026-12-04 PM RUN EASY 35min (EASY) | d1 2026-12-05 PM RUN LONG 51min (LONG) | d2 2026-12-06 PM STRENGTH_FULL_A 40min: box-squat-bodyweight 5x8 RIR3 BW; db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged | d3 2026-12-07 PM STRENGTH_FULL_B 36min: hip-thrust-db 5x8 RIR3 10kg PER_HAND; db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged
- Week 6 (TAPER): d0 2027-01-08 PM RUN EASY 35min (EASY +strides) | d1 2027-01-09 PM RUN LONG 35min (LONG) | d2 2027-01-10 PM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x12 RIR3 BW; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d3 2027-01-11 PM STRENGTH_FULL_B 28min: hip-thrust-db 2x12 RIR3 10kg PER_HAND; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; reverse-lunge-db 1x10 RIR3 last logged; db-biceps-curl 1x10 RIR3 last logged
- Week 7 (RACE_WEEK): d0 2027-01-15 PM RUN EASY 25min (EASY) | d1 2027-01-16 PM RUN EASY 25min (EASY) | d2 2027-01-17 PM STRENGTH_FULL_A 16min: box-squat-bodyweight 1x12 RIR4 BW; db-bench-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d3 STRENGTH REST_BY_DESIGN | d5 2027-01-20  RUN RACE 75min (RACE)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G101

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-17","weeks":16,"asOf":"2026-12-15","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":342,"longestRunMinutes":35,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BANDS","KETTLEBELL","BENCH","RACK","BARBELL","DUMBBELLS","PULL_UP_BAR","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,4,5,6],"strengthDays":[0,1,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":75,"strengthMinutes":31,"longRunDay":2,"longRunMinutes":106,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G102

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-03","weeks":12,"asOf":"2026-12-01","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":228,"longestRunMinutes":60,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x6 0KG BODYWEIGHT","glute-bridge 5x8 0KG BODYWEIGHT","reverse-lunge 5x6 0KG BODYWEIGHT"],"equipment":["KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2],"strengthDays":[0,1,2,3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":40,"strengthMinutes":40,"longRunDay":0,"longRunMinutes":125,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-03 PM RUN LONG 60min (LONG) | d0 2026-12-03 PM STRENGTH_LOWER 40min: box-squat-bodyweight 4x6 RIR3 BW; glute-bridge 5x8 RIR3 BW; reverse-lunge 5x6 RIR3 BW; standing-calf-raise 1x10 RIR3 BW | d1 2026-12-04 PM STRENGTH_UPPER 22min: incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 establish; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-05 PM RUN EASY 40min (EASY) | d2 2026-12-05 PM STRENGTH_LOWER_B 36min: glute-bridge 5x8 RIR3 BW; reverse-lunge 5x6 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d3 2026-12-06 PM STRENGTH_UPPER_B 20min: kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-07 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-10 PM RUN LONG 60min (LONG) | d0 2026-12-10 PM STRENGTH_LOWER 32min: box-squat-bodyweight 4x8 RIR3 BW; glute-bridge 5x10 RIR3 BW | d1 2026-12-11 PM STRENGTH_UPPER 22min: incline-push-up 2x10 RIR3 BW; kb-row 2x8 RIR3 last logged; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-12 PM RUN EASY 40min (EASY) | d2 2026-12-12 PM STRENGTH_LOWER_B 38min: glute-bridge 5x10 RIR3 BW; reverse-lunge 5x8 RIR3 BW; bent-knee-calf-raise 1x12 RIR3 BW; tibialis-raise 1x12 RIR3 BW | d3 2026-12-13 PM STRENGTH_UPPER_B 21min: kb-row 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-14 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G103

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":8,"asOf":"2027-01-04","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":177,"longestRunMinutes":82,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[0],"runTurn":"PM","strengthTurn":"AM","runMinutes":50,"strengthMinutes":37,"longRunDay":1,"longRunMinutes":91,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-04 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2027-01-05 PM RUN LONG 75min (LONG) | d3 2027-01-07 PM RUN EASY 50min (EASY) | d5 2027-01-09 PM RUN EASY 50min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-11 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2027-01-12 PM RUN LONG 75min (LONG) | d3 2027-01-14 PM RUN EASY 50min (EASY) | d5 2027-01-16 PM RUN EASY 50min (EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G104

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":4,"asOf":"2026-12-10","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-04"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-01-04"},"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":36,"longestRunMinutes":63,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","RACK","BARBELL","MACHINES","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,5],"strengthDays":[0,2,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":63,"strengthMinutes":23,"longRunDay":0,"longRunMinutes":70,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G105

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-03","weeks":12,"asOf":"2026-12-03","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-17"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-02-17"},"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":111,"longestRunMinutes":43,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x10 32KG SINGLE_IMPLEMENT"],"equipment":["DUMBBELLS","MACHINES","BENCH","BODYWEIGHT","BANDS","KETTLEBELL","BARBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5,6],"strengthDays":[3,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":70,"strengthMinutes":41,"longRunDay":6,"longRunMinutes":89,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d3 2026-12-06 PM STRENGTH_LOWER 30min: kb-goblet-squat 2x10 RIR3 32kg SINGLE_IMPLEMENT; db-rdl 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d4 2026-12-07 PM STRENGTH_FULL_B 31min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d5 2026-12-08 PM STRENGTH_UPPER 29min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2026-12-08 PM RUN EASY 43min (EASY) | d6 2026-12-09 PM RUN LONG 40min (LONG)
- Week 1 (BUILD): d3 2026-12-13 PM STRENGTH_LOWER 33min: kb-goblet-squat 2x12 RIR3 32kg SINGLE_IMPLEMENT; db-rdl 3x8 RIR3 last logged; leg-extension-machine 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d4 2026-12-14 PM STRENGTH_FULL_B 38min: db-rdl 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged | d5 2026-12-15 PM STRENGTH_UPPER 35min: db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d5 2026-12-15 PM RUN EASY 43min (EASY) | d6 2026-12-16 PM RUN LONG 45min (LONG)
- Week 9 (TAPER): d3 2027-02-07 PM STRENGTH_LOWER 21min: kb-goblet-squat 1x8 RIR3 36kg SINGLE_IMPLEMENT; db-rdl 2x8 RIR3 last logged; leg-extension-machine 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x16 RIR3 BW | d4 2027-02-08 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; leg-curl-machine 1x10 RIR3 last logged; cable-triceps-pushdown 1x10 RIR3 last logged | d5 2027-02-09 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-lateral-raise 1x10 RIR3 last logged; db-biceps-curl 1x10 RIR3 last logged; dead-bug 1x16 RIR3 BW | d5 2027-02-09 PM RUN EASY 40min (EASY +strides) | d6 2027-02-10 PM RUN LONG 45min (LONG)
- Week 10 (RACE_WEEK): d3 2027-02-14 PM STRENGTH_LOWER 14min: kb-goblet-squat 1x8 RIR4 36kg SINGLE_IMPLEMENT; db-rdl 1x8 RIR4 last logged | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d5 2027-02-16 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d6 2027-02-17  RUN RACE 75min (RACE)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G106

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-01","weeks":16,"asOf":"2026-12-29","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-04-21"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-04-21"},"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":100,"longestRunMinutes":30,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x6 9KG SINGLE_IMPLEMENT"],"equipment":["RACK","KETTLEBELL","BARBELL","BENCH","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,5,6],"strengthDays":[0,2,3,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":89,"strengthMinutes":22,"longRunDay":5,"longRunMinutes":104,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d0 2027-01-01 PM STRENGTH_LOWER 22min: kb-goblet-squat 2x6 RIR3 9kg SINGLE_IMPLEMENT; kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW | d2 2027-01-03 PM STRENGTH_UPPER 22min: incline-push-up 2x5 RIR3 BW; kb-row 2x5 RIR3 establish; band-row 2x7 RIR3 BW | d3 2027-01-04 PM STRENGTH_LOWER_B 22min: kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x5 RIR3 BW; bent-knee-calf-raise 2x7 RIR3 BW | d4 2027-01-05 PM RUN EASY 30min (EASY) | d5 2027-01-06 PM RUN LONG 30min (LONG) | d6 2027-01-07 PM STRENGTH_UPPER_B 22min: kb-row 2x5 RIR3 establish; incline-push-up 2x5 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2027-01-07 PM RUN EASY 30min (EASY)
- Week 1 (BUILD): d0 2027-01-08 PM STRENGTH_LOWER 22min: kb-goblet-squat 2x6 RIR3 9kg SINGLE_IMPLEMENT; kb-deadlift 3x5 RIR3 last logged | d2 2027-01-10 PM STRENGTH_UPPER 22min: incline-push-up 3x7 RIR3 BW; kb-row 2x5 RIR3 last logged | d3 2027-01-11 PM STRENGTH_LOWER_B 22min: kb-deadlift 3x5 RIR3 last logged; reverse-lunge 2x9 RIR3 BW | d4 2027-01-12 PM RUN EASY 30min (EASY) | d5 2027-01-13 PM RUN LONG 35min (LONG) | d6 2027-01-14 PM STRENGTH_UPPER_B 22min: kb-row 3x5 RIR3 last logged; incline-push-up 2x7 RIR3 BW | d6 2027-01-14 PM RUN EASY 30min (EASY)
- Week 14 (TAPER): d0 2027-04-09 PM STRENGTH_LOWER 18min: kb-goblet-squat 1x6 RIR3 17kg SINGLE_IMPLEMENT; kb-deadlift 2x5 RIR3 last logged; reverse-lunge 1x10 RIR3 BW | d2 2027-04-11 PM STRENGTH_UPPER 21min: incline-push-up 2x10 RIR3 BW; kb-row 2x5 RIR3 last logged; band-row 1x7 RIR3 BW | d3 2027-04-12 PM STRENGTH_LOWER_B 21min: kb-deadlift 2x5 RIR3 last logged; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x9 RIR3 BW | d4 2027-04-13 PM RUN EASY 30min (EASY +strides) | d5 2027-04-14 PM RUN LONG 40min (LONG) | d6 2027-04-15 PM STRENGTH_UPPER_B 13min: kb-row 1x5 RIR4 last logged; incline-push-up 1x10 RIR4 BW | d6 2027-04-15 PM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2')
- Week 15 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 2027-04-20 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d5 2027-04-21  RUN RACE 75min (RACE) | d6 STRENGTH REST_BY_DESIGN | d6 RUN REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G107

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":8,"asOf":"2026-12-13","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","MACHINES","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[5],"runTurn":"AM","strengthTurn":"PM","runMinutes":28,"strengthMinutes":28,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d5 2026-12-18 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d5 2026-12-25 PM STRENGTH_FULL_A 24min: leg-press 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G108

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":8,"asOf":"2026-12-18","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":60,"longestRunMinutes":142,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3],"strengthDays":[3,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":82,"strengthMinutes":66,"longRunDay":3,"longRunMinutes":35,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-12-22 AM RUN EASY 25min (EASY) | d3 2026-12-23 AM RUN LONG 35min (LONG) | d3 2026-12-23 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d6 2026-12-26 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2026-12-29 AM RUN EASY 25min (EASY) | d3 2026-12-30 AM RUN LONG 35min (LONG) | d3 2026-12-30 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-02 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G109

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-07","weeks":8,"asOf":"2027-01-06","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","MACHINES","RACK","BODYWEIGHT","PULL_UP_BAR","KETTLEBELL","BENCH","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":63,"strengthMinutes":68,"longRunDay":0,"longRunMinutes":71,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-07 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-08 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2027-01-10 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2027-01-14 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-15 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-17 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G110

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-13","weeks":12,"asOf":"2026-11-10","tz":0,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":46,"longestRunMinutes":28,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4,5],"strengthDays":[0,1,2,3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":79,"strengthMinutes":40,"longRunDay":0,"longRunMinutes":48,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G111

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-16","weeks":16,"asOf":"2026-12-14","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BARBELL","RACK","PULL_UP_BAR","BENCH","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,5,6],"strengthDays":[0,2,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":61,"strengthMinutes":69,"longRunDay":5,"longRunMinutes":120,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G112

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-01","weeks":16,"asOf":"2026-12-01","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-18"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-03-18"},"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":171,"longestRunMinutes":60,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[3,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":32,"strengthMinutes":21,"longRunDay":4,"longRunMinutes":96,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d1 2026-12-02 PM RUN EASY 20min (EASY) | d2 2026-12-03 PM RUN EASY 20min (EASY) | d3 2026-12-04 PM RUN EASY 20min (EASY) | d3 2026-12-04 PM STRENGTH_FULL_A 21min: box-squat-bodyweight 2x6 RIR3 BW; push-up 2x8 RIR3 BW; kb-row 1x8 RIR3 establish | d4 2026-12-05 PM RUN LONG 60min (LONG) | d5 2026-12-06 PM RUN EASY 20min (EASY) | d6 2026-12-07 PM RUN EASY 20min (EASY) | d6 2026-12-07 PM STRENGTH_FULL_B 21min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; push-up 1x8 RIR3 BW
- Week 1 (BUILD): d1 2026-12-09 PM RUN EASY 20min (EASY) | d2 2026-12-10 PM RUN EASY 20min (EASY) | d3 2026-12-11 PM RUN EASY 20min (EASY) | d3 2026-12-11 PM STRENGTH_FULL_A 21min: box-squat-bodyweight 2x6 RIR3 BW; push-up 2x10 RIR3 BW; kb-row 1x8 RIR3 last logged | d4 2026-12-12 PM RUN LONG 65min (LONG) | d5 2026-12-13 PM RUN EASY 20min (EASY) | d6 2026-12-14 PM RUN EASY 20min (EASY) | d6 2026-12-14 PM STRENGTH_FULL_B 21min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; push-up 1x10 RIR3 BW
- Week 14 (TAPER): d1 2027-03-10 PM RUN EASY 20min (EASY +strides) | d2 2027-03-11 PM RUN EASY 20min (EASY +strides) | d3 2027-03-12 PM RUN EASY 15min (EASY) | d3 2027-03-12 PM STRENGTH_FULL_A 16min: box-squat-bodyweight 1x6 RIR4 BW; push-up 1x12 RIR4 BW; kb-row 1x8 RIR4 last logged | d4 2027-03-13 PM RUN EASY 15min (EASY) | d5 2027-03-14 PM RUN EASY 15min (EASY) | d6 2027-03-15 PM RUN EASY 15min (EASY) | d6 STRENGTH REST_BY_DESIGN
- Week 15 (RACE_WEEK): d1 2027-03-17 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d2 2027-03-18  RUN RACE 150min (RACE) | d3 RUN REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 2027-03-20 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 2027-03-21 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 2027-03-22 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G113

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":12,"asOf":"2026-12-19","tz":330,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-05"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-03-05"},"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":250,"longestRunMinutes":49,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,6],"strengthDays":[4],"runTurn":"AM","strengthTurn":"PM","runMinutes":40,"strengthMinutes":73,"longRunDay":1,"longRunMinutes":116,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G114

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":4,"asOf":"2026-12-26","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":184,"longestRunMinutes":55,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,2,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":65,"strengthMinutes":35,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-26 AM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2026-12-28 AM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-31 AM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d6 2027-01-01 AM STRENGTH_UPPER_B 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-02 AM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2027-01-04 AM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-07 AM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d6 2027-01-08 AM STRENGTH_UPPER_B 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G115

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-25","weeks":4,"asOf":"2026-11-22","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-13"}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2026-12-13"},"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":58,"longestRunMinutes":25,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x10 0KG BODYWEIGHT","glute-bridge 5x6 0KG BODYWEIGHT","reverse-lunge 2x12 0KG BODYWEIGHT"],"equipment":["BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3],"strengthDays":[2,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":44,"strengthMinutes":39,"longRunDay":3,"longRunMinutes":136,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d2 2026-11-27 PM RUN EASY 25min (EASY) | d2 2026-11-27 AM STRENGTH_FULL_A 29min: box-squat-bodyweight 4x10 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-28 PM RUN LONG 25min (LONG) | d4 2026-11-29 AM STRENGTH_FULL_B 33min: glute-bridge 5x6 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (SPECIFIC): d2 2026-12-04 PM RUN EASY 25min (EASY) | d2 2026-12-04 AM STRENGTH_FULL_A 25min: box-squat-bodyweight 3x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-05 PM RUN LONG 30min (LONG) | d4 2026-12-06 AM STRENGTH_FULL_B 26min: glute-bridge 4x6 RIR3 BW; incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (SPECIFIC): d2 2026-12-04 PM RUN EASY 25min (EASY) | d2 2026-12-04 AM STRENGTH_FULL_A 25min: box-squat-bodyweight 3x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-05 PM RUN LONG 30min (LONG) | d4 2026-12-06 AM STRENGTH_FULL_B 26min: glute-bridge 4x6 RIR3 BW; incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 2 (RACE_WEEK): d2 2026-12-11 PM RUN EASY 15min (EASY) | d2 STRENGTH REST_BY_DESIGN | d3 2026-12-12 PM RUN SHAKEOUT 15min (SHAKEOUT) | d4 STRENGTH REST_BY_DESIGN | d4 2026-12-13  RUN RACE 75min (RACE)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G116

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":8,"asOf":"2026-12-27","tz":0,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":204,"longestRunMinutes":89,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","KETTLEBELL","BARBELL","RACK","BENCH","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[3,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":61,"strengthMinutes":42,"sameTurnConfirmed":true}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G117

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-24","weeks":16,"asOf":"2026-11-23","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":37,"longestRunMinutes":54,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x12 16KG SINGLE_IMPLEMENT","glute-bridge 3x5 0KG BODYWEIGHT"],"equipment":["KETTLEBELL"],"pause":{"nonclinical":true,"weeks":10,"reasonCategory":"TRAVEL"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,5,6],"strengthDays":[0],"runTurn":"PM","strengthTurn":"PM","runMinutes":88,"strengthMinutes":25,"longRunDay":6,"longRunMinutes":96,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-24 PM STRENGTH_FULL_A 24min: kb-goblet-squat 2x10 RIR3 establish; incline-push-up 2x10 RIR3 BW; kb-row 2x10 RIR3 establish | d0 2026-11-24 PM RUN EASY 15min (EASY) | d2 2026-11-26 PM RUN EASY 15min (EASY) | d5 2026-11-29 PM RUN EASY 15min (EASY) | d6 2026-11-30 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-01 PM STRENGTH_FULL_A 24min: kb-goblet-squat 2x10 RIR3 last logged; incline-push-up 2x10 RIR3 BW; kb-row 2x10 RIR3 last logged | d0 2026-12-01 PM RUN EASY 20min (EASY) | d2 2026-12-03 PM RUN EASY 20min (EASY) | d5 2026-12-06 PM RUN EASY 20min (EASY) | d6 2026-12-07 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G118

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-08","weeks":4,"asOf":"2027-01-05","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-03"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-02-03"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":108,"longestRunMinutes":67,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["back-squat 4x10 42KG TOTAL"],"equipment":["BARBELL","RACK","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,6],"strengthDays":[0,2,4,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":59,"strengthMinutes":69,"longRunDay":6,"longRunMinutes":32,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · SPECIFIC · RACE_WEEK
- Week 0 (BUILD): d0 2027-01-08 PM STRENGTH_LOWER 35min: back-squat 4x10 RIR3 42kg TOTAL; glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2027-01-10 AM RUN EASY 59min (EASY) | d2 2027-01-10 PM STRENGTH_UPPER 21min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2027-01-12 PM STRENGTH_LOWER_B 26min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2027-01-13 PM STRENGTH_UPPER_B 21min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2027-01-14 AM RUN LONG 32min (LONG)
- Week 1 (SPECIFIC): d0 2027-01-15 PM STRENGTH_LOWER 36min: back-squat 3x12 RIR3 42kg TOTAL; glute-bridge 3x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d2 2027-01-17 AM RUN EASY 59min (EASY) | d2 2027-01-17 PM STRENGTH_UPPER 24min: incline-push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d4 2027-01-19 PM STRENGTH_LOWER_B 33min: glute-bridge 3x10 RIR3 BW; reverse-lunge 3x12 RIR3 BW; bent-knee-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d5 2027-01-20 PM STRENGTH_UPPER_B 24min: incline-push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d6 2027-01-21 AM RUN LONG 32min (LONG)
- Week 2 (SPECIFIC): d0 2027-01-22 PM STRENGTH_LOWER 36min: back-squat 3x12 RIR3 42kg TOTAL; glute-bridge 3x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d2 2027-01-24 AM RUN EASY 59min (EASY +strides) | d2 2027-01-24 PM STRENGTH_UPPER 24min: incline-push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d4 2027-01-26 PM STRENGTH_LOWER_B 33min: glute-bridge 3x10 RIR3 BW; reverse-lunge 3x12 RIR3 BW; bent-knee-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d5 2027-01-27 PM STRENGTH_UPPER_B 24min: incline-push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d6 2027-01-28 AM RUN EASY 30min (EASY)
- Week 3 (RACE_WEEK): d0 2027-01-29 PM STRENGTH_LOWER 14min: back-squat 1x12 RIR4 42kg TOTAL; glute-bridge 1x10 RIR4 BW | d2 2027-01-31 AM RUN EASY 30min (EASY) | d2 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d5 2027-02-03  RUN RACE 75min (RACE) | d6 RUN REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G119

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":8,"asOf":"2026-12-03","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-18"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-01-18"},"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":115,"longestRunMinutes":23,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","RACK","BODYWEIGHT","MACHINES","DUMBBELLS","BENCH","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,5],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":75,"strengthMinutes":72,"longRunDay":5,"longRunMinutes":89,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d2 2026-12-08 AM RUN EASY 23min (EASY) | d5 2026-12-11 AM RUN LONG 20min (LONG)
- Week 1 (SPECIFIC): d2 2026-12-15 AM RUN EASY 23min (EASY) | d5 2026-12-18 AM RUN LONG 25min (LONG)
- Week 5 (TAPER): d2 2027-01-12 AM RUN EASY 15min (EASY) | d5 2027-01-15 AM RUN EASY 15min (EASY)
- Week 6 (RACE_WEEK): d1 2027-01-18  RUN RACE 150min (RACE, completion) | d2 RUN REST_BY_DESIGN | d5 2027-01-22 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G120

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":4,"asOf":"2026-12-30","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":275,"longestRunMinutes":83,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["goblet-squat 3x6 29KG PER_HAND"],"equipment":["BANDS","BODYWEIGHT","MACHINES","DUMBBELLS","PULL_UP_BAR","KETTLEBELL","BARBELL","RACK","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3],"strengthDays":[1,2,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":73,"strengthMinutes":65,"longRunDay":3,"longRunMinutes":139,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-02 AM RUN EASY 73min (EASY) | d1 2027-01-03 AM RUN EASY 73min (EASY) | d1 2027-01-03 PM STRENGTH_LOWER 31min: goblet-squat 3x6 RIR3 29kg PER_HAND; kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2027-01-04 PM STRENGTH_UPPER 28min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; machine-chest-press 2x7 RIR3 establish; one-arm-db-row 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d3 2027-01-05 AM RUN LONG 80min (LONG) | d4 2027-01-06 PM STRENGTH_LOWER_B 25min: kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x5 RIR3 BW; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2027-01-07 PM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2027-01-08 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-09 AM RUN EASY 73min (EASY) | d1 2027-01-10 AM RUN EASY 73min (EASY) | d1 2027-01-10 PM STRENGTH_LOWER 35min: goblet-squat 3x6 RIR3 29kg PER_HAND; kb-deadlift 3x5 RIR3 last logged; reverse-lunge 2x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d2 2027-01-11 PM STRENGTH_UPPER 34min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; machine-chest-press 2x7 RIR3 last logged; one-arm-db-row 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d3 2027-01-12 AM RUN LONG 80min (LONG) | d4 2027-01-13 PM STRENGTH_LOWER_B 32min: kb-deadlift 3x5 RIR3 last logged; reverse-lunge 3x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d5 2027-01-14 PM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; dead-bug 2x9 RIR3 BW | d6 2027-01-15 PM STRENGTH_CORE 19min: dead-bug 2x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; front-plank 2x9 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G121

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":16,"asOf":"2026-11-28","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":150,"longestRunMinutes":83,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x5 0KG BODYWEIGHT","db-rdl 4x8 26KG PER_HAND"],"equipment":["BODYWEIGHT","KETTLEBELL","BENCH","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,6],"strengthDays":[4],"runTurn":"AM","strengthTurn":"PM","runMinutes":59,"strengthMinutes":72,"longRunDay":0,"longRunMinutes":138,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-30 AM RUN LONG 80min (LONG) | d4 2026-12-04 PM STRENGTH_FULL_A 27min: box-squat-bodyweight 2x5 RIR3 BW; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-06 AM RUN EASY 59min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-07 AM RUN LONG 80min (LONG) | d4 2026-12-11 PM STRENGTH_FULL_A 27min: box-squat-bodyweight 2x5 RIR3 BW; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-13 AM RUN EASY 59min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G122

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":4,"asOf":"2026-11-20","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":44,"longestRunMinutes":27,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[2,3],"runTurn":"PM","strengthTurn":"PM","runMinutes":26,"strengthMinutes":47,"longRunDay":1,"longRunMinutes":138,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G123

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-22","weeks":8,"asOf":"2026-12-21","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":160,"longestRunMinutes":57,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["kb-goblet-squat 4x10 15KG SINGLE_IMPLEMENT","glute-bridge 4x12 0KG BODYWEIGHT","reverse-lunge 4x12 0KG BODYWEIGHT"],"equipment":["KETTLEBELL"],"pause":{"nonclinical":true,"weeks":3,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,2,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":85,"strengthMinutes":71,"longRunDay":0,"longRunMinutes":112,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-22 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 establish; incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d0 2026-12-22 AM RUN LONG 55min (LONG) | d1 2026-12-23 AM RUN EASY 20min (EASY) | d2 2026-12-24 AM STRENGTH_LOWER 42min: kb-goblet-squat 4x10 RIR3 15kg SINGLE_IMPLEMENT; glute-bridge 4x12 RIR3 BW; reverse-lunge 4x12 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2026-12-24 AM RUN EASY 20min (EASY) | d3 2026-12-25 AM STRENGTH_LOWER_B 34min: glute-bridge 4x12 RIR3 BW; reverse-lunge 4x12 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d3 2026-12-25 AM RUN EASY 20min (EASY) | d4 2026-12-26 AM RUN EASY 20min (EASY) | d5 2026-12-27 AM RUN EASY 20min (EASY) | d6 2026-12-28 AM STRENGTH_UPPER_B 20min: kb-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-29 AM STRENGTH_UPPER 24min: push-up 2x10 RIR3 BW; kb-row 2x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-12-29 AM RUN LONG 60min (LONG) | d1 2026-12-30 AM RUN EASY 20min (EASY) | d2 2026-12-31 AM STRENGTH_LOWER 38min: kb-goblet-squat 4x6 RIR3 17kg SINGLE_IMPLEMENT; glute-bridge 4x6 RIR3 BW; reverse-lunge 4x6 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; side-lying-hip-abduction 1x12 RIR3 BW | d2 2026-12-31 AM RUN EASY 20min (EASY) | d3 2027-01-01 AM STRENGTH_LOWER_B 31min: glute-bridge 4x6 RIR3 BW; reverse-lunge 4x6 RIR3 BW; bent-knee-calf-raise 1x12 RIR3 BW; tibialis-raise 1x12 RIR3 BW | d3 2027-01-01 AM RUN EASY 20min (EASY) | d4 2027-01-02 AM RUN EASY 20min (EASY) | d5 2027-01-03 AM RUN EASY 20min (EASY) | d6 2027-01-04 AM STRENGTH_UPPER_B 21min: kb-row 2x8 RIR3 last logged; push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G124

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":12,"asOf":"2026-12-02","tz":-180,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-10"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-02-10"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":220,"longestRunMinutes":33,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x12 0KG BODYWEIGHT","glute-bridge 2x8 0KG BODYWEIGHT","reverse-lunge 2x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,5],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":33,"strengthMinutes":54,"longRunDay":5,"longRunMinutes":84,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G125

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":12,"asOf":"2026-12-15","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":20,"longestRunMinutes":86,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 2x5 52KG TOTAL","glute-bridge 3x5 0KG BODYWEIGHT","reverse-lunge 5x5 0KG BODYWEIGHT"],"equipment":["MACHINES","BARBELL","BANDS","KETTLEBELL","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,5],"strengthDays":[2,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":84,"strengthMinutes":73,"longRunDay":1,"longRunMinutes":101,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-15 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-16 AM RUN WALK 20min (WALK) | d2 2026-12-17 PM STRENGTH_FULL_A 27min: leg-press 2x5 RIR3 52kg TOTAL; machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-18 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-19 PM STRENGTH_FULL_B 36min: glute-bridge 3x5 RIR3 BW; seated-cable-row 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; reverse-lunge 5x5 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-20 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-22 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-23 AM RUN WALK 20min (WALK) | d2 2026-12-24 PM STRENGTH_FULL_A 27min: leg-press 2x5 RIR3 52kg TOTAL; machine-chest-press 2x10 RIR3 last logged; seated-cable-row 2x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-25 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-26 PM STRENGTH_FULL_B 36min: glute-bridge 3x5 RIR3 BW; seated-cable-row 2x10 RIR3 last logged; machine-chest-press 2x10 RIR3 last logged; reverse-lunge 5x5 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-27 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G126

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":8,"asOf":"2026-12-06","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x12 0KG BODYWEIGHT","glute-bridge 3x6 0KG BODYWEIGHT"],"equipment":["PULL_UP_BAR","BANDS","MACHINES","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,6],"strengthDays":[2,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":46,"strengthMinutes":54,"longRunDay":6,"longRunMinutes":147,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-08 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-09 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-09 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-12 PM STRENGTH_FULL_B 30min: glute-bridge 3x6 RIR3 BW; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-13 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d1 2026-12-15 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-16 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-16 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-19 PM STRENGTH_FULL_B 30min: glute-bridge 3x6 RIR3 BW; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-20 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G127

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-25","weeks":12,"asOf":"2026-11-22","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-13"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-02-13"},"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BODYWEIGHT","DUMBBELLS","PULL_UP_BAR","BARBELL","RACK","MACHINES","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,6],"strengthDays":[0,3,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":41,"strengthMinutes":30,"longRunDay":6,"longRunMinutes":90,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-25 PM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish | d3 2026-11-28 PM STRENGTH_UPPER 20min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 1x10 RIR3 BW | d4 2026-11-29 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-01 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-01 PM STRENGTH_FULL_B 24min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW
- Week 1 (BUILD): d0 2026-12-02 PM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged | d3 2026-12-05 PM STRENGTH_UPPER 20min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW | d4 2026-12-06 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-08 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-08 PM STRENGTH_FULL_B 24min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; push-up 2x8 RIR3 BW
- Week 10 (TAPER): d0 2027-02-03 PM STRENGTH_LOWER 15min: goblet-squat 1x8 RIR3 last logged; db-rdl 1x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged | d3 2027-02-06 PM STRENGTH_UPPER 16min: push-up 1x14 RIR3 BW; db-row 1x8 RIR3 last logged; incline-push-up 1x14 RIR3 BW | d4 2027-02-07 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d6 2027-02-09 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d6 2027-02-09 PM STRENGTH_FULL_B 16min: db-rdl 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged; push-up 1x14 RIR4 BW
- Week 11 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d3 2027-02-13  RUN RACE 75min (RACE, completion) | d4 RUN REST_BY_DESIGN | d6 2027-02-16 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G128

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-25","weeks":16,"asOf":"2026-11-23","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":86,"longestRunMinutes":23,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[1,2,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":30,"strengthMinutes":37,"longRunDay":2,"longRunMinutes":58,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-26 PM RUN EASY 15min (EASY) | d1 2026-11-26 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-27 PM RUN LONG 20min (LONG) | d2 2026-11-27 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-28 PM RUN WALK 20min (WALK) | d4 2026-11-29 PM RUN EASY 15min (EASY) | d5 2026-11-30 PM RUN EASY 15min (EASY) | d5 2026-11-30 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-01 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d1 2026-12-03 PM RUN EASY 15min (EASY) | d1 2026-12-03 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-04 PM RUN LONG 20min (LONG) | d2 2026-12-04 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-05 PM RUN WALK 20min (WALK) | d4 2026-12-06 PM RUN EASY 15min (EASY) | d5 2026-12-07 PM RUN EASY 15min (EASY) | d5 2026-12-07 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-12-08 PM RUN EASY 15min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G129

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":8,"asOf":"2026-12-01","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x6 0KG BODYWEIGHT"],"equipment":["RACK","MACHINES","BARBELL","BODYWEIGHT","BANDS","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":59,"strengthMinutes":59,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d3 2026-12-05 PM STRENGTH_FULL_A 35min: box-squat-bodyweight 5x6 RIR3 BW; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-07 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d3 2026-12-12 PM STRENGTH_FULL_A 36min: box-squat-bodyweight 5x8 RIR3 BW; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d5 2026-12-14 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G130

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":12,"asOf":"2026-11-30","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-10"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-02-10"},"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS","BENCH","BARBELL","DUMBBELLS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":28,"strengthMinutes":21,"longRunDay":5,"longRunMinutes":83,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G131

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":16,"asOf":"2026-11-11","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-20"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-02-20"},"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":240,"longestRunMinutes":50,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x6 0KG BODYWEIGHT","glute-bridge 4x5 0KG BODYWEIGHT"],"equipment":["BANDS","DUMBBELLS","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[2,3,4,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":74,"strengthMinutes":55,"longRunDay":0,"longRunMinutes":139,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-11-11 PM RUN LONG 50min (LONG) | d1 2026-11-12 PM RUN EASY 35min (EASY) | d2 2026-11-13 PM STRENGTH_UPPER 24min: incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-floor-press 1x10 RIR3 establish; db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-11-13 PM RUN EASY 35min (EASY) | d3 2026-11-14 PM STRENGTH_LOWER 28min: goblet-squat 2x8 RIR3 establish; glute-bridge 4x5 RIR3 BW; reverse-lunge 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; side-lying-hip-abduction 1x10 RIR3 BW | d3 2026-11-14 PM RUN EASY 35min (EASY) | d4 2026-11-15 PM STRENGTH_LOWER_B 26min: glute-bridge 4x5 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d4 2026-11-15 PM RUN EASY 35min (EASY) | d5 2026-11-16 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d5 2026-11-16 PM RUN EASY 35min (EASY) | d6 2026-11-17 PM STRENGTH_UPPER_B 20min: band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-11-18 PM RUN LONG 55min (LONG) | d1 2026-11-19 PM RUN EASY 35min (EASY) | d2 2026-11-20 PM STRENGTH_UPPER 24min: incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW; db-floor-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d2 2026-11-20 PM RUN EASY 35min (EASY) | d3 2026-11-21 PM STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 last logged; glute-bridge 4x7 RIR3 BW; reverse-lunge 1x12 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; side-lying-hip-abduction 1x12 RIR3 BW | d3 2026-11-21 PM RUN EASY 35min (EASY) | d4 2026-11-22 PM STRENGTH_LOWER_B 28min: glute-bridge 4x7 RIR3 BW; reverse-lunge 2x12 RIR3 BW; bent-knee-calf-raise 1x12 RIR3 BW; tibialis-raise 1x12 RIR3 BW | d4 2026-11-22 PM RUN EASY 35min (EASY) | d5 2026-11-23 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; front-plank 1x12 RIR3 BW | d5 2026-11-23 PM RUN EASY 35min (EASY) | d6 2026-11-24 PM STRENGTH_UPPER_B 21min: band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 13 (TAPER): d0 2027-02-10 PM RUN LONG 65min (LONG) | d1 2027-02-11 PM RUN EASY 30min (EASY +strides) | d2 2027-02-12 PM STRENGTH_UPPER 19min: incline-push-up 1x14 RIR3 BW; band-row 1x10 RIR3 BW; db-floor-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d2 2027-02-12 PM RUN QUALITY 37min (HALF_MARATHON_SPECIFIC 2x10'/2') | d3 2027-02-13 PM STRENGTH_LOWER 22min: goblet-squat 1x8 RIR3 last logged; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x14 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; side-lying-hip-abduction 1x14 RIR3 BW | d3 2027-02-13 PM RUN EASY 30min (EASY +strides) | d4 2027-02-14 PM STRENGTH_LOWER_B 14min: glute-bridge 1x8 RIR4 BW; reverse-lunge 1x14 RIR4 BW | d4 2027-02-14 PM RUN EASY 20min (EASY) | d5 STRENGTH REST_BY_DESIGN | d5 2027-02-15 PM RUN EASY 20min (EASY) | d6 STRENGTH REST_BY_DESIGN
- Week 14 (RACE_WEEK): d0 2027-02-17 PM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d1 2027-02-18 PM RUN EASY 20min (EASY) | d2 STRENGTH REST_BY_DESIGN | d2 2027-02-19 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d3 STRENGTH REST_BY_DESIGN | d3 2027-02-20  RUN RACE 150min (RACE) | d4 STRENGTH REST_BY_DESIGN | d4 RUN REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d5 2027-02-22 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G132

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":8,"asOf":"2026-12-04","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x5 0KG BODYWEIGHT","kb-deadlift 4x12 13KG SINGLE_IMPLEMENT"],"equipment":["RACK","MACHINES","BARBELL","KETTLEBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3],"strengthDays":[0,1,2,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":79,"strengthMinutes":58,"longRunDay":1,"longRunMinutes":83,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-07 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-07 PM STRENGTH_LOWER 40min: box-squat-bodyweight 4x5 RIR3 BW; kb-deadlift 4x12 RIR3 13kg SINGLE_IMPLEMENT; leg-extension-machine 2x10 RIR3 establish; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-08 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-08 PM STRENGTH_UPPER 29min: machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish; band-biceps-curl 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-09 PM STRENGTH_LOWER_B 32min: kb-deadlift 4x12 RIR3 13kg SINGLE_IMPLEMENT; reverse-lunge 2x8 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 establish; leg-curl-machine 2x10 RIR3 establish | d3 2026-12-10 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-12 PM STRENGTH_UPPER_B 22min: seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; dead-bug 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-14 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-14 PM STRENGTH_LOWER 40min: box-squat-bodyweight 4x5 RIR3 BW; kb-deadlift 4x12 RIR3 13kg SINGLE_IMPLEMENT; leg-extension-machine 2x10 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2026-12-15 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-15 PM STRENGTH_UPPER 34min: machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged; band-biceps-curl 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-16 PM STRENGTH_LOWER_B 34min: kb-deadlift 4x12 RIR3 13kg SINGLE_IMPLEMENT; reverse-lunge 3x8 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged | d3 2026-12-17 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-19 PM STRENGTH_UPPER_B 27min: seated-cable-row 3x8 RIR3 last logged; machine-chest-press 3x8 RIR3 last logged; dead-bug 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G133

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":16,"asOf":"2026-12-29","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":140,"longestRunMinutes":106,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[0,1,3,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":41,"strengthMinutes":39,"longRunDay":0,"longRunMinutes":118,"sameTurnConfirmed":true}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G134

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":16,"asOf":"2026-12-03","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":3,"runMinutesPerWeek":174,"longestRunMinutes":63,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x6 0KG BODYWEIGHT","barbell-rdl 4x6 33KG TOTAL","reverse-lunge 2x5 0KG BODYWEIGHT"],"equipment":["KETTLEBELL","MACHINES","BODYWEIGHT","DUMBBELLS","BARBELL","PULL_UP_BAR","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":33,"strengthMinutes":69,"longRunDay":1,"longRunMinutes":35,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-12-07 AM RUN LONG 35min (LONG)
- Week 1 (DEVELOPMENT): d1 2026-12-14 AM RUN LONG 35min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G135

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":8,"asOf":"2026-11-17","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":204,"longestRunMinutes":122,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","KETTLEBELL","BARBELL","MACHINES","BODYWEIGHT","PULL_UP_BAR","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":27,"strengthMinutes":62,"longRunDay":5,"longRunMinutes":144,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2026-11-22 AM RUN EASY 27min (EASY) | d3 2026-11-23 AM RUN EASY 27min (EASY) | d5 2026-11-25 AM RUN LONG 65min (LONG) | d6 2026-11-26 AM RUN EASY 27min (EASY)
- Week 1 (DEVELOPMENT): d2 2026-11-29 AM RUN EASY 27min (EASY) | d3 2026-11-30 AM RUN EASY 27min (EASY) | d5 2026-12-02 AM RUN LONG 65min (LONG) | d6 2026-12-03 AM RUN EASY 27min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G136

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":4,"asOf":"2026-12-20","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-04"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-01-04"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":118,"longestRunMinutes":24,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["back-squat 4x8 39KG TOTAL","barbell-rdl 4x5 93KG TOTAL"],"equipment":["BENCH","RACK","BARBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[2,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":31,"strengthMinutes":30,"longRunDay":3,"longRunMinutes":61,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Genuine run/strength arrangement trade-off with equal worst-case joint harm; a temporary preference is needed · missing `["schedule.temporaryPreference"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G137

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":16,"asOf":"2026-11-17","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BODYWEIGHT","RACK","KETTLEBELL","BENCH","PULL_UP_BAR","DUMBBELLS","BARBELL","MACHINES"],"pause":{"nonclinical":true,"weeks":7,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,6],"strengthDays":[0,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":20,"strengthMinutes":60,"longRunDay":2,"longRunMinutes":106,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-17 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-18 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-19 PM RUN WALK 20min (WALK) | d3 2026-11-20 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-11-21 PM RUN WALK 20min (WALK) | d5 2026-11-22 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-11-23 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-11-24 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-25 PM RUN WALK_JOG 20min (WALK_JOG 4x(30s jog/120s walk)) | d2 2026-11-26 PM RUN WALK 20min (WALK) | d3 2026-11-27 PM RUN WALK_JOG 20min (WALK_JOG 4x(30s jog/120s walk)) | d4 2026-11-28 PM RUN WALK 20min (WALK) | d5 2026-11-29 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-11-30 PM RUN WALK_JOG 20min (WALK_JOG 4x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G138

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":16,"asOf":"2027-01-06","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x10 0KG BODYWEIGHT","glute-bridge 4x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,5],"strengthDays":[1,2,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":76,"strengthMinutes":38,"longRunDay":0,"longRunMinutes":54,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-06 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-07 AM RUN WALK 20min (WALK) | d1 2027-01-07 PM STRENGTH_LOWER 30min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2027-01-08 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2027-01-08 PM STRENGTH_UPPER 21min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2027-01-09 PM STRENGTH_FULL_B 29min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2027-01-11 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2027-01-13 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-14 AM RUN WALK 20min (WALK) | d1 2027-01-14 PM STRENGTH_LOWER 32min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 3x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2027-01-15 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2027-01-15 PM STRENGTH_UPPER 23min: incline-push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2027-01-16 PM STRENGTH_FULL_B 34min: glute-bridge 3x8 RIR3 BW; incline-push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2027-01-18 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G139

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":4,"asOf":"2026-11-09","tz":-180,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["back-squat 5x10 30KG TOTAL"],"equipment":["BARBELL","BANDS","DUMBBELLS","RACK","BENCH","MACHINES","KETTLEBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":63,"strengthMinutes":41,"longRunDay":6,"longRunMinutes":44,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G140

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":8,"asOf":"2026-11-21","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-10"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-01-10"},"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":195,"longestRunMinutes":71,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","RACK","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,5,6],"strengthDays":[3],"runTurn":"PM","strengthTurn":"PM","runMinutes":53,"strengthMinutes":29,"longRunDay":2,"longRunMinutes":121,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d2 2026-11-24 PM RUN LONG 70min (LONG) | d3 2026-11-25 PM RUN EASY 40min (EASY) | d3 2026-11-25 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d5 2026-11-27 PM RUN EASY 40min (EASY) | d6 2026-11-28 PM RUN EASY 40min (EASY)
- Week 1 (BUILD): d2 2026-12-01 PM RUN LONG 70min (LONG) | d3 2026-12-02 PM STRENGTH_FULL_A 24min: leg-press 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish | d3 2026-12-02 PM RUN EASY 40min (EASY) | d5 2026-12-04 PM RUN EASY 40min (EASY) | d6 2026-12-05 PM RUN EASY 40min (EASY)
- Week 6 (TAPER): d2 2027-01-05 PM RUN EASY 25min (EASY) | d3 2027-01-06 PM STRENGTH_FULL_A 16min: leg-press 1x8 RIR4 last logged; incline-push-up 1x10 RIR4 BW; seated-cable-row 1x8 RIR4 last logged | d3 2027-01-06 PM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d5 2027-01-08 PM RUN EASY 25min (EASY) | d6 2027-01-09 PM RUN SHAKEOUT 15min (SHAKEOUT +strides)
- Week 7 (RACE_WEEK): d0 2027-01-10  RUN RACE 150min (RACE) | d2 2027-01-12 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 STRENGTH REST_BY_DESIGN | d3 2027-01-13 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 2027-01-15 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 2027-01-16 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G141

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":16,"asOf":"2026-12-18","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-30"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-03-30"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":116,"longestRunMinutes":138,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","PULL_UP_BAR","RACK","BODYWEIGHT","DUMBBELLS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[0,3,5],"strengthDays":[6],"runTurn":"AM","strengthTurn":"AM","runMinutes":30,"strengthMinutes":43,"longRunDay":5,"longRunMinutes":143,"sameTurnConfirmed":false}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: SPECIAL_POPULATION_OUTSIDE_V1

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G142

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":4,"asOf":"2027-01-04","tz":330,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4,5],"strengthDays":[0,1,2,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":72,"strengthMinutes":73,"longRunDay":3,"longRunMinutes":145,"sameTurnConfirmed":true}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G143

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":4,"asOf":"2026-12-31","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":102,"longestRunMinutes":65,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["leg-press 4x6 83KG TOTAL","barbell-rdl 5x12 68KG TOTAL","db-step-up 4x5 24KG PER_HAND"],"equipment":["MACHINES","DUMBBELLS","BENCH","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[0,4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":24,"strengthMinutes":69,"longRunDay":3,"longRunMinutes":107,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G144

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":8,"asOf":"2026-11-15","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-30"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2026-12-30"},"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":220,"longestRunMinutes":87,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x12 0KG BODYWEIGHT","glute-bridge 3x6 0KG BODYWEIGHT","reverse-lunge 3x5 0KG BODYWEIGHT"],"equipment":["RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4],"strengthDays":[3],"runTurn":"AM","strengthTurn":"PM","runMinutes":54,"strengthMinutes":54,"longRunDay":3,"longRunMinutes":70,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-11-15 AM RUN EASY 50min (EASY) | d1 2026-11-16 AM RUN EASY 50min (EASY) | d3 2026-11-18 AM RUN LONG 70min (LONG) | d3 2026-11-18 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x12 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-11-19 AM RUN EASY 50min (EASY)
- Week 1 (SPECIFIC): d0 2026-11-22 AM RUN EASY 50min (EASY) | d1 2026-11-23 AM RUN EASY 50min (EASY) | d3 2026-11-25 AM RUN LONG 70min (LONG) | d3 2026-11-25 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x6 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-26 AM RUN EASY 50min (EASY)
- Week 5 (TAPER): d0 2026-12-20 AM RUN EASY 35min (EASY +strides) | d1 2026-12-21 AM RUN EASY 35min (EASY +strides) | d3 2026-12-23 AM RUN LONG 45min (LONG) | d3 2026-12-23 PM STRENGTH_FULL_A 19min: box-squat-bodyweight 1x6 RIR3 BW; incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-24 AM RUN EASY 25min (EASY)
- Week 6 (RACE_WEEK): d0 2026-12-27 AM RUN EASY 25min (EASY) | d1 2026-12-28 AM RUN EASY 25min (EASY) | d3 STRENGTH REST_BY_DESIGN | d3 2026-12-30  RUN RACE 150min (RACE, completion) | d4 RUN REST_BY_DESIGN

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G145

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-23","weeks":4,"asOf":"2026-12-23","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":60,"longestRunMinutes":66,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x8 0KG BODYWEIGHT"],"equipment":["MACHINES","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":58,"strengthMinutes":38,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-12-25 AM STRENGTH_LOWER 25min: kb-goblet-squat 2x10 RIR3 establish; kb-deadlift 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-26 AM STRENGTH_UPPER 25min: machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; incline-push-up 1x12 RIR3 BW; kb-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2026-12-27 AM STRENGTH_LOWER_B 23min: kb-deadlift 2x10 RIR3 establish; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-29 AM STRENGTH_UPPER_B 21min: seated-cable-row 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2027-01-01 AM STRENGTH_LOWER 25min: kb-goblet-squat 2x10 RIR3 last logged; kb-deadlift 2x10 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-02 AM STRENGTH_UPPER 25min: machine-chest-press 2x10 RIR3 last logged; seated-cable-row 2x10 RIR3 last logged; incline-push-up 1x12 RIR3 BW; kb-row 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2027-01-03 AM STRENGTH_LOWER_B 23min: kb-deadlift 2x10 RIR3 last logged; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-05 AM STRENGTH_UPPER_B 21min: seated-cable-row 2x10 RIR3 last logged; machine-chest-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G146

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":16,"asOf":"2026-11-09","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["kb-goblet-squat 3x8 16KG SINGLE_IMPLEMENT"],"equipment":["BODYWEIGHT","KETTLEBELL","DUMBBELLS","PULL_UP_BAR","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,5],"strengthDays":[1,2,3,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":26,"strengthMinutes":51,"longRunDay":3,"longRunMinutes":37,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G147

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":8,"asOf":"2026-11-18","tz":60,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":270,"longestRunMinutes":41,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","RACK","BODYWEIGHT","DUMBBELLS","PULL_UP_BAR","BANDS","KETTLEBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[2,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":73,"strengthMinutes":24,"longRunDay":5,"longRunMinutes":95,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G148

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":4,"asOf":"2026-12-05","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","BARBELL","DUMBBELLS","RACK","BENCH"],"pause":{"nonclinical":true,"weeks":7,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,6],"strengthDays":[0,1,2],"runTurn":"PM","strengthTurn":"AM","runMinutes":32,"strengthMinutes":48,"longRunDay":2,"longRunMinutes":64,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-07 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-08 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-08 AM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-09 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-09 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-13 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-14 AM STRENGTH_FULL_A 31min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2026-12-15 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-15 AM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-16 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-16 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d6 2026-12-20 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G149

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":12,"asOf":"2026-11-08","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":44,"longestRunMinutes":60,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["leg-press 4x8 115KG TOTAL","glute-bridge 4x8 0KG BODYWEIGHT"],"equipment":["BARBELL","MACHINES","PULL_UP_BAR"],"pause":{"nonclinical":true,"weeks":10,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":82,"strengthMinutes":25,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-09 AM STRENGTH_LOWER 20min: leg-press 2x8 RIR3 establish; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d1 2026-11-10 AM STRENGTH_UPPER 20min: machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; push-up 1x10 RIR3 BW | d4 2026-11-13 AM STRENGTH_LOWER_B 20min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW | d5 2026-11-14 AM STRENGTH_UPPER_B 20min: seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-11-15 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-16 AM STRENGTH_LOWER 20min: leg-press 2x8 RIR3 last logged; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d1 2026-11-17 AM STRENGTH_UPPER 20min: machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; push-up 1x10 RIR3 BW | d4 2026-11-20 AM STRENGTH_LOWER_B 21min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW | d5 2026-11-21 AM STRENGTH_UPPER_B 20min: seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-11-22 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G150

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":16,"asOf":"2027-01-01","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":240,"longestRunMinutes":41,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x12 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":53,"strengthMinutes":41,"longRunDay":1,"longRunMinutes":65,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G151

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":16,"asOf":"2026-12-03","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x8 0KG BODYWEIGHT","glute-bridge 2x12 0KG BODYWEIGHT","reverse-lunge 4x12 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,4,5],"strengthDays":[1,2,3,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":64,"strengthMinutes":54,"longRunDay":0,"longRunMinutes":107,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-04 AM RUN EASY 15min (EASY) | d1 2026-12-05 PM STRENGTH_LOWER 34min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x12 RIR3 BW; reverse-lunge 4x12 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-06 PM STRENGTH_UPPER 23min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-07 AM RUN EASY 15min (EASY) | d3 2026-12-07 PM STRENGTH_LOWER_B 34min: glute-bridge 2x12 RIR3 BW; reverse-lunge 4x12 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-08 AM RUN WALK 20min (WALK) | d5 2026-12-09 AM RUN EASY 15min (EASY) | d5 2026-12-09 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d6 2026-12-10 PM STRENGTH_UPPER_B 20min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-11 AM RUN EASY 20min (EASY) | d1 2026-12-12 PM STRENGTH_LOWER 37min: box-squat-bodyweight 3x5 RIR3 BW; glute-bridge 2x12 RIR3 BW; reverse-lunge 4x12 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-13 PM STRENGTH_UPPER 26min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-14 AM RUN EASY 20min (EASY) | d3 2026-12-14 PM STRENGTH_LOWER_B 34min: glute-bridge 2x12 RIR3 BW; reverse-lunge 4x12 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-15 AM RUN WALK 20min (WALK) | d5 2026-12-16 AM RUN EASY 20min (EASY) | d5 2026-12-16 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d6 2026-12-17 PM STRENGTH_UPPER_B 23min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G152

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-26","weeks":16,"asOf":"2026-11-25","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-13"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2027-03-13"},"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BARBELL","DUMBBELLS","BODYWEIGHT","BENCH","PULL_UP_BAR","RACK","MACHINES","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5,6],"strengthDays":[0,1,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":23,"strengthMinutes":66,"longRunDay":4,"longRunMinutes":52,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G153

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":16,"asOf":"2026-12-26","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":276,"longestRunMinutes":69,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,1,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":50,"strengthMinutes":29,"longRunDay":5,"longRunMinutes":112,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-29 PM RUN EASY 40min (EASY) | d0 2026-12-29 AM STRENGTH_LOWER 22min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW | d1 2026-12-30 PM RUN EASY 40min (EASY) | d1 2026-12-30 AM STRENGTH_UPPER 21min: push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; pike-push-up 2x10 RIR3 BW | d2 2026-12-31 PM RUN EASY 40min (EASY) | d3 2027-01-01 PM RUN EASY 40min (EASY) | d4 2027-01-02 PM RUN EASY 40min (EASY) | d4 2027-01-02 AM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 2x10 RIR3 BW | d5 2027-01-03 PM RUN LONG 65min (LONG) | d6 2027-01-04 AM STRENGTH_UPPER_B 21min: push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-05 PM RUN EASY 40min (EASY) | d0 2027-01-05 AM STRENGTH_LOWER 27min: box-squat-bodyweight 3x8 RIR3 BW; glute-bridge 3x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW | d1 2027-01-06 PM RUN EASY 40min (EASY) | d1 2027-01-06 AM STRENGTH_UPPER 23min: push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; pike-push-up 2x10 RIR3 BW | d2 2027-01-07 PM RUN EASY 40min (EASY) | d3 2027-01-08 PM RUN EASY 40min (EASY) | d4 2027-01-09 PM RUN EASY 40min (EASY) | d4 2027-01-09 AM STRENGTH_LOWER_B 28min: glute-bridge 3x8 RIR3 BW; reverse-lunge 3x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW | d5 2027-01-10 PM RUN LONG 65min (LONG) | d6 2027-01-11 AM STRENGTH_UPPER_B 23min: push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G154

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":8,"asOf":"2027-01-02","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":52,"longestRunMinutes":132,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BARBELL","DUMBBELLS","KETTLEBELL","BODYWEIGHT","RACK","PULL_UP_BAR","MACHINES","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4],"strengthDays":[4],"runTurn":"PM","strengthTurn":"AM","runMinutes":32,"strengthMinutes":64,"longRunDay":3,"longRunMinutes":95,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d3 2027-01-08 PM RUN LONG 50min (LONG) | d4 2027-01-09 PM RUN WALK 20min (WALK) | d4 2027-01-09 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d3 2027-01-15 PM RUN LONG 50min (LONG) | d4 2027-01-16 PM RUN WALK 20min (WALK) | d4 2027-01-16 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G155

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":4,"asOf":"2026-12-04","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":55,"longestRunMinutes":97,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x6 18KG SINGLE_IMPLEMENT","kb-deadlift 3x8 12KG SINGLE_IMPLEMENT"],"equipment":["RACK","PULL_UP_BAR","BENCH","KETTLEBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[0,1,2,4,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":23,"strengthMinutes":47,"longRunDay":3,"longRunMinutes":52,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-06 AM RUN EASY 15min (EASY) | d0 2026-12-06 PM STRENGTH_LOWER 32min: kb-goblet-squat 2x6 RIR3 18kg SINGLE_IMPLEMENT; kb-deadlift 3x8 RIR3 12kg SINGLE_IMPLEMENT; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2026-12-07 AM RUN EASY 15min (EASY) | d1 2026-12-07 PM STRENGTH_UPPER 29min: push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 establish; pike-push-up 2x10 RIR3 BW; band-biceps-curl 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-08 AM RUN WALK 20min (WALK) | d2 2026-12-08 PM STRENGTH_UPPER_B 22min: kb-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; band-biceps-curl 2x10 RIR3 BW | d3 2026-12-09 AM RUN LONG 20min (LONG) | d4 2026-12-10 PM STRENGTH_LOWER_B 28min: kb-deadlift 3x8 RIR3 12kg SINGLE_IMPLEMENT; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2026-12-11 AM RUN WALK 20min (WALK) | d5 2026-12-11 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-13 AM RUN EASY 15min (EASY) | d0 2026-12-13 PM STRENGTH_LOWER 33min: kb-goblet-squat 2x8 RIR3 18kg SINGLE_IMPLEMENT; kb-deadlift 3x10 RIR3 12kg SINGLE_IMPLEMENT; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d1 2026-12-14 AM RUN EASY 15min (EASY) | d1 2026-12-14 PM STRENGTH_UPPER 36min: push-up 3x10 RIR3 BW; kb-row 3x8 RIR3 last logged; pike-push-up 2x12 RIR3 BW; band-biceps-curl 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d2 2026-12-15 AM RUN WALK 20min (WALK) | d2 2026-12-15 PM STRENGTH_UPPER_B 28min: kb-row 3x8 RIR3 last logged; push-up 3x10 RIR3 BW; band-biceps-curl 2x12 RIR3 BW | d3 2026-12-16 AM RUN LONG 20min (LONG) | d4 2026-12-17 PM STRENGTH_LOWER_B 33min: kb-deadlift 3x10 RIR3 12kg SINGLE_IMPLEMENT; reverse-lunge 3x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d5 2026-12-18 AM RUN WALK 20min (WALK) | d5 2026-12-18 PM STRENGTH_CORE 20min: dead-bug 2x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; front-plank 2x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G156

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-10","weeks":16,"asOf":"2026-12-09","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","BODYWEIGHT","KETTLEBELL","DUMBBELLS","BANDS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":15,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":66,"strengthMinutes":62,"sameTurnConfirmed":true}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: POPULATION_OUTSIDE_V1_AGE_RANGE

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G157

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":16,"asOf":"2026-12-29","tz":-180,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":6,"runMinutesPerWeek":318,"longestRunMinutes":54,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x12 0KG BODYWEIGHT","kb-deadlift 2x6 31KG SINGLE_IMPLEMENT","db-step-up 4x12 30KG PER_HAND"],"equipment":["RACK","BODYWEIGHT","KETTLEBELL","BENCH","DUMBBELLS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3,5],"strengthDays":[2,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":58,"strengthMinutes":63,"longRunDay":0,"longRunMinutes":56,"sameTurnConfirmed":true}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G158

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":4,"asOf":"2026-12-01","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-22"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2026-12-22"},"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":125,"longestRunMinutes":66,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,5,6],"strengthDays":[0,1,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":21,"strengthMinutes":66,"longRunDay":3,"longRunMinutes":149,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-02 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-03 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-04 AM RUN EASY 15min (EASY) | d3 2026-12-05 AM RUN LONG 45min (LONG) | d4 2026-12-06 AM RUN EASY 15min (EASY) | d5 2026-12-07 AM RUN EASY 15min (EASY) | d6 2026-12-08 AM RUN EASY 15min (EASY) | d6 2026-12-08 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2026-12-09 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-10 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-11 AM RUN EASY 15min (EASY) | d3 2026-12-12 AM RUN LONG 45min (LONG) | d4 2026-12-13 AM RUN EASY 15min (EASY) | d5 2026-12-14 AM RUN EASY 15min (EASY) | d6 2026-12-15 AM RUN EASY 15min (EASY) | d6 2026-12-15 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-09 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-10 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-11 AM RUN EASY 15min (EASY) | d3 2026-12-12 AM RUN LONG 45min (LONG) | d4 2026-12-13 AM RUN EASY 15min (EASY) | d5 2026-12-14 AM RUN EASY 15min (EASY) | d6 2026-12-15 AM RUN EASY 15min (EASY) | d6 2026-12-15 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW
- Week 2 (RACE_WEEK): d0 2026-12-16 PM STRENGTH_LOWER 14min: box-squat-bodyweight 1x10 RIR4 BW; glute-bridge 1x10 RIR4 BW | d1 STRENGTH REST_BY_DESIGN | d2 2026-12-18 AM RUN EASY 15min (EASY) | d3 2026-12-19 AM RUN EASY 15min (EASY) | d4 2026-12-20 AM RUN EASY 15min (EASY) | d5 2026-12-21 AM RUN SHAKEOUT 15min (SHAKEOUT) | d6 STRENGTH REST_BY_DESIGN | d6 2026-12-22  RUN RACE 150min (RACE, completion)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G159

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-08","weeks":4,"asOf":"2027-01-06","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-24"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-01-24"},"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":128,"longestRunMinutes":55,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","DUMBBELLS","BENCH","KETTLEBELL","BODYWEIGHT","PULL_UP_BAR","MACHINES","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[2,3,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":68,"strengthMinutes":57,"longRunDay":2,"longRunMinutes":150,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G160

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-30","weeks":16,"asOf":"2026-12-28","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-13"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2027-04-13"},"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5,6],"strengthDays":[0,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":41,"strengthMinutes":32,"longRunDay":3,"longRunMinutes":111,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-30 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-30 PM STRENGTH_FULL_A 32min: box-squat-bodyweight 5x8 RIR3 BW; push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW | d1 2026-12-31 AM RUN WALK 20min (WALK) | d3 2027-01-02 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2027-01-03 AM RUN WALK 20min (WALK) | d4 2027-01-03 PM STRENGTH_FULL_B 22min: glute-bridge 2x5 RIR3 BW; push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW | d5 2027-01-04 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2027-01-05 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2027-01-06 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2027-01-06 PM STRENGTH_FULL_A 31min: box-squat-bodyweight 5x8 RIR3 BW; push-up 3x5 RIR3 BW | d1 2027-01-07 AM RUN WALK 20min (WALK) | d3 2027-01-09 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-10 AM RUN WALK 20min (WALK) | d4 2027-01-10 PM STRENGTH_FULL_B 28min: glute-bridge 3x5 RIR3 BW; push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW | d5 2027-01-11 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-12 AM RUN WALK 20min (WALK)
- Week 13 (TAPER): d0 2027-03-31 AM RUN EASY 20min (EASY) | d0 2027-03-31 PM STRENGTH_FULL_A 22min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d1 2027-04-01 AM RUN EASY 20min (EASY) | d3 2027-04-03 AM RUN EASY 20min (EASY) | d4 2027-04-04 AM RUN WALK 20min (WALK) | d4 2027-04-04 PM STRENGTH_FULL_B 22min: glute-bridge 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d5 2027-04-05 AM RUN WALK 20min (WALK) | d6 2027-04-06 AM RUN WALK 20min (WALK)
- Week 14 (RACE_WEEK): d0 2027-04-07 AM RUN EASY 15min (EASY) | d0 2027-04-07 PM STRENGTH_FULL_A 14min: box-squat-bodyweight 1x8 RIR4 BW; push-up 1x10 RIR4 BW | d1 2027-04-08 AM RUN EASY 15min (EASY) | d3 2027-04-10 AM RUN EASY 15min (EASY) | d4 2027-04-11 AM RUN WALK 20min (WALK) | d4 STRENGTH REST_BY_DESIGN | d5 2027-04-12 AM RUN WALK 20min (WALK) | d6 2027-04-13  RUN RACE 150min (RACE, completion)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G161

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":8,"asOf":"2026-12-29","tz":0,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1],"runTurn":"AM","strengthTurn":"AM","runMinutes":47,"strengthMinutes":49,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G162

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":12,"asOf":"2026-12-01","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-20"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2027-02-20"},"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":6,"runMinutesPerWeek":306,"longestRunMinutes":78,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x6 0KG BODYWEIGHT"],"equipment":["RACK","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":17,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[2,3,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":62,"strengthMinutes":62,"longRunDay":1,"longRunMinutes":89,"sameTurnConfirmed":true}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: POPULATION_OUTSIDE_V1_AGE_RANGE

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G163

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":16,"asOf":"2026-12-26","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":222,"longestRunMinutes":47,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["kb-goblet-squat 3x5 20KG SINGLE_IMPLEMENT","hip-thrust-db 2x6 46KG TOTAL"],"equipment":["MACHINES","KETTLEBELL","BENCH","PULL_UP_BAR","BANDS","RACK","BARBELL","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[4,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":22,"strengthMinutes":75,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d4 2027-01-01 AM STRENGTH_LOWER 31min: kb-goblet-squat 3x5 RIR3 20kg SINGLE_IMPLEMENT; hip-thrust-db 2x6 RIR3 46kg TOTAL; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2027-01-02 AM STRENGTH_UPPER 29min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d6 2027-01-03 AM STRENGTH_FULL_B 31min: hip-thrust-db 2x6 RIR3 46kg TOTAL; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d4 2027-01-08 AM STRENGTH_LOWER 32min: kb-goblet-squat 3x7 RIR3 20kg SINGLE_IMPLEMENT; hip-thrust-db 2x8 RIR3 46kg TOTAL; leg-extension-machine 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d5 2027-01-09 AM STRENGTH_UPPER 35min: db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d6 2027-01-10 AM STRENGTH_FULL_B 36min: hip-thrust-db 2x8 RIR3 46kg TOTAL; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G164

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":12,"asOf":"2026-12-28","tz":60,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":220,"longestRunMinutes":42,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x10 0KG BODYWEIGHT","glute-bridge 5x6 0KG BODYWEIGHT"],"equipment":["RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4],"strengthDays":[0,1,2,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":79,"strengthMinutes":70,"longRunDay":4,"longRunMinutes":138,"sameTurnConfirmed":true}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G165

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":16,"asOf":"2026-12-25","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":132,"longestRunMinutes":29,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["back-squat 5x8 77KG TOTAL","barbell-rdl 3x6 103KG TOTAL","reverse-lunge 5x8 0KG BODYWEIGHT"],"equipment":["BANDS","RACK","BODYWEIGHT","PULL_UP_BAR","DUMBBELLS","BARBELL","MACHINES","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":65,"strengthMinutes":36,"longRunDay":5,"longRunMinutes":52,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-28 PM RUN EASY 20min (EASY) | d1 2026-12-29 PM RUN EASY 20min (EASY) | d2 2026-12-30 PM RUN EASY 20min (EASY) | d3 2026-12-31 PM RUN EASY 20min (EASY) | d5 2027-01-02 PM RUN LONG 25min (LONG) | d6 2027-01-03 PM RUN EASY 20min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-04 PM RUN EASY 20min (EASY) | d1 2027-01-05 PM RUN EASY 20min (EASY) | d2 2027-01-06 PM RUN EASY 20min (EASY) | d3 2027-01-07 PM RUN EASY 20min (EASY) | d5 2027-01-09 PM RUN LONG 30min (LONG) | d6 2027-01-10 PM RUN EASY 20min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G166

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-01","weeks":8,"asOf":"2026-12-29","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":215,"longestRunMinutes":23,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","RACK","BODYWEIGHT","BENCH","PULL_UP_BAR","DUMBBELLS","BARBELL","BANDS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5],"strengthDays":[5],"runTurn":"PM","strengthTurn":"AM","runMinutes":50,"strengthMinutes":39,"longRunDay":5,"longRunMinutes":33,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d5 2027-01-06 PM RUN LONG 20min (LONG) | d5 2027-01-06 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d5 2027-01-13 PM RUN LONG 20min (LONG) | d5 2027-01-13 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G167

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-29","weeks":8,"asOf":"2026-11-26","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":155,"longestRunMinutes":138,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["leg-press 4x6 31KG TOTAL","barbell-rdl 3x12 54KG TOTAL"],"equipment":["BODYWEIGHT","MACHINES","BARBELL","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5],"strengthDays":[0,1],"runTurn":"PM","strengthTurn":"AM","runMinutes":76,"strengthMinutes":38,"longRunDay":1,"longRunMinutes":35,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-29 AM STRENGTH_FULL_B 33min: barbell-rdl 3x6 RIR3 54kg TOTAL; seated-cable-row 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-11-30 PM RUN LONG 35min (LONG) | d1 2026-11-30 AM STRENGTH_FULL_A 36min: leg-press 4x6 RIR3 31kg TOTAL; machine-chest-press 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-01 PM RUN EASY 30min (EASY) | d3 2026-12-02 PM RUN EASY 30min (EASY) | d4 2026-12-03 PM RUN EASY 30min (EASY) | d5 2026-12-04 PM RUN EASY 30min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-06 AM STRENGTH_FULL_B 36min: barbell-rdl 3x6 RIR3 54kg TOTAL; seated-cable-row 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; reverse-lunge 2x9 RIR3 BW | d1 2026-12-07 PM RUN LONG 35min (LONG) | d1 2026-12-07 AM STRENGTH_FULL_A 36min: leg-press 4x6 RIR3 31kg TOTAL; machine-chest-press 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged | d2 2026-12-08 PM RUN EASY 30min (EASY) | d3 2026-12-09 PM RUN EASY 30min (EASY) | d4 2026-12-10 PM RUN EASY 30min (EASY) | d5 2026-12-11 PM RUN EASY 30min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G168

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":8,"asOf":"2026-12-24","tz":0,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":174,"longestRunMinutes":39,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 5x8 58KG TOTAL"],"equipment":["BARBELL","MACHINES","DUMBBELLS","PULL_UP_BAR","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,5],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":80,"strengthMinutes":63,"longRunDay":1,"longRunMinutes":142,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G169

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-26","weeks":4,"asOf":"2026-11-25","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":38,"longestRunMinutes":23,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","RACK","BARBELL","KETTLEBELL","PULL_UP_BAR","DUMBBELLS","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,3,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":51,"strengthMinutes":35,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-26 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-27 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-29 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-11-30 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-01 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-03 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2026-12-04 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-06 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; side-lying-hip-abduction 1x10 RIR3 BW | d4 2026-12-07 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; tibialis-raise 1x10 RIR3 BW | d5 2026-12-08 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G170

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":12,"asOf":"2026-12-02","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BODYWEIGHT","DUMBBELLS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[1,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":85,"strengthMinutes":28,"longRunDay":0,"longRunMinutes":120,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-04 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-05 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d3 2026-12-07 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-11 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-12 AM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged | d3 2026-12-14 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G171

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":12,"asOf":"2026-11-18","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"MARATHON","date":"2027-02-02"}},"strength":"HYPERTROPHY"},"event":{"kind":"MARATHON","date":"2027-02-02"},"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","PULL_UP_BAR","MACHINES","BANDS","RACK","KETTLEBELL","BARBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[0,1,3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":63,"strengthMinutes":46,"longRunDay":1,"longRunMinutes":36,"sameTurnConfirmed":true}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: EVENT_DISTANCE_OUTSIDE_V1

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G172

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":4,"asOf":"2026-12-09","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-04"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-01-04"},"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":198,"longestRunMinutes":66,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","PULL_UP_BAR","KETTLEBELL","BARBELL","BANDS","DUMBBELLS","BENCH","BODYWEIGHT","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":76,"strengthMinutes":27,"longRunDay":3,"longRunMinutes":139,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-12 AM RUN EASY 25min (EASY) | d1 2026-12-13 AM RUN EASY 25min (EASY) | d2 2026-12-14 AM RUN EASY 25min (EASY) | d3 2026-12-15 AM RUN LONG 65min (LONG) | d3 2026-12-15 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d4 2026-12-16 AM RUN EASY 25min (EASY) | d5 2026-12-17 AM RUN EASY 25min (EASY) | d5 2026-12-17 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish
- Week 1 (BUILD): d0 2026-12-19 AM RUN EASY 25min (EASY) | d1 2026-12-20 AM RUN EASY 25min (EASY) | d2 2026-12-21 AM RUN EASY 25min (EASY) | d3 2026-12-22 AM RUN LONG 65min (LONG) | d3 2026-12-22 PM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d4 2026-12-23 AM RUN EASY 25min (EASY) | d5 2026-12-24 AM RUN EASY 25min (EASY) | d5 2026-12-24 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged
- Week 2 (SPECIFIC): d0 2026-12-26 AM RUN EASY 25min (EASY) | d1 2026-12-27 AM RUN EASY 25min (EASY) | d2 2026-12-28 AM RUN EASY 25min (EASY) | d3 2026-12-29 AM RUN EASY 15min (EASY) | d3 2026-12-29 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d4 2026-12-30 AM RUN EASY 15min (EASY) | d5 2026-12-31 AM RUN EASY 15min (EASY) | d5 STRENGTH REST_BY_DESIGN
- Week 3 (RACE_WEEK): d0 2027-01-02 AM RUN EASY 15min (EASY) | d1 2027-01-03 AM RUN SHAKEOUT 15min (SHAKEOUT) | d2 2027-01-04  RUN RACE 150min (RACE, completion) | d3 RUN REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-06 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 2027-01-07 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G173

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-27","weeks":4,"asOf":"2026-11-27","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x5 31KG SINGLE_IMPLEMENT"],"equipment":["KETTLEBELL","BARBELL","MACHINES","RACK","DUMBBELLS","BENCH","PULL_UP_BAR","BODYWEIGHT","BANDS"],"pause":{"nonclinical":true,"weeks":3,"reasonCategory":"TRAVEL"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3],"strengthDays":[6],"runTurn":"AM","strengthTurn":"PM","runMinutes":81,"strengthMinutes":36,"longRunDay":2,"longRunMinutes":50,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G174

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-03","weeks":8,"asOf":"2027-01-01","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-26"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-02-26"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":118,"longestRunMinutes":66,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BANDS","BODYWEIGHT","RACK","KETTLEBELL","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,5,6],"strengthDays":[0,1,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":88,"strengthMinutes":66,"longRunDay":0,"longRunMinutes":34,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2027-01-03 AM STRENGTH_UPPER 29min: machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish; band-biceps-curl 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d0 2027-01-03 AM RUN LONG 34min (LONG) | d1 2027-01-04 AM STRENGTH_LOWER 29min: kb-goblet-squat 2x8 RIR3 establish; kb-deadlift 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2027-01-04 AM RUN EASY 25min (EASY) | d4 2027-01-07 AM STRENGTH_LOWER_B 26min: kb-deadlift 2x8 RIR3 establish; reverse-lunge 2x8 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 establish; leg-curl-machine 2x10 RIR3 establish | d5 2027-01-08 AM RUN EASY 25min (EASY) | d6 2027-01-09 AM STRENGTH_UPPER_B 22min: seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; dead-bug 2x10 RIR3 BW | d6 2027-01-09 AM RUN EASY 25min (EASY)
- Week 1 (BUILD): d0 2027-01-10 AM STRENGTH_UPPER 34min: machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged; band-biceps-curl 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d0 2027-01-10 AM RUN LONG 34min (LONG) | d1 2027-01-11 AM STRENGTH_LOWER 34min: kb-goblet-squat 3x8 RIR3 last logged; kb-deadlift 3x8 RIR3 last logged; leg-extension-machine 2x10 RIR3 last logged; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2027-01-11 AM RUN EASY 25min (EASY) | d4 2027-01-14 AM STRENGTH_LOWER_B 31min: kb-deadlift 3x8 RIR3 last logged; reverse-lunge 3x8 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged | d5 2027-01-15 AM RUN EASY 25min (EASY) | d6 2027-01-16 AM STRENGTH_UPPER_B 27min: seated-cable-row 3x8 RIR3 last logged; machine-chest-press 3x8 RIR3 last logged; dead-bug 2x10 RIR3 BW | d6 2027-01-16 AM RUN EASY 25min (EASY)
- Week 6 (TAPER): d0 2027-02-14 AM STRENGTH_UPPER 24min: machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; cable-triceps-pushdown 1x10 RIR3 last logged; band-biceps-curl 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2027-02-14 AM RUN LONG 20min (LONG) | d1 2027-02-15 AM STRENGTH_LOWER 24min: kb-goblet-squat 2x8 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; leg-extension-machine 1x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2027-02-15 AM RUN EASY 20min (EASY +strides) | d4 2027-02-18 AM STRENGTH_LOWER_B 22min: kb-deadlift 2x8 RIR3 last logged; reverse-lunge 2x10 RIR3 BW; seated-calf-raise-machine 1x10 RIR3 last logged; leg-curl-machine 1x10 RIR3 last logged | d5 2027-02-19 AM RUN EASY 20min (EASY +strides) | d6 2027-02-20 AM STRENGTH_UPPER_B 14min: seated-cable-row 1x8 RIR4 last logged; machine-chest-press 1x8 RIR4 last logged | d6 2027-02-20 AM RUN EASY 15min (EASY)
- Week 7 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2027-02-21 AM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d1 2027-02-22 AM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d5 2027-02-26  RUN RACE 150min (RACE, completion) | d6 STRENGTH REST_BY_DESIGN | d6 RUN REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G175

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-01","weeks":12,"asOf":"2026-12-30","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2],"strengthDays":[2,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":42,"strengthMinutes":58,"longRunDay":1,"longRunMinutes":31,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2027-01-02 AM RUN EASY 15min (EASY) | d2 2027-01-03 AM RUN EASY 15min (EASY) | d2 2027-01-03 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d4 2027-01-05 PM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-09 AM RUN EASY 20min (EASY) | d2 2027-01-10 AM RUN EASY 20min (EASY) | d2 2027-01-10 PM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2027-01-12 PM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G176

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":8,"asOf":"2026-12-04","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":33,"longestRunMinutes":32,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":41,"strengthMinutes":44,"longRunDay":3,"longRunMinutes":43,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G177

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":8,"asOf":"2026-11-30","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["leg-press 5x8 116KG TOTAL","barbell-rdl 4x12 64KG TOTAL","db-split-squat 2x10 7KG PER_HAND"],"equipment":["BODYWEIGHT","BANDS","KETTLEBELL","MACHINES","BENCH","DUMBBELLS","RACK","BARBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[1,2,3,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":78,"strengthMinutes":28,"longRunDay":0,"longRunMinutes":48,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-02 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-03 AM STRENGTH_LOWER 27min: leg-press 4x8 RIR3 116kg TOTAL; barbell-rdl 3x12 RIR3 64kg TOTAL | d2 2026-12-04 AM STRENGTH_UPPER 21min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; machine-chest-press 1x12 RIR3 establish | d3 2026-12-05 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d5 2026-12-07 AM STRENGTH_LOWER_B 27min: barbell-rdl 4x12 RIR3 64kg TOTAL; db-split-squat 2x10 RIR3 7kg PER_HAND; standing-calf-raise 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-09 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-10 AM STRENGTH_LOWER 27min: leg-press 4x8 RIR3 116kg TOTAL; barbell-rdl 3x12 RIR3 64kg TOTAL | d2 2026-12-11 AM STRENGTH_UPPER 21min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; machine-chest-press 1x12 RIR3 last logged | d3 2026-12-12 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2026-12-14 AM STRENGTH_LOWER_B 27min: barbell-rdl 4x12 RIR3 64kg TOTAL; db-split-squat 2x10 RIR3 7kg PER_HAND; standing-calf-raise 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation · non-blocking differences: LOAD_CONVENTION_EQUIVALENT

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G178

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-19","weeks":4,"asOf":"2026-12-17","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-04"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-01-04"},"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":52,"longestRunMinutes":22,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["kb-goblet-squat 4x10 16KG SINGLE_IMPLEMENT","kb-deadlift 3x6 11KG SINGLE_IMPLEMENT","reverse-lunge 4x6 0KG BODYWEIGHT"],"equipment":["RACK","BENCH","KETTLEBELL","BARBELL","MACHINES","BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4],"strengthDays":[2,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":52,"strengthMinutes":69,"longRunDay":0,"longRunMinutes":43,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-12-19 AM RUN LONG 20min (LONG) | d1 2026-12-20 AM RUN EASY 15min (EASY) | d2 2026-12-21 PM STRENGTH_FULL_A 36min: kb-goblet-squat 4x10 RIR3 16kg SINGLE_IMPLEMENT; machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2026-12-22 PM STRENGTH_FULL_B 33min: kb-deadlift 3x6 RIR3 11kg SINGLE_IMPLEMENT; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; leg-curl-machine 2x10 RIR3 establish; band-biceps-curl 2x10 RIR3 BW | d4 2026-12-23 AM RUN EASY 15min (EASY)
- Week 1 (SPECIFIC): d0 2026-12-26 AM RUN LONG 20min (LONG) | d1 2026-12-27 AM RUN EASY 15min (EASY) | d2 2026-12-28 PM STRENGTH_FULL_A 40min: kb-goblet-squat 3x12 RIR3 16kg SINGLE_IMPLEMENT; machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d3 2026-12-29 PM STRENGTH_FULL_B 16min: kb-deadlift 1x8 RIR4 11kg SINGLE_IMPLEMENT; seated-cable-row 1x8 RIR4 last logged; machine-chest-press 1x8 RIR4 last logged | d4 2026-12-30 AM RUN EASY 15min (EASY)
- Week 1 (SPECIFIC): d0 2026-12-26 AM RUN LONG 20min (LONG) | d1 2026-12-27 AM RUN EASY 15min (EASY) | d2 2026-12-28 PM STRENGTH_FULL_A 40min: kb-goblet-squat 3x12 RIR3 16kg SINGLE_IMPLEMENT; machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d3 2026-12-29 PM STRENGTH_FULL_B 16min: kb-deadlift 1x8 RIR4 11kg SINGLE_IMPLEMENT; seated-cable-row 1x8 RIR4 last logged; machine-chest-press 1x8 RIR4 last logged | d4 2026-12-30 AM RUN EASY 15min (EASY)
- Week 2 (RACE_WEEK): d0 2027-01-02 AM RUN EASY 15min (EASY) | d1 2027-01-03 AM RUN SHAKEOUT 15min (SHAKEOUT) | d2 STRENGTH REST_BY_DESIGN | d2 2027-01-04  RUN RACE 150min (RACE, completion) | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-06 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G179

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-24","weeks":8,"asOf":"2026-12-22","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":26,"longestRunMinutes":36,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","BENCH","RACK","BARBELL","DUMBBELLS","BODYWEIGHT","BANDS","PULL_UP_BAR","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,5],"strengthDays":[2,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":72,"strengthMinutes":58,"longRunDay":3,"longRunMinutes":133,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G180

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":16,"asOf":"2027-01-01","tz":60,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":152,"longestRunMinutes":59,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","MACHINES","KETTLEBELL","RACK","DUMBBELLS","BANDS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":41,"strengthMinutes":21,"longRunDay":6,"longRunMinutes":133,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G181

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":16,"asOf":"2026-12-13","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["RACK","KETTLEBELL","BENCH","BANDS","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,6],"strengthDays":[0,1,2,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":28,"strengthMinutes":25,"longRunDay":3,"longRunMinutes":69,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-13 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-13 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-12-14 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW | d2 2026-12-15 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-16 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-17 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-19 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-20 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-20 PM STRENGTH_FULL_A 24min: kb-goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 last logged | d1 2026-12-21 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW | d2 2026-12-22 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d3 2026-12-23 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-24 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-12-26 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G182

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":4,"asOf":"2026-11-23","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","BENCH","RACK","BODYWEIGHT","MACHINES","BARBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":31,"strengthMinutes":27,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-23 AM STRENGTH_LOWER 21min: kb-goblet-squat 2x10 RIR3 establish; kb-deadlift 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW | d1 2026-11-24 AM STRENGTH_UPPER 21min: machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; push-up 1x12 RIR3 BW | d4 2026-11-27 AM STRENGTH_LOWER_B 21min: kb-deadlift 2x10 RIR3 establish; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW | d5 2026-11-28 AM STRENGTH_UPPER_B 21min: seated-cable-row 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d6 2026-11-29 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-30 AM STRENGTH_LOWER 21min: kb-goblet-squat 2x10 RIR3 last logged; kb-deadlift 2x10 RIR3 last logged; reverse-lunge 1x12 RIR3 BW | d1 2026-12-01 AM STRENGTH_UPPER 21min: machine-chest-press 2x10 RIR3 last logged; seated-cable-row 2x10 RIR3 last logged; push-up 1x12 RIR3 BW | d4 2026-12-04 AM STRENGTH_LOWER_B 21min: kb-deadlift 2x10 RIR3 last logged; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW | d5 2026-12-05 AM STRENGTH_UPPER_B 21min: seated-cable-row 2x10 RIR3 last logged; machine-chest-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2026-12-06 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G183

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":4,"asOf":"2027-01-03","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5],"strengthDays":[1,2,3,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":75,"strengthMinutes":72,"longRunDay":4,"longRunMinutes":81,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2027-01-06 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-06 AM STRENGTH_LOWER 28min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2027-01-07 PM RUN WALK 20min (WALK) | d2 2027-01-07 AM STRENGTH_UPPER 23min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2027-01-08 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2027-01-08 AM STRENGTH_LOWER_B 25min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2027-01-09 PM RUN WALK 20min (WALK) | d4 2027-01-09 AM STRENGTH_UPPER_B 20min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2027-01-10 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2027-01-11 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-13 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-13 AM STRENGTH_LOWER 34min: box-squat-bodyweight 3x5 RIR3 BW; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2027-01-14 PM RUN WALK 20min (WALK) | d2 2027-01-14 AM STRENGTH_UPPER 26min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2027-01-15 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-15 AM STRENGTH_LOWER_B 31min: glute-bridge 3x5 RIR3 BW; reverse-lunge 3x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2027-01-16 PM RUN WALK 20min (WALK) | d4 2027-01-16 AM STRENGTH_UPPER_B 23min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2027-01-17 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-18 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G184

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-10","weeks":4,"asOf":"2026-12-08","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":258,"longestRunMinutes":66,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","RACK","PULL_UP_BAR","BENCH","DUMBBELLS","BANDS","KETTLEBELL","BARBELL","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,1,3,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":86,"strengthMinutes":20,"longRunDay":4,"longRunMinutes":51,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-10 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d0 2026-12-10 PM RUN EASY 40min (EASY) | d1 2026-12-11 PM STRENGTH_FULL_B 19min: kb-deadlift 2x8 RIR3 establish; band-row 1x8 RIR3 BW; incline-push-up 1x8 RIR3 BW | d1 2026-12-11 PM RUN EASY 40min (EASY) | d2 2026-12-12 PM RUN EASY 40min (EASY) | d3 2026-12-13 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-13 PM RUN EASY 40min (EASY) | d4 2026-12-14 PM RUN LONG 51min (LONG) | d5 2026-12-15 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-15 PM RUN EASY 40min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-17 PM STRENGTH_FULL_A 19min: goblet-squat 2x8 RIR3 establish; incline-push-up 1x8 RIR3 BW; band-row 1x8 RIR3 BW | d0 2026-12-17 PM RUN EASY 40min (EASY) | d1 2026-12-18 PM STRENGTH_FULL_B 19min: kb-deadlift 2x8 RIR3 last logged; band-row 1x8 RIR3 BW; incline-push-up 1x8 RIR3 BW | d1 2026-12-18 PM RUN EASY 40min (EASY) | d2 2026-12-19 PM RUN EASY 40min (EASY) | d3 2026-12-20 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish | d3 2026-12-20 PM RUN EASY 40min (EASY) | d4 2026-12-21 PM RUN LONG 51min (LONG) | d5 2026-12-22 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; tibialis-raise 1x10 RIR3 BW | d5 2026-12-22 PM RUN EASY 40min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G185

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-19","weeks":8,"asOf":"2026-11-17","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":174,"longestRunMinutes":78,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","RACK","BARBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4,5],"strengthDays":[0,2,3,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":55,"strengthMinutes":38,"longRunDay":0,"longRunMinutes":55,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-19 PM RUN LONG 55min (LONG) | d0 2026-11-19 PM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; push-up 1x10 RIR3 BW; inverted-row 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-21 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-22 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-11-23 PM RUN EASY 55min (EASY) | d5 2026-11-24 PM RUN EASY 55min (EASY) | d5 2026-11-24 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-11-25 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-26 PM RUN LONG 55min (LONG) | d0 2026-11-26 PM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; push-up 1x10 RIR3 BW; inverted-row 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-28 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-29 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-11-30 PM RUN EASY 55min (EASY) | d5 2026-12-01 PM RUN EASY 55min (EASY) | d5 2026-12-01 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-12-02 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G186

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":4,"asOf":"2026-11-14","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":114,"longestRunMinutes":83,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","RACK","DUMBBELLS","BODYWEIGHT","BENCH","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5],"strengthDays":[1,2,3,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":78,"strengthMinutes":48,"longRunDay":1,"longRunMinutes":84,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-16 AM RUN EASY 15min (EASY) | d1 2026-11-17 AM STRENGTH_UPPER 29min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-11-17 AM RUN LONG 45min (LONG) | d2 2026-11-18 AM STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2026-11-19 AM STRENGTH_LOWER_B 26min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2026-11-19 AM RUN EASY 15min (EASY) | d4 2026-11-20 AM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-overhead-triceps-extension 2x10 RIR3 establish | d4 2026-11-20 AM RUN EASY 15min (EASY) | d5 2026-11-21 AM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-23 AM RUN EASY 15min (EASY) | d1 2026-11-24 AM STRENGTH_UPPER 34min: db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2026-11-24 AM RUN LONG 45min (LONG) | d2 2026-11-25 AM STRENGTH_LOWER 34min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d3 2026-11-26 AM STRENGTH_LOWER_B 31min: db-rdl 3x8 RIR3 last logged; db-split-squat 3x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d3 2026-11-26 AM RUN EASY 15min (EASY) | d4 2026-11-27 AM STRENGTH_UPPER_B 27min: db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-overhead-triceps-extension 2x10 RIR3 last logged | d4 2026-11-27 AM RUN EASY 15min (EASY) | d5 2026-11-28 AM RUN EASY 15min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G187

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":4,"asOf":"2026-11-15","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":76,"longestRunMinutes":44,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BARBELL","MACHINES","BENCH","KETTLEBELL","RACK","PULL_UP_BAR","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,5],"strengthDays":[0,1,3,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":58,"strengthMinutes":53,"longRunDay":2,"longRunMinutes":127,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-16 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-17 PM RUN EASY 15min (EASY) | d1 2026-11-17 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-18 PM RUN LONG 30min (LONG) | d3 2026-11-19 PM RUN EASY 15min (EASY) | d3 2026-11-19 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-21 PM RUN EASY 15min (EASY) | d5 2026-11-21 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-22 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-23 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-24 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d1 2026-11-24 PM RUN EASY 15min (EASY) | d2 2026-11-25 PM RUN LONG 30min (LONG) | d3 2026-11-26 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-26 PM RUN EASY 15min (EASY) | d5 2026-11-28 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d5 2026-11-28 PM RUN EASY 15min (EASY) | d6 2026-11-29 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G188

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":4,"asOf":"2027-01-02","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":212,"longestRunMinutes":57,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","PULL_UP_BAR","MACHINES","BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4],"strengthDays":[0,3,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":22,"strengthMinutes":39,"longRunDay":3,"longRunMinutes":37,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-04 AM STRENGTH_LOWER 25min: kb-goblet-squat 2x10 RIR3 establish; kb-deadlift 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-07 PM RUN LONG 37min (LONG) | d3 2027-01-07 AM STRENGTH_UPPER 25min: machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; push-up 1x12 RIR3 BW; kb-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2027-01-08 PM RUN EASY 22min (EASY) | d4 2027-01-08 AM STRENGTH_FULL_B 28min: kb-deadlift 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-11 AM STRENGTH_LOWER 25min: kb-goblet-squat 2x10 RIR3 last logged; kb-deadlift 2x10 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-14 PM RUN LONG 37min (LONG) | d3 2027-01-14 AM STRENGTH_UPPER 25min: machine-chest-press 2x10 RIR3 last logged; seated-cable-row 2x10 RIR3 last logged; push-up 1x12 RIR3 BW; kb-row 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2027-01-15 PM RUN EASY 22min (EASY) | d4 2027-01-15 AM STRENGTH_FULL_B 28min: kb-deadlift 2x10 RIR3 last logged; seated-cable-row 2x10 RIR3 last logged; machine-chest-press 2x10 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G189

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":12,"asOf":"2027-01-04","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":33,"longestRunMinutes":135,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5,6],"strengthDays":[1,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":77,"strengthMinutes":37,"longRunDay":6,"longRunMinutes":120,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2027-01-05 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d4 2027-01-08 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-09 AM RUN WALK 20min (WALK) | d6 2027-01-10 AM RUN LONG 30min (LONG)
- Week 1 (DEVELOPMENT): d1 2027-01-12 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2027-01-15 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-16 AM RUN WALK 20min (WALK) | d6 2027-01-17 AM RUN LONG 30min (LONG)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G190

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-17","weeks":8,"asOf":"2026-12-15","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1],"runTurn":"AM","strengthTurn":"PM","runMinutes":38,"strengthMinutes":32,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-17 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-12-18 PM STRENGTH_FULL_B 22min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-24 PM STRENGTH_FULL_A 22min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW | d1 2026-12-25 PM STRENGTH_FULL_B 22min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G191

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-30","weeks":16,"asOf":"2026-12-28","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":300,"longestRunMinutes":61,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x5 31KG SINGLE_IMPLEMENT","kb-deadlift 3x6 29KG SINGLE_IMPLEMENT","reverse-lunge 2x12 0KG BODYWEIGHT"],"equipment":["BANDS","BENCH","KETTLEBELL","MACHINES","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[3,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":38,"strengthMinutes":22,"longRunDay":1,"longRunMinutes":39,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G192

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":16,"asOf":"2026-11-22","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":190,"longestRunMinutes":68,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["RACK","KETTLEBELL","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0],"runTurn":"AM","strengthTurn":"AM","runMinutes":52,"strengthMinutes":72,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-23 AM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-30 AM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G193

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":16,"asOf":"2026-11-09","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x5 0KG BODYWEIGHT","glute-bridge 4x8 0KG BODYWEIGHT","db-split-squat 4x10 12KG TOTAL"],"equipment":["DUMBBELLS","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,3,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":58,"strengthMinutes":51,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-12 AM STRENGTH_LOWER 33min: box-squat-bodyweight 4x5 RIR3 BW; glute-bridge 4x8 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-13 AM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; incline-push-up 1x12 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-14 AM STRENGTH_LOWER_B 28min: glute-bridge 4x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-15 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d5 2026-11-17 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-19 AM STRENGTH_LOWER 35min: box-squat-bodyweight 4x7 RIR3 BW; glute-bridge 4x10 RIR3 BW; reverse-lunge 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d1 2026-11-20 AM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; incline-push-up 1x14 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-11-21 AM STRENGTH_LOWER_B 29min: glute-bridge 4x10 RIR3 BW; reverse-lunge 2x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2026-11-22 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d5 2026-11-24 AM STRENGTH_CORE 14min: dead-bug 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; front-plank 1x14 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G194

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-29","weeks":4,"asOf":"2026-11-26","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":23,"longestRunMinutes":53,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["RACK","PULL_UP_BAR","BENCH","BARBELL","DUMBBELLS","BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5,6],"strengthDays":[0,3,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":20,"strengthMinutes":36,"longRunDay":3,"longRunMinutes":150,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-29 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-11-29 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; db-calf-raise 1x10 RIR3 establish; side-lying-hip-abduction 1x10 RIR3 BW | d1 2026-11-30 PM RUN WALK 20min (WALK) | d3 2026-12-02 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-02 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 1x10 RIR3 BW; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2026-12-03 PM RUN WALK 20min (WALK) | d4 2026-12-03 AM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2026-12-04 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-05 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-06 PM RUN WALK_JOG 20min (WALK_JOG 4x(30s jog/120s walk)) | d0 2026-12-06 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; side-lying-hip-abduction 1x10 RIR3 BW | d1 2026-12-07 PM RUN WALK 20min (WALK) | d3 2026-12-09 PM RUN WALK_JOG 20min (WALK_JOG 4x(30s jog/120s walk)) | d3 2026-12-09 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d4 2026-12-10 PM RUN WALK 20min (WALK) | d4 2026-12-10 AM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2026-12-11 PM RUN WALK_JOG 20min (WALK_JOG 4x(30s jog/120s walk)) | d6 2026-12-12 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G195

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":4,"asOf":"2026-12-09","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x5 0KG BODYWEIGHT","kb-deadlift 5x8 13KG SINGLE_IMPLEMENT","reverse-lunge 3x8 0KG BODYWEIGHT"],"equipment":["BANDS","BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":23,"strengthMinutes":55,"longRunDay":2,"longRunMinutes":95,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-12-11 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-12 AM RUN WALK 20min (WALK) | d4 2026-12-13 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-15 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d2 2026-12-18 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-19 AM RUN WALK 20min (WALK) | d4 2026-12-20 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-22 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G196

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":16,"asOf":"2026-12-24","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":108,"longestRunMinutes":54,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","DUMBBELLS","BARBELL","BANDS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0],"runTurn":"PM","strengthTurn":"PM","runMinutes":42,"strengthMinutes":23,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-26 PM STRENGTH_FULL_A 22min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 1x10 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2027-01-02 PM STRENGTH_FULL_A 22min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-row 1x10 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G197

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":8,"asOf":"2026-12-07","tz":0,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","RACK","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,6],"strengthDays":[3],"runTurn":"AM","strengthTurn":"AM","runMinutes":33,"strengthMinutes":50,"longRunDay":1,"longRunMinutes":95,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G198

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-30","weeks":16,"asOf":"2026-12-30","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x12 0KG BODYWEIGHT"],"equipment":["RACK","BARBELL","PULL_UP_BAR","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[0,1,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":24,"strengthMinutes":58,"longRunDay":0,"longRunMinutes":122,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-30 AM RUN EASY 15min (EASY) | d0 2026-12-30 AM STRENGTH_LOWER 27min: box-squat-bodyweight 3x12 RIR3 BW; barbell-hip-thrust 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d1 2026-12-31 AM RUN WALK 20min (WALK) | d1 2026-12-31 AM STRENGTH_FULL_B 27min: barbell-hip-thrust 2x8 RIR3 establish; inverted-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-01-01 AM RUN EASY 15min (EASY) | d3 2027-01-02 AM RUN WALK 20min (WALK) | d5 2027-01-04 AM RUN EASY 15min (EASY) | d6 2027-01-05 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; inverted-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-06 AM RUN EASY 20min (EASY) | d0 2027-01-06 AM STRENGTH_LOWER 27min: box-squat-bodyweight 3x12 RIR3 BW; barbell-hip-thrust 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d1 2027-01-07 AM RUN WALK 20min (WALK) | d1 2027-01-07 AM STRENGTH_FULL_B 27min: barbell-hip-thrust 2x8 RIR3 last logged; inverted-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-01-08 AM RUN EASY 20min (EASY) | d3 2027-01-09 AM RUN WALK 20min (WALK) | d5 2027-01-11 AM RUN EASY 20min (EASY) | d6 2027-01-12 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; inverted-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G199

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":8,"asOf":"2026-12-24","tz":-180,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-15"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-02-15"},"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":57,"longestRunMinutes":23,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4],"strengthDays":[6],"runTurn":"AM","strengthTurn":"AM","runMinutes":29,"strengthMinutes":48,"longRunDay":1,"longRunMinutes":87,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G200

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":16,"asOf":"2026-11-09","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":156,"longestRunMinutes":35,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","DUMBBELLS","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":60,"strengthMinutes":67,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-10 AM STRENGTH_FULL_A 30min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-11-14 AM STRENGTH_FULL_B 30min: db-rdl 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; db-split-squat 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-11-17 AM STRENGTH_FULL_A 39min: goblet-squat 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d5 2026-11-21 AM STRENGTH_FULL_B 39min: db-rdl 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; db-split-squat 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G201

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-25","weeks":4,"asOf":"2026-12-23","tz":-180,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","RACK","DUMBBELLS","BANDS","BENCH","PULL_UP_BAR","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[0,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":67,"strengthMinutes":20,"longRunDay":1,"longRunMinutes":49,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G202

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":16,"asOf":"2026-11-17","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":258,"longestRunMinutes":88,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BANDS","DUMBBELLS","BARBELL","RACK","BODYWEIGHT","KETTLEBELL","PULL_UP_BAR","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4,5,6],"strengthDays":[2,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":49,"strengthMinutes":72,"longRunDay":6,"longRunMinutes":55,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-20 PM RUN EASY 49min (EASY) | d2 2026-11-22 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-22 PM RUN EASY 49min (EASY) | d4 2026-11-24 PM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-11-24 PM RUN EASY 49min (EASY) | d5 2026-11-25 PM RUN EASY 49min (EASY) | d6 2026-11-26 PM RUN LONG 55min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-27 PM RUN EASY 49min (EASY) | d2 2026-11-29 PM STRENGTH_FULL_A 31min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2026-11-29 PM RUN EASY 49min (EASY) | d4 2026-12-01 PM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-01 PM RUN EASY 49min (EASY) | d5 2026-12-02 PM RUN EASY 49min (EASY) | d6 2026-12-03 PM RUN LONG 55min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G203

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-25","weeks":12,"asOf":"2026-11-23","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-07"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-02-07"},"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,6],"strengthDays":[1,2,3,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":55,"strengthMinutes":61,"longRunDay":6,"longRunMinutes":38,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d1 2026-11-26 AM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2026-11-27 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-27 AM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-28 AM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d5 2026-11-30 AM STRENGTH_UPPER_B 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-01 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-01 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 1 (BUILD): d1 2026-12-03 AM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2026-12-04 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-04 AM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-05 AM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d5 2026-12-07 AM STRENGTH_UPPER_B 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-08 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-08 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 9 (TAPER): d1 2027-01-28 AM STRENGTH_LOWER 20min: box-squat-bodyweight 1x14 RIR3 BW; glute-bridge 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; side-lying-hip-abduction 1x14 RIR3 BW | d2 2027-01-29 PM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d2 2027-01-29 AM STRENGTH_UPPER 17min: push-up 1x14 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; incline-push-up 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2027-01-30 AM STRENGTH_LOWER_B 18min: glute-bridge 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; bent-knee-calf-raise 1x14 RIR3 BW; tibialis-raise 1x14 RIR3 BW | d5 2027-02-01 AM STRENGTH_UPPER_B 11min: push-up 1x14 RIR4 BW | d6 2027-02-02 PM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d6 STRENGTH REST_BY_DESIGN
- Week 10 (RACE_WEEK): d1 STRENGTH REST_BY_DESIGN | d2 2027-02-05 PM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 2027-02-07  RUN RACE 75min (RACE, completion) | d5 STRENGTH REST_BY_DESIGN | d6 2027-02-09 PM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G204

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":16,"asOf":"2026-11-22","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-12"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-03-12"},"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 4x8 80KG TOTAL","glute-bridge 5x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT","MACHINES","DUMBBELLS","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":35,"strengthMinutes":74,"longRunDay":5,"longRunMinutes":72,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-22 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-23 AM RUN WALK 20min (WALK) | d4 2026-11-26 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-27 AM RUN WALK 20min (WALK) | d6 2026-11-28 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-11-29 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-11-30 AM RUN WALK 20min (WALK) | d4 2026-12-03 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-04 AM RUN WALK 20min (WALK) | d6 2026-12-05 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 14 (TAPER): d0 2027-02-28 AM RUN EASY 20min (EASY +strides) | d1 2027-03-01 AM RUN EASY 20min (EASY +strides) | d4 2027-03-04 AM RUN EASY 20min (EASY +strides) | d5 2027-03-05 AM RUN EASY 20min (EASY +strides) | d6 2027-03-06 AM RUN WALK 20min (WALK)
- Week 15 (RACE_WEEK): d0 2027-03-07 AM RUN EASY 15min (EASY) | d1 2027-03-08 AM RUN EASY 15min (EASY) | d4 2027-03-11 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d5 2027-03-12  RUN RACE 150min (RACE, completion) | d6 RUN REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G205

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":12,"asOf":"2026-11-23","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":220,"longestRunMinutes":78,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,5],"strengthDays":[0,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":84,"strengthMinutes":26,"longRunDay":1,"longRunMinutes":34,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-23 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d0 2026-11-23 PM RUN EASY 60min (EASY) | d1 2026-11-24 PM RUN LONG 34min (LONG) | d2 2026-11-25 PM RUN EASY 60min (EASY) | d4 2026-11-27 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW | d5 2026-11-28 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-28 PM RUN EASY 60min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-30 PM RUN EASY 60min (EASY) | d0 2026-11-30 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW | d1 2026-12-01 PM RUN LONG 34min (LONG) | d2 2026-12-02 PM RUN EASY 60min (EASY) | d4 2026-12-04 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; side-lying-hip-abduction 1x10 RIR3 BW | d5 2026-12-05 PM RUN EASY 60min (EASY) | d5 2026-12-05 PM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G206

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":16,"asOf":"2026-11-21","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":210,"longestRunMinutes":74,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x10 0KG BODYWEIGHT","glute-bridge 5x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,4,6],"strengthDays":[6],"runTurn":"AM","strengthTurn":"PM","runMinutes":20,"strengthMinutes":63,"longRunDay":4,"longRunMinutes":108,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-11-23 AM RUN EASY 20min (EASY) | d2 2026-11-24 AM RUN EASY 20min (EASY) | d4 2026-11-26 AM RUN LONG 45min (LONG) | d6 2026-11-28 AM RUN EASY 20min (EASY) | d6 2026-11-28 PM STRENGTH_FULL_A 30min: box-squat-bodyweight 2x10 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-11-30 AM RUN EASY 20min (EASY) | d2 2026-12-01 AM RUN EASY 20min (EASY) | d4 2026-12-03 AM RUN LONG 45min (LONG) | d6 2026-12-05 AM RUN EASY 20min (EASY) | d6 2026-12-05 PM STRENGTH_FULL_A 34min: box-squat-bodyweight 2x12 RIR3 BW; push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G207

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":4,"asOf":"2026-11-08","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":156,"longestRunMinutes":18,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["leg-press 3x10 118KG TOTAL","barbell-rdl 5x6 39KG TOTAL","reverse-lunge 5x12 0KG BODYWEIGHT"],"equipment":["BANDS","RACK","BODYWEIGHT","BARBELL","MACHINES","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":30,"strengthMinutes":34,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2026-11-12 AM STRENGTH_LOWER 28min: leg-press 2x5 RIR3 establish; barbell-rdl 5x6 RIR3 39kg TOTAL | d3 2026-11-13 AM STRENGTH_UPPER 22min: machine-chest-press 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish; incline-push-up 2x7 RIR3 BW | d4 2026-11-14 AM STRENGTH_UPPER_B 22min: seated-cable-row 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2026-11-16 AM STRENGTH_LOWER_B 32min: barbell-rdl 4x6 RIR3 39kg TOTAL; reverse-lunge 4x12 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2026-11-19 AM STRENGTH_LOWER 30min: leg-press 3x5 RIR3 last logged; barbell-rdl 5x6 RIR3 39kg TOTAL | d3 2026-11-20 AM STRENGTH_UPPER 28min: machine-chest-press 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged; incline-push-up 2x9 RIR3 BW | d4 2026-11-21 AM STRENGTH_UPPER_B 28min: seated-cable-row 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; dead-bug 2x9 RIR3 BW | d6 2026-11-23 AM STRENGTH_LOWER_B 32min: barbell-rdl 4x6 RIR3 39kg TOTAL; reverse-lunge 4x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G208

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":8,"asOf":"2026-12-13","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":78,"longestRunMinutes":85,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[0,1,2,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":82,"strengthMinutes":75,"longRunDay":4,"longRunMinutes":47,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-13 AM RUN EASY 20min (EASY) | d0 2026-12-13 PM STRENGTH_LOWER 29min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2026-12-14 AM RUN EASY 20min (EASY) | d1 2026-12-14 PM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; pike-push-up 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-15 AM RUN WALK 20min (WALK) | d2 2026-12-15 PM STRENGTH_LOWER_B 26min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2026-12-16 PM STRENGTH_UPPER_B 21min: push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2026-12-17 AM RUN LONG 30min (LONG) | d5 2026-12-18 AM RUN WALK 20min (WALK) | d6 2026-12-19 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-20 AM RUN EASY 20min (EASY) | d0 2026-12-20 PM STRENGTH_LOWER 34min: box-squat-bodyweight 3x8 RIR3 BW; glute-bridge 3x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2026-12-21 AM RUN EASY 20min (EASY) | d1 2026-12-21 PM STRENGTH_UPPER 27min: push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; pike-push-up 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-22 AM RUN WALK 20min (WALK) | d2 2026-12-22 PM STRENGTH_LOWER_B 31min: glute-bridge 3x8 RIR3 BW; reverse-lunge 3x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2026-12-23 PM STRENGTH_UPPER_B 23min: push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2026-12-24 AM RUN LONG 30min (LONG) | d5 2026-12-25 AM RUN WALK 20min (WALK) | d6 2026-12-26 AM RUN WALK 20min (WALK)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G209

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-30","weeks":12,"asOf":"2026-12-27","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["goblet-squat 5x5 26KG PER_HAND","db-rdl 4x12 18KG TOTAL","reverse-lunge 5x10 0KG BODYWEIGHT"],"equipment":["DUMBBELLS","BODYWEIGHT","KETTLEBELL","MACHINES","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":45,"strengthMinutes":22,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-12-31 PM STRENGTH_LOWER 21min: goblet-squat 3x5 RIR3 26kg PER_HAND; db-rdl 2x8 RIR3 18kg TOTAL | d2 2027-01-01 PM STRENGTH_UPPER 20min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; machine-chest-press 1x10 RIR3 establish | d4 2027-01-03 PM STRENGTH_FULL_B 21min: db-rdl 2x8 RIR3 18kg TOTAL; db-row 2x8 RIR3 establish; db-floor-press 1x8 RIR3 establish
- Week 1 (DEVELOPMENT): d1 2027-01-07 PM STRENGTH_LOWER 21min: goblet-squat 3x5 RIR3 26kg PER_HAND; db-rdl 2x8 RIR3 18kg TOTAL | d2 2027-01-08 PM STRENGTH_UPPER 20min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged | d4 2027-01-10 PM STRENGTH_FULL_B 21min: db-rdl 2x8 RIR3 18kg TOTAL; db-row 2x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G210

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-19","weeks":8,"asOf":"2026-12-16","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x12 29KG SINGLE_IMPLEMENT"],"equipment":["MACHINES","KETTLEBELL","BENCH"],"pause":{"nonclinical":true,"weeks":10,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,3,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":58,"strengthMinutes":65,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-20 PM STRENGTH_LOWER 29min: kb-goblet-squat 2x8 RIR3 establish; kb-deadlift 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-12-21 PM STRENGTH_UPPER 29min: machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish; kb-row 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2026-12-22 PM STRENGTH_LOWER_B 26min: kb-deadlift 2x8 RIR3 establish; reverse-lunge 2x8 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 establish; leg-curl-machine 2x10 RIR3 establish | d4 2026-12-23 PM STRENGTH_UPPER_B 22min: seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2026-12-24 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 establish; front-plank 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-27 PM STRENGTH_LOWER 34min: kb-goblet-squat 3x8 RIR3 last logged; kb-deadlift 3x8 RIR3 last logged; leg-extension-machine 2x10 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d2 2026-12-28 PM STRENGTH_UPPER 34min: machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged; kb-row 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d3 2026-12-29 PM STRENGTH_LOWER_B 31min: kb-deadlift 3x8 RIR3 last logged; reverse-lunge 3x8 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged | d4 2026-12-30 PM STRENGTH_UPPER_B 27min: seated-cable-row 3x8 RIR3 last logged; machine-chest-press 3x8 RIR3 last logged; dead-bug 2x10 RIR3 BW | d5 2026-12-31 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 last logged; front-plank 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G211

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-03","weeks":4,"asOf":"2027-01-03","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[0,1,4,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":77,"strengthMinutes":63,"longRunDay":0,"longRunMinutes":89,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-03 AM RUN EASY 15min (EASY) | d0 2027-01-03 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2027-01-04 AM RUN EASY 15min (EASY) | d1 2027-01-04 PM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2027-01-05 AM RUN EASY 15min (EASY) | d4 2027-01-07 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-08 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-10 AM RUN EASY 20min (EASY) | d0 2027-01-10 PM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2027-01-11 AM RUN EASY 20min (EASY) | d1 2027-01-11 PM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2027-01-12 AM RUN EASY 20min (EASY) | d4 2027-01-14 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d5 2027-01-15 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G212

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-26","weeks":8,"asOf":"2026-11-24","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["RACK","KETTLEBELL","BODYWEIGHT","BARBELL","DUMBBELLS","BENCH","PULL_UP_BAR","BANDS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,5],"strengthDays":[0,1,3,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":47,"strengthMinutes":71,"longRunDay":0,"longRunMinutes":102,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-26 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d0 2026-11-26 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-27 AM STRENGTH_FULL_B 30min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; db-biceps-curl 2x8 RIR3 establish | d3 2026-11-29 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-11-29 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-11-30 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-01 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-02 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-03 AM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d0 2026-12-03 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-04 AM STRENGTH_FULL_B 30min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; db-biceps-curl 2x8 RIR3 last logged | d3 2026-12-06 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d3 2026-12-06 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-07 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d5 2026-12-08 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-09 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G213

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":4,"asOf":"2026-11-19","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","KETTLEBELL","MACHINES","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[1],"runTurn":"PM","strengthTurn":"AM","runMinutes":68,"strengthMinutes":68,"longRunDay":0,"longRunMinutes":47,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-20 PM RUN EASY 15min (EASY) | d1 2026-11-21 PM RUN WALK 20min (WALK) | d1 2026-11-21 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-11-22 PM RUN EASY 15min (EASY) | d3 2026-11-23 PM RUN WALK 20min (WALK) | d5 2026-11-25 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-27 PM RUN EASY 20min (EASY) | d1 2026-11-28 PM RUN WALK 20min (WALK) | d1 2026-11-28 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2026-11-29 PM RUN EASY 20min (EASY) | d3 2026-11-30 PM RUN WALK 20min (WALK) | d5 2026-12-02 PM RUN EASY 20min (EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G214

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":12,"asOf":"2026-11-10","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":93,"longestRunMinutes":136,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["goblet-squat 4x5 29KG PER_HAND","db-rdl 4x5 30KG PER_HAND","db-split-squat 2x6 25KG PER_HAND"],"equipment":["BANDS","BARBELL","DUMBBELLS","KETTLEBELL","BODYWEIGHT","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":84,"strengthMinutes":27,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-12 PM STRENGTH_FULL_A 26min: goblet-squat 3x5 RIR3 29kg PER_HAND; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish | d6 2026-11-18 PM STRENGTH_FULL_B 26min: db-rdl 3x5 RIR3 30kg PER_HAND; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-11-19 PM STRENGTH_FULL_A 26min: goblet-squat 3x7 RIR3 29kg PER_HAND; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d6 2026-11-25 PM STRENGTH_FULL_B 26min: db-rdl 3x7 RIR3 30kg PER_HAND; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation · non-blocking differences: LOAD_CONVENTION_EQUIVALENT

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G215

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-10","weeks":12,"asOf":"2026-12-10","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":92,"longestRunMinutes":107,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT","RACK","BARBELL","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,5,6],"strengthDays":[1,2,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":80,"strengthMinutes":22,"longRunDay":1,"longRunMinutes":90,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-10 PM RUN EASY 15min (EASY) | d1 2026-12-11 PM RUN LONG 35min (LONG) | d1 2026-12-11 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d2 2026-12-12 AM STRENGTH_FULL_B 21min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 1x8 RIR3 establish | d3 2026-12-13 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-15 PM RUN EASY 15min (EASY) | d6 2026-12-16 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-17 PM RUN EASY 15min (EASY) | d1 2026-12-18 PM RUN LONG 35min (LONG) | d1 2026-12-18 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d2 2026-12-19 AM STRENGTH_FULL_A 21min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 1x8 RIR3 last logged | d3 2026-12-20 AM STRENGTH_FULL_B 21min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged | d5 2026-12-22 PM RUN EASY 15min (EASY) | d6 2026-12-23 PM RUN EASY 15min (EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G216

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":8,"asOf":"2026-12-17","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":276,"longestRunMinutes":31,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x5 0KG BODYWEIGHT","barbell-rdl 5x8 108KG TOTAL","db-split-squat 5x12 25KG PER_HAND"],"equipment":["MACHINES","BARBELL","PULL_UP_BAR","DUMBBELLS","RACK","BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4],"strengthDays":[2,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":32,"strengthMinutes":20,"longRunDay":0,"longRunMinutes":72,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-20 AM RUN LONG 30min (LONG) | d1 2026-12-21 AM RUN EASY 31min (EASY) | d2 2026-12-22 PM STRENGTH_FULL_A 19min: goblet-squat 2x8 RIR3 establish; db-floor-press 1x8 RIR3 establish; db-row 1x8 RIR3 establish | d3 2026-12-23 AM RUN EASY 31min (EASY) | d4 2026-12-24 AM RUN EASY 31min (EASY) | d4 2026-12-24 PM STRENGTH_FULL_B 19min: barbell-rdl 2x8 RIR3 108kg TOTAL; db-row 1x8 RIR3 establish; db-floor-press 1x8 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-12-27 AM RUN LONG 35min (LONG) | d1 2026-12-28 AM RUN EASY 31min (EASY) | d2 2026-12-29 PM STRENGTH_FULL_A 19min: goblet-squat 2x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged | d3 2026-12-30 AM RUN EASY 31min (EASY) | d4 2026-12-31 AM RUN EASY 31min (EASY) | d4 2026-12-31 PM STRENGTH_FULL_B 19min: barbell-rdl 2x10 RIR3 108kg TOTAL; db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G217

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-24","weeks":16,"asOf":"2026-12-21","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":144,"longestRunMinutes":63,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 2x12 55KG TOTAL","barbell-rdl 5x5 69KG TOTAL","reverse-lunge 4x10 0KG BODYWEIGHT"],"equipment":["MACHINES","BARBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":84,"strengthMinutes":36,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-12-25 PM STRENGTH_FULL_A 31min: leg-press 2x12 RIR3 55kg TOTAL; machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2026-12-29 PM STRENGTH_FULL_B 34min: barbell-rdl 5x5 RIR3 69kg TOTAL; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; leg-curl-machine 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d1 2027-01-01 PM STRENGTH_FULL_A 36min: leg-press 2x8 RIR3 57.5kg TOTAL; machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d5 2027-01-05 PM STRENGTH_FULL_B 36min: barbell-rdl 5x7 RIR3 69kg TOTAL; seated-cable-row 3x8 RIR3 last logged; machine-chest-press 3x8 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G218

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":8,"asOf":"2026-12-12","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":75,"longestRunMinutes":53,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BODYWEIGHT","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":17,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,3,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":87,"strengthMinutes":65,"sameTurnConfirmed":false}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: POPULATION_OUTSIDE_V1_AGE_RANGE

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G219

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":8,"asOf":"2026-11-21","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":48,"longestRunMinutes":62,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[2,3,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":39,"strengthMinutes":24,"longRunDay":3,"longRunMinutes":33,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G220

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-18","weeks":8,"asOf":"2026-12-18","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":132,"longestRunMinutes":26,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","KETTLEBELL","BODYWEIGHT","MACHINES","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,4,5],"strengthDays":[0,1,3,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":52,"strengthMinutes":51,"longRunDay":5,"longRunMinutes":129,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-18 PM STRENGTH_LOWER 28min: goblet-squat 2x5 RIR3 establish; db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x7 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2026-12-19 PM STRENGTH_UPPER 28min: db-bench-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-floor-press 2x7 RIR3 establish; one-arm-db-row 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2026-12-20 PM RUN EASY 26min (EASY) | d3 2026-12-21 PM STRENGTH_LOWER_B 25min: db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d4 2026-12-22 PM RUN EASY 26min (EASY) | d5 2026-12-23 PM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-bench-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-12-23 PM RUN LONG 25min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-12-25 PM STRENGTH_LOWER 34min: goblet-squat 3x5 RIR3 last logged; db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 2x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d1 2026-12-26 PM STRENGTH_UPPER 34min: db-bench-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-floor-press 2x7 RIR3 last logged; one-arm-db-row 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d2 2026-12-27 PM RUN EASY 26min (EASY) | d3 2026-12-28 PM STRENGTH_LOWER_B 31min: db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 3x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d4 2026-12-29 PM RUN EASY 26min (EASY) | d5 2026-12-30 PM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-bench-press 3x5 RIR3 last logged; dead-bug 2x7 RIR3 BW | d5 2026-12-30 PM RUN LONG 25min (LONG)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G221

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":16,"asOf":"2026-11-08","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-21"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-02-21"},"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","RACK","BARBELL","KETTLEBELL","PULL_UP_BAR","BENCH","DUMBBELLS","BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[1,2,3,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":84,"strengthMinutes":56,"longRunDay":6,"longRunMinutes":65,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-11 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-12 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish | d1 2026-11-12 PM RUN WALK 20min (WALK) | d2 2026-11-13 PM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-11-13 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-14 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; seated-calf-raise-db 1x10 RIR3 establish; tibialis-raise 1x10 RIR3 BW | d3 2026-11-14 PM RUN WALK 20min (WALK) | d4 2026-11-15 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-16 PM STRENGTH_UPPER_B 20min: band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-17 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d6 2026-11-17 PM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-11-18 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-11-19 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; hip-abduction-machine 1x10 RIR3 last logged | d1 2026-11-19 PM RUN WALK 20min (WALK) | d2 2026-11-20 PM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2026-11-20 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-21 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; seated-calf-raise-db 1x10 RIR3 last logged; tibialis-raise 1x10 RIR3 BW | d3 2026-11-21 PM RUN WALK 20min (WALK) | d4 2026-11-22 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-11-23 PM STRENGTH_UPPER_B 20min: band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-24 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; front-plank 1x10 RIR3 BW | d6 2026-11-24 PM RUN WALK 20min (WALK)
- Week 13 (TAPER): d0 2027-02-10 PM RUN EASY 20min (EASY) | d1 2027-02-11 PM STRENGTH_LOWER 19min: goblet-squat 1x8 RIR3 last logged; db-rdl 1x8 RIR3 last logged; reverse-lunge-db 1x10 RIR3 last logged; standing-calf-raise 1x14 RIR3 BW; hip-abduction-machine 1x10 RIR3 last logged | d1 2027-02-11 PM RUN EASY 20min (EASY) | d2 2027-02-12 PM STRENGTH_UPPER 19min: push-up 1x14 RIR3 BW; band-row 1x10 RIR3 BW; incline-push-up 1x12 RIR3 BW; db-row 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d2 2027-02-12 PM RUN EASY 20min (EASY) | d3 2027-02-13 PM STRENGTH_LOWER_B 17min: db-rdl 1x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; seated-calf-raise-machine 1x10 RIR3 last logged; tibialis-raise 1x14 RIR3 BW | d3 2027-02-13 PM RUN EASY 20min (EASY) | d4 2027-02-14 PM RUN WALK 20min (WALK) | d5 2027-02-15 PM STRENGTH_UPPER_B 14min: band-row 1x10 RIR4 BW; push-up 1x14 RIR4 BW | d6 STRENGTH REST_BY_DESIGN | d6 2027-02-16 PM RUN WALK 20min (WALK)
- Week 14 (RACE_WEEK): d0 2027-02-17 PM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d1 2027-02-18 PM RUN EASY 15min (EASY) | d2 STRENGTH REST_BY_DESIGN | d2 2027-02-19 PM RUN EASY 15min (EASY) | d3 STRENGTH REST_BY_DESIGN | d3 2027-02-20 PM RUN SHAKEOUT 15min (SHAKEOUT) | d4 2027-02-21  RUN RACE 150min (RACE, completion) | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN | d6 2027-02-23 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G222

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-23","weeks":16,"asOf":"2026-12-21","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":184,"longestRunMinutes":23,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x12 30KG SINGLE_IMPLEMENT","kb-deadlift 5x5 9KG SINGLE_IMPLEMENT","db-split-squat 2x5 29KG PER_HAND"],"equipment":["BARBELL","DUMBBELLS","BENCH","RACK","PULL_UP_BAR","BODYWEIGHT","MACHINES","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4,5],"strengthDays":[0,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":39,"strengthMinutes":26,"longRunDay":4,"longRunMinutes":73,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-23 AM STRENGTH_FULL_A 26min: kb-goblet-squat 3x8 RIR3 30kg SINGLE_IMPLEMENT; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish | d1 2026-12-24 PM RUN EASY 23min (EASY) | d4 2026-12-27 PM RUN LONG 20min (LONG) | d5 2026-12-28 PM RUN EASY 23min (EASY) | d5 2026-12-28 AM STRENGTH_FULL_B 26min: kb-deadlift 3x5 RIR3 9kg SINGLE_IMPLEMENT; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-12-30 AM STRENGTH_FULL_A 26min: kb-goblet-squat 3x8 RIR3 30kg SINGLE_IMPLEMENT; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-12-31 PM RUN EASY 23min (EASY) | d4 2027-01-03 PM RUN LONG 25min (LONG) | d5 2027-01-04 PM RUN EASY 23min (EASY) | d5 2027-01-04 AM STRENGTH_FULL_B 26min: kb-deadlift 3x5 RIR3 9kg SINGLE_IMPLEMENT; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G223

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-17","weeks":8,"asOf":"2026-12-16","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-01"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-02-01"},"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":112,"longestRunMinutes":76,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x6 0KG BODYWEIGHT","hip-thrust-db 2x8 20KG PER_HAND"],"equipment":["DUMBBELLS","BODYWEIGHT","BARBELL","PULL_UP_BAR","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,5,6],"strengthDays":[0,1,2,3,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":48,"strengthMinutes":66,"longRunDay":0,"longRunMinutes":139,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-12-17 AM RUN LONG 45min (LONG) | d0 2026-12-17 PM STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 establish; hip-thrust-db 2x8 RIR3 20kg PER_HAND; db-split-squat 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-18 AM RUN EASY 15min (EASY) | d1 2026-12-18 PM STRENGTH_UPPER 29min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-12-19 PM STRENGTH_LOWER_B 26min: hip-thrust-db 2x8 RIR3 20kg PER_HAND; db-split-squat 2x8 RIR3 establish; seated-calf-raise-db 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2026-12-20 AM RUN EASY 15min (EASY) | d3 2026-12-20 PM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-overhead-triceps-extension 2x10 RIR3 establish | d4 2026-12-21 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d5 2026-12-22 AM RUN EASY 15min (EASY) | d6 2026-12-23 AM RUN EASY 15min (EASY)
- Week 1 (BUILD): d0 2026-12-24 AM RUN LONG 45min (LONG) | d0 2026-12-24 PM STRENGTH_LOWER 32min: goblet-squat 3x8 RIR3 last logged; hip-thrust-db 2x10 RIR3 20kg PER_HAND; db-split-squat 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d1 2026-12-25 AM RUN EASY 15min (EASY) | d1 2026-12-25 PM STRENGTH_UPPER 35min: db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d2 2026-12-26 PM STRENGTH_LOWER_B 29min: hip-thrust-db 2x10 RIR3 20kg PER_HAND; db-split-squat 3x10 RIR3 last logged; seated-calf-raise-db 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d3 2026-12-27 AM RUN EASY 15min (EASY) | d3 2026-12-27 PM STRENGTH_UPPER_B 27min: db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-overhead-triceps-extension 2x10 RIR3 last logged | d4 2026-12-28 PM STRENGTH_CORE 20min: dead-bug 2x12 RIR3 BW; db-calf-raise 2x10 RIR3 last logged; front-plank 2x12 RIR3 BW | d5 2026-12-29 AM RUN EASY 15min (EASY) | d6 2026-12-30 AM RUN EASY 15min (EASY)
- Week 5 (TAPER): d0 2027-01-21 AM RUN LONG 35min (LONG) | d0 2027-01-21 PM STRENGTH_LOWER 22min: goblet-squat 2x8 RIR3 last logged; hip-thrust-db 1x12 RIR3 20kg PER_HAND; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2027-01-22 AM RUN EASY 15min (EASY +strides) | d1 2027-01-22 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-lateral-raise 1x10 RIR3 last logged; db-biceps-curl 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d2 2027-01-23 PM STRENGTH_LOWER_B 20min: hip-thrust-db 1x12 RIR3 20kg PER_HAND; db-split-squat 2x10 RIR3 last logged; seated-calf-raise-db 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d3 2027-01-24 AM RUN EASY 15min (EASY +strides) | d3 2027-01-24 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-overhead-triceps-extension 1x10 RIR3 last logged | d4 2027-01-25 PM STRENGTH_CORE 14min: dead-bug 1x14 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; front-plank 1x14 RIR3 BW | d5 2027-01-26 AM RUN EASY 15min (EASY) | d6 2027-01-27 AM RUN EASY 15min (EASY)
- Week 6 (RACE_WEEK): d0 2027-01-28 AM RUN EASY 15min (EASY) | d0 2027-01-28 PM STRENGTH_LOWER 14min: goblet-squat 1x8 RIR4 last logged; hip-thrust-db 1x12 RIR4 20kg PER_HAND | d1 2027-01-29 AM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d3 2027-01-31 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d3 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d4 2027-02-01  RUN RACE 75min (RACE) | d5 RUN REST_BY_DESIGN | d6 2027-02-03 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G224

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":4,"asOf":"2026-11-18","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","BENCH","MACHINES","BANDS","DUMBBELLS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,4,5,6],"strengthDays":[3,4,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":53,"strengthMinutes":22,"longRunDay":1,"longRunMinutes":43,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-19 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-21 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d3 2026-11-21 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-11-22 AM STRENGTH_FULL_B 21min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 1x8 RIR3 establish | d4 2026-11-22 AM RUN WALK 20min (WALK) | d5 2026-11-23 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-23 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-11-24 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-24 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d1 2026-11-26 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-28 AM STRENGTH_FULL_A 21min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 1x8 RIR3 last logged | d3 2026-11-28 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-11-29 AM STRENGTH_FULL_B 21min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged | d4 2026-11-29 AM RUN WALK 20min (WALK) | d5 2026-11-30 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d5 2026-11-30 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-01 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2026-12-01 AM RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G225

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-14","weeks":8,"asOf":"2026-11-12","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-08"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-01-08"},"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":9,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,4,5],"strengthDays":[0,1,2,3,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":59,"strengthMinutes":32,"longRunDay":5,"longRunMinutes":138,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-14 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-15 AM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d2 2026-11-16 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d2 2026-11-16 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-17 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-11-18 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-19 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-19 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-11-21 AM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d1 2026-11-22 AM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d2 2026-11-23 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2026-11-23 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-24 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d4 2026-11-25 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-11-26 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d5 2026-11-26 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 6 (TAPER): d0 2026-12-26 AM STRENGTH_LOWER 15min: box-squat-bodyweight 1x10 RIR3 BW; glute-bridge 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d1 2026-12-27 AM STRENGTH_UPPER 15min: incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-28 AM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d2 2026-12-28 AM STRENGTH_LOWER_B 15min: glute-bridge 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW | d3 2026-12-29 AM STRENGTH_UPPER_B 15min: incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-30 AM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d5 2026-12-31 AM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d5 2026-12-31 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 7 (RACE_WEEK): d0 2027-01-02 AM STRENGTH_LOWER 14min: box-squat-bodyweight 1x10 RIR4 BW; glute-bridge 1x10 RIR4 BW | d1 STRENGTH REST_BY_DESIGN | d2 2027-01-04 AM RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-06 AM RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d5 2027-01-07 AM RUN WALK 20min (WALK) | d5 STRENGTH REST_BY_DESIGN | d6 2027-01-08  RUN RACE 150min (RACE, completion)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G226

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":4,"asOf":"2026-11-14","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-10"}},"strength":"NONE"},"event":{"kind":"10K","date":"2026-12-10"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":100,"longestRunMinutes":97,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["kb-goblet-squat 3x8 19KG SINGLE_IMPLEMENT","kb-deadlift 4x10 23KG SINGLE_IMPLEMENT","reverse-lunge 3x10 0KG BODYWEIGHT"],"equipment":["BENCH","KETTLEBELL","BODYWEIGHT","BANDS","MACHINES","PULL_UP_BAR","RACK"],"pause":{"nonclinical":true,"weeks":3,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":88,"strengthMinutes":46,"longRunDay":4,"longRunMinutes":114,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · SPECIFIC · RACE_WEEK
- Week 0 (BUILD): d1 2026-11-17 PM RUN EASY 15min (EASY) | d2 2026-11-18 PM RUN EASY 15min (EASY) | d3 2026-11-19 PM RUN WALK 20min (WALK) | d4 2026-11-20 PM RUN LONG 35min (LONG) | d6 2026-11-22 PM RUN EASY 15min (EASY)
- Week 1 (SPECIFIC): d1 2026-11-24 PM RUN EASY 15min (EASY) | d2 2026-11-25 PM RUN EASY 15min (EASY) | d3 2026-11-26 PM RUN WALK 20min (WALK) | d4 2026-11-27 PM RUN LONG 35min (LONG) | d6 2026-11-29 PM RUN EASY 15min (EASY)
- Week 2 (SPECIFIC): d1 2026-12-01 PM RUN QUALITY 34min (THRESHOLD 3x5'/2') | d2 2026-12-02 PM RUN EASY 20min (EASY +strides) | d3 2026-12-03 PM RUN WALK 20min (WALK) | d4 2026-12-04 PM RUN EASY 15min (EASY) | d6 2026-12-06 PM RUN EASY 15min (EASY)
- Week 3 (RACE_WEEK): d1 2026-12-08 PM RUN EASY 15min (EASY) | d2 2026-12-09 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d3 2026-12-10  RUN RACE 75min (RACE) | d4 RUN REST_BY_DESIGN | d6 2026-12-13 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G227

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-10","weeks":16,"asOf":"2026-12-07","tz":330,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":230,"longestRunMinutes":71,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["kb-goblet-squat 4x8 29KG SINGLE_IMPLEMENT","barbell-rdl 4x12 103KG TOTAL","db-step-up 4x8 7KG PER_HAND"],"equipment":["BODYWEIGHT","MACHINES","DUMBBELLS","PULL_UP_BAR","KETTLEBELL","BENCH","BANDS","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3],"strengthDays":[2,3,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":68,"strengthMinutes":54,"longRunDay":3,"longRunMinutes":124,"sameTurnConfirmed":true}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G228

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-24","weeks":12,"asOf":"2026-12-24","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":220,"longestRunMinutes":38,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BARBELL","BENCH","BODYWEIGHT","DUMBBELLS","KETTLEBELL","PULL_UP_BAR","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":62,"strengthMinutes":39,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-25 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-12-26 PM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-28 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-29 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-30 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-01 PM STRENGTH_FULL_A 31min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2027-01-02 PM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2027-01-04 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d5 2027-01-05 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d6 2027-01-06 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G229

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":4,"asOf":"2026-12-02","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":156,"longestRunMinutes":33,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,5],"strengthDays":[1,2,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":64,"strengthMinutes":24,"longRunDay":1,"longRunMinutes":58,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-12-05 PM RUN LONG 30min (LONG) | d1 2026-12-05 AM STRENGTH_UPPER 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-06 AM STRENGTH_LOWER 20min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW | d3 2026-12-07 AM STRENGTH_FULL_B 21min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d5 2026-12-09 PM RUN EASY 33min (EASY)
- Week 1 (DEVELOPMENT): d1 2026-12-12 PM RUN LONG 35min (LONG) | d1 2026-12-12 AM STRENGTH_UPPER 18min: incline-push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-12-13 AM STRENGTH_LOWER 21min: box-squat-bodyweight 2x7 RIR3 BW; glute-bridge 2x12 RIR3 BW; reverse-lunge 1x14 RIR3 BW | d3 2026-12-14 AM STRENGTH_FULL_B 22min: glute-bridge 2x12 RIR3 BW; incline-push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW | d5 2026-12-16 PM RUN EASY 33min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G230

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":12,"asOf":"2026-12-30","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":40,"longestRunMinutes":42,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["goblet-squat 2x8 19KG PER_HAND"],"equipment":["DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1],"strengthDays":[1,2],"runTurn":"AM","strengthTurn":"AM","runMinutes":64,"strengthMinutes":20,"longRunDay":0,"longRunMinutes":42,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-02 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-03 AM STRENGTH_FULL_A 18min: goblet-squat 2x6 RIR3 19kg PER_HAND; db-floor-press 1x5 RIR3 establish; db-row 1x5 RIR3 establish | d1 2027-01-03 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2027-01-04 AM STRENGTH_FULL_B 18min: db-rdl 2x5 RIR3 establish; db-row 1x5 RIR3 establish; db-floor-press 1x5 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2027-01-09 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-10 AM STRENGTH_FULL_A 18min: goblet-squat 2x6 RIR3 19kg PER_HAND; db-floor-press 1x5 RIR3 last logged; db-row 1x5 RIR3 last logged | d1 2027-01-10 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2027-01-11 AM STRENGTH_FULL_B 18min: db-rdl 2x5 RIR3 last logged; db-row 1x5 RIR3 last logged; db-floor-press 1x5 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G231

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":8,"asOf":"2026-12-25","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":220,"longestRunMinutes":74,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x5 9KG SINGLE_IMPLEMENT","kb-deadlift 4x8 28KG SINGLE_IMPLEMENT","db-step-up 2x12 7KG PER_HAND"],"equipment":["RACK","KETTLEBELL","PULL_UP_BAR","BODYWEIGHT","MACHINES","DUMBBELLS","BENCH","BARBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":67,"strengthMinutes":21,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2026-12-29 AM STRENGTH_LOWER 19min: kb-goblet-squat 2x5 RIR3 9kg SINGLE_IMPLEMENT; kb-deadlift 2x6 RIR3 28kg SINGLE_IMPLEMENT | d3 2026-12-30 AM STRENGTH_UPPER 19min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish | d4 2026-12-31 AM STRENGTH_LOWER_B 19min: kb-deadlift 2x6 RIR3 28kg SINGLE_IMPLEMENT; db-step-up 2x6 RIR3 7kg PER_HAND | d5 2027-01-01 AM STRENGTH_UPPER_B 19min: db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish
- Week 1 (DEVELOPMENT): d2 2027-01-05 AM STRENGTH_LOWER 19min: kb-goblet-squat 2x5 RIR3 9kg SINGLE_IMPLEMENT; kb-deadlift 2x6 RIR3 28kg SINGLE_IMPLEMENT | d3 2027-01-06 AM STRENGTH_UPPER 19min: db-floor-press 2x5 RIR3 last logged; db-row 2x5 RIR3 last logged | d4 2027-01-07 AM STRENGTH_LOWER_B 19min: kb-deadlift 2x6 RIR3 28kg SINGLE_IMPLEMENT; db-step-up 2x6 RIR3 7kg PER_HAND | d5 2027-01-08 AM STRENGTH_UPPER_B 19min: db-row 2x5 RIR3 last logged; db-floor-press 2x5 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation · non-blocking differences: LOAD_CONVENTION_EQUIVALENT

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G232

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, CLINICAL_SIGNAL, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-03","weeks":12,"asOf":"2026-12-01","tz":330,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-12"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2027-02-12"},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":180,"longestRunMinutes":26,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x6 0KG BODYWEIGHT","glute-bridge 3x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":4,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4],"strengthDays":[2],"runTurn":"AM","strengthTurn":"AM","runMinutes":88,"strengthMinutes":39,"longRunDay":4,"longRunMinutes":62,"sameTurnConfirmed":true}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G233

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":12,"asOf":"2026-12-06","tz":330,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":92,"longestRunMinutes":69,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","PULL_UP_BAR","BANDS","DUMBBELLS","KETTLEBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":46,"strengthMinutes":36,"longRunDay":5,"longRunMinutes":120,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G234

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":12,"asOf":"2026-12-05","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BARBELL","KETTLEBELL","MACHINES","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[0,1,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":64,"strengthMinutes":47,"longRunDay":0,"longRunMinutes":81,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-08 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-08 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-09 AM RUN WALK 20min (WALK) | d1 2026-12-09 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-10 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-12 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-13 AM RUN WALK 20min (WALK) | d5 2026-12-13 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-14 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-15 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-15 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-16 AM RUN WALK 20min (WALK) | d1 2026-12-16 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-17 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-19 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-20 AM RUN WALK 20min (WALK) | d5 2026-12-20 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2026-12-21 AM RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G235

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":4,"asOf":"2026-11-27","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":25,"strengthMinutes":51,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-11-30 AM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x5 RIR3 BW; push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-01 AM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2026-12-07 AM STRENGTH_FULL_A 34min: box-squat-bodyweight 3x5 RIR3 BW; push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-08 AM STRENGTH_FULL_B 34min: glute-bridge 3x5 RIR3 BW; push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G236

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-13","weeks":8,"asOf":"2026-11-10","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES"],"pause":{"nonclinical":true,"weeks":9,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2],"strengthDays":[2,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":53,"strengthMinutes":42,"longRunDay":0,"longRunMinutes":107,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-13 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-15 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-15 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d5 2026-11-18 AM STRENGTH_FULL_B 31min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; band-biceps-curl 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-20 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-11-22 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-11-22 AM STRENGTH_FULL_A 31min: leg-press 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2026-11-25 AM STRENGTH_FULL_B 31min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; band-biceps-curl 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G237

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-05","weeks":4,"asOf":"2026-12-03","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":52,"longestRunMinutes":75,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","DUMBBELLS","BODYWEIGHT","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[0,1,3,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":59,"strengthMinutes":28,"longRunDay":4,"longRunMinutes":64,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-05 PM RUN EASY 15min (EASY) | d0 2026-12-05 AM STRENGTH_LOWER 22min: goblet-squat 2x5 RIR3 establish; db-rdl 2x5 RIR3 establish; db-split-squat 2x7 RIR3 establish | d1 2026-12-06 PM RUN EASY 15min (EASY) | d1 2026-12-06 AM STRENGTH_UPPER 22min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-overhead-press 2x7 RIR3 establish | d2 2026-12-07 PM RUN WALK 20min (WALK) | d3 2026-12-08 PM RUN WALK 20min (WALK) | d3 2026-12-08 AM STRENGTH_LOWER_B 22min: db-rdl 2x5 RIR3 establish; db-split-squat 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish | d4 2026-12-09 PM RUN LONG 20min (LONG) | d4 2026-12-09 AM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-12 PM RUN EASY 15min (EASY) | d0 2026-12-12 AM STRENGTH_LOWER 28min: goblet-squat 3x5 RIR3 last logged; db-rdl 3x5 RIR3 last logged; db-split-squat 2x7 RIR3 last logged | d1 2026-12-13 PM RUN EASY 15min (EASY) | d1 2026-12-13 AM STRENGTH_UPPER 28min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-overhead-press 2x7 RIR3 last logged | d2 2026-12-14 PM RUN WALK 20min (WALK) | d3 2026-12-15 PM RUN WALK 20min (WALK) | d3 2026-12-15 AM STRENGTH_LOWER_B 28min: db-rdl 3x5 RIR3 last logged; db-split-squat 3x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged | d4 2026-12-16 PM RUN LONG 20min (LONG) | d4 2026-12-16 AM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G238

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":4,"asOf":"2026-11-20","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-08"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2026-12-08"},"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 3x5 40KG TOTAL","db-rdl 3x12 27KG PER_HAND","reverse-lunge 2x12 0KG BODYWEIGHT"],"equipment":["BENCH","BANDS","DUMBBELLS","PULL_UP_BAR","RACK","BODYWEIGHT","BARBELL","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":39,"strengthMinutes":22,"longRunDay":1,"longRunMinutes":114,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-23 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-24 PM RUN WALK 20min (WALK) | d2 2026-11-25 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-11-27 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-11-29 PM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-11-30 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-01 PM RUN WALK 20min (WALK) | d2 2026-12-02 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-04 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-06 PM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-11-30 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-01 PM RUN WALK 20min (WALK) | d2 2026-12-02 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-04 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-06 PM RUN WALK 20min (WALK)
- Week 2 (RACE_WEEK): d0 2026-12-07 PM RUN WALK 20min (WALK) | d1 2026-12-08  RUN RACE 150min (RACE, completion) | d2 RUN REST_BY_DESIGN | d4 2026-12-11 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-13 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G239

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":8,"asOf":"2027-01-06","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-25"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-02-25"},"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,5],"strengthDays":[1,2,3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":51,"strengthMinutes":47,"longRunDay":2,"longRunMinutes":37,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G240

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":4,"asOf":"2026-12-20","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-10"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2027-01-10"},"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":168,"longestRunMinutes":57,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","DUMBBELLS","BANDS","PULL_UP_BAR","BODYWEIGHT","RACK","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4,6],"strengthDays":[0,1,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":71,"strengthMinutes":34,"longRunDay":4,"longRunMinutes":65,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-21 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-12-22 AM STRENGTH_FULL_B 25min: glute-bridge 2x5 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d1 2026-12-22 AM RUN EASY 55min (EASY) | d4 2026-12-25 AM RUN LONG 55min (LONG) | d5 2026-12-26 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-27 AM RUN EASY 55min (EASY)
- Week 1 (BUILD): d0 2026-12-28 AM STRENGTH_FULL_A 25min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-12-29 AM STRENGTH_FULL_B 25min: glute-bridge 2x5 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d1 2026-12-29 AM RUN EASY 55min (EASY) | d4 2027-01-01 AM RUN LONG 55min (LONG) | d5 2027-01-02 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d6 2027-01-03 AM RUN EASY 55min (EASY)
- Week 1 (BUILD): d0 2026-12-28 AM STRENGTH_FULL_A 25min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-12-29 AM STRENGTH_FULL_B 25min: glute-bridge 2x5 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d1 2026-12-29 AM RUN EASY 55min (EASY) | d4 2027-01-01 AM RUN LONG 55min (LONG) | d5 2027-01-02 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d6 2027-01-03 AM RUN EASY 55min (EASY)
- Week 2 (RACE_WEEK): d0 2027-01-04 AM STRENGTH_LOWER 13min: goblet-squat 1x5 RIR4 last logged; glute-bridge 1x7 RIR4 BW | d1 STRENGTH REST_BY_DESIGN | d1 2027-01-05 AM RUN EASY 30min (EASY) | d4 2027-01-08 AM RUN EASY 30min (EASY) | d5 STRENGTH REST_BY_DESIGN | d6 2027-01-10  RUN RACE 150min (RACE, completion)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G241

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":4,"asOf":"2026-12-30","tz":0,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4],"strengthDays":[1,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":29,"strengthMinutes":40,"longRunDay":4,"longRunMinutes":85,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G242

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":8,"asOf":"2026-12-06","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":28,"longestRunMinutes":37,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x10 0KG BODYWEIGHT","kb-deadlift 2x6 11KG SINGLE_IMPLEMENT"],"equipment":["DUMBBELLS","BENCH","PULL_UP_BAR","KETTLEBELL","BODYWEIGHT","MACHINES","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1],"runTurn":"PM","strengthTurn":"PM","runMinutes":55,"strengthMinutes":24,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-09 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x10 RIR3 BW; db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish | d1 2026-12-10 PM STRENGTH_FULL_B 24min: kb-deadlift 2x6 RIR3 11kg SINGLE_IMPLEMENT; db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-12-16 PM STRENGTH_FULL_A 22min: box-squat-bodyweight 2x12 RIR3 BW; db-bench-press 2x10 RIR3 last logged; db-row 1x10 RIR3 last logged | d1 2026-12-17 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 11kg SINGLE_IMPLEMENT; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G243

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":12,"asOf":"2026-12-04","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":255,"longestRunMinutes":66,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,5,6],"strengthDays":[0,1,2,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":48,"strengthMinutes":28,"longRunDay":6,"longRunMinutes":134,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-04 PM RUN EASY 45min (EASY) | d0 2026-12-04 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-12-05 PM RUN EASY 45min (EASY) | d1 2026-12-05 PM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d2 2026-12-06 PM RUN EASY 45min (EASY) | d2 2026-12-06 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-12-08 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-09 PM RUN EASY 45min (EASY) | d5 2026-12-09 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-10 PM RUN LONG 65min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-12-11 PM RUN EASY 45min (EASY) | d0 2026-12-11 PM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d1 2026-12-12 PM RUN EASY 45min (EASY) | d1 2026-12-12 PM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d2 2026-12-13 PM RUN EASY 45min (EASY) | d2 2026-12-13 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d4 2026-12-15 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d5 2026-12-16 PM RUN EASY 45min (EASY) | d5 2026-12-16 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-12-17 PM RUN LONG 65min (LONG)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G244

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":4,"asOf":"2026-12-29","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":31,"longestRunMinutes":70,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BARBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[4],"runTurn":"AM","strengthTurn":"AM","runMinutes":83,"strengthMinutes":35,"longRunDay":1,"longRunMinutes":58,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-29 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-30 AM RUN WALK 20min (WALK) | d2 2026-12-31 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2027-01-02 AM STRENGTH_FULL_A 30min: box-squat-bodyweight 2x5 RIR3 BW; push-up 2x5 RIR3 BW; inverted-row 2x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2027-01-02 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2027-01-03 AM RUN WALK 20min (WALK) | d6 2027-01-04 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2027-01-05 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-06 AM RUN WALK 20min (WALK) | d2 2027-01-07 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-09 AM STRENGTH_FULL_A 32min: box-squat-bodyweight 3x5 RIR3 BW; push-up 3x5 RIR3 BW; inverted-row 3x5 RIR3 BW | d4 2027-01-09 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-10 AM RUN WALK 20min (WALK) | d6 2027-01-11 AM RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G245

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":4,"asOf":"2026-12-27","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":37,"longestRunMinutes":46,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","DUMBBELLS","BODYWEIGHT","RACK","PULL_UP_BAR","BARBELL","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[3,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":58,"strengthMinutes":26,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d3 2026-12-31 AM STRENGTH_LOWER 21min: goblet-squat 2x10 RIR3 establish; db-rdl 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish | d4 2027-01-01 AM STRENGTH_UPPER 21min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; push-up 1x12 RIR3 BW | d6 2027-01-03 AM STRENGTH_FULL_B 24min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d3 2027-01-07 AM STRENGTH_LOWER 21min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged | d4 2027-01-08 AM STRENGTH_UPPER 21min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; push-up 1x12 RIR3 BW | d6 2027-01-10 AM STRENGTH_FULL_B 24min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G246

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":16,"asOf":"2026-11-07","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":285,"longestRunMinutes":47,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BODYWEIGHT","DUMBBELLS","KETTLEBELL","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":44,"strengthMinutes":51,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-10 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-11 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; push-up 1x10 RIR3 BW; kb-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-11-12 AM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-13 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-11-16 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-17 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-18 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; push-up 1x10 RIR3 BW; kb-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2026-11-19 AM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-20 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-11-23 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G247

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":4,"asOf":"2026-12-24","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BENCH","BARBELL","BANDS","MACHINES","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4],"strengthDays":[2],"runTurn":"AM","strengthTurn":"PM","runMinutes":34,"strengthMinutes":21,"longRunDay":4,"longRunMinutes":136,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-12-28 PM STRENGTH_FULL_A 21min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 1x8 RIR3 establish | d4 2026-12-30 AM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d2 2027-01-04 PM STRENGTH_FULL_A 21min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 1x8 RIR3 last logged | d4 2027-01-06 AM RUN EASY 20min (EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G248

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-27","weeks":12,"asOf":"2026-11-25","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":132,"longestRunMinutes":76,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["back-squat 2x12 30KG TOTAL","barbell-rdl 4x12 81KG TOTAL","db-split-squat 4x5 30KG PER_HAND"],"equipment":["BODYWEIGHT","KETTLEBELL","MACHINES","PULL_UP_BAR","DUMBBELLS","BANDS","BARBELL","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,3,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":60,"strengthMinutes":43,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-27 AM STRENGTH_LOWER 33min: back-squat 2x8 RIR3 30kg TOTAL; barbell-rdl 4x8 RIR3 81kg TOTAL; db-split-squat 4x5 RIR3 30kg PER_HAND; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-30 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; machine-chest-press 1x10 RIR3 establish; seated-cable-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2026-12-01 AM STRENGTH_LOWER_B 31min: barbell-rdl 4x8 RIR3 81kg TOTAL; db-split-squat 4x5 RIR3 30kg PER_HAND; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-02 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-04 AM STRENGTH_LOWER 33min: back-squat 2x8 RIR3 30kg TOTAL; barbell-rdl 4x8 RIR3 81kg TOTAL; db-split-squat 4x5 RIR3 30kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-07 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged; seated-cable-row 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2026-12-08 AM STRENGTH_LOWER_B 32min: barbell-rdl 4x8 RIR3 81kg TOTAL; db-split-squat 4x5 RIR3 30kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-09 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G249

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":16,"asOf":"2026-11-25","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":230,"longestRunMinutes":85,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["goblet-squat 5x10 17KG PER_HAND","kb-deadlift 3x10 19KG SINGLE_IMPLEMENT"],"equipment":["BANDS","BARBELL","BENCH","DUMBBELLS","RACK","KETTLEBELL","MACHINES","BODYWEIGHT","PULL_UP_BAR"],"pause":{"nonclinical":true,"weeks":4,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,5],"strengthDays":[3],"runTurn":"PM","strengthTurn":"AM","runMinutes":68,"strengthMinutes":70,"longRunDay":1,"longRunMinutes":86,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-29 PM RUN EASY 15min (EASY) | d2 2026-11-30 PM RUN EASY 15min (EASY) | d3 2026-12-01 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-03 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d1 2026-12-06 PM RUN EASY 20min (EASY) | d2 2026-12-07 PM RUN EASY 20min (EASY) | d3 2026-12-08 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-10 PM RUN EASY 20min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G250

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":12,"asOf":"2026-12-27","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":171,"longestRunMinutes":82,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4],"strengthDays":[0],"runTurn":"PM","strengthTurn":"AM","runMinutes":39,"strengthMinutes":63,"longRunDay":0,"longRunMinutes":111,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-27 PM RUN LONG 70min (LONG) | d0 2026-12-27 AM STRENGTH_FULL_A 28min: leg-press 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-28 PM RUN EASY 30min (EASY) | d3 2026-12-30 PM RUN EASY 30min (EASY) | d4 2026-12-31 PM RUN EASY 30min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-03 PM RUN LONG 70min (LONG) | d0 2027-01-03 AM STRENGTH_FULL_A 28min: leg-press 2x10 RIR3 last logged; machine-chest-press 2x10 RIR3 last logged; seated-cable-row 2x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2027-01-04 PM RUN EASY 30min (EASY) | d3 2027-01-06 PM RUN EASY 30min (EASY) | d4 2027-01-07 PM RUN EASY 30min (EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G251

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, OUT_OF_SCOPE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":4,"asOf":"2026-12-04","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":235,"longestRunMinutes":81,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[3],"runTurn":"AM","strengthTurn":"AM","runMinutes":72,"strengthMinutes":26,"longRunDay":1,"longRunMinutes":110,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-07 AM RUN EASY 30min (EASY) | d1 2026-12-08 AM RUN LONG 80min (LONG) | d2 2026-12-09 AM RUN EASY 30min (EASY) | d3 2026-12-10 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d4 2026-12-11 AM RUN EASY 30min (EASY) | d5 2026-12-12 AM RUN EASY 30min (EASY) | d6 2026-12-13 AM RUN EASY 30min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-14 AM RUN EASY 30min (EASY) | d1 2026-12-15 AM RUN LONG 80min (LONG) | d2 2026-12-16 AM RUN EASY 30min (EASY) | d3 2026-12-17 AM STRENGTH_FULL_A 21min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d4 2026-12-18 AM RUN EASY 30min (EASY) | d5 2026-12-19 AM RUN EASY 30min (EASY) | d6 2026-12-20 AM RUN EASY 30min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G252

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-22","weeks":8,"asOf":"2026-12-19","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4],"strengthDays":[0,1,2,3],"runTurn":"PM","strengthTurn":"PM","runMinutes":28,"strengthMinutes":40,"longRunDay":4,"longRunMinutes":128,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-22 PM STRENGTH_LOWER 25min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-23 PM STRENGTH_UPPER 19min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-24 PM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-25 PM STRENGTH_UPPER_B 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-26 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-29 PM STRENGTH_LOWER 25min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-30 PM STRENGTH_UPPER 19min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-31 PM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-01 PM STRENGTH_UPPER_B 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-02 PM RUN EASY 20min (EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G253

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":16,"asOf":"2026-11-15","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-02"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-03-02"},"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":82,"longestRunMinutes":82,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x8 0KG BODYWEIGHT","glute-bridge 2x6 0KG BODYWEIGHT"],"equipment":["BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4,5],"strengthDays":[1,2,3,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":43,"strengthMinutes":59,"longRunDay":1,"longRunMinutes":64,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d0 2026-11-15 PM RUN EASY 15min (EASY) | d1 2026-11-16 PM RUN LONG 35min (LONG) | d1 2026-11-16 PM STRENGTH_LOWER 34min: box-squat-bodyweight 4x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-11-17 PM STRENGTH_UPPER 26min: incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; band-biceps-curl 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2026-11-18 PM STRENGTH_LOWER_B 26min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2026-11-19 PM RUN EASY 15min (EASY) | d4 2026-11-19 PM STRENGTH_UPPER_B 22min: band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; band-biceps-curl 2x10 RIR3 BW | d5 2026-11-20 PM RUN EASY 15min (EASY) | d5 2026-11-20 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW
- Week 1 (BUILD): d0 2026-11-22 PM RUN EASY 15min (EASY) | d1 2026-11-23 PM RUN LONG 35min (LONG) | d1 2026-11-23 PM STRENGTH_LOWER 39min: box-squat-bodyweight 4x10 RIR3 BW; glute-bridge 3x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d2 2026-11-24 PM STRENGTH_UPPER 32min: incline-push-up 3x10 RIR3 BW; band-row 3x10 RIR3 BW; band-biceps-curl 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d3 2026-11-25 PM STRENGTH_LOWER_B 33min: glute-bridge 3x10 RIR3 BW; reverse-lunge 3x12 RIR3 BW; bent-knee-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d4 2026-11-26 PM RUN EASY 15min (EASY) | d4 2026-11-26 PM STRENGTH_UPPER_B 28min: band-row 3x10 RIR3 BW; incline-push-up 3x10 RIR3 BW; band-biceps-curl 2x12 RIR3 BW | d5 2026-11-27 PM RUN EASY 15min (EASY) | d5 2026-11-27 PM STRENGTH_CORE 20min: dead-bug 2x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; front-plank 2x12 RIR3 BW
- Week 14 (TAPER): d0 2027-02-21 PM RUN EASY 20min (EASY +strides) | d1 2027-02-22 PM RUN LONG 40min (LONG) | d1 2027-02-22 PM STRENGTH_LOWER 26min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x16 RIR3 BW; reverse-lunge 1x16 RIR3 BW; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d2 2027-02-23 PM STRENGTH_UPPER 24min: incline-push-up 2x16 RIR3 BW; band-row 2x12 RIR3 BW; band-biceps-curl 1x12 RIR3 BW; dead-bug 1x16 RIR3 BW | d3 2027-02-24 PM STRENGTH_LOWER_B 15min: glute-bridge 1x16 RIR4 BW; reverse-lunge 1x16 RIR4 BW | d4 2027-02-25 PM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d5 2027-02-26 PM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d5 STRENGTH REST_BY_DESIGN
- Week 15 (RACE_WEEK): d0 2027-02-28 PM RUN EASY 15min (EASY) | d1 2027-03-01 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d1 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d2 2027-03-02  RUN RACE 75min (RACE) | d3 STRENGTH REST_BY_DESIGN | d4 2027-03-04 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 STRENGTH REST_BY_DESIGN | d5 2027-03-05 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G254

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":12,"asOf":"2026-12-06","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":132,"longestRunMinutes":38,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":43,"strengthMinutes":42,"longRunDay":4,"longRunMinutes":76,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d4 2026-12-10 AM RUN LONG 35min (LONG)
- Week 1 (DEVELOPMENT): d4 2026-12-17 AM RUN LONG 40min (LONG)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G255

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-13","weeks":16,"asOf":"2026-11-12","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":108,"longestRunMinutes":77,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x5 0KG BODYWEIGHT"],"equipment":["PULL_UP_BAR","RACK","BARBELL","MACHINES","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":59,"strengthMinutes":48,"longRunDay":3,"longRunMinutes":91,"sameTurnConfirmed":true}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G256

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":4,"asOf":"2027-01-03","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":44,"longestRunMinutes":41,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","DUMBBELLS","RACK","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[2,3,4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":60,"strengthMinutes":37,"longRunDay":3,"longRunMinutes":143,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2027-01-06 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2027-01-07 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2027-01-07 AM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-08 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-09 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-10 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2027-01-13 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-14 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-14 AM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-15 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d5 2027-01-16 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2027-01-17 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G257

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-14","weeks":8,"asOf":"2026-11-14","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-07"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-01-07"},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":155,"longestRunMinutes":58,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,6],"strengthDays":[2],"runTurn":"AM","strengthTurn":"PM","runMinutes":61,"strengthMinutes":40,"longRunDay":6,"longRunMinutes":73,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-14 AM RUN EASY 30min (EASY) | d1 2026-11-15 AM RUN EASY 30min (EASY) | d2 2026-11-16 AM RUN EASY 30min (EASY) | d2 2026-11-16 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d6 2026-11-20 AM RUN LONG 55min (LONG)
- Week 1 (BUILD): d0 2026-11-21 AM RUN EASY 30min (EASY) | d1 2026-11-22 AM RUN EASY 30min (EASY) | d2 2026-11-23 AM RUN EASY 30min (EASY) | d2 2026-11-23 PM STRENGTH_FULL_A 29min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2026-11-27 AM RUN LONG 55min (LONG)
- Week 6 (TAPER): d0 2026-12-26 AM RUN EASY 30min (EASY +strides) | d1 2026-12-27 AM RUN QUALITY 28min (TEN_K_SPECIFIC 3x3'/2') | d2 2026-12-28 AM RUN EASY 30min (EASY +strides) | d2 2026-12-28 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x12 RIR3 BW; incline-push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; single-leg-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2027-01-01 AM RUN EASY 20min (EASY)
- Week 7 (RACE_WEEK): d0 2027-01-02 AM RUN EASY 20min (EASY) | d1 2027-01-03 AM RUN EASY 20min (EASY) | d2 2027-01-04 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d2 2027-01-04 PM STRENGTH_FULL_A 14min: box-squat-bodyweight 1x12 RIR4 BW; incline-push-up 1x12 RIR4 BW | d5 2027-01-07  RUN RACE 75min (RACE) | d6 RUN REST_BY_DESIGN

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G258

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":4,"asOf":"2026-12-12","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","BODYWEIGHT","DUMBBELLS","BARBELL","RACK","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":36,"strengthMinutes":31,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-12 AM STRENGTH_LOWER 21min: goblet-squat 2x10 RIR3 establish; db-rdl 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish | d1 2026-12-13 AM STRENGTH_UPPER 21min: db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 1x12 RIR3 establish | d2 2026-12-14 AM STRENGTH_LOWER_B 21min: db-rdl 2x10 RIR3 establish; db-split-squat 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW | d5 2026-12-17 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-19 AM STRENGTH_LOWER 21min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged | d1 2026-12-20 AM STRENGTH_UPPER 21min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged | d2 2026-12-21 AM STRENGTH_LOWER_B 21min: db-rdl 2x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW | d5 2026-12-24 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G259

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":12,"asOf":"2026-12-31","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":66,"strengthMinutes":20,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-31 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2027-01-01 AM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d5 2027-01-05 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-06 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-07 AM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d1 2027-01-08 AM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d5 2027-01-12 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2027-01-13 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G260

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":8,"asOf":"2026-11-09","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2],"runTurn":"AM","strengthTurn":"PM","runMinutes":76,"strengthMinutes":37,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-11-12 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; scapular-pull-up 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2026-11-19 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; scapular-pull-up 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G261

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":16,"asOf":"2026-12-09","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":102,"longestRunMinutes":65,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["back-squat 2x5 109KG TOTAL","db-rdl 5x12 20KG PER_HAND","db-split-squat 3x5 60KG TOTAL"],"equipment":["BENCH","RACK","KETTLEBELL","BARBELL","DUMBBELLS","PULL_UP_BAR","BODYWEIGHT","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":65,"strengthMinutes":55,"longRunDay":0,"longRunMinutes":148,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-09 PM RUN LONG 65min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-12-16 PM RUN LONG 65min (LONG)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G262

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":12,"asOf":"2026-11-14","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":147,"longestRunMinutes":88,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":16,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[3,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":62,"strengthMinutes":41,"sameTurnConfirmed":false}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: POPULATION_OUTSIDE_V1_AGE_RANGE

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G263

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":8,"asOf":"2026-12-08","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","RACK","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4,5,6],"strengthDays":[3],"runTurn":"AM","strengthTurn":"AM","runMinutes":28,"strengthMinutes":73,"longRunDay":6,"longRunMinutes":120,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-09 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-10 AM RUN WALK 20min (WALK) | d3 2026-12-12 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d4 2026-12-13 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-14 AM RUN WALK 20min (WALK) | d6 2026-12-15 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-16 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-17 AM RUN WALK 20min (WALK) | d3 2026-12-19 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-20 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-21 AM RUN WALK 20min (WALK) | d6 2026-12-22 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G264

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-25","weeks":8,"asOf":"2026-11-25","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":152,"longestRunMinutes":66,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","RACK","BODYWEIGHT","MACHINES","PULL_UP_BAR","BENCH","KETTLEBELL","DUMBBELLS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":77,"strengthMinutes":71,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-25 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-11-30 AM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 1x10 RIR3 establish; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-01 AM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-02 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-07 AM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-08 AM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G265

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-24","weeks":4,"asOf":"2026-12-24","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":255,"longestRunMinutes":83,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x6 0KG BODYWEIGHT","hip-thrust-db 2x10 7KG PER_HAND"],"equipment":["DUMBBELLS","BANDS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":62,"strengthMinutes":45,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-24 PM STRENGTH_LOWER 37min: box-squat-bodyweight 5x6 RIR3 BW; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2026-12-25 PM STRENGTH_UPPER 28min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; incline-push-up 2x7 RIR3 BW; one-arm-db-row 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2026-12-26 PM STRENGTH_LOWER_B 25min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-12-29 PM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2026-12-30 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-31 PM STRENGTH_LOWER 41min: box-squat-bodyweight 5x6 RIR3 BW; glute-bridge 3x7 RIR3 BW; reverse-lunge 2x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d1 2027-01-01 PM STRENGTH_UPPER 35min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; incline-push-up 2x9 RIR3 BW; one-arm-db-row 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d2 2027-01-02 PM STRENGTH_LOWER_B 32min: glute-bridge 3x7 RIR3 BW; reverse-lunge 3x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d5 2027-01-05 PM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; dead-bug 2x9 RIR3 BW | d6 2027-01-06 PM STRENGTH_CORE 19min: dead-bug 2x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; front-plank 2x9 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G266

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":16,"asOf":"2026-12-12","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-22"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-03-22"},"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","KETTLEBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2],"strengthDays":[0,1,2,3,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":67,"strengthMinutes":27,"longRunDay":2,"longRunMinutes":150,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-13 AM STRENGTH_LOWER 21min: kb-goblet-squat 2x10 RIR3 establish; kb-deadlift 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW | d1 2026-12-14 AM STRENGTH_UPPER 21min: push-up 2x10 RIR3 BW; kb-row 2x10 RIR3 establish; incline-push-up 1x12 RIR3 BW | d2 2026-12-15 AM STRENGTH_LOWER_B 21min: kb-deadlift 2x10 RIR3 establish; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x12 RIR3 BW | d2 2026-12-15 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-16 AM STRENGTH_UPPER_B 21min: kb-row 2x10 RIR3 establish; push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-18 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 1 (BUILD): d0 2026-12-20 AM STRENGTH_LOWER 21min: kb-goblet-squat 2x10 RIR3 last logged; kb-deadlift 2x10 RIR3 last logged; reverse-lunge 1x12 RIR3 BW | d1 2026-12-21 AM STRENGTH_UPPER 21min: push-up 2x10 RIR3 BW; kb-row 2x10 RIR3 last logged; incline-push-up 1x12 RIR3 BW | d2 2026-12-22 AM STRENGTH_LOWER_B 21min: kb-deadlift 2x10 RIR3 last logged; reverse-lunge 2x12 RIR3 BW; bent-knee-calf-raise 1x12 RIR3 BW | d2 2026-12-22 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-23 AM STRENGTH_UPPER_B 21min: kb-row 2x10 RIR3 last logged; push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-25 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 13 (TAPER): d0 2027-03-14 AM STRENGTH_LOWER 16min: kb-goblet-squat 1x10 RIR3 last logged; kb-deadlift 1x10 RIR3 last logged; reverse-lunge 1x16 RIR3 BW | d1 2027-03-15 AM STRENGTH_UPPER 16min: push-up 1x16 RIR3 BW; kb-row 1x10 RIR3 last logged; incline-push-up 1x16 RIR3 BW | d2 2027-03-16 AM STRENGTH_LOWER_B 14min: kb-deadlift 1x10 RIR4 last logged; reverse-lunge 1x16 RIR4 BW | d2 2027-03-16 AM RUN EASY 15min (EASY) | d3 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN
- Week 14 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d1 2027-03-22  RUN RACE 150min (RACE, completion) | d2 STRENGTH REST_BY_DESIGN | d2 RUN REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G267

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":8,"asOf":"2026-11-18","tz":0,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":220,"longestRunMinutes":90,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BARBELL","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":79,"strengthMinutes":61,"longRunDay":2,"longRunMinutes":125,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G268

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-17","weeks":4,"asOf":"2026-12-17","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":168,"longestRunMinutes":71,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["leg-press 3x5 110KG TOTAL","glute-bridge 4x6 0KG BODYWEIGHT"],"equipment":["PULL_UP_BAR","KETTLEBELL","MACHINES"],"pause":{"nonclinical":true,"weeks":8,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5],"strengthDays":[0,1,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":22,"strengthMinutes":62,"longRunDay":0,"longRunMinutes":32,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-17 PM RUN EASY 15min (EASY) | d0 2026-12-17 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; incline-push-up 1x10 RIR3 BW; kb-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2026-12-18 PM RUN WALK 20min (WALK) | d1 2026-12-18 AM STRENGTH_LOWER 24min: kb-goblet-squat 2x8 RIR3 establish; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; hip-abduction-machine 1x10 RIR3 establish | d2 2026-12-19 PM RUN EASY 15min (EASY) | d4 2026-12-21 PM RUN EASY 15min (EASY) | d5 2026-12-22 PM RUN WALK 20min (WALK) | d6 2026-12-23 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-24 PM RUN EASY 20min (EASY) | d0 2026-12-24 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW; kb-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d1 2026-12-25 PM RUN WALK 20min (WALK) | d1 2026-12-25 AM STRENGTH_LOWER 24min: kb-goblet-squat 2x8 RIR3 last logged; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; hip-abduction-machine 1x10 RIR3 last logged | d2 2026-12-26 PM RUN EASY 20min (EASY) | d4 2026-12-28 PM RUN EASY 20min (EASY) | d5 2026-12-29 PM RUN WALK 20min (WALK) | d6 2026-12-30 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G269

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-24","weeks":4,"asOf":"2026-11-22","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":144,"longestRunMinutes":46,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT","PULL_UP_BAR","BANDS","KETTLEBELL","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,5],"strengthDays":[0,1,2,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":31,"strengthMinutes":53,"longRunDay":0,"longRunMinutes":95,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-24 PM RUN LONG 45min (LONG) | d0 2026-11-24 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d1 2026-11-25 PM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 establish; db-rdl 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-26 PM STRENGTH_LOWER_B 23min: db-rdl 2x10 RIR3 establish; db-split-squat 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-29 PM RUN EASY 31min (EASY) | d5 2026-11-29 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-01 PM RUN LONG 45min (LONG) | d0 2026-12-01 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d1 2026-12-02 PM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-03 PM STRENGTH_LOWER_B 23min: db-rdl 2x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-06 PM RUN EASY 31min (EASY) | d5 2026-12-06 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G270

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":16,"asOf":"2027-01-02","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-16"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-04-16"},"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":177,"longestRunMinutes":50,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x10 0KG BODYWEIGHT"],"equipment":["BARBELL","DUMBBELLS","BENCH","PULL_UP_BAR","KETTLEBELL","MACHINES","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5,6],"strengthDays":[2],"runTurn":"PM","strengthTurn":"PM","runMinutes":77,"strengthMinutes":64,"longRunDay":6,"longRunMinutes":94,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d2 2027-01-07 PM STRENGTH_FULL_A 39min: box-squat-bodyweight 5x10 RIR3 BW; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2027-01-10 PM RUN EASY 50min (EASY) | d6 2027-01-11 PM RUN LONG 50min (LONG)
- Week 1 (BUILD): d2 2027-01-14 PM STRENGTH_FULL_A 45min: box-squat-bodyweight 5x12 RIR3 BW; db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d5 2027-01-17 PM RUN EASY 50min (EASY) | d6 2027-01-18 PM RUN LONG 55min (LONG)
- Week 13 (TAPER): d2 2027-04-08 PM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x12 RIR3 BW; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d5 2027-04-11 PM RUN EASY 35min (EASY) | d6 2027-04-12 PM RUN EASY 35min (EASY)
- Week 14 (RACE_WEEK): d2 STRENGTH REST_BY_DESIGN | d3 2027-04-16  RUN RACE 150min (RACE) | d5 2027-04-18 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 2027-04-19 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G271

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, OUT_OF_SCOPE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":16,"asOf":"2026-11-20","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":84,"longestRunMinutes":132,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":16,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,3,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":62,"strengthMinutes":66,"sameTurnConfirmed":false}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G272

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":16,"asOf":"2026-12-06","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":190,"longestRunMinutes":87,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,6],"strengthDays":[0,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":36,"strengthMinutes":37,"longRunDay":3,"longRunMinutes":138,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-08 PM STRENGTH_LOWER 29min: leg-press 2x8 RIR3 establish; glute-bridge 2x8 RIR3 BW; leg-extension-machine 2x10 RIR3 establish; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-09 PM RUN EASY 35min (EASY) | d2 2026-12-10 PM RUN EASY 35min (EASY) | d3 2026-12-11 PM RUN LONG 85min (LONG) | d5 2026-12-13 PM STRENGTH_UPPER 29min: machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish; lat-pulldown 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d6 2026-12-14 PM STRENGTH_FULL_B 31min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; leg-curl-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d6 2026-12-14 PM RUN EASY 35min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-15 PM STRENGTH_LOWER 34min: leg-press 3x8 RIR3 last logged; glute-bridge 3x8 RIR3 BW; leg-extension-machine 2x10 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2026-12-16 PM RUN EASY 35min (EASY) | d2 2026-12-17 PM RUN EASY 35min (EASY) | d3 2026-12-18 PM RUN LONG 85min (LONG) | d5 2026-12-20 PM STRENGTH_UPPER 34min: machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged; lat-pulldown 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d6 2026-12-21 PM STRENGTH_FULL_B 35min: glute-bridge 3x8 RIR3 BW; seated-cable-row 3x8 RIR3 last logged; machine-chest-press 3x8 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged | d6 2026-12-21 PM RUN EASY 35min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G273

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":12,"asOf":"2026-12-27","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":72,"longestRunMinutes":82,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,6],"strengthDays":[3],"runTurn":"PM","strengthTurn":"PM","runMinutes":86,"strengthMinutes":29,"longRunDay":0,"longRunMinutes":138,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-29 PM RUN LONG 30min (LONG) | d1 2026-12-30 PM RUN EASY 20min (EASY) | d3 2027-01-01 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d6 2027-01-04 PM RUN EASY 20min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-05 PM RUN LONG 30min (LONG) | d1 2027-01-06 PM RUN EASY 20min (EASY) | d3 2027-01-08 PM STRENGTH_FULL_A 24min: kb-goblet-squat 2x10 RIR3 establish; incline-push-up 2x10 RIR3 BW; kb-row 2x10 RIR3 establish | d6 2027-01-11 PM RUN EASY 20min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G274

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":12,"asOf":"2026-11-16","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4,6],"strengthDays":[0,3,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":32,"strengthMinutes":73,"longRunDay":1,"longRunMinutes":76,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-18 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-19 PM RUN EASY 15min (EASY) | d3 2026-11-21 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-11-22 PM RUN EASY 15min (EASY) | d5 2026-11-23 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-24 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-24 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-25 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d1 2026-11-26 PM RUN EASY 20min (EASY) | d3 2026-11-28 PM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-11-29 PM RUN EASY 20min (EASY) | d5 2026-11-30 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-01 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-12-01 PM RUN EASY 20min (EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G275

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":16,"asOf":"2027-01-04","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 2x5 18KG TOTAL","db-rdl 5x12 13KG PER_HAND","reverse-lunge 4x12 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2],"strengthDays":[1],"runTurn":"PM","strengthTurn":"PM","runMinutes":33,"strengthMinutes":27,"longRunDay":2,"longRunMinutes":85,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2027-01-06 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-06 PM STRENGTH_FULL_A 23min: goblet-squat 2x5 RIR3 18kg TOTAL; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish | d2 2027-01-07 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d1 2027-01-13 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-13 PM STRENGTH_FULL_A 23min: goblet-squat 2x5 RIR3 18kg TOTAL; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d2 2027-01-14 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G276

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-25","weeks":16,"asOf":"2026-12-25","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-14"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-04-14"},"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":56,"longestRunMinutes":15,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x6 0KG BODYWEIGHT","glute-bridge 5x6 0KG BODYWEIGHT","reverse-lunge 3x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,5],"strengthDays":[1,2,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":79,"strengthMinutes":28,"longRunDay":5,"longRunMinutes":95,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d1 2026-12-26 PM RUN EASY 15min (EASY) | d1 2026-12-26 AM STRENGTH_LOWER 28min: box-squat-bodyweight 4x6 RIR3 BW; glute-bridge 4x6 RIR3 BW | d2 2026-12-27 AM STRENGTH_UPPER 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW | d4 2026-12-29 AM STRENGTH_LOWER_B 28min: glute-bridge 5x6 RIR3 BW; reverse-lunge 3x10 RIR3 BW | d5 2026-12-30 PM RUN LONG 15min (LONG) | d6 2026-12-31 AM STRENGTH_UPPER_B 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d1 2027-01-02 PM RUN EASY 15min (EASY) | d1 2027-01-02 AM STRENGTH_LOWER 26min: box-squat-bodyweight 4x8 RIR3 BW; glute-bridge 3x8 RIR3 BW | d2 2027-01-03 AM STRENGTH_UPPER 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW | d4 2027-01-05 AM STRENGTH_LOWER_B 28min: glute-bridge 5x8 RIR3 BW; reverse-lunge 3x6 RIR3 BW | d5 2027-01-06 PM RUN LONG 20min (LONG) | d6 2027-01-07 AM STRENGTH_UPPER_B 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 14 (TAPER): d1 2027-04-03 PM RUN EASY 20min (EASY +strides) | d1 2027-04-03 AM STRENGTH_LOWER 21min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x8 RIR3 BW | d2 2027-04-04 AM STRENGTH_UPPER 15min: push-up 1x14 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; incline-push-up 1x14 RIR3 BW | d4 2027-04-06 AM STRENGTH_LOWER_B 18min: glute-bridge 2x10 RIR3 BW; reverse-lunge 1x8 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW | d5 2027-04-07 PM RUN LONG 45min (LONG) | d6 2027-04-08 AM STRENGTH_UPPER_B 11min: push-up 1x14 RIR4 BW
- Week 15 (RACE_WEEK): d1 2027-04-10 PM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d5 2027-04-14  RUN RACE 150min (RACE, completion) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G277

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-23","weeks":12,"asOf":"2026-12-22","tz":0,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":88,"longestRunMinutes":69,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["goblet-squat 3x8 30KG PER_HAND","db-rdl 3x5 12KG TOTAL","db-split-squat 2x8 7KG PER_HAND"],"equipment":["KETTLEBELL","BODYWEIGHT","BARBELL","DUMBBELLS","PULL_UP_BAR","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4,5],"strengthDays":[2,3,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":39,"strengthMinutes":75,"longRunDay":5,"longRunMinutes":90,"sameTurnConfirmed":true}}`

**Onboarding.** CLINICAL_HUMAN_REQUIRED: Current pain, injury, illness or functional limitation routes to qualified human assessment; no training dose is substituted

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G278

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":8,"asOf":"2026-12-02","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":48,"longestRunMinutes":32,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3],"strengthDays":[0],"runTurn":"AM","strengthTurn":"AM","runMinutes":40,"strengthMinutes":27,"longRunDay":1,"longRunMinutes":68,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-04 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-12-05 AM RUN LONG 30min (LONG) | d3 2026-12-07 AM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-11 AM STRENGTH_FULL_A 22min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW | d1 2026-12-12 AM RUN LONG 30min (LONG) | d3 2026-12-14 AM RUN EASY 15min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G279

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":8,"asOf":"2026-12-27","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":156,"longestRunMinutes":38,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BANDS","BODYWEIGHT","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":71,"strengthMinutes":26,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-27 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-12-28 AM STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d2 2026-12-29 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-30 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-02 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-03 AM STRENGTH_FULL_A 24min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2027-01-04 AM STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d2 2027-01-05 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d3 2027-01-06 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2027-01-09 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G280

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":4,"asOf":"2026-11-26","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BARBELL","BENCH"],"pause":{"nonclinical":true,"weeks":5,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,5,6],"strengthDays":[0,1,4,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":89,"strengthMinutes":33,"longRunDay":6,"longRunMinutes":84,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-28 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-29 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d1 2026-11-29 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-30 PM RUN WALK 20min (WALK) | d3 2026-12-01 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-02 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-03 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-03 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-04 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-04 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-05 PM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-12-06 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d1 2026-12-06 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-07 PM RUN WALK 20min (WALK) | d3 2026-12-08 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-09 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d5 2026-12-10 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d5 2026-12-10 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-11 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2026-12-11 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G281

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":12,"asOf":"2026-12-26","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-08"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-03-08"},"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0,1,3,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":70,"strengthMinutes":21,"longRunDay":1,"longRunMinutes":136,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-27 AM RUN EASY 15min (EASY) | d0 2026-12-27 AM STRENGTH_UPPER 20min: incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 1x10 RIR3 establish | d1 2026-12-28 AM RUN WALK 20min (WALK) | d1 2026-12-28 AM STRENGTH_LOWER 20min: box-squat-bodyweight 2x6 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d2 2026-12-29 AM RUN EASY 15min (EASY) | d3 2026-12-30 AM RUN WALK 20min (WALK) | d3 2026-12-30 AM STRENGTH_LOWER_B 20min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW | d4 2026-12-31 AM RUN EASY 15min (EASY) | d4 2026-12-31 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-01 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d6 2027-01-02 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2027-01-03 AM RUN EASY 20min (EASY) | d0 2027-01-03 AM STRENGTH_UPPER 20min: incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged | d1 2027-01-04 AM RUN WALK 20min (WALK) | d1 2027-01-04 AM STRENGTH_LOWER 20min: box-squat-bodyweight 2x6 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d2 2027-01-05 AM RUN EASY 20min (EASY) | d3 2027-01-06 AM RUN WALK 20min (WALK) | d3 2027-01-06 AM STRENGTH_LOWER_B 21min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW | d4 2027-01-07 AM RUN EASY 20min (EASY) | d4 2027-01-07 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-08 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; front-plank 1x10 RIR3 BW | d6 2027-01-09 AM RUN WALK 20min (WALK)
- Week 9 (TAPER): d0 2027-02-28 AM RUN EASY 20min (EASY +strides) | d0 2027-02-28 AM STRENGTH_UPPER 16min: incline-push-up 1x14 RIR3 BW; db-row 1x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged | d1 2027-03-01 AM RUN LONG 30min (LONG) | d1 2027-03-01 AM STRENGTH_LOWER 16min: box-squat-bodyweight 1x6 RIR3 BW; glute-bridge 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW | d2 2027-03-02 AM RUN WALK 20min (WALK) | d3 2027-03-03 AM RUN EASY 15min (EASY) | d3 2027-03-03 AM STRENGTH_LOWER_B 14min: glute-bridge 1x14 RIR4 BW; reverse-lunge 1x14 RIR4 BW | d4 2027-03-04 AM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d6 2027-03-06 AM RUN EASY 15min (EASY)
- Week 10 (RACE_WEEK): d0 2027-03-07 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d0 STRENGTH REST_BY_DESIGN | d1 2027-03-08  RUN RACE 150min (RACE, completion) | d1 STRENGTH REST_BY_DESIGN | d2 RUN REST_BY_DESIGN | d3 2027-03-10 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 STRENGTH REST_BY_DESIGN | d4 2027-03-11 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d6 2027-03-13 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G282

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-25","weeks":8,"asOf":"2026-12-23","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":125,"longestRunMinutes":87,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":17,"specialPopulation":null,"schedule":{"runDays":[2,3,4],"strengthDays":[0,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":65,"strengthMinutes":71,"longRunDay":3,"longRunMinutes":142,"sameTurnConfirmed":false}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: POPULATION_OUTSIDE_V1_AGE_RANGE

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G283

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-01","weeks":8,"asOf":"2027-01-01","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":156,"longestRunMinutes":39,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":15,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2],"runTurn":"AM","strengthTurn":"PM","runMinutes":55,"strengthMinutes":74,"sameTurnConfirmed":true}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: POPULATION_OUTSIDE_V1_AGE_RANGE

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G284

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":8,"asOf":"2026-11-11","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":300,"longestRunMinutes":32,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":21,"strengthMinutes":58,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-11 AM STRENGTH_LOWER 25min: leg-press 2x10 RIR3 establish; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-12 AM STRENGTH_UPPER 25min: machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; push-up 1x12 RIR3 BW; lat-pulldown 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d2 2026-11-13 AM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-15 AM STRENGTH_UPPER_B 21min: seated-cable-row 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d6 2026-11-17 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-18 AM STRENGTH_LOWER 25min: leg-press 2x10 RIR3 last logged; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-19 AM STRENGTH_UPPER 25min: machine-chest-press 2x10 RIR3 last logged; seated-cable-row 2x10 RIR3 last logged; push-up 1x12 RIR3 BW; lat-pulldown 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d2 2026-11-20 AM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-22 AM STRENGTH_UPPER_B 21min: seated-cable-row 2x10 RIR3 last logged; machine-chest-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2026-11-24 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G285

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-03","weeks":8,"asOf":"2027-01-01","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-17"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-02-17"},"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":112,"longestRunMinutes":47,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["back-squat 5x5 90KG TOTAL","kb-deadlift 2x6 18KG SINGLE_IMPLEMENT","reverse-lunge 4x6 0KG BODYWEIGHT"],"equipment":["MACHINES","RACK","BENCH","PULL_UP_BAR","KETTLEBELL","BODYWEIGHT","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[2,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":77,"strengthMinutes":26,"longRunDay":1,"longRunMinutes":47,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2027-01-03 AM RUN EASY 15min (EASY) | d1 2027-01-04 AM RUN LONG 45min (LONG) | d2 2027-01-05 AM RUN EASY 15min (EASY) | d2 2027-01-05 PM STRENGTH_FULL_A 24min: kb-goblet-squat 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish | d3 2027-01-06 AM RUN EASY 15min (EASY) | d4 2027-01-07 AM RUN EASY 15min (EASY) | d6 2027-01-09 PM STRENGTH_FULL_B 24min: kb-deadlift 2x6 RIR3 18kg SINGLE_IMPLEMENT; seated-cable-row 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish
- Week 1 (SPECIFIC): d0 2027-01-10 AM RUN EASY 15min (EASY) | d1 2027-01-11 AM RUN LONG 45min (LONG) | d2 2027-01-12 AM RUN EASY 15min (EASY) | d2 2027-01-12 PM STRENGTH_FULL_A 24min: kb-goblet-squat 2x10 RIR3 last logged; machine-chest-press 2x10 RIR3 last logged; seated-cable-row 2x10 RIR3 last logged | d3 2027-01-13 AM RUN EASY 15min (EASY) | d4 2027-01-14 AM RUN EASY 15min (EASY) | d6 2027-01-16 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 18kg SINGLE_IMPLEMENT; seated-cable-row 2x10 RIR3 last logged; machine-chest-press 2x10 RIR3 last logged
- Week 5 (TAPER): d0 2027-02-07 AM RUN EASY 15min (EASY +strides) | d1 2027-02-08 AM RUN LONG 30min (LONG) | d2 2027-02-09 AM RUN EASY 15min (EASY +strides) | d2 2027-02-09 PM STRENGTH_FULL_A 16min: kb-goblet-squat 1x10 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged; seated-cable-row 1x10 RIR3 last logged | d3 2027-02-10 AM RUN EASY 15min (EASY +strides) | d4 2027-02-11 AM RUN EASY 15min (EASY) | d6 2027-02-13 PM STRENGTH_FULL_B 16min: kb-deadlift 1x8 RIR4 18kg SINGLE_IMPLEMENT; seated-cable-row 1x10 RIR4 last logged; machine-chest-press 1x10 RIR4 last logged
- Week 6 (RACE_WEEK): d0 2027-02-14 AM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d1 2027-02-15 AM RUN EASY 15min (EASY) | d2 2027-02-16 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d2 STRENGTH REST_BY_DESIGN | d3 2027-02-17  RUN RACE 150min (RACE, completion) | d4 RUN REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G286

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":12,"asOf":"2026-12-12","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-23"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-02-23"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","RACK","BARBELL","DUMBBELLS","BODYWEIGHT","KETTLEBELL","MACHINES","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3],"strengthDays":[0,3,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":25,"strengthMinutes":50,"longRunDay":3,"longRunMinutes":38,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-15 PM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 establish; db-rdl 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d1 2026-12-16 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-18 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-18 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2026-12-19 PM STRENGTH_LOWER_B 23min: db-rdl 2x10 RIR3 establish; db-split-squat 2x10 RIR3 establish; seated-calf-raise-db 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d5 2026-12-20 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d6 2026-12-21 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x12 RIR3 establish; front-plank 1x12 RIR3 BW
- Week 1 (BUILD): d0 2026-12-22 PM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d1 2026-12-23 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-25 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-25 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2026-12-26 PM STRENGTH_LOWER_B 23min: db-rdl 2x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged; seated-calf-raise-db 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2026-12-27 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2026-12-28 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x12 RIR3 last logged; front-plank 1x12 RIR3 BW
- Week 9 (TAPER): d0 2027-02-16 PM STRENGTH_LOWER 19min: goblet-squat 1x10 RIR3 last logged; db-rdl 1x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d1 2027-02-17 AM RUN WALK_JOG 21min (WALK_JOG 2x(300s jog/90s walk)) | d3 2027-02-19 AM RUN WALK_JOG 21min (WALK_JOG 2x(300s jog/90s walk)) | d3 2027-02-19 PM STRENGTH_UPPER 14min: db-bench-press 1x10 RIR4 last logged; db-row 1x10 RIR4 last logged | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN
- Week 10 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2027-02-23  RUN RACE 150min (RACE, completion) | d1 RUN REST_BY_DESIGN | d3 2027-02-26 AM RUN WALK_JOG 21min (WALK_JOG 2x(300s jog/90s walk)) | d3 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G287

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-24","weeks":16,"asOf":"2026-12-21","tz":0,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":230,"longestRunMinutes":18,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x5 0KG BODYWEIGHT","hip-thrust-db 5x12 8KG PER_HAND","db-split-squat 3x6 26KG TOTAL"],"equipment":["MACHINES","PULL_UP_BAR","RACK","BENCH","BODYWEIGHT","DUMBBELLS","BARBELL","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":53,"strengthMinutes":43,"longRunDay":4,"longRunMinutes":140,"sameTurnConfirmed":false}}`

**Onboarding.** ASK: Only facts that change the first program are asked; everything else is established or learned · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G288

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":8,"asOf":"2027-01-02","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":140,"longestRunMinutes":88,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x12 0KG BODYWEIGHT","glute-bridge 5x6 0KG BODYWEIGHT","reverse-lunge 2x12 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,6],"strengthDays":[1,2,3,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":37,"strengthMinutes":25,"longRunDay":2,"longRunMinutes":89,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2027-01-03 PM STRENGTH_UPPER 21min: push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; pike-push-up 2x10 RIR3 BW | d2 2027-01-04 PM RUN LONG 60min (LONG) | d2 2027-01-04 PM STRENGTH_LOWER 24min: box-squat-bodyweight 3x12 RIR3 BW; glute-bridge 3x6 RIR3 BW | d3 2027-01-05 PM RUN EASY 37min (EASY) | d3 2027-01-05 PM STRENGTH_LOWER_B 23min: glute-bridge 4x6 RIR3 BW; reverse-lunge 2x8 RIR3 BW | d6 2027-01-08 PM RUN EASY 37min (EASY) | d6 2027-01-08 PM STRENGTH_UPPER_B 21min: push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-10 PM STRENGTH_UPPER 24min: push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; pike-push-up 2x12 RIR3 BW | d2 2027-01-11 PM RUN LONG 60min (LONG) | d2 2027-01-11 PM STRENGTH_LOWER 24min: box-squat-bodyweight 3x8 RIR3 BW; glute-bridge 3x8 RIR3 BW | d3 2027-01-12 PM RUN EASY 37min (EASY) | d3 2027-01-12 PM STRENGTH_LOWER_B 24min: glute-bridge 3x8 RIR3 BW; reverse-lunge 3x10 RIR3 BW | d6 2027-01-15 PM RUN EASY 37min (EASY) | d6 2027-01-15 PM STRENGTH_UPPER_B 24min: push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G289

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":8,"asOf":"2026-12-28","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["back-squat 2x12 56KG TOTAL","glute-bridge 5x12 0KG BODYWEIGHT"],"equipment":["BANDS","RACK","KETTLEBELL","DUMBBELLS","BARBELL","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":60,"strengthMinutes":72,"longRunDay":2,"longRunMinutes":117,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-29 AM RUN EASY 15min (EASY) | d1 2026-12-30 AM RUN WALK 20min (WALK) | d2 2026-12-31 AM RUN EASY 15min (EASY) | d3 2027-01-01 AM RUN WALK 20min (WALK) | d4 2027-01-02 AM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-05 AM RUN EASY 20min (EASY) | d1 2027-01-06 AM RUN WALK 20min (WALK) | d2 2027-01-07 AM RUN EASY 20min (EASY) | d3 2027-01-08 AM RUN WALK 20min (WALK) | d4 2027-01-09 AM RUN EASY 20min (EASY)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G290

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":4,"asOf":"2027-01-05","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":168,"longestRunMinutes":61,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["leg-press 5x8 76KG TOTAL","db-rdl 2x6 15KG PER_HAND","db-split-squat 3x8 19KG PER_HAND"],"equipment":["MACHINES","BENCH","DUMBBELLS","KETTLEBELL","BANDS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":15,"specialPopulation":null,"schedule":{"runDays":[4],"strengthDays":[0,1,2,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":68,"strengthMinutes":31,"longRunDay":4,"longRunMinutes":71,"sameTurnConfirmed":false}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: POPULATION_OUTSIDE_V1_AGE_RANGE

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G291

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-01","weeks":4,"asOf":"2026-12-31","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":6,"runMinutesPerWeek":360,"longestRunMinutes":33,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":37,"strengthMinutes":35,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-01 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2027-01-02 AM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x10 RIR3 BW; db-biceps-curl 2x8 RIR3 establish | d4 2027-01-05 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-06 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-07 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-08 AM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2027-01-09 AM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x10 RIR3 BW; db-biceps-curl 2x8 RIR3 last logged | d4 2027-01-12 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d5 2027-01-13 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2027-01-14 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G292

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-29","weeks":8,"asOf":"2026-11-27","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-16"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-01-16"},"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":165,"longestRunMinutes":51,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[2,3,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":57,"strengthMinutes":62,"longRunDay":2,"longRunMinutes":74,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-29 PM RUN EASY 20min (EASY) | d1 2026-11-30 PM RUN EASY 20min (EASY) | d2 2026-12-01 PM RUN LONG 50min (LONG) | d2 2026-12-01 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-12-02 PM RUN EASY 20min (EASY) | d3 2026-12-02 PM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-03 PM RUN EASY 20min (EASY) | d6 2026-12-05 PM RUN EASY 20min (EASY) | d6 2026-12-05 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2026-12-06 PM RUN EASY 20min (EASY) | d1 2026-12-07 PM RUN EASY 20min (EASY) | d2 2026-12-08 PM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-08 PM RUN LONG 50min (LONG) | d3 2026-12-09 PM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-09 PM RUN EASY 20min (EASY) | d4 2026-12-10 PM RUN EASY 20min (EASY) | d6 2026-12-12 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d6 2026-12-12 PM RUN EASY 20min (EASY)
- Week 5 (TAPER): d0 2027-01-03 PM RUN EASY 20min (EASY +strides) | d1 2027-01-04 PM RUN EASY 20min (EASY +strides) | d2 2027-01-05 PM RUN LONG 40min (LONG) | d2 2027-01-05 PM STRENGTH_LOWER 24min: box-squat-bodyweight 2x7 RIR3 BW; glute-bridge 2x7 RIR3 BW; reverse-lunge 1x9 RIR3 BW; standing-calf-raise 1x9 RIR3 BW; dead-bug 1x9 RIR3 BW | d3 2027-01-06 PM RUN EASY 20min (EASY +strides) | d3 2027-01-06 PM STRENGTH_UPPER 17min: incline-push-up 2x7 RIR3 BW; prone-ytw-raise 1x9 RIR3 BW; dead-bug 1x9 RIR3 BW | d4 2027-01-07 PM RUN EASY 20min (EASY +strides) | d6 2027-01-09 PM RUN EASY 20min (EASY +strides) | d6 2027-01-09 PM STRENGTH_FULL_B 24min: glute-bridge 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW; prone-ytw-raise 1x9 RIR3 BW; reverse-lunge 1x9 RIR3 BW; dead-bug 1x9 RIR3 BW
- Week 6 (RACE_WEEK): d0 2027-01-10 PM RUN EASY 15min (EASY) | d1 2027-01-11 PM RUN EASY 15min (EASY) | d2 2027-01-12 PM RUN EASY 15min (EASY) | d2 2027-01-12 PM STRENGTH_LOWER 13min: box-squat-bodyweight 1x7 RIR4 BW; glute-bridge 1x7 RIR4 BW | d3 2027-01-13 PM RUN EASY 15min (EASY) | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-14 PM RUN EASY 15min (EASY) | d6 2027-01-16  RUN RACE 75min (RACE) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G293

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":16,"asOf":"2027-01-04","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":124,"longestRunMinutes":33,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","KETTLEBELL","BENCH","RACK","BANDS","BARBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,3,4,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":20,"strengthMinutes":36,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2027-01-05 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2027-01-06 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-07 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2027-01-08 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-09 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-12 PM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-01-13 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-14 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; hip-abduction-machine 1x10 RIR3 establish | d4 2027-01-15 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d5 2027-01-16 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G294

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-18","weeks":4,"asOf":"2026-12-16","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-01"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-01-01"},"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":117,"longestRunMinutes":23,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x12 0KG BODYWEIGHT","glute-bridge 4x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,5],"strengthDays":[1,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":29,"strengthMinutes":29,"longRunDay":5,"longRunMinutes":33,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d1 2026-12-19 AM STRENGTH_FULL_A 23min: box-squat-bodyweight 2x12 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW | d2 2026-12-20 AM RUN EASY 23min (EASY) | d3 2026-12-21 AM RUN EASY 23min (EASY) | d3 2026-12-21 AM STRENGTH_FULL_B 22min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW | d5 2026-12-23 AM RUN LONG 20min (LONG)
- Week 1 (SPECIFIC): d1 2026-12-26 AM STRENGTH_FULL_A 14min: box-squat-bodyweight 1x8 RIR4 BW; push-up 1x10 RIR4 BW | d2 2026-12-27 AM RUN EASY 15min (EASY) | d3 2026-12-28 AM RUN EASY 15min (EASY) | d3 STRENGTH REST_BY_DESIGN | d5 2026-12-30 AM RUN EASY 15min (EASY)
- Week 1 (SPECIFIC): d1 2026-12-26 AM STRENGTH_FULL_A 14min: box-squat-bodyweight 1x8 RIR4 BW; push-up 1x10 RIR4 BW | d2 2026-12-27 AM RUN EASY 15min (EASY) | d3 2026-12-28 AM RUN EASY 15min (EASY) | d3 STRENGTH REST_BY_DESIGN | d5 2026-12-30 AM RUN EASY 15min (EASY)
- Week 2 (RACE_WEEK): d0 2027-01-01  RUN RACE 75min (RACE) | d1 STRENGTH REST_BY_DESIGN | d2 2027-01-03 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 2027-01-04 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 STRENGTH REST_BY_DESIGN | d5 2027-01-06 AM RUN RECOVERY_EASY 28min (RECOVERY_EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G295

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":12,"asOf":"2026-11-22","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-06"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-02-06"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,3,4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":35,"strengthMinutes":73,"longRunDay":0,"longRunMinutes":48,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-22 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-11-22 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-23 PM RUN WALK 20min (WALK) | d2 2026-11-24 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-25 PM RUN WALK 20min (WALK) | d3 2026-11-25 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-11-26 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-11-26 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-27 PM RUN WALK 20min (WALK) | d5 2026-11-27 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-28 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2026-11-29 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-11-29 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-30 PM RUN WALK 20min (WALK) | d2 2026-12-01 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-02 PM RUN WALK 20min (WALK) | d3 2026-12-02 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-03 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-03 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d5 2026-12-04 PM RUN WALK 20min (WALK) | d5 2026-12-04 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d6 2026-12-05 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 9 (TAPER): d0 2027-01-24 PM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d0 2027-01-24 AM STRENGTH_LOWER 20min: box-squat-bodyweight 1x14 RIR3 BW; glute-bridge 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; side-lying-hip-abduction 1x14 RIR3 BW | d1 2027-01-25 PM RUN WALK 20min (WALK) | d2 2027-01-26 PM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d3 2027-01-27 PM RUN WALK 20min (WALK) | d3 2027-01-27 AM STRENGTH_UPPER 15min: incline-push-up 1x14 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d4 2027-01-28 PM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d4 2027-01-28 AM STRENGTH_LOWER_B 18min: glute-bridge 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x14 RIR3 BW | d5 2027-01-29 PM RUN WALK 20min (WALK) | d5 2027-01-29 AM STRENGTH_UPPER_B 15min: incline-push-up 1x14 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2027-01-30 AM STRENGTH_CORE 14min: dead-bug 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; front-plank 1x14 RIR3 BW
- Week 10 (RACE_WEEK): d0 2027-01-31 PM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d0 2027-01-31 AM STRENGTH_LOWER 14min: box-squat-bodyweight 1x14 RIR4 BW; glute-bridge 1x14 RIR4 BW | d1 2027-02-01 PM RUN WALK 20min (WALK) | d2 2027-02-02 PM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d3 2027-02-03 PM RUN WALK 20min (WALK) | d3 STRENGTH REST_BY_DESIGN | d4 2027-02-04 PM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d4 STRENGTH REST_BY_DESIGN | d5 2027-02-05 PM RUN WALK 20min (WALK) | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN | d6 2027-02-06  RUN RACE 150min (RACE, completion)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G296

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-24","weeks":4,"asOf":"2026-12-22","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-12"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-01-12"},"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","KETTLEBELL","BENCH","RACK","PULL_UP_BAR","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3],"strengthDays":[0,1,2,3,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":79,"strengthMinutes":39,"longRunDay":3,"longRunMinutes":38,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-24 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d0 2026-12-24 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-25 AM STRENGTH_FULL_B 28min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-26 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-27 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-27 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-28 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2026-12-31 AM STRENGTH_FULL_A 28min: kb-goblet-squat 2x10 RIR3 establish; incline-push-up 2x10 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-12-31 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-01 AM STRENGTH_FULL_B 28min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-02 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d3 2027-01-03 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d3 2027-01-03 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-04 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 1 (BUILD): d0 2026-12-31 AM STRENGTH_FULL_A 28min: kb-goblet-squat 2x10 RIR3 establish; incline-push-up 2x10 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-12-31 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-01 AM STRENGTH_FULL_B 28min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-02 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d3 2027-01-03 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d3 2027-01-03 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-04 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 2 (RACE_WEEK): d0 2027-01-07 AM STRENGTH_LOWER 14min: kb-goblet-squat 1x10 RIR4 last logged; kb-deadlift 1x8 RIR4 last logged | d0 2027-01-07 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d3 2027-01-10 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 STRENGTH REST_BY_DESIGN | d5 2027-01-12  RUN RACE 75min (RACE, completion)

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G297

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-03","weeks":8,"asOf":"2027-01-03","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":57,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x6 0KG BODYWEIGHT","glute-bridge 2x12 0KG BODYWEIGHT","reverse-lunge 3x8 0KG BODYWEIGHT"],"equipment":["BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5],"strengthDays":[0,1,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":35,"strengthMinutes":73,"longRunDay":0,"longRunMinutes":130,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-03 PM RUN LONG 55min (LONG) | d0 2027-01-03 PM STRENGTH_LOWER 29min: box-squat-bodyweight 4x6 RIR3 BW; glute-bridge 2x12 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2027-01-04 PM RUN EASY 20min (EASY) | d1 2027-01-04 PM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; band-face-pull 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-06 PM RUN EASY 20min (EASY) | d4 2027-01-07 PM RUN EASY 20min (EASY) | d5 2027-01-08 PM RUN EASY 20min (EASY) | d5 2027-01-08 PM STRENGTH_FULL_B 28min: glute-bridge 2x12 RIR3 BW; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-10 PM RUN LONG 60min (LONG) | d0 2027-01-10 PM STRENGTH_LOWER 29min: box-squat-bodyweight 4x6 RIR3 BW; glute-bridge 2x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2027-01-11 PM RUN EASY 20min (EASY) | d1 2027-01-11 PM STRENGTH_UPPER 24min: push-up 2x10 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x12 RIR3 BW; band-face-pull 1x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-13 PM RUN EASY 20min (EASY) | d4 2027-01-14 PM RUN EASY 20min (EASY) | d5 2027-01-15 PM RUN EASY 20min (EASY) | d5 2027-01-15 PM STRENGTH_FULL_B 28min: glute-bridge 2x12 RIR3 BW; band-row 2x8 RIR3 BW; push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G298

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-25","weeks":4,"asOf":"2026-12-25","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":54,"longestRunMinutes":75,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["RACK","MACHINES","BARBELL","BANDS","BENCH","PULL_UP_BAR","DUMBBELLS","BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[0,1,2,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":84,"strengthMinutes":27,"longRunDay":6,"longRunMinutes":139,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-25 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-12-26 AM RUN EASY 15min (EASY) | d1 2026-12-26 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d2 2026-12-27 AM RUN EASY 15min (EASY) | d2 2026-12-27 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-28 AM RUN WALK 20min (WALK) | d3 2026-12-28 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-12-29 AM RUN WALK 20min (WALK) | d5 2026-12-30 AM RUN WALK 20min (WALK) | d6 2026-12-31 AM RUN LONG 20min (LONG) | d6 2026-12-31 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-01 AM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2027-01-02 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d1 2027-01-02 AM RUN EASY 15min (EASY) | d2 2027-01-03 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d2 2027-01-03 AM RUN EASY 15min (EASY) | d3 2027-01-04 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d3 2027-01-04 AM RUN WALK 20min (WALK) | d4 2027-01-05 AM RUN WALK 20min (WALK) | d5 2027-01-06 AM RUN WALK 20min (WALK) | d6 2027-01-07 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2027-01-07 AM RUN LONG 20min (LONG)

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G299

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":4,"asOf":"2026-12-12","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":99,"longestRunMinutes":21,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","RACK","PULL_UP_BAR","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4],"strengthDays":[3,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":69,"strengthMinutes":43,"longRunDay":1,"longRunMinutes":121,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-12 PM RUN EASY 21min (EASY) | d1 2026-12-13 PM RUN LONG 20min (LONG) | d2 2026-12-14 PM RUN EASY 21min (EASY) | d3 2026-12-15 PM STRENGTH_LOWER 28min: goblet-squat 2x5 RIR3 establish; db-rdl 2x5 RIR3 establish; db-split-squat 2x7 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d4 2026-12-16 PM RUN EASY 21min (EASY) | d4 2026-12-16 PM STRENGTH_UPPER 28min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-overhead-press 2x7 RIR3 establish; inverted-row 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-17 PM STRENGTH_FULL_B 30min: db-rdl 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; db-split-squat 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-19 PM RUN EASY 21min (EASY) | d1 2026-12-20 PM RUN LONG 20min (LONG) | d2 2026-12-21 PM RUN EASY 21min (EASY) | d3 2026-12-22 PM STRENGTH_UPPER 34min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-overhead-press 2x7 RIR3 last logged; inverted-row 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-23 PM RUN EASY 21min (EASY) | d4 2026-12-23 PM STRENGTH_LOWER 34min: goblet-squat 3x5 RIR3 last logged; db-rdl 3x5 RIR3 last logged; db-split-squat 2x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d5 2026-12-24 PM STRENGTH_FULL_B 39min: db-rdl 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; db-split-squat 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure · not evaluable: P06 (1)

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

## R7D-G300

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":8,"asOf":"2026-12-03","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":108,"longestRunMinutes":33,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BANDS","BENCH","PULL_UP_BAR","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[6],"runTurn":"PM","strengthTurn":"PM","runMinutes":88,"strengthMinutes":39,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d6 2026-12-10 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d6 2026-12-17 PM STRENGTH_FULL_A 28min: leg-press 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- none

**Independent assessment (author, written before any output).**
- Rationale: generated
- Preferred: not asserted (invariants only)
- Acceptable alternatives: —
- Concerns: —
- Domain notes: —

