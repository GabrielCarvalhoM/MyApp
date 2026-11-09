# V1CP — integration contract for the app and the design candidate

**Status: DERIVED INTEGRATION HANDOFF, not canonical.**
- Product, domain and experience authority stay where `canon/CANONICAL_INDEX.md` puts them. This page describes only what the CoachingCore reference runtime accepts and returns, at commit `5ee9dec` (after the bounded fix cycle). It invents no product decision.
- The runtime is an offline, synthetic shadow reference: `mode: 'SHADOW'`, `applied: false`. It is not the app's backend, and V1_COACHING_AUTHORITY_READY = NO.
- This mission edits no Figma file. Section 9 lists what the design candidate must represent, for whoever owns the design to reconcile.

Status classes used below:

| Class | Meaning |
|---|---|
| IMPLEMENTED | The runtime computes and returns it today. |
| DERIVABLE | The client can compute it from the runtime's outputs, with no new engine rule. |
| SPECIFIED_BUT_PENDING | Decided in the product or domain records, not in the runtime yet; owner named. |
| NOT_SUPPORTED | Neither decided nor computed. Showing it would be inventing it. |

## 1. Runtime surface

| Entry point (`CoachingCore/src/r6-index.mjs`) | Input | Output |
|---|---|---|
| `canonicalizeIntake(intake)` | R6-INTAKE-1 | `{status, canonical, errors, missing, uncertainty, negotiation, clinical}`. Status is `CANONICAL`, `ASK`, `INVALID_INPUT`, `UNSUPPORTED` or `CLINICAL_HUMAN_REQUIRED`. |
| `generateProgram(intake)` | R6-INTAKE-1 | `{status: PROPOSED/ASK/…, program, missingInputs, errors, uncertainty, negotiation, reason, nextObservation, …}` |
| `evaluateProgram(program, review)` | the program plus one R6-REVIEW-1 event | A decision (section 3). `proposal` is the next program when the plan changes. |
| `restartProgram({intake, record, referenceState, asOf})` | an updated intake plus the carried record | a new program (F08 Situation 3). `restart` carries `{carriedRecord, priorCapacity, boundedByRecord, note}`. |

Rules for every call:
- Every call is deterministic and pure.
- **The client is the store**:
  - It persists the latest `program` (the `proposal` of the last decision that has one).
  - It persists the append-only record `actualLedger`, returned by each decision.
  - It persists `referenceState`, returned by each decision.
  - It sends the last two with the next review.
- A review that omits them loses facts. Examples:
  - a pending clinical hold, which is sticky through `referenceState.pending`;
  - a declared break;
  - a "not 100%" report;
  - a check;
  - a readiness declaration.
- Facts that changed after the decision clock are refused or quarantined, never silently merged.

## 2. Shared conventions (all IMPLEMENTED)

| Convention | Rule |
|---|---|
| Dates | Local ISO `YYYY-MM-DD`. Instants are ISO with an offset. `timezoneOffsetMinutes` is fixed per program. |
| Days | `runDays`, `strengthDays` and `longRunDay` are offsets 0–6 from `startDate`, never weekdays. With a Monday start, 0 is Monday. The client maps its weekday chips to offsets of the chosen start. |
| Shifts | `runTurn` and `strengthTurn` are `AM`, `PM` or absent. A morning session is over at local noon; a PM or unstated session stays ahead until the day ends. One shift per sport (DR-112). |
| Week | `weekIndex` is 0-based. A review's `asOf` must fall inside that week. |
| Event identity | `event.id` is unique per fact. The same id with the same payload is a replay and changes nothing. The same id with another payload is ASK. |
| Loads | `{value, unit: KG|LB, convention}`. LB converts to kg. The conventions the engine reads are `TOTAL`, `PER_HAND`, `SINGLE_IMPLEMENT`, `MACHINE_STACK` and `BODYWEIGHT` (`LOAD_CONVENTIONS`), plus the no-kg `BAND_TENSION` and `ASSISTED_BODYWEIGHT`. Anything else is disclosed and not used (section 7, E3). |
| Effort | Strength rows carry `rir` (reps in reserve). Runs carry an effort domain and cue (`EASY_CONVERSATIONAL`, …). Pace is never derived from a goal time or from easy runs. |
| Free text | Never an F08 input (SEC-V1CP-05). Elsewhere it can only add a clinical route or a question (R6). |

## 3. The decision envelope (`evaluateProgram`)

**Fields**
- `status`, `action`, `reason`.
- `proposal`, which is null when nothing changes.
- `actualLedger` and `referenceState`.
- `missingInputs` and `question`.
- `disclosures`, which are informational and never blocking.
- `offers`: block-boundary choices, which carry `recommendation` under a coach profile (P4).
- `gates`, `counterfactuals`, `horizons`, `loadQuestions`, `nextObservation`, `planValidity`, `trace`.

**`status`**

