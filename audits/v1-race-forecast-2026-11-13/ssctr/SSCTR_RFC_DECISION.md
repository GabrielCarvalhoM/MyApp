# SSCTR-RFC-DECISION-r1: V1 Race Forecast + Pace Insights (2026-11-13)

`SSCTR_RFC_DECISION.json` is the authoritative record. Every number the runtime reads is under `values`. `workedExamples` holds the reference outputs, which must be reproduced to the second.

**Author.** An AI instance of the SSCTR, acting as decision author under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. Its scope is nonclinical sporting content only. It holds no human credentials. This record is not human validation, not clinical validation and not empirical validation: AI review is not empirical validation. It does not judge the implementation; a fresh SSCTR instance does that. It changes no frozen record, and no V1RC value, gate or behaviour changes.

**Overall disposition: APPROVE_WITH_CONDITIONS, as an explicitly reversible, limited scenario. This is not a prediction model.**
- **Allowed:** a forecast for the 5K, 10K and half marathon, for NOVICE, INTERMEDIATE and EXPERIENCED athletes.
- **Marathon:** MODIFIED. No training gain is added, so the "forecast" is the current V1RC estimate unchanged.
- **Refused:** experience NONE, and the walk/jog, restart and return modes.

The predecessor's abstention still stands: no individually validated improvement model exists. The forecast is admissible only because of four limits:
- Its **slow edge is always the current estimate**, so it never claims a gain.
- Its **fast edge is a fixed ceiling**, scaled by observed adherence.
- It is **withheld** when it is too wide, too far ahead, in race week, after a slowdown, or whenever V1RC withholds.
- It **never feeds** paces, tests, the goal comparison or the plan.

**Literature access.** I used the Europe PMC REST API.
- **Full text, relevant passages:** Vickers 2016 (re-opened), Nuuttila 2022, Wang 2023 (taper meta-analysis) and Smyth & Lawlor 2021.
- **Abstracts only:** 13 sources, among them Hellard 2006, whose body could not be retrieved.
- **Settled V1RC sources:** cited without being re-read.
- **Negative searches:** no study of running-performance gains in novices was found, and no real-world longitudinal improvement data either. Both searches are logged.
- **Validator:** Python is not installed, so the skill validator did not run. Node confirmed that the JSON parses.

## Rulings

| Q | Ruling | Key values / change |
|---|---|---|
| F1 Admissibility | APPROVE_WITH_CONDITIONS / MODIFY (marathon) / REFUSE (NONE, walk/jog) | Allowed only as a conditional range. Evidence: PLAUSIBLE_BUT_UNCERTAIN, confidence LOW |
| F2 Ceilings, τ | APPROVE; marathon gain 0 | G_x 0.08 / 0.05 / 0.03 are kept. Unknown experience uses EXPERIENCED. τ = 10 weeks. No half-marathon modifier. These are sporting judgement and placeholders. The central sits below the means of recreational trials (Nuuttila: −2.9 % ± 2.4 % over 12 weeks) |
| F3 Response prior | APPROVE values; MODIFY structure | R_c0 = 0.5, s0 = 0.3, 28 days and ΔΓ 0.005 are kept. **The slow edge always uses R = 0**: the proposal's R_lo came out at 0.116, which contradicted its own text. R is updated from one endpoint pair of the same kind (race with race, test with test). R_c is clipped to [0, 1]. If the latest reference is **3 % or more slower**, g = 0 |
| F4 Adherence | APPROVE_WITH_CONDITIONS | a_min = 0.5 and a_full = 0.9. A missing report counts 0. Counted phases: ESTABLISHMENT, BUILD, CONSOLIDATION, DEVELOPMENT, SPECIFIC. Before any week is done: a = 1, flagged, with the wording "if you follow the plan" |
| F5 Taper | APPROVE (no taper bonus) | The benefit is real in trained athletes (about 3 %), but a bonus would double-count a rested reference race |
| F6 Horizon / events | MODIFY | Horizon is **16 weeks (112 days)**, not 26. **Nothing is shown from RACE_WEEK on**, which replaces "horizon 0" (the formula did not produce it). Marathon: no gain, plus every V1RC gate and R-11. A Q8 down factor in force sets g = 0 |
| F7 Width | APPROVE defaults + permitted band | Defaults: 5K 0.12, 10K 0.12, half 0.15, marathon 0.18. The Founder may raise them up to 0.18 / 0.18 / 0.20 / 0.20. The range is never narrowed to fit |
| F8 Withdrawal | APPROVE_WITH_CONDITIONS | Added: race week, beyond the horizon, the screen REQUIRED, the boundary off, experience NONE. Withdrawal applies at once; everything else changes only at the week boundary |
| F9 Pace Insights | APPROVE_WITH_CONDITIONS; MODIFY | The EXCEPTIONAL floor goes from **3 % to 5 %**, above GPS error. **No capacity change without a qualifying test or race.** Harder-than-cue sessions: a fact plus the V1RC factors only, never anything clinical |
| F10 Heart rate | APPROVE | No heart-rate input |
| F11 Wording | Opinion: ACCEPTABLE_WITH_CONDITIONS | Add "The slower end assumes no further improvement." Never "you will run", "on track" or a single time. The goal is compared only with the current estimate. The formal reading of the product rule belongs to Founder/PCG |
| F12 Examples | PROVIDED | (a) 47:00–51:15 · (b) 48:00–51:15 · (c) TOO_UNCERTAIN (15.5 %) · (d) 1:46:00–2:01:00 · (d2) no gain, 1:50:00–2:03:00 · (e1) 3:46:00–4:20:00, no gain · (e2) withheld under R-11 · (f) 23:45–25:45, flagged · (g) 42:15–47:00 · (h) TOO_UNCERTAIN (15.9 %), plus a horizon example, a race-week example and a Pace Insights example |

## Escalations

- **Founder/PCG:** record the formal reading of "claim … finish time or fitness gain". This blocks athlete-facing use, but not these values.
- **Founder:** three product choices within the sporting bounds:
  - whether to show a marathon "forecast" that equals the current estimate;
  - the width thresholds (at the defaults, forecasts from converted references are mostly TOO_UNCERTAIN);
  - plans longer than 16 weeks show the forecast only from 16 weeks out.
- **Product/Data:** final copy, and the meaning of the self-declared experience class, the completed flag, missing reports and reference kinds.
- **Engineering:** the proposal's inconsistencies, now corrected.
- **Clinical:** routes unchanged.

## Queue and expiry

**Queue.** Proposed only, not appended: HQ-RFC-SSCTR-FORECAST and HQ-RFC-SSCTR-INSIGHTS. The queue stays at 235.

**Review by:** 2027-05-13, or earlier on the first forecast-versus-actual race data or any other trigger listed in the JSON.
