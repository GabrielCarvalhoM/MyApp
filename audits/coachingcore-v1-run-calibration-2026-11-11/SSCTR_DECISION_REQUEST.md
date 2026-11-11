# V1 Run Calibration Extension: request for an SSCTR sporting decision (V1RC-SSCTR-DECISION)

**Mission:** CoachingCore V1 Run Calibration Extension (Founder request of 2026-11-11). Branch `claude/coachingcore-v1-run-calibration`, worktree `.claude/worktrees/v1-run-calibration`, from `981a8f6` (COACHINGCORE-V1-FREEZE-1, which stays untouched).
**Role asked:** SSCTR as decision author (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical sporting content only). A different, fresh SSCTR instance will judge the implemented candidate; this decision is not that judgment.
**Why:** the Founder requires V1 to say at what intensity and, when the evidence supports it, at what pace a run is done, and to give a defensible estimate of race performance with explicit uncertainty. Today the engine prescribes running by time and effort cue only, and the standing authority excludes the rest. Each new method and number needs your ruling.

## The standing authority this decision would bound

These records stay as they are (bytes frozen). The extension is an overlay with its own authority, enabled by an independent record, as V1X-EVENTS was.

| Record | What it says today | What is asked |
|---|---|---|
| Catalog R7B0-CATALOG-2 `LATER.RUN.PACE_ZONES_DE_NOVO` | "No approved pace-prediction or zone method" | Approve a bounded method (Q3, Q4, Q7) |
| Catalog `LATER.RUN.FITNESS_TEST_TIME_TRIAL` (R6-COLD-START) | "No fitness test or maximal effort; no measured threshold" | Approve an optional, eligibility-gated field assessment (Q5). Cold start stays test-free |
| Catalog `PACE_FROM_GOAL_OR_EASY_PACE`, `productMustNot` | A time goal or an easy pace never defines a training pace | **Kept.** Nothing here derives a pace from a goal, or a harder pace from easy running |
| `productMustNot`: "Claim ... finish time" | No finish time claimed | Rule whether a labelled estimate range is compatible (Q7). A promise stays forbidden |
| SSCTR-V1CP Q04 (performance anchors) | A recent race is one completed run of that duration, never a pace or a prediction | Rule that a qualifying result may be capacity evidence for this overlay (Q1). The base planner's reading of anchors does not change |
| ACF-G05 open portions | Generic HRmax zones, automatic race-distance conversion, first-ever threshold targets | Q3, Q4, Q6 |
| `FORBIDDEN_CLAIM` (B0 safety) | No text claims VO2max, LT2, MLSS, critical speed, lactate threshold | **Kept.** Bands are named by the engine's effort domains, never as measured thresholds |

## How the extension is built (so you rule on what will run)

- **Nothing in the planner changes.** Sessions, durations, ladders, gates, phases, taper, race day and every safety rule stay byte for byte. The extension adds a calibration record and, per planned run session, a guidance block beside the prescription. The effort cue remains the prescription. A pace band never changes a dose, a gate or a progression.
- **Derived from the record only.** Calibration is a pure function of the intake facts, the logged sessions and declared performance evidence. It changes only at a week boundary (the calibration for week *w* reads evidence dated before week *w* starts).
- **Fail closed.** Values live in `CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json`, pinned by hash. Each boundary below is on only with an independent SSCTR record bound to those bytes. Off means today's behaviour: effort only.
- **Boundaries:** `V1X-RUN-CAPACITY` (Q1, Q2, Q5, Q8, Q9), `V1X-RUN-PACE` (Q3, Q4), `V1X-RUN-HR` (Q6), `V1X-RUN-ESTIMATE` (Q3, Q7).
- During a clinical hold nothing is prescribed, so no guidance or estimate is shown either.

## Session families that exist (no new one is created)

