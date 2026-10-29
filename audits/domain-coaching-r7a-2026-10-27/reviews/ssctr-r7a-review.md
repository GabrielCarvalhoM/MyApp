# SSCTR review of the R7-A runtime delta

**Revision R7A-SSCTR-r1, 2026-10-27. The narrow runtime delta check of D53 and D54 that my round-12 review asked for, on runtime R7A-FREEZE-1 at the unchanged policy R6-POLICY-5 (`18ec48f3…`).** Structured record: `ssctr-r7a-review.json` (same folder). Under the Founder's cycle bound this is the one review of this candidate.

## At a glance

**Verdict: `runtimeAccepted` = false.** One blocker, and it is new, narrow and runtime-only, so the bound allows one narrow re-check.

**D53 is RESOLVED for every state mode. D54 is RESOLVED.**

**A new binding defect, D55, sits next to item 5.**
- A substitute set up in return step 2 is correctly established by effort.
- The week after, it rises two sets at once: 2 → 4 sets, or 1 → 3 for RUNNING_SUPPORT.
- Meanwhile the exercises in use come back one set at a time.

**Answers:**

| Question | Answer |
|---|---|
| Q1 | Option A (implemented) is acceptable; Option B is not required |
| Q2 | Confirmed |
| Q3 | Confirmed |
| Q4 | No objection to items 6, 7 and 8. Item 5 is right for its own week; its next week exposes D55 |

**The complete blocking list at R7A-FREEZE-1:**

| Item | New | Narrow | Runtime-only | Boundaries | Required change |
|---|---|---|---|---|---|
| D55 | yes | yes | yes | NONCLINICAL-RETURN, SUBSTITUTION, PLANNED-PROGRESSION | An exercise first set up while the exercises in use are in the return steps earns no block-boundary set for the block of the return. After the return steps its count rises at most one set per executed week, up to its normal count, with phase reductions on top |

Nothing else blocks. No policy text change, Product decision or Founder decision is needed. One caveat: if the Chief or the author reads `strengthReturnSets` as not covering an exercise first set up after the entry week, D55 needs a declaration instead (see D55 below).

## Reviewer, authority and target

**Reviewer.** A fresh SSCTR-1.0.0 instance.
- My instructions are the body of `.claude/agents/sports-science-concurrent-training-reviewer.md`, verbatim (`021b5951…`).
- No Agent tool is available to me, as the adapter requires.
- The dispatch mechanism itself is as the caller reports it; I can only observe my instructions.
- I did not author the policy, the runtime or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This is not human, empirical or clinical validation, and it carries no runtime sovereignty.

**Target.** `CoachingCore/r7/RUNTIME_FREEZE_R7A_1.json` (R7A-FREEZE-1, file `f7574eba…`, source digest `1f2bb1d8…`).
- All 74 bound files match, checked before and after my runs.
- Policy canonical hash recomputed with `value.mjs`: `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`. File `a75be1aa…`; both unchanged.
- Changed files: `r6-program.mjs` (`b7be1778…`), `r6-adaptation.mjs` (`c5fa03cb…`), `r6-provenance.mjs`, `r6-intake.mjs`, `r6-prescription.mjs`. Added: `test/r7a-semantic-core.test.mjs`.
- The pre-R7A snapshot matches its 73-file manifest. Its `r6-program.mjs` is `57973e97…`, the runtime I reviewed in round 12, and its files equal my round-12 record.
- My own diff of the five files equals `RUNTIME_DELTA_R7A.diff`.

**Remit.** Dose, phase behaviour, return, progression and establishment semantics (dossier items 1–8). Items 9–12 are technical; I saw no sporting effect in them that needs a ruling.

## What I ran and read

