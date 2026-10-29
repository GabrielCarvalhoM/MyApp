# SSCTR review of the R6 coaching envelopes

**Current state: round 9 (records revision r9), a delta binding review of R6-POLICY-5 at hash `18ec48f3…`, 2026-10-26.**

Earlier rounds are preserved unchanged:

| Round | File | Policy hash |
|---|---|---|
| 8 | `ssctr-review.r8.md` | `1046ad0e…` |
| 7 | `ssctr-review.r7.md` | `e9c87e09…` |
| 6 | `ssctr-review.r6.md` | `af2779fe…` |
| 5 | `ssctr-review.r5.md` | `f9f89b7f…` |
| 4 | `ssctr-review.r4.md` | `d766f0d9…` |
| 3 | `ssctr-review.r3.md` | `983171ac…` |
| 2 | `ssctr-review.r2.md` | `1c5e3844…` |
| 1 | `ssctr-review.r1.md` | `81114d89…` |

Round 1 holds the full evidence appraisal. My other earlier files carry matching `.r1`–`.r8` suffixes.

## Round 9 at a glance

**Verdict: FREEZE-2 is not allowed yet.** Two new binding defects block it, D50 and D51:
- both are runtime defects that predate FREEZE-1;
- I found them in this round and missed them in rounds 1–8;
- both fixes are runtime-only, so the policy hash need not change.

**The round-8 defects are all resolved:**

| Defect | Status |
|---|---|
| D47 | Resolved. One narrow, non-blocking residual (R14) |
| D48 | Resolved, in the normal branch and in return step 2 |
| D49 | Resolved. My round-8 literal check is withdrawn (dossier Q1) |

**The new binding defects:**

| Defect | Boundaries | In one line |
|---|---|---|
| D50 | PLANNED-PROGRESSION, shared with RUN-QUALITY | When a cap holds the long run, running stops progressing |
| D51 | ROTATION, shared with NONCLINICAL-RETURN | After a return, rotation never resumes |

**Dispositions at this hash.** All ten boundaries are APPROVE_WITH_CONDITIONS, and their envelopes are sound. D50 and D51 must be fixed in four of them before the freeze:

| Binding status | Boundaries |
|---|---|
| Required change before freeze | PLANNED-PROGRESSION (D50), RUN-QUALITY (D50), NONCLINICAL-RETURN (D51), ROTATION (D51) |
| No blocking defect observed | COLD-START, LOAD-ESTABLISHMENT, HYBRID-ARRANGEMENT, SUBSTITUTION, EVENT-TRANSITION, PARTIAL-NOISY-LEARNING |

**Effect at this hash.** The real authority now enables all ten boundaries. I checked four cases:
- a cold-start program is PROPOSED;
- a 10K program is PROPOSED;
- a restart after a 6-week pause is PROPOSED;
- a return review re-establishes (MODIFY).

`scripts/freeze-r6-2.mjs` still refuses, because `freezeVerdict.runtimeMayBeFrozen` is false.

**Next.**
1. Fix D50 and D51 in the runtime, with their regression tests.
2. Request a narrow runtime delta check at this same hash.
3. FREEZE-2 can follow that check.

## Reviewer, authority and target

**Reviewer.** The native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0. My instructions are the project adapter's body. I did not author the policy, the runtime or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This is not human, empirical or clinical validation, and it carries no runtime sovereignty.

**Target.** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-5.
- Canonical hash, recomputed with `value.mjs`: `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`.
- File SHA-256: `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`.
- Both match the stated values. I also recomputed the preserved round-8 bytes: `1046ad0e…` / `2ab7ea45…`.

**Policy delta, from my own structured diff.** It matches the dossier:
- **Changed text in five keys:**
  - `strength.setIncreaseAtBlockBoundary`;
  - `strength.loggedLoadAdoption.semantics` (the D48 clause);
  - `event.raceDayCompletion.semantics`;
  - `return.reasonScreen` (the R11 sentence);
  - `learning.missingGate` (R12, R13).
- **Four additions:**
  - `event.raceDayCompletion.historyModes` (`WALK_JOG`, `RESTART`);
  - `return.strengthReturnSets`;
  - `return.returnLoadCap`;
  - `return.restartRunHistory`.
- The revision label and the revision note changed.
- **No numeric value changed or was added**, and no envelope magnitude is widened.

**Runtime delta.** I first checked the preserved copy `ssctr-dossier/reviewed-1046ad0e-source/` against the file hashes I recorded in round 8. Every file matched. Against that copy, exactly the stated files changed:
- `r6-program.mjs`;
- `r6-adaptation.mjs`;
- `r6-prescription.mjs`;
- `r6-clinical.mjs`;
- `r6-ssctr-r7-fixes.test.mjs` (one D48 assertion);
- plus the new `r6-ssctr-r8-fixes.test.mjs`.

