# R7-D domain-evaluation packet (R7D-GENERATED-FINAL-1)

Runtime R7D-FREEZE-5 (7272e9a), harness R7D-HARNESS-8, first evaluation: true. Corpus sha256 b69fa543c7bac184c7f3cc0af67a2d6b33f6adf4b368e881a16a9cc752edba69.

Per case: what the case asks, the intake, onboarding, every decision (current week = prescription; next week = provisional projection), automated results, the author's expectations and independent assessment.

## R7D-G001

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":4,"asOf":"2026-12-06","tz":0,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-20"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2026-12-20"},"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BANDS","BENCH","MACHINES","RACK","BARBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4,6],"strengthDays":[0,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":86,"strengthMinutes":41,"longRunDay":4,"longRunMinutes":139,"sameTurnConfirmed":false}}`

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

## R7D-G002

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":12,"asOf":"2026-12-06","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":94,"longestRunMinutes":59,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,5,6],"strengthDays":[4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":69,"strengthMinutes":73,"longRunDay":5,"longRunMinutes":150,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d4 2026-12-13 AM RUN EASY 25min (EASY) | d4 2026-12-13 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d5 2026-12-14 AM RUN LONG 40min (LONG) | d5 2026-12-14 AM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-15 AM RUN EASY 25min (EASY)
- Week 1 (DEVELOPMENT): d4 2026-12-20 AM RUN EASY 25min (EASY) | d4 2026-12-20 AM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-21 AM RUN LONG 40min (LONG) | d5 2026-12-21 AM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-22 AM RUN EASY 25min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":16,"asOf":"2026-11-28","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BODYWEIGHT","RACK","BENCH","MACHINES","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2],"runTurn":"AM","strengthTurn":"PM","runMinutes":83,"strengthMinutes":64,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-30 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-01 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-02 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-07 PM STRENGTH_FULL_A 28min: leg-press 2x10 RIR3 establish; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-08 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-09 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":4,"asOf":"2026-12-03","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BARBELL","BANDS","PULL_UP_BAR","RACK","BENCH","MACHINES","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[0,2,4],"strengthDays":[1,2,3,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":77,"strengthMinutes":74,"longRunDay":4,"longRunMinutes":87,"sameTurnConfirmed":true}}`

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

## R7D-G005

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":16,"asOf":"2026-11-20","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":104,"longestRunMinutes":39,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["goblet-squat 3x5 26KG PER_HAND","db-rdl 2x12 28KG PER_HAND","db-step-up 2x8 20KG PER_HAND"],"equipment":["RACK","KETTLEBELL","DUMBBELLS","PULL_UP_BAR","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":69,"strengthMinutes":71,"longRunDay":3,"longRunMinutes":102,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-22 PM RUN EASY 20min (EASY) | d1 2026-11-23 PM RUN EASY 20min (EASY) | d3 2026-11-25 PM RUN LONG 35min (LONG) | d4 2026-11-26 PM RUN EASY 20min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-29 PM RUN EASY 20min (EASY) | d1 2026-11-30 PM RUN EASY 20min (EASY) | d3 2026-12-02 PM RUN LONG 40min (LONG) | d4 2026-12-03 PM RUN EASY 20min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-08","weeks":4,"asOf":"2027-01-05","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":46,"longestRunMinutes":84,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x12 0KG BODYWEIGHT","glute-bridge 4x6 0KG BODYWEIGHT"],"equipment":["DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,6],"strengthDays":[0,1,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":41,"strengthMinutes":58,"longRunDay":3,"longRunMinutes":138,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-08 PM STRENGTH_LOWER 36min: box-squat-bodyweight 4x12 RIR3 BW; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2027-01-09 PM STRENGTH_UPPER 28min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; incline-push-up 2x7 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2027-01-10 AM RUN WALK 20min (WALK) | d3 2027-01-11 AM RUN LONG 20min (LONG) | d4 2027-01-12 AM RUN WALK 20min (WALK) | d5 2027-01-13 PM STRENGTH_LOWER_B 25min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2027-01-14 AM RUN EASY 25min (EASY) | d6 2027-01-14 PM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-15 PM STRENGTH_LOWER 40min: box-squat-bodyweight 4x12 RIR3 BW; glute-bridge 3x7 RIR3 BW; reverse-lunge 2x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d1 2027-01-16 PM STRENGTH_UPPER 35min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; incline-push-up 2x9 RIR3 BW; prone-ytw-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d2 2027-01-17 AM RUN WALK 20min (WALK) | d3 2027-01-18 AM RUN LONG 25min (LONG) | d4 2027-01-19 AM RUN WALK 20min (WALK) | d5 2027-01-20 PM STRENGTH_LOWER_B 32min: glute-bridge 3x7 RIR3 BW; reverse-lunge 3x9 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d6 2027-01-21 AM RUN EASY 25min (EASY) | d6 2027-01-21 PM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; dead-bug 2x9 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":12,"asOf":"2026-11-13","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-25"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-01-25"},"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":174,"longestRunMinutes":77,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x12 0KG BODYWEIGHT","glute-bridge 3x12 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[3,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":88,"strengthMinutes":55,"longRunDay":0,"longRunMinutes":83,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-11-15 PM RUN LONG 75min (LONG) | d3 2026-11-18 PM STRENGTH_FULL_A 39min: box-squat-bodyweight 5x12 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-11-21 PM STRENGTH_FULL_B 33min: glute-bridge 3x12 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (BUILD): d0 2026-11-22 PM RUN LONG 75min (LONG) | d3 2026-11-25 PM STRENGTH_FULL_A 43min: box-squat-bodyweight 5x12 RIR3 BW; incline-push-up 3x7 RIR3 BW; prone-ytw-raise 2x9 RIR3 BW; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d6 2026-11-28 PM STRENGTH_FULL_B 37min: glute-bridge 3x12 RIR3 BW; incline-push-up 3x7 RIR3 BW; prone-ytw-raise 2x9 RIR3 BW; reverse-lunge 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW
- Week 9 (TAPER): d0 2027-01-17 PM RUN LONG 45min (LONG) | d3 2027-01-20 PM STRENGTH_FULL_A 14min: box-squat-bodyweight 1x12 RIR4 BW; incline-push-up 1x10 RIR4 BW | d6 STRENGTH REST_BY_DESIGN
- Week 10 (RACE_WEEK): d0 2027-01-24 PM RUN SHAKEOUT 15min (SHAKEOUT) | d1 2027-01-25  RUN RACE 75min (RACE) | d3 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-16","weeks":12,"asOf":"2026-12-15","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":196,"longestRunMinutes":75,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[0,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":46,"strengthMinutes":44,"longRunDay":1,"longRunMinutes":46,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-16 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-17 PM RUN LONG 46min (LONG) | d4 2026-12-20 PM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-22 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-23 PM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-12-24 PM RUN LONG 46min (LONG) | d4 2026-12-27 PM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-29 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":16,"asOf":"2026-12-28","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":156,"longestRunMinutes":29,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,6],"strengthDays":[0,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":55,"strengthMinutes":71,"longRunDay":6,"longRunMinutes":117,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-29 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d0 2026-12-29 AM RUN EASY 29min (EASY) | d3 2027-01-01 AM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-04 AM RUN LONG 25min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-01-05 AM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2027-01-05 AM RUN EASY 29min (EASY) | d3 2027-01-08 AM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-11 AM RUN LONG 25min (LONG)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":8,"asOf":"2026-11-19","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BANDS","KETTLEBELL","BARBELL","PULL_UP_BAR","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3,4,5],"strengthDays":[4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":79,"strengthMinutes":39,"longRunDay":5,"longRunMinutes":45,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-21 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-23 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-24 PM RUN WALK 20min (WALK) | d4 2026-11-25 PM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-11-25 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-26 PM RUN WALK 20min (WALK) | d6 2026-11-27 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-28 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-11-30 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-01 PM RUN WALK 20min (WALK) | d4 2026-12-02 PM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-02 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-03 PM RUN WALK 20min (WALK) | d6 2026-12-04 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":4,"asOf":"2026-12-05","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-27"}},"strength":"NONE"},"event":{"kind":"10K","date":"2026-12-27"},"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":147,"longestRunMinutes":85,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4,5],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":43,"strengthMinutes":55,"longRunDay":5,"longRunMinutes":104,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · SPECIFIC · RACE_WEEK
- Week 0 (BUILD): d3 2026-12-09 PM RUN EASY 40min (EASY) | d4 2026-12-10 PM RUN EASY 40min (EASY) | d5 2026-12-11 PM RUN LONG 65min (LONG)
- Week 1 (SPECIFIC): d3 2026-12-16 PM RUN EASY 40min (EASY) | d4 2026-12-17 PM RUN EASY 40min (EASY) | d5 2026-12-18 PM RUN LONG 65min (LONG)
- Week 2 (SPECIFIC): d3 2026-12-23 PM RUN EASY 20min (EASY) | d4 2026-12-24 PM RUN EASY 20min (EASY) | d5 2026-12-25 PM RUN EASY 20min (EASY)
- Week 3 (RACE_WEEK): d0 2026-12-27  RUN RACE 75min (RACE) | d3 2026-12-30 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 2026-12-31 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d5 2027-01-01 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":16,"asOf":"2026-12-25","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":52,"longestRunMinutes":29,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","BENCH","DUMBBELLS","BODYWEIGHT","RACK","MACHINES","PULL_UP_BAR","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":35,"strengthMinutes":34,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-26 PM STRENGTH_LOWER 22min: goblet-squat 2x5 RIR3 establish; db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x7 RIR3 establish | d1 2026-12-27 PM STRENGTH_UPPER 22min: db-bench-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-floor-press 2x7 RIR3 establish | d5 2026-12-31 PM STRENGTH_LOWER_B 22min: db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish | d6 2027-01-01 PM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-bench-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-02 PM STRENGTH_LOWER 28min: goblet-squat 3x5 RIR3 last logged; db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 2x7 RIR3 last logged | d1 2027-01-03 PM STRENGTH_UPPER 28min: db-bench-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-floor-press 2x7 RIR3 last logged | d5 2027-01-07 PM STRENGTH_LOWER_B 28min: db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 3x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged | d6 2027-01-08 PM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-bench-press 3x5 RIR3 last logged; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":8,"asOf":"2026-12-04","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":3,"runMinutesPerWeek":102,"longestRunMinutes":15,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x10 0KG BODYWEIGHT","glute-bridge 5x8 0KG BODYWEIGHT","reverse-lunge 5x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":21,"strengthMinutes":60,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-06 PM STRENGTH_LOWER 45min: box-squat-bodyweight 3x10 RIR3 BW; glute-bridge 5x8 RIR3 BW; reverse-lunge 5x8 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2026-12-07 PM STRENGTH_UPPER 21min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2026-12-08 PM STRENGTH_LOWER_B 41min: glute-bridge 5x8 RIR3 BW; reverse-lunge 5x8 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2026-12-10 PM STRENGTH_UPPER_B 21min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-13 PM STRENGTH_LOWER 47min: box-squat-bodyweight 3x12 RIR3 BW; glute-bridge 5x10 RIR3 BW; reverse-lunge 5x10 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d1 2026-12-14 PM STRENGTH_UPPER 24min: incline-push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d2 2026-12-15 PM STRENGTH_LOWER_B 43min: glute-bridge 5x10 RIR3 BW; reverse-lunge 5x10 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d4 2026-12-17 PM STRENGTH_UPPER_B 24min: incline-push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-26","weeks":8,"asOf":"2026-11-25","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":230,"longestRunMinutes":35,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":32,"strengthMinutes":20,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-26 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d4 2026-11-30 AM STRENGTH_FULL_B 19min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-03 AM STRENGTH_FULL_A 19min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW | d4 2026-12-07 AM STRENGTH_FULL_B 19min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":4,"asOf":"2026-11-09","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["RACK","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,3,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":29,"strengthMinutes":67,"longRunDay":1,"longRunMinutes":144,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-12 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d0 2026-11-12 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-13 AM RUN WALK 20min (WALK) | d2 2026-11-14 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-15 AM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; scapular-pull-up 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-11-15 AM RUN WALK 20min (WALK) | d4 2026-11-16 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-17 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-17 AM RUN WALK 20min (WALK) | d6 2026-11-18 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-19 AM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; scapular-pull-up 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d0 2026-11-19 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-11-20 AM RUN WALK 20min (WALK) | d2 2026-11-21 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-22 AM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; scapular-pull-up 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-11-22 AM RUN WALK 20min (WALK) | d4 2026-11-23 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-11-24 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d5 2026-11-24 AM RUN WALK 20min (WALK) | d6 2026-11-25 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":8,"asOf":"2026-11-07","tz":60,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-01"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-01-01"},"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","BODYWEIGHT","RACK","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4],"strengthDays":[0,1,3,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":78,"strengthMinutes":67,"longRunDay":4,"longRunMinutes":83,"sameTurnConfirmed":true}}`

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

## R7D-G017

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-27","weeks":12,"asOf":"2026-11-26","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-07"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-02-07"},"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":135,"longestRunMinutes":31,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["goblet-squat 2x5 15KG PER_HAND"],"equipment":["PULL_UP_BAR","BODYWEIGHT","DUMBBELLS","KETTLEBELL","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[0,1],"runTurn":"AM","strengthTurn":"AM","runMinutes":45,"strengthMinutes":42,"longRunDay":0,"longRunMinutes":60,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-11-27 AM RUN LONG 30min (LONG) | d0 2026-11-27 AM STRENGTH_FULL_A 27min: goblet-squat 2x5 RIR3 15kg PER_HAND; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d1 2026-11-28 AM STRENGTH_FULL_B 28min: kb-deadlift 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (BUILD): d0 2026-12-04 AM RUN LONG 35min (LONG) | d0 2026-12-04 AM STRENGTH_FULL_A 28min: goblet-squat 2x7 RIR3 15kg PER_HAND; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2026-12-05 AM STRENGTH_FULL_B 28min: kb-deadlift 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW
- Week 9 (TAPER): d0 2027-01-29 AM RUN LONG 40min (LONG) | d0 2027-01-29 AM STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR3 17kg PER_HAND; db-floor-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d1 2027-01-30 AM STRENGTH_FULL_B 21min: kb-deadlift 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; reverse-lunge 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW
- Week 10 (RACE_WEEK): d0 2027-02-05 AM RUN EASY 15min (EASY) | d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 2027-02-07  RUN RACE 75min (RACE)

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-18","weeks":12,"asOf":"2026-12-16","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-11"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-03-11"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":165,"longestRunMinutes":26,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x10 0KG BODYWEIGHT","glute-bridge 4x10 0KG BODYWEIGHT","reverse-lunge 2x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,5,6],"strengthDays":[0,1,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":75,"strengthMinutes":30,"longRunDay":5,"longRunMinutes":54,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d0 2026-12-18 PM RUN EASY 26min (EASY) | d0 2026-12-18 AM STRENGTH_LOWER 26min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 4x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d1 2026-12-19 PM RUN EASY 26min (EASY) | d1 2026-12-19 AM STRENGTH_UPPER 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW | d3 2026-12-21 PM RUN EASY 26min (EASY) | d5 2026-12-23 PM RUN LONG 25min (LONG) | d6 2026-12-24 PM RUN EASY 26min (EASY) | d6 2026-12-24 AM STRENGTH_FULL_B 26min: glute-bridge 4x10 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-25 PM RUN EASY 26min (EASY) | d0 2026-12-25 AM STRENGTH_LOWER 26min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 4x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW | d1 2026-12-26 PM RUN EASY 26min (EASY) | d1 2026-12-26 AM STRENGTH_UPPER 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW | d3 2026-12-28 PM RUN EASY 26min (EASY) | d5 2026-12-30 PM RUN LONG 30min (LONG) | d6 2026-12-31 PM RUN EASY 26min (EASY) | d6 2026-12-31 AM STRENGTH_FULL_B 26min: glute-bridge 4x10 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW
- Week 10 (TAPER): d0 2027-02-26 PM RUN EASY 20min (EASY +strides) | d0 2027-02-26 AM STRENGTH_LOWER 18min: box-squat-bodyweight 1x12 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW | d1 2027-02-27 PM RUN QUALITY 33min (HALF_MARATHON_SPECIFIC 2x8'/2') | d1 2027-02-27 AM STRENGTH_UPPER 15min: push-up 1x12 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW | d3 2027-03-01 PM RUN EASY 20min (EASY +strides) | d5 2027-03-03 PM RUN LONG 35min (LONG) | d6 2027-03-04 PM RUN EASY 20min (EASY +strides) | d6 2027-03-04 AM STRENGTH_FULL_B 18min: glute-bridge 2x10 RIR3 BW; push-up 1x12 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW
- Week 11 (RACE_WEEK): d0 2027-03-05 PM RUN EASY 15min (EASY) | d0 2027-03-05 AM STRENGTH_LOWER 14min: box-squat-bodyweight 1x12 RIR4 BW; glute-bridge 1x10 RIR4 BW | d1 2027-03-06 PM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d3 2027-03-08 PM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d5 2027-03-10 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d6 STRENGTH REST_BY_DESIGN | d6 2027-03-11  RUN RACE 150min (RACE, completion)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":8,"asOf":"2027-01-03","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":32,"longestRunMinutes":15,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":83,"strengthMinutes":20,"longRunDay":6,"longRunMinutes":49,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-04 PM RUN WALK 20min (WALK) | d1 2027-01-05 PM RUN EASY 15min (EASY) | d2 2027-01-06 PM RUN WALK 20min (WALK) | d3 2027-01-07 PM RUN WALK 20min (WALK) | d4 2027-01-08 PM RUN WALK 20min (WALK) | d6 2027-01-10 PM RUN LONG 15min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-01-11 PM RUN WALK 20min (WALK) | d1 2027-01-12 PM RUN EASY 15min (EASY) | d2 2027-01-13 PM RUN WALK 20min (WALK) | d3 2027-01-14 PM RUN WALK 20min (WALK) | d4 2027-01-15 PM RUN WALK 20min (WALK) | d6 2027-01-17 PM RUN LONG 15min (LONG)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":8,"asOf":"2026-12-11","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":112,"longestRunMinutes":39,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["back-squat 3x12 31KG TOTAL","glute-bridge 5x8 0KG BODYWEIGHT","db-step-up 5x6 11KG PER_HAND"],"equipment":["BODYWEIGHT","DUMBBELLS","KETTLEBELL","BARBELL","BANDS","PULL_UP_BAR","BENCH","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":51,"strengthMinutes":46,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2026-12-15 AM STRENGTH_LOWER 41min: back-squat 3x12 RIR3 31kg TOTAL; glute-bridge 5x8 RIR3 BW; db-step-up 5x6 RIR3 11kg PER_HAND; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-16 AM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2026-12-17 AM STRENGTH_FULL_B 42min: glute-bridge 5x8 RIR3 BW; db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-step-up 5x6 RIR3 11kg PER_HAND; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2026-12-22 AM STRENGTH_LOWER 42min: back-squat 3x8 RIR3 33.5kg TOTAL; glute-bridge 5x10 RIR3 BW; db-step-up 5x8 RIR3 11kg PER_HAND; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2026-12-23 AM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d4 2026-12-24 AM STRENGTH_FULL_B 43min: glute-bridge 5x10 RIR3 BW; db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-step-up 5x8 RIR3 11kg PER_HAND; dead-bug 1x14 RIR3 BW

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

## R7D-G021

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, OUT_OF_SCOPE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":12,"asOf":"2026-11-17","tz":330,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4,6],"strengthDays":[0,1,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":64,"strengthMinutes":24,"longRunDay":3,"longRunMinutes":102,"sameTurnConfirmed":false}}`

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

## R7D-G022

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, CLINICAL_SIGNAL · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":8,"asOf":"2026-12-06","tz":0,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":120,"longestRunMinutes":44,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","PULL_UP_BAR","RACK","BARBELL","DUMBBELLS","BODYWEIGHT","BENCH","KETTLEBELL","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,5],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":28,"strengthMinutes":68,"longRunDay":1,"longRunMinutes":32,"sameTurnConfirmed":true}}`

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

## R7D-G023

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-17","weeks":4,"asOf":"2026-12-14","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":216,"longestRunMinutes":28,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1],"strengthDays":[2,3,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":70,"strengthMinutes":33,"longRunDay":0,"longRunMinutes":33,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-17 AM RUN LONG 25min (LONG) | d1 2026-12-18 AM RUN EASY 28min (EASY) | d2 2026-12-19 PM STRENGTH_LOWER 22min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW | d3 2026-12-20 PM STRENGTH_UPPER 20min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW | d4 2026-12-21 PM STRENGTH_LOWER_B 22min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW | d5 2026-12-22 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d6 2026-12-23 PM STRENGTH_UPPER_B 20min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-24 AM RUN LONG 25min (LONG) | d1 2026-12-25 AM RUN EASY 28min (EASY) | d2 2026-12-26 PM STRENGTH_LOWER 28min: box-squat-bodyweight 3x5 RIR3 BW; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW | d3 2026-12-27 PM STRENGTH_UPPER 23min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW | d4 2026-12-28 PM STRENGTH_LOWER_B 28min: glute-bridge 3x5 RIR3 BW; reverse-lunge 3x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW | d5 2026-12-29 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d6 2026-12-30 PM STRENGTH_UPPER_B 23min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":8,"asOf":"2027-01-02","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","MACHINES","RACK","KETTLEBELL","BARBELL","DUMBBELLS","BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":8,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[1,2,3,4,5],"strengthDays":[0,3,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":90,"strengthMinutes":20,"longRunDay":4,"longRunMinutes":56,"sameTurnConfirmed":true}}`

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

## R7D-G025

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":8,"asOf":"2026-12-24","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-07"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-02-07"},"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BENCH","DUMBBELLS","MACHINES","BANDS","PULL_UP_BAR"],"pause":{"nonclinical":true,"weeks":8,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3],"strengthDays":[1,2,3,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":53,"strengthMinutes":61,"longRunDay":1,"longRunMinutes":135,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d1 2026-12-28 PM RUN EASY 15min (EASY) | d1 2026-12-28 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-12-29 AM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; db-biceps-curl 2x8 RIR3 establish | d3 2026-12-30 PM RUN EASY 15min (EASY) | d3 2026-12-30 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-01 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d1 2027-01-04 PM RUN EASY 20min (EASY) | d1 2027-01-04 AM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; db-biceps-curl 2x8 RIR3 last logged | d2 2027-01-05 AM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2027-01-06 PM RUN EASY 20min (EASY) | d3 2027-01-06 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d5 2027-01-08 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW
- Week 5 (TAPER): d1 2027-02-01 PM RUN EASY 15min (EASY) | d1 2027-02-01 AM STRENGTH_UPPER 14min: db-floor-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d2 STRENGTH REST_BY_DESIGN | d3 2027-02-03 PM RUN EASY 15min (EASY) | d3 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN
- Week 6 (RACE_WEEK): d0 2027-02-07  RUN RACE 75min (RACE, completion) | d1 RUN REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d3 2027-02-10 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN

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

## R7D-G026

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":16,"asOf":"2026-11-17","tz":60,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":32,"longestRunMinutes":76,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["leg-press 5x12 92KG TOTAL"],"equipment":["MACHINES","BANDS","KETTLEBELL","BENCH","RACK","PULL_UP_BAR","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0],"runTurn":"PM","strengthTurn":"AM","runMinutes":75,"strengthMinutes":38,"sameTurnConfirmed":true}}`

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

## R7D-G027

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":8,"asOf":"2027-01-04","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","RACK","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":83,"strengthMinutes":71,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-05 PM STRENGTH_LOWER 29min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2027-01-06 PM STRENGTH_UPPER 29min: push-up 2x8 RIR3 BW; inverted-row 2x8 RIR3 BW; pike-push-up 2x10 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2027-01-09 PM STRENGTH_LOWER_B 26min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2027-01-10 PM STRENGTH_UPPER_B 22min: inverted-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; dead-bug 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-12 PM STRENGTH_LOWER 34min: box-squat-bodyweight 3x8 RIR3 BW; glute-bridge 3x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2027-01-13 PM STRENGTH_UPPER 34min: push-up 3x8 RIR3 BW; inverted-row 3x8 RIR3 BW; pike-push-up 2x10 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2027-01-16 PM STRENGTH_LOWER_B 31min: glute-bridge 3x8 RIR3 BW; reverse-lunge 3x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2027-01-17 PM STRENGTH_UPPER_B 27min: inverted-row 3x8 RIR3 BW; push-up 3x8 RIR3 BW; dead-bug 2x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":16,"asOf":"2026-11-21","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":88,"strengthMinutes":26,"longRunDay":6,"longRunMinutes":88,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-23 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-24 PM RUN WALK 20min (WALK) | d2 2026-11-25 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-26 PM RUN WALK 20min (WALK) | d5 2026-11-28 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-11-29 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-11-30 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-01 PM RUN WALK 20min (WALK) | d2 2026-12-02 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-03 PM RUN WALK 20min (WALK) | d5 2026-12-05 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-06 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":8,"asOf":"2026-12-27","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4,5],"strengthDays":[0,3,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":65,"strengthMinutes":66,"longRunDay":0,"longRunMinutes":126,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-28 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-28 AM STRENGTH_LOWER 28min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-12-29 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-31 AM STRENGTH_UPPER 23min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2027-01-01 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2027-01-01 AM STRENGTH_LOWER_B 25min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2027-01-02 PM RUN WALK 20min (WALK) | d5 2027-01-02 AM STRENGTH_UPPER_B 20min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-04 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2027-01-04 AM STRENGTH_LOWER 34min: box-squat-bodyweight 3x5 RIR3 BW; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2027-01-05 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-07 AM STRENGTH_UPPER 26min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2027-01-08 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-08 AM STRENGTH_LOWER_B 31min: glute-bridge 3x5 RIR3 BW; reverse-lunge 3x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2027-01-09 PM RUN WALK 20min (WALK) | d5 2027-01-09 AM STRENGTH_UPPER_B 23min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":12,"asOf":"2026-12-25","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","DUMBBELLS","BODYWEIGHT","KETTLEBELL","BANDS","RACK","BENCH","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,3,4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":73,"strengthMinutes":53,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-27 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-12-28 PM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-29 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-12-30 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-01 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-03 PM STRENGTH_FULL_A 31min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2027-01-04 PM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2027-01-05 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d4 2027-01-06 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d6 2027-01-08 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":8,"asOf":"2026-12-28","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x12 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":58,"strengthMinutes":58,"longRunDay":0,"longRunMinutes":45,"sameTurnConfirmed":false}}`

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

## R7D-G032

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":8,"asOf":"2026-11-10","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":66,"longestRunMinutes":38,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BENCH","MACHINES","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,6],"strengthDays":[2,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":77,"strengthMinutes":54,"longRunDay":4,"longRunMinutes":100,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-11 AM RUN EASY 20min (EASY) | d2 2026-11-12 AM RUN EASY 20min (EASY) | d2 2026-11-12 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-11-13 AM RUN WALK 20min (WALK) | d3 2026-11-13 AM STRENGTH_FULL_B 31min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; band-biceps-curl 2x10 RIR3 BW | d4 2026-11-14 AM RUN LONG 25min (LONG) | d6 2026-11-16 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d1 2026-11-18 AM RUN EASY 20min (EASY) | d2 2026-11-19 AM STRENGTH_FULL_A 31min: leg-press 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-11-19 AM RUN EASY 20min (EASY) | d3 2026-11-20 AM STRENGTH_FULL_B 31min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; band-biceps-curl 2x10 RIR3 BW | d3 2026-11-20 AM RUN WALK 20min (WALK) | d4 2026-11-21 AM RUN LONG 25min (LONG) | d6 2026-11-23 AM RUN WALK 20min (WALK)

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-26","weeks":16,"asOf":"2026-11-26","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-12"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-03-12"},"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,5],"strengthDays":[2,3,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":74,"strengthMinutes":67,"longRunDay":5,"longRunMinutes":64,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-26 PM RUN EASY 15min (EASY) | d2 2026-11-28 AM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 establish; db-rdl 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d3 2026-11-29 AM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; push-up 1x12 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-30 AM STRENGTH_LOWER_B 23min: db-rdl 2x10 RIR3 establish; db-split-squat 2x10 RIR3 establish; bent-knee-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-01 PM RUN EASY 15min (EASY) | d5 2026-12-01 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (BUILD): d0 2026-12-03 PM RUN EASY 20min (EASY) | d2 2026-12-05 AM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2026-12-06 AM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; push-up 1x12 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-07 AM STRENGTH_LOWER_B 23min: db-rdl 2x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged; bent-knee-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-08 PM RUN EASY 20min (EASY) | d5 2026-12-08 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW
- Week 14 (TAPER): d0 2027-03-04 PM RUN EASY 30min (EASY +strides) | d2 2027-03-06 AM STRENGTH_LOWER 14min: goblet-squat 1x10 RIR4 last logged; db-rdl 1x10 RIR4 last logged | d3 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d5 2027-03-09 PM RUN EASY 20min (EASY) | d5 STRENGTH REST_BY_DESIGN
- Week 15 (RACE_WEEK): d0 2027-03-11 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d1 2027-03-12  RUN RACE 150min (RACE, completion) | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d5 2027-03-16 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d5 STRENGTH REST_BY_DESIGN

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

## R7D-G034

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":4,"asOf":"2026-11-23","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-20"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2026-12-20"},"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":285,"longestRunMinutes":64,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x6 0KG BODYWEIGHT","glute-bridge 2x12 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":3,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5],"strengthDays":[2,3,4,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":77,"strengthMinutes":62,"longRunDay":5,"longRunMinutes":78,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · SPECIFIC · RACE_WEEK
- Week 0 (BUILD): d2 2026-11-25 AM STRENGTH_LOWER 38min: box-squat-bodyweight 5x6 RIR3 BW; glute-bridge 2x12 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-11-26 AM STRENGTH_UPPER 20min: incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-11-27 AM STRENGTH_UPPER_B 20min: incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-11-28 AM RUN LONG 60min (LONG) | d5 2026-11-28 AM STRENGTH_LOWER_B 26min: glute-bridge 2x12 RIR3 BW; reverse-lunge 2x5 RIR3 BW; bent-knee-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-11-29 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW
- Week 1 (SPECIFIC): d2 2026-12-02 AM STRENGTH_LOWER 36min: box-squat-bodyweight 4x6 RIR3 BW; glute-bridge 2x12 RIR3 BW; reverse-lunge 2x9 RIR3 BW; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d3 2026-12-03 AM STRENGTH_UPPER 24min: incline-push-up 3x7 RIR3 BW; prone-ytw-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d4 2026-12-04 AM STRENGTH_UPPER_B 24min: incline-push-up 3x7 RIR3 BW; prone-ytw-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d5 2026-12-05 AM RUN LONG 65min (LONG) | d5 2026-12-05 AM STRENGTH_LOWER_B 30min: glute-bridge 2x12 RIR3 BW; reverse-lunge 3x9 RIR3 BW; bent-knee-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d6 2026-12-06 AM STRENGTH_CORE 19min: dead-bug 2x9 RIR3 BW; standing-calf-raise 2x9 RIR3 BW; front-plank 2x9 RIR3 BW
- Week 2 (SPECIFIC): d2 2026-12-09 AM STRENGTH_LOWER 36min: box-squat-bodyweight 4x6 RIR3 BW; glute-bridge 2x12 RIR3 BW; reverse-lunge 2x9 RIR3 BW; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d3 2026-12-10 AM STRENGTH_UPPER 24min: incline-push-up 3x7 RIR3 BW; prone-ytw-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d4 2026-12-11 AM STRENGTH_UPPER_B 24min: incline-push-up 3x7 RIR3 BW; prone-ytw-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d5 2026-12-12 AM RUN LONG 70min (LONG) | d5 2026-12-12 AM STRENGTH_LOWER_B 30min: glute-bridge 2x12 RIR3 BW; reverse-lunge 3x9 RIR3 BW; bent-knee-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d6 2026-12-13 AM STRENGTH_CORE 19min: dead-bug 2x9 RIR3 BW; standing-calf-raise 2x9 RIR3 BW; front-plank 2x9 RIR3 BW
- Week 3 (RACE_WEEK): d2 2026-12-16 AM STRENGTH_LOWER 14min: box-squat-bodyweight 1x6 RIR4 BW; glute-bridge 1x12 RIR4 BW | d3 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d5 2026-12-19 AM RUN SHAKEOUT 15min (SHAKEOUT) | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN | d6 2026-12-20  RUN RACE 150min (RACE, completion)

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

## R7D-G035

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":12,"asOf":"2026-12-13","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS","DUMBBELLS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":71,"strengthMinutes":44,"longRunDay":3,"longRunMinutes":52,"sameTurnConfirmed":false}}`

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

