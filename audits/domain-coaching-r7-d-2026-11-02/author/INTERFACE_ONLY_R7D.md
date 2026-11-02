# R7-D public interface for an independent case author (`R7D-INTERFACE-1`)

This document is everything a case author may know about the coach under test. It describes the product boundary, the inputs a case can contain, what the coach returns, how the evaluation client talks to the coach, and how a case is written. It contains no implementation, no internal threshold, no development case, no earlier holdout, no runtime output and no known defect.

**Do not open anything else in the repository** while writing cases: not `CoachingCore/` (source, tests, fixtures, scripts, records), not `audits/` or `reviews/` (other than the three author files and the folder you are told to write in), not `product/` or `canon/`, not the harness, not git history, and not other agents' outputs. You never run the coach; someone else runs the single first evaluation after you seal.

## 1. The coach under test

- An offline, synthetic, **shadow-only** reference coach for adults that plans and adapts running, strength, or both together (hybrid). Nothing it returns is applied to a real person; every input is synthetic (`synthetic:true`, `purpose:'SHADOW_REFERENCE'`).
- **In scope (V1):** adults; running goals `RACE` (10K or half marathon), `PERFORMANCE`, `REGULAR`, `GENERAL`, `NONE`; strength goals `STRENGTH`, `HYPERTROPHY`, `RUNNING_SUPPORT`, `MAINTAIN`, `GENERAL`, `NONE`; horizons of 4, 8, 12 or 16 weeks.
- **Out of scope:** marathon, ultra and triathlon, cycling, swimming, nutrition, social features, adolescents, elite athletes, pregnancy and postpartum, and clinical return or rehabilitation. An out-of-scope request should not be planned.
- **Clinical boundary:** the coach is not a clinician. Pain, injury, illness, a functional limitation or a clinical concern routes to a qualified human, and nothing is prescribed while that route stands. The coach can never clear a clinical route; only a qualified human can. Unknown eligibility is a question, never a clearance and never a presumed illness.
- **Facts, not guesses:** a session with no report is **unknown**. It is neither done nor not done. A session reported not done is a known miss; a declared break is a known stop with its reason. When the coach needs to know what happened to plan safely, it asks.
- **History:** only reported facts write history. A late report or a correction can change the future plan, never what was already decided or done.
- **Plans have a current week and a provisional future:** the sessions of the current week are the prescription. Later weeks are a conditional projection: they are re-planned at the decision that closes the week before them (that week's own review, or the first decision of the following week when no review happens).
- **Repertoire:** sessions come only from an approved V1 catalog of running families and strength exercises, within the athlete's equipment and experience. Anything outside it fails closed (a question or an unsupported answer), never an invented session.
- **Chosen days:** each chosen day of a sport receives that sport's session, and no other day receives one without the athlete's own act. Running and strength in the same turn of one day need the athlete's confirmation.
- **Learning:** with the athlete's consent the coach may learn a repeated personal response pattern, within limits; without consent, or after it is revoked, it does not. Noise should not change decisions.

## 2. Calendar and clocks

- **Date window.** Every date and clock in a case (intake `asOf`, `startDate`, event dates, observation and report times, every step) must fall between **2026-11-03 and 2027-04-30** inclusive. Outside that window the coach's catalog authority is not in force and the case is invalid.
- **Weeks and days.** Week `k` covers `startDate + 7k` … `startDate + 7k + 6`. Day `d` (0–6) is an offset from the week start, so day 0 is `startDate`'s weekday, whatever weekday that is. Chosen days (`runDays`, `strengthDays`, `longRunDay`) use the same offsets.
- **Time zone.** `timezoneOffsetMinutes` in the intake (default 0) is the athlete's local offset. Step clocks written as `{week, day, time}` are in local time; explicit timestamps carry their own offset.
- **Run window.** A program starts on `startDate` and lasts `weeks` weeks. An event date must fall inside the program.

## 3. Intake (`R6-INTAKE-1`)

```
{version:'R6-INTAKE-1', synthetic:true, purpose:'SHADOW_REFERENCE', asOf:'YYYY-MM-DD', startDate:'YYYY-MM-DD', weeks:4|8|12|16,
 learningConsent?:boolean, timezoneOffsetMinutes?:integer,
 athlete:{
  id, ageEligible:true | ageYears:integer,
  eligibility:{status:'NONCLINICAL_CONFIRMED'|'UNKNOWN'|'CLINICAL', assessedAt:'YYYY-MM-DD',
               pain, persistentPain, injury, illness, functionalLimitation, clinicalConcern (each a boolean; omit one to leave it unknown)},
  goals:{run:'RACE'|'PERFORMANCE'|'REGULAR'|'GENERAL'|'NONE' | {kind:'RACE', event:{kind:'10K'|'HALF_MARATHON', date, timeGoalMinutes?}},
         strength:'STRENGTH'|'HYPERTROPHY'|'RUNNING_SUPPORT'|'MAINTAIN'|'GENERAL'|'NONE'},
  event?:{kind:'10K'|'HALF_MARATHON', date:'YYYY-MM-DD', timeGoalMinutes?},
  runExperience?:'NONE'|'NOVICE'|'INTERMEDIATE'|'EXPERIENCED', strengthExperience?: same vocabulary,
  recent?:{runDaysPerWeek?, runMinutesPerWeek?, longestRunMinutes?, strengthDaysPerWeek?},
  performanceAnchors?:[{kind, distance, minutes, date}] (as the athlete would state them, e.g. kind 'RACE_RESULT', distance '10K'),
  knownRuns?:[{prescription, current, familiar, tolerated, observedAt}],
  knownExercises?:[{id, sets, reps, load:{value, unit:'KG'|'LB', convention}, rir, current, familiar, tolerated, observedAt}],
  equipment?:['BODYWEIGHT','DUMBBELLS','BARBELL','RACK','BENCH','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'],
  exerciseRotationPreference?:'COACH_DECIDES'|'EVERY_6_WEEKS'|'EVERY_2_WEEKS'|'FIXED',
  strengthPreferences?:{emphasis?:[...], movementPriorities?:[...]},
  sex?, heightCm?, weightKg?, specialPopulation?:[...],
  wearableCapabilities?:{provider, activityAvailable, heartRateAvailable, exerciseIdentityAvailable, setsRepsLoadAvailable,
                         subjectiveEffortAvailable, completeness:'NONE'|'PARTIAL'|'FULL', historyWeeks?},
  pause?:{nonclinical:boolean, weeks?, reasonCategory?, reason? (free text)}},
 schedule:{runDays:[0..6], strengthDays:[0..6], runTurn?:'AM'|'PM', strengthTurn?:'AM'|'PM', runMinutes, strengthMinutes,
           longRunDay?, longRunMinutes?, sameTurnConfirmed?:boolean, temporaryPreference?:'RUN'|'STRENGTH'},
 history?:[{activityId, provider, sport:'RUN'|'STRENGTH', startedAt (timestamp with offset), durationMinutes, completeness?:'FULL'|'PARTIAL',
            exercises?:[{id, sets, reps, loadKg?, rir?}]}]}
```

- `eligibility.assessedAt` is the date the athlete answered the eligibility questions (normally the onboarding date, on or shortly before `asOf`). A clinical flag that is `true` is a clinical signal; a missing flag or a non-confirmed status is unknown.
- `ageEligible:true` means the athlete confirmed being an adult; `ageYears` gives the age instead. `specialPopulation` may hold `PREGNANCY`, `POSTPARTUM`, `ELITE` or `ADOLESCENT` (all out of scope).
- `runMinutes` and `strengthMinutes` are the time available per session; `longRunMinutes` is the time available on the long-run day. Omit what an athlete would not know.
- **Known run** (a current task the athlete reports): `{prescription:{modality:'RUN', family:'EASY'|'LONG'|'THRESHOLD'|'TEN_K_SPECIFIC'|'HALF_MARATHON_SPECIFIC', durationMinutes (total), warmupMinutes?, cooldownMinutes?, work?:{repetitions, workMinutes, recoveryMinutes} (the three non-easy families), effort? (free text)}, current, familiar, tolerated, observedAt}`. No paces or heart rates are used.
- **Known exercise**: an id from the exercise library below. `load.convention`: `TOTAL` (the whole load moved, e.g. a barbell, or both dumbbells together), `PER_HAND` (one dumbbell or kettlebell of a pair), `SINGLE_IMPLEMENT` (one implement held in both hands), `BODYWEIGHT`, `MACHINE_STACK`. An id outside the library is kept as history but never programmed.
- **Wearable history** rows (`history`) are what a watch or phone would have recorded before onboarding; strength rows may list `exercises:[{id, sets, reps, loadKg?, rir?}]` when the device knows them.
- `strengthPreferences.emphasis` and `movementPriorities` take movement patterns (`SQUAT`, `HINGE`, `LUNGE`, `CALF`, `PUSH`, `PULL`, `TRUNK`) or regions (`LOWER`, `UPPER`, `CORE`).

**Exercise library** (id — pattern — equipment): `back-squat` — SQUAT — BARBELL+RACK; `goblet-squat` — SQUAT — DUMBBELLS; `kb-goblet-squat` — SQUAT — KETTLEBELL; `leg-press` — SQUAT — MACHINES; `box-squat-bodyweight` — SQUAT — BODYWEIGHT; `sit-to-stand` — SQUAT — BODYWEIGHT; `barbell-rdl` — HINGE — BARBELL; `db-rdl` — HINGE — DUMBBELLS; `kb-deadlift` — HINGE — KETTLEBELL; `hip-thrust-db` — HINGE — DUMBBELLS+BENCH; `glute-bridge` — HINGE — BODYWEIGHT; `hip-hinge-practice` — HINGE — BODYWEIGHT; `db-split-squat` — LUNGE — DUMBBELLS; `db-step-up` — LUNGE — DUMBBELLS+BENCH; `reverse-lunge` — LUNGE — BODYWEIGHT; `split-squat-bodyweight` — LUNGE — BODYWEIGHT; `standing-calf-raise` — CALF — BODYWEIGHT; `db-calf-raise` — CALF — DUMBBELLS; `supported-calf-raise` — CALF — BODYWEIGHT; `bench-press` — PUSH — BARBELL+BENCH+RACK; `db-bench-press` — PUSH — DUMBBELLS+BENCH; `db-floor-press` — PUSH — DUMBBELLS; `machine-chest-press` — PUSH — MACHINES; `push-up` — PUSH — BODYWEIGHT; `incline-push-up` — PUSH — BODYWEIGHT; `wall-pushup` — PUSH — BODYWEIGHT; `db-overhead-press` — PUSH — DUMBBELLS; `one-arm-db-row` — PULL — DUMBBELLS+BENCH; `db-row` — PULL — DUMBBELLS; `barbell-row` — PULL — BARBELL; `lat-pulldown` — PULL — MACHINES; `seated-cable-row` — PULL — MACHINES; `pull-up` — PULL — PULL_UP_BAR; `band-row` — PULL — BANDS; `prone-row-practice` — PULL — BODYWEIGHT; `dead-bug` — TRUNK — BODYWEIGHT; `dead-bug-practice` — TRUNK — BODYWEIGHT; `side-plank` — TRUNK — BODYWEIGHT; `pallof-press` — TRUNK — BANDS. (The catalog holds further configurations the coach may choose; you only need these ids for known exercises.)

## 4. What the coach returns

**At onboarding** the coach returns a `status`:

| Status | Meaning |
|---|---|
| `PROPOSED` | A complete conditional program was generated |
| `ASK` | A fact needed to plan safely is missing; the coach asks for it |
| `UNSUPPORTED` | The request is outside the V1 scope or authority |
| `INVALID_INPUT` | The intake is malformed |
| `CLINICAL_HUMAN_REQUIRED` | A clinical signal routes to a qualified human; nothing is prescribed |

**A program** has `weeks[]`. Each week has an `index`, a `startDate` and a `phase`: `ESTABLISHMENT`, `BUILD`, `DEVELOPMENT`, `CONSOLIDATION`, `SPECIFIC`, `TAPER`, `RACE_WEEK`, `POST_EVENT`, `NEXT_BLOCK`, `RETURN`. Each session has a `day`, a `date`, a `turn` (`AM`/`PM`), a `sport` (`RUN` or `STRENGTH`), a `role` and a `prescription`, and sometimes a `status` (for example `SKIPPED`) and an explanation.
- Running roles: `EASY`, `LONG`, `QUALITY`, `WALK_JOG`, `WALK`, `RACE`, `RACE_TOUCH` (a short sharpening session before the race), `SHAKEOUT`, `RECOVERY_EASY`, `REST_BY_DESIGN`. A run prescription has a `family` (`WALK`, `WALK_JOG`, `EASY`, `LONG`, `THRESHOLD`, `TEN_K_SPECIFIC`, `HALF_MARATHON_SPECIFIC`, `RACE_TOUCH`, `SHAKEOUT`, `RACE`, `RECOVERY_EASY`, `FAMILIAR_REPEATED_BOUTS`), a total `durationMinutes`, and for the harder families `work:{repetitions, workMinutes, recoveryMinutes}`; easy runs may add short strides.
- Strength roles start with `STRENGTH_`. A strength prescription lists exercises with `id`, `pattern`, `sets`, `reps`, `rir` (reps in reserve) and a `load`: `KNOWN` (a number in a convention), `ESTABLISH` (the athlete finds a working load by effort; the coach asks them to log it), `FROM_LOG` (use the last logged load) or `BODYWEIGHT`.
- Which roles, exercises and doses appear is the coach's decision.

**At each later decision** (a review or an event) the coach returns:

| Field | Values and meaning |
|---|---|
| `status` | `KEEP` (the plan in force stands), `MODIFY` (a new plan is proposed), `ASK` (a fact is needed), `HOLD` (the input cannot be used as given), `UNSUPPORTED`, `CLINICAL_HUMAN_REQUIRED` |
| `planValidity.status` | `VALID_WITHIN_CURRENT_BOUNDED_SCOPE`, or `REQUIRES_RECONCILIATION`: something is pending (a question, a hold or a clinical dependency), so the run doses ahead are **not** a prescription until it is resolved |
| `question` | `null`, or a typed question. `UNREPORTED_TRAINING`: planned runs have no report and the next run doses depend on them; the question lists the sessions (`unreported.sessionIds`) and asks the athlete to say what was done, or that training stopped (a break and its reason) |
| `missingInputs` | The facts the coach asks for |
| `proposal` | The new plan when there is one (a shadow proposal) |
| `offers` | Optional offers at block boundaries: `RUN_QUALITY_GRADUATION` (start harder running sessions), `LADDER_STEP` (the next exercise on a skill ladder) |
| `loadQuestions` | First logged strength loads waiting for the athlete's confirmation before they become the reference |
| the record | `actualLedger` (the completed-work record), `referenceState` (the continuation state, including what is pending) and `updatedModel` (the learned athlete model). These belong to the coach; a client carries them back unchanged |

## 5. How the evaluation client talks to the coach

You write what the athlete does and says; the evaluation client turns each step into a coach decision, exactly as a conforming product client would:

1. **Carries the record exactly as returned** (`actualLedger`, `referenceState`, `updatedModel`) into the next decision. It never adds, drops or edits record rows; new reports go only as observations.
2. **Follows the coach's plan:** when a decision returns a proposal, it becomes the plan in force (unless the step says `adoptProposal:false`, which models a client that does not apply it).
3. **Answers only what you wrote.** It never invents a report, a time, a load, a confirmation or an answer.
4. **Clinical clearance** happens only where a step says `clearance:'QUALIFIED_CLEARANCE'`: a qualified human has cleared the athlete. The client then continues with the carried record and without the clinical continuation state (the coach itself cannot clear it).
5. **Answer path for `UNREPORTED_TRAINING`:** the answer is delivered as a plain weekly review of the current week, as per-session reports (done, partly done, or not done), or as a declared break with its reason. You can write the answer per session, or use the `answer` shorthand (section 7), which expands to the sessions the pending question lists. A generic "I'm recovered" is not an answer.
6. **Weekly reviews** belong after the week's last session, inside that week. Not every week has to be reviewed: a skipped review is simply absent from the timeline; an empty review is a weekly review with no reports.

## 6. Events a step can carry

Every step is one decision with one `event.kind`. The fields each kind uses:

| Kind | Fields (in the step) |
|---|---|
| `WEEKLY_REVIEW` | reports in `observations`; optionally `interruption` to declare a break (as an answer) |
| `MISSED_SESSION`, `PARTIAL_SESSION`, `UNDERPERFORMANCE`, `OVERPERFORMANCE`, `PROGRESSION_NOT_TOLERATED`, `PROGRESSION_TOO_EASY` | `targetRef` (the session concerned) and its report in `observations` |
| `LOCAL_FATIGUE`, `SYSTEMIC_FATIGUE` | `signals:{region?:'LOWER'|'UPPER'|'ALL'}` |
| `SCHEDULE_CHANGE` | `changes:{runDays?, strengthDays?, runTurn?, strengthTurn?, runMinutes?, strengthMinutes?, longRunDay?, longRunMinutes?, sameTurnConfirmed?, temporaryPreference?, from?, to?}` (`from`/`to`: dates bounding a temporary change) |
| `UNAVAILABLE_DAY` | `changes:{unavailableDates:['YYYY-MM-DD', ...]}` |
| `DOUBLE_CONFLICT` | `changes:{from, to, runTurn?, strengthTurn?, sameTurnConfirmed?}` (a day where both sessions cannot happen as planned) |
| `EQUIPMENT_CHANGE` | `changes:{equipment:[...], from?, to?}` (travel: a temporary window) |
| `GOAL_CHANGE` | `changes:{goals:{...}, event?}` |
| `EVENT_DATE_CHANGE` | `changes:{eventDate:'YYYY-MM-DD'}` |
| `EVENT_WEEK_CONFLICT` | `changes:{unavailableDates?}` (a conflict in race week) |
| `RETURN_AFTER_PAUSE` | `interruption:{startDate?, endDate? (last day of the break), days?, reasonCategory?, reason? (free text), nonclinical?:boolean, clinicalReason?:boolean}`; optionally `currentDemonstration:{observedAt, sport:'RUN'|'STRENGTH', family, minutes, completed, effort:'CONVERSATIONAL'|'HARDER', response:'COMPATIBLE'|'ADVERSE', ordinaryFunction:'COMPATIBLE'|'IMPAIRED', nextDayFunction:'NORMAL'|'IMPAIRED'}` (a session done before the decision to show current tolerance) |
| `EXERCISE_SUBSTITUTION` | `substitution:{exerciseRef:{week, day, pattern?}, reason:'SKILL_MISMATCH'|'NONCLINICAL_DISCOMFORT_OR_PREFERENCE', nonclinicalConfirmed?:boolean, pain?:boolean, injury?:boolean, text?:string, to?: library id}`. `SKILL_MISMATCH`: the exercise cannot be done with steady technique. A discomfort or preference needs `nonclinicalConfirmed:true`. Pain or injury routes to a human |
| `RECOVERED` | none (a generic "recovered" label) |

- Reason categories for a pause or a break: `TRAVEL`, `WORK`, `FAMILY`, `SCHEDULE`, `VACATION`, `WEATHER`, `EQUIPMENT`, `MOTIVATION`, `STUDY`, `MOVING`, `OTHER_NONCLINICAL` (nonclinical); `ILLNESS`, `INJURY`, `PAIN`, `MEDICAL`, `SURGERY`, `PREGNANCY`, `POSTPARTUM`, `CLINICAL` (clinical). A break is treated as nonclinical only with a nonclinical category; free text alone, or a flag alone, is asked about.
- **Block-boundary choices** (`choices`): an answer to an offer the coach made: `{offer:'RUN_QUALITY_GRADUATION', decision:'ACCEPT'|'DECLINE'}`, or `{type:'LADDER_STEP', from, to}`. Use the shorthand `respondToOffers` (section 7) because you cannot know in advance which offers will appear.
- **Learning consent** can change at any step with `learningConsent:true|false`.
- Each step also carries the athlete's eligibility answers at that moment (section 7).

## 7. Case format (`R7D-CASE-1`)

The machine schema is `CASE_SCHEMA_R7D.json`. A corpus file is `{corpusRevision, cases:[...]}`. A case:

```
{caseId:'R7D-D01', authorIntent, coverageTags:[...], oracleClass, intake:{R6-INTAKE-1},
 timeline:[step, ...], expectedDomainProperties:[expectation, ...], metamorphicRelations:[relation, ...],
 independentAssessment:{rationale, preferredCoachingBehavior, acceptableAlternatives, concerns}, domainNotes}
```

- `authorIntent`: one or two sentences: what the case probes and why it matters.
- `timeline`: the steps in clock order (may be empty: a case can be onboarding only).
- `independentAssessment`: your own coaching judgment, written before any output exists. It is never given to the coach. Say what the best-supported behavior is, what alternatives are acceptable, and what would be a bad answer; say when asking the athlete or routing to a clinician is the right answer.

**A step:**

```
{stepId:'s1', at:{week, day, time:'HH:MM'} | 'YYYY-MM-DDTHH:mm:ss±hh:mm', event:{kind, ...kind fields},
 eligibility?:'REANSWERED_NO_CHANGE' | {explicit eligibility object},
 observations?:[fact, ...], answer?:{...}, targetRef?:{week, sport, day?, role?},
 clearance?:'QUALIFIED_CLEARANCE', respondToOffers?:{RUN_QUALITY_GRADUATION?:'ACCEPT'|'DECLINE', LADDER_STEP?:'ACCEPT'|'DECLINE'},
 confirmPendingLoads?:boolean, learningConsent?:boolean, adoptProposal?:boolean (default true), note?}
```

- `eligibility` defaults to `REANSWERED_NO_CHANGE`: the athlete re-answers the eligibility questions at this step's date with nothing clinical (`NONCLINICAL_CONFIRMED`, every flag `false`). Give an explicit object to model anything else (a new pain, an unanswered question, an old assessment date).
- **Session references.** The coach creates session ids, so you refer to sessions by `{week, sport, day?, role?}`. `role` may be a preference list (`['QUALITY','LONG']`): the first role with a matching session that week is used. `sport` plus one of the athlete's chosen days identifies a session when the coach scheduled that sport there. A reference that matches no session is a corpus error, so prefer chosen days and roles the program must contain (the long run on a stated `longRunDay`, the race on its date).
- **A fact** (an execution report): `{ref:{week, sport, day?, role?}, completed:boolean, asPrescribed?:true, minutes?, fraction?, firstExercises?, loadsByPattern?:{SQUAT:kg, ...}, exercises?, response?:{performance:'COMPATIBLE'|'UNDER'|'OVER'|'UNKNOWN', recovery:'COMPATIBLE'|'ADVERSE'|'UNKNOWN', effort:'ON_TARGET'|'EASIER'|'HARDER'|'UNKNOWN', nextDayFunction?:'NORMAL'|'IMPAIRED'|'UNKNOWN'}, observedAt?, reportedAt?, source?:{provider, activityId?, quality:'MANUAL'|'WEARABLE_FULL'|'WEARABLE_PARTIAL'}, eventId?, correctionOf?, correctedAt?, comparable?, confounded?}`.
  - `asPrescribed:true` copies the planned minutes, or the planned sets, reps and reserve; a load the athlete chooses stays unknown unless you give `loadsByPattern` (kilograms in the planned exercise's own convention). `fraction` reports a run done at that fraction of the planned minutes (for example `0.6`). `firstExercises:n` reports a strength session where only the first `n` exercises were done as prescribed. `minutes` or `exercises` (`[{id, sets:[{reps, load?:{value, unit, convention}, rir?}]}]`) give explicit values.
  - `response` fields you omit stay `UNKNOWN`. Omitted `observedAt` keeps day precision (the session date); the client never invents a clock time. `reportedAt` is when the report reached the app (a late report).
  - The default `eventId` is derived from the case and session. Give your own when a later fact must point at it (`correctionOf`), or for two separate reports of one session.
  - **Bulk form:** `{each:{weeks:[...], sport, roles?:[...]}, ...fact}` expands to every planned, not skipped session of that sport (and roles) in those weeks of the plan in force.
- **`answer`** (to a pending `UNREPORTED_TRAINING` question): `{report?:{fact without ref}, overrides?:[{ref, ...fact}], declareBreak?:{interruption fields}}`. The client expands `report` to every session the pending question lists, applies your `overrides` to the sessions they reference, and adds `declareBreak` as the step's `interruption`. If no question is pending at that point, the expansion is empty and the evaluation records it.
- `targetRef` names the session an event is about.
- `respondToOffers` answers any offer of that kind present in the decision just before this step; `confirmPendingLoads:true` confirms every first logged load the previous decision asked about, at the value logged.

**An expectation** (`expectedDomainProperties`): `{expectationId, atStep:'GENERATE'|stepId, oracleClass, assert, rationale}`. Write expectations about **properties**, not exact numbers: avoid exact doses unless the coaching question truly has one answer. `assert` is one of:

| `assert.type` | Meaning (evaluated on the decision at `atStep` and the plan in force after it) |
|---|---|
| `STATUS_IN` `{oneOf:[...]}` | The status is one of these |
| `VALIDITY_IS` `{value}` | `planValidity.status` equals the value |
| `QUESTION_KIND_IS` `{value}` | The question kind (or `null`) |
| `NO_PRESCRIPTION` | Nothing is prescribable: no program, or the plan requires reconciliation |
| `ROLE_ABSENT` / `ROLE_PRESENT` `{weeks:[...], sport, roles:[...]}` | No / at least one live session with one of these roles in those weeks |
| `PHASE_IS` `{week, oneOf:[...]}` | The phase of that week |
| `ROLE_MINUTES_COMPARE` `{sport:'RUN', role, week, op:'<='|'<'|'>='|'==', otherWeek}` | The longest session of that role in `week` compared with `otherWeek` |
| `JUDGED` `{statement}` | A property only a domain judge can assess; it goes to the judge with your rationale |

**`oracleClass`** of an expectation (and of the case, for its main question):
- `INVARIANT_ORACLE`: a rule that holds for any athlete by contract (for example: nothing prescribed while a clinical route stands).
- `DOMAIN_ORACLE`: a coaching judgment that a competent coach would make for this athlete.
- `METAMORPHIC_ORACLE`: a relation between two versions of the case (below).
- `NOT_EVALUABLE_DOMAIN`: the adequacy depends on clinical judgment, so no domain answer can be asserted.

**A metamorphic relation** (`metamorphicRelations`): the evaluation applies a fixed set of mechanical relations to every case anyway (reordering reports within a decision, a duplicate report from a second device, renamed ids and providers, an equivalent load convention, a re-sent report, the same answer delivered through a clinical route and cleared, a calendar shift). List any of those you consider central, or add your own `VARIANT`: `{relation:'VARIANT', variant:{intakePatch?:{...}, timeline?:[...]}, compareAtStep, expect:'SAME_PLAN'|'NOT_HIGHER_RUN_LOAD'|'NOT_LOWER_RUN_LOAD', rationale}`. A `VARIANT` replaces the intake fields in `intakePatch` and/or the whole timeline, and compares the plan in force after `compareAtStep` in both versions (for example: the same facts arriving late versus on time should give the same plan after the week's review).

**`coverageTags`**: choose from: `COLD_START`, `RUN_FIRST`, `STRENGTH_FIRST`, `BALANCED_HYBRID`, `RUN_ONLY`, `STRENGTH_ONLY`, `GENERAL_FITNESS`, `RACE_10K`, `RACE_HALF`, `NON_RACE`, `H4`, `H8`, `H12`, `H16`, `RUN_EXP_NONE`, `RUN_EXP_NOVICE`, `RUN_EXP_INTERMEDIATE`, `RUN_EXP_EXPERIENCED`, `STR_EXP_NONE`, `STR_EXP_NOVICE`, `STR_EXP_INTERMEDIATE`, `STR_EXP_EXPERIENCED`, `FREQ_LOW`, `FREQ_HIGH`, `SHARED_DAYS`, `SAME_TURN`, `TOO_MANY_DAYS`, `BODYWEIGHT_ONLY`, `KETTLEBELL`, `GYM`, `WEARABLE_PARTIAL`, `WEARABLE_FULL`, `LOW_DATA`, `START_NON_MONDAY`, `ELIGIBILITY_UNKNOWN`, `CLINICAL_SIGNAL`, `CLINICAL_PAUSE`, `OUT_OF_SCOPE`, `UNREPORTED_WEEKS`, `LATE_ANSWER`, `PARTIAL_ANSWER`, `SHORTENED_RUNS`, `MIXED_EXECUTION`, `ADVERSE_RESPONSE`, `LATE_REPORTER`, `SKIPPED_REVIEW`, `EMPTY_REVIEW`, `SCHEDULE_CHANGE`, `UNAVAILABLE_DAY`, `DOUBLE_CONFLICT`, `EQUIPMENT_CHANGE`, `TRAVEL`, `SUBSTITUTION`, `SUBSTITUTION_PAIN_CLEARANCE`, `GOAL_CHANGE`, `EVENT_DATE_CHANGE`, `FATIGUE_LOCAL`, `FATIGUE_SYSTEMIC`, `REPEATED_SIGNAL`, `RETURN_SHORT`, `RETURN_MODERATE`, `RETURN_LONG`, `RESTART`, `WALK_JOG`, `TAPER`, `RACE_WEEK`, `POST_RACE`, `TAPER_ANSWER`, `DUPLICATE_SOURCES`, `CONTRADICTION`, `CORRECTION`, `OUT_OF_ORDER`, `CLOCK_SKEW`, `TIMEZONE`, `LEARNING_PATTERN`, `LEARNING_NOISE`, `NO_CONSENT`, `CONSENT_REVOKED`, `OFFERS`, `LOAD_CONFIRMATION`, `SAME_FACTS_DIFFERENT_ORDER`.

## 8. What makes a case invalid (a corpus error)

A case that the interface cannot run is a corpus error: it is excluded from the evidence and never counts against the coach. Typical causes: a date outside the window; a step clock outside the program or out of order; a weekly review placed outside its week; a session reference that matches nothing; an exercise id outside the library in a known exercise; an expectation about a step that does not exist; a contradictory intake that you meant as valid. When in doubt, keep the case simpler.
