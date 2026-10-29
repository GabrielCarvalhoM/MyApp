# SSCTR review of the R6 coaching envelopes

**Current state: round 11 (records revision r11), a narrow runtime delta check of D52 at the unchanged R6-POLICY-5 hash `18ec48f3…`, 2026-10-27.**

Earlier rounds are preserved unchanged:

| Round | File | Policy hash |
|---|---|---|
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

Round 1 holds the full evidence appraisal. My other earlier files carry matching `.r1`–`.r10` suffixes.

## Round 11 at a glance

**Verdict: FREEZE-2 is not allowed yet.** D52 is resolved, but this round found a new binding defect, D53:
- it is a runtime defect whose logic predates FREEZE-1;
- the D52 fix made it reachable in ordinary use;
- its fix is runtime-only, so the policy hash need not change.

**The round-10 defect:**

| Defect | Status |
|---|---|
| D52 | Resolved in every reviewed week. A prescription that was not executed establishes nothing, and the 28-day clock counts calendar days from the last executed exposure |

**The new binding defect:**

| Defect | Boundaries | In one line |
|---|---|---|
| D53 | LOAD-ESTABLISHMENT, shared with PLANNED-PROGRESSION and ROTATION | After a re-establishment the block-boundary set is added on top of the regained set, so the count rises two sets at once (2 → 4) in 120 of 584 cases |

**Dispositions at this hash.** All ten boundaries stay APPROVE_WITH_CONDITIONS, and their envelopes are sound.

| Binding status | Boundaries |
|---|---|
| Required change before freeze | LOAD-ESTABLISHMENT, PLANNED-PROGRESSION, ROTATION (all D53) |
| No blocking defect observed | COLD-START, RUN-QUALITY, HYBRID-ARRANGEMENT, SUBSTITUTION, NONCLINICAL-RETURN, EVENT-TRANSITION, PARTIAL-NOISY-LEARNING |

**The rulings, in short:**

| Item | Ruling |
|---|---|
| Author-found conflict filter | Accepted |
| Q1: later sessions of the same week repeat the establishment | Accepted |
| Q2: a completed report without details counts for the clock, not as a load | Confirmed |
| Q3: a known dose's clock starts at its `observedAt` | Confirmed |
| Q4: the clock is judged per session | Accepted as it is. Wording item R19, non-blocking |
| Disclosed: a never-performed exercise prescribed during a return | Accepted, non-blocking. To be declared (R17, amended) |
| Disclosed: a skipped weekly review keeps the projection | Not a FREEZE-2 blocker. Owned gap R18, required before any use beyond the offline reference |

**Effect at this hash.** The real authority enables all ten boundaries through the round-11 records. `scripts/freeze-r6-2.mjs` will still refuse, because `freezeVerdict.runtimeMayBeFrozen` is false.

**Next.**
1. Fix D53 in the runtime, with probe AH as regression tests.
2. Request another narrow runtime delta check at this hash.
3. FREEZE-2 can follow that check.

## Reviewer, authority and target

**Reviewer.** The native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0. My instructions are the project adapter's body. I did not author the policy, the runtime or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This is not human, empirical or clinical validation, and it carries no runtime sovereignty.

**Target.** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-5, unchanged.
- Canonical hash, recomputed with `value.mjs`: `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`.
- File SHA-256: `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`.
- Both match the stated values.

**Runtime delta.**
- Of the 44 files in my round-10 `reviewedFiles`, exactly three differ:

| File | Round 10 | Now |
|---|---|---|
| `CoachingCore/src/r6-program.mjs` | `4227f501…` | `8fdadf2f…` |
| `CoachingCore/src/r6-adaptation.mjs` | `c93f7047…` | `d6a1d6fc…` |
| `CoachingCore/test/r6-ssctr-revision.test.mjs` | `d69763d4…` | `e6099f1e…` |

- One test file is new: `r6-ssctr-r10-fixes.test.mjs`, with 10 tests.
- Every other `src/r6-*` and `test/r6-*` file equals the preserved copy in `ssctr-dossier/reviewed-18ec48f3-r10-source/`:
  - the copy's 24 files match its `MANIFEST.json`;
  - its 19 files that I recorded match my round-10 record;
  - the r5 modules the runtime imports predate round 10.
