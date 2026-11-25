# SSCTR decision request — five heart-rate zones (HR5), 2026-11-25

**Requested by:** Chief / CoachingCore maintainer of mission V1HR5 ([Founder request](../FOUNDER_REQUEST.md)).
**Requested of:** the Sports Science & Concurrent Training Reviewer (SSCTR-1.0.0), as the *decision* instance. A different, fresh instance will review the implementation and issue any enabling record. This instance does not judge the implementation.
**Population:** adult recreational runners of the V1 plan (novice to experienced, 5 km to marathon goals), concurrent strength allowed. Synthetic data only; no real athlete.

## 1. Why

The Founder decided that V1 has **five heart-rate zones truly computed by CoachingCore**, not a five-segment drawing of the current three. The decision also says the three internal physiological domains must not be removed if the sporting logic needs them, and must not be turned into five artificial domains.

What exists today, unchanged by this request:

- `CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json` `heartRate` and `src/v1-run-calibration.mjs heartRateOf`, decided by **SSCTR-V1RC-DECISION-r1 Q6** (`audits/coachingcore-v1-run-calibration-2026-11-11/ssctr-decision/`) and enabled by the V1X-RUN-HR record bound to `d9f7429b…84aa`:
  - (a) **lab values as supplied** (LAB_TEST, ≤ 182 days, no break of 14 days or more since): shown as supplied, with no threshold named by the engine and no mapping to pace or effort;
  - (b) **observed maximum**: chest strap only, from a race, time trial or field test of 10 min or more at reported RPE ≥ 8, 140–220 bpm, the highest qualifying value within 365 days. It gives three zones: LOW < 0.80, MODERATE 0.80–0.87, HIGH ≥ 0.87;
  - no age formula and no heart-rate reserve;
  - the zones are a display-only reference: never a session target or gate, never converted to pace or effort, never called thresholds. A HIGH reading during EASY, LONG or RECOVERY may suggest slowing, never speeding up;
  - withdrawal (Q9): a break of 14 days or more, a hold, or the WALK_JOG, RESTART or RETURN modes withdraw them.