## R7D-G036

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":8,"asOf":"2026-11-15","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":31,"longestRunMinutes":33,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x5 0KG BODYWEIGHT"],"equipment":["PULL_UP_BAR","RACK","BARBELL","BANDS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":90,"strengthMinutes":20,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d4 2026-11-21 AM STRENGTH_LOWER 19min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x5 RIR3 BW | d5 2026-11-22 AM STRENGTH_UPPER 19min: incline-push-up 2x5 RIR3 BW; band-row 2x5 RIR3 BW | d6 2026-11-23 AM STRENGTH_FULL_B 18min: glute-bridge 2x5 RIR3 BW; band-row 1x5 RIR3 BW; incline-push-up 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d4 2026-11-28 AM STRENGTH_LOWER 19min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x7 RIR3 BW | d5 2026-11-29 AM STRENGTH_UPPER 19min: incline-push-up 2x7 RIR3 BW; band-row 2x6 RIR3 BW | d6 2026-11-30 AM STRENGTH_FULL_B 19min: glute-bridge 2x7 RIR3 BW; band-row 1x6 RIR3 BW; incline-push-up 1x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":4,"asOf":"2027-01-01","tz":0,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":240,"longestRunMinutes":24,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x6 0KG BODYWEIGHT","glute-bridge 4x6 0KG BODYWEIGHT"],"equipment":["PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5,6],"strengthDays":[5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":28,"strengthMinutes":40,"longRunDay":6,"longRunMinutes":58,"sameTurnConfirmed":true}}`

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

## R7D-G038

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":4,"asOf":"2026-11-18","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BARBELL","MACHINES","RACK","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[0,2,3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":83,"strengthMinutes":50,"longRunDay":1,"longRunMinutes":130,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-21 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-22 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-23 PM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; db-biceps-curl 2x8 RIR3 establish | d3 2026-11-24 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-11-25 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-27 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-28 PM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-11-29 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-11-30 PM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; db-biceps-curl 2x8 RIR3 last logged | d3 2026-12-01 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d4 2026-12-02 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2026-12-04 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":4,"asOf":"2026-12-29","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[4],"runTurn":"PM","strengthTurn":"AM","runMinutes":34,"strengthMinutes":26,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d4 2027-01-04 AM STRENGTH_FULL_A 22min: box-squat-bodyweight 2x6 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d4 2027-01-11 AM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":8,"asOf":"2026-11-07","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","DUMBBELLS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,6],"strengthDays":[3,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":67,"strengthMinutes":53,"longRunDay":6,"longRunMinutes":73,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-11-11 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-12 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d5 2026-11-14 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-15 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d2 2026-11-18 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-19 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2026-11-21 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-22 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-11","weeks":16,"asOf":"2026-12-09","tz":60,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x8 23KG SINGLE_IMPLEMENT"],"equipment":["RACK","KETTLEBELL","PULL_UP_BAR","BANDS","BENCH","BODYWEIGHT","BARBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3],"strengthDays":[2,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":82,"strengthMinutes":36,"longRunDay":3,"longRunMinutes":103,"sameTurnConfirmed":true}}`

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

**Tags.** COLD_START, H12, RACE_HALF, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":12,"asOf":"2026-12-27","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-16"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-03-16"},"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":215,"longestRunMinutes":72,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["goblet-squat 2x6 6KG PER_HAND","barbell-rdl 4x6 107KG TOTAL"],"equipment":["DUMBBELLS","BARBELL","RACK","BODYWEIGHT","BANDS","KETTLEBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[0,1,3,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":74,"strengthMinutes":40,"longRunDay":0,"longRunMinutes":110,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d0 2026-12-28 AM RUN LONG 70min (LONG) | d0 2026-12-28 PM STRENGTH_LOWER 28min: goblet-squat 2x6 RIR3 6kg PER_HAND; barbell-rdl 4x6 RIR3 107kg TOTAL; db-split-squat 1x12 RIR3 establish; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d1 2026-12-29 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d3 2026-12-31 PM STRENGTH_LOWER_B 27min: barbell-rdl 4x6 RIR3 107kg TOTAL; db-split-squat 2x10 RIR3 establish; seated-calf-raise-db 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d6 2027-01-03 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (BUILD): d0 2027-01-04 AM RUN LONG 75min (LONG) | d0 2027-01-04 PM STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 6kg PER_HAND; barbell-rdl 4x8 RIR3 107kg TOTAL; db-split-squat 1x12 RIR3 last logged; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2027-01-05 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d3 2027-01-07 PM STRENGTH_LOWER_B 28min: barbell-rdl 4x8 RIR3 107kg TOTAL; db-split-squat 2x12 RIR3 last logged; seated-calf-raise-db 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d6 2027-01-10 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; dead-bug 1x14 RIR3 BW
- Week 10 (TAPER): d0 2027-03-08 AM RUN LONG 65min (LONG) | d0 2027-03-08 PM STRENGTH_LOWER 22min: goblet-squat 1x10 RIR3 8kg PER_HAND; barbell-rdl 2x10 RIR3 109.5kg TOTAL; db-split-squat 1x12 RIR3 last logged; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d1 2027-03-09 PM STRENGTH_UPPER 19min: db-bench-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d3 2027-03-11 PM STRENGTH_LOWER_B 14min: barbell-rdl 1x10 RIR4 109.5kg TOTAL; db-split-squat 1x12 RIR4 last logged | d6 STRENGTH REST_BY_DESIGN
- Week 11 (RACE_WEEK): d0 2027-03-15 AM RUN SHAKEOUT 15min (SHAKEOUT) | d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d1 2027-03-16  RUN RACE 150min (RACE) | d3 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":16,"asOf":"2027-01-02","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-04-15"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-04-15"},"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BARBELL","KETTLEBELL","RACK","BENCH","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":79,"strengthMinutes":47,"longRunDay":1,"longRunMinutes":40,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2027-01-05 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-06 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2027-01-11 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2027-01-12 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-13 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-18 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 13 (TAPER): d0 2027-04-06 PM RUN EASY 20min (EASY) | d1 2027-04-07 PM RUN EASY 20min (EASY) | d6 2027-04-12 PM RUN EASY 15min (EASY)
- Week 14 (RACE_WEEK): d0 2027-04-13 PM RUN EASY 15min (EASY) | d1 2027-04-14 PM RUN SHAKEOUT 15min (SHAKEOUT) | d2 2027-04-15  RUN RACE 75min (RACE, completion) | d6 2027-04-19 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":16,"asOf":"2026-11-27","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":92,"longestRunMinutes":32,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[0,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":28,"strengthMinutes":64,"longRunDay":1,"longRunMinutes":48,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-30 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-01 AM RUN LONG 30min (LONG) | d4 2026-12-04 AM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-06 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-07 AM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-08 AM RUN LONG 30min (LONG) | d4 2026-12-11 AM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-13 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":4,"asOf":"2026-11-17","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-16"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2026-12-16"},"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":115,"longestRunMinutes":82,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[1,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":87,"strengthMinutes":41,"longRunDay":0,"longRunMinutes":93,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-20 PM RUN LONG 80min (LONG) | d1 2026-11-21 AM STRENGTH_FULL_A 30min: leg-press 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-11-23 AM STRENGTH_FULL_B 30min: glute-bridge 2x5 RIR3 BW; seated-cable-row 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (BUILD): d0 2026-11-27 PM RUN LONG 80min (LONG) | d1 2026-11-28 AM STRENGTH_FULL_A 39min: leg-press 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-11-30 AM STRENGTH_FULL_B 39min: glute-bridge 3x5 RIR3 BW; seated-cable-row 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 2 (SPECIFIC): d0 2026-12-04 PM RUN LONG 80min (LONG) | d1 2026-12-05 AM STRENGTH_FULL_A 39min: leg-press 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d3 2026-12-07 AM STRENGTH_FULL_B 40min: glute-bridge 3x7 RIR3 BW; seated-cable-row 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; reverse-lunge 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW
- Week 3 (RACE_WEEK): d0 2026-12-11 PM RUN EASY 15min (EASY) | d1 2026-12-12 AM STRENGTH_FULL_A 15min: leg-press 1x5 RIR4 last logged; machine-chest-press 1x5 RIR4 last logged; seated-cable-row 1x5 RIR4 last logged | d3 STRENGTH REST_BY_DESIGN | d5 2026-12-16  RUN RACE 75min (RACE)

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":4,"asOf":"2026-11-28","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BODYWEIGHT","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4],"strengthDays":[0],"runTurn":"AM","strengthTurn":"AM","runMinutes":47,"strengthMinutes":50,"longRunDay":0,"longRunMinutes":70,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-30 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-11-30 AM STRENGTH_FULL_A 27min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; inverted-row 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-01 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-04 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-07 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-07 AM STRENGTH_FULL_A 27min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; inverted-row 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-08 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-11 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":16,"asOf":"2026-11-28","tz":330,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":270,"longestRunMinutes":48,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","RACK","KETTLEBELL","BODYWEIGHT","BENCH","BANDS","DUMBBELLS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":16,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[0,1,2,3,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":66,"strengthMinutes":58,"longRunDay":0,"longRunMinutes":136,"sameTurnConfirmed":false}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: POPULATION_OUTSIDE_V1_AGE_RANGE · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":4,"asOf":"2026-11-27","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 2x5 50KG TOTAL","glute-bridge 2x8 0KG BODYWEIGHT","reverse-lunge 5x10 0KG BODYWEIGHT"],"equipment":["RACK","MACHINES","BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[3],"runTurn":"AM","strengthTurn":"PM","runMinutes":33,"strengthMinutes":25,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d3 2026-12-03 PM STRENGTH_FULL_A 24min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d3 2026-12-10 PM STRENGTH_FULL_A 24min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":12,"asOf":"2027-01-02","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":270,"longestRunMinutes":45,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["goblet-squat 5x6 7KG PER_HAND"],"equipment":["BODYWEIGHT","PULL_UP_BAR","DUMBBELLS","BARBELL","BENCH","BANDS","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[0,2,3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":43,"strengthMinutes":72,"longRunDay":0,"longRunMinutes":71,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-02 PM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; incline-push-up 1x12 RIR3 BW; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d0 2027-01-02 PM RUN LONG 45min (LONG) | d1 2027-01-03 PM RUN EASY 43min (EASY) | d2 2027-01-04 PM STRENGTH_LOWER 31min: goblet-squat 5x6 RIR3 7kg PER_HAND; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-04 PM RUN EASY 43min (EASY) | d3 2027-01-05 PM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-05 PM RUN EASY 43min (EASY) | d4 2027-01-06 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d4 2027-01-06 PM RUN EASY 43min (EASY) | d6 2027-01-08 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-09 PM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; incline-push-up 1x14 RIR3 BW; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d0 2027-01-09 PM RUN LONG 50min (LONG) | d1 2027-01-10 PM RUN EASY 43min (EASY) | d2 2027-01-11 PM STRENGTH_LOWER 33min: goblet-squat 5x8 RIR3 7kg PER_HAND; glute-bridge 2x12 RIR3 BW; reverse-lunge 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2027-01-11 PM RUN EASY 43min (EASY) | d3 2027-01-12 PM STRENGTH_LOWER_B 24min: glute-bridge 2x12 RIR3 BW; reverse-lunge 2x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2027-01-12 PM RUN EASY 43min (EASY) | d4 2027-01-13 PM STRENGTH_CORE 14min: dead-bug 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; front-plank 1x14 RIR3 BW | d4 2027-01-13 PM RUN EASY 43min (EASY) | d6 2027-01-15 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; dead-bug 1x14 RIR3 BW

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

## R7D-G050

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":16,"asOf":"2026-11-27","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":245,"longestRunMinutes":107,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BARBELL","RACK","BENCH","PULL_UP_BAR"],"pause":{"nonclinical":true,"weeks":8,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0,3,4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":48,"strengthMinutes":28,"longRunDay":4,"longRunMinutes":93,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-28 AM RUN EASY 15min (EASY) | d0 2026-11-28 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-29 AM RUN WALK 20min (WALK) | d2 2026-11-30 AM RUN EASY 15min (EASY) | d3 2026-12-01 AM RUN WALK 20min (WALK) | d3 2026-12-01 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d4 2026-12-02 AM RUN EASY 15min (EASY) | d4 2026-12-02 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-04 AM RUN WALK 20min (WALK) | d6 2026-12-04 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-05 AM RUN EASY 20min (EASY) | d0 2026-12-05 PM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-12-06 AM RUN WALK 20min (WALK) | d2 2026-12-07 AM RUN EASY 20min (EASY) | d3 2026-12-08 AM RUN WALK 20min (WALK) | d3 2026-12-08 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d4 2026-12-09 AM RUN EASY 20min (EASY) | d4 2026-12-09 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2026-12-11 AM RUN WALK 20min (WALK) | d6 2026-12-11 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_HALF · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":4,"asOf":"2026-11-06","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-05"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2026-12-05"},"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":90,"longestRunMinutes":90,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["leg-press 2x5 120KG TOTAL"],"equipment":["BARBELL","KETTLEBELL","BANDS","PULL_UP_BAR","MACHINES","RACK","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,6],"strengthDays":[3,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":69,"strengthMinutes":50,"longRunDay":1,"longRunMinutes":95,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-09 PM RUN EASY 15min (EASY) | d1 2026-11-10 PM RUN LONG 35min (LONG) | d2 2026-11-11 PM RUN EASY 15min (EASY) | d3 2026-11-12 AM STRENGTH_FULL_A 30min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-11-14 AM STRENGTH_FULL_B 30min: kb-deadlift 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-11-15 PM RUN EASY 15min (EASY)
- Week 1 (BUILD): d0 2026-11-16 PM RUN EASY 15min (EASY) | d1 2026-11-17 PM RUN LONG 35min (LONG) | d2 2026-11-18 PM RUN EASY 15min (EASY) | d3 2026-11-19 AM STRENGTH_FULL_A 39min: goblet-squat 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d5 2026-11-21 AM STRENGTH_FULL_B 39min: kb-deadlift 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-11-22 PM RUN EASY 15min (EASY)
- Week 2 (SPECIFIC): d0 2026-11-23 PM RUN EASY 15min (EASY) | d1 2026-11-24 PM RUN LONG 35min (LONG) | d2 2026-11-25 PM RUN EASY 15min (EASY) | d3 2026-11-26 AM STRENGTH_FULL_A 39min: goblet-squat 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d5 2026-11-28 AM STRENGTH_FULL_B 39min: kb-deadlift 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; reverse-lunge 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d6 2026-11-29 PM RUN EASY 15min (EASY)
- Week 3 (RACE_WEEK): d0 2026-11-30 PM RUN EASY 15min (EASY) | d1 2026-12-01 PM RUN EASY 15min (EASY) | d2 2026-12-02 PM RUN EASY 15min (EASY) | d3 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d5 2026-12-05  RUN RACE 150min (RACE, completion) | d6 RUN REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-18","weeks":4,"asOf":"2026-12-17","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":180,"longestRunMinutes":88,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3],"strengthDays":[0,1,3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":31,"strengthMinutes":21,"longRunDay":3,"longRunMinutes":52,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-18 PM STRENGTH_LOWER 19min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW | d1 2026-12-19 PM STRENGTH_UPPER 21min: push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; pike-push-up 2x10 RIR3 BW | d2 2026-12-20 PM RUN EASY 31min (EASY) | d3 2026-12-21 PM RUN LONG 52min (LONG) | d3 2026-12-21 PM STRENGTH_LOWER_B 19min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW | d4 2026-12-22 PM STRENGTH_UPPER_B 21min: push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2026-12-24 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-25 PM STRENGTH_LOWER 21min: box-squat-bodyweight 3x8 RIR3 BW; glute-bridge 2x8 RIR3 BW | d1 2026-12-26 PM STRENGTH_UPPER 20min: push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW | d2 2026-12-27 PM RUN EASY 31min (EASY) | d3 2026-12-28 PM RUN LONG 52min (LONG) | d3 2026-12-28 PM STRENGTH_LOWER_B 21min: glute-bridge 3x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW | d4 2026-12-29 PM STRENGTH_UPPER_B 20min: push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW | d6 2026-12-31 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":12,"asOf":"2026-12-02","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":82,"strengthMinutes":53,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-04 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-05 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-08 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-09 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-10 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-11 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-12 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-15 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d5 2026-12-16 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2026-12-17 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Intake.** `{"startDate":"2026-12-31","weeks":12,"asOf":"2026-12-31","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":82,"strengthMinutes":26,"longRunDay":3,"longRunMinutes":132,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d3 2027-01-03 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2027-01-04 AM STRENGTH_LOWER 22min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW | d5 2027-01-05 AM STRENGTH_UPPER 20min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW | d6 2027-01-06 AM STRENGTH_FULL_B 22min: glute-bridge 2x5 RIR3 BW; push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d3 2027-01-10 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-11 AM STRENGTH_LOWER 24min: box-squat-bodyweight 3x5 RIR3 BW; glute-bridge 3x5 RIR3 BW | d5 2027-01-12 AM STRENGTH_UPPER 23min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW | d6 2027-01-13 AM STRENGTH_FULL_B 24min: glute-bridge 3x5 RIR3 BW; push-up 3x5 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-03","weeks":12,"asOf":"2026-12-02","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-15"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-02-15"},"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":104,"longestRunMinutes":38,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x8 15KG SINGLE_IMPLEMENT","kb-deadlift 4x8 21KG SINGLE_IMPLEMENT"],"equipment":["KETTLEBELL","BODYWEIGHT","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":88,"strengthMinutes":52,"longRunDay":1,"longRunMinutes":137,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-12-03 AM RUN EASY 38min (EASY) | d1 2026-12-04 AM RUN LONG 35min (LONG)
- Week 1 (BUILD): d0 2026-12-10 AM RUN EASY 38min (EASY) | d1 2026-12-11 AM RUN LONG 40min (LONG)
- Week 9 (TAPER): d0 2027-02-04 AM RUN EASY 40min (EASY +strides) | d1 2027-02-05 AM RUN LONG 45min (LONG)
- Week 10 (RACE_WEEK): d0 2027-02-11 AM RUN EASY 25min (EASY) | d1 2027-02-12 AM RUN EASY 25min (EASY) | d4 2027-02-15  RUN RACE 75min (RACE)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-11","weeks":8,"asOf":"2026-12-11","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":220,"longestRunMinutes":150,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","KETTLEBELL","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,3,4,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":73,"strengthMinutes":29,"sameTurnConfirmed":true}}`

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

## R7D-G057

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":4,"asOf":"2026-11-19","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","KETTLEBELL","MACHINES","BANDS","BENCH","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":36,"strengthMinutes":42,"longRunDay":1,"longRunMinutes":32,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-21 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d1 2026-11-28 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-03","weeks":4,"asOf":"2026-11-30","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":116,"longestRunMinutes":15,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BENCH","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,4],"strengthDays":[0,3,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":73,"strengthMinutes":36,"longRunDay":1,"longRunMinutes":88,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-03 AM STRENGTH_UPPER 28min: push-up 2x5 RIR3 BW; kb-row 2x5 RIR3 establish; incline-push-up 2x7 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-12-04 AM RUN LONG 15min (LONG) | d3 2026-12-06 AM STRENGTH_LOWER 28min: kb-goblet-squat 2x5 RIR3 establish; kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-06 AM RUN EASY 15min (EASY) | d4 2026-12-07 AM RUN EASY 15min (EASY) | d5 2026-12-08 AM STRENGTH_LOWER_B 25min: kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-09 AM STRENGTH_UPPER_B 22min: kb-row 2x5 RIR3 establish; push-up 2x5 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-10 AM STRENGTH_UPPER 34min: push-up 3x5 RIR3 BW; kb-row 3x5 RIR3 last logged; incline-push-up 2x7 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-12-11 AM RUN LONG 15min (LONG) | d3 2026-12-13 AM STRENGTH_LOWER 34min: kb-goblet-squat 3x5 RIR3 last logged; kb-deadlift 3x5 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-13 AM RUN EASY 15min (EASY) | d4 2026-12-14 AM RUN EASY 15min (EASY) | d5 2026-12-15 AM STRENGTH_LOWER_B 31min: kb-deadlift 3x5 RIR3 last logged; reverse-lunge 3x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-16 AM STRENGTH_UPPER_B 28min: kb-row 3x5 RIR3 last logged; push-up 3x5 RIR3 BW; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-03","weeks":4,"asOf":"2027-01-01","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":225,"longestRunMinutes":88,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x12 0KG BODYWEIGHT"],"equipment":["MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1],"runTurn":"AM","strengthTurn":"PM","runMinutes":38,"strengthMinutes":56,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2027-01-04 PM STRENGTH_FULL_A 31min: leg-press 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-11 PM STRENGTH_FULL_A 38min: leg-press 3x8 RIR3 last logged; machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-10","weeks":16,"asOf":"2026-12-08","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":120,"longestRunMinutes":56,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["kb-goblet-squat 4x5 22KG SINGLE_IMPLEMENT","glute-bridge 3x5 0KG BODYWEIGHT","db-split-squat 4x10 23KG PER_HAND"],"equipment":["RACK","BANDS","KETTLEBELL","BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,5,6],"strengthDays":[0,1,3,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":53,"strengthMinutes":62,"longRunDay":5,"longRunMinutes":55,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-10 PM STRENGTH_LOWER 39min: kb-goblet-squat 4x5 RIR3 22kg SINGLE_IMPLEMENT; glute-bridge 3x5 RIR3 BW; db-split-squat 4x10 RIR3 23kg PER_HAND; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-11 PM STRENGTH_UPPER 29min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2026-12-13 PM STRENGTH_LOWER_B 33min: glute-bridge 3x5 RIR3 BW; db-split-squat 4x10 RIR3 23kg PER_HAND; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d4 2026-12-14 AM RUN EASY 35min (EASY) | d4 2026-12-14 PM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-overhead-triceps-extension 2x10 RIR3 establish | d5 2026-12-15 AM RUN LONG 50min (LONG) | d6 2026-12-16 AM RUN EASY 35min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-17 PM STRENGTH_LOWER 41min: kb-goblet-squat 4x7 RIR3 22kg SINGLE_IMPLEMENT; glute-bridge 3x7 RIR3 BW; db-split-squat 4x12 RIR3 23kg PER_HAND; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d1 2026-12-18 PM STRENGTH_UPPER 35min: db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d3 2026-12-20 PM STRENGTH_LOWER_B 35min: glute-bridge 3x7 RIR3 BW; db-split-squat 4x12 RIR3 23kg PER_HAND; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d4 2026-12-21 AM RUN EASY 35min (EASY) | d4 2026-12-21 PM STRENGTH_UPPER_B 27min: db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-overhead-triceps-extension 2x10 RIR3 last logged | d5 2026-12-22 AM RUN LONG 50min (LONG) | d6 2026-12-23 AM RUN EASY 35min (EASY)

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

## R7D-G061

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":8,"asOf":"2027-01-03","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":115,"longestRunMinutes":46,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","RACK","BARBELL","BANDS","PULL_UP_BAR","DUMBBELLS","BODYWEIGHT","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,2,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":75,"strengthMinutes":38,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-04 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2027-01-06 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-08 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-09 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-11 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-13 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-15 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d5 2027-01-16 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-25","weeks":16,"asOf":"2026-12-24","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":106,"longestRunMinutes":126,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4],"strengthDays":[0,1,2,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":35,"strengthMinutes":56,"longRunDay":1,"longRunMinutes":64,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-25 PM RUN EASY 20min (EASY) | d0 2026-12-25 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-26 PM RUN LONG 45min (LONG) | d1 2026-12-26 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-27 PM RUN EASY 20min (EASY) | d2 2026-12-27 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-12-29 PM RUN EASY 20min (EASY) | d4 2026-12-29 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-31 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-01 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d0 2027-01-01 PM RUN EASY 20min (EASY) | d1 2027-01-02 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2027-01-02 PM RUN LONG 45min (LONG) | d2 2027-01-03 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2027-01-03 PM RUN EASY 20min (EASY) | d4 2027-01-05 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d4 2027-01-05 PM RUN EASY 20min (EASY) | d6 2027-01-07 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":16,"asOf":"2026-12-25","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":81,"longestRunMinutes":21,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x10 0KG BODYWEIGHT","glute-bridge 4x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":5,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":72,"strengthMinutes":54,"longRunDay":0,"longRunMinutes":119,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-28 PM RUN EASY 15min (EASY) | d1 2026-12-29 PM RUN EASY 15min (EASY) | d5 2027-01-02 PM RUN EASY 15min (EASY) | d6 2027-01-03 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2027-01-04 PM RUN EASY 20min (EASY) | d1 2027-01-05 PM RUN EASY 20min (EASY) | d5 2027-01-09 PM RUN EASY 20min (EASY) | d6 2027-01-10 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":4,"asOf":"2026-12-31","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","PULL_UP_BAR","BARBELL"],"pause":{"nonclinical":true,"weeks":7,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":15,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[0,3,4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":85,"strengthMinutes":24,"longRunDay":6,"longRunMinutes":90,"sameTurnConfirmed":false}}`

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

## R7D-G065

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":12,"asOf":"2026-12-04","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-26"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-02-26"},"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":49,"longestRunMinutes":46,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","KETTLEBELL","BENCH","MACHINES","RACK","BARBELL","DUMBBELLS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,4],"strengthDays":[0,1,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":68,"strengthMinutes":68,"longRunDay":4,"longRunMinutes":130,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-06 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-07 AM RUN EASY 25min (EASY) | d1 2026-12-07 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-08 AM RUN WALK 20min (WALK) | d4 2026-12-10 AM RUN LONG 20min (LONG) | d4 2026-12-10 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-11 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-12 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2026-12-13 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d1 2026-12-14 AM RUN EASY 25min (EASY) | d1 2026-12-14 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-15 AM RUN WALK 20min (WALK) | d4 2026-12-17 AM RUN LONG 20min (LONG) | d4 2026-12-17 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x12 RIR3 establish; front-plank 1x12 RIR3 BW | d5 2026-12-18 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x12 RIR3 establish; front-plank 1x12 RIR3 BW | d6 2026-12-19 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x12 RIR3 establish; front-plank 1x12 RIR3 BW
- Week 10 (TAPER): d0 2027-02-14 PM STRENGTH_LOWER 20min: goblet-squat 1x10 RIR3 last logged; kb-deadlift 1x8 RIR3 last logged; reverse-lunge 1x16 RIR3 BW; db-calf-raise 1x12 RIR3 last logged; front-plank 1x16 RIR3 BW | d1 2027-02-15 AM RUN EASY 20min (EASY +strides) | d1 2027-02-15 PM STRENGTH_UPPER 19min: db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; incline-push-up 1x14 RIR3 BW; band-row 1x12 RIR3 BW; front-plank 1x16 RIR3 BW | d2 2027-02-16 AM RUN EASY 20min (EASY +strides) | d4 2027-02-18 AM RUN LONG 25min (LONG) | d4 2027-02-18 PM STRENGTH_LOWER_B 18min: kb-deadlift 1x8 RIR3 last logged; reverse-lunge 1x16 RIR3 BW; seated-calf-raise-db 1x12 RIR3 last logged; front-plank 1x16 RIR3 BW | d5 2027-02-19 PM STRENGTH_UPPER_B 16min: db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; front-plank 1x16 RIR3 BW | d6 STRENGTH REST_BY_DESIGN
- Week 11 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 2027-02-22 AM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d2 2027-02-23 AM RUN EASY 15min (EASY) | d4 2027-02-25 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d5 2027-02-26  RUN RACE 75min (RACE) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":4,"asOf":"2027-01-05","tz":-180,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4],"strengthDays":[1,2],"runTurn":"AM","strengthTurn":"PM","runMinutes":28,"strengthMinutes":24,"longRunDay":3,"longRunMinutes":122,"sameTurnConfirmed":true}}`

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

## R7D-G067

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-17","weeks":8,"asOf":"2026-12-16","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":22,"longestRunMinutes":59,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 5x6 27KG PER_HAND","barbell-rdl 3x8 32KG TOTAL"],"equipment":["BODYWEIGHT","RACK","BENCH","DUMBBELLS","PULL_UP_BAR","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":52,"strengthMinutes":37,"longRunDay":0,"longRunMinutes":43,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-17 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-23 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-24 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-30 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":16,"asOf":"2026-11-09","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","RACK","KETTLEBELL","BANDS","PULL_UP_BAR","MACHINES","BARBELL","BODYWEIGHT","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3],"strengthDays":[0,1,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":60,"strengthMinutes":50,"longRunDay":3,"longRunMinutes":139,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-11 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-12 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-12 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 1x10 RIR3 establish; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-11-13 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-14 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-11-15 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-17 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-18 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-19 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-11-19 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2026-11-20 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-21 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-11-22 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-24 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":4,"asOf":"2026-11-16","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-05"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2026-12-05"},"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":140,"longestRunMinutes":78,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["kb-goblet-squat 3x8 10KG SINGLE_IMPLEMENT"],"equipment":["KETTLEBELL","BODYWEIGHT","DUMBBELLS","MACHINES","BARBELL","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,5],"strengthDays":[0,1,2,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":51,"strengthMinutes":34,"longRunDay":5,"longRunMinutes":47,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-11-18 PM STRENGTH_LOWER 25min: kb-goblet-squat 3x6 RIR3 10kg SINGLE_IMPLEMENT; kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW | d1 2026-11-19 PM STRENGTH_UPPER 22min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; machine-chest-press 2x7 RIR3 establish | d2 2026-11-20 PM STRENGTH_LOWER_B 22min: kb-deadlift 2x5 RIR3 establish; reverse-lunge 2x5 RIR3 BW; seated-calf-raise-machine 2x7 RIR3 establish | d3 2026-11-21 PM RUN EASY 51min (EASY) | d4 2026-11-22 PM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-11-23 PM RUN LONG 47min (LONG)
- Week 1 (SPECIFIC): d0 2026-11-25 PM STRENGTH_LOWER 28min: kb-goblet-squat 3x6 RIR3 10kg SINGLE_IMPLEMENT; kb-deadlift 3x5 RIR3 last logged; reverse-lunge 2x9 RIR3 BW | d1 2026-11-26 PM STRENGTH_UPPER 28min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; machine-chest-press 2x7 RIR3 last logged | d2 2026-11-27 PM STRENGTH_LOWER_B 28min: kb-deadlift 3x5 RIR3 last logged; reverse-lunge 3x9 RIR3 BW; seated-calf-raise-machine 2x7 RIR3 last logged | d3 2026-11-28 PM RUN EASY 51min (EASY) | d4 2026-11-29 PM STRENGTH_UPPER_B 13min: db-row 1x5 RIR4 last logged; db-floor-press 1x5 RIR4 last logged | d5 2026-11-30 PM RUN EASY 25min (EASY)
- Week 1 (SPECIFIC): d0 2026-11-25 PM STRENGTH_LOWER 28min: kb-goblet-squat 3x6 RIR3 10kg SINGLE_IMPLEMENT; kb-deadlift 3x5 RIR3 last logged; reverse-lunge 2x9 RIR3 BW | d1 2026-11-26 PM STRENGTH_UPPER 28min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; machine-chest-press 2x7 RIR3 last logged | d2 2026-11-27 PM STRENGTH_LOWER_B 28min: kb-deadlift 3x5 RIR3 last logged; reverse-lunge 3x9 RIR3 BW; seated-calf-raise-machine 2x7 RIR3 last logged | d3 2026-11-28 PM RUN EASY 51min (EASY) | d4 2026-11-29 PM STRENGTH_UPPER_B 13min: db-row 1x5 RIR4 last logged; db-floor-press 1x5 RIR4 last logged | d5 2026-11-30 PM RUN EASY 25min (EASY)
- Week 2 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d3 2026-12-05  RUN RACE 150min (RACE, completion) | d4 STRENGTH REST_BY_DESIGN | d5 2026-12-07 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":8,"asOf":"2026-12-30","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-16"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2027-02-16"},"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":17,"specialPopulation":null,"schedule":{"runDays":[1,6],"strengthDays":[0,1,3,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":42,"strengthMinutes":42,"longRunDay":1,"longRunMinutes":89,"sameTurnConfirmed":false}}`

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

## R7D-G071

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":12,"asOf":"2026-12-18","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":348,"longestRunMinutes":43,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT","RACK","BARBELL","MACHINES","BANDS","PULL_UP_BAR","BENCH","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,6],"strengthDays":[1,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":58,"strengthMinutes":71,"longRunDay":6,"longRunMinutes":81,"sameTurnConfirmed":true}}`

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

## R7D-G072

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":4,"asOf":"2026-12-04","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-21"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2026-12-21"},"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x12 0KG BODYWEIGHT"],"equipment":["DUMBBELLS","KETTLEBELL","MACHINES","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4],"strengthDays":[1],"runTurn":"PM","strengthTurn":"PM","runMinutes":21,"strengthMinutes":71,"longRunDay":4,"longRunMinutes":59,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d1 2026-12-08 PM STRENGTH_FULL_A 34min: box-squat-bodyweight 4x12 RIR3 BW; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2026-12-11 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d1 2026-12-15 PM STRENGTH_FULL_A 17min: box-squat-bodyweight 1x12 RIR4 BW; db-floor-press 1x10 RIR4 last logged; db-row 1x10 RIR4 last logged | d4 2026-12-18 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d1 2026-12-15 PM STRENGTH_FULL_A 17min: box-squat-bodyweight 1x12 RIR4 BW; db-floor-press 1x10 RIR4 last logged; db-row 1x10 RIR4 last logged | d4 2026-12-18 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 2 (RACE_WEEK): d0 2026-12-21  RUN RACE 75min (RACE, completion) | d1 STRENGTH REST_BY_DESIGN | d4 2026-12-25 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":16,"asOf":"2026-12-29","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-15"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-04-15"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":118,"longestRunMinutes":60,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","PULL_UP_BAR","KETTLEBELL","BARBELL","MACHINES","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4],"strengthDays":[0,1,2,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":76,"strengthMinutes":36,"longRunDay":0,"longRunMinutes":134,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-31 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 1x10 RIR3 BW; seated-cable-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d0 2026-12-31 AM RUN LONG 45min (LONG) | d1 2027-01-01 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish | d1 2027-01-01 AM RUN EASY 20min (EASY) | d2 2027-01-02 AM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; seated-calf-raise-machine 1x10 RIR3 establish; tibialis-raise 1x10 RIR3 BW | d2 2027-01-02 AM RUN EASY 20min (EASY) | d4 2027-01-04 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2027-01-04 AM RUN EASY 20min (EASY)
- Week 1 (BUILD): d0 2027-01-07 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW; seated-cable-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d0 2027-01-07 AM RUN LONG 45min (LONG) | d1 2027-01-08 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; hip-abduction-machine 1x10 RIR3 last logged | d1 2027-01-08 AM RUN EASY 20min (EASY) | d2 2027-01-09 AM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; seated-calf-raise-machine 1x10 RIR3 last logged; tibialis-raise 1x10 RIR3 BW | d2 2027-01-09 AM RUN EASY 20min (EASY) | d4 2027-01-11 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2027-01-11 AM RUN EASY 20min (EASY)
- Week 14 (TAPER): d0 2027-04-08 AM STRENGTH_UPPER 19min: push-up 1x14 RIR3 BW; db-row 1x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; kb-row 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d0 2027-04-08 AM RUN LONG 55min (LONG) | d1 2027-04-09 AM STRENGTH_LOWER 14min: goblet-squat 1x8 RIR4 last logged; db-rdl 1x8 RIR4 last logged | d1 2027-04-09 AM RUN EASY 15min (EASY) | d2 STRENGTH REST_BY_DESIGN | d2 2027-04-10 AM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d4 2027-04-12 AM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3')
- Week 15 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2027-04-15  RUN RACE 150min (RACE) | d1 STRENGTH REST_BY_DESIGN | d1 RUN REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d2 2027-04-17 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 STRENGTH REST_BY_DESIGN | d4 2027-04-19 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-18","weeks":16,"asOf":"2026-12-15","tz":0,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":280,"longestRunMinutes":81,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["back-squat 5x8 53KG TOTAL"],"equipment":["BANDS","KETTLEBELL","MACHINES","BARBELL","PULL_UP_BAR","DUMBBELLS","BENCH","BODYWEIGHT","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,4,5],"strengthDays":[0,1,3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":75,"strengthMinutes":28,"longRunDay":2,"longRunMinutes":118,"sameTurnConfirmed":true}}`

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

## R7D-G075

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-19","weeks":12,"asOf":"2026-12-16","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":324,"longestRunMinutes":83,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","MACHINES","BODYWEIGHT","KETTLEBELL","PULL_UP_BAR","RACK","BARBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[6],"runTurn":"PM","strengthTurn":"PM","runMinutes":65,"strengthMinutes":47,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d6 2026-12-25 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d6 2027-01-01 PM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":16,"asOf":"2026-11-20","tz":330,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":44,"longestRunMinutes":73,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x8 0KG BODYWEIGHT","barbell-rdl 4x12 99KG TOTAL","db-split-squat 5x10 19KG PER_HAND"],"equipment":["BANDS","DUMBBELLS","BODYWEIGHT","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,5,6],"strengthDays":[1,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":20,"strengthMinutes":55,"longRunDay":1,"longRunMinutes":44,"sameTurnConfirmed":true}}`

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":4,"asOf":"2026-11-16","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":6,"runMinutesPerWeek":330,"longestRunMinutes":19,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BARBELL","RACK","BENCH","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[1,2,3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":88,"strengthMinutes":36,"longRunDay":1,"longRunMinutes":148,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-18 PM RUN LONG 15min (LONG) | d1 2026-11-18 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-19 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-20 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-11-21 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-23 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-11-25 PM RUN LONG 15min (LONG) | d1 2026-11-25 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-26 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-27 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d4 2026-11-28 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-11-30 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-30","weeks":4,"asOf":"2026-12-29","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["back-squat 5x12 102KG TOTAL","hip-thrust-db 3x5 20KG PER_HAND","reverse-lunge 3x12 0KG BODYWEIGHT"],"equipment":["BANDS","RACK","MACHINES","BARBELL","KETTLEBELL","PULL_UP_BAR","BENCH","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3],"strengthDays":[2,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":41,"strengthMinutes":56,"longRunDay":3,"longRunMinutes":56,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-31 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2027-01-01 AM STRENGTH_LOWER 31min: goblet-squat 2x5 RIR3 establish; hip-thrust-db 3x5 RIR3 20kg PER_HAND; reverse-lunge 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2027-01-01 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2027-01-02 AM STRENGTH_UPPER 28min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; machine-chest-press 2x7 RIR3 establish; one-arm-db-row 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d3 2027-01-02 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2027-01-05 AM STRENGTH_FULL_B 33min: hip-thrust-db 3x5 RIR3 20kg PER_HAND; db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-07 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2027-01-08 AM STRENGTH_LOWER 34min: goblet-squat 3x5 RIR3 last logged; hip-thrust-db 3x5 RIR3 20kg PER_HAND; reverse-lunge 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d2 2027-01-08 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-09 AM STRENGTH_UPPER 34min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; machine-chest-press 2x7 RIR3 last logged; one-arm-db-row 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d3 2027-01-09 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-12 AM STRENGTH_FULL_B 39min: hip-thrust-db 3x5 RIR3 20kg PER_HAND; db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_10K, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":8,"asOf":"2026-12-26","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-17"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-02-17"},"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":130,"longestRunMinutes":52,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BANDS","PULL_UP_BAR","DUMBBELLS","BARBELL","KETTLEBELL","MACHINES","RACK","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2],"strengthDays":[0,1,3,4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":27,"strengthMinutes":26,"longRunDay":2,"longRunMinutes":115,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-28 AM RUN EASY 27min (EASY) | d0 2026-12-28 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-12-29 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d2 2026-12-30 AM RUN LONG 50min (LONG) | d3 2026-12-31 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2027-01-01 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-03 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2027-01-04 AM RUN EASY 27min (EASY) | d0 2027-01-04 PM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2027-01-05 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d2 2027-01-06 AM RUN LONG 50min (LONG) | d3 2027-01-07 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d4 2027-01-08 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2027-01-10 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW
- Week 6 (TAPER): d0 2027-02-08 AM RUN EASY 20min (EASY +strides) | d0 2027-02-08 PM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; leg-extension-machine 1x10 RIR3 last logged | d1 2027-02-09 PM STRENGTH_UPPER 20min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-lateral-raise 1x10 RIR3 last logged | d2 2027-02-10 AM RUN LONG 27min (LONG) | d3 2027-02-11 PM STRENGTH_LOWER_B 14min: kb-deadlift 1x8 RIR4 last logged; reverse-lunge 1x8 RIR4 BW | d4 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN
- Week 7 (RACE_WEEK): d0 2027-02-15 AM RUN EASY 15min (EASY) | d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 2027-02-17  RUN RACE 75min (RACE) | d3 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-27","weeks":8,"asOf":"2026-11-27","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-17"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-01-17"},"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":46,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x8 0KG BODYWEIGHT","glute-bridge 5x6 0KG BODYWEIGHT","reverse-lunge 2x10 0KG BODYWEIGHT"],"equipment":["MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[0,1,2,4,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":39,"longRunDay":3,"longRunMinutes":76,"sameTurnConfirmed":true}}`

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

