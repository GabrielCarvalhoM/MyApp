# C-F01-1 r2 restart evidence and safety closure: final report

**State: CLOSED, freeze emitted.** The freeze is **COACHINGCORE-V1-CORE-SAFETY-FREEZE-3** (`CoachingCore/v1/RUNTIME_FREEZE_V1CORE_3.json`). It binds 24 files at `9967e31` (filesDigest `eed39d01…`). The runtime is `37c0f6f`: candidate `3f0b04f` plus the one focal cycle. `node CoachingCore/scripts/v1core-freeze-3.mjs --check` gives 24/24.

The freeze is additive. The seven earlier records are the `4b6e1ea` bytes. FREEZE-1 is 47/47, and FREEZE-2 is 14/15 with `src/v1-f08.mjs` declared. `v1core-freeze-2.mjs --check` now names that file and this line's files, by design.

**Line:** branch `claude/v1-core-cf011-r2`, from `4b6e1ea`. Commits, in order:
- `3f0b04f`: candidate
- `7dc0ee5`: records
- `317ec5b`: reviews
- `37c0f6f`: cycle 1
- `944d9fb` and `2819e6a`: cycle records
- the rechecks
- `9967e31`: Mac package
- `adf343a`: freeze
- this report

**Nothing pushed or merged.**

## A. Closure, per item

| Item | Defect reproduced (on `4b6e1ea`) | Contract | Fix (`restartIntake` only) | Tests | Judges | State |
|---|---|---|---|---|---|---|
| **(i)** | A record of reports with none in force (shape A, P4) left the stated 600/7 unbounded; `restartProgram` gave EASY_CURRENT, as for no record | C-Q08-1; ADDENDUM §4 (i) | The bound opens on any report in the 28-day window. The amount is still executions in force, each once. Bound, not ASK (DECISION §2). | A1–A12, A e2e | SSCTR ACCEPT; QRE READY | **Closed** |
| **(ii)** | A disputed amount read as no session: pause null, no last day | ADDENDUM §4 (ii); QRE-R6-14 | `occurred`: a correction in conflict with a report in force, every voice well formed and saying it took place, is an execution for the pause and the last day. Its amount is 0 for the bound. | B1–B7, persistence, QRE-R2-01, SEC-R2-02 | SSCTR ACCEPT; Security PASS_WITH_CONDITIONS; QRE READY | **Closed** |
| **(iii)** | Already correct | R1 | Unchanged; pinned | C1–C11 | all | **Closed** |
| **(iv)** | Three tests labelled "open" (bound by FREEZE-2) | ADDENDUM §4 (iv) | Not edited; successors given in `SUCCESSOR_LEDGER.json` with old and new values, reason and safety effect | 3 entries | QRE READY | **Closed** |
| **SB-1** | After readiness, a disputed session, a direct conflict or an engine-written orphan hid the training: the reason of the new stop was not asked | SEC-V1CPI-02, RC-11 | `trainedAfter` hears any voice in force, and a replaced row with no replacement on the record (SEC-R2-01). The `else if(readiness)` branch honours it. | D1–D9, SEC-R2-01 and its controls | Security PASS_WITH_CONDITIONS (SEC-R2-04 open) | **Resolved for the synthetic freeze**; SEC-R2-04 binds before a real-athlete restart |

## B. Safety and evidence decision

`DECISION.md` §1–§6 covers the decisions:
- what an execution, an admitted amount and a disputed amount are;
- bound vs ASK;
- why 0 is not a capacity (it maps to the decided RESTART class);
- how a readiness declaration meets later sessions.

## C. Regression

- **Full suite on the committed tree (`2819e6a`):** **1749 / 1722 / 27**, reproduced by QRE on a clean clone.
  - 24 are the inherited failures, at unchanged locations.
  - 3 are the re-pinned tests.
  - No other test changes status.
- **The new test file:** 36/36. It was 12/31 RED on `4b6e1ea`, and the cycle's tests gave 33/36 on `3f0b04f`.
- **Mutants killed (QRE):** M06, M27, M30 and M31.
- **Determinism:** 200 permutations and JSON round trips gave 0 differences (QRE).
- **Bench (Node):**
  - review ×1.004;
  - restart from a corrected record ×0.994;
  - a record with conflicted rows ×1.12 (+0.28 ms, QRE);
  - record bytes ×1.000.

  None of this is material, and no budget was changed.

## D. Reviews (`reviews/`)

| Judge | R1 on `3f0b04f` | R2 on the cycle |
|---|---|---|
| SSCTR | ACCEPT_WITH_CONDITIONS (C-R2-1 now discharged; C-R2-2 residual) | ACCEPT |
| Security | PASS_WITH_CONDITIONS (SEC-R2-01 blocking, -02, -03) | PASS_WITH_CONDITIONS (SEC-R2-01 and -02 closed; new SEC-R2-04) |
| QRE | READY_WITH_CONDITIONS (C1 and C2 blocking the write) | READY |

