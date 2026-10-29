# SSCTR review of the R6 coaching envelopes

**Current state: round 12 (records revision r12), the narrow runtime delta check of D53 at the unchanged R6-POLICY-5 hash `18ec48f3…`, 2026-10-27. It is the last SSCTR round R6 allows (`../FOUNDER_LOOP_BOUND.md`).**

Earlier rounds are preserved unchanged:

| Round | File | Policy hash |
|---|---|---|
| 11 | `ssctr-review.r11.md` | `18ec48f3…` (round-11 runtime) |
| 10 | `ssctr-review.r10.md` | `18ec48f3…` (round-10 runtime) |
| 9 | `ssctr-review.r9.md` | `18ec48f3…` (round-9 runtime) |
| 8 | `ssctr-review.r8.md` | `1046ad0e…` |
| 7 | `ssctr-review.r7.md` | `e9c87e09…` |
| 6 | `ssctr-review.r6.md` | `af2779fe…` |
| 5 | `ssctr-review.r5.md` | `f9f89b7f…` |
| 4 | `ssctr-review.r4.md` | `d766f0d9…` |
| 3 | `ssctr-review.r3.md` | `983171ac…` |
| 2 | `ssctr-review.r2.md` | `1c5e3844…` |
| 1 | `ssctr-review.r1.md` | `81114d89…` |

Round 1 holds the full evidence appraisal. My other earlier files carry matching `.r1`–`.r11` suffixes.

## Round 12 at a glance

**Verdict: FREEZE-2 is not allowed.** `freezeVerdict.runtimeMayBeFrozen` is false, and `scripts/freeze-r6-2.mjs` will refuse.

**D53 is only partly resolved.** The fix works when the exercise has a known load. It does not work when the exercise's load is still unconfirmed, because the new cap is set only on the known-load path.

**A new binding defect, D54, sits in the same row.** An exercise re-established in the taper, race week or post-event week gets the full re-establishment dose instead of the reduced event dose.

**The complete blocking list at this hash:**

| Item | Boundaries | What is wrong | Required change (runtime only) |
|---|---|---|---|
| D53, from-log path | LOAD-ESTABLISHMENT, PLANNED-PROGRESSION, ROTATION | A re-establishment of an exercise whose establishment log is still pending, or was performed without a usable log, starts no regain. The block-boundary set comes back at once: 2 → 4 sets | Start the regain at every performed re-establishment, whatever the state's mode. The count, block-boundary set included, then rises at most one set per executed week without a phase reduction |
| D54 | EVENT-TRANSITION, LOAD-ESTABLISHMENT | The re-establishment row ignores the phase reduction. In race week: 2 sets at RIR 3 against the declared 1 set at RIR ≥ 4 | The re-establishment row takes the phase reduction like the other establishment rows: never more sets than the phase dose, never fewer reps in reserve than the phase minimum |

Neither item needs a policy change, a Product decision or a Founder decision.

**What follows, under the Founder bound.** There is no round 13. R6 closes with an explicit blocker, and DOMAIN_COACHING_R7 is the next step. Applying the bound is the Chief's. R7 starts from the two items above; their fix then needs a narrow runtime delta check at this hash.

**Dispositions.** All ten boundaries stay APPROVE_WITH_CONDITIONS, with evidence status SUPPORTED_WITH_LIMITS. The envelopes are sound; the runtime fails them on two narrow paths.

| Binding status | Boundaries |
|---|---|
| Required change before freeze | LOAD-ESTABLISHMENT (D53, D54), PLANNED-PROGRESSION (D53), ROTATION (D53), EVENT-TRANSITION (D54) |
| No blocking defect observed | COLD-START, RUN-QUALITY, HYBRID-ARRANGEMENT, SUBSTITUTION, NONCLINICAL-RETURN, PARTIAL-NOISY-LEARNING |

## Reviewer, authority and target

**Reviewer.** The native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0. My instructions are the project adapter's body. I did not author the policy, the runtime or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This is not human, empirical or clinical validation, and it carries no runtime sovereignty.

