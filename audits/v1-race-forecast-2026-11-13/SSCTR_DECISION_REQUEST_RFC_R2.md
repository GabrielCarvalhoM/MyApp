# SSCTR amendment request: RFC r2 (Race Forecast + Pace Insights, 2026-11-13)

**Requested by:** Chief, on the Founder's closure brief for handoff r3. **In force:** `ssctr/SSCTR_RFC_DECISION.json` (SSCTR-RFC-DECISION-r1, sha256 `1d032c40…6e72`). It stays as history, unedited. This request asks only about the material changes below; everything else in r1 stands.
**Scope:** specification only, synthetic data, nonclinical recreational adults. No code, no CoachingCore change, no queue append.

Read: r1 (decision + worked examples), `HANDOFF_RACE_FORECAST.md` (r2), and for A6 the RWS completion contract summarised below. Do not repeat research already in r1 or V1RC.

## A1. Temporal accounting (erratum, more conservative)

Decomposition used in r3, with t_ref = current reference date, t_now = start of the week in force, t_RW = start of RACE_WEEK:

```
observed gain  O = ln(T10_A / T10_B)           already inside the V1RC current estimate (B); never added again
unobserved     U = Γ(t_now) − Γ(t_ref)          executed weeks after the reference, at observed adherence; not measured
future         F = Γ(t_RW)  − Γ(t_now)          weeks to come, at assumed adherence
g = U + F = Γ(t_RW) − Γ(t_ref)                  (r1 formula; no overlap with O)
```