## What I ran and read

**Code read.** The full diff of the four runtime files. I also read the current text of `advanceRun`, `distributeRun`, `strengthDose`, `startStrengthReturn`, `advanceStrength`, `eventWeekSessions`, `buildWeek` (race day), `returnAfterPause`, `rebuild` and `finishProposal`, and the FREEZE-1 source of `advanceRun`.

**Tests.** `node --test` in CoachingCore: **422/422 pass**, run by me.

**My probe.** `ssctr-probe-delta-policy5-r9.mjs`, output in `.out.json`.
- It uses a **DEV_TEST_ONLY authority** (`devAuthority()`) bound to `18ec48f3…`. Until these records existed, the real authority enabled nothing at the new hash.
- It started from a copy of my round-8 probe, which is unchanged.
- Sections A and P apply the D47 rule. The round-8 expectation is still counted.
- Section U applies the declared D49 rule. The round-8 literal checks are still reported.

| Section | What it covers | Result |
|---|---|---|
| A | 840 event programs over every race weekday | 0 violations; R10 holds in 792 weeks |
| B | 432 walk/jog cold starts | 0 violations |
| C | Seven walk/jog, restart and below-minimum event programs | All completions, each with the item |
| D, M, N | Logged-load adoption, D44, D45 | Unchanged; 0 violations |
| G | One wearable activity bound to two sessions | Both sessions CONFLICTED |
| I, Q | Return facts and eligibility flag forms | 0 violations |
| J, R | 53- and 91-phrase screen batteries | 0 mismatches; R11 words route CLINICAL or ASK |
| K, L | Missed-run and projection gating | Hold |
| O | Return load cap | As declared |
| P | 360 mode-varied event programs | 330 completions, each with the item (see below) |
| T | R12 walk conversion; R13 single-day return | Both work; T also leads into D50 |
| U | 20 return timelines, three from a known five-set squat | 0 violations under the declared rule; two s4 flags are Q1 |
| V | Restarts, moderate returns, goal changes and date changes applied by reviews | D47 holds; one residual (R14) |
| W | D48 pending row, normal and return step-2 branches | Ramp-up first; never "use the load you logged" |
| X | Block credit over 16 weeks; 12 returns before a 10K | 0 violations; race window stays light |
| Y | Rotation after a 14-day return | **D51** |
| S | Progression stall: 66 cold-start programs, one executed simulation | **D50** |

**Section P in detail.**
- No walk/jog- or restart-class racer is at race effort (round 8: 51).
- The 330 completions split by basis: 189 race-week mode, 111 program history, 30 half-marathon long run.
- In all 330, the stated longest run equals the longest continuous run prescribed before race week.

**Author material.** I read the author's rerun of my round-8 probe (`ssctr-dossier/policy5-author-reruns/`) as author material, not as evidence. My own results agree with it on the sections it reports (A, B, J, L, M, P, Q, R and U). Its P mismatch count of 51 is the round-8 expectation, which I replace with the D47 rule.

**Not run or read.**
- `npm run verify` and the `verify-r*` scripts.
- The R6 holdout, FIRST_EVALUATION and any post-fix evaluation.

**Literature.** Europe PMC works from Node in this session. I ran four searches (`ssctr-evidence/search-r9.json`, script `ssctr-r9-literature.mjs`) and read four new full texts:
- **Pancar 2026, RCT.** Limbs trained at reduced sets in weeks 4 and 8 followed the full program in every other week, with similar gains.
- **Coleman 2024, RCT.** Trained adults resumed the same program after a week without training. Strength gains were smaller than with continuous training.
- **Bell 2023, Delphi.** Coaches agree that a deload, including lowering sets, prepares for subsequent training. This is expert opinion and auxiliary only.
- **Fokkema 2020, observational.** In recreational half-marathon runners, higher weekly volume and a longer longest run went with faster times and no more injuries.

I re-read Zheng 2022 (R6-S19) for Q7.

## The round-8 defects

| ID | Status | Evidence |
|---|---|---|
| D47 | **Resolved** | See below |
| D48 | **Resolved** | See below |
| D49 | **Resolved** | See below |

**D47.**
- Race day is a completion, with the item, wherever the program used walk/jog or a restart (probe P).
- The item is recomputed in every proposal: restarts applied by reviews, moderate returns, and goal and date changes (probe V).
- It states the run actually reached, and never "0 minutes".
- One narrow residual is non-blocking (R14).