**Target.** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-5, unchanged.
- Canonical hash, recomputed with `value.mjs`: `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`.
- File SHA-256: `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`.
- Both match the stated values.

**Runtime delta.**
- Of the 53 files in my round-11 `reviewedFiles`, exactly one differs: `CoachingCore/src/r6-program.mjs` (`8fdadf2f…` → `57973e97…`).
- One test file is new: `r6-ssctr-r11-fixes.test.mjs`, with 5 tests. No other test changed.
- The preserved copy in `ssctr-dossier/reviewed-18ec48f3-r11-source/` checks out:
  - its 25 files match its `MANIFEST.json`;
  - its 22 files that I recorded match my round-11 record;
  - every current `src/r6-*` and `test/r6-*` file equals it, except `r6-program.mjs` and the new test.
- My diff against that copy equals the author's `RUNTIME_DELTA_D53.diff`: 12 changed lines in 4 hunks, in `strengthDose`, `startStrengthReturn` and `advanceStrength` only.

## What I ran and read

**Tests.** `node --test` in CoachingCore: **443/443 pass** on Node v24.19.0, run by me before the review and again after writing the outputs.

**My probe.** `ssctr-probe-runtime-d53-r12.mjs`, output in `.out.json`.
- It uses the **DEV_TEST_ONLY authority** (`devAuthority()`) bound to `18ec48f3…`, not the real authority.
- It is built from a byte copy of my round-11 probe, which is unchanged.
- AHb, AJ and AM also run on a temporary copy of the runtime with the reviewed round-11 `r6-program.mjs`. The copy was built in the OS temp directory and removed; nothing under `CoachingCore/` was touched.

| Section | What it covers | Result |
|---|---|---|
| 31 round-11 sections | A–D, G, I–Z (including U, X, Y, Z), S2, Y2, Zb, AA, AC, AE, AG | Byte-identical to my round-11 output |
| AB, AD, AF | Dossier Q2 and Q4, unreviewed weeks | Only set counts held back after a re-establishment |
| AH | Sets after a re-establishment (D53) | **0 of 584** (round 11: 120) |
| AHb | AH on the reviewed round-11 runtime | 120 of 584: the probe still detects D53 |
| AI | Whole set-count trajectory after 3,672 re-establishments in 576 timelines | Known-load path clean; **from-log path: D53** |
| AJ | Scripted from-log states | **D53** reproduced; round-11 runtime for comparison |
| AK | Re-establishments in reduced phases, against twins | **D54**: 70 rows above the phase dose |
| AL | The cap's life | Cleared by a return, restarted by a second gap, held by a held week |
| AM | Dossier Q4 split weeks with the cap | One set lower for a week: R19 |
| AN | Loads after a re-establishment | No load above the earlier ceiling within two weeks |

My results agree with the author's on AH, Z, Y2, U and X.

**Author material.** I read these as author material, not as evidence:
- the dossier `RUNTIME_DELTA_D53.md`;
- the rerun of my round-11 probe in `r11-author-reruns/`;
- `author-check-resume-clock.d53.out.json` and `mutation-check-r11.out.txt`.

**Not run or read.**
- `npm run verify`, the `verify-r*` scripts and the `mutation-check-*` scripts.
- The R6 holdout, FIRST_EVALUATION and any post-fix evaluation.

**Literature.** Europe PMC works from Node in this session. I ran three searches (`ssctr-evidence/search-r12.json`, script `ssctr-r12-literature.mjs`) and added four sources:
- **de Carvalho e Silva 2022 (R6-S53), full text, meta-analysis.** In male runners a strength session lowered peak torque and raised soreness, creatine kinase and perceived exertion over 24–48 h. Time to exhaustion fell in 3 of the 4 studies that measured it. Submaximal running physiology was little changed.
- **Doma 2015 (R6-S54) and Doma 2017 (R6-S55), abstract only.** In resistance-untrained men the first lower-body 6RM bouts impaired submaximal running for about 24 h, and protection needed two or more bouts.
- **Berryman 2020 (R6-S56), full text, 8 runners, uncontrolled.** Four weeks without explosive strength training kept the running-economy gain, and 3000 m time improved.

