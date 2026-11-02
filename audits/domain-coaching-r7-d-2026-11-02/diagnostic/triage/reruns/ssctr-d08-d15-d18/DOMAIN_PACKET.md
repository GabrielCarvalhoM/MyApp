# R7-D domain-evaluation packet (R7D-DIAGNOSTIC-1)

Runtime R7C-FREEZE-4 (a9654c8), harness R7D-HARNESS-1, first evaluation: false. Corpus sha256 44fca38174a8999888dac4b2bfc6cafdfde2c6a0dcc089a563121af5a6740957.

Per case: what the case asks, the intake, onboarding, every decision (current week = prescription; next week = provisional projection), automated results, the author's expectations and independent assessment.

## R7D-D08

**Intent.** A balanced hybrid athlete trains run and strength on two shared days in different turns. Two double conflicts arrive (one with same-turn confirmation, one without) and later the long-run day becomes unavailable when no other chosen run day is left that week. It probes turn handling, the confirmation rule, and that sessions are never moved to unchosen days.

**Tags.** BALANCED_HYBRID, NON_RACE, H12, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, GYM, SHARED_DAYS, SAME_TURN, DOUBLE_CONFLICT, UNAVAILABLE_DAY, FREQ_HIGH, START_NON_MONDAY · oracle INVARIANT_ORACLE

**Intake.** `{"startDate":"2026-11-17","weeks":12,"asOf":"2026-11-16","tz":0,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"REGULAR","strength":"HYPERTROPHY"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":75,"strengthDaysPerWeek":3},"knownRuns":0,"knownExercises":["leg-press 3x10 140KG MACHINE_STACK","machine-chest-press 3x10 50KG MACHINE_STACK","lat-pulldown 3x10 55KG MACHINE_STACK","db-rdl 3x10 22KG PER_HAND","seated-cable-row 3x12 50KG MACHINE_STACK"],"equipment":["MACHINES","DUMBBELLS","BENCH","BANDS","PULL_UP_BAR","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":31,"specialPopulation":null,"schedule":{"runDays":[0,2,5],"strengthDays":[0,2,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":45,"strengthMinutes":60,"longRunDay":5,"longRunMinutes":90}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2026-11-17 AM RUN EASY 40min (EASY) | d0 2026-11-17 PM STRENGTH_LOWER 35min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 3x10 RIR3 22kg PER_HAND; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d2 2026-11-19 AM RUN EASY 40min (EASY) | d2 2026-11-19 PM STRENGTH_FULL_B 40min: db-rdl 3x10 RIR3 22kg PER_HAND; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d4 2026-11-21 PM STRENGTH_UPPER 36min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2026-11-22 AM RUN LONG 65min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-11-24 AM RUN EASY 40min (EASY) | d0 2026-11-24 PM STRENGTH_LOWER 36min: leg-press 3x12 RIR3 140kg MACHINE_STACK; db-rdl 3x12 RIR3 22kg PER_HAND; leg-extension-machine 2x10 RIR3 last logged; db-calf-raise 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d2 2026-11-26 AM RUN EASY 40min (EASY) | d2 2026-11-26 PM STRENGTH_FULL_B 40min: db-rdl 3x12 RIR3 22kg PER_HAND; seated-cable-row 3x8 RIR3 51kg MACHINE_STACK; machine-chest-press 3x12 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 last logged; cable-triceps-pushdown 2x10 RIR3 last logged | d4 2026-11-28 PM STRENGTH_UPPER 36min: machine-chest-press 3x12 RIR3 50kg MACHINE_STACK; seated-cable-row 3x8 RIR3 51kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 last logged; db-biceps-curl 2x10 RIR3 last logged; dead-bug 2x12 RIR3 BW | d5 2026-11-29 AM RUN LONG 65min (LONG)

### w0 · 2026-11-23T20:00:00+00:00 · WEEKLY_REVIEW (week 0)

- Athlete: 6 report(s): w0-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 35min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d2 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / ADOPT_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 5 load question(s) · new plan
- Reason: Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","seated-cable-row":"ADVANCE","machine-chest-press":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 0 (DEVELOPMENT) from 2026-11-23: —
- Next week 1 (DEVELOPMENT, provisional): d0 2026-11-24 AM RUN EASY 40min (EASY) | d0 2026-11-24 PM STRENGTH_LOWER 36min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 3x12 RIR3 22kg PER_HAND; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x12 RIR3 BW | d2 2026-11-26 AM RUN EASY 40min (EASY) | d2 2026-11-26 PM STRENGTH_FULL_B 40min: db-rdl 3x12 RIR3 22kg PER_HAND; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d4 2026-11-28 PM STRENGTH_UPPER 36min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x12 RIR3 BW | d5 2026-11-29 AM RUN LONG 65min (LONG)

### w1 · 2026-11-30T20:00:00+00:00 · WEEKLY_REVIEW (week 1)

- Athlete: 6 report(s): w1-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d2 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / ADOPT_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 5 load question(s) · new plan
- Reason: Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","seated-cable-row":"ADVANCE","machine-chest-press":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-11-30: —
- Next week 2 (DEVELOPMENT, provisional): d0 2026-12-01 AM RUN EASY 45min (EASY +strides) | d0 2026-12-01 PM STRENGTH_LOWER 35min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 3x8 RIR3 24kg PER_HAND; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 2x14 RIR3 BW | d2 2026-12-03 AM RUN EASY 40min (EASY) | d2 2026-12-03 PM STRENGTH_FULL_B 40min: db-rdl 3x8 RIR3 24kg PER_HAND; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d4 2026-12-05 PM STRENGTH_UPPER 36min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 2x14 RIR3 BW | d5 2026-12-06 AM RUN LONG 65min (LONG)

### w2 · 2026-12-07T20:00:00+00:00 · WEEKLY_REVIEW (week 2)

- Athlete: 6 report(s): w2-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 35min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d2 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d4 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / ADOPT_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 5 load question(s) · new plan
- Reason: Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","seated-cable-row":"ADVANCE","machine-chest-press":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 2 (DEVELOPMENT) from 2026-12-07: —
- Next week 3 (CONSOLIDATION, provisional): d0 2026-12-08 AM RUN EASY 45min (EASY +strides) | d0 2026-12-08 PM STRENGTH_LOWER 25min: leg-press 2x10 RIR3 140kg MACHINE_STACK; db-rdl 2x10 RIR3 24kg PER_HAND; leg-extension-machine 1x10 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 1x16 RIR3 BW | d2 2026-12-10 AM RUN EASY 40min (EASY) | d2 2026-12-10 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 24kg PER_HAND; seated-cable-row 2x12 RIR3 50kg MACHINE_STACK; machine-chest-press 2x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 1x10 RIR3 establish; cable-triceps-pushdown 1x10 RIR3 establish | d4 2026-12-12 PM STRENGTH_UPPER 25min: machine-chest-press 2x10 RIR3 50kg MACHINE_STACK; seated-cable-row 2x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 1x10 RIR3 establish; db-biceps-curl 1x10 RIR3 establish; dead-bug 1x16 RIR3 BW | d5 2026-12-13 AM RUN LONG 55min (LONG)

### dc3 · 2026-12-09T12:00:00+00:00 · DOUBLE_CONFLICT (week 3)

- Athlete: no reports · changes `{"from":"2026-12-10","to":"2026-12-10","runTurn":"PM","strengthTurn":"PM","sameTurnConfirmed":true}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION
- Reason: The change is stated for 2026-12-10 only; a dated window of days or shifts is not re-planned automatically. Say whether the change is permanent from a date, or move or skip the affected sessions
- Current week 3 (CONSOLIDATION) from 2026-12-09: d2 2026-12-10 AM RUN EASY 40min (EASY) | d2 2026-12-10 PM STRENGTH_FULL_B 28min: db-rdl 2x10 RIR3 24kg PER_HAND; seated-cable-row 2x12 RIR3 50kg MACHINE_STACK; machine-chest-press 2x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 1x10 RIR3 establish; cable-triceps-pushdown 1x10 RIR3 establish | d4 2026-12-12 PM STRENGTH_UPPER 25min: machine-chest-press 2x10 RIR3 50kg MACHINE_STACK; seated-cable-row 2x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 1x10 RIR3 establish; db-biceps-curl 1x10 RIR3 establish; dead-bug 1x16 RIR3 BW | d5 2026-12-13 AM RUN LONG 55min (LONG)
- Next week 4 (DEVELOPMENT, provisional): d0 2026-12-15 AM RUN EASY 45min (EASY +strides) | d0 2026-12-15 PM STRENGTH_LOWER 48min: leg-press 4x10 RIR3 140kg MACHINE_STACK; db-rdl 4x10 RIR3 24kg PER_HAND; leg-extension-machine 3x10 RIR3 last logged; db-calf-raise 3x10 RIR3 last logged; dead-bug 3x16 RIR3 BW | d2 2026-12-17 AM RUN EASY 40min (EASY) | d2 2026-12-17 PM STRENGTH_FULL_B 52min: db-rdl 4x10 RIR3 24kg PER_HAND; seated-cable-row 4x12 RIR3 50kg MACHINE_STACK; machine-chest-press 4x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 3x10 RIR3 last logged; cable-triceps-pushdown 3x10 RIR3 last logged | d4 2026-12-19 PM STRENGTH_UPPER 48min: machine-chest-press 4x10 RIR3 50kg MACHINE_STACK; seated-cable-row 4x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 3x10 RIR3 last logged; db-biceps-curl 3x10 RIR3 last logged; dead-bug 3x16 RIR3 BW | d5 2026-12-20 AM RUN LONG 65min (LONG)

