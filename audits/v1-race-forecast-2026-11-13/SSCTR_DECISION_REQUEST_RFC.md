# SSCTR decision request: V1 Race Forecast + Pace Insights (RFC, 2026-11-13)

**Requested by:** Chief (Founder mission of 2026-11-13, "Race Time Forecasting + Pace Insights"). **Branch/worktree:** `claude/v1-race-forecast`, `.claude/worktrees/v1-race-forecast`, from `c8104c1` (COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1, verified 30/30, V1 198/198).
**Scope:** specification only. No code, no freeze, no Figma, no queue append. Synthetic data only. Nonclinical recreational adults, as the R6 policy and V1RC.

## 1. Why this needs a new sporting decision

The Founder approved, as a V1 requirement, a **future race forecast** (a plausible time range for the plan's race on its date, conditioned on history, plan and observed response) and **Pace Insights** (consistent evidence of improvement, stability or regression in comparable sessions, able to suggest recalibration, with no autonomous authority over the plan).

Your predecessor rulings that this request touches (read them; do not redo their research):
- `audits/coachingcore-v1-run-calibration-2026-11-11/ssctr-decision/SSCTR_V1RC_DECISION.json` Q7: **"There is no future projection"**; the abstention reads "No individually validated improvement model exists for this population inside V1". The runtime returns `projection: UNAVAILABLE / NO_VALIDATED_PROJECTION_MODEL`.
- Same record, Q3 (power law k ranges and population 27–75 min 10K-equivalent), Q7 gates (10K 40 min run, half 60/75 min, marathon only from a current half or longer inside the marathon block), Q8 (training factor: up +1.5 %/step, cap +4.5 %, never changes an estimate; down −2 %/step, cap −6 %, also slows half/marathon estimates), Q9 withdrawal, and the recheck's R-11 (no marathon central above 6:00:00).
- `CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json` `productMustNot`: "Claim injury prevention, readiness, **finish time or fitness gain**". The formal Founder/PCG reading of that rule is a governance item, not yours; give your sporting opinion only.

The Founder's new direction does not by itself make a projection valid. Your job is to say whether a **bounded, conditional, honestly-uncertain** forecast is sportingly defensible, and with which values, or to refuse parts of it with reasons.

## 2. The proposed model (engineering proposal; the numbers are yours to rule)

Everything is additive over the frozen V1RC output; no V1RC value, gate or behaviour changes.

**Start point.** The V1RC **current estimate** of the plan's event distance (range `[low_E, central_E, high_E]`, already including the k-range, margin and Q8 down-adjustment). No forecast where that estimate is UNAVAILABLE.

**Trajectory.** A saturating, adherence-weighted improvement ceiling in log time, anchored at the plan start:

```
Γ(t)       = G_x · (1 − exp(−H_eff(t) / τ))                 cumulative plausible gain (log of time) at full response
H_eff(t)   = Σ f(a_w) over plan weeks from plan start to t, excluding TAPER, RACE_WEEK, POST_EVENT, hold,
             WALK_JOG / RESTART / RETURN weeks (0), and weeks before the plan (0: unknown training earns nothing)
a_w        = Σ_run sessions (completed ? planned min : min(actual, planned)) / Σ planned min   (missing report = 0)
f(a)       = 0 if a < a_min;  (a − a_min)/(a_full − a_min) if a_min ≤ a < a_full;  1 if a ≥ a_full
future a   = mean a_w of the last ≤ 4 completed plan weeks; with none yet, assumed 1 and flagged ASSUMES_PLAN_FOLLOWED
g_future   = Γ(race week start) − Γ(reference date)          the gain not yet in the current estimate
```

**Response multiplier R ∈ [0, 1]** (fraction of the ceiling this athlete realises). Prior: central `R_c0`, interval `[0, 1]`. Updated only from pairs of consecutive V1RC capacity references (qualifying race, test or time trial, as V1RC already selects them) at least `minPairDays` apart:

```
R_obs  = ln(T10_A / T10_B) / (Γ(t_B) − Γ(t_A))          only when Γ(t_B) − Γ(t_A) ≥ ΔΓ_min
var    = (σ_A² + σ_B²) / (Γ(t_B) − Γ(t_A))²,   σ = V1RC margin of the reference tier / 1.2816
R_c    = (R_c0/s0² + R_obs/var) / (1/s0² + 1/var),  sd = (1/s0² + 1/var)^(−1/2)   (sequential over pairs)
R_lo   = max(0, R_c − 1.2816·sd),  R_hi = min(1, R_c + 1.2816·sd)
```

A slower later reference gives R_obs ≤ 0 and drives R toward 0: plateau or regression is represented as "no further gain expected", and the slower level itself is already in the V1RC current estimate.

**Forecast range** (an envelope, not a calibrated probability):

```
central_F = central_E · exp(−R_c  · g_future)
low_F     = low_E     · exp(−R_hi · g_future)      fast edge
high_F    = high_E    · exp(−R_lo · g_future)      slow edge; with no individual data R_lo = 0: the slow edge assumes NO improvement
```

Rounded outward as V1RC. Shown only if `high_F / low_F − 1 ≤ W_max[event]`; otherwise `TOO_UNCERTAIN_TO_SHOW` with the current estimate only. Confidence label never above MODERATE in V1 (no empirical calibration exists).

**Not used:** the athlete's goal (compared with the range, never evidence), easy-run pace, heart rate, training-derived Q8 up-factors (V1RC says they never change an estimate), any population model.

**Pace Insights** (separate component, explanation and suggestion only):
- Per harder domain, comparable executions in a 42-day window: V1RC `comparableRun` (no HEAT/HILLY/TRAIL/WIND_STRONG, no treadmill, GPS not poor), completed, RPE inside the cue, every work bout ≥ 5 min (Q8's rule). Each is classed FASTER / INSIDE / SLOWER against the band in force in its own week, with V1RC's 1.5 % trigger.
- An execution further than `max(3·MAD, 3 %)` from the median is EXCEPTIONAL: shown, never voted.
- With ≥ 3 non-exceptional executions spanning ≥ 14 days: IMPROVING (≥ 2/3 FASTER, the latest included), SLOWER_THAN_BAND (≥ 2/3 SLOWER), STABLE (majority INSIDE), else MIXED; below that, INSUFFICIENT_DATA.
- Actions: where Q8 still has room in that domain, "the existing weekly rule adjusts the band" (explain only). Where it does not (5K/10K domains, or factor at +4.5 %), **suggest the V1RC field test** if V1RC offers one, otherwise suggest reporting a race. Accepting is the athlete's choice and runs the existing P3 flow; only a new qualifying result changes capacity. SLOWER_THAN_BAND: "effort governs, slow to the cue"; Q8 down is the existing response. Easy runs faster at RPE ≤ 4: informative only, never a suggestion (V1RC: nothing harder from easy running). Short reps (< 5 min, e.g. 400/800 m): informative only.
- Computed at the week boundary; nothing changes inside a week.

## 3. Questions

Rule each with APPROVE / APPROVE_WITH_CONDITIONS / MODIFY (give the value) / REFUSE (give the reason), and mark what is literature-supported, sporting judgement, or left for empirical calibration.

**F1. Admissibility.** Is a forecast framed as above (conditional on continued training at the observed adherence; slow edge = no further improvement; fast edge = an experience-bounded ceiling; range first, never a promise; LOW/MODERATE only) sportingly defensible inside V1, given your predecessor's abstention? If only for some events or experience classes, say which.

**F2. Ceilings and time constant.** Proposed `G_x` (log-time gain of 10K-equivalent over a block at full adherence and R = 1): NOVICE 0.08, INTERMEDIATE 0.05, EXPERIENCED 0.03; `NONE` and walk/jog athletes: no forecast; unknown experience uses EXPERIENCED. `τ` = 10 weeks. Distance modifiers for half and marathon: none proposed (endurance gains are covered by V1RC's gates and the long-run assumption). Rule each value.

**F3. Response prior.** `R_c0` = 0.5, `s0` = 0.3, `minPairDays` = 28, `ΔΓ_min` = 0.005. Rule each.

**F4. Adherence.** `a_min` = 0.5, `a_full` = 0.9; missing reports count 0 (cf. DR-149: absence is not intolerance but cannot justify a progression); pre-plan weeks earn nothing; future adherence = mean of the last ≤ 4 weeks, or assumed 1 with a flag before any week. Rule.

**F5. Taper.** No taper benefit is added (the forecast for race day uses the same Γ, with taper and race weeks earning nothing). Literature reports a performance benefit of tapering; is leaving it out the right V1 choice?

**F6. Horizon and events.** Forecast only for the plan's own event, on its date, when the race is ≤ 26 weeks ahead; at horizon 0 the forecast equals the current estimate. Marathon: every V1RC marathon gate, the block's "assumes long runs completed", R-11 applied to the forecast central, and the fast edge never faster than the V1RC current-estimate low edge × exp(−G_x)? Rule, and say whether 5K/10K/half need any extra gate.

**F7. Display width.** `W_max`: 5K 0.12, 10K 0.12, half 0.15, marathon 0.18. Rule.

**F8. Withdrawal.** No forecast and no insight when V1RC withholds (hold, break ≥ 14 days, walk/jog/restart/return, warning-sign screen required), on a completion race, after the race date, or when the event's V1RC estimate is unavailable. Anything to add?

**F9. Pace Insights.** Rule the comparability rules, the thresholds (3 executions, 14 days, 42 days, 2/3, EXCEPTIONAL rule), the actions, and specifically: **may a confirmed insight change capacity without a test in V1?** Proposed: no; the only route to a capacity change stays a qualifying result (test or race). Should SLOWER_THAN_BAND with harder-than-cue efforts say anything beyond "slow to the cue" (no clinical inference)?

**F10. Heart rate.** Proposed: no heart-rate input to the forecast or the insights in V1 (V1RC zones stay display-only). Rule.

**F11. Wording.** Sporting opinion on: "Forecast for ‹race› on ‹date›, if you keep training as you have: ‹low›–‹high›. Not a promise." against the catalog's "finish time or fitness gain" rule (the formal reading is Founder/PCG).

**F12. Worked examples.** Give at least four worked examples the implementation must reproduce to the second: (a) intermediate, 10K HIGH reference, 12 weeks to race, no individual data, adherence 0.95; (b) same, adherence 0.6; (c) novice, two 5K tests 6 weeks apart showing improvement, 8 weeks to a 10K; (d) half-marathon athlete whose second reference is 2 % slower; (e) a marathon case that passes or fails F6.

## 4. Output

Write, in `audits/v1-race-forecast-2026-11-13/ssctr/`:
- `SSCTR_RFC_DECISION.json`: `rulings` (F1–F12), `values` (every number the runtime reads, in one object the implementation copies verbatim), `workedExamples`, `abstentions`, `conditions`, `escalations`, `literature` (what you read, with access level), `queueProposals` (proposed only; the queue stays at 235), `expiry`.
- `SSCTR_RFC_DECISION.md`: a short human summary.

Do not edit anything else. Do not run `npm run verify` or any `verify-r*` script. No recursive deletion: if you need scratch space, create a new uniquely named directory under your scratchpad.