| Value | Meaning for the client |
|---|---|
| `MODIFY` | Adopt `proposal` after the athlete's explicit adoption, per the product flow. |
| `KEEP` | Nothing changes. |
| `ASK` | Ask exactly `missingInputs`, phrased from `reason` and `question`. The plan stays as it is. |
| `HOLD` | The contract or integrity failed. Show nothing new. |
| `UNSUPPORTED` | Outside coverage. |
| `CLINICAL_HUMAN_REQUIRED` | The clinical hold. No dependent prescription; the record keeps being kept. Its only exit is a readiness declaration (section 4.5). |

**`action`** is the closed vocabulary of the runtime's handlers:
- KEEP, REDUCE, MOVE, RESCHEDULE_WITHIN_WEEK, SKIP_NO_CATCH_UP;
- SUBSTITUTE, SUBSTITUTE_FOR_REASON;
- REESTABLISH, REPLAN_FROM_EVIDENCE, REPLAN_FUTURE_PHASES, REARRANGE_FUTURE_WEEKS, LEARNED_REARRANGEMENT;
- GATED_NEXT_STEP, INSTANTIATE_LOGGED_LOADS, ADOPT_LOGGED_LOADS;
- PREFERENCE_CHANGE;
- WELLBEING_REDUCTION, WELLBEING_RETURN_START, WELLBEING_RUNG_HELD;
- READINESS_RESTART;
- ASK, CLINICAL_HUMAN_REQUIRED, UNSUPPORTED.

The client maps status to UI states. It maps action only to explanation copy.

**Event kinds (`review.event.kind`)**
- WEEKLY_REVIEW, MISSED_SESSION, PARTIAL_SESSION;
- UNDERPERFORMANCE, OVERPERFORMANCE, PROGRESSION_NOT_TOLERATED, PROGRESSION_TOO_EASY;
- LOCAL_FATIGUE, SYSTEMIC_FATIGUE;
- SCHEDULE_CHANGE, UNAVAILABLE_DAY, DOUBLE_CONFLICT, EQUIPMENT_CHANGE, GOAL_CHANGE, EVENT_DATE_CHANGE, EVENT_WEEK_CONFLICT;
- RETURN_AFTER_PAUSE, RECOVERED;
- EXERCISE_SUBSTITUTION, PREFERENCE_CHANGE;
- NOT_FEELING_100, WELLBEING_CHECK, READINESS_DECLARATION.

**Unknown fields.** A field outside the closed vocabulary is never echoed back, since it may carry free text. The decision returns one `<group>.unrecognized` entry in `missingInputs`.

**Clinical holds in the record.** Every decision that opens a clinical hold appends a `CLINICAL_HOLD` row to `actualLedger`, carrying no reason text. A readiness declaration after it releases it. A new plan (`restartProgram`) reads standing holds from the record, never only from `referenceState`.

**Every review** carries:
- `eligibility`: the six clinical flags as booleans, a `status` and `assessedAt`, no older than 14 days. F08 entries need it dated that day, by the program's local clock (an instant is read in the program's offset). A readiness declaration's screen must come after the hold it answers; a same-day screen needs its time.
- `observations`: session reports. Each has `{eventId, sessionId, actual: {completed, minutes, exercises: [{id, sets: [{reps, load?, rir?}]}]}, response: {performance, recovery, effort, nextDayFunction}, occurrenceDate}`.

## 4. Capabilities

### 4.1 Onboarding → canonical intake → athlete model → engine → plan

**Inputs (R6-INTAKE-1)**
- Envelope: `asOf`, `startDate`, `weeks`, `timezoneOffsetMinutes`, `learningConsent`.
- `athlete`:
  - identity and eligibility: `ageYears` (eligibility only), `eligibility`;
  - body data: `sex`, `heightCm`, `weightKg` (never a dose input);
  - goals: `goals {run, strength}`, with run `{kind:'RACE', event:{kind, date}}` for a race;
  - experience: `runExperience` and `strengthExperience` (NONE/NOVICE/INTERMEDIATE/EXPERIENCED), or `runTrainingMonths` and `strengthTrainingMonths`, which derive the category (SSCTR-V1CP Q03);
  - recent training: `recent {runDaysPerWeek, runMinutesPerWeek, longestRunMinutes, strengthDaysPerWeek}`;
  - history: `performanceAnchors` (race results; Q04), `knownExercises [{id, load}]`, `equipment`;
  - choices and state: `coaching` (section 4.3), `pause`, `restart`.
- `schedule`: `runDays`, `strengthDays`, `runTurn`, `strengthTurn`, `runMinutes`, `strengthMinutes`, `longRunDay`, `longRunMinutes`, `sameTurnConfirmed`, `temporaryPreference`.

**Outputs**
- `program.weeks[].sessions[]`, each `{id, date, day, sport, role, turn, key, optional, prescription, explanation}`.
- Strength `prescription.exercises[]`, each `{id, role, region, sets, reps, rir, load {mode: KNOWN|FROM_LOG|ESTABLISH|BODYWEIGHT, value?, unit, convention, rule}, instructions}`.
- Run `prescription`: `{family, durationMinutes, effortDomain, effort, strides?, work?}`.
- Program-level: `program.capability` (run and strength class), `phases` and `blocks`, `negotiation` (disclosures), `uncertainty` (unknowns and their actions).

**Recoverable errors**
- `ASK` with `missingInputs`.
- `INVALID_INPUT` with `errors`: a closed vocabulary, never defaulted.

