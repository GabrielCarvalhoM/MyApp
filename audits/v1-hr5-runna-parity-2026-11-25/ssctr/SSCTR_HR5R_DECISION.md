# SSCTR-HR5R-DECISION-r1: five zones for every valid age, Runna parity (2026-11-25)

`SSCTR_HR5R_DECISION.json` is the authoritative record. This page summarises it.

**Overall: REVISE. No enabling record is written.** The method, arithmetic, reference order, session roles and safety framing are sound. Three changes are required: two disclosure meanings in the values bytes and one range check in the code. After them, a narrow recheck can enable `V1X-RUN-HR-FIVE-ZONE` on the new values sha256. The reviewed bytes are `CoachingCore/v1/HEART_RATE_FIVE_ZONE_V2.json` at sha256 `e795b90bddf9d3c8acf3281ae43407cf1a353cffcf5e4000b49391f40db2f6cd`, recomputed with `shasum -a 256`.

**Authority.** This review was done by an independent SSCTR instance (SSCTR-1.0.0, SSCTR-CONST-1.0.0, SSCTR-EP-1.0.0) under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. It holds no human credentials, and it is neither human, clinical nor empirical validation. No native dispatch is claimed. The instance authored neither the values nor the code. The Founder's decision that age-based estimated zones exist is not reviewed or vetoed here.

**Literature access.**
- **Full text read:**
  - Shookster 2020 (PMC page): Table 2 for 220 − age gives bias −0.15, 95 % limits of agreement −23.1 to +22.8, RMSE 11.65 bpm.
  - Robergs & Landwehr 2002 (JEPonline PDF via ASEP).
- **Abstracts only:** Tanaka 2001, Nes 2013, Gellish 2007, Bent 2020, Hogue 2026 and Cicone 2019 (youth, used as a counter-population check).
- **Inherited without re-reading:** the sources of SSCTR-HR5-DECISION-r1.
- **Product specification, not evidence:** the Runna articles, read via WebFetch.
- **Negative:** no HRmax test-retest study was found.

## Operational estimate vs physiological measurement

| Operational estimate | Physiological measurement |
|---|---|
| 220 − age, chest-strap observed maximum (a lower bound), athlete-declared maximum, custom limits, and the 65/81/89/97 bands. These are a product convention, not physiological markers. | A qualifying lab maximum from a maximal running test by chest strap or ECG, taken as supplied (the app does not check it), and each reading with its sensor. |

Even with a measured maximum, the zones are still fixed percentages, so the zone model stays LOW. No zone edge is a threshold.

## Rulings

| Item | Disposition | Evidence | Gist |
|---|---|---|---|
| HR5R-1 Edges and rounding | APPROVE | WELL_SUPPORTED | `x ≤ floor(m·p/100)` holds exactly when `100x/m ≤ p`. Probe over maxima 120–230 and readings 1–260 found 0 mismatches, gaps or overlaps. Half-up rounding shifts a zone by less than 0.5 bpm, below sensor precision. |
| HR5R-2 Reference order and conflict | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | Lab before the estimate is correct even when the lab value is lower. "Observed only when higher" is sound: a genuine strap reading is a lower bound of the true maximum. The conflict rule falls back to the population reference with both values disclosed, which is the least-assumption choice. |
| HR5R-3 Ranges and aging | **REVISE (code)** | SUPPORTED_WITH_LIMITS | The ranges and whole-year aging (at most 1 bpm of error) are fine. **Defect:** the age in force is never capped at 80. A probe shows "age 90", an estimate of 130 bpm and a cue from 116 bpm. |
| HR5R-4 Confidence and age disclosure | **REVISE (bytes)** | WELL_SUPPORTED | The labels are approved. LAB MODERATE supersedes r1's LOW, because grading it equal to the formula would hide a real difference. The magnitude in the disclosure is honest. It omits the direction: Tanaka, Gellish and Nes all show that 220 − age underestimates in older adults (about 11–20 bpm low at 80). |
| HR5R-5 Z4 easy-run cue | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | The cue fails safe in both error directions: late or never when the estimate is too high, early but only to "consider slowing" when it is too low. A cue from Z3 is rejected, because it would fire on genuinely easy runs for older athletes. The other roles are unchanged and approved. |
| HR5R-6 Not nested in three domains | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | Correct not to map. The three-zone `conservativeCueOnly` (87 % of an observed maximum) still exists, so there must be one cue per session. |
| HR5R-7 Measurements and time in zone | **REVISE (bytes + code)** | SUPPORTED_WITH_LIMITS | Classifying values one by one, never as a distribution and never from an average, is approved. An optical session maximum needs a caveat (Gillinov, Bent, Hogue, and Runna itself). The series defaults are approved only as unwired placeholders; their numbers are PLAUSIBLE_BUT_UNCERTAIN and not approved as rules. |
| HR5R-8 Safety framing | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | Structurally verified: the heart-rate keys are stripped from what the engine reads. Runna's "higher HR may mean overtraining or illness, rest" must not be adopted. Heart-rate-altering medication and conditions stay ASK / CLINICAL_HUMAN_REQUIRED. |

