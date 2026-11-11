# V1 Run Calibration Extension: data contract (V1X-RUN-CALIBRATION-1)

Entry point: `CoachingCore/src/v1-run-index.mjs`. It wraps the frozen V1 entry point (`v1-index.mjs`) and returns every key of its results unchanged, plus the keys below. Sporting values: `CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json`, from SSCTR-V1RC-DECISION-r1. Synthetic data only.

## Calls

| Call | Adds to the engine's result |
|---|---|
| `generateProgram(intake, options)` | `runCalibration`, `runEvidenceRecord` (empty) |
| `evaluateProgram(program, review, options)` | `runCalibration`, `runEvidenceRecord`, `runEvidence: {added, refused}` |
| `restartProgram({intake, record, runEvidenceRecord, ...}, options)` | `runCalibration`, `runEvidenceRecord` (carried) |

The caller keeps `runEvidenceRecord` beside the engine's record and sends it back with each review. The engine never sees the extension's keys.

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
| `conditions` | Flags such as `HEAT`, `HILLY`, `TRAIL` |
| `protocol`, `replacedSessionId` | For a `FIELD_TEST`: `TIME_TRIAL_3K` or `TIME_TRIAL_5K`, and the session it replaced |
| `heartRate` | `{maxBpm, sensor}`; only `CHEST_STRAP` is read |
| `lab` | For `LAB_TEST`: `{protocol, source, values: [{name, value, unit}]}` |

**In a session report** (`observation.actual`, optional fields the engine already carries): `distanceKm`, `measurement`, `gpsQuality`, `conditions`, `walkBreaks`, `rpe`, `work: {paceSecondsPerKm}` or `work: {distanceKm, seconds}` for the hard part, `heartRate`. A race of the plan reported with distance, time, measurement and effort becomes a race result of the record.

## `runCalibration`

| Key | Content |
|---|---|
| `status` | `DISABLED`, `NOT_APPLICABLE`, `WITHHELD_HOLD`, `EFFORT_ONLY`, `PARTIAL`, `PROVISIONAL`, `CALIBRATED` |
| `extension` | Id, values hash, authority source, which boundaries are on |
| `capacity` | Status, reference result, recency, 10 km equivalent, confidence and its causes, margin, valid-until date, training factors per domain |
| `evidence` | Every entry with its use (`CAPACITY`, `HISTORICAL_BEST`, `REJECTED`, `NOT_YET_IN_FORCE`, `HEART_RATE_ONLY`) and reasons |
| `refusedEvidence` | Malformed entries, named |
| `historicalBest`, `actualResults` | Kept apart from estimates; never capacity by themselves |
| `effortDomains` | Cue id, RPE range, talk test; always available, no device needed |
| `paceBands` | One per domain: `FIVE_K_EFFORT`, `TEN_K_EFFORT`, `THRESHOLD_CONTROLLED`, `HALF_MARATHON_EFFORT`, `MARATHON_EFFORT`, `EASY`, `LONG`, `RECOVERY` |
| `heartRateZones` | From an observed chest-strap maximum (estimated) or supplied measured values (as supplied); otherwise unavailable |
| `estimates` | `5K`, `10K`, `HALF_MARATHON`, `MARATHON` |
| `goal` | The athlete's goal and its relation to the current range; `isPrediction: false`, `usedForPace: false` |
| `projection` | Always `UNAVAILABLE: NO_VALIDATED_PROJECTION_MODEL`, with the observed changes of the reference |
| `assessment` | `IN_USE` (light start), `OFFERED` (3 km or 5 km test, with protocol), `NOT_OFFERED` (reasons), `NOT_NEEDED`, `WITHHELD` |
| `nextWeek` | What the next week will be, provisional until its first day |
| `sessions` | Per planned run session: effort cue, RPE range and `pace` |

**A pace band** (`status: AVAILABLE`): `fastSecondsPerKm`, `slowSecondsPerKm`, `unit`, `effortCue`, `rpe`, `label` (`ESTIMATED` or `OBSERVED_AT_EFFORT`), `basis`, `method`, `reference` (evidence id), `referenceDate`, `recency`, `confidence`, `confidenceCauses`, `margin`, `validUntil`, `trainingFactor`, `ceilingOnly`, `effortGoverns: true`. Otherwise `status: UNAVAILABLE` with a `reason`.

**An estimate** (`status: AVAILABLE`): `lowSeconds`, `centralSeconds`, `highSeconds`, `kind: CURRENT_ESTIMATE`, `basis`, `model`, `reference`, `referenceDate`, `recency`, `confidence`, `margin`, `validUntil`, `estimated: true`, `promise: false`, `statement`, `display: RANGE_FIRST_CENTRAL_NEVER_ALONE`.

**A session's `pace`:** the band of its domain; `REFERENCE_ONLY` on a race day that is not a completion; `UNAVAILABLE` with a reason otherwise.

**Unavailable reasons:** `EXTENSION_NOT_ENABLED`, `HOLD_NO_PRESCRIPTION`, `MODE_WALK_JOG_RESTART_RETURN`, `NO_QUALIFYING_EVIDENCE`, `OUTSIDE_MODEL_POPULATION`, `DISTANCE_RATIO_EXCEEDED`, `ENDURANCE_NOT_DEMONSTRATED`, `MARATHON_NEEDS_HALF_OR_LONGER_RESULT`, `MARATHON_EVIDENCE_NOT_CONVERTED_DOWNWARD`, `NOT_ELIGIBLE_FOR_MARATHON_BLOCK`, `COMPLETION_RACE_DAY`, `BAND_WITHDRAWN_AFTER_TRAINING_MISMATCH`, `NO_BAND_FOR_SESSION_TYPE`.

## Rules a consumer can rely on

- The effort cue is the prescription. A band is guidance; when they disagree the athlete slows.
- A week's calibration reads only what was on the record before the week started. It does not move inside the week.
- A hold, a declared break of 14 days or more, or a walk/jog, restart or return week removes every band, estimate and zone.
- Nothing is derived from a goal time, and nothing harder from easy running.
- With no enabling record bound to the values file, `status` is `DISABLED` and the output is the frozen V1 behaviour.

## Not covered here

The custody and API reference boundary (`src/boundary`) does not use this entry point. Storing the evidence record, deleting it on request and handling heart-rate and lab values belong to integration, with a Security review.
