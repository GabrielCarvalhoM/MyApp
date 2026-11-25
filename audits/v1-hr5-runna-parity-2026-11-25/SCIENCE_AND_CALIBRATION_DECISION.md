# V1HR5R — Science and calibration decision (summary)

The authoritative records are [`ssctr/SSCTR_HR5R_DECISION.json`](ssctr/SSCTR_HR5R_DECISION.json) and its `.md`, and the enabling record [`reviews/ssctr/SSCTR_HR5R_RECORDS.json`](reviews/ssctr/SSCTR_HR5R_RECORDS.json). This page only summarises them.

## Who decided what

| Decision | Owner |
|---|---|
| Every athlete with a valid age has five zones from 220 − age, editable, with no device, lab or history required; heart rate never changes the plan | **Founder** ([FOUNDER_REQUEST.md](FOUNDER_REQUEST.md)), product authority. The reviewer did not review or veto it. |
| The scientific framing, caveats, disclosures, the bounded nonclinical sporting rules, and the enabling disposition on the exact bytes | **SSCTR** (project sports-science reviewer). PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY: not human, clinical or empirical validation. |
| Clinical heart-rate modifiers: medication, pregnancy, cardiac conditions | CLINICAL_HUMAN_REQUIRED / ASK, outside this module (SSCTR C12 routes a possible generic note to the clinical owner and Product). |

## Cycle

1. **SSCTR-HR5R-DECISION-r1: REVISE** on values `e795b90b…`. The method, arithmetic, reference order, session roles and safety framing were sound. Four changes were required:
   - **REV-3:** no age estimate past 80 (the age in force was never capped). Now a typed `AGE_OUTSIDE_ESTIMATE_RANGE`.
   - **REV-4a/4b:** the age disclosure states the direction of the error: in older adults the true maximum is more often higher than 220 − age.
   - **REV-7:** an optical caveat (`OPTICAL_MEASUREMENT`) whenever a wrist reading is classified.
   - **N1 (optional):** a truer label for an unused strap value when a lab maximum is in force.
2. **SSCTR-HR5R-RECHECK-r1: APPROVE_WITH_CONDITIONS / SUPPORTED_WITH_LIMITS.** The record is bound to values `784ba7feb3e4c61e…` and to the code bytes of:
   - `v1-heart-rate-zones.mjs` (`002a0323…`);
   - `v1-heart-rate-profile.mjs` (`0ab0e4c8…`);
   - `v1-safety-index.mjs` (`0749d7f0…`);
   - `v1-run-calibration.mjs` (`8203b875…`, unchanged).

   It has 19 sources and 22 conditions, and is to be reviewed by 2027-05-11.
3. **SSCTR-HR5R-RECHECK-r2: APPROVE_WITH_CONDITIONS.** After the independent QRE/Security fixes, the record was re-bound to:
   - `v1-heart-rate-zones.mjs` (`3a4c2e32…`);
   - `v1-heart-rate-profile.mjs` (`ede68c09…`);
   - `v1-safety-index.mjs` (`298f5ac8…`);
   - `v1-run-calibration.mjs` (`8203b875…`, unchanged).

   The values are unchanged. QRE-HR5R-07 was approved as implemented: each session's cue uses its own week's measured references, and the athlete's own maximum, limits and erasure apply to every week at once. That rule is now a condition. Local-day aging, compaction, validation by source and erasure were approved. The r1 record is kept under `superseded`, which the authority does not read.

| Item | Disposition (r1, kept by r2) |
|---|---|
| HR5R-1: edges and rounding (exact, probed for every maximum 120–230 × reading 1–260) | APPROVE, WELL_SUPPORTED |
| HR5R-2: reference order and conflict | APPROVE_WITH_CONDITIONS |
| HR5R-3: ranges and aging | APPROVE_WITH_CONDITIONS (after REV-3) |
| HR5R-4: confidence labels and the age disclosure | APPROVE_WITH_CONDITIONS (after REV-4) |
| HR5R-5: Z4 slow-down cue in easy running | APPROVE_WITH_CONDITIONS (Z4 kept: a wrong estimate can make the cue late or early, never push harder) |
| HR5R-6: no nesting in the three domains | APPROVE_WITH_CONDITIONS (C7: one cue per session) |
| HR5R-7: measurements and time in zone | APPROVE_WITH_CONDITIONS (after REV-7). The series classifier's numbers are **placeholders, not approved rules** (C10). |
| HR5R-8: safety framing | APPROVE_WITH_CONDITIONS |

## Operational estimate vs physiological measurement

This is how the engine keeps them apart (`provenance`, `referenceConfidence`, `notes`, `disclosures`).

| Reference | What it is | Provenance / confidence |
|---|---|---|
| `AGE_ESTIMATE` (220 − age) | A population formula. Individual error is typically about 10–12 bpm (RMSE about 11.65 in Shookster 2020, limits of agreement about ±23), and it underestimates older adults. **An operational estimate, not a measurement.** | ESTIMATED / LOW |
| `ATHLETE_DECLARED_MAXIMUM` | What the athlete entered. The app does not check it. | DECLARED / UNVERIFIED |
| `OBSERVED_MAXIMUM` (chest strap, hard effort) | A **measured lower bound** of the true maximum. | MEASURED / LOW |
| `LAB_MEASURED_MAXIMUM` | A measured maximum, as supplied. | MEASURED / MODERATE |
| The zones themselves | Fixed percentages of a maximum. **Not individual thresholds** (`NOT_THRESHOLDS`), **not medical evidence** (`NOT_MEDICAL_EVIDENCE`), and never a safety release. | zone model LOW |

The Runna articles were used to check that the values match the product the Founder specified. They are commercial content and were not used as scientific evidence.

## Conditions that bind later work

These go to Product, UI (C), HealthKit (B) and Security; the list is in [CONTRACT_DELTA.md §3](CONTRACT_DELTA.md).

- C1–C5 and C7–C9: presentation and copy.
- C6 and C10: any future live channel or series channel needs its own review.
- C11: heart rate never suggests rest, illness or overtraining.
- C12: the clinical note is routed to the clinical owner and Product.
- C13: a Security and privacy review before any real athlete.
- Synthetic data only.
- Inert unless `V1X-RUN-CAPACITY` and `V1X-RUN-HR` are on.

The revalidation queue entry **HQ-V1HR5R-SSCTR-ZONES** is proposed but not appended, because the queue is a Chief/Founder artefact outside this mission's write scope.