## Required changes (REVISE)

1. **HR5R-REV-3 (code, `resolve`).**
   - Build an AGE_ESTIMATE reference only when `ageYears[0] ≤ ageInForce ≤ ageYears[1]`.
   - Above 80 there is no age reference, with a typed reason such as `AGE_OUTSIDE_ESTIMATE_RANGE`. A declared maximum, a measured maximum and custom limits still work.
   - Do not cap the estimate at 140.
   - Add a test for the 80 → 81 crossing.
   - Extending the population beyond 80 is for the Founder / G01.
2. **HR5R-REV-4a (bytes, `disclosures.AGE_ESTIMATE`).** The new text is: "Your maximum is estimated from your age (220 minus age). Many people's true maximum differs from this by 10 beats a minute or more, and in older adults it is more often higher than the estimate. You can enter your own."
3. **HR5R-REV-4b (bytes, `ageEstimate.note`).** Append: "; on average it underestimates the maximum of older adults".
4. **HR5R-REV-7 (bytes and code).**
   - Add `disclosures.OPTICAL_MEASUREMENT`: "Wrist (optical) readings are often less accurate than a chest strap, especially when your effort changes quickly. This reading is shown as recorded."
   - `resolve` adds `OPTICAL_MEASUREMENT` to the disclosures when any classified measurement is OPTICAL.

## Conditions carried to an enabling record

- **C1** If an unused qualifying strap value is more than 5 bpm above a declared maximum, show it beside the declared maximum. Never replace the override.
- **C2** Under REFERENCE_CONFLICT, show both measured values and the reference actually used, and offer manual entry.
- **C3** Neither the magnitude nor the direction of the age disclosure may be softened. "You can enter your own" stays.
- **C4** Cue copy keeps "consider slowing" and "a low reading never means speed up". No alarm styling and no health meaning.
- **C5** A cue on an estimated or declared reference carries that reference's disclosure. It is never presented as a personal limit.
- **C6** A future live channel defines "sustained" through its own SSCTR and Data review.
- **C7** One heart-rate cue per session. The five-zone Z4 cue replaces the three-zone `conservativeCueOnly` where five zones are available. The two scales are never presented as one.
- **C8** Zones are named Z1–Z5 or with neutral words, never Runna's "Tempo / Threshold / Anaerobic".
- **C9** A single value is presented as "highest recorded heart rate, in Zx", with its sensor, never as time in a zone.
- **C10** A series channel review (SSCTR and Data) sets the limits, artifact and cadence-lock handling, the plausibility floor, warm-up treatment and the sampling assumptions.
- **C11** No heart-rate reading suggests rest, illness or overtraining.
- **C12** The clinical owner and Product decide on a generic statement about medication and conditions that change heart rate, with no implied screening.
- **C13** Security and privacy review before any real athlete.
- Carried forward from earlier records:
  - synthetic data only;
  - inert unless V1X-RUN-CAPACITY and V1X-RUN-HR are on;
  - display-only;
  - time in zone stays UNAVAILABLE.

