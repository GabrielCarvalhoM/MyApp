# SSCTR review of the R6 coaching envelopes

**Current state: round 8 (records revision r8), a delta binding review of R6-POLICY-4 at hash `1046ad0e…`, 2026-10-26.**

Earlier rounds are preserved unchanged:

| Round | File | Policy hash |
|---|---|---|
| 7 | `ssctr-review.r7.md` | `e9c87e09…` |
| 6 | `ssctr-review.r6.md` | `af2779fe…` |
| 5 | `ssctr-review.r5.md` | `f9f89b7f…` |
| 4 | `ssctr-review.r4.md` | `d766f0d9…` |
| 3 | `ssctr-review.r3.md` | `983171ac…` |
| 2 | `ssctr-review.r2.md` | `1c5e3844…` |
| 1 | `ssctr-review.r1.md` | `81114d89…` |

Round 1 holds the full evidence appraisal. My other earlier files carry matching `.r1`–`.r7` suffixes.

## Round 8 at a glance

**Verdict: FREEZE-2 is not allowed yet.** Three binding defects remain, D47–D49:
- D47 and D49 need policy declarations, so the policy hash will change again.
- D48 is a runtime text fix only.

**The round-7 defects:**

| Defect | Status |
|---|---|
| D42 | Resolved |
| D43 | Partly resolved. The residual is D47 |
| D44 | Resolved |
| D45 | Resolved in mechanism. The residual is D48 |
| D46 | Resolved |

**Dispositions at this hash:**

| Result | Boundaries |
|---|---|
| APPROVE_WITH_CONDITIONS (8) | COLD-START, LOAD-ESTABLISHMENT (D48 before freeze), PLANNED-PROGRESSION (D49 before freeze), RUN-QUALITY, HYBRID-ARRANGEMENT, SUBSTITUTION, PARTIAL-NOISY-LEARNING, ROTATION |
| REVISE (2) | NONCLINICAL-RETURN (D49), EVENT-TRANSITION (D47) |

**Effect at this hash.** The real authority enables the eight approved boundaries. I checked three cases:
- a cold-start program without an event or a pause is generated (PROPOSED);
- an event program returns UNSUPPORTED;
- a restart after a pause returns UNSUPPORTED.

Return reviews also fail closed.

## Reviewer, authority and target

**Reviewer.** The native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0. My instructions are the project adapter's body. I did not author the policy, the runtime or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This is not human, empirical or clinical validation, and it carries no runtime sovereignty.

**Target.** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-4.
- Canonical hash, recomputed with `value.mjs`: `1046ad0ef1291068b309e229852b782e8a8f0eee478c3f8aec59facedd80a554`.
- File SHA-256: `2ab7ea45d29cd520ce295ecd942718715edf8089b184cd2810ec130da698241c`.
- Both match the stated values. I also recomputed the reviewed round-7 bytes: `e9c87e09…` / `446e241e…`.

**Delta, from my own structured diff.** No earlier numeric value changed. The diff contains:
- the revision label and the revision note;
- changed text in four keys:
  - `establishment.belowMinimumSession`;
  - `strength.loggedLoadAdoption.semantics`;
  - `return.reasonScreen`;
  - `learning.missingGate`;
- six added declarations:
  - `strength.loggedLoadAdoption.establishmentAgreementIncrements` (1);
  - `event.modeAwareSessions`;
  - `event.raceDayCompletion` (modes WALK_JOG, RESTART, RETURN; `halfMarathonAchievedLongRunBelowMinutes` 75);
  - `event.longRunFloor`;
  - `return.eligibilityFlags`;
  - `return.strengthEntryWeek`.

The two numeric additions name values the runtime already used.

## What I ran and read

