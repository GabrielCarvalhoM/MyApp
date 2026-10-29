# R7-A.1 — SSCTR dossier (R7A1-FREEZE-A1)

**For:** the Sports Science & Concurrent Training Reviewer (gate `R7A1_SCIENTIFIC_REVIEW`).
- This session has no native SSCTR agent type, so you run as the documented fallback: a fresh default instance that loads the adapter `.claude/agents/sports-science-concurrent-training-reviewer.md`, `governance/agents/sports-science-reviewer/CONSTITUTION.md` and `.agents/skills/sports-science-review/SKILL.md`.
- Your authority is PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only.

**Binding:** R7A1-FREEZE-A1, `CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A1.json`, source digest `2de8681f13e5cb499df6a5a3dc443d52877850528ceb298b598d03de6ec2141a`. Policy R6-POLICY-5 `18ec48f3…` is **unchanged**: no policy text was edited and no sporting rule was added.

**Mission:** DOMAIN_COACHING_R7-A.1, a blocker-only continuation of R7-A ([FOUNDER_REQUEST.md](../FOUNDER_REQUEST.md); §10 D53/D56 and §12 are your remit). It is not R7-B.

## Your remit

**In scope (Founder §12), the sporting items only:**
- QE-R7A-02;
- the QE-R7A-12 dose reading;
- D56 and D53;
- every return, recovery or progression rule the composition touches.

**Out of scope:**
- QE-R7A-05, the report merge: pure provenance with no sporting rule, so it is not sent to you;
- the engineering composition itself, which the engineering judge reviews in parallel on the same freeze.

Your earlier position, which this mission answers:
- R7-A re-check `audits/domain-coaching-r7a-2026-10-27/reviews/ssctr-r7a-recheck.md` (R7A-SSCTR-r2): D56 is blocking. R27, R28/O-1 and R23 are non-blocking.
- "A new freeze then needs a narrow SSCTR delta check of the changed files at `18ec48f3…` before these records bind it."

D53 can close only if all of these hold (Founder §10):
- the original paths stay fixed;
- D56 is fixed;
- **no known equivalent state mode allows a restoration jump**;
- you approve the final semantics;
- the engineering judge finds no new equivalent.

## Bounds

- **Read-only runtime.** Do not edit `CoachingCore/`, the mission files, the human queue, `product/`, `canon/` or earlier audits.
- Write only under `audits/domain-coaching-r7a1-2026-10-27/reviews/`:
  - your probes and their outputs;
  - `ssctr-r7a1-review.md` and `ssctr-r7a1-review.json`;
  - a queue proposal `ssctr-r7a1-queue-items.json` (proposal only). The Chief integrates it append-only.
- **Never run** `npm run verify`, `npm run simulate`, `npm run demonstrations:r6`, any earlier `scripts/verify-r*.mjs`, `regress-r7a*.mjs`, `freeze-r7a1.mjs` or `prepare-r7a1.mjs`.
- `node CoachingCore/scripts/verify-r7a1.mjs` without `--write` is read-only.
- The `probes/r7a1-*.mjs` scripts print only. `probes/ssctr-r12-instrument.mjs` (your round-12 instrument, byte copy) writes next to itself: copy it into your folder and set `R7A_PROBE_OUT`.
- Synthetic data and the DEV_TEST_ONLY authority only. No clinical semantics. Unknown eligibility is ASK.

## What changed, in sporting terms

The fix is one week-composition model, the [WEEK_COMPOSITION_CONTRACT](../WEEK_COMPOSITION_CONTRACT.md) (C1–C7). It states how the existing rules compose and adds no policy text. Where composing them required an interpretive choice with a sporting effect, the choice is listed below for your ruling (S1, S3, S4, S5, S6, S9, S10), with its sporting consequences. The full engineering brief is [ENGINEERING_REVIEW_BRIEF_R7A1.md](ENGINEERING_REVIEW_BRIEF_R7A1.md); the diff is [RUNTIME_DELTA_R7A1.diff](RUNTIME_DELTA_R7A1.diff).

### S1. D56: the formulation implemented (rule for your ruling)

