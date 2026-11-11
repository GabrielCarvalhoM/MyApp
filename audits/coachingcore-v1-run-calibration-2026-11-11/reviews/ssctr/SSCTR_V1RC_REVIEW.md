# SSCTR-V1RC-REVIEW-r1: independent sporting review of the V1 Run Calibration candidate (bc40218)

`SSCTR_V1RC_REVIEW.json` is the authoritative record. Reviewer: an AI SSCTR instance acting as independent judge, under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical sporting content only. It did not write the decision or the candidate. This is not human, clinical or empirical validation.

**Verdict: NOT_READY.** The methods and numbers are defensible and the runtime reproduces them exactly. Three narrow faults block enablement.

| Boundary | Disposition as it stands | Evidence |
|---|---|---|
| V1X-RUN-CAPACITY | REJECT (R-01, R-02) | SUPPORTED_WITH_LIMITS |
| V1X-RUN-PACE | REJECT (R-03, marathon band) | SUPPORTED_WITH_LIMITS |
| V1X-RUN-HR | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS |
| V1X-RUN-ESTIMATE | REJECT (R-03) | SUPPORTED_WITH_LIMITS |

## Blocking findings

- **R-01. A test that was not tolerated, or was stopped for a symptom, is offered again.** It is re-offered the next week (or after 42 days if it was completed), and the engine answers KEEP. Fix: add a `stoppedFor` field, where no stated reason counts as a symptom. A not-tolerated or symptom stop ends test offers for the plan in force and flags `warningSignScreen: REQUIRED`. The one repeat remains only for non-symptom stops.
- **R-02. A test is offered while the engine is asking about unanswered warning signs (ASK).** Fix: offer a test only after a prescribing engine answer, with NONCLINICAL_CONFIRMED eligibility and every warning-sign item answered no. Otherwise the result is `ELIGIBILITY_NOT_CURRENT`.
- **R-03. A marathon estimate and a MARATHON_EFFORT band reach a runner outside the model population.** Example: a half marathon of 2:55, which is a 10 km equivalent of 78:43. Fix: a STANDARD source outside the population is not a marathon source, so the result is `OUTSIDE_MODEL_POPULATION`.

## Non-blocking findings (correct in the fix cycle, or they become conditions)

- **R-04.** LONG can be faster than EASY when the easy ceiling comes from observed runs (P1). At a 10K of 73:45, threshold can be 5 s/km faster than 10K effort. Fix: clamp in the slowing direction.
- **R-05.** A downward step comes from sessions run below the effort cue. A failed session between two others does not break the pair.
- **R-06.** Race-pace bands show while ESTIMATE is off. They must require ESTIMATE.
- **R-07.** The marathon caution ("many runners race slower"; "assuming the long runs are completed") is only a flag. It must be a machine-readable field.
- **R-08.** Observed bands lack dates, validity and uncertainty.
- **R-09.** Supplied lab anchors ignore the hold and return floor.
- **R-10.** Aged evidence stays LOW however many reductions stack. Fix: count aging as one reduction (decision amendment).
- **R-11.** Longer-than-half evidence converted upward has no population bound (decision gap).
- **R-12.** The order of the test declaration and the not-done report must be fixed in the contract.

## Readings R1–R14

- **Acceptable:** R1, R2, R5, R6, R9 (verified in r6-intake.mjs), R10 and R13.
- **Acceptable with a condition:** R3 (an adjusted race-pace band is not labelled as the estimate), R4 (see R-05), R8, R11 (extend to lab anchors) and R12 (see R-12).
- **Findings:** R7 (see R-04) and R14 (see R-06).

## Runs and literature

- **Runs:** 49 of 49 directed tests pass. The 23 journeys are byte-identical to the evidence. I recomputed four cases by hand (very fast, very slow, a marathon from a half, a field test), and all match. My probes are `ssctr-judge-scratch-r1-7c3e/probe1.mjs` to `probe6.mjs` in the extract.
- **Literature:** I used the Europe PMC REST API. I read full-text passages of Vickers 2016 and Blythe 2016, and abstracts of Smyth 2021, Oficial-Casado 2025, Ausland 2026, Kasiak 2023 and Fisher 2017. I spot-checked four of the decision's sources. I found no direct evidence on test safety in novices.

## Limitation C

I agree with keeping C as it is in this mission. The frozen engine has no repetition limit, so exposing the existing one-week adaptation needs a new rule and custody work first.

## Records and queue

`SSCTR_V1RC_RUN_RECORDS.json` holds only V1X-RUN-HR. The runtime needs CAPACITY for every boundary, so the extension stays off. I propose HQ-V1RC-SSCTR-HR and, for the recheck, HQ-V1RC-SSCTR-EST-CALIBRATION. Neither is appended.

## Disclosure

The host session injected the global and project CLAUDE.md files and a MEMORY.md. I used them only for orientation; nothing in them counts as evidence.