## R7D-G081

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":16,"asOf":"2026-12-29","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,2,3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":89,"strengthMinutes":20,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-31 PM STRENGTH_LOWER 19min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x5 RIR3 BW | d2 2027-01-02 PM STRENGTH_UPPER 20min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW | d3 2027-01-03 PM STRENGTH_LOWER_B 19min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW | d4 2027-01-04 PM STRENGTH_UPPER_B 20min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-07 PM STRENGTH_LOWER 19min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x5 RIR3 BW | d2 2027-01-09 PM STRENGTH_UPPER 20min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW | d3 2027-01-10 PM STRENGTH_LOWER_B 19min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW | d4 2027-01-11 PM STRENGTH_UPPER_B 20min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-03","weeks":16,"asOf":"2027-01-03","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":112,"longestRunMinutes":37,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BODYWEIGHT","RACK","DUMBBELLS","BANDS","BENCH","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,5,6],"strengthDays":[0,1,2,3,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":28,"strengthMinutes":31,"longRunDay":2,"longRunMinutes":112,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-03 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2027-01-04 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d2 2027-01-05 PM RUN LONG 35min (LONG) | d2 2027-01-05 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2027-01-06 PM RUN EASY 15min (EASY) | d3 2027-01-06 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2027-01-07 PM RUN EASY 15min (EASY) | d4 2027-01-07 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-08 PM RUN EASY 15min (EASY) | d6 2027-01-09 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-10 AM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2027-01-11 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d2 2027-01-12 PM RUN LONG 35min (LONG) | d2 2027-01-12 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d3 2027-01-13 PM RUN EASY 15min (EASY) | d3 2027-01-13 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d4 2027-01-14 PM RUN EASY 15min (EASY) | d4 2027-01-14 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d5 2027-01-15 PM RUN EASY 15min (EASY) | d6 2027-01-16 PM RUN EASY 15min (EASY)

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

## R7D-G083

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":12,"asOf":"2026-12-04","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":236,"longestRunMinutes":43,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","PULL_UP_BAR","RACK","KETTLEBELL","BANDS","BENCH","BARBELL","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,6],"strengthDays":[3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":25,"strengthMinutes":48,"longRunDay":1,"longRunMinutes":97,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-05 PM RUN LONG 40min (LONG) | d2 2026-12-06 PM RUN EASY 25min (EASY) | d3 2026-12-07 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-08 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 1x10 RIR3 establish; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-10 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-10 PM RUN EASY 25min (EASY)
- Week 1 (DEVELOPMENT): d1 2026-12-12 PM RUN LONG 40min (LONG) | d2 2026-12-13 PM RUN EASY 25min (EASY) | d3 2026-12-14 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-15 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-17 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-17 PM RUN EASY 25min (EASY)

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

## R7D-G084

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":4,"asOf":"2026-12-05","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-23"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2026-12-23"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x8 0KG BODYWEIGHT","barbell-rdl 3x10 90KG TOTAL","db-step-up 5x12 11KG PER_HAND"],"equipment":["BODYWEIGHT","MACHINES","DUMBBELLS","BARBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,5],"strengthDays":[0,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":22,"strengthMinutes":30,"longRunDay":1,"longRunMinutes":119,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-08 PM STRENGTH_FULL_A 29min: box-squat-bodyweight 4x8 RIR3 BW; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish | d1 2026-12-09 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-11 PM STRENGTH_FULL_B 27min: barbell-rdl 3x10 RIR3 90kg TOTAL; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d5 2026-12-13 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-12-15 PM STRENGTH_FULL_A 29min: box-squat-bodyweight 3x8 RIR3 BW; db-floor-press 3x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-12-16 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-18 PM STRENGTH_FULL_B 16min: barbell-rdl 1x10 RIR4 90kg TOTAL; db-row 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged | d5 2026-12-20 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-12-15 PM STRENGTH_FULL_A 29min: box-squat-bodyweight 3x8 RIR3 BW; db-floor-press 3x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-12-16 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-18 PM STRENGTH_FULL_B 16min: barbell-rdl 1x10 RIR4 90kg TOTAL; db-row 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged | d5 2026-12-20 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 2 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 2026-12-23  RUN RACE 150min (RACE, completion) | d3 STRENGTH REST_BY_DESIGN | d5 2026-12-27 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":8,"asOf":"2026-11-21","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":175,"longestRunMinutes":143,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x5 22KG SINGLE_IMPLEMENT","glute-bridge 2x8 0KG BODYWEIGHT"],"equipment":["PULL_UP_BAR","BANDS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3],"strengthDays":[1,3,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":25,"strengthMinutes":67,"longRunDay":1,"longRunMinutes":35,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-11-23 AM RUN LONG 35min (LONG) | d1 2026-11-23 PM STRENGTH_LOWER 23min: kb-goblet-squat 2x5 RIR3 22kg SINGLE_IMPLEMENT; kb-deadlift 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-25 AM RUN EASY 25min (EASY) | d3 2026-11-25 PM STRENGTH_UPPER 22min: incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 establish; band-row 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-11-26 PM STRENGTH_LOWER_B 22min: kb-deadlift 2x8 RIR3 establish; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-11-27 PM STRENGTH_UPPER_B 20min: kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-28 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-11-30 AM RUN LONG 35min (LONG) | d1 2026-11-30 PM STRENGTH_LOWER 24min: kb-goblet-squat 2x5 RIR3 22kg SINGLE_IMPLEMENT; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-02 AM RUN EASY 25min (EASY) | d3 2026-12-02 PM STRENGTH_UPPER 22min: incline-push-up 2x10 RIR3 BW; kb-row 2x8 RIR3 last logged; band-row 1x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-03 PM STRENGTH_LOWER_B 23min: kb-deadlift 2x8 RIR3 last logged; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-04 PM STRENGTH_UPPER_B 21min: kb-row 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-05 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_HALF, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":4,"asOf":"2026-11-08","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-11-30"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2026-11-30"},"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x12 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":29,"strengthMinutes":41,"longRunDay":5,"longRunMinutes":49,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-09 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-11-13 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-14 PM RUN WALK 20min (WALK) | d6 2026-11-15 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-11-16 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-11-20 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-11-21 PM RUN WALK 20min (WALK) | d6 2026-11-22 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 2 (SPECIFIC): d0 2026-11-23 PM RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d4 2026-11-27 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-11-28 PM RUN WALK 20min (WALK) | d6 2026-11-29 PM RUN WALK 20min (WALK)
- Week 3 (RACE_WEEK): d0 2026-11-30  RUN RACE 150min (RACE, completion) | d4 2026-12-04 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-05 PM RUN WALK 20min (WALK) | d6 2026-12-06 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":4,"asOf":"2026-12-25","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-11"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-01-11"},"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5],"strengthDays":[6],"runTurn":"AM","strengthTurn":"PM","runMinutes":56,"strengthMinutes":59,"longRunDay":5,"longRunMinutes":127,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d5 2026-12-31 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2027-01-01 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW
- Week 1 (BUILD): d5 2027-01-07 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 STRENGTH REST_BY_DESIGN
- Week 1 (BUILD): d5 2027-01-07 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 STRENGTH REST_BY_DESIGN
- Week 2 (RACE_WEEK): d2 2027-01-11  RUN RACE 75min (RACE, completion) | d5 2027-01-14 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-30","weeks":12,"asOf":"2026-12-27","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-11"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-03-11"},"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":59,"longestRunMinutes":132,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BARBELL","PULL_UP_BAR","BANDS","RACK","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,5,6],"strengthDays":[0,3,4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":83,"strengthMinutes":70,"longRunDay":3,"longRunMinutes":136,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-30 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2027-01-01 PM RUN WALK 20min (WALK) | d3 2027-01-02 PM RUN LONG 20min (LONG) | d3 2027-01-02 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2027-01-03 PM RUN WALK 20min (WALK) | d4 2027-01-03 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-04 PM RUN EASY 15min (EASY) | d5 2027-01-04 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-05 PM RUN EASY 15min (EASY) | d6 2027-01-05 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2027-01-06 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2027-01-08 PM RUN WALK 20min (WALK) | d3 2027-01-09 PM RUN LONG 20min (LONG) | d3 2027-01-09 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2027-01-10 PM RUN WALK 20min (WALK) | d4 2027-01-10 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d5 2027-01-11 PM RUN EASY 15min (EASY) | d5 2027-01-11 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d6 2027-01-12 PM RUN EASY 15min (EASY) | d6 2027-01-12 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW
- Week 9 (TAPER): d0 2027-03-03 AM STRENGTH_LOWER 19min: goblet-squat 1x8 RIR3 last logged; glute-bridge 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d2 2027-03-05 PM RUN EASY 15min (EASY) | d3 2027-03-06 PM RUN EASY 15min (EASY) | d3 2027-03-06 AM STRENGTH_UPPER 14min: db-floor-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d4 2027-03-07 PM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d5 2027-03-08 PM RUN EASY 15min (EASY) | d5 STRENGTH REST_BY_DESIGN | d6 2027-03-09 PM RUN EASY 15min (EASY) | d6 STRENGTH REST_BY_DESIGN
- Week 10 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 2027-03-11  RUN RACE 150min (RACE, completion) | d2 RUN REST_BY_DESIGN | d3 2027-03-13 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 STRENGTH REST_BY_DESIGN | d4 2027-03-14 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 STRENGTH REST_BY_DESIGN | d5 2027-03-15 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d5 STRENGTH REST_BY_DESIGN | d6 2027-03-16 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":8,"asOf":"2026-12-14","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":26,"longestRunMinutes":34,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x12 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4,6],"strengthDays":[0],"runTurn":"PM","strengthTurn":"AM","runMinutes":41,"strengthMinutes":69,"longRunDay":3,"longRunMinutes":32,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-15 AM STRENGTH_FULL_A 38min: box-squat-bodyweight 5x12 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2026-12-18 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-19 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-21 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-22 AM STRENGTH_FULL_A 41min: box-squat-bodyweight 5x12 RIR3 BW; push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2026-12-25 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-26 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-28 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-14","weeks":12,"asOf":"2026-12-11","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":148,"longestRunMinutes":28,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[1,3,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":83,"strengthMinutes":39,"longRunDay":1,"longRunMinutes":75,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-15 AM RUN LONG 25min (LONG) | d1 2026-12-15 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-12-17 AM STRENGTH_FULL_B 31min: glute-bridge 2x5 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-19 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-22 AM STRENGTH_FULL_B 31min: glute-bridge 2x5 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-12-22 AM RUN LONG 25min (LONG) | d3 2026-12-24 AM STRENGTH_FULL_A 31min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-12-26 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":12,"asOf":"2026-11-30","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":77,"strengthMinutes":28,"longRunDay":4,"longRunMinutes":104,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-02 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-06 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-07 PM RUN WALK 20min (WALK) | d6 2026-12-08 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-09 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-13 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-14 PM RUN WALK 20min (WALK) | d6 2026-12-15 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_HALF · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-14","weeks":4,"asOf":"2026-12-12","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-28"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2026-12-28"},"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":110,"longestRunMinutes":87,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x8 0KG BODYWEIGHT","glute-bridge 2x12 0KG BODYWEIGHT"],"equipment":["BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":56,"strengthMinutes":54,"longRunDay":3,"longRunMinutes":149,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d1 2026-12-15 PM RUN EASY 15min (EASY) | d2 2026-12-16 PM RUN EASY 15min (EASY) | d3 2026-12-17 PM RUN LONG 45min (LONG) | d4 2026-12-18 PM RUN WALK 20min (WALK) | d5 2026-12-19 PM RUN EASY 15min (EASY) | d6 2026-12-20 PM RUN EASY 15min (EASY)
- Week 1 (SPECIFIC): d1 2026-12-22 PM RUN EASY 15min (EASY) | d2 2026-12-23 PM RUN EASY 15min (EASY) | d3 2026-12-24 PM RUN EASY 15min (EASY) | d4 2026-12-25 PM RUN WALK 20min (WALK) | d5 2026-12-26 PM RUN EASY 15min (EASY) | d6 2026-12-27 PM RUN SHAKEOUT 15min (SHAKEOUT)
- Week 1 (SPECIFIC): d1 2026-12-22 PM RUN EASY 15min (EASY) | d2 2026-12-23 PM RUN EASY 15min (EASY) | d3 2026-12-24 PM RUN EASY 15min (EASY) | d4 2026-12-25 PM RUN WALK 20min (WALK) | d5 2026-12-26 PM RUN EASY 15min (EASY) | d6 2026-12-27 PM RUN SHAKEOUT 15min (SHAKEOUT)
- Week 2 (RACE_WEEK): d0 2026-12-28  RUN RACE 150min (RACE, completion) | d1 RUN REST_BY_DESIGN | d2 2026-12-30 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d3 2026-12-31 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 2027-01-01 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d5 2027-01-02 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 2027-01-03 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":8,"asOf":"2026-12-07","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":33,"longestRunMinutes":68,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BODYWEIGHT","RACK","BARBELL","MACHINES","DUMBBELLS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,6],"strengthDays":[0,1,3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":25,"strengthMinutes":26,"longRunDay":3,"longRunMinutes":105,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-09 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-12-10 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW | d2 2026-12-11 PM RUN WALK 20min (WALK) | d3 2026-12-12 PM RUN LONG 15min (LONG) | d3 2026-12-12 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-12-13 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-15 PM RUN EASY 15min (EASY) | d6 2026-12-15 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-16 PM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged | d1 2026-12-17 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW | d2 2026-12-18 PM RUN WALK 20min (WALK) | d3 2026-12-19 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish | d3 2026-12-19 PM RUN LONG 15min (LONG) | d4 2026-12-20 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; tibialis-raise 1x10 RIR3 BW | d6 2026-12-22 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d6 2026-12-22 PM RUN EASY 15min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-11","weeks":16,"asOf":"2026-12-10","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":50,"longestRunMinutes":37,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3],"strengthDays":[3,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":46,"strengthMinutes":54,"longRunDay":0,"longRunMinutes":75,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-11 PM RUN LONG 20min (LONG) | d2 2026-12-13 PM RUN EASY 15min (EASY) | d3 2026-12-14 PM RUN EASY 15min (EASY) | d3 2026-12-14 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d5 2026-12-16 PM STRENGTH_FULL_B 31min: glute-bridge 2x5 RIR3 BW; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-18 PM RUN LONG 20min (LONG) | d2 2026-12-20 PM RUN EASY 15min (EASY) | d3 2026-12-21 PM STRENGTH_FULL_A 31min: leg-press 2x5 RIR3 establish; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-21 PM RUN EASY 15min (EASY) | d5 2026-12-23 PM STRENGTH_FULL_B 31min: glute-bridge 2x5 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-25","weeks":12,"asOf":"2026-11-22","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":275,"longestRunMinutes":52,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","MACHINES","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,5],"strengthDays":[1,3,4,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":42,"strengthMinutes":36,"longRunDay":1,"longRunMinutes":100,"sameTurnConfirmed":true}}`

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

## R7D-G096

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-25","weeks":8,"asOf":"2026-11-25","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-18"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-01-18"},"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES","KETTLEBELL","BENCH","RACK","BARBELL","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[0],"strengthDays":[0,1,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":39,"strengthMinutes":63,"longRunDay":0,"longRunMinutes":118,"sameTurnConfirmed":false}}`

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

## R7D-G097

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":16,"asOf":"2026-12-07","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":294,"longestRunMinutes":32,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x8 0KG BODYWEIGHT"],"equipment":["BANDS","KETTLEBELL","PULL_UP_BAR","BENCH","RACK","BARBELL","MACHINES","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,3,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":38,"strengthMinutes":72,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-12-08 AM STRENGTH_LOWER 31min: box-squat-bodyweight 5x8 RIR3 BW; kb-deadlift 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-09 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; machine-chest-press 1x10 RIR3 establish; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-12-10 AM STRENGTH_LOWER_B 22min: kb-deadlift 2x8 RIR3 establish; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-12 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-13 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-15 AM STRENGTH_LOWER 32min: box-squat-bodyweight 5x8 RIR3 BW; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-16 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2026-12-17 AM STRENGTH_LOWER_B 23min: kb-deadlift 2x8 RIR3 last logged; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-19 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2026-12-20 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":4,"asOf":"2026-11-22","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":96,"longestRunMinutes":90,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x6 0KG BODYWEIGHT","barbell-rdl 3x5 72KG TOTAL"],"equipment":["BARBELL","MACHINES","DUMBBELLS","PULL_UP_BAR","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,5],"strengthDays":[0,1,3,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":73,"strengthMinutes":34,"longRunDay":1,"longRunMinutes":93,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-23 AM RUN EASY 15min (EASY) | d0 2026-11-23 PM STRENGTH_UPPER 22min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish | d1 2026-11-24 AM RUN LONG 35min (LONG) | d1 2026-11-24 PM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d3 2026-11-26 AM RUN EASY 15min (EASY) | d3 2026-11-26 PM STRENGTH_LOWER 29min: box-squat-bodyweight 4x6 RIR3 BW; barbell-rdl 3x5 RIR3 72kg TOTAL; leg-extension-machine 2x10 RIR3 establish | d5 2026-11-28 AM RUN EASY 15min (EASY) | d6 2026-11-29 PM STRENGTH_LOWER_B 24min: barbell-rdl 3x5 RIR3 72kg TOTAL; db-split-squat 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-11-30 AM RUN EASY 15min (EASY) | d0 2026-11-30 PM STRENGTH_UPPER 27min: db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged | d1 2026-12-01 AM RUN LONG 35min (LONG) | d1 2026-12-01 PM STRENGTH_UPPER_B 27min: db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged | d3 2026-12-03 AM RUN EASY 15min (EASY) | d3 2026-12-03 PM STRENGTH_LOWER 30min: box-squat-bodyweight 4x8 RIR3 BW; barbell-rdl 3x7 RIR3 72kg TOTAL; leg-extension-machine 2x10 RIR3 last logged | d5 2026-12-05 AM RUN EASY 15min (EASY) | d6 2026-12-06 PM STRENGTH_LOWER_B 27min: barbell-rdl 3x7 RIR3 72kg TOTAL; db-split-squat 3x8 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":12,"asOf":"2026-11-20","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":42,"longestRunMinutes":105,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BARBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":24,"strengthMinutes":62,"longRunDay":2,"longRunMinutes":34,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-21 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d0 2026-11-21 AM RUN EASY 24min (EASY) | d1 2026-11-22 AM RUN WALK 20min (WALK) | d2 2026-11-23 AM RUN LONG 15min (LONG) | d3 2026-11-24 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-24 AM RUN WALK 20min (WALK) | d4 2026-11-25 AM RUN WALK 20min (WALK) | d5 2026-11-26 AM RUN WALK 20min (WALK) | d6 2026-11-27 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-28 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d0 2026-11-28 AM RUN EASY 24min (EASY) | d1 2026-11-29 AM RUN WALK 20min (WALK) | d2 2026-11-30 AM RUN LONG 15min (LONG) | d3 2026-12-01 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-01 AM RUN WALK 20min (WALK) | d4 2026-12-02 AM RUN WALK 20min (WALK) | d5 2026-12-03 AM RUN WALK 20min (WALK) | d6 2026-12-04 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; side-lying-hip-abduction 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":16,"asOf":"2026-12-28","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":23,"longestRunMinutes":50,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","MACHINES","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[2,3,4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":83,"strengthMinutes":49,"longRunDay":1,"longRunMinutes":71,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-30 AM RUN LONG 15min (LONG) | d2 2026-12-31 AM RUN WALK 20min (WALK) | d2 2026-12-31 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2027-01-01 AM RUN WALK 20min (WALK) | d3 2027-01-01 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2027-01-02 AM RUN WALK 20min (WALK) | d4 2027-01-02 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-03 AM RUN WALK 20min (WALK) | d6 2027-01-04 AM RUN WALK 20min (WALK) | d6 2027-01-04 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-06 AM RUN LONG 15min (LONG) | d2 2027-01-07 AM RUN WALK 20min (WALK) | d2 2027-01-07 PM STRENGTH_FULL_A 27min: leg-press 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-08 AM RUN WALK 20min (WALK) | d3 2027-01-08 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2027-01-09 AM RUN WALK 20min (WALK) | d4 2027-01-09 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; hip-abduction-machine 1x10 RIR3 establish | d5 2027-01-10 AM RUN WALK 20min (WALK) | d6 2027-01-11 AM RUN WALK 20min (WALK) | d6 2027-01-11 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":16,"asOf":"2026-12-31","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":6,"runMinutesPerWeek":174,"longestRunMinutes":49,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","PULL_UP_BAR","BANDS","KETTLEBELL","DUMBBELLS","MACHINES","RACK","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":66,"strengthMinutes":67,"longRunDay":0,"longRunMinutes":100,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-02 PM RUN LONG 45min (LONG) | d4 2027-01-06 PM RUN EASY 49min (EASY) | d6 2027-01-08 PM RUN EASY 49min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-09 PM RUN LONG 50min (LONG) | d4 2027-01-13 PM RUN EASY 49min (EASY) | d6 2027-01-15 PM RUN EASY 49min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-19","weeks":16,"asOf":"2026-11-16","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["goblet-squat 2x5 20KG PER_HAND","db-rdl 3x5 27KG PER_HAND","db-step-up 4x5 28KG PER_HAND"],"equipment":["BANDS","RACK","DUMBBELLS","BENCH","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[0,2,3,4,5,6],"strengthDays":[1,2,3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":44,"strengthMinutes":35,"longRunDay":3,"longRunMinutes":32,"sameTurnConfirmed":true}}`

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

## R7D-G103

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":12,"asOf":"2026-11-15","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","RACK","BENCH","KETTLEBELL","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0],"runTurn":"PM","strengthTurn":"AM","runMinutes":46,"strengthMinutes":29,"longRunDay":3,"longRunMinutes":147,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-16 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-11-16 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-17 PM RUN WALK 20min (WALK) | d2 2026-11-18 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-19 PM RUN WALK 20min (WALK) | d4 2026-11-20 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-11-22 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-11-23 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-11-23 AM STRENGTH_FULL_A 24min: kb-goblet-squat 2x10 RIR3 establish; incline-push-up 2x10 RIR3 BW; kb-row 2x10 RIR3 establish | d1 2026-11-24 PM RUN WALK 20min (WALK) | d2 2026-11-25 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-26 PM RUN WALK 20min (WALK) | d4 2026-11-27 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-11-29 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-16","weeks":8,"asOf":"2026-12-13","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x6 0KG BODYWEIGHT","hip-thrust-db 5x8 6KG PER_HAND"],"equipment":["DUMBBELLS","BARBELL","PULL_UP_BAR","BANDS","KETTLEBELL","BENCH","BODYWEIGHT","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,6],"strengthDays":[0,1,2,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":58,"strengthMinutes":37,"longRunDay":3,"longRunMinutes":44,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-16 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-16 PM STRENGTH_LOWER 33min: box-squat-bodyweight 3x6 RIR3 BW; hip-thrust-db 5x8 RIR3 6kg PER_HAND; db-split-squat 1x10 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-17 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 1x10 RIR3 establish; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-12-18 PM STRENGTH_LOWER_B 30min: hip-thrust-db 5x8 RIR3 6kg PER_HAND; db-split-squat 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-19 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-21 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-22 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-22 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-23 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-23 PM STRENGTH_LOWER 33min: box-squat-bodyweight 3x6 RIR3 BW; hip-thrust-db 5x8 RIR3 6kg PER_HAND; db-split-squat 1x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-24 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2026-12-25 PM STRENGTH_LOWER_B 30min: hip-thrust-db 5x8 RIR3 6kg PER_HAND; db-split-squat 2x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-26 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-28 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2026-12-29 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-29 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":8,"asOf":"2026-11-14","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":111,"longestRunMinutes":25,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3],"strengthDays":[0,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":71,"strengthMinutes":38,"longRunDay":2,"longRunMinutes":64,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-16 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-18 AM RUN LONG 25min (LONG) | d3 2026-11-19 AM RUN EASY 25min (EASY) | d5 2026-11-21 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-23 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-25 AM RUN LONG 25min (LONG) | d3 2026-11-26 AM RUN EASY 25min (EASY) | d5 2026-11-28 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":12,"asOf":"2026-12-12","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-21"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-02-21"},"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":160,"longestRunMinutes":50,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["back-squat 4x12 115KG TOTAL"],"equipment":["DUMBBELLS","KETTLEBELL","BODYWEIGHT","BANDS","MACHINES","PULL_UP_BAR","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":82,"strengthMinutes":39,"longRunDay":6,"longRunMinutes":55,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d4 2026-12-17 AM RUN EASY 50min (EASY) | d5 2026-12-18 AM RUN EASY 50min (EASY) | d6 2026-12-19 AM RUN LONG 50min (LONG)
- Week 1 (BUILD): d4 2026-12-24 AM RUN EASY 50min (EASY) | d5 2026-12-25 AM RUN EASY 50min (EASY) | d6 2026-12-26 AM RUN LONG 55min (LONG)
- Week 9 (TAPER): d4 2027-02-18 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d5 2027-02-19 AM RUN EASY 25min (EASY) | d6 2027-02-20 AM RUN SHAKEOUT 15min (SHAKEOUT +strides)
- Week 10 (RACE_WEEK): d0 2027-02-21  RUN RACE 75min (RACE) | d4 2027-02-25 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d5 2027-02-26 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 2027-02-27 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":8,"asOf":"2026-12-27","tz":330,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","DUMBBELLS","PULL_UP_BAR","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,5],"strengthDays":[0,1,2],"runTurn":"PM","strengthTurn":"PM","runMinutes":78,"strengthMinutes":36,"longRunDay":2,"longRunMinutes":55,"sameTurnConfirmed":false}}`

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

## R7D-G108

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":12,"asOf":"2026-12-04","tz":0,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-24"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-02-24"},"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,4,5,6],"strengthDays":[0,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":23,"strengthMinutes":56,"longRunDay":3,"longRunMinutes":134,"sameTurnConfirmed":false}}`

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

## R7D-G109

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":12,"asOf":"2026-12-10","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":75,"longestRunMinutes":65,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 3x12 86KG TOTAL"],"equipment":["MACHINES","PULL_UP_BAR","BODYWEIGHT","DUMBBELLS","BANDS","KETTLEBELL","BARBELL","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":54,"strengthMinutes":43,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2026-12-15 PM STRENGTH_LOWER 27min: leg-press 3x10 RIR3 86kg TOTAL; kb-deadlift 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish | d4 2026-12-17 PM STRENGTH_UPPER 24min: incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-floor-press 1x10 RIR3 establish; db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2026-12-18 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2026-12-22 PM STRENGTH_LOWER 26min: leg-press 3x6 RIR3 88.5kg TOTAL; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; hip-abduction-machine 1x10 RIR3 last logged | d4 2026-12-24 PM STRENGTH_UPPER 24min: incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW; db-floor-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2026-12-25 PM STRENGTH_FULL_B 28min: kb-deadlift 2x8 RIR3 last logged; band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":12,"asOf":"2026-12-19","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":69,"longestRunMinutes":48,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","RACK","BENCH","BARBELL","DUMBBELLS","KETTLEBELL","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,4],"strengthDays":[0,1,3,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":44,"strengthMinutes":36,"longRunDay":1,"longRunMinutes":121,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-21 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-22 AM RUN LONG 20min (LONG) | d1 2026-12-22 PM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x10 RIR3 BW; db-biceps-curl 2x8 RIR3 establish | d2 2026-12-23 AM RUN EASY 15min (EASY) | d3 2026-12-24 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-12-25 AM RUN EASY 15min (EASY) | d5 2026-12-26 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-27 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-28 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d1 2026-12-29 AM RUN LONG 20min (LONG) | d1 2026-12-29 PM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-12-30 AM RUN EASY 15min (EASY) | d3 2026-12-31 PM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x10 RIR3 BW; db-biceps-curl 2x8 RIR3 last logged | d4 2027-01-01 AM RUN EASY 15min (EASY) | d5 2027-01-02 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2027-01-03 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":16,"asOf":"2026-12-03","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":123,"longestRunMinutes":30,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,3,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":90,"strengthMinutes":47,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-12-07 AM STRENGTH_LOWER 27min: box-squat-bodyweight 3x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-08 AM STRENGTH_UPPER 19min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-09 AM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-10 AM STRENGTH_UPPER_B 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-11 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-14 AM STRENGTH_LOWER 28min: box-squat-bodyweight 3x12 RIR3 BW; glute-bridge 2x12 RIR3 BW; reverse-lunge 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-12-15 AM STRENGTH_UPPER 20min: push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; incline-push-up 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2026-12-16 AM STRENGTH_LOWER_B 24min: glute-bridge 2x12 RIR3 BW; reverse-lunge 2x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d4 2026-12-17 AM STRENGTH_UPPER_B 18min: push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d5 2026-12-18 AM STRENGTH_CORE 14min: dead-bug 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; front-plank 1x14 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":12,"asOf":"2026-11-10","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-27"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-01-27"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":159,"longestRunMinutes":134,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":50,"strengthMinutes":54,"longRunDay":1,"longRunMinutes":79,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d1 2026-11-11 AM RUN LONG 60min (LONG) | d2 2026-11-12 AM RUN EASY 15min (EASY) | d3 2026-11-13 AM RUN EASY 15min (EASY) | d4 2026-11-14 AM RUN EASY 15min (EASY) | d5 2026-11-15 AM RUN EASY 15min (EASY) | d6 2026-11-16 AM RUN EASY 15min (EASY)
- Week 1 (BUILD): d1 2026-11-18 AM RUN LONG 60min (LONG) | d2 2026-11-19 AM RUN EASY 15min (EASY) | d3 2026-11-20 AM RUN EASY 15min (EASY) | d4 2026-11-21 AM RUN EASY 15min (EASY) | d5 2026-11-22 AM RUN EASY 15min (EASY) | d6 2026-11-23 AM RUN EASY 15min (EASY)
- Week 10 (TAPER): d1 2027-01-20 AM RUN LONG 50min (LONG) | d2 2027-01-21 AM RUN EASY 15min (EASY) | d3 2027-01-22 AM RUN EASY 15min (EASY) | d4 2027-01-23 AM RUN EASY 15min (EASY) | d5 2027-01-24 AM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d6 2027-01-25 AM RUN EASY 15min (EASY)
- Week 11 (RACE_WEEK): d1 2027-01-27  RUN RACE 150min (RACE) | d2 RUN REST_BY_DESIGN | d3 2027-01-29 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 2027-01-30 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 2027-01-31 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 2027-02-01 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":16,"asOf":"2026-12-11","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":57,"longestRunMinutes":22,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["leg-press 2x6 64KG TOTAL"],"equipment":["MACHINES","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5,6],"strengthDays":[5],"runTurn":"AM","strengthTurn":"AM","runMinutes":80,"strengthMinutes":43,"longRunDay":6,"longRunMinutes":133,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d5 2026-12-17 AM STRENGTH_FULL_A 30min: leg-press 2x6 RIR3 64kg TOTAL; machine-chest-press 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-17 AM RUN EASY 22min (EASY) | d6 2026-12-18 AM RUN LONG 20min (LONG)
- Week 1 (DEVELOPMENT): d5 2026-12-24 AM STRENGTH_FULL_A 37min: leg-press 2x6 RIR3 64kg TOTAL; machine-chest-press 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d5 2026-12-24 AM RUN EASY 22min (EASY) | d6 2026-12-25 AM RUN LONG 25min (LONG)

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-29","weeks":12,"asOf":"2026-11-27","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":42,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,4],"strengthDays":[3],"runTurn":"PM","strengthTurn":"AM","runMinutes":65,"strengthMinutes":58,"longRunDay":4,"longRunMinutes":33,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-11-30 PM RUN EASY 42min (EASY) | d3 2026-12-02 AM STRENGTH_FULL_A 32min: box-squat-bodyweight 3x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2026-12-03 PM RUN LONG 33min (LONG)
- Week 1 (DEVELOPMENT): d1 2026-12-07 PM RUN EASY 42min (EASY) | d3 2026-12-09 AM STRENGTH_FULL_A 36min: box-squat-bodyweight 3x10 RIR3 BW; incline-push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d4 2026-12-10 PM RUN LONG 33min (LONG)

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":12,"asOf":"2026-12-25","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-09"}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2027-03-09"},"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 3x8 30KG TOTAL","db-rdl 5x6 28KG TOTAL"],"equipment":["RACK","BARBELL","KETTLEBELL","BENCH","MACHINES","DUMBBELLS","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3,5],"strengthDays":[0,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":52,"strengthMinutes":55,"longRunDay":2,"longRunMinutes":120,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-27 AM RUN EASY 15min (EASY) | d0 2026-12-27 PM STRENGTH_FULL_A 30min: leg-press 3x8 RIR3 30kg TOTAL; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-12-29 AM RUN EASY 15min (EASY) | d3 2026-12-30 AM RUN WALK 20min (WALK) | d5 2027-01-01 AM RUN EASY 15min (EASY) | d6 2027-01-02 PM STRENGTH_FULL_B 34min: db-rdl 5x6 RIR3 28kg TOTAL; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d0 2027-01-03 AM RUN EASY 20min (EASY) | d0 2027-01-03 PM STRENGTH_FULL_A 30min: leg-press 3x8 RIR3 30kg TOTAL; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2027-01-05 AM RUN EASY 20min (EASY) | d3 2027-01-06 AM RUN WALK 20min (WALK) | d5 2027-01-08 AM RUN EASY 20min (EASY) | d6 2027-01-09 PM STRENGTH_FULL_B 34min: db-rdl 5x6 RIR3 28kg TOTAL; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 9 (TAPER): d0 2027-02-28 AM RUN EASY 25min (EASY +strides) | d0 2027-02-28 PM STRENGTH_FULL_A 20min: leg-press 1x8 RIR3 30kg TOTAL; db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d2 2027-03-02 AM RUN LONG 30min (LONG) | d3 2027-03-03 AM RUN EASY 15min (EASY) | d5 2027-03-05 AM RUN EASY 15min (EASY) | d6 2027-03-06 PM STRENGTH_FULL_B 16min: db-rdl 1x6 RIR4 28kg TOTAL; db-row 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged
- Week 10 (RACE_WEEK): d0 2027-03-07 AM RUN EASY 15min (EASY) | d0 STRENGTH REST_BY_DESIGN | d2 2027-03-09  RUN RACE 75min (RACE, completion) | d3 RUN REST_BY_DESIGN | d5 2027-03-12 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

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

## R7D-G116

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-01","weeks":16,"asOf":"2026-12-30","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":23,"longestRunMinutes":49,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x10 10KG SINGLE_IMPLEMENT","glute-bridge 5x12 0KG BODYWEIGHT","db-split-squat 3x12 42KG TOTAL"],"equipment":["RACK","BARBELL","DUMBBELLS","BANDS","BODYWEIGHT","MACHINES","BENCH","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,5,6],"strengthDays":[1,2,3,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":63,"strengthMinutes":23,"longRunDay":3,"longRunMinutes":110,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-01 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-02 AM STRENGTH_LOWER 22min: kb-goblet-squat 3x10 RIR3 10kg SINGLE_IMPLEMENT; glute-bridge 2x12 RIR3 BW | d2 2027-01-03 AM STRENGTH_UPPER 21min: db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 1x12 RIR3 establish | d3 2027-01-04 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2027-01-04 AM STRENGTH_LOWER_B 22min: glute-bridge 3x12 RIR3 BW; db-split-squat 2x10 RIR3 establish | d4 2027-01-05 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d5 2027-01-06 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2027-01-07 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2027-01-08 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-09 AM STRENGTH_LOWER 22min: kb-goblet-squat 3x10 RIR3 10kg SINGLE_IMPLEMENT; glute-bridge 2x12 RIR3 BW | d2 2027-01-10 AM STRENGTH_UPPER 21min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged | d3 2027-01-11 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-11 AM STRENGTH_LOWER_B 22min: glute-bridge 3x12 RIR3 BW; db-split-squat 2x10 RIR3 last logged | d4 2027-01-12 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2027-01-13 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-14 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":12,"asOf":"2026-12-13","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":196,"longestRunMinutes":68,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1],"strengthDays":[0,2,4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":76,"strengthMinutes":37,"longRunDay":0,"longRunMinutes":69,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-15 PM RUN LONG 65min (LONG) | d0 2026-12-15 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-16 PM RUN EASY 68min (EASY) | d2 2026-12-17 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-19 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-20 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-21 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-22 PM RUN LONG 65min (LONG) | d0 2026-12-22 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-23 PM RUN EASY 68min (EASY) | d2 2026-12-24 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-26 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d5 2026-12-27 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-12-28 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":4,"asOf":"2027-01-04","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":6,"runMinutesPerWeek":324,"longestRunMinutes":90,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","RACK","KETTLEBELL","PULL_UP_BAR","BANDS","BARBELL","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":64,"strengthMinutes":24,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2027-01-08 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d5 2027-01-11 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x10 RIR3 BW | d6 2027-01-12 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2027-01-15 AM STRENGTH_FULL_A 24min: kb-goblet-squat 2x10 RIR3 establish; incline-push-up 2x10 RIR3 BW; kb-row 2x8 RIR3 last logged | d5 2027-01-18 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW | d6 2027-01-19 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":16,"asOf":"2026-12-02","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":83,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x6 0KG BODYWEIGHT","glute-bridge 2x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[3],"runTurn":"AM","strengthTurn":"PM","runMinutes":21,"strengthMinutes":35,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d3 2026-12-07 PM STRENGTH_FULL_A 31min: box-squat-bodyweight 3x6 RIR3 BW; push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d3 2026-12-14 PM STRENGTH_FULL_A 35min: box-squat-bodyweight 3x6 RIR3 BW; push-up 3x7 RIR3 BW; prone-ytw-raise 2x9 RIR3 BW; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":8,"asOf":"2026-12-06","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":105,"longestRunMinutes":36,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x8 0KG BODYWEIGHT","glute-bridge 2x5 0KG BODYWEIGHT","reverse-lunge 4x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":5,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,2,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":81,"strengthMinutes":57,"longRunDay":5,"longRunMinutes":54,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-07 AM RUN EASY 15min (EASY) | d0 2026-12-07 PM STRENGTH_LOWER 25min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-08 AM RUN WALK 20min (WALK) | d2 2026-12-09 AM RUN EASY 15min (EASY) | d2 2026-12-09 PM STRENGTH_UPPER 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-10 AM RUN WALK 20min (WALK) | d4 2026-12-11 AM RUN EASY 15min (EASY) | d5 2026-12-12 AM RUN WALK 20min (WALK) | d5 2026-12-12 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-14 AM RUN EASY 20min (EASY) | d0 2026-12-14 PM STRENGTH_LOWER 25min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-15 AM RUN WALK 20min (WALK) | d2 2026-12-16 AM RUN EASY 20min (EASY) | d2 2026-12-16 PM STRENGTH_UPPER 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-17 AM RUN WALK 20min (WALK) | d4 2026-12-18 AM RUN EASY 20min (EASY) | d5 2026-12-19 AM RUN WALK 20min (WALK) | d5 2026-12-19 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":4,"asOf":"2026-11-08","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["goblet-squat 2x12 19KG PER_HAND","barbell-rdl 2x8 71KG TOTAL","db-step-up 2x8 54KG TOTAL"],"equipment":["BODYWEIGHT","DUMBBELLS","BARBELL","RACK","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3,4,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":75,"strengthMinutes":41,"longRunDay":6,"longRunMinutes":136,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-11 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-13 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-14 PM RUN WALK 20min (WALK) | d4 2026-11-15 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-16 PM RUN WALK 20min (WALK) | d6 2026-11-17 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-11-18 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-11-20 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-21 PM RUN WALK 20min (WALK) | d4 2026-11-22 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-11-23 PM RUN WALK 20min (WALK) | d6 2026-11-24 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-01","weeks":8,"asOf":"2026-11-28","tz":0,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":102,"longestRunMinutes":60,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[1],"runTurn":"AM","strengthTurn":"PM","runMinutes":51,"strengthMinutes":37,"longRunDay":0,"longRunMinutes":98,"sameTurnConfirmed":true}}`

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":16,"asOf":"2026-12-27","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-16"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-04-16"},"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":108,"longestRunMinutes":55,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":48,"strengthMinutes":74,"longRunDay":2,"longRunMinutes":88,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d2 2026-12-31 PM RUN LONG 55min (LONG)
- Week 1 (BUILD): d2 2027-01-07 PM RUN LONG 60min (LONG)
- Week 14 (TAPER): d2 2027-04-08 PM RUN LONG 48min (LONG)
- Week 15 (RACE_WEEK): d2 2027-04-15 PM RUN SHAKEOUT 15min (SHAKEOUT) | d3 2027-04-16  RUN RACE 150min (RACE)

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-26","weeks":4,"asOf":"2026-11-23","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-22"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2026-12-22"},"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":354,"longestRunMinutes":57,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","RACK","KETTLEBELL","BENCH","BARBELL","DUMBBELLS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,5,6],"strengthDays":[0,2,3,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":71,"strengthMinutes":35,"longRunDay":6,"longRunMinutes":51,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-26 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish | d2 2026-11-28 PM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 1x10 RIR3 BW; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-11-29 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; seated-calf-raise-db 1x10 RIR3 establish; tibialis-raise 1x10 RIR3 BW | d4 2026-11-30 PM RUN EASY 57min (EASY) | d5 2026-12-01 PM RUN EASY 57min (EASY) | d6 2026-12-02 PM RUN LONG 51min (LONG) | d6 2026-12-02 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-03 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; hip-abduction-machine 1x10 RIR3 last logged | d2 2026-12-05 PM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d3 2026-12-06 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; seated-calf-raise-db 1x10 RIR3 last logged; tibialis-raise 1x10 RIR3 BW | d4 2026-12-07 PM RUN EASY 57min (EASY) | d5 2026-12-08 PM RUN EASY 57min (EASY) | d6 2026-12-09 PM RUN LONG 51min (LONG) | d6 2026-12-09 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 2 (SPECIFIC): d0 2026-12-10 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; hip-abduction-machine 1x10 RIR3 last logged | d2 2026-12-12 PM STRENGTH_UPPER 24min: push-up 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2026-12-13 PM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; seated-calf-raise-db 1x10 RIR3 last logged; tibialis-raise 1x12 RIR3 BW | d4 2026-12-14 PM RUN EASY 57min (EASY) | d5 2026-12-15 PM RUN EASY 57min (EASY) | d6 2026-12-16 PM RUN EASY 30min (EASY) | d6 2026-12-16 PM STRENGTH_UPPER_B 14min: db-row 1x8 RIR4 last logged; push-up 1x10 RIR4 BW
- Week 3 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 2026-12-21 PM RUN SHAKEOUT 15min (SHAKEOUT) | d5 2026-12-22  RUN RACE 75min (RACE) | d6 RUN REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":16,"asOf":"2026-11-19","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":172,"longestRunMinutes":71,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":63,"strengthMinutes":40,"longRunDay":0,"longRunMinutes":55,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-20 PM RUN LONG 55min (LONG) | d1 2026-11-21 PM RUN EASY 55min (EASY) | d2 2026-11-22 PM RUN EASY 55min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-27 PM RUN LONG 55min (LONG) | d1 2026-11-28 PM RUN EASY 55min (EASY) | d2 2026-11-29 PM RUN EASY 55min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":12,"asOf":"2026-11-09","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":27,"strengthMinutes":65,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-11 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d5 2026-11-15 AM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; scapular-pull-up 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-11-18 AM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; scapular-pull-up 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-22 AM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; scapular-pull-up 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-16","weeks":16,"asOf":"2026-12-16","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":15,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,3,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":57,"strengthMinutes":49,"sameTurnConfirmed":true}}`

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

