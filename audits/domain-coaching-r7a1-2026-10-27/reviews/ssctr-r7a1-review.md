# SSCTR review of R7A1-FREEZE-A1

**Revision R7A1-SSCTR-r1, 2026-10-27.** Gate `R7A1_SCIENTIFIC_REVIEW`. Target: runtime R7A1-FREEZE-A1, at the unchanged policy R6-POLICY-5 (`18ec48f3…`). My previous position is R7A-SSCTR-r2 on R7A-FREEZE-2. Structured record: `ssctr-r7a1-review.json`. Queue proposal: `ssctr-r7a1-queue-items.json`. Both are in this folder.

## At a glance

**Verdict: `R7A1_SCIENTIFIC_REVIEW` = NOT_READY** for my scope.

Two material findings block. Both are narrow and runtime-only, need no policy text, and were already present on R7A-FREEZE-2:
- **D57**: the return cap ends too early, so a count comes back from 1 to 3 sets at once. It is a known equivalent path of D53.
- **D58**: the short return's easy first quality slot does not reach next week when this week's quality slot is already past. The QE-R7A-02 class is not closed.

**D56 = OPEN. D53 = OPEN.**
- The D56 formulation is settled: "the last executed exposure", as implemented. I approve it, and the freeze meets it for the rise of both caps and for the regain cap.
- It is not met for the end of the return cap (D57). So the D56 class is not closed, a known equivalent state mode allows a restoration jump, and Founder §10 keeps D53 open.

| Item | Ruling | Status |
|---|---|---|
| S1 D56 formulation | "An executed exposure" means the **last** one. Approved and met for the rise. The return-cap end does not meet it (D57) | OPEN, blocking (D57) |
| S2 accessories no ceiling covers (R23 class) | Not an equivalent state mode of D53. It is the separate R23 policy question | Ruled, non-blocking |
| S3 QE-R7A-02 / R27 | C1 and the noon boundary are accepted, and the same-day case is fixed. Condition 7 is not met when this week's quality slot is past (D58) | OPEN, blocking (D58) |
| S4 QE-R7A-12 dose reading | Approved. My R25 is met | Closed |
| S5 return supersession | Approved: consistent with conditions 9 and 21 and `strengthKnownLoadAfterReturnLog` | Closed |
| S6 one start rule, run ceiling | Approved on all three questions | Closed |
| S7 same-day effects | No sporting objection | Closed |
| S8 confirmations | Confirmed: QE-R7A-01, 03, 19 and O-1 | Closed |
| S9 event change out of the window | Approved | Closed |
| S10 adaptations that meet in one week | Approved. The short-return case is D58 | Closed |

**My earlier records.** All five bind FREEZE-A1 after the narrow delta check. Their unmet clauses (D57, D58) stay outside the approval. Details are under "My earlier records on FREEZE-A1".

## Reviewer, authority and target

**Reviewer.** The SSCTR as the **documented fallback**. The native SSCTR agent type is not exposed in this session.
- This is a fresh default Claude Code instance (model `claude-opus-5-5`). It explicitly loaded the adapter `.claude/agents/sports-science-concurrent-training-reviewer.md`, the constitution SSCTR-CONST-1.0.0, `.agents/skills/sports-science-review/SKILL.md`, the evidence protocol, the template, the schema and the escalation policy.
- My instructions are the Chief's dispatch prompt.
- No Agent tool was used.
- I did not author the policy, the runtime, the composition contract or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only. This is not human, empirical or clinical validation. It carries no runtime sovereignty and no Product Truth publication.

**Target: R7A1-FREEZE-A1, verified at the start and at the end** (`ssctr-r7a1-verify.mjs`).
- Freeze file `9e7b9cec…`; all 77 bound files match.
- Source digest recomputed with `value.mjs`: `2de8681f13e5cb499df6a5a3dc443d52877850528ceb298b598d03de6ec2141a`, the same at both times.
- Policy canonical hash recomputed: `18ec48f3…`; policy file `a75be1aa…`.

**Comparator.** The byte-exact FREEZE-2 snapshot in `freeze2-source/`: 75/75 files match, digest `f56ae974…`.

**Delta from FREEZE-2.**
- Changed: `r6-adaptation.mjs`, `r6-program.mjs`, `r6-provenance.mjs` and `test/r7a-semantic-core.test.mjs`.
- Added: `src/r6-composition.mjs` and `test/r7a1-composition.test.mjs`.

