# V1 Run Calibration Extension: data contract (V1X-RUN-CALIBRATION-1)

Entry point: `CoachingCore/src/v1-run-index.mjs`. It wraps the frozen V1 entry point (`v1-index.mjs`) and returns every key of its results unchanged, plus the keys below. Sporting values: `CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json`, from SSCTR-V1RC-DECISION-r1 as amended by the independent review SSCTR-V1RC-REVIEW-r1. Synthetic data only.

## Calls

| Call | Adds to the engine's result |
|---|---|
| `generateProgram(intake, options)` | `runCalibration`, `runEvidenceRecord` (empty) |
| `evaluateProgram(program, review, options)` | `runCalibration`, `runEvidenceRecord`, `runEvidence: {added, refused}` |
| `restartProgram({intake, record, runEvidenceRecord, ...}, options)` | `runCalibration`, `runEvidenceRecord` (carried) |

The caller keeps `runEvidenceRecord` beside the engine's record and sends it back with each review. The engine never sees the extension's keys.

**When a declaration is refused** (`runEvidence.refused`, each with the reason): `evidence.extensionNotEnabled` (nothing is recorded while the extension is off), `evidence.reviewNotAccepted` (the engine refused the review), `evidence.reviewBeforeTheRecord` (a review earlier than the record), `evidence.idAlreadyOnRecord`, `evidence.idReserved` (an id an intake anchor or a plan race uses), `evidence.dateAfterThisReview`, and the shape errors (`evidence.kind`, `evidence.date`, `evidence.distanceAndTime`, `evidence.object`, `evidence.rpe`, `evidence.lab`). An intake anchor dated after the intake is refused with `evidence.dateAfterTheIntake`. Carried rows are always returned as received.

**The one engine option the entry point sets:** when a review reports as not done the harder session that an accepted field test of this athlete replaced, the entry point adds the engine's own `withhold: ['MOVE']`, so that session is not moved to a later day. In every other case the engine receives the caller's options unchanged.

## Inputs

**At onboarding:** `athlete.performanceAnchors[]` (the existing intake field).

**After onboarding:** `review.runEvidence[]` (new declarations) and `review.runEvidenceRecord` (the carried record).

One evidence entry:

| Field | Meaning |
|---|---|
| `id` | Required for a declaration; one row per id, the first recorded stands. `supersedes` names a row this one corrects |
| `kind` | `RACE_RESULT`, `FIELD_TEST`, `TIME_TRIAL`, `PERSONAL_BEST`, `LAB_TEST` |
| `date` | ISO day. Optional only for `PERSONAL_BEST` |
| `distanceKm` or `distance` | Kilometres, or `3K`, `5K`, `10K`, `HALF_MARATHON`, `MARATHON` |
| `seconds`, `minutes` or `time` | The result's time |
| `measurement` | `OFFICIAL`, `TRACK`, `GPS`, `MANUAL`, `TREADMILL`. Missing: the result does not qualify |
| `rpe` | Effort 0 to 10. Missing: one confidence tier lower |
| `completed`, `tolerated`, `walkBreaks` | `tolerated: true` must be stated for the result to qualify |
| `stoppedFor` | For an effort not completed: `SYMPTOM`, `PACING`, `CONDITIONS`, `TIME`, `OTHER`. Missing is read as `SYMPTOM` |
| `conditions` | Flags such as `HEAT`, `HILLY`, `TRAIL` |
| `protocol`, `replacedSessionId` | For a `FIELD_TEST`: `TIME_TRIAL_3K` or `TIME_TRIAL_5K`, and the session it replaced. **Declare the test in the same review that reports the replaced session as not done**, so the engine does not move that session to a later day |
| `heartRate` | `{maxBpm, sensor}`; only `CHEST_STRAP` is read |
| `lab` | For `LAB_TEST`: `{protocol, source, values: [{name, value, unit}]}` |

**In a session report** (`observation.actual`, optional fields the engine already carries): `distanceKm`, `measurement`, `gpsQuality`, `conditions`, `walkBreaks`, `rpe`, `work: {paceSecondsPerKm}` or `work: {distanceKm, seconds}` for the hard part, `heartRate`. A race of the plan reported with distance, time, measurement and effort becomes a race result of the record.

## `runCalibration`