## R7D-G128

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":12,"asOf":"2026-11-15","tz":0,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BARBELL","RACK","DUMBBELLS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,5,6],"strengthDays":[3],"runTurn":"AM","strengthTurn":"PM","runMinutes":87,"strengthMinutes":57,"longRunDay":2,"longRunMinutes":97,"sameTurnConfirmed":true}}`

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

## R7D-G129

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":8,"asOf":"2026-12-01","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","DUMBBELLS","BODYWEIGHT","RACK","PULL_UP_BAR","BARBELL","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,6],"strengthDays":[0,1,2,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":47,"strengthMinutes":38,"longRunDay":6,"longRunMinutes":114,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-04 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-04 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-05 PM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x10 RIR3 BW; db-biceps-curl 2x8 RIR3 establish | d2 2026-12-06 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-07 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-08 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-10 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-10 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-11 PM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d0 2026-12-11 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-12 PM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x10 RIR3 BW; db-biceps-curl 2x8 RIR3 last logged | d2 2026-12-13 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d3 2026-12-14 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-15 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2026-12-17 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2026-12-17 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":8,"asOf":"2026-12-12","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-04"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-02-04"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BANDS","BARBELL","BENCH","MACHINES","DUMBBELLS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[0,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":49,"strengthMinutes":31,"longRunDay":1,"longRunMinutes":150,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-12 AM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish | d1 2026-12-13 PM RUN EASY 15min (EASY) | d4 2026-12-16 AM STRENGTH_UPPER 20min: push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW | d5 2026-12-17 AM STRENGTH_FULL_B 24min: db-rdl 2x8 RIR3 establish; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW
- Week 1 (BUILD): d0 2026-12-19 AM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged | d1 2026-12-20 PM RUN EASY 20min (EASY) | d4 2026-12-23 AM STRENGTH_UPPER 20min: push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW | d5 2026-12-24 AM STRENGTH_FULL_B 24min: db-rdl 2x8 RIR3 last logged; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW
- Week 6 (TAPER): d0 2027-01-23 AM STRENGTH_LOWER 15min: goblet-squat 1x8 RIR3 last logged; db-rdl 1x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged | d1 2027-01-24 PM RUN LONG 25min (LONG) | d4 2027-01-27 AM STRENGTH_UPPER 16min: push-up 1x12 RIR3 BW; band-row 1x10 RIR3 BW; incline-push-up 1x14 RIR3 BW | d5 2027-01-28 AM STRENGTH_FULL_B 16min: db-rdl 1x8 RIR3 last logged; band-row 1x10 RIR3 BW; push-up 1x12 RIR3 BW
- Week 7 (RACE_WEEK): d0 2027-01-30 AM STRENGTH_LOWER 14min: goblet-squat 1x8 RIR4 last logged; db-rdl 1x8 RIR4 last logged | d1 2027-01-31 PM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d5 2027-02-04  RUN RACE 75min (RACE, completion)

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

## R7D-G131

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-14","weeks":8,"asOf":"2026-12-11","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","PULL_UP_BAR","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[4],"runTurn":"PM","strengthTurn":"PM","runMinutes":22,"strengthMinutes":53,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d4 2026-12-18 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d4 2026-12-25 PM STRENGTH_FULL_A 30min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-22","weeks":8,"asOf":"2026-12-19","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-06"}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2027-02-06"},"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":93,"longestRunMinutes":140,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,6],"strengthDays":[3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":72,"strengthMinutes":43,"longRunDay":0,"longRunMinutes":31,"sameTurnConfirmed":true}}`

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

## R7D-G133

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-26","weeks":12,"asOf":"2026-11-25","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x8 0KG BODYWEIGHT","glute-bridge 3x10 0KG BODYWEIGHT","reverse-lunge 3x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":8,"reasonCategory":"TRAVEL"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":80,"strengthMinutes":43,"longRunDay":6,"longRunMinutes":150,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-26 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-02 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-03 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-09 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":8,"asOf":"2026-12-19","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-13"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-02-13"},"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":88,"longestRunMinutes":16,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x10 0KG BODYWEIGHT"],"equipment":["KETTLEBELL","BARBELL","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,4,5],"strengthDays":[6],"runTurn":"PM","strengthTurn":"PM","runMinutes":45,"strengthMinutes":56,"longRunDay":5,"longRunMinutes":143,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d0 2026-12-20 PM RUN EASY 16min (EASY) | d3 2026-12-23 PM RUN EASY 16min (EASY) | d4 2026-12-24 PM RUN EASY 16min (EASY) | d5 2026-12-25 PM RUN LONG 15min (LONG) | d6 2026-12-26 PM STRENGTH_FULL_A 34min: box-squat-bodyweight 3x10 RIR3 BW; machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-27 PM RUN EASY 16min (EASY) | d3 2026-12-30 PM RUN EASY 16min (EASY) | d4 2026-12-31 PM RUN EASY 16min (EASY) | d5 2027-01-01 PM RUN LONG 20min (LONG) | d6 2027-01-02 PM STRENGTH_FULL_A 40min: box-squat-bodyweight 3x12 RIR3 BW; machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW
- Week 6 (TAPER): d0 2027-01-31 PM RUN EASY 15min (EASY +strides) | d3 2027-02-03 PM RUN QUALITY 25min (THRESHOLD 2x4'/2') | d4 2027-02-04 PM RUN EASY 15min (EASY +strides) | d5 2027-02-05 PM RUN LONG 25min (LONG) | d6 2027-02-06 PM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x10 RIR3 BW; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW
- Week 7 (RACE_WEEK): d0 2027-02-07 PM RUN EASY 15min (EASY) | d3 2027-02-10 PM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d4 2027-02-11 PM RUN EASY 15min (EASY) | d5 2027-02-12 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d6 STRENGTH REST_BY_DESIGN | d6 2027-02-13  RUN RACE 75min (RACE)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":16,"asOf":"2026-11-10","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":240,"longestRunMinutes":53,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x12 0KG BODYWEIGHT","barbell-rdl 3x12 38KG TOTAL","reverse-lunge 4x10 0KG BODYWEIGHT"],"equipment":["KETTLEBELL","BENCH","RACK","PULL_UP_BAR","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3],"strengthDays":[0,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":44,"strengthMinutes":56,"longRunDay":3,"longRunMinutes":128,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-10 AM RUN EASY 44min (EASY) | d0 2026-11-10 AM STRENGTH_LOWER 38min: box-squat-bodyweight 5x12 RIR3 BW; kb-deadlift 2x8 RIR3 establish; reverse-lunge 4x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-13 AM RUN LONG 50min (LONG) | d3 2026-11-13 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 establish; incline-push-up 1x10 RIR3 BW; inverted-row 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-16 AM STRENGTH_FULL_B 33min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; reverse-lunge 4x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-17 AM RUN EASY 44min (EASY) | d0 2026-11-17 AM STRENGTH_LOWER 39min: box-squat-bodyweight 5x12 RIR3 BW; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 4x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-20 AM RUN LONG 55min (LONG) | d3 2026-11-20 AM STRENGTH_UPPER 24min: push-up 2x10 RIR3 BW; kb-row 2x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW; inverted-row 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-11-23 AM STRENGTH_FULL_B 33min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; push-up 2x10 RIR3 BW; reverse-lunge 4x10 RIR3 BW; dead-bug 1x12 RIR3 BW

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

## R7D-G136

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-03","weeks":8,"asOf":"2027-01-01","tz":-180,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":98,"longestRunMinutes":76,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","RACK","MACHINES","BANDS","BENCH","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,5,6],"strengthDays":[6],"runTurn":"PM","strengthTurn":"PM","runMinutes":90,"strengthMinutes":63,"longRunDay":2,"longRunMinutes":92,"sameTurnConfirmed":false}}`

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

## R7D-G137

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-24","weeks":16,"asOf":"2026-11-24","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":114,"longestRunMinutes":31,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x6 0KG BODYWEIGHT","glute-bridge 4x5 0KG BODYWEIGHT"],"equipment":["BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[2,3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":61,"strengthMinutes":33,"longRunDay":5,"longRunMinutes":128,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-24 PM RUN EASY 15min (EASY) | d1 2026-11-25 PM RUN EASY 15min (EASY) | d2 2026-11-26 PM RUN EASY 15min (EASY) | d2 2026-11-26 PM STRENGTH_LOWER 24min: box-squat-bodyweight 2x6 RIR3 BW; glute-bridge 4x5 RIR3 BW; reverse-lunge 1x12 RIR3 BW | d3 2026-11-27 PM STRENGTH_FULL_B 25min: glute-bridge 4x5 RIR3 BW; push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW | d4 2026-11-28 PM RUN EASY 15min (EASY) | d4 2026-11-28 PM STRENGTH_UPPER 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW | d5 2026-11-29 PM RUN LONG 30min (LONG) | d6 2026-11-30 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-01 PM RUN EASY 15min (EASY) | d1 2026-12-02 PM RUN EASY 15min (EASY) | d2 2026-12-03 PM RUN EASY 15min (EASY) | d2 2026-12-03 PM STRENGTH_LOWER 25min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 4x7 RIR3 BW; reverse-lunge 1x14 RIR3 BW | d3 2026-12-04 PM STRENGTH_FULL_B 26min: glute-bridge 4x7 RIR3 BW; push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW | d4 2026-12-05 PM RUN EASY 15min (EASY) | d4 2026-12-05 PM STRENGTH_UPPER 18min: push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; incline-push-up 1x14 RIR3 BW | d5 2026-12-06 PM RUN LONG 35min (LONG) | d6 2026-12-07 PM RUN EASY 15min (EASY)

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

## R7D-G138

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":12,"asOf":"2026-11-09","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-27"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-01-27"},"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x5 0KG BODYWEIGHT"],"equipment":["KETTLEBELL","PULL_UP_BAR","DUMBBELLS","BARBELL","RACK","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":41,"strengthMinutes":41,"longRunDay":5,"longRunMinutes":136,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-11 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-12 AM RUN WALK 20min (WALK) | d2 2026-11-13 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-14 AM RUN WALK 20min (WALK) | d4 2026-11-15 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-16 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-11-18 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-11-19 AM RUN WALK 20min (WALK) | d2 2026-11-20 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-21 AM RUN WALK 20min (WALK) | d4 2026-11-22 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-11-23 AM RUN WALK 20min (WALK)
- Week 10 (TAPER): d0 2027-01-20 AM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d1 2027-01-21 AM RUN WALK 20min (WALK) | d2 2027-01-22 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d3 2027-01-23 AM RUN WALK 20min (WALK) | d4 2027-01-24 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d5 2027-01-25 AM RUN WALK 20min (WALK)
- Week 11 (RACE_WEEK): d0 2027-01-27  RUN RACE 75min (RACE, completion) | d1 RUN REST_BY_DESIGN | d2 2027-01-29 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d3 2027-01-30 AM RUN WALK 20min (WALK) | d4 2027-01-31 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d5 2027-02-01 AM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-05","weeks":12,"asOf":"2026-12-02","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x5 0KG BODYWEIGHT","glute-bridge 3x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4],"strengthDays":[0,1,2,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":61,"strengthMinutes":30,"longRunDay":4,"longRunMinutes":131,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-05 PM STRENGTH_LOWER 29min: box-squat-bodyweight 5x5 RIR3 BW; glute-bridge 3x5 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d1 2026-12-06 PM STRENGTH_UPPER 17min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-07 PM STRENGTH_LOWER_B 22min: glute-bridge 3x5 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW | d3 2026-12-08 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-08 PM STRENGTH_UPPER_B 17min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-09 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-12 PM STRENGTH_LOWER 29min: box-squat-bodyweight 5x5 RIR3 BW; glute-bridge 3x5 RIR3 BW; reverse-lunge 1x10 RIR3 BW | d1 2026-12-13 PM STRENGTH_UPPER 17min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-14 PM STRENGTH_LOWER_B 22min: glute-bridge 3x5 RIR3 BW; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW | d3 2026-12-15 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-15 PM STRENGTH_UPPER_B 17min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-16 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":4,"asOf":"2026-12-25","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x6 0KG BODYWEIGHT","db-rdl 5x8 26KG PER_HAND","db-split-squat 5x10 12KG PER_HAND"],"equipment":["KETTLEBELL","BODYWEIGHT","BANDS","RACK","MACHINES","PULL_UP_BAR","DUMBBELLS","BENCH","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,6],"strengthDays":[1,2,3,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":20,"strengthMinutes":49,"longRunDay":6,"longRunMinutes":141,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-26 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-27 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-27 AM STRENGTH_LOWER 36min: box-squat-bodyweight 4x6 RIR3 BW; db-rdl 5x8 RIR3 26kg PER_HAND; db-split-squat 1x10 RIR3 establish; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish | d2 2026-12-28 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-12-29 AM STRENGTH_LOWER_B 30min: db-rdl 5x8 RIR3 26kg PER_HAND; db-split-squat 2x8 RIR3 establish; seated-calf-raise-db 1x10 RIR3 establish; tibialis-raise 1x10 RIR3 BW | d5 2026-12-31 AM STRENGTH_UPPER_B 20min: band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2027-01-01 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2027-01-02 PM RUN WALK_JOG 20min (WALK_JOG 4x(30s jog/120s walk)) | d1 2027-01-03 PM RUN WALK_JOG 20min (WALK_JOG 4x(30s jog/120s walk)) | d1 2027-01-03 AM STRENGTH_LOWER 36min: box-squat-bodyweight 4x6 RIR3 BW; db-rdl 5x8 RIR3 26kg PER_HAND; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; hip-abduction-machine 1x10 RIR3 last logged | d2 2027-01-04 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d3 2027-01-05 AM STRENGTH_LOWER_B 30min: db-rdl 5x8 RIR3 26kg PER_HAND; db-split-squat 2x10 RIR3 last logged; seated-calf-raise-db 1x10 RIR3 last logged; tibialis-raise 1x10 RIR3 BW | d5 2027-01-07 AM STRENGTH_UPPER_B 20min: band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2027-01-08 PM RUN WALK_JOG 20min (WALK_JOG 4x(30s jog/120s walk))

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

## R7D-G141

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":16,"asOf":"2026-12-15","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-28"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-03-28"},"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":49,"longestRunMinutes":27,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["back-squat 5x12 59KG TOTAL"],"equipment":["BODYWEIGHT","DUMBBELLS","KETTLEBELL","PULL_UP_BAR","BARBELL","RACK"],"pause":{"nonclinical":true,"weeks":3,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":44,"strengthMinutes":60,"longRunDay":1,"longRunMinutes":149,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d1 2026-12-16 AM RUN LONG 25min (LONG)
- Week 1 (BUILD): d1 2026-12-23 AM RUN LONG 30min (LONG)
- Week 13 (TAPER): d1 2027-03-17 AM RUN LONG 44min (LONG)
- Week 14 (RACE_WEEK): d1 2027-03-24 AM RUN EASY 15min (EASY) | d5 2027-03-28  RUN RACE 150min (RACE)

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

## R7D-G142

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":16,"asOf":"2026-12-11","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":336,"longestRunMinutes":58,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["leg-press 5x8 69KG TOTAL","barbell-rdl 3x6 67KG TOTAL"],"equipment":["BARBELL","BANDS","DUMBBELLS","BODYWEIGHT","PULL_UP_BAR","MACHINES","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,5,6],"strengthDays":[0,1,2,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":68,"strengthMinutes":62,"longRunDay":3,"longRunMinutes":53,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-13 AM STRENGTH_UPPER 29min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-14 PM RUN EASY 58min (EASY) | d1 2026-12-14 AM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d2 2026-12-15 AM STRENGTH_LOWER 39min: leg-press 5x8 RIR3 69kg TOTAL; barbell-rdl 3x6 RIR3 67kg TOTAL; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2026-12-16 PM RUN LONG 53min (LONG) | d5 2026-12-18 PM RUN EASY 58min (EASY) | d6 2026-12-19 PM RUN EASY 58min (EASY) | d6 2026-12-19 AM STRENGTH_LOWER_B 28min: barbell-rdl 3x6 RIR3 67kg TOTAL; reverse-lunge 2x8 RIR3 BW; db-calf-raise 2x10 RIR3 establish; leg-curl-machine 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-12-20 AM STRENGTH_UPPER 35min: db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d1 2026-12-21 PM RUN EASY 58min (EASY) | d1 2026-12-21 AM STRENGTH_UPPER_B 27min: db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged | d2 2026-12-22 AM STRENGTH_LOWER 40min: leg-press 5x10 RIR3 69kg TOTAL; barbell-rdl 3x8 RIR3 67kg TOTAL; leg-extension-machine 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d3 2026-12-23 PM RUN LONG 53min (LONG) | d5 2026-12-25 PM RUN EASY 58min (EASY) | d6 2026-12-26 PM RUN EASY 58min (EASY) | d6 2026-12-26 AM STRENGTH_LOWER_B 31min: barbell-rdl 3x8 RIR3 67kg TOTAL; reverse-lunge 3x10 RIR3 BW; db-calf-raise 2x10 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_10K, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":16,"asOf":"2026-11-13","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-28"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-02-28"},"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":23,"longestRunMinutes":61,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x6 0KG BODYWEIGHT","barbell-rdl 2x5 76KG TOTAL","reverse-lunge 2x12 0KG BODYWEIGHT"],"equipment":["RACK","KETTLEBELL","BANDS","BENCH","BARBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3],"strengthDays":[0,3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":81,"strengthMinutes":29,"longRunDay":3,"longRunMinutes":66,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-11-16 PM STRENGTH_LOWER 24min: box-squat-bodyweight 3x6 RIR3 BW; barbell-rdl 2x5 RIR3 76kg TOTAL; reverse-lunge 2x12 RIR3 BW | d1 2026-11-17 AM RUN WALK 20min (WALK) | d3 2026-11-19 AM RUN LONG 20min (LONG) | d3 2026-11-19 PM STRENGTH_UPPER 22min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish | d5 2026-11-21 PM STRENGTH_FULL_B 23min: barbell-rdl 2x5 RIR3 76kg TOTAL; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish
- Week 1 (BUILD): d0 2026-11-23 PM STRENGTH_LOWER 24min: box-squat-bodyweight 3x8 RIR3 BW; barbell-rdl 2x7 RIR3 76kg TOTAL; reverse-lunge 2x8 RIR3 BW | d1 2026-11-24 AM RUN WALK 20min (WALK) | d3 2026-11-26 AM RUN LONG 25min (LONG) | d3 2026-11-26 PM STRENGTH_UPPER 27min: db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged | d5 2026-11-28 PM STRENGTH_FULL_B 29min: barbell-rdl 2x7 RIR3 76kg TOTAL; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged
- Week 13 (TAPER): d0 2027-02-15 PM STRENGTH_LOWER 18min: box-squat-bodyweight 2x10 RIR3 BW; barbell-rdl 1x10 RIR3 81kg TOTAL; split-squat-bodyweight 1x10 RIR3 BW | d1 2027-02-16 AM RUN EASY 20min (EASY +strides) | d3 2027-02-18 AM RUN LONG 40min (LONG) | d3 2027-02-18 PM STRENGTH_UPPER 20min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-lateral-raise 1x10 RIR3 last logged | d5 2027-02-20 PM STRENGTH_FULL_B 21min: barbell-rdl 1x10 RIR3 81kg TOTAL; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged
- Week 14 (RACE_WEEK): d0 2027-02-22 PM STRENGTH_LOWER 14min: box-squat-bodyweight 1x10 RIR4 BW; barbell-rdl 1x10 RIR4 81kg TOTAL | d1 2027-02-23 AM RUN EASY 15min (EASY) | d3 2027-02-25 AM RUN EASY 15min (EASY) | d3 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d6 2027-02-28  RUN RACE 75min (RACE)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_10K, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":16,"asOf":"2026-12-19","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-30"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-03-30"},"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":3,"runMinutesPerWeek":177,"longestRunMinutes":63,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","MACHINES","DUMBBELLS","KETTLEBELL","RACK","BENCH","BARBELL","PULL_UP_BAR","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,1,2,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":46,"strengthMinutes":71,"longRunDay":5,"longRunMinutes":58,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-21 PM RUN EASY 20min (EASY) | d0 2026-12-21 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-22 PM RUN EASY 20min (EASY) | d1 2026-12-22 PM STRENGTH_FULL_B 30min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; db-biceps-curl 2x8 RIR3 establish | d2 2026-12-23 PM RUN EASY 20min (EASY) | d2 2026-12-23 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-24 PM RUN EASY 20min (EASY) | d4 2026-12-25 PM RUN EASY 20min (EASY) | d4 2026-12-25 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-26 PM RUN LONG 58min (LONG) | d6 2026-12-27 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2026-12-28 PM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d0 2026-12-28 PM RUN EASY 20min (EASY) | d1 2026-12-29 PM STRENGTH_FULL_B 30min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; db-biceps-curl 2x8 RIR3 last logged | d1 2026-12-29 PM RUN EASY 20min (EASY) | d2 2026-12-30 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d2 2026-12-30 PM RUN EASY 20min (EASY) | d3 2026-12-31 PM RUN EASY 20min (EASY) | d4 2027-01-01 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d4 2027-01-01 PM RUN EASY 20min (EASY) | d5 2027-01-02 PM RUN LONG 58min (LONG) | d6 2027-01-03 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW
- Week 13 (TAPER): d0 2027-03-22 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; leg-extension-machine 1x10 RIR3 last logged; standing-calf-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d0 2027-03-22 PM RUN EASY 20min (EASY +strides) | d1 2027-03-23 PM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-lateral-raise 1x10 RIR3 last logged; db-biceps-curl 1x8 RIR3 last logged; dead-bug 1x16 RIR3 BW | d1 2027-03-23 PM RUN EASY 20min (EASY +strides) | d2 2027-03-24 PM STRENGTH_LOWER_B 14min: kb-deadlift 1x8 RIR4 last logged; reverse-lunge 1x16 RIR4 BW | d2 2027-03-24 PM RUN EASY 15min (EASY) | d3 2027-03-25 PM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d4 2027-03-26 PM RUN EASY 15min (EASY) | d5 2027-03-27 PM RUN EASY 15min (EASY) | d6 STRENGTH REST_BY_DESIGN
- Week 14 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2027-03-29 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d1 STRENGTH REST_BY_DESIGN | d1 2027-03-30  RUN RACE 75min (RACE) | d2 STRENGTH REST_BY_DESIGN | d2 RUN REST_BY_DESIGN | d3 2027-04-01 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 STRENGTH REST_BY_DESIGN | d4 2027-04-02 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 2027-04-03 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-07","weeks":8,"asOf":"2027-01-04","tz":60,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":84,"longestRunMinutes":87,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[1,3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":69,"strengthMinutes":38,"longRunDay":4,"longRunMinutes":73,"sameTurnConfirmed":false}}`

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

## R7D-G146

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-18","weeks":8,"asOf":"2026-12-18","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["leg-press 2x10 85KG TOTAL","barbell-rdl 4x12 99KG TOTAL"],"equipment":["BARBELL","BENCH","BANDS","DUMBBELLS","RACK","MACHINES","KETTLEBELL","BODYWEIGHT","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5],"strengthDays":[1,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":61,"strengthMinutes":42,"longRunDay":5,"longRunMinutes":63,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-18 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-19 AM STRENGTH_FULL_A 27min: leg-press 2x10 RIR3 85kg TOTAL; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2026-12-19 AM RUN WALK 20min (WALK) | d3 2026-12-21 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-22 AM RUN WALK 20min (WALK) | d5 2026-12-23 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-24 AM STRENGTH_FULL_B 33min: barbell-rdl 4x10 RIR3 99kg TOTAL; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-25 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-26 AM STRENGTH_FULL_A 27min: leg-press 2x10 RIR3 85kg TOTAL; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d1 2026-12-26 AM RUN WALK 20min (WALK) | d3 2026-12-28 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-29 AM RUN WALK 20min (WALK) | d5 2026-12-30 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-31 AM STRENGTH_FULL_B 33min: barbell-rdl 4x10 RIR3 99kg TOTAL; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":16,"asOf":"2026-12-25","tz":330,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":110,"longestRunMinutes":19,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":3,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5,6],"strengthDays":[1,2,3,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":72,"strengthMinutes":59,"longRunDay":0,"longRunMinutes":130,"sameTurnConfirmed":false}}`

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-03","weeks":8,"asOf":"2027-01-01","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":29,"longestRunMinutes":83,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x5 0KG BODYWEIGHT","barbell-rdl 2x6 35KG TOTAL","reverse-lunge 3x12 0KG BODYWEIGHT"],"equipment":["BANDS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[],"strengthDays":[0,4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":68,"strengthMinutes":57,"sameTurnConfirmed":false}}`

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

## R7D-G149

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":4,"asOf":"2026-11-08","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-11-26"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2026-11-26"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":39,"longestRunMinutes":54,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","BENCH","MACHINES","BANDS","PULL_UP_BAR","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4,6],"strengthDays":[0,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":76,"strengthMinutes":37,"longRunDay":4,"longRunMinutes":44,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-09 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d0 2026-11-09 AM RUN EASY 20min (EASY) | d4 2026-11-13 AM RUN LONG 15min (LONG) | d5 2026-11-14 AM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 1x10 RIR3 establish; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-11-15 AM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-11-15 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-11-16 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d0 2026-11-16 AM RUN EASY 20min (EASY) | d4 2026-11-20 AM RUN EASY 15min (EASY) | d5 2026-11-21 AM STRENGTH_UPPER 14min: db-bench-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d6 STRENGTH REST_BY_DESIGN | d6 2026-11-22 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-11-16 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d0 2026-11-16 AM RUN EASY 20min (EASY) | d4 2026-11-20 AM RUN EASY 15min (EASY) | d5 2026-11-21 AM STRENGTH_UPPER 14min: db-bench-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d6 STRENGTH REST_BY_DESIGN | d6 2026-11-22 AM RUN WALK 20min (WALK)
- Week 2 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2026-11-23 AM RUN EASY 15min (EASY) | d3 2026-11-26  RUN RACE 150min (RACE, completion) | d4 RUN REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN | d6 2026-11-29 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":16,"asOf":"2026-12-07","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-28"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-03-28"},"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":111,"longestRunMinutes":61,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","MACHINES","BENCH","DUMBBELLS","KETTLEBELL","RACK","PULL_UP_BAR","BARBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3],"strengthDays":[6],"runTurn":"AM","strengthTurn":"AM","runMinutes":75,"strengthMinutes":28,"longRunDay":3,"longRunMinutes":118,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d2 2026-12-10 AM RUN EASY 50min (EASY) | d3 2026-12-11 AM RUN LONG 60min (LONG) | d6 2026-12-14 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW
- Week 1 (BUILD): d2 2026-12-17 AM RUN EASY 50min (EASY) | d3 2026-12-18 AM RUN LONG 60min (LONG) | d6 2026-12-21 AM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW
- Week 14 (TAPER): d2 2027-03-18 AM RUN EASY 55min (EASY +strides) | d3 2027-03-19 AM RUN LONG 65min (LONG) | d6 2027-03-22 AM STRENGTH_FULL_A 17min: goblet-squat 1x8 RIR4 last logged; incline-push-up 1x14 RIR4 BW; band-row 1x10 RIR4 BW
- Week 15 (RACE_WEEK): d2 2027-03-25 AM RUN EASY 40min (EASY) | d3 2027-03-26 AM RUN EASY 40min (EASY) | d5 2027-03-28  RUN RACE 150min (RACE) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":4,"asOf":"2026-12-13","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":235,"longestRunMinutes":69,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[0,1,3,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":54,"strengthMinutes":74,"longRunDay":0,"longRunMinutes":146,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-15 PM RUN LONG 65min (LONG) | d0 2026-12-15 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-16 PM RUN EASY 54min (EASY) | d1 2026-12-16 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-17 PM RUN EASY 54min (EASY) | d3 2026-12-18 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-12-19 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-22 PM RUN LONG 65min (LONG) | d0 2026-12-22 AM STRENGTH_FULL_A 27min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-23 PM RUN EASY 54min (EASY) | d1 2026-12-23 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-24 PM RUN EASY 54min (EASY) | d3 2026-12-25 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d4 2026-12-26 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":4,"asOf":"2026-11-28","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":153,"longestRunMinutes":46,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","MACHINES","RACK","PULL_UP_BAR","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[1,2,3,4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":26,"strengthMinutes":37,"longRunDay":1,"longRunMinutes":34,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-29 AM RUN LONG 34min (LONG) | d1 2026-11-29 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-30 PM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; leg-curl-machine 2x8 RIR3 establish; cable-triceps-pushdown 2x8 RIR3 establish | d3 2026-12-01 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-12-02 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-04 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-06 AM RUN LONG 34min (LONG) | d1 2026-12-06 PM STRENGTH_FULL_A 31min: leg-press 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-12-07 PM STRENGTH_FULL_B 30min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; leg-curl-machine 2x8 RIR3 last logged; cable-triceps-pushdown 2x8 RIR3 last logged | d3 2026-12-08 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d4 2026-12-09 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2026-12-11 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 establish; front-plank 2x10 RIR3 BW

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

## R7D-G153

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-14","weeks":4,"asOf":"2026-11-12","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BARBELL","BODYWEIGHT","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[3],"runTurn":"AM","strengthTurn":"PM","runMinutes":33,"strengthMinutes":59,"longRunDay":2,"longRunMinutes":100,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-14 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-15 AM RUN WALK 20min (WALK) | d2 2026-11-16 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-17 AM RUN WALK 20min (WALK) | d3 2026-11-17 PM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x10 RIR3 BW; push-up 2x10 RIR3 BW; inverted-row 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-18 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-11-21 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-11-22 AM RUN WALK 20min (WALK) | d2 2026-11-23 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-24 AM RUN WALK 20min (WALK) | d3 2026-11-24 PM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x10 RIR3 BW; push-up 2x10 RIR3 BW; inverted-row 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-25 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-27","weeks":4,"asOf":"2026-11-25","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x12 0KG BODYWEIGHT","barbell-rdl 5x8 35KG TOTAL"],"equipment":["MACHINES","KETTLEBELL","PULL_UP_BAR","BANDS","BENCH","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4],"strengthDays":[0,1,3,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":69,"strengthMinutes":52,"longRunDay":4,"longRunMinutes":125,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-27 AM STRENGTH_LOWER 38min: box-squat-bodyweight 5x12 RIR3 BW; kb-deadlift 2x8 RIR3 establish; leg-extension-machine 2x10 RIR3 establish; seated-calf-raise-machine 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d0 2026-11-27 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-28 AM STRENGTH_UPPER 29min: machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish; band-biceps-curl 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2026-11-28 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-30 AM STRENGTH_LOWER_B 26min: kb-deadlift 2x8 RIR3 establish; reverse-lunge 2x8 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 establish; leg-curl-machine 2x10 RIR3 establish | d3 2026-11-30 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-01 AM RUN WALK 20min (WALK) | d5 2026-12-02 AM STRENGTH_UPPER_B 22min: seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; dead-bug 2x10 RIR3 BW | d6 2026-12-03 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 establish; front-plank 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-04 AM STRENGTH_LOWER 41min: box-squat-bodyweight 5x12 RIR3 BW; kb-deadlift 3x8 RIR3 last logged; leg-extension-machine 2x10 RIR3 last logged; seated-calf-raise-machine 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d0 2026-12-04 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-05 AM STRENGTH_UPPER 34min: machine-chest-press 3x8 RIR3 last logged; seated-cable-row 3x8 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged; band-biceps-curl 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2026-12-05 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-07 AM STRENGTH_LOWER_B 31min: kb-deadlift 3x8 RIR3 last logged; reverse-lunge 3x8 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged | d3 2026-12-07 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-08 AM RUN WALK 20min (WALK) | d5 2026-12-09 AM STRENGTH_UPPER_B 27min: seated-cable-row 3x8 RIR3 last logged; machine-chest-press 3x8 RIR3 last logged; dead-bug 2x10 RIR3 BW | d6 2026-12-10 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; seated-calf-raise-machine 2x10 RIR3 last logged; front-plank 2x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-19","weeks":8,"asOf":"2026-12-17","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,6],"strengthDays":[0,3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":57,"strengthMinutes":61,"longRunDay":6,"longRunMinutes":94,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-19 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-19 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-12-22 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-22 PM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-24 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-25 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-26 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-26 PM STRENGTH_FULL_A 28min: box-squat-bodyweight 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-29 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-29 PM STRENGTH_FULL_B 28min: glute-bridge 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-31 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d6 2027-01-01 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":8,"asOf":"2026-11-22","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":98,"longestRunMinutes":69,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,5],"strengthDays":[1,2,3,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":22,"strengthMinutes":43,"longRunDay":5,"longRunMinutes":67,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-23 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-24 AM RUN EASY 22min (EASY) | d2 2026-11-24 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-25 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-11-26 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-27 AM RUN LONG 65min (LONG) | d5 2026-11-27 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-11-30 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-01 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-01 AM RUN EASY 22min (EASY) | d3 2026-12-02 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d4 2026-12-03 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d5 2026-12-04 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d5 2026-12-04 AM RUN LONG 65min (LONG)

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

## R7D-G157

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":8,"asOf":"2026-11-09","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-01"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-01-01"},"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":60,"longestRunMinutes":66,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","KETTLEBELL","BANDS","PULL_UP_BAR","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,5,6],"strengthDays":[0,1,3,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":69,"strengthMinutes":48,"longRunDay":5,"longRunMinutes":40,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-10 AM RUN EASY 15min (EASY) | d0 2026-11-10 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-11 AM RUN EASY 15min (EASY) | d1 2026-11-11 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-13 AM RUN WALK 20min (WALK) | d3 2026-11-13 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-11-14 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-15 AM RUN LONG 20min (LONG) | d6 2026-11-16 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-11-17 AM RUN EASY 15min (EASY) | d0 2026-11-17 PM STRENGTH_FULL_A 27min: kb-goblet-squat 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-18 AM RUN EASY 15min (EASY) | d1 2026-11-18 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-20 AM RUN WALK 20min (WALK) | d3 2026-11-20 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d4 2026-11-21 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d5 2026-11-22 AM RUN LONG 20min (LONG) | d6 2026-11-23 AM RUN WALK 20min (WALK)
- Week 6 (TAPER): d0 2026-12-22 AM RUN EASY 15min (EASY +strides) | d0 2026-12-22 PM STRENGTH_LOWER 19min: kb-goblet-squat 1x8 RIR3 last logged; kb-deadlift 1x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-23 AM RUN EASY 15min (EASY +strides) | d1 2026-12-23 PM STRENGTH_UPPER 19min: machine-chest-press 1x8 RIR3 last logged; seated-cable-row 1x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW; kb-row 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d3 2026-12-25 AM RUN EASY 15min (EASY +strides) | d3 2026-12-25 PM STRENGTH_LOWER_B 17min: kb-deadlift 1x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; seated-calf-raise-machine 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2026-12-26 PM STRENGTH_UPPER_B 14min: seated-cable-row 1x8 RIR4 last logged; machine-chest-press 1x8 RIR4 last logged | d5 2026-12-27 AM RUN EASY 15min (EASY) | d6 2026-12-28 AM RUN WALK 20min (WALK)
- Week 7 (RACE_WEEK): d0 2026-12-29 AM RUN EASY 15min (EASY) | d0 STRENGTH REST_BY_DESIGN | d1 2026-12-30 AM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d3 2027-01-01  RUN RACE 150min (RACE, completion) | d4 STRENGTH REST_BY_DESIGN | d5 2027-01-03 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 2027-01-04 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-22","weeks":16,"asOf":"2026-12-21","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-09"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-04-09"},"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":108,"longestRunMinutes":27,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,6],"strengthDays":[0,1,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":66,"strengthMinutes":62,"longRunDay":6,"longRunMinutes":92,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-22 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-23 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-25 AM RUN EASY 27min (EASY) | d4 2026-12-26 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-28 AM RUN LONG 25min (LONG)
- Week 1 (BUILD): d0 2026-12-29 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d1 2026-12-30 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-01 AM RUN EASY 27min (EASY) | d4 2027-01-02 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x12 RIR3 establish; front-plank 1x12 RIR3 BW | d6 2027-01-04 AM RUN LONG 25min (LONG)
- Week 14 (TAPER): d0 2027-03-30 PM STRENGTH_LOWER 20min: goblet-squat 1x10 RIR3 last logged; glute-bridge 1x16 RIR3 BW; reverse-lunge 1x16 RIR3 BW; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x16 RIR3 BW | d1 2027-03-31 PM STRENGTH_UPPER 20min: db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; incline-push-up 1x16 RIR3 BW; prone-ytw-raise 1x16 RIR3 BW; dead-bug 1x16 RIR3 BW | d3 2027-04-02 AM RUN EASY 30min (EASY +strides) | d4 2027-04-03 PM STRENGTH_FULL_B 17min: glute-bridge 1x16 RIR4 BW; db-row 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged | d6 2027-04-05 AM RUN EASY 20min (EASY)
- Week 15 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d3 2027-04-09  RUN RACE 150min (RACE, completion) | d4 STRENGTH REST_BY_DESIGN | d6 2027-04-12 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-07","weeks":16,"asOf":"2026-12-07","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x12 27KG SINGLE_IMPLEMENT","glute-bridge 3x8 0KG BODYWEIGHT"],"equipment":["KETTLEBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,3,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":76,"strengthMinutes":34,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-07 AM STRENGTH_LOWER 23min: kb-goblet-squat 2x12 RIR3 27kg SINGLE_IMPLEMENT; glute-bridge 3x8 RIR3 BW; reverse-lunge 1x12 RIR3 BW | d3 2026-12-10 AM STRENGTH_UPPER 21min: push-up 2x10 RIR3 BW; kb-row 2x10 RIR3 establish; incline-push-up 1x12 RIR3 BW | d6 2026-12-13 AM STRENGTH_FULL_B 27min: glute-bridge 3x8 RIR3 BW; kb-row 2x10 RIR3 establish; push-up 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-14 AM STRENGTH_LOWER 23min: kb-goblet-squat 2x8 RIR3 29kg SINGLE_IMPLEMENT; glute-bridge 3x10 RIR3 BW; reverse-lunge 1x14 RIR3 BW | d3 2026-12-17 AM STRENGTH_UPPER 21min: push-up 2x12 RIR3 BW; kb-row 2x10 RIR3 last logged; incline-push-up 1x14 RIR3 BW | d6 2026-12-20 AM STRENGTH_FULL_B 27min: glute-bridge 3x10 RIR3 BW; kb-row 2x10 RIR3 last logged; push-up 2x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":4,"asOf":"2026-11-14","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x5 20KG SINGLE_IMPLEMENT"],"equipment":["BANDS","DUMBBELLS","BODYWEIGHT","KETTLEBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4],"strengthDays":[0],"runTurn":"PM","strengthTurn":"PM","runMinutes":45,"strengthMinutes":29,"longRunDay":0,"longRunMinutes":45,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-17 PM RUN EASY 15min (EASY) | d0 2026-11-17 PM STRENGTH_FULL_A 23min: kb-goblet-squat 2x5 RIR3 20kg SINGLE_IMPLEMENT; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish | d4 2026-11-21 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-24 PM RUN EASY 20min (EASY) | d0 2026-11-24 PM STRENGTH_FULL_A 23min: kb-goblet-squat 2x5 RIR3 20kg SINGLE_IMPLEMENT; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d4 2026-11-28 PM RUN EASY 20min (EASY)

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

## R7D-G161

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-16","weeks":16,"asOf":"2026-12-16","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":252,"longestRunMinutes":88,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":36,"strengthMinutes":38,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-16 PM STRENGTH_LOWER 29min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2026-12-17 PM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; pike-push-up 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2026-12-22 PM STRENGTH_FULL_B 29min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-23 PM STRENGTH_LOWER 34min: box-squat-bodyweight 3x8 RIR3 BW; glute-bridge 3x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2026-12-24 PM STRENGTH_UPPER 27min: push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; pike-push-up 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2026-12-29 PM STRENGTH_FULL_B 34min: glute-bridge 3x8 RIR3 BW; push-up 3x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":4,"asOf":"2026-12-25","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-15"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-01-15"},"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,4],"strengthDays":[0,3,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":52,"strengthMinutes":63,"longRunDay":4,"longRunMinutes":141,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-27 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-12-29 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-30 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-31 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-31 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-01 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-02 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2027-01-03 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-05 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-06 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-07 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-07 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d5 2027-01-08 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 STRENGTH REST_BY_DESIGN
- Week 1 (BUILD): d0 2027-01-03 PM STRENGTH_FULL_A 25min: box-squat-bodyweight 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-05 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-06 PM STRENGTH_FULL_B 25min: glute-bridge 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-07 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-07 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d5 2027-01-08 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 STRENGTH REST_BY_DESIGN
- Week 2 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d2 2027-01-12 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-14 AM RUN WALK 20min (WALK) | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d5 2027-01-15  RUN RACE 75min (RACE, completion) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":4,"asOf":"2026-12-27","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":78,"longestRunMinutes":72,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x10 0KG BODYWEIGHT"],"equipment":["RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5],"strengthDays":[2,3,4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":62,"strengthMinutes":42,"longRunDay":4,"longRunMinutes":101,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-29 PM RUN EASY 20min (EASY) | d1 2026-12-30 PM RUN EASY 20min (EASY) | d2 2026-12-31 PM RUN WALK 20min (WALK) | d2 2026-12-31 AM STRENGTH_LOWER 32min: box-squat-bodyweight 5x10 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-01 AM STRENGTH_UPPER 17min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2027-01-02 PM RUN LONG 30min (LONG) | d4 2027-01-02 AM STRENGTH_UPPER_B 17min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-03 PM RUN WALK 20min (WALK) | d5 2027-01-03 AM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2027-01-04 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-05 PM RUN EASY 20min (EASY) | d1 2027-01-06 PM RUN EASY 20min (EASY) | d2 2027-01-07 PM RUN WALK 20min (WALK) | d2 2027-01-07 AM STRENGTH_LOWER 33min: box-squat-bodyweight 5x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-08 AM STRENGTH_UPPER 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-09 PM RUN LONG 30min (LONG) | d4 2027-01-09 AM STRENGTH_UPPER_B 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-10 PM RUN WALK 20min (WALK) | d5 2027-01-10 AM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-11 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-25","weeks":8,"asOf":"2026-12-22","tz":-180,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-06"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-02-06"},"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":74,"strengthMinutes":62,"longRunDay":4,"longRunMinutes":139,"sameTurnConfirmed":true}}`

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

## R7D-G165

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-10","weeks":4,"asOf":"2026-12-10","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","RACK","MACHINES","BARBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1],"runTurn":"AM","strengthTurn":"AM","runMinutes":57,"strengthMinutes":35,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-11 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-18 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-24","weeks":16,"asOf":"2026-12-24","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-02"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-04-02"},"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":3,"runMinutesPerWeek":153,"longestRunMinutes":47,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":80,"strengthMinutes":61,"longRunDay":3,"longRunMinutes":131,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d1 2026-12-25 AM RUN EASY 35min (EASY) | d2 2026-12-26 AM RUN EASY 35min (EASY) | d3 2026-12-27 AM RUN LONG 45min (LONG) | d6 2026-12-30 AM RUN EASY 35min (EASY)
- Week 1 (BUILD): d1 2027-01-01 AM RUN EASY 35min (EASY) | d2 2027-01-02 AM RUN EASY 35min (EASY) | d3 2027-01-03 AM RUN LONG 50min (LONG) | d6 2027-01-06 AM RUN EASY 35min (EASY)
- Week 13 (TAPER): d1 2027-03-26 AM RUN QUALITY 37min (HALF_MARATHON_SPECIFIC 2x10'/2') | d2 2027-03-27 AM RUN EASY 25min (EASY) | d3 2027-03-28 AM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3') | d6 2027-03-31 AM RUN EASY 25min (EASY)
- Week 14 (RACE_WEEK): d1 2027-04-02  RUN RACE 150min (RACE) | d2 RUN REST_BY_DESIGN | d3 2027-04-04 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 2027-04-07 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

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

