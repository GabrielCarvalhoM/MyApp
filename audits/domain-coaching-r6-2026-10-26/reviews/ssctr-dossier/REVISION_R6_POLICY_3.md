# R6-POLICY-3: delta for the FREEZE-2 engineering fixes

**For:** the SSCTR, delta binding review (round 7).
**Author:** runtime author (Claude Code continuation root). This is author material, not evidence of quality.
**Date:** 2026-10-26.

## Why there is a delta after the round-6 approval

Round 6 approved all ten R6 boundaries at R6-POLICY-2 `af2779fe…` (reviewed bytes preserved here as `PROGRAM_POLICY_R6.reviewed-af2779fe.json`, file sha256 `c855cde0…`). The runtime was then frozen (FREEZE-1, source digest `507f35fc…`).

An independent Quality & Reliability judge reviewed FREEZE-1 and returned **FAIL** with 23 findings (`../quality-engineering-review.json`, probes in `../quality-engineering/`): 1 CRITICAL, 7 HIGH, 8 MEDIUM and 7 LOW. The judge routed three of them to the SSCTR:
- QRE-R6-03, event-week semantics;
- QRE-R6-07, free-text lexicon coverage;
- QRE-R6-19, walk-only race preparation.

The fresh holdout's single first evaluation was recorded on FREEZE-1 before any fix (`CoachingCore/r6/holdout/FIRST_EVALUATION.json`). Its contents were not inspected by the runtime author. The fixes below follow the engineering findings only, and their scope was pinned in `CoachingCore/test/r6-engineering-fixes.test.mjs`, written before any holdout exposure. The corrected runtime will be frozen as FREEZE-2, and the sealed corpus rerun on it as labelled challenge reuse.

## The policy now under review
- **R6-POLICY-3**, canonical hash (value.mjs `hash`) `e9c87e09d35496791c6d6894639652a4c7bd6cbf6f0b01299d57dd7352373f87`, file sha256 `446e241ee617aa95e779a108066a5940800017c689c6f10285cc976de4aac6d8`.
- **No envelope magnitude is widened.** Every numeric value of R6-POLICY-2 is unchanged.
- **Added:** `event.raceWindowDays: 6` (a declaration of the existing race-week concept, now counted in days) and `strength.loggedLoadAdoption` (`maximumKilograms: 500`, `maximumIncrementsAbovePlanned: 1`).
- **Otherwise:** semantic declarations. The diff against the reviewed bytes is mechanical; please diff the two files.

## Changes for you to decide, grouped by boundary