WALK, WALK_JOG, EASY, LONG, RECOVERY_EASY, SHAKEOUT, THRESHOLD (3×5' to 3×10', 2' rec), FIVE_K_SPECIFIC, TEN_K_SPECIFIC, HALF_MARATHON_SPECIFIC, MARATHON_SPECIFIC, RACE_TOUCH, RACE, FAMILIAR_REPEATED_BOUTS, and optional strides inside easy runs.

Effort cues in force (policy and V1X-EVENTS): EASY_CONVERSATIONAL 2-4 of 10; MARATHON_EFFORT 5-6; THRESHOLD_CONTROLLED 6-7; HALF_MARATHON_EFFORT 6-7; TEN_K_EFFORT 7-8; FIVE_K_EFFORT 8; STRIDE_RELAXED_FAST about 7, never a sprint.

## Q1. Evidence of running capacity: kinds, quality, recency

Proposed kinds, kept distinct in the record and in every output:

| Kind | Meaning | Use |
|---|---|---|
| `RACE_RESULT` | A race run, with distance, time, date | Capacity evidence when it qualifies |
| `FIELD_TEST` | The engine's own protocol (Q5), done and reported | Capacity evidence when complete |
| `TIME_TRIAL` | A self-run hard effort over a measured distance, outside the protocol | Capacity evidence when it qualifies |
| `PERSONAL_BEST` | A declared best, dated or not | Historical best only. Never current capacity. A dated best inside the current window is read as the race result it is |
| `TRAINING_OBSERVATION` | A logged planned session with distance | Domain observation only (Q8) |
| `LAB_TEST` | Measured anchors supplied by the athlete | Heart-rate zones only (Q6) |
| derived | An estimate the engine computed | Always labelled estimated |
| presumed | Capacity carried from aged evidence | Labelled presumed, lower confidence |
| none | Not enough evidence | Effort only |

Proposed qualification of capacity evidence:
- Distance 3 km to 42.195 km, duration 10 to 360 minutes, completed, athlete reports it tolerated.
- Measurement: OFFICIAL, TRACK or GPS is measured; MANUAL or TREADMILL is lower quality (one confidence tier down).
- Recency, in days before the week being calibrated: **CURRENT up to 56**; **AGING 57 to 182**, usable only as presumed capacity (confidence LOW) and only with training continuity (no declared break of 14 days or more since, and the athlete is not in walk/jog, restart or return); **HISTORICAL beyond 182**, never capacity.
- An effort reported below hard (RPE 7 or less) on a test is read as a lower bound: usable, one tier down, flagged `SUBMAXIMAL_LOWER_BOUND`.

Confidence tiers: HIGH (current, measured, hard effort, no conflict), MODERATE (one tier down for any reason above), LOW (aged with continuity, or two reasons). Below LOW the capacity is unavailable.

## Q2. Contradictory results

Never the fastest automatically. Proposed rule: results are compared as equivalent speed at one common duration (Q3 model). The reference is the most recent qualifying CURRENT result. If another qualifying result dated within 28 days of it differs by more than 3%, the two conflict: the reference becomes the **slower** of the two, confidence drops one tier, and both stay in the record flagged `CONFLICTING_EVIDENCE`. A result more than 28 days older than the reference that differs is simply superseded (fitness may have changed).

## Q3. Conversion model and its limits

Proposed: Riegel's power law, T2 = T1 × (D2/D1)^k, used as a range, never a point.
- k central 1.06, range 1.04 to 1.10, for targets up to the half marathon.
- Marathon target: k range 1.06 to 1.15, central 1.10 (recreational runners finish slower than 1.06 predicts).
- Distance ratio between evidence and target at most 4.3 either way (5 km to half marathon and 10 km to marathon are inside; 5 km to marathon is outside).
- The model also gives the speed sustainable for a duration T, v(T), which Q4 uses.
- No VDOT table, no VO2max value and no threshold claim is produced.

Is a single power-law range acceptable for recreational adults from about 20 to 75 minutes over 10 km? State the population limits you require.

## Q4. Pace bands by effort domain

Each band is a range in seconds per kilometre, tied to the session's existing effort cue. Proposed derivation: every domain is a duration range on the athlete's own curve, so slower and faster runners get bands at the same relative intensity.

| Domain (families) | Proposed band, as speeds on the athlete's curve | Example when v(60 min) is 5:00/km |
|---|---|---|
| FIVE_K_EFFORT (FIVE_K_SPECIFIC, its race touch) | v(25 min) to v(15 min) | about 4:38 to 4:45 |
| TEN_K_EFFORT (TEN_K_SPECIFIC, its race touch) | v(45 min) to v(30 min) | about 4:48 to 4:55 |
| THRESHOLD_CONTROLLED (THRESHOLD) | v(75 min) to v(55 min) | about 4:59 to 5:04 |
| HALF_MARATHON_EFFORT (HALF_MARATHON_SPECIFIC, its race touch) | v(120 min) to v(80 min) | about 5:05 to 5:12 |
| MARATHON_EFFORT (MARATHON_SPECIFIC, its race touch); also the "moderate continuous" domain | v(240 min) to v(150 min) | about 5:16 to 5:24 |
| EASY (EASY) | 0.72 to 0.84 of v(60 min) | about 5:57 to 6:57 |
| LONG (LONG) | 0.70 to 0.82 of v(60 min) | about 6:06 to 7:09 |
| RECOVERY (RECOVERY_EASY, SHAKEOUT) | 0.66 to 0.78 of v(60 min) | about 6:25 to 7:35 |

Proposed rules:
1. **Effort governs.** The band is guidance bound to the cue. If holding the band needs more effort than the cue, the athlete slows; heat, hills, wind and fatigue are named.
2. **Easy, long and recovery bands are ceilings.** The fast edge is a limit; slower is always valid and the text never asks the athlete to speed up.
3. **Uncertainty slows and widens.** With confidence margin m (HIGH 1.5%, MODERATE 3%, LOW 5%), the fast edge is computed at speed × (1 − m) and the slow edge at speed × (1 − 2m). Edges are rounded outward to 5 s/km. Minimum width 10 s/km for harder domains and 30 s/km for easy domains.
4. **Race-pace reference.** An event-specific session also shows the current estimate of the athlete's race pace for that event (Q7) as a labelled reference, when available. It never replaces the domain band and never comes from the goal time.
5. **No band:** WALK and WALK_JOG (time and effort only); strides (too short for a pace reading, by feel); a completion race day; FAMILIAR_REPEATED_BOUTS (the athlete's own familiar target governs, as today); any session in walk/jog, restart or return mode.
6. **RACE (not completion):** the estimate range is shown as a reference only, with the existing text "no finish time is promised".
7. MARATHON_EFFORT and HALF_MARATHON_EFFORT bands need a reference whose evidence duration is at least 20 minutes; otherwise unavailable.

Rule on each row and each rule. Give the value if it must change.

## Q5. Field assessment, by experience

Never required. Declining keeps effort-only prescription with no penalty.

| Protocol | Who | What |
|---|---|---|
| **P0 LIGHT_START** | Absolute beginner; anyone in walk/jog, restart or return | The first planned session as it is. Records minutes done, walk breaks, effort 0-10, next-day response. Gives effort domains only: no pace reference, no estimate, no threshold language |
| **P1 EASY_PACE_OBSERVATION** | Anyone running continuously | Ordinary easy runs with distance recorded. After 3 qualifying runs in 28 days (20 minutes or more, effort easy or on target, RPE 4 or less when reported) the easy band is the athlete's own observed range, basis `OBSERVED_AT_EFFORT`. It calibrates the easy band only; nothing harder is derived from it |
| **P2 QUALITY_OBSERVATION** | Anyone doing the plan's harder sessions | The planned session at its cue, with work pace recorded (the catalog's "first exposure is a calibration"). After 2 concordant sessions of the same domain (within 3%, completed as prescribed, effort on target, compatible response) that domain's band is the observed range. Same domain only |
| **P3 TIME_TRIAL_3K / TIME_TRIAL_5K** | Eligible continuous runners (below) | A measured 3 km or 5 km at a strong, even effort |

P3 proposed eligibility (all must hold; unknown is not eligible):
- Run class continuous and current; plan mode EASY (never walk/jog, restart or return); no hold; nonclinical eligibility current.
- **The plan has already activated a harder session** (the policy's two executed established easy weeks). The test **replaces that week's harder session**, never added. An athlete whose plan holds no harder session is not offered a test.
- Not in TAPER, RACE_WEEK or POST_EVENT, not within 14 days before a race, not in a week after an adverse or harder-than-target response.
- 3 km: recent weekly running 60 minutes or more and longest run 25 minutes or more.
- 5 km: additionally INTERMEDIATE or EXPERIENCED, weekly 120 or more, longest run 45 or more.
- At most one in 42 days.

P3 proposed protocol: warm-up 10 to 15 minutes easy, then 3 or 4 relaxed strides only if strides were already done in training; flat measured course (track or GPS); effort cue "strong and even, about 8 to 9 of 10: the best pace you can hold evenly for the whole distance; never a sprint start"; cool-down 5 to 10 minutes easy. Complete means the whole distance covered without stopping, with distance and time recorded. Stop for pain, dizziness or unusual symptoms. Incomplete or stopped: not used, nothing extrapolated from the part done, no penalty, may be repeated after 7 days. The athlete reports RPE; RPE 7 or less is the lower-bound reading of Q1. The replaced session is reported as not done (no debt; its ladder step repeats).

## Q6. Heart-rate zones

Proposed: available only from
- (a) measured anchors supplied by the athlete (`LAB_TEST` with protocol and date), basis `MEASURED_AS_SUPPLIED`, shown with the athlete's own values; or
- (b) a maximum heart rate **observed** in a hard effort of 10 minutes or more (a qualifying race, time trial or P3), recorded by chest strap or flagged good-quality sensor, within 365 days: three coarse zones as fractions of the observed maximum (low below 0.80, moderate 0.80 to 0.87, high above 0.87), basis `ESTIMATED_FROM_OBSERVED_MAXIMUM`, labelled estimated and never called thresholds.

Never from age: an age formula returns `UNAVAILABLE: AGE_FORMULA_NOT_INDIVIDUAL`. Heart rate is a supporting observation; it never gates progression and never replaces the effort cue. The three representations (effort domains, pace bands, heart-rate zones) are separate outputs and none is converted into another.

## Q7. Performance estimates

Kept distinct in every output: historical best; current estimate; the athlete's goal; future projection; actual race result.

Proposed:
- **Current estimate** for 5 km, 10 km, half marathon and marathon when Q3 allows: a range [T at low k × (1 − m), T at high k × (1 + m)] with a central value, the evidence it rests on, its date and confidence. Same distance as the evidence: the result ± m.
- **Half marathon** from evidence shorter than 10 km additionally needs a recent longest run of 60 minutes or more; otherwise `UNAVAILABLE: ENDURANCE_NOT_DEMONSTRATED`.
- **Marathon** needs every existing marathon-block eligibility criterion (SSCTR-V1FC B1), evidence of 10 km or longer, and the marathon exponent range. Anyone else gets `UNAVAILABLE: ENDURANCE_NOT_DEMONSTRATED`, with the statement that a shorter result does not show endurance for 42.2 km. No eligibility criterion changes to produce an estimate.
- **Goal:** shown as the goal, compared with the current range (inside, faster than, slower than, or no current estimate). Never a prediction and never a pace source.
- **Future projection: not produced.** No individually validated improvement model exists for this population inside V1. The output is `UNAVAILABLE: NO_VALIDATED_PROJECTION_MODEL`, with observable comparisons instead (the previous and the current estimate, and their dates).
- **Wording:** every estimate carries "estimate of current capacity in comparable conditions; not a promise". Is that compatible with the standing "no finish time claim" rule, read as "no promise or guarantee"?
- Walk/jog, restart and return athletes get no estimate.

## Q8. Recalibration from logged training, and stability

Proposed:
- Calibration changes only at a week boundary. A band already shown for a week does not move inside it. The exception is withdrawal (Q9).
- A logged race or complete test replaces the reference (through Q2).
- Harder sessions: two consecutive comparable sessions of the same domain, completed as prescribed with effort on target and compatible response, whose work pace is faster than the band's fast edge by more than 1.5%, raise the reference speed by 1.5%. At most one step a week and 4.5% in total without a confirming race or test. The same two sessions slower than the slow edge by more than 1.5% (or reported harder than target inside the band) lower it by 2% a step, 6% in total, flagged.
- One session never changes anything.
- **Easy runs never recalibrate performance.** They feed P1 only, and P1 never makes the easy band faster than the derived ceiling when a reference exists.
- Deadband: a new reference within 1.5% of the current one changes nothing.
- A session without distance, with GPS flagged poor, on a treadmill without calibration, partial, or with conditions flagged (heat, hills, trail) is not comparable and is ignored for calibration.

## Q9. Withdrawal and ageing

Proposed: a declared break of 14 days or more, a clinical hold, or walk/jog, restart or return mode withdraws pace bands and estimates (effort only) until qualifying evidence dated after the return exists. A break of 7 to 13 days lowers confidence one tier. Evidence ages by Q1 with no other trigger.

## Q10. Limits for beginners and marathon runners

Confirm or tighten: (a) an absolute beginner never receives a test, a pace band, an estimate or threshold language, and sessions stay by time and effort; (b) a novice continuous runner gets P1 and P2 only until a result or an eligible P3 exists; (c) the marathon limits of Q7; (d) a preparatory-plan marathon athlete gets no marathon estimate and no MARATHON_EFFORT band.

## Q11 (secondary). Mild non-clinical fatigue in V1 ("limitation C")

V1 keeps the plan when a "not 100%" report passes the warning-sign screen with every sign no (SSCTR-V1FC C). The frozen engine also holds the R6 review kinds `SYSTEMIC_FATIGUE` and `LOCAL_FATIGUE`: a one-week adaptation that removes the remaining hard work of the current week (or the optional work of the affected region), keeps easy participation, opens no window, ladder or chain, and lets the next week be gated by the ordinary weekly review. The app boundary does not expose them.

Sporting opinion only, no implementation is assumed: is that existing one-week adaptation an adequate and safe answer for a screened, sign-free report of ordinary tiredness in V1, and under which conditions (for example only after the screen, never for an illness condition, limits on repetition)? Or should C stay as it is until V2?

## What to rule

For each of Q1 to Q10, and each row or numbered rule inside it: APPROVE, APPROVE_WITH_CONDITIONS (state the changed value or the condition) or REJECT (state the conservative alternative). Give the evidence status (WELL_SUPPORTED, SUPPORTED_WITH_LIMITS, PLAUSIBLE_BUT_UNCERTAIN) with sources actually read, your confidence, and what must be disclosed to the athlete. Do not approve a formula because it is popular: where the evidence does not carry the precision proposed, widen it or abstain. Rule only on sporting content; clinical judgment stays CLINICAL_HUMAN_REQUIRED. If a value must change, give the value: the implementation follows your record literally.

**Output (new files only, in `audits/coachingcore-v1-run-calibration-2026-11-11/ssctr-decision/`):**
- `SSCTR_V1RC_DECISION.json`, authoritative: `items` (one entry per item: id, disposition, value or condition, evidenceStatus, confidence, sourceIds, rationale, disclosure), `sources`, a `values` object holding every decided number in one place under the keys `evidence`, `conflict`, `model`, `confidence`, `domains`, `paceRules`, `assessment`, `heartRate`, `estimates`, `recalibration`, `withdrawal`, plus `proposedQueueItems` and `expiry`.
- `SSCTR_V1RC_DECISION.md`, short.

Change nothing else: no code, no commit, no edit to any existing file. Never run `npm run verify` or any `verify-r*` script. No recursive deletion.