## R7D-G167

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-07","weeks":4,"asOf":"2027-01-06","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x10 10KG SINGLE_IMPLEMENT"],"equipment":["BANDS","KETTLEBELL","BENCH","RACK","BARBELL","PULL_UP_BAR","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":16,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,1,3,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":51,"strengthMinutes":72,"longRunDay":1,"longRunMinutes":146,"sameTurnConfirmed":true}}`

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

## R7D-G168

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":12,"asOf":"2026-11-13","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":148,"longestRunMinutes":138,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BODYWEIGHT","DUMBBELLS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,3,4],"strengthDays":[0,1,2,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":79,"strengthMinutes":34,"longRunDay":4,"longRunMinutes":73,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-15 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-16 AM RUN EASY 40min (EASY) | d1 2026-11-16 PM STRENGTH_FULL_B 25min: glute-bridge 2x5 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d2 2026-11-17 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-11-18 AM RUN EASY 40min (EASY) | d4 2026-11-19 AM RUN LONG 65min (LONG) | d6 2026-11-21 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-22 PM STRENGTH_FULL_A 25min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-11-23 AM RUN EASY 40min (EASY) | d1 2026-11-23 PM STRENGTH_FULL_B 25min: glute-bridge 2x5 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d2 2026-11-24 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d3 2026-11-25 AM RUN EASY 40min (EASY) | d4 2026-11-26 AM RUN LONG 65min (LONG) | d6 2026-11-28 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":16,"asOf":"2026-12-11","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":324,"longestRunMinutes":40,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BODYWEIGHT","BANDS","DUMBBELLS","MACHINES","PULL_UP_BAR","BARBELL","RACK","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4],"strengthDays":[0,1,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":78,"strengthMinutes":62,"longRunDay":0,"longRunMinutes":52,"sameTurnConfirmed":false}}`

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

## R7D-G170

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":12,"asOf":"2026-11-18","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","RACK","DUMBBELLS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,3,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":68,"strengthMinutes":65,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-11-22 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-23 AM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 1x10 RIR3 establish; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-11-24 AM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-11-25 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2026-11-26 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-11-29 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-11-30 AM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d3 2026-12-01 AM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-02 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2026-12-03 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-16","weeks":4,"asOf":"2026-12-16","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":45,"longestRunMinutes":50,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":30,"strengthMinutes":68,"longRunDay":1,"longRunMinutes":85,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-12-17 PM RUN LONG 45min (LONG)
- Week 1 (DEVELOPMENT): d1 2026-12-24 PM RUN LONG 50min (LONG)

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

## R7D-G172

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-25","weeks":4,"asOf":"2026-12-22","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":41,"longestRunMinutes":37,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x12 22KG SINGLE_IMPLEMENT","hip-thrust-db 5x6 17KG PER_HAND"],"equipment":["BODYWEIGHT","PULL_UP_BAR","DUMBBELLS","BARBELL","RACK","BENCH","KETTLEBELL","MACHINES","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,3,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":30,"strengthMinutes":53,"sameTurnConfirmed":true}}`

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

## R7D-G173

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":8,"asOf":"2026-11-17","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-08"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-01-08"},"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":138,"longestRunMinutes":52,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":49,"strengthMinutes":57,"longRunDay":0,"longRunMinutes":40,"sameTurnConfirmed":false}}`

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-08","weeks":8,"asOf":"2027-01-07","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,6],"strengthDays":[0,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":46,"strengthMinutes":52,"longRunDay":3,"longRunMinutes":107,"sameTurnConfirmed":false}}`

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

## R7D-G175

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-29","weeks":8,"asOf":"2026-11-28","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-18"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-01-18"},"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BARBELL","BANDS","DUMBBELLS","RACK","KETTLEBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,5,6],"strengthDays":[0,1,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":29,"strengthMinutes":59,"longRunDay":2,"longRunMinutes":35,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-29 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-30 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-01 PM RUN EASY 15min (EASY) | d3 2026-12-02 PM RUN EASY 15min (EASY) | d4 2026-12-03 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-04 PM RUN EASY 15min (EASY) | d6 2026-12-05 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-05 PM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-12-06 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d1 2026-12-07 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x12 RIR3 establish; front-plank 1x12 RIR3 BW | d2 2026-12-08 PM RUN EASY 20min (EASY) | d3 2026-12-09 PM RUN EASY 20min (EASY) | d4 2026-12-10 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-11 PM RUN EASY 20min (EASY) | d6 2026-12-12 PM RUN WALK 20min (WALK) | d6 2026-12-12 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x12 RIR3 establish; front-plank 1x12 RIR3 BW
- Week 6 (TAPER): d0 2027-01-10 PM STRENGTH_LOWER 19min: goblet-squat 1x10 RIR3 last logged; kb-deadlift 1x8 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2027-01-11 PM STRENGTH_UPPER 19min: db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; machine-chest-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d2 2027-01-12 PM RUN EASY 15min (EASY) | d3 2027-01-13 PM RUN EASY 15min (EASY) | d4 2027-01-14 PM STRENGTH_LOWER_B 14min: kb-deadlift 1x8 RIR4 last logged; reverse-lunge 1x14 RIR4 BW | d5 2027-01-15 PM RUN EASY 15min (EASY) | d6 STRENGTH REST_BY_DESIGN | d6 2027-01-16 PM RUN EASY 15min (EASY)
- Week 7 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d1 2027-01-18  RUN RACE 150min (RACE, completion) | d2 RUN REST_BY_DESIGN | d3 2027-01-20 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 STRENGTH REST_BY_DESIGN | d5 2027-01-22 PM RUN RECOVERY_EASY 29min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN | d6 2027-01-23 PM RUN RECOVERY_EASY 29min (RECOVERY_EASY)

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

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-08","weeks":16,"asOf":"2027-01-08","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"MARATHON","date":"2027-04-24"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"MARATHON","date":"2027-04-24"},"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x6 22KG SINGLE_IMPLEMENT","kb-deadlift 2x6 9KG SINGLE_IMPLEMENT","reverse-lunge 4x5 0KG BODYWEIGHT"],"equipment":["RACK","BODYWEIGHT","BENCH","PULL_UP_BAR","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[2,3,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":32,"strengthMinutes":51,"longRunDay":3,"longRunMinutes":58,"sameTurnConfirmed":true}}`

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

## R7D-G177

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":8,"asOf":"2026-11-16","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":175,"longestRunMinutes":71,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x5 21KG SINGLE_IMPLEMENT","glute-bridge 3x5 0KG BODYWEIGHT","reverse-lunge 5x12 0KG BODYWEIGHT"],"equipment":["BENCH","KETTLEBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0,1,2,3,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":55,"strengthMinutes":34,"longRunDay":2,"longRunMinutes":110,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-18 AM STRENGTH_LOWER 27min: kb-goblet-squat 5x5 RIR3 21kg SINGLE_IMPLEMENT; glute-bridge 3x5 RIR3 BW | d0 2026-11-18 AM RUN EASY 20min (EASY) | d1 2026-11-19 AM STRENGTH_UPPER 21min: incline-push-up 2x10 RIR3 BW; kb-row 2x10 RIR3 establish; band-row 1x12 RIR3 BW | d1 2026-11-19 AM RUN EASY 20min (EASY) | d2 2026-11-20 AM STRENGTH_UPPER_B 21min: kb-row 2x10 RIR3 establish; incline-push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-20 AM RUN LONG 70min (LONG) | d3 2026-11-21 AM STRENGTH_LOWER_B 31min: glute-bridge 3x5 RIR3 BW; reverse-lunge 5x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW | d3 2026-11-21 AM RUN EASY 20min (EASY) | d4 2026-11-22 AM RUN EASY 20min (EASY) | d5 2026-11-23 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2026-11-24 AM RUN EASY 20min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-25 AM STRENGTH_LOWER 28min: kb-goblet-squat 5x7 RIR3 21kg SINGLE_IMPLEMENT; glute-bridge 3x7 RIR3 BW | d0 2026-11-25 AM RUN EASY 20min (EASY) | d1 2026-11-26 AM STRENGTH_UPPER 21min: incline-push-up 2x12 RIR3 BW; kb-row 2x10 RIR3 last logged; band-row 1x12 RIR3 BW | d1 2026-11-26 AM RUN EASY 20min (EASY) | d2 2026-11-27 AM STRENGTH_UPPER_B 21min: kb-row 2x10 RIR3 last logged; incline-push-up 2x12 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-11-27 AM RUN LONG 70min (LONG) | d3 2026-11-28 AM STRENGTH_LOWER_B 30min: glute-bridge 3x7 RIR3 BW; reverse-lunge 5x8 RIR3 BW; standing-calf-raise 1x14 RIR3 BW | d3 2026-11-28 AM RUN EASY 20min (EASY) | d4 2026-11-29 AM RUN EASY 20min (EASY) | d5 2026-11-30 AM STRENGTH_CORE 14min: dead-bug 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; front-plank 1x14 RIR3 BW | d6 2026-12-01 AM RUN EASY 20min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

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

**Tags.** COLD_START, H4, NON_RACE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":4,"asOf":"2026-12-25","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":188,"longestRunMinutes":69,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["RACK","MACHINES","BARBELL","KETTLEBELL","BANDS","BODYWEIGHT","BENCH","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,3],"runTurn":"PM","strengthTurn":"PM","runMinutes":39,"strengthMinutes":51,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-28 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-29 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 1x10 RIR3 establish; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d3 2026-12-31 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-04 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2027-01-05 PM STRENGTH_UPPER 24min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d3 2027-01-07 PM STRENGTH_FULL_B 27min: db-rdl 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":8,"asOf":"2026-12-09","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-01"}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2027-02-01"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":29,"longestRunMinutes":51,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["RACK","KETTLEBELL","MACHINES","BARBELL","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,5],"strengthDays":[0,1,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":63,"strengthMinutes":47,"longRunDay":4,"longRunMinutes":95,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-12 PM STRENGTH_LOWER 24min: kb-goblet-squat 2x8 RIR3 establish; kb-deadlift 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-13 PM STRENGTH_UPPER 24min: machine-chest-press 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; push-up 1x10 RIR3 BW; kb-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d4 2026-12-16 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-17 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-18 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; seated-cable-row 2x8 RIR3 establish; machine-chest-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-19 PM STRENGTH_LOWER 24min: kb-goblet-squat 2x8 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-20 PM STRENGTH_UPPER 24min: machine-chest-press 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; push-up 1x10 RIR3 BW; kb-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d4 2026-12-23 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-24 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-25 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; seated-cable-row 2x8 RIR3 last logged; machine-chest-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 6 (TAPER): d0 2027-01-23 PM STRENGTH_LOWER 19min: kb-goblet-squat 1x8 RIR3 last logged; kb-deadlift 1x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2027-01-24 PM STRENGTH_UPPER 19min: machine-chest-press 1x8 RIR3 last logged; seated-cable-row 1x8 RIR3 last logged; push-up 1x12 RIR3 BW; kb-row 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2027-01-27 PM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d5 2027-01-28 PM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d6 2027-01-29 PM STRENGTH_FULL_B 16min: kb-deadlift 1x8 RIR4 last logged; seated-cable-row 1x8 RIR4 last logged; machine-chest-press 1x8 RIR4 last logged
- Week 7 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 2027-02-01  RUN RACE 75min (RACE, completion) | d4 2027-02-03 PM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d5 2027-02-04 PM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-15","weeks":16,"asOf":"2026-12-12","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-23"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-03-23"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["goblet-squat 3x10 10KG PER_HAND","hip-thrust-db 4x6 28KG PER_HAND","db-step-up 3x6 7KG PER_HAND"],"equipment":["BODYWEIGHT","BANDS","MACHINES","BENCH","DUMBBELLS","KETTLEBELL","BARBELL","RACK","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,6],"strengthDays":[3],"runTurn":"PM","strengthTurn":"AM","runMinutes":68,"strengthMinutes":63,"longRunDay":0,"longRunMinutes":59,"sameTurnConfirmed":true}}`

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

## R7D-G181

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-27","weeks":16,"asOf":"2026-12-25","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":22,"strengthMinutes":42,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d4 2026-12-31 PM STRENGTH_LOWER 25min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-01 PM STRENGTH_UPPER 25min: push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 1x12 RIR3 BW; band-assisted-pull-up 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-02 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d4 2027-01-07 PM STRENGTH_LOWER 25min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-08 PM STRENGTH_UPPER 25min: push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 1x12 RIR3 BW; band-assisted-pull-up 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-09 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; band-row 2x10 RIR3 BW; push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":8,"asOf":"2026-11-13","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":60,"longestRunMinutes":86,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x5 0KG BODYWEIGHT","glute-bridge 2x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0],"runTurn":"PM","strengthTurn":"PM","runMinutes":28,"strengthMinutes":69,"longRunDay":3,"longRunMinutes":80,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-15 PM STRENGTH_FULL_A 31min: box-squat-bodyweight 3x5 RIR3 BW; push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d0 2026-11-15 PM RUN EASY 15min (EASY) | d1 2026-11-16 PM RUN EASY 15min (EASY) | d2 2026-11-17 PM RUN WALK 20min (WALK) | d3 2026-11-18 PM RUN LONG 20min (LONG) | d4 2026-11-19 PM RUN WALK 20min (WALK) | d5 2026-11-20 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-11-22 PM STRENGTH_FULL_A 35min: box-squat-bodyweight 3x5 RIR3 BW; push-up 3x7 RIR3 BW; prone-ytw-raise 2x9 RIR3 BW; standing-calf-raise 2x9 RIR3 BW; dead-bug 2x9 RIR3 BW | d0 2026-11-22 PM RUN EASY 15min (EASY) | d1 2026-11-23 PM RUN EASY 15min (EASY) | d2 2026-11-24 PM RUN WALK 20min (WALK) | d3 2026-11-25 PM RUN LONG 20min (LONG) | d4 2026-11-26 PM RUN WALK 20min (WALK) | d5 2026-11-27 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-27","weeks":8,"asOf":"2026-11-24","tz":330,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES","BODYWEIGHT","DUMBBELLS","BENCH","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,5],"strengthDays":[1,2,3,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":52,"strengthMinutes":34,"longRunDay":5,"longRunMinutes":94,"sameTurnConfirmed":false}}`

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

## R7D-G184

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":4,"asOf":"2026-11-15","tz":60,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":174,"longestRunMinutes":62,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[0,2,3,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":70,"strengthMinutes":70,"longRunDay":3,"longRunMinutes":146,"sameTurnConfirmed":true}}`

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

## R7D-G185

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-10","weeks":16,"asOf":"2026-12-07","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-20"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"10K","date":"2027-03-20"},"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":81,"longestRunMinutes":140,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["kb-goblet-squat 3x8 32KG SINGLE_IMPLEMENT"],"equipment":["RACK","MACHINES","KETTLEBELL","BARBELL","PULL_UP_BAR","BODYWEIGHT","BENCH","BANDS","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":48,"strengthMinutes":25,"longRunDay":4,"longRunMinutes":126,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-12-10 AM RUN EASY 15min (EASY) | d1 2026-12-11 AM RUN EASY 15min (EASY) | d2 2026-12-12 AM RUN EASY 15min (EASY) | d3 2026-12-13 AM RUN WALK 20min (WALK) | d4 2026-12-14 AM RUN LONG 35min (LONG) | d4 2026-12-14 PM STRENGTH_FULL_A 24min: kb-goblet-squat 2x8 RIR3 32kg SINGLE_IMPLEMENT; push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW | d6 2026-12-16 AM RUN WALK 20min (WALK) | d6 2026-12-16 PM STRENGTH_FULL_B 24min: db-rdl 2x8 RIR3 establish; band-row 2x8 RIR3 BW; push-up 2x8 RIR3 BW
- Week 1 (BUILD): d0 2026-12-17 AM RUN EASY 15min (EASY) | d1 2026-12-18 AM RUN EASY 15min (EASY) | d2 2026-12-19 AM RUN EASY 15min (EASY) | d3 2026-12-20 AM RUN WALK 20min (WALK) | d4 2026-12-21 AM RUN LONG 35min (LONG) | d4 2026-12-21 PM STRENGTH_FULL_A 24min: kb-goblet-squat 2x10 RIR3 32kg SINGLE_IMPLEMENT; push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW | d6 2026-12-23 AM RUN WALK 20min (WALK) | d6 2026-12-23 PM STRENGTH_FULL_B 24min: db-rdl 2x8 RIR3 last logged; band-row 2x10 RIR3 BW; push-up 2x10 RIR3 BW
- Week 13 (TAPER): d0 2027-03-11 AM RUN EASY 15min (EASY +strides) | d1 2027-03-12 AM RUN QUALITY 31min (TEN_K_SPECIFIC 3x4'/2') | d2 2027-03-13 AM RUN EASY 15min (EASY +strides) | d3 2027-03-14 AM RUN EASY 15min (EASY) | d4 2027-03-15 AM RUN EASY 15min (EASY) | d4 2027-03-15 PM STRENGTH_FULL_A 16min: kb-goblet-squat 1x6 RIR4 38kg SINGLE_IMPLEMENT; push-up 1x14 RIR4 BW; band-row 1x10 RIR4 BW | d6 2027-03-17 AM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d6 STRENGTH REST_BY_DESIGN
- Week 14 (RACE_WEEK): d0 2027-03-18 AM RUN EASY 15min (EASY) | d1 2027-03-19 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d2 2027-03-20  RUN RACE 75min (RACE) | d3 RUN REST_BY_DESIGN | d4 2027-03-22 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 STRENGTH REST_BY_DESIGN | d6 2027-03-24 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-25","weeks":16,"asOf":"2026-12-25","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":220,"longestRunMinutes":24,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","KETTLEBELL","RACK","BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":51,"strengthMinutes":57,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-25 PM STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-12-26 PM STRENGTH_UPPER 29min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d4 2026-12-29 PM STRENGTH_FULL_B 31min: db-rdl 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-overhead-triceps-extension 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2027-01-01 PM STRENGTH_LOWER 34min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2027-01-02 PM STRENGTH_UPPER 34min: db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d4 2027-01-05 PM STRENGTH_FULL_B 38min: db-rdl 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-overhead-triceps-extension 2x10 RIR3 last logged

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, ELIGIBILITY_UNKNOWN, OUT_OF_SCOPE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":8,"asOf":"2026-11-15","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":108,"longestRunMinutes":27,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":4,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[0,1,2,4,5,6],"strengthDays":[0,3,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":90,"strengthMinutes":69,"longRunDay":6,"longRunMinutes":72,"sameTurnConfirmed":true}}`

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

## R7D-G188

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":12,"asOf":"2026-12-10","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BENCH","BARBELL","KETTLEBELL","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":33,"strengthMinutes":46,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-12 PM STRENGTH_LOWER 28min: goblet-squat 2x5 RIR3 establish; db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x7 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2026-12-13 PM STRENGTH_UPPER 28min: db-bench-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; db-floor-press 2x7 RIR3 establish; one-arm-db-row 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d3 2026-12-15 PM STRENGTH_LOWER_B 25min: db-rdl 2x5 RIR3 establish; bulgarian-split-squat-db 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2026-12-17 PM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-bench-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-19 PM STRENGTH_LOWER 34min: goblet-squat 3x5 RIR3 last logged; db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 2x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d1 2026-12-20 PM STRENGTH_UPPER 34min: db-bench-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; db-floor-press 2x7 RIR3 last logged; one-arm-db-row 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d3 2026-12-22 PM STRENGTH_LOWER_B 31min: db-rdl 3x5 RIR3 last logged; bulgarian-split-squat-db 3x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d5 2026-12-24 PM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-bench-press 3x5 RIR3 last logged; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":16,"asOf":"2026-11-20","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-03"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2027-03-03"},"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":54,"longestRunMinutes":89,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","BENCH","RACK","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2],"strengthDays":[0,1,2,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":53,"strengthMinutes":37,"longRunDay":2,"longRunMinutes":118,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-21 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-22 PM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-11-23 PM RUN LONG 50min (LONG) | d2 2026-11-23 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-26 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2026-11-28 PM STRENGTH_FULL_A 31min: kb-goblet-squat 2x5 RIR3 establish; incline-push-up 2x5 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-11-29 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d2 2026-11-30 PM RUN LONG 50min (LONG) | d2 2026-11-30 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d5 2026-12-03 PM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 13 (TAPER): d0 2027-02-20 PM STRENGTH_LOWER 24min: kb-goblet-squat 2x5 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2027-02-21 PM STRENGTH_UPPER 23min: incline-push-up 2x10 RIR3 BW; kb-row 2x8 RIR3 last logged; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-02-22 PM RUN LONG 53min (LONG) | d2 2027-02-22 PM STRENGTH_UPPER_B 22min: kb-row 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-02-25 PM STRENGTH_LOWER_B 14min: kb-deadlift 1x8 RIR4 last logged; reverse-lunge 1x10 RIR4 BW
- Week 14 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 2027-03-01 PM RUN EASY 15min (EASY) | d2 STRENGTH REST_BY_DESIGN | d4 2027-03-03  RUN RACE 150min (RACE) | d5 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-01","weeks":12,"asOf":"2026-12-01","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":86,"longestRunMinutes":85,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x5 0KG BODYWEIGHT","glute-bridge 2x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,3,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":82,"strengthMinutes":60,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-01 PM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d3 2026-12-04 PM STRENGTH_UPPER 17min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-07 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-08 PM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d3 2026-12-11 PM STRENGTH_UPPER 17min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-14 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":12,"asOf":"2026-11-19","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":156,"longestRunMinutes":31,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[0,2,3,4,5,6],"strengthDays":[0,1,4,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":67,"strengthMinutes":72,"longRunDay":3,"longRunMinutes":140,"sameTurnConfirmed":true}}`

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

## R7D-G192

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_10K, ELIGIBILITY_UNKNOWN, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-21","weeks":8,"asOf":"2026-12-18","tz":0,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"MARATHON","date":"2027-02-09"}},"strength":"MAINTAIN"},"event":{"kind":"MARATHON","date":"2027-02-09"},"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":4,"runMinutesPerWeek":136,"longestRunMinutes":70,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BODYWEIGHT","MACHINES","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[0,1,2,4,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":73,"strengthMinutes":32,"longRunDay":2,"longRunMinutes":88,"sameTurnConfirmed":true}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: EVENT_DISTANCE_OUTSIDE_V1 · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":16,"asOf":"2026-11-15","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-04"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-03-04"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":82,"longestRunMinutes":61,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,6],"strengthDays":[0,3,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":76,"strengthMinutes":70,"longRunDay":6,"longRunMinutes":146,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-17 PM RUN EASY 20min (EASY) | d0 2026-11-17 AM STRENGTH_LOWER 25min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-18 PM RUN EASY 20min (EASY) | d3 2026-11-20 AM STRENGTH_UPPER 19min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-21 AM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-22 AM STRENGTH_UPPER_B 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-11-23 PM RUN LONG 30min (LONG)
- Week 1 (BUILD): d0 2026-11-24 PM RUN EASY 20min (EASY) | d0 2026-11-24 AM STRENGTH_LOWER 25min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-25 PM RUN EASY 20min (EASY) | d3 2026-11-27 AM STRENGTH_UPPER 19min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-11-28 AM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; bent-knee-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-29 AM STRENGTH_UPPER_B 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-11-30 PM RUN LONG 30min (LONG)
- Week 14 (TAPER): d0 2027-02-23 PM RUN EASY 20min (EASY +strides) | d0 2027-02-23 AM STRENGTH_LOWER 21min: box-squat-bodyweight 1x16 RIR3 BW; glute-bridge 1x16 RIR3 BW; split-squat-bodyweight 1x16 RIR3 BW; single-leg-calf-raise 1x16 RIR3 BW; front-plank 1x16 RIR3 BW | d1 2027-02-24 PM RUN QUALITY 28min (TEN_K_SPECIFIC 3x3'/2') | d3 2027-02-26 AM STRENGTH_UPPER 12min: push-up 1x16 RIR4 BW | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d6 2027-03-01 PM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2')
- Week 15 (RACE_WEEK): d0 2027-03-02 PM RUN EASY 15min (EASY) | d0 STRENGTH REST_BY_DESIGN | d1 2027-03-03 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d2 2027-03-04  RUN RACE 75min (RACE) | d3 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d6 2027-03-08 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":8,"asOf":"2026-12-17","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["leg-press 2x5 66KG TOTAL"],"equipment":["BANDS","BODYWEIGHT","PULL_UP_BAR","RACK","BARBELL","BENCH","KETTLEBELL","DUMBBELLS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,5,6],"strengthDays":[4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":78,"strengthMinutes":68,"longRunDay":6,"longRunMinutes":80,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-21 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-22 AM RUN WALK 20min (WALK) | d3 2026-12-23 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-24 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; kb-deadlift 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-25 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-25 PM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; machine-chest-press 1x10 RIR3 establish; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d6 2026-12-26 AM RUN WALK 20min (WALK) | d6 2026-12-26 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-28 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-29 AM RUN WALK 20min (WALK) | d3 2026-12-30 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-31 PM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2027-01-01 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-01 PM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d6 2027-01-02 AM RUN WALK 20min (WALK) | d6 2027-01-02 PM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

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

**Intake.** `{"startDate":"2026-12-22","weeks":4,"asOf":"2026-12-22","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":80,"longestRunMinutes":15,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BARBELL","MACHINES","BANDS","DUMBBELLS","BENCH","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[6],"runTurn":"AM","strengthTurn":"AM","runMinutes":78,"strengthMinutes":26,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d6 2026-12-28 AM STRENGTH_FULL_A 24min: goblet-squat 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish
- Week 1 (DEVELOPMENT): d6 2027-01-04 AM STRENGTH_FULL_A 24min: goblet-squat 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":12,"asOf":"2026-12-12","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5,6],"strengthDays":[0,1,3,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":34,"strengthMinutes":67,"longRunDay":5,"longRunMinutes":33,"sameTurnConfirmed":true}}`

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

## R7D-G197

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-25","weeks":12,"asOf":"2026-12-23","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-11"}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2027-03-11"},"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":76,"longestRunMinutes":39,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["kb-goblet-squat 5x5 28KG SINGLE_IMPLEMENT","glute-bridge 5x5 0KG BODYWEIGHT"],"equipment":["KETTLEBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[0,2],"runTurn":"PM","strengthTurn":"AM","runMinutes":51,"strengthMinutes":29,"longRunDay":2,"longRunMinutes":43,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-12-25 PM RUN EASY 15min (EASY) | d0 2026-12-25 AM STRENGTH_FULL_A 28min: kb-goblet-squat 4x5 RIR3 28kg SINGLE_IMPLEMENT; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 establish | d1 2026-12-26 PM RUN EASY 15min (EASY) | d2 2026-12-27 PM RUN LONG 30min (LONG) | d2 2026-12-27 AM STRENGTH_FULL_B 28min: glute-bridge 4x5 RIR3 BW; kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW | d3 2026-12-28 PM RUN WALK 20min (WALK) | d5 2026-12-30 PM RUN EASY 15min (EASY)
- Week 1 (BUILD): d0 2027-01-01 PM RUN EASY 15min (EASY) | d0 2027-01-01 AM STRENGTH_FULL_A 28min: kb-goblet-squat 4x5 RIR3 28kg SINGLE_IMPLEMENT; incline-push-up 2x10 RIR3 BW; kb-row 2x8 RIR3 last logged | d1 2027-01-02 PM RUN EASY 15min (EASY) | d2 2027-01-03 PM RUN LONG 35min (LONG) | d2 2027-01-03 AM STRENGTH_FULL_B 28min: glute-bridge 4x5 RIR3 BW; kb-row 2x8 RIR3 last logged; incline-push-up 2x10 RIR3 BW | d3 2027-01-04 PM RUN WALK 20min (WALK) | d5 2027-01-06 PM RUN EASY 15min (EASY)
- Week 9 (TAPER): d0 2027-02-26 PM RUN EASY 15min (EASY +strides) | d0 2027-02-26 AM STRENGTH_FULL_A 18min: kb-goblet-squat 2x5 RIR3 28kg SINGLE_IMPLEMENT; incline-push-up 1x12 RIR3 BW; kb-row 1x8 RIR3 last logged | d1 2027-02-27 PM RUN EASY 15min (EASY +strides) | d2 2027-02-28 PM RUN LONG 25min (LONG) | d2 2027-02-28 AM STRENGTH_FULL_B 18min: glute-bridge 2x5 RIR3 BW; kb-row 1x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW | d3 2027-03-01 PM RUN EASY 15min (EASY +strides) | d5 2027-03-03 PM RUN QUALITY 31min (TEN_K_SPECIFIC 3x4'/2')
- Week 10 (RACE_WEEK): d0 2027-03-05 PM RUN EASY 15min (EASY) | d0 2027-03-05 AM STRENGTH_FULL_A 16min: kb-goblet-squat 1x5 RIR4 28kg SINGLE_IMPLEMENT; incline-push-up 1x12 RIR4 BW; kb-row 1x8 RIR4 last logged | d1 2027-03-06 PM RUN EASY 15min (EASY) | d2 2027-03-07 PM RUN EASY 15min (EASY) | d2 STRENGTH REST_BY_DESIGN | d3 2027-03-08 PM RUN RACE_TOUCH 25min (RACE_TOUCH 3x2'/2') | d5 2027-03-10 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d6 2027-03-11  RUN RACE 75min (RACE)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":16,"asOf":"2026-11-18","tz":60,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-06"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-03-06"},"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS","BENCH","MACHINES","KETTLEBELL","DUMBBELLS","RACK","PULL_UP_BAR","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,6],"strengthDays":[1,2,3,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":81,"strengthMinutes":73,"longRunDay":6,"longRunMinutes":149,"sameTurnConfirmed":true}}`

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

## R7D-G199

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":4,"asOf":"2026-11-17","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":102,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BANDS","KETTLEBELL","RACK","PULL_UP_BAR","BARBELL","DUMBBELLS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":66,"strengthMinutes":65,"longRunDay":3,"longRunMinutes":33,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-11-21 PM RUN EASY 25min (EASY) | d2 2026-11-22 PM RUN EASY 25min (EASY) | d3 2026-11-23 PM RUN LONG 33min (LONG) | d5 2026-11-25 PM RUN EASY 25min (EASY) | d6 2026-11-26 PM RUN EASY 25min (EASY)
- Week 1 (DEVELOPMENT): d1 2026-11-28 PM RUN EASY 25min (EASY) | d2 2026-11-29 PM RUN EASY 25min (EASY) | d3 2026-11-30 PM RUN LONG 33min (LONG) | d5 2026-12-02 PM RUN EASY 25min (EASY) | d6 2026-12-03 PM RUN EASY 25min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-10","weeks":16,"asOf":"2026-12-07","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":141,"longestRunMinutes":90,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","BODYWEIGHT","MACHINES","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":23,"strengthMinutes":29,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-10 PM STRENGTH_LOWER 22min: leg-press 2x5 RIR3 establish; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW | d5 2026-12-15 PM STRENGTH_UPPER 22min: machine-chest-press 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish; push-up 2x7 RIR3 BW | d6 2026-12-16 PM STRENGTH_FULL_B 24min: glute-bridge 2x5 RIR3 BW; seated-cable-row 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish
- Week 1 (DEVELOPMENT): d0 2026-12-17 PM STRENGTH_LOWER 28min: leg-press 3x5 RIR3 last logged; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW | d5 2026-12-22 PM STRENGTH_UPPER 28min: machine-chest-press 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged; push-up 2x7 RIR3 BW | d6 2026-12-23 PM STRENGTH_FULL_B 27min: glute-bridge 3x5 RIR3 BW; seated-cable-row 2x5 RIR3 last logged; machine-chest-press 2x5 RIR3 last logged

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":12,"asOf":"2026-12-07","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-19"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-02-19"},"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":27,"longestRunMinutes":56,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x8 0KG BODYWEIGHT","glute-bridge 4x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3],"strengthDays":[0,1,2,3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":51,"strengthMinutes":58,"longRunDay":3,"longRunMinutes":35,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-09 PM STRENGTH_LOWER 30min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 4x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-12-09 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-10 PM STRENGTH_UPPER 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-10 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-11 PM STRENGTH_LOWER_B 28min: glute-bridge 4x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-11 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-12 PM STRENGTH_UPPER_B 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-12 PM RUN WALK 20min (WALK) | d4 2026-12-13 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 1 (BUILD): d0 2026-12-16 PM STRENGTH_LOWER 30min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 4x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-12-16 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-17 PM STRENGTH_UPPER 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-17 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-18 PM STRENGTH_LOWER_B 28min: glute-bridge 4x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; bent-knee-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-18 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-19 PM STRENGTH_UPPER_B 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-19 PM RUN WALK 20min (WALK) | d4 2026-12-20 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 9 (TAPER): d0 2027-02-10 PM STRENGTH_LOWER 23min: box-squat-bodyweight 1x16 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x16 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d0 2027-02-10 PM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d1 2027-02-11 PM STRENGTH_UPPER 16min: incline-push-up 1x16 RIR3 BW; prone-ytw-raise 1x16 RIR3 BW; dead-bug 1x14 RIR3 BW | d1 2027-02-11 PM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d2 2027-02-12 PM STRENGTH_LOWER_B 21min: glute-bridge 2x10 RIR3 BW; reverse-lunge 1x16 RIR3 BW; bent-knee-calf-raise 1x16 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2027-02-12 PM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d3 2027-02-13 PM STRENGTH_UPPER_B 12min: incline-push-up 1x16 RIR4 BW | d3 2027-02-13 PM RUN WALK 20min (WALK) | d4 STRENGTH REST_BY_DESIGN
- Week 10 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2027-02-17 PM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d1 STRENGTH REST_BY_DESIGN | d1 2027-02-18 PM RUN WALK 20min (WALK) | d2 STRENGTH REST_BY_DESIGN | d2 2027-02-19  RUN RACE 150min (RACE, completion) | d3 STRENGTH REST_BY_DESIGN | d3 RUN REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":16,"asOf":"2026-12-13","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-25"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-03-25"},"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":348,"longestRunMinutes":27,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":40,"strengthMinutes":26,"longRunDay":6,"longRunMinutes":61,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d3 2026-12-16 AM RUN EASY 27min (EASY) | d4 2026-12-17 AM RUN EASY 27min (EASY) | d5 2026-12-18 AM RUN EASY 27min (EASY) | d6 2026-12-19 AM RUN LONG 25min (LONG)
- Week 1 (BUILD): d3 2026-12-23 AM RUN EASY 27min (EASY) | d4 2026-12-24 AM RUN EASY 27min (EASY) | d5 2026-12-25 AM RUN EASY 27min (EASY) | d6 2026-12-26 AM RUN LONG 30min (LONG)
- Week 13 (TAPER): d3 2027-03-17 AM RUN QUALITY 25min (THRESHOLD 2x4'/2') | d4 2027-03-18 AM RUN EASY 20min (EASY +strides) | d5 2027-03-19 AM RUN EASY 15min (EASY) | d6 2027-03-20 AM RUN RACE_TOUCH 28min (RACE_TOUCH 2x5'/3')
- Week 14 (RACE_WEEK): d3 2027-03-24 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d4 2027-03-25  RUN RACE 150min (RACE, completion) | d5 RUN REST_BY_DESIGN | d6 2027-03-27 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

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