- My diff against that copy equals the author's `RUNTIME_DELTA_D52.diff`. It touches exactly the stated functions:
  - `r6-program.mjs`: `initialStrengthState`, `strengthDose`, `advanceStrength`, `strengthRowsFor`, `buildWeek`;
  - `r6-adaptation.mjs`: `usedInWeek`, the new `performedInWeek`, `loggedLoads`, `weeklyReview`, `rebuild`.
- In the revision test, only the D30 test changed: it now sets `lastPerformed`.
- The `CONFLICTED` status the new filter reads is the one `weekEvidence` emits.

## What I ran and read

**Tests.** `node --test` in CoachingCore: **438/438 pass** on Node v24.19.0, run by me twice: during the review and after writing the outputs.

**My probe.** `ssctr-probe-runtime-d52-r11.mjs`, output in `.out.json`.
- It uses the **DEV_TEST_ONLY authority** (`devAuthority()`) bound to `18ec48f3…`, not the real authority, which also enables the boundaries through my round-10 records.
- It is built from a byte copy of my round-10 probe, which is unchanged.
- It reads the runtime clock from `lastPerformed`, a local date. It falls back to `lastWeek` only on the round-10 runtime copy.
- Three sections also run on a temporary copy of the runtime with the reviewed round-10 `r6-program.mjs` and `r6-adaptation.mjs`: Zb, AE and AG. The copy was built in the OS temp directory and removed; nothing under `CoachingCore/` was touched.

| Section | What it covers | Result |
|---|---|---|
| A–D, G, I–X, S, S2 | The round-10 checks | Byte-identical to round 10 |
| Y | The round-9 rotation case | Only a return marker on a never-performed bodyweight accessory is gone |
| Y2 | 39 return timelines, 42 returns | Unchanged return lengths and rotation; 0 violations; clock audit below |
| Z | D52 regression | 0 findings |
| Zb | Probe Z on the round-10 runtime | The 9 round-10 findings, so the probe still detects D52 |
| AA | Q1, 180 programs | 0 violations |
| AB | Q2 | As the author states |
| AC | Q3, 20 programs | 0 violations |
| AD | Q4 | No dose above the known load |
| AE | The conflict filter | Works; the round-10 runtime adopted from the conflicted log |
| AF | Skipped reviews (disclosed) | Projection kept: R18 |
| AG | A never-performed exercise during a return (disclosed) | Return-entry dose, then joins the return |
| AH | Sets after a re-establishment | **D53**: 120 of 584 |

**My audit.** Y2 checks every strength state and row against my own record of executed dates and logged loads:
- 4,286 states: each `lastPerformed` equals my last executed date, or the known dose's observed date;
- no state exists for a never-performed exercise;
- no FROM_LOG row points to a log that does not exist.

The same audit is clean on 36 reviewed timelines in AA (4,610 states, 5,199 rows) and on the scripted cases AB–AE.

**Author material.** I read these as author material, not as evidence:
- the dossier `RUNTIME_DELTA_D52.md`;
- the rerun of my round-10 probe in `r10-author-reruns/`;
- `author-check-resume-clock.mjs` and `author-check-same-week.mjs`, with their outputs.

My results agree with the author's on Z, Y and Y2.

**Not run or read.**
- `npm run verify`, the `verify-r*` scripts and the `mutation-check-*` scripts.
- The R6 holdout, FIRST_EVALUATION and any post-fix evaluation.

**Literature.** Europe PMC works from Node in this session. I ran three searches (`ssctr-evidence/search-r11.json`, script `ssctr-r11-literature.mjs`) and added three sources:
- **Lin 2015 (R6-S50), abstract only.** A low-intensity eccentric bout 2 days or 1 week before a maximal bout gave 30–66% protection against muscle damage; there was none at 2–3 weeks.
- **Huang 2019 (R6-S51), abstract only.** A low-intensity bout 2 days earlier lowered peak soreness by 36–54% in nine muscle groups of untrained men.
- **Coskun 2026 (R6-S52), full text, randomized.** In sedentary men, both one set and three sets improved strength and size over 8 weeks; three sets improved them more.

