# V1HR5 — Science and calibration decision (phase 3)

This is the reading view of **SSCTR-HR5-DECISION-r1**, the sporting authority for every number below: [`ssctr/SSCTR_HR5_DECISION.json`](ssctr/SSCTR_HR5_DECISION.json) and [`.md`](ssctr/SSCTR_HR5_DECISION.md).

- Decision instance: the project's Sports Science & Concurrent Training Reviewer (SSCTR-1.0.0), answering the [request](ssctr/SSCTR_HR5_DECISION_REQUEST.md).
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. It is a software reviewer's internal sporting judgement, not human or clinical validation.
- It builds on SSCTR-V1RC-DECISION-r1 Q6 and Q9, which stay binding.

## 1. Method (HR5-1, HR5-4)

**Five fixed fractions of one reference maximum heart rate, nested in the three approved domains.**

| Zone | From (≥) | To (<) | Per mille | Domain (approved, unchanged) | 186 bpm | 190 bpm |
|---|---|---|---|---|---|---|
| Z1 | open | 0.72 | — / 720 | LOW | < 134 | < 137 |
| Z2 | 0.72 | 0.80 | 720 / 800 | LOW | 134–148 | 137–151 |
| Z3 | 0.80 | 0.87 | 800 / 870 | MODERATE | 149–161 | 152–164 |
| Z4 | 0.87 | 0.92 | 870 / 920 | HIGH | 162–170 | 165–174 |
| Z5 | 0.92 | open | 920 / — | HIGH | ≥ 171 | ≥ 175 |

- **Basis (verified by the decision, full text where stated).**
  - The scale is a five-zone %HRmax scale of the Norwegian type. Its five-to-three aggregation (I1+I2, I3, I4+I5) is confirmed by Tønnessen et al. 2014 (PLoS One, full text), Seiler-Viken et al. 2025 (Sci Rep, full text) and Seiler & Tønnessen 2009 (full text).
  - The request's own cited percentages were **wrong**: Tønnessen 2014 Table 2 gives 54–73 / 74–83 / 84–88 / 89–93 / > 94 %, and the Olympiatoppen scale v2 (2024) gives about 55–72 / 72–82 / 82–87 / 87–92 / 92–100. The decision took nothing from the request on trust.
- **Why these cuts.** 0.80 and 0.87 are the already-approved domain boundaries (SSCTR-V1RC Q6). Keeping them means no domain boundary moves and no artificial domain appears. 0.72 and 0.92 split LOW and HIGH. They are approved with conditions as display conventions: **no V1 rule may use the Z1/Z2 or Z4/Z5 split** (`withinDomainSplitsHaveSportingRole: false`). The zones may not be called "Olympiatoppen zones", because the app's Z2/Z3 cut is 0.80, not about 0.82.
- **Rejected alternatives:**
  - a generic 50/60/70/80/90 % scale: it does not nest, and its Z3 would sit inside LOW;
  - heart-rate reserve: no resting heart-rate input;
  - threshold-anchored zones: lab thresholds are free-form, and the engine names no threshold.
- **Arithmetic.**
  - Each edge is `floor((bpm × perMille + 500) / 1000)`, integer half-up.
  - For every maximum from 140 to 220 bpm it equals the three-zone `Math.round(bpm × fraction)`, so the shared edges are the same bpm. This is tested over the whole range and in JavaScriptCore.
  - Intervals are `[from, to)`: a reading on an edge belongs to the higher zone.
  - Z1 is open below and Z5 open above, because an observed maximum may be below the true one.
  - The edges are strictly increasing and contiguous, or there are no zones.
  - The pure function also refuses any reference outside 140–220 or not a whole bpm (FND-HR5-02).

## 2. Reference hierarchy (HR5-2)