R6-S48 (the repeated-bout protection fades over weeks) was re-confirmed. No study tests a strength re-establishment, or any strength dose, inside a running taper. That is a negative search.

## D53: resolved for a known-load state, still open for a from-log state

**What the fix does.** After a performed re-establishment, `advanceStrength` sets a cap at the re-establishment count. `strengthDose` holds the count, block-boundary set included, under the cap. The cap rises one set per executed week without a phase reduction.

**Where it works.** Every exercise with a known load.
- **AH:** 0 of 584 next exposures more than one set above the re-establishment, and none more than one above the count before the gap.
- **AI:** 2,448 re-establishments in 384 timelines: four rotation preferences, four goals, a known or no known dose, two or three strength days, strength missed for 4–5 weeks.
  - No later count exceeds the allowance, and none is held below it.
  - Every trace reaches the count the exercise would otherwise have: 1,872 after 1 week, 384 after 2, 144 after 3. The other 48 end with the program.
- **AL:** a declared return clears the cap, and the D49 steps govern (1, 2, then 3 sets under the ceiling). A held re-establishment week does not advance. A second gap restarts the cap. An equipment window that ends with a re-establishment regains one set per week.

**Where it does not.** The cap is set only inside the branch that converts a known load (`reestablishes(ex,u)` requires `ex.mode === 'KNOWN'`). `strengthDose` prescribes the same "Not done for more than 28 days" row for a from-log state:
- an exercise whose establishment log is still pending confirmation (D45);
- an exercise performed without a usable log.

That re-establishment starts no regain, so the block-boundary set comes back at once.

**Evidence.**
- **AI, noisy-log grid.** In 192 timelines the establishment logs of exercises without a known dose alternate 20 and 40 kg, so they stay pending, as D45 intends.
  - 592 of 1,224 re-establishments start from a pending state.
  - 48 next exposures exceed the allowance. 24 of them are prescribed 2 → 4 sets at RIR 3. The other 24 fall in a consolidation week whose count before the reduction is two above.
- **AJ, consistent logs after the gap.** A goblet squat and a dumbbell RDL, pending through the block that ended in week 4, are re-established at 2 sets in week 10 and prescribed 4×5 in week 11. The same happens when the re-establishment log is adopted (4×10), and with a session reported without details before the gap (a count of 4 before the consolidation reduction). The reviewed round-11 runtime gives the same violations plus the known-load ones.

**What it contradicts.** `strength.setsAfterReestablishment` ("never at once") and conditions LE-15, PP-14 and ROT-10.

**Sporting weight.** Modest, as in round 11 (LE-12). It is still the case the declared rule exists for.

**Required change (runtime-only).**
- Start the regain at every performed re-establishment by effort after more than `return.moderateMaxDays`, whatever the state's mode: known load, pending establishment log, unlogged or re-established.
- Regression tests:
  - a pending log with a block-boundary set earned before the gap;
  - block credit earned by the re-establishment week;
  - an unlogged state;
  - the adopted variant (AJ and the noisy-log grid of AI).

## D54 (new): the re-establishment row ignores the event doses

**Defect.** `strengthDose` returns the re-establishment row, min(goal sets, 2) at RIR ≥ 3, before it computes the phase reduction. The first-establishment and "No usable load" rows take the reduced count; this one does not.

**Evidence (AK).** Six race programs: 10K and half marathon in week 13; goals STRENGTH, RUNNING_SUPPORT and GENERAL. Strength is missed for the five weeks before each phase, and each case is compared with a twin executed throughout. 70 re-establishment rows exceed the phase dose of the same exercise on the same date:

| Phase | Rows | Re-establishment | Declared dose |
|---|---|---|---|
| Race week, 6 days before the race | 18 | 2 sets at RIR 3 (main lifts) | 1 set at RIR ≥ 4 |
| Post-event, 4 days after the race | 24 | 2 sets at RIR 3 | 1 light set at RIR ≥ 4 |
| Taper | 28 | 2 sets | 1 set |

