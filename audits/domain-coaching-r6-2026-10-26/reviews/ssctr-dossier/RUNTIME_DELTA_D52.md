# Runtime-only answer to SSCTR round 10: D52

**For:** the SSCTR, round 11: a narrow runtime delta check at the same policy hash.
**Author:** the runtime author (Claude Code continuation root, fourth session). This is author material, not evidence of quality.
**Date:** 2026-10-26.

## Why there is another check

Round 10 was the narrow runtime check of D50 and D51 at R6-POLICY-5, hash `18ec48f3…` (`../ssctr-review.md`, `../ssctr-policy-review.json`, revision R6-SSCTR-POLICY-r10).
- It resolved D50 and D51.
- It re-issued all ten records as APPROVE_WITH_CONDITIONS.
- It said **freeze NO**, blocked by **D52**: the strength state followed prescriptions instead of executions. D52 sits in LOAD-ESTABLISHMENT and is shared with SUBSTITUTION, ROTATION and NONCLINICAL-RETURN.

Your next step asked for three things:
1. Fix (A) and (B) in the runtime, without a policy change.
2. Add probe Z as regression tests.
3. Request a narrow runtime check at `18ec48f3…`: probes S2, Y2 and Z, the round-10 sections A–Y and the suite re-run, and the records re-issued with a new freeze verdict.

## What did not change

- **The policy.**
  - Canonical hash `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`.
  - File sha256 `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`.
- **Every other file you recorded.** Of the 44 files in your round-10 `reviewedFiles`, three differ:

| File | Round 10 | Now | Why |
|---|---|---|---|
| `CoachingCore/src/r6-program.mjs` | `4227f501…` | `8fdadf2f…` | D52 (A) and (B) |
| `CoachingCore/src/r6-adaptation.mjs` | `c93f7047…` | `d6a1d6fc…` | D52 evidence; author-found conflict filter |
| `CoachingCore/test/r6-ssctr-revision.test.mjs` | `d69763d4…` | `e6099f1e…` | The D30 test now sets the renamed clock field (below) |

  One file is new: `CoachingCore/test/r6-ssctr-r10-fixes.test.mjs` (`1bbc5f7c…`).
- **The reviewed round-10 runtime is preserved** in `reviewed-18ec48f3-r10-source/`. It was copied before any D52 edit, and its 19 files you listed match your record (`MANIFEST.json`). The unified diff against it is `RUNTIME_DELTA_D52.diff`: 84 changed lines in 11 hunks.

## D52 (A): a prescription that was not executed establishes nothing

**The evidence a review reads.** `r6-adaptation.mjs` has a new function, `performedInWeek`. It gives the local date each exercise was last performed in the reviewed week:
- A completed or partial execution report of a session that prescribed the exercise, listing it with at least one set, counts.
- A completed report without exercise details counts for every exercise of its session (question 2).
- A missed, not reported, pending or conflicted session performs nothing. So does a session dated inside a declared pause, since it has no report.

The weekly review and the next-week rebuild pass this to `advanceStrength`.

**`advanceStrength`** (`r6-program.mjs`):
1. **A new exercise gets its state only when it is performed.** At a review, a loaded one also needs a logged load that is adopted or waits for confirmation (D45). A bodyweight one needs only the performance. In a conditional projection every planned exposure still counts as performed and logged, as before.
2. **The re-establishment conversion needs a performed exposure** (QRE-R6-17: KNOWN to FROM_LOG with the earlier load as a ceiling, and the sets regained one per executed week). A missed re-establishment leaves the known state and its clock unchanged, so the next exposure re-establishes again.
3. **`unlogged`.** A from-log state whose exposure was performed without a usable logged load is marked. That covers no load, an unknown unit, an implausible value, and a re-establishment that logged nothing. A later logged performance clears the mark, and so does a projection.

**`strengthDose`:**
- An `unlogged` state gets the effort-guided establishment row: at most the establishment set count at RIR ≥ 3, the ramp-up, no load and no progression rule. It carries the earlier ceiling when there is one: "No usable load was logged last time: establish the load by effort again; do not exceed X kg".
- A never-performed exercise has no state, so it takes the existing establishment branch.

**`buildWeek`, the same week.** A later session of a week no longer treats an exercise first set up earlier that week as established. The runtime used to create a within-week from-log state for it; it no longer does, so its later exposures that week are the establishment row too. The return-entry week keeps the author-found behaviour of R6-POLICY-4: such an exercise keeps the entry dose for the rest of the week. This extends (A) to the same week. The reason:
- Before, a missed Monday left Thursday's row as FROM_LOG "Use the load you logged last time for this exercise", with the full set count and a progression rule.
- Even with Monday performed, Thursday's row pointed at Monday's log while it still waited for confirmation, which is against D48.
- `continuation/author-checks/author-check-same-week.mjs` covers 1,512 generated programs. It finds 3,504 such exercise-weeks on your round-10 runtime, and 0 now. They fall in week 0 of full-body templates and in the week a rotated exercise first appears.
- Two establishment logs of the same week that agree within one increment now confirm each other. D45 already allows "a second log … earlier in the same week".

