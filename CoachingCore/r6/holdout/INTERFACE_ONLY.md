# R6 public interface for an independent holdout author

This describes how to call the R6 reference and how a corpus case is represented. It contains no implementation, no policy, no expected outputs and no development cases. Do not open anything under `CoachingCore/src`, `CoachingCore/test`, `CoachingCore/r6` (other than this file), `CoachingCore/r5`, `CoachingCore/scripts` (other than running the evaluator after sealing, which you will not do), `audits/`, `reviews/`, or earlier holdouts while writing the corpus.

## Calls

Node 24 ES modules: `import {generateProgram,evaluateProgram} from 'CoachingCore/src/r6-index.mjs'`.

- `generateProgram(intake)` returns `{status, reason, program, missingInputs, uncertainty, negotiation, question?, ...}`. `status` is one of `PROPOSED`, `ASK`, `UNSUPPORTED`, `INVALID_INPUT`, `CLINICAL_HUMAN_REQUIRED`. `program` exists only when `PROPOSED`.
- `evaluateProgram(program, review)` returns `{status, action, reason, proposal, counterfactuals, gates?, horizons?, missingInputs, updatedModel, actualLedger, referenceState, ...}`. `status` is one of `KEEP`, `MODIFY`, `ASK`, `HOLD`, `UNSUPPORTED`, `CLINICAL_HUMAN_REQUIRED`. `proposal` is a full program (a SHADOW proposal, never applied).
- A program has `startDate`, `weeks[]`. Each week has `index`, `startDate`, `phase` and `sessions[]`. A session has `id`, `weekIndex`, `day` (0–6, offset from the week start), `date`, `sport` (`RUN` or `STRENGTH`), `role`, `prescription`, and sometimes `optional` or `explanation`. Running roles include `EASY`, `LONG`, `QUALITY`, `WALK_JOG`, `WALK`, `RACE`, `RACE_TOUCH`, `SHAKEOUT`, `RECOVERY_EASY`, `REST_BY_DESIGN`; strength roles start with `STRENGTH_`. Which roles appear is the program's decision.

## Intake (`R6-INTAKE-1`)

```
{version:'R6-INTAKE-1', synthetic:true, purpose:'SHADOW_REFERENCE', asOf:'YYYY-MM-DD', startDate:'YYYY-MM-DD', weeks:4|8|12|16,
 learningConsent?:boolean, timezoneOffsetMinutes?:integer,
 athlete:{
  id, ageEligible:true | ageYears,
  eligibility:{status:'NONCLINICAL_CONFIRMED'|'UNKNOWN'|..., assessedAt:'YYYY-MM-DD', pain, persistentPain, injury, illness, functionalLimitation, clinicalConcern (booleans)},
  goals:{run:'RACE'|'PERFORMANCE'|'REGULAR'|'GENERAL'|'NONE' | {kind, event?}, strength:'STRENGTH'|'HYPERTROPHY'|'RUNNING_SUPPORT'|'MAINTAIN'|'GENERAL'|'NONE'},
  event?:{kind:'10K'|'HALF_MARATHON', date:'YYYY-MM-DD', timeGoalMinutes?},
  runExperience?:'NONE'|'NOVICE'|'INTERMEDIATE'|'EXPERIENCED', strengthExperience?: same vocabulary,
  recent?:{runDaysPerWeek?, runMinutesPerWeek?, longestRunMinutes?, strengthDaysPerWeek?},
  performanceAnchors?:[{kind, distance, minutes, date}],
  knownRuns?:[{prescription, current, familiar, tolerated, observedAt}],
  knownExercises?:[{id, sets, reps, load:{value, unit:'KG', convention:'TOTAL'|'PER_HAND'}, rir, current, familiar, tolerated, observedAt}],
  equipment?:['BODYWEIGHT','DUMBBELLS','BARBELL','RACK','BENCH','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'],
  strengthPreferences?:{emphasis?:[...], movementPriorities?:[...], rotation?:'COACH_DECIDES'|'EVERY_6_WEEKS'|'EVERY_2_WEEKS'|'FIXED'},
  sex?, heightCm?, weightKg?, specialPopulation?:[...],
  wearableCapabilities?:{provider, activityAvailable, heartRateAvailable, exerciseIdentityAvailable, setsRepsLoadAvailable, subjectiveEffortAvailable, completeness:'NONE'|'PARTIAL'|'FULL', historyWeeks?},
  pause?:{nonclinical:boolean, weeks?, reasonCategory?, reason? (free text)}},
 schedule:{runDays:[0..6], strengthDays:[0..6], runTurn?:'AM'|'PM', strengthTurn?:'AM'|'PM', runMinutes, strengthMinutes, longRunDay?, longRunMinutes?, sameTurnConfirmed?, temporaryPreference?:'RUN'|'STRENGTH'},
 history?:[{activityId, provider, sport:'RUN'|'STRENGTH', startedAt (timestamp with offset), durationMinutes, completeness?:'FULL'|'PARTIAL', exercises?}]}
```