## R7D-G203

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-23","weeks":8,"asOf":"2026-12-20","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4],"strengthDays":[0,1],"runTurn":"AM","strengthTurn":"PM","runMinutes":63,"strengthMinutes":52,"longRunDay":4,"longRunMinutes":92,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-23 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-12-23 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-24 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-24 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-26 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-27 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-30 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-30 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-31 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-31 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-02 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-03 AM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-30","weeks":8,"asOf":"2026-12-29","tz":0,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":105,"longestRunMinutes":72,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","RACK","BODYWEIGHT","DUMBBELLS","BANDS","MACHINES","KETTLEBELL","BENCH","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,2,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":44,"strengthMinutes":48,"sameTurnConfirmed":true}}`

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

## R7D-G205

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-03","weeks":12,"asOf":"2026-12-03","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":5,"runMinutesPerWeek":290,"longestRunMinutes":72,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x6 0KG BODYWEIGHT"],"equipment":["RACK","BODYWEIGHT","DUMBBELLS","MACHINES","BANDS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,4,5,6],"strengthDays":[0,3,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":62,"strengthMinutes":70,"longRunDay":2,"longRunMinutes":52,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-03 PM STRENGTH_LOWER 31min: box-squat-bodyweight 5x6 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-04 PM RUN EASY 55min (EASY) | d2 2026-12-05 PM RUN LONG 52min (LONG) | d3 2026-12-06 PM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; machine-chest-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2026-12-07 PM RUN EASY 55min (EASY) | d5 2026-12-08 PM RUN EASY 55min (EASY) | d6 2026-12-09 PM RUN EASY 55min (EASY) | d6 2026-12-09 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-10 PM STRENGTH_LOWER 33min: box-squat-bodyweight 5x8 RIR3 BW; glute-bridge 2x12 RIR3 BW; reverse-lunge 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d1 2026-12-11 PM RUN EASY 55min (EASY) | d2 2026-12-12 PM RUN LONG 52min (LONG) | d3 2026-12-13 PM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; machine-chest-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d4 2026-12-14 PM RUN EASY 55min (EASY) | d5 2026-12-15 PM RUN EASY 55min (EASY) | d6 2026-12-16 PM RUN EASY 55min (EASY) | d6 2026-12-16 PM STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW

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

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-29","weeks":8,"asOf":"2026-11-28","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-12"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-01-12"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":210,"longestRunMinutes":92,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","RACK","MACHINES","BODYWEIGHT","KETTLEBELL","PULL_UP_BAR","BANDS","DUMBBELLS","BENCH"],"pause":{"nonclinical":true,"weeks":10,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4],"strengthDays":[0,1,3,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":49,"strengthMinutes":20,"longRunDay":3,"longRunMinutes":56,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-29 PM STRENGTH_LOWER 19min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish | d1 2026-11-30 PM STRENGTH_UPPER 19min: db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish | d3 2026-12-02 PM STRENGTH_UPPER_B 19min: db-row 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish | d3 2026-12-02 PM RUN EASY 15min (EASY) | d4 2026-12-03 PM RUN EASY 15min (EASY) | d5 2026-12-04 PM STRENGTH_LOWER_B 19min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish
- Week 1 (BUILD): d0 2026-12-06 PM STRENGTH_LOWER 19min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged | d1 2026-12-07 PM STRENGTH_UPPER 19min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d3 2026-12-09 PM STRENGTH_UPPER_B 19min: db-row 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged | d3 2026-12-09 PM RUN EASY 20min (EASY) | d4 2026-12-10 PM RUN EASY 20min (EASY) | d5 2026-12-11 PM STRENGTH_LOWER_B 19min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x8 RIR3 last logged
- Week 5 (TAPER): d0 2027-01-03 PM STRENGTH_LOWER 19min: goblet-squat 2x8 RIR3 last logged; db-rdl 2x8 RIR3 last logged | d1 2027-01-04 PM STRENGTH_UPPER 19min: db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d3 2027-01-06 PM STRENGTH_UPPER_B 14min: db-row 1x8 RIR4 last logged; db-bench-press 1x8 RIR4 last logged | d3 2027-01-06 PM RUN EASY 15min (EASY) | d4 2027-01-07 PM RUN EASY 15min (EASY) | d5 STRENGTH REST_BY_DESIGN
- Week 6 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 2027-01-12  RUN RACE 150min (RACE, completion) | d3 STRENGTH REST_BY_DESIGN | d3 RUN REST_BY_DESIGN | d4 2027-01-14 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d5 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-19","weeks":16,"asOf":"2026-12-18","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-07"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-04-07"},"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["kb-goblet-squat 4x10 11KG SINGLE_IMPLEMENT","glute-bridge 4x8 0KG BODYWEIGHT","reverse-lunge 4x5 0KG BODYWEIGHT"],"equipment":["KETTLEBELL","BANDS","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":34,"strengthMinutes":32,"longRunDay":1,"longRunMinutes":62,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-19 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-20 PM RUN WALK 20min (WALK) | d2 2026-12-21 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-22 PM RUN WALK 20min (WALK) | d5 2026-12-24 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-12-26 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-27 PM RUN WALK 20min (WALK) | d2 2026-12-28 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-29 PM RUN WALK 20min (WALK) | d5 2026-12-31 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 14 (TAPER): d0 2027-03-27 PM RUN EASY 20min (EASY +strides) | d1 2027-03-28 PM RUN EASY 20min (EASY +strides) | d2 2027-03-29 PM RUN EASY 20min (EASY +strides) | d3 2027-03-30 PM RUN EASY 20min (EASY +strides) | d5 2027-04-01 PM RUN WALK 20min (WALK)
- Week 15 (RACE_WEEK): d0 2027-04-03 PM RUN EASY 15min (EASY) | d1 2027-04-04 PM RUN EASY 15min (EASY) | d2 2027-04-05 PM RUN EASY 15min (EASY) | d3 2027-04-06 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d4 2027-04-07  RUN RACE 150min (RACE, completion) | d5 RUN REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":12,"asOf":"2027-01-03","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":255,"longestRunMinutes":141,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 4x12 87KG TOTAL","barbell-rdl 3x6 71KG TOTAL","db-split-squat 2x5 28KG PER_HAND"],"equipment":["RACK","BODYWEIGHT","MACHINES","BANDS","DUMBBELLS","PULL_UP_BAR","BARBELL","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5,6],"strengthDays":[1,2,3,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":30,"strengthMinutes":39,"longRunDay":2,"longRunMinutes":68,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-05 PM RUN EASY 30min (EASY) | d1 2027-01-06 PM STRENGTH_UPPER 24min: incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-floor-press 1x10 RIR3 establish; db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2027-01-06 PM RUN EASY 30min (EASY) | d2 2027-01-07 PM STRENGTH_UPPER_B 20min: band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-01-07 PM RUN LONG 68min (LONG) | d3 2027-01-08 PM STRENGTH_LOWER 26min: goblet-squat 2x8 RIR3 establish; barbell-rdl 3x6 RIR3 71kg TOTAL; reverse-lunge 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish | d3 2027-01-08 PM RUN EASY 30min (EASY) | d4 2027-01-09 PM STRENGTH_LOWER_B 24min: barbell-rdl 3x6 RIR3 71kg TOTAL; reverse-lunge 2x8 RIR3 BW; seated-calf-raise-db 1x10 RIR3 establish; tibialis-raise 1x10 RIR3 BW | d5 2027-01-10 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d5 2027-01-10 PM RUN EASY 30min (EASY) | d6 2027-01-11 PM RUN EASY 30min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-12 PM RUN EASY 30min (EASY) | d1 2027-01-13 PM STRENGTH_UPPER 24min: incline-push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW; db-floor-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d1 2027-01-13 PM RUN EASY 30min (EASY) | d2 2027-01-14 PM STRENGTH_UPPER_B 21min: band-row 2x10 RIR3 BW; incline-push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-14 PM RUN LONG 68min (LONG) | d3 2027-01-15 PM STRENGTH_LOWER 26min: goblet-squat 2x8 RIR3 last logged; barbell-rdl 3x8 RIR3 71kg TOTAL; reverse-lunge 1x12 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; hip-abduction-machine 1x10 RIR3 last logged | d3 2027-01-15 PM RUN EASY 30min (EASY) | d4 2027-01-16 PM STRENGTH_LOWER_B 25min: barbell-rdl 3x8 RIR3 71kg TOTAL; reverse-lunge 2x12 RIR3 BW; seated-calf-raise-db 1x10 RIR3 last logged; tibialis-raise 1x12 RIR3 BW | d5 2027-01-17 PM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; front-plank 1x12 RIR3 BW | d5 2027-01-17 PM RUN EASY 30min (EASY) | d6 2027-01-18 PM RUN EASY 30min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-17","weeks":12,"asOf":"2026-12-15","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":57,"longestRunMinutes":37,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["goblet-squat 2x6 19KG PER_HAND","db-rdl 5x12 27KG PER_HAND"],"equipment":["DUMBBELLS","BODYWEIGHT","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4,5,6],"strengthDays":[2,3,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":72,"strengthMinutes":43,"longRunDay":4,"longRunMinutes":47,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-17 PM RUN EASY 15min (EASY) | d1 2026-12-18 PM RUN EASY 15min (EASY) | d2 2026-12-19 AM STRENGTH_LOWER 31min: goblet-squat 2x6 RIR3 19kg PER_HAND; db-rdl 5x8 RIR3 27kg PER_HAND; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-20 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d4 2026-12-21 PM RUN LONG 20min (LONG) | d5 2026-12-22 PM RUN WALK 20min (WALK) | d5 2026-12-22 AM STRENGTH_LOWER_B 30min: db-rdl 5x8 RIR3 27kg PER_HAND; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-23 PM RUN WALK 20min (WALK) | d6 2026-12-23 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-24 PM RUN EASY 15min (EASY) | d1 2026-12-25 PM RUN EASY 15min (EASY) | d2 2026-12-26 AM STRENGTH_LOWER 31min: goblet-squat 2x6 RIR3 19kg PER_HAND; db-rdl 5x8 RIR3 27kg PER_HAND; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-27 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2026-12-28 PM RUN LONG 20min (LONG) | d5 2026-12-29 PM RUN WALK 20min (WALK) | d5 2026-12-29 AM STRENGTH_LOWER_B 30min: db-rdl 5x8 RIR3 27kg PER_HAND; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-30 PM RUN WALK 20min (WALK) | d6 2026-12-30 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":8,"asOf":"2026-12-23","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"MARATHON","date":"2027-02-13"}},"strength":"HYPERTROPHY"},"event":{"kind":"MARATHON","date":"2027-02-13"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":102,"longestRunMinutes":31,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x12 0KG BODYWEIGHT","glute-bridge 2x8 0KG BODYWEIGHT","reverse-lunge 3x6 0KG BODYWEIGHT"],"equipment":["BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4],"strengthDays":[1,2,3,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":55,"strengthMinutes":68,"longRunDay":4,"longRunMinutes":80,"sameTurnConfirmed":true}}`

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

## R7D-G211

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-29","weeks":12,"asOf":"2026-12-26","tz":0,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":188,"longestRunMinutes":80,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":9,"reasonCategory":"TRAVEL"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,5,6],"strengthDays":[4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":80,"strengthMinutes":29,"longRunDay":6,"longRunMinutes":150,"sameTurnConfirmed":false}}`

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

## R7D-G212

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":8,"asOf":"2026-12-10","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":90,"longestRunMinutes":28,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","MACHINES","DUMBBELLS","BARBELL","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,2,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":51,"strengthMinutes":62,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-13 AM STRENGTH_LOWER 28min: goblet-squat 2x5 RIR3 establish; db-rdl 2x5 RIR3 establish; db-split-squat 2x7 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2026-12-14 AM STRENGTH_UPPER 28min: db-floor-press 2x5 RIR3 establish; db-row 2x5 RIR3 establish; machine-chest-press 2x7 RIR3 establish; seated-cable-row 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2026-12-15 AM STRENGTH_LOWER_B 25min: db-rdl 2x5 RIR3 establish; db-split-squat 2x5 RIR3 establish; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d4 2026-12-17 AM STRENGTH_UPPER_B 22min: db-row 2x5 RIR3 establish; db-floor-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2026-12-19 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-20 AM STRENGTH_LOWER 34min: goblet-squat 3x5 RIR3 last logged; db-rdl 3x5 RIR3 last logged; db-split-squat 2x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d1 2026-12-21 AM STRENGTH_UPPER 34min: db-floor-press 3x5 RIR3 last logged; db-row 3x5 RIR3 last logged; machine-chest-press 2x7 RIR3 last logged; seated-cable-row 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d2 2026-12-22 AM STRENGTH_LOWER_B 31min: db-rdl 3x5 RIR3 last logged; db-split-squat 3x7 RIR3 last logged; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d4 2026-12-24 AM STRENGTH_UPPER_B 28min: db-row 3x5 RIR3 last logged; db-floor-press 3x5 RIR3 last logged; dead-bug 2x7 RIR3 BW | d6 2026-12-26 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 last logged; front-plank 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-31","weeks":8,"asOf":"2026-12-28","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":106,"longestRunMinutes":63,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,4],"strengthDays":[0,1,2,3],"runTurn":"PM","strengthTurn":"PM","runMinutes":58,"strengthMinutes":54,"longRunDay":4,"longRunMinutes":31,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-31 PM STRENGTH_LOWER 28min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2027-01-01 PM STRENGTH_UPPER 23min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2027-01-02 PM RUN EASY 58min (EASY) | d2 2027-01-02 PM STRENGTH_LOWER_B 25min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2027-01-03 PM STRENGTH_UPPER_B 20min: push-up 2x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2027-01-04 PM RUN LONG 31min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-01-07 PM STRENGTH_LOWER 34min: box-squat-bodyweight 3x5 RIR3 BW; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2027-01-08 PM STRENGTH_UPPER 26min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2027-01-09 PM RUN EASY 58min (EASY) | d2 2027-01-09 PM STRENGTH_LOWER_B 31min: glute-bridge 3x5 RIR3 BW; reverse-lunge 3x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2027-01-10 PM STRENGTH_UPPER_B 23min: push-up 3x5 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2027-01-11 PM RUN LONG 31min (LONG)

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-01","weeks":4,"asOf":"2026-12-30","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":102,"longestRunMinutes":64,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0,3],"runTurn":"PM","strengthTurn":"PM","runMinutes":22,"strengthMinutes":24,"longRunDay":3,"longRunMinutes":104,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-01 PM RUN EASY 15min (EASY) | d0 2027-01-01 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2027-01-02 PM RUN EASY 15min (EASY) | d2 2027-01-03 PM RUN WALK 20min (WALK) | d3 2027-01-04 PM RUN LONG 35min (LONG) | d3 2027-01-04 PM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d4 2027-01-05 PM RUN WALK 20min (WALK) | d6 2027-01-07 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-08 PM RUN EASY 15min (EASY) | d0 2027-01-08 PM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d1 2027-01-09 PM RUN EASY 15min (EASY) | d2 2027-01-10 PM RUN WALK 20min (WALK) | d3 2027-01-11 PM RUN LONG 35min (LONG) | d3 2027-01-11 PM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d4 2027-01-12 PM RUN WALK 20min (WALK) | d6 2027-01-14 PM RUN EASY 15min (EASY)

**Automated properties.** no failure

**Metamorphic.** no violation

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":4,"asOf":"2026-12-07","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":112,"longestRunMinutes":148,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[2,3,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":49,"strengthMinutes":41,"longRunDay":2,"longRunMinutes":147,"sameTurnConfirmed":true}}`

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

## R7D-G216

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, OUT_OF_SCOPE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":4,"asOf":"2026-11-23","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":102,"longestRunMinutes":83,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[0,1,4],"strengthDays":[1,2,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":38,"strengthMinutes":30,"longRunDay":4,"longRunMinutes":84,"sameTurnConfirmed":true}}`

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

## R7D-G217

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":4,"asOf":"2026-12-09","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-08"}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2027-01-08"},"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":250,"longestRunMinutes":74,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x5 0KG BODYWEIGHT","glute-bridge 5x6 0KG BODYWEIGHT"],"equipment":["BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[4,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":85,"strengthMinutes":44,"longRunDay":3,"longRunMinutes":44,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · SPECIFIC · SPECIFIC · RACE_WEEK
- Week 0 (BUILD): d3 2026-12-15 AM RUN LONG 44min (LONG) | d4 2026-12-16 PM STRENGTH_FULL_A 27min: box-squat-bodyweight 2x5 RIR3 BW; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-18 PM STRENGTH_FULL_B 34min: glute-bridge 5x6 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (SPECIFIC): d3 2026-12-22 AM RUN LONG 44min (LONG) | d4 2026-12-23 PM STRENGTH_FULL_A 20min: box-squat-bodyweight 1x5 RIR3 BW; incline-push-up 1x10 RIR3 BW; band-row 1x8 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-25 PM STRENGTH_FULL_B 27min: glute-bridge 4x6 RIR3 BW; band-row 1x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 2 (SPECIFIC): d3 2026-12-29 AM RUN LONG 44min (LONG) | d4 2026-12-30 PM STRENGTH_FULL_A 20min: box-squat-bodyweight 1x5 RIR3 BW; incline-push-up 1x10 RIR3 BW; band-row 1x8 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-01 PM STRENGTH_FULL_B 27min: glute-bridge 4x6 RIR3 BW; band-row 1x8 RIR3 BW; incline-push-up 1x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 3 (RACE_WEEK): d3 2027-01-05 AM RUN EASY 15min (EASY) | d4 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN | d6 2027-01-08  RUN RACE 75min (RACE)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":8,"asOf":"2026-11-27","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"MARATHON","date":"2027-01-15"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"MARATHON","date":"2027-01-15"},"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["back-squat 2x6 104KG TOTAL"],"equipment":["PULL_UP_BAR","KETTLEBELL","DUMBBELLS","RACK","BANDS","BODYWEIGHT","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,6],"strengthDays":[0,2,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":74,"strengthMinutes":58,"longRunDay":0,"longRunMinutes":100,"sameTurnConfirmed":true}}`

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

## R7D-G219

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-01","weeks":16,"asOf":"2026-12-29","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":162,"longestRunMinutes":59,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[0],"runTurn":"PM","strengthTurn":"AM","runMinutes":76,"strengthMinutes":61,"longRunDay":5,"longRunMinutes":129,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-01 PM RUN EASY 25min (EASY) | d0 2027-01-01 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2027-01-02 PM RUN EASY 25min (EASY) | d2 2027-01-03 PM RUN EASY 25min (EASY) | d3 2027-01-04 PM RUN EASY 25min (EASY) | d5 2027-01-06 PM RUN LONG 55min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-01-08 PM RUN EASY 25min (EASY) | d0 2027-01-08 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2027-01-09 PM RUN EASY 25min (EASY) | d2 2027-01-10 PM RUN EASY 25min (EASY) | d3 2027-01-11 PM RUN EASY 25min (EASY) | d5 2027-01-13 PM RUN LONG 55min (LONG)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":8,"asOf":"2027-01-04","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":60,"longestRunMinutes":109,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","RACK","DUMBBELLS","KETTLEBELL","PULL_UP_BAR","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5,6],"strengthDays":[2,3,4,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":47,"strengthMinutes":51,"longRunDay":6,"longRunMinutes":34,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-04 PM RUN WALK 20min (WALK) | d1 2027-01-05 PM RUN EASY 15min (EASY) | d2 2027-01-06 PM STRENGTH_LOWER 29min: goblet-squat 2x8 RIR3 establish; db-rdl 2x8 RIR3 establish; db-split-squat 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2027-01-07 PM STRENGTH_LOWER_B 26min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d3 2027-01-07 PM RUN EASY 15min (EASY) | d4 2027-01-08 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d4 2027-01-08 PM RUN WALK 20min (WALK) | d5 2027-01-09 PM STRENGTH_UPPER 29min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2027-01-09 PM RUN WALK 20min (WALK) | d6 2027-01-10 PM STRENGTH_UPPER_B 22min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-overhead-triceps-extension 2x10 RIR3 establish | d6 2027-01-10 PM RUN LONG 20min (LONG)
- Week 1 (DEVELOPMENT): d0 2027-01-11 PM RUN WALK 20min (WALK) | d1 2027-01-12 PM RUN EASY 15min (EASY) | d2 2027-01-13 PM STRENGTH_LOWER 34min: goblet-squat 3x8 RIR3 last logged; db-rdl 3x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d3 2027-01-14 PM STRENGTH_UPPER 34min: db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d3 2027-01-14 PM RUN EASY 15min (EASY) | d4 2027-01-15 PM STRENGTH_LOWER_B 31min: db-rdl 3x8 RIR3 last logged; db-split-squat 3x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x10 RIR3 BW | d4 2027-01-15 PM RUN WALK 20min (WALK) | d5 2027-01-16 PM STRENGTH_UPPER_B 27min: db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-overhead-triceps-extension 2x10 RIR3 last logged | d5 2027-01-16 PM RUN WALK 20min (WALK) | d6 2027-01-17 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 last logged; front-plank 2x10 RIR3 BW | d6 2027-01-17 PM RUN LONG 20min (LONG)

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

**Tags.** COLD_START, H12, NON_RACE, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":12,"asOf":"2026-11-09","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":48,"longestRunMinutes":64,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x6 0KG BODYWEIGHT","glute-bridge 2x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":69,"strengthMinutes":66,"sameTurnConfirmed":false}}`

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

## R7D-G222

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":4,"asOf":"2026-11-21","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":46,"longestRunMinutes":31,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,5],"strengthDays":[0,1,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":74,"strengthMinutes":69,"longRunDay":0,"longRunMinutes":64,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-21 AM RUN LONG 20min (LONG) | d0 2026-11-21 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-22 AM RUN WALK 20min (WALK) | d1 2026-11-22 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-11-26 AM RUN EASY 25min (EASY) | d5 2026-11-26 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-11-27 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-28 AM RUN LONG 20min (LONG) | d0 2026-11-28 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-29 AM RUN WALK 20min (WALK) | d1 2026-11-29 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-03 AM RUN EASY 25min (EASY) | d5 2026-12-03 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-12-04 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

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

## R7D-G223

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":16,"asOf":"2026-11-19","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":74,"longestRunMinutes":72,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 2x12 32KG TOTAL"],"equipment":["RACK","DUMBBELLS","BODYWEIGHT","PULL_UP_BAR","MACHINES","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5,6],"strengthDays":[0,1,2],"runTurn":"AM","strengthTurn":"AM","runMinutes":77,"strengthMinutes":46,"longRunDay":6,"longRunMinutes":142,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-21 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 establish; kb-deadlift 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-22 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; machine-chest-press 1x10 RIR3 establish; seated-cable-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-11-23 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-11-26 AM RUN WALK 20min (WALK) | d6 2026-11-27 AM RUN LONG 70min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-28 AM STRENGTH_LOWER 24min: goblet-squat 2x8 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-11-29 AM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged; seated-cable-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d2 2026-11-30 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-03 AM RUN WALK 20min (WALK) | d6 2026-12-04 AM RUN LONG 70min (LONG)

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-02","weeks":12,"asOf":"2026-12-02","tz":-180,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-21"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-02-21"},"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":46,"longestRunMinutes":59,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","MACHINES","BANDS","DUMBBELLS","BARBELL","PULL_UP_BAR","KETTLEBELL","BENCH","RACK"],"pause":{"nonclinical":true,"weeks":3,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,1],"runTurn":"AM","strengthTurn":"PM","runMinutes":72,"strengthMinutes":53,"longRunDay":0,"longRunMinutes":104,"sameTurnConfirmed":false}}`

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

## R7D-G225

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":4,"asOf":"2026-12-11","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-04"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-01-04"},"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BENCH","DUMBBELLS","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3,4,5],"strengthDays":[0,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":66,"strengthMinutes":25,"longRunDay":4,"longRunMinutes":72,"sameTurnConfirmed":true}}`

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

## R7D-G226

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":16,"asOf":"2027-01-04","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-16"}},"strength":"NONE"},"event":{"kind":"HALF_MARATHON","date":"2027-04-16"},"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":348,"longestRunMinutes":61,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4,5,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":25,"strengthMinutes":53,"longRunDay":5,"longRunMinutes":138,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2027-01-05 AM RUN EASY 25min (EASY) | d4 2027-01-09 AM RUN EASY 25min (EASY) | d5 2027-01-10 AM RUN LONG 60min (LONG) | d6 2027-01-11 AM RUN EASY 25min (EASY)
- Week 1 (BUILD): d0 2027-01-12 AM RUN EASY 25min (EASY) | d4 2027-01-16 AM RUN EASY 25min (EASY) | d5 2027-01-17 AM RUN LONG 60min (LONG) | d6 2027-01-18 AM RUN EASY 25min (EASY)
- Week 13 (TAPER): d0 2027-04-06 AM RUN EASY 20min (EASY +strides) | d4 2027-04-10 AM RUN EASY 15min (EASY) | d5 2027-04-11 AM RUN EASY 15min (EASY) | d6 2027-04-12 AM RUN EASY 15min (EASY)
- Week 14 (RACE_WEEK): d0 2027-04-13 AM RUN EASY 15min (EASY) | d3 2027-04-16  RUN RACE 150min (RACE, completion) | d4 RUN REST_BY_DESIGN | d5 2027-04-18 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d6 2027-04-19 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_HALF, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-28","weeks":4,"asOf":"2026-12-25","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-24"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-01-24"},"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":48,"longestRunMinutes":19,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5,6],"strengthDays":[1],"runTurn":"AM","strengthTurn":"PM","runMinutes":22,"strengthMinutes":68,"longRunDay":3,"longRunMinutes":144,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-28 AM RUN EASY 15min (EASY) | d1 2026-12-29 AM RUN EASY 15min (EASY) | d1 2026-12-29 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-12-30 AM RUN WALK 20min (WALK) | d3 2026-12-31 AM RUN LONG 15min (LONG) | d5 2027-01-02 AM RUN WALK 20min (WALK) | d6 2027-01-03 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2027-01-04 AM RUN EASY 15min (EASY) | d1 2027-01-05 AM RUN EASY 15min (EASY) | d1 2027-01-05 PM STRENGTH_FULL_A 29min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d2 2027-01-06 AM RUN WALK 20min (WALK) | d3 2027-01-07 AM RUN LONG 15min (LONG) | d5 2027-01-09 AM RUN WALK 20min (WALK) | d6 2027-01-10 AM RUN WALK 20min (WALK)
- Week 2 (SPECIFIC): d0 2027-01-11 AM RUN EASY 15min (EASY) | d1 2027-01-12 AM RUN EASY 15min (EASY) | d1 2027-01-12 PM STRENGTH_FULL_A 36min: box-squat-bodyweight 3x10 RIR3 BW; incline-push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d2 2027-01-13 AM RUN WALK 20min (WALK) | d3 2027-01-14 AM RUN LONG 20min (LONG) | d5 2027-01-16 AM RUN WALK 20min (WALK) | d6 2027-01-17 AM RUN WALK 20min (WALK)
- Week 3 (RACE_WEEK): d0 2027-01-18 AM RUN EASY 15min (EASY) | d1 2027-01-19 AM RUN EASY 15min (EASY) | d1 2027-01-19 PM STRENGTH_FULL_A 14min: box-squat-bodyweight 1x10 RIR4 BW; incline-push-up 1x10 RIR4 BW | d2 2027-01-20 AM RUN WALK 20min (WALK) | d3 2027-01-21 AM RUN EASY 15min (EASY) | d5 2027-01-23 AM RUN WALK 20min (WALK) | d6 2027-01-24  RUN RACE 150min (RACE, completion)

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-19","weeks":4,"asOf":"2026-12-17","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-11"}},"strength":"STRENGTH"},"event":{"kind":"HALF_MARATHON","date":"2027-01-11"},"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BANDS"],"pause":{"nonclinical":true,"weeks":2,"reasonCategory":"FAMILY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3,4,5,6],"strengthDays":[4],"runTurn":"AM","strengthTurn":"AM","runMinutes":48,"strengthMinutes":65,"longRunDay":0,"longRunMinutes":77,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-12-19 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-22 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2026-12-23 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d4 2026-12-23 AM RUN WALK 20min (WALK) | d5 2026-12-24 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-25 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-12-26 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-29 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2026-12-30 AM STRENGTH_FULL_A 30min: box-squat-bodyweight 2x5 RIR3 BW; incline-push-up 2x5 RIR3 BW; band-row 2x5 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-30 AM RUN WALK 20min (WALK) | d5 2026-12-31 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-01 AM RUN WALK 20min (WALK)
- Week 2 (SPECIFIC): d0 2027-01-02 AM RUN WALK_JOG 23min (WALK_JOG 5x(60s jog/120s walk)) | d3 2027-01-05 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-06 AM STRENGTH_FULL_A 16min: box-squat-bodyweight 1x7 RIR4 BW; incline-push-up 1x7 RIR4 BW; band-row 1x6 RIR4 BW | d4 2027-01-06 AM RUN WALK 20min (WALK) | d5 2027-01-07 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-08 AM RUN WALK 20min (WALK)
- Week 3 (RACE_WEEK): d0 2027-01-09 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2027-01-11  RUN RACE 150min (RACE, completion) | d3 RUN REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d4 2027-01-13 AM RUN WALK 20min (WALK) | d5 2027-01-14 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-15 AM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, CLINICAL_SIGNAL · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":16,"asOf":"2026-12-10","tz":330,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-02"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-04-02"},"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":354,"longestRunMinutes":50,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","RACK","PULL_UP_BAR","KETTLEBELL","BARBELL","MACHINES","BANDS","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[6],"strengthDays":[2,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":27,"strengthMinutes":42,"longRunDay":6,"longRunMinutes":42,"sameTurnConfirmed":true}}`

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

## R7D-G230

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, CLINICAL_SIGNAL, OUT_OF_SCOPE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":12,"asOf":"2026-12-08","tz":60,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-25"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-02-25"},"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x8 0KG BODYWEIGHT","glute-bridge 4x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":15,"specialPopulation":null,"schedule":{"runDays":[3,4,6],"strengthDays":[6],"runTurn":"PM","strengthTurn":"AM","runMinutes":66,"strengthMinutes":32,"longRunDay":6,"longRunMinutes":53,"sameTurnConfirmed":false}}`

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

## R7D-G231

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-07","weeks":8,"asOf":"2027-01-07","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"MAINTAIN"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":31,"longestRunMinutes":32,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1],"runTurn":"PM","strengthTurn":"AM","runMinutes":67,"strengthMinutes":53,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-07 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2027-01-08 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-14 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2027-01-15 AM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW

**Automated properties.** no failure

**Metamorphic.** no violation

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

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-05","weeks":12,"asOf":"2026-12-03","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-20"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-02-20"},"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":138,"longestRunMinutes":25,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","RACK","PULL_UP_BAR","BANDS","BARBELL","DUMBBELLS","BODYWEIGHT","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,4,6],"strengthDays":[],"runTurn":"AM","strengthTurn":"PM","runMinutes":73,"strengthMinutes":29,"longRunDay":0,"longRunMinutes":78,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d0 2026-12-05 AM RUN LONG 25min (LONG) | d1 2026-12-06 AM RUN EASY 25min (EASY) | d4 2026-12-09 AM RUN EASY 25min (EASY) | d6 2026-12-11 AM RUN EASY 25min (EASY)
- Week 1 (BUILD): d0 2026-12-12 AM RUN LONG 30min (LONG) | d1 2026-12-13 AM RUN EASY 25min (EASY) | d4 2026-12-16 AM RUN EASY 25min (EASY) | d6 2026-12-18 AM RUN EASY 25min (EASY)
- Week 10 (TAPER): d0 2027-02-13 AM RUN LONG 40min (LONG) | d1 2027-02-14 AM RUN EASY 15min (EASY) | d4 2027-02-17 AM RUN EASY 15min (EASY) | d6 2027-02-19 AM RUN SHAKEOUT 15min (SHAKEOUT +strides)
- Week 11 (RACE_WEEK): d0 2027-02-20  RUN RACE 75min (RACE) | d1 RUN REST_BY_DESIGN | d4 2027-02-24 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 2027-02-26 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-22","weeks":8,"asOf":"2026-12-22","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BODYWEIGHT","MACHINES","RACK","BENCH","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":15,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":26,"strengthMinutes":70,"longRunDay":0,"longRunMinutes":115,"sameTurnConfirmed":false}}`

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

## R7D-G234

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, OUT_OF_SCOPE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":16,"asOf":"2026-12-11","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-26"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-03-26"},"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":17,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4],"strengthDays":[0,1,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":46,"strengthMinutes":41,"longRunDay":0,"longRunMinutes":103,"sameTurnConfirmed":false}}`

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