### 4.2 Weekly review and session reports

**Inputs**
- WEEKLY_REVIEW, with `observations` for the week's sessions.

**Outputs**
- The next week's doses: the gates per run role and per exercise (`ADVANCE`, `HOLD`, `REGRESS`, `EARNED`).
- `loadQuestions`: a logged load awaiting confirmation.
- `offers`: at a block boundary.

**State changes**
- `proposal` re-plans from the next week. Executed history is immutable.

**Explanation data**
- `reason`, `gates` with their per-key reasons, `horizons`, `counterfactuals`.

### 4.3 Coaching choices: profile, volume, difficulty (Blocks 3–4; SSCTR-V1CP Q09–Q12)

**Inputs**
- `athlete.coaching = {profile: CONSERVATIVE|BALANCED|DEMANDING, volume: LEVEL|{RUN, STRENGTH}, difficulty: LEVEL|{RUN, STRENGTH}}`, where LEVEL is LOWER, STANDARD or HIGHER.
- Absent means BALANCED/STANDARD/STANDARD. That is the FREEZE-6 behaviour, byte for byte.
- A change is PREFERENCE_CHANGE with `changes.coaching`. It takes effect from next week. This week and history are unchanged. In the last week it is KEEP, recorded for the next program.

**Outputs**
- `program.negotiation` disclosures: COACH_CONSERVATIVE, COACH_DEMANDING, VOLUME_LOWER_*, VOLUME_HIGHER_* ("same as standard here"), DIFFICULTY_*.
- `offers[].recommendation`: KEEP_BUILDING (conservative) or ACCEPT (demanding).

**Observable effects**

| Lever | Effect |
|---|---|
| Profile CONSERVATIVE | Holds only. EARNED becomes ADVANCE; an EASY-mode development run with no reported response holds. |
| Profile DEMANDING | The balanced doses, plus advice. |
| Volume LOWER, strength | Main lifts only, base sets. |
| Volume LOWER, running | No easy-run step. |
| Volume, taper and race week | Fractions at the approved bounds. |
| Difficulty, strength | LOWER: step tolerance 0. HIGHER: RIR 2 on eligible upper accessory rows in development weeks, for intermediate or experienced lifters. |
| Difficulty, optional strides | LOWER: hidden. HIGHER: shown in the session, still optional. |
| Difficulty, taper | Harder work at the approved bounds. |

The envelope (gates, caps, returns, F08, clinical screen) is the same for every choice.

### 4.4 F08 Situation 1: "not 100%" (NOT_FEELING_100, WELLBEING_CHECK; SSCTR-V1CP Q05–Q06)

**Inputs**
- `review.wellbeing = {condition, warningSigns, intent, days | endDate, returnSpeed?, sports?, region?}`, plus an eligibility screen dated that day.

| Field | Values |
|---|---|
| `condition` | MILD_INDISPOSITION, UNUSUAL_FATIGUE, MILD_ILLNESS, MINOR_DISCOMFORT, NEED_REST |
| `warningSigns` | Booleans, every item actively answered. The items depend on the condition (`signsFor`): W1–W9 always; W10 and W12–W14 for the systemic conditions; W11 and W15 for MILD_ILLNESS and MILD_INDISPOSITION. |
| `intent` | REDUCE_LIGHT, REDUCE_SUBSTANTIAL, LIGHT_ACTIVITY_ONLY, REST. REDUCE_LIGHT is refused while unwell (MILD_ILLNESS, MILD_INDISPOSITION). |
| `days` | 3–14. The window starts on the decision day. |
| `returnSpeed` | CONSERVATIVE, BALANCED (default) or FASTER. Speeds are not coach profiles. |
| `sports` | RUN and/or STRENGTH, for local conditions only. Both when unstated. |
| `region` | WHOLE_BODY, UPPER_BODY or LOWER_BODY. It limits the strength rows of local conditions. |

**Check** (`review.wellbeingCheck`, on the WELLBEING_CHECK kind or a weekly review in the episode)
- `{warningSigns, exerciseResponse?, improved?, returnSpeed?}`.
- `exerciseResponse` holds X1–X4 (X3 for MILD_ILLNESS and MILD_INDISPOSITION). It is asked after executed sessions and with any adverse session.
- `improved` is asked at the window-end check.
- `returnSpeed` can change until the return starts.

**States**

| State | What happens |
|---|---|
| WINDOW | The intent's rung (R0 rest; R1 optional walks; R2 much lighter; R3 easier) for the affected sports. |
| WAITING_FOR_CHECK | After the last day the affected sessions are rest until the check. |
| RETURN (rungs) | One whole executed plan week per rung, at the chosen speed. |
| COMPLETED | Normal gates again. |

Each RETURN rung is recorded on its week as `adaptations[kind=WELLBEING_REDUCTION, phase=LADDER, rungs, starts, hold]`.