### w3 · 2026-12-14T20:00:00+00:00 · WEEKLY_REVIEW (week 3)

- Athlete: 6 report(s): w3-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d5 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d0 done 25min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d2 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d4 done 25min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · offers LADDER_STEP,LADDER_STEP · 5 load question(s) · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","seated-cable-row":"ADVANCE","machine-chest-press":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 3 (CONSOLIDATION) from 2026-12-14: —
- Next week 4 (DEVELOPMENT, provisional): d0 2026-12-15 AM RUN EASY 45min (EASY +strides) | d0 2026-12-15 PM STRENGTH_LOWER 41min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 4x10 RIR3 24kg PER_HAND; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 3x16 RIR3 BW | d2 2026-12-17 AM RUN EASY 40min (EASY) | d2 2026-12-17 PM STRENGTH_FULL_B 43min: db-rdl 4x10 RIR3 24kg PER_HAND; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d4 2026-12-19 PM STRENGTH_UPPER 39min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 3x16 RIR3 BW | d5 2026-12-20 AM RUN LONG 65min (LONG)

### w4 · 2026-12-21T20:00:00+00:00 · WEEKLY_REVIEW (week 4)

- Athlete: 6 report(s): w4-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d0 done 41min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d2 done 43min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d4 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / ADOPT_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 5 load question(s) · new plan
- Reason: Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","seated-cable-row":"ADVANCE","machine-chest-press":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 4 (DEVELOPMENT) from 2026-12-21: —
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-22 AM RUN EASY 45min (EASY +strides) | d0 2026-12-22 PM STRENGTH_LOWER 42min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 4x12 RIR3 24kg PER_HAND; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 3x16 RIR3 BW | d2 2026-12-24 AM RUN EASY 45min (EASY) | d2 2026-12-24 PM STRENGTH_FULL_B 43min: db-rdl 4x12 RIR3 24kg PER_HAND; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d4 2026-12-26 PM STRENGTH_UPPER 39min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 3x16 RIR3 BW | d5 2026-12-27 AM RUN LONG 65min (LONG)

### dc5 · 2026-12-21T20:30:00+00:00 · DOUBLE_CONFLICT (week 4)

- Athlete: no reports · changes `{"from":"2026-12-22","to":"2026-12-22","runTurn":"PM","strengthTurn":"PM","sameTurnConfirmed":false}`
- Coach: **ASK** / ASK · REQUIRES_RECONCILIATION · 5 load question(s)
- Reason: The change is stated for 2026-12-22 only; a dated window of days or shifts is not re-planned automatically. Say whether the change is permanent from a date, or move or skip the affected sessions
- Current week 4 (DEVELOPMENT) from 2026-12-21: —
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-22 AM RUN EASY 45min (EASY +strides) | d0 2026-12-22 PM STRENGTH_LOWER 42min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 4x12 RIR3 24kg PER_HAND; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 3x16 RIR3 BW | d2 2026-12-24 AM RUN EASY 45min (EASY) | d2 2026-12-24 PM STRENGTH_FULL_B 43min: db-rdl 4x12 RIR3 24kg PER_HAND; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d4 2026-12-26 PM STRENGTH_UPPER 39min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 3x16 RIR3 BW | d5 2026-12-27 AM RUN LONG 65min (LONG)

### w5 · 2026-12-28T20:00:00+00:00 · WEEKLY_REVIEW (week 5)

- Athlete: 6 report(s): w5-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d2 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d0 done 42min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d2 done 43min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d4 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / ADOPT_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 5 load question(s) · new plan
- Reason: Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","seated-cable-row":"ADVANCE","machine-chest-press":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 5 (DEVELOPMENT) from 2026-12-28: —
- Next week 6 (DEVELOPMENT, provisional): d0 2026-12-29 AM RUN EASY 45min (EASY +strides) | d0 2026-12-29 PM STRENGTH_LOWER 40min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 4x8 RIR3 26kg PER_HAND; leg-extension-machine 2x10 RIR3 establish; db-calf-raise 2x10 RIR3 establish; dead-bug 3x16 RIR3 BW | d2 2026-12-31 AM RUN EASY 45min (EASY) | d2 2026-12-31 PM STRENGTH_FULL_B 42min: db-rdl 4x8 RIR3 26kg PER_HAND; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; cable-triceps-pushdown 2x10 RIR3 establish | d4 2027-01-02 PM STRENGTH_UPPER 39min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 3x16 RIR3 BW | d5 2027-01-03 AM RUN LONG 65min (LONG)

### u6 · 2027-01-01T18:00:00+00:00 · UNAVAILABLE_DAY (week 6)

- Athlete: no reports · changes `{"unavailableDates":["2027-01-03"]}`
- Coach: **MODIFY** / RESCHEDULE_WITHIN_WEEK · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Sessions on the unavailable date are moved within chosen days when that adds no interference, otherwise skipped without debt
- Current week 6 (DEVELOPMENT) from 2027-01-01: d4 2027-01-02 PM STRENGTH_UPPER 39min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; db-biceps-curl 2x10 RIR3 establish; dead-bug 3x16 RIR3 BW | d5 2027-01-03 AM RUN LONG 65min (LONG) [SKIPPED]
- Next week 7 (CONSOLIDATION, provisional): d0 2027-01-05 AM RUN EASY 45min (EASY +strides) | d0 2027-01-05 PM STRENGTH_LOWER 30min: leg-press 2x12 RIR3 140kg MACHINE_STACK; db-rdl 3x10 RIR3 26kg PER_HAND; leg-extension-machine 1x10 RIR3 last logged; db-calf-raise 1x10 RIR3 last logged; dead-bug 2x16 RIR3 BW | d2 2027-01-07 AM RUN EASY 45min (EASY) | d2 2027-01-07 PM STRENGTH_FULL_B 31min: db-rdl 3x10 RIR3 26kg PER_HAND; seated-cable-row 2x8 RIR3 51kg MACHINE_STACK; machine-chest-press 2x12 RIR3 50kg MACHINE_STACK; leg-curl-machine 1x10 RIR3 last logged; cable-triceps-pushdown 1x10 RIR3 last logged | d4 2027-01-09 PM STRENGTH_UPPER 27min: machine-chest-press 2x12 RIR3 50kg MACHINE_STACK; seated-cable-row 2x8 RIR3 51kg MACHINE_STACK; db-lateral-raise 1x10 RIR3 last logged; db-biceps-curl 1x10 RIR3 last logged; dead-bug 2x16 RIR3 BW | d5 2027-01-10 AM RUN LONG 55min (LONG)