| Check | Result |
|---|---|
| `node --test` in CoachingCore, Node 24.19.0 | 460/460 pass; the suite writes no file |
| My round-12 instrument, byte copy run from `reviews/` on the freeze | All 43 sections equal the author's AFTER output, apart from file paths in error text. The author's BEFORE output equals my official round-12 output |
| `ssctr-r7a-delta-probe.mjs`: both runtimes; phase grid, round-12 AI grid under readings A and B, split weeks, substitute, fatigue, moves | See the sections below. Its first MR section failed on a probe bug of mine (run sessions in a load callback); I replaced it with MR2 |
| `ssctr-r7a-delta-probe-2.mjs`: MR2 (item 6), RS2 (item 5 through the real review path), FR2 (item 7 in a development week) | See the sections below |
| Literature | Europe PMC returned HTTP 503 twice. PubMed worked: one directed counterevidence search for Q1, 18 hits, two abstracts read (R7A-S01, R7A-S02). No new full text |

**Authority used.** Every probe uses the DEV_TEST_ONLY authority of each runtime (`devAuthority()`), bound to the unchanged hash, never the real authority. The data are synthetic and offline.

**Not run or read.**
- `npm run verify`, any `verify-r*` script, the mutation checks, the R5 corpus and the R6 holdout. I read `REGRESSION_R7A.json` and `mutation-check-r7a.out.json` only as the author's claims.
- The author's class probes were read, not rerun. Their C03, C04, C11 and C12 results agree with my own probes.
- The engineering judge's `qe-*` files in this folder, to keep the two judgments independent.

## D53: resolved for every state mode

The regain now starts at every performed re-establishment, whatever the state's mode, and the count rises at most one set per executed week.

| Evidence on the freeze | Result | Round 12 |
|---|---|---|
| AJ, from-log scripts: pending through a block end, pending then adopted, pending once, unlogged through the gap | 0 violations, 0 next exposures more than one set above. The goblet squat goes 2, 2, then 3 sets | 2 → 4 |
| AI, 2,448 re-establishments as prescribed and 1,224 with noisy logs (592 from a pending state) | 0 and 0 next exposures more than one set above the re-establishment | 0 and 48 |
| My reading-A audit of the same grid | 0 and 0 violations, and no exposure more than one set above every count executed since the re-establishment | — |
| My phase grid: 2,350 re-establishments in race and no-event programs, five goals, known, none or noisy logs, two schedules | 0 violations, 0 such jumps | — |
| AH | 0 of 584 | — |

On the pre-R7A runtime the noisy-log grid still shows 48 violations and 24 jumps of 2 → 4 sets. D53 reproduces there, and the freeze removes it.

## D54: resolved

The re-establishment row now takes its day phase like every other row:
- race week and post-event: 1 set of a main lift at RIR 4;
- taper: the taper dose of the exercise's own count at RIR ≥ 3;
- consolidation and specific weeks: their reduction.

| Evidence on the freeze | Result | Pre-R7A runtime |
|---|---|---|
| AK, rows above the twin's phase dose | 0 | 70 in round 12 |
| My phase grid: 400 timelines, 3,520 re-establishment rows | 0 above the declared bounds, 0 below the phase minimum RIR, 0 above min(goal sets, 2), 0 above my own reduction of the stated count, 0 above the twin executed throughout, 0 programs not produced | 390 above the bounds, 832 above the twin |
| Race-week and post-event rows | 150 and 240, all 1 set at RIR 4 | — |
| Author class probe C03 | 3,360 rows, 0 violations; agrees with my grid | — |

## Q1: the regain base after a phase-reduced re-establishment

