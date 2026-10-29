# R7-A runtime delta for the SSCTR — narrow review at policy `18ec48f3…`

**Mission:** DOMAIN_COACHING_R7-A (semantic core hardening). **Target:** the runtime frozen as **R7A-FREEZE-1** (`CoachingCore/r7/RUNTIME_FREEZE_R7A_1.json`, source digest `1f2bb1d8…`). **Policy:** R6-POLICY-5, canonical hash `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, unchanged; no policy byte changed. **Baseline:** the runtime you reviewed in round 12 (`r6-program.mjs` `57973e97…`), preserved byte-exact in `../pre-r7a-source/`. **Diff:** `RUNTIME_DELTA_R7A.diff` (5 files).

Your round-12 next step was: "In R7: fix D53 for every state mode and D54 in the runtime, without a policy change … then a narrow runtime delta check at hash 18ec48f3". This is that check. Please review only what changes dose, phase behaviour, return, progression or establishment (items 1–8). Items 9–12 are technical evidence integrity, listed so you can see them; they need no ruling unless you see a sporting effect.

## How the runtime changed (structure)

- **One composition point.** `strengthDose` now builds a candidate per exercise state (`strengthCandidate`: its kind, the count the exercise would otherwise have that day, a row cap and a reserve floor) and then applies the day's phase **once, the same way for every row** (`phaseDose`, the R6 `phased` rule unchanged): sets = min(row cap, phase dose of that count), reps in reserve = max(row floor, phase minimum). No row returns before the phase step any more. Every row states what it is in a new field `exposure {kind, phase, phaseBasis, baseSets, normalSets}`.
- **One reading of the week.** `advanceStrength` groups an exercise's exposures in the week. The **first executed** exposure decides what the week was (a re-establishment or not); the **last executed** one gives the counts (as "the last executed count" reads). The review path reads each row's own kind and counts instead of re-deriving them from load modes.
- **Final invariant.** `validateWeeks` now rejects any strength row above its day's phase dose (race week / post-event: main lifts only, sets ≤ 1, RIR ≥ 4; taper/specific RIR ≥ 3; every row ≤ the phase reduction of the count it states), so a future branch cannot bypass the phase silently.

## Items for your ruling

| # | Item | Rule (authority) | Before (round-12 runtime) | After (R7A-FREEZE-1) |
|---|---|---|---|---|
| 1 | **D53, every state mode** | `strength.setsAfterReestablishment`; your D53 required change; LE-15, PP-14, ROT-10 | Regain cap only when the state was KNOWN (`reestablishes` required `ex.mode==='KNOWN'`) | The regain starts at every performed re-establishment whatever the state's mode (known, pending log, unlogged, re-established) |
| 2 | **D54** | principle 8; `operational.event`; EVENT-TRANSITION 7–8; your D54 required change | The re-establishment row returned before the phase reduction: 2 sets @RIR3 in race week / post-event / taper | min(re-establishment cap, phase dose of the count the exercise would otherwise have); RIR ≥ phase minimum; load still effort-guided under the earlier ceiling |
| 2b | D54 composition outside event phases | "like the other establishment rows" (D54 wording) | Re-establishment always min(goal sets, 2) | The same min applies in every phase: in consolidation or specific weeks a re-establishment of an exercise whose count would be 2 becomes 1 set; in build weeks a re-establishment is never above the count the exercise would otherwise have (e.g. a known dose of 1 set) |
| 3 | **Regain base after a phase-reduced re-establishment** (Q1 below) | D49 return-step analogue; your D53 wording "from the re-establishment count … with phase reductions on top" | Case did not exist (the row was never reduced) | The cap starts at the re-establishment count **before** the phase reduction (e.g. consolidation 1 set, next unreduced week 2, then 3) |
| 4 | **R19, split weeks** | your R19 (next runtime revision) | The transition used the last *prescribed* entry: an executed 3×10 at the known load followed by a missed re-establishment row converted the state and capped the next week at 2 sets | The first executed exposure decides: KNOWN stays KNOWN at its count. If both are executed, no conversion (the known load was demonstrated) and the counts come from the later exposure. The later row now reads "Not done for more than 28 days **as of the last review**" |
| 5 | **Return-entry week, exercises in use** | R6-POLICY-4 `strengthEntryWeek`; your R17(b) description "while any exercise in use is at the entry step" | Any exercise in the state at step 0 made an entry week, including rotated-out exercises that never advance | Only exercises in use this week count. Effect: a new exercise (substitute) in return step 2 gets normal establishment (2×8 @RIR3) instead of the entry dose (1×8 @RIR4) |
| 6 | **Sets logged without repetitions** | `gates.missingLogs` "HOLD without regression" | A set without reps counted as 0 reps → "missed reps" → REGRESS after two; reps could be adopted as 0 (known-load reviews then failed validation) | Unknown reps: the target is neither met nor missed → HOLD; never a regression step; reps never adopted from a missing value |
| 7 | **A fatigue-reduced week** (consequence of item 4's counts) | D49 "a week without a phase reduction executed its whole count" | The week's planned count (unchanged by the in-week fatigue reduction) was read, so the week counted as unreduced | The executed row's count is read: a fatigue-reduced week earns no regain or return-cap set. No case in the regression corpora reaches it |
| 8 | **Moves within a week** | `proximitySemantics` (taper and race-window days) | A missed key session could move to a later chosen day with another day phase and keep its dose | Candidate moves never cross a day phase |

**Not changed and routed, for your awareness:** F-ACCESSORY-REPS — under STRENGTH and MAINTAIN goals an accessory's reps depend on its load mode (establishment/from-log rows: goal reps + 2 up to 15; known rows: clamped to the goal's rep range), so they fall 7→6 or 10→8 when the load becomes known. Neither rule is in the policy text; choosing is a sporting decision routed to R7-B. R17 (a, c, d) and R18 stay with you / R7-C as recorded.

## Questions

- **Q1 (item 3).** Your round-12 AI audit (rerun unchanged on the freeze, `../probes/ssctr-r12-instrument.AFTER.out.json`) flags 370 as-prescribed and 146 noisy-log weeks. All are one pattern: a re-establishment its phase reduced to 1 set, followed by the unreduced re-establishment count (2), then +1 per executed unreduced week. The audit, written before D54 could reduce the row, measures from the prescribed (reduced) count. Option A (implemented): regain from the count before the reduction, as D49 does for a reduced return step 2 ("followed by the step-2 count itself"). Option B: regain from the executed reduced count (1, 1, 2, 3). Which is required?
- **Q2 (item 2b).** Confirm that the re-establishment row may be below min(goal sets, 2) outside event phases when the phase dose or the exercise's own count is lower (consolidation and specific weeks; a known dose of 1 set).
- **Q3 (item 4).** Confirm the split-week reading: the first executed exposure decides whether the week re-established; the last executed one gives the week's counts.
- **Q4 (items 5–8).** Any sporting objection to items 5, 6, 7 and 8?

## Evidence (all synthetic, DEV_TEST_ONLY authority, offline)

| What | Where | Result |
|---|---|---|
| Your round-12 instrument, paths only changed | `../probes/ssctr-r12-instrument.mjs` | BEFORE (pre-R7A runtime): all 43 sections byte-identical to your official r12 output; AFTER: next section |
| CQ-R6-06 check | `../probes/r7a-cq06-probe.mjs` | walk/jog- and restart-built racers: completion race day, no strides, on both runtimes (R6's unfrozen D43(c)/D47; nothing changed in R7-A) |
| R7-A class probes | `../probes/r7a-class-probes.mjs` (`R7A_RUNTIME=pre` for BEFORE) | BEFORE: 10 classes reproduced (incl. 120 race-window/post-event re-establishment rows at 2×5 @RIR3); AFTER: all cleared except C15 (R18, routed) |
| Invariant tests | `CoachingCore/test/r7a-semantic-core.test.mjs` | 17 tests; suite 460/460 on Node 24.19.0 |
| Mutation check | `../probes/mutation-check-r7a.out.json` | 13/13 single-fix reverts caught |
| Regression, both runtimes | `CoachingCore/r7/REGRESSION_R7A.json` | R5 corpus 24/24 identical; dev profiles 16/16; simulations identical; R6 fresh holdout (regression only) 27/35 identical, 8 differences explained, one disposition change (H23, a one-day DOUBLE_CONFLICT now asks instead of changing every later week) |

## Your round-12 instrument on the freeze (author reading; please verify)

`../probes/ssctr-r12-instrument.AFTER.out.json` against `…BEFORE.out.json` (the pre-R7A runtime, byte-identical to your r12 output). 28 of 43 sections are identical. The others:

| Section | BEFORE → AFTER | Author's explanation |
|---|---|---|
| AK | 70 rows above the phase dose → **0** | D54 (item 2) |
| AI noisy-log grid | next exposure more than one set above the re-establishment: 48 → **0**; violations 48 → 146 | D53 resolved on the from-log path (item 1). All 146 are the Q1 pattern (c0 = 1 after a consolidation-reduced re-establishment) |
| AI as prescribed | violations 0 → 370; next-exposure jumps 0 → 0 | All 370 are the Q1 pattern (author's classification of the full list: 194 "next week 2 vs allowed 1", 164 "3 vs 2", 12 "3 vs 2" four weeks on) |
| AJ | pendingThroughBlockEnd 2 → 0, …Adopted 2 → 0, unloggedThroughGap 2 → 0; reestablishedWithoutLogThenSecondGap 0 → 2, knownAthleteNoisyAccessories 1 → 4 | The from-log D53 cases are resolved; the new flags are the Q1 pattern (consolidation week 7) |
| AH | 0 of 584 → 0 of 584 | unchanged metric; rows now carry `normalSets` |
| AL, AN | 4 new flags in AL (Q1 pattern); re-establishment rows now report `normalSets` (was null) | Q1; metadata |
| AM | both sessions performed: no regain cap after the known exposure was executed first | item 4 (R19) |
| AD | firstOnlyLogged: week 6 2×10 → **3×10** KNOWN; firstOnlyWithoutDetails: state stays KNOWN (was FROM_LOG, unlogged, ceiling); allPerformed: week-5 review KEEP/INSTANTIATE → **MODIFY/ADOPT_LOGGED_LOADS** | item 4. In allPerformed the projection no longer converts the state (the known exposure came first), while the review still adopts the week's last log (Friday's re-establishment, 8 reps; D45 "the week's last usable log decides"), so review and projection now differ and the review proposes. The week-6 doses equal the round-12 runtime's |
| Z_D52 | a rotated-back exercise after a return: 2×10 → 1×10 at re-establishment | item 2b (its count that day is 1) |
| AA | reviewed strength rows 5,199 → 5,201 | verified: a consolidation-week re-establishment at 1 set (2b), then 2 (Q1 A) where the round-12 runtime had 2 → 3; the shorter session fits one more accessory (dead-bug) |
| AHb, AM round-11 comparison | `error: current r6-adaptation.mjs differs from my round-11 record` | your comparison scaffolding requires every file but `r6-program.mjs` to equal round 11; R7-A changes five files. Instrument limitation, not a runtime result |

## Technical items (no ruling needed)

9. Intake: strength records merge independently of order and source; a record without a complete current dose never displaces a complete one (the H07 case: a self-reported 18 kg dose was dropped for a wearable row without RIR). 10. Two reports of one strength session with contradictory exercise loads are a conflict in either arrival order. 11. The carried ledger keeps superseded facts, so a correction stays valid in later reviews. 12. A dated schedule change is never applied beyond its dates; a race finished faster than its window is complete.

## What I ask of you

- Bind your review to R7A-FREEZE-1: every reviewed file's SHA-256 must equal the freeze file. Do not edit the runtime, tests, policy, fixtures or any R6 file. Write only under `audits/domain-coaching-r7a-2026-10-27/reviews/` (temporary copies only in the OS temp directory). Never run `npm run verify` or any `verify-r*` script.
- Output `reviews/ssctr-r7a-review.json` and `reviews/ssctr-r7a-review.md`: revision `R7A-SSCTR-r1`; reviewer, instance and versions; the reviewed files with hashes; for D53 and D54 a status (RESOLVED / OPEN) with evidence; answers to Q1–Q4; per affected boundary whether the round-12 conditions are now met at the unchanged hash; a verdict `runtimeAccepted` (true/false) with the complete blocking list, each marked new / narrow / runtime-only; non-blocking recommendations; and whether any new prescriptive rule was decided (then a queue proposal, not a queue edit).
- **Validation gap:** Python with `jsonschema` is not installed in this session, so `validate_records.py` cannot run. Node 24 and `CoachingCore/node_modules/ajv` (8.20.0) are available if you want a declared substitute check against `decision.schema.json`; otherwise state the gap.
- **Cycle bound** (Founder's standing rule, applied from the start of R7-A): this is the one review of the candidate. At most one narrow re-check follows, and only if every blocking item is new, narrow and runtime-only. Please list every blocker you see now.