**Transitions**
- Improved → RETURN.
- Not improved → CLINICAL_HUMAN_REQUIRED. NEED_REST instead gets ASK: declare a break or start a new plan.
- Any warning sign yes → CLINICAL_HUMAN_REQUIRED.
- A rung not done as planned repeats (no debt).
- A new report while open supersedes the open episode and opens its own window, at its own intent and coverage. While the open window or its wait still runs, the chain is bounded to 14 continuous days; more is asked. The same condition again in a later plan week → CLINICAL_HUMAN_REQUIRED. A local report in a scope the open episode does not touch → ASK (one episode at a time).
- Early end: a WELLBEING_CHECK with `improved: true` before the chosen end, from the window's third day, ends the window the day before and starts the return. Before day 3 → ASK.
- A race inside the weeks the return needs → ASK at the window-end check: move it or skip it; the return never crosses a race. While sessions wait for the check, the race waits too. It is kept and marked `waitsForCheck: true`, never dropped.
- A ladder week with no weekly review carrying the check does not count as done: its step repeats.

**Recoverable errors**
- ASK for every unanswered or unknown item, and for a race inside the window.

**Persisted**
- Record facts `WELLBEING_DECLARED` and `WELLBEING_CHECKED`: append-only, deduplicated by event id. One event id is one fact, of one type.
- Every F08 row carries `rowHash`, the digest of its own content. Store and send rows byte for byte: a changed row is never read again.
- A row is read only when it belongs to the athlete and was declared by the decision's clock.

**Explanation data**
- `reason` describes the window and the return concretely, for example "a much lighter week, then an easier week, then a week at your usual doses".
- `disclosures`: WELLBEING_INSTRUMENT (never a clearance) and RACE_DURING_RETURN.
- Week adaptations name the rung of each week.

### 4.5 F08 Situation 2: readiness after a clinical hold (READINESS_DECLARATION; Q07)

**Inputs**
- `review.readiness`, with an eligibility screen dated that day:

| Field | Values |
|---|---|
| `declaredRecovered` | `true` |
| `warningSigns` | W1–W15, all of them. |
| `sports` | `{RUN:{ready, runningNotRestricted?}, STRENGTH:{ready, restrictions?}}` |
| `restrictions` | AVOID_LOWER_BODY_STRENGTH, AVOID_UPPER_BODY_STRENGTH |
| `runningNotRestricted` | Required (`true` or `false`) when running is ready and AVOID_LOWER_BODY_STRENGTH is declared. Otherwise only `true` is accepted; a stated running restriction without that is asked. |
| `STRENGTH.restrictions` | Required when strength is ready: an array, where `[]` is the answer "none". Never defaulted. |
| `hold` | Optional. When sent, it must name a hold on record; otherwise ASK. |
| `returnSpeed` | BALANCED or CONSERVATIVE. FASTER is refused. |

**Outputs and states**

| State | What happens |
|---|---|
| RESTART | A sport declared ready restarts at the MODERATE class or above, by the existing return recipe. Its first step is held one more week. CONSERVATIVE is one class more cautious. |
| HELD | A sport not declared ready, or running restricted, stays held. |
| RESTRICTED | The restricted rows are left out, never substituted. When a restriction ends, its region restarts at its own entry. |
| RESTART_CHECKS | While a restarted sport is returning, each weekly review asks W1–W9 and X1–X4. An adverse session asks them first. |

**Recoverable errors**
- Any missing item keeps CLINICAL_HUMAN_REQUIRED, with `missingInputs`.

**Persisted**
- `READINESS_DECLARED`. The clinical cause stays on record (R-F08-1).

**Copy**
- "You told us you are ready …"; "This is your statement, not a medical clearance".

### 4.6 F08 Situation 3: new plan (restartProgram; Q08)

**Inputs**
- An updated intake (goals, availability, recent exposure, equipment, choices; optionally the pause reason).
- The carried `actualLedger` and the last `referenceState`.

**Outputs**
- A new program from the existing cold start.
- Per sport, the pause comes from the record.
- The stated recent running exposure is bounded by what the record shows: `restart.boundedByRecord`.
- Above 10 days without a sport, or after any readiness declaration, the start is no higher than the return entry: running class RESTART, strength entry rows.
- Restrictions carry over, and sports not declared ready are not programmed.

**Errors**
- `CLINICAL_HUMAN_REQUIRED` while a hold stands, with `missingInputs: ['readiness']`.
- `ASK` for the pause reason.

**Persisted**
- The record returns whole: `restart.carriedRecord`.

### 4.7 Breaks (RETURN_AFTER_PAUSE): existing R6/R7 contract

**Inputs**
- `review.interruption {startDate, endDate | days, reasonCategory, reason?, episodeId?}`.

**Behaviour**
- The return class comes per sport from its own stop (SHORT ≤10 days, MODERATE ≤28, LONG). This is A3, SSCTR-V1CP Q02.
- A clinical category or wording → CLINICAL_HUMAN_REQUIRED.
- A break's return ends an open Situation 1 episode from its week. They are never converted into each other (C-Q05-6).

## 5. Persistence summary (client-side; Security SEC-V1CP-13, 14, 19, 20 apply)