Halonen 2024 (R6-S43, abstract) was re-confirmed: strength and size lost in a break return quickly on retraining. No study addresses how fast the number of sets should return after a break. That is a negative search.

## D52: resolved

**(A) A prescription that was not executed establishes nothing.**
- **Z1.** After a missed first exposure, the next one is the effort-guided establishment row:
  - EVERY_2_WEEKS and COACH_DECIDES: db-step-up, 1×10 at RIR 3, in a consolidation week;
  - FIXED: goblet squat, 2×8 at RIR 3, with the ramp-up and no progression rule.
- **Z3.** After a return, an exercise first prescribed in the pause-dated session is established by effort.
- **Z4.** The equipment-window substitute gets the establishment row again, then the pending row.
- **AA.** In 180 initial programs, every exposure of an exercise with no state at the week start is an effort row: 3,249 exposures. On the reviewed round-10 runtime, the same programs prescribe 1,032 non-effort rows of that kind, such as a Friday "Use the load you logged last time for this exercise" after a Monday establishment.

**(B) The clock counts calendar days from the last executed exposure.**
- **Z2.** The back squat skipped from week 4 is KNOWN 82.5 kg at 7–28 days. It is re-established by effort at 35 and 42 days, with "do not exceed 82.5 kg".
- **Z3.** An accessory last done 35 days earlier is re-established, and the runtime clock reads 35 days.

**Earlier fixes still hold.** Probes D, M, N, U, W and X are byte-identical, so D44, D45, D48 and D49 hold. D51 holds in Y and Y2.

## New binding defect D53 (required before FREEZE-2)

**Defect.** After a performed re-establishment, `advanceStrength` restores the state's base set count one set per executed week (`priorSets`). `strengthDose` then adds the block-boundary set on top. So the week after a 2-set re-establishment can be 4 sets at RIR 3.

**Evidence (probe AH).** The grid has 72 timelines:
- FIXED and EVERY_2_WEEKS;
- four strength goals;
- strength skipped for 4–6 weeks, every week reviewed.

It has 600 performed re-establishments, followed by 584 next exposures. **120 of them are more than one set above the re-establishment:**

| Where the block set came from | Cases |
|---|---|
| Earned before the gap, and returned at once on top of the regained set | 72 |
| Earned by the block whose only executed exposure of the exercise was the re-establishment, and added in the same week as the regained set | 48 |

The 48 also exceed the count prescribed before the gap by more than one set.

**What it contradicts.**
- `strength.setsAfterReestablishment`: "its earlier set count comes back one set per executed week, never at once".
- LOAD-ESTABLISHMENT condition 15, PLANNED-PROGRESSION condition 14 and ROTATION condition 10.

**Why now.** The logic predates FREEZE-1: QRE-R6-17 regains the base count only. Before D52 (B), a re-establishment after skipped sessions never fired, so the path was rarely reachable. Now it follows ordinary use: a month of skipped strength.

**Sporting weight.** Modest:
- the load is re-established by effort at RIR ≥ 3;
- the re-establishment session itself protects partly against damage from the next one, for about a week (R6-S50);
- detrained strength returns fast (R6-S43).

It is still the case the declared rule exists for, and I approved that rule as a condition.

**Required change (runtime-only).**
- After a performed re-establishment, the prescribed set count, including any block-boundary set, rises at most one set per executed week without a phase reduction. It rises from the re-establishment count up to the count the exercise would otherwise have, with phase reductions on top.
- Add probe AH as regression tests. Cover both cases: a block set earned before the gap, and one earned by a block whose only executed exposure was the re-establishment.
- Whether such a block should earn a set at all is a policy declaration for the next revision (R17).

## The author-found conflict filter

**Accepted.** `loggedLoads` now skips conflicted rows.