- Abstentions of that decision that still stand: "No heart-rate targets", and Q6.separation (`EFFORT_DOMAIN`, `PACE_BAND` and `HEART_RATE_ZONE` are not converted into each other).
- The data contract: the engine reads `heartRate: {maxBpm, sensor}` on performance evidence (intake anchors, declared evidence, the plan's own race rows). It reads **no** average heart rate, resting heart rate or heart-rate time series. The device channel sends no heart rate in V1 (parallel contract G-1).

## 2. The proposal (Chief's; for you to approve, amend or refuse item by item)

The proposal is **additive**. The three-zone `heartRateZones` output, its rules and its bytes stay exactly as they are. The five zones are a separate output, `heartRateFiveZones`, with their own values file (`CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json`, pinned by hash) and their own boundary `V1X-RUN-HR-FIVE-ZONE`. That boundary is on only with V1X-RUN-CAPACITY and V1X-RUN-HR, and with an independent SSCTR record bound to the new file's bytes.

### HR5-1 · Method and boundaries

Five zones as fractions of one reference maximum, chosen to **nest** the approved three domains, so no domain boundary moves and no artificial domain appears:

| Zone | From (≥) | To (<) | Domain (approved, unchanged) |
|---|---|---|---|
| Z1 | open | 0.72 | LOW |
| Z2 | 0.72 | 0.80 | LOW |
| Z3 | 0.80 | 0.87 | MODERATE |
| Z4 | 0.87 | 0.92 | HIGH |
| Z5 | 0.92 | open | HIGH |

Basis to verify (do not take it from this request):

- the Norwegian (Olympiatoppen) five-zone scale, as reported in the literature: about 60–72 / 72–82 / 82–87 / 87–92 / 92–97 % of HRmax, for example in Tønnessen et al. 2014 (PLoS One) and Seiler 2010 (IJSPP);
- its aggregation into three zones, zone 1 = I1+I2, zone 2 = I3, zone 3 = I4+I5 (for example Sylta, Tønnessen & Seiler 2014, IJSPP).

The 0.80 and 0.87 cuts are the ones already approved, not the scale's 0.82. The 0.72 and 0.92 cuts come from the scale.

Alternatives considered and why they are not proposed:

- a generic 50/60/70/80/90 % HRmax scale: it does not nest, and its Z3 (70–80 %) would sit inside the approved LOW domain;
- heart-rate reserve (Karvonen): V1 has no resting heart-rate input;
- threshold-anchored zones (VT1/VT2, LTHR): lab values arrive as free-form, unchecked names and values, and Q6 forbids the engine to name thresholds.

**Questions:** Is a five-zone fixed-fraction scale defensible as a display-only reference for this population? Are 0.72 and 0.92 supported, or would you set other values or abstain on one split (for example, keep Z1/Z2 as one)? Should Z1 have a floor (for example 0.50 or 0.60), or stay open as LOW is today?

### HR5-2 · Reference hierarchy

1. `LAB_MEASURED_MAXIMUM`: a LAB_TEST in force under the existing lab rules (≤ 182 days, no break of 14 days or more since, not before a hold or return; SSCTR-V1RC-R-09) that also states `heartRate.maxBpm` in 140–220. Shown as "the maximum your lab test reported, as supplied, not checked by the app". The supplied lab values themselves stay shown as supplied in `heartRateZones` and are never turned into zones.
2. `OBSERVED_MAXIMUM`: exactly the approved Q6(b) rule and value.
3. Otherwise **no five zones**, with a typed reason.

Not used:

- a declared maximum with no qualifying effort or sensor (the Figma's "máxima informada");
- an age formula;
- heart-rate reserve;
- a single average heart rate of a session;
- any optical sensor.

**Questions:** Is adding (1) supported, or must five zones come only from the approved Q6(b) maximum? Is the refusal of a declared maximum correct?

### HR5-3 · Conflicting references

When a lab maximum and a qualifying observed maximum are both in force and more than **5 bpm** apart, the proposal is: use the **lower** one (the conservative direction for a slow-down cue), set reference confidence LOW, and report the conflict with both values and dates. Within 5 bpm, the hierarchy decides with no conflict.

**Question:** Is lower-wins the right conservative rule? Is 5 bpm a reasonable band (sensor agreement), or would you set another value or refuse the zones under conflict?

### HR5-4 · Arithmetic and convention

- Each boundary in bpm = round-half-up(reference × fraction), computed in integer per-mille.
- Intervals are `[from, to)`: a reading equal to a boundary belongs to the higher zone. Z1 has an open lower end and Z5 an open upper end (an observed maximum may be below the true maximum).
- The boundaries must be strictly increasing; otherwise there are no zones (`ZONE_BOUNDARIES_DEGENERATE`, impossible inside 140–220 but checked).

**Question:** any objection?

### HR5-5 · Confidence and provenance

- `referenceConfidence`: MODERATE for a lab maximum, LOW for an observed maximum, LOW under a conflict.
- `zoneModelConfidence`: always LOW. Fixed fractions of a maximum misplace individuals relative to their thresholds (SRC08, SRC09 of the V1RC decision).
- Every output names its reference: kind, bpm, evidence id, date, sensor or protocol, and age in days. Every output is `estimated: true`.

**Question:** Is MODERATE justified for a supplied lab maximum, or should both be LOW?

### HR5-6 · Role in prescription (the material question)

The proposal keeps **effort as the prescription in every session**, with **heart rate never primary in V1**. Heart rate can be primary only with individually measured thresholds, mapped by a reviewed rule, and that is future work.

| Session family / state | Heart-rate role | Note |
|---|---|---|
| EASY, LONG, RECOVERY_EASY, SHAKEOUT, EASY_REESTABLISHMENT (in EASY mode) | `COMPLEMENTARY_CEILING_CUE` | A reading in **Z4 or above** (the approved HIGH domain) may suggest slowing. Never a cue to speed up. Effort governs. |
| THRESHOLD, HALF_MARATHON_SPECIFIC, MARATHON_SPECIFIC | `NO_HEART_RATE_GUIDANCE` | Effort governs. Zones are not individual thresholds, and Q6.separation keeps zones and effort domains apart. |
| FIVE_K_SPECIFIC, TEN_K_SPECIFIC, strides | `NO_HEART_RATE_GUIDANCE` | Heart rate lags short hard bouts. |
| RACE, RACE_TOUCH | `NO_HEART_RATE_GUIDANCE` | Race-day guidance stays as approved. |
| WALK, WALK_JOG, FAMILIAR_REPEATED_BOUTS; WALK_JOG, RESTART and RETURN modes; a hold; no zones | `NONE` | With a typed reason. |
| An unknown family | `NO_HEART_RATE_GUIDANCE` | Fail closed. |

Other parts of the proposal:

- **Conflict with RPE:** effort governs. A reading at or above the cue zone may suggest slowing; a low reading never suggests speeding up.
- **Novices:** the same rules. Walk/jog is already effort only.
- **Return after a pause:** withdrawn, as Q9.
- No session is gated, sized or progressed by heart rate, and no dose changes.

**Questions:**

- Is the Z4 cue right for recovery runs too, or should RECOVERY_EASY/SHAKEOUT cue from Z3?
- Should EASY/LONG show the zones they "usually sit in" (Z1–Z2)? The proposal says no: that would convert an effort domain to a zone, which Q6.separation refused.
- Is there any family where you would approve heart rate as the *primary* guidance in V1? The proposal says none.

### HR5-7 · Time in zone

The engine receives no heart-rate time series in V1. The proposal is:

- a pure classifier of samples into the five zones is implemented for a future reviewed channel and is not wired to any input;
- the output says `sessionDistribution: UNAVAILABLE / NO_HEART_RATE_SERIES_IN_CONTRACT`;
- time per zone is never derived from an average heart rate.

**Question:** any sporting condition on a future classifier (for example, excluding the first minutes of a session, a minimum coverage, or treating a gap as unknown rather than interpolating it)? Recording conditions is enough; the channel is not in this mission.

### HR5-8 · Updating and withdrawal

- The zones change only at a week boundary (evidence on record before the week starts), as the three zones do today.
- They are withdrawn by the approved Q9 events.
- A newer, higher qualifying observed maximum replaces the old one from the next week.
- A lab maximum expires after 182 days and an observed maximum after 365 days.

**Question:** any objection?

## 3. What you are asked to return

1. `audits/v1-five-zone-heart-rate-2026-11-25/ssctr/SSCTR_HR5_DECISION.md` (readable, short) and `SSCTR_HR5_DECISION.json` with:
   - your literature access and search log;
   - sources you actually read (PMID/DOI, access level, findings used);
   - per item: disposition (APPROVE / APPROVE_WITH_CONDITIONS / AMEND / ABSTAIN / REFUSE), evidence status, confidence, conditions, rationale and disclosure;
   - **the final values** for `HEART_RATE_FIVE_ZONE_V1.json` (fractions, reference rules, conflict rule, session roles, confidence labels);
   - abstentions, escalations, proposed human-queue entries, and expiry.
2. Do not write runtime code and do not write the enabling record. The enabling record comes from the later independent review of the implementation against your decision.

Evidence protocol: `governance/agents/sports-science-reviewer/EVIDENCE_PROTOCOL.md`. Search actively; memory is not evidence. Prefer abstention to invented numbers.
