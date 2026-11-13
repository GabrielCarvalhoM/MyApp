# SSCTR-RWS-R3-DECISION: distance as the completion criterion (2026-11-13)

`SSCTR_RWS_R3_DECISION.json` is the authoritative record. Its runtime values are under `values` (version RWS-R3-1, which amends RWS-R2-1). Its reference cases are in `workedExamples` (WE3-01 to WE3-23).

**Author.** An AI instance of the SSCTR acting as decision author, under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for nonclinical sporting content only.
- It is independent of the Chief, who wrote the request.
- It holds no human credentials. This record is not human, clinical or empirical validation.
- It enables no boundary and judges no implementation.
- No frozen file was changed.

**Founder rule (binding, not reopened).**
- A native distance target is met by its distance.
- No automatic time ceiling applies, and duration is only an estimate.
- The athlete may stop at any time. The real execution is recorded, and a stop never counts as the target met.
- Statuses are DISTANCE, TIME, PARTIAL, STOPPED and UNKNOWN.

This record rules only on how to make that rule sporting-safe. r2 N4 ("D km or M min") is history. The rest of r2 stands except where this record says otherwise.

**Literature access.** Europe PMC REST API, called through Node.
- **Read in full-text passages:** Pobiruchin 2017 (GNSS on certified half-marathon and marathon courses) and Frandsen 2025 (re-read, including its 1% sensitivity note). Bullock 2024 was read as auxiliary only.
- **Reused from earlier records, not re-read:** Gilgen-Ammann 2020, Jacko 2024, Jennings 2010, Dideriksen 2016 and the V1RC sources.
- **Negative searches:** no study compares distance-prescribed runs without a time limit with time-prescribed runs, and no study covers duration excess at a constant distance.
- **Validator:** Python is unavailable, so the skill validator did not run. Node confirmed that the JSON parses.

## Rulings

Categories: (a) already approved, (b) new decision, (c) depends on evidence (abstained).

