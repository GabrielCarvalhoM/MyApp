# SSCTR review of the R6 coaching envelopes

**Current state: round 7 (records revision r7), a delta binding review of R6-POLICY-3 at hash `e9c87e09…`, 2026-10-26.**

Earlier rounds are preserved unchanged:

| Round | File | Policy hash |
|---|---|---|
| 6 | `ssctr-review.r6.md` | `af2779fe…` |
| 5 | `ssctr-review.r5.md` | `f9f89b7f…` |
| 4 | `ssctr-review.r4.md` | `d766f0d9…` |
| 3 | `ssctr-review.r3.md` | `983171ac…` |
| 2 | `ssctr-review.r2.md` | `1c5e3844…` |
| 1 | `ssctr-review.r1.md` | `81114d89…` |

Round 1 holds the full evidence appraisal. My other earlier files carry matching `.r1`–`.r6` suffixes.

## Round 7 at a glance

**Verdict: FREEZE-2 is not allowed yet.** Five binding defects, D42–D46, must be fixed first. Each one comes with a required change; four of the five also need a policy declaration, so the policy hash will change.

| Result | Boundaries |
|---|---|
| APPROVE_WITH_CONDITIONS (6) | RUN-QUALITY, HYBRID-ARRANGEMENT, SUBSTITUTION, NONCLINICAL-RETURN, PARTIAL-NOISY-LEARNING, ROTATION |
| REVISE (4) | COLD-START, LOAD-ESTABLISHMENT, PLANNED-PROGRESSION, EVENT-TRANSITION |

**Effect at this hash.** The real authority enables only the six approved boundaries. `generateProgram` and `evaluateProgram` therefore return UNSUPPORTED (I checked this).

## Reviewer, authority and target

**Reviewer.** The native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0. My instructions are the project adapter's body. I did not author the policy or the runtime.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This is not human, empirical or clinical validation, and it carries no runtime sovereignty.

**Target.** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-3.
- Canonical hash, recomputed with `value.mjs`: `e9c87e09d35496791c6d6894639652a4c7bd6cbf6f0b01299d57dd7352373f87`.
- File SHA-256: `446e241ee617aa95e779a108066a5940800017c689c6f10285cc976de4aac6d8`.
- I also recomputed the reviewed round-6 bytes: `af2779fe…` / `c855cde0…`.

**Delta, from my own structured diff.** No earlier numeric value changed. The diff contains:
- the revision label and the revision note;
- the widened `return.reasonScreen` text;
- new wording for `run.singleRunCeiling.reference`;
- twelve new declarations:
  - `establishment.belowMinimumSession`;
  - `strength.loadUnits`, `strength.loggedLoadAdoption`, `strength.setsAfterReestablishment`;
  - `event.raceWindowDays`, `event.proximitySemantics`, `event.raceDateUnavailable`;
  - `return.demonstration.minimumDuration`, `return.interruptionFacts`;
  - `learning.missingGate`, `learning.conflicts`, `learning.consentScope`.

## What I ran and read

**Code read.** The changed parts of these runtime files:
- `r6-program.mjs`, `r6-adaptation.mjs`, `r6-intake.mjs`, `r6-clinical.mjs`, `r6-provenance.mjs`;
- the `r6-prescription.mjs` race and load paths;
- the tests `r6-engineering-fixes.test.mjs` and `r6-ssctr-revision.test.mjs`.

**Tests.** `node --test` in CoachingCore: **394/394 pass**, run by me.

**My probe.** `ssctr-probe-delta-policy3-r7.mjs`, output in `.out.json`. It uses a **DEV_TEST_ONLY authority** (`devAuthority()`) bound to `e9c87e09…`, because the real authority has no current record at a new hash. Sections:

| Section | What it covers |
|---|---|
| A | 840 event programs: both events, race weeks 3/5/7/10, every race weekday, five day sets, three strength goals |
| B | 432 walk/jog cold starts |
| C | Walk/jog, restart and below-minimum athletes with an event |
| D | Logged-load adoption |
| G | One wearable activity bound to two sessions |
| I | Return facts |
| J | A 53-phrase clinical screen battery |
| K | Missed-run gating |
| L | Projection gating |