## What I ran and read

| Check | Result |
|---|---|
| `node --test` in CoachingCore (Node 24.19.0) | 495/495 pass |
| My round-12 instrument, byte copy (`618c110f…`), as `ssctr-r7a1-instrument.mjs` with `R7A_PROBE_OUT` | All 43 sections equal the author's A1 output. Against my R7-A CYCLE2 output only `V_D47reviews` differs (`moveDate` stated and `fromSessions` 25 → 30), plus the two COMPARE lists that name it. AH, AI, AJ, AK, AL, AM and AN are unchanged |
| My restoration grid `ssctr-r7a1-grid.mjs`, on both runtimes | 864 timelines each: re-establishment, 16-day returns reported Monday or Thursday, and a 24-day return; three goals; known or no exercises; 1–3 strength days of 20–40 minutes; budget kept or raised. Also a FULL run and traces on A1 |
| My short-return grid `ssctr-r7a1-short.mjs`, on both runtimes | 315 cases each. One layout was skipped by the runtime's own ASK (a temporary preference is needed) |
| My targeted probe `ssctr-r7a1-probe.mjs`, on both runtimes | Sections S1 (minimal timeline, QE-R7A-22, legacy rows), S4, S5, S6, S7, S8, S9, S10 |
| Author probes, rerun read-only | `r7a1-composition-probes.mjs` and `r7a1-d56-grid.mjs`: byte-identical to their A1 outputs (11/11 clean; 0/196) |
| `node CoachingCore/scripts/verify-r7a1.mjs`, without `--write` | 13/15. The two open checks are `independent-reviews` and `deliverables`, as expected before the reviews |
| Literature (`ssctr-r7a1-literature.mjs`) | PubMed HTTP 200: two directed searches, four abstracts. Europe PMC full text HTTP 200. No new full text read |

**Read.** The adapter, constitution, skill, protocol, template, schema, escalation policy and registry. The mission blocks and the SSCTR follow-up. The Founder request, task contract, checkpoint, composition contract and my dossier. My R7A-SSCTR-r2 re-check and its records. My round-12 conditions. The sporting hunks of the diff: `advanceStrength`, `r6-composition.mjs`, `returnAfterPause`, `goalChange`, `weeklyReview`, `fatigue` and `rebuild`. The relevant author tests.

**Not run.**
- `npm run verify`, `npm run simulate`, `npm run demonstrations:r6`.
- Any earlier `scripts/verify-r*.mjs`, `regress-r7a*.mjs`, `freeze-r7a1.mjs`, `prepare-r7a1.mjs`.

**Not read.** The engineering judge's `qe-*` files in this folder and its review, to keep the two judgments independent.

**Authority used.** The DEV_TEST_ONLY `devAuthority()` of each runtime, bound to the unchanged hash. The data are synthetic and offline.

