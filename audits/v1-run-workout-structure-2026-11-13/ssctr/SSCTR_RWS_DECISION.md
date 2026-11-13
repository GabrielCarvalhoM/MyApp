# SSCTR-RWS-DECISION-r1: Run Workout Structure, distance expression (2026-11-13)

`SSCTR_RWS_DECISION.json` is the authoritative record. The runtime values are under `values`. The reference outputs to test against are in `values.workedExamples` and `values.workedExamplesOtherCases`.

**Author.** An AI instance of the SSCTR acting as decision author, under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for nonclinical sporting content only. It is independent of the author of the proposals, the Chief. It holds no human credentials, and this record is neither human, clinical nor empirical validation. It does not enable `V1X-RUN-DISTANCE` and it does not judge an implementation. A fresh SSCTR instance judges the candidate. No frozen file changes.

**Builds on.** `SSCTR-V1RC-DECISION-r1`: the Q4 bands, Q8 recalibration, Q9 withdrawal and the recheck conditions. If that record changes or is superseded, this one is invalid until it is re-reviewed.

**Literature access.** I used the Europe PMC REST API and one WebSearch, whose result pages are not used as evidence.
- **Read in full-text passages:** Gilgen-Ammann 2020, Jacko 2024 and Frandsen 2025.
- **Read as abstracts only:** Jennings 2010, Rawstorn 2014, Biernacki 2023, Seiler and Hetlelid 2005 and Dideriksen 2016.
- **Reused as summarised in the V1RC record, not re-read:** the V1RC sources cited here.
- **Negative result:** no study compares interval sessions prescribed by time with the same sessions prescribed by distance.
- **Validator:** Python is not installed, so the skill validator did not run. Node confirmed the JSON parses.

## Rulings

Categories: (a) already approved by a standing decision, (b) new decision made now, (c) still dependent on evidence.

| Q | Ruling | Category | What it says |
|---|---|---|---|
| Q1 Distance equivalent | APPROVE_WITH_CONDITIONS | b | This is a **new use of the band**: V1RC approved the band as guidance only. Time stays the dose. The **time dose caps each repetition**: the repetition ends at the distance or when its minutes have passed, whichever comes first. The time version is always available. Effort governs. Confidence LOW. |
| Q2 Edge, rounding, tolerance | APPROVE_WITH_CONDITIONS | b, tied to V1RC | **Slow edge**, rounded **down**. Use the coarsest of 100 / 50 / 10 m that keeps the shortfall within **1.5%**. 1.5% is V1RC's own on-band fraction, so no new number. Otherwise the repetition stays in time. |
| Q3 Short repetitions | APPROVE_WITH_CONDITIONS + ABSTAIN | b tied to V1RC; c | Distance only for repetitions of **5 min or more** (the V1RC Q8 bout). No metres minimum and no track exception, because there is no evidence for either. The `TRACK_OR_MEASURED` class is dropped. |
| Q4 Recoveries | APPROVE | b | Recoveries stay in time, as a walk or easy jog. They are excluded from every distance figure. |
| Q5 Warm-up, cool-down, strides | APPROVE | a + b | Warm-up and cool-down are in time. Strides are in seconds, optional where the engine says so, with no band. |
| Q6 Continuous runs | APPROVE_WITH_CONDITIONS | a + b | No distance target. If an approximate distance is shown, it is an **upper bound only** ("up to about"), taken from the ceiling, with no lower figure. |
| Q7 Time-only cases | APPROVE_WITH_CONDITIONS | a + b | The author's list is kept. Six reasons are added: repetition under 5 min, rounding tolerance not met, completion-read risk, marathon estimate above 6:00:00, sessions the engine converted to easy, and extension errors. |
| Q8 Week-boundary change | APPROVE_WITH_CONDITIONS | a + b | Not progression; the dose key is unchanged. A change can exceed 4.5% after a race or test, which is acceptable because time caps the repetition. A distance change is never called progression. |
| Q9 No new family | APPROVE | a | VO2 de novo, hills, fartlek, progression runs, the marathon-finish long run and steady runs stay out of V1. |
| Q10 Familiar task by distance | ABSTAIN (deferred) | c | Not trivially safe. A self-reported pace would become `workMinutes` that the engine compares. Data semantics are needed first. |
| Q11 Weekly km | APPROVE_WITH_CONDITIONS | b | Informational upper bound only. It feeds nothing, and it is never an adherence measure (that is a G03 question). |