**Ruling: Option A is acceptable; Option B is not required.** The regain starts from the re-establishment count before its phase reduction: min(goal sets for the role, 2, the exercise's count that day).

**Why A.**
- It is what `strengthReturnSets` says for a phase-reduced return step 2 ("followed by the step-2 count itself").
- It is how my round-12 wording "with phase reductions on top" reads.
- It never prescribes more than the approved first-bout dose (at most 2 sets at RIR ≥ 3). It never prescribes more than one set above a count actually executed.
- The athlete has meanwhile had one more recent bout. Repeated-bout protection persists for weeks (R6-S48) and is at least partial after low-intensity bouts (R6-S50, R6-S51).

**Why B is not required.** Option B would let a one-week phase reduction also lower the following unreduced weeks. That is a double reduction no text states, and nothing shows it helps.

**Counterevidence (abstract only).**
- A low-intensity first bout protected less against soreness than a full one (R7A-S01, Mavropalias 2020). Soreness after the second bout was 3.6 against 1.5, though still below an unprotected bout (4.2).
- Two submaximal bouts showed no repeated-bout effect on neuromuscular function (R7A-S02, Da Silva 2023).
- Neither defeats A, because A's second exposure never exceeds the dose already approved with no protection at all.

**What I verified.**
- All 370 as-prescribed and 146 noisy-log flags of my round-12 audit (reading B) follow a phase-reduced re-establishment. None comes from any other pattern.
- Reading A gives 0 on that grid. The phase grid gives 1,590 reading-B flags of the same pattern and 0 under A.
- The AJ flags (2 and 4) are the same pattern.

**The whole-count rule.** A week raises the cap only if its last executed row equals its count before the phase reduction. A phase or fatigue reduction that brings the row below that count stops the rise. A phase week whose reduction did not bite does count. For example, a taper week where the dose of a 4-set count is 2, equal to the cap, counts as a whole executed week. This is the operational definition my round-12 audit used.

A strict variant that never counts a phase week would flag 1,118 later counts in the AI grid (662 as prescribed, 456 with noisy logs) and 1,098 in the phase grid. I do not require it: the athlete did execute the whole re-establishment count, and the next count is one set above it.

## Q2: re-establishment rows below min(goal sets, 2)

**Confirmed.** Outside event phases the row falls below min(goal sets, 2) only when the phase dose or the exercise's own count is lower. In the phase grid:
- consolidation: 227 main and 210 accessory rows at 1 set;
- specific: 200 and 168;
- build: 18 main rows at 1 set, for a known dose of 1 set.

None of these rows is above the twin, the goal cap or my own reduction of its count. One set is a lower but real stimulus inside a planned step-back. Single sets still gave strength and size gains, smaller than three sets (R6-S52).

## Q3: split weeks

**Confirmed.** The first executed exposure decides whether the week re-established; the last executed one gives its counts. Split-week probe on the db-bench-press, Mon/Wed/Fri:

| Executed in week 5 | Week 6 on the freeze | Round-12 runtime |
|---|---|---|
| Known 3×10 row only | 3×10 + 3×10, state KNOWN, no cap | 2×10 |
| Re-establishment row only | Regain from 2 | Same |
| Both | Known, no cap, 3×10 | Same doses |
| Neither | Re-established in week 6 | Same |

An executed known exposure inside the window keeps the athlete exposed (R6-S48). Reading the counts from the last executed row lets the most reduced executed row govern, which errs low. One residual is non-blocking (R20): with both rows executed, the return ceiling is set from the later 2-set row for one week.

## Q4: items 5–8

**Item 6, no objection.** Sets logged without repetitions now HOLD with load and reps unchanged. Missed reps and a low logged reserve still regress, as the control shows. On the pre-R7A runtime the same weeks returned no gates and the projection stepped the squat to 82.5 kg. That contradicted PP-9 ("missing logs hold the dose without regression"), and I had not flagged it.

**Item 7, no objection.** In FR2 a fatigue-reduced development week keeps the cap: barbell RDL 2×5 @RIR4, then 3×5, against the twin's 4×5. The pre-R7A runtime credited the reduced week. One set lower for one week is the conservative reading of "a week that executed its whole count".

**Item 8, no objection.** I placed a 10K on a Wednesday, so the last specific week ends with taper days.
- The missed key strength session now has no move candidate.
- The pre-R7A runtime offered a move into a taper day; it was inadmissible only for interference.
- Moves in taper and race week, and moves of race touches and shakeouts, stay barred.

**Item 5, right for its own week.** A return-entry week now counts only exercises in use. A substitute in return step 2 is established by effort at up to 2 sets at RIR ≥ 3, which my conditions NR-21 and SUB-6 require. Its next week is D55.

## D55 (new, blocking): a two-set rise right after the return steps

**Scenario.** Probe RS2 runs the real review path:
- EVERY_2_WEEKS rotation and a 16-day TRAVEL break;
- the entry week executed;
- a barbell-free window from return step 2, which ends a block (consolidation week 7).

| Goal | Freeze: goblet squat, step-2 week → next week | Exercises in use, next week | Pre-R7A runtime, same scenario |
|---|---|---|---|
| HYPERTROPHY | 2×8 @RIR3 → **4×8** | 2 sets | 1×8 @RIR4 → 2×8 |
| STRENGTH | 2×5 → **4×5** | 2 sets | 1×5 @RIR4 → 2×5 |
| RUNNING_SUPPORT | 1×8 → **3×8** | 2 sets | 1×8 @RIR4 → 1×8 |

**Mechanism.** The substitute ends week 7 with `blocksDone` = 1: it earned a block-boundary set from its single establishment exposure. With FIXED rotation (nothing parked), both runtimes already give 2 → 4. So the path predates R7-A, and item 5 widens it to the common rotation case.

**What it contradicts.**
- `operational.return.strengthReturnSets` covers "strength sets in a moderate or long return". Its ceiling is "without that, the normal count" for an exercise with no earlier count, and "after the return steps the count comes back at most one set per executed week".
- NONCLINICAL-RETURN conditions 9 and 21.
- It is also an instance of the task contract's class C13 (establishment × progression), which the class probes did not cover.

**Sporting weight: modest.**
- It is a two-set rise on a novel exercise in the third week after a break, in the window the return rule exists for.
- The pattern has had only two low-volume bouts.
- Protection of running needed two or more bouts in untrained men (R6-S55), and a lower-intensity first bout protects less against soreness (R7A-S01).

**Required change (runtime-only).** An exercise first set up while an exercise in use is in the return steps earns no block-boundary set for the block of the return, as return-entry and return-step exposures do not. After the return steps its count rises at most one set per executed week, up to its normal count, with phase reductions on top.
- Regression tests: the RS2 scenario for HYPERTROPHY, STRENGTH and RUNNING_SUPPORT, with EVERY_2_WEEKS and FIXED rotation.

**If the text is read differently.** If the Chief or the author reads `strengthReturnSets` as not covering an exercise first set up after the entry week, D55 needs a declaration (R17(b)) instead. That would be a policy text change, and under the bound it closes R7-A with an explicit blocker. My reading is that the declared text already covers it.

**Outside a return** the same block-credit mechanism is R17(c): a first establishment in a block-end consolidation week followed by a two-set rise. It is unchanged on the freeze (24 + 12 cases in the AI grid, as in round 12) and stays non-blocking. The D55 fix may cover it.

## Round-12 conditions at the unchanged hash

Dispositions are unchanged: all ten boundaries stay APPROVE_WITH_CONDITIONS, SUPPORTED_WITH_LIMITS.

| Boundary | Round-12 binding item | Status at R7A-FREEZE-1 |
|---|---|---|
| R6-COLD-START | none | Met |
| R6-LOAD-ESTABLISHMENT | D53 (from-log), D54 (condition 15) | Met; Q1 and Q2 added as conditions |
| R6-PLANNED-PROGRESSION | D53 (condition 14) | Condition 14 met; condition 9 now met for sets without reps; **not met: D55** |
| R6-RUN-QUALITY | none | Met |
| R6-HYBRID-ARRANGEMENT | none | Met |
| R6-SUBSTITUTION | none | Condition 6 met; **not met: D55** |
| R6-NONCLINICAL-RETURN | none | Condition 21 now met in the parked case; **not met: D55** (conditions 9 and 21) |
| R6-EVENT-TRANSITION | D54 (condition 18) | Met |
| R6-PARTIAL-NOISY-LEARNING | none | Met |
| R6-ROTATION | D53 (condition 10) | Met; Q3 added |

The weekly-review contract (R18) stays the last condition of every boundary. It is not a freeze blocker; it must be closed before any use beyond the offline reference.

## Non-blocking recommendations

| Id | Kind | Recommendation |
|---|---|---|
| R20 | new | Split week with both rows executed: take the larger whole count executed that week as the return ceiling, not the later 2-set row |
| R21 | new | A new exercise set up in return step 2 gets up to 2 sets while the exercises in use are at 1. When R17(b) is declared, consider capping it at its slot's return-step count |
| R22 | new | Declare the Q1 ruling and the whole-count rule in `strength.setsAfterReestablishment`, in the words of `strengthReturnSets` |
| R23 | new; pre-existing on both runtimes | The exercise a substitute replaced resumes at its full count when the window ends: back squat 1 set at the entry, then 3 sets in week 9 (D51). Check it after the D55 fix |
| R24 | new; from reading the code, not probed | A moved key strength session keeps the rows of its original date. LE-15 judges each session on its own date. Weight negligible |
| R17 | retained | (a), (c) and (d) as in round 12; (b) is the NR-21 second case, now with R21 |
| R18 | retained | Weekly-review contract |
| F-ACCESSORY-REPS | acknowledged | Unchanged by R7-A and not in the policy text; a sporting choice for R7-B, as routed |

## New prescriptive rule and human queue

**Yes, prescriptive rulings were decided.**
- Q1 sets the regain base, plus the whole-count reading.
- Q2, Q3 and Q4 confirm composition and state readings of declared rules and of my round-12 conditions.
- D55 states a required runtime behaviour under the declared return rule.

**Four records**, all APPROVE_WITH_CONDITIONS:
- R7A-SSCTR-REGAIN-BASE;
- R7A-SSCTR-REESTABLISH-PHASE;
- R7A-SSCTR-SPLIT-WEEK;
- R7A-SSCTR-ITEMS-5-8, whose D55 condition is not met at this freeze.

**Queue proposal** R7A-SSCTR-QUEUE-PROPOSAL-r1 proposes four funded-human revalidation items, HQ-R7A-SSCTR-*. They refine the round-12 HQ-R6 items for the same boundaries.
- This is a proposal only. I did not edit the queue file, which holds 127 entries.
- Funding is NOT_DECLARED.

## Validation

**Gap.** Python and `jsonschema` are not installed, so `validate_records.py` did not run.

**Declared substitute.** `ssctr-r7a-validate.mjs`:
- Node 24.19.0 with `CoachingCore/node_modules/ajv` 8.20.0 (Ajv2020), checked against `decision.schema.json`;
- every cross-check of the Python helper, ported;
- local date and uri formats; the uri check is weaker than jsonschema's.

**Result.** The four records and the embedded queue proposal pass: 0 errors.

**Calibration.** The substitute passes my round-12 records, which passed the real validator. It catches all seven defects injected into a copy of them.

This certifies record consistency only.

## Escalation and routing

**No clinical, Product or Founder escalation.** No envelope magnitude is widened.

**Routing:**
- **Chief:** apply the cycle bound. D55 is the only blocker; it is new, narrow and runtime-only, so one narrow SSCTR re-check is allowed. It covers D55 alone, on the new freeze revision, at hash `18ec48f3…`. Merge the queue proposal.
- **Runtime author:** fix D55 with its regression tests, then look at R20, R23 and R24.
- **Runtime author with Product Constitution & Governance**, in the next policy revision: R22, R21 with R17(b), R16 and R17(a, c, d).
- **Engineering with Product/Data:** R18 before any use beyond the offline reference.

## Files

All in `audits/domain-coaching-r7a-2026-10-27/reviews/`.

Outputs:
- `ssctr-r7a-review.json`
- `ssctr-r7a-review.md` (this file)

Instruments and their outputs, with their hashes in the JSON:
- `ssctr-r7a-instrument-rerun.mjs` and its `.out.json` and `.log`
- `ssctr-r7a-delta-probe.mjs` and its `.out.json` and `.log`
- `ssctr-r7a-delta-probe-2.mjs` and its `.out.json`
- `ssctr-r7a-literature.mjs`, `ssctr-r7a-literature-pubmed.mjs`, `ssctr-r7a-literature.out.json`
- `ssctr-r7a-abstracts.mjs`, `ssctr-r7a-abstracts.out.txt`
- `ssctr-r7a-validate.mjs`

Nothing under `CoachingCore/`, the policy, the fixtures, the tests or any R5 or R6 file was edited.