**Housekeeping.** Three of my parallel runs started in the wrong folder, `C:\Users\carva\Desktop\myApp\`. They failed at once and left six files: three error logs and three empty outputs. I moved them to my scratchpad, deleted nothing, and reran the runs correctly.

## S1. D56: last or any executed exposure

**Ruling: the last executed exposure, the one that gives the week's counts (R19, INV-04). Approved.**

This is what my own records already say:
- REGAIN-BASE condition 5: "a week whose last executed exposure … executed its whole count";
- ITEMS-5-8 item 7: "a week whose last executed row … earns no regain, return-cap or return-ceiling set".

My r2 wording "an executed exposure" in the D56 condition was imprecise. "Any" would release a cap that a later reduction holds, which breaks FR2.

**QE-R7A-22, verified on both runtimes.**
- Setup: the bench press on days 0 and 3, at 75 minutes. Day 0 was executed whole at 3x5. A systemic fatigue report on Tuesday evening reduced day 3 to 2x5 @RIR4.
- The regain cap stays at 3, and the next week is 3x5.

"Last" is never less conservative than a reading that also credits an earlier whole session.

**Minimal timeline (as in the dossier):**

| Week | FREEZE-A1, constant 25 min | FREEZE-A1, raised to 75 after week 8 | FREEZE-2, raised |
|---|---|---|---|
| 8 | 2x5 (trimmed from 3); cap 3 | 2x5; cap 3 | 2x5; cap released |
| 9 | 2x5; cap 3 | **3x5** | **4x5** |
| 10 | 2x5; cap 3 | 4x5; cap ended | 4x5 |

**Legacy rows.** Rows without counts read the week's planned counts: the cap stays 3, as with counts.

**My grid on FREEZE-A1.** No regain or return cap rises after a week whose last executed exposure was not whole. Cap-weeks with a trimmed last exposure are covered: 923 for the regain cap and 581 for the return cap.

**Not met: the end of the return cap.** This is D57, below.

**Cost of "last" (R30, non-blocking).** In 517 cap-weeks an earlier session did its whole count and the last one was trimmed by time; the cap holds, and 451 exercises were still capped at week 15.
- This is conservative and allowed by "at most one set per executed week".
- It reverses as soon as the last session of a week fits.

## S2. The accessories no ceiling covers (R23 class)

**Ruling: not a "known equivalent state mode that allows a restoration jump". It is the separate R23 policy question, non-blocking. On its own it does not keep D53 open.**

**Why.** D53's class is a count the declared policy places under a restoration ceiling coming back faster than that ceiling allows, in any state mode. That ceiling is the regain cap after a re-establishment, or the return steps, cap and ceiling after a return. The R23 exercises carry none at any point:
- bodyweight rows are never re-established;
- an exercise not in use during the return steps carries no return step (NR-19, D51) and is established or re-established by effort when it reappears (NR-20, D52);
- a first establishment progresses as a new exercise (NR-21, R17).

So no ceiling is reset or bypassed. Covering these exercises would need a new sporting rule, which this mission forbids.

**Numbers.**
- Author grid: 30 jumps.
- My grid on FREEZE-A1: 237. Dead-bug (bodyweight) 126, db-calf-raise 54, db-split-squat 33, one-arm-db-row 18, db-overhead-press 6.
- On FREEZE-2: 245. Bench and row also appeared there; FREEZE-A1 now caps them.
- Example: a never-performed calf raise at 1 set inside a 20-minute budget, then 3 sets at 75 minutes.

**Magnitude.**
- The loads are bodyweight, or effort-chosen at RIR 3 or more, with at most 3 sets.
- Repeated-bout protection lasts for weeks (R6-S48), and 2–3 sets is the position stand's range (R6-S01).
- Four weeks off cost 6–9% of strength (R7A1-S01, abstract). Three weeks of retraining restored unloading losses (R7A1-S02, abstract).
- Counterevidence: a review advises starting lower and raising volume gradually (R7A1-S03, abstract). That favours deciding R23, not a jump.

The record is `R7A1-SSCTR-RESTORATION-SCOPE`, disposition ABSTAIN on a rule.

## S3. QE-R7A-02 and R27: same-day eligibility and the easy slot

**Accepted: C1.** It is one test of "still ahead" for every handler.

**Accepted: the noon end of a morning session.** It is an operational convention of a plan that knows only the chosen shift, not a physiological threshold.
- On both sides of noon the dose stays at or below the last executed dose.
- A session that may already have been done is never rewritten.
- Its data semantics belong to Product/UX and Data (SHIFT-CLOCK).

**Fixed: the same-day case.** A 5-day break reported at 05:00 on a Thursday quality day, or at 21:00 the evening before, gives an EASY Thursday run.

**Not met: condition 7.** This is D58, below.

## S4. QE-R7A-12: the dose reading

**Approved.** Planned 3x5 at 80 kg, STRENGTH range 4–6:

| Logged | Gate | FREEZE-2 next | FREEZE-A1 next |
|---|---|---|---|
| 77.5 × 5, 3, 5 | HOLD | 3x3 @77.5 | **3x5 @77.5** |
| 75 × 4, 4, 2 | HOLD | 3x2 @75 | **3x5 @75** |
| 75 × 3, 3, 3 | HOLD | 3x3 @75 | **3x5 @75** (my R25 met) |
| 77.5 × 5, 5, 5 | ADVANCE | 3x5 @77.5 | 3x5 @77.5 |
| 70 × 10, 10, 10 | ADVANCE | 3x6 @70 | 3x6 @70 (inside the range) |
| 80 × 5, 3, 5 / 82.5 × 5, 5, 5 | HOLD / ADVANCE | 3x5 @80 / @82.5 | unchanged |

A known-load log is progression evidence, so the declared gate decides the target. Only an establishment exposure sets its target from what it logged. This is the observation / progression evidence / target separation the Founder asks for.

## S5. A return supersedes the plan before the break

**Approved.** It is consistent with conditions 9 and 21 and `strengthKnownLoadAfterReturnLog`.

**17-day vacation reported Thursday 07:00.** The Monday lifting fell in the break.
- The Thursday lifts get RETURN_ENTRY at 1 set @RIR4.
- Next week the goblet squat, which is on Monday only and was not done since the break, gets **RETURN_ENTRY 1x8 @RIR4**. FREEZE-2 gave RETURN_STEP 2x8 @RIR3 with no entry logged.

**Corrected report.** A 16-day report at Saturday 07:00 is corrected to 5 days at 08:00. The week then equals the 5-day report alone. FREEZE-2 kept the 16-day re-entry.

**R31 (non-blocking, pre-existing).** In the week after such a mid-week return:
- the review holds some exercises that did their entry at the entry dose (bench and row, which share a session with a late-starting lift) and gives others step 2 (RDL, split squat);
- the review path is the same on FREEZE-2;
- no dose exceeds its own exercise's return recipe.

To declare in the next policy revision: whether a week whose only entry-step exercises are late starters is a return-entry week.

## S6. One start rule for next week, and the run ceiling

**Approved on all three questions.**

1. **A conditional start for a mid-week change to future weeks is acceptable.** It is planning, not prediction: rows are assumed executed, as every later week is planned. The weekly review re-derives the start from evidence.
   - Evidence: a schedule or goal change on Wednesday, then a review with Thursday onward missed, gives next week the same strength and run states as the review followed by the change. This holds on both runtimes.
   - The mid-week start itself is the conditional plan (squat 85 kg). FREEZE-2 held it at 82.5.
2. **"A complete week with no reports holds" is correct for every handler.** Unreported sessions of a complete week are missed (the weekly-review contract), and a dimension with no executed session holds (PP-13). The later review equals the review-first path.
3. **The ceiling reading of planned weeks is the policy text:** "in a conditional projection, earlier projected weeks count as executed". The first week a review projects still uses completed runs only.

All three rest on the weekly-review contract (R18).

## S7. Same-day effects

**No sporting objection.**
- **Evening reports.** An evening report no longer rewrites that morning's session. My short grid finds 0 such rewrites on FREEZE-A1 and 30 on FREEZE-2.
- **Same-morning substitution.** A barbell-free window from that day, reported at 07:00, gives the afternoon session a never-performed dumbbell RDL at its effort-guided establishment, 2x5 @RIR3 FIRST_ESTABLISH. FREEZE-2 kept a barbell RDL the athlete could not do.

## S8. Confirmations

Confirmed from the sporting side:
- **QE-R7A-01:** the first strength week after the break is RETURN_ENTRY, with the run in RETURN mode, in either order (author test C3).
- **QE-R7A-03:** one race (author test C5/C7, and my S9 section).
- **O-1/R28:** the reviewed 16 kg bench survives the equipment change. FREEZE-2 gave 20.
- **QE-R7A-19:** fatigue, an unavailable day and local fatigue survive an event change in either order (author test C4).

My own QE-R7A-01 scenario did not reach the defect, because the window kept the barbell, so I rely on the tests for it.

## S9. An event change that takes days out of the event window

**Approved.**
- Days count to the race in both directions, as in my S4.
- A 10K postponed four weeks on the Tuesday of its taper week sends the remaining days back to build doses:
  - Thursday strength 4x6 @95 kg, from the taper's 2x6;
  - easy run 40 → 50 minutes;
  - long run 45 → 70 minutes.
- One taper (week 12) and one race remain. FREEZE-2 kept the superseded taper, so it had tapers in weeks 8 and 12.
- Effective tapers last up to about three weeks (R6-S14), so a taper five weeks out is not a taper of the new race.
- The one changed value of my instrument (race statement 25 → 30 minutes) still equals the longest continuous run planned before the race. That is my condition.

## S10. Adaptations that meet in one week

**Approved.** They fit condition 7, FR2 and PLANNED-PROGRESSION:
- no quality run follows a systemic fatigue report, in either order;
- a move never uses a slot marked unavailable;
- a Sunday-evening fatigue report with nothing left keeps its signal through the later review, so next week holds (squat 82.5, not 85; long run 70, not 75). FREEZE-2 lost the signal;
- a strength goal stated from week 7 leaves weeks 5 and 6 unchanged. It starts week 7 from week 6 as planned, under the new goal (3x7 @85). FREEZE-2 changed weeks 5 to 7.

The short return reported the evening of a missed last quality slot is D58.

## D57 (new, blocking): the return cap ends too early

**What happens.** At and after the end of the return steps, the return cap ends as soon as it reaches **the ending week's** normal count. That happens whatever the week executed, and whatever the same transition adds.

**Mechanism.**
- The return ceiling can be below the normal count: a pre-break count fitted to the time budget gives a low ceiling (R20).
- The cap can then reach the normal count only when a block boundary lifts the ceiling.
- That same boundary adds the block-boundary set to the normal count.
- So the cap ends, and the count comes back two sets at once.

**Traced timeline** (identical on FREEZE-2): a 16-day return; RUNNING_SUPPORT; a 20-minute strength day before the break; the budget raised to 75 minutes after the first week back.

| Week | db-row executed | Cap / ceiling |
|---|---|---|
| 6–7 | 1 (entry, step 2) | ceiling 1 |
| 8–11 | 1 | cap 1, ceiling 1 |
| end of 11 (block boundary) | — | ceiling 2, cap 2 = week 11 normal 2, so the cap **ends** |
| 12 | **3** (normal 2 + block set) | none |

**Grid on FREEZE-A1:**
- 38 counts more than one set above the largest count executed since the return: db-row and db-bench-press, after 16- and 24-day returns, all RUNNING_SUPPORT at 20 minutes with the budget raised;
- 8 return-cap ends after weeks whose every exposure was fitted below its count, which my D56 condition forbids ("neither raises nor ends").

On FREEZE-2 the grid finds 174 such counts and 307 cap rises or ends after trimmed weeks. The author's 25–35 minute grid does not reach this configuration.

**What it contradicts:**
- `strengthReturnSets`: "comes back at most one set per executed week …, up to the ceiling … goes above it only through a later development block";
- R6-NONCLINICAL-RETURN condition 9;
- my D56 condition: "neither raises nor ends … so the next count stays at most one set above the largest count executed".

**Required change** (runtime only, no policy text):
- The return cap, and the regain cap by the same rule, ends only after a week whose last executed exposure did its whole count after its time fit. That is the D56 predicate of its rise.
- It ends only when the cap is at or above the count the exercise would otherwise have **next** week: its normal count including any block-boundary set earned at that transition, with phase reductions on top.
- No count after a re-establishment or a return may exceed the largest count executed since then by more than one set, block boundaries included.

**Regression:**
- `ssctr-r7a1-grid.mjs` with B = 0, C = 0 and no cap end after an unwhole week over its 864 timelines;
- a test of the traced db-row timeline.

**Sporting weight.** It is the same class and size as D53, D55 and D56, which blocked: a two-set jump within a return's cap. The athlete has trained at one set for several weeks, which lowers but does not remove the concern. The configuration is a runner doing minimal strength in a short budget, which is ordinary.

## D58 (new, blocking): the short return's easy slot stops at this week

**What happens.**
- A short return whose re-entry starts in the return's week (two or more sessions ahead) records the easy-slot adaptation on that week only.
- When that week's quality slot is already past, no slot is made easy.
- Next week's first quality slot keeps its quality dose, and still does after the weekly review.

**Grid on FREEZE-A1:** 96 of 315 cases, against 135 on FREEZE-2.
- In the Tuesday-quality layout: reports from Tuesday afternoon to Saturday.
- In the Friday-quality layout: reports on Friday afternoon (morning shift) or Saturday.

**Doses in those cases:**
- THRESHOLD 41 next week after a 3- or 6-day break, where the last executed quality was 41;
- **THRESHOLD 41 after a 10-day break whose last executed quality was 34**, one earned step above it.

The author's tests cover the same-day morning and the next-week re-entry, not this case.

**What it contradicts:**
- R6-NONCLINICAL-RETURN condition 7: "SHORT: … the first quality slot runs easy";
- my CYCLE2-COMPOSITIONS condition 5: "the first quality slot still ahead of the review … runs easy";
- the runtime's own comment: "the first quality slot still ahead of its report runs easy".

It is the class of the named blocker QE-R7A-02, in another timing.

**Required change** (runtime only, no policy text):
- The easy slot is the first quality slot still ahead of the return report (C1), in the week re-entry starts or a later week.
- It runs easy and is recorded as the adaptation of the week that holds it, so later re-plans and the weekly review keep it.
- Exactly one slot changes.

**Regression:**
- `ssctr-r7a1-short.mjs` with 0 defects after the return and after the review on all 315 cases;
- a test for a return reported the day after the week's quality slot.

**Sporting weight.** By itself it is modest. Evidence on ≤10-day breaks (abstracts only): unchanged VO2max after 10 days (R7A-S06), about 4% lower after 14 days (R7A-S04), measurable losses at two weeks (R7A-S05). The athlete has also done two or more sessions since the break.

It blocks for two reasons:
- a declared condition of mine is not met in a third of my short-return grid, including at a step above the last executed dose;
- the class is a named blocker the Founder requires CLOSED.

## My earlier records on FREEZE-A1 (the narrow delta check)

| Record | Binds FREEZE-A1? | Basis |
|---|---|---|
| R7A-SSCTR-REGAIN-BASE | Yes, re-bound as R7A1-SSCTR-REGAIN-BASE | Conditions 3–7 are met. Condition 9 (D56) is met for the regain cap and the rise of the return cap. Its return-cap end clause is not met (D57) |
| R7A-SSCTR-REESTABLISH-PHASE | Yes, unchanged | AK is equal. Each week is validated in its own context, and no row is above its cap or phase dose (C = 0) |
| R7A-SSCTR-SPLIT-WEEK (amended) | Yes, condition 4 amended | The cap rise now reads "the last executed exposure", which is met. R20 is met |
| R7A-SSCTR-ITEMS-5-8 | Yes, unchanged | Item 7 is confirmed (QE-R7A-22). Item 8 is strengthened. D55 is still met. R31 is noted |
| R7A-SSCTR-CYCLE2-COMPOSITIONS | Yes, conditions updated | Condition 5 (R27) is met for the same day and not met for D58. Condition 6 is widened by S9. Condition 9 is the final D56 formulation, with D57 open |

## Non-blocking recommendations

| Id | Kind | Owner | Recommendation |
|---|---|---|---|
| R30 | New, a trade-off of "last" | Runtime author with Product Constitution & Governance | Count a week whole when its last exposure was trimmed only by time and an earlier exposure did its whole count |
| R31 | New, pre-existing | Same | Declare whether a week whose only entry-step exercises are late starters is a return-entry week |
| R23 | Retained, sharpened | Same | Decide whether a time-trimmed first exposure or an uncovered accessory rises one set per week (237 jumps in my grid) |
| SHIFT-CLOCK | New, not sporting | Product/UX with Data | Confirm noon as the end of a morning shift in the data semantics |
| R25, R28 (O-1) | Closed | — | Met |
| R27 | Superseded | — | Its same-day part is met; the rest is D58 |
| R26, R21, R22, R17, R18, F-ACCESSORY-REPS | Retained | As in R7A-SSCTR-r2 | R18 also carries the conditional starts of S6 |

## Records and queue

There are ten records, all revision R7A1-SSCTR-r1, all bound to R7A1-FREEZE-A1.

**Five new records:**
- **R7A1-SSCTR-D56-FORMULATION** (S1): APPROVE_WITH_CONDITIONS. D57 is a condition, not met.
- **R7A1-SSCTR-RESTORATION-SCOPE** (S2): ABSTAIN on a rule; not prescriptive, so no queue item.
- **R7A1-SSCTR-SAME-DAY** (S3, S7): APPROVE_WITH_CONDITIONS. D58 is a condition, not met.
- **R7A1-SSCTR-DOSE-READING** (S4): APPROVE_WITH_CONDITIONS.
- **R7A1-SSCTR-COMPOSITION** (S5, S6, S8, S9, S10): APPROVE_WITH_CONDITIONS.

**Five re-bound records**, each superseding its R7A-SSCTR-r2 record:
- R7A1-SSCTR-REGAIN-BASE
- R7A1-SSCTR-REESTABLISH-PHASE
- R7A1-SSCTR-SPLIT-WEEK
- R7A1-SSCTR-ITEMS-5-8
- R7A1-SSCTR-CYCLE2-COMPOSITIONS

Conditions marked not met fall outside the approval until a later freeze meets them.

**Queue proposal R7A1-SSCTR-QUEUE-PROPOSAL-r1.** It holds nine items, one per approved prescriptive decision, each bound to R7A1-FREEZE-A1, all QUEUED_FOR_FUNDED_HUMAN_REVALIDATION:
- `HQ-R7A1-SSCTR-D56-FORMULATION`, `-SAME-DAY`, `-DOSE-READING`, `-COMPOSITION` (new decisions);
- `HQ-R7A1-SSCTR-REGAIN-BASE`, `-REESTABLISH-PHASE`, `-SPLIT-WEEK`, `-ITEMS-5-8`, `-CYCLE2-COMPOSITIONS`. These refine, and do not replace, the integrated `HQ-R7A-SSCTR-*` items bound to FREEZE-2.

Funding is NOT_DECLARED. This is a proposal only: I did not edit the queue file. The Chief integrates it append-only.

## Literature access

**Tools.** Node `fetch` to PubMed E-utilities (esearch, esummary and efetch, all HTTP 200) and the Europe PMC full-text endpoint (HTTP 200).

**Searches.** Two directed searches:
- Q1: detraining and retraining with muscle damage, repeated-bout or volume terms (46 hits);
- Q2: autoregulated volume (25 hits).

**Abstracts read.** Izquierdo 2007 (R7A1-S01), Campbell 2013 (R7A1-S02), Sousa 2024 (R7A1-S03, counterevidence) and Hickmott 2022 (R7A1-S04).

**No new full text was read.** No ruling rests on these abstracts alone.
- R6-S01, R6-S14, R6-S45, R6-S48, R6-S52, R6-S53, R6-S55, R7A-S01 and R7A-S03 to S06 are reused verbatim.
- D57 and D58 rest on the declared rules and my earlier conditions.
- Q2 found no study comparing a last-session with an any-session rule. That negative result is logged, not read as absence of evidence.

## Validation

**Gap.** Python and `jsonschema` are not installed, so `validate_records.py` did not run.

**Declared substitute.** `ssctr-r7a1-validate.mjs`, a byte copy (`8781984c…`) of the R7-A Node validator: ajv 8.20.0 against `decision.schema.json`, with the helper's cross-checks ported.

**Result.** The ten records and the nine queue items pass: 0 errors.

**Negative control.** A copy with a stale target hash, an altered approval condition and a missing AE answer fails with six errors, so all three defects are caught.

This certifies record consistency only.

## Escalation and routing

**No escalation.** No ruling needs a policy text change, clinical semantics or a Founder decision. The binding did not drift.

**Routing:**
- **Chief:** run the single correction cycle for D57 and D58 with their regression tests, freeze R7A1-FREEZE-A2, then the single narrow SSCTR re-check. Integrate the nine queue items append-only.
- **My re-check of FREEZE-A2 will cover:**
  - D57 and D58, with my grids;
  - the changed files at `18ec48f3…`;
  - that S1 and S4–S10 still hold.
- **Next policy revision:** R30, R31, R23 (and R26, R21 with R17(b), R22).
- **Product/UX with Data:** SHIFT-CLOCK.
- **R7-B:** F-ACCESSORY-REPS.
- **Engineering with Product/Data:** R18, before any use beyond the offline reference.

## Files

All in `audits/domain-coaching-r7a1-2026-10-27/reviews/`. Their hashes are in the JSON (`myOutputs`).

**Outputs:**
- `ssctr-r7a1-review.md` (this file)
- `ssctr-r7a1-review.json`
- `ssctr-r7a1-queue-items.json`

**Instruments and their outputs:**
- `ssctr-r7a1-verify.mjs` with `.start.out.json` and `.end.out.json`
- `ssctr-r7a1-grid.mjs` with `.A1.out.json`, `.F2.out.json` and `.A1.full.out.json`, plus their logs
- `ssctr-r7a1-short.mjs` with `.A1.out.json` and `.F2.out.json`
- `ssctr-r7a1-probe.mjs` with `.A1.out.json` and `.F2.out.json`
- `ssctr-r7a1-instrument.mjs` with `.out.json` and `.log`
- `ssctr-r7a1-rerun-composition.A1.out.json` and `ssctr-r7a1-rerun-d56grid.A1.out.json`
- `ssctr-r7a1-verify-r7a1.out.json`
- `ssctr-r7a1-node-test.out.txt`
- `ssctr-r7a1-literature.mjs` with `.out.json`, and `ssctr-r7a1-abstracts.out.txt`
- `ssctr-r7a1-build-review.mjs`
- `ssctr-r7a1-validate.mjs` with `.out.json` and `.negative-control.out.json`

Nothing was edited under `CoachingCore/`, in the mission files, the queue file, `product/`, `canon/`, the dossier or the earlier audits.