## Values (summary)

- **Eligible families:** THRESHOLD, FIVE_K_SPECIFIC, TEN_K_SPECIFIC, HALF_MARATHON_SPECIFIC, MARATHON_SPECIFIC and RACE_TOUCH. Under Q3, only repetitions of 5 min or more qualify: all threshold, half and marathon steps, the half and marathon race-week touches, and taper repetitions of 5 min or more. 5K and 10K sessions stay in time.
- **Conversion:** `slowEdgeMetres = workMinutes × 60 / slow s/km × 1000`. For U in [100, 50, 10], `R = floor(slowEdgeMetres / U) × U`. Accept the first R with `R × 1.015 ≥ slowEdgeMetres`.
- **Completion read** (`r6-adaptation.mjs:195`, threshold 0.9): `warm-up + cool-down + (n−1) × recovery + n × min(work, R × fast / 1.015)` must be at least `0.9 × durationMinutes`. All values come from the canonical prescription. If the check fails, the session gets `COMPLETION_READ_RISK` and stays in time.

**Worked examples** (bands from the V1RC worked examples):

| Session | Band | Distance per repetition |
|---|---|---|
| Threshold 3 × 5 min | 5:10–5:30 | **900 m** |
| Threshold 3 × 5 min | 7:20–7:55 | **630 m** |
| Threshold 3 × 10 min | 5:10–5:30 | **1800 m** |
| Threshold 3 × 8 min | 6:35–7:25 | **1070 m** |
| Half 2 × 12 min | 5:25–5:40 | **2100 m** |
| Half 2 × 12 min | 7:35–8:15 | **1450 m** |
| Marathon 2 × 15 min | 5:50–6:10 | **2400 m** |
| Marathon 3 × 20 min | 5:50–6:10 | **3200 m** |
| Half touch 2 × 5 min | 5:25–5:40 | **880 m** |
| Marathon touch 2 × 5 min | 5:50–6:10 | **800 m** |
| Taper 2 × 8 min | 5:10–5:30 | **1450 m** |
| 5K 6 × 2 min, 10K 5 × 3 min, 5K touch 3 × 1 min, 10K touch 3 × 2 min | any | **time only** (REPETITION_SHORTER_THAN_MINIMUM) |

Two synthetic cases exercise the other two suppressions: ROUNDING_TOLERANCE_EXCEEDED and COMPLETION_READ_RISK.

## Interaction with the 0.9 completion read

With the slow edge, down-rounding and the check at 1.5% beyond the fast edge, every current ladder step passes with margin. A sweep of slow edges from 200 to 700 s/km, with band ratios up to 1.17, failed only for 3 × 20 min with very wide bands; those cases become time-only.

One residual effect is accepted. A runner who runs distance repetitions clearly faster than the band can be read as partial and will repeat the step. That is the conservative direction. Engineering/QRE must confirm whether V1RC Q8 reads the engine's partial flag.

## Escalations

- **Product:** the default expression, the wording of the time ceiling, whether to show the approximate distance, and treadmill guidance. None of these blocks the values.
- **Data:** the meaning of `actual.expression` and of a repetition ended by the time ceiling; and G03 for planned versus executed km.
- **Engineering/QRE:** the partial-flag question above, and implementing `MARATHON_ESTIMATE_ABOVE_360_MIN` inside the extension.
- **Founder:** nothing required.
- **Clinical:** nothing new.

**Queue.** Proposed only, not appended: HQ-RWS-SSCTR-DIST and HQ-RWS-SSCTR-APPROX, as QUEUED_FOR_FUNDED_HUMAN_REVALIDATION.

**Expiry.** 2027-05-11, the same date as V1RC, or earlier on any trigger listed in the JSON. **Governance:** no gate is closed, nothing is published and no boundary is enabled.
