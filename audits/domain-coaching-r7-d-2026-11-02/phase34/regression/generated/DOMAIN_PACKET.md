# R7-D domain-evaluation packet (R7D-GENERATED-DIAGNOSTIC-1)

Runtime R7D-FREEZE-4 (b242237), harness R7D-HARNESS-6, first evaluation: false. Corpus sha256 449b7d91d7b6a0235a473650dc2c256e8ef3b50bf4255e82cddd83b0e1601fb3.

Per case: what the case asks, the intake, onboarding, every decision (current week = prescription; next week = provisional projection), automated results, the author's expectations and independent assessment.

## R7D-G001

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-14","weeks":8,"asOf":"2026-11-11","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-07"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2027-01-07"},"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":245,"longestRunMinutes":78,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x8 0KG BODYWEIGHT","glute-bridge 3x10 0KG BODYWEIGHT","reverse-lunge 3x5 0KG BODYWEIGHT"],"equipment":["BANDS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[2,3,5],"strengthDays":[3,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":58,"strengthMinutes":52,"longRunDay":5,"longRunMinutes":94,"sameTurnConfirmed":false}}`

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

## R7D-G002

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":16,"asOf":"2027-01-01","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":80,"longestRunMinutes":71,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":62,"strengthMinutes":25,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-02 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW | d5 2027-01-07 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-09 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW | d5 2027-01-14 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":8,"asOf":"2026-12-10","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":3,"runMinutesPerWeek":117,"longestRunMinutes":27,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","RACK","BANDS","DUMBBELLS","BARBELL","BENCH","KETTLEBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":17,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":44,"strengthMinutes":60,"sameTurnConfirmed":false}}`

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

## R7D-G004

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-23","weeks":12,"asOf":"2026-12-22","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-10"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-03-10"},"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BARBELL","BODYWEIGHT","MACHINES","BANDS","DUMBBELLS","PULL_UP_BAR","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3],"strengthDays":[3],"runTurn":"AM","strengthTurn":"PM","runMinutes":53,"strengthMinutes":42,"longRunDay":0,"longRunMinutes":75,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-23 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-24 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-25 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-26 AM RUN WALK 20min (WALK) | d3 2026-12-26 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW
- Week 1 (BUILD): d0 2026-12-30 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-31 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2027-01-01 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-02 AM RUN WALK 20min (WALK) | d3 2027-01-02 PM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW
- Week 10 (TAPER): d0 2027-03-03 AM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d1 2027-03-04 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d2 2027-03-05 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d3 2027-03-06 AM RUN WALK 20min (WALK) | d3 2027-03-06 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged
- Week 11 (RACE_WEEK): d0 2027-03-10  RUN RACE 150min (RACE, completion) | d1 RUN REST_BY_DESIGN | d2 2027-03-12 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d3 2027-03-13 AM RUN WALK 20min (WALK) | d3 STRENGTH REST_BY_DESIGN

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-01","weeks":4,"asOf":"2027-01-01","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":3,"runMinutesPerWeek":159,"longestRunMinutes":84,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","DUMBBELLS","KETTLEBELL","BANDS","BENCH","BODYWEIGHT","PULL_UP_BAR","MACHINES","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":82,"strengthMinutes":42,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2027-01-03 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2027-01-04 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2027-01-10 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-11 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

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

**Tags.** COLD_START, H16, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-14","weeks":16,"asOf":"2026-12-12","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x5 0KG BODYWEIGHT","kb-deadlift 5x8 22KG SINGLE_IMPLEMENT"],"equipment":["BODYWEIGHT","DUMBBELLS","KETTLEBELL","BANDS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[4],"runTurn":"PM","strengthTurn":"AM","runMinutes":78,"strengthMinutes":30,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d4 2026-12-18 AM STRENGTH_FULL_A 23min: box-squat-bodyweight 2x5 RIR3 BW; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish
- Week 1 (DEVELOPMENT): d4 2026-12-25 AM STRENGTH_FULL_A 23min: box-squat-bodyweight 2x5 RIR3 BW; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":16,"asOf":"2026-11-29","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 5x5 9KG PER_HAND"],"equipment":["BANDS","RACK","MACHINES","BODYWEIGHT","KETTLEBELL","DUMBBELLS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,2,3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":22,"strengthMinutes":46,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-02 PM STRENGTH_LOWER 37min: goblet-squat 5x5 RIR3 9kg PER_HAND; db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x7 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2026-12-04 PM STRENGTH_UPPER 28min: db-bench-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-floor-press 2x7 RIR3 establish; one-arm-db-row 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d3 2026-12-05 PM STRENGTH_LOWER_B 25min: db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d4 2026-12-06 PM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-bench-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2026-12-08 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-09 PM STRENGTH_LOWER 40min: goblet-squat 5x5 RIR3 9kg PER_HAND; db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 2x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d2 2026-12-11 PM STRENGTH_UPPER 34min: db-bench-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-floor-press 2x7 RIR3 last logged; one-arm-db-row 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d3 2026-12-12 PM STRENGTH_LOWER_B 32min: db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 3x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d4 2026-12-13 PM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-bench-press 3x5 RIR3 last logged; dead-bug 2x9 RIR3 BW | d6 2026-12-15 PM STRENGTH_CORE 19min: dead-bug 2x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; front-plank 2x9 RIR3 BW

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

**Tags.** COLD_START, H12, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":12,"asOf":"2027-01-03","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":280,"longestRunMinutes":138,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","RACK","DUMBBELLS","BENCH","PULL_UP_BAR","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3],"runTurn":"PM","strengthTurn":"PM","runMinutes":40,"strengthMinutes":41,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2027-01-06 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-07 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2027-01-13 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-14 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW

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

## R7D-G009

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":12,"asOf":"2027-01-03","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-29"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-03-29"},"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":36,"longestRunMinutes":61,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x5 0KG BODYWEIGHT"],"equipment":["BENCH","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2],"strengthDays":[1,2,3,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":80,"strengthMinutes":72,"longRunDay":2,"longRunMinutes":40,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d1 2027-01-07 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-07 PM STRENGTH_LOWER 36min: box-squat-bodyweight 5x5 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2027-01-08 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2027-01-08 PM STRENGTH_UPPER 21min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2027-01-09 PM STRENGTH_LOWER_B 26min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2027-01-11 PM STRENGTH_UPPER_B 21min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2027-01-12 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW
- Week 1 (BUILD): d1 2027-01-14 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-14 PM STRENGTH_LOWER 39min: box-squat-bodyweight 5x5 RIR3 BW; glute-bridge 3x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2027-01-15 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2027-01-15 PM STRENGTH_UPPER 23min: incline-push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2027-01-16 PM STRENGTH_LOWER_B 31min: glute-bridge 3x8 RIR3 BW; reverse-lunge 3x10 RIR3 BW; bent-knee-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2027-01-18 PM STRENGTH_UPPER_B 23min: incline-push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2027-01-19 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW
- Week 10 (TAPER): d1 2027-03-18 AM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d1 2027-03-18 PM STRENGTH_LOWER 26min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x16 RIR3 BW; reverse-lunge 1x16 RIR3 BW; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d2 2027-03-19 AM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d2 2027-03-19 PM STRENGTH_UPPER 19min: incline-push-up 2x16 RIR3 BW; prone-ytw-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d3 2027-03-20 PM STRENGTH_LOWER_B 25min: glute-bridge 2x16 RIR3 BW; reverse-lunge 2x16 RIR3 BW; bent-knee-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d5 2027-03-22 PM STRENGTH_UPPER_B 19min: incline-push-up 2x16 RIR3 BW; prone-ytw-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d6 STRENGTH REST_BY_DESIGN
- Week 11 (RACE_WEEK): d1 2027-03-25 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d1 STRENGTH REST_BY_DESIGN | d2 2027-03-26 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d5 2027-03-29  RUN RACE 150min (RACE, completion) | d6 STRENGTH REST_BY_DESIGN

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

## R7D-G010

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":16,"asOf":"2026-12-13","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-03"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-04-03"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","RACK","DUMBBELLS","BODYWEIGHT","BENCH","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[6],"strengthDays":[0,1,2,3,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":87,"strengthMinutes":60,"longRunDay":6,"longRunMinutes":124,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-15 PM STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-16 PM STRENGTH_UPPER 29min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-12-17 PM STRENGTH_LOWER_B 26min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; seated-calf-raise-db 2x10 RIR3 establish; leg-curl-machine 2x10 RIR3 establish | d3 2026-12-18 PM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d6 2026-12-21 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-21 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-22 PM STRENGTH_LOWER 34min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x8 RIR3 last logged; leg-extension-machine 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2026-12-23 PM STRENGTH_UPPER 34min: db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d2 2026-12-24 PM STRENGTH_LOWER_B 31min: db-rdl 3x8 RIR3 last logged; db-split-squat 3x8 RIR3 last logged; seated-calf-raise-db 2x10 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged | d3 2026-12-25 PM STRENGTH_UPPER_B 27min: db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged | d6 2026-12-28 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-28 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 last logged; front-plank 2x10 RIR3 BW
- Week 14 (TAPER): d0 2027-03-23 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; leg-extension-machine 1x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; front-plank 1x16 RIR3 BW | d1 2027-03-24 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-lateral-raise 1x10 RIR3 last logged; db-biceps-curl 1x10 RIR3 last logged; front-plank 1x16 RIR3 BW | d2 2027-03-25 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x8 RIR3 last logged; seated-calf-raise-machine 1x10 RIR3 last logged; leg-curl-machine 1x10 RIR3 last logged | d3 2027-03-26 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-overhead-triceps-extension 1x10 RIR3 last logged | d6 2027-03-29 AM RUN EASY 15min (EASY) | d6 STRENGTH REST_BY_DESIGN
- Week 15 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 2027-04-03  RUN RACE 150min (RACE, completion) | d6 2027-04-05 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-24","weeks":8,"asOf":"2026-12-23","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[3,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":57,"strengthMinutes":71,"longRunDay":1,"longRunMinutes":83,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-24 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-25 AM RUN WALK 20min (WALK) | d2 2026-12-26 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-27 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-27 AM RUN WALK 20min (WALK) | d4 2026-12-28 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-28 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-29 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-31 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-01 AM RUN WALK 20min (WALK) | d2 2027-01-02 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-03 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-03 AM RUN WALK 20min (WALK) | d4 2027-01-04 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2027-01-04 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-05 AM RUN WALK 20min (WALK)

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":4,"asOf":"2026-12-09","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":99,"longestRunMinutes":17,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x10 0KG BODYWEIGHT","barbell-rdl 4x10 59KG TOTAL","reverse-lunge 2x8 0KG BODYWEIGHT"],"equipment":["BENCH","DUMBBELLS","BODYWEIGHT","BARBELL","PULL_UP_BAR","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":81,"strengthMinutes":42,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-12 PM STRENGTH_FULL_A 35min: box-squat-bodyweight 5x10 RIR3 BW; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2026-12-17 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-19 PM STRENGTH_FULL_A 34min: box-squat-bodyweight 5x6 RIR3 BW; incline-push-up 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2026-12-24 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":16,"asOf":"2026-11-17","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x12 0KG BODYWEIGHT","glute-bridge 4x12 0KG BODYWEIGHT"],"equipment":["MACHINES","RACK","BARBELL","PULL_UP_BAR","DUMBBELLS","BENCH","BODYWEIGHT","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[6],"runTurn":"AM","strengthTurn":"PM","runMinutes":40,"strengthMinutes":41,"longRunDay":4,"longRunMinutes":128,"sameTurnConfirmed":false}}`

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

## R7D-G014

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":16,"asOf":"2026-11-21","tz":330,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x12 0KG BODYWEIGHT","glute-bridge 4x5 0KG BODYWEIGHT","reverse-lunge 2x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[0],"runTurn":"AM","strengthTurn":"AM","runMinutes":43,"strengthMinutes":62,"longRunDay":1,"longRunMinutes":36,"sameTurnConfirmed":true}}`

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

## R7D-G015

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":16,"asOf":"2026-11-23","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":141,"longestRunMinutes":65,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BANDS","BARBELL","DUMBBELLS","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3],"strengthDays":[0,1,2,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":32,"strengthMinutes":51,"longRunDay":0,"longRunMinutes":134,"sameTurnConfirmed":false}}`

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

## R7D-G016

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-16","weeks":8,"asOf":"2026-12-16","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":42,"longestRunMinutes":21,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["kb-goblet-squat 3x12 30KG SINGLE_IMPLEMENT","glute-bridge 5x12 0KG BODYWEIGHT","db-split-squat 3x10 23KG PER_HAND"],"equipment":["RACK","BANDS","BENCH","BODYWEIGHT","DUMBBELLS","BARBELL","KETTLEBELL"],"pause":{"nonclinical":true,"weeks":2,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":32,"strengthMinutes":33,"longRunDay":4,"longRunMinutes":125,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-17 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-20 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-21 AM RUN WALK 20min (WALK) | d6 2026-12-22 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d1 2026-12-24 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-27 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-28 AM RUN WALK 20min (WALK) | d6 2026-12-29 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":12,"asOf":"2026-11-07","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":336,"longestRunMinutes":71,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[6],"runTurn":"PM","strengthTurn":"AM","runMinutes":51,"strengthMinutes":42,"longRunDay":0,"longRunMinutes":38,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-10 PM RUN LONG 38min (LONG) | d1 2026-11-11 PM RUN EASY 51min (EASY) | d2 2026-11-12 PM RUN EASY 51min (EASY) | d6 2026-11-16 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-17 PM RUN LONG 38min (LONG) | d1 2026-11-18 PM RUN EASY 51min (EASY) | d2 2026-11-19 PM RUN EASY 51min (EASY) | d6 2026-11-23 AM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-18","weeks":12,"asOf":"2026-12-18","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 5x6 99KG TOTAL"],"equipment":["BODYWEIGHT","MACHINES","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4,5,6],"strengthDays":[1,2,3,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":73,"strengthMinutes":60,"longRunDay":6,"longRunMinutes":111,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-19 AM STRENGTH_LOWER 31min: leg-press 5x6 RIR3 99kg TOTAL; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-20 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; machine-chest-press 1x10 RIR3 establish; seated-cable-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-12-21 AM RUN EASY 15min (EASY) | d3 2026-12-21 AM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-22 AM RUN EASY 15min (EASY) | d4 2026-12-22 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d5 2026-12-23 AM RUN EASY 15min (EASY) | d5 2026-12-23 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-24 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d1 2026-12-26 AM STRENGTH_LOWER 31min: leg-press 5x6 RIR3 99kg TOTAL; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-27 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged; seated-cable-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d3 2026-12-28 AM RUN EASY 20min (EASY) | d3 2026-12-28 AM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-29 AM RUN EASY 20min (EASY) | d4 2026-12-29 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d5 2026-12-30 AM RUN EASY 20min (EASY) | d5 2026-12-30 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-31 AM RUN WALK 20min (WALK)

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

## R7D-G019

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-10","weeks":12,"asOf":"2026-12-10","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x12 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3,4],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":43,"strengthMinutes":55,"longRunDay":0,"longRunMinutes":36,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-10 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-12 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-13 PM RUN WALK 20min (WALK) | d4 2026-12-14 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-17 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-19 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-20 PM RUN WALK 20min (WALK) | d4 2026-12-21 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

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

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, CLINICAL_SIGNAL, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-03","weeks":16,"asOf":"2026-12-02","tz":-180,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-16"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-03-16"},"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":220,"longestRunMinutes":17,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":41,"strengthMinutes":46,"longRunDay":2,"longRunMinutes":120,"sameTurnConfirmed":true}}`

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