**Non-blocking.** N1: with a lab maximum in force, an unused strap value within the 5 bpm band is labelled `OBSERVED_NOT_ABOVE_THE_AGE_ESTIMATE` rather than `A_MORE_SPECIFIC_REFERENCE_IN_FORCE`.

## Notes

- **Concurrent edits.** `v1-heart-rate-profile.mjs` and `v1-safety-index.mjs` changed during this review. The aging defect was reproduced on the new profile bytes. The recheck must bind the final bytes of every heart-rate path.
- **Queue.** HQ-V1HR5R-SSCTR-ZONES is proposed only and not appended.
- **Expiry.** Review by 2027-05-11, or earlier on any trigger listed in the JSON.

---

## SSCTR-HR5R-RECHECK-r1: narrow recheck (2026-11-25)

**Outcome: APPROVE_WITH_CONDITIONS, SUPPORTED_WITH_LIMITS. The enabling record is written:** `reviews/ssctr/SSCTR_HR5R_RECORDS.json`, reviewId `SSCTR-HR5R-RECHECK-r1`.

**Bound bytes** (each recomputed with `shasum -a 256`):

| File | sha256 |
|---|---|
| `HEART_RATE_FIVE_ZONE_V2.json` | `784ba7feb3e4c61efc9ec2187e23d4abdc78504519b40559bbfc53325e75ca90` |
| `v1-heart-rate-zones.mjs` | `002a0323…b996c` |
| `v1-heart-rate-profile.mjs` | `0ab0e4c8…ffdc` |
| `v1-safety-index.mjs` | `0749d7f0…e3ff1` |
| `v1-run-calibration.mjs` | `8203b875…dc83` |

`integration.mjs` (`fcf644e1…1fdd`) was read only for the sporting effect of `setHeartRateProfile`. It has no effect on the plan.

**Verification.**
- **Values delta.** Reversing exactly the four stated edits on the new file gives back `e795b90b…`, the bytes reviewed in r1. Nothing else in the values changed.
- **Tests.** `node --test test/v1hr5-five-zones.test.mjs test/v1hr5r-boundary.test.mjs`: 37 of 37 pass, run by this instance.
- **Independent probe.** Edges still show 0 mismatches. Without a records file the boundary stayed off.

| Item | Result |
|---|---|
| REV-3 | Resolved. On 2027-11-06 the athlete declared at 80 reads 140 bpm. On 2027-11-07 the reading is `AGE_OUTSIDE_ESTIMATE_RANGE`, with the flag set and the easy cue NONE. Past 80, a declared maximum or a qualifying chest-strap maximum still gives zones, and the estimate is not capped. |
| REV-4a / 4b | Resolved. Both texts are exact. |
| REV-7 | Resolved. The text is exact. The disclosure appears with an optical measurement and not with a chest-strap one. |
| N1 | Resolved. With a lab maximum in force, an unused strap value is labelled `A_MORE_SPECIFIC_REFERENCE_IN_FORCE`. The references themselves are unchanged. |

**Item dispositions now.**
- HR5R-1: APPROVE.
- HR5R-2 to HR5R-8: APPROVE_WITH_CONDITIONS.
- HR5R-7c: the numeric defaults are placeholders only.

All of C1–C13 are carried in the record. C7 is accepted as a presentation rule; the frozen three-zone bytes stay unchanged.

**Observation.** An athlete's own override takes effect at once, mid-week, through `setHeartRateProfile`. That is acceptable: it is the athlete's explicit choice and changes no plan.

**Unchanged.**
- No gate is closed and nothing is published.
- HQ-V1HR5R-SSCTR-ZONES is proposed, not appended.
- Review by 2027-05-11.