Day 0 is `startDate`'s weekday. Known-run and known-exercise records are self-reported current tasks; omit what an athlete would not know. `eligibility.assessedAt` is the date the athlete answered the eligibility questions (normally the onboarding date).

Shapes the questionnaire would collect:

- Known run: `{prescription:{modality:'RUN', family:'EASY'|'LONG'|'THRESHOLD'|'TEN_K_SPECIFIC'|'HALF_MARATHON_SPECIFIC', durationMinutes (total), warmupMinutes?, cooldownMinutes?, work?:{repetitions, workMinutes, recoveryMinutes} (for the three non-easy families), effort? (free text)}, current, familiar, tolerated, observedAt:'YYYY-MM-DD'}`. No paces or heart rates are used.
- Known exercises and wearable strength records use the exercise library ids below; an id outside the library is kept as history but is not programmed. Wearable history strength rows: `exercises:[{id, sets, reps, loadKg?, rir?}]`.
- `strengthPreferences.emphasis` and `movementPriorities` take patterns (`SQUAT`, `HINGE`, `LUNGE`, `CALF`, `PUSH`, `PULL`, `TRUNK`) or regions (`LOWER`, `UPPER`, `CORE`).

Exercise library (id — pattern — equipment): `back-squat` — SQUAT — BARBELL+RACK; `goblet-squat` — SQUAT — DUMBBELLS; `kb-goblet-squat` — SQUAT — KETTLEBELL; `leg-press` — SQUAT — MACHINES; `box-squat-bodyweight` — SQUAT — BODYWEIGHT; `sit-to-stand` — SQUAT — BODYWEIGHT; `barbell-rdl` — HINGE — BARBELL; `db-rdl` — HINGE — DUMBBELLS; `kb-deadlift` — HINGE — KETTLEBELL; `hip-thrust-db` — HINGE — DUMBBELLS+BENCH; `glute-bridge` — HINGE — BODYWEIGHT; `hip-hinge-practice` — HINGE — BODYWEIGHT; `db-split-squat` — LUNGE — DUMBBELLS; `db-step-up` — LUNGE — DUMBBELLS+BENCH; `reverse-lunge` — LUNGE — BODYWEIGHT; `split-squat-bodyweight` — LUNGE — BODYWEIGHT; `standing-calf-raise` — CALF — BODYWEIGHT; `db-calf-raise` — CALF — DUMBBELLS; `supported-calf-raise` — CALF — BODYWEIGHT; `bench-press` — PUSH — BARBELL+BENCH+RACK; `db-bench-press` — PUSH — DUMBBELLS+BENCH; `db-floor-press` — PUSH — DUMBBELLS; `machine-chest-press` — PUSH — MACHINES; `push-up` — PUSH — BODYWEIGHT; `incline-push-up` — PUSH — BODYWEIGHT; `wall-pushup` — PUSH — BODYWEIGHT; `db-overhead-press` — PUSH — DUMBBELLS; `one-arm-db-row` — PULL — DUMBBELLS+BENCH; `db-row` — PULL — DUMBBELLS; `barbell-row` — PULL — BARBELL; `lat-pulldown` — PULL — MACHINES; `seated-cable-row` — PULL — MACHINES; `pull-up` — PULL — PULL_UP_BAR; `band-row` — PULL — BANDS; `prone-row-practice` — PULL — BODYWEIGHT; `dead-bug` — TRUNK — BODYWEIGHT; `dead-bug-practice` — TRUNK — BODYWEIGHT; `side-plank` — TRUNK — BODYWEIGHT; `pallof-press` — TRUNK — BANDS.

## Review (`R6-REVIEW-1`)

```
{version:'R6-REVIEW-1', synthetic:true, purpose:'SHADOW_REFERENCE', asOf:'YYYY-MM-DDTHH:mm:ssZ' (timezone required), weekIndex,
 event:{id, kind}, eligibility:{same shape as intake},
 observations?:[...], targetSessionId?, learningConsent?,
 changes?:{runDays?, strengthDays?, runTurn?, strengthTurn?, runMinutes?, strengthMinutes?, longRunDay?, longRunMinutes?, sameTurnConfirmed?, temporaryPreference?, unavailableDates?:['YYYY-MM-DD'], equipment?:[...], from?, to?, eventDate?, event?, goals?},
 interruption?:{days?, startDate?, endDate? (last day of the break), reasonCategory?, reason? (free text), nonclinical?:boolean, clinicalReason?:boolean},
 currentDemonstration?:{observedAt, sport:'RUN'|'STRENGTH', family (e.g. 'EASY'), minutes, completed:boolean, effort:'CONVERSATIONAL'|'HARDER'|..., response:'COMPATIBLE'|'ADVERSE'|..., ordinaryFunction:'COMPATIBLE'|'IMPAIRED', nextDayFunction:'NORMAL'|'IMPAIRED'},
 signals?:{region?:'LOWER'|'UPPER'|'ALL'}}
```