| Item | Owner | Notes |
|---|---|---|
| `program` (latest) | the account | Replace it on an adopted `proposal`. |
| `actualLedger` | the account | Append-only: reports, declared breaks, F08 facts. Never edit or delete rows outside the tombstone design (SEC-V1CP-14, pending). |
| `referenceState` | the account | Send it back as received. |
| F08 inputs and derived states | the account | Sensitive health data (SEC-V1CP-01). They never reach analytics, logs, push text or shares (SEC-V1CP-09, 16, 17, 18). |

## 6. Copy and safety constraints for the client (PCG-V1CP-F08 r2; Security)

- Never use "liberado", "liberação", "alta", "apto", "autorizado", "cleared", "approved by", "released", "fit to train", or any equivalent. Readiness is always the athlete's own statement (SEC-V1CP-21).
- All warning signs answered no is never shown as safe (RF-4).
- No document upload, photo, file picker or professional's name, in any F08 flow (SEC-V1CP-04, 24).
- Every F08 item starts unanswered and is actively answered. There is no "all no" shortcut and no copy from a previous screen (SEC-V1CP-03).
- Push notifications and the lock screen show neutral text only, such as "Seu plano foi ajustado" (SEC-V1CP-17).
- Urgent-care wording is G04's. The runtime says "seek a professional assessment".

## 7. Onboarding field audit: the Founder's synthetic athlete

Source: `CoachingCore/test/v1cp-experience.test.mjs`, which pins this behaviour. The athlete's stated facts:
- man, 30, 170 cm, 70 kg;
- 10 months of running and of strength training;
- running Tue/Thu/Sat and strength Mon/Wed/Fri, in the evening;
- goals PERFORMANCE and HYPERTROPHY;
- 45 and 60 minutes per session;
- long run on Saturday;
- 5 km in 30:36 and 10 km in 1:18:00;
- squat 20 kg and bench 15 kg, in the "plates" convention;
- screening clear;
- Monday start.

**Identity, body and screen**

| Stated fact | Engine field | Status | Note |
|---|---|---|---|
| Age 30 | `ageYears` | IMPLEMENTED | Eligibility only (18+); never a dose input. |
| Man, 170 cm, 70 kg | `sex`, `heightCm`, `weightKg` | IMPLEMENTED, kept | Never a dose input. The same weeks at any height or weight. |
| Screening clear | `eligibility` | IMPLEMENTED | Six booleans plus `assessedAt`. |
| Monday start | `startDate` | IMPLEMENTED | Day offsets count from it. |

**Experience and goals**

| Stated fact | Engine field | Status | Note |
|---|---|---|---|
| 10 months each | `runTrainingMonths`, `strengthTrainingMonths` | IMPLEMENTED (E1) | INTERMEDIATE in both sports; never sets current capacity. |
| Weekly running minutes | `recent.runMinutesPerWeek` | Not stated | Unknown stays unknown: running starts EASY_UNKNOWN, with no walk/jog. |
| PERFORMANCE / HYPERTROPHY | `goals` | IMPLEMENTED | PERFORMANCE without a dated event is the non-race performance goal. |

**Schedule**

| Stated fact | Engine field | Status | Note |
|---|---|---|---|
| Run Tue/Thu/Sat; strength Mon/Wed/Fri | `runDays [1,3,5]`, `strengthDays [0,2,4]` | IMPLEMENTED | Offsets from a Monday start, not weekdays. |
| Evening | `runTurn`/`strengthTurn` `PM` | IMPLEMENTED, with a gap | See the shift gap below. |
| 45 and 60 minutes | `runMinutes`, `strengthMinutes` | IMPLEMENTED | |
| Long run on Saturday | `longRunDay: 5` | IMPLEMENTED | Must be one of the run days. |

**Records and loads**

| Stated fact | Engine field | Status | Note |
|---|---|---|---|
| 5 km 30:36; 10 km 1:18:00 | `performanceAnchors` | IMPLEMENTED (E2) | Kept as stated. A current confirmed result (≤28 days, completed, tolerated) caps only the first long run and the single-run limit. Older ones are history. Never a pace. |
| Squat 20 kg, bench 15 kg, "plates" | `knownExercises` | IMPLEMENTED (E3) | Disclosed, not used: PLATES is no load convention the engine reads, and the barbell/rack the squat needs was not declared. The load is established by effort. |

**Gaps**

| Gap | Status |
|---|---|
| Shift vocabulary: AM/PM only, one per sport. A three-way morning/afternoon/evening choice, or several shifts, collapses afternoon and evening into PM, so two PM sports on one day read as the same shift (back-to-back). | SPECIFIED_BUT_PENDING: the product owns the vocabulary; DR-112 says "one shift". |
| A "plates" convention. | NOT_SUPPORTED: no engine rule reads it. Disclosed. |

## 8. Output classification

**Sessions and doses**

| Output the experience may show | Status | Source |
|---|---|---|
| Weekly plan: days, sessions, roles, durations | IMPLEMENTED | `program.weeks` |
| Strength sets, reps, reps in reserve, load guidance (known, from log, establish) | IMPLEMENTED | `prescription.exercises` |
| Effort cues for runs | IMPLEMENTED | `effortDomain` / `effort` |
| Logged-load confirmation questions | IMPLEMENTED | `loadQuestions` |
| Block-boundary offers (ladder steps, graduation), with coach advice | IMPLEMENTED | `offers`, `recommendation` |
| Run paces from a goal time or a test | NOT_SUPPORTED | Forbidden by the runtime (`run.goalOrEasyDerivedPace`). |
| Heart-rate zones as a prescription | NOT_SUPPORTED | |