1. **LAB_MEASURED_MAXIMUM.** A `LAB_TEST` under the existing lab rules (≤ 182 days, no declared break of 14 days or more since, not before a hold or return: SSCTR-V1RC-R-09). It must state `heartRate.maxBpm` in 140–220 and **all** of the following:
   - a declared **running** test: a cycling maximum runs about 5 % lower (Millet 2009);
   - a **chest strap or ECG** sensor;
   - a reported **RPE ≥ 8**;
   - not stopped and not reported not tolerated.

   The decision delegated the field for the running declaration to Data/Engineering, without changing frozen bytes or shared contracts. Engineering chose **`lab.modality`** (`RUN`, `TREADMILL_RUN` or `FIELD_RUN`) inside the existing free-form `lab` object, which `readEvidence` already carries whole. A qualifying lab test without that declaration has its own reason, `LAB_MODALITY_NOT_RUNNING_OR_UNKNOWN`. The supplied lab values are never mapped to zones.
2. **OBSERVED_MAXIMUM.** Exactly SSCTR-V1RC Q6(b), unchanged: chest strap, a race, time trial or field test of 10 min or more at RPE ≥ 8, 140–220 bpm, the highest qualifying value within 365 days, never from before a break, hold or return.
3. Otherwise there are **no five zones**, with a typed reason.

**Never used:**