**D48.**
- A pending row starts with the establishment ramp-up, then gives the pending rule, then "Record the load and its convention" (probes N and W).
- It never says "use the load you logged".
- This holds in the normal branch and in return step 2.

**D49.**
- Across 35 timelines (probes U and X) the strength count follows the declared rule.
- No block with a return exposure earns a set.

## New binding defects (required before FREEZE-2)

### D50: running stops progressing when a cap holds the long run

**Defect.** Under a 50-minute long run, `advanceRun` counts a long-run step as the week's single-session increase, even when the long-run share cap keeps the prescription where it was. That blocks the easy step and the quality step every week. The easy runs never grow, so the share cap, which waits for easy running to grow, never releases.

**Evidence (probe S, all sessions executed).**
- 47 of 66 cold-start EASY programs (3–4 run days, 30–150 min/week) have 4 or more consecutive flat build weeks.
- 42 of them have 6 or more.
- In 35, the easy run never steps in 16 weeks.

Examples:
- **45 min/week, longest run 25.** Two 25-minute easy runs and a 40-minute long run, unchanged from week 6 to week 15.
- **60 min/week, longest run 35, 10K in week 13.** Two 15-minute easy runs and a 20-minute long run for the whole program, below the athlete's current running.
- **A quality runner.** Quality is active for 13 weeks and never advances a step.

The executed simulation shows the same. The R12 athlete runs into it after its second walk conversion.

**Why it is binding.** It contradicts the policy's own declarations:
- `run.singleRunCeiling.disclosure` restricts an actual 5-minute step beyond a sub-50-minute reference.
- `run.longRunShareSemantics` says the cap *holds* the long run.
- The athlete-facing text says the long run is held "until easy running grows".

The logic is identical in FREEZE-1.

**Required change (runtime-only).**
- A long-run step that a cap holds is not a single-session increase.
- That week, the easy step and the quality step proceed under their own gates and cadence.
- The one-increase-per-week rule under a 50-minute reference still applies.
- Add the probe-S profiles as regression tests: 45/25 and 60/35 with three run days, the quality runner, and the all-walk athlete.

### D51: a return switches rotation off for good

**Defect.** A moderate or long return gives every exercise in the strength state a return step, including accessories rotated out before the break. Exercises not used during the return never execute an exposure, so they keep return step 0 for the rest of the program. The strength state therefore never leaves the return:
- rotation stays off;
- any exercise added later, such as a substitute, starts at the return-entry dose.

**Evidence (probe Y).** After a 14-day return in week 6, four accessories keep return step 0 through week 15.
- With EVERY_2_WEEKS, the accessories are identical from week 10 to week 15; the projection had alternated.
- With COACH_DECIDES, the week-12 rotation never happens.

This contradicts ROTATION condition 5 and the two-step return. It predates FREEZE-1.

**Required change (runtime-only).**
- The return steps apply to the exercises in use.
- An exercise not used during the return carries no return step once those exercises complete theirs.
- A rotated-back exercise not done for more than 28 days re-establishes by effort (ROTATION condition 8).
- Rotation resumes on its cadence, still deferred in establishment and event phases.
- Add probe Y as a regression test.

The sporting cost is the athlete's chosen variation, not a demonstrated loss of adaptation (Baz-Valle 2019). The defect is a broken declared cadence, not a risk.

## Answers to the dossier's nine questions

### Q1 — D49: the ceiling after a deload week

**The unreduced reading is accepted.** I withdraw my round-8 literal comparison.

A consolidation week is a planned, temporary reduction of the current dose, not a new training level:
- Pancar 2026: the reduced weeks were followed by the full program;
- Coleman 2024: trained adults resumed the same program after a week off;
- Bell 2023 (auxiliary): coaches agree a deload prepares for subsequent training.

The s4 athletes executed 3 sets in every development week before the consolidation week, so returning to 3 does not exceed the tolerated dose. The literal count would apply the reduction twice, and it would make the ceiling depend on the week the break began.

### Q2 — D49: phase reductions in the return steps

**Confirmed.**
- A reduced week has not executed the step-2 count, so the next week brings that count back, not one more.
- Six probe-U timelines put step 2 in a consolidation week.
- Near a race, step 2 is the light race-window session, or takes the taper reduction in a taper week (probe X, 12 returns).

### Q3 — D49: step 2 and large doses

**Confirmed.** A five-set squat returns 1, 2, 3, 4, 5.
- It is conservative: strength returns quickly after short breaks (Halonen 2024), and that limitation is recorded.
- Nothing supports a three-set jump in the week after a 2–4 week break.
- Strength gains plateau beyond about 2–3 sets per exercise (ACSM 2026), so the slower climb costs little.