**Explanations and plan reasons**

| Output | Status | Source |
|---|---|---|
| "Why this changed": reasons, counterfactuals, horizons | IMPLEMENTED | decision fields |
| Disclosures (coach profile, volume, difficulty, unusable history, F08 instrument) | IMPLEMENTED | `negotiation`, `disclosures` |
| Weekly summary: planned versus completed sessions and minutes | DERIVABLE | Program plus record. Sessions' `status` and `plannedPrescriptionHash`. |
| Block summary | IMPLEMENTED | BLOCK_REVIEW disclosure at the block boundary |

**F08**

| Output | Status | Source |
|---|---|---|
| Return progress after a Situation 1 window (rung per week) | IMPLEMENTED | Week adaptations `WELLBEING_REDUCTION` (`phase`, `rungs`) |
| Clinical hold state and its exit | IMPLEMENTED | `status: CLINICAL_HUMAN_REQUIRED`, `referenceState.pending`, READINESS_DECLARATION |
| Early end of a Situation 1 window ("I'm better sooner") | IMPLEMENTED from the window's third day | WELLBEING_CHECK with `improved: true`. An end before day 3 is a Founder/PCG question (RC-16). |
| Concurrent Situation 1 episodes in non-overlapping scopes | NOT_SUPPORTED | One open episode at a time (V1 limit). |

**Metrics and scores**

| Output | Status | Source |
|---|---|---|
| Records and PRs from executed sessions and race results | DERIVABLE | Record plus `performanceAnchors`. No PR rule exists in the engine; display only, never a dose. |
| Consistency, streaks, the weekly adapted-completion metric | SPECIFIED_BUT_PENDING | DR-132 (proposed North Star); Growth Layer; G03 copy. Not computed by the engine. |
| Readiness score, Body Battery, stress, HRV-based readiness | NOT_SUPPORTED | No engine rule or input. V1 wearable scope is HealthKit inbound (DR-117–123), with no readiness model. |
| Race-time prediction | NOT_SUPPORTED | No prediction model. Race results are history and caps only. |

## 9. Design × engine pending list (for the design owner; no Figma was opened or changed here)

**Situation 1**
- Represent every F08 item as an unanswered control, yes or no, one by one (SEC-V1CP-03). Item sets change with the condition (`signsFor`).
- Represent the WAITING_FOR_CHECK state after a window's last day: sessions show as waiting, with the check as the action.
- Represent the window-end check: the warning signs, plus "has it passed or clearly improved?" (yes/no).
- Represent each weekly check while the episode is open, and the exercise-response items after executed or adverse sessions.
- Represent the return speeds as concrete copy (C-Q06-4), never as coach profiles. Represent the rung of each return week.
- Represent the early end ("I am better") from the window's third day, a report that replaces an open one, a race waiting for the check, and the race question at the return start (move or skip).

**Situation 2**
- Represent the readiness declaration:
  - every warning sign;
  - each sport ready, yes or no;
  - restrictions from the closed list, with "none" as an explicit answer;
  - the explicit "running itself is not restricted" item;
  - the BALANCED/CONSERVATIVE restart.
- Never use clearance wording.

**Coaching choices**
- Represent the profile, volume and difficulty choices with their disclosures.
- Higher volume says "same as standard here" where it is (C-Q10-1).
- DEMANDING is advice-only (C-Q09-2, a Founder question).

**Onboarding**
- The shift vocabulary: AM/PM per sport today (section 7).
- Day chips map to offsets from the chosen start.

**Do not show (sections 7–8)**
- Anything classed NOT_SUPPORTED above: readiness score, Body Battery, stress, race prediction, paces from goals, early window end.

## 10. V1CP Fix-Forward delta (2026-11-09; branch `claude/v1cp-fix-forward`)

Appended; sections 1–9 above are kept as history. Where a line above disagrees with this section, this section is current for the fix-forward candidate. Only fields, options, states, outputs and rules that changed are listed. Nothing here is validated with real athletes or authorizes real collection (SEC-V1CP pendings unchanged: erasure/tombstone, custody, access control, minimisation, consent).