**Code read.** The changed runtime functions named in the request:
- `r6-program.mjs`, `r6-adaptation.mjs`, `r6-clinical.mjs`, `r6-intake.mjs`, `r6-legacy.mjs` and `r6-prescription.mjs`;
- the new test file `r6-ssctr-r7-fixes.test.mjs`;
- the updated test in `r6-adaptation.test.mjs`. It now confirms the asked establishment loads before checking for KEEP, which matches D45; I accept that update;
- the FREEZE-1 source of `r6-program.mjs`, to compare the event negotiation trigger and the return set logic.

**Tests.** `node --test` in CoachingCore: **408/408 pass**, run by me.

**My probe.** `ssctr-probe-delta-policy4-r8.mjs`, output in `.out.json`. It uses a **DEV_TEST_ONLY authority** (`devAuthority()`) bound to `1046ad0e…`, because the real authority has no current record at a new hash. Sections A–D, G and I–L repeat my round-7 logic; M–U are new.

| Section | What it covers | Result |
|---|---|---|
| A | 840 event programs over every race weekday | 0 violations; R10 holds in 792 taper and next-block weeks |
| B | 432 walk/jog cold starts | 0 violations (round 7: 56) |
| C | Seven walk/jog, restart and below-minimum event programs | Shows D47 |
| D | Round-7 logged-load cases | D44 and D45 behave as required |
| G | One wearable activity bound to two sessions | Both sessions CONFLICTED |
| I | Return facts | Flags `"true"` and `1` now CLINICAL |
| J | Round-7 screen battery | 0 mismatches |
| K | Missed-run gating | Holds |
| L | Projection gating | 0 steps without a session |
| M | D44 matrix | 0 violations |
| N | D45: logs, confirmations, agreement, hint | Mechanism correct; shows D48 |
| O | Return-entry ceiling and entry week | Correct |
| P | 360 mode-varied event programs | Mode rules hold; 51 programs show D47 |
| Q | Eligibility flag forms in the intake, review and legacy paths | 0 violations |
| R | 54-phrase screen battery | 20 new owned-gap residuals; negated damage never NONCLINICAL |
| T | D46 side effects | Two conservative gaps (R12, R13) |
| U | Strength sets through 17 return timelines | Shows D49 in 7 timelines |

**Author material.** I read the author's rerun of my round-7 probe (`ssctr-dossier/policy4-author-reruns/`) as author material, not as evidence. My own reruns agree with it on sections A–L.

**Not run or read.** `npm run verify` and the `verify-r*` scripts. The R6 holdout, FIRST_EVALUATION and any post-fix evaluation.

**Literature.** Europe PMC REST from Node works in this session. My first query batch used a sort parameter the API rejects and returned nothing; I corrected it and logged both runs. Four searches (`ssctr-evidence/search-r8.json`) added:
- **Kluitenberg 2015**, injury proportions by runner population. Full text, read. Used as **counterevidence**: over short follow-up, novice (26.4%) and recreational (28.0%) runners had similar time-loss injury proportions, and proportions were higher for runners training for longer distances.
- **Buist 2010**, abstract: a cohort preparing for a 4-mile event, in which no previous running experience was the strongest risk factor.
- **Lovegrove 2022**, abstract: loads chosen by reps in reserve are reproducible between sessions.
- **Halonen 2024**, abstract: strength lost over a break is regained quickly.

I re-read Frandsen 2025 (R6-S02, full text) for D47.

## The round-7 defects

| ID | Status | Evidence |
|---|---|---|
| D42 | **Resolved** | Probe B: no session holds more jogging than the longest current run, and each raised start is the highest step that fits |
| D43 | **Partly resolved** | Resolved: (a) event sessions follow the run mode; (c) strides only after executed strides; (e) declarations and tests. Narrowed: (b) and (d), now D47 |
| D44 | **Resolved** | Probe M: an above-plan load is adopted only on ADVANCE or EARNED. With RIR prescription−2, missed reps, no RIR log, a converging-fatigue review or an adverse response, the plan stays and the athlete is asked |
| D45 | **Resolved in mechanism** | Probe N: a first log is pending until it is confirmed, logged again or matched to the hint; the pending value travels in a proposal. The residual is D48 |
| D46 | **Resolved** | Probes L and P: no step without a planned session, and no ladder step in event weeks. Two conservative side effects: R12, R13 |