Chief's check (intermediate, f = 1): old pre-plan reference at week 5 (example a): U 0.01648 + F 0.02119 = 0.03767; reference at the end of week 6, now week 7: U 0, F 0.01511; same reference, now week 10: U 0.00711 + F 0.00800 = 0.01511 (g invariant when adherence equals the assumption). **No double counting of training reflected in the reference**, except one case: r1 credits a week only when "its last day is on or before" the evaluation date, so a reference dated mid-week leaves that week uncredited at t_ref and credited later, counting as future gain the part of the week already inside the result. Overcount ≤ one week: up to 0.0076 (novice), 0.0048 (intermediate), 0.0029 (experienced) in log time.
**Proposed:** Γ(t_ref) credits the week that contains the reference date (that week counts as observed; undercount ≤ one week instead of overcount). The same rule applies to Γ(t_A), Γ(t_B) of the response pair. All r1 worked examples are unchanged (their references are pre-plan or on a week's last day). Confirm.

## A2. Plan scenario versus observed forecast; statistical reading

The Founder asks to separate a scenario conditioned on following the plan from an individual forecast based on observed behaviour, and not to present the envelope as probabilistic.
**Proposed:**
- `planScenario`: past weeks at observed adherence, every future counted week at a = 1. Always computed when the forecast is eligible. Wording: "If you follow the plan from now on: ‹low›–‹high›. The slower end assumes no further improvement. Not a promise."
- `observedForecast`: future a = mean of the last ≤ 4 counted weeks, as r1, but only after **2** completed counted weeks (r1: 1). Before that: `UNAVAILABLE: NOT_ENOUGH_HISTORY`, and only the scenario exists.
- When observed f(ā) = 1 the two coincide and only one is shown.
- Every range carries `interval: {kind: PLAUSIBILITY_ENVELOPE, probabilistic: false, calibrated: false}`; z = 1.2816 is a spread constant, never shown as a coverage percentage.
Rule on the scenario's admissibility once history exists (its past is factual, its future assumed), on the 2-week threshold, and on the labelling.

## A3. Pace Insights: an athlete-confirmed pace revision without a test or race

r1 F9: no capacity change without a qualifying test or race. The Founder asks whether several comparable sessions can support a **safe suggestion to revise paces, confirmed by the athlete**, without an official race; no automatic change of capacity, progression or training. If you keep the restriction, say so; the Chief will record the gap between the desired and the sustained V1 capability.
**Proposed option B (`ATHLETE_CONFIRMED_PACE_REVISION`):**
- Offered only for a harder domain whose state is IMPROVING (r1 rules) **and** where the existing rule has no room: Q8 domains with the factor at +4.5 %, or FIVE_K/TEN_K domains (which V1RC never adjusts from training). Every voting execution TRACK or GPS-good, RPE inside the cue, not after an adverse or harder-than-cue response.
- Step: min(median FASTER margin, 2 %) per confirmation; total revision ≤ +3 % over the V1RC band in force (Q8 included); at most one per domain per 28 days; effective at the next week boundary.
- Ends at once on: a new V1RC reference (real evidence supersedes it), hold, break ≥ 7 days, walk/jog/restart/return, SLOWER_THAN_BAND or a Q8 down step in that domain, the athlete revoking it; and lapses after 56 days without a new confirming IMPROVING state.
- Changes only that domain's pace band as shown (fast and slow edges by the same factor). Never capacity, estimates, the forecast, tests, goal comparison, dose, progression, phase or eligibility. Effort governs as always.
- Integration: one band source, `effectiveBand(d) = V1RC band × (1 − revision)` in pace terms; the RWS format selector reads the effective band, so a distance-native rep may get longer for the same planned minutes, with the RWS envelope checks E1–E4 unchanged.
- Sub-question: FIVE_K/TEN_K sessions are mostly short reps; may reps ≥ 3 min on TRACK or GPS-good vote in those two domains (r1: ≥ 5 min)?
Rule: admissible as proposed, modified (values), or refused with reasons.

## A4. Race week

r1: from RACE_WEEK only the V1RC current estimate. **Proposed:** in RACE_WEEK also show the **last valid forecast**, the one computed for the last week before RACE_WEEK, frozen and labelled "forecast of ‹date›", never recomputed, no gain added; never a pacing source (race-day pacing stays the V1RC reference and caution); not shown if any withdrawal applies or it was not SHOWN then. Rule.

## A5. Goal and the forecast range

r1 F11: the goal is compared only with the current estimate. **Proposed:** also a positional relation of the goal to the forecast range: `FASTER_THAN_RANGE`, `INSIDE_RANGE`, `SLOWER_THAN_RANGE`, against [low, high] only (never the central), neutral text ("Your goal ‹time› is faster than / within / slower than the forecast range"), never "on track", "achievable" or "likely"; the goal is never evidence and changes nothing. Only when the forecast is SHOWN. Rule.

## A6. Adherence under distance-native completion (RWS)

The RWS mission (other worktree, not final) makes the **distance the completion criterion** of a distance-target session: 16 km done = completed, whatever the minutes; estimated minutes never stand in for it. r1's `min(actual, planned minutes)` would then misread: a slower runner who stops at 12 of 16 km may still log ≥ planned minutes (credit 1.0), and a faster one is never short. **Proposed per-session credit c ∈ [0, 1]:**
- `actual.completed === true` (the engine's reading, which the RWS amendment sets by target): c = 1, minutes ignored.
- Not completed, with RWS steps: c = Σ w_s·m_s / Σ w_s over WORK and STEADY steps, w_s = the step's planning share (target seconds for a TIME step, the midpoint of its estimated seconds for a DISTANCE step), m_s = 1 if `targetMet === true`, 0 if false; a continuous DISTANCE step not met: m_s = min(1, measured metres / target metres).
- Not completed, no RWS data: c = min(actual, planned minutes) / planned (r1).
- Missing report: 0 (r1). a_w = Σ planned minutes · c / Σ planned minutes.
Rule on the sporting reading of partial credit by distance.

## A7. For information (no ruling needed unless you object)

Marathon: shown as the current marathon estimate with r1's marathon text, never labelled a forecast. Plans longer than 16 weeks: `NOT_YET_IN_WINDOW` with `availableFrom` = race date − 112 days, the current estimate meanwhile. Unavailable or too-uncertain states name what would make a forecast possible, using only existing V1RC routes (a test only when V1RC offers one).

## Output

In `audits/v1-race-forecast-2026-11-13/ssctr/`:
- `SSCTR_RFC_DECISION_R2.json`: `amends` (r1 id and sha), `rulings` A1–A7, **`values` = the full consolidated values** (r1 values with these amendments applied, one object the implementation copies verbatim), `workedExamples` (r1's that still hold, by reference or copy, plus new ones for A2, A3, A4, A5, A6, each reproducible to the second), `conditions`, `abstentions`, `escalations`, `queueProposals` (proposed only), `expiry`.
- `SSCTR_RFC_DECISION_R2.md`: short summary.

Do not edit r1 or any other file. Do not commit, do not run `npm run verify` or `verify-r*`. No recursive deletion; scratch work in a new uniquely named directory under your scratchpad.