### 10.1 Situation 1: reports while reports are open (NB-1; SSCTR CH-r2)
- `wellbeing.days`: 3–14 for a report no open report covers. A report that continues a sport's chain may be 1 to the smallest remaining allowance of the sports it covers: the ASK says "choose 1 to N days" (never 0). No day left: the persistence route (below).
- Per sport, at most one report governs. A covered sport: joins the new report when no report governs it; is unchanged when the report names the same condition, not stricter and ending inside its window (`KEEP`, `offers[WELLBEING_CHECK]`, **not recorded**); otherwise moves to the new report at the stricter rung, carrying its unresolved conditions. A sport not covered keeps its report and check. A report on sports no report governs opens its own report (no question).
- Same condition in its wait, or again after it was answered improved before the sport's chain reset: the persistence route (`CLINICAL_HUMAN_REQUIRED` with `guidance` PROFESSIONAL_ASSESSMENT; NEED_REST: `ASK interruption|restart`), recorded.
- New record fields on `WELLBEING_DECLARED.wellbeing`: `takenFrom {SPORT: eventId}`, `chainFrom {SPORT: eventId}` (a chain continued across a declared break or readiness restart), `rungs {SPORT: rung}`, `carried {SPORT: [{condition, episode, startDate, endDate, rung}]}`, `supersedes`, `supersedesAll`, `returnPlan {SPORT: …}`. Persistence facts: `chained: true`, `persistence` NOT_IMPROVED | RECURRENCE | FOURTEEN_DAYS, `of [eventId]`.
- Week markers: one `WELLBEING_REDUCTION` marker per sport where the sports diverge (read a week's rungs as the union of its unended markers). WINDOW/WAIT markers may carry `unwell: true` (a systemic condition bound).

### 10.2 The check (CH-r2-6, -7; D4)
- `wellbeingCheck.improved`: a boolean when one condition is concerned; otherwise an object `{CONDITION: boolean}` (`CONDITION@reportEventId` when two open reports share a condition). Conditions at or after their own end must be answered; earlier ones are optional.
- Early end (D4): `improved` before the chosen end, on any day after the report day, with `eligibility.assessedAt` today (else `ASK eligibility.assessedToday`). On the report day it has no effect (`KEEP`, "from tomorrow"). The 3-day floor is gone.
- Each answer applies to its condition: improved resolves it; not improved before its end changes nothing; not improved at or after its end: NEED_REST keeps that sport waiting with `offers[NEED_REST_ROUTE]` (type INTERRUPTION_OR_RESTART; `ASK interruption|restart` when it holds every sport); any other condition → `CLINICAL_HUMAN_REQUIRED`.
- A sport returns when all its conditions are answered improved (`WELLBEING_RETURN_START`); a sport with conditions left runs on at their rungs (`WELLBEING_REDUCTION`, `decision.wellbeing.adjusted`). At a weekly review the window ends with the reviewed week and the return starts next week.
- `WELLBEING_CHECKED.check`: `improvedBy` holds only the answers that took effect; `improved` is that single answer or null; `kinds {reportEventId: WINDOW | WINDOW_END | RETURN}`.
- Return plan per sport in `decision.wellbeing.plans[SPORT]`: `{rungs | recipe (MODERATE | LONG), holds, row, days, read}`, `read` AS_CHOSEN | READ_AS_REST | WINDOW_RUNG_REPEATED | NO_WHOLE_WEEK. FASTER after REDUCE_LIGHT is R4 at once only after a whole executed and checked week inside the window; otherwise it equals BALANCED and the reason says so. Waited days count as days without training (N1).

### 10.3 A race during a reduction, return or restart (NB-2; Founder D3; SSCTR-FF-Q2)
- No race question blocks: the window-opening ASK and the "move or skip" ASK at the return start are gone; `waitsForCheck` and the `RACE_DURING_RETURN` disclosure are replaced.
- In scope (any F08 marker holding running on the race day; or a readiness restart while running is RETURN/RESTART, adaptation kind `RACE_IN_RETURN`), the race row keeps `role: RACE`, id and date, and adds `ownEvent: true` and `coachRecommendation` NO_SESSION | OPTIONAL_WALK | EASY_RUN, with the matching prescription (an easy run at the week's easy duration). The race-week touch runs easy; race day keeps no strength; no `EVENT_AMBITIOUS_FOR_CURRENT_RUNNING` item.
- The decision that puts the race in scope carries one `offers[RACE_DURING_RETURN]` (type RACE_PATHS, `blocking: false`, paths KEEP_AS_OWN_EVENT (default), MOVE via EVENT_DATE_CHANGE, REMOVE via GOAL_CHANGE). The decision after which it leaves the scope carries `disclosures[RACE_BACK_TO_EVENT_RULES]`.
- A week starting after the race takes no pre-race held start of a reduction, return or restart that began before it.

### 10.4 Warning-sign guidance (Founder D5; SSCTR-FF-Q9)
- Every `CLINICAL_HUMAN_REQUIRED` carries `guidance {level, wordingStatus: INTERIM_PENDING_G04}`: URGENT_CARE_ADVISED when an item answered yes is W2, W3, W4, W5 or X1; PROFESSIONAL_ASSESSMENT otherwise (and for persistence, recurrence, clinical reasons, eligibility flags). An unanswered item is ASK with no level. The wording is interim and marked for G04 review before real use; never "emergency" for a professional-assessment route.

### 10.5 Other runtime deltas the app consumes
- `event.id` must be a non-empty string (else `HOLD`, `errors ['event.id/kind']`).
- Unreadable F08 rows (foreign athlete, altered, malformed, orphan check) are never read as absent: `HOLD` (SB-3). `restartProgram({intake, record, referenceState, asOf?, athleteId?})` returns `HOLD` with `errors ['malformed:<Class>']` on malformed input; a restart with no stated pause asks `athlete.pause.reasonCategory`.
- `CLINICAL_HOLD` rows store no event kind.
- A new stop after training resumed post-declaration is screened on its own (its reason is asked).
- Reason screening (lexicon V1CP-A1-LEX-3): new basis `SELF_INCLUSION_UNCERTAIN` asks `interruption.reason` and `interruption.clinicalReason` together.
- The Demanding coach prescribes exactly what the Balanced coach prescribes (D6, limitation): only the P4 recommendation fields and the COACH_DEMANDING disclosure differ. It must not be presented as distinct prescriptive behaviour.

### 10.6 Design × engine deltas (for the future Figma × engine audit; no Figma opened or changed)
- The improvement question per condition (and per report when two share a condition), due ones required; the early end from the day after the report, with today's screen; the "from tomorrow" answer on the report day. Remove "early window end" from the Do-not-show list (section 9): it is now supported.
- Per-sport states: one sport waiting or reduced while the other returns; a report taking one sport; the carried conditions shown as still holding.
- The NEED_REST route offer; the days question "1 to N"; the persistence routes with their guidance level.
- The race as the athlete's own event with the coach's recommendation for that day, the three paths offered once, and the "back to the event rules" note. Never "cleared" or "safe to race".
- The two guidance levels and their interim copy; the Demanding coach as advice only.

## 11. V1CP Fix-Forward closure: what an integrator must know (2026-11-09; runtime `0950b0a`, CLOSED_NOT_READY)

Appended at the closure; sections 1–10 are kept as history. The judges' records prevail: `audits/v1cp-fix-forward-2026-11-09/reviews/{ssctr,quality,security}/*_RECHECK_CYCLE.json` and `audits/v1cp-fix-forward-2026-11-09/pcg/PCG_V1CPFF_CFOBS1.json`. **INTEGRATION_READY = NO.** Nothing here authorizes real collection.

### 11.1 Deltas of the fix cycle (`0950b0a`) that the app consumes
- `wellbeingCheck.improved`: a key that is not an open condition is reported once as `wellbeingCheck.improved.unrecognized` in `missingInputs`. It is never echoed.
- While a clinical dependency stands, a sign answered yes sets `guidance` (level and wording) and `warningSigns` exactly as it does outside a hold. The status, the hold and the empty plan are unchanged. The sign itself is not recorded (Security C8).
- Every `CLINICAL_HUMAN_REQUIRED` carries `guidance`, including the sticky one. The default is PROFESSIONAL_ASSESSMENT.
- A ladder week counts as done for a sport only when its prescribed sessions were executed with no adverse or conflicting response. A check alone never makes it done. The reason now says "was not done as planned or had no review with your check".

### 11.2 Runtime paths that are not validated (named blockers)
The app must not present these paths as validated:
- **SSCTR-FFC-01:** a Situation 1 chain that starts with an unexecuted REDUCE window and continues with a REST report.
- **SSCTR-FFC-02:** a declared break after an answered check and an unexecuted return week.
- **QRE-FFC-01:** the D49 strength cap across a per-sport chain.

All three are in F08 Situation 1 chains and returns. Generation, the weekly review, session reports, coaching choices and the default path are unaffected: the FREEZE-6 differential and the journeys are unchanged.

### 11.3 Integration blockers (all must close before INTEGRATION_READY)
- **CF-OBS-1, clinical holds.** Decided by PCG-V1CPFF-CFOBS1-r1, Security C2 and QRE; SSCTR C-3 concurs.
  - **Source of truth.** The record's `CLINICAL_HOLD` row is the source of truth. `referenceState` is a cache: it may add protection, never remove it.
  - **Release.** A hold stands until a later valid `READINESS_DECLARED` releases it, sport by sport. Nothing else releases it: not time, sessions, a break, a report, a check, RECOVERED, an eligibility re-answer or a relayed clearance.
  - **Absent, stale or altered reference state.** Such a state must never release a hold. Today it does: one omission launders the hold for every later review, even when the reference is sent exactly as received afterwards (QRE).
  - **Until fixed.** No real path may run until both hold: the core enforces the rule on every review kind, and RECORD-CUSTODY keeps the record whole.
  - **Section 1's caveat.** The sentence "a review that omits them loses facts" does not apply to clinical holds.
  - **R7 convention.** The R7 practice of modelling a qualified clearance by dropping the reference state is an evaluation convention (PCG-F08-C07), never a product path.
- **QRE-FF-06.** `canonical()` hashes keys whose value is undefined, so some programs fail `validProgram` after a JSON round trip; the result fails closed with HOLD. Programs and decisions must round-trip through storage unchanged before integration.
- **Stale projections.** After an ASK or a `CLINICAL_HUMAN_REQUIRED`, the later weeks of the program are a projection. Never present or execute them as current (QRE `d49Executed` class; PCG-F08-C06).
- **Custody and data.** RECORD-CUSTODY and the server schema (Security C7):
  - event ids are opaque, server-assigned and bounded;
  - a record is accepted only if it extends the stored prefix;
  - a missing, stale or altered state is refused;
  - athlete and clock are bound by the server;
  - a guard decision that returns no `actualLedger` means "record unchanged" (OBS-FFC-01).

  Also: the erasure tombstone (SEC-V1CPI-06) and Security C4–C8.