## New binding defects (required before FREEZE-2)

| ID | Boundaries | Defect | Required change |
|---|---|---|---|
| D47 | EVENT-TRANSITION | See below | See below |
| D48 | LOAD-ESTABLISHMENT | See below | See below |
| D49 | NONCLINICAL-RETURN, shared with PLANNED-PROGRESSION | See below | See below |

### D47: race day for athletes whose running was built from walk/jog or a restart

**Defect.** In R6-POLICY-3, the runtime emitted EVENT_AMBITIOUS_FOR_CURRENT_RUNNING for every athlete in the WALK_JOG or RESTART class. My D43(b) required a completion race day whenever that item applied. R6-POLICY-4 now ties both the completion and the item to the run mode in race week. So an athlete who leaves the walk/jog ladder or the restart a few weeks before a 10K now:
- races at "hard but controlled" effort, with "decide in the final part whether to press";
- gets **no negotiation item at all**.

**Evidence.**
- Probe P: 51 of 360 programs. Walk/jog-class racers reach a longest continuous run of only 15–25 minutes; restart-class racers reach 25–55 minutes.
- Probe C: a novice 10K in 12 weeks reaches a 20-minute longest run.
- For a half marathon, the item can read "a longest run of 0 minutes".

**Required change.**
- (a) Race day is a completion, and the item is emitted, also when the athlete was in WALK_JOG or RESTART mode in any week of the program before the race.
- (b) The item states the longest continuous run actually reached.
- (c) Declare both in `event.raceDayCompletion`. No exemption applies unless it is declared and reviewed.
- (d) Add the probe-C cases as regression tests.

### D48: the instruction on a pending establishment row

**Defect.** A row whose load is waiting for confirmation correctly shows no number. But its first instruction still says "Use the load you logged last time for this exercise", before the effort rule. For a typed error, that line points the athlete back at the unconfirmed value.

**Required change.** A pending row describes effort-guided selection only, as at establishment. Assert this in the D45 test. No policy change is needed.

### D49: strength sets after a return

**Defect.** Two runtime behaviours combine:
- return weeks earn a block-boundary set;
- return step 2 is computed from the base set count, not from the dose prescribed before the break.

**Evidence.** In 7 of 17 return timelines in probe U, the first week after the return:
- jumps from 2 to 4 sets; and/or
- exceeds the last dose before the break. For example, s1-d35 goes 3 sets before the break, then 1, 2, 4.

This breaks both the return ceiling and the one-set-per-week rule. **It predates R6-POLICY-4**, because the FREEZE-1 source has the same logic. I missed it in rounds 1–7.

**Required change.**
- (a) Return weeks never count toward a block-boundary set.
- (b) After the return steps, sets come back one per executed week, up to the last executed pre-break count.
- (c) Declare this in `operational.return`, with the return-step load cap as the runtime applies it.
- (d) Add the timelines s1-d35, s3-d21 and s5-d14 as regression tests.

## Answers to the dossier's six questions

### Q1 — D44: is the exercise gate (ADVANCE or EARNED) the right reading?

**Yes.**
- The weekly exercise gate is ADVANCE exactly when the athlete met the target reps, logged RIR at or above the prescription minus one, and reported no adverse response.
- When an exercise appears twice in a week, the first exposure that is not ADVANCE decides the gate, which is conservative.
- A converging-fatigue hold is an adverse signal, so letting it block adoption is consistent with "no adverse response".

### Q2 — D45: the agreement tolerance and same-week logs

- **One increment: yes.** It is at or above the session-to-session variability of effort-selected loads (Lovegrove 2022, abstract), and it is the resolution of the equipment.
- **Two agreeing logs in the same week: yes,** provided they come from separate sessions, which the runtime ensures.
- **Two consistent implausible logs: accepted inside D45.** My condition was that a single unconfirmed log never becomes a number. Plausibility stays Data-owned and open.