**Author-found, adjacent (QRE-R6-14).**
- *The defect.* `loggedLoads` read the logs of conflicted rows. In an author experiment, a conflicted Monday report, one event id reused with different loads, served as the agreeing earlier log that confirmed Thursday's establishment as KNOWN 20 kg.
- *The fix.* `loggedLoads` now skips conflicted rows, consistent with the gates (HOLD) and with `performedInWeek`. A conflicted report neither sets nor confirms a load until it is corrected.
- *How it was found.* While testing D52.

**Your probe Z, re-run unchanged** (`r10-author-reruns/`): **0 violations** (round 10: 9).
- **Z1.** The next exposure is the establishment row under every cadence:
  - EVERY_2_WEEKS and COACH_DECIDES: db-step-up, 1×10 at RIR 3, in a consolidation week;
  - FIXED: the goblet squat, 2×8 at RIR 3, with the ramp-up and no "Add 2 reps".
- **Z2.** The back squat is KNOWN 82.5 in weeks 4–7 (7–28 days) and re-established by effort in weeks 8 and 9 (35 and 42 days, "do not exceed 82.5 kg").
- **Z3.** db-step-up is established by effort after the pause-dated session, and re-established at 35 days.
- **Z4.** The substitute gets the establishment row again in week 5, then a pending row in week 6.

## D52 (B): the resume clock counts calendar days from the last executed exposure

- **The field.** `lastWeek`, the week index stamped at prescription, is gone. It is replaced by `lastPerformed`, the local date of the last executed exposure, which comes from:
  - `performedInWeek` at reviews (the completed-work ledger);
  - the planned session date in a projection;
  - for an intake known dose, its `observedAt` (question 3).
- **The check.** The `strength.resumeAfterDays` branch of `strengthDose` is now `dayGap(lastPerformed, session date) > return.moderateMaxDays`. It counts calendar days to the date of the session being built, which `buildWeek` and `strengthRowsFor` now pass. As before, it does not apply during a return step or to bodyweight exercises (R17 is unchanged).
- **What follows:**
  - a missed or skipped session never moves the clock;
  - rotation away, a substitution window and a return all count from the last performance;
  - each session is judged on its own date, so the plan never counts unexecuted work, even in the same week (question 4).
- **Your probes read the old field.** Probes Y2 and Z read `stateTrace[w].strength.exercises[id].lastWeek` for `runtimeGapBasisDays`. That field no longer exists, so their clock comparison reads null and `clockMismatch` shows 0 for that reason alone. Read `lastPerformed`, a `YYYY-MM-DD` date, instead.
- **The author's direct check of the clock.** `continuation/author-checks/author-check-resume-clock.mjs` covers 160 scripted timelines:
  - the four cadences;
  - skipped strength weeks and missed single sessions;
  - completion reports without loads;
  - nonclinical pauses;
  - three-day full-body weeks.

  After each of 2,222 reviews it checks that:
  - every state's `lastPerformed` equals the date the script last performed that exercise, or the observed date of a known dose never performed: 19,484 states, 0 mismatches;
  - no never-performed exercise has a state;
  - every from-log row the review issues is a pending, effort-guided row: 786 of 786;
  - every stateless loaded exercise is prescribed the establishment row.

  The run found 0 violations, 528 re-establishment rows and 6 rows of the "no usable load" kind.

## Questions for the SSCTR

1. **Later sessions of the same week repeat the establishment.** Until a review sees the exercise performed with a logged load, each of its exposures that week is the establishment row: at most 2 sets at RIR ≥ 3. This lowers week-0 planned sets for full-body templates. Examples: demonstration B, 33 → 30 sets in week 1; trajectory T03, 24 → 22. It also lowers the week a rotated exercise first appears. Acceptable?
2. **A completed report without exercise details.** It counts as performed for the clock, for every exercise of the session, but it establishes no load:
   - a new loaded exercise gets the establishment row again;
   - a known lift keeps its known load;
   - a from-log state becomes `unlogged`.
   A partial report counts only the exercises it lists. Confirm.
3. **The clock of an intake known dose starts at its `observedAt`.** That is the only execution date the runtime has for it, so a known dose skipped from week 0 re-establishes once more than 28 days have passed. The intake accepts known doses observed up to 28 days before `asOf`. A dose observed near that limit can therefore re-establish at its first program exposure, if that comes more than 28 days after it was observed. Confirm.
4. **The clock is per session.** Each session is judged on its own date, and the plan never counts an unexecuted session of the same week. So an exercise last performed early in a week can be planned at its known load on the first day of a week four weeks on, at 28 days, and re-established later that week, at 30 days and beyond.
   - This appears in no natural timeline of the check. A deliberate scenario produces it in 6 exercise-weeks: in week 1 only Monday's strength is done, then three weeks have none. The scenario is part of `author-check-resume-clock.mjs`.
   - At the review the performed re-establishment converts the state, and its log is adopted under the ceiling. The result is conservative: the dose is never above what is allowed.
   - Acceptable as it is? The alternative is a runtime-only rule that re-establishes every exposure of that week once any of them would pass 28 days.

## Disclosed without a question