## R7D-G021

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":16,"asOf":"2026-11-08","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":35,"longestRunMinutes":34,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","KETTLEBELL","BANDS","PULL_UP_BAR","DUMBBELLS","RACK","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":48,"strengthMinutes":46,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-10 PM STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-11-11 PM STRENGTH_UPPER 29min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d6 2026-11-15 PM STRENGTH_FULL_B 31min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-overhead-triceps-extension 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d1 2026-11-17 PM STRENGTH_LOWER 34min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d2 2026-11-18 PM STRENGTH_UPPER 34min: db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d6 2026-11-22 PM STRENGTH_FULL_B 38min: db-rdl 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-overhead-triceps-extension 2x10 RIR3 last logged

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

**Intake.** `{"startDate":"2026-11-28","weeks":8,"asOf":"2026-11-25","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":104,"longestRunMinutes":48,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 4x5 10KG PER_HAND","kb-deadlift 3x5 28KG SINGLE_IMPLEMENT","db-split-squat 4x5 30KG TOTAL"],"equipment":["DUMBBELLS","BARBELL","BODYWEIGHT","RACK","BANDS","BENCH","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[0,1,2,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":52,"strengthMinutes":46,"longRunDay":0,"longRunMinutes":57,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-28 AM RUN LONG 45min (LONG) | d0 2026-11-28 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2026-11-29 AM STRENGTH_LOWER 34min: goblet-squat 4x5 RIR3 10kg PER_HAND; kb-deadlift 3x5 RIR3 28kg SINGLE_IMPLEMENT; db-split-squat 4x5 RIR3 30kg TOTAL; db-calf-raise 1x10 RIR3 establish; side-lying-hip-abduction 1x10 RIR3 BW | d2 2026-11-30 AM STRENGTH_LOWER_B 28min: kb-deadlift 3x5 RIR3 28kg SINGLE_IMPLEMENT; db-split-squat 4x5 RIR3 30kg TOTAL; seated-calf-raise-db 1x10 RIR3 establish; tibialis-raise 1x10 RIR3 BW | d5 2026-12-03 AM STRENGTH_UPPER_B 20min: band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-05 AM RUN LONG 50min (LONG) | d0 2026-12-05 AM STRENGTH_UPPER 24min: push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 1x12 RIR3 BW; db-row 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d1 2026-12-06 AM STRENGTH_LOWER 36min: goblet-squat 4x7 RIR3 10kg PER_HAND; kb-deadlift 3x7 RIR3 28kg SINGLE_IMPLEMENT; db-split-squat 4x7 RIR3 30kg TOTAL; db-calf-raise 1x10 RIR3 last logged; side-lying-hip-abduction 1x12 RIR3 BW | d2 2026-12-07 AM STRENGTH_LOWER_B 29min: kb-deadlift 3x7 RIR3 28kg SINGLE_IMPLEMENT; db-split-squat 4x7 RIR3 30kg TOTAL; seated-calf-raise-db 1x10 RIR3 last logged; tibialis-raise 1x12 RIR3 BW | d5 2026-12-10 AM STRENGTH_UPPER_B 21min: band-row 2x10 RIR3 BW; push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW

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

## R7D-G023

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-07","weeks":8,"asOf":"2027-01-04","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-22"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-02-22"},"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["leg-press 5x5 117KG TOTAL"],"equipment":["PULL_UP_BAR","DUMBBELLS","RACK","BANDS","KETTLEBELL","BODYWEIGHT","MACHINES","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0,1,2,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":82,"strengthMinutes":26,"longRunDay":4,"longRunMinutes":121,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2027-01-07 PM STRENGTH_LOWER 24min: leg-press 4x5 RIR3 117kg TOTAL; kb-deadlift 2x5 RIR3 establish | d0 2027-01-07 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-08 PM STRENGTH_UPPER 22min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; machine-chest-press 2x7 RIR3 establish | d1 2027-01-08 PM RUN WALK 20min (WALK) | d2 2027-01-09 PM STRENGTH_LOWER_B 22min: kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x5 RIR3 BW; seated-calf-raise-db 2x7 RIR3 establish | d2 2027-01-09 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2027-01-10 PM RUN WALK 20min (WALK) | d4 2027-01-11 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2027-01-12 PM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2027-01-13 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d6 2027-01-13 PM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2027-01-14 PM STRENGTH_LOWER 24min: leg-press 3x5 RIR3 117kg TOTAL; kb-deadlift 3x5 RIR3 last logged | d0 2027-01-14 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-15 PM STRENGTH_UPPER 24min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged | d1 2027-01-15 PM RUN WALK 20min (WALK) | d2 2027-01-16 PM STRENGTH_LOWER_B 24min: kb-deadlift 3x5 RIR3 last logged; reverse-lunge 3x5 RIR3 BW | d2 2027-01-16 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-17 PM RUN WALK 20min (WALK) | d4 2027-01-18 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-19 PM STRENGTH_UPPER_B 24min: db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged | d6 2027-01-20 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; front-plank 2x7 RIR3 BW | d6 2027-01-20 PM RUN WALK 20min (WALK)
- Week 5 (TAPER): d0 2027-02-11 PM STRENGTH_LOWER 20min: leg-press 2x5 RIR3 117kg TOTAL; kb-deadlift 2x5 RIR3 last logged; reverse-lunge 1x7 RIR3 BW | d0 2027-02-11 PM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d1 2027-02-12 PM STRENGTH_UPPER 20min: db-floor-press 2x5 RIR3 last logged; db-row 2x5 RIR3 last logged; machine-chest-press 1x7 RIR3 last logged | d1 2027-02-12 PM RUN WALK 20min (WALK) | d2 2027-02-13 PM STRENGTH_LOWER_B 21min: kb-deadlift 2x5 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; seated-calf-raise-db 1x7 RIR3 last logged | d2 2027-02-13 PM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d3 2027-02-14 PM RUN WALK 20min (WALK) | d4 2027-02-15 PM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d5 2027-02-16 PM STRENGTH_UPPER_B 13min: db-row 1x5 RIR4 last logged; db-floor-press 1x5 RIR4 last logged | d6 STRENGTH REST_BY_DESIGN | d6 2027-02-17 PM RUN WALK 20min (WALK)
- Week 6 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2027-02-18 PM RUN WALK_JOG 26min (WALK_JOG 5x(90s jog/120s walk)) | d1 STRENGTH REST_BY_DESIGN | d1 2027-02-19 PM RUN WALK 20min (WALK) | d2 STRENGTH REST_BY_DESIGN | d2 2027-02-20 PM RUN WALK_JOG 26min (WALK_JOG 5x(90s jog/120s walk)) | d3 2027-02-21 PM RUN WALK 20min (WALK) | d4 2027-02-22  RUN RACE 75min (RACE, completion) | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN | d6 2027-02-24 PM RUN WALK 20min (WALK)

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

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":12,"asOf":"2026-11-19","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-10"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-02-10"},"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["back-squat 3x10 90KG TOTAL","glute-bridge 5x10 0KG BODYWEIGHT"],"equipment":["MACHINES","RACK","BENCH","BARBELL","KETTLEBELL","DUMBBELLS","PULL_UP_BAR","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,4,6],"strengthDays":[0,3,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":77,"strengthMinutes":21,"longRunDay":4,"longRunMinutes":70,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-22 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-11-22 PM STRENGTH_LOWER 19min: back-squat 2x10 RIR3 90kg TOTAL; glute-bridge 2x10 RIR3 BW | d2 2026-11-24 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-25 PM STRENGTH_UPPER 19min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish | d4 2026-11-26 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-11-26 PM STRENGTH_LOWER_B 19min: glute-bridge 2x10 RIR3 BW; db-split-squat 2x8 RIR3 establish | d5 2026-11-27 PM STRENGTH_UPPER_B 19min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish | d6 2026-11-28 AM RUN WALK 20min (WALK) | d6 2026-11-28 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW
- Week 1 (BUILD): d0 2026-11-29 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-11-29 PM STRENGTH_LOWER 19min: back-squat 2x10 RIR3 90kg TOTAL; glute-bridge 2x10 RIR3 BW | d2 2026-12-01 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-02 PM STRENGTH_UPPER 21min: db-bench-press 3x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d4 2026-12-03 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-03 PM STRENGTH_LOWER_B 19min: glute-bridge 2x10 RIR3 BW; db-split-squat 2x8 RIR3 last logged | d5 2026-12-04 PM STRENGTH_UPPER_B 21min: db-row 3x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged | d6 2026-12-05 AM RUN WALK 20min (WALK) | d6 2026-12-05 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 last logged; front-plank 2x10 RIR3 BW
- Week 10 (TAPER): d0 2027-01-31 AM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d0 2027-01-31 PM STRENGTH_LOWER 21min: back-squat 2x12 RIR3 92.5kg TOTAL; glute-bridge 2x12 RIR3 BW; db-calf-raise 1x10 RIR3 last logged | d2 2027-02-02 AM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d3 2027-02-03 PM STRENGTH_UPPER 20min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-lateral-raise 1x10 RIR3 establish | d4 2027-02-04 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d4 2027-02-04 PM STRENGTH_LOWER_B 14min: glute-bridge 1x12 RIR4 BW; db-split-squat 1x8 RIR4 last logged | d5 STRENGTH REST_BY_DESIGN | d6 2027-02-06 AM RUN WALK 20min (WALK) | d6 STRENGTH REST_BY_DESIGN
- Week 11 (RACE_WEEK): d0 2027-02-07 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d0 STRENGTH REST_BY_DESIGN | d2 2027-02-09 AM RUN WALK 20min (WALK) | d3 STRENGTH REST_BY_DESIGN | d3 2027-02-10  RUN RACE 150min (RACE, completion) | d4 RUN REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d6 2027-02-13 AM RUN WALK 20min (WALK) | d6 STRENGTH REST_BY_DESIGN

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":8,"asOf":"2026-11-10","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":225,"longestRunMinutes":15,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","KETTLEBELL","BODYWEIGHT","PULL_UP_BAR","RACK","BANDS","BARBELL","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4,5,6],"strengthDays":[2,3,4,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":67,"strengthMinutes":21,"longRunDay":5,"longRunMinutes":142,"sameTurnConfirmed":false}}`

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

