# Athlete learning model R5

Scope: offline synthetic Node24 reference. This document describes `src/r5-learning.mjs` (`R5-LEARNING-1`); it is an implementation contract, not scientific approval or a readiness verdict. Its machine-readable companion is `ATHLETE_LEARNING_MODEL_R5.json`.

The implemented loop is supplied planned-prescription hash → actual completed stimulus → reported performance/recovery/effort → comparable session evidence → contextual arrangement ranking. It does not predict physiological outcomes. The source hash establishes local payload integrity; this module cannot authenticate an external execution source or prove that a supplied hash matches an official prescription.

## API

| Function | Contract |
| --- | --- |
| `createLearningModel({athleteId,purposeAllowed=false,asOf})` | Creates an immutable revision-zero model. Athlete ID must be nonempty; permission must be boolean; `asOf` must be an explicit ISO timestamp with timezone. |
| `updateLearningModel(model,observations,{asOf,purposeAllowed=model.purposeAllowed})` | Validates the prior model and rejects backwards clocks. Returns a new immutable revision with accepted `observations`, `excluded` records and an integrity hash. An identical replay at the same clock and permission returns the existing model. |
| `validateLearningModel(model)` | Returns a boolean for payload integrity, version, ownership, immutable authority flags, accepted-observation validity and unique accepted IDs/source hashes. This is not source authentication. |
| `evidenceFor(model,context,{asOf})` | Returns direction, confidence, distinct-session count, source IDs, response counts, span, uncertainty reason and ranking influence. Invalid, unconsented, future-model or incomparable requests preserve `UNKNOWN` / `PRIOR`. |
| `preferredArrangement(model,options,context,{asOf})` | Returns a preference, evidence and reason among caller-supplied options with `admissible:true`. It never determines scientific admissibility. |

Models and outputs are deeply frozen. Updates clone caller-owned inputs. `revision` advances when stored state, permission or the model clock changes. Hashing covers the complete model body except its own `hash` field. Model integrity and stored observation validity remain checkable after observations have aged out of ranking eligibility.

## Observation contract

Each observation supplies `eventId`, `athleteId`, `sessionId`, `observedAt`, `origin:'ACTUAL_EXECUTION'`, 64-character lowercase hexadecimal `sourceHash` and `plannedPrescriptionHash`, `actual`, `response`, `context`, `comparable:true` and `confounded:false`.

`actual.completed` must be the boolean `true`; at least one actual work quantity (`minutes`, `sets` or `reps`) must be positive. Supplied `minutes`, `sets`, `reps` and `loadKg` must be finite and nonnegative; sets/reps must be integers. A load by itself is not evidence of executed work. The module does not derive an actual stimulus from planned work or from a prediction.

Response fields retain separate dimensions:

- `performance`: `COMPATIBLE`, `UNDER`, `OVER` or `UNKNOWN`.
- `recovery`: `COMPATIBLE`, `ADVERSE` or `UNKNOWN`.
- `effort`: `ON_TARGET`, `EASIER`, `HARDER` or `UNKNOWN`.

Wrong ownership, missing provenance, invalid times, future observations, stale input, confounding, unestablished comparability, incomplete actuals and invalid response values are excluded with explicit reasons. Exclusions retain the event ID, reason and input hash, not an invented replacement response. Exact accepted duplicates do not add observations; a changed payload for an accepted ID is `EVENT_ID_CONFLICT`; an accepted source hash under another ID is `SOURCE_REUSED`. Repeated identical exclusion records do not accumulate.

## Comparability and recency

Context requires nonempty `family`, `modality`, `phase` and `doseKey`. Evidence matches all four exactly. `equipment` and `priority` must also match exactly, including present versus absent values. Equipment arrays are order-sensitive. There is no inferred transfer across phases, doses, equipment or modalities.

When a query includes `arrangement`, it must match exactly. When omitted, the query pools otherwise matching arrangements; callers assessing arrangement-specific effects must request the arrangement or use `preferredArrangement`, which does so for each option. Arrangement selection accepts `{id,arrangement?,admissible:true}`; omitted `arrangement` uses the option ID.

Evidence uses only observations no older than 56 elapsed days at the explicit query clock. New stale observations are excluded on ingestion; previously accepted observations remain in the immutable history but stop contributing after expiration. Recency is a bounded eligibility window, not a physiological decay model or a continuous recency weight. Multiple reports of one session contribute at most one row: the latest matching report is used.