**Implemented.** The regain cap after a re-establishment, and the return cap at and after the end of the return steps, rise or end only after a week in which the **last executed exposure** of the exercise did its whole count after its time fit. Whole count means the count before the phase reduction. The last executed exposure is the one that gives the week's counts: your R19 and INV-04.
- A time fit stays a non-reduction for the phase reading and for the return ceiling (your R20, unchanged).
- A row written before R7-A states no counts. It reads its week's planned counts, so every representation reads the same.

**Difference from your wording.** You wrote "an executed exposure". The last one is used because of the engineering judge's QE-R7A-22:
- Setup: a cap week with a whole first session (2 sets, day 0), then a mid-week systemic fatigue that reduces the day-4 session.
- Under "any exposure", the whole first session releases the cap that the fatigue reduction (FR2) requires to hold.
- **Please rule:** does "an executed exposure" mean the last one (as implemented) or any one?

**Evidence.**

*Minimal timeline (yours):* STRENGTH, one 25-minute day, known squat, RDL and bench; strength missed in weeks 2–6.

| Week | FREEZE-A1, constant 25 min | FREEZE-A1, raised to 75 min after week 8 | FREEZE-2, raised |
|---|---|---|---|
| 7 | 2x5 re-establishment | 2x5 re-establishment | 2x5 |
| 8 | 2x5, trimmed from 3; cap 3 | 2x5, trimmed from 3; cap 3 | 2x5; cap 3, then released |
| 9 | 2x5; cap 3 | **3x5**; cap 3 | **4x5** |
| 10 | 2x5; cap 3 | 4x5; cap ended | 4x5 |
| 11 | 2x5; cap 3 | 3x5 (phase dose 3) | 3x5 |

*D56 grid* (`probes/r7a1-d56-grid.mjs`; modelled on your S6 grid): 144 timelines.
- Variables: re-establishment or a 16-day return; STRENGTH, HYPERTROPHY or RUNNING_SUPPORT; known or no exercises; one or two 25–35 minute days; budget kept or raised to 75.
- A cap rising or ending after a week whose last executed exposure was trimmed: 54 of 70 such weeks on FREEZE-2, **0 of 196** on FREEZE-A1.
- A capped exercise more than one set above the largest count executed since the re-establishment or return: 20 on FREEZE-2, **0** on FREEZE-A1.

*Your round-12 instrument* on FREEZE-A1: every D53/D54 section (AH, AI, AJ, AK, AL, AM, AN) equals its R7-A CYCLE2 output on FREEZE-2, so the original D53 paths are unchanged. The only other difference is one value in V_D47reviews, explained under S9.

*Tests* (`CoachingCore/test/r7a1-composition.test.mjs`): "D56: weeks trimmed to the time budget neither raise nor end the regain cap…" covers the constant and raised budgets and the legacy representation. "D56/R19: the last executed exposure gives the week's counts…" covers QE-R7A-22.

### S2. The equivalent-state-mode question for D53: accessories no ceiling covers (R23 class)

The D56 grid also counts jumps of more than one set above the largest count executed for exercises that **no ceiling covers**.
- There are 30, identical on FREEZE-2 and FREEZE-A1, and all appear only with the budget raised.
- `dead-bug` (bodyweight; never re-established): 18. Example: 1 set executed in the trimmed weeks, then 3 sets in week 9.
- `db-calf-raise` and `db-split-squat` (FROM_LOG, return timelines without known exercises): 8 and 4. 1 set executed, then 3 sets.

This is the class you recorded as R23: "accessories the time fit dropped during the return come back at 3 sets (20 cases, equal on both freezes)". You routed it to the next policy revision, non-blocking.
- Closing it would need a new sporting rule (a ceiling for uncapped accessories). The Founder forbids that in this mission.
- **Please rule:** is this a "known equivalent state mode that allows a restoration jump", which keeps D53 open? Or is it the separate R23 policy question, so D53 can close?

### S3. QE-R7A-02 and your R27: same-day eligibility and the short-return easy slot