**Author material.** I read the author's reruns in `ssctr-dossier/freeze2-author-reruns/` as author material, not as evidence.

**Not run or read.** `npm run verify` and the `verify-r*` scripts. The R6 holdout files.

**Literature.** Literature access works: Europe PMC REST from Node, in this session. Four logged searches added five abstract-level sources:
- Hottenrott 2016, run/walk in a marathon;
- Bosquet 2007, taper meta-analysis;
- Mujika and Padilla 2003, taper review;
- Steele 2022, self-selected loads;
- Barbosa-Netto 2021, self-selected loads.

I re-read the decisive full texts: Wang 2023 (R6-S14) and Frandsen 2025 (R6-S02). The walk/run search hits were clinical populations and are not applicable.

## Answers to the dossier's questions

### Q1 — Event proximity in days, a 6-day race window and taper days

**Yes. Counting days to the race is the right reading of the approved envelope.**
- Taper evidence is defined in days before competition:
  - about two weeks is optimal, with volume reduced 41–60% (Bosquet 2007);
  - tapers of up to 7, 8–14 and 15–21 days were all effective (Wang 2023);
  - progressive, nonlinear tapers do better (Mujika 2003).
- FREEZE-1's calendar-week reading was the defect.

**The 6-day window plus 7 taper days per taper week is about two weeks of progressive reduction.** The split is operational. It keeps:
- the shakeout on the day before;
- the touch and the last light strength session at least 3 days out;
- the taper long run about a week before.

**Probe A, 840 programs, showed no violation:**
- no long run or quality session in the last 6 days;
- at most one touch, always 3 or more days out;
- no strength in the last 3 days, and exactly one 1-set main-lift session at RIR ≥ 4 in each window;
- taper long runs and taper quality work within their ranges of the achieved peak, and taper-day strength at RIR ≥ 3;
- no new exercise in the last 13 days;
- no run within 2 days after the race;
- running falls from the pre-taper week to the taper days to the race window in all 630 programs that have a taper week.

This part is approved. EVENT-TRANSITION as a whole stays REVISE because of D43.

### Q2 — The familiar walk/jog start for non-novices below the minimum session

**Approved in principle; step 0 is not required.** Starting from current running is the cold-start rule, and step 0 would drop these athletes far below what they already do.

As written, though, one session may hold the whole weekly share of running. That can exceed the longest current run: in 56 of the 128 raised starts in probe B, one session holds more jogging than the athlete's longest current run. For example:
- a longest run of 3 minutes with 10 minutes a week on one run day starts at 5 × 2 minutes = 10 minutes of jogging;
- the judge's case, with a longest run of 5 minutes, also starts at 10 minutes.

The policy counts walk/jog jogging as running for the single-run reference, and every other week-1 run is capped at the longest current run. **D42** applies the same cap here. With it, the whole ladder also stays inside the single-run ceiling, because each later step adds at most 5 minutes of jogging.

Novices, and zero or unknown exposure, correctly stay at step 0.

### Q5 — One increment above the planned load for logged-load adoption

**One smallest increment is an acceptable size bound** for rows that state a planned load. Pound conversion and refusing unknown units are correct.

Size alone is not evidence, though:
- **D44.** A logged 82.5 kg against a planned 3 × 5 at 80 kg is adopted even when the athlete got 3 of 5 reps, or RIR 0 against a prescribed RIR 3. The gate says HOLD, yet the next weeks prescribe 82.5 kg. An above-plan load must be adopted only when that exposure met the ADVANCE criterion.
- **D45.** Establishment rows state no planned load, so only the 0–500 kg bound applies to them. A goblet squat established at 160 kg per hand (probably 16) becomes the prescribed load with status KEEP and no question. A single unconfirmed establishment log must not become a numeric prescription.
- **Recommendation R5.** Confirm logged loads that are far below the plan: 8 kg logged against 80 kg is adopted silently.

### Q11 — The widened clinical lexicon and the damage-verb plus body-part rule

**Accepted, inside my round-6 owned-gap decision.**
- The additions can only add CLINICAL or ASK outcomes.
- Every earlier battery phrase keeps its outcome.
- The judge's 26 misses now route to CLINICAL or ASK.
- "Broke my leg", "quebrei a perna" and "me rompí la pierna" are CLINICAL.

