# R6-POLICY-4: answers to SSCTR round 7

**For:** the SSCTR, delta binding review (round 8).
**Author:** the runtime author (Claude Code continuation root, across two sessions). This is author material, not evidence of quality.
**Date:** 2026-10-26.

## Why there is another delta

Round 7 reviewed R6-POLICY-3 at hash `e9c87e09…` and said **freeze NO** (`../ssctr-review.r7.md`, `../ssctr-policy-review.r7.json`):
- REVISE: COLD-START, LOAD-ESTABLISHMENT, PLANNED-PROGRESSION, EVENT-TRANSITION;
- APPROVE_WITH_CONDITIONS: the other six boundaries;
- binding defects D42–D46 and non-blocking recommendations R5–R10.

The reviewed R6-POLICY-3 bytes are preserved next to this file as `PROGRAM_POLICY_R6.reviewed-e9c87e09.json` (hash `e9c87e09…`, file sha256 `446e241e…`).

## The policy now under review

- **R6-POLICY-4**: canonical hash (value.mjs `hash`) `1046ad0ef1291068b309e229852b782e8a8f0eee478c3f8aec59facedd80a554`, file sha256 `2ab7ea45d29cd520ce295ecd942718715edf8089b184cd2810ec130da698241c`.
- **No envelope magnitude is widened.** Every numeric value of R6-POLICY-3 is unchanged. There are two numeric additions, and both name a value the runtime already used:
  - `event.raceDayCompletion.halfMarathonAchievedLongRunBelowMinutes: 75`. This is the materiality threshold of the existing `LONG_RUN_PEAK_BELOW_TARGET` gap, which now reads it from the policy.
  - `strength.loggedLoadAdoption.establishmentAgreementIncrements: 1`.
- The logged-load bounds `maximumKilograms` and `maximumIncrementsAbovePlanned` were declared in R6-POLICY-3 but hard-coded in the runtime. They are now read from the policy, with the same values.
- The diff against the reviewed bytes is small; please diff the two files. It touches:
  - **Changed:** `establishment.belowMinimumSession`, `strength.loggedLoadAdoption.semantics`, `return.reasonScreen`, `learning.missingGate`, `revisionNote`.
  - **Added:** `strength.loggedLoadAdoption.establishmentAgreementIncrements`, `event.modeAwareSessions`, `event.raceDayCompletion`, `event.longRunFloor`, `return.eligibilityFlags`, `return.strengthEntryWeek`.

## What changed, item by item

Tests named below are in `CoachingCore/test/r6-ssctr-r7-fixes.test.mjs` unless stated.

| Item | Boundaries | Policy key | Runtime | Tests |
|---|---|---|---|---|
| D42 | COLD-START, PLANNED-PROGRESSION | `establishment.belowMinimumSession` | `r6-program.mjs` `initialRunState`. A raised walk/jog start takes the highest step whose jogging per session is within both the longest current run and the weekly share. | "SSCTR D42" |
| D43 (a)–(e) | EVENT-TRANSITION | `event.modeAwareSessions`, `event.raceDayCompletion` | `advanceRun`: no walk/jog or restart step on taper, race-window or post-event days. `eventWeekSessions`: the session reached is kept or reduced. `raceDayCompletion` and `buildWeek`: race day is a completion at conversational effort with walk breaks. `racePrescription`: warm-up strides only after executed strides. The negotiation item `EVENT_AMBITIOUS_FOR_CURRENT_RUNNING` states what the plan reaches. | "SSCTR D43" (×2), "SSCTR D43(c)" |
| D44 | LOAD-ESTABLISHMENT, PLANNED-PROGRESSION | `strength.loggedLoadAdoption.semantics` | `advanceStrength` computes the exercise gate before adoption. `loggedLoadDecision(…, {advanced})` refuses a load above the stated plan unless the gate is ADVANCE or EARNED. `loadQuestions` are built after the decision, from the gates it applied, so they always match the transition. | "SSCTR D44" |
| D45 | LOAD-ESTABLISHMENT | `strength.loggedLoadAdoption` (semantics, `establishmentAgreementIncrements`) | See "D45 in detail" below. | "SSCTR D45" (×3) |
| D46 | PLANNED-PROGRESSION, RUN-QUALITY | `learning.missingGate` | `projectionGates` in `projectWeeks`: in projection, a dimension with no planned session that week holds. | "SSCTR D46" |
| R6 | NONCLINICAL-RETURN, COLD-START | `return.eligibilityFlags` | `r6-clinical.mjs` `isYes` and `isNo`. Used in `evaluateProgram`, intake `eligibility()`, and the legacy path, both for generation (a check before the frozen R5 validator, which reads only `true`) and for review. | "SSCTR R6" |
| R7 | NONCLINICAL-RETURN, COLD-START | `return.reasonScreen` (round-7 sentence) | `r6-clinical.mjs`: the new phrases and words, and `damageMentions` (local negation). | "SSCTR R7"; the D-series battery (`r6-ssctr-revision.test.mjs`) and QRE-07 stay green |
| R9 | EVENT-TRANSITION | `event.raceDayCompletion.halfMarathonAchievedLongRunBelowMinutes` | `raceDayCompletion` | "SSCTR R9" |
| R10 | EVENT-TRANSITION | `event.longRunFloor` | `eventWeekSessions` (taper) and the start of the next block | "SSCTR R10" |
| Author-found | NONCLINICAL-RETURN | `return.strengthEntryWeek` | See "The author-found return-entry defect" below. | "Author-found (R6-POLICY-4)" |