**C1, one test of "still ahead" for every handler.**
- A session is ahead if it is dated after the review's local date.
- It is also ahead if it is dated that day, has no report, and its chosen shift is not over.
- A morning (AM) session is over at noon local time. An afternoon or unspecified shift stays ahead until the day ends.
- The plan knows only the chosen shift, not a clock time.

The short-return rule "the first quality slot after a short break runs easy" reads ahead by C1.
- It is now an adaptation recorded on the week (`SHORT_RETURN_EASY`), so a later re-plan, such as the weekly review, keeps it (E01).
- The engineering judge's probe P2 on FREEZE-A1: a 5-day break ending Wednesday, reported Wednesday 21:00 or Thursday 05:00 (run at 08:00), gives the Thursday run as **EASY 41** at either clock. On FREEZE-2 the Thursday-morning report kept THRESHOLD 41.
- **Please rule:** is R6-NONCLINICAL-RETURN condition 7 met? Is the noon boundary for an AM session an acceptable reading?

### S4. QE-R7A-12: a lighter logged known load (dose reading)

A logged load of an exposure that prescribed a known load is **progression evidence**. When it is lighter and adopted:
- the gate decides the repetition target;
- HOLD and REGRESS keep the planned target;
- ADVANCE takes the logged repetitions, as at the planned load.

Only an establishment exposure (first establishment, re-establishment, return entry, from-log) sets its target from its logged repetitions.

Probe P3 on FREEZE-A1 (planned 3x5 at 80 kg, goal range 4–6):

| Logged | Gate | FREEZE-2 next | FREEZE-A1 next |
|---|---|---|---|
| 77.5 kg × 5, 3, 5 | HOLD | 3x3 @ 77.5 | **3x5 @ 77.5** |
| 75 kg × 4, 4, 2 | HOLD | 3x2 @ 75 | **3x5 @ 75** |
| 77.5 kg × 5, 5, 5 | ADVANCE | — | 3x5 @ 77.5 (adopted) |

Authority used: the gates as you read them in S2, and your R25 ("keep or clamp the target"). **Please rule** on this dose reading.

### S5. C5: a return supersedes the plan before the break (return rule; E10, R6-H26)

A session dated before a return reported the same week:
- is never moved into the re-entry (E10: a missed pre-break key session is no longer moved after the return);
- never counts as done in next week's conditional plan.

Effect in R6 holdout case H26 (17-day vacation; return reported Thursday 07:00 of week 8):
- The Monday lifting of week 8 predates the return and was not done.
- So the goblet squat enters at the **return entry in week 9 (1x8 @RIR4, ESTABLISH)**. FREEZE-2 gave the post-entry step 2x8 @RIR3 ("use the load you logged at the return entry"), with no entry logged for it.
- Week 8's rows are unchanged.

Test "C3/C5: next week's conditional plan never counts a session from the plan before a return of this week": a lift not done since the break starts at the entry.

**A corrected return report.** A 16-day return reported Saturday 07:00 is corrected to 5 days at 08:00. The week is now planned exactly as the 5-day return alone would plan it:
- the strength session that day resumes 2x5 @RIR3 at its known load;
- the long run resumes at 60 minutes.

Before this fix, the correction started from the start the first report had written, so the 16-day re-entry stayed: 1x5 @RIR4 establishment and a 20-minute long run. The rule: a newer report of a break that began this week starts from the start the week had before an earlier report replaced it (C5).

**Please rule:** is this consistent with R6-NONCLINICAL-RETURN, in particular conditions 9 and 21 and `strengthKnownLoadAfterReturnLog`?

### S6. C3: one start rule for next week (progression rule touched)

On FREEZE-2 the handlers started next week differently.
- The re-plan from next week (schedule, goal or dated change) held every step while the week was under way.
- The re-plan of this week assumed rows the new context would have planned for days already past.
- The equipment change projected from the week start.

Now there is one rule. A return's re-base of next week is kept. Otherwise:
- **once the week is complete**, the week's evidence decides, which is the weekly review's own rule (an unreported complete week holds);
- **while the week is under way**, the conditional plan of the week as now planned decides: its rows assumed executed as prescribed, as every later week is planned, except sessions dated before a return (S5).

The next weekly review re-derives the start from evidence as before.