### Q4 — D49: an unexecuted bonus set

**Confirmed.** A set earned but never executed is not tolerated dose.

Note the consequence. Any block with a return exposure earns nothing, including the block in which step 2 falls, so the boundary set can wait up to one more block:
- a break in week 4 leaves 3 sets through week 15 of 16;
- a break in week 2 regains 4 sets in week 12.

Load progression continues meanwhile. Accepted, and recorded as a limitation.

### Q5 — D47: no exemption

**Confirmed for this hash.** In the probes, the longest continuous run reached is:
- 20–30 minutes for walk/jog-built racers;
- 25–55 minutes for restart-built racers.

The dossier's 60-minute case does not arise under the current progression rules. It may once D50 is fixed. If an exemption is wanted, I would review one keyed on executed continuous running relative to the event: for example, the longest continuous run executed after the last walk/jog or restart week reaching the event's declared long-run target. It must be declared and reviewed first; I do not approve it now. This extends R9.

### Q6 — D47: proposals

**Confirmed.** The item is added, replaced or removed in every proposal, as probe V shows across restarts, moderate returns, and goal and date changes.

One residual (R14). Suppose a restart is applied in the last two weeks before the race, and the only post-restart week is the re-entry week. The review counts the sessions dated inside the pause as missed, so that week's gate holds. The item then reads "no continuous run yet", although two 15-minute restart runs were executed. Race day is a completion there anyway.

### Q7 — clearing the run history at a restart

**Confirmed.**
- After more than 28 days, pre-break peaks are not current capacity: VO2max drops after short- and long-term cessation (Zheng 2022).
- The envelope already treats historical maxima as ceilings.
- Probe V: taper and race-week runs come only from post-restart runs, and race-day strides and the touch require post-restart strides and quality.
- Keeping the peaks after a moderate return fits its two-step return to the prior dose.

### Q8 — R12

**Confirmed** (probe T): the first walk converts in week 7 and the second in week 12, in projection and under executed reviews.

After the second conversion the athlete runs into D50, and nothing grows from week 12 to week 15. D50 fixes that; R12 itself is accepted.

### Q9 — R11

**Accepted inside my owned gap.**

| Words | Outcome |
|---|---|
| Miscarriage, aborto, the C-section words (with the hyphen and space joins), the procedures | CLINICAL |
| Burns and cuts with a body part | CLINICAL |
| Maternity, newborn, breastfeeding, assault, mugging, stings, bruises | ASK |
| Paternity leave, Funeral and grief | Stay NONCLINICAL |

New conservative false positives are recorded as R15:
- "Cut back on running for a work project" routes to a human (cut + back);
- idioms with "face" or "eye" are asked.

## R11, R12, R13 and the author-found change

| Item | Ruling |
|---|---|
| R11 | Adopted and accepted inside the owned gap. Re-asking pregnancy/postpartum stays open with Product/Data. New false positives are in R15 |
| R12 | Adopted and accepted. It leads into D50, which is fixed separately |
| R13 | Adopted and accepted |
| Author-found restart run history | Accepted (Q7) |
| R5, R8 | Still open, as the author stated |
| R9 | Still open, extended by Q5 |

## Dispositions at hash 18ec48f3…

Evidence status is SUPPORTED_WITH_LIMITS for all ten boundaries.

| Boundary | Disposition | Binding | Notes |
|---|---|---|---|
| R6-COLD-START | APPROVE_WITH_CONDITIONS | None | Re-bound; the stall after week 1 belongs to D50 |
| R6-LOAD-ESTABLISHMENT | APPROVE_WITH_CONDITIONS | None | D48 resolved |
| R6-PLANNED-PROGRESSION | APPROVE_WITH_CONDITIONS | **D50 before freeze** | D49 (shared), R12 and R13 resolved |
| R6-RUN-QUALITY | APPROVE_WITH_CONDITIONS | **D50 before freeze** | The quality ladder stalls with the long run |
| R6-HYBRID-ARRANGEMENT | APPROVE_WITH_CONDITIONS | None | The race window stays light with a return in progress |
| R6-SUBSTITUTION | APPROVE_WITH_CONDITIONS | None | Re-bound |
| R6-NONCLINICAL-RETURN | APPROVE_WITH_CONDITIONS | **D51 before freeze** | D49, the load cap, the restart run history and R11 accepted |
| R6-EVENT-TRANSITION | APPROVE_WITH_CONDITIONS | None | D47 resolved; R14 non-blocking |
| R6-PARTIAL-NOISY-LEARNING | APPROVE_WITH_CONDITIONS | None | Re-bound; G03 observation routed to Product/Data |
| R6-ROTATION | APPROVE_WITH_CONDITIONS | **D51 before freeze** | Rotation never resumes after a return |