### w6 · 2027-01-04T20:00:00+00:00 · WEEKLY_REVIEW (week 6)

- Athlete: 5 report(s): w6-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d2 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d0 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d2 done 42min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d4 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 5 load question(s) · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","EASY":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","seated-cable-row":"ADVANCE","machine-chest-press":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 6 (DEVELOPMENT) from 2027-01-04: —
- Next week 7 (CONSOLIDATION, provisional): d0 2027-01-05 AM RUN EASY 45min (EASY +strides) | d0 2027-01-05 PM STRENGTH_LOWER 30min: leg-press 2x10 RIR3 140kg MACHINE_STACK; db-rdl 3x10 RIR3 26kg PER_HAND; leg-extension-machine 1x10 RIR3 establish; db-calf-raise 1x10 RIR3 establish; dead-bug 2x16 RIR3 BW | d2 2027-01-07 AM RUN EASY 45min (EASY) | d2 2027-01-07 PM STRENGTH_FULL_B 31min: db-rdl 3x10 RIR3 26kg PER_HAND; seated-cable-row 2x12 RIR3 50kg MACHINE_STACK; machine-chest-press 2x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 1x10 RIR3 establish; cable-triceps-pushdown 1x10 RIR3 establish | d4 2027-01-09 PM STRENGTH_UPPER 27min: machine-chest-press 2x10 RIR3 50kg MACHINE_STACK; seated-cable-row 2x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 1x10 RIR3 establish; db-biceps-curl 1x10 RIR3 establish; dead-bug 2x16 RIR3 BW | d5 2027-01-10 AM RUN LONG 55min (LONG)

### w7 · 2027-01-11T20:00:00+00:00 · WEEKLY_REVIEW (week 7)

- Athlete: 6 report(s): w7-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d2 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d5 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d0 done 30min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d2 done 31min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d4 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · offers LADDER_STEP,LADDER_STEP · 5 load question(s) · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","seated-cable-row":"ADVANCE","machine-chest-press":"ADVANCE","leg-curl-machine":"ADVANCE","cable-triceps-pushdown":"ADVANCE","db-lateral-raise":"ADVANCE","db-biceps-curl":"ADVANCE"}`
- Current week 7 (CONSOLIDATION) from 2027-01-11: —
- Next week 8 (DEVELOPMENT, provisional): d0 2027-01-12 AM RUN EASY 45min (EASY +strides) | d0 2027-01-12 PM STRENGTH_LOWER 38min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 4x10 RIR3 26kg PER_HAND; leg-extension-machine 2x10 RIR3 establish; standing-calf-raise 2x10 RIR3 BW; front-plank 2x10 RIR3 BW | d2 2027-01-14 AM RUN EASY 45min (EASY) | d2 2027-01-14 PM STRENGTH_FULL_B 43min: db-rdl 4x10 RIR3 26kg PER_HAND; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; db-overhead-triceps-extension 2x10 RIR3 establish | d4 2027-01-16 PM STRENGTH_UPPER 36min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; band-biceps-curl 2x10 RIR3 BW; front-plank 2x10 RIR3 BW | d5 2027-01-17 AM RUN LONG 65min (LONG)

### w8 · 2027-01-18T20:00:00+00:00 · WEEKLY_REVIEW (week 8)

- Athlete: 6 report(s): w8-run-d0 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-run-d2 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-run-d5 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-str-d0 done 38min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-str-d2 done 43min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-str-d4 done 36min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / ADOPT_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 5 load question(s) · new plan
- Reason: Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","leg-press":"ADVANCE","db-rdl":"ADVANCE","leg-extension-machine":"ADVANCE","standing-calf-raise":"ADVANCE","front-plank":"ADVANCE","seated-cable-row":"ADVANCE","machine-chest-press":"ADVANCE","leg-curl-machine":"ADVANCE","db-overhead-triceps-extension":"ADVANCE","db-lateral-raise":"ADVANCE","band-biceps-curl":"ADVANCE"}`
- Current week 8 (DEVELOPMENT) from 2027-01-18: —
- Next week 9 (DEVELOPMENT, provisional): d0 2027-01-19 AM RUN EASY 45min (EASY +strides) | d0 2027-01-19 PM STRENGTH_LOWER 39min: leg-press 3x10 RIR3 140kg MACHINE_STACK; db-rdl 4x12 RIR3 26kg PER_HAND; leg-extension-machine 2x10 RIR3 establish; standing-calf-raise 2x12 RIR3 BW; front-plank 2x12 RIR3 BW | d2 2027-01-21 AM RUN EASY 45min (EASY) | d2 2027-01-21 PM STRENGTH_FULL_B 43min: db-rdl 4x12 RIR3 26kg PER_HAND; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; leg-curl-machine 2x10 RIR3 establish; db-overhead-triceps-extension 2x10 RIR3 establish | d4 2027-01-23 PM STRENGTH_UPPER 36min: machine-chest-press 3x10 RIR3 50kg MACHINE_STACK; seated-cable-row 3x12 RIR3 50kg MACHINE_STACK; db-lateral-raise 2x10 RIR3 establish; band-biceps-curl 2x10 RIR3 BW; front-plank 2x12 RIR3 BW | d5 2027-01-24 AM RUN LONG 65min (LONG)

**Automated properties.** no failure

**Metamorphic.** no violation · non-blocking differences: LOAD_CONVENTION_EQUIVALENT

**Author expectations.**
- d08-e01 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- d08-e02 @GENERATE JUDGED [INVARIANT_ORACLE]: **JUDGED** — On the shared days 0 and 2 the run is in the AM turn and strength in the PM turn; no day has both sports in the same turn.
- d08-e03 @GENERATE JUDGED [DOMAIN_ORACLE]: **JUDGED** — The Saturday strength session before the Sunday long run is not the heaviest lower-body session of the week, and the run on a shared day is not a hard quality run placed just before the heaviest lower-body work of that evening.
- d08-e04 @dc3 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"ASK"`
- d08-e05 @dc3 VALIDITY_IS [DOMAIN_ORACLE]: **FAIL** observed `"REQUIRES_RECONCILIATION"`
- d08-e06 @dc3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — On Thursday of week 3 both sessions are in the PM turn (confirmed) and the combination is sensible: an easy or shortened run with the strength session, not a quality run stacked on heavy legs.
- d08-e07 @dc5 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"ASK"`
- d08-e08 @dc5 JUDGED [INVARIANT_ORACLE]: **JUDGED** — On Tuesday of week 5 the plan does not contain two live sessions in the same turn; if one is dropped it is marked skipped, not moved to a day the athlete did not choose.
- d08-e09 @u6 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- d08-e10 @u6 JUDGED [INVARIANT_ORACLE]: **JUDGED** — No session is dated Sunday of week 6, and no run is placed on Wednesday, Friday, Saturday or Monday of week 6 (days the athlete did not choose for running); the long run of week 6 is skipped rather than moved to an unchosen day or doubled up.
- d08-e11 @u6 JUDGED [DOMAIN_ORACLE]: **JUDGED** — The week-7 long run is not extended to compensate for the skipped week-6 long run: it is no longer than what had been planned for week 6.

**Independent assessment (author, written before any output).**
- Rationale: An intermediate hybrid athlete in a gym without barbells, three runs and three hypertrophy sessions with two shared days. Most of the difficulty is in the schedule, not the dose.
- Preferred: Run AM / lift PM on shared days, Sunday long run, upper or lighter emphasis on Saturday. On the confirmed Thursday, put both in the evening with the easy run first or a short run after lifting. On the unconfirmed Tuesday, keep one session in the evening (strength, or an easy run if the coach prefers to protect running) and skip the other; asking which one is also fine. On the unavailable Sunday, skip the week-6 long run; resume the planned progression in week 7 without compensating.
- Acceptable alternatives: Shortening the Thursday run when stacked with strength. / Asking at dc5 which session to keep. / Turning the remaining week-6 strength session lighter to compensate for nothing (not required).
- Concerns: Placing both sessions in the same turn on the unconfirmed day. / Moving the long run to Saturday (a strength-only day) or Monday (unchosen). / A longer week-7 long run to catch up. / Quality running stacked before heavy lower-body work on shared days.
- Domain notes: Bulk reports cover only planned, non-skipped sessions, so the week-5 and week-6 reviews stay valid whichever session the coach drops.

