# R6-POLICY-5: answers to SSCTR round 8

**For:** the SSCTR, delta binding review (round 9).
**Author:** the runtime author (Claude Code continuation root, third session). This is author material, not evidence of quality.
**Date:** 2026-10-26.

## Why there is another delta

Round 8 reviewed R6-POLICY-4 at hash `1046ad0e…` and said **freeze NO** (`../ssctr-review.r8.md`, `../ssctr-policy-review.r8.json`):
- REVISE: NONCLINICAL-RETURN (D49) and EVENT-TRANSITION (D47);
- APPROVE_WITH_CONDITIONS: the other eight boundaries, with D48 binding for LOAD-ESTABLISHMENT and D49 for PLANNED-PROGRESSION;
- non-blocking recommendations R11, R12 and R13 (you recommended fixing them in the same revision); R5 and R8 open.

Two things are preserved for the diff:
- **The reviewed R6-POLICY-4 bytes:** `PROGRAM_POLICY_R6.reviewed-1046ad0e.json` (hash `1046ad0e…`, file sha256 `2ab7ea45…`).
- **The reviewed runtime and tests:** `reviewed-1046ad0e-source/`, a byte-identical copy of `CoachingCore/src/r6-*.mjs` and `CoachingCore/test/r6-*.test.mjs` taken before any round-8 change. Its `MANIFEST.json` lists the sha256 of each file. Diff it against the current files.

## The policy now under review