| Q | Ruling | Cat. | What it says | Conf. |
|---|---|---|---|---|
| C1 Sizing | APPROVE_WITH_CONDITIONS + KEEP + ABSTAIN | b on a; a; c | **Continuous runs** (EASY, LONG) are sized at the athlete's own slow pace, not at the band's slow edge. The band's slow edge would plan only 79–83% of the dose for a runner at the ceiling.<br>**Paces:**<br>• `P_size` is the slowest of the P1 observed slow edge, the latest comparable run of the class and, for a marathon long run at the 180-min cap, the LONG band's slow edge.<br>• `P_typ` is the slower of the class ceiling and the P1 median.<br>**Checks:**<br>• CT-1: D × P_size ≤ min(M, available minutes), so no excess is planned.<br>• CT-2: D × P_typ ≥ 0.9 M.<br>• CT-3: D ≤ 1.10 × the longest run of the last 30 days (Frandsen's reference category, used as an outer bound only).<br>If none passes, the session is TIME.<br>**Repetitions:** r2 E1–E3 and E5 unchanged.<br>**Excess when the athlete runs slower than P_size:** abstained as a number. Two structural rules bound it instead:<br>• X-1: the latest run's pace sizes the next run.<br>• X-2: two consecutive excesses, stops or partials put that class in TIME for 28 days. | LOW |
| C2 Eligibility | APPROVE_WITH_CONDITIONS | b | **Repetitions:** r2 N3 stands. NOVICE gets even distance repeats with time recoveries, which is the justified mixed form.<br>**Continuous distance also needs:**<br>• INTERMEDIATE or EXPERIENCED, in EASY mode.<br>• The P1 observed range and the class band AVAILABLE.<br>• L30 (the longest run of the last 30 days) known.<br>• The class not paused.<br>**LONG also needs** an executed run in the last 28 days of at least M − 5 min, with its distance. The engine's `longestContinuous` is not used: it records planned minutes and has no time window.<br>**Time only:** RECOVERY_EASY and SHAKEOUT; NOVICE and unknown experience for continuous runs; the WALK_JOG, RESTART and RETURN modes; and first exposure. | LOW |
| C3 Target met | APPROVE_WITH_CONDITIONS + ABSTAIN | b + a; c | **What counts:** WORK steps for repetitions and the main run for continuous runs; nothing else is required.<br>**Continuous, by source:**<br>• Track or measured course: counted distance ≥ target.<br>• GPS (quality not poor): ≥ 0.97 is met. From 0.91 to below 0.97, met only with confirmation (otherwise PARTIAL plus one ASK). Below 0.91 with confirmation, UNKNOWN (measurement conflict) plus ASK; without confirmation, PARTIAL.<br>• Poor GPS: met with confirmation (MANUAL tier), otherwise UNKNOWN.<br>• Treadmill: the display must show ≥ target.<br>• Manual: an entered distance ≥ target or a confirmation is met (lowest tier).<br>• No measurement and no confirmation: UNKNOWN.<br>**Repetitions:** a lap (athlete or device) decides, as in r2 N7. No GPS tolerance is set (abstained).<br>**Tiers** never change progression credit. | LOW |
| C4 STOPPED | APPROVE_WITH_CONDITIONS | a + b | **Reasons:** SYMPTOM, FATIGUE, PACING, CONDITIONS, TIME, CHOICE and OTHER. A missing reason is read as SYMPTOM (V1RC R-01).<br>**Routes:**<br>• SYMPTOM goes to the existing warning-sign screen.<br>• FATIGUE goes to the existing SYSTEMIC_FATIGUE review, behind that screen.<br>**Effect:** the session is not complete and the step holds. Repeated stops are handled by r2 N10 (repetitions) and X-2 (continuous runs). No new clinical rule is created. | MOD |
| C5 PARTIAL, UNKNOWN | APPROVE_WITH_CONDITIONS | b | **PARTIAL:** execution fell short of the target and no stop was declared. The step holds and the existing PARTIAL_SESSION review applies. One ASK offers the stop reasons; without an answer it is not read as SYMPTOM.<br>**UNKNOWN:** not complete and not adverse; the step holds and it is not counted by X-2. It can be corrected later through the correction path.<br>**Precedence:** STOPPED, then PARTIAL, then UNKNOWN, then met. | LOW |
| C6 Envelope | APPROVE_WITH_CONDITIONS | a + b | **E1 and E2** keep [0.9, 1.015]. The 0.9 is now tied to dose parity with the TIME expression; the 1.015 stays the V1RC on-band fraction.<br>**E4** is removed as a sporting requirement for distance-completed sessions. Engineering may keep it only as a compatibility check if the engine's minutes read would otherwise mark a DISTANCE-met session as partial. | LOW |

## Values summary (RWS-R3-1)

**Tied values:**

| Value | Tied to |
|---|---|
| 0.015 | V1RC on-band fraction |
| 0.9 | Dose parity with TIME (engine line 195) |
| 28 days | P1 window |
| 30 days and 1.10 | Frandsen |
| 5 min | R6 long-run step |
| 2 sessions | V1RC consecutive sessions |
| 5 s | V1RC rounding |
| GPS 0.97 | Below the smallest watch MAPE of 3.2%; above the certified-course MAE of 0.6–1.7% |
| GPS 0.91 | Largest documented under-reading, 9% |
| 180 min | Marathon cap |

**Continuous:**
- `P_typ` and `P_size` (S1–S4) as defined in C1.
- Units of 1 km, else 0.5 km; checks CT-1 to CT-3.
- The estimate shown is [D × P_typ, D × P_size].
- If nothing passes, the session is TIME, with reason NO_DISTANCE_WITHIN_CONTINUOUS_ENVELOPE.

**Exposure:**
- EXPOSURE_ABOVE_ESTIMATE when executed minutes exceed 1.015 × the high estimate.
- X-1 and X-2 as in C1.
- No numeric acceptable excess is set.
- Executed minutes never enter engine load.

**Suppression:** four new reasons, inserted after BAND_UNAVAILABLE:
- CONTINUOUS_PACE_UNOBSERVED
- LONG_HISTORY_NOT_COMPARABLE
- DISTANCE_HISTORY_UNKNOWN
- CONTINUOUS_FORMAT_PAUSED

In addition, NOT_A_NATIVE_FAMILY now includes RECOVERY_EASY and SHAKEOUT. The full order (22 reasons) is in the JSON.

**Texts (content only; Product owns the wording):**
- The estimate is labelled as an estimate.
- Walk breaks are fine, and the athlete is never asked to speed up.
- "You can stop at any time; the run is recorded as you did it. If it is taking clearly longer than the estimate, stopping or walking is fine."
- The time version is recommended in heat, hills, wind, on trail or on a treadmill.
- Statuses are shown neutrally.

## Worked examples (expected)

**Athlete A**

| Setting | Value |
|---|---|
| Experience | INTERMEDIATE |
| LONG band | 345–420 s/km |
| P1 | median 340, slow edge 370 |
| Comparable long run | 95 min, 15.5 km |
| L30 | 15.5 km |

| WE | Case | Expected |
|---|---|---|
| 01 | 16 km long run (M 100) | NATIVE 16 km, estimate about 92–99 min |
| 02 | Faster than the ceiling (5:35/km, 89.3 min) | DISTANCE, no excess flag |
| 03 | In band (6:00/km, 96 min) | DISTANCE |
| 04 | In band but slower than sizing (6:45/km, 108 min) | DISTANCE + EXPOSURE_ABOVE_ESTIMATE. The next long run (M 105) is TIME (CT-2 fails at P_size 405). |
| 05 | Slower than the band (7:15/km, 116 min) | DISTANCE + EXPOSURE_ABOVE_ESTIMATE (accepted residual of +16% minutes). The next long run is TIME. |
| 06 | Stopped at 12 km for fatigue | STOPPED (FATIGUE). Offer of the SYSTEMIC_FATIGUE review behind the screen; the step holds; the next long run is 16 km again. |
| 07 | GPS 15.6 km, athlete confirms 16 | DISTANCE (GPS tier, 0.975); the result is the same without confirmation |
| 08 | GPS 15.0 km | Confirmed: DISTANCE (CONFIRMED tier). Unconfirmed: PARTIAL + one ASK. |
| 09 | GPS 14.0 km, confirmed | Good GPS: UNKNOWN (MEASUREMENT_CONFLICT) + ASK. Poor GPS: DISTANCE (MANUAL tier). |
| 10 | No device, confirmed | DISTANCE (MANUAL tier) |
| 11 | No device, unconfirmed | UNKNOWN |
| 12 | 6 × 800 m, 5 of 6 done | PARTIAL; hold; one ASK; the next session uses even repeats (r2 N10) |
| 13 | 6 × 800 m, symptom stop | STOPPED (SYMPTOM) → warning-sign screen; TIME until answered; hold |
| 14 | 6 × 800 m, stop with no reason | Read as SYMPTOM, as WE3-13 |
| 15 | NOVICE easy run, 30 min | TIME (EXPERIENCE_NOT_ELIGIBLE) |
| 16 | RETURN athlete | TIME for every run session (MODE_WALK_JOG_RESTART_RETURN); no mixed session in RETURN mode |
| 17 | After the return ends | Threshold repetitions can be native once the band is back. Easy and long runs stay TIME (CONTINUOUS_PACE_UNOBSERVED) until P1 is back: a mixed week. |
| 18 | 8 km easy run (M 50) | NATIVE 8 km, about 45–49 min |
| 19 | Marathon long run at the 180-min cap | TIME (NO_DISTANCE_WITHIN_CONTINUOUS_ENVELOPE); without S4 it would be 29.5 km |
| 20 | Last long run was 80 min (M 100) | TIME (LONG_HISTORY_NOT_COMPARABLE) |
| 21 | Two easy runs in a row above the estimate | Both DISTANCE; the EASY class is TIME for 28 days (CONTINUOUS_FORMAT_PAUSED) |
| 22 | Recovery run | TIME (NOT_A_NATIVE_FAMILY) |
| 23 | 8 km on a treadmill | DISTANCE (TREADMILL tier); not pace evidence |

## Escalations

**Founder (information).**
- No part of the rule was judged unsafe for an eligible population, and no clinical item arises.
- The product consequences are:
  - Continuous distance targets reach only INTERMEDIATE and EXPERIENCED athletes with recent qualifying easy runs.
  - Long runs also need a recent run of comparable length.
  - Recovery runs and shakeouts stay in time.
  - Long runs at the marathon cap will mostly stay in time.
  - One very slow long run makes the next one a time session, and two in a row pause distance targets for 28 days.
- The accepted residual: a run executed slower than the athlete's own recent slow pace lasts longer than planned. It is bounded by rules, not by a number. A numeric bound would need a time ceiling (which the Founder rejected), evidence that does not exist, or funded human review.

**Chief.** Update handoff sections 3–5:
- No ceiling on continuous distance steps.
- Statuses, sources and tiers.
- Stop reasons and their routes.
- The new suppression reasons.
- RECOVERY_EASY and SHAKEOUT are time only.
- E4 scope.
- The estimate range comes from P_typ and P_size.

**Product.**
- Wording of the estimate and of the stop-any-time line.
- Neutral wording for statuses.
- A stop control with the seven reasons.
- The ASK flows.

**Data/G03.**
- Statuses, tiers, MEASUREMENT_CONFLICT, the correction path and EXPOSURE_ABOVE_ESTIMATE.
- Planned versus executed distance or minutes is not an adherence measure.

**Engineering/QRE.**
- How the engine's minutes read treats a DISTANCE status (E4 compatibility).
- T3: the new fields must survive in `actualLedger`.
- Deterministic P1, S2/S3, L30 and X-2 under the provenance rules.
- A coverage sweep on the candidate.
- GPS bounds apply to continuous runs only.

**Observation (outside scope).** In the TIME expression, the engine's 5-min long-run step is an increase above 10% for long runs under 50 min. Frandsen associates single-session increases above 10% (and, in sensitivity, of 1–10%) with a higher overuse-injury rate. This is not a ruling; it is listed as a re-review trigger.

**Clinical.** Nothing new.

## Queue, expiry and governance

**Queue (proposed only, not appended):** both items are QUEUED_FOR_FUNDED_HUMAN_REVALIDATION.
- HQ-RWS3-SSCTR-CONTINUOUS-DISTANCE (C1, C2). It supersedes the proposed HQ-RWS2-SSCTR-CONTINUOUS.
- HQ-RWS3-SSCTR-COMPLETION (C3–C6). It amends HQ-RWS2-SSCTR-MEASURE and HQ-RWS2-SSCTR-NATIVE.

**Expiry:** 2027-05-11, or earlier on any trigger in the JSON. The triggers include a Founder change to the rule, changes to V1RC, P1 or the R6 values, the first product data on distance sessions, an adverse event, and new GNSS or prescription evidence.

**Governance:**
- No gate is closed and nothing is published.
- No boundary is enabled. V1X-RUN-NATIVE needs a fresh SSCTR judge's record.