## R7D-D15

**Intent.** A run-first athlete with a partial watch history sends messy data: the same long run from phone and watch (watch stamped in UTC, which falls on the previous calendar day), reports out of order with an in-review correction, a correction a week late, and a watch clock set two days ahead. It probes de-duplication, local-date attribution, correction semantics and future-clock handling.

**Tags.** RUN_FIRST, NON_RACE, H8, RUN_EXP_INTERMEDIATE, STR_EXP_NOVICE, WEARABLE_PARTIAL, START_NON_MONDAY, TIMEZONE, DUPLICATE_SOURCES, CORRECTION, OUT_OF_ORDER, CLOCK_SKEW, CONTRADICTION, SAME_FACTS_DIFFERENT_ORDER · oracle METAMORPHIC_ORACLE

**Intake.** `{"startDate":"2026-11-24","weeks":8,"asOf":"2026-11-23","tz":660,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"RUNNING_SUPPORT"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"NOVICE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":135,"longestRunMinutes":70,"strengthDaysPerWeek":1},"knownRuns":0,"knownExercises":[],"equipment":["DUMBBELLS","BODYWEIGHT","BANDS"],"pause":null,"wearable":"PARTIAL","history":8,"ageYears":30,"specialPopulation":null,"schedule":{"runDays":[0,2,5],"strengthDays":[1,3],"runTurn":"AM","strengthTurn":"PM","runMinutes":45,"strengthMinutes":45,"longRunDay":5,"longRunMinutes":90}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: ESTABLISHMENT · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT
- Week 0 (ESTABLISHMENT): d0 2026-11-24 AM RUN EASY 35min (EASY) | d1 2026-11-25 PM STRENGTH_FULL_A 15min: sit-to-stand 1x5 RIR3 BW; wall-pushup 1x5 RIR3 BW; prone-row-practice 1x5 RIR3 BW; supported-calf-raise 1x5 RIR3 BW; dead-bug-practice 1x5 RIR3 BW | d2 2026-11-26 AM RUN EASY 35min (EASY) | d3 2026-11-27 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-11-29 AM RUN LONG 55min (LONG)
- Week 1 (DEVELOPMENT): d0 2026-12-01 AM RUN EASY 35min (EASY) | d1 2026-12-02 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-12-03 AM RUN EASY 35min (EASY) | d3 2026-12-04 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-06 AM RUN LONG 55min (LONG)

### w0 · 2026-11-30T20:00:00+11:00 · WEEKLY_REVIEW (week 0)

- Athlete: 6 report(s): w0-run-d0 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d2 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) via phone-app; w0-run-d5 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-11-28T20:12:00Z via watch-b; w0-str-d1 done 15min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Executed as planned without adverse signal; the planned progression step stands
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","sit-to-stand":"ADVANCE","wall-pushup":"ADVANCE","prone-row-practice":"ADVANCE","supported-calf-raise":"ADVANCE","dead-bug-practice":"ADVANCE","glute-bridge":"ADVANCE","band-row":"ADVANCE","incline-push-up":"ADVANCE","reverse-lunge":"ADVANCE","dead-bug":"ADVANCE"}`
- Current week 0 (ESTABLISHMENT) from 2026-11-30: —
- Next week 1 (DEVELOPMENT, provisional): d0 2026-12-01 AM RUN EASY 35min (EASY) | d1 2026-12-02 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x8 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x10 RIR3 BW | d2 2026-12-03 AM RUN EASY 35min (EASY) | d3 2026-12-04 PM STRENGTH_FULL_B 27min: glute-bridge 2x8 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x8 RIR3 BW; reverse-lunge 1x10 RIR3 BW; dead-bug 1x10 RIR3 BW | d5 2026-12-06 AM RUN LONG 55min (LONG)

### w1 · 2026-12-07T20:00:00+11:00 · WEEKLY_REVIEW (week 1)

- Athlete: 6 report(s): w1-run-d5 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) reportedAt 2026-12-06T10:00:00+11:00; w1-run-d2 done 95min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) reportedAt 2026-12-07T18:00:00+11:00; w1-run-d0 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) reportedAt 2026-12-07T18:05:00+11:00; w1-run-d2 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) reportedAt 2026-12-07T19:30:00+11:00 corrects d15-w1-d2; w1-str-d1 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d3 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2026-12-07: —
- Next week 2 (DEVELOPMENT, provisional): d0 2026-12-08 AM RUN EASY 35min (EASY) | d1 2026-12-09 PM STRENGTH_FULL_A 27min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x10 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x12 RIR3 BW | d2 2026-12-10 AM RUN EASY 35min (EASY) | d3 2026-12-11 PM STRENGTH_FULL_B 28min: glute-bridge 2x10 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x10 RIR3 BW; reverse-lunge 1x12 RIR3 BW; dead-bug 1x12 RIR3 BW | d5 2026-12-13 AM RUN LONG 55min (LONG)

### w2 · 2026-12-14T20:00:00+11:00 · WEEKLY_REVIEW (week 2)

- Athlete: 5 report(s): w2-run-d0 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d2 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 not done; w2-str-d1 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d3 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 2 (DEVELOPMENT) from 2026-12-14: —
- Next week 3 (DEVELOPMENT, provisional): d0 2026-12-15 AM RUN EASY 40min (EASY) | d1 2026-12-16 PM STRENGTH_FULL_A 28min: goblet-squat 2x8 RIR3 establish; incline-push-up 2x12 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x14 RIR3 BW | d2 2026-12-17 AM RUN EASY 35min (EASY) | d3 2026-12-18 PM STRENGTH_FULL_B 29min: glute-bridge 2x12 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 2x12 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d5 2026-12-20 AM RUN LONG 55min (LONG)

### w3 · 2026-12-21T20:00:00+11:00 · WEEKLY_REVIEW (week 3)

- Athlete: 6 report(s): w2-run-d5 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) corrects d15-w2-long; w3-run-d0 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d2 done 35min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d5 done 55min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d1 done 28min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d3 done 29min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Executed as planned this week; next week’s runs follow the executed record, not the plan’s earlier projection (quality 34 min, planned easy 40 min; easy 40 min, planned easy 35 min); so the plan is re-based, not kept
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 3 (DEVELOPMENT) from 2026-12-21: —
- Next week 4 (CONSOLIDATION, provisional): d0 2026-12-22 AM RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2026-12-23 PM STRENGTH_FULL_A 20min: goblet-squat 1x8 RIR3 establish; incline-push-up 1x14 RIR3 BW; band-row 1x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 1x14 RIR3 BW | d2 2026-12-24 AM RUN EASY 40min (EASY +strides) | d3 2026-12-25 PM STRENGTH_FULL_B 21min: glute-bridge 1x14 RIR3 BW; band-row 1x8 RIR3 BW; incline-push-up 1x14 RIR3 BW; reverse-lunge 1x14 RIR3 BW; dead-bug 1x14 RIR3 BW | d5 2026-12-27 AM RUN LONG 50min (LONG)

### w4 · 2026-12-28T20:00:00+11:00 · WEEKLY_REVIEW (week 4)