- **A never-performed exercise prescribed during a return.** One example is an exercise whose every earlier exposure was missed.
  - While any exercise in the return is still at the entry step, it gets the return-entry dose, and once performed it joins the return at the entry step. The deliberate case in `author-check-resume-clock.mjs` has 16 such rows, all at the return-entry dose: 1×8 at RIR ≥ 4.
  - If every exercise in use has passed the entry step, it gets the normal establishment row (at most 2 sets at RIR ≥ 3) and normal progression afterwards. No timeline of the check produced that.
  - Before D52 its state existed from its first prescription.
- **Reviews are weekly.** This is unchanged. A week whose review is skipped keeps the projection's assumption that it was executed and logged. Sessions performed in the pause week before the pause starts are not applied at the return. That only makes the clock longer, which is conservative.
- **Bodyweight (R17).** Unchanged: a bodyweight exercise keeps its dose after more than 28 days. A missed first bodyweight exposure now establishes nothing either, so its next exposure is again its first-exposure dose (at most 2 sets).

## Not adopted, still open

R5, R8, R9, R14, R15, R16 and R17, and the rest of R11, all as in your round-10 review. None of them is touched by this delta.

## Your observation about `document-r6.mjs`, and later script changes

- **The 20:42 change.** You noted that `CoachingCore/scripts/document-r6.mjs` changed at 20:42, outside the files you reviewed. The runtime author made that change: `buildR5Regression` now reads the optional independent R5 re-review (`reviews/r5-regression-rereview.json`) when it exists. It was written together with the R5 RECLASSIFICATION brief, about a minute after the round-10 dispatch. It is a documentation generator, not runtime.
- **Since then, and still outside the runtime:**
  - `document-r6.mjs`: the STRENGTH topic lists `performedInWeek` among its runtime functions;
  - `freeze-r6-2.mjs`: the round-10 tests in `fixScopePinnedBy`, this dossier in `ssctrRounds.dossiers`, and the disclosure extended to rounds 7–10 and D42–D52, with three author-found changes;
  - `finalize-r6.mjs`: index entries for this dossier, the round-10 tests and the R5 re-review.
- **None of them has been run** since the change.
- **The development outputs were regenerated** with the dev authority (see below).

## Evidence the author ran

All of it uses the dev authority bound to `18ec48f3…`. None of it is independent.

- **Tests.** `node --test`: **438/438**.
  - `r6-ssctr-r10-fixes.test.mjs` adds 10 tests, covering:
    - Z1 under the three cadences;
    - the same week;
    - bodyweight;
    - the conflicted report;
    - a completion report without loads;
    - Z2;
    - a missed and an unlogged re-establishment;
    - the known-dose clock;
    - Z3 (four timelines);
    - Z4.
  - The D30 test of `r6-ssctr-revision.test.mjs` now sets `lastPerformed` to six weeks earlier instead of `lastWeek`. No other test changed.
- **Mutation check.** `continuation/author-checks/mutation-check-r10.mjs` removes each part of the fix in turn and catches **11 of 11** mutations. Sources were restored byte for byte, with sha256 checked before and after.
- **Your round-10 probe, re-run unchanged** (`r10-author-reruns/README.md`). **24 of 27 sections are byte-identical** to your own round-10 output:
  - A–D, G, I–X, S and S2;
  - the round-9 comparison sections S2b and Y2b.

  Y, Y2 and Z differ:
  - **Z:** 0 violations.
  - **Y2:** 0 violations, with the return lengths ({3: 39, 4: 3}) and the rotation results unchanged. Never-performed bodyweight accessories first prescribed inside the pause now start at their first-exposure dose (2×10 instead of 2×12) and carry no return marker.
  - **Y:** the same marker change.
  - **V:** only R14.
- **Author checks:**
  - `author-check-resume-clock.mjs`, as above;
  - `author-check-same-week.mjs`, 3,504 → 0.
- **Development outputs:**
  - **Simulation.** The dev simulation passes all invariants on 14 of 14 trajectories. The initial-program hashes differ because the state now carries `lastPerformed`. Two trajectories plan fewer week-0 strength sets (24 → 22, 39 → 38), from the same-week rule.
  - **Demonstrations A–M.** All 13 keep the same selections. Their week-1 rows, scripted responses and one future effect follow the same-week rule:
    - B: 33 → 30 sets;
    - C: 24 → 22;
    - D: 22 → 20;
    - H: db-step-up becomes an establishment row in the week it first appears.
  - **The R5 dev replay** (24 cases, 0 errors) is semantically identical to the round-10 dev replay. It still differs from the judged FREEZE-1 replay in the same 8 cases, only in the race-day warm-up line.

## Disclosure

- **Unchanged from `REVISION_R6_POLICY_5.md`.** The fixes answer your round-10 defect.
- **One author-found change** is added: the conflict filter.
- **What the runtime author has not seen:** the holdout corpus, the first evaluation and any evaluation output. The author has seen only the holdout author's one-line case summaries in its hand-back, as before.

## What is asked

1. The narrow runtime check at hash `18ec48f3…`, as your round-10 next step describes, with the records re-issued and a new freeze verdict.
2. Rulings on the four questions above.