Probe AE reported a session twice under one event id, at 20 kg and then 40 kg:
- the later establishment log of the same week alone stays pending;
- the reviewed round-10 runtime adopted KNOWN 20 kg from the conflicted log;
- the conflicted session moves no clock.

This brings load adoption in line with the quarantine that the gates, capacity and learning already apply (QRE-R6-14), and with D45. An uncorrected conflict leaves the exercise unestablished and its clock running, which is conservative. The correction flow is Data's and Product's.

## Answers to the four questions

### Q1 — later sessions of the same week repeat the establishment

**Accepted.**
- **AA.** Week-0 planned sets fall in 104 of 180 programs, by 1–4 sets, and never rise.
- **Agreement.** Two establishment logs of the week within one increment confirm each other: 20 and 20 kg give KNOWN 20 kg. That is the D45 second-log rule. Disagreeing logs stay pending: 20 and 30 kg give pending 30.
- **Cost.** It is confined to one week:
  - a low-dose first bout protects against damage from a harder bout 2 days to 1 week later (R6-S50, R6-S51, abstract level);
  - one set still produces early gains in untrained adults, though three sets produce more over 8 weeks (R6-S52).
- **Benefit.** It removes rows that pointed at an unconfirmed log (D48).

### Q2 — a completed report without exercise details

**Confirmed.** Probe AB:
- the rotated exercise reported this way has no state, and its next exposure is the establishment row;
- the squat's clock counts that day, while its load and reps hold; the logged twin progressed;
- a re-establishment reported without details is followed by "No usable load was logged last time: establish the load by effort again; do not exceed 82.5 kg";
- a partial report moves only the clocks of the exercises it lists.

A completed session is an exposure for the detraining and repeated-bout clock, but only a logged load is load evidence.

**Condition.** Completion semantics stay Product/Data adherence semantics (G03): what counts as completed, and when to ask for details.

### Q3 — the clock of an intake known dose starts at `observedAt`

**Confirmed.** Probe AC, 20 programs:
- the known squat is KNOWN at 1–28 days and re-established at 29 days, with its load as the ceiling;
- observed 29 days before `asOf`, the intake no longer accepts it as current;
- skipped from week 0, it is re-established at 32 days.

This applies the declared rule to the only execution date the runtime has.

**Conditions (Data).**
- `observedAt` must mean the date the dose was last performed, not the date it was reported.
- The date part of a timestamp that is not in local time can be one day off.

### Q4 — the clock is judged per session

**Acceptable as it is.** Probe AD reproduces it with db-rdl:
- Monday, at 28 days: KNOWN 3×10;
- Wednesday, at 30 days: re-established 2×8.

I executed the week three ways. In none did a dose exceed the known load, and the next week followed the executed exposures.

**Two conservative artifacts.**
- The later row says "Not done for more than 28 days" even when the earlier exposure was performed.
- At the review, the week's last prescribed entry decides the conversion. So a performed known-load Monday followed by a missed re-establishment converts the state; without a log, the next exposures are effort-guided under the ceiling.

**Why not the alternative.** It would re-establish an exposure that the declared 28-day window still covers, and it would not make the week more correct.

**R19** (non-blocking, next runtime revision): word that row so that it does not assert non-performance, and base the conversion on the exposure that was executed.

## What the author disclosed

### A never-performed exercise prescribed during a return

**Acceptable, non-blocking.** Probe AG:
- while any exercise in use is at the entry step, the never-performed exercise gets the return-entry dose (1×8 at RIR ≥ 4);
- once performed, it joins the return and comes back through the step-2 pending row.

The other branch did not occur in my timelines either: every exercise in use already past the entry step, then normal establishment and normal progression. Its first dose is at or below the step-2 dose, and afterwards it is at most about one set above the capped exercises.

It is to be declared: R17, amended.

### A skipped weekly review keeps the projection: R18

**Not a FREEZE-2 blocker, but an owned gap required before any use beyond the offline reference.**

