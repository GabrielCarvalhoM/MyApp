# C-F01-1 r2: safety and evidence decision (what a restart reads from the record)

**Scope:** `restartIntake` (`CoachingCore/src/v1-f08.mjs`), the reader behind `restartProgram`. No other reader changes. The authority is:
- C-Q08-1 (SSCTR-V1CP-DECISION-r1#Q08): "never exceed what the record shows executed in the period it covers; unknown stays unknown";
- the SSCTR_F01_R1_ADDENDUM ruling and C-F01-1 r2 (i)–(iv);
- the normalizer's quarantine of conflicts (QRE-R6-14), E-1 parts (SSCTR L5), and SB-1 (SEC-V1CPI-02, RC-11).

## 1. The terms, as the record already carries them

| Term | Meaning in the record | Predicate (`v1-f08.mjs`) |
|---|---|---|
| **Report of a session** | Any observation row (not an F08 fact) with an `actual` object: in force, replaced (`superseded`), "not done", or in conflict. | `!o.fact && isObj(o.actual)` |
| **A voice says it took place** | `actual.completed === true`, or minutes logged (the same test `executed` always used). | `did(actual)` |
| **Execution (admitted amount)** | A row in force (`superseded !== true`), not in conflict, whose voice says it took place. Its minutes and day count. | `executed` (unchanged) |
| **Execution of disputed amount (recognized occurrence)** | A row in force, flagged `CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE`. The normalizer keeps every voice in force on that row (`provenance.parts`, two or more), and every voice says it took place. Only its amount, or its response, is disputed. | `occurred` minus `executed` |
| **Occurrence not shown** | A direct conflict (`CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS`): the normalizer keeps the first voice and refuses the other, so the record cannot show that both said done. Also `EVENT_ID_REUSED…`, `ACTIVITY_BOUND…`, and any row where a voice says "not done". | neither |
| **A voice in force says the athlete trained** | Any row in force, conflicted or not, whose own report or any part says it took place. | `claimsDone` |

Nothing new is stored. Each predicate reads fields the engine already writes.

## 2. The decisions

| Reader | Reads | Why |
|---|---|---|
| **C-Q08-1 gate** (does the bound apply?) | Any execution on record (unchanged), **or** any report of a session in the 28-day window. | (i). Reports in the window, of any state, mean the record covers that period. "Unknown stays unknown" is about an exposure the intake does not state, not about the record. |
| **C-Q08-1 amount** (bound to what?) | Executions only, each event once. | A replaced, "not done" or disputed report is never proof of volume. A disputed amount is quarantined for gating (QRE-R6-14), so it contributes 0 minutes and no day. That is lower than the lowest reported value, and no number is chosen between two voices. |
| **Pause and last executed day** | `occurred`: executions plus executions of disputed amount. | (ii). Every voice agrees the session took place, so the time since training is a fact even though the amount is not. |
| **`trainedAfter`** (SB-1) | `claimsDone`, after the declaration. | SB-1 exists so that a declaration never stands in for a stop it did not answer. Any voice in force saying the athlete trained after the declaration makes the stop read from the record a new one, so its reason is screened, or asked when none is stated. This errs toward asking. It reads no amount and admits nothing for dose. |
| A "not done" in force | No execution, no `claimsDone`. | (iii), R1 stands. The replaced report behind it is history. |

**Bound or ASK, for (i): bound.** The addendum lets the mission choose. Bounding is the reading that is consistent with the rule:
1. On every record with an execution in force, C-Q08-1 already lowers a larger stated exposure to the record without asking. The record wins. An ASK to "confirm against the record" could only end in the same bound, unless C-Q08-1 let a confirmed self-report exceed the record, which it does not. So an ASK would add an interaction with no different outcome.
2. The same 0/0 already applies today when the window is empty but an older execution exists (SSCTR P3). Bounding removes the asymmetry SSCTR named (P1 vs P3).
3. **Zero is not a capacity.** A bound of 0 is the exposure the record shows in the window. The program maps it to the existing, decided class **RESTART** ("0 run days or 0 weekly minutes", `r6-program.mjs:49`), the same start the engine gives after a pause of four or more weeks. No volume is invented, no threshold changes, and an athlete with no record at all keeps the self-reported cold start.

**Disputed minutes, for (ii): zero.** "Zero or the lowest reported value" was left to decide. The normalizer's contract quarantines a conflict for gating and learning, and the C-Q08-1 bound is a gate, so zero is the contract's value. It also never exceeds the lowest value.

**Direct conflicts.** Their occurrence is not shown, so they set no pause and no last executed day, as before. Two things now cover them:
- the bound opens (0 for that session);
- `trainedAfter` reads their voice, so SB-1 is asked.

## 3. Readiness, then a later session (SB-1)

| Record after a declaration | FREEZE-2 | This line |
|---|---|---|
| A run, executed | stop is new, reason screened | unchanged |
| A run, corrected to "not done" | the declaration answers | unchanged (correct: no training after it) |
| A run of disputed amount (P4 shape) | **the declaration answers, reason not asked** | stop is new, reason screened or asked |
| A direct conflict, or the watch saying done against a "not done" correction | **the declaration answers** | stop is new, reason asked |
| The same, with no execution shown anywhere | `weeks:0`, `readinessDeclared:true` | `weeks:0`, no `readinessDeclared`, reason asked |
| A disputed session **before** the declaration | the declaration answers | unchanged |

A clinical break after the declaration still answers CLINICAL_HUMAN_REQUIRED first. Every HOLD path is unchanged and runs before these readers.

**What this does not do (for Security):**
- It trusts no new field. A forged conflicted row can give no more than a forged plain execution already gives: its amount is never counted, and `claimsDone` only adds a question.
- A row marked `superseded` with nothing in force behind it still hides a session from `trainedAfter`. That is record custody, C-F01-2: the restart must receive the record exactly as the engine returned it. It is pinned as a residual (test D9) and not changed here.

## 4. Doses that change, and why

| Record (stated 600 min / 7 days, or the composed athlete's 300 / 4) | FREEZE-2 (`4b6e1ea`) | This line |
|---|---|---|
| A: the only run corrected to "not done" (or reported "not done" directly) | 600/7 unbounded; restartProgram EASY_CURRENT, 65/65/65/100 | 0/0; RESTART |
| P4: app + watch, the athlete's correction against the watch | 600/7 unbounded, pause null, no last day; EASY_CURRENT | 0/0, pause 3 days, last day read; RESTART |
| P4 + one execution 13 days ago | 13/1, pause 13 days | 13/1, pause 3 days |
| Disputed session 20 days ago, alone | pause null | pause 2 weeks, 0/0 |
| Direct conflict alone | 600/7, pause null | 0/0, pause null |
| A "not done" report older than 28 days, alone | 600/7 | 600/7, unchanged (outside the window: named residual) |
| No record | the self-reported cold start | unchanged |
| Any record with executions in force | as before | unchanged (CORE-C2-F01 kept) |

Every dose change is in the conservative direction, except one: the shorter pause when a disputed session is the last one. That pause is the correct reading under (ii), because the session took place.

## 5. Residuals named, not changed

- **Outside the window.** A "not done" report older than 28 days, with no execution, does not open the bound. An execution there still bounds to 0. This follows (i) as written ("in the window"); SSCTR may widen it.
- **C-F01-2 (custody), unchanged:**
  - an unmarked stale copy of a replaced original is read as in force (QRE-F01-03);
  - an orphaned `superseded` mark hides a session (D9);
  - QRE-F01-02 and R-F01-2.
- **SEC-CORE-03.** The author of a correction is not checked (C-F01-3).

## 6. Cycle 1 addenda (after SSCTR_R2_R1, SEC_R2_R1, QRE_R2_R1)

- **SEC-R2-01: the engine can write an orphaned replaced mark.** The normalizer marks the original replaced and then refuses the correction when it reuses another event's id or binds another session's watch activity. The session then vanishes, and the declaration used to stand in for the stop after it. Two rules close this, in `trainedAfter` only:
  - a row marked `superseded` keeps its voice unless the record holds the row that replaced it (`eventId === supersededBy`, of the same session, else the same activity);
  - the dose, the bound and the pause still read no execution there.

  This replaces the §3 sentence "an orphaned `superseded` mark still hides a session": it no longer does, for SB-1. D9 is inverted.
- **SEC-R2-02.** `occurred` admits an occurrence only if every voice is well formed: a boolean completion and readable measures, the SEC-CORE-14 rule. The readiness question still hears any voice, because a malformed voice can only add a question there.
- **SEC-R2-03 (routed; independent issue, not fixed here).**
  - *Root cause:* `normalizeObservations` retires the original before the correction is accepted.
  - *Reproduction:* SEC_R2_R1 probe, and test `SEC-R2-01`.
  - *Severity:* every dose reader that drops superseded rows also loses that session. Its minutes vanish from the record in force, which errs low on dose, and the run never reaches calibration.
  - *Owner:* the next Core mission, with QRE then SSCTR. The fix lives in `r6-provenance.mjs`, a file the earlier freezes bind, and it changes what every V1 reader reads.
- **C-R2-1 (SSCTR): the return-floor lift.** When a disputed session is the last one, the pause it sets is shorter. That can lift the start out of the return floor: in SSCTR's probe, RESTART at 45 min became EASY_CURRENT at 80, the same as the in-force control. This is correct under (ii), because the session took place. It is the one dose change in the less conservative direction, and it is now named here next to §4.
- **QRE-R2-03 / C-R2-2: the window residual, both variants.** A record older than 28 days does not open the bound when it holds only:
  - a "not done" report, or
  - a disputed session.

  An execution at the same age still bounds to 0/0, so the two cases are asymmetric. In SSCTR's example, a "not done" 40 days ago gives EASY_CURRENT at 295, while an execution 40 days ago gives RESTART at 45. A disputed session there also sets a 5-week pause, so `restartProgram` gives RESTART. Owner: the next Core mission with Data, then SSCTR, who will define per sport "the period the record covers" for both gates. This is not binding before real-athlete use (SSCTR).
- **Calibration, forecast and pace are untouched.** `factsFromLedger` reads no conflicted row (test B3). Pace Revision stays off.