I rewrote the conditions that changed:
- **PLANNED-PROGRESSION.** The 50-minute rule now says a held step is not an increase (D50). The return-set rule now follows the declared D49 text. R12 and R13 are added.
- **NONCLINICAL-RETURN.** The full declared strength return and load cap, the LONG restart run history, R11, and the D51 return end.
- **EVENT-TRANSITION.** The recomputed negotiation, and no exemption unless declared and reviewed.
- **RUN-QUALITY and ROTATION.** Their D50 and D51 conditions.

## Non-blocking recommendations

| ID | Recommendation |
|---|---|
| R1, R2 | Unchanged from earlier rounds |
| R5 | Confirm a load logged far below the plan. Data owns the threshold |
| R8 | Collect the keep-or-change choice before the race window |
| R9 | For EASY-class racers far below the race, default to completion pacing. Any exemption from the history-based completion must be keyed on executed continuous running relative to the event, declared and reviewed |
| R11 (rest) | Ask pregnancy/postpartum again at reviews and returns. Product/Data |
| R14 | After a late restart, state the executed post-restart runs instead of "no continuous run yet" |
| R15 | Treat "cut back" and "cut down", and the face and eye idioms, as phrases before any use beyond the offline reference |

**Observation for Product and Data (G03).** In a re-entry week, sessions dated inside the declared pause are recorded as MISSED. The effect on gates is conservative, but the adherence semantics are theirs.

## May the runtime be frozen as FREEZE-2?

**No.** `freezeVerdict.runtimeMayBeFrozen` is false, with D50 and D51 blocking. `scripts/freeze-r6-2.mjs` will refuse.

1. Fix D50 and D51 in the runtime, with the probe-S and probe-Y regression tests. Neither needs a policy change.
2. Request a narrow runtime delta check at hash `18ec48f3…`. Probes A, P, S, T, U, V, X and Y and the suite will be re-run, and the records re-issued with a new freeze verdict.
3. If the author also changes policy text, the new hash needs a delta binding review instead.
4. FREEZE-2 may follow only after that check.

**Before production, a KMP port or any real-athlete use:** re-review the free-text screen and its battery together with the structured intake design, including R11 and R15. This is the owned open gap.

## Human queue

`ssctr-proposed-queue-items.json` (revision r9) proposes ten funded-human revalidation items, one per approved boundary at this hash.
- An approved envelope does not freeze the runtime.
- The r9 proposal supersedes the unmerged r1–r8 proposals. The r8 items named `1046ad0e…`, whose approvals expired with the policy change.
- I did not edit the queue file, and funding is NOT_DECLARED.

## Escalation and routing

**No escalation.**
- No envelope magnitude is widened.
- No clinical boundary is weakened: R11 only adds CLINICAL or ASK outcomes.
- D50 and D51 restore declared behaviour and need no Founder decision. D51 restores the rotation the athlete chose.

**Routing:**
- **Runtime author:** D50 and D51, with R14 and R15 recommended in the same revision.
- **Data / Engineering:** numeric plausibility of logged loads (D45, R5).
- **Product / Data:**
  - the pregnancy/postpartum re-ask (R11);
  - how sessions inside a declared pause are classified (G03);
  - the learning-consent privacy scope, unchanged.

## Validation

All ten records and the queue proposal pass the project validator: jsonschema 4.26.0, run with the bundled Python 3.12.14 via `ssctr-validate-r6.py`. The policy-review cross-check passes, and every recorded file hash is current.

This certifies record consistency only.

## Files

Written in this round:
- `ssctr-build-r6-r9.mjs`, the build script, which replays rounds 1–8 unchanged and adds round 9;
- `ssctr-probe-delta-policy5-r9.mjs` and its `.out.json`;
- `ssctr-r9-literature.mjs`;
- in `ssctr-evidence/`: `search-r9.json`, `abstracts-r9.json`, `PMC10511399.xml`, `PMC10809978.xml`, `PMC7496388.xml` and `PMC13031491.xml`.

Updated in this round:
- `ssctr-policy-review.json`;
- `ssctr-records.json`;
- `ssctr-proposed-queue-items.json`;
- `ssctr-evidence-manifest.json`;
- `ssctr-schema-validation.json`;
- this file.

The `.r1`–`.r8` files are unchanged.
