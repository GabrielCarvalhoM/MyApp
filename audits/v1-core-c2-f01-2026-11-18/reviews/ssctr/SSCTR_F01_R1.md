# SSCTR CORE-C2-F01 review R1: restart sizing from the record in force (2026-11-18)

**Decision: ACCEPT_WITH_CONDITIONS.** The reading "only the rows in force, each event once" is correct for C-Q08-1, the record pause and `trainedAfter`. The dose change is confined to removing credit for training the record in force does not show. C2-C1 / CORE-C2-F01 closes for synthetic use and for the integration gate, under the conditions in §5. Nothing blocks, so SSCTR does not need the mission's one focal correction cycle.

| # | Item | Disposition | Blocking |
|---|---|---|---|
| 1 | Reading of "what the record shows executed" (C-Q08-1, pause, `trainedAfter`) | ACCEPTED | no |
| 2 | Dose change confined to removing double credit | ACCEPTED, with finding SSCTR-F01-R1-F01 (pre-existing, now reachable) and residual R-F01-2 (records the engine does not produce) | no |
| 3 | Closure of C2-C1 / CORE-C2-F01 | CLOSED for synthetic use and for the integration gate, with conditions C-F01-1 to C-F01-4 | no |
| 4 | Clinical-screen authority | UNCHANGED (confirmed in code and by test) | no |

## 0. Reviewer, target, method

- **Reviewer:** SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), claude-opus-5-5. This is a fresh instance launched by the Chief of this mission.
  - I wrote none of the fix, the tests or the records. I know closure-2 only through `SSCTR_C2_R1` and `QRE_C2_R1`.
  - Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for nonclinical matters only. No human review took place, I made no clinical judgment, and I delegated nothing.
- **Target:**
  - candidate `576e40cef948c51a65625ad5fa69679c403fd276`, base `d92aa8893911e2ee6e32963585d5b5f19a802be7`;
  - record commit `f46ee7c`, which changes no `CoachingCore` file.
  - The fix is 5 lines in one runtime file (`src/v1-f08.mjs`). The relinked iOS bundle (`coachingcore-p0.js`) carries the same 5 lines and nothing else.
  - SHA-256 values are in §6.
