# SSCTR-HR5-DECISION-r1: five heart-rate zones (2026-11-25)

`SSCTR_HR5_DECISION.json` is the authoritative record. The final machine values for `CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json` are under `values`, and `values.workedExamples` gives reference outputs to test against.

**Author.** An AI instance of the SSCTR (SSCTR-1.0.0, SSCTR-CONST-1.0.0, SSCTR-EP-1.0.0) wrote this as the decision instance, under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for nonclinical sporting content only. It holds no human credentials. This record is neither human, clinical nor empirical validation. The instance does not claim a native dispatch, writes no enabling record and does not judge the implementation; a fresh SSCTR instance does that. The three-zone output, its values and its bytes are unchanged.

**Literature access.** I used PubMed E-utilities for searches, abstracts and PMC full texts. Europe PMC was unreachable from this sandbox. I read full texts of Seiler & Tønnessen 2009 (Sportscience), Tønnessen 2014 (PLoS One), Seiler-Viken 2025 (Sci Rep), Meixner 2025 and Gaskill 2023, plus the official Olympiatoppen intensity scale v2 (2024; extracted with PDFKit; not peer reviewed). Twelve other sources were read as abstracts only. **I could not access the Seiler 2010 full text** (publisher 403) **or the Sylta 2014 full text**.

**The request's basis needs correcting.** Tønnessen 2014 Table 2 reports 54–73 / 74–83 / 84–88 / 89–93 / >94 %HRmax, not 60–72 / 72–82 / 82–87 / 87–92 / 92–97. The official scale is ~55–72 / 72–82 / 82–87 / 87–92 / 92–100. Seiler 2010's table is unverified. The proposed fractions still stand, on the corrected basis.

## Rulings