Sporting effects in the regression corpus:

| Case | Effect |
|---|---|
| R6-H22 (schedule change reported Wednesday for next week) | Two accessories 1→2 sets in week 8, instead of HOLD |
| R6-H25 (goal change to MAINTAIN with a 10K, reported Wednesday for next week) | Next week starts from the conditional plan under the new goal, not from HOLD. Dead-bug goes 1x14 → 1x12 in weeks 3–4, and strides 4 → 5 in week 4 |
| R6-H24 (equipment window reported Sunday evening after a complete week with no reports) | Next week holds: dead-bug stays 1 set (FREEZE-2 assumed execution: 2 sets) |
| R6-H29 (event-period conflict over Wednesday to Friday of race week) | No dose change: the Thursday strength rest keeps its rest instead of a skip mark |

**The run ceiling in a conditional plan.** A change from a later week (a dated schedule change from week w+2) leaves the weeks before it as planned. For the single-run ceiling of its first week it now counts their planned runs as executed. This is what the policy text states ("in a conditional projection, earlier projected weeks count as executed") and what a re-plan from next week already did.
- Before the fix, the dated change counted only executed runs.
- In the grid program, the long run of the change's first week was then 70 or 75 minutes depending on which of two changes came first.
- It is now 75 in either order: the longest planned run before it, 70, plus the 5-minute step.

**Please rule:**
- Is a conditional start (no step held) acceptable for a mid-week change to future weeks?
- Is "a complete week with no reports holds" correct for changes other than the weekly review?
- Is the ceiling reading of planned weeks right?

### S7. C1: same-day effects (return and substitution)

- **T05 (simulation):** a short return reported in the evening no longer rewrites that morning's run; its shift is over and its report may still arrive. The run stays 45 minutes, not 40, and two later easy runs are 5 minutes longer.
- **Same-day substitution:** an equipment change reported in the morning now also substitutes that afternoon's strength session, because it is still ahead. The evidence is the R7-A engineering probes `qe-probe-K` and `qe-probe-N`. In N, the TEN_K profile in week 13 under a temporary equipment change goes from KEEP to MODIFY. On FREEZE-2 the afternoon session kept its barbell rows.

**Please confirm** there is no sporting objection.

### S8. Return outcomes of the engineering blockers (confirmation only)

- **QE-R7A-01** (a return re-planning from next week, then an equipment change the same evening): the first strength week after the break stays RETURN_ENTRY in either order, with the run in RETURN mode. On FREEZE-2 it came back at the pre-break dose (4x6 @RIR3).
- **QE-R7A-03** (a return in race week, then the race postponed): one race in either order.
- **Your O-1/R28** (a weekly review, then an equipment change): the reviewed strength transition survives.
- **QE-R7A-19** (a same-week adaptation, then an event change): systemic fatigue, an unavailable day and local fatigue stay applied in either order.

### S9. An event change that takes this week's remaining days out of the event window (rule for your ruling)

**Before.** An event change re-planned this week's remaining days only when it moved one of them *into* the taper, race or post-event window, or the race was still ahead this week. Otherwise the re-plan started next week.

**Now.** It also re-plans them when it moves one of them *out of* that window. Days count to the race, as in your S4 ("the remaining days equal a program generated with the new date").

**Why (C5).** The race was moved into next week, so this week became its taper. The race was then postponed by two weeks. This week stayed a taper of the superseded date beside the new taper.
- Both orders of the two statements now equal the later statement alone: test "C5: of two statements of one event date the later is the event…", and both handler grids.

**Effect for a single change.** A race postponed far while the athlete is in its taper window: this week's remaining days go back to training (as in a program generated with the new date). Before, they kept the taper and a second taper followed.
- **Your own instrument shows it** (V_D47reviews, `goalChange.moveDate`):
  - A walk/jog-built novice gets a 10K added on the Monday of week 11, for week 14. The next Monday it is moved to week 15.
  - Sunday of week 12 lay inside the old taper by days. It now goes back to the specific-phase dose: easy 20 → 25 minutes.
  - Week 13 then takes its step: an easy 30.
  - So the race statement after the move reads **30 minutes** of continuous running. It was 25 on FREEZE-2 and in your rounds 10–12.
  - Your condition (stated = the longest continuous run planned before the race) holds in both.