## R7D-G026

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-16","weeks":4,"asOf":"2026-12-14","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-04"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-01-04"},"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x8 0KG BODYWEIGHT","glute-bridge 5x12 0KG BODYWEIGHT","reverse-lunge 5x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5,6],"strengthDays":[1,2,3,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":51,"strengthMinutes":52,"longRunDay":5,"longRunMinutes":30,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-16 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-17 PM RUN WALK 20min (WALK) | d1 2026-12-17 PM STRENGTH_LOWER 36min: box-squat-bodyweight 3x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 5x5 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-18 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-18 PM STRENGTH_UPPER 21min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2026-12-19 PM RUN WALK 20min (WALK) | d3 2026-12-19 PM STRENGTH_LOWER_B 32min: glute-bridge 2x8 RIR3 BW; reverse-lunge 5x5 RIR3 BW; bent-knee-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2026-12-21 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-22 PM RUN WALK 20min (WALK) | d6 2026-12-22 PM STRENGTH_UPPER_B 21min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-23 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-24 PM RUN WALK 20min (WALK) | d1 2026-12-24 PM STRENGTH_LOWER 39min: box-squat-bodyweight 3x8 RIR3 BW; glute-bridge 3x8 RIR3 BW; reverse-lunge 5x5 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-25 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-25 PM STRENGTH_UPPER 23min: incline-push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2026-12-26 PM RUN WALK 20min (WALK) | d3 2026-12-26 PM STRENGTH_LOWER_B 35min: glute-bridge 3x8 RIR3 BW; reverse-lunge 5x5 RIR3 BW; bent-knee-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2026-12-28 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-29 PM RUN WALK 20min (WALK) | d6 2026-12-29 PM STRENGTH_UPPER_B 11min: incline-push-up 1x8 RIR4 BW
- Week 1 (BUILD): d0 2026-12-23 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-24 PM RUN WALK 20min (WALK) | d1 2026-12-24 PM STRENGTH_LOWER 39min: box-squat-bodyweight 3x8 RIR3 BW; glute-bridge 3x8 RIR3 BW; reverse-lunge 5x5 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-25 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-25 PM STRENGTH_UPPER 23min: incline-push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2026-12-26 PM RUN WALK 20min (WALK) | d3 2026-12-26 PM STRENGTH_LOWER_B 35min: glute-bridge 3x8 RIR3 BW; reverse-lunge 5x5 RIR3 BW; bent-knee-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2026-12-28 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-29 PM RUN WALK 20min (WALK) | d6 2026-12-29 PM STRENGTH_UPPER_B 11min: incline-push-up 1x8 RIR4 BW
- Week 2 (RACE_WEEK): d0 2026-12-30 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-31 PM RUN WALK 20min (WALK) | d1 STRENGTH REST_BY_DESIGN | d2 2027-01-01 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 STRENGTH REST_BY_DESIGN | d3 2027-01-02 PM RUN WALK 20min (WALK) | d3 STRENGTH REST_BY_DESIGN | d5 2027-01-04  RUN RACE 150min (RACE, completion) | d6 RUN REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-16","weeks":16,"asOf":"2026-12-15","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":204,"longestRunMinutes":82,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BANDS","BENCH","PULL_UP_BAR","RACK","KETTLEBELL","BARBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2],"strengthDays":[4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":60,"strengthMinutes":30,"longRunDay":2,"longRunMinutes":149,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-12-18 PM RUN LONG 80min (LONG) | d4 2026-12-20 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d5 2026-12-21 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW | d6 2026-12-22 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2026-12-25 PM RUN LONG 80min (LONG) | d4 2026-12-27 AM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW | d5 2026-12-28 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW | d6 2026-12-29 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-17","weeks":8,"asOf":"2026-12-15","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":222,"longestRunMinutes":44,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","BENCH","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,4,6],"strengthDays":[0,1,2],"runTurn":"PM","strengthTurn":"PM","runMinutes":26,"strengthMinutes":53,"longRunDay":6,"longRunMinutes":78,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-17 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d0 2026-12-17 PM RUN EASY 26min (EASY) | d1 2026-12-18 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-19 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-20 PM RUN EASY 26min (EASY) | d4 2026-12-21 PM RUN EASY 26min (EASY) | d6 2026-12-23 PM RUN LONG 40min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-12-24 PM RUN EASY 26min (EASY) | d0 2026-12-24 PM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-25 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-26 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d3 2026-12-27 PM RUN EASY 26min (EASY) | d4 2026-12-28 PM RUN EASY 26min (EASY) | d6 2026-12-30 PM RUN LONG 40min (LONG)

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":16,"asOf":"2026-12-12","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-23"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-03-23"},"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x5 0KG BODYWEIGHT","glute-bridge 4x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":44,"strengthMinutes":53,"longRunDay":3,"longRunMinutes":64,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d3 2026-12-15 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-16 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d3 2026-12-22 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-23 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 13 (TAPER): d3 2027-03-16 AM RUN EASY 20min (EASY) | d4 2027-03-17 AM RUN EASY 15min (EASY)
- Week 14 (RACE_WEEK): d3 2027-03-23  RUN RACE 150min (RACE, completion) | d4 RUN REST_BY_DESIGN

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

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-17","weeks":8,"asOf":"2026-12-15","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-02"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-02-02"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":294,"longestRunMinutes":129,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","MACHINES","PULL_UP_BAR","BENCH","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4],"strengthDays":[1],"runTurn":"AM","strengthTurn":"AM","runMinutes":55,"strengthMinutes":51,"longRunDay":4,"longRunMinutes":52,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d1 2026-12-18 AM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; push-up 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-21 AM RUN LONG 52min (LONG)
- Week 1 (BUILD): d1 2026-12-25 AM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-28 AM RUN LONG 52min (LONG)
- Week 5 (TAPER): d1 2027-01-22 AM STRENGTH_FULL_A 20min: kb-goblet-squat 1x8 RIR3 last logged; push-up 1x10 RIR3 BW; seated-cable-row 1x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-25 AM RUN LONG 35min (LONG)
- Week 6 (RACE_WEEK): d1 2027-01-29 AM STRENGTH_FULL_A 16min: kb-goblet-squat 1x8 RIR4 last logged; push-up 1x10 RIR4 BW; seated-cable-row 1x8 RIR4 last logged | d4 2027-02-01 AM RUN SHAKEOUT 15min (SHAKEOUT) | d5 2027-02-02  RUN RACE 75min (RACE)

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":4,"asOf":"2026-12-03","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x12 31KG SINGLE_IMPLEMENT"],"equipment":["KETTLEBELL","BENCH","MACHINES","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,6],"strengthDays":[0,1,2,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":42,"strengthMinutes":75,"longRunDay":3,"longRunMinutes":123,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-06 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-06 PM STRENGTH_LOWER 31min: kb-goblet-squat 5x8 RIR3 31kg SINGLE_IMPLEMENT; kb-deadlift 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-07 PM STRENGTH_UPPER 24min: machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; push-up 1x10 RIR3 BW; kb-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-12-08 PM STRENGTH_LOWER_B 22min: kb-deadlift 2x8 RIR3 establish; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-09 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-10 PM STRENGTH_UPPER_B 20min: seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2026-12-11 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-12-12 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-13 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-13 PM STRENGTH_LOWER 31min: kb-goblet-squat 5x8 RIR3 31kg SINGLE_IMPLEMENT; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-14 PM STRENGTH_UPPER 24min: machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; push-up 1x10 RIR3 BW; kb-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2026-12-15 PM STRENGTH_LOWER_B 22min: kb-deadlift 2x8 RIR3 last logged; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-16 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-17 PM STRENGTH_UPPER_B 20min: seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2026-12-18 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-12-19 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":16,"asOf":"2026-12-02","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":38,"longestRunMinutes":73,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x8 0KG BODYWEIGHT","glute-bridge 2x10 0KG BODYWEIGHT","reverse-lunge 4x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":10,"reasonCategory":"TRAVEL"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[0,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":21,"strengthMinutes":51,"longRunDay":1,"longRunMinutes":80,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-02 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-12-02 PM RUN EASY 15min (EASY) | d1 2026-12-03 PM RUN EASY 15min (EASY) | d2 2026-12-04 PM RUN EASY 15min (EASY) | d5 2026-12-07 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-09 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-12-09 PM RUN EASY 20min (EASY) | d1 2026-12-10 PM RUN EASY 20min (EASY) | d2 2026-12-11 PM RUN EASY 20min (EASY) | d5 2026-12-14 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

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

## R7D-G033

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-05","weeks":4,"asOf":"2026-12-05","tz":0,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-23"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2026-12-23"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":28,"longestRunMinutes":40,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","BODYWEIGHT","RACK","KETTLEBELL","BARBELL","BANDS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5],"strengthDays":[0,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":45,"strengthMinutes":28,"longRunDay":5,"longRunMinutes":55,"sameTurnConfirmed":true}}`

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

## R7D-G034

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":4,"asOf":"2026-11-29","tz":330,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":100,"longestRunMinutes":86,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[4],"runTurn":"PM","strengthTurn":"PM","runMinutes":89,"strengthMinutes":36,"sameTurnConfirmed":false}}`

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

## R7D-G035

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":8,"asOf":"2026-12-20","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-10"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-02-10"},"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":240,"longestRunMinutes":28,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES","KETTLEBELL","BENCH","PULL_UP_BAR","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,5],"strengthDays":[2,3,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":57,"strengthMinutes":20,"longRunDay":1,"longRunMinutes":131,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d1 2026-12-22 PM RUN LONG 25min (LONG) | d2 2026-12-23 AM STRENGTH_LOWER 19min: kb-goblet-squat 2x5 RIR3 establish; kb-deadlift 2x5 RIR3 establish | d3 2026-12-24 AM STRENGTH_UPPER 19min: machine-chest-press 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish | d5 2026-12-26 PM RUN EASY 28min (EASY) | d5 2026-12-26 AM STRENGTH_LOWER_B 19min: kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x5 RIR3 BW | d6 2026-12-27 AM STRENGTH_UPPER_B 19min: seated-cable-row 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish
- Week 1 (BUILD): d1 2026-12-29 PM RUN LONG 25min (LONG) | d2 2026-12-30 AM STRENGTH_LOWER 19min: kb-goblet-squat 2x5 RIR3 last logged; kb-deadlift 2x5 RIR3 last logged | d3 2026-12-31 AM STRENGTH_UPPER 19min: machine-chest-press 2x5 RIR3 last logged; seated-cable-row 2x5 RIR3 last logged | d5 2027-01-02 PM RUN EASY 28min (EASY) | d5 2027-01-02 AM STRENGTH_LOWER_B 19min: kb-deadlift 2x5 RIR3 last logged; reverse-lunge 2x5 RIR3 BW | d6 2027-01-03 AM STRENGTH_UPPER_B 19min: seated-cable-row 2x5 RIR3 last logged; machine-chest-press 2x5 RIR3 last logged
- Week 6 (TAPER): d1 2027-02-02 PM RUN LONG 30min (LONG) | d2 2027-02-03 AM STRENGTH_LOWER 20min: kb-goblet-squat 2x5 RIR3 last logged; kb-deadlift 2x5 RIR3 last logged; reverse-lunge 1x9 RIR3 BW | d3 2027-02-04 AM STRENGTH_UPPER 13min: machine-chest-press 1x5 RIR4 last logged; seated-cable-row 1x5 RIR4 last logged | d5 2027-02-06 PM RUN EASY 15min (EASY) | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN
- Week 7 (RACE_WEEK): d1 2027-02-09 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d2 STRENGTH REST_BY_DESIGN | d2 2027-02-10  RUN RACE 75min (RACE) | d3 STRENGTH REST_BY_DESIGN | d5 2027-02-13 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

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

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":4,"asOf":"2026-12-05","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-31"}},"strength":"NONE"},"event":{"kind":"10K","date":"2026-12-31"},"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":78,"longestRunMinutes":33,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","KETTLEBELL","PULL_UP_BAR","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":65,"strengthMinutes":50,"longRunDay":0,"longRunMinutes":84,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · SPECIFIC · RACE_WEEK
- Week 0 (BUILD): d0 2026-12-08 PM RUN LONG 30min (LONG) | d2 2026-12-10 PM RUN EASY 33min (EASY)
- Week 1 (SPECIFIC): d0 2026-12-15 PM RUN LONG 35min (LONG) | d2 2026-12-17 PM RUN EASY 33min (EASY)
- Week 2 (SPECIFIC): d0 2026-12-22 PM RUN LONG 40min (LONG) | d2 2026-12-24 PM RUN EASY 33min (EASY +strides)
- Week 3 (RACE_WEEK): d0 2026-12-29 PM RUN EASY 15min (EASY) | d2 2026-12-31  RUN RACE 75min (RACE)

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-11","weeks":16,"asOf":"2026-12-11","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":294,"longestRunMinutes":106,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","RACK","BARBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":84,"strengthMinutes":66,"longRunDay":5,"longRunMinutes":92,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-11 AM RUN EASY 40min (EASY) | d1 2026-12-12 AM RUN EASY 40min (EASY) | d2 2026-12-13 AM RUN EASY 40min (EASY) | d4 2026-12-15 AM RUN EASY 40min (EASY) | d4 2026-12-15 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d5 2026-12-16 AM RUN LONG 92min (LONG) | d6 2026-12-17 AM RUN EASY 40min (EASY) | d6 2026-12-17 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-18 AM RUN EASY 40min (EASY) | d1 2026-12-19 AM RUN EASY 40min (EASY) | d2 2026-12-20 AM RUN EASY 40min (EASY) | d4 2026-12-22 AM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-22 AM RUN EASY 40min (EASY) | d5 2026-12-23 AM RUN LONG 92min (LONG) | d6 2026-12-24 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-24 AM RUN EASY 40min (EASY)

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

## R7D-G038

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":8,"asOf":"2026-12-07","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":22,"longestRunMinutes":22,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2],"strengthDays":[0,2,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":44,"strengthMinutes":52,"longRunDay":2,"longRunMinutes":122,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-09 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-12-11 PM RUN LONG 20min (LONG) | d2 2026-12-11 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-12 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-16 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-18 PM RUN LONG 20min (LONG) | d2 2026-12-18 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-19 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW

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

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-17","weeks":4,"asOf":"2026-12-17","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-02"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-01-02"},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":255,"longestRunMinutes":28,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x10 0KG BODYWEIGHT"],"equipment":["BANDS"],"pause":{"nonclinical":true,"weeks":2,"reasonCategory":"TRAVEL"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4],"strengthDays":[0,1,3,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":77,"strengthMinutes":66,"longRunDay":3,"longRunMinutes":123,"sameTurnConfirmed":false}}`

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