- **R6-POLICY-5**: canonical hash (value.mjs `hash`) `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, file sha256 `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`.
- **No envelope magnitude is widened, and no numeric value changed or was added.** The only non-text addition is one list, `event.raceDayCompletion.historyModes: ["WALK_JOG", "RESTART"]`.
- **The structured diff against the reviewed bytes:**
  - **Changed text:** `revision`, `revisionNote`, `event.raceDayCompletion.semantics`, `return.reasonScreen`, `learning.missingGate`, `strength.setIncreaseAtBlockBoundary`, `strength.loggedLoadAdoption.semantics` (one D48 clause; you said D48 needs no policy change, so it only keeps the declaration in line with the runtime).
  - **Added:** `event.raceDayCompletion.historyModes`, `return.strengthReturnSets`, `return.returnLoadCap`, `return.restartRunHistory`.

## What changed, item by item

Tests named below are in `CoachingCore/test/r6-ssctr-r8-fixes.test.mjs` unless stated.

| Item | Boundaries | Policy key | Runtime | Tests |
|---|---|---|---|---|
| D47 (a)–(d) | EVENT-TRANSITION | `event.raceDayCompletion` (`historyModes`, semantics) | See "D47 in detail" below. | "SSCTR D47" (the four probe-C cases), "SSCTR D47(c)", "SSCTR D47(a)" (×2) |
| D48 | LOAD-ESTABLISHMENT | none required (one clause in `strength.loggedLoadAdoption.semantics`) | `strengthDose` marks a pending row (`pending: true`) in the normal FROM_LOG branch and in the return step-2 branch. `strengthRowsFor` passes it to `exerciseRow`. A pending row reads: the ramp-up line used at establishment, the pending rule, "Record the load and its convention". It never says "Use the load you logged last time". | "SSCTR D48"; the D45 test in `r6-ssctr-r7-fixes.test.mjs` carries the assertion you asked for |
| D49 (a)–(d) | NONCLINICAL-RETURN, PLANNED-PROGRESSION | `return.strengthReturnSets`, `return.returnLoadCap`, `strength.setIncreaseAtBlockBoundary` | See "D49 in detail" below. | "SSCTR D49" (the three probe-U timelines s1-d35, s3-d21, s5-d14; the ceiling and step 2; a five-set dose; a return step close to a race) |
| Author-found | NONCLINICAL-RETURN, EVENT-TRANSITION | `return.restartRunHistory` | See "The restart run history" below. | "SSCTR D47(a): a restart applied by a review …" |
| R11 | NONCLINICAL-RETURN, COLD-START | `return.reasonScreen` (round-8 sentence) | `r6-clinical.mjs`: new clinical words and phrases, ambiguous words, damage verbs and body parts; `joinCompounds` joins C-section and recém-nascido before the clause split. | "SSCTR R11"; the D-series battery, QRE-07 and "SSCTR R7" stay green |
| R12 | PLANNED-PROGRESSION | `learning.missingGate` | `advanceRun` (EASY): with no easy run planned and a long run planned, the long-run gate drives the development-week count and the walk conversion (`easyGate`). The first converted walk sets the easy run to `run.minimumSessionMinutes`, so it can then progress. | "SSCTR R12" |
| R13 | PLANNED-PROGRESSION, NONCLINICAL-RETURN | `learning.missingGate` | `projectionGates(week, mode)`: in RESTART or RETURN, any planned LONG, EASY or QUALITY session sets the EASY gate, as `weeklyGates` does. | "SSCTR R13" |

**Not adopted, and kept as open gaps:**
- R5 (confirm a load logged far below the plan): Data owns the threshold.
- R8 (collect the keep-or-change event choice before the race window): the negotiation offers the choice but does not block.
- R11, second half: asking pregnancy and postpartum status again at reviews and returns belongs to the structured intake design (Product/Data). It goes to OPEN_GAPS with the screen re-review you require before production, a KMP port or real athletes.
- R1 and R2 are unchanged.

### D47 in detail

1. **History in the run state.** `projectWeeks` calls `withModeHistory` before building each week. Any mode listed in `historyModes` (WALK_JOG, RESTART) is added once to `run.modeHistory`, and the list then travels with every later state: through mode changes, weekly reviews, reprojections and `returnAfterPause`. That covers the starting class and a restart applied by a review.
2. **The completion rule.** `raceDayCompletionBasis(sk, raceWeekState)` returns one of four bases, or null when race day is raced by effort:
   - `MODE_IN_RACE_WEEK`: the mode in race week is WALK_JOG or RESTART;
   - `RETURN_IN_RACE_WEEK`: the mode in race week is RETURN;
   - `PROGRAM_HISTORY`: WALK_JOG or RESTART appeared in an earlier week of this program;
   - `HALF_MARATHON_LONG_RUN`: a half marathon with an achieved long run below 75 minutes.

   No other exemption exists. `raceDayCompletion` and `buildWeek` (race day) use it unchanged.
3. **The stated run.** `run.longestContinuous` is updated by `advanceRun` for executed weeks in every mode:
   - EASY: the executed long and easy runs;
   - RESTART and RETURN: the executed runs, behind the EASY gate;
   - WALK_JOG: a ladder step without walk breaks, through `plannedOf(week).continuousJog`.

   The item states "a longest continuous run of N minutes". It never states 0 when such a run was reached; with none, it says "no continuous run yet". In walk/jog it also states the ladder step. In a return in race week it states the current easy minutes instead.
4. **The item.** `eventCompletionItem` builds `EVENT_AMBITIOUS_FOR_CURRENT_RUNNING` with both options, `basis` and `longestContinuousRunMinutes`. The detail says why race day is a completion. For example, probe C's novice 10K in 12 weeks reads: "By race week the plan reaches a longest continuous run of 20 minutes, built from walk/jog in this program, which does not show race-ready running for a 10K: race day is planned as a completion …".
5. **Reviews.** `finishProposal` recomputes the item from the race-week state of every proposal. The item is replaced in place, added, or removed when the completion basis disappears (for example, a goal change that removes the event). So a restart applied by a review, or a goal change that adds a race to a program built from walk/jog, carries the item.

### D49 in detail

The strength state of an exercise gains four fields:
- `lastExecutedSets`: the set count of the last executed exposure outside a return step and outside a phase reduction;
- `setCeiling`: the count the sets come back to;
- `setCap`: the current cap while they climb back;
- `returnInBlock`: marks a block that had a return-step exposure.

The week's planned counts (`sets`, `baseSets` before the phase reduction, `normalSets` without a cap) travel in `stateTrace[w].strength.planned`, so a review sees them as the projection does. This mirrors `run.planned`.

1. **Return start.** `startStrengthReturn` runs at moderate and long returns. It sets `returnStep: 0`, `returnInBlock: true` and `setCeiling = lastExecutedSets`. Without an executed count it uses the known count; without either, nothing is set and the normal count is the target. It drops any earlier cap. It also clears `returnLogged`, so a new return needs a new entry log before the prior known load comes back.
2. **(a) Block credit.** A block-end exposure counts only when no exposure of that exercise in the block was a return step. The block in progress at the break earns nothing. Each later credited block raises `setCeiling` by one.
3. **(b) The counts.**
   - **Entry:** unchanged, 1 set at RIR ≥ 4.
   - **Step 2:** `returnStepSets(ceiling)` = max(1, min(ceiling − 1, entry + 1)) sets at RIR 3. That is one set above the entry and at least one below the ceiling, and it never comes from the base count.
   - **Phase reductions apply on top in the steps too.** This is new: in round 8 a step 2 in the race window was 2 sets at RIR 3, not the light race-window session.
   - **After the steps:** the cap starts at the step-2 count plus one when step 2 had no phase reduction, and at the step-2 count itself when it did. It rises one set per executed week without a phase reduction, up to the ceiling. It is removed once it no longer binds the normal count.
   - **Above the ceiling:** only through a credited block, which raises the ceiling by one; the cap still moves one set per week.
4. **(c) Declared** in `return.strengthReturnSets`, with the load cap as the runtime applies it in `return.returnLoadCap`. During the steps the cap is the load before the break until an entry log is adopted, then the adopted entry load.
5. **Probe-U timelines.** Back-squat sets per week from two weeks before the pause; `c` marks a consolidation week. The "round 8" column is your output; the last column is the same probe on R6-POLICY-5 (`policy5-author-reruns/`).

| Timeline | Last pre-break week (probe) | Round 8 | R6-POLICY-5 |
|---|---|---|---|
| s1-d35 | 3 | … c1 2 **4** | … c1 2 3 |
| s2-d21 | 3 | … 1 c2 **4** | … 1 c1 2 |
| s3-d14 | 3 | … 1 c2 **4** | … 1 c1 2 |
| s3-d21 | 3 | … c1 2 **4** | … c1 2 3 |
| s4-d14 | 2 (consolidation) | … c1 2 **4** | … c1 2 3 |
| s4-d21 | 2 (consolidation) | … 1 2 **4** | … 1 2 3 |
| s5-d14 | 4 | … 1 2 **4** | … 1 2 3 |
| s5-d21 | 4 | … 1 2 c3 | … 1 2 c2 |
| s6-d14 | 4 | … 1 2 c3 | … 1 2 c2 |

Of the other eight timelines, five are unchanged. In three (s4-d35, s6-d21, s7-d14), step 2 falls in a consolidation week and now takes the reduction (c2 becomes c1). With the probe's own checks, no week now rises by more than one set and none exceeds the pre-break count. The exception is the two s4 timelines; see question 1.

### The restart run history (author-found)

While checking D47 for a restart applied by a review, the author found that `returnAfterPause` kept the pre-break `achieved` peaks for a long-interruption restart. When such an athlete left RESTART for EASY before a race, the taper and race-week doses were scaled from the pre-break peaks, capped only by the single-run ceiling.

Example (`continuation/author-checks/author-check-restart-taper.mjs`): a 10K in week 14 after a 30-day break.
- After the restart the long run built 30 → 45 minutes and the easy runs reached 30.
- The taper week then held a 50-minute long run and 40-minute easy runs.
- The race week held 25-minute easy runs.

The fix: a long-interruption restart clears `achieved` (long, easy, quality, strides) and `longestContinuous`, as the intake RESTART class starts. The same case now tapers to L30 and E25, and runs E15 in race week. A moderate return keeps them, since it returns to the prior dose in two steps. Declared in `return.restartRunHistory`.

The author found this through an author check, not through the holdout.

## Questions for the SSCTR

1. **D49, the ceiling after a deload week.** The ceiling is the last executed count *outside a phase reduction*.
   - In s4-d14 and s4-d21 the last pre-break week was a consolidation week (2 sets). The athlete had executed 3 sets in each development week before it. The return comes back to 3 in development weeks and to 2 in consolidation weeks.
   - Your probe check compares with the literal 2 and flags "3 above the 2 prescribed in the last week before the break".
   - Using the literal reduced count would apply the consolidation reduction twice: once in the ceiling, then again on top in the next consolidation week. It would also make the ceiling depend on which week the break happened to start.
   - Is the unreduced reading acceptable, or do you require the literal count?
2. **D49, phase reductions in the steps.** Step 2 now takes the phase reduction on top: 1 set in a consolidation week, and the light race-window session (1 set, RIR ≥ 4, main lifts only) near a race. After a reduced step 2 the next week brings back the step-2 count, not one more. Confirm.
3. **D49, step 2 and large doses.** For a known five-set squat the sequence is now entry 1, step 2 = 2, then 3, 4 and 5. In round 8 it was 1, then 4, then 5. Confirm that "one set per executed week" also governs step 2.
4. **D49, an unexecuted bonus.** A block-boundary set earned at the end of the last pre-break block but never executed (s4) is not in the ceiling. It returns only through a block completed after the return with no return-step exposure. Confirm.
5. **D47, no exemption.** As required, history-based completion has no exemption. An athlete who leaves walk/jog early in a 16-week program and builds a 60-minute long run before a 10K still gets a completion race day. The negotiation states the run reached and why ("built from walk/jog in this program, which does not show race-ready running for a 10K"). Confirm, or name the exemption you would review.
6. **D47, proposals.** The item is recomputed in every proposal: replaced in place, added, or removed when the basis disappears. Confirm.
7. **The restart run history.** Confirm that a long-interruption restart clears the achieved peaks and the longest run. With them cleared, a race-week touch and race-day strides need quality and strides executed after the restart.
8. **R12.** With every easy day a walk, the executed long run gates the conversion. The first converted walk becomes a 15-minute easy run, which then progresses under the existing rules; the short-reference rule still holds easy steps while the long run steps below 50 minutes. Confirm.
9. **R11.** Do you accept these inside your owned gap?
   - **Clinical:** miscarriage and aborto, the C-section words, and the procedures (vasectomy, colonoscopy, endoscopy, LASIK, root canal).
   - **Clinical as damage plus body part:** burns and cuts with a body part.
   - **Ambiguous:** maternity, newborn, breastfeeding, assault, mugging, stings, bruises.
   - **Unchanged:** "Paternity leave" and "Funeral and grief" stay nonclinical.

## Evidence the author ran

All of it uses the dev authority bound to the new hash. None of it is independent.

- **Tests.** `node --test` in CoachingCore: **422/422**.
  - `r6-ssctr-r8-fixes.test.mjs` holds 14 new tests.
  - `r6-ssctr-r7-fixes.test.mjs` gained one assertion in its D45 test (D48).
  - No other test changed.
- **Mutation check.** `continuation/author-checks/mutation-check-r8.mjs` removes one fix at a time, runs the round-8 and round-7 tests, and restores the source byte for byte. **16 of 16 mutations are caught**:
  - D47: the history rule, the history kept, the proposal item, the longest run;
  - the restart reset;
  - D48;
  - D49: block credit, step 2, the cap, the phase on the step, the unreduced climb, the last executed count, the ceiling;
  - R11, R12 and R13.
- **Your round-8 probe, re-run unchanged on the current runtime.** The copy is in `policy5-author-reruns/`; only the import paths, the output name and the expected hash were adjusted. See its README.
  - **A, B, J, L, M, Q, R:** 0 violations or mismatches.
  - **P:** no walk/jog- or restart-class racer at race effort (round 8: 51). Every completion carries the item (330 = 330). The probe's `completionRuleMismatch` of 51 is its round-8 expectation, which reads the race-week mode only.
  - **N:** the pending row's first instruction is the ramp-up.
  - **T:** the all-walk athlete converts walks in projection and under executed reviews. The single-long-day return completes its steps.
  - **U:** only the two s4 flags of question 1.
- **Author checks** (`continuation/author-checks/`):
  - `author-check-event-return.mjs`: 36 returns two to five weeks before a 10K. Race-window strength is always the light session, taper strength keeps RIR ≥ 3, and every completion race day carries the item.
  - `author-check-restart-taper.mjs`: the restart example above.
- **Development outputs.**
  - The dev simulation passes all invariants on 14/14 trajectories.
  - Demonstrations A–M are produced.
  - The R5 dev replay runs 24 cases with 0 errors. It differs from the FREEZE-1 replay that the R5 judge classified in the same 8 cases as in round 8 (H01, H07, H08, H10, H12, H14, H17, H22), and only in the race-day warm-up line (D43(c)). The round-8 answers change no legacy output.

## Disclosure

- **What drove the fixes.** The fixes answer your round-8 defects and recommendations, plus one author-found change. They were made after the runtime author had seen the holdout author's one-line case summaries in its hand-back. The author never saw the corpus, the first evaluation or any evaluation output.
- **The primary record.** The single first evaluation stays on FREEZE-1.
- **The post-fix rerun.** It will run once on FREEZE-2, labelled challenge reuse.

## What is asked

1. A delta binding review of R6-POLICY-5 at hash `18ec48f3…`, with each of the ten boundary records re-issued for that hash.
2. Rulings on the nine questions above.
3. A FREEZE-2 verdict. `scripts/freeze-r6-2.mjs` refuses to freeze unless your review binds the current policy and allows the freeze.