**New residuals, not blocking (recommendation R7).** With a nonclinical category, these still screen NONCLINICAL:
- "Had a baby", "Tive um bebê", "Tuve un bebé" — postpartum is a V1 exclusion;
- "Hit by a car", "Car crash", "Bike crash";
- "Bitten by a dog";
- "Slipped on ice".

**A conservative false positive.** Negated damage ("No broken bones", "Didn't break my leg") routes to CLINICAL.

The athlete's structured category and current eligibility remain the primary defence. I found no defect in the structured path.

### Q13 — Does walk/jog-only preparation before a race need a blocking ASK?

**No whole-program blocking ASK is needed.** The preparatory walk/jog weeks are the right training whatever the athlete decides about the race.

**But the non-blocking negotiation is only enough once race week and race day match the athlete's preparation (D43).** Probe C shows that today they do not:
- A novice at ladder step 5, whose jog bouts last 3 minutes, gets continuous 15-minute runs in the taper and race week.
- Walk/jog, restart and below-minimum athletes race at race effort, with strides in the warm-up and an instruction to "decide in the final part whether to press".
- This contradicts the plan's own EVENT_AMBITIOUS_FOR_CURRENT_RUNNING item, which promises completion with walk breaks.

**Recommendation R8.** Collect the athlete's keep-or-change choice before the race window.

### The other changes (3, 4, 6, 7, 8, 9, 10, 12): confirmed

| Change | Confirmed behaviour |
|---|---|
| 3 | The reviewed entry is the run ceiling in every week with no run in the 30-day window |
| 4 | Load units at intake and in logs; a known dose above six sets starts at six |
| 6 | Sets return at one per executed week after re-establishment |
| 7 | Missing gates hold in reviews; the projection still needs D46 |
| 8 | The record is append-only; conflicting reports are quarantined; one activity on two sessions makes both CONFLICTED; a correction resolves the conflict |
| 9 | Coaching side of consent confirmed; the privacy scope stays with Product/Data |
| 10 | Contradictory interruption facts are asked; a yes-meaning clinical flag in any form goes to a human; a 10-minute demonstration is not used |
| 12 | A race date marked unavailable is asked about |

**Recommendation R6.** Yes-meaning eligibility flags, such as `"true"` or `1`, currently return ASK. Routing them to CLINICAL would match the interruption-flag rule.

## Binding defects (required before FREEZE-2)

| ID | Boundaries | Defect | Required change |
|---|---|---|---|
| D42 | COLD-START, PLANNED-PROGRESSION | The familiar walk/jog start can put more jogging into one session than the longest current run (56 of 128 raised starts) | Start at the highest step whose jogging per session is within both the longest current run and the weekly share; amend `belowMinimumSession`; add a regression test |
| D43 | EVENT-TRANSITION | Event-rule sessions ignore the run mode: walk/jog athletes get continuous runs they have not reached; walk/jog, restart and below-minimum athletes race at race effort with strides and "press" | (a) Taper, race-window and post-event sessions reduce or hold the session the athlete has reached in the WALK_JOG or RESTART mode; (b) race day becomes a completion at conversational effort with walk breaks, no strides, no "press"; (c) warm-up strides only after executed strides, for every athlete; (d) the negotiation states the gap and offers keep-with-walk-breaks or a later or shorter event; (e) declare all of this in `operational.event`, with tests |
| D44 | LOAD-ESTABLISHMENT, PLANNED-PROGRESSION | An above-plan logged load is adopted even when the gate holds | Adopt it only when target reps were met with minimum logged RIR ≥ prescribed − 1 and no adverse response; otherwise keep the planned load and ask; amend the semantics text; add tests |
| D45 | LOAD-ESTABLISHMENT | A single establishment log becomes a numeric prescription with only the 0–500 kg bound | It becomes a KNOWN load only after the athlete confirms it, or after a second consistent log, or when it is within one increment of the athlete's own load hint. Until then the next exposure is FROM_LOG with no number, and the athlete is asked. Data owns any numeric plausibility rule |
| D46 | PLANNED-PROGRESSION, shared with RUN-QUALITY | The conditional projection counts a week with no session of a dimension as executed. For example, the walk/jog ladder advances through race and post-event weeks and the plan shows a continuous 25-minute run | In projection, hold every dimension that has no planned session that week; add a regression test |