## R7D-G040

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":4,"asOf":"2026-11-16","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":150,"longestRunMinutes":99,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":70,"strengthMinutes":63,"longRunDay":2,"longRunMinutes":94,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2026-11-19 AM RUN LONG 94min (LONG)
- Week 1 (DEVELOPMENT): d2 2026-11-26 AM RUN LONG 94min (LONG)

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":4,"asOf":"2026-11-19","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":252,"longestRunMinutes":49,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BODYWEIGHT","DUMBBELLS","BENCH","RACK","BARBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":29,"strengthMinutes":22,"longRunDay":0,"longRunMinutes":147,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-21 PM RUN LONG 45min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-28 PM RUN LONG 50min (LONG)

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-08","weeks":16,"asOf":"2027-01-08","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-28"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-04-28"},"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":98,"longestRunMinutes":57,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["goblet-squat 2x12 11KG PER_HAND","glute-bridge 5x10 0KG BODYWEIGHT","reverse-lunge 2x12 0KG BODYWEIGHT"],"equipment":["BENCH","BODYWEIGHT","RACK","PULL_UP_BAR","BANDS","MACHINES","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":38,"strengthMinutes":21,"longRunDay":4,"longRunMinutes":66,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d4 2027-01-12 AM RUN LONG 55min (LONG) | d6 2027-01-14 AM RUN EASY 38min (EASY)
- Week 1 (BUILD): d4 2027-01-19 AM RUN LONG 60min (LONG) | d6 2027-01-21 AM RUN EASY 38min (EASY)
- Week 14 (TAPER): d4 2027-04-20 AM RUN LONG 38min (LONG) | d6 2027-04-22 AM RUN EASY 20min (EASY)
- Week 15 (RACE_WEEK): d4 2027-04-27 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d5 2027-04-28  RUN RACE 150min (RACE, completion) | d6 RUN REST_BY_DESIGN

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

## R7D-G043

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-25","weeks":8,"asOf":"2026-11-25","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":6,"runMinutesPerWeek":300,"longestRunMinutes":103,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BODYWEIGHT","DUMBBELLS","KETTLEBELL","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[3,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":30,"strengthMinutes":63,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d3 2026-11-28 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d4 2026-11-29 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-30 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d3 2026-12-05 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-06 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-07 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":8,"asOf":"2026-11-25","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","PULL_UP_BAR","MACHINES","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":58,"strengthMinutes":49,"longRunDay":1,"longRunMinutes":140,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-28 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-29 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-05 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-06 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

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

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":12,"asOf":"2026-11-14","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-31"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-01-31"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":240,"longestRunMinutes":21,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["back-squat 3x8 52KG TOTAL","barbell-rdl 5x5 82KG TOTAL"],"equipment":["DUMBBELLS","BANDS","PULL_UP_BAR","BENCH","RACK","BARBELL","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[6],"strengthDays":[0,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":77,"strengthMinutes":59,"longRunDay":6,"longRunMinutes":146,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d0 2026-11-15 AM STRENGTH_FULL_A 30min: back-squat 3x8 RIR3 52kg TOTAL; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2026-11-19 AM STRENGTH_FULL_B 34min: barbell-rdl 5x5 RIR3 82kg TOTAL; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-11-21 PM RUN LONG 20min (LONG)
- Week 1 (BUILD): d0 2026-11-22 AM STRENGTH_FULL_A 31min: back-squat 3x10 RIR3 52kg TOTAL; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d4 2026-11-26 AM STRENGTH_FULL_B 35min: barbell-rdl 5x7 RIR3 82kg TOTAL; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2026-11-28 PM RUN LONG 25min (LONG)
- Week 10 (TAPER): d0 2027-01-24 AM STRENGTH_FULL_A 20min: back-squat 1x8 RIR3 57kg TOTAL; db-floor-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d4 2027-01-28 AM STRENGTH_FULL_B 17min: barbell-rdl 1x12 RIR4 84.5kg TOTAL; db-row 1x10 RIR4 last logged; db-floor-press 1x10 RIR4 last logged | d6 2027-01-30 PM RUN SHAKEOUT 15min (SHAKEOUT)
- Week 11 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2027-01-31  RUN RACE 75min (RACE) | d4 STRENGTH REST_BY_DESIGN | d6 2027-02-06 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":8,"asOf":"2026-12-18","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["leg-press 5x6 81KG TOTAL","glute-bridge 5x12 0KG BODYWEIGHT","reverse-lunge 2x8 0KG BODYWEIGHT"],"equipment":["PULL_UP_BAR","BANDS","BODYWEIGHT","KETTLEBELL","BENCH","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4,6],"strengthDays":[4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":58,"strengthMinutes":62,"longRunDay":0,"longRunMinutes":103,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-20 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-21 PM RUN WALK 20min (WALK) | d4 2026-12-24 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-24 AM STRENGTH_LOWER 29min: kb-goblet-squat 2x8 RIR3 establish; kb-deadlift 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2026-12-25 AM STRENGTH_UPPER 29min: machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish; band-biceps-curl 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2026-12-26 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-26 AM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; leg-curl-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-27 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-28 PM RUN WALK 20min (WALK) | d4 2026-12-31 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-31 AM STRENGTH_LOWER 34min: kb-goblet-squat 3x8 RIR3 last logged; kb-deadlift 3x8 RIR3 last logged; leg-extension-machine 2x10 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d5 2027-01-01 AM STRENGTH_UPPER 34min: machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged; band-biceps-curl 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2027-01-02 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-02 AM STRENGTH_FULL_B 38min: kb-deadlift 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; machine-chest-press 3x8 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW

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

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":4,"asOf":"2026-11-27","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-12"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2026-12-12"},"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":32,"longestRunMinutes":57,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","DUMBBELLS","RACK","MACHINES","KETTLEBELL","BARBELL","PULL_UP_BAR","BODYWEIGHT","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,5,6],"strengthDays":[3],"runTurn":"PM","strengthTurn":"PM","runMinutes":66,"strengthMinutes":59,"longRunDay":2,"longRunMinutes":72,"sameTurnConfirmed":true}}`

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

## R7D-G048

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":4,"asOf":"2026-11-27","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":306,"longestRunMinutes":77,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,5],"strengthDays":[0,1,2,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":52,"strengthMinutes":49,"longRunDay":0,"longRunMinutes":150,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-30 PM RUN LONG 75min (LONG) | d0 2026-11-30 AM STRENGTH_UPPER 28min: machine-chest-press 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish; push-up 2x7 RIR3 BW; lat-pulldown 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2026-12-01 AM STRENGTH_LOWER 28min: leg-press 2x5 RIR3 establish; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-02 AM STRENGTH_LOWER_B 25min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-03 AM STRENGTH_UPPER_B 22min: seated-cable-row 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-12-05 PM RUN EASY 52min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-07 PM RUN LONG 75min (LONG) | d0 2026-12-07 AM STRENGTH_UPPER 34min: machine-chest-press 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged; push-up 2x7 RIR3 BW; lat-pulldown 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d1 2026-12-08 AM STRENGTH_LOWER 34min: leg-press 3x5 RIR3 last logged; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-09 AM STRENGTH_LOWER_B 31min: glute-bridge 3x5 RIR3 BW; reverse-lunge 3x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-10 AM STRENGTH_UPPER_B 28min: seated-cable-row 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; dead-bug 2x7 RIR3 BW | d5 2026-12-12 PM RUN EASY 52min (EASY)

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":4,"asOf":"2026-11-29","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":53,"longestRunMinutes":70,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","BANDS","RACK","BENCH","PULL_UP_BAR","DUMBBELLS","KETTLEBELL","BODYWEIGHT","MACHINES"],"pause":{"nonclinical":true,"weeks":7,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,6],"strengthDays":[3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":30,"strengthMinutes":60,"longRunDay":4,"longRunMinutes":56,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-02 PM RUN EASY 15min (EASY) | d1 2026-12-03 PM RUN WALK 20min (WALK) | d3 2026-12-05 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-12-05 PM RUN EASY 15min (EASY) | d4 2026-12-06 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2026-12-06 PM RUN WALK 20min (WALK) | d6 2026-12-08 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-09 PM RUN EASY 20min (EASY) | d1 2026-12-10 PM RUN WALK 20min (WALK) | d3 2026-12-12 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d3 2026-12-12 PM RUN EASY 20min (EASY) | d4 2026-12-13 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d4 2026-12-13 PM RUN WALK 20min (WALK) | d6 2026-12-15 PM RUN EASY 20min (EASY)

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-27","weeks":16,"asOf":"2026-11-27","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x10 29KG SINGLE_IMPLEMENT","db-rdl 5x8 58KG TOTAL","reverse-lunge 5x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT","RACK","PULL_UP_BAR","KETTLEBELL","DUMBBELLS","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,3,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":65,"strengthMinutes":69,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-11-28 AM STRENGTH_LOWER 38min: kb-goblet-squat 2x10 RIR3 29kg SINGLE_IMPLEMENT; db-rdl 5x8 RIR3 58kg TOTAL; reverse-lunge 5x6 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-29 AM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; incline-push-up 1x12 RIR3 BW; kb-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d3 2026-11-30 AM STRENGTH_LOWER_B 37min: db-rdl 5x8 RIR3 58kg TOTAL; reverse-lunge 5x6 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-01 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d5 2026-12-02 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-05 AM STRENGTH_LOWER 40min: kb-goblet-squat 2x12 RIR3 29kg SINGLE_IMPLEMENT; db-rdl 5x10 RIR3 58kg TOTAL; reverse-lunge 5x8 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-12-06 AM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; incline-push-up 1x14 RIR3 BW; kb-row 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d3 2026-12-07 AM STRENGTH_LOWER_B 38min: db-rdl 5x10 RIR3 58kg TOTAL; reverse-lunge 5x8 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d4 2026-12-08 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d5 2026-12-09 AM STRENGTH_CORE 14min: dead-bug 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; front-plank 1x14 RIR3 BW

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

## R7D-G051

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-14","weeks":4,"asOf":"2026-11-13","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":336,"longestRunMinutes":32,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["leg-press 2x6 118KG TOTAL","db-rdl 5x6 6KG PER_HAND","db-split-squat 4x12 46KG TOTAL"],"equipment":["MACHINES","DUMBBELLS","PULL_UP_BAR","RACK","KETTLEBELL","BODYWEIGHT","BARBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4,6],"strengthDays":[0,1,3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":66,"strengthMinutes":48,"longRunDay":4,"longRunMinutes":84,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-14 PM RUN EASY 32min (EASY) | d0 2026-11-14 PM STRENGTH_LOWER 36min: leg-press 2x6 RIR3 118kg TOTAL; db-rdl 5x6 RIR3 6kg PER_HAND; db-split-squat 4x8 RIR3 46kg TOTAL; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-15 PM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; machine-chest-press 1x10 RIR3 establish; seated-cable-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-11-17 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2026-11-18 PM RUN LONG 30min (LONG) | d4 2026-11-18 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-11-20 PM RUN EASY 32min (EASY) | d6 2026-11-20 PM STRENGTH_LOWER_B 34min: db-rdl 5x6 RIR3 6kg PER_HAND; db-split-squat 4x8 RIR3 46kg TOTAL; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-21 PM RUN EASY 32min (EASY) | d0 2026-11-21 PM STRENGTH_LOWER 36min: leg-press 2x6 RIR3 118kg TOTAL; db-rdl 5x6 RIR3 6kg PER_HAND; db-split-squat 4x8 RIR3 46kg TOTAL; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-22 PM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged; seated-cable-row 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2026-11-24 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2026-11-25 PM RUN LONG 35min (LONG) | d4 2026-11-25 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2026-11-27 PM RUN EASY 32min (EASY) | d6 2026-11-27 PM STRENGTH_LOWER_B 34min: db-rdl 5x6 RIR3 6kg PER_HAND; db-split-squat 4x8 RIR3 46kg TOTAL; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

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

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":12,"asOf":"2026-11-20","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-08"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-02-08"},"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2],"strengthDays":[2,3,4,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":90,"strengthMinutes":60,"longRunDay":2,"longRunMinutes":61,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d2 2026-11-23 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-23 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-11-24 PM STRENGTH_FULL_B 31min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; band-biceps-curl 2x10 RIR3 BW | d4 2026-11-25 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-26 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d2 2026-11-30 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-11-30 PM STRENGTH_FULL_A 31min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2026-12-01 PM STRENGTH_FULL_B 31min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; band-biceps-curl 2x10 RIR3 BW | d4 2026-12-02 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW | d5 2026-12-03 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW
- Week 10 (TAPER): d2 2027-02-01 AM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d2 2027-02-01 PM STRENGTH_LOWER 26min: box-squat-bodyweight 2x16 RIR3 BW; glute-bridge 2x16 RIR3 BW; lateral-lunge 1x12 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2027-02-02 PM STRENGTH_UPPER 14min: incline-push-up 1x16 RIR4 BW; band-row 1x12 RIR4 BW | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN
- Week 11 (RACE_WEEK): d2 STRENGTH REST_BY_DESIGN | d2 2027-02-08  RUN RACE 150min (RACE, completion) | d3 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN

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

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-29","weeks":12,"asOf":"2026-11-29","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-19"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-02-19"},"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":165,"longestRunMinutes":52,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["goblet-squat 5x12 26KG PER_HAND","barbell-rdl 5x10 84KG TOTAL","db-split-squat 3x6 29KG PER_HAND"],"equipment":["BODYWEIGHT","RACK","DUMBBELLS","PULL_UP_BAR","BENCH","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,5,6],"strengthDays":[0,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":76,"strengthMinutes":40,"longRunDay":5,"longRunMinutes":126,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d0 2026-11-29 AM STRENGTH_FULL_B 38min: barbell-rdl 5x8 RIR3 84kg TOTAL; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 3x6 RIR3 29kg PER_HAND; dead-bug 1x10 RIR3 BW | d4 2026-12-03 AM RUN EASY 52min (EASY) | d5 2026-12-04 AM RUN LONG 50min (LONG) | d5 2026-12-04 AM STRENGTH_FULL_A 35min: goblet-squat 5x8 RIR3 26kg PER_HAND; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-05 AM RUN EASY 52min (EASY)
- Week 1 (BUILD): d0 2026-12-06 AM STRENGTH_FULL_B 38min: barbell-rdl 5x8 RIR3 84kg TOTAL; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 3x6 RIR3 29kg PER_HAND; dead-bug 1x12 RIR3 BW | d4 2026-12-10 AM RUN EASY 52min (EASY) | d5 2026-12-11 AM RUN LONG 55min (LONG) | d5 2026-12-11 AM STRENGTH_FULL_A 35min: goblet-squat 5x8 RIR3 26kg PER_HAND; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2026-12-12 AM RUN EASY 52min (EASY)
- Week 10 (TAPER): d0 2027-02-07 AM STRENGTH_FULL_B 22min: barbell-rdl 2x8 RIR3 84kg TOTAL; db-row 1x8 RIR3 last logged; db-bench-press 1x8 RIR3 last logged; db-split-squat 1x6 RIR3 29kg PER_HAND; dead-bug 1x12 RIR3 BW | d4 2027-02-11 AM RUN EASY 45min (EASY +strides) | d5 2027-02-12 AM RUN LONG 55min (LONG) | d5 2027-02-12 AM STRENGTH_FULL_A 22min: goblet-squat 2x8 RIR3 26kg PER_HAND; db-bench-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2027-02-13 AM RUN EASY 30min (EASY)
- Week 11 (RACE_WEEK): d0 2027-02-14 AM STRENGTH_FULL_B 16min: barbell-rdl 1x8 RIR4 84kg TOTAL; db-row 1x8 RIR4 last logged; db-bench-press 1x8 RIR4 last logged | d4 2027-02-18 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d5 2027-02-19  RUN RACE 150min (RACE) | d5 STRENGTH REST_BY_DESIGN | d6 RUN REST_BY_DESIGN

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

## R7D-G054

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":12,"asOf":"2026-12-09","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":160,"longestRunMinutes":82,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":20,"strengthMinutes":41,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d5 2026-12-14 AM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-15 AM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d5 2026-12-21 AM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-22 AM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

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

## R7D-G055

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":4,"asOf":"2026-11-21","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":188,"longestRunMinutes":69,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x12 0KG BODYWEIGHT"],"equipment":["MACHINES"],"pause":{"nonclinical":true,"weeks":2,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5,6],"strengthDays":[3],"runTurn":"PM","strengthTurn":"PM","runMinutes":38,"strengthMinutes":37,"longRunDay":4,"longRunMinutes":104,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-21 PM RUN EASY 20min (EASY) | d1 2026-11-22 PM RUN EASY 20min (EASY) | d3 2026-11-24 PM STRENGTH_FULL_A 34min: box-squat-bodyweight 3x12 RIR3 BW; machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2026-11-24 PM RUN EASY 20min (EASY) | d4 2026-11-25 PM RUN LONG 65min (LONG) | d5 2026-11-26 PM RUN EASY 20min (EASY) | d6 2026-11-27 PM RUN EASY 20min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-28 PM RUN EASY 20min (EASY) | d1 2026-11-29 PM RUN EASY 20min (EASY) | d3 2026-12-01 PM STRENGTH_FULL_A 35min: box-squat-bodyweight 3x8 RIR3 BW; machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 last logged | d3 2026-12-01 PM RUN EASY 20min (EASY) | d4 2026-12-02 PM RUN LONG 65min (LONG) | d5 2026-12-03 PM RUN EASY 20min (EASY) | d6 2026-12-04 PM RUN EASY 20min (EASY)

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

## R7D-G056

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":16,"asOf":"2026-12-08","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-20"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2027-03-20"},"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x6 0KG BODYWEIGHT","glute-bridge 3x5 0KG BODYWEIGHT","reverse-lunge 2x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,5,6],"strengthDays":[0,2,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":46,"strengthMinutes":48,"longRunDay":5,"longRunMinutes":125,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-09 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-09 PM STRENGTH_LOWER 38min: box-squat-bodyweight 4x6 RIR3 BW; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-12-10 AM RUN WALK 20min (WALK) | d2 2026-12-11 PM STRENGTH_UPPER 20min: incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-12 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-13 PM STRENGTH_LOWER_B 29min: glute-bridge 3x5 RIR3 BW; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-14 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-14 PM STRENGTH_UPPER_B 20min: incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-15 AM RUN WALK 20min (WALK) | d6 2026-12-15 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW
- Week 1 (BUILD): d0 2026-12-16 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-16 PM STRENGTH_LOWER 38min: box-squat-bodyweight 4x6 RIR3 BW; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-12-17 AM RUN WALK 20min (WALK) | d2 2026-12-18 PM STRENGTH_UPPER 23min: incline-push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-19 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-20 PM STRENGTH_LOWER_B 29min: glute-bridge 3x5 RIR3 BW; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-21 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-21 PM STRENGTH_UPPER_B 23min: incline-push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-22 AM RUN WALK 20min (WALK) | d6 2026-12-22 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW
- Week 13 (TAPER): d0 2027-03-10 AM RUN EASY 20min (EASY) | d0 2027-03-10 PM STRENGTH_LOWER 24min: box-squat-bodyweight 2x6 RIR3 BW; glute-bridge 2x5 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2027-03-11 AM RUN EASY 20min (EASY) | d2 2027-03-12 PM STRENGTH_UPPER 18min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-03-13 AM RUN EASY 20min (EASY) | d4 2027-03-14 PM STRENGTH_LOWER_B 13min: glute-bridge 1x5 RIR4 BW; reverse-lunge 1x10 RIR4 BW | d5 2027-03-15 AM RUN EASY 15min (EASY) | d5 STRENGTH REST_BY_DESIGN | d6 2027-03-16 AM RUN EASY 15min (EASY) | d6 STRENGTH REST_BY_DESIGN
- Week 14 (RACE_WEEK): d0 2027-03-17 AM RUN EASY 15min (EASY) | d0 STRENGTH REST_BY_DESIGN | d1 2027-03-18 AM RUN EASY 15min (EASY) | d2 STRENGTH REST_BY_DESIGN | d3 2027-03-20  RUN RACE 150min (RACE, completion) | d4 STRENGTH REST_BY_DESIGN | d5 2027-03-22 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 STRENGTH REST_BY_DESIGN | d6 2027-03-23 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":8,"asOf":"2026-12-02","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x12 0KG BODYWEIGHT"],"equipment":["MACHINES","BANDS","BODYWEIGHT","DUMBBELLS","RACK","KETTLEBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":15,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3],"runTurn":"PM","strengthTurn":"PM","runMinutes":42,"strengthMinutes":62,"sameTurnConfirmed":true}}`

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

