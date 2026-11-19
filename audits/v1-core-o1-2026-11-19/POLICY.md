# O-1 Conflict Evidence Policy (proposal r1, for SSCTR and Security decision)

Founder mission of 2026-11-19, after `COACHINGCORE-V1-CORE-SAFETY-FREEZE-5`. Findings: **SSCTR-NCC-01 / C-NCC-1** (`audits/v1-core-ncc-2026-11-19/reviews/ssctr/SSCTR_NCC_R1.md` §3 and §6) and **SEC-NCC-02** (`reviews/security/SEC_NCC_R1.md` §6). Synthetic athletes only.

- **Line:** branch `claude/v1-core-conflict-policy`, worktree `.claude/worktrees/v1-core-o1`, from `f40fbe1` (FREEZE-5 60/60).
- **Candidate:** `1d418d1`.
- **Code change:** `CoachingCore/src/r6-provenance.mjs` only, about 20 lines. `v1-f08.mjs` and every consumer are unchanged.

## 1. Cause, common to both findings

At a head-on conflict (`DUPLICATE_CONFLICT_QUARANTINED`, `r6-provenance.mjs` ~l.206):
- the row in force is flagged;
- the incoming report is refused, and **nothing of what it said is kept**: `excluded` holds only its hash, and it is never persisted.

From that, two consequences follow:
- **SSCTR-NCC-01:** a later correction by the kept speaker resolves a dispute whose other side the record no longer holds. With `heldBefore`, the correction retires every row on the identity, and nothing is left to disagree with it.
- **SEC-NCC-02:** f08's SB-1 (`claimsDone` over `voices`) can only hear voices the record holds.

## 2. The policy

**P1. Kept voice.**
- **Which reports are kept:** a report that passed every validity check (athlete, times, measures, response vocabulary, event id, device activity binding, correction chain) and is refused **only** because it disputes the row in force for its execution (head-on), or because that execution is already in dispute (`IDENTITY_QUARANTINED_BY_CONFLICT`, when a flagged row in force exists and the report's activity is not another execution's).
- **How it is kept:** as a voice of the flagged row. It is a `provenance.parts` entry in the existing part format (`actual`, `response`, `sourceQuality`, `activityId`, `availableAt`) plus its input hash.
- **What it never becomes:**
  - it is never merged into the row's amount;
  - it is never added to `mergedSourceIds`;
  - its refusal stays in `excluded` with the same reason.

**P2. Never dose.**
- The flagged row keeps the first-admitted report's amount and stays `conflicted`.
- So every dose reader keeps reading the row as before: it is withheld from weekly-review credit (CONFLICTED, so HOLD), from run history, calibration, Race Forecast, Pace Insights and strength exposure.
- f08 `occurred` still excludes a head-on dispute (reason `CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS`). So the restart pause reads no occurrence from it and errs long, as on FREEZE-5.

**P3. Integrity refusals are never kept.** These are never kept:
- another athlete's report;
- an invalid or future time, a report made before the run, a stale report;
- an invalid measure or response;
- an event id reused with other facts;
- a device activity bound to another execution;
- an invalid correction chain.

Such reports cannot add a voice, open a question or block a resolution.

**P4. Resolution.**
- A correction resolves a dispute only when it agrees, by the existing `physicalAgrees`/`responseConflicts` rules, with every voice still carried on the row. This is E-1's existing rule for a correction in conflict, now also applied to the refused voice.
- **Speaker rule (new, only while a dispute stands on the identity):**
  - The speaker of a report is one device activity (`activityId`), else the athlete (`MANUAL`/`SELF_REPORT`), else unknown.
  - A correction from a known speaker is that speaker's word for every voice that speaker gave. Those voices are not carried, so the refused speaker settles the dispute.
  - Another speaker's voice is always carried, whichever row id the client names.
  - A correction from an unknown speaker keeps the E-1 rule (only the named report is replaced).
- Outside a dispute, E-1 is unchanged.
- **These never resolve a dispute:**
  - a re-read, replay, JSON round trip or re-sync of the same bytes (`EXACT_REPLAY`);
  - a refused correction;
  - a correction of the kept speaker that still disagrees with the other voice.

**P5. Persistence.** The voice lives on the row in the actual ledger:
- a re-read, a restore and a later review read it (its input hash maps the event id for replays and corrections);
- once a correction retires the row, the history row keeps it;
- records written before this line (a flagged row with no parts) are read as they were.

