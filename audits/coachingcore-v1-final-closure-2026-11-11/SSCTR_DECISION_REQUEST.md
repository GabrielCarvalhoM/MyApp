# V1 Final Closure: request for an SSCTR sporting decision (V1FC-SSCTR-DECISION)

**Mission:** CoachingCore V1 Final Closure (Founder request of 2026-11-11). Branch `claude/coachingcore-v1-final-closure`, from `3b14804`.
**Role asked:** SSCTR as decision author (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical sporting content only). A different, fresh SSCTR instance will judge the implemented candidate later; this decision is not that judgment.
**Why:** the Founder requires V1 to prepare eligible athletes for 5 km and marathon races with a specific and coherent prescription, by "the smallest grounded extension", without rebuilding the planner. The bound catalog (R7B0-CATALOG-2) marks both as outside: `LATER.EVENT.5K`, `UNSUPPORTED.EVENT.MARATHON_ULTRA`, `LATER.RUN.MULTI_WEEK_TAPER`. Each new number needs your ruling.

## How the engine plans an event today (10K, half marathon), which the extension reuses unchanged

- Programs last 4, 8, 12 or 16 weeks; the race must be inside the horizon.
- Phases: ESTABLISHMENT (0 or 1 week) → BUILD (a CONSOLIDATION every 4th week) → SPECIFIC (`specificWeeks`: 10K 3, half 4) → TAPER (`taperWeeks`: 1) → RACE_WEEK → POST_EVENT → NEXT_BLOCK.
- Everything is prescribed by time and effort cue. No pace, no zone, no time prediction.
- Long run: starts no higher than the reported longest run, +5 min per development week, never above the target (`longRunTargets`: 10K 70, half 105), never above `singleRunCeiling` (longest completed run of the last 30 days + 5), held (never shortened) when it would exceed 45% of the week's running in weeks with three or more runs. Easy runs: +5 min every 2 development weeks.
- Quality: threshold ladder (3×5' … 3×10', 2' recoveries) once two established easy weeks are executed. In SPECIFIC weeks, after two compatible threshold sessions were executed, the event ladder replaces it (10K: 5×3' → 6×4', 2' rec, "hard but controlled, about 7-8 of 10"; half: 2×12' → 3×12', "steady-hard, about 6-7 of 10").
- Taper days (7 per taper week before the race window): each session is a fraction of the **executed** peak session (`taperWeekRunVolumeRange` 0.6–0.8, long run 0.55–0.7, quality work 0.5–0.6). Race window (6 days): no long run, no quality, at most one race-effort touch at least 3 days out (10K 3×2'/2', half 2×5'/3'), an optional shakeout.
- Race day: a window in minutes (10K 75, half 150, an upper bound), effort anchored, no finish time. It is a **completion** (conversational effort, walk breaks) when the athlete is on walk/jog, restart or return, or (half) when the executed long run is below 75 min.
- Post-event: no run for 2 days, then short easy runs; the next block restarts at 0.625 of the peak long run.
- Strength around an event: taper sets at 0.5, at most one light session in the race window and none in the last 3 days, one light set after.
- The first exposure, the gates (ADVANCE / HOLD / REGRESS on executed sessions and responses) and every safety rule stay as they are.

## Proposal A: 5 km, specific preparation (V1X-5K)

Same structure as the 10K recipe, with these values:

| Parameter | Proposed | 10K today |
|---|---|---|
| Long-run target | 60 min | 70 |
| Specific ladder (after two executed threshold sessions) | 6×2', 8×2', 5×3', 6×3'; 2' easy recovery | 5×3' … 6×4' |
| Effort cue `FIVE_K_EFFORT` | "Hard (about 8 of 10): single words only; even, controlled repetitions, never a sprint; you finish each one able to repeat it" | 7-8 of 10 |
| Specific weeks / taper weeks | 3 / 1 | 3 / 1 |
| Race-week touch | 3×1' with 2' easy (at least 3 days out) | 3×2'/2' |
| Race-day window / warm-up | 45 min / 12 min | 75 / 12 |
| Taper volume point | upper bound of the range, as the 10K | upper |
| Minimum run days before the "few run days" disclosure | 2 | 2 |
| Completion race day | same modes as today; no long-run threshold | same |

Eligibility: none beyond the engine's own. A walk/jog beginner with a 5 km date gets the walk/jog plan, mode-aware event weeks and a completion race day, as a 10K beginner gets today.

## Proposal B: marathon, bounded support (V1X-MARATHON)