## R7D-G058

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":16,"asOf":"2026-12-14","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","RACK","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4],"strengthDays":[0,1,3,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":47,"strengthMinutes":38,"longRunDay":4,"longRunMinutes":38,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-15 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-15 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-16 AM STRENGTH_FULL_B 31min: glute-bridge 2x5 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-18 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-12-19 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-20 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-21 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-22 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-22 AM STRENGTH_FULL_A 31min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2026-12-23 AM STRENGTH_FULL_B 31min: glute-bridge 2x5 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-25 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d4 2026-12-26 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-27 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d6 2026-12-28 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW

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

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":12,"asOf":"2026-12-07","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-02"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-03-02"},"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x8 0KG BODYWEIGHT","glute-bridge 2x6 0KG BODYWEIGHT","reverse-lunge 5x10 0KG BODYWEIGHT"],"equipment":["BENCH","BODYWEIGHT","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":72,"strengthMinutes":61,"longRunDay":4,"longRunMinutes":30,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-09 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-10 PM RUN WALK 20min (WALK) | d2 2026-12-11 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-12 PM RUN WALK 20min (WALK) | d3 2026-12-12 PM STRENGTH_LOWER 31min: box-squat-bodyweight 5x8 RIR3 BW; glute-bridge 2x6 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-13 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-13 PM STRENGTH_UPPER 25min: push-up 2x10 RIR3 BW; kb-row 2x10 RIR3 establish; incline-push-up 1x12 RIR3 BW; band-row 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-14 PM RUN WALK 20min (WALK) | d6 2026-12-15 PM STRENGTH_FULL_B 28min: glute-bridge 2x6 RIR3 BW; kb-row 2x10 RIR3 establish; push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (BUILD): d0 2026-12-16 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-17 PM RUN WALK 20min (WALK) | d2 2026-12-18 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-19 PM RUN WALK 20min (WALK) | d3 2026-12-19 PM STRENGTH_LOWER 31min: box-squat-bodyweight 5x8 RIR3 BW; glute-bridge 2x6 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-20 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-20 PM STRENGTH_UPPER 25min: push-up 2x10 RIR3 BW; kb-row 2x10 RIR3 last logged; incline-push-up 1x12 RIR3 BW; band-row 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-21 PM RUN WALK 20min (WALK) | d6 2026-12-22 PM STRENGTH_FULL_B 28min: glute-bridge 2x6 RIR3 BW; kb-row 2x10 RIR3 last logged; push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 10 (TAPER): d0 2027-02-17 PM RUN EASY 15min (EASY) | d1 2027-02-18 PM RUN EASY 15min (EASY) | d2 2027-02-19 PM RUN EASY 15min (EASY) | d3 2027-02-20 PM RUN EASY 15min (EASY) | d3 2027-02-20 PM STRENGTH_LOWER 23min: box-squat-bodyweight 2x12 RIR3 BW; glute-bridge 1x10 RIR3 BW; reverse-lunge 1x16 RIR3 BW; single-leg-calf-raise 1x16 RIR3 BW; front-plank 1x16 RIR3 BW | d4 2027-02-21 PM RUN EASY 15min (EASY) | d4 2027-02-21 PM STRENGTH_UPPER 20min: push-up 1x16 RIR3 BW; kb-row 1x10 RIR3 last logged; incline-push-up 1x16 RIR3 BW; band-row 1x12 RIR3 BW; front-plank 1x16 RIR3 BW | d5 2027-02-22 PM RUN EASY 15min (EASY) | d6 2027-02-23 PM STRENGTH_FULL_B 21min: glute-bridge 1x10 RIR3 BW; kb-row 1x10 RIR3 last logged; push-up 1x16 RIR3 BW; reverse-lunge 1x16 RIR3 BW; front-plank 1x16 RIR3 BW
- Week 11 (RACE_WEEK): d0 2027-02-24 PM RUN EASY 15min (EASY) | d1 2027-02-25 PM RUN EASY 15min (EASY) | d2 2027-02-26 PM RUN EASY 15min (EASY) | d3 2027-02-27 PM RUN EASY 15min (EASY) | d3 2027-02-27 PM STRENGTH_LOWER 14min: box-squat-bodyweight 1x12 RIR4 BW; glute-bridge 1x10 RIR4 BW | d4 2027-02-28 PM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d5 2027-03-01 PM RUN SHAKEOUT 15min (SHAKEOUT) | d6 STRENGTH REST_BY_DESIGN | d6 2027-03-02  RUN RACE 75min (RACE, completion)

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-24","weeks":12,"asOf":"2026-11-21","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":168,"longestRunMinutes":20,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","RACK","BENCH","BANDS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,3,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":77,"strengthMinutes":29,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-24 PM STRENGTH_LOWER 22min: goblet-squat 2x5 RIR3 establish; db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x7 RIR3 establish | d1 2026-11-25 PM STRENGTH_UPPER 22min: db-bench-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-floor-press 2x7 RIR3 establish | d2 2026-11-26 PM STRENGTH_LOWER_B 22min: db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish | d3 2026-11-27 PM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-bench-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-11-29 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-01 PM STRENGTH_LOWER 28min: goblet-squat 3x5 RIR3 last logged; db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 2x7 RIR3 last logged | d1 2026-12-02 PM STRENGTH_UPPER 28min: db-bench-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-floor-press 2x7 RIR3 last logged | d2 2026-12-03 PM STRENGTH_LOWER_B 28min: db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 3x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged | d3 2026-12-04 PM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-bench-press 3x5 RIR3 last logged; dead-bug 2x7 RIR3 BW | d5 2026-12-06 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; front-plank 2x7 RIR3 BW

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

**Tags.** COLD_START, H4, NON_RACE, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":4,"asOf":"2026-12-20","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":174,"longestRunMinutes":38,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","RACK","DUMBBELLS","BENCH","PULL_UP_BAR","BARBELL","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[2,3,5,6],"strengthDays":[1,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":81,"strengthMinutes":74,"longRunDay":3,"longRunMinutes":142,"sameTurnConfirmed":true}}`

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

## R7D-G062

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":4,"asOf":"2026-12-27","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-14"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-01-14"},"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":245,"longestRunMinutes":110,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x8 22KG SINGLE_IMPLEMENT"],"equipment":["MACHINES","BANDS","PULL_UP_BAR","KETTLEBELL","BENCH","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5,6],"strengthDays":[3,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":25,"strengthMinutes":69,"longRunDay":0,"longRunMinutes":112,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-12-29 PM RUN LONG 100min (LONG) | d1 2026-12-30 PM RUN EASY 25min (EASY) | d3 2027-01-01 PM STRENGTH_UPPER 25min: machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; incline-push-up 1x12 RIR3 BW; kb-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d3 2027-01-01 PM RUN EASY 25min (EASY) | d4 2027-01-02 PM STRENGTH_LOWER 32min: kb-goblet-squat 5x8 RIR3 22kg SINGLE_IMPLEMENT; kb-deadlift 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-02 PM RUN EASY 25min (EASY) | d5 2027-01-03 PM STRENGTH_FULL_B 28min: kb-deadlift 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-03 PM RUN EASY 25min (EASY) | d6 2027-01-04 PM RUN EASY 25min (EASY)
- Week 1 (SPECIFIC): d0 2027-01-05 PM RUN LONG 100min (LONG) | d1 2027-01-06 PM RUN EASY 25min (EASY) | d3 2027-01-08 PM STRENGTH_UPPER 14min: machine-chest-press 1x10 RIR4 last logged; seated-cable-row 1x10 RIR4 last logged | d3 2027-01-08 PM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d4 2027-01-09 PM RUN EASY 15min (EASY) | d5 STRENGTH REST_BY_DESIGN | d5 2027-01-10 PM RUN EASY 15min (EASY) | d6 2027-01-11 PM RUN EASY 15min (EASY)
- Week 1 (SPECIFIC): d0 2027-01-05 PM RUN LONG 100min (LONG) | d1 2027-01-06 PM RUN EASY 25min (EASY) | d3 2027-01-08 PM STRENGTH_UPPER 14min: machine-chest-press 1x10 RIR4 last logged; seated-cable-row 1x10 RIR4 last logged | d3 2027-01-08 PM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d4 2027-01-09 PM RUN EASY 15min (EASY) | d5 STRENGTH REST_BY_DESIGN | d5 2027-01-10 PM RUN EASY 15min (EASY) | d6 2027-01-11 PM RUN EASY 15min (EASY)
- Week 2 (RACE_WEEK): d0 2027-01-12 PM RUN EASY 15min (EASY) | d1 2027-01-13 PM RUN SHAKEOUT 15min (SHAKEOUT) | d2 2027-01-14  RUN RACE 150min (RACE) | d3 STRENGTH REST_BY_DESIGN | d3 RUN REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d4 2027-01-16 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 STRENGTH REST_BY_DESIGN | d5 2027-01-17 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 2027-01-18 PM RUN RECOVERY_EASY 25min (RECOVERY_EASY)

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

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-18","weeks":12,"asOf":"2026-12-18","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-06"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-03-06"},"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":29,"longestRunMinutes":39,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["goblet-squat 4x12 10KG PER_HAND","glute-bridge 2x6 0KG BODYWEIGHT"],"equipment":["PULL_UP_BAR","BODYWEIGHT","BANDS","DUMBBELLS","MACHINES","RACK"],"pause":{"nonclinical":true,"weeks":6,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3,4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":24,"strengthMinutes":53,"longRunDay":6,"longRunMinutes":40,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-18 AM RUN EASY 15min (EASY) | d2 2026-12-20 AM RUN EASY 15min (EASY) | d3 2026-12-21 AM RUN WALK 20min (WALK) | d4 2026-12-22 AM RUN EASY 15min (EASY) | d5 2026-12-23 AM RUN WALK 20min (WALK) | d6 2026-12-24 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-12-25 AM RUN EASY 20min (EASY) | d2 2026-12-27 AM RUN EASY 20min (EASY) | d3 2026-12-28 AM RUN WALK 20min (WALK) | d4 2026-12-29 AM RUN EASY 20min (EASY) | d5 2026-12-30 AM RUN WALK 20min (WALK) | d6 2026-12-31 AM RUN WALK 20min (WALK)
- Week 10 (TAPER): d0 2027-02-26 AM RUN EASY 20min (EASY +strides) | d2 2027-02-28 AM RUN EASY 15min (EASY) | d3 2027-03-01 AM RUN EASY 15min (EASY) | d4 2027-03-02 AM RUN EASY 15min (EASY) | d5 2027-03-03 AM RUN WALK 20min (WALK) | d6 2027-03-04 AM RUN EASY 15min (EASY)
- Week 11 (RACE_WEEK): d0 2027-03-05 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d1 2027-03-06  RUN RACE 75min (RACE, completion) | d2 RUN REST_BY_DESIGN | d3 2027-03-08 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 2027-03-09 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 2027-03-10 AM RUN RECOVERY_EASY 24min (RECOVERY_EASY) | d6 2027-03-11 AM RUN RECOVERY_EASY 24min (RECOVERY_EASY)

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

## R7D-G064

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-30","weeks":16,"asOf":"2026-12-30","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BODYWEIGHT","DUMBBELLS","BENCH","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2],"strengthDays":[0,1,2,3,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":70,"strengthMinutes":30,"longRunDay":2,"longRunMinutes":79,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-30 PM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish | d1 2026-12-31 PM STRENGTH_UPPER 20min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 1x10 RIR3 BW | d2 2027-01-01 PM STRENGTH_LOWER_B 20min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; seated-calf-raise-db 1x10 RIR3 establish | d2 2027-01-01 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2027-01-02 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-04 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-06 PM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged | d1 2027-01-07 PM STRENGTH_UPPER 20min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW | d2 2027-01-08 PM STRENGTH_LOWER_B 21min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; seated-calf-raise-db 1x10 RIR3 last logged | d2 2027-01-08 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-09 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-11 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; front-plank 1x10 RIR3 BW

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

## R7D-G065

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-30","weeks":16,"asOf":"2026-12-28","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-15"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-04-15"},"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":80,"longestRunMinutes":41,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["goblet-squat 5x12 16KG PER_HAND"],"equipment":["BODYWEIGHT","PULL_UP_BAR","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,6],"strengthDays":[0,1,2],"runTurn":"PM","strengthTurn":"PM","runMinutes":83,"strengthMinutes":45,"longRunDay":3,"longRunMinutes":71,"sameTurnConfirmed":true}}`

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