**P6. Safety signal (SEC-NCC-02).**
- f08's readiness question (SB-1) already reads every voice a row holds (`claimsDone`). So a kept voice saying a session took place after a readiness declaration (`completed` or minutes > 0, a symptom stop included) re-opens the question: **ASK**, as an admitted report does.
- It never sets a clinical hold, a restriction or a referral, and never confirms a symptom.
- The warning-sign screen keeps reading the run-format record, unchanged (C-NCC-3).
- Resolving a quantitative dispute does not answer the readiness question (S6): a resolved row whose voices say it took place still asks.
- A readiness declaration made after the disputed session answers it (S8).

**P7. Determinism.** Arrival order, batching (one review or several), the batch order, and which id a client names do not change:
- whether the execution is disputed;
- the voices kept;
- the resolution.

Only whose amount the flagged row displays can differ, and that amount is never dose.

## 3. Answers proposed to the mission's questions (SSCTR §2.3 A–C, Security §3.3)

### A. Which facts stay recognized under a head-on dispute

| Fact | Status |
|---|---|
| The execution's identity, and that it is disputed | Recognized (CONFLICTED, with every valid voice kept) |
| Occurrence | **Not** recognized for the pause (unchanged, errs long). Recognized as "training after a declaration" for SB-1 only when any voice says it took place |
| Duration, distance, intensity, completion, interruption, RPE, recovery | Contested: kept as voices, used by no dose reader |
| Safety-relevant content | Heard by SB-1 through the voice (P6), and by the warning-sign screen through the run-format record |

### B. Effect on the coach

Unchanged readers, reading a row that stays CONFLICTED:
- **Session count, recent volume:** no credit. C-Q08-1 does not count it, and it opens the 28-day bound only as before.
- **Pause and return:** no occurrence.
- **Recovery:** no adverse-recovery reading.
- **Calibration, Race Forecast, Pace Insights:** withheld.
- **Strength Intelligence:** CONFLICTED rows are excluded from logged loads.
- **Restart:** no credit, and SB-1 asks.
- **Future prescription:** the gate is HOLD (the dose is repeated, never raised).

### C. When the dispute is resolved

Only by a valid correction that agrees with every voice of the other speakers (P4):
- the refused speaker correcting their own report;
- the kept speaker's re-sync agreeing with the refused voice;
- an athlete correction agreeing with the device.

These never resolve it:
- the arrival of a later report;
- averages;
- the larger or the smaller amount;
- the last report.

## 4. Dose changes (only lower; `evidence/lineage-diff.txt`, `lineage-dump.mjs DOSE=1`)

Six of 62 lineage matrix rows move.

| Row | Change | Dose |
|---|---|---|
| 21 (scenario 21: symptom stop refused, then device re-sync), EASY and LONG | CONFLICTED stays (was COMPLETED); run-history fact 1 → 0 | LONG w+2 `EASY:70,QUALITY:34,EASY:65,LONG:100` → `EASY:70,EASY:65,EASY:65,LONG:100`; EASY w+3 one EASY 70 → 65. Next long run unchanged (100 min, 16 km) |
| 18 (import first, app refused, then re-sync), EASY and LONG | Same as 21; LONG long-run sizing source S2 365 → 360 s/km (the control's value; minutes and km unchanged) | As row 21 |
| 19 (app first, import refused, then the app corrects itself to the whole) | The kept device voice agrees with the correction and is merged: the row now reads exactly as rows 08/10 (the same statements, `DISTANCE_DISPUTED`, partial at the device's first file, run-history fact kept) | As rows 08/10: LONG w+2 QUALITY → EASY; EASY w+3 70 → 65 |

Every other row is byte-identical in reading, words, bands, calibration, screen and the long run ahead.

## 5. Limits, and what this does not close

- **SEC-CORE-03** (correction author not validated) is unchanged. A forged correction from the athlete's source quality can settle a dispute by agreeing with the device, or replace the athlete's own earlier voices. That is the same class as forging any correction today. The speaker rule reads declared `activityId`/`sourceQuality`, which custody must vouch for (C-F01-2).
- A dispute whose speakers never agree stays CONFLICTED: no credit for that session (errs low). It is never a hold.
- **OOS-1** (a client-supplied `conflicted` flag bypasses the quarantine) is unchanged and routed.
- A report refused for `ACTIVITY_BOUND_TO_TWO_SESSIONS` is not kept, because its execution is in question. Its stop still reaches the warning-sign screen through the run-format record (C-NCC-3).
- **O-NCC-1/-2 and O-R2-1** are unchanged in kind. A report refused head-on now has its device activity bound to its execution in that same review, as a carried part already was (F2). Whether this makes the O-R2-1 one-review and split shapes agree is not tested here (a question for QRE).