| Item | Ruling | One-line reason |
|---|---|---|
| HR5-1 Method | APPROVE_WITH_CONDITIONS | A published convention that nests LT1/LT2 (5→3: I1+I2, I3, I4+I5), but it misplaces individuals. So it is display-only, with LOW model confidence, and must not be called "Olympiatoppen zones" (the app's Z2/Z3 cut is 0.80, not ~0.82). |
| HR5-1 cuts 0.72 / 0.92 | APPROVE_WITH_CONDITIONS | They match the official I-1/I-2 and I-4/I-5 cuts and practitioner means (runners 69.8 ± 6.7 and 92.3 ± 3.5 %). The splits are arbitrary, so no V1 rule may use them. |
| HR5-1 cuts 0.80 / 0.87 | APPROVE | They are the approved domains and lie within the evidence spread (elite LT1/LT2 ~80/88 %; VT1 81.4 ± 3.9 %). The bpm must equal the three-zone output's bpm (checked for 140–220). |
| HR5-1 open ends | APPROVE | No Z1 floor: published floors disagree (54–60 %) and a floor has no sporting use. Z5 is open because an observed maximum may be below the true one. |
| HR5-1 basis | AMEND | Cite the verified sources. Do not attribute the request's numbers to Tønnessen 2014 or Seiler 2010. |
| HR5-2 Lab maximum | APPROVE_WITH_CONDITIONS | **Added:** a declared running test (HRmax differs by modality, ~5 % running vs cycling), a CHEST_STRAP or ECG sensor, RPE ≥ 8 reported, and completed and tolerated not false. Existing lab rules apply (182 days, R-09). If modality cannot be carried by existing inputs, the lab tier stays off. |
| HR5-2 Observed / order / not used | APPROVE | Q6(b) is unchanged. A typed-in maximum, age formula, HRR, session average and optical sensors are all refused. |
| HR5-3 Conflict | **AMEND** | **No lower-wins.** A genuine chest-strap reading cannot exceed the true maximum. If the observed maximum exceeds the lab maximum by **more than 5 bpm**, there are **no five zones** (REFERENCE_CONFLICT, both values shown). A lab value *above* the observed one is expected, not a conflict, so the lab value is used. 5 bpm is a decided tolerance above chest-strap error, not an HRmax reliability figure. |
| HR5-4 Arithmetic | APPROVE_WITH_CONDITIONS | Boundaries are floor((bpm × per-mille + 500)/1000) in integers, on [from, to) intervals; a reading on a boundary goes to the higher zone. The method matches `Math.round` and stays strictly increasing for 140–220. |
| HR5-5 Confidence | **AMEND** | referenceConfidence is **LOW for a lab maximum too**, since the app cannot verify protocol, modality or maximality. zoneModelConfidence is always LOW, every output is `estimated: true`, and provenance is required. |
| HR5-6 Effort primary | APPROVE | RPE at VT is uniform across fitness levels, while %HRmax at thresholds varies widely. Heart rate is never primary, gates nothing and changes no dose. |
| HR5-6 Easy families | APPROVE_WITH_CONDITIONS | EASY, LONG, RECOVERY_EASY, SHAKEOUT and EASY_REESTABLISHMENT get a ceiling cue from **Z4**. It needs a sustained reading, only ever suggests slowing and carries no health meaning. Drift in long or hot runs is real strain. Z4 is a late ceiling for newer runners, which is disclosed. |
| HR5-6 Recovery from Z3 | ABSTAIN | Plausible but uncertain: VT1 sits near or above 0.80 for many trained runners. Z4 is kept, as in Q6. |
| HR5-6 "Usual zones" for EASY/LONG | REFUSE (as proposed) | It would convert an effort domain into a zone, which Q6.separation forbids. |
| HR5-6 THRESHOLD / HM / M | APPROVE: NO_HEART_RATE_GUIDANCE | Fixed fractions are not individual thresholds. |
| HR5-6 5K / 10K / strides | APPROVE: NO_HEART_RATE_GUIDANCE | Heart rate lags short hard bouts: time-in-zone underrepresents hard work, and HR is useful only in bouts over ~4 min. |
| HR5-6 RACE / RACE_TOUCH | APPROVE: NO_HEART_RATE_GUIDANCE | Race HR runs ~20 bpm higher at the same speed. |
| HR5-6 Walk families, modes, hold, no zones | APPROVE: NONE | Each has a typed reason, consistent with Q9. |
| HR5-6 Unknown family | APPROVE: NO_HEART_RATE_GUIDANCE | Fails closed. |
| HR5-6 RPE conflict / novices | APPROVE / APPROVE_WITH_CONDITIONS | Effort governs. Novices get the same rules, plus a newer-runner disclosure. |
| HR5-6 HR primary anywhere in V1 | REFUSE | V1 has no individually measured, reviewed thresholds. |
| HR5-7 Time in zone | APPROVE_WITH_CONDITIONS | UNAVAILABLE / NO_HEART_RATE_SERIES_IN_CONTRACT. Never derived from an average. Future conditions: qualifying sensor only, gaps counted as unknown (never interpolated), coverage reported, never used for adherence or quality judgments. |
| HR5-8 Updating | APPROVE_WITH_CONDITIONS | Changes only at a week boundary. Withdrawn under Q9. The highest qualifying observed value within 365 days is used; a lab value lasts 182 days. Conflicts are re-evaluated weekly. |

**Final zones** (fractions of the reference maximum): Z1 below 0.72 (LOW), Z2 0.72–0.80 (LOW), Z3 0.80–0.87 (MODERATE), Z4 0.87–0.92 (HIGH), Z5 from 0.92 (HIGH). For a reference of 190 bpm, the boundaries are 137 / 152 / 165 / 175.

## Abstentions

- No heart-rate targets and no heart rate as primary guidance (Q6 kept).
- No Z3 cue for recovery families.
- No novice-specific ceiling.
- No ceiling cue in threshold or race-specific work.
- Supplied lab thresholds are not mapped into zones.
- No numeric coverage, plausibility or warm-up rule for a future classifier.
- No HRmax-reliability basis for the band (the search for one came back negative).

## Escalations

- **Chief:** draft implementation files appeared in the worktree during this run. They were not inputs and must be reconciled to these values before the independent review.
- **Data / Engineering:** how a lab test declares running modality and sensor using existing inputs, with no frozen-byte or shared-contract change. If that is not possible, the lab tier stays off.
- **Product:** all copy. No "Olympiatoppen zones" naming, no health meaning, and one consistent cue per session alongside the three-zone text.
- **Security:** heart-rate and lab values are health-adjacent data.
- **Clinical owner:** medication or conditions that alter heart rate. This is ASK / ELIGIBILITY_UNASSESSED and not decided here. Symptoms stay on the existing warning-sign route.

**Queue.** Proposed only, not appended: HQ-V1HR5-SSCTR-ZONES, linked to HQ-V1RC-SSCTR-HR.

**Expiry.** 2027-05-11, aligned with SSCTR-V1RC-DECISION-r1. It expires earlier on any revision of Q6 or Q9, a new review on heart-rate zones in recreational runners, a heart-rate series or measured thresholds entering the contract, a population or session-family change, a revision of the Olympiatoppen scale, real data or an adverse event, or the Founder's funding declaration.