Reason categories for a pause or interruption: `TRAVEL`, `WORK`, `FAMILY`, `SCHEDULE`, `VACATION`, `WEATHER`, `EQUIPMENT`, `MOTIVATION`, `STUDY`, `MOVING`, `OTHER_NONCLINICAL`, `ILLNESS`, `INJURY`, `PAIN`, `MEDICAL`, `SURGERY`, `PREGNANCY`, `POSTPARTUM`, `CLINICAL`. A category, free text, or both may be given, as an athlete would answer; a break is treated as nonclinical only with a nonclinical category (free text alone, or a flag alone, is asked about). The review's `eligibility.assessedAt` is when the athlete answered the eligibility questions for that review.

Event kinds: `WEEKLY_REVIEW`, `MISSED_SESSION`, `PARTIAL_SESSION`, `UNDERPERFORMANCE`, `OVERPERFORMANCE`, `PROGRESSION_NOT_TOLERATED`, `PROGRESSION_TOO_EASY`, `LOCAL_FATIGUE`, `SYSTEMIC_FATIGUE`, `SCHEDULE_CHANGE`, `UNAVAILABLE_DAY`, `DOUBLE_CONFLICT`, `EQUIPMENT_CHANGE`, `GOAL_CHANGE`, `EVENT_DATE_CHANGE`, `RETURN_AFTER_PAUSE`, `EVENT_WEEK_CONFLICT`, `RECOVERED`. `weekIndex` must contain the `asOf` date.

An observation: `{eventId, athleteId, sessionId, observedAt? (timestamp with offset) | occurrenceDate? ('YYYY-MM-DD'), reportedAt?, correctionOf?, correctedAt?, source?:{provider, activityId?, quality?:'WEARABLE_FULL'|'WEARABLE_PARTIAL'|'MANUAL'}, actual:{completed:boolean, minutes?, exercises?:[{id, sets:[{reps, load?:{value, unit, convention}, rir?}]}]}, response:{performance:'COMPATIBLE'|'UNDER'|'OVER'|'UNKNOWN', recovery:'COMPATIBLE'|'ADVERSE'|'UNKNOWN', effort:'ON_TARGET'|'EASIER'|'HARDER'|'UNKNOWN', nextDayFunction?:'NORMAL'|'IMPAIRED'|'UNKNOWN'}, comparable?, confounded?}`. Unknown stays unknown.

## Corpus shape

```
{revision, cases:[{caseId, family, scenario, operation:'GENERATE'|'SEQUENCE', intake,
  steps?:[{review, observationFacts?, targetRef?, adoptProposal:boolean}],
  independentAssessment:{rationale, preferredCoachingBehavior, acceptableAlternatives, concerns}}]}
```

Because session ids are created by the program, steps refer to sessions indirectly. The runner resolves them against the current program (the generated one, or the last adopted proposal):

- `targetRef:{weekIndex, sport, role?, day?}` → `review.targetSessionId`. When several sessions match, the earliest in that week is used and the resolution (with the ambiguity) is recorded in the output; add `role` or `day` to be exact. Because the program decides which day carries which role (and when), `role` may also be a preference list such as `['QUALITY','LONG']`: the first role with a matching session that week is used, and the output records which. `sport` plus one of your chosen `day`s always identifies a session when the program scheduled that sport there.
- `observationFacts:[{weekIndex, sport, role?, day?, completed, actualMinutes?, actualStimulus?:'AS_PRESCRIBED', loadsByPattern?:{SQUAT:kg,...}, exercises?, response, observedAt?, occurrenceDate?, source?, eventId?, correctionOf?, correctedAt?, reportedAt?, comparable?, confounded?}]` → observations (same reference rules as `targetRef`). `AS_PRESCRIBED` copies the planned minutes or the planned sets and reps (with known loads, or the `loadsByPattern` value you state for an exercise whose load the athlete chooses; otherwise the load stays unknown) and the planned reserve. `loadsByPattern` keys are movement patterns: `SQUAT`, `HINGE`, `LUNGE`, `CALF`, `PUSH`, `PULL`, `TRUNK`; the value is applied in the planned exercise's own convention (per hand for dumbbell or kettlebell pairs). A fact matching no session is a corpus error. The default `eventId` is `<caseId>-<sessionId>`, so give your own `eventId` when a later fact must reference it (`correctionOf`) or when one session has two separate reports. Omitted `observedAt` keeps day precision; the runner never invents a clock time.
- The runner carries the returned model, completed-work ledger and reference state between steps, and adopts a SHADOW proposal only when `adoptProposal` is true.

The `independentAssessment` is your separate qualitative expectation; it is never given to the runtime.

## Procedure

Write the corpus with a separate builder script if you like (you may hash with SHA-256 over the file bytes). Record in `INDEPENDENCE_MANIFEST.json` what you read, when you started and sealed, the corpus SHA-256, and that you neither inspected runtime source, tests or outputs nor ran the runtime before sealing.