**Not adopted, and kept as open gaps:**
- R5 (confirm a load logged far below the plan): Data owns the threshold. Your probe case `typoLow_8` is still adopted.
- R8 (collect the keep-or-change event choice before the race window): the negotiation offers the choice but does not block.
- R1 and R2 are unchanged.

### D45 in detail

1. **A first establishment log is not a number.** This is a log with no planned value, no ceiling and no earlier load. `loggedLoadDecision` returns `pending`, and `advanceStrength` keeps the exercise FROM_LOG with `pendingLoad`. The next prescription carries no number. Its rule reads: "Choose the load by effort as in your first session; the load you logged becomes your reference once you confirm it or log it again". The athlete is asked (`ESTABLISHMENT_LOG_UNCONFIRMED`; the question names "per hand" where relevant).
2. **What makes it the reference:**
   - **(a) The athlete confirms it.** This uses a new optional review field, `loadConfirmations: [{exerciseId, value, unit KG|LB, convention}]`. Pounds are converted as at intake. The convention must be the planned one; any other convention confirms nothing. The confirmed value replaces the logged one, and every other rule still applies: a confirmation never lifts the one-increment bound, the D44 criterion or a ceiling.
   - **(b) A second log agrees within one increment.** The second log can come from a later exposure, or from an earlier exposure of the same exercise in the same week; the template plans some exercises twice a week. A second log that disagrees becomes the new pending value. `weeklyReview` returns a proposal whenever the pending value changes, even if no prescription text changes. Without that, a KEEP would drop the new value.
   - **(c) The log agrees with the athlete's own load hint.** The hint is the intake load at another rep target, in kilograms. The log must be within one increment of it, in the same convention.
3. **The return-entry ceiling.** During a return (`returnStep` set), the load before the break is a ceiling. A higher log is capped at that load and asked about (`LOGGED_LOAD_ABOVE_CEILING_CAPPED`). Before this change, a 100 kg return-entry log against a prior 80 kg was adopted as 100.
4. **Load questions** now also catch the re-establishment ceiling. The rule reads the state as `advanceStrength` does (`adoptionBasis`).

### The author-found return-entry defect

The author found this one with an author probe of the return path, not through the holdout.

In a return-entry week, an exercise first set up in that week got the entry dose at its first exposure but a normal dose at its second exposure in the same week: 2 sets at RIR 3 instead of 1 set at RIR 4 or more. After the entry week it skipped the return steps entirely. With a block boundary, that meant 1 set, then 4 sets, the next week.

The fix:
- the within-week state carries `returnStep: 0` in an entry week;
- `advanceStrength` gives such exercises `returnStep: 0`, so they continue to return step 2 (sets − 1, RIR 3) like the others.

The existing invariant "every strength row of the entry week is 1 set at RIR ≥ 4" was already asserted for profile A; it failed for the intake in this test.

## Questions for the SSCTR