**What probe AF shows.** Weeks 4–8 had no review and nothing executed:
- the week-9 review starts from the projection;
- week 10 prescribes the back squat at **4×5 at 87.5 kg (KNOWN)**, 49 days after it was last lifted at 82.5 kg; the clock reads the projected date;
- a rotated exercise never performed carries a FROM_LOG state without a log;
- the threshold ladder advanced from step 0 to 5 in weeks never trained;
- running is bounded at the next review by the single-run ceiling from the completed-work ledger (15 minutes); strength has no such bound;
- a declared 35-day return after the same absence starts from the reviewed pre-pause state, and is safe.

**What it contradicts.** The policy principle that a step advances only on executed work and that nothing progresses from elapsed calendar time. The reviewed path already has the right semantics: unreported sessions are missed (QRE-R6-04).

**Why it does not block FREEZE-2.**
- It arises only when the caller supplies no gating review for a week.
- The mechanism is an Engineering interface decision with a Product/Data dependency (G03), not a runtime-only correction of a declared rule. Options are a catch-up from the ledger, refusing a review whose earlier weeks were not reviewed, or asking the athlete.
- Every record now states the weekly-review contract as its last condition.

**For the freeze and the judges.** Record the contract in the FREEZE-2 disclosure and in the judge briefs. Outputs of evaluation steps that skip weeks carry the projection's assumption.

### Sessions before the pause, in the pause week

**Accepted.** They are not applied at the return, which only lengthens the clock. That is conservative.

## Dispositions at hash 18ec48f3…

Evidence status is SUPPORTED_WITH_LIMITS for all ten boundaries.

| Boundary | Disposition | Binding | Notes |
|---|---|---|---|
| R6-COLD-START | APPROVE_WITH_CONDITIONS | None | Q1: a few week-0 sets fewer, never more |
| R6-LOAD-ESTABLISHMENT | APPROVE_WITH_CONDITIONS | **D53 before freeze** | D52 resolved; Q1–Q4 and the conflict filter ruled |
| R6-PLANNED-PROGRESSION | APPROVE_WITH_CONDITIONS | **D53 before freeze** | Condition 14; running unchanged |
| R6-RUN-QUALITY | APPROVE_WITH_CONDITIONS | None | Unchanged; R18 noted |
| R6-HYBRID-ARRANGEMENT | APPROVE_WITH_CONDITIONS | None | Unchanged |
| R6-SUBSTITUTION | APPROVE_WITH_CONDITIONS | None | D52 resolved (Z4) |
| R6-NONCLINICAL-RETURN | APPROVE_WITH_CONDITIONS | None | D52 resolved; AG accepted |
| R6-EVENT-TRANSITION | APPROVE_WITH_CONDITIONS | None | R14 open gap |
| R6-PARTIAL-NOISY-LEARNING | APPROVE_WITH_CONDITIONS | None | Conflict filter accepted |
| R6-ROTATION | APPROVE_WITH_CONDITIONS | **D53 before freeze** | D52 resolved; condition 10 |

**Conditions I rewrote.**
- **LOAD-ESTABLISHMENT.** Establishment needs an executed exposure with a logged load, including the same-week rule and conflicted reports. The resume clock is defined by session date and source. Sets come back one per executed week, including any block-boundary set. Added: Q2, Q3 and the conflict filter.
- **PLANNED-PROGRESSION and ROTATION.** The set regain includes any block-boundary set (D53).
- **SUBSTITUTION, NONCLINICAL-RETURN and ROTATION.** The D52 conditions are marked resolved.
- **NONCLINICAL-RETURN.** Added: the dosing of a never-performed exercise prescribed during a return.
- **PARTIAL-NOISY-LEARNING.** A conflicted report counts for neither load adoption, confirmation nor the resume clock.
- **Every boundary.** Added the weekly-review contract as the last condition (R18).

## Non-blocking recommendations and owned gaps