- Athlete: 5 report(s): w4-run-d0 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-run-d5 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-12-30T07:05:00+11:00 via watch-b; w4-str-d1 done 20min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w4-str-d3 done 21min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · offers LADDER_STEP,LADDER_STEP,LADDER_STEP,LADDER_STEP,LADDER_STEP · new plan
- Reason: Next week repeats or steps back only where this week’s evidence requires it; no debt, no compensation
- Gates: `{"LONG":"HOLD","QUALITY":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 4 (CONSOLIDATION) from 2026-12-28: —
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-29 AM RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2026-12-30 PM STRENGTH_FULL_A 33min: goblet-squat 2x8 RIR3 establish; incline-push-up 3x14 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 2x14 RIR3 BW | d2 2026-12-31 AM RUN EASY 40min (EASY +strides) | d3 2027-01-01 PM STRENGTH_FULL_B 39min: glute-bridge 3x14 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 3x14 RIR3 BW; reverse-lunge 2x14 RIR3 BW; dead-bug 2x14 RIR3 BW | d5 2027-01-03 AM RUN LONG 60min (LONG)

### f4 · 2026-12-28T21:30:00+11:00 · WEEKLY_REVIEW (week 4)

- Athlete: 1 report(s): w4-run-d5 done 50min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL) at 2026-12-27T07:05:00+11:00 via watch-b
- Coach: **MODIFY** / GATED_NEXT_STEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · offers LADDER_STEP,LADDER_STEP,LADDER_STEP,LADDER_STEP,LADDER_STEP · new plan
- Reason: Executed as planned this week; next week’s runs follow the executed record, not the plan’s earlier projection; so the plan is re-based, not kept
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 4 (CONSOLIDATION) from 2026-12-28: —
- Next week 5 (DEVELOPMENT, provisional): d0 2026-12-29 AM RUN QUALITY 34min (THRESHOLD 3x5'/2') | d1 2026-12-30 PM STRENGTH_FULL_A 33min: goblet-squat 2x8 RIR3 establish; incline-push-up 3x14 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 2x14 RIR3 BW | d2 2026-12-31 AM RUN EASY 40min (EASY +strides) | d3 2027-01-01 PM STRENGTH_FULL_B 39min: glute-bridge 3x14 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 3x14 RIR3 BW; reverse-lunge 2x14 RIR3 BW; dead-bug 2x14 RIR3 BW | d5 2027-01-03 AM RUN LONG 60min (LONG)

### w5 · 2027-01-04T20:00:00+11:00 · WEEKLY_REVIEW (week 5)

- Athlete: 5 report(s): w5-run-d0 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d2 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-run-d5 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d1 done 33min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w5-str-d3 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","band-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","reverse-lunge":"ADVANCE"}`
- Current week 5 (DEVELOPMENT) from 2027-01-04: —
- Next week 6 (DEVELOPMENT, provisional): d0 2027-01-05 AM RUN QUALITY 41min (THRESHOLD 4x5'/2') | d1 2027-01-06 PM STRENGTH_FULL_A 33min: goblet-squat 2x8 RIR3 establish; incline-push-up 3x14 RIR3 BW; band-row 2x8 RIR3 BW; db-calf-raise 1x10 RIR3 establish; dead-bug 2x14 RIR3 BW | d2 2027-01-07 AM RUN EASY 40min (EASY +strides) | d3 2027-01-08 PM STRENGTH_FULL_B 39min: glute-bridge 3x14 RIR3 BW; band-row 2x8 RIR3 BW; incline-push-up 3x14 RIR3 BW; reverse-lunge 2x14 RIR3 BW; dead-bug 2x14 RIR3 BW | d5 2027-01-10 AM RUN LONG 65min (LONG)

**Automated properties.** P10 FAIL `[{"at":"w2","issue":"RECORD_ROW_DROPPED","eventId":"d15-w1-long"}]`

**Metamorphic.** RESEND `[{"issue":"DECISIONS_DIFFER","at":"w2","decisionA":{"status":"MODIFY","action":"GATED_NEXT_STEP","validity":"VALID_WITHIN_CURRENT_BOUNDED_SCOPE","question":null,"gates":{"EASY":"ADVANCE","LONG":"HOLD","band-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","reverse-lunge":"ADVANCE"},"offers":[],"pending":null},"decisionB":{"status":"MODIFY","action":"GATED_NEXT_STEP","validity":"VALID_WITHIN_CURRENT_BOUNDED_SCOPE","question":null,"gates":{"EASY":"ADVANCE","LONG":"HOLD","band-row":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","glute-bridge":"ADVANCE","goblet-squat":"ADVANCE","incline-push-up":"ADVANCE","reverse-lunge":"ADVANCE"},"offers":[],"pending":null},"planEqual":false,"phasesEqual":true}]`

**Author expectations.**
- d15-e01 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- d15-e02 @GENERATE JUDGED [DOMAIN_ORACLE]: **JUDGED** — The partial history is read as about three runs a week (about 135-150 minutes, long run near 70 minutes) and one light strength session; UTC-stamped rows are attributed to their local dates; the starting week is near that level, neither from zero nor above it.
- d15-e03 @w0 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"KEEP"`
- d15-e04 @w0 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The phone and watch reports of the Sunday long run are one session (counted once) and the long run is dated on Sunday local time, not Saturday.
- d15-e05 @w1 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The 95-minute typo is superseded by its correction: it is not treated as an overperformance and does not drive any progression; arrival order does not matter.
- d15-e06 @w3 JUDGED [DOMAIN_ORACLE]: **JUDGED** — After the late correction, the plan from week 4 treats the week-2 long run as done (no remedial or reduced long run because of a miss that did not happen), while the week-3 decisions already taken are not rewritten.
- d15-e07 @w4 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"MODIFY"`
- d15-e08 @w4 JUDGED [INVARIANT_ORACLE]: **JUDGED** — The future-stamped long run is not written to the completed-work record as given (not dated in week 5, not counted as done in week 4 until its time is resolved).
- d15-e09 @f4 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- d15-e10 @f4 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`

**Independent assessment (author, written before any output).**
- Rationale: None of these data events is about training: they are about trust in the record. A good coach counts one session once, dates it in the athlete's local day, lets a correction replace what it corrects, and refuses to write a fact that claims to come from the future.
- Preferred: Plan from the partial history at about current volume. Count the duplicate long run once on Sunday. Use the corrected week-1 value. After the late correction, plan week 4 as if the week-2 long run was done. Hold (or ask about) the future-stamped report; accept the re-synced one.
- Acceptable alternatives: ASK instead of HOLD for the future-stamped report. / Keeping the week-4 plan unchanged after the late correction if week 3 had not been reduced.
- Concerns: Counting the long run twice or on Saturday. / Reacting to the 95-minute typo. / Reducing the week-4 long run because of the miss that was later corrected. / Accepting a fact dated in the future as done.
- Domain notes: The CONTRADICTION tag is used for the week-2 "not done" report contradicted a week later by its correction. Week 0 day 5 is a Sunday; 07:12 local is 20:12 UTC on Saturday.

## R7D-D18

**Intent.** A balanced hybrid athlete silently disappears for 17 days, comes back asking only to change her run turn, and declares the vacation when asked; later she declares a five-week work break with a short demonstration run. It probes the moderate break found through a question, a long break return with reduced loads in both sports, and that the reason category within nonclinical does not matter.

**Tags.** BALANCED_HYBRID, NON_RACE, H16, RUN_EXP_INTERMEDIATE, STR_EXP_INTERMEDIATE, GYM, START_NON_MONDAY, TIMEZONE, UNREPORTED_WEEKS, SKIPPED_REVIEW, LATE_ANSWER, RETURN_MODERATE, RETURN_LONG, SCHEDULE_CHANGE · oracle DOMAIN_ORACLE

**Intake.** `{"startDate":"2027-01-06","weeks":16,"asOf":"2027-01-05","tz":-300,"learningConsent":null,"eligibility":"CONFIRMED","goals":{"run":"PERFORMANCE","strength":"STRENGTH"},"event":null,"runExperience":"INTERMEDIATE","strengthExperience":"INTERMEDIATE","recent":{"runDaysPerWeek":3,"runMinutesPerWeek":150,"longestRunMinutes":75,"strengthDaysPerWeek":2},"knownRuns":0,"knownExercises":["back-squat 3x5 70KG TOTAL","bench-press 3x5 45KG TOTAL","barbell-rdl 3x6 70KG TOTAL","lat-pulldown 3x10 45KG MACHINE_STACK"],"equipment":["BARBELL","RACK","BENCH","DUMBBELLS","MACHINES","PULL_UP_BAR","BANDS","BODYWEIGHT"],"pause":null,"wearable":null,"history":0,"ageYears":35,"specialPopulation":null,"schedule":{"runDays":[1,3,5],"strengthDays":[0,4],"runTurn":"AM","strengthTurn":"PM","runMinutes":45,"strengthMinutes":50,"longRunDay":3,"longRunMinutes":90}}`

**Onboarding.** PROPOSED: Complete conditional program generated from onboarding-like facts

- Phases: DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION · DEVELOPMENT · DEVELOPMENT · DEVELOPMENT · CONSOLIDATION
- Week 0 (DEVELOPMENT): d0 2027-01-06 PM STRENGTH_FULL_A 39min: back-squat 3x5 RIR3 70kg TOTAL; bench-press 3x5 RIR3 45kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; db-calf-raise 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d1 2027-01-07 AM RUN EASY 40min (EASY) | d3 2027-01-09 AM RUN LONG 65min (LONG) | d4 2027-01-10 PM STRENGTH_FULL_B 39min: barbell-rdl 3x6 RIR3 70kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; bench-press 3x5 RIR3 45kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 2x7 RIR3 BW | d5 2027-01-11 AM RUN EASY 40min (EASY)
- Week 1 (DEVELOPMENT): d0 2027-01-13 PM STRENGTH_FULL_A 39min: back-squat 3x5 RIR3 70kg TOTAL; bench-press 3x5 RIR3 45kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; db-calf-raise 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d1 2027-01-14 AM RUN EASY 40min (EASY) | d3 2027-01-16 AM RUN LONG 65min (LONG) | d4 2027-01-17 PM STRENGTH_FULL_B 40min: barbell-rdl 3x6 RIR3 70kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; bench-press 3x5 RIR3 45kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 2x9 RIR3 BW | d5 2027-01-18 AM RUN EASY 40min (EASY)

### w0 · 2027-01-12T21:00:00-05:00 · WEEKLY_REVIEW (week 0)

- Athlete: 5 report(s): w0-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d3 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-run-d5 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d0 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w0-str-d4 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / ADOPT_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 2 load question(s) · new plan
- Reason: Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","back-squat":"ADVANCE","bench-press":"ADVANCE","lat-pulldown":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","barbell-rdl":"ADVANCE","bulgarian-split-squat-db":"ADVANCE"}`
- Current week 0 (DEVELOPMENT) from 2027-01-12: —
- Next week 1 (DEVELOPMENT, provisional): d0 2027-01-13 PM STRENGTH_FULL_A 39min: back-squat 3x5 RIR3 70kg TOTAL; bench-press 3x5 RIR3 45kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; db-calf-raise 2x7 RIR3 establish; dead-bug 2x9 RIR3 BW | d1 2027-01-14 AM RUN EASY 40min (EASY) | d3 2027-01-16 AM RUN LONG 65min (LONG) | d4 2027-01-17 PM STRENGTH_FULL_B 40min: barbell-rdl 3x6 RIR3 70kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; bench-press 3x5 RIR3 45kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 2x9 RIR3 BW | d5 2027-01-18 AM RUN EASY 40min (EASY)

