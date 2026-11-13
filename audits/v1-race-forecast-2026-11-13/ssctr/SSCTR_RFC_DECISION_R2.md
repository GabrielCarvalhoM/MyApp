# SSCTR-RFC-DECISION-r2: amendment to the Race Forecast + Pace Insights decision (2026-11-13)

`SSCTR_RFC_DECISION_R2.json` is the authoritative record. Its `values` object is the full consolidated set: r1 with these amendments applied, for the implementation to copy verbatim. `workedExamples` must be reproduced exactly.

**Amends** SSCTR-RFC-DECISION-r1 (sha256 `1d032c40…6e72`). r1 stays as history, unedited, and everything it says that is not amended here still stands.

**Author.** A fresh AI instance of the SSCTR (not the r1 author), acting under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY for nonclinical sporting content only.
- No human credentials.
- Not human, clinical or empirical validation.
- It does not judge its own amendments: a fresh SSCTR instance judges the implementation.
- No V1RC value, file or computation changes.

**Literature access.** I used the Europe PMC REST API, reading abstracts only, and only for A3: RFC18–RFC20, with V1RC SRC06 and SRC22 re-read. Every other source is cited as settled from r1 or V1RC. Negative searches are logged in the JSON. The skill validator did not run because Python is not installed; Node confirmed that the JSON parses.

## Rulings

| Item | Disposition | What changes |
|---|---|---|
| A1 Temporal accounting | **APPROVE** (erratum confirmed) | At a reference date, Γ credits the week that contains it. At a week start, Γ credits only the weeks already finished. The same rule applies to both points of the response pair. All ten r1 examples recompute identically. A1-1 shows the r1 rule's over-fast central (1:52:00 against 1:53:00). |
| A2 Scenario vs observed | **APPROVE_WITH_CONDITIONS** | `planScenario` is always computed. `observedForecast` appears from **2** completed counted weeks. When the two coincide, one range is shown. When both are shown, the observed forecast comes first. Every range is labelled `PLAUSIBILITY_ENVELOPE`, probabilistic false, calibrated false, and z is never shown. The flag `ASSUMES_PLAN_FOLLOWED` is retired. |
| A3 Pace revision without a test | **MODIFY** | Approved only for **THRESHOLD_CONTROLLED**, and conditional on escalation E1 (details below). **Refused** for the 5K, 10K, half-marathon and marathon race-pace domains. **Refused** for the sub-question: reps of 3 min or more do not vote, and the 5-min rule stays. |
| A4 Race week | **APPROVE_WITH_CONDITIONS** (modified) | The observed forecast from the week before RACE_WEEK may be shown frozen: range only, no central, dated, after the V1RC estimate and its pacing caution. It is never shown on race day and never comes with a goal relation. It is hidden after any withdrawal, any reference or tier change, a new Q8 down factor, or g = 0. |
| A5 Goal vs range | **APPROVE_WITH_CONDITIONS** (opinion) | The relation is computed per shown range, against the rounded low and high (inclusive). The V1RC goal-vs-estimate comparison stays first. No relation in race week or for the marathon. No success or failure styling. |
| A6 Adherence, distance completion | **APPROVE_WITH_CONDITIONS / MODIFY** | Completed sessions get credit 1. Unfinished sessions with RWS steps are credited by extent over their WORK and STEADY steps: an unfinished repetition counts 0, and an unfinished continuous TIME or DISTANCE step counts its measured fraction. Without steps, a recorded distance fraction is used, then minutes. Credit counts extent only, never intensity. |
| A7 Information | **NO_OBJECTION** (3 precisions) | The marathon shows the current estimate only: no scenario, no frozen forecast, no goal relation. `NOT_YET_IN_WINDOW` is the single status name, with `availableFrom` = the first week start on or after race − 112 days (example i: 2027-03-08). Guidance never asks for a longer run, more training, a race entry, or a test that P3 does not offer. |

**Threshold revision (A3).**
- **Step:** min(median in-cue margin, 2 %) per athlete confirmation; at most 3 % in total over the V1RC band in force, Q8 factor included.
- **Pace:** at most one step per 28 days; offered only when the Q8 factor is at its cap; voting sessions are TRACK or GPS-good with long bouts.
- **Ends at once** on any harder-than-cue session in the domain, among other signals. Not in TAPER or RACE_WEEK. Lapses after 56 days.
- **Changes only** the threshold band and its RWS conversion.

**Why the race-pace domains are refused.** Their bands are race paces, used for race-pace touches and close to race-day pacing, so a training-only revision would make the costly fast-start error more likely. In 5K and 10K reps, pace above critical speed depends on D′ and on the recovery between reps, so it is not a reading of capacity.

## New worked examples

| Id | Result |
|---|---|
| A1-1 | 1:46:00–2:01:00, central 1:53:00. The r1 rule would give a 1:52:00 central. |
| A1-2 | Pair with A mid-week in week 1. R_c 0.53221. TOO_UNCERTAIN (15.5 %). |
| A2-1 | Week 2: plan scenario only, 23:45–25:45. Observed forecast NOT_ENOUGH_HISTORY. |
| A2-2 | Week 3: plan scenario 23:45–25:45; observed forecast 24:00–25:45. |
| A2-3 | Plan scenario 47:15–51:15; observed forecast (mean a 0.6875) 47:30–51:15. |
| b | Observed forecast 48:00–51:15 (r1 unchanged); plan scenario 47:15–51:15. |
| A4-1 | Frozen "Forecast of 2027-04-12": 47:00–51:15, shown 2027-04-19 to 2027-04-24. |
| A4-2 | NOT_SHOWN after a new reference. |
| A4-3 | NOT_SHOWN after TOO_UNCERTAIN. |
| A5 | (a): 46:30 FASTER, 49:00 INSIDE, 52:00 SLOWER. (b): 47:30 is INSIDE the plan scenario but FASTER than the observed forecast. |
| PR-1 | Threshold band 300–320 s/km (Q8 at cap). Step 2 % gives 295–315 from week 10. The second step is limited to 1 % and is absorbed by rounding. Ends on 2027-04-21 on an RPE 8 session. |
| PR-2, PR-3 | 10K and half: no revision. |
| AD-1 | Weekly adherence a 0.8172, f 0.79301. The r1 reading would give 0.98387 and f 1, because it credited a 16 km run stopped at 12 km in full. |

## Needs the Founder or Chief

- **E1 (Chief, then the Founder if needed):** A3 supersedes the V1RC limit "4.5 % without a confirming race or test", for the threshold band only, in an additive layer. Without this record, A3 = REFUSE.
- **E2:** record the remaining capability gap for the 5K, 10K, half-marathon and marathon bands.
- **E3 (Founder/PCG):** the r1 C4 reading is still open. It now also covers the plan scenario, the race-week frozen forecast and the goal relation.
- **E4 (Product/Data) and E5 (Engineering):** copy, `targetMet` semantics, the RWS dependency, and the status rename.

## Queue and expiry

**Queue.** Proposed only, not appended: HQ-RFC-SSCTR-FORECAST-R2 and HQ-RFC-SSCTR-PACE-REVISION.

**Review by:** 2027-05-13, or earlier on the r1 triggers, the final RWS contract, the first real revision data, or the decision on E1.