**B1. Eligibility for the marathon block (all must hold at intake; nothing is inferred):**
1. Running class is continuous and current: not walk/jog, not restart, not weekly minutes unknown, not returning from a pause.
2. Longest current run ≥ 90 min.
3. Current weekly running ≥ 180 min.
4. At least 4 chosen run days. (With 3 runs the 45% long-run share holds the long run near 100 min, so the block could not build.)
5. Time available on the long-run day ≥ 150 min.
6. The race is 12 or more weeks after the plan starts.
7. Run experience INTERMEDIATE or EXPERIENCED.

**B2. Not eligible → preparatory plan (never UNSUPPORTED, never a marathon block).** The marathon stays on record as the athlete's goal (context only, as the 5K fallback did): the plan is the engine's ordinary plan for the athlete's current class (walk/jog for a beginner, base development otherwise), with no specific, taper or race phases and no race session. A disclosure names each criterion not met and says that a marathon block is planned once they hold. No date is promised.

**B3. The marathon block, values:**

| Parameter | Proposed | Half today |
|---|---|---|
| Long-run target (a cap, by time) | 180 min | 105 |
| Specific ladder (after two executed threshold sessions) | 2×15', 3×15', 2×20', 3×20'; 3' easy recovery | 2×12' … 3×12' |
| Effort cue `MARATHON_EFFORT` | "Steady and controlled (about 5-6 of 10): short sentences are possible; it should feel sustainable for a long time, clearly easier than threshold" | 6-7 of 10 |
| Specific weeks | 6 | 4 |
| Taper weeks | 2 (sessions 14–20 days before the race at the upper bound of each taper range; 7–13 days before at the lower bound) | 1 |
| Race-week touch | 2×5' with 3' easy at marathon effort | 2×5'/3' |
| Race-day window / warm-up | 360 min / 5 min | 150 / 8 |
| Completion race day | today's modes, or executed long run below 150 min | below 75 |
| Post-event | no run for 7 days (rest or walking), then the existing post-event rules | 2 days |
| Minimum run days | 4 (eligibility) | 3 |

With these values the last full long run falls three weeks before the race; an athlete entering at 90–120 min reaches about 150–175 min in a 16-week plan. The race-day text: start easier than it feels necessary, hold the steady effort, no finish time is promised, stop for pain, dizziness or unusual symptoms.

**B4. Not proposed (stays outside):** pace or time prediction, fuelling or hydration prescription, ultra distances, a marathon inside an 8-week or shorter horizon, a mid-plan goal change to a marathon (it asks for a new plan, where B1 is read).

## Proposal C: V1 scope of F08 (the sporting side of the Founder's simplification)

The Founder decided that V1 does not autonomously solve complex recoveries, clinical returns or chained pauses, and that only an already validated safe path may plan a return. Proposed runtime cut:

1. **Situation 1 (temporary reduction: windows, rungs, checks, return ladders, speeds, chains) is not offered in V1.** Its open findings (SSCTR-FFC-01, -02, -03, QRE-FFC-01) all live there. A "not 100%" report is still screened: any warning sign routes to the clinical hold as today. With every sign answered no, the engine answers with a typed unavailability and changes nothing; the athlete's paths are the validated ones: a missed session (never made up, R7) or a declared break with its return (R7-C, R7-D).
2. **Clinical holds stay on record and are released only by the readiness declaration, sport by sport**, with the conservative restart you specified (Q07: never below MODERATE, first week repeated), restrictions as hard caps.
3. **A new plan (restart) never releases a hold** and never starts above the return entry after a long pause (C-Q08-2), as today.

## What to rule

For A, B1, B2, B3 (each row), B4 and C: APPROVE, APPROVE_WITH_CONDITIONS (state the changed value or the condition) or REJECT (state the conservative alternative). Give the evidence status of each ruling (WELL_SUPPORTED, SUPPORTED_WITH_LIMITS, PLAUSIBLE_BUT_UNCERTAIN) with its sources, and anything that must be disclosed to the athlete. Rule only on sporting content; clinical judgment stays CLINICAL_HUMAN_REQUIRED. If a value must change, give the value: the implementation follows your record literally.

**Output:** `audits/coachingcore-v1-final-closure-2026-11-11/ssctr-decision/SSCTR_V1FC_DECISION.json` (authoritative: one entry per item with id, disposition, value or condition, evidenceStatus, sourceIds, disclosure) and a short `SSCTR_V1FC_DECISION.md`. New files only; change nothing else; no code, no commit. Never run `npm run verify` or any `verify-r*` script. No recursive deletion.