### w1 · 2027-01-19T21:00:00-05:00 · WEEKLY_REVIEW (week 1)

- Athlete: 5 report(s): w1-run-d1 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d3 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-run-d5 done 40min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d0 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w1-str-d4 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / ADOPT_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 2 load question(s) · new plan
- Reason: Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time
- Gates: `{"LONG":"ADVANCE","EASY":"ADVANCE","back-squat":"ADVANCE","bench-press":"ADVANCE","lat-pulldown":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","barbell-rdl":"ADVANCE","bulgarian-split-squat-db":"ADVANCE"}`
- Current week 1 (DEVELOPMENT) from 2027-01-19: —
- Next week 2 (DEVELOPMENT, provisional): d0 2027-01-20 PM STRENGTH_FULL_A 39min: back-squat 3x5 RIR3 72.5kg TOTAL; bench-press 3x5 RIR3 47.5kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; db-calf-raise 2x7 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2027-01-21 AM RUN QUALITY 34min (THRESHOLD 3x5'/2') | d3 2027-01-23 AM RUN LONG 65min (LONG) | d4 2027-01-24 PM STRENGTH_FULL_B 40min: barbell-rdl 3x6 RIR3 72.5kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; bench-press 3x5 RIR3 47.5kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2027-01-25 AM RUN EASY 45min (EASY +strides)

### w2 · 2027-01-26T21:00:00-05:00 · WEEKLY_REVIEW (week 2)

- Athlete: 5 report(s): w2-run-d1 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d3 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-run-d5 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d0 done 39min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w2-str-d4 done 40min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / ADOPT_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 2 load question(s) · new plan
- Reason: Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","back-squat":"ADVANCE","bench-press":"ADVANCE","lat-pulldown":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","barbell-rdl":"ADVANCE","bulgarian-split-squat-db":"ADVANCE"}`
- Current week 2 (DEVELOPMENT) from 2027-01-26: —
- Next week 3 (CONSOLIDATION, provisional): d0 2027-01-27 PM STRENGTH_FULL_A 27min: back-squat 2x5 RIR3 72.5kg TOTAL; bench-press 2x5 RIR3 47.5kg TOTAL; lat-pulldown 2x6 RIR3 45kg MACHINE_STACK; db-calf-raise 1x7 RIR3 establish; dead-bug 1x10 RIR3 BW | d1 2027-01-28 AM RUN QUALITY 34min (THRESHOLD 3x5'/2') | d3 2027-01-30 AM RUN LONG 60min (LONG) | d4 2027-01-31 PM STRENGTH_FULL_B 27min: barbell-rdl 2x6 RIR3 72.5kg TOTAL; lat-pulldown 2x6 RIR3 45kg MACHINE_STACK; bench-press 2x5 RIR3 47.5kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 establish; dead-bug 1x10 RIR3 BW | d5 2027-02-01 AM RUN EASY 45min (EASY +strides)

### w3 · 2027-02-02T21:00:00-05:00 · WEEKLY_REVIEW (week 3)

- Athlete: 5 report(s): w3-run-d1 done 34min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d3 done 60min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-run-d5 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d0 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w3-str-d4 done 27min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · offers LADDER_STEP · 2 load question(s) · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","back-squat":"ADVANCE","bench-press":"ADVANCE","lat-pulldown":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","barbell-rdl":"ADVANCE","bulgarian-split-squat-db":"ADVANCE"}`
- Current week 3 (CONSOLIDATION) from 2027-02-02: —
- Next week 4 (DEVELOPMENT, provisional): d0 2027-02-03 PM STRENGTH_FULL_A 47min: back-squat 4x5 RIR3 72.5kg TOTAL; bench-press 4x5 RIR3 47.5kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; db-calf-raise 2x7 RIR3 establish; dead-bug 3x10 RIR3 BW | d1 2027-02-04 AM RUN QUALITY 41min (THRESHOLD 4x5'/2') | d3 2027-02-06 AM RUN LONG 70min (LONG) | d4 2027-02-07 PM STRENGTH_FULL_B 47min: barbell-rdl 4x6 RIR3 72.5kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; bench-press 4x5 RIR3 47.5kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 establish; dead-bug 3x10 RIR3 BW | d5 2027-02-08 AM RUN EASY 45min (EASY +strides)

### s6 · 2027-02-20T06:30:00-05:00 · SCHEDULE_CHANGE (week 6)

