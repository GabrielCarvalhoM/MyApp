# V1CP — review request for the implementation candidate

Mission: V1 COACHING PRODUCTIZATION (Founder request of 2026-11-08). This page asks the independent judges to review an implementation. It carries no grade of its own.

## Candidate and baseline

**Candidate**
- Commit `fa3985b`, branch `claude/v1-coaching-productization`.
- Worktree: `C:\Users\carva\Desktop\myApp\MyApp\.claude\worktrees\v1-coaching-productization`.
- Not pushed, not frozen.

**Baseline**
- R7D-FREEZE-6, checkpoint `32b5ce3`.
- Worktree: `.claude\worktrees\domain-coaching-r7-d`, clean. Its bytes are never edited.
- Diff baseline to candidate, `CoachingCore` only: 18 files, +1898 / −80. Run `git diff 32b5ce3..fa3985b -- CoachingCore`.

**Commits since the baseline (oldest first)**

| Commit | Content |
|---|---|
| 4584a77 | Contract and design |
| 4c3f6dc | A1 and A2 |
| ecad12d | PCG r1 and Security |
| 54b25bb | E3 and plumbing |
| 2d0cee5 | PCG fidelity r2 |
| 0b06a8e | F08 first cut |
| 134368c | SSCTR decision |
| 1323746 | Levers, and A1 per Q01 |
| 793f7ae | A3, E1 and E2 |
| fa3985b | F08 per Q05–Q08, plus the lever tests |

## Binding records (read in full; sha256)

| Record | sha256 |
|---|---|
| `ssctr/SSCTR_V1CP_DECISION.json` (Q01–Q12, returnLadder, warningSignInstrument) | `0898c59a…a166` |
| `security/SECURITY_V1CP_F08.json` (SEC-V1CP-01..27) | `b570fc70…d0f2` |
| `pcg/PCG_V1CP_F08.json`, r2 (DR-148, RC-01..RC-18, Q4). Its fidelity check is in `pcg-fidelity/`. | `fb9f3026…7806` |
| `DESIGN_V1CP.md`, with `TASK_CONTRACT.md` | `7ac633c4…2b41` |

## Where each decision lives in the code (`CoachingCore/src`)

**Q01 (A1)**
- `r6-clinical.mjs`: `attribution`, `idiomAllowed`, `nonBodyUse`, `reasonQuestion`.

**Q02 (A3)**
- `r6-adaptation.mjs` `stopOf` / `returnAfterPause`: the per-sport stop and `classBySport`.

**Q03, Q04 (E1, E2)**
- `r6-intake.mjs`: `runTrainingMonths` / `strengthTrainingMonths`, `experienceBasis`, `longestFromRace`.
- `r6-program.mjs`: the capability, the first long run and `initialCeiling`.

**Q05, Q06 (Situation 1)**
- Inputs, `v1-f08.mjs`:
  - `readWellbeing`, `readCheck`, `signsFor`, `exerciseSignsFor`, `intentsFor`;
  - `INTENT_RUNG`, `WARNING_SIGNS`, `EXERCISE_SIGNS`.
- Rungs, `r6-composition.mjs`:
  - `RUN_RUNGS`, `STRENGTH_RUNGS`, `ladderCap` (D49), `wellbeingSessions`;
  - `fixedStartOf`, `eachHold`;
  - `composeWeeks`, which re-places every later week whose start a marker fixes.
- Handlers, `r6-adaptation.mjs`:
  - `notFeeling100` (the window plus the wait for the window-end check) and `chainedReport` (C-Q05-2);
  - `wellbeingCheck` (the WELLBEING_CHECK kind) and `episodeWeekly` (the weekly check and the transitionRule);
  - `speedPlan`, `returnPlans` (C-Q05-5), `ladderSteps`, `withLadder`, `composeReturn`;
  - `notImproved` (persistence).
- `weeklyGates`: the hold flags. Evidence reducer `at(k)`: FIXED and REPEAT starts, so history agrees with the plan (loadReference).

**Q07 (Situation 2)**
- `readReadiness`: W1–W15, the speed, and the explicit running item.
- `readinessRestart`:
  - the MODERATE floor, CONSERVATIVE one class up, and the first step held (RETURN_HOLD);
  - the restriction end restarting its own region (`entryRegions`).