## Confidence, uncertainty and hysteresis

These conservative thresholds govern evidence bookkeeping. They are not validated physiological laws, universal progression criteria, recovery durations or scientific dose authority.

| Confidence | Evidence requirement | Ranking consequence |
| --- | --- | --- |
| `PRIOR` | Fewer than three informative distinct sessions, or informative history spans less than seven days. | Population prior remains decisive. One event never creates a learned preference. |
| `EMERGING` | At least three informative distinct sessions spanning at least seven days, without satisfying `STRONG`. | Association is visible; no learned arrangement preference is emitted. |
| `STRONG` | At least four informative distinct sessions spanning at least fourteen days; all matching selected rows are informative, all response dimensions are known, and no compatible/adverse contradiction exists. | Association may break a tie among already admissible arrangements. |

An observation is adverse if performance is `UNDER`, recovery is `ADVERSE` or effort is `HARDER`. It is compatible when performance is known, recovery is `COMPATIBLE` and effort is known, provided no adverse signal exists. Otherwise it remains unknown. Adverse signals can therefore remain visible despite unknown accompanying dimensions, but unknown dimensions prevent `STRONG` confidence.

Compatible and adverse rows together produce `MIXED`, the reason `INCONSISTENT_COMPARABLE_RESPONSE`, and never `STRONG` confidence. A mixed history can retain that direction while confidence remains `PRIOR` if recurrence/span are insufficient. Unknown rows are counted separately and prevent strong evidence. Recurrence/span requirements form the implemented hysteresis: single or tightly clustered reports do not change ranking. There is no persistent causal rule or independent stateful confidence latch.

`evidenceFor` exposes `count`, `informativeCount`, `compatibleCount`, `adverseCount`, `unknownCount`, `spanDays` and `sourceEventIds`. `responseSummary` separately counts underperformance, overperformance, easier/harder effort and adverse recovery. These are descriptive counts, not a universal utility score.

## How individual evidence affects a future decision

`preferredArrangement` selects a unique strongly compatible option when one exists. If none exists and strong adverse evidence rules against one or more options, it can prefer the sole remaining admissible alternative. Multiple strongly compatible options or multiple unresolved alternatives produce no preference. Absence of adverse history is not represented as proven compatibility; the returned evidence makes that uncertainty visible.

Every model preserves `populationPriorRetained:true`, `causalityEstablished:false` and `automaticDoseAuthority:false`; evidence and preferences preserve `causal:false`. Individual evidence can influence future ranking inside existing scientific boundaries. It cannot create an envelope, declare a dose safe, infer causality, alter completed execution or mutate an official plan.

## Performance, recovery, adherence and retained limits

Performance, recovery and subjective effort have explicit longitudinal fields. Their repeated co-occurrence is an association, with supplied comparability and confounder declarations required. The module does not verify those declarations against external records or adjust for unmeasured confounders.

Adherence coverage is narrower: `completed:true` gates eligible executed work. Noncompletion is excluded as `NOT_COMPLETED`; partial work, missed sessions and travel-related nonadherence do not become tolerance evidence. The module does not estimate an adherence rate or learn schedule preferences from omissions. It also lacks a continuous recovery trajectory, performance-drift estimator, exercise-specific causal response, outcome prediction, and physiological adaptation model. Exercise response can only be separated when the caller encodes a distinct comparable family/dose context.

Revoking purpose permission prevents ingestion and suppresses all individual evidence/preference. Previously accepted observations remain stored in the returned snapshot; this API is not deletion, retention-policy enforcement or a production consent ledger. A no-consent model remains valid and can coexist with a population-prior program.

## Current executable evidence

The author-run module checks passed 16/16 on Node v24.19.0 in `../../audits/domain-coaching-r5-2026-10-25/learning-final.tap`; `node --check src/r5-learning.mjs` passed. RED and intermediate failed results are preserved in the same audit directory. Tests cover immutable cold start, recurrent response, one-event/time-span limits, consent, provenance, malformed actuals/responses, duplicates, integrity tampering, context boundaries, mixed/unknown outcomes, admissible ranking, expiration and repeated session reports. These are deterministic author checks, not independent coaching-quality or scientific approval.