| ID | Recommendation |
|---|---|
| R1, R2 | Unchanged from earlier rounds |
| R5 | Confirm a load logged far below the plan. Data owns the threshold |
| R8 | Collect the keep-or-change choice before the race window |
| R9 | Unchanged; no exemption is declared |
| R11 (rest) | Ask pregnancy/postpartum again at reviews and returns. Product/Data |
| R14 | Open gap tied to G03. Close it before any use beyond the offline reference |
| R15 | Treat "cut back", "cut down" and the face and eye idioms as phrases, before any use beyond the offline reference |
| R16 | Long run never shorter than the week's easy runs in consolidation and the first cold-start weeks; nothing new planned into a consolidation week |
| R17 | **Amended.** Declare: (a) the bodyweight case of `strength.resumeAfterDays`; (b) how an exercise first performed during a return is dosed; (c) whether a block whose only executed exposure was a re-establishment earns a set |
| R18 | **New, owned gap, required before any use beyond the offline reference.** A week without a gating review never counts as executed. Engineering chooses the mechanism, with Product/Data (G03) |
| R19 | **New, non-blocking.** The wording of the Q4 split-week row, and a conversion that follows the executed exposure |

## May the runtime be frozen as FREEZE-2?

**No.** `freezeVerdict.runtimeMayBeFrozen` is false, with D53 blocking. `scripts/freeze-r6-2.mjs` will refuse.

1. Fix D53 in the runtime, with probe AH as regression tests. It needs no policy change.
2. Request a narrow runtime delta check at hash `18ec48f3…`. Probes AH, Z, Y2, U and X, the round-11 sections and the suite will be re-run, and the records re-issued with a new freeze verdict.
3. R18 may be closed in the same change if Engineering and Product/Data agree on the mechanism. It does not block FREEZE-2.
4. If the author also changes policy text, the new hash needs a delta binding review instead.

**Before production, a KMP port or any real-athlete use:**
- re-review the free-text screen and its battery together with the structured intake design, including R11 and R15;
- close R14 with the G03 classification;
- close R18.

## Human queue

`ssctr-proposed-queue-items.json` (revision r11) proposes ten funded-human revalidation items, one per approved boundary at this hash, with the round-11 conditions.
- An approved envelope does not freeze the runtime.
- The r11 proposal supersedes the unmerged r1–r10 proposals. The r10 items named the same hash; their conditions are replaced.
- I did not edit the queue file, which still holds 114 entries. Funding is NOT_DECLARED.

## Escalation and routing

**No escalation.**
- No envelope magnitude is widened.
- No clinical boundary is weakened.
- D53 restores declared behaviour and needs no Founder decision.

**Routing:**
- **Runtime author:** D53, then R19 in the next runtime revision; R14 and R15 before any use beyond the offline reference.
- **Engineering, with Product/Data:** R18, and the weekly-review contract in the FREEZE-2 disclosure and the judge briefs.
- **Runtime author with Product Constitution & Governance**, in the next policy revision: R16 and R17 as amended.
- **Data / Engineering:** numeric plausibility of logged loads (D45, R5), and the meaning and local date of a known dose's `observedAt` (Q3).
- **Product / Data:**
  - the pregnancy/postpartum re-ask (R11);
  - sessions inside a declared pause (G03, R14);
  - whether missed sessions, or an absence without reviews, prompt the athlete for a reason (G03, R18);
  - completion semantics (Q2);
  - the learning-consent privacy scope, unchanged.

## Validation

All ten records and the queue proposal pass the project validator: jsonschema 4.26.0, run with the bundled Python 3.12.14 via `ssctr-validate-r6.py`. The policy-review cross-check passes, and every recorded file hash is current.

This certifies record consistency only.

## Files

Written in this round:
- `ssctr-build-r6-r11.mjs`, the build script, which replays rounds 1–10 unchanged and adds round 11;
- `ssctr-probe-runtime-d52-r11.mjs` and its `.out.json`;
- `ssctr-r11-literature.mjs`;
- in `ssctr-evidence/`: `search-r11.json`, `abstracts-r11.json` and `PMC13670784.xml`.

Updated in this round:
- `ssctr-policy-review.json`;
- `ssctr-records.json`;
- `ssctr-proposed-queue-items.json`;
- `ssctr-evidence-manifest.json`;
- `ssctr-schema-validation.json`;
- this file.

The `.r1`–`.r10` files are unchanged.