- `withF08Checks` / `f08Guard`: the S6 weekly check, and adverse sessions asking the items.

**Q08 (Situation 3)**
- `v1-f08.mjs` `restartIntake`: the per-sport days from the record (`bySportDays`), C-Q08-1, and `restart.fromRecord`, `notReady`, `minimumClass`.
- `r6-program.mjs` `assessCapability`:
  - `longFor`, `floorFor` (C-Q08-2), and held sports not programmed;
  - `initialStrengthState` with `returnEntry` under the floor.

**Q09–Q12 (levers)**
- `v1-coaching.mjs`, and the call sites tagged V1CP P1/P2/P4/V1–V4'/D1–D3 in `r6-program.mjs` and `r6-adaptation.mjs`.

**Interplay**
- `endF08Marks`: a readiness restart or a declared break's return supersedes an open episode from its week.
- `ownStart`: a return's own start is never replaced by an older marker.
- The R4 reserve is clamped to the goal's start RIR, so D1 HIGHER waits (C-Q12-2).

## Executable evidence (rerun it; do not trust this page)

**Suite**
- `cd CoachingCore && node --test`: 1058/1058 at `fa3985b`.

**Directed tests**

| Conditions | Tests |
|---|---|
| C-Q05-9 | `test/v1cp-f08.test.mjs` S1-1..S1-4, S1-10 |
| C-Q06-3 | S1-5..S1-9 |
| C-Q07-4 | S2-1..S2-3 |
| C-Q08-5 | S3-1, S3-2 |
| SEC-V1CP-02/03/21/22/23 (core level) | S1-1, S2-1, S2-3, S3-1 |
| C-Q10-2, C-Q11-2, C-Q12-1..5, P1/P2/P4/P5 | `test/v1cp-levers.test.mjs` |
| Q01–Q04 | `test/v1cp-block1.test.mjs` and `test/v1cp-experience.test.mjs` |

**Differential (C-Q12-4)**
- Command: `node audits/v1-coaching-productization-2026-11-08/evidence/differential.mjs ../domain-coaching-r7-d . <out.json>`, run from the candidate worktree root. It writes nothing under the repository.
- Result: `evidence/DIFFERENTIAL_CANDIDATE.json`.
- H2: 300/300 intakes identical.
- H1: 13 differing steps of 130. Each is a Block 1 decision under Q01/Q02:
  - H05 s4 (A2);
  - H07 s1–s2 and H20, H32, H34 (A1, Q01 questions);
  - H28 s4 (A3).
- The spent holdouts are read only, never re-evaluated as holdouts.

## Interpretations the implementation made (adjudicate each one inside your authority)

**I-01 (C-Q05-1)**
- After the window's last day, the affected sessions are rest ("waiting for your check") until the window-end check is recorded.
- The return starts on the check's day.

**I-02**
- When the check comes mid-week, that partial week runs the first rung from the check's day.
- The next whole plan week runs the same rung again. That is the evaluated week (a whole plan week, per transitionRule).

**I-03 (R4)**
- An R4 week followed by another R4 holds its gates.
- The last R4 week is judged by the existing gates, so its review may step into R5.
- R2 and R3 weeks always hold.

**I-04 (C-Q05-5)**
- A reduced window with some sessions not done, or with an adverse response, repeats the window's own rung first, then the chosen speed's rungs.
- A reduced window with none done reads as rest of its days.

**I-05 (C-Q05-2)**
- "Reported again at the next weekly review" is read this way: a second chained report of the same condition, in a later plan week of the same episode, routes to S3.
- Each weekly review also re-asks every warning sign.

**I-06**
- V1 opens one Situation 1 episode at a time.
- A local report whose scope does not overlap the open episode is asked (skip or rest sessions; report it after the return). No concurrent window is opened.

**I-07 (Q06)**
- The speed can change through the window-end check, inclusive. It is refused once the return has started.

**I-08 (Q07, coherence)**
- CONSERVATIVE is the next class's recipe with the same first-step hold as BALANCED.
- The literal text ("LONG stays LONG", with no hold) would make CONSERVATIVE-LONG less conservative than BALANCED-LONG.

**I-09 (Q07)**
- The first-step hold is one fixed extra week after the entry week.
- It is not moved when the entry week is only partly executed. The normal gates then hold anyway.