## R7D-G066

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":12,"asOf":"2026-12-30","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":200,"longestRunMinutes":36,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["back-squat 3x8 61KG TOTAL"],"equipment":["BANDS","BENCH","PULL_UP_BAR","RACK","BARBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":25,"strengthMinutes":31,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-31 AM STRENGTH_LOWER 25min: back-squat 3x6 RIR3 61kg TOTAL; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW | d1 2027-01-01 AM STRENGTH_UPPER 22min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; incline-push-up 2x7 RIR3 BW | d2 2027-01-02 AM STRENGTH_LOWER_B 22min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW; db-calf-raise 2x7 RIR3 establish | d6 2027-01-06 AM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-07 AM STRENGTH_LOWER 29min: back-squat 3x6 RIR3 61kg TOTAL; glute-bridge 3x7 RIR3 BW; reverse-lunge 2x9 RIR3 BW | d1 2027-01-08 AM STRENGTH_UPPER 28min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; incline-push-up 2x9 RIR3 BW | d2 2027-01-09 AM STRENGTH_LOWER_B 29min: glute-bridge 3x7 RIR3 BW; reverse-lunge 3x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged | d6 2027-01-13 AM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; dead-bug 2x9 RIR3 BW

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":8,"asOf":"2026-12-04","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":90,"longestRunMinutes":44,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x12 0KG BODYWEIGHT","kb-deadlift 3x6 11KG SINGLE_IMPLEMENT"],"equipment":["BODYWEIGHT","RACK","PULL_UP_BAR","KETTLEBELL","DUMBBELLS"],"pause":{"nonclinical":true,"weeks":4,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":16,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[0,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":73,"strengthMinutes":54,"longRunDay":3,"longRunMinutes":58,"sameTurnConfirmed":false}}`

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

## R7D-G068

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":8,"asOf":"2026-11-08","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":78,"longestRunMinutes":43,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","DUMBBELLS","RACK","BODYWEIGHT","BARBELL","PULL_UP_BAR","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":38,"strengthMinutes":70,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-11-11 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d5 2026-11-14 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2026-11-18 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-21 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":16,"asOf":"2026-12-05","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":80,"longestRunMinutes":35,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BANDS","RACK","MACHINES","PULL_UP_BAR","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[0,3,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":84,"strengthMinutes":51,"longRunDay":0,"longRunMinutes":75,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-08 AM RUN LONG 35min (LONG) | d0 2026-12-08 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-12-11 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-12 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-14 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-15 AM RUN LONG 35min (LONG) | d0 2026-12-15 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d3 2026-12-18 AM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-19 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-21 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

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

**Tags.** COLD_START, H4, NON_RACE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":4,"asOf":"2026-12-28","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":60,"longestRunMinutes":46,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,5],"strengthDays":[0,1,2,3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":63,"strengthMinutes":41,"longRunDay":5,"longRunMinutes":119,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-28 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d0 2026-12-28 PM RUN EASY 15min (EASY) | d1 2026-12-29 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-30 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-31 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2027-01-01 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-02 PM RUN LONG 45min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-01-04 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d0 2027-01-04 PM RUN EASY 15min (EASY) | d1 2027-01-05 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-01-06 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d3 2027-01-07 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d4 2027-01-08 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d5 2027-01-09 PM RUN LONG 45min (LONG)

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

## R7D-G071

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":4,"asOf":"2026-11-07","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-01"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2026-12-01"},"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":246,"longestRunMinutes":78,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x10 15KG SINGLE_IMPLEMENT"],"equipment":["KETTLEBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":17,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":69,"strengthMinutes":61,"longRunDay":1,"longRunMinutes":117,"sameTurnConfirmed":false}}`

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

