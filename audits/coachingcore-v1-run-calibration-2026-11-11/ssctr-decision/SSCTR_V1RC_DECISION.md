# SSCTR-V1RC-DECISION-r1: V1 Run Calibration Extension (2026-11-11)

`SSCTR_V1RC_DECISION.json` is the authoritative record. Every number the runtime needs is under `values`, and `values.workedExamples` gives reference outputs to test against.

**Author.** An AI instance of the SSCTR acting as decision author, under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for nonclinical sporting content only. It holds no human credentials, and this record is neither human, clinical nor empirical validation. It does not enable any boundary and does not judge the implementation; a fresh SSCTR instance does that. No frozen record changes.

**Literature access.** I used the Europe PMC REST API. I read the relevant passages in the full texts of Vickers 2016, Blythe 2016 and Emig 2020. The other 22 sources were read as abstracts only. Riegel 1981 was not available. Python is not installed, so the skill validator did not run. Node confirmed the JSON parses.

## Rulings

| Q | Ruling | What changed from the proposal |
|---|---|---|
| Q1 Evidence | APPROVE_WITH_CONDITIONS | GPS evidence drops one tier, manual or treadmill evidence two. Evidence ages after 112 days, not 182. An unknown effort drops one tier. |
| Q2 Conflict | APPROVE_WITH_CONDITIONS | 28 days and 3% kept: in a conflict the slower result wins and the tier drops. Marathons are compared only with marathons. |
| Q3 Model | APPROVE_WITH_CONDITIONS | k is 1.04 / **1.07** / **1.12** up to the half marathon. For the marathon, k is **1.08 / 1.13 / 1.20**, used only upward from a half marathon or longer. A marathon result is never converted down. The model covers 10 km-equivalent times of 27 to 75 min, with +1% margin at 60 min or slower. |
| Q4 Bands | APPROVE_WITH_CONDITIONS | 5 km, 10 km, half and marathon bands come from the athlete's **own race-pace estimate**, not fixed durations. Threshold v(55)–v(75) is kept. Easy, long and recovery fractions are kept as ceilings only. Margins are **2.5 / 4 / 6%**. Both edges round to the slower 5 s/km. There is no "moderate continuous" band. |
| Q5 Assessment | APPROVE_WITH_CONDITIONS | P1 needs an RPE report and uses the median pace. P2 applies only when there is no reference. P3 needs one executed harder session, and novices may take only the 3 km. The cue is **about 8 of 10** (was 8–9), never all-out. |
| Q6 Heart rate | APPROVE_WITH_CONDITIONS | Chest strap only, from an effort reported at RPE 8 or higher. The zones (0.80 / 0.87) are a **display-only** reference: never a target or a gate, and they can only suggest slowing down. No age formula. |
| Q7 Estimates | APPROVE_WITH_CONDITIONS | New gates: a 10 km estimate needs a 40 min run; a half needs a 60 min run, or 75 min from evidence under 10 km. The **marathon** estimate needs a CURRENT half-marathon or marathon result plus block eligibility, and is withdrawn on a completion race day. There is no future projection. In my sporting opinion the "not a promise" wording is compatible with the finish-time rule. |
| Q8 Recalibration | APPROVE_WITH_CONDITIONS | Only threshold, half and marathon sessions (work bouts of 5 min or more) can adjust a band, through a per-domain factor. Up 1.5% a step, 4.5% in total, and never changing an estimate. Down 2% a step, 6% in total, after which the band is withdrawn. Easy runs only feed P1. |
| Q9 Withdrawal | APPROVE_WITH_CONDITIONS | A break of 14 days or more, a hold, or the walk/jog, restart or return modes withdraw everything, heart-rate zones included. A break of 7–13 days drops one tier. |
| Q10 Limits | APPROVE (a, c, d); APPROVE_WITH_CONDITIONS (b) | Novices get no 5 km test. |
| Q11 Fatigue | Opinion: ACCEPTABLE_WITH_CONDITIONS | Only after a full screen with every answer no, never for illness or pain, and only as an offer. A repeat within 14 days, or a third report in 42 days, goes to the persistent-symptom route. Keeping C as it is would also be safe. |

**Abstentions.** No marathon estimate or band from a 5 km or 10 km result. No downward conversion of a marathon result. No future projection. No heart-rate targets. No moderate-continuous band. No training-based adjustment of the 5 km and 10 km bands.

**Escalations.**
- **Founder/PCG:** record the formal reading of the "finish time" product rule. This does not block the sporting values.
- **Founder:** the conservative choices listed in the JSON.
- **Product/Data:** the athlete-facing copy and the meaning of measurement sources and condition flags.
- **Security:** heart-rate and lab data.
- **Clinical:** symptoms stay on the existing route.

**Queue.** Proposed only, not appended: HQ-V1RC-SSCTR-CAP, -PACE, -HR and -EST. **Expiry:** 2027-05-11, or earlier on any trigger listed in the JSON.