- **Working tree.** At review time the worktree held two uncommitted edits by another author: one line added to `CANDIDATE.md` §5 (a suite count on `576e40c`) and the Mac `README.md`. I judged the committed bytes and the `CANDIDATE.md` text as read. Neither edit changes a claim I rely on.
- **Literature:** none needed. No item decides a sporting rule, dose, threshold or progression.
  - The question is which rows of the record count as one execution. That is a reading of the decided rule C-Q08-1 (SSCTR-V1CP-DECISION-r1#Q08: "never exceed what the record shows executed in the period it covers; unknown stays unknown").
  - WebSearch and WebFetch exist in this runtime as deferred tools. I did not load them.
- **Commands** (Node v24.19.0, Git Bash):
  - I did not run `verify` or `verify-r*`. I edited no runtime, test or queue file; my only repository writes are these two records.
  - `node --test test/v1core-c2f01-restart-sizing.test.mjs` in the worktree gives **18/18 pass**.
  - `evidence/red-on-d92aa88.txt` reads 18 tests, 4 pass, 14 fail, which matches CANDIDATE §4.
- **Probes.** Both are in my scratch folder `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/a1e30549-2d0a-4d67-ba6e-d90e2d830854/scratchpad/ssctr-f01-r1-7c3a/`. They import the candidate worktree and the read-only base extract `base-d92aa88` by absolute path.
  - `probe-unit.mjs` runs `restartIntake` on hand-built records, P1 to P8.
  - `probe-e2e.mjs <root>` runs `restartProgram` on the closure-2 timeline. In weeks 3 to 6 the quality run is corrected to "not done", to half its minutes, or to +20 minutes, and each case has a direct-report control.

## 1. Item 1. The reading: ACCEPTED

**What changed.** `executed()` now excludes `superseded:true`. The 28-day C-Q08-1 window also counts each `eventId` once.

**Why this is the reading of "what the record shows executed".**
- A replaced row is the record's history of a report that was later replaced. It is not a second session. The engine's own normalization states this: `supersededRows` are "never accepted, counted or bound again" (`r6-provenance.mjs:80`).
- Every other V1 reader already reads the record this way: run calibration, forecast index, format index, run history and strength. Before the fix, the restart intake was the only reader that counted a session's original report and its correction as two sessions.
- Counting both is not a conservative reading. It credits training that, by the record's own account, happened at most once.

**Corrections to "not done".** The row in force says the session did not take place. The replaced report of it is no evidence that training happened, so no execution is left behind it. The effects (probe P2, P3 and e2e):

| Probe | Record | Effect, base to candidate |
|---|---|---|
| P2 | The last run of four, 3 days ago, corrected to not done | Pause per sport: 3 days to 10 days (1 week). Recent exposure bound: 50 to 38 min/week. |
| P3 | The only run in the 28-day window corrected to not done; one execution 40 days ago | Bound to 0 min / 0 days, as the rule literally reads. Pause: 40 days. |
| e2e | All four quality runs corrected to not done | Base: 45/45/45 + 100. Candidate: **40/40/40 + 95**, the same as the direct "not done" control. |

The longer pause is correct, and it moves the plan in the conservative direction. A longer record pause can only make the existing restart rules (C-Q08-2) start lower or ask for a pause reason. It never prescribes more.

**Corrections that change minutes.** Only the value in force counts:

| Probe | Correction | Base | Candidate | Control (the same value reported directly) |
|---|---|---|---|---|
| P4a, unit | 50 to 90 min | 73 min/week | **60** | 60 |
| P4b, unit | 50 to 20 min | 55 min/week | **43** | 43 |
| e2e | +20 min | 65 min easy runs | **55** | 55 |
| e2e | half the minutes | 50 min easy runs | **40** | 40 |

An upward correction that is in force raises the bound above the uncorrected record: 55 against 50 in the e2e. That is correct, because the athlete's record in force shows more training. Who may author such a correction is SEC-CORE-03 (condition C-F01-3).

**`trainedAfter`.** I read this in the code only. My hand-built readiness fact was not a valid F08 fact, so both trees answered HOLD.
- A session after a readiness declaration that is corrected to "not done" no longer counts as training after the declaration, so the declaration again stands in for the stop.
- That is the in-force reading: the record no longer shows that the athlete trained after declaring readiness.

## 2. Item 2. Is the change confined to removing double credit? ACCEPTED, with one finding and one residual

**On every record the engine produces, the candidate equals the in-force control and never exceeds the base.**
- The closure-2 probe p14, all four shapes, through the composed entry point: 60 to **50**/50/50 + 100, the same as the control (test e2e 1–2).
- The AIF athlete with all runs of weeks 0 to 2 corrected (CANDIDATE §3): 40/40/40 + 80 to **25/25/25 + 60**, the same as the control. The difference is exactly the 12 replaced rows counted a second time.
- Several successive corrections (×2, ×3), a device correction, a late correction after a JSON round trip, shuffled or reversed order, and a chain of plans A to B to C all equal the control (tests).
- My e2e probe gives the same result for "not done", for half the minutes and for +20 min.

**No reduction where distinct executions exist.**
- Unit 8: eight distinct executions in force, some of them corrected, give the same result as eight without any correction, in three orders.
- Unit 10: a late-listed distinct row counts.
- Unit 11: legacy rows without the newer fields count as before.
- The `once` filter keeps rows that are not executions out of its "seen" set. A replaced row therefore never hides the row in force that shares its chain.

**Finding SSCTR-F01-R1-F01 (pre-existing; non-blocking; carried as C-F01-1).**
- **The code.** C-Q08-1 only bounds the stated exposure when `rows.some(executed)` is true, and the record pause is only read from an executed session.
- **What happens now.** When a correction removes the record's last execution in force, for example the only logged run corrected to "not done", the intake's stated exposure stands unbounded and the record gives no pause.
  - P1: stated 600 min / 7 days per week. The base bounded this to 13 min / 1 day, but only through the phantom row. The candidate leaves it at **600 / 7** with no pause.
- **Why this is not created by the fix.**
  - The same record with the session reported "not done" directly gives 600 / 7 on **both** trees (P1-control). The fix makes the corrected record behave like the direct one, which is the as-if oracle C2-C1 set.
  - The worst case is the intake's self-report. That is the same cold start from self-report every athlete without history receives (HQ-R6-COLD-START envelope). It is not a dose above an accepted envelope.
- **Why it is still a finding.**
  - C-Q08-1 reads "what the record shows executed **in the period it covers**". A record that holds this athlete's reported sessions in the window, all not done, covers that period and shows zero. That is not "unknown".
  - The implementation is also asymmetric. P3 shows that one execution 40 days ago makes the same window bound to **0 / 0** with a 5-week pause, while P1, with nothing older, leaves 600 / 7 unbounded.
- **What would resolve it.** Either bounding to what the window shows, or asking the athlete to confirm the stated exposure against a record that shows no training. Choosing between them is a C-Q08-1 implementation decision, outside this fix. Its owner is the next Core mission, and the change needs its own SSCTR review.
- **Note on the tests.** Unit 4-5 (`lone`) compares the corrected record with the in-force control, so it implicitly carries today's unbounded 600 / 7. That assertion is an as-if check. It is not an SSCTR approval of the unbounded reading, and it will change when F01-R1-F01 is decided.

**Residual R-F01-2 (records the engine does not produce; non-sporting; carried as C-F01-2).**
- `restartIntake` reads the record as given, so three inconsistent records still matter:

  | Probe | Inconsistent record | Base | Candidate | In-force control |
  |---|---|---|---|---|
  | P5 | The same `eventId` twice with different minutes | 70 min/week | 50 or 58, depending on which copy is listed first | — |
  | P6 | A stale **unflagged** copy of a replaced original beside its correction (two stored snapshots, before and after the correction) | 75 | **63**, still double credit | 50 |
  | P7 | A strength row and a run row sharing one `eventId` | 50 | **38**, the run dropped | 50 |

- The engine itself never writes these:
  - normalization flags a reused `eventId` as `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS` (conflicted, which `executed` excludes);
  - it marks a corrected original `superseded`.
- In each case the candidate stays at or below the base. P6 is still the F01 class (a replaced report credited as training), on a record that contradicts itself.
- CANDIDATE §2 says `once` handles "a record a client holds twice". That covers identical copies only. It does not cover a union of snapshots taken before and after a correction.
- This is record custody and integrity, owned by QRE and Security, not a sporting rule.

## 3. Item 3. Closure of C2-C1 / CORE-C2-F01: CLOSED for synthetic use and for the integration gate

- **The closing test C2-C1 set is met.** For each case of the closure-2 probe (lists, plain, with and without the watch), `restartProgram` from the stored record sizes every session exactly as from the same record without its superseded rows (test e2e 1, `decided(g)` against `decided(k)`). The RED/GREEN split, 14 failing on the base and 18 passing here, discriminates the fix.
- **Each part of C2-C1:**
  - **(i)** Naming CORE-C2-F01 as open: discharged.
  - **(ii)** The ban on using `restartProgram` from a record holding superseded rows: **lifted**, subject to C-F01-2.
  - **(iii)** Owner: discharged by this mission.
- **Remaining conditions:** C-F01-1 to C-F01-4 (§5).
- **Untouched:** C2-C2 (lineage rows 04/12/20, re-read once SEC-CORE-03 closes) and C2-C3 (refused reviews are not consumed, so the client re-sends) are unchanged by this fix and stay open as before.
- **SEC-CORE-03 stays open.**
  - A correction by another voice is the row in force here, as it is in every other V1 reader.
  - It can now raise the bound (an upward correction) or remove an execution: a longer pause, or the F01-R1-F01 branch.
  - Neither effect is new to V1 readers. C-F01-3 adds the restart sizing to what is re-read when SEC-CORE-03 closes.
- **The Quality (QRE) judgment stays separate (C-F01-4).** This review accepts the sporting reading and the dose effect. It does not judge minimality, the coverage of cases 1–12, the FREEZE-1 successor, the `v1core-freeze.test.mjs:11` successor or the Mac evidence. Those are QRE's.

## 4. Item 4. Clinical-screen authority: UNCHANGED

- **In the code (`restartIntake`):** every path that returns before sizing is evaluated before the first use of `executed` or `once`:
  - the HOLD for unreadable, foreign or later-dated rows;
  - the clinical continuation;
  - a clinical break after the latest readiness declaration;
  - a standing hold on record.
- **The later-dated count** still includes superseded rows. That is unchanged and errs toward HOLD.
- **Unit 12** passes: a clinical break answers CLINICAL_HUMAN_REQUIRED first, with or without the replaced rows.
- **An adverse response on a replaced row** stays in the returned record. The returned record is the record as given, deep-cloned, replaced rows included. `restartIntake` never read responses for sizing.
- **No other path** changes in code: no CLINICAL_HUMAN_REQUIRED path, no HOLD, no C-Q08-2/3, readiness, restrictions or not-ready sports. The diff is the 5 lines of §0.

## 5. Conditions

- **C-F01-1 (SSCTR-F01-R1-F01). Non-blocking. Owner: next Core mission.**
  - A record that holds this athlete's reported sessions in the 28-day window but no execution in force is read as covering nothing: the stated exposure is not bounded and no pause is read.
  - Decide a reading consistent with C-Q08-1: bound to what the window shows, or ASK the athlete to confirm against "the record shows no training". That needs its own SSCTR review.
  - Until then, the readiness and integration reports name it as open.
  - The worst case stays inside the accepted self-report cold start.
- **C-F01-2 (residual R-F01-2). Owners: QRE and Security. Binding for integration as custody.**
  - The restart receives the record exactly as the engine last returned it, never a union of stored snapshots.
  - QRE and Security decide whether `restartIntake` should HOLD a self-contradicting record, as it already HOLDs unreadable rows. Self-contradicting here means an `eventId` that is both superseded and live, or that is reused with different facts.
  - Not a sporting blocker for synthetic use.
- **C-F01-3.** When SEC-CORE-03 (the author of a correction) closes, re-read the restart sizing together with C2-C2: corrections by another voice that raise minutes or remove an execution.
- **C-F01-4.** The QRE gate on `576e40c` is still required for the engineering, coverage and freeze-successor claims. This review does not stand in for it.
- **Carried unchanged:** C2-C2, C2-C3, C-C3, C-C4, C-C5 (real HealthKit), A-C1, A-C2, A-C3, A-C5.
- **Non-binding recommendation:** when C-F01-1 is decided, revise unit 4-5 `lone` so that it pins the decided reading, not only equality with the control.

**Gate status:** none closed by this record. **Publication:** none. **V1 authority:** NO (synthetic and shadow standing only).

**Human revalidation queue: proposed only, not appended.**
- **HQ-CORE-F01-SSCTR-A:**
  - The restart reads only the executions in force, each event once, for C-Q08-1, the record pause and `trainedAfter`. A correction to "not done" leaves no execution.
  - Linked to HQ-V1CP-SSCTR-Q08 and HQ-CORE-C2-SSCTR-A.
  - It has prescriptive impact: it changes restart doses.
- **HQ-CORE-F01-SSCTR-B, conditional:** when C-F01-1 is decided, the reading of a record with no execution in force.

## 6. Hashes, probes, re-review

**SHA-256:**

| File | Commit | SHA-256 |
|---|---|---|
| `CoachingCore/src/v1-f08.mjs` | `576e40c` | a06c580c2d4f9c64287af3105c4cb471913b66cbd38605c0b7d24cc5bdd4d68b |
| `CoachingCore/src/v1-f08.mjs` | base `d92aa88` | 6fdcae951d6b8efd7159e9c21311fc0663822c436161b0566e679d49f5b483bb |
| `CoachingCore/test/v1core-c2f01-restart-sizing.test.mjs` | | e1a3512c378e5c7de093c8b26822cff4e04a5c7fc7675507438adac41d89e0b8 |
| `CoachingCore/test/v1core-c2f01-freeze.test.mjs` | | bb339903a9617c48f2c00d8657ee48d7acb409ab90ef77c538a8124b0e494353 |
| `audits/v1-aif-p0-jsc-2026-11-17/ios/Sources/P0Host/Resources/coachingcore-p0.js` | | 7953fec07741351172aa1863d12c2e6a1324810f11bcaec222a6de2fca24e114 |
| `audits/v1-core-c2-f01-2026-11-18/CANDIDATE.md` | `f46ee7c` | b2b0190be4ea466325ccd948fb146e46af80f92c5e0592022a1433198e1844fb |
| `audits/v1-core-c2-f01-2026-11-18/CANDIDATE.md` | working copy, +1 line | bc8a92a9870e80d689681ce95ef06dbac737a432b58f8a988219aaecd083296c |
| `audits/v1-core-c2-f01-2026-11-18/F01_SUCCESSOR_LEDGER.json` | | a3dfb93128e28ad03a7397000b6861986ed26a4828f2f1e2cb86cdb152cd2006 |
| probe `probe-unit.mjs` (scratch) | | 37b16cc82b8f90869097a60e96d1e44bb21930d96c914acd6eaf8edf696ea756 |
| probe `probe-e2e.mjs` (scratch) | | 8c80f738a33c037ce39fa592fc1e6c93485372443ef498f6facb2c0e6ba46d49 |

**Re-review triggers:**
- any change to `restartIntake`, `executed` or `once`;
- the C-F01-1 decision;
- the C-F01-2 custody decision;
- closure of SEC-CORE-03;
- a real-athlete or integration finding on restart sizing.