## R7D-G235

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":16,"asOf":"2026-12-19","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":204,"longestRunMinutes":57,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BARBELL","PULL_UP_BAR","DUMBBELLS","KETTLEBELL","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":15,"specialPopulation":null,"schedule":{"runDays":[6],"strengthDays":[2,3,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":72,"strengthMinutes":53,"longRunDay":6,"longRunMinutes":139,"sameTurnConfirmed":true}}`

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

## R7D-G236

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":12,"asOf":"2027-01-04","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":185,"longestRunMinutes":88,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x6 0KG BODYWEIGHT"],"equipment":["RACK","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[0,1,2,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":90,"strengthMinutes":37,"longRunDay":2,"longRunMinutes":79,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-06 PM RUN EASY 20min (EASY) | d0 2027-01-06 AM STRENGTH_LOWER 23min: box-squat-bodyweight 2x6 RIR3 BW; db-rdl 2x8 RIR3 establish; db-split-squat 1x10 RIR3 establish; db-calf-raise 1x10 RIR3 establish; side-lying-hip-abduction 1x10 RIR3 BW | d1 2027-01-07 PM RUN EASY 20min (EASY) | d1 2027-01-07 AM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-01-08 PM RUN LONG 79min (LONG) | d2 2027-01-08 AM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-09 PM RUN EASY 20min (EASY) | d4 2027-01-10 PM RUN EASY 20min (EASY) | d5 2027-01-11 PM RUN EASY 20min (EASY) | d5 2027-01-11 AM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 establish; db-split-squat 2x8 RIR3 establish; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d6 2027-01-12 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2027-01-13 PM RUN EASY 20min (EASY) | d0 2027-01-13 AM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; db-rdl 2x8 RIR3 last logged; db-split-squat 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; side-lying-hip-abduction 1x12 RIR3 BW | d1 2027-01-14 PM RUN EASY 20min (EASY) | d1 2027-01-14 AM STRENGTH_UPPER 24min: push-up 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 1x12 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-15 PM RUN LONG 79min (LONG) | d2 2027-01-15 AM STRENGTH_UPPER_B 21min: db-row 2x8 RIR3 last logged; push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-16 PM RUN EASY 20min (EASY) | d4 2027-01-17 PM RUN EASY 20min (EASY) | d5 2027-01-18 PM RUN EASY 20min (EASY) | d5 2027-01-18 AM STRENGTH_LOWER_B 22min: db-rdl 2x8 RIR3 last logged; db-split-squat 2x10 RIR3 last logged; bent-knee-calf-raise 1x12 RIR3 BW; tibialis-raise 1x12 RIR3 BW | d6 2027-01-19 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-14","weeks":12,"asOf":"2026-12-11","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":60,"longestRunMinutes":61,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","RACK","BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":6,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[1,2,3,4,5,6],"strengthDays":[1,2,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":62,"strengthMinutes":60,"longRunDay":2,"longRunMinutes":121,"sameTurnConfirmed":false}}`

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

## R7D-G238

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":16,"asOf":"2026-11-26","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-16"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-03-16"},"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES","KETTLEBELL","DUMBBELLS","BODYWEIGHT","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0,1,2,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":77,"strengthMinutes":64,"longRunDay":6,"longRunMinutes":109,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-28 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-11-28 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-29 AM RUN WALK 20min (WALK) | d1 2026-11-29 PM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-11-30 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-30 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-01 AM RUN WALK 20min (WALK) | d3 2026-12-01 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-12-02 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-04 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-12-05 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-05 PM STRENGTH_FULL_A 31min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2026-12-06 AM RUN WALK 20min (WALK) | d1 2026-12-06 PM STRENGTH_FULL_B 32min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-07 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-07 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d3 2026-12-08 AM RUN WALK 20min (WALK) | d3 2026-12-08 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d4 2026-12-09 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-11 AM RUN WALK 20min (WALK)
- Week 14 (TAPER): d0 2027-03-06 AM RUN EASY 25min (EASY +strides) | d0 2027-03-06 PM STRENGTH_LOWER 24min: goblet-squat 2x5 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; split-squat-bodyweight 1x10 RIR3 BW; single-leg-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d1 2027-03-07 AM RUN EASY 25min (EASY +strides) | d1 2027-03-07 PM STRENGTH_UPPER 24min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW; band-row 1x7 RIR3 BW; front-plank 1x10 RIR3 BW | d2 2027-03-08 AM RUN EASY 25min (EASY +strides) | d2 2027-03-08 PM STRENGTH_LOWER_B 23min: kb-deadlift 2x8 RIR3 last logged; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d3 2027-03-09 AM RUN EASY 25min (EASY +strides) | d3 2027-03-09 PM STRENGTH_UPPER_B 21min: db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; front-plank 1x10 RIR3 BW | d4 2027-03-10 AM RUN EASY 15min (EASY) | d6 2027-03-12 AM RUN WALK 20min (WALK)
- Week 15 (RACE_WEEK): d0 2027-03-13 AM RUN EASY 15min (EASY) | d0 2027-03-13 PM STRENGTH_LOWER 13min: goblet-squat 1x5 RIR4 last logged; kb-deadlift 1x8 RIR4 last logged | d1 2027-03-14 AM RUN EASY 15min (EASY) | d1 STRENGTH REST_BY_DESIGN | d2 2027-03-15 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d3 2027-03-16  RUN RACE 75min (RACE, completion) | d4 RUN REST_BY_DESIGN | d6 2027-03-19 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-14","weeks":12,"asOf":"2026-12-14","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 4x8 13KG PER_HAND","db-rdl 2x6 40KG TOTAL","reverse-lunge 2x8 0KG BODYWEIGHT"],"equipment":["BANDS","MACHINES","BENCH","BODYWEIGHT","KETTLEBELL","PULL_UP_BAR","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,6],"strengthDays":[1,2,3,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":55,"strengthMinutes":48,"longRunDay":4,"longRunMinutes":81,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-15 AM STRENGTH_LOWER 31min: goblet-squat 4x8 RIR3 13kg PER_HAND; kb-deadlift 2x10 RIR3 establish; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-16 AM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; machine-chest-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d2 2026-12-16 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-17 AM STRENGTH_LOWER_B 22min: kb-deadlift 2x10 RIR3 establish; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-17 AM RUN WALK 20min (WALK) | d4 2026-12-18 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2026-12-18 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-19 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2026-12-20 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d1 2026-12-22 AM STRENGTH_LOWER 31min: goblet-squat 4x8 RIR3 13kg PER_HAND; kb-deadlift 2x10 RIR3 last logged; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-23 AM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; machine-chest-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d2 2026-12-23 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-24 AM STRENGTH_LOWER_B 22min: kb-deadlift 2x10 RIR3 last logged; reverse-lunge 2x8 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-24 AM RUN WALK 20min (WALK) | d4 2026-12-25 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2026-12-25 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-26 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2026-12-27 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_10K, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-29","weeks":4,"asOf":"2026-11-27","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"MARATHON","date":"2026-12-21"}},"strength":"STRENGTH"},"event":{"kind":"MARATHON","date":"2026-12-21"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":102,"longestRunMinutes":74,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT","MACHINES","KETTLEBELL","DUMBBELLS","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,4],"strengthDays":[0,1,4,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":25,"strengthMinutes":59,"longRunDay":2,"longRunMinutes":90,"sameTurnConfirmed":true}}`

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

## R7D-G241

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-25","weeks":12,"asOf":"2026-11-24","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":96,"longestRunMinutes":146,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","PULL_UP_BAR","BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[2,3,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":74,"strengthMinutes":44,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d2 2026-11-27 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-11-28 AM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-30 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-01 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2026-12-04 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-05 AM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-07 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d6 2026-12-08 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-13","weeks":16,"asOf":"2026-12-12","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":220,"longestRunMinutes":88,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","KETTLEBELL","RACK","PULL_UP_BAR","BODYWEIGHT","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,5,6],"strengthDays":[0],"runTurn":"AM","strengthTurn":"AM","runMinutes":48,"strengthMinutes":47,"longRunDay":5,"longRunMinutes":110,"sameTurnConfirmed":false}}`

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

## R7D-G243

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-22","weeks":12,"asOf":"2026-11-20","tz":0,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-12"}},"strength":"GENERAL"},"event":{"kind":"10K","date":"2027-02-12"},"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":145,"longestRunMinutes":26,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":3,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,5],"strengthDays":[2,4,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":56,"strengthMinutes":34,"longRunDay":1,"longRunMinutes":30,"sameTurnConfirmed":false}}`

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

## R7D-G244

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-29","weeks":8,"asOf":"2026-11-27","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-20"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-01-20"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":46,"longestRunMinutes":83,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","RACK","KETTLEBELL","PULL_UP_BAR","BENCH","BANDS","DUMBBELLS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5],"strengthDays":[0,1,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":54,"strengthMinutes":50,"longRunDay":4,"longRunMinutes":65,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-29 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-30 AM RUN EASY 25min (EASY) | d1 2026-11-30 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-01 AM RUN WALK 20min (WALK) | d3 2026-12-02 AM RUN WALK 20min (WALK) | d4 2026-12-03 AM RUN LONG 20min (LONG) | d4 2026-12-03 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-04 AM RUN WALK 20min (WALK)
- Week 1 (BUILD): d0 2026-12-06 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d1 2026-12-07 AM STRENGTH_FULL_B 27min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-12-07 AM RUN EASY 25min (EASY) | d2 2026-12-08 AM RUN WALK 20min (WALK) | d3 2026-12-09 AM RUN WALK 20min (WALK) | d4 2026-12-10 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; db-calf-raise 1x12 RIR3 establish; front-plank 1x12 RIR3 BW | d4 2026-12-10 AM RUN LONG 20min (LONG) | d5 2026-12-11 AM RUN WALK 20min (WALK)
- Week 6 (TAPER): d0 2027-01-10 AM STRENGTH_LOWER 19min: goblet-squat 1x10 RIR3 last logged; kb-deadlift 1x8 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2027-01-11 AM STRENGTH_FULL_B 20min: kb-deadlift 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d1 2027-01-11 AM RUN EASY 20min (EASY +strides) | d2 2027-01-12 AM RUN EASY 20min (EASY +strides) | d3 2027-01-13 AM RUN WALK 20min (WALK) | d4 2027-01-14 AM STRENGTH_UPPER 14min: db-floor-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d4 2027-01-14 AM RUN EASY 15min (EASY) | d5 2027-01-15 AM RUN WALK 20min (WALK)
- Week 7 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d1 2027-01-18 AM RUN EASY 15min (EASY) | d2 2027-01-19 AM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d3 2027-01-20  RUN RACE 150min (RACE, completion) | d4 STRENGTH REST_BY_DESIGN | d4 RUN REST_BY_DESIGN | d5 2027-01-22 AM RUN RECOVERY_EASY 20min (RECOVERY_EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_10K, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-09","weeks":8,"asOf":"2026-11-08","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2026-12-23"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2026-12-23"},"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":147,"longestRunMinutes":46,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["back-squat 4x6 100KG TOTAL","db-rdl 3x10 8KG PER_HAND","reverse-lunge 5x12 0KG BODYWEIGHT"],"equipment":["BANDS","BARBELL","BODYWEIGHT","RACK","DUMBBELLS","BENCH","PULL_UP_BAR","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0,4],"runTurn":"PM","strengthTurn":"AM","runMinutes":58,"strengthMinutes":69,"longRunDay":3,"longRunMinutes":138,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-11-09 PM RUN EASY 20min (EASY) | d0 2026-11-09 AM STRENGTH_FULL_A 31min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2026-11-10 PM RUN EASY 20min (EASY) | d2 2026-11-11 PM RUN EASY 20min (EASY) | d3 2026-11-12 PM RUN LONG 45min (LONG) | d4 2026-11-13 PM RUN EASY 20min (EASY) | d4 2026-11-13 AM STRENGTH_FULL_B 34min: db-rdl 3x10 RIR3 8kg PER_HAND; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; leg-curl-machine 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish | d6 2026-11-15 PM RUN EASY 20min (EASY)
- Week 1 (BUILD): d0 2026-11-16 PM RUN EASY 20min (EASY) | d0 2026-11-16 AM STRENGTH_FULL_A 39min: goblet-squat 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; db-row 3x8 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d1 2026-11-17 PM RUN EASY 20min (EASY) | d2 2026-11-18 PM RUN EASY 20min (EASY) | d3 2026-11-19 PM RUN LONG 50min (LONG) | d4 2026-11-20 PM RUN EASY 20min (EASY) | d4 2026-11-20 AM STRENGTH_FULL_B 39min: db-rdl 3x12 RIR3 8kg PER_HAND; db-row 3x8 RIR3 last logged; db-floor-press 3x8 RIR3 last logged; leg-curl-machine 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged | d6 2026-11-22 PM RUN EASY 20min (EASY)
- Week 5 (TAPER): d0 2026-12-14 PM RUN EASY 20min (EASY +strides) | d0 2026-12-14 AM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 1x14 RIR3 BW | d1 2026-12-15 PM RUN EASY 20min (EASY +strides) | d2 2026-12-16 PM RUN EASY 20min (EASY +strides) | d3 2026-12-17 PM RUN EASY 15min (EASY) | d4 2026-12-18 PM RUN EASY 15min (EASY) | d4 2026-12-18 AM STRENGTH_FULL_B 16min: db-rdl 1x8 RIR4 10kg PER_HAND; db-row 1x8 RIR4 last logged; db-floor-press 1x8 RIR4 last logged | d6 2026-12-20 PM RUN EASY 15min (EASY)
- Week 6 (RACE_WEEK): d0 2026-12-21 PM RUN EASY 15min (EASY) | d0 STRENGTH REST_BY_DESIGN | d1 2026-12-22 PM RUN SHAKEOUT 15min (SHAKEOUT +strides) | d2 2026-12-23  RUN RACE 75min (RACE) | d3 RUN REST_BY_DESIGN | d4 2026-12-25 PM RUN RECOVERY_EASY 20min (RECOVERY_EASY) | d4 STRENGTH REST_BY_DESIGN | d6 2026-12-27 PM RUN RECOVERY_EASY 30min (RECOVERY_EASY)

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

## R7D-G246

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-01","weeks":16,"asOf":"2026-11-29","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-21"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-03-21"},"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":128,"longestRunMinutes":116,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","RACK","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2],"strengthDays":[2,3,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":58,"strengthMinutes":39,"longRunDay":2,"longRunMinutes":96,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d2 2026-12-03 AM RUN LONG 96min (LONG) | d2 2026-12-03 PM STRENGTH_LOWER 28min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-04 PM STRENGTH_UPPER 26min: push-up 2x5 RIR3 BW; scapular-pull-up 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-05 PM STRENGTH_LOWER_B 25min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW; bent-knee-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-06 PM STRENGTH_UPPER_B 20min: push-up 2x5 RIR3 BW; scapular-pull-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-07 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW
- Week 1 (BUILD): d2 2026-12-10 AM RUN LONG 96min (LONG) | d2 2026-12-10 PM STRENGTH_LOWER 34min: box-squat-bodyweight 3x5 RIR3 BW; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d3 2026-12-11 PM STRENGTH_UPPER 29min: push-up 3x5 RIR3 BW; scapular-pull-up 2x7 RIR3 BW; incline-push-up 2x7 RIR3 BW; prone-ytw-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d4 2026-12-12 PM STRENGTH_LOWER_B 31min: glute-bridge 3x5 RIR3 BW; reverse-lunge 3x7 RIR3 BW; bent-knee-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-13 PM STRENGTH_UPPER_B 23min: push-up 3x5 RIR3 BW; scapular-pull-up 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2026-12-14 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW
- Week 14 (TAPER): d2 2027-03-11 AM RUN LONG 58min (LONG) | d2 2027-03-11 PM STRENGTH_LOWER 25min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; split-squat-bodyweight 1x10 RIR3 BW; single-leg-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d3 2027-03-12 PM STRENGTH_UPPER 21min: push-up 2x10 RIR3 BW; scapular-pull-up 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d4 2027-03-13 PM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d5 2027-03-14 PM STRENGTH_UPPER_B 18min: push-up 2x10 RIR3 BW; scapular-pull-up 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 STRENGTH REST_BY_DESIGN
- Week 15 (RACE_WEEK): d2 2027-03-18 AM RUN EASY 15min (EASY) | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d5 2027-03-21  RUN RACE 75min (RACE) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-07","weeks":4,"asOf":"2027-01-06","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":112,"longestRunMinutes":48,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x10 0KG BODYWEIGHT","glute-bridge 2x8 0KG BODYWEIGHT","reverse-lunge 4x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[3],"strengthDays":[2,3,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":86,"strengthMinutes":61,"longRunDay":3,"longRunMinutes":119,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d2 2027-01-09 PM STRENGTH_UPPER 17min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-10 PM RUN LONG 45min (LONG) | d3 2027-01-10 PM STRENGTH_LOWER 37min: box-squat-bodyweight 5x10 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 4x8 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d4 2027-01-11 PM STRENGTH_LOWER_B 27min: glute-bridge 2x8 RIR3 BW; reverse-lunge 4x8 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d5 2027-01-12 PM STRENGTH_UPPER_B 17min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d2 2027-01-16 PM STRENGTH_UPPER 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2027-01-17 PM RUN LONG 50min (LONG) | d3 2027-01-17 PM STRENGTH_LOWER 37min: box-squat-bodyweight 5x6 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 4x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; side-lying-hip-abduction 1x12 RIR3 BW | d4 2027-01-18 PM STRENGTH_LOWER_B 28min: glute-bridge 2x10 RIR3 BW; reverse-lunge 4x10 RIR3 BW; bent-knee-calf-raise 1x12 RIR3 BW; tibialis-raise 1x12 RIR3 BW | d5 2027-01-19 PM STRENGTH_UPPER_B 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":16,"asOf":"2027-01-03","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":2,"runMinutesPerWeek":60,"longestRunMinutes":46,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["goblet-squat 5x10 38KG TOTAL","glute-bridge 5x5 0KG BODYWEIGHT","reverse-lunge 4x5 0KG BODYWEIGHT"],"equipment":["RACK","BODYWEIGHT","KETTLEBELL","PULL_UP_BAR","BENCH","DUMBBELLS","BARBELL","MACHINES","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4],"strengthDays":[1,3],"runTurn":"AM","strengthTurn":"AM","runMinutes":72,"strengthMinutes":24,"longRunDay":0,"longRunMinutes":39,"sameTurnConfirmed":true}}`

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

## R7D-G249

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-16","weeks":8,"asOf":"2026-12-16","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":235,"longestRunMinutes":30,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x5 0KG BODYWEIGHT","glute-bridge 4x8 0KG BODYWEIGHT"],"equipment":["RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,5,6],"strengthDays":[1,2,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":23,"strengthMinutes":69,"longRunDay":3,"longRunMinutes":64,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-12-17 AM STRENGTH_LOWER 33min: box-squat-bodyweight 4x5 RIR3 BW; glute-bridge 4x8 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-18 PM RUN EASY 23min (EASY) | d2 2026-12-18 AM STRENGTH_UPPER 17min: incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-19 PM RUN LONG 30min (LONG) | d5 2026-12-21 PM RUN EASY 23min (EASY) | d5 2026-12-21 AM STRENGTH_FULL_B 29min: glute-bridge 4x8 RIR3 BW; incline-push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-22 PM RUN EASY 23min (EASY)
- Week 1 (DEVELOPMENT): d1 2026-12-24 AM STRENGTH_LOWER 35min: box-squat-bodyweight 4x7 RIR3 BW; glute-bridge 4x10 RIR3 BW; reverse-lunge 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-12-25 PM RUN EASY 23min (EASY) | d2 2026-12-25 AM STRENGTH_UPPER 18min: incline-push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2026-12-26 PM RUN LONG 35min (LONG) | d5 2026-12-28 PM RUN EASY 23min (EASY) | d5 2026-12-28 AM STRENGTH_FULL_B 31min: glute-bridge 4x10 RIR3 BW; incline-push-up 2x12 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d6 2026-12-29 PM RUN EASY 23min (EASY)

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

## R7D-G250

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":12,"asOf":"2026-11-15","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":180,"longestRunMinutes":33,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","BENCH","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,4,6],"strengthDays":[0,1,2,3,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":86,"strengthMinutes":48,"longRunDay":6,"longRunMinutes":41,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-18 AM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 establish; db-rdl 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-19 AM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d2 2026-11-20 AM STRENGTH_LOWER_B 23min: db-rdl 2x10 RIR3 establish; db-split-squat 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-20 AM RUN EASY 33min (EASY) | d3 2026-11-21 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d4 2026-11-22 AM RUN EASY 33min (EASY) | d5 2026-11-23 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d6 2026-11-24 AM RUN LONG 30min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-25 AM STRENGTH_LOWER 25min: goblet-squat 2x10 RIR3 last logged; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-26 AM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d2 2026-11-27 AM STRENGTH_LOWER_B 23min: db-rdl 2x10 RIR3 last logged; db-split-squat 2x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-27 AM RUN EASY 33min (EASY) | d3 2026-11-28 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW | d4 2026-11-29 AM RUN EASY 33min (EASY) | d5 2026-11-30 AM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2026-12-01 AM RUN LONG 30min (LONG)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-19","weeks":16,"asOf":"2026-12-17","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-31"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-03-31"},"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":98,"longestRunMinutes":27,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[0,1,3,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":85,"strengthMinutes":71,"longRunDay":0,"longRunMinutes":124,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-19 PM RUN LONG 25min (LONG) | d0 2026-12-19 PM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d1 2026-12-20 PM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-22 PM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d4 2026-12-23 PM STRENGTH_UPPER_B 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-24 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-26 PM RUN LONG 25min (LONG) | d0 2026-12-26 PM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d1 2026-12-27 PM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-12-29 PM STRENGTH_LOWER_B 22min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; bent-knee-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d4 2026-12-30 PM STRENGTH_UPPER_B 17min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-31 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW
- Week 13 (TAPER): d0 2027-03-20 PM RUN LONG 45min (LONG) | d0 2027-03-20 PM STRENGTH_LOWER 20min: box-squat-bodyweight 1x14 RIR3 BW; glute-bridge 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; side-lying-hip-abduction 1x14 RIR3 BW | d1 2027-03-21 PM STRENGTH_UPPER 17min: push-up 1x14 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; incline-push-up 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2027-03-23 PM STRENGTH_LOWER_B 18min: glute-bridge 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; bent-knee-calf-raise 1x14 RIR3 BW; tibialis-raise 1x14 RIR3 BW | d4 2027-03-24 PM STRENGTH_UPPER_B 15min: push-up 1x14 RIR3 BW; prone-ytw-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d5 STRENGTH REST_BY_DESIGN
- Week 14 (RACE_WEEK): d0 2027-03-27 PM RUN EASY 15min (EASY) | d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d4 2027-03-31  RUN RACE 150min (RACE, completion) | d5 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":8,"asOf":"2027-01-06","tz":60,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-27"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-02-27"},"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":212,"longestRunMinutes":58,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["leg-press 5x8 98KG TOTAL"],"equipment":["BANDS","DUMBBELLS","BODYWEIGHT","KETTLEBELL","RACK","BENCH","PULL_UP_BAR","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":17,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[0,3,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":72,"strengthMinutes":38,"longRunDay":2,"longRunMinutes":126,"sameTurnConfirmed":true}}`

**Onboarding.** UNSUPPORTED: Outside the V1 coaching population or event scope: POPULATION_OUTSIDE_V1_AGE_RANGE · missing `["athlete.eligibility.currentNonclinicalAssessment"]`

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-08","weeks":4,"asOf":"2027-01-07","tz":-180,"learningConsent":false,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":51,"longestRunMinutes":27,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,4,5],"strengthDays":[2,3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":45,"strengthMinutes":57,"longRunDay":3,"longRunMinutes":38,"sameTurnConfirmed":true}}`

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

## R7D-G254

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-03","weeks":12,"asOf":"2026-12-31","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":125,"longestRunMinutes":70,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["leg-press 3x8 43KG TOTAL"],"equipment":["MACHINES","BENCH","PULL_UP_BAR","KETTLEBELL","RACK","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[5],"runTurn":"PM","strengthTurn":"PM","runMinutes":68,"strengthMinutes":23,"longRunDay":0,"longRunMinutes":150,"sameTurnConfirmed":false}}`

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

## R7D-G255

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-28","weeks":8,"asOf":"2026-11-25","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"HYPERTROPHY"},"event":null,"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","PULL_UP_BAR","KETTLEBELL","BENCH","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1],"runTurn":"AM","strengthTurn":"AM","runMinutes":70,"strengthMinutes":47,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-28 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-29 AM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; band-biceps-curl 2x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-05 AM STRENGTH_FULL_A 31min: kb-goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; kb-row 2x8 RIR3 last logged; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d1 2026-12-06 AM STRENGTH_FULL_B 31min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; band-biceps-curl 2x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":12,"asOf":"2026-11-20","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":123,"longestRunMinutes":83,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 3x12 0KG BODYWEIGHT","glute-bridge 4x6 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,6],"strengthDays":[1,2,3,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":34,"strengthMinutes":38,"longRunDay":6,"longRunMinutes":57,"sameTurnConfirmed":true}}`

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

## R7D-G257

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-08","weeks":12,"asOf":"2027-01-07","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-27"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-03-27"},"runExperience":"NONE","strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["PULL_UP_BAR","BENCH","RACK","BODYWEIGHT","DUMBBELLS","KETTLEBELL","MACHINES","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3,4,6],"strengthDays":[0,1,4,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":53,"strengthMinutes":31,"longRunDay":1,"longRunMinutes":123,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2027-01-08 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d0 2027-01-08 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-09 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d1 2027-01-09 AM RUN WALK 20min (WALK) | d3 2027-01-11 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2027-01-12 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2027-01-12 AM RUN WALK 20min (WALK) | d6 2027-01-14 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-14 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2027-01-15 AM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d0 2027-01-15 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-16 AM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d1 2027-01-16 AM RUN WALK 20min (WALK) | d3 2027-01-18 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-19 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d4 2027-01-19 AM RUN WALK 20min (WALK) | d6 2027-01-21 AM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; db-calf-raise 2x10 RIR3 establish; front-plank 2x10 RIR3 BW | d6 2027-01-21 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 10 (TAPER): d0 2027-03-19 AM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; leg-extension-machine 1x10 RIR3 last logged | d0 2027-03-19 AM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d1 2027-03-20 AM STRENGTH_UPPER 20min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-lateral-raise 1x10 RIR3 last logged | d1 2027-03-20 AM RUN WALK 20min (WALK) | d3 2027-03-22 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d4 2027-03-23 AM STRENGTH_LOWER_B 14min: kb-deadlift 1x8 RIR4 last logged; reverse-lunge 1x10 RIR4 BW | d4 2027-03-23 AM RUN WALK 20min (WALK) | d6 STRENGTH REST_BY_DESIGN | d6 2027-03-25 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk))
- Week 11 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2027-03-26 AM RUN WALK 20min (WALK) | d1 STRENGTH REST_BY_DESIGN | d1 2027-03-27  RUN RACE 150min (RACE, completion) | d3 2027-03-29 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk)) | d4 STRENGTH REST_BY_DESIGN | d4 2027-03-30 AM RUN WALK 20min (WALK) | d6 STRENGTH REST_BY_DESIGN | d6 2027-04-01 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":12,"asOf":"2026-11-09","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-22"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-01-22"},"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","PULL_UP_BAR","BENCH","BANDS","BARBELL","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[4,5],"strengthDays":[1,2,3,4,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":40,"strengthMinutes":73,"longRunDay":5,"longRunMinutes":93,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d1 2026-11-13 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-14 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-15 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-11-16 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-11-16 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-17 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-11-17 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d1 2026-11-20 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-11-21 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2026-11-22 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; side-lying-hip-abduction 1x10 RIR3 BW | d4 2026-11-23 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; tibialis-raise 1x10 RIR3 BW | d4 2026-11-23 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-11-24 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d5 2026-11-24 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 9 (TAPER): d1 2027-01-15 PM STRENGTH_LOWER 19min: goblet-squat 1x8 RIR3 last logged; glute-bridge 1x14 RIR3 BW; step-down 1x10 RIR3 BW; single-leg-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x14 RIR3 BW | d2 2027-01-16 PM STRENGTH_UPPER 14min: incline-push-up 1x14 RIR4 BW; band-row 1x10 RIR4 BW | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-18 PM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d4 STRENGTH REST_BY_DESIGN | d5 2027-01-19 PM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d5 STRENGTH REST_BY_DESIGN
- Week 10 (RACE_WEEK): d1 STRENGTH REST_BY_DESIGN | d1 2027-01-22  RUN RACE 150min (RACE, completion) | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 2027-01-25 PM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d4 STRENGTH REST_BY_DESIGN | d5 2027-01-26 PM RUN WALK_JOG 28min (WALK_JOG 3x(300s jog/90s walk)) | d5 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-04","weeks":4,"asOf":"2026-12-03","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[0],"runTurn":"PM","strengthTurn":"AM","runMinutes":73,"strengthMinutes":47,"longRunDay":1,"longRunMinutes":110,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-04 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-05 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-11 AM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-12 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":16,"asOf":"2026-12-05","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":34,"longestRunMinutes":99,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","BENCH","PULL_UP_BAR","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,4],"strengthDays":[4,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":79,"strengthMinutes":30,"longRunDay":4,"longRunMinutes":81,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-06 PM RUN WALK 20min (WALK) | d4 2026-12-10 PM RUN LONG 30min (LONG) | d4 2026-12-10 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d5 2026-12-11 PM STRENGTH_FULL_B 25min: kb-deadlift 2x8 RIR3 establish; kb-row 2x8 RIR3 establish; incline-push-up 2x5 RIR3 BW | d6 2026-12-12 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-13 PM RUN WALK 20min (WALK) | d4 2026-12-17 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d4 2026-12-17 PM RUN LONG 30min (LONG) | d5 2026-12-18 PM STRENGTH_FULL_A 24min: kb-goblet-squat 2x5 RIR3 establish; incline-push-up 2x5 RIR3 BW; kb-row 2x8 RIR3 last logged | d6 2026-12-19 PM STRENGTH_FULL_B 25min: kb-deadlift 2x8 RIR3 last logged; kb-row 2x8 RIR3 last logged; incline-push-up 2x5 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":12,"asOf":"2026-11-08","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":60,"longestRunMinutes":24,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x5 0KG BODYWEIGHT","glute-bridge 3x12 0KG BODYWEIGHT","reverse-lunge 2x5 0KG BODYWEIGHT"],"equipment":["BANDS","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,3],"strengthDays":[0,1,2,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":49,"strengthMinutes":68,"longRunDay":3,"longRunMinutes":44,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-11 PM STRENGTH_LOWER 27min: box-squat-bodyweight 2x5 RIR3 BW; glute-bridge 3x12 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d0 2026-11-11 PM RUN EASY 24min (EASY) | d1 2026-11-12 PM STRENGTH_UPPER 25min: push-up 2x10 RIR3 BW; band-row 2x10 RIR3 BW; incline-push-up 1x12 RIR3 BW; band-face-pull 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-13 PM STRENGTH_UPPER_B 21min: band-row 2x10 RIR3 BW; push-up 2x10 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-14 PM RUN LONG 20min (LONG) | d5 2026-11-16 PM STRENGTH_LOWER_B 26min: glute-bridge 3x12 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-11-18 PM STRENGTH_LOWER 27min: box-squat-bodyweight 2x7 RIR3 BW; glute-bridge 3x8 RIR3 BW; reverse-lunge 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d0 2026-11-18 PM RUN EASY 24min (EASY) | d1 2026-11-19 PM STRENGTH_UPPER 25min: push-up 2x12 RIR3 BW; band-row 2x12 RIR3 BW; incline-push-up 1x14 RIR3 BW; band-face-pull 1x12 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-11-20 PM STRENGTH_UPPER_B 22min: band-row 2x12 RIR3 BW; push-up 2x12 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2026-11-21 PM RUN LONG 25min (LONG) | d5 2026-11-23 PM STRENGTH_LOWER_B 26min: glute-bridge 3x8 RIR3 BW; reverse-lunge 2x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-15","weeks":16,"asOf":"2026-11-14","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-03-04"}},"strength":"MAINTAIN"},"event":{"kind":"HALF_MARATHON","date":"2027-03-04"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":92,"longestRunMinutes":32,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["kb-goblet-squat 2x12 26KG SINGLE_IMPLEMENT","barbell-rdl 2x10 115KG TOTAL"],"equipment":["KETTLEBELL","MACHINES","BENCH","RACK","BARBELL","BANDS","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5],"strengthDays":[0,1,2,3,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":37,"strengthMinutes":24,"longRunDay":5,"longRunMinutes":136,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-15 PM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 establish; kb-deadlift 2x8 RIR3 establish; reverse-lunge 1x10 RIR3 BW | d1 2026-11-16 PM STRENGTH_UPPER 20min: db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; machine-chest-press 1x10 RIR3 establish | d2 2026-11-17 PM STRENGTH_LOWER_B 20min: kb-deadlift 2x8 RIR3 establish; reverse-lunge 2x8 RIR3 BW; seated-calf-raise-db 1x10 RIR3 establish | d3 2026-11-18 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2026-11-20 AM RUN LONG 30min (LONG) | d5 2026-11-20 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW
- Week 1 (BUILD): d0 2026-11-22 PM STRENGTH_LOWER 20min: goblet-squat 2x8 RIR3 last logged; kb-deadlift 2x8 RIR3 last logged; reverse-lunge 1x10 RIR3 BW | d1 2026-11-23 PM STRENGTH_UPPER 20min: db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged | d2 2026-11-24 PM STRENGTH_LOWER_B 21min: kb-deadlift 2x8 RIR3 last logged; reverse-lunge 2x10 RIR3 BW; seated-calf-raise-db 1x10 RIR3 last logged | d3 2026-11-25 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2026-11-27 AM RUN LONG 30min (LONG) | d5 2026-11-27 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; front-plank 1x10 RIR3 BW
- Week 14 (TAPER): d0 2027-02-21 PM STRENGTH_LOWER 15min: goblet-squat 1x8 RIR3 last logged; kb-deadlift 1x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW | d1 2027-02-22 PM STRENGTH_UPPER 15min: db-floor-press 1x8 RIR3 last logged; db-row 1x8 RIR3 last logged; machine-chest-press 1x10 RIR3 last logged | d2 2027-02-23 PM STRENGTH_LOWER_B 15min: kb-deadlift 1x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; seated-calf-raise-db 1x10 RIR3 last logged | d3 2027-02-24 PM STRENGTH_UPPER_B 15min: db-row 1x8 RIR3 last logged; db-floor-press 1x8 RIR3 last logged; dead-bug 1x12 RIR3 BW | d5 2027-02-26 AM RUN EASY 15min (EASY) | d5 STRENGTH REST_BY_DESIGN
- Week 15 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 STRENGTH REST_BY_DESIGN | d3 STRENGTH REST_BY_DESIGN | d4 2027-03-04  RUN RACE 150min (RACE) | d5 RUN REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, CLINICAL_SIGNAL, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-05","weeks":12,"asOf":"2026-12-04","tz":0,"learningConsent":true,"eligibility":"CLINICAL","goals":{"run":"GENERAL","strength":"HYPERTROPHY"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":336,"longestRunMinutes":50,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 2x12 0KG BODYWEIGHT"],"equipment":["DUMBBELLS","BENCH","BANDS","KETTLEBELL","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,6],"strengthDays":[0,1,3,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":79,"strengthMinutes":40,"longRunDay":3,"longRunMinutes":85,"sameTurnConfirmed":true}}`

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

## R7D-G264

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-10","weeks":12,"asOf":"2026-11-10","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-01"}},"strength":"NONE"},"event":{"kind":"10K","date":"2027-02-01"},"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":104,"longestRunMinutes":33,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[],"runTurn":"AM","strengthTurn":"AM","runMinutes":68,"strengthMinutes":70,"longRunDay":0,"longRunMinutes":146,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (BUILD): d0 2026-11-10 AM RUN LONG 30min (LONG)
- Week 1 (BUILD): d0 2026-11-17 AM RUN LONG 35min (LONG)
- Week 10 (TAPER): d0 2027-01-19 AM RUN LONG 45min (LONG)
- Week 11 (RACE_WEEK): d0 2027-01-26 AM RUN EASY 15min (EASY) | d6 2027-02-01  RUN RACE 75min (RACE)

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

## R7D-G265

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":12,"asOf":"2026-11-20","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":228,"longestRunMinutes":79,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","MACHINES","BENCH","BARBELL","PULL_UP_BAR","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,6],"strengthDays":[1],"runTurn":"PM","strengthTurn":"PM","runMinutes":69,"strengthMinutes":39,"longRunDay":2,"longRunMinutes":127,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-21 PM RUN EASY 35min (EASY) | d1 2026-11-22 PM STRENGTH_FULL_A 28min: kb-goblet-squat 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-22 PM RUN EASY 35min (EASY) | d2 2026-11-23 PM RUN LONG 75min (LONG) | d3 2026-11-24 PM RUN EASY 35min (EASY) | d6 2026-11-27 PM RUN EASY 35min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-28 PM RUN EASY 35min (EASY) | d1 2026-11-29 PM STRENGTH_FULL_A 28min: kb-goblet-squat 2x10 RIR3 last logged; machine-chest-press 2x10 RIR3 last logged; seated-cable-row 2x10 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-29 PM RUN EASY 35min (EASY) | d2 2026-11-30 PM RUN LONG 75min (LONG) | d3 2026-12-01 PM RUN EASY 35min (EASY) | d6 2026-12-04 PM RUN EASY 35min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":16,"asOf":"2026-11-10","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":"NOVICE","strengthExperience":"NONE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":88,"longestRunMinutes":30,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","BANDS","DUMBBELLS","RACK","PULL_UP_BAR"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,3,5],"strengthDays":[0],"runTurn":"PM","strengthTurn":"PM","runMinutes":67,"strengthMinutes":45,"longRunDay":2,"longRunMinutes":51,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-12 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-11-13 PM RUN EASY 15min (EASY) | d2 2026-11-14 PM RUN LONG 30min (LONG) | d3 2026-11-15 PM RUN EASY 15min (EASY) | d5 2026-11-17 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-19 PM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d1 2026-11-20 PM RUN EASY 15min (EASY) | d2 2026-11-21 PM RUN LONG 30min (LONG) | d3 2026-11-22 PM RUN EASY 15min (EASY) | d5 2026-11-24 PM RUN EASY 15min (EASY)

**Automated properties.** no failure

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

**Intake.** `{"startDate":"2026-12-18","weeks":8,"asOf":"2026-12-17","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":96,"longestRunMinutes":37,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,5],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":77,"strengthMinutes":32,"longRunDay":3,"longRunMinutes":121,"sameTurnConfirmed":false}}`

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-06","weeks":8,"asOf":"2026-12-04","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":31,"longestRunMinutes":138,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BARBELL","DUMBBELLS","BODYWEIGHT","BENCH","RACK","BANDS","PULL_UP_BAR","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1],"strengthDays":[0,1,2,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":46,"strengthMinutes":33,"longRunDay":1,"longRunMinutes":73,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-06 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-12-07 AM RUN LONG 30min (LONG) | d1 2026-12-07 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 establish; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d2 2026-12-08 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-11 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2026-12-12 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-13 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d1 2026-12-14 AM RUN LONG 30min (LONG) | d1 2026-12-14 PM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d2 2026-12-15 PM STRENGTH_FULL_B 24min: kb-deadlift 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d5 2026-12-18 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW | d6 2026-12-19 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; front-plank 1x10 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_10K, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-16","weeks":8,"asOf":"2026-12-14","tz":330,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-01-29"}},"strength":"HYPERTROPHY"},"event":{"kind":"10K","date":"2027-01-29"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":324,"longestRunMinutes":45,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x5 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[6],"strengthDays":[0,3,4,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":65,"strengthMinutes":40,"longRunDay":6,"longRunMinutes":98,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (BUILD): d0 2026-12-16 PM STRENGTH_LOWER 36min: box-squat-bodyweight 5x5 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d3 2026-12-19 PM STRENGTH_UPPER 21min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d4 2026-12-20 PM STRENGTH_LOWER_B 26min: glute-bridge 2x8 RIR3 BW; reverse-lunge 2x8 RIR3 BW; bent-knee-calf-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d5 2026-12-21 PM STRENGTH_UPPER_B 21min: incline-push-up 2x8 RIR3 BW; prone-ytw-raise 2x10 RIR3 BW; dead-bug 2x10 RIR3 BW | d6 2026-12-22 AM RUN LONG 45min (LONG) | d6 2026-12-22 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW
- Week 1 (BUILD): d0 2026-12-23 PM STRENGTH_LOWER 40min: box-squat-bodyweight 5x7 RIR3 BW; glute-bridge 3x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d3 2026-12-26 PM STRENGTH_UPPER 24min: incline-push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d4 2026-12-27 PM STRENGTH_LOWER_B 33min: glute-bridge 3x10 RIR3 BW; reverse-lunge 3x12 RIR3 BW; bent-knee-calf-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d5 2026-12-28 PM STRENGTH_UPPER_B 24min: incline-push-up 3x10 RIR3 BW; prone-ytw-raise 2x12 RIR3 BW; dead-bug 2x12 RIR3 BW | d6 2026-12-29 AM RUN LONG 50min (LONG) | d6 2026-12-29 PM STRENGTH_CORE 20min: dead-bug 2x12 RIR3 BW; standing-calf-raise 2x12 RIR3 BW; front-plank 2x12 RIR3 BW
- Week 5 (TAPER): d0 2027-01-20 PM STRENGTH_LOWER 25min: box-squat-bodyweight 2x9 RIR3 BW; glute-bridge 2x12 RIR3 BW; reverse-lunge 1x14 RIR3 BW; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d3 2027-01-23 PM STRENGTH_UPPER 11min: incline-push-up 1x12 RIR4 BW | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d6 2027-01-26 AM RUN EASY 15min (EASY) | d6 STRENGTH REST_BY_DESIGN
- Week 6 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d2 2027-01-29  RUN RACE 75min (RACE) | d3 STRENGTH REST_BY_DESIGN | d4 STRENGTH REST_BY_DESIGN | d5 STRENGTH REST_BY_DESIGN | d6 2027-02-02 AM RUN RECOVERY_EASY 30min (RECOVERY_EASY) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-07","weeks":16,"asOf":"2027-01-04","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":255,"longestRunMinutes":113,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["goblet-squat 4x10 7KG PER_HAND"],"equipment":["BANDS","DUMBBELLS","PULL_UP_BAR","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2,4],"strengthDays":[2,3,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":38,"strengthMinutes":65,"longRunDay":1,"longRunMinutes":54,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2027-01-08 PM RUN LONG 54min (LONG) | d2 2027-01-09 PM STRENGTH_LOWER 30min: goblet-squat 4x10 RIR3 7kg PER_HAND; db-rdl 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2027-01-09 PM RUN EASY 38min (EASY) | d3 2027-01-10 PM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; push-up 1x12 RIR3 BW; band-row 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d4 2027-01-11 PM RUN EASY 38min (EASY) | d6 2027-01-13 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2027-01-15 PM RUN LONG 54min (LONG) | d2 2027-01-16 PM STRENGTH_LOWER 31min: goblet-squat 4x12 RIR3 7kg PER_HAND; db-rdl 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2027-01-16 PM RUN EASY 38min (EASY) | d3 2027-01-17 PM STRENGTH_UPPER 25min: db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; push-up 1x14 RIR3 BW; band-row 1x12 RIR3 BW; dead-bug 1x14 RIR3 BW | d4 2027-01-18 PM RUN EASY 38min (EASY) | d6 2027-01-20 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x14 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-18","weeks":8,"asOf":"2026-12-15","tz":330,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","DUMBBELLS","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,3],"strengthDays":[2,3,5,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":43,"strengthMinutes":58,"longRunDay":0,"longRunMinutes":125,"sameTurnConfirmed":false}}`

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

## R7D-G272

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":16,"asOf":"2026-12-30","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-04-21"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2027-04-21"},"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BARBELL","DUMBBELLS","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[1,2],"strengthDays":[2,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":32,"strengthMinutes":72,"longRunDay":2,"longRunMinutes":40,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d1 2027-01-03 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2027-01-04 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d2 2027-01-04 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2027-01-08 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 2x10 RIR3 establish; db-split-squat 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW
- Week 1 (BUILD): d1 2027-01-10 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2027-01-11 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-calf-raise 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d2 2027-01-11 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-15 AM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 2x10 RIR3 last logged; db-split-squat 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW
- Week 14 (TAPER): d1 2027-04-11 AM RUN EASY 20min (EASY +strides) | d2 2027-04-12 AM STRENGTH_FULL_A 20min: goblet-squat 1x10 RIR3 last logged; db-floor-press 1x10 RIR3 last logged; db-row 1x10 RIR3 last logged; standing-calf-raise 1x14 RIR3 BW; front-plank 1x14 RIR3 BW | d2 2027-04-12 AM RUN EASY 20min (EASY +strides) | d6 2027-04-16 AM STRENGTH_FULL_B 16min: db-rdl 1x10 RIR4 last logged; db-row 1x10 RIR4 last logged; db-floor-press 1x10 RIR4 last logged
- Week 15 (RACE_WEEK): d1 2027-04-18 AM RUN EASY 15min (EASY) | d2 STRENGTH REST_BY_DESIGN | d2 2027-04-19 AM RUN EASY 15min (EASY) | d4 2027-04-21  RUN RACE 150min (RACE, completion) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-24","weeks":16,"asOf":"2026-11-22","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":235,"longestRunMinutes":31,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","MACHINES","DUMBBELLS","RACK"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,1,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":38,"strengthMinutes":26,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-24 AM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2026-11-25 AM STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish | d5 2026-11-29 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-01 AM STRENGTH_FULL_A 24min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged | d1 2026-12-02 AM STRENGTH_FULL_B 24min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged | d5 2026-12-06 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-07","weeks":8,"asOf":"2027-01-05","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"NONE"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":1,"runMinutesPerWeek":50,"longestRunMinutes":86,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["KETTLEBELL","RACK","BENCH","DUMBBELLS","BARBELL","BODYWEIGHT","PULL_UP_BAR","BANDS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3],"strengthDays":[],"runTurn":"PM","strengthTurn":"PM","runMinutes":85,"strengthMinutes":33,"longRunDay":3,"longRunMinutes":99,"sameTurnConfirmed":true}}`

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

## R7D-G275

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-23","weeks":12,"asOf":"2026-11-22","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":240,"longestRunMinutes":125,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[0,3,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":26,"strengthMinutes":54,"sameTurnConfirmed":true}}`

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

## R7D-G276

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-21","weeks":8,"asOf":"2026-11-19","tz":330,"learningConsent":false,"eligibility":"UNKNOWN","goals":{"run":"REGULAR","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":135,"longestRunMinutes":70,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":["goblet-squat 5x6 10KG PER_HAND","glute-bridge 5x12 0KG BODYWEIGHT"],"equipment":["BENCH","BARBELL","RACK","BANDS","PULL_UP_BAR","DUMBBELLS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,4,5],"strengthDays":[4],"runTurn":"PM","strengthTurn":"PM","runMinutes":41,"strengthMinutes":64,"longRunDay":1,"longRunMinutes":112,"sameTurnConfirmed":true}}`

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