In consolidation and specific weeks the re-establishment count is at or below the reduced count.

**What it contradicts.**
- Policy principle 8: strength stays at a reduced dose across event phases.
- `operational.event`: raceWeekStrengthSets 1 at raceWeekStrengthMinimumRir 4, postEventStrengthSets 1, taperStrengthSetFraction 0.5.
- EVENT-TRANSITION conditions 7 and 8.

**Why now.** The row predates FREEZE-1. Before D52 (B) a re-establishment after skipped sessions never fired. Now it follows ordinary use: strength skipped for a month before a race. I did not probe event phases in round 11.

**Sporting weight.** Low to modest (ET-13):
- this is the first bout after more than four weeks without the exercise, and the repeated-bout protection has partly faded (R6-S48);
- a strength session raises soreness and creatine kinase and shortens time to exhaustion in runners for 24–48 h (R6-S53); first bouts impair running for about 24 h (R6-S54, R6-S55);
- stopping strength in the last weeks did not hurt performance in a small study (R6-S56);
- but 2 sets at RIR ≥ 3 is small, and submaximal running physiology is little changed after a strength session (R6-S53).

It falls in the window the reduced dose exists for.

**Required change (runtime-only).**
- The re-establishment row takes the phase reduction: never more sets than the phase dose the exercise would otherwise have that day, and never fewer reps in reserve than the phase minimum.
- The load stays effort-guided under the earlier ceiling.
- Regression tests: a re-establishment due in a taper, race-window and post-event session, for a 3-set and a 2-set goal (AK).

## What the author disclosed

**The cap rises only in an executed week. Accepted.** An executed week means an ADVANCE or EARNED gate with logged evidence. This is the rule I set in round 11, the D49 return cap, and how every other step counts executed work (QRE-R6-04).

**A block set earned in a consolidation week waits for the next unreduced week. Accepted.** A consolidation week steps volume back, so it should not also count toward regaining volume. The cost is one set for a week:
- AB: 2×5 then 3×5 across consolidation week 11, where round 11 had 3×5 then 4×5;
- AF, every week reviewed: 3×5 where round 11 had 4×5.

The same pause holds through specific and taper weeks, which is conservative.

## Non-blocking observations

| ID | Observation |
|---|---|
| R19, amended | In the dossier-Q4 split week the cap now also starts from the planned re-establishment count. AM: after a performed 3×10 at the known load and a missed later re-establishment, the next week is 2×10 (round 11: 3×10). Conservative; base the conversion and the cap on the executed exposure |
| R17, amended | (c) also covers a first establishment: 1 set in a block-end consolidation week, then 3 sets, in 24 of 2,688 cases. (d) is new: a load or repetition step at the re-establishment review, or with a regained set, in 1,040 of 1,872 set rises. AN: no load above the earlier ceiling within two weeks. No declared rule is contradicted; declare both |

## Dispositions at hash 18ec48f3…

| Boundary | Disposition | Binding | Notes |
|---|---|---|---|
| R6-COLD-START | APPROVE_WITH_CONDITIONS | None | Probes byte-identical |
| R6-LOAD-ESTABLISHMENT | APPROVE_WITH_CONDITIONS | **D53 (from-log), D54** | D53 fixed for known loads |
| R6-PLANNED-PROGRESSION | APPROVE_WITH_CONDITIONS | **D53 (from-log)** | Condition 14; running unchanged |
| R6-RUN-QUALITY | APPROVE_WITH_CONDITIONS | None | Probes byte-identical |
| R6-HYBRID-ARRANGEMENT | APPROVE_WITH_CONDITIONS | None | Probes byte-identical |
| R6-SUBSTITUTION | APPROVE_WITH_CONDITIONS | None | Window-end regain one set per week |
| R6-NONCLINICAL-RETURN | APPROVE_WITH_CONDITIONS | None | A return clears the cap; D49 governs |
| R6-EVENT-TRANSITION | APPROVE_WITH_CONDITIONS | **D54** | New condition for re-establishments |
| R6-PARTIAL-NOISY-LEARNING | APPROVE_WITH_CONDITIONS | None | Pending logs behave as D45 intends |
| R6-ROTATION | APPROVE_WITH_CONDITIONS | **D53 (from-log)** | Condition 10; R17 amended |