**I-10 (Q07)**
- A restriction that ends restarts its own region by its recipe: entry rows (`entryRegions`, one week), then the steps.
- The first-step hold of a declared-ready sport is not applied to it.
- The other rows keep their own state.

**I-11 (Q07, S6)**
- While a restarted sport is still returning (RUN RETURN/RESTART mode; STRENGTH returnEntry/returnStep), each weekly review asks W1–W9 and X1–X4.
- An adverse or conflicting session reported there asks them first.

**I-12**
- The readiness declaration asks all of W1–W15, because the cause of the hold is not read again.

**I-13 (R2/R3 strength)**
- The rows keep their load mode (KNOWN/FROM_LOG) with RIR ≥ 4 and an instruction: choose by effort, never above the current load.
- They are never converted to ESTABLISH.
- Their logs never move the reference: the next week's start is FIXED.

**I-14 (state model)**
- The evidence reducer reads a week's FIXED/REPEAT start from a marker placed before the cut, so history agrees with the plan.
- A return entry in force at that week takes precedence.

**I-15 (interplay)**
- A readiness restart or a declared break's return ends an open Situation 1 episode from its own week.
- The window stays a Situation 1 fact; nothing is converted.

**I-16 (transitionRule)**
- Repeated adverse responses (gate REGRESS) on a ladder week repeat the rung.
- They replace the held reference of the remaining R-rungs with the regressed evidence state (the existing regression).

**I-17**
- A race within 28 days after the window is disclosed (RACE_DURING_RETURN) and never changed.
- A race inside the window is asked (C-Q05-3).

**I-18 (C-Q08-2)**
- Applied only on the record's restart path (`restart.fromRecord`).
- Above 10 days without a sport, or after any readiness declaration: the run class floors at RESTART, and strength starts with return-entry rows.
- The default path is unchanged.

**I-19**
- For a systemic condition, a sports or region statement that excludes a programmed sport is asked; it is never silently widened.

**I-20 (Q4 scoping)**
- The Situation 1 entry needs the eligibility screen dated that day.

**I-21 (C-Q12-2)**
- R4 strength rows never go below the goal's start RIR, so D1 HIGHER waits until the return completes.

## Known limits (disclosed, not implemented)

1. A window cannot end early: it lasts the athlete's chosen days.
2. No concurrent Situation 1 episodes (I-06).
3. A race inside the return ladder is disclosed only.
4. The added booleans need Security confirmation before any real collection (C-Q05-8).
5. G04 revalidation of the instrument and of the urgency wording.
6. The S06 checklist question 2 gap: chronic conditions, a disclosed gap.
7. FP-4 (FASTER after REDUCE_LIGHT straight to R4) and DEMANDING as advice-only (C-Q09-2) are Founder questions.

## What each judge is asked

**SSCTR (sports-science-concurrent-training-reviewer)**
- Rule on the sporting fidelity of the implementation to `SSCTR_V1CP_DECISION.json`, item by item, Q01–Q12 and C-Q conditions included: FAITHFUL or DEVIATES, with severity.
- Rule on I-01..I-21 inside your authority: ACCEPT, MODIFY or REJECT.
- Verify by running scenarios, not by reading this page.

**Quality / Reliability (quality-reliability-engineer)**
- Judge the executable behavior: regressions against FREEZE-6, determinism, failure modes, malformed and replayed input, and test adequacy.
- Attempt targeted mutations or perturbations of the new rules, and report whether a test catches each.
- State a verdict on readiness of the candidate.

**Security (security-privacy-abuse-architect)**
- Narrow re-verification under SEC-V1CP-25: the core-level boundary on the implementation, meaning SEC-V1CP-02, 03, 14, 21, 22 and 23 as they apply to the core.
- Rule on the vocabulary extension (W1–W15, X1–X4, `improved`, the running item) under SEC-V1CP-02 and C-Q05-8.

**Every judge**
- Write only under `audits/v1-coaching-productization-2026-11-08/<your-role>/`: a JSON record and a short MD.
- Give a verdict of READY, READY_WITH_CONDITIONS or NOT_READY, and findings with ids, file:line, a failure scenario and severity.
- Do not edit code, tests, canon, product docs, the mission or the ledger.
- No push, merge or freeze.