- No case of the R5 corpus, the R6 holdout, the profiles or the simulations changes with this rule. The check compared the full outputs of the runtime with and without it.

**Please rule** on it.

### S10. Adaptations that meet in one week (return, recovery and progression effects)

These were found before the freeze by running the handler grid on every evening of the week. All were also present on FREEZE-2.

**Rule (C4).** Content an adaptation moves into a slot keeps the week's earlier adaptations: they are applied again to that slot, each with its own clock.
- A missed Tuesday quality run moved to Thursday after a **systemic fatigue report** now runs easy. On FREEZE-2 the order "fatigue, then missed" placed a THRESHOLD on Thursday after the report.
- The same missed run after a **short return** reported that evening: the moved quality run is the first quality slot after the break, so it runs easy (your R27). On FREEZE-2 one order kept it a THRESHOLD.
- A move never uses a slot whose session was skipped. On FREEZE-2 the missed run moved onto a Thursday the athlete had marked unavailable.

**Rule (C4).** A systemic fatigue report on Sunday evening has nothing left to reduce, so it reviews the week with the systemic signal (R6, unchanged). The signal is now recorded, and a later review of the same week keeps it.
- On FREEZE-2, if the week's session reports arrived an hour after the fatigue report, the review recomputed without the signal, and next week advanced: 4 sets instead of the held 3, plus the block step.
- A fatigue report reported mid-week, which reduced rows, does not set this signal for the weekly review. That is as before.

**Rule (C2).** A goal change stated from a later date ("hypertrophy from week 5") now applies from the first week that begins on or after that date. Before, it applied from next week.

**Rule (C2).** A change from a later week starts that week from the week before it as planned, with its transition under the new context of that week (for example the new goal's repetition targets).

**Please rule:** do the fatigue-signal reading and these move rules fit R6-NONCLINICAL-RETURN condition 7, your FR2 and PLANNED-PROGRESSION?

## Your earlier records

- R7A-SSCTR-REGAIN-BASE, REESTABLISH-PHASE, SPLIT-WEEK (amended) and ITEMS-5-8 were bound to R7A-FREEZE-2.
- Please do the delta check you required and say whether each record binds FREEZE-A1.
- The human queue already holds HQ-R7A-SSCTR-* (bound to FREEZE-2). New or refined items go in your proposal with ids `HQ-R7A1-…`.

## What to return

Write `audits/domain-coaching-r7a1-2026-10-27/reviews/ssctr-r7a1-review.md` and `ssctr-r7a1-review.json` with at least:

```json
{
  "revision": "R7A1-SSCTR-r1",
  "reviewer": "SSCTR via documented fallback (fresh default instance loading adapter, constitution 1.0.0 and skill)",
  "gate": "R7A1_SCIENTIFIC_REVIEW",
  "freezeReviewed": {"revision": "R7A1-FREEZE-A1", "file": "CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A1.json", "sourceDigest": "<recomputed>", "policyHash": "<recomputed>"},
  "verdict": {"R7A1_SCIENTIFIC_REVIEW": "ACCEPT | NOT_READY", "reason": "..."},
  "items": [{"id": "S1-D56", "ruling": "...", "status": "CLOSED | OPEN", "blocking": false}],
  "d53": {"status": "CLOSED | OPEN", "basis": "..."},
  "d56": {"status": "CLOSED | OPEN", "basis": "..."},
  "earlierRecords": [{"id": "R7A-SSCTR-REGAIN-BASE", "bindsFreezeA1": true, "basis": "..."}],
  "newFindings": [{"id": "D57", "blocking": true, "what": "...", "requiredChange": "..."}],
  "queueItemsFile": "audits/domain-coaching-r7a1-2026-10-27/reviews/ssctr-r7a1-queue-items.json"
}
```

- Mark a finding blocking only if it is material in your scope. The bound allows **one** correction cycle with material findings only, then one narrow re-check of FREEZE-A2. There is no third cycle.
- State what you ran, and recompute the digest at your start and end.