| # | Finding | Boundary | What changed (policy key → runtime) | Question for the SSCTR |
|---|---|---|---|---|
| 1 | QRE-R6-03 (HIGH) | EVENT-TRANSITION, HYBRID | `event.raceWindowDays`, `event.proximitySemantics` → `r6-program.mjs` `eventDays`, `eventWeekSessions`, `buildWeek`, `strengthDose` (day phase). Proximity counts days to the race. In the final 6 days there is no long run and no quality session: shakeout the day before, at most one touch at ≥3 days, other runs short and easy. Strength: none within 3 days, at most one light session (1 set, main lifts, RIR ≥4) on the strength day furthest from the race. Taper days (7 per taper week) take taper doses whichever calendar week they fall in. Post-race days follow the post-event rules by days since the race. | Are race-window and taper-window rules by days the right reading of the approved envelope? Is 6 days the right race window? On author probes, 840 event programs (every race weekday) show 0 proximity violations. |
| 2 | QRE-R6-09 (MEDIUM) | COLD-START, PLANNED-PROGRESSION | `establishment.belowMinimumSession` → `assessCapability`, `initialRunState`. Current running below the 15-minute minimum session (longest run or weekly total) now starts on walk/jog, not on 5-minute "easy runs" with a floored 15-minute long run. Novices and zero or unknown exposure start at step 0. A non-novice starts at the highest ladder step whose single jog segment fits the longest current run and whose jogging per session fits weekly running divided by the week's walk/jog exposures. | This familiar ladder start is **new**. Approve, or require step 0? |
| 3 | QRE-R6-09 | PLANNED-PROGRESSION | `run.singleRunCeiling.reference` → `projectWeeks`. With no run in the 30-day window, the entry (15 min) is the ceiling in every projected week. Before, it applied only in the first week, so the ceiling was unbounded after walk-only weeks. | Confirm. |
| 4 | QRE-R6-01 (CRITICAL) | LOAD-ESTABLISHMENT | `strength.loadUnits` → `toKilograms`, `knownExercise`, `strengthLogs`. LB is converted to kg (nearest 0.5) at intake and in logs and kept as reported. An unknown unit or a convention mismatch is never adopted and is asked about. A reported known dose above 6 sets is history; the plan starts at 6. | Confirm. |
| 5 | QRE-R6-02 (HIGH) | LOAD-ESTABLISHMENT, PLANNED-PROGRESSION | `strength.loggedLoadAdoption` → `loggedLoadDecision`, `advanceStrength`, `loggedLoadQuestions`. A logged load is adopted only within 0–500 kg and at most one smallest increment above the planned load. It is capped at a re-establishment ceiling. Otherwise the planned reference stays and the athlete is asked. A changed known load is reported as MODIFY (`ADOPT_LOGGED_LOADS`), not as an instantiation. | Is "one increment above the planned load" the right bound for self-progression evidence? |
| 6 | QRE-R6-17 (LOW) | ROTATION, PLANNED-PROGRESSION | `strength.setsAfterReestablishment` → `advanceStrength` (`priorSets`). After effort re-establishment, sets return one per executed week (before: 2 → 5 at once). | Confirm. |
| 7 | QRE-R6-04 (HIGH) | PLANNED-PROGRESSION, RUN-QUALITY | `learning.missingGate` → `weeklyReview`, `rebuild` (evidence gates `ALL:HOLD`). A dimension with no executed session holds and never counts as an executed week. This closes strides or quality unlocking after a race with zero executed runs. | Confirm. |
| 8 | QRE-R6-13/14 (MEDIUM) | PARTIAL-NOISY-LEARNING | `learning.conflicts` → `normalizeObservations`, `evaluateProgram`. The record is append-only: a conflicting report keeps the first one in the ledger, flagged and quarantined, so the session is CONFLICTED and excluded from capacity and learning. One wearable activity bound to two sessions is a conflict on both. A report dated before its activity is rejected. A correction resolves a conflict. This also answers the R5 judge's F-H24, where the first-seen payload stayed in learning. | Confirm. |
| 9 | QRE-R6-16 (MEDIUM) | PARTIAL-NOISY-LEARNING | `learning.consentScope` → `weeklyReview`. Without learning consent no athlete-specific pattern changes the plan. Gating on the plan's own record does not depend on consent. The privacy scope itself is a Product/Data decision. | Confirm the coaching side. |
| 10 | QRE-R6-05/06 (HIGH) | NONCLINICAL-RETURN | `return.interruptionFacts`, `return.demonstration.minimumDuration` → `returnAfterPause`, `evaluateProgram`, `screenInterruptionReason`. Any of these is asked, never resolved to the least conservative class: a non-date eligibility, out-of-range days, start after end, an end after the review, or days that contradict dates. A clinical flag meaning yes in any form (`'true'`, `1`, `yes`) routes to a human; one that is neither yes nor no is asked. A demonstration shorter than 15 minutes is not a demonstration (before, a 1-minute demonstration gave 1-minute runs). | Confirm. |
| 11 | QRE-R6-07 (HIGH) | NONCLINICAL-RETURN, COLD-START | `return.reasonScreen` → `r6-clinical.mjs`. The lexicon now covers common medical conditions, procedures, treatments and symptoms in EN/PT/ES. A damage verb plus a body part in one clause is clinical ("broke my leg", "quebrei a perna", "me rompí la pierna"). Body parts alone, sore, cramps, anxiety and treatment are ambiguous (ASK). Negation handling (D34–D41) is unchanged. Author check: all 26 of the judge's misses and 20 more now route CLINICAL or ASK; 12 plain nonclinical notes stay NONCLINICAL; the D-series battery passes. | You decided further lexical residuals are an owned gap. This widening only adds CLINICAL/ASK outcomes. Do you accept it inside that gap, or want changes? |
| 12 | QRE-R6-18 (LOW) | EVENT-TRANSITION | `event.raceDateUnavailable` → `eventWeekConflict`, `unavailableDay`. A race date marked unavailable is asked about, never kept or skipped silently. | Confirm. |
| 13 | QRE-R6-19 (LOW) | EVENT-TRANSITION, COLD-START | No new rule. With change 2, the judge's case (EASY_LOW, one run day, 10K, 10 min/week, longest 5 min) is now walk/jog before the race. It carries the existing non-blocking `EVENT_AMBITIOUS_FOR_CURRENT_RUNNING` and `TOO_FEW_RUN_DAYS_FOR_EVENT` negotiation. | Is a non-blocking negotiation enough, or must a race with only walk/jog preparation be a blocking ASK? |

## Pure adapter and robustness fixes (no envelope semantics; listed for completeness)
- QRE-R6-08, schedule change validation: `scheduleChangeErrors`. Plus `validateWeeks` rejects duplicate session ids and two key runs on one date.
- QRE-R6-10, no exceptions on malformed input: guards, non-object observations, any error becomes HOLD. On the judge's fuzz (rerun by the author), throws fall from 132 to 3, all non-JSON values.
- QRE-R6-11, goal and event vocabulary and real dates.
- QRE-R6-12, intake: unclear pause length asked, implausible familiar task ignored with a note, malformed goal type rejected.
- QRE-R6-15, a missed-session report for a recorded execution is asked about.
- QRE-R6-20/21, simulator local clocks and a finite summary.
- QRE-R6-22, code-point ordering.
- `validateR6Prescription`: known load ≤500 kg, never LB.

## Evidence the author ran (dev authority bound to the new hash; not independent)
- `node --test`: 394/394. This includes 21 new regression tests (`test/r6-engineering-fixes.test.mjs`) and one existing test updated to append-only semantics (`r6-balanced-provenance.test.mjs`).
- Dev simulation 14/14 trajectories with all invariants, demonstrations A–M, and the R5 holdout dev replay: 24 cases, 0 errors. The replay is semantically identical to FREEZE-1 except policy and program hashes.
- Randomized self-check 3×300: 0 failures. Clinical battery: 0 failures.
- The judge's probes rerun by the author are in `freeze2-author-reruns/` (dev authority). The only remaining envelope flag is `week1WalkJogStep`: the judge's FREEZE-1 check expects step 0, and change 2 is the new familiar start under review.

## What is asked
1. A delta binding review of R6-POLICY-3 at hash `e9c87e09…`, with each of the ten boundary records re-issued for that hash (APPROVE_WITH_CONDITIONS, REVISE, …) and conditions updated.
2. A ruling on questions 1, 2, 5, 11 and 13 above.
3. The runtime may be frozen as FREEZE-2 only after your freeze verdict.
