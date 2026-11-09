# QRE-V1CPFF-RECHECK-r1: Quality & Reliability review of the V1CP Fix-Forward candidate (2026-11-09)

This is the QRE part of the single independent review round. It was done by a fresh Quality & Reliability Engineer instance (constitution 1.3.0) that wrote none of the candidate, its tests or its evidence. Every probe, mutation and fuzz ran on git-archive copies in a new scratch folder. Nothing in the repository was edited except these two files. The security/ and ssctr/ records of this round were not read. Full record: [QRE_FF_RECHECK.json](QRE_FF_RECHECK.json).

**Candidate:** `4630bca` on `claude/v1cp-fix-forward` (base `8039d94`; last reviewed runtime `5ee9dec`). Baseline: R7D-FREEZE-6 (`32b5ce3`), read only.

## Verdict: NOT_READY (QUALITY_BLOCKED)

The scope is the candidate as a shadow reference runtime for the Fix-Forward scope.

The shipped evidence reproduces, and eight of the ten earlier findings are closed by their own scenarios. But the candidate introduces two BLOCKING regressions in its new mechanisms:

- **QRE-FF-01:** a superseded Situation 1 ladder comes back after a readiness restart or a declared break.
- **QRE-FF-02:** a marker added to a week that is already placed is never applied. As a result, a race stays at race effort inside a recipe step, and a d49 hold is not applied in the decision's projection.

Both are narrow and runtime-only. Each has a fix hypothesis, tried on a scratch copy only, that removes the failure and keeps the suite at 1133/1133. So the single bounded fix cycle can address them, followed by a narrow recheck.

## Re-run evidence

| Check | Result |
|---|---|
| Full suite (`node --test`, `V1CP_ROOT` unset) | 1133/1133 pass. This includes the fixtures module as one entry; the 69 test files hold 1132 tests, as shipped. |
| RED on a `5ee9dec` extract | 53 tests: 46 fail, 7 pass (the same 7 guards). The shipped 43/50 predates three later tests, and all three fail at `5ee9dec` too. |
| Differential vs FREEZE-6 | 39 cases, 130 steps, 13 differing summaries (the Block 1 steps), 104 fully identical. Generations 39/39; H2 300/300. Byte-identical to the shipped file. |
| Differential vs `5ee9dec` | 0 differing summaries, 116 fully identical, 14 differing in record fields only. Byte-identical to the shipped file. Precision: H24 s3–s4 keep one hold row where `5ee9dec` kept two (SB-4 now reads standing from the record). |
| Journeys A–G | 7/7 run end to end; identical to the shipped trace. |
| Mutation sample (19 mutants, eight v1cp files, control 118/118) | 17 killed. M12 survives and is **non-equivalent**: with known rows, the restart weeks' `lastPerformed` leaks projected dates. D3-strength survives and is equivalent in practice (42 probes). |
| Fuzz, 600 seeds, about 6,900 steps per runtime | Candidate: 0 exceptions, 0 non-determinism, 0 replay rows, 0 zero-day questions, 0 live sessions in a wait. Flags: S1-after-restart 78 steps in 23 seeds; race at effort 1; d49 25; missing guidance 6. `5ee9dec`: race at effort 1034, live in wait 623, replay rows 313, missing guidance 450, zero-day 36, S1-after-restart 0. |

## Earlier QRE findings

| Finding | Ruling | Evidence (candidate vs 5ee9dec) |
|---|---|---|
| QRE-V1CPR-01 | CLOSED | Single break after a 7-day REST window: both sports MODERATE (14 days); week 7 runs 15/15/20 with strength 1x8 RIR 4. `5ee9dec`: SHORT, 40/35/60, 2x8. |
| QRE-V1CPR-02 | CLOSED | After an answered adverse check, Fri, Sat and next-week reviews give KEEP (`5ee9dec`: ASK each time). Three replays add 0 rows (`5ee9dec`: +3). |
| QRE-V1CPR-03 | CLOSED | Foreign intake id: HOLD. Intake dated before the hold: HOLD. `5ee9dec`: PROPOSED for both. |
| QRE-V1CPR-04 | CLOSED | Six missed R3/R4/d49 variants never exceed the last executed count +1. `5ee9dec` exceeds it in all six. |
| QRE-V1CPR-05 | **OPEN** | Routes (a) date change into R3, (b) date change into an open window and (c) ladder shift are now the own event (easy, walk or none) with the offer. The property still fails on the CONSERVATIVE recipe extension week (QRE-FF-02). |
| QRE-V1CPR-06 | **OPEN** (residual non-blocking) | N11, N14, N18, N19 and M29 are killed. M12 survives and is non-equivalent (state only). The guard test needs known rows. |
| QRE-V1CPR-07 | CLOSED | Every one-key, empty or mismatched hold reference is asked. |
| QRE-V1CPR-08 | CLOSED | Without the reference, the declaration restarts and records its fact, and a new plan follows. |
| QRE-V1CPR-09 | CLOSED | Strength-only reports (whole body, lower body) leave the race to the event rules, and strength returns. |
| QRE-V1CPR-10 | CLOSED | No question offers 0 days. When no day is left, the persistence route applies (clinical, or the NEED_REST route). |