D48 must still be fixed.

### Q3 — The return ceiling during the return steps

**Confirmed.**
- Before the entry load is adopted, the cap is the load before the break.
- In return step 2, the cap is the adopted entry load ("no increase yet"). This is stricter than the declared text, and it matches the step-2 instruction.
- Normal progression resumes after the steps, and strength returns quickly after short breaks (Halonen 2024).

Declare the rule as the runtime applies it, together with D49.

### Q4 — The author-found return-entry change

**Confirmed for both parts.**
- The entry dose applies to every exposure of the entry week (probe O).
- Return step 2 applies to exercises first set up in the entry week.

The week after step 2 is not acceptable yet, for those exercises and for known ones (D49).

### Q5 — R6: eligibility flags

**Confirmed for all three parts.**
- Twelve yes-meaning forms route to CLINICAL_HUMAN_REQUIRED in the intake, the review and the legacy path.
- Non-boolean values that mean no stay ASK (the legacy review returns HOLD). This is stricter than the interruption flag, and right for eligibility, because unknown is neither clearance nor illness.
- A clinical status in any letter case routes to a human.

### Q6 — R7: local negation and the new phrases

**Accepted inside my owned gap.**
- Locally negated damage statements are ASK in all three languages, and never NONCLINICAL.
- Affirmed damage stays CLINICAL wherever else a negation sits, including "I don't think I broke my leg" and "Almost broke my ankle".
- A baby mention in a FAMILY note costs one question.

**New residuals still screen NONCLINICAL** with a nonclinical category:
- birth-related: C-section, maternity leave, newborn, breastfeeding and miscarriage, in several languages;
- assault;
- minor procedures;
- stings and burns ("hand" is not in the body-part list);
- "nothing broken, just bruised".

They are recorded as **R11**. Pregnancy and postpartum have a structured exclusion at intake, but nothing asks about them again at reviews or returns. That belongs in the structured intake design re-review.

## R6, R7, R9, R10 and the author-found change

| Item | Ruling |
|---|---|
| R6 | Adopted and accepted |
| R7 | Adopted and accepted inside the owned gap; new residuals in R11 |
| R9 | Adopted for the half marathon (achieved long run under 75 minutes). For walk/jog- or restart-built 10K racers it is now binding as D47. For EASY-class 10K racers it stays a recommendation |
| R10 | Adopted: across 792 taper and next-block weeks, the long run is never shorter than the easy run |
| Author-found change | The entry week and step 2 are accepted; the following week is D49 |
| R5, R8 | Still open, as the author stated |

## Dispositions at hash 1046ad0e…

Evidence status is SUPPORTED_WITH_LIMITS for all ten boundaries.

| Boundary | Disposition | Binding | Notes |
|---|---|---|---|
| R6-COLD-START | APPROVE_WITH_CONDITIONS | None | D42 and the R6 intake flags confirmed |
| R6-LOAD-ESTABLISHMENT | APPROVE_WITH_CONDITIONS | D48 before freeze | D44 and D45 confirmed |
| R6-PLANNED-PROGRESSION | APPROVE_WITH_CONDITIONS | D49 (shared) before freeze | D49 shows only through returns, which stay disabled |
| R6-RUN-QUALITY | APPROVE_WITH_CONDITIONS | None | D46 and D43(c) confirmed |
| R6-HYBRID-ARRANGEMENT | APPROVE_WITH_CONDITIONS | None | Re-bound; the day-based checks hold |
| R6-SUBSTITUTION | APPROVE_WITH_CONDITIONS | None | Re-bound |
| R6-NONCLINICAL-RETURN | **REVISE** | D49 | R6, R7, Q3 and Q4 accepted |
| R6-EVENT-TRANSITION | **REVISE** | D47 | D43(a, c, e), R9 (half marathon) and R10 accepted |
| R6-PARTIAL-NOISY-LEARNING | APPROVE_WITH_CONDITIONS | None | Re-bound |
| R6-ROTATION | APPROVE_WITH_CONDITIONS | None | Re-bound |