## R7D-G072

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-25","weeks":16,"asOf":"2026-11-23","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-13"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2027-03-13"},"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["goblet-squat 5x8 14KG PER_HAND","glute-bridge 4x6 0KG BODYWEIGHT","db-split-squat 4x8 23KG PER_HAND"],"equipment":["BANDS","BODYWEIGHT","PULL_UP_BAR","RACK","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[2,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":40,"strengthMinutes":40,"longRunDay":3,"longRunMinutes":49,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d2 2026-11-27 AM STRENGTH_FULL_A 39min: goblet-squat 5x6 RIR3 14kg PER_HAND; db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d3 2026-11-28 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-30 AM STRENGTH_FULL_B 39min: glute-bridge 4x6 RIR3 BW; db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; db-split-squat 4x6 RIR3 23kg PER_HAND; dead-bug 2x7 RIR3 BW
- Week 1 (BUILD): d2 2026-12-04 AM STRENGTH_FULL_A 38min: goblet-squat 5x6 RIR3 14kg PER_HAND; db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged | d3 2026-12-05 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-07 AM STRENGTH_FULL_B 36min: glute-bridge 4x6 RIR3 BW; db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged
- Week 14 (TAPER): d2 2027-03-05 AM STRENGTH_FULL_A 27min: goblet-squat 2x6 RIR3 20kg PER_HAND; db-floor-press 2x5 RIR3 last logged; db-row 2x5 RIR3 last logged; standing-calf-raise 1x7 RIR3 BW; front-plank 1x7 RIR3 BW | d3 2027-03-06 PM RUN EASY 20min (EASY +strides) | d5 2027-03-08 AM STRENGTH_FULL_B 16min: glute-bridge 1x6 RIR4 BW; db-row 1x5 RIR4 last logged; db-floor-press 1x5 RIR4 last logged
- Week 15 (RACE_WEEK): d2 STRENGTH REST_BY_DESIGN | d3 2027-03-13  RUN RACE 150min (RACE, completion) | d5 STRENGTH REST_BY_DESIGN

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

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-05","weeks":8,"asOf":"2026-12-03","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-25"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-01-25"},"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x5 31KG SINGLE_IMPLEMENT","glute-bridge 3x5 0KG BODYWEIGHT"],"equipment":["KETTLEBELL","BENCH","BANDS","DUMBBELLS","RACK","MACHINES","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3,4,6],"strengthDays":[3,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":49,"strengthMinutes":73,"longRunDay":4,"longRunMinutes":137,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-05 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-07 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-08 AM RUN WALK 20min (WALK) | d3 2026-12-08 PM STRENGTH_LOWER 32min: kb-goblet-squat 5x5 RIR3 31kg SINGLE_IMPLEMENT; glute-bridge 3x5 RIR3 BW; db-split-squat 1x10 RIR3 establish; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish | d4 2026-12-09 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-10 PM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-11 AM RUN WALK 20min (WALK) | d6 2026-12-11 PM STRENGTH_FULL_B 29min: glute-bridge 3x5 RIR3 BW; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-12 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-14 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-15 AM RUN WALK 20min (WALK) | d3 2026-12-15 PM STRENGTH_LOWER 32min: kb-goblet-squat 5x5 RIR3 31kg SINGLE_IMPLEMENT; glute-bridge 3x5 RIR3 BW; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; hip-abduction-machine 1x10 RIR3 last logged | d4 2026-12-16 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-17 PM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-18 AM RUN WALK 20min (WALK) | d6 2026-12-18 PM STRENGTH_FULL_B 29min: glute-bridge 3x5 RIR3 BW; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW
- Week 6 (TAPER): d0 2027-01-16 AM RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d2 2027-01-18 AM RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d3 2027-01-19 AM RUN WALK 20min (WALK) | d3 2027-01-19 PM STRENGTH_LOWER 13min: kb-goblet-squat 1x7 RIR4 31kg SINGLE_IMPLEMENT; glute-bridge 1x7 RIR4 BW | d4 2027-01-20 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d5 STRENGTH REST_BY_DESIGN | d6 2027-01-22 AM RUN WALK 20min (WALK) | d6 STRENGTH REST_BY_DESIGN
- Week 7 (RACE_WEEK): d0 2027-01-23 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d2 2027-01-25  RUN RACE 150min (RACE, completion) | d3 RUN REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-27 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d5 STRENGTH REST_BY_DESIGN | d6 2027-01-29 AM RUN WALK 20min (WALK) | d6 STRENGTH REST_BY_DESIGN

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":16,"asOf":"2026-12-13","tz":330,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":177,"longestRunMinutes":106,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4],"strengthDays":[2,3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":23,"strengthMinutes":32,"longRunDay":4,"longRunMinutes":150,"sameTurnConfirmed":true}}`

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

## R7D-G075

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":4,"asOf":"2027-01-03","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"MARATHON","date":"2027-01-20"}},"strength":"STRENGTH"},"event":{"kind":"MARATHON","date":"2027-01-20"},"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":180,"longestRunMinutes":20,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BENCH","BODYWEIGHT","PULL_UP_BAR","BARBELL","DUMBBELLS","KETTLEBELL","MACHINES","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,5],"strengthDays":[0,4,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":87,"strengthMinutes":25,"longRunDay":3,"longRunMinutes":125,"sameTurnConfirmed":false}}`

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

## R7D-G076

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":12,"asOf":"2027-01-06","tz":330,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":136,"longestRunMinutes":78,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BENCH"],"pause":{"nonclinical":true,"weeks":5,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,6],"strengthDays":[2,3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":36,"strengthMinutes":34,"longRunDay":1,"longRunMinutes":49,"sameTurnConfirmed":false}}`

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

## R7D-G077

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":16,"asOf":"2026-11-21","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":138,"longestRunMinutes":34,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[1,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":29,"strengthMinutes":71,"longRunDay":0,"longRunMinutes":30,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-22 AM RUN LONG 30min (LONG) | d1 2026-11-23 AM RUN EASY 29min (EASY) | d1 2026-11-23 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-24 AM RUN EASY 29min (EASY) | d4 2026-11-26 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-28 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-29 AM RUN LONG 30min (LONG) | d1 2026-11-30 AM RUN EASY 29min (EASY) | d1 2026-11-30 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-01 AM RUN EASY 29min (EASY) | d4 2026-12-03 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-05 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-13","weeks":12,"asOf":"2026-11-13","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":39,"longestRunMinutes":110,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 4x6 79KG TOTAL","kb-deadlift 5x6 31KG SINGLE_IMPLEMENT"],"equipment":["DUMBBELLS","MACHINES","BODYWEIGHT","PULL_UP_BAR","KETTLEBELL","BENCH","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4],"strengthDays":[3,4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":57,"strengthMinutes":59,"longRunDay":1,"longRunMinutes":30,"sameTurnConfirmed":false}}`

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

## R7D-G079

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-27","weeks":12,"asOf":"2026-11-24","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":198,"longestRunMinutes":86,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["back-squat 4x10 77KG TOTAL","db-rdl 3x6 34KG TOTAL","reverse-lunge 4x6 0KG BODYWEIGHT"],"equipment":["MACHINES","BODYWEIGHT","DUMBBELLS","PULL_UP_BAR","BARBELL","KETTLEBELL","BENCH","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":67,"strengthMinutes":72,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2026-11-29 PM STRENGTH_LOWER 36min: back-squat 4x10 RIR3 77kg TOTAL; db-rdl 3x6 RIR3 34kg TOTAL; reverse-lunge 4x6 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-30 PM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; machine-chest-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d5 2026-12-02 PM STRENGTH_LOWER_B 29min: db-rdl 3x6 RIR3 34kg TOTAL; reverse-lunge 4x6 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-03 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2026-12-06 PM STRENGTH_LOWER 38min: back-squat 4x12 RIR3 77kg TOTAL; db-rdl 3x8 RIR3 34kg TOTAL; reverse-lunge 4x8 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2026-12-07 PM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; machine-chest-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d5 2026-12-09 PM STRENGTH_LOWER_B 30min: db-rdl 3x8 RIR3 34kg TOTAL; reverse-lunge 4x8 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2026-12-10 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; dead-bug 1x14 RIR3 BW

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

## R7D-G080

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":16,"asOf":"2026-11-11","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-27"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-02-27"},"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":67,"strengthMinutes":72,"longRunDay":3,"longRunMinutes":72,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-12 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-13 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-15 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-11-19 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-11-20 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-22 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 14 (TAPER): d0 2027-02-18 PM RUN EASY 25min (EASY +strides) | d1 2027-02-19 PM RUN EASY 25min (EASY +strides) | d3 2027-02-21 PM RUN EASY 15min (EASY)
- Week 15 (RACE_WEEK): d0 2027-02-25 PM RUN EASY 15min (EASY) | d1 2027-02-26 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d2 2027-02-27  RUN RACE 75min (RACE, completion) | d3 RUN REST_BY_DESIGN

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