The one focal cycle was used (`CYCLE1.md`). There is no second one.

## E. Freeze: see the header.

## F. Mac package

`audits/v1-core-safety-lifecycle-2026-11-18/mac/README.md` §9, with hashes in `evidence/MAC_PACKAGE.json`:
- the bundle is relinked (`4963a6f5…`);
- three journeys are added (`restart-r2-notdone`, `-control`, `-disputed`);
- the ten earlier journeys and J5/P16 are identical;
- `vm-check` is ok with JIT and with `--jitless`;
- a second run is a no-op.

## G. Readiness: the twelve questions

1. **(i) closed?** Yes.
2. **(ii) closed?** Yes.
3. **(iii) closed?** Yes. It was already correct, and is now pinned in 11 shapes.
4. **(iv) closed?** Yes.
5. **SB-1 resolved?** For every shape the engine writes with a session or an activity id, yes. **SEC-R2-04 remains:** a manual row with no session and no activity id still matches its "replacement" on `null === null`. It binds before a real-athlete restart.
6. **Is CORE-C2-F01 still correct?** Yes. Replaced rows are never counted as training, and each event counts once (A6–A7, C1–C5). The C2-F01 restart journeys are unchanged (25/25/25/60).
7. **Did any dose change?** Yes, only on records whose executions are not admitted:

   | Record | FREEZE-2 | Now |
   |---|---|---|
   | All runs "not done" (composed journey) | EASY_CURRENT 40/40/40/80, unbounded, above its own "done" control | bounded 0/0, RESTART 15/15/15/20 |
   | P4 | 600/7 unbounded, no pause | 0/0 with the pause read |
   | Readiness, then a disputed session | the plan is made | the restart ASKs the reason of the new stop |

   One change goes the other way. When a disputed session is the last one, the pause it sets is shorter. That can lift the return floor (RESTART at 45 became EASY_CURRENT at 80, the same as the in-force control; SSCTR C-R2-1). Progression, thresholds, periodization, calibration, Race Forecast, Pace Insights, Strength, AM/PM and the coach profiles are unchanged, and Pace Revision stays off.
8. **History and freezes preserved?** Yes. The record is returned byte for byte, and replaced rows stay as history. Every earlier freeze record is unchanged. FREEZE-1 is 47/47, and FREEZE-2 is 14/15 with the one file declared.
9. **Performance regression?** No (§C).
10. **Risks for real athletes**, each binding before any real-athlete `restartProgram`:
    - **SEC-R2-04.** The manual-row orphan described in item 5.
    - **SEC-R2-03, an independent issue routed to the next Core mission with QRE, then SSCTR.**
      - `normalizeObservations` marks an original replaced before it refuses the correction.
      - Every dose reader then loses that session. That errs low on dose, but the session is lost to calibration.
      - The fix is in `r6-provenance.mjs`, which other freezes bind.
    - **C-F01-2 (custody).** The record must reach the restart exactly as the engine returned it. Under it: QRE-F01-02, QRE-F01-03 and R-F01-2.
    - **SEC-CORE-03.** The author of a correction is not checked (C-F01-3).
    - **The observedAt vs localDate observation** (Security).

    Not binding before real-athlete use:
    - **C-R2-2.** The window residual. A "not done" report or a disputed session older than 28 days alone does not open the bound, while an execution there does. "The period the record covers" should be defined per sport, including the fact that strength-only records bound running.
    - **SSCTR O-1 (B0-F05).** The start classes are not monotonic: after week 0, the RESTART journey runs above its EASY_LOW control in weeks 2–4.
    - **SSCTR O-2 (Product/UX).** Tell the athlete that the start was lowered to what the record shows.
    - **Carried unchanged from FREEZE-2:** C2-C2, C2-C3, C-C3/4/5, A-C1/2/3/5, D-C1/D-C2, C-INT, SEC-CORE-06/07/10/16, and Founder D1, SEC-CORE-08, G07/SEC-CORE-09, D2.
11. **What depends only on the iPhone run?** Equivalence of Node and JavaScriptCore for the relinked bundle in every step of the thirteen `core.json` journeys, J5/P16 and focal (README §2–§4, §8 and §9). **IOS_REVALIDATION_PENDING.** The Swift was not compiled, and the physical PerformanceTests are not needed.
12. **Next minimal step:**
    1. The Founder authorizes the push of `claude/v1-core-cf011-r2`.
    2. The Mac/iPhone run, README §2–§3, §8 and §9.
    3. A narrow Core mission for SEC-R2-04 and SEC-R2-03 (one shared rule in `restartIntake` and the normalizer), then C-F01-2 custody, before any real-athlete restart.

**Human queue:** SSCTR's proposed items stay proposed only, not appended (`reviews/ssctr/SSCTR_R2_R1.json`). The queue is unchanged.