**Conditions I rewrote.**
- **LE-15, PP-14, ROT-10.** The regain holds whatever the state's mode at the re-establishment. LE-15 also bounds the re-establishment row by the event doses.
- **EVENT-TRANSITION.** Added: an exercise re-established in a taper, race-window or post-event session takes that session's reduced dose (D54).
- **Every boundary.** The weekly-review contract stays the last condition (R18).

## May the runtime be frozen as FREEZE-2?

**No.** D53 (from-log path) and D54 block it. `scripts/freeze-r6-2.mjs` will refuse.

This was the last round R6 allows. Under the Founder bound, R6 closes with an explicit blocker, and DOMAIN_COACHING_R7 starts from:
1. D53 for every state mode, with its regression tests;
2. D54, with its regression tests;
3. then a narrow runtime delta check at hash `18ec48f3…`. If the author also changes policy text, the new hash needs a delta binding review instead.

**Before production, a KMP port or any real-athlete use** (unchanged):
- re-review the free-text screen and its battery together with the structured intake design, including R11 and R15;
- close R14 with the G03 classification;
- close R18.

## Human queue

`ssctr-proposed-queue-items.json` (revision r12) proposes ten funded-human revalidation items, one per approved boundary at this hash, with the round-12 conditions.
- An approved envelope does not freeze the runtime.
- The r12 proposal supersedes the unmerged r1–r11 proposals.
- I did not edit the queue file, which still holds 114 entries. Funding is NOT_DECLARED.

## Escalation and routing

**No escalation.**
- No envelope magnitude is widened.
- No clinical boundary is weakened.
- Neither blocker needs a policy change or a Founder decision.

**Routing:**
- **Chief:** apply the Founder bound. There is no round 13; carry D53 (from-log path) and D54 into R7 as its first blocking items.
- **Runtime author, in R7:** D53 for every state mode and D54; R19 as amended; R14 and R15 before any use beyond the offline reference.
- **Engineering, with Product/Data:** R18, and the weekly-review contract in any freeze disclosure and the judge briefs.
- **Runtime author with Product Constitution & Governance**, in the next policy revision: R16, and R17 as amended (a–d).
- **Data / Engineering:** numeric plausibility of logged loads (D45, R5), and the meaning and local date of a known dose's `observedAt`.
- **Product / Data:**
  - how an unconfirmed establishment log is asked about until it is confirmed (D45; the from-log path of D53);
  - the pregnancy/postpartum re-ask (R11);
  - sessions inside a declared pause (G03, R14);
  - absence prompts (G03, R18);
  - completion semantics (Q2);
  - the learning-consent privacy scope, unchanged.

## Validation

All ten records and the queue proposal pass the project validator: jsonschema 4.26.0, run with the bundled Python 3.12.14 via `ssctr-validate-r6.py`. The policy-review cross-check passes, and every recorded file hash is current.

This certifies record consistency only.

## Files

Written in this round:
- `ssctr-build-r6-r12.mjs`, the build script. It starts from my preserved `.r11` outputs (sha256-checked) and applies round 12, reading every count from the probe output;
- `ssctr-probe-runtime-d53-r12.mjs` and its `.out.json`;
- `ssctr-r12-literature.mjs`;
- in `ssctr-evidence/`: `search-r12.json`, `abstracts-r12.json`, `PMC9385928.xml` and `PMC7821917.xml`.

Updated in this round:
- `ssctr-policy-review.json`;
- `ssctr-records.json`;
- `ssctr-proposed-queue-items.json`;
- `ssctr-evidence-manifest.json`;
- `ssctr-schema-validation.json`;
- this file.

The `.r1`–`.r11` files are unchanged.