## R7D-G081

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-19","weeks":4,"asOf":"2026-12-19","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-03"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-01-03"},"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","DUMBBELLS","BODYWEIGHT","MACHINES","PULL_UP_BAR","BARBELL","BENCH","BANDS","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":74,"strengthMinutes":58,"longRunDay":6,"longRunMinutes":80,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-19 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d0 2026-12-19 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-20 AM RUN WALK 20min (WALK) | d2 2026-12-21 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-22 AM RUN WALK 20min (WALK) | d4 2026-12-23 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-24 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-25 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-12-26 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d0 2026-12-26 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-27 AM RUN WALK 20min (WALK) | d2 2026-12-28 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-29 AM RUN WALK 20min (WALK) | d4 2026-12-30 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-31 AM STRENGTH_FULL_B 16min: kb-deadlift 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged | d6 2027-01-01 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-12-26 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d0 2026-12-26 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-27 AM RUN WALK 20min (WALK) | d2 2026-12-28 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-29 AM RUN WALK 20min (WALK) | d4 2026-12-30 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-31 AM STRENGTH_FULL_B 16min: kb-deadlift 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged | d6 2027-01-01 AM RUN WALK 20min (WALK)
- Week 2 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2027-01-02 AM RUN WALK 20min (WALK) | d1 2027-01-03  RUN RACE 150min (RACE, completion) | d2 RUN REST_BY_DESIGN | d3 2027-01-05 AM RUN WALK 20min (WALK) | d4 2027-01-06 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 STRENGTH REST_BY_DESIGN | d6 2027-01-08 AM RUN WALK 20min (WALK)

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":8,"asOf":"2026-12-03","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":56,"longestRunMinutes":65,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["leg-press 4x5 32KG TOTAL"],"equipment":["RACK","KETTLEBELL","BENCH","BARBELL","DUMBBELLS","BODYWEIGHT","MACHINES","BANDS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4,5],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":26,"strengthMinutes":41,"longRunDay":0,"longRunMinutes":127,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-06 PM RUN LONG 20min (LONG) | d4 2026-12-10 PM RUN EASY 15min (EASY) | d5 2026-12-11 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-13 PM RUN LONG 20min (LONG) | d4 2026-12-17 PM RUN EASY 15min (EASY) | d5 2026-12-18 PM RUN EASY 15min (EASY)

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":16,"asOf":"2026-11-12","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":250,"longestRunMinutes":82,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5],"strengthDays":[0,1,2,3,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":82,"strengthMinutes":60,"longRunDay":1,"longRunMinutes":110,"sameTurnConfirmed":false}}`

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

## R7D-G084

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":12,"asOf":"2026-11-09","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":9,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[6],"strengthDays":[4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":72,"strengthMinutes":70,"longRunDay":6,"longRunMinutes":74,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d4 2026-11-15 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-11-17 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-11-17 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d4 2026-11-22 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-11-24 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-11-24 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":12,"asOf":"2026-12-23","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":90,"longestRunMinutes":16,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":81,"strengthMinutes":61,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-26 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d4 2026-12-30 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-01 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-02 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-06 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-08 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":4,"asOf":"2026-12-03","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":45,"longestRunMinutes":19,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","RACK","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,6],"strengthDays":[2],"runTurn":"AM","strengthTurn":"AM","runMinutes":80,"strengthMinutes":33,"longRunDay":0,"longRunMinutes":88,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-06 AM RUN LONG 15min (LONG) | d1 2026-12-07 AM RUN WALK 20min (WALK) | d2 2026-12-08 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d3 2026-12-09 AM RUN EASY 15min (EASY) | d4 2026-12-10 AM RUN EASY 15min (EASY) | d6 2026-12-12 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-13 AM RUN LONG 15min (LONG) | d1 2026-12-14 AM RUN WALK 20min (WALK) | d2 2026-12-15 AM STRENGTH_FULL_A 24min: kb-goblet-squat 2x10 RIR3 establish; incline-push-up 2x10 RIR3 BW; kb-row 2x10 RIR3 establish | d3 2026-12-16 AM RUN EASY 15min (EASY) | d4 2026-12-17 AM RUN EASY 15min (EASY) | d6 2026-12-19 AM RUN WALK 20min (WALK)

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":16,"asOf":"2026-12-25","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BARBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[6],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":70,"strengthMinutes":36,"longRunDay":6,"longRunMinutes":67,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d6 2027-01-01 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d6 2027-01-08 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":16,"asOf":"2026-11-18","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":240,"longestRunMinutes":47,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["leg-press 2x5 47KG TOTAL","glute-bridge 3x10 0KG BODYWEIGHT"],"equipment":["RACK","BENCH","BANDS","MACHINES","DUMBBELLS","KETTLEBELL","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[4],"runTurn":"AM","strengthTurn":"AM","runMinutes":80,"strengthMinutes":31,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d4 2026-11-25 AM STRENGTH_FULL_A 23min: leg-press 2x5 RIR3 47kg TOTAL; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW
- Week 1 (DEVELOPMENT): d4 2026-12-02 AM STRENGTH_FULL_A 24min: leg-press 2x7 RIR3 47kg TOTAL; incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW

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

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-11","weeks":8,"asOf":"2026-12-10","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-27"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-01-27"},"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":81,"longestRunMinutes":75,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BANDS","MACHINES","BENCH","RACK","BARBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[1,3,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":46,"strengthMinutes":69,"longRunDay":1,"longRunMinutes":94,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d1 2026-12-12 PM STRENGTH_UPPER 29min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-12 PM RUN LONG 35min (LONG) | d2 2026-12-13 PM RUN WALK 20min (WALK) | d3 2026-12-14 PM STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2026-12-14 PM RUN EASY 15min (EASY) | d4 2026-12-15 PM RUN EASY 15min (EASY) | d5 2026-12-16 PM STRENGTH_LOWER_B 26min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; seated-calf-raise-db 2x10 RIR3 establish; leg-curl-machine 2x10 RIR3 establish | d5 2026-12-16 PM RUN EASY 15min (EASY) | d6 2026-12-17 PM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d6 2026-12-17 PM RUN WALK 20min (WALK)
- Week 1 (BUILD): d1 2026-12-19 PM STRENGTH_UPPER 34min: db-bench-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2026-12-19 PM RUN LONG 35min (LONG) | d2 2026-12-20 PM RUN WALK 20min (WALK) | d3 2026-12-21 PM STRENGTH_LOWER 34min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x8 RIR3 last logged; leg-extension-machine 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d3 2026-12-21 PM RUN EASY 15min (EASY) | d4 2026-12-22 PM RUN EASY 15min (EASY) | d5 2026-12-23 PM STRENGTH_LOWER_B 31min: db-rdl 3x8 RIR3 last logged; db-split-squat 3x8 RIR3 last logged; seated-calf-raise-db 2x10 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged | d5 2026-12-23 PM RUN EASY 15min (EASY) | d6 2026-12-24 PM STRENGTH_UPPER_B 27min: db-row 3x8 RIR3 last logged; db-bench-press 3x8 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged | d6 2026-12-24 PM RUN WALK 20min (WALK)
- Week 5 (TAPER): d1 2027-01-16 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-lateral-raise 1x10 RIR3 last logged; db-biceps-curl 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d1 2027-01-16 PM RUN LONG 25min (LONG) | d2 2027-01-17 PM RUN WALK 20min (WALK) | d3 2027-01-18 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; leg-extension-machine 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2027-01-18 PM RUN EASY 15min (EASY +strides) | d4 2027-01-19 PM RUN EASY 15min (EASY +strides) | d5 2027-01-20 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x8 RIR3 last logged; seated-calf-raise-db 1x10 RIR3 last logged; leg-curl-machine 1x10 RIR3 last logged | d5 2027-01-20 PM RUN EASY 15min (EASY +strides) | d6 2027-01-21 PM STRENGTH_UPPER_B 14min: db-row 1x8 RIR4 last logged; db-bench-press 1x8 RIR4 last logged | d6 2027-01-21 PM RUN EASY 15min (EASY)
- Week 6 (RACE_WEEK): d1 STRENGTH REST_BY_DESIGN | d1 2027-01-23 PM RUN EASY 15min (EASY) | d2 2027-01-24 PM RUN WALK 20min (WALK) | d3 STRENGTH REST_BY_DESIGN | d3 2027-01-25 PM RUN EASY 15min (EASY) | d4 2027-01-26 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d5 STRENGTH REST_BY_DESIGN | d5 2027-01-27  RUN RACE 75min (RACE) | d6 STRENGTH REST_BY_DESIGN | d6 RUN REST_BY_DESIGN

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":8,"asOf":"2026-12-27","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","MACHINES","KETTLEBELL","PULL_UP_BAR","RACK","BANDS","BARBELL","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,4,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":59,"longRunDay":6,"longRunMinutes":91,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-28 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-29 AM RUN WALK 20min (WALK) | d4 2026-12-31 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2027-01-02 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d1 2027-01-04 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2027-01-05 AM RUN WALK 20min (WALK) | d4 2027-01-07 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-09 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

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

## R7D-G091

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":16,"asOf":"2026-11-17","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":88,"longestRunMinutes":86,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2],"runTurn":"PM","strengthTurn":"AM","runMinutes":41,"strengthMinutes":31,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-11-19 AM STRENGTH_FULL_A 24min: leg-press 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish
- Week 1 (DEVELOPMENT): d2 2026-11-26 AM STRENGTH_FULL_A 31min: leg-press 3x8 RIR3 last logged; machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-03","weeks":4,"asOf":"2026-11-30","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":60,"longestRunMinutes":69,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","DUMBBELLS","KETTLEBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[2,3,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":63,"strengthMinutes":45,"longRunDay":1,"longRunMinutes":116,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-04 PM RUN LONG 60min (LONG) | d2 2026-12-05 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-12-06 AM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-09 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-11 PM RUN LONG 60min (LONG) | d2 2026-12-12 AM STRENGTH_FULL_A 31min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d3 2026-12-13 AM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-16 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW

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

**Tags.** COLD_START, H16, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":16,"asOf":"2026-11-20","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":20,"longestRunMinutes":52,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BARBELL","BODYWEIGHT","PULL_UP_BAR","RACK","MACHINES","DUMBBELLS","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0,1,2,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":50,"strengthMinutes":23,"longRunDay":0,"longRunMinutes":38,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-23 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-11-23 AM STRENGTH_LOWER 22min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish | d1 2026-11-24 PM RUN WALK 20min (WALK) | d1 2026-11-24 AM STRENGTH_UPPER 22min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish | d2 2026-11-25 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-25 AM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish | d3 2026-11-26 PM RUN WALK 20min (WALK) | d3 2026-11-26 AM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d4 2026-11-27 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-11-29 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-11-30 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-11-30 AM STRENGTH_LOWER 21min: goblet-squat 3x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged | d1 2026-12-01 PM RUN WALK 20min (WALK) | d1 2026-12-01 AM STRENGTH_UPPER 21min: db-bench-press 3x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d2 2026-12-02 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-02 AM STRENGTH_LOWER_B 21min: db-rdl 3x8 RIR3 last logged; db-split-squat 2x8 RIR3 last logged | d3 2026-12-03 PM RUN WALK 20min (WALK) | d3 2026-12-03 AM STRENGTH_UPPER_B 21min: db-row 3x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged | d4 2026-12-04 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-06 PM RUN WALK 20min (WALK)

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

**Tags.** COLD_START, H8, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":8,"asOf":"2026-12-26","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":76,"longestRunMinutes":48,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BODYWEIGHT","BANDS","PULL_UP_BAR","BARBELL","RACK","MACHINES","DUMBBELLS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,4,6],"strengthDays":[1,2,3,4,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":45,"strengthMinutes":70,"longRunDay":2,"longRunMinutes":130,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-29 AM RUN EASY 15min (EASY) | d1 2026-12-29 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-12-30 AM RUN LONG 30min (LONG) | d2 2026-12-30 PM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-31 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2027-01-01 AM RUN EASY 15min (EASY) | d4 2027-01-01 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-02 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-03 AM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d1 2027-01-05 AM RUN EASY 15min (EASY) | d1 2027-01-05 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d2 2027-01-06 AM RUN LONG 30min (LONG) | d2 2027-01-06 PM STRENGTH_FULL_A 31min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d3 2027-01-07 PM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2027-01-08 AM RUN EASY 15min (EASY) | d4 2027-01-08 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d5 2027-01-09 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d6 2027-01-10 AM RUN EASY 15min (EASY)

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

## R7D-G095

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":8,"asOf":"2026-11-09","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":170,"longestRunMinutes":61,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["back-squat 2x8 89KG TOTAL"],"equipment":["DUMBBELLS","KETTLEBELL","BODYWEIGHT","BARBELL","RACK","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":63,"strengthMinutes":34,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2026-11-13 AM STRENGTH_FULL_A 24min: back-squat 2x8 RIR3 89kg TOTAL; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish | d3 2026-11-14 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish
- Week 1 (DEVELOPMENT): d2 2026-11-20 AM STRENGTH_FULL_A 29min: back-squat 2x10 RIR3 89kg TOTAL; db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged | d3 2026-11-21 AM STRENGTH_FULL_B 31min: kb-deadlift 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged

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

## R7D-G096

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-11","weeks":8,"asOf":"2026-12-08","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":3,"runMinutesPerWeek":147,"longestRunMinutes":65,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["leg-press 3x5 101KG TOTAL"],"equipment":["BODYWEIGHT","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[2,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":32,"strengthMinutes":40,"longRunDay":0,"longRunMinutes":123,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-11 AM RUN LONG 65min (LONG) | d2 2026-12-13 AM STRENGTH_FULL_A 33min: leg-press 3x5 RIR3 101kg TOTAL; machine-chest-press 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-14 AM STRENGTH_FULL_B 30min: glute-bridge 2x5 RIR3 BW; seated-cable-row 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-18 AM RUN LONG 70min (LONG) | d2 2026-12-20 AM STRENGTH_FULL_A 39min: leg-press 3x5 RIR3 101kg TOTAL; machine-chest-press 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d3 2026-12-21 AM STRENGTH_FULL_B 40min: glute-bridge 3x7 RIR3 BW; seated-cable-row 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; reverse-lunge 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW

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

## R7D-G097

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":12,"asOf":"2026-11-07","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":124,"longestRunMinutes":125,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BARBELL","KETTLEBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1],"strengthDays":[3],"runTurn":"AM","strengthTurn":"PM","runMinutes":28,"strengthMinutes":25,"longRunDay":1,"longRunMinutes":30,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-09 AM RUN EASY 28min (EASY) | d1 2026-11-10 AM RUN LONG 30min (LONG) | d3 2026-11-12 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-16 AM RUN EASY 28min (EASY) | d1 2026-11-17 AM RUN LONG 30min (LONG) | d3 2026-11-19 PM STRENGTH_FULL_A 24min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish

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

## R7D-G098

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-05","weeks":4,"asOf":"2026-12-02","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BODYWEIGHT","BENCH","MACHINES","DUMBBELLS","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,6],"strengthDays":[3,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":63,"strengthMinutes":38,"longRunDay":3,"longRunMinutes":73,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-12-07 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-08 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-08 AM RUN WALK 20min (WALK) | d4 2026-12-09 AM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 1x10 RIR3 establish; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2026-12-09 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-10 AM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-11 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d2 2026-12-14 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-15 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-15 AM RUN WALK 20min (WALK) | d4 2026-12-16 AM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d4 2026-12-16 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-17 AM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-18 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

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

## R7D-G099

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":8,"asOf":"2026-11-30","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-22"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-01-22"},"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":92,"longestRunMinutes":127,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3],"strengthDays":[0,1,2,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":32,"strengthMinutes":57,"longRunDay":1,"longRunMinutes":54,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-30 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-01 AM RUN LONG 40min (LONG) | d1 2026-12-01 AM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; cable-triceps-pushdown 2x8 RIR3 establish | d2 2026-12-02 AM RUN EASY 25min (EASY) | d2 2026-12-02 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-03 AM RUN EASY 25min (EASY) | d6 2026-12-06 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2026-12-07 AM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; cable-triceps-pushdown 2x8 RIR3 last logged | d1 2026-12-08 AM RUN LONG 40min (LONG) | d1 2026-12-08 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW | d2 2026-12-09 AM RUN EASY 25min (EASY) | d2 2026-12-09 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW | d3 2026-12-10 AM RUN EASY 25min (EASY) | d6 2026-12-13 AM STRENGTH_FULL_A 31min: leg-press 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW
- Week 6 (TAPER): d0 2027-01-11 AM STRENGTH_UPPER 24min: machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; cable-triceps-pushdown 1x8 RIR3 last logged; lat-pulldown 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d1 2027-01-12 AM RUN LONG 30min (LONG) | d1 2027-01-12 AM STRENGTH_LOWER_B 20min: glute-bridge 2x10 RIR3 BW; reverse-lunge 1x8 RIR3 BW; seated-calf-raise-machine 1x10 RIR3 last logged; leg-curl-machine 1x8 RIR3 last logged | d2 2027-01-13 AM RUN EASY 20min (EASY +strides) | d2 2027-01-13 AM STRENGTH_UPPER_B 20min: seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2027-01-14 AM RUN QUALITY 23min (THRESHOLD 2x3'/2') | d6 2027-01-17 AM STRENGTH_LOWER 14min: leg-press 1x8 RIR4 last logged; glute-bridge 1x10 RIR4 BW
- Week 7 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 2027-01-19 AM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d1 STRENGTH REST_BY_DESIGN | d2 2027-01-20 AM RUN EASY 15min (EASY) | d2 STRENGTH REST_BY_DESIGN | d3 2027-01-21 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d4 2027-01-22  RUN RACE 150min (RACE, completion) | d6 STRENGTH REST_BY_DESIGN

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

**Tags.** COLD_START, H8, RACE_HALF, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":8,"asOf":"2026-11-14","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-31"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2026-12-31"},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":78,"longestRunMinutes":63,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[1,2,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":36,"strengthMinutes":58,"longRunDay":4,"longRunMinutes":49,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d1 2026-11-17 PM RUN EASY 20min (EASY) | d1 2026-11-17 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-18 PM RUN EASY 20min (EASY) | d2 2026-11-18 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-19 PM RUN WALK 20min (WALK) | d4 2026-11-20 PM RUN LONG 30min (LONG) | d5 2026-11-21 PM RUN WALK 20min (WALK) | d5 2026-11-21 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-22 PM RUN WALK 20min (WALK) | d6 2026-11-22 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d1 2026-11-24 PM RUN EASY 20min (EASY) | d1 2026-11-24 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-25 PM RUN EASY 20min (EASY) | d2 2026-11-25 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-26 PM RUN WALK 20min (WALK) | d4 2026-11-27 PM RUN LONG 30min (LONG) | d5 2026-11-28 PM RUN WALK 20min (WALK) | d5 2026-11-28 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d6 2026-11-29 PM RUN WALK 20min (WALK) | d6 2026-11-29 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW
- Week 5 (TAPER): d1 2026-12-22 PM RUN QUALITY 25min (THRESHOLD 2x4'/2') | d1 2026-12-22 AM STRENGTH_LOWER 19min: box-squat-bodyweight 1x10 RIR3 BW; glute-bridge 1x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; side-lying-hip-abduction 1x12 RIR3 BW | d2 2026-12-23 PM RUN EASY 20min (EASY +strides) | d2 2026-12-23 AM STRENGTH_UPPER 15min: incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-24 PM RUN WALK 20min (WALK) | d4 2026-12-25 PM RUN EASY 15min (EASY) | d5 2026-12-26 PM RUN WALK 20min (WALK) | d5 2026-12-26 AM STRENGTH_LOWER_B 14min: glute-bridge 1x10 RIR4 BW; reverse-lunge 1x12 RIR4 BW | d6 2026-12-27 PM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d6 STRENGTH REST_BY_DESIGN
- Week 6 (RACE_WEEK): d1 2026-12-29 PM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d2 2026-12-30 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d2 STRENGTH REST_BY_DESIGN | d3 2026-12-31  RUN RACE 150min (RACE, completion) | d4 RUN REST_BY_DESIGN | d5 2027-01-02 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 STRENGTH REST_BY_DESIGN | d6 2027-01-03 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

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

