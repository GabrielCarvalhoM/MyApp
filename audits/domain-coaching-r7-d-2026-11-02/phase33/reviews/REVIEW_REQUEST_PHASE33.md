# R7-D Phase 3.3 — request for the narrow SSCTR recheck and the narrow quality/reliability check

**Candidate:** branch `claude/domain-coaching-r7-d`, runtime bytes of commit `3228a70`. `CoachingCore/src/r6-adaptation.mjs` has sha256 `15e4279b…`; every other source file equals R7D-FREEZE-3.
- **Runtime delta from R7D-FREEZE-3** (bound files `aeafc83`): one source file, +36/−12. See `git diff aeafc83 3228a70 -- CoachingCore/src`.
- **New test file:** `CoachingCore/test/r7d-phase33.test.mjs` (14 tests).
- **One existing file updated, two assertions in it, disclosed below:** `CoachingCore/test/r7d-phase32.test.mjs`, the two T4 assertions on training between breaks.
- No policy, catalog, record, queue, `product/` or `canon/` byte changed.

**Authority:** `../AUTHORIZATION_PHASE33.md` (the Founder's Phase 3.3 decision, summarized). **Direction B:** restrict what effectively counts as known training between two interruptions.
- An isolated execution is not a resumption, and a session's mere presence never proves restored capacity.
- A proven resumption stays recognized, read from the existing evidence where available and authorized.
- Identities and causal relations are preserved, and a second break never erases what is needed to read the first.
- I9 holds: no automatic merge.
- When the evidence is insufficient, ask, or take only the authorized conservative behaviour.
- No new physiological threshold, clinical criterion or dose. If one were needed, it must be proposed and recorded as a blocker, never invented.

There is no correction loop after these reviews. A blocker means no freeze: the phase closes with that blocker named.

**The defect being corrected:** SSCTR-P32-F01. Source: `../../phase32/reviews/ssctr/SSCTR_PHASE32_RECHECK_R7D.md`, probes `q4-between-breaks.mjs` TB1–TB4 and `q4b-long-then-session.mjs`.

## The witness (`../probes/f01-witness.mjs`, outputs in `../probes/out/`)

**On R7D-FREEZE-3** (RED, recorded before the change, reproduced on a second rebuild):

| Case | Result |
|---|---|
| F1–F4: a 14-day holiday kept, one easy run / every gap session / one strength session / a 5-minute aborted run, then a separate 4-day trip | SHORT 4 days (EASY 34, LONG 65, then THRESHOLD 41, LONG 70), with the holiday listed TRAINING_AFTER |
| F5: 30 days, one run, then 4 days | SHORT 4 days (LONG 39, then THRESHOLD 34) |
| F6 (the late form): the holiday declared after a reviewed week holding one run | SHORT 4 days |

**On the candidate:**
- **F1–F4:** MODERATE 21 days, with the run doses of the 21 days declared once (K1). They also equal nothing trained between (K2) and the holiday applied when stated (K3): EASY 15, LONG 20, then 30/30/45, with no quality work.
- **F5:** LONG 37 days, equal to the 37 days declared once.
- **F6:** MODERATE 27 days.
- **E1–E3, re-entry controls:**
  - E1 and E2: two weeks, or one week, of the plan executed in full, reported with the trip;
  - E3: a complete week reviewed before the holiday was declared.

  Each is the trip alone, SHORT, with `reentryWeek`. The doses equal R7D-FREEZE-3's (the inverse-defect check).
- **E4,** a week without its long run: MODERATE 25 days.

## The rule (runtime, `r6-adaptation.mjs`)

- **`reestablishedBetween(ctx, after, before, startedAt)`** (new) asks whether a week of the plan lies wholly between the earlier break's last day and the stop's first day, with every planned session of the week inside that gap.
  - The week must be executed completely in every sport it plans: every gate ADVANCE or EARNED, and a usable log for every exercise. This is the evidence reducer's own `complete` (COMPLETED_SESSIONS), the rule by which executed training ever becomes history (SSCTR S-A, E3; R7-A final P5).
  - It is read on the history the return reading `before` reads, `stateAtBreak(...).history`.
  - A review that closed the week does not make it a re-entry by itself.
- **`evidenceState`** also exposes, per week, `complete: {RUN, STRENGTH}`. It is computed by the existing `complete(sport)`, whether or not a review closed the week. The field is additive, and no consumer serializes the reducer's per-week output.
- **`stateAtBreak`** also returns `history`, the reducer it read.
- **`separateStop`:**
  - known training between two separate breaks ends the stop only when `reestablishedBetween` finds such a week. The earlier break is then `TRAINING_AFTER`, recorded with `reentryWeek`;
  - otherwise the stop runs through the earlier break, as with nothing trained between, and its label is `TRAINING_NOT_REESTABLISHED` when training is recorded there;
  - unreported planned sessions between them are still asked first (TRAINING_BETWEEN_BREAKS), unchanged.
- **`returnAfterPause`:** reason text only. It never says "no training recorded between them" when training was recorded.
- **Unchanged:** identity (`keptBreaks`, names, replays, corrections), `afterReentry` (the episode rule for applied breaks), the return recipe and classes, clinical first, F08, eligibility and every anchored line.

## Directed tests (`r7d-phase33.test.mjs`, 14/14)

| Founder item | Test |
|---|---|
| 1. Long break, one isolated execution, short second break; 10. F01 regression | T1 (F01 witness: four forms; the 30-day form) |
| 2. Distinct breaks with nothing trained between | T2 (characterization: NO_TRAINING_BETWEEN, TOUCHES) |
| 3. A proven resumption, without the inverse defect | T3 (one and two complete weeks; the late form, both ways) |
| 4. Incomplete, unconfirmed or conflicting activity | T4 (missed long run, partial run, missed strength; a week holding break days; unreported, asked, answer decides; conflicted, asked, corrected) |
| 5. A report that does not show tolerance or recovery | T5 (recovery adverse; next-day function impaired) |
| 6. Two declarations of the same episode, corrections | T6 (named correction with new dates; replay) |
| 7. Clinical return and precedence | T7 (clinical earlier break with training or unknown between; clinical flag) |
| 8. Factual persistence and event separation | T8 |
| 9. Determinism | T9 (same review twice; either declaration order) |

**On R7D-FREEZE-3** the F01 tests fail. The characterization tests T2, T7 and T8 pass on both runtimes. T3 fails there only on the new `reentryWeek` field and reason text: its doses are identical.

## Existing assertions updated (please judge)

`r7d-phase32.test.mjs`, both in T4, each marked "R7-D Phase 3.3":
1. **"recorded training between them leaves the latest break alone":** the two sessions between the breaks (Mon strength, Tue run) now re-enter nothing. The stop is MODERATE 21 (`TRAINING_NOT_REESTABLISHED`) instead of SHORT 4 (`TRAINING_AFTER`). The title is extended.
2. **"the answer decides, never zero and never credit":** answered done, the class is now MODERATE either way, because no whole week fits in the 3-day gap. The answer decides the record label. The question is still asked. The title is extended.

Each as it stood at R7D-FREEZE-3 fails on the candidate, and each as updated fails on R7D-FREEZE-3 (evidence `red`).

## Instruments (registered before any holdout exists)

| Instrument | What changed |
|---|---|
| `../../harness/` R7D-HARNESS-5 | **P18(a):** `TRAINING_AFTER` is accounted for only with a whole executed week of the plan between the break and the stop (`executedWeekBetween`, a necessary condition of the runtime's stricter rule). Development cases DEV-27 to DEV-31. Witness W-P18c. Default record R7D-FREEZE-4 |
| `../../PREREGISTRATION_R7D_5.md` | Δ1–Δ6 (Portuguese): P18(a); the public rule; coverage item; sensitivity; consumer conditions; residuals of the rule |
| `../../author/INTERFACE_DELTA_R7D_5.md` | The public rule, the record (`TRAINING_NOT_REESTABLISHED`, `reentryWeek`), what a client does |
| `../../author/AUTHOR_BRIEF_FINAL_R7D_4.md` | Freeze 4, interface 5, coverage item 11 (isolated training between breaks; a whole executed week) |

## Evidence (on these runtime bytes; `../evidence/EVIDENCE_PHASE33.json`)

- **Tests:** suite 952/952 (938 + 14); directed tests Phase 3.3 14/14, Phase 3.2 17/17 and Phase 3.1 14/14; conformance R7-B, R7-B.1 and R7-B.2 PASS.
- **Mutation** (`../evidence/MUTATION_PHASE33.json`): 8/8 killed, each by its own witness. The mutants:
  - any recorded session re-enters (F01 itself);
  - a reviewed week counts whatever its gates;
  - one sport complete is enough;
  - gates ignored;
  - "every session reported done" is enough (adverse responses re-enter);
  - a week holding break days counts;
  - the record says nothing was trained;
  - unknown sessions are read through when training is recorded.
- **Harness validation 5** (`../../harness/validation/HARNESS_VALIDATION_R7D_5.json`):
  - no false block;
  - 14/14 sensitivity rows, the new one being F01 on R7D-FREEZE-3 by P18 (DEV-27/28/29/31), clean on the candidate; DEV-30 is no false block on either runtime;
  - coverage P18 24 units;
  - 43/43 witnesses.
- **Regressions** (`../regression/`), regression only: the diagnostic corpus shows P01–P18 with 0 violations, and VARIANT only on the 4 triaged cases; the generated sample shows 0 violations.
- **Differential against R7D-FREEZE-3** (`../evidence/DIFFERENTIAL_VS_R7D_FREEZE_3.json`): 151 cases, 147 identical. The 4 that differ are DEV-27, -28, -29 and -31, each at its F01 return, with 0 unexplained. The re-entry control DEV-30, every Phase 3.2 case (DEV-22 to DEV-26), the whole diagnostic corpus and the generated sample are identical.

## Questions

**SSCTR (narrow). Judge only:**
1. **F01 closure.** Does an isolated execution (any sport; completed, partial or aborted) between two separate breaks still erase the earlier break on any path? Is reading the whole stop (the continuous span) the right conservative reading of the evidence here?
2. **Direction B fidelity and authority.** Is "a whole week of the plan, lying wholly between the breaks, executed completely (every gate ADVANCE or EARNED)" an appropriate reading of "a resumption effectively supported by evidence"? The test is the coach's existing evidence standard. Does it introduce any new physiological threshold, count, length, clinical criterion or dose? If it does, say so: that is a blocker, not a condition.
3. **The inverse defect.** Is a proven resumption recognized (T3, E1–E3)? Judge each disclosed residual: plan-week alignment; every sport (a missed strength session blocks re-entry for both sports); a long gap of imperfect adherence read as one stop; a reviewed week alone not enough. Is each an acceptable conservative residual, a condition, or a blocker?
4. **Incomplete, unconfirmed, conflicting or adverse activity** (T4, T5).
5. **Clinical first and F08 unchanged** (T7).
6. **I9, identities and causal relations** (T6, T9). Reading the stop through isolated training is factual continuity, as Phase 3.2's NO_TRAINING_BETWEEN is: never a merge, and no duration added.
7. **Unknown training between** is still asked even where no whole week fits (O-01 extended). Acceptable?
8. **The two updated assertions**, from the domain side.
9. **The queue item.** `HQ-R7D-SSCTR-P32-RECHECK` (your predecessor's proposal) will be appended naming R7D-FREEZE-3, the freeze its record judged, with its content unchanged. Any domain objection?

**Quality/reliability (narrow). Judge only:**
- correctness of `reestablishedBetween`:
  - reuse of the reducer through `stateAtBreak(...).history`, and the additive `complete` field;
  - edge cases: a return in force before the earlier break, late reports, SKIPPED sessions, weeks without one sport, run-only or strength-only plans, `startedAt`;
- the `separateStop` loop: `reentry` per iteration, labels, the record, `reentryWeek`, the unchanged unknown-between question;
- behaviour outside F01: does the differential show containment, and can anything else change?
- append-only provenance, determinism and event separation;
- the harness revision:
  - is P18(a) a sound necessary condition?
  - could it block a correct holdout?
  - is it sensitive on R7D-FREEZE-3? Is W-P18c adequate?
- test, property and mutation adequacy;
- the two updated assertions;
- freeze readiness: `CoachingCore/scripts/freeze-r7d-4.mjs`, `verify-r7d-4.mjs` and `../integrate-queue-r7d-p32.mjs`, none run yet;
- that no script of this phase deletes anything.

## Independence and outputs

- Neither of you wrote the runtime, the tests, the harness, PREREG-5 or the evidence. Do not open the other review's folder.
- Write only in your own folder:
  - SSCTR: `ssctr/SSCTR_PHASE33_RECHECK_R7D.{json,md}` and `ssctr/probes/` (outputs in `ssctr/probes/out/`);
  - quality/reliability: `engineering/QUALITY_CHECK_R7D_PHASE33.{json,md}` and `engineering/probes/` (outputs in `engineering/probes/out/`).
- **Scratch work:** run probes only on copies outside the repository, each in a new, uniquely named directory you create under the session scratchpad. **Never delete anything** (no `rm -rf`, no recursive removal): when you need a fresh copy, make a new directory.
  - Rebuilt runtimes you may copy are in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/d1b308dc-243b-4985-8d22-78ba1cb403ed/scratchpad/p33-runtimes-20261106-223928-369/` (`rt-d3` is R7D-FREEZE-3, `rt-d2` is R7D-FREEZE-2).
  - Never write into that directory.
- The JSON is the structured record. It must carry:
  - `recordId`;
  - `disposition` (SSCTR: ACCEPT, ACCEPT_WITH_CONDITIONS or BLOCK) or `verdict` (quality/reliability: READY, READY_WITH_CONDITIONS or NOT_READY);
  - `findings`;
  - `conditionsForFreeze`.
- If you propose a human-revalidation item, put it under `proposedHumanRevalidation.item`, in the queue's item shape, without appending it. This phase authorizes only the one append named above.