## New findings

**QRE-FF-01 (BLOCKING).** NB-4's missed-ladder-week rule re-opens a Situation 1 episode that a readiness restart or a declared break had superseded.

- Scenario: an S1 ladder week elapses without its check. Then a clinical sign is followed by a readiness declaration.
- The next weekly review asks the S1 check instead of the restart's, and puts an S1 R2 ladder over the restart. Week 4 runs go from 15/15/20 to 35/35/35, and week 5 strength goes to 4x8 RIR 3 (`5ee9dec`: 15/15/20, then 2x8).
- A MISSED_SESSION, SCHEDULE_CHANGE or PREFERENCE_CHANGE the day after the restart does the same at once.
- The same happens after a clinical break plus declaration, and after a travel break.
- Expected: C-Q05-6, QRE-V1CP-02, the Q07 floor and D49.
- Smallest fix: `missedLadderWeek` ignores ladder weeks that a later restart or break decision supersedes. On a scratch copy this gives 0 such steps in 600 seeds, with every other count unchanged and the suite at 1133/1133.

**QRE-FF-02 (BLOCKING).** A marker that an extension adds to a week already placed is never applied to that week.

- (a) A 10K in week 5 of a CONSERVATIVE return after a 12-day rest, in an M "each" week, stays RACE 75 min beside 15-min runs, with the completion item. This violates FF-Q2 (b).
- (b) After a race moved into the return, a d49 week plans 6 sets after 1 (`5ee9dec`: 2/3/4). A later review corrects the projection.
- Cause: the composition loops (`eachHold`, `composeReturn`) re-compose from week i+1, and the FF-Q2 (d) race rule drops the d49 marker's start.
- Smallest fix: place week i again under its new marker. On a scratch copy the race becomes the own event's easy run, d49 gives 2 then 3 sets, and the suite stays at 1133/1133.

**Non-blocking findings:**

- **QRE-FF-03:** the sticky clinical path carries no `guidance` (contract 10.4).
- **QRE-FF-04:** NB-3 leaves `interruption.class` and the headline at SHORT while both sports restart MODERATE.
- **QRE-FF-05:** I-09 counts a mid-week restart week's held sessions as "not done" (SSCTR reading; copy).
- **QRE-FF-06:** pre-existing since FREEZE-6, an integration condition. A program fails `validProgram` after a JSON round trip, because `contextBefore[].noviceTemplates` is undefined and `canonical()` serialises it.

## Chief observations

**CF-OBS-1: NON_BLOCKING for this candidate; an integration condition.**

- It is pre-existing and identical at `5ee9dec` on seven review kinds.
- It is the documented client contract (section 1 of the integration contract).
- The narrow fix would change the R7-D qualified-clearance modelling (H18, H19, H24). That needs a recorded clearance form first, so it is not a narrow fix for this round.
- It cannot stand for real athletes. Without the reference state, a declared travel break right after a sign route returns a full REESTABLISH.
- Security should decide before integration, with parity to the reference-present behaviour: every kind except the readiness declaration holds.

**CF-OBS-2: the premise is not reproduced.**

- Scenario (a) is buildable. The R6 rule refuses only dates less than 7 days ahead or past the horizon. A date change on 11-24 or 11-25 to 12-05 is accepted, and at the candidate it gives the own event.
- The route is verified by reproduction. The "by construction" argument alone fails elsewhere (QRE-FF-02).
- Condition: add the directed test.

## States

- Implementation done: yes (`4630bca`).
- Technical validation: not passed.
- Integration readiness: not ready.
- Authorization for real athletes: no.
- App publication readiness: no.
- F08 = F08_OPEN; V1_COACHING_AUTHORITY_READY = NO.

**Next:** the Chief decides whether to use the single narrow fix cycle for QRE-FF-01 and QRE-FF-02. The narrow recheck would cover: directed tests RED on `4630bca` and GREEN after, the full suite, the FREEZE-6 differential unchanged, and the two fuzz invariants at 0. Otherwise the mission closes with these as named blockers.
