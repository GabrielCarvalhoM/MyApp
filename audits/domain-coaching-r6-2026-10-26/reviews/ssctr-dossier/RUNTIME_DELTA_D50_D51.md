# Runtime-only answers to SSCTR round 9: D50 and D51

**For:** the SSCTR, a narrow runtime delta check at the same policy hash (round 10).
**Author:** the runtime author (Claude Code continuation root, third session). This is author material, not evidence of quality.
**Date:** 2026-10-26.

## Why there is another check

Round 9 reviewed R6-POLICY-5 at hash `18ec48f3…` (`../ssctr-review.md`, `../ssctr-policy-review.json`, revision R6-SSCTR-POLICY-r9). It resolved D47, D48 and D49, accepted the unreduced reading of the D49 ceiling, and re-issued all ten records as APPROVE_WITH_CONDITIONS. But it said **freeze NO**, blocked by two runtime-only defects: D50 (PLANNED-PROGRESSION, RUN-QUALITY) and D51 (ROTATION, NONCLINICAL-RETURN).

Your next step asked for both fixes without a policy change, then a narrow runtime check at `18ec48f3…`: probes A, P, S, T, U, V, X and Y and the suite re-run, and the records re-issued with a new freeze verdict.

## What did not change

- **The policy.** Canonical hash `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, file sha256 `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`, both as you reviewed them.
- **Every other runtime file.** Of the 39 files in your round-9 `reviewedFiles`, only `CoachingCore/src/r6-program.mjs` differs.
- **The reviewed round-9 runtime is preserved** in `reviewed-18ec48f3-r9-source/`. I did not copy it before editing, so `r6-program.mjs` there was rebuilt by undoing the D50 and D51 edits on a copy. Its sha256, `f5cba5f3…`, matches your `reviewedFiles` record exactly, and the other 17 recorded files match too (`MANIFEST.json`). Diff the current `r6-program.mjs` against it.

## D50: a long-run step that the share cap holds is no increase

**Runtime** (`r6-program.mjs`):
1. `distributeRun` marks the long run the share cap held: `progression.heldBy: 'LONG_RUN_SHARE'`. The prescription is unchanged.
2. `plannedOf` carries the mark into the week's planned state as `longHeldByShare`. Reviews read it from `stateTrace[w].run.planned`, as the projection does.
3. `advanceRun` (EASY mode, development weeks): when the share cap held this week's long run, the planned long-run step for next week is not counted as the week's single-session increase. The easy step and the quality step then follow their own gates and cadence. If either one steps, the long-run target stays where it was prescribed, so the long run cannot also grow next week when the larger easy run releases the cap. If neither steps, the long-run target steps as before.
4. The one-increase rule under a 50-minute reference is unchanged. A long-run step that is not held still blocks the easy and quality steps.
5. The easy guard is unchanged: a stepped easy session never exceeds the long-run target minus 5 minutes, using the stepped target as in any step week. In a held week that means the stepped easy session can equal the long run prescribed that week, never exceed it (question 1).

**Your probe S, re-run unchanged** (`r9-author-reruns/`, author material):

| Measure | Round 9 | Now |
|---|---|---|
| Programs with 4 or more consecutive flat build weeks | 47 of 66 | 0 |
| Programs with 6 or more | 42 | 0 |
| Programs whose internal easy minutes never change | 35 | 9 |
| Executed 45/25 simulation: longest flat run | 6 weeks | 2 weeks |
| Quality runner 90/40: quality step, first to last | 0 → 0 | 0 → 7 |
| 10K 60/35 | E15/L20 all program | E15/L20 → E20/L40 |

- **The 9 remaining "never change" programs are not stalls.** All are four-run-day athletes (three easy runs). Their easy sessions step one at a time (15 → 20, 25 → 30), and the internal easy minutes change only after all three have stepped, which does not happen within 16 weeks while the long run takes the steps. Their longest flat run is 0–1 weeks. See `continuation/author-checks/author-check-easy-never.mjs`.
- **The one-increase rule still holds.** `continuation/author-checks/author-check-one-increase.mjs` covers 70 programs (the probe-S grid, three 10K runners, three quality runners and two executed simulations). Across 554 consecutive build-week pairs, no week raises the long run under 50 minutes together with an easy run or the quality step. 158 weeks had a held long run; in 97 of them the easy or quality step followed.

**Tests:** `CoachingCore/test/r6-ssctr-r9-fixes.test.mjs`, four D50 tests covering the profiles you named:
- 45/25 and 60/35 with three run days;
- the quality runner;
- the all-walk athlete, in projection and executed;
- an executed 45/25.

Each test asserts fewer than 4 flat build weeks in a row, growth, and no two increases in a week under 50 minutes.

## D51: a return ends with the exercises in use

**Runtime** (`r6-program.mjs` `advanceStrength`):
- When the last exercise in use completes its return steps, the return ends: no exercise prescribed that week still carries a return step. The remaining return markers (`returnStep`, `returnInBlock`, `setCeiling`, `returnLogged`) are then cleared from every exercise not used during the return.
- "In use" means prescribed in the week, not executed. A missed in-use session keeps its exercise at its step, so it keeps the return open. A week with no strength exposure never ends a return.
- After that:
  - `strengthRowsFor` no longer sees a return, so rotation resumes on its calendar cadence (`sk.rotation` counts turns by calendar week, still deferred in establishment and event phases);
  - a rotated-back exercise not done for more than 28 days re-establishes by effort, through the existing branch;
  - a later new exercise starts with normal establishment, not the return-entry dose.

**Your probe Y, re-run unchanged:** for both EVERY_2_WEEKS and COACH_DECIDES, exercises carry return steps only in weeks 8–10, and the accessories rotate again from week 11.

**Tests:** two D51 tests, one per cadence, on a 16-week plan with a 14-day return in week 8. Each asserts that:
- the return ends within three weeks of the entry;
- every exercise after it is the rotation's choice for its slot that week, from the runtime's own rotation function (fitting may drop an accessory);
- some week uses a rotated accessory;
- nothing later carries the return-entry dose.

### A pre-existing condition that D50 makes more frequent

A consolidation week shortens the long run by two steps (`run.consolidationLongRunReductionSteps`), and nothing stops it falling below that week's easy run. Your R10 floor (`event.longRunFloor`) covers only taper weeks and the start of the next block.

`continuation/author-checks/author-check-consolidation-long.mjs` checks the probe-S grid plus five 10K and quality runners: 70 programs and 207 consolidation weeks with a long run. The check takes the runtime as an argument, so it ran on the reconstructed round-9 runtime too.
- **Round-9 runtime:** in 4 of those weeks the long run is shorter than an easy run, always L50 against E55.
- **Now:** 18 weeks: the same 4, plus 14 at L15 against E20, where the easy runs now grow.
- Every case is 5 minutes, in a deload week, so total running still falls.

Extending the floor to consolidation weeks needs policy text, so a new hash and a full delta review. I have not made that change in this runtime-only delta (question 4).

## Not adopted in this delta, and kept as open gaps

- **R14** (after a late restart, state the executed restart runs instead of "no continuous run yet"). The cause is that sessions dated inside the declared pause count as missed in the re-entry week, so its gate holds. That is G03, the adherence semantics you routed to Product/Data. Fixing it in the transition would change how missed sessions gate, which is outside a runtime-only delta. Race day is still a completion in that case.
- **R15** (treat "cut back", "cut down" and the face and eye idioms as phrases): before any use beyond the offline reference, with the screen re-review.

## Questions for the SSCTR

1. **D50, a held week.** When the share cap holds the long run and the easy run steps, the long run waits. That week the stepped easy session can equal the long run, never exceed it. For example, 60/35: weeks 2–3 go from E15/E15/L20 to E20/E15/L20, then L25 the week after. Acceptable?
2. **D51, in use.** "In use" means prescribed in the week, so a missed session never ends a return for its exercise. Exercises not used during the return lose their markers only when those in use finish. Confirm.
3. **R14.** Is R14 acceptable as an open gap tied to G03?
4. **The consolidation long run.** In a consolidation week the long run can fall 5 minutes below an easy run: 4 of 207 weeks before D50, 18 after. Do you require the R10 floor in consolidation weeks before freeze, which means a policy change and a full review? Or is it a non-blocking recommendation for a later revision?

## Evidence the author ran

All of it uses the dev authority bound to `18ec48f3…`. None of it is independent.
- **Tests.** `node --test`: **428/428**. `r6-ssctr-r9-fixes.test.mjs` adds 6 tests. No other test changed.
- **Mutation check.** `continuation/author-checks/mutation-check-r9.mjs` catches all 4 mutations (the held step, the held mark, the long run waiting, the end of the return). Sources were restored byte for byte.
- **Your round-9 probe, re-run unchanged** (`r9-author-reruns/`; only the import paths and the output name adjusted):
  - A, B, J, L, M, P, Q, R, U, W, X: 0 violations;
  - V: only R14;
  - S and Y as above;
  - P: 330 completions, each with the item.
- **Development outputs.**
  - The dev simulation passes all invariants on 14/14 trajectories.
  - Demonstrations A–M are unchanged.
  - The R5 dev replay runs 24 cases with 0 errors. It differs from the judged FREEZE-1 replay in the same 8 cases, only in the race-day warm-up line.

## Disclosure

Unchanged from `REVISION_R6_POLICY_5.md`. The fixes answer your round-9 defects only. The runtime author has never seen the holdout corpus, the first evaluation or any evaluation output.

## What is asked

1. The narrow runtime check at hash `18ec48f3…`, as your round-9 next step describes, with the records re-issued and a new freeze verdict.
2. Rulings on the four questions above.