## Dispositions at hash e9c87e09…

Evidence status is SUPPORTED_WITH_LIMITS for all ten boundaries. Disposition and runtime binding differ.

| Boundary | Disposition | Binding | Notes |
|---|---|---|---|
| R6-COLD-START | REVISE | D42 | Pound conversion, the six-set dose start and the pause handling are confirmed |
| R6-LOAD-ESTABLISHMENT | REVISE | D44, D45 | Unit handling and the one-increment bound for stated loads are confirmed |
| R6-PLANNED-PROGRESSION | REVISE | D44, D46, D42 | The every-week ceiling, sets after re-establishment and missing gates in reviews are confirmed |
| R6-RUN-QUALITY | APPROVE_WITH_CONDITIONS | D46 (shared), fix before freeze | Earlier non-blocking recommendation R1 still stands |
| R6-HYBRID-ARRANGEMENT | APPROVE_WITH_CONDITIONS | None | Strength proximity now counted in days |
| R6-SUBSTITUTION | APPROVE_WITH_CONDITIONS | None | Unchanged; re-bound |
| R6-NONCLINICAL-RETURN | APPROVE_WITH_CONDITIONS | None | Owned gap: residuals in R7 |
| R6-EVENT-TRANSITION | REVISE | D43 | The day-based proximity (Q1) is approved |
| R6-PARTIAL-NOISY-LEARNING | APPROVE_WITH_CONDITIONS | None | Consent privacy scope stays with Product/Data |
| R6-ROTATION | APPROVE_WITH_CONDITIONS | None | — |

## Non-blocking recommendations

| ID | Recommendation |
|---|---|
| R5 | Confirm logged loads that are far below the plan. Data owns the threshold |
| R6 | Route yes-meaning eligibility flags to CLINICAL |
| R7 | Add the round-7 lexical residuals listed under Q11, and make negated damage statements ASK instead of CLINICAL |
| R8 | Collect the keep-or-change event choice before the race window |
| R9 | When the long-run peak is materially below target, default race-day instructions to completion pacing |
| R10 | Stop taper and next-block fractions from making the long run shorter than the easy runs (restart and walk/jog exits) |

## May the runtime be frozen as FREEZE-2?

**No.**
1. Implement D42–D46, with their regression tests and policy declarations.
2. Request a delta binding review of the resulting hash. In it, probes A–D and L are re-run and all ten records are re-bound.
3. FREEZE-2 may follow only after that review.

**Before production, a KMP port or any real-athlete use:** re-review the free-text screen and its battery together with the structured intake design. This is the owned open gap, now including R7.

## Human queue

`ssctr-proposed-queue-items.json` (revision r7) proposes six funded-human revalidation items, one per approved boundary at this hash. The four REVISE boundaries have no current approval and no item.

The r7 proposal supersedes the unmerged r1–r6 proposals. The r6 items named `af2779fe…`, whose approvals expired with the policy change. I did not edit the queue file, and funding is NOT_DECLARED.

## Escalation and routing

**No escalation.** No change widens an approved envelope, no clinical boundary is weakened, and every required change is one I can approve.

**Routing:**
- **Runtime author:** D42–D46.
- **Data / Engineering:** numeric plausibility semantics for logged loads (D45, R5).
- **Product / Data:** the privacy scope of learning consent (QRE-R6-16), unchanged.

## Validation

All ten records and the queue proposal pass the project validator: jsonschema 4.26.0, run with a bundled Python 3.12.14 via `ssctr-validate-r6.py`. The policy-review cross-check passes, and every recorded file hash is current.

This certifies record consistency only.

## Files

The build script is `ssctr-build-r6-r7.mjs`. New abstracts are in `ssctr-evidence/abstracts-r7.json`. Updated in this round:
- `ssctr-policy-review.json`
- `ssctr-records.json`
- `ssctr-proposed-queue-items.json`
- `ssctr-evidence-manifest.json`
- `ssctr-schema-validation.json`