- Athlete: no reports · changes `{"runTurn":"PM"}`
- Coach: **MODIFY** / REARRANGE_FUTURE_WEEKS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: New chosen days or shifts: same doses rearranged on the new days from next week; this week’s remaining sessions are not moved onto days the athlete removed
- Current week 6 (DEVELOPMENT) from 2027-02-20: d3 2027-02-20 AM RUN LONG 70min (LONG) | d4 2027-02-21 PM STRENGTH_FULL_B 47min: barbell-rdl 4x6 RIR3 75kg TOTAL; lat-pulldown 3x6 RIR3 46kg MACHINE_STACK; bench-press 4x5 RIR3 50kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d5 2027-02-22 AM RUN EASY 45min (EASY +strides)
- Next week 7 (CONSOLIDATION, provisional): d0 2027-02-24 PM STRENGTH_FULL_A 35min: back-squat 3x5 RIR3 75kg TOTAL; bench-press 3x5 RIR3 50kg TOTAL; lat-pulldown 2x6 RIR3 45kg MACHINE_STACK; db-calf-raise 1x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2027-02-25 PM RUN QUALITY 41min (THRESHOLD 4x5'/2') | d3 2027-02-27 PM RUN LONG 65min (LONG) | d4 2027-02-28 PM STRENGTH_FULL_B 35min: barbell-rdl 3x6 RIR3 75kg TOTAL; lat-pulldown 2x6 RIR3 45kg MACHINE_STACK; bench-press 3x5 RIR3 50kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d5 2027-03-01 PM RUN EASY 45min (EASY +strides)

### a6 · 2027-02-20T08:00:00-05:00 · WEEKLY_REVIEW (week 6)

- Athlete: no reports · break `{"startDate":"2027-02-03","endDate":"2027-02-19","days":17,"reasonCategory":"VACATION","nonclinical":true,"reason":"Family trip; no training at all."}`
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: next-week steps are gated when this week’s remaining sessions are complete
- Current week 6 (DEVELOPMENT) from 2027-02-20: d3 2027-02-20 AM RUN LONG 70min (LONG) | d4 2027-02-21 PM STRENGTH_FULL_B 47min: barbell-rdl 4x6 RIR3 75kg TOTAL; lat-pulldown 3x6 RIR3 46kg MACHINE_STACK; bench-press 4x5 RIR3 50kg TOTAL; bulgarian-split-squat-db 2x7 RIR3 last logged; dead-bug 3x10 RIR3 BW | d5 2027-02-22 AM RUN EASY 45min (EASY +strides)
- Next week 7 (CONSOLIDATION, provisional): d0 2027-02-24 PM STRENGTH_FULL_A 35min: back-squat 3x5 RIR3 75kg TOTAL; bench-press 3x5 RIR3 50kg TOTAL; lat-pulldown 2x6 RIR3 45kg MACHINE_STACK; db-calf-raise 1x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d1 2027-02-25 PM RUN QUALITY 41min (THRESHOLD 4x5'/2') | d3 2027-02-27 PM RUN LONG 65min (LONG) | d4 2027-02-28 PM STRENGTH_FULL_B 35min: barbell-rdl 3x6 RIR3 75kg TOTAL; lat-pulldown 2x6 RIR3 45kg MACHINE_STACK; bench-press 3x5 RIR3 50kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 last logged; dead-bug 2x10 RIR3 BW | d5 2027-03-01 PM RUN EASY 45min (EASY +strides)

### w6 · 2027-02-23T21:00:00-05:00 · WEEKLY_REVIEW (week 6)

- Athlete: 5 report(s): w6-run-d1 done 43min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d3 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-run-d5 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d0 done 47min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w6-str-d4 done 47min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / ADOPT_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 2 load question(s) · new plan
- Reason: Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","back-squat":"ADVANCE","bench-press":"ADVANCE","lat-pulldown":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","barbell-rdl":"ADVANCE","bulgarian-split-squat-db":"ADVANCE"}`
- Current week 6 (DEVELOPMENT) from 2027-02-23: —
- Next week 7 (CONSOLIDATION, provisional): d0 2027-02-24 PM STRENGTH_FULL_A 35min: back-squat 3x5 RIR3 75kg TOTAL; bench-press 3x5 RIR3 50kg TOTAL; lat-pulldown 2x6 RIR3 45kg MACHINE_STACK; db-calf-raise 1x7 RIR3 establish; dead-bug 2x10 RIR3 BW | d1 2027-02-25 PM RUN QUALITY 41min (THRESHOLD 4x5'/2') | d3 2027-02-27 PM RUN LONG 65min (LONG) | d4 2027-02-28 PM STRENGTH_FULL_B 35min: barbell-rdl 3x6 RIR3 75kg TOTAL; lat-pulldown 2x6 RIR3 45kg MACHINE_STACK; bench-press 3x5 RIR3 50kg TOTAL; bulgarian-split-squat-db 1x7 RIR3 establish; dead-bug 2x10 RIR3 BW | d5 2027-03-01 PM RUN EASY 45min (EASY +strides)

### w7 · 2027-03-02T21:00:00-05:00 · WEEKLY_REVIEW (week 7)

- Athlete: 5 report(s): w7-run-d1 done 41min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d3 done 65min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-run-d5 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d0 done 35min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w7-str-d4 done 35min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · offers LADDER_STEP · 2 load question(s) · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","back-squat":"ADVANCE","bench-press":"ADVANCE","lat-pulldown":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","barbell-rdl":"ADVANCE","bulgarian-split-squat-db":"ADVANCE"}`
- Current week 7 (CONSOLIDATION) from 2027-03-02: —
- Next week 8 (DEVELOPMENT, provisional): d0 2027-03-03 PM STRENGTH_FULL_A 45min: back-squat 4x5 RIR3 75kg TOTAL; bench-press 4x5 RIR3 50kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; db-calf-raise 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d1 2027-03-04 PM RUN QUALITY 41min (THRESHOLD 4x5'/2') | d3 2027-03-06 PM RUN LONG 70min (LONG) | d4 2027-03-07 PM STRENGTH_FULL_B 45min: barbell-rdl 4x6 RIR3 75kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; bench-press 4x5 RIR3 50kg TOTAL; db-split-squat 2x7 RIR3 establish; front-plank 2x7 RIR3 BW | d5 2027-03-08 PM RUN EASY 45min (EASY +strides)

### w8 · 2027-03-09T21:00:00-05:00 · WEEKLY_REVIEW (week 8)

- Athlete: 5 report(s): w8-run-d1 done 41min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-run-d3 done 70min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-run-d5 done 45min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-str-d0 done 45min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w8-str-d4 done 45min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **MODIFY** / ADOPT_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · 2 load question(s) · new plan
- Reason: Executed loads differ from the planned known loads; the plan continues from what was lifted, one step at a time
- Gates: `{"LONG":"ADVANCE","QUALITY":"ADVANCE","EASY":"ADVANCE","back-squat":"ADVANCE","bench-press":"ADVANCE","lat-pulldown":"ADVANCE","db-calf-raise":"ADVANCE","front-plank":"ADVANCE","barbell-rdl":"ADVANCE","db-split-squat":"ADVANCE"}`
- Current week 8 (DEVELOPMENT) from 2027-03-09: —
- Next week 9 (DEVELOPMENT, provisional): d0 2027-03-10 PM STRENGTH_FULL_A 45min: back-squat 4x5 RIR3 77.5kg TOTAL; bench-press 4x5 RIR3 52.5kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; db-calf-raise 2x7 RIR3 establish; front-plank 2x9 RIR3 BW | d1 2027-03-11 PM RUN QUALITY 43min (THRESHOLD 3x8'/2') | d3 2027-03-13 PM RUN LONG 70min (LONG) | d4 2027-03-14 PM STRENGTH_FULL_B 45min: barbell-rdl 4x6 RIR3 77.5kg TOTAL; lat-pulldown 3x6 RIR3 45kg MACHINE_STACK; bench-press 4x5 RIR3 52.5kg TOTAL; db-split-squat 2x7 RIR3 establish; front-plank 2x9 RIR3 BW | d5 2027-03-15 PM RUN EASY 45min (EASY +strides)

### r14 · 2027-04-14T07:00:00-05:00 · RETURN_AFTER_PAUSE (week 14)