1. **D44.** Is "the exercise's gate this week is ADVANCE or EARNED" the right reading of the ADVANCE criterion? Note that a systemic-convergence HOLD also blocks above-plan adoption, which is conservative.
2. **D45.**
   - Is one smallest increment the right agreement tolerance?
   - May two agreeing logs in the same week count as the second consistent log?
   - Two consistent but implausible logs (160 kg per hand twice) are adopted. Numeric plausibility is Data's and stays an open gap. Is that acceptable inside your D45 condition?
3. **Return ceiling.** During the return steps, the cap is the current reference ("no increase yet"). Confirm.
4. **Author-found defect.** Confirm the entry dose for every exposure of the entry week, and return step 2 for exercises first set up in it.
5. **R6.**
   - Yes-meaning values route to CLINICAL.
   - No-meaning eligibility values that are not booleans ("false", "no", 0) stay ASK. This is stricter than the interruption flag, where they count as no.
   - A clinical status in any letter case routes to CLINICAL.

   Confirm.
6. **R7.**
   - Only a local negation makes a damage statement ASK: the nearest word before the damage verb, past articles, possessives, clitics, auxiliaries and body parts, must be a negation. So these become ASK: "No broken bones", "Didn't break my leg", "Não quebrei a perna", "No me rompí la pierna", "Nenhum osso quebrado".
   - These stay CLINICAL: "I could not run because I broke my leg", "Didn't break my arm and broke my leg".
   - A FAMILY note that mentions a baby is now asked about; the cost is one question.

   Do you accept this inside your owned gap?

## Evidence the author ran

All of it uses the dev authority bound to the new hash. None of it is independent.

- **Tests.** `node --test` in CoachingCore: **408/408**.
  - `r6-ssctr-r7-fixes.test.mjs` now holds 14 tests (7 new for D44, D45, R6, R7 and the author-found defect).
  - One existing test was updated, `r6-adaptation.test.mjs` "executed as planned → KEEP". Under D45 a single establishment log is asked first, so the test now answers the questions through `loadConfirmations` before checking that the next executed week is a KEEP.
- **Mutation check.** Each new test fails when its fix is removed, one at a time:
  - D44;
  - the pending value carried in a proposal;
  - the return ceiling;
  - the entry week;
  - same-week agreement;
  - each of the four R6 call sites;
  - the R7 negation rule and the R7 ambiguous words.
- **Your round-7 probe, re-run unchanged on the current runtime.** The copy is in `policy4-author-reruns/`; only the import paths, the output name and the expected hash were adjusted.
  - Every section has 0 violations; section B falls from 56 to 0.
  - Section D: 82.5 kg with RIR 0, or with missed reps, keeps 80 kg and asks (`LOGGED_LOAD_ABOVE_PLAN_TARGET_NOT_MET`). Establishment logs of 16 and 160 kg per hand stay from-log with no number and are asked about.
  - Section I: eligibility flags `"true"` and `1` route to CLINICAL.
  - Section L: no ladder step without a session.
  - Section C: the walk/jog judge case races as a completion with walk breaks and keeps walk/jog after the race.
- **Development outputs.**
  - The dev simulation passes all invariants on 14/14 trajectories.
  - Demonstrations A–M are produced.
  - The R5 dev replay runs 24 cases with 0 errors. It differs from the FREEZE-1 replay that the R5 judge classified in 8 cases (H01, H07, H08, H10, H12, H14, H17, H22). The only difference is the race-day warm-up line, "no strides, as none were done in training" (D43(c)). D44, D45, R6 and R7 do not change the legacy outputs. The R5 judge will be asked to reclassify these cases after FREEZE-2.

## Disclosure

- **What drove the fixes.** The fixes answer your round-7 defects and recommendations, plus one author-found defect. They were made after the runtime author had seen the holdout author's one-line case summaries in its hand-back. The author never saw the corpus, the first evaluation or any output.
- **The primary record.** The single first evaluation stays on FREEZE-1.
- **The post-fix rerun.** It will run once on FREEZE-2, labelled challenge reuse.

## What is asked

1. A delta binding review of R6-POLICY-4 at hash `1046ad0e…`, with each of the ten boundary records re-issued for that hash.
2. Rulings on the six questions above.
3. A FREEZE-2 verdict. `scripts/freeze-r6-2.mjs` refuses to freeze unless your review binds the current policy and allows the freeze.