| Key | Content |
|---|---|
| `version`, `asOf`, `week`, `hash` | The state version, the review's instant, the plan week it is for, and the hash of the whole output |
| `status` | `DISABLED`, `NOT_APPLICABLE` (with `reason`: `NO_PLAN`, `NO_DECISION`, `RUNNING_NOT_PROGRAMMED`, `REVIEW_TIME_REQUIRED`), `UNAVAILABLE` (`reason: CALIBRATION_ERROR`: an internal fault; the engine's answer is whole and nothing is shown), `WITHHELD_HOLD`, `EFFORT_ONLY`, `PARTIAL`, `PROVISIONAL`, `CALIBRATED` |
| `extension` | Id, values hash, authority source, which boundaries are on |
| `capacity` | `status` (`CALIBRATED`, `PRESUMED`, `NONE`, `OUTSIDE_MODEL_POPULATION`, `EFFORT_ONLY`, `WITHHELD`), reference result, recency, 10 km equivalent (only with the estimate boundary on), confidence and its causes, margin, valid-until date, training factors per domain, `longerEvidence` for a result beyond the half marathon |
| `evidence` | Every entry with its use (`CAPACITY`, `HISTORICAL_BEST`, `REJECTED`, `NOT_YET_IN_FORCE`, `SUPERSEDED`, `HEART_RATE_ONLY`) and reasons |
| `refusedEvidence` | Malformed entries, named |
| `historicalBest`, `actualResults` | Kept apart from estimates; never capacity by themselves |
| `effortDomains` | Cue id, RPE range, talk test; always available, no device needed |
| `paceBands` | One per domain: `FIVE_K_EFFORT`, `TEN_K_EFFORT`, `THRESHOLD_CONTROLLED`, `HALF_MARATHON_EFFORT`, `MARATHON_EFFORT`, `EASY`, `LONG`, `RECOVERY` |
| `heartRateZones` | From an observed chest-strap maximum (estimated) or supplied measured values (as supplied); otherwise unavailable with `NO_MEASURED_HEART_RATE` or `HEART_RATE_DATA_NOT_QUALIFYING`, and always `ageFormula: AGE_FORMULA_NOT_INDIVIDUAL` |
| `estimates` | `5K`, `10K`, `HALF_MARATHON`, `MARATHON` |
| `goal` | The athlete's goal and its relation to the current range; `isPrediction: false`, `usedForPace: false` |
| `projection` | Always `UNAVAILABLE: NO_VALIDATED_PROJECTION_MODEL`, with the observed changes of the reference |
| `assessment` | `IN_USE` (light start), `OFFERED` (3 km or 5 km test, with protocol), `NOT_OFFERED` (reasons), `NOT_NEEDED`, `WITHHELD` |
| `warningSignScreen` | `REQUIRED` with the evidence ids when a result of the plan's time was reported as not tolerated or an effort was stopped for a symptom. The client takes the athlete to the existing warning-sign screen; the extension decides no clearance |
| `nextWeek` | What the next week will be, provisional until its first day |
| `sessions` | Per planned run session: effort cue, RPE range, `pace`, `week`, `provisional` |
| `representations` | States that effort domains, pace bands and heart-rate zones are separate and not interchangeable |

**A pace band** (`status: AVAILABLE`): `fastSecondsPerKm`, `slowSecondsPerKm`, `unit`, `effortCue`, `rpe`, `label` (`ESTIMATED`, `ESTIMATED_TRAINING_ADJUSTED` or `OBSERVED_AT_EFFORT`), `basis`, `method`, `reference` (evidence id), `referenceDate`, `recency`, `confidence`, `confidenceCauses`, `margin`, `validUntil`, `trainingFactor`, `ceilingOnly`, `effortGoverns: true`, `notes`. An observed band carries `sessions` (ids and dates), `windowDays`, `validUntil` and `uncertaintyCauses` instead of a confidence. The marathon band carries `cautions` and `assumes`. Otherwise `status: UNAVAILABLE` with a `reason`.

**An estimate** (`status: AVAILABLE`): `lowSeconds`, `centralSeconds`, `highSeconds`, `kind: CURRENT_ESTIMATE`, `basis`, `model`, `reference`, `referenceDate`, `recency`, `confidence`, `margin`, `validUntil`, `estimated: true`, `promise: false`, `statement`, `display: RANGE_FIRST_CENTRAL_NEVER_ALONE`. The marathon estimate also carries `cautions` and `assumes` (ids and texts).

**A session's `pace`:** the band of its domain; `REFERENCE_ONLY` on a race day that is not a completion; `UNAVAILABLE` with a reason otherwise.

**Unavailable reasons:** `EXTENSION_NOT_ENABLED`, `HOLD_NO_PRESCRIPTION`, `MODE_WALK_JOG_RESTART_RETURN`, `NO_QUALIFYING_EVIDENCE`, `OUTSIDE_MODEL_POPULATION`, `DISTANCE_RATIO_EXCEEDED`, `ENDURANCE_NOT_DEMONSTRATED`, `MARATHON_NEEDS_HALF_OR_LONGER_RESULT`, `MARATHON_EVIDENCE_NOT_CONVERTED_DOWNWARD`, `NOT_ELIGIBLE_FOR_MARATHON_BLOCK`, `COMPLETION_RACE_DAY`, `BAND_WITHDRAWN_AFTER_TRAINING_MISMATCH`, `NO_BAND_FOR_SESSION_TYPE`, `TEST_ALREADY_DONE_THIS_WEEK`.

**Reasons a test is not offered:** `SYMPTOM_OR_NOT_TOLERATED_REPORTED`, `ELIGIBILITY_NOT_CURRENT`, and the eligibility reasons (`NO_HARDER_SESSION_EXECUTED_YET`, `TEST_WITHIN_42_DAYS`, `REPEAT_ALREADY_USED`, and others named in the output).

## Rules a consumer can rely on

- The effort cue is the prescription. A band is guidance; when they disagree the athlete slows.
- A week's calibration reads only what was on the record before the week started. It does not move inside the week.
- A hold, a declared break of 14 days or more, or a walk/jog, restart or return week removes every band, estimate and zone.
- Nothing is derived from a goal time, and nothing harder from easy running.
- A test is offered only when the engine's answer to the review prescribes and the review's eligibility is nonclinical with every warning-sign item answered no.
- A race-pace band needs both the pace and the estimate boundary.
- With no enabling record bound to the values file, `status` is `DISABLED`, nothing is recorded, no engine option is set, and the output is the frozen V1 behaviour.
- An integration passes no options: `options.runCalibration` and `options.runCalibrationRecords` are for development and tests, as `options.eventExtension` is.

## Not covered here

The custody and API reference boundary (`src/boundary`) does not use this entry point. Storing the evidence record, deleting it on request and handling heart-rate and lab values belong to integration, with a Security review.