- a declared maximum without provenance (the Figma's "máxima informada");
- an age formula (`AGE_FORMULA_NOT_INDIVIDUAL`);
- heart-rate reserve;
- a session's average heart rate;
- an optical sensor.

## 3. Conflict (HR5-3)

**Lower-wins was refused.** An accurate chest-strap reading cannot exceed the true maximum.

| Case | Outcome |
|---|---|
| Observed maximum more than **5 bpm above** the lab maximum | `UNAVAILABLE / REFERENCE_CONFLICT`, no zones and no cue. Both maxima, dates and evidence ids and the difference are shown. Re-read every week. |
| Observed within 5 bpm above the lab maximum | The lab maximum is used. |
| Lab maximum above the observed one | Expected, not a conflict: the lab maximum is used. |

The 5 bpm band is a decided tolerance above chest-strap measurement error (Gillinov 2017, Gilgen-Ammann 2019), not a measured reliability of maximum heart rate. It changes no session either way.

## 4. Confidence and provenance (HR5-5)

- `referenceConfidence` is **LOW** for both references. The app cannot check a lab test's protocol, modality or whether it was maximal.
- `zoneModelConfidence` is always **LOW**: fixed fractions of a maximum misplace individuals relative to their thresholds (Mann 2013, Iannetta 2020, Meixner 2025).
- Every output is `estimated: true` and names its reference: kind, bpm, evidence id and kind, date, age in days, sensor; for a lab test, also protocol, source, modality and `checkedByTheApp: false`.
- The notes are `NOT_THRESHOLDS` and `FIXED_FRACTIONS_OF_A_MAXIMUM`, plus `OBSERVED_MAXIMUM_MAY_BE_BELOW_TRUE_MAXIMUM` or `NOT_CHECKED_BY_THE_APP`.
- Disclosure codes: `ZONES`, the reference kind, `NEWER_RUNNER` (experience NONE or NOVICE), `REFERENCE_CONFLICT`, `CUE`. Their meanings are in the values file; the wording is Product's.

## 5. Role in prescription (HR5-6)

**Effort is the prescription in every session. Heart rate is never primary in V1 and may only suggest slowing.** It is never a target, gate, dose, progression input or pace and effort conversion. It is also never a "usual zone" shown for a session family, which Q6.separation refuses.

| Family / state | Role | Reason |
|---|---|---|
| EASY, LONG, RECOVERY_EASY, SHAKEOUT, EASY_REESTABLISHMENT (in EASY mode) | `COMPLEMENTARY_CEILING_CUE` | A **sustained** reading in **Z4 or higher** (the approved HIGH domain) may suggest slowing. Never a cue to speed up, no health meaning. |
| THRESHOLD, HALF_MARATHON_SPECIFIC, MARATHON_SPECIFIC | `NO_HEART_RATE_GUIDANCE` | `ZONES_ARE_NOT_INDIVIDUAL_THRESHOLDS` |
| FIVE_K_SPECIFIC, TEN_K_SPECIFIC, STRIDES | `NO_HEART_RATE_GUIDANCE` | `HEART_RATE_LAGS_SHORT_HARD_BOUTS` |
| RACE, RACE_TOUCH | `NO_HEART_RATE_GUIDANCE` | `RACE_DAY_GUIDANCE_AS_APPROVED` (race-day heart rate runs high: Lambert 1998) |
| WALK, WALK_JOG, FAMILIAR_REPEATED_BOUTS | `NONE` | `EFFORT_ONLY_FAMILY` |
| WALK_JOG, RESTART or RETURN mode; a hold; no zones | `NONE` | the typed reason |
| An unknown family | `NO_HEART_RATE_GUIDANCE` | `UNKNOWN_FAMILY_FAIL_CLOSED` |

The categories the Founder request asked to distinguish:

- **Pace as the main guidance:** unchanged. The approved pace band when the capacity is calibrated, bound to the effort cue.
- **RPE as the main guidance:** every session (`effortGoverns: true`).
- **Heart rate as the main guidance:** **none in V1**. It needs individually measured thresholds mapped by a reviewed rule, which is future work.
- **Heart rate as complementary:** the slow-down cue in easy running.
- **No heart-rate target:** every other family and state.

Further rules:

- Conflict between RPE and heart rate: effort governs. A low heart rate never suggests speeding up, and a high one may only suggest slowing.
- Newer runners: the same rules plus the `NEWER_RUNNER` disclosure. Walk/jog is already effort only.
- Return after a pause: withdrawn (Q9).
- The decision abstained on a Z3 cue for recovery runs (Z4 kept) and on a lower ceiling for novices.

## 6. Time in zone (HR5-7)

`sessionDistribution: UNAVAILABLE / NO_HEART_RATE_SERIES_IN_CONTRACT`. V1 carries no series, and time per zone is **never** derived from an average.

The classifier `classifySamples` exists for a future reviewed channel and is not wired to any input. Under the decision's conditions:

- only a CHEST_STRAP or ECG series is classified;
- gaps, artifacts and readings above 220 bpm are unknown time, never interpolated;
- covered and unknown time are always reported;
- the session is classified with its own week's reference;
- the result is never used for adherence, quality-session judgement, progression or adaptation.

The decision set **no** numeric minimum coverage, maximum gap or lower plausibility limit, so the function requires the caller to supply them (`CLASSIFIER_LIMITS_NOT_SET` otherwise).

## 7. Updating and withdrawal (HR5-8)

- The zones change only at a week boundary: they use evidence on record before the week starts, the same rule as `heartRateZones`.
- A newer, higher qualifying observed maximum applies from the next week.
- A lab maximum lasts 182 days and an observed maximum 365 days.
- A conflict is re-read every week.
- Withdrawal follows Q9: a declared break of 14 days or more, a hold, or the WALK_JOG, RESTART or RETURN modes. Evidence dated before such an event is not used again.

## 8. The three physiological domains are preserved

`heartRateZones` (LOW / MODERATE / HIGH) is **unchanged**: same function (`heartRateOf`, byte-identical), same values, same output. The V1X-RUN-HR record bound to it stays valid and needs no recheck.

The five zones are a separate reading that maps onto the three domains (`domains`, and `domain` on each zone). They are not five new physiological domains:

- the within-domain splits carry no sporting role;
- the only behavioural use, the slow-down cue, sits on the approved HIGH boundary.

## 9. Abstentions, escalations, human queue, expiry (from the decision)

- **Abstained:**
  - heart-rate targets, or heart rate as primary guidance;
  - a Z3 cue for recovery runs;
  - a lower ceiling for novices;
  - a cue in threshold or race-specific work;
  - mapping supplied lab thresholds into zones;
  - numeric limits for the future classifier.
- **Escalated:**
  - Product: all copy, no "Olympiatoppen" naming, no health meaning;
  - Security: heart-rate and lab data;
  - Clinical owner: medication or conditions that change heart-rate response (ASK / ELIGIBILITY_UNASSESSED, not decided here);
  - Data/Engineering: the running-declaration field, answered in §2 for review.
- **Queue:** HQ-V1HR5-SSCTR-ZONES, proposed and not appended.
- **Expiry:** review by 2027-05-11, aligned with SSCTR-V1RC-DECISION-r1, or earlier on the decision's triggers.
- **Literature access** (recorded in the decision): PubMed E-utilities worked; Europe PMC was unreachable; Seiler 2010 and Sylta 2014 full texts were not accessible (abstracts only); six full texts were read.