- Athlete: no reports · break `{"startDate":"2027-03-10","endDate":"2027-04-13","days":35,"reasonCategory":"WORK","nonclinical":true,"reason":"Five-week project at a remote site; no gym and no running."}` · demonstration `{"observedAt":"2027-04-12T18:00:00-05:00","sport":"RUN","family":"EASY","minutes":20,"completed":true,"effort":"CONVERSATIONAL","response":"COMPATIBLE","ordinaryFunction":"COMPATIBLE","nextDayFunction":"NORMAL"}`
- Coach: **MODIFY** / REESTABLISH · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: long nonclinical interruption (35 days): restart from current capacity; prior doses are only a ceiling
- Current week 14 (DEVELOPMENT) from 2027-04-14: d0 2027-04-14 PM STRENGTH_FULL_A 19min: back-squat 1x5 RIR4 establish; bench-press 1x5 RIR4 establish; lat-pulldown 1x6 RIR4 establish; db-calf-raise 1x5 RIR4 establish; dead-bug 1x10 RIR4 BW | d1 2027-04-15 PM RUN EASY 20min (EASY) | d3 2027-04-17 PM RUN EASY 20min (EASY) | d4 2027-04-18 PM STRENGTH_FULL_B 19min: barbell-rdl 1x6 RIR4 establish; lat-pulldown 1x6 RIR4 establish; bench-press 1x5 RIR4 establish; bulgarian-split-squat-db 1x5 RIR4 establish; dead-bug 1x10 RIR4 BW | d5 2027-04-19 PM RUN EASY 20min (EASY)
- Next week 15 (CONSOLIDATION, provisional): d0 2027-04-21 PM STRENGTH_FULL_A 19min: back-squat 1x5 RIR3 last logged; bench-press 1x5 RIR3 last logged; lat-pulldown 1x6 RIR3 last logged; db-calf-raise 1x5 RIR3 last logged; dead-bug 1x10 RIR3 BW | d1 2027-04-22 PM RUN EASY 25min (EASY) | d3 2027-04-24 PM RUN EASY 25min (EASY) | d4 2027-04-25 PM STRENGTH_FULL_B 19min: barbell-rdl 1x6 RIR3 last logged; lat-pulldown 1x6 RIR3 last logged; bench-press 1x5 RIR3 last logged; bulgarian-split-squat-db 1x5 RIR3 last logged; dead-bug 1x10 RIR3 BW | d5 2027-04-26 PM RUN EASY 25min (EASY)

### w14 · 2027-04-20T21:00:00-05:00 · WEEKLY_REVIEW (week 14)

- Athlete: 5 report(s): w14-run-d1 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w14-run-d3 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w14-run-d5 done 20min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w14-str-d0 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w14-str-d4 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / INSTANTIATE_LOGGED_LOADS · VALID_WITHIN_CURRENT_BOUNDED_SCOPE · new plan
- Reason: Logged loads replace planned placeholders; the progression rule is unchanged
- Gates: `{"EASY":"ADVANCE","back-squat":"ADVANCE","bench-press":"ADVANCE","lat-pulldown":"ADVANCE","db-calf-raise":"ADVANCE","dead-bug":"ADVANCE","barbell-rdl":"ADVANCE","bulgarian-split-squat-db":"ADVANCE"}`
- Current week 14 (DEVELOPMENT) from 2027-04-20: —
- Next week 15 (CONSOLIDATION, provisional): d0 2027-04-21 PM STRENGTH_FULL_A 19min: back-squat 1x5 RIR4 establish; bench-press 1x5 RIR4 establish; lat-pulldown 1x6 RIR4 establish; db-calf-raise 1x5 RIR4 establish; dead-bug 1x10 RIR3 BW | d1 2027-04-22 PM RUN EASY 25min (EASY) | d3 2027-04-24 PM RUN EASY 25min (EASY) | d4 2027-04-25 PM STRENGTH_FULL_B 19min: barbell-rdl 1x6 RIR4 establish; lat-pulldown 1x6 RIR4 establish; bench-press 1x5 RIR4 establish; bulgarian-split-squat-db 1x5 RIR4 establish; dead-bug 1x10 RIR3 BW | d5 2027-04-26 PM RUN EASY 25min (EASY)

### w15 · 2027-04-27T21:00:00-05:00 · WEEKLY_REVIEW (week 15)

- Athlete: 5 report(s): w15-run-d1 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w15-run-d3 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w15-run-d5 done 25min (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w15-str-d0 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL); w15-str-d4 done 19min 5 exercises (performance=COMPATIBLE,recovery=COMPATIBLE,effort=ON_TARGET,nextDayFunction=NORMAL)
- Coach: **KEEP** / KEEP · VALID_WITHIN_CURRENT_BOUNDED_SCOPE
- Reason: Final week of the horizon; record outcomes for the next program
- Current week 15 (CONSOLIDATION) from 2027-04-27: —

**Automated properties.** no failure

**Metamorphic.** no violation

**Author expectations.**
- d18-e01 @GENERATE STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"PROPOSED"`
- d18-e02 @s6 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"MODIFY"`
- d18-e03 @s6 QUESTION_KIND_IS [DOMAIN_ORACLE]: **FAIL** observed `null`
- d18-e04 @s6 NO_PRESCRIPTION [INVARIANT_ORACLE]: **FAIL** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- d18-e05 @a6 STATUS_IN [DOMAIN_ORACLE]: **FAIL** observed `"KEEP"`
- d18-e06 @a6 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- d18-e07 @a6 ROLE_ABSENT [DOMAIN_ORACLE]: **FAIL** observed `["6:1:QUALITY"]`
- d18-e08 @a6 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **FAIL** observed `{"week":65,"otherWeek":60}`
- d18-e09 @a6 JUDGED [INVARIANT_ORACLE]: **JUDGED** — From the change on, runs are scheduled in the PM turn on days 1, 3 and 5; nothing is added to make up for the break.
- d18-e10 @r14 STATUS_IN [DOMAIN_ORACLE]: **PASS** observed `"MODIFY"`
- d18-e11 @r14 VALIDITY_IS [DOMAIN_ORACLE]: **PASS** observed `"VALID_WITHIN_CURRENT_BOUNDED_SCOPE"`
- d18-e12 @r14 PHASE_IS [DOMAIN_ORACLE]: **FAIL** observed `"DEVELOPMENT"`
- d18-e13 @r14 ROLE_ABSENT [DOMAIN_ORACLE]: **PASS** observed `[]`
- d18-e14 @r14 ROLE_MINUTES_COMPARE [DOMAIN_ORACLE]: **NOT_EVALUABLE** observed `{"week":null,"otherWeek":70}` (ROLE_NOT_IN_BOTH_WEEKS)
- d18-e15 @r14 JUDGED [DOMAIN_ORACLE]: **JUDGED** — Return running is roughly 40-60% of the week-8 level, anchored on the 20-minute demonstration; strength resumes at reduced loads or volume (for example re-established or about 10-20% below the last logged loads) with more reserve.

**Independent assessment (author, written before any output).**
- Rationale: Two nonclinical breaks of different length. The first is hidden: the coach can only find it by asking about unreported sessions. The second is declared with a current demonstration of tolerance. Fitness loss after 17 days is modest; after 35 days it is meaningful in both sports.
- Preferred: At s6, ask about the unreported runs (prescribe nothing). After the declared vacation, plan a short re-entry (about one week near 70-80% of pre-break, no quality) and move runs to the evening. After the five-week break, plan a return week near half of the pre-break running with no quality and reduced strength loads, then rebuild over two to three weeks.
- Acceptable alternatives: Treating the first re-entry week as RETURN phase. / Re-establishing strength loads after the long break instead of a percentage reduction.
- Concerns: Assuming the vacation weeks were done (progression) or missed without asking. / Resuming at the pre-break level after five weeks. / Quality running in either first week back. / Different plans for VACATION versus WORK.
- Domain notes: The vacation is declared as an interruption inside a weekly review on day 3 of week 6 (an answer). The demonstration run is two days before the return decision, inside the declared break.