## Non-blocking recommendations

| ID | Recommendation |
|---|---|
| R1, R2 | Unchanged from earlier rounds |
| R5 | Confirm a load logged far below the plan. Data owns the threshold |
| R8 | Collect the keep-or-change choice before the race window |
| R9 (rest) | For EASY-class 10K racers whose achieved long run is far below the race, default to completion pacing. Any threshold must be declared and reviewed |
| R11 | Add the round-8 lexical residuals, and the missing body parts. In the structured intake design, ask about pregnancy/postpartum again at reviews and returns |
| R12 | When every easy day is a walk, walks never convert back to runs. Gate the conversion on the executed long run, or change the negotiation text. Probe T: two walks and one run growing from 15 to 60 minutes over 16 weeks |
| R13 | `projectionGates` should map RESTART and RETURN sessions to the EASY gate, as `weeklyGates` does. Today a return with a single long-run day never completes in projection |

I recommend fixing R11–R13 in the same revision as D47–D49.

## May the runtime be frozen as FREEZE-2?

**No.** `freezeVerdict.runtimeMayBeFrozen` is false, with D47, D48 and D49 blocking. `scripts/freeze-r6-2.mjs` will therefore refuse.

1. Implement D47–D49 with their regression tests and the policy declarations for D47 and D49.
2. Request a delta binding review of the resulting hash. In it, probes A–D, L and M–U are re-run and all ten records are re-bound.
3. FREEZE-2 may follow only after that review.

**Before production, a KMP port or any real-athlete use:** re-review the free-text screen and its battery together with the structured intake design, including a pregnancy/postpartum status that is asked again at reviews and returns. This is the owned open gap, now including R11.

## Human queue

`ssctr-proposed-queue-items.json` (revision r8) proposes eight funded-human revalidation items, one per approved boundary at this hash. The two REVISE boundaries have no current approval and no item.

The r8 proposal supersedes the unmerged r1–r7 proposals. The r7 items named `e9c87e09…`, whose approvals expired with the policy change. I did not edit the queue file, and funding is NOT_DECLARED.

## Escalation and routing

**No escalation.**
- No envelope magnitude is widened: the two numeric additions name values already in use.
- No clinical boundary is weakened. R7 moves only locally negated damage statements from CLINICAL to ASK, never to a nonclinical return.
- Every required change is one I can approve. No Founder decision is needed.

**Routing:**
- **Runtime author:** D47–D49, with R11–R13 recommended in the same revision.
- **Data / Engineering:** numeric plausibility for logged and confirmed loads (D45, R5).
- **Product / Data:** the structured pregnancy/postpartum status at reviews and returns (R11), and the learning-consent privacy scope (unchanged).

## Validation

All ten records and the queue proposal pass the project validator: jsonschema 4.26.0, run with a bundled Python 3.12.14 via `ssctr-validate-r6.py`. The policy-review cross-check passes, and every recorded file hash is current.

This certifies record consistency only.

## Files

Written in this round:
- `ssctr-build-r6-r8.mjs`, the build script, which replays rounds 1–7 unchanged and adds round 8;
- `ssctr-probe-delta-policy4-r8.mjs` and its `.out.json`;
- `ssctr-r8-literature.mjs`;
- in `ssctr-evidence/`: `search-r8.json`, `abstracts-r8.json` and `PMC4513221.xml`.

Updated in this round:
- `ssctr-policy-review.json`;
- `ssctr-records.json`;
- `ssctr-proposed-queue-items.json`;
- `ssctr-evidence-manifest.json`;
- `ssctr-schema-validation.json`;
- this file.

The `.r1`–`.r7` files are unchanged.