## R7D-G277

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":8,"asOf":"2026-11-09","tz":60,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":170,"longestRunMinutes":22,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["leg-press 2x10 97KG TOTAL","barbell-rdl 2x6 61KG TOTAL"],"equipment":["RACK","MACHINES","PULL_UP_BAR","KETTLEBELL","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2],"runTurn":"PM","strengthTurn":"PM","runMinutes":88,"strengthMinutes":51,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d1 2026-11-12 PM STRENGTH_FULL_A 28min: leg-press 2x10 RIR3 97kg TOTAL; machine-chest-press 2x10 RIR3 establish; seated-cable-row 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-11-13 PM STRENGTH_FULL_B 28min: barbell-rdl 2x6 RIR3 61kg TOTAL; seated-cable-row 2x10 RIR3 establish; machine-chest-press 2x10 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-11-19 PM STRENGTH_FULL_A 29min: leg-press 2x12 RIR3 97kg TOTAL; machine-chest-press 2x10 RIR3 last logged; seated-cable-row 2x10 RIR3 last logged; standing-calf-raise 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d2 2026-11-20 PM STRENGTH_FULL_B 28min: barbell-rdl 2x8 RIR3 61kg TOTAL; seated-cable-row 2x10 RIR3 last logged; machine-chest-press 2x10 RIR3 last logged; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-09","weeks":16,"asOf":"2026-12-07","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT","DUMBBELLS","PULL_UP_BAR","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,5,6],"strengthDays":[0,1,2,3,4],"runTurn":"PM","strengthTurn":"PM","runMinutes":36,"strengthMinutes":35,"longRunDay":1,"longRunMinutes":58,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-09 PM RUN EASY 15min (EASY) | d0 2026-12-09 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2026-12-10 PM RUN WALK 20min (WALK) | d1 2026-12-10 PM STRENGTH_FULL_B 31min: glute-bridge 2x5 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-11 PM RUN EASY 15min (EASY) | d2 2026-12-11 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d3 2026-12-12 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d4 2026-12-13 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2026-12-14 PM RUN EASY 15min (EASY) | d6 2026-12-15 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-16 PM STRENGTH_FULL_B 31min: glute-bridge 2x5 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d0 2026-12-16 PM RUN EASY 20min (EASY) | d1 2026-12-17 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d1 2026-12-17 PM RUN WALK 20min (WALK) | d2 2026-12-18 PM STRENGTH_FULL_A 31min: goblet-squat 2x5 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d2 2026-12-18 PM RUN EASY 20min (EASY) | d3 2026-12-19 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d4 2026-12-20 PM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d5 2026-12-21 PM RUN EASY 20min (EASY) | d6 2026-12-22 PM RUN WALK 20min (WALK)

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

## R7D-G279

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, RACE_HALF, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":8,"asOf":"2027-01-06","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-02-24"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-02-24"},"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,6],"strengthDays":[1,2,6],"runTurn":"AM","strengthTurn":"PM","runMinutes":90,"strengthMinutes":72,"longRunDay":6,"longRunMinutes":146,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2027-01-06 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-07 AM RUN WALK 20min (WALK) | d1 2027-01-07 PM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2027-01-08 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2027-01-08 PM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-09 AM RUN WALK 20min (WALK) | d6 2027-01-12 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2027-01-12 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 1 (BUILD): d0 2027-01-13 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-14 AM RUN WALK 20min (WALK) | d1 2027-01-14 PM STRENGTH_LOWER 24min: box-squat-bodyweight 2x8 RIR3 BW; glute-bridge 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; side-lying-hip-abduction 1x10 RIR3 BW | d2 2027-01-15 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2027-01-15 PM STRENGTH_UPPER 19min: push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; incline-push-up 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-16 AM RUN WALK 20min (WALK) | d6 2027-01-19 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2027-01-19 PM STRENGTH_FULL_B 24min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW
- Week 6 (TAPER): d0 2027-02-17 AM RUN WALK_JOG 26min (WALK_JOG 4x(180s jog/90s walk)) | d1 2027-02-18 AM RUN WALK 20min (WALK) | d1 2027-02-18 PM STRENGTH_LOWER 14min: box-squat-bodyweight 1x10 RIR4 BW; glute-bridge 1x10 RIR4 BW | d2 2027-02-19 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d2 STRENGTH REST_BY_DESIGN | d3 2027-02-20 AM RUN WALK 20min (WALK) | d6 2027-02-23 AM RUN WALK 20min (WALK) | d6 STRENGTH REST_BY_DESIGN
- Week 7 (RACE_WEEK): d0 2027-02-24  RUN RACE 150min (RACE, completion) | d1 RUN REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 2027-02-26 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d2 STRENGTH REST_BY_DESIGN | d3 2027-02-27 AM RUN WALK 20min (WALK) | d6 2027-03-02 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-12","weeks":8,"asOf":"2026-11-10","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":null,"strengthExperience":null,"recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["RACK","DUMBBELLS","MACHINES","PULL_UP_BAR","BANDS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3,4],"strengthDays":[0,1,2,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":84,"strengthMinutes":40,"longRunDay":3,"longRunMinutes":38,"sameTurnConfirmed":true}}`

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

## R7D-G281

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":8,"asOf":"2026-12-17","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"NOVICE","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":264,"longestRunMinutes":87,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["goblet-squat 5x10 14KG PER_HAND","db-rdl 5x10 12KG PER_HAND"],"equipment":["BARBELL","DUMBBELLS","PULL_UP_BAR","BANDS","BENCH","BODYWEIGHT","RACK","MACHINES","KETTLEBELL"],"pause":{"nonclinical":true,"weeks":3,"reasonCategory":"STUDY"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[2],"runTurn":"AM","strengthTurn":"AM","runMinutes":25,"strengthMinutes":70,"longRunDay":1,"longRunMinutes":65,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-12-20 AM RUN EASY 25min (EASY) | d1 2026-12-21 AM RUN LONG 65min (LONG) | d2 2026-12-22 AM STRENGTH_FULL_A 35min: goblet-squat 5x8 RIR3 14kg PER_HAND; db-floor-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2026-12-22 AM RUN EASY 25min (EASY) | d3 2026-12-23 AM RUN EASY 25min (EASY) | d5 2026-12-25 AM RUN EASY 25min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-12-27 AM RUN EASY 25min (EASY) | d1 2026-12-28 AM RUN LONG 65min (LONG) | d2 2026-12-29 AM STRENGTH_FULL_A 35min: goblet-squat 5x8 RIR3 14kg PER_HAND; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-29 AM RUN EASY 25min (EASY) | d3 2026-12-30 AM RUN EASY 25min (EASY) | d5 2027-01-01 AM RUN EASY 25min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-20","weeks":8,"asOf":"2026-11-17","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"NONE"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":290,"longestRunMinutes":24,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["box-squat-bodyweight 5x10 0KG BODYWEIGHT"],"equipment":["KETTLEBELL"],"pause":{"nonclinical":true,"weeks":5,"reasonCategory":"WORK"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":66,"strengthMinutes":67,"longRunDay":0,"longRunMinutes":141,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-20 PM RUN EASY 15min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-27 PM RUN EASY 20min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-14","weeks":8,"asOf":"2026-12-11","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":["back-squat 3x8 58KG TOTAL","kb-deadlift 3x5 28KG SINGLE_IMPLEMENT","reverse-lunge 5x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT","DUMBBELLS","BARBELL","RACK","BENCH","KETTLEBELL","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,4,6],"strengthDays":[0,1,3,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":77,"strengthMinutes":56,"longRunDay":2,"longRunMinutes":101,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-14 PM STRENGTH_LOWER 33min: goblet-squat 2x8 RIR3 establish; kb-deadlift 3x5 RIR3 28kg SINGLE_IMPLEMENT; reverse-lunge 5x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; hip-abduction-machine 1x10 RIR3 establish | d0 2026-12-14 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-12-15 PM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 establish; incline-push-up 1x10 RIR3 BW; one-arm-db-row 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2026-12-15 PM RUN WALK 20min (WALK) | d2 2026-12-16 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-17 PM STRENGTH_LOWER_B 31min: kb-deadlift 3x5 RIR3 28kg SINGLE_IMPLEMENT; reverse-lunge 5x8 RIR3 BW; seated-calf-raise-db 1x10 RIR3 establish; tibialis-raise 1x10 RIR3 BW | d4 2026-12-18 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-19 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 establish; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-20 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 establish; front-plank 1x10 RIR3 BW | d6 2026-12-20 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-21 PM STRENGTH_LOWER 33min: goblet-squat 2x8 RIR3 last logged; kb-deadlift 3x5 RIR3 28kg SINGLE_IMPLEMENT; reverse-lunge 5x8 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; hip-abduction-machine 1x10 RIR3 last logged | d0 2026-12-21 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-12-22 PM STRENGTH_UPPER 24min: push-up 2x8 RIR3 BW; db-row 2x8 RIR3 last logged; incline-push-up 1x10 RIR3 BW; one-arm-db-row 1x10 RIR3 last logged; dead-bug 1x10 RIR3 BW | d1 2026-12-22 PM RUN WALK 20min (WALK) | d2 2026-12-23 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-24 PM STRENGTH_LOWER_B 31min: kb-deadlift 3x5 RIR3 28kg SINGLE_IMPLEMENT; reverse-lunge 5x8 RIR3 BW; seated-calf-raise-db 1x10 RIR3 last logged; tibialis-raise 1x10 RIR3 BW | d4 2026-12-25 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-26 PM STRENGTH_UPPER_B 20min: db-row 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-27 PM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; db-calf-raise 1x10 RIR3 last logged; front-plank 1x10 RIR3 BW | d6 2026-12-27 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Intake.** `{"startDate":"2026-12-20","weeks":8,"asOf":"2026-12-17","tz":60,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"STRENGTH"},"event":null,"runExperience":"NOVICE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":44,"longestRunMinutes":62,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BENCH","PULL_UP_BAR","BANDS","BODYWEIGHT","MACHINES","BARBELL","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,5],"runTurn":"PM","strengthTurn":"PM","runMinutes":50,"strengthMinutes":65,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-21 PM STRENGTH_FULL_A 30min: kb-goblet-squat 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2026-12-25 PM STRENGTH_FULL_B 30min: kb-deadlift 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-28 PM STRENGTH_FULL_A 39min: kb-goblet-squat 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d5 2027-01-01 PM STRENGTH_FULL_B 39min: kb-deadlift 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, RACE_HALF, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":8,"asOf":"2026-11-15","tz":0,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-01"}},"strength":"RUNNING_SUPPORT"},"event":{"kind":"HALF_MARATHON","date":"2027-01-01"},"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","DUMBBELLS","PULL_UP_BAR","BANDS","BENCH"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5],"strengthDays":[0],"runTurn":"AM","strengthTurn":"PM","runMinutes":85,"strengthMinutes":32,"longRunDay":5,"longRunMinutes":118,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-11-16 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-11-16 PM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 establish; push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW | d1 2026-11-17 AM RUN WALK 20min (WALK) | d2 2026-11-18 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-11-19 AM RUN WALK 20min (WALK) | d5 2026-11-21 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-11-23 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-11-23 PM STRENGTH_FULL_A 24min: goblet-squat 2x8 RIR3 last logged; push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW | d1 2026-11-24 AM RUN WALK 20min (WALK) | d2 2026-11-25 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-11-26 AM RUN WALK 20min (WALK) | d5 2026-11-28 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 5 (TAPER): d0 2026-12-21 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d0 2026-12-21 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR3 last logged; push-up 1x10 RIR3 BW; band-row 1x10 RIR3 BW | d1 2026-12-22 AM RUN WALK 20min (WALK) | d2 2026-12-23 AM RUN WALK_JOG 28min (WALK_JOG 5x(120s jog/120s walk)) | d3 2026-12-24 AM RUN WALK 20min (WALK) | d5 2026-12-26 AM RUN WALK_JOG 26min (WALK_JOG 5x(90s jog/120s walk))
- Week 6 (RACE_WEEK): d0 2026-12-28 AM RUN WALK_JOG 26min (WALK_JOG 5x(90s jog/120s walk)) | d0 2026-12-28 PM STRENGTH_FULL_A 16min: goblet-squat 1x8 RIR4 last logged; push-up 1x10 RIR4 BW; band-row 1x10 RIR4 BW | d1 2026-12-29 AM RUN WALK 20min (WALK) | d2 2026-12-30 AM RUN WALK_JOG 26min (WALK_JOG 5x(90s jog/120s walk)) | d3 2026-12-31 AM RUN WALK 20min (WALK) | d4 2027-01-01  RUN RACE 150min (RACE, completion) | d5 RUN REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":12,"asOf":"2027-01-04","tz":-180,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-03-26"}},"strength":"MAINTAIN"},"event":{"kind":"10K","date":"2027-03-26"},"runExperience":"NOVICE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":48,"longestRunMinutes":51,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x8 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,5],"strengthDays":[0],"runTurn":"PM","strengthTurn":"PM","runMinutes":71,"strengthMinutes":34,"longRunDay":1,"longRunMinutes":59,"sameTurnConfirmed":false}}`

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

## R7D-G287

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-02","weeks":8,"asOf":"2026-12-31","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"STRENGTH"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":264,"longestRunMinutes":40,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":[],"equipment":["BENCH","PULL_UP_BAR","BODYWEIGHT","BANDS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,5,6],"strengthDays":[0,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":62,"strengthMinutes":56,"longRunDay":5,"longRunMinutes":91,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-02 PM STRENGTH_FULL_A 30min: leg-press 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d0 2027-01-02 PM RUN EASY 40min (EASY) | d1 2027-01-03 PM RUN EASY 40min (EASY) | d2 2027-01-04 PM RUN EASY 40min (EASY) | d5 2027-01-07 PM RUN LONG 40min (LONG) | d6 2027-01-08 PM STRENGTH_FULL_B 30min: glute-bridge 2x5 RIR3 BW; seated-cable-row 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2027-01-08 PM RUN EASY 40min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-09 PM STRENGTH_FULL_A 39min: leg-press 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d0 2027-01-09 PM RUN EASY 40min (EASY) | d1 2027-01-10 PM RUN EASY 40min (EASY) | d2 2027-01-11 PM RUN EASY 40min (EASY) | d5 2027-01-14 PM RUN LONG 40min (LONG) | d6 2027-01-15 PM STRENGTH_FULL_B 39min: glute-bridge 3x5 RIR3 BW; seated-cable-row 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; reverse-lunge 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d6 2027-01-15 PM RUN EASY 40min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-18","weeks":16,"asOf":"2026-11-15","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":6,"runMinutesPerWeek":360,"longestRunMinutes":130,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","DUMBBELLS","BANDS","RACK","BENCH","KETTLEBELL","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,3,5,6],"strengthDays":[5],"runTurn":"AM","strengthTurn":"PM","runMinutes":24,"strengthMinutes":62,"longRunDay":5,"longRunMinutes":128,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-18 AM RUN EASY 24min (EASY) | d1 2026-11-19 AM RUN EASY 24min (EASY) | d2 2026-11-20 AM RUN EASY 24min (EASY) | d3 2026-11-21 AM RUN EASY 24min (EASY) | d5 2026-11-23 AM RUN LONG 95min (LONG) | d5 2026-11-23 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; db-bench-press 2x8 RIR3 establish; db-row 2x8 RIR3 establish; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-11-24 AM RUN EASY 24min (EASY)
- Week 1 (DEVELOPMENT): d0 2026-11-25 AM RUN EASY 24min (EASY) | d1 2026-11-26 AM RUN EASY 24min (EASY) | d2 2026-11-27 AM RUN EASY 24min (EASY) | d3 2026-11-28 AM RUN EASY 24min (EASY) | d5 2026-11-30 AM RUN LONG 95min (LONG) | d5 2026-11-30 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 last logged; db-bench-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d6 2026-12-01 AM RUN EASY 24min (EASY)

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-05","weeks":4,"asOf":"2027-01-05","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2027-01-26"}},"strength":"HYPERTROPHY"},"event":{"kind":"HALF_MARATHON","date":"2027-01-26"},"runExperience":null,"strengthExperience":"NONE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BANDS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,4,5],"strengthDays":[0,1,2,5,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":42,"strengthMinutes":22,"longRunDay":4,"longRunMinutes":56,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · SPECIFIC · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2027-01-05 PM STRENGTH_FULL_A 12min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW | d1 2027-01-06 PM STRENGTH_FULL_B 21min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x8 RIR3 BW | d2 2027-01-07 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d2 2027-01-07 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2027-01-08 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d4 2027-01-09 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2027-01-10 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-10 PM RUN WALK 20min (WALK) | d6 2027-01-11 PM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW
- Week 1 (BUILD): d0 2027-01-12 PM STRENGTH_FULL_A 21min: box-squat-bodyweight 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; band-row 1x8 RIR3 BW | d1 2027-01-13 PM STRENGTH_FULL_B 21min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 1x8 RIR3 BW | d2 2027-01-14 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW | d2 2027-01-14 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2027-01-15 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-16 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-17 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW | d5 2027-01-17 PM RUN WALK 20min (WALK) | d6 2027-01-18 PM STRENGTH_CORE 19min: dead-bug 2x10 RIR3 BW; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW
- Week 2 (SPECIFIC): d0 2027-01-19 PM STRENGTH_LOWER 22min: box-squat-bodyweight 3x10 RIR3 BW; glute-bridge 2x10 RIR3 BW | d1 2027-01-20 PM STRENGTH_UPPER 14min: incline-push-up 1x10 RIR4 BW; band-row 1x10 RIR4 BW | d2 2027-01-21 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 STRENGTH REST_BY_DESIGN | d3 2027-01-22 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-23 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-24 PM RUN WALK 20min (WALK) | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN
- Week 3 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d0 2027-01-26  RUN RACE 150min (RACE, completion) | d1 STRENGTH REST_BY_DESIGN | d2 2027-01-28 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 STRENGTH REST_BY_DESIGN | d3 2027-01-29 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d4 2027-01-30 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-31 PM RUN WALK 20min (WALK) | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2027-01-04","weeks":4,"asOf":"2027-01-01","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"NONE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BARBELL","BODYWEIGHT","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,5,6],"strengthDays":[0,1,3,5],"runTurn":"PM","strengthTurn":"AM","runMinutes":51,"strengthMinutes":52,"longRunDay":0,"longRunMinutes":113,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2027-01-04 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2027-01-04 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d1 2027-01-05 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2027-01-05 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-07 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d5 2027-01-09 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2027-01-09 AM STRENGTH_CORE 11min: dead-bug-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW | d6 2027-01-10 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2027-01-11 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2027-01-11 AM STRENGTH_FULL_A 27min: leg-press 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2027-01-12 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2027-01-12 AM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; seated-cable-row 2x8 RIR3 last logged; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d3 2027-01-14 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; hip-abduction-machine 1x10 RIR3 establish | d5 2027-01-16 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2027-01-16 AM STRENGTH_CORE 13min: dead-bug 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; tibialis-raise 1x10 RIR3 BW | d6 2027-01-17 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H12, RACE_10K, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-29","weeks":12,"asOf":"2026-11-26","tz":330,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"10K","date":"2027-02-17"}},"strength":"STRENGTH"},"event":{"kind":"10K","date":"2027-02-17"},"runExperience":"NONE","strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":0},"knownRuns":0,"knownExercises":[],"equipment":["RACK","BANDS","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[2,3,6],"strengthDays":[0,1,3,5,6],"runTurn":"AM","strengthTurn":"AM","runMinutes":76,"strengthMinutes":71,"longRunDay":6,"longRunMinutes":56,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · BUILD · BUILD · CONSOLIDATION · BUILD · BUILD · SPECIFIC · SPECIFIC · SPECIFIC · TAPER · RACE_WEEK
- Week 0 (ESTABLISHMENT): d0 2026-11-29 AM STRENGTH_LOWER 28min: leg-press 2x5 RIR3 establish; glute-bridge 2x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-11-30 AM STRENGTH_UPPER 28min: machine-chest-press 2x5 RIR3 establish; seated-cable-row 2x5 RIR3 establish; push-up 2x7 RIR3 BW; band-row 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-01 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-02 AM STRENGTH_LOWER_B 25min: glute-bridge 2x5 RIR3 BW; reverse-lunge 2x5 RIR3 BW; seated-calf-raise-machine 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d3 2026-12-02 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-12-04 AM STRENGTH_UPPER_B 22min: seated-cable-row 2x5 RIR3 establish; machine-chest-press 2x5 RIR3 establish; dead-bug 2x7 RIR3 BW | d6 2026-12-05 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d6 2026-12-05 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (BUILD): d0 2026-12-06 AM STRENGTH_LOWER 34min: leg-press 3x5 RIR3 last logged; glute-bridge 3x5 RIR3 BW; reverse-lunge 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d1 2026-12-07 AM STRENGTH_UPPER 34min: machine-chest-press 3x5 RIR3 last logged; seated-cable-row 3x5 RIR3 last logged; push-up 2x7 RIR3 BW; band-row 2x7 RIR3 BW; dead-bug 2x7 RIR3 BW | d2 2026-12-08 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-09 AM STRENGTH_LOWER_B 31min: glute-bridge 3x5 RIR3 BW; reverse-lunge 3x7 RIR3 BW; seated-calf-raise-machine 2x7 RIR3 last logged; dead-bug 2x7 RIR3 BW | d3 2026-12-09 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-12-11 AM STRENGTH_UPPER_B 28min: seated-cable-row 3x5 RIR3 last logged; machine-chest-press 3x5 RIR3 last logged; dead-bug 2x7 RIR3 BW | d6 2026-12-12 AM STRENGTH_CORE 18min: dead-bug 2x7 RIR3 BW; standing-calf-raise 2x7 RIR3 BW; front-plank 2x7 RIR3 BW | d6 2026-12-12 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))
- Week 10 (TAPER): d0 2027-02-07 AM STRENGTH_LOWER 24min: leg-press 2x5 RIR3 last logged; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2027-02-08 AM STRENGTH_UPPER 24min: machine-chest-press 2x5 RIR3 last logged; seated-cable-row 2x5 RIR3 last logged; push-up 1x10 RIR3 BW; band-row 1x7 RIR3 BW; dead-bug 1x10 RIR3 BW | d2 2027-02-09 AM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d3 2027-02-10 AM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; seated-calf-raise-machine 1x7 RIR3 last logged; dead-bug 1x10 RIR3 BW | d3 2027-02-10 AM RUN WALK_JOG 28min (WALK_JOG 1x(1200s jog/0s walk)) | d5 2027-02-12 AM STRENGTH_UPPER_B 13min: seated-cable-row 1x5 RIR4 last logged; machine-chest-press 1x5 RIR4 last logged | d6 STRENGTH REST_BY_DESIGN | d6 2027-02-13 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk))
- Week 11 (RACE_WEEK): d0 STRENGTH REST_BY_DESIGN | d1 STRENGTH REST_BY_DESIGN | d2 2027-02-16 AM RUN WALK 20min (WALK) | d3 STRENGTH REST_BY_DESIGN | d3 2027-02-17  RUN RACE 75min (RACE, completion) | d5 STRENGTH REST_BY_DESIGN | d6 STRENGTH REST_BY_DESIGN | d6 2027-02-20 AM RUN WALK_JOG 26min (WALK_JOG 2x(480s jog/60s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H8, NON_RACE, START_NON_MONDAY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-11","weeks":8,"asOf":"2026-11-08","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"GENERAL"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["leg-press 4x5 103KG TOTAL","hip-thrust-db 4x12 22KG PER_HAND","db-split-squat 4x8 19KG PER_HAND"],"equipment":["BARBELL","BODYWEIGHT","BENCH","PULL_UP_BAR","MACHINES","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2,5,6],"strengthDays":[2,3,4,5],"runTurn":"AM","strengthTurn":"PM","runMinutes":67,"strengthMinutes":66,"longRunDay":2,"longRunMinutes":87,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-11 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d1 2026-11-12 AM RUN WALK 20min (WALK) | d2 2026-11-13 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-11-13 PM STRENGTH_LOWER 34min: leg-press 4x5 RIR3 103kg TOTAL; hip-thrust-db 4x12 RIR3 22kg PER_HAND; db-split-squat 1x12 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-14 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 establish; db-row 2x10 RIR3 establish; db-floor-press 1x12 RIR3 establish; one-arm-db-row 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d4 2026-11-15 PM STRENGTH_LOWER_B 29min: hip-thrust-db 4x12 RIR3 22kg PER_HAND; db-split-squat 2x10 RIR3 establish; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-16 AM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d5 2026-11-16 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 establish; db-bench-press 2x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d6 2026-11-17 AM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-11-18 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d1 2026-11-19 AM RUN WALK 20min (WALK) | d2 2026-11-20 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-11-20 PM STRENGTH_LOWER 34min: leg-press 4x5 RIR3 103kg TOTAL; hip-thrust-db 4x12 RIR3 22kg PER_HAND; db-split-squat 1x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-11-21 PM STRENGTH_UPPER 25min: db-bench-press 2x10 RIR3 last logged; db-row 2x10 RIR3 last logged; db-floor-press 1x12 RIR3 last logged; one-arm-db-row 1x12 RIR3 last logged; dead-bug 1x12 RIR3 BW | d4 2026-11-22 PM STRENGTH_LOWER_B 29min: hip-thrust-db 4x12 RIR3 22kg PER_HAND; db-split-squat 2x12 RIR3 last logged; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-11-23 AM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d5 2026-11-23 PM STRENGTH_UPPER_B 21min: db-row 2x10 RIR3 last logged; db-bench-press 2x10 RIR3 last logged; dead-bug 1x12 RIR3 BW | d6 2026-11-24 AM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, OUT_OF_SCOPE, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-16","weeks":4,"asOf":"2026-11-16","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":2,"runMinutesPerWeek":114,"longestRunMinutes":29,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":["kb-goblet-squat 4x5 11KG SINGLE_IMPLEMENT"],"equipment":["MACHINES","BODYWEIGHT","KETTLEBELL","RACK","BANDS","BENCH","PULL_UP_BAR","DUMBBELLS","BARBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":["PREGNANCY"],"schedule":{"runDays":[1,6],"strengthDays":[0,1,2,4,5],"runTurn":"AM","strengthTurn":"AM","runMinutes":42,"strengthMinutes":59,"longRunDay":6,"longRunMinutes":61,"sameTurnConfirmed":false}}`

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

## R7D-G294

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":4,"asOf":"2026-12-05","tz":330,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-27"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2026-12-27"},"runExperience":"NOVICE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":5,"runMinutesPerWeek":270,"longestRunMinutes":79,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["box-squat-bodyweight 4x6 0KG BODYWEIGHT","glute-bridge 4x10 0KG BODYWEIGHT","reverse-lunge 4x10 0KG BODYWEIGHT"],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[0,6],"runTurn":"PM","strengthTurn":"PM","runMinutes":79,"strengthMinutes":56,"longRunDay":0,"longRunMinutes":111,"sameTurnConfirmed":true}}`

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

## R7D-G295

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-12","weeks":16,"asOf":"2026-12-09","tz":0,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0],"strengthDays":[0,4],"runTurn":"AM","strengthTurn":"AM","runMinutes":38,"strengthMinutes":31,"longRunDay":0,"longRunMinutes":134,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-12 AM RUN EASY 15min (EASY) | d0 2026-12-12 AM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d4 2026-12-16 AM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW
- Week 1 (DEVELOPMENT): d0 2026-12-19 AM RUN EASY 20min (EASY) | d0 2026-12-19 AM STRENGTH_FULL_A 20min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW | d4 2026-12-23 AM STRENGTH_FULL_B 20min: glute-bridge 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW

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

## R7D-G296

**Intent.** Generated onboarding intake (invariant properties only)

**Tags.** COLD_START, H12, NON_RACE, BODYWEIGHT_ONLY, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-30","weeks":12,"asOf":"2026-11-27","tz":-180,"learningConsent":false,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"MAINTAIN"},"event":null,"runExperience":null,"strengthExperience":"EXPERIENCED","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,1,2],"strengthDays":[0],"runTurn":"PM","strengthTurn":"PM","runMinutes":77,"strengthMinutes":59,"longRunDay":2,"longRunMinutes":85,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-30 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d0 2026-11-30 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-01 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-02 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk))
- Week 1 (DEVELOPMENT): d0 2026-12-07 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d0 2026-12-07 PM STRENGTH_FULL_A 24min: box-squat-bodyweight 2x8 RIR3 BW; push-up 2x8 RIR3 BW; prone-ytw-raise 1x10 RIR3 BW; standing-calf-raise 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d1 2026-12-08 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-09 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk))

**Automated properties.** no failure

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

**Tags.** COLD_START, H16, NON_RACE, START_NON_MONDAY, BODYWEIGHT_ONLY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-20","weeks":16,"asOf":"2026-12-18","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"NONE","strength":"GENERAL"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":228,"longestRunMinutes":19,"strengthDaysPerWeek":4},"knownRuns":0,"knownExercises":[],"equipment":["BODYWEIGHT"],"pause":{"nonclinical":true,"weeks":7,"reasonCategory":"TRAVEL"},"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[],"strengthDays":[1,2,3,5,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":62,"strengthMinutes":73,"sameTurnConfirmed":true}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d1 2026-12-21 AM STRENGTH_LOWER 25min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-22 AM STRENGTH_UPPER 19min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-23 AM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x10 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-25 AM STRENGTH_UPPER_B 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2026-12-26 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW
- Week 1 (DEVELOPMENT): d1 2026-12-28 AM STRENGTH_LOWER 25min: box-squat-bodyweight 2x10 RIR3 BW; glute-bridge 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d2 2026-12-29 AM STRENGTH_UPPER 19min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; incline-push-up 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d3 2026-12-30 AM STRENGTH_LOWER_B 23min: glute-bridge 2x10 RIR3 BW; reverse-lunge 2x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2027-01-01 AM STRENGTH_UPPER_B 17min: push-up 2x10 RIR3 BW; prone-ytw-raise 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d6 2027-01-02 AM STRENGTH_CORE 14min: dead-bug 1x12 RIR3 BW; standing-calf-raise 1x12 RIR3 BW; front-plank 1x12 RIR3 BW

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, NON_RACE, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-08","weeks":4,"asOf":"2026-12-06","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":"GENERAL","strength":"NONE"},"event":null,"runExperience":"NONE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":0,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["goblet-squat 5x12 13KG PER_HAND","hip-thrust-db 4x12 14KG TOTAL","db-step-up 4x10 24KG PER_HAND"],"equipment":["BENCH","BARBELL","PULL_UP_BAR","BODYWEIGHT","DUMBBELLS"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[0,2,3,5,6],"strengthDays":[],"runTurn":"PM","strengthTurn":"AM","runMinutes":77,"strengthMinutes":57,"longRunDay":5,"longRunMinutes":51,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-12-08 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d2 2026-12-10 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d3 2026-12-11 PM RUN WALK 20min (WALK) | d5 2026-12-13 PM RUN WALK_JOG 20min (WALK_JOG 3x(30s jog/120s walk)) | d6 2026-12-14 PM RUN WALK 20min (WALK)
- Week 1 (DEVELOPMENT): d0 2026-12-15 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d2 2026-12-17 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d3 2026-12-18 PM RUN WALK 20min (WALK) | d5 2026-12-20 PM RUN WALK_JOG 21min (WALK_JOG 5x(30s jog/120s walk)) | d6 2026-12-21 PM RUN WALK 20min (WALK)

**Automated properties.** no failure

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

**Tags.** COLD_START, H4, RACE_HALF, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-10","weeks":4,"asOf":"2026-12-10","tz":-180,"learningConsent":true,"eligibility":"CONFIRMED","goals":{"run":{"kind":"RACE","event":{"kind":"HALF_MARATHON","date":"2026-12-29"}},"strength":"GENERAL"},"event":{"kind":"HALF_MARATHON","date":"2026-12-29"},"runExperience":"EXPERIENCED","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":4,"runMinutesPerWeek":104,"longestRunMinutes":77,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BENCH","MACHINES"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[5],"strengthDays":[0,3],"runTurn":"PM","strengthTurn":"AM","runMinutes":47,"strengthMinutes":48,"longRunDay":5,"longRunMinutes":146,"sameTurnConfirmed":false}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · BUILD · RACE_WEEK · POST_EVENT
- Week 0 (ESTABLISHMENT): d0 2026-12-10 AM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d3 2026-12-13 AM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 establish; db-floor-press 2x8 RIR3 establish; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-15 PM RUN LONG 75min (LONG)
- Week 1 (BUILD): d0 2026-12-17 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d3 2026-12-20 AM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-22 PM RUN LONG 75min (LONG)
- Week 1 (BUILD): d0 2026-12-17 AM STRENGTH_FULL_A 28min: goblet-squat 2x10 RIR3 establish; db-floor-press 2x8 RIR3 last logged; db-row 2x8 RIR3 last logged; db-calf-raise 1x12 RIR3 establish; dead-bug 1x12 RIR3 BW | d3 2026-12-20 AM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; db-row 2x8 RIR3 last logged; db-floor-press 2x8 RIR3 last logged; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-22 PM RUN LONG 75min (LONG)
- Week 2 (RACE_WEEK): d0 2026-12-24 AM STRENGTH_FULL_A 16min: goblet-squat 1x10 RIR4 last logged; db-floor-press 1x8 RIR4 last logged; db-row 1x8 RIR4 last logged | d3 STRENGTH REST_BY_DESIGN | d5 2026-12-29  RUN RACE 150min (RACE)

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

**Tags.** COLD_START, H12, NON_RACE, START_NON_MONDAY, ELIGIBILITY_UNKNOWN, SHARED_DAYS · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-12-26","weeks":12,"asOf":"2026-12-26","tz":60,"learningConsent":true,"eligibility":"UNKNOWN","goals":{"run":"GENERAL","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"EXPERIENCED","strengthExperience":"NONE","recent":{"runDaysPerWeek":1,"runMinutesPerWeek":32,"longestRunMinutes":18,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["MACHINES","BANDS","BODYWEIGHT","BENCH","PULL_UP_BAR","DUMBBELLS","BARBELL","RACK","KETTLEBELL"],"pause":null,"wearable":null,"history":0,"ageYears":null,"specialPopulation":null,"schedule":{"runDays":[6],"strengthDays":[1,2,3,4,6],"runTurn":"PM","strengthTurn":"AM","runMinutes":89,"strengthMinutes":35,"longRunDay":6,"longRunMinutes":143,"sameTurnConfirmed":true}}`

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

